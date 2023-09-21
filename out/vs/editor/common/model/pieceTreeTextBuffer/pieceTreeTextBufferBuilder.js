/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeBase", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer"], function (require, exports, strings, pieceTreeBase_1, pieceTreeTextBuffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PieceTreeTextBufferBuilder = void 0;
    class PieceTreeTextBufferFactory {
        constructor(_chunks, _bom, _cr, _lf, _crlf, _containsRTL, _containsUnusualLineTerminators, _isBasicASCII, _normalizeEOL) {
            this._chunks = _chunks;
            this._bom = _bom;
            this._cr = _cr;
            this._lf = _lf;
            this._crlf = _crlf;
            this._containsRTL = _containsRTL;
            this._containsUnusualLineTerminators = _containsUnusualLineTerminators;
            this._isBasicASCII = _isBasicASCII;
            this._normalizeEOL = _normalizeEOL;
        }
        _getEOL(defaultEOL) {
            const totalEOLCount = this._cr + this._lf + this._crlf;
            const totalCRCount = this._cr + this._crlf;
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
            const eol = this._getEOL(defaultEOL);
            const chunks = this._chunks;
            if (this._normalizeEOL &&
                ((eol === '\r\n' && (this._cr > 0 || this._lf > 0))
                    || (eol === '\n' && (this._cr > 0 || this._crlf > 0)))) {
                // Normalize pieces
                for (let i = 0, len = chunks.length; i < len; i++) {
                    const str = chunks[i].buffer.replace(/\r\n|\r|\n/g, eol);
                    const newLineStart = (0, pieceTreeBase_1.createLineStartsFast)(str);
                    chunks[i] = new pieceTreeBase_1.StringBuffer(str, newLineStart);
                }
            }
            const textBuffer = new pieceTreeTextBuffer_1.PieceTreeTextBuffer(chunks, this._bom, eol, this._containsRTL, this._containsUnusualLineTerminators, this._isBasicASCII, this._normalizeEOL);
            return { textBuffer: textBuffer, disposable: textBuffer };
        }
        getFirstLineText(lengthLimit) {
            return this._chunks[0].buffer.substr(0, lengthLimit).split(/\r\n|\r|\n/)[0];
        }
    }
    class PieceTreeTextBufferBuilder {
        constructor() {
            this.chunks = [];
            this.BOM = '';
            this._hasPreviousChar = false;
            this._previousChar = 0;
            this._tmpLineStarts = [];
            this.cr = 0;
            this.lf = 0;
            this.crlf = 0;
            this.containsRTL = false;
            this.containsUnusualLineTerminators = false;
            this.isBasicASCII = true;
        }
        acceptChunk(chunk) {
            if (chunk.length === 0) {
                return;
            }
            if (this.chunks.length === 0) {
                if (strings.startsWithUTF8BOM(chunk)) {
                    this.BOM = strings.UTF8_BOM_CHARACTER;
                    chunk = chunk.substr(1);
                }
            }
            const lastChar = chunk.charCodeAt(chunk.length - 1);
            if (lastChar === 13 /* CharCode.CarriageReturn */ || (lastChar >= 0xD800 && lastChar <= 0xDBFF)) {
                // last character is \r or a high surrogate => keep it back
                this._acceptChunk1(chunk.substr(0, chunk.length - 1), false);
                this._hasPreviousChar = true;
                this._previousChar = lastChar;
            }
            else {
                this._acceptChunk1(chunk, false);
                this._hasPreviousChar = false;
                this._previousChar = lastChar;
            }
        }
        _acceptChunk1(chunk, allowEmptyStrings) {
            if (!allowEmptyStrings && chunk.length === 0) {
                // Nothing to do
                return;
            }
            if (this._hasPreviousChar) {
                this._acceptChunk2(String.fromCharCode(this._previousChar) + chunk);
            }
            else {
                this._acceptChunk2(chunk);
            }
        }
        _acceptChunk2(chunk) {
            const lineStarts = (0, pieceTreeBase_1.createLineStarts)(this._tmpLineStarts, chunk);
            this.chunks.push(new pieceTreeBase_1.StringBuffer(chunk, lineStarts.lineStarts));
            this.cr += lineStarts.cr;
            this.lf += lineStarts.lf;
            this.crlf += lineStarts.crlf;
            if (!lineStarts.isBasicASCII) {
                // this chunk contains non basic ASCII characters
                this.isBasicASCII = false;
                if (!this.containsRTL) {
                    this.containsRTL = strings.containsRTL(chunk);
                }
                if (!this.containsUnusualLineTerminators) {
                    this.containsUnusualLineTerminators = strings.containsUnusualLineTerminators(chunk);
                }
            }
        }
        finish(normalizeEOL = true) {
            this._finish();
            return new PieceTreeTextBufferFactory(this.chunks, this.BOM, this.cr, this.lf, this.crlf, this.containsRTL, this.containsUnusualLineTerminators, this.isBasicASCII, normalizeEOL);
        }
        _finish() {
            if (this.chunks.length === 0) {
                this._acceptChunk1('', true);
            }
            if (this._hasPreviousChar) {
                this._hasPreviousChar = false;
                // recreate last chunk
                const lastChunk = this.chunks[this.chunks.length - 1];
                lastChunk.buffer += String.fromCharCode(this._previousChar);
                const newLineStarts = (0, pieceTreeBase_1.createLineStartsFast)(lastChunk.buffer);
                lastChunk.lineStarts = newLineStarts;
                if (this._previousChar === 13 /* CharCode.CarriageReturn */) {
                    this.cr++;
                }
            }
        }
    }
    exports.PieceTreeTextBufferBuilder = PieceTreeTextBufferBuilder;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGllY2VUcmVlVGV4dEJ1ZmZlckJ1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL21vZGVsL3BpZWNlVHJlZVRleHRCdWZmZXIvcGllY2VUcmVlVGV4dEJ1ZmZlckJ1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLE1BQU0sMEJBQTBCO1FBRS9CLFlBQ2tCLE9BQXVCLEVBQ3ZCLElBQVksRUFDWixHQUFXLEVBQ1gsR0FBVyxFQUNYLEtBQWEsRUFDYixZQUFxQixFQUNyQiwrQkFBd0MsRUFDeEMsYUFBc0IsRUFDdEIsYUFBc0I7WUFSdEIsWUFBTyxHQUFQLE9BQU8sQ0FBZ0I7WUFDdkIsU0FBSSxHQUFKLElBQUksQ0FBUTtZQUNaLFFBQUcsR0FBSCxHQUFHLENBQVE7WUFDWCxRQUFHLEdBQUgsR0FBRyxDQUFRO1lBQ1gsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUNiLGlCQUFZLEdBQVosWUFBWSxDQUFTO1lBQ3JCLG9DQUErQixHQUEvQiwrQkFBK0IsQ0FBUztZQUN4QyxrQkFBYSxHQUFiLGFBQWEsQ0FBUztZQUN0QixrQkFBYSxHQUFiLGFBQWEsQ0FBUztRQUNwQyxDQUFDO1FBRUcsT0FBTyxDQUFDLFVBQTRCO1lBQzNDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ3ZELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUMzQyxJQUFJLGFBQWEsS0FBSyxDQUFDLEVBQUU7Z0JBQ3hCLDBEQUEwRDtnQkFDMUQsT0FBTyxDQUFDLFVBQVUsZ0NBQXdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDNUQ7WUFDRCxJ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