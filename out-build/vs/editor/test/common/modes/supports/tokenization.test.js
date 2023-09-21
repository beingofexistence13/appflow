/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/languages/supports/tokenization"], function (require, exports, assert, utils_1, tokenization_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Token theme matching', () => {
        (0, utils_1.$bT)();
        test('gives higher priority to deeper matches', () => {
            const theme = tokenization_1.$Lob.createFromRawTokenTheme([
                { token: '', foreground: '100000', background: '200000' },
                { token: 'punctuation.definition.string.begin.html', foreground: '300000' },
                { token: 'punctuation.definition.string', foreground: '400000' },
            ], []);
            const colorMap = new tokenization_1.$Kob();
            colorMap.getId('100000');
            const _B = colorMap.getId('200000');
            colorMap.getId('400000');
            const _D = colorMap.getId('300000');
            const actual = theme._match('punctuation.definition.string.begin.html');
            assert.deepStrictEqual(actual, new tokenization_1.$Oob(0 /* FontStyle.None */, _D, _B));
        });
        test('can match', () => {
            const theme = tokenization_1.$Lob.createFromRawTokenTheme([
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
            const colorMap = new tokenization_1.$Kob();
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
                assertMatch(scopeName, new tokenization_1.$Oob(fontStyle, foreground, background));
            }
            function assertNoMatch(scopeName) {
                assertMatch(scopeName, new tokenization_1.$Oob(0 /* FontStyle.None */, _A, _B));
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
        (0, utils_1.$bT)();
        test('can parse', () => {
            const actual = (0, tokenization_1.$Job)([
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
                new tokenization_1.$Iob('', 0, -1 /* FontStyle.NotSet */, 'F8F8F2', '272822'),
                new tokenization_1.$Iob('source', 1, -1 /* FontStyle.NotSet */, null, '100000'),
                new tokenization_1.$Iob('something', 2, -1 /* FontStyle.NotSet */, null, '100000'),
                new tokenization_1.$Iob('bar', 3, -1 /* FontStyle.NotSet */, null, '010000'),
                new tokenization_1.$Iob('baz', 4, -1 /* FontStyle.NotSet */, null, '010000'),
                new tokenization_1.$Iob('bar', 5, 2 /* FontStyle.Bold */, null, null),
                new tokenization_1.$Iob('constant', 6, 1 /* FontStyle.Italic */, 'ff0000', null),
                new tokenization_1.$Iob('constant.numeric', 7, -1 /* FontStyle.NotSet */, '00ff00', null),
                new tokenization_1.$Iob('constant.numeric.hex', 8, 2 /* FontStyle.Bold */, null, null),
                new tokenization_1.$Iob('constant.numeric.oct', 9, 2 /* FontStyle.Bold */ | 1 /* FontStyle.Italic */ | 4 /* FontStyle.Underline */, null, null),
                new tokenization_1.$Iob('constant.numeric.dec', 10, 0 /* FontStyle.None */, '0000ff', null),
            ];
            assert.deepStrictEqual(actual, expected);
        });
    });
    suite('Token theme resolving', () => {
        (0, utils_1.$bT)();
        test('strcmp works', () => {
            const actual = ['bar', 'z', 'zu', 'a', 'ab', ''].sort(tokenization_1.$Nob);
            const expected = ['', 'a', 'ab', 'bar', 'z', 'zu'];
            assert.deepStrictEqual(actual, expected);
        });
        test('always has defaults', () => {
            const actual = tokenization_1.$Lob.createFromParsedTokenTheme([], []);
            const colorMap = new tokenization_1.$Kob();
            const _A = colorMap.getId('000000');
            const _B = colorMap.getId('ffffff');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepStrictEqual(actual.getThemeTrieElement(), new tokenization_1.$Pob(new tokenization_1.$Oob(0 /* FontStyle.None */, _A, _B)));
        });
        test('respects incoming defaults 1', () => {
            const actual = tokenization_1.$Lob.createFromParsedTokenTheme([
                new tokenization_1.$Iob('', -1, -1 /* FontStyle.NotSet */, null, null)
            ], []);
            const colorMap = new tokenization_1.$Kob();
            const _A = colorMap.getId('000000');
            const _B = colorMap.getId('ffffff');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepStrictEqual(actual.getThemeTrieElement(), new tokenization_1.$Pob(new tokenization_1.$Oob(0 /* FontStyle.None */, _A, _B)));
        });
        test('respects incoming defaults 2', () => {
            const actual = tokenization_1.$Lob.createFromParsedTokenTheme([
                new tokenization_1.$Iob('', -1, 0 /* FontStyle.None */, null, null)
            ], []);
            const colorMap = new tokenization_1.$Kob();
            const _A = colorMap.getId('000000');
            const _B = colorMap.getId('ffffff');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepStrictEqual(actual.getThemeTrieElement(), new tokenization_1.$Pob(new tokenization_1.$Oob(0 /* FontStyle.None */, _A, _B)));
        });
        test('respects incoming defaults 3', () => {
            const actual = tokenization_1.$Lob.createFromParsedTokenTheme([
                new tokenization_1.$Iob('', -1, 2 /* FontStyle.Bold */, null, null)
            ], []);
            const colorMap = new tokenization_1.$Kob();
            const _A = colorMap.getId('000000');
            const _B = colorMap.getId('ffffff');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepStrictEqual(actual.getThemeTrieElement(), new tokenization_1.$Pob(new tokenization_1.$Oob(2 /* FontStyle.Bold */, _A, _B)));
        });
        test('respects incoming defaults 4', () => {
            const actual = tokenization_1.$Lob.createFromParsedTokenTheme([
                new tokenization_1.$Iob('', -1, -1 /* FontStyle.NotSet */, 'ff0000', null)
            ], []);
            const colorMap = new tokenization_1.$Kob();
            const _A = colorMap.getId('ff0000');
            const _B = colorMap.getId('ffffff');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepStrictEqual(actual.getThemeTrieElement(), new tokenization_1.$Pob(new tokenization_1.$Oob(0 /* FontStyle.None */, _A, _B)));
        });
        test('respects incoming defaults 5', () => {
            const actual = tokenization_1.$Lob.createFromParsedTokenTheme([
                new tokenization_1.$Iob('', -1, -1 /* FontStyle.NotSet */, null, 'ff0000')
            ], []);
            const colorMap = new tokenization_1.$Kob();
            const _A = colorMap.getId('000000');
            const _B = colorMap.getId('ff0000');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepStrictEqual(actual.getThemeTrieElement(), new tokenization_1.$Pob(new tokenization_1.$Oob(0 /* FontStyle.None */, _A, _B)));
        });
        test('can merge incoming defaults', () => {
            const actual = tokenization_1.$Lob.createFromParsedTokenTheme([
                new tokenization_1.$Iob('', -1, -1 /* FontStyle.NotSet */, null, 'ff0000'),
                new tokenization_1.$Iob('', -1, -1 /* FontStyle.NotSet */, '00ff00', null),
                new tokenization_1.$Iob('', -1, 2 /* FontStyle.Bold */, null, null),
            ], []);
            const colorMap = new tokenization_1.$Kob();
            const _A = colorMap.getId('00ff00');
            const _B = colorMap.getId('ff0000');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            assert.deepStrictEqual(actual.getThemeTrieElement(), new tokenization_1.$Pob(new tokenization_1.$Oob(2 /* FontStyle.Bold */, _A, _B)));
        });
        test('defaults are inherited', () => {
            const actual = tokenization_1.$Lob.createFromParsedTokenTheme([
                new tokenization_1.$Iob('', -1, -1 /* FontStyle.NotSet */, 'F8F8F2', '272822'),
                new tokenization_1.$Iob('var', -1, -1 /* FontStyle.NotSet */, 'ff0000', null)
            ], []);
            const colorMap = new tokenization_1.$Kob();
            const _A = colorMap.getId('F8F8F2');
            const _B = colorMap.getId('272822');
            const _C = colorMap.getId('ff0000');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            const root = new tokenization_1.$Pob(new tokenization_1.$Oob(0 /* FontStyle.None */, _A, _B), {
                'var': new tokenization_1.$Pob(new tokenization_1.$Oob(0 /* FontStyle.None */, _C, _B))
            });
            assert.deepStrictEqual(actual.getThemeTrieElement(), root);
        });
        test('same rules get merged', () => {
            const actual = tokenization_1.$Lob.createFromParsedTokenTheme([
                new tokenization_1.$Iob('', -1, -1 /* FontStyle.NotSet */, 'F8F8F2', '272822'),
                new tokenization_1.$Iob('var', 1, 2 /* FontStyle.Bold */, null, null),
                new tokenization_1.$Iob('var', 0, -1 /* FontStyle.NotSet */, 'ff0000', null),
            ], []);
            const colorMap = new tokenization_1.$Kob();
            const _A = colorMap.getId('F8F8F2');
            const _B = colorMap.getId('272822');
            const _C = colorMap.getId('ff0000');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            const root = new tokenization_1.$Pob(new tokenization_1.$Oob(0 /* FontStyle.None */, _A, _B), {
                'var': new tokenization_1.$Pob(new tokenization_1.$Oob(2 /* FontStyle.Bold */, _C, _B))
            });
            assert.deepStrictEqual(actual.getThemeTrieElement(), root);
        });
        test('rules are inherited 1', () => {
            const actual = tokenization_1.$Lob.createFromParsedTokenTheme([
                new tokenization_1.$Iob('', -1, -1 /* FontStyle.NotSet */, 'F8F8F2', '272822'),
                new tokenization_1.$Iob('var', -1, 2 /* FontStyle.Bold */, 'ff0000', null),
                new tokenization_1.$Iob('var.identifier', -1, -1 /* FontStyle.NotSet */, '00ff00', null),
            ], []);
            const colorMap = new tokenization_1.$Kob();
            const _A = colorMap.getId('F8F8F2');
            const _B = colorMap.getId('272822');
            const _C = colorMap.getId('ff0000');
            const _D = colorMap.getId('00ff00');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            const root = new tokenization_1.$Pob(new tokenization_1.$Oob(0 /* FontStyle.None */, _A, _B), {
                'var': new tokenization_1.$Pob(new tokenization_1.$Oob(2 /* FontStyle.Bold */, _C, _B), {
                    'identifier': new tokenization_1.$Pob(new tokenization_1.$Oob(2 /* FontStyle.Bold */, _D, _B))
                })
            });
            assert.deepStrictEqual(actual.getThemeTrieElement(), root);
        });
        test('rules are inherited 2', () => {
            const actual = tokenization_1.$Lob.createFromParsedTokenTheme([
                new tokenization_1.$Iob('', -1, -1 /* FontStyle.NotSet */, 'F8F8F2', '272822'),
                new tokenization_1.$Iob('var', -1, 2 /* FontStyle.Bold */, 'ff0000', null),
                new tokenization_1.$Iob('var.identifier', -1, -1 /* FontStyle.NotSet */, '00ff00', null),
                new tokenization_1.$Iob('constant', 4, 1 /* FontStyle.Italic */, '100000', null),
                new tokenization_1.$Iob('constant.numeric', 5, -1 /* FontStyle.NotSet */, '200000', null),
                new tokenization_1.$Iob('constant.numeric.hex', 6, 2 /* FontStyle.Bold */, null, null),
                new tokenization_1.$Iob('constant.numeric.oct', 7, 2 /* FontStyle.Bold */ | 1 /* FontStyle.Italic */ | 4 /* FontStyle.Underline */, null, null),
                new tokenization_1.$Iob('constant.numeric.dec', 8, 0 /* FontStyle.None */, '300000', null),
            ], []);
            const colorMap = new tokenization_1.$Kob();
            const _A = colorMap.getId('F8F8F2');
            const _B = colorMap.getId('272822');
            const _C = colorMap.getId('100000');
            const _D = colorMap.getId('200000');
            const _E = colorMap.getId('300000');
            const _F = colorMap.getId('ff0000');
            const _G = colorMap.getId('00ff00');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
            const root = new tokenization_1.$Pob(new tokenization_1.$Oob(0 /* FontStyle.None */, _A, _B), {
                'var': new tokenization_1.$Pob(new tokenization_1.$Oob(2 /* FontStyle.Bold */, _F, _B), {
                    'identifier': new tokenization_1.$Pob(new tokenization_1.$Oob(2 /* FontStyle.Bold */, _G, _B))
                }),
                'constant': new tokenization_1.$Pob(new tokenization_1.$Oob(1 /* FontStyle.Italic */, _C, _B), {
                    'numeric': new tokenization_1.$Pob(new tokenization_1.$Oob(1 /* FontStyle.Italic */, _D, _B), {
                        'hex': new tokenization_1.$Pob(new tokenization_1.$Oob(2 /* FontStyle.Bold */, _D, _B)),
                        'oct': new tokenization_1.$Pob(new tokenization_1.$Oob(2 /* FontStyle.Bold */ | 1 /* FontStyle.Italic */ | 4 /* FontStyle.Underline */, _D, _B)),
                        'dec': new tokenization_1.$Pob(new tokenization_1.$Oob(0 /* FontStyle.None */, _E, _B)),
                    })
                })
            });
            assert.deepStrictEqual(actual.getThemeTrieElement(), root);
        });
        test('custom colors are first in color map', () => {
            const actual = tokenization_1.$Lob.createFromParsedTokenTheme([
                new tokenization_1.$Iob('var', -1, -1 /* FontStyle.NotSet */, 'F8F8F2', null)
            ], [
                '000000', 'FFFFFF', '0F0F0F'
            ]);
            const colorMap = new tokenization_1.$Kob();
            colorMap.getId('000000');
            colorMap.getId('FFFFFF');
            colorMap.getId('0F0F0F');
            colorMap.getId('F8F8F2');
            assert.deepStrictEqual(actual.getColorMap(), colorMap.getColorMap());
        });
    });
});
//# sourceMappingURL=tokenization.test.js.map