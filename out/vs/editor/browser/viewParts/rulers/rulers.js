/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/fastDomNode", "vs/editor/browser/view/viewPart", "vs/css!./rulers"], function (require, exports, fastDomNode_1, viewPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Rulers = void 0;
    class Rulers extends viewPart_1.ViewPart {
        constructor(context) {
            super(context);
            this.domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this.domNode.setAttribute('role', 'presentation');
            this.domNode.setAttribute('aria-hidden', 'true');
            this.domNode.setClassName('view-rulers');
            this._renderedRulers = [];
            const options = this._context.configuration.options;
            this._rulers = options.get(101 /* EditorOption.rulers */);
            this._typicalHalfwidthCharacterWidth = options.get(50 /* EditorOption.fontInfo */).typicalHalfwidthCharacterWidth;
        }
        dispose() {
            super.dispose();
        }
        // --- begin event handlers
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            this._rulers = options.get(101 /* EditorOption.rulers */);
            this._typicalHalfwidthCharacterWidth = options.get(50 /* EditorOption.fontInfo */).typicalHalfwidthCharacterWidth;
            return true;
        }
        onScrollChanged(e) {
            return e.scrollHeightChanged;
        }
        // --- end event handlers
        prepareRender(ctx) {
            // Nothing to read
        }
        _ensureRulersCount() {
            const currentCount = this._renderedRulers.length;
            const desiredCount = this._rulers.length;
            if (currentCount === desiredCount) {
                // Nothing to do
                return;
            }
            if (currentCount < desiredCount) {
                const { tabSize } = this._context.viewModel.model.getOptions();
                const rulerWidth = tabSize;
                let addCount = desiredCount - currentCount;
                while (addCount > 0) {
                    const node = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
                    node.setClassName('view-ruler');
                    node.setWidth(rulerWidth);
                    this.domNode.appendChild(node);
                    this._renderedRulers.push(node);
                    addCount--;
                }
                return;
            }
            let removeCount = currentCount - desiredCount;
            while (removeCount > 0) {
                const node = this._renderedRulers.pop();
                this.domNode.removeChild(node);
                removeCount--;
            }
        }
        render(ctx) {
            this._ensureRulersCount();
            for (let i = 0, len = this._rulers.length; i < len; i++) {
                const node = this._renderedRulers[i];
                const ruler = this._rulers[i];
                node.setBoxShadow(ruler.color ? `1px 0 0 0 ${ruler.color} inset` : ``);
                node.setHeight(Math.min(ctx.scrollHeight, 1000000));
                node.setLeft(ruler.column * this._typicalHalfwidthCharacterWidth);
            }
        }
    }
    exports.Rulers = Rulers;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVsZXJzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvdmlld1BhcnRzL3J1bGVycy9ydWxlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQWEsTUFBTyxTQUFRLG1CQUFRO1FBT25DLFlBQVksT0FBb0I7WUFDL0IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2YsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFBLCtCQUFpQixFQUFjLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM3RSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2pELElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO1lBQzFCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQztZQUNwRCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLCtCQUFxQixDQUFDO1lBQ2hELElBQUksQ0FBQywrQkFBK0IsR0FBRyxPQUFPLENBQUMsR0FBRyxnQ0FBdUIsQ0FBQyw4QkFBOEIsQ0FBQztRQUMxRyxDQUFDO1FBRWUsT0FBTztZQUN0QixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakIsQ0FBQztRQUVELDJCQUEyQjtRQUVYLHNCQUFzQixDQUFDLENBQTJDO1lBQ2pGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQztZQUNwRCxJQUFJLENBQUMs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