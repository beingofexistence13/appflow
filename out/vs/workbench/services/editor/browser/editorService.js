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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/editor", "vs/workbench/common/editor/editorInput", "vs/workbench/common/editor/sideBySideEditorInput", "vs/base/common/map", "vs/platform/files/common/files", "vs/base/common/event", "vs/base/common/uri", "vs/base/common/resources", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/base/common/arrays", "vs/editor/browser/editorBrowser", "vs/platform/instantiation/common/extensions", "vs/base/common/types", "vs/workbench/browser/parts/editor/editorsObserver", "vs/base/common/async", "vs/platform/workspace/common/workspace", "vs/base/common/extpath", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/editor/common/editorResolverService", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/host/browser/host", "vs/workbench/services/editor/common/editorGroupFinder", "vs/workbench/services/textfile/common/textEditorService"], function (require, exports, instantiation_1, editor_1, editorInput_1, sideBySideEditorInput_1, map_1, files_1, event_1, uri_1, resources_1, diffEditorInput_1, editorGroupsService_1, editorService_1, configuration_1, lifecycle_1, arrays_1, editorBrowser_1, extensions_1, types_1, editorsObserver_1, async_1, workspace_1, extpath_1, uriIdentity_1, editorResolverService_1, workspaceTrust_1, host_1, editorGroupFinder_1, textEditorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorService = void 0;
    let EditorService = class EditorService extends lifecycle_1.Disposable {
        //#endregion
        constructor(editorGroupService, instantiationService, fileService, configurationService, contextService, uriIdentityService, editorResolverService, workspaceTrustRequestService, hostService, textEditorService) {
            super();
            this.editorGroupService = editorGroupService;
            this.instantiationService = instantiationService;
            this.fileService = fileService;
            this.configurationService = configurationService;
            this.contextService = contextService;
            this.uriIdentityService = uriIdentityService;
            this.editorResolverService = editorResolverService;
            this.workspaceTrustRequestService = workspaceTrustRequestService;
            this.hostService = hostService;
            this.textEditorService = textEditorService;
            //#region events
            this._onDidActiveEditorChange = this._register(new event_1.Emitter());
            this.onDidActiveEditorChange = this._onDidActiveEditorChange.event;
            this._onDidVisibleEditorsChange = this._register(new event_1.Emitter());
            this.onDidVisibleEditorsChange = this._onDidVisibleEditorsChange.event;
            this._onDidEditorsChange = this._register(new event_1.Emitter());
            this.onDidEditorsChange = this._onDidEditorsChange.event;
            this._onDidCloseEditor = this._register(new event_1.Emitter());
            this.onDidCloseEditor = this._onDidCloseEditor.event;
            this._onDidOpenEditorFail = this._register(new event_1.Emitter());
            this.onDidOpenEditorFail = this._onDidOpenEditorFail.event;
            this._onDidMostRecentlyActiveEditorsChange = this._register(new event_1.Emitter());
            this.onDidMostRecentlyActiveEditorsChange = this._onDidMostRecentlyActiveEditorsChange.event;
            //#region Editor & group event handlers
            this.lastActiveEditor = undefined;
            //#endregion
            //#region Visible Editors Change: Install file watchers for out of workspace resources that became visible
            this.activeOutOfWorkspaceWatchers = new map_1.ResourceMap();
            this.closeOnFileDelete = false;
            //#endregion
            //#region Editor accessors
            this.editorsObserver = this._register(this.instantiationService.createInstance(editorsObserver_1.EditorsObserver));
            this.onConfigurationUpdated();
            this.registerListeners();
        }
        registerListeners() {
            // Editor & group changes
            this.editorGroupService.whenReady.then(() => this.onEditorGroupsReady());
            this._register(this.editorGroupService.onDidChangeActiveGroup(group => this.handleActiveEditorChange(group)));
            this._register(this.editorGroupService.onDidAddGroup(group => this.registerGroupListeners(group)));
            this._register(this.editorsObserver.onDidMostRecentlyActiveEditorsChange(() => this._onDidMostRecentlyActiveEditorsChange.fire()));
            // Out of workspace file watchers
            this._register(this.onDidVisibleEditorsChange(() => this.handleVisibleEditorsChange()));
            // File changes & operations
            // Note: there is some duplication with the two file event handlers- Since we cannot always rely on the disk events
            // carrying all necessary data in all environments, we also use the file operation events to make sure operations are handled.
            // In any case there is no guarantee if the local event is fired first or the disk one. Thus, code must handle the case
            // that the event ordering is random as well as might not carry all information needed.
            this._register(this.fileService.onDidRunOperation(e => this.onDidRunFileOperation(e)));
            this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
            // Configuration
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
        }
        onEditorGroupsReady() {
            // Register listeners to each opened group
            for (const group of this.editorGroupService.groups) {
                this.registerGroupListeners(group);
            }
            // Fire initial set of editor events if there is an active editor
            if (this.activeEditor) {
                this.doHandleActiveEditorChangeEvent();
                this._onDidVisibleEditorsChange.fire();
            }
        }
        handleActiveEditorChange(group) {
            if (group !== this.editorGroupService.activeGroup) {
                return; // ignore if not the active group
            }
            if (!this.lastActiveEditor && !group.activeEditor) {
                return; // ignore if we still have no active editor
            }
            this.doHandleActiveEditorChangeEvent();
        }
        doHandleActiveEditorChangeEvent() {
            // Remember as last active
            const activeGroup = this.editorGroupService.activeGroup;
            this.lastActiveEditor = activeGroup.activeEditor ?? undefined;
            // Fire event to outside parties
            this._onDidActiveEditorChange.fire();
        }
        registerGroupListeners(group) {
            const groupDisposables = new lifecycle_1.DisposableStore();
            groupDisposables.add(group.onDidModelChange(e => {
                this._onDidEditorsChange.fire({ groupId: group.id, event: e });
            }));
            groupDisposables.add(group.onDidActiveEditorChange(() => {
                this.handleActiveEditorChange(group);
                this._onDidVisibleEditorsChange.fire();
            }));
            groupDisposables.add(group.onDidCloseEditor(e => {
                this._onDidCloseEditor.fire(e);
            }));
            groupDisposables.add(group.onDidOpenEditorFail(editor => {
                this._onDidOpenEditorFail.fire({ editor, groupId: group.id });
            }));
            event_1.Event.once(group.onWillDispose)(() => {
                (0, lifecycle_1.dispose)(groupDisposables);
            });
        }
        handleVisibleEditorsChange() {
            const visibleOutOfWorkspaceResources = new map_1.ResourceSet();
            for (const editor of this.visibleEditors) {
                const resources = (0, arrays_1.distinct)((0, arrays_1.coalesce)([
                    editor_1.EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }),
                    editor_1.EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY })
                ]), resource => resource.toString());
                for (const resource of resources) {
                    if (this.fileService.hasProvider(resource) && !this.contextService.isInsideWorkspace(resource)) {
                        visibleOutOfWorkspaceResources.add(resource);
                    }
                }
            }
            // Handle no longer visible out of workspace resources
            for (const resource of this.activeOutOfWorkspaceWatchers.keys()) {
                if (!visibleOutOfWorkspaceResources.has(resource)) {
                    (0, lifecycle_1.dispose)(this.activeOutOfWorkspaceWatchers.get(resource));
                    this.activeOutOfWorkspaceWatchers.delete(resource);
                }
            }
            // Handle newly visible out of workspace resources
            for (const resource of visibleOutOfWorkspaceResources.keys()) {
                if (!this.activeOutOfWorkspaceWatchers.get(resource)) {
                    const disposable = this.fileService.watch(resource);
                    this.activeOutOfWorkspaceWatchers.set(resource, disposable);
                }
            }
        }
        //#endregion
        //#region File Changes: Move & Deletes to move or close opend editors
        async onDidRunFileOperation(e) {
            // Handle moves specially when file is opened
            if (e.isOperation(2 /* FileOperation.MOVE */)) {
                this.handleMovedFile(e.resource, e.target.resource);
            }
            // Handle deletes
            if (e.isOperation(1 /* FileOperation.DELETE */) || e.isOperation(2 /* FileOperation.MOVE */)) {
                this.handleDeletedFile(e.resource, false, e.target ? e.target.resource : undefined);
            }
        }
        onDidFilesChange(e) {
            if (e.gotDeleted()) {
                this.handleDeletedFile(e, true);
            }
        }
        async handleMovedFile(source, target) {
            for (const group of this.editorGroupService.groups) {
                const replacements = [];
                for (const editor of group.editors) {
                    const resource = editor.resource;
                    if (!resource || !this.uriIdentityService.extUri.isEqualOrParent(resource, source)) {
                        continue; // not matching our resource
                    }
                    // Determine new resulting target resource
                    let targetResource;
                    if (this.uriIdentityService.extUri.isEqual(source, resource)) {
                        targetResource = target; // file got moved
                    }
                    else {
                        const index = (0, extpath_1.indexOfPath)(resource.path, source.path, this.uriIdentityService.extUri.ignorePathCasing(resource));
                        targetResource = (0, resources_1.joinPath)(target, resource.path.substr(index + source.path.length + 1)); // parent folder got moved
                    }
                    // Delegate rename() to editor instance
                    const moveResult = await editor.rename(group.id, targetResource);
                    if (!moveResult) {
                        return; // not target - ignore
                    }
                    const optionOverrides = {
                        preserveFocus: true,
                        pinned: group.isPinned(editor),
                        sticky: group.isSticky(editor),
                        index: group.getIndexOfEditor(editor),
                        inactive: !group.isActive(editor)
                    };
                    // Construct a replacement with our extra options mixed in
                    if ((0, editor_1.isEditorInput)(moveResult.editor)) {
                        replacements.push({
                            editor,
                            replacement: moveResult.editor,
                            options: {
                                ...moveResult.options,
                                ...optionOverrides
                            }
                        });
                    }
                    else {
                        replacements.push({
                            editor,
                            replacement: {
                                ...moveResult.editor,
                                options: {
                                    ...moveResult.editor.options,
                                    ...optionOverrides
                                }
                            }
                        });
                    }
                }
                // Apply replacements
                if (replacements.length) {
                    this.replaceEditors(replacements, group);
                }
            }
        }
        onConfigurationUpdated(e) {
            if (e && !e.affectsConfiguration('workbench.editor.closeOnFileDelete')) {
                return;
            }
            const configuration = this.configurationService.getValue();
            if (typeof configuration.workbench?.editor?.closeOnFileDelete === 'boolean') {
                this.closeOnFileDelete = configuration.workbench.editor.closeOnFileDelete;
            }
            else {
                this.closeOnFileDelete = false; // default
            }
        }
        handleDeletedFile(arg1, isExternal, movedTo) {
            for (const editor of this.getAllNonDirtyEditors({ includeUntitled: false, supportSideBySide: true })) {
                (async () => {
                    const resource = editor.resource;
                    if (!resource) {
                        return;
                    }
                    // Handle deletes in opened editors depending on:
                    // - we close any editor when `closeOnFileDelete: true`
                    // - we close any editor when the delete occurred from within VSCode
                    if (this.closeOnFileDelete || !isExternal) {
                        // Do NOT close any opened editor that matches the resource path (either equal or being parent) of the
                        // resource we move to (movedTo). Otherwise we would close a resource that has been renamed to the same
                        // path but different casing.
                        if (movedTo && this.uriIdentityService.extUri.isEqualOrParent(resource, movedTo)) {
                            return;
                        }
                        let matches = false;
                        if (arg1 instanceof files_1.FileChangesEvent) {
                            matches = arg1.contains(resource, 2 /* FileChangeType.DELETED */);
                        }
                        else {
                            matches = this.uriIdentityService.extUri.isEqualOrParent(resource, arg1);
                        }
                        if (!matches) {
                            return;
                        }
                        // We have received reports of users seeing delete events even though the file still
                        // exists (network shares issue: https://github.com/microsoft/vscode/issues/13665).
                        // Since we do not want to close an editor without reason, we have to check if the
                        // file is really gone and not just a faulty file event.
                        // This only applies to external file events, so we need to check for the isExternal
                        // flag.
                        let exists = false;
                        if (isExternal && this.fileService.hasProvider(resource)) {
                            await (0, async_1.timeout)(100);
                            exists = await this.fileService.exists(resource);
                        }
                        if (!exists && !editor.isDisposed()) {
                            editor.dispose();
                        }
                    }
                })();
            }
        }
        getAllNonDirtyEditors(options) {
            const editors = [];
            function conditionallyAddEditor(editor) {
                if (editor.hasCapability(4 /* EditorInputCapabilities.Untitled */) && !options.includeUntitled) {
                    return;
                }
                if (editor.isDirty()) {
                    return;
                }
                editors.push(editor);
            }
            for (const editor of this.editors) {
                if (options.supportSideBySide && editor instanceof sideBySideEditorInput_1.SideBySideEditorInput) {
                    conditionallyAddEditor(editor.primary);
                    conditionallyAddEditor(editor.secondary);
                }
                else {
                    conditionallyAddEditor(editor);
                }
            }
            return editors;
        }
        get activeEditorPane() {
            return this.editorGroupService.activeGroup?.activeEditorPane;
        }
        get activeTextEditorControl() {
            const activeEditorPane = this.activeEditorPane;
            if (activeEditorPane) {
                const activeControl = activeEditorPane.getControl();
                if ((0, editorBrowser_1.isCodeEditor)(activeControl) || (0, editorBrowser_1.isDiffEditor)(activeControl)) {
                    return activeControl;
                }
                if ((0, editorBrowser_1.isCompositeEditor)(activeControl) && (0, editorBrowser_1.isCodeEditor)(activeControl.activeCodeEditor)) {
                    return activeControl.activeCodeEditor;
                }
            }
            return undefined;
        }
        get activeTextEditorLanguageId() {
            let activeCodeEditor = undefined;
            const activeTextEditorControl = this.activeTextEditorControl;
            if ((0, editorBrowser_1.isDiffEditor)(activeTextEditorControl)) {
                activeCodeEditor = activeTextEditorControl.getModifiedEditor();
            }
            else {
                activeCodeEditor = activeTextEditorControl;
            }
            return activeCodeEditor?.getModel()?.getLanguageId();
        }
        get count() {
            return this.editorsObserver.count;
        }
        get editors() {
            return this.getEditors(1 /* EditorsOrder.SEQUENTIAL */).map(({ editor }) => editor);
        }
        getEditors(order, options) {
            switch (order) {
                // MRU
                case 0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */:
                    if (options?.excludeSticky) {
                        return this.editorsObserver.editors.filter(({ groupId, editor }) => !this.editorGroupService.getGroup(groupId)?.isSticky(editor));
                    }
                    return this.editorsObserver.editors;
                // Sequential
                case 1 /* EditorsOrder.SEQUENTIAL */: {
                    const editors = [];
                    for (const group of this.editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)) {
                        editors.push(...group.getEditors(1 /* EditorsOrder.SEQUENTIAL */, options).map(editor => ({ editor, groupId: group.id })));
                    }
                    return editors;
                }
            }
        }
        get activeEditor() {
            const activeGroup = this.editorGroupService.activeGroup;
            return activeGroup ? activeGroup.activeEditor ?? undefined : undefined;
        }
        get visibleEditorPanes() {
            return (0, arrays_1.coalesce)(this.editorGroupService.groups.map(group => group.activeEditorPane));
        }
        get visibleTextEditorControls() {
            const visibleTextEditorControls = [];
            for (const visibleEditorPane of this.visibleEditorPanes) {
                const control = visibleEditorPane.getControl();
                if ((0, editorBrowser_1.isCodeEditor)(control) || (0, editorBrowser_1.isDiffEditor)(control)) {
                    visibleTextEditorControls.push(control);
                }
            }
            return visibleTextEditorControls;
        }
        get visibleEditors() {
            return (0, arrays_1.coalesce)(this.editorGroupService.groups.map(group => group.activeEditor));
        }
        async openEditor(editor, optionsOrPreferredGroup, preferredGroup) {
            let typedEditor = undefined;
            let options = (0, editor_1.isEditorInput)(editor) ? optionsOrPreferredGroup : editor.options;
            let group = undefined;
            if ((0, editorService_1.isPreferredGroup)(optionsOrPreferredGroup)) {
                preferredGroup = optionsOrPreferredGroup;
            }
            // Resolve override unless disabled
            if (!(0, editor_1.isEditorInput)(editor)) {
                const resolvedEditor = await this.editorResolverService.resolveEditor(editor, preferredGroup);
                if (resolvedEditor === 1 /* ResolvedStatus.ABORT */) {
                    return; // skip editor if override is aborted
                }
                // We resolved an editor to use
                if ((0, editor_1.isEditorInputWithOptionsAndGroup)(resolvedEditor)) {
                    typedEditor = resolvedEditor.editor;
                    options = resolvedEditor.options;
                    group = resolvedEditor.group;
                }
            }
            // Override is disabled or did not apply: fallback to default
            if (!typedEditor) {
                typedEditor = (0, editor_1.isEditorInput)(editor) ? editor : await this.textEditorService.resolveTextEditor(editor);
            }
            // If group still isn't defined because of a disabled override we resolve it
            if (!group) {
                let activation = undefined;
                ([group, activation] = this.instantiationService.invokeFunction(editorGroupFinder_1.findGroup, { editor: typedEditor, options }, preferredGroup));
                // Mixin editor group activation if returned
                if (activation) {
                    options = { ...options, activation };
                }
            }
            return group.openEditor(typedEditor, options);
        }
        async openEditors(editors, preferredGroup, options) {
            // Pass all editors to trust service to determine if
            // we should proceed with opening the editors if we
            // are asked to validate trust.
            if (options?.validateTrust) {
                const editorsTrusted = await this.handleWorkspaceTrust(editors);
                if (!editorsTrusted) {
                    return [];
                }
            }
            // Find target groups for editors to open
            const mapGroupToTypedEditors = new Map();
            for (const editor of editors) {
                let typedEditor = undefined;
                let group = undefined;
                // Resolve override unless disabled
                if (!(0, editor_1.isEditorInputWithOptions)(editor)) {
                    const resolvedEditor = await this.editorResolverService.resolveEditor(editor, preferredGroup);
                    if (resolvedEditor === 1 /* ResolvedStatus.ABORT */) {
                        continue; // skip editor if override is aborted
                    }
                    // We resolved an editor to use
                    if ((0, editor_1.isEditorInputWithOptionsAndGroup)(resolvedEditor)) {
                        typedEditor = resolvedEditor;
                        group = resolvedEditor.group;
                    }
                }
                // Override is disabled or did not apply: fallback to default
                if (!typedEditor) {
                    typedEditor = (0, editor_1.isEditorInputWithOptions)(editor) ? editor : { editor: await this.textEditorService.resolveTextEditor(editor), options: editor.options };
                }
                // If group still isn't defined because of a disabled override we resolve it
                if (!group) {
                    [group] = this.instantiationService.invokeFunction(editorGroupFinder_1.findGroup, typedEditor, preferredGroup);
                }
                // Update map of groups to editors
                let targetGroupEditors = mapGroupToTypedEditors.get(group);
                if (!targetGroupEditors) {
                    targetGroupEditors = [];
                    mapGroupToTypedEditors.set(group, targetGroupEditors);
                }
                targetGroupEditors.push(typedEditor);
            }
            // Open in target groups
            const result = [];
            for (const [group, editors] of mapGroupToTypedEditors) {
                result.push(group.openEditors(editors));
            }
            return (0, arrays_1.coalesce)(await async_1.Promises.settled(result));
        }
        async handleWorkspaceTrust(editors) {
            const { resources, diffMode, mergeMode } = this.extractEditorResources(editors);
            const trustResult = await this.workspaceTrustRequestService.requestOpenFilesTrust(resources);
            switch (trustResult) {
                case 1 /* WorkspaceTrustUriResponse.Open */:
                    return true;
                case 2 /* WorkspaceTrustUriResponse.OpenInNewWindow */:
                    await this.hostService.openWindow(resources.map(resource => ({ fileUri: resource })), { forceNewWindow: true, diffMode, mergeMode });
                    return false;
                case 3 /* WorkspaceTrustUriResponse.Cancel */:
                    return false;
            }
        }
        extractEditorResources(editors) {
            const resources = new map_1.ResourceSet();
            let diffMode = false;
            let mergeMode = false;
            for (const editor of editors) {
                // Typed Editor
                if ((0, editor_1.isEditorInputWithOptions)(editor)) {
                    const resource = editor_1.EditorResourceAccessor.getOriginalUri(editor.editor, { supportSideBySide: editor_1.SideBySideEditor.BOTH });
                    if (uri_1.URI.isUri(resource)) {
                        resources.add(resource);
                    }
                    else if (resource) {
                        if (resource.primary) {
                            resources.add(resource.primary);
                        }
                        if (resource.secondary) {
                            resources.add(resource.secondary);
                        }
                        diffMode = editor.editor instanceof diffEditorInput_1.DiffEditorInput;
                    }
                }
                // Untyped editor
                else {
                    if ((0, editor_1.isResourceMergeEditorInput)(editor)) {
                        if (uri_1.URI.isUri(editor.input1)) {
                            resources.add(editor.input1.resource);
                        }
                        if (uri_1.URI.isUri(editor.input2)) {
                            resources.add(editor.input2.resource);
                        }
                        if (uri_1.URI.isUri(editor.base)) {
                            resources.add(editor.base.resource);
                        }
                        if (uri_1.URI.isUri(editor.result)) {
                            resources.add(editor.result.resource);
                        }
                        mergeMode = true;
                    }
                    if ((0, editor_1.isResourceDiffEditorInput)(editor)) {
                        if (uri_1.URI.isUri(editor.original.resource)) {
                            resources.add(editor.original.resource);
                        }
                        if (uri_1.URI.isUri(editor.modified.resource)) {
                            resources.add(editor.modified.resource);
                        }
                        diffMode = true;
                    }
                    else if ((0, editor_1.isResourceEditorInput)(editor)) {
                        resources.add(editor.resource);
                    }
                }
            }
            return {
                resources: Array.from(resources.keys()),
                diffMode,
                mergeMode
            };
        }
        //#endregion
        //#region isOpened()
        isOpened(editor) {
            return this.editorsObserver.hasEditor({
                resource: this.uriIdentityService.asCanonicalUri(editor.resource),
                typeId: editor.typeId,
                editorId: editor.editorId
            });
        }
        //#endregion
        //#region isOpened()
        isVisible(editor) {
            for (const group of this.editorGroupService.groups) {
                if (group.activeEditor?.matches(editor)) {
                    return true;
                }
            }
            return false;
        }
        //#endregion
        //#region closeEditor()
        async closeEditor({ editor, groupId }, options) {
            const group = this.editorGroupService.getGroup(groupId);
            await group?.closeEditor(editor, options);
        }
        //#endregion
        //#region closeEditors()
        async closeEditors(editors, options) {
            const mapGroupToEditors = new Map();
            for (const { editor, groupId } of editors) {
                const group = this.editorGroupService.getGroup(groupId);
                if (!group) {
                    continue;
                }
                let editors = mapGroupToEditors.get(group);
                if (!editors) {
                    editors = [];
                    mapGroupToEditors.set(group, editors);
                }
                editors.push(editor);
            }
            for (const [group, editors] of mapGroupToEditors) {
                await group.closeEditors(editors, options);
            }
        }
        findEditors(arg1, options, arg2) {
            const resource = uri_1.URI.isUri(arg1) ? arg1 : arg1.resource;
            const typeId = uri_1.URI.isUri(arg1) ? undefined : arg1.typeId;
            // Do a quick check for the resource via the editor observer
            // which is a very efficient way to find an editor by resource.
            // However, we can only do that unless we are asked to find an
            // editor on the secondary side of a side by side editor, because
            // the editor observer provides fast lookups only for primary
            // editors.
            if (options?.supportSideBySide !== editor_1.SideBySideEditor.ANY && options?.supportSideBySide !== editor_1.SideBySideEditor.SECONDARY) {
                if (!this.editorsObserver.hasEditors(resource)) {
                    if (uri_1.URI.isUri(arg1) || (0, types_1.isUndefined)(arg2)) {
                        return [];
                    }
                    return undefined;
                }
            }
            // Search only in specific group
            if (!(0, types_1.isUndefined)(arg2)) {
                const targetGroup = typeof arg2 === 'number' ? this.editorGroupService.getGroup(arg2) : arg2;
                // Resource provided: result is an array
                if (uri_1.URI.isUri(arg1)) {
                    if (!targetGroup) {
                        return [];
                    }
                    return targetGroup.findEditors(resource, options);
                }
                // Editor identifier provided, result is single
                else {
                    if (!targetGroup) {
                        return undefined;
                    }
                    const editors = targetGroup.findEditors(resource, options);
                    for (const editor of editors) {
                        if (editor.typeId === typeId) {
                            return editor;
                        }
                    }
                    return undefined;
                }
            }
            // Search across all groups in MRU order
            else {
                const result = [];
                for (const group of this.editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
                    const editors = [];
                    // Resource provided: result is an array
                    if (uri_1.URI.isUri(arg1)) {
                        editors.push(...this.findEditors(arg1, options, group));
                    }
                    // Editor identifier provided, result is single
                    else {
                        const editor = this.findEditors(arg1, options, group);
                        if (editor) {
                            editors.push(editor);
                        }
                    }
                    result.push(...editors.map(editor => ({ editor, groupId: group.id })));
                }
                return result;
            }
        }
        async replaceEditors(replacements, group) {
            const targetGroup = typeof group === 'number' ? this.editorGroupService.getGroup(group) : group;
            // Convert all replacements to typed editors unless already
            // typed and handle overrides properly.
            const typedReplacements = [];
            for (const replacement of replacements) {
                let typedReplacement = undefined;
                // Resolve override unless disabled
                if (!(0, editor_1.isEditorInput)(replacement.replacement)) {
                    const resolvedEditor = await this.editorResolverService.resolveEditor(replacement.replacement, targetGroup);
                    if (resolvedEditor === 1 /* ResolvedStatus.ABORT */) {
                        continue; // skip editor if override is aborted
                    }
                    // We resolved an editor to use
                    if ((0, editor_1.isEditorInputWithOptionsAndGroup)(resolvedEditor)) {
                        typedReplacement = {
                            editor: replacement.editor,
                            replacement: resolvedEditor.editor,
                            options: resolvedEditor.options,
                            forceReplaceDirty: replacement.forceReplaceDirty
                        };
                    }
                }
                // Override is disabled or did not apply: fallback to default
                if (!typedReplacement) {
                    typedReplacement = {
                        editor: replacement.editor,
                        replacement: (0, editorGroupsService_1.isEditorReplacement)(replacement) ? replacement.replacement : await this.textEditorService.resolveTextEditor(replacement.replacement),
                        options: (0, editorGroupsService_1.isEditorReplacement)(replacement) ? replacement.options : replacement.replacement.options,
                        forceReplaceDirty: replacement.forceReplaceDirty
                    };
                }
                typedReplacements.push(typedReplacement);
            }
            return targetGroup?.replaceEditors(typedReplacements);
        }
        //#endregion
        //#region save/revert
        async save(editors, options) {
            // Convert to array
            if (!Array.isArray(editors)) {
                editors = [editors];
            }
            // Make sure to not save the same editor multiple times
            // by using the `matches()` method to find duplicates
            const uniqueEditors = this.getUniqueEditors(editors);
            // Split editors up into a bucket that is saved in parallel
            // and sequentially. Unless "Save As", all non-untitled editors
            // can be saved in parallel to speed up the operation. Remaining
            // editors are potentially bringing up some UI and thus run
            // sequentially.
            const editorsToSaveParallel = [];
            const editorsToSaveSequentially = [];
            if (options?.saveAs) {
                editorsToSaveSequentially.push(...uniqueEditors);
            }
            else {
                for (const { groupId, editor } of uniqueEditors) {
                    if (editor.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                        editorsToSaveSequentially.push({ groupId, editor });
                    }
                    else {
                        editorsToSaveParallel.push({ groupId, editor });
                    }
                }
            }
            // Editors to save in parallel
            const saveResults = await async_1.Promises.settled(editorsToSaveParallel.map(({ groupId, editor }) => {
                // Use save as a hint to pin the editor if used explicitly
                if (options?.reason === 1 /* SaveReason.EXPLICIT */) {
                    this.editorGroupService.getGroup(groupId)?.pinEditor(editor);
                }
                // Save
                return editor.save(groupId, options);
            }));
            // Editors to save sequentially
            for (const { groupId, editor } of editorsToSaveSequentially) {
                if (editor.isDisposed()) {
                    continue; // might have been disposed from the save already
                }
                // Preserve view state by opening the editor first if the editor
                // is untitled or we "Save As". This also allows the user to review
                // the contents of the editor before making a decision.
                const editorPane = await this.openEditor(editor, groupId);
                const editorOptions = {
                    pinned: true,
                    viewState: editorPane?.getViewState()
                };
                const result = options?.saveAs ? await editor.saveAs(groupId, options) : await editor.save(groupId, options);
                saveResults.push(result);
                if (!result) {
                    break; // failed or cancelled, abort
                }
                // Replace editor preserving viewstate (either across all groups or
                // only selected group) if the resulting editor is different from the
                // current one.
                if (!editor.matches(result)) {
                    const targetGroups = editor.hasCapability(4 /* EditorInputCapabilities.Untitled */) ? this.editorGroupService.groups.map(group => group.id) /* untitled replaces across all groups */ : [groupId];
                    for (const targetGroup of targetGroups) {
                        if (result instanceof editorInput_1.EditorInput) {
                            await this.replaceEditors([{ editor, replacement: result, options: editorOptions }], targetGroup);
                        }
                        else {
                            await this.replaceEditors([{ editor, replacement: { ...result, options: editorOptions } }], targetGroup);
                        }
                    }
                }
            }
            return {
                success: saveResults.every(result => !!result),
                editors: (0, arrays_1.coalesce)(saveResults)
            };
        }
        saveAll(options) {
            return this.save(this.getAllModifiedEditors(options), options);
        }
        async revert(editors, options) {
            // Convert to array
            if (!Array.isArray(editors)) {
                editors = [editors];
            }
            // Make sure to not revert the same editor multiple times
            // by using the `matches()` method to find duplicates
            const uniqueEditors = this.getUniqueEditors(editors);
            await async_1.Promises.settled(uniqueEditors.map(async ({ groupId, editor }) => {
                // Use revert as a hint to pin the editor
                this.editorGroupService.getGroup(groupId)?.pinEditor(editor);
                return editor.revert(groupId, options);
            }));
            return !uniqueEditors.some(({ editor }) => editor.isDirty());
        }
        async revertAll(options) {
            return this.revert(this.getAllModifiedEditors(options), options);
        }
        getAllModifiedEditors(options) {
            const editors = [];
            for (const group of this.editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
                for (const editor of group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */)) {
                    if (!editor.isModified()) {
                        continue;
                    }
                    if ((typeof options?.includeUntitled === 'boolean' || !options?.includeUntitled?.includeScratchpad)
                        && editor.hasCapability(512 /* EditorInputCapabilities.Scratchpad */)) {
                        continue;
                    }
                    if (!options?.includeUntitled && editor.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                        continue;
                    }
                    if (options?.excludeSticky && group.isSticky(editor)) {
                        continue;
                    }
                    editors.push({ groupId: group.id, editor });
                }
            }
            return editors;
        }
        getUniqueEditors(editors) {
            const uniqueEditors = [];
            for (const { editor, groupId } of editors) {
                if (uniqueEditors.some(uniqueEditor => uniqueEditor.editor.matches(editor))) {
                    continue;
                }
                uniqueEditors.push({ editor, groupId });
            }
            return uniqueEditors;
        }
        //#endregion
        dispose() {
            super.dispose();
            // Dispose remaining watchers if any
            this.activeOutOfWorkspaceWatchers.forEach(disposable => (0, lifecycle_1.dispose)(disposable));
            this.activeOutOfWorkspaceWatchers.clear();
        }
    };
    exports.EditorService = EditorService;
    exports.EditorService = EditorService = __decorate([
        __param(0, editorGroupsService_1.IEditorGroupsService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, files_1.IFileService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, uriIdentity_1.IUriIdentityService),
        __param(6, editorResolverService_1.IEditorResolverService),
        __param(7, workspaceTrust_1.IWorkspaceTrustRequestService),
        __param(8, host_1.IHostService),
        __param(9, textEditorService_1.ITextEditorService)
    ], EditorService);
    (0, extensions_1.registerSingleton)(editorService_1.IEditorService, EditorService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9lZGl0b3IvYnJvd3Nlci9lZGl0b3JTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlDekYsSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYyxTQUFRLHNCQUFVO1FBd0I1QyxZQUFZO1FBRVosWUFDdUIsa0JBQXlELEVBQ3hELG9CQUE0RCxFQUNyRSxXQUEwQyxFQUNqQyxvQkFBNEQsRUFDekQsY0FBeUQsRUFDOUQsa0JBQXdELEVBQ3JELHFCQUE4RCxFQUN2RCw0QkFBNEUsRUFDN0YsV0FBMEMsRUFDcEMsaUJBQXNEO1lBRTFFLEtBQUssRUFBRSxDQUFDO1lBWCtCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBc0I7WUFDdkMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNwRCxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNoQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3hDLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQUM3Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ3BDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBd0I7WUFDdEMsaUNBQTRCLEdBQTVCLDRCQUE0QixDQUErQjtZQUM1RSxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNuQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBaEMzRSxnQkFBZ0I7WUFFQyw2QkFBd0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUN2RSw0QkFBdUIsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDO1lBRXRELCtCQUEwQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FB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