/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/core/range", "vs/editor/common/model", "vs/editor/common/core/wordHelper", "vs/editor/common/languages/language", "vs/editor/contrib/find/browser/findState", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/contrib/notebook/browser/contrib/find/findModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/browser/testNotebookEditor"], function (require, exports, assert, range_1, model_1, wordHelper_1, language_1, findState_1, configuration_1, testConfigurationService_1, findModel_1, notebookCommon_1, testNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Notebook Find', () => {
        const configurationValue = {
            value: wordHelper_1.USUAL_WORD_SEPARATORS
        };
        const configurationService = new class extends testConfigurationService_1.TestConfigurationService {
            inspect() {
                return configurationValue;
            }
        }();
        const setupEditorForTest = (editor, viewModel) => {
            editor.changeModelDecorations = (callback) => {
                return callback({
                    deltaDecorations: (oldDecorations, newDecorations) => {
                        const ret = [];
                        newDecorations.forEach(dec => {
                            const cell = viewModel.viewCells.find(cell => cell.handle === dec.ownerId);
                            const decorations = cell?.deltaModelDecorations([], dec.decorations) ?? [];
                            if (decorations.length > 0) {
                                ret.push({ ownerId: dec.ownerId, decorations: decorations });
                            }
                        });
                        return ret;
                    }
                });
            };
        };
        test('Update find matches basics', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['paragraph 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['paragraph 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], async (editor, viewModel, _ds, accessor) => {
                accessor.stub(configuration_1.IConfigurationService, configurationService);
                const state = new findState_1.FindReplaceState();
                const model = new findModel_1.FindModel(editor, state, accessor.get(configuration_1.IConfigurationService));
                const found = new Promise(resolve => state.onFindReplaceStateChange(e => {
                    if (e.matchesCount) {
                        resolve(true);
                    }
                }));
                state.change({ isRevealed: true }, true);
                state.change({ searchString: '1' }, true);
                await found;
                assert.strictEqual(model.findMatches.length, 2);
                assert.strictEqual(model.currentMatch, 0);
                model.find({ previous: false });
                assert.strictEqual(model.currentMatch, 1);
                model.find({ previous: false });
                assert.strictEqual(model.currentMatch, 0);
                model.find({ previous: false });
                assert.strictEqual(model.currentMatch, 1);
                assert.strictEqual(editor.textModel.length, 3);
                const found2 = new Promise(resolve => state.onFindReplaceStateChange(e => {
                    if (e.matchesCount) {
                        resolve(true);
                    }
                }));
                editor.textModel.applyEdits([{
                        editType: 1 /* CellEditType.Replace */, index: 3, count: 0, cells: [
                            new testNotebookEditor_1.TestCell(viewModel.viewType, 3, '# next paragraph 1', 'markdown', notebookCommon_1.CellKind.Code, [], accessor.get(language_1.ILanguageService)),
                        ]
                    }], true, undefined, () => undefined, undefined, true);
                await found2;
                assert.strictEqual(editor.textModel.length, 4);
                assert.strictEqual(model.findMatches.length, 3);
                assert.strictEqual(model.currentMatch, 1);
            });
        });
        test('Update find matches basics 2', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['paragraph 1.1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['paragraph 1.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['paragraph 1.3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['paragraph 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], async (editor, viewModel, _ds, accessor) => {
                setupEditorForTest(editor, viewModel);
                accessor.stub(configuration_1.IConfigurationService, configurationService);
                const state = new findState_1.FindReplaceState();
                const model = new findModel_1.FindModel(editor, state, accessor.get(configuration_1.IConfigurationService));
                const found = new Promise(resolve => state.onFindReplaceStateChange(e => {
                    if (e.matchesCount) {
                        resolve(true);
                    }
                }));
                state.change({ isRevealed: true }, true);
                state.change({ searchString: '1' }, true);
                await found;
                // find matches is not necessarily find results
                assert.strictEqual(model.findMatches.length, 4);
                assert.strictEqual(model.currentMatch, 0);
                model.find({ previous: false });
                assert.strictEqual(model.currentMatch, 1);
                model.find({ previous: false });
                assert.strictEqual(model.currentMatch, 2);
                model.find({ previous: false });
                assert.strictEqual(model.currentMatch, 3);
                const found2 = new Promise(resolve => state.onFindReplaceStateChange(e => {
                    if (e.matchesCount) {
                        resolve(true);
                    }
                }));
                editor.textModel.applyEdits([{
                        editType: 1 /* CellEditType.Replace */, index: 2, count: 1, cells: []
                    }], true, undefined, () => undefined, undefined, true);
                await found2;
                assert.strictEqual(model.findMatches.length, 3);
                assert.strictEqual(model.currentMatch, 0);
                model.find({ previous: true });
                assert.strictEqual(model.currentMatch, 3);
                model.find({ previous: false });
                assert.strictEqual(model.currentMatch, 0);
                model.find({ previous: false });
                assert.strictEqual(model.currentMatch, 1);
                model.find({ previous: false });
                assert.strictEqual(model.currentMatch, 2);
            });
        });
        test('Update find matches basics 3', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['paragraph 1.1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['paragraph 1.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['paragraph 1.3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['paragraph 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], async (editor, viewModel, _ds, accessor) => {
                setupEditorForTest(editor, viewModel);
                accessor.stub(configuration_1.IConfigurationService, configurationService);
                const state = new findState_1.FindReplaceState();
                const model = new findModel_1.FindModel(editor, state, accessor.get(configuration_1.IConfigurationService));
                const found = new Promise(resolve => state.onFindReplaceStateChange(e => {
                    if (e.matchesCount) {
                        resolve(true);
                    }
                }));
                state.change({ isRevealed: true }, true);
                state.change({ searchString: '1' }, true);
                await found;
                // find matches is not necessarily find results
                assert.strictEqual(model.findMatches.length, 4);
                assert.strictEqual(model.currentMatch, 0);
                model.find({ previous: true });
                assert.strictEqual(model.currentMatch, 4);
                const found2 = new Promise(resolve => state.onFindReplaceStateChange(e => {
                    if (e.matchesCount) {
                        resolve(true);
                    }
                }));
                editor.textModel.applyEdits([{
                        editType: 1 /* CellEditType.Replace */, index: 2, count: 1, cells: []
                    }], true, undefined, () => undefined, undefined, true);
                await found2;
                assert.strictEqual(model.findMatches.length, 3);
                assert.strictEqual(model.currentMatch, 0);
                model.find({ previous: true });
                assert.strictEqual(model.currentMatch, 3);
                model.find({ previous: true });
                assert.strictEqual(model.currentMatch, 2);
            });
        });
        test('Update find matches, #112748', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['paragraph 1.1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['paragraph 1.2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['paragraph 1.3', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['paragraph 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], async (editor, viewModel, _ds, accessor) => {
                setupEditorForTest(editor, viewModel);
                accessor.stub(configuration_1.IConfigurationService, configurationService);
                const state = new findState_1.FindReplaceState();
                const model = new findModel_1.FindModel(editor, state, accessor.get(configuration_1.IConfigurationService));
                const found = new Promise(resolve => state.onFindReplaceStateChange(e => {
                    if (e.matchesCount) {
                        resolve(true);
                    }
                }));
                state.change({ isRevealed: true }, true);
                state.change({ searchString: '1' }, true);
                await found;
                // find matches is not necessarily find results
                assert.strictEqual(model.findMatches.length, 4);
                assert.strictEqual(model.currentMatch, 0);
                model.find({ previous: false });
                model.find({ previous: false });
                model.find({ previous: false });
                assert.strictEqual(model.currentMatch, 3);
                const found2 = new Promise(resolve => state.onFindReplaceStateChange(e => {
                    if (e.matchesCount) {
                        resolve(true);
                    }
                }));
                viewModel.viewCells[1].textBuffer.applyEdits([
                    new model_1.ValidAnnotatedEditOperation(null, new range_1.Range(1, 1, 1, 14), '', false, false, false)
                ], false, true);
                // cell content updates, recompute
                model.research();
                await found2;
                assert.strictEqual(model.currentMatch, 1);
            });
        });
        test('Reset when match not found, #127198', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['paragraph 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['paragraph 2', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
            ], async (editor, viewModel, _ds, accessor) => {
                accessor.stub(configuration_1.IConfigurationService, configurationService);
                const state = new findState_1.FindReplaceState();
                const model = new findModel_1.FindModel(editor, state, accessor.get(configuration_1.IConfigurationService));
                const found = new Promise(resolve => state.onFindReplaceStateChange(e => {
                    if (e.matchesCount) {
                        resolve(true);
                    }
                }));
                state.change({ isRevealed: true }, true);
                state.change({ searchString: '1' }, true);
                await found;
                assert.strictEqual(model.findMatches.length, 2);
                assert.strictEqual(model.currentMatch, 0);
                model.find({ previous: false });
                assert.strictEqual(model.currentMatch, 1);
                model.find({ previous: false });
                assert.strictEqual(model.currentMatch, 0);
                model.find({ previous: false });
                assert.strictEqual(model.currentMatch, 1);
                assert.strictEqual(editor.textModel.length, 3);
                const found2 = new Promise(resolve => state.onFindReplaceStateChange(e => {
                    if (e.matchesCount) {
                        resolve(true);
                    }
                }));
                state.change({ searchString: '3' }, true);
                await found2;
                assert.strictEqual(model.currentMatch, -1);
                assert.strictEqual(model.findMatches.length, 0);
            });
        });
        test('CellFindMatchModel', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header 1', 'markdown', notebookCommon_1.CellKind.Markup, [], {}],
                ['print(1)', 'typescript', notebookCommon_1.CellKind.Code, [], {}],
            ], async (editor) => {
                const mdCell = editor.cellAt(0);
                const mdModel = new findModel_1.CellFindMatchModel(mdCell, 0, [], []);
                assert.strictEqual(mdModel.length, 0);
                mdModel.contentMatches.push(new model_1.FindMatch(new range_1.Range(1, 1, 1, 2), []));
                assert.strictEqual(mdModel.length, 1);
                mdModel.webviewMatches.push({
                    index: 0,
                    searchPreviewInfo: {
                        line: '',
                        range: {
                            start: 0,
                            end: 0,
                        }
                    }
                }, {
                    index: 1,
                    searchPreviewInfo: {
                        line: '',
                        range: {
                            start: 0,
                            end: 0,
                        }
                    }
                });
                assert.strictEqual(mdModel.length, 3);
                assert.strictEqual(mdModel.getMatch(0), mdModel.contentMatches[0]);
                assert.strictEqual(mdModel.getMatch(1), mdModel.webviewMatches[0]);
                assert.strictEqual(mdModel.getMatch(2), mdModel.webviewMatches[1]);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svdGVzdC9icm93c2VyL2NvbnRyaWIvZmluZC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBaUJoRyxLQUFLLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRTtRQUMzQixNQUFNLGtCQUFrQixHQUE2QjtZQUNwRCxLQUFLLEVBQUUsa0NBQXFCO1NBQzVCLENBQUM7UUFDRixNQUFNLG9CQUFvQixHQUFHLElBQUksS0FBTSxTQUFRLG1EQUF3QjtZQUM3RCxPQUFPO2dCQUNmLE9BQU8sa0JBQWtCLENBQUM7WUFDM0IsQ0FBQztTQUNELEVBQUUsQ0FBQztRQUVKLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxNQUE2QixFQUFFLFNBQTRCLEVBQUUsRUFBRTtZQUMxRixNQUFNLENBQUMsc0JBQXNCLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDNUMsT0FBTyxRQUFRLENBQUM7b0JBQ2YsZ0JBQWdCLEVBQUUsQ0FBQyxjQUF1QyxFQUFFLGNBQTRDLEVBQUUsRUFBRTt3QkFDM0csTUFBTSxHQUFHLEdBQTRCLEVBQUUsQ0FBQzt3QkFDeEMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTs0QkFDNUIsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFDM0UsTUFBTSxXQUFXLEdBQUcsSUFBSSxFQUFFLHFCQUFxQixDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDOzRCQUUzRSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dDQUMz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