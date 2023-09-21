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
    exports.$Lyb = void 0;
    let $Lyb = class $Lyb extends lifecycle_1.$kc {
        //#endregion
        constructor(j, m, n, r, s, t, u, w, y, z) {
            super();
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            //#region events
            this.a = this.B(new event_1.$fd());
            this.onDidActiveEditorChange = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidVisibleEditorsChange = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidEditorsChange = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidCloseEditor = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidOpenEditorFail = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onDidMostRecentlyActiveEditorsChange = this.h.event;
            //#region Editor & group event handlers
            this.D = undefined;
            //#endregion
            //#region Visible Editors Change: Install file watchers for out of workspace resources that became visible
            this.J = new map_1.$zi();
            this.P = false;
            //#endregion
            //#region Editor accessors
            this.U = this.B(this.m.createInstance(editorsObserver_1.$Kyb));
            this.Q();
            this.C();
        }
        C() {
            // Editor & group changes
            this.j.whenReady.then(() => this.F());
            this.B(this.j.onDidChangeActiveGroup(group => this.G(group)));
            this.B(this.j.onDidAddGroup(group => this.I(group)));
            this.B(this.U.onDidMostRecentlyActiveEditorsChange(() => this.h.fire()));
            // Out of workspace file watchers
            this.B(this.onDidVisibleEditorsChange(() => this.L()));
            // File changes & operations
            // Note: there is some duplication with the two file event handlers- Since we cannot always rely on the disk events
            // carrying all necessary data in all environments, we also use the file operation events to make sure operations are handled.
            // In any case there is no guarantee if the local event is fired first or the disk one. Thus, code must handle the case
            // that the event ordering is random as well as might not carry all information needed.
            this.B(this.n.onDidRunOperation(e => this.M(e)));
            this.B(this.n.onDidFilesChange(e => this.N(e)));
            // Configuration
            this.B(this.r.onDidChangeConfiguration(e => this.Q(e)));
        }
        F() {
            // Register listeners to each opened group
            for (const group of this.j.groups) {
                this.I(group);
            }
            // Fire initial set of editor events if there is an active editor
            if (this.activeEditor) {
                this.H();
                this.b.fire();
            }
        }
        G(group) {
            if (group !== this.j.activeGroup) {
                return; // ignore if not the active group
            }
            if (!this.D && !group.activeEditor) {
                return; // ignore if we still have no active editor
            }
            this.H();
        }
        H() {
            // Remember as last active
            const activeGroup = this.j.activeGroup;
            this.D = activeGroup.activeEditor ?? undefined;
            // Fire event to outside parties
            this.a.fire();
        }
        I(group) {
            const groupDisposables = new lifecycle_1.$jc();
            groupDisposables.add(group.onDidModelChange(e => {
                this.c.fire({ groupId: group.id, event: e });
            }));
            groupDisposables.add(group.onDidActiveEditorChange(() => {
                this.G(group);
                this.b.fire();
            }));
            groupDisposables.add(group.onDidCloseEditor(e => {
                this.f.fire(e);
            }));
            groupDisposables.add(group.onDidOpenEditorFail(editor => {
                this.g.fire({ editor, groupId: group.id });
            }));
            event_1.Event.once(group.onWillDispose)(() => {
                (0, lifecycle_1.$fc)(groupDisposables);
            });
        }
        L() {
            const visibleOutOfWorkspaceResources = new map_1.$Ai();
            for (const editor of this.visibleEditors) {
                const resources = (0, arrays_1.$Kb)((0, arrays_1.$Fb)([
                    editor_1.$3E.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }),
                    editor_1.$3E.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY })
                ]), resource => resource.toString());
                for (const resource of resources) {
                    if (this.n.hasProvider(resource) && !this.s.isInsideWorkspace(resource)) {
                        visibleOutOfWorkspaceResources.add(resource);
                    }
                }
            }
            // Handle no longer visible out of workspace resources
            for (const resource of this.J.keys()) {
                if (!visibleOutOfWorkspaceResources.has(resource)) {
                    (0, lifecycle_1.$fc)(this.J.get(resource));
                    this.J.delete(resource);
                }
            }
            // Handle newly visible out of workspace resources
            for (const resource of visibleOutOfWorkspaceResources.keys()) {
                if (!this.J.get(resource)) {
                    const disposable = this.n.watch(resource);
                    this.J.set(resource, disposable);
                }
            }
        }
        //#endregion
        //#region File Changes: Move & Deletes to move or close opend editors
        async M(e) {
            // Handle moves specially when file is opened
            if (e.isOperation(2 /* FileOperation.MOVE */)) {
                this.O(e.resource, e.target.resource);
            }
            // Handle deletes
            if (e.isOperation(1 /* FileOperation.DELETE */) || e.isOperation(2 /* FileOperation.MOVE */)) {
                this.R(e.resource, false, e.target ? e.target.resource : undefined);
            }
        }
        N(e) {
            if (e.gotDeleted()) {
                this.R(e, true);
            }
        }
        async O(source, target) {
            for (const group of this.j.groups) {
                const replacements = [];
                for (const editor of group.editors) {
                    const resource = editor.resource;
                    if (!resource || !this.t.extUri.isEqualOrParent(resource, source)) {
                        continue; // not matching our resource
                    }
                    // Determine new resulting target resource
                    let targetResource;
                    if (this.t.extUri.isEqual(source, resource)) {
                        targetResource = target; // file got moved
                    }
                    else {
                        const index = (0, extpath_1.$Of)(resource.path, source.path, this.t.extUri.ignorePathCasing(resource));
                        targetResource = (0, resources_1.$ig)(target, resource.path.substr(index + source.path.length + 1)); // parent folder got moved
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
                    if ((0, editor_1.$UE)(moveResult.editor)) {
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
        Q(e) {
            if (e && !e.affectsConfiguration('workbench.editor.closeOnFileDelete')) {
                return;
            }
            const configuration = this.r.getValue();
            if (typeof configuration.workbench?.editor?.closeOnFileDelete === 'boolean') {
                this.P = configuration.workbench.editor.closeOnFileDelete;
            }
            else {
                this.P = false; // default
            }
        }
        R(arg1, isExternal, movedTo) {
            for (const editor of this.S({ includeUntitled: false, supportSideBySide: true })) {
                (async () => {
                    const resource = editor.resource;
                    if (!resource) {
                        return;
                    }
                    // Handle deletes in opened editors depending on:
                    // - we close any editor when `closeOnFileDelete: true`
                    // - we close any editor when the delete occurred from within VSCode
                    if (this.P || !isExternal) {
                        // Do NOT close any opened editor that matches the resource path (either equal or being parent) of the
                        // resource we move to (movedTo). Otherwise we would close a resource that has been renamed to the same
                        // path but different casing.
                        if (movedTo && this.t.extUri.isEqualOrParent(resource, movedTo)) {
                            return;
                        }
                        let matches = false;
                        if (arg1 instanceof files_1.$lk) {
                            matches = arg1.contains(resource, 2 /* FileChangeType.DELETED */);
                        }
                        else {
                            matches = this.t.extUri.isEqualOrParent(resource, arg1);
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
                        if (isExternal && this.n.hasProvider(resource)) {
                            await (0, async_1.$Hg)(100);
                            exists = await this.n.exists(resource);
                        }
                        if (!exists && !editor.isDisposed()) {
                            editor.dispose();
                        }
                    }
                })();
            }
        }
        S(options) {
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
                if (options.supportSideBySide && editor instanceof sideBySideEditorInput_1.$VC) {
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
            return this.j.activeGroup?.activeEditorPane;
        }
        get activeTextEditorControl() {
            const activeEditorPane = this.activeEditorPane;
            if (activeEditorPane) {
                const activeControl = activeEditorPane.getControl();
                if ((0, editorBrowser_1.$iV)(activeControl) || (0, editorBrowser_1.$jV)(activeControl)) {
                    return activeControl;
                }
                if ((0, editorBrowser_1.$kV)(activeControl) && (0, editorBrowser_1.$iV)(activeControl.activeCodeEditor)) {
                    return activeControl.activeCodeEditor;
                }
            }
            return undefined;
        }
        get activeTextEditorLanguageId() {
            let activeCodeEditor = undefined;
            const activeTextEditorControl = this.activeTextEditorControl;
            if ((0, editorBrowser_1.$jV)(activeTextEditorControl)) {
                activeCodeEditor = activeTextEditorControl.getModifiedEditor();
            }
            else {
                activeCodeEditor = activeTextEditorControl;
            }
            return activeCodeEditor?.getModel()?.getLanguageId();
        }
        get count() {
            return this.U.count;
        }
        get editors() {
            return this.getEditors(1 /* EditorsOrder.SEQUENTIAL */).map(({ editor }) => editor);
        }
        getEditors(order, options) {
            switch (order) {
                // MRU
                case 0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */:
                    if (options?.excludeSticky) {
                        return this.U.editors.filter(({ groupId, editor }) => !this.j.getGroup(groupId)?.isSticky(editor));
                    }
                    return this.U.editors;
                // Sequential
                case 1 /* EditorsOrder.SEQUENTIAL */: {
                    const editors = [];
                    for (const group of this.j.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)) {
                        editors.push(...group.getEditors(1 /* EditorsOrder.SEQUENTIAL */, options).map(editor => ({ editor, groupId: group.id })));
                    }
                    return editors;
                }
            }
        }
        get activeEditor() {
            const activeGroup = this.j.activeGroup;
            return activeGroup ? activeGroup.activeEditor ?? undefined : undefined;
        }
        get visibleEditorPanes() {
            return (0, arrays_1.$Fb)(this.j.groups.map(group => group.activeEditorPane));
        }
        get visibleTextEditorControls() {
            const visibleTextEditorControls = [];
            for (const visibleEditorPane of this.visibleEditorPanes) {
                const control = visibleEditorPane.getControl();
                if ((0, editorBrowser_1.$iV)(control) || (0, editorBrowser_1.$jV)(control)) {
                    visibleTextEditorControls.push(control);
                }
            }
            return visibleTextEditorControls;
        }
        get visibleEditors() {
            return (0, arrays_1.$Fb)(this.j.groups.map(group => group.activeEditor));
        }
        async openEditor(editor, optionsOrPreferredGroup, preferredGroup) {
            let typedEditor = undefined;
            let options = (0, editor_1.$UE)(editor) ? optionsOrPreferredGroup : editor.options;
            let group = undefined;
            if ((0, editorService_1.$_C)(optionsOrPreferredGroup)) {
                preferredGroup = optionsOrPreferredGroup;
            }
            // Resolve override unless disabled
            if (!(0, editor_1.$UE)(editor)) {
                const resolvedEditor = await this.u.resolveEditor(editor, preferredGroup);
                if (resolvedEditor === 1 /* ResolvedStatus.ABORT */) {
                    return; // skip editor if override is aborted
                }
                // We resolved an editor to use
                if ((0, editor_1.$ZE)(resolvedEditor)) {
                    typedEditor = resolvedEditor.editor;
                    options = resolvedEditor.options;
                    group = resolvedEditor.group;
                }
            }
            // Override is disabled or did not apply: fallback to default
            if (!typedEditor) {
                typedEditor = (0, editor_1.$UE)(editor) ? editor : await this.z.resolveTextEditor(editor);
            }
            // If group still isn't defined because of a disabled override we resolve it
            if (!group) {
                let activation = undefined;
                ([group, activation] = this.m.invokeFunction(editorGroupFinder_1.$Rxb, { editor: typedEditor, options }, preferredGroup));
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
                const editorsTrusted = await this.W(editors);
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
                if (!(0, editor_1.$YE)(editor)) {
                    const resolvedEditor = await this.u.resolveEditor(editor, preferredGroup);
                    if (resolvedEditor === 1 /* ResolvedStatus.ABORT */) {
                        continue; // skip editor if override is aborted
                    }
                    // We resolved an editor to use
                    if ((0, editor_1.$ZE)(resolvedEditor)) {
                        typedEditor = resolvedEditor;
                        group = resolvedEditor.group;
                    }
                }
                // Override is disabled or did not apply: fallback to default
                if (!typedEditor) {
                    typedEditor = (0, editor_1.$YE)(editor) ? editor : { editor: await this.z.resolveTextEditor(editor), options: editor.options };
                }
                // If group still isn't defined because of a disabled override we resolve it
                if (!group) {
                    [group] = this.m.invokeFunction(editorGroupFinder_1.$Rxb, typedEditor, preferredGroup);
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
            return (0, arrays_1.$Fb)(await async_1.Promises.settled(result));
        }
        async W(editors) {
            const { resources, diffMode, mergeMode } = this.X(editors);
            const trustResult = await this.w.requestOpenFilesTrust(resources);
            switch (trustResult) {
                case 1 /* WorkspaceTrustUriResponse.Open */:
                    return true;
                case 2 /* WorkspaceTrustUriResponse.OpenInNewWindow */:
                    await this.y.openWindow(resources.map(resource => ({ fileUri: resource })), { forceNewWindow: true, diffMode, mergeMode });
                    return false;
                case 3 /* WorkspaceTrustUriResponse.Cancel */:
                    return false;
            }
        }
        X(editors) {
            const resources = new map_1.$Ai();
            let diffMode = false;
            let mergeMode = false;
            for (const editor of editors) {
                // Typed Editor
                if ((0, editor_1.$YE)(editor)) {
                    const resource = editor_1.$3E.getOriginalUri(editor.editor, { supportSideBySide: editor_1.SideBySideEditor.BOTH });
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
                        diffMode = editor.editor instanceof diffEditorInput_1.$3eb;
                    }
                }
                // Untyped editor
                else {
                    if ((0, editor_1.$RE)(editor)) {
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
                    if ((0, editor_1.$OE)(editor)) {
                        if (uri_1.URI.isUri(editor.original.resource)) {
                            resources.add(editor.original.resource);
                        }
                        if (uri_1.URI.isUri(editor.modified.resource)) {
                            resources.add(editor.modified.resource);
                        }
                        diffMode = true;
                    }
                    else if ((0, editor_1.$NE)(editor)) {
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
            return this.U.hasEditor({
                resource: this.t.asCanonicalUri(editor.resource),
                typeId: editor.typeId,
                editorId: editor.editorId
            });
        }
        //#endregion
        //#region isOpened()
        isVisible(editor) {
            for (const group of this.j.groups) {
                if (group.activeEditor?.matches(editor)) {
                    return true;
                }
            }
            return false;
        }
        //#endregion
        //#region closeEditor()
        async closeEditor({ editor, groupId }, options) {
            const group = this.j.getGroup(groupId);
            await group?.closeEditor(editor, options);
        }
        //#endregion
        //#region closeEditors()
        async closeEditors(editors, options) {
            const mapGroupToEditors = new Map();
            for (const { editor, groupId } of editors) {
                const group = this.j.getGroup(groupId);
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
                if (!this.U.hasEditors(resource)) {
                    if (uri_1.URI.isUri(arg1) || (0, types_1.$qf)(arg2)) {
                        return [];
                    }
                    return undefined;
                }
            }
            // Search only in specific group
            if (!(0, types_1.$qf)(arg2)) {
                const targetGroup = typeof arg2 === 'number' ? this.j.getGroup(arg2) : arg2;
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
                for (const group of this.j.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
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
            const targetGroup = typeof group === 'number' ? this.j.getGroup(group) : group;
            // Convert all replacements to typed editors unless already
            // typed and handle overrides properly.
            const typedReplacements = [];
            for (const replacement of replacements) {
                let typedReplacement = undefined;
                // Resolve override unless disabled
                if (!(0, editor_1.$UE)(replacement.replacement)) {
                    const resolvedEditor = await this.u.resolveEditor(replacement.replacement, targetGroup);
                    if (resolvedEditor === 1 /* ResolvedStatus.ABORT */) {
                        continue; // skip editor if override is aborted
                    }
                    // We resolved an editor to use
                    if ((0, editor_1.$ZE)(resolvedEditor)) {
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
                        replacement: (0, editorGroupsService_1.$6C)(replacement) ? replacement.replacement : await this.z.resolveTextEditor(replacement.replacement),
                        options: (0, editorGroupsService_1.$6C)(replacement) ? replacement.options : replacement.replacement.options,
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
            const uniqueEditors = this.Z(editors);
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
                    this.j.getGroup(groupId)?.pinEditor(editor);
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
                    const targetGroups = editor.hasCapability(4 /* EditorInputCapabilities.Untitled */) ? this.j.groups.map(group => group.id) /* untitled replaces across all groups */ : [groupId];
                    for (const targetGroup of targetGroups) {
                        if (result instanceof editorInput_1.$tA) {
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
                editors: (0, arrays_1.$Fb)(saveResults)
            };
        }
        saveAll(options) {
            return this.save(this.Y(options), options);
        }
        async revert(editors, options) {
            // Convert to array
            if (!Array.isArray(editors)) {
                editors = [editors];
            }
            // Make sure to not revert the same editor multiple times
            // by using the `matches()` method to find duplicates
            const uniqueEditors = this.Z(editors);
            await async_1.Promises.settled(uniqueEditors.map(async ({ groupId, editor }) => {
                // Use revert as a hint to pin the editor
                this.j.getGroup(groupId)?.pinEditor(editor);
                return editor.revert(groupId, options);
            }));
            return !uniqueEditors.some(({ editor }) => editor.isDirty());
        }
        async revertAll(options) {
            return this.revert(this.Y(options), options);
        }
        Y(options) {
            const editors = [];
            for (const group of this.j.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
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
        Z(editors) {
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
            this.J.forEach(disposable => (0, lifecycle_1.$fc)(disposable));
            this.J.clear();
        }
    };
    exports.$Lyb = $Lyb;
    exports.$Lyb = $Lyb = __decorate([
        __param(0, editorGroupsService_1.$5C),
        __param(1, instantiation_1.$Ah),
        __param(2, files_1.$6j),
        __param(3, configuration_1.$8h),
        __param(4, workspace_1.$Kh),
        __param(5, uriIdentity_1.$Ck),
        __param(6, editorResolverService_1.$pbb),
        __param(7, workspaceTrust_1.$_z),
        __param(8, host_1.$VT),
        __param(9, textEditorService_1.$sxb)
    ], $Lyb);
    (0, extensions_1.$mr)(editorService_1.$9C, $Lyb, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=editorService.js.map