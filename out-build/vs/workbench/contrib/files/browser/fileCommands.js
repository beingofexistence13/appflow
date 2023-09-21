/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/fileCommands", "vs/workbench/common/editor", "vs/workbench/common/editor/sideBySideEditorInput", "vs/platform/window/common/window", "vs/workbench/services/host/browser/host", "vs/platform/instantiation/common/instantiation", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/files/common/files", "vs/platform/clipboard/common/clipboardService", "vs/base/common/errorMessage", "vs/platform/list/browser/listService", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/keyCodes", "vs/base/common/platform", "vs/editor/common/services/resolverService", "vs/workbench/contrib/files/browser/files", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/workbench/browser/parts/editor/editorCommands", "vs/base/common/network", "vs/platform/notification/common/notification", "vs/editor/common/editorContextKeys", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/label/common/label", "vs/base/common/resources", "vs/base/common/lifecycle", "vs/platform/environment/common/environment", "vs/base/common/arrays", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/workbench/services/textfile/common/textfiles", "vs/platform/uriIdentity/common/uriIdentity", "vs/base/common/errors", "vs/base/common/actions", "vs/platform/editor/common/editor", "vs/base/common/hash", "vs/platform/configuration/common/configuration", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/common/views", "./fileConstants", "vs/platform/dialogs/common/dialogs", "vs/workbench/browser/actions/workspaceActions", "vs/workbench/contrib/files/browser/views/openEditorsView"], function (require, exports, nls, editor_1, sideBySideEditorInput_1, window_1, host_1, instantiation_1, workspace_1, files_1, clipboardService_1, errorMessage_1, listService_1, commands_1, contextkey_1, files_2, keybindingsRegistry_1, keyCodes_1, platform_1, resolverService_1, files_3, workspaceEditing_1, editorCommands_1, network_1, notification_1, editorContextKeys_1, editorService_1, editorGroupsService_1, label_1, resources_1, lifecycle_1, environment_1, arrays_1, codeEditorService_1, embeddedCodeEditorWidget_1, textfiles_1, uriIdentity_1, errors_1, actions_1, editor_2, hash_1, configuration_1, panecomposite_1, views_1, fileConstants_1, dialogs_1, workspaceActions_1, openEditorsView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2Lb = exports.$1Lb = void 0;
    const $1Lb = (accessor, toOpen, options) => {
        if (Array.isArray(toOpen)) {
            const hostService = accessor.get(host_1.$VT);
            const environmentService = accessor.get(environment_1.$Ih);
            // rewrite untitled: workspace URIs to the absolute path on disk
            toOpen = toOpen.map(openable => {
                if ((0, window_1.$QD)(openable) && openable.workspaceUri.scheme === network_1.Schemas.untitled) {
                    return {
                        workspaceUri: (0, resources_1.$ig)(environmentService.untitledWorkspacesHome, openable.workspaceUri.path, workspace_1.$1h)
                    };
                }
                return openable;
            });
            hostService.openWindow(toOpen, options);
        }
    };
    exports.$1Lb = $1Lb;
    const $2Lb = (accessor, options) => {
        const hostService = accessor.get(host_1.$VT);
        hostService.openWindow(options);
    };
    exports.$2Lb = $2Lb;
    // Command registration
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: files_1.$6db,
        primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
        mac: {
            primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */
        },
        id: fileConstants_1.$YGb, handler: async (accessor, resource) => {
            const editorService = accessor.get(editorService_1.$9C);
            const listService = accessor.get(listService_1.$03);
            const fileService = accessor.get(files_2.$6j);
            const explorerService = accessor.get(files_3.$xHb);
            const resources = (0, files_3.$zHb)(resource, listService, editorService, explorerService);
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
                await editorService.openEditors(editors, editorService_1.$$C);
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
        when: contextkey_1.$Ii.and(files_1.$5db, files_1.$Qdb.toNegated()),
        primary: 3 /* KeyCode.Enter */,
        mac: {
            primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */
        },
        id: 'explorer.openAndPassFocus', handler: async (accessor, _resource) => {
            const editorService = accessor.get(editorService_1.$9C);
            const explorerService = accessor.get(files_3.$xHb);
            const resources = explorerService.getContext(true);
            if (resources.length) {
                await editorService.openEditors(resources.map(r => ({ resource: r.resource, options: { preserveFocus: false, pinned: true } })));
            }
        }
    });
    const COMPARE_WITH_SAVED_SCHEMA = 'showModifications';
    let providerDisposables = [];
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: fileConstants_1.$4Gb,
        when: undefined,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 34 /* KeyCode.KeyD */),
        handler: async (accessor, resource) => {
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const textModelService = accessor.get(resolverService_1.$uA);
            const editorService = accessor.get(editorService_1.$9C);
            const fileService = accessor.get(files_2.$6j);
            // Register provider at first as needed
            let registerEditorListener = false;
            if (providerDisposables.length === 0) {
                registerEditorListener = true;
                const provider = instantiationService.createInstance(files_1.$$db);
                providerDisposables.push(provider);
                providerDisposables.push(textModelService.registerTextModelContentProvider(COMPARE_WITH_SAVED_SCHEMA, provider));
            }
            // Open editor (only resources that can be handled by file service are supported)
            const uri = (0, files_3.$yHb)(resource, accessor.get(listService_1.$03), editorService);
            if (uri && fileService.hasProvider(uri)) {
                const name = (0, resources_1.$fg)(uri);
                const editorLabel = nls.localize(0, null, name, name);
                try {
                    await files_1.$$db.open(uri, COMPARE_WITH_SAVED_SCHEMA, editorLabel, editorService, { pinned: true });
                    // Dispose once no more diff editor is opened with the scheme
                    if (registerEditorListener) {
                        providerDisposables.push(editorService.onDidVisibleEditorsChange(() => {
                            if (!editorService.editors.some(editor => !!editor_1.$3E.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY, filterByScheme: COMPARE_WITH_SAVED_SCHEMA }))) {
                                providerDisposables = (0, lifecycle_1.$fc)(providerDisposables);
                            }
                        }));
                    }
                }
                catch {
                    providerDisposables = (0, lifecycle_1.$fc)(providerDisposables);
                }
            }
        }
    });
    let globalResourceToCompare;
    let resourceSelectedForCompareContext;
    commands_1.$Gr.registerCommand({
        id: fileConstants_1.$1Gb,
        handler: (accessor, resource) => {
            const listService = accessor.get(listService_1.$03);
            globalResourceToCompare = (0, files_3.$yHb)(resource, listService, accessor.get(editorService_1.$9C));
            if (!resourceSelectedForCompareContext) {
                resourceSelectedForCompareContext = fileConstants_1.$hHb.bindTo(accessor.get(contextkey_1.$3i));
            }
            resourceSelectedForCompareContext.set(true);
        }
    });
    commands_1.$Gr.registerCommand({
        id: fileConstants_1.$2Gb,
        handler: async (accessor, resource) => {
            const editorService = accessor.get(editorService_1.$9C);
            const explorerService = accessor.get(files_3.$xHb);
            const resources = (0, files_3.$zHb)(resource, accessor.get(listService_1.$03), editorService, explorerService);
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
    commands_1.$Gr.registerCommand({
        id: fileConstants_1.$3Gb,
        handler: (accessor, resource) => {
            const editorService = accessor.get(editorService_1.$9C);
            const listService = accessor.get(listService_1.$03);
            const rightResource = (0, files_3.$yHb)(resource, listService, editorService);
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
            const lineDelimiter = platform_1.$i ? '\r\n' : '\n';
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
        const resources = (0, files_3.$zHb)(resource, accessor.get(listService_1.$03), accessor.get(editorService_1.$9C), accessor.get(files_3.$xHb));
        await resourcesToClipboard(resources, false, accessor.get(clipboardService_1.$UZ), accessor.get(label_1.$Vz), accessor.get(configuration_1.$8h));
    };
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: editorContextKeys_1.EditorContextKeys.focus.toNegated(),
        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */,
        win: {
            primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */
        },
        id: fileConstants_1.$5Gb,
        handler: copyPathCommandHandler
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: editorContextKeys_1.EditorContextKeys.focus,
        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */),
        win: {
            primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */
        },
        id: fileConstants_1.$5Gb,
        handler: copyPathCommandHandler
    });
    const copyRelativePathCommandHandler = async (accessor, resource) => {
        const resources = (0, files_3.$zHb)(resource, accessor.get(listService_1.$03), accessor.get(editorService_1.$9C), accessor.get(files_3.$xHb));
        await resourcesToClipboard(resources, true, accessor.get(clipboardService_1.$UZ), accessor.get(label_1.$Vz), accessor.get(configuration_1.$8h));
    };
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: editorContextKeys_1.EditorContextKeys.focus.toNegated(),
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */,
        win: {
            primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 33 /* KeyCode.KeyC */)
        },
        id: fileConstants_1.$6Gb,
        handler: copyRelativePathCommandHandler
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: editorContextKeys_1.EditorContextKeys.focus,
        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */),
        win: {
            primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 33 /* KeyCode.KeyC */)
        },
        id: fileConstants_1.$6Gb,
        handler: copyRelativePathCommandHandler
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 46 /* KeyCode.KeyP */),
        id: 'workbench.action.files.copyPathOfActiveFile',
        handler: async (accessor) => {
            const editorService = accessor.get(editorService_1.$9C);
            const activeInput = editorService.activeEditor;
            const resource = editor_1.$3E.getOriginalUri(activeInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            const resources = resource ? [resource] : [];
            await resourcesToClipboard(resources, false, accessor.get(clipboardService_1.$UZ), accessor.get(label_1.$Vz), accessor.get(configuration_1.$8h));
        }
    });
    commands_1.$Gr.registerCommand({
        id: fileConstants_1.$WGb,
        handler: async (accessor, resource) => {
            const viewService = accessor.get(views_1.$$E);
            const contextService = accessor.get(workspace_1.$Kh);
            const explorerService = accessor.get(files_3.$xHb);
            const uri = (0, files_3.$yHb)(resource, accessor.get(listService_1.$03), accessor.get(editorService_1.$9C));
            if (uri && contextService.isInsideWorkspace(uri)) {
                const explorerView = await viewService.openView(files_1.$Ndb, false);
                if (explorerView) {
                    explorerView.setExpanded(true);
                    await explorerService.select(uri, 'force');
                    explorerView.focus();
                }
            }
            else {
                const openEditorsView = await viewService.openView(openEditorsView_1.$QLb.ID, false);
                if (openEditorsView) {
                    openEditorsView.setExpanded(true);
                    openEditorsView.focus();
                }
            }
        }
    });
    commands_1.$Gr.registerCommand({
        id: fileConstants_1.$ZGb,
        handler: async (accessor, resource) => {
            const editorService = accessor.get(editorService_1.$9C);
            const uri = (0, files_3.$yHb)(resource, accessor.get(listService_1.$03), accessor.get(editorService_1.$9C));
            if (uri) {
                return editorService.openEditor({ resource: uri, options: { override: editor_2.EditorResolution.PICK, source: editor_2.EditorOpenSource.USER } });
            }
            return undefined;
        }
    });
    // Save / Save As / Save All / Revert
    async function saveSelectedEditors(accessor, options) {
        const listService = accessor.get(listService_1.$03);
        const editorGroupService = accessor.get(editorGroupsService_1.$5C);
        const codeEditorService = accessor.get(codeEditorService_1.$nV);
        const textFileService = accessor.get(textfiles_1.$JD);
        // Retrieve selected or active editor
        let editors = (0, files_3.$AHb)(listService, editorGroupService);
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
                if (activeGroup.activeEditor instanceof sideBySideEditorInput_1.$VC &&
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
        if (focusedCodeEditor instanceof embeddedCodeEditorWidget_1.$w3) {
            const resource = focusedCodeEditor.getModel()?.uri;
            // Check that the resource of the model was not saved already
            if (resource && !editors.some(({ editor }) => (0, resources_1.$bg)(editor_1.$3E.getCanonicalUri(editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }), resource))) {
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
        const editorService = accessor.get(editorService_1.$9C);
        const notificationService = accessor.get(notification_1.$Yu);
        const instantiationService = accessor.get(instantiation_1.$Ah);
        try {
            await editorService.save(editors, options);
        }
        catch (error) {
            if (!(0, errors_1.$2)(error)) {
                notificationService.notify({
                    id: editors.map(({ editor }) => (0, hash_1.$pi)(editor.resource?.toString())).join(),
                    severity: notification_1.Severity.Error,
                    message: nls.localize(1, null, editors.map(({ editor }) => editor.getName()).join(', '), (0, errorMessage_1.$mi)(error, false)),
                    actions: {
                        primary: [
                            (0, actions_1.$li)({ id: 'workbench.action.files.saveEditors', label: nls.localize(2, null), run: () => instantiationService.invokeFunction(accessor => doSaveEditors(accessor, editors, options)) }),
                            (0, actions_1.$li)({ id: 'workbench.action.files.revertEditors', label: nls.localize(3, null), run: () => editorService.revert(editors) })
                        ]
                    }
                });
            }
        }
    }
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        when: undefined,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 2048 /* KeyMod.CtrlCmd */ | 49 /* KeyCode.KeyS */,
        id: fileConstants_1.$9Gb,
        handler: accessor => {
            return saveSelectedEditors(accessor, { reason: 1 /* SaveReason.EXPLICIT */, force: true /* force save even when non-dirty */ });
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        when: undefined,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 49 /* KeyCode.KeyS */),
        win: { primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 49 /* KeyCode.KeyS */) },
        id: fileConstants_1.$$Gb,
        handler: accessor => {
            return saveSelectedEditors(accessor, { reason: 1 /* SaveReason.EXPLICIT */, force: true /* force save even when non-dirty */, skipSaveParticipants: true });
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: fileConstants_1.$7Gb,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 49 /* KeyCode.KeyS */,
        handler: accessor => {
            return saveSelectedEditors(accessor, { reason: 1 /* SaveReason.EXPLICIT */, saveAs: true });
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        when: undefined,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: undefined,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 49 /* KeyCode.KeyS */ },
        win: { primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 49 /* KeyCode.KeyS */) },
        id: fileConstants_1.$aHb,
        handler: accessor => {
            return saveDirtyEditorsOfGroups(accessor, accessor.get(editorGroupsService_1.$5C).getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */), { reason: 1 /* SaveReason.EXPLICIT */ });
        }
    });
    commands_1.$Gr.registerCommand({
        id: fileConstants_1.$cHb,
        handler: (accessor, _, editorContext) => {
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const contexts = (0, editorCommands_1.$1ub)(editorContext, accessor.get(listService_1.$03), accessor.get(editorGroupsService_1.$5C));
            let groups = undefined;
            if (!contexts.length) {
                groups = editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
            }
            else {
                groups = (0, arrays_1.$Fb)(contexts.map(context => editorGroupService.getGroup(context.groupId)));
            }
            return saveDirtyEditorsOfGroups(accessor, groups, { reason: 1 /* SaveReason.EXPLICIT */ });
        }
    });
    commands_1.$Gr.registerCommand({
        id: fileConstants_1.$dHb,
        handler: async (accessor) => {
            const editorService = accessor.get(editorService_1.$9C);
            const res = await editorService.saveAll({ includeUntitled: false, reason: 1 /* SaveReason.EXPLICIT */ });
            return res.success;
        }
    });
    commands_1.$Gr.registerCommand({
        id: fileConstants_1.$XGb,
        handler: async (accessor) => {
            const notificationService = accessor.get(notification_1.$Yu);
            const listService = accessor.get(listService_1.$03);
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const editorService = accessor.get(editorService_1.$9C);
            // Retrieve selected or active editor
            let editors = (0, files_3.$AHb)(listService, editorGroupService);
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
                notificationService.error(nls.localize(4, null, editors.map(({ editor }) => editor.getName()).join(', '), (0, errorMessage_1.$mi)(error, false)));
            }
        }
    });
    commands_1.$Gr.registerCommand({
        id: fileConstants_1.$iHb,
        handler: (accessor, resource) => {
            const workspaceEditingService = accessor.get(workspaceEditing_1.$pU);
            const contextService = accessor.get(workspace_1.$Kh);
            const uriIdentityService = accessor.get(uriIdentity_1.$Ck);
            const workspace = contextService.getWorkspace();
            const resources = (0, files_3.$zHb)(resource, accessor.get(listService_1.$03), accessor.get(editorService_1.$9C), accessor.get(files_3.$xHb)).filter(resource => workspace.folders.some(folder => uriIdentityService.extUri.isEqual(folder.uri, resource)) // Need to verify resources are workspaces since multi selection can trigger this command on some non workspace resources
            );
            if (resources.length === 0) {
                const commandService = accessor.get(commands_1.$Fr);
                // Show a picker for the user to choose which folder to remove
                return commandService.executeCommand(workspaceActions_1.$8tb.ID);
            }
            return workspaceEditingService.removeFolders(resources);
        }
    });
    // Compressed item navigation
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
        when: contextkey_1.$Ii.and(files_1.$5db, files_1.$1db, files_1.$2db.negate()),
        primary: 15 /* KeyCode.LeftArrow */,
        id: fileConstants_1.$kHb,
        handler: accessor => {
            const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
            const viewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
            if (viewlet?.getId() !== files_1.$Mdb) {
                return;
            }
            const explorer = viewlet.getViewPaneContainer();
            const view = explorer.getExplorerView();
            view.previousCompressedStat();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
        when: contextkey_1.$Ii.and(files_1.$5db, files_1.$1db, files_1.$3db.negate()),
        primary: 17 /* KeyCode.RightArrow */,
        id: fileConstants_1.$lHb,
        handler: accessor => {
            const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
            const viewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
            if (viewlet?.getId() !== files_1.$Mdb) {
                return;
            }
            const explorer = viewlet.getViewPaneContainer();
            const view = explorer.getExplorerView();
            view.nextCompressedStat();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
        when: contextkey_1.$Ii.and(files_1.$5db, files_1.$1db, files_1.$2db.negate()),
        primary: 14 /* KeyCode.Home */,
        id: fileConstants_1.$mHb,
        handler: accessor => {
            const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
            const viewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
            if (viewlet?.getId() !== files_1.$Mdb) {
                return;
            }
            const explorer = viewlet.getViewPaneContainer();
            const view = explorer.getExplorerView();
            view.firstCompressedStat();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
        when: contextkey_1.$Ii.and(files_1.$5db, files_1.$1db, files_1.$3db.negate()),
        primary: 13 /* KeyCode.End */,
        id: fileConstants_1.$nHb,
        handler: accessor => {
            const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
            const viewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
            if (viewlet?.getId() !== files_1.$Mdb) {
                return;
            }
            const explorer = viewlet.getViewPaneContainer();
            const view = explorer.getExplorerView();
            view.lastCompressedStat();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: null,
        primary: platform_1.$o ? (platform_1.$i ? (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 44 /* KeyCode.KeyN */) : 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 44 /* KeyCode.KeyN */) : 2048 /* KeyMod.CtrlCmd */ | 44 /* KeyCode.KeyN */,
        secondary: platform_1.$o ? [2048 /* KeyMod.CtrlCmd */ | 44 /* KeyCode.KeyN */] : undefined,
        id: fileConstants_1.$oHb,
        description: {
            description: fileConstants_1.$pHb,
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
            const editorService = accessor.get(editorService_1.$9C);
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
    commands_1.$Gr.registerCommand({
        id: fileConstants_1.$qHb,
        handler: async (accessor, args) => {
            const editorService = accessor.get(editorService_1.$9C);
            const dialogService = accessor.get(dialogs_1.$qA);
            const fileService = accessor.get(files_2.$6j);
            const createFileLocalized = nls.localize(5, null);
            const defaultFileUri = (0, resources_1.$ig)(await dialogService.defaultFilePath(), args?.fileName ?? 'Untitled.txt');
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
//# sourceMappingURL=fileCommands.js.map