/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/sash/sash", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, dom_1, sash_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResizableHTMLElement = void 0;
    class ResizableHTMLElement {
        constructor() {
            this._onDidWillResize = new event_1.Emitter();
            this.onDidWillResize = this._onDidWillResize.event;
            this._onDidResize = new event_1.Emitter();
            this.onDidResize = this._onDidResize.event;
            this._sashListener = new lifecycle_1.DisposableStore();
            this._size = new dom_1.Dimension(0, 0);
            this._minSize = new dom_1.Dimension(0, 0);
            this._maxSize = new dom_1.Dimension(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
            this.domNode = document.createElement('div');
            this._eastSash = new sash_1.Sash(this.domNode, { getVerticalSashLeft: () => this._size.width }, { orientation: 0 /* Orientation.VERTICAL */ });
            this._westSash = new sash_1.Sash(this.domNode, { getVerticalSashLeft: () => 0 }, { orientation: 0 /* Orientation.VERTICAL */ });
            this._northSash = new sash_1.Sash(this.domNode, { getHorizontalSashTop: () => 0 }, { orientation: 1 /* Orientation.HORIZONTAL */, orthogonalEdge: sash_1.OrthogonalEdge.North });
            this._southSash = new sash_1.Sash(this.domNode, { getHorizontalSashTop: () => this._size.height }, { orientation: 1 /* Orientation.HORIZONTAL */, orthogonalEdge: sash_1.OrthogonalEdge.South });
            this._northSash.orthogonalStartSash = this._westSash;
            this._northSash.orthogonalEndSash = this._eastSash;
            this._southSash.orthogonalStartSash = this._westSash;
            this._southSash.orthogonalEndSash = this._eastSash;
            let currentSize;
            let deltaY = 0;
            let deltaX = 0;
            this._sashListener.add(event_1.Event.any(this._northSash.onDidStart, this._eastSash.onDidStart, this._southSash.onDidStart, this._westSash.onDidStart)(() => {
                if (currentSize === undefined) {
                    this._onDidWillResize.fire();
                    currentSize = this._size;
                    deltaY = 0;
                    deltaX = 0;
                }
            }));
            this._sashListener.add(event_1.Event.any(this._northSash.onDidEnd, this._eastSash.onDidEnd, this._southSash.onDidEnd, this._westSash.onDidEnd)(() => {
                if (currentSize !== undefined) {
                    currentSize = undefined;
                    deltaY = 0;
                    deltaX = 0;
                    this._onDidResize.fire({ dimension: this._size, done: true });
                }
            }));
            this._sashListener.add(this._eastSash.onDidChange(e => {
                if (currentSize) {
                    deltaX = e.currentX - e.startX;
                    this.layout(currentSize.height + deltaY, currentSize.width + deltaX);
                    this._onDidResize.fire({ dimension: this._size, done: false, east: true });
                }
            }));
            this._sashListener.add(this._westSash.onDidChange(e => {
                if (currentSize) {
                    deltaX = -(e.currentX - e.startX);
                    this.layout(currentSize.height + deltaY, currentSize.width + deltaX);
                    this._onDidResize.fire({ dimension: this._size, done: false, west: true });
                }
            }));
            this._sashListener.add(this._northSash.onDidChange(e => {
                if (currentSize) {
                    deltaY = -(e.currentY - e.startY);
                    this.layout(currentSize.height + deltaY, currentSize.width + deltaX);
                    this._onDidResize.fire({ dimension: this._size, done: false, north: true });
                }
            }));
            this._sashListener.add(this._southSash.onDidChange(e => {
                if (currentSize) {
                    deltaY = e.currentY - e.startY;
                    this.layout(currentSize.height + deltaY, currentSize.width + deltaX);
                    this._onDidResize.fire({ dimension: this._size, done: false, south: true });
                }
            }));
            this._sashListener.add(event_1.Event.any(this._eastSash.onDidReset, this._westSash.onDidReset)(e => {
                if (this._preferredSize) {
                    this.layout(this._size.height, this._preferredSize.width);
                    this._onDidResize.fire({ dimension: this._size, done: true });
                }
            }));
            this._sashListener.add(event_1.Event.any(this._northSash.onDidReset, this._southSash.onDidReset)(e => {
                if (this._preferredSize) {
                    this.layout(this._preferredSize.height, this._size.width);
                    this._onDidResize.fire({ dimension: this._size, done: true });
                }
            }));
        }
        dispose() {
            this._northSash.dispose();
            this._southSash.dispose();
            this._eastSash.dispose();
            this._westSash.dispose();
            this._sashListener.dispose();
            this._onDidResize.dispose();
            this._onDidWillResize.dispose();
            this.domNode.remove();
        }
        enableSashes(north, east, south, west) {
            this._northSash.state = north ? 3 /* SashState.Enabled */ : 0 /* SashState.Disabled */;
            this._eastSash.state = east ? 3 /* SashState.Enabled */ : 0 /* SashState.Disabled */;
            this._southSash.state = south ? 3 /* SashState.Enabled */ : 0 /* SashState.Disabled */;
            this._westSash.state = west ? 3 /* SashState.Enabled */ : 0 /* SashState.Disabled */;
        }
        layout(height = this.size.height, width = this.size.width) {
            const { height: minHeight, width: minWidth } = this._minSize;
            const { height: maxHeight, width: maxWidth } = this._maxSize;
            height = Math.max(minHeight, Math.min(maxHeight, height));
            width = Math.max(minWidth, Math.min(maxWidth, width));
            const newSize = new dom_1.Dimension(width, height);
            if (!dom_1.Dimension.equals(newSize, this._size)) {
                this.domNode.style.height = height + 'px';
                this.domNode.style.width = width + 'px';
                this._size = newSize;
                this._northSash.layout();
                this._eastSash.layout();
                this._southSash.layout();
                this._westSash.layout();
            }
        }
        clearSashHoverState() {
            this._eastSash.clearSashHoverState();
            this._westSash.clearSashHoverState();
            this._northSash.clearSashHoverState();
            this._southSash.clearSashHoverState();
        }
        get size() {
            return this._size;
        }
        set maxSize(value) {
            this._maxSize = value;
        }
        get maxSize() {
            return this._maxSize;
        }
        set minSize(value) {
            this._minSize = value;
        }
        get minSize() {
            return this._minSize;
        }
        set preferredSize(value) {
            this._preferredSize = value;
        }
        get preferredSize() {
            return this._preferredSize;
        }
    }
    exports.ResizableHTMLElement = ResizableHTMLElement;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXphYmxlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL3Jlc2l6YWJsZS9yZXNpemFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJoRyxNQUFhLG9CQUFvQjtRQXFCaEM7WUFqQmlCLHFCQUFnQixHQUFHLElBQUksZUFBTyxFQUFRLENBQUM7WUFDL0Msb0JBQWUsR0FBZ0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQztZQUVuRCxpQkFBWSxHQUFHLElBQUksZUFBTyxFQUFnQixDQUFDO1lBQ25ELGdCQUFXLEdBQXdCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBTW5ELGtCQUFhLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFL0MsVUFBSyxHQUFHLElBQUksZUFBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QixhQUFRLEdBQUcsSUFBSSxlQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9CLGFBQVEsR0FBRyxJQUFJLGVBQVMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFJbEYsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxXQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLG1CQUFtQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxXQUFXLDhCQUFzQixFQUFFLENBQUMsQ0FBQztZQUNoSSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksV0FBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxtQkFB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R0FBRyxNQUFNLENBQUMsQ0FBQztvQkFDckUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUMzRTtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDckQsSUFBSSxXQUFXLEVBQUU7b0JBQ2hCLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxNQUFNLEVBQUUsV0FBVyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQztvQkFDckUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUMzRTtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDdEQsSUFBSSxXQUFXLEVBQUU7b0JBQ2hCLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxNQUFNLEVBQUUsV0FBVyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQztvQkFDckUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFB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