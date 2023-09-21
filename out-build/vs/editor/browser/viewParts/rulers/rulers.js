/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/editor/browser/view/viewPart", "vs/css!./rulers"], function (require, exports, fastDomNode_1, viewPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$MX = void 0;
    class $MX extends viewPart_1.$FW {
        constructor(context) {
            super(context);
            this.domNode = (0, fastDomNode_1.$GP)(document.createElement('div'));
            this.domNode.setAttribute('role', 'presentation');
            this.domNode.setAttribute('aria-hidden', 'true');
            this.domNode.setClassName('view-rulers');
            this.a = [];
            const options = this._context.configuration.options;
            this.b = options.get(101 /* EditorOption.rulers */);
            this.c = options.get(50 /* EditorOption.fontInfo */).typicalHalfwidthCharacterWidth;
        }
        dispose() {
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            this.b = options.get(101 /* EditorOption.rulers */);
            this.c = options.get(50 /* EditorOption.fontInfo */).typicalHalfwidthCharacterWidth;
            return true;
        }
        onScrollChanged(e) {
            return e.scrollHeightChanged;
        }
        // --- end event handlers
        prepareRender(ctx) {
            // Nothing to read
        }
        g() {
            const currentCount = this.a.length;
            const desiredCount = this.b.length;
            if (currentCount === desiredCount) {
                // Nothing to do
                return;
            }
            if (currentCount < desiredCount) {
                const { tabSize } = this._context.viewModel.model.getOptions();
                const rulerWidth = tabSize;
                let addCount = desiredCount - currentCount;
                while (addCount > 0) {
                    const node = (0, fastDomNode_1.$GP)(document.createElement('div'));
                    node.setClassName('view-ruler');
                    node.setWidth(rulerWidth);
                    this.domNode.appendChild(node);
                    this.a.push(node);
                    addCount--;
                }
                return;
            }
            let removeCount = currentCount - desiredCount;
            while (removeCount > 0) {
                const node = this.a.pop();
                this.domNode.removeChild(node);
                removeCount--;
            }
        }
        render(ctx) {
            this.g();
            for (let i = 0, len = this.b.length; i < len; i++) {
                const node = this.a[i];
                const ruler = this.b[i];
                node.setBoxShadow(ruler.color ? `1px 0 0 0 ${ruler.color} inset` : ``);
                node.setHeight(Math.min(ctx.scrollHeight, 1000000));
                node.setLeft(ruler.column * this.c);
            }
        }
    }
    exports.$MX = $MX;
});
//# sourceMappingURL=rulers.js.map