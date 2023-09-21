/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/assert", "vs/base/common/types"], function (require, exports, Assert, Types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8m = void 0;
    class RegistryImpl {
        constructor() {
            this.a = new Map();
        }
        add(id, data) {
            Assert.ok(Types.$jf(id));
            Assert.ok(Types.$lf(data));
            Assert.ok(!this.a.has(id), 'There is already an extension with this id');
            this.a.set(id, data);
        }
        knows(id) {
            return this.a.has(id);
        }
        as(id) {
            return this.a.get(id) || null;
        }
    }
    exports.$8m = new RegistryImpl();
});
//# sourceMappingURL=platform.js.map