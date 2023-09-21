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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/marshalling", "vs/platform/configuration/common/configuration", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataSync/common/abstractSynchronizer", "vs/workbench/contrib/editSessions/common/editSessions", "vs/workbench/services/workspaces/common/workspaceIdentityService"], function (require, exports, cancellation_1, event_1, marshalling_1, configuration_1, environment_1, files_1, storage_1, telemetry_1, uriIdentity_1, abstractSynchronizer_1, editSessions_1, workspaceIdentityService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$f1b = void 0;
    class NullBackupStoreService {
        async writeResource() {
            return;
        }
        async getAllResourceRefs() {
            return [];
        }
        async resolveResourceContent() {
            return null;
        }
    }
    class NullEnablementService {
        constructor() {
            this.a = new event_1.$fd();
            this.onDidChangeEnablement = this.a.event;
            this.b = new event_1.$fd();
            this.onDidChangeResourceEnablement = this.b.event;
        }
        isEnabled() { return true; }
        canToggleEnablement() { return true; }
        setEnablement(_enabled) { }
        isResourceEnabled(_resource) { return true; }
        setResourceEnablement(_resource, _enabled) { }
        getResourceSyncStateVersion(_resource) { return undefined; }
    }
    let $f1b = class $f1b extends abstractSynchronizer_1.$8Ab {
        constructor(profile, collection, userDataSyncStoreService, logService, fileService, environmentService, telemetryService, configurationService, storageService, uriIdentityService, vb, wb) {
            const userDataSyncLocalStoreService = new NullBackupStoreService();
            const userDataSyncEnablementService = new NullEnablementService();
            super({ syncResource: "workspaceState" /* SyncResource.WorkspaceState */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
            this.vb = vb;
            this.wb = wb;
            this.pb = 1;
        }
        async sync() {
            const cancellationTokenSource = new cancellation_1.$pd();
            const folders = await this.vb.getWorkspaceStateFolders(cancellationTokenSource.token);
            if (!folders.length) {
                return;
            }
            // Ensure we have latest state by sending out onWillSaveState event
            await this.I.flush();
            const keys = this.I.keys(1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
            if (!keys.length) {
                return;
            }
            const contributedData = {};
            keys.forEach((key) => {
                const data = this.I.get(key, 1 /* StorageScope.WORKSPACE */);
                if (data) {
                    contributedData[key] = data;
                }
            });
            const content = { folders, storage: contributedData, version: this.pb };
            await this.wb.write('workspaceState', (0, marshalling_1.$9g)(content));
        }
        async apply() {
            const payload = this.wb.lastReadResources.get('editSessions')?.content;
            const workspaceStateId = payload ? JSON.parse(payload).workspaceStateId : undefined;
            const resource = await this.wb.read('workspaceState', workspaceStateId);
            if (!resource) {
                return null;
            }
            const remoteWorkspaceState = (0, marshalling_1.$0g)(resource.content);
            if (!remoteWorkspaceState) {
                this.O.info('Skipping initializing workspace state because remote workspace state does not exist.');
                return null;
            }
            // Evaluate whether storage is applicable for current workspace
            const cancellationTokenSource = new cancellation_1.$pd();
            const replaceUris = await this.vb.matches(remoteWorkspaceState.folders, cancellationTokenSource.token);
            if (!replaceUris) {
                this.O.info('Skipping initializing workspace state because remote workspace state does not match current workspace.');
                return null;
            }
            const storage = {};
            for (const key of Object.keys(remoteWorkspaceState.storage)) {
                storage[key] = remoteWorkspaceState.storage[key];
            }
            if (Object.keys(storage).length) {
                // Initialize storage with remote storage
                const storageEntries = [];
                for (const key of Object.keys(storage)) {
                    // Deserialize the stored state
                    try {
                        const value = (0, marshalling_1.$0g)(storage[key]);
                        // Run URI conversion on the stored state
                        replaceUris(value);
                        storageEntries.push({ key, value, scope: 1 /* StorageScope.WORKSPACE */, target: 0 /* StorageTarget.USER */ });
                    }
                    catch {
                        storageEntries.push({ key, value: storage[key], scope: 1 /* StorageScope.WORKSPACE */, target: 0 /* StorageTarget.USER */ });
                    }
                }
                this.I.storeAll(storageEntries, true);
            }
            this.wb.delete('workspaceState', resource.ref);
            return null;
        }
        // TODO@joyceerhl implement AbstractSynchronizer in full
        tb(remoteUserData, lastSyncUserData, result, force) {
            throw new Error('Method not implemented.');
        }
        async qb(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, userDataSyncConfiguration, token) {
            return [];
        }
        rb(resourcePreview, token) {
            throw new Error('Method not implemented.');
        }
        sb(resourcePreview, resource, content, token) {
            throw new Error('Method not implemented.');
        }
        async ub(lastSyncUserData) {
            return true;
        }
        async hasLocalData() {
            return false;
        }
        async resolveContent(uri) {
            return null;
        }
    };
    exports.$f1b = $f1b;
    exports.$f1b = $f1b = __decorate([
        __param(4, files_1.$6j),
        __param(5, environment_1.$Ih),
        __param(6, telemetry_1.$9k),
        __param(7, configuration_1.$8h),
        __param(8, storage_1.$Vo),
        __param(9, uriIdentity_1.$Ck),
        __param(10, workspaceIdentityService_1.$d1b),
        __param(11, editSessions_1.$UZb)
    ], $f1b);
});
//# sourceMappingURL=workspaceStateSync.js.map