/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/mock", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/services/editorWorker", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/contrib/suggest/browser/suggestController", "vs/editor/contrib/suggest/browser/suggestMemory", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/workspace/common/workspace", "vs/editor/common/services/languageFeaturesService", "vs/editor/common/services/languageFeatures", "vs/platform/environment/common/environment", "vs/editor/contrib/linesOperations/browser/linesOperations"], function (require, exports, assert, async_1, event_1, lifecycle_1, uri_1, mock_1, range_1, selection_1, editorWorker_1, snippetController2_1, suggestController_1, suggestMemory_1, testCodeEditor_1, testTextModel_1, actions_1, serviceCollection_1, keybinding_1, mockKeybindingService_1, label_1, log_1, storage_1, telemetry_1, telemetryUtils_1, workspace_1, languageFeaturesService_1, languageFeatures_1, environment_1, linesOperations_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SuggestController', function () {
        const disposables = new lifecycle_1.DisposableStore();
        let controller;
        let editor;
        let model;
        const languageFeaturesService = new languageFeaturesService_1.LanguageFeaturesService();
        teardown(function () {
            disposables.clear();
        });
        // ensureNoDisposablesAreLeakedInTestSuite();
        setup(function () {
            const serviceCollection = new serviceCollection_1.ServiceCollection([languageFeatures_1.ILanguageFeaturesService, languageFeaturesService], [telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService], [log_1.ILogService, new log_1.NullLogService()], [storage_1.IStorageService, disposables.add(new storage_1.InMemoryStorageService())], [keybinding_1.IKeybindingService, new mockKeybindingService_1.MockKeybindingService()], [editorWorker_1.IEditorWorkerService, new class extends (0, mock_1.mock)() {
                    computeWordRanges() {
                        return Promise.resolve({});
                    }
                }], [suggestMemory_1.ISuggestMemoryService, new class extends (0, mock_1.mock)() {
                    memorize() { }
                    select() { return 0; }
                }], [actions_1.IMenuService, new class extends (0, mock_1.mock)() {
                    createMenu() {
                        return new class extends (0, mock_1.mock)() {
                            constructor() {
                                super(...arguments);
                                this.onDidChange = event_1.Event.None;
                            }
                            dispose() { }
                        };
                    }
                }], [label_1.ILabelService, new class extends (0, mock_1.mock)() {
                }], [workspace_1.IWorkspaceContextService, new class extends (0, mock_1.mock)() {
                }], [environment_1.IEnvironmentService, new class extends (0, mock_1.mock)() {
                    constructor() {
                        super(...arguments);
                        this.isBuilt = true;
                        this.isExtensionDevelopment = false;
                    }
                }]);
            model = disposables.add((0, testTextModel_1.createTextModel)('', undefined, undefined, uri_1.URI.from({ scheme: 'test-ctrl', path: '/path.tst' })));
            editor = disposables.add((0, testCodeEditor_1.createTestCodeEditor)(model, { serviceCollection }));
            editor.registerAndInstantiateContribution(snippetController2_1.SnippetController2.ID, snippetController2_1.SnippetController2);
            controller = editor.registerAndInstantiateContribution(suggestController_1.SuggestController.ID, suggestController_1.SuggestController);
        });
        test('postfix completion reports incorrect position #86984', async function () {
            disposables.add(languageFeaturesService.completionProvider.register({ scheme: 'test-ctrl' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    return {
                        suggestions: [{
                                kind: 27 /* CompletionItemKind.Snippet */,
                                label: 'let',
                                insertText: 'let ${1:name} = foo$0',
                                insertTextRules: 4 /* CompletionItemInsertTextRule.InsertAsSnippet */,
                                range: { startLineNumber: 1, startColumn: 9, endLineNumber: 1, endColumn: 11 },
                                additionalTextEdits: [{
                                        text: '',
                                        range: { startLineNumber: 1, startColumn: 5, endLineNumber: 1, endColumn: 9 }
                                    }]
                            }]
                    };
                }
            }));
            editor.setValue('    foo.le');
            editor.setSelection(new selection_1.Selection(1, 11, 1, 11));
            // trigger
            const p1 = event_1.Event.toPromise(controller.model.onDidSuggest);
            controller.triggerSuggest();
            await p1;
            //
            const p2 = event_1.Event.toPromise(controller.model.onDidCancel);
            controller.acceptSelectedSuggestion(false, false);
            await p2;
            assert.strictEqual(editor.getValue(), '    let name = foo');
        });
        test('use additionalTextEdits sync when possible', async function () {
            disposables.add(languageFeaturesService.completionProvider.register({ scheme: 'test-ctrl' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    return {
                        suggestions: [{
                                kind: 27 /* CompletionItemKind.Snippet */,
                                label: 'let',
                                insertText: 'hello',
                                range: range_1.Range.fromPositions(pos),
                                additionalTextEdits: [{
                                        text: 'I came sync',
                                        range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }
                                    }]
                            }]
                    };
                },
                async resolveCompletionItem(item) {
                    return item;
                }
            }));
            editor.setValue('hello\nhallo');
            editor.setSelection(new selection_1.Selection(2, 6, 2, 6));
            // trigger
            const p1 = event_1.Event.toPromise(controller.model.onDidSuggest);
            controller.triggerSuggest();
            await p1;
            //
            const p2 = event_1.Event.toPromise(controller.model.onDidCancel);
            controller.acceptSelectedSuggestion(false, false);
            await p2;
            // insertText happens sync!
            assert.strictEqual(editor.getValue(), 'I came synchello\nhallohello');
        });
        test('resolve additionalTextEdits async when needed', async function () {
            let resolveCallCount = 0;
            disposables.add(languageFeaturesService.completionProvider.register({ scheme: 'test-ctrl' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    return {
                        suggestions: [{
                                kind: 27 /* CompletionItemKind.Snippet */,
                                label: 'let',
                                insertText: 'hello',
                                range: range_1.Range.fromPositions(pos)
                            }]
                    };
                },
                async resolveCompletionItem(item) {
                    resolveCallCount += 1;
                    await (0, async_1.timeout)(10);
                    item.additionalTextEdits = [{
                            text: 'I came late',
                            range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }
                        }];
                    return item;
                }
            }));
            editor.setValue('hello\nhallo');
            editor.setSelection(new selection_1.Selection(2, 6, 2, 6));
            // trigger
            const p1 = event_1.Event.toPromise(controller.model.onDidSuggest);
            controller.triggerSuggest();
            await p1;
            //
            const p2 = event_1.Event.toPromise(controller.model.onDidCancel);
            controller.acceptSelectedSuggestion(false, false);
            await p2;
            // insertText happens sync!
            assert.strictEqual(editor.getValue(), 'hello\nhallohello');
            assert.strictEqual(resolveCallCount, 1);
            // additional edits happened after a litte wait
            await (0, async_1.timeout)(20);
            assert.strictEqual(editor.getValue(), 'I came latehello\nhallohello');
            // single undo stop
            editor.getModel()?.undo();
            assert.strictEqual(editor.getValue(), 'hello\nhallo');
        });
        test('resolve additionalTextEdits async when needed (typing)', async function () {
            let resolveCallCount = 0;
            let resolve = () => { };
            disposables.add(languageFeaturesService.completionProvider.register({ scheme: 'test-ctrl' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    return {
                        suggestions: [{
                                kind: 27 /* CompletionItemKind.Snippet */,
                                label: 'let',
                                insertText: 'hello',
                                range: range_1.Range.fromPositions(pos)
                            }]
                    };
                },
                async resolveCompletionItem(item) {
                    resolveCallCount += 1;
                    await new Promise(_resolve => resolve = _resolve);
                    item.additionalTextEdits = [{
                            text: 'I came late',
                            range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }
                        }];
                    return item;
                }
            }));
            editor.setValue('hello\nhallo');
            editor.setSelection(new selection_1.Selection(2, 6, 2, 6));
            // trigger
            const p1 = event_1.Event.toPromise(controller.model.onDidSuggest);
            controller.triggerSuggest();
            await p1;
            //
            const p2 = event_1.Event.toPromise(controller.model.onDidCancel);
            controller.acceptSelectedSuggestion(false, false);
            await p2;
            // insertText happens sync!
            assert.strictEqual(editor.getValue(), 'hello\nhallohello');
            assert.strictEqual(resolveCallCount, 1);
            // additional edits happened after a litte wait
            assert.ok(editor.getSelection()?.equalsSelection(new selection_1.Selection(2, 11, 2, 11)));
            editor.trigger('test', 'type', { text: 'TYPING' });
            assert.strictEqual(editor.getValue(), 'hello\nhallohelloTYPING');
            resolve();
            await (0, async_1.timeout)(10);
            assert.strictEqual(editor.getValue(), 'I came latehello\nhallohelloTYPING');
            assert.ok(editor.getSelection()?.equalsSelection(new selection_1.Selection(2, 17, 2, 17)));
        });
        // additional edit come late and are AFTER the selection -> cancel
        test('resolve additionalTextEdits async when needed (simple conflict)', async function () {
            let resolveCallCount = 0;
            let resolve = () => { };
            disposables.add(languageFeaturesService.completionProvider.register({ scheme: 'test-ctrl' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    return {
                        suggestions: [{
                                kind: 27 /* CompletionItemKind.Snippet */,
                                label: 'let',
                                insertText: 'hello',
                                range: range_1.Range.fromPositions(pos)
                            }]
                    };
                },
                async resolveCompletionItem(item) {
                    resolveCallCount += 1;
                    await new Promise(_resolve => resolve = _resolve);
                    item.additionalTextEdits = [{
                            text: 'I came late',
                            range: { startLineNumber: 1, startColumn: 6, endLineNumber: 1, endColumn: 6 }
                        }];
                    return item;
                }
            }));
            editor.setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            // trigger
            const p1 = event_1.Event.toPromise(controller.model.onDidSuggest);
            controller.triggerSuggest();
            await p1;
            //
            const p2 = event_1.Event.toPromise(controller.model.onDidCancel);
            controller.acceptSelectedSuggestion(false, false);
            await p2;
            // insertText happens sync!
            assert.strictEqual(editor.getValue(), 'hello');
            assert.strictEqual(resolveCallCount, 1);
            resolve();
            await (0, async_1.timeout)(10);
            assert.strictEqual(editor.getValue(), 'hello');
        });
        // additional edit come late and are AFTER the position at which the user typed -> cancelled
        test('resolve additionalTextEdits async when needed (conflict)', async function () {
            let resolveCallCount = 0;
            let resolve = () => { };
            disposables.add(languageFeaturesService.completionProvider.register({ scheme: 'test-ctrl' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    return {
                        suggestions: [{
                                kind: 27 /* CompletionItemKind.Snippet */,
                                label: 'let',
                                insertText: 'hello',
                                range: range_1.Range.fromPositions(pos)
                            }]
                    };
                },
                async resolveCompletionItem(item) {
                    resolveCallCount += 1;
                    await new Promise(_resolve => resolve = _resolve);
                    item.additionalTextEdits = [{
                            text: 'I came late',
                            range: { startLineNumber: 1, startColumn: 2, endLineNumber: 1, endColumn: 2 }
                        }];
                    return item;
                }
            }));
            editor.setValue('hello\nhallo');
            editor.setSelection(new selection_1.Selection(2, 6, 2, 6));
            // trigger
            const p1 = event_1.Event.toPromise(controller.model.onDidSuggest);
            controller.triggerSuggest();
            await p1;
            //
            const p2 = event_1.Event.toPromise(controller.model.onDidCancel);
            controller.acceptSelectedSuggestion(false, false);
            await p2;
            // insertText happens sync!
            assert.strictEqual(editor.getValue(), 'hello\nhallohello');
            assert.strictEqual(resolveCallCount, 1);
            // additional edits happened after a litte wait
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            editor.trigger('test', 'type', { text: 'TYPING' });
            assert.strictEqual(editor.getValue(), 'TYPINGhello\nhallohello');
            resolve();
            await (0, async_1.timeout)(10);
            assert.strictEqual(editor.getValue(), 'TYPINGhello\nhallohello');
            assert.ok(editor.getSelection()?.equalsSelection(new selection_1.Selection(1, 7, 1, 7)));
        });
        test('resolve additionalTextEdits async when needed (cancel)', async function () {
            const resolve = [];
            disposables.add(languageFeaturesService.completionProvider.register({ scheme: 'test-ctrl' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    return {
                        suggestions: [{
                                kind: 27 /* CompletionItemKind.Snippet */,
                                label: 'let',
                                insertText: 'hello',
                                range: range_1.Range.fromPositions(pos)
                            }, {
                                kind: 27 /* CompletionItemKind.Snippet */,
                                label: 'let',
                                insertText: 'hallo',
                                range: range_1.Range.fromPositions(pos)
                            }]
                    };
                },
                async resolveCompletionItem(item) {
                    await new Promise(_resolve => resolve.push(_resolve));
                    item.additionalTextEdits = [{
                            text: 'additionalTextEdits',
                            range: { startLineNumber: 1, startColumn: 2, endLineNumber: 1, endColumn: 2 }
                        }];
                    return item;
                }
            }));
            editor.setValue('abc');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            // trigger
            const p1 = event_1.Event.toPromise(controller.model.onDidSuggest);
            controller.triggerSuggest();
            await p1;
            //
            const p2 = event_1.Event.toPromise(controller.model.onDidCancel);
            controller.acceptSelectedSuggestion(true, false);
            await p2;
            // insertText happens sync!
            assert.strictEqual(editor.getValue(), 'helloabc');
            // next
            controller.acceptNextSuggestion();
            // resolve additional edits (MUST be cancelled)
            resolve.forEach(fn => fn);
            resolve.length = 0;
            await (0, async_1.timeout)(10);
            // next suggestion used
            assert.strictEqual(editor.getValue(), 'halloabc');
        });
        test('Completion edits are applied inconsistently when additionalTextEdits and textEdit start at the same offset #143888', async function () {
            disposables.add(languageFeaturesService.completionProvider.register({ scheme: 'test-ctrl' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    return {
                        suggestions: [{
                                kind: 18 /* CompletionItemKind.Text */,
                                label: 'MyClassName',
                                insertText: 'MyClassName',
                                range: range_1.Range.fromPositions(pos),
                                additionalTextEdits: [{
                                        range: range_1.Range.fromPositions(pos),
                                        text: 'import "my_class.txt";\n'
                                    }]
                            }]
                    };
                }
            }));
            editor.setValue('');
            editor.setSelection(new selection_1.Selection(1, 1, 1, 1));
            // trigger
            const p1 = event_1.Event.toPromise(controller.model.onDidSuggest);
            controller.triggerSuggest();
            await p1;
            //
            const p2 = event_1.Event.toPromise(controller.model.onDidCancel);
            controller.acceptSelectedSuggestion(true, false);
            await p2;
            // insertText happens sync!
            assert.strictEqual(editor.getValue(), 'import "my_class.txt";\nMyClassName');
        });
        test('Pressing enter on autocomplete should always apply the selected dropdown completion, not a different, hidden one #161883', async function () {
            disposables.add(languageFeaturesService.completionProvider.register({ scheme: 'test-ctrl' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    const word = doc.getWordUntilPosition(pos);
                    const range = new range_1.Range(pos.lineNumber, word.startColumn, pos.lineNumber, word.endColumn);
                    return {
                        suggestions: [{
                                kind: 18 /* CompletionItemKind.Text */,
                                label: 'filterBankSize',
                                insertText: 'filterBankSize',
                                sortText: 'a',
                                range
                            }, {
                                kind: 18 /* CompletionItemKind.Text */,
                                label: 'filter',
                                insertText: 'filter',
                                sortText: 'b',
                                range
                            }]
                    };
                }
            }));
            editor.setValue('filte');
            editor.setSelection(new selection_1.Selection(1, 6, 1, 6));
            const p1 = event_1.Event.toPromise(controller.model.onDidSuggest);
            controller.triggerSuggest();
            const { completionModel } = await p1;
            assert.strictEqual(completionModel.items.length, 2);
            const [first, second] = completionModel.items;
            assert.strictEqual(first.textLabel, 'filterBankSize');
            assert.strictEqual(second.textLabel, 'filter');
            assert.deepStrictEqual(editor.getSelection(), new selection_1.Selection(1, 6, 1, 6));
            editor.trigger('keyboard', 'type', { text: 'r' }); // now filter "overtakes" filterBankSize because it is fully matched
            assert.deepStrictEqual(editor.getSelection(), new selection_1.Selection(1, 7, 1, 7));
            controller.acceptSelectedSuggestion(false, false);
            assert.strictEqual(editor.getValue(), 'filter');
        });
        test('Fast autocomple typing selects the previous autocomplete suggestion, #71795', async function () {
            disposables.add(languageFeaturesService.completionProvider.register({ scheme: 'test-ctrl' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    const word = doc.getWordUntilPosition(pos);
                    const range = new range_1.Range(pos.lineNumber, word.startColumn, pos.lineNumber, word.endColumn);
                    return {
                        suggestions: [{
                                kind: 18 /* CompletionItemKind.Text */,
                                label: 'false',
                                insertText: 'false',
                                range
                            }, {
                                kind: 18 /* CompletionItemKind.Text */,
                                label: 'float',
                                insertText: 'float',
                                range
                            }, {
                                kind: 18 /* CompletionItemKind.Text */,
                                label: 'for',
                                insertText: 'for',
                                range
                            }, {
                                kind: 18 /* CompletionItemKind.Text */,
                                label: 'foreach',
                                insertText: 'foreach',
                                range
                            }]
                    };
                }
            }));
            editor.setValue('f');
            editor.setSelection(new selection_1.Selection(1, 2, 1, 2));
            const p1 = event_1.Event.toPromise(controller.model.onDidSuggest);
            controller.triggerSuggest();
            const { completionModel } = await p1;
            assert.strictEqual(completionModel.items.length, 4);
            const [first, second, third, fourth] = completionModel.items;
            assert.strictEqual(first.textLabel, 'false');
            assert.strictEqual(second.textLabel, 'float');
            assert.strictEqual(third.textLabel, 'for');
            assert.strictEqual(fourth.textLabel, 'foreach');
            assert.deepStrictEqual(editor.getSelection(), new selection_1.Selection(1, 2, 1, 2));
            editor.trigger('keyboard', 'type', { text: 'o' }); // filters`false` and `float`
            assert.deepStrictEqual(editor.getSelection(), new selection_1.Selection(1, 3, 1, 3));
            controller.acceptSelectedSuggestion(false, false);
            assert.strictEqual(editor.getValue(), 'for');
        });
        test.skip('Suggest widget gets orphaned in editor #187779', async function () {
            disposables.add(languageFeaturesService.completionProvider.register({ scheme: 'test-ctrl' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    const word = doc.getLineContent(pos.lineNumber);
                    const range = new range_1.Range(pos.lineNumber, 1, pos.lineNumber, pos.column);
                    return {
                        suggestions: [{
                                kind: 18 /* CompletionItemKind.Text */,
                                label: word,
                                insertText: word,
                                range
                            }]
                    };
                }
            }));
            editor.setValue(`console.log(example.)\nconsole.log(EXAMPLE.not)`);
            editor.setSelection(new selection_1.Selection(1, 21, 1, 21));
            const p1 = event_1.Event.toPromise(controller.model.onDidSuggest);
            controller.triggerSuggest();
            await p1;
            const p2 = event_1.Event.toPromise(controller.model.onDidCancel);
            new linesOperations_1.DeleteLinesAction().run(null, editor);
            await p2;
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdENvbnRyb2xsZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3N1Z2dlc3QvdGVzdC9icm93c2VyL3N1Z2dlc3RDb250cm9sbGVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFpQ2hHLEtBQUssQ0FBQyxtQkFBbUIsRUFBRTtRQUUxQixNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUUxQyxJQUFJLFVBQTZCLENBQUM7UUFDbEMsSUFBSSxNQUF1QixDQUFDO1FBQzVCLElBQUksS0FBZ0IsQ0FBQztRQUNyQixNQUFNLHVCQUF1QixHQUFHLElBQUksaURBQXVCLEVBQUUsQ0FBQztRQUU5RCxRQUFRLENBQUM7WUFFUixXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7UUFFSCw2Q0FBNkM7UUFFN0MsS0FBSyxDQUFDO1lBRUwsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLHFDQUFpQixDQUM5QyxDQUFDLDJDQUF3QixFQUFFLHVCQUF1QixDQUFDLEVBQ25ELENBQUMsNkJBQWlCLEVBQUUscUNBQW9CLENBQUMsRUFDekMsQ0FBQyxpQkFBVyxFQUFFLElBQUksb0JBQWMsRUFBRSxDQUFDLEVBQ25DLENBQUMseUJBQWUsRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksZ0NBQXNCLEVBQUUsQ0FBQyxDQUFDLEVBQ2hFLENBQUMsK0JBQWtCLEVBQUUsSUFBSSw2Q0FBcUIsRUFBRSxDQUFDLEVBQ2pELENBQUMsbUNBQW9CLEVBQUUsSUFBSSxLQUFNLFNBQVEsSUFBQSxXQUFJLEdBQXdCO29CQUMzRCxpQkFBaUI7d0JBQ3pCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDNUIsQ0FBQztpQkFDRCxDQUFDLEVBQ0YsQ0FBQyxx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