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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/nls!vs/workbench/contrib/userDataProfile/browser/userDataProfile", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/quickinput/common/quickInput", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/base/common/uri", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/tags/common/workspaceTags", "vs/base/common/errors", "vs/platform/action/common/actionCommonCategories", "vs/platform/opener/common/opener"], function (require, exports, lifecycle_1, platform_1, nls_1, actions_1, contextkey_1, userDataProfile_1, lifecycle_2, userDataProfile_2, quickInput_1, notification_1, dialogs_1, uri_1, telemetry_1, workspace_1, workspaceTags_1, errors_1, actionCommonCategories_1, opener_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$PZb = void 0;
    let $PZb = class $PZb extends lifecycle_1.$kc {
        constructor(f, g, h, j, m, n, r, contextKeyService, s) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.w = this.B(new lifecycle_1.$lc());
            this.D = this.B(new lifecycle_1.$lc());
            this.a = userDataProfile_2.$QJ.bindTo(contextKeyService);
            userDataProfile_2.$PJ.bindTo(contextKeyService).set(this.g.isEnabled());
            this.b = userDataProfile_2.$RJ.bindTo(contextKeyService);
            this.a.set(this.f.currentProfile.id);
            this.b.set(!!this.f.currentProfile.isTransient);
            this.B(this.f.onDidChangeCurrentProfile(e => {
                this.a.set(this.f.currentProfile.id);
                this.b.set(!!this.f.currentProfile.isTransient);
            }));
            this.c = userDataProfile_2.$SJ.bindTo(contextKeyService);
            this.c.set(this.g.profiles.length > 1);
            this.B(this.g.onDidChangeProfiles(e => this.c.set(this.g.profiles.length > 1)));
            this.t();
            if (platform_1.$o) {
                s.when(4 /* LifecyclePhase.Eventually */).then(() => g.cleanUp());
            }
            this.Q();
        }
        t() {
            this.u();
            this.B(this.C());
            this.y();
            this.B(this.g.onDidChangeProfiles(() => this.y()));
            this.F();
            this.B(this.f.onDidChangeCurrentProfile(() => this.F()));
            this.L();
            this.M();
            this.N();
            this.O();
        }
        u() {
            const getProfilesTitle = () => {
                return (0, nls_1.localize)(0, null, this.f.currentProfile.name);
            };
            actions_1.$Tu.appendMenuItem(actions_1.$Ru.GlobalActivity, {
                get title() {
                    return getProfilesTitle();
                },
                submenu: userDataProfile_2.$JJ,
                group: '2_configuration',
                order: 1,
            });
            actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarPreferencesMenu, {
                get title() {
                    return getProfilesTitle();
                },
                submenu: userDataProfile_2.$JJ,
                group: '2_configuration',
                order: 1,
                when: userDataProfile_2.$PJ,
            });
        }
        y() {
            this.w.value = new lifecycle_1.$jc();
            for (const profile of this.g.profiles) {
                this.w.value.add(this.z(profile));
            }
        }
        z(profile) {
            const that = this;
            return (0, actions_1.$Xu)(class ProfileEntryAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id: `workbench.profiles.actions.profileEntry.${profile.id}`,
                        title: profile.name,
                        toggled: contextkey_1.$Ii.equals(userDataProfile_2.$QJ.key, profile.id),
                        menu: [
                            {
                                id: userDataProfile_2.$JJ,
                                group: '0_profiles',
                                when: userDataProfile_2.$PJ,
                            }
                        ]
                    });
                }
                async run(accessor) {
                    if (that.f.currentProfile.id !== profile.id) {
                        return that.h.switchProfile(profile);
                    }
                }
            });
        }
        C() {
            return (0, actions_1.$Xu)(class SwitchProfileAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id: `workbench.profiles.actions.switchProfile`,
                        title: { value: (0, nls_1.localize)(1, null), original: 'Switch Profile...' },
                        category: userDataProfile_2.$MJ,
                        f1: true,
                        precondition: userDataProfile_2.$PJ,
                    });
                }
                async run(accessor) {
                    const quickInputService = accessor.get(quickInput_1.$Gq);
                    const menuService = accessor.get(actions_1.$Su);
                    const menu = menuService.createMenu(userDataProfile_2.$JJ, accessor.get(contextkey_1.$3i));
                    const actions = menu.getActions().find(([group]) => group === '0_profiles')?.[1] ?? [];
                    try {
                        const result = await quickInputService.pick(actions.map(action => ({
                            action,
                            label: action.checked ? `$(check) ${action.label}` : action.label,
                        })), {
                            placeHolder: (0, nls_1.localize)(2, null)
                        });
                        await result?.action.run();
                    }
                    finally {
                        menu.dispose();
                    }
                }
            });
        }
        F() {
            this.D.value = new lifecycle_1.$jc();
            this.D.value.add(this.G());
            this.D.value.add(this.H());
            this.D.value.add(this.I());
            this.D.value.add(this.J());
        }
        G() {
            const that = this;
            return (0, actions_1.$Xu)(class RenameCurrentProfileAction extends actions_1.$Wu {
                constructor() {
                    const when = contextkey_1.$Ii.and(contextkey_1.$Ii.notEquals(userDataProfile_2.$QJ.key, that.g.defaultProfile.id), userDataProfile_2.$RJ.toNegated());
                    super({
                        id: `workbench.profiles.actions.editCurrentProfile`,
                        title: {
                            value: (0, nls_1.localize)(3, null),
                            original: `Edit Profile...`
                        },
                        precondition: when,
                        f1: true,
                        menu: [
                            {
                                id: userDataProfile_2.$JJ,
                                group: '2_manage_current',
                                when,
                                order: 2
                            }
                        ]
                    });
                }
                run() {
                    return that.j.editProfile(that.f.currentProfile);
                }
            });
        }
        H() {
            const id = 'workbench.profiles.actions.showProfileContents';
            return (0, actions_1.$Xu)(class ShowProfileContentsAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id,
                        title: {
                            value: (0, nls_1.localize)(4, null),
                            original: `Show Profile Contents`
                        },
                        category: userDataProfile_2.$MJ,
                        menu: [
                            {
                                id: userDataProfile_2.$JJ,
                                group: '2_manage_current',
                                order: 3
                            }, {
                                id: actions_1.$Ru.CommandPalette
                            }
                        ]
                    });
                }
                async run(accessor) {
                    const userDataProfileImportExportService = accessor.get(userDataProfile_2.$HJ);
                    return userDataProfileImportExportService.showProfileContents();
                }
            });
        }
        I() {
            const that = this;
            const disposables = new lifecycle_1.$jc();
            const id = 'workbench.profiles.actions.exportProfile';
            disposables.add((0, actions_1.$Xu)(class ExportProfileAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id,
                        title: {
                            value: (0, nls_1.localize)(5, null),
                            original: `Export Profile (${that.f.currentProfile.name})...`
                        },
                        category: userDataProfile_2.$MJ,
                        precondition: userDataProfile_2.$TJ.toNegated(),
                        menu: [
                            {
                                id: userDataProfile_2.$JJ,
                                group: '4_import_export_profiles',
                                order: 1
                            }, {
                                id: actions_1.$Ru.CommandPalette
                            }
                        ]
                    });
                }
                async run(accessor) {
                    const userDataProfileImportExportService = accessor.get(userDataProfile_2.$HJ);
                    return userDataProfileImportExportService.exportProfile();
                }
            }));
            disposables.add(actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarShare, {
                command: {
                    id,
                    title: {
                        value: (0, nls_1.localize)(6, null, that.f.currentProfile.name),
                        original: `Export Profile (${that.f.currentProfile.name})...`
                    },
                    precondition: userDataProfile_2.$PJ,
                },
            }));
            return disposables;
        }
        J() {
            const disposables = new lifecycle_1.$jc();
            const id = 'workbench.profiles.actions.importProfile';
            const that = this;
            disposables.add((0, actions_1.$Xu)(class ImportProfileAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id,
                        title: {
                            value: (0, nls_1.localize)(7, null),
                            original: 'Import Profile...'
                        },
                        category: userDataProfile_2.$MJ,
                        precondition: userDataProfile_2.$UJ.toNegated(),
                        menu: [
                            {
                                id: userDataProfile_2.$JJ,
                                group: '4_import_export_profiles',
                                when: userDataProfile_2.$PJ,
                                order: 2
                            }, {
                                id: actions_1.$Ru.CommandPalette,
                                when: userDataProfile_2.$PJ,
                            }
                        ]
                    });
                }
                async run(accessor) {
                    const fileDialogService = accessor.get(dialogs_1.$qA);
                    const quickInputService = accessor.get(quickInput_1.$Gq);
                    const userDataProfileImportExportService = accessor.get(userDataProfile_2.$HJ);
                    const notificationService = accessor.get(notification_1.$Yu);
                    const disposables = new lifecycle_1.$jc();
                    const quickPick = disposables.add(quickInputService.createQuickPick());
                    const profileTemplateQuickPickItems = await that.P();
                    const updateQuickPickItems = (value) => {
                        const quickPickItems = [];
                        if (value) {
                            quickPickItems.push({ label: quickPick.value, description: (0, nls_1.localize)(8, null) });
                        }
                        quickPickItems.push({ label: (0, nls_1.localize)(9, null) });
                        if (profileTemplateQuickPickItems.length) {
                            quickPickItems.push({
                                type: 'separator',
                                label: (0, nls_1.localize)(10, null)
                            }, ...profileTemplateQuickPickItems);
                        }
                        quickPick.items = quickPickItems;
                    };
                    quickPick.title = (0, nls_1.localize)(11, null);
                    quickPick.placeholder = (0, nls_1.localize)(12, null);
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
                                return await that.j.createProfile(uri_1.URI.parse(selectedItem.url));
                            }
                            const profile = selectedItem.label === quickPick.value ? uri_1.URI.parse(quickPick.value) : await this.a(fileDialogService);
                            if (profile) {
                                await userDataProfileImportExportService.importProfile(profile);
                            }
                        }
                        catch (error) {
                            notificationService.error((0, nls_1.localize)(13, null, (0, errors_1.$8)(error)));
                        }
                    }));
                    disposables.add(quickPick.onDidHide(() => disposables.dispose()));
                    quickPick.show();
                }
                async a(fileDialogService) {
                    const profileLocation = await fileDialogService.showOpenDialog({
                        canSelectFolders: false,
                        canSelectFiles: true,
                        canSelectMany: false,
                        filters: userDataProfile_2.$OJ,
                        title: (0, nls_1.localize)(14, null),
                    });
                    if (!profileLocation) {
                        return null;
                    }
                    return profileLocation[0];
                }
            }));
            disposables.add(actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarShare, {
                command: {
                    id,
                    title: {
                        value: (0, nls_1.localize)(15, null),
                        original: 'Import Profile...'
                    },
                    precondition: userDataProfile_2.$PJ,
                },
            }));
            return disposables;
        }
        L() {
            const that = this;
            this.B((0, actions_1.$Xu)(class CreateFromCurrentProfileAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.profiles.actions.createFromCurrentProfile',
                        title: {
                            value: (0, nls_1.localize)(16, null),
                            original: 'Save Current Profile As...'
                        },
                        category: userDataProfile_2.$MJ,
                        f1: true,
                        precondition: userDataProfile_2.$PJ
                    });
                }
                run(accessor) {
                    return that.j.createProfile(that.f.currentProfile);
                }
            }));
        }
        M() {
            const that = this;
            this.B((0, actions_1.$Xu)(class CreateProfileAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.profiles.actions.createProfile',
                        title: {
                            value: (0, nls_1.localize)(17, null),
                            original: 'Create Profile...'
                        },
                        category: userDataProfile_2.$MJ,
                        precondition: userDataProfile_2.$PJ,
                        f1: true,
                        menu: [
                            {
                                id: userDataProfile_2.$JJ,
                                group: '3_manage_profiles',
                                when: userDataProfile_2.$PJ,
                                order: 1
                            }
                        ]
                    });
                }
                async run(accessor) {
                    return that.j.createProfile();
                }
            }));
        }
        N() {
            (0, actions_1.$Xu)(class DeleteProfileAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.profiles.actions.deleteProfile',
                        title: {
                            value: (0, nls_1.localize)(18, null),
                            original: 'Delete Profile...'
                        },
                        category: userDataProfile_2.$MJ,
                        f1: true,
                        precondition: contextkey_1.$Ii.and(userDataProfile_2.$PJ, userDataProfile_2.$SJ),
                        menu: [
                            {
                                id: userDataProfile_2.$JJ,
                                group: '3_manage_profiles',
                                when: userDataProfile_2.$PJ,
                                order: 2
                            }
                        ]
                    });
                }
                async run(accessor) {
                    const quickInputService = accessor.get(quickInput_1.$Gq);
                    const userDataProfileService = accessor.get(userDataProfile_2.$CJ);
                    const userDataProfilesService = accessor.get(userDataProfile_1.$Ek);
                    const userDataProfileManagementService = accessor.get(userDataProfile_2.$DJ);
                    const notificationService = accessor.get(notification_1.$Yu);
                    const profiles = userDataProfilesService.profiles.filter(p => !p.isDefault && !p.isTransient);
                    if (profiles.length) {
                        const picks = await quickInputService.pick(profiles.map(profile => ({
                            label: profile.name,
                            description: profile.id === userDataProfileService.currentProfile.id ? (0, nls_1.localize)(19, null) : undefined,
                            profile
                        })), {
                            title: (0, nls_1.localize)(20, null),
                            placeHolder: (0, nls_1.localize)(21, null),
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
        O() {
            this.B((0, actions_1.$Xu)(class HelpAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id: 'workbench.profiles.actions.help',
                        title: userDataProfile_2.$LJ,
                        category: actionCommonCategories_1.$Nl.Help,
                        menu: [{
                                id: actions_1.$Ru.CommandPalette,
                            }],
                    });
                }
                run(accessor) {
                    return accessor.get(opener_1.$NT).open(uri_1.URI.parse('https://aka.ms/vscode-profiles-help'));
                }
            }));
        }
        async P() {
            const quickPickItems = [];
            const profileTemplates = await this.h.getBuiltinProfileTemplates();
            for (const template of profileTemplates) {
                quickPickItems.push({
                    label: template.name,
                    ...template
                });
            }
            return quickPickItems;
        }
        async Q() {
            await this.s.when(4 /* LifecyclePhase.Eventually */);
            const workspaceId = await this.r.getTelemetryWorkspaceId(this.n.getWorkspace(), this.n.getWorkbenchState());
            this.m.publicLog2('workspaceProfileInfo', {
                workspaceId,
                defaultProfile: this.f.currentProfile.isDefault
            });
        }
    };
    exports.$PZb = $PZb;
    exports.$PZb = $PZb = __decorate([
        __param(0, userDataProfile_2.$CJ),
        __param(1, userDataProfile_1.$Ek),
        __param(2, userDataProfile_2.$DJ),
        __param(3, userDataProfile_2.$HJ),
        __param(4, telemetry_1.$9k),
        __param(5, workspace_1.$Kh),
        __param(6, workspaceTags_1.$NZb),
        __param(7, contextkey_1.$3i),
        __param(8, lifecycle_2.$7y)
    ], $PZb);
});
//# sourceMappingURL=userDataProfile.js.map