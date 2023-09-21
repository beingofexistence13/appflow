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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/views", "vs/nls!vs/workbench/contrib/userDataSync/browser/userDataSyncViews", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/parts/views/treeView", "vs/platform/instantiation/common/instantiation", "vs/platform/userDataSync/common/userDataSync", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/base/common/uri", "vs/workbench/services/editor/common/editorService", "vs/platform/theme/common/themeService", "vs/base/common/date", "vs/platform/dialogs/common/dialogs", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/codicons", "vs/base/common/actions", "vs/workbench/services/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataSyncMachines", "vs/platform/quickinput/common/quickInput", "vs/platform/notification/common/notification", "vs/base/common/resources", "vs/workbench/browser/parts/editor/editorCommands", "vs/platform/files/common/files", "vs/platform/environment/common/environment", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/commands/common/commands", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/contrib/userDataSync/browser/userDataSyncConflictsView"], function (require, exports, platform_1, views_1, nls_1, descriptors_1, treeView_1, instantiation_1, userDataSync_1, actions_1, contextkey_1, uri_1, editorService_1, themeService_1, date_1, dialogs_1, event_1, lifecycle_1, codicons_1, actions_2, userDataSync_2, userDataSyncMachines_1, quickInput_1, notification_1, resources_1, editorCommands_1, files_1, environment_1, uriIdentity_1, commands_1, userDataProfile_1, userDataSyncConflictsView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$HZb = void 0;
    let $HZb = class $HZb extends lifecycle_1.$kc {
        constructor(container, f, g, h, j) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.n(container);
        }
        n(container) {
            this.r(container);
            this.t(container, true);
            this.s(container);
            this.t(container, false);
            this.y(container);
            this.u(container);
        }
        r(container) {
            const viewsRegistry = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
            const viewName = (0, nls_1.localize)(0, null);
            viewsRegistry.registerViews([{
                    id: userDataSync_2.$YAb,
                    name: viewName,
                    ctorDescriptor: new descriptors_1.$yh(userDataSyncConflictsView_1.$GZb),
                    when: contextkey_1.$Ii.and(userDataSync_2.$TAb, userDataSync_2.$UAb),
                    canToggleVisibility: false,
                    canMoveView: false,
                    treeView: this.f.createInstance(treeView_1.$0ub, userDataSync_2.$YAb, viewName),
                    collapsed: false,
                    order: 100,
                }], container);
        }
        s(container) {
            const id = `workbench.views.sync.machines`;
            const name = (0, nls_1.localize)(1, null);
            const treeView = this.f.createInstance(treeView_1.$0ub, id, name);
            const dataProvider = this.f.createInstance(UserDataSyncMachinesViewDataProvider, treeView);
            treeView.showRefreshAction = true;
            treeView.canSelectMany = true;
            treeView.dataProvider = dataProvider;
            this.B(event_1.Event.any(this.h.onDidChange, this.j.onDidResetRemote)(() => treeView.refresh()));
            const viewsRegistry = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
            viewsRegistry.registerViews([{
                    id,
                    name,
                    ctorDescriptor: new descriptors_1.$yh(treeView_1.$7ub),
                    when: contextkey_1.$Ii.and(userDataSync_2.$PAb.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */), userDataSync_2.$RAb.isEqualTo("available" /* AccountStatus.Available */), userDataSync_2.$SAb),
                    canToggleVisibility: true,
                    canMoveView: false,
                    treeView,
                    collapsed: false,
                    order: 300,
                }], container);
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: `workbench.actions.sync.editMachineName`,
                        title: (0, nls_1.localize)(2, null),
                        icon: codicons_1.$Pj.edit,
                        menu: {
                            id: actions_1.$Ru.ViewItemContext,
                            when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', id)),
                            group: 'inline',
                        },
                    });
                }
                async run(accessor, handle) {
                    const changed = await dataProvider.rename(handle.$treeItemHandle);
                    if (changed) {
                        await treeView.refresh();
                    }
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: `workbench.actions.sync.turnOffSyncOnMachine`,
                        title: (0, nls_1.localize)(3, null),
                        menu: {
                            id: actions_1.$Ru.ViewItemContext,
                            when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', id), contextkey_1.$Ii.equals('viewItem', 'sync-machine')),
                        },
                    });
                }
                async run(accessor, handle, selected) {
                    if (await dataProvider.disable((selected || [handle]).map(handle => handle.$treeItemHandle))) {
                        await treeView.refresh();
                    }
                }
            });
        }
        t(container, remote) {
            const id = `workbench.views.sync.${remote ? 'remote' : 'local'}Activity`;
            const name = remote ? (0, nls_1.localize)(4, null) : (0, nls_1.localize)(5, null);
            const treeView = this.f.createInstance(treeView_1.$0ub, id, name);
            treeView.showCollapseAllAction = true;
            treeView.showRefreshAction = true;
            treeView.dataProvider = remote ? this.f.createInstance(RemoteUserDataSyncActivityViewDataProvider)
                : this.f.createInstance(LocalUserDataSyncActivityViewDataProvider);
            this.B(event_1.Event.any(this.g.onDidChangeResourceEnablement, this.g.onDidChangeEnablement, this.j.onDidResetLocal, this.j.onDidResetRemote)(() => treeView.refresh()));
            const viewsRegistry = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
            viewsRegistry.registerViews([{
                    id,
                    name,
                    ctorDescriptor: new descriptors_1.$yh(treeView_1.$7ub),
                    when: contextkey_1.$Ii.and(userDataSync_2.$PAb.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */), userDataSync_2.$RAb.isEqualTo("available" /* AccountStatus.Available */), userDataSync_2.$SAb),
                    canToggleVisibility: true,
                    canMoveView: false,
                    treeView,
                    collapsed: false,
                    order: remote ? 200 : 400,
                    hideByDefault: !remote,
                }], container);
            this.w(id);
        }
        u(container) {
            const id = `workbench.views.sync.externalActivity`;
            const name = (0, nls_1.localize)(6, null);
            const dataProvider = this.f.createInstance(ExtractedUserDataSyncActivityViewDataProvider, undefined);
            const treeView = this.f.createInstance(treeView_1.$0ub, id, name);
            treeView.showCollapseAllAction = false;
            treeView.showRefreshAction = false;
            treeView.dataProvider = dataProvider;
            const viewsRegistry = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
            viewsRegistry.registerViews([{
                    id,
                    name,
                    ctorDescriptor: new descriptors_1.$yh(treeView_1.$7ub),
                    when: userDataSync_2.$SAb,
                    canToggleVisibility: true,
                    canMoveView: false,
                    treeView,
                    collapsed: false,
                    hideByDefault: false,
                }], container);
            this.B((0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: `workbench.actions.sync.extractActivity`,
                        title: (0, nls_1.localize)(7, null),
                        icon: codicons_1.$Pj.cloudUpload,
                        menu: {
                            id: actions_1.$Ru.ViewTitle,
                            when: contextkey_1.$Ii.equals('view', id),
                            group: 'navigation',
                        },
                    });
                }
                async run(accessor) {
                    const fileDialogService = accessor.get(dialogs_1.$qA);
                    const result = await fileDialogService.showOpenDialog({
                        title: (0, nls_1.localize)(8, null),
                        canSelectFiles: true,
                        canSelectFolders: true,
                        canSelectMany: false,
                    });
                    if (!result?.[0]) {
                        return;
                    }
                    dataProvider.activityDataResource = result[0];
                    await treeView.refresh();
                }
            }));
        }
        w(viewId) {
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: `workbench.actions.sync.resolveResource`,
                        title: (0, nls_1.localize)(9, null),
                        menu: {
                            id: actions_1.$Ru.ViewItemContext,
                            when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', viewId), contextkey_1.$Ii.regex('viewItem', /sync-resource-.*/i))
                        },
                    });
                }
                async run(accessor, handle) {
                    const { resource } = JSON.parse(handle.$treeItemHandle);
                    const editorService = accessor.get(editorService_1.$9C);
                    await editorService.openEditor({ resource: uri_1.URI.parse(resource), options: { pinned: true } });
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: `workbench.actions.sync.compareWithLocal`,
                        title: (0, nls_1.localize)(10, null),
                        menu: {
                            id: actions_1.$Ru.ViewItemContext,
                            when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', viewId), contextkey_1.$Ii.regex('viewItem', /sync-associatedResource-.*/i))
                        },
                    });
                }
                async run(accessor, handle) {
                    const commandService = accessor.get(commands_1.$Fr);
                    const { resource, comparableResource } = JSON.parse(handle.$treeItemHandle);
                    const remoteResource = uri_1.URI.parse(resource);
                    const localResource = uri_1.URI.parse(comparableResource);
                    return commandService.executeCommand(editorCommands_1.$Xub, remoteResource, localResource, (0, nls_1.localize)(11, null, (0, nls_1.localize)(12, null, (0, resources_1.$fg)(remoteResource)), (0, nls_1.localize)(13, null, (0, resources_1.$fg)(localResource))), undefined);
                }
            });
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: `workbench.actions.sync.replaceCurrent`,
                        title: (0, nls_1.localize)(14, null),
                        icon: codicons_1.$Pj.discard,
                        menu: {
                            id: actions_1.$Ru.ViewItemContext,
                            when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', viewId), contextkey_1.$Ii.regex('viewItem', /sync-resource-.*/i)),
                            group: 'inline',
                        },
                    });
                }
                async run(accessor, handle) {
                    const dialogService = accessor.get(dialogs_1.$oA);
                    const userDataSyncService = accessor.get(userDataSync_1.$Qgb);
                    const { syncResourceHandle, syncResource } = JSON.parse(handle.$treeItemHandle);
                    const result = await dialogService.confirm({
                        message: (0, nls_1.localize)(15, null, (0, userDataSync_2.$LAb)(syncResource)),
                        type: 'info',
                        title: userDataSync_2.$NAb
                    });
                    if (result.confirmed) {
                        return userDataSyncService.replace({ created: syncResourceHandle.created, uri: uri_1.URI.revive(syncResourceHandle.uri) });
                    }
                }
            });
        }
        y(container) {
            const id = `workbench.views.sync.troubleshoot`;
            const name = (0, nls_1.localize)(16, null);
            const treeView = this.f.createInstance(treeView_1.$0ub, id, name);
            const dataProvider = this.f.createInstance(UserDataSyncTroubleshootViewDataProvider);
            treeView.showRefreshAction = true;
            treeView.dataProvider = dataProvider;
            const viewsRegistry = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
            viewsRegistry.registerViews([{
                    id,
                    name,
                    ctorDescriptor: new descriptors_1.$yh(treeView_1.$7ub),
                    when: userDataSync_2.$SAb,
                    canToggleVisibility: true,
                    canMoveView: false,
                    treeView,
                    collapsed: false,
                    order: 500,
                    hideByDefault: true
                }], container);
        }
    };
    exports.$HZb = $HZb;
    exports.$HZb = $HZb = __decorate([
        __param(1, instantiation_1.$Ah),
        __param(2, userDataSync_1.$Pgb),
        __param(3, userDataSyncMachines_1.$sgb),
        __param(4, userDataSync_1.$Qgb)
    ], $HZb);
    let UserDataSyncActivityViewDataProvider = class UserDataSyncActivityViewDataProvider {
        constructor(f, g, h, i, j, k) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.d = new Map();
        }
        async getChildren(element) {
            try {
                if (!element) {
                    return await this.l();
                }
                if (element.profile || element.handle === this.k.defaultProfile.id) {
                    let promise = this.d.get(element.handle);
                    if (!promise) {
                        this.d.set(element.handle, promise = this.o(element.profile));
                    }
                    return await promise;
                }
                if (element.syncResourceHandle) {
                    return await this.n(element);
                }
                return [];
            }
            catch (error) {
                if (!(error instanceof userDataSync_1.$Kgb)) {
                    error = userDataSync_1.$Kgb.toUserDataSyncError(error);
                }
                if (error instanceof userDataSync_1.$Kgb && error.code === "IncompatibleRemoteContent" /* UserDataSyncErrorCode.IncompatibleRemoteContent */) {
                    this.j.notify({
                        severity: notification_1.Severity.Error,
                        message: error.message,
                        actions: {
                            primary: [
                                new actions_2.$gi('reset', (0, nls_1.localize)(17, null), undefined, true, () => this.i.resetSyncedData()),
                            ]
                        }
                    });
                }
                else {
                    this.j.error(error);
                }
                throw error;
            }
        }
        async l() {
            this.d.clear();
            const roots = [];
            const profiles = await this.q();
            if (profiles.length) {
                const profileTreeItem = {
                    handle: this.k.defaultProfile.id,
                    label: { label: this.k.defaultProfile.name },
                    collapsibleState: views_1.TreeItemCollapsibleState.Expanded,
                };
                roots.push(profileTreeItem);
            }
            else {
                const defaultSyncResourceHandles = await this.o();
                roots.push(...defaultSyncResourceHandles);
            }
            for (const profile of profiles) {
                const profileTreeItem = {
                    handle: profile.id,
                    label: { label: profile.name },
                    collapsibleState: views_1.TreeItemCollapsibleState.Collapsed,
                    profile,
                };
                roots.push(profileTreeItem);
            }
            return roots;
        }
        async n(element) {
            const syncResourceHandle = element.syncResourceHandle;
            const associatedResources = await this.g.getAssociatedResources(syncResourceHandle);
            const previousAssociatedResources = syncResourceHandle.previous ? await this.g.getAssociatedResources(syncResourceHandle.previous) : [];
            return associatedResources.map(({ resource, comparableResource }) => {
                const handle = JSON.stringify({ resource: resource.toString(), comparableResource: comparableResource.toString() });
                const previousResource = previousAssociatedResources.find(previous => (0, resources_1.$fg)(previous.resource) === (0, resources_1.$fg)(resource))?.resource;
                return {
                    handle,
                    collapsibleState: views_1.TreeItemCollapsibleState.None,
                    resourceUri: resource,
                    command: previousResource ? {
                        id: editorCommands_1.$Xub,
                        title: '',
                        arguments: [
                            previousResource,
                            resource,
                            (0, nls_1.localize)(18, null, `${(0, resources_1.$fg)(resource)} (${(0, date_1.$6l)(syncResourceHandle.previous.created, true)})`, `${(0, resources_1.$fg)(resource)} (${(0, date_1.$6l)(syncResourceHandle.created, true)})`),
                            undefined
                        ]
                    } : {
                        id: editorCommands_1.$Wub,
                        title: '',
                        arguments: [resource, undefined, undefined]
                    },
                    contextValue: `sync-associatedResource-${syncResourceHandle.syncResource}`
                };
            });
        }
        async o(profile) {
            const treeItems = [];
            const result = await Promise.all(userDataSync_1.$Bgb.map(async (syncResource) => {
                const resourceHandles = await this.r(syncResource, profile);
                return resourceHandles.map((resourceHandle, index) => ({ ...resourceHandle, syncResource, previous: resourceHandles[index + 1] }));
            }));
            const syncResourceHandles = result.flat().sort((a, b) => b.created - a.created);
            for (const syncResourceHandle of syncResourceHandles) {
                const handle = JSON.stringify({ syncResourceHandle, syncResource: syncResourceHandle.syncResource });
                treeItems.push({
                    handle,
                    collapsibleState: views_1.TreeItemCollapsibleState.Collapsed,
                    label: { label: (0, userDataSync_2.$LAb)(syncResourceHandle.syncResource) },
                    description: (0, date_1.$6l)(syncResourceHandle.created, true),
                    themeIcon: themeService_1.$jv,
                    syncResourceHandle,
                    contextValue: `sync-resource-${syncResourceHandle.syncResource}`
                });
            }
            return treeItems;
        }
    };
    UserDataSyncActivityViewDataProvider = __decorate([
        __param(0, userDataSync_1.$Qgb),
        __param(1, userDataSync_1.$Rgb),
        __param(2, userDataSync_1.$Sgb),
        __param(3, userDataSync_2.$KAb),
        __param(4, notification_1.$Yu),
        __param(5, userDataProfile_1.$Ek)
    ], UserDataSyncActivityViewDataProvider);
    class LocalUserDataSyncActivityViewDataProvider extends UserDataSyncActivityViewDataProvider {
        r(syncResource, profile) {
            return this.g.getLocalSyncResourceHandles(syncResource, profile);
        }
        async q() {
            return this.k.profiles
                .filter(p => !p.isDefault)
                .map(p => ({
                id: p.id,
                collection: p.id,
                name: p.name,
            }));
        }
    }
    let RemoteUserDataSyncActivityViewDataProvider = class RemoteUserDataSyncActivityViewDataProvider extends UserDataSyncActivityViewDataProvider {
        constructor(userDataSyncService, userDataSyncResourceProviderService, userDataAutoSyncService, t, userDataSyncWorkbenchService, notificationService, userDataProfilesService) {
            super(userDataSyncService, userDataSyncResourceProviderService, userDataAutoSyncService, userDataSyncWorkbenchService, notificationService, userDataProfilesService);
            this.t = t;
        }
        async getChildren(element) {
            if (!element) {
                this.s = undefined;
            }
            return super.getChildren(element);
        }
        u() {
            if (this.s === undefined) {
                this.s = this.t.getMachines();
            }
            return this.s;
        }
        r(syncResource, profile) {
            return this.g.getRemoteSyncResourceHandles(syncResource, profile);
        }
        q() {
            return this.g.getRemoteSyncedProfiles();
        }
        async n(element) {
            const children = await super.n(element);
            if (children.length) {
                const machineId = await this.g.getMachineId(element.syncResourceHandle);
                if (machineId) {
                    const machines = await this.u();
                    const machine = machines.find(({ id }) => id === machineId);
                    children[0].description = machine?.isCurrent ? (0, nls_1.localize)(19, null) : machine?.name;
                }
            }
            return children;
        }
    };
    RemoteUserDataSyncActivityViewDataProvider = __decorate([
        __param(0, userDataSync_1.$Qgb),
        __param(1, userDataSync_1.$Rgb),
        __param(2, userDataSync_1.$Sgb),
        __param(3, userDataSyncMachines_1.$sgb),
        __param(4, userDataSync_2.$KAb),
        __param(5, notification_1.$Yu),
        __param(6, userDataProfile_1.$Ek)
    ], RemoteUserDataSyncActivityViewDataProvider);
    let ExtractedUserDataSyncActivityViewDataProvider = class ExtractedUserDataSyncActivityViewDataProvider extends UserDataSyncActivityViewDataProvider {
        constructor(activityDataResource, userDataSyncService, userDataSyncResourceProviderService, userDataAutoSyncService, userDataSyncWorkbenchService, notificationService, userDataProfilesService, u, v) {
            super(userDataSyncService, userDataSyncResourceProviderService, userDataAutoSyncService, userDataSyncWorkbenchService, notificationService, userDataProfilesService);
            this.activityDataResource = activityDataResource;
            this.u = u;
            this.v = v;
        }
        async getChildren(element) {
            if (!element) {
                this.s = undefined;
                if (!this.activityDataResource) {
                    return [];
                }
                const stat = await this.u.resolve(this.activityDataResource);
                if (stat.isDirectory) {
                    this.t = this.activityDataResource;
                }
                else {
                    this.t = this.v.extUri.joinPath(this.v.extUri.dirname(this.activityDataResource), 'remoteActivity');
                    try {
                        await this.u.del(this.t, { recursive: true });
                    }
                    catch (e) { /* ignore */ }
                    await this.f.extractActivityData(this.activityDataResource, this.t);
                }
            }
            return super.getChildren(element);
        }
        r(syncResource, profile) {
            return this.g.getLocalSyncResourceHandles(syncResource, profile, this.t);
        }
        async q() {
            return this.g.getLocalSyncedProfiles(this.t);
        }
        async n(element) {
            const children = await super.n(element);
            if (children.length) {
                const machineId = await this.g.getMachineId(element.syncResourceHandle);
                if (machineId) {
                    const machines = await this.z();
                    const machine = machines.find(({ id }) => id === machineId);
                    children[0].description = machine?.isCurrent ? (0, nls_1.localize)(20, null) : machine?.name;
                }
            }
            return children;
        }
        z() {
            if (this.s === undefined) {
                this.s = this.g.getLocalSyncedMachines(this.t);
            }
            return this.s;
        }
    };
    ExtractedUserDataSyncActivityViewDataProvider = __decorate([
        __param(1, userDataSync_1.$Qgb),
        __param(2, userDataSync_1.$Rgb),
        __param(3, userDataSync_1.$Sgb),
        __param(4, userDataSync_2.$KAb),
        __param(5, notification_1.$Yu),
        __param(6, userDataProfile_1.$Ek),
        __param(7, files_1.$6j),
        __param(8, uriIdentity_1.$Ck)
    ], ExtractedUserDataSyncActivityViewDataProvider);
    let UserDataSyncMachinesViewDataProvider = class UserDataSyncMachinesViewDataProvider {
        constructor(f, g, h, i, j, k) {
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
        }
        async getChildren(element) {
            if (!element) {
                this.d = undefined;
            }
            try {
                let machines = await this.l();
                machines = machines.filter(m => !m.disabled).sort((m1, m2) => m1.isCurrent ? -1 : 1);
                this.f.message = machines.length ? undefined : (0, nls_1.localize)(21, null);
                return machines.map(({ id, name, isCurrent, platform }) => ({
                    handle: id,
                    collapsibleState: views_1.TreeItemCollapsibleState.None,
                    label: { label: name },
                    description: isCurrent ? (0, nls_1.localize)(22, null) : undefined,
                    themeIcon: platform && (0, userDataSyncMachines_1.$tgb)(platform) ? codicons_1.$Pj.globe : codicons_1.$Pj.vm,
                    contextValue: 'sync-machine'
                }));
            }
            catch (error) {
                this.i.error(error);
                return [];
            }
        }
        l() {
            if (this.d === undefined) {
                this.d = this.g.getMachines();
            }
            return this.d;
        }
        async disable(machineIds) {
            const machines = await this.l();
            const machinesToDisable = machines.filter(({ id }) => machineIds.includes(id));
            if (!machinesToDisable.length) {
                throw new Error((0, nls_1.localize)(23, null, machineIds.join(',')));
            }
            const result = await this.j.confirm({
                type: 'info',
                message: machinesToDisable.length > 1 ? (0, nls_1.localize)(24, null)
                    : (0, nls_1.localize)(25, null, machinesToDisable[0].name),
                primaryButton: (0, nls_1.localize)(26, null),
            });
            if (!result.confirmed) {
                return false;
            }
            if (machinesToDisable.some(machine => machine.isCurrent)) {
                await this.k.turnoff(false);
            }
            const otherMachinesToDisable = machinesToDisable.filter(machine => !machine.isCurrent)
                .map(machine => ([machine.id, false]));
            if (otherMachinesToDisable.length) {
                await this.g.setEnablements(otherMachinesToDisable);
            }
            return true;
        }
        async rename(machineId) {
            const disposableStore = new lifecycle_1.$jc();
            const inputBox = disposableStore.add(this.h.createInputBox());
            inputBox.placeholder = (0, nls_1.localize)(27, null);
            inputBox.busy = true;
            inputBox.show();
            const machines = await this.l();
            const machine = machines.find(({ id }) => id === machineId);
            if (!machine) {
                inputBox.hide();
                disposableStore.dispose();
                throw new Error((0, nls_1.localize)(28, null, machineId));
            }
            inputBox.busy = false;
            inputBox.value = machine.name;
            const validateMachineName = (machineName) => {
                machineName = machineName.trim();
                return machineName && !machines.some(m => m.id !== machineId && m.name === machineName) ? machineName : null;
            };
            disposableStore.add(inputBox.onDidChangeValue(() => inputBox.validationMessage = validateMachineName(inputBox.value) ? '' : (0, nls_1.localize)(29, null)));
            return new Promise((c, e) => {
                disposableStore.add(inputBox.onDidAccept(async () => {
                    const machineName = validateMachineName(inputBox.value);
                    disposableStore.dispose();
                    if (machineName && machineName !== machine.name) {
                        try {
                            await this.g.renameMachine(machineId, machineName);
                            c(true);
                        }
                        catch (error) {
                            e(error);
                        }
                    }
                    else {
                        c(false);
                    }
                }));
            });
        }
    };
    UserDataSyncMachinesViewDataProvider = __decorate([
        __param(1, userDataSyncMachines_1.$sgb),
        __param(2, quickInput_1.$Gq),
        __param(3, notification_1.$Yu),
        __param(4, dialogs_1.$oA),
        __param(5, userDataSync_2.$KAb)
    ], UserDataSyncMachinesViewDataProvider);
    let UserDataSyncTroubleshootViewDataProvider = class UserDataSyncTroubleshootViewDataProvider {
        constructor(d, f, g, h) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
        }
        async getChildren(element) {
            if (!element) {
                return [{
                        handle: 'SYNC_LOGS',
                        collapsibleState: views_1.TreeItemCollapsibleState.Collapsed,
                        label: { label: (0, nls_1.localize)(30, null) },
                        themeIcon: codicons_1.$Pj.folder,
                    }, {
                        handle: 'LAST_SYNC_STATES',
                        collapsibleState: views_1.TreeItemCollapsibleState.Collapsed,
                        label: { label: (0, nls_1.localize)(31, null) },
                        themeIcon: codicons_1.$Pj.folder,
                    }];
            }
            if (element.handle === 'LAST_SYNC_STATES') {
                return this.i();
            }
            if (element.handle === 'SYNC_LOGS') {
                return this.j();
            }
            return [];
        }
        async i() {
            const result = [];
            for (const syncResource of userDataSync_1.$Bgb) {
                const resource = (0, userDataSync_1.$Dgb)(undefined, syncResource, this.g, this.h.extUri);
                if (await this.d.exists(resource)) {
                    result.push({
                        handle: resource.toString(),
                        label: { label: (0, userDataSync_2.$LAb)(syncResource) },
                        collapsibleState: views_1.TreeItemCollapsibleState.None,
                        resourceUri: resource,
                        command: { id: editorCommands_1.$Wub, title: '', arguments: [resource, undefined, undefined] },
                    });
                }
            }
            return result;
        }
        async j() {
            const logResources = await this.f.getAllLogResources();
            const result = [];
            for (const syncLogResource of logResources) {
                const logFolder = this.h.extUri.dirname(syncLogResource);
                result.push({
                    handle: syncLogResource.toString(),
                    collapsibleState: views_1.TreeItemCollapsibleState.None,
                    resourceUri: syncLogResource,
                    label: { label: this.h.extUri.basename(logFolder) },
                    description: this.h.extUri.isEqual(logFolder, this.g.logsHome) ? (0, nls_1.localize)(32, null) : undefined,
                    command: { id: editorCommands_1.$Wub, title: '', arguments: [syncLogResource, undefined, undefined] },
                });
            }
            return result;
        }
    };
    UserDataSyncTroubleshootViewDataProvider = __decorate([
        __param(0, files_1.$6j),
        __param(1, userDataSync_2.$KAb),
        __param(2, environment_1.$Ih),
        __param(3, uriIdentity_1.$Ck)
    ], UserDataSyncTroubleshootViewDataProvider);
});
//# sourceMappingURL=userDataSyncViews.js.map