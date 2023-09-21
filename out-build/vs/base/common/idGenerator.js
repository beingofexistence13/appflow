/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8L = exports.$7L = void 0;
    class $7L {
        constructor(prefix) {
            this.a = prefix;
            this.b = 0;
        }
        nextId() {
            return this.a + (++this.b);
        }
    }
    exports.$7L = $7L;
    exports.$8L = new $7L('id#');
});
//# sourceMappingURL=idGenerator.js.map