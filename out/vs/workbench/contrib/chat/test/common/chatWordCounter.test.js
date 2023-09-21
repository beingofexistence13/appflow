/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/chat/common/chatWordCounter"], function (require, exports, assert, chatWordCounter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ChatWordCounter', () => {
        function doTest(str, nWords, resultStr) {
            const result = (0, chatWordCounter_1.getNWords)(str, nWords);
            assert.strictEqual(result.value, resultStr);
            assert.strictEqual(result.actualWordCount, nWords);
        }
        test('getNWords, matching actualWordCount', () => {
            const cases = [
                ['hello world', 1, 'hello'],
                ['hello', 1, 'hello'],
                ['hello world', 0, ''],
                ['here\'s, some.   punctuation?', 3, 'here\'s, some.   punctuation?'],
                ['| markdown | _table_ | header |', 3, '| markdown | _table_ | header'],
                ['| --- | --- | --- |', 1, '| --- | --- | --- |'],
                [' \t some \n whitespace     \n\n\nhere   ', 3, ' \t some \n whitespace     \n\n\nhere'],
            ];
            cases.forEach(([str, nWords, result]) => doTest(str, nWords, result));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFdvcmRDb3VudGVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L3Rlc3QvY29tbW9uL2NoYXRXb3JkQ291bnRlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBS2hHLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7UUFDN0IsU0FBUyxNQUFNLENBQUMsR0FBVyxFQUFFLE1BQWMsRUFBRSxTQUFpQjtZQUM3RCxNQUFNLE1BQU0sR0FBRyxJQUFBLDJCQUFTLEVBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM1QyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUVELElBQUksQ0FBQyxxQ0FBcUMsRUFBRSxHQUFHLEVBQUU7WUFDaEQsTUFBTSxLQUFLLEdBQStCO2dCQUN6QyxDQUFDLGFBQWEsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDO2dCQUMzQixDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDO2dCQUNyQixDQUFDLGFBQWEsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUN0QixDQUFDLCtCQUErQixFQUFFLENBQUMsRUFBRSwrQkFBK0IsQ0FBQztnQkFDckUsQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDLEVBQUUsK0JBQStCLENBQUM7Z0JBQ3ZFLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxFQUFFLHFCQUFxQixDQUFDO2dCQUNqRCxDQUFDLDBDQUEwQyxFQUFFLENBQUMsRUFBRSx1Q0FBdUMsQ0FBQzthQUN4RixDQUFDO1lBRUYsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN2RSxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDIn0=