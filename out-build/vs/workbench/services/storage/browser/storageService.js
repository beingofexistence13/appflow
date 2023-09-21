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
define(["require", "exports", "vs/base/browser/broadcast", "vs/base/browser/browser", "vs/base/browser/indexedDB", "vs/base/common/async", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/types", "vs/base/parts/storage/common/storage", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, broadcast_1, browser_1, indexedDB_1, async_1, errorMessage_1, event_1, lifecycle_1, types_1, storage_1, log_1, storage_2, userDataProfile_1) {
    "use strict";
    var $z2b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$A2b = exports.$z2b = void 0;
    let $z2b = class $z2b extends storage_2.$Xo {
        static { $z2b_1 = this; }
        static { this.s = 5 * 1000; } // every 5s because async operations are not permitted on shutdown
        get hasPendingUpdate() {
            return Boolean(this.W?.hasPendingUpdate ||
                this.Z?.hasPendingUpdate ||
                this.cb?.hasPendingUpdate);
        }
        constructor(eb, fb, gb) {
            super({ flushInterval: $z2b_1.s });
            this.eb = eb;
            this.fb = fb;
            this.gb = gb;
            this.X = new async_1.$2g();
            this.$ = this.fb.currentProfile;
            this.ab = this.B(new lifecycle_1.$jc());
            this.hb();
        }
        hb() {
            this.B(this.fb.onDidChangeCurrentProfile(e => e.join(this.R(e.profile))));
        }
        async O() {
            // Init storages
            await async_1.Promises.settled([
                this.jb(),
                this.kb(this.$),
                this.lb()
            ]);
        }
        async jb() {
            const applicationStorageIndexedDB = await $A2b.createApplicationStorage(this.gb);
            this.W = this.B(applicationStorageIndexedDB);
            this.U = this.B(new storage_1.$Ro(this.W));
            this.B(this.U.onDidChangeStorage(e => this.u(-1 /* StorageScope.APPLICATION */, e)));
            await this.U.init();
            this.mb(this.U);
            this.X.complete({ indexedDb: applicationStorageIndexedDB, storage: this.U });
        }
        async kb(profile) {
            // First clear any previously associated disposables
            this.ab.clear();
            // Remember profile associated to profile storage
            this.$ = profile;
            if ((0, storage_2.$Yo)(this.$)) {
                // If we are using default profile storage, the profile storage is
                // actually the same as application storage. As such we
                // avoid creating the storage library a second time on
                // the same DB.
                const { indexedDb: applicationStorageIndexedDB, storage: applicationStorage } = await this.X.p;
                this.Z = applicationStorageIndexedDB;
                this.Y = applicationStorage;
                this.ab.add(this.Y.onDidChangeStorage(e => this.u(0 /* StorageScope.PROFILE */, e)));
            }
            else {
                const profileStorageIndexedDB = await $A2b.createProfileStorage(this.$, this.gb);
                this.Z = this.ab.add(profileStorageIndexedDB);
                this.Y = this.ab.add(new storage_1.$Ro(this.Z));
                this.ab.add(this.Y.onDidChangeStorage(e => this.u(0 /* StorageScope.PROFILE */, e)));
                await this.Y.init();
                this.mb(this.Y);
            }
        }
        async lb() {
            const workspaceStorageIndexedDB = await $A2b.createWorkspaceStorage(this.eb.id, this.gb);
            this.cb = this.B(workspaceStorageIndexedDB);
            this.bb = this.B(new storage_1.$Ro(this.cb));
            this.B(this.bb.onDidChangeStorage(e => this.u(1 /* StorageScope.WORKSPACE */, e)));
            await this.bb.init();
            this.mb(this.bb);
        }
        mb(storage) {
            const firstOpen = storage.getBoolean(storage_2.$To);
            if (firstOpen === undefined) {
                storage.set(storage_2.$To, true);
            }
            else if (firstOpen) {
                storage.set(storage_2.$To, false);
            }
        }
        P(scope) {
            switch (scope) {
                case -1 /* StorageScope.APPLICATION */:
                    return this.U;
                case 0 /* StorageScope.PROFILE */:
                    return this.Y;
                default:
                    return this.bb;
            }
        }
        Q(scope) {
            switch (scope) {
                case -1 /* StorageScope.APPLICATION */:
                    return this.W?.name;
                case 0 /* StorageScope.PROFILE */:
                    return this.Z?.name;
                default:
                    return this.cb?.name;
            }
        }
        async R(toProfile) {
            if (!this.M(this.$, toProfile)) {
                return;
            }
            const oldProfileStorage = (0, types_1.$uf)(this.Y);
            const oldItems = oldProfileStorage.items;
            // Close old profile storage but only if this is
            // different from application storage!
            if (oldProfileStorage !== this.U) {
                await oldProfileStorage.close();
            }
            // Create new profile storage & init
            await this.kb(toProfile);
            // Handle data switch and eventing
            this.N(oldItems, (0, types_1.$uf)(this.Y), 0 /* StorageScope.PROFILE */);
        }
        async S(toWorkspace, preserveData) {
            throw new Error('Migrating storage is currently unsupported in Web');
        }
        r() {
            // this flush() will potentially cause new state to be stored
            // since new state will only be created while the document
            // has focus, one optimization is to not run this when the
            // document has no focus, assuming that state has not changed
            //
            // another optimization is to not collect more state if we
            // have a pending update already running which indicates
            // that the connection is either slow or disconnected and
            // thus unhealthy.
            return document.hasFocus() && !this.hasPendingUpdate;
        }
        close() {
            // Safari: there is an issue where the page can hang on load when
            // a previous session has kept IndexedDB transactions running.
            // The only fix seems to be to cancel any pending transactions
            // (https://github.com/microsoft/vscode/issues/136295)
            //
            // On all other browsers, we keep the databases opened because
            // we expect data to be written when the unload happens.
            if (browser_1.$8N) {
                this.U?.close();
                this.Z?.close();
                this.cb?.close();
            }
            // Always dispose to ensure that no timeouts or callbacks
            // get triggered in this phase.
            this.dispose();
        }
        async clear() {
            // Clear key/values
            for (const scope of [-1 /* StorageScope.APPLICATION */, 0 /* StorageScope.PROFILE */, 1 /* StorageScope.WORKSPACE */]) {
                for (const target of [0 /* StorageTarget.USER */, 1 /* StorageTarget.MACHINE */]) {
                    for (const key of this.keys(scope, target)) {
                        this.remove(key, scope);
                    }
                }
                await this.P(scope)?.whenFlushed();
            }
            // Clear databases
            await async_1.Promises.settled([
                this.W?.clear() ?? Promise.resolve(),
                this.Z?.clear() ?? Promise.resolve(),
                this.cb?.clear() ?? Promise.resolve()
            ]);
        }
        hasScope(scope) {
            if ((0, userDataProfile_1.$Dk)(scope)) {
                return this.$.id === scope.id;
            }
            return this.eb.id === scope.id;
        }
    };
    exports.$z2b = $z2b;
    exports.$z2b = $z2b = $z2b_1 = __decorate([
        __param(2, log_1.$5i)
    ], $z2b);
    class InMemoryIndexedDBStorageDatabase extends storage_1.$So {
        constructor() {
            super(...arguments);
            this.hasPendingUpdate = false;
            this.name = 'in-memory-indexedb-storage';
        }
        async clear() {
            (await this.getItems()).clear();
        }
        dispose() {
            // No-op
        }
    }
    class $A2b extends lifecycle_1.$kc {
        static async createApplicationStorage(logService) {
            return $A2b.create({ id: 'global', broadcastChanges: true }, logService);
        }
        static async createProfileStorage(profile, logService) {
            return $A2b.create({ id: `global-${profile.id}`, broadcastChanges: true }, logService);
        }
        static async createWorkspaceStorage(workspaceId, logService) {
            return $A2b.create({ id: workspaceId }, logService);
        }
        static async create(options, logService) {
            try {
                const database = new $A2b(options, logService);
                await database.h;
                return database;
            }
            catch (error) {
                logService.error(`[IndexedDB Storage ${options.id}] create(): ${(0, errorMessage_1.$mi)(error, true)}`);
                return new InMemoryIndexedDBStorageDatabase();
            }
        }
        static { this.a = 'vscode-web-state-db-'; }
        static { this.b = 'ItemTable'; }
        get hasPendingUpdate() { return !!this.g; }
        constructor(options, j) {
            super();
            this.j = j;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeItemsExternal = this.c.event;
            this.g = undefined;
            this.name = `${$A2b.a}${options.id}`;
            this.f = options.broadcastChanges ? this.B(new broadcast_1.$UN(this.name)) : undefined;
            this.h = this.n();
            this.m();
        }
        m() {
            // Check for storage change events from other
            // windows/tabs via `BroadcastChannel` mechanisms.
            if (this.f) {
                this.B(this.f.onDidReceiveData(data => {
                    if ((0, storage_1.$Qo)(data)) {
                        this.c.fire(data);
                    }
                }));
            }
        }
        async n() {
            try {
                return await indexedDB_1.$3Q.create(this.name, undefined, [$A2b.b]);
            }
            catch (error) {
                this.j.error(`[IndexedDB Storage ${this.name}] connect() error: ${(0, errorMessage_1.$mi)(error)}`);
                throw error;
            }
        }
        async getItems() {
            const db = await this.h;
            function isValid(value) {
                return typeof value === 'string';
            }
            return db.getKeyValues($A2b.b, isValid);
        }
        async updateItems(request) {
            // Run the update
            let didUpdate = false;
            this.g = this.r(request);
            try {
                didUpdate = await this.g;
            }
            finally {
                this.g = undefined;
            }
            // Broadcast changes to other windows/tabs if enabled
            // and only if we actually did update storage items.
            if (this.f && didUpdate) {
                const event = {
                    changed: request.insert,
                    deleted: request.delete
                };
                this.f.postData(event);
            }
        }
        async r(request) {
            // Return early if the request is empty
            const toInsert = request.insert;
            const toDelete = request.delete;
            if ((!toInsert && !toDelete) || (toInsert?.size === 0 && toDelete?.size === 0)) {
                return false;
            }
            const db = await this.h;
            // Update `ItemTable` with inserts and/or deletes
            await db.runInTransaction($A2b.b, 'readwrite', objectStore => {
                const requests = [];
                // Inserts
                if (toInsert) {
                    for (const [key, value] of toInsert) {
                        requests.push(objectStore.put(value, key));
                    }
                }
                // Deletes
                if (toDelete) {
                    for (const key of toDelete) {
                        requests.push(objectStore.delete(key));
                    }
                }
                return requests;
            });
            return true;
        }
        async optimize() {
            // not suported in IndexedDB
        }
        async close() {
            const db = await this.h;
            // Wait for pending updates to having finished
            await this.g;
            // Finally, close IndexedDB
            return db.close();
        }
        async clear() {
            const db = await this.h;
            await db.runInTransaction($A2b.b, 'readwrite', objectStore => objectStore.clear());
        }
    }
    exports.$A2b = $A2b;
});
//# sourceMappingURL=storageService.js.map