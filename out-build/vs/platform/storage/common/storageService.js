/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/resources", "vs/base/parts/storage/common/storage", "vs/platform/storage/common/storage", "vs/platform/storage/common/storageIpc", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, async_1, lifecycle_1, network_1, resources_1, storage_1, storage_2, storageIpc_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$l8b = void 0;
    class $l8b extends storage_2.$Xo {
        constructor(bb, cb, db, eb) {
            super();
            this.bb = bb;
            this.cb = cb;
            this.db = db;
            this.eb = eb;
            this.s = this.cb.defaultProfile;
            this.U = this.fb();
            this.W = this.cb.currentProfile;
            this.X = this.B(new lifecycle_1.$jc());
            this.Y = this.gb(this.W);
            this.Z = this.bb?.id;
            this.$ = this.B(new lifecycle_1.$jc());
            this.ab = this.hb(this.bb);
        }
        fb() {
            const storageDataBaseClient = this.B(new storageIpc_1.$aAb(this.db.getChannel('storage')));
            const applicationStorage = this.B(new storage_1.$Ro(storageDataBaseClient));
            this.B(applicationStorage.onDidChangeStorage(e => this.u(-1 /* StorageScope.APPLICATION */, e)));
            return applicationStorage;
        }
        gb(profile) {
            // First clear any previously associated disposables
            this.X.clear();
            // Remember profile associated to profile storage
            this.W = profile;
            let profileStorage;
            if ((0, storage_2.$Yo)(profile)) {
                // If we are using default profile storage, the profile storage is
                // actually the same as application storage. As such we
                // avoid creating the storage library a second time on
                // the same DB.
                profileStorage = this.U;
            }
            else {
                const storageDataBaseClient = this.X.add(new storageIpc_1.$bAb(this.db.getChannel('storage'), profile));
                profileStorage = this.X.add(new storage_1.$Ro(storageDataBaseClient));
            }
            this.X.add(profileStorage.onDidChangeStorage(e => this.u(0 /* StorageScope.PROFILE */, e)));
            return profileStorage;
        }
        hb(workspace) {
            // First clear any previously associated disposables
            this.$.clear();
            // Remember workspace ID for logging later
            this.Z = workspace?.id;
            let workspaceStorage = undefined;
            if (workspace) {
                const storageDataBaseClient = this.$.add(new storageIpc_1.$cAb(this.db.getChannel('storage'), workspace));
                workspaceStorage = this.$.add(new storage_1.$Ro(storageDataBaseClient));
                this.$.add(workspaceStorage.onDidChangeStorage(e => this.u(1 /* StorageScope.WORKSPACE */, e)));
            }
            return workspaceStorage;
        }
        async O() {
            // Init all storage locations
            await async_1.Promises.settled([
                this.U.init(),
                this.Y.init(),
                this.ab?.init() ?? Promise.resolve()
            ]);
        }
        P(scope) {
            switch (scope) {
                case -1 /* StorageScope.APPLICATION */:
                    return this.U;
                case 0 /* StorageScope.PROFILE */:
                    return this.Y;
                default:
                    return this.ab;
            }
        }
        Q(scope) {
            switch (scope) {
                case -1 /* StorageScope.APPLICATION */:
                    return this.s.globalStorageHome.with({ scheme: network_1.Schemas.file }).fsPath;
                case 0 /* StorageScope.PROFILE */:
                    return this.W?.globalStorageHome.with({ scheme: network_1.Schemas.file }).fsPath;
                default:
                    return this.Z ? `${(0, resources_1.$ig)(this.eb.workspaceStorageHome, this.Z, 'state.vscdb').with({ scheme: network_1.Schemas.file }).fsPath}` : undefined;
            }
        }
        async close() {
            // Stop periodic scheduler and idle runner as we now collect state normally
            this.t();
            // Signal as event so that clients can still store data
            this.w(storage_2.WillSaveStateReason.SHUTDOWN);
            // Do it
            await async_1.Promises.settled([
                this.U.close(),
                this.Y.close(),
                this.ab?.close() ?? Promise.resolve()
            ]);
        }
        async R(toProfile) {
            if (!this.M(this.W, toProfile)) {
                return;
            }
            const oldProfileStorage = this.Y;
            const oldItems = oldProfileStorage.items;
            // Close old profile storage but only if this is
            // different from application storage!
            if (oldProfileStorage !== this.U) {
                await oldProfileStorage.close();
            }
            // Create new profile storage & init
            this.Y = this.gb(toProfile);
            await this.Y.init();
            // Handle data switch and eventing
            this.N(oldItems, this.Y, 0 /* StorageScope.PROFILE */);
        }
        async S(toWorkspace, preserveData) {
            const oldWorkspaceStorage = this.ab;
            const oldItems = oldWorkspaceStorage?.items ?? new Map();
            // Close old workspace storage
            await oldWorkspaceStorage?.close();
            // Create new workspace storage & init
            this.ab = this.hb(toWorkspace);
            await this.ab.init();
            // Handle data switch and eventing
            this.N(oldItems, this.ab, 1 /* StorageScope.WORKSPACE */);
        }
        hasScope(scope) {
            if ((0, userDataProfile_1.$Dk)(scope)) {
                return this.W.id === scope.id;
            }
            return this.Z === scope.id;
        }
    }
    exports.$l8b = $l8b;
});
//# sourceMappingURL=storageService.js.map