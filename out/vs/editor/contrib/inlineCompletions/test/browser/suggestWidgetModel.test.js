/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/test/common/mock", "vs/base/test/common/timeTravelScheduler", "vs/editor/common/core/range", "vs/editor/common/services/editorWorker", "vs/editor/contrib/inlineCompletions/test/browser/utils", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/contrib/suggest/browser/suggestController", "vs/editor/contrib/suggest/browser/suggestMemory", "vs/editor/test/browser/testCodeEditor", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "assert", "vs/platform/label/common/label", "vs/platform/workspace/common/workspace", "vs/editor/common/services/languageFeaturesService", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/base/common/observable", "vs/base/common/errors", "vs/platform/audioCues/browser/audioCueService", "vs/base/test/common/utils"], function (require, exports, async_1, event_1, lifecycle_1, mock_1, timeTravelScheduler_1, range_1, editorWorker_1, utils_1, snippetController2_1, suggestController_1, suggestMemory_1, testCodeEditor_1, actions_1, serviceCollection_1, keybinding_1, mockKeybindingService_1, log_1, storage_1, telemetry_1, telemetryUtils_1, assert, label_1, workspace_1, languageFeaturesService_1, languageFeatures_1, inlineCompletionsController_1, observable_1, errors_1, audioCueService_1, utils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Suggest Widget Model', () => {
        (0, utils_2.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(() => {
            (0, errors_1.setUnexpectedErrorHandler)(function (err) {
                throw err;
            });
        });
        // This test is skipped because the fix for this causes https://github.com/microsoft/vscode/issues/166023
        test.skip('Active', async () => {
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider, }, async ({ editor, editorViewModel, context, model }) => {
                let last = undefined;
                const history = new Array();
                const d = (0, observable_1.autorun)(reader => {
                    /** @description debug */
                    const selectedSuggestItem = !!model.selectedSuggestItem.read(reader);
                    if (last !== selectedSuggestItem) {
                        last = selectedSuggestItem;
                        history.push(last);
                    }
                });
                context.keyboardType('h');
                const suggestController = editor.getContribution(suggestController_1.SuggestController.ID);
                suggestController.triggerSuggest();
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(history.splice(0), [false, true]);
                context.keyboardType('.');
                await (0, async_1.timeout)(1000);
                // No flicker here
                assert.deepStrictEqual(history.splice(0), []);
                suggestController.cancelSuggestWidget();
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(history.splice(0), [false]);
                d.dispose();
            });
        });
        test('Ghost Text', async () => {
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider, suggest: { preview: true } }, async ({ editor, editorViewModel, context, model }) => {
                context.keyboardType('h');
                const suggestController = editor.getContribution(suggestController_1.SuggestController.ID);
                suggestController.triggerSuggest();
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', 'h[ello]']);
                context.keyboardType('.');
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['h', 'hello.[hello]']);
                suggestController.cancelSuggestWidget();
                await (0, async_1.timeout)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['hello.']);
            });
        });
    });
    const provider = {
        _debugDisplayName: 'test',
        triggerCharacters: ['.'],
        async provideCompletionItems(model, pos) {
            const word = model.getWordAtPosition(pos);
            const range = word
                ? { startLineNumber: 1, startColumn: word.startColumn, endLineNumber: 1, endColumn: word.endColumn }
                : range_1.Range.fromPositions(pos);
            return {
                suggestions: [{
                        insertText: 'hello',
                        kind: 18 /* CompletionItemKind.Text */,
                        label: 'hello',
                        range,
                        commitCharacters: ['.'],
                    }]
            };
        },
    };
    async function withAsyncTestCodeEditorAndInlineCompletionsModel(text, options, callback) {
        await (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: options.fakeClock }, async () => {
            const disposableStore = new lifecycle_1.DisposableStore();
            try {
                const serviceCollection = new serviceCollection_1.ServiceCollection([telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService], [log_1.ILogService, new log_1.NullLogService()], [storage_1.IStorageService, disposableStore.add(new storage_1.InMemoryStorageService())], [keybinding_1.IKeybindingService, new mockKeybindingService_1.MockKeybindingService()], [editorWorker_1.IEditorWorkerService, new class extends (0, mock_1.mock)() {
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
                    }], [audioCueService_1.IAudioCueService, {
                        playAudioCue: async () => { },
                        isEnabled(cue) { return false; },
                    }]);
                if (options.provider) {
                    const languageFeaturesService = new languageFeaturesService_1.LanguageFeaturesService();
                    serviceCollection.set(languageFeatures_1.ILanguageFeaturesService, languageFeaturesService);
                    disposableStore.add(languageFeaturesService.completionProvider.register({ pattern: '**' }, options.provider));
                }
                await (0, testCodeEditor_1.withAsyncTestCodeEditor)(text, { ...options, serviceCollection }, async (editor, editorViewModel, instantiationService) => {
                    editor.registerAndInstantiateContribution(snippetController2_1.SnippetController2.ID, snippetController2_1.SnippetController2);
                    editor.registerAndInstantiateContribution(suggestController_1.SuggestController.ID, suggestController_1.SuggestController);
                    editor.registerAndInstantiateContribution(inlineCompletionsController_1.InlineCompletionsController.ID, inlineCompletionsController_1.InlineCompletionsController);
                    const model = inlineCompletionsController_1.InlineCompletionsController.get(editor)?.model.get();
                    const context = new utils_1.GhostTextContext(model, editor);
                    await callback({ editor, editorViewModel, model, context });
                    context.dispose();
                });
            }
            finally {
                disposableStore.dispose();
            }
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdFdpZGdldE1vZGVsLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9pbmxpbmVDb21wbGV0aW9ucy90ZXN0L2Jyb3dzZXIvc3VnZ2VzdFdpZGdldE1vZGVsLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFvQ2hHLEtBQUssQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUU7UUFDbEMsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixJQUFBLGtDQUF5QixFQUFDLFVBQVUsR0FBRztnQkFDdEMsTUFBTSxHQUFHLENBQUM7WUFDWCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgseUdBQXlHO1FBQ3pHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzlCLE1BQU0sZ0RBQWdELENBQUMsRUFBRSxFQUN4RCxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsUUFBUSxHQUFHLEVBQzlCLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7Z0JBQ3JELElBQUksSUFBSSxHQUF3QixTQUFTLENBQUM7Z0JBQzFDLE1BQU0sT0FBTyxHQUFHLElBQUksS0FBSyxFQUFXLENBQUM7Z0JBQ3JDLE1BQU0sQ0FBQyxHQUFHLElBQUEsb0JBQU8sRUFBQyxNQUFNLENBQUMsRUFBRTtvQkFDMUIseUJBQXlCO29CQUN6QixNQUFNLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUNyRSxJQUFJLElBQUksS0FBSyxtQkFBbUIsRUFBRTt3QkFDakMsSUFBSSxHQUFHLG1CQUFtQixDQUFD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