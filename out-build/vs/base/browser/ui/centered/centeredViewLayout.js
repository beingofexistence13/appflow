/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/splitview/splitview", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, dom_1, splitview_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lR = void 0;
    const defaultState = {
        targetWidth: 900,
        leftMarginRatio: 0.1909,
        rightMarginRatio: 0.1909,
    };
    const distributeSizing = { type: 'distribute' };
    function createEmptyView(background) {
        const element = (0, dom_1.$)('.centered-layout-margin');
        element.style.height = '100%';
        if (background) {
            element.style.backgroundColor = background.toString();
        }
        return {
            element,
            layout: () => undefined,
            minimumSize: 60,
            maximumSize: Number.POSITIVE_INFINITY,
            onDidChange: event_1.Event.None
        };
    }
    function toSplitViewView(view, getHeight) {
        return {
            element: view.element,
            get maximumSize() { return view.maximumWidth; },
            get minimumSize() { return view.minimumWidth; },
            onDidChange: event_1.Event.map(view.onDidChange, e => e && e.width),
            layout: (size, offset, ctx) => view.layout(size, getHeight(), ctx?.top ?? 0, (ctx?.left ?? 0) + offset)
        };
    }
    class $lR {
        constructor(i, j, state = { ...defaultState }) {
            this.i = i;
            this.j = j;
            this.state = state;
            this.b = { width: 0, height: 0, left: 0, top: 0 };
            this.d = false;
            this.g = new lifecycle_1.$jc();
            this.h = true;
            this.k = {};
            this.i.appendChild(this.j.element);
            // Make sure to hide the split view overflow like sashes #52892
            this.i.style.overflow = 'hidden';
        }
        get minimumWidth() { return this.a ? this.a.minimumSize : this.j.minimumWidth; }
        get maximumWidth() { return this.a ? this.a.maximumSize : this.j.maximumWidth; }
        get minimumHeight() { return this.j.minimumHeight; }
        get maximumHeight() { return this.j.maximumHeight; }
        get onDidChange() { return this.j.onDidChange; }
        get boundarySashes() { return this.k; }
        set boundarySashes(boundarySashes) {
            this.k = boundarySashes;
            if (!this.a) {
                return;
            }
            this.a.orthogonalStartSash = boundarySashes.top;
            this.a.orthogonalEndSash = boundarySashes.bottom;
        }
        layout(width, height, top, left) {
            this.b = { width, height, top, left };
            if (this.a) {
                this.a.layout(width, this.b);
                if (!this.d || this.h) {
                    this.l();
                }
            }
            else {
                this.j.layout(width, height, top, left);
            }
            this.d = true;
        }
        l() {
            if (!this.a) {
                return;
            }
            if (this.h) {
                const centerViewWidth = Math.min(this.b.width, this.state.targetWidth);
                const marginWidthFloat = (this.b.width - centerViewWidth) / 2;
                this.a.resizeView(0, Math.floor(marginWidthFloat));
                this.a.resizeView(1, centerViewWidth);
                this.a.resizeView(2, Math.ceil(marginWidthFloat));
            }
            else {
                const leftMargin = this.state.leftMarginRatio * this.b.width;
                const rightMargin = this.state.rightMarginRatio * this.b.width;
                const center = this.b.width - leftMargin - rightMargin;
                this.a.resizeView(0, leftMargin);
                this.a.resizeView(1, center);
                this.a.resizeView(2, rightMargin);
            }
        }
        setFixedWidth(option) {
            this.h = option;
            if (!!this.a) {
                this.m();
                this.l();
            }
        }
        m() {
            if (!!this.a) {
                this.state.targetWidth = this.a.getViewSize(1);
                this.state.leftMarginRatio = this.a.getViewSize(0) / this.b.width;
                this.state.rightMarginRatio = this.a.getViewSize(2) / this.b.width;
            }
        }
        isActive() {
            return !!this.a;
        }
        styles(style) {
            this.c = style;
            if (this.a && this.f) {
                this.a.style(this.c);
                this.f[0].element.style.backgroundColor = this.c.background.toString();
                this.f[1].element.style.backgroundColor = this.c.background.toString();
            }
        }
        activate(active) {
            if (active === this.isActive()) {
                return;
            }
            if (active) {
                this.i.removeChild(this.j.element);
                this.a = new splitview_1.$bR(this.i, {
                    inverseAltBehavior: true,
                    orientation: 1 /* Orientation.HORIZONTAL */,
                    styles: this.c
                });
                this.a.orthogonalStartSash = this.boundarySashes.top;
                this.a.orthogonalEndSash = this.boundarySashes.bottom;
                this.g.add(this.a.onDidSashChange(() => {
                    if (!!this.a) {
                        this.m();
                    }
                }));
                this.g.add(this.a.onDidSashReset(() => {
                    this.state = { ...defaultState };
                    this.l();
                }));
                this.a.layout(this.b.width, this.b);
                const backgroundColor = this.c ? this.c.background : undefined;
                this.f = [createEmptyView(backgroundColor), createEmptyView(backgroundColor)];
                this.a.addView(this.f[0], distributeSizing, 0);
                this.a.addView(toSplitViewView(this.j, () => this.b.height), distributeSizing, 1);
                this.a.addView(this.f[1], distributeSizing, 2);
                this.l();
            }
            else {
                if (this.a) {
                    this.i.removeChild(this.a.el);
                }
                this.g.clear();
                this.a?.dispose();
                this.a = undefined;
                this.f = undefined;
                this.i.appendChild(this.j.element);
                this.j.layout(this.b.width, this.b.height, this.b.top, this.b.left);
            }
        }
        isDefault(state) {
            if (this.h) {
                return state.targetWidth === defaultState.targetWidth;
            }
            else {
                return state.leftMarginRatio === defaultState.leftMarginRatio
                    && state.rightMarginRatio === defaultState.rightMarginRatio;
            }
        }
        dispose() {
            this.g.dispose();
            if (this.a) {
                this.a.dispose();
                this.a = undefined;
            }
        }
    }
    exports.$lR = $lR;
});
//# sourceMappingURL=centeredViewLayout.js.map