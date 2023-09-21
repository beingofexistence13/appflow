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
    exports.$mcc = exports.$lcc = void 0;
    exports.$lcc = (0, instantiation_1.$Bh)('IExtHostEditorTabs');
    class ExtHostEditorTab {
        constructor(dto, parentGroup, activeTabIdGetter) {
            this.e = activeTabIdGetter;
            this.d = parentGroup;
            this.acceptDtoUpdate(dto);
        }
        get apiObject() {
            if (!this.a) {
                // Don't want to lose reference to parent `this` in the getters
                const that = this;
                const obj = {
                    get isActive() {
                        // We use a getter function here to always ensure at most 1 active tab per group and prevent iteration for being required
                        return that.b.id === that.e();
                    },
                    get label() {
                        return that.b.label;
                    },
                    get input() {
                        return that.c;
                    },
                    get isDirty() {
                        return that.b.isDirty;
                    },
                    get isPinned() {
                        return that.b.isPinned;
                    },
                    get isPreview() {
                        return that.b.isPreview;
                    },
                    get group() {
                        return that.d.apiObject;
                    }
                };
                this.a = Object.freeze(obj);
            }
            return this.a;
        }
        get tabId() {
            return this.b.id;
        }
        acceptDtoUpdate(dto) {
            this.b = dto;
            this.c = this.f();
        }
        f() {
            switch (this.b.input.kind) {
                case 1 /* TabInputKind.TextInput */:
                    return new extHostTypes_1.$HL(uri_1.URI.revive(this.b.input.uri));
                case 2 /* TabInputKind.TextDiffInput */:
                    return new extHostTypes_1.$IL(uri_1.URI.revive(this.b.input.original), uri_1.URI.revive(this.b.input.modified));
                case 3 /* TabInputKind.TextMergeInput */:
                    return new extHostTypes_1.$JL(uri_1.URI.revive(this.b.input.base), uri_1.URI.revive(this.b.input.input1), uri_1.URI.revive(this.b.input.input2), uri_1.URI.revive(this.b.input.result));
                case 6 /* TabInputKind.CustomEditorInput */:
                    return new extHostTypes_1.$KL(uri_1.URI.revive(this.b.input.uri), this.b.input.viewType);
                case 7 /* TabInputKind.WebviewEditorInput */:
                    return new extHostTypes_1.$LL(this.b.input.viewType);
                case 4 /* TabInputKind.NotebookInput */:
                    return new extHostTypes_1.$ML(uri_1.URI.revive(this.b.input.uri), this.b.input.notebookType);
                case 5 /* TabInputKind.NotebookDiffInput */:
                    return new extHostTypes_1.$NL(uri_1.URI.revive(this.b.input.original), uri_1.URI.revive(this.b.input.modified), this.b.input.notebookType);
                case 8 /* TabInputKind.TerminalEditorInput */:
                    return new extHostTypes_1.$OL();
                case 9 /* TabInputKind.InteractiveEditorInput */:
                    return new extHostTypes_1.$PL(uri_1.URI.revive(this.b.input.uri), uri_1.URI.revive(this.b.input.inputBoxUri));
                default:
                    return undefined;
            }
        }
    }
    class ExtHostEditorTabGroup {
        constructor(dto, activeGroupIdGetter) {
            this.c = [];
            this.d = '';
            this.b = dto;
            this.e = activeGroupIdGetter;
            // Construct all tabs from the given dto
            for (const tabDto of dto.tabs) {
                if (tabDto.isActive) {
                    this.d = tabDto.id;
                }
                this.c.push(new ExtHostEditorTab(tabDto, this, () => this.activeTabId()));
            }
        }
        get apiObject() {
            if (!this.a) {
                // Don't want to lose reference to parent `this` in the getters
                const that = this;
                const obj = {
                    get isActive() {
                        // We use a getter function here to always ensure at most 1 active group and prevent iteration for being required
                        return that.b.groupId === that.e();
                    },
                    get viewColumn() {
                        return typeConverters.ViewColumn.to(that.b.viewColumn);
                    },
                    get activeTab() {
                        return that.c.find(tab => tab.tabId === that.d)?.apiObject;
                    },
                    get tabs() {
                        return Object.freeze(that.c.map(tab => tab.apiObject));
                    }
                };
                this.a = Object.freeze(obj);
            }
            return this.a;
        }
        get groupId() {
            return this.b.groupId;
        }
        get tabs() {
            return this.c;
        }
        acceptGroupDtoUpdate(dto) {
            this.b = dto;
        }
        acceptTabOperation(operation) {
            // In the open case we add the tab to the group
            if (operation.kind === 0 /* TabModelOperationKind.TAB_OPEN */) {
                const tab = new ExtHostEditorTab(operation.tabDto, this, () => this.activeTabId());
                // Insert tab at editor index
                this.c.splice(operation.index, 0, tab);
                if (operation.tabDto.isActive) {
                    this.d = tab.tabId;
                }
                return tab;
            }
            else if (operation.kind === 1 /* TabModelOperationKind.TAB_CLOSE */) {
                const tab = this.c.splice(operation.index, 1)[0];
                if (!tab) {
                    throw new Error(`Tab close updated received for index ${operation.index} which does not exist`);
                }
                if (tab.tabId === this.d) {
                    this.d = '';
                }
                return tab;
            }
            else if (operation.kind === 3 /* TabModelOperationKind.TAB_MOVE */) {
                if (operation.oldIndex === undefined) {
                    throw new Error('Invalid old index on move IPC');
                }
                // Splice to remove at old index and insert at new index === moving the tab
                const tab = this.c.splice(operation.oldIndex, 1)[0];
                if (!tab) {
                    throw new Error(`Tab move updated received for index ${operation.oldIndex} which does not exist`);
                }
                this.c.splice(operation.index, 0, tab);
                return tab;
            }
            const tab = this.c.find(extHostTab => extHostTab.tabId === operation.tabDto.id);
            if (!tab) {
                throw new Error('INVALID tab');
            }
            if (operation.tabDto.isActive) {
                this.d = operation.tabDto.id;
            }
            else if (this.d === operation.tabDto.id && !operation.tabDto.isActive) {
                // Events aren't guaranteed to be in order so if we receive a dto that matches the active tab id
                // but isn't active we mark the active tab id as empty. This prevent onDidActiveTabChange from
                // firing incorrectly
                this.d = '';
            }
            tab.acceptDtoUpdate(operation.tabDto);
            return tab;
        }
        // Not a getter since it must be a function to be used as a callback for the tabs
        activeTabId() {
            return this.d;
        }
    }
    let $mcc = class $mcc {
        constructor(extHostRpc) {
            this.b = new event_1.$fd();
            this.c = new event_1.$fd();
            this.e = [];
            this.a = extHostRpc.getProxy(extHost_protocol_1.$1J.MainThreadEditorTabs);
        }
        get tabGroups() {
            if (!this.f) {
                const that = this;
                const obj = {
                    // never changes -> simple value
                    onDidChangeTabGroups: that.c.event,
                    onDidChangeTabs: that.b.event,
                    // dynamic -> getters
                    get all() {
                        return Object.freeze(that.e.map(group => group.apiObject));
                    },
                    get activeTabGroup() {
                        const activeTabGroupId = that.d;
                        const activeTabGroup = (0, types_1.$uf)(that.e.find(candidate => candidate.groupId === activeTabGroupId)?.apiObject);
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
                            return this.j(tabsOrTabGroups, preserveFocus);
                        }
                        else {
                            return this.i(tabsOrTabGroups, preserveFocus);
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
                this.f = Object.freeze(obj);
            }
            return this.f;
        }
        $acceptEditorTabModel(tabGroups) {
            const groupIdsBefore = new Set(this.e.map(group => group.groupId));
            const groupIdsAfter = new Set(tabGroups.map(dto => dto.groupId));
            const diff = (0, collections_1.$J)(groupIdsBefore, groupIdsAfter);
            const closed = this.e.filter(group => diff.removed.includes(group.groupId)).map(group => group.apiObject);
            const opened = [];
            const changed = [];
            this.e = tabGroups.map(tabGroup => {
                const group = new ExtHostEditorTabGroup(tabGroup, () => this.d);
                if (diff.added.includes(group.groupId)) {
                    opened.push(group.apiObject);
                }
                else {
                    changed.push(group.apiObject);
                }
                return group;
            });
            // Set the active tab group id
            const activeTabGroupId = (0, types_1.$uf)(tabGroups.find(group => group.isActive === true)?.groupId);
            if (activeTabGroupId !== undefined && this.d !== activeTabGroupId) {
                this.d = activeTabGroupId;
            }
            this.c.fire(Object.freeze({ opened, closed, changed }));
        }
        $acceptTabGroupUpdate(groupDto) {
            const group = this.e.find(group => group.groupId === groupDto.groupId);
            if (!group) {
                throw new Error('Update Group IPC call received before group creation.');
            }
            group.acceptGroupDtoUpdate(groupDto);
            if (groupDto.isActive) {
                this.d = groupDto.groupId;
            }
            this.c.fire(Object.freeze({ changed: [group.apiObject], opened: [], closed: [] }));
        }
        $acceptTabOperation(operation) {
            const group = this.e.find(group => group.groupId === operation.groupId);
            if (!group) {
                throw new Error('Update Tabs IPC call received before group creation.');
            }
            const tab = group.acceptTabOperation(operation);
            // Construct the tab change event based on the operation
            switch (operation.kind) {
                case 0 /* TabModelOperationKind.TAB_OPEN */:
                    this.b.fire(Object.freeze({
                        opened: [tab.apiObject],
                        closed: [],
                        changed: []
                    }));
                    return;
                case 1 /* TabModelOperationKind.TAB_CLOSE */:
                    this.b.fire(Object.freeze({
                        opened: [],
                        closed: [tab.apiObject],
                        changed: []
                    }));
                    return;
                case 3 /* TabModelOperationKind.TAB_MOVE */:
                case 2 /* TabModelOperationKind.TAB_UPDATE */:
                    this.b.fire(Object.freeze({
                        opened: [],
                        closed: [],
                        changed: [tab.apiObject]
                    }));
                    return;
            }
        }
        g(apiTab) {
            for (const group of this.e) {
                for (const tab of group.tabs) {
                    if (tab.apiObject === apiTab) {
                        return tab;
                    }
                }
            }
            return;
        }
        h(apiTabGroup) {
            return this.e.find(candidate => candidate.apiObject === apiTabGroup);
        }
        async i(tabs, preserveFocus) {
            const extHostTabIds = [];
            for (const tab of tabs) {
                const extHostTab = this.g(tab);
                if (!extHostTab) {
                    throw new Error('Tab close: Invalid tab not found!');
                }
                extHostTabIds.push(extHostTab.tabId);
            }
            return this.a.$closeTab(extHostTabIds, preserveFocus);
        }
        async j(groups, preserverFoucs) {
            const extHostGroupIds = [];
            for (const group of groups) {
                const extHostGroup = this.h(group);
                if (!extHostGroup) {
                    throw new Error('Group close: Invalid group not found!');
                }
                extHostGroupIds.push(extHostGroup.groupId);
            }
            return this.a.$closeGroup(extHostGroupIds, preserverFoucs);
        }
    };
    exports.$mcc = $mcc;
    exports.$mcc = $mcc = __decorate([
        __param(0, extHostRpcService_1.$2L)
    ], $mcc);
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
//# sourceMappingURL=extHostEditorTabs.js.map