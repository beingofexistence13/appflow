/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/test/common/utils", "vs/editor/common/languageSelector"], function (require, exports, assert, uri_1, utils_1, languageSelector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('LanguageSelector', function () {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        const model = {
            language: 'farboo',
            uri: uri_1.URI.parse('file:///testbed/file.fb')
        };
        test('score, invalid selector', function () {
            assert.strictEqual((0, languageSelector_1.score)({}, model.uri, model.language, true, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.score)(undefined, model.uri, model.language, true, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.score)(null, model.uri, model.language, true, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.score)('', model.uri, model.language, true, undefined, undefined), 0);
        });
        test('score, any language', function () {
            assert.strictEqual((0, languageSelector_1.score)({ language: '*' }, model.uri, model.language, true, undefined, undefined), 5);
            assert.strictEqual((0, languageSelector_1.score)('*', model.uri, model.language, true, undefined, undefined), 5);
            assert.strictEqual((0, languageSelector_1.score)('*', uri_1.URI.parse('foo:bar'), model.language, true, undefined, undefined), 5);
            assert.strictEqual((0, languageSelector_1.score)('farboo', uri_1.URI.parse('foo:bar'), model.language, true, undefined, undefined), 10);
        });
        test('score, default schemes', function () {
            const uri = uri_1.URI.parse('git:foo/file.txt');
            const language = 'farboo';
            assert.strictEqual((0, languageSelector_1.score)('*', uri, language, true, undefined, undefined), 5);
            assert.strictEqual((0, languageSelector_1.score)('farboo', uri, language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.score)({ language: 'farboo', scheme: '' }, uri, language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.score)({ language: 'farboo', scheme: 'git' }, uri, language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.score)({ language: 'farboo', scheme: '*' }, uri, language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.score)({ language: 'farboo' }, uri, language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.score)({ language: '*' }, uri, language, true, undefined, undefined), 5);
            assert.strictEqual((0, languageSelector_1.score)({ scheme: '*' }, uri, language, true, undefined, undefined), 5);
            assert.strictEqual((0, languageSelector_1.score)({ scheme: 'git' }, uri, language, true, undefined, undefined), 10);
        });
        test('score, filter', function () {
            assert.strictEqual((0, languageSelector_1.score)('farboo', model.uri, model.language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.score)({ language: 'farboo' }, model.uri, model.language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.score)({ language: 'farboo', scheme: 'file' }, model.uri, model.language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.score)({ language: 'farboo', scheme: 'http' }, model.uri, model.language, true, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.score)({ pattern: '**/*.fb' }, model.uri, model.language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.score)({ pattern: '**/*.fb', scheme: 'file' }, model.uri, model.language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.score)({ pattern: '**/*.fb' }, uri_1.URI.parse('foo:bar'), model.language, true, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.score)({ pattern: '**/*.fb', scheme: 'foo' }, uri_1.URI.parse('foo:bar'), model.language, true, undefined, undefined), 0);
            const doc = {
                uri: uri_1.URI.parse('git:/my/file.js'),
                langId: 'javascript'
            };
            assert.strictEqual((0, languageSelector_1.score)('javascript', doc.uri, doc.langId, true, undefined, undefined), 10); // 0;
            assert.strictEqual((0, languageSelector_1.score)({ language: 'javascript', scheme: 'git' }, doc.uri, doc.langId, true, undefined, undefined), 10); // 10;
            assert.strictEqual((0, languageSelector_1.score)('*', doc.uri, doc.langId, true, undefined, undefined), 5); // 5
            assert.strictEqual((0, languageSelector_1.score)('fooLang', doc.uri, doc.langId, true, undefined, undefined), 0); // 0
            assert.strictEqual((0, languageSelector_1.score)(['fooLang', '*'], doc.uri, doc.langId, true, undefined, undefined), 5); // 5
        });
        test('score, max(filters)', function () {
            const match = { language: 'farboo', scheme: 'file' };
            const fail = { language: 'farboo', scheme: 'http' };
            assert.strictEqual((0, languageSelector_1.score)(match, model.uri, model.language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.score)(fail, model.uri, model.language, true, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.score)([match, fail], model.uri, model.language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.score)([fail, fail], model.uri, model.language, true, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.score)(['farboo', '*'], model.uri, model.language, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.score)(['*', 'farboo'], model.uri, model.language, true, undefined, undefined), 10);
        });
        test('score hasAccessToAllModels', function () {
            const doc = {
                uri: uri_1.URI.parse('file:/my/file.js'),
                langId: 'javascript'
            };
            assert.strictEqual((0, languageSelector_1.score)('javascript', doc.uri, doc.langId, false, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.score)({ language: 'javascript', scheme: 'file' }, doc.uri, doc.langId, false, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.score)('*', doc.uri, doc.langId, false, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.score)('fooLang', doc.uri, doc.langId, false, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.score)(['fooLang', '*'], doc.uri, doc.langId, false, undefined, undefined), 0);
            assert.strictEqual((0, languageSelector_1.score)({ language: 'javascript', scheme: 'file', hasAccessToAllModels: true }, doc.uri, doc.langId, false, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.score)(['fooLang', '*', { language: '*', hasAccessToAllModels: true }], doc.uri, doc.langId, false, undefined, undefined), 5);
        });
        test('score, notebookType', function () {
            const obj = {
                uri: uri_1.URI.parse('vscode-notebook-cell:///my/file.js#blabla'),
                langId: 'javascript',
                notebookType: 'fooBook',
                notebookUri: uri_1.URI.parse('file:///my/file.js')
            };
            assert.strictEqual((0, languageSelector_1.score)('javascript', obj.uri, obj.langId, true, undefined, undefined), 10);
            assert.strictEqual((0, languageSelector_1.score)('javascript', obj.uri, obj.langId, true, obj.notebookUri, obj.notebookType), 10);
            assert.strictEqual((0, languageSelector_1.score)({ notebookType: 'fooBook' }, obj.uri, obj.langId, true, obj.notebookUri, obj.notebookType), 10);
            assert.strictEqual((0, languageSelector_1.score)({ notebookType: 'fooBook', language: 'javascript', scheme: 'file' }, obj.uri, obj.langId, true, obj.notebookUri, obj.notebookType), 10);
            assert.strictEqual((0, languageSelector_1.score)({ notebookType: 'fooBook', language: '*' }, obj.uri, obj.langId, true, obj.notebookUri, obj.notebookType), 10);
            assert.strictEqual((0, languageSelector_1.score)({ notebookType: '*', language: '*' }, obj.uri, obj.langId, true, obj.notebookUri, obj.notebookType), 5);
            assert.strictEqual((0, languageSelector_1.score)({ notebookType: '*', language: 'javascript' }, obj.uri, obj.langId, true, obj.notebookUri, obj.notebookType), 10);
        });
        test('Snippet choices lost #149363', function () {
            const selector = {
                scheme: 'vscode-notebook-cell',
                pattern: '/some/path/file.py',
                language: 'python'
            };
            const modelUri = uri_1.URI.parse('vscode-notebook-cell:///some/path/file.py');
            const nbUri = uri_1.URI.parse('file:///some/path/file.py');
            assert.strictEqual((0, languageSelector_1.score)(selector, modelUri, 'python', true, nbUri, 'jupyter'), 10);
            const selector2 = {
                ...selector,
                notebookType: 'jupyter'
            };
            assert.strictEqual((0, languageSelector_1.score)(selector2, modelUri, 'python', true, nbUri, 'jupyter'), 0);
        });
        test('Document selector match - unexpected result value #60232', function () {
            const selector = {
                language: 'json',
                scheme: 'file',
                pattern: '**/*.interface.json'
            };
            const value = (0, languageSelector_1.score)(selector, uri_1.URI.parse('file:///C:/Users/zlhe/Desktop/test.interface.json'), 'json', true, undefined, undefined);
            assert.strictEqual(value, 10);
        });
        test('Document selector match - platform paths #99938', function () {
            const selector = {
                pattern: {
                    base: '/home/user/Desktop',
                    pattern: '*.json'
                }
            };
            const value = (0, languageSelector_1.score)(selector, uri_1.URI.file('/home/user/Desktop/test.json'), 'json', true, undefined, undefined);
            assert.strictEqual(value, 10);
        });
        test('NotebookType without notebook', function () {
            const obj = {
                uri: uri_1.URI.parse('file:///my/file.bat'),
                langId: 'bat',
            };
            let value = (0, languageSelector_1.score)({
                language: 'bat',
                notebookType: 'xxx'
            }, obj.uri, obj.langId, true, undefined, undefined);
            assert.strictEqual(value, 0);
            value = (0, languageSelector_1.score)({
                language: 'bat',
                notebookType: '*'
            }, obj.uri, obj.langId, true, undefined, undefined);
            assert.strictEqual(value, 0);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VTZWxlY3Rvci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvY29tbW9uL21vZGVzL2xhbmd1YWdlU2VsZWN0b3IudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQU9oRyxLQUFLLENBQUMsa0JBQWtCLEVBQUU7UUFFekIsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLE1BQU0sS0FBSyxHQUFHO1lBQ2IsUUFBUSxFQUFFLFFBQVE7WUFDbEIsR0FBRyxFQUFFLFNBQUcsQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUM7U0FDekMsQ0FBQztRQUVGLElBQUksQ0FBQyx5QkFBeUIsRUFBRTtZQUMvQixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsd0JBQUssRUFBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEYsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHdCQUFLLEVBQUMsU0FBVSxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hHLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSx3QkFBSyxFQUFDLElBQUssRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzRixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsd0JBQUssRUFBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDekYsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMscUJBQXFCLEVBQUU7WUFDM0IsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHdCQUFLLEVBQUMsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHdCQUFLLEVBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXpGLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSx3QkFBSyxFQUFDLEdBQUcsRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwRyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsd0JBQUssRUFBQyxRQUFRLEVBQUUsU0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0csQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsd0JBQXdCLEVBQUU7WUFFOUIsTUFBTSxHQUFHLEdBQUcsU0FBRyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQztZQUUxQixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsd0JBQUssRUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdFLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSx3QkFBSyxFQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbkYsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHdCQUFLLEVBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDN0csTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHdCQUFLLEVBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDaEgsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHdCQUFLLEVBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDOUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHdCQUFLLEVBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2pHLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSx3QkFBSyxFQUFDLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUUzRixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsd0JBQUssRUFBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekYsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHdCQUFLLEVBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUNyQixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsd0JBQUssRUFBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDL0YsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHdCQUFLLEVBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDN0csTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHdCQUFLLEVBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM3SCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsd0JBQUssRUFBQyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRTVILE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSx3QkFBSyxFQUFDLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzdHLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSx3QkFBSyxFQUFDLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDN0gsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHdCQUFLLEVBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsU0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkgsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHdCQUFLLEVBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxTQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV0SSxNQUFNLEdBQUcsR0FBRztnQkFDWCxHQUFHLEVBQUUsU0FBRyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQztnQkFDakMsTUFBTSxFQUFFLFlBQVk7YUFDcEIsQ0FBQztZQUNGLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSx3QkFBSyxFQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUs7WUFDbkcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHdCQUFLLEVBQUMsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU07WUFDakksTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHdCQUFLLEVBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUN4RixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsd0JBQUssRUFBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQzlGLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSx3QkFBSyxFQUFDLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtRQUN0RyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxxQkFBcUIsRUFBRTtZQUMzQixNQUFNLEtBQUssR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ3JELE1BQU0sSUFBSSxHQUFHLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFFcEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHdCQUFLLEVBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzVGLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBQSx3QkFBSyxFQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxRixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsd0JBQUssRUFBQyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNwRyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsd0JBQUssRUFBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsd0JBQUssRUFBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUss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V0FBVyxDQUFDLElBQUEsd0JBQUssRUFBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDN0YsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHdCQUFLLEVBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDMUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFBLHdCQUFLLEVBQUMsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6SCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsd0JBQUssRUFBQyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNqSyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUEsd0JBQUssRUFBQyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDeEks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