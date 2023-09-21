/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/lineRange", "vs/editor/common/core/range"], function (require, exports, lineRange_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$eqb = exports.$dqb = void 0;
    function $dqb(range, model) {
        if (range.isEmpty) {
            return [];
        }
        const result = [];
        result.push(new lineRange_1.$ts(1, range.startLineNumber));
        result.push(new lineRange_1.$ts(range.endLineNumberExclusive, model.getLineCount() + 1));
        return result.filter(r => !r.isEmpty);
    }
    exports.$dqb = $dqb;
    function $eqb(r) {
        return new range_1.$ks(r.startLineNumber, 1, r.endLineNumberExclusive - 1, 1);
    }
    exports.$eqb = $eqb;
});
//# sourceMappingURL=utils.js.map