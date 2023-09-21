/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/common/editor", "vs/workbench/common/editor/sideBySideEditorInput", "vs/platform/window/common/window", "vs/workbench/services/host/browser/host", "vs/platform/instantiation/common/instantiation", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/files/common/files", "vs/platform/clipboard/common/clipboardService", "vs/base/common/errorMessage", "vs/platform/list/browser/listService", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/keyCodes", "vs/base/common/platform", "vs/editor/common/services/resolverService", "vs/workbench/contrib/files/browser/files", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/workbench/browser/parts/editor/editorCommands", "vs/base/common/network", "vs/platform/notification/common/notification", "vs/editor/common/editorContextKeys", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/label/common/label", "vs/base/common/resources", "vs/base/common/lifecycle", "vs/platform/environment/common/environment", "vs/base/common/arrays", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/workbench/services/textfile/common/textfiles", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/errors", "vs/base/common/actions", "vs/platform/editor/common/editor", "vs/base/common/hash", "vs/platform/configuration/common/configuration", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/common/views", "./fileConstants", "vs/platform/dialogs/common/dialogs", "vs/workbench/browser/actions/workspaceActions", "vs/workbench/contrib/files/browser/views/openEditorsView"], function (require, exports, nls, editor_1, sideBySideEditorInput_1, window_1, host_1, instantiation_1, workspace_1, files_1, clipboardService_1, errorMessage_1, listService_1, commands_1, contextkey_1, files_2, keybindingsRegistry_1, keyCodes_1, platform_1, resolverService_1, files_3, workspaceEditing_1, editorCommands_1, network_1, notification_1, editorContextKeys_1, editorService_1, editorGroupsService_1, label_1, resources_1, lifecycle_1, environment_1, arrays_1, codeEditorService_1, embeddedCodeEditorWidget_1, textfiles_1, uriIdentity_1, errors_1, actions_1, editor_2, hash_1, configuration_1, panecomposite_1, views_1, fileConstants_1, dialogs_1, workspaceActions_1, openEditorsView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.newWindowCommand = exports.openWindowCommand = void 0;
    const openWindowCommand = (accessor, toOpen, options) => {
        if (Array.isArray(toOpen)) {
            const hostService = accessor.get(host_1.IHostService);
            const environmentService = accessor.get(environment_1.IEnvironmentService);
            // rewrite untitled: workspace URIs to the absolute path on disk
            toOpen = toOpen.map(openable => {
                if ((0, window_1.isWorkspaceToOpen)(openable) && openable.workspaceUri.scheme === network_1.Schemas.untitled) {
                    return {
                        workspaceUri: (0, resources_1.joinPath)(environmentService.untitledWorkspacesHome, openable.workspaceUri.path, workspace_1.UNTITLED_WORKSPACE_NAME)
                    };
                }
                return openable;
            });
            hostService.openWindow(toOpen, options);
        }
    };
    exports.openWindowCommand = openWindowCommand;
    const newWindowCommand = (accessor, options) => {
        const hostService = accessor.get(host_1.IHostService);
        hostService.openWindow(options);
    };
    exports.newWindowCommand = newWindowCommand;
    // Command registration
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: files_1.ExplorerFocusCondition,
        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
        mac: {
            primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */
        },
        id: fileConstants_1.OPEN_TO_SIDE_COMMAND_ID, handler: async (accessor, resource) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const listService = accessor.get(listService_1.IListService);
            const fileService = accessor.get(files_2.IFileService);
            const explorerService = accessor.get(files_3.IExplorerService);
            const resources = (0, files_3.getMultiSelectedResources)(resource, listService, editorService, explorerService);
            // Set side input
            if (resources.length) {
                const untitledResources = resources.filter(resource => resource.scheme === network_1.Schemas.untitled);
                const fileResources = resources.filter(resource => resource.scheme !== network_1.Schemas.untitled);
                const items = await Promise.all(fileResources.map(async (resource) => {
                    const item = explorerService.findClosest(resource);
                    if (item) {
                        // Explorer already resolved the item, no need to go to the file service #109780
                        return item;
                    }
                    return await fileService.stat(resource);
                }));
                const files = items.filter(i => !i.isDirectory);
                const editors = files.map(f => ({
                    resource: f.resource,
                    options: { pinned: true }
                })).concat(...untitledResources.map(untitledResource => ({ resource: untitledResource, options: { pinned: true } })));
                await editorService.openEditors(editors, editorService_1.SIDE_GROUP);
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerFolderContext.toNegated()),
        primary: 3 /* KeyCode.Enter */,
        mac: {
            primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */
        },
        id: 'explorer.openAndPassFocus', handler: async (accessor, _resource) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const explorerService = accessor.get(files_3.IExplorerService);
            const resources = explorerService.getContext(true);
            if (resources.length) {
                await editorService.openEditors(resources.map(r => ({ resource: r.resource, options: { preserveFocus: false, pinned: true } })));
            }
        }
    });
    const COMPARE_WITH_SAVED_SCHEMA = 'showModifications';
    let providerDisposables = [];
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: fileConstants_1.COMPARE_WITH_SAVED_COMMAND_ID,
        when: undefined,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 34 /* KeyCode.KeyD */),
        handler: async (accessor, resource) => {
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const textModelService = accessor.get(resolverService_1.ITextModelService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const fileService = accessor.get(files_2.IFileService);
            // Register provider at first as needed
            let registerEditorListener = false;
            if (providerDisposables.length === 0) {
                registerEditorListener = true;
                const provider = instantiationService.createInstance(files_1.TextFileContentProvider);
                providerDisposables.push(provider);
                providerDisposables.push(textModelService.registerTextModelContentProvider(COMPARE_WITH_SAVED_SCHEMA, provider));
            }
            // Open editor (only resources that can be handled by file service are supported)
            const uri = (0, files_3.getResourceForCommand)(resource, accessor.get(listService_1.IListService), editorService);
            if (uri && fileService.hasProvider(uri)) {
                const name = (0, resources_1.basename)(uri);
                const editorLabel = nls.localize('modifiedLabel', "{0} (in file) ↔ {1}", name, name);
                try {
                    await files_1.TextFileContentProvider.open(uri, COMPARE_WITH_SAVED_SCHEMA, editorLabel, editorService, { pinned: true });
                    // Dispose once no more diff editor is opened with the scheme
                    if (registerEditorListener) {
                        providerDisposables.push(editorService.onDidVisibleEditorsChange(() => {
                            if (!editorService.editors.some(editor => !!editor_1.EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY, filterByScheme: COMPARE_WITH_SAVED_SCHEMA }))) {
                                providerDisposables = (0, lifecycle_1.dispose)(providerDisposables);
                            }
                        }));
                    }
                }
                catch {
                    providerDisposables = (0, lifecycle_1.dispose)(providerDisposables);
                }
            }
        }
    });
    let globalResourceToCompare;
    let resourceSelectedForCompareContext;
    commands_1.CommandsRegistry.registerCommand({
        id: fileConstants_1.SELECT_FOR_COMPARE_COMMAND_ID,
        handler: (accessor, resource) => {
            const listService = accessor.get(listService_1.IListService);
            globalResourceToCompare = (0, files_3.getResourceForCommand)(resource, listService, accessor.get(editorService_1.IEditorService));
            if (!resourceSelectedForCompareContext) {
                resourceSelectedForCompareContext = fileConstants_1.ResourceSelectedForCompareContext.bindTo(accessor.get(contextkey_1.IContextKeyService));
            }
            resourceSelectedForCompareContext.set(true);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: fileConstants_1.COMPARE_SELECTED_COMMAND_ID,
        handler: async (accessor, resource) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const explorerService = accessor.get(files_3.IExplorerService);
            const resources = (0, files_3.getMultiSelectedResources)(resource, accessor.get(listService_1.IListService), editorService, explorerService);
            if (resources.length === 2) {
                return editorService.openEditor({
                    original: { resource: resources[0] },
                    modified: { resource: resources[1] },
                    options: { pinned: true }
                });
            }
            return true;
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: fileConstants_1.COMPARE_RESOURCE_COMMAND_ID,
        handler: (accessor, resource) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const listService = accessor.get(listService_1.IListService);
            const rightResource = (0, files_3.getResourceForCommand)(resource, listService, editorService);
            if (globalResourceToCompare && rightResource) {
                editorService.openEditor({
                    original: { resource: globalResourceToCompare },
                    modified: { resource: rightResource },
                    options: { pinned: true }
                });
            }
        }
    });
    async function resourcesToClipboard(resources, relative, clipboardService, labelService, configurationService) {
        if (resources.length) {
            const lineDelimiter = platform_1.isWindows ? '\r\n' : '\n';
            let separator = undefined;
            if (relative) {
                const relativeSeparator = configurationService.getValue('explorer.copyRelativePathSeparator');
                if (relativeSeparator === '/' || relativeSeparator === '\\') {
                    separator = relativeSeparator;
                }
            }
            const text = resources.map(resource => labelService.getUriLabel(resource, { relative, noPrefix: true, separator })).join(lineDelimiter);
            await clipboardService.writeText(text);
        }
    }
    const copyPathCommandHandler = async (accessor, resource) => {
        const resources = (0, files_3.getMultiSelectedResources)(resource, accessor.get(listService_1.IListService), accessor.get(editorService_1.IEditorService), accessor.get(files_3.IExplorerService));
        await resourcesToClipboard(resources, false, accessor.get(clipboardService_1.IClipboardService), accessor.get(label_1.ILabelService), accessor.get(configuration_1.IConfigurationService));
    };
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: editorContextKeys_1.EditorContextKeys.focus.toNegated(),
        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */,
        win: {
            primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */
        },
        id: fileConstants_1.COPY_PATH_COMMAND_ID,
        handler: copyPathCommandHandler
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: editorContextKeys_1.EditorContextKeys.focus,
        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */),
        win: {
            primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */
        },
        id: fileConstants_1.COPY_PATH_COMMAND_ID,
        handler: copyPathCommandHandler
    });
    const copyRelativePathCommandHandler = async (accessor, resource) => {
        const resources = (0, files_3.getMultiSelectedResources)(resource, accessor.get(listService_1.IListService), accessor.get(editorService_1.IEditorService), accessor.get(files_3.IExplorerService));
        await resourcesToClipboard(resources, true, accessor.get(clipboardService_1.IClipboardService), accessor.get(label_1.ILabelService), accessor.get(configuration_1.IConfigurationService));
    };
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: editorContextKeys_1.EditorContextKeys.focus.toNegated(),
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */,
        win: {
            primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 33 /* KeyCode.KeyC */)
        },
        id: fileConstants_1.COPY_RELATIVE_PATH_COMMAND_ID,
        handler: copyRelativePathCommandHandler
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: editorContextKeys_1.EditorContextKeys.focus,
        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */),
        win: {
            primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 33 /* KeyCode.KeyC */)
        },
        id: fileConstants_1.COPY_RELATIVE_PATH_COMMAND_ID,
        handler: copyRelativePathCommandHandler
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 46 /* KeyCode.KeyP */),
        id: 'workbench.action.files.copyPathOfActiveFile',
        handler: async (accessor) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const activeInput = editorService.activeEditor;
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(activeInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            const resources = resource ? [resource] : [];
            await resourcesToClipboard(resources, false, accessor.get(clipboardService_1.IClipboardService), accessor.get(label_1.ILabelService), accessor.get(configuration_1.IConfigurationService));
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: fileConstants_1.REVEAL_IN_EXPLORER_COMMAND_ID,
        handler: async (accessor, resource) => {
            const viewService = accessor.get(views_1.IViewsService);
            const contextService = accessor.get(workspace_1.IWorkspaceContextService);
            const explorerService = accessor.get(files_3.IExplorerService);
            const uri = (0, files_3.getResourceForCommand)(resource, accessor.get(listService_1.IListService), accessor.get(editorService_1.IEditorService));
            if (uri && contextService.isInsideWorkspace(uri)) {
                const explorerView = await viewService.openView(files_1.VIEW_ID, false);
                if (explorerView) {
                    explorerView.setExpanded(true);
                    await explorerService.select(uri, 'force');
                    explorerView.focus();
                }
            }
            else {
                const openEditorsView = await viewService.openView(openEditorsView_1.OpenEditorsView.ID, false);
                if (openEditorsView) {
                    openEditorsView.setExpanded(true);
                    openEditorsView.focus();
                }
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: fileConstants_1.OPEN_WITH_EXPLORER_COMMAND_ID,
        handler: async (accessor, resource) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const uri = (0, files_3.getResourceForCommand)(resource, accessor.get(listService_1.IListService), accessor.get(editorService_1.IEditorService));
            if (uri) {
                return editorService.openEditor({ resource: uri, options: { override: editor_2.EditorResolution.PICK, source: editor_2.EditorOpenSource.USER } });
            }
            return undefined;
        }
    });
    // Save / Save As / Save All / Revert
    async function saveSelectedEditors(accessor, options) {
        const listService = accessor.get(listService_1.IListService);
        const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
        const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
        const textFileService = accessor.get(textfiles_1.ITextFileService);
        // Retrieve selected or active editor
        let editors = (0, files_3.getOpenEditorsViewMultiSelection)(listService, editorGroupService);
        if (!editors) {
            const activeGroup = editorGroupService.activeGroup;
            if (activeGroup.activeEditor) {
                editors = [];
                // Special treatment for side by side editors: if the active editor
                // has 2 sides, we consider both, to support saving both sides.
                // We only allow this when saving, not for "Save As" and not if any
                // editor is untitled which would bring up a "Save As" dialog too.
                // In addition, we require the secondary side to be modified to not
                // trigger a touch operation unexpectedly.
                //
                // See also https://github.com/microsoft/vscode/issues/4180
                // See also https://github.com/microsoft/vscode/issues/106330
                // See also https://github.com/microsoft/vscode/issues/190210
                if (activeGroup.activeEditor instanceof sideBySideEditorInput_1.SideBySideEditorInput &&
                    !options?.saveAs && !(activeGroup.activeEditor.primary.hasCapability(4 /* EditorInputCapabilities.Untitled */) || activeGroup.activeEditor.secondary.hasCapability(4 /* EditorInputCapabilities.Untitled */)) &&
                    activeGroup.activeEditor.secondary.isModified()) {
                    editors.push({ groupId: activeGroup.id, editor: activeGroup.activeEditor.primary });
                    editors.push({ groupId: activeGroup.id, editor: activeGroup.activeEditor.secondary });
                }
                else {
                    editors.push({ groupId: activeGroup.id, editor: activeGroup.activeEditor });
                }
            }
        }
        if (!editors || editors.length === 0) {
            return; // nothing to save
        }
        // Save editors
        await doSaveEditors(accessor, editors, options);
        // Special treatment for embedded editors: if we detect that focus is
        // inside an embedded code editor, we save that model as well if we
        // find it in our text file models. Currently, only textual editors
        // support embedded editors.
        const focusedCodeEditor = codeEditorService.getFocusedCodeEditor();
        if (focusedCodeEditor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget) {
            const resource = focusedCodeEditor.getModel()?.uri;
            // Check that the resource of the model was not saved already
            if (resource && !editors.some(({ editor }) => (0, resources_1.isEqual)(editor_1.EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }), resource))) {
                const model = textFileService.files.get(resource);
                if (!model?.isReadonly()) {
                    await textFileService.save(resource, options);
                }
            }
        }
    }
    function saveDirtyEditorsOfGroups(accessor, groups, options) {
        const dirtyEditors = [];
        for (const group of groups) {
            for (const editor of group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */)) {
                if (editor.isDirty()) {
                    dirtyEditors.push({ groupId: group.id, editor });
                }
            }
        }
        return doSaveEditors(accessor, dirtyEditors, options);
    }
    async function doSaveEditors(accessor, editors, options) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const notificationService = accessor.get(notification_1.INotificationService);
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        try {
            await editorService.save(editors, options);
        }
        catch (error) {
            if (!(0, errors_1.isCancellationError)(error)) {
                notificationService.notify({
                    id: editors.map(({ editor }) => (0, hash_1.hash)(editor.resource?.toString())).join(),
                    severity: notification_1.Severity.Error,
                    message: nls.localize({ key: 'genericSaveError', comment: ['{0} is the resource that failed to save and {1} the error message'] }, "Failed to save '{0}': {1}", editors.map(({ editor }) => editor.getName()).join(', '), (0, errorMessage_1.toErrorMessage)(error, false)),
                    actions: {
                        primary: [
                            (0, actions_1.toAction)({ id: 'workbench.action.files.saveEditors', label: nls.localize('retry', "Retry"), run: () => instantiationService.invokeFunction(accessor => doSaveEditors(accessor, editors, options)) }),
                            (0, actions_1.toAction)({ id: 'workbench.action.files.revertEditors', label: nls.localize('discard', "Discard"), run: () => editorService.revert(editors) })
                        ]
                    }
                });
            }
        }
    }
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        when: undefined,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 49 /* KeyCode.KeyS */,
        id: fileConstants_1.SAVE_FILE_COMMAND_ID,
        handler: accessor => {
            return saveSelectedEditors(accessor, { reason: 1 /* SaveReason.EXPLICIT */, force: true /* force save even when non-dirty */ });
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        when: undefined,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 49 /* KeyCode.KeyS */),
        win: { primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 49 /* KeyCode.KeyS */) },
        id: fileConstants_1.SAVE_FILE_WITHOUT_FORMATTING_COMMAND_ID,
        handler: accessor => {
            return saveSelectedEditors(accessor, { reason: 1 /* SaveReason.EXPLICIT */, force: true /* force save even when non-dirty */, skipSaveParticipants: true });
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: fileConstants_1.SAVE_FILE_AS_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 49 /* KeyCode.KeyS */,
        handler: accessor => {
            return saveSelectedEditors(accessor, { reason: 1 /* SaveReason.EXPLICIT */, saveAs: true });
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        when: undefined,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: undefined,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 49 /* KeyCode.KeyS */ },
        win: { primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 49 /* KeyCode.KeyS */) },
        id: fileConstants_1.SAVE_ALL_COMMAND_ID,
        handler: accessor => {
            return saveDirtyEditorsOfGroups(accessor, accessor.get(editorGroupsService_1.IEditorGroupsService).getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */), { reason: 1 /* SaveReason.EXPLICIT */ });
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: fileConstants_1.SAVE_ALL_IN_GROUP_COMMAND_ID,
        handler: (accessor, _, editorContext) => {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const contexts = (0, editorCommands_1.getMultiSelectedEditorContexts)(editorContext, accessor.get(listService_1.IListService), accessor.get(editorGroupsService_1.IEditorGroupsService));
            let groups = undefined;
            if (!contexts.length) {
                groups = editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
            }
            else {
                groups = (0, arrays_1.coalesce)(contexts.map(context => editorGroupService.getGroup(context.groupId)));
            }
            return saveDirtyEditorsOfGroups(accessor, groups, { reason: 1 /* SaveReason.EXPLICIT */ });
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: fileConstants_1.SAVE_FILES_COMMAND_ID,
        handler: async (accessor) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const res = await editorService.saveAll({ includeUntitled: false, reason: 1 /* SaveReason.EXPLICIT */ });
            return res.success;
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: fileConstants_1.REVERT_FILE_COMMAND_ID,
        handler: async (accessor) => {
            const notificationService = accessor.get(notification_1.INotificationService);
            const listService = accessor.get(listService_1.IListService);
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const editorService = accessor.get(editorService_1.IEditorService);
            // Retrieve selected or active editor
            let editors = (0, files_3.getOpenEditorsViewMultiSelection)(listService, editorGroupService);
            if (!editors) {
                const activeGroup = editorGroupService.activeGroup;
                if (activeGroup.activeEditor) {
                    editors = [{ groupId: activeGroup.id, editor: activeGroup.activeEditor }];
                }
            }
            if (!editors || editors.length === 0) {
                return; // nothing to revert
            }
            try {
                await editorService.revert(editors.filter(({ editor }) => !editor.hasCapability(4 /* EditorInputCapabilities.Untitled */) /* all except untitled */), { force: true });
            }
            catch (error) {
                notificationService.error(nls.localize('genericRevertError', "Failed to revert '{0}': {1}", editors.map(({ editor }) => editor.getName()).join(', '), (0, errorMessage_1.toErrorMessage)(error, false)));
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: fileConstants_1.REMOVE_ROOT_FOLDER_COMMAND_ID,
        handler: (accessor, resource) => {
            const workspaceEditingService = accessor.get(workspaceEditing_1.IWorkspaceEditingService);
            const contextService = accessor.get(workspace_1.IWorkspaceContextService);
            const uriIdentityService = accessor.get(uriIdentity_1.IUriIdentityService);
            const workspace = contextService.getWorkspace();
            const resources = (0, files_3.getMultiSelectedResources)(resource, accessor.get(listService_1.IListService), accessor.get(editorService_1.IEditorService), accessor.get(files_3.IExplorerService)).filter(resource => workspace.folders.some(folder => uriIdentityService.extUri.isEqual(folder.uri, resource)) // Need to verify resources are workspaces since multi selection can trigger this command on some non workspace resources
            );
            if (resources.length === 0) {
                const commandService = accessor.get(commands_1.ICommandService);
                // Show a picker for the user to choose which folder to remove
                return commandService.executeCommand(workspaceActions_1.RemoveRootFolderAction.ID);
            }
            return workspaceEditingService.removeFolders(resources);
        }
    });
    // Compressed item navigation
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerCompressedFocusContext, files_1.ExplorerCompressedFirstFocusContext.negate()),
        primary: 15 /* KeyCode.LeftArrow */,
        id: fileConstants_1.PREVIOUS_COMPRESSED_FOLDER,
        handler: accessor => {
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const viewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
            if (viewlet?.getId() !== files_1.VIEWLET_ID) {
                return;
            }
            const explorer = viewlet.getViewPaneContainer();
            const view = explorer.getExplorerView();
            view.previousCompressedStat();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerCompressedFocusContext, files_1.ExplorerCompressedLastFocusContext.negate()),
        primary: 17 /* KeyCode.RightArrow */,
        id: fileConstants_1.NEXT_COMPRESSED_FOLDER,
        handler: accessor => {
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const viewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
            if (viewlet?.getId() !== files_1.VIEWLET_ID) {
                return;
            }
            const explorer = viewlet.getViewPaneContainer();
            const view = explorer.getExplorerView();
            view.nextCompressedStat();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerCompressedFocusContext, files_1.ExplorerCompressedFirstFocusContext.negate()),
        primary: 14 /* KeyCode.Home */,
        id: fileConstants_1.FIRST_COMPRESSED_FOLDER,
        handler: accessor => {
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const viewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
            if (viewlet?.getId() !== files_1.VIEWLET_ID) {
                return;
            }
            const explorer = viewlet.getViewPaneContainer();
            const view = explorer.getExplorerView();
            view.firstCompressedStat();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerCompressedFocusContext, files_1.ExplorerCompressedLastFocusContext.negate()),
        primary: 13 /* KeyCode.End */,
        id: fileConstants_1.LAST_COMPRESSED_FOLDER,
        handler: accessor => {
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const viewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
            if (viewlet?.getId() !== files_1.VIEWLET_ID) {
                return;
            }
            const explorer = viewlet.getViewPaneContainer();
            const view = explorer.getExplorerView();
            view.lastCompressedStat();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: null,
        primary: platform_1.isWeb ? (platform_1.isWindows ? (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 44 /* KeyCode.KeyN */) : 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 44 /* KeyCode.KeyN */) : 2048 /* KeyMod.CtrlCmd */ | 44 /* KeyCode.KeyN */,
        secondary: platform_1.isWeb ? [2048 /* KeyMod.CtrlCmd */ | 44 /* KeyCode.KeyN */] : undefined,
        id: fileConstants_1.NEW_UNTITLED_FILE_COMMAND_ID,
        description: {
            description: fileConstants_1.NEW_UNTITLED_FILE_LABEL,
            args: [
                {
                    isOptional: true,
                    name: 'New Untitled Text File arguments',
                    description: 'The editor view type or language ID if known',
                    schema: {
                        'type': 'object',
                        'properties': {
                            'viewType': {
                                'type': 'string'
                            },
                            'languageId': {
                                'type': 'string'
                            }
                        }
                    }
                }
            ]
        },
        handler: async (accessor, args) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            await editorService.openEditor({
                resource: undefined,
                options: {
                    override: args?.viewType,
                    pinned: true
                },
                languageId: args?.languageId,
            });
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: fileConstants_1.NEW_FILE_COMMAND_ID,
        handler: async (accessor, args) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const dialogService = accessor.get(dialogs_1.IFileDialogService);
            const fileService = accessor.get(files_2.IFileService);
            const createFileLocalized = nls.localize('newFileCommand.saveLabel', "Create File");
            const defaultFileUri = (0, resources_1.joinPath)(await dialogService.defaultFilePath(), args?.fileName ?? 'Untitled.txt');
            const saveUri = await dialogService.showSaveDialog({ saveLabel: createFileLocalized, title: createFileLocalized, defaultUri: defaultFileUri });
            if (!saveUri) {
                return;
            }
            await fileService.createFile(saveUri, undefined, { overwrite: true });
            await editorService.openEditor({
                resource: saveUri,
                options: {
                    override: args?.viewType,
                    pinned: true
                },
                languageId: args?.languageId,
            });
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZUNvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZmlsZXMvYnJvd3Nlci9maWxlQ29tbWFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbUR6RixNQUFNLGlCQUFpQixHQUFHLENBQUMsUUFBMEIsRUFBRSxNQUF5QixFQUFFLE9BQTRCLEVBQUUsRUFBRTtRQUN4SCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDMUIsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxtQkFBWSxDQUFDLENBQUM7WUFDL0MsTUFBTSxrQkFBa0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGlDQUFtQixDQUFDLENBQUM7WUFFN0QsZ0VBQWdFO1lBQ2hFLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUM5QixJQUFJLElBQUEsMEJBQWlCLEVBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxRQUFRLEVBQUU7b0JBQ3JGLE9BQU87d0JBQ04sWUFBWSxFQUFFLElBQUEsb0JBQVEsRUFBQyxrQkFBa0IsQ0FBQyxzQkFBc0IsRUFBRSxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxtQ0FBdUIsQ0FBQztxQkFDdEgsQ0FBQztpQkFDRjtnQkFFRCxPQUFPLFFBQVEsQ0FBQztZQUNqQixDQUFDLENBQUMsQ0FBQztZQUVILFdBQVcsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3hDO0lBQ0YsQ0FBQyxDQUFDO0lBbEJXLFFBQUEsaUJBQWlCLHFCQWtCNUI7SUFFSyxNQUFNLGdCQUFnQixHQUFHLENBQUMsUUFBMEIsRUFBRSxPQUFpQyxFQUFFLEVBQUU7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