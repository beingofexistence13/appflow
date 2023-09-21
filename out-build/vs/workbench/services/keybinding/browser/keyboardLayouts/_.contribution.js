/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$cgc = void 0;
    class $cgc {
        static { this.INSTANCE = new $cgc(); }
        get layoutInfos() {
            return this.a;
        }
        constructor() {
            this.a = [];
        }
        registerKeyboardLayout(layout) {
            this.a.push(layout);
        }
    }
    exports.$cgc = $cgc;
});
//# sourceMappingURL=_.contribution.js.map