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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/views", "vs/nls", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/parts/views/treeView", "vs/platform/instantiation/common/instantiation", "vs/platform/userDataSync/common/userDataSync", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/base/common/uri", "vs/workbench/services/editor/common/editorService", "vs/platform/theme/common/themeService", "vs/base/common/date", "vs/platform/dialogs/common/dialogs", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/codicons", "vs/base/common/actions", "vs/workbench/services/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataSyncMachines", "vs/platform/quickinput/common/quickInput", "vs/platform/notification/common/notification", "vs/base/common/resources", "vs/workbench/browser/parts/editor/editorCommands", "vs/platform/files/common/files", "vs/platform/environment/common/environment", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/commands/common/commands", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/contrib/userDataSync/browser/userDataSyncConflictsView"], function (require, exports, platform_1, views_1, nls_1, descriptors_1, treeView_1, instantiation_1, userDataSync_1, actions_1, contextkey_1, uri_1, editorService_1, themeService_1, date_1, dialogs_1, event_1, lifecycle_1, codicons_1, actions_2, userDataSync_2, userDataSyncMachines_1, quickInput_1, notification_1, resources_1, editorCommands_1, files_1, environment_1, uriIdentity_1, commands_1, userDataProfile_1, userDataSyncConflictsView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncDataViews = void 0;
    let UserDataSyncDataViews = class UserDataSyncDataViews extends lifecycle_1.Disposable {
        constructor(container, instantiationService, userDataSyncEnablementService, userDataSyncMachinesService, userDataSyncService) {
            super();
            this.instantiationService = instantiationService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.userDataSyncMachinesService = userDataSyncMachinesService;
            this.userDataSyncService = userDataSyncService;
            this.registerViews(container);
        }
        registerViews(container) {
            this.registerConflictsView(container);
            this.registerActivityView(container, true);
            this.registerMachinesView(container);
            this.registerActivityView(container, false);
            this.registerTroubleShootView(container);
            this.registerExternalActivityView(container);
        }
        registerConflictsView(container) {
            const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
            const viewName = (0, nls_1.localize)('conflicts', "Conflicts");
            viewsRegistry.registerViews([{
                    id: userDataSync_2.SYNC_CONFLICTS_VIEW_ID,
                    name: viewName,
                    ctorDescriptor: new descriptors_1.SyncDescriptor(userDataSyncConflictsView_1.UserDataSyncConflictsViewPane),
                    when: contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW, userDataSync_2.CONTEXT_HAS_CONFLICTS),
                    canToggleVisibility: false,
                    canMoveView: false,
                    treeView: this.instantiationService.createInstance(treeView_1.TreeView, userDataSync_2.SYNC_CONFLICTS_VIEW_ID, viewName),
                    collapsed: false,
                    order: 100,
                }], container);
        }
        registerMachinesView(container) {
            const id = `workbench.views.sync.machines`;
            const name = (0, nls_1.localize)('synced machines', "Synced Machines");
            const treeView = this.instantiationService.createInstance(treeView_1.TreeView, id, name);
            const dataProvider = this.instantiationService.createInstance(UserDataSyncMachinesViewDataProvider, treeView);
            treeView.showRefreshAction = true;
            treeView.canSelectMany = true;
            treeView.dataProvider = dataProvider;
            this._register(event_1.Event.any(this.userDataSyncMachinesService.onDidChange, this.userDataSyncService.onDidResetRemote)(() => treeView.refresh()));
            const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
            viewsRegistry.registerViews([{
                    id,
                    name,
                    ctorDescriptor: new descriptors_1.SyncDescriptor(treeView_1.TreeViewPane),
                    when: contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */), userDataSync_2.CONTEXT_ACCOUNT_STATE.isEqualTo("available" /* AccountStatus.Available */), userDataSync_2.CONTEXT_ENABLE_ACTIVITY_VIEWS),
                    canToggleVisibility: true,
                    canMoveView: false,
                    treeView,
                    collapsed: false,
                    order: 300,
                }], container);
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.sync.editMachineName`,
                        title: (0, nls_1.localize)('workbench.actions.sync.editMachineName', "Edit Name"),
                        icon: codicons_1.Codicon.edit,
                        menu: {
                            id: actions_1.MenuId.ViewItemContext,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', id)),
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
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.sync.turnOffSyncOnMachine`,
                        title: (0, nls_1.localize)('workbench.actions.sync.turnOffSyncOnMachine', "Turn off Settings Sync"),
                        menu: {
                            id: actions_1.MenuId.ViewItemContext,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', id), contextkey_1.ContextKeyExpr.equals('viewItem', 'sync-machine')),
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
        registerActivityView(container, remote) {
            const id = `workbench.views.sync.${remote ? 'remote' : 'local'}Activity`;
            const name = remote ? (0, nls_1.localize)('remote sync activity title', "Sync Activity (Remote)") : (0, nls_1.localize)('local sync activity title', "Sync Activity (Local)");
            const treeView = this.instantiationService.createInstance(treeView_1.TreeView, id, name);
            treeView.showCollapseAllAction = true;
            treeView.showRefreshAction = true;
            treeView.dataProvider = remote ? this.instantiationService.createInstance(RemoteUserDataSyncActivityViewDataProvider)
                : this.instantiationService.createInstance(LocalUserDataSyncActivityViewDataProvider);
            this._register(event_1.Event.any(this.userDataSyncEnablementService.onDidChangeResourceEnablement, this.userDataSyncEnablementService.onDidChangeEnablement, this.userDataSyncService.onDidResetLocal, this.userDataSyncService.onDidResetRemote)(() => treeView.refresh()));
            const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
            viewsRegistry.registerViews([{
                    id,
                    name,
                    ctorDescriptor: new descriptors_1.SyncDescriptor(treeView_1.TreeViewPane),
                    when: contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* SyncStatus.Uninitialized */), userDataSync_2.CONTEXT_ACCOUNT_STATE.isEqualTo("available" /* AccountStatus.Available */), userDataSync_2.CONTEXT_ENABLE_ACTIVITY_VIEWS),
                    canToggleVisibility: true,
                    canMoveView: false,
                    treeView,
                    collapsed: false,
                    order: remote ? 200 : 400,
                    hideByDefault: !remote,
                }], container);
            this.registerDataViewActions(id);
        }
        registerExternalActivityView(container) {
            const id = `workbench.views.sync.externalActivity`;
            const name = (0, nls_1.localize)('downloaded sync activity title', "Sync Activity (Developer)");
            const dataProvider = this.instantiationService.createInstance(ExtractedUserDataSyncActivityViewDataProvider, undefined);
            const treeView = this.instantiationService.createInstance(treeView_1.TreeView, id, name);
            treeView.showCollapseAllAction = false;
            treeView.showRefreshAction = false;
            treeView.dataProvider = dataProvider;
            const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
            viewsRegistry.registerViews([{
                    id,
                    name,
                    ctorDescriptor: new descriptors_1.SyncDescriptor(treeView_1.TreeViewPane),
                    when: userDataSync_2.CONTEXT_ENABLE_ACTIVITY_VIEWS,
                    canToggleVisibility: true,
                    canMoveView: false,
                    treeView,
                    collapsed: false,
                    hideByDefault: false,
                }], container);
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.sync.extractActivity`,
                        title: (0, nls_1.localize)('workbench.actions.sync.extractActivity', "Extract Sync Activity"),
                        icon: codicons_1.Codicon.cloudUpload,
                        menu: {
                            id: actions_1.MenuId.ViewTitle,
                            when: contextkey_1.ContextKeyExpr.equals('view', id),
                            group: 'navigation',
                        },
                    });
                }
                async run(accessor) {
                    const fileDialogService = accessor.get(dialogs_1.IFileDialogService);
                    const result = await fileDialogService.showOpenDialog({
                        title: (0, nls_1.localize)('select sync activity file', "Select Sync Activity File or Folder"),
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
        registerDataViewActions(viewId) {
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.sync.resolveResource`,
                        title: (0, nls_1.localize)('workbench.actions.sync.resolveResourceRef', "Show raw JSON sync data"),
                        menu: {
                            id: actions_1.MenuId.ViewItemContext,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', viewId), contextkey_1.ContextKeyExpr.regex('viewItem', /sync-resource-.*/i))
                        },
                    });
                }
                async run(accessor, handle) {
                    const { resource } = JSON.parse(handle.$treeItemHandle);
                    const editorService = accessor.get(editorService_1.IEditorService);
                    await editorService.openEditor({ resource: uri_1.URI.parse(resource), options: { pinned: true } });
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.sync.compareWithLocal`,
                        title: (0, nls_1.localize)('workbench.actions.sync.compareWithLocal', "Compare with Local"),
                        menu: {
                            id: actions_1.MenuId.ViewItemContext,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', viewId), contextkey_1.ContextKeyExpr.regex('viewItem', /sync-associatedResource-.*/i))
                        },
                    });
                }
                async run(accessor, handle) {
                    const commandService = accessor.get(commands_1.ICommandService);
                    const { resource, comparableResource } = JSON.parse(handle.$treeItemHandle);
                    const remoteResource = uri_1.URI.parse(resource);
                    const localResource = uri_1.URI.parse(comparableResource);
                    return commandService.executeCommand(editorCommands_1.API_OPEN_DIFF_EDITOR_COMMAND_ID, remoteResource, localResource, (0, nls_1.localize)('remoteToLocalDiff', "{0} ↔ {1}", (0, nls_1.localize)({ key: 'leftResourceName', comment: ['remote as in file in cloud'] }, "{0} (Remote)", (0, resources_1.basename)(remoteResource)), (0, nls_1.localize)({ key: 'rightResourceName', comment: ['local as in file in disk'] }, "{0} (Local)", (0, resources_1.basename)(localResource))), undefined);
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.sync.replaceCurrent`,
                        title: (0, nls_1.localize)('workbench.actions.sync.replaceCurrent', "Restore"),
                        icon: codicons_1.Codicon.discard,
                        menu: {
                            id: actions_1.MenuId.ViewItemContext,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', viewId), contextkey_1.ContextKeyExpr.regex('viewItem', /sync-resource-.*/i)),
                            group: 'inline',
                        },
                    });
                }
                async run(accessor, handle) {
                    const dialogService = accessor.get(dialogs_1.IDialogService);
                    const userDataSyncService = accessor.get(userDataSync_1.IUserDataSyncService);
                    const { syncResourceHandle, syncResource } = JSON.parse(handle.$treeItemHandle);
                    const result = await dialogService.confirm({
                        message: (0, nls_1.localize)({ key: 'confirm replace', comment: ['A confirmation message to replace current user data (settings, extensions, keybindings, snippets) with selected version'] }, "Would you like to replace your current {0} with selected?", (0, userDataSync_2.getSyncAreaLabel)(syncResource)),
                        type: 'info',
                        title: userDataSync_2.SYNC_TITLE
                    });
                    if (result.confirmed) {
                        return userDataSyncService.replace({ created: syncResourceHandle.created, uri: uri_1.URI.revive(syncResourceHandle.uri) });
                    }
                }
            });
        }
        registerTroubleShootView(container) {
            const id = `workbench.views.sync.troubleshoot`;
            const name = (0, nls_1.localize)('troubleshoot', "Troubleshoot");
            const treeView = this.instantiationService.createInstance(treeView_1.TreeView, id, name);
            const dataProvider = this.instantiationService.createInstance(UserDataSyncTroubleshootViewDataProvider);
            treeView.showRefreshAction = true;
            treeView.dataProvider = dataProvider;
            const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
            viewsRegistry.registerViews([{
                    id,
                    name,
                    ctorDescriptor: new descriptors_1.SyncDescriptor(treeView_1.TreeViewPane),
                    when: userDataSync_2.CONTEXT_ENABLE_ACTIVITY_VIEWS,
                    canToggleVisibility: true,
                    canMoveView: false,
                    treeView,
                    collapsed: false,
                    order: 500,
                    hideByDefault: true
                }], container);
        }
    };
    exports.UserDataSyncDataViews = UserDataSyncDataViews;
    exports.UserDataSyncDataViews = UserDataSyncDataViews = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, userDataSync_1.IUserDataSyncEnablementService),
        __param(3, userDataSyncMachines_1.IUserDataSyncMachinesService),
        __param(4, userDataSync_1.IUserDataSyncService)
    ], UserDataSyncDataViews);
    let UserDataSyncActivityViewDataProvider = class UserDataSyncActivityViewDataProvider {
        constructor(userDataSyncService, userDataSyncResourceProviderService, userDataAutoSyncService, userDataSyncWorkbenchService, notificationService, userDataProfilesService) {
            this.userDataSyncService = userDataSyncService;
            this.userDataSyncResourceProviderService = userDataSyncResourceProviderService;
            this.userDataAutoSyncService = userDataAutoSyncService;
            this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
            this.notificationService = notificationService;
            this.userDataProfilesService = userDataProfilesService;
            this.syncResourceHandlesByProfile = new Map();
        }
        async getChildren(element) {
            try {
                if (!element) {
                    return await this.getRoots();
                }
                if (element.profile || element.handle === this.userDataProfilesService.defaultProfile.id) {
                    let promise = this.syncResourceHandlesByProfile.get(element.handle);
                    if (!promise) {
                        this.syncResourceHandlesByProfile.set(element.handle, promise = this.getSyncResourceHandles(element.profile));
                    }
                    return await promise;
                }
                if (element.syncResourceHandle) {
                    return await this.getChildrenForSyncResourceTreeItem(element);
                }
                return [];
            }
            catch (error) {
                if (!(error instanceof userDataSync_1.UserDataSyncError)) {
                    error = userDataSync_1.UserDataSyncError.toUserDataSyncError(error);
                }
                if (error instanceof userDataSync_1.UserDataSyncError && error.code === "IncompatibleRemoteContent" /* UserDataSyncErrorCode.IncompatibleRemoteContent */) {
                    this.notificationService.notify({
                        severity: notification_1.Severity.Error,
                        message: error.message,
                        actions: {
                            primary: [
                                new actions_2.Action('reset', (0, nls_1.localize)('reset', "Reset Synced Data"), undefined, true, () => this.userDataSyncWorkbenchService.resetSyncedData()),
                            ]
                        }
                    });
                }
                else {
                    this.notificationService.error(error);
                }
                throw error;
            }
        }
        async getRoots() {
            this.syncResourceHandlesByProfile.clear();
            const roots = [];
            const profiles = await this.getProfiles();
            if (profiles.length) {
                const profileTreeItem = {
                    handle: this.userDataProfilesService.defaultProfile.id,
                    label: { label: this.userDataProfilesService.defaultProfile.name },
                    collapsibleState: views_1.TreeItemCollapsibleState.Expanded,
                };
                roots.push(profileTreeItem);
            }
            else {
                const defaultSyncResourceHandles = await this.getSyncResourceHandles();
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
        async getChildrenForSyncResourceTreeItem(element) {
            const syncResourceHandle = element.syncResourceHandle;
            const associatedResources = await this.userDataSyncResourceProviderService.getAssociatedResources(syncResourceHandle);
            const previousAssociatedResources = syncResourceHandle.previous ? await this.userDataSyncResourceProviderService.getAssociatedResources(syncResourceHandle.previous) : [];
            return associatedResources.map(({ resource, comparableResource }) => {
                const handle = JSON.stringify({ resource: resource.toString(), comparableResource: comparableResource.toString() });
                const previousResource = previousAssociatedResources.find(previous => (0, resources_1.basename)(previous.resource) === (0, resources_1.basename)(resource))?.resource;
                return {
                    handle,
                    collapsibleState: views_1.TreeItemCollapsibleState.None,
                    resourceUri: resource,
                    command: previousResource ? {
                        id: editorCommands_1.API_OPEN_DIFF_EDITOR_COMMAND_ID,
                        title: '',
                        arguments: [
                            previousResource,
                            resource,
                            (0, nls_1.localize)('sideBySideLabels', "{0} ↔ {1}", `${(0, resources_1.basename)(resource)} (${(0, date_1.fromNow)(syncResourceHandle.previous.created, true)})`, `${(0, resources_1.basename)(resource)} (${(0, date_1.fromNow)(syncResourceHandle.created, true)})`),
                            undefined
                        ]
                    } : {
                        id: editorCommands_1.API_OPEN_EDITOR_COMMAND_ID,
                        title: '',
                        arguments: [resource, undefined, undefined]
                    },
                    contextValue: `sync-associatedResource-${syncResourceHandle.syncResource}`
                };
            });
        }
        async getSyncResourceHandles(profile) {
            const treeItems = [];
            const result = await Promise.all(userDataSync_1.ALL_SYNC_RESOURCES.map(async (syncResource) => {
                const resourceHandles = await this.getResourceHandles(syncResource, profile);
                return resourceHandles.map((resourceHandle, index) => ({ ...resourceHandle, syncResource, previous: resourceHandles[index + 1] }));
            }));
            const syncResourceHandles = result.flat().sort((a, b) => b.created - a.created);
            for (const syncResourceHandle of syncResourceHandles) {
                const handle = JSON.stringify({ syncResourceHandle, syncResource: syncResourceHandle.syncResource });
                treeItems.push({
                    handle,
                    collapsibleState: views_1.TreeItemCollapsibleState.Collapsed,
                    label: { label: (0, userDataSync_2.getSyncAreaLabel)(syncResourceHandle.syncResource) },
                    description: (0, date_1.fromNow)(syncResourceHandle.created, true),
                    themeIcon: themeService_1.FolderThemeIcon,
                    syncResourceHandle,
                    contextValue: `sync-resource-${syncResourceHandle.syncResource}`
                });
            }
            return treeItems;
        }
    };
    UserDataSyncActivityViewDataProvider = __decorate([
        __param(0, userDataSync_1.IUserDataSyncService),
        __param(1, userDataSync_1.IUserDataSyncResourceProviderService),
        __param(2, userDataSync_1.IUserDataAutoSyncService),
        __param(3, userDataSync_2.IUserDataSyncWorkbenchService),
        __param(4, notification_1.INotificationService),
        __param(5, userDataProfile_1.IUserDataProfilesService)
    ], UserDataSyncActivityViewDataProvider);
    class LocalUserDataSyncActivityViewDataProvider extends UserDataSyncActivityViewDataProvider {
        getResourceHandles(syncResource, profile) {
            return this.userDataSyncResourceProviderService.getLocalSyncResourceHandles(syncResource, profile);
        }
        async getProfiles() {
            return this.userDataProfilesService.profiles
                .filter(p => !p.isDefault)
                .map(p => ({
                id: p.id,
                collection: p.id,
                name: p.name,
            }));
        }
    }
    let RemoteUserDataSyncActivityViewDataProvider = class RemoteUserDataSyncActivityViewDataProvider extends UserDataSyncActivityViewDataProvider {
        constructor(userDataSyncService, userDataSyncResourceProviderService, userDataAutoSyncService, userDataSyncMachinesService, userDataSyncWorkbenchService, notificationService, userDataProfilesService) {
            super(userDataSyncService, userDataSyncResourceProviderService, userDataAutoSyncService, userDataSyncWorkbenchService, notificationService, userDataProfilesService);
            this.userDataSyncMachinesService = userDataSyncMachinesService;
        }
        async getChildren(element) {
            if (!element) {
                this.machinesPromise = undefined;
            }
            return super.getChildren(element);
        }
        getMachines() {
            if (this.machinesPromise === undefined) {
                this.machinesPromise = this.userDataSyncMachinesService.getMachines();
            }
            return this.machinesPromise;
        }
        getResourceHandles(syncResource, profile) {
            return this.userDataSyncResourceProviderService.getRemoteSyncResourceHandles(syncResource, profile);
        }
        getProfiles() {
            return this.userDataSyncResourceProviderService.getRemoteSyncedProfiles();
        }
        async getChildrenForSyncResourceTreeItem(element) {
            const children = await super.getChildrenForSyncResourceTreeItem(element);
            if (children.length) {
                const machineId = await this.userDataSyncResourceProviderService.getMachineId(element.syncResourceHandle);
                if (machineId) {
                    const machines = await this.getMachines();
                    const machine = machines.find(({ id }) => id === machineId);
                    children[0].description = machine?.isCurrent ? (0, nls_1.localize)({ key: 'current', comment: ['Represents current machine'] }, "Current") : machine?.name;
                }
            }
            return children;
        }
    };
    RemoteUserDataSyncActivityViewDataProvider = __decorate([
        __param(0, userDataSync_1.IUserDataSyncService),
        __param(1, userDataSync_1.IUserDataSyncResourceProviderService),
        __param(2, userDataSync_1.IUserDataAutoSyncService),
        __param(3, userDataSyncMachines_1.IUserDataSyncMachinesService),
        __param(4, userDataSync_2.IUserDataSyncWorkbenchService),
        __param(5, notification_1.INotificationService),
        __param(6, userDataProfile_1.IUserDataProfilesService)
    ], RemoteUserDataSyncActivityViewDataProvider);
    let ExtractedUserDataSyncActivityViewDataProvider = class ExtractedUserDataSyncActivityViewDataProvider extends UserDataSyncActivityViewDataProvider {
        constructor(activityDataResource, userDataSyncService, userDataSyncResourceProviderService, userDataAutoSyncService, userDataSyncWorkbenchService, notificationService, userDataProfilesService, fileService, uriIdentityService) {
            super(userDataSyncService, userDataSyncResourceProviderService, userDataAutoSyncService, userDataSyncWorkbenchService, notificationService, userDataProfilesService);
            this.activityDataResource = activityDataResource;
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
        }
        async getChildren(element) {
            if (!element) {
                this.machinesPromise = undefined;
                if (!this.activityDataResource) {
                    return [];
                }
                const stat = await this.fileService.resolve(this.activityDataResource);
                if (stat.isDirectory) {
                    this.activityDataLocation = this.activityDataResource;
                }
                else {
                    this.activityDataLocation = this.uriIdentityService.extUri.joinPath(this.uriIdentityService.extUri.dirname(this.activityDataResource), 'remoteActivity');
                    try {
                        await this.fileService.del(this.activityDataLocation, { recursive: true });
                    }
                    catch (e) { /* ignore */ }
                    await this.userDataSyncService.extractActivityData(this.activityDataResource, this.activityDataLocation);
                }
            }
            return super.getChildren(element);
        }
        getResourceHandles(syncResource, profile) {
            return this.userDataSyncResourceProviderService.getLocalSyncResourceHandles(syncResource, profile, this.activityDataLocation);
        }
        async getProfiles() {
            return this.userDataSyncResourceProviderService.getLocalSyncedProfiles(this.activityDataLocation);
        }
        async getChildrenForSyncResourceTreeItem(element) {
            const children = await super.getChildrenForSyncResourceTreeItem(element);
            if (children.length) {
                const machineId = await this.userDataSyncResourceProviderService.getMachineId(element.syncResourceHandle);
                if (machineId) {
                    const machines = await this.getMachines();
                    const machine = machines.find(({ id }) => id === machineId);
                    children[0].description = machine?.isCurrent ? (0, nls_1.localize)({ key: 'current', comment: ['Represents current machine'] }, "Current") : machine?.name;
                }
            }
            return children;
        }
        getMachines() {
            if (this.machinesPromise === undefined) {
                this.machinesPromise = this.userDataSyncResourceProviderService.getLocalSyncedMachines(this.activityDataLocation);
            }
            return this.machinesPromise;
        }
    };
    ExtractedUserDataSyncActivityViewDataProvider = __decorate([
        __param(1, userDataSync_1.IUserDataSyncService),
        __param(2, userDataSync_1.IUserDataSyncResourceProviderService),
        __param(3, userDataSync_1.IUserDataAutoSyncService),
        __param(4, userDataSync_2.IUserDataSyncWorkbenchService),
        __param(5, notification_1.INotificationService),
        __param(6, userDataProfile_1.IUserDataProfilesService),
        __param(7, files_1.IFileService),
        __param(8, uriIdentity_1.IUriIdentityService)
    ], ExtractedUserDataSyncActivityViewDataProvider);
    let UserDataSyncMachinesViewDataProvider = class UserDataSyncMachinesViewDataProvider {
        constructor(treeView, userDataSyncMachinesService, quickInputService, notificationService, dialogService, userDataSyncWorkbenchService) {
            this.treeView = treeView;
            this.userDataSyncMachinesService = userDataSyncMachinesService;
            this.quickInputService = quickInputService;
            this.notificationService = notificationService;
            this.dialogService = dialogService;
            this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
        }
        async getChildren(element) {
            if (!element) {
                this.machinesPromise = undefined;
            }
            try {
                let machines = await this.getMachines();
                machines = machines.filter(m => !m.disabled).sort((m1, m2) => m1.isCurrent ? -1 : 1);
                this.treeView.message = machines.length ? undefined : (0, nls_1.localize)('no machines', "No Machines");
                return machines.map(({ id, name, isCurrent, platform }) => ({
                    handle: id,
                    collapsibleState: views_1.TreeItemCollapsibleState.None,
                    label: { label: name },
                    description: isCurrent ? (0, nls_1.localize)({ key: 'current', comment: ['Current machine'] }, "Current") : undefined,
                    themeIcon: platform && (0, userDataSyncMachines_1.isWebPlatform)(platform) ? codicons_1.Codicon.globe : codicons_1.Codicon.vm,
                    contextValue: 'sync-machine'
                }));
            }
            catch (error) {
                this.notificationService.error(error);
                return [];
            }
        }
        getMachines() {
            if (this.machinesPromise === undefined) {
                this.machinesPromise = this.userDataSyncMachinesService.getMachines();
            }
            return this.machinesPromise;
        }
        async disable(machineIds) {
            const machines = await this.getMachines();
            const machinesToDisable = machines.filter(({ id }) => machineIds.includes(id));
            if (!machinesToDisable.length) {
                throw new Error((0, nls_1.localize)('not found', "machine not found with id: {0}", machineIds.join(',')));
            }
            const result = await this.dialogService.confirm({
                type: 'info',
                message: machinesToDisable.length > 1 ? (0, nls_1.localize)('turn off sync on multiple machines', "Are you sure you want to turn off sync on selected machines?")
                    : (0, nls_1.localize)('turn off sync on machine', "Are you sure you want to turn off sync on {0}?", machinesToDisable[0].name),
                primaryButton: (0, nls_1.localize)({ key: 'turn off', comment: ['&& denotes a mnemonic'] }, "&&Turn off"),
            });
            if (!result.confirmed) {
                return false;
            }
            if (machinesToDisable.some(machine => machine.isCurrent)) {
                await this.userDataSyncWorkbenchService.turnoff(false);
            }
            const otherMachinesToDisable = machinesToDisable.filter(machine => !machine.isCurrent)
                .map(machine => ([machine.id, false]));
            if (otherMachinesToDisable.length) {
                await this.userDataSyncMachinesService.setEnablements(otherMachinesToDisable);
            }
            return true;
        }
        async rename(machineId) {
            const disposableStore = new lifecycle_1.DisposableStore();
            const inputBox = disposableStore.add(this.quickInputService.createInputBox());
            inputBox.placeholder = (0, nls_1.localize)('placeholder', "Enter the name of the machine");
            inputBox.busy = true;
            inputBox.show();
            const machines = await this.getMachines();
            const machine = machines.find(({ id }) => id === machineId);
            if (!machine) {
                inputBox.hide();
                disposableStore.dispose();
                throw new Error((0, nls_1.localize)('not found', "machine not found with id: {0}", machineId));
            }
            inputBox.busy = false;
            inputBox.value = machine.name;
            const validateMachineName = (machineName) => {
                machineName = machineName.trim();
                return machineName && !machines.some(m => m.id !== machineId && m.name === machineName) ? machineName : null;
            };
            disposableStore.add(inputBox.onDidChangeValue(() => inputBox.validationMessage = validateMachineName(inputBox.value) ? '' : (0, nls_1.localize)('valid message', "Machine name should be unique and not empty")));
            return new Promise((c, e) => {
                disposableStore.add(inputBox.onDidAccept(async () => {
                    const machineName = validateMachineName(inputBox.value);
                    disposableStore.dispose();
                    if (machineName && machineName !== machine.name) {
                        try {
                            await this.userDataSyncMachinesService.renameMachine(machineId, machineName);
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
        __param(1, userDataSyncMachines_1.IUserDataSyncMachinesService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, notification_1.INotificationService),
        __param(4, dialogs_1.IDialogService),
        __param(5, userDataSync_2.IUserDataSyncWorkbenchService)
    ], UserDataSyncMachinesViewDataProvider);
    let UserDataSyncTroubleshootViewDataProvider = class UserDataSyncTroubleshootViewDataProvider {
        constructor(fileService, userDataSyncWorkbenchService, environmentService, uriIdentityService) {
            this.fileService = fileService;
            this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
            this.environmentService = environmentService;
            this.uriIdentityService = uriIdentityService;
        }
        async getChildren(element) {
            if (!element) {
                return [{
                        handle: 'SYNC_LOGS',
                        collapsibleState: views_1.TreeItemCollapsibleState.Collapsed,
                        label: { label: (0, nls_1.localize)('sync logs', "Logs") },
                        themeIcon: codicons_1.Codicon.folder,
                    }, {
                        handle: 'LAST_SYNC_STATES',
                        collapsibleState: views_1.TreeItemCollapsibleState.Collapsed,
                        label: { label: (0, nls_1.localize)('last sync states', "Last Synced Remotes") },
                        themeIcon: codicons_1.Codicon.folder,
                    }];
            }
            if (element.handle === 'LAST_SYNC_STATES') {
                return this.getLastSyncStates();
            }
            if (element.handle === 'SYNC_LOGS') {
                return this.getSyncLogs();
            }
            return [];
        }
        async getLastSyncStates() {
            const result = [];
            for (const syncResource of userDataSync_1.ALL_SYNC_RESOURCES) {
                const resource = (0, userDataSync_1.getLastSyncResourceUri)(undefined, syncResource, this.environmentService, this.uriIdentityService.extUri);
                if (await this.fileService.exists(resource)) {
                    result.push({
                        handle: resource.toString(),
                        label: { label: (0, userDataSync_2.getSyncAreaLabel)(syncResource) },
                        collapsibleState: views_1.TreeItemCollapsibleState.None,
                        resourceUri: resource,
                        command: { id: editorCommands_1.API_OPEN_EDITOR_COMMAND_ID, title: '', arguments: [resource, undefined, undefined] },
                    });
                }
            }
            return result;
        }
        async getSyncLogs() {
            const logResources = await this.userDataSyncWorkbenchService.getAllLogResources();
            const result = [];
            for (const syncLogResource of logResources) {
                const logFolder = this.uriIdentityService.extUri.dirname(syncLogResource);
                result.push({
                    handle: syncLogResource.toString(),
                    collapsibleState: views_1.TreeItemCollapsibleState.None,
                    resourceUri: syncLogResource,
                    label: { label: this.uriIdentityService.extUri.basename(logFolder) },
                    description: this.uriIdentityService.extUri.isEqual(logFolder, this.environmentService.logsHome) ? (0, nls_1.localize)({ key: 'current', comment: ['Represents current log file'] }, "Current") : undefined,
                    command: { id: editorCommands_1.API_OPEN_EDITOR_COMMAND_ID, title: '', arguments: [syncLogResource, undefined, undefined] },
                });
            }
            return result;
        }
    };
    UserDataSyncTroubleshootViewDataProvider = __decorate([
        __param(0, files_1.IFileService),
        __param(1, userDataSync_2.IUserDataSyncWorkbenchService),
        __param(2, environment_1.IEnvironmentService),
        __param(3, uriIdentity_1.IUriIdentityService)
    ], UserDataSyncTroubleshootViewDataProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jVmlld3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi91c2VyRGF0YVN5bmMvYnJvd3Nlci91c2VyRGF0YVN5bmNWaWV3cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFpQ3pGLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXNCLFNBQVEsc0JBQVU7UUFFcEQsWUFDQyxTQUF3QixFQUNnQixvQkFBMkMsRUFDbEMsNkJBQTZELEVBQy9ELDJCQUF5RCxFQUNqRSxtQkFBeUM7WUFFaEYsS0FBSyxFQUFFLENBQUM7WUFMZ0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNsQyxrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQWdDO1lBQy9ELGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBOEI7WUFDakUsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUdoRixJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFTyxhQUFhLENBQUMsU0FBd0I7WUFDN0MsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXRDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXJDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRU8scUJBQXFCLENBQUMsU0FBd0I7WUFDckQsTUFBTSxhQUFhLEdBQUcsbUJBQVEsQ0FBQyxF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