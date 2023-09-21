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
define(["require", "exports", "vs/nls", "vs/base/common/uri", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/history/common/history", "vs/platform/files/common/files", "vs/platform/workspace/common/workspace", "vs/base/common/lifecycle", "vs/platform/storage/common/storage", "vs/base/common/event", "vs/platform/configuration/common/configuration", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/search/common/search", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/layout/browser/layoutService", "vs/platform/contextkey/common/contextkey", "vs/base/common/arrays", "vs/platform/instantiation/common/extensions", "vs/base/browser/dom", "vs/platform/workspaces/common/workspaces", "vs/base/common/network", "vs/base/common/errors", "vs/base/common/async", "vs/workbench/common/resources", "vs/workbench/services/path/common/pathService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/log/common/log"], function (require, exports, nls_1, uri_1, editor_1, editorService_1, history_1, files_1, workspace_1, lifecycle_1, storage_1, event_1, configuration_1, editorGroupsService_1, search_1, instantiation_1, layoutService_1, contextkey_1, arrays_1, extensions_1, dom_1, workspaces_1, network_1, errors_1, async_1, resources_1, pathService_1, uriIdentity_1, lifecycle_2, log_1) {
    "use strict";
    var HistoryService_1, EditorNavigationStack_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorNavigationStack = exports.HistoryService = void 0;
    let HistoryService = class HistoryService extends lifecycle_1.Disposable {
        static { HistoryService_1 = this; }
        static { this.MOUSE_NAVIGATION_SETTING = 'workbench.editor.mouseBackForwardToNavigate'; }
        static { this.NAVIGATION_SCOPE_SETTING = 'workbench.editor.navigationScope'; }
        constructor(editorService, editorGroupService, contextService, storageService, configurationService, fileService, workspacesService, instantiationService, layoutService, contextKeyService) {
            super();
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.contextService = contextService;
            this.storageService = storageService;
            this.configurationService = configurationService;
            this.fileService = fileService;
            this.workspacesService = workspacesService;
            this.instantiationService = instantiationService;
            this.layoutService = layoutService;
            this.contextKeyService = contextKeyService;
            this.activeEditorListeners = this._register(new lifecycle_1.DisposableStore());
            this.lastActiveEditor = undefined;
            this.editorHelper = this.instantiationService.createInstance(EditorHelper);
            //#region History Context Keys
            this.canNavigateBackContextKey = (new contextkey_1.RawContextKey('canNavigateBack', false, (0, nls_1.localize)('canNavigateBack', "Whether it is possible to navigate back in editor history"))).bindTo(this.contextKeyService);
            this.canNavigateForwardContextKey = (new contextkey_1.RawContextKey('canNavigateForward', false, (0, nls_1.localize)('canNavigateForward', "Whether it is possible to navigate forward in editor history"))).bindTo(this.contextKeyService);
            this.canNavigateBackInNavigationsContextKey = (new contextkey_1.RawContextKey('canNavigateBackInNavigationLocations', false, (0, nls_1.localize)('canNavigateBackInNavigationLocations', "Whether it is possible to navigate back in editor navigation locations history"))).bindTo(this.contextKeyService);
            this.canNavigateForwardInNavigationsContextKey = (new contextkey_1.RawContextKey('canNavigateForwardInNavigationLocations', false, (0, nls_1.localize)('canNavigateForwardInNavigationLocations', "Whether it is possible to navigate forward in editor navigation locations history"))).bindTo(this.contextKeyService);
            this.canNavigateToLastNavigationLocationContextKey = (new contextkey_1.RawContextKey('canNavigateToLastNavigationLocation', false, (0, nls_1.localize)('canNavigateToLastNavigationLocation', "Whether it is possible to navigate to the last editor navigation location"))).bindTo(this.contextKeyService);
            this.canNavigateBackInEditsContextKey = (new contextkey_1.RawContextKey('canNavigateBackInEditLocations', false, (0, nls_1.localize)('canNavigateBackInEditLocations', "Whether it is possible to navigate back in editor edit locations history"))).bindTo(this.contextKeyService);
            this.canNavigateForwardInEditsContextKey = (new contextkey_1.RawContextKey('canNavigateForwardInEditLocations', false, (0, nls_1.localize)('canNavigateForwardInEditLocations', "Whether it is possible to navigate forward in editor edit locations history"))).bindTo(this.contextKeyService);
            this.canNavigateToLastEditLocationContextKey = (new contextkey_1.RawContextKey('canNavigateToLastEditLocation', false, (0, nls_1.localize)('canNavigateToLastEditLocation', "Whether it is possible to navigate to the last editor edit location"))).bindTo(this.contextKeyService);
            this.canReopenClosedEditorContextKey = (new contextkey_1.RawContextKey('canReopenClosedEditor', false, (0, nls_1.localize)('canReopenClosedEditor', "Whether it is possible to reopen the last closed editor"))).bindTo(this.contextKeyService);
            //#endregion
            //#region Editor History Navigation (limit: 50)
            this._onDidChangeEditorNavigationStack = this._register(new event_1.Emitter());
            this.onDidChangeEditorNavigationStack = this._onDidChangeEditorNavigationStack.event;
            this.defaultScopedEditorNavigationStack = undefined;
            this.editorGroupScopedNavigationStacks = new Map();
            this.editorScopedNavigationStacks = new Map();
            this.editorNavigationScope = 0 /* GoScope.DEFAULT */;
            //#endregion
            //#region Navigation: Next/Previous Used Editor
            this.recentlyUsedEditorsStack = undefined;
            this.recentlyUsedEditorsStackIndex = 0;
            this.recentlyUsedEditorsInGroupStack = undefined;
            this.recentlyUsedEditorsInGroupStackIndex = 0;
            this.navigatingInRecentlyUsedEditorsStack = false;
            this.navigatingInRecentlyUsedEditorsInGroupStack = false;
            this.recentlyClosedEditors = [];
            this.ignoreEditorCloseEvent = false;
            this.history = undefined;
            this.editorHistoryListeners = new Map();
            this.resourceExcludeMatcher = this._register(new async_1.IdleValue(() => {
                const matcher = this._register(this.instantiationService.createInstance(resources_1.ResourceGlobMatcher, root => (0, search_1.getExcludes)(root ? this.configurationService.getValue({ resource: root }) : this.configurationService.getValue()) || Object.create(null), event => event.affectsConfiguration(files_1.FILES_EXCLUDE_CONFIG) || event.affectsConfiguration(search_1.SEARCH_EXCLUDE_CONFIG)));
                this._register(matcher.onExpressionChange(() => this.removeExcludedFromHistory()));
                return matcher;
            }));
            this.registerListeners();
            // if the service is created late enough that an editor is already opened
            // make sure to trigger the onActiveEditorChanged() to track the editor
            // properly (fixes https://github.com/microsoft/vscode/issues/59908)
            if (this.editorService.activeEditorPane) {
                this.onDidActiveEditorChange();
            }
        }
        registerListeners() {
            // Mouse back/forward support
            this.registerMouseNavigationListener();
            // Editor changes
            this._register(this.editorService.onDidActiveEditorChange(() => this.onDidActiveEditorChange()));
            this._register(this.editorService.onDidOpenEditorFail(event => this.remove(event.editor)));
            this._register(this.editorService.onDidCloseEditor(event => this.onDidCloseEditor(event)));
            this._register(this.editorService.onDidMostRecentlyActiveEditorsChange(() => this.handleEditorEventInRecentEditorsStack()));
            // Editor group changes
            this._register(this.editorGroupService.onDidRemoveGroup(e => this.onDidRemoveGroup(e)));
            // File changes
            this._register(this.fileService.onDidFilesChange(event => this.onDidFilesChange(event)));
            this._register(this.fileService.onDidRunOperation(event => this.onDidFilesChange(event)));
            // Storage
            this._register(this.storageService.onWillSaveState(() => this.saveState()));
            // Configuration
            this.registerEditorNavigationScopeChangeListener();
            // Context keys
            this._register(this.onDidChangeEditorNavigationStack(() => this.updateContextKeys()));
            this._register(this.editorGroupService.onDidChangeActiveGroup(() => this.updateContextKeys()));
        }
        onDidCloseEditor(e) {
            this.handleEditorCloseEventInHistory(e);
            this.handleEditorCloseEventInReopen(e);
        }
        registerMouseNavigationListener() {
            const mouseBackForwardSupportListener = this._register(new lifecycle_1.DisposableStore());
            const handleMouseBackForwardSupport = () => {
                mouseBackForwardSupportListener.clear();
                if (this.configurationService.getValue(HistoryService_1.MOUSE_NAVIGATION_SETTING)) {
                    mouseBackForwardSupportListener.add((0, dom_1.addDisposableListener)(this.layoutService.container, dom_1.EventType.MOUSE_DOWN, e => this.onMouseDownOrUp(e, true)));
                    mouseBackForwardSupportListener.add((0, dom_1.addDisposableListener)(this.layoutService.container, dom_1.EventType.MOUSE_UP, e => this.onMouseDownOrUp(e, false)));
                }
            };
            this._register(this.configurationService.onDidChangeConfiguration(event => {
                if (event.affectsConfiguration(HistoryService_1.MOUSE_NAVIGATION_SETTING)) {
                    handleMouseBackForwardSupport();
                }
            }));
            handleMouseBackForwardSupport();
        }
        onMouseDownOrUp(event, isMouseDown) {
            // Support to navigate in history when mouse buttons 4/5 are pressed
            // We want to trigger this on mouse down for a faster experience
            // but we also need to prevent mouse up from triggering the default
            // which is to navigate in the browser history.
            switch (event.button) {
                case 3:
                    dom_1.EventHelper.stop(event);
                    if (isMouseDown) {
                        this.goBack();
                    }
                    break;
                case 4:
                    dom_1.EventHelper.stop(event);
                    if (isMouseDown) {
                        this.goForward();
                    }
                    break;
            }
        }
        onDidRemoveGroup(group) {
            this.handleEditorGroupRemoveInNavigationStacks(group);
        }
        onDidActiveEditorChange() {
            const activeEditorGroup = this.editorGroupService.activeGroup;
            const activeEditorPane = activeEditorGroup.activeEditorPane;
            if (this.lastActiveEditor && this.editorHelper.matchesEditorIdentifier(this.lastActiveEditor, activeEditorPane)) {
                return; // return if the active editor is still the same
            }
            // Remember as last active editor (can be undefined if none opened)
            this.lastActiveEditor = activeEditorPane?.input && activeEditorPane.group ? { editor: activeEditorPane.input, groupId: activeEditorPane.group.id } : undefined;
            // Dispose old listeners
            this.activeEditorListeners.clear();
            // Handle editor change
            this.handleActiveEditorChange(activeEditorGroup, activeEditorPane);
            // Listen to selection changes if the editor pane
            // is having a selection concept.
            if ((0, editor_1.isEditorPaneWithSelection)(activeEditorPane)) {
                this.activeEditorListeners.add(activeEditorPane.onDidChangeSelection(e => this.handleActiveEditorSelectionChangeEvent(activeEditorGroup, activeEditorPane, e)));
            }
            // Context keys
            this.updateContextKeys();
        }
        onDidFilesChange(event) {
            // External file changes (watcher)
            if (event instanceof files_1.FileChangesEvent) {
                if (event.gotDeleted()) {
                    this.remove(event);
                }
            }
            // Internal file changes (e.g. explorer)
            else {
                // Delete
                if (event.isOperation(1 /* FileOperation.DELETE */)) {
                    this.remove(event);
                }
                // Move
                else if (event.isOperation(2 /* FileOperation.MOVE */) && event.target.isFile) {
                    this.move(event);
                }
            }
        }
        handleActiveEditorChange(group, editorPane) {
            this.handleActiveEditorChangeInHistory(editorPane);
            this.handleActiveEditorChangeInNavigationStacks(group, editorPane);
        }
        handleActiveEditorSelectionChangeEvent(group, editorPane, event) {
            this.handleActiveEditorSelectionChangeInNavigationStacks(group, editorPane, event);
        }
        move(event) {
            this.moveInHistory(event);
            this.moveInEditorNavigationStacks(event);
        }
        remove(arg1) {
            this.removeFromHistory(arg1);
            this.removeFromEditorNavigationStacks(arg1);
            this.removeFromRecentlyClosedEditors(arg1);
            this.removeFromRecentlyOpened(arg1);
        }
        removeFromRecentlyOpened(arg1) {
            let resource = undefined;
            if ((0, editor_1.isEditorInput)(arg1)) {
                resource = editor_1.EditorResourceAccessor.getOriginalUri(arg1);
            }
            else if (arg1 instanceof files_1.FileChangesEvent) {
                // Ignore for now (recently opened are most often out of workspace files anyway for which there are no file events)
            }
            else {
                resource = arg1.resource;
            }
            if (resource) {
                this.workspacesService.removeRecentlyOpened([resource]);
            }
        }
        clear() {
            // History
            this.clearRecentlyOpened();
            // Navigation (next, previous)
            this.clearEditorNavigationStacks();
            // Recently closed editors
            this.recentlyClosedEditors = [];
            // Context Keys
            this.updateContextKeys();
        }
        updateContextKeys() {
            this.contextKeyService.bufferChangeEvents(() => {
                const activeStack = this.getStack();
                this.canNavigateBackContextKey.set(activeStack.canGoBack(0 /* GoFilter.NONE */));
                this.canNavigateForwardContextKey.set(activeStack.canGoForward(0 /* GoFilter.NONE */));
                this.canNavigateBackInNavigationsContextKey.set(activeStack.canGoBack(2 /* GoFilter.NAVIGATION */));
                this.canNavigateForwardInNavigationsContextKey.set(activeStack.canGoForward(2 /* GoFilter.NAVIGATION */));
                this.canNavigateToLastNavigationLocationContextKey.set(activeStack.canGoLast(2 /* GoFilter.NAVIGATION */));
                this.canNavigateBackInEditsContextKey.set(activeStack.canGoBack(1 /* GoFilter.EDITS */));
                this.canNavigateForwardInEditsContextKey.set(activeStack.canGoForward(1 /* GoFilter.EDITS */));
                this.canNavigateToLastEditLocationContextKey.set(activeStack.canGoLast(1 /* GoFilter.EDITS */));
                this.canReopenClosedEditorContextKey.set(this.recentlyClosedEditors.length > 0);
            });
        }
        registerEditorNavigationScopeChangeListener() {
            const handleEditorNavigationScopeChange = () => {
                // Ensure to start fresh when setting changes
                this.disposeEditorNavigationStacks();
                // Update scope
                const configuredScope = this.configurationService.getValue(HistoryService_1.NAVIGATION_SCOPE_SETTING);
                if (configuredScope === 'editorGroup') {
                    this.editorNavigationScope = 1 /* GoScope.EDITOR_GROUP */;
                }
                else if (configuredScope === 'editor') {
                    this.editorNavigationScope = 2 /* GoScope.EDITOR */;
                }
                else {
                    this.editorNavigationScope = 0 /* GoScope.DEFAULT */;
                }
            };
            this._register(this.configurationService.onDidChangeConfiguration(event => {
                if (event.affectsConfiguration(HistoryService_1.NAVIGATION_SCOPE_SETTING)) {
                    handleEditorNavigationScopeChange();
                }
            }));
            handleEditorNavigationScopeChange();
        }
        getStack(group = this.editorGroupService.activeGroup, editor = group.activeEditor) {
            switch (this.editorNavigationScope) {
                // Per Editor
                case 2 /* GoScope.EDITOR */: {
                    if (!editor) {
                        return new NoOpEditorNavigationStacks();
                    }
                    let stacksForGroup = this.editorScopedNavigationStacks.get(group.id);
                    if (!stacksForGroup) {
                        stacksForGroup = new Map();
                        this.editorScopedNavigationStacks.set(group.id, stacksForGroup);
                    }
                    let stack = stacksForGroup.get(editor)?.stack;
                    if (!stack) {
                        const disposable = new lifecycle_1.DisposableStore();
                        stack = disposable.add(this.instantiationService.createInstance(EditorNavigationStacks, 2 /* GoScope.EDITOR */));
                        disposable.add(stack.onDidChange(() => this._onDidChangeEditorNavigationStack.fire()));
                        stacksForGroup.set(editor, { stack, disposable });
                    }
                    return stack;
                }
                // Per Editor Group
                case 1 /* GoScope.EDITOR_GROUP */: {
                    let stack = this.editorGroupScopedNavigationStacks.get(group.id)?.stack;
                    if (!stack) {
                        const disposable = new lifecycle_1.DisposableStore();
                        stack = disposable.add(this.instantiationService.createInstance(EditorNavigationStacks, 1 /* GoScope.EDITOR_GROUP */));
                        disposable.add(stack.onDidChange(() => this._onDidChangeEditorNavigationStack.fire()));
                        this.editorGroupScopedNavigationStacks.set(group.id, { stack, disposable });
                    }
                    return stack;
                }
                // Global
                case 0 /* GoScope.DEFAULT */: {
                    if (!this.defaultScopedEditorNavigationStack) {
                        this.defaultScopedEditorNavigationStack = this._register(this.instantiationService.createInstance(EditorNavigationStacks, 0 /* GoScope.DEFAULT */));
                        this._register(this.defaultScopedEditorNavigationStack.onDidChange(() => this._onDidChangeEditorNavigationStack.fire()));
                    }
                    return this.defaultScopedEditorNavigationStack;
                }
            }
        }
        goForward(filter) {
            return this.getStack().goForward(filter);
        }
        goBack(filter) {
            return this.getStack().goBack(filter);
        }
        goPrevious(filter) {
            return this.getStack().goPrevious(filter);
        }
        goLast(filter) {
            return this.getStack().goLast(filter);
        }
        handleActiveEditorChangeInNavigationStacks(group, editorPane) {
            this.getStack(group, editorPane?.input).handleActiveEditorChange(editorPane);
        }
        handleActiveEditorSelectionChangeInNavigationStacks(group, editorPane, event) {
            this.getStack(group, editorPane.input).handleActiveEditorSelectionChange(editorPane, event);
        }
        handleEditorCloseEventInHistory(e) {
            const editors = this.editorScopedNavigationStacks.get(e.groupId);
            if (editors) {
                const editorStack = editors.get(e.editor);
                if (editorStack) {
                    editorStack.disposable.dispose();
                    editors.delete(e.editor);
                }
                if (editors.size === 0) {
                    this.editorScopedNavigationStacks.delete(e.groupId);
                }
            }
        }
        handleEditorGroupRemoveInNavigationStacks(group) {
            // Global
            this.defaultScopedEditorNavigationStack?.remove(group.id);
            // Editor groups
            const editorGroupStack = this.editorGroupScopedNavigationStacks.get(group.id);
            if (editorGroupStack) {
                editorGroupStack.disposable.dispose();
                this.editorGroupScopedNavigationStacks.delete(group.id);
            }
        }
        clearEditorNavigationStacks() {
            this.withEachEditorNavigationStack(stack => stack.clear());
        }
        removeFromEditorNavigationStacks(arg1) {
            this.withEachEditorNavigationStack(stack => stack.remove(arg1));
        }
        moveInEditorNavigationStacks(event) {
            this.withEachEditorNavigationStack(stack => stack.move(event));
        }
        withEachEditorNavigationStack(fn) {
            // Global
            if (this.defaultScopedEditorNavigationStack) {
                fn(this.defaultScopedEditorNavigationStack);
            }
            // Per editor group
            for (const [, entry] of this.editorGroupScopedNavigationStacks) {
                fn(entry.stack);
            }
            // Per editor
            for (const [, entries] of this.editorScopedNavigationStacks) {
                for (const [, entry] of entries) {
                    fn(entry.stack);
                }
            }
        }
        disposeEditorNavigationStacks() {
            // Global
            this.defaultScopedEditorNavigationStack?.dispose();
            this.defaultScopedEditorNavigationStack = undefined;
            // Per Editor group
            for (const [, stack] of this.editorGroupScopedNavigationStacks) {
                stack.disposable.dispose();
            }
            this.editorGroupScopedNavigationStacks.clear();
            // Per Editor
            for (const [, stacks] of this.editorScopedNavigationStacks) {
                for (const [, stack] of stacks) {
                    stack.disposable.dispose();
                }
            }
            this.editorScopedNavigationStacks.clear();
        }
        openNextRecentlyUsedEditor(groupId) {
            const [stack, index] = this.ensureRecentlyUsedStack(index => index - 1, groupId);
            return this.doNavigateInRecentlyUsedEditorsStack(stack[index], groupId);
        }
        openPreviouslyUsedEditor(groupId) {
            const [stack, index] = this.ensureRecentlyUsedStack(index => index + 1, groupId);
            return this.doNavigateInRecentlyUsedEditorsStack(stack[index], groupId);
        }
        async doNavigateInRecentlyUsedEditorsStack(editorIdentifier, groupId) {
            if (editorIdentifier) {
                const acrossGroups = typeof groupId !== 'number' || !this.editorGroupService.getGroup(groupId);
                if (acrossGroups) {
                    this.navigatingInRecentlyUsedEditorsStack = true;
                }
                else {
                    this.navigatingInRecentlyUsedEditorsInGroupStack = true;
                }
                const group = this.editorGroupService.getGroup(editorIdentifier.groupId) ?? this.editorGroupService.activeGroup;
                try {
                    await group.openEditor(editorIdentifier.editor);
                }
                finally {
                    if (acrossGroups) {
                        this.navigatingInRecentlyUsedEditorsStack = false;
                    }
                    else {
                        this.navigatingInRecentlyUsedEditorsInGroupStack = false;
                    }
                }
            }
        }
        ensureRecentlyUsedStack(indexModifier, groupId) {
            let editors;
            let index;
            const group = typeof groupId === 'number' ? this.editorGroupService.getGroup(groupId) : undefined;
            // Across groups
            if (!group) {
                editors = this.recentlyUsedEditorsStack || this.editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */);
                index = this.recentlyUsedEditorsStackIndex;
            }
            // Within group
            else {
                editors = this.recentlyUsedEditorsInGroupStack || group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).map(editor => ({ groupId: group.id, editor }));
                index = this.recentlyUsedEditorsInGroupStackIndex;
            }
            // Adjust index
            let newIndex = indexModifier(index);
            if (newIndex < 0) {
                newIndex = 0;
            }
            else if (newIndex > editors.length - 1) {
                newIndex = editors.length - 1;
            }
            // Remember index and editors
            if (!group) {
                this.recentlyUsedEditorsStack = editors;
                this.recentlyUsedEditorsStackIndex = newIndex;
            }
            else {
                this.recentlyUsedEditorsInGroupStack = editors;
                this.recentlyUsedEditorsInGroupStackIndex = newIndex;
            }
            return [editors, newIndex];
        }
        handleEditorEventInRecentEditorsStack() {
            // Drop all-editors stack unless navigating in all editors
            if (!this.navigatingInRecentlyUsedEditorsStack) {
                this.recentlyUsedEditorsStack = undefined;
                this.recentlyUsedEditorsStackIndex = 0;
            }
            // Drop in-group-editors stack unless navigating in group
            if (!this.navigatingInRecentlyUsedEditorsInGroupStack) {
                this.recentlyUsedEditorsInGroupStack = undefined;
                this.recentlyUsedEditorsInGroupStackIndex = 0;
            }
        }
        //#endregion
        //#region File: Reopen Closed Editor (limit: 20)
        static { this.MAX_RECENTLY_CLOSED_EDITORS = 20; }
        handleEditorCloseEventInReopen(event) {
            if (this.ignoreEditorCloseEvent) {
                return; // blocked
            }
            const { editor, context } = event;
            if (context === editor_1.EditorCloseContext.REPLACE || context === editor_1.EditorCloseContext.MOVE) {
                return; // ignore if editor was replaced or moved
            }
            const untypedEditor = editor.toUntyped();
            if (!untypedEditor) {
                return; // we need a untyped editor to restore from going forward
            }
            const associatedResources = [];
            const editorResource = editor_1.EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.BOTH });
            if (uri_1.URI.isUri(editorResource)) {
                associatedResources.push(editorResource);
            }
            else if (editorResource) {
                associatedResources.push(...(0, arrays_1.coalesce)([editorResource.primary, editorResource.secondary]));
            }
            // Remove from list of recently closed before...
            this.removeFromRecentlyClosedEditors(editor);
            // ...adding it as last recently closed
            this.recentlyClosedEditors.push({
                editorId: editor.editorId,
                editor: untypedEditor,
                resource: editor_1.EditorResourceAccessor.getOriginalUri(editor),
                associatedResources,
                index: event.index,
                sticky: event.sticky
            });
            // Bounding
            if (this.recentlyClosedEditors.length > HistoryService_1.MAX_RECENTLY_CLOSED_EDITORS) {
                this.recentlyClosedEditors.shift();
            }
            // Context
            this.canReopenClosedEditorContextKey.set(true);
        }
        async reopenLastClosedEditor() {
            // Open editor if we have one
            const lastClosedEditor = this.recentlyClosedEditors.pop();
            let reopenClosedEditorPromise = undefined;
            if (lastClosedEditor) {
                reopenClosedEditorPromise = this.doReopenLastClosedEditor(lastClosedEditor);
            }
            // Update context
            this.canReopenClosedEditorContextKey.set(this.recentlyClosedEditors.length > 0);
            return reopenClosedEditorPromise;
        }
        async doReopenLastClosedEditor(lastClosedEditor) {
            const options = { pinned: true, sticky: lastClosedEditor.sticky, index: lastClosedEditor.index, ignoreError: true };
            // Special sticky handling: remove the index property from options
            // if that would result in sticky state to not preserve or apply
            // wrongly.
            if ((lastClosedEditor.sticky && !this.editorGroupService.activeGroup.isSticky(lastClosedEditor.index)) ||
                (!lastClosedEditor.sticky && this.editorGroupService.activeGroup.isSticky(lastClosedEditor.index))) {
                options.index = undefined;
            }
            // Re-open editor unless already opened
            let editorPane = undefined;
            if (!this.editorGroupService.activeGroup.contains(lastClosedEditor.editor)) {
                // Fix for https://github.com/microsoft/vscode/issues/107850
                // If opening an editor fails, it is possible that we get
                // another editor-close event as a result. But we really do
                // want to ignore that in our list of recently closed editors
                //  to prevent endless loops.
                this.ignoreEditorCloseEvent = true;
                try {
                    editorPane = await this.editorService.openEditor({
                        ...lastClosedEditor.editor,
                        options: {
                            ...lastClosedEditor.editor.options,
                            ...options
                        }
                    });
                }
                finally {
                    this.ignoreEditorCloseEvent = false;
                }
            }
            // If no editor was opened, try with the next one
            if (!editorPane) {
                // Fix for https://github.com/microsoft/vscode/issues/67882
                // If opening of the editor fails, make sure to try the next one
                // but make sure to remove this one from the list to prevent
                // endless loops.
                (0, arrays_1.remove)(this.recentlyClosedEditors, lastClosedEditor);
                // Try with next one
                this.reopenLastClosedEditor();
            }
        }
        removeFromRecentlyClosedEditors(arg1) {
            this.recentlyClosedEditors = this.recentlyClosedEditors.filter(recentlyClosedEditor => {
                if ((0, editor_1.isEditorInput)(arg1) && recentlyClosedEditor.editorId !== arg1.editorId) {
                    return true; // keep: different editor identifiers
                }
                if (recentlyClosedEditor.resource && this.editorHelper.matchesFile(recentlyClosedEditor.resource, arg1)) {
                    return false; // remove: editor matches directly
                }
                if (recentlyClosedEditor.associatedResources.some(associatedResource => this.editorHelper.matchesFile(associatedResource, arg1))) {
                    return false; // remove: an associated resource matches
                }
                return true; // keep
            });
            // Update context
            this.canReopenClosedEditorContextKey.set(this.recentlyClosedEditors.length > 0);
        }
        //#endregion
        //#region Go to: Recently Opened Editor (limit: 200, persisted)
        static { this.MAX_HISTORY_ITEMS = 200; }
        static { this.HISTORY_STORAGE_KEY = 'history.entries'; }
        handleActiveEditorChangeInHistory(editorPane) {
            // Ensure we have not configured to exclude input and don't track invalid inputs
            const editor = editorPane?.input;
            if (!editor || editor.isDisposed() || !this.includeInHistory(editor)) {
                return;
            }
            // Remove any existing entry and add to the beginning
            this.removeFromHistory(editor);
            this.addToHistory(editor);
        }
        addToHistory(editor, insertFirst = true) {
            this.ensureHistoryLoaded(this.history);
            const historyInput = this.editorHelper.preferResourceEditorInput(editor);
            if (!historyInput) {
                return;
            }
            // Insert based on preference
            if (insertFirst) {
                this.history.unshift(historyInput);
            }
            else {
                this.history.push(historyInput);
            }
            // Respect max entries setting
            if (this.history.length > HistoryService_1.MAX_HISTORY_ITEMS) {
                this.editorHelper.clearOnEditorDispose(this.history.pop(), this.editorHistoryListeners);
            }
            // React to editor input disposing if this is a typed editor
            if ((0, editor_1.isEditorInput)(historyInput)) {
                this.editorHelper.onEditorDispose(historyInput, () => this.updateHistoryOnEditorDispose(historyInput), this.editorHistoryListeners);
            }
        }
        updateHistoryOnEditorDispose(editor) {
            // Any non side-by-side editor input gets removed directly on dispose
            if (!(0, editor_1.isSideBySideEditorInput)(editor)) {
                this.removeFromHistory(editor);
            }
            // Side-by-side editors get special treatment: we try to distill the
            // possibly untyped resource inputs from both sides to be able to
            // offer these entries from the history to the user still.
            else {
                const resourceInputs = [];
                const sideInputs = editor.primary.matches(editor.secondary) ? [editor.primary] : [editor.primary, editor.secondary];
                for (const sideInput of sideInputs) {
                    const candidateResourceInput = this.editorHelper.preferResourceEditorInput(sideInput);
                    if ((0, editor_1.isResourceEditorInput)(candidateResourceInput)) {
                        resourceInputs.push(candidateResourceInput);
                    }
                }
                // Insert the untyped resource inputs where our disposed
                // side-by-side editor input is in the history stack
                this.replaceInHistory(editor, ...resourceInputs);
            }
        }
        includeInHistory(editor) {
            if ((0, editor_1.isEditorInput)(editor)) {
                return true; // include any non files
            }
            return !this.resourceExcludeMatcher.value.matches(editor.resource);
        }
        removeExcludedFromHistory() {
            this.ensureHistoryLoaded(this.history);
            this.history = this.history.filter(entry => {
                const include = this.includeInHistory(entry);
                // Cleanup any listeners associated with the input when removing from history
                if (!include) {
                    this.editorHelper.clearOnEditorDispose(entry, this.editorHistoryListeners);
                }
                return include;
            });
        }
        moveInHistory(event) {
            if (event.isOperation(2 /* FileOperation.MOVE */)) {
                const removed = this.removeFromHistory(event);
                if (removed) {
                    this.addToHistory({ resource: event.target.resource });
                }
            }
        }
        removeFromHistory(arg1) {
            let removed = false;
            this.ensureHistoryLoaded(this.history);
            this.history = this.history.filter(entry => {
                const matches = this.editorHelper.matchesEditor(arg1, entry);
                // Cleanup any listeners associated with the input when removing from history
                if (matches) {
                    this.editorHelper.clearOnEditorDispose(arg1, this.editorHistoryListeners);
                    removed = true;
                }
                return !matches;
            });
            return removed;
        }
        replaceInHistory(editor, ...replacements) {
            this.ensureHistoryLoaded(this.history);
            let replaced = false;
            const newHistory = [];
            for (const entry of this.history) {
                // Entry matches and is going to be disposed + replaced
                if (this.editorHelper.matchesEditor(editor, entry)) {
                    // Cleanup any listeners associated with the input when replacing from history
                    this.editorHelper.clearOnEditorDispose(editor, this.editorHistoryListeners);
                    // Insert replacements but only once
                    if (!replaced) {
                        newHistory.push(...replacements);
                        replaced = true;
                    }
                }
                // Entry does not match, but only add it if it didn't match
                // our replacements already
                else if (!replacements.some(replacement => this.editorHelper.matchesEditor(replacement, entry))) {
                    newHistory.push(entry);
                }
            }
            // If the target editor to replace was not found, make sure to
            // insert the replacements to the end to ensure we got them
            if (!replaced) {
                newHistory.push(...replacements);
            }
            this.history = newHistory;
        }
        clearRecentlyOpened() {
            this.history = [];
            for (const [, disposable] of this.editorHistoryListeners) {
                (0, lifecycle_1.dispose)(disposable);
            }
            this.editorHistoryListeners.clear();
        }
        getHistory() {
            this.ensureHistoryLoaded(this.history);
            return this.history;
        }
        ensureHistoryLoaded(history) {
            if (!this.history) {
                // Until history is loaded, it is just empty
                this.history = [];
                // We want to seed history from opened editors
                // too as well as previous stored state, so we
                // need to wait for the editor groups being ready
                if (this.editorGroupService.isReady) {
                    this.loadHistory();
                }
                else {
                    (async () => {
                        await this.editorGroupService.whenReady;
                        this.loadHistory();
                    })();
                }
            }
        }
        loadHistory() {
            // Init as empty before adding - since we are about to
            // populate the history from opened editors, we capture
            // the right order here.
            this.history = [];
            // All stored editors from previous session
            const storedEditorHistory = this.loadHistoryFromStorage();
            // All restored editors from previous session
            // in reverse editor from least to most recently
            // used.
            const openedEditorsLru = [...this.editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */)].reverse();
            // We want to merge the opened editors from the last
            // session with the stored editors from the last
            // session. Because not all editors can be serialised
            // we want to make sure to include all opened editors
            // too.
            // Opened editors should always be first in the history
            const handledEditors = new Set();
            // Add all opened editors first
            for (const { editor } of openedEditorsLru) {
                if (!this.includeInHistory(editor)) {
                    continue;
                }
                // Add into history
                this.addToHistory(editor);
                // Remember as added
                if (editor.resource) {
                    handledEditors.add(`${editor.resource.toString()}/${editor.editorId}`);
                }
            }
            // Add remaining from storage if not there already
            // We check on resource and `editorId` (from `override`)
            // to figure out if the editor has been already added.
            for (const editor of storedEditorHistory) {
                if (!handledEditors.has(`${editor.resource.toString()}/${editor.options?.override}`)) {
                    this.addToHistory(editor, false /* at the end */);
                }
            }
        }
        loadHistoryFromStorage() {
            const entries = [];
            const entriesRaw = this.storageService.get(HistoryService_1.HISTORY_STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
            if (entriesRaw) {
                try {
                    const entriesParsed = JSON.parse(entriesRaw);
                    for (const entryParsed of entriesParsed) {
                        if (!entryParsed.editor || !entryParsed.editor.resource) {
                            continue; // unexpected data format
                        }
                        try {
                            entries.push({
                                ...entryParsed.editor,
                                resource: typeof entryParsed.editor.resource === 'string' ?
                                    uri_1.URI.parse(entryParsed.editor.resource) : //  from 1.67.x: URI is stored efficiently as URI.toString()
                                    uri_1.URI.from(entryParsed.editor.resource) // until 1.66.x: URI was stored very verbose as URI.toJSON()
                            });
                        }
                        catch (error) {
                            (0, errors_1.onUnexpectedError)(error); // do not fail entire history when one entry fails
                        }
                    }
                }
                catch (error) {
                    (0, errors_1.onUnexpectedError)(error); // https://github.com/microsoft/vscode/issues/99075
                }
            }
            return entries;
        }
        saveState() {
            if (!this.history) {
                return; // nothing to save because history was not used
            }
            const entries = [];
            for (const editor of this.history) {
                if ((0, editor_1.isEditorInput)(editor) || !(0, editor_1.isResourceEditorInput)(editor)) {
                    continue; // only save resource editor inputs
                }
                entries.push({
                    editor: {
                        ...editor,
                        resource: editor.resource.toString()
                    }
                });
            }
            this.storageService.store(HistoryService_1.HISTORY_STORAGE_KEY, JSON.stringify(entries), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        //#endregion
        //#region Last Active Workspace/File
        getLastActiveWorkspaceRoot(schemeFilter) {
            // No Folder: return early
            const folders = this.contextService.getWorkspace().folders;
            if (folders.length === 0) {
                return undefined;
            }
            // Single Folder: return early
            if (folders.length === 1) {
                const resource = folders[0].uri;
                if (!schemeFilter || resource.scheme === schemeFilter) {
                    return resource;
                }
                return undefined;
            }
            // Multiple folders: find the last active one
            for (const input of this.getHistory()) {
                if ((0, editor_1.isEditorInput)(input)) {
                    continue;
                }
                if (schemeFilter && input.resource.scheme !== schemeFilter) {
                    continue;
                }
                const resourceWorkspace = this.contextService.getWorkspaceFolder(input.resource);
                if (resourceWorkspace) {
                    return resourceWorkspace.uri;
                }
            }
            // Fallback to first workspace matching scheme filter if any
            for (const folder of folders) {
                const resource = folder.uri;
                if (!schemeFilter || resource.scheme === schemeFilter) {
                    return resource;
                }
            }
            return undefined;
        }
        getLastActiveFile(filterByScheme) {
            for (const input of this.getHistory()) {
                let resource;
                if ((0, editor_1.isEditorInput)(input)) {
                    resource = editor_1.EditorResourceAccessor.getOriginalUri(input, { filterByScheme });
                }
                else {
                    resource = input.resource;
                }
                if (resource?.scheme === filterByScheme) {
                    return resource;
                }
            }
            return undefined;
        }
        //#endregion
        dispose() {
            super.dispose();
            for (const [, stack] of this.editorGroupScopedNavigationStacks) {
                stack.disposable.dispose();
            }
            for (const [, editors] of this.editorScopedNavigationStacks) {
                for (const [, stack] of editors) {
                    stack.disposable.dispose();
                }
            }
        }
    };
    exports.HistoryService = HistoryService;
    exports.HistoryService = HistoryService = HistoryService_1 = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, editorGroupsService_1.IEditorGroupsService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, storage_1.IStorageService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, files_1.IFileService),
        __param(6, workspaces_1.IWorkspacesService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, layoutService_1.IWorkbenchLayoutService),
        __param(9, contextkey_1.IContextKeyService)
    ], HistoryService);
    (0, extensions_1.registerSingleton)(history_1.IHistoryService, HistoryService, 0 /* InstantiationType.Eager */);
    class EditorSelectionState {
        constructor(editorIdentifier, selection, reason) {
            this.editorIdentifier = editorIdentifier;
            this.selection = selection;
            this.reason = reason;
        }
        justifiesNewNavigationEntry(other) {
            if (this.editorIdentifier.groupId !== other.editorIdentifier.groupId) {
                return true; // different group
            }
            if (!this.editorIdentifier.editor.matches(other.editorIdentifier.editor)) {
                return true; // different editor
            }
            if (!this.selection || !other.selection) {
                return true; // unknown selections
            }
            const result = this.selection.compare(other.selection);
            if (result === 2 /* EditorPaneSelectionCompareResult.SIMILAR */ && (other.reason === 4 /* EditorPaneSelectionChangeReason.NAVIGATION */ || other.reason === 5 /* EditorPaneSelectionChangeReason.JUMP */)) {
                // let navigation sources win even if the selection is `SIMILAR`
                // (e.g. "Go to definition" should add a history entry)
                return true;
            }
            return result === 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
        }
    }
    let EditorNavigationStacks = class EditorNavigationStacks extends lifecycle_1.Disposable {
        constructor(scope, instantiationService) {
            super();
            this.scope = scope;
            this.instantiationService = instantiationService;
            this.selectionsStack = this._register(this.instantiationService.createInstance(EditorNavigationStack, 0 /* GoFilter.NONE */, this.scope));
            this.editsStack = this._register(this.instantiationService.createInstance(EditorNavigationStack, 1 /* GoFilter.EDITS */, this.scope));
            this.navigationsStack = this._register(this.instantiationService.createInstance(EditorNavigationStack, 2 /* GoFilter.NAVIGATION */, this.scope));
            this.stacks = [
                this.selectionsStack,
                this.editsStack,
                this.navigationsStack
            ];
            this.onDidChange = event_1.Event.any(this.selectionsStack.onDidChange, this.editsStack.onDidChange, this.navigationsStack.onDidChange);
        }
        canGoForward(filter) {
            return this.getStack(filter).canGoForward();
        }
        goForward(filter) {
            return this.getStack(filter).goForward();
        }
        canGoBack(filter) {
            return this.getStack(filter).canGoBack();
        }
        goBack(filter) {
            return this.getStack(filter).goBack();
        }
        goPrevious(filter) {
            return this.getStack(filter).goPrevious();
        }
        canGoLast(filter) {
            return this.getStack(filter).canGoLast();
        }
        goLast(filter) {
            return this.getStack(filter).goLast();
        }
        getStack(filter = 0 /* GoFilter.NONE */) {
            switch (filter) {
                case 0 /* GoFilter.NONE */: return this.selectionsStack;
                case 1 /* GoFilter.EDITS */: return this.editsStack;
                case 2 /* GoFilter.NAVIGATION */: return this.navigationsStack;
            }
        }
        handleActiveEditorChange(editorPane) {
            // Always send to selections navigation stack
            this.selectionsStack.notifyNavigation(editorPane);
        }
        handleActiveEditorSelectionChange(editorPane, event) {
            const previous = this.selectionsStack.current;
            // Always send to selections navigation stack
            this.selectionsStack.notifyNavigation(editorPane, event);
            // Check for edits
            if (event.reason === 3 /* EditorPaneSelectionChangeReason.EDIT */) {
                this.editsStack.notifyNavigation(editorPane, event);
            }
            // Check for navigations
            //
            // Note: ignore if selections navigation stack is navigating because
            // in that case we do not want to receive repeated entries in
            // the navigation stack.
            else if ((event.reason === 4 /* EditorPaneSelectionChangeReason.NAVIGATION */ || event.reason === 5 /* EditorPaneSelectionChangeReason.JUMP */) &&
                !this.selectionsStack.isNavigating()) {
                // A "JUMP" navigation selection change always has a source and
                // target. As such, we add the previous entry of the selections
                // navigation stack so that our navigation stack receives both
                // entries unless the user is currently navigating.
                if (event.reason === 5 /* EditorPaneSelectionChangeReason.JUMP */ && !this.navigationsStack.isNavigating()) {
                    if (previous) {
                        this.navigationsStack.addOrReplace(previous.groupId, previous.editor, previous.selection);
                    }
                }
                this.navigationsStack.notifyNavigation(editorPane, event);
            }
        }
        clear() {
            for (const stack of this.stacks) {
                stack.clear();
            }
        }
        remove(arg1) {
            for (const stack of this.stacks) {
                stack.remove(arg1);
            }
        }
        move(event) {
            for (const stack of this.stacks) {
                stack.move(event);
            }
        }
    };
    EditorNavigationStacks = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], EditorNavigationStacks);
    class NoOpEditorNavigationStacks {
        constructor() {
            this.onDidChange = event_1.Event.None;
        }
        canGoForward() { return false; }
        async goForward() { }
        canGoBack() { return false; }
        async goBack() { }
        async goPrevious() { }
        canGoLast() { return false; }
        async goLast() { }
        handleActiveEditorChange() { }
        handleActiveEditorSelectionChange() { }
        clear() { }
        remove() { }
        move() { }
        dispose() { }
    }
    let EditorNavigationStack = class EditorNavigationStack extends lifecycle_1.Disposable {
        static { EditorNavigationStack_1 = this; }
        static { this.MAX_STACK_SIZE = 50; }
        get current() {
            return this.stack[this.index];
        }
        set current(entry) {
            if (entry) {
                this.stack[this.index] = entry;
            }
        }
        constructor(filter, scope, instantiationService, editorService, editorGroupService, logService) {
            super();
            this.filter = filter;
            this.scope = scope;
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.logService = logService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.mapEditorToDisposable = new Map();
            this.mapGroupToDisposable = new Map();
            this.editorHelper = this.instantiationService.createInstance(EditorHelper);
            this.stack = [];
            this.index = -1;
            this.previousIndex = -1;
            this.navigating = false;
            this.currentSelectionState = undefined;
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.onDidChange(() => this.traceStack()));
            this._register(this.logService.onDidChangeLogLevel(() => this.traceStack()));
        }
        traceStack() {
            if (this.logService.getLevel() !== log_1.LogLevel.Trace) {
                return;
            }
            const entryLabels = [];
            for (const entry of this.stack) {
                if (typeof entry.selection?.log === 'function') {
                    entryLabels.push(`- group: ${entry.groupId}, editor: ${entry.editor.resource?.toString()}, selection: ${entry.selection.log()}`);
                }
                else {
                    entryLabels.push(`- group: ${entry.groupId}, editor: ${entry.editor.resource?.toString()}, selection: <none>`);
                }
            }
            if (entryLabels.length === 0) {
                this.trace(`index: ${this.index}, navigating: ${this.isNavigating()}: <empty>`);
            }
            else {
                this.trace(`index: ${this.index}, navigating: ${this.isNavigating()}
${entryLabels.join('\n')}
			`);
            }
        }
        trace(msg, editor = null, event) {
            if (this.logService.getLevel() !== log_1.LogLevel.Trace) {
                return;
            }
            let filterLabel;
            switch (this.filter) {
                case 0 /* GoFilter.NONE */:
                    filterLabel = 'global';
                    break;
                case 1 /* GoFilter.EDITS */:
                    filterLabel = 'edits';
                    break;
                case 2 /* GoFilter.NAVIGATION */:
                    filterLabel = 'navigation';
                    break;
            }
            let scopeLabel;
            switch (this.scope) {
                case 0 /* GoScope.DEFAULT */:
                    scopeLabel = 'default';
                    break;
                case 1 /* GoScope.EDITOR_GROUP */:
                    scopeLabel = 'editorGroup';
                    break;
                case 2 /* GoScope.EDITOR */:
                    scopeLabel = 'editor';
                    break;
            }
            if (editor !== null) {
                this.logService.trace(`[History stack ${filterLabel}-${scopeLabel}]: ${msg} (editor: ${editor?.resource?.toString()}, event: ${this.traceEvent(event)})`);
            }
            else {
                this.logService.trace(`[History stack ${filterLabel}-${scopeLabel}]: ${msg}`);
            }
        }
        traceEvent(event) {
            if (!event) {
                return '<none>';
            }
            switch (event.reason) {
                case 3 /* EditorPaneSelectionChangeReason.EDIT */: return 'edit';
                case 4 /* EditorPaneSelectionChangeReason.NAVIGATION */: return 'navigation';
                case 5 /* EditorPaneSelectionChangeReason.JUMP */: return 'jump';
                case 1 /* EditorPaneSelectionChangeReason.PROGRAMMATIC */: return 'programmatic';
                case 2 /* EditorPaneSelectionChangeReason.USER */: return 'user';
            }
        }
        registerGroupListeners(groupId) {
            if (!this.mapGroupToDisposable.has(groupId)) {
                const group = this.editorGroupService.getGroup(groupId);
                if (group) {
                    this.mapGroupToDisposable.set(groupId, group.onWillMoveEditor(e => this.onWillMoveEditor(e)));
                }
            }
        }
        onWillMoveEditor(e) {
            this.trace('onWillMoveEditor()', e.editor);
            if (this.scope === 1 /* GoScope.EDITOR_GROUP */) {
                return; // ignore move events if our scope is group based
            }
            for (const entry of this.stack) {
                if (entry.groupId !== e.groupId) {
                    continue; // not in the group that reported the event
                }
                if (!this.editorHelper.matchesEditor(e.editor, entry.editor)) {
                    continue; // not the editor this event is about
                }
                // Update to target group
                entry.groupId = e.target;
            }
        }
        //#region Stack Mutation
        notifyNavigation(editorPane, event) {
            this.trace('notifyNavigation()', editorPane?.input, event);
            const isSelectionAwareEditorPane = (0, editor_1.isEditorPaneWithSelection)(editorPane);
            const hasValidEditor = editorPane?.group && editorPane.input && !editorPane.input.isDisposed();
            // Treat editor changes that happen as part of stack navigation specially
            // we do not want to add a new stack entry as a matter of navigating the
            // stack but we need to keep our currentEditorSelectionState up to date
            // with the navigtion that occurs.
            if (this.navigating) {
                this.trace(`notifyNavigation() ignoring (navigating)`, editorPane?.input, event);
                if (isSelectionAwareEditorPane && hasValidEditor) {
                    this.trace('notifyNavigation() updating current selection state', editorPane?.input, event);
                    this.currentSelectionState = new EditorSelectionState({ groupId: editorPane.group.id, editor: editorPane.input }, editorPane.getSelection(), event?.reason);
                }
                else {
                    this.trace('notifyNavigation() dropping current selection state', editorPane?.input, event);
                    this.currentSelectionState = undefined; // we navigated to a non-selection aware or disposed editor
                }
            }
            // Normal navigation not part of stack navigation
            else {
                this.trace(`notifyNavigation() not ignoring`, editorPane?.input, event);
                // Navigation inside selection aware editor
                if (isSelectionAwareEditorPane && hasValidEditor) {
                    this.onSelectionAwareEditorNavigation(editorPane.group.id, editorPane.input, editorPane.getSelection(), event);
                }
                // Navigation to non-selection aware or disposed editor
                else {
                    this.currentSelectionState = undefined; // at this time we have no active selection aware editor
                    if (hasValidEditor) {
                        this.onNonSelectionAwareEditorNavigation(editorPane.group.id, editorPane.input);
                    }
                }
            }
        }
        onSelectionAwareEditorNavigation(groupId, editor, selection, event) {
            if (this.current?.groupId === groupId && !selection && this.editorHelper.matchesEditor(this.current.editor, editor)) {
                return; // do not push same editor input again of same group if we have no valid selection
            }
            this.trace('onSelectionAwareEditorNavigation()', editor, event);
            const stateCandidate = new EditorSelectionState({ groupId, editor }, selection, event?.reason);
            // Add to stack if we dont have a current state or this new state justifies a push
            if (!this.currentSelectionState || this.currentSelectionState.justifiesNewNavigationEntry(stateCandidate)) {
                this.doAdd(groupId, editor, stateCandidate.selection);
            }
            // Otherwise we replace the current stack entry with this one
            else {
                this.doReplace(groupId, editor, stateCandidate.selection);
            }
            // Update our current navigation editor state
            this.currentSelectionState = stateCandidate;
        }
        onNonSelectionAwareEditorNavigation(groupId, editor) {
            if (this.current?.groupId === groupId && this.editorHelper.matchesEditor(this.current.editor, editor)) {
                return; // do not push same editor input again of same group
            }
            this.trace('onNonSelectionAwareEditorNavigation()', editor);
            this.doAdd(groupId, editor);
        }
        doAdd(groupId, editor, selection) {
            if (!this.navigating) {
                this.addOrReplace(groupId, editor, selection);
            }
        }
        doReplace(groupId, editor, selection) {
            if (!this.navigating) {
                this.addOrReplace(groupId, editor, selection, true /* force replace */);
            }
        }
        addOrReplace(groupId, editorCandidate, selection, forceReplace) {
            // Ensure we listen to changes in group
            this.registerGroupListeners(groupId);
            // Check whether to replace an existing entry or not
            let replace = false;
            if (this.current) {
                if (forceReplace) {
                    replace = true; // replace if we are forced to
                }
                else if (this.shouldReplaceStackEntry(this.current, { groupId, editor: editorCandidate, selection })) {
                    replace = true; // replace if the group & input is the same and selection indicates as such
                }
            }
            const editor = this.editorHelper.preferResourceEditorInput(editorCandidate);
            if (!editor) {
                return;
            }
            if (replace) {
                this.trace('replace()', editor);
            }
            else {
                this.trace('add()', editor);
            }
            const newStackEntry = { groupId, editor, selection };
            // Replace at current position
            const removedEntries = [];
            if (replace) {
                if (this.current) {
                    removedEntries.push(this.current);
                }
                this.current = newStackEntry;
            }
            // Add to stack at current position
            else {
                // If we are not at the end of history, we remove anything after
                if (this.stack.length > this.index + 1) {
                    for (let i = this.index + 1; i < this.stack.length; i++) {
                        removedEntries.push(this.stack[i]);
                    }
                    this.stack = this.stack.slice(0, this.index + 1);
                }
                // Insert entry at index
                this.stack.splice(this.index + 1, 0, newStackEntry);
                // Check for limit
                if (this.stack.length > EditorNavigationStack_1.MAX_STACK_SIZE) {
                    removedEntries.push(this.stack.shift()); // remove first
                    if (this.previousIndex >= 0) {
                        this.previousIndex--;
                    }
                }
                else {
                    this.setIndex(this.index + 1, true /* skip event, we fire it later */);
                }
            }
            // Clear editor listeners from removed entries
            for (const removedEntry of removedEntries) {
                this.editorHelper.clearOnEditorDispose(removedEntry.editor, this.mapEditorToDisposable);
            }
            // Remove this from the stack unless the stack input is a resource
            // that can easily be restored even when the input gets disposed
            if ((0, editor_1.isEditorInput)(editor)) {
                this.editorHelper.onEditorDispose(editor, () => this.remove(editor), this.mapEditorToDisposable);
            }
            // Event
            this._onDidChange.fire();
        }
        shouldReplaceStackEntry(entry, candidate) {
            if (entry.groupId !== candidate.groupId) {
                return false; // different group
            }
            if (!this.editorHelper.matchesEditor(entry.editor, candidate.editor)) {
                return false; // different editor
            }
            if (!entry.selection) {
                return true; // always replace when we have no specific selection yet
            }
            if (!candidate.selection) {
                return false; // otherwise, prefer to keep existing specific selection over new unspecific one
            }
            // Finally, replace when selections are considered identical
            return entry.selection.compare(candidate.selection) === 1 /* EditorPaneSelectionCompareResult.IDENTICAL */;
        }
        move(event) {
            if (event.isOperation(2 /* FileOperation.MOVE */)) {
                for (const entry of this.stack) {
                    if (this.editorHelper.matchesEditor(event, entry.editor)) {
                        entry.editor = { resource: event.target.resource };
                    }
                }
            }
        }
        remove(arg1) {
            // Remove all stack entries that match `arg1`
            this.stack = this.stack.filter(entry => {
                const matches = typeof arg1 === 'number' ? entry.groupId === arg1 : this.editorHelper.matchesEditor(arg1, entry.editor);
                // Cleanup any listeners associated with the input when removing
                if (matches) {
                    this.editorHelper.clearOnEditorDispose(entry.editor, this.mapEditorToDisposable);
                }
                return !matches;
            });
            // Given we just removed entries, we need to make sure
            // to remove entries that are now identical and next
            // to each other to prevent no-op navigations.
            this.flatten();
            // Reset indeces
            this.index = this.stack.length - 1;
            this.previousIndex = -1;
            // Clear group listener
            if (typeof arg1 === 'number') {
                this.mapGroupToDisposable.get(arg1)?.dispose();
                this.mapGroupToDisposable.delete(arg1);
            }
            // Event
            this._onDidChange.fire();
        }
        flatten() {
            const flattenedStack = [];
            let previousEntry = undefined;
            for (const entry of this.stack) {
                if (previousEntry && this.shouldReplaceStackEntry(entry, previousEntry)) {
                    continue; // skip over entry when it is considered the same
                }
                previousEntry = entry;
                flattenedStack.push(entry);
            }
            this.stack = flattenedStack;
        }
        clear() {
            this.index = -1;
            this.previousIndex = -1;
            this.stack.splice(0);
            for (const [, disposable] of this.mapEditorToDisposable) {
                (0, lifecycle_1.dispose)(disposable);
            }
            this.mapEditorToDisposable.clear();
            for (const [, disposable] of this.mapGroupToDisposable) {
                (0, lifecycle_1.dispose)(disposable);
            }
            this.mapGroupToDisposable.clear();
        }
        dispose() {
            super.dispose();
            this.clear();
        }
        //#endregion
        //#region Navigation
        canGoForward() {
            return this.stack.length > this.index + 1;
        }
        async goForward() {
            const navigated = await this.maybeGoCurrent();
            if (navigated) {
                return;
            }
            if (!this.canGoForward()) {
                return;
            }
            this.setIndex(this.index + 1);
            return this.navigate();
        }
        canGoBack() {
            return this.index > 0;
        }
        async goBack() {
            const navigated = await this.maybeGoCurrent();
            if (navigated) {
                return;
            }
            if (!this.canGoBack()) {
                return;
            }
            this.setIndex(this.index - 1);
            return this.navigate();
        }
        async goPrevious() {
            const navigated = await this.maybeGoCurrent();
            if (navigated) {
                return;
            }
            // If we never navigated, just go back
            if (this.previousIndex === -1) {
                return this.goBack();
            }
            // Otherwise jump to previous stack entry
            this.setIndex(this.previousIndex);
            return this.navigate();
        }
        canGoLast() {
            return this.stack.length > 0;
        }
        async goLast() {
            if (!this.canGoLast()) {
                return;
            }
            this.setIndex(this.stack.length - 1);
            return this.navigate();
        }
        async maybeGoCurrent() {
            // When this navigation stack works with a specific
            // filter where not every selection change is added
            // to the stack, we want to first reveal the current
            // selection before attempting to navigate in the
            // stack.
            if (this.filter === 0 /* GoFilter.NONE */) {
                return false; // only applies when  we are a filterd stack
            }
            if (this.isCurrentSelectionActive()) {
                return false; // we are at the current navigation stop
            }
            // Go to current selection
            await this.navigate();
            return true;
        }
        isCurrentSelectionActive() {
            if (!this.current?.selection) {
                return false; // we need a current selection
            }
            const pane = this.editorService.activeEditorPane;
            if (!(0, editor_1.isEditorPaneWithSelection)(pane)) {
                return false; // we need an active editor pane with selection support
            }
            if (pane.group?.id !== this.current.groupId) {
                return false; // we need matching groups
            }
            if (!pane.input || !this.editorHelper.matchesEditor(pane.input, this.current.editor)) {
                return false; // we need matching editors
            }
            const paneSelection = pane.getSelection();
            if (!paneSelection) {
                return false; // we need a selection to compare with
            }
            return paneSelection.compare(this.current.selection) === 1 /* EditorPaneSelectionCompareResult.IDENTICAL */;
        }
        setIndex(newIndex, skipEvent) {
            this.previousIndex = this.index;
            this.index = newIndex;
            // Event
            if (!skipEvent) {
                this._onDidChange.fire();
            }
        }
        async navigate() {
            this.navigating = true;
            try {
                if (this.current) {
                    await this.doNavigate(this.current);
                }
            }
            finally {
                this.navigating = false;
            }
        }
        doNavigate(location) {
            let options = Object.create(null);
            // Apply selection if any
            if (location.selection) {
                options = location.selection.restore(options);
            }
            if ((0, editor_1.isEditorInput)(location.editor)) {
                return this.editorService.openEditor(location.editor, options, location.groupId);
            }
            return this.editorService.openEditor({
                ...location.editor,
                options: {
                    ...location.editor.options,
                    ...options
                }
            }, location.groupId);
        }
        isNavigating() {
            return this.navigating;
        }
    };
    exports.EditorNavigationStack = EditorNavigationStack;
    exports.EditorNavigationStack = EditorNavigationStack = EditorNavigationStack_1 = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, editorService_1.IEditorService),
        __param(4, editorGroupsService_1.IEditorGroupsService),
        __param(5, log_1.ILogService)
    ], EditorNavigationStack);
    let EditorHelper = class EditorHelper {
        constructor(uriIdentityService, lifecycleService, fileService, pathService) {
            this.uriIdentityService = uriIdentityService;
            this.lifecycleService = lifecycleService;
            this.fileService = fileService;
            this.pathService = pathService;
        }
        preferResourceEditorInput(editor) {
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(editor);
            // For now, only prefer well known schemes that we control to prevent
            // issues such as https://github.com/microsoft/vscode/issues/85204
            // from being used as resource inputs
            // resource inputs survive editor disposal and as such are a lot more
            // durable across editor changes and restarts
            const hasValidResourceEditorInputScheme = resource?.scheme === network_1.Schemas.file ||
                resource?.scheme === network_1.Schemas.vscodeRemote ||
                resource?.scheme === network_1.Schemas.vscodeUserData ||
                resource?.scheme === this.pathService.defaultUriScheme;
            // Scheme is valid: prefer the untyped input
            // over the typed input if possible to keep
            // the entry across restarts
            if (hasValidResourceEditorInputScheme) {
                if ((0, editor_1.isEditorInput)(editor)) {
                    const untypedInput = editor.toUntyped();
                    if ((0, editor_1.isResourceEditorInput)(untypedInput)) {
                        return untypedInput;
                    }
                }
                return editor;
            }
            // Scheme is invalid: allow the editor input
            // for as long as it is not disposed
            else {
                return (0, editor_1.isEditorInput)(editor) ? editor : undefined;
            }
        }
        matchesEditor(arg1, inputB) {
            if (arg1 instanceof files_1.FileChangesEvent || arg1 instanceof files_1.FileOperationEvent) {
                if ((0, editor_1.isEditorInput)(inputB)) {
                    return false; // we only support this for `IResourceEditorInputs` that are file based
                }
                if (arg1 instanceof files_1.FileChangesEvent) {
                    return arg1.contains(inputB.resource, 2 /* FileChangeType.DELETED */);
                }
                return this.matchesFile(inputB.resource, arg1);
            }
            if ((0, editor_1.isEditorInput)(arg1)) {
                if ((0, editor_1.isEditorInput)(inputB)) {
                    return arg1.matches(inputB);
                }
                return this.matchesFile(inputB.resource, arg1);
            }
            if ((0, editor_1.isEditorInput)(inputB)) {
                return this.matchesFile(arg1.resource, inputB);
            }
            return arg1 && inputB && this.uriIdentityService.extUri.isEqual(arg1.resource, inputB.resource);
        }
        matchesFile(resource, arg2) {
            if (arg2 instanceof files_1.FileChangesEvent) {
                return arg2.contains(resource, 2 /* FileChangeType.DELETED */);
            }
            if (arg2 instanceof files_1.FileOperationEvent) {
                return this.uriIdentityService.extUri.isEqualOrParent(resource, arg2.resource);
            }
            if ((0, editor_1.isEditorInput)(arg2)) {
                const inputResource = arg2.resource;
                if (!inputResource) {
                    return false;
                }
                if (this.lifecycleService.phase >= 3 /* LifecyclePhase.Restored */ && !this.fileService.hasProvider(inputResource)) {
                    return false; // make sure to only check this when workbench has restored (for https://github.com/microsoft/vscode/issues/48275)
                }
                return this.uriIdentityService.extUri.isEqual(inputResource, resource);
            }
            return this.uriIdentityService.extUri.isEqual(arg2?.resource, resource);
        }
        matchesEditorIdentifier(identifier, editorPane) {
            if (!editorPane?.group) {
                return false;
            }
            if (identifier.groupId !== editorPane.group.id) {
                return false;
            }
            return editorPane.input ? identifier.editor.matches(editorPane.input) : false;
        }
        onEditorDispose(editor, listener, mapEditorToDispose) {
            const toDispose = event_1.Event.once(editor.onWillDispose)(() => listener());
            let disposables = mapEditorToDispose.get(editor);
            if (!disposables) {
                disposables = new lifecycle_1.DisposableStore();
                mapEditorToDispose.set(editor, disposables);
            }
            disposables.add(toDispose);
        }
        clearOnEditorDispose(editor, mapEditorToDispose) {
            if (!(0, editor_1.isEditorInput)(editor)) {
                return; // only supported when passing in an actual editor input
            }
            const disposables = mapEditorToDispose.get(editor);
            if (disposables) {
                (0, lifecycle_1.dispose)(disposables);
                mapEditorToDispose.delete(editor);
            }
        }
    };
    EditorHelper = __decorate([
        __param(0, uriIdentity_1.IUriIdentityService),
        __param(1, lifecycle_2.ILifecycleService),
        __param(2, files_1.IFileService),
        __param(3, pathService_1.IPathService)
    ], EditorHelper);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9yeVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvaGlzdG9yeS9icm93c2VyL2hpc3RvcnlTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFrQ3pGLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWUsU0FBUSxzQkFBVTs7aUJBSXJCLDZCQUF3QixHQUFHLDZDQUE2QyxBQUFoRCxDQUFpRDtpQkFDekUsNkJBQXdCLEdBQUcsa0NBQWtDLEFBQXJDLENBQXNDO1FBT3RGLFlBQ2lCLGFBQWlELEVBQzNDLGtCQUF5RCxFQUNyRCxjQUF5RCxFQUNsRSxjQUFnRCxFQUMxQyxvQkFBNEQsRUFDckUsV0FBMEMsRUFDcEMsaUJBQXNELEVBQ25ELG9CQUE0RCxFQUMxRCxhQUF1RCxFQUM1RCxpQkFBc0Q7WUFFMUUsS0FBSyxFQUFFLENBQUM7WUFYeUIsa0JBQWEsR0FBYixhQUFhLENBQW1CO1lBQzFCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBc0I7WUFDcEMsbUJBQWMsR0FBZCxjQUFjLENBQTBCO1lBQ2pELG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUN6Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3BELGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ25CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDbEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUN6QyxrQkFBYSxHQUFiLGFBQWEsQ0FBeUI7WUFDM0Msc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQWYxRCwwQkFBcUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFDdkUscUJBQWdCLEdBQWtDLFNBQVMsQ0FBQztZQUVuRCxpQkFBWSxHQUFHLElBQUksQ0FBQyxv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