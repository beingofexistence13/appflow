/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/selection", "vs/editor/common/core/textChange", "vs/editor/common/model/editStack"], function (require, exports, assert, utils_1, selection_1, textChange_1, editStack_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EditStack', () => {
        (0, utils_1.$bT)();
        test('issue #118041: unicode character undo bug', () => {
            const stackData = new editStack_1.$RB(1, 2, 0 /* EndOfLineSequence.LF */, 0 /* EndOfLineSequence.LF */, [new selection_1.$ms(10, 2, 10, 2)], [new selection_1.$ms(10, 1, 10, 1)], [new textChange_1.$Fs(428, '﻿', 428, '')]);
            const buff = stackData.serialize();
            const actual = editStack_1.$RB.deserialize(buff);
            assert.deepStrictEqual(actual, stackData);
        });
    });
});
//# sourceMappingURL=editStack.test.js.map