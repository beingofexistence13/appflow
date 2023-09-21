/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/uri", "vs/base/test/common/utils", "vs/editor/common/languages/language", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookRange", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor"], function (require, exports, assert, lifecycle_1, mime_1, uri_1, utils_1, language_1, notebookCommon_1, notebookRange_1, testNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookCommon', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let disposables;
        let instantiationService;
        let languageService;
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
            instantiationService = (0, testNotebookEditor_1.setupInstantiationService)(disposables);
            languageService = instantiationService.get(language_1.ILanguageService);
        });
        test('sortMimeTypes default orders', function () {
            assert.deepStrictEqual(new notebookCommon_1.MimeTypeDisplayOrder().sort([
                'application/json',
                'application/javascript',
                'text/html',
                'image/svg+xml',
                mime_1.Mimes.latex,
                mime_1.Mimes.markdown,
                'image/png',
                'image/jpeg',
                mime_1.Mimes.text
            ]), [
                'application/json',
                'application/javascript',
                'text/html',
                'image/svg+xml',
                mime_1.Mimes.latex,
                mime_1.Mimes.markdown,
                'image/png',
                'image/jpeg',
                mime_1.Mimes.text
            ]);
            assert.deepStrictEqual(new notebookCommon_1.MimeTypeDisplayOrder().sort([
                'application/json',
                mime_1.Mimes.latex,
                mime_1.Mimes.markdown,
                'application/javascript',
                'text/html',
                mime_1.Mimes.text,
                'image/png',
                'image/jpeg',
                'image/svg+xml'
            ]), [
                'application/json',
                'application/javascript',
                'text/html',
                'image/svg+xml',
                mime_1.Mimes.latex,
                mime_1.Mimes.markdown,
                'image/png',
                'image/jpeg',
                mime_1.Mimes.text
            ]);
            assert.deepStrictEqual(new notebookCommon_1.MimeTypeDisplayOrder().sort([
                mime_1.Mimes.markdown,
                'application/json',
                mime_1.Mimes.text,
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
                mime_1.Mimes.markdown,
                'image/png',
                'image/jpeg',
                mime_1.Mimes.text
            ]);
            disposables.dispose();
        });
        test('sortMimeTypes user orders', function () {
            assert.deepStrictEqual(new notebookCommon_1.MimeTypeDisplayOrder([
                'image/png',
                mime_1.Mimes.text,
                mime_1.Mimes.markdown,
                'text/html',
                'application/json'
            ]).sort([
                'application/json',
                'application/javascript',
                'text/html',
                'image/svg+xml',
                mime_1.Mimes.markdown,
                'image/png',
                'image/jpeg',
                mime_1.Mimes.text
            ]), [
                'image/png',
                mime_1.Mimes.text,
                mime_1.Mimes.markdown,
                'text/html',
                'application/json',
                'application/javascript',
                'image/svg+xml',
                'image/jpeg',
            ]);
            assert.deepStrictEqual(new notebookCommon_1.MimeTypeDisplayOrder([
                'application/json',
                'text/html',
                'text/html',
                mime_1.Mimes.markdown,
                'application/json'
            ]).sort([
                mime_1.Mimes.markdown,
                'application/json',
                mime_1.Mimes.text,
                'application/javascript',
                'text/html',
                'image/svg+xml',
                'image/jpeg',
                'image/png'
            ]), [
                'application/json',
                'text/html',
                mime_1.Mimes.markdown,
                'application/javascript',
                'image/svg+xml',
                'image/png',
                'image/jpeg',
                mime_1.Mimes.text
            ]);
            disposables.dispose();
        });
        test('prioritizes mimetypes', () => {
            const m = new notebookCommon_1.MimeTypeDisplayOrder([
                mime_1.Mimes.markdown,
                'text/html',
                'application/json'
            ]);
            assert.deepStrictEqual(m.toArray(), [mime_1.Mimes.markdown, 'text/html', 'application/json']);
            // no-op if already in the right order
            m.prioritize('text/html', ['application/json']);
            assert.deepStrictEqual(m.toArray(), [mime_1.Mimes.markdown, 'text/html', 'application/json']);
            // sorts to highest priority
            m.prioritize('text/html', ['application/json', mime_1.Mimes.markdown]);
            assert.deepStrictEqual(m.toArray(), ['text/html', mime_1.Mimes.markdown, 'application/json']);
            // adds in new type
            m.prioritize('text/plain', ['application/json', mime_1.Mimes.markdown]);
            assert.deepStrictEqual(m.toArray(), ['text/plain', 'text/html', mime_1.Mimes.markdown, 'application/json']);
            // moves multiple, preserves order
            m.prioritize(mime_1.Mimes.markdown, ['text/plain', 'application/json', mime_1.Mimes.markdown]);
            assert.deepStrictEqual(m.toArray(), ['text/html', mime_1.Mimes.markdown, 'text/plain', 'application/json']);
            // deletes multiple
            m.prioritize('text/plain', ['text/plain', 'text/html', mime_1.Mimes.markdown]);
            assert.deepStrictEqual(m.toArray(), ['text/plain', 'text/html', mime_1.Mimes.markdown, 'application/json']);
            // handles multiple mimetypes, unknown mimetype
            const m2 = new notebookCommon_1.MimeTypeDisplayOrder(['a', 'b']);
            m2.prioritize('b', ['a', 'b', 'a', 'q']);
            assert.deepStrictEqual(m2.toArray(), ['b', 'a']);
            disposables.dispose();
        });
        test('sortMimeTypes glob', function () {
            assert.deepStrictEqual(new notebookCommon_1.MimeTypeDisplayOrder([
                'application/vnd-vega*',
                mime_1.Mimes.markdown,
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
                cells.push(disposables.add(new testNotebookEditor_1.TestCell('notebook', i, `var a = ${i};`, 'javascript', notebookCommon_1.CellKind.Code, [], languageService)));
            }
            assert.deepStrictEqual((0, notebookCommon_1.diff)(cells, [], (cell) => {
                return cells.indexOf(cell) > -1;
            }), [
                {
                    start: 0,
                    deleteCount: 5,
                    toInsert: []
                }
            ]);
            assert.deepStrictEqual((0, notebookCommon_1.diff)([], cells, (cell) => {
                return false;
            }), [
                {
                    start: 0,
                    deleteCount: 0,
                    toInsert: cells
                }
            ]);
            const cellA = disposables.add(new testNotebookEditor_1.TestCell('notebook', 6, 'var a = 6;', 'javascript', notebookCommon_1.CellKind.Code, [], languageService));
            const cellB = disposables.add(new testNotebookEditor_1.TestCell('notebook', 7, 'var a = 7;', 'javascript', notebookCommon_1.CellKind.Code, [], languageService));
            const modifiedCells = [
                cells[0],
                cells[1],
                cellA,
                cells[3],
                cellB,
                cells[4]
            ];
            const splices = (0, notebookCommon_1.diff)(cells, modifiedCells, (cell) => {
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
            assert.deepStrictEqual((0, notebookRange_1.cellRangesToIndexes)([]), []);
            assert.deepStrictEqual((0, notebookRange_1.cellRangesToIndexes)([{ start: 0, end: 0 }]), []);
            assert.deepStrictEqual((0, notebookRange_1.cellRangesToIndexes)([{ start: 0, end: 1 }]), [0]);
            assert.deepStrictEqual((0, notebookRange_1.cellRangesToIndexes)([{ start: 0, end: 2 }]), [0, 1]);
            assert.deepStrictEqual((0, notebookRange_1.cellRangesToIndexes)([{ start: 0, end: 2 }, { start: 2, end: 3 }]), [0, 1, 2]);
            assert.deepStrictEqual((0, notebookRange_1.cellRangesToIndexes)([{ start: 0, end: 2 }, { start: 3, end: 4 }]), [0, 1, 3]);
        });
        test('Cell index to range', function () {
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([]), []);
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([0]), [{ start: 0, end: 1 }]);
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([0, 1]), [{ start: 0, end: 2 }]);
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([0, 1, 2]), [{ start: 0, end: 3 }]);
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([0, 1, 3]), [{ start: 0, end: 2 }, { start: 3, end: 4 }]);
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([1, 0]), [{ start: 0, end: 2 }]);
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([1, 2, 0]), [{ start: 0, end: 3 }]);
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([3, 1, 0]), [{ start: 0, end: 2 }, { start: 3, end: 4 }]);
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([9, 10]), [{ start: 9, end: 11 }]);
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([10, 9]), [{ start: 9, end: 11 }]);
        });
        test('Reduce ranges', function () {
            assert.deepStrictEqual((0, notebookRange_1.reduceCellRanges)([{ start: 0, end: 1 }, { start: 1, end: 2 }]), [{ start: 0, end: 2 }]);
            assert.deepStrictEqual((0, notebookRange_1.reduceCellRanges)([{ start: 0, end: 2 }, { start: 1, end: 3 }]), [{ start: 0, end: 3 }]);
            assert.deepStrictEqual((0, notebookRange_1.reduceCellRanges)([{ start: 1, end: 3 }, { start: 0, end: 2 }]), [{ start: 0, end: 3 }]);
            assert.deepStrictEqual((0, notebookRange_1.reduceCellRanges)([{ start: 0, end: 2 }, { start: 4, end: 5 }]), [{ start: 0, end: 2 }, { start: 4, end: 5 }]);
            assert.deepStrictEqual((0, notebookRange_1.reduceCellRanges)([
                { start: 0, end: 1 },
                { start: 1, end: 2 },
                { start: 4, end: 6 }
            ]), [
                { start: 0, end: 2 },
                { start: 4, end: 6 }
            ]);
            assert.deepStrictEqual((0, notebookRange_1.reduceCellRanges)([
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
            const type = notebookCommon_1.NotebookWorkingCopyTypeIdentifier.create('testViewType');
            assert.strictEqual(notebookCommon_1.NotebookWorkingCopyTypeIdentifier.parse(type), viewType);
            assert.strictEqual(notebookCommon_1.NotebookWorkingCopyTypeIdentifier.parse('something'), undefined);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tDb21tb24udGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL3Rlc3QvYnJvd3Nlci9ub3RlYm9va0NvbW1vbi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBYWhHLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7UUFDNUIsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLElBQUksV0FBNEIsQ0FBQztRQUNqQyxJQUFJLG9CQUE4QyxDQUFDO1FBQ25ELElBQUksZUFBaUMsQ0FBQztRQUV0QyxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBQ3BDLG9CQUFvQixHQUFHLElBQUEsOENBQXlCLEVBQUMsV0FBVyxDQUFDLENBQUM7WUFDOUQsZUFBZSxHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQywyQkFBZ0IsQ0FBQyxDQUFDO1FBQzlELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDhCQUE4QixFQUFFO1lBQ3BDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxxQ0FBb0IsRUFBRSxDQUFDLElBQUksQ0FDckQ7Z0JBQ0Msa0JBQWtCO2dCQUNsQix3QkFBd0I7Z0JBQ3hCLFdBQVc7Z0JBQ1gsZUFBZTtnQkFDZixZQUFLLENBQUMsS0FBSztnQkFDWCxZQUFLLENBQUMsUUFBUTtnQkFDZCxXQUFXO2dCQUNYLFlBQVk7Z0JBQ1osWUFBSyxDQUFDLElBQUk7YUFDVixDQUFDLEVBQ0Y7Z0JBQ0Msa0JBQWtCO2dCQUNsQix3QkFBd0I7Z0JBQ3hCLFdBQVc7Z0JBQ1gsZUFBZTtnQkFDZixZQUFLLENBQUMsS0FBSztnQkFDWCxZQUFLLENBQUMsUUFBUTtnQkFDZCxXQUFXO2dCQUNYLFlBQVk7Z0JBQ1osWUFBSyxDQUFDLElB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QyxDQUFDO1lBQ3hFLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBQSxtQ0FBbUIsRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RSxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEsbUNBQW1CLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVFLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBQSxtQ0FBbUIsRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFBLG1DQUFtQixFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxxQkFBcUIsRUFBRTtZQUMzQixNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEsbUNBQW1CLEVBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDcEQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFBLG1DQUFtQixFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pFLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBQSxtQ0FBbUIsRUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFBLG1DQUFtQixFQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0UsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFBLG1DQUFtQixFQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVyRyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEsbUNBQW1CLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVFLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBQSxtQ0FBbUIsRUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9FLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBQSxtQ0FBbUIsRUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFckcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFBLG1DQUFtQixFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5RSxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEsbUNBQW1CLEVBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9FLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUNyQixNQUFNLENBQUMsZUFBZSxDQUFDLElBQUEsZ0NBQWdCLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0csTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFBLGdDQUFnQixFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxF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