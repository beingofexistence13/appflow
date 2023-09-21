/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/stopwatch", "vs/base/common/uri", "vs/base/node/pfs", "vs/base/parts/storage/common/storage", "vs/base/parts/storage/node/storage", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/base/common/network"], function (require, exports, arrays_1, async_1, event_1, lifecycle_1, path_1, stopwatch_1, uri_1, pfs_1, storage_1, storage_2, log_1, storage_3, telemetry_1, workspace_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$u5b = exports.$t5b = exports.$s5b = exports.$r5b = void 0;
    class BaseStorageMain extends lifecycle_1.$kc {
        static { this.a = 2000; }
        get storage() { return this.f; }
        constructor(m, n) {
            super();
            this.m = m;
            this.n = n;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeStorage = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidCloseStorage = this.c.event;
            this.f = this.B(new storage_1.$Ro(new storage_1.$So(), { hint: storage_1.StorageHint.STORAGE_IN_MEMORY })); // storage is in-memory until initialized
            this.g = undefined;
            this.h = new async_1.$2g();
            this.whenInit = this.h.p;
            this.j = storage_1.StorageState.None;
        }
        isInMemory() {
            return this.f.isInMemory();
        }
        init() {
            if (!this.g) {
                this.g = (async () => {
                    if (this.j !== storage_1.StorageState.None) {
                        return; // either closed or already initialized
                    }
                    try {
                        // Create storage via subclasses
                        const storage = this.B(await this.t());
                        // Replace our in-memory storage with the real
                        // once as soon as possible without awaiting
                        // the init call.
                        this.f.dispose();
                        this.f = storage;
                        // Re-emit storage changes via event
                        this.B(storage.onDidChangeStorage(e => this.b.fire(e)));
                        // Await storage init
                        await this.s(storage);
                        // Ensure we track whether storage is new or not
                        const isNewStorage = storage.getBoolean(storage_3.$To);
                        if (isNewStorage === undefined) {
                            storage.set(storage_3.$To, true);
                        }
                        else if (isNewStorage) {
                            storage.set(storage_3.$To, false);
                        }
                    }
                    catch (error) {
                        this.m.error(`[storage main] initialize(): Unable to init storage due to ${error}`);
                    }
                    finally {
                        // Update state
                        this.j = storage_1.StorageState.Initialized;
                        // Mark init promise as completed
                        this.h.complete();
                    }
                })();
            }
            return this.g;
        }
        r() {
            return {
                logTrace: (this.m.getLevel() === log_1.LogLevel.Trace) ? msg => this.m.trace(msg) : undefined,
                logError: error => this.m.error(error)
            };
        }
        s(storage) {
            return storage.init();
        }
        get items() { return this.f.items; }
        get(key, fallbackValue) {
            return this.f.get(key, fallbackValue);
        }
        set(key, value) {
            return this.f.set(key, value);
        }
        delete(key) {
            return this.f.delete(key);
        }
        optimize() {
            return this.f.optimize();
        }
        async close() {
            // Measure how long it takes to close storage
            const watch = new stopwatch_1.$bd(false);
            await this.w();
            watch.stop();
            // If close() is taking a long time, there is
            // a chance that the underlying DB is large
            // either on disk or in general. In that case
            // log some additional info to further diagnose
            if (watch.elapsed() > BaseStorageMain.a) {
                await this.u(watch);
            }
            // Signal as event
            this.c.fire();
        }
        async u(watch) {
            if (!this.path) {
                return;
            }
            try {
                const largestEntries = (0, arrays_1.top)(Array.from(this.f.items.entries())
                    .map(([key, value]) => ({ key, length: value.length })), (entryA, entryB) => entryB.length - entryA.length, 5)
                    .map(entry => `${entry.key}:${entry.length}`).join(', ');
                const dbSize = (await this.n.stat(uri_1.URI.file(this.path))).size;
                this.m.warn(`[storage main] detected slow close() operation: Time: ${watch.elapsed()}ms, DB size: ${dbSize}b, Large Keys: ${largestEntries}`);
            }
            catch (error) {
                this.m.error('[storage main] figuring out stats for slow DB on close() resulted in an error', error);
            }
        }
        async w() {
            // Ensure we are not accidentally leaving
            // a pending initialized storage behind in
            // case `close()` was called before `init()`
            // finishes.
            if (this.g) {
                await this.g;
            }
            // Update state
            this.j = storage_1.StorageState.Closed;
            // Propagate to storage lib
            await this.f.close();
        }
    }
    class BaseProfileAwareStorageMain extends BaseStorageMain {
        static { this.y = 'state.vscdb'; }
        get path() {
            if (!this.C.useInMemoryStorage) {
                return (0, path_1.$9d)(this.z.globalStorageHome.with({ scheme: network_1.Schemas.file }).fsPath, BaseProfileAwareStorageMain.y);
            }
            return undefined;
        }
        constructor(z, C, logService, fileService) {
            super(logService, fileService);
            this.z = z;
            this.C = C;
        }
        async t() {
            return new storage_1.$Ro(new storage_2.$nT(this.path ?? storage_2.$nT.IN_MEMORY_PATH, {
                logging: this.r()
            }), !this.path ? { hint: storage_1.StorageHint.STORAGE_IN_MEMORY } : undefined);
        }
    }
    class $r5b extends BaseProfileAwareStorageMain {
        constructor(profile, options, logService, fileService) {
            super(profile, options, logService, fileService);
        }
    }
    exports.$r5b = $r5b;
    class $s5b extends BaseProfileAwareStorageMain {
        constructor(options, userDataProfileService, logService, fileService) {
            super(userDataProfileService.defaultProfile, options, logService, fileService);
        }
        async s(storage) {
            await super.s(storage);
            // Apply telemetry values as part of the application storage initialization
            this.G(storage);
        }
        G(storage) {
            // First session date (once)
            const firstSessionDate = storage.get(telemetry_1.$_k, undefined);
            if (firstSessionDate === undefined) {
                storage.set(telemetry_1.$_k, new Date().toUTCString());
            }
            // Last / current session (always)
            // previous session date was the "current" one at that time
            // current session date is "now"
            const lastSessionDate = storage.get(telemetry_1.$$k, undefined);
            const currentSessionDate = new Date().toUTCString();
            storage.set(telemetry_1.$al, typeof lastSessionDate === 'undefined' ? null : lastSessionDate);
            storage.set(telemetry_1.$$k, currentSessionDate);
        }
    }
    exports.$s5b = $s5b;
    class $t5b extends BaseStorageMain {
        static { this.y = 'state.vscdb'; }
        static { this.z = 'workspace.json'; }
        get path() {
            if (!this.D.useInMemoryStorage) {
                return (0, path_1.$9d)(this.F.workspaceStorageHome.with({ scheme: network_1.Schemas.file }).fsPath, this.C.id, $t5b.y);
            }
            return undefined;
        }
        constructor(C, D, logService, F, fileService) {
            super(logService, fileService);
            this.C = C;
            this.D = D;
            this.F = F;
        }
        async t() {
            const { storageFilePath, wasCreated } = await this.H();
            return new storage_1.$Ro(new storage_2.$nT(storageFilePath, {
                logging: this.r()
            }), { hint: this.D.useInMemoryStorage ? storage_1.StorageHint.STORAGE_IN_MEMORY : wasCreated ? storage_1.StorageHint.STORAGE_DOES_NOT_EXIST : undefined });
        }
        async H() {
            // Return early if using inMemory storage
            if (this.D.useInMemoryStorage) {
                return { storageFilePath: storage_2.$nT.IN_MEMORY_PATH, wasCreated: true };
            }
            // Otherwise, ensure the storage folder exists on disk
            const workspaceStorageFolderPath = (0, path_1.$9d)(this.F.workspaceStorageHome.with({ scheme: network_1.Schemas.file }).fsPath, this.C.id);
            const workspaceStorageDatabasePath = (0, path_1.$9d)(workspaceStorageFolderPath, $t5b.y);
            const storageExists = await pfs_1.Promises.exists(workspaceStorageFolderPath);
            if (storageExists) {
                return { storageFilePath: workspaceStorageDatabasePath, wasCreated: false };
            }
            // Ensure storage folder exists
            await pfs_1.Promises.mkdir(workspaceStorageFolderPath, { recursive: true });
            // Write metadata into folder (but do not await)
            this.I(workspaceStorageFolderPath);
            return { storageFilePath: workspaceStorageDatabasePath, wasCreated: true };
        }
        async I(workspaceStorageFolderPath) {
            let meta = undefined;
            if ((0, workspace_1.$Lh)(this.C)) {
                meta = { folder: this.C.uri.toString() };
            }
            else if ((0, workspace_1.$Qh)(this.C)) {
                meta = { workspace: this.C.configPath.toString() };
            }
            if (meta) {
                try {
                    const workspaceStorageMetaPath = (0, path_1.$9d)(workspaceStorageFolderPath, $t5b.z);
                    const storageExists = await pfs_1.Promises.exists(workspaceStorageMetaPath);
                    if (!storageExists) {
                        await pfs_1.Promises.writeFile(workspaceStorageMetaPath, JSON.stringify(meta, undefined, 2));
                    }
                }
                catch (error) {
                    this.m.error(`[storage main] ensureWorkspaceStorageFolderMeta(): Unable to create workspace storage metadata due to ${error}`);
                }
            }
        }
    }
    exports.$t5b = $t5b;
    class $u5b extends BaseStorageMain {
        get path() {
            return undefined; // in-memory has no path
        }
        async t() {
            return new storage_1.$Ro(new storage_1.$So(), { hint: storage_1.StorageHint.STORAGE_IN_MEMORY });
        }
    }
    exports.$u5b = $u5b;
});
//# sourceMappingURL=storageMain.js.map