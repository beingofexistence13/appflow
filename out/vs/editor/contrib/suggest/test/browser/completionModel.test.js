define(["require", "exports", "assert", "vs/editor/common/config/editorOptions", "vs/editor/contrib/suggest/browser/completionModel", "vs/editor/contrib/suggest/browser/suggest", "vs/editor/contrib/suggest/browser/wordDistance"], function (require, exports, assert, editorOptions_1, completionModel_1, suggest_1, wordDistance_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createSuggestItem = void 0;
    function createSuggestItem(label, overwriteBefore, kind = 9 /* languages.CompletionItemKind.Property */, incomplete = false, position = { lineNumber: 1, column: 1 }, sortText, filterText) {
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
        return new suggest_1.CompletionItem(position, suggestion, container, provider);
    }
    exports.createSuggestItem = createSuggestItem;
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
            model = new completionModel_1.CompletionModel([
                createSuggestItem('foo', 3),
                createSuggestItem('Foo', 3),
                createSuggestItem('foo', 2),
            ], 1, {
                leadingLineContent: 'foo',
                characterCountDelta: 0
            }, wordDistance_1.WordDistance.None, editorOptions_1.EditorOptions.suggest.defaultValue, editorOptions_1.EditorOptions.snippetSuggestions.defaultValue, undefined);
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
            const incompleteModel = new completionModel_1.CompletionModel([
                createSuggestItem('foo', 3, undefined, true),
                createSuggestItem('foo', 2),
            ], 1, {
                leadingLineContent: 'foo',
                characterCountDelta: 0
            }, wordDistance_1.WordDistance.None, editorOptions_1.EditorOptions.suggest.defaultValue, editorOptions_1.EditorOptions.snippetSuggestions.defaultValue, undefined);
            assert.strictEqual(incompleteModel.getIncompleteProvider().size, 1);
        });
        test('Fuzzy matching of snippets stopped working with inline snippet suggestions #49895', function () {
            const completeItem1 = createSuggestItem('foobar1', 1, undefined, false, { lineNumber: 1, column: 2 });
            const completeItem2 = createSuggestItem('foobar2', 1, undefined, false, { lineNumber: 1, column: 2 });
            const completeItem3 = createSuggestItem('foobar3', 1, undefined, false, { lineNumber: 1, column: 2 });
            const completeItem4 = createSuggestItem('foobar4', 1, undefined, false, { lineNumber: 1, column: 2 });
            const completeItem5 = createSuggestItem('foobar5', 1, undefined, false, { lineNumber: 1, column: 2 });
            const incompleteItem1 = createSuggestItem('foofoo1', 1, undefined, true, { lineNumber: 1, column: 2 });
            const model = new completionModel_1.CompletionModel([
                completeItem1,
                completeItem2,
                completeItem3,
                completeItem4,
                completeItem5,
                incompleteItem1,
            ], 2, { leadingLineContent: 'f', characterCountDelta: 0 }, wordDistance_1.WordDistance.None, editorOptions_1.EditorOptions.suggest.defaultValue, editorOptions_1.EditorOptions.snippetSuggestions.defaultValue, undefined);
            assert.strictEqual(model.getIncompleteProvider().size, 1);
            assert.strictEqual(model.items.length, 6);
        });
        test('proper current word when length=0, #16380', function () {
            model = new completionModel_1.CompletionModel([
                createSuggestItem('    </div', 4),
                createSuggestItem('a', 0),
                createSuggestItem('p', 0),
                createSuggestItem('    </tag', 4),
                createSuggestItem('    XYZ', 4),
            ], 1, {
                leadingLineContent: '   <',
                characterCountDelta: 0
            }, wordDistance_1.WordDistance.None, editorOptions_1.EditorOptions.suggest.defaultValue, editorOptions_1.EditorOptions.snippetSuggestions.defaultValue, undefined);
            assert.strictEqual(model.items.length, 4);
            const [a, b, c, d] = model.items;
            assert.strictEqual(a.completion.label, '    </div');
            assert.strictEqual(b.completion.label, '    </tag');
            assert.strictEqual(c.completion.label, 'a');
            assert.strictEqual(d.completion.label, 'p');
        });
        test('keep snippet sorting with prefix: top, #25495', function () {
            model = new completionModel_1.CompletionModel([
                createSuggestItem('Snippet1', 1, 27 /* languages.CompletionItemKind.Snippet */),
                createSuggestItem('tnippet2', 1, 27 /* languages.CompletionItemKind.Snippet */),
                createSuggestItem('semver', 1, 9 /* languages.CompletionItemKind.Property */),
            ], 1, {
                leadingLineContent: 's',
                characterCountDelta: 0
            }, wordDistance_1.WordDistance.None, defaultOptions, 'top', undefined);
            assert.strictEqual(model.items.length, 2);
            const [a, b] = model.items;
            assert.strictEqual(a.completion.label, 'Snippet1');
            assert.strictEqual(b.completion.label, 'semver');
            assert.ok(a.score < b.score); // snippet really promoted
        });
        test('keep snippet sorting with prefix: bottom, #25495', function () {
            model = new completionModel_1.CompletionModel([
                createSuggestItem('snippet1', 1, 27 /* languages.CompletionItemKind.Snippet */),
                createSuggestItem('tnippet2', 1, 27 /* languages.CompletionItemKind.Snippet */),
                createSuggestItem('Semver', 1, 9 /* languages.CompletionItemKind.Property */),
            ], 1, {
                leadingLineContent: 's',
                characterCountDelta: 0
            }, wordDistance_1.WordDistance.None, defaultOptions, 'bottom', undefined);
            assert.strictEqual(model.items.length, 2);
            const [a, b] = model.items;
            assert.strictEqual(a.completion.label, 'Semver');
            assert.strictEqual(b.completion.label, 'snippet1');
            assert.ok(a.score < b.score); // snippet really demoted
        });
        test('keep snippet sorting with prefix: inline, #25495', function () {
            model = new completionModel_1.CompletionModel([
                createSuggestItem('snippet1', 1, 27 /* languages.CompletionItemKind.Snippet */),
                createSuggestItem('tnippet2', 1, 27 /* languages.CompletionItemKind.Snippet */),
                createSuggestItem('Semver', 1),
            ], 1, {
                leadingLineContent: 's',
                characterCountDelta: 0
            }, wordDistance_1.WordDistance.None, defaultOptions, 'inline', undefined);
            assert.strictEqual(model.items.length, 2);
            const [a, b] = model.items;
            assert.strictEqual(a.completion.label, 'snippet1');
            assert.strictEqual(b.completion.label, 'Semver');
            assert.ok(a.score > b.score); // snippet really demoted
        });
        test('filterText seems ignored in autocompletion, #26874', function () {
            const item1 = createSuggestItem('Map - java.util', 1, undefined, undefined, undefined, undefined, 'Map');
            const item2 = createSuggestItem('Map - java.util', 1);
            model = new completionModel_1.CompletionModel([item1, item2], 1, {
                leadingLineContent: 'M',
                characterCountDelta: 0
            }, wordDistance_1.WordDistance.None, editorOptions_1.EditorOptions.suggest.defaultValue, editorOptions_1.EditorOptions.snippetSuggestions.defaultValue, undefined);
            assert.strictEqual(model.items.length, 2);
            model.lineContext = {
                leadingLineContent: 'Map ',
                characterCountDelta: 3
            };
            assert.strictEqual(model.items.length, 1);
        });
        test('Vscode 1.12 no longer obeys \'sortText\' in completion items (from language server), #26096', function () {
            const item1 = createSuggestItem('<- groups', 2, 9 /* languages.CompletionItemKind.Property */, false, { lineNumber: 1, column: 3 }, '00002', '  groups');
            const item2 = createSuggestItem('source', 0, 9 /* languages.CompletionItemKind.Property */, false, { lineNumber: 1, column: 3 }, '00001', 'source');
            const items = [item1, item2].sort((0, suggest_1.getSuggestionComparator)(1 /* SnippetSortOrder.Inline */));
            model = new completionModel_1.CompletionModel(items, 3, {
                leadingLineContent: '  ',
                characterCountDelta: 0
            }, wordDistance_1.WordDistance.None, editorOptions_1.EditorOptions.suggest.defaultValue, editorOptions_1.EditorOptions.snippetSuggestions.defaultValue, undefined);
            assert.strictEqual(model.items.length, 2);
            const [first, second] = model.items;
            assert.strictEqual(first.completion.label, 'source');
            assert.strictEqual(second.completion.label, '<- groups');
        });
        test('Completion item sorting broken when using label details #153026', function () {
            const itemZZZ = createSuggestItem({ label: 'ZZZ' }, 0, 11 /* languages.CompletionItemKind.Operator */, false);
            const itemAAA = createSuggestItem({ label: 'AAA' }, 0, 11 /* languages.CompletionItemKind.Operator */, false);
            const itemIII = createSuggestItem('III', 0, 11 /* languages.CompletionItemKind.Operator */, false);
            const cmp = (0, suggest_1.getSuggestionComparator)(1 /* SnippetSortOrder.Inline */);
            const actual = [itemZZZ, itemAAA, itemIII].sort(cmp);
            assert.deepStrictEqual(actual, [itemAAA, itemIII, itemZZZ]);
        });
        test('Score only filtered items when typing more, score all when typing less', function () {
            model = new completionModel_1.CompletionModel([
                createSuggestItem('console', 0),
                createSuggestItem('co_new', 0),
                createSuggestItem('bar', 0),
                createSuggestItem('car', 0),
                createSuggestItem('foo', 0),
            ], 1, {
                leadingLineContent: '',
                characterCountDelta: 0
            }, wordDistance_1.WordDistance.None, editorOptions_1.EditorOptions.suggest.defaultValue, editorOptions_1.EditorOptions.snippetSuggestions.defaultValue, undefined);
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
            model = new completionModel_1.CompletionModel([
                createSuggestItem('result', 0),
                createSuggestItem('replyToUser', 0),
                createSuggestItem('randomLolut', 0),
                createSuggestItem('car', 0),
                createSuggestItem('foo', 0),
            ], 1, {
                leadingLineContent: '',
                characterCountDelta: 0
            }, wordDistance_1.WordDistance.None, editorOptions_1.EditorOptions.suggest.defaultValue, editorOptions_1.EditorOptions.snippetSuggestions.defaultValue, undefined);
            // query gets longer, narrow down the narrow-down'ed-set from before
            model.lineContext = { leadingLineContent: 'rlut', characterCountDelta: 4 };
            assert.strictEqual(model.items.length, 3);
            const [first, second, third] = model.items;
            assert.strictEqual(first.completion.label, 'result'); // best with `rult`
            assert.strictEqual(second.completion.label, 'replyToUser'); // best with `rltu`
            assert.strictEqual(third.completion.label, 'randomLolut'); // best with `rlut`
        });
        test('Emmet suggestion not appearing at the top of the list in jsx files, #39518', function () {
            model = new completionModel_1.CompletionModel([
                createSuggestItem('from', 0),
                createSuggestItem('form', 0),
                createSuggestItem('form:get', 0),
                createSuggestItem('testForeignMeasure', 0),
                createSuggestItem('fooRoom', 0),
            ], 1, {
                leadingLineContent: '',
                characterCountDelta: 0
            }, wordDistance_1.WordDistance.None, editorOptions_1.EditorOptions.suggest.defaultValue, editorOptions_1.EditorOptions.snippetSuggestions.defaultValue, undefined);
            model.lineContext = { leadingLineContent: 'form', characterCountDelta: 4 };
            assert.strictEqual(model.items.length, 5);
            const [first, second, third] = model.items;
            assert.strictEqual(first.completion.label, 'form'); // best with `form`
            assert.strictEqual(second.completion.label, 'form:get'); // best with `form`
            assert.strictEqual(third.completion.label, 'from'); // best with `from`
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxldGlvbk1vZGVsLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9zdWdnZXN0L3Rlc3QvYnJvd3Nlci9jb21wbGV0aW9uTW9kZWwudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBWUEsU0FBZ0IsaUJBQWlCLENBQUMsS0FBNkMsRUFBRSxlQUF1QixFQUFFLElBQUksZ0RBQXdDLEVBQUUsYUFBc0IsS0FBSyxFQUFFLFdBQXNCLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsUUFBaUIsRUFBRSxVQUFtQjtRQUM5USxNQUFNLFVBQVUsR0FBNkI7WUFDNUMsS0FBSztZQUNMLFFBQVE7WUFDUixVQUFVO1lBQ1YsS0FBSyxFQUFFLEVBQUUsZUFBZSxFQUFFLFFBQVEsQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEdBQUcsZUFBZSxFQUFFLGFBQWEsRUFBRSxRQUFRLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsTUFBTSxFQUFFO1lBQy9KLFVBQVUsRUFBRSxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUs7WUFDM0QsSUFBSTtTQUNKLENBQUM7UUFDRixNQUFNLFNBQVMsR0FBNkI7WUFDM0MsVUFBVTtZQUNWLFdBQVcsRUFBRSxDQUFDLFVBQVUsQ0FBQztTQUN6QixDQUFDO1FBQ0YsTUFBTSxRQUFRLEdBQXFDO1lBQ2xELGlCQUFpQixFQUFFLE1BQU07WUFDekIsc0JBQXNCO2dCQUNyQixPQUFPO1lBQ1IsQ0FBQztTQUNELENBQUM7UUFFRixPQUFPLElBQUksd0JBQWMsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN0RSxDQUFD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