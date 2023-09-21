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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/common/editor", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/services/editor/common/editorGroupColumn", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/customEditor/browser/customEditorInput", "vs/base/common/uri", "vs/workbench/contrib/webviewPanel/browser/webviewEditorInput", "vs/workbench/contrib/terminal/browser/terminalEditorInput", "vs/platform/configuration/common/configuration", "vs/workbench/common/editor/sideBySideEditorInput", "vs/base/common/resources", "vs/workbench/common/editor/editorGroupModel", "vs/workbench/contrib/interactive/browser/interactiveEditorInput", "vs/workbench/contrib/mergeEditor/browser/mergeEditorInput", "vs/platform/log/common/log"], function (require, exports, lifecycle_1, extHost_protocol_1, extHostCustomers_1, editor_1, diffEditorInput_1, editorGroupColumn_1, editorGroupsService_1, editorService_1, textResourceEditorInput_1, notebookEditorInput_1, customEditorInput_1, uri_1, webviewEditorInput_1, terminalEditorInput_1, configuration_1, sideBySideEditorInput_1, resources_1, editorGroupModel_1, interactiveEditorInput_1, mergeEditorInput_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadEditorTabs = void 0;
    let MainThreadEditorTabs = class MainThreadEditorTabs {
        constructor(extHostContext, _editorGroupsService, _configurationService, _logService, editorService) {
            this._editorGroupsService = _editorGroupsService;
            this._configurationService = _configurationService;
            this._logService = _logService;
            this._dispoables = new lifecycle_1.DisposableStore();
            // List of all groups and their corresponding tabs, this is **the** model
            this._tabGroupModel = [];
            // Lookup table for finding group by id
            this._groupLookup = new Map();
            // Lookup table for finding tab by id
            this._tabInfoLookup = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostEditorTabs);
            // Main listener which responds to events from the editor service
            this._dispoables.add(editorService.onDidEditorsChange((event) => {
                try {
                    this._updateTabsModel(event);
                }
                catch {
                    this._logService.error('Failed to update model, rebuilding');
                    this._createTabsModel();
                }
            }));
            // Structural group changes (add, remove, move, etc) are difficult to patch.
            // Since they happen infrequently we just rebuild the entire model
            this._dispoables.add(this._editorGroupsService.onDidAddGroup(() => this._createTabsModel()));
            this._dispoables.add(this._editorGroupsService.onDidRemoveGroup(() => this._createTabsModel()));
            // Once everything is read go ahead and initialize the model
            this._editorGroupsService.whenReady.then(() => this._createTabsModel());
        }
        dispose() {
            this._groupLookup.clear();
            this._tabInfoLookup.clear();
            this._dispoables.dispose();
        }
        /**
         * Creates a tab object with the correct properties
         * @param editor The editor input represented by the tab
         * @param group The group the tab is in
         * @returns A tab object
         */
        _buildTabObject(group, editor, editorIndex) {
            const editorId = editor.editorId;
            const tab = {
                id: this._generateTabId(editor, group.id),
                label: editor.getName(),
                editorId,
                input: this._editorInputToDto(editor),
                isPinned: group.isSticky(editorIndex),
                isPreview: !group.isPinned(editorIndex),
                isActive: group.isActive(editor),
                isDirty: editor.isDirty()
            };
            return tab;
        }
        _editorInputToDto(editor) {
            if (editor instanceof mergeEditorInput_1.MergeEditorInput) {
                return {
                    kind: 3 /* TabInputKind.TextMergeInput */,
                    base: editor.base,
                    input1: editor.input1.uri,
                    input2: editor.input2.uri,
                    result: editor.resource
                };
            }
            if (editor instanceof textResourceEditorInput_1.AbstractTextResourceEditorInput) {
                return {
                    kind: 1 /* TabInputKind.TextInput */,
                    uri: editor.resource
                };
            }
            if (editor instanceof sideBySideEditorInput_1.SideBySideEditorInput && !(editor instanceof diffEditorInput_1.DiffEditorInput)) {
                const primaryResource = editor.primary.resource;
                const secondaryResource = editor.secondary.resource;
                // If side by side editor with same resource on both sides treat it as a singular tab kind
                if (editor.primary instanceof textResourceEditorInput_1.AbstractTextResourceEditorInput
                    && editor.secondary instanceof textResourceEditorInput_1.AbstractTextResourceEditorInput
                    && (0, resources_1.isEqual)(primaryResource, secondaryResource)
                    && primaryResource
                    && secondaryResource) {
                    return {
                        kind: 1 /* TabInputKind.TextInput */,
                        uri: primaryResource
                    };
                }
                return { kind: 0 /* TabInputKind.UnknownInput */ };
            }
            if (editor instanceof notebookEditorInput_1.NotebookEditorInput) {
                return {
                    kind: 4 /* TabInputKind.NotebookInput */,
                    notebookType: editor.viewType,
                    uri: editor.resource
                };
            }
            if (editor instanceof customEditorInput_1.CustomEditorInput) {
                return {
                    kind: 6 /* TabInputKind.CustomEditorInput */,
                    viewType: editor.viewType,
                    uri: editor.resource,
                };
            }
            if (editor instanceof webviewEditorInput_1.WebviewInput) {
                return {
                    kind: 7 /* TabInputKind.WebviewEditorInput */,
                    viewType: editor.viewType
                };
            }
            if (editor instanceof terminalEditorInput_1.TerminalEditorInput) {
                return {
                    kind: 8 /* TabInputKind.TerminalEditorInput */
                };
            }
            if (editor instanceof diffEditorInput_1.DiffEditorInput) {
                if (editor.modified instanceof textResourceEditorInput_1.AbstractTextResourceEditorInput && editor.original instanceof textResourceEditorInput_1.AbstractTextResourceEditorInput) {
                    return {
                        kind: 2 /* TabInputKind.TextDiffInput */,
                        modified: editor.modified.resource,
                        original: editor.original.resource
                    };
                }
                if (editor.modified instanceof notebookEditorInput_1.NotebookEditorInput && editor.original instanceof notebookEditorInput_1.NotebookEditorInput) {
                    return {
                        kind: 5 /* TabInputKind.NotebookDiffInput */,
                        notebookType: editor.original.viewType,
                        modified: editor.modified.resource,
                        original: editor.original.resource
                    };
                }
            }
            if (editor instanceof interactiveEditorInput_1.InteractiveEditorInput) {
                return {
                    kind: 9 /* TabInputKind.InteractiveEditorInput */,
                    uri: editor.resource,
                    inputBoxUri: editor.inputResource
                };
            }
            return { kind: 0 /* TabInputKind.UnknownInput */ };
        }
        /**
         * Generates a unique id for a tab
         * @param editor The editor input
         * @param groupId The group id
         * @returns A unique identifier for a specific tab
         */
        _generateTabId(editor, groupId) {
            let resourceString;
            // Properly get the resource and account for side by side editors
            const resource = editor_1.EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.BOTH });
            if (resource instanceof uri_1.URI) {
                resourceString = resource.toString();
            }
            else {
                resourceString = `${resource?.primary?.toString()}-${resource?.secondary?.toString()}`;
            }
            return `${groupId}~${editor.editorId}-${editor.typeId}-${resourceString} `;
        }
        /**
         * Called whenever a group activates, updates the model by marking the group as active an notifies the extension host
         */
        _onDidGroupActivate() {
            const activeGroupId = this._editorGroupsService.activeGroup.id;
            const activeGroup = this._groupLookup.get(activeGroupId);
            if (activeGroup) {
                // Ok not to loop as exthost accepts last active group
                activeGroup.isActive = true;
                this._proxy.$acceptTabGroupUpdate(activeGroup);
            }
        }
        /**
         * Called when the tab label changes
         * @param groupId The id of the group the tab exists in
         * @param editorInput The editor input represented by the tab
         */
        _onDidTabLabelChange(groupId, editorInput, editorIndex) {
            const tabId = this._generateTabId(editorInput, groupId);
            const tabInfo = this._tabInfoLookup.get(tabId);
            // If tab is found patch, else rebuild
            if (tabInfo) {
                tabInfo.tab.label = editorInput.getName();
                this._proxy.$acceptTabOperation({
                    groupId,
                    index: editorIndex,
                    tabDto: tabInfo.tab,
                    kind: 2 /* TabModelOperationKind.TAB_UPDATE */
                });
            }
            else {
                this._logService.error('Invalid model for label change, rebuilding');
                this._createTabsModel();
            }
        }
        /**
         * Called when a new tab is opened
         * @param groupId The id of the group the tab is being created in
         * @param editorInput The editor input being opened
         * @param editorIndex The index of the editor within that group
         */
        _onDidTabOpen(groupId, editorInput, editorIndex) {
            const group = this._editorGroupsService.getGroup(groupId);
            // Even if the editor service knows about the group the group might not exist yet in our model
            const groupInModel = this._groupLookup.get(groupId) !== undefined;
            // Means a new group was likely created so we rebuild the model
            if (!group || !groupInModel) {
                this._createTabsModel();
                return;
            }
            const tabs = this._groupLookup.get(groupId)?.tabs;
            if (!tabs) {
                return;
            }
            // Splice tab into group at index editorIndex
            const tabObject = this._buildTabObject(group, editorInput, editorIndex);
            tabs.splice(editorIndex, 0, tabObject);
            // Update lookup
            this._tabInfoLookup.set(this._generateTabId(editorInput, groupId), { group, editorInput, tab: tabObject });
            this._proxy.$acceptTabOperation({
                groupId,
                index: editorIndex,
                tabDto: tabObject,
                kind: 0 /* TabModelOperationKind.TAB_OPEN */
            });
        }
        /**
         * Called when a tab is closed
         * @param groupId The id of the group the tab is being removed from
         * @param editorIndex The index of the editor within that group
         */
        _onDidTabClose(groupId, editorIndex) {
            const group = this._editorGroupsService.getGroup(groupId);
            const tabs = this._groupLookup.get(groupId)?.tabs;
            // Something is wrong with the model state so we rebuild
            if (!group || !tabs) {
                this._createTabsModel();
                return;
            }
            // Splice tab into group at index editorIndex
            const removedTab = tabs.splice(editorIndex, 1);
            // Index must no longer be valid so we return prematurely
            if (removedTab.length === 0) {
                return;
            }
            // Update lookup
            this._tabInfoLookup.delete(removedTab[0]?.id ?? '');
            this._proxy.$acceptTabOperation({
                groupId,
                index: editorIndex,
                tabDto: removedTab[0],
                kind: 1 /* TabModelOperationKind.TAB_CLOSE */
            });
        }
        /**
         * Called when the active tab changes
         * @param groupId The id of the group the tab is contained in
         * @param editorIndex The index of the tab
         */
        _onDidTabActiveChange(groupId, editorIndex) {
            // TODO @lramos15 use the tab lookup here if possible. Do we have an editor input?!
            const tabs = this._groupLookup.get(groupId)?.tabs;
            if (!tabs) {
                return;
            }
            const activeTab = tabs[editorIndex];
            // No need to loop over as the exthost uses the most recently marked active tab
            activeTab.isActive = true;
            // Send DTO update to the exthost
            this._proxy.$acceptTabOperation({
                groupId,
                index: editorIndex,
                tabDto: activeTab,
                kind: 2 /* TabModelOperationKind.TAB_UPDATE */
            });
        }
        /**
         * Called when the dirty indicator on the tab changes
         * @param groupId The id of the group the tab is in
         * @param editorIndex The index of the tab
         * @param editor The editor input represented by the tab
         */
        _onDidTabDirty(groupId, editorIndex, editor) {
            const tabId = this._generateTabId(editor, groupId);
            const tabInfo = this._tabInfoLookup.get(tabId);
            // Something wrong with the model state so we rebuild
            if (!tabInfo) {
                this._logService.error('Invalid model for dirty change, rebuilding');
                this._createTabsModel();
                return;
            }
            tabInfo.tab.isDirty = editor.isDirty();
            this._proxy.$acceptTabOperation({
                groupId,
                index: editorIndex,
                tabDto: tabInfo.tab,
                kind: 2 /* TabModelOperationKind.TAB_UPDATE */
            });
        }
        /**
         * Called when the tab is pinned/unpinned
         * @param groupId The id of the group the tab is in
         * @param editorIndex The index of the tab
         * @param editor The editor input represented by the tab
         */
        _onDidTabPinChange(groupId, editorIndex, editor) {
            const tabId = this._generateTabId(editor, groupId);
            const tabInfo = this._tabInfoLookup.get(tabId);
            const group = tabInfo?.group;
            const tab = tabInfo?.tab;
            // Something wrong with the model state so we rebuild
            if (!group || !tab) {
                this._logService.error('Invalid model for sticky change, rebuilding');
                this._createTabsModel();
                return;
            }
            // Whether or not the tab has the pin icon (internally it's called sticky)
            tab.isPinned = group.isSticky(editorIndex);
            this._proxy.$acceptTabOperation({
                groupId,
                index: editorIndex,
                tabDto: tab,
                kind: 2 /* TabModelOperationKind.TAB_UPDATE */
            });
        }
        /**
     * Called when the tab is preview / unpreviewed
     * @param groupId The id of the group the tab is in
     * @param editorIndex The index of the tab
     * @param editor The editor input represented by the tab
     */
        _onDidTabPreviewChange(groupId, editorIndex, editor) {
            const tabId = this._generateTabId(editor, groupId);
            const tabInfo = this._tabInfoLookup.get(tabId);
            const group = tabInfo?.group;
            const tab = tabInfo?.tab;
            // Something wrong with the model state so we rebuild
            if (!group || !tab) {
                this._logService.error('Invalid model for sticky change, rebuilding');
                this._createTabsModel();
                return;
            }
            // Whether or not the tab has the pin icon (internally it's called pinned)
            tab.isPreview = !group.isPinned(editorIndex);
            this._proxy.$acceptTabOperation({
                kind: 2 /* TabModelOperationKind.TAB_UPDATE */,
                groupId,
                tabDto: tab,
                index: editorIndex
            });
        }
        _onDidTabMove(groupId, editorIndex, oldEditorIndex, editor) {
            const tabs = this._groupLookup.get(groupId)?.tabs;
            // Something wrong with the model state so we rebuild
            if (!tabs) {
                this._logService.error('Invalid model for move change, rebuilding');
                this._createTabsModel();
                return;
            }
            // Move tab from old index to new index
            const removedTab = tabs.splice(oldEditorIndex, 1);
            if (removedTab.length === 0) {
                return;
            }
            tabs.splice(editorIndex, 0, removedTab[0]);
            // Notify exthost of move
            this._proxy.$acceptTabOperation({
                kind: 3 /* TabModelOperationKind.TAB_MOVE */,
                groupId,
                tabDto: removedTab[0],
                index: editorIndex,
                oldIndex: oldEditorIndex
            });
        }
        /**
         * Builds the model from scratch based on the current state of the editor service.
         */
        _createTabsModel() {
            this._tabGroupModel = [];
            this._groupLookup.clear();
            this._tabInfoLookup.clear();
            let tabs = [];
            for (const group of this._editorGroupsService.groups) {
                const currentTabGroupModel = {
                    groupId: group.id,
                    isActive: group.id === this._editorGroupsService.activeGroup.id,
                    viewColumn: (0, editorGroupColumn_1.editorGroupToColumn)(this._editorGroupsService, group),
                    tabs: []
                };
                group.editors.forEach((editor, editorIndex) => {
                    const tab = this._buildTabObject(group, editor, editorIndex);
                    tabs.push(tab);
                    // Add information about the tab to the lookup
                    this._tabInfoLookup.set(this._generateTabId(editor, group.id), {
                        group,
                        tab,
                        editorInput: editor
                    });
                });
                currentTabGroupModel.tabs = tabs;
                this._tabGroupModel.push(currentTabGroupModel);
                this._groupLookup.set(group.id, currentTabGroupModel);
                tabs = [];
            }
            // notify the ext host of the new model
            this._proxy.$acceptEditorTabModel(this._tabGroupModel);
        }
        // TODOD @lramos15 Remove this after done finishing the tab model code
        // private _eventToString(event: IEditorsChangeEvent | IEditorsMoveEvent): string {
        // 	let eventString = '';
        // 	switch (event.kind) {
        // 		case GroupModelChangeKind.GROUP_INDEX: eventString += 'GROUP_INDEX'; break;
        // 		case GroupModelChangeKind.EDITOR_ACTIVE: eventString += 'EDITOR_ACTIVE'; break;
        // 		case GroupModelChangeKind.EDITOR_PIN: eventString += 'EDITOR_PIN'; break;
        // 		case GroupModelChangeKind.EDITOR_OPEN: eventString += 'EDITOR_OPEN'; break;
        // 		case GroupModelChangeKind.EDITOR_CLOSE: eventString += 'EDITOR_CLOSE'; break;
        // 		case GroupModelChangeKind.EDITOR_MOVE: eventString += 'EDITOR_MOVE'; break;
        // 		case GroupModelChangeKind.EDITOR_LABEL: eventString += 'EDITOR_LABEL'; break;
        // 		case GroupModelChangeKind.GROUP_ACTIVE: eventString += 'GROUP_ACTIVE'; break;
        // 		case GroupModelChangeKind.GROUP_LOCKED: eventString += 'GROUP_LOCKED'; break;
        // 		case GroupModelChangeKind.EDITOR_DIRTY: eventString += 'EDITOR_DIRTY'; break;
        // 		case GroupModelChangeKind.EDITOR_STICKY: eventString += 'EDITOR_STICKY'; break;
        // 		default: eventString += `UNKNOWN: ${event.kind}`; break;
        // 	}
        // 	return eventString;
        // }
        /**
         * The main handler for the tab events
         * @param events The list of events to process
         */
        _updateTabsModel(changeEvent) {
            const event = changeEvent.event;
            const groupId = changeEvent.groupId;
            switch (event.kind) {
                case 0 /* GroupModelChangeKind.GROUP_ACTIVE */:
                    if (groupId === this._editorGroupsService.activeGroup.id) {
                        this._onDidGroupActivate();
                        break;
                    }
                    else {
                        return;
                    }
                case 7 /* GroupModelChangeKind.EDITOR_LABEL */:
                    if (event.editor !== undefined && event.editorIndex !== undefined) {
                        this._onDidTabLabelChange(groupId, event.editor, event.editorIndex);
                        break;
                    }
                case 3 /* GroupModelChangeKind.EDITOR_OPEN */:
                    if (event.editor !== undefined && event.editorIndex !== undefined) {
                        this._onDidTabOpen(groupId, event.editor, event.editorIndex);
                        break;
                    }
                case 4 /* GroupModelChangeKind.EDITOR_CLOSE */:
                    if (event.editorIndex !== undefined) {
                        this._onDidTabClose(groupId, event.editorIndex);
                        break;
                    }
                case 6 /* GroupModelChangeKind.EDITOR_ACTIVE */:
                    if (event.editorIndex !== undefined) {
                        this._onDidTabActiveChange(groupId, event.editorIndex);
                        break;
                    }
                case 11 /* GroupModelChangeKind.EDITOR_DIRTY */:
                    if (event.editorIndex !== undefined && event.editor !== undefined) {
                        this._onDidTabDirty(groupId, event.editorIndex, event.editor);
                        break;
                    }
                case 10 /* GroupModelChangeKind.EDITOR_STICKY */:
                    if (event.editorIndex !== undefined && event.editor !== undefined) {
                        this._onDidTabPinChange(groupId, event.editorIndex, event.editor);
                        break;
                    }
                case 9 /* GroupModelChangeKind.EDITOR_PIN */:
                    if (event.editorIndex !== undefined && event.editor !== undefined) {
                        this._onDidTabPreviewChange(groupId, event.editorIndex, event.editor);
                        break;
                    }
                case 5 /* GroupModelChangeKind.EDITOR_MOVE */:
                    if ((0, editorGroupModel_1.isGroupEditorMoveEvent)(event) && event.editor && event.editorIndex !== undefined && event.oldEditorIndex !== undefined) {
                        this._onDidTabMove(groupId, event.editorIndex, event.oldEditorIndex, event.editor);
                        break;
                    }
                default:
                    // If it's not an optimized case we rebuild the tabs model from scratch
                    this._createTabsModel();
            }
        }
        //#region Messages received from Ext Host
        $moveTab(tabId, index, viewColumn, preserveFocus) {
            const groupId = (0, editorGroupColumn_1.columnToEditorGroup)(this._editorGroupsService, this._configurationService, viewColumn);
            const tabInfo = this._tabInfoLookup.get(tabId);
            const tab = tabInfo?.tab;
            if (!tab) {
                throw new Error(`Attempted to close tab with id ${tabId} which does not exist`);
            }
            let targetGroup;
            const sourceGroup = this._editorGroupsService.getGroup(tabInfo.group.id);
            if (!sourceGroup) {
                return;
            }
            // If group index is out of bounds then we make a new one that's to the right of the last group
            if (this._groupLookup.get(groupId) === undefined) {
                let direction = 3 /* GroupDirection.RIGHT */;
                // Make sure we respect the user's preferred side direction
                if (viewColumn === editorService_1.SIDE_GROUP) {
                    direction = (0, editorGroupsService_1.preferredSideBySideGroupDirection)(this._configurationService);
                }
                targetGroup = this._editorGroupsService.addGroup(this._editorGroupsService.groups[this._editorGroupsService.groups.length - 1], direction);
            }
            else {
                targetGroup = this._editorGroupsService.getGroup(groupId);
            }
            if (!targetGroup) {
                return;
            }
            // Similar logic to if index is out of bounds we place it at the end
            if (index < 0 || index > targetGroup.editors.length) {
                index = targetGroup.editors.length;
            }
            // Find the correct EditorInput using the tab info
            const editorInput = tabInfo?.editorInput;
            if (!editorInput) {
                return;
            }
            // Move the editor to the target group
            sourceGroup.moveEditor(editorInput, targetGroup, { index, preserveFocus });
            return;
        }
        async $closeTab(tabIds, preserveFocus) {
            const groups = new Map();
            for (const tabId of tabIds) {
                const tabInfo = this._tabInfoLookup.get(tabId);
                const tab = tabInfo?.tab;
                const group = tabInfo?.group;
                const editorTab = tabInfo?.editorInput;
                // If not found skip
                if (!group || !tab || !tabInfo || !editorTab) {
                    continue;
                }
                const groupEditors = groups.get(group);
                if (!groupEditors) {
                    groups.set(group, [editorTab]);
                }
                else {
                    groupEditors.push(editorTab);
                }
            }
            // Loop over keys of the groups map and call closeEditors
            const results = [];
            for (const [group, editors] of groups) {
                results.push(await group.closeEditors(editors, { preserveFocus }));
            }
            // TODO @jrieken This isn't quite right how can we say true for some but not others?
            return results.every(result => result);
        }
        async $closeGroup(groupIds, preserveFocus) {
            const groupCloseResults = [];
            for (const groupId of groupIds) {
                const group = this._editorGroupsService.getGroup(groupId);
                if (group) {
                    groupCloseResults.push(await group.closeAllEditors());
                    // Make sure group is empty but still there before removing it
                    if (group.count === 0 && this._editorGroupsService.getGroup(group.id)) {
                        this._editorGroupsService.removeGroup(group);
                    }
                }
            }
            return groupCloseResults.every(result => result);
        }
    };
    exports.MainThreadEditorTabs = MainThreadEditorTabs;
    exports.MainThreadEditorTabs = MainThreadEditorTabs = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadEditorTabs),
        __param(1, editorGroupsService_1.IEditorGroupsService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, log_1.ILogService),
        __param(4, editorService_1.IEditorService)
    ], MainThreadEditorTabs);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZEVkaXRvclRhYnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZEVkaXRvclRhYnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBK0J6RixJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFvQjtRQVdoQyxZQUNDLGNBQStCLEVBQ1Qsb0JBQTJELEVBQzFELHFCQUE2RCxFQUN2RSxXQUF5QyxFQUN0QyxhQUE2QjtZQUhOLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBc0I7WUFDekMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUN0RCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQWJ0QyxnQkFBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBRXJELHlFQUF5RTtZQUNqRSxtQkFBYyxHQUF5QixFQUFFLENBQUM7WUFDbEQsdUNBQXVDO1lBQ3RCLGlCQUFZLEdBQW9DLElBQUksR0FBRyxFQUFFLENBQUM7WUFDM0UscUNBQXFDO1lBQ3BCLG1CQUFjLEdBQXlCLElBQUksR0FBRyxFQUFFLENBQUM7WUFVakUsSUFBSSxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUV4RSxpRUFBaUU7WUFDakUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQy9ELElBQUk7b0JBQ0gsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUM3QjtnQkFBQyxNQUFNO29CQUNQLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7b0JBQzdELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxD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