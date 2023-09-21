/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/sign/common/abstractSignService"], function (require, exports, abstractSignService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$k7b = void 0;
    class $k7b extends abstractSignService_1.$x2b {
        c() {
            return this.h().then(vsda => new vsda.validator());
        }
        d(arg) {
            return this.h().then(vsda => new vsda.signer().sign(arg));
        }
        h() {
            return new Promise((resolve, reject) => require(['vsda'], resolve, reject));
        }
    }
    exports.$k7b = $k7b;
});
//# sourceMappingURL=signService.js.map