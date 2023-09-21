/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/viewModel", "vs/editor/common/config/editorOptions"], function (require, exports, position_1, range_1, viewModel_1, editorOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$pY = exports.$oY = exports.$nY = exports.$mY = void 0;
    class $mY {
        constructor(editorId, model, configuration, linesCollection, coordinatesConverter) {
            this.a = editorId;
            this.b = model;
            this.c = configuration;
            this.d = linesCollection;
            this.e = coordinatesConverter;
            this.f = Object.create(null);
            this.g = null;
            this.h = null;
        }
        k() {
            this.g = null;
            this.h = null;
        }
        dispose() {
            this.f = Object.create(null);
            this.k();
        }
        reset() {
            this.f = Object.create(null);
            this.k();
        }
        onModelDecorationsChanged() {
            this.f = Object.create(null);
            this.k();
        }
        onLineMappingChanged() {
            this.f = Object.create(null);
            this.k();
        }
        l(modelDecoration) {
            const id = modelDecoration.id;
            let r = this.f[id];
            if (!r) {
                const modelRange = modelDecoration.range;
                const options = modelDecoration.options;
                let viewRange;
                if (options.isWholeLine) {
                    const start = this.e.convertModelPositionToViewPosition(new position_1.$js(modelRange.startLineNumber, 1), 0 /* PositionAffinity.Left */, false, true);
                    const end = this.e.convertModelPositionToViewPosition(new position_1.$js(modelRange.endLineNumber, this.b.getLineMaxColumn(modelRange.endLineNumber)), 1 /* PositionAffinity.Right */);
                    viewRange = new range_1.$ks(start.lineNumber, start.column, end.lineNumber, end.column);
                }
                else {
                    // For backwards compatibility reasons, we want injected text before any decoration.
                    // Thus, move decorations to the right.
                    viewRange = this.e.convertModelRangeToViewRange(modelRange, 1 /* PositionAffinity.Right */);
                }
                r = new viewModel_1.$dV(viewRange, options);
                this.f[id] = r;
            }
            return r;
        }
        getMinimapDecorationsInRange(range) {
            return this.m(range, true, false).decorations;
        }
        getDecorationsViewportData(viewRange) {
            let cacheIsValid = (this.g !== null);
            cacheIsValid = cacheIsValid && (viewRange.equalsRange(this.h));
            if (!cacheIsValid) {
                this.g = this.m(viewRange, false, false);
                this.h = viewRange;
            }
            return this.g;
        }
        getInlineDecorationsOnLine(lineNumber, onlyMinimapDecorations = false, onlyMarginDecorations = false) {
            const range = new range_1.$ks(lineNumber, this.d.getViewLineMinColumn(lineNumber), lineNumber, this.d.getViewLineMaxColumn(lineNumber));
            return this.m(range, onlyMinimapDecorations, onlyMarginDecorations).inlineDecorations[0];
        }
        m(viewRange, onlyMinimapDecorations, onlyMarginDecorations) {
            const modelDecorations = this.d.getDecorationsInRange(viewRange, this.a, (0, editorOptions_1.filterValidationDecorations)(this.c.options), onlyMinimapDecorations, onlyMarginDecorations);
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
                if (!$nY(this.b, modelDecoration)) {
                    continue;
                }
                const viewModelDecoration = this.l(modelDecoration);
                const viewRange = viewModelDecoration.range;
                decorationsInViewport[decorationsInViewportLen++] = viewModelDecoration;
                if (decorationOptions.inlineClassName) {
                    const inlineDecoration = new viewModel_1.$bV(viewRange, decorationOptions.inlineClassName, decorationOptions.inlineClassNameAffectsLetterSpacing ? 3 /* InlineDecorationType.RegularAffectingLetterSpacing */ : 0 /* InlineDecorationType.Regular */);
                    const intersectedStartLineNumber = Math.max(startLineNumber, viewRange.startLineNumber);
                    const intersectedEndLineNumber = Math.min(endLineNumber, viewRange.endLineNumber);
                    for (let j = intersectedStartLineNumber; j <= intersectedEndLineNumber; j++) {
                        inlineDecorations[j - startLineNumber].push(inlineDecoration);
                    }
                }
                if (decorationOptions.beforeContentClassName) {
                    if (startLineNumber <= viewRange.startLineNumber && viewRange.startLineNumber <= endLineNumber) {
                        const inlineDecoration = new viewModel_1.$bV(new range_1.$ks(viewRange.startLineNumber, viewRange.startColumn, viewRange.startLineNumber, viewRange.startColumn), decorationOptions.beforeContentClassName, 1 /* InlineDecorationType.Before */);
                        inlineDecorations[viewRange.startLineNumber - startLineNumber].push(inlineDecoration);
                    }
                }
                if (decorationOptions.afterContentClassName) {
                    if (startLineNumber <= viewRange.endLineNumber && viewRange.endLineNumber <= endLineNumber) {
                        const inlineDecoration = new viewModel_1.$bV(new range_1.$ks(viewRange.endLineNumber, viewRange.endColumn, viewRange.endLineNumber, viewRange.endColumn), decorationOptions.afterContentClassName, 2 /* InlineDecorationType.After */);
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
    exports.$mY = $mY;
    function $nY(model, decoration) {
        if (decoration.options.hideInCommentTokens && $oY(model, decoration)) {
            return false;
        }
        if (decoration.options.hideInStringTokens && $pY(model, decoration)) {
            return false;
        }
        return true;
    }
    exports.$nY = $nY;
    function $oY(model, decoration) {
        return testTokensInRange(model, decoration.range, (tokenType) => tokenType === 1 /* StandardTokenType.Comment */);
    }
    exports.$oY = $oY;
    function $pY(model, decoration) {
        return testTokensInRange(model, decoration.range, (tokenType) => tokenType === 2 /* StandardTokenType.String */);
    }
    exports.$pY = $pY;
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
//# sourceMappingURL=viewModelDecorations.js.map