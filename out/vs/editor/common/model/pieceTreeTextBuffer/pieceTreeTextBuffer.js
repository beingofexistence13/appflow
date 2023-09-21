/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/strings", "vs/editor/common/core/range", "vs/editor/common/model", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeBase", "vs/editor/common/core/eolCounter", "vs/editor/common/core/textChange", "vs/base/common/lifecycle"], function (require, exports, event_1, strings, range_1, model_1, pieceTreeBase_1, eolCounter_1, textChange_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PieceTreeTextBuffer = void 0;
    class PieceTreeTextBuffer extends lifecycle_1.Disposable {
        constructor(chunks, BOM, eol, containsRTL, containsUnusualLineTerminators, isBasicASCII, eolNormalized) {
            super();
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._BOM = BOM;
            this._mightContainNonBasicASCII = !isBasicASCII;
            this._mightContainRTL = containsRTL;
            this._mightContainUnusualLineTerminators = containsUnusualLineTerminators;
            this._pieceTree = new pieceTreeBase_1.PieceTreeBase(chunks, eol, eolNormalized);
        }
        // #region TextBuffer
        equals(other) {
            if (!(other instanceof PieceTreeTextBuffer)) {
                return false;
            }
            if (this._BOM !== other._BOM) {
                return false;
            }
            if (this.getEOL() !== other.getEOL()) {
                return false;
            }
            return this._pieceTree.equal(other._pieceTree);
        }
        mightContainRTL() {
            return this._mightContainRTL;
        }
        mightContainUnusualLineTerminators() {
            return this._mightContainUnusualLineTerminators;
        }
        resetMightContainUnusualLineTerminators() {
            this._mightContainUnusualLineTerminators = false;
        }
        mightContainNonBasicASCII() {
            return this._mightContainNonBasicASCII;
        }
        getBOM() {
            return this._BOM;
        }
        getEOL() {
            return this._pieceTree.getEOL();
        }
        createSnapshot(preserveBOM) {
            return this._pieceTree.createSnapshot(preserveBOM ? this._BOM : '');
        }
        getOffsetAt(lineNumber, column) {
            return this._pieceTree.getOffsetAt(lineNumber, column);
        }
        getPositionAt(offset) {
            return this._pieceTree.getPositionAt(offset);
        }
        getRangeAt(start, length) {
            const end = start + length;
            const startPosition = this.getPositionAt(start);
            const endPosition = this.getPositionAt(end);
            return new range_1.Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
        }
        getValueInRange(range, eol = 0 /* EndOfLinePreference.TextDefined */) {
            if (range.isEmpty()) {
                return '';
            }
            const lineEnding = this._getEndOfLine(eol);
            return this._pieceTree.getValueInRange(range, lineEnding);
        }
        getValueLengthInRange(range, eol = 0 /* EndOfLinePreference.TextDefined */) {
            if (range.isEmpty()) {
                return 0;
            }
            if (range.startLineNumber === range.endLineNumber) {
                return (range.endColumn - range.startColumn);
            }
            const startOffset = this.getOffsetAt(range.startLineNumber, range.startColumn);
            const endOffset = this.getOffsetAt(range.endLineNumber, range.endColumn);
            // offsets use the text EOL, so we need to compensate for length differences
            // if the requested EOL doesn't match the text EOL
            let eolOffsetCompensation = 0;
            const desiredEOL = this._getEndOfLine(eol);
            const actualEOL = this.getEOL();
            if (desiredEOL.length !== actualEOL.length) {
                const delta = desiredEOL.length - actualEOL.length;
                const eolCount = range.endLineNumber - range.startLineNumber;
                eolOffsetCompensation = delta * eolCount;
            }
            return endOffset - startOffset + eolOffsetCompensation;
        }
        getCharacterCountInRange(range, eol = 0 /* EndOfLinePreference.TextDefined */) {
            if (this._mightContainNonBasicASCII) {
                // we must count by iterating
                let result = 0;
                const fromLineNumber = range.startLineNumber;
                const toLineNumber = range.endLineNumber;
                for (let lineNumber = fromLineNumber; lineNumber <= toLineNumber; lineNumber++) {
                    const lineContent = this.getLineContent(lineNumber);
                    const fromOffset = (lineNumber === fromLineNumber ? range.startColumn - 1 : 0);
                    const toOffset = (lineNumber === toLineNumber ? range.endColumn - 1 : lineContent.length);
                    for (let offset = fromOffset; offset < toOffset; offset++) {
                        if (strings.isHighSurrogate(lineContent.charCodeAt(offset))) {
                            result = result + 1;
                            offset = offset + 1;
                        }
                        else {
                            result = result + 1;
                        }
                    }
                }
                result += this._getEndOfLine(eol).length * (toLineNumber - fromLineNumber);
                return result;
            }
            return this.getValueLengthInRange(range, eol);
        }
        getLength() {
            return this._pieceTree.getLength();
        }
        getLineCount() {
            return this._pieceTree.getLineCount();
        }
        getLinesContent() {
            return this._pieceTree.getLinesContent();
        }
        getLineContent(lineNumber) {
            return this._pieceTree.getLineContent(lineNumber);
        }
        getLineCharCode(lineNumber, index) {
            return this._pieceTree.getLineCharCode(lineNumber, index);
        }
        getCharCode(offset) {
            return this._pieceTree.getCharCode(offset);
        }
        getLineLength(lineNumber) {
            return this._pieceTree.getLineLength(lineNumber);
        }
        getLineMinColumn(lineNumber) {
            return 1;
        }
        getLineMaxColumn(lineNumber) {
            return this.getLineLength(lineNumber) + 1;
        }
        getLineFirstNonWhitespaceColumn(lineNumber) {
            const result = strings.firstNonWhitespaceIndex(this.getLineContent(lineNumber));
            if (result === -1) {
                return 0;
            }
            return result + 1;
        }
        getLineLastNonWhitespaceColumn(lineNumber) {
            const result = strings.lastNonWhitespaceIndex(this.getLineContent(lineNumber));
            if (result === -1) {
                return 0;
            }
            return result + 2;
        }
        _getEndOfLine(eol) {
            switch (eol) {
                case 1 /* EndOfLinePreference.LF */:
                    return '\n';
                case 2 /* EndOfLinePreference.CRLF */:
                    return '\r\n';
                case 0 /* EndOfLinePreference.TextDefined */:
                    return this.getEOL();
                default:
                    throw new Error('Unknown EOL preference');
            }
        }
        setEOL(newEOL) {
            this._pieceTree.setEOL(newEOL);
        }
        applyEdits(rawOperations, recordTrimAutoWhitespace, computeUndoEdits) {
            let mightContainRTL = this._mightContainRTL;
            let mightContainUnusualLineTerminators = this._mightContainUnusualLineTerminators;
            let mightContainNonBasicASCII = this._mightContainNonBasicASCII;
            let canReduceOperations = true;
            let operations = [];
            for (let i = 0; i < rawOperations.length; i++) {
                const op = rawOperations[i];
                if (canReduceOperations && op._isTracked) {
                    canReduceOperations = false;
                }
                const validatedRange = op.range;
                if (op.text) {
                    let textMightContainNonBasicASCII = true;
                    if (!mightContainNonBasicASCII) {
                        textMightContainNonBasicASCII = !strings.isBasicASCII(op.text);
                        mightContainNonBasicASCII = textMightContainNonBasicASCII;
                    }
                    if (!mightContainRTL && textMightContainNonBasicASCII) {
                        // check if the new inserted text contains RTL
                        mightContainRTL = strings.containsRTL(op.text);
                    }
                    if (!mightContainUnusualLineTerminators && textMightContainNonBasicASCII) {
                        // check if the new inserted text contains unusual line terminators
                        mightContainUnusualLineTerminators = strings.containsUnusualLineTerminators(op.text);
                    }
                }
                let validText = '';
                let eolCount = 0;
                let firstLineLength = 0;
                let lastLineLength = 0;
                if (op.text) {
                    let strEOL;
                    [eolCount, firstLineLength, lastLineLength, strEOL] = (0, eolCounter_1.countEOL)(op.text);
                    const bufferEOL = this.getEOL();
                    const expectedStrEOL = (bufferEOL === '\r\n' ? 2 /* StringEOL.CRLF */ : 1 /* StringEOL.LF */);
                    if (strEOL === 0 /* StringEOL.Unknown */ || strEOL === expectedStrEOL) {
                        validText = op.text;
                    }
                    else {
                        validText = op.text.replace(/\r\n|\r|\n/g, bufferEOL);
                    }
                }
                operations[i] = {
                    sortIndex: i,
                    identifier: op.identifier || null,
                    range: validatedRange,
                    rangeOffset: this.getOffsetAt(validatedRange.startLineNumber, validatedRange.startColumn),
                    rangeLength: this.getValueLengthInRange(validatedRange),
                    text: validText,
                    eolCount: eolCount,
                    firstLineLength: firstLineLength,
                    lastLineLength: lastLineLength,
                    forceMoveMarkers: Boolean(op.forceMoveMarkers),
                    isAutoWhitespaceEdit: op.isAutoWhitespaceEdit || false
                };
            }
            // Sort operations ascending
            operations.sort(PieceTreeTextBuffer._sortOpsAscending);
            let hasTouchingRanges = false;
            for (let i = 0, count = operations.length - 1; i < count; i++) {
                const rangeEnd = operations[i].range.getEndPosition();
                const nextRangeStart = operations[i + 1].range.getStartPosition();
                if (nextRangeStart.isBeforeOrEqual(rangeEnd)) {
                    if (nextRangeStart.isBefore(rangeEnd)) {
                        // overlapping ranges
                        throw new Error('Overlapping ranges are not allowed!');
                    }
                    hasTouchingRanges = true;
                }
            }
            if (canReduceOperations) {
                operations = this._reduceOperations(operations);
            }
            // Delta encode operations
            const reverseRanges = (computeUndoEdits || recordTrimAutoWhitespace ? PieceTreeTextBuffer._getInverseEditRanges(operations) : []);
            const newTrimAutoWhitespaceCandidates = [];
            if (recordTrimAutoWhitespace) {
                for (let i = 0; i < operations.length; i++) {
                    const op = operations[i];
                    const reverseRange = reverseRanges[i];
                    if (op.isAutoWhitespaceEdit && op.range.isEmpty()) {
                        // Record already the future line numbers that might be auto whitespace removal candidates on next edit
                        for (let lineNumber = reverseRange.startLineNumber; lineNumber <= reverseRange.endLineNumber; lineNumber++) {
                            let currentLineContent = '';
                            if (lineNumber === reverseRange.startLineNumber) {
                                currentLineContent = this.getLineContent(op.range.startLineNumber);
                                if (strings.firstNonWhitespaceIndex(currentLineContent) !== -1) {
                                    continue;
                                }
                            }
                            newTrimAutoWhitespaceCandidates.push({ lineNumber: lineNumber, oldContent: currentLineContent });
                        }
                    }
                }
            }
            let reverseOperations = null;
            if (computeUndoEdits) {
                let reverseRangeDeltaOffset = 0;
                reverseOperations = [];
                for (let i = 0; i < operations.length; i++) {
                    const op = operations[i];
                    const reverseRange = reverseRanges[i];
                    const bufferText = this.getValueInRange(op.range);
                    const reverseRangeOffset = op.rangeOffset + reverseRangeDeltaOffset;
                    reverseRangeDeltaOffset += (op.text.length - bufferText.length);
                    reverseOperations[i] = {
                        sortIndex: op.sortIndex,
                        identifier: op.identifier,
                        range: reverseRange,
                        text: bufferText,
                        textChange: new textChange_1.TextChange(op.rangeOffset, bufferText, reverseRangeOffset, op.text)
                    };
                }
                // Can only sort reverse operations when the order is not significant
                if (!hasTouchingRanges) {
                    reverseOperations.sort((a, b) => a.sortIndex - b.sortIndex);
                }
            }
            this._mightContainRTL = mightContainRTL;
            this._mightContainUnusualLineTerminators = mightContainUnusualLineTerminators;
            this._mightContainNonBasicASCII = mightContainNonBasicASCII;
            const contentChanges = this._doApplyEdits(operations);
            let trimAutoWhitespaceLineNumbers = null;
            if (recordTrimAutoWhitespace && newTrimAutoWhitespaceCandidates.length > 0) {
                // sort line numbers auto whitespace removal candidates for next edit descending
                newTrimAutoWhitespaceCandidates.sort((a, b) => b.lineNumber - a.lineNumber);
                trimAutoWhitespaceLineNumbers = [];
                for (let i = 0, len = newTrimAutoWhitespaceCandidates.length; i < len; i++) {
                    const lineNumber = newTrimAutoWhitespaceCandidates[i].lineNumber;
                    if (i > 0 && newTrimAutoWhitespaceCandidates[i - 1].lineNumber === lineNumber) {
                        // Do not have the same line number twice
                        continue;
                    }
                    const prevContent = newTrimAutoWhitespaceCandidates[i].oldContent;
                    const lineContent = this.getLineContent(lineNumber);
                    if (lineContent.length === 0 || lineContent === prevContent || strings.firstNonWhitespaceIndex(lineContent) !== -1) {
                        continue;
                    }
                    trimAutoWhitespaceLineNumbers.push(lineNumber);
                }
            }
            this._onDidChangeContent.fire();
            return new model_1.ApplyEditsResult(reverseOperations, contentChanges, trimAutoWhitespaceLineNumbers);
        }
        /**
         * Transform operations such that they represent the same logic edit,
         * but that they also do not cause OOM crashes.
         */
        _reduceOperations(operations) {
            if (operations.length < 1000) {
                // We know from empirical testing that a thousand edits work fine regardless of their shape.
                return operations;
            }
            // At one point, due to how events are emitted and how each operation is handled,
            // some operations can trigger a high amount of temporary string allocations,
            // that will immediately get edited again.
            // e.g. a formatter inserting ridiculous ammounts of \n on a model with a single line
            // Therefore, the strategy is to collapse all the operations into a huge single edit operation
            return [this._toSingleEditOperation(operations)];
        }
        _toSingleEditOperation(operations) {
            let forceMoveMarkers = false;
            const firstEditRange = operations[0].range;
            const lastEditRange = operations[operations.length - 1].range;
            const entireEditRange = new range_1.Range(firstEditRange.startLineNumber, firstEditRange.startColumn, lastEditRange.endLineNumber, lastEditRange.endColumn);
            let lastEndLineNumber = firstEditRange.startLineNumber;
            let lastEndColumn = firstEditRange.startColumn;
            const result = [];
            for (let i = 0, len = operations.length; i < len; i++) {
                const operation = operations[i];
                const range = operation.range;
                forceMoveMarkers = forceMoveMarkers || operation.forceMoveMarkers;
                // (1) -- Push old text
                result.push(this.getValueInRange(new range_1.Range(lastEndLineNumber, lastEndColumn, range.startLineNumber, range.startColumn)));
                // (2) -- Push new text
                if (operation.text.length > 0) {
                    result.push(operation.text);
                }
                lastEndLineNumber = range.endLineNumber;
                lastEndColumn = range.endColumn;
            }
            const text = result.join('');
            const [eolCount, firstLineLength, lastLineLength] = (0, eolCounter_1.countEOL)(text);
            return {
                sortIndex: 0,
                identifier: operations[0].identifier,
                range: entireEditRange,
                rangeOffset: this.getOffsetAt(entireEditRange.startLineNumber, entireEditRange.startColumn),
                rangeLength: this.getValueLengthInRange(entireEditRange, 0 /* EndOfLinePreference.TextDefined */),
                text: text,
                eolCount: eolCount,
                firstLineLength: firstLineLength,
                lastLineLength: lastLineLength,
                forceMoveMarkers: forceMoveMarkers,
                isAutoWhitespaceEdit: false
            };
        }
        _doApplyEdits(operations) {
            operations.sort(PieceTreeTextBuffer._sortOpsDescending);
            const contentChanges = [];
            // operations are from bottom to top
            for (let i = 0; i < operations.length; i++) {
                const op = operations[i];
                const startLineNumber = op.range.startLineNumber;
                const startColumn = op.range.startColumn;
                const endLineNumber = op.range.endLineNumber;
                const endColumn = op.range.endColumn;
                if (startLineNumber === endLineNumber && startColumn === endColumn && op.text.length === 0) {
                    // no-op
                    continue;
                }
                if (op.text) {
                    // replacement
                    this._pieceTree.delete(op.rangeOffset, op.rangeLength);
                    this._pieceTree.insert(op.rangeOffset, op.text, true);
                }
                else {
                    // deletion
                    this._pieceTree.delete(op.rangeOffset, op.rangeLength);
                }
                const contentChangeRange = new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn);
                contentChanges.push({
                    range: contentChangeRange,
                    rangeLength: op.rangeLength,
                    text: op.text,
                    rangeOffset: op.rangeOffset,
                    forceMoveMarkers: op.forceMoveMarkers
                });
            }
            return contentChanges;
        }
        findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount) {
            return this._pieceTree.findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount);
        }
        // #endregion
        // #region helper
        // testing purpose.
        getPieceTree() {
            return this._pieceTree;
        }
        static _getInverseEditRange(range, text) {
            const startLineNumber = range.startLineNumber;
            const startColumn = range.startColumn;
            const [eolCount, firstLineLength, lastLineLength] = (0, eolCounter_1.countEOL)(text);
            let resultRange;
            if (text.length > 0) {
                // the operation inserts something
                const lineCount = eolCount + 1;
                if (lineCount === 1) {
                    // single line insert
                    resultRange = new range_1.Range(startLineNumber, startColumn, startLineNumber, startColumn + firstLineLength);
                }
                else {
                    // multi line insert
                    resultRange = new range_1.Range(startLineNumber, startColumn, startLineNumber + lineCount - 1, lastLineLength + 1);
                }
            }
            else {
                // There is nothing to insert
                resultRange = new range_1.Range(startLineNumber, startColumn, startLineNumber, startColumn);
            }
            return resultRange;
        }
        /**
         * Assumes `operations` are validated and sorted ascending
         */
        static _getInverseEditRanges(operations) {
            const result = [];
            let prevOpEndLineNumber = 0;
            let prevOpEndColumn = 0;
            let prevOp = null;
            for (let i = 0, len = operations.length; i < len; i++) {
                const op = operations[i];
                let startLineNumber;
                let startColumn;
                if (prevOp) {
                    if (prevOp.range.endLineNumber === op.range.startLineNumber) {
                        startLineNumber = prevOpEndLineNumber;
                        startColumn = prevOpEndColumn + (op.range.startColumn - prevOp.range.endColumn);
                    }
                    else {
                        startLineNumber = prevOpEndLineNumber + (op.range.startLineNumber - prevOp.range.endLineNumber);
                        startColumn = op.range.startColumn;
                    }
                }
                else {
                    startLineNumber = op.range.startLineNumber;
                    startColumn = op.range.startColumn;
                }
                let resultRange;
                if (op.text.length > 0) {
                    // the operation inserts something
                    const lineCount = op.eolCount + 1;
                    if (lineCount === 1) {
                        // single line insert
                        resultRange = new range_1.Range(startLineNumber, startColumn, startLineNumber, startColumn + op.firstLineLength);
                    }
                    else {
                        // multi line insert
                        resultRange = new range_1.Range(startLineNumber, startColumn, startLineNumber + lineCount - 1, op.lastLineLength + 1);
                    }
                }
                else {
                    // There is nothing to insert
                    resultRange = new range_1.Range(startLineNumber, startColumn, startLineNumber, startColumn);
                }
                prevOpEndLineNumber = resultRange.endLineNumber;
                prevOpEndColumn = resultRange.endColumn;
                result.push(resultRange);
                prevOp = op;
            }
            return result;
        }
        static _sortOpsAscending(a, b) {
            const r = range_1.Range.compareRangesUsingEnds(a.range, b.range);
            if (r === 0) {
                return a.sortIndex - b.sortIndex;
            }
            return r;
        }
        static _sortOpsDescending(a, b) {
            const r = range_1.Range.compareRangesUsingEnds(a.range, b.range);
            if (r === 0) {
                return b.sortIndex - a.sortIndex;
            }
            return -r;
        }
    }
    exports.PieceTreeTextBuffer = PieceTreeTextBuffer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGllY2VUcmVlVGV4dEJ1ZmZlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbW9kZWwvcGllY2VUcmVlVGV4dEJ1ZmZlci9waWVjZVRyZWVUZXh0QnVmZmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQThCaEcsTUFBYSxtQkFBb0IsU0FBUSxzQkFBVTtRQVVsRCxZQUFZLE1BQXNCLEVBQUUsR0FBVyxFQUFFLEdBQWtCLEVBQUUsV0FBb0IsRUFBRSw4QkFBdUMsRUFBRSxZQUFxQixFQUFFLGFBQXNCO1lBQ2hMLEtBQUssRUFBRSxDQUFDO1lBSlEsd0JBQW1CLEdBQWtCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQzFFLHVCQUFrQixHQUFnQixJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDO1lBSWhGLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1lBQ2hCLElBQUksQ0FBQywwQkFBMEIsR0FBRyxDQUFDLFlBQVksQ0FBQztZQUNoRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxtQ0FBbUMsR0FBRyw4QkFBOEIsQ0FBQztZQUMxRSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksNkJBQWEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFFRCxxQkFBcUI7UUFDZCxNQUFNLENBQUMsS0FBa0I7WUFDL0IsSUFBSSxDQUFDLENBQUMsS0FBSyxZQUFZLG1CQUFtQixDQUFDLEVBQUU7Z0JBQzVDLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFDRCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLElBQUksRUFBRTtnQkFDN0IsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUNELElBQUks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