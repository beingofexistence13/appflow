/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/performance"], function (require, exports, errorMessage_1, errors_1, performance_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IndexedDB = exports.DBClosedError = void 0;
    class MissingStoresError extends Error {
        constructor(db) {
            super('Missing stores');
            this.db = db;
        }
    }
    class DBClosedError extends Error {
        constructor(dbName) {
            super(`IndexedDB database '${dbName}' is closed.`);
            this.code = 'DBClosed';
        }
    }
    exports.DBClosedError = DBClosedError;
    class IndexedDB {
        static async create(name, version, stores) {
            const database = await IndexedDB.openDatabase(name, version, stores);
            return new IndexedDB(database, name);
        }
        static async openDatabase(name, version, stores) {
            (0, performance_1.mark)(`code/willOpenDatabase/${name}`);
            try {
                return await IndexedDB.doOpenDatabase(name, version, stores);
            }
            catch (err) {
                if (err instanceof MissingStoresError) {
                    console.info(`Attempting to recreate the IndexedDB once.`, name);
                    try {
                        // Try to delete the db
                        await IndexedDB.deleteDatabase(err.db);
                    }
                    catch (error) {
                        console.error(`Error while deleting the IndexedDB`, (0, errors_1.getErrorMessage)(error));
                        throw error;
                    }
                    return await IndexedDB.doOpenDatabase(name, version, stores);
                }
                throw err;
            }
            finally {
                (0, performance_1.mark)(`code/didOpenDatabase/${name}`);
            }
        }
        static doOpenDatabase(name, version, stores) {
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
        static deleteDatabase(indexedDB) {
            return new Promise((c, e) => {
                // Close any opened connections
                indexedDB.close();
                // Delete the db
                const deleteRequest = window.indexedDB.deleteDatabase(indexedDB.name);
                deleteRequest.onerror = (err) => e(deleteRequest.error);
                deleteRequest.onsuccess = () => c();
            });
        }
        constructor(database, name) {
            this.name = name;
            this.database = null;
            this.pendingTransactions = [];
            this.database = database;
        }
        hasPendingTransactions() {
            return this.pendingTransactions.length > 0;
        }
        close() {
            if (this.pendingTransactions.length) {
                this.pendingTransactions.splice(0, this.pendingTransactions.length).forEach(transaction => transaction.abort());
            }
            this.database?.close();
            this.database = null;
        }
        async runInTransaction(store, transactionMode, dbRequestFn) {
            if (!this.database) {
                throw new DBClosedError(this.name);
            }
            const transaction = this.database.transaction(store, transactionMode);
            this.pendingTransactions.push(transaction);
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
            }).finally(() => this.pendingTransactions.splice(this.pendingTransactions.indexOf(transaction), 1));
        }
        async getKeyValues(store, isValid) {
            if (!this.database) {
                throw new DBClosedError(this.name);
            }
            const transaction = this.database.transaction(store, 'readonly');
            this.pendingTransactions.push(transaction);
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
                    console.error(`IndexedDB getKeyValues(): ${(0, errorMessage_1.toErrorMessage)(error, true)}`);
                    resolve(items);
                };
                cursor.onerror = () => onError(cursor.error);
                transaction.onerror = () => onError(transaction.error);
            }).finally(() => this.pendingTransactions.splice(this.pendingTransactions.indexOf(transaction), 1));
        }
    }
    exports.IndexedDB = IndexedDB;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhlZERCLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL2luZGV4ZWREQi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsTUFBTSxrQkFBbUIsU0FBUSxLQUFLO1FBQ3JDLFlBQXFCLEVBQWU7WUFDbkMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFESixPQUFFLEdBQUYsRUFBRSxDQUFhO1FBRXBDLENBQUM7S0FDRDtJQUVELE1BQWEsYUFBYyxTQUFRLEtBQUs7UUFFdkMsWUFBWSxNQUFjO1lBQ3pCLEtBQUssQ0FBQyx1QkFBdUIsTUFBTSxjQUFjLENBQUMsQ0FBQztZQUYzQyxTQUFJLEdBQUcsVUFBVSxDQUFDO1FBRzNCLENBQUM7S0FDRDtJQUxELHNDQUtDO0lBRUQsTUFBYSxTQUFTO1FBRXJCLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQVksRUFBRSxPQUEyQixFQUFFLE1BQWdCO1lBQzlFLE1BQU0sUUFBUSxHQUFHLE1BQU0sU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3JFLE9BQU8sSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFTyxNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFZLEVBQUUsT0FBMkIsRUFBRSxNQUFnQjtZQUM1RixJQUFBLGtCQUFJLEVBQUMseUJBQXlCLElBQUksRUFBRSxDQUFDLENBQUM7WUFDdEMsSUFBSTtnQkFDSCxPQUFPLE1BQU0sU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQzdEO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ2IsSUFBSSxHQUFHLFlBQVksa0JBQWtCLEVBQUU7b0JBQ3RD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