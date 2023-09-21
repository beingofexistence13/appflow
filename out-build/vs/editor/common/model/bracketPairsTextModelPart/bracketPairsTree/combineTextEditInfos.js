/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/beforeEditPositionMapper", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length"], function (require, exports, arrays_1, beforeEditPositionMapper_1, length_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OA = void 0;
    function $OA(textEditInfoFirst, textEditInfoSecond) {
        if (textEditInfoFirst.length === 0) {
            return textEditInfoSecond;
        }
        if (textEditInfoSecond.length === 0) {
            return textEditInfoFirst;
        }
        // s0: State before any edits
        const s0ToS1Map = new arrays_1.$0b(toLengthMapping(textEditInfoFirst));
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
            while (curItem && !(0, length_1.$qt)(s1Length)) {
                const [item, remainingItem] = curItem.splitAt(s1Length);
                result.push(item);
                s1Length = (0, length_1.$yt)(item.lengthAfter, s1Length);
                curItem = remainingItem ?? s0ToS1Map.dequeue();
            }
            if (!(0, length_1.$qt)(s1Length)) {
                result.push(new LengthMapping(false, s1Length, s1Length));
            }
            return result;
        }
        const result = [];
        function pushEdit(startOffset, endOffset, newLength) {
            if (result.length > 0 && (0, length_1.$xt)(result[result.length - 1].endOffset, startOffset)) {
                const lastResult = result[result.length - 1];
                result[result.length - 1] = new beforeEditPositionMapper_1.$IA(lastResult.startOffset, endOffset, (0, length_1.$vt)(lastResult.newLength, newLength));
            }
            else {
                result.push({ startOffset, endOffset, newLength });
            }
        }
        let s0offset = length_1.$pt;
        for (const s1ToS2 of s1ToS2Map) {
            const s0ToS1Map = nextS0ToS1MapWithS1LengthOf(s1ToS2.lengthBefore);
            if (s1ToS2.modified) {
                const s0Length = (0, length_1.$wt)(s0ToS1Map, s => s.lengthBefore);
                const s0EndOffset = (0, length_1.$vt)(s0offset, s0Length);
                pushEdit(s0offset, s0EndOffset, s1ToS2.lengthAfter);
                s0offset = s0EndOffset;
            }
            else {
                for (const s1 of s0ToS1Map) {
                    const s0startOffset = s0offset;
                    s0offset = (0, length_1.$vt)(s0offset, s1.lengthBefore);
                    if (s1.modified) {
                        pushEdit(s0startOffset, s0offset, s1.lengthAfter);
                    }
                }
            }
        }
        return result;
    }
    exports.$OA = $OA;
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
            const remainingLengthAfter = (0, length_1.$yt)(lengthAfter, this.lengthAfter);
            if ((0, length_1.$xt)(remainingLengthAfter, length_1.$pt)) {
                return [this, undefined];
            }
            else if (this.modified) {
                return [
                    new LengthMapping(this.modified, this.lengthBefore, lengthAfter),
                    new LengthMapping(this.modified, length_1.$pt, remainingLengthAfter)
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
            return `${this.modified ? 'M' : 'U'}:${(0, length_1.$st)(this.lengthBefore)} -> ${(0, length_1.$st)(this.lengthAfter)}`;
        }
    }
    function toLengthMapping(textEditInfos) {
        const result = [];
        let lastOffset = length_1.$pt;
        for (const textEditInfo of textEditInfos) {
            const spaceLength = (0, length_1.$yt)(lastOffset, textEditInfo.startOffset);
            if (!(0, length_1.$qt)(spaceLength)) {
                result.push(new LengthMapping(false, spaceLength, spaceLength));
            }
            const lengthBefore = (0, length_1.$yt)(textEditInfo.startOffset, textEditInfo.endOffset);
            result.push(new LengthMapping(true, lengthBefore, textEditInfo.newLength));
            lastOffset = textEditInfo.endOffset;
        }
        return result;
    }
});
//# sourceMappingURL=combineTextEditInfos.js.map