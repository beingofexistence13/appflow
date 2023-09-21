/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/view/dynamicViewOverlay", "vs/base/common/strings", "vs/editor/common/viewLayout/viewLineRenderer", "vs/editor/common/core/position", "vs/editor/common/core/editorColorRegistry", "vs/css!./whitespace"], function (require, exports, dynamicViewOverlay_1, strings, viewLineRenderer_1, position_1, editorColorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WhitespaceOverlay = void 0;
    class WhitespaceOverlay extends dynamicViewOverlay_1.DynamicViewOverlay {
        constructor(context) {
            super();
            this._context = context;
            this._options = new WhitespaceOptions(this._context.configuration);
            this._selection = [];
            this._renderResult = null;
            this._context.addEventHandler(this);
        }
        dispose() {
            this._context.removeEventHandler(this);
            this._renderResult = null;
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const newOptions = new WhitespaceOptions(this._context.configuration);
            if (this._options.equals(newOptions)) {
                return e.hasChanged(143 /* EditorOption.layoutInfo */);
            }
            this._options = newOptions;
            return true;
        }
        onCursorStateChanged(e) {
            this._selection = e.selections;
            if (this._options.renderWhitespace === 'selection') {
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
            if (this._options.renderWhitespace === 'none') {
                this._renderResult = null;
                return;
            }
            const startLineNumber = ctx.visibleRange.startLineNumber;
            const endLineNumber = ctx.visibleRange.endLineNumber;
            const lineCount = endLineNumber - startLineNumber + 1;
            const needed = new Array(lineCount);
            for (let i = 0; i < lineCount; i++) {
                needed[i] = true;
            }
            const viewportData = this._context.viewModel.getMinimapLinesRenderingData(ctx.viewportData.startLineNumber, ctx.viewportData.endLineNumber, needed);
            this._renderResult = [];
            for (let lineNumber = ctx.viewportData.startLineNumber; lineNumber <= ctx.viewportData.endLineNumber; lineNumber++) {
                const lineIndex = lineNumber - ctx.viewportData.startLineNumber;
                const lineData = viewportData.data[lineIndex];
                let selectionsOnLine = null;
                if (this._options.renderWhitespace === 'selection') {
                    const selections = this._selection;
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
                            selectionsOnLine.push(new viewLineRenderer_1.LineRange(startColumn - 1, endColumn - 1));
                        }
                    }
                }
                this._renderResult[lineIndex] = this._applyRenderWhitespace(ctx, lineNumber, selectionsOnLine, lineData);
            }
        }
        _applyRenderWhitespace(ctx, lineNumber, selections, lineData) {
            if (this._options.renderWhitespace === 'selection' && !selections) {
                return '';
            }
            if (this._options.renderWhitespace === 'trailing' && lineData.continuesWithWrappedLine) {
                return '';
            }
            const color = this._context.theme.getColor(editorColorRegistry_1.editorWhitespaces);
            const USE_SVG = this._options.renderWithSVG;
            const lineContent = lineData.content;
            const len = (this._options.stopRenderingLineAfter === -1 ? lineContent.length : Math.min(this._options.stopRenderingLineAfter, lineContent.length));
            const continuesWithWrappedLine = lineData.continuesWithWrappedLine;
            const fauxIndentLength = lineData.minColumn - 1;
            const onlyBoundary = (this._options.renderWhitespace === 'boundary');
            const onlyTrailing = (this._options.renderWhitespace === 'trailing');
            const lineHeight = this._options.lineHeight;
            const middotWidth = this._options.middotWidth;
            const wsmiddotWidth = this._options.wsmiddotWidth;
            const spaceWidth = this._options.spaceWidth;
            const wsmiddotDiff = Math.abs(wsmiddotWidth - spaceWidth);
            const middotDiff = Math.abs(middotWidth - spaceWidth);
            // U+2E31 - WORD SEPARATOR MIDDLE DOT
            // U+00B7 - MIDDLE DOT
            const renderSpaceCharCode = (wsmiddotDiff < middotDiff ? 0x2E31 : 0xB7);
            const canUseHalfwidthRightwardsArrow = this._options.canUseHalfwidthRightwardsArrow;
            let result = '';
            let lineIsEmptyOrWhitespace = false;
            let firstNonWhitespaceIndex = strings.firstNonWhitespaceIndex(lineContent);
            let lastNonWhitespaceIndex;
            if (firstNonWhitespaceIndex === -1) {
                lineIsEmptyOrWhitespace = true;
                firstNonWhitespaceIndex = len;
                lastNonWhitespaceIndex = len;
            }
            else {
                lastNonWhitespaceIndex = strings.lastNonWhitespaceIndex(lineContent);
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
                const visibleRange = ctx.visibleRangeForPosition(new position_1.Position(lineNumber, charIndex + 1));
                if (!visibleRange) {
                    continue;
                }
                if (USE_SVG) {
                    maxLeft = Math.max(maxLeft, visibleRange.left);
                    if (chCode === 9 /* CharCode.Tab */) {
                        result += this._renderArrow(lineHeight, spaceWidth, visibleRange.left);
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
        _renderArrow(lineHeight, spaceWidth, left) {
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
            if (!this._renderResult) {
                return '';
            }
            const lineIndex = lineNumber - startLineNumber;
            if (lineIndex < 0 || lineIndex >= this._renderResult.length) {
                return '';
            }
            return this._renderResult[lineIndex];
        }
    }
    exports.WhitespaceOverlay = WhitespaceOverlay;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2hpdGVzcGFjZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3ZpZXdQYXJ0cy93aGl0ZXNwYWNlL3doaXRlc3BhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJoRyxNQUFhLGlCQUFrQixTQUFRLHVDQUFrQjtRQU94RCxZQUFZLE9BQW9CO1lBQy9CLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFDMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVlLE9BQU87WUFDdEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztZQUMxQixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQztRQUVELDJCQUEyQjtRQUVYLHNCQUFzQixDQUFDLENBQTJDO1lBQ2pGLE1BQU0sVUFBVSxHQUFHLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN0RSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNyQyxPQUFPLENBQUMsQ0FBQyxVQUFVLG1DQUF5QixDQUFDO2FBQzdDO1lBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7WUFDM0IsT0FB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Q0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUMxRCxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDNUQsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDakMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDakMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDakMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDakMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFFbEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNwRCxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVB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