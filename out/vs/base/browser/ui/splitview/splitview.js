/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/ui/sash/sash", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/arrays", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/scrollable", "vs/base/common/types", "vs/base/browser/ui/sash/sash", "vs/css!./splitview"], function (require, exports, dom_1, event_1, sash_1, scrollableElement_1, arrays_1, color_1, event_2, lifecycle_1, numbers_1, scrollable_1, types, sash_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SplitView = exports.Sizing = exports.LayoutPriority = exports.Orientation = void 0;
    Object.defineProperty(exports, "Orientation", { enumerable: true, get: function () { return sash_2.Orientation; } });
    const defaultStyles = {
        separatorBorder: color_1.Color.transparent
    };
    var LayoutPriority;
    (function (LayoutPriority) {
        LayoutPriority[LayoutPriority["Normal"] = 0] = "Normal";
        LayoutPriority[LayoutPriority["Low"] = 1] = "Low";
        LayoutPriority[LayoutPriority["High"] = 2] = "High";
    })(LayoutPriority || (exports.LayoutPriority = LayoutPriority = {}));
    class ViewItem {
        set size(size) {
            this._size = size;
        }
        get size() {
            return this._size;
        }
        get cachedVisibleSize() { return this._cachedVisibleSize; }
        get visible() {
            return typeof this._cachedVisibleSize === 'undefined';
        }
        setVisible(visible, size) {
            if (visible === this.visible) {
                return;
            }
            if (visible) {
                this.size = (0, numbers_1.clamp)(this._cachedVisibleSize, this.viewMinimumSize, this.viewMaximumSize);
                this._cachedVisibleSize = undefined;
            }
            else {
                this._cachedVisibleSize = typeof size === 'number' ? size : this.size;
                this.size = 0;
            }
            this.container.classList.toggle('visible', visible);
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
            this.container.style.pointerEvents = enabled ? '' : 'none';
        }
        constructor(container, view, size, disposable) {
            this.container = container;
            this.view = view;
            this.disposable = disposable;
            this._cachedVisibleSize = undefined;
            if (typeof size === 'number') {
                this._size = size;
                this._cachedVisibleSize = undefined;
                container.classList.add('visible');
            }
            else {
                this._size = 0;
                this._cachedVisibleSize = size.cachedVisibleSize;
            }
        }
        layout(offset, layoutContext) {
            this.layoutContainer(offset);
            this.view.layout(this.size, offset, layoutContext);
        }
        dispose() {
            this.disposable.dispose();
        }
    }
    class VerticalViewItem extends ViewItem {
        layoutContainer(offset) {
            this.container.style.top = `${offset}px`;
            this.container.style.height = `${this.size}px`;
        }
    }
    class HorizontalViewItem extends ViewItem {
        layoutContainer(offset) {
            this.container.style.left = `${offset}px`;
            this.container.style.width = `${this.size}px`;
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
     * The {@link SplitView} is the UI component which implements a one dimensional
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
     * In between each pair of views there will be a {@link Sash} allowing the user
     * to resize the views, making sure the constraints are respected.
     *
     * An optional {@link TLayoutContext layout context type} may be used in order to
     * pass along layout contextual data from the {@link SplitView.layout} method down
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
    class SplitView extends lifecycle_1.Disposable {
        /**
         * The amount of views in this {@link SplitView}.
         */
        get length() {
            return this.viewItems.length;
        }
        /**
         * The minimum size of this {@link SplitView}.
         */
        get minimumSize() {
            return this.viewItems.reduce((r, item) => r + item.minimumSize, 0);
        }
        /**
         * The maximum size of this {@link SplitView}.
         */
        get maximumSize() {
            return this.length === 0 ? Number.POSITIVE_INFINITY : this.viewItems.reduce((r, item) => r + item.maximumSize, 0);
        }
        get orthogonalStartSash() { return this._orthogonalStartSash; }
        get orthogonalEndSash() { return this._orthogonalEndSash; }
        get startSnappingEnabled() { return this._startSnappingEnabled; }
        get endSnappingEnabled() { return this._endSnappingEnabled; }
        /**
         * A reference to a sash, perpendicular to all sashes in this {@link SplitView},
         * located at the left- or top-most side of the SplitView.
         * Corner sashes will be created automatically at the intersections.
         */
        set orthogonalStartSash(sash) {
            for (const sashItem of this.sashItems) {
                sashItem.sash.orthogonalStartSash = sash;
            }
            this._orthogonalStartSash = sash;
        }
        /**
         * A reference to a sash, perpendicular to all sashes in this {@link SplitView},
         * located at the right- or bottom-most side of the SplitView.
         * Corner sashes will be created automatically at the intersections.
         */
        set orthogonalEndSash(sash) {
            for (const sashItem of this.sashItems) {
                sashItem.sash.orthogonalEndSash = sash;
            }
            this._orthogonalEndSash = sash;
        }
        /**
         * The internal sashes within this {@link SplitView}.
         */
        get sashes() {
            return this.sashItems.map(s => s.sash);
        }
        /**
         * Enable/disable snapping at the beginning of this {@link SplitView}.
         */
        set startSnappingEnabled(startSnappingEnabled) {
            if (this._startSnappingEnabled === startSnappingEnabled) {
                return;
            }
            this._startSnappingEnabled = startSnappingEnabled;
            this.updateSashEnablement();
        }
        /**
         * Enable/disable snapping at the end of this {@link SplitView}.
         */
        set endSnappingEnabled(endSnappingEnabled) {
            if (this._endSnappingEnabled === endSnappingEnabled) {
                return;
            }
            this._endSnappingEnabled = endSnappingEnabled;
            this.updateSashEnablement();
        }
        /**
         * Create a new {@link SplitView} instance.
         */
        constructor(container, options = {}) {
            super();
            this.size = 0;
            this.contentSize = 0;
            this.proportions = undefined;
            this.viewItems = [];
            this.sashItems = []; // used in tests
            this.state = State.Idle;
            this._onDidSashChange = this._register(new event_2.Emitter());
            this._onDidSashReset = this._register(new event_2.Emitter());
            this._startSnappingEnabled = true;
            this._endSnappingEnabled = true;
            /**
             * Fires whenever the user resizes a {@link Sash sash}.
             */
            this.onDidSashChange = this._onDidSashChange.event;
            /**
             * Fires whenever the user double clicks a {@link Sash sash}.
             */
            this.onDidSashReset = this._onDidSashReset.event;
            this.orientation = options.orientation ?? 0 /* Orientation.VERTICAL */;
            this.inverseAltBehavior = options.inverseAltBehavior ?? false;
            this.proportionalLayout = options.proportionalLayout ?? true;
            this.getSashOrthogonalSize = options.getSashOrthogonalSize;
            this.el = document.createElement('div');
            this.el.classList.add('monaco-split-view2');
            this.el.classList.add(this.orientation === 0 /* Orientation.VERTICAL */ ? 'vertical' : 'horizontal');
            container.appendChild(this.el);
            this.sashContainer = (0, dom_1.append)(this.el, (0, dom_1.$)('.sash-container'));
            this.viewContainer = (0, dom_1.$)('.split-view-container');
            this.scrollable = this._register(new scrollable_1.Scrollable({
                forceIntegerValues: true,
                smoothScrollDuration: 125,
                scheduleAtNextAnimationFrame: dom_1.scheduleAtNextAnimationFrame
            }));
            this.scrollableElement = this._register(new scrollableElement_1.SmoothScrollableElement(this.viewContainer, {
                vertical: this.orientation === 0 /* Orientation.VERTICAL */ ? (options.scrollbarVisibility ?? 1 /* ScrollbarVisibility.Auto */) : 2 /* ScrollbarVisibility.Hidden */,
                horizontal: this.orientation === 1 /* Orientation.HORIZONTAL */ ? (options.scrollbarVisibility ?? 1 /* ScrollbarVisibility.Auto */) : 2 /* ScrollbarVisibility.Hidden */
            }, this.scrollable));
            // https://github.com/microsoft/vscode/issues/157737
            const onDidScrollViewContainer = this._register(new event_1.DomEmitter(this.viewContainer, 'scroll')).event;
            this._register(onDidScrollViewContainer(_ => {
                const position = this.scrollableElement.getScrollPosition();
                const scrollLeft = Math.abs(this.viewContainer.scrollLeft - position.scrollLeft) <= 1 ? undefined : this.viewContainer.scrollLeft;
                const scrollTop = Math.abs(this.viewContainer.scrollTop - position.scrollTop) <= 1 ? undefined : this.viewContainer.scrollTop;
                if (scrollLeft !== undefined || scrollTop !== undefined) {
                    this.scrollableElement.setScrollPosition({ scrollLeft, scrollTop });
                }
            }));
            this.onDidScroll = this.scrollableElement.onScroll;
            this._register(this.onDidScroll(e => {
                if (e.scrollTopChanged) {
                    this.viewContainer.scrollTop = e.scrollTop;
                }
                if (e.scrollLeftChanged) {
                    this.viewContainer.scrollLeft = e.scrollLeft;
                }
            }));
            (0, dom_1.append)(this.el, this.scrollableElement.getDomNode());
            this.style(options.styles || defaultStyles);
            // We have an existing set of view, add them now
            if (options.descriptor) {
                this.size = options.descriptor.size;
                options.descriptor.views.forEach((viewDescriptor, index) => {
                    const sizing = types.isUndefined(viewDescriptor.visible) || viewDescriptor.visible ? viewDescriptor.size : { type: 'invisible', cachedVisibleSize: viewDescriptor.size };
                    const view = viewDescriptor.view;
                    this.doAddView(view, sizing, index, true);
                });
                // Initialize content size and proportions for first layout
                this.contentSize = this.viewItems.reduce((r, i) => r + i.size, 0);
                this.saveProportions();
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
         * Add a {@link IView view} to this {@link SplitView}.
         *
         * @param view The view to add.
         * @param size Either a fixed size, or a dynamic {@link Sizing} strategy.
         * @param index The index to insert the view on.
         * @param skipLayout Whether layout should be skipped.
         */
        addView(view, size, index = this.viewItems.length, skipLayout) {
            this.doAddView(view, size, index, skipLayout);
        }
        /**
         * Remove a {@link IView view} from this {@link SplitView}.
         *
         * @param index The index where the {@link IView view} is located.
         * @param sizing Whether to distribute other {@link IView view}'s sizes.
         */
        removeView(index, sizing) {
            if (this.state !== State.Idle) {
                throw new Error('Cant modify splitview');
            }
            this.state = State.Busy;
            if (index < 0 || index >= this.viewItems.length) {
                throw new Error('Index out of bounds');
            }
            if (sizing?.type === 'auto') {
                if (this.areViewsDistributed()) {
                    sizing = { type: 'distribute' };
                }
                else {
                    sizing = { type: 'split', index: sizing.index };
                }
            }
            // Save referene view, in case of `split` sizing
            const referenceViewItem = sizing?.type === 'split' ? this.viewItems[sizing.index] : undefined;
            // Remove view
            const viewItemToRemove = this.viewItems.splice(index, 1)[0];
            // Resize reference view, in case of `split` sizing
            if (referenceViewItem) {
                referenceViewItem.size += viewItemToRemove.size;
            }
            // Remove sash
            if (this.viewItems.length >= 1) {
                const sashIndex = Math.max(index - 1, 0);
                const sashItem = this.sashItems.splice(sashIndex, 1)[0];
                sashItem.disposable.dispose();
            }
            this.relayout();
            this.state = State.Idle;
            if (sizing?.type === 'distribute') {
                this.distributeViewSizes();
            }
            const result = viewItemToRemove.view;
            viewItemToRemove.dispose();
            return result;
        }
        removeAllViews() {
            if (this.state !== State.Idle) {
                throw new Error('Cant modify splitview');
            }
            this.state = State.Busy;
            const viewItems = this.viewItems.splice(0, this.viewItems.length);
            for (const viewItem of viewItems) {
                viewItem.dispose();
            }
            const sashItems = this.sashItems.splice(0, this.sashItems.length);
            for (const sashItem of sashItems) {
                sashItem.disposable.dispose();
            }
            this.relayout();
            this.state = State.Idle;
            return viewItems.map(i => i.view);
        }
        /**
         * Move a {@link IView view} to a different index.
         *
         * @param from The source index.
         * @param to The target index.
         */
        moveView(from, to) {
            if (this.state !== State.Idle) {
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
            if (this.state !== State.Idle) {
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
            if (index < 0 || index >= this.viewItems.length) {
                throw new Error('Index out of bounds');
            }
            const viewItem = this.viewItems[index];
            return viewItem.visible;
        }
        /**
         * Set a {@link IView view}'s visibility.
         *
         * @param index The {@link IView view} index.
         * @param visible Whether the {@link IView view} should be visible.
         */
        setViewVisible(index, visible) {
            if (index < 0 || index >= this.viewItems.length) {
                throw new Error('Index out of bounds');
            }
            const viewItem = this.viewItems[index];
            viewItem.setVisible(visible);
            this.distributeEmptySpace(index);
            this.layoutViews();
            this.saveProportions();
        }
        /**
         * Returns the {@link IView view}'s size previously to being hidden.
         *
         * @param index The {@link IView view} index.
         */
        getViewCachedVisibleSize(index) {
            if (index < 0 || index >= this.viewItems.length) {
                throw new Error('Index out of bounds');
            }
            const viewItem = this.viewItems[index];
            return viewItem.cachedVisibleSize;
        }
        /**
         * Layout the {@link SplitView}.
         *
         * @param size The entire size of the {@link SplitView}.
         * @param layoutContext An optional layout context to pass along to {@link IView views}.
         */
        layout(size, layoutContext) {
            const previousSize = Math.max(this.size, this.contentSize);
            this.size = size;
            this.layoutContext = layoutContext;
            if (!this.proportions) {
                const indexes = (0, arrays_1.range)(this.viewItems.length);
                const lowPriorityIndexes = indexes.filter(i => this.viewItems[i].priority === 1 /* LayoutPriority.Low */);
                const highPriorityIndexes = indexes.filter(i => this.viewItems[i].priority === 2 /* LayoutPriority.High */);
                this.resize(this.viewItems.length - 1, size - previousSize, undefined, lowPriorityIndexes, highPriorityIndexes);
            }
            else {
                let total = 0;
                for (let i = 0; i < this.viewItems.length; i++) {
                    const item = this.viewItems[i];
                    const proportion = this.proportions[i];
                    if (typeof proportion === 'number') {
                        total += proportion;
                    }
                    else {
                        size -= item.size;
                    }
                }
                for (let i = 0; i < this.viewItems.length; i++) {
                    const item = this.viewItems[i];
                    const proportion = this.proportions[i];
                    if (typeof proportion === 'number') {
                        item.size = (0, numbers_1.clamp)(Math.round(proportion * size / total), item.minimumSize, item.maximumSize);
                    }
                }
            }
            this.distributeEmptySpace();
            this.layoutViews();
        }
        saveProportions() {
            if (this.proportionalLayout && this.contentSize > 0) {
                this.proportions = this.viewItems.map(i => i.proportionalLayout ? i.size / this.contentSize : undefined);
            }
        }
        onSashStart({ sash, start, alt }) {
            for (const item of this.viewItems) {
                item.enabled = false;
            }
            const index = this.sashItems.findIndex(item => item.sash === sash);
            // This way, we can press Alt while we resize a sash, macOS style!
            const disposable = (0, lifecycle_1.combinedDisposable)((0, dom_1.addDisposableListener)(document.body, 'keydown', e => resetSashDragState(this.sashDragState.current, e.altKey)), (0, dom_1.addDisposableListener)(document.body, 'keyup', () => resetSashDragState(this.sashDragState.current, false)));
            const resetSashDragState = (start, alt) => {
                const sizes = this.viewItems.map(i => i.size);
                let minDelta = Number.NEGATIVE_INFINITY;
                let maxDelta = Number.POSITIVE_INFINITY;
                if (this.inverseAltBehavior) {
                    alt = !alt;
                }
                if (alt) {
                    // When we're using the last sash with Alt, we're resizing
                    // the view to the left/up, instead of right/down as usual
                    // Thus, we must do the inverse of the usual
                    const isLastSash = index === this.sashItems.length - 1;
                    if (isLastSash) {
                        const viewItem = this.viewItems[index];
                        minDelta = (viewItem.minimumSize - viewItem.size) / 2;
                        maxDelta = (viewItem.maximumSize - viewItem.size) / 2;
                    }
                    else {
                        const viewItem = this.viewItems[index + 1];
                        minDelta = (viewItem.size - viewItem.maximumSize) / 2;
                        maxDelta = (viewItem.size - viewItem.minimumSize) / 2;
                    }
                }
                let snapBefore;
                let snapAfter;
                if (!alt) {
                    const upIndexes = (0, arrays_1.range)(index, -1);
                    const downIndexes = (0, arrays_1.range)(index + 1, this.viewItems.length);
                    const minDeltaUp = upIndexes.reduce((r, i) => r + (this.viewItems[i].minimumSize - sizes[i]), 0);
                    const maxDeltaUp = upIndexes.reduce((r, i) => r + (this.viewItems[i].viewMaximumSize - sizes[i]), 0);
                    const maxDeltaDown = downIndexes.length === 0 ? Number.POSITIVE_INFINITY : downIndexes.reduce((r, i) => r + (sizes[i] - this.viewItems[i].minimumSize), 0);
                    const minDeltaDown = downIndexes.length === 0 ? Number.NEGATIVE_INFINITY : downIndexes.reduce((r, i) => r + (sizes[i] - this.viewItems[i].viewMaximumSize), 0);
                    const minDelta = Math.max(minDeltaUp, minDeltaDown);
                    const maxDelta = Math.min(maxDeltaDown, maxDeltaUp);
                    const snapBeforeIndex = this.findFirstSnapIndex(upIndexes);
                    const snapAfterIndex = this.findFirstSnapIndex(downIndexes);
                    if (typeof snapBeforeIndex === 'number') {
                        const viewItem = this.viewItems[snapBeforeIndex];
                        const halfSize = Math.floor(viewItem.viewMinimumSize / 2);
                        snapBefore = {
                            index: snapBeforeIndex,
                            limitDelta: viewItem.visible ? minDelta - halfSize : minDelta + halfSize,
                            size: viewItem.size
                        };
                    }
                    if (typeof snapAfterIndex === 'number') {
                        const viewItem = this.viewItems[snapAfterIndex];
                        const halfSize = Math.floor(viewItem.viewMinimumSize / 2);
                        snapAfter = {
                            index: snapAfterIndex,
                            limitDelta: viewItem.visible ? maxDelta + halfSize : maxDelta - halfSize,
                            size: viewItem.size
                        };
                    }
                }
                this.sashDragState = { start, current: start, index, sizes, minDelta, maxDelta, alt, snapBefore, snapAfter, disposable };
            };
            resetSashDragState(start, alt);
        }
        onSashChange({ current }) {
            const { index, start, sizes, alt, minDelta, maxDelta, snapBefore, snapAfter } = this.sashDragState;
            this.sashDragState.current = current;
            const delta = current - start;
            const newDelta = this.resize(index, delta, sizes, undefined, undefined, minDelta, maxDelta, snapBefore, snapAfter);
            if (alt) {
                const isLastSash = index === this.sashItems.length - 1;
                const newSizes = this.viewItems.map(i => i.size);
                const viewItemIndex = isLastSash ? index : index + 1;
                const viewItem = this.viewItems[viewItemIndex];
                const newMinDelta = viewItem.size - viewItem.maximumSize;
                const newMaxDelta = viewItem.size - viewItem.minimumSize;
                const resizeIndex = isLastSash ? index - 1 : index + 1;
                this.resize(resizeIndex, -newDelta, newSizes, undefined, undefined, newMinDelta, newMaxDelta);
            }
            this.distributeEmptySpace();
            this.layoutViews();
        }
        onSashEnd(index) {
            this._onDidSashChange.fire(index);
            this.sashDragState.disposable.dispose();
            this.saveProportions();
            for (const item of this.viewItems) {
                item.enabled = true;
            }
        }
        onViewChange(item, size) {
            const index = this.viewItems.indexOf(item);
            if (index < 0 || index >= this.viewItems.length) {
                return;
            }
            size = typeof size === 'number' ? size : item.size;
            size = (0, numbers_1.clamp)(size, item.minimumSize, item.maximumSize);
            if (this.inverseAltBehavior && index > 0) {
                // In this case, we want the view to grow or shrink both sides equally
                // so we just resize the "left" side by half and let `resize` do the clamping magic
                this.resize(index - 1, Math.floor((item.size - size) / 2));
                this.distributeEmptySpace();
                this.layoutViews();
            }
            else {
                item.size = size;
                this.relayout([index], undefined);
            }
        }
        /**
         * Resize a {@link IView view} within the {@link SplitView}.
         *
         * @param index The {@link IView view} index.
         * @param size The {@link IView view} size.
         */
        resizeView(index, size) {
            if (this.state !== State.Idle) {
                throw new Error('Cant modify splitview');
            }
            this.state = State.Busy;
            if (index < 0 || index >= this.viewItems.length) {
                return;
            }
            const indexes = (0, arrays_1.range)(this.viewItems.length).filter(i => i !== index);
            const lowPriorityIndexes = [...indexes.filter(i => this.viewItems[i].priority === 1 /* LayoutPriority.Low */), index];
            const highPriorityIndexes = indexes.filter(i => this.viewItems[i].priority === 2 /* LayoutPriority.High */);
            const item = this.viewItems[index];
            size = Math.round(size);
            size = (0, numbers_1.clamp)(size, item.minimumSize, Math.min(item.maximumSize, this.size));
            item.size = size;
            this.relayout(lowPriorityIndexes, highPriorityIndexes);
            this.state = State.Idle;
        }
        /**
         * Returns whether all other {@link IView views} are at their minimum size.
         */
        isViewSizeMaximized(index) {
            if (index < 0 || index >= this.viewItems.length) {
                return false;
            }
            for (const item of this.viewItems) {
                if (item !== this.viewItems[index] && item.size > item.minimumSize) {
                    return false;
                }
            }
            return true;
        }
        /**
         * Distribute the entire {@link SplitView} size among all {@link IView views}.
         */
        distributeViewSizes() {
            const flexibleViewItems = [];
            let flexibleSize = 0;
            for (const item of this.viewItems) {
                if (item.maximumSize - item.minimumSize > 0) {
                    flexibleViewItems.push(item);
                    flexibleSize += item.size;
                }
            }
            const size = Math.floor(flexibleSize / flexibleViewItems.length);
            for (const item of flexibleViewItems) {
                item.size = (0, numbers_1.clamp)(size, item.minimumSize, item.maximumSize);
            }
            const indexes = (0, arrays_1.range)(this.viewItems.length);
            const lowPriorityIndexes = indexes.filter(i => this.viewItems[i].priority === 1 /* LayoutPriority.Low */);
            const highPriorityIndexes = indexes.filter(i => this.viewItems[i].priority === 2 /* LayoutPriority.High */);
            this.relayout(lowPriorityIndexes, highPriorityIndexes);
        }
        /**
         * Returns the size of a {@link IView view}.
         */
        getViewSize(index) {
            if (index < 0 || index >= this.viewItems.length) {
                return -1;
            }
            return this.viewItems[index].size;
        }
        doAddView(view, size, index = this.viewItems.length, skipLayout) {
            if (this.state !== State.Idle) {
                throw new Error('Cant modify splitview');
            }
            this.state = State.Busy;
            // Add view
            const container = (0, dom_1.$)('.split-view-view');
            if (index === this.viewItems.length) {
                this.viewContainer.appendChild(container);
            }
            else {
                this.viewContainer.insertBefore(container, this.viewContainer.children.item(index));
            }
            const onChangeDisposable = view.onDidChange(size => this.onViewChange(item, size));
            const containerDisposable = (0, lifecycle_1.toDisposable)(() => this.viewContainer.removeChild(container));
            const disposable = (0, lifecycle_1.combinedDisposable)(onChangeDisposable, containerDisposable);
            let viewSize;
            if (typeof size === 'number') {
                viewSize = size;
            }
            else {
                if (size.type === 'auto') {
                    if (this.areViewsDistributed()) {
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
            this.viewItems.splice(index, 0, item);
            // Add sash
            if (this.viewItems.length > 1) {
                const opts = { orthogonalStartSash: this.orthogonalStartSash, orthogonalEndSash: this.orthogonalEndSash };
                const sash = this.orientation === 0 /* Orientation.VERTICAL */
                    ? new sash_1.Sash(this.sashContainer, { getHorizontalSashTop: s => this.getSashPosition(s), getHorizontalSashWidth: this.getSashOrthogonalSize }, { ...opts, orientation: 1 /* Orientation.HORIZONTAL */ })
                    : new sash_1.Sash(this.sashContainer, { getVerticalSashLeft: s => this.getSashPosition(s), getVerticalSashHeight: this.getSashOrthogonalSize }, { ...opts, orientation: 0 /* Orientation.VERTICAL */ });
                const sashEventMapper = this.orientation === 0 /* Orientation.VERTICAL */
                    ? (e) => ({ sash, start: e.startY, current: e.currentY, alt: e.altKey })
                    : (e) => ({ sash, start: e.startX, current: e.currentX, alt: e.altKey });
                const onStart = event_2.Event.map(sash.onDidStart, sashEventMapper);
                const onStartDisposable = onStart(this.onSashStart, this);
                const onChange = event_2.Event.map(sash.onDidChange, sashEventMapper);
                const onChangeDisposable = onChange(this.onSashChange, this);
                const onEnd = event_2.Event.map(sash.onDidEnd, () => this.sashItems.findIndex(item => item.sash === sash));
                const onEndDisposable = onEnd(this.onSashEnd, this);
                const onDidResetDisposable = sash.onDidReset(() => {
                    const index = this.sashItems.findIndex(item => item.sash === sash);
                    const upIndexes = (0, arrays_1.range)(index, -1);
                    const downIndexes = (0, arrays_1.range)(index + 1, this.viewItems.length);
                    const snapBeforeIndex = this.findFirstSnapIndex(upIndexes);
                    const snapAfterIndex = this.findFirstSnapIndex(downIndexes);
                    if (typeof snapBeforeIndex === 'number' && !this.viewItems[snapBeforeIndex].visible) {
                        return;
                    }
                    if (typeof snapAfterIndex === 'number' && !this.viewItems[snapAfterIndex].visible) {
                        return;
                    }
                    this._onDidSashReset.fire(index);
                });
                const disposable = (0, lifecycle_1.combinedDisposable)(onStartDisposable, onChangeDisposable, onEndDisposable, onDidResetDisposable, sash);
                const sashItem = { sash, disposable };
                this.sashItems.splice(index - 1, 0, sashItem);
            }
            container.appendChild(view.element);
            let highPriorityIndexes;
            if (typeof size !== 'number' && size.type === 'split') {
                highPriorityIndexes = [size.index];
            }
            if (!skipLayout) {
                this.relayout([index], highPriorityIndexes);
            }
            this.state = State.Idle;
            if (!skipLayout && typeof size !== 'number' && size.type === 'distribute') {
                this.distributeViewSizes();
            }
        }
        relayout(lowPriorityIndexes, highPriorityIndexes) {
            const contentSize = this.viewItems.reduce((r, i) => r + i.size, 0);
            this.resize(this.viewItems.length - 1, this.size - contentSize, undefined, lowPriorityIndexes, highPriorityIndexes);
            this.distributeEmptySpace();
            this.layoutViews();
            this.saveProportions();
        }
        resize(index, delta, sizes = this.viewItems.map(i => i.size), lowPriorityIndexes, highPriorityIndexes, overloadMinDelta = Number.NEGATIVE_INFINITY, overloadMaxDelta = Number.POSITIVE_INFINITY, snapBefore, snapAfter) {
            if (index < 0 || index >= this.viewItems.length) {
                return 0;
            }
            const upIndexes = (0, arrays_1.range)(index, -1);
            const downIndexes = (0, arrays_1.range)(index + 1, this.viewItems.length);
            if (highPriorityIndexes) {
                for (const index of highPriorityIndexes) {
                    (0, arrays_1.pushToStart)(upIndexes, index);
                    (0, arrays_1.pushToStart)(downIndexes, index);
                }
            }
            if (lowPriorityIndexes) {
                for (const index of lowPriorityIndexes) {
                    (0, arrays_1.pushToEnd)(upIndexes, index);
                    (0, arrays_1.pushToEnd)(downIndexes, index);
                }
            }
            const upItems = upIndexes.map(i => this.viewItems[i]);
            const upSizes = upIndexes.map(i => sizes[i]);
            const downItems = downIndexes.map(i => this.viewItems[i]);
            const downSizes = downIndexes.map(i => sizes[i]);
            const minDeltaUp = upIndexes.reduce((r, i) => r + (this.viewItems[i].minimumSize - sizes[i]), 0);
            const maxDeltaUp = upIndexes.reduce((r, i) => r + (this.viewItems[i].maximumSize - sizes[i]), 0);
            const maxDeltaDown = downIndexes.length === 0 ? Number.POSITIVE_INFINITY : downIndexes.reduce((r, i) => r + (sizes[i] - this.viewItems[i].minimumSize), 0);
            const minDeltaDown = downIndexes.length === 0 ? Number.NEGATIVE_INFINITY : downIndexes.reduce((r, i) => r + (sizes[i] - this.viewItems[i].maximumSize), 0);
            const minDelta = Math.max(minDeltaUp, minDeltaDown, overloadMinDelta);
            const maxDelta = Math.min(maxDeltaDown, maxDeltaUp, overloadMaxDelta);
            let snapped = false;
            if (snapBefore) {
                const snapView = this.viewItems[snapBefore.index];
                const visible = delta >= snapBefore.limitDelta;
                snapped = visible !== snapView.visible;
                snapView.setVisible(visible, snapBefore.size);
            }
            if (!snapped && snapAfter) {
                const snapView = this.viewItems[snapAfter.index];
                const visible = delta < snapAfter.limitDelta;
                snapped = visible !== snapView.visible;
                snapView.setVisible(visible, snapAfter.size);
            }
            if (snapped) {
                return this.resize(index, delta, sizes, lowPriorityIndexes, highPriorityIndexes, overloadMinDelta, overloadMaxDelta);
            }
            delta = (0, numbers_1.clamp)(delta, minDelta, maxDelta);
            for (let i = 0, deltaUp = delta; i < upItems.length; i++) {
                const item = upItems[i];
                const size = (0, numbers_1.clamp)(upSizes[i] + deltaUp, item.minimumSize, item.maximumSize);
                const viewDelta = size - upSizes[i];
                deltaUp -= viewDelta;
                item.size = size;
            }
            for (let i = 0, deltaDown = delta; i < downItems.length; i++) {
                const item = downItems[i];
                const size = (0, numbers_1.clamp)(downSizes[i] - deltaDown, item.minimumSize, item.maximumSize);
                const viewDelta = size - downSizes[i];
                deltaDown += viewDelta;
                item.size = size;
            }
            return delta;
        }
        distributeEmptySpace(lowPriorityIndex) {
            const contentSize = this.viewItems.reduce((r, i) => r + i.size, 0);
            let emptyDelta = this.size - contentSize;
            const indexes = (0, arrays_1.range)(this.viewItems.length - 1, -1);
            const lowPriorityIndexes = indexes.filter(i => this.viewItems[i].priority === 1 /* LayoutPriority.Low */);
            const highPriorityIndexes = indexes.filter(i => this.viewItems[i].priority === 2 /* LayoutPriority.High */);
            for (const index of highPriorityIndexes) {
                (0, arrays_1.pushToStart)(indexes, index);
            }
            for (const index of lowPriorityIndexes) {
                (0, arrays_1.pushToEnd)(indexes, index);
            }
            if (typeof lowPriorityIndex === 'number') {
                (0, arrays_1.pushToEnd)(indexes, lowPriorityIndex);
            }
            for (let i = 0; emptyDelta !== 0 && i < indexes.length; i++) {
                const item = this.viewItems[indexes[i]];
                const size = (0, numbers_1.clamp)(item.size + emptyDelta, item.minimumSize, item.maximumSize);
                const viewDelta = size - item.size;
                emptyDelta -= viewDelta;
                item.size = size;
            }
        }
        layoutViews() {
            // Save new content size
            this.contentSize = this.viewItems.reduce((r, i) => r + i.size, 0);
            // Layout views
            let offset = 0;
            for (const viewItem of this.viewItems) {
                viewItem.layout(offset, this.layoutContext);
                offset += viewItem.size;
            }
            // Layout sashes
            this.sashItems.forEach(item => item.sash.layout());
            this.updateSashEnablement();
            this.updateScrollableElement();
        }
        updateScrollableElement() {
            if (this.orientation === 0 /* Orientation.VERTICAL */) {
                this.scrollableElement.setScrollDimensions({
                    height: this.size,
                    scrollHeight: this.contentSize
                });
            }
            else {
                this.scrollableElement.setScrollDimensions({
                    width: this.size,
                    scrollWidth: this.contentSize
                });
            }
        }
        updateSashEnablement() {
            let previous = false;
            const collapsesDown = this.viewItems.map(i => previous = (i.size - i.minimumSize > 0) || previous);
            previous = false;
            const expandsDown = this.viewItems.map(i => previous = (i.maximumSize - i.size > 0) || previous);
            const reverseViews = [...this.viewItems].reverse();
            previous = false;
            const collapsesUp = reverseViews.map(i => previous = (i.size - i.minimumSize > 0) || previous).reverse();
            previous = false;
            const expandsUp = reverseViews.map(i => previous = (i.maximumSize - i.size > 0) || previous).reverse();
            let position = 0;
            for (let index = 0; index < this.sashItems.length; index++) {
                const { sash } = this.sashItems[index];
                const viewItem = this.viewItems[index];
                position += viewItem.size;
                const min = !(collapsesDown[index] && expandsUp[index + 1]);
                const max = !(expandsDown[index] && collapsesUp[index + 1]);
                if (min && max) {
                    const upIndexes = (0, arrays_1.range)(index, -1);
                    const downIndexes = (0, arrays_1.range)(index + 1, this.viewItems.length);
                    const snapBeforeIndex = this.findFirstSnapIndex(upIndexes);
                    const snapAfterIndex = this.findFirstSnapIndex(downIndexes);
                    const snappedBefore = typeof snapBeforeIndex === 'number' && !this.viewItems[snapBeforeIndex].visible;
                    const snappedAfter = typeof snapAfterIndex === 'number' && !this.viewItems[snapAfterIndex].visible;
                    if (snappedBefore && collapsesUp[index] && (position > 0 || this.startSnappingEnabled)) {
                        sash.state = 1 /* SashState.AtMinimum */;
                    }
                    else if (snappedAfter && collapsesDown[index] && (position < this.contentSize || this.endSnappingEnabled)) {
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
        getSashPosition(sash) {
            let position = 0;
            for (let i = 0; i < this.sashItems.length; i++) {
                position += this.viewItems[i].size;
                if (this.sashItems[i].sash === sash) {
                    return position;
                }
            }
            return 0;
        }
        findFirstSnapIndex(indexes) {
            // visible views first
            for (const index of indexes) {
                const viewItem = this.viewItems[index];
                if (!viewItem.visible) {
                    continue;
                }
                if (viewItem.snap) {
                    return index;
                }
            }
            // then, hidden views
            for (const index of indexes) {
                const viewItem = this.viewItems[index];
                if (viewItem.visible && viewItem.maximumSize - viewItem.minimumSize > 0) {
                    return undefined;
                }
                if (!viewItem.visible && viewItem.snap) {
                    return index;
                }
            }
            return undefined;
        }
        areViewsDistributed() {
            let min = undefined, max = undefined;
            for (const view of this.viewItems) {
                min = min === undefined ? view.size : Math.min(min, view.size);
                max = max === undefined ? view.size : Math.max(max, view.size);
                if (max - min > 2) {
                    return false;
                }
            }
            return true;
        }
        dispose() {
            this.sashDragState?.disposable.dispose();
            (0, lifecycle_1.dispose)(this.viewItems);
            this.viewItems = [];
            this.sashItems.forEach(i => i.disposable.dispose());
            this.sashItems = [];
            super.dispose();
        }
    }
    exports.SplitView = SplitView;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BsaXR2aWV3LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL3NwbGl0dmlldy9zcGxpdHZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY3ZGLG1HQUFBLFdBQVcsT0FBQTtJQU1wQixNQUFNLGFBQWEsR0FBcUI7UUFDdkMsZUFBZSxFQUFFLGFBQUssQ0FBQyxXQUFXO0tBQ2xDLENBQUM7SUFFRixJQUFrQixjQUlqQjtJQUpELFdBQWtCLGNBQWM7UUFDL0IsdURBQU0sQ0FBQTtRQUNOLGlEQUFHLENBQUE7UUFDSCxtREFBSSxDQUFBO0lBQ0wsQ0FBQyxFQUppQixjQUFjLDhCQUFkLGNBQWMsUUFJL0I7SUFrTEQsTUFBZSxRQUFRO1FBR3RCLElBQUksSUFBSSxDQUFDLElBQVk7WUFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbkIsQ0FBQztRQUVELElBQUksSUFBSTtZQUNQLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNuQixDQUFDO1FBR0QsSUFBSSxpQkFBaUIsS0FBeUIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1FBRS9FLElBQUksT0FBTztZQUNWLE9BQU8sT0FBTyxJQUFJLENBQUMsa0JBQWtCLEtBQUssV0FBVyxDQUFDO1FBQ3ZELENBQUM7UUFFRCxVQUFVLENBQUMsT0FBZ0IsRUFBRSxJQUFhO1lBQ3pDLElBQUksT0FBTyxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQzdCLE9BQU87YUFDUDtZQUVELElBQUksT0FBTyxFQUFFO2dCQUNaLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBQSxlQUFLLEVBQUMsSUFBSSxDQUFDLGtCQUFtQixFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUN4RixJQUFJLENBQUMsa0JB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LENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFELE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVqRCxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakcsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pHLE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMzSixNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMs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