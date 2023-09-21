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
    exports.$ikb = void 0;
    let $ikb = class $ikb {
        constructor(extHostContext, f, g, h, editorService) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = new lifecycle_1.$jc();
            // List of all groups and their corresponding tabs, this is **the** model
            this.c = [];
            // Lookup table for finding group by id
            this.d = new Map();
            // Lookup table for finding tab by id
            this.e = new Map();
            this.b = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostEditorTabs);
            // Main listener which responds to events from the editor service
            this.a.add(editorService.onDidEditorsChange((event) => {
                try {
                    this.v(event);
                }
                catch {
                    this.h.error('Failed to update model, rebuilding');
                    this.u();
                }
            }));
            // Structural group changes (add, remove, move, etc) are difficult to patch.
            // Since they happen infrequently we just rebuild the entire model
            this.a.add(this.f.onDidAddGroup(() => this.u()));
            this.a.add(this.f.onDidRemoveGroup(() => this.u()));
            // Once everything is read go ahead and initialize the model
            this.f.whenReady.then(() => this.u());
        }
        dispose() {
            this.d.clear();
            this.e.clear();
            this.a.dispose();
        }
        /**
         * Creates a tab object with the correct properties
         * @param editor The editor input represented by the tab
         * @param group The group the tab is in
         * @returns A tab object
         */
        i(group, editor, editorIndex) {
            const editorId = editor.editorId;
            const tab = {
                id: this.k(editor, group.id),
                label: editor.getName(),
                editorId,
                input: this.j(editor),
                isPinned: group.isSticky(editorIndex),
                isPreview: !group.isPinned(editorIndex),
                isActive: group.isActive(editor),
                isDirty: editor.isDirty()
            };
            return tab;
        }
        j(editor) {
            if (editor instanceof mergeEditorInput_1.$hkb) {
                return {
                    kind: 3 /* TabInputKind.TextMergeInput */,
                    base: editor.base,
                    input1: editor.input1.uri,
                    input2: editor.input2.uri,
                    result: editor.resource
                };
            }
            if (editor instanceof textResourceEditorInput_1.$6eb) {
                return {
                    kind: 1 /* TabInputKind.TextInput */,
                    uri: editor.resource
                };
            }
            if (editor instanceof sideBySideEditorInput_1.$VC && !(editor instanceof diffEditorInput_1.$3eb)) {
                const primaryResource = editor.primary.resource;
                const secondaryResource = editor.secondary.resource;
                // If side by side editor with same resource on both sides treat it as a singular tab kind
                if (editor.primary instanceof textResourceEditorInput_1.$6eb
                    && editor.secondary instanceof textResourceEditorInput_1.$6eb
                    && (0, resources_1.$bg)(primaryResource, secondaryResource)
                    && primaryResource
                    && secondaryResource) {
                    return {
                        kind: 1 /* TabInputKind.TextInput */,
                        uri: primaryResource
                    };
                }
                return { kind: 0 /* TabInputKind.UnknownInput */ };
            }
            if (editor instanceof notebookEditorInput_1.$zbb) {
                return {
                    kind: 4 /* TabInputKind.NotebookInput */,
                    notebookType: editor.viewType,
                    uri: editor.resource
                };
            }
            if (editor instanceof customEditorInput_1.$kfb) {
                return {
                    kind: 6 /* TabInputKind.CustomEditorInput */,
                    viewType: editor.viewType,
                    uri: editor.resource,
                };
            }
            if (editor instanceof webviewEditorInput_1.$cfb) {
                return {
                    kind: 7 /* TabInputKind.WebviewEditorInput */,
                    viewType: editor.viewType
                };
            }
            if (editor instanceof terminalEditorInput_1.$Zib) {
                return {
                    kind: 8 /* TabInputKind.TerminalEditorInput */
                };
            }
            if (editor instanceof diffEditorInput_1.$3eb) {
                if (editor.modified instanceof textResourceEditorInput_1.$6eb && editor.original instanceof textResourceEditorInput_1.$6eb) {
                    return {
                        kind: 2 /* TabInputKind.TextDiffInput */,
                        modified: editor.modified.resource,
                        original: editor.original.resource
                    };
                }
                if (editor.modified instanceof notebookEditorInput_1.$zbb && editor.original instanceof notebookEditorInput_1.$zbb) {
                    return {
                        kind: 5 /* TabInputKind.NotebookDiffInput */,
                        notebookType: editor.original.viewType,
                        modified: editor.modified.resource,
                        original: editor.original.resource
                    };
                }
            }
            if (editor instanceof interactiveEditorInput_1.$5ib) {
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
        k(editor, groupId) {
            let resourceString;
            // Properly get the resource and account for side by side editors
            const resource = editor_1.$3E.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.BOTH });
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
        l() {
            const activeGroupId = this.f.activeGroup.id;
            const activeGroup = this.d.get(activeGroupId);
            if (activeGroup) {
                // Ok not to loop as exthost accepts last active group
                activeGroup.isActive = true;
                this.b.$acceptTabGroupUpdate(activeGroup);
            }
        }
        /**
         * Called when the tab label changes
         * @param groupId The id of the group the tab exists in
         * @param editorInput The editor input represented by the tab
         */
        m(groupId, editorInput, editorIndex) {
            const tabId = this.k(editorInput, groupId);
            const tabInfo = this.e.get(tabId);
            // If tab is found patch, else rebuild
            if (tabInfo) {
                tabInfo.tab.label = editorInput.getName();
                this.b.$acceptTabOperation({
                    groupId,
                    index: editorIndex,
                    tabDto: tabInfo.tab,
                    kind: 2 /* TabModelOperationKind.TAB_UPDATE */
                });
            }
            else {
                this.h.error('Invalid model for label change, rebuilding');
                this.u();
            }
        }
        /**
         * Called when a new tab is opened
         * @param groupId The id of the group the tab is being created in
         * @param editorInput The editor input being opened
         * @param editorIndex The index of the editor within that group
         */
        n(groupId, editorInput, editorIndex) {
            const group = this.f.getGroup(groupId);
            // Even if the editor service knows about the group the group might not exist yet in our model
            const groupInModel = this.d.get(groupId) !== undefined;
            // Means a new group was likely created so we rebuild the model
            if (!group || !groupInModel) {
                this.u();
                return;
            }
            const tabs = this.d.get(groupId)?.tabs;
            if (!tabs) {
                return;
            }
            // Splice tab into group at index editorIndex
            const tabObject = this.i(group, editorInput, editorIndex);
            tabs.splice(editorIndex, 0, tabObject);
            // Update lookup
            this.e.set(this.k(editorInput, groupId), { group, editorInput, tab: tabObject });
            this.b.$acceptTabOperation({
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
        o(groupId, editorIndex) {
            const group = this.f.getGroup(groupId);
            const tabs = this.d.get(groupId)?.tabs;
            // Something is wrong with the model state so we rebuild
            if (!group || !tabs) {
                this.u();
                return;
            }
            // Splice tab into group at index editorIndex
            const removedTab = tabs.splice(editorIndex, 1);
            // Index must no longer be valid so we return prematurely
            if (removedTab.length === 0) {
                return;
            }
            // Update lookup
            this.e.delete(removedTab[0]?.id ?? '');
            this.b.$acceptTabOperation({
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
        p(groupId, editorIndex) {
            // TODO @lramos15 use the tab lookup here if possible. Do we have an editor input?!
            const tabs = this.d.get(groupId)?.tabs;
            if (!tabs) {
                return;
            }
            const activeTab = tabs[editorIndex];
            // No need to loop over as the exthost uses the most recently marked active tab
            activeTab.isActive = true;
            // Send DTO update to the exthost
            this.b.$acceptTabOperation({
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
        q(groupId, editorIndex, editor) {
            const tabId = this.k(editor, groupId);
            const tabInfo = this.e.get(tabId);
            // Something wrong with the model state so we rebuild
            if (!tabInfo) {
                this.h.error('Invalid model for dirty change, rebuilding');
                this.u();
                return;
            }
            tabInfo.tab.isDirty = editor.isDirty();
            this.b.$acceptTabOperation({
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
        r(groupId, editorIndex, editor) {
            const tabId = this.k(editor, groupId);
            const tabInfo = this.e.get(tabId);
            const group = tabInfo?.group;
            const tab = tabInfo?.tab;
            // Something wrong with the model state so we rebuild
            if (!group || !tab) {
                this.h.error('Invalid model for sticky change, rebuilding');
                this.u();
                return;
            }
            // Whether or not the tab has the pin icon (internally it's called sticky)
            tab.isPinned = group.isSticky(editorIndex);
            this.b.$acceptTabOperation({
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
        s(groupId, editorIndex, editor) {
            const tabId = this.k(editor, groupId);
            const tabInfo = this.e.get(tabId);
            const group = tabInfo?.group;
            const tab = tabInfo?.tab;
            // Something wrong with the model state so we rebuild
            if (!group || !tab) {
                this.h.error('Invalid model for sticky change, rebuilding');
                this.u();
                return;
            }
            // Whether or not the tab has the pin icon (internally it's called pinned)
            tab.isPreview = !group.isPinned(editorIndex);
            this.b.$acceptTabOperation({
                kind: 2 /* TabModelOperationKind.TAB_UPDATE */,
                groupId,
                tabDto: tab,
                index: editorIndex
            });
        }
        t(groupId, editorIndex, oldEditorIndex, editor) {
            const tabs = this.d.get(groupId)?.tabs;
            // Something wrong with the model state so we rebuild
            if (!tabs) {
                this.h.error('Invalid model for move change, rebuilding');
                this.u();
                return;
            }
            // Move tab from old index to new index
            const removedTab = tabs.splice(oldEditorIndex, 1);
            if (removedTab.length === 0) {
                return;
            }
            tabs.splice(editorIndex, 0, removedTab[0]);
            // Notify exthost of move
            this.b.$acceptTabOperation({
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
        u() {
            this.c = [];
            this.d.clear();
            this.e.clear();
            let tabs = [];
            for (const group of this.f.groups) {
                const currentTabGroupModel = {
                    groupId: group.id,
                    isActive: group.id === this.f.activeGroup.id,
                    viewColumn: (0, editorGroupColumn_1.$5I)(this.f, group),
                    tabs: []
                };
                group.editors.forEach((editor, editorIndex) => {
                    const tab = this.i(group, editor, editorIndex);
                    tabs.push(tab);
                    // Add information about the tab to the lookup
                    this.e.set(this.k(editor, group.id), {
                        group,
                        tab,
                        editorInput: editor
                    });
                });
                currentTabGroupModel.tabs = tabs;
                this.c.push(currentTabGroupModel);
                this.d.set(group.id, currentTabGroupModel);
                tabs = [];
            }
            // notify the ext host of the new model
            this.b.$acceptEditorTabModel(this.c);
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
        v(changeEvent) {
            const event = changeEvent.event;
            const groupId = changeEvent.groupId;
            switch (event.kind) {
                case 0 /* GroupModelChangeKind.GROUP_ACTIVE */:
                    if (groupId === this.f.activeGroup.id) {
                        this.l();
                        break;
                    }
                    else {
                        return;
                    }
                case 7 /* GroupModelChangeKind.EDITOR_LABEL */:
                    if (event.editor !== undefined && event.editorIndex !== undefined) {
                        this.m(groupId, event.editor, event.editorIndex);
                        break;
                    }
                case 3 /* GroupModelChangeKind.EDITOR_OPEN */:
                    if (event.editor !== undefined && event.editorIndex !== undefined) {
                        this.n(groupId, event.editor, event.editorIndex);
                        break;
                    }
                case 4 /* GroupModelChangeKind.EDITOR_CLOSE */:
                    if (event.editorIndex !== undefined) {
                        this.o(groupId, event.editorIndex);
                        break;
                    }
                case 6 /* GroupModelChangeKind.EDITOR_ACTIVE */:
                    if (event.editorIndex !== undefined) {
                        this.p(groupId, event.editorIndex);
                        break;
                    }
                case 11 /* GroupModelChangeKind.EDITOR_DIRTY */:
                    if (event.editorIndex !== undefined && event.editor !== undefined) {
                        this.q(groupId, event.editorIndex, event.editor);
                        break;
                    }
                case 10 /* GroupModelChangeKind.EDITOR_STICKY */:
                    if (event.editorIndex !== undefined && event.editor !== undefined) {
                        this.r(groupId, event.editorIndex, event.editor);
                        break;
                    }
                case 9 /* GroupModelChangeKind.EDITOR_PIN */:
                    if (event.editorIndex !== undefined && event.editor !== undefined) {
                        this.s(groupId, event.editorIndex, event.editor);
                        break;
                    }
                case 5 /* GroupModelChangeKind.EDITOR_MOVE */:
                    if ((0, editorGroupModel_1.$2C)(event) && event.editor && event.editorIndex !== undefined && event.oldEditorIndex !== undefined) {
                        this.t(groupId, event.editorIndex, event.oldEditorIndex, event.editor);
                        break;
                    }
                default:
                    // If it's not an optimized case we rebuild the tabs model from scratch
                    this.u();
            }
        }
        //#region Messages received from Ext Host
        $moveTab(tabId, index, viewColumn, preserveFocus) {
            const groupId = (0, editorGroupColumn_1.$4I)(this.f, this.g, viewColumn);
            const tabInfo = this.e.get(tabId);
            const tab = tabInfo?.tab;
            if (!tab) {
                throw new Error(`Attempted to close tab with id ${tabId} which does not exist`);
            }
            let targetGroup;
            const sourceGroup = this.f.getGroup(tabInfo.group.id);
            if (!sourceGroup) {
                return;
            }
            // If group index is out of bounds then we make a new one that's to the right of the last group
            if (this.d.get(groupId) === undefined) {
                let direction = 3 /* GroupDirection.RIGHT */;
                // Make sure we respect the user's preferred side direction
                if (viewColumn === editorService_1.$$C) {
                    direction = (0, editorGroupsService_1.$8C)(this.g);
                }
                targetGroup = this.f.addGroup(this.f.groups[this.f.groups.length - 1], direction);
            }
            else {
                targetGroup = this.f.getGroup(groupId);
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
                const tabInfo = this.e.get(tabId);
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
                const group = this.f.getGroup(groupId);
                if (group) {
                    groupCloseResults.push(await group.closeAllEditors());
                    // Make sure group is empty but still there before removing it
                    if (group.count === 0 && this.f.getGroup(group.id)) {
                        this.f.removeGroup(group);
                    }
                }
            }
            return groupCloseResults.every(result => result);
        }
    };
    exports.$ikb = $ikb;
    exports.$ikb = $ikb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadEditorTabs),
        __param(1, editorGroupsService_1.$5C),
        __param(2, configuration_1.$8h),
        __param(3, log_1.$5i),
        __param(4, editorService_1.$9C)
    ], $ikb);
});
//# sourceMappingURL=mainThreadEditorTabs.js.map