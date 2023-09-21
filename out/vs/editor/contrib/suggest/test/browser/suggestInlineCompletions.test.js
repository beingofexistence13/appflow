/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/suggest/browser/suggestInlineCompletions", "vs/editor/contrib/suggest/browser/suggestMemory", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel", "vs/platform/instantiation/common/serviceCollection"], function (require, exports, assert, cancellation_1, lifecycle_1, uri_1, mock_1, utils_1, position_1, range_1, languages_1, languageFeatures_1, suggestInlineCompletions_1, suggestMemory_1, testCodeEditor_1, testTextModel_1, serviceCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Suggest Inline Completions', function () {
        const disposables = new lifecycle_1.DisposableStore();
        const services = new serviceCollection_1.ServiceCollection([suggestMemory_1.ISuggestMemoryService, new class extends (0, mock_1.mock)() {
                select() {
                    return 0;
                }
            }]);
        let insta;
        let model;
        let editor;
        setup(function () {
            insta = (0, testCodeEditor_1.createCodeEditorServices)(disposables, services);
            model = (0, testTextModel_1.createTextModel)('he', undefined, undefined, uri_1.URI.from({ scheme: 'foo', path: 'foo.bar' }));
            editor = (0, testCodeEditor_1.instantiateTestCodeEditor)(insta, model);
            editor.updateOptions({ quickSuggestions: { comments: 'inline', strings: 'inline', other: 'inline' } });
            insta.invokeFunction(accessor => {
                accessor.get(languageFeatures_1.ILanguageFeaturesService).completionProvider.register({ pattern: '*.bar', scheme: 'foo' }, new class {
                    constructor() {
                        this._debugDisplayName = 'test';
                    }
                    provideCompletionItems(model, position, context, token) {
                        const word = model.getWordUntilPosition(position);
                        const range = new range_1.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
                        const suggestions = [];
                        suggestions.push({ insertText: 'hello', label: 'hello', range, kind: 5 /* CompletionItemKind.Class */ });
                        suggestions.push({ insertText: 'hell', label: 'hell', range, kind: 5 /* CompletionItemKind.Class */ });
                        suggestions.push({ insertText: 'hey', label: 'hey', range, kind: 5 /* CompletionItemKind.Class */ });
                        return { suggestions };
                    }
                });
            });
        });
        teardown(function () {
            disposables.clear();
            model.dispose();
            editor.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('Aggressive inline completions when typing within line #146948', async function () {
            const completions = insta.createInstance(suggestInlineCompletions_1.SuggestInlineCompletions, (id) => editor.getOption(id));
            {
                // (1,3), end of word -> suggestions
                const result = await completions.provideInlineCompletions(model, new position_1.Position(1, 3), { triggerKind: languages_1.InlineCompletionTriggerKind.Explicit, selectedSuggestionInfo: undefined }, cancellation_1.CancellationToken.None);
                assert.strictEqual(result?.items.length, 3);
                completions.freeInlineCompletions(result);
            }
            {
                // (1,2), middle of word -> NO suggestions
                const result = await completions.provideInlineCompletions(model, new position_1.Position(1, 2), { triggerKind: languages_1.InlineCompletionTriggerKind.Explicit, selectedSuggestionInfo: undefined }, cancellation_1.CancellationToken.None);
                assert.ok(result === undefined);
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdElubGluZUNvbXBsZXRpb25zLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9zdWdnZXN0L3Rlc3QvYnJvd3Nlci9zdWdnZXN0SW5saW5lQ29tcGxldGlvbnMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQXNCaEcsS0FBSyxDQUFDLDRCQUE0QixFQUFFO1FBRW5DLE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1FBQzFDLE1BQU0sUUFBUSxHQUFHLElBQUkscUNBQWlCLENBQUMsQ0FBQyxxQ0FBcUIsRUFBRSxJQUFJLEtBQU0sU0FBUSxJQUFBLFdBQUksR0FBeUI7Z0JBQ3BHLE1BQU07b0JBQ2QsT0FBTyxDQUFDLENBQUM7Z0JBQ1YsQ0FBQzthQUNELENBQUMsQ0FBQyxDQUFDO1FBRUosSUFBSSxLQUErQixDQUFDO1FBQ3BDLElBQUksS0FBZ0IsQ0FBQztRQUNyQixJQUFJLE1BQXVCLENBQUM7UUFFNUIsS0FBSyxDQUFDO1lBRUwsS0FBSyxHQUFHLElBQUEseUNBQXdCLEVBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3hELEtBQUssR0FBRyxJQUFBLCtCQUFlLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRyxNQUFNLEdBQUcsSUFBQSwwQ0FBeUIsRUFBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDakQsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLGdCQUFnQixFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRSxD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