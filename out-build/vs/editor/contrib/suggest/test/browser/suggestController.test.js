/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/mock", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/services/editorWorker", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/contrib/suggest/browser/suggestController", "vs/editor/contrib/suggest/browser/suggestMemory", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/workspace/common/workspace", "vs/editor/common/services/languageFeaturesService", "vs/editor/common/services/languageFeatures", "vs/platform/environment/common/environment", "vs/editor/contrib/linesOperations/browser/linesOperations"], function (require, exports, assert, async_1, event_1, lifecycle_1, uri_1, mock_1, range_1, selection_1, editorWorker_1, snippetController2_1, suggestController_1, suggestMemory_1, testCodeEditor_1, testTextModel_1, actions_1, serviceCollection_1, keybinding_1, mockKeybindingService_1, label_1, log_1, storage_1, telemetry_1, telemetryUtils_1, workspace_1, languageFeaturesService_1, languageFeatures_1, environment_1, linesOperations_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SuggestController', function () {
        const disposables = new lifecycle_1.$jc();
        let controller;
        let editor;
        let model;
        const languageFeaturesService = new languageFeaturesService_1.$oBb();
        teardown(function () {
            disposables.clear();
        });
        // ensureNoDisposablesAreLeakedInTestSuite();
        setup(function () {
            const serviceCollection = new serviceCollection_1.$zh([languageFeatures_1.$hF, languageFeaturesService], [telemetry_1.$9k, telemetryUtils_1.$bo], [log_1.$5i, new log_1.$fj()], [storage_1.$Vo, disposables.add(new storage_1.$Zo())], [keybinding_1.$2D, new mockKeybindingService_1.$U0b()], [editorWorker_1.$4Y, new class extends (0, mock_1.$rT)() {
                    computeWordRanges() {
                        return Promise.resolve({});
                    }
                }], [suggestMemory_1.$r6, new class extends (0, mock_1.$rT)() {
                    memorize() { }
                    select() { return 0; }
                }], [actions_1.$Su, new class extends (0, mock_1.$rT)() {
                    createMenu() {
                        return new class extends (0, mock_1.$rT)() {
                            constructor() {
                                super(...arguments);
                                this.onDidChange = event_1.Event.None;
                            }
                            dispose() { }
                        };
                    }
                }], [label_1.$Vz, new class extends (0, mock_1.$rT)() {
                }], [workspace_1.$Kh, new class extends (0, mock_1.$rT)() {
                }], [environment_1.$Ih, new class extends (0, mock_1.$rT)() {
                    constructor() {
                        super(...arguments);
                        this.isBuilt = true;
                        this.isExtensionDevelopment = false;
                    }
                }]);
            model = disposables.add((0, testTextModel_1.$O0b)('', undefined, undefined, uri_1.URI.from({ scheme: 'test-ctrl', path: '/path.tst' })));
            editor = disposables.add((0, testCodeEditor_1.$10b)(model, { serviceCollection }));
            editor.registerAndInstantiateContribution(snippetController2_1.$05.ID, snippetController2_1.$05);
            controller = editor.registerAndInstantiateContribution(suggestController_1.$G6.ID, suggestController_1.$G6);
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
            editor.setSelection(new selection_1.$ms(1, 11, 1, 11));
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
                                range: range_1.$ks.fromPositions(pos),
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
            editor.setSelection(new selection_1.$ms(2, 6, 2, 6));
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
                                range: range_1.$ks.fromPositions(pos)
                            }]
                    };
                },
                async resolveCompletionItem(item) {
                    resolveCallCount += 1;
                    await (0, async_1.$Hg)(10);
                    item.additionalTextEdits = [{
                            text: 'I came late',
                            range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }
                        }];
                    return item;
                }
            }));
            editor.setValue('hello\nhallo');
            editor.setSelection(new selection_1.$ms(2, 6, 2, 6));
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
            await (0, async_1.$Hg)(20);
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
                                range: range_1.$ks.fromPositions(pos)
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
            editor.setSelection(new selection_1.$ms(2, 6, 2, 6));
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
            assert.ok(editor.getSelection()?.equalsSelection(new selection_1.$ms(2, 11, 2, 11)));
            editor.trigger('test', 'type', { text: 'TYPING' });
            assert.strictEqual(editor.getValue(), 'hello\nhallohelloTYPING');
            resolve();
            await (0, async_1.$Hg)(10);
            assert.strictEqual(editor.getValue(), 'I came latehello\nhallohelloTYPING');
            assert.ok(editor.getSelection()?.equalsSelection(new selection_1.$ms(2, 17, 2, 17)));
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
                                range: range_1.$ks.fromPositions(pos)
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
            editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
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
            await (0, async_1.$Hg)(10);
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
                                range: range_1.$ks.fromPositions(pos)
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
            editor.setSelection(new selection_1.$ms(2, 6, 2, 6));
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
            editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
            editor.trigger('test', 'type', { text: 'TYPING' });
            assert.strictEqual(editor.getValue(), 'TYPINGhello\nhallohello');
            resolve();
            await (0, async_1.$Hg)(10);
            assert.strictEqual(editor.getValue(), 'TYPINGhello\nhallohello');
            assert.ok(editor.getSelection()?.equalsSelection(new selection_1.$ms(1, 7, 1, 7)));
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
                                range: range_1.$ks.fromPositions(pos)
                            }, {
                                kind: 27 /* CompletionItemKind.Snippet */,
                                label: 'let',
                                insertText: 'hallo',
                                range: range_1.$ks.fromPositions(pos)
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
            editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
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
            await (0, async_1.$Hg)(10);
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
                                range: range_1.$ks.fromPositions(pos),
                                additionalTextEdits: [{
                                        range: range_1.$ks.fromPositions(pos),
                                        text: 'import "my_class.txt";\n'
                                    }]
                            }]
                    };
                }
            }));
            editor.setValue('');
            editor.setSelection(new selection_1.$ms(1, 1, 1, 1));
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
                    const range = new range_1.$ks(pos.lineNumber, word.startColumn, pos.lineNumber, word.endColumn);
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
            editor.setSelection(new selection_1.$ms(1, 6, 1, 6));
            const p1 = event_1.Event.toPromise(controller.model.onDidSuggest);
            controller.triggerSuggest();
            const { completionModel } = await p1;
            assert.strictEqual(completionModel.items.length, 2);
            const [first, second] = completionModel.items;
            assert.strictEqual(first.textLabel, 'filterBankSize');
            assert.strictEqual(second.textLabel, 'filter');
            assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 6, 1, 6));
            editor.trigger('keyboard', 'type', { text: 'r' }); // now filter "overtakes" filterBankSize because it is fully matched
            assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 7, 1, 7));
            controller.acceptSelectedSuggestion(false, false);
            assert.strictEqual(editor.getValue(), 'filter');
        });
        test('Fast autocomple typing selects the previous autocomplete suggestion, #71795', async function () {
            disposables.add(languageFeaturesService.completionProvider.register({ scheme: 'test-ctrl' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    const word = doc.getWordUntilPosition(pos);
                    const range = new range_1.$ks(pos.lineNumber, word.startColumn, pos.lineNumber, word.endColumn);
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
            editor.setSelection(new selection_1.$ms(1, 2, 1, 2));
            const p1 = event_1.Event.toPromise(controller.model.onDidSuggest);
            controller.triggerSuggest();
            const { completionModel } = await p1;
            assert.strictEqual(completionModel.items.length, 4);
            const [first, second, third, fourth] = completionModel.items;
            assert.strictEqual(first.textLabel, 'false');
            assert.strictEqual(second.textLabel, 'float');
            assert.strictEqual(third.textLabel, 'for');
            assert.strictEqual(fourth.textLabel, 'foreach');
            assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 2, 1, 2));
            editor.trigger('keyboard', 'type', { text: 'o' }); // filters`false` and `float`
            assert.deepStrictEqual(editor.getSelection(), new selection_1.$ms(1, 3, 1, 3));
            controller.acceptSelectedSuggestion(false, false);
            assert.strictEqual(editor.getValue(), 'for');
        });
        test.skip('Suggest widget gets orphaned in editor #187779', async function () {
            disposables.add(languageFeaturesService.completionProvider.register({ scheme: 'test-ctrl' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(doc, pos) {
                    const word = doc.getLineContent(pos.lineNumber);
                    const range = new range_1.$ks(pos.lineNumber, 1, pos.lineNumber, pos.column);
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
            editor.setSelection(new selection_1.$ms(1, 21, 1, 21));
            const p1 = event_1.Event.toPromise(controller.model.onDidSuggest);
            controller.triggerSuggest();
            await p1;
            const p2 = event_1.Event.toPromise(controller.model.onDidCancel);
            new linesOperations_1.$G9().run(null, editor);
            await p2;
        });
    });
});
//# sourceMappingURL=suggestController.test.js.map