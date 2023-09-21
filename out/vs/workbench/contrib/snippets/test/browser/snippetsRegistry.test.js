/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/snippets/browser/snippetsService", "vs/editor/common/core/position"], function (require, exports, assert, snippetsService_1, position_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('getNonWhitespacePrefix', () => {
        function assertGetNonWhitespacePrefix(line, column, expected) {
            const model = {
                getLineContent: (lineNumber) => line
            };
            const actual = (0, snippetsService_1.getNonWhitespacePrefix)(model, new position_1.Position(1, column));
            assert.strictEqual(actual, expected);
        }
        test('empty line', () => {
            assertGetNonWhitespacePrefix('', 1, '');
        });
        test('singleWordLine', () => {
            assertGetNonWhitespacePrefix('something', 1, '');
            assertGetNonWhitespacePrefix('something', 2, 's');
            assertGetNonWhitespacePrefix('something', 3, 'so');
            assertGetNonWhitespacePrefix('something', 4, 'som');
            assertGetNonWhitespacePrefix('something', 5, 'some');
            assertGetNonWhitespacePrefix('something', 6, 'somet');
            assertGetNonWhitespacePrefix('something', 7, 'someth');
            assertGetNonWhitespacePrefix('something', 8, 'somethi');
            assertGetNonWhitespacePrefix('something', 9, 'somethin');
            assertGetNonWhitespacePrefix('something', 10, 'something');
        });
        test('two word line', () => {
            assertGetNonWhitespacePrefix('something interesting', 1, '');
            assertGetNonWhitespacePrefix('something interesting', 2, 's');
            assertGetNonWhitespacePrefix('something interesting', 3, 'so');
            assertGetNonWhitespacePrefix('something interesting', 4, 'som');
            assertGetNonWhitespacePrefix('something interesting', 5, 'some');
            assertGetNonWhitespacePrefix('something interesting', 6, 'somet');
            assertGetNonWhitespacePrefix('something interesting', 7, 'someth');
            assertGetNonWhitespacePrefix('something interesting', 8, 'somethi');
            assertGetNonWhitespacePrefix('something interesting', 9, 'somethin');
            assertGetNonWhitespacePrefix('something interesting', 10, 'something');
            assertGetNonWhitespacePrefix('something interesting', 11, '');
            assertGetNonWhitespacePrefix('something interesting', 12, 'i');
            assertGetNonWhitespacePrefix('something interesting', 13, 'in');
            assertGetNonWhitespacePrefix('something interesting', 14, 'int');
            assertGetNonWhitespacePrefix('something interesting', 15, 'inte');
            assertGetNonWhitespacePrefix('something interesting', 16, 'inter');
            assertGetNonWhitespacePrefix('something interesting', 17, 'intere');
            assertGetNonWhitespacePrefix('something interesting', 18, 'interes');
            assertGetNonWhitespacePrefix('something interesting', 19, 'interest');
            assertGetNonWhitespacePrefix('something interesting', 20, 'interesti');
            assertGetNonWhitespacePrefix('something interesting', 21, 'interestin');
            assertGetNonWhitespacePrefix('something interesting', 22, 'interesting');
        });
        test('many separators', () => {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions?redirectlocale=en-US&redirectslug=JavaScript%2FGuide%2FRegular_Expressions#special-white-space
            // \s matches a single white space character, including space, tab, form feed, line feed.
            // Equivalent to [ \f\n\r\t\v\u00a0\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff].
            assertGetNonWhitespacePrefix('something interesting', 22, 'interesting');
            assertGetNonWhitespacePrefix('something\tinteresting', 22, 'interesting');
            assertGetNonWhitespacePrefix('something\finteresting', 22, 'interesting');
            assertGetNonWhitespacePrefix('something\vinteresting', 22, 'interesting');
            assertGetNonWhitespacePrefix('something\u00a0interesting', 22, 'interesting');
            assertGetNonWhitespacePrefix('something\u2000interesting', 22, 'interesting');
            assertGetNonWhitespacePrefix('something\u2028interesting', 22, 'interesting');
            assertGetNonWhitespacePrefix('something\u3000interesting', 22, 'interesting');
            assertGetNonWhitespacePrefix('something\ufeffinteresting', 22, 'interesting');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldHNSZWdpc3RyeS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc25pcHBldHMvdGVzdC9icm93c2VyL3NuaXBwZXRzUmVnaXN0cnkudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQU1oRyxLQUFLLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1FBRXBDLFNBQVMsNEJBQTRCLENBQUMsSUFBWSxFQUFFLE1BQWMsRUFBRSxRQUFnQjtZQUNuRixNQUFNLEtBQUssR0FBRztnQkFDYixjQUFjLEVBQUUsQ0FBQyxVQUFrQixFQUFFLEVBQUUsQ0FBQyxJQUFJO2FBQzVDLENBQUM7WUFDRixNQUFNLE1BQU0sR0FBRyxJQUFBLHdDQUFzQixFQUFDLEtBQUssRUFBRSxJQUFJLG1CQUFRLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDdEUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO1lBQ3ZCLDRCQUE0QixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDekMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFO1lBQzNCLDRCQUE0QixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDakQsNEJBQTRCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNsRCw0QkFBNEIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ25ELDRCQUE0QixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDcEQsNEJBQTRCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNyRCw0QkFBNEIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELDRCQUE0QixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDdkQsNEJBQTRCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN4RCw0QkFBNEIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3pELDRCQUE0QixDQUFDLFdBQVcsRUFBRSxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDNUQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRTtZQUMxQiw0QkFBNEIsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDN0QsNEJBQTRCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzlELDRCQUE0QixDQUFDLHVCQUF1QixFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMvRCw0QkFBNEIsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEUsNEJBQTRCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2pFLDRCQUE0QixDQUFDLHVCQUF1QixFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNsRSw0QkFBNEIsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDbkUsNEJBQTRCLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3BFLDRCQUE0QixDQUFDLHVCQUF1QixFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNyRSw0QkFBNEIsQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDdkUsNEJBQTRCLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzlELDRCQUE0QixDQUFDLHVCQUF1QixFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMvRCw0QkFBNEIsQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDaEUsNEJBQTRCLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2pFLDRCQUE0QixDQUFDLHVCQUF1QixFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNsRSw0QkFBNEIsQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDbkUsNEJBQTRCLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3BFLDRCQUE0QixDQUFDLHVCQUF1QixFQUFFLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNyRSw0QkFBNEIsQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDdEUsNEJBQTRCLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3ZFLDRCQUE0QixDQUFDLHVCQUF1QixFQUFFLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUN4RSw0QkFBNEIsQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDMUUsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFO1lBQzVCLG1MQUFtTDtZQUNuTCx5RkFBeUY7WUFDekYsa0dBQWtHO1lBRWxHLDRCQUE0QixDQUFDLHVCQUF1QixFQUFFLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN6RSw0QkFBNEIsQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDMUUsNEJBQTRCLENBQUMsd0JBQXdCLEVBQUUsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQzFFLDRCQUE0QixDQUFDLHdCQUF3QixFQUFFLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUMxRSw0QkFBNEIsQ0FBQyw0QkFBNEIsRUFBRSxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDOUUsNEJBQTRCLENBQUMsNEJBQTRCLEVBQUUsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQzlFLDRCQUE0QixDQUFDLDRCQUE0QixFQUFFLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUM5RSw0QkFBNEIsQ0FBQyw0QkFBNEIsRUFBRSxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDOUUsNEJBQTRCLENBQUMsNEJBQTRCLEVBQUUsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRS9FLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==