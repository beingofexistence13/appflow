/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/extpath", "vs/base/common/path", "vs/base/test/common/testUtils"], function (require, exports, extpath_1, path_1, testUtils) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.flakySuite = exports.$oT = void 0;
    function $oT(tmpdir, ...segments) {
        return (0, extpath_1.$Qf)((0, path_1.$9d)(tmpdir, ...segments));
    }
    exports.$oT = $oT;
    exports.flakySuite = testUtils.$hT;
});
//# sourceMappingURL=testUtils.js.map