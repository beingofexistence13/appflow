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
    exports.WorkspaceStateSynchroniser = void 0;
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
            this._onDidChangeEnablement = new event_1.Emitter();
            this.onDidChangeEnablement = this._onDidChangeEnablement.event;
            this._onDidChangeResourceEnablement = new event_1.Emitter();
            this.onDidChangeResourceEnablement = this._onDidChangeResourceEnablement.event;
        }
        isEnabled() { return true; }
        canToggleEnablement() { return true; }
        setEnablement(_enabled) { }
        isResourceEnabled(_resource) { return true; }
        setResourceEnablement(_resource, _enabled) { }
        getResourceSyncStateVersion(_resource) { return undefined; }
    }
    let WorkspaceStateSynchroniser = class WorkspaceStateSynchroniser extends abstractSynchronizer_1.AbstractSynchroniser {
        constructor(profile, collection, userDataSyncStoreService, logService, fileService, environmentService, telemetryService, configurationService, storageService, uriIdentityService, workspaceIdentityService, editSessionsStorageService) {
            const userDataSyncLocalStoreService = new NullBackupStoreService();
            const userDataSyncEnablementService = new NullEnablementService();
            super({ syncResource: "workspaceState" /* SyncResource.WorkspaceState */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
            this.workspaceIdentityService = workspaceIdentityService;
            this.editSessionsStorageService = editSessionsStorageService;
            this.version = 1;
        }
        async sync() {
            const cancellationTokenSource = new cancellation_1.CancellationTokenSource();
            const folders = await this.workspaceIdentityService.getWorkspaceStateFolders(cancellationTokenSource.token);
            if (!folders.length) {
                return;
            }
            // Ensure we have latest state by sending out onWillSaveState event
            await this.storageService.flush();
            const keys = this.storageService.keys(1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
            if (!keys.length) {
                return;
            }
            const contributedData = {};
            keys.forEach((key) => {
                const data = this.storageService.get(key, 1 /* StorageScope.WORKSPACE */);
                if (data) {
                    contributedData[key] = data;
                }
            });
            const content = { folders, storage: contributedData, version: this.version };
            await this.editSessionsStorageService.write('workspaceState', (0, marshalling_1.stringify)(content));
        }
        async apply() {
            const payload = this.editSessionsStorageService.lastReadResources.get('editSessions')?.content;
            const workspaceStateId = payload ? JSON.parse(payload).workspaceStateId : undefined;
            const resource = await this.editSessionsStorageService.read('workspaceState', workspaceStateId);
            if (!resource) {
                return null;
            }
            const remoteWorkspaceState = (0, marshalling_1.parse)(resource.content);
            if (!remoteWorkspaceState) {
                this.logService.info('Skipping initializing workspace state because remote workspace state does not exist.');
                return null;
            }
            // Evaluate whether storage is applicable for current workspace
            const cancellationTokenSource = new cancellation_1.CancellationTokenSource();
            const replaceUris = await this.workspaceIdentityService.matches(remoteWorkspaceState.folders, cancellationTokenSource.token);
            if (!replaceUris) {
                this.logService.info('Skipping initializing workspace state because remote workspace state does not match current workspace.');
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
                        const value = (0, marshalling_1.parse)(storage[key]);
                        // Run URI conversion on the stored state
                        replaceUris(value);
                        storageEntries.push({ key, value, scope: 1 /* StorageScope.WORKSPACE */, target: 0 /* StorageTarget.USER */ });
                    }
                    catch {
                        storageEntries.push({ key, value: storage[key], scope: 1 /* StorageScope.WORKSPACE */, target: 0 /* StorageTarget.USER */ });
                    }
                }
                this.storageService.storeAll(storageEntries, true);
            }
            this.editSessionsStorageService.delete('workspaceState', resource.ref);
            return null;
        }
        // TODO@joyceerhl implement AbstractSynchronizer in full
        applyResult(remoteUserData, lastSyncUserData, result, force) {
            throw new Error('Method not implemented.');
        }
        async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, userDataSyncConfiguration, token) {
            return [];
        }
        getMergeResult(resourcePreview, token) {
            throw new Error('Method not implemented.');
        }
        getAcceptResult(resourcePreview, resource, content, token) {
            throw new Error('Method not implemented.');
        }
        async hasRemoteChanged(lastSyncUserData) {
            return true;
        }
        async hasLocalData() {
            return false;
        }
        async resolveContent(uri) {
            return null;
        }
    };
    exports.WorkspaceStateSynchroniser = WorkspaceStateSynchroniser;
    exports.WorkspaceStateSynchroniser = WorkspaceStateSynchroniser = __decorate([
        __param(4, files_1.IFileService),
        __param(5, environment_1.IEnvironmentService),
        __param(6, telemetry_1.ITelemetryService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, storage_1.IStorageService),
        __param(9, uriIdentity_1.IUriIdentityService),
        __param(10, workspaceIdentityService_1.IWorkspaceIdentityService),
        __param(11, editSessions_1.IEditSessionsStorageService)
    ], WorkspaceStateSynchroniser);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlU3RhdGVTeW5jLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZWRpdFNlc3Npb25zL2NvbW1vbi93b3Jrc3BhY2VTdGF0ZVN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBb0JoRyxNQUFNLHNCQUFzQjtRQUUzQixLQUFLLENBQUMsYUFBYTtZQUNsQixPQUFPO1FBQ1IsQ0FBQztRQUNELEtBQUssQ0FBQyxrQkFBa0I7WUFDdkIsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBQ0QsS0FBSyxDQUFDLHNCQUFzQjtZQUMzQixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7S0FFRDtJQUVELE1BQU0scUJBQXFCO1FBQTNCO1lBR1MsMkJBQXNCLEdBQUcsSUFBSSxlQUFPLEVBQVcsQ0FBQztZQUMvQywwQkFBcUIsR0FBbUIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztZQUUzRSxtQ0FBOEIsR0FBRyxJQUFJLGVBQU8sRUFBMkIsQ0FBQztZQUN2RSxrQ0FBNkIsR0FBbUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLEtBQUssQ0FBQztRQVNwSCxDQUFDO1FBUEEsU0FBUyxLQUFjLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyQyxtQkFBbUIsS0FBYyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDL0MsYUFBYSxDQUFDLFFBQWlCLElBQVUsQ0FBQztRQUMxQyxpQkFBaUIsQ0FBQyxTQUF1QixJQUFhLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNwRSxxQkFBcUIsQ0FBQyxTQUF1QixFQUFFLFFBQWlCLElBQVUsQ0FBQztRQUMzRSwyQkFBMkIsQ0FBQyxTQUF1QixJQUF3QixPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUM7S0FFOUY7SUFFTSxJQUFNLDBCQUEwQixHQUFoQyxN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