/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$oR = void 0;
    class $oR {
        constructor(a, b = 0, c = a.length, d = b - 1) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
        }
        current() {
            if (this.d === this.b - 1 || this.d === this.c) {
                return null;
            }
            return this.a[this.d];
        }
        next() {
            this.d = Math.min(this.d + 1, this.c);
            return this.current();
        }
        previous() {
            this.d = Math.max(this.d - 1, this.b - 1);
            return this.current();
        }
        first() {
            this.d = this.b;
            return this.current();
        }
        last() {
            this.d = this.c - 1;
            return this.current();
        }
    }
    exports.$oR = $oR;
});
//# sourceMappingURL=navigator.js.map