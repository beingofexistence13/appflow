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
define(["require", "exports", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/log/common/log", "vs/workbench/services/lifecycle/common/lifecycleService", "vs/nls", "vs/platform/instantiation/common/extensions", "vs/base/browser/dom", "vs/platform/storage/common/storage", "vs/base/common/cancellation"], function (require, exports, lifecycle_1, log_1, lifecycleService_1, nls_1, extensions_1, dom_1, storage_1, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserLifecycleService = void 0;
    let BrowserLifecycleService = class BrowserLifecycleService extends lifecycleService_1.AbstractLifecycleService {
        constructor(logService, storageService) {
            super(logService, storageService);
            this.beforeUnloadListener = undefined;
            this.unloadListener = undefined;
            this.ignoreBeforeUnload = false;
            this.didUnload = false;
            this.registerListeners();
        }
        registerListeners() {
            // Listen to `beforeUnload` to support to veto
            this.beforeUnloadListener = (0, dom_1.addDisposableListener)(window, dom_1.EventType.BEFORE_UNLOAD, (e) => this.onBeforeUnload(e));
            // Listen to `pagehide` to support orderly shutdown
            // We explicitly do not listen to `unload` event
            // which would disable certain browser caching.
            // We currently do not handle the `persisted` property
            // (https://github.com/microsoft/vscode/issues/136216)
            this.unloadListener = (0, dom_1.addDisposableListener)(window, dom_1.EventType.PAGE_HIDE, () => this.onUnload());
        }
        onBeforeUnload(event) {
            // Before unload ignored (once)
            if (this.ignoreBeforeUnload) {
                this.logService.info('[lifecycle] onBeforeUnload triggered but ignored once');
                this.ignoreBeforeUnload = false;
            }
            // Before unload with veto support
            else {
                this.logService.info('[lifecycle] onBeforeUnload triggered and handled with veto support');
                this.doShutdown(() => this.vetoBeforeUnload(event));
            }
        }
        vetoBeforeUnload(event) {
            event.preventDefault();
            event.returnValue = (0, nls_1.localize)('lifecycleVeto', "Changes that you made may not be saved. Please check press 'Cancel' and try again.");
        }
        withExpectedShutdown(reason, callback) {
            // Standard shutdown
            if (typeof reason === 'number') {
                this.shutdownReason = reason;
                // Ensure UI state is persisted
                return this.storageService.flush(storage_1.WillSaveStateReason.SHUTDOWN);
            }
            // Before unload handling ignored for duration of callback
            else {
                this.ignoreBeforeUnload = true;
                try {
                    callback?.();
                }
                finally {
                    this.ignoreBeforeUnload = false;
                }
            }
        }
        async shutdown() {
            this.logService.info('[lifecycle] shutdown triggered');
            // An explicit shutdown renders our unload
            // event handlers disabled, so dispose them.
            this.beforeUnloadListener?.dispose();
            this.unloadListener?.dispose();
            // Ensure UI state is persisted
            await this.storageService.flush(storage_1.WillSaveStateReason.SHUTDOWN);
            // Handle shutdown without veto support
            this.doShutdown();
        }
        doShutdown(vetoShutdown) {
            const logService = this.logService;
            // Optimistically trigger a UI state flush
            // without waiting for it. The browser does
            // not guarantee that this is being executed
            // but if a dialog opens, we have a chance
            // to succeed.
            this.storageService.flush(storage_1.WillSaveStateReason.SHUTDOWN);
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
            this._onBeforeShutdown.fire({
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
            return this.onUnload();
        }
        onUnload() {
            if (this.didUnload) {
                return; // only once
            }
            this.didUnload = true;
            // Register a late `pageshow` listener specifically on unload
            this._register((0, dom_1.addDisposableListener)(window, dom_1.EventType.PAGE_SHOW, (e) => this.onLoadAfterUnload(e)));
            // First indicate will-shutdown
            const logService = this.logService;
            this._onWillShutdown.fire({
                reason: 2 /* ShutdownReason.QUIT */,
                joiners: () => [],
                token: cancellation_1.CancellationToken.None,
                join(promise, joiner) {
                    logService.error(`[lifecycle] Long running operations during shutdown are unsupported in the web (id: ${joiner.id})`);
                },
                force: () => { },
            });
            // Finally end with did-shutdown
            this._onDidShutdown.fire();
        }
        onLoadAfterUnload(event) {
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
    exports.BrowserLifecycleService = BrowserLifecycleService;
    exports.BrowserLifecycleService = BrowserLifecycleService = __decorate([
        __param(0, log_1.ILogService),
        __param(1, storage_1.IStorageService)
    ], BrowserLifecycleService);
    (0, extensions_1.registerSingleton)(lifecycle_1.ILifecycleService, BrowserLifecycleService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9saWZlY3ljbGUvYnJvd3Nlci9saWZlY3ljbGVTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVl6RixJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLDJDQUF3QjtRQVNwRSxZQUNjLFVBQXVCLEVBQ25CLGNBQStCO1lBRWhELEtBQUssQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFYM0IseUJBQW9CLEdBQTRCLFNBQVMsQ0FBQztZQUMxRCxtQkFBYyxHQUE0QixTQUFTLENBQUM7WUFFcEQsdUJBQWtCLEdBQUcsS0FBSyxDQUFDO1lBRTNCLGNBQVMsR0FBRyxLQUFLLENBQUM7WUFRekIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLGlCQUFpQjtZQUV4Qiw4Q0FBOEM7WUFDOUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUEsMkJBQXFCLEVBQUMsTUFBTSxFQUFFLGVBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFvQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFckksbURBQW1EO1lBQ25ELGdEQUFnRDtZQUNoRCwrQ0FBK0M7WUFDL0Msc0RBQXNEO1lBQ3RELHNEQUFzRDtZQUN0RCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUEsMkJBQXFCLEVBQUMsTUFBTSxFQUFFLGVBQVMsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDakcsQ0FBQztRQUVPLGNBQWMsQ0FBQyxLQUF3QjtZQUU5QywrQkFBK0I7WUFDL0IsSUFBSSxJQUFJLENBQUMs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