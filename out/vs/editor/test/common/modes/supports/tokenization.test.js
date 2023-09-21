/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/languages/supports/tokenization"], function (require, exports, assert, utils_1, tokenization_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Token theme matching', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('gives higher priority to deeper matches', () => {
            const theme = tokenization_1.TokenTheme.createFromRawTokenTheme([
                { token: '', foreground: '100000', background: '200000' },
                { token: 'punctuation.definition.string.begin.html', foreground: '300000' },
                { token: 'punctuation.definition.string', foreground: '400000' },
            ], []);
            const colorMap = new tokenization_1.ColorMap();
            colorMap.getId('100000');
            const _B = colorMap.getId('200000');
            colorMap.getId('400000');
            const _D = colorMap.getId('300000');
            const actual = theme._match('punctuation.definition.string.begin.html');
            assert.deepStrictEqual(actual, new tokenization_1.ThemeTrieElementRule(0 /* FontStyle.None */, _D, _B));
        });
        test('can match', () => {
            const theme = tokenization_1.TokenTheme.createFromRawTokenTheme([
                { token: '', foreground: 'F8F8F2', background: '272822' },
                { token: 'source', background: '100000' },
                { token: 'something', background: '100000' },
                { token: 'bar', background: '200000' },
                { token: 'baz', background: '200000' },
                { token: 'bar', fontStyle: 'bold' },
                { token: 'constant', fontStyle: 'italic', foreground: '300000' },
                { token: 'constant.numeric', foreground: '400000' },
                { token: 'constant.numeric.hex', fontStyle: 'bold' },
                { token: 'constant.numeric.oct', fontStyle: 'bold italic underline' },
                { token: 'constant.numeric.bin', fontStyle: 'bold strikethrough' },
                { token: 'constant.numeric.dec', fontStyle: '', foreground: '500000' },
                { token: 'storage.object.bar', fontStyle: '', foreground: '600000' },
            ], []);
            const colorMap = new tokenization_1.ColorMap();
            const _A = colorMap.getId('F8F8F2');
            const _B = colorMap.getId('272822');
            const _C = colorMap.getId('200000');
            const _D = colorMap.getId('300000');
            const _E = colorMap.getId('400000');
            const _F = colorMap.getId('500000');
            const _G = colorMap.getId('100000');
            const _H = colorMap.getId('600000');
            function assertMatch(scopeName, expected) {
                const actual = theme._match(scopeName);
                assert.deepStrictEqual(actual, expected, 'when matching <<' + scopeName + '>>');
            }
            function assertSimpleMatch(scopeName, fontStyle, foreground, background) {
                assertMatch(scopeName, new tokenization_1.ThemeTrieElementRule(fontStyle, foreground, background));
            }
            function assertNoMatch(scopeName) {
                assertMatch(scopeName, new tokenization_1.ThemeTrieElementRule(0 /* FontStyle.None */, _A, _B));
            }
            // matches defaults
            assertNoMatch('');
            assertNoMatch('bazz');
            assertNoMatch('asdfg');
            // matches source
            assertSimpleMatch('source', 0 /* FontStyle.None */, _A, _G);
            assertSimpleMatch('source.ts', 0 /* FontStyle.None */, _A, _G);
            assertSimpleMatch('source.tss', 0 /* FontStyle.None */, _A, _G);
            // matches something
            assertSimpleMatch('something', 0 /* FontStyle.None */, _A, _G);
            assertSimpleMatch('something.ts', 0 /* FontStyle.None */, _A, _G);
            assertSimpleMatch('something.tss', 0 /* FontStyle.None */, _A, _G);
            // matches baz
            assertSimpleMatch('baz', 0 /* FontStyle.None */, _A, _C);
            assertSimpleMatch('baz.ts', 0 /* FontStyle.None */, _A, _C);
            assertSimpleMatch('baz.tss', 0 /* FontStyle.None */, _A, _C);
            // matches constant
            assertSimpleMatch('constant', 1 /* FontStyle.Italic */, _D, _B);
            assertSimpleMatch('constant.string', 1 /* FontStyle.Italic */, _D, _B);
            assertSimpleMatch('constant.hex', 1 /* FontStyle.Italic */, _D, _B);
            // matches constant.numeric
            assertSimpleMatch('constant.numeric', 1 /* FontStyle.Italic */, _E, _B);
            assertSimpleMatch('constant.numeric.baz', 1 /* FontStyle.Italic */, _E, _B);
            // matches constant.numeric.hex
            assertSimpleMatch('constant.numeric.hex', 2 /* FontStyle.Bold */, _E, _B);
            assertSimpleMatch('constant.numeric.hex.baz', 2 /* FontStyle.Bold */, _E, _B);
            // matches constant.numeric.oct
            assertSimpleMatch('constant.numeric.oct', 2 /* FontStyle.Bold */ | 1 /* FontStyle.Italic */ | 4 /* FontStyle.Underline */, _E, _B);
            assertSimpleMatch('constant.numeric.oct.baz', 2 /* FontStyle.Bold */ | 1 /* FontStyle.Italic */ | 4 /* FontStyle.Underline */, _E, _B);
            // matches constant.numeric.bin
            assertSimpleMatch('constant.numeric.bin', 2 /* FontStyle.Bold */ | 8 /* FontStyle.Strikethrough */, _E, _B);
            assertSimpleMatch('constant.numeric.bin.baz', 2 /* FontStyle.Bold */ | 8 /* FontStyle.Strikethrough */, _E, _B);
            // matches constant.numeric.dec
            assertSimpleMatch('constant.numeric.dec', 0 /* FontStyle.None */, _F, _B);
            assertSimpleMatch('constant.numeric.dec.baz', 0 /* FontStyle.None */, _F, _B);
            // matches storage.object.bar
            assertSimpleMatch('storage.object.bar', 0 /* FontStyle.None */, _H, _B);
            assertSimpleMatch('storage.object.bar.baz', 0 /* FontStyle.None */, _H, _B);
            // does not match storage.object.bar
            assertSimpleMatch('storage.object.bart', 0 /* FontStyle.None */, _A, _B);
            assertSimpleMatch('storage.object', 0 /* FontStyle.None */, _A, _B);
            assertSimpleMatch('storage', 0 /* FontStyle.None */, _A, _B);
            assertSimpleMatch('bar', 2 /* FontStyle.Bold */, _A, _C);
        });
    });
    suite('Token theme parsing', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('can parse', () => {
            const actual = (0, tokenization_1.parseTokenTheme)([
                { token: '', foreground: 'F8F8F2', background: '272822' },
                { token: 'source', background: '100000' },
                { token: 'something', background: '100000' },
                { token: 'bar', background: '010000' },
                { token: 'baz', background: '010000' },
                { token: 'bar', fontStyle: 'bold' },
                { token: 'constant', fontStyle: 'italic', foreground: 'ff0000' },
                { token: 'constant.numeric', foreground: '00ff00' },
                { token: 'constant.numeric.hex', fontStyle: 'bold' },
                { token: 'constant.numeric.oct', fontStyle: 'bold italic underline' },
                { token: 'constant.numeric.dec', fontStyle: '', foreground: '0000ff' },
            ]);
            const expected = [
                new tokenization_1.ParsedTokenThemeRule('', 0, -1 /* FontStyle.NotSet */, 'F8F8F2', '272822'),
                new tokenization_1.ParsedTokenThemeRule('source', 1, -1 /* FontStyle.NotSet */, null, '100000'),
                new tokenization_1.ParsedTokenThemeRule('something', 2, -1 /* FontStyle.NotSet */, null, '100000'),
                new tokenization_1.ParsedTokenThemeRule('bar', 3, -1 /* FontStyle.NotSet */, null, '010000'),
                new tokenization_1.ParsedTokenThemeRule('baz', 4, -1 /* FontStyle.NotSet */, null, '010000'),
                new tokenization_1.ParsedTokenThemeRule('bar', 5, 2 /* FontStyle.Bold */, null, null),
                new tokenization_1.ParsedTokenThemeRule('constant', 6, 1 /* FontStyle.Italic */, 'ff0000', null),
                new tokenization_1.ParsedTokenThemeRule('constant.numeric', 7, -1 /* FontStyle.NotSet */, '00ff00', null),
                new tokenization_1.ParsedTokenThemeRule('constant.numeric.hex', 8, 2 /* FontStyle.Bold */, null, null),
                new tokenization_1.ParsedTokenThemeRule('constant.numeric.oct', 9, 2 /* FontStyle.Bold */ | 1 /* FontStyle.Italic */ | 4 /* FontStyle.Underline */, null, null),
                new tokenization_1.ParsedTokenThemeRule('constant.numeric.dec', 10, 0 /* FontStyle.None */, '0000ff', null),
            ];
            assert.deepStrictEqual(actual, expected);
        });
    });
    suite('Token theme resolving', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('strcmp works', () => {
            const actual = ['bar', 'z', 'zu', 'a', 'ab', ''].sort(tokenization_1.strcmp);
            const expected = ['', 'a', 'ab', 'bar', 'z', 'zu'];
            assert.deepStrictEqual(actual, expected);
        });
        test('always has defaults', () => {
            const actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([], []);
            const colorMap = new tokenization_1.ColorMap();
            const _A = colorMap.getId('000000');
            const _B = colorMap.getId('ffffff');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepStrictEqual(actual.getThemeTrieElement(), new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* FontStyle.None */, _A, _B)));
        });
        test('respects incoming defaults 1', () => {
            const actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, -1 /* FontStyle.NotSet */, null, null)
            ], []);
            const colorMap = new tokenization_1.ColorMap();
            const _A = colorMap.getId('000000');
            const _B = colorMap.getId('ffffff');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepStrictEqual(actual.getThemeTrieElement(), new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* FontStyle.None */, _A, _B)));
        });
        test('respects incoming defaults 2', () => {
            const actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, 0 /* FontStyle.None */, null, null)
            ], []);
            const colorMap = new tokenization_1.ColorMap();
            const _A = colorMap.getId('000000');
            const _B = colorMap.getId('ffffff');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepStrictEqual(actual.getThemeTrieElement(), new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* FontStyle.None */, _A, _B)));
        });
        test('respects incoming defaults 3', () => {
            const actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, 2 /* FontStyle.Bold */, null, null)
            ], []);
            const colorMap = new tokenization_1.ColorMap();
            const _A = colorMap.getId('000000');
            const _B = colorMap.getId('ffffff');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepStrictEqual(actual.getThemeTrieElement(), new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(2 /* FontStyle.Bold */, _A, _B)));
        });
        test('respects incoming defaults 4', () => {
            const actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, -1 /* FontStyle.NotSet */, 'ff0000', null)
            ], []);
            const colorMap = new tokenization_1.ColorMap();
            const _A = colorMap.getId('ff0000');
            const _B = colorMap.getId('ffffff');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepStrictEqual(actual.getThemeTrieElement(), new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* FontStyle.None */, _A, _B)));
        });
        test('respects incoming defaults 5', () => {
            const actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, -1 /* FontStyle.NotSet */, null, 'ff0000')
            ], []);
            const colorMap = new tokenization_1.ColorMap();
            const _A = colorMap.getId('000000');
            const _B = colorMap.getId('ff0000');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepStrictEqual(actual.getThemeTrieElement(), new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* FontStyle.None */, _A, _B)));
        });
        test('can merge incoming defaults', () => {
            const actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, -1 /* FontStyle.NotSet */, null, 'ff0000'),
                new tokenization_1.ParsedTokenThemeRule('', -1, -1 /* FontStyle.NotSet */, '00ff00', null),
                new tokenization_1.ParsedTokenThemeRule('', -1, 2 /* FontStyle.Bold */, null, null),
            ], []);
            const colorMap = new tokenization_1.ColorMap();
            const _A = colorMap.getId('00ff00');
            const _B = colorMap.getId('ff0000');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepStrictEqual(actual.getThemeTrieElement(), new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(2 /* FontStyle.Bold */, _A, _B)));
        });
        test('defaults are inherited', () => {
            const actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, -1 /* FontStyle.NotSet */, 'F8F8F2', '272822'),
                new tokenization_1.ParsedTokenThemeRule('var', -1, -1 /* FontStyle.NotSet */, 'ff0000', null)
            ], []);
            const colorMap = new tokenization_1.ColorMap();
            const _A = colorMap.getId('F8F8F2');
            const _B = colorMap.getId('272822');
            const _C = colorMap.getId('ff0000');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            const root = new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* FontStyle.None */, _A, _B), {
                'var': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* FontStyle.None */, _C, _B))
            });
            assert.deepStrictEqual(actual.getThemeTrieElement(), root);
        });
        test('same rules get merged', () => {
            const actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, -1 /* FontStyle.NotSet */, 'F8F8F2', '272822'),
                new tokenization_1.ParsedTokenThemeRule('var', 1, 2 /* FontStyle.Bold */, null, null),
                new tokenization_1.ParsedTokenThemeRule('var', 0, -1 /* FontStyle.NotSet */, 'ff0000', null),
            ], []);
            const colorMap = new tokenization_1.ColorMap();
            const _A = colorMap.getId('F8F8F2');
            const _B = colorMap.getId('272822');
            const _C = colorMap.getId('ff0000');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            const root = new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* FontStyle.None */, _A, _B), {
                'var': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(2 /* FontStyle.Bold */, _C, _B))
            });
            assert.deepStrictEqual(actual.getThemeTrieElement(), root);
        });
        test('rules are inherited 1', () => {
            const actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, -1 /* FontStyle.NotSet */, 'F8F8F2', '272822'),
                new tokenization_1.ParsedTokenThemeRule('var', -1, 2 /* FontStyle.Bold */, 'ff0000', null),
                new tokenization_1.ParsedTokenThemeRule('var.identifier', -1, -1 /* FontStyle.NotSet */, '00ff00', null),
            ], []);
            const colorMap = new tokenization_1.ColorMap();
            const _A = colorMap.getId('F8F8F2');
            const _B = colorMap.getId('272822');
            const _C = colorMap.getId('ff0000');
            const _D = colorMap.getId('00ff00');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            const root = new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* FontStyle.None */, _A, _B), {
                'var': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(2 /* FontStyle.Bold */, _C, _B), {
                    'identifier': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(2 /* FontStyle.Bold */, _D, _B))
                })
            });
            assert.deepStrictEqual(actual.getThemeTrieElement(), root);
        });
        test('rules are inherited 2', () => {
            const actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('', -1, -1 /* FontStyle.NotSet */, 'F8F8F2', '272822'),
                new tokenization_1.ParsedTokenThemeRule('var', -1, 2 /* FontStyle.Bold */, 'ff0000', null),
                new tokenization_1.ParsedTokenThemeRule('var.identifier', -1, -1 /* FontStyle.NotSet */, '00ff00', null),
                new tokenization_1.ParsedTokenThemeRule('constant', 4, 1 /* FontStyle.Italic */, '100000', null),
                new tokenization_1.ParsedTokenThemeRule('constant.numeric', 5, -1 /* FontStyle.NotSet */, '200000', null),
                new tokenization_1.ParsedTokenThemeRule('constant.numeric.hex', 6, 2 /* FontStyle.Bold */, null, null),
                new tokenization_1.ParsedTokenThemeRule('constant.numeric.oct', 7, 2 /* FontStyle.Bold */ | 1 /* FontStyle.Italic */ | 4 /* FontStyle.Underline */, null, null),
                new tokenization_1.ParsedTokenThemeRule('constant.numeric.dec', 8, 0 /* FontStyle.None */, '300000', null),
            ], []);
            const colorMap = new tokenization_1.ColorMap();
            const _A = colorMap.getId('F8F8F2');
            const _B = colorMap.getId('272822');
            const _C = colorMap.getId('100000');
            const _D = colorMap.getId('200000');
            const _E = colorMap.getId('300000');
            const _F = colorMap.getId('ff0000');
            const _G = colorMap.getId('00ff00');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            const root = new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* FontStyle.None */, _A, _B), {
                'var': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(2 /* FontStyle.Bold */, _F, _B), {
                    'identifier': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(2 /* FontStyle.Bold */, _G, _B))
                }),
                'constant': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(1 /* FontStyle.Italic */, _C, _B), {
                    'numeric': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(1 /* FontStyle.Italic */, _D, _B), {
                        'hex': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(2 /* FontStyle.Bold */, _D, _B)),
                        'oct': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(2 /* FontStyle.Bold */ | 1 /* FontStyle.Italic */ | 4 /* FontStyle.Underline */, _D, _B)),
                        'dec': new tokenization_1.ExternalThemeTrieElement(new tokenization_1.ThemeTrieElementRule(0 /* FontStyle.None */, _E, _B)),
                    })
                })
            });
            assert.deepStrictEqual(actual.getThemeTrieElement(), root);
        });
        test('custom colors are first in color map', () => {
            const actual = tokenization_1.TokenTheme.createFromParsedTokenTheme([
                new tokenization_1.ParsedTokenThemeRule('var', -1, -1 /* FontStyle.NotSet */, 'F8F8F2', null)
            ], [
                '000000', 'FFFFFF', '0F0F0F'
            ]);
            const colorMap = new tokenization_1.ColorMap();
            colorMap.getId('000000');
            colorMap.getId('FFFFFF');
            colorMap.getId('0F0F0F');
            colorMap.getId('F8F8F2');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5pemF0aW9uLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vbW9kZXMvc3VwcG9ydHMvdG9rZW5pemF0aW9uLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFPaEcsS0FBSyxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtRQUVsQyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLHlDQUF5QyxFQUFFLEdBQUcsRUFBRTtZQUNwRCxNQUFNLEtBQUssR0FBRyx5QkFBVSxDQUFDLHVCQUF1QixDQUFDO2dCQUNoRCxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFO2dCQUN6RCxFQUFFLEtBQUssRUFBRSwwQ0FBMEMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFO2dCQUMzRSxFQUFFLEtBQUssRUFBRSwrQkFBK0IsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFO2FBQ2hFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFUCxNQUFNLFFBQVEsR0FBRyxJQUFJLHVCQUFRLEVBQUUsQ0FBQztZQUNoQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6QixNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXBDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUV4RSxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxJQUFJLG1DQUFvQix5QkFB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