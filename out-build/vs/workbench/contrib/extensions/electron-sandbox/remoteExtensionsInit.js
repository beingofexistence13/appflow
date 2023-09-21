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
define(["require", "exports", "vs/base/common/cancellation", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/log/common/log", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/storage/common/storage", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/extensionsSync", "vs/platform/userDataSync/common/ignoredExtensions", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataSyncStoreService", "vs/workbench/services/authentication/common/authentication", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, cancellation_1, environment_1, extensionManagement_1, extensionManagementUtil_1, files_1, instantiation_1, serviceCollection_1, log_1, remoteAuthorityResolver_1, storage_1, uriIdentity_1, userDataProfile_1, extensionsSync_1, ignoredExtensions_1, userDataSync_1, userDataSyncStoreService_1, authentication_1, extensionManagement_2, extensionManifestPropertiesService_1, remoteAgentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uac = void 0;
    let $uac = class $uac {
        constructor(a, b, c, d, f, g, h, i, j) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k();
        }
        async k() {
            const connection = this.c.getConnection();
            const localExtensionManagementServer = this.a.localExtensionManagementServer;
            const remoteExtensionManagementServer = this.a.remoteExtensionManagementServer;
            // Skip: Not a remote window
            if (!connection || !remoteExtensionManagementServer) {
                return;
            }
            // Skip: Not a native window
            if (!localExtensionManagementServer) {
                return;
            }
            // Skip: No UserdataSyncStore is configured
            if (!this.d.userDataSyncStore) {
                return;
            }
            const newRemoteConnectionKey = `${storage_1.$To}.${connection.remoteAuthority}`;
            // Skip: Not a new remote connection
            if (!this.b.getBoolean(newRemoteConnectionKey, -1 /* StorageScope.APPLICATION */, true)) {
                this.g.trace(`Skipping initializing remote extensions because the window with this remote authority was opened before.`);
                return;
            }
            this.b.store(newRemoteConnectionKey, false, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            // Skip: Not a new workspace
            if (!this.b.isNew(1 /* StorageScope.WORKSPACE */)) {
                this.g.trace(`Skipping initializing remote extensions because this workspace was opened before.`);
                return;
            }
            // Skip: Settings Sync is disabled
            if (!this.j.isEnabled()) {
                return;
            }
            // Skip: No account is provided to initialize
            const resolvedAuthority = await this.i.resolveAuthority(connection.remoteAuthority);
            if (!resolvedAuthority.options?.authenticationSession) {
                return;
            }
            const sessions = await this.h.getSessions(resolvedAuthority.options?.authenticationSession.providerId);
            const session = sessions.find(s => s.id === resolvedAuthority.options?.authenticationSession?.id);
            // Skip: Session is not found
            if (!session) {
                this.g.info('Skipping initializing remote extensions because the account with given session id is not found', resolvedAuthority.options.authenticationSession.id);
                return;
            }
            const userDataSyncStoreClient = this.f.createInstance(userDataSyncStoreService_1.$2Ab, this.d.userDataSyncStore.url);
            userDataSyncStoreClient.setAuthToken(session.accessToken, resolvedAuthority.options.authenticationSession.providerId);
            const userData = await userDataSyncStoreClient.readResource("extensions" /* SyncResource.Extensions */, null);
            const serviceCollection = new serviceCollection_1.$zh();
            serviceCollection.set(extensionManagement_1.$2n, remoteExtensionManagementServer.extensionManagementService);
            const instantiationService = this.f.createChild(serviceCollection);
            const extensionsToInstallInitializer = instantiationService.createInstance(RemoteExtensionsInitializer);
            await extensionsToInstallInitializer.initialize(userData);
        }
    };
    exports.$uac = $uac;
    exports.$uac = $uac = __decorate([
        __param(0, extensionManagement_2.$fcb),
        __param(1, storage_1.$Vo),
        __param(2, remoteAgentService_1.$jm),
        __param(3, userDataSync_1.$Egb),
        __param(4, instantiation_1.$Ah),
        __param(5, log_1.$5i),
        __param(6, authentication_1.$3I),
        __param(7, remoteAuthorityResolver_1.$Jk),
        __param(8, userDataSync_1.$Pgb)
    ], $uac);
    let RemoteExtensionsInitializer = class RemoteExtensionsInitializer extends extensionsSync_1.$Q2b {
        constructor(extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, uriIdentityService, c, storageService, v) {
            super(extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService);
            this.c = c;
            this.v = v;
        }
        async o(remoteUserData) {
            const remoteExtensions = await this.t(remoteUserData);
            if (!remoteExtensions) {
                this.j.info('No synced extensions exist while initializing remote extensions.');
                return;
            }
            const installedExtensions = await this.p.getInstalled();
            const { newExtensions } = this.u(remoteExtensions, installedExtensions);
            if (!newExtensions.length) {
                this.j.trace('No new remote extensions to install.');
                return;
            }
            const targetPlatform = await this.p.getTargetPlatform();
            const extensionsToInstall = await this.c.getExtensions(newExtensions, { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None);
            if (extensionsToInstall.length) {
                await Promise.allSettled(extensionsToInstall.map(async (e) => {
                    const manifest = await this.c.getManifest(e, cancellation_1.CancellationToken.None);
                    if (manifest && this.v.canExecuteOnWorkspace(manifest)) {
                        const syncedExtension = remoteExtensions.find(e => (0, extensionManagementUtil_1.$po)(e.identifier, e.identifier));
                        await this.p.installFromGallery(e, { installPreReleaseVersion: syncedExtension?.preRelease, donotIncludePackAndDependencies: true });
                    }
                }));
            }
        }
    };
    RemoteExtensionsInitializer = __decorate([
        __param(0, extensionManagement_1.$2n),
        __param(1, ignoredExtensions_1.$PBb),
        __param(2, files_1.$6j),
        __param(3, userDataProfile_1.$Ek),
        __param(4, environment_1.$Ih),
        __param(5, log_1.$5i),
        __param(6, uriIdentity_1.$Ck),
        __param(7, extensionManagement_1.$Zn),
        __param(8, storage_1.$Vo),
        __param(9, extensionManifestPropertiesService_1.$vcb)
    ], RemoteExtensionsInitializer);
});
//# sourceMappingURL=remoteExtensionsInit.js.map