/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor"], function (require, exports, assert, lifecycle_1, utils_1, notebookCommon_1, testNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookCellList', () => {
        let testDisposables;
        let instantiationService;
        teardown(() => {
            testDisposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(() => {
            testDisposables = new lifecycle_1.DisposableStore();
            instantiationService = (0, testNotebookEditor_1.setupInstantiationService)(testDisposables);
        });
        test('revealElementsInView: reveal fully visible cell should not scroll', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header c', 'markdown', notebookCommon_1.CellKind.Markup, [], {}]
            ], async (editor, viewModel, disposables) => {
                viewModel.restoreEditorViewState({
                    editingCells: [false, false, false, false, false],
                    cellLineNumberStates: {},
                    editorViewStates: [null, null, null, null, null],
                    cellTotalHeights: [50, 100, 50, 100, 50],
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                });
                const cellList = (0, testNotebookEditor_1.createNotebookCellList)(instantiationService, disposables);
                cellList.attachViewModel(viewModel);
                // render height 210, it can render 3 full cells and 1 partial cell
                cellList.layout(210, 100);
                // scroll a bit, scrollTop to bottom: 5, 215
                cellList.scrollTop = 5;
                // init scrollTop and scrollBottom
                assert.deepStrictEqual(cellList.scrollTop, 5);
                assert.deepStrictEqual(cellList.getViewScrollBottom(), 215);
                // reveal cell 1, top 50, bottom 150, which is fully visible in the viewport
                cellList.revealCellsInView({ start: 1, end: 2 });
                assert.deepStrictEqual(cellList.scrollTop, 5);
                assert.deepStrictEqual(cellList.getViewScrollBottom(), 215);
                // reveal cell 2, top 150, bottom 200, which is fully visible in the viewport
                cellList.revealCellsInView({ start: 2, end: 3 });
                assert.deepStrictEqual(cellList.scrollTop, 5);
                assert.deepStrictEqual(cellList.getViewScrollBottom(), 215);
                // reveal cell 3, top 200, bottom 300, which is partially visible in the viewport
                cellList.revealCellsInView({ start: 3, end: 4 });
                assert.deepStrictEqual(cellList.scrollTop, 90);
            });
        });
        test('revealElementsInView: reveal partially visible cell', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header c', 'markdown', notebookCommon_1.CellKind.Markup, [], {}]
            ], async (editor, viewModel, disposables) => {
                viewModel.restoreEditorViewState({
                    editingCells: [false, false, false, false, false],
                    editorViewStates: [null, null, null, null, null],
                    cellTotalHeights: [50, 100, 50, 100, 50],
                    cellLineNumberStates: {},
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                });
                const cellList = (0, testNotebookEditor_1.createNotebookCellList)(instantiationService, disposables);
                cellList.attachViewModel(viewModel);
                // render height 210, it can render 3 full cells and 1 partial cell
                cellList.layout(210, 100);
                // init scrollTop and scrollBottom
                assert.deepStrictEqual(cellList.scrollTop, 0);
                assert.deepStrictEqual(cellList.getViewScrollBottom(), 210);
                // reveal cell 3, top 200, bottom 300, which is partially visible in the viewport
                cellList.revealCellsInView({ start: 3, end: 4 });
                assert.deepStrictEqual(cellList.scrollTop, 90);
                // scroll to 5
                cellList.scrollTop = 5;
                assert.deepStrictEqual(cellList.scrollTop, 5);
                assert.deepStrictEqual(cellList.getViewScrollBottom(), 215);
                // reveal cell 0, top 0, bottom 50
                cellList.revealCellsInView({ start: 0, end: 1 });
                assert.deepStrictEqual(cellList.scrollTop, 0);
            });
        });
        test('revealElementsInView: reveal cell out of viewport', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header c', 'markdown', notebookCommon_1.CellKind.Markup, [], {}]
            ], async (editor, viewModel, disposables) => {
                viewModel.restoreEditorViewState({
                    editingCells: [false, false, false, false, false],
                    editorViewStates: [null, null, null, null, null],
                    cellTotalHeights: [50, 100, 50, 100, 50],
                    cellLineNumberStates: {},
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                });
                const cellList = (0, testNotebookEditor_1.createNotebookCellList)(instantiationService, disposables);
                // without paddingBottom, the last 20 px will always be hidden due to `topInsertToolbarHeight`
                cellList.updateOptions({ paddingBottom: 100 });
                cellList.attachViewModel(viewModel);
                // render height 210, it can render 3 full cells and 1 partial cell
                cellList.layout(210, 100);
                // init scrollTop and scrollBottom
                assert.deepStrictEqual(cellList.scrollTop, 0);
                assert.deepStrictEqual(cellList.getViewScrollBottom(), 210);
                cellList.revealCellsInView({ start: 4, end: 5 });
                assert.deepStrictEqual(cellList.scrollTop, 140);
                // assert.deepStrictEqual(cellList.getViewScrollBottom(), 330);
            });
        });
        test('updateElementHeight', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header c', 'markdown', notebookCommon_1.CellKind.Markup, [], {}]
            ], async (editor, viewModel, disposables) => {
                viewModel.restoreEditorViewState({
                    editingCells: [false, false, false, false, false],
                    editorViewStates: [null, null, null, null, null],
                    cellTotalHeights: [50, 100, 50, 100, 50],
                    cellLineNumberStates: {},
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                });
                const cellList = (0, testNotebookEditor_1.createNotebookCellList)(instantiationService, disposables);
                cellList.attachViewModel(viewModel);
                // render height 210, it can render 3 full cells and 1 partial cell
                cellList.layout(210, 100);
                // init scrollTop and scrollBottom
                assert.deepStrictEqual(cellList.scrollTop, 0);
                assert.deepStrictEqual(cellList.getViewScrollBottom(), 210);
                cellList.updateElementHeight(0, 60);
                assert.deepStrictEqual(cellList.scrollTop, 0);
                // scroll to 5
                cellList.scrollTop = 5;
                assert.deepStrictEqual(cellList.scrollTop, 5);
                assert.deepStrictEqual(cellList.getViewScrollBottom(), 215);
                cellList.updateElementHeight(0, 80);
                assert.deepStrictEqual(cellList.scrollTop, 5);
            });
        });
        test('updateElementHeight with anchor #121723', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header c', 'markdown', notebookCommon_1.CellKind.Markup, [], {}]
            ], async (editor, viewModel, disposables) => {
                viewModel.restoreEditorViewState({
                    editingCells: [false, false, false, false, false],
                    editorViewStates: [null, null, null, null, null],
                    cellTotalHeights: [50, 100, 50, 100, 50],
                    cellLineNumberStates: {},
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                });
                const cellList = (0, testNotebookEditor_1.createNotebookCellList)(instantiationService, disposables);
                cellList.attachViewModel(viewModel);
                // render height 210, it can render 3 full cells and 1 partial cell
                cellList.layout(210, 100);
                // init scrollTop and scrollBottom
                assert.deepStrictEqual(cellList.scrollTop, 0);
                assert.deepStrictEqual(cellList.getViewScrollBottom(), 210);
                // scroll to 5
                cellList.scrollTop = 5;
                assert.deepStrictEqual(cellList.scrollTop, 5);
                assert.deepStrictEqual(cellList.getViewScrollBottom(), 215);
                cellList.setFocus([1]);
                cellList.updateElementHeight2(viewModel.cellAt(0), 100);
                assert.deepStrictEqual(cellList.scrollHeight, 400);
                // the first cell grows, but it's partially visible, so we won't push down the focused cell
                assert.deepStrictEqual(cellList.scrollTop, 55);
                assert.deepStrictEqual(cellList.getViewScrollBottom(), 265);
                cellList.updateElementHeight2(viewModel.cellAt(0), 50);
                assert.deepStrictEqual(cellList.scrollTop, 5);
                assert.deepStrictEqual(cellList.getViewScrollBottom(), 215);
                // focus won't be visible after cell 0 grow to 250, so let's try to keep the focused cell visible
                cellList.updateElementHeight2(viewModel.cellAt(0), 250);
                assert.deepStrictEqual(cellList.scrollTop, 250 + 100 - cellList.renderHeight);
                assert.deepStrictEqual(cellList.getViewScrollBottom(), 250 + 100 - cellList.renderHeight + 210);
            });
        });
        test('updateElementHeight with anchor #121723: focus element out of viewport', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header c', 'markdown', notebookCommon_1.CellKind.Markup, [], {}]
            ], async (editor, viewModel, disposables) => {
                viewModel.restoreEditorViewState({
                    editingCells: [false, false, false, false, false],
                    editorViewStates: [null, null, null, null, null],
                    cellTotalHeights: [50, 100, 50, 100, 50],
                    cellLineNumberStates: {},
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                });
                const cellList = (0, testNotebookEditor_1.createNotebookCellList)(instantiationService, disposables);
                cellList.attachViewModel(viewModel);
                // render height 210, it can render 3 full cells and 1 partial cell
                cellList.layout(210, 100);
                // init scrollTop and scrollBottom
                assert.deepStrictEqual(cellList.scrollTop, 0);
                assert.deepStrictEqual(cellList.getViewScrollBottom(), 210);
                cellList.setFocus([4]);
                cellList.updateElementHeight2(viewModel.cellAt(1), 130);
                // the focus cell is not in the viewport, the scrolltop should not change at all
                assert.deepStrictEqual(cellList.scrollTop, 0);
            });
        });
        test('updateElementHeight of cells out of viewport should not trigger scroll #121140', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header c', 'markdown', notebookCommon_1.CellKind.Markup, [], {}]
            ], async (editor, viewModel, disposables) => {
                viewModel.restoreEditorViewState({
                    editingCells: [false, false, false, false, false],
                    editorViewStates: [null, null, null, null, null],
                    cellTotalHeights: [50, 100, 50, 100, 50],
                    cellLineNumberStates: {},
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                });
                const cellList = (0, testNotebookEditor_1.createNotebookCellList)(instantiationService, disposables);
                cellList.attachViewModel(viewModel);
                // render height 210, it can render 3 full cells and 1 partial cell
                cellList.layout(210, 100);
                // init scrollTop and scrollBottom
                assert.deepStrictEqual(cellList.scrollTop, 0);
                assert.deepStrictEqual(cellList.getViewScrollBottom(), 210);
                cellList.setFocus([1]);
                cellList.scrollTop = 80;
                assert.deepStrictEqual(cellList.scrollTop, 80);
                cellList.updateElementHeight2(viewModel.cellAt(0), 30);
                assert.deepStrictEqual(cellList.scrollTop, 60);
            });
        });
        test('visibleRanges should be exclusive of end', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([], async (editor, viewModel, disposables) => {
                const cellList = (0, testNotebookEditor_1.createNotebookCellList)(instantiationService, disposables);
                cellList.attachViewModel(viewModel);
                // render height 210, it can render 3 full cells and 1 partial cell
                cellList.layout(100, 100);
                assert.deepStrictEqual(cellList.visibleRanges, []);
            });
        });
        test('visibleRanges should be exclusive of end 2', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], async (editor, viewModel, disposables) => {
                viewModel.restoreEditorViewState({
                    editingCells: [false],
                    editorViewStates: [null],
                    cellTotalHeights: [50],
                    cellLineNumberStates: {},
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                });
                const cellList = (0, testNotebookEditor_1.createNotebookCellList)(instantiationService, disposables);
                cellList.attachViewModel(viewModel);
                // render height 210, it can render 3 full cells and 1 partial cell
                cellList.layout(100, 100);
                assert.deepStrictEqual(cellList.visibleRanges, [{ start: 0, end: 1 }]);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tDZWxsTGlzdC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svdGVzdC9icm93c2VyL25vdGVib29rQ2VsbExpc3QudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVNoRyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO1FBQzlCLElBQUksZUFBZ0MsQ0FBQztRQUNyQyxJQUFJLG9CQUE4QyxDQUFDO1FBRW5ELFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDYixlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDM0IsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLGVBQWUsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUN4QyxvQkFBb0IsR0FBRyxJQUFBLDhDQUF5QixFQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ25FLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLG1FQUFtRSxFQUFFLEtBQUs7WUFDOUUsTUFBTSxJQUFBLHFDQUFnQixFQUNyQjtnQkFDQyxDQUFDLFlBQVksRUFBRSxVQUFVLEVBQUUseUJBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztnQkFDbkQsQ0FBQyxZQUFZLEVBQUUsWUFBWSxFQUFFLHlCQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7Z0JBQ25ELENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSx5QkFBUSxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO2dCQUNuRCxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUseUJBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztnQkFDbkQsQ0FBQyxZ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