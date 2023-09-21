/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/types"], function (require, exports, async_1, event_1, lifecycle_1, marshalling_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InMemoryStorageDatabase = exports.Storage = exports.StorageState = exports.isStorageItemsChangeEvent = exports.StorageHint = void 0;
    var StorageHint;
    (function (StorageHint) {
        // A hint to the storage that the storage
        // does not exist on disk yet. This allows
        // the storage library to improve startup
        // time by not checking the storage for data.
        StorageHint[StorageHint["STORAGE_DOES_NOT_EXIST"] = 0] = "STORAGE_DOES_NOT_EXIST";
        // A hint to the storage that the storage
        // is backed by an in-memory storage.
        StorageHint[StorageHint["STORAGE_IN_MEMORY"] = 1] = "STORAGE_IN_MEMORY";
    })(StorageHint || (exports.StorageHint = StorageHint = {}));
    function isStorageItemsChangeEvent(thing) {
        const candidate = thing;
        return candidate?.changed instanceof Map || candidate?.deleted instanceof Set;
    }
    exports.isStorageItemsChangeEvent = isStorageItemsChangeEvent;
    var StorageState;
    (function (StorageState) {
        StorageState[StorageState["None"] = 0] = "None";
        StorageState[StorageState["Initialized"] = 1] = "Initialized";
        StorageState[StorageState["Closed"] = 2] = "Closed";
    })(StorageState || (exports.StorageState = StorageState = {}));
    class Storage extends lifecycle_1.Disposable {
        static { this.DEFAULT_FLUSH_DELAY = 100; }
        constructor(database, options = Object.create(null)) {
            super();
            this.database = database;
            this.options = options;
            this._onDidChangeStorage = this._register(new event_1.PauseableEmitter());
            this.onDidChangeStorage = this._onDidChangeStorage.event;
            this.state = StorageState.None;
            this.cache = new Map();
            this.flushDelayer = this._register(new async_1.ThrottledDelayer(Storage.DEFAULT_FLUSH_DELAY));
            this.pendingDeletes = new Set();
            this.pendingInserts = new Map();
            this.pendingClose = undefined;
            this.whenFlushedCallbacks = [];
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.database.onDidChangeItemsExternal(e => this.onDidChangeItemsExternal(e)));
        }
        onDidChangeItemsExternal(e) {
            this._onDidChangeStorage.pause();
            try {
                // items that change external require us to update our
                // caches with the values. we just accept the value and
                // emit an event if there is a change.
                e.changed?.forEach((value, key) => this.acceptExternal(key, value));
                e.deleted?.forEach(key => this.acceptExternal(key, undefined));
            }
            finally {
                this._onDidChangeStorage.resume();
            }
        }
        acceptExternal(key, value) {
            if (this.state === StorageState.Closed) {
                return; // Return early if we are already closed
            }
            let changed = false;
            // Item got removed, check for deletion
            if ((0, types_1.isUndefinedOrNull)(value)) {
                changed = this.cache.delete(key);
            }
            // Item got updated, check for change
            else {
                const currentValue = this.cache.get(key);
                if (currentValue !== value) {
                    this.cache.set(key, value);
                    changed = true;
                }
            }
            // Signal to outside listeners
            if (changed) {
                this._onDidChangeStorage.fire({ key, external: true });
            }
        }
        get items() {
            return this.cache;
        }
        get size() {
            return this.cache.size;
        }
        async init() {
            if (this.state !== StorageState.None) {
                return; // either closed or already initialized
            }
            this.state = StorageState.Initialized;
            if (this.options.hint === StorageHint.STORAGE_DOES_NOT_EXIST) {
                // return early if we know the storage file does not exist. this is a performance
                // optimization to not load all items of the underlying storage if we know that
                // there can be no items because the storage does not exist.
                return;
            }
            this.cache = await this.database.getItems();
        }
        get(key, fallbackValue) {
            const value = this.cache.get(key);
            if ((0, types_1.isUndefinedOrNull)(value)) {
                return fallbackValue;
            }
            return value;
        }
        getBoolean(key, fallbackValue) {
            const value = this.get(key);
            if ((0, types_1.isUndefinedOrNull)(value)) {
                return fallbackValue;
            }
            return value === 'true';
        }
        getNumber(key, fallbackValue) {
            const value = this.get(key);
            if ((0, types_1.isUndefinedOrNull)(value)) {
                return fallbackValue;
            }
            return parseInt(value, 10);
        }
        getObject(key, fallbackValue) {
            const value = this.get(key);
            if ((0, types_1.isUndefinedOrNull)(value)) {
                return fallbackValue;
            }
            return (0, marshalling_1.parse)(value);
        }
        async set(key, value, external = false) {
            if (this.state === StorageState.Closed) {
                return; // Return early if we are already closed
            }
            // We remove the key for undefined/null values
            if ((0, types_1.isUndefinedOrNull)(value)) {
                return this.delete(key, external);
            }
            // Otherwise, convert to String and store
            const valueStr = (0, types_1.isObject)(value) || Array.isArray(value) ? (0, marshalling_1.stringify)(value) : String(value);
            // Return early if value already set
            const currentValue = this.cache.get(key);
            if (currentValue === valueStr) {
                return;
            }
            // Update in cache and pending
            this.cache.set(key, valueStr);
            this.pendingInserts.set(key, valueStr);
            this.pendingDeletes.delete(key);
            // Event
            this._onDidChangeStorage.fire({ key, external });
            // Accumulate work by scheduling after timeout
            return this.doFlush();
        }
        async delete(key, external = false) {
            if (this.state === StorageState.Closed) {
                return; // Return early if we are already closed
            }
            // Remove from cache and add to pending
            const wasDeleted = this.cache.delete(key);
            if (!wasDeleted) {
                return; // Return early if value already deleted
            }
            if (!this.pendingDeletes.has(key)) {
                this.pendingDeletes.add(key);
            }
            this.pendingInserts.delete(key);
            // Event
            this._onDidChangeStorage.fire({ key, external });
            // Accumulate work by scheduling after timeout
            return this.doFlush();
        }
        async optimize() {
            if (this.state === StorageState.Closed) {
                return; // Return early if we are already closed
            }
            // Await pending data to be flushed to the DB
            // before attempting to optimize the DB
            await this.flush(0);
            return this.database.optimize();
        }
        async close() {
            if (!this.pendingClose) {
                this.pendingClose = this.doClose();
            }
            return this.pendingClose;
        }
        async doClose() {
            // Update state
            this.state = StorageState.Closed;
            // Trigger new flush to ensure data is persisted and then close
            // even if there is an error flushing. We must always ensure
            // the DB is closed to avoid corruption.
            //
            // Recovery: we pass our cache over as recovery option in case
            // the DB is not healthy.
            try {
                await this.doFlush(0 /* as soon as possible */);
            }
            catch (error) {
                // Ignore
            }
            await this.database.close(() => this.cache);
        }
        get hasPending() {
            return this.pendingInserts.size > 0 || this.pendingDeletes.size > 0;
        }
        async flushPending() {
            if (!this.hasPending) {
                return; // return early if nothing to do
            }
            // Get pending data
            const updateRequest = { insert: this.pendingInserts, delete: this.pendingDeletes };
            // Reset pending data for next run
            this.pendingDeletes = new Set();
            this.pendingInserts = new Map();
            // Update in storage and release any
            // waiters we have once done
            return this.database.updateItems(updateRequest).finally(() => {
                if (!this.hasPending) {
                    while (this.whenFlushedCallbacks.length) {
                        this.whenFlushedCallbacks.pop()?.();
                    }
                }
            });
        }
        async flush(delay) {
            if (!this.hasPending) {
                return; // return early if nothing to do
            }
            return this.doFlush(delay);
        }
        async doFlush(delay) {
            if (this.options.hint === StorageHint.STORAGE_IN_MEMORY) {
                return this.flushPending(); // return early if in-memory
            }
            return this.flushDelayer.trigger(() => this.flushPending(), delay);
        }
        async whenFlushed() {
            if (!this.hasPending) {
                return; // return early if nothing to do
            }
            return new Promise(resolve => this.whenFlushedCallbacks.push(resolve));
        }
        isInMemory() {
            return this.options.hint === StorageHint.STORAGE_IN_MEMORY;
        }
    }
    exports.Storage = Storage;
    class InMemoryStorageDatabase {
        constructor() {
            this.onDidChangeItemsExternal = event_1.Event.None;
            this.items = new Map();
        }
        async getItems() {
            return this.items;
        }
        async updateItems(request) {
            request.insert?.forEach((value, key) => this.items.set(key, value));
            request.delete?.forEach(key => this.items.delete(key));
        }
        async optimize() { }
        async close() { }
    }
    exports.InMemoryStorageDatabase = InMemoryStorageDatabase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvcGFydHMvc3RvcmFnZS9jb21tb24vc3RvcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsSUFBWSxXQVdYO0lBWEQsV0FBWSxXQUFXO1FBRXRCLHlDQUF5QztRQUN6QywwQ0FBMEM7UUFDMUMseUNBQXlDO1FBQ3pDLDZDQUE2QztRQUM3QyxpRkFBc0IsQ0FBQTtRQUV0Qix5Q0FBeUM7UUFDekMscUNBQXFDO1FBQ3JDLHVFQUFpQixDQUFBO0lBQ2xCLENBQUMsRUFYVyxXQUFXLDJCQUFYLFdBQVcsUUFXdEI7SUFnQkQsU0FBZ0IseUJBQXlCLENBQUMsS0FBYztRQUN2RCxNQUFNLFNBQVMsR0FBRyxLQUE2QyxDQUFDO1FBRWhFLE9BQU8sU0FBUyxFQUFFLE9BQU8sWUFBWSxHQUFHLElBQUksU0FBUyxFQUFFLE9BQU8sWUFBWSxHQUFHLENBQUM7SUFDL0UsQ0FBQztJQUpELDhEQUlDO0lBa0VELElBQVksWUFJWDtJQUpELFdBQVksWUFBWTtRQUN2QiwrQ0FBSSxDQUFBO1FBQ0osNkRBQVcsQ0FBQTtRQUNYLG1EQUFNLENBQUE7SUFDUCxDQUFDLEVBSlcsWUFBWSw0QkFBWixZQUFZLFFBSXZCO0lBRUQsTUFBYSxPQUFRLFNBQVEsc0JBQVU7aUJBRWQsd0JBQW1CLEdBQUcsR0FBRyxBQUFOLENBQU87UUFrQmxELFlBQ29CLFFBQTBCLEVBQzVCLFVBQTJCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBRS9ELEtBQUssRUFBRSxDQUFDO1lBSFcsYUFBUSxHQUFSLFFBQVEsQ0FBa0I7WUFDNUIsWUFBTyxHQUFQLE9BQU8sQ0FBdUM7WUFsQi9DLHdCQUFtQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3QkFBZ0IsRUFBdUIsQ0FBQyxDQUFDO1lBQzFGLHVCQUFr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