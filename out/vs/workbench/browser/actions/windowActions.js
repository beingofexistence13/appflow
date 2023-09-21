/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/dialogs/common/dialogs", "vs/platform/actions/common/actions", "vs/base/common/keyCodes", "vs/workbench/common/contextkeys", "vs/platform/contextkey/common/contextkeys", "vs/platform/action/common/actionCommonCategories", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/quickinput/common/quickInput", "vs/platform/workspace/common/workspace", "vs/platform/label/common/label", "vs/platform/keybinding/common/keybinding", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/platform/workspaces/common/workspaces", "vs/editor/common/services/getIconClasses", "vs/platform/files/common/files", "vs/base/common/labels", "vs/base/common/platform", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/quickaccess", "vs/workbench/services/host/browser/host", "vs/base/common/map", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/browser/dom", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/backup/common/backup"], function (require, exports, nls_1, dialogs_1, actions_1, keyCodes_1, contextkeys_1, contextkeys_2, actionCommonCategories_1, keybindingsRegistry_1, quickInput_1, workspace_1, label_1, keybinding_1, model_1, language_1, workspaces_1, getIconClasses_1, files_1, labels_1, platform_1, contextkey_1, quickaccess_1, host_1, map_1, codicons_1, themables_1, dom_1, commands_1, configuration_1, backup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReloadWindowAction = exports.OpenRecentAction = exports.inRecentFilesPickerContextKey = void 0;
    exports.inRecentFilesPickerContextKey = 'inRecentFilesPicker';
    class BaseOpenRecentAction extends actions_1.Action2 {
        constructor(desc) {
            super(desc);
            this.removeFromRecentlyOpened = {
                iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.removeClose),
                tooltip: (0, nls_1.localize)('remove', "Remove from Recently Opened")
            };
            this.dirtyRecentlyOpenedFolder = {
                iconClass: 'dirty-workspace ' + themables_1.ThemeIcon.asClassName(codicons_1.Codicon.closeDirty),
                tooltip: (0, nls_1.localize)('dirtyRecentlyOpenedFolder', "Folder With Unsaved Files"),
                alwaysVisible: true
            };
            this.dirtyRecentlyOpenedWorkspace = {
                ...this.dirtyRecentlyOpenedFolder,
                tooltip: (0, nls_1.localize)('dirtyRecentlyOpenedWorkspace', "Workspace With Unsaved Files"),
            };
        }
        async run(accessor) {
            const workspacesService = accessor.get(workspaces_1.IWorkspacesService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const contextService = accessor.get(workspace_1.IWorkspaceContextService);
            const labelService = accessor.get(label_1.ILabelService);
            const keybindingService = accessor.get(keybinding_1.IKeybindingService);
            const modelService = accessor.get(model_1.IModelService);
            const languageService = accessor.get(language_1.ILanguageService);
            const hostService = accessor.get(host_1.IHostService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const recentlyOpened = await workspacesService.getRecentlyOpened();
            const dirtyWorkspacesAndFolders = await workspacesService.getDirtyWorkspaces();
            let hasWorkspaces = false;
            // Identify all folders and workspaces with unsaved files
            const dirtyFolders = new map_1.ResourceMap();
            const dirtyWorkspaces = new map_1.ResourceMap();
            for (const dirtyWorkspace of dirtyWorkspacesAndFolders) {
                if ((0, backup_1.isFolderBackupInfo)(dirtyWorkspace)) {
                    dirtyFolders.set(dirtyWorkspace.folderUri, true);
                }
                else {
                    dirtyWorkspaces.set(dirtyWorkspace.workspace.configPath, dirtyWorkspace.workspace);
                    hasWorkspaces = true;
                }
            }
            // Identify all recently opened folders and workspaces
            const recentFolders = new map_1.ResourceMap();
            const recentWorkspaces = new map_1.ResourceMap();
            for (const recent of recentlyOpened.workspaces) {
                if ((0, workspaces_1.isRecentFolder)(recent)) {
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
                const isDirty = (0, workspaces_1.isRecentFolder)(recent) ? dirtyFolders.has(recent.folderUri) : dirtyWorkspaces.has(recent.workspace.configPath);
                workspacePicks.push(this.toQuickPick(modelService, languageService, labelService, recent, isDirty));
            }
            // Fill any backup workspace that is not yet shown at the end
            for (const dirtyWorkspaceOrFolder of dirtyWorkspacesAndFolders) {
                if ((0, backup_1.isFolderBackupInfo)(dirtyWorkspaceOrFolder) && !recentFolders.has(dirtyWorkspaceOrFolder.folderUri)) {
                    workspacePicks.push(this.toQuickPick(modelService, languageService, labelService, dirtyWorkspaceOrFolder, true));
                }
                else if ((0, backup_1.isWorkspaceBackupInfo)(dirtyWorkspaceOrFolder) && !recentWorkspaces.has(dirtyWorkspaceOrFolder.workspace.configPath)) {
                    workspacePicks.push(this.toQuickPick(modelService, languageService, labelService, dirtyWorkspaceOrFolder, true));
                }
            }
            const filePicks = recentlyOpened.files.map(p => this.toQuickPick(modelService, languageService, labelService, p, false));
            // focus second entry if the first recent workspace is the current workspace
            const firstEntry = recentlyOpened.workspaces[0];
            const autoFocusSecondEntry = firstEntry && contextService.isCurrentWorkspace((0, workspaces_1.isRecentWorkspace)(firstEntry) ? firstEntry.workspace : firstEntry.folderUri);
            let keyMods;
            const workspaceSeparator = { type: 'separator', label: hasWorkspaces ? (0, nls_1.localize)('workspacesAndFolders', "folders & workspaces") : (0, nls_1.localize)('folders', "folders") };
            const fileSeparator = { type: 'separator', label: (0, nls_1.localize)('files', "files") };
            const picks = [workspaceSeparator, ...workspacePicks, fileSeparator, ...filePicks];
            const pick = await quickInputService.pick(picks, {
                contextKey: exports.inRecentFilesPickerContextKey,
                activeItem: [...workspacePicks, ...filePicks][autoFocusSecondEntry ? 1 : 0],
                placeHolder: platform_1.isMacintosh ? (0, nls_1.localize)('openRecentPlaceholderMac', "Select to open (hold Cmd-key to force new window or Option-key for same window)") : (0, nls_1.localize)('openRecentPlaceholder', "Select to open (hold Ctrl-key to force new window or Alt-key for same window)"),
                matchOnDescription: true,
                onKeyMods: mods => keyMods = mods,
                quickNavigate: this.isQuickNavigate() ? { keybindings: keybindingService.lookupKeybindings(this.desc.id) } : undefined,
                hideInput: this.isQuickNavigate(),
                onDidTriggerItemButton: async (context) => {
                    // Remove
                    if (context.button === this.removeFromRecentlyOpened) {
                        await workspacesService.removeRecentlyOpened([context.item.resource]);
                        context.removeItem();
                    }
                    // Dirty Folder/Workspace
                    else if (context.button === this.dirtyRecentlyOpenedFolder || context.button === this.dirtyRecentlyOpenedWorkspace) {
                        const isDirtyWorkspace = context.button === this.dirtyRecentlyOpenedWorkspace;
                        const { confirmed } = await dialogService.confirm({
                            title: isDirtyWorkspace ? (0, nls_1.localize)('dirtyWorkspace', "Workspace with Unsaved Files") : (0, nls_1.localize)('dirtyFolder', "Folder with Unsaved Files"),
                            message: isDirtyWorkspace ? (0, nls_1.localize)('dirtyWorkspaceConfirm', "Do you want to open the workspace to review the unsaved files?") : (0, nls_1.localize)('dirtyFolderConfirm', "Do you want to open the folder to review the unsaved files?"),
                            detail: isDirtyWorkspace ? (0, nls_1.localize)('dirtyWorkspaceConfirmDetail', "Workspaces with unsaved files cannot be removed until all unsaved files have been saved or reverted.") : (0, nls_1.localize)('dirtyFolderConfirmDetail', "Folders with unsaved files cannot be removed until all unsaved files have been saved or reverted.")
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
        toQuickPick(modelService, languageService, labelService, recent, isDirty) {
            let openable;
            let iconClasses;
            let fullLabel;
            let resource;
            let isWorkspace = false;
            // Folder
            if ((0, workspaces_1.isRecentFolder)(recent)) {
                resource = recent.folderUri;
                iconClasses = (0, getIconClasses_1.getIconClasses)(modelService, languageService, resource, files_1.FileKind.FOLDER);
                openable = { folderUri: resource };
                fullLabel = recent.label || labelService.getWorkspaceLabel(resource, { verbose: 2 /* Verbosity.LONG */ });
            }
            // Workspace
            else if ((0, workspaces_1.isRecentWorkspace)(recent)) {
                resource = recent.workspace.configPath;
                iconClasses = (0, getIconClasses_1.getIconClasses)(modelService, languageService, resource, files_1.FileKind.ROOT_FOLDER);
                openable = { workspaceUri: resource };
                fullLabel = recent.label || labelService.getWorkspaceLabel(recent.workspace, { verbose: 2 /* Verbosity.LONG */ });
                isWorkspace = true;
            }
            // File
            else {
                resource = recent.fileUri;
                iconClasses = (0, getIconClasses_1.getIconClasses)(modelService, languageService, resource, files_1.FileKind.FILE);
                openable = { fileUri: resource };
                fullLabel = recent.label || labelService.getUriLabel(resource);
            }
            const { name, parentPath } = (0, labels_1.splitRecentLabel)(fullLabel);
            return {
                iconClasses,
                label: name,
                ariaLabel: isDirty ? isWorkspace ? (0, nls_1.localize)('recentDirtyWorkspaceAriaLabel', "{0}, workspace with unsaved changes", name) : (0, nls_1.localize)('recentDirtyFolderAriaLabel', "{0}, folder with unsaved changes", name) : name,
                description: parentPath,
                buttons: isDirty ? [isWorkspace ? this.dirtyRecentlyOpenedWorkspace : this.dirtyRecentlyOpenedFolder] : [this.removeFromRecentlyOpened],
                openable,
                resource,
                remoteAuthority: recent.remoteAuthority
            };
        }
    }
    class OpenRecentAction extends BaseOpenRecentAction {
        static { this.ID = 'workbench.action.openRecent'; }
        constructor() {
            super({
                id: OpenRecentAction.ID,
                title: {
                    value: (0, nls_1.localize)('openRecent', "Open Recent..."),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miMore', comment: ['&& denotes a mnemonic'] }, "&&More..."),
                    original: 'Open Recent...'
                },
                category: actionCommonCategories_1.Categories.File,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 48 /* KeyCode.KeyR */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 48 /* KeyCode.KeyR */ }
                },
                menu: {
                    id: actions_1.MenuId.MenubarRecentMenu,
                    group: 'y_more',
                    order: 1
                }
            });
        }
        isQuickNavigate() {
            return false;
        }
    }
    exports.OpenRecentAction = OpenRecentAction;
    class QuickPickRecentAction extends BaseOpenRecentAction {
        constructor() {
            super({
                id: 'workbench.action.quickOpenRecent',
                title: { value: (0, nls_1.localize)('quickOpenRecent', "Quick Open Recent..."), original: 'Quick Open Recent...' },
                category: actionCommonCategories_1.Categories.File,
                f1: false // hide quick pickers from command palette to not confuse with the other entry that shows a input field
            });
        }
        isQuickNavigate() {
            return true;
        }
    }
    class ToggleFullScreenAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.toggleFullScreen',
                title: {
                    value: (0, nls_1.localize)('toggleFullScreen', "Toggle Full Screen"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miToggleFullScreen', comment: ['&& denotes a mnemonic'] }, "&&Full Screen"),
                    original: 'Toggle Full Screen'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 69 /* KeyCode.F11 */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 36 /* KeyCode.KeyF */
                    }
                },
                precondition: contextkeys_2.IsIOSContext.toNegated(),
                toggled: contextkeys_1.IsFullscreenContext,
                menu: [{
                        id: actions_1.MenuId.MenubarAppearanceMenu,
                        group: '1_toggle_view',
                        order: 1
                    }]
            });
        }
        run(accessor) {
            const hostService = accessor.get(host_1.IHostService);
            return hostService.toggleFullScreen();
        }
    }
    class ReloadWindowAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.reloadWindow'; }
        constructor() {
            super({
                id: ReloadWindowAction.ID,
                title: { value: (0, nls_1.localize)('reloadWindow', "Reload Window"), original: 'Reload Window' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
                    when: contextkeys_2.IsDevelopmentContext,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 48 /* KeyCode.KeyR */
                }
            });
        }
        run(accessor) {
            const hostService = accessor.get(host_1.IHostService);
            return hostService.reload();
        }
    }
    exports.ReloadWindowAction = ReloadWindowAction;
    class ShowAboutDialogAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.showAboutDialog',
                title: {
                    value: (0, nls_1.localize)('about', "About"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miAbout', comment: ['&& denotes a mnemonic'] }, "&&About"),
                    original: 'About'
                },
                category: actionCommonCategories_1.Categories.Help,
                f1: true,
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: 'z_about',
                    order: 1,
                    when: contextkeys_2.IsMacNativeContext.toNegated()
                }
            });
        }
        run(accessor) {
            const dialogService = accessor.get(dialogs_1.IDialogService);
            return dialogService.about();
        }
    }
    class NewWindowAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.newWindow',
                title: {
                    value: (0, nls_1.localize)('newWindow', "New Window"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miNewWindow', comment: ['&& denotes a mnemonic'] }, "New &&Window"),
                    original: 'New Window'
                },
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: platform_1.isWeb ? (platform_1.isWindows ? (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 1024 /* KeyMod.Shift */ | 44 /* KeyCode.KeyN */) : 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 44 /* KeyCode.KeyN */) : 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 44 /* KeyCode.KeyN */,
                    secondary: platform_1.isWeb ? [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 44 /* KeyCode.KeyN */] : undefined
                },
                menu: {
                    id: actions_1.MenuId.MenubarFileMenu,
                    group: '1_new',
                    order: 3
                }
            });
        }
        run(accessor) {
            const hostService = accessor.get(host_1.IHostService);
            return hostService.openWindow({ remoteAuthority: null });
        }
    }
    class BlurAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.blur',
                title: { value: (0, nls_1.localize)('blur', "Remove keyboard focus from focused element"), original: 'Remove keyboard focus from focused element' }
            });
        }
        run() {
            const el = document.activeElement;
            if ((0, dom_1.isHTMLElement)(el)) {
                el.blur();
            }
        }
    }
    // --- Actions Registration
    (0, actions_1.registerAction2)(NewWindowAction);
    (0, actions_1.registerAction2)(ToggleFullScreenAction);
    (0, actions_1.registerAction2)(QuickPickRecentAction);
    (0, actions_1.registerAction2)(OpenRecentAction);
    (0, actions_1.registerAction2)(ReloadWindowAction);
    (0, actions_1.registerAction2)(ShowAboutDialogAction);
    (0, actions_1.registerAction2)(BlurAction);
    // --- Commands/Keybindings Registration
    const recentFilesPickerContext = contextkey_1.ContextKeyExpr.and(quickaccess_1.inQuickPickContext, contextkey_1.ContextKeyExpr.has(exports.inRecentFilesPickerContextKey));
    const quickPickNavigateNextInRecentFilesPickerId = 'workbench.action.quickOpenNavigateNextInRecentFilesPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickPickNavigateNextInRecentFilesPickerId,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.getQuickNavigateHandler)(quickPickNavigateNextInRecentFilesPickerId, true),
        when: recentFilesPickerContext,
        primary: 2048 /* KeyMod.CtrlCmd */ | 48 /* KeyCode.KeyR */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 48 /* KeyCode.KeyR */ }
    });
    const quickPickNavigatePreviousInRecentFilesPicker = 'workbench.action.quickOpenNavigatePreviousInRecentFilesPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickPickNavigatePreviousInRecentFilesPicker,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.getQuickNavigateHandler)(quickPickNavigatePreviousInRecentFilesPicker, false),
        when: recentFilesPickerContext,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 48 /* KeyCode.KeyR */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 48 /* KeyCode.KeyR */ }
    });
    commands_1.CommandsRegistry.registerCommand('workbench.action.toggleConfirmBeforeClose', accessor => {
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const setting = configurationService.inspect('window.confirmBeforeClose').userValue;
        return configurationService.updateValue('window.confirmBeforeClose', setting === 'never' ? 'keyboardOnly' : 'never');
    });
    // --- Menu Registration
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: 'z_ConfirmClose',
        command: {
            id: 'workbench.action.toggleConfirmBeforeClose',
            title: (0, nls_1.localize)('miConfirmClose', "Confirm Before Close"),
            toggled: contextkey_1.ContextKeyExpr.notEquals('config.window.confirmBeforeClose', 'never')
        },
        order: 1,
        when: contextkeys_2.IsWebContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        title: (0, nls_1.localize)({ key: 'miOpenRecent', comment: ['&& denotes a mnemonic'] }, "Open &&Recent"),
        submenu: actions_1.MenuId.MenubarRecentMenu,
        group: '2_open',
        order: 4
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93QWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL2FjdGlvbnMvd2luZG93QWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFtQ25GLFFBQUEsNkJBQTZCLEdBQUcscUJBQXFCLENBQUM7SUFRbkUsTUFBZSxvQkFBcUIsU0FBUSxpQkFBTztRQWtCbEQsWUFBWSxJQUErQjtZQUMxQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFqQkksNkJBQXdCLEdBQXNCO2dCQUM5RCxTQUFTLEVBQUUscUJBQVMsQ0FBQyxXQUFXLENBQUMsa0JBQU8sQ0FBQyxXQUFXLENBQUM7Z0JBQ3JELE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyxRQUFRLEVBQUUsNkJBQTZCLENBQUM7YUFDMUQsQ0FBQztZQUVlLDhCQUF5QixHQUFzQjtnQkFDL0QsU0FBUyxFQUFFLGtCQUFrQixHQUFHLHFCQUFTLENBQUMsV0FBVyxDQUFDLGtCQUFPLENBQUMsVUFBVSxDQUFDO2dCQUN6RSxPQUFPLEVBQUUsSUFBQSxjQUFRLEVBQUMsMkJBQTJCLEVBQUUsMkJBQTJCLENBQUM7Z0JBQzNFLGFBQWEsRUFBRSxJQUFJO2FBQ25CLENBQUM7WUFFZSxpQ0FBNEIsR0FBc0I7Z0JBQ2xFLEdBQUcsSUFBSSxDQUFDLHlCQUF5QjtnQkFDakMsT0FBTyxFQUFFLElBQUEsY0FBUSxFQUFDLDhCQUE4QixFQUFFLDhCQUE4QixDQUFDO2FBQ2pGLENBQUM7UUFJRixDQUFDO1FBSVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUM1QyxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQztZQUMzRCxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQztZQUMz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