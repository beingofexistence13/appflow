/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation"], function (require, exports, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$je = exports.$ie = exports.$he = void 0;
    class $he {
        constructor(b) {
            this.b = b;
            this.a = null;
        }
        get() {
            if (this.a) {
                return this.a;
            }
            const cts = new cancellation_1.$pd();
            const promise = this.b(cts.token);
            this.a = {
                promise,
                dispose: () => {
                    this.a = null;
                    cts.cancel();
                    cts.dispose();
                }
            };
            return this.a;
        }
    }
    exports.$he = $he;
    /**
     * Uses a LRU cache to make a given parametrized function cached.
     * Caches just the last value.
     * The key must be JSON serializable.
    */
    class $ie {
        constructor(c) {
            this.c = c;
            this.a = undefined;
            this.b = undefined;
        }
        get(arg) {
            const key = JSON.stringify(arg);
            if (this.b !== key) {
                this.b = key;
                this.a = this.c(arg);
            }
            return this.a;
        }
    }
    exports.$ie = $ie;
    /**
     * Uses an unbounded cache (referential equality) to memoize the results of the given function.
    */
    class $je {
        get cachedValues() {
            return this.a;
        }
        constructor(b) {
            this.b = b;
            this.a = new Map();
        }
        get(arg) {
            if (this.a.has(arg)) {
                return this.a.get(arg);
            }
            const value = this.b(arg);
            this.a.set(arg, value);
            return value;
        }
    }
    exports.$je = $je;
});
//# sourceMappingURL=cache.js.map