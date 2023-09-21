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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/json", "vs/base/common/platform", "vs/base/common/types", "vs/nls!vs/platform/userDataSync/common/keybindingsSync", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataSync/common/abstractSynchronizer", "vs/platform/userDataSync/common/keybindingsMerge", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, arrays_1, buffer_1, event_1, json_1, platform_1, types_1, nls_1, configuration_1, environment_1, files_1, storage_1, telemetry_1, uriIdentity_1, userDataProfile_1, abstractSynchronizer_1, keybindingsMerge_1, userDataSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$U2b = exports.$T2b = exports.$S2b = void 0;
    function $S2b(syncContent, platformSpecific, logService) {
        try {
            const parsed = JSON.parse(syncContent);
            if (!platformSpecific) {
                return (0, types_1.$qf)(parsed.all) ? null : parsed.all;
            }
            switch (platform_1.OS) {
                case 2 /* OperatingSystem.Macintosh */:
                    return (0, types_1.$qf)(parsed.mac) ? null : parsed.mac;
                case 3 /* OperatingSystem.Linux */:
                    return (0, types_1.$qf)(parsed.linux) ? null : parsed.linux;
                case 1 /* OperatingSystem.Windows */:
                    return (0, types_1.$qf)(parsed.windows) ? null : parsed.windows;
            }
        }
        catch (e) {
            logService.error(e);
            return null;
        }
    }
    exports.$S2b = $S2b;
    let $T2b = class $T2b extends abstractSynchronizer_1.$0Ab {
        constructor(profile, collection, userDataSyncStoreService, userDataSyncLocalStoreService, logService, configurationService, userDataSyncEnablementService, fileService, environmentService, storageService, userDataSyncUtilService, telemetryService, uriIdentityService) {
            super(profile.keybindingsResource, { syncResource: "keybindings" /* SyncResource.Keybindings */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, userDataSyncUtilService, configurationService, uriIdentityService);
            /* Version 2: Change settings from `sync.${setting}` to `settingsSync.{setting}` */
            this.pb = 2;
            this.Eb = this.h.joinPath(this.g, 'keybindings.json');
            this.Fb = this.Eb.with({ scheme: userDataSync_1.$Wgb, authority: 'base' });
            this.Gb = this.Eb.with({ scheme: userDataSync_1.$Wgb, authority: 'local' });
            this.Hb = this.Eb.with({ scheme: userDataSync_1.$Wgb, authority: 'remote' });
            this.Ib = this.Eb.with({ scheme: userDataSync_1.$Wgb, authority: 'accepted' });
            this.B(event_1.Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('settingsSync.keybindingsPerPlatform'))(() => this.Q()));
        }
        async qb(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, userDataSyncConfiguration) {
            const remoteContent = remoteUserData.syncData ? $S2b(remoteUserData.syncData.content, userDataSyncConfiguration.keybindingsPerPlatform ?? this.Qb(), this.O) : null;
            // Use remote data as last sync data if last sync data does not exist and remote data is from same machine
            lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
            const lastSyncContent = lastSyncUserData ? this.Ob(lastSyncUserData) : null;
            // Get file content last to get the latest
            const fileContent = await this.vb();
            const formattingOptions = await this.Cb();
            let mergedContent = null;
            let hasLocalChanged = false;
            let hasRemoteChanged = false;
            let hasConflicts = false;
            if (remoteContent) {
                let localContent = fileContent ? fileContent.value.toString() : '[]';
                localContent = localContent || '[]';
                if (this.Ab(localContent, true)) {
                    throw new userDataSync_1.$Kgb((0, nls_1.localize)(0, null), "LocalInvalidContent" /* UserDataSyncErrorCode.LocalInvalidContent */, this.resource);
                }
                if (!lastSyncContent // First time sync
                    || lastSyncContent !== localContent // Local has forwarded
                    || lastSyncContent !== remoteContent // Remote has forwarded
                ) {
                    this.O.trace(`${this.D}: Merging remote keybindings with local keybindings...`);
                    const result = await (0, keybindingsMerge_1.$R2b)(localContent, remoteContent, lastSyncContent, formattingOptions, this.zb);
                    // Sync only if there are changes
                    if (result.hasChanges) {
                        mergedContent = result.mergeContent;
                        hasConflicts = result.hasConflicts;
                        hasLocalChanged = hasConflicts || result.mergeContent !== localContent;
                        hasRemoteChanged = hasConflicts || result.mergeContent !== remoteContent;
                    }
                }
            }
            // First time syncing to remote
            else if (fileContent) {
                this.O.trace(`${this.D}: Remote keybindings does not exist. Synchronizing keybindings for the first time.`);
                mergedContent = fileContent.value.toString();
                hasRemoteChanged = true;
            }
            const previewResult = {
                content: hasConflicts ? lastSyncContent : mergedContent,
                localChange: hasLocalChanged ? fileContent ? 2 /* Change.Modified */ : 1 /* Change.Added */ : 0 /* Change.None */,
                remoteChange: hasRemoteChanged ? 2 /* Change.Modified */ : 0 /* Change.None */,
                hasConflicts
            };
            const localContent = fileContent ? fileContent.value.toString() : null;
            return [{
                    fileContent,
                    baseResource: this.Fb,
                    baseContent: lastSyncContent,
                    localResource: this.Gb,
                    localContent,
                    localChange: previewResult.localChange,
                    remoteResource: this.Hb,
                    remoteContent,
                    remoteChange: previewResult.remoteChange,
                    previewResource: this.Eb,
                    previewResult,
                    acceptedResource: this.Ib,
                }];
        }
        async ub(lastSyncUserData) {
            const lastSyncContent = this.Ob(lastSyncUserData);
            if (lastSyncContent === null) {
                return true;
            }
            const fileContent = await this.vb();
            const localContent = fileContent ? fileContent.value.toString() : '';
            const formattingOptions = await this.Cb();
            const result = await (0, keybindingsMerge_1.$R2b)(localContent || '[]', lastSyncContent, lastSyncContent, formattingOptions, this.zb);
            return result.hasConflicts || result.mergeContent !== lastSyncContent;
        }
        async rb(resourcePreview, token) {
            return resourcePreview.previewResult;
        }
        async sb(resourcePreview, resource, content, token) {
            /* Accept local resource */
            if (this.h.isEqual(resource, this.Gb)) {
                return {
                    content: resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : null,
                    localChange: 0 /* Change.None */,
                    remoteChange: 2 /* Change.Modified */,
                };
            }
            /* Accept remote resource */
            if (this.h.isEqual(resource, this.Hb)) {
                return {
                    content: resourcePreview.remoteContent,
                    localChange: 2 /* Change.Modified */,
                    remoteChange: 0 /* Change.None */,
                };
            }
            /* Accept preview resource */
            if (this.h.isEqual(resource, this.Eb)) {
                if (content === undefined) {
                    return {
                        content: resourcePreview.previewResult.content,
                        localChange: resourcePreview.previewResult.localChange,
                        remoteChange: resourcePreview.previewResult.remoteChange,
                    };
                }
                else {
                    return {
                        content,
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
                this.O.info(`${this.D}: No changes found during synchronizing keybindings.`);
            }
            if (content !== null) {
                content = content.trim();
                content = content || '[]';
                if (this.Ab(content, true)) {
                    throw new userDataSync_1.$Kgb((0, nls_1.localize)(1, null), "LocalInvalidContent" /* UserDataSyncErrorCode.LocalInvalidContent */, this.resource);
                }
            }
            if (localChange !== 0 /* Change.None */) {
                this.O.trace(`${this.D}: Updating local keybindings...`);
                if (fileContent) {
                    await this.nb(this.Pb(fileContent.value.toString()));
                }
                await this.wb(content || '[]', fileContent, force);
                this.O.info(`${this.D}: Updated local keybindings`);
            }
            if (remoteChange !== 0 /* Change.None */) {
                this.O.trace(`${this.D}: Updating remote keybindings...`);
                const remoteContents = this.Pb(content || '[]', remoteUserData.syncData?.content);
                remoteUserData = await this.mb(remoteContents, force ? null : remoteUserData.ref);
                this.O.info(`${this.D}: Updated remote keybindings`);
            }
            // Delete the preview
            try {
                await this.G.del(this.Eb);
            }
            catch (e) { /* ignore */ }
            if (lastSyncUserData?.ref !== remoteUserData.ref) {
                this.O.trace(`${this.D}: Updating last synchronized keybindings...`);
                await this.fb(remoteUserData, { platformSpecific: this.Qb() });
                this.O.info(`${this.D}: Updated last synchronized keybindings`);
            }
        }
        async hasLocalData() {
            try {
                const localFileContent = await this.vb();
                if (localFileContent) {
                    const keybindings = (0, json_1.$Lm)(localFileContent.value.toString());
                    if ((0, arrays_1.$Jb)(keybindings)) {
                        return true;
                    }
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
            if (this.h.isEqual(this.Hb, uri)
                || this.h.isEqual(this.Fb, uri)
                || this.h.isEqual(this.Gb, uri)
                || this.h.isEqual(this.Ib, uri)) {
                return this.db(uri);
            }
            return null;
        }
        Ob(lastSyncUserData) {
            if (!lastSyncUserData.syncData) {
                return null;
            }
            // Return null if there is a change in platform specific property from last time sync.
            if (lastSyncUserData.platformSpecific !== undefined && lastSyncUserData.platformSpecific !== this.Qb()) {
                return null;
            }
            return $S2b(lastSyncUserData.syncData.content, this.Qb(), this.O);
        }
        Pb(keybindingsContent, syncContent) {
            let parsed = {};
            try {
                parsed = JSON.parse(syncContent || '{}');
            }
            catch (e) {
                this.O.error(e);
            }
            if (this.Qb()) {
                delete parsed.all;
            }
            else {
                parsed.all = keybindingsContent;
            }
            switch (platform_1.OS) {
                case 2 /* OperatingSystem.Macintosh */:
                    parsed.mac = keybindingsContent;
                    break;
                case 3 /* OperatingSystem.Linux */:
                    parsed.linux = keybindingsContent;
                    break;
                case 1 /* OperatingSystem.Windows */:
                    parsed.windows = keybindingsContent;
                    break;
            }
            return JSON.stringify(parsed);
        }
        Qb() {
            return !!this.P.getValue(userDataSync_1.$ygb);
        }
    };
    exports.$T2b = $T2b;
    exports.$T2b = $T2b = __decorate([
        __param(2, userDataSync_1.$Fgb),
        __param(3, userDataSync_1.$Ggb),
        __param(4, userDataSync_1.$Ugb),
        __param(5, configuration_1.$8h),
        __param(6, userDataSync_1.$Pgb),
        __param(7, files_1.$6j),
        __param(8, environment_1.$Ih),
        __param(9, storage_1.$Vo),
        __param(10, userDataSync_1.$Tgb),
        __param(11, telemetry_1.$9k),
        __param(12, uriIdentity_1.$Ck)
    ], $T2b);
    let $U2b = class $U2b extends abstractSynchronizer_1.$$Ab {
        constructor(fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
            super("keybindings" /* SyncResource.Keybindings */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
        }
        async o(remoteUserData) {
            const keybindingsContent = remoteUserData.syncData ? this.p(remoteUserData.syncData.content) : null;
            if (!keybindingsContent) {
                this.j.info('Skipping initializing keybindings because remote keybindings does not exist.');
                return;
            }
            const isEmpty = await this.i();
            if (!isEmpty) {
                this.j.info('Skipping initializing keybindings because local keybindings exist.');
                return;
            }
            await this.k.writeFile(this.g.defaultProfile.keybindingsResource, buffer_1.$Fd.fromString(keybindingsContent));
            await this.n(remoteUserData);
        }
        async i() {
            try {
                const fileContent = await this.k.readFile(this.g.defaultProfile.settingsResource);
                const keybindings = (0, json_1.$Lm)(fileContent.value.toString());
                return !(0, arrays_1.$Jb)(keybindings);
            }
            catch (error) {
                return error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */;
            }
        }
        p(syncContent) {
            try {
                return $S2b(syncContent, true, this.j);
            }
            catch (e) {
                this.j.error(e);
                return null;
            }
        }
    };
    exports.$U2b = $U2b;
    exports.$U2b = $U2b = __decorate([
        __param(0, files_1.$6j),
        __param(1, userDataProfile_1.$Ek),
        __param(2, environment_1.$Ih),
        __param(3, userDataSync_1.$Ugb),
        __param(4, storage_1.$Vo),
        __param(5, uriIdentity_1.$Ck)
    ], $U2b);
});
//# sourceMappingURL=keybindingsSync.js.map