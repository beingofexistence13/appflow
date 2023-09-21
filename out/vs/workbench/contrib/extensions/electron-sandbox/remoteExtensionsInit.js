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
    exports.RemoteExtensionsInitializerContribution = void 0;
    let RemoteExtensionsInitializerContribution = class RemoteExtensionsInitializerContribution {
        constructor(extensionManagementServerService, storageService, remoteAgentService, userDataSyncStoreManagementService, instantiationService, logService, authenticationService, remoteAuthorityResolverService, userDataSyncEnablementService) {
            this.extensionManagementServerService = extensionManagementServerService;
            this.storageService = storageService;
            this.remoteAgentService = remoteAgentService;
            this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
            this.instantiationService = instantiationService;
            this.logService = logService;
            this.authenticationService = authenticationService;
            this.remoteAuthorityResolverService = remoteAuthorityResolverService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this.initializeRemoteExtensions();
        }
        async initializeRemoteExtensions() {
            const connection = this.remoteAgentService.getConnection();
            const localExtensionManagementServer = this.extensionManagementServerService.localExtensionManagementServer;
            const remoteExtensionManagementServer = this.extensionManagementServerService.remoteExtensionManagementServer;
            // Skip: Not a remote window
            if (!connection || !remoteExtensionManagementServer) {
                return;
            }
            // Skip: Not a native window
            if (!localExtensionManagementServer) {
                return;
            }
            // Skip: No UserdataSyncStore is configured
            if (!this.userDataSyncStoreManagementService.userDataSyncStore) {
                return;
            }
            const newRemoteConnectionKey = `${storage_1.IS_NEW_KEY}.${connection.remoteAuthority}`;
            // Skip: Not a new remote connection
            if (!this.storageService.getBoolean(newRemoteConnectionKey, -1 /* StorageScope.APPLICATION */, true)) {
                this.logService.trace(`Skipping initializing remote extensions because the window with this remote authority was opened before.`);
                return;
            }
            this.storageService.store(newRemoteConnectionKey, false, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            // Skip: Not a new workspace
            if (!this.storageService.isNew(1 /* StorageScope.WORKSPACE */)) {
                this.logService.trace(`Skipping initializing remote extensions because this workspace was opened before.`);
                return;
            }
            // Skip: Settings Sync is disabled
            if (!this.userDataSyncEnablementService.isEnabled()) {
                return;
            }
            // Skip: No account is provided to initialize
            const resolvedAuthority = await this.remoteAuthorityResolverService.resolveAuthority(connection.remoteAuthority);
            if (!resolvedAuthority.options?.authenticationSession) {
                return;
            }
            const sessions = await this.authenticationService.getSessions(resolvedAuthority.options?.authenticationSession.providerId);
            const session = sessions.find(s => s.id === resolvedAuthority.options?.authenticationSession?.id);
            // Skip: Session is not found
            if (!session) {
                this.logService.info('Skipping initializing remote extensions because the account with given session id is not found', resolvedAuthority.options.authenticationSession.id);
                return;
            }
            const userDataSyncStoreClient = this.instantiationService.createInstance(userDataSyncStoreService_1.UserDataSyncStoreClient, this.userDataSyncStoreManagementService.userDataSyncStore.url);
            userDataSyncStoreClient.setAuthToken(session.accessToken, resolvedAuthority.options.authenticationSession.providerId);
            const userData = await userDataSyncStoreClient.readResource("extensions" /* SyncResource.Extensions */, null);
            const serviceCollection = new serviceCollection_1.ServiceCollection();
            serviceCollection.set(extensionManagement_1.IExtensionManagementService, remoteExtensionManagementServer.extensionManagementService);
            const instantiationService = this.instantiationService.createChild(serviceCollection);
            const extensionsToInstallInitializer = instantiationService.createInstance(RemoteExtensionsInitializer);
            await extensionsToInstallInitializer.initialize(userData);
        }
    };
    exports.RemoteExtensionsInitializerContribution = RemoteExtensionsInitializerContribution;
    exports.RemoteExtensionsInitializerContribution = RemoteExtensionsInitializerContribution = __decorate([
        __param(0, extensionManagement_2.IExtensionManagementServerService),
        __param(1, storage_1.IStorageService),
        __param(2, remoteAgentService_1.IRemoteAgentService),
        __param(3, userDataSync_1.IUserDataSyncStoreManagementService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, log_1.ILogService),
        __param(6, authentication_1.IAuthenticationService),
        __param(7, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(8, userDataSync_1.IUserDataSyncEnablementService)
    ], RemoteExtensionsInitializerContribution);
    let RemoteExtensionsInitializer = class RemoteExtensionsInitializer extends extensionsSync_1.AbstractExtensionsInitializer {
        constructor(extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, uriIdentityService, extensionGalleryService, storageService, extensionManifestPropertiesService) {
            super(extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService);
            this.extensionGalleryService = extensionGalleryService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
        }
        async doInitialize(remoteUserData) {
            const remoteExtensions = await this.parseExtensions(remoteUserData);
            if (!remoteExtensions) {
                this.logService.info('No synced extensions exist while initializing remote extensions.');
                return;
            }
            const installedExtensions = await this.extensionManagementService.getInstalled();
            const { newExtensions } = this.generatePreview(remoteExtensions, installedExtensions);
            if (!newExtensions.length) {
                this.logService.trace('No new remote extensions to install.');
                return;
            }
            const targetPlatform = await this.extensionManagementService.getTargetPlatform();
            const extensionsToInstall = await this.extensionGalleryService.getExtensions(newExtensions, { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None);
            if (extensionsToInstall.length) {
                await Promise.allSettled(extensionsToInstall.map(async (e) => {
                    const manifest = await this.extensionGalleryService.getManifest(e, cancellation_1.CancellationToken.None);
                    if (manifest && this.extensionManifestPropertiesService.canExecuteOnWorkspace(manifest)) {
                        const syncedExtension = remoteExtensions.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, e.identifier));
                        await this.extensionManagementService.installFromGallery(e, { installPreReleaseVersion: syncedExtension?.preRelease, donotIncludePackAndDependencies: true });
                    }
                }));
            }
        }
    };
    RemoteExtensionsInitializer = __decorate([
        __param(0, extensionManagement_1.IExtensionManagementService),
        __param(1, ignoredExtensions_1.IIgnoredExtensionsManagementService),
        __param(2, files_1.IFileService),
        __param(3, userDataProfile_1.IUserDataProfilesService),
        __param(4, environment_1.IEnvironmentService),
        __param(5, log_1.ILogService),
        __param(6, uriIdentity_1.IUriIdentityService),
        __param(7, extensionManagement_1.IExtensionGalleryService),
        __param(8, storage_1.IStorageService),
        __param(9, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], RemoteExtensionsInitializer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlRXh0ZW5zaW9uc0luaXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2VsZWN0cm9uLXNhbmRib3gvcmVtb3RlRXh0ZW5zaW9uc0luaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBd0J6RixJQUFNLHVDQUF1QyxHQUE3QyxNQUFNLHVDQUF1QztRQUNuRCxZQUNxRCxnQ0FBbUUsRUFDckYsY0FBK0IsRUFDM0Isa0JBQXVDLEVBQ3ZCLGtDQUF1RSxFQUNyRixvQkFBMkMsRUFDckQsVUFBdUIsRUFDWixxQkFBNkMsRUFDcEMsOEJBQStELEVBQ2hFLDZCQUE2RDtZQVIxRCxxQ0FBZ0MsR0FBaEMsZ0NBQWdDLENBQW1DO1lBQ3JGLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUMzQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ3ZCLHVDQUFrQyxHQUFsQyxrQ0FBa0MsQ0FBcUM7WUFDckYseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNyRCxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ1osMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF3QjtZQUNwQyxtQ0FBOEIsR0FBOUIsOEJBQThCLENBQWlDO1lBQ2hFLGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBZ0M7WUFFOUcsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7UUFDbkMsQ0FBQztRQUVPLEtBQUssQ0FBQywwQkFBMEI7WUFDdkMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzNELE1BQU0sOEJBQThCLEdBQUcsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLDhCQUE4QixDQUFDO1lBQzVHLE1BQU0sK0JBQStCLEdBQUcsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLCtCQUErQixDQUFD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