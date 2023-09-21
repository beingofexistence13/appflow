/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/linkedList", "vs/editor/common/core/position", "vs/editor/common/core/range"], function (require, exports, linkedList_1, position_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$O5 = void 0;
    class $O5 {
        async provideSelectionRanges(model, positions) {
            const result = [];
            for (const position of positions) {
                const bucket = [];
                result.push(bucket);
                const ranges = new Map();
                await new Promise(resolve => $O5.b(resolve, 0, model, position, ranges));
                await new Promise(resolve => $O5.c(resolve, 0, model, position, ranges, bucket));
            }
            return result;
        }
        static { this._maxDuration = 30; }
        static { this.a = 2; }
        static b(resolve, round, model, pos, ranges) {
            const counts = new Map();
            const t1 = Date.now();
            while (true) {
                if (round >= $O5.a) {
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
                if (d > $O5._maxDuration) {
                    setTimeout(() => $O5.b(resolve, round + 1, model, pos, ranges));
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
                            list = new linkedList_1.$tc();
                            ranges.set(key, list);
                        }
                        list.push(bracket.range);
                    }
                }
                pos = bracket.range.getEndPosition();
            }
        }
        static c(resolve, round, model, pos, ranges, bucket) {
            const counts = new Map();
            const t1 = Date.now();
            while (true) {
                if (round >= $O5.a && ranges.size === 0) {
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
                if (d > $O5._maxDuration) {
                    setTimeout(() => $O5.c(resolve, round + 1, model, pos, ranges, bucket));
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
                            const innerBracket = range_1.$ks.fromPositions(bracket.range.getEndPosition(), closing.getStartPosition());
                            const outerBracket = range_1.$ks.fromPositions(bracket.range.getStartPosition(), closing.getEndPosition());
                            bucket.push({ range: innerBracket });
                            bucket.push({ range: outerBracket });
                            $O5.e(model, outerBracket, bucket);
                        }
                    }
                }
                pos = bracket.range.getStartPosition();
            }
        }
        static e(model, bracket, bucket) {
            if (bracket.startLineNumber === bracket.endLineNumber) {
                return;
            }
            // xxxxxxxx {
            //
            // }
            const startLine = bracket.startLineNumber;
            const column = model.getLineFirstNonWhitespaceColumn(startLine);
            if (column !== 0 && column !== bracket.startColumn) {
                bucket.push({ range: range_1.$ks.fromPositions(new position_1.$js(startLine, column), bracket.getEndPosition()) });
                bucket.push({ range: range_1.$ks.fromPositions(new position_1.$js(startLine, 1), bracket.getEndPosition()) });
            }
            // xxxxxxxx
            // {
            //
            // }
            const aboveLine = startLine - 1;
            if (aboveLine > 0) {
                const column = model.getLineFirstNonWhitespaceColumn(aboveLine);
                if (column === bracket.startColumn && column !== model.getLineLastNonWhitespaceColumn(aboveLine)) {
                    bucket.push({ range: range_1.$ks.fromPositions(new position_1.$js(aboveLine, column), bracket.getEndPosition()) });
                    bucket.push({ range: range_1.$ks.fromPositions(new position_1.$js(aboveLine, 1), bracket.getEndPosition()) });
                }
            }
        }
    }
    exports.$O5 = $O5;
});
//# sourceMappingURL=bracketSelections.js.map