/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/editor/common/core/stringBuilder"], function (require, exports, buffer, stringBuilder_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Gs = exports.$Fs = void 0;
    function escapeNewLine(str) {
        return (str
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r'));
    }
    class $Fs {
        get oldLength() {
            return this.oldText.length;
        }
        get oldEnd() {
            return this.oldPosition + this.oldText.length;
        }
        get newLength() {
            return this.newText.length;
        }
        get newEnd() {
            return this.newPosition + this.newText.length;
        }
        constructor(oldPosition, oldText, newPosition, newText) {
            this.oldPosition = oldPosition;
            this.oldText = oldText;
            this.newPosition = newPosition;
            this.newText = newText;
        }
        toString() {
            if (this.oldText.length === 0) {
                return `(insert@${this.oldPosition} "${escapeNewLine(this.newText)}")`;
            }
            if (this.newText.length === 0) {
                return `(delete@${this.oldPosition} "${escapeNewLine(this.oldText)}")`;
            }
            return `(replace@${this.oldPosition} "${escapeNewLine(this.oldText)}" with "${escapeNewLine(this.newText)}")`;
        }
        static a(str) {
            return (4 + 2 * str.length);
        }
        static c(b, str, offset) {
            const len = str.length;
            buffer.$Kd(b, len, offset);
            offset += 4;
            for (let i = 0; i < len; i++) {
                buffer.$Id(b, str.charCodeAt(i), offset);
                offset += 2;
            }
            return offset;
        }
        static d(b, offset) {
            const len = buffer.$Jd(b, offset);
            offset += 4;
            return (0, stringBuilder_1.$Ds)(b, offset, len);
        }
        writeSize() {
            return (+4 // oldPosition
                + 4 // newPosition
                + $Fs.a(this.oldText)
                + $Fs.a(this.newText));
        }
        write(b, offset) {
            buffer.$Kd(b, this.oldPosition, offset);
            offset += 4;
            buffer.$Kd(b, this.newPosition, offset);
            offset += 4;
            offset = $Fs.c(b, this.oldText, offset);
            offset = $Fs.c(b, this.newText, offset);
            return offset;
        }
        static read(b, offset, dest) {
            const oldPosition = buffer.$Jd(b, offset);
            offset += 4;
            const newPosition = buffer.$Jd(b, offset);
            offset += 4;
            const oldText = $Fs.d(b, offset);
            offset += $Fs.a(oldText);
            const newText = $Fs.d(b, offset);
            offset += $Fs.a(newText);
            dest.push(new $Fs(oldPosition, oldText, newPosition, newText));
            return offset;
        }
    }
    exports.$Fs = $Fs;
    function $Gs(prevEdits, currEdits) {
        if (prevEdits === null || prevEdits.length === 0) {
            return currEdits;
        }
        const compressor = new TextChangeCompressor(prevEdits, currEdits);
        return compressor.compress();
    }
    exports.$Gs = $Gs;
    class TextChangeCompressor {
        constructor(prevEdits, currEdits) {
            this.a = prevEdits;
            this.c = currEdits;
            this.d = [];
            this.e = 0;
            this.f = this.a.length;
            this.g = 0;
            this.h = this.c.length;
            this.j = 0;
        }
        compress() {
            let prevIndex = 0;
            let currIndex = 0;
            let prevEdit = this.n(prevIndex);
            let currEdit = this.l(currIndex);
            while (prevIndex < this.f || currIndex < this.h) {
                if (prevEdit === null) {
                    this.k(currEdit);
                    currEdit = this.l(++currIndex);
                    continue;
                }
                if (currEdit === null) {
                    this.m(prevEdit);
                    prevEdit = this.n(++prevIndex);
                    continue;
                }
                if (currEdit.oldEnd <= prevEdit.newPosition) {
                    this.k(currEdit);
                    currEdit = this.l(++currIndex);
                    continue;
                }
                if (prevEdit.newEnd <= currEdit.oldPosition) {
                    this.m(prevEdit);
                    prevEdit = this.n(++prevIndex);
                    continue;
                }
                if (currEdit.oldPosition < prevEdit.newPosition) {
                    const [e1, e2] = TextChangeCompressor.r(currEdit, prevEdit.newPosition - currEdit.oldPosition);
                    this.k(e1);
                    currEdit = e2;
                    continue;
                }
                if (prevEdit.newPosition < currEdit.oldPosition) {
                    const [e1, e2] = TextChangeCompressor.q(prevEdit, currEdit.oldPosition - prevEdit.newPosition);
                    this.m(e1);
                    prevEdit = e2;
                    continue;
                }
                // At this point, currEdit.oldPosition === prevEdit.newPosition
                let mergePrev;
                let mergeCurr;
                if (currEdit.oldEnd === prevEdit.newEnd) {
                    mergePrev = prevEdit;
                    mergeCurr = currEdit;
                    prevEdit = this.n(++prevIndex);
                    currEdit = this.l(++currIndex);
                }
                else if (currEdit.oldEnd < prevEdit.newEnd) {
                    const [e1, e2] = TextChangeCompressor.q(prevEdit, currEdit.oldLength);
                    mergePrev = e1;
                    mergeCurr = currEdit;
                    prevEdit = e2;
                    currEdit = this.l(++currIndex);
                }
                else {
                    const [e1, e2] = TextChangeCompressor.r(currEdit, prevEdit.newLength);
                    mergePrev = prevEdit;
                    mergeCurr = e1;
                    prevEdit = this.n(++prevIndex);
                    currEdit = e2;
                }
                this.d[this.e++] = new $Fs(mergePrev.oldPosition, mergePrev.oldText, mergeCurr.newPosition, mergeCurr.newText);
                this.g += mergePrev.newLength - mergePrev.oldLength;
                this.j += mergeCurr.newLength - mergeCurr.oldLength;
            }
            const merged = TextChangeCompressor.s(this.d);
            const cleaned = TextChangeCompressor.t(merged);
            return cleaned;
        }
        k(currEdit) {
            this.d[this.e++] = TextChangeCompressor.o(this.g, currEdit);
            this.j += currEdit.newLength - currEdit.oldLength;
        }
        l(currIndex) {
            return (currIndex < this.h ? this.c[currIndex] : null);
        }
        m(prevEdit) {
            this.d[this.e++] = TextChangeCompressor.p(this.j, prevEdit);
            this.g += prevEdit.newLength - prevEdit.oldLength;
        }
        n(prevIndex) {
            return (prevIndex < this.f ? this.a[prevIndex] : null);
        }
        static o(prevDeltaOffset, currEdit) {
            return new $Fs(currEdit.oldPosition - prevDeltaOffset, currEdit.oldText, currEdit.newPosition, currEdit.newText);
        }
        static p(currDeltaOffset, prevEdit) {
            return new $Fs(prevEdit.oldPosition, prevEdit.oldText, prevEdit.newPosition + currDeltaOffset, prevEdit.newText);
        }
        static q(edit, offset) {
            const preText = edit.newText.substr(0, offset);
            const postText = edit.newText.substr(offset);
            return [
                new $Fs(edit.oldPosition, edit.oldText, edit.newPosition, preText),
                new $Fs(edit.oldEnd, '', edit.newPosition + offset, postText)
            ];
        }
        static r(edit, offset) {
            const preText = edit.oldText.substr(0, offset);
            const postText = edit.oldText.substr(offset);
            return [
                new $Fs(edit.oldPosition, preText, edit.newPosition, edit.newText),
                new $Fs(edit.oldPosition + offset, postText, edit.newEnd, '')
            ];
        }
        static s(edits) {
            if (edits.length === 0) {
                return edits;
            }
            const result = [];
            let resultLen = 0;
            let prev = edits[0];
            for (let i = 1; i < edits.length; i++) {
                const curr = edits[i];
                if (prev.oldEnd === curr.oldPosition) {
                    // Merge into `prev`
                    prev = new $Fs(prev.oldPosition, prev.oldText + curr.oldText, prev.newPosition, prev.newText + curr.newText);
                }
                else {
                    result[resultLen++] = prev;
                    prev = curr;
                }
            }
            result[resultLen++] = prev;
            return result;
        }
        static t(edits) {
            if (edits.length === 0) {
                return edits;
            }
            const result = [];
            let resultLen = 0;
            for (let i = 0; i < edits.length; i++) {
                const edit = edits[i];
                if (edit.oldText === edit.newText) {
                    continue;
                }
                result[resultLen++] = edit;
            }
            return result;
        }
    }
});
//# sourceMappingURL=textChange.js.map