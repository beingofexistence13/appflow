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
define(["require", "exports", "vs/workbench/common/editor", "vs/workbench/common/editor/sideBySideEditorInput", "vs/base/common/lifecycle", "vs/platform/storage/common/storage", "vs/platform/registry/common/platform", "vs/base/common/event", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/arrays", "vs/base/common/map", "vs/base/common/objects"], function (require, exports, editor_1, sideBySideEditorInput_1, lifecycle_1, storage_1, platform_1, event_1, editorGroupsService_1, arrays_1, map_1, objects_1) {
    "use strict";
    var $Kyb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Kyb = void 0;
    /**
     * A observer of opened editors across all editor groups by most recently used.
     * Rules:
     * - the last editor in the list is the one most recently activated
     * - the first editor in the list is the one that was activated the longest time ago
     * - an editor that opens inactive will be placed behind the currently active editor
     *
     * The observer may start to close editors based on the workbench.editor.limit setting.
     */
    let $Kyb = class $Kyb extends lifecycle_1.$kc {
        static { $Kyb_1 = this; }
        static { this.a = 'editors.mru'; }
        get count() {
            return this.c.size;
        }
        get editors() {
            return [...this.c.values()];
        }
        hasEditor(editor) {
            const editors = this.f.get(editor.resource);
            return editors?.has(this.h(editor)) ?? false;
        }
        hasEditors(resource) {
            return this.f.has(resource);
        }
        h(arg1, editorId) {
            if (typeof arg1 !== 'string') {
                return this.h(arg1.typeId, arg1.editorId);
            }
            if (editorId) {
                return `${arg1}/${editorId}`;
            }
            return arg1;
        }
        constructor(j, m) {
            super();
            this.j = j;
            this.m = m;
            this.b = new Map();
            this.c = new map_1.$Bi();
            this.f = new map_1.$zi();
            this.g = this.B(new event_1.$fd());
            this.onDidMostRecentlyActiveEditorsChange = this.g.event;
            this.n();
        }
        n() {
            this.B(this.m.onWillSaveState(() => this.G()));
            this.B(this.j.onDidAddGroup(group => this.r(group)));
            this.B(this.j.onDidChangeEditorPartOptions(e => this.t(e)));
            this.j.whenReady.then(() => this.I());
        }
        r(group) {
            // Make sure to add any already existing editor
            // of the new group into our list in LRU order
            const groupEditorsMru = group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */);
            for (let i = groupEditorsMru.length - 1; i >= 0; i--) {
                this.u(group, groupEditorsMru[i], false /* is not active */, true /* is new */);
            }
            // Make sure that active editor is put as first if group is active
            if (this.j.activeGroup === group && group.activeEditor) {
                this.u(group, group.activeEditor, true /* is active */, false /* already added before */);
            }
            // Group Listeners
            this.s(group);
        }
        s(group) {
            const groupDisposables = new lifecycle_1.$jc();
            groupDisposables.add(group.onDidModelChange(e => {
                switch (e.kind) {
                    // Group gets active: put active editor as most recent
                    case 0 /* GroupModelChangeKind.GROUP_ACTIVE */: {
                        if (this.j.activeGroup === group && group.activeEditor) {
                            this.u(group, group.activeEditor, true /* is active */, false /* editor already opened */);
                        }
                        break;
                    }
                    // Editor opens: put it as second most recent
                    //
                    // Also check for maximum allowed number of editors and
                    // start to close oldest ones if needed.
                    case 3 /* GroupModelChangeKind.EDITOR_OPEN */: {
                        if (e.editor) {
                            this.u(group, e.editor, false /* is not active */, true /* is new */);
                            this.D({ groupId: group.id, editor: e.editor }, group.id);
                        }
                        break;
                    }
                }
            }));
            // Editor closes: remove from recently opened
            groupDisposables.add(group.onDidCloseEditor(e => {
                this.y(group, e.editor);
            }));
            // Editor gets active: put active editor as most recent
            // if group is active, otherwise second most recent
            groupDisposables.add(group.onDidActiveEditorChange(e => {
                if (e.editor) {
                    this.u(group, e.editor, this.j.activeGroup === group, false /* editor already opened */);
                }
            }));
            // Make sure to cleanup on dispose
            event_1.Event.once(group.onWillDispose)(() => (0, lifecycle_1.$fc)(groupDisposables));
        }
        t(event) {
            if (!(0, objects_1.$Zm)(event.newPartOptions.limit, event.oldPartOptions.limit)) {
                const activeGroup = this.j.activeGroup;
                let exclude = undefined;
                if (activeGroup.activeEditor) {
                    exclude = { editor: activeGroup.activeEditor, groupId: activeGroup.id };
                }
                this.D(exclude);
            }
        }
        u(group, editor, isActive, isNew) {
            const key = this.C(group, editor);
            const mostRecentEditor = this.c.first;
            // Active or first entry: add to end of map
            if (isActive || !mostRecentEditor) {
                this.c.set(key, key, mostRecentEditor ? 1 /* Touch.AsOld */ : undefined);
            }
            // Otherwise: insert before most recent
            else {
                // we have most recent editors. as such we
                // put this newly opened editor right before
                // the current most recent one because it cannot
                // be the most recently active one unless
                // it becomes active. but it is still more
                // active then any other editor in the list.
                this.c.set(key, key, 1 /* Touch.AsOld */);
                this.c.set(mostRecentEditor, mostRecentEditor, 1 /* Touch.AsOld */);
            }
            // Update in resource map if this is a new editor
            if (isNew) {
                this.w(editor, true);
            }
            // Event
            this.g.fire();
        }
        w(editor, add) {
            // Distill the editor resource and type id with support
            // for side by side editor's primary side too.
            let resource = undefined;
            let typeId = undefined;
            let editorId = undefined;
            if (editor instanceof sideBySideEditorInput_1.$VC) {
                resource = editor.primary.resource;
                typeId = editor.primary.typeId;
                editorId = editor.primary.editorId;
            }
            else {
                resource = editor.resource;
                typeId = editor.typeId;
                editorId = editor.editorId;
            }
            if (!resource) {
                return; // require a resource
            }
            const identifier = this.h(typeId, editorId);
            // Add entry
            if (add) {
                let editorsPerResource = this.f.get(resource);
                if (!editorsPerResource) {
                    editorsPerResource = new Map();
                    this.f.set(resource, editorsPerResource);
                }
                editorsPerResource.set(identifier, (editorsPerResource.get(identifier) ?? 0) + 1);
            }
            // Remove entry
            else {
                const editorsPerResource = this.f.get(resource);
                if (editorsPerResource) {
                    const counter = editorsPerResource.get(identifier) ?? 0;
                    if (counter > 1) {
                        editorsPerResource.set(identifier, counter - 1);
                    }
                    else {
                        editorsPerResource.delete(identifier);
                        if (editorsPerResource.size === 0) {
                            this.f.delete(resource);
                        }
                    }
                }
            }
        }
        y(group, editor) {
            // Update in resource map
            this.w(editor, false);
            // Update in MRU list
            const key = this.z(group, editor);
            if (key) {
                // Remove from most recent editors
                this.c.delete(key);
                // Remove from key map
                const map = this.b.get(group.id);
                if (map && map.delete(key.editor) && map.size === 0) {
                    this.b.delete(group.id);
                }
                // Event
                this.g.fire();
            }
        }
        z(group, editor) {
            const groupMap = this.b.get(group.id);
            if (!groupMap) {
                return undefined;
            }
            return groupMap.get(editor);
        }
        C(group, editor) {
            let groupMap = this.b.get(group.id);
            if (!groupMap) {
                groupMap = new Map();
                this.b.set(group.id, groupMap);
            }
            let key = groupMap.get(editor);
            if (!key) {
                key = { groupId: group.id, editor };
                groupMap.set(editor, key);
            }
            return key;
        }
        async D(exclude, groupId) {
            if (!this.j.partOptions.limit?.enabled ||
                typeof this.j.partOptions.limit.value !== 'number' ||
                this.j.partOptions.limit.value <= 0) {
                return; // return early if not enabled or invalid
            }
            const limit = this.j.partOptions.limit.value;
            // In editor group
            if (this.j.partOptions.limit?.perEditorGroup) {
                // For specific editor groups
                if (typeof groupId === 'number') {
                    const group = this.j.getGroup(groupId);
                    if (group) {
                        await this.F(limit, group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).map(editor => ({ editor, groupId })), exclude);
                    }
                }
                // For all editor groups
                else {
                    for (const group of this.j.groups) {
                        await this.D(exclude, group.id);
                    }
                }
            }
            // Across all editor groups
            else {
                await this.F(limit, [...this.c.values()], exclude);
            }
        }
        async F(limit, mostRecentEditors, exclude) {
            // Check for `excludeDirty` setting and apply it by excluding
            // any recent editor that is dirty from the opened editors limit
            let mostRecentEditorsCountingForLimit;
            if (this.j.partOptions.limit?.excludeDirty) {
                mostRecentEditorsCountingForLimit = mostRecentEditors.filter(({ editor }) => {
                    if ((editor.isDirty() && !editor.isSaving()) || editor.hasCapability(512 /* EditorInputCapabilities.Scratchpad */)) {
                        return false; // not dirty editors (unless in the process of saving) or scratchpads
                    }
                    return true;
                });
            }
            else {
                mostRecentEditorsCountingForLimit = mostRecentEditors;
            }
            if (limit >= mostRecentEditorsCountingForLimit.length) {
                return; // only if opened editors exceed setting and is valid and enabled
            }
            // Extract least recently used editors that can be closed
            const leastRecentlyClosableEditors = mostRecentEditorsCountingForLimit.reverse().filter(({ editor, groupId }) => {
                if ((editor.isDirty() && !editor.isSaving()) || editor.hasCapability(512 /* EditorInputCapabilities.Scratchpad */)) {
                    return false; // not dirty editors (unless in the process of saving) or scratchpads
                }
                if (exclude && editor === exclude.editor && groupId === exclude.groupId) {
                    return false; // never the editor that should be excluded
                }
                if (this.j.getGroup(groupId)?.isSticky(editor)) {
                    return false; // never sticky editors
                }
                return true;
            });
            // Close editors until we reached the limit again
            let editorsToCloseCount = mostRecentEditorsCountingForLimit.length - limit;
            const mapGroupToEditorsToClose = new Map();
            for (const { groupId, editor } of leastRecentlyClosableEditors) {
                let editorsInGroupToClose = mapGroupToEditorsToClose.get(groupId);
                if (!editorsInGroupToClose) {
                    editorsInGroupToClose = [];
                    mapGroupToEditorsToClose.set(groupId, editorsInGroupToClose);
                }
                editorsInGroupToClose.push(editor);
                editorsToCloseCount--;
                if (editorsToCloseCount === 0) {
                    break; // limit reached
                }
            }
            for (const [groupId, editors] of mapGroupToEditorsToClose) {
                const group = this.j.getGroup(groupId);
                if (group) {
                    await group.closeEditors(editors, { preserveFocus: true });
                }
            }
        }
        G() {
            if (this.c.isEmpty()) {
                this.m.remove($Kyb_1.a, 1 /* StorageScope.WORKSPACE */);
            }
            else {
                this.m.store($Kyb_1.a, JSON.stringify(this.H()), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
        }
        H() {
            const registry = platform_1.$8m.as(editor_1.$GE.EditorFactory);
            const entries = [...this.c.values()];
            const mapGroupToSerializableEditorsOfGroup = new Map();
            return {
                entries: (0, arrays_1.$Fb)(entries.map(({ editor, groupId }) => {
                    // Find group for entry
                    const group = this.j.getGroup(groupId);
                    if (!group) {
                        return undefined;
                    }
                    // Find serializable editors of group
                    let serializableEditorsOfGroup = mapGroupToSerializableEditorsOfGroup.get(group);
                    if (!serializableEditorsOfGroup) {
                        serializableEditorsOfGroup = group.getEditors(1 /* EditorsOrder.SEQUENTIAL */).filter(editor => {
                            const editorSerializer = registry.getEditorSerializer(editor);
                            return editorSerializer?.canSerialize(editor);
                        });
                        mapGroupToSerializableEditorsOfGroup.set(group, serializableEditorsOfGroup);
                    }
                    // Only store the index of the editor of that group
                    // which can be undefined if the editor is not serializable
                    const index = serializableEditorsOfGroup.indexOf(editor);
                    if (index === -1) {
                        return undefined;
                    }
                    return { groupId, index };
                }))
            };
        }
        I() {
            const serialized = this.m.get($Kyb_1.a, 1 /* StorageScope.WORKSPACE */);
            // Previous state: Load editors map from persisted state
            if (serialized) {
                this.J(JSON.parse(serialized));
            }
            // No previous state: best we can do is add each editor
            // from oldest to most recently used editor group
            else {
                const groups = this.j.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
                for (let i = groups.length - 1; i >= 0; i--) {
                    const group = groups[i];
                    const groupEditorsMru = group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */);
                    for (let i = groupEditorsMru.length - 1; i >= 0; i--) {
                        this.u(group, groupEditorsMru[i], true /* enforce as active to preserve order */, true /* is new */);
                    }
                }
            }
            // Ensure we listen on group changes for those that exist on startup
            for (const group of this.j.groups) {
                this.s(group);
            }
        }
        J(serialized) {
            const mapValues = [];
            for (const { groupId, index } of serialized.entries) {
                // Find group for entry
                const group = this.j.getGroup(groupId);
                if (!group) {
                    continue;
                }
                // Find editor for entry
                const editor = group.getEditorByIndex(index);
                if (!editor) {
                    continue;
                }
                // Make sure key is registered as well
                const editorIdentifier = this.C(group, editor);
                mapValues.push([editorIdentifier, editorIdentifier]);
                // Update in resource map
                this.w(editor, true);
            }
            // Fill map with deserialized values
            this.c.fromJSON(mapValues);
        }
    };
    exports.$Kyb = $Kyb;
    exports.$Kyb = $Kyb = $Kyb_1 = __decorate([
        __param(0, editorGroupsService_1.$5C),
        __param(1, storage_1.$Vo)
    ], $Kyb);
});
//# sourceMappingURL=editorsObserver.js.map