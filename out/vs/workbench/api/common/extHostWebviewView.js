/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/api/common/extHostWebview", "vs/workbench/api/common/extHostTypeConverters", "./extHost.protocol", "./extHostTypes"], function (require, exports, event_1, lifecycle_1, extHostWebview_1, extHostTypeConverters_1, extHostProtocol, extHostTypes) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostWebviewViews = void 0;
    /* eslint-disable local/code-no-native-private */
    class ExtHostWebviewView extends lifecycle_1.Disposable {
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
            this.#onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this.#onDidChangeVisibility.event;
            this.#onDidDispose = this._register(new event_1.Emitter());
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
            this.assertNotDisposed();
            return this.#title;
        }
        set title(value) {
            this.assertNotDisposed();
            if (this.#title !== value) {
                this.#title = value;
                this.#proxy.$setWebviewViewTitle(this.#handle, value);
            }
        }
        get description() {
            this.assertNotDisposed();
            return this.#description;
        }
        set description(value) {
            this.assertNotDisposed();
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
            this.assertNotDisposed();
            return this.#badge;
        }
        set badge(badge) {
            this.assertNotDisposed();
            if (badge?.value === this.#badge?.value &&
                badge?.tooltip === this.#badge?.tooltip) {
                return;
            }
            this.#badge = extHostTypeConverters_1.ViewBadge.from(badge);
            this.#proxy.$setWebviewViewBadge(this.#handle, badge);
        }
        show(preserveFocus) {
            this.assertNotDisposed();
            this.#proxy.$show(this.#handle, !!preserveFocus);
        }
        assertNotDisposed() {
            if (this.#isDisposed) {
                throw new Error('Webview is disposed');
            }
        }
    }
    class ExtHostWebviewViews {
        constructor(mainContext, _extHostWebview) {
            this._extHostWebview = _extHostWebview;
            this._viewProviders = new Map();
            this._webviewViews = new Map();
            this._proxy = mainContext.getProxy(extHostProtocol.MainContext.MainThreadWebviewViews);
        }
        registerWebviewViewProvider(extension, viewType, provider, webviewOptions) {
            if (this._viewProviders.has(viewType)) {
                throw new Error(`View provider for '${viewType}' already registered`);
            }
            this._viewProviders.set(viewType, { provider, extension });
            this._proxy.$registerWebviewViewProvider((0, extHostWebview_1.toExtensionData)(extension), viewType, {
                retainContextWhenHidden: webviewOptions?.retainContextWhenHidden,
                serializeBuffersForPostMessage: (0, extHostWebview_1.shouldSerializeBuffersForPostMessage)(extension),
            });
            return new extHostTypes.Disposable(() => {
                this._viewProviders.delete(viewType);
                this._proxy.$unregisterWebviewViewProvider(viewType);
            });
        }
        async $resolveWebviewView(webviewHandle, viewType, title, state, cancellation) {
            const entry = this._viewProviders.get(viewType);
            if (!entry) {
                throw new Error(`No view provider found for '${viewType}'`);
            }
            const { provider, extension } = entry;
            const webview = this._extHostWebview.createNewWebview(webviewHandle, { /* todo */}, extension);
            const revivedView = new ExtHostWebviewView(webviewHandle, this._proxy, viewType, title, webview, true);
            this._webviewViews.set(webviewHandle, revivedView);
            await provider.resolveWebviewView(revivedView, { state }, cancellation);
        }
        async $onDidChangeWebviewViewVisibility(webviewHandle, visible) {
            const webviewView = this.getWebviewView(webviewHandle);
            webviewView._setVisible(visible);
        }
        async $disposeWebviewView(webviewHandle) {
            const webviewView = this.getWebviewView(webviewHandle);
            this._webviewViews.delete(webviewHandle);
            webviewView.dispose();
            this._extHostWebview.deleteWebview(webviewHandle);
        }
        getWebviewView(handle) {
            const entry = this._webviewViews.get(handle);
            if (!entry) {
                throw new Error('No webview found');
            }
            return entry;
        }
    }
    exports.ExtHostWebviewViews = ExtHostWebviewViews;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFdlYnZpZXdWaWV3LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdFdlYnZpZXdWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxpREFBaUQ7SUFFakQsTUFBTSxrQkFBbUIsU0FBUSxzQkFBVTtRQUVqQyxPQUFPLENBQWdDO1FBQ3ZDLE1BQU0sQ0FBOEM7UUFFcEQsU0FBUyxDQUFTO1FBQ2xCLFFBQVEsQ0FBaUI7UUFFbEMsV0FBVyxDQUFTO1FBQ3BCLFVBQVUsQ0FBVTtRQUNwQixNQUFNLENBQXFCO1FBQzNCLFlBQVksQ0FBcUI7UUFDakMsTUFBTSxDQUErQjtRQUVyQyxZQUNDLE1BQXFDLEVBQ3JDLEtBQWtELEVBQ2xELFFBQWdCLEVBQ2hCLEtBQXlCLEVBQ3pCLE9BQXVCLEVBQ3ZCLFNBQWtCO1lBRWxCLEtBQUssRUFBRSxDQUFDO1lBZFQsZ0JBQVcsR0FBRyxLQUFLLENBQUM7WUFxQ1gsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDdEQsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztZQUVqRSxrQkFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQzdDLGlCQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7WUF6QnZELElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1lBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcs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