/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/parts/ipc/electron-main/ipcMain", "vs/base/common/async", "vs/base/common/lifecycle", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/policy/common/policy", "vs/platform/log/electron-main/loggerService", "vs/platform/utilityProcess/electron-main/utilityProcess", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/environment/node/environmentService", "vs/base/common/types", "vs/platform/sharedProcess/common/sharedProcess", "vs/platform/product/common/productService"], function (require, exports, ipcMain_1, async_1, lifecycle_1, environmentMainService_1, lifecycleMainService_1, log_1, userDataProfile_1, policy_1, loggerService_1, utilityProcess_1, telemetryUtils_1, environmentService_1, types_1, sharedProcess_1, productService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SharedProcess = void 0;
    let SharedProcess = class SharedProcess extends lifecycle_1.Disposable {
        constructor(machineId, environmentMainService, userDataProfilesService, lifecycleMainService, logService, loggerMainService, policyService, productService) {
            super();
            this.machineId = machineId;
            this.environmentMainService = environmentMainService;
            this.userDataProfilesService = userDataProfilesService;
            this.lifecycleMainService = lifecycleMainService;
            this.logService = logService;
            this.loggerMainService = loggerMainService;
            this.policyService = policyService;
            this.productService = productService;
            this.firstWindowConnectionBarrier = new async_1.Barrier();
            this.utilityProcess = undefined;
            this._whenReady = undefined;
            this._whenIpcReady = undefined;
            this.registerListeners();
        }
        registerListeners() {
            // Shared process channel connections from workbench windows
            ipcMain_1.validatedIpcMain.on(sharedProcess_1.SharedProcessChannelConnection.request, (e, nonce) => this.onWindowConnection(e, nonce, sharedProcess_1.SharedProcessChannelConnection.response));
            // Shared process raw connections from workbench windows
            ipcMain_1.validatedIpcMain.on(sharedProcess_1.SharedProcessRawConnection.request, (e, nonce) => this.onWindowConnection(e, nonce, sharedProcess_1.SharedProcessRawConnection.response));
            // Lifecycle
            this._register(this.lifecycleMainService.onWillShutdown(() => this.onWillShutdown()));
        }
        async onWindowConnection(e, nonce, responseChannel) {
            this.logService.trace(`[SharedProcess] onWindowConnection for: ${responseChannel}`);
            // release barrier if this is the first window connection
            if (!this.firstWindowConnectionBarrier.isOpen()) {
                this.firstWindowConnectionBarrier.open();
            }
            // await the shared process to be overall ready
            // we do not just wait for IPC ready because the
            // workbench window will communicate directly
            await this.whenReady();
            // connect to the shared process passing the responseChannel
            // as payload to give a hint what the connection is about
            const port = await this.connect(responseChannel);
            // Check back if the requesting window meanwhile closed
            // Since shared process is delayed on startup there is
            // a chance that the window close before the shared process
            // was ready for a connection.
            if (e.sender.isDestroyed()) {
                return port.close();
            }
            // send the port back to the requesting window
            e.sender.postMessage(responseChannel, nonce, [port]);
        }
        onWillShutdown() {
            this.logService.trace('[SharedProcess] onWillShutdown');
            this.utilityProcess?.postMessage(sharedProcess_1.SharedProcessLifecycle.exit);
            this.utilityProcess = undefined;
        }
        whenReady() {
            if (!this._whenReady) {
                this._whenReady = (async () => {
                    // Wait for shared process being ready to accept connection
                    await this.whenIpcReady;
                    // Overall signal that the shared process was loaded and
                    // all services within have been created.
                    const whenReady = new async_1.DeferredPromise();
                    if (this.utilityProcess) {
                        this.utilityProcess.once(sharedProcess_1.SharedProcessLifecycle.initDone, () => whenReady.complete());
                    }
                    else {
                        ipcMain_1.validatedIpcMain.once(sharedProcess_1.SharedProcessLifecycle.initDone, () => whenReady.complete());
                    }
                    await whenReady.p;
                    this.logService.trace('[SharedProcess] Overall ready');
                })();
            }
            return this._whenReady;
        }
        get whenIpcReady() {
            if (!this._whenIpcReady) {
                this._whenIpcReady = (async () => {
                    // Always wait for first window asking for connection
                    await this.firstWindowConnectionBarrier.wait();
                    // Spawn shared process
                    this.createUtilityProcess();
                    // Wait for shared process indicating that IPC connections are accepted
                    const sharedProcessIpcReady = new async_1.DeferredPromise();
                    if (this.utilityProcess) {
                        this.utilityProcess.once(sharedProcess_1.SharedProcessLifecycle.ipcReady, () => sharedProcessIpcReady.complete());
                    }
                    else {
                        ipcMain_1.validatedIpcMain.once(sharedProcess_1.SharedProcessLifecycle.ipcReady, () => sharedProcessIpcReady.complete());
                    }
                    await sharedProcessIpcReady.p;
                    this.logService.trace('[SharedProcess] IPC ready');
                })();
            }
            return this._whenIpcReady;
        }
        createUtilityProcess() {
            this.utilityProcess = this._register(new utilityProcess_1.UtilityProcess(this.logService, telemetryUtils_1.NullTelemetryService, this.lifecycleMainService));
            const inspectParams = (0, environmentService_1.parseSharedProcessDebugPort)(this.environmentMainService.args, this.environmentMainService.isBuilt);
            let execArgv = undefined;
            if (inspectParams.port) {
                execArgv = ['--nolazy'];
                if (inspectParams.break) {
                    execArgv.push(`--inspect-brk=${inspectParams.port}`);
                }
                else {
                    execArgv.push(`--inspect=${inspectParams.port}`);
                }
            }
            this.utilityProcess.start({
                type: 'shared-process',
                entryPoint: 'vs/code/node/sharedProcess/sharedProcessMain',
                payload: this.createSharedProcessConfiguration(),
                execArgv,
                allowLoadingUnsignedLibraries: !!process.env.VSCODE_VOICE_MODULE_PATH && this.productService.quality !== 'stable' // TODO@bpasero package
            });
        }
        createSharedProcessConfiguration() {
            return {
                machineId: this.machineId,
                codeCachePath: this.environmentMainService.codeCachePath,
                profiles: {
                    home: this.userDataProfilesService.profilesHome,
                    all: this.userDataProfilesService.profiles,
                },
                args: this.environmentMainService.args,
                logLevel: this.loggerMainService.getLogLevel(),
                loggers: this.loggerMainService.getRegisteredLoggers(),
                policiesData: this.policyService.serialize()
            };
        }
        async connect(payload) {
            // Wait for shared process being ready to accept connection
            await this.whenIpcReady;
            // Connect and return message port
            const utilityProcess = (0, types_1.assertIsDefined)(this.utilityProcess);
            return utilityProcess.connect(payload);
        }
    };
    exports.SharedProcess = SharedProcess;
    exports.SharedProcess = SharedProcess = __decorate([
        __param(1, environmentMainService_1.IEnvironmentMainService),
        __param(2, userDataProfile_1.IUserDataProfilesService),
        __param(3, lifecycleMainService_1.ILifecycleMainService),
        __param(4, log_1.ILogService),
        __param(5, loggerService_1.ILoggerMainService),
        __param(6, policy_1.IPolicyService),
        __param(7, productService_1.IProductService)
    ], SharedProcess);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkUHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3NoYXJlZFByb2Nlc3MvZWxlY3Ryb24tbWFpbi9zaGFyZWRQcm9jZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9CekYsSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYyxTQUFRLHNCQUFVO1FBTTVDLFlBQ2tCLFNBQWlCLEVBQ1Qsc0JBQWdFLEVBQy9ELHVCQUFrRSxFQUNyRSxvQkFBNEQsRUFDdEUsVUFBd0MsRUFDakMsaUJBQXNELEVBQzFELGFBQThDLEVBQzdDLGNBQWdEO1lBRWpFLEtBQUssRUFBRSxDQUFDO1lBVFMsY0FBUyxHQUFULFNBQVMsQ0FBUTtZQUNRLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBeUI7WUFDOUMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQUNwRCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3JELGVBQVUsR0FBVixVQUFVLENBQWE7WUFDaEIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUN6QyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDNUIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBWmpELGlDQUE0QixHQUFHLElBQUksZUFBTyxFQUFFLENBQUM7WUFFdEQsbUJBQWMsR0FBK0IsU0FBUyxDQUFDO1lBb0V2RCxlQUFVLEdBQThCLFNBQVMsQ0FBQztZQTBCbEQsa0JBQWEsR0FBOEIsU0FBUyxDQUFDO1lBaEY1RCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8saUJBQWlCO1lBRXhCLDREQUE0RDtZQUM1RCwwQkFBZ0IsQ0FBQyxFQUFFLENBQUMsOENBQThCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQWEsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGtC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