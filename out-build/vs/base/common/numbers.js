/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ll = exports.$Kl = exports.$Jl = exports.rot = exports.$Hl = void 0;
    function $Hl(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    exports.$Hl = $Hl;
    function rot(index, modulo) {
        return (modulo + (index % modulo)) % modulo;
    }
    exports.rot = rot;
    class $Jl {
        constructor() {
            this.a = 0;
        }
        getNext() {
            return this.a++;
        }
    }
    exports.$Jl = $Jl;
    class $Kl {
        constructor() {
            this.a = 1;
            this.b = 0;
        }
        update(value) {
            this.b = this.b + (value - this.b) / this.a;
            this.a += 1;
            return this.b;
        }
        get value() {
            return this.b;
        }
    }
    exports.$Kl = $Kl;
    class $Ll {
        constructor(size) {
            this.a = 0;
            this.b = 0;
            this.c = [];
            this.d = 0;
            this.e = 0;
            this.c = new Array(size);
            this.c.fill(0, 0, size);
        }
        update(value) {
            const oldValue = this.c[this.d];
            this.c[this.d] = value;
            this.d = (this.d + 1) % this.c.length;
            this.e -= oldValue;
            this.e += value;
            if (this.a < this.c.length) {
                this.a += 1;
            }
            this.b = this.e / this.a;
            return this.b;
        }
        get value() {
            return this.b;
        }
    }
    exports.$Ll = $Ll;
});
//# sourceMappingURL=numbers.js.map