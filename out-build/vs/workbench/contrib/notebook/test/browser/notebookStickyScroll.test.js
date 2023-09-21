/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/test/common/mock", "vs/base/test/common/snapshot", "vs/base/test/common/utils", "vs/workbench/contrib/notebook/browser/contrib/outline/notebookOutline", "vs/workbench/contrib/notebook/browser/viewParts/notebookEditorStickyScroll", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor"], function (require, exports, assert, event_1, lifecycle_1, platform_1, mock_1, snapshot_1, utils_1, notebookOutline_1, notebookEditorStickyScroll_1, notebookCommon_1, testNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (platform_1.$o ? suite.skip : suite)('NotebookEditorStickyScroll', () => {
        let disposables;
        let instantiationService;
        const domNode = document.createElement('div');
        teardown(() => {
            disposables.dispose();
        });
        (0, utils_1.$bT)();
        setup(() => {
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, testNotebookEditor_1.$Ifc)(disposables);
        });
        function getOutline(editor) {
            if (!editor.hasModel()) {
                assert.ok(false, 'MUST have active text editor');
            }
            const outline = instantiationService.createInstance(notebookOutline_1.$tFb, new class extends (0, mock_1.$rT)() {
                constructor() {
                    super(...arguments);
                    this.onDidChangeModel = event_1.Event.None;
                }
                getControl() {
                    return editor;
                }
            }, 4 /* OutlineTarget.QuickPick */);
            return outline;
        }
        function nbStickyTestHelper(domNode, notebookEditor, notebookCellList, notebookOutlineEntries, disposables) {
            const output = (0, notebookEditorStickyScroll_1.$Arb)(domNode, notebookEditor, notebookCellList, notebookOutlineEntries);
            for (const stickyLine of output.values()) {
                disposables.add(stickyLine.line);
            }
            return createStickyTestElement(output.values());
        }
        function createStickyTestElement(stickyLines) {
            const outputElements = [];
            for (const stickyLine of stickyLines) {
                if (stickyLine.rendered) {
                    outputElements.unshift(stickyLine.line.element.innerText);
                }
            }
            return outputElements;
        }
        test('test0: should render empty, 	scrollTop at 0', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header aa', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var c = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel) => {
                viewModel.restoreEditorViewState({
                    editingCells: Array.from({ length: 8 }, () => false),
                    editorViewStates: Array.from({ length: 8 }, () => null),
                    cellTotalHeights: Array.from({ length: 8 }, () => 50),
                    cellLineNumberStates: {},
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                });
                const cellList = disposables.add((0, testNotebookEditor_1.$Mfc)(instantiationService, disposables));
                cellList.attachViewModel(viewModel);
                cellList.layout(400, 100);
                editor.setScrollTop(0);
                editor.visibleRanges = [{ start: 0, end: 8 }];
                const outline = getOutline(editor);
                const notebookOutlineEntries = outline.entries;
                const resultingMap = nbStickyTestHelper(domNode, editor, cellList, notebookOutlineEntries, disposables);
                await (0, snapshot_1.$wT)(resultingMap);
                outline.dispose();
            });
        });
        test('test1: should render 0->1, 	visible range 3->8', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header aa', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var c = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}] // 350
            ], async (editor, viewModel, ds) => {
                viewModel.restoreEditorViewState({
                    editingCells: Array.from({ length: 8 }, () => false),
                    editorViewStates: Array.from({ length: 8 }, () => null),
                    cellTotalHeights: Array.from({ length: 8 }, () => 50),
                    cellLineNumberStates: {},
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                });
                const cellList = ds.add((0, testNotebookEditor_1.$Mfc)(instantiationService, ds));
                cellList.attachViewModel(viewModel);
                cellList.layout(400, 100);
                editor.setScrollTop(175);
                editor.visibleRanges = [{ start: 3, end: 8 }];
                const outline = getOutline(editor);
                const notebookOutlineEntries = outline.entries;
                const resultingMap = nbStickyTestHelper(domNode, editor, cellList, notebookOutlineEntries, ds);
                await (0, snapshot_1.$wT)(resultingMap);
                outline.dispose();
            });
        });
        test('test2: should render 0, 		visible range 6->9 so collapsing next 2 against following section', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header aa', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['### header aaa', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var c = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}] // 400
            ], async (editor, viewModel, ds) => {
                viewModel.restoreEditorViewState({
                    editingCells: Array.from({ length: 9 }, () => false),
                    editorViewStates: Array.from({ length: 9 }, () => null),
                    cellTotalHeights: Array.from({ length: 9 }, () => 50),
                    cellLineNumberStates: {},
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                });
                const cellList = ds.add((0, testNotebookEditor_1.$Mfc)(instantiationService, ds));
                cellList.attachViewModel(viewModel);
                cellList.layout(400, 100);
                editor.setScrollTop(325); // room for a single header
                editor.visibleRanges = [{ start: 6, end: 9 }];
                const outline = getOutline(editor);
                const notebookOutlineEntries = outline.entries;
                const resultingMap = nbStickyTestHelper(domNode, editor, cellList, notebookOutlineEntries, ds);
                await (0, snapshot_1.$wT)(resultingMap);
                outline.dispose();
            });
        });
        test('test3: should render 0->1, 	collapsing against equivalent level header', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header aa', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['### header aaa', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['### header aab', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var c = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}] // 450
            ], async (editor, viewModel, ds) => {
                viewModel.restoreEditorViewState({
                    editingCells: Array.from({ length: 10 }, () => false),
                    editorViewStates: Array.from({ length: 10 }, () => null),
                    cellTotalHeights: Array.from({ length: 10 }, () => 50),
                    cellLineNumberStates: {},
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                });
                const cellList = ds.add((0, testNotebookEditor_1.$Mfc)(instantiationService, ds));
                cellList.attachViewModel(viewModel);
                cellList.layout(400, 100);
                editor.setScrollTop(175); // room for a single header
                editor.visibleRanges = [{ start: 3, end: 10 }];
                const outline = getOutline(editor);
                const notebookOutlineEntries = outline.entries;
                const resultingMap = nbStickyTestHelper(domNode, editor, cellList, notebookOutlineEntries, ds);
                await (0, snapshot_1.$wT)(resultingMap);
                outline.dispose();
            });
        });
        // outdated/improper behavior
        test.skip('test4: should render 0, 		scrolltop halfway through cell 0', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header aa', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var c = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel, ds) => {
                viewModel.restoreEditorViewState({
                    editingCells: Array.from({ length: 8 }, () => false),
                    editorViewStates: Array.from({ length: 8 }, () => null),
                    cellTotalHeights: Array.from({ length: 8 }, () => 50),
                    cellLineNumberStates: {},
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                });
                const cellList = ds.add((0, testNotebookEditor_1.$Mfc)(instantiationService, ds));
                cellList.attachViewModel(viewModel);
                cellList.layout(400, 100);
                editor.setScrollTop(50);
                editor.visibleRanges = [{ start: 0, end: 8 }];
                const outline = getOutline(editor);
                const notebookOutlineEntries = outline.entries;
                const resultingMap = nbStickyTestHelper(domNode, editor, cellList, notebookOutlineEntries, ds);
                await (0, snapshot_1.$wT)(resultingMap);
                outline.dispose();
            });
        });
        // outdated/improper behavior
        test.skip('test5: should render 0->2, 	scrolltop halfway through cell 2', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header aa', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['### header aaa', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['#### header aaaa', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var c = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel, ds) => {
                viewModel.restoreEditorViewState({
                    editingCells: Array.from({ length: 10 }, () => false),
                    editorViewStates: Array.from({ length: 10 }, () => null),
                    cellTotalHeights: Array.from({ length: 10 }, () => 50),
                    cellLineNumberStates: {},
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                });
                const cellList = ds.add((0, testNotebookEditor_1.$Mfc)(instantiationService, ds));
                cellList.attachViewModel(viewModel);
                cellList.layout(400, 100);
                editor.setScrollTop(125);
                editor.visibleRanges = [{ start: 2, end: 10 }];
                const outline = getOutline(editor);
                const notebookOutlineEntries = outline.entries;
                const resultingMap = nbStickyTestHelper(domNode, editor, cellList, notebookOutlineEntries, ds);
                await (0, snapshot_1.$wT)(resultingMap);
                outline.dispose();
            });
        });
        // outdated/improper behavior
        test.skip('test6: should render 6->7, 	scrolltop halfway through cell 7', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header aa', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header bb', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['### header bbb', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var c = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel, ds) => {
                viewModel.restoreEditorViewState({
                    editingCells: Array.from({ length: 10 }, () => false),
                    editorViewStates: Array.from({ length: 10 }, () => null),
                    cellTotalHeights: Array.from({ length: 10 }, () => 50),
                    cellLineNumberStates: {},
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                });
                const cellList = ds.add((0, testNotebookEditor_1.$Mfc)(instantiationService, ds));
                cellList.attachViewModel(viewModel);
                cellList.layout(400, 100);
                editor.setScrollTop(375);
                editor.visibleRanges = [{ start: 7, end: 10 }];
                const outline = getOutline(editor);
                const notebookOutlineEntries = outline.entries;
                const resultingMap = nbStickyTestHelper(domNode, editor, cellList, notebookOutlineEntries, ds);
                await (0, snapshot_1.$wT)(resultingMap);
                outline.dispose();
            });
        });
        // waiting on behavior push to fix this.
        test('test7: should render 0->1, 	collapsing against next section', async function () {
            await (0, testNotebookEditor_1.$Lfc)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header aa', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['### header aaa', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['#### header aaaa', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['## header bb', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['### header bbb', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['var c = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, viewModel, ds) => {
                viewModel.restoreEditorViewState({
                    editingCells: Array.from({ length: 12 }, () => false),
                    editorViewStates: Array.from({ length: 12 }, () => null),
                    cellTotalHeights: Array.from({ length: 12 }, () => 50),
                    cellLineNumberStates: {},
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                });
                const cellList = ds.add((0, testNotebookEditor_1.$Mfc)(instantiationService, ds));
                cellList.attachViewModel(viewModel);
                cellList.layout(400, 100);
                editor.setScrollTop(350);
                editor.visibleRanges = [{ start: 7, end: 12 }];
                const outline = getOutline(editor);
                const notebookOutlineEntries = outline.entries;
                const resultingMap = nbStickyTestHelper(domNode, editor, cellList, notebookOutlineEntries, ds);
                await (0, snapshot_1.$wT)(resultingMap);
                outline.dispose();
            });
        });
    });
});
//# sourceMappingURL=notebookStickyScroll.test.js.map