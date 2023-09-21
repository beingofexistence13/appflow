/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/fastDomNode", "vs/base/common/platform", "vs/editor/browser/viewParts/lines/rangeUtil", "vs/editor/browser/view/renderingContext", "vs/editor/common/viewLayout/lineDecorations", "vs/editor/common/viewLayout/viewLineRenderer", "vs/platform/theme/common/theme", "vs/editor/common/config/editorOptions"], function (require, exports, browser, fastDomNode_1, platform, rangeUtil_1, renderingContext_1, lineDecorations_1, viewLineRenderer_1, theme_1, editorOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getColumnOfNodeOffset = exports.ViewLine = exports.ViewLineOptions = void 0;
    const canUseFastRenderedViewLine = (function () {
        if (platform.isNative) {
            // In VSCode we know very well when the zoom level changes
            return true;
        }
        if (platform.isLinux || browser.isFirefox || browser.isSafari) {
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
    class ViewLineOptions {
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
    exports.ViewLineOptions = ViewLineOptions;
    class ViewLine {
        static { this.CLASS_NAME = 'view-line'; }
        constructor(options) {
            this._options = options;
            this._isMaybeInvalid = true;
            this._renderedViewLine = null;
        }
        // --- begin IVisibleLineData
        getDomNode() {
            if (this._renderedViewLine && this._renderedViewLine.domNode) {
                return this._renderedViewLine.domNode.domNode;
            }
            return null;
        }
        setDomNode(domNode) {
            if (this._renderedViewLine) {
                this._renderedViewLine.domNode = (0, fastDomNode_1.createFastDomNode)(domNode);
            }
            else {
                throw new Error('I have no rendered view line to set the dom node to...');
            }
        }
        onContentChanged() {
            this._isMaybeInvalid = true;
        }
        onTokensChanged() {
            this._isMaybeInvalid = true;
        }
        onDecorationsChanged() {
            this._isMaybeInvalid = true;
        }
        onOptionsChanged(newOptions) {
            this._isMaybeInvalid = true;
            this._options = newOptions;
        }
        onSelectionChanged() {
            if ((0, theme_1.isHighContrast)(this._options.themeType) || this._options.renderWhitespace === 'selection') {
                this._isMaybeInvalid = true;
                return true;
            }
            return false;
        }
        renderLine(lineNumber, deltaTop, viewportData, sb) {
            if (this._isMaybeInvalid === false) {
                // it appears that nothing relevant has changed
                return false;
            }
            this._isMaybeInvalid = false;
            const lineData = viewportData.getViewLineRenderingData(lineNumber);
            const options = this._options;
            const actualInlineDecorations = lineDecorations_1.LineDecoration.filter(lineData.inlineDecorations, lineNumber, lineData.minColumn, lineData.maxColumn);
            // Only send selection information when needed for rendering whitespace
            let selectionsOnLine = null;
            if ((0, theme_1.isHighContrast)(options.themeType) || this._options.renderWhitespace === 'selection') {
                const selections = viewportData.selections;
                for (const selection of selections) {
                    if (selection.endLineNumber < lineNumber || selection.startLineNumber > lineNumber) {
                        // Selection does not intersect line
                        continue;
                    }
                    const startColumn = (selection.startLineNumber === lineNumber ? selection.startColumn : lineData.minColumn);
                    const endColumn = (selection.endLineNumber === lineNumber ? selection.endColumn : lineData.maxColumn);
                    if (startColumn < endColumn) {
                        if ((0, theme_1.isHighContrast)(options.themeType)) {
                            actualInlineDecorations.push(new lineDecorations_1.LineDecoration(startColumn, endColumn, 'inline-selected-text', 0 /* InlineDecorationType.Regular */));
                        }
                        if (this._options.renderWhitespace === 'selection') {
                            if (!selectionsOnLine) {
                                selectionsOnLine = [];
                            }
                            selectionsOnLine.push(new viewLineRenderer_1.LineRange(startColumn - 1, endColumn - 1));
                        }
                    }
                }
            }
            const renderLineInput = new viewLineRenderer_1.RenderLineInput(options.useMonospaceOptimizations, options.canUseHalfwidthRightwardsArrow, lineData.content, lineData.continuesWithWrappedLine, lineData.isBasicASCII, lineData.containsRTL, lineData.minColumn - 1, lineData.tokens, actualInlineDecorations, lineData.tabSize, lineData.startVisibleColumn, options.spaceWidth, options.middotWidth, options.wsmiddotWidth, options.stopRenderingLineAfter, options.renderWhitespace, options.renderControlCharacters, options.fontLigatures !== editorOptions_1.EditorFontLigatures.OFF, selectionsOnLine);
            if (this._renderedViewLine && this._renderedViewLine.input.equals(renderLineInput)) {
                // no need to do anything, we have the same render input
                return false;
            }
            sb.appendString('<div style="top:');
            sb.appendString(String(deltaTop));
            sb.appendString('px;height:');
            sb.appendString(String(this._options.lineHeight));
            sb.appendString('px;" class="');
            sb.appendString(ViewLine.CLASS_NAME);
            sb.appendString('">');
            const output = (0, viewLineRenderer_1.renderViewLine)(renderLineInput, sb);
            sb.appendString('</div>');
            let renderedViewLine = null;
            if (monospaceAssumptionsAreValid && canUseFastRenderedViewLine && lineData.isBasicASCII && options.useMonospaceOptimizations && output.containsForeignElements === 0 /* ForeignElementType.None */) {
                renderedViewLine = new FastRenderedViewLine(this._renderedViewLine ? this._renderedViewLine.domNode : null, renderLineInput, output.characterMapping);
            }
            if (!renderedViewLine) {
                renderedViewLine = createRenderedLine(this._renderedViewLine ? this._renderedViewLine.domNode : null, renderLineInput, output.characterMapping, output.containsRTL, output.containsForeignElements);
            }
            this._renderedViewLine = renderedViewLine;
            return true;
        }
        layoutLine(lineNumber, deltaTop) {
            if (this._renderedViewLine && this._renderedViewLine.domNode) {
                this._renderedViewLine.domNode.setTop(deltaTop);
                this._renderedViewLine.domNode.setHeight(this._options.lineHeight);
            }
        }
        // --- end IVisibleLineData
        getWidth(context) {
            if (!this._renderedViewLine) {
                return 0;
            }
            return this._renderedViewLine.getWidth(context);
        }
        getWidthIsFast() {
            if (!this._renderedViewLine) {
                return true;
            }
            return this._renderedViewLine.getWidthIsFast();
        }
        needsMonospaceFontCheck() {
            if (!this._renderedViewLine) {
                return false;
            }
            return (this._renderedViewLine instanceof FastRenderedViewLine);
        }
        monospaceAssumptionsAreValid() {
            if (!this._renderedViewLine) {
                return monospaceAssumptionsAreValid;
            }
            if (this._renderedViewLine instanceof FastRenderedViewLine) {
                return this._renderedViewLine.monospaceAssumptionsAreValid();
            }
            return monospaceAssumptionsAreValid;
        }
        onMonospaceAssumptionsInvalidated() {
            if (this._renderedViewLine && this._renderedViewLine instanceof FastRenderedViewLine) {
                this._renderedViewLine = this._renderedViewLine.toSlowRenderedLine();
            }
        }
        getVisibleRangesForRange(lineNumber, startColumn, endColumn, context) {
            if (!this._renderedViewLine) {
                return null;
            }
            startColumn = Math.min(this._renderedViewLine.input.lineContent.length + 1, Math.max(1, startColumn));
            endColumn = Math.min(this._renderedViewLine.input.lineContent.length + 1, Math.max(1, endColumn));
            const stopRenderingLineAfter = this._renderedViewLine.input.stopRenderingLineAfter;
            if (stopRenderingLineAfter !== -1 && startColumn > stopRenderingLineAfter + 1 && endColumn > stopRenderingLineAfter + 1) {
                // This range is obviously not visible
                return new renderingContext_1.VisibleRanges(true, [new renderingContext_1.FloatHorizontalRange(this.getWidth(context), 0)]);
            }
            if (stopRenderingLineAfter !== -1 && startColumn > stopRenderingLineAfter + 1) {
                startColumn = stopRenderingLineAfter + 1;
            }
            if (stopRenderingLineAfter !== -1 && endColumn > stopRenderingLineAfter + 1) {
                endColumn = stopRenderingLineAfter + 1;
            }
            const horizontalRanges = this._renderedViewLine.getVisibleRangesForRange(lineNumber, startColumn, endColumn, context);
            if (horizontalRanges && horizontalRanges.length > 0) {
                return new renderingContext_1.VisibleRanges(false, horizontalRanges);
            }
            return null;
        }
        getColumnOfNodeOffset(spanNode, offset) {
            if (!this._renderedViewLine) {
                return 1;
            }
            return this._renderedViewLine.getColumnOfNodeOffset(spanNode, offset);
        }
    }
    exports.ViewLine = ViewLine;
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
            this._cachedWidth = -1;
            this.domNode = domNode;
            this.input = renderLineInput;
            const keyColumnCount = Math.floor(renderLineInput.lineContent.length / 300 /* Constants.MaxMonospaceDistance */);
            if (keyColumnCount > 0) {
                this._keyColumnPixelOffsetCache = new Float32Array(keyColumnCount);
                for (let i = 0; i < keyColumnCount; i++) {
                    this._keyColumnPixelOffsetCache[i] = -1;
                }
            }
            else {
                this._keyColumnPixelOffsetCache = null;
            }
            this._characterMapping = characterMapping;
            this._charWidth = renderLineInput.spaceWidth;
        }
        getWidth(context) {
            if (!this.domNode || this.input.lineContent.length < 300 /* Constants.MaxMonospaceDistance */) {
                const horizontalOffset = this._characterMapping.getHorizontalOffset(this._characterMapping.length);
                return Math.round(this._charWidth * horizontalOffset);
            }
            if (this._cachedWidth === -1) {
                this._cachedWidth = this._getReadingTarget(this.domNode).offsetWidth;
                context?.markDidDomLayout();
            }
            return this._cachedWidth;
        }
        getWidthIsFast() {
            return (this.input.lineContent.length < 300 /* Constants.MaxMonospaceDistance */) || this._cachedWidth !== -1;
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
            return createRenderedLine(this.domNode, this.input, this._characterMapping, false, 0 /* ForeignElementType.None */);
        }
        getVisibleRangesForRange(lineNumber, startColumn, endColumn, context) {
            const startPosition = this._getColumnPixelOffset(lineNumber, startColumn, context);
            const endPosition = this._getColumnPixelOffset(lineNumber, endColumn, context);
            return [new renderingContext_1.FloatHorizontalRange(startPosition, endPosition - startPosition)];
        }
        _getColumnPixelOffset(lineNumber, column, context) {
            if (column <= 300 /* Constants.MaxMonospaceDistance */) {
                const horizontalOffset = this._characterMapping.getHorizontalOffset(column);
                return this._charWidth * horizontalOffset;
            }
            const keyColumnOrdinal = Math.floor((column - 1) / 300 /* Constants.MaxMonospaceDistance */) - 1;
            const keyColumn = (keyColumnOrdinal + 1) * 300 /* Constants.MaxMonospaceDistance */ + 1;
            let keyColumnPixelOffset = -1;
            if (this._keyColumnPixelOffsetCache) {
                keyColumnPixelOffset = this._keyColumnPixelOffsetCache[keyColumnOrdinal];
                if (keyColumnPixelOffset === -1) {
                    keyColumnPixelOffset = this._actualReadPixelOffset(lineNumber, keyColumn, context);
                    this._keyColumnPixelOffsetCache[keyColumnOrdinal] = keyColumnPixelOffset;
                }
            }
            if (keyColumnPixelOffset === -1) {
                // Could not read actual key column pixel offset
                const horizontalOffset = this._characterMapping.getHorizontalOffset(column);
                return this._charWidth * horizontalOffset;
            }
            const keyColumnHorizontalOffset = this._characterMapping.getHorizontalOffset(keyColumn);
            const horizontalOffset = this._characterMapping.getHorizontalOffset(column);
            return keyColumnPixelOffset + this._charWidth * (horizontalOffset - keyColumnHorizontalOffset);
        }
        _getReadingTarget(myDomNode) {
            return myDomNode.domNode.firstChild;
        }
        _actualReadPixelOffset(lineNumber, column, context) {
            if (!this.domNode) {
                return -1;
            }
            const domPosition = this._characterMapping.getDomPosition(column);
            const r = rangeUtil_1.RangeUtil.readHorizontalRanges(this._getReadingTarget(this.domNode), domPosition.partIndex, domPosition.charIndex, domPosition.partIndex, domPosition.charIndex, context);
            if (!r || r.length === 0) {
                return -1;
            }
            return r[0].left;
        }
        getColumnOfNodeOffset(spanNode, offset) {
            return getColumnOfNodeOffset(this._characterMapping, spanNode, offset);
        }
    }
    /**
     * Every time we render a line, we save what we have rendered in an instance of this class.
     */
    class RenderedViewLine {
        constructor(domNode, renderLineInput, characterMapping, containsRTL, containsForeignElements) {
            this.domNode = domNode;
            this.input = renderLineInput;
            this._characterMapping = characterMapping;
            this._isWhitespaceOnly = /^\s*$/.test(renderLineInput.lineContent);
            this._containsForeignElements = containsForeignElements;
            this._cachedWidth = -1;
            this._pixelOffsetCache = null;
            if (!containsRTL || this._characterMapping.length === 0 /* the line is empty */) {
                this._pixelOffsetCache = new Float32Array(Math.max(2, this._characterMapping.length + 1));
                for (let column = 0, len = this._characterMapping.length; column <= len; column++) {
                    this._pixelOffsetCache[column] = -1;
                }
            }
        }
        // --- Reading from the DOM methods
        _getReadingTarget(myDomNode) {
            return myDomNode.domNode.firstChild;
        }
        /**
         * Width of the line in pixels
         */
        getWidth(context) {
            if (!this.domNode) {
                return 0;
            }
            if (this._cachedWidth === -1) {
                this._cachedWidth = this._getReadingTarget(this.domNode).offsetWidth;
                context?.markDidDomLayout();
            }
            return this._cachedWidth;
        }
        getWidthIsFast() {
            if (this._cachedWidth === -1) {
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
            if (this._pixelOffsetCache !== null) {
                // the text is LTR
                const startOffset = this._readPixelOffset(this.domNode, lineNumber, startColumn, context);
                if (startOffset === -1) {
                    return null;
                }
                const endOffset = this._readPixelOffset(this.domNode, lineNumber, endColumn, context);
                if (endOffset === -1) {
                    return null;
                }
                return [new renderingContext_1.FloatHorizontalRange(startOffset, endOffset - startOffset)];
            }
            return this._readVisibleRangesForRange(this.domNode, lineNumber, startColumn, endColumn, context);
        }
        _readVisibleRangesForRange(domNode, lineNumber, startColumn, endColumn, context) {
            if (startColumn === endColumn) {
                const pixelOffset = this._readPixelOffset(domNode, lineNumber, startColumn, context);
                if (pixelOffset === -1) {
                    return null;
                }
                else {
                    return [new renderingContext_1.FloatHorizontalRange(pixelOffset, 0)];
                }
            }
            else {
                return this._readRawVisibleRangesForRange(domNode, startColumn, endColumn, context);
            }
        }
        _readPixelOffset(domNode, lineNumber, column, context) {
            if (this._characterMapping.length === 0) {
                // This line has no content
                if (this._containsForeignElements === 0 /* ForeignElementType.None */) {
                    // We can assume the line is really empty
                    return 0;
                }
                if (this._containsForeignElements === 2 /* ForeignElementType.After */) {
                    // We have foreign elements after the (empty) line
                    return 0;
                }
                if (this._containsForeignElements === 1 /* ForeignElementType.Before */) {
                    // We have foreign elements before the (empty) line
                    return this.getWidth(context);
                }
                // We have foreign elements before & after the (empty) line
                const readingTarget = this._getReadingTarget(domNode);
                if (readingTarget.firstChild) {
                    context.markDidDomLayout();
                    return readingTarget.firstChild.offsetWidth;
                }
                else {
                    return 0;
                }
            }
            if (this._pixelOffsetCache !== null) {
                // the text is LTR
                const cachedPixelOffset = this._pixelOffsetCache[column];
                if (cachedPixelOffset !== -1) {
                    return cachedPixelOffset;
                }
                const result = this._actualReadPixelOffset(domNode, lineNumber, column, context);
                this._pixelOffsetCache[column] = result;
                return result;
            }
            return this._actualReadPixelOffset(domNode, lineNumber, column, context);
        }
        _actualReadPixelOffset(domNode, lineNumber, column, context) {
            if (this._characterMapping.length === 0) {
                // This line has no content
                const r = rangeUtil_1.RangeUtil.readHorizontalRanges(this._getReadingTarget(domNode), 0, 0, 0, 0, context);
                if (!r || r.length === 0) {
                    return -1;
                }
                return r[0].left;
            }
            if (column === this._characterMapping.length && this._isWhitespaceOnly && this._containsForeignElements === 0 /* ForeignElementType.None */) {
                // This branch helps in the case of whitespace only lines which have a width set
                return this.getWidth(context);
            }
            const domPosition = this._characterMapping.getDomPosition(column);
            const r = rangeUtil_1.RangeUtil.readHorizontalRanges(this._getReadingTarget(domNode), domPosition.partIndex, domPosition.charIndex, domPosition.partIndex, domPosition.charIndex, context);
            if (!r || r.length === 0) {
                return -1;
            }
            const result = r[0].left;
            if (this.input.isBasicASCII) {
                const horizontalOffset = this._characterMapping.getHorizontalOffset(column);
                const expectedResult = Math.round(this.input.spaceWidth * horizontalOffset);
                if (Math.abs(expectedResult - result) <= 1) {
                    return expectedResult;
                }
            }
            return result;
        }
        _readRawVisibleRangesForRange(domNode, startColumn, endColumn, context) {
            if (startColumn === 1 && endColumn === this._characterMapping.length) {
                // This branch helps IE with bidi text & gives a performance boost to other browsers when reading visible ranges for an entire line
                return [new renderingContext_1.FloatHorizontalRange(0, this.getWidth(context))];
            }
            const startDomPosition = this._characterMapping.getDomPosition(startColumn);
            const endDomPosition = this._characterMapping.getDomPosition(endColumn);
            return rangeUtil_1.RangeUtil.readHorizontalRanges(this._getReadingTarget(domNode), startDomPosition.partIndex, startDomPosition.charIndex, endDomPosition.partIndex, endDomPosition.charIndex, context);
        }
        /**
         * Returns the column for the text found at a specific offset inside a rendered dom node
         */
        getColumnOfNodeOffset(spanNode, offset) {
            return getColumnOfNodeOffset(this._characterMapping, spanNode, offset);
        }
    }
    class WebKitRenderedViewLine extends RenderedViewLine {
        _readVisibleRangesForRange(domNode, lineNumber, startColumn, endColumn, context) {
            const output = super._readVisibleRangesForRange(domNode, lineNumber, startColumn, endColumn, context);
            if (!output || output.length === 0 || startColumn === endColumn || (startColumn === 1 && endColumn === this._characterMapping.length)) {
                return output;
            }
            // WebKit is buggy and returns an expanded range (to contain words in some cases)
            // The last client rect is enlarged (I think)
            if (!this.input.containsRTL) {
                // This is an attempt to patch things up
                // Find position of last column
                const endPixelOffset = this._readPixelOffset(domNode, lineNumber, endColumn, context);
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
        if (browser.isWebKit) {
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
    function getColumnOfNodeOffset(characterMapping, spanNode, offset) {
        const spanNodeTextContentLength = spanNode.textContent.length;
        let spanIndex = -1;
        while (spanNode) {
            spanNode = spanNode.previousSibling;
            spanIndex++;
        }
        return characterMapping.getColumn(new viewLineRenderer_1.DomPosition(spanIndex, offset), spanNodeTextContentLength);
    }
    exports.getColumnOfNodeOffset = getColumnOfNodeOffset;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0xpbmUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci92aWV3UGFydHMvbGluZXMvdmlld0xpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0JoRyxNQUFNLDBCQUEwQixHQUFHLENBQUM7UUFDbkMsSUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFO1lBQ3RCLDBEQUEwRDtZQUMxRCxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBSSxRQUFRLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxTQUFTLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRTtZQUM5RCwwRkFBMEY7WUFDMUYsS0FBSztZQUNMLDRGQUE0RjtZQUM1Riw2REFBNkQ7WUFDN0QsS0FBSztZQUNMLHVGQUF1RjtZQUN2Riw2REFBNkQ7WUFDN0QsS0FBSztZQUNMLHNEQUFzRDtZQUN0RCxLQUFLO1lBQ0wseUNBQXlDO1lBQ3pDLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFTCxJQUFJLDRCQUE0QixHQUFHLElBQUksQ0FBQztJQUV4QyxNQUFhLGVBQWU7UUFhM0IsWUFBWSxNQUE0QixFQUFFLFNBQXNCO1lBQy9ELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzNCLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7WUFDL0IsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsZ0NBQXVCLENBQUM7WUFDcEQsTUFBTSwrQkFBK0IsR0FBRyxPQUFPLENBQUMsR0FBRyx1REFBOEMsQ0FBQztZQUNsRyxJQUFJLCtCQUErQixLQUFLLEtBQUssRUFBRTtnQkFDOUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxHQUFHLHdDQUErQixDQUFDO2FBQ25FO2lC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