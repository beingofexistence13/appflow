/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/notebook/browser/viewModel/foldingModel", "vs/base/common/lifecycle", "vs/base/test/common/utils"], function (require, exports, assert, notebookCommon_1, testNotebookEditor_1, undoRedo_1, foldingModel_1, lifecycle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Notebook Folding', () => {
        let disposables;
        let instantiationService;
        teardown(() => disposables.dispose());
        (0, utils_1.$bT)();
        setup(() => {
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, testNotebookEditor_1.$Ifc)(disposables);
            instantiationService.spy(undoRedo_1.$wu, 'pushElement');
        });
        test('Folding based on markdown cells', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 7;', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], (editor, viewModel, ds) => {
                const foldingController = ds.add(new foldingModel_1.$1qb());
                foldingController.attachViewModel(viewModel);
                assert.strictEqual(foldingController.regions.findRange(1), 0);
                assert.strictEqual(foldingController.regions.findRange(2), 0);
                assert.strictEqual(foldingController.regions.findRange(3), 1);
                assert.strictEqual(foldingController.regions.findRange(4), 1);
                assert.strictEqual(foldingController.regions.findRange(5), 1);
                assert.strictEqual(foldingController.regions.findRange(6), 2);
                assert.strictEqual(foldingController.regions.findRange(7), 2);
            });
        });
        test('Folding not based on code cells', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['# comment 1', 'python', notebookCommon_1.CellKind.Code, [], {}],
                ['body 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 3\n```\n## comment 2\n```', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 4', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 7;', 'python', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor, viewModel, ds) => {
                const foldingController = ds.add(new foldingModel_1.$1qb());
                foldingController.attachViewModel(viewModel);
                assert.strictEqual(foldingController.regions.findRange(1), 0);
                assert.strictEqual(foldingController.regions.findRange(2), 0);
                assert.strictEqual(foldingController.regions.findRange(3), 0);
                assert.strictEqual(foldingController.regions.findRange(4), 0);
                assert.strictEqual(foldingController.regions.findRange(5), 0);
                assert.strictEqual(foldingController.regions.findRange(6), 0);
                assert.strictEqual(foldingController.regions.findRange(7), 1);
                assert.strictEqual(foldingController.regions.findRange(8), 1);
            });
        });
        test('Top level header in a cell wins', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.1\n# header3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 7;', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], (editor, viewModel, ds) => {
                const foldingController = ds.add(new foldingModel_1.$1qb());
                foldingController.attachViewModel(viewModel);
                assert.strictEqual(foldingController.regions.findRange(1), 0);
                assert.strictEqual(foldingController.regions.findRange(2), 0);
                assert.strictEqual(foldingController.regions.getEndLineNumber(0), 2);
                assert.strictEqual(foldingController.regions.findRange(3), 1);
                assert.strictEqual(foldingController.regions.findRange(4), 1);
                assert.strictEqual(foldingController.regions.findRange(5), 1);
                assert.strictEqual(foldingController.regions.getEndLineNumber(1), 7);
                assert.strictEqual(foldingController.regions.findRange(6), 2);
                assert.strictEqual(foldingController.regions.findRange(7), 2);
                assert.strictEqual(foldingController.regions.getEndLineNumber(2), 7);
            });
        });
        test('Folding', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 7;', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], (editor, viewModel, ds) => {
                const foldingModel = ds.add(new foldingModel_1.$1qb());
                foldingModel.attachViewModel(viewModel);
                (0, foldingModel_1.$2qb)(foldingModel, 0, true);
                viewModel.updateFoldingRanges(foldingModel.regions);
                assert.deepStrictEqual(viewModel.getHiddenRanges(), [
                    { start: 1, end: 6 }
                ]);
            });
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.1\n', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 7;', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], (editor, viewModel, ds) => {
                const foldingModel = ds.add(new foldingModel_1.$1qb());
                foldingModel.attachViewModel(viewModel);
                (0, foldingModel_1.$2qb)(foldingModel, 2, true);
                viewModel.updateFoldingRanges(foldingModel.regions);
                assert.deepStrictEqual(viewModel.getHiddenRanges(), [
                    { start: 3, end: 4 }
                ]);
            });
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['# header 2.1\n', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 7;', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], (editor, viewModel, ds) => {
                const foldingModel = ds.add(new foldingModel_1.$1qb());
                foldingModel.attachViewModel(viewModel);
                (0, foldingModel_1.$2qb)(foldingModel, 2, true);
                viewModel.updateFoldingRanges(foldingModel.regions);
                assert.deepStrictEqual(viewModel.getHiddenRanges(), [
                    { start: 3, end: 6 }
                ]);
            });
        });
        test('Nested Folding', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['# header 2.1\n', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 7;', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], (editor, viewModel, ds) => {
                const foldingModel = ds.add(new foldingModel_1.$1qb());
                foldingModel.attachViewModel(viewModel);
                (0, foldingModel_1.$2qb)(foldingModel, 0, true);
                viewModel.updateFoldingRanges(foldingModel.regions);
                assert.deepStrictEqual(viewModel.getHiddenRanges(), [
                    { start: 1, end: 1 }
                ]);
                (0, foldingModel_1.$2qb)(foldingModel, 5, true);
                (0, foldingModel_1.$2qb)(foldingModel, 2, true);
                viewModel.updateFoldingRanges(foldingModel.regions);
                assert.deepStrictEqual(viewModel.getHiddenRanges(), [
                    { start: 1, end: 1 },
                    { start: 3, end: 6 }
                ]);
                (0, foldingModel_1.$2qb)(foldingModel, 2, false);
                viewModel.updateFoldingRanges(foldingModel.regions);
                assert.deepStrictEqual(viewModel.getHiddenRanges(), [
                    { start: 1, end: 1 },
                    { start: 6, end: 6 }
                ]);
                // viewModel.insertCell(7, new TestCell(viewModel.viewType, 7, ['var c = 8;'], 'markdown', CellKind.Code, []), true);
                // assert.deepStrictEqual(viewModel.getHiddenRanges(), [
                // 	{ start: 1, end: 1 },
                // 	{ start: 6, end: 7 }
                // ]);
                // viewModel.insertCell(1, new TestCell(viewModel.viewType, 8, ['var c = 9;'], 'markdown', CellKind.Code, []), true);
                // assert.deepStrictEqual(viewModel.getHiddenRanges(), [
                // 	// the first collapsed range is now expanded as we insert content into it.
                // 	// { start: 1,},
                // 	{ start: 7, end: 8 }
                // ]);
            });
        });
        test('Folding Memento', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['# header 2.1\n', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 7;', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['# header 2.1\n', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 7;', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], (editor, viewModel, ds) => {
                const foldingModel = ds.add(new foldingModel_1.$1qb());
                foldingModel.attachViewModel(viewModel);
                foldingModel.applyMemento([{ start: 2, end: 6 }]);
                viewModel.updateFoldingRanges(foldingModel.regions);
                // Note that hidden ranges !== folding ranges
                assert.deepStrictEqual(viewModel.getHiddenRanges(), [
                    { start: 3, end: 6 }
                ]);
            });
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['# header 2.1\n', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 7;', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['# header 2.1\n', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 7;', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], (editor, viewModel, ds) => {
                const foldingModel = ds.add(new foldingModel_1.$1qb());
                foldingModel.attachViewModel(viewModel);
                foldingModel.applyMemento([
                    { start: 5, end: 6 },
                    { start: 10, end: 11 },
                ]);
                viewModel.updateFoldingRanges(foldingModel.regions);
                // Note that hidden ranges !== folding ranges
                assert.deepStrictEqual(viewModel.getHiddenRanges(), [
                    { start: 6, end: 6 },
                    { start: 11, end: 11 }
                ]);
            });
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['# header 2.1\n', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 7;', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['# header 2.1\n', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 7;', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], (editor, viewModel, ds) => {
                const foldingModel = ds.add(new foldingModel_1.$1qb());
                foldingModel.attachViewModel(viewModel);
                foldingModel.applyMemento([
                    { start: 5, end: 6 },
                    { start: 7, end: 11 },
                ]);
                viewModel.updateFoldingRanges(foldingModel.regions);
                // Note that hidden ranges !== folding ranges
                assert.deepStrictEqual(viewModel.getHiddenRanges(), [
                    { start: 6, end: 6 },
                    { start: 8, end: 11 }
                ]);
            });
        });
        test('View Index', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['# header 2.1\n', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 7;', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['# header 2.1\n', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 7;', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], (editor, viewModel, ds) => {
                const foldingModel = ds.add(new foldingModel_1.$1qb());
                foldingModel.attachViewModel(viewModel);
                foldingModel.applyMemento([{ start: 2, end: 6 }]);
                viewModel.updateFoldingRanges(foldingModel.regions);
                // Note that hidden ranges !== folding ranges
                assert.deepStrictEqual(viewModel.getHiddenRanges(), [
                    { start: 3, end: 6 }
                ]);
                assert.strictEqual(viewModel.getNextVisibleCellIndex(1), 2);
                assert.strictEqual(viewModel.getNextVisibleCellIndex(2), 7);
                assert.strictEqual(viewModel.getNextVisibleCellIndex(3), 7);
                assert.strictEqual(viewModel.getNextVisibleCellIndex(4), 7);
                assert.strictEqual(viewModel.getNextVisibleCellIndex(5), 7);
                assert.strictEqual(viewModel.getNextVisibleCellIndex(6), 7);
                assert.strictEqual(viewModel.getNextVisibleCellIndex(7), 8);
            });
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['# header 2.1\n', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 7;', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['# header 2.1\n', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['body 3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header 2.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 7;', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], (editor, viewModel, ds) => {
                const foldingModel = ds.add(new foldingModel_1.$1qb());
                foldingModel.attachViewModel(viewModel);
                foldingModel.applyMemento([
                    { start: 5, end: 6 },
                    { start: 10, end: 11 },
                ]);
                viewModel.updateFoldingRanges(foldingModel.regions);
                // Note that hidden ranges !== folding ranges
                assert.deepStrictEqual(viewModel.getHiddenRanges(), [
                    { start: 6, end: 6 },
                    { start: 11, end: 11 }
                ]);
                // folding ranges
                // [5, 6]
                // [10, 11]
                assert.strictEqual(viewModel.getNextVisibleCellIndex(4), 5);
                assert.strictEqual(viewModel.getNextVisibleCellIndex(5), 7);
                assert.strictEqual(viewModel.getNextVisibleCellIndex(6), 7);
                assert.strictEqual(viewModel.getNextVisibleCellIndex(9), 10);
                assert.strictEqual(viewModel.getNextVisibleCellIndex(10), 12);
                assert.strictEqual(viewModel.getNextVisibleCellIndex(11), 12);
            });
        });
    });
});
//# sourceMappingURL=notebookFolding.test.js.map