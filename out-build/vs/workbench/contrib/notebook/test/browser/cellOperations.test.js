/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/notebook/browser/viewModel/foldingModel", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor", "vs/editor/common/core/range", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits", "vs/editor/common/languages/language", "vs/editor/common/model", "vs/base/test/common/utils"], function (require, exports, assert, foldingModel_1, cellOperations_1, notebookCommon_1, testNotebookEditor_1, range_1, bulkEditService_1, bulkCellEdits_1, language_1, model_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('CellOperations', () => {
        (0, utils_1.$bT)();
        test('Move cells - single cell', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel) => {
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 1, end: 2 }, selections: [{ start: 1, end: 2 }] });
                const cell = viewModel.cellAt(1);
                assert.ok(cell);
                await (0, cellOperations_1.$Ypb)({ notebookEditor: editor, cell: cell }, 'down');
                assert.strictEqual(viewModel.cellAt(2)?.getText(), 'var b = 1;');
                assert.strictEqual(cell, viewModel.cellAt(2));
            });
        });
        test('Move cells - multiple cells in a selection', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel) => {
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 1, end: 2 }, selections: [{ start: 0, end: 2 }] });
                await (0, cellOperations_1.$Ypb)({ notebookEditor: editor, cell: viewModel.cellAt(1) }, 'down');
                assert.strictEqual(viewModel.cellAt(0)?.getText(), '# header b');
                assert.strictEqual(viewModel.cellAt(1)?.getText(), '# header a');
                assert.strictEqual(viewModel.cellAt(2)?.getText(), 'var b = 1;');
            });
        });
        test('Move cells - move with folding ranges', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel, ds) => {
                const foldingModel = ds.add(new foldingModel_1.$1qb());
                foldingModel.attachViewModel(viewModel);
                (0, foldingModel_1.$2qb)(foldingModel, 0, true);
                (0, foldingModel_1.$2qb)(foldingModel, 1, true);
                viewModel.updateFoldingRanges(foldingModel.regions);
                editor.setHiddenAreas([{ start: 1, end: 2 }]);
                editor.setHiddenAreas(viewModel.getHiddenRanges());
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 0, end: 1 }, selections: [{ start: 0, end: 1 }] });
                await (0, cellOperations_1.$Ypb)({ notebookEditor: editor, cell: viewModel.cellAt(1) }, 'down');
                assert.strictEqual(viewModel.cellAt(0)?.getText(), '# header b');
                assert.strictEqual(viewModel.cellAt(1)?.getText(), '# header a');
                assert.strictEqual(viewModel.cellAt(2)?.getText(), 'var b = 1;');
            });
        });
        test('Copy/duplicate cells - single cell', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel) => {
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 1, end: 2 }, selections: [{ start: 1, end: 2 }] });
                await (0, cellOperations_1.$Zpb)({ notebookEditor: editor, cell: viewModel.cellAt(1) }, 'down');
                assert.strictEqual(viewModel.length, 6);
                assert.strictEqual(viewModel.cellAt(1)?.getText(), 'var b = 1;');
                assert.strictEqual(viewModel.cellAt(2)?.getText(), 'var b = 1;');
            });
        });
        test('Copy/duplicate cells - target and selection are different, #119769', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel) => {
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 0, end: 1 }, selections: [{ start: 0, end: 1 }] });
                await (0, cellOperations_1.$Zpb)({ notebookEditor: editor, cell: viewModel.cellAt(1), ui: true }, 'down');
                assert.strictEqual(viewModel.length, 6);
                assert.strictEqual(viewModel.cellAt(1)?.getText(), 'var b = 1;');
                assert.strictEqual(viewModel.cellAt(2)?.getText(), 'var b = 1;');
            });
        });
        test('Copy/duplicate cells - multiple cells in a selection', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel) => {
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 1, end: 2 }, selections: [{ start: 0, end: 2 }] });
                await (0, cellOperations_1.$Zpb)({ notebookEditor: editor, cell: viewModel.cellAt(1) }, 'down');
                assert.strictEqual(viewModel.length, 7);
                assert.strictEqual(viewModel.cellAt(0)?.getText(), '# header a');
                assert.strictEqual(viewModel.cellAt(1)?.getText(), 'var b = 1;');
                assert.strictEqual(viewModel.cellAt(2)?.getText(), '# header a');
                assert.strictEqual(viewModel.cellAt(3)?.getText(), 'var b = 1;');
            });
        });
        test('Copy/duplicate cells - move with folding ranges', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel, ds) => {
                const foldingModel = ds.add(new foldingModel_1.$1qb());
                foldingModel.attachViewModel(viewModel);
                (0, foldingModel_1.$2qb)(foldingModel, 0, true);
                (0, foldingModel_1.$2qb)(foldingModel, 1, true);
                viewModel.updateFoldingRanges(foldingModel.regions);
                editor.setHiddenAreas([{ start: 1, end: 2 }]);
                editor.setHiddenAreas(viewModel.getHiddenRanges());
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 0, end: 1 }, selections: [{ start: 0, end: 1 }] });
                await (0, cellOperations_1.$Zpb)({ notebookEditor: editor, cell: viewModel.cellAt(1) }, 'down');
                assert.strictEqual(viewModel.length, 7);
                assert.strictEqual(viewModel.cellAt(0)?.getText(), '# header a');
                assert.strictEqual(viewModel.cellAt(1)?.getText(), 'var b = 1;');
                assert.strictEqual(viewModel.cellAt(2)?.getText(), '# header a');
                assert.strictEqual(viewModel.cellAt(3)?.getText(), 'var b = 1;');
            });
        });
        test('Copy/duplicate cells - should not share the same text buffer #102423', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel) => {
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 1, end: 2 }, selections: [{ start: 1, end: 2 }] });
                await (0, cellOperations_1.$Zpb)({ notebookEditor: editor, cell: viewModel.cellAt(1) }, 'down');
                assert.strictEqual(viewModel.length, 3);
                const cell1 = viewModel.cellAt(1);
                const cell2 = viewModel.cellAt(2);
                assert.ok(cell1);
                assert.ok(cell2);
                assert.strictEqual(cell1.getText(), 'var b = 1;');
                assert.strictEqual(viewModel.cellAt(2)?.getText(), 'var b = 1;');
                cell1.textBuffer.applyEdits([
                    new model_1.$Du(null, new range_1.$ks(1, 1, 1, 4), '', false, false, false)
                ], false, true);
                assert.notStrictEqual(cell1.getText(), cell2.getText());
            });
        });
        test('Join cell with below - single cell', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel, accessor) => {
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 3, end: 4 }, selections: [{ start: 3, end: 4 }] });
                const ret = await (0, cellOperations_1.$2pb)(editor, { start: 3, end: 4 }, 'below');
                assert.strictEqual(ret?.edits.length, 2);
                assert.deepStrictEqual(ret?.edits[0], new bulkEditService_1.$p1(viewModel.cellAt(3).uri, {
                    range: new range_1.$ks(1, 11, 1, 11), text: viewModel.cellAt(4).textBuffer.getEOL() + 'var c = 3;'
                }));
                assert.deepStrictEqual(ret?.edits[1], new bulkCellEdits_1.$3bb(editor.textModel.uri, {
                    editType: 1 /* CellEditType.Replace */,
                    index: 4,
                    count: 1,
                    cells: []
                }));
            });
        });
        test('Join cell with above - single cell', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel, accessor) => {
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 3, end: 4 }, selections: [{ start: 3, end: 4 }] });
                const ret = await (0, cellOperations_1.$2pb)(editor, { start: 4, end: 5 }, 'above');
                assert.strictEqual(ret?.edits.length, 2);
                assert.deepStrictEqual(ret?.edits[0], new bulkEditService_1.$p1(viewModel.cellAt(3).uri, {
                    range: new range_1.$ks(1, 11, 1, 11), text: viewModel.cellAt(4).textBuffer.getEOL() + 'var c = 3;'
                }));
                assert.deepStrictEqual(ret?.edits[1], new bulkCellEdits_1.$3bb(editor.textModel.uri, {
                    editType: 1 /* CellEditType.Replace */,
                    index: 4,
                    count: 1,
                    cells: []
                }));
            });
        });
        test('Join cell with below - multiple cells', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel, accessor) => {
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 1, end: 2 }, selections: [{ start: 0, end: 2 }] });
                const ret = await (0, cellOperations_1.$2pb)(editor, { start: 0, end: 2 }, 'below');
                assert.strictEqual(ret?.edits.length, 2);
                assert.deepStrictEqual(ret?.edits[0], new bulkEditService_1.$p1(viewModel.cellAt(0).uri, {
                    range: new range_1.$ks(1, 11, 1, 11), text: viewModel.cellAt(1).textBuffer.getEOL() + 'var b = 2;' + viewModel.cellAt(2).textBuffer.getEOL() + 'var c = 3;'
                }));
                assert.deepStrictEqual(ret?.edits[1], new bulkCellEdits_1.$3bb(editor.textModel.uri, {
                    editType: 1 /* CellEditType.Replace */,
                    index: 1,
                    count: 2,
                    cells: []
                }));
            });
        });
        test('Join cell with above - multiple cells', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel, accessor) => {
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 2, end: 3 }, selections: [{ start: 1, end: 3 }] });
                const ret = await (0, cellOperations_1.$2pb)(editor, { start: 1, end: 3 }, 'above');
                assert.strictEqual(ret?.edits.length, 2);
                assert.deepStrictEqual(ret?.edits[0], new bulkEditService_1.$p1(viewModel.cellAt(0).uri, {
                    range: new range_1.$ks(1, 11, 1, 11), text: viewModel.cellAt(1).textBuffer.getEOL() + 'var b = 2;' + viewModel.cellAt(2).textBuffer.getEOL() + 'var c = 3;'
                }));
                assert.deepStrictEqual(ret?.edits[1], new bulkCellEdits_1.$3bb(editor.textModel.uri, {
                    editType: 1 /* CellEditType.Replace */,
                    index: 1,
                    count: 2,
                    cells: []
                }));
            });
        });
        test('Delete focus cell', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel) => {
                editor.setFocus({ start: 0, end: 1 });
                editor.setSelections([{ start: 0, end: 1 }]);
                (0, cellOperations_1.$Xpb)(editor, viewModel.cellAt(0));
                assert.strictEqual(viewModel.length, 2);
            });
        });
        test('Delete selected cells', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel) => {
                editor.setFocus({ start: 0, end: 1 });
                editor.setSelections([{ start: 0, end: 2 }]);
                (0, cellOperations_1.$Xpb)(editor, viewModel.cellAt(0));
                assert.strictEqual(viewModel.length, 1);
            });
        });
        test('Delete focus cell out of a selection', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], async (editor, viewModel) => {
                editor.setFocus({ start: 0, end: 1 });
                editor.setSelections([{ start: 2, end: 4 }]);
                (0, cellOperations_1.$Xpb)(editor, viewModel.cellAt(0));
                assert.strictEqual(viewModel.length, 3);
            });
        });
        test('Delete UI target', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel) => {
                editor.setFocus({ start: 0, end: 1 });
                editor.setSelections([{ start: 0, end: 1 }]);
                (0, cellOperations_1.$Xpb)(editor, viewModel.cellAt(2));
                assert.strictEqual(viewModel.length, 2);
                assert.strictEqual(viewModel.cellAt(0)?.getText(), 'var a = 1;');
                assert.strictEqual(viewModel.cellAt(1)?.getText(), 'var b = 2;');
            });
        });
        test('Delete UI target 2', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], async (editor, viewModel) => {
                editor.setFocus({ start: 0, end: 1 });
                editor.setSelections([{ start: 0, end: 1 }, { start: 3, end: 5 }]);
                (0, cellOperations_1.$Xpb)(editor, viewModel.cellAt(1));
                assert.strictEqual(viewModel.length, 4);
                assert.deepStrictEqual(editor.getFocus(), { start: 0, end: 1 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 0, end: 1 }, { start: 2, end: 4 }]);
            });
        });
        test('Delete UI target 3', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], async (editor, viewModel) => {
                editor.setFocus({ start: 0, end: 1 });
                editor.setSelections([{ start: 2, end: 3 }]);
                (0, cellOperations_1.$Xpb)(editor, viewModel.cellAt(0));
                assert.strictEqual(viewModel.length, 4);
                assert.deepStrictEqual(editor.getFocus(), { start: 0, end: 1 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 1, end: 2 }]);
            });
        });
        test('Delete UI target 4', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], async (editor, viewModel) => {
                editor.setFocus({ start: 2, end: 3 });
                editor.setSelections([{ start: 3, end: 5 }]);
                (0, cellOperations_1.$Xpb)(editor, viewModel.cellAt(0));
                assert.strictEqual(viewModel.length, 4);
                assert.deepStrictEqual(editor.getFocus(), { start: 1, end: 2 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 2, end: 4 }]);
            });
        });
        test('Delete last cell sets selection correctly', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel) => {
                editor.setFocus({ start: 2, end: 3 });
                editor.setSelections([{ start: 2, end: 3 }]);
                (0, cellOperations_1.$Xpb)(editor, viewModel.cellAt(2));
                assert.strictEqual(viewModel.length, 2);
                assert.deepStrictEqual(editor.getFocus(), { start: 1, end: 2 });
            });
        });
        test('#120187. Delete should work on multiple distinct selection', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel) => {
                editor.setFocus({ start: 0, end: 1 });
                editor.setSelections([{ start: 0, end: 1 }, { start: 3, end: 4 }]);
                (0, cellOperations_1.$Xpb)(editor, viewModel.cellAt(0));
                assert.strictEqual(viewModel.length, 2);
                assert.deepStrictEqual(editor.getFocus(), { start: 0, end: 1 });
            });
        });
        test('#120187. Delete should work on multiple distinct selection 2', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], async (editor, viewModel) => {
                editor.setFocus({ start: 1, end: 2 });
                editor.setSelections([{ start: 1, end: 2 }, { start: 3, end: 5 }]);
                (0, cellOperations_1.$Xpb)(editor, viewModel.cellAt(1));
                assert.strictEqual(viewModel.length, 2);
                assert.deepStrictEqual(editor.getFocus(), { start: 1, end: 2 });
            });
        });
        test('Change cell kind - single cell', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel) => {
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 1, end: 2 }, selections: [{ start: 1, end: 2 }] });
                await (0, cellOperations_1.$Wpb)(notebookCommon_1.CellKind.Markup, { notebookEditor: editor, cell: viewModel.cellAt(1), ui: true });
                assert.strictEqual(viewModel.cellAt(1)?.cellKind, notebookCommon_1.CellKind.Markup);
            });
        });
        test('Change cell kind - multi cells', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel) => {
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 1, end: 2 }, selections: [{ start: 1, end: 2 }] });
                await (0, cellOperations_1.$Wpb)(notebookCommon_1.CellKind.Markup, { notebookEditor: editor, selectedCells: [viewModel.cellAt(3), viewModel.cellAt(4)], ui: false });
                assert.strictEqual(viewModel.cellAt(3)?.cellKind, notebookCommon_1.CellKind.Markup);
                assert.strictEqual(viewModel.cellAt(4)?.cellKind, notebookCommon_1.CellKind.Markup);
            });
        });
        test('split cell', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor, viewModel) => {
                assert.deepStrictEqual((0, cellOperations_1.$4pb)(viewModel.cellAt(0), [{ lineNumber: 1, column: 4 }]), [
                    'var',
                    ' b = 1;'
                ]);
                assert.deepStrictEqual((0, cellOperations_1.$4pb)(viewModel.cellAt(0), [{ lineNumber: 1, column: 4 }, { lineNumber: 1, column: 6 }]), [
                    'var',
                    ' b',
                    ' = 1;'
                ]);
                assert.deepStrictEqual((0, cellOperations_1.$4pb)(viewModel.cellAt(0), [{ lineNumber: 1, column: 1 }]), [
                    '',
                    'var b = 1;'
                ]);
                assert.deepStrictEqual((0, cellOperations_1.$4pb)(viewModel.cellAt(0), [{ lineNumber: 1, column: 11 }]), [
                    'var b = 1;',
                    '',
                ]);
            });
        });
        test('Insert cell', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel, _ds, accessor) => {
                const languageService = accessor.get(language_1.$ct);
                const insertedCellAbove = (0, cellOperations_1.$5pb)(languageService, editor, 4, notebookCommon_1.CellKind.Code, 'above', 'var a = 0;');
                assert.strictEqual(viewModel.length, 6);
                assert.strictEqual(viewModel.cellAt(4), insertedCellAbove);
                const insertedCellBelow = (0, cellOperations_1.$5pb)(languageService, editor, 1, notebookCommon_1.CellKind.Code, 'below', 'var a = 0;');
                assert.strictEqual(viewModel.length, 7);
                assert.strictEqual(viewModel.cellAt(2), insertedCellBelow);
            });
        });
    });
});
//# sourceMappingURL=cellOperations.test.js.map