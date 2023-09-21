/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/textModelGuides", "vs/editor/common/model/textModel", "vs/editor/common/textModelEvents", "vs/editor/common/viewEvents", "vs/editor/common/viewModel/modelLineProjection", "vs/editor/common/model/prefixSumComputer", "vs/editor/common/viewModel"], function (require, exports, arrays, position_1, range_1, textModelGuides_1, textModel_1, textModelEvents_1, viewEvents, modelLineProjection_1, prefixSumComputer_1, viewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewModelLinesFromModelAsIs = exports.ViewModelLinesFromProjectedModel = void 0;
    class ViewModelLinesFromProjectedModel {
        constructor(editorId, model, domLineBreaksComputerFactory, monospaceLineBreaksComputerFactory, fontInfo, tabSize, wrappingStrategy, wrappingColumn, wrappingIndent, wordBreak) {
            this._editorId = editorId;
            this.model = model;
            this._validModelVersionId = -1;
            this._domLineBreaksComputerFactory = domLineBreaksComputerFactory;
            this._monospaceLineBreaksComputerFactory = monospaceLineBreaksComputerFactory;
            this.fontInfo = fontInfo;
            this.tabSize = tabSize;
            this.wrappingStrategy = wrappingStrategy;
            this.wrappingColumn = wrappingColumn;
            this.wrappingIndent = wrappingIndent;
            this.wordBreak = wordBreak;
            this._constructLines(/*resetHiddenAreas*/ true, null);
        }
        dispose() {
            this.hiddenAreasDecorationIds = this.model.deltaDecorations(this.hiddenAreasDecorationIds, []);
        }
        createCoordinatesConverter() {
            return new CoordinatesConverter(this);
        }
        _constructLines(resetHiddenAreas, previousLineBreaks) {
            this.modelLineProjections = [];
            if (resetHiddenAreas) {
                this.hiddenAreasDecorationIds = this.model.deltaDecorations(this.hiddenAreasDecorationIds, []);
            }
            const linesContent = this.model.getLinesContent();
            const injectedTextDecorations = this.model.getInjectedTextDecorations(this._editorId);
            const lineCount = linesContent.length;
            const lineBreaksComputer = this.createLineBreaksComputer();
            const injectedTextQueue = new arrays.ArrayQueue(textModelEvents_1.LineInjectedText.fromDecorations(injectedTextDecorations));
            for (let i = 0; i < lineCount; i++) {
                const lineInjectedText = injectedTextQueue.takeWhile(t => t.lineNumber === i + 1);
                lineBreaksComputer.addRequest(linesContent[i], lineInjectedText, previousLineBreaks ? previousLineBreaks[i] : null);
            }
            const linesBreaks = lineBreaksComputer.finalize();
            const values = [];
            const hiddenAreas = this.hiddenAreasDecorationIds.map((areaId) => this.model.getDecorationRange(areaId)).sort(range_1.Range.compareRangesUsingStarts);
            let hiddenAreaStart = 1, hiddenAreaEnd = 0;
            let hiddenAreaIdx = -1;
            let nextLineNumberToUpdateHiddenArea = (hiddenAreaIdx + 1 < hiddenAreas.length) ? hiddenAreaEnd + 1 : lineCount + 2;
            for (let i = 0; i < lineCount; i++) {
                const lineNumber = i + 1;
                if (lineNumber === nextLineNumberToUpdateHiddenArea) {
                    hiddenAreaIdx++;
                    hiddenAreaStart = hiddenAreas[hiddenAreaIdx].startLineNumber;
                    hiddenAreaEnd = hiddenAreas[hiddenAreaIdx].endLineNumber;
                    nextLineNumberToUpdateHiddenArea = (hiddenAreaIdx + 1 < hiddenAreas.length) ? hiddenAreaEnd + 1 : lineCount + 2;
                }
                const isInHiddenArea = (lineNumber >= hiddenAreaStart && lineNumber <= hiddenAreaEnd);
                const line = (0, modelLineProjection_1.createModelLineProjection)(linesBreaks[i], !isInHiddenArea);
                values[i] = line.getViewLineCount();
                this.modelLineProjections[i] = line;
            }
            this._validModelVersionId = this.model.getVersionId();
            this.projectedModelLineLineCounts = new prefixSumComputer_1.ConstantTimePrefixSumComputer(values);
        }
        getHiddenAreas() {
            return this.hiddenAreasDecorationIds.map((decId) => this.model.getDecorationRange(decId));
        }
        setHiddenAreas(_ranges) {
            const validatedRanges = _ranges.map(r => this.model.validateRange(r));
            const newRanges = normalizeLineRanges(validatedRanges);
            // TODO@Martin: Please stop calling this method on each model change!
            // This checks if there really was a change
            const oldRanges = this.hiddenAreasDecorationIds.map((areaId) => this.model.getDecorationRange(areaId)).sort(range_1.Range.compareRangesUsingStarts);
            if (newRanges.length === oldRanges.length) {
                let hasDifference = false;
                for (let i = 0; i < newRanges.length; i++) {
                    if (!newRanges[i].equalsRange(oldRanges[i])) {
                        hasDifference = true;
                        break;
                    }
                }
                if (!hasDifference) {
                    return false;
                }
            }
            const newDecorations = newRanges.map((r) => ({
                range: r,
                options: textModel_1.ModelDecorationOptions.EMPTY,
            }));
            this.hiddenAreasDecorationIds = this.model.deltaDecorations(this.hiddenAreasDecorationIds, newDecorations);
            const hiddenAreas = newRanges;
            let hiddenAreaStart = 1, hiddenAreaEnd = 0;
            let hiddenAreaIdx = -1;
            let nextLineNumberToUpdateHiddenArea = (hiddenAreaIdx + 1 < hiddenAreas.length) ? hiddenAreaEnd + 1 : this.modelLineProjections.length + 2;
            let hasVisibleLine = false;
            for (let i = 0; i < this.modelLineProjections.length; i++) {
                const lineNumber = i + 1;
                if (lineNumber === nextLineNumberToUpdateHiddenArea) {
                    hiddenAreaIdx++;
                    hiddenAreaStart = hiddenAreas[hiddenAreaIdx].startLineNumber;
                    hiddenAreaEnd = hiddenAreas[hiddenAreaIdx].endLineNumber;
                    nextLineNumberToUpdateHiddenArea = (hiddenAreaIdx + 1 < hiddenAreas.length) ? hiddenAreaEnd + 1 : this.modelLineProjections.length + 2;
                }
                let lineChanged = false;
                if (lineNumber >= hiddenAreaStart && lineNumber <= hiddenAreaEnd) {
                    // Line should be hidden
                    if (this.modelLineProjections[i].isVisible()) {
                        this.modelLineProjections[i] = this.modelLineProjections[i].setVisible(false);
                        lineChanged = true;
                    }
                }
                else {
                    hasVisibleLine = true;
                    // Line should be visible
                    if (!this.modelLineProjections[i].isVisible()) {
                        this.modelLineProjections[i] = this.modelLineProjections[i].setVisible(true);
                        lineChanged = true;
                    }
                }
                if (lineChanged) {
                    const newOutputLineCount = this.modelLineProjections[i].getViewLineCount();
                    this.projectedModelLineLineCounts.setValue(i, newOutputLineCount);
                }
            }
            if (!hasVisibleLine) {
                // Cannot have everything be hidden => reveal everything!
                this.setHiddenAreas([]);
            }
            return true;
        }
        modelPositionIsVisible(modelLineNumber, _modelColumn) {
            if (modelLineNumber < 1 || modelLineNumber > this.modelLineProjections.length) {
                // invalid arguments
                return false;
            }
            return this.modelLineProjections[modelLineNumber - 1].isVisible();
        }
        getModelLineViewLineCount(modelLineNumber) {
            if (modelLineNumber < 1 || modelLineNumber > this.modelLineProjections.length) {
                // invalid arguments
                return 1;
            }
            return this.modelLineProjections[modelLineNumber - 1].getViewLineCount();
        }
        setTabSize(newTabSize) {
            if (this.tabSize === newTabSize) {
                return false;
            }
            this.tabSize = newTabSize;
            this._constructLines(/*resetHiddenAreas*/ false, null);
            return true;
        }
        setWrappingSettings(fontInfo, wrappingStrategy, wrappingColumn, wrappingIndent, wordBreak) {
            const equalFontInfo = this.fontInfo.equals(fontInfo);
            const equalWrappingStrategy = (this.wrappingStrategy === wrappingStrategy);
            const equalWrappingColumn = (this.wrappingColumn === wrappingColumn);
            const equalWrappingIndent = (this.wrappingIndent === wrappingIndent);
            const equalWordBreak = (this.wordBreak === wordBreak);
            if (equalFontInfo && equalWrappingStrategy && equalWrappingColumn && equalWrappingIndent && equalWordBreak) {
                return false;
            }
            const onlyWrappingColumnChanged = (equalFontInfo && equalWrappingStrategy && !equalWrappingColumn && equalWrappingIndent && equalWordBreak);
            this.fontInfo = fontInfo;
            this.wrappingStrategy = wrappingStrategy;
            this.wrappingColumn = wrappingColumn;
            this.wrappingIndent = wrappingIndent;
            this.wordBreak = wordBreak;
            let previousLineBreaks = null;
            if (onlyWrappingColumnChanged) {
                previousLineBreaks = [];
                for (let i = 0, len = this.modelLineProjections.length; i < len; i++) {
                    previousLineBreaks[i] = this.modelLineProjections[i].getProjectionData();
                }
            }
            this._constructLines(/*resetHiddenAreas*/ false, previousLineBreaks);
            return true;
        }
        createLineBreaksComputer() {
            const lineBreaksComputerFactory = (this.wrappingStrategy === 'advanced'
                ? this._domLineBreaksComputerFactory
                : this._monospaceLineBreaksComputerFactory);
            return lineBreaksComputerFactory.createLineBreaksComputer(this.fontInfo, this.tabSize, this.wrappingColumn, this.wrappingIndent, this.wordBreak);
        }
        onModelFlushed() {
            this._constructLines(/*resetHiddenAreas*/ true, null);
        }
        onModelLinesDeleted(versionId, fromLineNumber, toLineNumber) {
            if (!versionId || versionId <= this._validModelVersionId) {
                // Here we check for versionId in case the lines were reconstructed in the meantime.
                // We don't want to apply stale change events on top of a newer read model state.
                return null;
            }
            const outputFromLineNumber = (fromLineNumber === 1 ? 1 : this.projectedModelLineLineCounts.getPrefixSum(fromLineNumber - 1) + 1);
            const outputToLineNumber = this.projectedModelLineLineCounts.getPrefixSum(toLineNumber);
            this.modelLineProjections.splice(fromLineNumber - 1, toLineNumber - fromLineNumber + 1);
            this.projectedModelLineLineCounts.removeValues(fromLineNumber - 1, toLineNumber - fromLineNumber + 1);
            return new viewEvents.ViewLinesDeletedEvent(outputFromLineNumber, outputToLineNumber);
        }
        onModelLinesInserted(versionId, fromLineNumber, _toLineNumber, lineBreaks) {
            if (!versionId || versionId <= this._validModelVersionId) {
                // Here we check for versionId in case the lines were reconstructed in the meantime.
                // We don't want to apply stale change events on top of a newer read model state.
                return null;
            }
            // cannot use this.getHiddenAreas() because those decorations have already seen the effect of this model change
            const isInHiddenArea = (fromLineNumber > 2 && !this.modelLineProjections[fromLineNumber - 2].isVisible());
            const outputFromLineNumber = (fromLineNumber === 1 ? 1 : this.projectedModelLineLineCounts.getPrefixSum(fromLineNumber - 1) + 1);
            let totalOutputLineCount = 0;
            const insertLines = [];
            const insertPrefixSumValues = [];
            for (let i = 0, len = lineBreaks.length; i < len; i++) {
                const line = (0, modelLineProjection_1.createModelLineProjection)(lineBreaks[i], !isInHiddenArea);
                insertLines.push(line);
                const outputLineCount = line.getViewLineCount();
                totalOutputLineCount += outputLineCount;
                insertPrefixSumValues[i] = outputLineCount;
            }
            // TODO@Alex: use arrays.arrayInsert
            this.modelLineProjections =
                this.modelLineProjections.slice(0, fromLineNumber - 1)
                    .concat(insertLines)
                    .concat(this.modelLineProjections.slice(fromLineNumber - 1));
            this.projectedModelLineLineCounts.insertValues(fromLineNumber - 1, insertPrefixSumValues);
            return new viewEvents.ViewLinesInsertedEvent(outputFromLineNumber, outputFromLineNumber + totalOutputLineCount - 1);
        }
        onModelLineChanged(versionId, lineNumber, lineBreakData) {
            if (versionId !== null && versionId <= this._validModelVersionId) {
                // Here we check for versionId in case the lines were reconstructed in the meantime.
                // We don't want to apply stale change events on top of a newer read model state.
                return [false, null, null, null];
            }
            const lineIndex = lineNumber - 1;
            const oldOutputLineCount = this.modelLineProjections[lineIndex].getViewLineCount();
            const isVisible = this.modelLineProjections[lineIndex].isVisible();
            const line = (0, modelLineProjection_1.createModelLineProjection)(lineBreakData, isVisible);
            this.modelLineProjections[lineIndex] = line;
            const newOutputLineCount = this.modelLineProjections[lineIndex].getViewLineCount();
            let lineMappingChanged = false;
            let changeFrom = 0;
            let changeTo = -1;
            let insertFrom = 0;
            let insertTo = -1;
            let deleteFrom = 0;
            let deleteTo = -1;
            if (oldOutputLineCount > newOutputLineCount) {
                changeFrom = this.projectedModelLineLineCounts.getPrefixSum(lineNumber - 1) + 1;
                changeTo = changeFrom + newOutputLineCount - 1;
                deleteFrom = changeTo + 1;
                deleteTo = deleteFrom + (oldOutputLineCount - newOutputLineCount) - 1;
                lineMappingChanged = true;
            }
            else if (oldOutputLineCount < newOutputLineCount) {
                changeFrom = this.projectedModelLineLineCounts.getPrefixSum(lineNumber - 1) + 1;
                changeTo = changeFrom + oldOutputLineCount - 1;
                insertFrom = changeTo + 1;
                insertTo = insertFrom + (newOutputLineCount - oldOutputLineCount) - 1;
                lineMappingChanged = true;
            }
            else {
                changeFrom = this.projectedModelLineLineCounts.getPrefixSum(lineNumber - 1) + 1;
                changeTo = changeFrom + newOutputLineCount - 1;
            }
            this.projectedModelLineLineCounts.setValue(lineIndex, newOutputLineCount);
            const viewLinesChangedEvent = (changeFrom <= changeTo ? new viewEvents.ViewLinesChangedEvent(changeFrom, changeTo - changeFrom + 1) : null);
            const viewLinesInsertedEvent = (insertFrom <= insertTo ? new viewEvents.ViewLinesInsertedEvent(insertFrom, insertTo) : null);
            const viewLinesDeletedEvent = (deleteFrom <= deleteTo ? new viewEvents.ViewLinesDeletedEvent(deleteFrom, deleteTo) : null);
            return [lineMappingChanged, viewLinesChangedEvent, viewLinesInsertedEvent, viewLinesDeletedEvent];
        }
        acceptVersionId(versionId) {
            this._validModelVersionId = versionId;
            if (this.modelLineProjections.length === 1 && !this.modelLineProjections[0].isVisible()) {
                // At least one line must be visible => reset hidden areas
                this.setHiddenAreas([]);
            }
        }
        getViewLineCount() {
            return this.projectedModelLineLineCounts.getTotalSum();
        }
        _toValidViewLineNumber(viewLineNumber) {
            if (viewLineNumber < 1) {
                return 1;
            }
            const viewLineCount = this.getViewLineCount();
            if (viewLineNumber > viewLineCount) {
                return viewLineCount;
            }
            return viewLineNumber | 0;
        }
        getActiveIndentGuide(viewLineNumber, minLineNumber, maxLineNumber) {
            viewLineNumber = this._toValidViewLineNumber(viewLineNumber);
            minLineNumber = this._toValidViewLineNumber(minLineNumber);
            maxLineNumber = this._toValidViewLineNumber(maxLineNumber);
            const modelPosition = this.convertViewPositionToModelPosition(viewLineNumber, this.getViewLineMinColumn(viewLineNumber));
            const modelMinPosition = this.convertViewPositionToModelPosition(minLineNumber, this.getViewLineMinColumn(minLineNumber));
            const modelMaxPosition = this.convertViewPositionToModelPosition(maxLineNumber, this.getViewLineMinColumn(maxLineNumber));
            const result = this.model.guides.getActiveIndentGuide(modelPosition.lineNumber, modelMinPosition.lineNumber, modelMaxPosition.lineNumber);
            const viewStartPosition = this.convertModelPositionToViewPosition(result.startLineNumber, 1);
            const viewEndPosition = this.convertModelPositionToViewPosition(result.endLineNumber, this.model.getLineMaxColumn(result.endLineNumber));
            return {
                startLineNumber: viewStartPosition.lineNumber,
                endLineNumber: viewEndPosition.lineNumber,
                indent: result.indent
            };
        }
        // #region ViewLineInfo
        getViewLineInfo(viewLineNumber) {
            viewLineNumber = this._toValidViewLineNumber(viewLineNumber);
            const r = this.projectedModelLineLineCounts.getIndexOf(viewLineNumber - 1);
            const lineIndex = r.index;
            const remainder = r.remainder;
            return new ViewLineInfo(lineIndex + 1, remainder);
        }
        getMinColumnOfViewLine(viewLineInfo) {
            return this.modelLineProjections[viewLineInfo.modelLineNumber - 1].getViewLineMinColumn(this.model, viewLineInfo.modelLineNumber, viewLineInfo.modelLineWrappedLineIdx);
        }
        getMaxColumnOfViewLine(viewLineInfo) {
            return this.modelLineProjections[viewLineInfo.modelLineNumber - 1].getViewLineMaxColumn(this.model, viewLineInfo.modelLineNumber, viewLineInfo.modelLineWrappedLineIdx);
        }
        getModelStartPositionOfViewLine(viewLineInfo) {
            const line = this.modelLineProjections[viewLineInfo.modelLineNumber - 1];
            const minViewColumn = line.getViewLineMinColumn(this.model, viewLineInfo.modelLineNumber, viewLineInfo.modelLineWrappedLineIdx);
            const column = line.getModelColumnOfViewPosition(viewLineInfo.modelLineWrappedLineIdx, minViewColumn);
            return new position_1.Position(viewLineInfo.modelLineNumber, column);
        }
        getModelEndPositionOfViewLine(viewLineInfo) {
            const line = this.modelLineProjections[viewLineInfo.modelLineNumber - 1];
            const maxViewColumn = line.getViewLineMaxColumn(this.model, viewLineInfo.modelLineNumber, viewLineInfo.modelLineWrappedLineIdx);
            const column = line.getModelColumnOfViewPosition(viewLineInfo.modelLineWrappedLineIdx, maxViewColumn);
            return new position_1.Position(viewLineInfo.modelLineNumber, column);
        }
        getViewLineInfosGroupedByModelRanges(viewStartLineNumber, viewEndLineNumber) {
            const startViewLine = this.getViewLineInfo(viewStartLineNumber);
            const endViewLine = this.getViewLineInfo(viewEndLineNumber);
            const result = new Array();
            let lastVisibleModelPos = this.getModelStartPositionOfViewLine(startViewLine);
            let viewLines = new Array();
            for (let curModelLine = startViewLine.modelLineNumber; curModelLine <= endViewLine.modelLineNumber; curModelLine++) {
                const line = this.modelLineProjections[curModelLine - 1];
                if (line.isVisible()) {
                    const startOffset = curModelLine === startViewLine.modelLineNumber
                        ? startViewLine.modelLineWrappedLineIdx
                        : 0;
                    const endOffset = curModelLine === endViewLine.modelLineNumber
                        ? endViewLine.modelLineWrappedLineIdx + 1
                        : line.getViewLineCount();
                    for (let i = startOffset; i < endOffset; i++) {
                        viewLines.push(new ViewLineInfo(curModelLine, i));
                    }
                }
                if (!line.isVisible() && lastVisibleModelPos) {
                    const lastVisibleModelPos2 = new position_1.Position(curModelLine - 1, this.model.getLineMaxColumn(curModelLine - 1) + 1);
                    const modelRange = range_1.Range.fromPositions(lastVisibleModelPos, lastVisibleModelPos2);
                    result.push(new ViewLineInfoGroupedByModelRange(modelRange, viewLines));
                    viewLines = [];
                    lastVisibleModelPos = null;
                }
                else if (line.isVisible() && !lastVisibleModelPos) {
                    lastVisibleModelPos = new position_1.Position(curModelLine, 1);
                }
            }
            if (lastVisibleModelPos) {
                const modelRange = range_1.Range.fromPositions(lastVisibleModelPos, this.getModelEndPositionOfViewLine(endViewLine));
                result.push(new ViewLineInfoGroupedByModelRange(modelRange, viewLines));
            }
            return result;
        }
        // #endregion
        getViewLinesBracketGuides(viewStartLineNumber, viewEndLineNumber, activeViewPosition, options) {
            const modelActivePosition = activeViewPosition ? this.convertViewPositionToModelPosition(activeViewPosition.lineNumber, activeViewPosition.column) : null;
            const resultPerViewLine = [];
            for (const group of this.getViewLineInfosGroupedByModelRanges(viewStartLineNumber, viewEndLineNumber)) {
                const modelRangeStartLineNumber = group.modelRange.startLineNumber;
                const bracketGuidesPerModelLine = this.model.guides.getLinesBracketGuides(modelRangeStartLineNumber, group.modelRange.endLineNumber, modelActivePosition, options);
                for (const viewLineInfo of group.viewLines) {
                    const bracketGuides = bracketGuidesPerModelLine[viewLineInfo.modelLineNumber - modelRangeStartLineNumber];
                    // visibleColumns stay as they are (this is a bug and needs to be fixed, but it is not a regression)
                    // model-columns must be converted to view-model columns.
                    const result = bracketGuides.map(g => {
                        if (g.forWrappedLinesAfterColumn !== -1) {
                            const p = this.modelLineProjections[viewLineInfo.modelLineNumber - 1].getViewPositionOfModelPosition(0, g.forWrappedLinesAfterColumn);
                            if (p.lineNumber >= viewLineInfo.modelLineWrappedLineIdx) {
                                return undefined;
                            }
                        }
                        if (g.forWrappedLinesBeforeOrAtColumn !== -1) {
                            const p = this.modelLineProjections[viewLineInfo.modelLineNumber - 1].getViewPositionOfModelPosition(0, g.forWrappedLinesBeforeOrAtColumn);
                            if (p.lineNumber < viewLineInfo.modelLineWrappedLineIdx) {
                                return undefined;
                            }
                        }
                        if (!g.horizontalLine) {
                            return g;
                        }
                        let column = -1;
                        if (g.column !== -1) {
                            const p = this.modelLineProjections[viewLineInfo.modelLineNumber - 1].getViewPositionOfModelPosition(0, g.column);
                            if (p.lineNumber === viewLineInfo.modelLineWrappedLineIdx) {
                                column = p.column;
                            }
                            else if (p.lineNumber < viewLineInfo.modelLineWrappedLineIdx) {
                                column = this.getMinColumnOfViewLine(viewLineInfo);
                            }
                            else if (p.lineNumber > viewLineInfo.modelLineWrappedLineIdx) {
                                return undefined;
                            }
                        }
                        const viewPosition = this.convertModelPositionToViewPosition(viewLineInfo.modelLineNumber, g.horizontalLine.endColumn);
                        const p = this.modelLineProjections[viewLineInfo.modelLineNumber - 1].getViewPositionOfModelPosition(0, g.horizontalLine.endColumn);
                        if (p.lineNumber === viewLineInfo.modelLineWrappedLineIdx) {
                            return new textModelGuides_1.IndentGuide(g.visibleColumn, column, g.className, new textModelGuides_1.IndentGuideHorizontalLine(g.horizontalLine.top, viewPosition.column), -1, -1);
                        }
                        else if (p.lineNumber < viewLineInfo.modelLineWrappedLineIdx) {
                            return undefined;
                        }
                        else {
                            if (g.visibleColumn !== -1) {
                                // Don't repeat horizontal lines that use visibleColumn for unrelated lines.
                                return undefined;
                            }
                            return new textModelGuides_1.IndentGuide(g.visibleColumn, column, g.className, new textModelGuides_1.IndentGuideHorizontalLine(g.horizontalLine.top, this.getMaxColumnOfViewLine(viewLineInfo)), -1, -1);
                        }
                    });
                    resultPerViewLine.push(result.filter((r) => !!r));
                }
            }
            return resultPerViewLine;
        }
        getViewLinesIndentGuides(viewStartLineNumber, viewEndLineNumber) {
            // TODO: Use the same code as in `getViewLinesBracketGuides`.
            // Future TODO: Merge with `getViewLinesBracketGuides`.
            // However, this requires more refactoring of indent guides.
            viewStartLineNumber = this._toValidViewLineNumber(viewStartLineNumber);
            viewEndLineNumber = this._toValidViewLineNumber(viewEndLineNumber);
            const modelStart = this.convertViewPositionToModelPosition(viewStartLineNumber, this.getViewLineMinColumn(viewStartLineNumber));
            const modelEnd = this.convertViewPositionToModelPosition(viewEndLineNumber, this.getViewLineMaxColumn(viewEndLineNumber));
            let result = [];
            const resultRepeatCount = [];
            const resultRepeatOption = [];
            const modelStartLineIndex = modelStart.lineNumber - 1;
            const modelEndLineIndex = modelEnd.lineNumber - 1;
            let reqStart = null;
            for (let modelLineIndex = modelStartLineIndex; modelLineIndex <= modelEndLineIndex; modelLineIndex++) {
                const line = this.modelLineProjections[modelLineIndex];
                if (line.isVisible()) {
                    const viewLineStartIndex = line.getViewLineNumberOfModelPosition(0, modelLineIndex === modelStartLineIndex ? modelStart.column : 1);
                    const viewLineEndIndex = line.getViewLineNumberOfModelPosition(0, this.model.getLineMaxColumn(modelLineIndex + 1));
                    const count = viewLineEndIndex - viewLineStartIndex + 1;
                    let option = 0 /* IndentGuideRepeatOption.BlockNone */;
                    if (count > 1 && line.getViewLineMinColumn(this.model, modelLineIndex + 1, viewLineEndIndex) === 1) {
                        // wrapped lines should block indent guides
                        option = (viewLineStartIndex === 0 ? 1 /* IndentGuideRepeatOption.BlockSubsequent */ : 2 /* IndentGuideRepeatOption.BlockAll */);
                    }
                    resultRepeatCount.push(count);
                    resultRepeatOption.push(option);
                    // merge into previous request
                    if (reqStart === null) {
                        reqStart = new position_1.Position(modelLineIndex + 1, 0);
                    }
                }
                else {
                    // hit invisible line => flush request
                    if (reqStart !== null) {
                        result = result.concat(this.model.guides.getLinesIndentGuides(reqStart.lineNumber, modelLineIndex));
                        reqStart = null;
                    }
                }
            }
            if (reqStart !== null) {
                result = result.concat(this.model.guides.getLinesIndentGuides(reqStart.lineNumber, modelEnd.lineNumber));
                reqStart = null;
            }
            const viewLineCount = viewEndLineNumber - viewStartLineNumber + 1;
            const viewIndents = new Array(viewLineCount);
            let currIndex = 0;
            for (let i = 0, len = result.length; i < len; i++) {
                let value = result[i];
                const count = Math.min(viewLineCount - currIndex, resultRepeatCount[i]);
                const option = resultRepeatOption[i];
                let blockAtIndex;
                if (option === 2 /* IndentGuideRepeatOption.BlockAll */) {
                    blockAtIndex = 0;
                }
                else if (option === 1 /* IndentGuideRepeatOption.BlockSubsequent */) {
                    blockAtIndex = 1;
                }
                else {
                    blockAtIndex = count;
                }
                for (let j = 0; j < count; j++) {
                    if (j === blockAtIndex) {
                        value = 0;
                    }
                    viewIndents[currIndex++] = value;
                }
            }
            return viewIndents;
        }
        getViewLineContent(viewLineNumber) {
            const info = this.getViewLineInfo(viewLineNumber);
            return this.modelLineProjections[info.modelLineNumber - 1].getViewLineContent(this.model, info.modelLineNumber, info.modelLineWrappedLineIdx);
        }
        getViewLineLength(viewLineNumber) {
            const info = this.getViewLineInfo(viewLineNumber);
            return this.modelLineProjections[info.modelLineNumber - 1].getViewLineLength(this.model, info.modelLineNumber, info.modelLineWrappedLineIdx);
        }
        getViewLineMinColumn(viewLineNumber) {
            const info = this.getViewLineInfo(viewLineNumber);
            return this.modelLineProjections[info.modelLineNumber - 1].getViewLineMinColumn(this.model, info.modelLineNumber, info.modelLineWrappedLineIdx);
        }
        getViewLineMaxColumn(viewLineNumber) {
            const info = this.getViewLineInfo(viewLineNumber);
            return this.modelLineProjections[info.modelLineNumber - 1].getViewLineMaxColumn(this.model, info.modelLineNumber, info.modelLineWrappedLineIdx);
        }
        getViewLineData(viewLineNumber) {
            const info = this.getViewLineInfo(viewLineNumber);
            return this.modelLineProjections[info.modelLineNumber - 1].getViewLineData(this.model, info.modelLineNumber, info.modelLineWrappedLineIdx);
        }
        getViewLinesData(viewStartLineNumber, viewEndLineNumber, needed) {
            viewStartLineNumber = this._toValidViewLineNumber(viewStartLineNumber);
            viewEndLineNumber = this._toValidViewLineNumber(viewEndLineNumber);
            const start = this.projectedModelLineLineCounts.getIndexOf(viewStartLineNumber - 1);
            let viewLineNumber = viewStartLineNumber;
            const startModelLineIndex = start.index;
            const startRemainder = start.remainder;
            const result = [];
            for (let modelLineIndex = startModelLineIndex, len = this.model.getLineCount(); modelLineIndex < len; modelLineIndex++) {
                const line = this.modelLineProjections[modelLineIndex];
                if (!line.isVisible()) {
                    continue;
                }
                const fromViewLineIndex = (modelLineIndex === startModelLineIndex ? startRemainder : 0);
                let remainingViewLineCount = line.getViewLineCount() - fromViewLineIndex;
                let lastLine = false;
                if (viewLineNumber + remainingViewLineCount > viewEndLineNumber) {
                    lastLine = true;
                    remainingViewLineCount = viewEndLineNumber - viewLineNumber + 1;
                }
                line.getViewLinesData(this.model, modelLineIndex + 1, fromViewLineIndex, remainingViewLineCount, viewLineNumber - viewStartLineNumber, needed, result);
                viewLineNumber += remainingViewLineCount;
                if (lastLine) {
                    break;
                }
            }
            return result;
        }
        validateViewPosition(viewLineNumber, viewColumn, expectedModelPosition) {
            viewLineNumber = this._toValidViewLineNumber(viewLineNumber);
            const r = this.projectedModelLineLineCounts.getIndexOf(viewLineNumber - 1);
            const lineIndex = r.index;
            const remainder = r.remainder;
            const line = this.modelLineProjections[lineIndex];
            const minColumn = line.getViewLineMinColumn(this.model, lineIndex + 1, remainder);
            const maxColumn = line.getViewLineMaxColumn(this.model, lineIndex + 1, remainder);
            if (viewColumn < minColumn) {
                viewColumn = minColumn;
            }
            if (viewColumn > maxColumn) {
                viewColumn = maxColumn;
            }
            const computedModelColumn = line.getModelColumnOfViewPosition(remainder, viewColumn);
            const computedModelPosition = this.model.validatePosition(new position_1.Position(lineIndex + 1, computedModelColumn));
            if (computedModelPosition.equals(expectedModelPosition)) {
                return new position_1.Position(viewLineNumber, viewColumn);
            }
            return this.convertModelPositionToViewPosition(expectedModelPosition.lineNumber, expectedModelPosition.column);
        }
        validateViewRange(viewRange, expectedModelRange) {
            const validViewStart = this.validateViewPosition(viewRange.startLineNumber, viewRange.startColumn, expectedModelRange.getStartPosition());
            const validViewEnd = this.validateViewPosition(viewRange.endLineNumber, viewRange.endColumn, expectedModelRange.getEndPosition());
            return new range_1.Range(validViewStart.lineNumber, validViewStart.column, validViewEnd.lineNumber, validViewEnd.column);
        }
        convertViewPositionToModelPosition(viewLineNumber, viewColumn) {
            const info = this.getViewLineInfo(viewLineNumber);
            const inputColumn = this.modelLineProjections[info.modelLineNumber - 1].getModelColumnOfViewPosition(info.modelLineWrappedLineIdx, viewColumn);
            // console.log('out -> in ' + viewLineNumber + ',' + viewColumn + ' ===> ' + (lineIndex+1) + ',' + inputColumn);
            return this.model.validatePosition(new position_1.Position(info.modelLineNumber, inputColumn));
        }
        convertViewRangeToModelRange(viewRange) {
            const start = this.convertViewPositionToModelPosition(viewRange.startLineNumber, viewRange.startColumn);
            const end = this.convertViewPositionToModelPosition(viewRange.endLineNumber, viewRange.endColumn);
            return new range_1.Range(start.lineNumber, start.column, end.lineNumber, end.column);
        }
        convertModelPositionToViewPosition(_modelLineNumber, _modelColumn, affinity = 2 /* PositionAffinity.None */, allowZeroLineNumber = false, belowHiddenRanges = false) {
            const validPosition = this.model.validatePosition(new position_1.Position(_modelLineNumber, _modelColumn));
            const inputLineNumber = validPosition.lineNumber;
            const inputColumn = validPosition.column;
            let lineIndex = inputLineNumber - 1, lineIndexChanged = false;
            if (belowHiddenRanges) {
                while (lineIndex < this.modelLineProjections.length && !this.modelLineProjections[lineIndex].isVisible()) {
                    lineIndex++;
                    lineIndexChanged = true;
                }
            }
            else {
                while (lineIndex > 0 && !this.modelLineProjections[lineIndex].isVisible()) {
                    lineIndex--;
                    lineIndexChanged = true;
                }
            }
            if (lineIndex === 0 && !this.modelLineProjections[lineIndex].isVisible()) {
                // Could not reach a real line
                // console.log('in -> out ' + inputLineNumber + ',' + inputColumn + ' ===> ' + 1 + ',' + 1);
                // TODO@alexdima@hediet this isn't soo pretty
                return new position_1.Position(allowZeroLineNumber ? 0 : 1, 1);
            }
            const deltaLineNumber = 1 + this.projectedModelLineLineCounts.getPrefixSum(lineIndex);
            let r;
            if (lineIndexChanged) {
                if (belowHiddenRanges) {
                    r = this.modelLineProjections[lineIndex].getViewPositionOfModelPosition(deltaLineNumber, 1, affinity);
                }
                else {
                    r = this.modelLineProjections[lineIndex].getViewPositionOfModelPosition(deltaLineNumber, this.model.getLineMaxColumn(lineIndex + 1), affinity);
                }
            }
            else {
                r = this.modelLineProjections[inputLineNumber - 1].getViewPositionOfModelPosition(deltaLineNumber, inputColumn, affinity);
            }
            // console.log('in -> out ' + inputLineNumber + ',' + inputColumn + ' ===> ' + r.lineNumber + ',' + r);
            return r;
        }
        /**
         * @param affinity The affinity in case of an empty range. Has no effect for non-empty ranges.
        */
        convertModelRangeToViewRange(modelRange, affinity = 0 /* PositionAffinity.Left */) {
            if (modelRange.isEmpty()) {
                const start = this.convertModelPositionToViewPosition(modelRange.startLineNumber, modelRange.startColumn, affinity);
                return range_1.Range.fromPositions(start);
            }
            else {
                const start = this.convertModelPositionToViewPosition(modelRange.startLineNumber, modelRange.startColumn, 1 /* PositionAffinity.Right */);
                const end = this.convertModelPositionToViewPosition(modelRange.endLineNumber, modelRange.endColumn, 0 /* PositionAffinity.Left */);
                return new range_1.Range(start.lineNumber, start.column, end.lineNumber, end.column);
            }
        }
        getViewLineNumberOfModelPosition(modelLineNumber, modelColumn) {
            let lineIndex = modelLineNumber - 1;
            if (this.modelLineProjections[lineIndex].isVisible()) {
                // this model line is visible
                const deltaLineNumber = 1 + this.projectedModelLineLineCounts.getPrefixSum(lineIndex);
                return this.modelLineProjections[lineIndex].getViewLineNumberOfModelPosition(deltaLineNumber, modelColumn);
            }
            // this model line is not visible
            while (lineIndex > 0 && !this.modelLineProjections[lineIndex].isVisible()) {
                lineIndex--;
            }
            if (lineIndex === 0 && !this.modelLineProjections[lineIndex].isVisible()) {
                // Could not reach a real line
                return 1;
            }
            const deltaLineNumber = 1 + this.projectedModelLineLineCounts.getPrefixSum(lineIndex);
            return this.modelLineProjections[lineIndex].getViewLineNumberOfModelPosition(deltaLineNumber, this.model.getLineMaxColumn(lineIndex + 1));
        }
        getDecorationsInRange(range, ownerId, filterOutValidation, onlyMinimapDecorations, onlyMarginDecorations) {
            const modelStart = this.convertViewPositionToModelPosition(range.startLineNumber, range.startColumn);
            const modelEnd = this.convertViewPositionToModelPosition(range.endLineNumber, range.endColumn);
            if (modelEnd.lineNumber - modelStart.lineNumber <= range.endLineNumber - range.startLineNumber) {
                // most likely there are no hidden lines => fast path
                // fetch decorations from column 1 to cover the case of wrapped lines that have whole line decorations at column 1
                return this.model.getDecorationsInRange(new range_1.Range(modelStart.lineNumber, 1, modelEnd.lineNumber, modelEnd.column), ownerId, filterOutValidation, onlyMinimapDecorations, onlyMarginDecorations);
            }
            let result = [];
            const modelStartLineIndex = modelStart.lineNumber - 1;
            const modelEndLineIndex = modelEnd.lineNumber - 1;
            let reqStart = null;
            for (let modelLineIndex = modelStartLineIndex; modelLineIndex <= modelEndLineIndex; modelLineIndex++) {
                const line = this.modelLineProjections[modelLineIndex];
                if (line.isVisible()) {
                    // merge into previous request
                    if (reqStart === null) {
                        reqStart = new position_1.Position(modelLineIndex + 1, modelLineIndex === modelStartLineIndex ? modelStart.column : 1);
                    }
                }
                else {
                    // hit invisible line => flush request
                    if (reqStart !== null) {
                        const maxLineColumn = this.model.getLineMaxColumn(modelLineIndex);
                        result = result.concat(this.model.getDecorationsInRange(new range_1.Range(reqStart.lineNumber, reqStart.column, modelLineIndex, maxLineColumn), ownerId, filterOutValidation, onlyMinimapDecorations));
                        reqStart = null;
                    }
                }
            }
            if (reqStart !== null) {
                result = result.concat(this.model.getDecorationsInRange(new range_1.Range(reqStart.lineNumber, reqStart.column, modelEnd.lineNumber, modelEnd.column), ownerId, filterOutValidation, onlyMinimapDecorations));
                reqStart = null;
            }
            result.sort((a, b) => {
                const res = range_1.Range.compareRangesUsingStarts(a.range, b.range);
                if (res === 0) {
                    if (a.id < b.id) {
                        return -1;
                    }
                    if (a.id > b.id) {
                        return 1;
                    }
                    return 0;
                }
                return res;
            });
            // Eliminate duplicate decorations that might have intersected our visible ranges multiple times
            const finalResult = [];
            let finalResultLen = 0;
            let prevDecId = null;
            for (const dec of result) {
                const decId = dec.id;
                if (prevDecId === decId) {
                    // skip
                    continue;
                }
                prevDecId = decId;
                finalResult[finalResultLen++] = dec;
            }
            return finalResult;
        }
        getInjectedTextAt(position) {
            const info = this.getViewLineInfo(position.lineNumber);
            return this.modelLineProjections[info.modelLineNumber - 1].getInjectedTextAt(info.modelLineWrappedLineIdx, position.column);
        }
        normalizePosition(position, affinity) {
            const info = this.getViewLineInfo(position.lineNumber);
            return this.modelLineProjections[info.modelLineNumber - 1].normalizePosition(info.modelLineWrappedLineIdx, position, affinity);
        }
        getLineIndentColumn(lineNumber) {
            const info = this.getViewLineInfo(lineNumber);
            if (info.modelLineWrappedLineIdx === 0) {
                return this.model.getLineIndentColumn(info.modelLineNumber);
            }
            // wrapped lines have no indentation.
            // We deliberately don't handle the case that indentation is wrapped
            // to avoid two view lines reporting indentation for the very same model line.
            return 0;
        }
    }
    exports.ViewModelLinesFromProjectedModel = ViewModelLinesFromProjectedModel;
    /**
     * Overlapping unsorted ranges:
     * [   )      [ )       [  )
     *    [    )      [       )
     * ->
     * Non overlapping sorted ranges:
     * [       )  [ ) [        )
     *
     * Note: This function only considers line information! Columns are ignored.
    */
    function normalizeLineRanges(ranges) {
        if (ranges.length === 0) {
            return [];
        }
        const sortedRanges = ranges.slice();
        sortedRanges.sort(range_1.Range.compareRangesUsingStarts);
        const result = [];
        let currentRangeStart = sortedRanges[0].startLineNumber;
        let currentRangeEnd = sortedRanges[0].endLineNumber;
        for (let i = 1, len = sortedRanges.length; i < len; i++) {
            const range = sortedRanges[i];
            if (range.startLineNumber > currentRangeEnd + 1) {
                result.push(new range_1.Range(currentRangeStart, 1, currentRangeEnd, 1));
                currentRangeStart = range.startLineNumber;
                currentRangeEnd = range.endLineNumber;
            }
            else if (range.endLineNumber > currentRangeEnd) {
                currentRangeEnd = range.endLineNumber;
            }
        }
        result.push(new range_1.Range(currentRangeStart, 1, currentRangeEnd, 1));
        return result;
    }
    /**
     * Represents a view line. Can be used to efficiently query more information about it.
     */
    class ViewLineInfo {
        get isWrappedLineContinuation() {
            return this.modelLineWrappedLineIdx > 0;
        }
        constructor(modelLineNumber, modelLineWrappedLineIdx) {
            this.modelLineNumber = modelLineNumber;
            this.modelLineWrappedLineIdx = modelLineWrappedLineIdx;
        }
    }
    /**
     * A list of view lines that have a contiguous span in the model.
    */
    class ViewLineInfoGroupedByModelRange {
        constructor(modelRange, viewLines) {
            this.modelRange = modelRange;
            this.viewLines = viewLines;
        }
    }
    class CoordinatesConverter {
        constructor(lines) {
            this._lines = lines;
        }
        // View -> Model conversion and related methods
        convertViewPositionToModelPosition(viewPosition) {
            return this._lines.convertViewPositionToModelPosition(viewPosition.lineNumber, viewPosition.column);
        }
        convertViewRangeToModelRange(viewRange) {
            return this._lines.convertViewRangeToModelRange(viewRange);
        }
        validateViewPosition(viewPosition, expectedModelPosition) {
            return this._lines.validateViewPosition(viewPosition.lineNumber, viewPosition.column, expectedModelPosition);
        }
        validateViewRange(viewRange, expectedModelRange) {
            return this._lines.validateViewRange(viewRange, expectedModelRange);
        }
        // Model -> View conversion and related methods
        convertModelPositionToViewPosition(modelPosition, affinity, allowZero, belowHiddenRanges) {
            return this._lines.convertModelPositionToViewPosition(modelPosition.lineNumber, modelPosition.column, affinity, allowZero, belowHiddenRanges);
        }
        convertModelRangeToViewRange(modelRange, affinity) {
            return this._lines.convertModelRangeToViewRange(modelRange, affinity);
        }
        modelPositionIsVisible(modelPosition) {
            return this._lines.modelPositionIsVisible(modelPosition.lineNumber, modelPosition.column);
        }
        getModelLineViewLineCount(modelLineNumber) {
            return this._lines.getModelLineViewLineCount(modelLineNumber);
        }
        getViewLineNumberOfModelPosition(modelLineNumber, modelColumn) {
            return this._lines.getViewLineNumberOfModelPosition(modelLineNumber, modelColumn);
        }
    }
    var IndentGuideRepeatOption;
    (function (IndentGuideRepeatOption) {
        IndentGuideRepeatOption[IndentGuideRepeatOption["BlockNone"] = 0] = "BlockNone";
        IndentGuideRepeatOption[IndentGuideRepeatOption["BlockSubsequent"] = 1] = "BlockSubsequent";
        IndentGuideRepeatOption[IndentGuideRepeatOption["BlockAll"] = 2] = "BlockAll";
    })(IndentGuideRepeatOption || (IndentGuideRepeatOption = {}));
    class ViewModelLinesFromModelAsIs {
        constructor(model) {
            this.model = model;
        }
        dispose() {
        }
        createCoordinatesConverter() {
            return new IdentityCoordinatesConverter(this);
        }
        getHiddenAreas() {
            return [];
        }
        setHiddenAreas(_ranges) {
            return false;
        }
        setTabSize(_newTabSize) {
            return false;
        }
        setWrappingSettings(_fontInfo, _wrappingStrategy, _wrappingColumn, _wrappingIndent) {
            return false;
        }
        createLineBreaksComputer() {
            const result = [];
            return {
                addRequest: (lineText, injectedText, previousLineBreakData) => {
                    result.push(null);
                },
                finalize: () => {
                    return result;
                }
            };
        }
        onModelFlushed() {
        }
        onModelLinesDeleted(_versionId, fromLineNumber, toLineNumber) {
            return new viewEvents.ViewLinesDeletedEvent(fromLineNumber, toLineNumber);
        }
        onModelLinesInserted(_versionId, fromLineNumber, toLineNumber, lineBreaks) {
            return new viewEvents.ViewLinesInsertedEvent(fromLineNumber, toLineNumber);
        }
        onModelLineChanged(_versionId, lineNumber, lineBreakData) {
            return [false, new viewEvents.ViewLinesChangedEvent(lineNumber, 1), null, null];
        }
        acceptVersionId(_versionId) {
        }
        getViewLineCount() {
            return this.model.getLineCount();
        }
        getActiveIndentGuide(viewLineNumber, _minLineNumber, _maxLineNumber) {
            return {
                startLineNumber: viewLineNumber,
                endLineNumber: viewLineNumber,
                indent: 0
            };
        }
        getViewLinesBracketGuides(startLineNumber, endLineNumber, activePosition) {
            return new Array(endLineNumber - startLineNumber + 1).fill([]);
        }
        getViewLinesIndentGuides(viewStartLineNumber, viewEndLineNumber) {
            const viewLineCount = viewEndLineNumber - viewStartLineNumber + 1;
            const result = new Array(viewLineCount);
            for (let i = 0; i < viewLineCount; i++) {
                result[i] = 0;
            }
            return result;
        }
        getViewLineContent(viewLineNumber) {
            return this.model.getLineContent(viewLineNumber);
        }
        getViewLineLength(viewLineNumber) {
            return this.model.getLineLength(viewLineNumber);
        }
        getViewLineMinColumn(viewLineNumber) {
            return this.model.getLineMinColumn(viewLineNumber);
        }
        getViewLineMaxColumn(viewLineNumber) {
            return this.model.getLineMaxColumn(viewLineNumber);
        }
        getViewLineData(viewLineNumber) {
            const lineTokens = this.model.tokenization.getLineTokens(viewLineNumber);
            const lineContent = lineTokens.getLineContent();
            return new viewModel_1.ViewLineData(lineContent, false, 1, lineContent.length + 1, 0, lineTokens.inflate(), null);
        }
        getViewLinesData(viewStartLineNumber, viewEndLineNumber, needed) {
            const lineCount = this.model.getLineCount();
            viewStartLineNumber = Math.min(Math.max(1, viewStartLineNumber), lineCount);
            viewEndLineNumber = Math.min(Math.max(1, viewEndLineNumber), lineCount);
            const result = [];
            for (let lineNumber = viewStartLineNumber; lineNumber <= viewEndLineNumber; lineNumber++) {
                const idx = lineNumber - viewStartLineNumber;
                result[idx] = needed[idx] ? this.getViewLineData(lineNumber) : null;
            }
            return result;
        }
        getDecorationsInRange(range, ownerId, filterOutValidation, onlyMinimapDecorations, onlyMarginDecorations) {
            return this.model.getDecorationsInRange(range, ownerId, filterOutValidation, onlyMinimapDecorations, onlyMarginDecorations);
        }
        normalizePosition(position, affinity) {
            return this.model.normalizePosition(position, affinity);
        }
        getLineIndentColumn(lineNumber) {
            return this.model.getLineIndentColumn(lineNumber);
        }
        getInjectedTextAt(position) {
            // Identity lines collection does not support injected text.
            return null;
        }
    }
    exports.ViewModelLinesFromModelAsIs = ViewModelLinesFromModelAsIs;
    class IdentityCoordinatesConverter {
        constructor(lines) {
            this._lines = lines;
        }
        _validPosition(pos) {
            return this._lines.model.validatePosition(pos);
        }
        _validRange(range) {
            return this._lines.model.validateRange(range);
        }
        // View -> Model conversion and related methods
        convertViewPositionToModelPosition(viewPosition) {
            return this._validPosition(viewPosition);
        }
        convertViewRangeToModelRange(viewRange) {
            return this._validRange(viewRange);
        }
        validateViewPosition(_viewPosition, expectedModelPosition) {
            return this._validPosition(expectedModelPosition);
        }
        validateViewRange(_viewRange, expectedModelRange) {
            return this._validRange(expectedModelRange);
        }
        // Model -> View conversion and related methods
        convertModelPositionToViewPosition(modelPosition) {
            return this._validPosition(modelPosition);
        }
        convertModelRangeToViewRange(modelRange) {
            return this._validRange(modelRange);
        }
        modelPositionIsVisible(modelPosition) {
            const lineCount = this._lines.model.getLineCount();
            if (modelPosition.lineNumber < 1 || modelPosition.lineNumber > lineCount) {
                // invalid arguments
                return false;
            }
            return true;
        }
        getModelLineViewLineCount(modelLineNumber) {
            return 1;
        }
        getViewLineNumberOfModelPosition(modelLineNumber, modelColumn) {
            return modelLineNumber;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld01vZGVsTGluZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL3ZpZXdNb2RlbC92aWV3TW9kZWxMaW5lcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF3RGhHLE1BQWEsZ0NBQWdDO1FBd0I1QyxZQUNDLFFBQWdCLEVBQ2hCLEtBQWlCLEVBQ2pCLDRCQUF3RCxFQUN4RCxrQ0FBOEQsRUFDOUQsUUFBa0IsRUFDbEIsT0FBZSxFQUNmLGdCQUF1QyxFQUN2QyxjQUFzQixFQUN0QixjQUE4QixFQUM5QixTQUErQjtZQUUvQixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztZQUMxQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxDQUFDLDZCQUE2QixHQUFHLDRCQUE0QixDQUFDO1lBQ2xFLElBQUksQ0FBQyxtQ0FBbUMsR0FBRyxrQ0FBa0MsQ0FBQztZQUM5RSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztZQUN6QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUN2QixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7WUFDekMsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7WUFDckMsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7WUFDckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7WUFFM0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVNLE9BQU87WUFDYixJQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMs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