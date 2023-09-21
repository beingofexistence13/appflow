/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/performance", "vs/base/common/types", "vs/base/parts/storage/common/storage", "vs/platform/instantiation/common/instantiation", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, async_1, event_1, lifecycle_1, performance_1, types_1, storage_1, instantiation_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1o = exports.$Zo = exports.$Yo = exports.$Xo = exports.$Wo = exports.StorageTarget = exports.StorageScope = exports.WillSaveStateReason = exports.$Vo = exports.$Uo = exports.$To = void 0;
    exports.$To = '__$__isNewStorageMarker';
    exports.$Uo = '__$__targetStorageMarker';
    exports.$Vo = (0, instantiation_1.$Bh)('storageService');
    var WillSaveStateReason;
    (function (WillSaveStateReason) {
        /**
         * No specific reason to save state.
         */
        WillSaveStateReason[WillSaveStateReason["NONE"] = 0] = "NONE";
        /**
         * A hint that the workbench is about to shutdown.
         */
        WillSaveStateReason[WillSaveStateReason["SHUTDOWN"] = 1] = "SHUTDOWN";
    })(WillSaveStateReason || (exports.WillSaveStateReason = WillSaveStateReason = {}));
    var StorageScope;
    (function (StorageScope) {
        /**
         * The stored data will be scoped to all workspaces across all profiles.
         */
        StorageScope[StorageScope["APPLICATION"] = -1] = "APPLICATION";
        /**
         * The stored data will be scoped to all workspaces of the same profile.
         */
        StorageScope[StorageScope["PROFILE"] = 0] = "PROFILE";
        /**
         * The stored data will be scoped to the current workspace.
         */
        StorageScope[StorageScope["WORKSPACE"] = 1] = "WORKSPACE";
    })(StorageScope || (exports.StorageScope = StorageScope = {}));
    var StorageTarget;
    (function (StorageTarget) {
        /**
         * The stored data is user specific and applies across machines.
         */
        StorageTarget[StorageTarget["USER"] = 0] = "USER";
        /**
         * The stored data is machine specific.
         */
        StorageTarget[StorageTarget["MACHINE"] = 1] = "MACHINE";
    })(StorageTarget || (exports.StorageTarget = StorageTarget = {}));
    function $Wo(storage) {
        const keysRaw = storage.get(exports.$Uo);
        if (keysRaw) {
            try {
                return JSON.parse(keysRaw);
            }
            catch (error) {
                // Fail gracefully
            }
        }
        return Object.create(null);
    }
    exports.$Wo = $Wo;
    class $Xo extends lifecycle_1.$kc {
        static { this.a = 60 * 1000; } // every minute
        constructor(m = { flushInterval: $Xo.a }) {
            super();
            this.m = m;
            this.b = this.B(new event_1.$id());
            this.c = this.B(new event_1.$id());
            this.onDidChangeTarget = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onWillSaveState = this.f.event;
            this.h = this.B(new async_1.$Sg(() => this.n(), this.m.flushInterval));
            this.j = this.B(new lifecycle_1.$lc());
            this.C = undefined;
            this.F = undefined;
            this.H = undefined;
        }
        onDidChangeValue(scope, key, disposable) {
            return event_1.Event.filter(this.b.event, e => e.scope === scope && (key === undefined || e.key === key), disposable);
        }
        n() {
            this.j.value = (0, async_1.$Wg)(() => {
                if (this.r()) {
                    this.flush();
                }
                // repeat
                this.h.schedule();
            });
        }
        r() {
            return true;
        }
        t() {
            (0, lifecycle_1.$fc)([this.j, this.h]);
        }
        initialize() {
            if (!this.g) {
                this.g = (async () => {
                    // Init all storage locations
                    (0, performance_1.mark)('code/willInitStorage');
                    try {
                        await this.O(); // Ask subclasses to initialize storage
                    }
                    finally {
                        (0, performance_1.mark)('code/didInitStorage');
                    }
                    // On some OS we do not get enough time to persist state on shutdown (e.g. when
                    // Windows restarts after applying updates). In other cases, VSCode might crash,
                    // so we periodically save state to reduce the chance of loosing any state.
                    // In the browser we do not have support for long running unload sequences. As such,
                    // we cannot ask for saving state in that moment, because that would result in a
                    // long running operation.
                    // Instead, periodically ask customers to save save. The library will be clever enough
                    // to only save state that has actually changed.
                    this.h.schedule();
                })();
            }
            return this.g;
        }
        u(scope, event) {
            const { key, external } = event;
            // Specially handle `TARGET_KEY`
            if (key === exports.$Uo) {
                // Clear our cached version which is now out of date
                switch (scope) {
                    case -1 /* StorageScope.APPLICATION */:
                        this.H = undefined;
                        break;
                    case 0 /* StorageScope.PROFILE */:
                        this.F = undefined;
                        break;
                    case 1 /* StorageScope.WORKSPACE */:
                        this.C = undefined;
                        break;
                }
                // Emit as `didChangeTarget` event
                this.c.fire({ scope });
            }
            // Emit any other key to outside
            else {
                this.b.fire({ scope, key, target: this.J(scope)[key], external });
            }
        }
        w(reason) {
            this.f.fire({ reason });
        }
        get(key, scope, fallbackValue) {
            return this.P(scope)?.get(key, fallbackValue);
        }
        getBoolean(key, scope, fallbackValue) {
            return this.P(scope)?.getBoolean(key, fallbackValue);
        }
        getNumber(key, scope, fallbackValue) {
            return this.P(scope)?.getNumber(key, fallbackValue);
        }
        getObject(key, scope, fallbackValue) {
            return this.P(scope)?.getObject(key, fallbackValue);
        }
        storeAll(entries, external) {
            this.y(() => {
                for (const entry of entries) {
                    this.store(entry.key, entry.value, entry.scope, entry.target, external);
                }
            });
        }
        store(key, value, scope, target, external = false) {
            // We remove the key for undefined/null values
            if ((0, types_1.$sf)(value)) {
                this.remove(key, scope, external);
                return;
            }
            // Update our datastructures but send events only after
            this.y(() => {
                // Update key-target map
                this.z(key, scope, target);
                // Store actual value
                this.P(scope)?.set(key, value, external);
            });
        }
        remove(key, scope, external = false) {
            // Update our datastructures but send events only after
            this.y(() => {
                // Update key-target map
                this.z(key, scope, undefined);
                // Remove actual key
                this.P(scope)?.delete(key, external);
            });
        }
        y(fn) {
            // Pause emitters
            this.b.pause();
            this.c.pause();
            try {
                fn();
            }
            finally {
                // Resume emitters
                this.b.resume();
                this.c.resume();
            }
        }
        keys(scope, target) {
            const keys = [];
            const keyTargets = this.J(scope);
            for (const key of Object.keys(keyTargets)) {
                const keyTarget = keyTargets[key];
                if (keyTarget === target) {
                    keys.push(key);
                }
            }
            return keys;
        }
        z(key, scope, target, external = false) {
            // Add
            const keyTargets = this.J(scope);
            if (typeof target === 'number') {
                if (keyTargets[key] !== target) {
                    keyTargets[key] = target;
                    this.P(scope)?.set(exports.$Uo, JSON.stringify(keyTargets), external);
                }
            }
            // Remove
            else {
                if (typeof keyTargets[key] === 'number') {
                    delete keyTargets[key];
                    this.P(scope)?.set(exports.$Uo, JSON.stringify(keyTargets), external);
                }
            }
        }
        get D() {
            if (!this.C) {
                this.C = this.L(1 /* StorageScope.WORKSPACE */);
            }
            return this.C;
        }
        get G() {
            if (!this.F) {
                this.F = this.L(0 /* StorageScope.PROFILE */);
            }
            return this.F;
        }
        get I() {
            if (!this.H) {
                this.H = this.L(-1 /* StorageScope.APPLICATION */);
            }
            return this.H;
        }
        J(scope) {
            switch (scope) {
                case -1 /* StorageScope.APPLICATION */:
                    return this.I;
                case 0 /* StorageScope.PROFILE */:
                    return this.G;
                default:
                    return this.D;
            }
        }
        L(scope) {
            const storage = this.P(scope);
            return storage ? $Wo(storage) : Object.create(null);
        }
        isNew(scope) {
            return this.getBoolean(exports.$To, scope) === true;
        }
        async flush(reason = WillSaveStateReason.NONE) {
            // Signal event to collect changes
            this.f.fire({ reason });
            const applicationStorage = this.P(-1 /* StorageScope.APPLICATION */);
            const profileStorage = this.P(0 /* StorageScope.PROFILE */);
            const workspaceStorage = this.P(1 /* StorageScope.WORKSPACE */);
            switch (reason) {
                // Unspecific reason: just wait when data is flushed
                case WillSaveStateReason.NONE:
                    await async_1.Promises.settled([
                        applicationStorage?.whenFlushed() ?? Promise.resolve(),
                        profileStorage?.whenFlushed() ?? Promise.resolve(),
                        workspaceStorage?.whenFlushed() ?? Promise.resolve()
                    ]);
                    break;
                // Shutdown: we want to flush as soon as possible
                // and not hit any delays that might be there
                case WillSaveStateReason.SHUTDOWN:
                    await async_1.Promises.settled([
                        applicationStorage?.flush(0) ?? Promise.resolve(),
                        profileStorage?.flush(0) ?? Promise.resolve(),
                        workspaceStorage?.flush(0) ?? Promise.resolve()
                    ]);
                    break;
            }
        }
        async log() {
            const applicationItems = this.P(-1 /* StorageScope.APPLICATION */)?.items ?? new Map();
            const profileItems = this.P(0 /* StorageScope.PROFILE */)?.items ?? new Map();
            const workspaceItems = this.P(1 /* StorageScope.WORKSPACE */)?.items ?? new Map();
            return $1o(applicationItems, profileItems, workspaceItems, this.Q(-1 /* StorageScope.APPLICATION */) ?? '', this.Q(0 /* StorageScope.PROFILE */) ?? '', this.Q(1 /* StorageScope.WORKSPACE */) ?? '');
        }
        async optimize(scope) {
            // Await pending data to be flushed to the DB
            // before attempting to optimize the DB
            await this.flush();
            return this.P(scope)?.optimize();
        }
        async switch(to, preserveData) {
            // Signal as event so that clients can store data before we switch
            this.w(WillSaveStateReason.NONE);
            if ((0, userDataProfile_1.$Dk)(to)) {
                return this.R(to, preserveData);
            }
            return this.S(to, preserveData);
        }
        M(from, to) {
            if (from.id === to.id) {
                return false; // both profiles are same
            }
            if ($Yo(to) && $Yo(from)) {
                return false; // both profiles are using default
            }
            return true;
        }
        N(oldStorage, newStorage, scope) {
            this.y(() => {
                // Signal storage keys that have changed
                const handledkeys = new Set();
                for (const [key, oldValue] of oldStorage) {
                    handledkeys.add(key);
                    const newValue = newStorage.get(key);
                    if (newValue !== oldValue) {
                        this.u(scope, { key, external: true });
                    }
                }
                for (const [key] of newStorage.items) {
                    if (!handledkeys.has(key)) {
                        this.u(scope, { key, external: true });
                    }
                }
            });
        }
    }
    exports.$Xo = $Xo;
    function $Yo(profile) {
        return profile.isDefault || !!profile.useDefaultFlags?.globalState;
    }
    exports.$Yo = $Yo;
    class $Zo extends $Xo {
        constructor() {
            super();
            this.U = this.B(new storage_1.$Ro(new storage_1.$So(), { hint: storage_1.StorageHint.STORAGE_IN_MEMORY }));
            this.W = this.B(new storage_1.$Ro(new storage_1.$So(), { hint: storage_1.StorageHint.STORAGE_IN_MEMORY }));
            this.X = this.B(new storage_1.$Ro(new storage_1.$So(), { hint: storage_1.StorageHint.STORAGE_IN_MEMORY }));
            this.B(this.X.onDidChangeStorage(e => this.u(1 /* StorageScope.WORKSPACE */, e)));
            this.B(this.W.onDidChangeStorage(e => this.u(0 /* StorageScope.PROFILE */, e)));
            this.B(this.U.onDidChangeStorage(e => this.u(-1 /* StorageScope.APPLICATION */, e)));
        }
        P(scope) {
            switch (scope) {
                case -1 /* StorageScope.APPLICATION */:
                    return this.U;
                case 0 /* StorageScope.PROFILE */:
                    return this.W;
                default:
                    return this.X;
            }
        }
        Q(scope) {
            switch (scope) {
                case -1 /* StorageScope.APPLICATION */:
                    return 'inMemory (application)';
                case 0 /* StorageScope.PROFILE */:
                    return 'inMemory (profile)';
                default:
                    return 'inMemory (workspace)';
            }
        }
        async O() { }
        async R() {
            // no-op when in-memory
        }
        async S() {
            // no-op when in-memory
        }
        r() {
            return false;
        }
        hasScope(scope) {
            return false;
        }
    }
    exports.$Zo = $Zo;
    async function $1o(application, profile, workspace, applicationPath, profilePath, workspacePath) {
        const safeParse = (value) => {
            try {
                return JSON.parse(value);
            }
            catch (error) {
                return value;
            }
        };
        const applicationItems = new Map();
        const applicationItemsParsed = new Map();
        application.forEach((value, key) => {
            applicationItems.set(key, value);
            applicationItemsParsed.set(key, safeParse(value));
        });
        const profileItems = new Map();
        const profileItemsParsed = new Map();
        profile.forEach((value, key) => {
            profileItems.set(key, value);
            profileItemsParsed.set(key, safeParse(value));
        });
        const workspaceItems = new Map();
        const workspaceItemsParsed = new Map();
        workspace.forEach((value, key) => {
            workspaceItems.set(key, value);
            workspaceItemsParsed.set(key, safeParse(value));
        });
        if (applicationPath !== profilePath) {
            console.group(`Storage: Application (path: ${applicationPath})`);
        }
        else {
            console.group(`Storage: Application & Profile (path: ${applicationPath}, default profile)`);
        }
        const applicationValues = [];
        applicationItems.forEach((value, key) => {
            applicationValues.push({ key, value });
        });
        console.table(applicationValues);
        console.groupEnd();
        console.log(applicationItemsParsed);
        if (applicationPath !== profilePath) {
            console.group(`Storage: Profile (path: ${profilePath}, profile specific)`);
            const profileValues = [];
            profileItems.forEach((value, key) => {
                profileValues.push({ key, value });
            });
            console.table(profileValues);
            console.groupEnd();
            console.log(profileItemsParsed);
        }
        console.group(`Storage: Workspace (path: ${workspacePath})`);
        const workspaceValues = [];
        workspaceItems.forEach((value, key) => {
            workspaceValues.push({ key, value });
        });
        console.table(workspaceValues);
        console.groupEnd();
        console.log(workspaceItemsParsed);
    }
    exports.$1o = $1o;
});
//# sourceMappingURL=storage.js.map