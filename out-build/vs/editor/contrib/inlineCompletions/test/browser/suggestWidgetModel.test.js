/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/test/common/mock", "vs/base/test/common/timeTravelScheduler", "vs/editor/common/core/range", "vs/editor/common/services/editorWorker", "vs/editor/contrib/inlineCompletions/test/browser/utils", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/contrib/suggest/browser/suggestController", "vs/editor/contrib/suggest/browser/suggestMemory", "vs/editor/test/browser/testCodeEditor", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "assert", "vs/platform/label/common/label", "vs/platform/workspace/common/workspace", "vs/editor/common/services/languageFeaturesService", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsController", "vs/base/common/observable", "vs/base/common/errors", "vs/platform/audioCues/browser/audioCueService", "vs/base/test/common/utils"], function (require, exports, async_1, event_1, lifecycle_1, mock_1, timeTravelScheduler_1, range_1, editorWorker_1, utils_1, snippetController2_1, suggestController_1, suggestMemory_1, testCodeEditor_1, actions_1, serviceCollection_1, keybinding_1, mockKeybindingService_1, log_1, storage_1, telemetry_1, telemetryUtils_1, assert, label_1, workspace_1, languageFeaturesService_1, languageFeatures_1, inlineCompletionsController_1, observable_1, errors_1, audioCueService_1, utils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Suggest Widget Model', () => {
        (0, utils_2.$bT)();
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
                const suggestController = editor.getContribution(suggestController_1.$G6.ID);
                suggestController.triggerSuggest();
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(history.splice(0), [false, true]);
                context.keyboardType('.');
                await (0, async_1.$Hg)(1000);
                // No flicker here
                assert.deepStrictEqual(history.splice(0), []);
                suggestController.cancelSuggestWidget();
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(history.splice(0), [false]);
                d.dispose();
            });
        });
        test('Ghost Text', async () => {
            await withAsyncTestCodeEditorAndInlineCompletionsModel('', { fakeClock: true, provider, suggest: { preview: true } }, async ({ editor, editorViewModel, context, model }) => {
                context.keyboardType('h');
                const suggestController = editor.getContribution(suggestController_1.$G6.ID);
                suggestController.triggerSuggest();
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['', 'h[ello]']);
                context.keyboardType('.');
                await (0, async_1.$Hg)(1000);
                assert.deepStrictEqual(context.getAndClearViewStates(), ['h', 'hello.[hello]']);
                suggestController.cancelSuggestWidget();
                await (0, async_1.$Hg)(1000);
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
                : range_1.$ks.fromPositions(pos);
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
        await (0, timeTravelScheduler_1.$kT)({ useFakeTimers: options.fakeClock }, async () => {
            const disposableStore = new lifecycle_1.$jc();
            try {
                const serviceCollection = new serviceCollection_1.$zh([telemetry_1.$9k, telemetryUtils_1.$bo], [log_1.$5i, new log_1.$fj()], [storage_1.$Vo, disposableStore.add(new storage_1.$Zo())], [keybinding_1.$2D, new mockKeybindingService_1.$U0b()], [editorWorker_1.$4Y, new class extends (0, mock_1.$rT)() {
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
                    }], [audioCueService_1.$sZ, {
                        playAudioCue: async () => { },
                        isEnabled(cue) { return false; },
                    }]);
                if (options.provider) {
                    const languageFeaturesService = new languageFeaturesService_1.$oBb();
                    serviceCollection.set(languageFeatures_1.$hF, languageFeaturesService);
                    disposableStore.add(languageFeaturesService.completionProvider.register({ pattern: '**' }, options.provider));
                }
                await (0, testCodeEditor_1.$Y0b)(text, { ...options, serviceCollection }, async (editor, editorViewModel, instantiationService) => {
                    editor.registerAndInstantiateContribution(snippetController2_1.$05.ID, snippetController2_1.$05);
                    editor.registerAndInstantiateContribution(suggestController_1.$G6.ID, suggestController_1.$G6);
                    editor.registerAndInstantiateContribution(inlineCompletionsController_1.$V8.ID, inlineCompletionsController_1.$V8);
                    const model = inlineCompletionsController_1.$V8.get(editor)?.model.get();
                    const context = new utils_1.$90b(model, editor);
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
//# sourceMappingURL=suggestWidgetModel.test.js.map