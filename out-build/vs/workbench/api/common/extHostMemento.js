/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async"], function (require, exports, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zbc = exports.$ybc = void 0;
    class $ybc {
        constructor(id, global, storage) {
            this.h = new Map();
            this.a = id;
            this.b = global;
            this.c = storage;
            this.d = this.c.initializeExtensionStorage(this.b, this.a, Object.create(null)).then(value => {
                this.f = value;
                return this;
            });
            this.g = this.c.onDidChangeStorage(e => {
                if (e.shared === this.b && e.key === this.a) {
                    this.f = e.value;
                }
            });
            this.i = new async_1.$Sg(() => {
                const records = this.h;
                this.h = new Map();
                (async () => {
                    try {
                        await this.c.setValue(this.b, this.a, this.f);
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
            return Object.entries(this.f ?? {}).filter(([, value]) => value !== undefined).map(([key]) => key);
        }
        get whenReady() {
            return this.d;
        }
        get(key, defaultValue) {
            let value = this.f[key];
            if (typeof value === 'undefined') {
                value = defaultValue;
            }
            return value;
        }
        update(key, value) {
            this.f[key] = value;
            const record = this.h.get(key);
            if (record !== undefined) {
                return record.p;
            }
            const promise = new async_1.$2g();
            this.h.set(key, promise);
            if (!this.i.isScheduled()) {
                this.i.schedule();
            }
            return promise.p;
        }
        dispose() {
            this.g.dispose();
        }
    }
    exports.$ybc = $ybc;
    class $zbc extends $ybc {
        setKeysForSync(keys) {
            this.c.registerExtensionStorageKeysToSync({ id: this.a, version: this.j.version }, keys);
        }
        constructor(extensionDescription, storage) {
            super(extensionDescription.identifier.value, true, storage);
            this.j = extensionDescription;
        }
    }
    exports.$zbc = $zbc;
});
//# sourceMappingURL=extHostMemento.js.map