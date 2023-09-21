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
    exports.$jfb = exports.$ifb = exports.$hfb = void 0;
    exports.$hfb = (0, instantiation_1.$Bh)('webviewEditorService');
    function canRevive(reviver, webview) {
        return reviver.canResolve(webview);
    }
    let $ifb = class $ifb extends webviewEditorInput_1.$cfb {
        constructor(init, webview, z) {
            super(init, webview, z.iconManager);
            this.z = z;
            this.w = false;
        }
        dispose() {
            super.dispose();
            this.y?.cancel();
            this.y = undefined;
        }
        async resolve() {
            if (!this.w) {
                this.w = true;
                this.y = (0, async_1.$ug)(token => this.z.resolveWebview(this, token));
                try {
                    await this.y;
                }
                catch (e) {
                    if (!(0, errors_1.$2)(e)) {
                        throw e;
                    }
                }
            }
            return super.resolve();
        }
        u(other) {
            if (!super.u(other)) {
                return;
            }
            other.w = this.w;
            return other;
        }
    };
    exports.$ifb = $ifb;
    __decorate([
        decorators_1.$6g
    ], $ifb.prototype, "resolve", null);
    exports.$ifb = $ifb = __decorate([
        __param(2, exports.$hfb)
    ], $ifb);
    class RevivalPool {
        constructor() {
            this.a = [];
        }
        enqueueForRestoration(input, token) {
            const promise = new async_1.$2g();
            const remove = () => {
                const index = this.a.findIndex(entry => input === entry.input);
                if (index >= 0) {
                    this.a.splice(index, 1);
                }
            };
            const disposable = (0, lifecycle_1.$hc)(input.webview.onDidDispose(remove), token.onCancellationRequested(() => {
                remove();
                promise.cancel();
            }));
            this.a.push({ input, promise, disposable });
            return promise.p;
        }
        reviveFor(reviver, token) {
            const toRevive = this.a.filter(({ input }) => canRevive(reviver, input));
            this.a = this.a.filter(({ input }) => !canRevive(reviver, input));
            for (const { input, promise: resolve, disposable } of toRevive) {
                reviver.resolveWebview(input, token).then(x => resolve.complete(x), err => resolve.error(err)).finally(() => {
                    disposable.dispose();
                });
            }
        }
    }
    let $jfb = class $jfb extends lifecycle_1.$kc {
        constructor(contextKeyService, g, h, j) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.a = new Set();
            this.b = new RevivalPool();
            this.n = this.B(new event_1.$fd());
            this.onDidChangeActiveWebviewEditor = this.n.event;
            this.f = webviewEditor_1.$ffb.bindTo(contextKeyService);
            this.c = this.B(this.h.createInstance(webviewIconManager_1.$bfb));
            this.B(g.onDidActiveEditorChange(() => {
                this.r();
            }));
            // The user may have switched focus between two sides of a diff editor
            this.B(j.onDidChangeActiveWebview(() => {
                this.r();
            }));
            this.r();
        }
        get iconManager() {
            return this.c;
        }
        r() {
            const activeInput = this.g.activeEditor;
            let newActiveWebview;
            if (activeInput instanceof webviewEditorInput_1.$cfb) {
                newActiveWebview = activeInput;
            }
            else if (activeInput instanceof diffEditorInput_1.$3eb) {
                if (activeInput.primary instanceof webviewEditorInput_1.$cfb && activeInput.primary.webview === this.j.activeWebview) {
                    newActiveWebview = activeInput.primary;
                }
                else if (activeInput.secondary instanceof webviewEditorInput_1.$cfb && activeInput.secondary.webview === this.j.activeWebview) {
                    newActiveWebview = activeInput.secondary;
                }
            }
            if (newActiveWebview) {
                this.f.set(newActiveWebview.webview.providedViewType ?? '');
            }
            else {
                this.f.reset();
            }
            if (newActiveWebview !== this.m) {
                this.m = newActiveWebview;
                this.n.fire(newActiveWebview);
            }
        }
        openWebview(webviewInitInfo, viewType, title, showOptions) {
            const webview = this.j.createWebviewOverlay(webviewInitInfo);
            const webviewInput = this.h.createInstance(webviewEditorInput_1.$cfb, { viewType, name: title, providedId: webviewInitInfo.providedViewType }, webview, this.iconManager);
            this.g.openEditor(webviewInput, {
                pinned: true,
                preserveFocus: showOptions.preserveFocus,
                // preserve pre 1.38 behaviour to not make group active when preserveFocus: true
                // but make sure to restore the editor to fix https://github.com/microsoft/vscode/issues/79633
                activation: showOptions.preserveFocus ? editor_1.EditorActivation.RESTORE : undefined
            }, showOptions.group);
            return webviewInput;
        }
        revealWebview(webview, group, preserveFocus) {
            const topLevelEditor = this.s(webview);
            this.g.openEditor(topLevelEditor, {
                preserveFocus,
                // preserve pre 1.38 behaviour to not make group active when preserveFocus: true
                // but make sure to restore the editor to fix https://github.com/microsoft/vscode/issues/79633
                activation: preserveFocus ? editor_1.EditorActivation.RESTORE : undefined
            }, group);
        }
        s(webview) {
            for (const editor of this.g.editors) {
                if (editor === webview) {
                    return editor;
                }
                if (editor instanceof diffEditorInput_1.$3eb) {
                    if (webview === editor.primary || webview === editor.secondary) {
                        return editor;
                    }
                }
            }
            return webview;
        }
        openRevivedWebview(options) {
            const webview = this.j.createWebviewOverlay(options.webviewInitInfo);
            webview.state = options.state;
            const webviewInput = this.h.createInstance($ifb, { viewType: options.viewType, providedId: options.webviewInitInfo.providedViewType, name: options.title }, webview);
            webviewInput.iconPath = options.iconPath;
            if (typeof options.group === 'number') {
                webviewInput.updateGroup(options.group);
            }
            return webviewInput;
        }
        registerResolver(reviver) {
            this.a.add(reviver);
            const cts = new cancellation_1.$pd();
            this.b.reviveFor(reviver, cts.token);
            return (0, lifecycle_1.$ic)(() => {
                this.a.delete(reviver);
                cts.dispose(true);
            });
        }
        shouldPersist(webview) {
            // Revived webviews may not have an actively registered reviver but we still want to persist them
            // since a reviver should exist when it is actually needed.
            if (webview instanceof $ifb) {
                return true;
            }
            return iterator_1.Iterable.some(this.a.values(), reviver => canRevive(reviver, webview));
        }
        async t(webview, token) {
            for (const reviver of this.a.values()) {
                if (canRevive(reviver, webview)) {
                    await reviver.resolveWebview(webview, token);
                    return true;
                }
            }
            return false;
        }
        async resolveWebview(webview, token) {
            const didRevive = await this.t(webview, token);
            if (!didRevive && !token.isCancellationRequested) {
                // A reviver may not be registered yet. Put into pool and resolve promise when we can revive
                return this.b.enqueueForRestoration(webview, token);
            }
        }
        setIcons(id, iconPath) {
            this.c.setIcons(id, iconPath);
        }
    };
    exports.$jfb = $jfb;
    exports.$jfb = $jfb = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, editorService_1.$9C),
        __param(2, instantiation_1.$Ah),
        __param(3, webview_1.$Lbb)
    ], $jfb);
});
//# sourceMappingURL=webviewWorkbenchService.js.map