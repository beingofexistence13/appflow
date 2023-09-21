/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/uri", "vs/base/test/common/utils", "vs/editor/common/languages/language", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookRange", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor"], function (require, exports, assert, lifecycle_1, mime_1, uri_1, utils_1, language_1, notebookCommon_1, notebookRange_1, testNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookCommon', () => {
        (0, utils_1.$bT)();
        let disposables;
        let instantiationService;
        let languageService;
        setup(() => {
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, testNotebookEditor_1.$Ifc)(disposables);
            languageService = instantiationService.get(language_1.$ct);
        });
        test('sortMimeTypes default orders', function () {
            assert.deepStrictEqual(new notebookCommon_1.$1H().sort([
                'application/json',
                'application/javascript',
                'text/html',
                'image/svg+xml',
                mime_1.$Hr.latex,
                mime_1.$Hr.markdown,
                'image/png',
                'image/jpeg',
                mime_1.$Hr.text
            ]), [
                'application/json',
                'application/javascript',
                'text/html',
                'image/svg+xml',
                mime_1.$Hr.latex,
                mime_1.$Hr.markdown,
                'image/png',
                'image/jpeg',
                mime_1.$Hr.text
            ]);
            assert.deepStrictEqual(new notebookCommon_1.$1H().sort([
                'application/json',
                mime_1.$Hr.latex,
                mime_1.$Hr.markdown,
                'application/javascript',
                'text/html',
                mime_1.$Hr.text,
                'image/png',
                'image/jpeg',
                'image/svg+xml'
            ]), [
                'application/json',
                'application/javascript',
                'text/html',
                'image/svg+xml',
                mime_1.$Hr.latex,
                mime_1.$Hr.markdown,
                'image/png',
                'image/jpeg',
                mime_1.$Hr.text
            ]);
            assert.deepStrictEqual(new notebookCommon_1.$1H().sort([
                mime_1.$Hr.markdown,
                'application/json',
                mime_1.$Hr.text,
                'image/jpeg',
                'application/javascript',
                'text/html',
                'image/png',
                'image/svg+xml'
            ]), [
                'application/json',
                'application/javascript',
                'text/html',
                'image/svg+xml',
                mime_1.$Hr.markdown,
                'image/png',
                'image/jpeg',
                mime_1.$Hr.text
            ]);
            disposables.dispose();
        });
        test('sortMimeTypes user orders', function () {
            assert.deepStrictEqual(new notebookCommon_1.$1H([
                'image/png',
                mime_1.$Hr.text,
                mime_1.$Hr.markdown,
                'text/html',
                'application/json'
            ]).sort([
                'application/json',
                'application/javascript',
                'text/html',
                'image/svg+xml',
                mime_1.$Hr.markdown,
                'image/png',
                'image/jpeg',
                mime_1.$Hr.text
            ]), [
                'image/png',
                mime_1.$Hr.text,
                mime_1.$Hr.markdown,
                'text/html',
                'application/json',
                'application/javascript',
                'image/svg+xml',
                'image/jpeg',
            ]);
            assert.deepStrictEqual(new notebookCommon_1.$1H([
                'application/json',
                'text/html',
                'text/html',
                mime_1.$Hr.markdown,
                'application/json'
            ]).sort([
                mime_1.$Hr.markdown,
                'application/json',
                mime_1.$Hr.text,
                'application/javascript',
                'text/html',
                'image/svg+xml',
                'image/jpeg',
                'image/png'
            ]), [
                'application/json',
                'text/html',
                mime_1.$Hr.markdown,
                'application/javascript',
                'image/svg+xml',
                'image/png',
                'image/jpeg',
                mime_1.$Hr.text
            ]);
            disposables.dispose();
        });
        test('prioritizes mimetypes', () => {
            const m = new notebookCommon_1.$1H([
                mime_1.$Hr.markdown,
                'text/html',
                'application/json'
            ]);
            assert.deepStrictEqual(m.toArray(), [mime_1.$Hr.markdown, 'text/html', 'application/json']);
            // no-op if already in the right order
            m.prioritize('text/html', ['application/json']);
            assert.deepStrictEqual(m.toArray(), [mime_1.$Hr.markdown, 'text/html', 'application/json']);
            // sorts to highest priority
            m.prioritize('text/html', ['application/json', mime_1.$Hr.markdown]);
            assert.deepStrictEqual(m.toArray(), ['text/html', mime_1.$Hr.markdown, 'application/json']);
            // adds in new type
            m.prioritize('text/plain', ['application/json', mime_1.$Hr.markdown]);
            assert.deepStrictEqual(m.toArray(), ['text/plain', 'text/html', mime_1.$Hr.markdown, 'application/json']);
            // moves multiple, preserves order
            m.prioritize(mime_1.$Hr.markdown, ['text/plain', 'application/json', mime_1.$Hr.markdown]);
            assert.deepStrictEqual(m.toArray(), ['text/html', mime_1.$Hr.markdown, 'text/plain', 'application/json']);
            // deletes multiple
            m.prioritize('text/plain', ['text/plain', 'text/html', mime_1.$Hr.markdown]);
            assert.deepStrictEqual(m.toArray(), ['text/plain', 'text/html', mime_1.$Hr.markdown, 'application/json']);
            // handles multiple mimetypes, unknown mimetype
            const m2 = new notebookCommon_1.$1H(['a', 'b']);
            m2.prioritize('b', ['a', 'b', 'a', 'q']);
            assert.deepStrictEqual(m2.toArray(), ['b', 'a']);
            disposables.dispose();
        });
        test('sortMimeTypes glob', function () {
            assert.deepStrictEqual(new notebookCommon_1.$1H([
                'application/vnd-vega*',
                mime_1.$Hr.markdown,
                'text/html',
                'application/json'
            ]).sort([
                'application/json',
                'application/javascript',
                'text/html',
                'application/vnd-plot.json',
                'application/vnd-vega.json'
            ]), [
                'application/vnd-vega.json',
                'text/html',
                'application/json',
                'application/vnd-plot.json',
                'application/javascript',
            ], 'glob *');
            disposables.dispose();
        });
        test('diff cells', function () {
            const cells = [];
            for (let i = 0; i < 5; i++) {
                cells.push(disposables.add(new testNotebookEditor_1.$Gfc('notebook', i, `var a = ${i};`, 'javascript', notebookCommon_1.CellKind.Code, [], languageService)));
            }
            assert.deepStrictEqual((0, notebookCommon_1.$2H)(cells, [], (cell) => {
                return cells.indexOf(cell) > -1;
            }), [
                {
                    start: 0,
                    deleteCount: 5,
                    toInsert: []
                }
            ]);
            assert.deepStrictEqual((0, notebookCommon_1.$2H)([], cells, (cell) => {
                return false;
            }), [
                {
                    start: 0,
                    deleteCount: 0,
                    toInsert: cells
                }
            ]);
            const cellA = disposables.add(new testNotebookEditor_1.$Gfc('notebook', 6, 'var a = 6;', 'javascript', notebookCommon_1.CellKind.Code, [], languageService));
            const cellB = disposables.add(new testNotebookEditor_1.$Gfc('notebook', 7, 'var a = 7;', 'javascript', notebookCommon_1.CellKind.Code, [], languageService));
            const modifiedCells = [
                cells[0],
                cells[1],
                cellA,
                cells[3],
                cellB,
                cells[4]
            ];
            const splices = (0, notebookCommon_1.$2H)(cells, modifiedCells, (cell) => {
                return cells.indexOf(cell) > -1;
            });
            assert.deepStrictEqual(splices, [
                {
                    start: 2,
                    deleteCount: 1,
                    toInsert: [cellA]
                },
                {
                    start: 4,
                    deleteCount: 0,
                    toInsert: [cellB]
                }
            ]);
            disposables.dispose();
        });
    });
    suite('CellUri', function () {
        test('parse, generate (file-scheme)', function () {
            const nb = uri_1.URI.parse('file:///bar/følder/file.nb');
            const id = 17;
            const data = notebookCommon_1.CellUri.generate(nb, id);
            const actual = notebookCommon_1.CellUri.parse(data);
            assert.ok(Boolean(actual));
            assert.strictEqual(actual?.handle, id);
            assert.strictEqual(actual?.notebook.toString(), nb.toString());
        });
        test('parse, generate (foo-scheme)', function () {
            const nb = uri_1.URI.parse('foo:///bar/følder/file.nb');
            const id = 17;
            const data = notebookCommon_1.CellUri.generate(nb, id);
            const actual = notebookCommon_1.CellUri.parse(data);
            assert.ok(Boolean(actual));
            assert.strictEqual(actual?.handle, id);
            assert.strictEqual(actual?.notebook.toString(), nb.toString());
        });
        test('stable order', function () {
            const nb = uri_1.URI.parse('foo:///bar/følder/file.nb');
            const handles = [1, 2, 9, 10, 88, 100, 666666, 7777777];
            const uris = handles.map(h => notebookCommon_1.CellUri.generate(nb, h)).sort();
            const strUris = uris.map(String).sort();
            const parsedUris = strUris.map(s => uri_1.URI.parse(s));
            const actual = parsedUris.map(u => notebookCommon_1.CellUri.parse(u)?.handle);
            assert.deepStrictEqual(actual, handles);
        });
    });
    suite('CellRange', function () {
        test('Cell range to index', function () {
            assert.deepStrictEqual((0, notebookRange_1.$PH)([]), []);
            assert.deepStrictEqual((0, notebookRange_1.$PH)([{ start: 0, end: 0 }]), []);
            assert.deepStrictEqual((0, notebookRange_1.$PH)([{ start: 0, end: 1 }]), [0]);
            assert.deepStrictEqual((0, notebookRange_1.$PH)([{ start: 0, end: 2 }]), [0, 1]);
            assert.deepStrictEqual((0, notebookRange_1.$PH)([{ start: 0, end: 2 }, { start: 2, end: 3 }]), [0, 1, 2]);
            assert.deepStrictEqual((0, notebookRange_1.$PH)([{ start: 0, end: 2 }, { start: 3, end: 4 }]), [0, 1, 3]);
        });
        test('Cell index to range', function () {
            assert.deepStrictEqual((0, notebookRange_1.$OH)([]), []);
            assert.deepStrictEqual((0, notebookRange_1.$OH)([0]), [{ start: 0, end: 1 }]);
            assert.deepStrictEqual((0, notebookRange_1.$OH)([0, 1]), [{ start: 0, end: 2 }]);
            assert.deepStrictEqual((0, notebookRange_1.$OH)([0, 1, 2]), [{ start: 0, end: 3 }]);
            assert.deepStrictEqual((0, notebookRange_1.$OH)([0, 1, 3]), [{ start: 0, end: 2 }, { start: 3, end: 4 }]);
            assert.deepStrictEqual((0, notebookRange_1.$OH)([1, 0]), [{ start: 0, end: 2 }]);
            assert.deepStrictEqual((0, notebookRange_1.$OH)([1, 2, 0]), [{ start: 0, end: 3 }]);
            assert.deepStrictEqual((0, notebookRange_1.$OH)([3, 1, 0]), [{ start: 0, end: 2 }, { start: 3, end: 4 }]);
            assert.deepStrictEqual((0, notebookRange_1.$OH)([9, 10]), [{ start: 9, end: 11 }]);
            assert.deepStrictEqual((0, notebookRange_1.$OH)([10, 9]), [{ start: 9, end: 11 }]);
        });
        test('Reduce ranges', function () {
            assert.deepStrictEqual((0, notebookRange_1.$QH)([{ start: 0, end: 1 }, { start: 1, end: 2 }]), [{ start: 0, end: 2 }]);
            assert.deepStrictEqual((0, notebookRange_1.$QH)([{ start: 0, end: 2 }, { start: 1, end: 3 }]), [{ start: 0, end: 3 }]);
            assert.deepStrictEqual((0, notebookRange_1.$QH)([{ start: 1, end: 3 }, { start: 0, end: 2 }]), [{ start: 0, end: 3 }]);
            assert.deepStrictEqual((0, notebookRange_1.$QH)([{ start: 0, end: 2 }, { start: 4, end: 5 }]), [{ start: 0, end: 2 }, { start: 4, end: 5 }]);
            assert.deepStrictEqual((0, notebookRange_1.$QH)([
                { start: 0, end: 1 },
                { start: 1, end: 2 },
                { start: 4, end: 6 }
            ]), [
                { start: 0, end: 2 },
                { start: 4, end: 6 }
            ]);
            assert.deepStrictEqual((0, notebookRange_1.$QH)([
                { start: 0, end: 1 },
                { start: 1, end: 3 },
                { start: 3, end: 4 }
            ]), [
                { start: 0, end: 4 }
            ]);
        });
    });
    suite('NotebookWorkingCopyTypeIdentifier', function () {
        test('works', function () {
            const viewType = 'testViewType';
            const type = notebookCommon_1.$8H.create('testViewType');
            assert.strictEqual(notebookCommon_1.$8H.parse(type), viewType);
            assert.strictEqual(notebookCommon_1.$8H.parse('something'), undefined);
        });
    });
});
//# sourceMappingURL=notebookCommon.test.js.map