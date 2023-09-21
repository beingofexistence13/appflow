/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$T = void 0;
    class $T {
        constructor(d) {
            this.d = d;
            this.a = false;
        }
        /**
         * True if the lazy value has been resolved.
         */
        get hasValue() { return this.a; }
        /**
         * Get the wrapped value.
         *
         * This will force evaluation of the lazy value if it has not been resolved yet. Lazy values are only
         * resolved once. `getValue` will re-throw exceptions that are hit while resolving the value
         */
        get value() {
            if (!this.a) {
                try {
                    this.b = this.d();
                }
                catch (err) {
                    this.c = err;
                }
                finally {
                    this.a = true;
                }
            }
            if (this.c) {
                throw this.c;
            }
            return this.b;
        }
        /**
         * Get the wrapped value without forcing evaluation.
         */
        get rawValue() { return this.b; }
    }
    exports.$T = $T;
});
//# sourceMappingURL=lazy.js.map