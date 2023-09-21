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
                assert.strictEqual((0, iconLabels_1.$Uj)(input), expected);
            }
        });
        test('matchesFuzzyIconAware', () => {
            // Camel Case
            filterOk(iconLabels_1.$Wj, 'ccr', (0, iconLabels_1.$Vj)('$(codicon)CamelCaseRocks$(codicon)'), [
                { start: 10, end: 11 },
                { start: 15, end: 16 },
                { start: 19, end: 20 }
            ]);
            filterOk(iconLabels_1.$Wj, 'ccr', (0, iconLabels_1.$Vj)('$(codicon) CamelCaseRocks $(codicon)'), [
                { start: 11, end: 12 },
                { start: 16, end: 17 },
                { start: 20, end: 21 }
            ]);
            filterOk(iconLabels_1.$Wj, 'iut', (0, iconLabels_1.$Vj)('$(codicon) Indent $(octico) Using $(octic) Tpaces'), [
                { start: 11, end: 12 },
                { start: 28, end: 29 },
                { start: 43, end: 44 },
            ]);
            // Prefix
            filterOk(iconLabels_1.$Wj, 'using', (0, iconLabels_1.$Vj)('$(codicon) Indent Using Spaces'), [
                { start: 18, end: 23 },
            ]);
            // Broken Codicon
            filterOk(iconLabels_1.$Wj, 'codicon', (0, iconLabels_1.$Vj)('This $(codicon Indent Using Spaces'), [
                { start: 7, end: 14 },
            ]);
            filterOk(iconLabels_1.$Wj, 'indent', (0, iconLabels_1.$Vj)('This $codicon Indent Using Spaces'), [
                { start: 14, end: 20 },
            ]);
            // Testing #59343
            filterOk(iconLabels_1.$Wj, 'unt', (0, iconLabels_1.$Vj)('$(primitive-dot) $(file-text) Untitled-1'), [
                { start: 30, end: 33 },
            ]);
            // Testing #136172
            filterOk(iconLabels_1.$Wj, 's', (0, iconLabels_1.$Vj)('$(loading~spin) start'), [
                { start: 16, end: 17 },
            ]);
        });
        test('stripIcons', () => {
            assert.strictEqual((0, iconLabels_1.$Tj)('Hello World'), 'Hello World');
            assert.strictEqual((0, iconLabels_1.$Tj)('$(Hello World'), '$(Hello World');
            assert.strictEqual((0, iconLabels_1.$Tj)('$(Hello) World'), ' World');
            assert.strictEqual((0, iconLabels_1.$Tj)('$(Hello) W$(oi)rld'), ' Wrld');
        });
        test('escapeIcons', () => {
            assert.strictEqual((0, iconLabels_1.$Rj)('Hello World'), 'Hello World');
            assert.strictEqual((0, iconLabels_1.$Rj)('$(Hello World'), '$(Hello World');
            assert.strictEqual((0, iconLabels_1.$Rj)('$(Hello) World'), '\\$(Hello) World');
            assert.strictEqual((0, iconLabels_1.$Rj)('\\$(Hello) W$(oi)rld'), '\\$(Hello) W\\$(oi)rld');
        });
        test('markdownEscapeEscapedIcons', () => {
            assert.strictEqual((0, iconLabels_1.$Sj)('Hello World'), 'Hello World');
            assert.strictEqual((0, iconLabels_1.$Sj)('$(Hello) World'), '$(Hello) World');
            assert.strictEqual((0, iconLabels_1.$Sj)('\\$(Hello) World'), '\\\\$(Hello) World');
        });
    });
});
//# sourceMappingURL=iconLabels.test.js.map