/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/services/unicodeTextModelHighlighter", "vs/editor/test/common/testTextModel"], function (require, exports, assert, utils_1, range_1, unicodeTextModelHighlighter_1, testTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('UnicodeTextModelHighlighter', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function t(text, options) {
            const m = (0, testTextModel_1.createTextModel)(text);
            const r = unicodeTextModelHighlighter_1.UnicodeTextModelHighlighter.computeUnicodeHighlights(m, options);
            m.dispose();
            return {
                ...r,
                ranges: r.ranges.map(r => range_1.Range.lift(r).toString())
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pY29kZVRleHRNb2RlbEhpZ2hsaWdodGVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvdGVzdC9jb21tb24vc2VydmljZXMvdW5pY29kZVRleHRNb2RlbEhpZ2hsaWdodGVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFRaEcsS0FBSyxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtRQUN6QyxJQUFBLCtDQUF1QyxHQUFFLENBQUM7UUFFMUMsU0FBUyxDQUFDLENBQUMsSUFBWSxFQUFFLE9BQWtDO1lBQzFELE1BQU0sQ0FBQyxHQUFHLElBQUEsK0JBQWUsRUFBQyxJQUFJLENBQUMsQ0FBQztZQUNoQyxNQUFNLENBQUMsR0FBRyx5REFBMkIsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDM0UsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRVosT0FBTztnQkFDTixHQUFHLENBQUM7Z0JBQ0osTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsYUFBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNuRCxDQUFDO1FBQ0gsQ0FBQztRQUVELElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxHQUFHLEVBQUU7WUFDL0MsTUFBTSxDQUFDLGVBQWUsQ0FDckIsQ0FBQyxDQUFDOztDQUVKLEVBQUU7Z0JBQ0MsaUJBQWlCLEVBQUUsRUFBRTtnQkFDckIsY0FBYyxFQUFFLEVBQUU7Z0JBQ2xCLG1CQUFtQixFQUFFLElBQUk7Z0JBQ3pCLG1CQUFtQixFQUFFLElBQUk7Z0JBQ3pCLGVBQWUsRUFBRSxLQUFLO2dCQUN0QixjQUFjLEVBQUUsS0FBSztnQkFDckIsYUFBYSxFQUFFLEtBQUs7YUFDcEIsQ0FBQyxFQUNGO2dCQUNDLHVCQUF1QixFQUFFLENBQUM7Z0JBQzFCLE9BQU8sRUFBRSxLQUFLO2dCQUNkLHVCQUF1QixFQUFFLENBQUM7Z0JBQzFCLDJCQUEyQixFQUFFLENBQUM7Z0JBQzlCLE1BQU0sRUFBRTtvQkFDUCxjQUFjO29CQUNkLGNBQWM7b0JBQ2QsZ0JBQWdCO29CQUNoQixnQkFBZ0I7aUJBQ2hCO2FBQ0QsQ0FDRCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9