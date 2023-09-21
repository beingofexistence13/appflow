/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$e$b = void 0;
    class $e$b {
        constructor() {
            this.a = new Map();
        }
        withService(id, service) {
            this.a.set(id, service);
            return this;
        }
        get(id) {
            const value = this.a.get(id);
            if (!value) {
                throw new Error('Service does not exist');
            }
            return value;
        }
    }
    exports.$e$b = $e$b;
});
//# sourceMappingURL=utils.js.map