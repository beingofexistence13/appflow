/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/actions/workspaceActions", "vs/platform/workspace/common/workspace", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/workbench/services/editor/common/editorService", "vs/platform/commands/common/commands", "vs/workbench/browser/actions/workspaceCommands", "vs/platform/dialogs/common/dialogs", "vs/platform/actions/common/actions", "vs/workbench/common/contextkeys", "vs/workbench/services/host/browser/host", "vs/base/common/keyCodes", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/environment/common/environmentService", "vs/platform/workspaces/common/workspaces", "vs/platform/contextkey/common/contextkeys", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls_1, workspace_1, workspaceEditing_1, editorService_1, commands_1, workspaceCommands_1, dialogs_1, actions_1, contextkeys_1, host_1, keyCodes_1, contextkey_1, environmentService_1, workspaces_1, contextkeys_2, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8tb = exports.$7tb = exports.$6tb = exports.$5tb = exports.$4tb = exports.$3tb = void 0;
    const workspacesCategory = { value: (0, nls_1.localize)(0, null), original: 'Workspaces' };
    class $3tb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.files.openFile'; }
        constructor() {
            super({
                id: $3tb.ID,
                title: { value: (0, nls_1.localize)(1, null), original: 'Open File...' },
                category: actionCommonCategories_1.$Nl.File,
                f1: true,
                precondition: contextkeys_2.$33.toNegated(),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */
                }
            });
        }
        async run(accessor, data) {
            const fileDialogService = accessor.get(dialogs_1.$qA);
            return fileDialogService.pickFileAndOpen({ forceNewWindow: false, telemetryExtraData: data });
        }
    }
    exports.$3tb = $3tb;
    class $4tb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.files.openFolder'; }
        constructor() {
            super({
                id: $4tb.ID,
                title: { value: (0, nls_1.localize)(2, null), original: 'Open Folder...' },
                category: actionCommonCategories_1.$Nl.File,
                f1: true,
                precondition: contextkeys_1.$Rcb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: undefined,
                    linux: {
                        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */)
                    },
                    win: {
                        primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */)
                    }
                }
            });
        }
        async run(accessor, data) {
            const fileDialogService = accessor.get(dialogs_1.$qA);
            return fileDialogService.pickFolderAndOpen({ forceNewWindow: false, telemetryExtraData: data });
        }
    }
    exports.$4tb = $4tb;
    class $5tb extends actions_1.$Wu {
        // This action swaps the folders of a workspace with
        // the selected folder and is a workaround for providing
        // "Open Folder..." in environments that do not support
        // this without having a workspace open (e.g. web serverless)
        static { this.ID = 'workbench.action.files.openFolderViaWorkspace'; }
        constructor() {
            super({
                id: $5tb.ID,
                title: { value: (0, nls_1.localize)(3, null), original: 'Open Folder...' },
                category: actionCommonCategories_1.$Nl.File,
                f1: true,
                precondition: contextkey_1.$Ii.and(contextkeys_1.$Rcb.toNegated(), contextkeys_1.$Pcb.isEqualTo('workspace')),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */
                }
            });
        }
        run(accessor) {
            const commandService = accessor.get(commands_1.$Fr);
            return commandService.executeCommand(workspaceCommands_1.$cgb);
        }
    }
    exports.$5tb = $5tb;
    class $6tb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.files.openFileFolder'; }
        static { this.LABEL = { value: (0, nls_1.localize)(4, null), original: 'Open...' }; }
        constructor() {
            super({
                id: $6tb.ID,
                title: $6tb.LABEL,
                category: actionCommonCategories_1.$Nl.File,
                f1: true,
                precondition: contextkey_1.$Ii.and(contextkeys_2.$33, contextkeys_1.$Rcb),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */
                }
            });
        }
        async run(accessor, data) {
            const fileDialogService = accessor.get(dialogs_1.$qA);
            return fileDialogService.pickFileFolderAndOpen({ forceNewWindow: false, telemetryExtraData: data });
        }
    }
    exports.$6tb = $6tb;
    class OpenWorkspaceAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.openWorkspace'; }
        constructor() {
            super({
                id: OpenWorkspaceAction.ID,
                title: { value: (0, nls_1.localize)(5, null), original: 'Open Workspace from File...' },
                category: actionCommonCategories_1.$Nl.File,
                f1: true,
                precondition: contextkeys_1.$Scb
            });
        }
        async run(accessor, data) {
            const fileDialogService = accessor.get(dialogs_1.$qA);
            return fileDialogService.pickWorkspaceAndOpen({ telemetryExtraData: data });
        }
    }
    class CloseWorkspaceAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.closeFolder'; }
        constructor() {
            super({
                id: CloseWorkspaceAction.ID,
                title: { value: (0, nls_1.localize)(6, null), original: 'Close Workspace' },
                category: workspacesCategory,
                f1: true,
                precondition: contextkey_1.$Ii.and(contextkeys_1.$Pcb.notEqualsTo('empty'), contextkeys_1.$Tcb),
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 36 /* KeyCode.KeyF */)
                }
            });
        }
        async run(accessor) {
            const hostService = accessor.get(host_1.$VT);
            const environmentService = accessor.get(environmentService_1.$hJ);
            return hostService.openWindow({ forceReuseWindow: true, remoteAuthority: environmentService.remoteAuthority });
        }
    }
    class OpenWorkspaceConfigFileAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.openWorkspaceConfigFile'; }
        constructor() {
            super({
                id: OpenWorkspaceConfigFileAction.ID,
                title: { value: (0, nls_1.localize)(7, null), original: 'Open Workspace Configuration File' },
                category: workspacesCategory,
                f1: true,
                precondition: contextkeys_1.$Pcb.isEqualTo('workspace')
            });
        }
        async run(accessor) {
            const contextService = accessor.get(workspace_1.$Kh);
            const editorService = accessor.get(editorService_1.$9C);
            const configuration = contextService.getWorkspace().configuration;
            if (configuration) {
                await editorService.openEditor({ resource: configuration, options: { pinned: true } });
            }
        }
    }
    class $7tb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.addRootFolder'; }
        constructor() {
            super({
                id: $7tb.ID,
                title: workspaceCommands_1.$bgb,
                category: workspacesCategory,
                f1: true,
                precondition: contextkey_1.$Ii.or(contextkeys_1.$Scb, contextkeys_1.$Pcb.isEqualTo('workspace'))
            });
        }
        run(accessor) {
            const commandService = accessor.get(commands_1.$Fr);
            return commandService.executeCommand(workspaceCommands_1.$agb);
        }
    }
    exports.$7tb = $7tb;
    class $8tb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.removeRootFolder'; }
        constructor() {
            super({
                id: $8tb.ID,
                title: { value: (0, nls_1.localize)(8, null), original: 'Remove Folder from Workspace...' },
                category: workspacesCategory,
                f1: true,
                precondition: contextkey_1.$Ii.and(contextkeys_1.$Qcb.notEqualsTo('0'), contextkey_1.$Ii.or(contextkeys_1.$Scb, contextkeys_1.$Pcb.isEqualTo('workspace')))
            });
        }
        async run(accessor) {
            const commandService = accessor.get(commands_1.$Fr);
            const workspaceEditingService = accessor.get(workspaceEditing_1.$pU);
            const folder = await commandService.executeCommand(workspaceCommands_1.$dgb);
            if (folder) {
                await workspaceEditingService.removeFolders([folder.uri]);
            }
        }
    }
    exports.$8tb = $8tb;
    class SaveWorkspaceAsAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.saveWorkspaceAs'; }
        constructor() {
            super({
                id: SaveWorkspaceAsAction.ID,
                title: { value: (0, nls_1.localize)(9, null), original: 'Save Workspace As...' },
                category: workspacesCategory,
                f1: true,
                precondition: contextkeys_1.$Scb
            });
        }
        async run(accessor) {
            const workspaceEditingService = accessor.get(workspaceEditing_1.$pU);
            const contextService = accessor.get(workspace_1.$Kh);
            const configPathUri = await workspaceEditingService.pickNewWorkspacePath();
            if (configPathUri && (0, workspace_1.$7h)(configPathUri)) {
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
    class DuplicateWorkspaceInNewWindowAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.duplicateWorkspaceInNewWindow'; }
        constructor() {
            super({
                id: DuplicateWorkspaceInNewWindowAction.ID,
                title: { value: (0, nls_1.localize)(10, null), original: 'Duplicate As Workspace in New Window' },
                category: workspacesCategory,
                f1: true,
                precondition: contextkeys_1.$Scb
            });
        }
        async run(accessor) {
            const workspaceContextService = accessor.get(workspace_1.$Kh);
            const workspaceEditingService = accessor.get(workspaceEditing_1.$pU);
            const hostService = accessor.get(host_1.$VT);
            const workspacesService = accessor.get(workspaces_1.$fU);
            const environmentService = accessor.get(environmentService_1.$hJ);
            const folders = workspaceContextService.getWorkspace().folders;
            const remoteAuthority = environmentService.remoteAuthority;
            const newWorkspace = await workspacesService.createUntitledWorkspace(folders, remoteAuthority);
            await workspaceEditingService.copyWorkspaceSettings(newWorkspace);
            return hostService.openWindow([{ workspaceUri: newWorkspace.configPath }], { forceNewWindow: true, remoteAuthority });
        }
    }
    // --- Actions Registration
    (0, actions_1.$Xu)($7tb);
    (0, actions_1.$Xu)($8tb);
    (0, actions_1.$Xu)($3tb);
    (0, actions_1.$Xu)($4tb);
    (0, actions_1.$Xu)($5tb);
    (0, actions_1.$Xu)($6tb);
    (0, actions_1.$Xu)(OpenWorkspaceAction);
    (0, actions_1.$Xu)(OpenWorkspaceConfigFileAction);
    (0, actions_1.$Xu)(CloseWorkspaceAction);
    (0, actions_1.$Xu)(SaveWorkspaceAsAction);
    (0, actions_1.$Xu)(DuplicateWorkspaceInNewWindowAction);
    // --- Menu Registration
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        group: '2_open',
        command: {
            id: $3tb.ID,
            title: (0, nls_1.localize)(11, null)
        },
        order: 1,
        when: contextkeys_2.$33.toNegated()
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        group: '2_open',
        command: {
            id: $4tb.ID,
            title: (0, nls_1.localize)(12, null)
        },
        order: 2,
        when: contextkeys_1.$Rcb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        group: '2_open',
        command: {
            id: $5tb.ID,
            title: (0, nls_1.localize)(13, null)
        },
        order: 2,
        when: contextkey_1.$Ii.and(contextkeys_1.$Rcb.toNegated(), contextkeys_1.$Pcb.isEqualTo('workspace'))
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        group: '2_open',
        command: {
            id: $6tb.ID,
            title: (0, nls_1.localize)(14, null)
        },
        order: 1,
        when: contextkey_1.$Ii.and(contextkeys_2.$33, contextkeys_1.$Rcb)
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        group: '2_open',
        command: {
            id: OpenWorkspaceAction.ID,
            title: (0, nls_1.localize)(15, null)
        },
        order: 3,
        when: contextkeys_1.$Scb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        group: '3_workspace',
        command: {
            id: workspaceCommands_1.$agb,
            title: (0, nls_1.localize)(16, null)
        },
        when: contextkey_1.$Ii.or(contextkeys_1.$Scb, contextkeys_1.$Pcb.isEqualTo('workspace')),
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        group: '3_workspace',
        command: {
            id: SaveWorkspaceAsAction.ID,
            title: (0, nls_1.localize)(17, null)
        },
        order: 2,
        when: contextkeys_1.$Scb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        group: '3_workspace',
        command: {
            id: DuplicateWorkspaceInNewWindowAction.ID,
            title: (0, nls_1.localize)(18, null)
        },
        order: 3,
        when: contextkeys_1.$Scb
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        group: '6_close',
        command: {
            id: CloseWorkspaceAction.ID,
            title: (0, nls_1.localize)(19, null)
        },
        order: 3,
        when: contextkey_1.$Ii.and(contextkeys_1.$Pcb.isEqualTo('folder'), contextkeys_1.$Tcb)
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        group: '6_close',
        command: {
            id: CloseWorkspaceAction.ID,
            title: (0, nls_1.localize)(20, null)
        },
        order: 3,
        when: contextkey_1.$Ii.and(contextkeys_1.$Pcb.isEqualTo('workspace'), contextkeys_1.$Tcb)
    });
});
//# sourceMappingURL=workspaceActions.js.map