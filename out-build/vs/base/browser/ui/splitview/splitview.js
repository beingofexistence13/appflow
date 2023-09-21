/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/ui/sash/sash", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/arrays", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/scrollable", "vs/base/common/types", "vs/base/browser/ui/sash/sash", "vs/css!./splitview"], function (require, exports, dom_1, event_1, sash_1, scrollableElement_1, arrays_1, color_1, event_2, lifecycle_1, numbers_1, scrollable_1, types, sash_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bR = exports.Sizing = exports.LayoutPriority = exports.Orientation = void 0;
    Object.defineProperty(exports, "Orientation", { enumerable: true, get: function () { return sash_2.Orientation; } });
    const defaultStyles = {
        separatorBorder: color_1.$Os.transparent
    };
    var LayoutPriority;
    (function (LayoutPriority) {
        LayoutPriority[LayoutPriority["Normal"] = 0] = "Normal";
        LayoutPriority[LayoutPriority["Low"] = 1] = "Low";
        LayoutPriority[LayoutPriority["High"] = 2] = "High";
    })(LayoutPriority || (exports.LayoutPriority = LayoutPriority = {}));
    class ViewItem {
        set size(size) {
            this.a = size;
        }
        get size() {
            return this.a;
        }
        get cachedVisibleSize() { return this.b; }
        get visible() {
            return typeof this.b === 'undefined';
        }
        setVisible(visible, size) {
            if (visible === this.visible) {
                return;
            }
            if (visible) {
                this.size = (0, numbers_1.$Hl)(this.b, this.viewMinimumSize, this.viewMaximumSize);
                this.b = undefined;
            }
            else {
                this.b = typeof size === 'number' ? size : this.size;
                this.size = 0;
            }
            this.c.classList.toggle('visible', visible);
            this.view.setVisible?.(visible);
        }
        get minimumSize() { return this.visible ? this.view.minimumSize : 0; }
        get viewMinimumSize() { return this.view.minimumSize; }
        get maximumSize() { return this.visible ? this.view.maximumSize : 0; }
        get viewMaximumSize() { return this.view.maximumSize; }
        get priority() { return this.view.priority; }
        get proportionalLayout() { return this.view.proportionalLayout ?? true; }
        get snap() { return !!this.view.snap; }
        set enabled(enabled) {
            this.c.style.pointerEvents = enabled ? '' : 'none';
        }
        constructor(c, view, size, d) {
            this.c = c;
            this.view = view;
            this.d = d;
            this.b = undefined;
            if (typeof size === 'number') {
                this.a = size;
                this.b = undefined;
                c.classList.add('visible');
            }
            else {
                this.a = 0;
                this.b = size.cachedVisibleSize;
            }
        }
        layout(offset, layoutContext) {
            this.layoutContainer(offset);
            this.view.layout(this.size, offset, layoutContext);
        }
        dispose() {
            this.d.dispose();
        }
    }
    class VerticalViewItem extends ViewItem {
        layoutContainer(offset) {
            this.c.style.top = `${offset}px`;
            this.c.style.height = `${this.size}px`;
        }
    }
    class HorizontalViewItem extends ViewItem {
        layoutContainer(offset) {
            this.c.style.left = `${offset}px`;
            this.c.style.width = `${this.size}px`;
        }
    }
    var State;
    (function (State) {
        State[State["Idle"] = 0] = "Idle";
        State[State["Busy"] = 1] = "Busy";
    })(State || (State = {}));
    var Sizing;
    (function (Sizing) {
        /**
         * When adding or removing views, distribute the delta space among
         * all other views.
         */
        Sizing.Distribute = { type: 'distribute' };
        /**
         * When adding or removing views, split the delta space with another
         * specific view, indexed by the provided `index`.
         */
        function Split(index) { return { type: 'split', index }; }
        Sizing.Split = Split;
        /**
         * When adding a view, use DistributeSizing when all pre-existing views are
         * distributed evenly, otherwise use SplitSizing.
         */
        function Auto(index) { return { type: 'auto', index }; }
        Sizing.Auto = Auto;
        /**
         * When adding or removing views, assume the view is invisible.
         */
        function Invisible(cachedVisibleSize) { return { type: 'invisible', cachedVisibleSize }; }
        Sizing.Invisible = Invisible;
    })(Sizing || (exports.Sizing = Sizing = {}));
    /**
     * The {@link $bR} is the UI component which implements a one dimensional
     * flex-like layout algorithm for a collection of {@link IView} instances, which
     * are essentially HTMLElement instances with the following size constraints:
     *
     * - {@link IView.minimumSize}
     * - {@link IView.maximumSize}
     * - {@link IView.priority}
     * - {@link IView.snap}
     *
     * In case the SplitView doesn't have enough size to fit all views, it will overflow
     * its content with a scrollbar.
     *
     * In between each pair of views there will be a {@link $aR} allowing the user
     * to resize the views, making sure the constraints are respected.
     *
     * An optional {@link TLayoutContext layout context type} may be used in order to
     * pass along layout contextual data from the {@link $bR.layout} method down
     * to each view's {@link IView.layout} calls.
     *
     * Features:
     * - Flex-like layout algorithm
     * - Snap support
     * - Orthogonal sash support, for corner sashes
     * - View hide/show support
     * - View swap/move support
     * - Alt key modifier behavior, macOS style
     */
    class $bR extends lifecycle_1.$kc {
        /**
         * The amount of views in this {@link $bR}.
         */
        get length() {
            return this.n.length;
        }
        /**
         * The minimum size of this {@link $bR}.
         */
        get minimumSize() {
            return this.n.reduce((r, item) => r + item.minimumSize, 0);
        }
        /**
         * The maximum size of this {@link $bR}.
         */
        get maximumSize() {
            return this.length === 0 ? Number.POSITIVE_INFINITY : this.n.reduce((r, item) => r + item.maximumSize, 0);
        }
        get orthogonalStartSash() { return this.F; }
        get orthogonalEndSash() { return this.G; }
        get startSnappingEnabled() { return this.H; }
        get endSnappingEnabled() { return this.I; }
        /**
         * A reference to a sash, perpendicular to all sashes in this {@link $bR},
         * located at the left- or top-most side of the SplitView.
         * Corner sashes will be created automatically at the intersections.
         */
        set orthogonalStartSash(sash) {
            for (const sashItem of this.sashItems) {
                sashItem.sash.orthogonalStartSash = sash;
            }
            this.F = sash;
        }
        /**
         * A reference to a sash, perpendicular to all sashes in this {@link $bR},
         * located at the right- or bottom-most side of the SplitView.
         * Corner sashes will be created automatically at the intersections.
         */
        set orthogonalEndSash(sash) {
            for (const sashItem of this.sashItems) {
                sashItem.sash.orthogonalEndSash = sash;
            }
            this.G = sash;
        }
        /**
         * The internal sashes within this {@link $bR}.
         */
        get sashes() {
            return this.sashItems.map(s => s.sash);
        }
        /**
         * Enable/disable snapping at the beginning of this {@link $bR}.
         */
        set startSnappingEnabled(startSnappingEnabled) {
            if (this.H === startSnappingEnabled) {
                return;
            }
            this.H = startSnappingEnabled;
            this.X();
        }
        /**
         * Enable/disable snapping at the end of this {@link $bR}.
         */
        set endSnappingEnabled(endSnappingEnabled) {
            if (this.I === endSnappingEnabled) {
                return;
            }
            this.I = endSnappingEnabled;
            this.X();
        }
        /**
         * Create a new {@link $bR} instance.
         */
        constructor(container, options = {}) {
            super();
            this.g = 0;
            this.j = 0;
            this.m = undefined;
            this.n = [];
            this.sashItems = []; // used in tests
            this.u = State.Idle;
            this.C = this.B(new event_2.$fd());
            this.D = this.B(new event_2.$fd());
            this.H = true;
            this.I = true;
            /**
             * Fires whenever the user resizes a {@link $aR sash}.
             */
            this.onDidSashChange = this.C.event;
            /**
             * Fires whenever the user double clicks a {@link $aR sash}.
             */
            this.onDidSashReset = this.D.event;
            this.orientation = options.orientation ?? 0 /* Orientation.VERTICAL */;
            this.w = options.inverseAltBehavior ?? false;
            this.y = options.proportionalLayout ?? true;
            this.z = options.getSashOrthogonalSize;
            this.el = document.createElement('div');
            this.el.classList.add('monaco-split-view2');
            this.el.classList.add(this.orientation === 0 /* Orientation.VERTICAL */ ? 'vertical' : 'horizontal');
            container.appendChild(this.el);
            this.a = (0, dom_1.$0O)(this.el, (0, dom_1.$)('.sash-container'));
            this.b = (0, dom_1.$)('.split-view-container');
            this.c = this.B(new scrollable_1.$Nr({
                forceIntegerValues: true,
                smoothScrollDuration: 125,
                scheduleAtNextAnimationFrame: dom_1.$vO
            }));
            this.f = this.B(new scrollableElement_1.$TP(this.b, {
                vertical: this.orientation === 0 /* Orientation.VERTICAL */ ? (options.scrollbarVisibility ?? 1 /* ScrollbarVisibility.Auto */) : 2 /* ScrollbarVisibility.Hidden */,
                horizontal: this.orientation === 1 /* Orientation.HORIZONTAL */ ? (options.scrollbarVisibility ?? 1 /* ScrollbarVisibility.Auto */) : 2 /* ScrollbarVisibility.Hidden */
            }, this.c));
            // https://github.com/microsoft/vscode/issues/157737
            const onDidScrollViewContainer = this.B(new event_1.$9P(this.b, 'scroll')).event;
            this.B(onDidScrollViewContainer(_ => {
                const position = this.f.getScrollPosition();
                const scrollLeft = Math.abs(this.b.scrollLeft - position.scrollLeft) <= 1 ? undefined : this.b.scrollLeft;
                const scrollTop = Math.abs(this.b.scrollTop - position.scrollTop) <= 1 ? undefined : this.b.scrollTop;
                if (scrollLeft !== undefined || scrollTop !== undefined) {
                    this.f.setScrollPosition({ scrollLeft, scrollTop });
                }
            }));
            this.onDidScroll = this.f.onScroll;
            this.B(this.onDidScroll(e => {
                if (e.scrollTopChanged) {
                    this.b.scrollTop = e.scrollTop;
                }
                if (e.scrollLeftChanged) {
                    this.b.scrollLeft = e.scrollLeft;
                }
            }));
            (0, dom_1.$0O)(this.el, this.f.getDomNode());
            this.style(options.styles || defaultStyles);
            // We have an existing set of view, add them now
            if (options.descriptor) {
                this.g = options.descriptor.size;
                options.descriptor.views.forEach((viewDescriptor, index) => {
                    const sizing = types.$qf(viewDescriptor.visible) || viewDescriptor.visible ? viewDescriptor.size : { type: 'invisible', cachedVisibleSize: viewDescriptor.size };
                    const view = viewDescriptor.view;
                    this.P(view, sizing, index, true);
                });
                // Initialize content size and proportions for first layout
                this.j = this.n.reduce((r, i) => r + i.size, 0);
                this.J();
            }
        }
        style(styles) {
            if (styles.separatorBorder.isTransparent()) {
                this.el.classList.remove('separator-border');
                this.el.style.removeProperty('--separator-border');
            }
            else {
                this.el.classList.add('separator-border');
                this.el.style.setProperty('--separator-border', styles.separatorBorder.toString());
            }
        }
        /**
         * Add a {@link IView view} to this {@link $bR}.
         *
         * @param view The view to add.
         * @param size Either a fixed size, or a dynamic {@link Sizing} strategy.
         * @param index The index to insert the view on.
         * @param skipLayout Whether layout should be skipped.
         */
        addView(view, size, index = this.n.length, skipLayout) {
            this.P(view, size, index, skipLayout);
        }
        /**
         * Remove a {@link IView view} from this {@link $bR}.
         *
         * @param index The index where the {@link IView view} is located.
         * @param sizing Whether to distribute other {@link IView view}'s sizes.
         */
        removeView(index, sizing) {
            if (this.u !== State.Idle) {
                throw new Error('Cant modify splitview');
            }
            this.u = State.Busy;
            if (index < 0 || index >= this.n.length) {
                throw new Error('Index out of bounds');
            }
            if (sizing?.type === 'auto') {
                if (this.ab()) {
                    sizing = { type: 'distribute' };
                }
                else {
                    sizing = { type: 'split', index: sizing.index };
                }
            }
            // Save referene view, in case of `split` sizing
            const referenceViewItem = sizing?.type === 'split' ? this.n[sizing.index] : undefined;
            // Remove view
            const viewItemToRemove = this.n.splice(index, 1)[0];
            // Resize reference view, in case of `split` sizing
            if (referenceViewItem) {
                referenceViewItem.size += viewItemToRemove.size;
            }
            // Remove sash
            if (this.n.length >= 1) {
                const sashIndex = Math.max(index - 1, 0);
                const sashItem = this.sashItems.splice(sashIndex, 1)[0];
                sashItem.disposable.dispose();
            }
            this.Q();
            this.u = State.Idle;
            if (sizing?.type === 'distribute') {
                this.distributeViewSizes();
            }
            const result = viewItemToRemove.view;
            viewItemToRemove.dispose();
            return result;
        }
        removeAllViews() {
            if (this.u !== State.Idle) {
                throw new Error('Cant modify splitview');
            }
            this.u = State.Busy;
            const viewItems = this.n.splice(0, this.n.length);
            for (const viewItem of viewItems) {
                viewItem.dispose();
            }
            const sashItems = this.sashItems.splice(0, this.sashItems.length);
            for (const sashItem of sashItems) {
                sashItem.disposable.dispose();
            }
            this.Q();
            this.u = State.Idle;
            return viewItems.map(i => i.view);
        }
        /**
         * Move a {@link IView view} to a different index.
         *
         * @param from The source index.
         * @param to The target index.
         */
        moveView(from, to) {
            if (this.u !== State.Idle) {
                throw new Error('Cant modify splitview');
            }
            const cachedVisibleSize = this.getViewCachedVisibleSize(from);
            const sizing = typeof cachedVisibleSize === 'undefined' ? this.getViewSize(from) : Sizing.Invisible(cachedVisibleSize);
            const view = this.removeView(from);
            this.addView(view, sizing, to);
        }
        /**
         * Swap two {@link IView views}.
         *
         * @param from The source index.
         * @param to The target index.
         */
        swapViews(from, to) {
            if (this.u !== State.Idle) {
                throw new Error('Cant modify splitview');
            }
            if (from > to) {
                return this.swapViews(to, from);
            }
            const fromSize = this.getViewSize(from);
            const toSize = this.getViewSize(to);
            const toView = this.removeView(to);
            const fromView = this.removeView(from);
            this.addView(toView, fromSize, from);
            this.addView(fromView, toSize, to);
        }
        /**
         * Returns whether the {@link IView view} is visible.
         *
         * @param index The {@link IView view} index.
         */
        isViewVisible(index) {
            if (index < 0 || index >= this.n.length) {
                throw new Error('Index out of bounds');
            }
            const viewItem = this.n[index];
            return viewItem.visible;
        }
        /**
         * Set a {@link IView view}'s visibility.
         *
         * @param index The {@link IView view} index.
         * @param visible Whether the {@link IView view} should be visible.
         */
        setViewVisible(index, visible) {
            if (index < 0 || index >= this.n.length) {
                throw new Error('Index out of bounds');
            }
            const viewItem = this.n[index];
            viewItem.setVisible(visible);
            this.S(index);
            this.U();
            this.J();
        }
        /**
         * Returns the {@link IView view}'s size previously to being hidden.
         *
         * @param index The {@link IView view} index.
         */
        getViewCachedVisibleSize(index) {
            if (index < 0 || index >= this.n.length) {
                throw new Error('Index out of bounds');
            }
            const viewItem = this.n[index];
            return viewItem.cachedVisibleSize;
        }
        /**
         * Layout the {@link $bR}.
         *
         * @param size The entire size of the {@link $bR}.
         * @param layoutContext An optional layout context to pass along to {@link IView views}.
         */
        layout(size, layoutContext) {
            const previousSize = Math.max(this.g, this.j);
            this.g = size;
            this.h = layoutContext;
            if (!this.m) {
                const indexes = (0, arrays_1.$Qb)(this.n.length);
                const lowPriorityIndexes = indexes.filter(i => this.n[i].priority === 1 /* LayoutPriority.Low */);
                const highPriorityIndexes = indexes.filter(i => this.n[i].priority === 2 /* LayoutPriority.High */);
                this.R(this.n.length - 1, size - previousSize, undefined, lowPriorityIndexes, highPriorityIndexes);
            }
            else {
                let total = 0;
                for (let i = 0; i < this.n.length; i++) {
                    const item = this.n[i];
                    const proportion = this.m[i];
                    if (typeof proportion === 'number') {
                        total += proportion;
                    }
                    else {
                        size -= item.size;
                    }
                }
                for (let i = 0; i < this.n.length; i++) {
                    const item = this.n[i];
                    const proportion = this.m[i];
                    if (typeof proportion === 'number') {
                        item.size = (0, numbers_1.$Hl)(Math.round(proportion * size / total), item.minimumSize, item.maximumSize);
                    }
                }
            }
            this.S();
            this.U();
        }
        J() {
            if (this.y && this.j > 0) {
                this.m = this.n.map(i => i.proportionalLayout ? i.size / this.j : undefined);
            }
        }
        L({ sash, start, alt }) {
            for (const item of this.n) {
                item.enabled = false;
            }
            const index = this.sashItems.findIndex(item => item.sash === sash);
            // This way, we can press Alt while we resize a sash, macOS style!
            const disposable = (0, lifecycle_1.$hc)((0, dom_1.$nO)(document.body, 'keydown', e => resetSashDragState(this.t.current, e.altKey)), (0, dom_1.$nO)(document.body, 'keyup', () => resetSashDragState(this.t.current, false)));
            const resetSashDragState = (start, alt) => {
                const sizes = this.n.map(i => i.size);
                let minDelta = Number.NEGATIVE_INFINITY;
                let maxDelta = Number.POSITIVE_INFINITY;
                if (this.w) {
                    alt = !alt;
                }
                if (alt) {
                    // When we're using the last sash with Alt, we're resizing
                    // the view to the left/up, instead of right/down as usual
                    // Thus, we must do the inverse of the usual
                    const isLastSash = index === this.sashItems.length - 1;
                    if (isLastSash) {
                        const viewItem = this.n[index];
                        minDelta = (viewItem.minimumSize - viewItem.size) / 2;
                        maxDelta = (viewItem.maximumSize - viewItem.size) / 2;
                    }
                    else {
                        const viewItem = this.n[index + 1];
                        minDelta = (viewItem.size - viewItem.maximumSize) / 2;
                        maxDelta = (viewItem.size - viewItem.minimumSize) / 2;
                    }
                }
                let snapBefore;
                let snapAfter;
                if (!alt) {
                    const upIndexes = (0, arrays_1.$Qb)(index, -1);
                    const downIndexes = (0, arrays_1.$Qb)(index + 1, this.n.length);
                    const minDeltaUp = upIndexes.reduce((r, i) => r + (this.n[i].minimumSize - sizes[i]), 0);
                    const maxDeltaUp = upIndexes.reduce((r, i) => r + (this.n[i].viewMaximumSize - sizes[i]), 0);
                    const maxDeltaDown = downIndexes.length === 0 ? Number.POSITIVE_INFINITY : downIndexes.reduce((r, i) => r + (sizes[i] - this.n[i].minimumSize), 0);
                    const minDeltaDown = downIndexes.length === 0 ? Number.NEGATIVE_INFINITY : downIndexes.reduce((r, i) => r + (sizes[i] - this.n[i].viewMaximumSize), 0);
                    const minDelta = Math.max(minDeltaUp, minDeltaDown);
                    const maxDelta = Math.min(maxDeltaDown, maxDeltaUp);
                    const snapBeforeIndex = this.Z(upIndexes);
                    const snapAfterIndex = this.Z(downIndexes);
                    if (typeof snapBeforeIndex === 'number') {
                        const viewItem = this.n[snapBeforeIndex];
                        const halfSize = Math.floor(viewItem.viewMinimumSize / 2);
                        snapBefore = {
                            index: snapBeforeIndex,
                            limitDelta: viewItem.visible ? minDelta - halfSize : minDelta + halfSize,
                            size: viewItem.size
                        };
                    }
                    if (typeof snapAfterIndex === 'number') {
                        const viewItem = this.n[snapAfterIndex];
                        const halfSize = Math.floor(viewItem.viewMinimumSize / 2);
                        snapAfter = {
                            index: snapAfterIndex,
                            limitDelta: viewItem.visible ? maxDelta + halfSize : maxDelta - halfSize,
                            size: viewItem.size
                        };
                    }
                }
                this.t = { start, current: start, index, sizes, minDelta, maxDelta, alt, snapBefore, snapAfter, disposable };
            };
            resetSashDragState(start, alt);
        }
        M({ current }) {
            const { index, start, sizes, alt, minDelta, maxDelta, snapBefore, snapAfter } = this.t;
            this.t.current = current;
            const delta = current - start;
            const newDelta = this.R(index, delta, sizes, undefined, undefined, minDelta, maxDelta, snapBefore, snapAfter);
            if (alt) {
                const isLastSash = index === this.sashItems.length - 1;
                const newSizes = this.n.map(i => i.size);
                const viewItemIndex = isLastSash ? index : index + 1;
                const viewItem = this.n[viewItemIndex];
                const newMinDelta = viewItem.size - viewItem.maximumSize;
                const newMaxDelta = viewItem.size - viewItem.minimumSize;
                const resizeIndex = isLastSash ? index - 1 : index + 1;
                this.R(resizeIndex, -newDelta, newSizes, undefined, undefined, newMinDelta, newMaxDelta);
            }
            this.S();
            this.U();
        }
        N(index) {
            this.C.fire(index);
            this.t.disposable.dispose();
            this.J();
            for (const item of this.n) {
                item.enabled = true;
            }
        }
        O(item, size) {
            const index = this.n.indexOf(item);
            if (index < 0 || index >= this.n.length) {
                return;
            }
            size = typeof size === 'number' ? size : item.size;
            size = (0, numbers_1.$Hl)(size, item.minimumSize, item.maximumSize);
            if (this.w && index > 0) {
                // In this case, we want the view to grow or shrink both sides equally
                // so we just resize the "left" side by half and let `resize` do the clamping magic
                this.R(index - 1, Math.floor((item.size - size) / 2));
                this.S();
                this.U();
            }
            else {
                item.size = size;
                this.Q([index], undefined);
            }
        }
        /**
         * Resize a {@link IView view} within the {@link $bR}.
         *
         * @param index The {@link IView view} index.
         * @param size The {@link IView view} size.
         */
        resizeView(index, size) {
            if (this.u !== State.Idle) {
                throw new Error('Cant modify splitview');
            }
            this.u = State.Busy;
            if (index < 0 || index >= this.n.length) {
                return;
            }
            const indexes = (0, arrays_1.$Qb)(this.n.length).filter(i => i !== index);
            const lowPriorityIndexes = [...indexes.filter(i => this.n[i].priority === 1 /* LayoutPriority.Low */), index];
            const highPriorityIndexes = indexes.filter(i => this.n[i].priority === 2 /* LayoutPriority.High */);
            const item = this.n[index];
            size = Math.round(size);
            size = (0, numbers_1.$Hl)(size, item.minimumSize, Math.min(item.maximumSize, this.g));
            item.size = size;
            this.Q(lowPriorityIndexes, highPriorityIndexes);
            this.u = State.Idle;
        }
        /**
         * Returns whether all other {@link IView views} are at their minimum size.
         */
        isViewSizeMaximized(index) {
            if (index < 0 || index >= this.n.length) {
                return false;
            }
            for (const item of this.n) {
                if (item !== this.n[index] && item.size > item.minimumSize) {
                    return false;
                }
            }
            return true;
        }
        /**
         * Distribute the entire {@link $bR} size among all {@link IView views}.
         */
        distributeViewSizes() {
            const flexibleViewItems = [];
            let flexibleSize = 0;
            for (const item of this.n) {
                if (item.maximumSize - item.minimumSize > 0) {
                    flexibleViewItems.push(item);
                    flexibleSize += item.size;
                }
            }
            const size = Math.floor(flexibleSize / flexibleViewItems.length);
            for (const item of flexibleViewItems) {
                item.size = (0, numbers_1.$Hl)(size, item.minimumSize, item.maximumSize);
            }
            const indexes = (0, arrays_1.$Qb)(this.n.length);
            const lowPriorityIndexes = indexes.filter(i => this.n[i].priority === 1 /* LayoutPriority.Low */);
            const highPriorityIndexes = indexes.filter(i => this.n[i].priority === 2 /* LayoutPriority.High */);
            this.Q(lowPriorityIndexes, highPriorityIndexes);
        }
        /**
         * Returns the size of a {@link IView view}.
         */
        getViewSize(index) {
            if (index < 0 || index >= this.n.length) {
                return -1;
            }
            return this.n[index].size;
        }
        P(view, size, index = this.n.length, skipLayout) {
            if (this.u !== State.Idle) {
                throw new Error('Cant modify splitview');
            }
            this.u = State.Busy;
            // Add view
            const container = (0, dom_1.$)('.split-view-view');
            if (index === this.n.length) {
                this.b.appendChild(container);
            }
            else {
                this.b.insertBefore(container, this.b.children.item(index));
            }
            const onChangeDisposable = view.onDidChange(size => this.O(item, size));
            const containerDisposable = (0, lifecycle_1.$ic)(() => this.b.removeChild(container));
            const disposable = (0, lifecycle_1.$hc)(onChangeDisposable, containerDisposable);
            let viewSize;
            if (typeof size === 'number') {
                viewSize = size;
            }
            else {
                if (size.type === 'auto') {
                    if (this.ab()) {
                        size = { type: 'distribute' };
                    }
                    else {
                        size = { type: 'split', index: size.index };
                    }
                }
                if (size.type === 'split') {
                    viewSize = this.getViewSize(size.index) / 2;
                }
                else if (size.type === 'invisible') {
                    viewSize = { cachedVisibleSize: size.cachedVisibleSize };
                }
                else {
                    viewSize = view.minimumSize;
                }
            }
            const item = this.orientation === 0 /* Orientation.VERTICAL */
                ? new VerticalViewItem(container, view, viewSize, disposable)
                : new HorizontalViewItem(container, view, viewSize, disposable);
            this.n.splice(index, 0, item);
            // Add sash
            if (this.n.length > 1) {
                const opts = { orthogonalStartSash: this.orthogonalStartSash, orthogonalEndSash: this.orthogonalEndSash };
                const sash = this.orientation === 0 /* Orientation.VERTICAL */
                    ? new sash_1.$aR(this.a, { getHorizontalSashTop: s => this.Y(s), getHorizontalSashWidth: this.z }, { ...opts, orientation: 1 /* Orientation.HORIZONTAL */ })
                    : new sash_1.$aR(this.a, { getVerticalSashLeft: s => this.Y(s), getVerticalSashHeight: this.z }, { ...opts, orientation: 0 /* Orientation.VERTICAL */ });
                const sashEventMapper = this.orientation === 0 /* Orientation.VERTICAL */
                    ? (e) => ({ sash, start: e.startY, current: e.currentY, alt: e.altKey })
                    : (e) => ({ sash, start: e.startX, current: e.currentX, alt: e.altKey });
                const onStart = event_2.Event.map(sash.onDidStart, sashEventMapper);
                const onStartDisposable = onStart(this.L, this);
                const onChange = event_2.Event.map(sash.onDidChange, sashEventMapper);
                const onChangeDisposable = onChange(this.M, this);
                const onEnd = event_2.Event.map(sash.onDidEnd, () => this.sashItems.findIndex(item => item.sash === sash));
                const onEndDisposable = onEnd(this.N, this);
                const onDidResetDisposable = sash.onDidReset(() => {
                    const index = this.sashItems.findIndex(item => item.sash === sash);
                    const upIndexes = (0, arrays_1.$Qb)(index, -1);
                    const downIndexes = (0, arrays_1.$Qb)(index + 1, this.n.length);
                    const snapBeforeIndex = this.Z(upIndexes);
                    const snapAfterIndex = this.Z(downIndexes);
                    if (typeof snapBeforeIndex === 'number' && !this.n[snapBeforeIndex].visible) {
                        return;
                    }
                    if (typeof snapAfterIndex === 'number' && !this.n[snapAfterIndex].visible) {
                        return;
                    }
                    this.D.fire(index);
                });
                const disposable = (0, lifecycle_1.$hc)(onStartDisposable, onChangeDisposable, onEndDisposable, onDidResetDisposable, sash);
                const sashItem = { sash, disposable };
                this.sashItems.splice(index - 1, 0, sashItem);
            }
            container.appendChild(view.element);
            let highPriorityIndexes;
            if (typeof size !== 'number' && size.type === 'split') {
                highPriorityIndexes = [size.index];
            }
            if (!skipLayout) {
                this.Q([index], highPriorityIndexes);
            }
            this.u = State.Idle;
            if (!skipLayout && typeof size !== 'number' && size.type === 'distribute') {
                this.distributeViewSizes();
            }
        }
        Q(lowPriorityIndexes, highPriorityIndexes) {
            const contentSize = this.n.reduce((r, i) => r + i.size, 0);
            this.R(this.n.length - 1, this.g - contentSize, undefined, lowPriorityIndexes, highPriorityIndexes);
            this.S();
            this.U();
            this.J();
        }
        R(index, delta, sizes = this.n.map(i => i.size), lowPriorityIndexes, highPriorityIndexes, overloadMinDelta = Number.NEGATIVE_INFINITY, overloadMaxDelta = Number.POSITIVE_INFINITY, snapBefore, snapAfter) {
            if (index < 0 || index >= this.n.length) {
                return 0;
            }
            const upIndexes = (0, arrays_1.$Qb)(index, -1);
            const downIndexes = (0, arrays_1.$Qb)(index + 1, this.n.length);
            if (highPriorityIndexes) {
                for (const index of highPriorityIndexes) {
                    (0, arrays_1.$Wb)(upIndexes, index);
                    (0, arrays_1.$Wb)(downIndexes, index);
                }
            }
            if (lowPriorityIndexes) {
                for (const index of lowPriorityIndexes) {
                    (0, arrays_1.$Xb)(upIndexes, index);
                    (0, arrays_1.$Xb)(downIndexes, index);
                }
            }
            const upItems = upIndexes.map(i => this.n[i]);
            const upSizes = upIndexes.map(i => sizes[i]);
            const downItems = downIndexes.map(i => this.n[i]);
            const downSizes = downIndexes.map(i => sizes[i]);
            const minDeltaUp = upIndexes.reduce((r, i) => r + (this.n[i].minimumSize - sizes[i]), 0);
            const maxDeltaUp = upIndexes.reduce((r, i) => r + (this.n[i].maximumSize - sizes[i]), 0);
            const maxDeltaDown = downIndexes.length === 0 ? Number.POSITIVE_INFINITY : downIndexes.reduce((r, i) => r + (sizes[i] - this.n[i].minimumSize), 0);
            const minDeltaDown = downIndexes.length === 0 ? Number.NEGATIVE_INFINITY : downIndexes.reduce((r, i) => r + (sizes[i] - this.n[i].maximumSize), 0);
            const minDelta = Math.max(minDeltaUp, minDeltaDown, overloadMinDelta);
            const maxDelta = Math.min(maxDeltaDown, maxDeltaUp, overloadMaxDelta);
            let snapped = false;
            if (snapBefore) {
                const snapView = this.n[snapBefore.index];
                const visible = delta >= snapBefore.limitDelta;
                snapped = visible !== snapView.visible;
                snapView.setVisible(visible, snapBefore.size);
            }
            if (!snapped && snapAfter) {
                const snapView = this.n[snapAfter.index];
                const visible = delta < snapAfter.limitDelta;
                snapped = visible !== snapView.visible;
                snapView.setVisible(visible, snapAfter.size);
            }
            if (snapped) {
                return this.R(index, delta, sizes, lowPriorityIndexes, highPriorityIndexes, overloadMinDelta, overloadMaxDelta);
            }
            delta = (0, numbers_1.$Hl)(delta, minDelta, maxDelta);
            for (let i = 0, deltaUp = delta; i < upItems.length; i++) {
                const item = upItems[i];
                const size = (0, numbers_1.$Hl)(upSizes[i] + deltaUp, item.minimumSize, item.maximumSize);
                const viewDelta = size - upSizes[i];
                deltaUp -= viewDelta;
                item.size = size;
            }
            for (let i = 0, deltaDown = delta; i < downItems.length; i++) {
                const item = downItems[i];
                const size = (0, numbers_1.$Hl)(downSizes[i] - deltaDown, item.minimumSize, item.maximumSize);
                const viewDelta = size - downSizes[i];
                deltaDown += viewDelta;
                item.size = size;
            }
            return delta;
        }
        S(lowPriorityIndex) {
            const contentSize = this.n.reduce((r, i) => r + i.size, 0);
            let emptyDelta = this.g - contentSize;
            const indexes = (0, arrays_1.$Qb)(this.n.length - 1, -1);
            const lowPriorityIndexes = indexes.filter(i => this.n[i].priority === 1 /* LayoutPriority.Low */);
            const highPriorityIndexes = indexes.filter(i => this.n[i].priority === 2 /* LayoutPriority.High */);
            for (const index of highPriorityIndexes) {
                (0, arrays_1.$Wb)(indexes, index);
            }
            for (const index of lowPriorityIndexes) {
                (0, arrays_1.$Xb)(indexes, index);
            }
            if (typeof lowPriorityIndex === 'number') {
                (0, arrays_1.$Xb)(indexes, lowPriorityIndex);
            }
            for (let i = 0; emptyDelta !== 0 && i < indexes.length; i++) {
                const item = this.n[indexes[i]];
                const size = (0, numbers_1.$Hl)(item.size + emptyDelta, item.minimumSize, item.maximumSize);
                const viewDelta = size - item.size;
                emptyDelta -= viewDelta;
                item.size = size;
            }
        }
        U() {
            // Save new content size
            this.j = this.n.reduce((r, i) => r + i.size, 0);
            // Layout views
            let offset = 0;
            for (const viewItem of this.n) {
                viewItem.layout(offset, this.h);
                offset += viewItem.size;
            }
            // Layout sashes
            this.sashItems.forEach(item => item.sash.layout());
            this.X();
            this.W();
        }
        W() {
            if (this.orientation === 0 /* Orientation.VERTICAL */) {
                this.f.setScrollDimensions({
                    height: this.g,
                    scrollHeight: this.j
                });
            }
            else {
                this.f.setScrollDimensions({
                    width: this.g,
                    scrollWidth: this.j
                });
            }
        }
        X() {
            let previous = false;
            const collapsesDown = this.n.map(i => previous = (i.size - i.minimumSize > 0) || previous);
            previous = false;
            const expandsDown = this.n.map(i => previous = (i.maximumSize - i.size > 0) || previous);
            const reverseViews = [...this.n].reverse();
            previous = false;
            const collapsesUp = reverseViews.map(i => previous = (i.size - i.minimumSize > 0) || previous).reverse();
            previous = false;
            const expandsUp = reverseViews.map(i => previous = (i.maximumSize - i.size > 0) || previous).reverse();
            let position = 0;
            for (let index = 0; index < this.sashItems.length; index++) {
                const { sash } = this.sashItems[index];
                const viewItem = this.n[index];
                position += viewItem.size;
                const min = !(collapsesDown[index] && expandsUp[index + 1]);
                const max = !(expandsDown[index] && collapsesUp[index + 1]);
                if (min && max) {
                    const upIndexes = (0, arrays_1.$Qb)(index, -1);
                    const downIndexes = (0, arrays_1.$Qb)(index + 1, this.n.length);
                    const snapBeforeIndex = this.Z(upIndexes);
                    const snapAfterIndex = this.Z(downIndexes);
                    const snappedBefore = typeof snapBeforeIndex === 'number' && !this.n[snapBeforeIndex].visible;
                    const snappedAfter = typeof snapAfterIndex === 'number' && !this.n[snapAfterIndex].visible;
                    if (snappedBefore && collapsesUp[index] && (position > 0 || this.startSnappingEnabled)) {
                        sash.state = 1 /* SashState.AtMinimum */;
                    }
                    else if (snappedAfter && collapsesDown[index] && (position < this.j || this.endSnappingEnabled)) {
                        sash.state = 2 /* SashState.AtMaximum */;
                    }
                    else {
                        sash.state = 0 /* SashState.Disabled */;
                    }
                }
                else if (min && !max) {
                    sash.state = 1 /* SashState.AtMinimum */;
                }
                else if (!min && max) {
                    sash.state = 2 /* SashState.AtMaximum */;
                }
                else {
                    sash.state = 3 /* SashState.Enabled */;
                }
            }
        }
        Y(sash) {
            let position = 0;
            for (let i = 0; i < this.sashItems.length; i++) {
                position += this.n[i].size;
                if (this.sashItems[i].sash === sash) {
                    return position;
                }
            }
            return 0;
        }
        Z(indexes) {
            // visible views first
            for (const index of indexes) {
                const viewItem = this.n[index];
                if (!viewItem.visible) {
                    continue;
                }
                if (viewItem.snap) {
                    return index;
                }
            }
            // then, hidden views
            for (const index of indexes) {
                const viewItem = this.n[index];
                if (viewItem.visible && viewItem.maximumSize - viewItem.minimumSize > 0) {
                    return undefined;
                }
                if (!viewItem.visible && viewItem.snap) {
                    return index;
                }
            }
            return undefined;
        }
        ab() {
            let min = undefined, max = undefined;
            for (const view of this.n) {
                min = min === undefined ? view.size : Math.min(min, view.size);
                max = max === undefined ? view.size : Math.max(max, view.size);
                if (max - min > 2) {
                    return false;
                }
            }
            return true;
        }
        dispose() {
            this.t?.disposable.dispose();
            (0, lifecycle_1.$fc)(this.n);
            this.n = [];
            this.sashItems.forEach(i => i.disposable.dispose());
            this.sashItems = [];
            super.dispose();
        }
    }
    exports.$bR = $bR;
});
//# sourceMappingURL=splitview.js.map