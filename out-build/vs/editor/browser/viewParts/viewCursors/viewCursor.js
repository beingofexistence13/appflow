/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/base/common/strings", "vs/editor/browser/config/domFontInfo", "vs/editor/common/config/editorOptions", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/base/browser/ui/mouseCursor/mouseCursor"], function (require, exports, dom, fastDomNode_1, strings, domFontInfo_1, editorOptions_1, position_1, range_1, mouseCursor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1W = void 0;
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
    class $1W {
        constructor(context) {
            this.a = context;
            const options = this.a.configuration.options;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            this.c = options.get(28 /* EditorOption.cursorStyle */);
            this.f = options.get(66 /* EditorOption.lineHeight */);
            this.g = fontInfo.typicalHalfwidthCharacterWidth;
            this.d = Math.min(options.get(31 /* EditorOption.cursorWidth */), this.g);
            this.h = true;
            // Create the dom node
            this.b = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.b.setClassName(`cursor ${mouseCursor_1.$WR}`);
            this.b.setHeight(this.f);
            this.b.setTop(0);
            this.b.setLeft(0);
            (0, domFontInfo_1.$vU)(this.b, fontInfo);
            this.b.setDisplay('none');
            this.i = new position_1.$js(1, 1);
            this.j = '';
            this.k = null;
        }
        getDomNode() {
            return this.b;
        }
        getPosition() {
            return this.i;
        }
        show() {
            if (!this.h) {
                this.b.setVisibility('inherit');
                this.h = true;
            }
        }
        hide() {
            if (this.h) {
                this.b.setVisibility('hidden');
                this.h = false;
            }
        }
        onConfigurationChanged(e) {
            const options = this.a.configuration.options;
            const fontInfo = options.get(50 /* EditorOption.fontInfo */);
            this.c = options.get(28 /* EditorOption.cursorStyle */);
            this.f = options.get(66 /* EditorOption.lineHeight */);
            this.g = fontInfo.typicalHalfwidthCharacterWidth;
            this.d = Math.min(options.get(31 /* EditorOption.cursorWidth */), this.g);
            (0, domFontInfo_1.$vU)(this.b, fontInfo);
            return true;
        }
        onCursorPositionChanged(position, pauseAnimation) {
            if (pauseAnimation) {
                this.b.domNode.style.transitionProperty = 'none';
            }
            else {
                this.b.domNode.style.transitionProperty = '';
            }
            this.i = position;
            return true;
        }
        /**
         * If `this._position` is inside a grapheme, returns the position where the grapheme starts.
         * Also returns the next grapheme.
         */
        l() {
            const { lineNumber, column } = this.i;
            const lineContent = this.a.viewModel.getLineContent(lineNumber);
            const [startOffset, endOffset] = strings.$Ye(lineContent, column - 1);
            return [new position_1.$js(lineNumber, startOffset + 1), lineContent.substring(startOffset, endOffset)];
        }
        m(ctx) {
            let textContent = '';
            let textContentClassName = '';
            const [position, nextGrapheme] = this.l();
            if (this.c === editorOptions_1.TextEditorCursorStyle.Line || this.c === editorOptions_1.TextEditorCursorStyle.LineThin) {
                const visibleRange = ctx.visibleRangeForPosition(position);
                if (!visibleRange || visibleRange.outsideRenderedLine) {
                    // Outside viewport
                    return null;
                }
                let width;
                if (this.c === editorOptions_1.TextEditorCursorStyle.Line) {
                    width = dom.$iP(this.d > 0 ? this.d : 2);
                    if (width > 2) {
                        textContent = nextGrapheme;
                        textContentClassName = this.n(position);
                    }
                }
                else {
                    width = dom.$iP(1);
                }
                let left = visibleRange.left;
                let paddingLeft = 0;
                if (width >= 2 && left >= 1) {
                    // shift the cursor a bit between the characters
                    paddingLeft = 1;
                    left -= paddingLeft;
                }
                const top = ctx.getVerticalOffsetForLineNumber(position.lineNumber) - ctx.bigNumbersDelta;
                return new ViewCursorRenderData(top, left, paddingLeft, width, this.f, textContent, textContentClassName);
            }
            const visibleRangeForCharacter = ctx.linesVisibleRangesForRange(new range_1.$ks(position.lineNumber, position.column, position.lineNumber, position.column + nextGrapheme.length), false);
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
                ? this.g
                : (range.width < 1
                    ? this.g
                    : range.width));
            if (this.c === editorOptions_1.TextEditorCursorStyle.Block) {
                textContent = nextGrapheme;
                textContentClassName = this.n(position);
            }
            let top = ctx.getVerticalOffsetForLineNumber(position.lineNumber) - ctx.bigNumbersDelta;
            let height = this.f;
            // Underline might interfere with clicking
            if (this.c === editorOptions_1.TextEditorCursorStyle.Underline || this.c === editorOptions_1.TextEditorCursorStyle.UnderlineThin) {
                top += this.f - 2;
                height = 2;
            }
            return new ViewCursorRenderData(top, range.left, 0, width, height, textContent, textContentClassName);
        }
        n(position) {
            const lineData = this.a.viewModel.getViewLineData(position.lineNumber);
            const tokenIndex = lineData.tokens.findTokenIndexAtOffset(position.column - 1);
            return lineData.tokens.getClassName(tokenIndex);
        }
        prepareRender(ctx) {
            this.k = this.m(ctx);
        }
        render(ctx) {
            if (!this.k) {
                this.b.setDisplay('none');
                return null;
            }
            if (this.j !== this.k.textContent) {
                this.j = this.k.textContent;
                this.b.domNode.textContent = this.j;
            }
            this.b.setClassName(`cursor ${mouseCursor_1.$WR} ${this.k.textContentClassName}`);
            this.b.setDisplay('block');
            this.b.setTop(this.k.top);
            this.b.setLeft(this.k.left);
            this.b.setPaddingLeft(this.k.paddingLeft);
            this.b.setWidth(this.k.width);
            this.b.setLineHeight(this.k.height);
            this.b.setHeight(this.k.height);
            return {
                domNode: this.b.domNode,
                position: this.i,
                contentLeft: this.k.left,
                height: this.k.height,
                width: 2
            };
        }
    }
    exports.$1W = $1W;
});
//# sourceMappingURL=viewCursor.js.map