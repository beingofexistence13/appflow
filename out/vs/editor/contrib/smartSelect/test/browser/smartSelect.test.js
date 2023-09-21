define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/model", "vs/editor/contrib/smartSelect/browser/bracketSelections", "vs/editor/contrib/smartSelect/browser/smartSelect", "vs/editor/contrib/smartSelect/browser/wordSelections", "vs/editor/test/common/testTextModel", "vs/editor/test/common/modes/supports/javascriptOnEnterRules", "vs/editor/common/languageFeatureRegistry", "vs/editor/common/languages/language"], function (require, exports, assert, cancellation_1, event_1, lifecycle_1, uri_1, position_1, range_1, languageConfigurationRegistry_1, model_1, bracketSelections_1, smartSelect_1, wordSelections_1, testTextModel_1, javascriptOnEnterRules_1, languageFeatureRegistry_1, language_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StaticLanguageSelector {
        constructor(languageId) {
            this.languageId = languageId;
            this.onDidChange = event_1.Event.None;
        }
    }
    suite('SmartSelect', () => {
        const OriginalBracketSelectionRangeProviderMaxDuration = bracketSelections_1.BracketSelectionRangeProvider._maxDuration;
        suiteSetup(() => {
            bracketSelections_1.BracketSelectionRangeProvider._maxDuration = 5000; // 5 seconds
        });
        suiteTeardown(() => {
            bracketSelections_1.BracketSelectionRangeProvider._maxDuration = OriginalBracketSelectionRangeProviderMaxDuration;
        });
        const languageId = 'mockJSMode';
        let disposables;
        let modelService;
        const providers = new languageFeatureRegistry_1.LanguageFeatureRegistry();
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
            const instantiationService = (0, testTextModel_1.createModelServices)(disposables);
            modelService = instantiationService.get(model_1.IModelService);
            const languagConfigurationService = instantiationService.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
            const languageService = instantiationService.get(language_1.ILanguageService);
            disposables.add(languageService.registerLanguage({ id: languageId }));
            disposables.add(languagConfigurationService.register(languageId, {
                brackets: [
                    ['(', ')'],
                    ['{', '}'],
                    ['[', ']']
                ],
                onEnterRules: javascriptOnEnterRules_1.javascriptOnEnterRules,
                wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\$\%\^\&\*\(\)\=\+\[\{\]\}\\\;\:\'\"\,\.\<\>\/\?\s]+)/g
            }));
        });
        teardown(() => {
            disposables.dispose();
        });
        async function assertGetRangesToPosition(text, lineNumber, column, ranges, selectLeadingAndTrailingWhitespace = true) {
            const uri = uri_1.URI.file('test.js');
            const model = modelService.createModel(text.join('\n'), new StaticLanguageSelector(languageId), uri);
            const [actual] = await (0, smartSelect_1.provideSelectionRanges)(providers, model, [new position_1.Position(lineNumber, column)], { selectLeadingAndTrailingWhitespace, selectSubwords: true }, cancellation_1.CancellationToken.None);
            const actualStr = actual.map(r => new range_1.Range(r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn).toString());
            const desiredStr = ranges.reverse().map(r => String(r));
            assert.deepStrictEqual(actualStr, desiredStr, `\nA: ${actualStr} VS \nE: ${desiredStr}`);
            modelService.destroyModel(uri);
        }
        test('getRangesToPosition #1', () => {
            return assertGetRangesToPosition([
                'function a(bar, foo){',
                '\tif (bar) {',
                '\t\treturn (bar + (2 * foo))',
                '\t}',
                '}'
            ], 3, 20, [
                new range_1.Range(1, 1, 5, 2),
                new range_1.Range(1, 21, 5, 2),
                new range_1.Range(1, 22, 5, 1),
                new range_1.Range(2, 1, 4, 3),
                new range_1.Range(2, 1, 4, 3),
                new range_1.Range(2, 2, 4, 3),
                new range_1.Range(2, 11, 4, 3),
                new range_1.Range(2, 12, 4, 2),
                new range_1.Range(3, 1, 3, 27),
                new range_1.Range(3, 3, 3, 27),
                new range_1.Range(3, 10, 3, 27),
                new range_1.Range(3, 11, 3, 26),
                new range_1.Range(3, 17, 3, 26),
                new range_1.Range(3, 18, 3, 25), // () inside
            ]);
        });
        test('config: selectLeadingAndTrailingWhitespace', async () => {
            await assertGetRangesToPosition([
                'aaa',
                '\tbbb',
                ''
            ], 2, 3, [
                new range_1.Range(1, 1, 3, 1),
                new range_1.Range(2, 1, 2, 5),
                new range_1.Range(2, 2, 2, 5), // bbb
            ], true);
            await assertGetRangesToPosition([
                'aaa',
                '\tbbb',
                ''
            ], 2, 3, [
                new range_1.Range(1, 1, 3, 1),
                new range_1.Range(2, 2, 2, 5), // () inside
            ], false);
        });
        test('getRangesToPosition #56886. Skip empty lines correctly.', () => {
            return assertGetRangesToPosition([
                'function a(bar, foo){',
                '\tif (bar) {',
                '',
                '\t}',
                '}'
            ], 3, 1, [
                new range_1.Range(1, 1, 5, 2),
                new range_1.Range(1, 21, 5, 2),
                new range_1.Range(1, 22, 5, 1),
                new range_1.Range(2, 1, 4, 3),
                new range_1.Range(2, 1, 4, 3),
                new range_1.Range(2, 2, 4, 3),
                new range_1.Range(2, 11, 4, 3),
                new range_1.Range(2, 12, 4, 2),
            ]);
        });
        test('getRangesToPosition #56886. Do not skip lines with only whitespaces.', () => {
            return assertGetRangesToPosition([
                'function a(bar, foo){',
                '\tif (bar) {',
                ' ',
                '\t}',
                '}'
            ], 3, 1, [
                new range_1.Range(1, 1, 5, 2),
                new range_1.Range(1, 21, 5, 2),
                new range_1.Range(1, 22, 5, 1),
                new range_1.Range(2, 1, 4, 3),
                new range_1.Range(2, 1, 4, 3),
                new range_1.Range(2, 2, 4, 3),
                new range_1.Range(2, 11, 4, 3),
                new range_1.Range(2, 12, 4, 2),
                new range_1.Range(3, 1, 3, 2),
                new range_1.Range(3, 1, 3, 2) // empty line
            ]);
        });
        test('getRangesToPosition #40658. Cursor at first position inside brackets should select line inside.', () => {
            return assertGetRangesToPosition([
                ' [ ]',
                ' { } ',
                '( ) '
            ], 2, 3, [
                new range_1.Range(1, 1, 3, 5),
                new range_1.Range(2, 1, 2, 6),
                new range_1.Range(2, 2, 2, 5),
                new range_1.Range(2, 3, 2, 4) // {} inside
            ]);
        });
        test('getRangesToPosition #40658. Cursor in empty brackets should reveal brackets first.', () => {
            return assertGetRangesToPosition([
                ' [] ',
                ' { } ',
                '  ( ) '
            ], 1, 3, [
                new range_1.Range(1, 1, 3, 7),
                new range_1.Range(1, 1, 1, 5),
                new range_1.Range(1, 2, 1, 4),
                new range_1.Range(1, 3, 1, 3), // [] inside
            ]);
        });
        test('getRangesToPosition #40658. Tokens before bracket will be revealed first.', () => {
            return assertGetRangesToPosition([
                '  [] ',
                ' { } ',
                'selectthis( ) '
            ], 3, 11, [
                new range_1.Range(1, 1, 3, 15),
                new range_1.Range(3, 1, 3, 15),
                new range_1.Range(3, 1, 3, 14),
                new range_1.Range(3, 1, 3, 11) // word
            ]);
        });
        // -- bracket selections
        async function assertRanges(provider, value, ...expected) {
            const index = value.indexOf('|');
            value = value.replace('|', ''); // CodeQL [SM02383] js/incomplete-sanitization this is purpose only the first | character
            const model = modelService.createModel(value, new StaticLanguageSelector(languageId), uri_1.URI.parse('fake:lang'));
            const pos = model.getPositionAt(index);
            const all = await provider.provideSelectionRanges(model, [pos], cancellation_1.CancellationToken.None);
            const ranges = all[0];
            modelService.destroyModel(model.uri);
            assert.strictEqual(expected.length, ranges.length);
            for (const range of ranges) {
                const exp = expected.shift() || null;
                assert.ok(range_1.Range.equalsRange(range.range, exp), `A=${range.range} <> E=${exp}`);
            }
        }
        test('bracket selection', async () => {
            await assertRanges(new bracketSelections_1.BracketSelectionRangeProvider(), '(|)', new range_1.Range(1, 2, 1, 2), new range_1.Range(1, 1, 1, 3));
            await assertRanges(new bracketSelections_1.BracketSelectionRangeProvider(), '[[[](|)]]', new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 5, 1, 7), // ()
            new range_1.Range(1, 3, 1, 7), new range_1.Range(1, 2, 1, 8), // [[]()]
            new range_1.Range(1, 2, 1, 8), new range_1.Range(1, 1, 1, 9));
            await assertRanges(new bracketSelections_1.BracketSelectionRangeProvider(), '[a[](|)a]', new range_1.Range(1, 6, 1, 6), new range_1.Range(1, 5, 1, 7), new range_1.Range(1, 2, 1, 8), new range_1.Range(1, 1, 1, 9));
            // no bracket
            await assertRanges(new bracketSelections_1.BracketSelectionRangeProvider(), 'fofof|fofo');
            // empty
            await assertRanges(new bracketSelections_1.BracketSelectionRangeProvider(), '[[[]()]]|');
            await assertRanges(new bracketSelections_1.BracketSelectionRangeProvider(), '|[[[]()]]');
            // edge
            await assertRanges(new bracketSelections_1.BracketSelectionRangeProvider(), '[|[[]()]]', new range_1.Range(1, 2, 1, 8), new range_1.Range(1, 1, 1, 9));
            await assertRanges(new bracketSelections_1.BracketSelectionRangeProvider(), '[[[]()]|]', new range_1.Range(1, 2, 1, 8), new range_1.Range(1, 1, 1, 9));
            await assertRanges(new bracketSelections_1.BracketSelectionRangeProvider(), 'aaa(aaa)bbb(b|b)ccc(ccc)', new range_1.Range(1, 13, 1, 15), new range_1.Range(1, 12, 1, 16));
            await assertRanges(new bracketSelections_1.BracketSelectionRangeProvider(), '(aaa(aaa)bbb(b|b)ccc(ccc))', new range_1.Range(1, 14, 1, 16), new range_1.Range(1, 13, 1, 17), new range_1.Range(1, 2, 1, 25), new range_1.Range(1, 1, 1, 26));
        });
        test('bracket with leading/trailing', async () => {
            await assertRanges(new bracketSelections_1.BracketSelectionRangeProvider(), 'for(a of b){\n  foo(|);\n}', new range_1.Range(2, 7, 2, 7), new range_1.Range(2, 6, 2, 8), new range_1.Range(1, 13, 3, 1), new range_1.Range(1, 12, 3, 2), new range_1.Range(1, 1, 3, 2), new range_1.Range(1, 1, 3, 2));
            await assertRanges(new bracketSelections_1.BracketSelectionRangeProvider(), 'for(a of b)\n{\n  foo(|);\n}', new range_1.Range(3, 7, 3, 7), new range_1.Range(3, 6, 3, 8), new range_1.Range(2, 2, 4, 1), new range_1.Range(2, 1, 4, 2), new range_1.Range(1, 1, 4, 2), new range_1.Range(1, 1, 4, 2));
        });
        test('in-word ranges', async () => {
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(), 'f|ooBar', new range_1.Range(1, 1, 1, 4), // foo
            new range_1.Range(1, 1, 1, 7), // fooBar
            new range_1.Range(1, 1, 1, 7));
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(), 'f|oo_Ba', new range_1.Range(1, 1, 1, 4), new range_1.Range(1, 1, 1, 7), new range_1.Range(1, 1, 1, 7));
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(), 'f|oo-Ba', new range_1.Range(1, 1, 1, 4), new range_1.Range(1, 1, 1, 7), new range_1.Range(1, 1, 1, 7));
        });
        test('in-word ranges with selectSubwords=false', async () => {
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(false), 'f|ooBar', new range_1.Range(1, 1, 1, 7), new range_1.Range(1, 1, 1, 7));
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(false), 'f|oo_Ba', new range_1.Range(1, 1, 1, 7), new range_1.Range(1, 1, 1, 7));
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(false), 'f|oo-Ba', new range_1.Range(1, 1, 1, 7), new range_1.Range(1, 1, 1, 7));
        });
        test('Default selection should select current word/hump first in camelCase #67493', async function () {
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(), 'Abs|tractSmartSelect', new range_1.Range(1, 1, 1, 9), new range_1.Range(1, 1, 1, 20), new range_1.Range(1, 1, 1, 20));
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(), 'AbstractSma|rtSelect', new range_1.Range(1, 9, 1, 14), new range_1.Range(1, 1, 1, 20), new range_1.Range(1, 1, 1, 20));
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(), 'Abstrac-Sma|rt-elect', new range_1.Range(1, 9, 1, 14), new range_1.Range(1, 1, 1, 20), new range_1.Range(1, 1, 1, 20));
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(), 'Abstrac_Sma|rt_elect', new range_1.Range(1, 9, 1, 14), new range_1.Range(1, 1, 1, 20), new range_1.Range(1, 1, 1, 20));
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(), 'Abstrac_Sma|rt-elect', new range_1.Range(1, 9, 1, 14), new range_1.Range(1, 1, 1, 20), new range_1.Range(1, 1, 1, 20));
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(), 'Abstrac_Sma|rtSelect', new range_1.Range(1, 9, 1, 14), new range_1.Range(1, 1, 1, 20), new range_1.Range(1, 1, 1, 20));
        });
        test('Smart select: only add line ranges if they\'re contained by the next range #73850', async function () {
            const reg = providers.register('*', {
                provideSelectionRanges() {
                    return [[
                            { range: { startLineNumber: 1, startColumn: 10, endLineNumber: 1, endColumn: 11 } },
                            { range: { startLineNumber: 1, startColumn: 10, endLineNumber: 3, endColumn: 2 } },
                            { range: { startLineNumber: 1, startColumn: 1, endLineNumber: 3, endColumn: 2 } },
                        ]];
                }
            });
            await assertGetRangesToPosition(['type T = {', '\tx: number', '}'], 1, 10, [
                new range_1.Range(1, 1, 3, 2),
                new range_1.Range(1, 10, 3, 2),
                new range_1.Range(1, 10, 1, 11), // {
            ]);
            reg.dispose();
        });
        test('Expand selection in words with underscores is inconsistent #90589', async function () {
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(), 'Hel|lo_World', new range_1.Range(1, 1, 1, 6), new range_1.Range(1, 1, 1, 12), new range_1.Range(1, 1, 1, 12));
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(), 'Hello_Wo|rld', new range_1.Range(1, 7, 1, 12), new range_1.Range(1, 1, 1, 12), new range_1.Range(1, 1, 1, 12));
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(), 'Hello|_World', new range_1.Range(1, 1, 1, 6), new range_1.Range(1, 1, 1, 12), new range_1.Range(1, 1, 1, 12));
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(), 'Hello_|World', new range_1.Range(1, 7, 1, 12), new range_1.Range(1, 1, 1, 12), new range_1.Range(1, 1, 1, 12));
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(), 'Hello|-World', new range_1.Range(1, 1, 1, 6), new range_1.Range(1, 1, 1, 12), new range_1.Range(1, 1, 1, 12));
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(), 'Hello-|World', new range_1.Range(1, 7, 1, 12), new range_1.Range(1, 1, 1, 12), new range_1.Range(1, 1, 1, 12));
            await assertRanges(new wordSelections_1.WordSelectionRangeProvider(), 'Hello|World', new range_1.Range(1, 6, 1, 11), new range_1.Range(1, 1, 1, 11), new range_1.Range(1, 1, 1, 11));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic21hcnRTZWxlY3QudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3NtYXJ0U2VsZWN0L3Rlc3QvYnJvd3Nlci9zbWFydFNlbGVjdC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQXNCQSxNQUFNLHNCQUFzQjtRQUUzQixZQUE0QixVQUFrQjtZQUFsQixlQUFVLEdBQVYsVUFBVSxDQUFRO1lBRHJDLGdCQUFXLEdBQWtCLGFBQUssQ0FBQyxJQUFJLENBQUM7UUFDQyxDQUFDO0tBQ25EO0lBRUQsS0FBSyxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUU7UUFFekIsTUFBTSxnREFBZ0QsR0FBRyxpREFBNkIsQ0FBQyxZQUFZLENBQUM7UUFFcEcsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNmLGlEQUE2QixDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsQ0FBQyxZQUFZO1FBQ2hFLENBQUMsQ0FBQyxDQUFDO1FBRUgsYUFBYSxDQUFDLEdBQUcsRUFBRTtZQUNsQixpREFBNkIsQ0FBQyxZQUFZLEdBQUcsZ0RBQWdELENBQUM7UUFDL0YsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUM7UUFDaEMsSUFBSSxXQUE0QixDQUFDO1FBQ2pDLElBQUksWUFBMkIsQ0FBQztRQUNoQyxNQUFNLFNBQVMsR0FBRyxJQUFJLGlEQUF1QixFQUEwQixDQUFDO1FBRXhFLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixXQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDcEMsTUFBTSxvQkFBb0IsR0FBRyxJQUFBLG1DQUFtQixFQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzlELFlBQVksR0FBRyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMscUJBQWEsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sMkJBQTJCLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFD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LENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDckIsQ0FBQztZQUVGLE1BQU0sWUFBWSxDQUFDLElBQUksMkNBQTBCLEVBQUUsRUFBRSxTQUFTLEVBQzdELElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNyQixJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDckIsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3JCLENBQUM7WUFFRixNQUFNLFlBQVksQ0FBQyxJQUFJLDJDQUEwQixFQUFFLEVBQUUsU0FBUyxFQUM3RCxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDckIsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3JCLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUNyQixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsMENBQTBDLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFFM0QsTUFBTSxZQUFZLENBQUMsSUFBSSwyQ0FBMEIsQ0FBQyxLQUFLLENBQUMsRUFBRSxTQUFTLEVBQ2xFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNyQixJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDckIsQ0FBQztZQUVGLE1BQU0sWUFBWSxDQUFDLElBQUksMkNBQTBCLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxFQUNsRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDckIsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQ3JCLENBQUM7WUFFRixNQUFNLFlBQVksQ0FBQyxJQUFJLDJDQUEwQixDQUFDLEtBQUssQ0FBQyxFQUFFLFNBQVMsRUFDbEUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ3JCLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUNyQixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsNkVBQTZFLEVBQUUsS0FBSztZQUV4RixNQUFNLFlBQVksQ0FBQyxJQUFJLDJDQUEwQixFQUFFLEVBQUUsc0JBQXNCLEVBQzFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNyQixJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDdEIsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQ3RCLENBQUM7WUFFRixNQUFNLFlBQVksQ0FBQyxJQUFJLDJDQUEwQixFQUFFLEVBQUUsc0JBQXNCLEVBQzFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUN0QixJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDdEIsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQ3RCLENBQUM7WUFFRixNQUFNLFlBQVksQ0FBQyxJQUFJLDJDQUEwQixFQUFFLEVBQUUsc0JBQXNCLEVBQzFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUN0QixJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDdEIsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQ3RCLENBQUM7WUFFRixNQUFNLFlBQVksQ0FBQyxJQUFJLDJDQUEwQixFQUFFLEVBQUUsc0JBQXNCLEVBQzFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUN0QixJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDdEIsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQ3RCLENBQUM7WUFFRixNQUFNLFlBQVksQ0FBQyxJQUFJLDJDQUEwQixFQUFFLEVBQUUsc0JBQXNCLEVBQzFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUN0QixJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDdEIsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQ3RCLENBQUM7WUFFRixNQUFNLFlBQVksQ0FBQyxJQUFJLDJDQUEwQixFQUFFLEVBQUUsc0JBQXNCLEVBQzFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUN0QixJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFDdEIsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQ3RCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxtRkFBbUYs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