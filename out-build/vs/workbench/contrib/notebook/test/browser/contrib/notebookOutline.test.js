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
            disposables = new lifecycle_1.$jc();
            instantiationService = (0, testNotebookEditor_1.$Ifc)(disposables);
            instantiationService.set(editorService_1.$9C, new class extends (0, mock_1.$rT)() {
            });
            instantiationService.set(markers_1.$3s, new markerService_1.$MBb());
            instantiationService.set(themeService_1.$gv, new class extends (0, mock_1.$rT)() {
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
            return (0, testNotebookEditor_1.$Lfc)(cells, (editor) => {
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
                }, 1 /* OutlineTarget.OutlinePane */);
                return callback(outline, editor);
            });
        }
        test('basic', async function () {
            await withNotebookOutline([], outline => {
                assert.ok(outline instanceof notebookOutline_1.$tFb);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements(), []);
            });
        });
        test('special characters in heading', async function () {
            await withNotebookOutline([
                ['# Hellö & Hällo', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.$tFb);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, 'Hellö & Hällo');
            });
            await withNotebookOutline([
                ['# bo<i>ld</i>', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.$tFb);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, 'bold');
            });
        });
        test('Notebook falsely detects "empty cells"', async function () {
            await withNotebookOutline([
                ['  的时代   ', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.$tFb);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, '的时代');
            });
            await withNotebookOutline([
                ['   ', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.$tFb);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, 'empty cell');
            });
            await withNotebookOutline([
                ['+++++[]{}--)(0  ', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.$tFb);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, '+++++[]{}--)(0');
            });
            await withNotebookOutline([
                ['+++++[]{}--)(0 Hello **&^ ', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.$tFb);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, '+++++[]{}--)(0 Hello **&^');
            });
            await withNotebookOutline([
                ['!@#$\n Überschrïft', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.$tFb);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, '!@#$');
            });
        });
        test('Heading text defines entry label', async function () {
            return await withNotebookOutline([
                ['foo\n # h1', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.$tFb);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, 'h1');
            });
        });
        test('Notebook outline ignores markdown headings #115200', async function () {
            await withNotebookOutline([
                ['## h2 \n# h1', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.$tFb);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 2);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, 'h2');
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[1].label, 'h1');
            });
            await withNotebookOutline([
                ['## h2', 'md', notebookCommon_1.CellKind.Markup],
                ['# h1', 'md', notebookCommon_1.CellKind.Markup]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.$tFb);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 2);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, 'h2');
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[1].label, 'h1');
            });
        });
    });
});
//# sourceMappingURL=notebookOutline.test.js.map