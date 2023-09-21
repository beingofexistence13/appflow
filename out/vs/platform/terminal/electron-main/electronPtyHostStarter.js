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
define(["require", "exports", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/environment/node/environmentService", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/utilityProcess/electron-main/utilityProcess", "vs/base/parts/ipc/electron-main/ipc.mp", "vs/base/parts/ipc/electron-main/ipcMain", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/objects", "vs/platform/configuration/common/configuration", "vs/base/common/network"], function (require, exports, environmentMainService_1, environmentService_1, lifecycleMainService_1, log_1, telemetryUtils_1, utilityProcess_1, ipc_mp_1, ipcMain_1, lifecycle_1, event_1, objects_1, configuration_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ElectronPtyHostStarter = void 0;
    let ElectronPtyHostStarter = class ElectronPtyHostStarter extends lifecycle_1.Disposable {
        constructor(_reconnectConstants, _configurationService, _environmentMainService, _lifecycleMainService, _logService) {
            super();
            this._reconnectConstants = _reconnectConstants;
            this._configurationService = _configurationService;
            this._environmentMainService = _environmentMainService;
            this._lifecycleMainService = _lifecycleMainService;
            this._logService = _logService;
            this.utilityProcess = undefined;
            this._onRequestConnection = new event_1.Emitter();
            this.onRequestConnection = this._onRequestConnection.event;
            this._onWillShutdown = new event_1.Emitter();
            this.onWillShutdown = this._onWillShutdown.event;
            this._lifecycleMainService.onWillShutdown(() => this._onWillShutdown.fire());
            // Listen for new windows to establish connection directly to pty host
            ipcMain_1.validatedIpcMain.on('vscode:createPtyHostMessageChannel', (e, nonce) => this._onWindowConnection(e, nonce));
            this._register((0, lifecycle_1.toDisposable)(() => {
                ipcMain_1.validatedIpcMain.removeHandler('vscode:createPtyHostMessageChannel');
            }));
        }
        start() {
            this.utilityProcess = new utilityProcess_1.UtilityProcess(this._logService, telemetryUtils_1.NullTelemetryService, this._lifecycleMainService);
            const inspectParams = (0, environmentService_1.parsePtyHostDebugPort)(this._environmentMainService.args, this._environmentMainService.isBuilt);
            const execArgv = inspectParams.port ? [
                '--nolazy',
                `--inspect${inspectParams.break ? '-brk' : ''}=${inspectParams.port}`
            ] : undefined;
            this.utilityProcess.start({
                type: 'ptyHost',
                entryPoint: 'vs/platform/terminal/node/ptyHostMain',
                execArgv,
                args: ['--logsPath', this._environmentMainService.logsHome.with({ scheme: network_1.Schemas.file }).fsPath],
                env: this._createPtyHostConfiguration()
            });
            const port = this.utilityProcess.connect();
            const client = new ipc_mp_1.Client(port, 'ptyHost');
            const store = new lifecycle_1.DisposableStore();
            store.add(client);
            store.add((0, lifecycle_1.toDisposable)(() => {
                this.utilityProcess?.kill();
                this.utilityProcess?.dispose();
                this.utilityProcess = undefined;
            }));
            return {
                client,
                store,
                onDidProcessExit: this.utilityProcess.onExit
            };
        }
        _createPtyHostConfiguration() {
            this._environmentMainService.unsetSnapExportedVariables();
            const config = {
                ...(0, objects_1.deepClone)(process.env),
                VSCODE_AMD_ENTRYPOINT: 'vs/platform/terminal/node/ptyHostMain',
                VSCODE_PIPE_LOGGING: 'true',
                VSCODE_VERBOSE_LOGGING: 'true',
                VSCODE_RECONNECT_GRACE_TIME: String(this._reconnectConstants.graceTime),
                VSCODE_RECONNECT_SHORT_GRACE_TIME: String(this._reconnectConstants.shortGraceTime),
                VSCODE_RECONNECT_SCROLLBACK: String(this._reconnectConstants.scrollback),
            };
            const simulatedLatency = this._configurationService.getValue("terminal.integrated.developer.ptyHost.latency" /* TerminalSettingId.DeveloperPtyHostLatency */);
            if (simulatedLatency && typeof simulatedLatency === 'number') {
                config.VSCODE_LATENCY = String(simulatedLatency);
            }
            const startupDelay = this._configurationService.getValue("terminal.integrated.developer.ptyHost.startupDelay" /* TerminalSettingId.DeveloperPtyHostStartupDelay */);
            if (startupDelay && typeof startupDelay === 'number') {
                config.VSCODE_STARTUP_DELAY = String(startupDelay);
            }
            this._environmentMainService.restoreSnapExportedVariables();
            return config;
        }
        _onWindowConnection(e, nonce) {
            this._onRequestConnection.fire();
            const port = this.utilityProcess.connect();
            // Check back if the requesting window meanwhile closed
            // Since shared process is delayed on startup there is
            // a chance that the window close before the shared process
            // was ready for a connection.
            if (e.sender.isDestroyed()) {
                port.close();
                return;
            }
            e.sender.postMessage('vscode:createPtyHostMessageChannelResult', nonce, [port]);
        }
    };
    exports.ElectronPtyHostStarter = ElectronPtyHostStarter;
    exports.ElectronPtyHostStarter = ElectronPtyHostStarter = __decorate([
        __param(1, configuration_1.IConfigurationService),
        __param(2, environmentMainService_1.IEnvironmentMainService),
        __param(3, lifecycleMainService_1.ILifecycleMainService),
        __param(4, log_1.ILogService)
    ], ElectronPtyHostStarter);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlY3Ryb25QdHlIb3N0U3RhcnRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3Rlcm1pbmFsL2VsZWN0cm9uLW1haW4vZWxlY3Ryb25QdHlIb3N0U3RhcnRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFtQnpGLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXVCLFNBQVEsc0JBQVU7UUFTckQsWUFDa0IsbUJBQXdDLEVBQ2xDLHFCQUE2RCxFQUMzRCx1QkFBaUUsRUFDbkUscUJBQTZELEVBQ3ZFLFdBQXlDO1lBRXRELEtBQUssRUFBRSxDQUFDO1lBTlMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUNqQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQzFDLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBeUI7WUFDbEQsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUN0RCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQVovQyxtQkFBYyxHQUErQixTQUFTLENBQUM7WUFFOUMseUJBQW9CLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQUNuRCx3QkFBbUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDO1lBQzlDLG9CQUFlLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQUM5QyxtQkFBYyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDO1lBV3BELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzdFLHNFQUFzRTtZQUN0RSwwQkFBZ0IsQ0FBQyxFQUFFLENBQUMsb0NBQW9DLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENB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