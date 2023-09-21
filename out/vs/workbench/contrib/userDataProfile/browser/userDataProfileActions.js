/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/action/common/actionCommonCategories", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/base/common/codicons", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/base/common/actions"], function (require, exports, nls_1, actions_1, notification_1, quickInput_1, userDataProfile_1, userDataProfile_2, actionCommonCategories_1, contextkey_1, commands_1, codicons_1, menuEntryActionViewItem_1, actions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RenameProfileAction = void 0;
    class CreateTransientProfileAction extends actions_1.Action2 {
        static { this.ID = 'workbench.profiles.actions.createTemporaryProfile'; }
        static { this.TITLE = {
            value: (0, nls_1.localize)('create temporary profile', "Create a Temporary Profile"),
            original: 'Create a Temporary Profile'
        }; }
        constructor() {
            super({
                id: CreateTransientProfileAction.ID,
                title: CreateTransientProfileAction.TITLE,
                category: userDataProfile_1.PROFILES_CATEGORY,
                f1: true,
                precondition: userDataProfile_1.PROFILES_ENABLEMENT_CONTEXT,
            });
        }
        async run(accessor) {
            return accessor.get(userDataProfile_1.IUserDataProfileManagementService).createAndEnterTransientProfile();
        }
    }
    (0, actions_1.registerAction2)(CreateTransientProfileAction);
    class RenameProfileAction extends actions_1.Action2 {
        static { this.ID = 'workbench.profiles.actions.renameProfile'; }
        constructor() {
            super({
                id: RenameProfileAction.ID,
                title: {
                    value: (0, nls_1.localize)('rename profile', "Rename..."),
                    original: 'Rename...'
                },
                category: userDataProfile_1.PROFILES_CATEGORY,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(userDataProfile_1.PROFILES_ENABLEMENT_CONTEXT, userDataProfile_1.HAS_PROFILES_CONTEXT),
            });
        }
        async run(accessor, profile) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const userDataProfileService = accessor.get(userDataProfile_1.IUserDataProfileService);
            const userDataProfilesService = accessor.get(userDataProfile_2.IUserDataProfilesService);
            const userDataProfileManagementService = accessor.get(userDataProfile_1.IUserDataProfileManagementService);
            const notificationService = accessor.get(notification_1.INotificationService);
            if (!profile) {
                profile = await this.pickProfile(quickInputService, userDataProfileService, userDataProfilesService);
            }
            if (!profile || profile.isDefault) {
                return;
            }
            const name = await quickInputService.input({
                value: profile.name,
                title: (0, nls_1.localize)('select profile to rename', 'Rename {0}', profile.name),
                validateInput: async (value) => {
                    if (profile.name !== value && userDataProfilesService.profiles.some(p => p.name === value)) {
                        return (0, nls_1.localize)('profileExists', "Profile with name {0} already exists.", value);
                    }
                    return undefined;
                }
            });
            if (name && name !== profile.name) {
                try {
                    await userDataProfileManagementService.updateProfile(profile, { name });
                }
                catch (error) {
                    notificationService.error(error);
                }
            }
        }
        async pickProfile(quickInputService, userDataProfileService, userDataProfilesService) {
            const profiles = userDataProfilesService.profiles.filter(p => !p.isDefault && !p.isTransient);
            if (!profiles.length) {
                return undefined;
            }
            const pick = await quickInputService.pick(profiles.map(profile => ({
                label: profile.name,
                description: profile.id === userDataProfileService.currentProfile.id ? (0, nls_1.localize)('current', "Current") : undefined,
                profile
            })), {
                title: (0, nls_1.localize)('rename specific profile', "Rename Profile..."),
                placeHolder: (0, nls_1.localize)('pick profile to rename', "Select Profile to Rename"),
            });
            return pick?.profile;
        }
    }
    exports.RenameProfileAction = RenameProfileAction;
    (0, actions_1.registerAction2)(RenameProfileAction);
    (0, actions_1.registerAction2)(class ManageProfilesAction extends actions_1.Action2 {
        constructor() {
            super({
                id: userDataProfile_1.MANAGE_PROFILES_ACTION_ID,
                title: {
                    value: (0, nls_1.localize)('mange', "Manage..."),
                    original: 'Manage...'
                },
                category: userDataProfile_1.PROFILES_CATEGORY,
                precondition: contextkey_1.ContextKeyExpr.and(userDataProfile_1.PROFILES_ENABLEMENT_CONTEXT, userDataProfile_1.HAS_PROFILES_CONTEXT),
            });
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const menuService = accessor.get(actions_1.IMenuService);
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const commandService = accessor.get(commands_1.ICommandService);
            const menu = menuService.createMenu(userDataProfile_1.ProfilesMenu, contextKeyService);
            const actions = [];
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, undefined, actions);
            menu.dispose();
            if (actions.length) {
                const picks = actions.map(action => {
                    if (action instanceof actions_2.Separator) {
                        return { type: 'separator' };
                    }
                    return {
                        id: action.id,
                        label: `${action.label}${action.checked ? ` $(${codicons_1.Codicon.check.id})` : ''}`,
                    };
                });
                const pick = await quickInputService.pick(picks, { canPickMany: false, title: userDataProfile_1.PROFILES_CATEGORY.value });
                if (pick?.id) {
                    await commandService.executeCommand(pick.id);
                }
            }
        }
    });
    // Developer Actions
    (0, actions_1.registerAction2)(class CleanupProfilesAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.profiles.actions.cleanupProfiles',
                title: {
                    value: (0, nls_1.localize)('cleanup profile', "Cleanup Profiles"),
                    original: 'Cleanup Profiles'
                },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true,
                precondition: userDataProfile_1.PROFILES_ENABLEMENT_CONTEXT,
            });
        }
        async run(accessor) {
            return accessor.get(userDataProfile_2.IUserDataProfilesService).cleanUp();
        }
    });
    (0, actions_1.registerAction2)(class ResetWorkspacesAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.profiles.actions.resetWorkspaces',
                title: {
                    value: (0, nls_1.localize)('reset workspaces', "Reset Workspace Profiles Associations"),
                    original: 'Reset Workspace Profiles Associations'
                },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true,
                precondition: userDataProfile_1.PROFILES_ENABLEMENT_CONTEXT,
            });
        }
        async run(accessor) {
            const userDataProfilesService = accessor.get(userDataProfile_2.IUserDataProfilesService);
            return userDataProfilesService.resetWorkspaces();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3VzZXJEYXRhUHJvZmlsZS9icm93c2VyL3VzZXJEYXRhUHJvZmlsZUFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0JoRyxNQUFNLDRCQUE2QixTQUFRLGlCQUFPO2lCQUNqQyxPQUFFLEdBQUcsbURBQW1ELENBQUM7aUJBQ3pELFVBQUssR0FBRztZQUN2QixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsMEJBQTBCLEVBQUUsNEJBQTRCLENBQUM7WUFDekUsUUFBUSxFQUFFLDRCQUE0QjtTQUN0QyxDQUFDO1FBQ0Y7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLDRCQUE0QixDQUFDLEVBQUU7Z0JBQ25DLEtBQUssRUFBRSw0QkFBNEIsQ0FBQyxLQUFLO2dCQUN6QyxRQUFRLEVBQUUsbUNBQWlCO2dCQUMzQixFQUFFLEVBQUUsSUFBSTtnQkFDUixZQUFZLEVBQUUsNkNBQTJCO2FBQ3pDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQ25DLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxtREFBaUMsQ0FBQyxDQUFDLDhCQUE4QixFQUFFLENBQUM7UUFDekYsQ0FBQzs7SUFHRixJQUFBLHlCQUFlLEVBQUMsNEJBQTRCLENBQUMsQ0FBQztJQUU5QyxNQUFhLG1CQUFvQixTQUFRLGlCQUFPO2lCQUMvQixPQUFFLEdBQUcsMENBQTBDLENBQUM7UUFDaEU7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLG1CQUFtQixDQUFDLEVBQUU7Z0JBQzFCLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0JBQWdCLEVBQUUsV0FBVyxDQUFDO29CQUM5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