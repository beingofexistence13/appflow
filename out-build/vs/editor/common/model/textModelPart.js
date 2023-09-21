/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle"], function (require, exports, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$WB = void 0;
    class $WB extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.f = false;
        }
        dispose() {
            super.dispose();
            this.f = true;
        }
        g() {
            if (this.f) {
                throw new Error('TextModelPart is disposed!');
            }
        }
    }
    exports.$WB = $WB;
});
//# sourceMappingURL=textModelPart.js.map