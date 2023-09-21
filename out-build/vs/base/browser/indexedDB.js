/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/performance"], function (require, exports, errorMessage_1, errors_1, performance_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3Q = exports.$2Q = void 0;
    class MissingStoresError extends Error {
        constructor(db) {
            super('Missing stores');
            this.db = db;
        }
    }
    class $2Q extends Error {
        constructor(dbName) {
            super(`IndexedDB database '${dbName}' is closed.`);
            this.code = 'DBClosed';
        }
    }
    exports.$2Q = $2Q;
    class $3Q {
        static async create(name, version, stores) {
            const database = await $3Q.a(name, version, stores);
            return new $3Q(database, name);
        }
        static async a(name, version, stores) {
            (0, performance_1.mark)(`code/willOpenDatabase/${name}`);
            try {
                return await $3Q.b(name, version, stores);
            }
            catch (err) {
                if (err instanceof MissingStoresError) {
                    console.info(`Attempting to recreate the IndexedDB once.`, name);
                    try {
                        // Try to delete the db
                        await $3Q.d(err.db);
                    }
                    catch (error) {
                        console.error(`Error while deleting the IndexedDB`, (0, errors_1.$8)(error));
                        throw error;
                    }
                    return await $3Q.b(name, version, stores);
                }
                throw err;
            }
            finally {
                (0, performance_1.mark)(`code/didOpenDatabase/${name}`);
            }
        }
        static b(name, version, stores) {
            return new Promise((c, e) => {
                const request = window.indexedDB.open(name, version);
                request.onerror = () => e(request.error);
                request.onsuccess = () => {
                    const db = request.result;
                    for (const store of stores) {
                        if (!db.objectStoreNames.contains(store)) {
                            console.error(`Error while opening IndexedDB. Could not find '${store}'' object store`);
                            e(new MissingStoresError(db));
                            return;
                        }
                    }
                    c(db);
                };
                request.onupgradeneeded = () => {
                    const db = request.result;
                    for (const store of stores) {
                        if (!db.objectStoreNames.contains(store)) {
                            db.createObjectStore(store);
                        }
                    }
                };
            });
        }
        static d(indexedDB) {
            return new Promise((c, e) => {
                // Close any opened connections
                indexedDB.close();
                // Delete the db
                const deleteRequest = window.indexedDB.deleteDatabase(indexedDB.name);
                deleteRequest.onerror = (err) => e(deleteRequest.error);
                deleteRequest.onsuccess = () => c();
            });
        }
        constructor(database, h) {
            this.h = h;
            this.f = null;
            this.g = [];
            this.f = database;
        }
        hasPendingTransactions() {
            return this.g.length > 0;
        }
        close() {
            if (this.g.length) {
                this.g.splice(0, this.g.length).forEach(transaction => transaction.abort());
            }
            this.f?.close();
            this.f = null;
        }
        async runInTransaction(store, transactionMode, dbRequestFn) {
            if (!this.f) {
                throw new $2Q(this.h);
            }
            const transaction = this.f.transaction(store, transactionMode);
            this.g.push(transaction);
            return new Promise((c, e) => {
                transaction.oncomplete = () => {
                    if (Array.isArray(request)) {
                        c(request.map(r => r.result));
                    }
                    else {
                        c(request.result);
                    }
                };
                transaction.onerror = () => e(transaction.error);
                transaction.onabort = () => e(transaction.error);
                const request = dbRequestFn(transaction.objectStore(store));
            }).finally(() => this.g.splice(this.g.indexOf(transaction), 1));
        }
        async getKeyValues(store, isValid) {
            if (!this.f) {
                throw new $2Q(this.h);
            }
            const transaction = this.f.transaction(store, 'readonly');
            this.g.push(transaction);
            return new Promise(resolve => {
                const items = new Map();
                const objectStore = transaction.objectStore(store);
                // Open a IndexedDB Cursor to iterate over key/values
                const cursor = objectStore.openCursor();
                if (!cursor) {
                    return resolve(items); // this means the `ItemTable` was empty
                }
                // Iterate over rows of `ItemTable` until the end
                cursor.onsuccess = () => {
                    if (cursor.result) {
                        // Keep cursor key/value in our map
                        if (isValid(cursor.result.value)) {
                            items.set(cursor.result.key.toString(), cursor.result.value);
                        }
                        // Advance cursor to next row
                        cursor.result.continue();
                    }
                    else {
                        resolve(items); // reached end of table
                    }
                };
                // Error handlers
                const onError = (error) => {
                    console.error(`IndexedDB getKeyValues(): ${(0, errorMessage_1.$mi)(error, true)}`);
                    resolve(items);
                };
                cursor.onerror = () => onError(cursor.error);
                transaction.onerror = () => onError(transaction.error);
            }).finally(() => this.g.splice(this.g.indexOf(transaction), 1));
        }
    }
    exports.$3Q = $3Q;
});
//# sourceMappingURL=indexedDB.js.map