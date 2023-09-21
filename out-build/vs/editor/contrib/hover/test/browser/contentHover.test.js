/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/contrib/hover/browser/contentHover", "vs/editor/test/browser/testCodeEditor"], function (require, exports, assert, utils_1, position_1, range_1, contentHover_1, testCodeEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Content Hover', () => {
        (0, utils_1.$bT)();
        test('issue #151235: Gitlens hover shows up in the wrong place', () => {
            const text = 'just some text';
            (0, testCodeEditor_1.$X0b)(text, {}, (editor) => {
                const actual = contentHover_1.$24.computeHoverRanges(editor, new range_1.$ks(5, 5, 5, 5), [{ range: new range_1.$ks(4, 1, 5, 6) }]);
                assert.deepStrictEqual(actual, {
                    showAtPosition: new position_1.$js(5, 5),
                    showAtSecondaryPosition: new position_1.$js(5, 5),
                    highlightRange: new range_1.$ks(4, 1, 5, 6)
                });
            });
        });
        test('issue #95328: Hover placement with word-wrap', () => {
            const text = 'just some text';
            const opts = { wordWrap: 'wordWrapColumn', wordWrapColumn: 6 };
            (0, testCodeEditor_1.$X0b)(text, opts, (editor) => {
                const actual = contentHover_1.$24.computeHoverRanges(editor, new range_1.$ks(1, 8, 1, 8), [{ range: new range_1.$ks(1, 1, 1, 15) }]);
                assert.deepStrictEqual(actual, {
                    showAtPosition: new position_1.$js(1, 8),
                    showAtSecondaryPosition: new position_1.$js(1, 6),
                    highlightRange: new range_1.$ks(1, 1, 1, 15)
                });
            });
        });
    });
});
//# sourceMappingURL=contentHover.test.js.map