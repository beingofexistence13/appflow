/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/contrib/files/browser/fileActions", "vs/workbench/contrib/files/browser/editors/textFileSaveErrorHandler", "vs/platform/actions/common/actions", "vs/workbench/contrib/files/browser/fileCommands", "vs/workbench/contrib/files/browser/fileConstants", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/contrib/files/common/files", "vs/workbench/browser/actions/workspaceCommands", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/list/browser/listService", "vs/base/common/network", "vs/workbench/common/contextkeys", "vs/platform/contextkey/common/contextkeys", "vs/workbench/contrib/files/browser/files", "vs/base/common/codicons", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls, fileActions_1, textFileSaveErrorHandler_1, actions_1, fileCommands_1, fileConstants_1, commands_1, contextkey_1, keybindingsRegistry_1, files_1, workspaceCommands_1, editorCommands_1, filesConfigurationService_1, listService_1, network_1, contextkeys_1, contextkeys_2, files_2, codicons_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.appendToCommandPalette = exports.appendEditorTitleContextMenuItem = void 0;
    // Contribute Global Actions
    (0, actions_1.registerAction2)(fileActions_1.GlobalCompareResourcesAction);
    (0, actions_1.registerAction2)(fileActions_1.FocusFilesExplorer);
    (0, actions_1.registerAction2)(fileActions_1.ShowActiveFileInExplorer);
    (0, actions_1.registerAction2)(fileActions_1.CompareWithClipboardAction);
    (0, actions_1.registerAction2)(fileActions_1.CompareNewUntitledTextFilesAction);
    (0, actions_1.registerAction2)(fileActions_1.ToggleAutoSaveAction);
    (0, actions_1.registerAction2)(fileActions_1.ShowOpenedFileInNewWindow);
    (0, actions_1.registerAction2)(fileActions_1.SetActiveEditorReadonlyInSession);
    (0, actions_1.registerAction2)(fileActions_1.SetActiveEditorWriteableInSession);
    (0, actions_1.registerAction2)(fileActions_1.ToggleActiveEditorReadonlyInSession);
    (0, actions_1.registerAction2)(fileActions_1.ResetActiveEditorReadonlyInSession);
    // Commands
    commands_1.CommandsRegistry.registerCommand('_files.windowOpen', fileCommands_1.openWindowCommand);
    commands_1.CommandsRegistry.registerCommand('_files.newWindow', fileCommands_1.newWindowCommand);
    const explorerCommandsWeightBonus = 10; // give our commands a little bit more weight over other default list/tree commands
    const RENAME_ID = 'renameFile';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: RENAME_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerRootContext.toNegated(), files_1.ExplorerResourceNotReadonlyContext),
        primary: 60 /* KeyCode.F2 */,
        mac: {
            primary: 3 /* KeyCode.Enter */
        },
        handler: fileActions_1.renameHandler
    });
    const MOVE_FILE_TO_TRASH_ID = 'moveFileToTrash';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: MOVE_FILE_TO_TRASH_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerResourceNotReadonlyContext, files_1.ExplorerResourceMoveableToTrash),
        primary: 20 /* KeyCode.Delete */,
        mac: {
            primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
            secondary: [20 /* KeyCode.Delete */]
        },
        handler: fileActions_1.moveFileToTrashHandler
    });
    const DELETE_FILE_ID = 'deleteFile';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: DELETE_FILE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerResourceNotReadonlyContext),
        primary: 1024 /* KeyMod.Shift */ | 20 /* KeyCode.Delete */,
        mac: {
            primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 1 /* KeyCode.Backspace */
        },
        handler: fileActions_1.deleteFileHandler
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: DELETE_FILE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerResourceNotReadonlyContext, files_1.ExplorerResourceMoveableToTrash.toNegated()),
        primary: 20 /* KeyCode.Delete */,
        mac: {
            primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */
        },
        handler: fileActions_1.deleteFileHandler
    });
    const CUT_FILE_ID = 'filesExplorer.cut';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: CUT_FILE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerRootContext.toNegated(), files_1.ExplorerResourceNotReadonlyContext),
        primary: 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */,
        handler: fileActions_1.cutFileHandler,
    });
    const COPY_FILE_ID = 'filesExplorer.copy';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: COPY_FILE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerRootContext.toNegated()),
        primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
        handler: fileActions_1.copyFileHandler,
    });
    const PASTE_FILE_ID = 'filesExplorer.paste';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: PASTE_FILE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerResourceNotReadonlyContext),
        primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */,
        handler: fileActions_1.pasteFileHandler
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'filesExplorer.cancelCut',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerResourceCut),
        primary: 9 /* KeyCode.Escape */,
        handler: async (accessor) => {
            const explorerService = accessor.get(files_2.IExplorerService);
            await explorerService.setToCopy([], true);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'filesExplorer.openFilePreserveFocus',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerFolderContext.toNegated()),
        primary: 10 /* KeyCode.Space */,
        handler: fileActions_1.openFilePreserveFocusHandler
    });
    const copyPathCommand = {
        id: fileConstants_1.COPY_PATH_COMMAND_ID,
        title: nls.localize('copyPath', "Copy Path")
    };
    const copyRelativePathCommand = {
        id: fileConstants_1.COPY_RELATIVE_PATH_COMMAND_ID,
        title: nls.localize('copyRelativePath', "Copy Relative Path")
    };
    // Editor Title Context Menu
    appendEditorTitleContextMenuItem(fileConstants_1.COPY_PATH_COMMAND_ID, copyPathCommand.title, contextkeys_1.ResourceContextKey.IsFileSystemResource, '1_cutcopypaste');
    appendEditorTitleContextMenuItem(fileConstants_1.COPY_RELATIVE_PATH_COMMAND_ID, copyRelativePathCommand.title, contextkeys_1.ResourceContextKey.IsFileSystemResource, '1_cutcopypaste');
    appendEditorTitleContextMenuItem(fileConstants_1.REVEAL_IN_EXPLORER_COMMAND_ID, nls.localize('revealInSideBar', "Reveal in Explorer View"), contextkeys_1.ResourceContextKey.IsFileSystemResource, '2_files', 1);
    function appendEditorTitleContextMenuItem(id, title, when, group, order) {
        // Menu
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, {
            command: { id, title },
            when,
            group,
            order
        });
    }
    exports.appendEditorTitleContextMenuItem = appendEditorTitleContextMenuItem;
    // Editor Title Menu for Conflict Resolution
    appendSaveConflictEditorTitleAction('workbench.files.action.acceptLocalChanges', nls.localize('acceptLocalChanges', "Use your changes and overwrite file contents"), codicons_1.Codicon.check, -10, textFileSaveErrorHandler_1.acceptLocalChangesCommand);
    appendSaveConflictEditorTitleAction('workbench.files.action.revertLocalChanges', nls.localize('revertLocalChanges', "Discard your changes and revert to file contents"), codicons_1.Codicon.discard, -9, textFileSaveErrorHandler_1.revertLocalChangesCommand);
    function appendSaveConflictEditorTitleAction(id, title, icon, order, command) {
        // Command
        commands_1.CommandsRegistry.registerCommand(id, command);
        // Action
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
            command: { id, title, icon },
            when: contextkey_1.ContextKeyExpr.equals(textFileSaveErrorHandler_1.CONFLICT_RESOLUTION_CONTEXT, true),
            group: 'navigation',
            order
        });
    }
    // Menu registration - command palette
    function appendToCommandPalette(id, title, category, when) {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
            command: {
                id,
                title,
                category
            },
            when
        });
    }
    exports.appendToCommandPalette = appendToCommandPalette;
    appendToCommandPalette(fileConstants_1.COPY_PATH_COMMAND_ID, { value: nls.localize('copyPathOfActive', "Copy Path of Active File"), original: 'Copy Path of Active File' }, actionCommonCategories_1.Categories.File);
    appendToCommandPalette(fileConstants_1.COPY_RELATIVE_PATH_COMMAND_ID, { value: nls.localize('copyRelativePathOfActive', "Copy Relative Path of Active File"), original: 'Copy Relative Path of Active File' }, actionCommonCategories_1.Categories.File);
    appendToCommandPalette(fileConstants_1.SAVE_FILE_COMMAND_ID, { value: fileConstants_1.SAVE_FILE_LABEL, original: 'Save' }, actionCommonCategories_1.Categories.File);
    appendToCommandPalette(fileConstants_1.SAVE_FILE_WITHOUT_FORMATTING_COMMAND_ID, { value: fileConstants_1.SAVE_FILE_WITHOUT_FORMATTING_LABEL, original: 'Save without Formatting' }, actionCommonCategories_1.Categories.File);
    appendToCommandPalette(fileConstants_1.SAVE_ALL_IN_GROUP_COMMAND_ID, { value: nls.localize('saveAllInGroup', "Save All in Group"), original: 'Save All in Group' }, actionCommonCategories_1.Categories.File);
    appendToCommandPalette(fileConstants_1.SAVE_FILES_COMMAND_ID, { value: nls.localize('saveFiles', "Save All Files"), original: 'Save All Files' }, actionCommonCategories_1.Categories.File);
    appendToCommandPalette(fileConstants_1.REVERT_FILE_COMMAND_ID, { value: nls.localize('revert', "Revert File"), original: 'Revert File' }, actionCommonCategories_1.Categories.File);
    appendToCommandPalette(fileConstants_1.COMPARE_WITH_SAVED_COMMAND_ID, { value: nls.localize('compareActiveWithSaved', "Compare Active File with Saved"), original: 'Compare Active File with Saved' }, actionCommonCategories_1.Categories.File);
    appendToCommandPalette(fileConstants_1.SAVE_FILE_AS_COMMAND_ID, { value: fileConstants_1.SAVE_FILE_AS_LABEL, original: 'Save As...' }, actionCommonCategories_1.Categories.File);
    appendToCommandPalette(fileActions_1.NEW_FILE_COMMAND_ID, { value: fileActions_1.NEW_FILE_LABEL, original: 'New File' }, actionCommonCategories_1.Categories.File, contextkeys_1.WorkspaceFolderCountContext.notEqualsTo('0'));
    appendToCommandPalette(fileActions_1.NEW_FOLDER_COMMAND_ID, { value: fileActions_1.NEW_FOLDER_LABEL, original: 'New Folder' }, actionCommonCategories_1.Categories.File, contextkeys_1.WorkspaceFolderCountContext.notEqualsTo('0'));
    appendToCommandPalette(fileConstants_1.NEW_UNTITLED_FILE_COMMAND_ID, { value: fileConstants_1.NEW_UNTITLED_FILE_LABEL, original: 'New Untitled Text File' }, actionCommonCategories_1.Categories.File);
    // Menu registration - open editors
    const isFileOrUntitledResourceContextKey = contextkey_1.ContextKeyExpr.or(contextkeys_1.ResourceContextKey.IsFileSystemResource, contextkeys_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.untitled));
    const openToSideCommand = {
        id: fileConstants_1.OPEN_TO_SIDE_COMMAND_ID,
        title: nls.localize('openToSide', "Open to the Side")
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: 'navigation',
        order: 10,
        command: openToSideCommand,
        when: isFileOrUntitledResourceContextKey
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '1_open',
        order: 10,
        command: {
            id: editorCommands_1.REOPEN_WITH_COMMAND_ID,
            title: nls.localize('reopenWith', "Reopen Editor With...")
        },
        when: contextkeys_1.ActiveEditorAvailableEditorIdsContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '1_cutcopypaste',
        order: 10,
        command: copyPathCommand,
        when: contextkeys_1.ResourceContextKey.IsFileSystemResource
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '1_cutcopypaste',
        order: 20,
        command: copyRelativePathCommand,
        when: contextkeys_1.ResourceContextKey.IsFileSystemResource
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '2_save',
        order: 10,
        command: {
            id: fileConstants_1.SAVE_FILE_COMMAND_ID,
            title: fileConstants_1.SAVE_FILE_LABEL,
            precondition: fileConstants_1.OpenEditorsDirtyEditorContext
        },
        when: contextkey_1.ContextKeyExpr.or(
        // Untitled Editors
        contextkeys_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.untitled), 
        // Or:
        contextkey_1.ContextKeyExpr.and(
        // Not: editor groups
        fileConstants_1.OpenEditorsGroupContext.toNegated(), 
        // Not: readonly editors
        fileConstants_1.OpenEditorsReadonlyEditorContext.toNegated(), 
        // Not: auto save after short delay
        filesConfigurationService_1.AutoSaveAfterShortDelayContext.toNegated()))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '2_save',
        order: 20,
        command: {
            id: fileConstants_1.REVERT_FILE_COMMAND_ID,
            title: nls.localize('revert', "Revert File"),
            precondition: fileConstants_1.OpenEditorsDirtyEditorContext
        },
        when: contextkey_1.ContextKeyExpr.and(
        // Not: editor groups
        fileConstants_1.OpenEditorsGroupContext.toNegated(), 
        // Not: readonly editors
        fileConstants_1.OpenEditorsReadonlyEditorContext.toNegated(), 
        // Not: untitled editors (revert closes them)
        contextkeys_1.ResourceContextKey.Scheme.notEqualsTo(network_1.Schemas.untitled), 
        // Not: auto save after short delay
        filesConfigurationService_1.AutoSaveAfterShortDelayContext.toNegated())
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '2_save',
        order: 30,
        command: {
            id: fileConstants_1.SAVE_ALL_IN_GROUP_COMMAND_ID,
            title: nls.localize('saveAll', "Save All"),
            precondition: contextkeys_1.DirtyWorkingCopiesContext
        },
        // Editor Group
        when: fileConstants_1.OpenEditorsGroupContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '3_compare',
        order: 10,
        command: {
            id: fileConstants_1.COMPARE_WITH_SAVED_COMMAND_ID,
            title: nls.localize('compareWithSaved', "Compare with Saved"),
            precondition: fileConstants_1.OpenEditorsDirtyEditorContext
        },
        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.ResourceContextKey.IsFileSystemResource, filesConfigurationService_1.AutoSaveAfterShortDelayContext.toNegated(), listService_1.WorkbenchListDoubleSelection.toNegated())
    });
    const compareResourceCommand = {
        id: fileConstants_1.COMPARE_RESOURCE_COMMAND_ID,
        title: nls.localize('compareWithSelected', "Compare with Selected")
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '3_compare',
        order: 20,
        command: compareResourceCommand,
        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.ResourceContextKey.HasResource, fileConstants_1.ResourceSelectedForCompareContext, isFileOrUntitledResourceContextKey, listService_1.WorkbenchListDoubleSelection.toNegated())
    });
    const selectForCompareCommand = {
        id: fileConstants_1.SELECT_FOR_COMPARE_COMMAND_ID,
        title: nls.localize('compareSource', "Select for Compare")
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '3_compare',
        order: 30,
        command: selectForCompareCommand,
        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.ResourceContextKey.HasResource, isFileOrUntitledResourceContextKey, listService_1.WorkbenchListDoubleSelection.toNegated())
    });
    const compareSelectedCommand = {
        id: fileConstants_1.COMPARE_SELECTED_COMMAND_ID,
        title: nls.localize('compareSelected', "Compare Selected")
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '3_compare',
        order: 30,
        command: compareSelectedCommand,
        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.ResourceContextKey.HasResource, listService_1.WorkbenchListDoubleSelection, isFileOrUntitledResourceContextKey)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '4_close',
        order: 10,
        command: {
            id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID,
            title: nls.localize('close', "Close")
        },
        when: fileConstants_1.OpenEditorsGroupContext.toNegated()
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '4_close',
        order: 20,
        command: {
            id: editorCommands_1.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID,
            title: nls.localize('closeOthers', "Close Others")
        },
        when: fileConstants_1.OpenEditorsGroupContext.toNegated()
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '4_close',
        order: 30,
        command: {
            id: editorCommands_1.CLOSE_SAVED_EDITORS_COMMAND_ID,
            title: nls.localize('closeSaved', "Close Saved")
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '4_close',
        order: 40,
        command: {
            id: editorCommands_1.CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
            title: nls.localize('closeAll', "Close All")
        }
    });
    // Menu registration - explorer
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: 'navigation',
        order: 4,
        command: {
            id: fileActions_1.NEW_FILE_COMMAND_ID,
            title: fileActions_1.NEW_FILE_LABEL,
            precondition: files_1.ExplorerResourceNotReadonlyContext
        },
        when: files_1.ExplorerFolderContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: 'navigation',
        order: 6,
        command: {
            id: fileActions_1.NEW_FOLDER_COMMAND_ID,
            title: fileActions_1.NEW_FOLDER_LABEL,
            precondition: files_1.ExplorerResourceNotReadonlyContext
        },
        when: files_1.ExplorerFolderContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: 'navigation',
        order: 10,
        command: openToSideCommand,
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerFolderContext.toNegated(), contextkeys_1.ResourceContextKey.HasResource)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: 'navigation',
        order: 20,
        command: {
            id: fileConstants_1.OPEN_WITH_EXPLORER_COMMAND_ID,
            title: nls.localize('explorerOpenWith', "Open With..."),
        },
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerFolderContext.toNegated(), files_1.ExplorerResourceAvailableEditorIdsContext),
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '3_compare',
        order: 20,
        command: compareResourceCommand,
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerFolderContext.toNegated(), contextkeys_1.ResourceContextKey.HasResource, fileConstants_1.ResourceSelectedForCompareContext, listService_1.WorkbenchListDoubleSelection.toNegated())
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '3_compare',
        order: 30,
        command: selectForCompareCommand,
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerFolderContext.toNegated(), contextkeys_1.ResourceContextKey.HasResource, listService_1.WorkbenchListDoubleSelection.toNegated())
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '3_compare',
        order: 30,
        command: compareSelectedCommand,
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerFolderContext.toNegated(), contextkeys_1.ResourceContextKey.HasResource, listService_1.WorkbenchListDoubleSelection)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '5_cutcopypaste',
        order: 8,
        command: {
            id: CUT_FILE_ID,
            title: nls.localize('cut', "Cut")
        },
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerRootContext.toNegated(), files_1.ExplorerResourceNotReadonlyContext)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '5_cutcopypaste',
        order: 10,
        command: {
            id: COPY_FILE_ID,
            title: fileActions_1.COPY_FILE_LABEL
        },
        when: files_1.ExplorerRootContext.toNegated()
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '5_cutcopypaste',
        order: 20,
        command: {
            id: PASTE_FILE_ID,
            title: fileActions_1.PASTE_FILE_LABEL,
            precondition: contextkey_1.ContextKeyExpr.and(files_1.ExplorerResourceNotReadonlyContext, fileActions_1.FileCopiedContext)
        },
        when: files_1.ExplorerFolderContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, ({
        group: '5b_importexport',
        order: 10,
        command: {
            id: fileActions_1.DOWNLOAD_COMMAND_ID,
            title: fileActions_1.DOWNLOAD_LABEL
        },
        when: contextkey_1.ContextKeyExpr.or(
        // native: for any remote resource
        contextkey_1.ContextKeyExpr.and(contextkeys_2.IsWebContext.toNegated(), contextkeys_1.ResourceContextKey.Scheme.notEqualsTo(network_1.Schemas.file)), 
        // web: for any files
        contextkey_1.ContextKeyExpr.and(contextkeys_2.IsWebContext, files_1.ExplorerFolderContext.toNegated(), files_1.ExplorerRootContext.toNegated()), 
        // web: for any folders if file system API support is provided
        contextkey_1.ContextKeyExpr.and(contextkeys_2.IsWebContext, contextkeys_1.HasWebFileSystemAccess))
    }));
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, ({
        group: '5b_importexport',
        order: 20,
        command: {
            id: fileActions_1.UPLOAD_COMMAND_ID,
            title: fileActions_1.UPLOAD_LABEL,
        },
        when: contextkey_1.ContextKeyExpr.and(
        // only in web
        contextkeys_2.IsWebContext, 
        // only on folders
        files_1.ExplorerFolderContext, 
        // only on editable folders
        files_1.ExplorerResourceNotReadonlyContext)
    }));
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '6_copypath',
        order: 10,
        command: copyPathCommand,
        when: contextkeys_1.ResourceContextKey.IsFileSystemResource
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '6_copypath',
        order: 20,
        command: copyRelativePathCommand,
        when: contextkeys_1.ResourceContextKey.IsFileSystemResource
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '2_workspace',
        order: 10,
        command: {
            id: workspaceCommands_1.ADD_ROOT_FOLDER_COMMAND_ID,
            title: workspaceCommands_1.ADD_ROOT_FOLDER_LABEL
        },
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerRootContext, contextkey_1.ContextKeyExpr.or(contextkeys_1.EnterMultiRootWorkspaceSupportContext, contextkeys_1.WorkbenchStateContext.isEqualTo('workspace')))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '2_workspace',
        order: 30,
        command: {
            id: fileConstants_1.REMOVE_ROOT_FOLDER_COMMAND_ID,
            title: fileConstants_1.REMOVE_ROOT_FOLDER_LABEL
        },
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerRootContext, files_1.ExplorerFolderContext, contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkspaceFolderCountContext.notEqualsTo('0'), contextkey_1.ContextKeyExpr.or(contextkeys_1.EnterMultiRootWorkspaceSupportContext, contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'))))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '7_modification',
        order: 10,
        command: {
            id: RENAME_ID,
            title: fileActions_1.TRIGGER_RENAME_LABEL,
            precondition: files_1.ExplorerResourceNotReadonlyContext
        },
        when: files_1.ExplorerRootContext.toNegated()
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '7_modification',
        order: 20,
        command: {
            id: MOVE_FILE_TO_TRASH_ID,
            title: fileActions_1.MOVE_FILE_TO_TRASH_LABEL,
            precondition: files_1.ExplorerResourceNotReadonlyContext
        },
        alt: {
            id: DELETE_FILE_ID,
            title: nls.localize('deleteFile', "Delete Permanently"),
            precondition: files_1.ExplorerResourceNotReadonlyContext
        },
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerRootContext.toNegated(), files_1.ExplorerResourceMoveableToTrash)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '7_modification',
        order: 20,
        command: {
            id: DELETE_FILE_ID,
            title: nls.localize('deleteFile', "Delete Permanently"),
            precondition: files_1.ExplorerResourceNotReadonlyContext
        },
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerRootContext.toNegated(), files_1.ExplorerResourceMoveableToTrash.toNegated())
    });
    // Empty Editor Group / Editor Tabs Container Context Menu
    for (const menuId of [actions_1.MenuId.EmptyEditorGroupContext, actions_1.MenuId.EditorTabsBarContext]) {
        actions_1.MenuRegistry.appendMenuItem(menuId, { command: { id: fileConstants_1.NEW_UNTITLED_FILE_COMMAND_ID, title: nls.localize('newFile', "New Text File") }, group: '1_file', order: 10 });
        actions_1.MenuRegistry.appendMenuItem(menuId, { command: { id: 'workbench.action.quickOpen', title: nls.localize('openFile', "Open File...") }, group: '1_file', order: 20 });
    }
    // File menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '1_new',
        command: {
            id: fileConstants_1.NEW_UNTITLED_FILE_COMMAND_ID,
            title: nls.localize({ key: 'miNewFile', comment: ['&& denotes a mnemonic'] }, "&&New Text File")
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '4_save',
        command: {
            id: fileConstants_1.SAVE_FILE_COMMAND_ID,
            title: nls.localize({ key: 'miSave', comment: ['&& denotes a mnemonic'] }, "&&Save"),
            precondition: contextkey_1.ContextKeyExpr.or(contextkeys_1.ActiveEditorContext, contextkey_1.ContextKeyExpr.and(files_1.FoldersViewVisibleContext, contextkeys_1.SidebarFocusContext))
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '4_save',
        command: {
            id: fileConstants_1.SAVE_FILE_AS_COMMAND_ID,
            title: nls.localize({ key: 'miSaveAs', comment: ['&& denotes a mnemonic'] }, "Save &&As..."),
            precondition: contextkey_1.ContextKeyExpr.or(contextkeys_1.ActiveEditorContext, contextkey_1.ContextKeyExpr.and(files_1.FoldersViewVisibleContext, contextkeys_1.SidebarFocusContext))
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '4_save',
        command: {
            id: fileConstants_1.SAVE_ALL_COMMAND_ID,
            title: nls.localize({ key: 'miSaveAll', comment: ['&& denotes a mnemonic'] }, "Save A&&ll"),
            precondition: contextkeys_1.DirtyWorkingCopiesContext
        },
        order: 3
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '5_autosave',
        command: {
            id: fileActions_1.ToggleAutoSaveAction.ID,
            title: nls.localize({ key: 'miAutoSave', comment: ['&& denotes a mnemonic'] }, "A&&uto Save"),
            toggled: contextkey_1.ContextKeyExpr.notEquals('config.files.autoSave', 'off')
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '6_close',
        command: {
            id: fileConstants_1.REVERT_FILE_COMMAND_ID,
            title: nls.localize({ key: 'miRevert', comment: ['&& denotes a mnemonic'] }, "Re&&vert File"),
            precondition: contextkey_1.ContextKeyExpr.or(
            // Active editor can revert
            contextkey_1.ContextKeyExpr.and(contextkeys_1.ActiveEditorCanRevertContext), 
            // Explorer focused but not on untitled
            contextkey_1.ContextKeyExpr.and(contextkeys_1.ResourceContextKey.Scheme.notEqualsTo(network_1.Schemas.untitled), files_1.FoldersViewVisibleContext, contextkeys_1.SidebarFocusContext)),
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '6_close',
        command: {
            id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID,
            title: nls.localize({ key: 'miCloseEditor', comment: ['&& denotes a mnemonic'] }, "&&Close Editor"),
            precondition: contextkey_1.ContextKeyExpr.or(contextkeys_1.ActiveEditorContext, contextkey_1.ContextKeyExpr.and(files_1.FoldersViewVisibleContext, contextkeys_1.SidebarFocusContext))
        },
        order: 2
    });
    // Go to menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarGoMenu, {
        group: '3_global_nav',
        command: {
            id: 'workbench.action.quickOpen',
            title: nls.localize({ key: 'miGotoFile', comment: ['&& denotes a mnemonic'] }, "Go to &&File...")
        },
        order: 1
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZUFjdGlvbnMuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZmlsZXMvYnJvd3Nlci9maWxlQWN0aW9ucy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMkJoRyw0QkFBNEI7SUFFNUIsSUFBQSx5QkFBZSxFQUFDLDBDQUE0QixDQUFDLENBQUM7SUFDOUMsSUFBQSx5QkFBZSxFQUFDLGdDQUFrQixDQUFDLENBQUM7SUFDcEMsSUFBQSx5QkFBZSxFQUFDLHNDQUF3QixDQUFDLENBQUM7SUFDMUMsSUFBQSx5QkFBZSxFQUFDLHdDQUEwQixDQUFDLENBQUM7SUFDNUMsSUFBQSx5QkFBZSxFQUFDLCtDQUFpQyxDQUFDLENBQUM7SUFDbkQsSUFBQSx5QkFBZSxFQUFDLGtDQUFvQixDQUFDLENBQUM7SUFDdEMsSUFBQSx5QkFBZSxFQUFDLHVDQUF5QixDQUFDLENBQUM7SUFDM0MsSUFBQSx5QkFBZSxFQUFDLDhDQUFnQyxDQUFDLENBQUM7SUFDbEQsSUFBQSx5QkFBZSxFQUFDLCtDQUFpQyxDQUFDLENBQUM7SUFDbkQsSUFBQSx5QkFBZSxFQUFDLGlEQUFtQyxDQUFDLENBQUM7SUFDckQsSUFBQSx5QkFBZSxFQUFDLGdEQUFrQyxDQUFDLENBQUM7SUFFcEQsV0FBVztJQUNYLDJCQUFnQixDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsRUFBRSxnQ0FBaUIsQ0FBQyxDQUFDO0lBQ3pFLDJCQUFnQixDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsRUFBRSwrQkFBZ0IsQ0FBQyxDQUFDO0lBRXZFLE1BQU0sMkJBQTJCLEdBQUcsRUFBRSxDQUFDLENBQUMsbUZBQW1GO0lBRTNILE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQztJQUMvQix5Q0FBbUIsQ0FBQyxnQ0FBZ0MsQ0FBQztRQUNwRCxFQUFFLEVB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