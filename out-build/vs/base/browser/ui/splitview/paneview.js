/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dnd", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/browser/touch", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/base/browser/ui/splitview/paneview", "./splitview", "vs/css!./paneview"], function (require, exports, browser_1, dnd_1, dom_1, event_1, keyboardEvent_1, touch_1, color_1, event_2, lifecycle_1, nls_1, splitview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3R = exports.$2R = exports.$1R = void 0;
    /**
     * A Pane is a structured SplitView view.
     *
     * WARNING: You must call `render()` after you construct it.
     * It can't be done automatically at the end of the ctor
     * because of the order of property initialization in TypeScript.
     * Subclasses wouldn't be able to set own properties
     * before the `render()` call, thus forbidding their use.
     */
    class $1R extends lifecycle_1.$kc {
        static { this.u = 22; }
        get ariaHeaderLabel() {
            return this.J;
        }
        set ariaHeaderLabel(newLabel) {
            this.J = newLabel;
            this.w.setAttribute('aria-label', this.ariaHeaderLabel);
        }
        get draggableElement() {
            return this.w;
        }
        get dropTargetElement() {
            return this.element;
        }
        get dropBackground() {
            return this.M.dropBackground;
        }
        get minimumBodySize() {
            return this.H;
        }
        set minimumBodySize(size) {
            this.H = size;
            this.O.fire(undefined);
        }
        get maximumBodySize() {
            return this.I;
        }
        set maximumBodySize(size) {
            this.I = size;
            this.O.fire(undefined);
        }
        get Q() {
            return this.headerVisible ? $1R.u : 0;
        }
        get minimumSize() {
            const headerSize = this.Q;
            const expanded = !this.headerVisible || this.isExpanded();
            const minimumBodySize = expanded ? this.minimumBodySize : 0;
            return headerSize + minimumBodySize;
        }
        get maximumSize() {
            const headerSize = this.Q;
            const expanded = !this.headerVisible || this.isExpanded();
            const maximumBodySize = expanded ? this.maximumBodySize : 0;
            return headerSize + maximumBodySize;
        }
        constructor(options) {
            super();
            this.D = undefined;
            this.F = true;
            this.G = false;
            this.M = {
                dropBackground: undefined,
                headerBackground: undefined,
                headerBorder: undefined,
                headerForeground: undefined,
                leftBorder: undefined
            };
            this.N = undefined;
            this.O = this.B(new event_2.$fd());
            this.onDidChange = this.O.event;
            this.P = this.B(new event_2.$fd());
            this.onDidChangeExpansionState = this.P.event;
            this.orthogonalSize = 0;
            this.z = typeof options.expanded === 'undefined' ? true : !!options.expanded;
            this.C = typeof options.orientation === 'undefined' ? 0 /* Orientation.VERTICAL */ : options.orientation;
            this.J = (0, nls_1.localize)(0, null, options.title);
            this.H = typeof options.minimumBodySize === 'number' ? options.minimumBodySize : this.C === 1 /* Orientation.HORIZONTAL */ ? 200 : 120;
            this.I = typeof options.maximumBodySize === 'number' ? options.maximumBodySize : Number.POSITIVE_INFINITY;
            this.element = (0, dom_1.$)('.pane');
        }
        isExpanded() {
            return this.z;
        }
        setExpanded(expanded) {
            if (this.z === !!expanded) {
                return false;
            }
            this.element?.classList.toggle('expanded', expanded);
            this.z = !!expanded;
            this.R();
            if (expanded) {
                if (!this.G) {
                    this.U(this.y);
                    this.G = true;
                }
                if (typeof this.N === 'number') {
                    clearTimeout(this.N);
                }
                (0, dom_1.$0O)(this.element, this.y);
            }
            else {
                this.N = window.setTimeout(() => {
                    this.y.remove();
                }, 200);
            }
            this.P.fire(expanded);
            this.O.fire(expanded ? this.D : undefined);
            return true;
        }
        get headerVisible() {
            return this.F;
        }
        set headerVisible(visible) {
            if (this.F === !!visible) {
                return;
            }
            this.F = !!visible;
            this.R();
            this.O.fire(undefined);
        }
        get orientation() {
            return this.C;
        }
        set orientation(orientation) {
            if (this.C === orientation) {
                return;
            }
            this.C = orientation;
            if (this.element) {
                this.element.classList.toggle('horizontal', this.orientation === 1 /* Orientation.HORIZONTAL */);
                this.element.classList.toggle('vertical', this.orientation === 0 /* Orientation.VERTICAL */);
            }
            if (this.w) {
                this.R();
            }
        }
        render() {
            this.element.classList.toggle('expanded', this.isExpanded());
            this.element.classList.toggle('horizontal', this.orientation === 1 /* Orientation.HORIZONTAL */);
            this.element.classList.toggle('vertical', this.orientation === 0 /* Orientation.VERTICAL */);
            this.w = (0, dom_1.$)('.pane-header');
            (0, dom_1.$0O)(this.element, this.w);
            this.w.setAttribute('tabindex', '0');
            // Use role button so the aria-expanded state gets read https://github.com/microsoft/vscode/issues/95996
            this.w.setAttribute('role', 'button');
            this.w.setAttribute('aria-label', this.ariaHeaderLabel);
            this.S(this.w);
            const focusTracker = (0, dom_1.$8O)(this.w);
            this.B(focusTracker);
            this.B(focusTracker.onDidFocus(() => this.w.classList.add('focused'), null));
            this.B(focusTracker.onDidBlur(() => this.w.classList.remove('focused'), null));
            this.R();
            const eventDisposables = this.B(new lifecycle_1.$jc());
            const onKeyDown = this.B(new event_1.$9P(this.w, 'keydown'));
            const onHeaderKeyDown = event_2.Event.map(onKeyDown.event, e => new keyboardEvent_1.$jO(e), eventDisposables);
            this.B(event_2.Event.filter(onHeaderKeyDown, e => e.keyCode === 3 /* KeyCode.Enter */ || e.keyCode === 10 /* KeyCode.Space */, eventDisposables)(() => this.setExpanded(!this.isExpanded()), null));
            this.B(event_2.Event.filter(onHeaderKeyDown, e => e.keyCode === 15 /* KeyCode.LeftArrow */, eventDisposables)(() => this.setExpanded(false), null));
            this.B(event_2.Event.filter(onHeaderKeyDown, e => e.keyCode === 17 /* KeyCode.RightArrow */, eventDisposables)(() => this.setExpanded(true), null));
            this.B(touch_1.$EP.addTarget(this.w));
            [dom_1.$3O.CLICK, touch_1.EventType.Tap].forEach(eventType => {
                this.B((0, dom_1.$nO)(this.w, eventType, e => {
                    if (!e.defaultPrevented) {
                        this.setExpanded(!this.isExpanded());
                    }
                }));
            });
            this.y = (0, dom_1.$0O)(this.element, (0, dom_1.$)('.pane-body'));
            // Only render the body if it will be visible
            // Otherwise, render it when the pane is expanded
            if (!this.G && this.isExpanded()) {
                this.U(this.y);
                this.G = true;
            }
            if (!this.isExpanded()) {
                this.y.remove();
            }
        }
        layout(size) {
            const headerSize = this.headerVisible ? $1R.u : 0;
            const width = this.C === 0 /* Orientation.VERTICAL */ ? this.orthogonalSize : size;
            const height = this.C === 0 /* Orientation.VERTICAL */ ? size - headerSize : this.orthogonalSize - headerSize;
            if (this.isExpanded()) {
                this.y.classList.toggle('wide', width >= 600);
                this.W(height, width);
                this.D = size;
            }
        }
        style(styles) {
            this.M = styles;
            if (!this.w) {
                return;
            }
            this.R();
        }
        R() {
            const expanded = !this.headerVisible || this.isExpanded();
            this.w.style.lineHeight = `${this.Q}px`;
            this.w.classList.toggle('hidden', !this.headerVisible);
            this.w.classList.toggle('expanded', expanded);
            this.w.setAttribute('aria-expanded', String(expanded));
            this.w.style.color = this.M.headerForeground ?? '';
            this.w.style.backgroundColor = this.M.headerBackground ?? '';
            this.w.style.borderTop = this.M.headerBorder && this.orientation === 0 /* Orientation.VERTICAL */ ? `1px solid ${this.M.headerBorder}` : '';
            this.element.style.borderLeft = this.M.leftBorder && this.orientation === 1 /* Orientation.HORIZONTAL */ ? `1px solid ${this.M.leftBorder}` : '';
        }
    }
    exports.$1R = $1R;
    class PaneDraggable extends lifecycle_1.$kc {
        static { this.a = new color_1.$Os(new color_1.$Ls(128, 128, 128, 0.5)); }
        constructor(f, g, h) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.b = 0; // see https://github.com/microsoft/vscode/issues/14470
            this.c = this.B(new event_2.$fd());
            this.onDidDrop = this.c.event;
            f.draggableElement.draggable = true;
            this.B((0, dom_1.$nO)(f.draggableElement, 'dragstart', e => this.j(e)));
            this.B((0, dom_1.$nO)(f.dropTargetElement, 'dragenter', e => this.m(e)));
            this.B((0, dom_1.$nO)(f.dropTargetElement, 'dragleave', e => this.n(e)));
            this.B((0, dom_1.$nO)(f.dropTargetElement, 'dragend', e => this.r(e)));
            this.B((0, dom_1.$nO)(f.dropTargetElement, 'drop', e => this.s(e)));
        }
        j(e) {
            if (!this.g.canDrag(this.f) || !e.dataTransfer) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            e.dataTransfer.effectAllowed = 'move';
            if (browser_1.$5N) {
                // Firefox: requires to set a text data transfer to get going
                e.dataTransfer?.setData(dnd_1.$CP.TEXT, this.f.draggableElement.textContent || '');
            }
            const dragImage = (0, dom_1.$0O)(document.body, (0, dom_1.$)('.monaco-drag-image', {}, this.f.draggableElement.textContent || ''));
            e.dataTransfer.setDragImage(dragImage, -10, -10);
            setTimeout(() => document.body.removeChild(dragImage), 0);
            this.h.draggable = this;
        }
        m(e) {
            if (!this.h.draggable || this.h.draggable === this) {
                return;
            }
            if (!this.g.canDrop(this.h.draggable.f, this.f)) {
                return;
            }
            this.b++;
            this.t();
        }
        n(e) {
            if (!this.h.draggable || this.h.draggable === this) {
                return;
            }
            if (!this.g.canDrop(this.h.draggable.f, this.f)) {
                return;
            }
            this.b--;
            if (this.b === 0) {
                this.t();
            }
        }
        r(e) {
            if (!this.h.draggable) {
                return;
            }
            this.b = 0;
            this.t();
            this.h.draggable = null;
        }
        s(e) {
            if (!this.h.draggable) {
                return;
            }
            dom_1.$5O.stop(e);
            this.b = 0;
            this.t();
            if (this.g.canDrop(this.h.draggable.f, this.f) && this.h.draggable !== this) {
                this.c.fire({ from: this.h.draggable.f, to: this.f });
            }
            this.h.draggable = null;
        }
        t() {
            let backgroundColor = null;
            if (this.b > 0) {
                backgroundColor = this.f.dropBackground ?? PaneDraggable.a.toString();
            }
            this.f.dropTargetElement.style.backgroundColor = backgroundColor || '';
        }
    }
    class $2R {
        canDrag(pane) {
            return true;
        }
        canDrop(pane, overPane) {
            return true;
        }
    }
    exports.$2R = $2R;
    class $3R extends lifecycle_1.$kc {
        constructor(container, options = {}) {
            super();
            this.b = { draggable: null };
            this.c = [];
            this.f = 0;
            this.g = 0;
            this.j = undefined;
            this.m = this.B(new event_2.$fd());
            this.onDidDrop = this.m.event;
            this.a = options.dnd;
            this.orientation = options.orientation ?? 0 /* Orientation.VERTICAL */;
            this.element = (0, dom_1.$0O)(container, (0, dom_1.$)('.monaco-pane-view'));
            this.h = this.B(new splitview_1.$bR(this.element, { orientation: this.orientation }));
            this.onDidSashReset = this.h.onDidSashReset;
            this.onDidSashChange = this.h.onDidSashChange;
            this.onDidScroll = this.h.onDidScroll;
            const eventDisposables = this.B(new lifecycle_1.$jc());
            const onKeyDown = this.B(new event_1.$9P(this.element, 'keydown'));
            const onHeaderKeyDown = event_2.Event.map(event_2.Event.filter(onKeyDown.event, e => e.target instanceof HTMLElement && e.target.classList.contains('pane-header'), eventDisposables), e => new keyboardEvent_1.$jO(e), eventDisposables);
            this.B(event_2.Event.filter(onHeaderKeyDown, e => e.keyCode === 16 /* KeyCode.UpArrow */, eventDisposables)(() => this.u()));
            this.B(event_2.Event.filter(onHeaderKeyDown, e => e.keyCode === 18 /* KeyCode.DownArrow */, eventDisposables)(() => this.w()));
        }
        addPane(pane, size, index = this.h.length) {
            const disposables = new lifecycle_1.$jc();
            pane.onDidChangeExpansionState(this.s, this, disposables);
            const paneItem = { pane: pane, disposable: disposables };
            this.c.splice(index, 0, paneItem);
            pane.orientation = this.orientation;
            pane.orthogonalSize = this.f;
            this.h.addView(pane, size, index);
            if (this.a) {
                const draggable = new PaneDraggable(pane, this.a, this.b);
                disposables.add(draggable);
                disposables.add(draggable.onDidDrop(this.m.fire, this.m));
            }
        }
        removePane(pane) {
            const index = this.c.findIndex(item => item.pane === pane);
            if (index === -1) {
                return;
            }
            this.h.removeView(index, pane.isExpanded() ? splitview_1.Sizing.Distribute : undefined);
            const paneItem = this.c.splice(index, 1)[0];
            paneItem.disposable.dispose();
        }
        movePane(from, to) {
            const fromIndex = this.c.findIndex(item => item.pane === from);
            const toIndex = this.c.findIndex(item => item.pane === to);
            if (fromIndex === -1 || toIndex === -1) {
                return;
            }
            const [paneItem] = this.c.splice(fromIndex, 1);
            this.c.splice(toIndex, 0, paneItem);
            this.h.moveView(fromIndex, toIndex);
        }
        resizePane(pane, size) {
            const index = this.c.findIndex(item => item.pane === pane);
            if (index === -1) {
                return;
            }
            this.h.resizeView(index, size);
        }
        getPaneSize(pane) {
            const index = this.c.findIndex(item => item.pane === pane);
            if (index === -1) {
                return -1;
            }
            return this.h.getViewSize(index);
        }
        layout(height, width) {
            this.f = this.orientation === 0 /* Orientation.VERTICAL */ ? width : height;
            this.g = this.orientation === 1 /* Orientation.HORIZONTAL */ ? width : height;
            for (const paneItem of this.c) {
                paneItem.pane.orthogonalSize = this.f;
            }
            this.h.layout(this.g);
        }
        setBoundarySashes(sashes) {
            this.n = sashes;
            this.r(sashes);
        }
        r(sashes) {
            if (this.orientation === 0 /* Orientation.VERTICAL */) {
                this.h.orthogonalStartSash = sashes?.left;
                this.h.orthogonalEndSash = sashes?.right;
            }
            else {
                this.h.orthogonalEndSash = sashes?.bottom;
            }
        }
        flipOrientation(height, width) {
            this.orientation = this.orientation === 0 /* Orientation.VERTICAL */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */;
            const paneSizes = this.c.map(pane => this.getPaneSize(pane.pane));
            this.h.dispose();
            (0, dom_1.$lO)(this.element);
            this.h = this.B(new splitview_1.$bR(this.element, { orientation: this.orientation }));
            this.r(this.n);
            const newOrthogonalSize = this.orientation === 0 /* Orientation.VERTICAL */ ? width : height;
            const newSize = this.orientation === 1 /* Orientation.HORIZONTAL */ ? width : height;
            this.c.forEach((pane, index) => {
                pane.pane.orthogonalSize = newOrthogonalSize;
                pane.pane.orientation = this.orientation;
                const viewSize = this.g === 0 ? 0 : (newSize * paneSizes[index]) / this.g;
                this.h.addView(pane.pane, viewSize, index);
            });
            this.g = newSize;
            this.f = newOrthogonalSize;
            this.h.layout(this.g);
        }
        s() {
            if (typeof this.j === 'number') {
                window.clearTimeout(this.j);
            }
            this.element.classList.add('animated');
            this.j = window.setTimeout(() => {
                this.j = undefined;
                this.element.classList.remove('animated');
            }, 200);
        }
        t() {
            return [...this.element.querySelectorAll('.pane-header')];
        }
        u() {
            const headers = this.t();
            const index = headers.indexOf(document.activeElement);
            if (index === -1) {
                return;
            }
            headers[Math.max(index - 1, 0)].focus();
        }
        w() {
            const headers = this.t();
            const index = headers.indexOf(document.activeElement);
            if (index === -1) {
                return;
            }
            headers[Math.min(index + 1, headers.length - 1)].focus();
        }
        dispose() {
            super.dispose();
            this.c.forEach(i => i.disposable.dispose());
        }
    }
    exports.$3R = $3R;
});
//# sourceMappingURL=paneview.js.map