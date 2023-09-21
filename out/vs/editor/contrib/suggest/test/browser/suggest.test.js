define(["require", "exports", "assert", "vs/base/common/uri", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/contrib/suggest/browser/suggest", "vs/editor/test/common/testTextModel", "vs/editor/common/languageFeatureRegistry", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, position_1, range_1, suggest_1, testTextModel_1, languageFeatureRegistry_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Suggest', function () {
        let model;
        let registration;
        let registry;
        setup(function () {
            registry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
            model = (0, testTextModel_1.createTextModel)('FOO\nbar\BAR\nfoo', undefined, undefined, uri_1.URI.parse('foo:bar/path'));
            registration = registry.register({ pattern: 'bar/path', scheme: 'foo' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(_doc, pos) {
                    return {
                        incomplete: false,
                        suggestions: [{
                                label: 'aaa',
                                kind: 27 /* CompletionItemKind.Snippet */,
                                insertText: 'aaa',
                                range: range_1.Range.fromPositions(pos)
                            }, {
                                label: 'zzz',
                                kind: 27 /* CompletionItemKind.Snippet */,
                                insertText: 'zzz',
                                range: range_1.Range.fromPositions(pos)
                            }, {
                                label: 'fff',
                                kind: 9 /* CompletionItemKind.Property */,
                                insertText: 'fff',
                                range: range_1.Range.fromPositions(pos)
                            }]
                    };
                }
            });
        });
        teardown(() => {
            registration.dispose();
            model.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('sort - snippet inline', async function () {
            const { items, disposable } = await (0, suggest_1.provideSuggestionItems)(registry, model, new position_1.Position(1, 1), new suggest_1.CompletionOptions(1 /* SnippetSortOrder.Inline */));
            assert.strictEqual(items.length, 3);
            assert.strictEqual(items[0].completion.label, 'aaa');
            assert.strictEqual(items[1].completion.label, 'fff');
            assert.strictEqual(items[2].completion.label, 'zzz');
            disposable.dispose();
        });
        test('sort - snippet top', async function () {
            const { items, disposable } = await (0, suggest_1.provideSuggestionItems)(registry, model, new position_1.Position(1, 1), new suggest_1.CompletionOptions(0 /* SnippetSortOrder.Top */));
            assert.strictEqual(items.length, 3);
            assert.strictEqual(items[0].completion.label, 'aaa');
            assert.strictEqual(items[1].completion.label, 'zzz');
            assert.strictEqual(items[2].completion.label, 'fff');
            disposable.dispose();
        });
        test('sort - snippet bottom', async function () {
            const { items, disposable } = await (0, suggest_1.provideSuggestionItems)(registry, model, new position_1.Position(1, 1), new suggest_1.CompletionOptions(2 /* SnippetSortOrder.Bottom */));
            assert.strictEqual(items.length, 3);
            assert.strictEqual(items[0].completion.label, 'fff');
            assert.strictEqual(items[1].completion.label, 'aaa');
            assert.strictEqual(items[2].completion.label, 'zzz');
            disposable.dispose();
        });
        test('sort - snippet none', async function () {
            const { items, disposable } = await (0, suggest_1.provideSuggestionItems)(registry, model, new position_1.Position(1, 1), new suggest_1.CompletionOptions(undefined, new Set().add(27 /* CompletionItemKind.Snippet */)));
            assert.strictEqual(items.length, 1);
            assert.strictEqual(items[0].completion.label, 'fff');
            disposable.dispose();
        });
        test('only from', function (callback) {
            const foo = {
                triggerCharacters: [],
                provideCompletionItems() {
                    return {
                        currentWord: '',
                        incomplete: false,
                        suggestions: [{
                                label: 'jjj',
                                type: 'property',
                                insertText: 'jjj'
                            }]
                    };
                }
            };
            const registration = registry.register({ pattern: 'bar/path', scheme: 'foo' }, foo);
            (0, suggest_1.provideSuggestionItems)(registry, model, new position_1.Position(1, 1), new suggest_1.CompletionOptions(undefined, undefined, new Set().add(foo))).then(({ items, disposable }) => {
                registration.dispose();
                assert.strictEqual(items.length, 1);
                assert.ok(items[0].provider === foo);
                disposable.dispose();
                callback();
            });
        });
        test('Ctrl+space completions stopped working with the latest Insiders, #97650', async function () {
            const foo = new class {
                constructor() {
                    this._debugDisplayName = 'test';
                    this.triggerCharacters = [];
                }
                provideCompletionItems() {
                    return {
                        suggestions: [{
                                label: 'one',
                                kind: 5 /* CompletionItemKind.Class */,
                                insertText: 'one',
                                range: {
                                    insert: new range_1.Range(0, 0, 0, 0),
                                    replace: new range_1.Range(0, 0, 0, 10)
                                }
                            }, {
                                label: 'two',
                                kind: 5 /* CompletionItemKind.Class */,
                                insertText: 'two',
                                range: {
                                    insert: new range_1.Range(0, 0, 0, 0),
                                    replace: new range_1.Range(0, 1, 0, 10)
                                }
                            }]
                    };
                }
            };
            const registration = registry.register({ pattern: 'bar/path', scheme: 'foo' }, foo);
            const { items, disposable } = await (0, suggest_1.provideSuggestionItems)(registry, model, new position_1.Position(0, 0), new suggest_1.CompletionOptions(undefined, undefined, new Set().add(foo)));
            registration.dispose();
            assert.strictEqual(items.length, 2);
            const [a, b] = items;
            assert.strictEqual(a.completion.label, 'one');
            assert.strictEqual(a.isInvalid, false);
            assert.strictEqual(b.completion.label, 'two');
            assert.strictEqual(b.isInvalid, true);
            disposable.dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdC50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvc3VnZ2VzdC90ZXN0L2Jyb3dzZXIvc3VnZ2VzdC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWlCQSxLQUFLLENBQUMsU0FBUyxFQUFFO1FBQ2hCLElBQUksS0FBZ0IsQ0FBQztRQUNyQixJQUFJLFlBQXlCLENBQUM7UUFDOUIsSUFBSSxRQUF5RCxDQUFDO1FBRTlELEtBQUssQ0FBQztZQUNMLFFBQVEsR0FBRyxJQUFJLGlEQUF1QixFQUFFLENBQUM7WUFDekMsS0FBSyxHQUFHLElBQUEsK0JBQWUsRUFBQyxtQkFBbUIsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUM5RixZQUFZLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUN4RSxpQkFBaUIsRUFBRSxNQUFNO2dCQUN6QixzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsR0FBRztvQkFDL0IsT0FBTzt3QkFDTixVQUFVLEVBQUUsS0FBSzt3QkFDakIsV0FBVyxFQUFFLENBQUM7Z0NBQ2IsS0FBSyxFQUFFLEtBQUs7Z0NBQ1osSUFBSSxxQ0FBNEI7Z0NBQ2hDLFVBQVUsRUFBRSxLQUFLO2dDQUNqQixLQUFLLEVBQUUsYUFBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7NkJBQy9CLEVBQUU7Z0NBQ0YsS0FBSyxFQUFFLEtBQUs7Z0NBQ1osSUFBSSxxQ0FBNEI7Z0NBQ2hDLFVBQVUsRUFBRSxLQUFLO2dDQUNqQixLQUFLLEVBQUUsYUFBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUM7NkJBQy9CLEVBQUU7Z0NBQ0YsS0FBSyxFQUFFLEtBQUs7Z0NBQ1osSUFBSSxx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