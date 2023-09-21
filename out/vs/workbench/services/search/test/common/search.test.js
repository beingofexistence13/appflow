define(["require", "exports", "assert", "vs/workbench/services/search/common/search"], function (require, exports, assert, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('TextSearchResult', () => {
        const previewOptions1 = {
            matchLines: 1,
            charsPerLine: 100
        };
        function assertOneLinePreviewRangeText(text, result) {
            assert.strictEqual(result.preview.text.substring(result.preview.matches.startColumn, result.preview.matches.endColumn), text);
        }
        test('empty without preview options', () => {
            const range = new search_1.OneLineRange(5, 0, 0);
            const result = new search_1.TextSearchMatch('', range);
            assert.deepStrictEqual(result.ranges, range);
            assertOneLinePreviewRangeText('', result);
        });
        test('empty with preview options', () => {
            const range = new search_1.OneLineRange(5, 0, 0);
            const result = new search_1.TextSearchMatch('', range, previewOptions1);
            assert.deepStrictEqual(result.ranges, range);
            assertOneLinePreviewRangeText('', result);
        });
        test('short without preview options', () => {
            const range = new search_1.OneLineRange(5, 4, 7);
            const result = new search_1.TextSearchMatch('foo bar', range);
            assert.deepStrictEqual(result.ranges, range);
            assertOneLinePreviewRangeText('bar', result);
        });
        test('short with preview options', () => {
            const range = new search_1.OneLineRange(5, 4, 7);
            const result = new search_1.TextSearchMatch('foo bar', range, previewOptions1);
            assert.deepStrictEqual(result.ranges, range);
            assertOneLinePreviewRangeText('bar', result);
        });
        test('leading', () => {
            const range = new search_1.OneLineRange(5, 25, 28);
            const result = new search_1.TextSearchMatch('long text very long text foo', range, previewOptions1);
            assert.deepStrictEqual(result.ranges, range);
            assertOneLinePreviewRangeText('foo', result);
        });
        test('trailing', () => {
            const range = new search_1.OneLineRange(5, 0, 3);
            const result = new search_1.TextSearchMatch('foo long text very long text long text very long text long text very long text long text very long text long text very long text', range, previewOptions1);
            assert.deepStrictEqual(result.ranges, range);
            assertOneLinePreviewRangeText('foo', result);
        });
        test('middle', () => {
            const range = new search_1.OneLineRange(5, 30, 33);
            const result = new search_1.TextSearchMatch('long text very long text long foo text very long text long text very long text long text very long text long text very long text', range, previewOptions1);
            assert.deepStrictEqual(result.ranges, range);
            assertOneLinePreviewRangeText('foo', result);
        });
        test('truncating match', () => {
            const previewOptions = {
                matchLines: 1,
                charsPerLine: 1
            };
            const range = new search_1.OneLineRange(0, 4, 7);
            const result = new search_1.TextSearchMatch('foo bar', range, previewOptions);
            assert.deepStrictEqual(result.ranges, range);
            assertOneLinePreviewRangeText('b', result);
        });
        test('one line of multiline match', () => {
            const previewOptions = {
                matchLines: 1,
                charsPerLine: 10000
            };
            const range = new search_1.SearchRange(5, 4, 6, 3);
            const result = new search_1.TextSearchMatch('foo bar\nfoo bar', range, previewOptions);
            assert.deepStrictEqual(result.ranges, range);
            assert.strictEqual(result.preview.text, 'foo bar\nfoo bar');
            assert.strictEqual(result.preview.matches.startLineNumber, 0);
            assert.strictEqual(result.preview.matches.startColumn, 4);
            assert.strictEqual(result.preview.matches.endLineNumber, 1);
            assert.strictEqual(result.preview.matches.endColumn, 3);
        });
        test('compacts multiple ranges on long lines', () => {
            const previewOptions = {
                matchLines: 1,
                charsPerLine: 10
            };
            const range1 = new search_1.SearchRange(5, 4, 5, 7);
            const range2 = new search_1.SearchRange(5, 133, 5, 136);
            const range3 = new search_1.SearchRange(5, 141, 5, 144);
            const result = new search_1.TextSearchMatch('foo bar 123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890 foo bar baz bar', [range1, range2, range3], previewOptions);
            assert.deepStrictEqual(result.preview.matches, [new search_1.OneLineRange(0, 4, 7), new search_1.OneLineRange(0, 42, 45), new search_1.OneLineRange(0, 50, 53)]);
            assert.strictEqual(result.preview.text, 'foo bar 123456⟪ 117 characters skipped ⟫o bar baz bar');
        });
        test('trims lines endings', () => {
            const range = new search_1.SearchRange(5, 3, 5, 5);
            const previewOptions = {
                matchLines: 1,
                charsPerLine: 10000
            };
            assert.strictEqual(new search_1.TextSearchMatch('foo bar\n', range, previewOptions).preview.text, 'foo bar');
            assert.strictEqual(new search_1.TextSearchMatch('foo bar\r\n', range, previewOptions).preview.text, 'foo bar');
        });
        // test('all lines of multiline match', () => {
        // 	const previewOptions: ITextSearchPreviewOptions = {
        // 		matchLines: 5,
        // 		charsPerLine: 10000
        // 	};
        // 	const range = new SearchRange(5, 4, 6, 3);
        // 	const result = new TextSearchResult('foo bar\nfoo bar', range, previewOptions);
        // 	assert.deepStrictEqual(result.range, range);
        // 	assertPreviewRangeText('bar\nfoo', result);
        // });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc2VhcmNoL3Rlc3QvY29tbW9uL3NlYXJjaC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQU9BLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7UUFFOUIsTUFBTSxlQUFlLEdBQThCO1lBQ2xELFVBQVUsRUFBRSxDQUFDO1lBQ2IsWUFBWSxFQUFFLEdBQUc7U0FDakIsQ0FBQztRQUVGLFNBQVMsNkJBQTZCLENBQUMsSUFBWSxFQUFFLE1BQXVCO1lBQzNFLE1BQU0sQ0FBQyxXQUFXLENBQ2pCLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBZSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQVEsQ0FBQyxXQUFXLEVBQWdCLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBUSxDQUFDLFNBQVMsQ0FBQyxFQUNqSSxJQUFJLENBQUMsQ0FBQztRQUNSLENBQUM7UUFFRCxJQUFJLENBQUMsK0JBQStCLEVBQUUsR0FBRyxFQUFFO1lBQzFDLE1BQU0sS0FBSyxHQUFHLElBQUkscUJBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sTUFBTSxHQUFHLElBQUksd0JBQWUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzdDLDZCQUE2QixDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7WUFDdkMsTUFBTSxLQUFLLEdBQUcsSUFBSSxxQkFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FB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