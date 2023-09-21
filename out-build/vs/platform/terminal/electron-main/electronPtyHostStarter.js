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
    exports.$$6b = void 0;
    let $$6b = class $$6b extends lifecycle_1.$kc {
        constructor(f, g, h, j, m) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = undefined;
            this.b = new event_1.$fd();
            this.onRequestConnection = this.b.event;
            this.c = new event_1.$fd();
            this.onWillShutdown = this.c.event;
            this.j.onWillShutdown(() => this.c.fire());
            // Listen for new windows to establish connection directly to pty host
            ipcMain_1.$US.on('vscode:createPtyHostMessageChannel', (e, nonce) => this.r(e, nonce));
            this.B((0, lifecycle_1.$ic)(() => {
                ipcMain_1.$US.removeHandler('vscode:createPtyHostMessageChannel');
            }));
        }
        start() {
            this.a = new utilityProcess_1.$U5b(this.m, telemetryUtils_1.$bo, this.j);
            const inspectParams = (0, environmentService_1.$am)(this.h.args, this.h.isBuilt);
            const execArgv = inspectParams.port ? [
                '--nolazy',
                `--inspect${inspectParams.break ? '-brk' : ''}=${inspectParams.port}`
            ] : undefined;
            this.a.start({
                type: 'ptyHost',
                entryPoint: 'vs/platform/terminal/node/ptyHostMain',
                execArgv,
                args: ['--logsPath', this.h.logsHome.with({ scheme: network_1.Schemas.file }).fsPath],
                env: this.n()
            });
            const port = this.a.connect();
            const client = new ipc_mp_1.$3S(port, 'ptyHost');
            const store = new lifecycle_1.$jc();
            store.add(client);
            store.add((0, lifecycle_1.$ic)(() => {
                this.a?.kill();
                this.a?.dispose();
                this.a = undefined;
            }));
            return {
                client,
                store,
                onDidProcessExit: this.a.onExit
            };
        }
        n() {
            this.h.unsetSnapExportedVariables();
            const config = {
                ...(0, objects_1.$Vm)(process.env),
                VSCODE_AMD_ENTRYPOINT: 'vs/platform/terminal/node/ptyHostMain',
                VSCODE_PIPE_LOGGING: 'true',
                VSCODE_VERBOSE_LOGGING: 'true',
                VSCODE_RECONNECT_GRACE_TIME: String(this.f.graceTime),
                VSCODE_RECONNECT_SHORT_GRACE_TIME: String(this.f.shortGraceTime),
                VSCODE_RECONNECT_SCROLLBACK: String(this.f.scrollback),
            };
            const simulatedLatency = this.g.getValue("terminal.integrated.developer.ptyHost.latency" /* TerminalSettingId.DeveloperPtyHostLatency */);
            if (simulatedLatency && typeof simulatedLatency === 'number') {
                config.VSCODE_LATENCY = String(simulatedLatency);
            }
            const startupDelay = this.g.getValue("terminal.integrated.developer.ptyHost.startupDelay" /* TerminalSettingId.DeveloperPtyHostStartupDelay */);
            if (startupDelay && typeof startupDelay === 'number') {
                config.VSCODE_STARTUP_DELAY = String(startupDelay);
            }
            this.h.restoreSnapExportedVariables();
            return config;
        }
        r(e, nonce) {
            this.b.fire();
            const port = this.a.connect();
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
    exports.$$6b = $$6b;
    exports.$$6b = $$6b = __decorate([
        __param(1, configuration_1.$8h),
        __param(2, environmentMainService_1.$n5b),
        __param(3, lifecycleMainService_1.$p5b),
        __param(4, log_1.$5i)
    ], $$6b);
});
//# sourceMappingURL=electronPtyHostStarter.js.map