/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/map", "vs/base/common/path", "vs/base/node/pfs"], function (require, exports, async_1, event_1, map_1, path_1, pfs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SQLiteStorageDatabase = void 0;
    class SQLiteStorageDatabase {
        static { this.IN_MEMORY_PATH = ':memory:'; }
        get onDidChangeItemsExternal() { return event_1.Event.None; } // since we are the only client, there can be no external changes
        static { this.BUSY_OPEN_TIMEOUT = 2000; } // timeout in ms to retry when opening DB fails with SQLITE_BUSY
        static { this.MAX_HOST_PARAMETERS = 256; } // maximum number of parameters within a statement
        constructor(path, options = Object.create(null)) {
            this.path = path;
            this.options = options;
            this.name = (0, path_1.basename)(this.path);
            this.logger = new SQLiteStorageDatabaseLogger(this.options.logging);
            this.whenConnected = this.connect(this.path);
        }
        async getItems() {
            const connection = await this.whenConnected;
            const items = new Map();
            const rows = await this.all(connection, 'SELECT * FROM ItemTable');
            rows.forEach(row => items.set(row.key, row.value));
            if (this.logger.isTracing) {
                this.logger.trace(`[storage ${this.name}] getItems(): ${items.size} rows`);
            }
            return items;
        }
        async updateItems(request) {
            const connection = await this.whenConnected;
            return this.doUpdateItems(connection, request);
        }
        doUpdateItems(connection, request) {
            if (this.logger.isTracing) {
                this.logger.trace(`[storage ${this.name}] updateItems(): insert(${request.insert ? (0, map_1.mapToString)(request.insert) : '0'}), delete(${request.delete ? (0, map_1.setToString)(request.delete) : '0'})`);
            }
            return this.transaction(connection, () => {
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
                        if (keyValueChunk.length > SQLiteStorageDatabase.MAX_HOST_PARAMETERS) {
                            currentChunkIndex++;
                            keyValueChunk = [];
                            keysValuesChunks.push(keyValueChunk);
                        }
                        keyValueChunk.push(key, value);
                    });
                    keysValuesChunks.forEach(keysValuesChunk => {
                        this.prepare(connection, `INSERT INTO ItemTable VALUES ${new Array(keysValuesChunk.length / 2).fill('(?,?)').join(',')}`, stmt => stmt.run(keysValuesChunk), () => {
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
                        if (keyChunk.length > SQLiteStorageDatabase.MAX_HOST_PARAMETERS) {
                            currentChunkIndex++;
                            keyChunk = [];
                            keysChunks.push(keyChunk);
                        }
                        keyChunk.push(key);
                    });
                    keysChunks.forEach(keysChunk => {
                        this.prepare(connection, `DELETE FROM ItemTable WHERE key IN (${new Array(keysChunk.length).fill('?').join(',')})`, stmt => stmt.run(keysChunk), () => {
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
            this.logger.trace(`[storage ${this.name}] vacuum()`);
            const connection = await this.whenConnected;
            return this.exec(connection, 'VACUUM');
        }
        async close(recovery) {
            this.logger.trace(`[storage ${this.name}] close()`);
            const connection = await this.whenConnected;
            return this.doClose(connection, recovery);
        }
        doClose(connection, recovery) {
            return new Promise((resolve, reject) => {
                connection.db.close(closeError => {
                    if (closeError) {
                        this.handleSQLiteError(connection, `[storage ${this.name}] close(): ${closeError}`);
                    }
                    // Return early if this storage was created only in-memory
                    // e.g. when running tests we do not need to backup.
                    if (this.path === SQLiteStorageDatabase.IN_MEMORY_PATH) {
                        return resolve();
                    }
                    // If the DB closed successfully and we are not running in-memory
                    // and the DB did not get errors during runtime, make a backup
                    // of the DB so that we can use it as fallback in case the actual
                    // DB becomes corrupt in the future.
                    if (!connection.isErroneous && !connection.isInMemory) {
                        return this.backup().then(resolve, error => {
                            this.logger.error(`[storage ${this.name}] backup(): ${error}`);
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
                        return pfs_1.Promises.unlink(this.path).then(() => {
                            // Re-open the DB fresh
                            return this.doConnect(this.path).then(recoveryConnection => {
                                const closeRecoveryConnection = () => {
                                    return this.doClose(recoveryConnection, undefined /* do not attempt to recover again */);
                                };
                                // Store items
                                return this.doUpdateItems(recoveryConnection, { insert: recovery() }).then(() => closeRecoveryConnection(), error => {
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
        backup() {
            const backupPath = this.toBackupPath(this.path);
            return pfs_1.Promises.copy(this.path, backupPath, { preserveSymlinks: false });
        }
        toBackupPath(path) {
            return `${path}.backup`;
        }
        async checkIntegrity(full) {
            this.logger.trace(`[storage ${this.name}] checkIntegrity(full: ${full})`);
            const connection = await this.whenConnected;
            const row = await this.get(connection, full ? 'PRAGMA integrity_check' : 'PRAGMA quick_check');
            const integrity = full ? row['integrity_check'] : row['quick_check'];
            if (connection.isErroneous) {
                return `${integrity} (last error: ${connection.lastError})`;
            }
            if (connection.isInMemory) {
                return `${integrity} (in-memory!)`;
            }
            return integrity;
        }
        async connect(path, retryOnBusy = true) {
            this.logger.trace(`[storage ${this.name}] open(${path}, retryOnBusy: ${retryOnBusy})`);
            try {
                return await this.doConnect(path);
            }
            catch (error) {
                this.logger.error(`[storage ${this.name}] open(): Unable to open DB due to ${error}`);
                // SQLITE_BUSY should only arise if another process is locking the same DB we want
                // to open at that time. This typically never happens because a DB connection is
                // limited per window. However, in the event of a window reload, it may be possible
                // that the previous connection was not properly closed while the new connection is
                // already established.
                //
                // In this case we simply wait for some time and retry once to establish the connection.
                //
                if (error.code === 'SQLITE_BUSY' && retryOnBusy) {
                    await (0, async_1.timeout)(SQLiteStorageDatabase.BUSY_OPEN_TIMEOUT);
                    return this.connect(path, false /* not another retry */);
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
                        await pfs_1.Promises.rename(this.toBackupPath(path), path, false /* no retry */);
                    }
                    catch (error) {
                        // ignore
                    }
                    return await this.doConnect(path);
                }
                catch (error) {
                    this.logger.error(`[storage ${this.name}] open(): Unable to use backup due to ${error}`);
                    // In case of any error to open the DB, use an in-memory
                    // DB so that we always have a valid DB to talk to.
                    return this.doConnect(SQLiteStorageDatabase.IN_MEMORY_PATH);
                }
            }
        }
        handleSQLiteError(connection, msg) {
            connection.isErroneous = true;
            connection.lastError = msg;
            this.logger.error(msg);
        }
        doConnect(path) {
            return new Promise((resolve, reject) => {
                new Promise((resolve_1, reject_1) => { require(['@vscode/sqlite3'], resolve_1, reject_1); }).then(sqlite3 => {
                    const connection = {
                        db: new (this.logger.isTracing ? sqlite3.verbose().Database : sqlite3.Database)(path, (error) => {
                            if (error) {
                                return (connection.db && error.code !== 'SQLITE_CANTOPEN' /* https://github.com/TryGhost/node-sqlite3/issues/1617 */) ? connection.db.close(() => reject(error)) : reject(error);
                            }
                            // The following exec() statement serves two purposes:
                            // - create the DB if it does not exist yet
                            // - validate that the DB is not corrupt (the open() call does not throw otherwise)
                            return this.exec(connection, [
                                'PRAGMA user_version = 1;',
                                'CREATE TABLE IF NOT EXISTS ItemTable (key TEXT UNIQUE ON CONFLICT REPLACE, value BLOB)'
                            ].join('')).then(() => {
                                return resolve(connection);
                            }, error => {
                                return connection.db.close(() => reject(error));
                            });
                        }),
                        isInMemory: path === SQLiteStorageDatabase.IN_MEMORY_PATH
                    };
                    // Errors
                    connection.db.on('error', error => this.handleSQLiteError(connection, `[storage ${this.name}] Error (event): ${error}`));
                    // Tracing
                    if (this.logger.isTracing) {
                        connection.db.on('trace', sql => this.logger.trace(`[storage ${this.name}] Trace (event): ${sql}`));
                    }
                }, reject);
            });
        }
        exec(connection, sql) {
            return new Promise((resolve, reject) => {
                connection.db.exec(sql, error => {
                    if (error) {
                        this.handleSQLiteError(connection, `[storage ${this.name}] exec(): ${error}`);
                        return reject(error);
                    }
                    return resolve();
                });
            });
        }
        get(connection, sql) {
            return new Promise((resolve, reject) => {
                connection.db.get(sql, (error, row) => {
                    if (error) {
                        this.handleSQLiteError(connection, `[storage ${this.name}] get(): ${error}`);
                        return reject(error);
                    }
                    return resolve(row);
                });
            });
        }
        all(connection, sql) {
            return new Promise((resolve, reject) => {
                connection.db.all(sql, (error, rows) => {
                    if (error) {
                        this.handleSQLiteError(connection, `[storage ${this.name}] all(): ${error}`);
                        return reject(error);
                    }
                    return resolve(rows);
                });
            });
        }
        transaction(connection, transactions) {
            return new Promise((resolve, reject) => {
                connection.db.serialize(() => {
                    connection.db.run('BEGIN TRANSACTION');
                    transactions();
                    connection.db.run('END TRANSACTION', error => {
                        if (error) {
                            this.handleSQLiteError(connection, `[storage ${this.name}] transaction(): ${error}`);
                            return reject(error);
                        }
                        return resolve();
                    });
                });
            });
        }
        prepare(connection, sql, runCallback, errorDetails) {
            const stmt = connection.db.prepare(sql);
            const statementErrorListener = (error) => {
                this.handleSQLiteError(connection, `[storage ${this.name}] prepare(): ${error} (${sql}). Details: ${errorDetails()}`);
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
    exports.SQLiteStorageDatabase = SQLiteStorageDatabase;
    class SQLiteStorageDatabaseLogger {
        // to reduce lots of output, require an environment variable to enable tracing
        // this helps when running with --verbose normally where the storage tracing
        // might hide useful output to look at
        static { this.VSCODE_TRACE_STORAGE = 'VSCODE_TRACE_STORAGE'; }
        constructor(options) {
            if (options && typeof options.logTrace === 'function' && process.env[SQLiteStorageDatabaseLogger.VSCODE_TRACE_STORAGE]) {
                this.logTrace = options.logTrace;
            }
            if (options && typeof options.logError === 'function') {
                this.logError = options.logError;
            }
        }
        get isTracing() {
            return !!this.logTrace;
        }
        trace(msg) {
            this.logTrace?.(msg);
        }
        error(error) {
            this.logError?.(error);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvcGFydHMvc3RvcmFnZS9ub2RlL3N0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMkJoRyxNQUFhLHFCQUFxQjtpQkFFakIsbUJBQWMsR0FBRyxVQUFVLEFBQWIsQ0FBYztRQUU1QyxJQUFJLHdCQUF3QixLQUFzQyxPQUFPLGFBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsaUVBQWlFO2lCQUVoSSxzQkFBaUIsR0FBRyxJQUFJLEFBQVAsQ0FBUSxHQUFDLGdFQUFnRTtpQkFDMUYsd0JBQW1CLEdBQUcsR0FBRyxBQUFOLENBQU8sR0FBQyxrREFBa0Q7UUFRckcsWUFBNkIsSUFBWSxFQUFtQixVQUF5QyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUEzRixTQUFJLEdBQUosSUFBSSxDQUFRO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQXFEO1lBTnZHLFNBQUksR0FBRyxJQUFBLGVBQVEsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFM0IsV0FBTSxHQUFHLElBQUksMkJBQTJCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUvRCxrQkFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRW1FLENBQUM7UUFFN0gsS0FBSyxDQUFDLFFBQVE7WUFDYixNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUM7WUFFNUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7WUFFeEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQyxPQUFPLENB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