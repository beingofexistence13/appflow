/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/services/unicodeTextModelHighlighter", "vs/editor/test/common/testTextModel"], function (require, exports, assert, utils_1, range_1, unicodeTextModelHighlighter_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('UnicodeTextModelHighlighter', () => {
        (0, utils_1.$bT)();
        function t(text, options) {
            const m = (0, testTextModel_1.$O0b)(text);
            const r = unicodeTextModelHighlighter_1.$xY.computeUnicodeHighlights(m, options);
            m.dispose();
            return {
                ...r,
                ranges: r.ranges.map(r => range_1.$ks.lift(r).toString())
            };
        }
        test('computeUnicodeHighlights (#168068)', () => {
            assert.deepStrictEqual(t(`
	For å gi et eksempel
`, {
                allowedCodePoints: [],
                allowedLocales: [],
                ambiguousCharacters: true,
                invisibleCharacters: true,
                includeComments: false,
                includeStrings: false,
                nonBasicASCII: false
            }), {
                ambiguousCharacterCount: 0,
                hasMore: false,
                invisibleCharacterCount: 4,
                nonBasicAsciiCharacterCount: 0,
                ranges: [
                    '[2,5 -> 2,6]',
                    '[2,7 -> 2,8]',
                    '[2,10 -> 2,11]',
                    '[2,13 -> 2,14]'
                ]
            });
        });
    });
});
//# sourceMappingURL=unicodeTextModelHighlighter.test.js.map