/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/trustedTypes", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/editor/browser/viewParts/lines/viewLine", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/core/position", "vs/editor/common/core/stringBuilder", "vs/editor/common/viewLayout/lineDecorations", "vs/editor/common/viewLayout/viewLineRenderer", "vs/editor/contrib/folding/browser/foldingDecorations", "vs/css!./stickyScroll"], function (require, exports, dom, trustedTypes_1, arrays_1, lifecycle_1, themables_1, viewLine_1, embeddedCodeEditorWidget_1, position_1, stringBuilder_1, lineDecorations_1, viewLineRenderer_1, foldingDecorations_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StickyScrollWidget = exports.StickyScrollWidgetState = void 0;
    class StickyScrollWidgetState {
        constructor(startLineNumbers, endLineNumbers, lastLineRelativePosition, showEndForLine = null) {
            this.startLineNumbers = startLineNumbers;
            this.endLineNumbers = endLineNumbers;
            this.lastLineRelativePosition = lastLineRelativePosition;
            this.showEndForLine = showEndForLine;
        }
        equals(other) {
            return !!other
                && this.lastLineRelativePosition === other.lastLineRelativePosition
                && this.showEndForLine === other.showEndForLine
                && (0, arrays_1.equals)(this.startLineNumbers, other.startLineNumbers)
                && (0, arrays_1.equals)(this.endLineNumbers, other.endLineNumbers);
        }
    }
    exports.StickyScrollWidgetState = StickyScrollWidgetState;
    const _ttPolicy = (0, trustedTypes_1.createTrustedTypesPolicy)('stickyScrollViewLayer', { createHTML: value => value });
    const STICKY_INDEX_ATTR = 'data-sticky-line-index';
    const STICKY_IS_LINE_ATTR = 'data-sticky-is-line';
    const STICKY_IS_LINE_NUMBER_ATTR = 'data-sticky-is-line-number';
    const STICKY_IS_FOLDING_ICON_ATTR = 'data-sticky-is-folding-icon';
    class StickyScrollWidget extends lifecycle_1.Disposable {
        constructor(_editor) {
            super();
            this._editor = _editor;
            this._foldingIconStore = new lifecycle_1.DisposableStore();
            this._rootDomNode = document.createElement('div');
            this._lineNumbersDomNode = document.createElement('div');
            this._linesDomNodeScrollable = document.createElement('div');
            this._linesDomNode = document.createElement('div');
            this._lineHeight = this._editor.getOption(66 /* EditorOption.lineHeight */);
            this._stickyLines = [];
            this._lineNumbers = [];
            this._lastLineRelativePosition = 0;
            this._minContentWidthInPx = 0;
            this._isOnGlyphMargin = false;
            this._lineNumbersDomNode.className = 'sticky-widget-line-numbers';
            this._lineNumbersDomNode.setAttribute('role', 'none');
            this._linesDomNode.className = 'sticky-widget-lines';
            this._linesDomNode.setAttribute('role', 'list');
            this._linesDomNodeScrollable.className = 'sticky-widget-lines-scrollable';
            this._linesDomNodeScrollable.appendChild(this._linesDomNode);
            this._rootDomNode.className = 'sticky-widget';
            this._rootDomNode.classList.toggle('peek', _editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget);
            this._rootDomNode.appendChild(this._lineNumbersDomNode);
            this._rootDomNode.appendChild(this._linesDomNodeScrollable);
            const updateScrollLeftPosition = () => {
                this._linesDomNode.style.left = this._editor.getOption(114 /* EditorOption.stickyScroll */).scrollWithEditor ? `-${this._editor.getScrollLeft()}px` : '0px';
            };
            this._register(this._editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(114 /* EditorOption.stickyScroll */)) {
                    updateScrollLeftPosition();
                }
                if (e.hasChanged(66 /* EditorOption.lineHeight */)) {
                    this._lineHeight = this._editor.getOption(66 /* EditorOption.lineHeight */);
                }
            }));
            this._register(this._editor.onDidScrollChange((e) => {
                if (e.scrollLeftChanged) {
                    updateScrollLeftPosition();
                }
                if (e.scrollWidthChanged) {
                    this._updateWidgetWidth();
                }
            }));
            this._register(this._editor.onDidChangeModel(() => {
                updateScrollLeftPosition();
                this._updateWidgetWidth();
            }));
            this._register(this._foldingIconStore);
            updateScrollLeftPosition();
            this._register(this._editor.onDidLayoutChange((e) => {
                this._updateWidgetWidth();
            }));
            this._updateWidgetWidth();
        }
        get lineNumbers() {
            return this._lineNumbers;
        }
        get lineNumberCount() {
            return this._lineNumbers.length;
        }
        getStickyLineForLine(lineNumber) {
            return this._stickyLines.find(stickyLine => stickyLine.lineNumber === lineNumber);
        }
        getCurrentLines() {
            return this._lineNumbers;
        }
        setState(state, foldingModel, rebuildFromLine = Infinity) {
            if (((!this._previousState && !state) || (this._previousState && this._previousState.equals(state)))
                && rebuildFromLine === Infinity) {
                return;
            }
            this._previousState = state;
            const previousStickyLines = this._stickyLines;
            this._clearStickyWidget();
            if (!state || !this._editor._getViewModel()) {
                return;
            }
            const futureWidgetHeight = state.startLineNumbers.length * this._lineHeight + state.lastLineRelativePosition;
            if (futureWidgetHeight > 0) {
                this._lastLineRelativePosition = state.lastLineRelativePosition;
                const lineNumbers = [...state.startLineNumbers];
                if (state.showEndForLine !== null) {
                    lineNumbers[state.showEndForLine] = state.endLineNumbers[state.showEndForLine];
                }
                this._lineNumbers = lineNumbers;
            }
            else {
                this._lastLineRelativePosition = 0;
                this._lineNumbers = [];
            }
            this._renderRootNode(previousStickyLines, foldingModel, rebuildFromLine);
        }
        _updateWidgetWidth() {
            const layoutInfo = this._editor.getLayoutInfo();
            const lineNumbersWidth = layoutInfo.contentLeft;
            this._lineNumbersDomNode.style.width = `${lineNumbersWidth}px`;
            this._linesDomNodeScrollable.style.setProperty('--vscode-editorStickyScroll-scrollableWidth', `${this._editor.getScrollWidth() - layoutInfo.verticalScrollbarWidth}px`);
            this._rootDomNode.style.width = `${layoutInfo.width - layoutInfo.verticalScrollbarWidth}px`;
        }
        _clearStickyWidget() {
            this._stickyLines = [];
            this._foldingIconStore.clear();
            dom.clearNode(this._lineNumbersDomNode);
            dom.clearNode(this._linesDomNode);
            this._rootDomNode.style.display = 'none';
        }
        _useFoldingOpacityTransition(requireTransitions) {
            this._lineNumbersDomNode.style.setProperty('--vscode-editorStickyScroll-foldingOpacityTransition', `opacity ${requireTransitions ? 0.5 : 0}s`);
        }
        _setFoldingIconsVisibility(allVisible) {
            for (const line of this._stickyLines) {
                const foldingIcon = line.foldingIcon;
                if (!foldingIcon) {
                    continue;
                }
                foldingIcon.setVisible(allVisible ? true : foldingIcon.isCollapsed);
            }
        }
        async _renderRootNode(previousStickyLines, foldingModel, rebuildFromLine = Infinity) {
            const layoutInfo = this._editor.getLayoutInfo();
            for (const [index, line] of this._lineNumbers.entries()) {
                const previousStickyLine = previousStickyLines[index];
                const stickyLine = (line >= rebuildFromLine || previousStickyLine?.lineNumber !== line)
                    ? this._renderChildNode(index, line, foldingModel, layoutInfo)
                    : this._updateTopAndZIndexOfStickyLine(previousStickyLine);
                if (!stickyLine) {
                    continue;
                }
                this._linesDomNode.appendChild(stickyLine.lineDomNode);
                this._lineNumbersDomNode.appendChild(stickyLine.lineNumberDomNode);
                this._stickyLines.push(stickyLine);
            }
            if (foldingModel) {
                this._setFoldingHoverListeners();
                this._useFoldingOpacityTransition(!this._isOnGlyphMargin);
            }
            const widgetHeight = this._lineNumbers.length * this._lineHeight + this._lastLineRelativePosition;
            if (widgetHeight === 0) {
                this._clearStickyWidget();
                return;
            }
            this._rootDomNode.style.display = 'block';
            this._lineNumbersDomNode.style.height = `${widgetHeight}px`;
            this._linesDomNodeScrollable.style.height = `${widgetHeight}px`;
            this._rootDomNode.style.height = `${widgetHeight}px`;
            this._rootDomNode.style.marginLeft = '0px';
            this._updateMinContentWidth();
            this._editor.layoutOverlayWidget(this);
        }
        _setFoldingHoverListeners() {
            const showFoldingControls = this._editor.getOption(109 /* EditorOption.showFoldingControls */);
            if (showFoldingControls !== 'mouseover') {
                return;
            }
            this._foldingIconStore.add(dom.addDisposableListener(this._lineNumbersDomNode, dom.EventType.MOUSE_ENTER, (e) => {
                this._isOnGlyphMargin = true;
                this._setFoldingIconsVisibility(true);
            }));
            this._foldingIconStore.add(dom.addDisposableListener(this._lineNumbersDomNode, dom.EventType.MOUSE_LEAVE, () => {
                this._isOnGlyphMargin = false;
                this._useFoldingOpacityTransition(true);
                this._setFoldingIconsVisibility(false);
            }));
        }
        _renderChildNode(index, line, foldingModel, layoutInfo) {
            const viewModel = this._editor._getViewModel();
            if (!viewModel) {
                return;
            }
            const viewLineNumber = viewModel.coordinatesConverter.convertModelPositionToViewPosition(new position_1.Position(line, 1)).lineNumber;
            const lineRenderingData = viewModel.getViewLineRenderingData(viewLineNumber);
            const lineNumberOption = this._editor.getOption(67 /* EditorOption.lineNumbers */);
            let actualInlineDecorations;
            try {
                actualInlineDecorations = lineDecorations_1.LineDecoration.filter(lineRenderingData.inlineDecorations, viewLineNumber, lineRenderingData.minColumn, lineRenderingData.maxColumn);
            }
            catch (err) {
                actualInlineDecorations = [];
            }
            const renderLineInput = new viewLineRenderer_1.RenderLineInput(true, true, lineRenderingData.content, lineRenderingData.continuesWithWrappedLine, lineRenderingData.isBasicASCII, lineRenderingData.containsRTL, 0, lineRenderingData.tokens, actualInlineDecorations, lineRenderingData.tabSize, lineRenderingData.startVisibleColumn, 1, 1, 1, 500, 'none', true, true, null);
            const sb = new stringBuilder_1.StringBuilder(2000);
            const renderOutput = (0, viewLineRenderer_1.renderViewLine)(renderLineInput, sb);
            let newLine;
            if (_ttPolicy) {
                newLine = _ttPolicy.createHTML(sb.build());
            }
            else {
                newLine = sb.build();
            }
            const lineHTMLNode = document.createElement('span');
            lineHTMLNode.setAttribute(STICKY_INDEX_ATTR, String(index));
            lineHTMLNode.setAttribute(STICKY_IS_LINE_ATTR, '');
            lineHTMLNode.setAttribute('role', 'listitem');
            lineHTMLNode.tabIndex = 0;
            lineHTMLNode.className = 'sticky-line-content';
            lineHTMLNode.classList.add(`stickyLine${line}`);
            lineHTMLNode.style.lineHeight = `${this._lineHeight}px`;
            lineHTMLNode.innerHTML = newLine;
            const lineNumberHTMLNode = document.createElement('span');
            lineNumberHTMLNode.setAttribute(STICKY_INDEX_ATTR, String(index));
            lineNumberHTMLNode.setAttribute(STICKY_IS_LINE_NUMBER_ATTR, '');
            lineNumberHTMLNode.className = 'sticky-line-number';
            lineNumberHTMLNode.style.lineHeight = `${this._lineHeight}px`;
            const lineNumbersWidth = layoutInfo.contentLeft;
            lineNumberHTMLNode.style.width = `${lineNumbersWidth}px`;
            const innerLineNumberHTML = document.createElement('span');
            if (lineNumberOption.renderType === 1 /* RenderLineNumbersType.On */ || lineNumberOption.renderType === 3 /* RenderLineNumbersType.Interval */ && line % 10 === 0) {
                innerLineNumberHTML.innerText = line.toString();
            }
            else if (lineNumberOption.renderType === 2 /* RenderLineNumbersType.Relative */) {
                innerLineNumberHTML.innerText = Math.abs(line - this._editor.getPosition().lineNumber).toString();
            }
            innerLineNumberHTML.className = 'sticky-line-number-inner';
            innerLineNumberHTML.style.lineHeight = `${this._lineHeight}px`;
            innerLineNumberHTML.style.width = `${layoutInfo.lineNumbersWidth}px`;
            innerLineNumberHTML.style.paddingLeft = `${layoutInfo.lineNumbersLeft}px`;
            lineNumberHTMLNode.appendChild(innerLineNumberHTML);
            const foldingIcon = this._renderFoldingIconForLine(foldingModel, line);
            if (foldingIcon) {
                lineNumberHTMLNode.appendChild(foldingIcon.domNode);
            }
            this._editor.applyFontInfo(lineHTMLNode);
            this._editor.applyFontInfo(innerLineNumberHTML);
            lineNumberHTMLNode.style.lineHeight = `${this._lineHeight}px`;
            lineHTMLNode.style.lineHeight = `${this._lineHeight}px`;
            lineNumberHTMLNode.style.height = `${this._lineHeight}px`;
            lineHTMLNode.style.height = `${this._lineHeight}px`;
            const renderedLine = new RenderedStickyLine(index, line, lineHTMLNode, lineNumberHTMLNode, foldingIcon, renderOutput.characterMapping);
            return this._updateTopAndZIndexOfStickyLine(renderedLine);
        }
        _updateTopAndZIndexOfStickyLine(stickyLine) {
            const index = stickyLine.index;
            const lineHTMLNode = stickyLine.lineDomNode;
            const lineNumberHTMLNode = stickyLine.lineNumberDomNode;
            const isLastLine = index === this._lineNumbers.length - 1;
            const lastLineZIndex = '0';
            const intermediateLineZIndex = '1';
            lineHTMLNode.style.zIndex = isLastLine ? lastLineZIndex : intermediateLineZIndex;
            lineNumberHTMLNode.style.zIndex = isLastLine ? lastLineZIndex : intermediateLineZIndex;
            const lastLineTop = `${index * this._lineHeight + this._lastLineRelativePosition + (stickyLine.foldingIcon?.isCollapsed ? 1 : 0)}px`;
            const intermediateLineTop = `${index * this._lineHeight}px`;
            lineHTMLNode.style.top = isLastLine ? lastLineTop : intermediateLineTop;
            lineNumberHTMLNode.style.top = isLastLine ? lastLineTop : intermediateLineTop;
            return stickyLine;
        }
        _renderFoldingIconForLine(foldingModel, line) {
            const showFoldingControls = this._editor.getOption(109 /* EditorOption.showFoldingControls */);
            if (!foldingModel || showFoldingControls === 'never') {
                return;
            }
            const foldingRegions = foldingModel.regions;
            const indexOfFoldingRegion = foldingRegions.findRange(line);
            const startLineNumber = foldingRegions.getStartLineNumber(indexOfFoldingRegion);
            const isFoldingScope = line === startLineNumber;
            if (!isFoldingScope) {
                return;
            }
            const isCollapsed = foldingRegions.isCollapsed(indexOfFoldingRegion);
            const foldingIcon = new StickyFoldingIcon(isCollapsed, startLineNumber, foldingRegions.getEndLineNumber(indexOfFoldingRegion), this._lineHeight);
            foldingIcon.setVisible(this._isOnGlyphMargin ? true : (isCollapsed || showFoldingControls === 'always'));
            foldingIcon.domNode.setAttribute(STICKY_IS_FOLDING_ICON_ATTR, '');
            return foldingIcon;
        }
        _updateMinContentWidth() {
            this._minContentWidthInPx = 0;
            for (const stickyLine of this._stickyLines) {
                if (stickyLine.lineDomNode.scrollWidth > this._minContentWidthInPx) {
                    this._minContentWidthInPx = stickyLine.lineDomNode.scrollWidth;
                }
            }
            this._minContentWidthInPx += this._editor.getLayoutInfo().verticalScrollbarWidth;
        }
        getId() {
            return 'editor.contrib.stickyScrollWidget';
        }
        getDomNode() {
            return this._rootDomNode;
        }
        getPosition() {
            return {
                preference: null
            };
        }
        getMinContentWidthInPx() {
            return this._minContentWidthInPx;
        }
        focusLineWithIndex(index) {
            if (0 <= index && index < this._stickyLines.length) {
                this._stickyLines[index].lineDomNode.focus();
            }
        }
        /**
         * Given a leaf dom node, tries to find the editor position.
         */
        getEditorPositionFromNode(spanDomNode) {
            if (!spanDomNode || spanDomNode.children.length > 0) {
                // This is not a leaf node
                return null;
            }
            const renderedStickyLine = this._getRenderedStickyLineFromChildDomNode(spanDomNode);
            if (!renderedStickyLine) {
                return null;
            }
            const column = (0, viewLine_1.getColumnOfNodeOffset)(renderedStickyLine.characterMapping, spanDomNode, 0);
            return new position_1.Position(renderedStickyLine.lineNumber, column);
        }
        getLineNumberFromChildDomNode(domNode) {
            return this._getRenderedStickyLineFromChildDomNode(domNode)?.lineNumber ?? null;
        }
        _getRenderedStickyLineFromChildDomNode(domNode) {
            const index = this.getLineIndexFromChildDomNode(domNode);
            if (index === null || index < 0 || index >= this._stickyLines.length) {
                return null;
            }
            return this._stickyLines[index];
        }
        /**
         * Given a child dom node, tries to find the line number attribute that was stored in the node.
         * @returns the attribute value or null if none is found.
         */
        getLineIndexFromChildDomNode(domNode) {
            const lineIndex = this._getAttributeValue(domNode, STICKY_INDEX_ATTR);
            return lineIndex ? parseInt(lineIndex, 10) : null;
        }
        /**
         * Given a child dom node, tries to find if it is (contained in) a sticky line.
         * @returns a boolean.
         */
        isInStickyLine(domNode) {
            const isInLine = this._getAttributeValue(domNode, STICKY_IS_LINE_ATTR);
            return isInLine !== undefined;
        }
        /**
         * Given a child dom node, tries to find if this dom node is (contained in) a sticky folding icon.
         * @returns a boolean.
         */
        isInFoldingIconDomNode(domNode) {
            const isInFoldingIcon = this._getAttributeValue(domNode, STICKY_IS_FOLDING_ICON_ATTR);
            return isInFoldingIcon !== undefined;
        }
        /**
         * Given the dom node, finds if it or its parent sequence contains the given attribute.
         * @returns the attribute value or undefined.
         */
        _getAttributeValue(domNode, attribute) {
            while (domNode && domNode !== this._rootDomNode) {
                const line = domNode.getAttribute(attribute);
                if (line !== null) {
                    return line;
                }
                domNode = domNode.parentElement;
            }
            return;
        }
    }
    exports.StickyScrollWidget = StickyScrollWidget;
    class RenderedStickyLine {
        constructor(index, lineNumber, lineDomNode, lineNumberDomNode, foldingIcon, characterMapping) {
            this.index = index;
            this.lineNumber = lineNumber;
            this.lineDomNode = lineDomNode;
            this.lineNumberDomNode = lineNumberDomNode;
            this.foldingIcon = foldingIcon;
            this.characterMapping = characterMapping;
        }
    }
    class StickyFoldingIcon {
        constructor(isCollapsed, foldingStartLine, foldingEndLine, dimension) {
            this.isCollapsed = isCollapsed;
            this.foldingStartLine = foldingStartLine;
            this.foldingEndLine = foldingEndLine;
            this.dimension = dimension;
            this.domNode = document.createElement('div');
            this.domNode.style.width = `${dimension}px`;
            this.domNode.style.height = `${dimension}px`;
            this.domNode.className = themables_1.ThemeIcon.asClassName(isCollapsed ? foldingDecorations_1.foldingCollapsedIcon : foldingDecorations_1.foldingExpandedIcon);
        }
        setVisible(visible) {
            this.domNode.style.cursor = visible ? 'pointer' : 'default';
            this.domNode.style.opacity = visible ? '1' : '0';
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5U2Nyb2xsV2lkZ2V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvc3RpY2t5U2Nyb2xsL2Jyb3dzZXIvc3RpY2t5U2Nyb2xsV2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW1CaEcsTUFBYSx1QkFBdUI7UUFDbkMsWUFDVSxnQkFBMEIsRUFDMUIsY0FBd0IsRUFDeEIsd0JBQWdDLEVBQ2hDLGlCQUFnQyxJQUFJO1lBSHBDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBVTtZQUMxQixtQkFBYyxHQUFkLGNBQWMsQ0FBVTtZQUN4Qiw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQVE7WUFDaEMsbUJBQWMsR0FBZCxjQUFjLENBQXNCO1FBQzFDLENBQUM7UUFFTCxNQUFNLENBQUMsS0FBMEM7WUFDaEQsT0FBTyxDQUFDLENBQUMsS0FBSzttQkFDVixJQUFJLENBQUMsd0JBQXdCLEtBQUssS0FBSyxDQUFDLHdCQUF3QjttQkFDaEUsSUFBSSxDQUFDLGNBQWMsS0FBSyxLQUFLLENBQUMsY0FBYzttQkFDNUMsSUFBQSxlQUFNLEVBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQzttQkFDckQsSUFBQSxlQUFNLEVBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdkQsQ0FBQztLQUNEO0lBZkQsMERBZUM7SUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFBLHVDQUF3QixFQUFDLHVCQUF1QixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUNwRyxNQUFNLGlCQUFpQixHQUFHLHdCQUF3QixDQUFDO0lBQ25ELE1BQU0sbUJBQW1CLEdBQUcscUJBQXFCLENBQUM7SUFDbEQsTUFBTSwwQkFBMEIs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