/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/stopwatch", "vs/base/common/uri", "vs/base/node/pfs", "vs/base/parts/storage/common/storage", "vs/base/parts/storage/node/storage", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/base/common/network"], function (require, exports, arrays_1, async_1, event_1, lifecycle_1, path_1, stopwatch_1, uri_1, pfs_1, storage_1, storage_2, log_1, storage_3, telemetry_1, workspace_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InMemoryStorageMain = exports.WorkspaceStorageMain = exports.ApplicationStorageMain = exports.ProfileStorageMain = void 0;
    class BaseStorageMain extends lifecycle_1.Disposable {
        static { this.LOG_SLOW_CLOSE_THRESHOLD = 2000; }
        get storage() { return this._storage; }
        constructor(logService, fileService) {
            super();
            this.logService = logService;
            this.fileService = fileService;
            this._onDidChangeStorage = this._register(new event_1.Emitter());
            this.onDidChangeStorage = this._onDidChangeStorage.event;
            this._onDidCloseStorage = this._register(new event_1.Emitter());
            this.onDidCloseStorage = this._onDidCloseStorage.event;
            this._storage = this._register(new storage_1.Storage(new storage_1.InMemoryStorageDatabase(), { hint: storage_1.StorageHint.STORAGE_IN_MEMORY })); // storage is in-memory until initialized
            this.initializePromise = undefined;
            this.whenInitPromise = new async_1.DeferredPromise();
            this.whenInit = this.whenInitPromise.p;
            this.state = storage_1.StorageState.None;
        }
        isInMemory() {
            return this._storage.isInMemory();
        }
        init() {
            if (!this.initializePromise) {
                this.initializePromise = (async () => {
                    if (this.state !== storage_1.StorageState.None) {
                        return; // either closed or already initialized
                    }
                    try {
                        // Create storage via subclasses
                        const storage = this._register(await this.doCreate());
                        // Replace our in-memory storage with the real
                        // once as soon as possible without awaiting
                        // the init call.
                        this._storage.dispose();
                        this._storage = storage;
                        // Re-emit storage changes via event
                        this._register(storage.onDidChangeStorage(e => this._onDidChangeStorage.fire(e)));
                        // Await storage init
                        await this.doInit(storage);
                        // Ensure we track whether storage is new or not
                        const isNewStorage = storage.getBoolean(storage_3.IS_NEW_KEY);
                        if (isNewStorage === undefined) {
                            storage.set(storage_3.IS_NEW_KEY, true);
                        }
                        else if (isNewStorage) {
                            storage.set(storage_3.IS_NEW_KEY, false);
                        }
                    }
                    catch (error) {
                        this.logService.error(`[storage main] initialize(): Unable to init storage due to ${error}`);
                    }
                    finally {
                        // Update state
                        this.state = storage_1.StorageState.Initialized;
                        // Mark init promise as completed
                        this.whenInitPromise.complete();
                    }
                })();
            }
            return this.initializePromise;
        }
        createLoggingOptions() {
            return {
                logTrace: (this.logService.getLevel() === log_1.LogLevel.Trace) ? msg => this.logService.trace(msg) : undefined,
                logError: error => this.logService.error(error)
            };
        }
        doInit(storage) {
            return storage.init();
        }
        get items() { return this._storage.items; }
        get(key, fallbackValue) {
            return this._storage.get(key, fallbackValue);
        }
        set(key, value) {
            return this._storage.set(key, value);
        }
        delete(key) {
            return this._storage.delete(key);
        }
        optimize() {
            return this._storage.optimize();
        }
        async close() {
            // Measure how long it takes to close storage
            const watch = new stopwatch_1.StopWatch(false);
            await this.doClose();
            watch.stop();
            // If close() is taking a long time, there is
            // a chance that the underlying DB is large
            // either on disk or in general. In that case
            // log some additional info to further diagnose
            if (watch.elapsed() > BaseStorageMain.LOG_SLOW_CLOSE_THRESHOLD) {
                await this.logSlowClose(watch);
            }
            // Signal as event
            this._onDidCloseStorage.fire();
        }
        async logSlowClose(watch) {
            if (!this.path) {
                return;
            }
            try {
                const largestEntries = (0, arrays_1.top)(Array.from(this._storage.items.entries())
                    .map(([key, value]) => ({ key, length: value.length })), (entryA, entryB) => entryB.length - entryA.length, 5)
                    .map(entry => `${entry.key}:${entry.length}`).join(', ');
                const dbSize = (await this.fileService.stat(uri_1.URI.file(this.path))).size;
                this.logService.warn(`[storage main] detected slow close() operation: Time: ${watch.elapsed()}ms, DB size: ${dbSize}b, Large Keys: ${largestEntries}`);
            }
            catch (error) {
                this.logService.error('[storage main] figuring out stats for slow DB on close() resulted in an error', error);
            }
        }
        async doClose() {
            // Ensure we are not accidentally leaving
            // a pending initialized storage behind in
            // case `close()` was called before `init()`
            // finishes.
            if (this.initializePromise) {
                await this.initializePromise;
            }
            // Update state
            this.state = storage_1.StorageState.Closed;
            // Propagate to storage lib
            await this._storage.close();
        }
    }
    class BaseProfileAwareStorageMain extends BaseStorageMain {
        static { this.STORAGE_NAME = 'state.vscdb'; }
        get path() {
            if (!this.options.useInMemoryStorage) {
                return (0, path_1.join)(this.profile.globalStorageHome.with({ scheme: network_1.Schemas.file }).fsPath, BaseProfileAwareStorageMain.STORAGE_NAME);
            }
            return undefined;
        }
        constructor(profile, options, logService, fileService) {
            super(logService, fileService);
            this.profile = profile;
            this.options = options;
        }
        async doCreate() {
            return new storage_1.Storage(new storage_2.SQLiteStorageDatabase(this.path ?? storage_2.SQLiteStorageDatabase.IN_MEMORY_PATH, {
                logging: this.createLoggingOptions()
            }), !this.path ? { hint: storage_1.StorageHint.STORAGE_IN_MEMORY } : undefined);
        }
    }
    class ProfileStorageMain extends BaseProfileAwareStorageMain {
        constructor(profile, options, logService, fileService) {
            super(profile, options, logService, fileService);
        }
    }
    exports.ProfileStorageMain = ProfileStorageMain;
    class ApplicationStorageMain extends BaseProfileAwareStorageMain {
        constructor(options, userDataProfileService, logService, fileService) {
            super(userDataProfileService.defaultProfile, options, logService, fileService);
        }
        async doInit(storage) {
            await super.doInit(storage);
            // Apply telemetry values as part of the application storage initialization
            this.updateTelemetryState(storage);
        }
        updateTelemetryState(storage) {
            // First session date (once)
            const firstSessionDate = storage.get(telemetry_1.firstSessionDateStorageKey, undefined);
            if (firstSessionDate === undefined) {
                storage.set(telemetry_1.firstSessionDateStorageKey, new Date().toUTCString());
            }
            // Last / current session (always)
            // previous session date was the "current" one at that time
            // current session date is "now"
            const lastSessionDate = storage.get(telemetry_1.currentSessionDateStorageKey, undefined);
            const currentSessionDate = new Date().toUTCString();
            storage.set(telemetry_1.lastSessionDateStorageKey, typeof lastSessionDate === 'undefined' ? null : lastSessionDate);
            storage.set(telemetry_1.currentSessionDateStorageKey, currentSessionDate);
        }
    }
    exports.ApplicationStorageMain = ApplicationStorageMain;
    class WorkspaceStorageMain extends BaseStorageMain {
        static { this.WORKSPACE_STORAGE_NAME = 'state.vscdb'; }
        static { this.WORKSPACE_META_NAME = 'workspace.json'; }
        get path() {
            if (!this.options.useInMemoryStorage) {
                return (0, path_1.join)(this.environmentService.workspaceStorageHome.with({ scheme: network_1.Schemas.file }).fsPath, this.workspace.id, WorkspaceStorageMain.WORKSPACE_STORAGE_NAME);
            }
            return undefined;
        }
        constructor(workspace, options, logService, environmentService, fileService) {
            super(logService, fileService);
            this.workspace = workspace;
            this.options = options;
            this.environmentService = environmentService;
        }
        async doCreate() {
            const { storageFilePath, wasCreated } = await this.prepareWorkspaceStorageFolder();
            return new storage_1.Storage(new storage_2.SQLiteStorageDatabase(storageFilePath, {
                logging: this.createLoggingOptions()
            }), { hint: this.options.useInMemoryStorage ? storage_1.StorageHint.STORAGE_IN_MEMORY : wasCreated ? storage_1.StorageHint.STORAGE_DOES_NOT_EXIST : undefined });
        }
        async prepareWorkspaceStorageFolder() {
            // Return early if using inMemory storage
            if (this.options.useInMemoryStorage) {
                return { storageFilePath: storage_2.SQLiteStorageDatabase.IN_MEMORY_PATH, wasCreated: true };
            }
            // Otherwise, ensure the storage folder exists on disk
            const workspaceStorageFolderPath = (0, path_1.join)(this.environmentService.workspaceStorageHome.with({ scheme: network_1.Schemas.file }).fsPath, this.workspace.id);
            const workspaceStorageDatabasePath = (0, path_1.join)(workspaceStorageFolderPath, WorkspaceStorageMain.WORKSPACE_STORAGE_NAME);
            const storageExists = await pfs_1.Promises.exists(workspaceStorageFolderPath);
            if (storageExists) {
                return { storageFilePath: workspaceStorageDatabasePath, wasCreated: false };
            }
            // Ensure storage folder exists
            await pfs_1.Promises.mkdir(workspaceStorageFolderPath, { recursive: true });
            // Write metadata into folder (but do not await)
            this.ensureWorkspaceStorageFolderMeta(workspaceStorageFolderPath);
            return { storageFilePath: workspaceStorageDatabasePath, wasCreated: true };
        }
        async ensureWorkspaceStorageFolderMeta(workspaceStorageFolderPath) {
            let meta = undefined;
            if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(this.workspace)) {
                meta = { folder: this.workspace.uri.toString() };
            }
            else if ((0, workspace_1.isWorkspaceIdentifier)(this.workspace)) {
                meta = { workspace: this.workspace.configPath.toString() };
            }
            if (meta) {
                try {
                    const workspaceStorageMetaPath = (0, path_1.join)(workspaceStorageFolderPath, WorkspaceStorageMain.WORKSPACE_META_NAME);
                    const storageExists = await pfs_1.Promises.exists(workspaceStorageMetaPath);
                    if (!storageExists) {
                        await pfs_1.Promises.writeFile(workspaceStorageMetaPath, JSON.stringify(meta, undefined, 2));
                    }
                }
                catch (error) {
                    this.logService.error(`[storage main] ensureWorkspaceStorageFolderMeta(): Unable to create workspace storage metadata due to ${error}`);
                }
            }
        }
    }
    exports.WorkspaceStorageMain = WorkspaceStorageMain;
    class InMemoryStorageMain extends BaseStorageMain {
        get path() {
            return undefined; // in-memory has no path
        }
        async doCreate() {
            return new storage_1.Storage(new storage_1.InMemoryStorageDatabase(), { hint: storage_1.StorageHint.STORAGE_IN_MEMORY });
        }
    }
    exports.InMemoryStorageMain = InMemoryStorageMain;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZU1haW4uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9zdG9yYWdlL2VsZWN0cm9uLW1haW4vc3RvcmFnZU1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBK0doRyxNQUFlLGVBQWdCLFNBQVEsc0JBQVU7aUJBRXhCLDZCQUF3QixHQUFHLElBQUksQUFBUCxDQUFRO1FBU3hELElBQUksT0FBTyxLQUFlLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFXakQsWUFDb0IsVUFBdUIsRUFDekIsV0FBeUI7WUFFMUMsS0FBSyxFQUFFLENBQUM7WUFIVyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ3pCLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBcEJ4Qix3QkFBbUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUF1QixDQUFDLENBQUM7WUFDbkYsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQztZQUU1Qyx1QkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNqRSxzQkFBaUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDO1lBRW5ELGFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksaUJBQU8sQ0FBQyxJQUFJLGlDQUF1QixFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUscUJBQVcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLHlDQUF5QztZQUt6SixzQkFBaUIsR0FBOEIsU0FBUyxDQUFDO1lBRWhELG9CQUFlLEdBQUcsSUFBSSx1QkFBZSxFQUFRLENBQUM7WUFDdEQsYUFBUSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBRW5DLFVBQUss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