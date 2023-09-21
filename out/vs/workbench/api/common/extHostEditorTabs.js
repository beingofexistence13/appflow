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
define(["require", "exports", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHost.protocol", "vs/base/common/uri", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostRpcService", "vs/base/common/types", "vs/base/common/collections"], function (require, exports, typeConverters, extHost_protocol_1, uri_1, event_1, instantiation_1, extHostTypes_1, extHostRpcService_1, types_1, collections_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostEditorTabs = exports.IExtHostEditorTabs = void 0;
    exports.IExtHostEditorTabs = (0, instantiation_1.createDecorator)('IExtHostEditorTabs');
    class ExtHostEditorTab {
        constructor(dto, parentGroup, activeTabIdGetter) {
            this._activeTabIdGetter = activeTabIdGetter;
            this._parentGroup = parentGroup;
            this.acceptDtoUpdate(dto);
        }
        get apiObject() {
            if (!this._apiObject) {
                // Don't want to lose reference to parent `this` in the getters
                const that = this;
                const obj = {
                    get isActive() {
                        // We use a getter function here to always ensure at most 1 active tab per group and prevent iteration for being required
                        return that._dto.id === that._activeTabIdGetter();
                    },
                    get label() {
                        return that._dto.label;
                    },
                    get input() {
                        return that._input;
                    },
                    get isDirty() {
                        return that._dto.isDirty;
                    },
                    get isPinned() {
                        return that._dto.isPinned;
                    },
                    get isPreview() {
                        return that._dto.isPreview;
                    },
                    get group() {
                        return that._parentGroup.apiObject;
                    }
                };
                this._apiObject = Object.freeze(obj);
            }
            return this._apiObject;
        }
        get tabId() {
            return this._dto.id;
        }
        acceptDtoUpdate(dto) {
            this._dto = dto;
            this._input = this._initInput();
        }
        _initInput() {
            switch (this._dto.input.kind) {
                case 1 /* TabInputKind.TextInput */:
                    return new extHostTypes_1.TextTabInput(uri_1.URI.revive(this._dto.input.uri));
                case 2 /* TabInputKind.TextDiffInput */:
                    return new extHostTypes_1.TextDiffTabInput(uri_1.URI.revive(this._dto.input.original), uri_1.URI.revive(this._dto.input.modified));
                case 3 /* TabInputKind.TextMergeInput */:
                    return new extHostTypes_1.TextMergeTabInput(uri_1.URI.revive(this._dto.input.base), uri_1.URI.revive(this._dto.input.input1), uri_1.URI.revive(this._dto.input.input2), uri_1.URI.revive(this._dto.input.result));
                case 6 /* TabInputKind.CustomEditorInput */:
                    return new extHostTypes_1.CustomEditorTabInput(uri_1.URI.revive(this._dto.input.uri), this._dto.input.viewType);
                case 7 /* TabInputKind.WebviewEditorInput */:
                    return new extHostTypes_1.WebviewEditorTabInput(this._dto.input.viewType);
                case 4 /* TabInputKind.NotebookInput */:
                    return new extHostTypes_1.NotebookEditorTabInput(uri_1.URI.revive(this._dto.input.uri), this._dto.input.notebookType);
                case 5 /* TabInputKind.NotebookDiffInput */:
                    return new extHostTypes_1.NotebookDiffEditorTabInput(uri_1.URI.revive(this._dto.input.original), uri_1.URI.revive(this._dto.input.modified), this._dto.input.notebookType);
                case 8 /* TabInputKind.TerminalEditorInput */:
                    return new extHostTypes_1.TerminalEditorTabInput();
                case 9 /* TabInputKind.InteractiveEditorInput */:
                    return new extHostTypes_1.InteractiveWindowInput(uri_1.URI.revive(this._dto.input.uri), uri_1.URI.revive(this._dto.input.inputBoxUri));
                default:
                    return undefined;
            }
        }
    }
    class ExtHostEditorTabGroup {
        constructor(dto, activeGroupIdGetter) {
            this._tabs = [];
            this._activeTabId = '';
            this._dto = dto;
            this._activeGroupIdGetter = activeGroupIdGetter;
            // Construct all tabs from the given dto
            for (const tabDto of dto.tabs) {
                if (tabDto.isActive) {
                    this._activeTabId = tabDto.id;
                }
                this._tabs.push(new ExtHostEditorTab(tabDto, this, () => this.activeTabId()));
            }
        }
        get apiObject() {
            if (!this._apiObject) {
                // Don't want to lose reference to parent `this` in the getters
                const that = this;
                const obj = {
                    get isActive() {
                        // We use a getter function here to always ensure at most 1 active group and prevent iteration for being required
                        return that._dto.groupId === that._activeGroupIdGetter();
                    },
                    get viewColumn() {
                        return typeConverters.ViewColumn.to(that._dto.viewColumn);
                    },
                    get activeTab() {
                        return that._tabs.find(tab => tab.tabId === that._activeTabId)?.apiObject;
                    },
                    get tabs() {
                        return Object.freeze(that._tabs.map(tab => tab.apiObject));
                    }
                };
                this._apiObject = Object.freeze(obj);
            }
            return this._apiObject;
        }
        get groupId() {
            return this._dto.groupId;
        }
        get tabs() {
            return this._tabs;
        }
        acceptGroupDtoUpdate(dto) {
            this._dto = dto;
        }
        acceptTabOperation(operation) {
            // In the open case we add the tab to the group
            if (operation.kind === 0 /* TabModelOperationKind.TAB_OPEN */) {
                const tab = new ExtHostEditorTab(operation.tabDto, this, () => this.activeTabId());
                // Insert tab at editor index
                this._tabs.splice(operation.index, 0, tab);
                if (operation.tabDto.isActive) {
                    this._activeTabId = tab.tabId;
                }
                return tab;
            }
            else if (operation.kind === 1 /* TabModelOperationKind.TAB_CLOSE */) {
                const tab = this._tabs.splice(operation.index, 1)[0];
                if (!tab) {
                    throw new Error(`Tab close updated received for index ${operation.index} which does not exist`);
                }
                if (tab.tabId === this._activeTabId) {
                    this._activeTabId = '';
                }
                return tab;
            }
            else if (operation.kind === 3 /* TabModelOperationKind.TAB_MOVE */) {
                if (operation.oldIndex === undefined) {
                    throw new Error('Invalid old index on move IPC');
                }
                // Splice to remove at old index and insert at new index === moving the tab
                const tab = this._tabs.splice(operation.oldIndex, 1)[0];
                if (!tab) {
                    throw new Error(`Tab move updated received for index ${operation.oldIndex} which does not exist`);
                }
                this._tabs.splice(operation.index, 0, tab);
                return tab;
            }
            const tab = this._tabs.find(extHostTab => extHostTab.tabId === operation.tabDto.id);
            if (!tab) {
                throw new Error('INVALID tab');
            }
            if (operation.tabDto.isActive) {
                this._activeTabId = operation.tabDto.id;
            }
            else if (this._activeTabId === operation.tabDto.id && !operation.tabDto.isActive) {
                // Events aren't guaranteed to be in order so if we receive a dto that matches the active tab id
                // but isn't active we mark the active tab id as empty. This prevent onDidActiveTabChange from
                // firing incorrectly
                this._activeTabId = '';
            }
            tab.acceptDtoUpdate(operation.tabDto);
            return tab;
        }
        // Not a getter since it must be a function to be used as a callback for the tabs
        activeTabId() {
            return this._activeTabId;
        }
    }
    let ExtHostEditorTabs = class ExtHostEditorTabs {
        constructor(extHostRpc) {
            this._onDidChangeTabs = new event_1.Emitter();
            this._onDidChangeTabGroups = new event_1.Emitter();
            this._extHostTabGroups = [];
            this._proxy = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadEditorTabs);
        }
        get tabGroups() {
            if (!this._apiObject) {
                const that = this;
                const obj = {
                    // never changes -> simple value
                    onDidChangeTabGroups: that._onDidChangeTabGroups.event,
                    onDidChangeTabs: that._onDidChangeTabs.event,
                    // dynamic -> getters
                    get all() {
                        return Object.freeze(that._extHostTabGroups.map(group => group.apiObject));
                    },
                    get activeTabGroup() {
                        const activeTabGroupId = that._activeGroupId;
                        const activeTabGroup = (0, types_1.assertIsDefined)(that._extHostTabGroups.find(candidate => candidate.groupId === activeTabGroupId)?.apiObject);
                        return activeTabGroup;
                    },
                    close: async (tabOrTabGroup, preserveFocus) => {
                        const tabsOrTabGroups = Array.isArray(tabOrTabGroup) ? tabOrTabGroup : [tabOrTabGroup];
                        if (!tabsOrTabGroups.length) {
                            return true;
                        }
                        // Check which type was passed in and call the appropriate close
                        // Casting is needed as typescript doesn't seem to infer enough from this
                        if (isTabGroup(tabsOrTabGroups[0])) {
                            return this._closeGroups(tabsOrTabGroups, preserveFocus);
                        }
                        else {
                            return this._closeTabs(tabsOrTabGroups, preserveFocus);
                        }
                    },
                    // move: async (tab: vscode.Tab, viewColumn: ViewColumn, index: number, preserveFocus?: boolean) => {
                    // 	const extHostTab = this._findExtHostTabFromApi(tab);
                    // 	if (!extHostTab) {
                    // 		throw new Error('Invalid tab');
                    // 	}
                    // 	this._proxy.$moveTab(extHostTab.tabId, index, typeConverters.ViewColumn.from(viewColumn), preserveFocus);
                    // 	return;
                    // }
                };
                this._apiObject = Object.freeze(obj);
            }
            return this._apiObject;
        }
        $acceptEditorTabModel(tabGroups) {
            const groupIdsBefore = new Set(this._extHostTabGroups.map(group => group.groupId));
            const groupIdsAfter = new Set(tabGroups.map(dto => dto.groupId));
            const diff = (0, collections_1.diffSets)(groupIdsBefore, groupIdsAfter);
            const closed = this._extHostTabGroups.filter(group => diff.removed.includes(group.groupId)).map(group => group.apiObject);
            const opened = [];
            const changed = [];
            this._extHostTabGroups = tabGroups.map(tabGroup => {
                const group = new ExtHostEditorTabGroup(tabGroup, () => this._activeGroupId);
                if (diff.added.includes(group.groupId)) {
                    opened.push(group.apiObject);
                }
                else {
                    changed.push(group.apiObject);
                }
                return group;
            });
            // Set the active tab group id
            const activeTabGroupId = (0, types_1.assertIsDefined)(tabGroups.find(group => group.isActive === true)?.groupId);
            if (activeTabGroupId !== undefined && this._activeGroupId !== activeTabGroupId) {
                this._activeGroupId = activeTabGroupId;
            }
            this._onDidChangeTabGroups.fire(Object.freeze({ opened, closed, changed }));
        }
        $acceptTabGroupUpdate(groupDto) {
            const group = this._extHostTabGroups.find(group => group.groupId === groupDto.groupId);
            if (!group) {
                throw new Error('Update Group IPC call received before group creation.');
            }
            group.acceptGroupDtoUpdate(groupDto);
            if (groupDto.isActive) {
                this._activeGroupId = groupDto.groupId;
            }
            this._onDidChangeTabGroups.fire(Object.freeze({ changed: [group.apiObject], opened: [], closed: [] }));
        }
        $acceptTabOperation(operation) {
            const group = this._extHostTabGroups.find(group => group.groupId === operation.groupId);
            if (!group) {
                throw new Error('Update Tabs IPC call received before group creation.');
            }
            const tab = group.acceptTabOperation(operation);
            // Construct the tab change event based on the operation
            switch (operation.kind) {
                case 0 /* TabModelOperationKind.TAB_OPEN */:
                    this._onDidChangeTabs.fire(Object.freeze({
                        opened: [tab.apiObject],
                        closed: [],
                        changed: []
                    }));
                    return;
                case 1 /* TabModelOperationKind.TAB_CLOSE */:
                    this._onDidChangeTabs.fire(Object.freeze({
                        opened: [],
                        closed: [tab.apiObject],
                        changed: []
                    }));
                    return;
                case 3 /* TabModelOperationKind.TAB_MOVE */:
                case 2 /* TabModelOperationKind.TAB_UPDATE */:
                    this._onDidChangeTabs.fire(Object.freeze({
                        opened: [],
                        closed: [],
                        changed: [tab.apiObject]
                    }));
                    return;
            }
        }
        _findExtHostTabFromApi(apiTab) {
            for (const group of this._extHostTabGroups) {
                for (const tab of group.tabs) {
                    if (tab.apiObject === apiTab) {
                        return tab;
                    }
                }
            }
            return;
        }
        _findExtHostTabGroupFromApi(apiTabGroup) {
            return this._extHostTabGroups.find(candidate => candidate.apiObject === apiTabGroup);
        }
        async _closeTabs(tabs, preserveFocus) {
            const extHostTabIds = [];
            for (const tab of tabs) {
                const extHostTab = this._findExtHostTabFromApi(tab);
                if (!extHostTab) {
                    throw new Error('Tab close: Invalid tab not found!');
                }
                extHostTabIds.push(extHostTab.tabId);
            }
            return this._proxy.$closeTab(extHostTabIds, preserveFocus);
        }
        async _closeGroups(groups, preserverFoucs) {
            const extHostGroupIds = [];
            for (const group of groups) {
                const extHostGroup = this._findExtHostTabGroupFromApi(group);
                if (!extHostGroup) {
                    throw new Error('Group close: Invalid group not found!');
                }
                extHostGroupIds.push(extHostGroup.groupId);
            }
            return this._proxy.$closeGroup(extHostGroupIds, preserverFoucs);
        }
    };
    exports.ExtHostEditorTabs = ExtHostEditorTabs;
    exports.ExtHostEditorTabs = ExtHostEditorTabs = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService)
    ], ExtHostEditorTabs);
    //#region Utils
    function isTabGroup(obj) {
        const tabGroup = obj;
        if (tabGroup.tabs !== undefined) {
            return true;
        }
        return false;
    }
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEVkaXRvclRhYnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0RWRpdG9yVGFicy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrQm5GLFFBQUEsa0JBQWtCLEdBQUcsSUFBQSwrQkFBZSxFQUFxQixvQkFBb0IsQ0FBQyxDQUFDO0lBSTVGLE1BQU0sZ0JBQWdCO1FBT3JCLFlBQVksR0FBa0IsRUFBRSxXQUFrQyxFQUFFLGlCQUErQjtZQUNsRyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsaUJBQWlCLENBQUM7WUFDNUMsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7WUFDaEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRUQsSUFBSSxTQUFTO1lBQ1osSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3JCLCtEQUErRDtnQkFDL0QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO2dCQUNsQixNQUFNLEdBQUcsR0FBZTtvQkFDdkIsSUFBSSxRQUFRO3dCQUNYLHlIQUF5SDt3QkFDekgsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztvQkFDbkQsQ0FBQztvQkFDRCxJQUFJLEtBQUs7d0JBQ1IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztvQkFDeEIsQ0FBQztvQkFDRCxJQUFJLEtBQUs7d0JBQ1IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO29CQUNwQixDQUFDO29CQUNELElBQUksT0FBTzt3QkFDVixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO29CQUMxQixDQUFDO29CQUNELElBQUksUUFBUTt3QkFDWCxPQUFPLElBQUks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