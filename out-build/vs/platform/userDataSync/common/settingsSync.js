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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/nls!vs/platform/userDataSync/common/settingsSync", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationModels", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/files/common/files", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/abstractSynchronizer", "vs/platform/userDataSync/common/settingsMerge", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, buffer_1, event_1, nls_1, configuration_1, configurationModels_1, environment_1, extensionManagement_1, files_1, storage_1, telemetry_1, uriIdentity_1, userDataProfile_1, abstractSynchronizer_1, settingsMerge_1, userDataSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$X2b = exports.$W2b = exports.$V2b = void 0;
    function isSettingsSyncContent(thing) {
        return thing
            && (thing.settings && typeof thing.settings === 'string')
            && Object.keys(thing).length === 1;
    }
    function $V2b(syncContent) {
        const parsed = JSON.parse(syncContent);
        return isSettingsSyncContent(parsed) ? parsed : /* migrate */ { settings: syncContent };
    }
    exports.$V2b = $V2b;
    let $W2b = class $W2b extends abstractSynchronizer_1.$0Ab {
        constructor(profile, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, logService, userDataSyncUtilService, configurationService, userDataSyncEnablementService, telemetryService, Eb, uriIdentityService) {
            super(profile.settingsResource, { syncResource: "settings" /* SyncResource.Settings */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, userDataSyncUtilService, configurationService, uriIdentityService);
            this.Eb = Eb;
            /* Version 2: Change settings from `sync.${setting}` to `settingsSync.{setting}` */
            this.pb = 2;
            this.previewResource = this.h.joinPath(this.g, 'settings.json');
            this.baseResource = this.previewResource.with({ scheme: userDataSync_1.$Wgb, authority: 'base' });
            this.localResource = this.previewResource.with({ scheme: userDataSync_1.$Wgb, authority: 'local' });
            this.remoteResource = this.previewResource.with({ scheme: userDataSync_1.$Wgb, authority: 'remote' });
            this.acceptedResource = this.previewResource.with({ scheme: userDataSync_1.$Wgb, authority: 'accepted' });
            this.Ob = undefined;
        }
        async getRemoteUserDataSyncConfiguration(manifest) {
            const lastSyncUserData = await this.getLastSyncUserData();
            const remoteUserData = await this.X(manifest, lastSyncUserData);
            const remoteSettingsSyncContent = this.Lb(remoteUserData);
            const parser = new configurationModels_1.$rn(userDataSync_1.$xgb);
            if (remoteSettingsSyncContent?.settings) {
                parser.parse(remoteSettingsSyncContent.settings);
            }
            return parser.configurationModel.getValue(userDataSync_1.$xgb) || {};
        }
        async qb(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine) {
            const fileContent = await this.vb();
            const formattingOptions = await this.Cb();
            const remoteSettingsSyncContent = this.Lb(remoteUserData);
            // Use remote data as last sync data if last sync data does not exist and remote data is from same machine
            lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
            const lastSettingsSyncContent = lastSyncUserData ? this.Lb(lastSyncUserData) : null;
            const ignoredSettings = await this.Pb();
            let mergedContent = null;
            let hasLocalChanged = false;
            let hasRemoteChanged = false;
            let hasConflicts = false;
            if (remoteSettingsSyncContent) {
                let localContent = fileContent ? fileContent.value.toString().trim() : '{}';
                localContent = localContent || '{}';
                this.Qb(localContent);
                this.O.trace(`${this.D}: Merging remote settings with local settings...`);
                const result = (0, settingsMerge_1.$Xzb)(localContent, remoteSettingsSyncContent.settings, lastSettingsSyncContent ? lastSettingsSyncContent.settings : null, ignoredSettings, [], formattingOptions);
                mergedContent = result.localContent || result.remoteContent;
                hasLocalChanged = result.localContent !== null;
                hasRemoteChanged = result.remoteContent !== null;
                hasConflicts = result.hasConflicts;
            }
            // First time syncing to remote
            else if (fileContent) {
                this.O.trace(`${this.D}: Remote settings does not exist. Synchronizing settings for the first time.`);
                mergedContent = fileContent.value.toString().trim() || '{}';
                this.Qb(mergedContent);
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
        async ub(lastSyncUserData) {
            const lastSettingsSyncContent = this.Lb(lastSyncUserData);
            if (lastSettingsSyncContent === null) {
                return true;
            }
            const fileContent = await this.vb();
            const localContent = fileContent ? fileContent.value.toString().trim() : '';
            const ignoredSettings = await this.Pb();
            const formattingOptions = await this.Cb();
            const result = (0, settingsMerge_1.$Xzb)(localContent || '{}', lastSettingsSyncContent.settings, lastSettingsSyncContent.settings, ignoredSettings, [], formattingOptions);
            return result.remoteContent !== null;
        }
        async rb(resourcePreview, token) {
            const formatUtils = await this.Cb();
            const ignoredSettings = await this.Pb();
            return {
                ...resourcePreview.previewResult,
                // remove ignored settings from the preview content
                content: resourcePreview.previewResult.content ? (0, settingsMerge_1.$Wzb)(resourcePreview.previewResult.content, '{}', ignoredSettings, formatUtils) : null
            };
        }
        async sb(resourcePreview, resource, content, token) {
            const formattingOptions = await this.Cb();
            const ignoredSettings = await this.Pb();
            /* Accept local resource */
            if (this.h.isEqual(resource, this.localResource)) {
                return {
                    /* Remove ignored settings */
                    content: resourcePreview.fileContent ? (0, settingsMerge_1.$Wzb)(resourcePreview.fileContent.value.toString(), '{}', ignoredSettings, formattingOptions) : null,
                    localChange: 0 /* Change.None */,
                    remoteChange: 2 /* Change.Modified */,
                };
            }
            /* Accept remote resource */
            if (this.h.isEqual(resource, this.remoteResource)) {
                return {
                    /* Update ignored settings from local file content */
                    content: resourcePreview.remoteContent !== null ? (0, settingsMerge_1.$Wzb)(resourcePreview.remoteContent, resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : '{}', ignoredSettings, formattingOptions) : null,
                    localChange: 2 /* Change.Modified */,
                    remoteChange: 0 /* Change.None */,
                };
            }
            /* Accept preview resource */
            if (this.h.isEqual(resource, this.previewResource)) {
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
                        content: content !== null ? (0, settingsMerge_1.$Wzb)(content, resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : '{}', ignoredSettings, formattingOptions) : null,
                        localChange: 2 /* Change.Modified */,
                        remoteChange: 2 /* Change.Modified */,
                    };
                }
            }
            throw new Error(`Invalid Resource: ${resource.toString()}`);
        }
        async tb(remoteUserData, lastSyncUserData, resourcePreviews, force) {
            const { fileContent } = resourcePreviews[0][0];
            let { content, localChange, remoteChange } = resourcePreviews[0][1];
            if (localChange === 0 /* Change.None */ && remoteChange === 0 /* Change.None */) {
                this.O.info(`${this.D}: No changes found during synchronizing settings.`);
            }
            content = content ? content.trim() : '{}';
            content = content || '{}';
            this.Qb(content);
            if (localChange !== 0 /* Change.None */) {
                this.O.trace(`${this.D}: Updating local settings...`);
                if (fileContent) {
                    await this.nb(JSON.stringify(this.Nb(fileContent.value.toString())));
                }
                await this.wb(content, fileContent, force);
                await this.P.reloadConfiguration(3 /* ConfigurationTarget.USER_LOCAL */);
                this.O.info(`${this.D}: Updated local settings`);
            }
            if (remoteChange !== 0 /* Change.None */) {
                const formatUtils = await this.Cb();
                // Update ignored settings from remote
                const remoteSettingsSyncContent = this.Lb(remoteUserData);
                const ignoredSettings = await this.Pb(content);
                content = (0, settingsMerge_1.$Wzb)(content, remoteSettingsSyncContent ? remoteSettingsSyncContent.settings : '{}', ignoredSettings, formatUtils);
                this.O.trace(`${this.D}: Updating remote settings...`);
                remoteUserData = await this.mb(JSON.stringify(this.Nb(content)), force ? null : remoteUserData.ref);
                this.O.info(`${this.D}: Updated remote settings`);
            }
            // Delete the preview
            try {
                await this.G.del(this.previewResource);
            }
            catch (e) { /* ignore */ }
            if (lastSyncUserData?.ref !== remoteUserData.ref) {
                this.O.trace(`${this.D}: Updating last synchronized settings...`);
                await this.fb(remoteUserData);
                this.O.info(`${this.D}: Updated last synchronized settings`);
            }
        }
        async hasLocalData() {
            try {
                const localFileContent = await this.vb();
                if (localFileContent) {
                    return !(0, settingsMerge_1.$Yzb)(localFileContent.value.toString());
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
            if (this.h.isEqual(this.remoteResource, uri)
                || this.h.isEqual(this.localResource, uri)
                || this.h.isEqual(this.acceptedResource, uri)
                || this.h.isEqual(this.baseResource, uri)) {
                return this.db(uri);
            }
            return null;
        }
        async db(resource) {
            let content = await super.db(resource);
            if (content) {
                const formatUtils = await this.Cb();
                // remove ignored settings from the preview content
                const ignoredSettings = await this.Pb();
                content = (0, settingsMerge_1.$Wzb)(content, '{}', ignoredSettings, formatUtils);
            }
            return content;
        }
        Lb(remoteUserData) {
            return remoteUserData.syncData ? this.Mb(remoteUserData.syncData.content) : null;
        }
        Mb(syncContent) {
            try {
                return $V2b(syncContent);
            }
            catch (e) {
                this.O.error(e);
            }
            return null;
        }
        Nb(settings) {
            return { settings };
        }
        async Pb(content) {
            if (!this.Ob) {
                this.Ob = this.zb.resolveDefaultIgnoredSettings();
                const disposable = this.B(event_1.Event.any(event_1.Event.filter(this.Eb.onDidInstallExtensions, (e => e.some(({ local }) => !!local))), event_1.Event.filter(this.Eb.onDidUninstallExtension, (e => !e.error)))(() => {
                    disposable.dispose();
                    this.Ob = undefined;
                }));
            }
            const defaultIgnoredSettings = await this.Ob;
            return (0, settingsMerge_1.$Uzb)(defaultIgnoredSettings, this.P, content);
        }
        Qb(content) {
            if (this.Ab(content, false)) {
                throw new userDataSync_1.$Kgb((0, nls_1.localize)(0, null), "LocalInvalidContent" /* UserDataSyncErrorCode.LocalInvalidContent */, this.resource);
            }
        }
    };
    exports.$W2b = $W2b;
    exports.$W2b = $W2b = __decorate([
        __param(2, files_1.$6j),
        __param(3, environment_1.$Ih),
        __param(4, storage_1.$Vo),
        __param(5, userDataSync_1.$Fgb),
        __param(6, userDataSync_1.$Ggb),
        __param(7, userDataSync_1.$Ugb),
        __param(8, userDataSync_1.$Tgb),
        __param(9, configuration_1.$8h),
        __param(10, userDataSync_1.$Pgb),
        __param(11, telemetry_1.$9k),
        __param(12, extensionManagement_1.$2n),
        __param(13, uriIdentity_1.$Ck)
    ], $W2b);
    let $X2b = class $X2b extends abstractSynchronizer_1.$$Ab {
        constructor(fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
            super("settings" /* SyncResource.Settings */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
        }
        async o(remoteUserData) {
            const settingsSyncContent = remoteUserData.syncData ? this.p(remoteUserData.syncData.content) : null;
            if (!settingsSyncContent) {
                this.j.info('Skipping initializing settings because remote settings does not exist.');
                return;
            }
            const isEmpty = await this.i();
            if (!isEmpty) {
                this.j.info('Skipping initializing settings because local settings exist.');
                return;
            }
            await this.k.writeFile(this.g.defaultProfile.settingsResource, buffer_1.$Fd.fromString(settingsSyncContent.settings));
            await this.n(remoteUserData);
        }
        async i() {
            try {
                const fileContent = await this.k.readFile(this.g.defaultProfile.settingsResource);
                return (0, settingsMerge_1.$Yzb)(fileContent.value.toString().trim());
            }
            catch (error) {
                return error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */;
            }
        }
        p(syncContent) {
            try {
                return $V2b(syncContent);
            }
            catch (e) {
                this.j.error(e);
            }
            return null;
        }
    };
    exports.$X2b = $X2b;
    exports.$X2b = $X2b = __decorate([
        __param(0, files_1.$6j),
        __param(1, userDataProfile_1.$Ek),
        __param(2, environment_1.$Ih),
        __param(3, userDataSync_1.$Ugb),
        __param(4, storage_1.$Vo),
        __param(5, uriIdentity_1.$Ck)
    ], $X2b);
});
//# sourceMappingURL=settingsSync.js.map