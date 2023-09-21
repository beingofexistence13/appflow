/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/electron-sandbox/fileActions.contribution", "vs/platform/workspace/common/workspace", "vs/base/common/platform", "vs/base/common/network", "vs/platform/native/common/native", "vs/platform/keybinding/common/keybindingsRegistry", "vs/editor/common/editorContextKeys", "vs/base/common/keyCodes", "vs/workbench/contrib/files/browser/files", "vs/platform/list/browser/listService", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/files/electron-sandbox/fileCommands", "vs/platform/actions/common/actions", "vs/workbench/common/contextkeys", "vs/workbench/contrib/files/browser/fileActions.contribution", "vs/workbench/common/editor", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, workspace_1, platform_1, network_1, native_1, keybindingsRegistry_1, editorContextKeys_1, keyCodes_1, files_1, listService_1, editorService_1, fileCommands_1, actions_1, contextkeys_1, fileActions_contribution_1, editor_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const REVEAL_IN_OS_COMMAND_ID = 'revealFileInOS';
    const REVEAL_IN_OS_LABEL = platform_1.$i ? nls.localize(0, null) : platform_1.$j ? nls.localize(1, null) : nls.localize(2, null);
    const REVEAL_IN_OS_WHEN_CONTEXT = contextkey_1.$Ii.or(contextkeys_1.$Kdb.Scheme.isEqualTo(network_1.Schemas.file), contextkeys_1.$Kdb.Scheme.isEqualTo(network_1.Schemas.vscodeUserData));
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: REVEAL_IN_OS_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: editorContextKeys_1.EditorContextKeys.focus.toNegated(),
        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */,
        win: {
            primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */
        },
        handler: (accessor, resource) => {
            const resources = (0, files_1.$zHb)(resource, accessor.get(listService_1.$03), accessor.get(editorService_1.$9C), accessor.get(files_1.$xHb));
            (0, fileCommands_1.$gac)(resources, accessor.get(native_1.$05b), accessor.get(workspace_1.$Kh));
        }
    });
    const REVEAL_ACTIVE_FILE_IN_OS_COMMAND_ID = 'workbench.action.files.revealActiveFileInWindows';
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 48 /* KeyCode.KeyR */),
        id: REVEAL_ACTIVE_FILE_IN_OS_COMMAND_ID,
        handler: (accessor) => {
            const editorService = accessor.get(editorService_1.$9C);
            const activeInput = editorService.activeEditor;
            const resource = editor_1.$3E.getOriginalUri(activeInput, { filterByScheme: network_1.Schemas.file, supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            const resources = resource ? [resource] : [];
            (0, fileCommands_1.$gac)(resources, accessor.get(native_1.$05b), accessor.get(workspace_1.$Kh));
        }
    });
    (0, fileActions_contribution_1.$3Lb)(REVEAL_IN_OS_COMMAND_ID, REVEAL_IN_OS_LABEL, REVEAL_IN_OS_WHEN_CONTEXT, '2_files', 0);
    // Menu registration - open editors
    const revealInOsCommand = {
        id: REVEAL_IN_OS_COMMAND_ID,
        title: REVEAL_IN_OS_LABEL
    };
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.OpenEditorsContext, {
        group: 'navigation',
        order: 20,
        command: revealInOsCommand,
        when: REVEAL_IN_OS_WHEN_CONTEXT
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.OpenEditorsContextShare, {
        title: nls.localize(3, null),
        submenu: actions_1.$Ru.MenubarShare,
        group: 'share',
        order: 3,
    });
    // Menu registration - explorer
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ExplorerContext, {
        group: 'navigation',
        order: 20,
        command: revealInOsCommand,
        when: REVEAL_IN_OS_WHEN_CONTEXT
    });
    // Command Palette
    const category = { value: nls.localize(4, null), original: 'File' };
    (0, fileActions_contribution_1.$4Lb)(REVEAL_IN_OS_COMMAND_ID, { value: REVEAL_IN_OS_LABEL, original: platform_1.$i ? 'Reveal in File Explorer' : platform_1.$j ? 'Reveal in Finder' : 'Open Containing Folder' }, category, REVEAL_IN_OS_WHEN_CONTEXT);
});
//# sourceMappingURL=fileActions.contribution.js.map