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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/common/uuid", "vs/platform/configuration/common/configuration", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/workbench/api/browser/mainThreadWebviews", "vs/workbench/api/common/extHost.protocol", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webviewPanel/browser/webviewEditorInput", "vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService", "vs/workbench/services/editor/common/editorGroupColumn", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions"], function (require, exports, errors_1, event_1, lifecycle_1, uri_1, uuid_1, configuration_1, storage_1, telemetry_1, mainThreadWebviews_1, extHostProtocol, diffEditorInput_1, webview_1, webviewEditorInput_1, webviewWorkbenchService_1, editorGroupColumn_1, editorGroupsService_1, editorService_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mlb = void 0;
    /**
     * Bi-directional map between webview handles and inputs.
     */
    class WebviewInputStore {
        constructor() {
            this.a = new Map();
            this.b = new Map();
        }
        add(handle, input) {
            this.a.set(handle, input);
            this.b.set(input, handle);
        }
        getHandleForInput(input) {
            return this.b.get(input);
        }
        getInputForHandle(handle) {
            return this.a.get(handle);
        }
        delete(handle) {
            const input = this.getInputForHandle(handle);
            this.a.delete(handle);
            if (input) {
                this.b.delete(input);
            }
        }
        get size() {
            return this.a.size;
        }
        [Symbol.iterator]() {
            return this.a.values();
        }
    }
    class WebviewViewTypeTransformer {
        constructor(prefix) {
            this.prefix = prefix;
        }
        fromExternal(viewType) {
            return this.prefix + viewType;
        }
        toExternal(viewType) {
            return viewType.startsWith(this.prefix)
                ? viewType.substr(this.prefix.length)
                : undefined;
        }
    }
    let $mlb = class $mlb extends lifecycle_1.$kc {
        constructor(context, h, j, m, n, extensionService, storageService, r, s) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.a = new WebviewViewTypeTransformer('mainThreadWebview-');
            this.c = new WebviewInputStore();
            this.f = this.B(new lifecycle_1.$sc());
            this.g = new webview_1.$Obb('mainThreadWebviewPanel.origins', storageService);
            this.b = context.getProxy(extHostProtocol.$2J.ExtHostWebviewPanels);
            this.B(event_1.Event.any(n.onDidActiveEditorChange, n.onDidVisibleEditorsChange, m.onDidAddGroup, m.onDidRemoveGroup, m.onDidMoveGroup)(() => {
                this.u(this.n.activeEditor);
            }));
            this.B(s.onDidChangeActiveWebviewEditor(input => {
                this.u(input);
            }));
            // This reviver's only job is to activate extensions.
            // This should trigger the real reviver to be registered from the extension host side.
            this.B(s.registerResolver({
                canResolve: (webview) => {
                    const viewType = this.a.toExternal(webview.viewType);
                    if (typeof viewType === 'string') {
                        extensionService.activateByEvent(`onWebviewPanel:${viewType}`);
                    }
                    return false;
                },
                resolveWebview: () => { throw new Error('not implemented'); }
            }));
        }
        get webviewInputs() { return this.c; }
        addWebviewInput(handle, input, options) {
            this.c.add(handle, input);
            this.h.addWebview(handle, input.webview, options);
            input.webview.onDidDispose(() => {
                this.b.$onDidDisposeWebviewPanel(handle).finally(() => {
                    this.c.delete(handle);
                });
            });
        }
        $createWebviewPanel(extensionData, handle, viewType, initData, showOptions) {
            const targetGroup = this.t(showOptions);
            const mainThreadShowOptions = showOptions ? {
                preserveFocus: !!showOptions.preserveFocus,
                group: targetGroup
            } : {};
            const extension = (0, mainThreadWebviews_1.$bcb)(extensionData);
            const origin = this.g.getOrigin(viewType, extension.id);
            const webview = this.s.openWebview({
                origin,
                providedViewType: viewType,
                title: initData.title,
                options: reviveWebviewOptions(initData.panelOptions),
                contentOptions: (0, mainThreadWebviews_1.$ccb)(initData.webviewOptions),
                extension
            }, this.a.fromExternal(viewType), initData.title, mainThreadShowOptions);
            this.addWebviewInput(handle, webview, { serializeBuffersForPostMessage: initData.serializeBuffersForPostMessage });
            const payload = {
                extensionId: extension.id.value,
                viewType
            };
            this.r.publicLog2('webviews:createWebviewPanel', payload);
        }
        $disposeWebview(handle) {
            const webview = this.w(handle);
            if (!webview) {
                return;
            }
            webview.dispose();
        }
        $setTitle(handle, value) {
            this.w(handle)?.setName(value);
        }
        $setIconPath(handle, value) {
            const webview = this.w(handle);
            if (webview) {
                webview.iconPath = reviveWebviewIcon(value);
            }
        }
        $reveal(handle, showOptions) {
            const webview = this.w(handle);
            if (!webview || webview.isDisposed()) {
                return;
            }
            const targetGroup = this.t(showOptions);
            this.s.revealWebview(webview, targetGroup, !!showOptions.preserveFocus);
        }
        t(showOptions) {
            if (typeof showOptions.viewColumn === 'undefined'
                || showOptions.viewColumn === editorService_1.$0C
                || (this.m.count === 1 && this.m.activeGroup.isEmpty)) {
                return editorService_1.$0C;
            }
            if (showOptions.viewColumn === editorService_1.$$C) {
                return editorService_1.$$C;
            }
            if (showOptions.viewColumn >= 0) {
                // First check to see if an existing group exists
                const groupInColumn = this.m.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)[showOptions.viewColumn];
                if (groupInColumn) {
                    return groupInColumn.id;
                }
                // We are dealing with an unknown group and therefore need a new group.
                // Note that the new group's id may not match the one requested. We only allow
                // creating a single new group, so if someone passes in `showOptions.viewColumn = 99`
                // and there are two editor groups open, we simply create a third editor group instead
                // of creating all the groups up to 99.
                const newGroup = this.m.findGroup({ location: 1 /* GroupLocation.LAST */ });
                if (newGroup) {
                    const direction = (0, editorGroupsService_1.$8C)(this.j);
                    return this.m.addGroup(newGroup, direction);
                }
            }
            return editorService_1.$0C;
        }
        $registerSerializer(viewType, options) {
            if (this.f.has(viewType)) {
                throw new Error(`Reviver for ${viewType} already registered`);
            }
            this.f.set(viewType, this.s.registerResolver({
                canResolve: (webviewInput) => {
                    return webviewInput.viewType === this.a.fromExternal(viewType);
                },
                resolveWebview: async (webviewInput) => {
                    const viewType = this.a.toExternal(webviewInput.viewType);
                    if (!viewType) {
                        webviewInput.webview.setHtml(this.h.getWebviewResolvedFailedContent(webviewInput.viewType));
                        return;
                    }
                    const handle = (0, uuid_1.$4f)();
                    this.addWebviewInput(handle, webviewInput, options);
                    let state = undefined;
                    if (webviewInput.webview.state) {
                        try {
                            state = JSON.parse(webviewInput.webview.state);
                        }
                        catch (e) {
                            console.error('Could not load webview state', e, webviewInput.webview.state);
                        }
                    }
                    try {
                        await this.b.$deserializeWebviewPanel(handle, viewType, {
                            title: webviewInput.getTitle(),
                            state,
                            panelOptions: webviewInput.webview.options,
                            webviewOptions: webviewInput.webview.contentOptions,
                            active: webviewInput === this.n.activeEditor,
                        }, (0, editorGroupColumn_1.$5I)(this.m, webviewInput.group || 0));
                    }
                    catch (error) {
                        (0, errors_1.$Y)(error);
                        webviewInput.webview.setHtml(this.h.getWebviewResolvedFailedContent(viewType));
                    }
                }
            }));
        }
        $unregisterSerializer(viewType) {
            if (!this.f.has(viewType)) {
                throw new Error(`No reviver for ${viewType} registered`);
            }
            this.f.deleteAndDispose(viewType);
        }
        u(activeEditorInput) {
            if (!this.c.size) {
                return;
            }
            const viewStates = {};
            const updateViewStatesForInput = (group, topLevelInput, editorInput) => {
                if (!(editorInput instanceof webviewEditorInput_1.$cfb)) {
                    return;
                }
                editorInput.updateGroup(group.id);
                const handle = this.c.getHandleForInput(editorInput);
                if (handle) {
                    viewStates[handle] = {
                        visible: topLevelInput === group.activeEditor,
                        active: editorInput === activeEditorInput,
                        position: (0, editorGroupColumn_1.$5I)(this.m, group.id),
                    };
                }
            };
            for (const group of this.m.groups) {
                for (const input of group.editors) {
                    if (input instanceof diffEditorInput_1.$3eb) {
                        updateViewStatesForInput(group, input, input.primary);
                        updateViewStatesForInput(group, input, input.secondary);
                    }
                    else {
                        updateViewStatesForInput(group, input, input);
                    }
                }
            }
            if (Object.keys(viewStates).length) {
                this.b.$onDidChangeWebviewPanelViewStates(viewStates);
            }
        }
        w(handle) {
            return this.c.getInputForHandle(handle);
        }
    };
    exports.$mlb = $mlb;
    exports.$mlb = $mlb = __decorate([
        __param(2, configuration_1.$8h),
        __param(3, editorGroupsService_1.$5C),
        __param(4, editorService_1.$9C),
        __param(5, extensions_1.$MF),
        __param(6, storage_1.$Vo),
        __param(7, telemetry_1.$9k),
        __param(8, webviewWorkbenchService_1.$hfb)
    ], $mlb);
    function reviveWebviewIcon(value) {
        if (!value) {
            return undefined;
        }
        return {
            light: uri_1.URI.revive(value.light),
            dark: uri_1.URI.revive(value.dark),
        };
    }
    function reviveWebviewOptions(panelOptions) {
        return {
            enableFindWidget: panelOptions.enableFindWidget,
            retainContextWhenHidden: panelOptions.retainContextWhenHidden,
        };
    }
});
//# sourceMappingURL=mainThreadWebviewPanels.js.map