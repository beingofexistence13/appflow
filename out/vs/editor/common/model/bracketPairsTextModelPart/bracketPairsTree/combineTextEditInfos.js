/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/beforeEditPositionMapper", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length"], function (require, exports, arrays_1, beforeEditPositionMapper_1, length_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.combineTextEditInfos = void 0;
    function combineTextEditInfos(textEditInfoFirst, textEditInfoSecond) {
        if (textEditInfoFirst.length === 0) {
            return textEditInfoSecond;
        }
        if (textEditInfoSecond.length === 0) {
            return textEditInfoFirst;
        }
        // s0: State before any edits
        const s0ToS1Map = new arrays_1.ArrayQueue(toLengthMapping(textEditInfoFirst));
        // s1: State after first edit, but before second edit
        const s1ToS2Map = toLengthMapping(textEditInfoSecond);
        s1ToS2Map.push({ modified: false, lengthBefore: undefined, lengthAfter: undefined }); // Copy everything from old to new
        // s2: State after both edits
        let curItem = s0ToS1Map.dequeue();
        /**
         * @param s1Length Use undefined for length "infinity"
         */
        function nextS0ToS1MapWithS1LengthOf(s1Length) {
            if (s1Length === undefined) {
                const arr = s0ToS1Map.takeWhile(v => true) || [];
                if (curItem) {
                    arr.unshift(curItem);
                }
                return arr;
            }
            const result = [];
            while (curItem && !(0, length_1.lengthIsZero)(s1Length)) {
                const [item, remainingItem] = curItem.splitAt(s1Length);
                result.push(item);
                s1Length = (0, length_1.lengthDiffNonNegative)(item.lengthAfter, s1Length);
                curItem = remainingItem ?? s0ToS1Map.dequeue();
            }
            if (!(0, length_1.lengthIsZero)(s1Length)) {
                result.push(new LengthMapping(false, s1Length, s1Length));
            }
            return result;
        }
        const result = [];
        function pushEdit(startOffset, endOffset, newLength) {
            if (result.length > 0 && (0, length_1.lengthEquals)(result[result.length - 1].endOffset, startOffset)) {
                const lastResult = result[result.length - 1];
                result[result.length - 1] = new beforeEditPositionMapper_1.TextEditInfo(lastResult.startOffset, endOffset, (0, length_1.lengthAdd)(lastResult.newLength, newLength));
            }
            else {
                result.push({ startOffset, endOffset, newLength });
            }
        }
        let s0offset = length_1.lengthZero;
        for (const s1ToS2 of s1ToS2Map) {
            const s0ToS1Map = nextS0ToS1MapWithS1LengthOf(s1ToS2.lengthBefore);
            if (s1ToS2.modified) {
                const s0Length = (0, length_1.sumLengths)(s0ToS1Map, s => s.lengthBefore);
                const s0EndOffset = (0, length_1.lengthAdd)(s0offset, s0Length);
                pushEdit(s0offset, s0EndOffset, s1ToS2.lengthAfter);
                s0offset = s0EndOffset;
            }
            else {
                for (const s1 of s0ToS1Map) {
                    const s0startOffset = s0offset;
                    s0offset = (0, length_1.lengthAdd)(s0offset, s1.lengthBefore);
                    if (s1.modified) {
                        pushEdit(s0startOffset, s0offset, s1.lengthAfter);
                    }
                }
            }
        }
        return result;
    }
    exports.combineTextEditInfos = combineTextEditInfos;
    class LengthMapping {
        constructor(
        /**
         * If false, length before and length after equal.
         */
        modified, lengthBefore, lengthAfter) {
            this.modified = modified;
            this.lengthBefore = lengthBefore;
            this.lengthAfter = lengthAfter;
        }
        splitAt(lengthAfter) {
            const remainingLengthAfter = (0, length_1.lengthDiffNonNegative)(lengthAfter, this.lengthAfter);
            if ((0, length_1.lengthEquals)(remainingLengthAfter, length_1.lengthZero)) {
                return [this, undefined];
            }
            else if (this.modified) {
                return [
                    new LengthMapping(this.modified, this.lengthBefore, lengthAfter),
                    new LengthMapping(this.modified, length_1.lengthZero, remainingLengthAfter)
                ];
            }
            else {
                return [
                    new LengthMapping(this.modified, lengthAfter, lengthAfter),
                    new LengthMapping(this.modified, remainingLengthAfter, remainingLengthAfter)
                ];
            }
        }
        toString() {
            return `${this.modified ? 'M' : 'U'}:${(0, length_1.lengthToObj)(this.lengthBefore)} -> ${(0, length_1.lengthToObj)(this.lengthAfter)}`;
        }
    }
    function toLengthMapping(textEditInfos) {
        const result = [];
        let lastOffset = length_1.lengthZero;
        for (const textEditInfo of textEditInfos) {
            const spaceLength = (0, length_1.lengthDiffNonNegative)(lastOffset, textEditInfo.startOffset);
            if (!(0, length_1.lengthIsZero)(spaceLength)) {
                result.push(new LengthMapping(false, spaceLength, spaceLength));
            }
            const lengthBefore = (0, length_1.lengthDiffNonNegative)(textEditInfo.startOffset, textEditInfo.endOffset);
            result.push(new LengthMapping(true, lengthBefore, textEditInfo.newLength));
            lastOffset = textEditInfo.endOffset;
        }
        return result;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYmluZVRleHRFZGl0SW5mb3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL21vZGVsL2JyYWNrZXRQYWlyc1RleHRNb2RlbFBhcnQvYnJhY2tldFBhaXJzVHJlZS9jb21iaW5lVGV4dEVkaXRJbmZvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsU0FBZ0Isb0JBQW9CLENBQUMsaUJBQWlDLEVBQUUsa0JBQWtDO1FBQ3pHLElBQUksaUJBQWlCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNuQyxPQUFPLGtCQUFrQixDQUFDO1NBQzFCO1FBQ0QsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3BDLE9BQU8saUJBQWlCLENBQUM7U0FDekI7UUFFRCw2QkFBNkI7UUFDN0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxtQkFBVSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFDckUscURBQXFEO1FBQ3JELE1BQU0sU0FBUyxHQUFHLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBNkYsQ0FBQztRQUNsSixTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsa0NBQWtDO1FBQ3hILDZCQUE2QjtRQUU3QixJQUFJLE9BQU8sR0FBOEIsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRTdEOztXQUVHO1FBQ0gsU0FBUywyQkFBMkIsQ0FBQyxRQUE0QjtZQUNoRSxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7Z0JBQzNCLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JB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