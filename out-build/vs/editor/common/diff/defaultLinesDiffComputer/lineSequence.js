/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$QY = void 0;
    class $QY {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        getElement(offset) {
            return this.a[offset];
        }
        get length() {
            return this.a.length;
        }
        getBoundaryScore(length) {
            const indentationBefore = length === 0 ? 0 : getIndentation(this.b[length - 1]);
            const indentationAfter = length === this.b.length ? 0 : getIndentation(this.b[length]);
            return 1000 - (indentationBefore + indentationAfter);
        }
        getText(range) {
            return this.b.slice(range.start, range.endExclusive).join('\n');
        }
        isStronglyEqual(offset1, offset2) {
            return this.b[offset1] === this.b[offset2];
        }
    }
    exports.$QY = $QY;
    function getIndentation(str) {
        let i = 0;
        while (i < str.length && (str.charCodeAt(i) === 32 /* CharCode.Space */ || str.charCodeAt(i) === 9 /* CharCode.Tab */)) {
            i++;
        }
        return i;
    }
});
//# sourceMappingURL=lineSequence.js.map