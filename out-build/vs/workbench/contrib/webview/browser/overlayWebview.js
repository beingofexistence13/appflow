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
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uuid", "vs/platform/contextkey/common/contextkey", "vs/platform/layout/browser/layoutService", "vs/workbench/contrib/webview/browser/webview"], function (require, exports, fastDomNode_1, event_1, lifecycle_1, uuid_1, contextkey_1, layoutService_1, webview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$74b = void 0;
    /**
     * Webview that is absolutely positioned over another element and that can creates and destroys an underlying webview as needed.
     */
    let $74b = class $74b extends lifecycle_1.$kc {
        constructor(initInfo, G, H, I) {
            super();
            this.G = G;
            this.H = H;
            this.I = I;
            this.a = true;
            this.b = new Set();
            this.c = this.B(new lifecycle_1.$lc());
            this.g = this.B(new lifecycle_1.$jc());
            this.h = '';
            this.m = 0;
            this.n = undefined;
            this.w = undefined;
            this.y = this.B(new lifecycle_1.$lc());
            this.D = false;
            this.J = false;
            this.L = this.B(new event_1.$fd());
            this.onDidDispose = this.L.event;
            this.N = this.B(new event_1.$fd());
            this.onDidFocus = this.N.event;
            this.O = this.B(new event_1.$fd());
            this.onDidBlur = this.O.event;
            this.P = this.B(new event_1.$fd());
            this.onDidClickLink = this.P.event;
            this.Q = this.B(new event_1.$fd());
            this.onDidReload = this.Q.event;
            this.R = this.B(new event_1.$fd());
            this.onDidScroll = this.R.event;
            this.S = this.B(new event_1.$fd());
            this.onDidUpdateState = this.S.event;
            this.U = this.B(new event_1.$fd());
            this.onMessage = this.U.event;
            this.W = this.B(new event_1.$fd());
            this.onMissingCsp = this.W.event;
            this.X = this.B(new event_1.$fd());
            this.onDidWheel = this.X.event;
            this.Y = this.B(new event_1.$fd());
            this.onFatalError = this.Y.event;
            this.providedViewType = initInfo.providedViewType;
            this.origin = initInfo.origin ?? (0, uuid_1.$4f)();
            this.j = initInfo.title;
            this.s = initInfo.extension;
            this.u = initInfo.options;
            this.t = initInfo.contentOptions;
        }
        get isFocused() {
            return !!this.c.value?.isFocused;
        }
        dispose() {
            this.J = true;
            this.F?.domNode.remove();
            this.F = undefined;
            for (const msg of this.b) {
                msg.resolve(false);
            }
            this.b.clear();
            this.L.fire();
            super.dispose();
        }
        get container() {
            if (this.J) {
                throw new Error(`OverlayWebview has been disposed`);
            }
            if (!this.F) {
                const node = document.createElement('div');
                node.style.position = 'absolute';
                node.style.overflow = 'hidden';
                this.F = new fastDomNode_1.$FP(node);
                this.F.setVisibility('hidden');
                // Webviews cannot be reparented in the dom as it will destroy their contents.
                // Mount them to a high level node to avoid this.
                this.G.container.appendChild(node);
            }
            return this.F.domNode;
        }
        claim(owner, scopedContextKeyService) {
            if (this.J) {
                return;
            }
            const oldOwner = this.w;
            this.w = owner;
            this.M();
            if (oldOwner !== owner) {
                const contextKeyService = (scopedContextKeyService || this.I);
                // Explicitly clear before creating the new context.
                // Otherwise we create the new context while the old one is still around
                this.y.clear();
                this.y.value = contextKeyService.createScoped(this.container);
                const wasFindVisible = this.z?.get();
                this.z?.reset();
                this.z = webview_1.$Ibb.bindTo(contextKeyService);
                this.z.set(!!wasFindVisible);
                this.C?.reset();
                this.C = webview_1.$Kbb.bindTo(contextKeyService);
                this.C.set(!!this.options.enableFindWidget);
                this.c.value?.setContextKeyService(this.y.value);
            }
        }
        release(owner) {
            if (this.w !== owner) {
                return;
            }
            this.y.clear();
            this.w = undefined;
            if (this.F) {
                this.F.setVisibility('hidden');
            }
            if (this.u.retainContextWhenHidden) {
                // https://github.com/microsoft/vscode/issues/157424
                // We need to record the current state when retaining context so we can try to showFind() when showing webview again
                this.D = !!this.z?.get();
                this.hideFind(false);
            }
            else {
                this.c.clear();
                this.g.clear();
            }
        }
        layoutWebviewOverElement(element, dimension, clippingContainer) {
            if (!this.F || !this.F.domNode.parentElement) {
                return;
            }
            const frameRect = element.getBoundingClientRect();
            const containerRect = this.F.domNode.parentElement.getBoundingClientRect();
            const parentBorderTop = (containerRect.height - this.F.domNode.parentElement.clientHeight) / 2.0;
            const parentBorderLeft = (containerRect.width - this.F.domNode.parentElement.clientWidth) / 2.0;
            this.F.setTop(frameRect.top - containerRect.top - parentBorderTop);
            this.F.setLeft(frameRect.left - containerRect.left - parentBorderLeft);
            this.F.setWidth(dimension ? dimension.width : frameRect.width);
            this.F.setHeight(dimension ? dimension.height : frameRect.height);
            if (clippingContainer) {
                const { top, left, right, bottom } = computeClippingRect(frameRect, clippingContainer);
                this.F.domNode.style.clipPath = `polygon(${left}px ${top}px, ${right}px ${top}px, ${right}px ${bottom}px, ${left}px ${bottom}px)`;
            }
        }
        M() {
            if (this.J) {
                throw new Error('OverlayWebview is disposed');
            }
            if (!this.c.value) {
                const webview = this.H.createWebviewElement({
                    providedViewType: this.providedViewType,
                    origin: this.origin,
                    title: this.j,
                    options: this.u,
                    contentOptions: this.t,
                    extension: this.extension,
                });
                this.c.value = webview;
                webview.state = this.n;
                if (this.y.value) {
                    this.c.value.setContextKeyService(this.y.value);
                }
                if (this.h) {
                    webview.setHtml(this.h);
                }
                if (this.u.tryRestoreScrollPosition) {
                    webview.initialScrollProgress = this.m;
                }
                this.C?.set(!!this.options.enableFindWidget);
                webview.mountTo(this.container);
                // Forward events from inner webview to outer listeners
                this.g.clear();
                this.g.add(webview.onDidFocus(() => { this.N.fire(); }));
                this.g.add(webview.onDidBlur(() => { this.O.fire(); }));
                this.g.add(webview.onDidClickLink(x => { this.P.fire(x); }));
                this.g.add(webview.onMessage(x => { this.U.fire(x); }));
                this.g.add(webview.onMissingCsp(x => { this.W.fire(x); }));
                this.g.add(webview.onDidWheel(x => { this.X.fire(x); }));
                this.g.add(webview.onDidReload(() => { this.Q.fire(); }));
                this.g.add(webview.onFatalError(x => { this.Y.fire(x); }));
                this.g.add(webview.onDidScroll(x => {
                    this.m = x.scrollYPercentage;
                    this.R.fire(x);
                }));
                this.g.add(webview.onDidUpdateState(state => {
                    this.n = state;
                    this.S.fire(state);
                }));
                if (this.a) {
                    this.b.forEach(async (msg) => {
                        msg.resolve(await webview.postMessage(msg.message, msg.transfer));
                    });
                }
                this.a = false;
                this.b.clear();
            }
            // https://github.com/microsoft/vscode/issues/157424
            if (this.options.retainContextWhenHidden && this.D) {
                this.showFind(false);
                // Reset
                this.D = false;
            }
            this.F?.setVisibility('visible');
        }
        setHtml(html) {
            this.h = html;
            this.Z(webview => webview.setHtml(html));
        }
        setTitle(title) {
            this.j = title;
            this.Z(webview => webview.setTitle(title));
        }
        get initialScrollProgress() { return this.m; }
        set initialScrollProgress(value) {
            this.m = value;
            this.Z(webview => webview.initialScrollProgress = value);
        }
        get state() { return this.n; }
        set state(value) {
            this.n = value;
            this.Z(webview => webview.state = value);
        }
        get extension() { return this.s; }
        set extension(value) {
            this.s = value;
            this.Z(webview => webview.extension = value);
        }
        get options() { return this.u; }
        set options(value) { this.u = { customClasses: this.u.customClasses, ...value }; }
        get contentOptions() { return this.t; }
        set contentOptions(value) {
            this.t = value;
            this.Z(webview => webview.contentOptions = value);
        }
        set localResourcesRoot(resources) {
            this.Z(webview => webview.localResourcesRoot = resources);
        }
        async postMessage(message, transfer) {
            if (this.c.value) {
                return this.c.value.postMessage(message, transfer);
            }
            if (this.a) {
                let resolve;
                const p = new Promise(r => resolve = r);
                this.b.add({ message, transfer, resolve: resolve });
                return p;
            }
            return false;
        }
        focus() { this.c.value?.focus(); }
        reload() { this.c.value?.reload(); }
        selectAll() { this.c.value?.selectAll(); }
        copy() { this.c.value?.copy(); }
        paste() { this.c.value?.paste(); }
        cut() { this.c.value?.cut(); }
        undo() { this.c.value?.undo(); }
        redo() { this.c.value?.redo(); }
        showFind(animated = true) {
            if (this.c.value) {
                this.c.value.showFind(animated);
                this.z?.set(true);
            }
        }
        hideFind(animated = true) {
            this.z?.reset();
            this.c.value?.hideFind(animated);
        }
        runFindAction(previous) { this.c.value?.runFindAction(previous); }
        Z(f) {
            if (this.c.value) {
                f(this.c.value);
            }
        }
        windowDidDragStart() {
            this.c.value?.windowDidDragStart();
        }
        windowDidDragEnd() {
            this.c.value?.windowDidDragEnd();
        }
        setContextKeyService(contextKeyService) {
            this.c.value?.setContextKeyService(contextKeyService);
        }
    };
    exports.$74b = $74b;
    exports.$74b = $74b = __decorate([
        __param(1, layoutService_1.$XT),
        __param(2, webview_1.$Lbb),
        __param(3, contextkey_1.$3i)
    ], $74b);
    function computeClippingRect(frameRect, clipper) {
        const rootRect = clipper.getBoundingClientRect();
        const top = Math.max(rootRect.top - frameRect.top, 0);
        const right = Math.max(frameRect.width - (frameRect.right - rootRect.right), 0);
        const bottom = Math.max(frameRect.height - (frameRect.bottom - rootRect.bottom), 0);
        const left = Math.max(rootRect.left - frameRect.left, 0);
        return { top, right, bottom, left };
    }
});
//# sourceMappingURL=overlayWebview.js.map