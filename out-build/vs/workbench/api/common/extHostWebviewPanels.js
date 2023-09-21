/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/common/uuid", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostWebview", "./extHost.protocol", "./extHostTypes"], function (require, exports, event_1, lifecycle_1, uri_1, uuid_1, typeConverters, extHostWebview_1, extHostProtocol, extHostTypes) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Lcc = void 0;
    class ExtHostWebviewPanel extends lifecycle_1.$kc {
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
            this.#onDidDispose = this.B(new event_1.$fd());
            this.onDidDispose = this.#onDidDispose.event;
            this.#onDidChangeViewState = this.B(new event_1.$fd());
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
            this.c();
            return this.#webview;
        }
        get viewType() {
            this.c();
            return this.#viewType;
        }
        get title() {
            this.c();
            return this.#title;
        }
        set title(value) {
            this.c();
            if (this.#title !== value) {
                this.#title = value;
                this.#proxy.$setTitle(this.#handle, value);
            }
        }
        get iconPath() {
            this.c();
            return this.#iconPath;
        }
        set iconPath(value) {
            this.c();
            if (this.#iconPath !== value) {
                this.#iconPath = value;
                this.#proxy.$setIconPath(this.#handle, uri_1.URI.isUri(value) ? { light: value, dark: value } : value);
            }
        }
        get options() {
            return this.#options;
        }
        get viewColumn() {
            this.c();
            if (typeof this.#viewColumn === 'number' && this.#viewColumn < 0) {
                // We are using a symbolic view column
                // Return undefined instead to indicate that the real view column is currently unknown but will be resolved.
                return undefined;
            }
            return this.#viewColumn;
        }
        get active() {
            this.c();
            return this.#active;
        }
        get visible() {
            this.c();
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
            this.c();
            this.#proxy.$reveal(this.#handle, {
                viewColumn: typeof viewColumn === 'undefined' ? undefined : typeConverters.ViewColumn.from(viewColumn),
                preserveFocus: !!preserveFocus
            });
        }
        c() {
            if (this.#isDisposed) {
                throw new Error('Webview is disposed');
            }
        }
    }
    class $Lcc extends lifecycle_1.$kc {
        static c() {
            return (0, uuid_1.$4f)();
        }
        constructor(mainContext, j, m) {
            super();
            this.j = j;
            this.m = m;
            this.g = new Map();
            this.h = new Map();
            this.f = mainContext.getProxy(extHostProtocol.$1J.MainThreadWebviewPanels);
        }
        dispose() {
            super.dispose();
            this.g.forEach(value => value.dispose());
            this.g.clear();
        }
        createWebviewPanel(extension, viewType, title, showOptions, options = {}) {
            const viewColumn = typeof showOptions === 'object' ? showOptions.viewColumn : showOptions;
            const webviewShowOptions = {
                viewColumn: typeConverters.ViewColumn.from(viewColumn),
                preserveFocus: typeof showOptions === 'object' && !!showOptions.preserveFocus
            };
            const serializeBuffersForPostMessage = (0, extHostWebview_1.$$bc)(extension);
            const handle = $Lcc.c();
            this.f.$createWebviewPanel((0, extHostWebview_1.$acc)(extension), handle, viewType, {
                title,
                panelOptions: serializeWebviewPanelOptions(options),
                webviewOptions: (0, extHostWebview_1.$bcc)(extension, this.m, options),
                serializeBuffersForPostMessage,
            }, webviewShowOptions);
            const webview = this.j.createNewWebview(handle, options, extension);
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
            this.g.delete(handle);
            this.j.deleteWebview(handle);
        }
        registerWebviewPanelSerializer(extension, viewType, serializer) {
            if (this.h.has(viewType)) {
                throw new Error(`Serializer for '${viewType}' already registered`);
            }
            this.h.set(viewType, { serializer, extension });
            this.f.$registerSerializer(viewType, {
                serializeBuffersForPostMessage: (0, extHostWebview_1.$$bc)(extension)
            });
            return new extHostTypes.$3J(() => {
                this.h.delete(viewType);
                this.f.$unregisterSerializer(viewType);
            });
        }
        async $deserializeWebviewPanel(webviewHandle, viewType, initData, position) {
            const entry = this.h.get(viewType);
            if (!entry) {
                throw new Error(`No serializer found for '${viewType}'`);
            }
            const { serializer, extension } = entry;
            const webview = this.j.createNewWebview(webviewHandle, initData.webviewOptions, extension);
            const revivedPanel = this.createNewWebviewPanel(webviewHandle, viewType, initData.title, position, initData.panelOptions, webview, initData.active);
            await serializer.deserializeWebviewPanel(revivedPanel, initData.state);
        }
        createNewWebviewPanel(webviewHandle, viewType, title, position, options, webview, active) {
            const panel = new ExtHostWebviewPanel(webviewHandle, this.f, webview, { viewType, title, viewColumn: position, panelOptions: options, active });
            this.g.set(webviewHandle, panel);
            return panel;
        }
        getWebviewPanel(handle) {
            return this.g.get(handle);
        }
    }
    exports.$Lcc = $Lcc;
    function serializeWebviewPanelOptions(options) {
        return {
            enableFindWidget: options.enableFindWidget,
            retainContextWhenHidden: options.retainContextWhenHidden,
        };
    }
});
//# sourceMappingURL=extHostWebviewPanels.js.map