/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/search/common/search", "vs/editor/common/core/range", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder", "vs/editor/common/model/textModelSearch", "vs/base/common/lifecycle"], function (require, exports, search_1, range_1, pieceTreeTextBufferBuilder_1, textModelSearch_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$KMb = exports.$JMb = exports.$IMb = exports.$HMb = exports.$GMb = exports.$FMb = void 0;
    function $FMb(object) {
        return 'cellResults' in object;
    }
    exports.$FMb = $FMb;
    // to text search results
    function $GMb(contentMatches, cell) {
        return $HMb(contentMatches, cell instanceof $KMb ? cell.inputTextBuffer : cell.textBuffer, cell);
    }
    exports.$GMb = $GMb;
    function $HMb(contentMatches, buffer, cell) {
        let previousEndLine = -1;
        const contextGroupings = [];
        let currentContextGrouping = [];
        contentMatches.forEach((match) => {
            if (match.range.startLineNumber !== previousEndLine) {
                if (currentContextGrouping.length > 0) {
                    contextGroupings.push([...currentContextGrouping]);
                    currentContextGrouping = [];
                }
            }
            currentContextGrouping.push(match);
            previousEndLine = match.range.endLineNumber;
        });
        if (currentContextGrouping.length > 0) {
            contextGroupings.push([...currentContextGrouping]);
        }
        const textSearchResults = contextGroupings.map((grouping) => {
            const lineTexts = [];
            const firstLine = grouping[0].range.startLineNumber;
            const lastLine = grouping[grouping.length - 1].range.endLineNumber;
            for (let i = firstLine; i <= lastLine; i++) {
                lineTexts.push(buffer.getLineContent(i));
            }
            return new search_1.$tI(lineTexts.join('\n') + '\n', grouping.map(m => new range_1.$ks(m.range.startLineNumber - 1, m.range.startColumn - 1, m.range.endLineNumber - 1, m.range.endColumn - 1)));
        });
        return textSearchResults;
    }
    exports.$HMb = $HMb;
    function $IMb(webviewMatches) {
        return webviewMatches
            .map(rawMatch => (rawMatch.searchPreviewInfo) ?
            new search_1.$tI(rawMatch.searchPreviewInfo.line, new range_1.$ks(0, rawMatch.searchPreviewInfo.range.start, 0, rawMatch.searchPreviewInfo.range.end), undefined, rawMatch.index) : undefined).filter((e) => !!e);
    }
    exports.$IMb = $IMb;
    exports.$JMb = 'rawCell#';
    class $KMb extends lifecycle_1.$kc {
        constructor(_source, b, c, f, g) {
            super();
            this._source = _source;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.a = undefined;
        }
        get id() {
            return `${exports.$JMb}${this.g}`;
        }
        get uri() {
            return this.f;
        }
        h(buffer) {
            const lineCount = buffer.getLineCount();
            return new range_1.$ks(1, 1, lineCount, this.j(buffer, lineCount));
        }
        j(buffer, lineNumber) {
            if (lineNumber < 1 || lineNumber > buffer.getLineCount()) {
                throw new Error('Illegal value for lineNumber');
            }
            return buffer.getLineLength(lineNumber) + 1;
        }
        get inputTextBuffer() {
            if (!this.b) {
                const builder = new pieceTreeTextBufferBuilder_1.$tC();
                builder.acceptChunk(this._source);
                const bufferFactory = builder.finish(true);
                const { textBuffer, disposable } = bufferFactory.create(1 /* DefaultEndOfLine.LF */);
                this.b = textBuffer;
                this.B(disposable);
            }
            return this.b;
        }
        get outputTextBuffers() {
            if (!this.a) {
                this.a = this.c.map((output) => {
                    const builder = new pieceTreeTextBufferBuilder_1.$tC();
                    builder.acceptChunk(output.data.toString());
                    const bufferFactory = builder.finish(true);
                    const { textBuffer, disposable } = bufferFactory.create(1 /* DefaultEndOfLine.LF */);
                    this.B(disposable);
                    return textBuffer;
                });
            }
            return this.a;
        }
        findInInputs(target) {
            const searchParams = new textModelSearch_1.$hC(target, false, false, null);
            const searchData = searchParams.parseSearchRequest();
            if (!searchData) {
                return [];
            }
            const fullInputRange = this.h(this.inputTextBuffer);
            return this.inputTextBuffer.findMatchesLineByLine(fullInputRange, searchData, true, 5000);
        }
        findInOutputs(target) {
            const searchParams = new textModelSearch_1.$hC(target, false, false, null);
            const searchData = searchParams.parseSearchRequest();
            if (!searchData) {
                return [];
            }
            return this.outputTextBuffers.map(buffer => {
                const matches = buffer.findMatchesLineByLine(this.h(buffer), searchData, true, 5000);
                if (matches.length === 0) {
                    return undefined;
                }
                return {
                    textBuffer: buffer,
                    matches
                };
            }).filter((item) => !!item);
        }
    }
    exports.$KMb = $KMb;
});
//# sourceMappingURL=searchNotebookHelpers.js.map