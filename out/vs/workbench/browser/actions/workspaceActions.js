/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/workspace/common/workspace", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/workbench/services/editor/common/editorService", "vs/platform/commands/common/commands", "vs/workbench/browser/actions/workspaceCommands", "vs/platform/dialogs/common/dialogs", "vs/platform/actions/common/actions", "vs/workbench/common/contextkeys", "vs/workbench/services/host/browser/host", "vs/base/common/keyCodes", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/environment/common/environmentService", "vs/platform/workspaces/common/workspaces", "vs/platform/contextkey/common/contextkeys", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls_1, workspace_1, workspaceEditing_1, editorService_1, commands_1, workspaceCommands_1, dialogs_1, actions_1, contextkeys_1, host_1, keyCodes_1, contextkey_1, environmentService_1, workspaces_1, contextkeys_2, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoveRootFolderAction = exports.AddRootFolderAction = exports.OpenFileFolderAction = exports.OpenFolderViaWorkspaceAction = exports.OpenFolderAction = exports.OpenFileAction = void 0;
    const workspacesCategory = { value: (0, nls_1.localize)('workspaces', "Workspaces"), original: 'Workspaces' };
    class OpenFileAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.files.openFile'; }
        constructor() {
            super({
                id: OpenFileAction.ID,
                title: { value: (0, nls_1.localize)('openFile', "Open File..."), original: 'Open File...' },
                category: actionCommonCategories_1.Categories.File,
                f1: true,
                precondition: contextkeys_2.IsMacNativeContext.toNegated(),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */
                }
            });
        }
        async run(accessor, data) {
            const fileDialogService = accessor.get(dialogs_1.IFileDialogService);
            return fileDialogService.pickFileAndOpen({ forceNewWindow: false, telemetryExtraData: data });
        }
    }
    exports.OpenFileAction = OpenFileAction;
    class OpenFolderAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.files.openFolder'; }
        constructor() {
            super({
                id: OpenFolderAction.ID,
                title: { value: (0, nls_1.localize)('openFolder', "Open Folder..."), original: 'Open Folder...' },
                category: actionCommonCategories_1.Categories.File,
                f1: true,
                precondition: contextkeys_1.OpenFolderWorkspaceSupportContext,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: undefined,
                    linux: {
                        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */)
                    },
                    win: {
                        primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */)
                    }
                }
            });
        }
        async run(accessor, data) {
            const fileDialogService = accessor.get(dialogs_1.IFileDialogService);
            return fileDialogService.pickFolderAndOpen({ forceNewWindow: false, telemetryExtraData: data });
        }
    }
    exports.OpenFolderAction = OpenFolderAction;
    class OpenFolderViaWorkspaceAction extends actions_1.Action2 {
        // This action swaps the folders of a workspace with
        // the selected folder and is a workaround for providing
        // "Open Folder..." in environments that do not support
        // this without having a workspace open (e.g. web serverless)
        static { this.ID = 'workbench.action.files.openFolderViaWorkspace'; }
        constructor() {
            super({
                id: OpenFolderViaWorkspaceAction.ID,
                title: { value: (0, nls_1.localize)('openFolder', "Open Folder..."), original: 'Open Folder...' },
                category: actionCommonCategories_1.Categories.File,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(contextkeys_1.OpenFolderWorkspaceSupportContext.toNegated(), contextkeys_1.WorkbenchStateContext.isEqualTo('workspace')),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */
                }
            });
        }
        run(accessor) {
            const commandService = accessor.get(commands_1.ICommandService);
            return commandService.executeCommand(workspaceCommands_1.SET_ROOT_FOLDER_COMMAND_ID);
        }
    }
    exports.OpenFolderViaWorkspaceAction = OpenFolderViaWorkspaceAction;
    class OpenFileFolderAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.files.openFileFolder'; }
        static { this.LABEL = { value: (0, nls_1.localize)('openFileFolder', "Open..."), original: 'Open...' }; }
        constructor() {
            super({
                id: OpenFileFolderAction.ID,
                title: OpenFileFolderAction.LABEL,
                category: actionCommonCategories_1.Categories.File,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(contextkeys_2.IsMacNativeContext, contextkeys_1.OpenFolderWorkspaceSupportContext),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */
                }
            });
        }
        async run(accessor, data) {
            const fileDialogService = accessor.get(dialogs_1.IFileDialogService);
            return fileDialogService.pickFileFolderAndOpen({ forceNewWindow: false, telemetryExtraData: data });
        }
    }
    exports.OpenFileFolderAction = OpenFileFolderAction;
    class OpenWorkspaceAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openWorkspace'; }
        constructor() {
            super({
                id: OpenWorkspaceAction.ID,
                title: { value: (0, nls_1.localize)('openWorkspaceAction', "Open Workspace from File..."), original: 'Open Workspace from File...' },
                category: actionCommonCategories_1.Categories.File,
                f1: true,
                precondition: contextkeys_1.EnterMultiRootWorkspaceSupportContext
            });
        }
        async run(accessor, data) {
            const fileDialogService = accessor.get(dialogs_1.IFileDialogService);
            return fileDialogService.pickWorkspaceAndOpen({ telemetryExtraData: data });
        }
    }
    class CloseWorkspaceAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.closeFolder'; }
        constructor() {
            super({
                id: CloseWorkspaceAction.ID,
                title: { value: (0, nls_1.localize)('closeWorkspace', "Close Workspace"), original: 'Close Workspace' },
                category: workspacesCategory,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('empty'), contextkeys_1.EmptyWorkspaceSupportContext),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 36 /* KeyCode.KeyF */)
                }
            });
        }
        async run(accessor) {
            const hostService = accessor.get(host_1.IHostService);
            const environmentService = accessor.get(environmentService_1.IWorkbenchEnvironmentService);
            return hostService.openWindow({ forceReuseWindow: true, remoteAuthority: environmentService.remoteAuthority });
        }
    }
    class OpenWorkspaceConfigFileAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openWorkspaceConfigFile'; }
        constructor() {
            super({
                id: OpenWorkspaceConfigFileAction.ID,
                title: { value: (0, nls_1.localize)('openWorkspaceConfigFile', "Open Workspace Configuration File"), original: 'Open Workspace Configuration File' },
                category: workspacesCategory,
                f1: true,
                precondition: contextkeys_1.WorkbenchStateContext.isEqualTo('workspace')
            });
        }
        async run(accessor) {
            const contextService = accessor.get(workspace_1.IWorkspaceContextService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const configuration = contextService.getWorkspace().configuration;
            if (configuration) {
                await editorService.openEditor({ resource: configuration, options: { pinned: true } });
            }
        }
    }
    class AddRootFolderAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.addRootFolder'; }
        constructor() {
            super({
                id: AddRootFolderAction.ID,
                title: workspaceCommands_1.ADD_ROOT_FOLDER_LABEL,
                category: workspacesCategory,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.or(contextkeys_1.EnterMultiRootWorkspaceSupportContext, contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'))
            });
        }
        run(accessor) {
            const commandService = accessor.get(commands_1.ICommandService);
            return commandService.executeCommand(workspaceCommands_1.ADD_ROOT_FOLDER_COMMAND_ID);
        }
    }
    exports.AddRootFolderAction = AddRootFolderAction;
    class RemoveRootFolderAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.removeRootFolder'; }
        constructor() {
            super({
                id: RemoveRootFolderAction.ID,
                title: { value: (0, nls_1.localize)('globalRemoveFolderFromWorkspace', "Remove Folder from Workspace..."), original: 'Remove Folder from Workspace...' },
                category: workspacesCategory,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkspaceFolderCountContext.notEqualsTo('0'), contextkey_1.ContextKeyExpr.or(contextkeys_1.EnterMultiRootWorkspaceSupportContext, contextkeys_1.WorkbenchStateContext.isEqualTo('workspace')))
            });
        }
        async run(accessor) {
            const commandService = accessor.get(commands_1.ICommandService);
            const workspaceEditingService = accessor.get(workspaceEditing_1.IWorkspaceEditingService);
            const folder = await commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID);
            if (folder) {
                await workspaceEditingService.removeFolders([folder.uri]);
            }
        }
    }
    exports.RemoveRootFolderAction = RemoveRootFolderAction;
    class SaveWorkspaceAsAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.saveWorkspaceAs'; }
        constructor() {
            super({
                id: SaveWorkspaceAsAction.ID,
                title: { value: (0, nls_1.localize)('saveWorkspaceAsAction', "Save Workspace As..."), original: 'Save Workspace As...' },
                category: workspacesCategory,
                f1: true,
                precondition: contextkeys_1.EnterMultiRootWorkspaceSupportContext
            });
        }
        async run(accessor) {
            const workspaceEditingService = accessor.get(workspaceEditing_1.IWorkspaceEditingService);
            const contextService = accessor.get(workspace_1.IWorkspaceContextService);
            const configPathUri = await workspaceEditingService.pickNewWorkspacePath();
            if (configPathUri && (0, workspace_1.hasWorkspaceFileExtension)(configPathUri)) {
                switch (contextService.getWorkbenchState()) {
                    case 1 /* WorkbenchState.EMPTY */:
                    case 2 /* WorkbenchState.FOLDER */: {
                        const folders = contextService.getWorkspace().folders.map(folder => ({ uri: folder.uri }));
                        return workspaceEditingService.createAndEnterWorkspace(folders, configPathUri);
                    }
                    case 3 /* WorkbenchState.WORKSPACE */:
                        return workspaceEditingService.saveAndEnterWorkspace(configPathUri);
                }
            }
        }
    }
    class DuplicateWorkspaceInNewWindowAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.duplicateWorkspaceInNewWindow'; }
        constructor() {
            super({
                id: DuplicateWorkspaceInNewWindowAction.ID,
                title: { value: (0, nls_1.localize)('duplicateWorkspaceInNewWindow', "Duplicate As Workspace in New Window"), original: 'Duplicate As Workspace in New Window' },
                category: workspacesCategory,
                f1: true,
                precondition: contextkeys_1.EnterMultiRootWorkspaceSupportContext
            });
        }
        async run(accessor) {
            const workspaceContextService = accessor.get(workspace_1.IWorkspaceContextService);
            const workspaceEditingService = accessor.get(workspaceEditing_1.IWorkspaceEditingService);
            const hostService = accessor.get(host_1.IHostService);
            const workspacesService = accessor.get(workspaces_1.IWorkspacesService);
            const environmentService = accessor.get(environmentService_1.IWorkbenchEnvironmentService);
            const folders = workspaceContextService.getWorkspace().folders;
            const remoteAuthority = environmentService.remoteAuthority;
            const newWorkspace = await workspacesService.createUntitledWorkspace(folders, remoteAuthority);
            await workspaceEditingService.copyWorkspaceSettings(newWorkspace);
            return hostService.openWindow([{ workspaceUri: newWorkspace.configPath }], { forceNewWindow: true, remoteAuthority });
        }
    }
    // --- Actions Registration
    (0, actions_1.registerAction2)(AddRootFolderAction);
    (0, actions_1.registerAction2)(RemoveRootFolderAction);
    (0, actions_1.registerAction2)(OpenFileAction);
    (0, actions_1.registerAction2)(OpenFolderAction);
    (0, actions_1.registerAction2)(OpenFolderViaWorkspaceAction);
    (0, actions_1.registerAction2)(OpenFileFolderAction);
    (0, actions_1.registerAction2)(OpenWorkspaceAction);
    (0, actions_1.registerAction2)(OpenWorkspaceConfigFileAction);
    (0, actions_1.registerAction2)(CloseWorkspaceAction);
    (0, actions_1.registerAction2)(SaveWorkspaceAsAction);
    (0, actions_1.registerAction2)(DuplicateWorkspaceInNewWindowAction);
    // --- Menu Registration
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '2_open',
        command: {
            id: OpenFileAction.ID,
            title: (0, nls_1.localize)({ key: 'miOpenFile', comment: ['&& denotes a mnemonic'] }, "&&Open File...")
        },
        order: 1,
        when: contextkeys_2.IsMacNativeContext.toNegated()
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '2_open',
        command: {
            id: OpenFolderAction.ID,
            title: (0, nls_1.localize)({ key: 'miOpenFolder', comment: ['&& denotes a mnemonic'] }, "Open &&Folder...")
        },
        order: 2,
        when: contextkeys_1.OpenFolderWorkspaceSupportContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '2_open',
        command: {
            id: OpenFolderViaWorkspaceAction.ID,
            title: (0, nls_1.localize)({ key: 'miOpenFolder', comment: ['&& denotes a mnemonic'] }, "Open &&Folder...")
        },
        order: 2,
        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.OpenFolderWorkspaceSupportContext.toNegated(), contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '2_open',
        command: {
            id: OpenFileFolderAction.ID,
            title: (0, nls_1.localize)({ key: 'miOpen', comment: ['&& denotes a mnemonic'] }, "&&Open...")
        },
        order: 1,
        when: contextkey_1.ContextKeyExpr.and(contextkeys_2.IsMacNativeContext, contextkeys_1.OpenFolderWorkspaceSupportContext)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '2_open',
        command: {
            id: OpenWorkspaceAction.ID,
            title: (0, nls_1.localize)({ key: 'miOpenWorkspace', comment: ['&& denotes a mnemonic'] }, "Open Wor&&kspace from File...")
        },
        order: 3,
        when: contextkeys_1.EnterMultiRootWorkspaceSupportContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '3_workspace',
        command: {
            id: workspaceCommands_1.ADD_ROOT_FOLDER_COMMAND_ID,
            title: (0, nls_1.localize)({ key: 'miAddFolderToWorkspace', comment: ['&& denotes a mnemonic'] }, "A&&dd Folder to Workspace...")
        },
        when: contextkey_1.ContextKeyExpr.or(contextkeys_1.EnterMultiRootWorkspaceSupportContext, contextkeys_1.WorkbenchStateContext.isEqualTo('workspace')),
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '3_workspace',
        command: {
            id: SaveWorkspaceAsAction.ID,
            title: (0, nls_1.localize)('miSaveWorkspaceAs', "Save Workspace As...")
        },
        order: 2,
        when: contextkeys_1.EnterMultiRootWorkspaceSupportContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '3_workspace',
        command: {
            id: DuplicateWorkspaceInNewWindowAction.ID,
            title: (0, nls_1.localize)('duplicateWorkspace', "Duplicate Workspace")
        },
        order: 3,
        when: contextkeys_1.EnterMultiRootWorkspaceSupportContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '6_close',
        command: {
            id: CloseWorkspaceAction.ID,
            title: (0, nls_1.localize)({ key: 'miCloseFolder', comment: ['&& denotes a mnemonic'] }, "Close &&Folder")
        },
        order: 3,
        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('folder'), contextkeys_1.EmptyWorkspaceSupportContext)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '6_close',
        command: {
            id: CloseWorkspaceAction.ID,
            title: (0, nls_1.localize)({ key: 'miCloseWorkspace', comment: ['&& denotes a mnemonic'] }, "Close &&Workspace")
        },
        order: 3,
        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'), contextkeys_1.EmptyWorkspaceSupportContext)
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL2FjdGlvbnMvd29ya3NwYWNlQWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF1QmhHLE1BQU0sa0JBQWtCLEdBQXFCLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLENBQUM7SUFFckgsTUFBYSxjQUFlLFNBQVEsaUJBQU87aUJBRTFCLE9BQUUsR0FBRyxpQ0FBaUMsQ0FBQztRQUV2RDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsY0FBYyxDQUFDLEVBQUU7Z0JBQ3JCLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRTtnQkFDaEYsUUFBUSxFQUFFLG1DQUFVLENBQUMsSUFBSTtnQkFDekIsRUFBRSxFQUFFLElBQUk7Z0JBQ1IsWUFBWSxFQUFFLGdDQUFrQixDQUFDLFNBQVMsRUFBRTtnQkFDNUMsVUFBVSxFQUFFO29CQUNYLE1BQU0sNkNBQW1DO29CQUN6QyxPQUFPLEVBQUUsaURBQTZCO2lCQUN0QzthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFUSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCLEVBQUUsSUFBcUI7WUFDbkUsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDRCQUFrQixDQUFDLENBQUM7WUFFM0QsT0FBTyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDL0YsQ0FBQzs7SUF0QkYsd0NBdUJDO0lB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