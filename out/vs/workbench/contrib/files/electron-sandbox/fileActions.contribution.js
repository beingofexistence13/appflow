/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/workspace/common/workspace", "vs/base/common/platform", "vs/base/common/network", "vs/platform/native/common/native", "vs/platform/keybinding/common/keybindingsRegistry", "vs/editor/common/editorContextKeys", "vs/base/common/keyCodes", "vs/workbench/contrib/files/browser/files", "vs/platform/list/browser/listService", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/files/electron-sandbox/fileCommands", "vs/platform/actions/common/actions", "vs/workbench/common/contextkeys", "vs/workbench/contrib/files/browser/fileActions.contribution", "vs/workbench/common/editor", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, workspace_1, platform_1, network_1, native_1, keybindingsRegistry_1, editorContextKeys_1, keyCodes_1, files_1, listService_1, editorService_1, fileCommands_1, actions_1, contextkeys_1, fileActions_contribution_1, editor_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const REVEAL_IN_OS_COMMAND_ID = 'revealFileInOS';
    const REVEAL_IN_OS_LABEL = platform_1.isWindows ? nls.localize('revealInWindows', "Reveal in File Explorer") : platform_1.isMacintosh ? nls.localize('revealInMac', "Reveal in Finder") : nls.localize('openContainer', "Open Containing Folder");
    const REVEAL_IN_OS_WHEN_CONTEXT = contextkey_1.ContextKeyExpr.or(contextkeys_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.file), contextkeys_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.vscodeUserData));
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: REVEAL_IN_OS_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: editorContextKeys_1.EditorContextKeys.focus.toNegated(),
        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */,
        win: {
            primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */
        },
        handler: (accessor, resource) => {
            const resources = (0, files_1.getMultiSelectedResources)(resource, accessor.get(listService_1.IListService), accessor.get(editorService_1.IEditorService), accessor.get(files_1.IExplorerService));
            (0, fileCommands_1.revealResourcesInOS)(resources, accessor.get(native_1.INativeHostService), accessor.get(workspace_1.IWorkspaceContextService));
        }
    });
    const REVEAL_ACTIVE_FILE_IN_OS_COMMAND_ID = 'workbench.action.files.revealActiveFileInWindows';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 48 /* KeyCode.KeyR */),
        id: REVEAL_ACTIVE_FILE_IN_OS_COMMAND_ID,
        handler: (accessor) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const activeInput = editorService.activeEditor;
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(activeInput, { filterByScheme: network_1.Schemas.file, supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            const resources = resource ? [resource] : [];
            (0, fileCommands_1.revealResourcesInOS)(resources, accessor.get(native_1.INativeHostService), accessor.get(workspace_1.IWorkspaceContextService));
        }
    });
    (0, fileActions_contribution_1.appendEditorTitleContextMenuItem)(REVEAL_IN_OS_COMMAND_ID, REVEAL_IN_OS_LABEL, REVEAL_IN_OS_WHEN_CONTEXT, '2_files', 0);
    // Menu registration - open editors
    const revealInOsCommand = {
        id: REVEAL_IN_OS_COMMAND_ID,
        title: REVEAL_IN_OS_LABEL
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: 'navigation',
        order: 20,
        command: revealInOsCommand,
        when: REVEAL_IN_OS_WHEN_CONTEXT
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContextShare, {
        title: nls.localize('miShare', "Share"),
        submenu: actions_1.MenuId.MenubarShare,
        group: 'share',
        order: 3,
    });
    // Menu registration - explorer
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: 'navigation',
        order: 20,
        command: revealInOsCommand,
        when: REVEAL_IN_OS_WHEN_CONTEXT
    });
    // Command Palette
    const category = { value: nls.localize('filesCategory', "File"), original: 'File' };
    (0, fileActions_contribution_1.appendToCommandPalette)(REVEAL_IN_OS_COMMAND_ID, { value: REVEAL_IN_OS_LABEL, original: platform_1.isWindows ? 'Reveal in File Explorer' : platform_1.isMacintosh ? 'Reveal in Finder' : 'Open Containing Folder' }, category, REVEAL_IN_OS_WHEN_CONTEXT);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZUFjdGlvbnMuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZmlsZXMvZWxlY3Ryb24tc2FuZGJveC9maWxlQWN0aW9ucy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFzQmhHLE1BQU0sdUJBQXVCLEdBQUcsZ0JBQWdCLENBQUM7SUFDakQsTUFBTSxrQkFBa0IsR0FBRyxvQkFBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLHNCQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFDNU4sTUFBTSx5QkFBeUIsR0FBRywyQkFBYyxDQUFDLEVBQUUsQ0FBQyxnQ0FBa0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGlCQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsZ0NBQWtCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxpQkFBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7SUFFcEsseUNBQW1CLENBQUMsZ0NBQWdDLENBQUM7UUFDcEQsRUFBRSxFQUFFLHVCQUF1QjtRQUMzQixNQUFNLDZDQUFtQztRQUN6QyxJQUFJLEVBQUUscUNBQWlCLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTtRQUN6QyxPQUFPLEVBQUUsZ0RBQTJCLHdCQUFlO1FBQ25ELEdBQUcsRUFBRTtZQUNKLE9BQU8sRUFBRSw4Q0FBeUIsd0JBQWU7U0FDakQ7UUFDRCxPQUFPLEVBQUUsQ0FBQyxRQUEwQixFQUFFLFFBQXNCLEVBQUUsRUFBRTtZQUMvRCxNQUFNLFNBQVMsR0FBRyxJQUFBLGlDQUF5QixFQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLDBCQUFZLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUNoSixJQUFBLGtDQUFtQixFQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLDJCQUFrQixDQUFDLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQ0FBd0IsQ0FBQyxDQUFDLENBQUM7UUFDMUcsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILE1BQU0sbUNBQW1DLEdBQUcsa0RBQWtELENBQUM7SUFFL0YseUNBQW1CLENBQUMsZ0NBQWdDLENBQUM7UUFDcEQsTUFBTSw2Q0FBbUM7UUFDekMsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBQSxtQkFBUSxFQUFDLGlEQUE2Qix3QkFBZTtRQUM5RCxFQUFFLEVBQUUsbUNBQW1DO1FBQ3ZDLE9BQU8sRUFBRSxDQUFDLFFBQTBCLEVBQUUsRUFBRTtZQUN2QyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUFjLENBQUMsQ0FBQztZQUNuRCxNQUFNLFdBQVcsR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDO1lBQy9DLE1BQU0sUUFBUSxHQUFHLCtCQUFzQixDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxjQUFjLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUUseUJBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNuSixNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUM3QyxJQUFBLGtDQUFtQixFQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLDJCQUFrQixDQUFDLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQ0FBd0IsQ0FBQyxDQUFDLENBQUM7UUFDMUcsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILElBQUEsMkRBQWdDLEVBQUMsdUJBQXVCLEVBQUUsa0JBQWtCLEVBQUUseUJBQXlCLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXZILG1DQUFtQztJQUVuQyxNQUFNLGlCQUFpQixHQUFHO1FBQ3pCLEVBQUUsRUFBRSx1QkFBdUI7UUFDM0IsS0FBSyxFQUFFLGtCQUFrQjtLQUN6QixDQUFDO0lBQ0Ysc0JBQVksQ0FBQyxjQUFjLENBQUMsZ0JBQU0sQ0FBQyxrQkFBa0IsRUFBRTtRQUN0RCxLQUFLLEVBQUUsWUFBWTtRQUNuQixLQUFLLEVBQUUsRUFBRTtRQUNULE9BQU8sRUFBRSxpQkFBaUI7UUFDMUIsSUFBSSxFQUFFLHlCQUF5QjtLQUMvQixDQUFDLENBQUM7SUFDSCxzQkFBWSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLHVCQUF1QixFQUFFO1FBQzNELEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUM7UUFDdkMsT0FBTyxFQUFFLGdCQUFNLENBQUMsWUFBWTtRQUM1QixLQUFLLEVBQUUsT0FBTztRQUNkLEtBQUssRUFBRSxDQUFDO0tBQ1IsQ0FBQyxDQUFDO0lBRUgsK0JBQStCO0lBRS9CLHNCQUFZLENBQUMsY0FBYyxDQUFDLGdCQUFNLENBQUMsZUFBZSxFQUFFO1FBQ25ELEtBQUssRUFBRSxZQUFZO1FBQ25CLEtBQUssRUFBRSxFQUFFO1FBQ1QsT0FBTyxFQUFFLGlCQUFpQjtRQUMxQixJQUFJLEVBQUUseUJBQXlCO0tBQy9CLENBQUMsQ0FBQztJQUVILGtCQUFrQjtJQUVsQixNQUFNLFFBQVEsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUM7SUFDcEYsSUFBQSxpREFBc0IsRUFBQyx1QkFBdUIsRUFBRSxFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsb0JBQVMsQ0FBQyxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLHNCQUFXLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLFFBQVEsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDIn0=