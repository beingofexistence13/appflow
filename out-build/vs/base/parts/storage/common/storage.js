/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/types"], function (require, exports, async_1, event_1, lifecycle_1, marshalling_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$So = exports.$Ro = exports.StorageState = exports.$Qo = exports.StorageHint = void 0;
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
    function $Qo(thing) {
        const candidate = thing;
        return candidate?.changed instanceof Map || candidate?.deleted instanceof Set;
    }
    exports.$Qo = $Qo;
    var StorageState;
    (function (StorageState) {
        StorageState[StorageState["None"] = 0] = "None";
        StorageState[StorageState["Initialized"] = 1] = "Initialized";
        StorageState[StorageState["Closed"] = 2] = "Closed";
    })(StorageState || (exports.StorageState = StorageState = {}));
    class $Ro extends lifecycle_1.$kc {
        static { this.a = 100; }
        constructor(r, s = Object.create(null)) {
            super();
            this.r = r;
            this.s = s;
            this.b = this.B(new event_1.$id());
            this.onDidChangeStorage = this.b.event;
            this.c = StorageState.None;
            this.f = new Map();
            this.g = this.B(new async_1.$Eg($Ro.a));
            this.h = new Set();
            this.j = new Map();
            this.m = undefined;
            this.n = [];
            this.t();
        }
        t() {
            this.B(this.r.onDidChangeItemsExternal(e => this.u(e)));
        }
        u(e) {
            this.b.pause();
            try {
                // items that change external require us to update our
                // caches with the values. we just accept the value and
                // emit an event if there is a change.
                e.changed?.forEach((value, key) => this.w(key, value));
                e.deleted?.forEach(key => this.w(key, undefined));
            }
            finally {
                this.b.resume();
            }
        }
        w(key, value) {
            if (this.c === StorageState.Closed) {
                return; // Return early if we are already closed
            }
            let changed = false;
            // Item got removed, check for deletion
            if ((0, types_1.$sf)(value)) {
                changed = this.f.delete(key);
            }
            // Item got updated, check for change
            else {
                const currentValue = this.f.get(key);
                if (currentValue !== value) {
                    this.f.set(key, value);
                    changed = true;
                }
            }
            // Signal to outside listeners
            if (changed) {
                this.b.fire({ key, external: true });
            }
        }
        get items() {
            return this.f;
        }
        get size() {
            return this.f.size;
        }
        async init() {
            if (this.c !== StorageState.None) {
                return; // either closed or already initialized
            }
            this.c = StorageState.Initialized;
            if (this.s.hint === StorageHint.STORAGE_DOES_NOT_EXIST) {
                // return early if we know the storage file does not exist. this is a performance
                // optimization to not load all items of the underlying storage if we know that
                // there can be no items because the storage does not exist.
                return;
            }
            this.f = await this.r.getItems();
        }
        get(key, fallbackValue) {
            const value = this.f.get(key);
            if ((0, types_1.$sf)(value)) {
                return fallbackValue;
            }
            return value;
        }
        getBoolean(key, fallbackValue) {
            const value = this.get(key);
            if ((0, types_1.$sf)(value)) {
                return fallbackValue;
            }
            return value === 'true';
        }
        getNumber(key, fallbackValue) {
            const value = this.get(key);
            if ((0, types_1.$sf)(value)) {
                return fallbackValue;
            }
            return parseInt(value, 10);
        }
        getObject(key, fallbackValue) {
            const value = this.get(key);
            if ((0, types_1.$sf)(value)) {
                return fallbackValue;
            }
            return (0, marshalling_1.$0g)(value);
        }
        async set(key, value, external = false) {
            if (this.c === StorageState.Closed) {
                return; // Return early if we are already closed
            }
            // We remove the key for undefined/null values
            if ((0, types_1.$sf)(value)) {
                return this.delete(key, external);
            }
            // Otherwise, convert to String and store
            const valueStr = (0, types_1.$lf)(value) || Array.isArray(value) ? (0, marshalling_1.$9g)(value) : String(value);
            // Return early if value already set
            const currentValue = this.f.get(key);
            if (currentValue === valueStr) {
                return;
            }
            // Update in cache and pending
            this.f.set(key, valueStr);
            this.j.set(key, valueStr);
            this.h.delete(key);
            // Event
            this.b.fire({ key, external });
            // Accumulate work by scheduling after timeout
            return this.D();
        }
        async delete(key, external = false) {
            if (this.c === StorageState.Closed) {
                return; // Return early if we are already closed
            }
            // Remove from cache and add to pending
            const wasDeleted = this.f.delete(key);
            if (!wasDeleted) {
                return; // Return early if value already deleted
            }
            if (!this.h.has(key)) {
                this.h.add(key);
            }
            this.j.delete(key);
            // Event
            this.b.fire({ key, external });
            // Accumulate work by scheduling after timeout
            return this.D();
        }
        async optimize() {
            if (this.c === StorageState.Closed) {
                return; // Return early if we are already closed
            }
            // Await pending data to be flushed to the DB
            // before attempting to optimize the DB
            await this.flush(0);
            return this.r.optimize();
        }
        async close() {
            if (!this.m) {
                this.m = this.y();
            }
            return this.m;
        }
        async y() {
            // Update state
            this.c = StorageState.Closed;
            // Trigger new flush to ensure data is persisted and then close
            // even if there is an error flushing. We must always ensure
            // the DB is closed to avoid corruption.
            //
            // Recovery: we pass our cache over as recovery option in case
            // the DB is not healthy.
            try {
                await this.D(0 /* as soon as possible */);
            }
            catch (error) {
                // Ignore
            }
            await this.r.close(() => this.f);
        }
        get z() {
            return this.j.size > 0 || this.h.size > 0;
        }
        async C() {
            if (!this.z) {
                return; // return early if nothing to do
            }
            // Get pending data
            const updateRequest = { insert: this.j, delete: this.h };
            // Reset pending data for next run
            this.h = new Set();
            this.j = new Map();
            // Update in storage and release any
            // waiters we have once done
            return this.r.updateItems(updateRequest).finally(() => {
                if (!this.z) {
                    while (this.n.length) {
                        this.n.pop()?.();
                    }
                }
            });
        }
        async flush(delay) {
            if (!this.z) {
                return; // return early if nothing to do
            }
            return this.D(delay);
        }
        async D(delay) {
            if (this.s.hint === StorageHint.STORAGE_IN_MEMORY) {
                return this.C(); // return early if in-memory
            }
            return this.g.trigger(() => this.C(), delay);
        }
        async whenFlushed() {
            if (!this.z) {
                return; // return early if nothing to do
            }
            return new Promise(resolve => this.n.push(resolve));
        }
        isInMemory() {
            return this.s.hint === StorageHint.STORAGE_IN_MEMORY;
        }
    }
    exports.$Ro = $Ro;
    class $So {
        constructor() {
            this.onDidChangeItemsExternal = event_1.Event.None;
            this.a = new Map();
        }
        async getItems() {
            return this.a;
        }
        async updateItems(request) {
            request.insert?.forEach((value, key) => this.a.set(key, value));
            request.delete?.forEach(key => this.a.delete(key));
        }
        async optimize() { }
        async close() { }
    }
    exports.$So = $So;
});
//# sourceMappingURL=storage.js.map