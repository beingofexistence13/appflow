/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/viewModel", "vs/editor/common/config/editorOptions"], function (require, exports, position_1, range_1, viewModel_1, editorOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isModelDecorationInString = exports.isModelDecorationInComment = exports.isModelDecorationVisible = exports.ViewModelDecorations = void 0;
    class ViewModelDecorations {
        constructor(editorId, model, configuration, linesCollection, coordinatesConverter) {
            this.editorId = editorId;
            this.model = model;
            this.configuration = configuration;
            this._linesCollection = linesCollection;
            this._coordinatesConverter = coordinatesConverter;
            this._decorationsCache = Object.create(null);
            this._cachedModelDecorationsResolver = null;
            this._cachedModelDecorationsResolverViewRange = null;
        }
        _clearCachedModelDecorationsResolver() {
            this._cachedModelDecorationsResolver = null;
            this._cachedModelDecorationsResolverViewRange = null;
        }
        dispose() {
            this._decorationsCache = Object.create(null);
            this._clearCachedModelDecorationsResolver();
        }
        reset() {
            this._decorationsCache = Object.create(null);
            this._clearCachedModelDecorationsResolver();
        }
        onModelDecorationsChanged() {
            this._decorationsCache = Object.create(null);
            this._clearCachedModelDecorationsResolver();
        }
        onLineMappingChanged() {
            this._decorationsCache = Object.create(null);
            this._clearCachedModelDecorationsResolver();
        }
        _getOrCreateViewModelDecoration(modelDecoration) {
            const id = modelDecoration.id;
            let r = this._decorationsCache[id];
            if (!r) {
                const modelRange = modelDecoration.range;
                const options = modelDecoration.options;
                let viewRange;
                if (options.isWholeLine) {
                    const start = this._coordinatesConverter.convertModelPositionToViewPosition(new position_1.Position(modelRange.startLineNumber, 1), 0 /* PositionAffinity.Left */, false, true);
                    const end = this._coordinatesConverter.convertModelPositionToViewPosition(new position_1.Position(modelRange.endLineNumber, this.model.getLineMaxColumn(modelRange.endLineNumber)), 1 /* PositionAffinity.Right */);
                    viewRange = new range_1.Range(start.lineNumber, start.column, end.lineNumber, end.column);
                }
                else {
                    // For backwards compatibility reasons, we want injected text before any decoration.
                    // Thus, move decorations to the right.
                    viewRange = this._coordinatesConverter.convertModelRangeToViewRange(modelRange, 1 /* PositionAffinity.Right */);
                }
                r = new viewModel_1.ViewModelDecoration(viewRange, options);
                this._decorationsCache[id] = r;
            }
            return r;
        }
        getMinimapDecorationsInRange(range) {
            return this._getDecorationsInRange(range, true, false).decorations;
        }
        getDecorationsViewportData(viewRange) {
            let cacheIsValid = (this._cachedModelDecorationsResolver !== null);
            cacheIsValid = cacheIsValid && (viewRange.equalsRange(this._cachedModelDecorationsResolverViewRange));
            if (!cacheIsValid) {
                this._cachedModelDecorationsResolver = this._getDecorationsInRange(viewRange, false, false);
                this._cachedModelDecorationsResolverViewRange = viewRange;
            }
            return this._cachedModelDecorationsResolver;
        }
        getInlineDecorationsOnLine(lineNumber, onlyMinimapDecorations = false, onlyMarginDecorations = false) {
            const range = new range_1.Range(lineNumber, this._linesCollection.getViewLineMinColumn(lineNumber), lineNumber, this._linesCollection.getViewLineMaxColumn(lineNumber));
            return this._getDecorationsInRange(range, onlyMinimapDecorations, onlyMarginDecorations).inlineDecorations[0];
        }
        _getDecorationsInRange(viewRange, onlyMinimapDecorations, onlyMarginDecorations) {
            const modelDecorations = this._linesCollection.getDecorationsInRange(viewRange, this.editorId, (0, editorOptions_1.filterValidationDecorations)(this.configuration.options), onlyMinimapDecorations, onlyMarginDecorations);
            const startLineNumber = viewRange.startLineNumber;
            const endLineNumber = viewRange.endLineNumber;
            const decorationsInViewport = [];
            let decorationsInViewportLen = 0;
            const inlineDecorations = [];
            for (let j = startLineNumber; j <= endLineNumber; j++) {
                inlineDecorations[j - startLineNumber] = [];
            }
            for (let i = 0, len = modelDecorations.length; i < len; i++) {
                const modelDecoration = modelDecorations[i];
                const decorationOptions = modelDecoration.options;
                if (!isModelDecorationVisible(this.model, modelDecoration)) {
                    continue;
                }
                const viewModelDecoration = this._getOrCreateViewModelDecoration(modelDecoration);
                const viewRange = viewModelDecoration.range;
                decorationsInViewport[decorationsInViewportLen++] = viewModelDecoration;
                if (decorationOptions.inlineClassName) {
                    const inlineDecoration = new viewModel_1.InlineDecoration(viewRange, decorationOptions.inlineClassName, decorationOptions.inlineClassNameAffectsLetterSpacing ? 3 /* InlineDecorationType.RegularAffectingLetterSpacing */ : 0 /* InlineDecorationType.Regular */);
                    const intersectedStartLineNumber = Math.max(startLineNumber, viewRange.startLineNumber);
                    const intersectedEndLineNumber = Math.min(endLineNumber, viewRange.endLineNumber);
                    for (let j = intersectedStartLineNumber; j <= intersectedEndLineNumber; j++) {
                        inlineDecorations[j - startLineNumber].push(inlineDecoration);
                    }
                }
                if (decorationOptions.beforeContentClassName) {
                    if (startLineNumber <= viewRange.startLineNumber && viewRange.startLineNumber <= endLineNumber) {
                        const inlineDecoration = new viewModel_1.InlineDecoration(new range_1.Range(viewRange.startLineNumber, viewRange.startColumn, viewRange.startLineNumber, viewRange.startColumn), decorationOptions.beforeContentClassName, 1 /* InlineDecorationType.Before */);
                        inlineDecorations[viewRange.startLineNumber - startLineNumber].push(inlineDecoration);
                    }
                }
                if (decorationOptions.afterContentClassName) {
                    if (startLineNumber <= viewRange.endLineNumber && viewRange.endLineNumber <= endLineNumber) {
                        const inlineDecoration = new viewModel_1.InlineDecoration(new range_1.Range(viewRange.endLineNumber, viewRange.endColumn, viewRange.endLineNumber, viewRange.endColumn), decorationOptions.afterContentClassName, 2 /* InlineDecorationType.After */);
                        inlineDecorations[viewRange.endLineNumber - startLineNumber].push(inlineDecoration);
                    }
                }
            }
            return {
                decorations: decorationsInViewport,
                inlineDecorations: inlineDecorations
            };
        }
    }
    exports.ViewModelDecorations = ViewModelDecorations;
    function isModelDecorationVisible(model, decoration) {
        if (decoration.options.hideInCommentTokens && isModelDecorationInComment(model, decoration)) {
            return false;
        }
        if (decoration.options.hideInStringTokens && isModelDecorationInString(model, decoration)) {
            return false;
        }
        return true;
    }
    exports.isModelDecorationVisible = isModelDecorationVisible;
    function isModelDecorationInComment(model, decoration) {
        return testTokensInRange(model, decoration.range, (tokenType) => tokenType === 1 /* StandardTokenType.Comment */);
    }
    exports.isModelDecorationInComment = isModelDecorationInComment;
    function isModelDecorationInString(model, decoration) {
        return testTokensInRange(model, decoration.range, (tokenType) => tokenType === 2 /* StandardTokenType.String */);
    }
    exports.isModelDecorationInString = isModelDecorationInString;
    /**
     * Calls the callback for every token that intersects the range.
     * If the callback returns `false`, iteration stops and `false` is returned.
     * Otherwise, `true` is returned.
     */
    function testTokensInRange(model, range, callback) {
        for (let lineNumber = range.startLineNumber; lineNumber <= range.endLineNumber; lineNumber++) {
            const lineTokens = model.tokenization.getLineTokens(lineNumber);
            const isFirstLine = lineNumber === range.startLineNumber;
            const isEndLine = lineNumber === range.endLineNumber;
            let tokenIdx = isFirstLine ? lineTokens.findTokenIndexAtOffset(range.startColumn - 1) : 0;
            while (tokenIdx < lineTokens.getCount()) {
                if (isEndLine) {
                    const startOffset = lineTokens.getStartOffset(tokenIdx);
                    if (startOffset > range.endColumn - 1) {
                        break;
                    }
                }
                const callbackResult = callback(lineTokens.getStandardTokenType(tokenIdx));
                if (!callbackResult) {
                    return false;
                }
                tokenIdx++;
            }
        }
        return true;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld01vZGVsRGVjb3JhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL3ZpZXdNb2RlbC92aWV3TW9kZWxEZWNvcmF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUF1QmhHLE1BQWEsb0JBQW9CO1FBYWhDLFlBQVksUUFBZ0IsRUFBRSxLQUFpQixFQUFFLGFBQW1DLEVBQUUsZUFBZ0MsRUFBRSxvQkFBMkM7WUFDbEssSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7WUFDekIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7WUFDbkMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztZQUN4QyxJQUFJLENBQUMscUJBQXFCLEdBQUcsb0JBQW9CLENBQUM7WUFDbEQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLCtCQUErQixHQUFHLElBQUksQ0FBQztZQUM1QyxJQUFJLENBQUMsd0NBQXdDLEdBQUcsSUFBSSxDQUFDO1FBQ3RELENBQUM7UUFFTyxvQ0FBb0M7WUFDM0MsSUFBSSxDQUFDLCtCQUErQixHQUFHLElBQUksQ0FBQztZQUM1QyxJQUFJLENBQUMsd0NBQXdDLEdBQUcsSUFBSSxDQUFDO1FBQ3RELENBQUM7UUFFTSxPQUFPO1lBQ2IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLG9DQUFvQyxFQUFFLENBQUM7UUFDN0MsQ0FBQztRQUVNLEtBQUs7WUFDWCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FB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