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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/windows/electron-main/windows", "vs/platform/utilityProcess/electron-main/utilityProcess", "vs/platform/telemetry/common/telemetry", "vs/base/common/hash", "vs/base/common/event", "vs/base/common/async", "vs/platform/lifecycle/electron-main/lifecycleMainService"], function (require, exports, lifecycle_1, instantiation_1, log_1, windows_1, utilityProcess_1, telemetry_1, hash_1, event_1, async_1, lifecycleMainService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$06b = exports.$96b = void 0;
    exports.$96b = (0, instantiation_1.$Bh)('utilityProcessWorker');
    let $06b = class $06b extends lifecycle_1.$kc {
        constructor(b, c, f, g) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.a = new Map();
        }
        async createWorker(configuration) {
            const workerLogId = `window: ${configuration.reply.windowId}, moduleId: ${configuration.process.moduleId}`;
            this.b.trace(`[UtilityProcessWorker]: createWorker(${workerLogId})`);
            // Ensure to dispose any existing process for config
            const workerId = this.h(configuration);
            if (this.a.has(workerId)) {
                this.b.warn(`[UtilityProcessWorker]: createWorker() found an existing worker that will be terminated (${workerLogId})`);
                this.disposeWorker(configuration);
            }
            // Create new worker
            const worker = new UtilityProcessWorker(this.b, this.c, this.f, this.g, configuration);
            if (!worker.spawn()) {
                return { reason: { code: 1, signal: 'EINVALID' } };
            }
            this.a.set(workerId, worker);
            const onDidTerminate = new async_1.$2g();
            event_1.Event.once(worker.onDidTerminate)(reason => {
                if (reason.code === 0) {
                    this.b.trace(`[UtilityProcessWorker]: terminated normally with code ${reason.code}, signal: ${reason.signal}`);
                }
                else {
                    this.b.error(`[UtilityProcessWorker]: terminated unexpectedly with code ${reason.code}, signal: ${reason.signal}`);
                }
                this.a.delete(workerId);
                onDidTerminate.complete({ reason });
            });
            return onDidTerminate.p;
        }
        h(configuration) {
            return (0, hash_1.$pi)({
                moduleId: configuration.process.moduleId,
                windowId: configuration.reply.windowId
            });
        }
        async disposeWorker(configuration) {
            const workerId = this.h(configuration);
            const worker = this.a.get(workerId);
            if (!worker) {
                return;
            }
            this.b.trace(`[UtilityProcessWorker]: disposeWorker(window: ${configuration.reply.windowId}, moduleId: ${configuration.process.moduleId})`);
            worker.kill();
            this.a.delete(workerId);
        }
    };
    exports.$06b = $06b;
    exports.$06b = $06b = __decorate([
        __param(0, log_1.$5i),
        __param(1, windows_1.$B5b),
        __param(2, telemetry_1.$9k),
        __param(3, lifecycleMainService_1.$p5b)
    ], $06b);
    let UtilityProcessWorker = class UtilityProcessWorker extends lifecycle_1.$kc {
        constructor(c, f, g, h, j) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.a = this.B(new event_1.$fd());
            this.onDidTerminate = this.a.event;
            this.b = new utilityProcess_1.$V5b(this.c, this.f, this.g, this.h);
            this.m();
        }
        m() {
            this.B(this.b.onExit(e => this.a.fire({ code: e.code, signal: e.signal })));
            this.B(this.b.onCrash(e => this.a.fire({ code: e.code, signal: 'ECRASH' })));
        }
        spawn() {
            const window = this.f.getWindowById(this.j.reply.windowId);
            const windowPid = window?.win?.webContents.getOSProcessId();
            return this.b.start({
                type: this.j.process.type,
                entryPoint: this.j.process.moduleId,
                parentLifecycleBound: windowPid,
                windowLifecycleBound: true,
                correlationId: `${this.j.reply.windowId}`,
                responseWindowId: this.j.reply.windowId,
                responseChannel: this.j.reply.channel,
                responseNonce: this.j.reply.nonce
            });
        }
        kill() {
            this.b.kill();
        }
    };
    UtilityProcessWorker = __decorate([
        __param(0, log_1.$5i),
        __param(1, windows_1.$B5b),
        __param(2, telemetry_1.$9k),
        __param(3, lifecycleMainService_1.$p5b)
    ], UtilityProcessWorker);
});
//# sourceMappingURL=utilityProcessWorkerMainService.js.map