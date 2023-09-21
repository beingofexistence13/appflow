/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uint"], function (require, exports, uint_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Is = exports.$Hs = void 0;
    /**
     * A fast character classifier that uses a compact array for ASCII values.
     */
    class $Hs {
        constructor(_defaultValue) {
            const defaultValue = (0, uint_1.$ke)(_defaultValue);
            this.c = defaultValue;
            this.a = $Hs.d(defaultValue);
            this.b = new Map();
        }
        static d(defaultValue) {
            const asciiMap = new Uint8Array(256);
            asciiMap.fill(defaultValue);
            return asciiMap;
        }
        set(charCode, _value) {
            const value = (0, uint_1.$ke)(_value);
            if (charCode >= 0 && charCode < 256) {
                this.a[charCode] = value;
            }
            else {
                this.b.set(charCode, value);
            }
        }
        get(charCode) {
            if (charCode >= 0 && charCode < 256) {
                return this.a[charCode];
            }
            else {
                return (this.b.get(charCode) || this.c);
            }
        }
        clear() {
            this.a.fill(this.c);
            this.b.clear();
        }
    }
    exports.$Hs = $Hs;
    var Boolean;
    (function (Boolean) {
        Boolean[Boolean["False"] = 0] = "False";
        Boolean[Boolean["True"] = 1] = "True";
    })(Boolean || (Boolean = {}));
    class $Is {
        constructor() {
            this.a = new $Hs(0 /* Boolean.False */);
        }
        add(charCode) {
            this.a.set(charCode, 1 /* Boolean.True */);
        }
        has(charCode) {
            return (this.a.get(charCode) === 1 /* Boolean.True */);
        }
        clear() {
            return this.a.clear();
        }
    }
    exports.$Is = $Is;
});
//# sourceMappingURL=characterClassifier.js.map