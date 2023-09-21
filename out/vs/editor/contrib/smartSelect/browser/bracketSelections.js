/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/linkedList", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, linkedList_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BracketSelectionRangeProvider = void 0;
    class BracketSelectionRangeProvider {
        async provideSelectionRanges(model, positions) {
            const result = [];
            for (const position of positions) {
                const bucket = [];
                result.push(bucket);
                const ranges = new Map();
                await new Promise(resolve => BracketSelectionRangeProvider._bracketsRightYield(resolve, 0, model, position, ranges));
                await new Promise(resolve => BracketSelectionRangeProvider._bracketsLeftYield(resolve, 0, model, position, ranges, bucket));
            }
            return result;
        }
        static { this._maxDuration = 30; }
        static { this._maxRounds = 2; }
        static _bracketsRightYield(resolve, round, model, pos, ranges) {
            const counts = new Map();
            const t1 = Date.now();
            while (true) {
                if (round >= BracketSelectionRangeProvider._maxRounds) {
                    resolve();
                    break;
                }
                if (!pos) {
                    resolve();
                    break;
                }
                const bracket = model.bracketPairs.findNextBracket(pos);
                if (!bracket) {
                    resolve();
                    break;
                }
                const d = Date.now() - t1;
                if (d > BracketSelectionRangeProvider._maxDuration) {
                    setTimeout(() => BracketSelectionRangeProvider._bracketsRightYield(resolve, round + 1, model, pos, ranges));
                    break;
                }
                if (bracket.bracketInfo.isOpeningBracket) {
                    const key = bracket.bracketInfo.bracketText;
                    // wait for closing
                    const val = counts.has(key) ? counts.get(key) : 0;
                    counts.set(key, val + 1);
                }
                else {
                    const key = bracket.bracketInfo.getOpeningBrackets()[0].bracketText;
                    // process closing
                    let val = counts.has(key) ? counts.get(key) : 0;
                    val -= 1;
                    counts.set(key, Math.max(0, val));
                    if (val < 0) {
                        let list = ranges.get(key);
                        if (!list) {
                            list = new linkedList_1.LinkedList();
                            ranges.set(key, list);
                        }
                        list.push(bracket.range);
                    }
                }
                pos = bracket.range.getEndPosition();
            }
        }
        static _bracketsLeftYield(resolve, round, model, pos, ranges, bucket) {
            const counts = new Map();
            const t1 = Date.now();
            while (true) {
                if (round >= BracketSelectionRangeProvider._maxRounds && ranges.size === 0) {
                    resolve();
                    break;
                }
                if (!pos) {
                    resolve();
                    break;
                }
                const bracket = model.bracketPairs.findPrevBracket(pos);
                if (!bracket) {
                    resolve();
                    break;
                }
                const d = Date.now() - t1;
                if (d > BracketSelectionRangeProvider._maxDuration) {
                    setTimeout(() => BracketSelectionRangeProvider._bracketsLeftYield(resolve, round + 1, model, pos, ranges, bucket));
                    break;
                }
                if (!bracket.bracketInfo.isOpeningBracket) {
                    const key = bracket.bracketInfo.getOpeningBrackets()[0].bracketText;
                    // wait for opening
                    const val = counts.has(key) ? counts.get(key) : 0;
                    counts.set(key, val + 1);
                }
                else {
                    const key = bracket.bracketInfo.bracketText;
                    // opening
                    let val = counts.has(key) ? counts.get(key) : 0;
                    val -= 1;
                    counts.set(key, Math.max(0, val));
                    if (val < 0) {
                        const list = ranges.get(key);
                        if (list) {
                            const closing = list.shift();
                            if (list.size === 0) {
                                ranges.delete(key);
                            }
                            const innerBracket = range_1.Range.fromPositions(bracket.range.getEndPosition(), closing.getStartPosition());
                            const outerBracket = range_1.Range.fromPositions(bracket.range.getStartPosition(), closing.getEndPosition());
                            bucket.push({ range: innerBracket });
                            bucket.push({ range: outerBracket });
                            BracketSelectionRangeProvider._addBracketLeading(model, outerBracket, bucket);
                        }
                    }
                }
                pos = bracket.range.getStartPosition();
            }
        }
        static _addBracketLeading(model, bracket, bucket) {
            if (bracket.startLineNumber === bracket.endLineNumber) {
                return;
            }
            // xxxxxxxx {
            //
            // }
            const startLine = bracket.startLineNumber;
            const column = model.getLineFirstNonWhitespaceColumn(startLine);
            if (column !== 0 && column !== bracket.startColumn) {
                bucket.push({ range: range_1.Range.fromPositions(new position_1.Position(startLine, column), bracket.getEndPosition()) });
                bucket.push({ range: range_1.Range.fromPositions(new position_1.Position(startLine, 1), bracket.getEndPosition()) });
            }
            // xxxxxxxx
            // {
            //
            // }
            const aboveLine = startLine - 1;
            if (aboveLine > 0) {
                const column = model.getLineFirstNonWhitespaceColumn(aboveLine);
                if (column === bracket.startColumn && column !== model.getLineLastNonWhitespaceColumn(aboveLine)) {
                    bucket.push({ range: range_1.Range.fromPositions(new position_1.Position(aboveLine, column), bracket.getEndPosition()) });
                    bucket.push({ range: range_1.Range.fromPositions(new position_1.Position(aboveLine, 1), bracket.getEndPosition()) });
                }
            }
        }
    }
    exports.BracketSelectionRangeProvider = BracketSelectionRangeProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhY2tldFNlbGVjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9zbWFydFNlbGVjdC9icm93c2VyL2JyYWNrZXRTZWxlY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRyxNQUFhLDZCQUE2QjtRQUV6QyxLQUFLLENBQUMsc0JBQXNCLENBQUMsS0FBaUIsRUFBRSxTQUFxQjtZQUNwRSxNQUFNLE1BQU0sR0FBdUIsRUFBRSxDQUFDO1lBRXRDLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO2dCQUNqQyxNQUFNLE1BQU0sR0FBcUIsRUFBRSxDQUFDO2dCQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVwQixNQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBNkIsQ0FBQztnQkFDcEQsTUFBTSxJQUFJLE9BQU8sQ0FBTyxPQUFPLENBQUMsRUFBRSxDQUFDLDZCQUE2QixDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUMzSCxNQUFNLElBQUksT0FBTyxDQUFPLE9BQU8sQ0FBQyxFQUFFLENBQUMsNkJBQTZCLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ2xJO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO2lCQUVhLGlCQUFZLEdBQUcsRUFBRSxDQUFDO2lCQUNSLGVBQVUsR0FBRyxDQUFDLENBQUM7UUFFL0IsTUFBTSxDQUFDLG1CQUFtQixDQUFDLE9BQW1CLEVBQUUsS0FBYSxFQUFFLEtBQWlCLEVBQUUsR0FBYSxFQUFFLE1BQXNDO1lBQzlJLE1BQU0s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