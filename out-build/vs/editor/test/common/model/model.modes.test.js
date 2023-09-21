/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/common/languages/nullTokenize", "vs/editor/test/common/testTextModel"], function (require, exports, assert, utils_1, editOperation_1, position_1, range_1, languages, nullTokenize_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // --------- utils
    suite('Editor Model - Model Modes 1', () => {
        let calledFor = [];
        function getAndClear() {
            const result = calledFor;
            calledFor = [];
            return result;
        }
        const tokenizationSupport = {
            getInitialState: () => nullTokenize_1.$uC,
            tokenize: undefined,
            tokenizeEncoded: (line, hasEOL, state) => {
                calledFor.push(line.charAt(0));
                return new languages.$6s(new Uint32Array(0), state);
            }
        };
        let thisModel;
        let languageRegistration;
        setup(() => {
            const TEXT = '1\r\n' +
                '2\n' +
                '3\n' +
                '4\r\n' +
                '5';
            const LANGUAGE_ID = 'modelModeTest1';
            calledFor = [];
            languageRegistration = languages.$bt.register(LANGUAGE_ID, tokenizationSupport);
            thisModel = (0, testTextModel_1.$O0b)(TEXT, LANGUAGE_ID);
        });
        teardown(() => {
            thisModel.dispose();
            languageRegistration.dispose();
            calledFor = [];
        });
        (0, utils_1.$bT)();
        test('model calls syntax highlighter 1', () => {
            thisModel.tokenization.forceTokenization(1);
            assert.deepStrictEqual(getAndClear(), ['1']);
        });
        test('model calls syntax highlighter 2', () => {
            thisModel.tokenization.forceTokenization(2);
            assert.deepStrictEqual(getAndClear(), ['1', '2']);
            thisModel.tokenization.forceTokenization(2);
            assert.deepStrictEqual(getAndClear(), []);
        });
        test('model caches states', () => {
            thisModel.tokenization.forceTokenization(1);
            assert.deepStrictEqual(getAndClear(), ['1']);
            thisModel.tokenization.forceTokenization(2);
            assert.deepStrictEqual(getAndClear(), ['2']);
            thisModel.tokenization.forceTokenization(3);
            assert.deepStrictEqual(getAndClear(), ['3']);
            thisModel.tokenization.forceTokenization(4);
            assert.deepStrictEqual(getAndClear(), ['4']);
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), ['5']);
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), []);
        });
        test('model invalidates states for one line insert', () => {
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), ['1', '2', '3', '4', '5']);
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 1), '-')]);
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), ['-']);
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), []);
        });
        test('model invalidates states for many lines insert', () => {
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), ['1', '2', '3', '4', '5']);
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 1), '0\n-\n+')]);
            assert.strictEqual(thisModel.getLineCount(), 7);
            thisModel.tokenization.forceTokenization(7);
            assert.deepStrictEqual(getAndClear(), ['0', '-', '+']);
            thisModel.tokenization.forceTokenization(7);
            assert.deepStrictEqual(getAndClear(), []);
        });
        test('model invalidates states for one new line', () => {
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), ['1', '2', '3', '4', '5']);
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 2), '\n')]);
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(2, 1), 'a')]);
            thisModel.tokenization.forceTokenization(6);
            assert.deepStrictEqual(getAndClear(), ['1', 'a']);
        });
        test('model invalidates states for one line delete', () => {
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), ['1', '2', '3', '4', '5']);
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 2), '-')]);
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), ['1']);
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 1, 1, 2))]);
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), ['-']);
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), []);
        });
        test('model invalidates states for many lines delete', () => {
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), ['1', '2', '3', '4', '5']);
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 1, 3, 1))]);
            thisModel.tokenization.forceTokenization(3);
            assert.deepStrictEqual(getAndClear(), ['3']);
            thisModel.tokenization.forceTokenization(3);
            assert.deepStrictEqual(getAndClear(), []);
        });
    });
    suite('Editor Model - Model Modes 2', () => {
        class ModelState2 {
            constructor(prevLineContent) {
                this.prevLineContent = prevLineContent;
            }
            clone() {
                return new ModelState2(this.prevLineContent);
            }
            equals(other) {
                return (other instanceof ModelState2) && other.prevLineContent === this.prevLineContent;
            }
        }
        let calledFor = [];
        function getAndClear() {
            const actual = calledFor;
            calledFor = [];
            return actual;
        }
        const tokenizationSupport = {
            getInitialState: () => new ModelState2(''),
            tokenize: undefined,
            tokenizeEncoded: (line, hasEOL, state) => {
                calledFor.push(line);
                state.prevLineContent = line;
                return new languages.$6s(new Uint32Array(0), state);
            }
        };
        let thisModel;
        let languageRegistration;
        setup(() => {
            const TEXT = 'Line1' + '\r\n' +
                'Line2' + '\n' +
                'Line3' + '\n' +
                'Line4' + '\r\n' +
                'Line5';
            const LANGUAGE_ID = 'modelModeTest2';
            languageRegistration = languages.$bt.register(LANGUAGE_ID, tokenizationSupport);
            thisModel = (0, testTextModel_1.$O0b)(TEXT, LANGUAGE_ID);
        });
        teardown(() => {
            thisModel.dispose();
            languageRegistration.dispose();
        });
        (0, utils_1.$bT)();
        test('getTokensForInvalidLines one text insert', () => {
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), ['Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 6), '-')]);
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), ['Line1-', 'Line2']);
        });
        test('getTokensForInvalidLines two text insert', () => {
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), ['Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.applyEdits([
                editOperation_1.$ls.insert(new position_1.$js(1, 6), '-'),
                editOperation_1.$ls.insert(new position_1.$js(3, 6), '-')
            ]);
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), ['Line1-', 'Line2', 'Line3-', 'Line4']);
        });
        test('getTokensForInvalidLines one multi-line text insert, one small text insert', () => {
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), ['Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(1, 6), '\nNew line\nAnother new line')]);
            thisModel.applyEdits([editOperation_1.$ls.insert(new position_1.$js(5, 6), '-')]);
            thisModel.tokenization.forceTokenization(7);
            assert.deepStrictEqual(getAndClear(), ['Line1', 'New line', 'Another new line', 'Line2', 'Line3-', 'Line4']);
        });
        test('getTokensForInvalidLines one delete text', () => {
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), ['Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 1, 1, 5))]);
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), ['1', 'Line2']);
        });
        test('getTokensForInvalidLines one line delete text', () => {
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), ['Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 1, 2, 1))]);
            thisModel.tokenization.forceTokenization(4);
            assert.deepStrictEqual(getAndClear(), ['Line2']);
        });
        test('getTokensForInvalidLines multiple lines delete text', () => {
            thisModel.tokenization.forceTokenization(5);
            assert.deepStrictEqual(getAndClear(), ['Line1', 'Line2', 'Line3', 'Line4', 'Line5']);
            thisModel.applyEdits([editOperation_1.$ls.delete(new range_1.$ks(1, 1, 3, 3))]);
            thisModel.tokenization.forceTokenization(3);
            assert.deepStrictEqual(getAndClear(), ['ne3', 'Line4']);
        });
    });
});
//# sourceMappingURL=model.modes.test.js.map