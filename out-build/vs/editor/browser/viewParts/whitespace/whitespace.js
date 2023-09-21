/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/view/dynamicViewOverlay", "vs/base/common/strings", "vs/editor/common/viewLayout/viewLineRenderer", "vs/editor/common/core/position", "vs/editor/common/core/editorColorRegistry", "vs/css!./whitespace"], function (require, exports, dynamicViewOverlay_1, strings, viewLineRenderer_1, position_1, editorColorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$SX = void 0;
    class $SX extends dynamicViewOverlay_1.$eX {
        constructor(context) {
            super();
            this.a = context;
            this.b = new WhitespaceOptions(this.a.configuration);
            this.c = [];
            this.g = null;
            this.a.addEventHandler(this);
        }
        dispose() {
            this.a.removeEventHandler(this);
            this.g = null;
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const newOptions = new WhitespaceOptions(this.a.configuration);
            if (this.b.equals(newOptions)) {
                return e.hasChanged(143 /* EditorOption.layoutInfo */);
            }
            this.b = newOptions;
            return true;
        }
        onCursorStateChanged(e) {
            this.c = e.selections;
            if (this.b.renderWhitespace === 'selection') {
                return true;
            }
            return false;
        }
        onDecorationsChanged(e) {
            return true;
        }
        onFlushed(e) {
            return true;
        }
        onLinesChanged(e) {
            return true;
        }
        onLinesDeleted(e) {
            return true;
        }
        onLinesInserted(e) {
            return true;
        }
        onScrollChanged(e) {
            return e.scrollTopChanged;
        }
        onZonesChanged(e) {
            return true;
        }
        // --- end event handlers
        prepareRender(ctx) {
            if (this.b.renderWhitespace === 'none') {
                this.g = null;
                return;
            }
            const startLineNumber = ctx.visibleRange.startLineNumber;
            const endLineNumber = ctx.visibleRange.endLineNumber;
            const lineCount = endLineNumber - startLineNumber + 1;
            const needed = new Array(lineCount);
            for (let i = 0; i < lineCount; i++) {
                needed[i] = true;
            }
            const viewportData = this.a.viewModel.getMinimapLinesRenderingData(ctx.viewportData.startLineNumber, ctx.viewportData.endLineNumber, needed);
            this.g = [];
            for (let lineNumber = ctx.viewportData.startLineNumber; lineNumber <= ctx.viewportData.endLineNumber; lineNumber++) {
                const lineIndex = lineNumber - ctx.viewportData.startLineNumber;
                const lineData = viewportData.data[lineIndex];
                let selectionsOnLine = null;
                if (this.b.renderWhitespace === 'selection') {
                    const selections = this.c;
                    for (const selection of selections) {
                        if (selection.endLineNumber < lineNumber || selection.startLineNumber > lineNumber) {
                            // Selection does not intersect line
                            continue;
                        }
                        const startColumn = (selection.startLineNumber === lineNumber ? selection.startColumn : lineData.minColumn);
                        const endColumn = (selection.endLineNumber === lineNumber ? selection.endColumn : lineData.maxColumn);
                        if (startColumn < endColumn) {
                            if (!selectionsOnLine) {
                                selectionsOnLine = [];
                            }
                            selectionsOnLine.push(new viewLineRenderer_1.$PW(startColumn - 1, endColumn - 1));
                        }
                    }
                }
                this.g[lineIndex] = this.j(ctx, lineNumber, selectionsOnLine, lineData);
            }
        }
        j(ctx, lineNumber, selections, lineData) {
            if (this.b.renderWhitespace === 'selection' && !selections) {
                return '';
            }
            if (this.b.renderWhitespace === 'trailing' && lineData.continuesWithWrappedLine) {
                return '';
            }
            const color = this.a.theme.getColor(editorColorRegistry_1.$ZA);
            const USE_SVG = this.b.renderWithSVG;
            const lineContent = lineData.content;
            const len = (this.b.stopRenderingLineAfter === -1 ? lineContent.length : Math.min(this.b.stopRenderingLineAfter, lineContent.length));
            const continuesWithWrappedLine = lineData.continuesWithWrappedLine;
            const fauxIndentLength = lineData.minColumn - 1;
            const onlyBoundary = (this.b.renderWhitespace === 'boundary');
            const onlyTrailing = (this.b.renderWhitespace === 'trailing');
            const lineHeight = this.b.lineHeight;
            const middotWidth = this.b.middotWidth;
            const wsmiddotWidth = this.b.wsmiddotWidth;
            const spaceWidth = this.b.spaceWidth;
            const wsmiddotDiff = Math.abs(wsmiddotWidth - spaceWidth);
            const middotDiff = Math.abs(middotWidth - spaceWidth);
            // U+2E31 - WORD SEPARATOR MIDDLE DOT
            // U+00B7 - MIDDLE DOT
            const renderSpaceCharCode = (wsmiddotDiff < middotDiff ? 0x2E31 : 0xB7);
            const canUseHalfwidthRightwardsArrow = this.b.canUseHalfwidthRightwardsArrow;
            let result = '';
            let lineIsEmptyOrWhitespace = false;
            let firstNonWhitespaceIndex = strings.$Be(lineContent);
            let lastNonWhitespaceIndex;
            if (firstNonWhitespaceIndex === -1) {
                lineIsEmptyOrWhitespace = true;
                firstNonWhitespaceIndex = len;
                lastNonWhitespaceIndex = len;
            }
            else {
                lastNonWhitespaceIndex = strings.$De(lineContent);
            }
            let currentSelectionIndex = 0;
            let currentSelection = selections && selections[currentSelectionIndex];
            let maxLeft = 0;
            for (let charIndex = fauxIndentLength; charIndex < len; charIndex++) {
                const chCode = lineContent.charCodeAt(charIndex);
                if (currentSelection && charIndex >= currentSelection.endOffset) {
                    currentSelectionIndex++;
                    currentSelection = selections && selections[currentSelectionIndex];
                }
                if (chCode !== 9 /* CharCode.Tab */ && chCode !== 32 /* CharCode.Space */) {
                    continue;
                }
                if (onlyTrailing && !lineIsEmptyOrWhitespace && charIndex <= lastNonWhitespaceIndex) {
                    // If rendering only trailing whitespace, check that the charIndex points to trailing whitespace.
                    continue;
                }
                if (onlyBoundary && charIndex >= firstNonWhitespaceIndex && charIndex <= lastNonWhitespaceIndex && chCode === 32 /* CharCode.Space */) {
                    // rendering only boundary whitespace
                    const prevChCode = (charIndex - 1 >= 0 ? lineContent.charCodeAt(charIndex - 1) : 0 /* CharCode.Null */);
                    const nextChCode = (charIndex + 1 < len ? lineContent.charCodeAt(charIndex + 1) : 0 /* CharCode.Null */);
                    if (prevChCode !== 32 /* CharCode.Space */ && nextChCode !== 32 /* CharCode.Space */) {
                        continue;
                    }
                }
                if (onlyBoundary && continuesWithWrappedLine && charIndex === len - 1) {
                    const prevCharCode = (charIndex - 1 >= 0 ? lineContent.charCodeAt(charIndex - 1) : 0 /* CharCode.Null */);
                    const isSingleTrailingSpace = (chCode === 32 /* CharCode.Space */ && (prevCharCode !== 32 /* CharCode.Space */ && prevCharCode !== 9 /* CharCode.Tab */));
                    if (isSingleTrailingSpace) {
                        continue;
                    }
                }
                if (selections && (!currentSelection || currentSelection.startOffset > charIndex || currentSelection.endOffset <= charIndex)) {
                    // If rendering whitespace on selection, check that the charIndex falls within a selection
                    continue;
                }
                const visibleRange = ctx.visibleRangeForPosition(new position_1.$js(lineNumber, charIndex + 1));
                if (!visibleRange) {
                    continue;
                }
                if (USE_SVG) {
                    maxLeft = Math.max(maxLeft, visibleRange.left);
                    if (chCode === 9 /* CharCode.Tab */) {
                        result += this.m(lineHeight, spaceWidth, visibleRange.left);
                    }
                    else {
                        result += `<circle cx="${(visibleRange.left + spaceWidth / 2).toFixed(2)}" cy="${(lineHeight / 2).toFixed(2)}" r="${(spaceWidth / 7).toFixed(2)}" />`;
                    }
                }
                else {
                    if (chCode === 9 /* CharCode.Tab */) {
                        result += `<div class="mwh" style="left:${visibleRange.left}px;height:${lineHeight}px;">${canUseHalfwidthRightwardsArrow ? String.fromCharCode(0xFFEB) : String.fromCharCode(0x2192)}</div>`;
                    }
                    else {
                        result += `<div class="mwh" style="left:${visibleRange.left}px;height:${lineHeight}px;">${String.fromCharCode(renderSpaceCharCode)}</div>`;
                    }
                }
            }
            if (USE_SVG) {
                maxLeft = Math.round(maxLeft + spaceWidth);
                return (`<svg style="position:absolute;width:${maxLeft}px;height:${lineHeight}px" viewBox="0 0 ${maxLeft} ${lineHeight}" xmlns="http://www.w3.org/2000/svg" fill="${color}">`
                    + result
                    + `</svg>`);
            }
            return result;
        }
        m(lineHeight, spaceWidth, left) {
            const strokeWidth = spaceWidth / 7;
            const width = spaceWidth;
            const dy = lineHeight / 2;
            const dx = left;
            const p1 = { x: 0, y: strokeWidth / 2 };
            const p2 = { x: 100 / 125 * width, y: p1.y };
            const p3 = { x: p2.x - 0.2 * p2.x, y: p2.y + 0.2 * p2.x };
            const p4 = { x: p3.x + 0.1 * p2.x, y: p3.y + 0.1 * p2.x };
            const p5 = { x: p4.x + 0.35 * p2.x, y: p4.y - 0.35 * p2.x };
            const p6 = { x: p5.x, y: -p5.y };
            const p7 = { x: p4.x, y: -p4.y };
            const p8 = { x: p3.x, y: -p3.y };
            const p9 = { x: p2.x, y: -p2.y };
            const p10 = { x: p1.x, y: -p1.y };
            const p = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10];
            const parts = p.map((p) => `${(dx + p.x).toFixed(2)} ${(dy + p.y).toFixed(2)}`).join(' L ');
            return `<path d="M ${parts}" />`;
        }
        render(startLineNumber, lineNumber) {
            if (!this.g) {
                return '';
            }
            const lineIndex = lineNumber - startLineNumber;
            if (lineIndex < 0 || lineIndex >= this.g.length) {
                return '';
            }
            return this.g[lineIndex];
        }
    }
    exports.$SX = $SX;
    class WhitespaceOptions {
        constructor(config) {
            const options = config.options;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            const experimentalWhitespaceRendering = options.get(38 /* EditorOption.experimentalWhitespaceRendering */);
            if (experimentalWhitespaceRendering === 'off') {
                // whitespace is rendered in the view line
                this.renderWhitespace = 'none';
                this.renderWithSVG = false;
            }
            else if (experimentalWhitespaceRendering === 'svg') {
                this.renderWhitespace = options.get(98 /* EditorOption.renderWhitespace */);
                this.renderWithSVG = true;
            }
            else {
                this.renderWhitespace = options.get(98 /* EditorOption.renderWhitespace */);
                this.renderWithSVG = false;
            }
            this.spaceWidth = fontInfo.spaceWidth;
            this.middotWidth = fontInfo.middotWidth;
            this.wsmiddotWidth = fontInfo.wsmiddotWidth;
            this.canUseHalfwidthRightwardsArrow = fontInfo.canUseHalfwidthRightwardsArrow;
            this.lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this.stopRenderingLineAfter = options.get(116 /* EditorOption.stopRenderingLineAfter */);
        }
        equals(other) {
            return (this.renderWhitespace === other.renderWhitespace
                && this.renderWithSVG === other.renderWithSVG
                && this.spaceWidth === other.spaceWidth
                && this.middotWidth === other.middotWidth
                && this.wsmiddotWidth === other.wsmiddotWidth
                && this.canUseHalfwidthRightwardsArrow === other.canUseHalfwidthRightwardsArrow
                && this.lineHeight === other.lineHeight
                && this.stopRenderingLineAfter === other.stopRenderingLineAfter);
        }
    }
});
//# sourceMappingURL=whitespace.js.map