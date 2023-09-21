/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/quickinput/common/quickInput", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/base/common/uri", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/tags/common/workspaceTags", "vs/base/common/errors", "vs/platform/action/common/actionCommonCategories", "vs/platform/opener/common/opener"], function (require, exports, lifecycle_1, platform_1, nls_1, actions_1, contextkey_1, userDataProfile_1, lifecycle_2, userDataProfile_2, quickInput_1, notification_1, dialogs_1, uri_1, telemetry_1, workspace_1, workspaceTags_1, errors_1, actionCommonCategories_1, opener_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataProfilesWorkbenchContribution = void 0;
    let UserDataProfilesWorkbenchContribution = class UserDataProfilesWorkbenchContribution extends lifecycle_1.Disposable {
        constructor(userDataProfileService, userDataProfilesService, userDataProfileManagementService, userDataProfileImportExportService, telemetryService, workspaceContextService, workspaceTagsService, contextKeyService, lifecycleService) {
            super();
            this.userDataProfileService = userDataProfileService;
            this.userDataProfilesService = userDataProfilesService;
            this.userDataProfileManagementService = userDataProfileManagementService;
            this.userDataProfileImportExportService = userDataProfileImportExportService;
            this.telemetryService = telemetryService;
            this.workspaceContextService = workspaceContextService;
            this.workspaceTagsService = workspaceTagsService;
            this.lifecycleService = lifecycleService;
            this.profilesDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.currentprofileActionsDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.currentProfileContext = userDataProfile_2.CURRENT_PROFILE_CONTEXT.bindTo(contextKeyService);
            userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT.bindTo(contextKeyService).set(this.userDataProfilesService.isEnabled());
            this.isCurrentProfileTransientContext = userDataProfile_2.IS_CURRENT_PROFILE_TRANSIENT_CONTEXT.bindTo(contextKeyService);
            this.currentProfileContext.set(this.userDataProfileService.currentProfile.id);
            this.isCurrentProfileTransientContext.set(!!this.userDataProfileService.currentProfile.isTransient);
            this._register(this.userDataProfileService.onDidChangeCurrentProfile(e => {
                this.currentProfileContext.set(this.userDataProfileService.currentProfile.id);
                this.isCurrentProfileTransientContext.set(!!this.userDataProfileService.currentProfile.isTransient);
            }));
            this.hasProfilesContext = userDataProfile_2.HAS_PROFILES_CONTEXT.bindTo(contextKeyService);
            this.hasProfilesContext.set(this.userDataProfilesService.profiles.length > 1);
            this._register(this.userDataProfilesService.onDidChangeProfiles(e => this.hasProfilesContext.set(this.userDataProfilesService.profiles.length > 1)));
            this.registerActions();
            if (platform_1.isWeb) {
                lifecycleService.when(4 /* LifecyclePhase.Eventually */).then(() => userDataProfilesService.cleanUp());
            }
            this.reportWorkspaceProfileInfo();
        }
        registerActions() {
            this.registerProfileSubMenu();
            this._register(this.registerSwitchProfileAction());
            this.registerProfilesActions();
            this._register(this.userDataProfilesService.onDidChangeProfiles(() => this.registerProfilesActions()));
            this.registerCurrentProfilesActions();
            this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => this.registerCurrentProfilesActions()));
            this.registerCreateFromCurrentProfileAction();
            this.registerCreateProfileAction();
            this.registerDeleteProfileAction();
            this.registerHelpAction();
        }
        registerProfileSubMenu() {
            const getProfilesTitle = () => {
                return (0, nls_1.localize)('profiles', "Profiles ({0})", this.userDataProfileService.currentProfile.name);
            };
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                get title() {
                    return getProfilesTitle();
                },
                submenu: userDataProfile_2.ProfilesMenu,
                group: '2_configuration',
                order: 1,
            });
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarPreferencesMenu, {
                get title() {
                    return getProfilesTitle();
                },
                submenu: userDataProfile_2.ProfilesMenu,
                group: '2_configuration',
                order: 1,
                when: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
            });
        }
        registerProfilesActions() {
            this.profilesDisposable.value = new lifecycle_1.DisposableStore();
            for (const profile of this.userDataProfilesService.profiles) {
                this.profilesDisposable.value.add(this.registerProfileEntryAction(profile));
            }
        }
        registerProfileEntryAction(profile) {
            const that = this;
            return (0, actions_1.registerAction2)(class ProfileEntryAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.profiles.actions.profileEntry.${profile.id}`,
                        title: profile.name,
                        toggled: contextkey_1.ContextKeyExpr.equals(userDataProfile_2.CURRENT_PROFILE_CONTEXT.key, profile.id),
                        menu: [
                            {
                                id: userDataProfile_2.ProfilesMenu,
                                group: '0_profiles',
                                when: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
                            }
                        ]
                    });
                }
                async run(accessor) {
                    if (that.userDataProfileService.currentProfile.id !== profile.id) {
                        return that.userDataProfileManagementService.switchProfile(profile);
                    }
                }
            });
        }
        registerSwitchProfileAction() {
            return (0, actions_1.registerAction2)(class SwitchProfileAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.profiles.actions.switchProfile`,
                        title: { value: (0, nls_1.localize)('switchProfile', "Switch Profile..."), original: 'Switch Profile...' },
                        category: userDataProfile_2.PROFILES_CATEGORY,
                        f1: true,
                        precondition: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
                    });
                }
                async run(accessor) {
                    const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                    const menuService = accessor.get(actions_1.IMenuService);
                    const menu = menuService.createMenu(userDataProfile_2.ProfilesMenu, accessor.get(contextkey_1.IContextKeyService));
                    const actions = menu.getActions().find(([group]) => group === '0_profiles')?.[1] ?? [];
                    try {
                        const result = await quickInputService.pick(actions.map(action => ({
                            action,
                            label: action.checked ? `$(check) ${action.label}` : action.label,
                        })), {
                            placeHolder: (0, nls_1.localize)('selectProfile', "Select Profile")
                        });
                        await result?.action.run();
                    }
                    finally {
                        menu.dispose();
                    }
                }
            });
        }
        registerCurrentProfilesActions() {
            this.currentprofileActionsDisposable.value = new lifecycle_1.DisposableStore();
            this.currentprofileActionsDisposable.value.add(this.registerEditCurrentProfileAction());
            this.currentprofileActionsDisposable.value.add(this.registerShowCurrentProfileContentsAction());
            this.currentprofileActionsDisposable.value.add(this.registerExportCurrentProfileAction());
            this.currentprofileActionsDisposable.value.add(this.registerImportProfileAction());
        }
        registerEditCurrentProfileAction() {
            const that = this;
            return (0, actions_1.registerAction2)(class RenameCurrentProfileAction extends actions_1.Action2 {
                constructor() {
                    const when = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.notEquals(userDataProfile_2.CURRENT_PROFILE_CONTEXT.key, that.userDataProfilesService.defaultProfile.id), userDataProfile_2.IS_CURRENT_PROFILE_TRANSIENT_CONTEXT.toNegated());
                    super({
                        id: `workbench.profiles.actions.editCurrentProfile`,
                        title: {
                            value: (0, nls_1.localize)('edit profile', "Edit Profile..."),
                            original: `Edit Profile...`
                        },
                        precondition: when,
                        f1: true,
                        menu: [
                            {
                                id: userDataProfile_2.ProfilesMenu,
                                group: '2_manage_current',
                                when,
                                order: 2
                            }
                        ]
                    });
                }
                run() {
                    return that.userDataProfileImportExportService.editProfile(that.userDataProfileService.currentProfile);
                }
            });
        }
        registerShowCurrentProfileContentsAction() {
            const id = 'workbench.profiles.actions.showProfileContents';
            return (0, actions_1.registerAction2)(class ShowProfileContentsAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id,
                        title: {
                            value: (0, nls_1.localize)('show profile contents', "Show Profile Contents"),
                            original: `Show Profile Contents`
                        },
                        category: userDataProfile_2.PROFILES_CATEGORY,
                        menu: [
                            {
                                id: userDataProfile_2.ProfilesMenu,
                                group: '2_manage_current',
                                order: 3
                            }, {
                                id: actions_1.MenuId.CommandPalette
                            }
                        ]
                    });
                }
                async run(accessor) {
                    const userDataProfileImportExportService = accessor.get(userDataProfile_2.IUserDataProfileImportExportService);
                    return userDataProfileImportExportService.showProfileContents();
                }
            });
        }
        registerExportCurrentProfileAction() {
            const that = this;
            const disposables = new lifecycle_1.DisposableStore();
            const id = 'workbench.profiles.actions.exportProfile';
            disposables.add((0, actions_1.registerAction2)(class ExportProfileAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id,
                        title: {
                            value: (0, nls_1.localize)('export profile', "Export Profile..."),
                            original: `Export Profile (${that.userDataProfileService.currentProfile.name})...`
                        },
                        category: userDataProfile_2.PROFILES_CATEGORY,
                        precondition: userDataProfile_2.IS_PROFILE_EXPORT_IN_PROGRESS_CONTEXT.toNegated(),
                        menu: [
                            {
                                id: userDataProfile_2.ProfilesMenu,
                                group: '4_import_export_profiles',
                                order: 1
                            }, {
                                id: actions_1.MenuId.CommandPalette
                            }
                        ]
                    });
                }
                async run(accessor) {
                    const userDataProfileImportExportService = accessor.get(userDataProfile_2.IUserDataProfileImportExportService);
                    return userDataProfileImportExportService.exportProfile();
                }
            }));
            disposables.add(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarShare, {
                command: {
                    id,
                    title: {
                        value: (0, nls_1.localize)('export profile in share', "Export Profile ({0})...", that.userDataProfileService.currentProfile.name),
                        original: `Export Profile (${that.userDataProfileService.currentProfile.name})...`
                    },
                    precondition: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
                },
            }));
            return disposables;
        }
        registerImportProfileAction() {
            const disposables = new lifecycle_1.DisposableStore();
            const id = 'workbench.profiles.actions.importProfile';
            const that = this;
            disposables.add((0, actions_1.registerAction2)(class ImportProfileAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id,
                        title: {
                            value: (0, nls_1.localize)('import profile', "Import Profile..."),
                            original: 'Import Profile...'
                        },
                        category: userDataProfile_2.PROFILES_CATEGORY,
                        precondition: userDataProfile_2.IS_PROFILE_IMPORT_IN_PROGRESS_CONTEXT.toNegated(),
                        menu: [
                            {
                                id: userDataProfile_2.ProfilesMenu,
                                group: '4_import_export_profiles',
                                when: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
                                order: 2
                            }, {
                                id: actions_1.MenuId.CommandPalette,
                                when: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
                            }
                        ]
                    });
                }
                async run(accessor) {
                    const fileDialogService = accessor.get(dialogs_1.IFileDialogService);
                    const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                    const userDataProfileImportExportService = accessor.get(userDataProfile_2.IUserDataProfileImportExportService);
                    const notificationService = accessor.get(notification_1.INotificationService);
                    const disposables = new lifecycle_1.DisposableStore();
                    const quickPick = disposables.add(quickInputService.createQuickPick());
                    const profileTemplateQuickPickItems = await that.getProfileTemplatesQuickPickItems();
                    const updateQuickPickItems = (value) => {
                        const quickPickItems = [];
                        if (value) {
                            quickPickItems.push({ label: quickPick.value, description: (0, nls_1.localize)('import from url', "Import from URL") });
                        }
                        quickPickItems.push({ label: (0, nls_1.localize)('import from file', "Select File...") });
                        if (profileTemplateQuickPickItems.length) {
                            quickPickItems.push({
                                type: 'separator',
                                label: (0, nls_1.localize)('templates', "Profile Templates")
                            }, ...profileTemplateQuickPickItems);
                        }
                        quickPick.items = quickPickItems;
                    };
                    quickPick.title = (0, nls_1.localize)('import profile quick pick title', "Import from Profile Template...");
                    quickPick.placeholder = (0, nls_1.localize)('import profile placeholder', "Provide Profile Template URL");
                    quickPick.ignoreFocusOut = true;
                    disposables.add(quickPick.onDidChangeValue(updateQuickPickItems));
                    updateQuickPickItems();
                    quickPick.matchOnLabel = false;
                    quickPick.matchOnDescription = false;
                    disposables.add(quickPick.onDidAccept(async () => {
                        quickPick.hide();
                        const selectedItem = quickPick.selectedItems[0];
                        if (!selectedItem) {
                            return;
                        }
                        try {
                            if (selectedItem.url) {
                                return await that.userDataProfileImportExportService.createProfile(uri_1.URI.parse(selectedItem.url));
                            }
                            const profile = selectedItem.label === quickPick.value ? uri_1.URI.parse(quickPick.value) : await this.getProfileUriFromFileSystem(fileDialogService);
                            if (profile) {
                                await userDataProfileImportExportService.importProfile(profile);
                            }
                        }
                        catch (error) {
                            notificationService.error((0, nls_1.localize)('profile import error', "Error while creating profile: {0}", (0, errors_1.getErrorMessage)(error)));
                        }
                    }));
                    disposables.add(quickPick.onDidHide(() => disposables.dispose()));
                    quickPick.show();
                }
                async getProfileUriFromFileSystem(fileDialogService) {
                    const profileLocation = await fileDialogService.showOpenDialog({
                        canSelectFolders: false,
                        canSelectFiles: true,
                        canSelectMany: false,
                        filters: userDataProfile_2.PROFILE_FILTER,
                        title: (0, nls_1.localize)('import profile dialog', "Select Profile Template File"),
                    });
                    if (!profileLocation) {
                        return null;
                    }
                    return profileLocation[0];
                }
            }));
            disposables.add(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarShare, {
                command: {
                    id,
                    title: {
                        value: (0, nls_1.localize)('import profile share', "Import Profile..."),
                        original: 'Import Profile...'
                    },
                    precondition: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
                },
            }));
            return disposables;
        }
        registerCreateFromCurrentProfileAction() {
            const that = this;
            this._register((0, actions_1.registerAction2)(class CreateFromCurrentProfileAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.profiles.actions.createFromCurrentProfile',
                        title: {
                            value: (0, nls_1.localize)('save profile as', "Save Current Profile As..."),
                            original: 'Save Current Profile As...'
                        },
                        category: userDataProfile_2.PROFILES_CATEGORY,
                        f1: true,
                        precondition: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT
                    });
                }
                run(accessor) {
                    return that.userDataProfileImportExportService.createProfile(that.userDataProfileService.currentProfile);
                }
            }));
        }
        registerCreateProfileAction() {
            const that = this;
            this._register((0, actions_1.registerAction2)(class CreateProfileAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.profiles.actions.createProfile',
                        title: {
                            value: (0, nls_1.localize)('create profile', "Create Profile..."),
                            original: 'Create Profile...'
                        },
                        category: userDataProfile_2.PROFILES_CATEGORY,
                        precondition: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
                        f1: true,
                        menu: [
                            {
                                id: userDataProfile_2.ProfilesMenu,
                                group: '3_manage_profiles',
                                when: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
                                order: 1
                            }
                        ]
                    });
                }
                async run(accessor) {
                    return that.userDataProfileImportExportService.createProfile();
                }
            }));
        }
        registerDeleteProfileAction() {
            (0, actions_1.registerAction2)(class DeleteProfileAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.profiles.actions.deleteProfile',
                        title: {
                            value: (0, nls_1.localize)('delete profile', "Delete Profile..."),
                            original: 'Delete Profile...'
                        },
                        category: userDataProfile_2.PROFILES_CATEGORY,
                        f1: true,
                        precondition: contextkey_1.ContextKeyExpr.and(userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT, userDataProfile_2.HAS_PROFILES_CONTEXT),
                        menu: [
                            {
                                id: userDataProfile_2.ProfilesMenu,
                                group: '3_manage_profiles',
                                when: userDataProfile_2.PROFILES_ENABLEMENT_CONTEXT,
                                order: 2
                            }
                        ]
                    });
                }
                async run(accessor) {
                    const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                    const userDataProfileService = accessor.get(userDataProfile_2.IUserDataProfileService);
                    const userDataProfilesService = accessor.get(userDataProfile_1.IUserDataProfilesService);
                    const userDataProfileManagementService = accessor.get(userDataProfile_2.IUserDataProfileManagementService);
                    const notificationService = accessor.get(notification_1.INotificationService);
                    const profiles = userDataProfilesService.profiles.filter(p => !p.isDefault && !p.isTransient);
                    if (profiles.length) {
                        const picks = await quickInputService.pick(profiles.map(profile => ({
                            label: profile.name,
                            description: profile.id === userDataProfileService.currentProfile.id ? (0, nls_1.localize)('current', "Current") : undefined,
                            profile
                        })), {
                            title: (0, nls_1.localize)('delete specific profile', "Delete Profile..."),
                            placeHolder: (0, nls_1.localize)('pick profile to delete', "Select Profiles to Delete"),
                            canPickMany: true
                        });
                        if (picks) {
                            try {
                                await Promise.all(picks.map(pick => userDataProfileManagementService.removeProfile(pick.profile)));
                            }
                            catch (error) {
                                notificationService.error(error);
                            }
                        }
                    }
                }
            });
        }
        registerHelpAction() {
            this._register((0, actions_1.registerAction2)(class HelpAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.profiles.actions.help',
                        title: userDataProfile_2.PROFILES_TITLE,
                        category: actionCommonCategories_1.Categories.Help,
                        menu: [{
                                id: actions_1.MenuId.CommandPalette,
                            }],
                    });
                }
                run(accessor) {
                    return accessor.get(opener_1.IOpenerService).open(uri_1.URI.parse('https://aka.ms/vscode-profiles-help'));
                }
            }));
        }
        async getProfileTemplatesQuickPickItems() {
            const quickPickItems = [];
            const profileTemplates = await this.userDataProfileManagementService.getBuiltinProfileTemplates();
            for (const template of profileTemplates) {
                quickPickItems.push({
                    label: template.name,
                    ...template
                });
            }
            return quickPickItems;
        }
        async reportWorkspaceProfileInfo() {
            await this.lifecycleService.when(4 /* LifecyclePhase.Eventually */);
            const workspaceId = await this.workspaceTagsService.getTelemetryWorkspaceId(this.workspaceContextService.getWorkspace(), this.workspaceContextService.getWorkbenchState());
            this.telemetryService.publicLog2('workspaceProfileInfo', {
                workspaceId,
                defaultProfile: this.userDataProfileService.currentProfile.isDefault
            });
        }
    };
    exports.UserDataProfilesWorkbenchContribution = UserDataProfilesWorkbenchContribution;
    exports.UserDataProfilesWorkbenchContribution = UserDataProfilesWorkbenchContribution = __decorate([
        __param(0, userDataProfile_2.IUserDataProfileService),
        __param(1, userDataProfile_1.IUserDataProfilesService),
        __param(2, userDataProfile_2.IUserDataProfileManagementService),
        __param(3, userDataProfile_2.IUserDataProfileImportExportService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, workspaceTags_1.IWorkspaceTagsService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, lifecycle_2.ILifecycleService)
    ], UserDataProfilesWorkbenchContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdXNlckRhdGFQcm9maWxlL2Jyb3dzZXIvdXNlckRhdGFQcm9maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXlCekYsSUFBTSxxQ0FBcUMsR0FBM0MsTUFBTSxxQ0FBc0MsU0FBUSxzQkFBVTtRQU1wRSxZQUMwQixzQkFBZ0UsRUFDL0QsdUJBQWtFLEVBQ3pELGdDQUFvRixFQUNsRixrQ0FBd0YsRUFDMUcsZ0JBQW9ELEVBQzdDLHVCQUFrRSxFQUNyRSxvQkFBNEQsRUFDL0QsaUJBQXFDLEVBQ3RDLGdCQUFvRDtZQUV2RSxLQUFLLEVBQUUsQ0FBQztZQVZrQywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXlCO1lBQzlDLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFDeEMscUNBQWdDLEdBQWhDLGdDQUFnQyxDQUFtQztZQUNqRSx1Q0FBa0MsR0FBbEMsa0NBQWtDLENBQXFDO1lBQ3pGLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDNUIsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQUNwRCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBRS9DLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFvRXZELHVCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBbUIsQ0FBQyxDQUFDO1lBZ0U5RSxvQ0FBK0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksNkJBQWlCLEVBQW1CLENBQUMsQ0FBQztZQWhJM0csSUFBSSxDQUFDLHFCQUFxQixHQUFHLHlDQUF1QixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQy9FLDZDQUEyQixDQUFDLE1BQU0sQ0FBQyxpQkFBaUIs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