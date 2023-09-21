/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4R = void 0;
    class $4R extends Error {
        constructor(user, message) {
            super(`TableError [${user}] ${message}`);
        }
    }
    exports.$4R = $4R;
});
//# sourceMappingURL=table.js.map