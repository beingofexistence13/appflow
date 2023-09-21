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
    var EditorsObserver_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorsObserver = void 0;
    /**
     * A observer of opened editors across all editor groups by most recently used.
     * Rules:
     * - the last editor in the list is the one most recently activated
     * - the first editor in the list is the one that was activated the longest time ago
     * - an editor that opens inactive will be placed behind the currently active editor
     *
     * The observer may start to close editors based on the workbench.editor.limit setting.
     */
    let EditorsObserver = class EditorsObserver extends lifecycle_1.Disposable {
        static { EditorsObserver_1 = this; }
        static { this.STORAGE_KEY = 'editors.mru'; }
        get count() {
            return this.mostRecentEditorsMap.size;
        }
        get editors() {
            return [...this.mostRecentEditorsMap.values()];
        }
        hasEditor(editor) {
            const editors = this.editorsPerResourceCounter.get(editor.resource);
            return editors?.has(this.toIdentifier(editor)) ?? false;
        }
        hasEditors(resource) {
            return this.editorsPerResourceCounter.has(resource);
        }
        toIdentifier(arg1, editorId) {
            if (typeof arg1 !== 'string') {
                return this.toIdentifier(arg1.typeId, arg1.editorId);
            }
            if (editorId) {
                return `${arg1}/${editorId}`;
            }
            return arg1;
        }
        constructor(editorGroupsService, storageService) {
            super();
            this.editorGroupsService = editorGroupsService;
            this.storageService = storageService;
            this.keyMap = new Map();
            this.mostRecentEditorsMap = new map_1.LinkedMap();
            this.editorsPerResourceCounter = new map_1.ResourceMap();
            this._onDidMostRecentlyActiveEditorsChange = this._register(new event_1.Emitter());
            this.onDidMostRecentlyActiveEditorsChange = this._onDidMostRecentlyActiveEditorsChange.event;
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.storageService.onWillSaveState(() => this.saveState()));
            this._register(this.editorGroupsService.onDidAddGroup(group => this.onGroupAdded(group)));
            this._register(this.editorGroupsService.onDidChangeEditorPartOptions(e => this.onDidChangeEditorPartOptions(e)));
            this.editorGroupsService.whenReady.then(() => this.loadState());
        }
        onGroupAdded(group) {
            // Make sure to add any already existing editor
            // of the new group into our list in LRU order
            const groupEditorsMru = group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */);
            for (let i = groupEditorsMru.length - 1; i >= 0; i--) {
                this.addMostRecentEditor(group, groupEditorsMru[i], false /* is not active */, true /* is new */);
            }
            // Make sure that active editor is put as first if group is active
            if (this.editorGroupsService.activeGroup === group && group.activeEditor) {
                this.addMostRecentEditor(group, group.activeEditor, true /* is active */, false /* already added before */);
            }
            // Group Listeners
            this.registerGroupListeners(group);
        }
        registerGroupListeners(group) {
            const groupDisposables = new lifecycle_1.DisposableStore();
            groupDisposables.add(group.onDidModelChange(e => {
                switch (e.kind) {
                    // Group gets active: put active editor as most recent
                    case 0 /* GroupModelChangeKind.GROUP_ACTIVE */: {
                        if (this.editorGroupsService.activeGroup === group && group.activeEditor) {
                            this.addMostRecentEditor(group, group.activeEditor, true /* is active */, false /* editor already opened */);
                        }
                        break;
                    }
                    // Editor opens: put it as second most recent
                    //
                    // Also check for maximum allowed number of editors and
                    // start to close oldest ones if needed.
                    case 3 /* GroupModelChangeKind.EDITOR_OPEN */: {
                        if (e.editor) {
                            this.addMostRecentEditor(group, e.editor, false /* is not active */, true /* is new */);
                            this.ensureOpenedEditorsLimit({ groupId: group.id, editor: e.editor }, group.id);
                        }
                        break;
                    }
                }
            }));
            // Editor closes: remove from recently opened
            groupDisposables.add(group.onDidCloseEditor(e => {
                this.removeMostRecentEditor(group, e.editor);
            }));
            // Editor gets active: put active editor as most recent
            // if group is active, otherwise second most recent
            groupDisposables.add(group.onDidActiveEditorChange(e => {
                if (e.editor) {
                    this.addMostRecentEditor(group, e.editor, this.editorGroupsService.activeGroup === group, false /* editor already opened */);
                }
            }));
            // Make sure to cleanup on dispose
            event_1.Event.once(group.onWillDispose)(() => (0, lifecycle_1.dispose)(groupDisposables));
        }
        onDidChangeEditorPartOptions(event) {
            if (!(0, objects_1.equals)(event.newPartOptions.limit, event.oldPartOptions.limit)) {
                const activeGroup = this.editorGroupsService.activeGroup;
                let exclude = undefined;
                if (activeGroup.activeEditor) {
                    exclude = { editor: activeGroup.activeEditor, groupId: activeGroup.id };
                }
                this.ensureOpenedEditorsLimit(exclude);
            }
        }
        addMostRecentEditor(group, editor, isActive, isNew) {
            const key = this.ensureKey(group, editor);
            const mostRecentEditor = this.mostRecentEditorsMap.first;
            // Active or first entry: add to end of map
            if (isActive || !mostRecentEditor) {
                this.mostRecentEditorsMap.set(key, key, mostRecentEditor ? 1 /* Touch.AsOld */ : undefined);
            }
            // Otherwise: insert before most recent
            else {
                // we have most recent editors. as such we
                // put this newly opened editor right before
                // the current most recent one because it cannot
                // be the most recently active one unless
                // it becomes active. but it is still more
                // active then any other editor in the list.
                this.mostRecentEditorsMap.set(key, key, 1 /* Touch.AsOld */);
                this.mostRecentEditorsMap.set(mostRecentEditor, mostRecentEditor, 1 /* Touch.AsOld */);
            }
            // Update in resource map if this is a new editor
            if (isNew) {
                this.updateEditorResourcesMap(editor, true);
            }
            // Event
            this._onDidMostRecentlyActiveEditorsChange.fire();
        }
        updateEditorResourcesMap(editor, add) {
            // Distill the editor resource and type id with support
            // for side by side editor's primary side too.
            let resource = undefined;
            let typeId = undefined;
            let editorId = undefined;
            if (editor instanceof sideBySideEditorInput_1.SideBySideEditorInput) {
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
            const identifier = this.toIdentifier(typeId, editorId);
            // Add entry
            if (add) {
                let editorsPerResource = this.editorsPerResourceCounter.get(resource);
                if (!editorsPerResource) {
                    editorsPerResource = new Map();
                    this.editorsPerResourceCounter.set(resource, editorsPerResource);
                }
                editorsPerResource.set(identifier, (editorsPerResource.get(identifier) ?? 0) + 1);
            }
            // Remove entry
            else {
                const editorsPerResource = this.editorsPerResourceCounter.get(resource);
                if (editorsPerResource) {
                    const counter = editorsPerResource.get(identifier) ?? 0;
                    if (counter > 1) {
                        editorsPerResource.set(identifier, counter - 1);
                    }
                    else {
                        editorsPerResource.delete(identifier);
                        if (editorsPerResource.size === 0) {
                            this.editorsPerResourceCounter.delete(resource);
                        }
                    }
                }
            }
        }
        removeMostRecentEditor(group, editor) {
            // Update in resource map
            this.updateEditorResourcesMap(editor, false);
            // Update in MRU list
            const key = this.findKey(group, editor);
            if (key) {
                // Remove from most recent editors
                this.mostRecentEditorsMap.delete(key);
                // Remove from key map
                const map = this.keyMap.get(group.id);
                if (map && map.delete(key.editor) && map.size === 0) {
                    this.keyMap.delete(group.id);
                }
                // Event
                this._onDidMostRecentlyActiveEditorsChange.fire();
            }
        }
        findKey(group, editor) {
            const groupMap = this.keyMap.get(group.id);
            if (!groupMap) {
                return undefined;
            }
            return groupMap.get(editor);
        }
        ensureKey(group, editor) {
            let groupMap = this.keyMap.get(group.id);
            if (!groupMap) {
                groupMap = new Map();
                this.keyMap.set(group.id, groupMap);
            }
            let key = groupMap.get(editor);
            if (!key) {
                key = { groupId: group.id, editor };
                groupMap.set(editor, key);
            }
            return key;
        }
        async ensureOpenedEditorsLimit(exclude, groupId) {
            if (!this.editorGroupsService.partOptions.limit?.enabled ||
                typeof this.editorGroupsService.partOptions.limit.value !== 'number' ||
                this.editorGroupsService.partOptions.limit.value <= 0) {
                return; // return early if not enabled or invalid
            }
            const limit = this.editorGroupsService.partOptions.limit.value;
            // In editor group
            if (this.editorGroupsService.partOptions.limit?.perEditorGroup) {
                // For specific editor groups
                if (typeof groupId === 'number') {
                    const group = this.editorGroupsService.getGroup(groupId);
                    if (group) {
                        await this.doEnsureOpenedEditorsLimit(limit, group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).map(editor => ({ editor, groupId })), exclude);
                    }
                }
                // For all editor groups
                else {
                    for (const group of this.editorGroupsService.groups) {
                        await this.ensureOpenedEditorsLimit(exclude, group.id);
                    }
                }
            }
            // Across all editor groups
            else {
                await this.doEnsureOpenedEditorsLimit(limit, [...this.mostRecentEditorsMap.values()], exclude);
            }
        }
        async doEnsureOpenedEditorsLimit(limit, mostRecentEditors, exclude) {
            // Check for `excludeDirty` setting and apply it by excluding
            // any recent editor that is dirty from the opened editors limit
            let mostRecentEditorsCountingForLimit;
            if (this.editorGroupsService.partOptions.limit?.excludeDirty) {
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
                if (this.editorGroupsService.getGroup(groupId)?.isSticky(editor)) {
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
                const group = this.editorGroupsService.getGroup(groupId);
                if (group) {
                    await group.closeEditors(editors, { preserveFocus: true });
                }
            }
        }
        saveState() {
            if (this.mostRecentEditorsMap.isEmpty()) {
                this.storageService.remove(EditorsObserver_1.STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
            }
            else {
                this.storageService.store(EditorsObserver_1.STORAGE_KEY, JSON.stringify(this.serialize()), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
        }
        serialize() {
            const registry = platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory);
            const entries = [...this.mostRecentEditorsMap.values()];
            const mapGroupToSerializableEditorsOfGroup = new Map();
            return {
                entries: (0, arrays_1.coalesce)(entries.map(({ editor, groupId }) => {
                    // Find group for entry
                    const group = this.editorGroupsService.getGroup(groupId);
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
        loadState() {
            const serialized = this.storageService.get(EditorsObserver_1.STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
            // Previous state: Load editors map from persisted state
            if (serialized) {
                this.deserialize(JSON.parse(serialized));
            }
            // No previous state: best we can do is add each editor
            // from oldest to most recently used editor group
            else {
                const groups = this.editorGroupsService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
                for (let i = groups.length - 1; i >= 0; i--) {
                    const group = groups[i];
                    const groupEditorsMru = group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */);
                    for (let i = groupEditorsMru.length - 1; i >= 0; i--) {
                        this.addMostRecentEditor(group, groupEditorsMru[i], true /* enforce as active to preserve order */, true /* is new */);
                    }
                }
            }
            // Ensure we listen on group changes for those that exist on startup
            for (const group of this.editorGroupsService.groups) {
                this.registerGroupListeners(group);
            }
        }
        deserialize(serialized) {
            const mapValues = [];
            for (const { groupId, index } of serialized.entries) {
                // Find group for entry
                const group = this.editorGroupsService.getGroup(groupId);
                if (!group) {
                    continue;
                }
                // Find editor for entry
                const editor = group.getEditorByIndex(index);
                if (!editor) {
                    continue;
                }
                // Make sure key is registered as well
                const editorIdentifier = this.ensureKey(group, editor);
                mapValues.push([editorIdentifier, editorIdentifier]);
                // Update in resource map
                this.updateEditorResourcesMap(editor, true);
            }
            // Fill map with deserialized values
            this.mostRecentEditorsMap.fromJSON(mapValues);
        }
    };
    exports.EditorsObserver = EditorsObserver;
    exports.EditorsObserver = EditorsObserver = EditorsObserver_1 = __decorate([
        __param(0, editorGroupsService_1.IEditorGroupsService),
        __param(1, storage_1.IStorageService)
    ], EditorsObserver);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yc09ic2VydmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvZWRpdG9yL2VkaXRvcnNPYnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBeUJoRzs7Ozs7Ozs7T0FRRztJQUNJLElBQU0sZUFBZSxHQUFyQixNQUFNLGVBQWdCLFNBQVEsc0JBQVU7O2lCQUV0QixnQkFBVyxHQUFHLGFBQWEsQUFBaEIsQ0FBaUI7UUFTcEQsSUFBSSxLQUFLO1lBQ1IsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxJQUFJLE9BQU87WUFDVixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRUQsU0FBUyxDQUFDLE1BQXNDO1lBQy9DLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXBFLE9BQU8sT0FBTyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDO1FBQ3pELENBQUM7UUFFRCxVQUFVLENBQUMsUUFBYTtZQUN2QixPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUlPLFlBQVksQ0FBQyxJQUE2QyxFQUFFLFFBQTZCO1lBQ2hHLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO2dCQUM3QixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDckQ7WUFFRCxJQUFJ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