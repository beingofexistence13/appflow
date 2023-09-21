/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/api/common/extHostWebview", "vs/workbench/api/common/extHostTypeConverters", "./extHost.protocol", "./extHostTypes"], function (require, exports, event_1, lifecycle_1, extHostWebview_1, extHostTypeConverters_1, extHostProtocol, extHostTypes) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Kcc = void 0;
    /* eslint-disable local/code-no-native-private */
    class ExtHostWebviewView extends lifecycle_1.$kc {
        #handle;
        #proxy;
        #viewType;
        #webview;
        #isDisposed;
        #isVisible;
        #title;
        #description;
        #badge;
        constructor(handle, proxy, viewType, title, webview, isVisible) {
            super();
            this.#isDisposed = false;
            this.#onDidChangeVisibility = this.B(new event_1.$fd());
            this.onDidChangeVisibility = this.#onDidChangeVisibility.event;
            this.#onDidDispose = this.B(new event_1.$fd());
            this.onDidDispose = this.#onDidDispose.event;
            this.#viewType = viewType;
            this.#title = title;
            this.#handle = handle;
            this.#proxy = proxy;
            this.#webview = webview;
            this.#isVisible = isVisible;
        }
        dispose() {
            if (this.#isDisposed) {
                return;
            }
            this.#isDisposed = true;
            this.#onDidDispose.fire();
            this.#webview.dispose();
            super.dispose();
        }
        #onDidChangeVisibility;
        #onDidDispose;
        get title() {
            this.a();
            return this.#title;
        }
        set title(value) {
            this.a();
            if (this.#title !== value) {
                this.#title = value;
                this.#proxy.$setWebviewViewTitle(this.#handle, value);
            }
        }
        get description() {
            this.a();
            return this.#description;
        }
        set description(value) {
            this.a();
            if (this.#description !== value) {
                this.#description = value;
                this.#proxy.$setWebviewViewDescription(this.#handle, value);
            }
        }
        get visible() { return this.#isVisible; }
        get webview() { return this.#webview; }
        get viewType() { return this.#viewType; }
        /* internal */ _setVisible(visible) {
            if (visible === this.#isVisible || this.#isDisposed) {
                return;
            }
            this.#isVisible = visible;
            this.#onDidChangeVisibility.fire();
        }
        get badge() {
            this.a();
            return this.#badge;
        }
        set badge(badge) {
            this.a();
            if (badge?.value === this.#badge?.value &&
                badge?.tooltip === this.#badge?.tooltip) {
                return;
            }
            this.#badge = extHostTypeConverters_1.ViewBadge.from(badge);
            this.#proxy.$setWebviewViewBadge(this.#handle, badge);
        }
        show(preserveFocus) {
            this.a();
            this.#proxy.$show(this.#handle, !!preserveFocus);
        }
        a() {
            if (this.#isDisposed) {
                throw new Error('Webview is disposed');
            }
        }
    }
    class $Kcc {
        constructor(mainContext, d) {
            this.d = d;
            this.b = new Map();
            this.c = new Map();
            this.a = mainContext.getProxy(extHostProtocol.$1J.MainThreadWebviewViews);
        }
        registerWebviewViewProvider(extension, viewType, provider, webviewOptions) {
            if (this.b.has(viewType)) {
                throw new Error(`View provider for '${viewType}' already registered`);
            }
            this.b.set(viewType, { provider, extension });
            this.a.$registerWebviewViewProvider((0, extHostWebview_1.$acc)(extension), viewType, {
                retainContextWhenHidden: webviewOptions?.retainContextWhenHidden,
                serializeBuffersForPostMessage: (0, extHostWebview_1.$$bc)(extension),
            });
            return new extHostTypes.$3J(() => {
                this.b.delete(viewType);
                this.a.$unregisterWebviewViewProvider(viewType);
            });
        }
        async $resolveWebviewView(webviewHandle, viewType, title, state, cancellation) {
            const entry = this.b.get(viewType);
            if (!entry) {
                throw new Error(`No view provider found for '${viewType}'`);
            }
            const { provider, extension } = entry;
            const webview = this.d.createNewWebview(webviewHandle, { /* todo */}, extension);
            const revivedView = new ExtHostWebviewView(webviewHandle, this.a, viewType, title, webview, true);
            this.c.set(webviewHandle, revivedView);
            await provider.resolveWebviewView(revivedView, { state }, cancellation);
        }
        async $onDidChangeWebviewViewVisibility(webviewHandle, visible) {
            const webviewView = this.e(webviewHandle);
            webviewView._setVisible(visible);
        }
        async $disposeWebviewView(webviewHandle) {
            const webviewView = this.e(webviewHandle);
            this.c.delete(webviewHandle);
            webviewView.dispose();
            this.d.deleteWebview(webviewHandle);
        }
        e(handle) {
            const entry = this.c.get(handle);
            if (!entry) {
                throw new Error('No webview found');
            }
            return entry;
        }
    }
    exports.$Kcc = $Kcc;
});
//# sourceMappingURL=extHostWebviewView.js.map