/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings"], function (require, exports, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LineDecorationsNormalizer = exports.DecorationSegment = exports.LineDecoration = void 0;
    class LineDecoration {
        constructor(startColumn, endColumn, className, type) {
            this.startColumn = startColumn;
            this.endColumn = endColumn;
            this.className = className;
            this.type = type;
            this._lineDecorationBrand = undefined;
        }
        static _equals(a, b) {
            return (a.startColumn === b.startColumn
                && a.endColumn === b.endColumn
                && a.className === b.className
                && a.type === b.type);
        }
        static equalsArr(a, b) {
            const aLen = a.length;
            const bLen = b.length;
            if (aLen !== bLen) {
                return false;
            }
            for (let i = 0; i < aLen; i++) {
                if (!LineDecoration._equals(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        }
        static extractWrapped(arr, startOffset, endOffset) {
            if (arr.length === 0) {
                return arr;
            }
            const startColumn = startOffset + 1;
            const endColumn = endOffset + 1;
            const lineLength = endOffset - startOffset;
            const r = [];
            let rLength = 0;
            for (const dec of arr) {
                if (dec.endColumn <= startColumn || dec.startColumn >= endColumn) {
                    continue;
                }
                r[rLength++] = new LineDecoration(Math.max(1, dec.startColumn - startColumn + 1), Math.min(lineLength + 1, dec.endColumn - startColumn + 1), dec.className, dec.type);
            }
            return r;
        }
        static filter(lineDecorations, lineNumber, minLineColumn, maxLineColumn) {
            if (lineDecorations.length === 0) {
                return [];
            }
            const result = [];
            let resultLen = 0;
            for (let i = 0, len = lineDecorations.length; i < len; i++) {
                const d = lineDecorations[i];
                const range = d.range;
                if (range.endLineNumber < lineNumber || range.startLineNumber > lineNumber) {
                    // Ignore decorations that sit outside this line
                    continue;
                }
                if (range.isEmpty() && (d.type === 0 /* InlineDecorationType.Regular */ || d.type === 3 /* InlineDecorationType.RegularAffectingLetterSpacing */)) {
                    // Ignore empty range decorations
                    continue;
                }
                const startColumn = (range.startLineNumber === lineNumber ? range.startColumn : minLineColumn);
                const endColumn = (range.endLineNumber === lineNumber ? range.endColumn : maxLineColumn);
                result[resultLen++] = new LineDecoration(startColumn, endColumn, d.inlineClassName, d.type);
            }
            return result;
        }
        static _typeCompare(a, b) {
            const ORDER = [2, 0, 1, 3];
            return ORDER[a] - ORDER[b];
        }
        static compare(a, b) {
            if (a.startColumn !== b.startColumn) {
                return a.startColumn - b.startColumn;
            }
            if (a.endColumn !== b.endColumn) {
                return a.endColumn - b.endColumn;
            }
            const typeCmp = LineDecoration._typeCompare(a.type, b.type);
            if (typeCmp !== 0) {
                return typeCmp;
            }
            if (a.className !== b.className) {
                return a.className < b.className ? -1 : 1;
            }
            return 0;
        }
    }
    exports.LineDecoration = LineDecoration;
    class DecorationSegment {
        constructor(startOffset, endOffset, className, metadata) {
            this.startOffset = startOffset;
            this.endOffset = endOffset;
            this.className = className;
            this.metadata = metadata;
        }
    }
    exports.DecorationSegment = DecorationSegment;
    class Stack {
        constructor() {
            this.stopOffsets = [];
            this.classNames = [];
            this.metadata = [];
            this.count = 0;
        }
        static _metadata(metadata) {
            let result = 0;
            for (let i = 0, len = metadata.length; i < len; i++) {
                result |= metadata[i];
            }
            return result;
        }
        consumeLowerThan(maxStopOffset, nextStartOffset, result) {
            while (this.count > 0 && this.stopOffsets[0] < maxStopOffset) {
                let i = 0;
                // Take all equal stopping offsets
                while (i + 1 < this.count && this.stopOffsets[i] === this.stopOffsets[i + 1]) {
                    i++;
                }
                // Basically we are consuming the first i + 1 elements of the stack
                result.push(new DecorationSegment(nextStartOffset, this.stopOffsets[i], this.classNames.join(' '), Stack._metadata(this.metadata)));
                nextStartOffset = this.stopOffsets[i] + 1;
                // Consume them
                this.stopOffsets.splice(0, i + 1);
                this.classNames.splice(0, i + 1);
                this.metadata.splice(0, i + 1);
                this.count -= (i + 1);
            }
            if (this.count > 0 && nextStartOffset < maxStopOffset) {
                result.push(new DecorationSegment(nextStartOffset, maxStopOffset - 1, this.classNames.join(' '), Stack._metadata(this.metadata)));
                nextStartOffset = maxStopOffset;
            }
            return nextStartOffset;
        }
        insert(stopOffset, className, metadata) {
            if (this.count === 0 || this.stopOffsets[this.count - 1] <= stopOffset) {
                // Insert at the end
                this.stopOffsets.push(stopOffset);
                this.classNames.push(className);
                this.metadata.push(metadata);
            }
            else {
                // Find the insertion position for `stopOffset`
                for (let i = 0; i < this.count; i++) {
                    if (this.stopOffsets[i] >= stopOffset) {
                        this.stopOffsets.splice(i, 0, stopOffset);
                        this.classNames.splice(i, 0, className);
                        this.metadata.splice(i, 0, metadata);
                        break;
                    }
                }
            }
            this.count++;
            return;
        }
    }
    class LineDecorationsNormalizer {
        /**
         * Normalize line decorations. Overlapping decorations will generate multiple segments
         */
        static normalize(lineContent, lineDecorations) {
            if (lineDecorations.length === 0) {
                return [];
            }
            const result = [];
            const stack = new Stack();
            let nextStartOffset = 0;
            for (let i = 0, len = lineDecorations.length; i < len; i++) {
                const d = lineDecorations[i];
                let startColumn = d.startColumn;
                let endColumn = d.endColumn;
                const className = d.className;
                const metadata = (d.type === 1 /* InlineDecorationType.Before */
                    ? 2 /* LinePartMetadata.PSEUDO_BEFORE */
                    : d.type === 2 /* InlineDecorationType.After */
                        ? 4 /* LinePartMetadata.PSEUDO_AFTER */
                        : 0);
                // If the position would end up in the middle of a high-low surrogate pair, we move it to before the pair
                if (startColumn > 1) {
                    const charCodeBefore = lineContent.charCodeAt(startColumn - 2);
                    if (strings.isHighSurrogate(charCodeBefore)) {
                        startColumn--;
                    }
                }
                if (endColumn > 1) {
                    const charCodeBefore = lineContent.charCodeAt(endColumn - 2);
                    if (strings.isHighSurrogate(charCodeBefore)) {
                        endColumn--;
                    }
                }
                const currentStartOffset = startColumn - 1;
                const currentEndOffset = endColumn - 2;
                nextStartOffset = stack.consumeLowerThan(currentStartOffset, nextStartOffset, result);
                if (stack.count === 0) {
                    nextStartOffset = currentStartOffset;
                }
                stack.insert(currentEndOffset, className, metadata);
            }
            stack.consumeLowerThan(1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */, nextStartOffset, result);
            return result;
        }
    }
    exports.LineDecorationsNormalizer = LineDecorationsNormalizer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZURlY29yYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi92aWV3TGF5b3V0L2xpbmVEZWNvcmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEcsTUFBYSxjQUFjO1FBRzFCLFlBQ2lCLFdBQW1CLEVBQ25CLFNBQWlCLEVBQ2pCLFNBQWlCLEVBQ2pCLElBQTBCO1lBSDFCLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1lBQ25CLGNBQVMsR0FBVCxTQUFTLENBQVE7WUFDakIsY0FBUyxHQUFULFNBQVMsQ0FBUTtZQUNqQixTQUFJLEdBQUosSUFBSSxDQUFzQjtZQU4zQyx5QkFBb0IsR0FBUyxTQUFTLENBQUM7UUFRdkMsQ0FBQztRQUVPLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBaUIsRUFBRSxDQUFpQjtZQUMxRCxPQUFPLENBQ04sQ0FBQyxDQUFDLFdBQVcsS0FBSyxDQUFDLENBQUMsV0FBVzttQkFDNUIsQ0FBQyxDQUFDLFNBQVMsS0FBSyxDQUFDLENBQUMsU0FBUzttQkFDM0IsQ0FBQyxDQUFDLFNBQVMsS0FBSyxDQUFDLENBQUMsU0FBUzttQkFDM0IsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxDQUNwQixDQUFDO1FBQ0gsQ0FBQztRQUVNLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBbUIsRUFBRSxDQUFtQjtZQUMvRCxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQ3RCLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDdEIsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO2dCQUNsQixPQUFPLEtBQUssQ0FBQzthQUNiO1lBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFD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