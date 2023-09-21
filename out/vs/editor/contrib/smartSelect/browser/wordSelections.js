/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/core/range"], function (require, exports, strings_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WordSelectionRangeProvider = void 0;
    class WordSelectionRangeProvider {
        constructor(selectSubwords = true) {
            this.selectSubwords = selectSubwords;
        }
        provideSelectionRanges(model, positions) {
            const result = [];
            for (const position of positions) {
                const bucket = [];
                result.push(bucket);
                if (this.selectSubwords) {
                    this._addInWordRanges(bucket, model, position);
                }
                this._addWordRanges(bucket, model, position);
                this._addWhitespaceLine(bucket, model, position);
                bucket.push({ range: model.getFullModelRange() });
            }
            return result;
        }
        _addInWordRanges(bucket, model, pos) {
            const obj = model.getWordAtPosition(pos);
            if (!obj) {
                return;
            }
            const { word, startColumn } = obj;
            const offset = pos.column - startColumn;
            let start = offset;
            let end = offset;
            let lastCh = 0;
            // LEFT anchor (start)
            for (; start >= 0; start--) {
                const ch = word.charCodeAt(start);
                if ((start !== offset) && (ch === 95 /* CharCode.Underline */ || ch === 45 /* CharCode.Dash */)) {
                    // foo-bar OR foo_bar
                    break;
                }
                else if ((0, strings_1.isLowerAsciiLetter)(ch) && (0, strings_1.isUpperAsciiLetter)(lastCh)) {
                    // fooBar
                    break;
                }
                lastCh = ch;
            }
            start += 1;
            // RIGHT anchor (end)
            for (; end < word.length; end++) {
                const ch = word.charCodeAt(end);
                if ((0, strings_1.isUpperAsciiLetter)(ch) && (0, strings_1.isLowerAsciiLetter)(lastCh)) {
                    // fooBar
                    break;
                }
                else if (ch === 95 /* CharCode.Underline */ || ch === 45 /* CharCode.Dash */) {
                    // foo-bar OR foo_bar
                    break;
                }
                lastCh = ch;
            }
            if (start < end) {
                bucket.push({ range: new range_1.Range(pos.lineNumber, startColumn + start, pos.lineNumber, startColumn + end) });
            }
        }
        _addWordRanges(bucket, model, pos) {
            const word = model.getWordAtPosition(pos);
            if (word) {
                bucket.push({ range: new range_1.Range(pos.lineNumber, word.startColumn, pos.lineNumber, word.endColumn) });
            }
        }
        _addWhitespaceLine(bucket, model, pos) {
            if (model.getLineLength(pos.lineNumber) > 0
                && model.getLineFirstNonWhitespaceColumn(pos.lineNumber) === 0
                && model.getLineLastNonWhitespaceColumn(pos.lineNumber) === 0) {
                bucket.push({ range: new range_1.Range(pos.lineNumber, 1, pos.lineNumber, model.getLineMaxColumn(pos.lineNumber)) });
            }
        }
    }
    exports.WordSelectionRangeProvider = WordSelectionRangeProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29yZFNlbGVjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9zbWFydFNlbGVjdC9icm93c2VyL3dvcmRTZWxlY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxNQUFhLDBCQUEwQjtRQUV0QyxZQUE2QixpQkFBaUIsSUFBSTtZQUFyQixtQkFBYyxHQUFkLGNBQWMsQ0FBTztRQUFJLENBQUM7UUFFdkQsc0JBQXNCLENBQUMsS0FBaUIsRUFBRSxTQUFxQjtZQUM5RCxNQUFNLE1BQU0sR0FBdUIsRUFBRSxDQUFDO1lBQ3RDLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO2dCQUNqQyxNQUFNLE1BQU0sR0FBcUIsRUFBRSxDQUFDO2dCQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNwQixJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7b0JBQ3hCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2lCQUMvQztnQkFDRCxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNqRCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUNsRDtZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVPLGdCQUFnQixDQUFDLE1BQXdCLEVBQUUsS0FBaUIsRUFBRSxHQUFhO1lBQ2xGLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNULE9BQU87YUFDUDtZQUVELE1BQU0sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEdBQUcsR0FBRyxDQUFDO1lBQ2xDLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDO1lBQ3hDLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQztZQUNuQixJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUM7WUFDakIsSUFBSSxNQUFNLEdBQVcsQ0FBQyxDQUFDO1lBRXZCLHNCQUFzQjtZQUN0QixPQUFPLEtBQUssSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQzNCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxLQUFLLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLGdDQUF1QixJQUFJLEVBQUUsMkJBQWtCLENBQUMsRUFBRTtvQkFDOUUscUJBQXFCO29CQUNyQixNQUFNO2lCQUNOO3FCQUFNLElBQUksSUFBQSw0QkFBa0IsRUFBQyxFQUFFLENBQUMsSUFBSSxJQUFBLDRCQUFrQixFQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUNoRSxTQUFTO29CQUNULE1BQU07aUJBQ047Z0JBQ0QsTUFBTSxHQUFHLEVBQUUsQ0FBQzthQUNaO1lBQ0QsS0FBSyxJQUFJLENBQUMsQ0FBQztZQUVYLHFCQUFxQjtZQUNyQixPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFO2dCQUNoQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoQyxJQUFJLElBQUEsNEJBQWtCLEVBQUMsRUFBRSxDQUFDLElBQUksSUFBQSw0QkFBa0IsRUFBQyxNQUFNLENBQUMsRUFBRTtvQkFDekQsU0FBUztvQkFDVCxNQUFNO2lCQUNOO3FCQUFNLElBQUksRUFBRSxnQ0FBdUIsSUFBSSxFQUFFLDJCQUFrQixFQUFFO29CQUM3RCxxQkFBcUI7b0JBQ3JCLE1BQU07aUJBQ047Z0JBQ0QsTUFBTSxHQUFHLEVBQUUsQ0FBQzthQUNaO1lBRUQsSUFBSSxLQUFLLEdBQUcsR0FBRyxFQUFFO2dCQUNoQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsV0FBVyxHQUFHLEtBQUssRUFBRSxHQUFHLENBQUMsVUFBVSxFQUFFLFdBQVcsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDMUc7UUFDRixDQUFDO1FBRU8sY0FBYyxDQUFDLE1BQXdCLEVBQUUsS0FBaUIsRUFBRSxHQUFhO1lBQ2hGLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQyxJQUFJLElBQUksRUFBRTtnQkFDVCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDcEc7UUFDRixDQUFDO1FBRU8sa0JBQWtCLENBQUMsTUFBd0IsRUFBRSxLQUFpQixFQUFFLEdBQWE7WUFDcEYsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDO21CQUN2QyxLQUFLLENBQUMsK0JBQStCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7bUJBQzNELEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUM1RDtnQkFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUM3RztRQUNGLENBQUM7S0FDRDtJQTlFRCxnRUE4RUMifQ==