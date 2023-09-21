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
define(["require", "exports", "vs/workbench/common/views", "vs/nls", "vs/workbench/browser/parts/views/treeView", "vs/platform/instantiation/common/instantiation", "vs/platform/userDataSync/common/userDataSync", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/base/common/uri", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/userDataSync/common/userDataSync", "vs/base/common/resources", "vs/base/browser/dom", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/configuration/common/configuration", "vs/platform/opener/common/opener", "vs/platform/theme/common/themeService", "vs/platform/telemetry/common/telemetry", "vs/platform/notification/common/notification", "vs/base/common/codicons", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/common/editor"], function (require, exports, views_1, nls_1, treeView_1, instantiation_1, userDataSync_1, actions_1, contextkey_1, uri_1, editorService_1, userDataSync_2, resources_1, DOM, keybinding_1, contextView_1, configuration_1, opener_1, themeService_1, telemetry_1, notification_1, codicons_1, userDataProfile_1, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncConflictsViewPane = void 0;
    let UserDataSyncConflictsViewPane = class UserDataSyncConflictsViewPane extends treeView_1.TreeViewPane {
        constructor(options, editorService, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, notificationService, userDataSyncService, userDataSyncWorkbenchService, userDataSyncEnablementService, userDataProfilesService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, notificationService);
            this.editorService = editorService;
            this.userDataSyncService = userDataSyncService;
            this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.userDataProfilesService = userDataProfilesService;
            this._register(this.userDataSyncService.onDidChangeConflicts(() => this.treeView.refresh()));
            this.registerActions();
        }
        renderTreeView(container) {
            super.renderTreeView(DOM.append(container, DOM.$('')));
            const that = this;
            this.treeView.message = (0, nls_1.localize)('explanation', "Please go through each entry and merge to resolve conflicts.");
            this.treeView.dataProvider = { getChildren() { return that.getTreeItems(); } };
        }
        async getTreeItems() {
            const roots = [];
            const conflictResources = this.userDataSyncService.conflicts
                .map(conflict => conflict.conflicts.map(resourcePreview => ({ ...resourcePreview, syncResource: conflict.syncResource, profile: conflict.profile })))
                .flat()
                .sort((a, b) => a.profile.id === b.profile.id ? 0 : a.profile.isDefault ? -1 : b.profile.isDefault ? 1 : a.profile.name.localeCompare(b.profile.name));
            const conflictResourcesByProfile = [];
            for (const previewResource of conflictResources) {
                let result = conflictResourcesByProfile[conflictResourcesByProfile.length - 1]?.[0].id === previewResource.profile.id ? conflictResourcesByProfile[conflictResourcesByProfile.length - 1][1] : undefined;
                if (!result) {
                    conflictResourcesByProfile.push([previewResource.profile, result = []]);
                }
                result.push(previewResource);
            }
            for (const [profile, resources] of conflictResourcesByProfile) {
                const children = [];
                for (const resource of resources) {
                    const handle = JSON.stringify(resource);
                    const treeItem = {
                        handle,
                        resourceUri: resource.remoteResource,
                        label: { label: (0, resources_1.basename)(resource.remoteResource), strikethrough: resource.mergeState === "accepted" /* MergeState.Accepted */ && (resource.localChange === 3 /* Change.Deleted */ || resource.remoteChange === 3 /* Change.Deleted */) },
                        description: (0, userDataSync_2.getSyncAreaLabel)(resource.syncResource),
                        collapsibleState: views_1.TreeItemCollapsibleState.None,
                        command: { id: `workbench.actions.sync.openConflicts`, title: '', arguments: [{ $treeViewId: '', $treeItemHandle: handle }] },
                        contextValue: `sync-conflict-resource`
                    };
                    children.push(treeItem);
                }
                roots.push({
                    handle: profile.id,
                    label: { label: profile.name },
                    collapsibleState: views_1.TreeItemCollapsibleState.Expanded,
                    children
                });
            }
            return conflictResourcesByProfile.length === 1 && conflictResourcesByProfile[0][0].isDefault ? roots[0].children ?? [] : roots;
        }
        parseHandle(handle) {
            const parsed = JSON.parse(handle);
            return {
                syncResource: parsed.syncResource,
                profile: (0, userDataProfile_1.reviveProfile)(parsed.profile, this.userDataProfilesService.profilesHome.scheme),
                localResource: uri_1.URI.revive(parsed.localResource),
                remoteResource: uri_1.URI.revive(parsed.remoteResource),
                baseResource: uri_1.URI.revive(parsed.baseResource),
                previewResource: uri_1.URI.revive(parsed.previewResource),
                acceptedResource: uri_1.URI.revive(parsed.acceptedResource),
                localChange: parsed.localChange,
                remoteChange: parsed.remoteChange,
                mergeState: parsed.mergeState,
            };
        }
        registerActions() {
            const that = this;
            this._register((0, actions_1.registerAction2)(class OpenConflictsAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.sync.openConflicts`,
                        title: (0, nls_1.localize)({ key: 'workbench.actions.sync.openConflicts', comment: ['This is an action title to show the conflicts between local and remote version of resources'] }, "Show Conflicts"),
                    });
                }
                async run(accessor, handle) {
                    const conflict = that.parseHandle(handle.$treeItemHandle);
                    return that.open(conflict);
                }
            }));
            this._register((0, actions_1.registerAction2)(class AcceptRemoteAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.sync.acceptRemote`,
                        title: (0, nls_1.localize)('workbench.actions.sync.acceptRemote', "Accept Remote"),
                        icon: codicons_1.Codicon.cloudDownload,
                        menu: {
                            id: actions_1.MenuId.ViewItemContext,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', userDataSync_2.SYNC_CONFLICTS_VIEW_ID), contextkey_1.ContextKeyExpr.equals('viewItem', 'sync-conflict-resource')),
                            group: 'inline',
                            order: 1,
                        },
                    });
                }
                async run(accessor, handle) {
                    const conflict = that.parseHandle(handle.$treeItemHandle);
                    await that.userDataSyncWorkbenchService.accept({ syncResource: conflict.syncResource, profile: conflict.profile }, conflict.remoteResource, undefined, that.userDataSyncEnablementService.isEnabled());
                }
            }));
            this._register((0, actions_1.registerAction2)(class AcceptLocalAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.sync.acceptLocal`,
                        title: (0, nls_1.localize)('workbench.actions.sync.acceptLocal', "Accept Local"),
                        icon: codicons_1.Codicon.cloudUpload,
                        menu: {
                            id: actions_1.MenuId.ViewItemContext,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', userDataSync_2.SYNC_CONFLICTS_VIEW_ID), contextkey_1.ContextKeyExpr.equals('viewItem', 'sync-conflict-resource')),
                            group: 'inline',
                            order: 2,
                        },
                    });
                }
                async run(accessor, handle) {
                    const conflict = that.parseHandle(handle.$treeItemHandle);
                    await that.userDataSyncWorkbenchService.accept({ syncResource: conflict.syncResource, profile: conflict.profile }, conflict.localResource, undefined, that.userDataSyncEnablementService.isEnabled());
                }
            }));
        }
        async open(conflictToOpen) {
            if (!this.userDataSyncService.conflicts.some(({ conflicts }) => conflicts.some(({ localResource }) => (0, resources_1.isEqual)(localResource, conflictToOpen.localResource)))) {
                return;
            }
            const remoteResourceName = (0, nls_1.localize)({ key: 'remoteResourceName', comment: ['remote as in file in cloud'] }, "{0} (Remote)", (0, resources_1.basename)(conflictToOpen.remoteResource));
            const localResourceName = (0, nls_1.localize)('localResourceName', "{0} (Local)", (0, resources_1.basename)(conflictToOpen.remoteResource));
            await this.editorService.openEditor({
                input1: { resource: conflictToOpen.remoteResource, label: (0, nls_1.localize)('Theirs', 'Theirs'), description: remoteResourceName },
                input2: { resource: conflictToOpen.localResource, label: (0, nls_1.localize)('Yours', 'Yours'), description: localResourceName },
                base: { resource: conflictToOpen.baseResource },
                result: { resource: conflictToOpen.previewResource },
                options: {
                    preserveFocus: true,
                    revealIfVisible: true,
                    pinned: true,
                    override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id
                }
            });
            return;
        }
    };
    exports.UserDataSyncConflictsViewPane = UserDataSyncConflictsViewPane;
    exports.UserDataSyncConflictsViewPane = UserDataSyncConflictsViewPane = __decorate([
        __param(1, editorService_1.IEditorService),
        __param(2, keybinding_1.IKeybindingService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, views_1.IViewDescriptorService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, opener_1.IOpenerService),
        __param(9, themeService_1.IThemeService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, notification_1.INotificationService),
        __param(12, userDataSync_1.IUserDataSyncService),
        __param(13, userDataSync_2.IUserDataSyncWorkbenchService),
        __param(14, userDataSync_1.IUserDataSyncEnablementService),
        __param(15, userDataProfile_1.IUserDataProfilesService)
    ], UserDataSyncConflictsViewPane);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jQ29uZmxpY3RzVmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3VzZXJEYXRhU3luYy9icm93c2VyL3VzZXJEYXRhU3luY0NvbmZsaWN0c1ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNEJ6RixJQUFNLDZCQUE2QixHQUFuQyxNQUFNLDZCQUE4QixTQUFRLHVCQUFZO1FBRTlELFlBQ0MsT0FBNEIsRUFDSyxhQUE2QixFQUMxQyxpQkFBcUMsRUFDcEMsa0JBQXVDLEVBQ3JDLG9CQUEyQyxFQUM5QyxpQkFBcUMsRUFDakMscUJBQTZDLEVBQzlDLG9CQUEyQyxFQUNsRCxhQUE2QixFQUM5QixZQUEyQixFQUN2QixnQkFBbUMsRUFDaEMsbUJBQXlDLEVBQ3hCLG1CQUF5QyxFQUNoQyw0QkFBMkQsRUFDMUQsNkJBQTZELEVBQ25FLHVCQUFpRDtZQUU1RixLQUFLLENBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLGlCQUFpQixFQUFFLHFCQUFxQixFQUFFLG9CQUFvQixFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQWhCL0ssa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBV3ZCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDaEMsaUNBQTRCLEdBQTVCLDRCQUE0QixDQUErQjtZQUMxRCxrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQWdDO1lBQ25FLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBMEI7WUFHNUYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FB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