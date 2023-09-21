/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor", "vs/platform/theme/common/themeService", "vs/base/test/common/mock", "vs/base/common/event", "vs/workbench/services/editor/common/editorService", "vs/platform/markers/common/markers", "vs/platform/markers/common/markerService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/browser/contrib/outline/notebookOutline"], function (require, exports, assert, testNotebookEditor_1, themeService_1, mock_1, event_1, editorService_1, markers_1, markerService_1, notebookCommon_1, lifecycle_1, notebookOutline_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Notebook Outline', function () {
        let disposables;
        let instantiationService;
        suiteSetup(() => {
            disposables = new lifecycle_1.DisposableStore();
            instantiationService = (0, testNotebookEditor_1.setupInstantiationService)(disposables);
            instantiationService.set(editorService_1.IEditorService, new class extends (0, mock_1.mock)() {
            });
            instantiationService.set(markers_1.IMarkerService, new markerService_1.MarkerService());
            instantiationService.set(themeService_1.IThemeService, new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onDidFileIconThemeChange = event_1.Event.None;
                }
                getFileIconTheme() {
                    return { hasFileIcons: true, hasFolderIcons: true, hidesExplorerArrows: false };
                }
            });
        });
        suiteTeardown(() => disposables.dispose());
        function withNotebookOutline(cells, callback) {
            return (0, testNotebookEditor_1.withTestNotebook)(cells, (editor) => {
                if (!editor.hasModel()) {
                    assert.ok(false, 'MUST have active text editor');
                }
                const outline = instantiationService.createInstance(notebookOutline_1.NotebookCellOutline, new class extends (0, mock_1.mock)() {
                    constructor() {
                        super(...arguments);
                        this.onDidChangeModel = event_1.Event.None;
                    }
                    getControl() {
                        return editor;
                    }
                }, 1 /* OutlineTarget.OutlinePane */);
                return callback(outline, editor);
            });
        }
        test('basic', async function () {
            await withNotebookOutline([], outline => {
                assert.ok(outline instanceof notebookOutline_1.NotebookCellOutline);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements(), []);
            });
        });
        test('special characters in heading', async function () {
            await withNotebookOutline([
                ['# Hellö & Hällo', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.NotebookCellOutline);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, 'Hellö & Hällo');
            });
            await withNotebookOutline([
                ['# bo<i>ld</i>', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.NotebookCellOutline);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, 'bold');
            });
        });
        test('Notebook falsely detects "empty cells"', async function () {
            await withNotebookOutline([
                ['  的时代   ', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.NotebookCellOutline);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, '的时代');
            });
            await withNotebookOutline([
                ['   ', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.NotebookCellOutline);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, 'empty cell');
            });
            await withNotebookOutline([
                ['+++++[]{}--)(0  ', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.NotebookCellOutline);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, '+++++[]{}--)(0');
            });
            await withNotebookOutline([
                ['+++++[]{}--)(0 Hello **&^ ', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.NotebookCellOutline);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, '+++++[]{}--)(0 Hello **&^');
            });
            await withNotebookOutline([
                ['!@#$\n Überschrïft', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.NotebookCellOutline);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, '!@#$');
            });
        });
        test('Heading text defines entry label', async function () {
            return await withNotebookOutline([
                ['foo\n # h1', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.NotebookCellOutline);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, 'h1');
            });
        });
        test('Notebook outline ignores markdown headings #115200', async function () {
            await withNotebookOutline([
                ['## h2 \n# h1', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.NotebookCellOutline);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 2);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, 'h2');
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[1].label, 'h1');
            });
            await withNotebookOutline([
                ['## h2', 'md', notebookCommon_1.CellKind.Markup],
                ['# h1', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.NotebookCellOutline);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 2);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, 'h2');
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[1].label, 'h1');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tPdXRsaW5lLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay90ZXN0L2Jyb3dzZXIvY29udHJpYi9ub3RlYm9va091dGxpbmUudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWlCaEcsS0FBSyxDQUFDLGtCQUFrQixFQUFFO1FBRXpCLElBQUksV0FBNEIsQ0FBQztRQUNqQyxJQUFJLG9CQUE4QyxDQUFDO1FBRW5ELFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZixXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDcEMsb0JBQW9CLEdBQUcsSUFBQSw4Q0FBeUIsRUFBQyxXQUFXLENBQUMsQ0FBQztZQUM5RCxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsOEJBQWMsRUFBRSxJQUFJLEtBQU0sU0FBUSxJQUFBLFdBQUksR0FBa0I7YUFBSSxDQUFDLENBQUM7WUFDdkYsb0JBQW9CLENBQUMsR0FBRyxDQUFDLHdCQUFjLEVBQUUsSUFBSSw2QkFBYSxFQUFFLENBQUMsQ0FBQztZQUM5RCxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsNEJBQWEsRUFBRSxJQUFJLEtBQU0sU0FBUSxJQUFBLFdBQUksR0FBaUI7Z0JBQW5DOztvQkFDbEMsNkJBQXdCLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQztnQkFJaEQsQ0FBQztnQkFIUyxnQkFBZ0I7b0JBQ3hCLE9BQU8sRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxFQUFFLENBQUM7Z0JBQ2pGLENBQUM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztRQUVILGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUUzQyxTQUFT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