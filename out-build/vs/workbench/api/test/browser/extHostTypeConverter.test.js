/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostTypeConverters", "vs/base/common/types", "vs/base/common/uri"], function (require, exports, assert, extHostTypes, extHostTypeConverters_1, types_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostTypeConverter', function () {
        function size(from) {
            let count = 0;
            for (const key in from) {
                if (Object.prototype.hasOwnProperty.call(from, key)) {
                    count += 1;
                }
            }
            return count;
        }
        test('MarkdownConvert - uris', function () {
            let data = extHostTypeConverters_1.MarkdownString.from('Hello');
            assert.strictEqual((0, types_1.$wf)(data.uris), true);
            assert.strictEqual(data.value, 'Hello');
            data = extHostTypeConverters_1.MarkdownString.from('Hello [link](foo)');
            assert.strictEqual(data.value, 'Hello [link](foo)');
            assert.strictEqual((0, types_1.$wf)(data.uris), true); // no scheme, no uri
            data = extHostTypeConverters_1.MarkdownString.from('Hello [link](www.noscheme.bad)');
            assert.strictEqual(data.value, 'Hello [link](www.noscheme.bad)');
            assert.strictEqual((0, types_1.$wf)(data.uris), true); // no scheme, no uri
            data = extHostTypeConverters_1.MarkdownString.from('Hello [link](foo:path)');
            assert.strictEqual(data.value, 'Hello [link](foo:path)');
            assert.strictEqual(size(data.uris), 1);
            assert.ok(!!data.uris['foo:path']);
            data = extHostTypeConverters_1.MarkdownString.from('hello@foo.bar');
            assert.strictEqual(data.value, 'hello@foo.bar');
            assert.strictEqual(size(data.uris), 1);
            // assert.ok(!!data.uris!['mailto:hello@foo.bar']);
            data = extHostTypeConverters_1.MarkdownString.from('*hello* [click](command:me)');
            assert.strictEqual(data.value, '*hello* [click](command:me)');
            assert.strictEqual(size(data.uris), 1);
            assert.ok(!!data.uris['command:me']);
            data = extHostTypeConverters_1.MarkdownString.from('*hello* [click](file:///somepath/here). [click](file:///somepath/here)');
            assert.strictEqual(data.value, '*hello* [click](file:///somepath/here). [click](file:///somepath/here)');
            assert.strictEqual(size(data.uris), 1);
            assert.ok(!!data.uris['file:///somepath/here']);
            data = extHostTypeConverters_1.MarkdownString.from('*hello* [click](file:///somepath/here). [click](file:///somepath/here)');
            assert.strictEqual(data.value, '*hello* [click](file:///somepath/here). [click](file:///somepath/here)');
            assert.strictEqual(size(data.uris), 1);
            assert.ok(!!data.uris['file:///somepath/here']);
            data = extHostTypeConverters_1.MarkdownString.from('*hello* [click](file:///somepath/here). [click](file:///somepath/here2)');
            assert.strictEqual(data.value, '*hello* [click](file:///somepath/here). [click](file:///somepath/here2)');
            assert.strictEqual(size(data.uris), 2);
            assert.ok(!!data.uris['file:///somepath/here']);
            assert.ok(!!data.uris['file:///somepath/here2']);
        });
        test('NPM script explorer running a script from the hover does not work #65561', function () {
            const data = extHostTypeConverters_1.MarkdownString.from('*hello* [click](command:npm.runScriptFromHover?%7B%22documentUri%22%3A%7B%22%24mid%22%3A1%2C%22external%22%3A%22file%3A%2F%2F%2Fc%253A%2Ffoo%2Fbaz.ex%22%2C%22path%22%3A%22%2Fc%3A%2Ffoo%2Fbaz.ex%22%2C%22scheme%22%3A%22file%22%7D%2C%22script%22%3A%22dev%22%7D)');
            // assert that both uri get extracted but that the latter is only decoded once...
            assert.strictEqual(size(data.uris), 2);
            for (const value of Object.values(data.uris)) {
                if (value.scheme === 'file') {
                    assert.ok(uri_1.URI.revive(value).toString().indexOf('file:///c%3A') === 0);
                }
                else {
                    assert.strictEqual(value.scheme, 'command');
                }
            }
        });
        test('Notebook metadata is ignored when using Notebook Serializer #125716', function () {
            const d = new extHostTypes.$pL([]);
            d.cells.push(new extHostTypes.$oL(extHostTypes.NotebookCellKind.Code, 'hello', 'fooLang'));
            d.metadata = { custom: { foo: 'bar', bar: 123 } };
            const dto = extHostTypeConverters_1.NotebookData.from(d);
            assert.strictEqual(dto.cells.length, 1);
            assert.strictEqual(dto.cells[0].language, 'fooLang');
            assert.strictEqual(dto.cells[0].source, 'hello');
            assert.deepStrictEqual(dto.metadata, d.metadata);
        });
        test('NotebookCellOutputItem', function () {
            const item = extHostTypes.$qL.text('Hello', 'foo/bar');
            const dto = extHostTypeConverters_1.NotebookCellOutputItem.from(item);
            assert.strictEqual(dto.mime, 'foo/bar');
            assert.deepStrictEqual(Array.from(dto.valueBytes.buffer), Array.from(new TextEncoder().encode('Hello')));
            const item2 = extHostTypeConverters_1.NotebookCellOutputItem.to(dto);
            assert.strictEqual(item2.mime, item.mime);
            assert.deepStrictEqual(Array.from(item2.data), Array.from(item.data));
        });
        test('LanguageSelector', function () {
            const out = extHostTypeConverters_1.LanguageSelector.from({ language: 'bat', notebookType: 'xxx' });
            assert.ok(typeof out === 'object');
            assert.deepStrictEqual(out, {
                language: 'bat',
                notebookType: 'xxx',
                scheme: undefined,
                pattern: undefined,
                exclusive: undefined,
            });
        });
        test('JS/TS Surround With Code Actions provide bad Workspace Edits when obtained by VSCode Command API #178654', function () {
            const uri = uri_1.URI.parse('file:///foo/bar');
            const ws = new extHostTypes.$aK();
            ws.set(uri, [extHostTypes.$_J.insert(new extHostTypes.$4J(1, 1), new extHostTypes.$bK('foo$0bar'))]);
            const dto = extHostTypeConverters_1.WorkspaceEdit.from(ws);
            const first = dto.edits[0];
            assert.strictEqual(first.textEdit.insertAsSnippet, true);
            const ws2 = extHostTypeConverters_1.WorkspaceEdit.to(dto);
            const dto2 = extHostTypeConverters_1.WorkspaceEdit.from(ws2);
            const first2 = dto2.edits[0];
            assert.strictEqual(first2.textEdit.insertAsSnippet, true);
        });
    });
});
//# sourceMappingURL=extHostTypeConverter.test.js.map