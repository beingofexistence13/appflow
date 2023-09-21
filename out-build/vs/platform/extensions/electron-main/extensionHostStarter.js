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
    var $45b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$45b = void 0;
    let $45b = class $45b {
        static { $45b_1 = this; }
        static { this.a = 0; }
        constructor(d, f, g, h) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.b = new Map();
            this.c = false;
            // On shutdown: gracefully await extension host shutdowns
            this.f.onWillShutdown(e => {
                this.c = true;
                e.join('extHostStarter', this._waitForAllExit(6000));
            });
        }
        dispose() {
            // Intentionally not killing the extension host processes
        }
        i(id) {
            const extHostProcess = this.b.get(id);
            if (!extHostProcess) {
                throw new Error(`Unknown extension host!`);
            }
            return extHostProcess;
        }
        onDynamicStdout(id) {
            return this.i(id).onStdout;
        }
        onDynamicStderr(id) {
            return this.i(id).onStderr;
        }
        onDynamicMessage(id) {
            return this.i(id).onMessage;
        }
        onDynamicExit(id) {
            return this.i(id).onExit;
        }
        async createExtensionHost() {
            if (this.c) {
                throw (0, errors_1.$4)();
            }
            const id = String(++$45b_1.a);
            const extHost = new utilityProcess_1.$V5b(this.d, this.g, this.h, this.f);
            this.b.set(id, extHost);
            extHost.onExit(({ pid, code, signal }) => {
                this.d.info(`Extension host with pid ${pid} exited with code: ${code}, signal: ${signal}.`);
                setTimeout(() => {
                    extHost.dispose();
                    this.b.delete(id);
                });
            });
            return { id };
        }
        async start(id, opts) {
            if (this.c) {
                throw (0, errors_1.$4)();
            }
            this.i(id).start({
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
            if (this.c) {
                throw (0, errors_1.$4)();
            }
            const extHostProcess = this.b.get(id);
            if (!extHostProcess) {
                return false;
            }
            return extHostProcess.enableInspectPort();
        }
        async kill(id) {
            if (this.c) {
                throw (0, errors_1.$4)();
            }
            const extHostProcess = this.b.get(id);
            if (!extHostProcess) {
                // already gone!
                return;
            }
            extHostProcess.kill();
        }
        async _killAllNow() {
            for (const [, extHost] of this.b) {
                extHost.kill();
            }
        }
        async _waitForAllExit(maxWaitTimeMs) {
            const exitPromises = [];
            for (const [, extHost] of this.b) {
                exitPromises.push(extHost.waitForExit(maxWaitTimeMs));
            }
            return async_1.Promises.settled(exitPromises).then(() => { });
        }
    };
    exports.$45b = $45b;
    exports.$45b = $45b = $45b_1 = __decorate([
        __param(0, log_1.$5i),
        __param(1, lifecycleMainService_1.$p5b),
        __param(2, windows_1.$B5b),
        __param(3, telemetry_1.$9k)
    ], $45b);
});
//# sourceMappingURL=extensionHostStarter.js.map