/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/editor/browser/view/viewPart", "vs/css!./blockDecorations"], function (require, exports, fastDomNode_1, viewPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BlockDecorations = void 0;
    class BlockDecorations extends viewPart_1.ViewPart {
        constructor(context) {
            super(context);
            this.blocks = [];
            this.contentWidth = -1;
            this.contentLeft = 0;
            this.domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this.domNode.setAttribute('role', 'presentation');
            this.domNode.setAttribute('aria-hidden', 'true');
            this.domNode.setClassName('blockDecorations-container');
            this.update();
        }
        update() {
            let didChange = false;
            const options = this._context.configuration.options;
            const layoutInfo = options.get(143 /* EditorOption.layoutInfo */);
            const newContentWidth = layoutInfo.contentWidth - layoutInfo.verticalScrollbarWidth;
            if (this.contentWidth !== newContentWidth) {
                this.contentWidth = newContentWidth;
                didChange = true;
            }
            const newContentLeft = layoutInfo.contentLeft;
            if (this.contentLeft !== newContentLeft) {
                this.contentLeft = newContentLeft;
                didChange = true;
            }
            return didChange;
        }
        dispose() {
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            return this.update();
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
                let block = this.blocks[count];
                if (!block) {
                    block = this.blocks[count] = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
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
                block.setLeft(this.contentLeft - paddingLeft);
                block.setWidth(this.contentWidth + paddingLeft + paddingRight);
                block.setTop(top - ctx.scrollTop - paddingTop);
                block.setHeight(bottom - top + paddingTop + paddingBottom);
                count++;
            }
            for (let i = count; i < this.blocks.length; i++) {
                this.blocks[i].domNode.remove();
            }
            this.blocks.length = count;
        }
    }
    exports.BlockDecorations = BlockDecorations;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tEZWNvcmF0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3ZpZXdQYXJ0cy9ibG9ja0RlY29yYXRpb25zL2Jsb2NrRGVjb3JhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQWEsZ0JBQWlCLFNBQVEsbUJBQVE7UUFTN0MsWUFBWSxPQUFvQjtZQUMvQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFOQyxXQUFNLEdBQStCLEVBQUUsQ0FBQztZQUVqRCxpQkFBWSxHQUFXLENBQUMsQ0FBQyxDQUFDO1lBQzFCLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1lBSy9CLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBQSwrQkFBaUIsRUFBYyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDN0UsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNqRCxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1lBRXhELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNmLENBQUM7UUFFTyxNQUFNO1lBQ2IsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3RCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQztZQUNwRCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxtQ0FBeUIsQ0FBQztZQUN4RCxNQUFNLGVBQWUsR0FBRyxVQUFVLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQztZQUVwRixJQUFJLElBQUksQ0FB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