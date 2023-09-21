/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/sash/sash", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, dom_1, sash_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ZR = void 0;
    class $ZR {
        constructor() {
            this.a = new event_1.$fd();
            this.onDidWillResize = this.a.event;
            this.b = new event_1.$fd();
            this.onDidResize = this.b.event;
            this.h = new lifecycle_1.$jc();
            this.i = new dom_1.$BO(0, 0);
            this.j = new dom_1.$BO(0, 0);
            this.k = new dom_1.$BO(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
            this.domNode = document.createElement('div');
            this.d = new sash_1.$aR(this.domNode, { getVerticalSashLeft: () => this.i.width }, { orientation: 0 /* Orientation.VERTICAL */ });
            this.g = new sash_1.$aR(this.domNode, { getVerticalSashLeft: () => 0 }, { orientation: 0 /* Orientation.VERTICAL */ });
            this.c = new sash_1.$aR(this.domNode, { getHorizontalSashTop: () => 0 }, { orientation: 1 /* Orientation.HORIZONTAL */, orthogonalEdge: sash_1.OrthogonalEdge.North });
            this.f = new sash_1.$aR(this.domNode, { getHorizontalSashTop: () => this.i.height }, { orientation: 1 /* Orientation.HORIZONTAL */, orthogonalEdge: sash_1.OrthogonalEdge.South });
            this.c.orthogonalStartSash = this.g;
            this.c.orthogonalEndSash = this.d;
            this.f.orthogonalStartSash = this.g;
            this.f.orthogonalEndSash = this.d;
            let currentSize;
            let deltaY = 0;
            let deltaX = 0;
            this.h.add(event_1.Event.any(this.c.onDidStart, this.d.onDidStart, this.f.onDidStart, this.g.onDidStart)(() => {
                if (currentSize === undefined) {
                    this.a.fire();
                    currentSize = this.i;
                    deltaY = 0;
                    deltaX = 0;
                }
            }));
            this.h.add(event_1.Event.any(this.c.onDidEnd, this.d.onDidEnd, this.f.onDidEnd, this.g.onDidEnd)(() => {
                if (currentSize !== undefined) {
                    currentSize = undefined;
                    deltaY = 0;
                    deltaX = 0;
                    this.b.fire({ dimension: this.i, done: true });
                }
            }));
            this.h.add(this.d.onDidChange(e => {
                if (currentSize) {
                    deltaX = e.currentX - e.startX;
                    this.layout(currentSize.height + deltaY, currentSize.width + deltaX);
                    this.b.fire({ dimension: this.i, done: false, east: true });
                }
            }));
            this.h.add(this.g.onDidChange(e => {
                if (currentSize) {
                    deltaX = -(e.currentX - e.startX);
                    this.layout(currentSize.height + deltaY, currentSize.width + deltaX);
                    this.b.fire({ dimension: this.i, done: false, west: true });
                }
            }));
            this.h.add(this.c.onDidChange(e => {
                if (currentSize) {
                    deltaY = -(e.currentY - e.startY);
                    this.layout(currentSize.height + deltaY, currentSize.width + deltaX);
                    this.b.fire({ dimension: this.i, done: false, north: true });
                }
            }));
            this.h.add(this.f.onDidChange(e => {
                if (currentSize) {
                    deltaY = e.currentY - e.startY;
                    this.layout(currentSize.height + deltaY, currentSize.width + deltaX);
                    this.b.fire({ dimension: this.i, done: false, south: true });
                }
            }));
            this.h.add(event_1.Event.any(this.d.onDidReset, this.g.onDidReset)(e => {
                if (this.l) {
                    this.layout(this.i.height, this.l.width);
                    this.b.fire({ dimension: this.i, done: true });
                }
            }));
            this.h.add(event_1.Event.any(this.c.onDidReset, this.f.onDidReset)(e => {
                if (this.l) {
                    this.layout(this.l.height, this.i.width);
                    this.b.fire({ dimension: this.i, done: true });
                }
            }));
        }
        dispose() {
            this.c.dispose();
            this.f.dispose();
            this.d.dispose();
            this.g.dispose();
            this.h.dispose();
            this.b.dispose();
            this.a.dispose();
            this.domNode.remove();
        }
        enableSashes(north, east, south, west) {
            this.c.state = north ? 3 /* SashState.Enabled */ : 0 /* SashState.Disabled */;
            this.d.state = east ? 3 /* SashState.Enabled */ : 0 /* SashState.Disabled */;
            this.f.state = south ? 3 /* SashState.Enabled */ : 0 /* SashState.Disabled */;
            this.g.state = west ? 3 /* SashState.Enabled */ : 0 /* SashState.Disabled */;
        }
        layout(height = this.size.height, width = this.size.width) {
            const { height: minHeight, width: minWidth } = this.j;
            const { height: maxHeight, width: maxWidth } = this.k;
            height = Math.max(minHeight, Math.min(maxHeight, height));
            width = Math.max(minWidth, Math.min(maxWidth, width));
            const newSize = new dom_1.$BO(width, height);
            if (!dom_1.$BO.equals(newSize, this.i)) {
                this.domNode.style.height = height + 'px';
                this.domNode.style.width = width + 'px';
                this.i = newSize;
                this.c.layout();
                this.d.layout();
                this.f.layout();
                this.g.layout();
            }
        }
        clearSashHoverState() {
            this.d.clearSashHoverState();
            this.g.clearSashHoverState();
            this.c.clearSashHoverState();
            this.f.clearSashHoverState();
        }
        get size() {
            return this.i;
        }
        set maxSize(value) {
            this.k = value;
        }
        get maxSize() {
            return this.k;
        }
        set minSize(value) {
            this.j = value;
        }
        get minSize() {
            return this.j;
        }
        set preferredSize(value) {
            this.l = value;
        }
        get preferredSize() {
            return this.l;
        }
    }
    exports.$ZR = $ZR;
});
//# sourceMappingURL=resizable.js.map