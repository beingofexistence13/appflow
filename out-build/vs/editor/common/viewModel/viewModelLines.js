/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/textModelGuides", "vs/editor/common/model/textModel", "vs/editor/common/textModelEvents", "vs/editor/common/viewEvents", "vs/editor/common/viewModel/modelLineProjection", "vs/editor/common/model/prefixSumComputer", "vs/editor/common/viewModel"], function (require, exports, arrays, position_1, range_1, textModelGuides_1, textModel_1, textModelEvents_1, viewEvents, modelLineProjection_1, prefixSumComputer_1, viewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lY = exports.$kY = void 0;
    class $kY {
        constructor(editorId, model, domLineBreaksComputerFactory, monospaceLineBreaksComputerFactory, fontInfo, tabSize, wrappingStrategy, wrappingColumn, wrappingIndent, wordBreak) {
            this.c = editorId;
            this.d = model;
            this.e = -1;
            this.f = domLineBreaksComputerFactory;
            this.h = monospaceLineBreaksComputerFactory;
            this.k = fontInfo;
            this.l = tabSize;
            this.q = wrappingStrategy;
            this.m = wrappingColumn;
            this.n = wrappingIndent;
            this.o = wordBreak;
            this.w(/*resetHiddenAreas*/ true, null);
        }
        dispose() {
            this.v = this.d.deltaDecorations(this.v, []);
        }
        createCoordinatesConverter() {
            return new CoordinatesConverter(this);
        }
        w(resetHiddenAreas, previousLineBreaks) {
            this.s = [];
            if (resetHiddenAreas) {
                this.v = this.d.deltaDecorations(this.v, []);
            }
            const linesContent = this.d.getLinesContent();
            const injectedTextDecorations = this.d.getInjectedTextDecorations(this.c);
            const lineCount = linesContent.length;
            const lineBreaksComputer = this.createLineBreaksComputer();
            const injectedTextQueue = new arrays.$0b(textModelEvents_1.$ku.fromDecorations(injectedTextDecorations));
            for (let i = 0; i < lineCount; i++) {
                const lineInjectedText = injectedTextQueue.takeWhile(t => t.lineNumber === i + 1);
                lineBreaksComputer.addRequest(linesContent[i], lineInjectedText, previousLineBreaks ? previousLineBreaks[i] : null);
            }
            const linesBreaks = lineBreaksComputer.finalize();
            const values = [];
            const hiddenAreas = this.v.map((areaId) => this.d.getDecorationRange(areaId)).sort(range_1.$ks.compareRangesUsingStarts);
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
                const line = (0, modelLineProjection_1.$jY)(linesBreaks[i], !isInHiddenArea);
                values[i] = line.getViewLineCount();
                this.s[i] = line;
            }
            this.e = this.d.getVersionId();
            this.u = new prefixSumComputer_1.$Ku(values);
        }
        getHiddenAreas() {
            return this.v.map((decId) => this.d.getDecorationRange(decId));
        }
        setHiddenAreas(_ranges) {
            const validatedRanges = _ranges.map(r => this.d.validateRange(r));
            const newRanges = normalizeLineRanges(validatedRanges);
            // TODO@Martin: Please stop calling this method on each model change!
            // This checks if there really was a change
            const oldRanges = this.v.map((areaId) => this.d.getDecorationRange(areaId)).sort(range_1.$ks.compareRangesUsingStarts);
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
                options: textModel_1.$RC.EMPTY,
            }));
            this.v = this.d.deltaDecorations(this.v, newDecorations);
            const hiddenAreas = newRanges;
            let hiddenAreaStart = 1, hiddenAreaEnd = 0;
            let hiddenAreaIdx = -1;
            let nextLineNumberToUpdateHiddenArea = (hiddenAreaIdx + 1 < hiddenAreas.length) ? hiddenAreaEnd + 1 : this.s.length + 2;
            let hasVisibleLine = false;
            for (let i = 0; i < this.s.length; i++) {
                const lineNumber = i + 1;
                if (lineNumber === nextLineNumberToUpdateHiddenArea) {
                    hiddenAreaIdx++;
                    hiddenAreaStart = hiddenAreas[hiddenAreaIdx].startLineNumber;
                    hiddenAreaEnd = hiddenAreas[hiddenAreaIdx].endLineNumber;
                    nextLineNumberToUpdateHiddenArea = (hiddenAreaIdx + 1 < hiddenAreas.length) ? hiddenAreaEnd + 1 : this.s.length + 2;
                }
                let lineChanged = false;
                if (lineNumber >= hiddenAreaStart && lineNumber <= hiddenAreaEnd) {
                    // Line should be hidden
                    if (this.s[i].isVisible()) {
                        this.s[i] = this.s[i].setVisible(false);
                        lineChanged = true;
                    }
                }
                else {
                    hasVisibleLine = true;
                    // Line should be visible
                    if (!this.s[i].isVisible()) {
                        this.s[i] = this.s[i].setVisible(true);
                        lineChanged = true;
                    }
                }
                if (lineChanged) {
                    const newOutputLineCount = this.s[i].getViewLineCount();
                    this.u.setValue(i, newOutputLineCount);
                }
            }
            if (!hasVisibleLine) {
                // Cannot have everything be hidden => reveal everything!
                this.setHiddenAreas([]);
            }
            return true;
        }
        modelPositionIsVisible(modelLineNumber, _modelColumn) {
            if (modelLineNumber < 1 || modelLineNumber > this.s.length) {
                // invalid arguments
                return false;
            }
            return this.s[modelLineNumber - 1].isVisible();
        }
        getModelLineViewLineCount(modelLineNumber) {
            if (modelLineNumber < 1 || modelLineNumber > this.s.length) {
                // invalid arguments
                return 1;
            }
            return this.s[modelLineNumber - 1].getViewLineCount();
        }
        setTabSize(newTabSize) {
            if (this.l === newTabSize) {
                return false;
            }
            this.l = newTabSize;
            this.w(/*resetHiddenAreas*/ false, null);
            return true;
        }
        setWrappingSettings(fontInfo, wrappingStrategy, wrappingColumn, wrappingIndent, wordBreak) {
            const equalFontInfo = this.k.equals(fontInfo);
            const equalWrappingStrategy = (this.q === wrappingStrategy);
            const equalWrappingColumn = (this.m === wrappingColumn);
            const equalWrappingIndent = (this.n === wrappingIndent);
            const equalWordBreak = (this.o === wordBreak);
            if (equalFontInfo && equalWrappingStrategy && equalWrappingColumn && equalWrappingIndent && equalWordBreak) {
                return false;
            }
            const onlyWrappingColumnChanged = (equalFontInfo && equalWrappingStrategy && !equalWrappingColumn && equalWrappingIndent && equalWordBreak);
            this.k = fontInfo;
            this.q = wrappingStrategy;
            this.m = wrappingColumn;
            this.n = wrappingIndent;
            this.o = wordBreak;
            let previousLineBreaks = null;
            if (onlyWrappingColumnChanged) {
                previousLineBreaks = [];
                for (let i = 0, len = this.s.length; i < len; i++) {
                    previousLineBreaks[i] = this.s[i].getProjectionData();
                }
            }
            this.w(/*resetHiddenAreas*/ false, previousLineBreaks);
            return true;
        }
        createLineBreaksComputer() {
            const lineBreaksComputerFactory = (this.q === 'advanced'
                ? this.f
                : this.h);
            return lineBreaksComputerFactory.createLineBreaksComputer(this.k, this.l, this.m, this.n, this.o);
        }
        onModelFlushed() {
            this.w(/*resetHiddenAreas*/ true, null);
        }
        onModelLinesDeleted(versionId, fromLineNumber, toLineNumber) {
            if (!versionId || versionId <= this.e) {
                // Here we check for versionId in case the lines were reconstructed in the meantime.
                // We don't want to apply stale change events on top of a newer read model state.
                return null;
            }
            const outputFromLineNumber = (fromLineNumber === 1 ? 1 : this.u.getPrefixSum(fromLineNumber - 1) + 1);
            const outputToLineNumber = this.u.getPrefixSum(toLineNumber);
            this.s.splice(fromLineNumber - 1, toLineNumber - fromLineNumber + 1);
            this.u.removeValues(fromLineNumber - 1, toLineNumber - fromLineNumber + 1);
            return new viewEvents.$1U(outputFromLineNumber, outputToLineNumber);
        }
        onModelLinesInserted(versionId, fromLineNumber, _toLineNumber, lineBreaks) {
            if (!versionId || versionId <= this.e) {
                // Here we check for versionId in case the lines were reconstructed in the meantime.
                // We don't want to apply stale change events on top of a newer read model state.
                return null;
            }
            // cannot use this.getHiddenAreas() because those decorations have already seen the effect of this model change
            const isInHiddenArea = (fromLineNumber > 2 && !this.s[fromLineNumber - 2].isVisible());
            const outputFromLineNumber = (fromLineNumber === 1 ? 1 : this.u.getPrefixSum(fromLineNumber - 1) + 1);
            let totalOutputLineCount = 0;
            const insertLines = [];
            const insertPrefixSumValues = [];
            for (let i = 0, len = lineBreaks.length; i < len; i++) {
                const line = (0, modelLineProjection_1.$jY)(lineBreaks[i], !isInHiddenArea);
                insertLines.push(line);
                const outputLineCount = line.getViewLineCount();
                totalOutputLineCount += outputLineCount;
                insertPrefixSumValues[i] = outputLineCount;
            }
            // TODO@Alex: use arrays.arrayInsert
            this.s =
                this.s.slice(0, fromLineNumber - 1)
                    .concat(insertLines)
                    .concat(this.s.slice(fromLineNumber - 1));
            this.u.insertValues(fromLineNumber - 1, insertPrefixSumValues);
            return new viewEvents.$2U(outputFromLineNumber, outputFromLineNumber + totalOutputLineCount - 1);
        }
        onModelLineChanged(versionId, lineNumber, lineBreakData) {
            if (versionId !== null && versionId <= this.e) {
                // Here we check for versionId in case the lines were reconstructed in the meantime.
                // We don't want to apply stale change events on top of a newer read model state.
                return [false, null, null, null];
            }
            const lineIndex = lineNumber - 1;
            const oldOutputLineCount = this.s[lineIndex].getViewLineCount();
            const isVisible = this.s[lineIndex].isVisible();
            const line = (0, modelLineProjection_1.$jY)(lineBreakData, isVisible);
            this.s[lineIndex] = line;
            const newOutputLineCount = this.s[lineIndex].getViewLineCount();
            let lineMappingChanged = false;
            let changeFrom = 0;
            let changeTo = -1;
            let insertFrom = 0;
            let insertTo = -1;
            let deleteFrom = 0;
            let deleteTo = -1;
            if (oldOutputLineCount > newOutputLineCount) {
                changeFrom = this.u.getPrefixSum(lineNumber - 1) + 1;
                changeTo = changeFrom + newOutputLineCount - 1;
                deleteFrom = changeTo + 1;
                deleteTo = deleteFrom + (oldOutputLineCount - newOutputLineCount) - 1;
                lineMappingChanged = true;
            }
            else if (oldOutputLineCount < newOutputLineCount) {
                changeFrom = this.u.getPrefixSum(lineNumber - 1) + 1;
                changeTo = changeFrom + oldOutputLineCount - 1;
                insertFrom = changeTo + 1;
                insertTo = insertFrom + (newOutputLineCount - oldOutputLineCount) - 1;
                lineMappingChanged = true;
            }
            else {
                changeFrom = this.u.getPrefixSum(lineNumber - 1) + 1;
                changeTo = changeFrom + newOutputLineCount - 1;
            }
            this.u.setValue(lineIndex, newOutputLineCount);
            const viewLinesChangedEvent = (changeFrom <= changeTo ? new viewEvents.$ZU(changeFrom, changeTo - changeFrom + 1) : null);
            const viewLinesInsertedEvent = (insertFrom <= insertTo ? new viewEvents.$2U(insertFrom, insertTo) : null);
            const viewLinesDeletedEvent = (deleteFrom <= deleteTo ? new viewEvents.$1U(deleteFrom, deleteTo) : null);
            return [lineMappingChanged, viewLinesChangedEvent, viewLinesInsertedEvent, viewLinesDeletedEvent];
        }
        acceptVersionId(versionId) {
            this.e = versionId;
            if (this.s.length === 1 && !this.s[0].isVisible()) {
                // At least one line must be visible => reset hidden areas
                this.setHiddenAreas([]);
            }
        }
        getViewLineCount() {
            return this.u.getTotalSum();
        }
        x(viewLineNumber) {
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
            viewLineNumber = this.x(viewLineNumber);
            minLineNumber = this.x(minLineNumber);
            maxLineNumber = this.x(maxLineNumber);
            const modelPosition = this.convertViewPositionToModelPosition(viewLineNumber, this.getViewLineMinColumn(viewLineNumber));
            const modelMinPosition = this.convertViewPositionToModelPosition(minLineNumber, this.getViewLineMinColumn(minLineNumber));
            const modelMaxPosition = this.convertViewPositionToModelPosition(maxLineNumber, this.getViewLineMinColumn(maxLineNumber));
            const result = this.d.guides.getActiveIndentGuide(modelPosition.lineNumber, modelMinPosition.lineNumber, modelMaxPosition.lineNumber);
            const viewStartPosition = this.convertModelPositionToViewPosition(result.startLineNumber, 1);
            const viewEndPosition = this.convertModelPositionToViewPosition(result.endLineNumber, this.d.getLineMaxColumn(result.endLineNumber));
            return {
                startLineNumber: viewStartPosition.lineNumber,
                endLineNumber: viewEndPosition.lineNumber,
                indent: result.indent
            };
        }
        // #region ViewLineInfo
        y(viewLineNumber) {
            viewLineNumber = this.x(viewLineNumber);
            const r = this.u.getIndexOf(viewLineNumber - 1);
            const lineIndex = r.index;
            const remainder = r.remainder;
            return new ViewLineInfo(lineIndex + 1, remainder);
        }
        z(viewLineInfo) {
            return this.s[viewLineInfo.modelLineNumber - 1].getViewLineMinColumn(this.d, viewLineInfo.modelLineNumber, viewLineInfo.modelLineWrappedLineIdx);
        }
        A(viewLineInfo) {
            return this.s[viewLineInfo.modelLineNumber - 1].getViewLineMaxColumn(this.d, viewLineInfo.modelLineNumber, viewLineInfo.modelLineWrappedLineIdx);
        }
        B(viewLineInfo) {
            const line = this.s[viewLineInfo.modelLineNumber - 1];
            const minViewColumn = line.getViewLineMinColumn(this.d, viewLineInfo.modelLineNumber, viewLineInfo.modelLineWrappedLineIdx);
            const column = line.getModelColumnOfViewPosition(viewLineInfo.modelLineWrappedLineIdx, minViewColumn);
            return new position_1.$js(viewLineInfo.modelLineNumber, column);
        }
        C(viewLineInfo) {
            const line = this.s[viewLineInfo.modelLineNumber - 1];
            const maxViewColumn = line.getViewLineMaxColumn(this.d, viewLineInfo.modelLineNumber, viewLineInfo.modelLineWrappedLineIdx);
            const column = line.getModelColumnOfViewPosition(viewLineInfo.modelLineWrappedLineIdx, maxViewColumn);
            return new position_1.$js(viewLineInfo.modelLineNumber, column);
        }
        D(viewStartLineNumber, viewEndLineNumber) {
            const startViewLine = this.y(viewStartLineNumber);
            const endViewLine = this.y(viewEndLineNumber);
            const result = new Array();
            let lastVisibleModelPos = this.B(startViewLine);
            let viewLines = new Array();
            for (let curModelLine = startViewLine.modelLineNumber; curModelLine <= endViewLine.modelLineNumber; curModelLine++) {
                const line = this.s[curModelLine - 1];
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
                    const lastVisibleModelPos2 = new position_1.$js(curModelLine - 1, this.d.getLineMaxColumn(curModelLine - 1) + 1);
                    const modelRange = range_1.$ks.fromPositions(lastVisibleModelPos, lastVisibleModelPos2);
                    result.push(new ViewLineInfoGroupedByModelRange(modelRange, viewLines));
                    viewLines = [];
                    lastVisibleModelPos = null;
                }
                else if (line.isVisible() && !lastVisibleModelPos) {
                    lastVisibleModelPos = new position_1.$js(curModelLine, 1);
                }
            }
            if (lastVisibleModelPos) {
                const modelRange = range_1.$ks.fromPositions(lastVisibleModelPos, this.C(endViewLine));
                result.push(new ViewLineInfoGroupedByModelRange(modelRange, viewLines));
            }
            return result;
        }
        // #endregion
        getViewLinesBracketGuides(viewStartLineNumber, viewEndLineNumber, activeViewPosition, options) {
            const modelActivePosition = activeViewPosition ? this.convertViewPositionToModelPosition(activeViewPosition.lineNumber, activeViewPosition.column) : null;
            const resultPerViewLine = [];
            for (const group of this.D(viewStartLineNumber, viewEndLineNumber)) {
                const modelRangeStartLineNumber = group.modelRange.startLineNumber;
                const bracketGuidesPerModelLine = this.d.guides.getLinesBracketGuides(modelRangeStartLineNumber, group.modelRange.endLineNumber, modelActivePosition, options);
                for (const viewLineInfo of group.viewLines) {
                    const bracketGuides = bracketGuidesPerModelLine[viewLineInfo.modelLineNumber - modelRangeStartLineNumber];
                    // visibleColumns stay as they are (this is a bug and needs to be fixed, but it is not a regression)
                    // model-columns must be converted to view-model columns.
                    const result = bracketGuides.map(g => {
                        if (g.forWrappedLinesAfterColumn !== -1) {
                            const p = this.s[viewLineInfo.modelLineNumber - 1].getViewPositionOfModelPosition(0, g.forWrappedLinesAfterColumn);
                            if (p.lineNumber >= viewLineInfo.modelLineWrappedLineIdx) {
                                return undefined;
                            }
                        }
                        if (g.forWrappedLinesBeforeOrAtColumn !== -1) {
                            const p = this.s[viewLineInfo.modelLineNumber - 1].getViewPositionOfModelPosition(0, g.forWrappedLinesBeforeOrAtColumn);
                            if (p.lineNumber < viewLineInfo.modelLineWrappedLineIdx) {
                                return undefined;
                            }
                        }
                        if (!g.horizontalLine) {
                            return g;
                        }
                        let column = -1;
                        if (g.column !== -1) {
                            const p = this.s[viewLineInfo.modelLineNumber - 1].getViewPositionOfModelPosition(0, g.column);
                            if (p.lineNumber === viewLineInfo.modelLineWrappedLineIdx) {
                                column = p.column;
                            }
                            else if (p.lineNumber < viewLineInfo.modelLineWrappedLineIdx) {
                                column = this.z(viewLineInfo);
                            }
                            else if (p.lineNumber > viewLineInfo.modelLineWrappedLineIdx) {
                                return undefined;
                            }
                        }
                        const viewPosition = this.convertModelPositionToViewPosition(viewLineInfo.modelLineNumber, g.horizontalLine.endColumn);
                        const p = this.s[viewLineInfo.modelLineNumber - 1].getViewPositionOfModelPosition(0, g.horizontalLine.endColumn);
                        if (p.lineNumber === viewLineInfo.modelLineWrappedLineIdx) {
                            return new textModelGuides_1.$su(g.visibleColumn, column, g.className, new textModelGuides_1.$tu(g.horizontalLine.top, viewPosition.column), -1, -1);
                        }
                        else if (p.lineNumber < viewLineInfo.modelLineWrappedLineIdx) {
                            return undefined;
                        }
                        else {
                            if (g.visibleColumn !== -1) {
                                // Don't repeat horizontal lines that use visibleColumn for unrelated lines.
                                return undefined;
                            }
                            return new textModelGuides_1.$su(g.visibleColumn, column, g.className, new textModelGuides_1.$tu(g.horizontalLine.top, this.A(viewLineInfo)), -1, -1);
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
            viewStartLineNumber = this.x(viewStartLineNumber);
            viewEndLineNumber = this.x(viewEndLineNumber);
            const modelStart = this.convertViewPositionToModelPosition(viewStartLineNumber, this.getViewLineMinColumn(viewStartLineNumber));
            const modelEnd = this.convertViewPositionToModelPosition(viewEndLineNumber, this.getViewLineMaxColumn(viewEndLineNumber));
            let result = [];
            const resultRepeatCount = [];
            const resultRepeatOption = [];
            const modelStartLineIndex = modelStart.lineNumber - 1;
            const modelEndLineIndex = modelEnd.lineNumber - 1;
            let reqStart = null;
            for (let modelLineIndex = modelStartLineIndex; modelLineIndex <= modelEndLineIndex; modelLineIndex++) {
                const line = this.s[modelLineIndex];
                if (line.isVisible()) {
                    const viewLineStartIndex = line.getViewLineNumberOfModelPosition(0, modelLineIndex === modelStartLineIndex ? modelStart.column : 1);
                    const viewLineEndIndex = line.getViewLineNumberOfModelPosition(0, this.d.getLineMaxColumn(modelLineIndex + 1));
                    const count = viewLineEndIndex - viewLineStartIndex + 1;
                    let option = 0 /* IndentGuideRepeatOption.BlockNone */;
                    if (count > 1 && line.getViewLineMinColumn(this.d, modelLineIndex + 1, viewLineEndIndex) === 1) {
                        // wrapped lines should block indent guides
                        option = (viewLineStartIndex === 0 ? 1 /* IndentGuideRepeatOption.BlockSubsequent */ : 2 /* IndentGuideRepeatOption.BlockAll */);
                    }
                    resultRepeatCount.push(count);
                    resultRepeatOption.push(option);
                    // merge into previous request
                    if (reqStart === null) {
                        reqStart = new position_1.$js(modelLineIndex + 1, 0);
                    }
                }
                else {
                    // hit invisible line => flush request
                    if (reqStart !== null) {
                        result = result.concat(this.d.guides.getLinesIndentGuides(reqStart.lineNumber, modelLineIndex));
                        reqStart = null;
                    }
                }
            }
            if (reqStart !== null) {
                result = result.concat(this.d.guides.getLinesIndentGuides(reqStart.lineNumber, modelEnd.lineNumber));
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
            const info = this.y(viewLineNumber);
            return this.s[info.modelLineNumber - 1].getViewLineContent(this.d, info.modelLineNumber, info.modelLineWrappedLineIdx);
        }
        getViewLineLength(viewLineNumber) {
            const info = this.y(viewLineNumber);
            return this.s[info.modelLineNumber - 1].getViewLineLength(this.d, info.modelLineNumber, info.modelLineWrappedLineIdx);
        }
        getViewLineMinColumn(viewLineNumber) {
            const info = this.y(viewLineNumber);
            return this.s[info.modelLineNumber - 1].getViewLineMinColumn(this.d, info.modelLineNumber, info.modelLineWrappedLineIdx);
        }
        getViewLineMaxColumn(viewLineNumber) {
            const info = this.y(viewLineNumber);
            return this.s[info.modelLineNumber - 1].getViewLineMaxColumn(this.d, info.modelLineNumber, info.modelLineWrappedLineIdx);
        }
        getViewLineData(viewLineNumber) {
            const info = this.y(viewLineNumber);
            return this.s[info.modelLineNumber - 1].getViewLineData(this.d, info.modelLineNumber, info.modelLineWrappedLineIdx);
        }
        getViewLinesData(viewStartLineNumber, viewEndLineNumber, needed) {
            viewStartLineNumber = this.x(viewStartLineNumber);
            viewEndLineNumber = this.x(viewEndLineNumber);
            const start = this.u.getIndexOf(viewStartLineNumber - 1);
            let viewLineNumber = viewStartLineNumber;
            const startModelLineIndex = start.index;
            const startRemainder = start.remainder;
            const result = [];
            for (let modelLineIndex = startModelLineIndex, len = this.d.getLineCount(); modelLineIndex < len; modelLineIndex++) {
                const line = this.s[modelLineIndex];
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
                line.getViewLinesData(this.d, modelLineIndex + 1, fromViewLineIndex, remainingViewLineCount, viewLineNumber - viewStartLineNumber, needed, result);
                viewLineNumber += remainingViewLineCount;
                if (lastLine) {
                    break;
                }
            }
            return result;
        }
        validateViewPosition(viewLineNumber, viewColumn, expectedModelPosition) {
            viewLineNumber = this.x(viewLineNumber);
            const r = this.u.getIndexOf(viewLineNumber - 1);
            const lineIndex = r.index;
            const remainder = r.remainder;
            const line = this.s[lineIndex];
            const minColumn = line.getViewLineMinColumn(this.d, lineIndex + 1, remainder);
            const maxColumn = line.getViewLineMaxColumn(this.d, lineIndex + 1, remainder);
            if (viewColumn < minColumn) {
                viewColumn = minColumn;
            }
            if (viewColumn > maxColumn) {
                viewColumn = maxColumn;
            }
            const computedModelColumn = line.getModelColumnOfViewPosition(remainder, viewColumn);
            const computedModelPosition = this.d.validatePosition(new position_1.$js(lineIndex + 1, computedModelColumn));
            if (computedModelPosition.equals(expectedModelPosition)) {
                return new position_1.$js(viewLineNumber, viewColumn);
            }
            return this.convertModelPositionToViewPosition(expectedModelPosition.lineNumber, expectedModelPosition.column);
        }
        validateViewRange(viewRange, expectedModelRange) {
            const validViewStart = this.validateViewPosition(viewRange.startLineNumber, viewRange.startColumn, expectedModelRange.getStartPosition());
            const validViewEnd = this.validateViewPosition(viewRange.endLineNumber, viewRange.endColumn, expectedModelRange.getEndPosition());
            return new range_1.$ks(validViewStart.lineNumber, validViewStart.column, validViewEnd.lineNumber, validViewEnd.column);
        }
        convertViewPositionToModelPosition(viewLineNumber, viewColumn) {
            const info = this.y(viewLineNumber);
            const inputColumn = this.s[info.modelLineNumber - 1].getModelColumnOfViewPosition(info.modelLineWrappedLineIdx, viewColumn);
            // console.log('out -> in ' + viewLineNumber + ',' + viewColumn + ' ===> ' + (lineIndex+1) + ',' + inputColumn);
            return this.d.validatePosition(new position_1.$js(info.modelLineNumber, inputColumn));
        }
        convertViewRangeToModelRange(viewRange) {
            const start = this.convertViewPositionToModelPosition(viewRange.startLineNumber, viewRange.startColumn);
            const end = this.convertViewPositionToModelPosition(viewRange.endLineNumber, viewRange.endColumn);
            return new range_1.$ks(start.lineNumber, start.column, end.lineNumber, end.column);
        }
        convertModelPositionToViewPosition(_modelLineNumber, _modelColumn, affinity = 2 /* PositionAffinity.None */, allowZeroLineNumber = false, belowHiddenRanges = false) {
            const validPosition = this.d.validatePosition(new position_1.$js(_modelLineNumber, _modelColumn));
            const inputLineNumber = validPosition.lineNumber;
            const inputColumn = validPosition.column;
            let lineIndex = inputLineNumber - 1, lineIndexChanged = false;
            if (belowHiddenRanges) {
                while (lineIndex < this.s.length && !this.s[lineIndex].isVisible()) {
                    lineIndex++;
                    lineIndexChanged = true;
                }
            }
            else {
                while (lineIndex > 0 && !this.s[lineIndex].isVisible()) {
                    lineIndex--;
                    lineIndexChanged = true;
                }
            }
            if (lineIndex === 0 && !this.s[lineIndex].isVisible()) {
                // Could not reach a real line
                // console.log('in -> out ' + inputLineNumber + ',' + inputColumn + ' ===> ' + 1 + ',' + 1);
                // TODO@alexdima@hediet this isn't soo pretty
                return new position_1.$js(allowZeroLineNumber ? 0 : 1, 1);
            }
            const deltaLineNumber = 1 + this.u.getPrefixSum(lineIndex);
            let r;
            if (lineIndexChanged) {
                if (belowHiddenRanges) {
                    r = this.s[lineIndex].getViewPositionOfModelPosition(deltaLineNumber, 1, affinity);
                }
                else {
                    r = this.s[lineIndex].getViewPositionOfModelPosition(deltaLineNumber, this.d.getLineMaxColumn(lineIndex + 1), affinity);
                }
            }
            else {
                r = this.s[inputLineNumber - 1].getViewPositionOfModelPosition(deltaLineNumber, inputColumn, affinity);
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
                return range_1.$ks.fromPositions(start);
            }
            else {
                const start = this.convertModelPositionToViewPosition(modelRange.startLineNumber, modelRange.startColumn, 1 /* PositionAffinity.Right */);
                const end = this.convertModelPositionToViewPosition(modelRange.endLineNumber, modelRange.endColumn, 0 /* PositionAffinity.Left */);
                return new range_1.$ks(start.lineNumber, start.column, end.lineNumber, end.column);
            }
        }
        getViewLineNumberOfModelPosition(modelLineNumber, modelColumn) {
            let lineIndex = modelLineNumber - 1;
            if (this.s[lineIndex].isVisible()) {
                // this model line is visible
                const deltaLineNumber = 1 + this.u.getPrefixSum(lineIndex);
                return this.s[lineIndex].getViewLineNumberOfModelPosition(deltaLineNumber, modelColumn);
            }
            // this model line is not visible
            while (lineIndex > 0 && !this.s[lineIndex].isVisible()) {
                lineIndex--;
            }
            if (lineIndex === 0 && !this.s[lineIndex].isVisible()) {
                // Could not reach a real line
                return 1;
            }
            const deltaLineNumber = 1 + this.u.getPrefixSum(lineIndex);
            return this.s[lineIndex].getViewLineNumberOfModelPosition(deltaLineNumber, this.d.getLineMaxColumn(lineIndex + 1));
        }
        getDecorationsInRange(range, ownerId, filterOutValidation, onlyMinimapDecorations, onlyMarginDecorations) {
            const modelStart = this.convertViewPositionToModelPosition(range.startLineNumber, range.startColumn);
            const modelEnd = this.convertViewPositionToModelPosition(range.endLineNumber, range.endColumn);
            if (modelEnd.lineNumber - modelStart.lineNumber <= range.endLineNumber - range.startLineNumber) {
                // most likely there are no hidden lines => fast path
                // fetch decorations from column 1 to cover the case of wrapped lines that have whole line decorations at column 1
                return this.d.getDecorationsInRange(new range_1.$ks(modelStart.lineNumber, 1, modelEnd.lineNumber, modelEnd.column), ownerId, filterOutValidation, onlyMinimapDecorations, onlyMarginDecorations);
            }
            let result = [];
            const modelStartLineIndex = modelStart.lineNumber - 1;
            const modelEndLineIndex = modelEnd.lineNumber - 1;
            let reqStart = null;
            for (let modelLineIndex = modelStartLineIndex; modelLineIndex <= modelEndLineIndex; modelLineIndex++) {
                const line = this.s[modelLineIndex];
                if (line.isVisible()) {
                    // merge into previous request
                    if (reqStart === null) {
                        reqStart = new position_1.$js(modelLineIndex + 1, modelLineIndex === modelStartLineIndex ? modelStart.column : 1);
                    }
                }
                else {
                    // hit invisible line => flush request
                    if (reqStart !== null) {
                        const maxLineColumn = this.d.getLineMaxColumn(modelLineIndex);
                        result = result.concat(this.d.getDecorationsInRange(new range_1.$ks(reqStart.lineNumber, reqStart.column, modelLineIndex, maxLineColumn), ownerId, filterOutValidation, onlyMinimapDecorations));
                        reqStart = null;
                    }
                }
            }
            if (reqStart !== null) {
                result = result.concat(this.d.getDecorationsInRange(new range_1.$ks(reqStart.lineNumber, reqStart.column, modelEnd.lineNumber, modelEnd.column), ownerId, filterOutValidation, onlyMinimapDecorations));
                reqStart = null;
            }
            result.sort((a, b) => {
                const res = range_1.$ks.compareRangesUsingStarts(a.range, b.range);
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
            const info = this.y(position.lineNumber);
            return this.s[info.modelLineNumber - 1].getInjectedTextAt(info.modelLineWrappedLineIdx, position.column);
        }
        normalizePosition(position, affinity) {
            const info = this.y(position.lineNumber);
            return this.s[info.modelLineNumber - 1].normalizePosition(info.modelLineWrappedLineIdx, position, affinity);
        }
        getLineIndentColumn(lineNumber) {
            const info = this.y(lineNumber);
            if (info.modelLineWrappedLineIdx === 0) {
                return this.d.getLineIndentColumn(info.modelLineNumber);
            }
            // wrapped lines have no indentation.
            // We deliberately don't handle the case that indentation is wrapped
            // to avoid two view lines reporting indentation for the very same model line.
            return 0;
        }
    }
    exports.$kY = $kY;
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
        sortedRanges.sort(range_1.$ks.compareRangesUsingStarts);
        const result = [];
        let currentRangeStart = sortedRanges[0].startLineNumber;
        let currentRangeEnd = sortedRanges[0].endLineNumber;
        for (let i = 1, len = sortedRanges.length; i < len; i++) {
            const range = sortedRanges[i];
            if (range.startLineNumber > currentRangeEnd + 1) {
                result.push(new range_1.$ks(currentRangeStart, 1, currentRangeEnd, 1));
                currentRangeStart = range.startLineNumber;
                currentRangeEnd = range.endLineNumber;
            }
            else if (range.endLineNumber > currentRangeEnd) {
                currentRangeEnd = range.endLineNumber;
            }
        }
        result.push(new range_1.$ks(currentRangeStart, 1, currentRangeEnd, 1));
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
            this.c = lines;
        }
        // View -> Model conversion and related methods
        convertViewPositionToModelPosition(viewPosition) {
            return this.c.convertViewPositionToModelPosition(viewPosition.lineNumber, viewPosition.column);
        }
        convertViewRangeToModelRange(viewRange) {
            return this.c.convertViewRangeToModelRange(viewRange);
        }
        validateViewPosition(viewPosition, expectedModelPosition) {
            return this.c.validateViewPosition(viewPosition.lineNumber, viewPosition.column, expectedModelPosition);
        }
        validateViewRange(viewRange, expectedModelRange) {
            return this.c.validateViewRange(viewRange, expectedModelRange);
        }
        // Model -> View conversion and related methods
        convertModelPositionToViewPosition(modelPosition, affinity, allowZero, belowHiddenRanges) {
            return this.c.convertModelPositionToViewPosition(modelPosition.lineNumber, modelPosition.column, affinity, allowZero, belowHiddenRanges);
        }
        convertModelRangeToViewRange(modelRange, affinity) {
            return this.c.convertModelRangeToViewRange(modelRange, affinity);
        }
        modelPositionIsVisible(modelPosition) {
            return this.c.modelPositionIsVisible(modelPosition.lineNumber, modelPosition.column);
        }
        getModelLineViewLineCount(modelLineNumber) {
            return this.c.getModelLineViewLineCount(modelLineNumber);
        }
        getViewLineNumberOfModelPosition(modelLineNumber, modelColumn) {
            return this.c.getViewLineNumberOfModelPosition(modelLineNumber, modelColumn);
        }
    }
    var IndentGuideRepeatOption;
    (function (IndentGuideRepeatOption) {
        IndentGuideRepeatOption[IndentGuideRepeatOption["BlockNone"] = 0] = "BlockNone";
        IndentGuideRepeatOption[IndentGuideRepeatOption["BlockSubsequent"] = 1] = "BlockSubsequent";
        IndentGuideRepeatOption[IndentGuideRepeatOption["BlockAll"] = 2] = "BlockAll";
    })(IndentGuideRepeatOption || (IndentGuideRepeatOption = {}));
    class $lY {
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
            return new viewEvents.$1U(fromLineNumber, toLineNumber);
        }
        onModelLinesInserted(_versionId, fromLineNumber, toLineNumber, lineBreaks) {
            return new viewEvents.$2U(fromLineNumber, toLineNumber);
        }
        onModelLineChanged(_versionId, lineNumber, lineBreakData) {
            return [false, new viewEvents.$ZU(lineNumber, 1), null, null];
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
            return new viewModel_1.$_U(lineContent, false, 1, lineContent.length + 1, 0, lineTokens.inflate(), null);
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
    exports.$lY = $lY;
    class IdentityCoordinatesConverter {
        constructor(lines) {
            this.c = lines;
        }
        d(pos) {
            return this.c.model.validatePosition(pos);
        }
        e(range) {
            return this.c.model.validateRange(range);
        }
        // View -> Model conversion and related methods
        convertViewPositionToModelPosition(viewPosition) {
            return this.d(viewPosition);
        }
        convertViewRangeToModelRange(viewRange) {
            return this.e(viewRange);
        }
        validateViewPosition(_viewPosition, expectedModelPosition) {
            return this.d(expectedModelPosition);
        }
        validateViewRange(_viewRange, expectedModelRange) {
            return this.e(expectedModelRange);
        }
        // Model -> View conversion and related methods
        convertModelPositionToViewPosition(modelPosition) {
            return this.d(modelPosition);
        }
        convertModelRangeToViewRange(modelRange) {
            return this.e(modelRange);
        }
        modelPositionIsVisible(modelPosition) {
            const lineCount = this.c.model.getLineCount();
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
//# sourceMappingURL=viewModelLines.js.map