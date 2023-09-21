/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/diff/legacyLinesDiffComputer", "vs/editor/common/diff/defaultLinesDiffComputer/defaultLinesDiffComputer"], function (require, exports, legacyLinesDiffComputer_1, defaultLinesDiffComputer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ZY = void 0;
    exports.$ZY = {
        getLegacy: () => new legacyLinesDiffComputer_1.$As(),
        getDefault: () => new defaultLinesDiffComputer_1.$WY(),
    };
});
//# sourceMappingURL=linesDiffComputers.js.map