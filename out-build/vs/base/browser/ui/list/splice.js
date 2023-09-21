/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$aQ = void 0;
    class $aQ {
        constructor(a) {
            this.a = a;
        }
        splice(start, deleteCount, elements) {
            this.a.forEach(s => s.splice(start, deleteCount, elements));
        }
    }
    exports.$aQ = $aQ;
});
//# sourceMappingURL=splice.js.map