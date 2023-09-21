/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/languages/languageConfiguration", "vs/editor/test/common/modes/testLanguageConfigurationService"], function (require, exports, assert, utils_1, languageConfiguration_1, testLanguageConfigurationService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('StandardAutoClosingPairConditional', () => {
        (0, utils_1.$bT)();
        test('Missing notIn', () => {
            const v = new languageConfiguration_1.$gt({ open: '{', close: '}' });
            assert.strictEqual(v.isOK(0 /* StandardTokenType.Other */), true);
            assert.strictEqual(v.isOK(1 /* StandardTokenType.Comment */), true);
            assert.strictEqual(v.isOK(2 /* StandardTokenType.String */), true);
            assert.strictEqual(v.isOK(3 /* StandardTokenType.RegEx */), true);
        });
        test('Empty notIn', () => {
            const v = new languageConfiguration_1.$gt({ open: '{', close: '}', notIn: [] });
            assert.strictEqual(v.isOK(0 /* StandardTokenType.Other */), true);
            assert.strictEqual(v.isOK(1 /* StandardTokenType.Comment */), true);
            assert.strictEqual(v.isOK(2 /* StandardTokenType.String */), true);
            assert.strictEqual(v.isOK(3 /* StandardTokenType.RegEx */), true);
        });
        test('Invalid notIn', () => {
            const v = new languageConfiguration_1.$gt({ open: '{', close: '}', notIn: ['bla'] });
            assert.strictEqual(v.isOK(0 /* StandardTokenType.Other */), true);
            assert.strictEqual(v.isOK(1 /* StandardTokenType.Comment */), true);
            assert.strictEqual(v.isOK(2 /* StandardTokenType.String */), true);
            assert.strictEqual(v.isOK(3 /* StandardTokenType.RegEx */), true);
        });
        test('notIn in strings', () => {
            const v = new languageConfiguration_1.$gt({ open: '{', close: '}', notIn: ['string'] });
            assert.strictEqual(v.isOK(0 /* StandardTokenType.Other */), true);
            assert.strictEqual(v.isOK(1 /* StandardTokenType.Comment */), true);
            assert.strictEqual(v.isOK(2 /* StandardTokenType.String */), false);
            assert.strictEqual(v.isOK(3 /* StandardTokenType.RegEx */), true);
        });
        test('notIn in comments', () => {
            const v = new languageConfiguration_1.$gt({ open: '{', close: '}', notIn: ['comment'] });
            assert.strictEqual(v.isOK(0 /* StandardTokenType.Other */), true);
            assert.strictEqual(v.isOK(1 /* StandardTokenType.Comment */), false);
            assert.strictEqual(v.isOK(2 /* StandardTokenType.String */), true);
            assert.strictEqual(v.isOK(3 /* StandardTokenType.RegEx */), true);
        });
        test('notIn in regex', () => {
            const v = new languageConfiguration_1.$gt({ open: '{', close: '}', notIn: ['regex'] });
            assert.strictEqual(v.isOK(0 /* StandardTokenType.Other */), true);
            assert.strictEqual(v.isOK(1 /* StandardTokenType.Comment */), true);
            assert.strictEqual(v.isOK(2 /* StandardTokenType.String */), true);
            assert.strictEqual(v.isOK(3 /* StandardTokenType.RegEx */), false);
        });
        test('notIn in strings nor comments', () => {
            const v = new languageConfiguration_1.$gt({ open: '{', close: '}', notIn: ['string', 'comment'] });
            assert.strictEqual(v.isOK(0 /* StandardTokenType.Other */), true);
            assert.strictEqual(v.isOK(1 /* StandardTokenType.Comment */), false);
            assert.strictEqual(v.isOK(2 /* StandardTokenType.String */), false);
            assert.strictEqual(v.isOK(3 /* StandardTokenType.RegEx */), true);
        });
        test('notIn in strings nor regex', () => {
            const v = new languageConfiguration_1.$gt({ open: '{', close: '}', notIn: ['string', 'regex'] });
            assert.strictEqual(v.isOK(0 /* StandardTokenType.Other */), true);
            assert.strictEqual(v.isOK(1 /* StandardTokenType.Comment */), true);
            assert.strictEqual(v.isOK(2 /* StandardTokenType.String */), false);
            assert.strictEqual(v.isOK(3 /* StandardTokenType.RegEx */), false);
        });
        test('notIn in comments nor regex', () => {
            const v = new languageConfiguration_1.$gt({ open: '{', close: '}', notIn: ['comment', 'regex'] });
            assert.strictEqual(v.isOK(0 /* StandardTokenType.Other */), true);
            assert.strictEqual(v.isOK(1 /* StandardTokenType.Comment */), false);
            assert.strictEqual(v.isOK(2 /* StandardTokenType.String */), true);
            assert.strictEqual(v.isOK(3 /* StandardTokenType.RegEx */), false);
        });
        test('notIn in strings, comments nor regex', () => {
            const v = new languageConfiguration_1.$gt({ open: '{', close: '}', notIn: ['string', 'comment', 'regex'] });
            assert.strictEqual(v.isOK(0 /* StandardTokenType.Other */), true);
            assert.strictEqual(v.isOK(1 /* StandardTokenType.Comment */), false);
            assert.strictEqual(v.isOK(2 /* StandardTokenType.String */), false);
            assert.strictEqual(v.isOK(3 /* StandardTokenType.RegEx */), false);
        });
        test('language configurations priorities', () => {
            const languageConfigurationService = new testLanguageConfigurationService_1.$D0b();
            const id = 'testLang1';
            const d1 = languageConfigurationService.register(id, { comments: { lineComment: '1' } }, 100);
            const d2 = languageConfigurationService.register(id, { comments: { lineComment: '2' } }, 10);
            assert.strictEqual(languageConfigurationService.getLanguageConfiguration(id).comments?.lineCommentToken, '1');
            d1.dispose();
            d2.dispose();
            languageConfigurationService.dispose();
        });
    });
});
//# sourceMappingURL=languageConfiguration.test.js.map