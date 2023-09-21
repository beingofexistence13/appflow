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
    exports.MainThreadWebviewPanels = void 0;
    /**
     * Bi-directional map between webview handles and inputs.
     */
    class WebviewInputStore {
        constructor() {
            this._handlesToInputs = new Map();
            this._inputsToHandles = new Map();
        }
        add(handle, input) {
            this._handlesToInputs.set(handle, input);
            this._inputsToHandles.set(input, handle);
        }
        getHandleForInput(input) {
            return this._inputsToHandles.get(input);
        }
        getInputForHandle(handle) {
            return this._handlesToInputs.get(handle);
        }
        delete(handle) {
            const input = this.getInputForHandle(handle);
            this._handlesToInputs.delete(handle);
            if (input) {
                this._inputsToHandles.delete(input);
            }
        }
        get size() {
            return this._handlesToInputs.size;
        }
        [Symbol.iterator]() {
            return this._handlesToInputs.values();
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
    let MainThreadWebviewPanels = class MainThreadWebviewPanels extends lifecycle_1.Disposable {
        constructor(context, _mainThreadWebviews, _configurationService, _editorGroupService, _editorService, extensionService, storageService, _telemetryService, _webviewWorkbenchService) {
            super();
            this._mainThreadWebviews = _mainThreadWebviews;
            this._configurationService = _configurationService;
            this._editorGroupService = _editorGroupService;
            this._editorService = _editorService;
            this._telemetryService = _telemetryService;
            this._webviewWorkbenchService = _webviewWorkbenchService;
            this.webviewPanelViewType = new WebviewViewTypeTransformer('mainThreadWebview-');
            this._webviewInputs = new WebviewInputStore();
            this._revivers = this._register(new lifecycle_1.DisposableMap());
            this.webviewOriginStore = new webview_1.ExtensionKeyedWebviewOriginStore('mainThreadWebviewPanel.origins', storageService);
            this._proxy = context.getProxy(extHostProtocol.ExtHostContext.ExtHostWebviewPanels);
            this._register(event_1.Event.any(_editorService.onDidActiveEditorChange, _editorService.onDidVisibleEditorsChange, _editorGroupService.onDidAddGroup, _editorGroupService.onDidRemoveGroup, _editorGroupService.onDidMoveGroup)(() => {
                this.updateWebviewViewStates(this._editorService.activeEditor);
            }));
            this._register(_webviewWorkbenchService.onDidChangeActiveWebviewEditor(input => {
                this.updateWebviewViewStates(input);
            }));
            // This reviver's only job is to activate extensions.
            // This should trigger the real reviver to be registered from the extension host side.
            this._register(_webviewWorkbenchService.registerResolver({
                canResolve: (webview) => {
                    const viewType = this.webviewPanelViewType.toExternal(webview.viewType);
                    if (typeof viewType === 'string') {
                        extensionService.activateByEvent(`onWebviewPanel:${viewType}`);
                    }
                    return false;
                },
                resolveWebview: () => { throw new Error('not implemented'); }
            }));
        }
        get webviewInputs() { return this._webviewInputs; }
        addWebviewInput(handle, input, options) {
            this._webviewInputs.add(handle, input);
            this._mainThreadWebviews.addWebview(handle, input.webview, options);
            input.webview.onDidDispose(() => {
                this._proxy.$onDidDisposeWebviewPanel(handle).finally(() => {
                    this._webviewInputs.delete(handle);
                });
            });
        }
        $createWebviewPanel(extensionData, handle, viewType, initData, showOptions) {
            const targetGroup = this.getTargetGroupFromShowOptions(showOptions);
            const mainThreadShowOptions = showOptions ? {
                preserveFocus: !!showOptions.preserveFocus,
                group: targetGroup
            } : {};
            const extension = (0, mainThreadWebviews_1.reviveWebviewExtension)(extensionData);
            const origin = this.webviewOriginStore.getOrigin(viewType, extension.id);
            const webview = this._webviewWorkbenchService.openWebview({
                origin,
                providedViewType: viewType,
                title: initData.title,
                options: reviveWebviewOptions(initData.panelOptions),
                contentOptions: (0, mainThreadWebviews_1.reviveWebviewContentOptions)(initData.webviewOptions),
                extension
            }, this.webviewPanelViewType.fromExternal(viewType), initData.title, mainThreadShowOptions);
            this.addWebviewInput(handle, webview, { serializeBuffersForPostMessage: initData.serializeBuffersForPostMessage });
            const payload = {
                extensionId: extension.id.value,
                viewType
            };
            this._telemetryService.publicLog2('webviews:createWebviewPanel', payload);
        }
        $disposeWebview(handle) {
            const webview = this.tryGetWebviewInput(handle);
            if (!webview) {
                return;
            }
            webview.dispose();
        }
        $setTitle(handle, value) {
            this.tryGetWebviewInput(handle)?.setName(value);
        }
        $setIconPath(handle, value) {
            const webview = this.tryGetWebviewInput(handle);
            if (webview) {
                webview.iconPath = reviveWebviewIcon(value);
            }
        }
        $reveal(handle, showOptions) {
            const webview = this.tryGetWebviewInput(handle);
            if (!webview || webview.isDisposed()) {
                return;
            }
            const targetGroup = this.getTargetGroupFromShowOptions(showOptions);
            this._webviewWorkbenchService.revealWebview(webview, targetGroup, !!showOptions.preserveFocus);
        }
        getTargetGroupFromShowOptions(showOptions) {
            if (typeof showOptions.viewColumn === 'undefined'
                || showOptions.viewColumn === editorService_1.ACTIVE_GROUP
                || (this._editorGroupService.count === 1 && this._editorGroupService.activeGroup.isEmpty)) {
                return editorService_1.ACTIVE_GROUP;
            }
            if (showOptions.viewColumn === editorService_1.SIDE_GROUP) {
                return editorService_1.SIDE_GROUP;
            }
            if (showOptions.viewColumn >= 0) {
                // First check to see if an existing group exists
                const groupInColumn = this._editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)[showOptions.viewColumn];
                if (groupInColumn) {
                    return groupInColumn.id;
                }
                // We are dealing with an unknown group and therefore need a new group.
                // Note that the new group's id may not match the one requested. We only allow
                // creating a single new group, so if someone passes in `showOptions.viewColumn = 99`
                // and there are two editor groups open, we simply create a third editor group instead
                // of creating all the groups up to 99.
                const newGroup = this._editorGroupService.findGroup({ location: 1 /* GroupLocation.LAST */ });
                if (newGroup) {
                    const direction = (0, editorGroupsService_1.preferredSideBySideGroupDirection)(this._configurationService);
                    return this._editorGroupService.addGroup(newGroup, direction);
                }
            }
            return editorService_1.ACTIVE_GROUP;
        }
        $registerSerializer(viewType, options) {
            if (this._revivers.has(viewType)) {
                throw new Error(`Reviver for ${viewType} already registered`);
            }
            this._revivers.set(viewType, this._webviewWorkbenchService.registerResolver({
                canResolve: (webviewInput) => {
                    return webviewInput.viewType === this.webviewPanelViewType.fromExternal(viewType);
                },
                resolveWebview: async (webviewInput) => {
                    const viewType = this.webviewPanelViewType.toExternal(webviewInput.viewType);
                    if (!viewType) {
                        webviewInput.webview.setHtml(this._mainThreadWebviews.getWebviewResolvedFailedContent(webviewInput.viewType));
                        return;
                    }
                    const handle = (0, uuid_1.generateUuid)();
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
                        await this._proxy.$deserializeWebviewPanel(handle, viewType, {
                            title: webviewInput.getTitle(),
                            state,
                            panelOptions: webviewInput.webview.options,
                            webviewOptions: webviewInput.webview.contentOptions,
                            active: webviewInput === this._editorService.activeEditor,
                        }, (0, editorGroupColumn_1.editorGroupToColumn)(this._editorGroupService, webviewInput.group || 0));
                    }
                    catch (error) {
                        (0, errors_1.onUnexpectedError)(error);
                        webviewInput.webview.setHtml(this._mainThreadWebviews.getWebviewResolvedFailedContent(viewType));
                    }
                }
            }));
        }
        $unregisterSerializer(viewType) {
            if (!this._revivers.has(viewType)) {
                throw new Error(`No reviver for ${viewType} registered`);
            }
            this._revivers.deleteAndDispose(viewType);
        }
        updateWebviewViewStates(activeEditorInput) {
            if (!this._webviewInputs.size) {
                return;
            }
            const viewStates = {};
            const updateViewStatesForInput = (group, topLevelInput, editorInput) => {
                if (!(editorInput instanceof webviewEditorInput_1.WebviewInput)) {
                    return;
                }
                editorInput.updateGroup(group.id);
                const handle = this._webviewInputs.getHandleForInput(editorInput);
                if (handle) {
                    viewStates[handle] = {
                        visible: topLevelInput === group.activeEditor,
                        active: editorInput === activeEditorInput,
                        position: (0, editorGroupColumn_1.editorGroupToColumn)(this._editorGroupService, group.id),
                    };
                }
            };
            for (const group of this._editorGroupService.groups) {
                for (const input of group.editors) {
                    if (input instanceof diffEditorInput_1.DiffEditorInput) {
                        updateViewStatesForInput(group, input, input.primary);
                        updateViewStatesForInput(group, input, input.secondary);
                    }
                    else {
                        updateViewStatesForInput(group, input, input);
                    }
                }
            }
            if (Object.keys(viewStates).length) {
                this._proxy.$onDidChangeWebviewPanelViewStates(viewStates);
            }
        }
        tryGetWebviewInput(handle) {
            return this._webviewInputs.getInputForHandle(handle);
        }
    };
    exports.MainThreadWebviewPanels = MainThreadWebviewPanels;
    exports.MainThreadWebviewPanels = MainThreadWebviewPanels = __decorate([
        __param(2, configuration_1.IConfigurationService),
        __param(3, editorGroupsService_1.IEditorGroupsService),
        __param(4, editorService_1.IEditorService),
        __param(5, extensions_1.IExtensionService),
        __param(6, storage_1.IStorageService),
        __param(7, telemetry_1.ITelemetryService),
        __param(8, webviewWorkbenchService_1.IWebviewWorkbenchService)
    ], MainThreadWebviewPanels);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFdlYnZpZXdQYW5lbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZFdlYnZpZXdQYW5lbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBd0JoRzs7T0FFRztJQUNILE1BQU0saUJBQWlCO1FBQXZCO1lBQ2tCLHFCQUFnQixHQUFHLElBQUksR0FBRyxFQUF3QixDQUFDO1lBQ25ELHFCQUFnQixHQUFHLElBQUksR0FBRyxFQUF3QixDQUFDO1FBOEJyRSxDQUFDO1FBNUJPLEdBQUcsQ0FBQyxNQUFjLEVBQUUsS0FBbUI7WUFDN0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUVNLGlCQUFpQixDQUFDLEtBQW1CO1lBQzNDLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBRU0saUJBQWlCLENBQUMsTUFBYztZQUN0QyxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUVNLE1BQU0sQ0FBQyxNQUFjO1lBQzNCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JDLElBQUksS0FBSyxFQUFFO2dCQUNWLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDcEM7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