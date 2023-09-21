/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zh = void 0;
    class $zh {
        constructor(...entries) {
            this.a = new Map();
            for (const [id, service] of entries) {
                this.set(id, service);
            }
        }
        set(id, instanceOrDescriptor) {
            const result = this.a.get(id);
            this.a.set(id, instanceOrDescriptor);
            return result;
        }
        has(id) {
            return this.a.has(id);
        }
        get(id) {
            return this.a.get(id);
        }
    }
    exports.$zh = $zh;
});
//# sourceMappingURL=serviceCollection.js.map