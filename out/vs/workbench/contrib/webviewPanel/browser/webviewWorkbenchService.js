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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/decorators", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/platform/editor/common/editor", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webviewPanel/browser/webviewEditor", "vs/workbench/contrib/webviewPanel/browser/webviewIconManager", "vs/workbench/services/editor/common/editorService", "./webviewEditorInput"], function (require, exports, async_1, cancellation_1, decorators_1, errors_1, event_1, iterator_1, lifecycle_1, contextkey_1, editor_1, instantiation_1, diffEditorInput_1, webview_1, webviewEditor_1, webviewIconManager_1, editorService_1, webviewEditorInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewEditorService = exports.LazilyResolvedWebviewEditorInput = exports.IWebviewWorkbenchService = void 0;
    exports.IWebviewWorkbenchService = (0, instantiation_1.createDecorator)('webviewEditorService');
    function canRevive(reviver, webview) {
        return reviver.canResolve(webview);
    }
    let LazilyResolvedWebviewEditorInput = class LazilyResolvedWebviewEditorInput extends webviewEditorInput_1.WebviewInput {
        constructor(init, webview, _webviewWorkbenchService) {
            super(init, webview, _webviewWorkbenchService.iconManager);
            this._webviewWorkbenchService = _webviewWorkbenchService;
            this._resolved = false;
        }
        dispose() {
            super.dispose();
            this._resolvePromise?.cancel();
            this._resolvePromise = undefined;
        }
        async resolve() {
            if (!this._resolved) {
                this._resolved = true;
                this._resolvePromise = (0, async_1.createCancelablePromise)(token => this._webviewWorkbenchService.resolveWebview(this, token));
                try {
                    await this._resolvePromise;
                }
                catch (e) {
                    if (!(0, errors_1.isCancellationError)(e)) {
                        throw e;
                    }
                }
            }
            return super.resolve();
        }
        transfer(other) {
            if (!super.transfer(other)) {
                return;
            }
            other._resolved = this._resolved;
            return other;
        }
    };
    exports.LazilyResolvedWebviewEditorInput = LazilyResolvedWebviewEditorInput;
    __decorate([
        decorators_1.memoize
    ], LazilyResolvedWebviewEditorInput.prototype, "resolve", null);
    exports.LazilyResolvedWebviewEditorInput = LazilyResolvedWebviewEditorInput = __decorate([
        __param(2, exports.IWebviewWorkbenchService)
    ], LazilyResolvedWebviewEditorInput);
    class RevivalPool {
        constructor() {
            this._awaitingRevival = [];
        }
        enqueueForRestoration(input, token) {
            const promise = new async_1.DeferredPromise();
            const remove = () => {
                const index = this._awaitingRevival.findIndex(entry => input === entry.input);
                if (index >= 0) {
                    this._awaitingRevival.splice(index, 1);
                }
            };
            const disposable = (0, lifecycle_1.combinedDisposable)(input.webview.onDidDispose(remove), token.onCancellationRequested(() => {
                remove();
                promise.cancel();
            }));
            this._awaitingRevival.push({ input, promise, disposable });
            return promise.p;
        }
        reviveFor(reviver, token) {
            const toRevive = this._awaitingRevival.filter(({ input }) => canRevive(reviver, input));
            this._awaitingRevival = this._awaitingRevival.filter(({ input }) => !canRevive(reviver, input));
            for (const { input, promise: resolve, disposable } of toRevive) {
                reviver.resolveWebview(input, token).then(x => resolve.complete(x), err => resolve.error(err)).finally(() => {
                    disposable.dispose();
                });
            }
        }
    }
    let WebviewEditorService = class WebviewEditorService extends lifecycle_1.Disposable {
        constructor(contextKeyService, _editorService, _instantiationService, _webviewService) {
            super();
            this._editorService = _editorService;
            this._instantiationService = _instantiationService;
            this._webviewService = _webviewService;
            this._revivers = new Set();
            this._revivalPool = new RevivalPool();
            this._onDidChangeActiveWebviewEditor = this._register(new event_1.Emitter());
            this.onDidChangeActiveWebviewEditor = this._onDidChangeActiveWebviewEditor.event;
            this._activeWebviewPanelIdContext = webviewEditor_1.CONTEXT_ACTIVE_WEBVIEW_PANEL_ID.bindTo(contextKeyService);
            this._iconManager = this._register(this._instantiationService.createInstance(webviewIconManager_1.WebviewIconManager));
            this._register(_editorService.onDidActiveEditorChange(() => {
                this.updateActiveWebview();
            }));
            // The user may have switched focus between two sides of a diff editor
            this._register(_webviewService.onDidChangeActiveWebview(() => {
                this.updateActiveWebview();
            }));
            this.updateActiveWebview();
        }
        get iconManager() {
            return this._iconManager;
        }
        updateActiveWebview() {
            const activeInput = this._editorService.activeEditor;
            let newActiveWebview;
            if (activeInput instanceof webviewEditorInput_1.WebviewInput) {
                newActiveWebview = activeInput;
            }
            else if (activeInput instanceof diffEditorInput_1.DiffEditorInput) {
                if (activeInput.primary instanceof webviewEditorInput_1.WebviewInput && activeInput.primary.webview === this._webviewService.activeWebview) {
                    newActiveWebview = activeInput.primary;
                }
                else if (activeInput.secondary instanceof webviewEditorInput_1.WebviewInput && activeInput.secondary.webview === this._webviewService.activeWebview) {
                    newActiveWebview = activeInput.secondary;
                }
            }
            if (newActiveWebview) {
                this._activeWebviewPanelIdContext.set(newActiveWebview.webview.providedViewType ?? '');
            }
            else {
                this._activeWebviewPanelIdContext.reset();
            }
            if (newActiveWebview !== this._activeWebview) {
                this._activeWebview = newActiveWebview;
                this._onDidChangeActiveWebviewEditor.fire(newActiveWebview);
            }
        }
        openWebview(webviewInitInfo, viewType, title, showOptions) {
            const webview = this._webviewService.createWebviewOverlay(webviewInitInfo);
            const webviewInput = this._instantiationService.createInstance(webviewEditorInput_1.WebviewInput, { viewType, name: title, providedId: webviewInitInfo.providedViewType }, webview, this.iconManager);
            this._editorService.openEditor(webviewInput, {
                pinned: true,
                preserveFocus: showOptions.preserveFocus,
                // preserve pre 1.38 behaviour to not make group active when preserveFocus: true
                // but make sure to restore the editor to fix https://github.com/microsoft/vscode/issues/79633
                activation: showOptions.preserveFocus ? editor_1.EditorActivation.RESTORE : undefined
            }, showOptions.group);
            return webviewInput;
        }
        revealWebview(webview, group, preserveFocus) {
            const topLevelEditor = this.findTopLevelEditorForWebview(webview);
            this._editorService.openEditor(topLevelEditor, {
                preserveFocus,
                // preserve pre 1.38 behaviour to not make group active when preserveFocus: true
                // but make sure to restore the editor to fix https://github.com/microsoft/vscode/issues/79633
                activation: preserveFocus ? editor_1.EditorActivation.RESTORE : undefined
            }, group);
        }
        findTopLevelEditorForWebview(webview) {
            for (const editor of this._editorService.editors) {
                if (editor === webview) {
                    return editor;
                }
                if (editor instanceof diffEditorInput_1.DiffEditorInput) {
                    if (webview === editor.primary || webview === editor.secondary) {
                        return editor;
                    }
                }
            }
            return webview;
        }
        openRevivedWebview(options) {
            const webview = this._webviewService.createWebviewOverlay(options.webviewInitInfo);
            webview.state = options.state;
            const webviewInput = this._instantiationService.createInstance(LazilyResolvedWebviewEditorInput, { viewType: options.viewType, providedId: options.webviewInitInfo.providedViewType, name: options.title }, webview);
            webviewInput.iconPath = options.iconPath;
            if (typeof options.group === 'number') {
                webviewInput.updateGroup(options.group);
            }
            return webviewInput;
        }
        registerResolver(reviver) {
            this._revivers.add(reviver);
            const cts = new cancellation_1.CancellationTokenSource();
            this._revivalPool.reviveFor(reviver, cts.token);
            return (0, lifecycle_1.toDisposable)(() => {
                this._revivers.delete(reviver);
                cts.dispose(true);
            });
        }
        shouldPersist(webview) {
            // Revived webviews may not have an actively registered reviver but we still want to persist them
            // since a reviver should exist when it is actually needed.
            if (webview instanceof LazilyResolvedWebviewEditorInput) {
                return true;
            }
            return iterator_1.Iterable.some(this._revivers.values(), reviver => canRevive(reviver, webview));
        }
        async tryRevive(webview, token) {
            for (const reviver of this._revivers.values()) {
                if (canRevive(reviver, webview)) {
                    await reviver.resolveWebview(webview, token);
                    return true;
                }
            }
            return false;
        }
        async resolveWebview(webview, token) {
            const didRevive = await this.tryRevive(webview, token);
            if (!didRevive && !token.isCancellationRequested) {
                // A reviver may not be registered yet. Put into pool and resolve promise when we can revive
                return this._revivalPool.enqueueForRestoration(webview, token);
            }
        }
        setIcons(id, iconPath) {
            this._iconManager.setIcons(id, iconPath);
        }
    };
    exports.WebviewEditorService = WebviewEditorService;
    exports.WebviewEditorService = WebviewEditorService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, editorService_1.IEditorService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, webview_1.IWebviewService)
    ], WebviewEditorService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlld1dvcmtiZW5jaFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWJ2aWV3UGFuZWwvYnJvd3Nlci93ZWJ2aWV3V29ya2JlbmNoU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUEyQm5GLFFBQUEsd0JBQXdCLEdBQUcsSUFBQSwrQkFBZSxFQUEyQixzQkFBc0IsQ0FBQyxDQUFDO0lBb0YxRyxTQUFTLFNBQVMsQ0FBQyxPQUF3QixFQUFFLE9BQXFCO1FBQ2pFLE9BQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRU0sSUFBTSxnQ0FBZ0MsR0FBdEMsTUFBTSxnQ0FBaUMsU0FBUSxpQ0FBWTtRQUtqRSxZQUNDLElBQTBCLEVBQzFCLE9BQXdCLEVBQ0Usd0JBQW1FO1lBRTdGLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLHdCQUF3QixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRmhCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7WUFOdEYsY0FBUyxHQUFHLEtBQUssQ0FBQztRQVMxQixDQUFDO1FBRVEsT0FBTztZQUNmLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNoQixJQUFJLENBQUMsZUFBZSxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO1FBQ2xDLENBQUM7UUFHcUIsQUFBTixLQUFLLENBQUMsT0FBTztZQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBQSwrQkFBdUIsRUFBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FB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