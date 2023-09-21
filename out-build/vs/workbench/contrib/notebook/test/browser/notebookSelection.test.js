/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/languages/language", "vs/workbench/contrib/notebook/browser/viewModel/foldingModel", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/browser/viewModel/cellSelectionCollection", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, assert, language_1, foldingModel_1, cellOperations_1, cellSelectionCollection_1, notebookCommon_1, testNotebookEditor_1, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookSelection', () => {
        test('focus is never empty', function () {
            const selectionCollection = new cellSelectionCollection_1.$uob();
            assert.deepStrictEqual(selectionCollection.focus, { start: 0, end: 0 });
            selectionCollection.setState(null, [], true, 'model');
            assert.deepStrictEqual(selectionCollection.focus, { start: 0, end: 0 });
        });
    });
    suite('NotebookCellList focus/selection', () => {
        let disposables;
        let instantiationService;
        let languageService;
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        setup(() => {
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, testNotebookEditor_1.$Ifc)(disposables);
            languageService = instantiationService.get(language_1.$ct);
        });
        test('notebook cell list setFocus', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor, viewModel, ds) => {
                const cellList = (0, testNotebookEditor_1.$Mfc)(instantiationService, ds);
                cellList.attachViewModel(viewModel);
                assert.strictEqual(cellList.length, 2);
                cellList.setFocus([0]);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 0, end: 1 });
                cellList.setFocus([1]);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 1, end: 2 });
                cellList.detachViewModel();
            });
        });
        test('notebook cell list setSelections', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor, viewModel, ds) => {
                const cellList = (0, testNotebookEditor_1.$Mfc)(instantiationService, ds);
                cellList.attachViewModel(viewModel);
                assert.strictEqual(cellList.length, 2);
                cellList.setSelection([0]);
                // the only selection is also the focus
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 0, end: 1 }]);
                // set selection does not modify focus
                cellList.setSelection([1]);
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 1, end: 2 }]);
            });
        });
        test('notebook cell list setFocus2', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor, viewModel, ds) => {
                const cellList = (0, testNotebookEditor_1.$Mfc)(instantiationService, ds);
                cellList.attachViewModel(viewModel);
                assert.strictEqual(cellList.length, 2);
                cellList.setFocus([0]);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 0, end: 1 });
                cellList.setFocus([1]);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 1, end: 2 });
                cellList.setSelection([1]);
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 1, end: 2 }]);
                cellList.detachViewModel();
            });
        });
        test('notebook cell list focus/selection from UI', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header c', 'markdown', notebookCommon_1.CellKind.Markup, [], {}]
            ], (editor, viewModel, ds) => {
                const cellList = (0, testNotebookEditor_1.$Mfc)(instantiationService, ds);
                cellList.attachViewModel(viewModel);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 0, end: 1 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 0, end: 1 }]);
                // arrow down, move both focus and selections
                cellList.setFocus([1], new KeyboardEvent('keydown'), undefined);
                cellList.setSelection([1], new KeyboardEvent('keydown'), undefined);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 1, end: 2 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 1, end: 2 }]);
                // shift+arrow down, expands selection
                cellList.setFocus([2], new KeyboardEvent('keydown'), undefined);
                cellList.setSelection([1, 2]);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 2, end: 3 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 1, end: 3 }]);
                // arrow down, will move focus but not expand selection
                cellList.setFocus([3], new KeyboardEvent('keydown'), undefined);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 3, end: 4 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 1, end: 3 }]);
            });
        });
        test('notebook cell list focus/selection with folding regions', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header c', 'markdown', notebookCommon_1.CellKind.Markup, [], {}]
            ], (editor, viewModel, ds) => {
                const foldingModel = ds.add(new foldingModel_1.$1qb());
                foldingModel.attachViewModel(viewModel);
                const cellList = (0, testNotebookEditor_1.$Mfc)(instantiationService, ds);
                cellList.attachViewModel(viewModel);
                assert.strictEqual(cellList.length, 5);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 0, end: 1 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 0, end: 1 }]);
                cellList.setFocus([0]);
                (0, foldingModel_1.$2qb)(foldingModel, 0, true);
                (0, foldingModel_1.$2qb)(foldingModel, 2, true);
                viewModel.updateFoldingRanges(foldingModel.regions);
                cellList.setHiddenAreas(viewModel.getHiddenRanges(), true);
                assert.strictEqual(cellList.length, 3);
                // currently, focus on a folded cell will only focus the cell itself, excluding its "inner" cells
                assert.deepStrictEqual(viewModel.getFocus(), { start: 0, end: 1 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 0, end: 1 }]);
                cellList.focusNext(1, false);
                // focus next should skip the folded items
                assert.deepStrictEqual(viewModel.getFocus(), { start: 2, end: 3 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 0, end: 1 }]);
                // unfold
                (0, foldingModel_1.$2qb)(foldingModel, 2, false);
                viewModel.updateFoldingRanges(foldingModel.regions);
                cellList.setHiddenAreas(viewModel.getHiddenRanges(), true);
                assert.strictEqual(cellList.length, 4);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 2, end: 3 });
            });
        });
        test('notebook cell list focus/selection with folding regions and applyEdits', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3', 'javascript', notebookCommon_1.CellKind.Markup, [], {}],
                ['# header d', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor, viewModel, ds) => {
                const foldingModel = ds.add(new foldingModel_1.$1qb());
                foldingModel.attachViewModel(viewModel);
                const cellList = (0, testNotebookEditor_1.$Mfc)(instantiationService, ds);
                cellList.attachViewModel(viewModel);
                cellList.setFocus([0]);
                cellList.setSelection([0]);
                (0, foldingModel_1.$2qb)(foldingModel, 0, true);
                (0, foldingModel_1.$2qb)(foldingModel, 2, true);
                viewModel.updateFoldingRanges(foldingModel.regions);
                cellList.setHiddenAreas(viewModel.getHiddenRanges(), true);
                assert.strictEqual(cellList.getModelIndex2(0), 0);
                assert.strictEqual(cellList.getModelIndex2(1), 2);
                editor.textModel.applyEdits([{
                        editType: 1 /* CellEditType.Replace */, index: 0, count: 2, cells: []
                    }], true, undefined, () => undefined, undefined, false);
                viewModel.updateFoldingRanges(foldingModel.regions);
                cellList.setHiddenAreas(viewModel.getHiddenRanges(), true);
                assert.strictEqual(cellList.getModelIndex2(0), 0);
                assert.strictEqual(cellList.getModelIndex2(1), 3);
                // mimic undo
                editor.textModel.applyEdits([{
                        editType: 1 /* CellEditType.Replace */, index: 0, count: 0, cells: [
                            ds.add(new testNotebookEditor_1.$Gfc(viewModel.viewType, 7, '# header f', 'markdown', notebookCommon_1.CellKind.Code, [], languageService)),
                            ds.add(new testNotebookEditor_1.$Gfc(viewModel.viewType, 8, 'var g = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], languageService))
                        ]
                    }], true, undefined, () => undefined, undefined, false);
                viewModel.updateFoldingRanges(foldingModel.regions);
                cellList.setHiddenAreas(viewModel.getHiddenRanges(), true);
                assert.strictEqual(cellList.getModelIndex2(0), 0);
                assert.strictEqual(cellList.getModelIndex2(1), 1);
                assert.strictEqual(cellList.getModelIndex2(2), 2);
            });
        });
        test('notebook cell list getModelIndex', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header c', 'markdown', notebookCommon_1.CellKind.Markup, [], {}]
            ], (editor, viewModel, ds) => {
                const foldingModel = ds.add(new foldingModel_1.$1qb());
                foldingModel.attachViewModel(viewModel);
                const cellList = (0, testNotebookEditor_1.$Mfc)(instantiationService, ds);
                cellList.attachViewModel(viewModel);
                (0, foldingModel_1.$2qb)(foldingModel, 0, true);
                (0, foldingModel_1.$2qb)(foldingModel, 2, true);
                viewModel.updateFoldingRanges(foldingModel.regions);
                cellList.setHiddenAreas(viewModel.getHiddenRanges(), true);
                assert.deepStrictEqual(cellList.getModelIndex2(-1), 0);
                assert.deepStrictEqual(cellList.getModelIndex2(0), 0);
                assert.deepStrictEqual(cellList.getModelIndex2(1), 2);
                assert.deepStrictEqual(cellList.getModelIndex2(2), 4);
            });
        });
        test('notebook validate range', async () => {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor, viewModel) => {
                assert.deepStrictEqual(viewModel.validateRange(null), null);
                assert.deepStrictEqual(viewModel.validateRange(undefined), null);
                assert.deepStrictEqual(viewModel.validateRange({ start: 0, end: 0 }), null);
                assert.deepStrictEqual(viewModel.validateRange({ start: 0, end: 2 }), { start: 0, end: 2 });
                assert.deepStrictEqual(viewModel.validateRange({ start: 0, end: 3 }), { start: 0, end: 2 });
                assert.deepStrictEqual(viewModel.validateRange({ start: -1, end: 3 }), { start: 0, end: 2 });
                assert.deepStrictEqual(viewModel.validateRange({ start: -1, end: 1 }), { start: 0, end: 1 });
                assert.deepStrictEqual(viewModel.validateRange({ start: 2, end: 1 }), { start: 1, end: 2 });
                assert.deepStrictEqual(viewModel.validateRange({ start: 2, end: -1 }), { start: 0, end: 2 });
            });
        });
        test('notebook updateSelectionState', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor, viewModel) => {
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 1, end: 2 }, selections: [{ start: 1, end: 2 }, { start: -1, end: 0 }] });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 1, end: 2 }]);
            });
        });
        test('notebook cell selection w/ cell deletion', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor, viewModel) => {
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 1, end: 2 }, selections: [{ start: 1, end: 2 }] });
                (0, cellOperations_1.$Xpb)(editor, viewModel.cellAt(1));
                // viewModel.deleteCell(1, true, false);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 0, end: 1 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 0, end: 1 }]);
            });
        });
        test('notebook cell selection w/ cell deletion from applyEdits', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel) => {
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 1, end: 2 }, selections: [{ start: 1, end: 2 }] });
                editor.textModel.applyEdits([{
                        editType: 1 /* CellEditType.Replace */,
                        index: 1,
                        count: 1,
                        cells: []
                    }], true, undefined, () => undefined, undefined, true);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 1, end: 2 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 1, end: 2 }]);
            });
        });
    });
});
//# sourceMappingURL=notebookSelection.test.js.map