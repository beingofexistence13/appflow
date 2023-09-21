/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/performance", "vs/base/common/types", "vs/base/parts/storage/common/storage", "vs/platform/instantiation/common/instantiation", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, async_1, event_1, lifecycle_1, performance_1, types_1, storage_1, instantiation_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.logStorage = exports.InMemoryStorageService = exports.isProfileUsingDefaultStorage = exports.AbstractStorageService = exports.loadKeyTargets = exports.StorageTarget = exports.StorageScope = exports.WillSaveStateReason = exports.IStorageService = exports.TARGET_KEY = exports.IS_NEW_KEY = void 0;
    exports.IS_NEW_KEY = '__$__isNewStorageMarker';
    exports.TARGET_KEY = '__$__targetStorageMarker';
    exports.IStorageService = (0, instantiation_1.createDecorator)('storageService');
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
    function loadKeyTargets(storage) {
        const keysRaw = storage.get(exports.TARGET_KEY);
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
    exports.loadKeyTargets = loadKeyTargets;
    class AbstractStorageService extends lifecycle_1.Disposable {
        static { this.DEFAULT_FLUSH_INTERVAL = 60 * 1000; } // every minute
        constructor(options = { flushInterval: AbstractStorageService.DEFAULT_FLUSH_INTERVAL }) {
            super();
            this.options = options;
            this._onDidChangeValue = this._register(new event_1.PauseableEmitter());
            this._onDidChangeTarget = this._register(new event_1.PauseableEmitter());
            this.onDidChangeTarget = this._onDidChangeTarget.event;
            this._onWillSaveState = this._register(new event_1.Emitter());
            this.onWillSaveState = this._onWillSaveState.event;
            this.flushWhenIdleScheduler = this._register(new async_1.RunOnceScheduler(() => this.doFlushWhenIdle(), this.options.flushInterval));
            this.runFlushWhenIdle = this._register(new lifecycle_1.MutableDisposable());
            this._workspaceKeyTargets = undefined;
            this._profileKeyTargets = undefined;
            this._applicationKeyTargets = undefined;
        }
        onDidChangeValue(scope, key, disposable) {
            return event_1.Event.filter(this._onDidChangeValue.event, e => e.scope === scope && (key === undefined || e.key === key), disposable);
        }
        doFlushWhenIdle() {
            this.runFlushWhenIdle.value = (0, async_1.runWhenIdle)(() => {
                if (this.shouldFlushWhenIdle()) {
                    this.flush();
                }
                // repeat
                this.flushWhenIdleScheduler.schedule();
            });
        }
        shouldFlushWhenIdle() {
            return true;
        }
        stopFlushWhenIdle() {
            (0, lifecycle_1.dispose)([this.runFlushWhenIdle, this.flushWhenIdleScheduler]);
        }
        initialize() {
            if (!this.initializationPromise) {
                this.initializationPromise = (async () => {
                    // Init all storage locations
                    (0, performance_1.mark)('code/willInitStorage');
                    try {
                        await this.doInitialize(); // Ask subclasses to initialize storage
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
                    this.flushWhenIdleScheduler.schedule();
                })();
            }
            return this.initializationPromise;
        }
        emitDidChangeValue(scope, event) {
            const { key, external } = event;
            // Specially handle `TARGET_KEY`
            if (key === exports.TARGET_KEY) {
                // Clear our cached version which is now out of date
                switch (scope) {
                    case -1 /* StorageScope.APPLICATION */:
                        this._applicationKeyTargets = undefined;
                        break;
                    case 0 /* StorageScope.PROFILE */:
                        this._profileKeyTargets = undefined;
                        break;
                    case 1 /* StorageScope.WORKSPACE */:
                        this._workspaceKeyTargets = undefined;
                        break;
                }
                // Emit as `didChangeTarget` event
                this._onDidChangeTarget.fire({ scope });
            }
            // Emit any other key to outside
            else {
                this._onDidChangeValue.fire({ scope, key, target: this.getKeyTargets(scope)[key], external });
            }
        }
        emitWillSaveState(reason) {
            this._onWillSaveState.fire({ reason });
        }
        get(key, scope, fallbackValue) {
            return this.getStorage(scope)?.get(key, fallbackValue);
        }
        getBoolean(key, scope, fallbackValue) {
            return this.getStorage(scope)?.getBoolean(key, fallbackValue);
        }
        getNumber(key, scope, fallbackValue) {
            return this.getStorage(scope)?.getNumber(key, fallbackValue);
        }
        getObject(key, scope, fallbackValue) {
            return this.getStorage(scope)?.getObject(key, fallbackValue);
        }
        storeAll(entries, external) {
            this.withPausedEmitters(() => {
                for (const entry of entries) {
                    this.store(entry.key, entry.value, entry.scope, entry.target, external);
                }
            });
        }
        store(key, value, scope, target, external = false) {
            // We remove the key for undefined/null values
            if ((0, types_1.isUndefinedOrNull)(value)) {
                this.remove(key, scope, external);
                return;
            }
            // Update our datastructures but send events only after
            this.withPausedEmitters(() => {
                // Update key-target map
                this.updateKeyTarget(key, scope, target);
                // Store actual value
                this.getStorage(scope)?.set(key, value, external);
            });
        }
        remove(key, scope, external = false) {
            // Update our datastructures but send events only after
            this.withPausedEmitters(() => {
                // Update key-target map
                this.updateKeyTarget(key, scope, undefined);
                // Remove actual key
                this.getStorage(scope)?.delete(key, external);
            });
        }
        withPausedEmitters(fn) {
            // Pause emitters
            this._onDidChangeValue.pause();
            this._onDidChangeTarget.pause();
            try {
                fn();
            }
            finally {
                // Resume emitters
                this._onDidChangeValue.resume();
                this._onDidChangeTarget.resume();
            }
        }
        keys(scope, target) {
            const keys = [];
            const keyTargets = this.getKeyTargets(scope);
            for (const key of Object.keys(keyTargets)) {
                const keyTarget = keyTargets[key];
                if (keyTarget === target) {
                    keys.push(key);
                }
            }
            return keys;
        }
        updateKeyTarget(key, scope, target, external = false) {
            // Add
            const keyTargets = this.getKeyTargets(scope);
            if (typeof target === 'number') {
                if (keyTargets[key] !== target) {
                    keyTargets[key] = target;
                    this.getStorage(scope)?.set(exports.TARGET_KEY, JSON.stringify(keyTargets), external);
                }
            }
            // Remove
            else {
                if (typeof keyTargets[key] === 'number') {
                    delete keyTargets[key];
                    this.getStorage(scope)?.set(exports.TARGET_KEY, JSON.stringify(keyTargets), external);
                }
            }
        }
        get workspaceKeyTargets() {
            if (!this._workspaceKeyTargets) {
                this._workspaceKeyTargets = this.loadKeyTargets(1 /* StorageScope.WORKSPACE */);
            }
            return this._workspaceKeyTargets;
        }
        get profileKeyTargets() {
            if (!this._profileKeyTargets) {
                this._profileKeyTargets = this.loadKeyTargets(0 /* StorageScope.PROFILE */);
            }
            return this._profileKeyTargets;
        }
        get applicationKeyTargets() {
            if (!this._applicationKeyTargets) {
                this._applicationKeyTargets = this.loadKeyTargets(-1 /* StorageScope.APPLICATION */);
            }
            return this._applicationKeyTargets;
        }
        getKeyTargets(scope) {
            switch (scope) {
                case -1 /* StorageScope.APPLICATION */:
                    return this.applicationKeyTargets;
                case 0 /* StorageScope.PROFILE */:
                    return this.profileKeyTargets;
                default:
                    return this.workspaceKeyTargets;
            }
        }
        loadKeyTargets(scope) {
            const storage = this.getStorage(scope);
            return storage ? loadKeyTargets(storage) : Object.create(null);
        }
        isNew(scope) {
            return this.getBoolean(exports.IS_NEW_KEY, scope) === true;
        }
        async flush(reason = WillSaveStateReason.NONE) {
            // Signal event to collect changes
            this._onWillSaveState.fire({ reason });
            const applicationStorage = this.getStorage(-1 /* StorageScope.APPLICATION */);
            const profileStorage = this.getStorage(0 /* StorageScope.PROFILE */);
            const workspaceStorage = this.getStorage(1 /* StorageScope.WORKSPACE */);
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
            const applicationItems = this.getStorage(-1 /* StorageScope.APPLICATION */)?.items ?? new Map();
            const profileItems = this.getStorage(0 /* StorageScope.PROFILE */)?.items ?? new Map();
            const workspaceItems = this.getStorage(1 /* StorageScope.WORKSPACE */)?.items ?? new Map();
            return logStorage(applicationItems, profileItems, workspaceItems, this.getLogDetails(-1 /* StorageScope.APPLICATION */) ?? '', this.getLogDetails(0 /* StorageScope.PROFILE */) ?? '', this.getLogDetails(1 /* StorageScope.WORKSPACE */) ?? '');
        }
        async optimize(scope) {
            // Await pending data to be flushed to the DB
            // before attempting to optimize the DB
            await this.flush();
            return this.getStorage(scope)?.optimize();
        }
        async switch(to, preserveData) {
            // Signal as event so that clients can store data before we switch
            this.emitWillSaveState(WillSaveStateReason.NONE);
            if ((0, userDataProfile_1.isUserDataProfile)(to)) {
                return this.switchToProfile(to, preserveData);
            }
            return this.switchToWorkspace(to, preserveData);
        }
        canSwitchProfile(from, to) {
            if (from.id === to.id) {
                return false; // both profiles are same
            }
            if (isProfileUsingDefaultStorage(to) && isProfileUsingDefaultStorage(from)) {
                return false; // both profiles are using default
            }
            return true;
        }
        switchData(oldStorage, newStorage, scope) {
            this.withPausedEmitters(() => {
                // Signal storage keys that have changed
                const handledkeys = new Set();
                for (const [key, oldValue] of oldStorage) {
                    handledkeys.add(key);
                    const newValue = newStorage.get(key);
                    if (newValue !== oldValue) {
                        this.emitDidChangeValue(scope, { key, external: true });
                    }
                }
                for (const [key] of newStorage.items) {
                    if (!handledkeys.has(key)) {
                        this.emitDidChangeValue(scope, { key, external: true });
                    }
                }
            });
        }
    }
    exports.AbstractStorageService = AbstractStorageService;
    function isProfileUsingDefaultStorage(profile) {
        return profile.isDefault || !!profile.useDefaultFlags?.globalState;
    }
    exports.isProfileUsingDefaultStorage = isProfileUsingDefaultStorage;
    class InMemoryStorageService extends AbstractStorageService {
        constructor() {
            super();
            this.applicationStorage = this._register(new storage_1.Storage(new storage_1.InMemoryStorageDatabase(), { hint: storage_1.StorageHint.STORAGE_IN_MEMORY }));
            this.profileStorage = this._register(new storage_1.Storage(new storage_1.InMemoryStorageDatabase(), { hint: storage_1.StorageHint.STORAGE_IN_MEMORY }));
            this.workspaceStorage = this._register(new storage_1.Storage(new storage_1.InMemoryStorageDatabase(), { hint: storage_1.StorageHint.STORAGE_IN_MEMORY }));
            this._register(this.workspaceStorage.onDidChangeStorage(e => this.emitDidChangeValue(1 /* StorageScope.WORKSPACE */, e)));
            this._register(this.profileStorage.onDidChangeStorage(e => this.emitDidChangeValue(0 /* StorageScope.PROFILE */, e)));
            this._register(this.applicationStorage.onDidChangeStorage(e => this.emitDidChangeValue(-1 /* StorageScope.APPLICATION */, e)));
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
                    return 'inMemory (application)';
                case 0 /* StorageScope.PROFILE */:
                    return 'inMemory (profile)';
                default:
                    return 'inMemory (workspace)';
            }
        }
        async doInitialize() { }
        async switchToProfile() {
            // no-op when in-memory
        }
        async switchToWorkspace() {
            // no-op when in-memory
        }
        shouldFlushWhenIdle() {
            return false;
        }
        hasScope(scope) {
            return false;
        }
    }
    exports.InMemoryStorageService = InMemoryStorageService;
    async function logStorage(application, profile, workspace, applicationPath, profilePath, workspacePath) {
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
    exports.logStorage = logStorage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3N0b3JhZ2UvY29tbW9uL3N0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWW5GLFFBQUEsVUFBVSxHQUFHLHlCQUF5QixDQUFDO0lBQ3ZDLFFBQUEsVUFBVSxHQUFHLDBCQUEwQixDQUFDO0lBRXhDLFFBQUEsZUFBZSxHQUFHLElBQUEsK0JBQWUsRUFBa0IsZ0JBQWdCLENBQUMsQ0FBQztJQUVsRixJQUFZLG1CQVdYO0lBWEQsV0FBWSxtQkFBbUI7UUFFOUI7O1dBRUc7UUFDSCw2REFBSSxDQUFBO1FBRUo7O1dBRUc7UUFDSCxxRUFBUSxDQUFBO0lBQ1QsQ0FBQyxFQVhXLG1CQUFtQixtQ0FBbkIsbUJBQW1CLFFBVzlCO0lBK0xELElBQWtCLFlBZ0JqQjtJQWhCRCxXQUFrQixZQUFZO1FBRTdCOztXQUVHO1FBQ0gsOERBQWdCLENBQUE7UUFFaEI7O1dBRUc7UUFDSCxxREFBVyxDQUFBO1FBRVg7O1dBRUc7UUFDSCx5REFBYSxDQUFBO0lBQ2QsQ0FBQyxFQWhCaUIsWUFBWSw0QkFBWixZQUFZLFFBZ0I3QjtJQUVELElBQWtCLGFBV2pCO0lBWEQsV0FBa0IsYUFBYTtRQUU5Qjs7V0FFRztRQUNILGlEQUFJLENBQUE7UUFFSjs7V0FFRztRQUNILHVEQUFPLENBQUE7SUFDUixDQUFDLEVBWGlCLGFBQWEsNkJBQWIsYUFBYSxRQVc5QjtJQWtERCxTQUFnQixjQUFjLENBQUMsT0FBaUI7UUFDL0MsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBVSxDQUFDLENBQUM7UUFDeEMsSUFBSSxPQUFPLEVBQUU7WUFDWixJQUFJO2dCQUNILE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUMzQjtZQUFDLE9BQU8sS0FBSyxFQUFFO2dC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