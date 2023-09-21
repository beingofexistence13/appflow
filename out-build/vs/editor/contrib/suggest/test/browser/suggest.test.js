define(["require", "exports", "assert", "vs/base/common/uri", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/contrib/suggest/browser/suggest", "vs/editor/test/common/testTextModel", "vs/editor/common/languageFeatureRegistry", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, position_1, range_1, suggest_1, testTextModel_1, languageFeatureRegistry_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Suggest', function () {
        let model;
        let registration;
        let registry;
        setup(function () {
            registry = new languageFeatureRegistry_1.$dF();
            model = (0, testTextModel_1.$O0b)('FOO\nbar\BAR\nfoo', undefined, undefined, uri_1.URI.parse('foo:bar/path'));
            registration = registry.register({ pattern: 'bar/path', scheme: 'foo' }, {
                _debugDisplayName: 'test',
                provideCompletionItems(_doc, pos) {
                    return {
                        incomplete: false,
                        suggestions: [{
                                label: 'aaa',
                                kind: 27 /* CompletionItemKind.Snippet */,
                                insertText: 'aaa',
                                range: range_1.$ks.fromPositions(pos)
                            }, {
                                label: 'zzz',
                                kind: 27 /* CompletionItemKind.Snippet */,
                                insertText: 'zzz',
                                range: range_1.$ks.fromPositions(pos)
                            }, {
                                label: 'fff',
                                kind: 9 /* CompletionItemKind.Property */,
                                insertText: 'fff',
                                range: range_1.$ks.fromPositions(pos)
                            }]
                    };
                }
            });
        });
        teardown(() => {
            registration.dispose();
            model.dispose();
        });
        (0, utils_1.$bT)();
        test('sort - snippet inline', async function () {
            const { items, disposable } = await (0, suggest_1.$35)(registry, model, new position_1.$js(1, 1), new suggest_1.$Y5(1 /* SnippetSortOrder.Inline */));
            assert.strictEqual(items.length, 3);
            assert.strictEqual(items[0].completion.label, 'aaa');
            assert.strictEqual(items[1].completion.label, 'fff');
            assert.strictEqual(items[2].completion.label, 'zzz');
            disposable.dispose();
        });
        test('sort - snippet top', async function () {
            const { items, disposable } = await (0, suggest_1.$35)(registry, model, new position_1.$js(1, 1), new suggest_1.$Y5(0 /* SnippetSortOrder.Top */));
            assert.strictEqual(items.length, 3);
            assert.strictEqual(items[0].completion.label, 'aaa');
            assert.strictEqual(items[1].completion.label, 'zzz');
            assert.strictEqual(items[2].completion.label, 'fff');
            disposable.dispose();
        });
        test('sort - snippet bottom', async function () {
            const { items, disposable } = await (0, suggest_1.$35)(registry, model, new position_1.$js(1, 1), new suggest_1.$Y5(2 /* SnippetSortOrder.Bottom */));
            assert.strictEqual(items.length, 3);
            assert.strictEqual(items[0].completion.label, 'fff');
            assert.strictEqual(items[1].completion.label, 'aaa');
            assert.strictEqual(items[2].completion.label, 'zzz');
            disposable.dispose();
        });
        test('sort - snippet none', async function () {
            const { items, disposable } = await (0, suggest_1.$35)(registry, model, new position_1.$js(1, 1), new suggest_1.$Y5(undefined, new Set().add(27 /* CompletionItemKind.Snippet */)));
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
            (0, suggest_1.$35)(registry, model, new position_1.$js(1, 1), new suggest_1.$Y5(undefined, undefined, new Set().add(foo))).then(({ items, disposable }) => {
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
                                    insert: new range_1.$ks(0, 0, 0, 0),
                                    replace: new range_1.$ks(0, 0, 0, 10)
                                }
                            }, {
                                label: 'two',
                                kind: 5 /* CompletionItemKind.Class */,
                                insertText: 'two',
                                range: {
                                    insert: new range_1.$ks(0, 0, 0, 0),
                                    replace: new range_1.$ks(0, 1, 0, 10)
                                }
                            }]
                    };
                }
            };
            const registration = registry.register({ pattern: 'bar/path', scheme: 'foo' }, foo);
            const { items, disposable } = await (0, suggest_1.$35)(registry, model, new position_1.$js(0, 0), new suggest_1.$Y5(undefined, undefined, new Set().add(foo)));
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
//# sourceMappingURL=suggest.test.js.map