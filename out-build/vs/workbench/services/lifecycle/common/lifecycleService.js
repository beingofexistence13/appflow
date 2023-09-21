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
    var $qU_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qU = void 0;
    let $qU = class $qU extends lifecycle_1.$kc {
        static { $qU_1 = this; }
        static { this.a = 'lifecyle.lastShutdownReason'; }
        get startupKind() { return this.j; }
        get phase() { return this.m; }
        constructor(s, t) {
            super();
            this.s = s;
            this.t = t;
            this.b = this.B(new event_1.$fd());
            this.onBeforeShutdown = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onWillShutdown = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidShutdown = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onBeforeShutdownError = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onShutdownVeto = this.h.event;
            this.m = 1 /* LifecyclePhase.Starting */;
            this.n = new Map();
            // Resolve startup kind
            this.j = this.u();
            // Save shutdown reason to retrieve on next startup
            this.t.onWillSaveState(e => {
                if (e.reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                    this.t.store($qU_1.a, this.r, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                }
            });
        }
        u() {
            // Retrieve and reset last shutdown reason
            const lastShutdownReason = this.t.getNumber($qU_1.a, 1 /* StorageScope.WORKSPACE */);
            this.t.remove($qU_1.a, 1 /* StorageScope.WORKSPACE */);
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
            this.s.trace(`[lifecycle] starting up (startup kind: ${startupKind})`);
            return startupKind;
        }
        set phase(value) {
            if (value < this.phase) {
                throw new Error('Lifecycle cannot go backwards');
            }
            if (this.m === value) {
                return;
            }
            this.s.trace(`lifecycle: phase changed (value: ${value})`);
            this.m = value;
            (0, performance_1.mark)(`code/LifecyclePhase/${(0, lifecycle_2.$9y)(value)}`);
            const barrier = this.n.get(this.m);
            if (barrier) {
                barrier.open();
                this.n.delete(this.m);
            }
        }
        async when(phase) {
            if (phase <= this.m) {
                return;
            }
            let barrier = this.n.get(phase);
            if (!barrier) {
                barrier = new async_1.$Fg();
                this.n.set(phase, barrier);
            }
            await barrier.wait();
        }
    };
    exports.$qU = $qU;
    exports.$qU = $qU = $qU_1 = __decorate([
        __param(0, log_1.$5i),
        __param(1, storage_1.$Vo)
    ], $qU);
});
//# sourceMappingURL=lifecycleService.js.map