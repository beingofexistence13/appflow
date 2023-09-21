/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/extpath", "vs/base/common/path", "vs/base/test/common/testUtils"], function (require, exports, extpath_1, path_1, testUtils) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.flakySuite = exports.getRandomTestPath = void 0;
    function getRandomTestPath(tmpdir, ...segments) {
        return (0, extpath_1.randomPath)((0, path_1.join)(tmpdir, ...segments));
    }
    exports.getRandomTestPath = getRandomTestPath;
    exports.flakySuite = testUtils.flakySuite;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFV0aWxzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L25vZGUvdGVzdFV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxTQUFnQixpQkFBaUIsQ0FBQyxNQUFjLEVBQUUsR0FBRyxRQUFrQjtRQUN0RSxPQUFPLElBQUEsb0JBQVUsRUFBQyxJQUFBLFdBQUksRUFBQyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFGRCw4Q0FFQztJQUVhLFFBQUEsVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMifQ==