/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/test/common/utils", "vs/editor/common/languageSelector"], function (require, exports, assert, uri_1, utils_1, languageSelector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('LanguageSelector', function () {
        (0, utils_1.$bT)();
        const model = {
            language: 'farboo',
            uri: uri_1.URI.parse('file:///testbed/file.fb')
        };
        test('score, invalid selector', function () {
            assert.strictEqual((0, languageSelector_1.$cF)({}, model.uri, model.language, true, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.$cF)(undefined, model.uri, model.language, true, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.$cF)(null, model.uri, model.language, true, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.$cF)('', model.uri, model.language, true, undefined, undefined), 0);
        });
        test('score, any language', function () {
            assert.strictEqual((0, languageSelector_1.$cF)({ language: '*' }, model.uri, model.language, true, undefined, undefined), 5);
            assert.strictEqual((0, languageSelector_1.$cF)('*', model.uri, model.language, true, undefined, undefined), 5);
            assert.strictEqual((0, languageSelector_1.$cF)('*', uri_1.URI.parse('foo:bar'), model.language, true, undefined, undefined), 5);
            assert.strictEqual((0, languageSelector_1.$cF)('farboo', uri_1.URI.parse('foo:bar'), model.language, true, undefined, undefined), 10);
        });
        test('score, default schemes', function () {
            const uri = uri_1.URI.parse('git:foo/file.txt');
            const language = 'farboo';
            assert.strictEqual((0, languageSelector_1.$cF)('*', uri, language, true, undefined, undefined), 5);
            assert.strictEqual((0, languageSelector_1.$cF)('farboo', uri, language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.$cF)({ language: 'farboo', scheme: '' }, uri, language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.$cF)({ language: 'farboo', scheme: 'git' }, uri, language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.$cF)({ language: 'farboo', scheme: '*' }, uri, language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.$cF)({ language: 'farboo' }, uri, language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.$cF)({ language: '*' }, uri, language, true, undefined, undefined), 5);
            assert.strictEqual((0, languageSelector_1.$cF)({ scheme: '*' }, uri, language, true, undefined, undefined), 5);
            assert.strictEqual((0, languageSelector_1.$cF)({ scheme: 'git' }, uri, language, true, undefined, undefined), 10);
        });
        test('score, filter', function () {
            assert.strictEqual((0, languageSelector_1.$cF)('farboo', model.uri, model.language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.$cF)({ language: 'farboo' }, model.uri, model.language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.$cF)({ language: 'farboo', scheme: 'file' }, model.uri, model.language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.$cF)({ language: 'farboo', scheme: 'http' }, model.uri, model.language, true, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.$cF)({ pattern: '**/*.fb' }, model.uri, model.language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.$cF)({ pattern: '**/*.fb', scheme: 'file' }, model.uri, model.language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.$cF)({ pattern: '**/*.fb' }, uri_1.URI.parse('foo:bar'), model.language, true, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.$cF)({ pattern: '**/*.fb', scheme: 'foo' }, uri_1.URI.parse('foo:bar'), model.language, true, undefined, undefined), 0);
            const doc = {
                uri: uri_1.URI.parse('git:/my/file.js'),
                langId: 'javascript'
            };
            assert.strictEqual((0, languageSelector_1.$cF)('javascript', doc.uri, doc.langId, true, undefined, undefined), 10); // 0;
            assert.strictEqual((0, languageSelector_1.$cF)({ language: 'javascript', scheme: 'git' }, doc.uri, doc.langId, true, undefined, undefined), 10); // 10;
            assert.strictEqual((0, languageSelector_1.$cF)('*', doc.uri, doc.langId, true, undefined, undefined), 5); // 5
            assert.strictEqual((0, languageSelector_1.$cF)('fooLang', doc.uri, doc.langId, true, undefined, undefined), 0); // 0
            assert.strictEqual((0, languageSelector_1.$cF)(['fooLang', '*'], doc.uri, doc.langId, true, undefined, undefined), 5); // 5
        });
        test('score, max(filters)', function () {
            const match = { language: 'farboo', scheme: 'file' };
            const fail = { language: 'farboo', scheme: 'http' };
            assert.strictEqual((0, languageSelector_1.$cF)(match, model.uri, model.language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.$cF)(fail, model.uri, model.language, true, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.$cF)([match, fail], model.uri, model.language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.$cF)([fail, fail], model.uri, model.language, true, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.$cF)(['farboo', '*'], model.uri, model.language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.$cF)(['*', 'farboo'], model.uri, model.language, true, undefined, undefined), 10);
        });
        test('score hasAccessToAllModels', function () {
            const doc = {
                uri: uri_1.URI.parse('file:/my/file.js'),
                langId: 'javascript'
            };
            assert.strictEqual((0, languageSelector_1.$cF)('javascript', doc.uri, doc.langId, false, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.$cF)({ language: 'javascript', scheme: 'file' }, doc.uri, doc.langId, false, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.$cF)('*', doc.uri, doc.langId, false, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.$cF)('fooLang', doc.uri, doc.langId, false, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.$cF)(['fooLang', '*'], doc.uri, doc.langId, false, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.$cF)({ language: 'javascript', scheme: 'file', hasAccessToAllModels: true }, doc.uri, doc.langId, false, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.$cF)(['fooLang', '*', { language: '*', hasAccessToAllModels: true }], doc.uri, doc.langId, false, undefined, undefined), 5);
        });
        test('score, notebookType', function () {
            const obj = {
                uri: uri_1.URI.parse('vscode-notebook-cell:///my/file.js#blabla'),
                langId: 'javascript',
                notebookType: 'fooBook',
                notebookUri: uri_1.URI.parse('file:///my/file.js')
            };
            assert.strictEqual((0, languageSelector_1.$cF)('javascript', obj.uri, obj.langId, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.$cF)('javascript', obj.uri, obj.langId, true, obj.notebookUri, obj.notebookType), 10);
            assert.strictEqual((0, languageSelector_1.$cF)({ notebookType: 'fooBook' }, obj.uri, obj.langId, true, obj.notebookUri, obj.notebookType), 10);
            assert.strictEqual((0, languageSelector_1.$cF)({ notebookType: 'fooBook', language: 'javascript', scheme: 'file' }, obj.uri, obj.langId, true, obj.notebookUri, obj.notebookType), 10);
            assert.strictEqual((0, languageSelector_1.$cF)({ notebookType: 'fooBook', language: '*' }, obj.uri, obj.langId, true, obj.notebookUri, obj.notebookType), 10);
            assert.strictEqual((0, languageSelector_1.$cF)({ notebookType: '*', language: '*' }, obj.uri, obj.langId, true, obj.notebookUri, obj.notebookType), 5);
            assert.strictEqual((0, languageSelector_1.$cF)({ notebookType: '*', language: 'javascript' }, obj.uri, obj.langId, true, obj.notebookUri, obj.notebookType), 10);
        });
        test('Snippet choices lost #149363', function () {
            const selector = {
                scheme: 'vscode-notebook-cell',
                pattern: '/some/path/file.py',
                language: 'python'
            };
            const modelUri = uri_1.URI.parse('vscode-notebook-cell:///some/path/file.py');
            const nbUri = uri_1.URI.parse('file:///some/path/file.py');
            assert.strictEqual((0, languageSelector_1.$cF)(selector, modelUri, 'python', true, nbUri, 'jupyter'), 10);
            const selector2 = {
                ...selector,
                notebookType: 'jupyter'
            };
            assert.strictEqual((0, languageSelector_1.$cF)(selector2, modelUri, 'python', true, nbUri, 'jupyter'), 0);
        });
        test('Document selector match - unexpected result value #60232', function () {
            const selector = {
                language: 'json',
                scheme: 'file',
                pattern: '**/*.interface.json'
            };
            const value = (0, languageSelector_1.$cF)(selector, uri_1.URI.parse('file:///C:/Users/zlhe/Desktop/test.interface.json'), 'json', true, undefined, undefined);
            assert.strictEqual(value, 10);
        });
        test('Document selector match - platform paths #99938', function () {
            const selector = {
                pattern: {
                    base: '/home/user/Desktop',
                    pattern: '*.json'
                }
            };
            const value = (0, languageSelector_1.$cF)(selector, uri_1.URI.file('/home/user/Desktop/test.json'), 'json', true, undefined, undefined);
            assert.strictEqual(value, 10);
        });
        test('NotebookType without notebook', function () {
            const obj = {
                uri: uri_1.URI.parse('file:///my/file.bat'),
                langId: 'bat',
            };
            let value = (0, languageSelector_1.$cF)({
                language: 'bat',
                notebookType: 'xxx'
            }, obj.uri, obj.langId, true, undefined, undefined);
            assert.strictEqual(value, 0);
            value = (0, languageSelector_1.$cF)({
                language: 'bat',
                notebookType: '*'
            }, obj.uri, obj.langId, true, undefined, undefined);
            assert.strictEqual(value, 0);
        });
    });
});
//# sourceMappingURL=languageSelector.test.js.map