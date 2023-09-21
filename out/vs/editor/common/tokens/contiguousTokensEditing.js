/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/tokens/lineTokens"], function (require, exports, lineTokens_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toUint32Array = exports.ContiguousTokensEditing = exports.EMPTY_LINE_TOKENS = void 0;
    exports.EMPTY_LINE_TOKENS = (new Uint32Array(0)).buffer;
    class ContiguousTokensEditing {
        static deleteBeginning(lineTokens, toChIndex) {
            if (lineTokens === null || lineTokens === exports.EMPTY_LINE_TOKENS) {
                return lineTokens;
            }
            return ContiguousTokensEditing.delete(lineTokens, 0, toChIndex);
        }
        static deleteEnding(lineTokens, fromChIndex) {
            if (lineTokens === null || lineTokens === exports.EMPTY_LINE_TOKENS) {
                return lineTokens;
            }
            const tokens = toUint32Array(lineTokens);
            const lineTextLength = tokens[tokens.length - 2];
            return ContiguousTokensEditing.delete(lineTokens, fromChIndex, lineTextLength);
        }
        static delete(lineTokens, fromChIndex, toChIndex) {
            if (lineTokens === null || lineTokens === exports.EMPTY_LINE_TOKENS || fromChIndex === toChIndex) {
                return lineTokens;
            }
            const tokens = toUint32Array(lineTokens);
            const tokensCount = (tokens.length >>> 1);
            // special case: deleting everything
            if (fromChIndex === 0 && tokens[tokens.length - 2] === toChIndex) {
                return exports.EMPTY_LINE_TOKENS;
            }
            const fromTokenIndex = lineTokens_1.LineTokens.findIndexInTokensArray(tokens, fromChIndex);
            const fromTokenStartOffset = (fromTokenIndex > 0 ? tokens[(fromTokenIndex - 1) << 1] : 0);
            const fromTokenEndOffset = tokens[fromTokenIndex << 1];
            if (toChIndex < fromTokenEndOffset) {
                // the delete range is inside a single token
                const delta = (toChIndex - fromChIndex);
                for (let i = fromTokenIndex; i < tokensCount; i++) {
                    tokens[i << 1] -= delta;
                }
                return lineTokens;
            }
            let dest;
            let lastEnd;
            if (fromTokenStartOffset !== fromChIndex) {
                tokens[fromTokenIndex << 1] = fromChIndex;
                dest = ((fromTokenIndex + 1) << 1);
                lastEnd = fromChIndex;
            }
            else {
                dest = (fromTokenIndex << 1);
                lastEnd = fromTokenStartOffset;
            }
            const delta = (toChIndex - fromChIndex);
            for (let tokenIndex = fromTokenIndex + 1; tokenIndex < tokensCount; tokenIndex++) {
                const tokenEndOffset = tokens[tokenIndex << 1] - delta;
                if (tokenEndOffset > lastEnd) {
                    tokens[dest++] = tokenEndOffset;
                    tokens[dest++] = tokens[(tokenIndex << 1) + 1];
                    lastEnd = tokenEndOffset;
                }
            }
            if (dest === tokens.length) {
                // nothing to trim
                return lineTokens;
            }
            const tmp = new Uint32Array(dest);
            tmp.set(tokens.subarray(0, dest), 0);
            return tmp.buffer;
        }
        static append(lineTokens, _otherTokens) {
            if (_otherTokens === exports.EMPTY_LINE_TOKENS) {
                return lineTokens;
            }
            if (lineTokens === exports.EMPTY_LINE_TOKENS) {
                return _otherTokens;
            }
            if (lineTokens === null) {
                return lineTokens;
            }
            if (_otherTokens === null) {
                // cannot determine combined line length...
                return null;
            }
            const myTokens = toUint32Array(lineTokens);
            const otherTokens = toUint32Array(_otherTokens);
            const otherTokensCount = (otherTokens.length >>> 1);
            const result = new Uint32Array(myTokens.length + otherTokens.length);
            result.set(myTokens, 0);
            let dest = myTokens.length;
            const delta = myTokens[myTokens.length - 2];
            for (let i = 0; i < otherTokensCount; i++) {
                result[dest++] = otherTokens[(i << 1)] + delta;
                result[dest++] = otherTokens[(i << 1) + 1];
            }
            return result.buffer;
        }
        static insert(lineTokens, chIndex, textLength) {
            if (lineTokens === null || lineTokens === exports.EMPTY_LINE_TOKENS) {
                // nothing to do
                return lineTokens;
            }
            const tokens = toUint32Array(lineTokens);
            const tokensCount = (tokens.length >>> 1);
            let fromTokenIndex = lineTokens_1.LineTokens.findIndexInTokensArray(tokens, chIndex);
            if (fromTokenIndex > 0) {
                const fromTokenStartOffset = tokens[(fromTokenIndex - 1) << 1];
                if (fromTokenStartOffset === chIndex) {
                    fromTokenIndex--;
                }
            }
            for (let tokenIndex = fromTokenIndex; tokenIndex < tokensCount; tokenIndex++) {
                tokens[tokenIndex << 1] += textLength;
            }
            return lineTokens;
        }
    }
    exports.ContiguousTokensEditing = ContiguousTokensEditing;
    function toUint32Array(arr) {
        if (arr instanceof Uint32Array) {
            return arr;
        }
        else {
            return new Uint32Array(arr);
        }
    }
    exports.toUint32Array = toUint32Array;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGlndW91c1Rva2Vuc0VkaXRpbmcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL3Rva2Vucy9jb250aWd1b3VzVG9rZW5zRWRpdGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJbkYsUUFBQSxpQkFBaUIsR0FBRyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBRTdELE1BQWEsdUJBQXVCO1FBRTVCLE1BQU0sQ0FBQyxlQUFlLENBQUMsVUFBNEMsRUFBRSxTQUFpQjtZQUM1RixJQUFJLFVBQVUsS0FBSyxJQUFJLElBQUksVUFBVSxLQUFLLHlCQUFpQixFQUFFO2dCQUM1RCxPQUFPLFVBQVUsQ0FBQzthQUNsQjtZQUNELE9BQU8sdUJBQXVCLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVNLE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBNEMsRUFBRSxXQUFtQjtZQUMzRixJQUFJLFVBQVUsS0FBSyxJQUFJLElBQUksVUFBVSxLQUFLLHlCQUFpQixFQUFFO2dCQUM1RCxPQUFPLFVBQVUsQ0FBQzthQUNsQjtZQUVELE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN6QyxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNqRCxPQUFPLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFTSxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQTRDLEVBQUUsV0FBbUIsRUFBRSxTQUFpQjtZQUN4RyxJQUFJLFVBQVUsS0FBSyxJQUFJLElBQUksVUFBVSxLQUFLLHlCQUFpQixJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7Z0JBQ3pGLE9BQU8sVUFBVSxDQUFDO2FBQ2xCO1lBRUQsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sV0FBVyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQztZQUUxQyxvQ0FBb0M7WUFDcEMsSUFBSSxXQUFXLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLFNBQVMsRUFBRTtnQkFDakUsT0FBTyx5QkFBaUIsQ0FBQzthQUN6QjtZQUVELE1BQU0sY0FBYyxHQUFHLHVCQUFVLENBQUMsc0JBQXNCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzlFLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFGLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxDQUFDLGNBQWMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUV2RCxJQUFJLFNBQVMsR0FBRyxrQkFBa0IsRUFBRTtnQkFDbkMsNENBQTRDO2dCQUM1QyxNQUFNLEtBQUssR0FBRyxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUMsQ0FBQztnQkFDeEMsS0FBSyxJQUFJLENBQUMsR0FBRyxjQUFjLEVBQUUsQ0FBQyxHQUFHLFdBQVcsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDbEQsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUM7aUJBQ3hCO2dCQUNELE9BQU8sVUFBVSxDQUFDO2FBQ2xCO1lBRUQsSUFBSSxJQUFZLENBQUM7WUFDakIsSUFBSSxPQUFlLENBQUM7WUFDcEIsSUFBSSxvQkFBb0IsS0FBSyxXQUFXLEVBQUU7Z0JBQ3pDLE1BQU0sQ0FBQyxjQUFjLElBQUksQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDO2dCQUMxQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDbkMsT0FBTyxHQUFHLFdBQVcsQ0FBQzthQUN0QjtpQkFBTTtnQkFDTixJQUFJLEdBQUcsQ0FBQyxjQUFjLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQzthQUMvQjtZQUVELE1BQU0sS0FBSyxHQUFHLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQyxDQUFDO1lBQ3hDLEtBQUssSUFBSSxVQUFVLEdBQUcsY0FBYyxHQUFHLENBQUMsRUFBRSxVQUFVLEdBQUcsV0FBVyxFQUFFLFVBQVUsRUFBRSxFQUFFO2dCQUNqRixNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDdkQsSUFBSSxjQUFjLEdBQUcsT0FBTyxFQUFFO29CQUM3QixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxjQUFjLENBQUM7b0JBQ2hDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDL0MsT0FBTyxHQUFHLGNBQWMsQ0FBQztpQkFDekI7YUFDRDtZQUVELElBQUksSUFBSSxLQUFLLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQzNCLGtCQUFrQjtnQkFDbEIsT0FBTyxVQUFVLENBQUM7YUFDbEI7WUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUNuQixDQUFDO1FBRU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUE0QyxFQUFFLFlBQThDO1lBQ2hILElBQUksWUFBWSxLQUFLLHlCQUFpQixFQUFFO2dCQUN2QyxPQUFPLFVBQVUsQ0FBQzthQUNsQjtZQUNELElBQUksVUFBVSxLQUFLLHlCQUFpQixFQUFFO2dCQUNyQyxPQUFPLFlBQVksQ0FBQzthQUNwQjtZQUNELElBQUksVUFBVSxLQUFLLElBQUksRUFBRTtnQkFDeEIsT0FBTyxVQUFVLENBQUM7YUFDbEI7WUFDRCxJQUFJLFlBQVksS0FBSyxJQUFJLEVBQUU7Z0JBQzFCLDJDQUEyQztnQkFDM0MsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUNELE1BQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMzQyxNQUFNLFdBQVcsR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDaEQsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFcEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEIsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUMzQixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM1QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDL0MsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQzNDO1lBQ0QsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ3RCLENBQUM7UUFFTSxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQTRDLEVBQUUsT0FBZSxFQUFFLFVBQWtCO1lBQ3JHLElBQUksVUFBVSxLQUFLLElBQUksSUFBSSxVQUFVLEtBQUsseUJBQWlCLEVBQUU7Z0JBQzVELGdCQUFnQjtnQkFDaEIsT0FBTyxVQUFVLENBQUM7YUFDbEI7WUFFRCxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDekMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRTFDLElBQUksY0FBYyxHQUFHLHVCQUFVLENBQUMsc0JBQXNCLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3hFLElBQUksY0FBYyxHQUFHLENBQUMsRUFBRTtnQkFDdkIsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQy9ELElBQUksb0JBQW9CLEtBQUssT0FBTyxFQUFFO29CQUNyQyxjQUFjLEVBQUUsQ0FBQztpQkFDakI7YUFDRDtZQUNELEtBQUssSUFBSSxVQUFVLEdBQUcsY0FBYyxFQUFFLFVBQVUsR0FBRyxXQUFXLEVBQUUsVUFBVSxFQUFFLEVBQUU7Z0JBQzdFLE1BQU0sQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDO2FBQ3RDO1lBQ0QsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUNEO0lBOUhELDBEQThIQztJQUVELFNBQWdCLGFBQWEsQ0FBQyxHQUE4QjtRQUMzRCxJQUFJLEdBQUcsWUFBWSxXQUFXLEVBQUU7WUFDL0IsT0FBTyxHQUFHLENBQUM7U0FDWDthQUFNO1lBQ04sT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUM1QjtJQUNGLENBQUM7SUFORCxzQ0FNQyJ9