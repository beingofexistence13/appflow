/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$BX = void 0;
    /**
     * A very VM friendly rgba datastructure.
     * Please don't touch unless you take a look at the IR.
     */
    class $BX {
        static { this.Empty = new $BX(0, 0, 0, 0); }
        constructor(r, g, b, a) {
            this._rgba8Brand = undefined;
            this.r = $BX._clamp(r);
            this.g = $BX._clamp(g);
            this.b = $BX._clamp(b);
            this.a = $BX._clamp(a);
        }
        equals(other) {
            return (this.r === other.r
                && this.g === other.g
                && this.b === other.b
                && this.a === other.a);
        }
        static _clamp(c) {
            if (c < 0) {
                return 0;
            }
            if (c > 255) {
                return 255;
            }
            return c | 0;
        }
    }
    exports.$BX = $BX;
});
//# sourceMappingURL=rgba.js.map