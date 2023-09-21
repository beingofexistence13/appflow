/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/tokens/lineTokens", "vs/editor/common/core/position", "vs/editor/common/textModelEvents", "vs/editor/common/viewModel"], function (require, exports, lineTokens_1, position_1, textModelEvents_1, viewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createModelLineProjection = void 0;
    function createModelLineProjection(lineBreakData, isVisible) {
        if (lineBreakData === null) {
            // No mapping needed
            if (isVisible) {
                return IdentityModelLineProjection.INSTANCE;
            }
            return HiddenModelLineProjection.INSTANCE;
        }
        else {
            return new ModelLineProjection(lineBreakData, isVisible);
        }
    }
    exports.createModelLineProjection = createModelLineProjection;
    /**
     * This projection is used to
     * * wrap model lines
     * * inject text
     */
    class ModelLineProjection {
        constructor(lineBreakData, isVisible) {
            this._projectionData = lineBreakData;
            this._isVisible = isVisible;
        }
        isVisible() {
            return this._isVisible;
        }
        setVisible(isVisible) {
            this._isVisible = isVisible;
            return this;
        }
        getProjectionData() {
            return this._projectionData;
        }
        getViewLineCount() {
            if (!this._isVisible) {
                return 0;
            }
            return this._projectionData.getOutputLineCount();
        }
        getViewLineContent(model, modelLineNumber, outputLineIndex) {
            this._assertVisible();
            const startOffsetInInputWithInjections = outputLineIndex > 0 ? this._projectionData.breakOffsets[outputLineIndex - 1] : 0;
            const endOffsetInInputWithInjections = this._projectionData.breakOffsets[outputLineIndex];
            let r;
            if (this._projectionData.injectionOffsets !== null) {
                const injectedTexts = this._projectionData.injectionOffsets.map((offset, idx) => new textModelEvents_1.LineInjectedText(0, 0, offset + 1, this._projectionData.injectionOptions[idx], 0));
                const lineWithInjections = textModelEvents_1.LineInjectedText.applyInjectedText(model.getLineContent(modelLineNumber), injectedTexts);
                r = lineWithInjections.substring(startOffsetInInputWithInjections, endOffsetInInputWithInjections);
            }
            else {
                r = model.getValueInRange({
                    startLineNumber: modelLineNumber,
                    startColumn: startOffsetInInputWithInjections + 1,
                    endLineNumber: modelLineNumber,
                    endColumn: endOffsetInInputWithInjections + 1
                });
            }
            if (outputLineIndex > 0) {
                r = spaces(this._projectionData.wrappedTextIndentLength) + r;
            }
            return r;
        }
        getViewLineLength(model, modelLineNumber, outputLineIndex) {
            this._assertVisible();
            return this._projectionData.getLineLength(outputLineIndex);
        }
        getViewLineMinColumn(_model, _modelLineNumber, outputLineIndex) {
            this._assertVisible();
            return this._projectionData.getMinOutputOffset(outputLineIndex) + 1;
        }
        getViewLineMaxColumn(model, modelLineNumber, outputLineIndex) {
            this._assertVisible();
            return this._projectionData.getMaxOutputOffset(outputLineIndex) + 1;
        }
        /**
         * Try using {@link getViewLinesData} instead.
        */
        getViewLineData(model, modelLineNumber, outputLineIndex) {
            const arr = new Array();
            this.getViewLinesData(model, modelLineNumber, outputLineIndex, 1, 0, [true], arr);
            return arr[0];
        }
        getViewLinesData(model, modelLineNumber, outputLineIdx, lineCount, globalStartIndex, needed, result) {
            this._assertVisible();
            const lineBreakData = this._projectionData;
            const injectionOffsets = lineBreakData.injectionOffsets;
            const injectionOptions = lineBreakData.injectionOptions;
            let inlineDecorationsPerOutputLine = null;
            if (injectionOffsets) {
                inlineDecorationsPerOutputLine = [];
                let totalInjectedTextLengthBefore = 0;
                let currentInjectedOffset = 0;
                for (let outputLineIndex = 0; outputLineIndex < lineBreakData.getOutputLineCount(); outputLineIndex++) {
                    const inlineDecorations = new Array();
                    inlineDecorationsPerOutputLine[outputLineIndex] = inlineDecorations;
                    const lineStartOffsetInInputWithInjections = outputLineIndex > 0 ? lineBreakData.breakOffsets[outputLineIndex - 1] : 0;
                    const lineEndOffsetInInputWithInjections = lineBreakData.breakOffsets[outputLineIndex];
                    while (currentInjectedOffset < injectionOffsets.length) {
                        const length = injectionOptions[currentInjectedOffset].content.length;
                        const injectedTextStartOffsetInInputWithInjections = injectionOffsets[currentInjectedOffset] + totalInjectedTextLengthBefore;
                        const injectedTextEndOffsetInInputWithInjections = injectedTextStartOffsetInInputWithInjections + length;
                        if (injectedTextStartOffsetInInputWithInjections > lineEndOffsetInInputWithInjections) {
                            // Injected text only starts in later wrapped lines.
                            break;
                        }
                        if (lineStartOffsetInInputWithInjections < injectedTextEndOffsetInInputWithInjections) {
                            // Injected text ends after or in this line (but also starts in or before this line).
                            const options = injectionOptions[currentInjectedOffset];
                            if (options.inlineClassName) {
                                const offset = (outputLineIndex > 0 ? lineBreakData.wrappedTextIndentLength : 0);
                                const start = offset + Math.max(injectedTextStartOffsetInInputWithInjections - lineStartOffsetInInputWithInjections, 0);
                                const end = offset + Math.min(injectedTextEndOffsetInInputWithInjections - lineStartOffsetInInputWithInjections, lineEndOffsetInInputWithInjections - lineStartOffsetInInputWithInjections);
                                if (start !== end) {
                                    inlineDecorations.push(new viewModel_1.SingleLineInlineDecoration(start, end, options.inlineClassName, options.inlineClassNameAffectsLetterSpacing));
                                }
                            }
                        }
                        if (injectedTextEndOffsetInInputWithInjections <= lineEndOffsetInInputWithInjections) {
                            totalInjectedTextLengthBefore += length;
                            currentInjectedOffset++;
                        }
                        else {
                            // injected text breaks into next line, process it again
                            break;
                        }
                    }
                }
            }
            let lineWithInjections;
            if (injectionOffsets) {
                lineWithInjections = model.tokenization.getLineTokens(modelLineNumber).withInserted(injectionOffsets.map((offset, idx) => ({
                    offset,
                    text: injectionOptions[idx].content,
                    tokenMetadata: lineTokens_1.LineTokens.defaultTokenMetadata
                })));
            }
            else {
                lineWithInjections = model.tokenization.getLineTokens(modelLineNumber);
            }
            for (let outputLineIndex = outputLineIdx; outputLineIndex < outputLineIdx + lineCount; outputLineIndex++) {
                const globalIndex = globalStartIndex + outputLineIndex - outputLineIdx;
                if (!needed[globalIndex]) {
                    result[globalIndex] = null;
                    continue;
                }
                result[globalIndex] = this._getViewLineData(lineWithInjections, inlineDecorationsPerOutputLine ? inlineDecorationsPerOutputLine[outputLineIndex] : null, outputLineIndex);
            }
        }
        _getViewLineData(lineWithInjections, inlineDecorations, outputLineIndex) {
            this._assertVisible();
            const lineBreakData = this._projectionData;
            const deltaStartIndex = (outputLineIndex > 0 ? lineBreakData.wrappedTextIndentLength : 0);
            const lineStartOffsetInInputWithInjections = outputLineIndex > 0 ? lineBreakData.breakOffsets[outputLineIndex - 1] : 0;
            const lineEndOffsetInInputWithInjections = lineBreakData.breakOffsets[outputLineIndex];
            const tokens = lineWithInjections.sliceAndInflate(lineStartOffsetInInputWithInjections, lineEndOffsetInInputWithInjections, deltaStartIndex);
            let lineContent = tokens.getLineContent();
            if (outputLineIndex > 0) {
                lineContent = spaces(lineBreakData.wrappedTextIndentLength) + lineContent;
            }
            const minColumn = this._projectionData.getMinOutputOffset(outputLineIndex) + 1;
            const maxColumn = lineContent.length + 1;
            const continuesWithWrappedLine = (outputLineIndex + 1 < this.getViewLineCount());
            const startVisibleColumn = (outputLineIndex === 0 ? 0 : lineBreakData.breakOffsetsVisibleColumn[outputLineIndex - 1]);
            return new viewModel_1.ViewLineData(lineContent, continuesWithWrappedLine, minColumn, maxColumn, startVisibleColumn, tokens, inlineDecorations);
        }
        getModelColumnOfViewPosition(outputLineIndex, outputColumn) {
            this._assertVisible();
            return this._projectionData.translateToInputOffset(outputLineIndex, outputColumn - 1) + 1;
        }
        getViewPositionOfModelPosition(deltaLineNumber, inputColumn, affinity = 2 /* PositionAffinity.None */) {
            this._assertVisible();
            const r = this._projectionData.translateToOutputPosition(inputColumn - 1, affinity);
            return r.toPosition(deltaLineNumber);
        }
        getViewLineNumberOfModelPosition(deltaLineNumber, inputColumn) {
            this._assertVisible();
            const r = this._projectionData.translateToOutputPosition(inputColumn - 1);
            return deltaLineNumber + r.outputLineIndex;
        }
        normalizePosition(outputLineIndex, outputPosition, affinity) {
            const baseViewLineNumber = outputPosition.lineNumber - outputLineIndex;
            const normalizedOutputPosition = this._projectionData.normalizeOutputPosition(outputLineIndex, outputPosition.column - 1, affinity);
            const result = normalizedOutputPosition.toPosition(baseViewLineNumber);
            return result;
        }
        getInjectedTextAt(outputLineIndex, outputColumn) {
            return this._projectionData.getInjectedText(outputLineIndex, outputColumn - 1);
        }
        _assertVisible() {
            if (!this._isVisible) {
                throw new Error('Not supported');
            }
        }
    }
    /**
     * This projection does not change the model line.
    */
    class IdentityModelLineProjection {
        static { this.INSTANCE = new IdentityModelLineProjection(); }
        constructor() { }
        isVisible() {
            return true;
        }
        setVisible(isVisible) {
            if (isVisible) {
                return this;
            }
            return HiddenModelLineProjection.INSTANCE;
        }
        getProjectionData() {
            return null;
        }
        getViewLineCount() {
            return 1;
        }
        getViewLineContent(model, modelLineNumber, _outputLineIndex) {
            return model.getLineContent(modelLineNumber);
        }
        getViewLineLength(model, modelLineNumber, _outputLineIndex) {
            return model.getLineLength(modelLineNumber);
        }
        getViewLineMinColumn(model, modelLineNumber, _outputLineIndex) {
            return model.getLineMinColumn(modelLineNumber);
        }
        getViewLineMaxColumn(model, modelLineNumber, _outputLineIndex) {
            return model.getLineMaxColumn(modelLineNumber);
        }
        getViewLineData(model, modelLineNumber, _outputLineIndex) {
            const lineTokens = model.tokenization.getLineTokens(modelLineNumber);
            const lineContent = lineTokens.getLineContent();
            return new viewModel_1.ViewLineData(lineContent, false, 1, lineContent.length + 1, 0, lineTokens.inflate(), null);
        }
        getViewLinesData(model, modelLineNumber, _fromOuputLineIndex, _toOutputLineIndex, globalStartIndex, needed, result) {
            if (!needed[globalStartIndex]) {
                result[globalStartIndex] = null;
                return;
            }
            result[globalStartIndex] = this.getViewLineData(model, modelLineNumber, 0);
        }
        getModelColumnOfViewPosition(_outputLineIndex, outputColumn) {
            return outputColumn;
        }
        getViewPositionOfModelPosition(deltaLineNumber, inputColumn) {
            return new position_1.Position(deltaLineNumber, inputColumn);
        }
        getViewLineNumberOfModelPosition(deltaLineNumber, _inputColumn) {
            return deltaLineNumber;
        }
        normalizePosition(outputLineIndex, outputPosition, affinity) {
            return outputPosition;
        }
        getInjectedTextAt(_outputLineIndex, _outputColumn) {
            return null;
        }
    }
    /**
     * This projection hides the model line.
     */
    class HiddenModelLineProjection {
        static { this.INSTANCE = new HiddenModelLineProjection(); }
        constructor() { }
        isVisible() {
            return false;
        }
        setVisible(isVisible) {
            if (!isVisible) {
                return this;
            }
            return IdentityModelLineProjection.INSTANCE;
        }
        getProjectionData() {
            return null;
        }
        getViewLineCount() {
            return 0;
        }
        getViewLineContent(_model, _modelLineNumber, _outputLineIndex) {
            throw new Error('Not supported');
        }
        getViewLineLength(_model, _modelLineNumber, _outputLineIndex) {
            throw new Error('Not supported');
        }
        getViewLineMinColumn(_model, _modelLineNumber, _outputLineIndex) {
            throw new Error('Not supported');
        }
        getViewLineMaxColumn(_model, _modelLineNumber, _outputLineIndex) {
            throw new Error('Not supported');
        }
        getViewLineData(_model, _modelLineNumber, _outputLineIndex) {
            throw new Error('Not supported');
        }
        getViewLinesData(_model, _modelLineNumber, _fromOuputLineIndex, _toOutputLineIndex, _globalStartIndex, _needed, _result) {
            throw new Error('Not supported');
        }
        getModelColumnOfViewPosition(_outputLineIndex, _outputColumn) {
            throw new Error('Not supported');
        }
        getViewPositionOfModelPosition(_deltaLineNumber, _inputColumn) {
            throw new Error('Not supported');
        }
        getViewLineNumberOfModelPosition(_deltaLineNumber, _inputColumn) {
            throw new Error('Not supported');
        }
        normalizePosition(outputLineIndex, outputPosition, affinity) {
            throw new Error('Not supported');
        }
        getInjectedTextAt(_outputLineIndex, _outputColumn) {
            throw new Error('Not supported');
        }
    }
    const _spaces = [''];
    function spaces(count) {
        if (count >= _spaces.length) {
            for (let i = 1; i <= count; i++) {
                _spaces[i] = _makeSpaces(i);
            }
        }
        return _spaces[count];
    }
    function _makeSpaces(count) {
        return new Array(count + 1).join(' ');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWxMaW5lUHJvamVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vdmlld01vZGVsL21vZGVsTGluZVByb2plY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBOENoRyxTQUFnQix5QkFBeUIsQ0FBQyxhQUE2QyxFQUFFLFNBQWtCO1FBQzFHLElBQUksYUFBYSxLQUFLLElBQUksRUFBRTtZQUMzQixvQkFBb0I7WUFDcEIsSUFBSSxTQUFTLEVBQUU7Z0JBQ2QsT0FBTywyQkFBMkIsQ0FBQyxRQUFRLENBQUM7YUFDNUM7WUFDRCxPQUFPLHlCQUF5QixDQUFDLFFBQVEsQ0FBQztTQUMxQzthQUFNO1lBQ04sT0FBTyxJQUFJLG1CQUFtQixDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUN6RDtJQUNGLENBQUM7SUFWRCw4REFVQztJQUVEOzs7O09BSUc7SUFDSCxNQUFNLG1CQUFtQjtRQUl4QixZQUFZLGFBQXNDLEVBQUUsU0FBa0I7WUFDckUsSUFBSSxDQUFDLGVBQWUsR0FBRyxhQUFhLENBQUM7WUFDckMsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDN0IsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDeEIsQ0FBQztRQUVNLFVBQVUsQ0FBQyxTQUFrQjtZQUNuQyxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztZQUM1QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxpQkFBaUI7WUFDdkIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzdCLENBQUM7UUFFTSxnQkFBZ0I7WUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3JCLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7WUFDRCxPQUFPLElBQUksQ0FBQyxlQUFlLENB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