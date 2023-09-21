/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings"], function (require, exports, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OW = exports.$NW = exports.$MW = void 0;
    class $MW {
        constructor(startColumn, endColumn, className, type) {
            this.startColumn = startColumn;
            this.endColumn = endColumn;
            this.className = className;
            this.type = type;
            this._lineDecorationBrand = undefined;
        }
        static c(a, b) {
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
                if (!$MW.c(a[i], b[i])) {
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
                r[rLength++] = new $MW(Math.max(1, dec.startColumn - startColumn + 1), Math.min(lineLength + 1, dec.endColumn - startColumn + 1), dec.className, dec.type);
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
                result[resultLen++] = new $MW(startColumn, endColumn, d.inlineClassName, d.type);
            }
            return result;
        }
        static e(a, b) {
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
            const typeCmp = $MW.e(a.type, b.type);
            if (typeCmp !== 0) {
                return typeCmp;
            }
            if (a.className !== b.className) {
                return a.className < b.className ? -1 : 1;
            }
            return 0;
        }
    }
    exports.$MW = $MW;
    class $NW {
        constructor(startOffset, endOffset, className, metadata) {
            this.startOffset = startOffset;
            this.endOffset = endOffset;
            this.className = className;
            this.metadata = metadata;
        }
    }
    exports.$NW = $NW;
    class Stack {
        constructor() {
            this.c = [];
            this.e = [];
            this.f = [];
            this.count = 0;
        }
        static g(metadata) {
            let result = 0;
            for (let i = 0, len = metadata.length; i < len; i++) {
                result |= metadata[i];
            }
            return result;
        }
        consumeLowerThan(maxStopOffset, nextStartOffset, result) {
            while (this.count > 0 && this.c[0] < maxStopOffset) {
                let i = 0;
                // Take all equal stopping offsets
                while (i + 1 < this.count && this.c[i] === this.c[i + 1]) {
                    i++;
                }
                // Basically we are consuming the first i + 1 elements of the stack
                result.push(new $NW(nextStartOffset, this.c[i], this.e.join(' '), Stack.g(this.f)));
                nextStartOffset = this.c[i] + 1;
                // Consume them
                this.c.splice(0, i + 1);
                this.e.splice(0, i + 1);
                this.f.splice(0, i + 1);
                this.count -= (i + 1);
            }
            if (this.count > 0 && nextStartOffset < maxStopOffset) {
                result.push(new $NW(nextStartOffset, maxStopOffset - 1, this.e.join(' '), Stack.g(this.f)));
                nextStartOffset = maxStopOffset;
            }
            return nextStartOffset;
        }
        insert(stopOffset, className, metadata) {
            if (this.count === 0 || this.c[this.count - 1] <= stopOffset) {
                // Insert at the end
                this.c.push(stopOffset);
                this.e.push(className);
                this.f.push(metadata);
            }
            else {
                // Find the insertion position for `stopOffset`
                for (let i = 0; i < this.count; i++) {
                    if (this.c[i] >= stopOffset) {
                        this.c.splice(i, 0, stopOffset);
                        this.e.splice(i, 0, className);
                        this.f.splice(i, 0, metadata);
                        break;
                    }
                }
            }
            this.count++;
            return;
        }
    }
    class $OW {
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
                    if (strings.$Qe(charCodeBefore)) {
                        startColumn--;
                    }
                }
                if (endColumn > 1) {
                    const charCodeBefore = lineContent.charCodeAt(endColumn - 2);
                    if (strings.$Qe(charCodeBefore)) {
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
    exports.$OW = $OW;
});
//# sourceMappingURL=lineDecorations.js.map