/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/search/common/search", "vs/editor/common/core/range", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder", "vs/editor/common/model/textModelSearch", "vs/base/common/lifecycle"], function (require, exports, search_1, range_1, pieceTreeTextBufferBuilder_1, textModelSearch_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellSearchModel = exports.rawCellPrefix = exports.webviewMatchesToTextSearchMatches = exports.genericCellMatchesToTextSearchMatches = exports.contentMatchesToTextSearchMatches = exports.isIFileMatchWithCells = void 0;
    function isIFileMatchWithCells(object) {
        return 'cellResults' in object;
    }
    exports.isIFileMatchWithCells = isIFileMatchWithCells;
    // to text search results
    function contentMatchesToTextSearchMatches(contentMatches, cell) {
        return genericCellMatchesToTextSearchMatches(contentMatches, cell instanceof CellSearchModel ? cell.inputTextBuffer : cell.textBuffer, cell);
    }
    exports.contentMatchesToTextSearchMatches = contentMatchesToTextSearchMatches;
    function genericCellMatchesToTextSearchMatches(contentMatches, buffer, cell) {
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
            return new search_1.TextSearchMatch(lineTexts.join('\n') + '\n', grouping.map(m => new range_1.Range(m.range.startLineNumber - 1, m.range.startColumn - 1, m.range.endLineNumber - 1, m.range.endColumn - 1)));
        });
        return textSearchResults;
    }
    exports.genericCellMatchesToTextSearchMatches = genericCellMatchesToTextSearchMatches;
    function webviewMatchesToTextSearchMatches(webviewMatches) {
        return webviewMatches
            .map(rawMatch => (rawMatch.searchPreviewInfo) ?
            new search_1.TextSearchMatch(rawMatch.searchPreviewInfo.line, new range_1.Range(0, rawMatch.searchPreviewInfo.range.start, 0, rawMatch.searchPreviewInfo.range.end), undefined, rawMatch.index) : undefined).filter((e) => !!e);
    }
    exports.webviewMatchesToTextSearchMatches = webviewMatchesToTextSearchMatches;
    exports.rawCellPrefix = 'rawCell#';
    class CellSearchModel extends lifecycle_1.Disposable {
        constructor(_source, _inputTextBuffer, _outputs, _uri, _cellIndex) {
            super();
            this._source = _source;
            this._inputTextBuffer = _inputTextBuffer;
            this._outputs = _outputs;
            this._uri = _uri;
            this._cellIndex = _cellIndex;
            this._outputTextBuffers = undefined;
        }
        get id() {
            return `${exports.rawCellPrefix}${this._cellIndex}`;
        }
        get uri() {
            return this._uri;
        }
        _getFullModelRange(buffer) {
            const lineCount = buffer.getLineCount();
            return new range_1.Range(1, 1, lineCount, this._getLineMaxColumn(buffer, lineCount));
        }
        _getLineMaxColumn(buffer, lineNumber) {
            if (lineNumber < 1 || lineNumber > buffer.getLineCount()) {
                throw new Error('Illegal value for lineNumber');
            }
            return buffer.getLineLength(lineNumber) + 1;
        }
        get inputTextBuffer() {
            if (!this._inputTextBuffer) {
                const builder = new pieceTreeTextBufferBuilder_1.PieceTreeTextBufferBuilder();
                builder.acceptChunk(this._source);
                const bufferFactory = builder.finish(true);
                const { textBuffer, disposable } = bufferFactory.create(1 /* DefaultEndOfLine.LF */);
                this._inputTextBuffer = textBuffer;
                this._register(disposable);
            }
            return this._inputTextBuffer;
        }
        get outputTextBuffers() {
            if (!this._outputTextBuffers) {
                this._outputTextBuffers = this._outputs.map((output) => {
                    const builder = new pieceTreeTextBufferBuilder_1.PieceTreeTextBufferBuilder();
                    builder.acceptChunk(output.data.toString());
                    const bufferFactory = builder.finish(true);
                    const { textBuffer, disposable } = bufferFactory.create(1 /* DefaultEndOfLine.LF */);
                    this._register(disposable);
                    return textBuffer;
                });
            }
            return this._outputTextBuffers;
        }
        findInInputs(target) {
            const searchParams = new textModelSearch_1.SearchParams(target, false, false, null);
            const searchData = searchParams.parseSearchRequest();
            if (!searchData) {
                return [];
            }
            const fullInputRange = this._getFullModelRange(this.inputTextBuffer);
            return this.inputTextBuffer.findMatchesLineByLine(fullInputRange, searchData, true, 5000);
        }
        findInOutputs(target) {
            const searchParams = new textModelSearch_1.SearchParams(target, false, false, null);
            const searchData = searchParams.parseSearchRequest();
            if (!searchData) {
                return [];
            }
            return this.outputTextBuffers.map(buffer => {
                const matches = buffer.findMatchesLineByLine(this._getFullModelRange(buffer), searchData, true, 5000);
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
    exports.CellSearchModel = CellSearchModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoTm90ZWJvb2tIZWxwZXJzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL2Jyb3dzZXIvc2VhcmNoTm90ZWJvb2tIZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXNCaEcsU0FBZ0IscUJBQXFCLENBQUMsTUFBa0I7UUFDdkQsT0FBTyxhQUFhLElBQUksTUFBTSxDQUFDO0lBQ2hDLENBQUM7SUFGRCxzREFFQztJQUVELHlCQUF5QjtJQUV6QixTQUFnQixpQ0FBaUMsQ0FBQyxjQUEyQixFQUFFLElBQXNDO1FBQ3BILE9BQU8scUNBQXFDLENBQzNDLGNBQWMsRUFDZCxJQUFJLFlBQVksZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUN4RSxJQUFJLENBQ0osQ0FBQztJQUNILENBQUM7SUFORCw4RUFNQztJQUVELFNBQWdCLHFDQUFxQyxDQUFDLGNBQTJCLEVBQUUsTUFBMkIsRUFBRSxJQUFzQztRQUNySixJQUFJLGVBQWUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6QixNQUFNLGdCQUFnQixHQUFrQixFQUFFLENBQUM7UUFDM0MsSUFBSSxzQkFBc0IsR0FBZ0IsRUFBRSxDQUFDO1FBRTdDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNoQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsZUFBZSxLQUFLLGVBQWUsRUFBRTtnQkFDcEQsSUFBSSxzQkFBc0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUN0QyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLENBQUMsQ0FBQztvQkFDbkQsc0JBQXNCLEdBQUcsRUFBRSxDQUFDO2lCQUM1QjthQUNEO1lBRUQs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