define(["require", "exports", "assert", "vs/editor/common/config/editorOptions", "vs/editor/contrib/suggest/browser/completionModel", "vs/editor/contrib/suggest/browser/suggest", "vs/editor/contrib/suggest/browser/wordDistance"], function (require, exports, assert, editorOptions_1, completionModel_1, suggest_1, wordDistance_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$a$b = void 0;
    function $a$b(label, overwriteBefore, kind = 9 /* languages.CompletionItemKind.Property */, incomplete = false, position = { lineNumber: 1, column: 1 }, sortText, filterText) {
        const suggestion = {
            label,
            sortText,
            filterText,
            range: { startLineNumber: position.lineNumber, startColumn: position.column - overwriteBefore, endLineNumber: position.lineNumber, endColumn: position.column },
            insertText: typeof label === 'string' ? label : label.label,
            kind
        };
        const container = {
            incomplete,
            suggestions: [suggestion]
        };
        const provider = {
            _debugDisplayName: 'test',
            provideCompletionItems() {
                return;
            }
        };
        return new suggest_1.$X5(position, suggestion, container, provider);
    }
    exports.$a$b = $a$b;
    suite('CompletionModel', function () {
        const defaultOptions = {
            insertMode: 'insert',
            snippetsPreventQuickSuggestions: true,
            filterGraceful: true,
            localityBonus: false,
            shareSuggestSelections: false,
            showIcons: true,
            showMethods: true,
            showFunctions: true,
            showConstructors: true,
            showDeprecated: true,
            showFields: true,
            showVariables: true,
            showClasses: true,
            showStructs: true,
            showInterfaces: true,
            showModules: true,
            showProperties: true,
            showEvents: true,
            showOperators: true,
            showUnits: true,
            showValues: true,
            showConstants: true,
            showEnums: true,
            showEnumMembers: true,
            showKeywords: true,
            showWords: true,
            showColors: true,
            showFiles: true,
            showReferences: true,
            showFolders: true,
            showTypeParameters: true,
            showSnippets: true,
        };
        let model;
        setup(function () {
            model = new completionModel_1.$85([
                $a$b('foo', 3),
                $a$b('Foo', 3),
                $a$b('foo', 2),
            ], 1, {
                leadingLineContent: 'foo',
                characterCountDelta: 0
            }, wordDistance_1.$P5.None, editorOptions_1.EditorOptions.suggest.defaultValue, editorOptions_1.EditorOptions.snippetSuggestions.defaultValue, undefined);
        });
        test('filtering - cached', function () {
            const itemsNow = model.items;
            let itemsThen = model.items;
            assert.ok(itemsNow === itemsThen);
            // still the same context
            model.lineContext = { leadingLineContent: 'foo', characterCountDelta: 0 };
            itemsThen = model.items;
            assert.ok(itemsNow === itemsThen);
            // different context, refilter
            model.lineContext = { leadingLineContent: 'foo1', characterCountDelta: 1 };
            itemsThen = model.items;
            assert.ok(itemsNow !== itemsThen);
        });
        test('complete/incomplete', () => {
            assert.strictEqual(model.getIncompleteProvider().size, 0);
            const incompleteModel = new completionModel_1.$85([
                $a$b('foo', 3, undefined, true),
                $a$b('foo', 2),
            ], 1, {
                leadingLineContent: 'foo',
                characterCountDelta: 0
            }, wordDistance_1.$P5.None, editorOptions_1.EditorOptions.suggest.defaultValue, editorOptions_1.EditorOptions.snippetSuggestions.defaultValue, undefined);
            assert.strictEqual(incompleteModel.getIncompleteProvider().size, 1);
        });
        test('Fuzzy matching of snippets stopped working with inline snippet suggestions #49895', function () {
            const completeItem1 = $a$b('foobar1', 1, undefined, false, { lineNumber: 1, column: 2 });
            const completeItem2 = $a$b('foobar2', 1, undefined, false, { lineNumber: 1, column: 2 });
            const completeItem3 = $a$b('foobar3', 1, undefined, false, { lineNumber: 1, column: 2 });
            const completeItem4 = $a$b('foobar4', 1, undefined, false, { lineNumber: 1, column: 2 });
            const completeItem5 = $a$b('foobar5', 1, undefined, false, { lineNumber: 1, column: 2 });
            const incompleteItem1 = $a$b('foofoo1', 1, undefined, true, { lineNumber: 1, column: 2 });
            const model = new completionModel_1.$85([
                completeItem1,
                completeItem2,
                completeItem3,
                completeItem4,
                completeItem5,
                incompleteItem1,
            ], 2, { leadingLineContent: 'f', characterCountDelta: 0 }, wordDistance_1.$P5.None, editorOptions_1.EditorOptions.suggest.defaultValue, editorOptions_1.EditorOptions.snippetSuggestions.defaultValue, undefined);
            assert.strictEqual(model.getIncompleteProvider().size, 1);
            assert.strictEqual(model.items.length, 6);
        });
        test('proper current word when length=0, #16380', function () {
            model = new completionModel_1.$85([
                $a$b('    </div', 4),
                $a$b('a', 0),
                $a$b('p', 0),
                $a$b('    </tag', 4),
                $a$b('    XYZ', 4),
            ], 1, {
                leadingLineContent: '   <',
                characterCountDelta: 0
            }, wordDistance_1.$P5.None, editorOptions_1.EditorOptions.suggest.defaultValue, editorOptions_1.EditorOptions.snippetSuggestions.defaultValue, undefined);
            assert.strictEqual(model.items.length, 4);
            const [a, b, c, d] = model.items;
            assert.strictEqual(a.completion.label, '    </div');
            assert.strictEqual(b.completion.label, '    </tag');
            assert.strictEqual(c.completion.label, 'a');
            assert.strictEqual(d.completion.label, 'p');
        });
        test('keep snippet sorting with prefix: top, #25495', function () {
            model = new completionModel_1.$85([
                $a$b('Snippet1', 1, 27 /* languages.CompletionItemKind.Snippet */),
                $a$b('tnippet2', 1, 27 /* languages.CompletionItemKind.Snippet */),
                $a$b('semver', 1, 9 /* languages.CompletionItemKind.Property */),
            ], 1, {
                leadingLineContent: 's',
                characterCountDelta: 0
            }, wordDistance_1.$P5.None, defaultOptions, 'top', undefined);
            assert.strictEqual(model.items.length, 2);
            const [a, b] = model.items;
            assert.strictEqual(a.completion.label, 'Snippet1');
            assert.strictEqual(b.completion.label, 'semver');
            assert.ok(a.score < b.score); // snippet really promoted
        });
        test('keep snippet sorting with prefix: bottom, #25495', function () {
            model = new completionModel_1.$85([
                $a$b('snippet1', 1, 27 /* languages.CompletionItemKind.Snippet */),
                $a$b('tnippet2', 1, 27 /* languages.CompletionItemKind.Snippet */),
                $a$b('Semver', 1, 9 /* languages.CompletionItemKind.Property */),
            ], 1, {
                leadingLineContent: 's',
                characterCountDelta: 0
            }, wordDistance_1.$P5.None, defaultOptions, 'bottom', undefined);
            assert.strictEqual(model.items.length, 2);
            const [a, b] = model.items;
            assert.strictEqual(a.completion.label, 'Semver');
            assert.strictEqual(b.completion.label, 'snippet1');
            assert.ok(a.score < b.score); // snippet really demoted
        });
        test('keep snippet sorting with prefix: inline, #25495', function () {
            model = new completionModel_1.$85([
                $a$b('snippet1', 1, 27 /* languages.CompletionItemKind.Snippet */),
                $a$b('tnippet2', 1, 27 /* languages.CompletionItemKind.Snippet */),
                $a$b('Semver', 1),
            ], 1, {
                leadingLineContent: 's',
                characterCountDelta: 0
            }, wordDistance_1.$P5.None, defaultOptions, 'inline', undefined);
            assert.strictEqual(model.items.length, 2);
            const [a, b] = model.items;
            assert.strictEqual(a.completion.label, 'snippet1');
            assert.strictEqual(b.completion.label, 'Semver');
            assert.ok(a.score > b.score); // snippet really demoted
        });
        test('filterText seems ignored in autocompletion, #26874', function () {
            const item1 = $a$b('Map - java.util', 1, undefined, undefined, undefined, undefined, 'Map');
            const item2 = $a$b('Map - java.util', 1);
            model = new completionModel_1.$85([item1, item2], 1, {
                leadingLineContent: 'M',
                characterCountDelta: 0
            }, wordDistance_1.$P5.None, editorOptions_1.EditorOptions.suggest.defaultValue, editorOptions_1.EditorOptions.snippetSuggestions.defaultValue, undefined);
            assert.strictEqual(model.items.length, 2);
            model.lineContext = {
                leadingLineContent: 'Map ',
                characterCountDelta: 3
            };
            assert.strictEqual(model.items.length, 1);
        });
        test('Vscode 1.12 no longer obeys \'sortText\' in completion items (from language server), #26096', function () {
            const item1 = $a$b('<- groups', 2, 9 /* languages.CompletionItemKind.Property */, false, { lineNumber: 1, column: 3 }, '00002', '  groups');
            const item2 = $a$b('source', 0, 9 /* languages.CompletionItemKind.Property */, false, { lineNumber: 1, column: 3 }, '00001', 'source');
            const items = [item1, item2].sort((0, suggest_1.$45)(1 /* SnippetSortOrder.Inline */));
            model = new completionModel_1.$85(items, 3, {
                leadingLineContent: '  ',
                characterCountDelta: 0
            }, wordDistance_1.$P5.None, editorOptions_1.EditorOptions.suggest.defaultValue, editorOptions_1.EditorOptions.snippetSuggestions.defaultValue, undefined);
            assert.strictEqual(model.items.length, 2);
            const [first, second] = model.items;
            assert.strictEqual(first.completion.label, 'source');
            assert.strictEqual(second.completion.label, '<- groups');
        });
        test('Completion item sorting broken when using label details #153026', function () {
            const itemZZZ = $a$b({ label: 'ZZZ' }, 0, 11 /* languages.CompletionItemKind.Operator */, false);
            const itemAAA = $a$b({ label: 'AAA' }, 0, 11 /* languages.CompletionItemKind.Operator */, false);
            const itemIII = $a$b('III', 0, 11 /* languages.CompletionItemKind.Operator */, false);
            const cmp = (0, suggest_1.$45)(1 /* SnippetSortOrder.Inline */);
            const actual = [itemZZZ, itemAAA, itemIII].sort(cmp);
            assert.deepStrictEqual(actual, [itemAAA, itemIII, itemZZZ]);
        });
        test('Score only filtered items when typing more, score all when typing less', function () {
            model = new completionModel_1.$85([
                $a$b('console', 0),
                $a$b('co_new', 0),
                $a$b('bar', 0),
                $a$b('car', 0),
                $a$b('foo', 0),
            ], 1, {
                leadingLineContent: '',
                characterCountDelta: 0
            }, wordDistance_1.$P5.None, editorOptions_1.EditorOptions.suggest.defaultValue, editorOptions_1.EditorOptions.snippetSuggestions.defaultValue, undefined);
            assert.strictEqual(model.items.length, 5);
            // narrow down once
            model.lineContext = { leadingLineContent: 'c', characterCountDelta: 1 };
            assert.strictEqual(model.items.length, 3);
            // query gets longer, narrow down the narrow-down'ed-set from before
            model.lineContext = { leadingLineContent: 'cn', characterCountDelta: 2 };
            assert.strictEqual(model.items.length, 2);
            // query gets shorter, refilter everything
            model.lineContext = { leadingLineContent: '', characterCountDelta: 0 };
            assert.strictEqual(model.items.length, 5);
        });
        test('Have more relaxed suggest matching algorithm #15419', function () {
            model = new completionModel_1.$85([
                $a$b('result', 0),
                $a$b('replyToUser', 0),
                $a$b('randomLolut', 0),
                $a$b('car', 0),
                $a$b('foo', 0),
            ], 1, {
                leadingLineContent: '',
                characterCountDelta: 0
            }, wordDistance_1.$P5.None, editorOptions_1.EditorOptions.suggest.defaultValue, editorOptions_1.EditorOptions.snippetSuggestions.defaultValue, undefined);
            // query gets longer, narrow down the narrow-down'ed-set from before
            model.lineContext = { leadingLineContent: 'rlut', characterCountDelta: 4 };
            assert.strictEqual(model.items.length, 3);
            const [first, second, third] = model.items;
            assert.strictEqual(first.completion.label, 'result'); // best with `rult`
            assert.strictEqual(second.completion.label, 'replyToUser'); // best with `rltu`
            assert.strictEqual(third.completion.label, 'randomLolut'); // best with `rlut`
        });
        test('Emmet suggestion not appearing at the top of the list in jsx files, #39518', function () {
            model = new completionModel_1.$85([
                $a$b('from', 0),
                $a$b('form', 0),
                $a$b('form:get', 0),
                $a$b('testForeignMeasure', 0),
                $a$b('fooRoom', 0),
            ], 1, {
                leadingLineContent: '',
                characterCountDelta: 0
            }, wordDistance_1.$P5.None, editorOptions_1.EditorOptions.suggest.defaultValue, editorOptions_1.EditorOptions.snippetSuggestions.defaultValue, undefined);
            model.lineContext = { leadingLineContent: 'form', characterCountDelta: 4 };
            assert.strictEqual(model.items.length, 5);
            const [first, second, third] = model.items;
            assert.strictEqual(first.completion.label, 'form'); // best with `form`
            assert.strictEqual(second.completion.label, 'form:get'); // best with `form`
            assert.strictEqual(third.completion.label, 'from'); // best with `from`
        });
    });
});
//# sourceMappingURL=completionModel.test.js.map