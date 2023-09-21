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
define(["require", "exports", "vs/platform/log/common/log", "vs/base/common/lifecycle", "vs/platform/ipc/common/mainProcessService", "vs/base/parts/ipc/common/ipc.mp", "vs/platform/instantiation/common/instantiation", "vs/base/parts/ipc/common/ipc", "vs/base/common/uuid", "vs/base/parts/ipc/electron-sandbox/ipc.mp", "vs/platform/utilityProcess/common/utilityProcessWorkerService", "vs/base/common/async"], function (require, exports, log_1, lifecycle_1, mainProcessService_1, ipc_mp_1, instantiation_1, ipc_1, uuid_1, ipc_mp_2, utilityProcessWorkerService_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4$b = exports.$3$b = void 0;
    exports.$3$b = (0, instantiation_1.$Bh)('utilityProcessWorkerWorkbenchService');
    let $4$b = class $4$b extends lifecycle_1.$kc {
        get b() {
            if (!this.a) {
                const channel = this.g.getChannel(utilityProcessWorkerService_1.$86b);
                this.a = ipc_1.ProxyChannel.toService(channel);
            }
            return this.a;
        }
        constructor(windowId, f, g) {
            super();
            this.windowId = windowId;
            this.f = f;
            this.g = g;
            this.a = undefined;
            this.c = new async_1.$Fg();
        }
        async createWorker(process) {
            this.f.trace('Renderer->UtilityProcess#createWorker');
            // We want to avoid heavy utility process work to happen before
            // the window has restored. As such, make sure we await the
            // `Restored` phase before making a connection attempt, but also
            // add a timeout to be safe against possible deadlocks.
            await Promise.race([this.c.wait(), (0, async_1.$Hg)(2000)]);
            // Get ready to acquire the message port from the utility process worker
            const nonce = (0, uuid_1.$4f)();
            const responseChannel = 'vscode:createUtilityProcessWorkerMessageChannelResult';
            const portPromise = (0, ipc_mp_2.$6S)(undefined /* we trigger the request via service call! */, responseChannel, nonce);
            // Actually talk with the utility process service
            // to create a new process from a worker
            const onDidTerminate = this.b.createWorker({
                process,
                reply: { windowId: this.windowId, channel: responseChannel, nonce }
            });
            // Dispose worker upon disposal via utility process service
            const disposables = new lifecycle_1.$jc();
            disposables.add((0, lifecycle_1.$ic)(() => {
                this.f.trace('Renderer->UtilityProcess#disposeWorker', process);
                this.b.disposeWorker({
                    process,
                    reply: { windowId: this.windowId }
                });
            }));
            const port = await portPromise;
            const client = disposables.add(new ipc_mp_1.$YS(port, `window:${this.windowId},module:${process.moduleId}`));
            this.f.trace('Renderer->UtilityProcess#createWorkerChannel: connection established');
            onDidTerminate.then(({ reason }) => {
                if (reason?.code === 0) {
                    this.f.trace(`[UtilityProcessWorker]: terminated normally with code ${reason.code}, signal: ${reason.signal}`);
                }
                else {
                    this.f.error(`[UtilityProcessWorker]: terminated unexpectedly with code ${reason?.code}, signal: ${reason?.signal}`);
                }
            });
            return { client, onDidTerminate, dispose: () => disposables.dispose() };
        }
        notifyRestored() {
            if (!this.c.isOpen()) {
                this.c.open();
            }
        }
    };
    exports.$4$b = $4$b;
    exports.$4$b = $4$b = __decorate([
        __param(1, log_1.$5i),
        __param(2, mainProcessService_1.$o7b)
    ], $4$b);
});
//# sourceMappingURL=utilityProcessWorkerWorkbenchService.js.map