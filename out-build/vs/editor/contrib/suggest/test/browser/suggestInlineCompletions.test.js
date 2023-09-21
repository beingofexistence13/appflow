/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/base/test/common/mock", "vs/base/test/common/utils", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/suggest/browser/suggestInlineCompletions", "vs/editor/contrib/suggest/browser/suggestMemory", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/testTextModel", "vs/platform/instantiation/common/serviceCollection"], function (require, exports, assert, cancellation_1, lifecycle_1, uri_1, mock_1, utils_1, position_1, range_1, languages_1, languageFeatures_1, suggestInlineCompletions_1, suggestMemory_1, testCodeEditor_1, testTextModel_1, serviceCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Suggest Inline Completions', function () {
        const disposables = new lifecycle_1.$jc();
        const services = new serviceCollection_1.$zh([suggestMemory_1.$r6, new class extends (0, mock_1.$rT)() {
                select() {
                    return 0;
                }
            }]);
        let insta;
        let model;
        let editor;
        setup(function () {
            insta = (0, testCodeEditor_1.$Z0b)(disposables, services);
            model = (0, testTextModel_1.$O0b)('he', undefined, undefined, uri_1.URI.from({ scheme: 'foo', path: 'foo.bar' }));
            editor = (0, testCodeEditor_1.$20b)(insta, model);
            editor.updateOptions({ quickSuggestions: { comments: 'inline', strings: 'inline', other: 'inline' } });
            insta.invokeFunction(accessor => {
                accessor.get(languageFeatures_1.$hF).completionProvider.register({ pattern: '*.bar', scheme: 'foo' }, new class {
                    constructor() {
                        this._debugDisplayName = 'test';
                    }
                    provideCompletionItems(model, position, context, token) {
                        const word = model.getWordUntilPosition(position);
                        const range = new range_1.$ks(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
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
        (0, utils_1.$bT)();
        test('Aggressive inline completions when typing within line #146948', async function () {
            const completions = insta.createInstance(suggestInlineCompletions_1.$20, (id) => editor.getOption(id));
            {
                // (1,3), end of word -> suggestions
                const result = await completions.provideInlineCompletions(model, new position_1.$js(1, 3), { triggerKind: languages_1.InlineCompletionTriggerKind.Explicit, selectedSuggestionInfo: undefined }, cancellation_1.CancellationToken.None);
                assert.strictEqual(result?.items.length, 3);
                completions.freeInlineCompletions(result);
            }
            {
                // (1,2), middle of word -> NO suggestions
                const result = await completions.provideInlineCompletions(model, new position_1.$js(1, 2), { triggerKind: languages_1.InlineCompletionTriggerKind.Explicit, selectedSuggestionInfo: undefined }, cancellation_1.CancellationToken.None);
                assert.ok(result === undefined);
            }
        });
    });
});
//# sourceMappingURL=suggestInlineCompletions.test.js.map