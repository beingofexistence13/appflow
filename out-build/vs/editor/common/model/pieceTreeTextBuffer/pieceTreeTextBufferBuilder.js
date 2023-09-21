/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeBase", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer"], function (require, exports, strings, pieceTreeBase_1, pieceTreeTextBuffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tC = void 0;
    class PieceTreeTextBufferFactory {
        constructor(a, b, c, d, e, f, g, h, j) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
        }
        k(defaultEOL) {
            const totalEOLCount = this.c + this.d + this.e;
            const totalCRCount = this.c + this.e;
            if (totalEOLCount === 0) {
                // This is an empty file or a file with precisely one line
                return (defaultEOL === 1 /* DefaultEndOfLine.LF */ ? '\n' : '\r\n');
            }
            if (totalCRCount > totalEOLCount / 2) {
                // More than half of the file contains \r\n ending lines
                return '\r\n';
            }
            // At least one line more ends in \n
            return '\n';
        }
        create(defaultEOL) {
            const eol = this.k(defaultEOL);
            const chunks = this.a;
            if (this.j &&
                ((eol === '\r\n' && (this.c > 0 || this.d > 0))
                    || (eol === '\n' && (this.c > 0 || this.e > 0)))) {
                // Normalize pieces
                for (let i = 0, len = chunks.length; i < len; i++) {
                    const str = chunks[i].buffer.replace(/\r\n|\r|\n/g, eol);
                    const newLineStart = (0, pieceTreeBase_1.$nC)(str);
                    chunks[i] = new pieceTreeBase_1.$qC(str, newLineStart);
                }
            }
            const textBuffer = new pieceTreeTextBuffer_1.$sC(chunks, this.b, eol, this.f, this.g, this.h, this.j);
            return { textBuffer: textBuffer, disposable: textBuffer };
        }
        getFirstLineText(lengthLimit) {
            return this.a[0].buffer.substr(0, lengthLimit).split(/\r\n|\r|\n/)[0];
        }
    }
    class $tC {
        constructor() {
            this.a = [];
            this.b = '';
            this.c = false;
            this.d = 0;
            this.e = [];
            this.f = 0;
            this.g = 0;
            this.h = 0;
            this.j = false;
            this.k = false;
            this.l = true;
        }
        acceptChunk(chunk) {
            if (chunk.length === 0) {
                return;
            }
            if (this.a.length === 0) {
                if (strings.$0e(chunk)) {
                    this.b = strings.$9e;
                    chunk = chunk.substr(1);
                }
            }
            const lastChar = chunk.charCodeAt(chunk.length - 1);
            if (lastChar === 13 /* CharCode.CarriageReturn */ || (lastChar >= 0xD800 && lastChar <= 0xDBFF)) {
                // last character is \r or a high surrogate => keep it back
                this.m(chunk.substr(0, chunk.length - 1), false);
                this.c = true;
                this.d = lastChar;
            }
            else {
                this.m(chunk, false);
                this.c = false;
                this.d = lastChar;
            }
        }
        m(chunk, allowEmptyStrings) {
            if (!allowEmptyStrings && chunk.length === 0) {
                // Nothing to do
                return;
            }
            if (this.c) {
                this.n(String.fromCharCode(this.d) + chunk);
            }
            else {
                this.n(chunk);
            }
        }
        n(chunk) {
            const lineStarts = (0, pieceTreeBase_1.$oC)(this.e, chunk);
            this.a.push(new pieceTreeBase_1.$qC(chunk, lineStarts.lineStarts));
            this.f += lineStarts.cr;
            this.g += lineStarts.lf;
            this.h += lineStarts.crlf;
            if (!lineStarts.isBasicASCII) {
                // this chunk contains non basic ASCII characters
                this.l = false;
                if (!this.j) {
                    this.j = strings.$1e(chunk);
                }
                if (!this.k) {
                    this.k = strings.$4e(chunk);
                }
            }
        }
        finish(normalizeEOL = true) {
            this.o();
            return new PieceTreeTextBufferFactory(this.a, this.b, this.f, this.g, this.h, this.j, this.k, this.l, normalizeEOL);
        }
        o() {
            if (this.a.length === 0) {
                this.m('', true);
            }
            if (this.c) {
                this.c = false;
                // recreate last chunk
                const lastChunk = this.a[this.a.length - 1];
                lastChunk.buffer += String.fromCharCode(this.d);
                const newLineStarts = (0, pieceTreeBase_1.$nC)(lastChunk.buffer);
                lastChunk.lineStarts = newLineStarts;
                if (this.d === 13 /* CharCode.CarriageReturn */) {
                    this.f++;
                }
            }
        }
    }
    exports.$tC = $tC;
});
//# sourceMappingURL=pieceTreeTextBufferBuilder.js.map