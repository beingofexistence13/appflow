/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LineSequence = void 0;
    class LineSequence {
        constructor(trimmedHash, lines) {
            this.trimmedHash = trimmedHash;
            this.lines = lines;
        }
        getElement(offset) {
            return this.trimmedHash[offset];
        }
        get length() {
            return this.trimmedHash.length;
        }
        getBoundaryScore(length) {
            const indentationBefore = length === 0 ? 0 : getIndentation(this.lines[length - 1]);
            const indentationAfter = length === this.lines.length ? 0 : getIndentation(this.lines[length]);
            return 1000 - (indentationBefore + indentationAfter);
        }
        getText(range) {
            return this.lines.slice(range.start, range.endExclusive).join('\n');
        }
        isStronglyEqual(offset1, offset2) {
            return this.lines[offset1] === this.lines[offset2];
        }
    }
    exports.LineSequence = LineSequence;
    function getIndentation(str) {
        let i = 0;
        while (i < str.length && (str.charCodeAt(i) === 32 /* CharCode.Space */ || str.charCodeAt(i) === 9 /* CharCode.Tab */)) {
            i++;
        }
        return i;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZVNlcXVlbmNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9kaWZmL2RlZmF1bHRMaW5lc0RpZmZDb21wdXRlci9saW5lU2VxdWVuY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQWEsWUFBWTtRQUN4QixZQUNrQixXQUFxQixFQUNyQixLQUFlO1lBRGYsZ0JBQVcsR0FBWCxXQUFXLENBQVU7WUFDckIsVUFBSyxHQUFMLEtBQUssQ0FBVTtRQUM3QixDQUFDO1FBRUwsVUFBVSxDQUFDLE1BQWM7WUFDeEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFRCxJQUFJLE1BQU07WUFDVCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDO1FBQ2hDLENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxNQUFjO1lBQzlCLE1BQU0saUJBQWlCLEdBQUcsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRixNQUFNLGdCQUFnQixHQUFHLE1BQU0sS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQy9GLE9BQU8sSUFBSSxHQUFHLENBQUMsaUJBQWlCLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsT0FBTyxDQUFDLEtBQWtCO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFFRCxlQUFlLENBQUMsT0FBZSxFQUFFLE9BQWU7WUFDL0MsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEQsQ0FBQztLQUNEO0lBM0JELG9DQTJCQztJQUVELFNBQVMsY0FBYyxDQUFDLEdBQVc7UUFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLDRCQUFtQixJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLHlCQUFpQixDQUFDLEVBQUU7WUFDdEcsQ0FBQyxFQUFFLENBQUM7U0FDSjtRQUNELE9BQU8sQ0FBQyxDQUFDO0lBQ1YsQ0FBQyJ9