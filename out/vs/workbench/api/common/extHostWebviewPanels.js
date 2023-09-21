/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/common/uuid", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostWebview", "./extHost.protocol", "./extHostTypes"], function (require, exports, event_1, lifecycle_1, uri_1, uuid_1, typeConverters, extHostWebview_1, extHostProtocol, extHostTypes) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostWebviewPanels = void 0;
    class ExtHostWebviewPanel extends lifecycle_1.Disposable {
        #handle;
        #proxy;
        #viewType;
        #webview;
        #options;
        #title;
        #iconPath;
        #viewColumn;
        #visible;
        #active;
        #isDisposed;
        #onDidDispose;
        #onDidChangeViewState;
        constructor(handle, proxy, webview, params) {
            super();
            this.#viewColumn = undefined;
            this.#visible = true;
            this.#isDisposed = false;
            this.#onDidDispose = this._register(new event_1.Emitter());
            this.onDidDispose = this.#onDidDispose.event;
            this.#onDidChangeViewState = this._register(new event_1.Emitter());
            this.onDidChangeViewState = this.#onDidChangeViewState.event;
            this.#handle = handle;
            this.#proxy = proxy;
            this.#webview = webview;
            this.#viewType = params.viewType;
            this.#options = params.panelOptions;
            this.#viewColumn = params.viewColumn;
            this.#title = params.title;
            this.#active = params.active;
        }
        dispose() {
            if (this.#isDisposed) {
                return;
            }
            this.#isDisposed = true;
            this.#onDidDispose.fire();
            this.#proxy.$disposeWebview(this.#handle);
            this.#webview.dispose();
            super.dispose();
        }
        get webview() {
            this.assertNotDisposed();
            return this.#webview;
        }
        get viewType() {
            this.assertNotDisposed();
            return this.#viewType;
        }
        get title() {
            this.assertNotDisposed();
            return this.#title;
        }
        set title(value) {
            this.assertNotDisposed();
            if (this.#title !== value) {
                this.#title = value;
                this.#proxy.$setTitle(this.#handle, value);
            }
        }
        get iconPath() {
            this.assertNotDisposed();
            return this.#iconPath;
        }
        set iconPath(value) {
            this.assertNotDisposed();
            if (this.#iconPath !== value) {
                this.#iconPath = value;
                this.#proxy.$setIconPath(this.#handle, uri_1.URI.isUri(value) ? { light: value, dark: value } : value);
            }
        }
        get options() {
            return this.#options;
        }
        get viewColumn() {
            this.assertNotDisposed();
            if (typeof this.#viewColumn === 'number' && this.#viewColumn < 0) {
                // We are using a symbolic view column
                // Return undefined instead to indicate that the real view column is currently unknown but will be resolved.
                return undefined;
            }
            return this.#viewColumn;
        }
        get active() {
            this.assertNotDisposed();
            return this.#active;
        }
        get visible() {
            this.assertNotDisposed();
            return this.#visible;
        }
        _updateViewState(newState) {
            if (this.#isDisposed) {
                return;
            }
            if (this.active !== newState.active || this.visible !== newState.visible || this.viewColumn !== newState.viewColumn) {
                this.#active = newState.active;
                this.#visible = newState.visible;
                this.#viewColumn = newState.viewColumn;
                this.#onDidChangeViewState.fire({ webviewPanel: this });
            }
        }
        reveal(viewColumn, preserveFocus) {
            this.assertNotDisposed();
            this.#proxy.$reveal(this.#handle, {
                viewColumn: typeof viewColumn === 'undefined' ? undefined : typeConverters.ViewColumn.from(viewColumn),
                preserveFocus: !!preserveFocus
            });
        }
        assertNotDisposed() {
            if (this.#isDisposed) {
                throw new Error('Webview is disposed');
            }
        }
    }
    class ExtHostWebviewPanels extends lifecycle_1.Disposable {
        static newHandle() {
            return (0, uuid_1.generateUuid)();
        }
        constructor(mainContext, webviews, workspace) {
            super();
            this.webviews = webviews;
            this.workspace = workspace;
            this._webviewPanels = new Map();
            this._serializers = new Map();
            this._proxy = mainContext.getProxy(extHostProtocol.MainContext.MainThreadWebviewPanels);
        }
        dispose() {
            super.dispose();
            this._webviewPanels.forEach(value => value.dispose());
            this._webviewPanels.clear();
        }
        createWebviewPanel(extension, viewType, title, showOptions, options = {}) {
            const viewColumn = typeof showOptions === 'object' ? showOptions.viewColumn : showOptions;
            const webviewShowOptions = {
                viewColumn: typeConverters.ViewColumn.from(viewColumn),
                preserveFocus: typeof showOptions === 'object' && !!showOptions.preserveFocus
            };
            const serializeBuffersForPostMessage = (0, extHostWebview_1.shouldSerializeBuffersForPostMessage)(extension);
            const handle = ExtHostWebviewPanels.newHandle();
            this._proxy.$createWebviewPanel((0, extHostWebview_1.toExtensionData)(extension), handle, viewType, {
                title,
                panelOptions: serializeWebviewPanelOptions(options),
                webviewOptions: (0, extHostWebview_1.serializeWebviewOptions)(extension, this.workspace, options),
                serializeBuffersForPostMessage,
            }, webviewShowOptions);
            const webview = this.webviews.createNewWebview(handle, options, extension);
            const panel = this.createNewWebviewPanel(handle, viewType, title, viewColumn, options, webview, true);
            return panel;
        }
        $onDidChangeWebviewPanelViewStates(newStates) {
            const handles = Object.keys(newStates);
            // Notify webviews of state changes in the following order:
            // - Non-visible
            // - Visible
            // - Active
            handles.sort((a, b) => {
                const stateA = newStates[a];
                const stateB = newStates[b];
                if (stateA.active) {
                    return 1;
                }
                if (stateB.active) {
                    return -1;
                }
                return (+stateA.visible) - (+stateB.visible);
            });
            for (const handle of handles) {
                const panel = this.getWebviewPanel(handle);
                if (!panel) {
                    continue;
                }
                const newState = newStates[handle];
                panel._updateViewState({
                    active: newState.active,
                    visible: newState.visible,
                    viewColumn: typeConverters.ViewColumn.to(newState.position),
                });
            }
        }
        async $onDidDisposeWebviewPanel(handle) {
            const panel = this.getWebviewPanel(handle);
            panel?.dispose();
            this._webviewPanels.delete(handle);
            this.webviews.deleteWebview(handle);
        }
        registerWebviewPanelSerializer(extension, viewType, serializer) {
            if (this._serializers.has(viewType)) {
                throw new Error(`Serializer for '${viewType}' already registered`);
            }
            this._serializers.set(viewType, { serializer, extension });
            this._proxy.$registerSerializer(viewType, {
                serializeBuffersForPostMessage: (0, extHostWebview_1.shouldSerializeBuffersForPostMessage)(extension)
            });
            return new extHostTypes.Disposable(() => {
                this._serializers.delete(viewType);
                this._proxy.$unregisterSerializer(viewType);
            });
        }
        async $deserializeWebviewPanel(webviewHandle, viewType, initData, position) {
            const entry = this._serializers.get(viewType);
            if (!entry) {
                throw new Error(`No serializer found for '${viewType}'`);
            }
            const { serializer, extension } = entry;
            const webview = this.webviews.createNewWebview(webviewHandle, initData.webviewOptions, extension);
            const revivedPanel = this.createNewWebviewPanel(webviewHandle, viewType, initData.title, position, initData.panelOptions, webview, initData.active);
            await serializer.deserializeWebviewPanel(revivedPanel, initData.state);
        }
        createNewWebviewPanel(webviewHandle, viewType, title, position, options, webview, active) {
            const panel = new ExtHostWebviewPanel(webviewHandle, this._proxy, webview, { viewType, title, viewColumn: position, panelOptions: options, active });
            this._webviewPanels.set(webviewHandle, panel);
            return panel;
        }
        getWebviewPanel(handle) {
            return this._webviewPanels.get(handle);
        }
    }
    exports.ExtHostWebviewPanels = ExtHostWebviewPanels;
    function serializeWebviewPanelOptions(options) {
        return {
            enableFindWidget: options.enableFindWidget,
            retainContextWhenHidden: options.retainContextWhenHidden,
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFdlYnZpZXdQYW5lbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0V2Vidmlld1BhbmVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFvQmhHLE1BQU0sbUJBQW9CLFNBQVEsc0JBQVU7UUFFbEMsT0FBTyxDQUFnQztRQUN2QyxNQUFNLENBQStDO1FBQ3JELFNBQVMsQ0FBUztRQUVsQixRQUFRLENBQWlCO1FBQ3pCLFFBQVEsQ0FBNkI7UUFFOUMsTUFBTSxDQUFTO1FBQ2YsU0FBUyxDQUFZO1FBQ3JCLFdBQVcsQ0FBNEM7UUFDdkQsUUFBUSxDQUFpQjtRQUN6QixPQUFPLENBQVU7UUFDakIsV0FBVyxDQUFrQjtRQUVwQixhQUFhLENBQXVDO1FBR3BELHFCQUFxQixDQUErRTtRQUc3RyxZQUNDLE1BQXFDLEVBQ3JDLEtBQW1ELEVBQ25ELE9BQXVCLEVBQ3ZCLE1BTUM7WUFFRCxLQUFLLEVBQUUsQ0FBQztZQXZCVCxnQkFBVyxHQUFrQyxTQUFTLENBQUM7WUFDdkQsYUFBUSxHQUFZLElBQUksQ0FBQztZQUV6QixnQkFBVyxHQUFZLEtBQUssQ0FBQztZQUVwQixrQkFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQzdDLGlCQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7WUFFL0MsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBZ0QsQ0FBQyxDQUFDO1lBQzdGLHlCQUFvQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUM7WUFldkUsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDcEIsSUFB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