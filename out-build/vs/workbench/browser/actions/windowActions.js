/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/actions/windowActions", "vs/platform/dialogs/common/dialogs", "vs/platform/actions/common/actions", "vs/base/common/keyCodes", "vs/workbench/common/contextkeys", "vs/platform/contextkey/common/contextkeys", "vs/platform/action/common/actionCommonCategories", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/quickinput/common/quickInput", "vs/platform/workspace/common/workspace", "vs/platform/label/common/label", "vs/platform/keybinding/common/keybinding", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/platform/workspaces/common/workspaces", "vs/editor/common/services/getIconClasses", "vs/platform/files/common/files", "vs/base/common/labels", "vs/base/common/platform", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/quickaccess", "vs/workbench/services/host/browser/host", "vs/base/common/map", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/browser/dom", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/backup/common/backup"], function (require, exports, nls_1, dialogs_1, actions_1, keyCodes_1, contextkeys_1, contextkeys_2, actionCommonCategories_1, keybindingsRegistry_1, quickInput_1, workspace_1, label_1, keybinding_1, model_1, language_1, workspaces_1, getIconClasses_1, files_1, labels_1, platform_1, contextkey_1, quickaccess_1, host_1, map_1, codicons_1, themables_1, dom_1, commands_1, configuration_1, backup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2tb = exports.$1tb = exports.$Ztb = void 0;
    exports.$Ztb = 'inRecentFilesPicker';
    class BaseOpenRecentAction extends actions_1.$Wu {
        constructor(desc) {
            super(desc);
            this.a = {
                iconClass: themables_1.ThemeIcon.asClassName(codicons_1.$Pj.removeClose),
                tooltip: (0, nls_1.localize)(0, null)
            };
            this.b = {
                iconClass: 'dirty-workspace ' + themables_1.ThemeIcon.asClassName(codicons_1.$Pj.closeDirty),
                tooltip: (0, nls_1.localize)(1, null),
                alwaysVisible: true
            };
            this.c = {
                ...this.b,
                tooltip: (0, nls_1.localize)(2, null),
            };
        }
        async run(accessor) {
            const workspacesService = accessor.get(workspaces_1.$fU);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const contextService = accessor.get(workspace_1.$Kh);
            const labelService = accessor.get(label_1.$Vz);
            const keybindingService = accessor.get(keybinding_1.$2D);
            const modelService = accessor.get(model_1.$yA);
            const languageService = accessor.get(language_1.$ct);
            const hostService = accessor.get(host_1.$VT);
            const dialogService = accessor.get(dialogs_1.$oA);
            const recentlyOpened = await workspacesService.getRecentlyOpened();
            const dirtyWorkspacesAndFolders = await workspacesService.getDirtyWorkspaces();
            let hasWorkspaces = false;
            // Identify all folders and workspaces with unsaved files
            const dirtyFolders = new map_1.$zi();
            const dirtyWorkspaces = new map_1.$zi();
            for (const dirtyWorkspace of dirtyWorkspacesAndFolders) {
                if ((0, backup_1.$dU)(dirtyWorkspace)) {
                    dirtyFolders.set(dirtyWorkspace.folderUri, true);
                }
                else {
                    dirtyWorkspaces.set(dirtyWorkspace.workspace.configPath, dirtyWorkspace.workspace);
                    hasWorkspaces = true;
                }
            }
            // Identify all recently opened folders and workspaces
            const recentFolders = new map_1.$zi();
            const recentWorkspaces = new map_1.$zi();
            for (const recent of recentlyOpened.workspaces) {
                if ((0, workspaces_1.$hU)(recent)) {
                    recentFolders.set(recent.folderUri, true);
                }
                else {
                    recentWorkspaces.set(recent.workspace.configPath, recent.workspace);
                    hasWorkspaces = true;
                }
            }
            // Fill in all known recently opened workspaces
            const workspacePicks = [];
            for (const recent of recentlyOpened.workspaces) {
                const isDirty = (0, workspaces_1.$hU)(recent) ? dirtyFolders.has(recent.folderUri) : dirtyWorkspaces.has(recent.workspace.configPath);
                workspacePicks.push(this.e(modelService, languageService, labelService, recent, isDirty));
            }
            // Fill any backup workspace that is not yet shown at the end
            for (const dirtyWorkspaceOrFolder of dirtyWorkspacesAndFolders) {
                if ((0, backup_1.$dU)(dirtyWorkspaceOrFolder) && !recentFolders.has(dirtyWorkspaceOrFolder.folderUri)) {
                    workspacePicks.push(this.e(modelService, languageService, labelService, dirtyWorkspaceOrFolder, true));
                }
                else if ((0, backup_1.$eU)(dirtyWorkspaceOrFolder) && !recentWorkspaces.has(dirtyWorkspaceOrFolder.workspace.configPath)) {
                    workspacePicks.push(this.e(modelService, languageService, labelService, dirtyWorkspaceOrFolder, true));
                }
            }
            const filePicks = recentlyOpened.files.map(p => this.e(modelService, languageService, labelService, p, false));
            // focus second entry if the first recent workspace is the current workspace
            const firstEntry = recentlyOpened.workspaces[0];
            const autoFocusSecondEntry = firstEntry && contextService.isCurrentWorkspace((0, workspaces_1.$gU)(firstEntry) ? firstEntry.workspace : firstEntry.folderUri);
            let keyMods;
            const workspaceSeparator = { type: 'separator', label: hasWorkspaces ? (0, nls_1.localize)(3, null) : (0, nls_1.localize)(4, null) };
            const fileSeparator = { type: 'separator', label: (0, nls_1.localize)(5, null) };
            const picks = [workspaceSeparator, ...workspacePicks, fileSeparator, ...filePicks];
            const pick = await quickInputService.pick(picks, {
                contextKey: exports.$Ztb,
                activeItem: [...workspacePicks, ...filePicks][autoFocusSecondEntry ? 1 : 0],
                placeHolder: platform_1.$j ? (0, nls_1.localize)(6, null) : (0, nls_1.localize)(7, null),
                matchOnDescription: true,
                onKeyMods: mods => keyMods = mods,
                quickNavigate: this.d() ? { keybindings: keybindingService.lookupKeybindings(this.desc.id) } : undefined,
                hideInput: this.d(),
                onDidTriggerItemButton: async (context) => {
                    // Remove
                    if (context.button === this.a) {
                        await workspacesService.removeRecentlyOpened([context.item.resource]);
                        context.removeItem();
                    }
                    // Dirty Folder/Workspace
                    else if (context.button === this.b || context.button === this.c) {
                        const isDirtyWorkspace = context.button === this.c;
                        const { confirmed } = await dialogService.confirm({
                            title: isDirtyWorkspace ? (0, nls_1.localize)(8, null) : (0, nls_1.localize)(9, null),
                            message: isDirtyWorkspace ? (0, nls_1.localize)(10, null) : (0, nls_1.localize)(11, null),
                            detail: isDirtyWorkspace ? (0, nls_1.localize)(12, null) : (0, nls_1.localize)(13, null)
                        });
                        if (confirmed) {
                            hostService.openWindow([context.item.openable], {
                                remoteAuthority: context.item.remoteAuthority || null // local window if remoteAuthority is not set or can not be deducted from the openable
                            });
                            quickInputService.cancel();
                        }
                    }
                }
            });
            if (pick) {
                return hostService.openWindow([pick.openable], {
                    forceNewWindow: keyMods?.ctrlCmd,
                    forceReuseWindow: keyMods?.alt,
                    remoteAuthority: pick.remoteAuthority || null // local window if remoteAuthority is not set or can not be deducted from the openable
                });
            }
        }
        e(modelService, languageService, labelService, recent, isDirty) {
            let openable;
            let iconClasses;
            let fullLabel;
            let resource;
            let isWorkspace = false;
            // Folder
            if ((0, workspaces_1.$hU)(recent)) {
                resource = recent.folderUri;
                iconClasses = (0, getIconClasses_1.$x6)(modelService, languageService, resource, files_1.FileKind.FOLDER);
                openable = { folderUri: resource };
                fullLabel = recent.label || labelService.getWorkspaceLabel(resource, { verbose: 2 /* Verbosity.LONG */ });
            }
            // Workspace
            else if ((0, workspaces_1.$gU)(recent)) {
                resource = recent.workspace.configPath;
                iconClasses = (0, getIconClasses_1.$x6)(modelService, languageService, resource, files_1.FileKind.ROOT_FOLDER);
                openable = { workspaceUri: resource };
                fullLabel = recent.label || labelService.getWorkspaceLabel(recent.workspace, { verbose: 2 /* Verbosity.LONG */ });
                isWorkspace = true;
            }
            // File
            else {
                resource = recent.fileUri;
                iconClasses = (0, getIconClasses_1.$x6)(modelService, languageService, resource, files_1.FileKind.FILE);
                openable = { fileUri: resource };
                fullLabel = recent.label || labelService.getUriLabel(resource);
            }
            const { name, parentPath } = (0, labels_1.$nA)(fullLabel);
            return {
                iconClasses,
                label: name,
                ariaLabel: isDirty ? isWorkspace ? (0, nls_1.localize)(14, null, name) : (0, nls_1.localize)(15, null, name) : name,
                description: parentPath,
                buttons: isDirty ? [isWorkspace ? this.c : this.b] : [this.a],
                openable,
                resource,
                remoteAuthority: recent.remoteAuthority
            };
        }
    }
    class $1tb extends BaseOpenRecentAction {
        static { this.ID = 'workbench.action.openRecent'; }
        constructor() {
            super({
                id: $1tb.ID,
                title: {
                    value: (0, nls_1.localize)(16, null),
                    mnemonicTitle: (0, nls_1.localize)(17, null),
                    original: 'Open Recent...'
                },
                category: actionCommonCategories_1.$Nl.File,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 48 /* KeyCode.KeyR */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 48 /* KeyCode.KeyR */ }
                },
                menu: {
                    id: actions_1.$Ru.MenubarRecentMenu,
                    group: 'y_more',
                    order: 1
                }
            });
        }
        d() {
            return false;
        }
    }
    exports.$1tb = $1tb;
    class QuickPickRecentAction extends BaseOpenRecentAction {
        constructor() {
            super({
                id: 'workbench.action.quickOpenRecent',
                title: { value: (0, nls_1.localize)(18, null), original: 'Quick Open Recent...' },
                category: actionCommonCategories_1.$Nl.File,
                f1: false // hide quick pickers from command palette to not confuse with the other entry that shows a input field
            });
        }
        d() {
            return true;
        }
    }
    class ToggleFullScreenAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.toggleFullScreen',
                title: {
                    value: (0, nls_1.localize)(19, null),
                    mnemonicTitle: (0, nls_1.localize)(20, null),
                    original: 'Toggle Full Screen'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 69 /* KeyCode.F11 */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 36 /* KeyCode.KeyF */
                    }
                },
                precondition: contextkeys_2.$43.toNegated(),
                toggled: contextkeys_1.$Ycb,
                menu: [{
                        id: actions_1.$Ru.MenubarAppearanceMenu,
                        group: '1_toggle_view',
                        order: 1
                    }]
            });
        }
        run(accessor) {
            const hostService = accessor.get(host_1.$VT);
            return hostService.toggleFullScreen();
        }
    }
    class $2tb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.reloadWindow'; }
        constructor() {
            super({
                id: $2tb.ID,
                title: { value: (0, nls_1.localize)(21, null), original: 'Reload Window' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
                    when: contextkeys_2.$63,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 48 /* KeyCode.KeyR */
                }
            });
        }
        run(accessor) {
            const hostService = accessor.get(host_1.$VT);
            return hostService.reload();
        }
    }
    exports.$2tb = $2tb;
    class ShowAboutDialogAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.showAboutDialog',
                title: {
                    value: (0, nls_1.localize)(22, null),
                    mnemonicTitle: (0, nls_1.localize)(23, null),
                    original: 'About'
                },
                category: actionCommonCategories_1.$Nl.Help,
                f1: true,
                menu: {
                    id: actions_1.$Ru.MenubarHelpMenu,
                    group: 'z_about',
                    order: 1,
                    when: contextkeys_2.$33.toNegated()
                }
            });
        }
        run(accessor) {
            const dialogService = accessor.get(dialogs_1.$oA);
            return dialogService.about();
        }
    }
    class NewWindowAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.newWindow',
                title: {
                    value: (0, nls_1.localize)(24, null),
                    mnemonicTitle: (0, nls_1.localize)(25, null),
                    original: 'New Window'
                },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: platform_1.$o ? (platform_1.$i ? (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 1024 /* KeyMod.Shift */ | 44 /* KeyCode.KeyN */) : 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 44 /* KeyCode.KeyN */) : 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 44 /* KeyCode.KeyN */,
                    secondary: platform_1.$o ? [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 44 /* KeyCode.KeyN */] : undefined
                },
                menu: {
                    id: actions_1.$Ru.MenubarFileMenu,
                    group: '1_new',
                    order: 3
                }
            });
        }
        run(accessor) {
            const hostService = accessor.get(host_1.$VT);
            return hostService.openWindow({ remoteAuthority: null });
        }
    }
    class BlurAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.blur',
                title: { value: (0, nls_1.localize)(26, null), original: 'Remove keyboard focus from focused element' }
            });
        }
        run() {
            const el = document.activeElement;
            if ((0, dom_1.$2O)(el)) {
                el.blur();
            }
        }
    }
    // --- Actions Registration
    (0, actions_1.$Xu)(NewWindowAction);
    (0, actions_1.$Xu)(ToggleFullScreenAction);
    (0, actions_1.$Xu)(QuickPickRecentAction);
    (0, actions_1.$Xu)($1tb);
    (0, actions_1.$Xu)($2tb);
    (0, actions_1.$Xu)(ShowAboutDialogAction);
    (0, actions_1.$Xu)(BlurAction);
    // --- Commands/Keybindings Registration
    const recentFilesPickerContext = contextkey_1.$Ii.and(quickaccess_1.$Vtb, contextkey_1.$Ii.has(exports.$Ztb));
    const quickPickNavigateNextInRecentFilesPickerId = 'workbench.action.quickOpenNavigateNextInRecentFilesPicker';
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: quickPickNavigateNextInRecentFilesPickerId,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.$Ytb)(quickPickNavigateNextInRecentFilesPickerId, true),
        when: recentFilesPickerContext,
        primary: 2048 /* KeyMod.CtrlCmd */ | 48 /* KeyCode.KeyR */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 48 /* KeyCode.KeyR */ }
    });
    const quickPickNavigatePreviousInRecentFilesPicker = 'workbench.action.quickOpenNavigatePreviousInRecentFilesPicker';
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: quickPickNavigatePreviousInRecentFilesPicker,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.$Ytb)(quickPickNavigatePreviousInRecentFilesPicker, false),
        when: recentFilesPickerContext,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 48 /* KeyCode.KeyR */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 48 /* KeyCode.KeyR */ }
    });
    commands_1.$Gr.registerCommand('workbench.action.toggleConfirmBeforeClose', accessor => {
        const configurationService = accessor.get(configuration_1.$8h);
        const setting = configurationService.inspect('window.confirmBeforeClose').userValue;
        return configurationService.updateValue('window.confirmBeforeClose', setting === 'never' ? 'keyboardOnly' : 'never');
    });
    // --- Menu Registration
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        group: 'z_ConfirmClose',
        command: {
            id: 'workbench.action.toggleConfirmBeforeClose',
            title: (0, nls_1.localize)(27, null),
            toggled: contextkey_1.$Ii.notEquals('config.window.confirmBeforeClose', 'never')
        },
        order: 1,
        when: contextkeys_2.$23
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
        title: (0, nls_1.localize)(28, null),
        submenu: actions_1.$Ru.MenubarRecentMenu,
        group: '2_open',
        order: 4
    });
});
//# sourceMappingURL=windowActions.js.map