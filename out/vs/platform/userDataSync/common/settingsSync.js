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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationModels", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/files/common/files", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/abstractSynchronizer", "vs/platform/userDataSync/common/settingsMerge", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, buffer_1, event_1, nls_1, configuration_1, configurationModels_1, environment_1, extensionManagement_1, files_1, storage_1, telemetry_1, uriIdentity_1, userDataProfile_1, abstractSynchronizer_1, settingsMerge_1, userDataSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SettingsInitializer = exports.SettingsSynchroniser = exports.parseSettingsSyncContent = void 0;
    function isSettingsSyncContent(thing) {
        return thing
            && (thing.settings && typeof thing.settings === 'string')
            && Object.keys(thing).length === 1;
    }
    function parseSettingsSyncContent(syncContent) {
        const parsed = JSON.parse(syncContent);
        return isSettingsSyncContent(parsed) ? parsed : /* migrate */ { settings: syncContent };
    }
    exports.parseSettingsSyncContent = parseSettingsSyncContent;
    let SettingsSynchroniser = class SettingsSynchroniser extends abstractSynchronizer_1.AbstractJsonFileSynchroniser {
        constructor(profile, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, logService, userDataSyncUtilService, configurationService, userDataSyncEnablementService, telemetryService, extensionManagementService, uriIdentityService) {
            super(profile.settingsResource, { syncResource: "settings" /* SyncResource.Settings */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, userDataSyncUtilService, configurationService, uriIdentityService);
            this.extensionManagementService = extensionManagementService;
            /* Version 2: Change settings from `sync.${setting}` to `settingsSync.{setting}` */
            this.version = 2;
            this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, 'settings.json');
            this.baseResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'base' });
            this.localResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' });
            this.remoteResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' });
            this.acceptedResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' });
            this._defaultIgnoredSettings = undefined;
        }
        async getRemoteUserDataSyncConfiguration(manifest) {
            const lastSyncUserData = await this.getLastSyncUserData();
            const remoteUserData = await this.getLatestRemoteUserData(manifest, lastSyncUserData);
            const remoteSettingsSyncContent = this.getSettingsSyncContent(remoteUserData);
            const parser = new configurationModels_1.ConfigurationModelParser(userDataSync_1.USER_DATA_SYNC_CONFIGURATION_SCOPE);
            if (remoteSettingsSyncContent?.settings) {
                parser.parse(remoteSettingsSyncContent.settings);
            }
            return parser.configurationModel.getValue(userDataSync_1.USER_DATA_SYNC_CONFIGURATION_SCOPE) || {};
        }
        async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine) {
            const fileContent = await this.getLocalFileContent();
            const formattingOptions = await this.getFormattingOptions();
            const remoteSettingsSyncContent = this.getSettingsSyncContent(remoteUserData);
            // Use remote data as last sync data if last sync data does not exist and remote data is from same machine
            lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
            const lastSettingsSyncContent = lastSyncUserData ? this.getSettingsSyncContent(lastSyncUserData) : null;
            const ignoredSettings = await this.getIgnoredSettings();
            let mergedContent = null;
            let hasLocalChanged = false;
            let hasRemoteChanged = false;
            let hasConflicts = false;
            if (remoteSettingsSyncContent) {
                let localContent = fileContent ? fileContent.value.toString().trim() : '{}';
                localContent = localContent || '{}';
                this.validateContent(localContent);
                this.logService.trace(`${this.syncResourceLogLabel}: Merging remote settings with local settings...`);
                const result = (0, settingsMerge_1.merge)(localContent, remoteSettingsSyncContent.settings, lastSettingsSyncContent ? lastSettingsSyncContent.settings : null, ignoredSettings, [], formattingOptions);
                mergedContent = result.localContent || result.remoteContent;
                hasLocalChanged = result.localContent !== null;
                hasRemoteChanged = result.remoteContent !== null;
                hasConflicts = result.hasConflicts;
            }
            // First time syncing to remote
            else if (fileContent) {
                this.logService.trace(`${this.syncResourceLogLabel}: Remote settings does not exist. Synchronizing settings for the first time.`);
                mergedContent = fileContent.value.toString().trim() || '{}';
                this.validateContent(mergedContent);
                hasRemoteChanged = true;
            }
            const localContent = fileContent ? fileContent.value.toString() : null;
            const baseContent = lastSettingsSyncContent?.settings ?? null;
            const previewResult = {
                content: hasConflicts ? baseContent : mergedContent,
                localChange: hasLocalChanged ? 2 /* Change.Modified */ : 0 /* Change.None */,
                remoteChange: hasRemoteChanged ? 2 /* Change.Modified */ : 0 /* Change.None */,
                hasConflicts
            };
            return [{
                    fileContent,
                    baseResource: this.baseResource,
                    baseContent,
                    localResource: this.localResource,
                    localContent,
                    localChange: previewResult.localChange,
                    remoteResource: this.remoteResource,
                    remoteContent: remoteSettingsSyncContent ? remoteSettingsSyncContent.settings : null,
                    remoteChange: previewResult.remoteChange,
                    previewResource: this.previewResource,
                    previewResult,
                    acceptedResource: this.acceptedResource,
                }];
        }
        async hasRemoteChanged(lastSyncUserData) {
            const lastSettingsSyncContent = this.getSettingsSyncContent(lastSyncUserData);
            if (lastSettingsSyncContent === null) {
                return true;
            }
            const fileContent = await this.getLocalFileContent();
            const localContent = fileContent ? fileContent.value.toString().trim() : '';
            const ignoredSettings = await this.getIgnoredSettings();
            const formattingOptions = await this.getFormattingOptions();
            const result = (0, settingsMerge_1.merge)(localContent || '{}', lastSettingsSyncContent.settings, lastSettingsSyncContent.settings, ignoredSettings, [], formattingOptions);
            return result.remoteContent !== null;
        }
        async getMergeResult(resourcePreview, token) {
            const formatUtils = await this.getFormattingOptions();
            const ignoredSettings = await this.getIgnoredSettings();
            return {
                ...resourcePreview.previewResult,
                // remove ignored settings from the preview content
                content: resourcePreview.previewResult.content ? (0, settingsMerge_1.updateIgnoredSettings)(resourcePreview.previewResult.content, '{}', ignoredSettings, formatUtils) : null
            };
        }
        async getAcceptResult(resourcePreview, resource, content, token) {
            const formattingOptions = await this.getFormattingOptions();
            const ignoredSettings = await this.getIgnoredSettings();
            /* Accept local resource */
            if (this.extUri.isEqual(resource, this.localResource)) {
                return {
                    /* Remove ignored settings */
                    content: resourcePreview.fileContent ? (0, settingsMerge_1.updateIgnoredSettings)(resourcePreview.fileContent.value.toString(), '{}', ignoredSettings, formattingOptions) : null,
                    localChange: 0 /* Change.None */,
                    remoteChange: 2 /* Change.Modified */,
                };
            }
            /* Accept remote resource */
            if (this.extUri.isEqual(resource, this.remoteResource)) {
                return {
                    /* Update ignored settings from local file content */
                    content: resourcePreview.remoteContent !== null ? (0, settingsMerge_1.updateIgnoredSettings)(resourcePreview.remoteContent, resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : '{}', ignoredSettings, formattingOptions) : null,
                    localChange: 2 /* Change.Modified */,
                    remoteChange: 0 /* Change.None */,
                };
            }
            /* Accept preview resource */
            if (this.extUri.isEqual(resource, this.previewResource)) {
                if (content === undefined) {
                    return {
                        content: resourcePreview.previewResult.content,
                        localChange: resourcePreview.previewResult.localChange,
                        remoteChange: resourcePreview.previewResult.remoteChange,
                    };
                }
                else {
                    return {
                        /* Add ignored settings from local file content */
                        content: content !== null ? (0, settingsMerge_1.updateIgnoredSettings)(content, resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : '{}', ignoredSettings, formattingOptions) : null,
                        localChange: 2 /* Change.Modified */,
                        remoteChange: 2 /* Change.Modified */,
                    };
                }
            }
            throw new Error(`Invalid Resource: ${resource.toString()}`);
        }
        async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
            const { fileContent } = resourcePreviews[0][0];
            let { content, localChange, remoteChange } = resourcePreviews[0][1];
            if (localChange === 0 /* Change.None */ && remoteChange === 0 /* Change.None */) {
                this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing settings.`);
            }
            content = content ? content.trim() : '{}';
            content = content || '{}';
            this.validateContent(content);
            if (localChange !== 0 /* Change.None */) {
                this.logService.trace(`${this.syncResourceLogLabel}: Updating local settings...`);
                if (fileContent) {
                    await this.backupLocal(JSON.stringify(this.toSettingsSyncContent(fileContent.value.toString())));
                }
                await this.updateLocalFileContent(content, fileContent, force);
                await this.configurationService.reloadConfiguration(3 /* ConfigurationTarget.USER_LOCAL */);
                this.logService.info(`${this.syncResourceLogLabel}: Updated local settings`);
            }
            if (remoteChange !== 0 /* Change.None */) {
                const formatUtils = await this.getFormattingOptions();
                // Update ignored settings from remote
                const remoteSettingsSyncContent = this.getSettingsSyncContent(remoteUserData);
                const ignoredSettings = await this.getIgnoredSettings(content);
                content = (0, settingsMerge_1.updateIgnoredSettings)(content, remoteSettingsSyncContent ? remoteSettingsSyncContent.settings : '{}', ignoredSettings, formatUtils);
                this.logService.trace(`${this.syncResourceLogLabel}: Updating remote settings...`);
                remoteUserData = await this.updateRemoteUserData(JSON.stringify(this.toSettingsSyncContent(content)), force ? null : remoteUserData.ref);
                this.logService.info(`${this.syncResourceLogLabel}: Updated remote settings`);
            }
            // Delete the preview
            try {
                await this.fileService.del(this.previewResource);
            }
            catch (e) { /* ignore */ }
            if (lastSyncUserData?.ref !== remoteUserData.ref) {
                this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized settings...`);
                await this.updateLastSyncUserData(remoteUserData);
                this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized settings`);
            }
        }
        async hasLocalData() {
            try {
                const localFileContent = await this.getLocalFileContent();
                if (localFileContent) {
                    return !(0, settingsMerge_1.isEmpty)(localFileContent.value.toString());
                }
            }
            catch (error) {
                if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    return true;
                }
            }
            return false;
        }
        async resolveContent(uri) {
            if (this.extUri.isEqual(this.remoteResource, uri)
                || this.extUri.isEqual(this.localResource, uri)
                || this.extUri.isEqual(this.acceptedResource, uri)
                || this.extUri.isEqual(this.baseResource, uri)) {
                return this.resolvePreviewContent(uri);
            }
            return null;
        }
        async resolvePreviewContent(resource) {
            let content = await super.resolvePreviewContent(resource);
            if (content) {
                const formatUtils = await this.getFormattingOptions();
                // remove ignored settings from the preview content
                const ignoredSettings = await this.getIgnoredSettings();
                content = (0, settingsMerge_1.updateIgnoredSettings)(content, '{}', ignoredSettings, formatUtils);
            }
            return content;
        }
        getSettingsSyncContent(remoteUserData) {
            return remoteUserData.syncData ? this.parseSettingsSyncContent(remoteUserData.syncData.content) : null;
        }
        parseSettingsSyncContent(syncContent) {
            try {
                return parseSettingsSyncContent(syncContent);
            }
            catch (e) {
                this.logService.error(e);
            }
            return null;
        }
        toSettingsSyncContent(settings) {
            return { settings };
        }
        async getIgnoredSettings(content) {
            if (!this._defaultIgnoredSettings) {
                this._defaultIgnoredSettings = this.userDataSyncUtilService.resolveDefaultIgnoredSettings();
                const disposable = this._register(event_1.Event.any(event_1.Event.filter(this.extensionManagementService.onDidInstallExtensions, (e => e.some(({ local }) => !!local))), event_1.Event.filter(this.extensionManagementService.onDidUninstallExtension, (e => !e.error)))(() => {
                    disposable.dispose();
                    this._defaultIgnoredSettings = undefined;
                }));
            }
            const defaultIgnoredSettings = await this._defaultIgnoredSettings;
            return (0, settingsMerge_1.getIgnoredSettings)(defaultIgnoredSettings, this.configurationService, content);
        }
        validateContent(content) {
            if (this.hasErrors(content, false)) {
                throw new userDataSync_1.UserDataSyncError((0, nls_1.localize)('errorInvalidSettings', "Unable to sync settings as there are errors/warning in settings file."), "LocalInvalidContent" /* UserDataSyncErrorCode.LocalInvalidContent */, this.resource);
            }
        }
    };
    exports.SettingsSynchroniser = SettingsSynchroniser;
    exports.SettingsSynchroniser = SettingsSynchroniser = __decorate([
        __param(2, files_1.IFileService),
        __param(3, environment_1.IEnvironmentService),
        __param(4, storage_1.IStorageService),
        __param(5, userDataSync_1.IUserDataSyncStoreService),
        __param(6, userDataSync_1.IUserDataSyncLocalStoreService),
        __param(7, userDataSync_1.IUserDataSyncLogService),
        __param(8, userDataSync_1.IUserDataSyncUtilService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, userDataSync_1.IUserDataSyncEnablementService),
        __param(11, telemetry_1.ITelemetryService),
        __param(12, extensionManagement_1.IExtensionManagementService),
        __param(13, uriIdentity_1.IUriIdentityService)
    ], SettingsSynchroniser);
    let SettingsInitializer = class SettingsInitializer extends abstractSynchronizer_1.AbstractInitializer {
        constructor(fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
            super("settings" /* SyncResource.Settings */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
        }
        async doInitialize(remoteUserData) {
            const settingsSyncContent = remoteUserData.syncData ? this.parseSettingsSyncContent(remoteUserData.syncData.content) : null;
            if (!settingsSyncContent) {
                this.logService.info('Skipping initializing settings because remote settings does not exist.');
                return;
            }
            const isEmpty = await this.isEmpty();
            if (!isEmpty) {
                this.logService.info('Skipping initializing settings because local settings exist.');
                return;
            }
            await this.fileService.writeFile(this.userDataProfilesService.defaultProfile.settingsResource, buffer_1.VSBuffer.fromString(settingsSyncContent.settings));
            await this.updateLastSyncUserData(remoteUserData);
        }
        async isEmpty() {
            try {
                const fileContent = await this.fileService.readFile(this.userDataProfilesService.defaultProfile.settingsResource);
                return (0, settingsMerge_1.isEmpty)(fileContent.value.toString().trim());
            }
            catch (error) {
                return error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */;
            }
        }
        parseSettingsSyncContent(syncContent) {
            try {
                return parseSettingsSyncContent(syncContent);
            }
            catch (e) {
                this.logService.error(e);
            }
            return null;
        }
    };
    exports.SettingsInitializer = SettingsInitializer;
    exports.SettingsInitializer = SettingsInitializer = __decorate([
        __param(0, files_1.IFileService),
        __param(1, userDataProfile_1.IUserDataProfilesService),
        __param(2, environment_1.IEnvironmentService),
        __param(3, userDataSync_1.IUserDataSyncLogService),
        __param(4, storage_1.IStorageService),
        __param(5, uriIdentity_1.IUriIdentityService)
    ], SettingsInitializer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NTeW5jLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdXNlckRhdGFTeW5jL2NvbW1vbi9zZXR0aW5nc1N5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNEJoRyxTQUFTLHFCQUFxQixDQUFDLEtBQVU7UUFDeEMsT0FBTyxLQUFLO2VBQ1IsQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLE9BQU8sS0FBSyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUM7ZUFDdEQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxTQUFnQix3QkFBd0IsQ0FBQyxXQUFtQjtRQUMzRCxNQUFNLE1BQU0sR0FBeUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM3RCxPQUFPLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsQ0FBQztJQUN6RixDQUFDO0lBSEQsNERBR0M7SUFFTSxJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFxQixTQUFRLG1EQUE0QjtRQVVyRSxZQUNDLE9BQXlCLEVBQ3pCLFVBQThCLEVBQ2hCLFdBQXlCLEVBQ2xCLGtCQUF1QyxFQUMzQyxjQUErQixFQUNyQix3QkFBbUQsRUFDOUMsNkJBQTZELEVBQ3BFLFVBQW1DLEVBQ2xDLHVCQUFpRCxFQUNwRCxvQkFBMkMsRUFDbEMsNkJBQTZELEVBQzFFLGdCQUFtQyxFQUN6QiwwQkFBd0UsRUFDaEYsa0JBQXVDO1lBRTVELEtBQUssQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxZQUFZLHdDQUF1QixFQUFFLE9BQU8sRUFBRSxFQUFFLFVB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