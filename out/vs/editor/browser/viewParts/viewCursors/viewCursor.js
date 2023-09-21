/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/base/common/strings", "vs/editor/browser/config/domFontInfo", "vs/editor/common/config/editorOptions", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/base/browser/ui/mouseCursor/mouseCursor"], function (require, exports, dom, fastDomNode_1, strings, domFontInfo_1, editorOptions_1, position_1, range_1, mouseCursor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewCursor = void 0;
    class ViewCursorRenderData {
        constructor(top, left, paddingLeft, width, height, textContent, textContentClassName) {
            this.top = top;
            this.left = left;
            this.paddingLeft = paddingLeft;
            this.width = width;
            this.height = height;
            this.textContent = textContent;
            this.textContentClassName = textContentClassName;
        }
    }
    class ViewCursor {
        constructor(context) {
            this._context = context;
            const options = this._context.configuration.options;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            this._cursorStyle = options.get(28 /* EditorOption.cursorStyle */);
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._typicalHalfwidthCharacterWidth = fontInfo.typicalHalfwidthCharacterWidth;
            this._lineCursorWidth = Math.min(options.get(31 /* EditorOption.cursorWidth */), this._typicalHalfwidthCharacterWidth);
            this._isVisible = true;
            // Create the dom node
            this._domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this._domNode.setClassName(`cursor ${mouseCursor_1.MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`);
            this._domNode.setHeight(this._lineHeight);
            this._domNode.setTop(0);
            this._domNode.setLeft(0);
            (0, domFontInfo_1.applyFontInfo)(this._domNode, fontInfo);
            this._domNode.setDisplay('none');
            this._position = new position_1.Position(1, 1);
            this._lastRenderedContent = '';
            this._renderData = null;
        }
        getDomNode() {
            return this._domNode;
        }
        getPosition() {
            return this._position;
        }
        show() {
            if (!this._isVisible) {
                this._domNode.setVisibility('inherit');
                this._isVisible = true;
            }
        }
        hide() {
            if (this._isVisible) {
                this._domNode.setVisibility('hidden');
                this._isVisible = false;
            }
        }
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            this._cursorStyle = options.get(28 /* EditorOption.cursorStyle */);
            this._lineHeight = options.get(66 /* EditorOption.lineHeight */);
            this._typicalHalfwidthCharacterWidth = fontInfo.typicalHalfwidthCharacterWidth;
            this._lineCursorWidth = Math.min(options.get(31 /* EditorOption.cursorWidth */), this._typicalHalfwidthCharacterWidth);
            (0, domFontInfo_1.applyFontInfo)(this._domNode, fontInfo);
            return true;
        }
        onCursorPositionChanged(position, pauseAnimation) {
            if (pauseAnimation) {
                this._domNode.domNode.style.transitionProperty = 'none';
            }
            else {
                this._domNode.domNode.style.transitionProperty = '';
            }
            this._position = position;
            return true;
        }
        /**
         * If `this._position` is inside a grapheme, returns the position where the grapheme starts.
         * Also returns the next grapheme.
         */
        _getGraphemeAwarePosition() {
            const { lineNumber, column } = this._position;
            const lineContent = this._context.viewModel.getLineContent(lineNumber);
            const [startOffset, endOffset] = strings.getCharContainingOffset(lineContent, column - 1);
            return [new position_1.Position(lineNumber, startOffset + 1), lineContent.substring(startOffset, endOffset)];
        }
        _prepareRender(ctx) {
            let textContent = '';
            let textContentClassName = '';
            const [position, nextGrapheme] = this._getGraphemeAwarePosition();
            if (this._cursorStyle === editorOptions_1.TextEditorCursorStyle.Line || this._cursorStyle === editorOptions_1.TextEditorCursorStyle.LineThin) {
                const visibleRange = ctx.visibleRangeForPosition(position);
                if (!visibleRange || visibleRange.outsideRenderedLine) {
                    // Outside viewport
                    return null;
                }
                let width;
                if (this._cursorStyle === editorOptions_1.TextEditorCursorStyle.Line) {
                    width = dom.computeScreenAwareSize(this._lineCursorWidth > 0 ? this._lineCursorWidth : 2);
                    if (width > 2) {
                        textContent = nextGrapheme;
                        textContentClassName = this._getTokenClassName(position);
                    }
                }
                else {
                    width = dom.computeScreenAwareSize(1);
                }
                let left = visibleRange.left;
                let paddingLeft = 0;
                if (width >= 2 && left >= 1) {
                    // shift the cursor a bit between the characters
                    paddingLeft = 1;
                    left -= paddingLeft;
                }
                const top = ctx.getVerticalOffsetForLineNumber(position.lineNumber) - ctx.bigNumbersDelta;
                return new ViewCursorRenderData(top, left, paddingLeft, width, this._lineHeight, textContent, textContentClassName);
            }
            const visibleRangeForCharacter = ctx.linesVisibleRangesForRange(new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column + nextGrapheme.length), false);
            if (!visibleRangeForCharacter || visibleRangeForCharacter.length === 0) {
                // Outside viewport
                return null;
            }
            const firstVisibleRangeForCharacter = visibleRangeForCharacter[0];
            if (firstVisibleRangeForCharacter.outsideRenderedLine || firstVisibleRangeForCharacter.ranges.length === 0) {
                // Outside viewport
                return null;
            }
            const range = firstVisibleRangeForCharacter.ranges[0];
            const width = (nextGrapheme === '\t'
                ? this._typicalHalfwidthCharacterWidth
                : (range.width < 1
                    ? this._typicalHalfwidthCharacterWidth
                    : range.width));
            if (this._cursorStyle === editorOptions_1.TextEditorCursorStyle.Block) {
                textContent = nextGrapheme;
                textContentClassName = this._getTokenClassName(position);
            }
            let top = ctx.getVerticalOffsetForLineNumber(position.lineNumber) - ctx.bigNumbersDelta;
            let height = this._lineHeight;
            // Underline might interfere with clicking
            if (this._cursorStyle === editorOptions_1.TextEditorCursorStyle.Underline || this._cursorStyle === editorOptions_1.TextEditorCursorStyle.UnderlineThin) {
                top += this._lineHeight - 2;
                height = 2;
            }
            return new ViewCursorRenderData(top, range.left, 0, width, height, textContent, textContentClassName);
        }
        _getTokenClassName(position) {
            const lineData = this._context.viewModel.getViewLineData(position.lineNumber);
            const tokenIndex = lineData.tokens.findTokenIndexAtOffset(position.column - 1);
            return lineData.tokens.getClassName(tokenIndex);
        }
        prepareRender(ctx) {
            this._renderData = this._prepareRender(ctx);
        }
        render(ctx) {
            if (!this._renderData) {
                this._domNode.setDisplay('none');
                return null;
            }
            if (this._lastRenderedContent !== this._renderData.textContent) {
                this._lastRenderedContent = this._renderData.textContent;
                this._domNode.domNode.textContent = this._lastRenderedContent;
            }
            this._domNode.setClassName(`cursor ${mouseCursor_1.MOUSE_CURSOR_TEXT_CSS_CLASS_NAME} ${this._renderData.textContentClassName}`);
            this._domNode.setDisplay('block');
            this._domNode.setTop(this._renderData.top);
            this._domNode.setLeft(this._renderData.left);
            this._domNode.setPaddingLeft(this._renderData.paddingLeft);
            this._domNode.setWidth(this._renderData.width);
            this._domNode.setLineHeight(this._renderData.height);
            this._domNode.setHeight(this._renderData.height);
            return {
                domNode: this._domNode.domNode,
                position: this._position,
                contentLeft: this._renderData.left,
                height: this._renderData.height,
                width: 2
            };
        }
    }
    exports.ViewCursor = ViewCursor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0N1cnNvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3ZpZXdQYXJ0cy92aWV3Q3Vyc29ycy92aWV3Q3Vyc29yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXNCaEcsTUFBTSxvQkFBb0I7UUFDekIsWUFDaUIsR0FBVyxFQUNYLElBQVksRUFDWixXQUFtQixFQUNuQixLQUFhLEVBQ2IsTUFBYyxFQUNkLFdBQW1CLEVBQ25CLG9CQUE0QjtZQU41QixRQUFHLEdBQUgsR0FBRyxDQUFRO1lBQ1gsU0FBSSxHQUFKLElBQUksQ0FBUTtZQUNaLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1lBQ25CLFVBQUssR0FBTCxLQUFLLENBQVE7WUFDYixXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQ2QsZ0JBQVcsR0FBWCxXQUFXLENBQVE7WUFDbkIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFRO1FBQ3pDLENBQUM7S0FDTDtJQUVELE1BQWEsVUFBVTtRQWdCdEIsWUFBWSxPQUFvQjtZQUMvQixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7WUFDcEQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsZ0NBQXVCLENBQUM7WUFFcEQsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsR0FBRyxtQ0FBMEIsQ0FBQztZQUMxRCxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxHQUFHLGtDQUF5QixDQUFDO1lBQ3hELElBQUksQ0FBQywrQkFBK0IsR0FBRyxRQUFRLENBQUMsOEJBQThCLENBQUM7WUFDL0UsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsbUNBQTBCLEVB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