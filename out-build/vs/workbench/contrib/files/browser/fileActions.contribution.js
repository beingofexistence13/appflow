/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/fileActions.contribution", "vs/workbench/contrib/files/browser/fileActions", "vs/workbench/contrib/files/browser/editors/textFileSaveErrorHandler", "vs/platform/actions/common/actions", "vs/workbench/contrib/files/browser/fileCommands", "vs/workbench/contrib/files/browser/fileConstants", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/contrib/files/common/files", "vs/workbench/browser/actions/workspaceCommands", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/list/browser/listService", "vs/base/common/network", "vs/workbench/common/contextkeys", "vs/platform/contextkey/common/contextkeys", "vs/workbench/contrib/files/browser/files", "vs/base/common/codicons", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls, fileActions_1, textFileSaveErrorHandler_1, actions_1, fileCommands_1, fileConstants_1, commands_1, contextkey_1, keybindingsRegistry_1, files_1, workspaceCommands_1, editorCommands_1, filesConfigurationService_1, listService_1, network_1, contextkeys_1, contextkeys_2, files_2, codicons_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4Lb = exports.$3Lb = void 0;
    // Contribute Global Actions
    (0, actions_1.$Xu)(fileActions_1.$VHb);
    (0, actions_1.$Xu)(fileActions_1.$ZHb);
    (0, actions_1.$Xu)(fileActions_1.$1Hb);
    (0, actions_1.$Xu)(fileActions_1.$5Hb);
    (0, actions_1.$Xu)(fileActions_1.$4Hb);
    (0, actions_1.$Xu)(fileActions_1.$WHb);
    (0, actions_1.$Xu)(fileActions_1.$2Hb);
    (0, actions_1.$Xu)(fileActions_1.$aIb);
    (0, actions_1.$Xu)(fileActions_1.$bIb);
    (0, actions_1.$Xu)(fileActions_1.$cIb);
    (0, actions_1.$Xu)(fileActions_1.$dIb);
    // Commands
    commands_1.$Gr.registerCommand('_files.windowOpen', fileCommands_1.$1Lb);
    commands_1.$Gr.registerCommand('_files.newWindow', fileCommands_1.$2Lb);
    const explorerCommandsWeightBonus = 10; // give our commands a little bit more weight over other default list/tree commands
    const RENAME_ID = 'renameFile';
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: RENAME_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.$Ii.and(files_1.$5db, files_1.$Udb.toNegated(), files_1.$Sdb),
        primary: 60 /* KeyCode.F2 */,
        mac: {
            primary: 3 /* KeyCode.Enter */
        },
        handler: fileActions_1.$6Hb
    });
    const MOVE_FILE_TO_TRASH_ID = 'moveFileToTrash';
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: MOVE_FILE_TO_TRASH_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.$Ii.and(files_1.$5db, files_1.$Sdb, files_1.$Wdb),
        primary: 20 /* KeyCode.Delete */,
        mac: {
            primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
            secondary: [20 /* KeyCode.Delete */]
        },
        handler: fileActions_1.$7Hb
    });
    const DELETE_FILE_ID = 'deleteFile';
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: DELETE_FILE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.$Ii.and(files_1.$5db, files_1.$Sdb),
        primary: 1024 /* KeyMod.Shift */ | 20 /* KeyCode.Delete */,
        mac: {
            primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 1 /* KeyCode.Backspace */
        },
        handler: fileActions_1.$8Hb
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: DELETE_FILE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.$Ii.and(files_1.$5db, files_1.$Sdb, files_1.$Wdb.toNegated()),
        primary: 20 /* KeyCode.Delete */,
        mac: {
            primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */
        },
        handler: fileActions_1.$8Hb
    });
    const CUT_FILE_ID = 'filesExplorer.cut';
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: CUT_FILE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.$Ii.and(files_1.$5db, files_1.$Udb.toNegated(), files_1.$Sdb),
        primary: 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */,
        handler: fileActions_1.$0Hb,
    });
    const COPY_FILE_ID = 'filesExplorer.copy';
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: COPY_FILE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.$Ii.and(files_1.$5db, files_1.$Udb.toNegated()),
        primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
        handler: fileActions_1.$9Hb,
    });
    const PASTE_FILE_ID = 'filesExplorer.paste';
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: PASTE_FILE_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.$Ii.and(files_1.$5db, files_1.$Sdb),
        primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */,
        handler: fileActions_1.$$Hb
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'filesExplorer.cancelCut',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.$Ii.and(files_1.$5db, files_1.$Vdb),
        primary: 9 /* KeyCode.Escape */,
        handler: async (accessor) => {
            const explorerService = accessor.get(files_2.$xHb);
            await explorerService.setToCopy([], true);
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'filesExplorer.openFilePreserveFocus',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.$Ii.and(files_1.$5db, files_1.$Qdb.toNegated()),
        primary: 10 /* KeyCode.Space */,
        handler: fileActions_1.$_Hb
    });
    const copyPathCommand = {
        id: fileConstants_1.$5Gb,
        title: nls.localize(0, null)
    };
    const copyRelativePathCommand = {
        id: fileConstants_1.$6Gb,
        title: nls.localize(1, null)
    };
    // Editor Title Context Menu
    $3Lb(fileConstants_1.$5Gb, copyPathCommand.title, contextkeys_1.$Kdb.IsFileSystemResource, '1_cutcopypaste');
    $3Lb(fileConstants_1.$6Gb, copyRelativePathCommand.title, contextkeys_1.$Kdb.IsFileSystemResource, '1_cutcopypaste');
    $3Lb(fileConstants_1.$WGb, nls.localize(2, null), contextkeys_1.$Kdb.IsFileSystemResource, '2_files', 1);
    function $3Lb(id, title, when, group, order) {
        // Menu
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitleContext, {
            command: { id, title },
            when,
            group,
            order
        });
    }
    exports.$3Lb = $3Lb;
    // Editor Title Menu for Conflict Resolution
    appendSaveConflictEditorTitleAction('workbench.files.action.acceptLocalChanges', nls.localize(3, null), codicons_1.$Pj.check, -10, textFileSaveErrorHandler_1.$YLb);
    appendSaveConflictEditorTitleAction('workbench.files.action.revertLocalChanges', nls.localize(4, null), codicons_1.$Pj.discard, -9, textFileSaveErrorHandler_1.$ZLb);
    function appendSaveConflictEditorTitleAction(id, title, icon, order, command) {
        // Command
        commands_1.$Gr.registerCommand(id, command);
        // Action
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorTitle, {
            command: { id, title, icon },
            when: contextkey_1.$Ii.equals(textFileSaveErrorHandler_1.$VLb, true),
            group: 'navigation',
            order
        });
    }
    // Menu registration - command palette
    function $4Lb(id, title, category, when) {
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
            command: {
                id,
                title,
                category
            },
            when
        });
    }
    exports.$4Lb = $4Lb;
    $4Lb(fileConstants_1.$5Gb, { value: nls.localize(5, null), original: 'Copy Path of Active File' }, actionCommonCategories_1.$Nl.File);
    $4Lb(fileConstants_1.$6Gb, { value: nls.localize(6, null), original: 'Copy Relative Path of Active File' }, actionCommonCategories_1.$Nl.File);
    $4Lb(fileConstants_1.$9Gb, { value: fileConstants_1.$0Gb, original: 'Save' }, actionCommonCategories_1.$Nl.File);
    $4Lb(fileConstants_1.$$Gb, { value: fileConstants_1.$_Gb, original: 'Save without Formatting' }, actionCommonCategories_1.$Nl.File);
    $4Lb(fileConstants_1.$cHb, { value: nls.localize(7, null), original: 'Save All in Group' }, actionCommonCategories_1.$Nl.File);
    $4Lb(fileConstants_1.$dHb, { value: nls.localize(8, null), original: 'Save All Files' }, actionCommonCategories_1.$Nl.File);
    $4Lb(fileConstants_1.$XGb, { value: nls.localize(9, null), original: 'Revert File' }, actionCommonCategories_1.$Nl.File);
    $4Lb(fileConstants_1.$4Gb, { value: nls.localize(10, null), original: 'Compare Active File with Saved' }, actionCommonCategories_1.$Nl.File);
    $4Lb(fileConstants_1.$7Gb, { value: fileConstants_1.$8Gb, original: 'Save As...' }, actionCommonCategories_1.$Nl.File);
    $4Lb(fileActions_1.$GHb, { value: fileActions_1.$HHb, original: 'New File' }, actionCommonCategories_1.$Nl.File, contextkeys_1.$Qcb.notEqualsTo('0'));
    $4Lb(fileActions_1.$IHb, { value: fileActions_1.$JHb, original: 'New Folder' }, actionCommonCategories_1.$Nl.File, contextkeys_1.$Qcb.notEqualsTo('0'));
    $4Lb(fileConstants_1.$oHb, { value: fileConstants_1.$pHb, original: 'New Untitled Text File' }, actionCommonCategories_1.$Nl.File);
    // Menu registration - open editors
    const isFileOrUntitledResourceContextKey = contextkey_1.$Ii.or(contextkeys_1.$Kdb.IsFileSystemResource, contextkeys_1.$Kdb.Scheme.isEqualTo(network_1.Schemas.untitled));
    const openToSideCommand = {
        id: fileConstants_1.$YGb,
        title: nls.localize(11, null)
    };
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.OpenEditorsContext, {
        group: 'navigation',
        order: 10,
        command: openToSideCommand,
        when: isFileOrUntitledResourceContextKey
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.OpenEditorsContext, {
        group: '1_open',
        order: 10,
        command: {
            id: editorCommands_1.$vub,
            title: nls.localize(12, null)
        },
        when: contextkeys_1.$_cb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.OpenEditorsContext, {
        group: '1_cutcopypaste',
        order: 10,
        command: copyPathCommand,
        when: contextkeys_1.$Kdb.IsFileSystemResource
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.OpenEditorsContext, {
        group: '1_cutcopypaste',
        order: 20,
        command: copyRelativePathCommand,
        when: contextkeys_1.$Kdb.IsFileSystemResource
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.OpenEditorsContext, {
        group: '2_save',
        order: 10,
        command: {
            id: fileConstants_1.$9Gb,
            title: fileConstants_1.$0Gb,
            precondition: fileConstants_1.$fHb
        },
        when: contextkey_1.$Ii.or(
        // Untitled Editors
        contextkeys_1.$Kdb.Scheme.isEqualTo(network_1.Schemas.untitled), 
        // Or:
        contextkey_1.$Ii.and(
        // Not: editor groups
        fileConstants_1.$eHb.toNegated(), 
        // Not: readonly editors
        fileConstants_1.$gHb.toNegated(), 
        // Not: auto save after short delay
        filesConfigurationService_1.$xD.toNegated()))
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.OpenEditorsContext, {
        group: '2_save',
        order: 20,
        command: {
            id: fileConstants_1.$XGb,
            title: nls.localize(13, null),
            precondition: fileConstants_1.$fHb
        },
        when: contextkey_1.$Ii.and(
        // Not: editor groups
        fileConstants_1.$eHb.toNegated(), 
        // Not: readonly editors
        fileConstants_1.$gHb.toNegated(), 
        // Not: untitled editors (revert closes them)
        contextkeys_1.$Kdb.Scheme.notEqualsTo(network_1.Schemas.untitled), 
        // Not: auto save after short delay
        filesConfigurationService_1.$xD.toNegated())
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.OpenEditorsContext, {
        group: '2_save',
        order: 30,
        command: {
            id: fileConstants_1.$cHb,
            title: nls.localize(14, null),
            precondition: contextkeys_1.$Ucb
        },
        // Editor Group
        when: fileConstants_1.$eHb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.OpenEditorsContext, {
        group: '3_compare',
        order: 10,
        command: {
            id: fileConstants_1.$4Gb,
            title: nls.localize(15, null),
            precondition: fileConstants_1.$fHb
        },
        when: contextkey_1.$Ii.and(contextkeys_1.$Kdb.IsFileSystemResource, filesConfigurationService_1.$xD.toNegated(), listService_1.$g4.toNegated())
    });
    const compareResourceCommand = {
        id: fileConstants_1.$3Gb,
        title: nls.localize(16, null)
    };
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.OpenEditorsContext, {
        group: '3_compare',
        order: 20,
        command: compareResourceCommand,
        when: contextkey_1.$Ii.and(contextkeys_1.$Kdb.HasResource, fileConstants_1.$hHb, isFileOrUntitledResourceContextKey, listService_1.$g4.toNegated())
    });
    const selectForCompareCommand = {
        id: fileConstants_1.$1Gb,
        title: nls.localize(17, null)
    };
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.OpenEditorsContext, {
        group: '3_compare',
        order: 30,
        command: selectForCompareCommand,
        when: contextkey_1.$Ii.and(contextkeys_1.$Kdb.HasResource, isFileOrUntitledResourceContextKey, listService_1.$g4.toNegated())
    });
    const compareSelectedCommand = {
        id: fileConstants_1.$2Gb,
        title: nls.localize(18, null)
    };
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.OpenEditorsContext, {
        group: '3_compare',
        order: 30,
        command: compareSelectedCommand,
        when: contextkey_1.$Ii.and(contextkeys_1.$Kdb.HasResource, listService_1.$g4, isFileOrUntitledResourceContextKey)
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.OpenEditorsContext, {
        group: '4_close',
        order: 10,
        command: {
            id: editorCommands_1.$iub,
            title: nls.localize(19, null)
        },
        when: fileConstants_1.$eHb.toNegated()
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.OpenEditorsContext, {
        group: '4_close',
        order: 20,
        command: {
            id: editorCommands_1.$lub,
            title: nls.localize(20, null)
        },
        when: fileConstants_1.$eHb.toNegated()
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.OpenEditorsContext, {
        group: '4_close',
        order: 30,
        command: {
            id: editorCommands_1.$eub,
            title: nls.localize(21, null)
        }
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.OpenEditorsContext, {
        group: '4_close',
        order: 40,
        command: {
            id: editorCommands_1.$fub,
            title: nls.localize(22, null)
        }
    });
    // Menu registration - explorer
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, {
        group: 'navigation',
        order: 4,
        command: {
            id: fileActions_1.$GHb,
            title: fileActions_1.$HHb,
            precondition: files_1.$Sdb
        },
        when: files_1.$Qdb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, {
        group: 'navigation',
        order: 6,
        command: {
            id: fileActions_1.$IHb,
            title: fileActions_1.$JHb,
            precondition: files_1.$Sdb
        },
        when: files_1.$Qdb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, {
        group: 'navigation',
        order: 10,
        command: openToSideCommand,
        when: contextkey_1.$Ii.and(files_1.$Qdb.toNegated(), contextkeys_1.$Kdb.HasResource)
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, {
        group: 'navigation',
        order: 20,
        command: {
            id: fileConstants_1.$ZGb,
            title: nls.localize(23, null),
        },
        when: contextkey_1.$Ii.and(files_1.$Qdb.toNegated(), files_1.$Tdb),
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, {
        group: '3_compare',
        order: 20,
        command: compareResourceCommand,
        when: contextkey_1.$Ii.and(files_1.$Qdb.toNegated(), contextkeys_1.$Kdb.HasResource, fileConstants_1.$hHb, listService_1.$g4.toNegated())
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, {
        group: '3_compare',
        order: 30,
        command: selectForCompareCommand,
        when: contextkey_1.$Ii.and(files_1.$Qdb.toNegated(), contextkeys_1.$Kdb.HasResource, listService_1.$g4.toNegated())
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, {
        group: '3_compare',
        order: 30,
        command: compareSelectedCommand,
        when: contextkey_1.$Ii.and(files_1.$Qdb.toNegated(), contextkeys_1.$Kdb.HasResource, listService_1.$g4)
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, {
        group: '5_cutcopypaste',
        order: 8,
        command: {
            id: CUT_FILE_ID,
            title: nls.localize(24, null)
        },
        when: contextkey_1.$Ii.and(files_1.$Udb.toNegated(), files_1.$Sdb)
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, {
        group: '5_cutcopypaste',
        order: 10,
        command: {
            id: COPY_FILE_ID,
            title: fileActions_1.$MHb
        },
        when: files_1.$Udb.toNegated()
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, {
        group: '5_cutcopypaste',
        order: 20,
        command: {
            id: PASTE_FILE_ID,
            title: fileActions_1.$NHb,
            precondition: contextkey_1.$Ii.and(files_1.$Sdb, fileActions_1.$OHb)
        },
        when: files_1.$Qdb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, ({
        group: '5b_importexport',
        order: 10,
        command: {
            id: fileActions_1.$PHb,
            title: fileActions_1.$QHb
        },
        when: contextkey_1.$Ii.or(
        // native: for any remote resource
        contextkey_1.$Ii.and(contextkeys_2.$23.toNegated(), contextkeys_1.$Kdb.Scheme.notEqualsTo(network_1.Schemas.file)), 
        // web: for any files
        contextkey_1.$Ii.and(contextkeys_2.$23, files_1.$Qdb.toNegated(), files_1.$Udb.toNegated()), 
        // web: for any folders if file system API support is provided
        contextkey_1.$Ii.and(contextkeys_2.$23, contextkeys_1.$Zcb))
    }));
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, ({
        group: '5b_importexport',
        order: 20,
        command: {
            id: fileActions_1.$RHb,
            title: fileActions_1.$SHb,
        },
        when: contextkey_1.$Ii.and(
        // only in web
        contextkeys_2.$23, 
        // only on folders
        files_1.$Qdb, 
        // only on editable folders
        files_1.$Sdb)
    }));
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, {
        group: '6_copypath',
        order: 10,
        command: copyPathCommand,
        when: contextkeys_1.$Kdb.IsFileSystemResource
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, {
        group: '6_copypath',
        order: 20,
        command: copyRelativePathCommand,
        when: contextkeys_1.$Kdb.IsFileSystemResource
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, {
        group: '2_workspace',
        order: 10,
        command: {
            id: workspaceCommands_1.$agb,
            title: workspaceCommands_1.$bgb
        },
        when: contextkey_1.$Ii.and(files_1.$Udb, contextkey_1.$Ii.or(contextkeys_1.$Scb, contextkeys_1.$Pcb.isEqualTo('workspace')))
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, {
        group: '2_workspace',
        order: 30,
        command: {
            id: fileConstants_1.$iHb,
            title: fileConstants_1.$jHb
        },
        when: contextkey_1.$Ii.and(files_1.$Udb, files_1.$Qdb, contextkey_1.$Ii.and(contextkeys_1.$Qcb.notEqualsTo('0'), contextkey_1.$Ii.or(contextkeys_1.$Scb, contextkeys_1.$Pcb.isEqualTo('workspace'))))
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, {
        group: '7_modification',
        order: 10,
        command: {
            id: RENAME_ID,
            title: fileActions_1.$KHb,
            precondition: files_1.$Sdb
        },
        when: files_1.$Udb.toNegated()
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, {
        group: '7_modification',
        order: 20,
        command: {
            id: MOVE_FILE_TO_TRASH_ID,
            title: fileActions_1.$LHb,
            precondition: files_1.$Sdb
        },
        alt: {
            id: DELETE_FILE_ID,
            title: nls.localize(25, null),
            precondition: files_1.$Sdb
        },
        when: contextkey_1.$Ii.and(files_1.$Udb.toNegated(), files_1.$Wdb)
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, {
        group: '7_modification',
        order: 20,
        command: {
            id: DELETE_FILE_ID,
            title: nls.localize(26, null),
            precondition: files_1.$Sdb
        },
        when: contextkey_1.$Ii.and(files_1.$Udb.toNegated(), files_1.$Wdb.toNegated())
    });
    // Empty Editor Group / Editor Tabs Container Context Menu
    for (const menuId of [actions_1.$Ru.EmptyEditorGroupContext, actions_1.$Ru.EditorTabsBarContext]) {
        actions_1.$Tu.appendMenuItem(menuId, { command: { id: fileConstants_1.$oHb, title: nls.localize(27, null) }, group: '1_file', order: 10 });
        actions_1.$Tu.appendMenuItem(menuId, { command: { id: 'workbench.action.quickOpen', title: nls.localize(28, null) }, group: '1_file', order: 20 });
    }
    // File menu
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        group: '1_new',
        command: {
            id: fileConstants_1.$oHb,
            title: nls.localize(29, null)
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        group: '4_save',
        command: {
            id: fileConstants_1.$9Gb,
            title: nls.localize(30, null),
            precondition: contextkey_1.$Ii.or(contextkeys_1.$$cb, contextkey_1.$Ii.and(files_1.$Pdb, contextkeys_1.$rdb))
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        group: '4_save',
        command: {
            id: fileConstants_1.$7Gb,
            title: nls.localize(31, null),
            precondition: contextkey_1.$Ii.or(contextkeys_1.$$cb, contextkey_1.$Ii.and(files_1.$Pdb, contextkeys_1.$rdb))
        },
        order: 2
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        group: '4_save',
        command: {
            id: fileConstants_1.$aHb,
            title: nls.localize(32, null),
            precondition: contextkeys_1.$Ucb
        },
        order: 3
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        group: '5_autosave',
        command: {
            id: fileActions_1.$WHb.ID,
            title: nls.localize(33, null),
            toggled: contextkey_1.$Ii.notEquals('config.files.autoSave', 'off')
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        group: '6_close',
        command: {
            id: fileConstants_1.$XGb,
            title: nls.localize(34, null),
            precondition: contextkey_1.$Ii.or(
            // Active editor can revert
            contextkey_1.$Ii.and(contextkeys_1.$9cb), 
            // Explorer focused but not on untitled
            contextkey_1.$Ii.and(contextkeys_1.$Kdb.Scheme.notEqualsTo(network_1.Schemas.untitled), files_1.$Pdb, contextkeys_1.$rdb)),
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        group: '6_close',
        command: {
            id: editorCommands_1.$iub,
            title: nls.localize(35, null),
            precondition: contextkey_1.$Ii.or(contextkeys_1.$$cb, contextkey_1.$Ii.and(files_1.$Pdb, contextkeys_1.$rdb))
        },
        order: 2
    });
    // Go to menu
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarGoMenu, {
        group: '3_global_nav',
        command: {
            id: 'workbench.action.quickOpen',
            title: nls.localize(36, null)
        },
        order: 1
    });
});
//# sourceMappingURL=fileActions.contribution.js.map