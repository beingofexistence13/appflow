/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model", "vs/editor/common/model/pieceTreeTextBuffer/rbTreeBase", "vs/editor/common/model/textModelSearch"], function (require, exports, position_1, range_1, model_1, rbTreeBase_1, textModelSearch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rC = exports.$qC = exports.$pC = exports.$oC = exports.$nC = void 0;
    // const lfRegex = new RegExp(/\r\n|\r|\n/g);
    const AverageBufferSize = 65535;
    function createUintArray(arr) {
        let r;
        if (arr[arr.length - 1] < 65536) {
            r = new Uint16Array(arr.length);
        }
        else {
            r = new Uint32Array(arr.length);
        }
        r.set(arr, 0);
        return r;
    }
    class LineStarts {
        constructor(lineStarts, cr, lf, crlf, isBasicASCII) {
            this.lineStarts = lineStarts;
            this.cr = cr;
            this.lf = lf;
            this.crlf = crlf;
            this.isBasicASCII = isBasicASCII;
        }
    }
    function $nC(str, readonly = true) {
        const r = [0];
        let rLength = 1;
        for (let i = 0, len = str.length; i < len; i++) {
            const chr = str.charCodeAt(i);
            if (chr === 13 /* CharCode.CarriageReturn */) {
                if (i + 1 < len && str.charCodeAt(i + 1) === 10 /* CharCode.LineFeed */) {
                    // \r\n... case
                    r[rLength++] = i + 2;
                    i++; // skip \n
                }
                else {
                    // \r... case
                    r[rLength++] = i + 1;
                }
            }
            else if (chr === 10 /* CharCode.LineFeed */) {
                r[rLength++] = i + 1;
            }
        }
        if (readonly) {
            return createUintArray(r);
        }
        else {
            return r;
        }
    }
    exports.$nC = $nC;
    function $oC(r, str) {
        r.length = 0;
        r[0] = 0;
        let rLength = 1;
        let cr = 0, lf = 0, crlf = 0;
        let isBasicASCII = true;
        for (let i = 0, len = str.length; i < len; i++) {
            const chr = str.charCodeAt(i);
            if (chr === 13 /* CharCode.CarriageReturn */) {
                if (i + 1 < len && str.charCodeAt(i + 1) === 10 /* CharCode.LineFeed */) {
                    // \r\n... case
                    crlf++;
                    r[rLength++] = i + 2;
                    i++; // skip \n
                }
                else {
                    cr++;
                    // \r... case
                    r[rLength++] = i + 1;
                }
            }
            else if (chr === 10 /* CharCode.LineFeed */) {
                lf++;
                r[rLength++] = i + 1;
            }
            else {
                if (isBasicASCII) {
                    if (chr !== 9 /* CharCode.Tab */ && (chr < 32 || chr > 126)) {
                        isBasicASCII = false;
                    }
                }
            }
        }
        const result = new LineStarts(createUintArray(r), cr, lf, crlf, isBasicASCII);
        r.length = 0;
        return result;
    }
    exports.$oC = $oC;
    class $pC {
        constructor(bufferIndex, start, end, lineFeedCnt, length) {
            this.bufferIndex = bufferIndex;
            this.start = start;
            this.end = end;
            this.lineFeedCnt = lineFeedCnt;
            this.length = length;
        }
    }
    exports.$pC = $pC;
    class $qC {
        constructor(buffer, lineStarts) {
            this.buffer = buffer;
            this.lineStarts = lineStarts;
        }
    }
    exports.$qC = $qC;
    /**
     * Readonly snapshot for piece tree.
     * In a real multiple thread environment, to make snapshot reading always work correctly, we need to
     * 1. Make TreeNode.piece immutable, then reading and writing can run in parallel.
     * 2. TreeNode/Buffers normalization should not happen during snapshot reading.
     */
    class PieceTreeSnapshot {
        constructor(tree, BOM) {
            this.a = [];
            this.c = tree;
            this.d = BOM;
            this.b = 0;
            if (tree.root !== rbTreeBase_1.$$B) {
                tree.iterate(tree.root, node => {
                    if (node !== rbTreeBase_1.$$B) {
                        this.a.push(node.piece);
                    }
                    return true;
                });
            }
        }
        read() {
            if (this.a.length === 0) {
                if (this.b === 0) {
                    this.b++;
                    return this.d;
                }
                else {
                    return null;
                }
            }
            if (this.b > this.a.length - 1) {
                return null;
            }
            if (this.b === 0) {
                return this.d + this.c.getPieceContent(this.a[this.b++]);
            }
            return this.c.getPieceContent(this.a[this.b++]);
        }
    }
    class PieceTreeSearchCache {
        constructor(limit) {
            this.a = limit;
            this.b = [];
        }
        get(offset) {
            for (let i = this.b.length - 1; i >= 0; i--) {
                const nodePos = this.b[i];
                if (nodePos.nodeStartOffset <= offset && nodePos.nodeStartOffset + nodePos.node.piece.length >= offset) {
                    return nodePos;
                }
            }
            return null;
        }
        get2(lineNumber) {
            for (let i = this.b.length - 1; i >= 0; i--) {
                const nodePos = this.b[i];
                if (nodePos.nodeStartLineNumber && nodePos.nodeStartLineNumber < lineNumber && nodePos.nodeStartLineNumber + nodePos.node.piece.lineFeedCnt >= lineNumber) {
                    return nodePos;
                }
            }
            return null;
        }
        set(nodePosition) {
            if (this.b.length >= this.a) {
                this.b.shift();
            }
            this.b.push(nodePosition);
        }
        validate(offset) {
            let hasInvalidVal = false;
            const tmp = this.b;
            for (let i = 0; i < tmp.length; i++) {
                const nodePos = tmp[i];
                if (nodePos.node.parent === null || nodePos.nodeStartOffset >= offset) {
                    tmp[i] = null;
                    hasInvalidVal = true;
                    continue;
                }
            }
            if (hasInvalidVal) {
                const newArr = [];
                for (const entry of tmp) {
                    if (entry !== null) {
                        newArr.push(entry);
                    }
                }
                this.b = newArr;
            }
        }
    }
    class $rC {
        constructor(chunks, eol, eolNormalized) {
            this.create(chunks, eol, eolNormalized);
        }
        create(chunks, eol, eolNormalized) {
            this.a = [
                new $qC('', [0])
            ];
            this.g = { line: 0, column: 0 };
            this.root = rbTreeBase_1.$$B;
            this.b = 1;
            this.c = 0;
            this.d = eol;
            this.e = eol.length;
            this.f = eolNormalized;
            let lastNode = null;
            for (let i = 0, len = chunks.length; i < len; i++) {
                if (chunks[i].buffer.length > 0) {
                    if (!chunks[i].lineStarts) {
                        chunks[i].lineStarts = $nC(chunks[i].buffer);
                    }
                    const piece = new $pC(i + 1, { line: 0, column: 0 }, { line: chunks[i].lineStarts.length - 1, column: chunks[i].buffer.length - chunks[i].lineStarts[chunks[i].lineStarts.length - 1] }, chunks[i].lineStarts.length - 1, chunks[i].buffer.length);
                    this.a.push(chunks[i]);
                    lastNode = this.S(lastNode, piece);
                }
            }
            this.h = new PieceTreeSearchCache(1);
            this.j = { lineNumber: 0, value: '' };
            this.y();
        }
        normalizeEOL(eol) {
            const averageBufferSize = AverageBufferSize;
            const min = averageBufferSize - Math.floor(averageBufferSize / 3);
            const max = min * 2;
            let tempChunk = '';
            let tempChunkLen = 0;
            const chunks = [];
            this.iterate(this.root, node => {
                const str = this.R(node);
                const len = str.length;
                if (tempChunkLen <= min || tempChunkLen + len < max) {
                    tempChunk += str;
                    tempChunkLen += len;
                    return true;
                }
                // flush anyways
                const text = tempChunk.replace(/\r\n|\r|\n/g, eol);
                chunks.push(new $qC(text, $nC(text)));
                tempChunk = str;
                tempChunkLen = len;
                return true;
            });
            if (tempChunkLen > 0) {
                const text = tempChunk.replace(/\r\n|\r|\n/g, eol);
                chunks.push(new $qC(text, $nC(text)));
            }
            this.create(chunks, eol, true);
        }
        // #region Buffer API
        getEOL() {
            return this.d;
        }
        setEOL(newEOL) {
            this.d = newEOL;
            this.e = this.d.length;
            this.normalizeEOL(newEOL);
        }
        createSnapshot(BOM) {
            return new PieceTreeSnapshot(this, BOM);
        }
        equal(other) {
            if (this.getLength() !== other.getLength()) {
                return false;
            }
            if (this.getLineCount() !== other.getLineCount()) {
                return false;
            }
            let offset = 0;
            const ret = this.iterate(this.root, node => {
                if (node === rbTreeBase_1.$$B) {
                    return true;
                }
                const str = this.R(node);
                const len = str.length;
                const startPosition = other.G(offset);
                const endPosition = other.G(offset + len);
                const val = other.getValueInRange2(startPosition, endPosition);
                offset += len;
                return str === val;
            });
            return ret;
        }
        getOffsetAt(lineNumber, column) {
            let leftLen = 0; // inorder
            let x = this.root;
            while (x !== rbTreeBase_1.$$B) {
                if (x.left !== rbTreeBase_1.$$B && x.lf_left + 1 >= lineNumber) {
                    x = x.left;
                }
                else if (x.lf_left + x.piece.lineFeedCnt + 1 >= lineNumber) {
                    leftLen += x.size_left;
                    // lineNumber >= 2
                    const accumualtedValInCurrentIndex = this.B(x, lineNumber - x.lf_left - 2);
                    return leftLen += accumualtedValInCurrentIndex + column - 1;
                }
                else {
                    lineNumber -= x.lf_left + x.piece.lineFeedCnt;
                    leftLen += x.size_left + x.piece.length;
                    x = x.right;
                }
            }
            return leftLen;
        }
        getPositionAt(offset) {
            offset = Math.floor(offset);
            offset = Math.max(0, offset);
            let x = this.root;
            let lfCnt = 0;
            const originalOffset = offset;
            while (x !== rbTreeBase_1.$$B) {
                if (x.size_left !== 0 && x.size_left >= offset) {
                    x = x.left;
                }
                else if (x.size_left + x.piece.length >= offset) {
                    const out = this.A(x, offset - x.size_left);
                    lfCnt += x.lf_left + out.index;
                    if (out.index === 0) {
                        const lineStartOffset = this.getOffsetAt(lfCnt + 1, 1);
                        const column = originalOffset - lineStartOffset;
                        return new position_1.$js(lfCnt + 1, column + 1);
                    }
                    return new position_1.$js(lfCnt + 1, out.remainder + 1);
                }
                else {
                    offset -= x.size_left + x.piece.length;
                    lfCnt += x.lf_left + x.piece.lineFeedCnt;
                    if (x.right === rbTreeBase_1.$$B) {
                        // last node
                        const lineStartOffset = this.getOffsetAt(lfCnt + 1, 1);
                        const column = originalOffset - offset - lineStartOffset;
                        return new position_1.$js(lfCnt + 1, column + 1);
                    }
                    else {
                        x = x.right;
                    }
                }
            }
            return new position_1.$js(1, 1);
        }
        getValueInRange(range, eol) {
            if (range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn) {
                return '';
            }
            const startPosition = this.H(range.startLineNumber, range.startColumn);
            const endPosition = this.H(range.endLineNumber, range.endColumn);
            const value = this.getValueInRange2(startPosition, endPosition);
            if (eol) {
                if (eol !== this.d || !this.f) {
                    return value.replace(/\r\n|\r|\n/g, eol);
                }
                if (eol === this.getEOL() && this.f) {
                    if (eol === '\r\n') {
                    }
                    return value;
                }
                return value.replace(/\r\n|\r|\n/g, eol);
            }
            return value;
        }
        getValueInRange2(startPosition, endPosition) {
            if (startPosition.node === endPosition.node) {
                const node = startPosition.node;
                const buffer = this.a[node.piece.bufferIndex].buffer;
                const startOffset = this.u(node.piece.bufferIndex, node.piece.start);
                return buffer.substring(startOffset + startPosition.remainder, startOffset + endPosition.remainder);
            }
            let x = startPosition.node;
            const buffer = this.a[x.piece.bufferIndex].buffer;
            const startOffset = this.u(x.piece.bufferIndex, x.piece.start);
            let ret = buffer.substring(startOffset + startPosition.remainder, startOffset + x.piece.length);
            x = x.next();
            while (x !== rbTreeBase_1.$$B) {
                const buffer = this.a[x.piece.bufferIndex].buffer;
                const startOffset = this.u(x.piece.bufferIndex, x.piece.start);
                if (x === endPosition.node) {
                    ret += buffer.substring(startOffset, startOffset + endPosition.remainder);
                    break;
                }
                else {
                    ret += buffer.substr(startOffset, x.piece.length);
                }
                x = x.next();
            }
            return ret;
        }
        getLinesContent() {
            const lines = [];
            let linesLength = 0;
            let currentLine = '';
            let danglingCR = false;
            this.iterate(this.root, node => {
                if (node === rbTreeBase_1.$$B) {
                    return true;
                }
                const piece = node.piece;
                let pieceLength = piece.length;
                if (pieceLength === 0) {
                    return true;
                }
                const buffer = this.a[piece.bufferIndex].buffer;
                const lineStarts = this.a[piece.bufferIndex].lineStarts;
                const pieceStartLine = piece.start.line;
                const pieceEndLine = piece.end.line;
                let pieceStartOffset = lineStarts[pieceStartLine] + piece.start.column;
                if (danglingCR) {
                    if (buffer.charCodeAt(pieceStartOffset) === 10 /* CharCode.LineFeed */) {
                        // pretend the \n was in the previous piece..
                        pieceStartOffset++;
                        pieceLength--;
                    }
                    lines[linesLength++] = currentLine;
                    currentLine = '';
                    danglingCR = false;
                    if (pieceLength === 0) {
                        return true;
                    }
                }
                if (pieceStartLine === pieceEndLine) {
                    // this piece has no new lines
                    if (!this.f && buffer.charCodeAt(pieceStartOffset + pieceLength - 1) === 13 /* CharCode.CarriageReturn */) {
                        danglingCR = true;
                        currentLine += buffer.substr(pieceStartOffset, pieceLength - 1);
                    }
                    else {
                        currentLine += buffer.substr(pieceStartOffset, pieceLength);
                    }
                    return true;
                }
                // add the text before the first line start in this piece
                currentLine += (this.f
                    ? buffer.substring(pieceStartOffset, Math.max(pieceStartOffset, lineStarts[pieceStartLine + 1] - this.e))
                    : buffer.substring(pieceStartOffset, lineStarts[pieceStartLine + 1]).replace(/(\r\n|\r|\n)$/, ''));
                lines[linesLength++] = currentLine;
                for (let line = pieceStartLine + 1; line < pieceEndLine; line++) {
                    currentLine = (this.f
                        ? buffer.substring(lineStarts[line], lineStarts[line + 1] - this.e)
                        : buffer.substring(lineStarts[line], lineStarts[line + 1]).replace(/(\r\n|\r|\n)$/, ''));
                    lines[linesLength++] = currentLine;
                }
                if (!this.f && buffer.charCodeAt(lineStarts[pieceEndLine] + piece.end.column - 1) === 13 /* CharCode.CarriageReturn */) {
                    danglingCR = true;
                    if (piece.end.column === 0) {
                        // The last line ended with a \r, let's undo the push, it will be pushed by next iteration
                        linesLength--;
                    }
                    else {
                        currentLine = buffer.substr(lineStarts[pieceEndLine], piece.end.column - 1);
                    }
                }
                else {
                    currentLine = buffer.substr(lineStarts[pieceEndLine], piece.end.column);
                }
                return true;
            });
            if (danglingCR) {
                lines[linesLength++] = currentLine;
                currentLine = '';
            }
            lines[linesLength++] = currentLine;
            return lines;
        }
        getLength() {
            return this.c;
        }
        getLineCount() {
            return this.b;
        }
        getLineContent(lineNumber) {
            if (this.j.lineNumber === lineNumber) {
                return this.j.value;
            }
            this.j.lineNumber = lineNumber;
            if (lineNumber === this.b) {
                this.j.value = this.getLineRawContent(lineNumber);
            }
            else if (this.f) {
                this.j.value = this.getLineRawContent(lineNumber, this.e);
            }
            else {
                this.j.value = this.getLineRawContent(lineNumber).replace(/(\r\n|\r|\n)$/, '');
            }
            return this.j.value;
        }
        l(nodePos) {
            if (nodePos.remainder === nodePos.node.piece.length) {
                // the char we want to fetch is at the head of next node.
                const matchingNode = nodePos.node.next();
                if (!matchingNode) {
                    return 0;
                }
                const buffer = this.a[matchingNode.piece.bufferIndex];
                const startOffset = this.u(matchingNode.piece.bufferIndex, matchingNode.piece.start);
                return buffer.buffer.charCodeAt(startOffset);
            }
            else {
                const buffer = this.a[nodePos.node.piece.bufferIndex];
                const startOffset = this.u(nodePos.node.piece.bufferIndex, nodePos.node.piece.start);
                const targetOffset = startOffset + nodePos.remainder;
                return buffer.buffer.charCodeAt(targetOffset);
            }
        }
        getLineCharCode(lineNumber, index) {
            const nodePos = this.H(lineNumber, index + 1);
            return this.l(nodePos);
        }
        getLineLength(lineNumber) {
            if (lineNumber === this.getLineCount()) {
                const startOffset = this.getOffsetAt(lineNumber, 1);
                return this.getLength() - startOffset;
            }
            return this.getOffsetAt(lineNumber + 1, 1) - this.getOffsetAt(lineNumber, 1) - this.e;
        }
        getCharCode(offset) {
            const nodePos = this.G(offset);
            return this.l(nodePos);
        }
        findMatchesInNode(node, searcher, startLineNumber, startColumn, startCursor, endCursor, searchData, captureMatches, limitResultCount, resultLen, result) {
            const buffer = this.a[node.piece.bufferIndex];
            const startOffsetInBuffer = this.u(node.piece.bufferIndex, node.piece.start);
            const start = this.u(node.piece.bufferIndex, startCursor);
            const end = this.u(node.piece.bufferIndex, endCursor);
            let m;
            // Reset regex to search from the beginning
            const ret = { line: 0, column: 0 };
            let searchText;
            let offsetInBuffer;
            if (searcher._wordSeparators) {
                searchText = buffer.buffer.substring(start, end);
                offsetInBuffer = (offset) => offset + start;
                searcher.reset(0);
            }
            else {
                searchText = buffer.buffer;
                offsetInBuffer = (offset) => offset;
                searcher.reset(start);
            }
            do {
                m = searcher.next(searchText);
                if (m) {
                    if (offsetInBuffer(m.index) >= end) {
                        return resultLen;
                    }
                    this.s(node, offsetInBuffer(m.index) - startOffsetInBuffer, ret);
                    const lineFeedCnt = this.t(node.piece.bufferIndex, startCursor, ret);
                    const retStartColumn = ret.line === startCursor.line ? ret.column - startCursor.column + startColumn : ret.column + 1;
                    const retEndColumn = retStartColumn + m[0].length;
                    result[resultLen++] = (0, textModelSearch_1.$jC)(new range_1.$ks(startLineNumber + lineFeedCnt, retStartColumn, startLineNumber + lineFeedCnt, retEndColumn), m, captureMatches);
                    if (offsetInBuffer(m.index) + m[0].length >= end) {
                        return resultLen;
                    }
                    if (resultLen >= limitResultCount) {
                        return resultLen;
                    }
                }
            } while (m);
            return resultLen;
        }
        findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount) {
            const result = [];
            let resultLen = 0;
            const searcher = new textModelSearch_1.$mC(searchData.wordSeparators, searchData.regex);
            let startPosition = this.H(searchRange.startLineNumber, searchRange.startColumn);
            if (startPosition === null) {
                return [];
            }
            const endPosition = this.H(searchRange.endLineNumber, searchRange.endColumn);
            if (endPosition === null) {
                return [];
            }
            let start = this.s(startPosition.node, startPosition.remainder);
            const end = this.s(endPosition.node, endPosition.remainder);
            if (startPosition.node === endPosition.node) {
                this.findMatchesInNode(startPosition.node, searcher, searchRange.startLineNumber, searchRange.startColumn, start, end, searchData, captureMatches, limitResultCount, resultLen, result);
                return result;
            }
            let startLineNumber = searchRange.startLineNumber;
            let currentNode = startPosition.node;
            while (currentNode !== endPosition.node) {
                const lineBreakCnt = this.t(currentNode.piece.bufferIndex, start, currentNode.piece.end);
                if (lineBreakCnt >= 1) {
                    // last line break position
                    const lineStarts = this.a[currentNode.piece.bufferIndex].lineStarts;
                    const startOffsetInBuffer = this.u(currentNode.piece.bufferIndex, currentNode.piece.start);
                    const nextLineStartOffset = lineStarts[start.line + lineBreakCnt];
                    const startColumn = startLineNumber === searchRange.startLineNumber ? searchRange.startColumn : 1;
                    resultLen = this.findMatchesInNode(currentNode, searcher, startLineNumber, startColumn, start, this.s(currentNode, nextLineStartOffset - startOffsetInBuffer), searchData, captureMatches, limitResultCount, resultLen, result);
                    if (resultLen >= limitResultCount) {
                        return result;
                    }
                    startLineNumber += lineBreakCnt;
                }
                const startColumn = startLineNumber === searchRange.startLineNumber ? searchRange.startColumn - 1 : 0;
                // search for the remaining content
                if (startLineNumber === searchRange.endLineNumber) {
                    const text = this.getLineContent(startLineNumber).substring(startColumn, searchRange.endColumn - 1);
                    resultLen = this.n(searchData, searcher, text, searchRange.endLineNumber, startColumn, resultLen, result, captureMatches, limitResultCount);
                    return result;
                }
                resultLen = this.n(searchData, searcher, this.getLineContent(startLineNumber).substr(startColumn), startLineNumber, startColumn, resultLen, result, captureMatches, limitResultCount);
                if (resultLen >= limitResultCount) {
                    return result;
                }
                startLineNumber++;
                startPosition = this.H(startLineNumber, 1);
                currentNode = startPosition.node;
                start = this.s(startPosition.node, startPosition.remainder);
            }
            if (startLineNumber === searchRange.endLineNumber) {
                const startColumn = startLineNumber === searchRange.startLineNumber ? searchRange.startColumn - 1 : 0;
                const text = this.getLineContent(startLineNumber).substring(startColumn, searchRange.endColumn - 1);
                resultLen = this.n(searchData, searcher, text, searchRange.endLineNumber, startColumn, resultLen, result, captureMatches, limitResultCount);
                return result;
            }
            const startColumn = startLineNumber === searchRange.startLineNumber ? searchRange.startColumn : 1;
            resultLen = this.findMatchesInNode(endPosition.node, searcher, startLineNumber, startColumn, start, end, searchData, captureMatches, limitResultCount, resultLen, result);
            return result;
        }
        n(searchData, searcher, text, lineNumber, deltaOffset, resultLen, result, captureMatches, limitResultCount) {
            const wordSeparators = searchData.wordSeparators;
            if (!captureMatches && searchData.simpleSearch) {
                const searchString = searchData.simpleSearch;
                const searchStringLen = searchString.length;
                const textLength = text.length;
                let lastMatchIndex = -searchStringLen;
                while ((lastMatchIndex = text.indexOf(searchString, lastMatchIndex + searchStringLen)) !== -1) {
                    if (!wordSeparators || (0, textModelSearch_1.$lC)(wordSeparators, text, textLength, lastMatchIndex, searchStringLen)) {
                        result[resultLen++] = new model_1.$Bu(new range_1.$ks(lineNumber, lastMatchIndex + 1 + deltaOffset, lineNumber, lastMatchIndex + 1 + searchStringLen + deltaOffset), null);
                        if (resultLen >= limitResultCount) {
                            return resultLen;
                        }
                    }
                }
                return resultLen;
            }
            let m;
            // Reset regex to search from the beginning
            searcher.reset(0);
            do {
                m = searcher.next(text);
                if (m) {
                    result[resultLen++] = (0, textModelSearch_1.$jC)(new range_1.$ks(lineNumber, m.index + 1 + deltaOffset, lineNumber, m.index + 1 + m[0].length + deltaOffset), m, captureMatches);
                    if (resultLen >= limitResultCount) {
                        return resultLen;
                    }
                }
            } while (m);
            return resultLen;
        }
        // #endregion
        // #region Piece Table
        insert(offset, value, eolNormalized = false) {
            this.f = this.f && eolNormalized;
            this.j.lineNumber = 0;
            this.j.value = '';
            if (this.root !== rbTreeBase_1.$$B) {
                const { node, remainder, nodeStartOffset } = this.G(offset);
                const piece = node.piece;
                const bufferIndex = piece.bufferIndex;
                const insertPosInBuffer = this.s(node, remainder);
                if (node.piece.bufferIndex === 0 &&
                    piece.end.line === this.g.line &&
                    piece.end.column === this.g.column &&
                    (nodeStartOffset + piece.length === offset) &&
                    value.length < AverageBufferSize) {
                    // changed buffer
                    this.F(node, value);
                    this.y();
                    return;
                }
                if (nodeStartOffset === offset) {
                    this.o(value, node);
                    this.h.validate(offset);
                }
                else if (nodeStartOffset + node.piece.length > offset) {
                    // we are inserting into the middle of a node.
                    const nodesToDel = [];
                    let newRightPiece = new $pC(piece.bufferIndex, insertPosInBuffer, piece.end, this.t(piece.bufferIndex, insertPosInBuffer, piece.end), this.u(bufferIndex, piece.end) - this.u(bufferIndex, insertPosInBuffer));
                    if (this.K() && this.M(value)) {
                        const headOfRight = this.I(node, remainder);
                        if (headOfRight === 10 /** \n */) {
                            const newStart = { line: newRightPiece.start.line + 1, column: 0 };
                            newRightPiece = new $pC(newRightPiece.bufferIndex, newStart, newRightPiece.end, this.t(newRightPiece.bufferIndex, newStart, newRightPiece.end), newRightPiece.length - 1);
                            value += '\n';
                        }
                    }
                    // reuse node for content before insertion point.
                    if (this.K() && this.L(value)) {
                        const tailOfLeft = this.I(node, remainder - 1);
                        if (tailOfLeft === 13 /** \r */) {
                            const previousPos = this.s(node, remainder - 1);
                            this.C(node, previousPos);
                            value = '\r' + value;
                            if (node.piece.length === 0) {
                                nodesToDel.push(node);
                            }
                        }
                        else {
                            this.C(node, insertPosInBuffer);
                        }
                    }
                    else {
                        this.C(node, insertPosInBuffer);
                    }
                    const newPieces = this.w(value);
                    if (newRightPiece.length > 0) {
                        this.S(node, newRightPiece);
                    }
                    let tmpNode = node;
                    for (let k = 0; k < newPieces.length; k++) {
                        tmpNode = this.S(tmpNode, newPieces[k]);
                    }
                    this.v(nodesToDel);
                }
                else {
                    this.q(value, node);
                }
            }
            else {
                // insert new node
                const pieces = this.w(value);
                let node = this.T(null, pieces[0]);
                for (let k = 1; k < pieces.length; k++) {
                    node = this.S(node, pieces[k]);
                }
            }
            // todo, this is too brutal. Total line feed count should be updated the same way as lf_left.
            this.y();
        }
        delete(offset, cnt) {
            this.j.lineNumber = 0;
            this.j.value = '';
            if (cnt <= 0 || this.root === rbTreeBase_1.$$B) {
                return;
            }
            const startPosition = this.G(offset);
            const endPosition = this.G(offset + cnt);
            const startNode = startPosition.node;
            const endNode = endPosition.node;
            if (startNode === endNode) {
                const startSplitPosInBuffer = this.s(startNode, startPosition.remainder);
                const endSplitPosInBuffer = this.s(startNode, endPosition.remainder);
                if (startPosition.nodeStartOffset === offset) {
                    if (cnt === startNode.piece.length) { // delete node
                        const next = startNode.next();
                        (0, rbTreeBase_1.$dC)(this, startNode);
                        this.N(next);
                        this.y();
                        return;
                    }
                    this.D(startNode, endSplitPosInBuffer);
                    this.h.validate(offset);
                    this.N(startNode);
                    this.y();
                    return;
                }
                if (startPosition.nodeStartOffset + startNode.piece.length === offset + cnt) {
                    this.C(startNode, startSplitPosInBuffer);
                    this.O(startNode);
                    this.y();
                    return;
                }
                // delete content in the middle, this node will be splitted to nodes
                this.E(startNode, startSplitPosInBuffer, endSplitPosInBuffer);
                this.y();
                return;
            }
            const nodesToDel = [];
            const startSplitPosInBuffer = this.s(startNode, startPosition.remainder);
            this.C(startNode, startSplitPosInBuffer);
            this.h.validate(offset);
            if (startNode.piece.length === 0) {
                nodesToDel.push(startNode);
            }
            // update last touched node
            const endSplitPosInBuffer = this.s(endNode, endPosition.remainder);
            this.D(endNode, endSplitPosInBuffer);
            if (endNode.piece.length === 0) {
                nodesToDel.push(endNode);
            }
            // delete nodes in between
            const secondNode = startNode.next();
            for (let node = secondNode; node !== rbTreeBase_1.$$B && node !== endNode; node = node.next()) {
                nodesToDel.push(node);
            }
            const prev = startNode.piece.length === 0 ? startNode.prev() : startNode;
            this.v(nodesToDel);
            this.O(prev);
            this.y();
        }
        o(value, node) {
            // we are inserting content to the beginning of node
            const nodesToDel = [];
            if (this.K() && this.M(value) && this.L(node)) {
                // move `\n` to new node.
                const piece = node.piece;
                const newStart = { line: piece.start.line + 1, column: 0 };
                const nPiece = new $pC(piece.bufferIndex, newStart, piece.end, this.t(piece.bufferIndex, newStart, piece.end), piece.length - 1);
                node.piece = nPiece;
                value += '\n';
                (0, rbTreeBase_1.$fC)(this, node, -1, -1);
                if (node.piece.length === 0) {
                    nodesToDel.push(node);
                }
            }
            const newPieces = this.w(value);
            let newNode = this.T(node, newPieces[newPieces.length - 1]);
            for (let k = newPieces.length - 2; k >= 0; k--) {
                newNode = this.T(newNode, newPieces[k]);
            }
            this.N(newNode);
            this.v(nodesToDel);
        }
        q(value, node) {
            // we are inserting to the right of this node.
            if (this.Q(value, node)) {
                // move \n to the new node.
                value += '\n';
            }
            const newPieces = this.w(value);
            const newNode = this.S(node, newPieces[0]);
            let tmpNode = newNode;
            for (let k = 1; k < newPieces.length; k++) {
                tmpNode = this.S(tmpNode, newPieces[k]);
            }
            this.N(newNode);
        }
        s(node, remainder, ret) {
            const piece = node.piece;
            const bufferIndex = node.piece.bufferIndex;
            const lineStarts = this.a[bufferIndex].lineStarts;
            const startOffset = lineStarts[piece.start.line] + piece.start.column;
            const offset = startOffset + remainder;
            // binary search offset between startOffset and endOffset
            let low = piece.start.line;
            let high = piece.end.line;
            let mid = 0;
            let midStop = 0;
            let midStart = 0;
            while (low <= high) {
                mid = low + ((high - low) / 2) | 0;
                midStart = lineStarts[mid];
                if (mid === high) {
                    break;
                }
                midStop = lineStarts[mid + 1];
                if (offset < midStart) {
                    high = mid - 1;
                }
                else if (offset >= midStop) {
                    low = mid + 1;
                }
                else {
                    break;
                }
            }
            if (ret) {
                ret.line = mid;
                ret.column = offset - midStart;
                return null;
            }
            return {
                line: mid,
                column: offset - midStart
            };
        }
        t(bufferIndex, start, end) {
            // we don't need to worry about start: abc\r|\n, or abc|\r, or abc|\n, or abc|\r\n doesn't change the fact that, there is one line break after start.
            // now let's take care of end: abc\r|\n, if end is in between \r and \n, we need to add line feed count by 1
            if (end.column === 0) {
                return end.line - start.line;
            }
            const lineStarts = this.a[bufferIndex].lineStarts;
            if (end.line === lineStarts.length - 1) { // it means, there is no \n after end, otherwise, there will be one more lineStart.
                return end.line - start.line;
            }
            const nextLineStartOffset = lineStarts[end.line + 1];
            const endOffset = lineStarts[end.line] + end.column;
            if (nextLineStartOffset > endOffset + 1) { // there are more than 1 character after end, which means it can't be \n
                return end.line - start.line;
            }
            // endOffset + 1 === nextLineStartOffset
            // character at endOffset is \n, so we check the character before first
            // if character at endOffset is \r, end.column is 0 and we can't get here.
            const previousCharOffset = endOffset - 1; // end.column > 0 so it's okay.
            const buffer = this.a[bufferIndex].buffer;
            if (buffer.charCodeAt(previousCharOffset) === 13) {
                return end.line - start.line + 1;
            }
            else {
                return end.line - start.line;
            }
        }
        u(bufferIndex, cursor) {
            const lineStarts = this.a[bufferIndex].lineStarts;
            return lineStarts[cursor.line] + cursor.column;
        }
        v(nodes) {
            for (let i = 0; i < nodes.length; i++) {
                (0, rbTreeBase_1.$dC)(this, nodes[i]);
            }
        }
        w(text) {
            if (text.length > AverageBufferSize) {
                // the content is large, operations like substring, charCode becomes slow
                // so here we split it into smaller chunks, just like what we did for CR/LF normalization
                const newPieces = [];
                while (text.length > AverageBufferSize) {
                    const lastChar = text.charCodeAt(AverageBufferSize - 1);
                    let splitText;
                    if (lastChar === 13 /* CharCode.CarriageReturn */ || (lastChar >= 0xD800 && lastChar <= 0xDBFF)) {
                        // last character is \r or a high surrogate => keep it back
                        splitText = text.substring(0, AverageBufferSize - 1);
                        text = text.substring(AverageBufferSize - 1);
                    }
                    else {
                        splitText = text.substring(0, AverageBufferSize);
                        text = text.substring(AverageBufferSize);
                    }
                    const lineStarts = $nC(splitText);
                    newPieces.push(new $pC(this.a.length, /* buffer index */ { line: 0, column: 0 }, { line: lineStarts.length - 1, column: splitText.length - lineStarts[lineStarts.length - 1] }, lineStarts.length - 1, splitText.length));
                    this.a.push(new $qC(splitText, lineStarts));
                }
                const lineStarts = $nC(text);
                newPieces.push(new $pC(this.a.length, /* buffer index */ { line: 0, column: 0 }, { line: lineStarts.length - 1, column: text.length - lineStarts[lineStarts.length - 1] }, lineStarts.length - 1, text.length));
                this.a.push(new $qC(text, lineStarts));
                return newPieces;
            }
            let startOffset = this.a[0].buffer.length;
            const lineStarts = $nC(text, false);
            let start = this.g;
            if (this.a[0].lineStarts[this.a[0].lineStarts.length - 1] === startOffset
                && startOffset !== 0
                && this.L(text)
                && this.M(this.a[0].buffer) // todo, we can check this._lastChangeBufferPos's column as it's the last one
            ) {
                this.g = { line: this.g.line, column: this.g.column + 1 };
                start = this.g;
                for (let i = 0; i < lineStarts.length; i++) {
                    lineStarts[i] += startOffset + 1;
                }
                this.a[0].lineStarts = this.a[0].lineStarts.concat(lineStarts.slice(1));
                this.a[0].buffer += '_' + text;
                startOffset += 1;
            }
            else {
                if (startOffset !== 0) {
                    for (let i = 0; i < lineStarts.length; i++) {
                        lineStarts[i] += startOffset;
                    }
                }
                this.a[0].lineStarts = this.a[0].lineStarts.concat(lineStarts.slice(1));
                this.a[0].buffer += text;
            }
            const endOffset = this.a[0].buffer.length;
            const endIndex = this.a[0].lineStarts.length - 1;
            const endColumn = endOffset - this.a[0].lineStarts[endIndex];
            const endPos = { line: endIndex, column: endColumn };
            const newPiece = new $pC(0, /** todo@peng */ start, endPos, this.t(0, start, endPos), endOffset - startOffset);
            this.g = endPos;
            return [newPiece];
        }
        getLinesRawContent() {
            return this.U(this.root);
        }
        getLineRawContent(lineNumber, endOffset = 0) {
            let x = this.root;
            let ret = '';
            const cache = this.h.get2(lineNumber);
            if (cache) {
                x = cache.node;
                const prevAccumulatedValue = this.B(x, lineNumber - cache.nodeStartLineNumber - 1);
                const buffer = this.a[x.piece.bufferIndex].buffer;
                const startOffset = this.u(x.piece.bufferIndex, x.piece.start);
                if (cache.nodeStartLineNumber + x.piece.lineFeedCnt === lineNumber) {
                    ret = buffer.substring(startOffset + prevAccumulatedValue, startOffset + x.piece.length);
                }
                else {
                    const accumulatedValue = this.B(x, lineNumber - cache.nodeStartLineNumber);
                    return buffer.substring(startOffset + prevAccumulatedValue, startOffset + accumulatedValue - endOffset);
                }
            }
            else {
                let nodeStartOffset = 0;
                const originalLineNumber = lineNumber;
                while (x !== rbTreeBase_1.$$B) {
                    if (x.left !== rbTreeBase_1.$$B && x.lf_left >= lineNumber - 1) {
                        x = x.left;
                    }
                    else if (x.lf_left + x.piece.lineFeedCnt > lineNumber - 1) {
                        const prevAccumulatedValue = this.B(x, lineNumber - x.lf_left - 2);
                        const accumulatedValue = this.B(x, lineNumber - x.lf_left - 1);
                        const buffer = this.a[x.piece.bufferIndex].buffer;
                        const startOffset = this.u(x.piece.bufferIndex, x.piece.start);
                        nodeStartOffset += x.size_left;
                        this.h.set({
                            node: x,
                            nodeStartOffset,
                            nodeStartLineNumber: originalLineNumber - (lineNumber - 1 - x.lf_left)
                        });
                        return buffer.substring(startOffset + prevAccumulatedValue, startOffset + accumulatedValue - endOffset);
                    }
                    else if (x.lf_left + x.piece.lineFeedCnt === lineNumber - 1) {
                        const prevAccumulatedValue = this.B(x, lineNumber - x.lf_left - 2);
                        const buffer = this.a[x.piece.bufferIndex].buffer;
                        const startOffset = this.u(x.piece.bufferIndex, x.piece.start);
                        ret = buffer.substring(startOffset + prevAccumulatedValue, startOffset + x.piece.length);
                        break;
                    }
                    else {
                        lineNumber -= x.lf_left + x.piece.lineFeedCnt;
                        nodeStartOffset += x.size_left + x.piece.length;
                        x = x.right;
                    }
                }
            }
            // search in order, to find the node contains end column
            x = x.next();
            while (x !== rbTreeBase_1.$$B) {
                const buffer = this.a[x.piece.bufferIndex].buffer;
                if (x.piece.lineFeedCnt > 0) {
                    const accumulatedValue = this.B(x, 0);
                    const startOffset = this.u(x.piece.bufferIndex, x.piece.start);
                    ret += buffer.substring(startOffset, startOffset + accumulatedValue - endOffset);
                    return ret;
                }
                else {
                    const startOffset = this.u(x.piece.bufferIndex, x.piece.start);
                    ret += buffer.substr(startOffset, x.piece.length);
                }
                x = x.next();
            }
            return ret;
        }
        y() {
            let x = this.root;
            let lfCnt = 1;
            let len = 0;
            while (x !== rbTreeBase_1.$$B) {
                lfCnt += x.lf_left + x.piece.lineFeedCnt;
                len += x.size_left + x.piece.length;
                x = x.right;
            }
            this.b = lfCnt;
            this.c = len;
            this.h.validate(this.c);
        }
        // #region node operations
        A(node, accumulatedValue) {
            const piece = node.piece;
            const pos = this.s(node, accumulatedValue);
            const lineCnt = pos.line - piece.start.line;
            if (this.u(piece.bufferIndex, piece.end) - this.u(piece.bufferIndex, piece.start) === accumulatedValue) {
                // we are checking the end of this node, so a CRLF check is necessary.
                const realLineCnt = this.t(node.piece.bufferIndex, piece.start, pos);
                if (realLineCnt !== lineCnt) {
                    // aha yes, CRLF
                    return { index: realLineCnt, remainder: 0 };
                }
            }
            return { index: lineCnt, remainder: pos.column };
        }
        B(node, index) {
            if (index < 0) {
                return 0;
            }
            const piece = node.piece;
            const lineStarts = this.a[piece.bufferIndex].lineStarts;
            const expectedLineStartIndex = piece.start.line + index + 1;
            if (expectedLineStartIndex > piece.end.line) {
                return lineStarts[piece.end.line] + piece.end.column - lineStarts[piece.start.line] - piece.start.column;
            }
            else {
                return lineStarts[expectedLineStartIndex] - lineStarts[piece.start.line] - piece.start.column;
            }
        }
        C(node, pos) {
            const piece = node.piece;
            const originalLFCnt = piece.lineFeedCnt;
            const originalEndOffset = this.u(piece.bufferIndex, piece.end);
            const newEnd = pos;
            const newEndOffset = this.u(piece.bufferIndex, newEnd);
            const newLineFeedCnt = this.t(piece.bufferIndex, piece.start, newEnd);
            const lf_delta = newLineFeedCnt - originalLFCnt;
            const size_delta = newEndOffset - originalEndOffset;
            const newLength = piece.length + size_delta;
            node.piece = new $pC(piece.bufferIndex, piece.start, newEnd, newLineFeedCnt, newLength);
            (0, rbTreeBase_1.$fC)(this, node, size_delta, lf_delta);
        }
        D(node, pos) {
            const piece = node.piece;
            const originalLFCnt = piece.lineFeedCnt;
            const originalStartOffset = this.u(piece.bufferIndex, piece.start);
            const newStart = pos;
            const newLineFeedCnt = this.t(piece.bufferIndex, newStart, piece.end);
            const newStartOffset = this.u(piece.bufferIndex, newStart);
            const lf_delta = newLineFeedCnt - originalLFCnt;
            const size_delta = originalStartOffset - newStartOffset;
            const newLength = piece.length + size_delta;
            node.piece = new $pC(piece.bufferIndex, newStart, piece.end, newLineFeedCnt, newLength);
            (0, rbTreeBase_1.$fC)(this, node, size_delta, lf_delta);
        }
        E(node, start, end) {
            const piece = node.piece;
            const originalStartPos = piece.start;
            const originalEndPos = piece.end;
            // old piece, originalStartPos, start
            const oldLength = piece.length;
            const oldLFCnt = piece.lineFeedCnt;
            const newEnd = start;
            const newLineFeedCnt = this.t(piece.bufferIndex, piece.start, newEnd);
            const newLength = this.u(piece.bufferIndex, start) - this.u(piece.bufferIndex, originalStartPos);
            node.piece = new $pC(piece.bufferIndex, piece.start, newEnd, newLineFeedCnt, newLength);
            (0, rbTreeBase_1.$fC)(this, node, newLength - oldLength, newLineFeedCnt - oldLFCnt);
            // new right piece, end, originalEndPos
            const newPiece = new $pC(piece.bufferIndex, end, originalEndPos, this.t(piece.bufferIndex, end, originalEndPos), this.u(piece.bufferIndex, originalEndPos) - this.u(piece.bufferIndex, end));
            const newNode = this.S(node, newPiece);
            this.N(newNode);
        }
        F(node, value) {
            if (this.Q(value, node)) {
                value += '\n';
            }
            const hitCRLF = this.K() && this.L(value) && this.M(node);
            const startOffset = this.a[0].buffer.length;
            this.a[0].buffer += value;
            const lineStarts = $nC(value, false);
            for (let i = 0; i < lineStarts.length; i++) {
                lineStarts[i] += startOffset;
            }
            if (hitCRLF) {
                const prevStartOffset = this.a[0].lineStarts[this.a[0].lineStarts.length - 2];
                this.a[0].lineStarts.pop();
                // _lastChangeBufferPos is already wrong
                this.g = { line: this.g.line - 1, column: startOffset - prevStartOffset };
            }
            this.a[0].lineStarts = this.a[0].lineStarts.concat(lineStarts.slice(1));
            const endIndex = this.a[0].lineStarts.length - 1;
            const endColumn = this.a[0].buffer.length - this.a[0].lineStarts[endIndex];
            const newEnd = { line: endIndex, column: endColumn };
            const newLength = node.piece.length + value.length;
            const oldLineFeedCnt = node.piece.lineFeedCnt;
            const newLineFeedCnt = this.t(0, node.piece.start, newEnd);
            const lf_delta = newLineFeedCnt - oldLineFeedCnt;
            node.piece = new $pC(node.piece.bufferIndex, node.piece.start, newEnd, newLineFeedCnt, newLength);
            this.g = newEnd;
            (0, rbTreeBase_1.$fC)(this, node, value.length, lf_delta);
        }
        G(offset) {
            let x = this.root;
            const cache = this.h.get(offset);
            if (cache) {
                return {
                    node: cache.node,
                    nodeStartOffset: cache.nodeStartOffset,
                    remainder: offset - cache.nodeStartOffset
                };
            }
            let nodeStartOffset = 0;
            while (x !== rbTreeBase_1.$$B) {
                if (x.size_left > offset) {
                    x = x.left;
                }
                else if (x.size_left + x.piece.length >= offset) {
                    nodeStartOffset += x.size_left;
                    const ret = {
                        node: x,
                        remainder: offset - x.size_left,
                        nodeStartOffset
                    };
                    this.h.set(ret);
                    return ret;
                }
                else {
                    offset -= x.size_left + x.piece.length;
                    nodeStartOffset += x.size_left + x.piece.length;
                    x = x.right;
                }
            }
            return null;
        }
        H(lineNumber, column) {
            let x = this.root;
            let nodeStartOffset = 0;
            while (x !== rbTreeBase_1.$$B) {
                if (x.left !== rbTreeBase_1.$$B && x.lf_left >= lineNumber - 1) {
                    x = x.left;
                }
                else if (x.lf_left + x.piece.lineFeedCnt > lineNumber - 1) {
                    const prevAccumualtedValue = this.B(x, lineNumber - x.lf_left - 2);
                    const accumulatedValue = this.B(x, lineNumber - x.lf_left - 1);
                    nodeStartOffset += x.size_left;
                    return {
                        node: x,
                        remainder: Math.min(prevAccumualtedValue + column - 1, accumulatedValue),
                        nodeStartOffset
                    };
                }
                else if (x.lf_left + x.piece.lineFeedCnt === lineNumber - 1) {
                    const prevAccumualtedValue = this.B(x, lineNumber - x.lf_left - 2);
                    if (prevAccumualtedValue + column - 1 <= x.piece.length) {
                        return {
                            node: x,
                            remainder: prevAccumualtedValue + column - 1,
                            nodeStartOffset
                        };
                    }
                    else {
                        column -= x.piece.length - prevAccumualtedValue;
                        break;
                    }
                }
                else {
                    lineNumber -= x.lf_left + x.piece.lineFeedCnt;
                    nodeStartOffset += x.size_left + x.piece.length;
                    x = x.right;
                }
            }
            // search in order, to find the node contains position.column
            x = x.next();
            while (x !== rbTreeBase_1.$$B) {
                if (x.piece.lineFeedCnt > 0) {
                    const accumulatedValue = this.B(x, 0);
                    const nodeStartOffset = this.J(x);
                    return {
                        node: x,
                        remainder: Math.min(column - 1, accumulatedValue),
                        nodeStartOffset
                    };
                }
                else {
                    if (x.piece.length >= column - 1) {
                        const nodeStartOffset = this.J(x);
                        return {
                            node: x,
                            remainder: column - 1,
                            nodeStartOffset
                        };
                    }
                    else {
                        column -= x.piece.length;
                    }
                }
                x = x.next();
            }
            return null;
        }
        I(node, offset) {
            if (node.piece.lineFeedCnt < 1) {
                return -1;
            }
            const buffer = this.a[node.piece.bufferIndex];
            const newOffset = this.u(node.piece.bufferIndex, node.piece.start) + offset;
            return buffer.buffer.charCodeAt(newOffset);
        }
        J(node) {
            if (!node) {
                return 0;
            }
            let pos = node.size_left;
            while (node !== this.root) {
                if (node.parent.right === node) {
                    pos += node.parent.size_left + node.parent.piece.length;
                }
                node = node.parent;
            }
            return pos;
        }
        // #endregion
        // #region CRLF
        K() {
            return !(this.f && this.d === '\n');
        }
        L(val) {
            if (typeof val === 'string') {
                return val.charCodeAt(0) === 10;
            }
            if (val === rbTreeBase_1.$$B || val.piece.lineFeedCnt === 0) {
                return false;
            }
            const piece = val.piece;
            const lineStarts = this.a[piece.bufferIndex].lineStarts;
            const line = piece.start.line;
            const startOffset = lineStarts[line] + piece.start.column;
            if (line === lineStarts.length - 1) {
                // last line, so there is no line feed at the end of this line
                return false;
            }
            const nextLineOffset = lineStarts[line + 1];
            if (nextLineOffset > startOffset + 1) {
                return false;
            }
            return this.a[piece.bufferIndex].buffer.charCodeAt(startOffset) === 10;
        }
        M(val) {
            if (typeof val === 'string') {
                return val.charCodeAt(val.length - 1) === 13;
            }
            if (val === rbTreeBase_1.$$B || val.piece.lineFeedCnt === 0) {
                return false;
            }
            return this.I(val, val.piece.length - 1) === 13;
        }
        N(nextNode) {
            if (this.K() && this.L(nextNode)) {
                const node = nextNode.prev();
                if (this.M(node)) {
                    this.P(node, nextNode);
                }
            }
        }
        O(node) {
            if (this.K() && this.M(node)) {
                const nextNode = node.next();
                if (this.L(nextNode)) {
                    this.P(node, nextNode);
                }
            }
        }
        P(prev, next) {
            const nodesToDel = [];
            // update node
            const lineStarts = this.a[prev.piece.bufferIndex].lineStarts;
            let newEnd;
            if (prev.piece.end.column === 0) {
                // it means, last line ends with \r, not \r\n
                newEnd = { line: prev.piece.end.line - 1, column: lineStarts[prev.piece.end.line] - lineStarts[prev.piece.end.line - 1] - 1 };
            }
            else {
                // \r\n
                newEnd = { line: prev.piece.end.line, column: prev.piece.end.column - 1 };
            }
            const prevNewLength = prev.piece.length - 1;
            const prevNewLFCnt = prev.piece.lineFeedCnt - 1;
            prev.piece = new $pC(prev.piece.bufferIndex, prev.piece.start, newEnd, prevNewLFCnt, prevNewLength);
            (0, rbTreeBase_1.$fC)(this, prev, -1, -1);
            if (prev.piece.length === 0) {
                nodesToDel.push(prev);
            }
            // update nextNode
            const newStart = { line: next.piece.start.line + 1, column: 0 };
            const newLength = next.piece.length - 1;
            const newLineFeedCnt = this.t(next.piece.bufferIndex, newStart, next.piece.end);
            next.piece = new $pC(next.piece.bufferIndex, newStart, next.piece.end, newLineFeedCnt, newLength);
            (0, rbTreeBase_1.$fC)(this, next, -1, -1);
            if (next.piece.length === 0) {
                nodesToDel.push(next);
            }
            // create new piece which contains \r\n
            const pieces = this.w('\r\n');
            this.S(prev, pieces[0]);
            // delete empty nodes
            for (let i = 0; i < nodesToDel.length; i++) {
                (0, rbTreeBase_1.$dC)(this, nodesToDel[i]);
            }
        }
        Q(value, node) {
            if (this.K() && this.M(value)) {
                const nextNode = node.next();
                if (this.L(nextNode)) {
                    // move `\n` forward
                    value += '\n';
                    if (nextNode.piece.length === 1) {
                        (0, rbTreeBase_1.$dC)(this, nextNode);
                    }
                    else {
                        const piece = nextNode.piece;
                        const newStart = { line: piece.start.line + 1, column: 0 };
                        const newLength = piece.length - 1;
                        const newLineFeedCnt = this.t(piece.bufferIndex, newStart, piece.end);
                        nextNode.piece = new $pC(piece.bufferIndex, newStart, piece.end, newLineFeedCnt, newLength);
                        (0, rbTreeBase_1.$fC)(this, nextNode, -1, -1);
                    }
                    return true;
                }
            }
            return false;
        }
        // #endregion
        // #endregion
        // #region Tree operations
        iterate(node, callback) {
            if (node === rbTreeBase_1.$$B) {
                return callback(rbTreeBase_1.$$B);
            }
            const leftRet = this.iterate(node.left, callback);
            if (!leftRet) {
                return leftRet;
            }
            return callback(node) && this.iterate(node.right, callback);
        }
        R(node) {
            if (node === rbTreeBase_1.$$B) {
                return '';
            }
            const buffer = this.a[node.piece.bufferIndex];
            const piece = node.piece;
            const startOffset = this.u(piece.bufferIndex, piece.start);
            const endOffset = this.u(piece.bufferIndex, piece.end);
            const currentContent = buffer.buffer.substring(startOffset, endOffset);
            return currentContent;
        }
        getPieceContent(piece) {
            const buffer = this.a[piece.bufferIndex];
            const startOffset = this.u(piece.bufferIndex, piece.start);
            const endOffset = this.u(piece.bufferIndex, piece.end);
            const currentContent = buffer.buffer.substring(startOffset, endOffset);
            return currentContent;
        }
        /**
         *      node              node
         *     /  \              /  \
         *    a   b    <----   a    b
         *                         /
         *                        z
         */
        S(node, p) {
            const z = new rbTreeBase_1.$0B(p, 1 /* NodeColor.Red */);
            z.left = rbTreeBase_1.$$B;
            z.right = rbTreeBase_1.$$B;
            z.parent = rbTreeBase_1.$$B;
            z.size_left = 0;
            z.lf_left = 0;
            const x = this.root;
            if (x === rbTreeBase_1.$$B) {
                this.root = z;
                z.color = 0 /* NodeColor.Black */;
            }
            else if (node.right === rbTreeBase_1.$$B) {
                node.right = z;
                z.parent = node;
            }
            else {
                const nextNode = (0, rbTreeBase_1.$_B)(node.right);
                nextNode.left = z;
                z.parent = nextNode;
            }
            (0, rbTreeBase_1.$eC)(this, z);
            return z;
        }
        /**
         *      node              node
         *     /  \              /  \
         *    a   b     ---->   a    b
         *                       \
         *                        z
         */
        T(node, p) {
            const z = new rbTreeBase_1.$0B(p, 1 /* NodeColor.Red */);
            z.left = rbTreeBase_1.$$B;
            z.right = rbTreeBase_1.$$B;
            z.parent = rbTreeBase_1.$$B;
            z.size_left = 0;
            z.lf_left = 0;
            if (this.root === rbTreeBase_1.$$B) {
                this.root = z;
                z.color = 0 /* NodeColor.Black */;
            }
            else if (node.left === rbTreeBase_1.$$B) {
                node.left = z;
                z.parent = node;
            }
            else {
                const prevNode = (0, rbTreeBase_1.$aC)(node.left); // a
                prevNode.right = z;
                z.parent = prevNode;
            }
            (0, rbTreeBase_1.$eC)(this, z);
            return z;
        }
        U(node) {
            let str = '';
            this.iterate(node, node => {
                str += this.R(node);
                return true;
            });
            return str;
        }
    }
    exports.$rC = $rC;
});
//# sourceMappingURL=pieceTreeBase.js.map