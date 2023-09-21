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
    var BrowserStorageService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IndexedDBStorageDatabase = exports.BrowserStorageService = void 0;
    let BrowserStorageService = class BrowserStorageService extends storage_2.AbstractStorageService {
        static { BrowserStorageService_1 = this; }
        static { this.BROWSER_DEFAULT_FLUSH_INTERVAL = 5 * 1000; } // every 5s because async operations are not permitted on shutdown
        get hasPendingUpdate() {
            return Boolean(this.applicationStorageDatabase?.hasPendingUpdate ||
                this.profileStorageDatabase?.hasPendingUpdate ||
                this.workspaceStorageDatabase?.hasPendingUpdate);
        }
        constructor(workspace, userDataProfileService, logService) {
            super({ flushInterval: BrowserStorageService_1.BROWSER_DEFAULT_FLUSH_INTERVAL });
            this.workspace = workspace;
            this.userDataProfileService = userDataProfileService;
            this.logService = logService;
            this.applicationStoragePromise = new async_1.DeferredPromise();
            this.profileStorageProfile = this.userDataProfileService.currentProfile;
            this.profileStorageDisposables = this._register(new lifecycle_1.DisposableStore());
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.userDataProfileService.onDidChangeCurrentProfile(e => e.join(this.switchToProfile(e.profile))));
        }
        async doInitialize() {
            // Init storages
            await async_1.Promises.settled([
                this.createApplicationStorage(),
                this.createProfileStorage(this.profileStorageProfile),
                this.createWorkspaceStorage()
            ]);
        }
        async createApplicationStorage() {
            const applicationStorageIndexedDB = await IndexedDBStorageDatabase.createApplicationStorage(this.logService);
            this.applicationStorageDatabase = this._register(applicationStorageIndexedDB);
            this.applicationStorage = this._register(new storage_1.Storage(this.applicationStorageDatabase));
            this._register(this.applicationStorage.onDidChangeStorage(e => this.emitDidChangeValue(-1 /* StorageScope.APPLICATION */, e)));
            await this.applicationStorage.init();
            this.updateIsNew(this.applicationStorage);
            this.applicationStoragePromise.complete({ indexedDb: applicationStorageIndexedDB, storage: this.applicationStorage });
        }
        async createProfileStorage(profile) {
            // First clear any previously associated disposables
            this.profileStorageDisposables.clear();
            // Remember profile associated to profile storage
            this.profileStorageProfile = profile;
            if ((0, storage_2.isProfileUsingDefaultStorage)(this.profileStorageProfile)) {
                // If we are using default profile storage, the profile storage is
                // actually the same as application storage. As such we
                // avoid creating the storage library a second time on
                // the same DB.
                const { indexedDb: applicationStorageIndexedDB, storage: applicationStorage } = await this.applicationStoragePromise.p;
                this.profileStorageDatabase = applicationStorageIndexedDB;
                this.profileStorage = applicationStorage;
                this.profileStorageDisposables.add(this.profileStorage.onDidChangeStorage(e => this.emitDidChangeValue(0 /* StorageScope.PROFILE */, e)));
            }
            else {
                const profileStorageIndexedDB = await IndexedDBStorageDatabase.createProfileStorage(this.profileStorageProfile, this.logService);
                this.profileStorageDatabase = this.profileStorageDisposables.add(profileStorageIndexedDB);
                this.profileStorage = this.profileStorageDisposables.add(new storage_1.Storage(this.profileStorageDatabase));
                this.profileStorageDisposables.add(this.profileStorage.onDidChangeStorage(e => this.emitDidChangeValue(0 /* StorageScope.PROFILE */, e)));
                await this.profileStorage.init();
                this.updateIsNew(this.profileStorage);
            }
        }
        async createWorkspaceStorage() {
            const workspaceStorageIndexedDB = await IndexedDBStorageDatabase.createWorkspaceStorage(this.workspace.id, this.logService);
            this.workspaceStorageDatabase = this._register(workspaceStorageIndexedDB);
            this.workspaceStorage = this._register(new storage_1.Storage(this.workspaceStorageDatabase));
            this._register(this.workspaceStorage.onDidChangeStorage(e => this.emitDidChangeValue(1 /* StorageScope.WORKSPACE */, e)));
            await this.workspaceStorage.init();
            this.updateIsNew(this.workspaceStorage);
        }
        updateIsNew(storage) {
            const firstOpen = storage.getBoolean(storage_2.IS_NEW_KEY);
            if (firstOpen === undefined) {
                storage.set(storage_2.IS_NEW_KEY, true);
            }
            else if (firstOpen) {
                storage.set(storage_2.IS_NEW_KEY, false);
            }
        }
        getStorage(scope) {
            switch (scope) {
                case -1 /* StorageScope.APPLICATION */:
                    return this.applicationStorage;
                case 0 /* StorageScope.PROFILE */:
                    return this.profileStorage;
                default:
                    return this.workspaceStorage;
            }
        }
        getLogDetails(scope) {
            switch (scope) {
                case -1 /* StorageScope.APPLICATION */:
                    return this.applicationStorageDatabase?.name;
                case 0 /* StorageScope.PROFILE */:
                    return this.profileStorageDatabase?.name;
                default:
                    return this.workspaceStorageDatabase?.name;
            }
        }
        async switchToProfile(toProfile) {
            if (!this.canSwitchProfile(this.profileStorageProfile, toProfile)) {
                return;
            }
            const oldProfileStorage = (0, types_1.assertIsDefined)(this.profileStorage);
            const oldItems = oldProfileStorage.items;
            // Close old profile storage but only if this is
            // different from application storage!
            if (oldProfileStorage !== this.applicationStorage) {
                await oldProfileStorage.close();
            }
            // Create new profile storage & init
            await this.createProfileStorage(toProfile);
            // Handle data switch and eventing
            this.switchData(oldItems, (0, types_1.assertIsDefined)(this.profileStorage), 0 /* StorageScope.PROFILE */);
        }
        async switchToWorkspace(toWorkspace, preserveData) {
            throw new Error('Migrating storage is currently unsupported in Web');
        }
        shouldFlushWhenIdle() {
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
            if (browser_1.isSafari) {
                this.applicationStorage?.close();
                this.profileStorageDatabase?.close();
                this.workspaceStorageDatabase?.close();
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
                await this.getStorage(scope)?.whenFlushed();
            }
            // Clear databases
            await async_1.Promises.settled([
                this.applicationStorageDatabase?.clear() ?? Promise.resolve(),
                this.profileStorageDatabase?.clear() ?? Promise.resolve(),
                this.workspaceStorageDatabase?.clear() ?? Promise.resolve()
            ]);
        }
        hasScope(scope) {
            if ((0, userDataProfile_1.isUserDataProfile)(scope)) {
                return this.profileStorageProfile.id === scope.id;
            }
            return this.workspace.id === scope.id;
        }
    };
    exports.BrowserStorageService = BrowserStorageService;
    exports.BrowserStorageService = BrowserStorageService = BrowserStorageService_1 = __decorate([
        __param(2, log_1.ILogService)
    ], BrowserStorageService);
    class InMemoryIndexedDBStorageDatabase extends storage_1.InMemoryStorageDatabase {
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
    class IndexedDBStorageDatabase extends lifecycle_1.Disposable {
        static async createApplicationStorage(logService) {
            return IndexedDBStorageDatabase.create({ id: 'global', broadcastChanges: true }, logService);
        }
        static async createProfileStorage(profile, logService) {
            return IndexedDBStorageDatabase.create({ id: `global-${profile.id}`, broadcastChanges: true }, logService);
        }
        static async createWorkspaceStorage(workspaceId, logService) {
            return IndexedDBStorageDatabase.create({ id: workspaceId }, logService);
        }
        static async create(options, logService) {
            try {
                const database = new IndexedDBStorageDatabase(options, logService);
                await database.whenConnected;
                return database;
            }
            catch (error) {
                logService.error(`[IndexedDB Storage ${options.id}] create(): ${(0, errorMessage_1.toErrorMessage)(error, true)}`);
                return new InMemoryIndexedDBStorageDatabase();
            }
        }
        static { this.STORAGE_DATABASE_PREFIX = 'vscode-web-state-db-'; }
        static { this.STORAGE_OBJECT_STORE = 'ItemTable'; }
        get hasPendingUpdate() { return !!this.pendingUpdate; }
        constructor(options, logService) {
            super();
            this.logService = logService;
            this._onDidChangeItemsExternal = this._register(new event_1.Emitter());
            this.onDidChangeItemsExternal = this._onDidChangeItemsExternal.event;
            this.pendingUpdate = undefined;
            this.name = `${IndexedDBStorageDatabase.STORAGE_DATABASE_PREFIX}${options.id}`;
            this.broadcastChannel = options.broadcastChanges ? this._register(new broadcast_1.BroadcastDataChannel(this.name)) : undefined;
            this.whenConnected = this.connect();
            this.registerListeners();
        }
        registerListeners() {
            // Check for storage change events from other
            // windows/tabs via `BroadcastChannel` mechanisms.
            if (this.broadcastChannel) {
                this._register(this.broadcastChannel.onDidReceiveData(data => {
                    if ((0, storage_1.isStorageItemsChangeEvent)(data)) {
                        this._onDidChangeItemsExternal.fire(data);
                    }
                }));
            }
        }
        async connect() {
            try {
                return await indexedDB_1.IndexedDB.create(this.name, undefined, [IndexedDBStorageDatabase.STORAGE_OBJECT_STORE]);
            }
            catch (error) {
                this.logService.error(`[IndexedDB Storage ${this.name}] connect() error: ${(0, errorMessage_1.toErrorMessage)(error)}`);
                throw error;
            }
        }
        async getItems() {
            const db = await this.whenConnected;
            function isValid(value) {
                return typeof value === 'string';
            }
            return db.getKeyValues(IndexedDBStorageDatabase.STORAGE_OBJECT_STORE, isValid);
        }
        async updateItems(request) {
            // Run the update
            let didUpdate = false;
            this.pendingUpdate = this.doUpdateItems(request);
            try {
                didUpdate = await this.pendingUpdate;
            }
            finally {
                this.pendingUpdate = undefined;
            }
            // Broadcast changes to other windows/tabs if enabled
            // and only if we actually did update storage items.
            if (this.broadcastChannel && didUpdate) {
                const event = {
                    changed: request.insert,
                    deleted: request.delete
                };
                this.broadcastChannel.postData(event);
            }
        }
        async doUpdateItems(request) {
            // Return early if the request is empty
            const toInsert = request.insert;
            const toDelete = request.delete;
            if ((!toInsert && !toDelete) || (toInsert?.size === 0 && toDelete?.size === 0)) {
                return false;
            }
            const db = await this.whenConnected;
            // Update `ItemTable` with inserts and/or deletes
            await db.runInTransaction(IndexedDBStorageDatabase.STORAGE_OBJECT_STORE, 'readwrite', objectStore => {
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
            const db = await this.whenConnected;
            // Wait for pending updates to having finished
            await this.pendingUpdate;
            // Finally, close IndexedDB
            return db.close();
        }
        async clear() {
            const db = await this.whenConnected;
            await db.runInTransaction(IndexedDBStorageDatabase.STORAGE_OBJECT_STORE, 'readwrite', objectStore => objectStore.clear());
        }
    }
    exports.IndexedDBStorageDatabase = IndexedDBStorageDatabase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc3RvcmFnZS9icm93c2VyL3N0b3JhZ2VTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFpQnpGLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXNCLFNBQVEsZ0NBQXNCOztpQkFFakQsbUNBQThCLEdBQUcsQ0FBQyxHQUFHLElBQUksQUFBWCxDQUFZLEdBQUMsa0VBQWtFO1FBYzVILElBQUksZ0JBQWdCO1lBQ25CLE9BQU8sT0FBTyxDQUNiLElBQUksQ0FBQywwQkFBMEIsRUFBRSxnQkFBZ0I7Z0JBQ2pELElBQUksQ0FBQyxzQkFBc0IsRUFBRSxnQkFBZ0I7Z0JBQzdDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxnQkFBZ0IsQ0FDL0MsQ0FBQztRQUNILENBQUM7UUFFRCxZQUNrQixTQUFrQyxFQUNsQyxzQkFBK0MsRUFDbkQsVUFBd0M7WUFFckQsS0FBSyxDQUFDLEVBQUUsYUFBYSxFQUFFLHVCQUFxQixDQUFDLDhCQUE4QixFQUFFLENBQUMsQ0FBQztZQUo5RCxjQUFTLEdBQVQsU0FBUyxDQUF5QjtZQUNsQywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXlCO1lBQ2xDLGVBQVUsR0FBVixVQUFVLENBQWE7WUFyQnJDLDhCQUF5QixHQUFHLElBQUksdUJBQWUsRUFBK0QsQ0FBQztZQUl4SCwwQkFBcUIsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsY0FBYyxDQUFDO1lBQzFELDhCQUF5QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQW9CbEYsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLGlCQUFpQjtZQUN4QixJQUFJLENBQUMsU0FBUyxD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