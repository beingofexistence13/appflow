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
define(["require", "exports", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/log/common/log", "vs/workbench/services/lifecycle/common/lifecycleService", "vs/nls!vs/workbench/services/lifecycle/browser/lifecycleService", "vs/platform/instantiation/common/extensions", "vs/base/browser/dom", "vs/platform/storage/common/storage", "vs/base/common/cancellation"], function (require, exports, lifecycle_1, log_1, lifecycleService_1, nls_1, extensions_1, dom_1, storage_1, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rU = void 0;
    let $rU = class $rU extends lifecycleService_1.$qU {
        constructor(logService, storageService) {
            super(logService, storageService);
            this.w = undefined;
            this.y = undefined;
            this.z = false;
            this.C = false;
            this.D();
        }
        D() {
            // Listen to `beforeUnload` to support to veto
            this.w = (0, dom_1.$nO)(window, dom_1.$3O.BEFORE_UNLOAD, (e) => this.F(e));
            // Listen to `pagehide` to support orderly shutdown
            // We explicitly do not listen to `unload` event
            // which would disable certain browser caching.
            // We currently do not handle the `persisted` property
            // (https://github.com/microsoft/vscode/issues/136216)
            this.y = (0, dom_1.$nO)(window, dom_1.$3O.PAGE_HIDE, () => this.I());
        }
        F(event) {
            // Before unload ignored (once)
            if (this.z) {
                this.s.info('[lifecycle] onBeforeUnload triggered but ignored once');
                this.z = false;
            }
            // Before unload with veto support
            else {
                this.s.info('[lifecycle] onBeforeUnload triggered and handled with veto support');
                this.H(() => this.G(event));
            }
        }
        G(event) {
            event.preventDefault();
            event.returnValue = (0, nls_1.localize)(0, null);
        }
        withExpectedShutdown(reason, callback) {
            // Standard shutdown
            if (typeof reason === 'number') {
                this.r = reason;
                // Ensure UI state is persisted
                return this.t.flush(storage_1.WillSaveStateReason.SHUTDOWN);
            }
            // Before unload handling ignored for duration of callback
            else {
                this.z = true;
                try {
                    callback?.();
                }
                finally {
                    this.z = false;
                }
            }
        }
        async shutdown() {
            this.s.info('[lifecycle] shutdown triggered');
            // An explicit shutdown renders our unload
            // event handlers disabled, so dispose them.
            this.w?.dispose();
            this.y?.dispose();
            // Ensure UI state is persisted
            await this.t.flush(storage_1.WillSaveStateReason.SHUTDOWN);
            // Handle shutdown without veto support
            this.H();
        }
        H(vetoShutdown) {
            const logService = this.s;
            // Optimistically trigger a UI state flush
            // without waiting for it. The browser does
            // not guarantee that this is being executed
            // but if a dialog opens, we have a chance
            // to succeed.
            this.t.flush(storage_1.WillSaveStateReason.SHUTDOWN);
            let veto = false;
            function handleVeto(vetoResult, id) {
                if (typeof vetoShutdown !== 'function') {
                    return; // veto handling disabled
                }
                if (vetoResult instanceof Promise) {
                    logService.error(`[lifecycle] Long running operations before shutdown are unsupported in the web (id: ${id})`);
                    veto = true; // implicitly vetos since we cannot handle promises in web
                }
                if (vetoResult === true) {
                    logService.info(`[lifecycle]: Unload was prevented (id: ${id})`);
                    veto = true;
                }
            }
            // Before Shutdown
            this.b.fire({
                reason: 2 /* ShutdownReason.QUIT */,
                veto(value, id) {
                    handleVeto(value, id);
                },
                finalVeto(valueFn, id) {
                    handleVeto(valueFn(), id); // in browser, trigger instantly because we do not support async anyway
                }
            });
            // Veto: handle if provided
            if (veto && typeof vetoShutdown === 'function') {
                return vetoShutdown();
            }
            // No veto, continue to shutdown
            return this.I();
        }
        I() {
            if (this.C) {
                return; // only once
            }
            this.C = true;
            // Register a late `pageshow` listener specifically on unload
            this.B((0, dom_1.$nO)(window, dom_1.$3O.PAGE_SHOW, (e) => this.J(e)));
            // First indicate will-shutdown
            const logService = this.s;
            this.c.fire({
                reason: 2 /* ShutdownReason.QUIT */,
                joiners: () => [],
                token: cancellation_1.CancellationToken.None,
                join(promise, joiner) {
                    logService.error(`[lifecycle] Long running operations during shutdown are unsupported in the web (id: ${joiner.id})`);
                },
                force: () => { },
            });
            // Finally end with did-shutdown
            this.f.fire();
        }
        J(event) {
            // We only really care about page-show events
            // where the browser indicates to us that the
            // page was restored from cache and not freshly
            // loaded.
            const wasRestoredFromCache = event.persisted;
            if (!wasRestoredFromCache) {
                return;
            }
            // At this point, we know that the page was restored from
            // cache even though it was unloaded before,
            // so in order to get back to a functional workbench, we
            // currently can only reload the window
            // Docs: https://web.dev/bfcache/#optimize-your-pages-for-bfcache
            // Refs: https://github.com/microsoft/vscode/issues/136035
            this.withExpectedShutdown({ disableShutdownHandling: true }, () => window.location.reload());
        }
    };
    exports.$rU = $rU;
    exports.$rU = $rU = __decorate([
        __param(0, log_1.$5i),
        __param(1, storage_1.$Vo)
    ], $rU);
    (0, extensions_1.$mr)(lifecycle_1.$7y, $rU, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=lifecycleService.js.map