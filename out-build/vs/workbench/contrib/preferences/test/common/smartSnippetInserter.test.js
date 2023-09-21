/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/preferences/common/smartSnippetInserter", "vs/editor/test/common/testTextModel", "vs/editor/common/core/position", "vs/base/test/common/utils"], function (require, exports, assert, smartSnippetInserter_1, testTextModel_1, position_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SmartSnippetInserter', () => {
        function testSmartSnippetInserter(text, runner) {
            const model = (0, testTextModel_1.$O0b)(text.join('\n'));
            runner((desiredPos, pos, prepend, append) => {
                const actual = smartSnippetInserter_1.$0Db.insertSnippet(model, desiredPos);
                const expected = {
                    position: pos,
                    prepend,
                    append
                };
                assert.deepStrictEqual(actual, expected);
            });
            model.dispose();
        }
        test('empty text', () => {
            testSmartSnippetInserter([], (assert) => {
                assert(new position_1.$js(1, 1), new position_1.$js(1, 1), '\n[', ']');
            });
            testSmartSnippetInserter([
                ' '
            ], (assert) => {
                assert(new position_1.$js(1, 1), new position_1.$js(1, 2), '\n[', ']');
                assert(new position_1.$js(1, 2), new position_1.$js(1, 2), '\n[', ']');
            });
            testSmartSnippetInserter([
                '// just some text'
            ], (assert) => {
                assert(new position_1.$js(1, 1), new position_1.$js(1, 18), '\n[', ']');
                assert(new position_1.$js(1, 18), new position_1.$js(1, 18), '\n[', ']');
            });
            testSmartSnippetInserter([
                '// just some text',
                ''
            ], (assert) => {
                assert(new position_1.$js(1, 1), new position_1.$js(2, 1), '\n[', ']');
                assert(new position_1.$js(1, 18), new position_1.$js(2, 1), '\n[', ']');
                assert(new position_1.$js(2, 1), new position_1.$js(2, 1), '\n[', ']');
            });
        });
        test('empty array 1', () => {
            testSmartSnippetInserter([
                '// just some text',
                '[]'
            ], (assert) => {
                assert(new position_1.$js(1, 1), new position_1.$js(2, 2), '', '');
                assert(new position_1.$js(2, 1), new position_1.$js(2, 2), '', '');
                assert(new position_1.$js(2, 2), new position_1.$js(2, 2), '', '');
                assert(new position_1.$js(2, 3), new position_1.$js(2, 2), '', '');
            });
        });
        test('empty array 2', () => {
            testSmartSnippetInserter([
                '// just some text',
                '[',
                ']'
            ], (assert) => {
                assert(new position_1.$js(1, 1), new position_1.$js(2, 2), '', '');
                assert(new position_1.$js(2, 1), new position_1.$js(2, 2), '', '');
                assert(new position_1.$js(2, 2), new position_1.$js(2, 2), '', '');
                assert(new position_1.$js(3, 1), new position_1.$js(3, 1), '', '');
                assert(new position_1.$js(3, 2), new position_1.$js(3, 1), '', '');
            });
        });
        test('empty array 3', () => {
            testSmartSnippetInserter([
                '// just some text',
                '[',
                '// just some text',
                ']'
            ], (assert) => {
                assert(new position_1.$js(1, 1), new position_1.$js(2, 2), '', '');
                assert(new position_1.$js(2, 1), new position_1.$js(2, 2), '', '');
                assert(new position_1.$js(2, 2), new position_1.$js(2, 2), '', '');
                assert(new position_1.$js(3, 1), new position_1.$js(3, 1), '', '');
                assert(new position_1.$js(3, 2), new position_1.$js(3, 1), '', '');
                assert(new position_1.$js(4, 1), new position_1.$js(4, 1), '', '');
                assert(new position_1.$js(4, 2), new position_1.$js(4, 1), '', '');
            });
        });
        test('one element array 1', () => {
            testSmartSnippetInserter([
                '// just some text',
                '[',
                '{}',
                ']'
            ], (assert) => {
                assert(new position_1.$js(1, 1), new position_1.$js(2, 2), '', ',');
                assert(new position_1.$js(2, 1), new position_1.$js(2, 2), '', ',');
                assert(new position_1.$js(2, 2), new position_1.$js(2, 2), '', ',');
                assert(new position_1.$js(3, 1), new position_1.$js(3, 1), '', ',');
                assert(new position_1.$js(3, 2), new position_1.$js(3, 1), '', ',');
                assert(new position_1.$js(3, 3), new position_1.$js(3, 3), ',', '');
                assert(new position_1.$js(4, 1), new position_1.$js(4, 1), ',', '');
                assert(new position_1.$js(4, 2), new position_1.$js(4, 1), ',', '');
            });
        });
        test('two elements array 1', () => {
            testSmartSnippetInserter([
                '// just some text',
                '[',
                '{},',
                '{}',
                ']'
            ], (assert) => {
                assert(new position_1.$js(1, 1), new position_1.$js(2, 2), '', ',');
                assert(new position_1.$js(2, 1), new position_1.$js(2, 2), '', ',');
                assert(new position_1.$js(2, 2), new position_1.$js(2, 2), '', ',');
                assert(new position_1.$js(3, 1), new position_1.$js(3, 1), '', ',');
                assert(new position_1.$js(3, 2), new position_1.$js(3, 1), '', ',');
                assert(new position_1.$js(3, 3), new position_1.$js(3, 3), ',', '');
                assert(new position_1.$js(3, 4), new position_1.$js(3, 4), '', ',');
                assert(new position_1.$js(4, 1), new position_1.$js(4, 1), '', ',');
                assert(new position_1.$js(4, 2), new position_1.$js(4, 1), '', ',');
                assert(new position_1.$js(4, 3), new position_1.$js(4, 3), ',', '');
                assert(new position_1.$js(5, 1), new position_1.$js(5, 1), ',', '');
                assert(new position_1.$js(5, 2), new position_1.$js(5, 1), ',', '');
            });
        });
        test('two elements array 2', () => {
            testSmartSnippetInserter([
                '// just some text',
                '[',
                '{},{}',
                ']'
            ], (assert) => {
                assert(new position_1.$js(1, 1), new position_1.$js(2, 2), '', ',');
                assert(new position_1.$js(2, 1), new position_1.$js(2, 2), '', ',');
                assert(new position_1.$js(2, 2), new position_1.$js(2, 2), '', ',');
                assert(new position_1.$js(3, 1), new position_1.$js(3, 1), '', ',');
                assert(new position_1.$js(3, 2), new position_1.$js(3, 1), '', ',');
                assert(new position_1.$js(3, 3), new position_1.$js(3, 3), ',', '');
                assert(new position_1.$js(3, 4), new position_1.$js(3, 4), '', ',');
                assert(new position_1.$js(3, 5), new position_1.$js(3, 4), '', ',');
                assert(new position_1.$js(3, 6), new position_1.$js(3, 6), ',', '');
                assert(new position_1.$js(4, 1), new position_1.$js(4, 1), ',', '');
                assert(new position_1.$js(4, 2), new position_1.$js(4, 1), ',', '');
            });
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=smartSnippetInserter.test.js.map