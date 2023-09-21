/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/userDataProfile/browser/userDataProfileActions", "vs/platform/actions/common/actions", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/action/common/actionCommonCategories", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/base/common/codicons", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/base/common/actions"], function (require, exports, nls_1, actions_1, notification_1, quickInput_1, userDataProfile_1, userDataProfile_2, actionCommonCategories_1, contextkey_1, commands_1, codicons_1, menuEntryActionViewItem_1, actions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$QZb = void 0;
    class CreateTransientProfileAction extends actions_1.$Wu {
        static { this.ID = 'workbench.profiles.actions.createTemporaryProfile'; }
        static { this.TITLE = {
            value: (0, nls_1.localize)(0, null),
            original: 'Create a Temporary Profile'
        }; }
        constructor() {
            super({
                id: CreateTransientProfileAction.ID,
                title: CreateTransientProfileAction.TITLE,
                category: userDataProfile_1.$MJ,
                f1: true,
                precondition: userDataProfile_1.$PJ,
            });
        }
        async run(accessor) {
            return accessor.get(userDataProfile_1.$DJ).createAndEnterTransientProfile();
        }
    }
    (0, actions_1.$Xu)(CreateTransientProfileAction);
    class $QZb extends actions_1.$Wu {
        static { this.ID = 'workbench.profiles.actions.renameProfile'; }
        constructor() {
            super({
                id: $QZb.ID,
                title: {
                    value: (0, nls_1.localize)(1, null),
                    original: 'Rename...'
                },
                category: userDataProfile_1.$MJ,
                f1: true,
                precondition: contextkey_1.$Ii.and(userDataProfile_1.$PJ, userDataProfile_1.$SJ),
            });
        }
        async run(accessor, profile) {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const userDataProfileService = accessor.get(userDataProfile_1.$CJ);
            const userDataProfilesService = accessor.get(userDataProfile_2.$Ek);
            const userDataProfileManagementService = accessor.get(userDataProfile_1.$DJ);
            const notificationService = accessor.get(notification_1.$Yu);
            if (!profile) {
                profile = await this.a(quickInputService, userDataProfileService, userDataProfilesService);
            }
            if (!profile || profile.isDefault) {
                return;
            }
            const name = await quickInputService.input({
                value: profile.name,
                title: (0, nls_1.localize)(2, null, profile.name),
                validateInput: async (value) => {
                    if (profile.name !== value && userDataProfilesService.profiles.some(p => p.name === value)) {
                        return (0, nls_1.localize)(3, null, value);
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
        async a(quickInputService, userDataProfileService, userDataProfilesService) {
            const profiles = userDataProfilesService.profiles.filter(p => !p.isDefault && !p.isTransient);
            if (!profiles.length) {
                return undefined;
            }
            const pick = await quickInputService.pick(profiles.map(profile => ({
                label: profile.name,
                description: profile.id === userDataProfileService.currentProfile.id ? (0, nls_1.localize)(4, null) : undefined,
                profile
            })), {
                title: (0, nls_1.localize)(5, null),
                placeHolder: (0, nls_1.localize)(6, null),
            });
            return pick?.profile;
        }
    }
    exports.$QZb = $QZb;
    (0, actions_1.$Xu)($QZb);
    (0, actions_1.$Xu)(class ManageProfilesAction extends actions_1.$Wu {
        constructor() {
            super({
                id: userDataProfile_1.$KJ,
                title: {
                    value: (0, nls_1.localize)(7, null),
                    original: 'Manage...'
                },
                category: userDataProfile_1.$MJ,
                precondition: contextkey_1.$Ii.and(userDataProfile_1.$PJ, userDataProfile_1.$SJ),
            });
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const menuService = accessor.get(actions_1.$Su);
            const contextKeyService = accessor.get(contextkey_1.$3i);
            const commandService = accessor.get(commands_1.$Fr);
            const menu = menuService.createMenu(userDataProfile_1.$JJ, contextKeyService);
            const actions = [];
            (0, menuEntryActionViewItem_1.$B3)(menu, undefined, actions);
            menu.dispose();
            if (actions.length) {
                const picks = actions.map(action => {
                    if (action instanceof actions_2.$ii) {
                        return { type: 'separator' };
                    }
                    return {
                        id: action.id,
                        label: `${action.label}${action.checked ? ` $(${codicons_1.$Pj.check.id})` : ''}`,
                    };
                });
                const pick = await quickInputService.pick(picks, { canPickMany: false, title: userDataProfile_1.$MJ.value });
                if (pick?.id) {
                    await commandService.executeCommand(pick.id);
                }
            }
        }
    });
    // Developer Actions
    (0, actions_1.$Xu)(class CleanupProfilesAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.profiles.actions.cleanupProfiles',
                title: {
                    value: (0, nls_1.localize)(8, null),
                    original: 'Cleanup Profiles'
                },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true,
                precondition: userDataProfile_1.$PJ,
            });
        }
        async run(accessor) {
            return accessor.get(userDataProfile_2.$Ek).cleanUp();
        }
    });
    (0, actions_1.$Xu)(class ResetWorkspacesAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.profiles.actions.resetWorkspaces',
                title: {
                    value: (0, nls_1.localize)(9, null),
                    original: 'Reset Workspace Profiles Associations'
                },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true,
                precondition: userDataProfile_1.$PJ,
            });
        }
        async run(accessor) {
            const userDataProfilesService = accessor.get(userDataProfile_2.$Ek);
            return userDataProfilesService.resetWorkspaces();
        }
    });
});
//# sourceMappingURL=userDataProfileActions.js.map