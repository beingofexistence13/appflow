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
            const range = new search_1.$vI(5, 0, 0);
            const result = new search_1.$tI('', range);
            assert.deepStrictEqual(result.ranges, range);
            assertOneLinePreviewRangeText('', result);
        });
        test('empty with preview options', () => {
            const range = new search_1.$vI(5, 0, 0);
            const result = new search_1.$tI('', range, previewOptions1);
            assert.deepStrictEqual(result.ranges, range);
            assertOneLinePreviewRangeText('', result);
        });
        test('short without preview options', () => {
            const range = new search_1.$vI(5, 4, 7);
            const result = new search_1.$tI('foo bar', range);
            assert.deepStrictEqual(result.ranges, range);
            assertOneLinePreviewRangeText('bar', result);
        });
        test('short with preview options', () => {
            const range = new search_1.$vI(5, 4, 7);
            const result = new search_1.$tI('foo bar', range, previewOptions1);
            assert.deepStrictEqual(result.ranges, range);
            assertOneLinePreviewRangeText('bar', result);
        });
        test('leading', () => {
            const range = new search_1.$vI(5, 25, 28);
            const result = new search_1.$tI('long text very long text foo', range, previewOptions1);
            assert.deepStrictEqual(result.ranges, range);
            assertOneLinePreviewRangeText('foo', result);
        });
        test('trailing', () => {
            const range = new search_1.$vI(5, 0, 3);
            const result = new search_1.$tI('foo long text very long text long text very long text long text very long text long text very long text long text very long text', range, previewOptions1);
            assert.deepStrictEqual(result.ranges, range);
            assertOneLinePreviewRangeText('foo', result);
        });
        test('middle', () => {
            const range = new search_1.$vI(5, 30, 33);
            const result = new search_1.$tI('long text very long text long foo text very long text long text very long text long text very long text long text very long text', range, previewOptions1);
            assert.deepStrictEqual(result.ranges, range);
            assertOneLinePreviewRangeText('foo', result);
        });
        test('truncating match', () => {
            const previewOptions = {
                matchLines: 1,
                charsPerLine: 1
            };
            const range = new search_1.$vI(0, 4, 7);
            const result = new search_1.$tI('foo bar', range, previewOptions);
            assert.deepStrictEqual(result.ranges, range);
            assertOneLinePreviewRangeText('b', result);
        });
        test('one line of multiline match', () => {
            const previewOptions = {
                matchLines: 1,
                charsPerLine: 10000
            };
            const range = new search_1.$uI(5, 4, 6, 3);
            const result = new search_1.$tI('foo bar\nfoo bar', range, previewOptions);
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
            const range1 = new search_1.$uI(5, 4, 5, 7);
            const range2 = new search_1.$uI(5, 133, 5, 136);
            const range3 = new search_1.$uI(5, 141, 5, 144);
            const result = new search_1.$tI('foo bar 123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890 foo bar baz bar', [range1, range2, range3], previewOptions);
            assert.deepStrictEqual(result.preview.matches, [new search_1.$vI(0, 4, 7), new search_1.$vI(0, 42, 45), new search_1.$vI(0, 50, 53)]);
            assert.strictEqual(result.preview.text, 'foo bar 123456⟪ 117 characters skipped ⟫o bar baz bar');
        });
        test('trims lines endings', () => {
            const range = new search_1.$uI(5, 3, 5, 5);
            const previewOptions = {
                matchLines: 1,
                charsPerLine: 10000
            };
            assert.strictEqual(new search_1.$tI('foo bar\n', range, previewOptions).preview.text, 'foo bar');
            assert.strictEqual(new search_1.$tI('foo bar\r\n', range, previewOptions).preview.text, 'foo bar');
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
//# sourceMappingURL=search.test.js.map