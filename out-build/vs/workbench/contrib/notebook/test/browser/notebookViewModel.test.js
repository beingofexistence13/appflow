/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/browser/services/bulkEditService", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/resolverService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/notebook/browser/controller/cellOperations", "vs/workbench/contrib/notebook/browser/viewModel/eventDispatcher", "vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl", "vs/workbench/contrib/notebook/browser/viewModel/viewContext", "vs/workbench/contrib/notebook/common/model/notebookTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/browser/notebookOptions", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/base/test/common/utils"], function (require, exports, assert, lifecycle_1, uri_1, bulkEditService_1, model_1, language_1, resolverService_1, configuration_1, testConfigurationService_1, themeService_1, testThemeService_1, undoRedo_1, cellOperations_1, eventDispatcher_1, notebookViewModelImpl_1, viewContext_1, notebookTextModel_1, notebookCommon_1, notebookOptions_1, testNotebookEditor_1, notebookExecutionStateService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookViewModel', () => {
        (0, utils_1.$bT)();
        let disposables;
        let instantiationService;
        let textModelService;
        let bulkEditService;
        let undoRedoService;
        let modelService;
        let languageService;
        let notebookExecutionStateService;
        suiteSetup(() => {
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, testNotebookEditor_1.$Ifc)(disposables);
            textModelService = instantiationService.get(resolverService_1.$uA);
            bulkEditService = instantiationService.get(bulkEditService_1.$n1);
            undoRedoService = instantiationService.get(undoRedo_1.$wu);
            modelService = instantiationService.get(model_1.$yA);
            languageService = instantiationService.get(language_1.$ct);
            notebookExecutionStateService = instantiationService.get(notebookExecutionStateService_1.$_H);
            instantiationService.stub(configuration_1.$8h, new testConfigurationService_1.$G0b());
            instantiationService.stub(themeService_1.$gv, new testThemeService_1.$K0b());
        });
        suiteTeardown(() => disposables.dispose());
        test('ctor', function () {
            const notebook = new notebookTextModel_1.$MH('notebook', uri_1.URI.parse('test'), [], {}, { transientCellMetadata: {}, transientDocumentMetadata: {}, transientOutputs: false, cellContentMetadata: {} }, undoRedoService, modelService, languageService);
            const model = new testNotebookEditor_1.$Hfc(notebook);
            const options = new notebookOptions_1.$Gbb(instantiationService.get(configuration_1.$8h), instantiationService.get(notebookExecutionStateService_1.$_H), false);
            const eventDispatcher = new eventDispatcher_1.$Lnb();
            const viewContext = new viewContext_1.$Mnb(options, eventDispatcher, () => ({}));
            const viewModel = new notebookViewModelImpl_1.$zob('notebook', model.notebook, viewContext, null, { isReadOnly: false }, instantiationService, bulkEditService, undoRedoService, textModelService, notebookExecutionStateService);
            assert.strictEqual(viewModel.viewType, 'notebook');
            notebook.dispose();
            model.dispose();
            options.dispose();
            eventDispatcher.dispose();
            viewModel.dispose();
        });
        test('insert/delete', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor, viewModel) => {
                const cell = (0, cellOperations_1.$6pb)(viewModel, 1, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                assert.strictEqual(viewModel.length, 3);
                assert.strictEqual(viewModel.notebookDocument.cells.length, 3);
                assert.strictEqual(viewModel.getCellIndex(cell), 1);
                (0, cellOperations_1.$Xpb)(editor, viewModel.cellAt(1));
                assert.strictEqual(viewModel.length, 2);
                assert.strictEqual(viewModel.notebookDocument.cells.length, 2);
                assert.strictEqual(viewModel.getCellIndex(cell), -1);
                cell.dispose();
                cell.model.dispose();
            });
        });
        test('index', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor, viewModel) => {
                const firstViewCell = viewModel.cellAt(0);
                const lastViewCell = viewModel.cellAt(viewModel.length - 1);
                const insertIndex = viewModel.getCellIndex(firstViewCell) + 1;
                const cell = (0, cellOperations_1.$6pb)(viewModel, insertIndex, 'var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                const addedCellIndex = viewModel.getCellIndex(cell);
                (0, cellOperations_1.$Xpb)(editor, viewModel.cellAt(addedCellIndex));
                const secondInsertIndex = viewModel.getCellIndex(lastViewCell) + 1;
                const cell2 = (0, cellOperations_1.$6pb)(viewModel, secondInsertIndex, 'var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                assert.strictEqual(viewModel.length, 3);
                assert.strictEqual(viewModel.notebookDocument.cells.length, 3);
                assert.strictEqual(viewModel.getCellIndex(cell2), 2);
                cell.dispose();
                cell.model.dispose();
                cell2.dispose();
                cell2.model.dispose();
            });
        });
    });
    function getVisibleCells(cells, hiddenRanges) {
        if (!hiddenRanges.length) {
            return cells;
        }
        let start = 0;
        let hiddenRangeIndex = 0;
        const result = [];
        while (start < cells.length && hiddenRangeIndex < hiddenRanges.length) {
            if (start < hiddenRanges[hiddenRangeIndex].start) {
                result.push(...cells.slice(start, hiddenRanges[hiddenRangeIndex].start));
            }
            start = hiddenRanges[hiddenRangeIndex].end + 1;
            hiddenRangeIndex++;
        }
        if (start < cells.length) {
            result.push(...cells.slice(start));
        }
        return result;
    }
    suite('NotebookViewModel Decorations', () => {
        (0, utils_1.$bT)();
        test('tracking range', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor, viewModel) => {
                const trackedId = viewModel.setTrackedRange('test', { start: 1, end: 2 }, 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 2,
                });
                const cell1 = (0, cellOperations_1.$6pb)(viewModel, 0, 'var d = 6;', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 2,
                    end: 3
                });
                (0, cellOperations_1.$Xpb)(editor, viewModel.cellAt(0));
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 2
                });
                const cell2 = (0, cellOperations_1.$6pb)(viewModel, 3, 'var d = 7;', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 3
                });
                (0, cellOperations_1.$Xpb)(editor, viewModel.cellAt(3));
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 2
                });
                (0, cellOperations_1.$Xpb)(editor, viewModel.cellAt(1));
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 0,
                    end: 1
                });
                cell1.dispose();
                cell1.model.dispose();
                cell2.dispose();
                cell2.model.dispose();
            });
        });
        test('tracking range 2', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 6;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 7;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor, viewModel) => {
                const trackedId = viewModel.setTrackedRange('test', { start: 1, end: 3 }, 3 /* TrackedRangeStickiness.GrowsOnlyWhenTypingAfter */);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 3
                });
                (0, cellOperations_1.$6pb)(viewModel, 5, 'var d = 9;', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 3
                });
                (0, cellOperations_1.$6pb)(viewModel, 4, 'var d = 10;', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 4
                });
            });
        });
        test('diff hidden ranges', async function () {
            assert.deepStrictEqual(getVisibleCells([1, 2, 3, 4, 5], []), [1, 2, 3, 4, 5]);
            assert.deepStrictEqual(getVisibleCells([1, 2, 3, 4, 5], [{ start: 1, end: 2 }]), [1, 4, 5]);
            assert.deepStrictEqual(getVisibleCells([1, 2, 3, 4, 5, 6, 7, 8, 9], [
                { start: 1, end: 2 },
                { start: 4, end: 5 }
            ]), [1, 4, 7, 8, 9]);
            const original = getVisibleCells([1, 2, 3, 4, 5, 6, 7, 8, 9], [
                { start: 1, end: 2 },
                { start: 4, end: 5 }
            ]);
            const modified = getVisibleCells([1, 2, 3, 4, 5, 6, 7, 8, 9], [
                { start: 2, end: 4 }
            ]);
            assert.deepStrictEqual((0, notebookCommon_1.$2H)(original, modified, (a) => {
                return original.indexOf(a) >= 0;
            }), [{ start: 1, deleteCount: 1, toInsert: [2, 6] }]);
        });
    });
    suite('NotebookViewModel API', () => {
        (0, utils_1.$bT)();
        test('#115432, get nearest code cell', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['b = 2;', 'python', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header d', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var e = 4;', 'TypeScript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header f', 'markdown', notebookCommon_1.CellKind.Markup, [], {}]
            ], (editor, viewModel) => {
                assert.strictEqual(viewModel.nearestCodeCellIndex(0), 1);
                // find the nearest code cell from above
                assert.strictEqual(viewModel.nearestCodeCellIndex(2), 1);
                assert.strictEqual(viewModel.nearestCodeCellIndex(4), 3);
                assert.strictEqual(viewModel.nearestCodeCellIndex(5), 4);
                assert.strictEqual(viewModel.nearestCodeCellIndex(6), 4);
            });
        });
        test('#108464, get nearest code cell', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}]
            ], (editor, viewModel) => {
                assert.strictEqual(viewModel.nearestCodeCellIndex(2), 1);
            });
        });
        test('getCells', async () => {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}]
            ], (editor, viewModel) => {
                assert.strictEqual(viewModel.getCellsInRange().length, 3);
                assert.deepStrictEqual(viewModel.getCellsInRange({ start: 0, end: 1 }).map(cell => cell.getText()), ['# header a']);
                assert.deepStrictEqual(viewModel.getCellsInRange({ start: 0, end: 2 }).map(cell => cell.getText()), ['# header a', 'var b = 1;']);
                assert.deepStrictEqual(viewModel.getCellsInRange({ start: 0, end: 3 }).map(cell => cell.getText()), ['# header a', 'var b = 1;', '# header b']);
                assert.deepStrictEqual(viewModel.getCellsInRange({ start: 0, end: 4 }).map(cell => cell.getText()), ['# header a', 'var b = 1;', '# header b']);
                assert.deepStrictEqual(viewModel.getCellsInRange({ start: 1, end: 4 }).map(cell => cell.getText()), ['var b = 1;', '# header b']);
                assert.deepStrictEqual(viewModel.getCellsInRange({ start: 2, end: 4 }).map(cell => cell.getText()), ['# header b']);
                assert.deepStrictEqual(viewModel.getCellsInRange({ start: 3, end: 4 }).map(cell => cell.getText()), []);
                // no one should use an invalid range but `getCells` should be able to handle that.
                assert.deepStrictEqual(viewModel.getCellsInRange({ start: -1, end: 1 }).map(cell => cell.getText()), ['# header a']);
                assert.deepStrictEqual(viewModel.getCellsInRange({ start: 3, end: 0 }).map(cell => cell.getText()), ['# header a', 'var b = 1;', '# header b']);
            });
        });
    });
});
//# sourceMappingURL=notebookViewModel.test.js.map