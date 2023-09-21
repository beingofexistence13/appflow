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
define(["require", "exports", "vs/workbench/common/views", "vs/nls!vs/workbench/contrib/userDataSync/browser/userDataSyncConflictsView", "vs/workbench/browser/parts/views/treeView", "vs/platform/instantiation/common/instantiation", "vs/platform/userDataSync/common/userDataSync", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/base/common/uri", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/userDataSync/common/userDataSync", "vs/base/common/resources", "vs/base/browser/dom", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/configuration/common/configuration", "vs/platform/opener/common/opener", "vs/platform/theme/common/themeService", "vs/platform/telemetry/common/telemetry", "vs/platform/notification/common/notification", "vs/base/common/codicons", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/common/editor"], function (require, exports, views_1, nls_1, treeView_1, instantiation_1, userDataSync_1, actions_1, contextkey_1, uri_1, editorService_1, userDataSync_2, resources_1, DOM, keybinding_1, contextView_1, configuration_1, opener_1, themeService_1, telemetry_1, notification_1, codicons_1, userDataProfile_1, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$GZb = void 0;
    let $GZb = class $GZb extends treeView_1.$7ub {
        constructor(options, ab, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, notificationService, sb, Wb, Xb, Yb) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, notificationService);
            this.ab = ab;
            this.sb = sb;
            this.Wb = Wb;
            this.Xb = Xb;
            this.Yb = Yb;
            this.B(this.sb.onDidChangeConflicts(() => this.f.refresh()));
            this.bc();
        }
        n(container) {
            super.n(DOM.$0O(container, DOM.$('')));
            const that = this;
            this.f.message = (0, nls_1.localize)(0, null);
            this.f.dataProvider = { getChildren() { return that.$b(); } };
        }
        async $b() {
            const roots = [];
            const conflictResources = this.sb.conflicts
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
                        label: { label: (0, resources_1.$fg)(resource.remoteResource), strikethrough: resource.mergeState === "accepted" /* MergeState.Accepted */ && (resource.localChange === 3 /* Change.Deleted */ || resource.remoteChange === 3 /* Change.Deleted */) },
                        description: (0, userDataSync_2.$LAb)(resource.syncResource),
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
        ac(handle) {
            const parsed = JSON.parse(handle);
            return {
                syncResource: parsed.syncResource,
                profile: (0, userDataProfile_1.$Fk)(parsed.profile, this.Yb.profilesHome.scheme),
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
        bc() {
            const that = this;
            this.B((0, actions_1.$Xu)(class OpenConflictsAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id: `workbench.actions.sync.openConflicts`,
                        title: (0, nls_1.localize)(1, null),
                    });
                }
                async run(accessor, handle) {
                    const conflict = that.ac(handle.$treeItemHandle);
                    return that.open(conflict);
                }
            }));
            this.B((0, actions_1.$Xu)(class AcceptRemoteAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id: `workbench.actions.sync.acceptRemote`,
                        title: (0, nls_1.localize)(2, null),
                        icon: codicons_1.$Pj.cloudDownload,
                        menu: {
                            id: actions_1.$Ru.ViewItemContext,
                            when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', userDataSync_2.$YAb), contextkey_1.$Ii.equals('viewItem', 'sync-conflict-resource')),
                            group: 'inline',
                            order: 1,
                        },
                    });
                }
                async run(accessor, handle) {
                    const conflict = that.ac(handle.$treeItemHandle);
                    await that.Wb.accept({ syncResource: conflict.syncResource, profile: conflict.profile }, conflict.remoteResource, undefined, that.Xb.isEnabled());
                }
            }));
            this.B((0, actions_1.$Xu)(class AcceptLocalAction extends actions_1.$Wu {
                constructor() {
                    super({
                        id: `workbench.actions.sync.acceptLocal`,
                        title: (0, nls_1.localize)(3, null),
                        icon: codicons_1.$Pj.cloudUpload,
                        menu: {
                            id: actions_1.$Ru.ViewItemContext,
                            when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', userDataSync_2.$YAb), contextkey_1.$Ii.equals('viewItem', 'sync-conflict-resource')),
                            group: 'inline',
                            order: 2,
                        },
                    });
                }
                async run(accessor, handle) {
                    const conflict = that.ac(handle.$treeItemHandle);
                    await that.Wb.accept({ syncResource: conflict.syncResource, profile: conflict.profile }, conflict.localResource, undefined, that.Xb.isEnabled());
                }
            }));
        }
        async open(conflictToOpen) {
            if (!this.sb.conflicts.some(({ conflicts }) => conflicts.some(({ localResource }) => (0, resources_1.$bg)(localResource, conflictToOpen.localResource)))) {
                return;
            }
            const remoteResourceName = (0, nls_1.localize)(4, null, (0, resources_1.$fg)(conflictToOpen.remoteResource));
            const localResourceName = (0, nls_1.localize)(5, null, (0, resources_1.$fg)(conflictToOpen.remoteResource));
            await this.ab.openEditor({
                input1: { resource: conflictToOpen.remoteResource, label: (0, nls_1.localize)(6, null), description: remoteResourceName },
                input2: { resource: conflictToOpen.localResource, label: (0, nls_1.localize)(7, null), description: localResourceName },
                base: { resource: conflictToOpen.baseResource },
                result: { resource: conflictToOpen.previewResource },
                options: {
                    preserveFocus: true,
                    revealIfVisible: true,
                    pinned: true,
                    override: editor_1.$HE.id
                }
            });
            return;
        }
    };
    exports.$GZb = $GZb;
    exports.$GZb = $GZb = __decorate([
        __param(1, editorService_1.$9C),
        __param(2, keybinding_1.$2D),
        __param(3, contextView_1.$WZ),
        __param(4, configuration_1.$8h),
        __param(5, contextkey_1.$3i),
        __param(6, views_1.$_E),
        __param(7, instantiation_1.$Ah),
        __param(8, opener_1.$NT),
        __param(9, themeService_1.$gv),
        __param(10, telemetry_1.$9k),
        __param(11, notification_1.$Yu),
        __param(12, userDataSync_1.$Qgb),
        __param(13, userDataSync_2.$KAb),
        __param(14, userDataSync_1.$Pgb),
        __param(15, userDataProfile_1.$Ek)
    ], $GZb);
});
//# sourceMappingURL=userDataSyncConflictsView.js.map