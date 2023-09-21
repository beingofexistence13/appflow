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
    exports.UtilityProcessWorkerWorkbenchService = exports.IUtilityProcessWorkerWorkbenchService = void 0;
    exports.IUtilityProcessWorkerWorkbenchService = (0, instantiation_1.createDecorator)('utilityProcessWorkerWorkbenchService');
    let UtilityProcessWorkerWorkbenchService = class UtilityProcessWorkerWorkbenchService extends lifecycle_1.Disposable {
        get utilityProcessWorkerService() {
            if (!this._utilityProcessWorkerService) {
                const channel = this.mainProcessService.getChannel(utilityProcessWorkerService_1.ipcUtilityProcessWorkerChannelName);
                this._utilityProcessWorkerService = ipc_1.ProxyChannel.toService(channel);
            }
            return this._utilityProcessWorkerService;
        }
        constructor(windowId, logService, mainProcessService) {
            super();
            this.windowId = windowId;
            this.logService = logService;
            this.mainProcessService = mainProcessService;
            this._utilityProcessWorkerService = undefined;
            this.restoredBarrier = new async_1.Barrier();
        }
        async createWorker(process) {
            this.logService.trace('Renderer->UtilityProcess#createWorker');
            // We want to avoid heavy utility process work to happen before
            // the window has restored. As such, make sure we await the
            // `Restored` phase before making a connection attempt, but also
            // add a timeout to be safe against possible deadlocks.
            await Promise.race([this.restoredBarrier.wait(), (0, async_1.timeout)(2000)]);
            // Get ready to acquire the message port from the utility process worker
            const nonce = (0, uuid_1.generateUuid)();
            const responseChannel = 'vscode:createUtilityProcessWorkerMessageChannelResult';
            const portPromise = (0, ipc_mp_2.acquirePort)(undefined /* we trigger the request via service call! */, responseChannel, nonce);
            // Actually talk with the utility process service
            // to create a new process from a worker
            const onDidTerminate = this.utilityProcessWorkerService.createWorker({
                process,
                reply: { windowId: this.windowId, channel: responseChannel, nonce }
            });
            // Dispose worker upon disposal via utility process service
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add((0, lifecycle_1.toDisposable)(() => {
                this.logService.trace('Renderer->UtilityProcess#disposeWorker', process);
                this.utilityProcessWorkerService.disposeWorker({
                    process,
                    reply: { windowId: this.windowId }
                });
            }));
            const port = await portPromise;
            const client = disposables.add(new ipc_mp_1.Client(port, `window:${this.windowId},module:${process.moduleId}`));
            this.logService.trace('Renderer->UtilityProcess#createWorkerChannel: connection established');
            onDidTerminate.then(({ reason }) => {
                if (reason?.code === 0) {
                    this.logService.trace(`[UtilityProcessWorker]: terminated normally with code ${reason.code}, signal: ${reason.signal}`);
                }
                else {
                    this.logService.error(`[UtilityProcessWorker]: terminated unexpectedly with code ${reason?.code}, signal: ${reason?.signal}`);
                }
            });
            return { client, onDidTerminate, dispose: () => disposables.dispose() };
        }
        notifyRestored() {
            if (!this.restoredBarrier.isOpen()) {
                this.restoredBarrier.open();
            }
        }
    };
    exports.UtilityProcessWorkerWorkbenchService = UtilityProcessWorkerWorkbenchService;
    exports.UtilityProcessWorkerWorkbenchService = UtilityProcessWorkerWorkbenchService = __decorate([
        __param(1, log_1.ILogService),
        __param(2, mainProcessService_1.IMainProcessService)
    ], UtilityProcessWorkerWorkbenchService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbGl0eVByb2Nlc3NXb3JrZXJXb3JrYmVuY2hTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3V0aWxpdHlQcm9jZXNzL2VsZWN0cm9uLXNhbmRib3gvdXRpbGl0eVByb2Nlc3NXb3JrZXJXb3JrYmVuY2hTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWFuRixRQUFBLHFDQUFxQyxHQUFHLElBQUEsK0JBQWUsRUFBd0Msc0NBQXNDLENBQUMsQ0FBQztJQXVEN0ksSUFBTSxvQ0FBb0MsR0FBMUMsTUFBTSxvQ0FBcUMsU0FBUSxzQkFBVTtRQUtuRSxJQUFZLDJCQUEyQjtZQUN0QyxJQUFJLENBQUMsSUFBSSxDQUFDLDRCQUE0QixFQUFFO2dCQUN2QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLGdFQUFrQyxDQUFDLENBQUM7Z0JBQ3ZGLElBQUksQ0FBQyw0QkFBNEIsR0FBRyxrQkFBWSxDQUFDLFNBQVMsQ0FBK0IsT0FBTyxDQUFDLENBQUM7YUFDbEc7WUFFRCxPQUFPLElBQUksQ0FBQyw0QkFBNEIsQ0FBQztRQUMxQyxDQUFDO1FBSUQsWUFDVSxRQUFnQixFQUNaLFVBQXdDLEVBQ2hDLGtCQUF3RDtZQUU3RSxLQUFLLEVBQUUsQ0FBQztZQUpDLGFBQVEsR0FBUixRQUFRLENBQVE7WUFDSyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ2YsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQWZ0RSxpQ0FBNEIsR0FBNkMsU0FBUyxDQUFDO1lBVTFFLG9CQUFlLEdBQUcsSUFBSSxlQUFPLEVBQUUsQ0FBQztRQVFqRCxDQUFDO1FBRUQsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFxQztZQUN2RCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyx1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