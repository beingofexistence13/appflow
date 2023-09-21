/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/mock", "vs/workbench/contrib/notebook/browser/viewModel/foldingModel", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor", "vs/workbench/contrib/notebook/browser/view/notebookCellList", "vs/base/test/common/utils", "vs/base/common/lifecycle"], function (require, exports, assert, mock_1, foldingModel_1, notebookBrowser_1, notebookCommon_1, testNotebookEditor_1, notebookCellList_1, utils_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ListViewInfoAccessor', () => {
        let disposables;
        let instantiationService;
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        setup(() => {
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, testNotebookEditor_1.$Ifc)(disposables);
        });
        test('basics', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor, viewModel, ds) => {
                const foldingModel = ds.add(new foldingModel_1.$1qb());
                foldingModel.attachViewModel(viewModel);
                const cellList = ds.add((0, testNotebookEditor_1.$Mfc)(instantiationService, ds));
                cellList.attachViewModel(viewModel);
                const listViewInfoAccessor = ds.add(new notebookCellList_1.$Hob(cellList));
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(0)), 0);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(1)), 1);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(2)), 2);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(3)), 3);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(4)), 4);
                assert.deepStrictEqual(listViewInfoAccessor.getCellRangeFromViewRange(0, 1), { start: 0, end: 1 });
                assert.deepStrictEqual(listViewInfoAccessor.getCellRangeFromViewRange(1, 2), { start: 1, end: 2 });
                (0, foldingModel_1.$2qb)(foldingModel, 0, true);
                (0, foldingModel_1.$2qb)(foldingModel, 2, true);
                viewModel.updateFoldingRanges(foldingModel.regions);
                cellList.setHiddenAreas(viewModel.getHiddenRanges(), true);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(0)), 0);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(1)), -1);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(2)), 1);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(3)), -1);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(4)), -1);
                assert.deepStrictEqual(listViewInfoAccessor.getCellRangeFromViewRange(0, 1), { start: 0, end: 2 });
                assert.deepStrictEqual(listViewInfoAccessor.getCellRangeFromViewRange(1, 2), { start: 2, end: 5 });
                assert.deepStrictEqual(listViewInfoAccessor.getCellsFromViewRange(0, 1), viewModel.getCellsInRange({ start: 0, end: 2 }));
                assert.deepStrictEqual(listViewInfoAccessor.getCellsFromViewRange(1, 2), viewModel.getCellsInRange({ start: 2, end: 5 }));
                const notebookEditor = new class extends (0, mock_1.$rT)() {
                    getViewIndexByModelIndex(index) { return listViewInfoAccessor.getViewIndex(viewModel.viewCells[index]); }
                    getCellRangeFromViewRange(startIndex, endIndex) { return listViewInfoAccessor.getCellRangeFromViewRange(startIndex, endIndex); }
                    cellAt(index) { return viewModel.cellAt(index); }
                };
                assert.deepStrictEqual((0, notebookBrowser_1.$1bb)(notebookEditor, [{ start: 0, end: 1 }]), [{ start: 0, end: 2 }]);
                assert.deepStrictEqual((0, notebookBrowser_1.$1bb)(notebookEditor, [{ start: 2, end: 3 }]), [{ start: 2, end: 5 }]);
                assert.deepStrictEqual((0, notebookBrowser_1.$1bb)(notebookEditor, [{ start: 0, end: 1 }, { start: 2, end: 3 }]), [{ start: 0, end: 5 }]);
            });
        });
    });
});
//# sourceMappingURL=notebookEditor.test.js.map