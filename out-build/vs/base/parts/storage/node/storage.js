/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/map", "vs/base/common/path", "vs/base/node/pfs"], function (require, exports, async_1, event_1, map_1, path_1, pfs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nT = void 0;
    class $nT {
        static { this.IN_MEMORY_PATH = ':memory:'; }
        get onDidChangeItemsExternal() { return event_1.Event.None; } // since we are the only client, there can be no external changes
        static { this.a = 2000; } // timeout in ms to retry when opening DB fails with SQLITE_BUSY
        static { this.b = 256; } // maximum number of parameters within a statement
        constructor(g, h = Object.create(null)) {
            this.g = g;
            this.h = h;
            this.c = (0, path_1.$ae)(this.g);
            this.d = new SQLiteStorageDatabaseLogger(this.h.logging);
            this.f = this.n(this.g);
        }
        async getItems() {
            const connection = await this.f;
            const items = new Map();
            const rows = await this.s(connection, 'SELECT * FROM ItemTable');
            rows.forEach(row => items.set(row.key, row.value));
            if (this.d.isTracing) {
                this.d.trace(`[storage ${this.c}] getItems(): ${items.size} rows`);
            }
            return items;
        }
        async updateItems(request) {
            const connection = await this.f;
            return this.j(connection, request);
        }
        j(connection, request) {
            if (this.d.isTracing) {
                this.d.trace(`[storage ${this.c}] updateItems(): insert(${request.insert ? (0, map_1.$xi)(request.insert) : '0'}), delete(${request.delete ? (0, map_1.$yi)(request.delete) : '0'})`);
            }
            return this.t(connection, () => {
                const toInsert = request.insert;
                const toDelete = request.delete;
                // INSERT
                if (toInsert && toInsert.size > 0) {
                    const keysValuesChunks = [];
                    keysValuesChunks.push([]); // seed with initial empty chunk
                    // Split key/values into chunks of SQLiteStorageDatabase.MAX_HOST_PARAMETERS
                    // so that we can efficiently run the INSERT with as many HOST parameters as possible
                    let currentChunkIndex = 0;
                    toInsert.forEach((value, key) => {
                        let keyValueChunk = keysValuesChunks[currentChunkIndex];
                        if (keyValueChunk.length > $nT.b) {
                            currentChunkIndex++;
                            keyValueChunk = [];
                            keysValuesChunks.push(keyValueChunk);
                        }
                        keyValueChunk.push(key, value);
                    });
                    keysValuesChunks.forEach(keysValuesChunk => {
                        this.u(connection, `INSERT INTO ItemTable VALUES ${new Array(keysValuesChunk.length / 2).fill('(?,?)').join(',')}`, stmt => stmt.run(keysValuesChunk), () => {
                            const keys = [];
                            let length = 0;
                            toInsert.forEach((value, key) => {
                                keys.push(key);
                                length += value.length;
                            });
                            return `Keys: ${keys.join(', ')} Length: ${length}`;
                        });
                    });
                }
                // DELETE
                if (toDelete && toDelete.size) {
                    const keysChunks = [];
                    keysChunks.push([]); // seed with initial empty chunk
                    // Split keys into chunks of SQLiteStorageDatabase.MAX_HOST_PARAMETERS
                    // so that we can efficiently run the DELETE with as many HOST parameters
                    // as possible
                    let currentChunkIndex = 0;
                    toDelete.forEach(key => {
                        let keyChunk = keysChunks[currentChunkIndex];
                        if (keyChunk.length > $nT.b) {
                            currentChunkIndex++;
                            keyChunk = [];
                            keysChunks.push(keyChunk);
                        }
                        keyChunk.push(key);
                    });
                    keysChunks.forEach(keysChunk => {
                        this.u(connection, `DELETE FROM ItemTable WHERE key IN (${new Array(keysChunk.length).fill('?').join(',')})`, stmt => stmt.run(keysChunk), () => {
                            const keys = [];
                            toDelete.forEach(key => {
                                keys.push(key);
                            });
                            return `Keys: ${keys.join(', ')}`;
                        });
                    });
                }
            });
        }
        async optimize() {
            this.d.trace(`[storage ${this.c}] vacuum()`);
            const connection = await this.f;
            return this.q(connection, 'VACUUM');
        }
        async close(recovery) {
            this.d.trace(`[storage ${this.c}] close()`);
            const connection = await this.f;
            return this.k(connection, recovery);
        }
        k(connection, recovery) {
            return new Promise((resolve, reject) => {
                connection.db.close(closeError => {
                    if (closeError) {
                        this.o(connection, `[storage ${this.c}] close(): ${closeError}`);
                    }
                    // Return early if this storage was created only in-memory
                    // e.g. when running tests we do not need to backup.
                    if (this.g === $nT.IN_MEMORY_PATH) {
                        return resolve();
                    }
                    // If the DB closed successfully and we are not running in-memory
                    // and the DB did not get errors during runtime, make a backup
                    // of the DB so that we can use it as fallback in case the actual
                    // DB becomes corrupt in the future.
                    if (!connection.isErroneous && !connection.isInMemory) {
                        return this.l().then(resolve, error => {
                            this.d.error(`[storage ${this.c}] backup(): ${error}`);
                            return resolve(); // ignore failing backup
                        });
                    }
                    // Recovery: if we detected errors while using the DB or we are using
                    // an inmemory DB (as a fallback to not being able to open the DB initially)
                    // and we have a recovery function provided, we recreate the DB with this
                    // data to recover all known data without loss if possible.
                    if (typeof recovery === 'function') {
                        // Delete the existing DB. If the path does not exist or fails to
                        // be deleted, we do not try to recover anymore because we assume
                        // that the path is no longer writeable for us.
                        return pfs_1.Promises.unlink(this.g).then(() => {
                            // Re-open the DB fresh
                            return this.p(this.g).then(recoveryConnection => {
                                const closeRecoveryConnection = () => {
                                    return this.k(recoveryConnection, undefined /* do not attempt to recover again */);
                                };
                                // Store items
                                return this.j(recoveryConnection, { insert: recovery() }).then(() => closeRecoveryConnection(), error => {
                                    // In case of an error updating items, still ensure to close the connection
                                    // to prevent SQLITE_BUSY errors when the connection is reestablished
                                    closeRecoveryConnection();
                                    return Promise.reject(error);
                                });
                            });
                        }).then(resolve, reject);
                    }
                    // Finally without recovery we just reject
                    return reject(closeError || new Error('Database has errors or is in-memory without recovery option'));
                });
            });
        }
        l() {
            const backupPath = this.m(this.g);
            return pfs_1.Promises.copy(this.g, backupPath, { preserveSymlinks: false });
        }
        m(path) {
            return `${path}.backup`;
        }
        async checkIntegrity(full) {
            this.d.trace(`[storage ${this.c}] checkIntegrity(full: ${full})`);
            const connection = await this.f;
            const row = await this.r(connection, full ? 'PRAGMA integrity_check' : 'PRAGMA quick_check');
            const integrity = full ? row['integrity_check'] : row['quick_check'];
            if (connection.isErroneous) {
                return `${integrity} (last error: ${connection.lastError})`;
            }
            if (connection.isInMemory) {
                return `${integrity} (in-memory!)`;
            }
            return integrity;
        }
        async n(path, retryOnBusy = true) {
            this.d.trace(`[storage ${this.c}] open(${path}, retryOnBusy: ${retryOnBusy})`);
            try {
                return await this.p(path);
            }
            catch (error) {
                this.d.error(`[storage ${this.c}] open(): Unable to open DB due to ${error}`);
                // SQLITE_BUSY should only arise if another process is locking the same DB we want
                // to open at that time. This typically never happens because a DB connection is
                // limited per window. However, in the event of a window reload, it may be possible
                // that the previous connection was not properly closed while the new connection is
                // already established.
                //
                // In this case we simply wait for some time and retry once to establish the connection.
                //
                if (error.code === 'SQLITE_BUSY' && retryOnBusy) {
                    await (0, async_1.$Hg)($nT.a);
                    return this.n(path, false /* not another retry */);
                }
                // Otherwise, best we can do is to recover from a backup if that exists, as such we
                // move the DB to a different filename and try to load from backup. If that fails,
                // a new empty DB is being created automatically.
                //
                // The final fallback is to use an in-memory DB which should only happen if the target
                // folder is really not writeable for us.
                //
                try {
                    await pfs_1.Promises.unlink(path);
                    try {
                        await pfs_1.Promises.rename(this.m(path), path, false /* no retry */);
                    }
                    catch (error) {
                        // ignore
                    }
                    return await this.p(path);
                }
                catch (error) {
                    this.d.error(`[storage ${this.c}] open(): Unable to use backup due to ${error}`);
                    // In case of any error to open the DB, use an in-memory
                    // DB so that we always have a valid DB to talk to.
                    return this.p($nT.IN_MEMORY_PATH);
                }
            }
        }
        o(connection, msg) {
            connection.isErroneous = true;
            connection.lastError = msg;
            this.d.error(msg);
        }
        p(path) {
            return new Promise((resolve, reject) => {
                new Promise((resolve_1, reject_1) => { require(['@vscode/sqlite3'], resolve_1, reject_1); }).then(sqlite3 => {
                    const connection = {
                        db: new (this.d.isTracing ? sqlite3.verbose().Database : sqlite3.Database)(path, (error) => {
                            if (error) {
                                return (connection.db && error.code !== 'SQLITE_CANTOPEN' /* https://github.com/TryGhost/node-sqlite3/issues/1617 */) ? connection.db.close(() => reject(error)) : reject(error);
                            }
                            // The following exec() statement serves two purposes:
                            // - create the DB if it does not exist yet
                            // - validate that the DB is not corrupt (the open() call does not throw otherwise)
                            return this.q(connection, [
                                'PRAGMA user_version = 1;',
                                'CREATE TABLE IF NOT EXISTS ItemTable (key TEXT UNIQUE ON CONFLICT REPLACE, value BLOB)'
                            ].join('')).then(() => {
                                return resolve(connection);
                            }, error => {
                                return connection.db.close(() => reject(error));
                            });
                        }),
                        isInMemory: path === $nT.IN_MEMORY_PATH
                    };
                    // Errors
                    connection.db.on('error', error => this.o(connection, `[storage ${this.c}] Error (event): ${error}`));
                    // Tracing
                    if (this.d.isTracing) {
                        connection.db.on('trace', sql => this.d.trace(`[storage ${this.c}] Trace (event): ${sql}`));
                    }
                }, reject);
            });
        }
        q(connection, sql) {
            return new Promise((resolve, reject) => {
                connection.db.exec(sql, error => {
                    if (error) {
                        this.o(connection, `[storage ${this.c}] exec(): ${error}`);
                        return reject(error);
                    }
                    return resolve();
                });
            });
        }
        r(connection, sql) {
            return new Promise((resolve, reject) => {
                connection.db.get(sql, (error, row) => {
                    if (error) {
                        this.o(connection, `[storage ${this.c}] get(): ${error}`);
                        return reject(error);
                    }
                    return resolve(row);
                });
            });
        }
        s(connection, sql) {
            return new Promise((resolve, reject) => {
                connection.db.all(sql, (error, rows) => {
                    if (error) {
                        this.o(connection, `[storage ${this.c}] all(): ${error}`);
                        return reject(error);
                    }
                    return resolve(rows);
                });
            });
        }
        t(connection, transactions) {
            return new Promise((resolve, reject) => {
                connection.db.serialize(() => {
                    connection.db.run('BEGIN TRANSACTION');
                    transactions();
                    connection.db.run('END TRANSACTION', error => {
                        if (error) {
                            this.o(connection, `[storage ${this.c}] transaction(): ${error}`);
                            return reject(error);
                        }
                        return resolve();
                    });
                });
            });
        }
        u(connection, sql, runCallback, errorDetails) {
            const stmt = connection.db.prepare(sql);
            const statementErrorListener = (error) => {
                this.o(connection, `[storage ${this.c}] prepare(): ${error} (${sql}). Details: ${errorDetails()}`);
            };
            stmt.on('error', statementErrorListener);
            runCallback(stmt);
            stmt.finalize(error => {
                if (error) {
                    statementErrorListener(error);
                }
                stmt.removeListener('error', statementErrorListener);
            });
        }
    }
    exports.$nT = $nT;
    class SQLiteStorageDatabaseLogger {
        // to reduce lots of output, require an environment variable to enable tracing
        // this helps when running with --verbose normally where the storage tracing
        // might hide useful output to look at
        static { this.a = 'VSCODE_TRACE_STORAGE'; }
        constructor(options) {
            if (options && typeof options.logTrace === 'function' && process.env[SQLiteStorageDatabaseLogger.a]) {
                this.b = options.logTrace;
            }
            if (options && typeof options.logError === 'function') {
                this.c = options.logError;
            }
        }
        get isTracing() {
            return !!this.b;
        }
        trace(msg) {
            this.b?.(msg);
        }
        error(error) {
            this.c?.(error);
        }
    }
});
//# sourceMappingURL=storage.js.map