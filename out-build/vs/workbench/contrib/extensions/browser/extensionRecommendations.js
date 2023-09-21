/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle"], function (require, exports, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$PUb = void 0;
    class $PUb extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.f = null;
        }
        get activated() { return this.f !== null; }
        activate() {
            if (!this.f) {
                this.f = this.c();
            }
            return this.f;
        }
    }
    exports.$PUb = $PUb;
});
//# sourceMappingURL=extensionRecommendations.js.map