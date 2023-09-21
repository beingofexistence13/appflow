/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async"], function (require, exports, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionGlobalMemento = exports.ExtensionMemento = void 0;
    class ExtensionMemento {
        constructor(id, global, storage) {
            this._deferredPromises = new Map();
            this._id = id;
            this._shared = global;
            this._storage = storage;
            this._init = this._storage.initializeExtensionStorage(this._shared, this._id, Object.create(null)).then(value => {
                this._value = value;
                return this;
            });
            this._storageListener = this._storage.onDidChangeStorage(e => {
                if (e.shared === this._shared && e.key === this._id) {
                    this._value = e.value;
                }
            });
            this._scheduler = new async_1.RunOnceScheduler(() => {
                const records = this._deferredPromises;
                this._deferredPromises = new Map();
                (async () => {
                    try {
                        await this._storage.setValue(this._shared, this._id, this._value);
                        for (const value of records.values()) {
                            value.complete();
                        }
                    }
                    catch (e) {
                        for (const value of records.values()) {
                            value.error(e);
                        }
                    }
                })();
            }, 0);
        }
        keys() {
            // Filter out `undefined` values, as they can stick around in the `_value` until the `onDidChangeStorage` event runs
            return Object.entries(this._value ?? {}).filter(([, value]) => value !== undefined).map(([key]) => key);
        }
        get whenReady() {
            return this._init;
        }
        get(key, defaultValue) {
            let value = this._value[key];
            if (typeof value === 'undefined') {
                value = defaultValue;
            }
            return value;
        }
        update(key, value) {
            this._value[key] = value;
            const record = this._deferredPromises.get(key);
            if (record !== undefined) {
                return record.p;
            }
            const promise = new async_1.DeferredPromise();
            this._deferredPromises.set(key, promise);
            if (!this._scheduler.isScheduled()) {
                this._scheduler.schedule();
            }
            return promise.p;
        }
        dispose() {
            this._storageListener.dispose();
        }
    }
    exports.ExtensionMemento = ExtensionMemento;
    class ExtensionGlobalMemento extends ExtensionMemento {
        setKeysForSync(keys) {
            this._storage.registerExtensionStorageKeysToSync({ id: this._id, version: this._extension.version }, keys);
        }
        constructor(extensionDescription, storage) {
            super(extensionDescription.identifier.value, true, storage);
            this._extension = extensionDescription;
        }
    }
    exports.ExtensionGlobalMemento = ExtensionGlobalMemento;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdE1lbWVudG8uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0TWVtZW50by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsTUFBYSxnQkFBZ0I7UUFhNUIsWUFBWSxFQUFVLEVBQUUsTUFBZSxFQUFFLE9BQXVCO1lBSHhELHNCQUFpQixHQUF1QyxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBSXpFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFFeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUMvRyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDcEIsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUM1RCxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ3BELElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztpQkFDdEI7WUFDRixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSx3QkFB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