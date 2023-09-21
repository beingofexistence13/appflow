/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/iconLabels"], function (require, exports, assert, iconLabels_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function filterOk(filter, word, target, highlights) {
        const r = filter(word, target);
        assert(r);
        if (highlights) {
            assert.deepStrictEqual(r, highlights);
        }
    }
    suite('Icon Labels', () => {
        test('Can get proper aria labels', () => {
            // note, the spaces in the results are important
            const testCases = new Map([
                ['', ''],
                ['asdf', 'asdf'],
                ['asdf$(squirrel)asdf', 'asdf squirrel asdf'],
                ['asdf $(squirrel) asdf', 'asdf  squirrel  asdf'],
                ['$(rocket)asdf', 'rocket asdf'],
                ['$(rocket) asdf', 'rocket  asdf'],
                ['$(rocket)$(rocket)$(rocket)asdf', 'rocket  rocket  rocket asdf'],
                ['$(rocket) asdf $(rocket)', 'rocket  asdf  rocket'],
                ['$(rocket)asdf$(rocket)', 'rocket asdf rocket'],
            ]);
            for (const [input, expected] of testCases) {
                assert.strictEqual((0, iconLabels_1.getCodiconAriaLabel)(input), expected);
            }
        });
        test('matchesFuzzyIconAware', () => {
            // Camel Case
            filterOk(iconLabels_1.matchesFuzzyIconAware, 'ccr', (0, iconLabels_1.parseLabelWithIcons)('$(codicon)CamelCaseRocks$(codicon)'), [
                { start: 10, end: 11 },
                { start: 15, end: 16 },
                { start: 19, end: 20 }
            ]);
            filterOk(iconLabels_1.matchesFuzzyIconAware, 'ccr', (0, iconLabels_1.parseLabelWithIcons)('$(codicon) CamelCaseRocks $(codicon)'), [
                { start: 11, end: 12 },
                { start: 16, end: 17 },
                { start: 20, end: 21 }
            ]);
            filterOk(iconLabels_1.matchesFuzzyIconAware, 'iut', (0, iconLabels_1.parseLabelWithIcons)('$(codicon) Indent $(octico) Using $(octic) Tpaces'), [
                { start: 11, end: 12 },
                { start: 28, end: 29 },
                { start: 43, end: 44 },
            ]);
            // Prefix
            filterOk(iconLabels_1.matchesFuzzyIconAware, 'using', (0, iconLabels_1.parseLabelWithIcons)('$(codicon) Indent Using Spaces'), [
                { start: 18, end: 23 },
            ]);
            // Broken Codicon
            filterOk(iconLabels_1.matchesFuzzyIconAware, 'codicon', (0, iconLabels_1.parseLabelWithIcons)('This $(codicon Indent Using Spaces'), [
                { start: 7, end: 14 },
            ]);
            filterOk(iconLabels_1.matchesFuzzyIconAware, 'indent', (0, iconLabels_1.parseLabelWithIcons)('This $codicon Indent Using Spaces'), [
                { start: 14, end: 20 },
            ]);
            // Testing #59343
            filterOk(iconLabels_1.matchesFuzzyIconAware, 'unt', (0, iconLabels_1.parseLabelWithIcons)('$(primitive-dot) $(file-text) Untitled-1'), [
                { start: 30, end: 33 },
            ]);
            // Testing #136172
            filterOk(iconLabels_1.matchesFuzzyIconAware, 's', (0, iconLabels_1.parseLabelWithIcons)('$(loading~spin) start'), [
                { start: 16, end: 17 },
            ]);
        });
        test('stripIcons', () => {
            assert.strictEqual((0, iconLabels_1.stripIcons)('Hello World'), 'Hello World');
            assert.strictEqual((0, iconLabels_1.stripIcons)('$(Hello World'), '$(Hello World');
            assert.strictEqual((0, iconLabels_1.stripIcons)('$(Hello) World'), ' World');
            assert.strictEqual((0, iconLabels_1.stripIcons)('$(Hello) W$(oi)rld'), ' Wrld');
        });
        test('escapeIcons', () => {
            assert.strictEqual((0, iconLabels_1.escapeIcons)('Hello World'), 'Hello World');
            assert.strictEqual((0, iconLabels_1.escapeIcons)('$(Hello World'), '$(Hello World');
            assert.strictEqual((0, iconLabels_1.escapeIcons)('$(Hello) World'), '\\$(Hello) World');
            assert.strictEqual((0, iconLabels_1.escapeIcons)('\\$(Hello) W$(oi)rld'), '\\$(Hello) W\\$(oi)rld');
        });
        test('markdownEscapeEscapedIcons', () => {
            assert.strictEqual((0, iconLabels_1.markdownEscapeEscapedIcons)('Hello World'), 'Hello World');
            assert.strictEqual((0, iconLabels_1.markdownEscapeEscapedIcons)('$(Hello) World'), '$(Hello) World');
            assert.strictEqual((0, iconLabels_1.markdownEscapeEscapedIcons)('\\$(Hello) World'), '\\\\$(Hello) World');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbkxhYmVscy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS90ZXN0L2NvbW1vbi9pY29uTGFiZWxzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFXaEcsU0FBUyxRQUFRLENBQUMsTUFBbUIsRUFBRSxJQUFZLEVBQUUsTUFBNkIsRUFBRSxVQUE2QztRQUNoSSxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNWLElBQUksVUFBVSxFQUFFO1lBQ2YsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FDdEM7SUFDRixDQUFDO0lBRUQsS0FBSyxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUU7UUFFekIsSUFBSSxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRTtZQUN2QyxnREFBZ0Q7WUFDaEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQWlCO2dCQUN6QyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7Z0JBQ1IsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO2dCQUNoQixDQUFDLHFCQUFxQixFQUFFLG9CQUFvQixDQUFDO2dCQUM3QyxDQUFDLHVCQUF1QixFQUFFLHNCQUFzQixDQUFDO2dCQUNqRCxDQUFDLGVBQWUsRUFBRSxhQUFhLENBQUM7Z0JBQ2hDLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDO2dCQUNsQyxDQUFDLGlDQUFpQyxFQUFFLDZCQUE2QixDQUFDO2dCQUNsRSxDQUFDLDBCQUEwQixFQUFFLHNCQUFzQixDQUFDO2dCQUNwRCxDQUFDLHdCQUF3QixFQUFFLG9CQUFvQixDQUFDO2FBQ2hELENBQUMsQ0FBQztZQUVILEtBQUssTUFBTSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMs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