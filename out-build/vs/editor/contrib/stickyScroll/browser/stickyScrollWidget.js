/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/trustedTypes", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/editor/browser/viewParts/lines/viewLine", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/core/position", "vs/editor/common/core/stringBuilder", "vs/editor/common/viewLayout/lineDecorations", "vs/editor/common/viewLayout/viewLineRenderer", "vs/editor/contrib/folding/browser/foldingDecorations", "vs/css!./stickyScroll"], function (require, exports, dom, trustedTypes_1, arrays_1, lifecycle_1, themables_1, viewLine_1, embeddedCodeEditorWidget_1, position_1, stringBuilder_1, lineDecorations_1, viewLineRenderer_1, foldingDecorations_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$N0 = exports.$M0 = void 0;
    class $M0 {
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
                && (0, arrays_1.$sb)(this.startLineNumbers, other.startLineNumbers)
                && (0, arrays_1.$sb)(this.endLineNumbers, other.endLineNumbers);
        }
    }
    exports.$M0 = $M0;
    const _ttPolicy = (0, trustedTypes_1.$PQ)('stickyScrollViewLayer', { createHTML: value => value });
    const STICKY_INDEX_ATTR = 'data-sticky-line-index';
    const STICKY_IS_LINE_ATTR = 'data-sticky-is-line';
    const STICKY_IS_LINE_NUMBER_ATTR = 'data-sticky-is-line-number';
    const STICKY_IS_FOLDING_ICON_ATTR = 'data-sticky-is-folding-icon';
    class $N0 extends lifecycle_1.$kc {
        constructor(u) {
            super();
            this.u = u;
            this.a = new lifecycle_1.$jc();
            this.b = document.createElement('div');
            this.c = document.createElement('div');
            this.f = document.createElement('div');
            this.g = document.createElement('div');
            this.j = this.u.getOption(66 /* EditorOption.lineHeight */);
            this.m = [];
            this.n = [];
            this.r = 0;
            this.s = 0;
            this.t = false;
            this.c.className = 'sticky-widget-line-numbers';
            this.c.setAttribute('role', 'none');
            this.g.className = 'sticky-widget-lines';
            this.g.setAttribute('role', 'list');
            this.f.className = 'sticky-widget-lines-scrollable';
            this.f.appendChild(this.g);
            this.b.className = 'sticky-widget';
            this.b.classList.toggle('peek', u instanceof embeddedCodeEditorWidget_1.$w3);
            this.b.appendChild(this.c);
            this.b.appendChild(this.f);
            const updateScrollLeftPosition = () => {
                this.g.style.left = this.u.getOption(114 /* EditorOption.stickyScroll */).scrollWithEditor ? `-${this.u.getScrollLeft()}px` : '0px';
            };
            this.B(this.u.onDidChangeConfiguration((e) => {
                if (e.hasChanged(114 /* EditorOption.stickyScroll */)) {
                    updateScrollLeftPosition();
                }
                if (e.hasChanged(66 /* EditorOption.lineHeight */)) {
                    this.j = this.u.getOption(66 /* EditorOption.lineHeight */);
                }
            }));
            this.B(this.u.onDidScrollChange((e) => {
                if (e.scrollLeftChanged) {
                    updateScrollLeftPosition();
                }
                if (e.scrollWidthChanged) {
                    this.w();
                }
            }));
            this.B(this.u.onDidChangeModel(() => {
                updateScrollLeftPosition();
                this.w();
            }));
            this.B(this.a);
            updateScrollLeftPosition();
            this.B(this.u.onDidLayoutChange((e) => {
                this.w();
            }));
            this.w();
        }
        get lineNumbers() {
            return this.n;
        }
        get lineNumberCount() {
            return this.n.length;
        }
        getStickyLineForLine(lineNumber) {
            return this.m.find(stickyLine => stickyLine.lineNumber === lineNumber);
        }
        getCurrentLines() {
            return this.n;
        }
        setState(state, foldingModel, rebuildFromLine = Infinity) {
            if (((!this.h && !state) || (this.h && this.h.equals(state)))
                && rebuildFromLine === Infinity) {
                return;
            }
            this.h = state;
            const previousStickyLines = this.m;
            this.y();
            if (!state || !this.u._getViewModel()) {
                return;
            }
            const futureWidgetHeight = state.startLineNumbers.length * this.j + state.lastLineRelativePosition;
            if (futureWidgetHeight > 0) {
                this.r = state.lastLineRelativePosition;
                const lineNumbers = [...state.startLineNumbers];
                if (state.showEndForLine !== null) {
                    lineNumbers[state.showEndForLine] = state.endLineNumbers[state.showEndForLine];
                }
                this.n = lineNumbers;
            }
            else {
                this.r = 0;
                this.n = [];
            }
            this.D(previousStickyLines, foldingModel, rebuildFromLine);
        }
        w() {
            const layoutInfo = this.u.getLayoutInfo();
            const lineNumbersWidth = layoutInfo.contentLeft;
            this.c.style.width = `${lineNumbersWidth}px`;
            this.f.style.setProperty('--vscode-editorStickyScroll-scrollableWidth', `${this.u.getScrollWidth() - layoutInfo.verticalScrollbarWidth}px`);
            this.b.style.width = `${layoutInfo.width - layoutInfo.verticalScrollbarWidth}px`;
        }
        y() {
            this.m = [];
            this.a.clear();
            dom.$lO(this.c);
            dom.$lO(this.g);
            this.b.style.display = 'none';
        }
        z(requireTransitions) {
            this.c.style.setProperty('--vscode-editorStickyScroll-foldingOpacityTransition', `opacity ${requireTransitions ? 0.5 : 0}s`);
        }
        C(allVisible) {
            for (const line of this.m) {
                const foldingIcon = line.foldingIcon;
                if (!foldingIcon) {
                    continue;
                }
                foldingIcon.setVisible(allVisible ? true : foldingIcon.isCollapsed);
            }
        }
        async D(previousStickyLines, foldingModel, rebuildFromLine = Infinity) {
            const layoutInfo = this.u.getLayoutInfo();
            for (const [index, line] of this.n.entries()) {
                const previousStickyLine = previousStickyLines[index];
                const stickyLine = (line >= rebuildFromLine || previousStickyLine?.lineNumber !== line)
                    ? this.G(index, line, foldingModel, layoutInfo)
                    : this.H(previousStickyLine);
                if (!stickyLine) {
                    continue;
                }
                this.g.appendChild(stickyLine.lineDomNode);
                this.c.appendChild(stickyLine.lineNumberDomNode);
                this.m.push(stickyLine);
            }
            if (foldingModel) {
                this.F();
                this.z(!this.t);
            }
            const widgetHeight = this.n.length * this.j + this.r;
            if (widgetHeight === 0) {
                this.y();
                return;
            }
            this.b.style.display = 'block';
            this.c.style.height = `${widgetHeight}px`;
            this.f.style.height = `${widgetHeight}px`;
            this.b.style.height = `${widgetHeight}px`;
            this.b.style.marginLeft = '0px';
            this.J();
            this.u.layoutOverlayWidget(this);
        }
        F() {
            const showFoldingControls = this.u.getOption(109 /* EditorOption.showFoldingControls */);
            if (showFoldingControls !== 'mouseover') {
                return;
            }
            this.a.add(dom.$nO(this.c, dom.$3O.MOUSE_ENTER, (e) => {
                this.t = true;
                this.C(true);
            }));
            this.a.add(dom.$nO(this.c, dom.$3O.MOUSE_LEAVE, () => {
                this.t = false;
                this.z(true);
                this.C(false);
            }));
        }
        G(index, line, foldingModel, layoutInfo) {
            const viewModel = this.u._getViewModel();
            if (!viewModel) {
                return;
            }
            const viewLineNumber = viewModel.coordinatesConverter.convertModelPositionToViewPosition(new position_1.$js(line, 1)).lineNumber;
            const lineRenderingData = viewModel.getViewLineRenderingData(viewLineNumber);
            const lineNumberOption = this.u.getOption(67 /* EditorOption.lineNumbers */);
            let actualInlineDecorations;
            try {
                actualInlineDecorations = lineDecorations_1.$MW.filter(lineRenderingData.inlineDecorations, viewLineNumber, lineRenderingData.minColumn, lineRenderingData.maxColumn);
            }
            catch (err) {
                actualInlineDecorations = [];
            }
            const renderLineInput = new viewLineRenderer_1.$QW(true, true, lineRenderingData.content, lineRenderingData.continuesWithWrappedLine, lineRenderingData.isBasicASCII, lineRenderingData.containsRTL, 0, lineRenderingData.tokens, actualInlineDecorations, lineRenderingData.tabSize, lineRenderingData.startVisibleColumn, 1, 1, 1, 500, 'none', true, true, null);
            const sb = new stringBuilder_1.$Es(2000);
            const renderOutput = (0, viewLineRenderer_1.$UW)(renderLineInput, sb);
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
            lineHTMLNode.style.lineHeight = `${this.j}px`;
            lineHTMLNode.innerHTML = newLine;
            const lineNumberHTMLNode = document.createElement('span');
            lineNumberHTMLNode.setAttribute(STICKY_INDEX_ATTR, String(index));
            lineNumberHTMLNode.setAttribute(STICKY_IS_LINE_NUMBER_ATTR, '');
            lineNumberHTMLNode.className = 'sticky-line-number';
            lineNumberHTMLNode.style.lineHeight = `${this.j}px`;
            const lineNumbersWidth = layoutInfo.contentLeft;
            lineNumberHTMLNode.style.width = `${lineNumbersWidth}px`;
            const innerLineNumberHTML = document.createElement('span');
            if (lineNumberOption.renderType === 1 /* RenderLineNumbersType.On */ || lineNumberOption.renderType === 3 /* RenderLineNumbersType.Interval */ && line % 10 === 0) {
                innerLineNumberHTML.innerText = line.toString();
            }
            else if (lineNumberOption.renderType === 2 /* RenderLineNumbersType.Relative */) {
                innerLineNumberHTML.innerText = Math.abs(line - this.u.getPosition().lineNumber).toString();
            }
            innerLineNumberHTML.className = 'sticky-line-number-inner';
            innerLineNumberHTML.style.lineHeight = `${this.j}px`;
            innerLineNumberHTML.style.width = `${layoutInfo.lineNumbersWidth}px`;
            innerLineNumberHTML.style.paddingLeft = `${layoutInfo.lineNumbersLeft}px`;
            lineNumberHTMLNode.appendChild(innerLineNumberHTML);
            const foldingIcon = this.I(foldingModel, line);
            if (foldingIcon) {
                lineNumberHTMLNode.appendChild(foldingIcon.domNode);
            }
            this.u.applyFontInfo(lineHTMLNode);
            this.u.applyFontInfo(innerLineNumberHTML);
            lineNumberHTMLNode.style.lineHeight = `${this.j}px`;
            lineHTMLNode.style.lineHeight = `${this.j}px`;
            lineNumberHTMLNode.style.height = `${this.j}px`;
            lineHTMLNode.style.height = `${this.j}px`;
            const renderedLine = new RenderedStickyLine(index, line, lineHTMLNode, lineNumberHTMLNode, foldingIcon, renderOutput.characterMapping);
            return this.H(renderedLine);
        }
        H(stickyLine) {
            const index = stickyLine.index;
            const lineHTMLNode = stickyLine.lineDomNode;
            const lineNumberHTMLNode = stickyLine.lineNumberDomNode;
            const isLastLine = index === this.n.length - 1;
            const lastLineZIndex = '0';
            const intermediateLineZIndex = '1';
            lineHTMLNode.style.zIndex = isLastLine ? lastLineZIndex : intermediateLineZIndex;
            lineNumberHTMLNode.style.zIndex = isLastLine ? lastLineZIndex : intermediateLineZIndex;
            const lastLineTop = `${index * this.j + this.r + (stickyLine.foldingIcon?.isCollapsed ? 1 : 0)}px`;
            const intermediateLineTop = `${index * this.j}px`;
            lineHTMLNode.style.top = isLastLine ? lastLineTop : intermediateLineTop;
            lineNumberHTMLNode.style.top = isLastLine ? lastLineTop : intermediateLineTop;
            return stickyLine;
        }
        I(foldingModel, line) {
            const showFoldingControls = this.u.getOption(109 /* EditorOption.showFoldingControls */);
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
            const foldingIcon = new StickyFoldingIcon(isCollapsed, startLineNumber, foldingRegions.getEndLineNumber(indexOfFoldingRegion), this.j);
            foldingIcon.setVisible(this.t ? true : (isCollapsed || showFoldingControls === 'always'));
            foldingIcon.domNode.setAttribute(STICKY_IS_FOLDING_ICON_ATTR, '');
            return foldingIcon;
        }
        J() {
            this.s = 0;
            for (const stickyLine of this.m) {
                if (stickyLine.lineDomNode.scrollWidth > this.s) {
                    this.s = stickyLine.lineDomNode.scrollWidth;
                }
            }
            this.s += this.u.getLayoutInfo().verticalScrollbarWidth;
        }
        getId() {
            return 'editor.contrib.stickyScrollWidget';
        }
        getDomNode() {
            return this.b;
        }
        getPosition() {
            return {
                preference: null
            };
        }
        getMinContentWidthInPx() {
            return this.s;
        }
        focusLineWithIndex(index) {
            if (0 <= index && index < this.m.length) {
                this.m[index].lineDomNode.focus();
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
            const renderedStickyLine = this.L(spanDomNode);
            if (!renderedStickyLine) {
                return null;
            }
            const column = (0, viewLine_1.$ZW)(renderedStickyLine.characterMapping, spanDomNode, 0);
            return new position_1.$js(renderedStickyLine.lineNumber, column);
        }
        getLineNumberFromChildDomNode(domNode) {
            return this.L(domNode)?.lineNumber ?? null;
        }
        L(domNode) {
            const index = this.getLineIndexFromChildDomNode(domNode);
            if (index === null || index < 0 || index >= this.m.length) {
                return null;
            }
            return this.m[index];
        }
        /**
         * Given a child dom node, tries to find the line number attribute that was stored in the node.
         * @returns the attribute value or null if none is found.
         */
        getLineIndexFromChildDomNode(domNode) {
            const lineIndex = this.M(domNode, STICKY_INDEX_ATTR);
            return lineIndex ? parseInt(lineIndex, 10) : null;
        }
        /**
         * Given a child dom node, tries to find if it is (contained in) a sticky line.
         * @returns a boolean.
         */
        isInStickyLine(domNode) {
            const isInLine = this.M(domNode, STICKY_IS_LINE_ATTR);
            return isInLine !== undefined;
        }
        /**
         * Given a child dom node, tries to find if this dom node is (contained in) a sticky folding icon.
         * @returns a boolean.
         */
        isInFoldingIconDomNode(domNode) {
            const isInFoldingIcon = this.M(domNode, STICKY_IS_FOLDING_ICON_ATTR);
            return isInFoldingIcon !== undefined;
        }
        /**
         * Given the dom node, finds if it or its parent sequence contains the given attribute.
         * @returns the attribute value or undefined.
         */
        M(domNode, attribute) {
            while (domNode && domNode !== this.b) {
                const line = domNode.getAttribute(attribute);
                if (line !== null) {
                    return line;
                }
                domNode = domNode.parentElement;
            }
            return;
        }
    }
    exports.$N0 = $N0;
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
            this.domNode.className = themables_1.ThemeIcon.asClassName(isCollapsed ? foldingDecorations_1.$t8 : foldingDecorations_1.$s8);
        }
        setVisible(visible) {
            this.domNode.style.cursor = visible ? 'pointer' : 'default';
            this.domNode.style.opacity = visible ? '1' : '0';
        }
    }
});
//# sourceMappingURL=stickyScrollWidget.js.map