/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ilb = void 0;
    class UserActivityRegistry {
        constructor() {
            this.a = [];
            this.add = (ctor) => {
                this.a.push(ctor);
            };
        }
        take(userActivityService, instantiation) {
            this.add = ctor => instantiation.createInstance(ctor, userActivityService);
            this.a.forEach(this.add);
            this.a = [];
        }
    }
    exports.$ilb = new UserActivityRegistry();
});
//# sourceMappingURL=userActivityRegistry.js.map