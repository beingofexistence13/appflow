/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/editor/browser/view/viewPart", "vs/css!./blockDecorations"], function (require, exports, fastDomNode_1, viewPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$RX = void 0;
    class $RX extends viewPart_1.$FW {
        constructor(context) {
            super(context);
            this.a = [];
            this.b = -1;
            this.c = 0;
            this.domNode = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.domNode.setAttribute('role', 'presentation');
            this.domNode.setAttribute('aria-hidden', 'true');
            this.domNode.setClassName('blockDecorations-container');
            this.g();
        }
        g() {
            let didChange = false;
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            const newContentWidth = layoutInfo.contentWidth - layoutInfo.verticalScrollbarWidth;
            if (this.b !== newContentWidth) {
                this.b = newContentWidth;
                didChange = true;
            }
            const newContentLeft = layoutInfo.contentLeft;
            if (this.c !== newContentLeft) {
                this.c = newContentLeft;
                didChange = true;
            }
            return didChange;
        }
        dispose() {
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            return this.g();
        }
        onScrollChanged(e) {
            return e.scrollTopChanged || e.scrollLeftChanged;
        }
        onDecorationsChanged(e) {
            return true;
        }
        onZonesChanged(e) {
            return true;
        }
        // --- end event handlers
        prepareRender(ctx) {
            // Nothing to read
        }
        render(ctx) {
            let count = 0;
            const decorations = ctx.getDecorationsInViewport();
            for (const decoration of decorations) {
                if (!decoration.options.blockClassName) {
                    continue;
                }
                let block = this.a[count];
                if (!block) {
                    block = this.a[count] = (0, fastDomNode_1.$GP)(document.createElement('div'));
                    this.domNode.appendChild(block);
                }
                let top;
                let bottom;
                if (decoration.options.blockIsAfterEnd) {
                    // range must be empty
                    top = ctx.getVerticalOffsetAfterLineNumber(decoration.range.endLineNumber, false);
                    bottom = ctx.getVerticalOffsetAfterLineNumber(decoration.range.endLineNumber, true);
                }
                else {
                    top = ctx.getVerticalOffsetForLineNumber(decoration.range.startLineNumber, true);
                    bottom = decoration.range.isEmpty() && !decoration.options.blockDoesNotCollapse
                        ? ctx.getVerticalOffsetForLineNumber(decoration.range.startLineNumber, false)
                        : ctx.getVerticalOffsetAfterLineNumber(decoration.range.endLineNumber, true);
                }
                const [paddingTop, paddingRight, paddingBottom, paddingLeft] = decoration.options.blockPadding ?? [0, 0, 0, 0];
                block.setClassName('blockDecorations-block ' + decoration.options.blockClassName);
                block.setLeft(this.c - paddingLeft);
                block.setWidth(this.b + paddingLeft + paddingRight);
                block.setTop(top - ctx.scrollTop - paddingTop);
                block.setHeight(bottom - top + paddingTop + paddingBottom);
                count++;
            }
            for (let i = count; i < this.a.length; i++) {
                this.a[i].domNode.remove();
            }
            this.a.length = count;
        }
    }
    exports.$RX = $RX;
});
//# sourceMappingURL=blockDecorations.js.map