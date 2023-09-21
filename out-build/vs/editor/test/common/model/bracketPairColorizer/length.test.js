/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length"], function (require, exports, assert, utils_1, length_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Bracket Pair Colorizer - Length', () => {
        (0, utils_1.$bT)();
        function toStr(length) {
            return (0, length_1.$st)(length).toString();
        }
        test('Basic', () => {
            const l1 = (0, length_1.$rt)(100, 10);
            assert.strictEqual((0, length_1.$st)(l1).lineCount, 100);
            assert.strictEqual((0, length_1.$st)(l1).columnCount, 10);
            assert.deepStrictEqual(toStr((0, length_1.$vt)(l1, (0, length_1.$rt)(100, 10))), '200,10');
            assert.deepStrictEqual(toStr((0, length_1.$vt)(l1, (0, length_1.$rt)(0, 10))), '100,20');
        });
        test('lengthDiffNonNeg', () => {
            assert.deepStrictEqual(toStr((0, length_1.$yt)((0, length_1.$rt)(100, 10), (0, length_1.$rt)(100, 20))), '0,10');
            assert.deepStrictEqual(toStr((0, length_1.$yt)((0, length_1.$rt)(100, 10), (0, length_1.$rt)(101, 20))), '1,20');
            assert.deepStrictEqual(toStr((0, length_1.$yt)((0, length_1.$rt)(101, 30), (0, length_1.$rt)(101, 20))), '0,0');
            assert.deepStrictEqual(toStr((0, length_1.$yt)((0, length_1.$rt)(102, 10), (0, length_1.$rt)(101, 20))), '0,0');
        });
    });
});
//# sourceMappingURL=length.test.js.map