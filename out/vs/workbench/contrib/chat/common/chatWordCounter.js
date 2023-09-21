/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.countWords = exports.getNWords = void 0;
    const wordSeparatorCharPattern = /[\s\|\-]/;
    function getNWords(str, numWordsToCount) {
        let wordCount = numWordsToCount;
        let i = 0;
        while (i < str.length && wordCount > 0) {
            // Consume word separator chars
            while (i < str.length && str[i].match(wordSeparatorCharPattern)) {
                i++;
            }
            // Consume word chars
            while (i < str.length && !str[i].match(wordSeparatorCharPattern)) {
                i++;
            }
            wordCount--;
        }
        const value = str.substring(0, i);
        return {
            value,
            actualWordCount: numWordsToCount - wordCount,
            isFullString: i >= str.length
        };
    }
    exports.getNWords = getNWords;
    function countWords(str) {
        const result = getNWords(str, Number.MAX_SAFE_INTEGER);
        return result.actualWordCount;
    }
    exports.countWords = countWords;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFdvcmRDb3VudGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9jb21tb24vY2hhdFdvcmRDb3VudGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUVoRyxNQUFNLHdCQUF3QixHQUFHLFVBQVUsQ0FBQztJQVE1QyxTQUFnQixTQUFTLENBQUMsR0FBVyxFQUFFLGVBQXVCO1FBQzdELElBQUksU0FBUyxHQUFHLGVBQWUsQ0FBQztRQUNoQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixPQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxJQUFJLFNBQVMsR0FBRyxDQUFDLEVBQUU7WUFDdkMsK0JBQStCO1lBQy9CLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFO2dCQUNoRSxDQUFDLEVBQUUsQ0FBQzthQUNKO1lBRUQscUJBQXFCO1lBQ3JCLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLEVBQUU7Z0JBQ2pFLENBQUMsRUFBRSxDQUFDO2FBQ0o7WUFFRCxTQUFTLEVBQUUsQ0FBQztTQUNaO1FBRUQsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEMsT0FBTztZQUNOLEtBQUs7WUFDTCxlQUFlLEVBQUUsZUFBZSxHQUFHLFNBQVM7WUFDNUMsWUFBWSxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTTtTQUM3QixDQUFDO0lBQ0gsQ0FBQztJQXZCRCw4QkF1QkM7SUFFRCxTQUFnQixVQUFVLENBQUMsR0FBVztRQUNyQyxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3ZELE9BQU8sTUFBTSxDQUFDLGVBQWUsQ0FBQztJQUMvQixDQUFDO0lBSEQsZ0NBR0MifQ==