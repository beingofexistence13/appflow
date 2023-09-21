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
    exports.$z6b = void 0;
    let $z6b = class $z6b extends lifecycle_1.$kc {
        constructor(c, f, g, h, j, m, n, r) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.a = new async_1.$Fg();
            this.b = undefined;
            this.w = undefined;
            this.y = undefined;
            this.s();
        }
        s() {
            // Shared process channel connections from workbench windows
            ipcMain_1.$US.on(sharedProcess_1.$x6b.request, (e, nonce) => this.t(e, nonce, sharedProcess_1.$x6b.response));
            // Shared process raw connections from workbench windows
            ipcMain_1.$US.on(sharedProcess_1.$y6b.request, (e, nonce) => this.t(e, nonce, sharedProcess_1.$y6b.response));
            // Lifecycle
            this.B(this.h.onWillShutdown(() => this.u()));
        }
        async t(e, nonce, responseChannel) {
            this.j.trace(`[SharedProcess] onWindowConnection for: ${responseChannel}`);
            // release barrier if this is the first window connection
            if (!this.a.isOpen()) {
                this.a.open();
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
        u() {
            this.j.trace('[SharedProcess] onWillShutdown');
            this.b?.postMessage(sharedProcess_1.$w6b.exit);
            this.b = undefined;
        }
        whenReady() {
            if (!this.w) {
                this.w = (async () => {
                    // Wait for shared process being ready to accept connection
                    await this.z;
                    // Overall signal that the shared process was loaded and
                    // all services within have been created.
                    const whenReady = new async_1.$2g();
                    if (this.b) {
                        this.b.once(sharedProcess_1.$w6b.initDone, () => whenReady.complete());
                    }
                    else {
                        ipcMain_1.$US.once(sharedProcess_1.$w6b.initDone, () => whenReady.complete());
                    }
                    await whenReady.p;
                    this.j.trace('[SharedProcess] Overall ready');
                })();
            }
            return this.w;
        }
        get z() {
            if (!this.y) {
                this.y = (async () => {
                    // Always wait for first window asking for connection
                    await this.a.wait();
                    // Spawn shared process
                    this.C();
                    // Wait for shared process indicating that IPC connections are accepted
                    const sharedProcessIpcReady = new async_1.$2g();
                    if (this.b) {
                        this.b.once(sharedProcess_1.$w6b.ipcReady, () => sharedProcessIpcReady.complete());
                    }
                    else {
                        ipcMain_1.$US.once(sharedProcess_1.$w6b.ipcReady, () => sharedProcessIpcReady.complete());
                    }
                    await sharedProcessIpcReady.p;
                    this.j.trace('[SharedProcess] IPC ready');
                })();
            }
            return this.y;
        }
        C() {
            this.b = this.B(new utilityProcess_1.$U5b(this.j, telemetryUtils_1.$bo, this.h));
            const inspectParams = (0, environmentService_1.$bm)(this.f.args, this.f.isBuilt);
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
            this.b.start({
                type: 'shared-process',
                entryPoint: 'vs/code/node/sharedProcess/sharedProcessMain',
                payload: this.D(),
                execArgv,
                allowLoadingUnsignedLibraries: !!process.env.VSCODE_VOICE_MODULE_PATH && this.r.quality !== 'stable' // TODO@bpasero package
            });
        }
        D() {
            return {
                machineId: this.c,
                codeCachePath: this.f.codeCachePath,
                profiles: {
                    home: this.g.profilesHome,
                    all: this.g.profiles,
                },
                args: this.f.args,
                logLevel: this.m.getLogLevel(),
                loggers: this.m.getRegisteredLoggers(),
                policiesData: this.n.serialize()
            };
        }
        async connect(payload) {
            // Wait for shared process being ready to accept connection
            await this.z;
            // Connect and return message port
            const utilityProcess = (0, types_1.$uf)(this.b);
            return utilityProcess.connect(payload);
        }
    };
    exports.$z6b = $z6b;
    exports.$z6b = $z6b = __decorate([
        __param(1, environmentMainService_1.$n5b),
        __param(2, userDataProfile_1.$Ek),
        __param(3, lifecycleMainService_1.$p5b),
        __param(4, log_1.$5i),
        __param(5, loggerService_1.$u6b),
        __param(6, policy_1.$0m),
        __param(7, productService_1.$kj)
    ], $z6b);
});
//# sourceMappingURL=sharedProcess.js.map