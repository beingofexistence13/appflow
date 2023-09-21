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
define(["require", "exports", "vs/base/common/event", "vs/base/common/async", "vs/base/common/lifecycle", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/log/common/log", "vs/base/common/performance", "vs/platform/storage/common/storage"], function (require, exports, event_1, async_1, lifecycle_1, lifecycle_2, log_1, performance_1, storage_1) {
    "use strict";
    var AbstractLifecycleService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractLifecycleService = void 0;
    let AbstractLifecycleService = class AbstractLifecycleService extends lifecycle_1.Disposable {
        static { AbstractLifecycleService_1 = this; }
        static { this.LAST_SHUTDOWN_REASON_KEY = 'lifecyle.lastShutdownReason'; }
        get startupKind() { return this._startupKind; }
        get phase() { return this._phase; }
        constructor(logService, storageService) {
            super();
            this.logService = logService;
            this.storageService = storageService;
            this._onBeforeShutdown = this._register(new event_1.Emitter());
            this.onBeforeShutdown = this._onBeforeShutdown.event;
            this._onWillShutdown = this._register(new event_1.Emitter());
            this.onWillShutdown = this._onWillShutdown.event;
            this._onDidShutdown = this._register(new event_1.Emitter());
            this.onDidShutdown = this._onDidShutdown.event;
            this._onBeforeShutdownError = this._register(new event_1.Emitter());
            this.onBeforeShutdownError = this._onBeforeShutdownError.event;
            this._onShutdownVeto = this._register(new event_1.Emitter());
            this.onShutdownVeto = this._onShutdownVeto.event;
            this._phase = 1 /* LifecyclePhase.Starting */;
            this.phaseWhen = new Map();
            // Resolve startup kind
            this._startupKind = this.resolveStartupKind();
            // Save shutdown reason to retrieve on next startup
            this.storageService.onWillSaveState(e => {
                if (e.reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                    this.storageService.store(AbstractLifecycleService_1.LAST_SHUTDOWN_REASON_KEY, this.shutdownReason, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                }
            });
        }
        resolveStartupKind() {
            // Retrieve and reset last shutdown reason
            const lastShutdownReason = this.storageService.getNumber(AbstractLifecycleService_1.LAST_SHUTDOWN_REASON_KEY, 1 /* StorageScope.WORKSPACE */);
            this.storageService.remove(AbstractLifecycleService_1.LAST_SHUTDOWN_REASON_KEY, 1 /* StorageScope.WORKSPACE */);
            // Convert into startup kind
            let startupKind;
            switch (lastShutdownReason) {
                case 3 /* ShutdownReason.RELOAD */:
                    startupKind = 3 /* StartupKind.ReloadedWindow */;
                    break;
                case 4 /* ShutdownReason.LOAD */:
                    startupKind = 4 /* StartupKind.ReopenedWindow */;
                    break;
                default:
                    startupKind = 1 /* StartupKind.NewWindow */;
            }
            this.logService.trace(`[lifecycle] starting up (startup kind: ${startupKind})`);
            return startupKind;
        }
        set phase(value) {
            if (value < this.phase) {
                throw new Error('Lifecycle cannot go backwards');
            }
            if (this._phase === value) {
                return;
            }
            this.logService.trace(`lifecycle: phase changed (value: ${value})`);
            this._phase = value;
            (0, performance_1.mark)(`code/LifecyclePhase/${(0, lifecycle_2.LifecyclePhaseToString)(value)}`);
            const barrier = this.phaseWhen.get(this._phase);
            if (barrier) {
                barrier.open();
                this.phaseWhen.delete(this._phase);
            }
        }
        async when(phase) {
            if (phase <= this._phase) {
                return;
            }
            let barrier = this.phaseWhen.get(phase);
            if (!barrier) {
                barrier = new async_1.Barrier();
                this.phaseWhen.set(phase, barrier);
            }
            await barrier.wait();
        }
    };
    exports.AbstractLifecycleService = AbstractLifecycleService;
    exports.AbstractLifecycleService = AbstractLifecycleService = AbstractLifecycleService_1 = __decorate([
        __param(0, log_1.ILogService),
        __param(1, storage_1.IStorageService)
    ], AbstractLifecycleService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9saWZlY3ljbGUvY29tbW9uL2xpZmVjeWNsZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQVV6RixJQUFlLHdCQUF3QixHQUF2QyxNQUFlLHdCQUF5QixTQUFRLHNCQUFVOztpQkFFeEMsNkJBQXdCLEdBQUcsNkJBQTZCLEFBQWhDLENBQWlDO1FBb0JqRixJQUFJLFdBQVcsS0FBa0IsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUc1RCxJQUFJLEtBQUssS0FBcUIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQU1uRCxZQUNjLFVBQTBDLEVBQ3RDLGNBQWtEO1lBRW5FLEtBQUssRUFBRSxDQUFDO1lBSHdCLGVBQVUsR0FBVixVQUFVLENBQWE7WUFDbkIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBM0JqRCxzQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUErQixDQUFDLENBQUM7WUFDekYscUJBQWdCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQztZQUV0QyxvQkFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXFCLENBQUMsQ0FBQztZQUM3RSxtQkFBYyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDO1lBRWxDLG1CQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDL0Qsa0JBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztZQUVoQywyQkFBc0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxF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