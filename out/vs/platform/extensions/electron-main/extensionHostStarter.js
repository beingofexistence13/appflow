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
define(["require", "exports", "vs/base/common/errors", "vs/platform/log/common/log", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/base/common/async", "vs/platform/utilityProcess/electron-main/utilityProcess", "vs/platform/windows/electron-main/windows", "vs/platform/telemetry/common/telemetry"], function (require, exports, errors_1, log_1, lifecycleMainService_1, async_1, utilityProcess_1, windows_1, telemetry_1) {
    "use strict";
    var ExtensionHostStarter_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionHostStarter = void 0;
    let ExtensionHostStarter = class ExtensionHostStarter {
        static { ExtensionHostStarter_1 = this; }
        static { this._lastId = 0; }
        constructor(_logService, _lifecycleMainService, _windowsMainService, _telemetryService) {
            this._logService = _logService;
            this._lifecycleMainService = _lifecycleMainService;
            this._windowsMainService = _windowsMainService;
            this._telemetryService = _telemetryService;
            this._extHosts = new Map();
            this._shutdown = false;
            // On shutdown: gracefully await extension host shutdowns
            this._lifecycleMainService.onWillShutdown(e => {
                this._shutdown = true;
                e.join('extHostStarter', this._waitForAllExit(6000));
            });
        }
        dispose() {
            // Intentionally not killing the extension host processes
        }
        _getExtHost(id) {
            const extHostProcess = this._extHosts.get(id);
            if (!extHostProcess) {
                throw new Error(`Unknown extension host!`);
            }
            return extHostProcess;
        }
        onDynamicStdout(id) {
            return this._getExtHost(id).onStdout;
        }
        onDynamicStderr(id) {
            return this._getExtHost(id).onStderr;
        }
        onDynamicMessage(id) {
            return this._getExtHost(id).onMessage;
        }
        onDynamicExit(id) {
            return this._getExtHost(id).onExit;
        }
        async createExtensionHost() {
            if (this._shutdown) {
                throw (0, errors_1.canceled)();
            }
            const id = String(++ExtensionHostStarter_1._lastId);
            const extHost = new utilityProcess_1.WindowUtilityProcess(this._logService, this._windowsMainService, this._telemetryService, this._lifecycleMainService);
            this._extHosts.set(id, extHost);
            extHost.onExit(({ pid, code, signal }) => {
                this._logService.info(`Extension host with pid ${pid} exited with code: ${code}, signal: ${signal}.`);
                setTimeout(() => {
                    extHost.dispose();
                    this._extHosts.delete(id);
                });
            });
            return { id };
        }
        async start(id, opts) {
            if (this._shutdown) {
                throw (0, errors_1.canceled)();
            }
            this._getExtHost(id).start({
                ...opts,
                type: 'extensionHost',
                entryPoint: 'vs/workbench/api/node/extensionHostProcess',
                args: ['--skipWorkspaceStorageLock'],
                execArgv: opts.execArgv,
                allowLoadingUnsignedLibraries: true,
                forceAllocationsToV8Sandbox: true,
                correlationId: id
            });
        }
        async enableInspectPort(id) {
            if (this._shutdown) {
                throw (0, errors_1.canceled)();
            }
            const extHostProcess = this._extHosts.get(id);
            if (!extHostProcess) {
                return false;
            }
            return extHostProcess.enableInspectPort();
        }
        async kill(id) {
            if (this._shutdown) {
                throw (0, errors_1.canceled)();
            }
            const extHostProcess = this._extHosts.get(id);
            if (!extHostProcess) {
                // already gone!
                return;
            }
            extHostProcess.kill();
        }
        async _killAllNow() {
            for (const [, extHost] of this._extHosts) {
                extHost.kill();
            }
        }
        async _waitForAllExit(maxWaitTimeMs) {
            const exitPromises = [];
            for (const [, extHost] of this._extHosts) {
                exitPromises.push(extHost.waitForExit(maxWaitTimeMs));
            }
            return async_1.Promises.settled(exitPromises).then(() => { });
        }
    };
    exports.ExtensionHostStarter = ExtensionHostStarter;
    exports.ExtensionHostStarter = ExtensionHostStarter = ExtensionHostStarter_1 = __decorate([
        __param(0, log_1.ILogService),
        __param(1, lifecycleMainService_1.ILifecycleMainService),
        __param(2, windows_1.IWindowsMainService),
        __param(3, telemetry_1.ITelemetryService)
    ], ExtensionHostStarter);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdFN0YXJ0ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9leHRlbnNpb25zL2VsZWN0cm9uLW1haW4vZXh0ZW5zaW9uSG9zdFN0YXJ0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQWF6RixJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFvQjs7aUJBSWpCLFlBQU8sR0FBVyxDQUFDLEFBQVosQ0FBYTtRQUtuQyxZQUNjLFdBQXlDLEVBQy9CLHFCQUE2RCxFQUMvRCxtQkFBeUQsRUFDM0QsaUJBQXFEO1lBSDFDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ2QsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUM5Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1lBQzFDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFQeEQsY0FBUyxHQUFHLElBQUksR0FBRyxFQUFnQyxDQUFDO1lBQzdELGNBQVMsR0FBRyxLQUFLLENBQUM7WUFTekIseURBQXlEO1lBQ3pELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzdDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO2dCQUN0QixDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN0RCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxPQUFPO1lBQ04seURBQXlEO1FBQzFELENBQUM7UUFFTyxXQUFXLENBQUMsRUFBVTtZQUM3QixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUNwQixNQUFNLElB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