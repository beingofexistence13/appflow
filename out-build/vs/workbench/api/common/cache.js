/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6ac = void 0;
    class $6ac {
        static { this.a = false; }
        constructor(d) {
            this.d = d;
            this.b = new Map();
            this.c = 1;
        }
        add(item) {
            const id = this.c++;
            this.b.set(id, item);
            this.e();
            return id;
        }
        get(pid, id) {
            return this.b.has(pid) ? this.b.get(pid)[id] : undefined;
        }
        delete(id) {
            this.b.delete(id);
            this.e();
        }
        e() {
            if (!$6ac.a) {
                return;
            }
            console.log(`${this.d} cache size - ${this.b.size}`);
        }
    }
    exports.$6ac = $6ac;
});
//# sourceMappingURL=cache.js.map