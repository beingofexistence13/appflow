/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/fastDomNode", "vs/base/common/platform", "vs/editor/browser/viewParts/lines/rangeUtil", "vs/editor/browser/view/renderingContext", "vs/editor/common/viewLayout/lineDecorations", "vs/editor/common/viewLayout/viewLineRenderer", "vs/platform/theme/common/theme", "vs/editor/common/config/editorOptions"], function (require, exports, browser, fastDomNode_1, platform, rangeUtil_1, renderingContext_1, lineDecorations_1, viewLineRenderer_1, theme_1, editorOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ZW = exports.$YW = exports.$XW = void 0;
    const canUseFastRenderedViewLine = (function () {
        if (platform.$m) {
            // In VSCode we know very well when the zoom level changes
            return true;
        }
        if (platform.$k || browser.$5N || browser.$8N) {
            // On Linux, it appears that zooming affects char widths (in pixels), which is unexpected.
            // --
            // Even though we read character widths correctly, having read them at a specific zoom level
            // does not mean they are the same at the current zoom level.
            // --
            // This could be improved if we ever figure out how to get an event when browsers zoom,
            // but until then we have to stick with reading client rects.
            // --
            // The same has been observed with Firefox on Windows7
            // --
            // The same has been oversved with Safari
            return false;
        }
        return true;
    })();
    let monospaceAssumptionsAreValid = true;
    class $XW {
        constructor(config, themeType) {
            this.themeType = themeType;
            const options = config.options;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            const experimentalWhitespaceRendering = options.get(38 /* EditorOption.experimentalWhitespaceRendering */);
            if (experimentalWhitespaceRendering === 'off') {
                this.renderWhitespace = options.get(98 /* EditorOption.renderWhitespace */);
            }
            else {
                // whitespace is rendered in a different layer
                this.renderWhitespace = 'none';
            }
            this.renderControlCharacters = options.get(93 /* EditorOption.renderControlCharacters */);
            this.spaceWidth = fontInfo.spaceWidth;
            this.middotWidth = fontInfo.middotWidth;
            this.wsmiddotWidth = fontInfo.wsmiddotWidth;
            this.useMonospaceOptimizations = (fontInfo.isMonospace
                && !options.get(33 /* EditorOption.disableMonospaceOptimizations */));
            this.canUseHalfwidthRightwardsArrow = fontInfo.canUseHalfwidthRightwardsArrow;
            this.lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this.stopRenderingLineAfter = options.get(116 /* EditorOption.stopRenderingLineAfter */);
            this.fontLigatures = options.get(51 /* EditorOption.fontLigatures */);
        }
        equals(other) {
            return (this.themeType === other.themeType
                && this.renderWhitespace === other.renderWhitespace
                && this.renderControlCharacters === other.renderControlCharacters
                && this.spaceWidth === other.spaceWidth
                && this.middotWidth === other.middotWidth
                && this.wsmiddotWidth === other.wsmiddotWidth
                && this.useMonospaceOptimizations === other.useMonospaceOptimizations
                && this.canUseHalfwidthRightwardsArrow === other.canUseHalfwidthRightwardsArrow
                && this.lineHeight === other.lineHeight
                && this.stopRenderingLineAfter === other.stopRenderingLineAfter
                && this.fontLigatures === other.fontLigatures);
        }
    }
    exports.$XW = $XW;
    class $YW {
        static { this.CLASS_NAME = 'view-line'; }
        constructor(options) {
            this.a = options;
            this.b = true;
            this.c = null;
        }
        // --- begin IVisibleLineData
        getDomNode() {
            if (this.c && this.c.domNode) {
                return this.c.domNode.domNode;
            }
            return null;
        }
        setDomNode(domNode) {
            if (this.c) {
                this.c.domNode = (0, fastDomNode_1.$GP)(domNode);
            }
            else {
                throw new Error('I have no rendered view line to set the dom node to...');
            }
        }
        onContentChanged() {
            this.b = true;
        }
        onTokensChanged() {
            this.b = true;
        }
        onDecorationsChanged() {
            this.b = true;
        }
        onOptionsChanged(newOptions) {
            this.b = true;
            this.a = newOptions;
        }
        onSelectionChanged() {
            if ((0, theme_1.$ev)(this.a.themeType) || this.a.renderWhitespace === 'selection') {
                this.b = true;
                return true;
            }
            return false;
        }
        renderLine(lineNumber, deltaTop, viewportData, sb) {
            if (this.b === false) {
                // it appears that nothing relevant has changed
                return false;
            }
            this.b = false;
            const lineData = viewportData.getViewLineRenderingData(lineNumber);
            const options = this.a;
            const actualInlineDecorations = lineDecorations_1.$MW.filter(lineData.inlineDecorations, lineNumber, lineData.minColumn, lineData.maxColumn);
            // Only send selection information when needed for rendering whitespace
            let selectionsOnLine = null;
            if ((0, theme_1.$ev)(options.themeType) || this.a.renderWhitespace === 'selection') {
                const selections = viewportData.selections;
                for (const selection of selections) {
                    if (selection.endLineNumber < lineNumber || selection.startLineNumber > lineNumber) {
                        // Selection does not intersect line
                        continue;
                    }
                    const startColumn = (selection.startLineNumber === lineNumber ? selection.startColumn : lineData.minColumn);
                    const endColumn = (selection.endLineNumber === lineNumber ? selection.endColumn : lineData.maxColumn);
                    if (startColumn < endColumn) {
                        if ((0, theme_1.$ev)(options.themeType)) {
                            actualInlineDecorations.push(new lineDecorations_1.$MW(startColumn, endColumn, 'inline-selected-text', 0 /* InlineDecorationType.Regular */));
                        }
                        if (this.a.renderWhitespace === 'selection') {
                            if (!selectionsOnLine) {
                                selectionsOnLine = [];
                            }
                            selectionsOnLine.push(new viewLineRenderer_1.$PW(startColumn - 1, endColumn - 1));
                        }
                    }
                }
            }
            const renderLineInput = new viewLineRenderer_1.$QW(options.useMonospaceOptimizations, options.canUseHalfwidthRightwardsArrow, lineData.content, lineData.continuesWithWrappedLine, lineData.isBasicASCII, lineData.containsRTL, lineData.minColumn - 1, lineData.tokens, actualInlineDecorations, lineData.tabSize, lineData.startVisibleColumn, options.spaceWidth, options.middotWidth, options.wsmiddotWidth, options.stopRenderingLineAfter, options.renderWhitespace, options.renderControlCharacters, options.fontLigatures !== editorOptions_1.EditorFontLigatures.OFF, selectionsOnLine);
            if (this.c && this.c.input.equals(renderLineInput)) {
                // no need to do anything, we have the same render input
                return false;
            }
            sb.appendString('<div style="top:');
            sb.appendString(String(deltaTop));
            sb.appendString('px;height:');
            sb.appendString(String(this.a.lineHeight));
            sb.appendString('px;" class="');
            sb.appendString($YW.CLASS_NAME);
            sb.appendString('">');
            const output = (0, viewLineRenderer_1.$UW)(renderLineInput, sb);
            sb.appendString('</div>');
            let renderedViewLine = null;
            if (monospaceAssumptionsAreValid && canUseFastRenderedViewLine && lineData.isBasicASCII && options.useMonospaceOptimizations && output.containsForeignElements === 0 /* ForeignElementType.None */) {
                renderedViewLine = new FastRenderedViewLine(this.c ? this.c.domNode : null, renderLineInput, output.characterMapping);
            }
            if (!renderedViewLine) {
                renderedViewLine = createRenderedLine(this.c ? this.c.domNode : null, renderLineInput, output.characterMapping, output.containsRTL, output.containsForeignElements);
            }
            this.c = renderedViewLine;
            return true;
        }
        layoutLine(lineNumber, deltaTop) {
            if (this.c && this.c.domNode) {
                this.c.domNode.setTop(deltaTop);
                this.c.domNode.setHeight(this.a.lineHeight);
            }
        }
        // --- end IVisibleLineData
        getWidth(context) {
            if (!this.c) {
                return 0;
            }
            return this.c.getWidth(context);
        }
        getWidthIsFast() {
            if (!this.c) {
                return true;
            }
            return this.c.getWidthIsFast();
        }
        needsMonospaceFontCheck() {
            if (!this.c) {
                return false;
            }
            return (this.c instanceof FastRenderedViewLine);
        }
        monospaceAssumptionsAreValid() {
            if (!this.c) {
                return monospaceAssumptionsAreValid;
            }
            if (this.c instanceof FastRenderedViewLine) {
                return this.c.monospaceAssumptionsAreValid();
            }
            return monospaceAssumptionsAreValid;
        }
        onMonospaceAssumptionsInvalidated() {
            if (this.c && this.c instanceof FastRenderedViewLine) {
                this.c = this.c.toSlowRenderedLine();
            }
        }
        getVisibleRangesForRange(lineNumber, startColumn, endColumn, context) {
            if (!this.c) {
                return null;
            }
            startColumn = Math.min(this.c.input.lineContent.length + 1, Math.max(1, startColumn));
            endColumn = Math.min(this.c.input.lineContent.length + 1, Math.max(1, endColumn));
            const stopRenderingLineAfter = this.c.input.stopRenderingLineAfter;
            if (stopRenderingLineAfter !== -1 && startColumn > stopRenderingLineAfter + 1 && endColumn > stopRenderingLineAfter + 1) {
                // This range is obviously not visible
                return new renderingContext_1.$DW(true, [new renderingContext_1.$BW(this.getWidth(context), 0)]);
            }
            if (stopRenderingLineAfter !== -1 && startColumn > stopRenderingLineAfter + 1) {
                startColumn = stopRenderingLineAfter + 1;
            }
            if (stopRenderingLineAfter !== -1 && endColumn > stopRenderingLineAfter + 1) {
                endColumn = stopRenderingLineAfter + 1;
            }
            const horizontalRanges = this.c.getVisibleRangesForRange(lineNumber, startColumn, endColumn, context);
            if (horizontalRanges && horizontalRanges.length > 0) {
                return new renderingContext_1.$DW(false, horizontalRanges);
            }
            return null;
        }
        getColumnOfNodeOffset(spanNode, offset) {
            if (!this.c) {
                return 1;
            }
            return this.c.getColumnOfNodeOffset(spanNode, offset);
        }
    }
    exports.$YW = $YW;
    var Constants;
    (function (Constants) {
        /**
         * It seems that rounding errors occur with long lines, so the purely multiplication based
         * method is only viable for short lines. For longer lines, we look up the real position of
         * every 300th character and use multiplication based on that.
         *
         * See https://github.com/microsoft/vscode/issues/33178
         */
        Constants[Constants["MaxMonospaceDistance"] = 300] = "MaxMonospaceDistance";
    })(Constants || (Constants = {}));
    /**
     * A rendered line which is guaranteed to contain only regular ASCII and is rendered with a monospace font.
     */
    class FastRenderedViewLine {
        constructor(domNode, renderLineInput, characterMapping) {
            this.d = -1;
            this.domNode = domNode;
            this.input = renderLineInput;
            const keyColumnCount = Math.floor(renderLineInput.lineContent.length / 300 /* Constants.MaxMonospaceDistance */);
            if (keyColumnCount > 0) {
                this.c = new Float32Array(keyColumnCount);
                for (let i = 0; i < keyColumnCount; i++) {
                    this.c[i] = -1;
                }
            }
            else {
                this.c = null;
            }
            this.a = characterMapping;
            this.b = renderLineInput.spaceWidth;
        }
        getWidth(context) {
            if (!this.domNode || this.input.lineContent.length < 300 /* Constants.MaxMonospaceDistance */) {
                const horizontalOffset = this.a.getHorizontalOffset(this.a.length);
                return Math.round(this.b * horizontalOffset);
            }
            if (this.d === -1) {
                this.d = this.f(this.domNode).offsetWidth;
                context?.markDidDomLayout();
            }
            return this.d;
        }
        getWidthIsFast() {
            return (this.input.lineContent.length < 300 /* Constants.MaxMonospaceDistance */) || this.d !== -1;
        }
        monospaceAssumptionsAreValid() {
            if (!this.domNode) {
                return monospaceAssumptionsAreValid;
            }
            if (this.input.lineContent.length < 300 /* Constants.MaxMonospaceDistance */) {
                const expectedWidth = this.getWidth(null);
                const actualWidth = this.domNode.domNode.firstChild.offsetWidth;
                if (Math.abs(expectedWidth - actualWidth) >= 2) {
                    // more than 2px off
                    console.warn(`monospace assumptions have been violated, therefore disabling monospace optimizations!`);
                    monospaceAssumptionsAreValid = false;
                }
            }
            return monospaceAssumptionsAreValid;
        }
        toSlowRenderedLine() {
            return createRenderedLine(this.domNode, this.input, this.a, false, 0 /* ForeignElementType.None */);
        }
        getVisibleRangesForRange(lineNumber, startColumn, endColumn, context) {
            const startPosition = this.e(lineNumber, startColumn, context);
            const endPosition = this.e(lineNumber, endColumn, context);
            return [new renderingContext_1.$BW(startPosition, endPosition - startPosition)];
        }
        e(lineNumber, column, context) {
            if (column <= 300 /* Constants.MaxMonospaceDistance */) {
                const horizontalOffset = this.a.getHorizontalOffset(column);
                return this.b * horizontalOffset;
            }
            const keyColumnOrdinal = Math.floor((column - 1) / 300 /* Constants.MaxMonospaceDistance */) - 1;
            const keyColumn = (keyColumnOrdinal + 1) * 300 /* Constants.MaxMonospaceDistance */ + 1;
            let keyColumnPixelOffset = -1;
            if (this.c) {
                keyColumnPixelOffset = this.c[keyColumnOrdinal];
                if (keyColumnPixelOffset === -1) {
                    keyColumnPixelOffset = this.g(lineNumber, keyColumn, context);
                    this.c[keyColumnOrdinal] = keyColumnPixelOffset;
                }
            }
            if (keyColumnPixelOffset === -1) {
                // Could not read actual key column pixel offset
                const horizontalOffset = this.a.getHorizontalOffset(column);
                return this.b * horizontalOffset;
            }
            const keyColumnHorizontalOffset = this.a.getHorizontalOffset(keyColumn);
            const horizontalOffset = this.a.getHorizontalOffset(column);
            return keyColumnPixelOffset + this.b * (horizontalOffset - keyColumnHorizontalOffset);
        }
        f(myDomNode) {
            return myDomNode.domNode.firstChild;
        }
        g(lineNumber, column, context) {
            if (!this.domNode) {
                return -1;
            }
            const domPosition = this.a.getDomPosition(column);
            const r = rangeUtil_1.$KW.readHorizontalRanges(this.f(this.domNode), domPosition.partIndex, domPosition.charIndex, domPosition.partIndex, domPosition.charIndex, context);
            if (!r || r.length === 0) {
                return -1;
            }
            return r[0].left;
        }
        getColumnOfNodeOffset(spanNode, offset) {
            return $ZW(this.a, spanNode, offset);
        }
    }
    /**
     * Every time we render a line, we save what we have rendered in an instance of this class.
     */
    class RenderedViewLine {
        constructor(domNode, renderLineInput, characterMapping, containsRTL, containsForeignElements) {
            this.domNode = domNode;
            this.input = renderLineInput;
            this.a = characterMapping;
            this.b = /^\s*$/.test(renderLineInput.lineContent);
            this.c = containsForeignElements;
            this.d = -1;
            this.e = null;
            if (!containsRTL || this.a.length === 0 /* the line is empty */) {
                this.e = new Float32Array(Math.max(2, this.a.length + 1));
                for (let column = 0, len = this.a.length; column <= len; column++) {
                    this.e[column] = -1;
                }
            }
        }
        // --- Reading from the DOM methods
        f(myDomNode) {
            return myDomNode.domNode.firstChild;
        }
        /**
         * Width of the line in pixels
         */
        getWidth(context) {
            if (!this.domNode) {
                return 0;
            }
            if (this.d === -1) {
                this.d = this.f(this.domNode).offsetWidth;
                context?.markDidDomLayout();
            }
            return this.d;
        }
        getWidthIsFast() {
            if (this.d === -1) {
                return false;
            }
            return true;
        }
        /**
         * Visible ranges for a model range
         */
        getVisibleRangesForRange(lineNumber, startColumn, endColumn, context) {
            if (!this.domNode) {
                return null;
            }
            if (this.e !== null) {
                // the text is LTR
                const startOffset = this.h(this.domNode, lineNumber, startColumn, context);
                if (startOffset === -1) {
                    return null;
                }
                const endOffset = this.h(this.domNode, lineNumber, endColumn, context);
                if (endOffset === -1) {
                    return null;
                }
                return [new renderingContext_1.$BW(startOffset, endOffset - startOffset)];
            }
            return this.g(this.domNode, lineNumber, startColumn, endColumn, context);
        }
        g(domNode, lineNumber, startColumn, endColumn, context) {
            if (startColumn === endColumn) {
                const pixelOffset = this.h(domNode, lineNumber, startColumn, context);
                if (pixelOffset === -1) {
                    return null;
                }
                else {
                    return [new renderingContext_1.$BW(pixelOffset, 0)];
                }
            }
            else {
                return this.k(domNode, startColumn, endColumn, context);
            }
        }
        h(domNode, lineNumber, column, context) {
            if (this.a.length === 0) {
                // This line has no content
                if (this.c === 0 /* ForeignElementType.None */) {
                    // We can assume the line is really empty
                    return 0;
                }
                if (this.c === 2 /* ForeignElementType.After */) {
                    // We have foreign elements after the (empty) line
                    return 0;
                }
                if (this.c === 1 /* ForeignElementType.Before */) {
                    // We have foreign elements before the (empty) line
                    return this.getWidth(context);
                }
                // We have foreign elements before & after the (empty) line
                const readingTarget = this.f(domNode);
                if (readingTarget.firstChild) {
                    context.markDidDomLayout();
                    return readingTarget.firstChild.offsetWidth;
                }
                else {
                    return 0;
                }
            }
            if (this.e !== null) {
                // the text is LTR
                const cachedPixelOffset = this.e[column];
                if (cachedPixelOffset !== -1) {
                    return cachedPixelOffset;
                }
                const result = this.j(domNode, lineNumber, column, context);
                this.e[column] = result;
                return result;
            }
            return this.j(domNode, lineNumber, column, context);
        }
        j(domNode, lineNumber, column, context) {
            if (this.a.length === 0) {
                // This line has no content
                const r = rangeUtil_1.$KW.readHorizontalRanges(this.f(domNode), 0, 0, 0, 0, context);
                if (!r || r.length === 0) {
                    return -1;
                }
                return r[0].left;
            }
            if (column === this.a.length && this.b && this.c === 0 /* ForeignElementType.None */) {
                // This branch helps in the case of whitespace only lines which have a width set
                return this.getWidth(context);
            }
            const domPosition = this.a.getDomPosition(column);
            const r = rangeUtil_1.$KW.readHorizontalRanges(this.f(domNode), domPosition.partIndex, domPosition.charIndex, domPosition.partIndex, domPosition.charIndex, context);
            if (!r || r.length === 0) {
                return -1;
            }
            const result = r[0].left;
            if (this.input.isBasicASCII) {
                const horizontalOffset = this.a.getHorizontalOffset(column);
                const expectedResult = Math.round(this.input.spaceWidth * horizontalOffset);
                if (Math.abs(expectedResult - result) <= 1) {
                    return expectedResult;
                }
            }
            return result;
        }
        k(domNode, startColumn, endColumn, context) {
            if (startColumn === 1 && endColumn === this.a.length) {
                // This branch helps IE with bidi text & gives a performance boost to other browsers when reading visible ranges for an entire line
                return [new renderingContext_1.$BW(0, this.getWidth(context))];
            }
            const startDomPosition = this.a.getDomPosition(startColumn);
            const endDomPosition = this.a.getDomPosition(endColumn);
            return rangeUtil_1.$KW.readHorizontalRanges(this.f(domNode), startDomPosition.partIndex, startDomPosition.charIndex, endDomPosition.partIndex, endDomPosition.charIndex, context);
        }
        /**
         * Returns the column for the text found at a specific offset inside a rendered dom node
         */
        getColumnOfNodeOffset(spanNode, offset) {
            return $ZW(this.a, spanNode, offset);
        }
    }
    class WebKitRenderedViewLine extends RenderedViewLine {
        g(domNode, lineNumber, startColumn, endColumn, context) {
            const output = super.g(domNode, lineNumber, startColumn, endColumn, context);
            if (!output || output.length === 0 || startColumn === endColumn || (startColumn === 1 && endColumn === this.a.length)) {
                return output;
            }
            // WebKit is buggy and returns an expanded range (to contain words in some cases)
            // The last client rect is enlarged (I think)
            if (!this.input.containsRTL) {
                // This is an attempt to patch things up
                // Find position of last column
                const endPixelOffset = this.h(domNode, lineNumber, endColumn, context);
                if (endPixelOffset !== -1) {
                    const lastRange = output[output.length - 1];
                    if (lastRange.left < endPixelOffset) {
                        // Trim down the width of the last visible range to not go after the last column's position
                        lastRange.width = endPixelOffset - lastRange.left;
                    }
                }
            }
            return output;
        }
    }
    const createRenderedLine = (function () {
        if (browser.$6N) {
            return createWebKitRenderedLine;
        }
        return createNormalRenderedLine;
    })();
    function createWebKitRenderedLine(domNode, renderLineInput, characterMapping, containsRTL, containsForeignElements) {
        return new WebKitRenderedViewLine(domNode, renderLineInput, characterMapping, containsRTL, containsForeignElements);
    }
    function createNormalRenderedLine(domNode, renderLineInput, characterMapping, containsRTL, containsForeignElements) {
        return new RenderedViewLine(domNode, renderLineInput, characterMapping, containsRTL, containsForeignElements);
    }
    function $ZW(characterMapping, spanNode, offset) {
        const spanNodeTextContentLength = spanNode.textContent.length;
        let spanIndex = -1;
        while (spanNode) {
            spanNode = spanNode.previousSibling;
            spanIndex++;
        }
        return characterMapping.getColumn(new viewLineRenderer_1.$RW(spanIndex, offset), spanNodeTextContentLength);
    }
    exports.$ZW = $ZW;
});
//# sourceMappingURL=viewLine.js.map