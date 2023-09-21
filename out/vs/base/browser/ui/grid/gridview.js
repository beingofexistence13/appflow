/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/splitview/splitview", "vs/base/common/arrays", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/types", "vs/base/browser/ui/sash/sash", "vs/base/browser/ui/splitview/splitview", "vs/css!./gridview"], function (require, exports, dom_1, splitview_1, arrays_1, color_1, event_1, lifecycle_1, numbers_1, types_1, sash_1, splitview_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GridView = exports.isGridBranchNode = exports.orthogonal = exports.Sizing = exports.LayoutPriority = exports.Orientation = void 0;
    Object.defineProperty(exports, "Orientation", { enumerable: true, get: function () { return sash_1.Orientation; } });
    Object.defineProperty(exports, "LayoutPriority", { enumerable: true, get: function () { return splitview_2.LayoutPriority; } });
    Object.defineProperty(exports, "Sizing", { enumerable: true, get: function () { return splitview_2.Sizing; } });
    const defaultStyles = {
        separatorBorder: color_1.Color.transparent
    };
    function orthogonal(orientation) {
        return orientation === 0 /* Orientation.VERTICAL */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */;
    }
    exports.orthogonal = orthogonal;
    function isGridBranchNode(node) {
        return !!node.children;
    }
    exports.isGridBranchNode = isGridBranchNode;
    class LayoutController {
        constructor(isLayoutEnabled) {
            this.isLayoutEnabled = isLayoutEnabled;
        }
    }
    function toAbsoluteBoundarySashes(sashes, orientation) {
        if (orientation === 1 /* Orientation.HORIZONTAL */) {
            return { left: sashes.start, right: sashes.end, top: sashes.orthogonalStart, bottom: sashes.orthogonalEnd };
        }
        else {
            return { top: sashes.start, bottom: sashes.end, left: sashes.orthogonalStart, right: sashes.orthogonalEnd };
        }
    }
    function fromAbsoluteBoundarySashes(sashes, orientation) {
        if (orientation === 1 /* Orientation.HORIZONTAL */) {
            return { start: sashes.left, end: sashes.right, orthogonalStart: sashes.top, orthogonalEnd: sashes.bottom };
        }
        else {
            return { start: sashes.top, end: sashes.bottom, orthogonalStart: sashes.left, orthogonalEnd: sashes.right };
        }
    }
    function validateIndex(index, numChildren) {
        if (Math.abs(index) > numChildren) {
            throw new Error('Invalid index');
        }
        return (0, numbers_1.rot)(index, numChildren + 1);
    }
    class BranchNode {
        get size() { return this._size; }
        get orthogonalSize() { return this._orthogonalSize; }
        get absoluteOffset() { return this._absoluteOffset; }
        get absoluteOrthogonalOffset() { return this._absoluteOrthogonalOffset; }
        get styles() { return this._styles; }
        get width() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.size : this.orthogonalSize;
        }
        get height() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.orthogonalSize : this.size;
        }
        get top() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this._absoluteOffset : this._absoluteOrthogonalOffset;
        }
        get left() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this._absoluteOrthogonalOffset : this._absoluteOffset;
        }
        get minimumSize() {
            return this.children.length === 0 ? 0 : Math.max(...this.children.map(c => c.minimumOrthogonalSize));
        }
        get maximumSize() {
            return Math.min(...this.children.map(c => c.maximumOrthogonalSize));
        }
        get priority() {
            if (this.children.length === 0) {
                return 0 /* LayoutPriority.Normal */;
            }
            const priorities = this.children.map(c => typeof c.priority === 'undefined' ? 0 /* LayoutPriority.Normal */ : c.priority);
            if (priorities.some(p => p === 2 /* LayoutPriority.High */)) {
                return 2 /* LayoutPriority.High */;
            }
            else if (priorities.some(p => p === 1 /* LayoutPriority.Low */)) {
                return 1 /* LayoutPriority.Low */;
            }
            return 0 /* LayoutPriority.Normal */;
        }
        get proportionalLayout() {
            if (this.children.length === 0) {
                return true;
            }
            return this.children.every(c => c.proportionalLayout);
        }
        get minimumOrthogonalSize() {
            return this.splitview.minimumSize;
        }
        get maximumOrthogonalSize() {
            return this.splitview.maximumSize;
        }
        get minimumWidth() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.minimumOrthogonalSize : this.minimumSize;
        }
        get minimumHeight() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.minimumSize : this.minimumOrthogonalSize;
        }
        get maximumWidth() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.maximumOrthogonalSize : this.maximumSize;
        }
        get maximumHeight() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.maximumSize : this.maximumOrthogonalSize;
        }
        get boundarySashes() { return this._boundarySashes; }
        set boundarySashes(boundarySashes) {
            if (this._boundarySashes.start === boundarySashes.start
                && this._boundarySashes.end === boundarySashes.end
                && this._boundarySashes.orthogonalStart === boundarySashes.orthogonalStart
                && this._boundarySashes.orthogonalEnd === boundarySashes.orthogonalEnd) {
                return;
            }
            this._boundarySashes = boundarySashes;
            this.splitview.orthogonalStartSash = boundarySashes.orthogonalStart;
            this.splitview.orthogonalEndSash = boundarySashes.orthogonalEnd;
            for (let index = 0; index < this.children.length; index++) {
                const child = this.children[index];
                const first = index === 0;
                const last = index === this.children.length - 1;
                child.boundarySashes = {
                    start: boundarySashes.orthogonalStart,
                    end: boundarySashes.orthogonalEnd,
                    orthogonalStart: first ? boundarySashes.start : child.boundarySashes.orthogonalStart,
                    orthogonalEnd: last ? boundarySashes.end : child.boundarySashes.orthogonalEnd,
                };
            }
        }
        get edgeSnapping() { return this._edgeSnapping; }
        set edgeSnapping(edgeSnapping) {
            if (this._edgeSnapping === edgeSnapping) {
                return;
            }
            this._edgeSnapping = edgeSnapping;
            for (const child of this.children) {
                if (child instanceof BranchNode) {
                    child.edgeSnapping = edgeSnapping;
                }
            }
            this.updateSplitviewEdgeSnappingEnablement();
        }
        constructor(orientation, layoutController, styles, splitviewProportionalLayout, size = 0, orthogonalSize = 0, edgeSnapping = false, childDescriptors) {
            this.orientation = orientation;
            this.layoutController = layoutController;
            this.splitviewProportionalLayout = splitviewProportionalLayout;
            this.children = [];
            this._absoluteOffset = 0;
            this._absoluteOrthogonalOffset = 0;
            this.absoluteOrthogonalSize = 0;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._onDidScroll = new event_1.Emitter();
            this.onDidScrollDisposable = lifecycle_1.Disposable.None;
            this.onDidScroll = this._onDidScroll.event;
            this.childrenChangeDisposable = lifecycle_1.Disposable.None;
            this._onDidSashReset = new event_1.Emitter();
            this.onDidSashReset = this._onDidSashReset.event;
            this.splitviewSashResetDisposable = lifecycle_1.Disposable.None;
            this.childrenSashResetDisposable = lifecycle_1.Disposable.None;
            this._boundarySashes = {};
            this._edgeSnapping = false;
            this._styles = styles;
            this._size = size;
            this._orthogonalSize = orthogonalSize;
            this.element = (0, dom_1.$)('.monaco-grid-branch-node');
            if (!childDescriptors) {
                // Normal behavior, we have no children yet, just set up the splitview
                this.splitview = new splitview_1.SplitView(this.element, { orientation, styles, proportionalLayout: splitviewProportionalLayout });
                this.splitview.layout(size, { orthogonalSize, absoluteOffset: 0, absoluteOrthogonalOffset: 0, absoluteSize: size, absoluteOrthogonalSize: orthogonalSize });
            }
            else {
                // Reconstruction behavior, we want to reconstruct a splitview
                const descriptor = {
                    views: childDescriptors.map(childDescriptor => {
                        return {
                            view: childDescriptor.node,
                            size: childDescriptor.node.size,
                            visible: childDescriptor.node instanceof LeafNode && childDescriptor.visible !== undefined ? childDescriptor.visible : true
                        };
                    }),
                    size: this.orthogonalSize
                };
                const options = { proportionalLayout: splitviewProportionalLayout, orientation, styles };
                this.children = childDescriptors.map(c => c.node);
                this.splitview = new splitview_1.SplitView(this.element, { ...options, descriptor });
                this.children.forEach((node, index) => {
                    const first = index === 0;
                    const last = index === this.children.length;
                    node.boundarySashes = {
                        start: this.boundarySashes.orthogonalStart,
                        end: this.boundarySashes.orthogonalEnd,
                        orthogonalStart: first ? this.boundarySashes.start : this.splitview.sashes[index - 1],
                        orthogonalEnd: last ? this.boundarySashes.end : this.splitview.sashes[index],
                    };
                });
            }
            const onDidSashReset = event_1.Event.map(this.splitview.onDidSashReset, i => [i]);
            this.splitviewSashResetDisposable = onDidSashReset(this._onDidSashReset.fire, this._onDidSashReset);
            this.updateChildrenEvents();
        }
        style(styles) {
            this._styles = styles;
            this.splitview.style(styles);
            for (const child of this.children) {
                if (child instanceof BranchNode) {
                    child.style(styles);
                }
            }
        }
        layout(size, offset, ctx) {
            if (!this.layoutController.isLayoutEnabled) {
                return;
            }
            if (typeof ctx === 'undefined') {
                throw new Error('Invalid state');
            }
            // branch nodes should flip the normal/orthogonal directions
            this._size = ctx.orthogonalSize;
            this._orthogonalSize = size;
            this._absoluteOffset = ctx.absoluteOffset + offset;
            this._absoluteOrthogonalOffset = ctx.absoluteOrthogonalOffset;
            this.absoluteOrthogonalSize = ctx.absoluteOrthogonalSize;
            this.splitview.layout(ctx.orthogonalSize, {
                orthogonalSize: size,
                absoluteOffset: this._absoluteOrthogonalOffset,
                absoluteOrthogonalOffset: this._absoluteOffset,
                absoluteSize: ctx.absoluteOrthogonalSize,
                absoluteOrthogonalSize: ctx.absoluteSize
            });
            this.updateSplitviewEdgeSnappingEnablement();
        }
        setVisible(visible) {
            for (const child of this.children) {
                child.setVisible(visible);
            }
        }
        addChild(node, size, index, skipLayout) {
            index = validateIndex(index, this.children.length);
            this.splitview.addView(node, size, index, skipLayout);
            this.children.splice(index, 0, node);
            this.updateBoundarySashes();
            this.onDidChildrenChange();
        }
        removeChild(index, sizing) {
            index = validateIndex(index, this.children.length);
            const result = this.splitview.removeView(index, sizing);
            this.children.splice(index, 1);
            this.updateBoundarySashes();
            this.onDidChildrenChange();
            return result;
        }
        removeAllChildren() {
            const result = this.splitview.removeAllViews();
            this.children.splice(0, this.children.length);
            this.updateBoundarySashes();
            this.onDidChildrenChange();
            return result;
        }
        moveChild(from, to) {
            from = validateIndex(from, this.children.length);
            to = validateIndex(to, this.children.length);
            if (from === to) {
                return;
            }
            if (from < to) {
                to -= 1;
            }
            this.splitview.moveView(from, to);
            this.children.splice(to, 0, this.children.splice(from, 1)[0]);
            this.updateBoundarySashes();
            this.onDidChildrenChange();
        }
        swapChildren(from, to) {
            from = validateIndex(from, this.children.length);
            to = validateIndex(to, this.children.length);
            if (from === to) {
                return;
            }
            this.splitview.swapViews(from, to);
            // swap boundary sashes
            [this.children[from].boundarySashes, this.children[to].boundarySashes]
                = [this.children[from].boundarySashes, this.children[to].boundarySashes];
            // swap children
            [this.children[from], this.children[to]] = [this.children[to], this.children[from]];
            this.onDidChildrenChange();
        }
        resizeChild(index, size) {
            index = validateIndex(index, this.children.length);
            this.splitview.resizeView(index, size);
        }
        isChildSizeMaximized(index) {
            return this.splitview.isViewSizeMaximized(index);
        }
        distributeViewSizes(recursive = false) {
            this.splitview.distributeViewSizes();
            if (recursive) {
                for (const child of this.children) {
                    if (child instanceof BranchNode) {
                        child.distributeViewSizes(true);
                    }
                }
            }
        }
        getChildSize(index) {
            index = validateIndex(index, this.children.length);
            return this.splitview.getViewSize(index);
        }
        isChildVisible(index) {
            index = validateIndex(index, this.children.length);
            return this.splitview.isViewVisible(index);
        }
        setChildVisible(index, visible) {
            index = validateIndex(index, this.children.length);
            if (this.splitview.isViewVisible(index) === visible) {
                return;
            }
            this.splitview.setViewVisible(index, visible);
        }
        getChildCachedVisibleSize(index) {
            index = validateIndex(index, this.children.length);
            return this.splitview.getViewCachedVisibleSize(index);
        }
        updateBoundarySashes() {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].boundarySashes = {
                    start: this.boundarySashes.orthogonalStart,
                    end: this.boundarySashes.orthogonalEnd,
                    orthogonalStart: i === 0 ? this.boundarySashes.start : this.splitview.sashes[i - 1],
                    orthogonalEnd: i === this.children.length - 1 ? this.boundarySashes.end : this.splitview.sashes[i],
                };
            }
        }
        onDidChildrenChange() {
            this.updateChildrenEvents();
            this._onDidChange.fire(undefined);
        }
        updateChildrenEvents() {
            const onDidChildrenChange = event_1.Event.map(event_1.Event.any(...this.children.map(c => c.onDidChange)), () => undefined);
            this.childrenChangeDisposable.dispose();
            this.childrenChangeDisposable = onDidChildrenChange(this._onDidChange.fire, this._onDidChange);
            const onDidChildrenSashReset = event_1.Event.any(...this.children.map((c, i) => event_1.Event.map(c.onDidSashReset, location => [i, ...location])));
            this.childrenSashResetDisposable.dispose();
            this.childrenSashResetDisposable = onDidChildrenSashReset(this._onDidSashReset.fire, this._onDidSashReset);
            const onDidScroll = event_1.Event.any(event_1.Event.signal(this.splitview.onDidScroll), ...this.children.map(c => c.onDidScroll));
            this.onDidScrollDisposable.dispose();
            this.onDidScrollDisposable = onDidScroll(this._onDidScroll.fire, this._onDidScroll);
        }
        trySet2x2(other) {
            if (this.children.length !== 2 || other.children.length !== 2) {
                return lifecycle_1.Disposable.None;
            }
            if (this.getChildSize(0) !== other.getChildSize(0)) {
                return lifecycle_1.Disposable.None;
            }
            const [firstChild, secondChild] = this.children;
            const [otherFirstChild, otherSecondChild] = other.children;
            if (!(firstChild instanceof LeafNode) || !(secondChild instanceof LeafNode)) {
                return lifecycle_1.Disposable.None;
            }
            if (!(otherFirstChild instanceof LeafNode) || !(otherSecondChild instanceof LeafNode)) {
                return lifecycle_1.Disposable.None;
            }
            if (this.orientation === 0 /* Orientation.VERTICAL */) {
                secondChild.linkedWidthNode = otherFirstChild.linkedHeightNode = firstChild;
                firstChild.linkedWidthNode = otherSecondChild.linkedHeightNode = secondChild;
                otherSecondChild.linkedWidthNode = firstChild.linkedHeightNode = otherFirstChild;
                otherFirstChild.linkedWidthNode = secondChild.linkedHeightNode = otherSecondChild;
            }
            else {
                otherFirstChild.linkedWidthNode = secondChild.linkedHeightNode = firstChild;
                otherSecondChild.linkedWidthNode = firstChild.linkedHeightNode = secondChild;
                firstChild.linkedWidthNode = otherSecondChild.linkedHeightNode = otherFirstChild;
                secondChild.linkedWidthNode = otherFirstChild.linkedHeightNode = otherSecondChild;
            }
            const mySash = this.splitview.sashes[0];
            const otherSash = other.splitview.sashes[0];
            mySash.linkedSash = otherSash;
            otherSash.linkedSash = mySash;
            this._onDidChange.fire(undefined);
            other._onDidChange.fire(undefined);
            return (0, lifecycle_1.toDisposable)(() => {
                mySash.linkedSash = otherSash.linkedSash = undefined;
                firstChild.linkedHeightNode = firstChild.linkedWidthNode = undefined;
                secondChild.linkedHeightNode = secondChild.linkedWidthNode = undefined;
                otherFirstChild.linkedHeightNode = otherFirstChild.linkedWidthNode = undefined;
                otherSecondChild.linkedHeightNode = otherSecondChild.linkedWidthNode = undefined;
            });
        }
        updateSplitviewEdgeSnappingEnablement() {
            this.splitview.startSnappingEnabled = this._edgeSnapping || this._absoluteOrthogonalOffset > 0;
            this.splitview.endSnappingEnabled = this._edgeSnapping || this._absoluteOrthogonalOffset + this._size < this.absoluteOrthogonalSize;
        }
        dispose() {
            for (const child of this.children) {
                child.dispose();
            }
            this._onDidChange.dispose();
            this._onDidSashReset.dispose();
            this.splitviewSashResetDisposable.dispose();
            this.childrenSashResetDisposable.dispose();
            this.childrenChangeDisposable.dispose();
            this.onDidScrollDisposable.dispose();
            this.splitview.dispose();
        }
    }
    /**
     * Creates a latched event that avoids being fired when the view
     * constraints do not change at all.
     */
    function createLatchedOnDidChangeViewEvent(view) {
        const [onDidChangeViewConstraints, onDidSetViewSize] = event_1.Event.split(view.onDidChange, types_1.isUndefined);
        return event_1.Event.any(onDidSetViewSize, event_1.Event.map(event_1.Event.latch(event_1.Event.map(onDidChangeViewConstraints, _ => ([view.minimumWidth, view.maximumWidth, view.minimumHeight, view.maximumHeight])), arrays_1.equals), _ => undefined));
    }
    class LeafNode {
        get size() { return this._size; }
        get orthogonalSize() { return this._orthogonalSize; }
        get linkedWidthNode() { return this._linkedWidthNode; }
        set linkedWidthNode(node) {
            this._onDidLinkedWidthNodeChange.input = node ? node._onDidViewChange : event_1.Event.None;
            this._linkedWidthNode = node;
            this._onDidSetLinkedNode.fire(undefined);
        }
        get linkedHeightNode() { return this._linkedHeightNode; }
        set linkedHeightNode(node) {
            this._onDidLinkedHeightNodeChange.input = node ? node._onDidViewChange : event_1.Event.None;
            this._linkedHeightNode = node;
            this._onDidSetLinkedNode.fire(undefined);
        }
        constructor(view, orientation, layoutController, orthogonalSize, size = 0) {
            this.view = view;
            this.orientation = orientation;
            this.layoutController = layoutController;
            this._size = 0;
            this.absoluteOffset = 0;
            this.absoluteOrthogonalOffset = 0;
            this.onDidScroll = event_1.Event.None;
            this.onDidSashReset = event_1.Event.None;
            this._onDidLinkedWidthNodeChange = new event_1.Relay();
            this._linkedWidthNode = undefined;
            this._onDidLinkedHeightNodeChange = new event_1.Relay();
            this._linkedHeightNode = undefined;
            this._onDidSetLinkedNode = new event_1.Emitter();
            this.disposables = new lifecycle_1.DisposableStore();
            this._boundarySashes = {};
            this.cachedWidth = 0;
            this.cachedHeight = 0;
            this.cachedTop = 0;
            this.cachedLeft = 0;
            this._orthogonalSize = orthogonalSize;
            this._size = size;
            const onDidChange = createLatchedOnDidChangeViewEvent(view);
            this._onDidViewChange = event_1.Event.map(onDidChange, e => e && (this.orientation === 0 /* Orientation.VERTICAL */ ? e.width : e.height), this.disposables);
            this.onDidChange = event_1.Event.any(this._onDidViewChange, this._onDidSetLinkedNode.event, this._onDidLinkedWidthNodeChange.event, this._onDidLinkedHeightNodeChange.event);
        }
        get width() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.orthogonalSize : this.size;
        }
        get height() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.size : this.orthogonalSize;
        }
        get top() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.absoluteOffset : this.absoluteOrthogonalOffset;
        }
        get left() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.absoluteOrthogonalOffset : this.absoluteOffset;
        }
        get element() {
            return this.view.element;
        }
        get minimumWidth() {
            return this.linkedWidthNode ? Math.max(this.linkedWidthNode.view.minimumWidth, this.view.minimumWidth) : this.view.minimumWidth;
        }
        get maximumWidth() {
            return this.linkedWidthNode ? Math.min(this.linkedWidthNode.view.maximumWidth, this.view.maximumWidth) : this.view.maximumWidth;
        }
        get minimumHeight() {
            return this.linkedHeightNode ? Math.max(this.linkedHeightNode.view.minimumHeight, this.view.minimumHeight) : this.view.minimumHeight;
        }
        get maximumHeight() {
            return this.linkedHeightNode ? Math.min(this.linkedHeightNode.view.maximumHeight, this.view.maximumHeight) : this.view.maximumHeight;
        }
        get minimumSize() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.minimumHeight : this.minimumWidth;
        }
        get maximumSize() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.maximumHeight : this.maximumWidth;
        }
        get priority() {
            return this.view.priority;
        }
        get proportionalLayout() {
            return this.view.proportionalLayout ?? true;
        }
        get snap() {
            return this.view.snap;
        }
        get minimumOrthogonalSize() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.minimumWidth : this.minimumHeight;
        }
        get maximumOrthogonalSize() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.maximumWidth : this.maximumHeight;
        }
        get boundarySashes() { return this._boundarySashes; }
        set boundarySashes(boundarySashes) {
            this._boundarySashes = boundarySashes;
            this.view.setBoundarySashes?.(toAbsoluteBoundarySashes(boundarySashes, this.orientation));
        }
        layout(size, offset, ctx) {
            if (!this.layoutController.isLayoutEnabled) {
                return;
            }
            if (typeof ctx === 'undefined') {
                throw new Error('Invalid state');
            }
            this._size = size;
            this._orthogonalSize = ctx.orthogonalSize;
            this.absoluteOffset = ctx.absoluteOffset + offset;
            this.absoluteOrthogonalOffset = ctx.absoluteOrthogonalOffset;
            this._layout(this.width, this.height, this.top, this.left);
        }
        _layout(width, height, top, left) {
            if (this.cachedWidth === width && this.cachedHeight === height && this.cachedTop === top && this.cachedLeft === left) {
                return;
            }
            this.cachedWidth = width;
            this.cachedHeight = height;
            this.cachedTop = top;
            this.cachedLeft = left;
            this.view.layout(width, height, top, left);
        }
        setVisible(visible) {
            this.view.setVisible?.(visible);
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    function flipNode(node, size, orthogonalSize) {
        if (node instanceof BranchNode) {
            const result = new BranchNode(orthogonal(node.orientation), node.layoutController, node.styles, node.splitviewProportionalLayout, size, orthogonalSize, node.edgeSnapping);
            let totalSize = 0;
            for (let i = node.children.length - 1; i >= 0; i--) {
                const child = node.children[i];
                const childSize = child instanceof BranchNode ? child.orthogonalSize : child.size;
                let newSize = node.size === 0 ? 0 : Math.round((size * childSize) / node.size);
                totalSize += newSize;
                // The last view to add should adjust to rounding errors
                if (i === 0) {
                    newSize += size - totalSize;
                }
                result.addChild(flipNode(child, orthogonalSize, newSize), newSize, 0, true);
            }
            node.dispose();
            return result;
        }
        else {
            const result = new LeafNode(node.view, orthogonal(node.orientation), node.layoutController, orthogonalSize);
            node.dispose();
            return result;
        }
    }
    /**
     * The {@link GridView} is the UI component which implements a two dimensional
     * flex-like layout algorithm for a collection of {@link IView} instances, which
     * are mostly HTMLElement instances with size constraints. A {@link GridView} is a
     * tree composition of multiple {@link SplitView} instances, orthogonal between
     * one another. It will respect view's size contraints, just like the SplitView.
     *
     * It has a low-level index based API, allowing for fine grain performant operations.
     * Look into the {@link Grid} widget for a higher-level API.
     *
     * Features:
     * - flex-like layout algorithm
     * - snap support
     * - corner sash support
     * - Alt key modifier behavior, macOS style
     * - layout (de)serialization
     */
    class GridView {
        get root() { return this._root; }
        set root(root) {
            const oldRoot = this._root;
            if (oldRoot) {
                this.element.removeChild(oldRoot.element);
                oldRoot.dispose();
            }
            this._root = root;
            this.element.appendChild(root.element);
            this.onDidSashResetRelay.input = root.onDidSashReset;
            this._onDidChange.input = event_1.Event.map(root.onDidChange, () => undefined); // TODO
            this._onDidScroll.input = root.onDidScroll;
        }
        /**
         * The width of the grid.
         */
        get width() { return this.root.width; }
        /**
         * The height of the grid.
         */
        get height() { return this.root.height; }
        /**
         * The minimum width of the grid.
         */
        get minimumWidth() { return this.root.minimumWidth; }
        /**
         * The minimum height of the grid.
         */
        get minimumHeight() { return this.root.minimumHeight; }
        /**
         * The maximum width of the grid.
         */
        get maximumWidth() { return this.root.maximumHeight; }
        /**
         * The maximum height of the grid.
         */
        get maximumHeight() { return this.root.maximumHeight; }
        get orientation() { return this._root.orientation; }
        get boundarySashes() { return this._boundarySashes; }
        /**
         * The orientation of the grid. Matches the orientation of the root
         * {@link SplitView} in the grid's tree model.
         */
        set orientation(orientation) {
            if (this._root.orientation === orientation) {
                return;
            }
            const { size, orthogonalSize, absoluteOffset, absoluteOrthogonalOffset } = this._root;
            this.root = flipNode(this._root, orthogonalSize, size);
            this.root.layout(size, 0, { orthogonalSize, absoluteOffset: absoluteOrthogonalOffset, absoluteOrthogonalOffset: absoluteOffset, absoluteSize: size, absoluteOrthogonalSize: orthogonalSize });
            this.boundarySashes = this.boundarySashes;
        }
        /**
         * A collection of sashes perpendicular to each edge of the grid.
         * Corner sashes will be created for each intersection.
         */
        set boundarySashes(boundarySashes) {
            this._boundarySashes = boundarySashes;
            this.root.boundarySashes = fromAbsoluteBoundarySashes(boundarySashes, this.orientation);
        }
        /**
         * Enable/disable edge snapping across all grid views.
         */
        set edgeSnapping(edgeSnapping) {
            this.root.edgeSnapping = edgeSnapping;
        }
        /**
         * Create a new {@link GridView} instance.
         *
         * @remarks It's the caller's responsibility to append the
         * {@link GridView.element} to the page's DOM.
         */
        constructor(options = {}) {
            this.onDidSashResetRelay = new event_1.Relay();
            this._onDidScroll = new event_1.Relay();
            this._onDidChange = new event_1.Relay();
            this._boundarySashes = {};
            this.disposable2x2 = lifecycle_1.Disposable.None;
            /**
             * Fires whenever the user double clicks a {@link Sash sash}.
             */
            this.onDidSashReset = this.onDidSashResetRelay.event;
            /**
             * Fires whenever the user scrolls a {@link SplitView} within
             * the grid.
             */
            this.onDidScroll = this._onDidScroll.event;
            /**
             * Fires whenever a view within the grid changes its size constraints.
             */
            this.onDidChange = this._onDidChange.event;
            this.element = (0, dom_1.$)('.monaco-grid-view');
            this.styles = options.styles || defaultStyles;
            this.proportionalLayout = typeof options.proportionalLayout !== 'undefined' ? !!options.proportionalLayout : true;
            this.layoutController = new LayoutController(false);
            this.root = new BranchNode(0 /* Orientation.VERTICAL */, this.layoutController, this.styles, this.proportionalLayout);
        }
        style(styles) {
            this.styles = styles;
            this.root.style(styles);
        }
        /**
         * Layout the {@link GridView}.
         *
         * Optionally provide a `top` and `left` positions, those will propagate
         * as an origin for positions passed to {@link IView.layout}.
         *
         * @param width The width of the {@link GridView}.
         * @param height The height of the {@link GridView}.
         * @param top Optional, the top location of the {@link GridView}.
         * @param left Optional, the left location of the {@link GridView}.
         */
        layout(width, height, top = 0, left = 0) {
            this.layoutController.isLayoutEnabled = true;
            const [size, orthogonalSize, offset, orthogonalOffset] = this.root.orientation === 1 /* Orientation.HORIZONTAL */ ? [height, width, top, left] : [width, height, left, top];
            this.root.layout(size, 0, { orthogonalSize, absoluteOffset: offset, absoluteOrthogonalOffset: orthogonalOffset, absoluteSize: size, absoluteOrthogonalSize: orthogonalSize });
        }
        /**
         * Add a {@link IView view} to this {@link GridView}.
         *
         * @param view The view to add.
         * @param size Either a fixed size, or a dynamic {@link Sizing} strategy.
         * @param location The {@link GridLocation location} to insert the view on.
         */
        addView(view, size, location) {
            this.disposable2x2.dispose();
            this.disposable2x2 = lifecycle_1.Disposable.None;
            const [rest, index] = (0, arrays_1.tail2)(location);
            const [pathToParent, parent] = this.getNode(rest);
            if (parent instanceof BranchNode) {
                const node = new LeafNode(view, orthogonal(parent.orientation), this.layoutController, parent.orthogonalSize);
                try {
                    parent.addChild(node, size, index);
                }
                catch (err) {
                    node.dispose();
                    throw err;
                }
            }
            else {
                const [, grandParent] = (0, arrays_1.tail2)(pathToParent);
                const [, parentIndex] = (0, arrays_1.tail2)(rest);
                let newSiblingSize = 0;
                const newSiblingCachedVisibleSize = grandParent.getChildCachedVisibleSize(parentIndex);
                if (typeof newSiblingCachedVisibleSize === 'number') {
                    newSiblingSize = splitview_1.Sizing.Invisible(newSiblingCachedVisibleSize);
                }
                const oldChild = grandParent.removeChild(parentIndex);
                oldChild.dispose();
                const newParent = new BranchNode(parent.orientation, parent.layoutController, this.styles, this.proportionalLayout, parent.size, parent.orthogonalSize, grandParent.edgeSnapping);
                grandParent.addChild(newParent, parent.size, parentIndex);
                const newSibling = new LeafNode(parent.view, grandParent.orientation, this.layoutController, parent.size);
                newParent.addChild(newSibling, newSiblingSize, 0);
                if (typeof size !== 'number' && size.type === 'split') {
                    size = splitview_1.Sizing.Split(0);
                }
                const node = new LeafNode(view, grandParent.orientation, this.layoutController, parent.size);
                newParent.addChild(node, size, index);
            }
            this.trySet2x2();
        }
        /**
         * Remove a {@link IView view} from this {@link GridView}.
         *
         * @param location The {@link GridLocation location} of the {@link IView view}.
         * @param sizing Whether to distribute other {@link IView view}'s sizes.
         */
        removeView(location, sizing) {
            this.disposable2x2.dispose();
            this.disposable2x2 = lifecycle_1.Disposable.None;
            const [rest, index] = (0, arrays_1.tail2)(location);
            const [pathToParent, parent] = this.getNode(rest);
            if (!(parent instanceof BranchNode)) {
                throw new Error('Invalid location');
            }
            const node = parent.children[index];
            if (!(node instanceof LeafNode)) {
                throw new Error('Invalid location');
            }
            parent.removeChild(index, sizing);
            node.dispose();
            if (parent.children.length === 0) {
                throw new Error('Invalid grid state');
            }
            if (parent.children.length > 1) {
                this.trySet2x2();
                return node.view;
            }
            if (pathToParent.length === 0) { // parent is root
                const sibling = parent.children[0];
                if (sibling instanceof LeafNode) {
                    return node.view;
                }
                // we must promote sibling to be the new root
                parent.removeChild(0);
                parent.dispose();
                this.root = sibling;
                this.boundarySashes = this.boundarySashes;
                this.trySet2x2();
                return node.view;
            }
            const [, grandParent] = (0, arrays_1.tail2)(pathToParent);
            const [, parentIndex] = (0, arrays_1.tail2)(rest);
            const isSiblingVisible = parent.isChildVisible(0);
            const sibling = parent.removeChild(0);
            const sizes = grandParent.children.map((_, i) => grandParent.getChildSize(i));
            grandParent.removeChild(parentIndex, sizing);
            parent.dispose();
            if (sibling instanceof BranchNode) {
                sizes.splice(parentIndex, 1, ...sibling.children.map(c => c.size));
                const siblingChildren = sibling.removeAllChildren();
                for (let i = 0; i < siblingChildren.length; i++) {
                    grandParent.addChild(siblingChildren[i], siblingChildren[i].size, parentIndex + i);
                }
            }
            else {
                const newSibling = new LeafNode(sibling.view, orthogonal(sibling.orientation), this.layoutController, sibling.size);
                const sizing = isSiblingVisible ? sibling.orthogonalSize : splitview_1.Sizing.Invisible(sibling.orthogonalSize);
                grandParent.addChild(newSibling, sizing, parentIndex);
            }
            sibling.dispose();
            for (let i = 0; i < sizes.length; i++) {
                grandParent.resizeChild(i, sizes[i]);
            }
            this.trySet2x2();
            return node.view;
        }
        /**
         * Move a {@link IView view} within its parent.
         *
         * @param parentLocation The {@link GridLocation location} of the {@link IView view}'s parent.
         * @param from The index of the {@link IView view} to move.
         * @param to The index where the {@link IView view} should move to.
         */
        moveView(parentLocation, from, to) {
            const [, parent] = this.getNode(parentLocation);
            if (!(parent instanceof BranchNode)) {
                throw new Error('Invalid location');
            }
            parent.moveChild(from, to);
            this.trySet2x2();
        }
        /**
         * Swap two {@link IView views} within the {@link GridView}.
         *
         * @param from The {@link GridLocation location} of one view.
         * @param to The {@link GridLocation location} of another view.
         */
        swapViews(from, to) {
            const [fromRest, fromIndex] = (0, arrays_1.tail2)(from);
            const [, fromParent] = this.getNode(fromRest);
            if (!(fromParent instanceof BranchNode)) {
                throw new Error('Invalid from location');
            }
            const fromSize = fromParent.getChildSize(fromIndex);
            const fromNode = fromParent.children[fromIndex];
            if (!(fromNode instanceof LeafNode)) {
                throw new Error('Invalid from location');
            }
            const [toRest, toIndex] = (0, arrays_1.tail2)(to);
            const [, toParent] = this.getNode(toRest);
            if (!(toParent instanceof BranchNode)) {
                throw new Error('Invalid to location');
            }
            const toSize = toParent.getChildSize(toIndex);
            const toNode = toParent.children[toIndex];
            if (!(toNode instanceof LeafNode)) {
                throw new Error('Invalid to location');
            }
            if (fromParent === toParent) {
                fromParent.swapChildren(fromIndex, toIndex);
            }
            else {
                fromParent.removeChild(fromIndex);
                toParent.removeChild(toIndex);
                fromParent.addChild(toNode, fromSize, fromIndex);
                toParent.addChild(fromNode, toSize, toIndex);
            }
            this.trySet2x2();
        }
        /**
         * Resize a {@link IView view}.
         *
         * @param location The {@link GridLocation location} of the view.
         * @param size The size the view should be. Optionally provide a single dimension.
         */
        resizeView(location, size) {
            const [rest, index] = (0, arrays_1.tail2)(location);
            const [pathToParent, parent] = this.getNode(rest);
            if (!(parent instanceof BranchNode)) {
                throw new Error('Invalid location');
            }
            if (!size.width && !size.height) {
                return;
            }
            const [parentSize, grandParentSize] = parent.orientation === 1 /* Orientation.HORIZONTAL */ ? [size.width, size.height] : [size.height, size.width];
            if (typeof grandParentSize === 'number' && pathToParent.length > 0) {
                const [, grandParent] = (0, arrays_1.tail2)(pathToParent);
                const [, parentIndex] = (0, arrays_1.tail2)(rest);
                grandParent.resizeChild(parentIndex, grandParentSize);
            }
            if (typeof parentSize === 'number') {
                parent.resizeChild(index, parentSize);
            }
            this.trySet2x2();
        }
        /**
         * Get the size of a {@link IView view}.
         *
         * @param location The {@link GridLocation location} of the view. Provide `undefined` to get
         * the size of the grid itself.
         */
        getViewSize(location) {
            if (!location) {
                return { width: this.root.width, height: this.root.height };
            }
            const [, node] = this.getNode(location);
            return { width: node.width, height: node.height };
        }
        /**
         * Get the cached visible size of a {@link IView view}. This was the size
         * of the view at the moment it last became hidden.
         *
         * @param location The {@link GridLocation location} of the view.
         */
        getViewCachedVisibleSize(location) {
            const [rest, index] = (0, arrays_1.tail2)(location);
            const [, parent] = this.getNode(rest);
            if (!(parent instanceof BranchNode)) {
                throw new Error('Invalid location');
            }
            return parent.getChildCachedVisibleSize(index);
        }
        /**
         * Maximize the size of a {@link IView view} by collapsing all other views
         * to their minimum sizes.
         *
         * @param location The {@link GridLocation location} of the view.
         */
        maximizeViewSize(location) {
            const [ancestors, node] = this.getNode(location);
            if (!(node instanceof LeafNode)) {
                throw new Error('Invalid location');
            }
            for (let i = 0; i < ancestors.length; i++) {
                ancestors[i].resizeChild(location[i], Number.POSITIVE_INFINITY);
            }
        }
        /**
         * Returns whether all other {@link IView views} are at their minimum size.
         *
         * @param location The {@link GridLocation location} of the view.
         */
        isViewSizeMaximized(location) {
            const [ancestors, node] = this.getNode(location);
            if (!(node instanceof LeafNode)) {
                throw new Error('Invalid location');
            }
            for (let i = 0; i < ancestors.length; i++) {
                if (!ancestors[i].isChildSizeMaximized(location[i])) {
                    return false;
                }
            }
            return true;
        }
        /**
         * Distribute the size among all {@link IView views} within the entire
         * grid or within a single {@link SplitView}.
         *
         * @param location The {@link GridLocation location} of a view containing
         * children views, which will have their sizes distributed within the parent
         * view's size. Provide `undefined` to recursively distribute all views' sizes
         * in the entire grid.
         */
        distributeViewSizes(location) {
            if (!location) {
                this.root.distributeViewSizes(true);
                return;
            }
            const [, node] = this.getNode(location);
            if (!(node instanceof BranchNode)) {
                throw new Error('Invalid location');
            }
            node.distributeViewSizes();
            this.trySet2x2();
        }
        /**
         * Returns whether a {@link IView view} is visible.
         *
         * @param location The {@link GridLocation location} of the view.
         */
        isViewVisible(location) {
            const [rest, index] = (0, arrays_1.tail2)(location);
            const [, parent] = this.getNode(rest);
            if (!(parent instanceof BranchNode)) {
                throw new Error('Invalid from location');
            }
            return parent.isChildVisible(index);
        }
        /**
         * Set the visibility state of a {@link IView view}.
         *
         * @param location The {@link GridLocation location} of the view.
         */
        setViewVisible(location, visible) {
            const [rest, index] = (0, arrays_1.tail2)(location);
            const [, parent] = this.getNode(rest);
            if (!(parent instanceof BranchNode)) {
                throw new Error('Invalid from location');
            }
            parent.setChildVisible(index, visible);
        }
        getView(location) {
            const node = location ? this.getNode(location)[1] : this._root;
            return this._getViews(node, this.orientation);
        }
        /**
         * Construct a new {@link GridView} from a JSON object.
         *
         * @param json The JSON object.
         * @param deserializer A deserializer which can revive each view.
         * @returns A new {@link GridView} instance.
         */
        static deserialize(json, deserializer, options = {}) {
            if (typeof json.orientation !== 'number') {
                throw new Error('Invalid JSON: \'orientation\' property must be a number.');
            }
            else if (typeof json.width !== 'number') {
                throw new Error('Invalid JSON: \'width\' property must be a number.');
            }
            else if (typeof json.height !== 'number') {
                throw new Error('Invalid JSON: \'height\' property must be a number.');
            }
            else if (json.root?.type !== 'branch') {
                throw new Error('Invalid JSON: \'root\' property must have \'type\' value of branch.');
            }
            const orientation = json.orientation;
            const height = json.height;
            const result = new GridView(options);
            result._deserialize(json.root, orientation, deserializer, height);
            return result;
        }
        _deserialize(root, orientation, deserializer, orthogonalSize) {
            this.root = this._deserializeNode(root, orientation, deserializer, orthogonalSize);
        }
        _deserializeNode(node, orientation, deserializer, orthogonalSize) {
            let result;
            if (node.type === 'branch') {
                const serializedChildren = node.data;
                const children = serializedChildren.map(serializedChild => {
                    return {
                        node: this._deserializeNode(serializedChild, orthogonal(orientation), deserializer, node.size),
                        visible: serializedChild.visible
                    };
                });
                result = new BranchNode(orientation, this.layoutController, this.styles, this.proportionalLayout, node.size, orthogonalSize, undefined, children);
            }
            else {
                result = new LeafNode(deserializer.fromJSON(node.data), orientation, this.layoutController, orthogonalSize, node.size);
            }
            return result;
        }
        _getViews(node, orientation, cachedVisibleSize) {
            const box = { top: node.top, left: node.left, width: node.width, height: node.height };
            if (node instanceof LeafNode) {
                return { view: node.view, box, cachedVisibleSize };
            }
            const children = [];
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                const cachedVisibleSize = node.getChildCachedVisibleSize(i);
                children.push(this._getViews(child, orthogonal(orientation), cachedVisibleSize));
            }
            return { children, box };
        }
        getNode(location, node = this.root, path = []) {
            if (location.length === 0) {
                return [path, node];
            }
            if (!(node instanceof BranchNode)) {
                throw new Error('Invalid location');
            }
            const [index, ...rest] = location;
            if (index < 0 || index >= node.children.length) {
                throw new Error('Invalid location');
            }
            const child = node.children[index];
            path.push(node);
            return this.getNode(rest, child, path);
        }
        /**
         * Attempt to lock the {@link Sash sashes} in this {@link GridView} so
         * the grid behaves as a 2x2 matrix, with a corner sash in the middle.
         *
         * In case the grid isn't a 2x2 grid _and_ all sashes are not aligned,
         * this method is a no-op.
         */
        trySet2x2() {
            this.disposable2x2.dispose();
            this.disposable2x2 = lifecycle_1.Disposable.None;
            if (this.root.children.length !== 2) {
                return;
            }
            const [first, second] = this.root.children;
            if (!(first instanceof BranchNode) || !(second instanceof BranchNode)) {
                return;
            }
            this.disposable2x2 = first.trySet2x2(second);
        }
        /**
         * Populate a map with views to DOM nodes.
         * @remarks To be used internally only.
         */
        getViewMap(map, node) {
            if (!node) {
                node = this.root;
            }
            if (node instanceof BranchNode) {
                node.children.forEach(child => this.getViewMap(map, child));
            }
            else {
                map.set(node.view, node.element);
            }
        }
        dispose() {
            this.onDidSashResetRelay.dispose();
            this.root.dispose();
            this.element.parentElement?.removeChild(this.element);
        }
    }
    exports.GridView = GridView;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZHZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvZ3JpZC9ncmlkdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhdkYsbUdBQUEsV0FBVyxPQUFBO0lBQ1gsMkdBQUEsY0FBYyxPQUFBO0lBQUUsbUdBQUEsTUFBTSxPQUFBO0lBSS9CLE1BQU0sYUFBYSxHQUFvQjtRQUN0QyxlQUFlLEVBQUUsYUFBSyxDQUFDLFdBQVc7S0FDbEMsQ0FBQztJQWdKRixTQUFnQixVQUFVLENBQUMsV0FBd0I7UUFDbEQsT0FBTyxXQUFXLGlDQUF5QixDQUFDLENBQUMsZ0NBQXdCLENBQUMsNkJBQXFCLENBQUM7SUFDN0YsQ0FBQztJQUZELGdDQUVDO0lBc0JELFNBQWdCLGdCQUFnQixDQUFDLElBQWM7UUFDOUMsT0FBTyxDQUFDLENBQUUsSUFBWSxDQUFDLFFBQVEsQ0FBQztJQUNqQyxDQUFDO0lBRkQsNENBRUM7SUFFRCxNQUFNLGdCQUFnQjtRQUNyQixZQUFtQixlQUF3QjtZQUF4QixvQkFBZSxHQUFmLGVBQWUsQ0FBUztRQUFJLENBQUM7S0FDaEQ7SUF5QkQsU0FBUyx3QkFBd0IsQ0FBQyxNQUErQixFQUFFLFdBQXdCO1FBQzFGLElBQUksV0FBVyxtQ0FBMkIsRUFBRTtZQUMzQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxlQUFlLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUM1RzthQUFNO1lBQ04sT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsZUFBZSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDNUc7SUFDRixDQUFDO0lBRUQsU0FBUywwQkFBMEIsQ0FBQyxNQUF1QixFQUFFLFdBQXdCO1FBQ3BGLElBQUksV0FBVyxtQ0FBMkIsRUFBRTtZQUMzQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsYUFBYSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUM1RzthQUFNO1lBQ04sT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDNUc7SUFDRixDQUFDO0lBRUQsU0FBUyxhQUFhLENBQUMsS0FBYSxFQUFFLFdBQW1CO1FBQ3hELElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxXQUFXLEVBQUU7WUFDbEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUNqQztRQUVELE9BQU8sSUFBQSxhQUFHLEVBQUMsS0FBSyxFQUFFLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsTUFBTSxVQUFVO1FBT2YsSUFBSSxJQUFJLEtBQWEsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUd6QyxJQUFJLGNBQWMsS0FBYSxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBRzdELElBQUksY0FBYyxLQUFhLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFHN0QsSUFBSSx3QkFBd0IsS0FBYSxPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7UUFLakYsSUFBSSxNQUFNLEtBQXNCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFFdEQsSUFBSSxLQUFLO1lBQ1IsT0FBTyxJQUFJLENBQUMsV0FBVyxtQ0FBMkIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUN0RixDQUFDO1FBRUQsSUFBSSxNQUFNO1lBQ1QsT0FBTyxJQUFJLENBQUMsV0FBVyxtQ0FBMkIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0RixDQUFDO1FBRUQsSUFBSSxHQUFHO1lBQ04sT0FBTyxJQUFJLENBQUMsV0FBVyxtQ0FBMkIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDO1FBQzVHLENBQUM7UUFFRCxJQUFJLElBQUk7WUFDUCxPQUFPLElBQUksQ0FBQyxXQUFXLG1DQUEyQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDNUcsQ0FBQztRQUVELElBQUksV0FBVztZQUNkLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7UUFDdEcsQ0FBQztRQUVELElBQUksV0FBVztZQUNkLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztRQUNyRSxDQUFDO1FBRUQsSUFBSSxRQUFRO1lBQ1gsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQy9CLHFDQUE2QjthQUM3QjtZQUVELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxLQUFLLFdBQVcsQ0FBQyxDQUFDLCtCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRWxILElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsZ0NBQXdCLENBQUMsRUFBRTtnQkFDcEQsbUNBQTJCO2FBQzNCO2lCQUFNLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsK0JBQXVCLENBQUMsRUFBRTtnQkFDMUQsa0NBQTBCO2FBQzFCO1lBRUQscUNBQTZCO1FBQzlCLENBQUM7UUFFRCxJQUFJLGtCQUFrQjtZQUNyQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDL0IsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBRUQsSUFBSSxxQkFBcUI7WUFDeEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQztRQUNuQyxDQUFDO1FBRUQsSUFBSSxxQkFBcUI7WUFDeEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQztRQUNuQyxDQUFDO1FBRUQsSUFBSSxZQUFZO1lBQ2YsT0FBTyxJQUFJLENBQUMsV0FBVyxtQ0FBMkIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ3BHLENBQUM7UUFFRCxJQUFJLGFBQWE7WUFDaEIsT0FBTyxJQUFJLENBQUMsV0FBVyxtQ0FBMkIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDO1FBQ3BHLENBQUM7UUFFRCxJQUFJLFlBQVk7WUFDZixPQUFPLElBQUksQ0FBQyxXQUFXLG1DQUEyQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDcEcsQ0FBQztRQUVELElBQUksYUFBYTtZQUNoQixPQUFPLElBQUksQ0FBQyxXQUFXLG1DQUEyQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7UUFDcEcsQ0FBQztRQWlCRCxJQUFJLGNBQWMsS0FBOEIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUM5RSxJQUFJLGNBQWMsQ0FBQyxjQUF1QztZQUN6RCxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxLQUFLLGNBQWMsQ0FBQyxLQUFLO21CQUNuRCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsS0FBSyxjQUFjLENBQUMsR0FBRzttQkFDL0MsSUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLEtBQUssY0FBYyxDQUFDLGVBQWU7bUJBQ3ZFLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxLQUFLLGNBQWMsQ0FBQyxhQUFhLEVBQUU7Z0JBQ3hFLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1lBRXRDLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEdBQUcsY0FBYyxDQUFDLGVBQWUsQ0FBQztZQUNwRSxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixHQUFHLGNBQWMsQ0FBQyxhQUFhLENBQUM7WUFFaEUsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUMxRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNuQyxNQUFNLEtBQUssR0FBRyxLQUFLLEtBQUssQ0FBQyxDQUFDO2dCQUMxQixNQUFNLElBQUksR0FBRyxLQUFLLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2dCQUVoRCxLQUFLLENBQUMsY0FBYyxHQUFHO29CQUN0QixLQUFLLEVBQUUsY0FBYyxDQUFDLGVBQWU7b0JBQ3JDLEdBQUcsRUFBRSxjQUFjLENBQUMsYUFBYTtvQkFDakMsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxlQUFlO29CQUNwRixhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLGFBQWE7aUJBQzdFLENBQUM7YUFDRjtRQUNGLENBQUM7UUFHRCxJQUFJLFlBQVksS0FBYyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBQzFELElBQUksWUFBWSxDQUFDLFlBQXFCO1lBQ3JDLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxZQUFZLEVBQUU7Z0JBQ3hDLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO1lBRWxDLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDbEMsSUFBSSxLQUFLLFlBQVksVUFBVSxFQUFFO29CQUNoQyxLQUFLLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztpQkFDbEM7YUFDRDtZQUVELElBQUksQ0FBQyxxQ0FBcUMsRUFBRSxDQUFDO1FBQzlDLENBQUM7UUFFRCxZQUNVLFdBQXdCLEVBQ3hCLGdCQUFrQyxFQUMzQyxNQUF1QixFQUNkLDJCQUFvQyxFQUM3QyxPQUFlLENBQUMsRUFDaEIsaUJBQXlCLENBQUMsRUFDMUIsZUFBd0IsS0FBSyxFQUM3QixnQkFBb0M7WUFQM0IsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDeEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUVsQyxnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQVM7WUE3SnJDLGFBQVEsR0FBVyxFQUFFLENBQUM7WUFTdkIsb0JBQWUsR0FBVyxDQUFDLENBQUM7WUFHNUIsOEJBQXlCLEdBQVcsQ0FBQyxDQUFDO1lBR3RDLDJCQUFzQixHQUFXLENBQUMsQ0FBQztZQTZFMUIsaUJBQVksR0FBRyxJQUFJLGVBQU8sRUFBc0IsQ0FBQztZQUN6RCxnQkFBVyxHQUE4QixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQUVsRSxpQkFBWSxHQUFHLElBQUksZUFBTyxFQUFRLENBQUM7WUFDbkMsMEJBQXFCLEdBQWdCLHNCQUFVLENBQUMsSUFBSSxDQUFDO1lBQ3BELGdCQUFXLEdBQWdCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBRXBELDZCQUF3QixHQUFnQixzQkFBVSxDQUFDLElBQUksQ0FBQztZQUUvQyxvQkFBZSxHQUFHLElBQUksZUFBTyxFQUFnQixDQUFDO1lBQ3RELG1CQUFjLEdBQXdCLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDO1lBQ2xFLGlDQUE0QixHQUFnQixzQkFBVSxDQUFDLElBQUksQ0FBQztZQUM1RCxnQ0FBMkIsR0FBZ0Isc0JBQVUsQ0FBQyxJQUFJLENBQUM7WUFFM0Qsb0JBQWUsR0FBNEIsRUFBRSxDQUFDO1lBNkI5QyxrQkFBYSxHQUFHLEtBQUssQ0FBQztZQTRCN0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7WUFFdEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFBLE9BQUMsRUFBQywwQkFBMEIsQ0FBQyxDQUFDO1lBRTdDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDdEIsc0VBQXNFO2dCQUN0RSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUkscUJBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxrQkFBa0IsRUFBRSwyQkFBMkIsRUFBRSxDQUFDLENBQUM7Z0JBQ3ZILElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsQ0FBQyxFQUFFLHdCQUF3QixFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7YUFDNUo7aUJBQU07Z0JBQ04sOERBQThEO2dCQUM5RCxNQUFNLFVBQVUsR0FBRztvQkFDbEIsS0FBSyxFQUFFLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsRUFBRTt3QkFDN0MsT0FBTzs0QkFDTixJQUFJLEVBQUUsZUFBZSxDQUFDLElBQUk7NEJBQzFCLElBQUksRUFBRSxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUk7NEJBQy9CLE9BQU8sRUFBRSxlQUFlLENBQUMsSUFBSSxZQUFZLFFBQVEsSUFBSSxlQUFlLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSTt5QkFDM0gsQ0FBQztvQkFDSCxDQUFDLENBQUM7b0JBQ0YsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjO2lCQUN6QixDQUFDO2dCQUVGLE1BQU0sT0FBTyxHQUFHLEVBQUUsa0JBQWtCLEVBQUUsMkJBQTJCLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxDQUFDO2dCQUV6RixJQUFJLENBQUMsUUFBUSxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLHFCQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7Z0JBRXpFLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO29CQUNyQyxNQUFNLEtBQUssR0FBRyxLQUFLLEtBQUssQ0FBQyxDQUFDO29CQUMxQixNQUFNLElBQUksR0FBRyxLQUFLLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7b0JBRTVDLElBQUksQ0FBQyxjQUFjLEdBQUc7d0JBQ3JCLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWU7d0JBQzFDLEdBQUcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWE7d0JBQ3RDLGVBQWUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO3dCQUNyRixhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO3FCQUM1RSxDQUFDO2dCQUNILENBQUMsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxNQUFNLGNBQWMsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFFLElBQUksQ0FBQyw0QkFBNEIsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRXBHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzdCLENBQUM7UUFFRCxLQUFLLENBQUMsTUFBdUI7WUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFN0IsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNsQyxJQUFJLEtBQUssWUFBWSxVQUFVLEVBQUU7b0JBQ2hDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ3BCO2FBQ0Q7UUFDRixDQUFDO1FBRUQsTUFBTSxDQUFDLElBQVksRUFBRSxNQUFjLEVBQUUsR0FBK0I7WUFDbkUsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUU7Z0JBQzNDLE9BQU87YUFDUDtZQUVELElBQUksT0FBTyxHQUFHLEtBQUssV0FBVyxFQUFFO2dCQUMvQixNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2FBQ2pDO1lBRUQsNERBQTREO1lBQzVELElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLGNBQWMsQ0FBQztZQUNoQyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztZQUM1QixJQUFJLENBQUMsZUFBZSxHQUFHLEdBQUcsQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDO1lBQ25ELElBQUksQ0FBQyx5QkFBeUIsR0FBRyxHQUFHLENBQUMsd0JBQXdCLENBQUM7WUFDOUQsSUFBSSxDQUFDLHNCQUFzQixHQUFHLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQztZQUV6RCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFO2dCQUN6QyxjQUFjLEVBQUUsSUFBSTtnQkFDcEIsY0FBYyxFQUFFLElBQUksQ0FBQyx5QkFBeUI7Z0JBQzlDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxlQUFlO2dCQUM5QyxZQUFZLEVBQUUsR0FBRyxDQUFDLHNCQUFzQjtnQkFDeEMsc0JBQXNCLEVBQUUsR0FBRyxDQUFDLFlBQVk7YUFDeEMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLHFDQUFxQyxFQUFFLENBQUM7UUFDOUMsQ0FBQztRQUVELFVBQVUsQ0FBQyxPQUFnQjtZQUMxQixLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xDLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDMUI7UUFDRixDQUFDO1FBRUQsUUFBUSxDQUFDLElBQVUsRUFBRSxJQUFxQixFQUFFLEtBQWEsRUFBRSxVQUFvQjtZQUM5RSxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRW5ELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3RELElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFckMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVELFdBQVcsQ0FBQyxLQUFhLEVBQUUsTUFBZTtZQUN6QyxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRW5ELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFL0IsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFFM0IsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRUQsaUJBQWlCO1lBQ2hCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUM7WUFFL0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFOUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFFM0IsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRUQsU0FBUyxDQUFDLElBQVksRUFBRSxFQUFVO1lBQ2pDLElBQUksR0FBRyxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakQsRUFBRSxHQUFHLGFBQWEsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU3QyxJQUFJLElBQUksS0FBSyxFQUFFLEVBQUU7Z0JBQ2hCLE9BQU87YUFDUDtZQUVELElBQUksSUFBSSxHQUFHLEVBQUUsRUFBRTtnQkFDZCxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ1I7WUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU5RCxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBRUQsWUFBWSxDQUFDLElBQVksRUFBRSxFQUFVO1lBQ3BDLElBQUksR0FBRyxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakQsRUFBRSxHQUFHLGFBQWEsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU3QyxJQUFJLElBQUksS0FBSyxFQUFFLEVBQUU7Z0JBQ2hCLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVuQyx1QkFBdUI7WUFDdkIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQztrQkFDbkUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRTFFLGdCQUFnQjtZQUNoQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFcEYsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVELFdBQVcsQ0FBQyxLQUFhLEVBQUUsSUFBWTtZQUN0QyxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRW5ELElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBRUQsb0JBQW9CLENBQUMsS0FBYTtZQUNqQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVELG1CQUFtQixDQUFDLFNBQVMsR0FBRyxLQUFLO1lBQ3BDLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUVyQyxJQUFJLFNBQVMsRUFBRTtnQkFDZCxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7b0JBQ2xDLElBQUksS0FBSyxZQUFZLFVBQVUsRUFBRTt3QkFDaEMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNoQztpQkFDRDthQUNEO1FBQ0YsQ0FBQztRQUVELFlBQVksQ0FBQyxLQUFhO1lBQ3pCLEtBQUssR0FBRyxhQUFhLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFbkQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBRUQsY0FBYyxDQUFDLEtBQWE7WUFDM0IsS0FBSyxHQUFHLGFBQWEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVuRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFRCxlQUFlLENBQUMsS0FBYSxFQUFFLE9BQWdCO1lBQzlDLEtBQUssR0FBRyxhQUFhLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFbkQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsS0FBSyxPQUFPLEVBQUU7Z0JBQ3BELE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRUQseUJBQXlCLENBQUMsS0FBYTtZQUN0QyxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRW5ELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBRU8sb0JBQW9CO1lBQzNCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDOUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLEdBQUc7b0JBQ2pDLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWU7b0JBQzFDLEdBQUcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWE7b0JBQ3RDLGVBQWUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDbkYsYUFBYSxFQUFFLENBQUMsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7aUJBQ2xHLENBQUM7YUFDRjtRQUNGLENBQUM7UUFFTyxtQkFBbUI7WUFDMUIsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVPLG9CQUFvQjtZQUMzQixNQUFNLG1CQUFtQixHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsYUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDNUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3hDLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFL0YsTUFBTSxzQkFBc0IsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxhQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BJLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMzQyxJQUFJLENBQUMsMkJBQTJCLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRTNHLE1BQU0sV0FBVyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsYUFBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNsSCxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDckYsQ0FBQztRQUVELFNBQVMsQ0FBQyxLQUFpQjtZQUMxQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzlELE9BQU8sc0JBQVUsQ0FBQyxJQUFJLENBQUM7YUFDdkI7WUFFRCxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDbkQsT0FBTyxzQkFBVSxDQUFDLElBQUksQ0FBQzthQUN2QjtZQUVELE1BQU0sQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUNoRCxNQUFNLENBQUMsZUFBZSxFQUFFLGdCQUFnQixDQUFDLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztZQUUzRCxJQUFJLENBQUMsQ0FBQyxVQUFVLFlBQVksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsWUFBWSxRQUFRLENBQUMsRUFBRTtnQkFDNUUsT0FBTyxzQkFBVSxDQUFDLElBQUksQ0FBQzthQUN2QjtZQUVELElBQUksQ0FBQyxDQUFDLGVBQWUsWUFBWSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsZ0JBQWdCLFlBQVksUUFBUSxDQUFDLEVBQUU7Z0JBQ3RGLE9BQU8sc0JBQVUsQ0FBQyxJQUFJLENBQUM7YUFDdkI7WUFFRCxJQUFJLElBQUksQ0FBQyxXQUFXLGlDQUF5QixFQUFFO2dCQUM5QyxXQUFXLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUM7Z0JBQzVFLFVBQVUsQ0FBQyxlQUFlLEdBQUcsZ0JBQWdCLENBQUMsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDO2dCQUM3RSxnQkFBZ0IsQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztnQkFDakYsZUFBZSxDQUFDLGVBQWUsR0FBRyxXQUFXLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7YUFDbEY7aUJBQU07Z0JBQ04sZUFBZSxDQUFDLGVBQWUsR0FBRyxXQUFXLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDO2dCQUM1RSxnQkFBZ0IsQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixHQUFHLFdBQVcsQ0FBQztnQkFDN0UsVUFBVSxDQUFDLGVBQWUsR0FBRyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7Z0JBQ2pGLFdBQVcsQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO2FBQ2xGO1lBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7WUFDOUIsU0FBUyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7WUFFOUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEMsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFbkMsT0FBTyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFO2dCQUN4QixNQUFNLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO2dCQUNyRCxVQUFVLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7Z0JBQ3JFLFdBQVcsQ0FBQyxnQkFBZ0IsR0FBRyxXQUFXLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztnQkFDdkUsZUFBZSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO2dCQUMvRSxnQkFBZ0IsQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO1lBQ2xGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLHFDQUFxQztZQUM1QyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLHlCQUF5QixHQUFHLENBQUMsQ0FBQztZQUMvRixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLHlCQUF5QixHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDO1FBQ3JJLENBQUM7UUFFRCxPQUFPO1lBQ04sS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNsQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDaEI7WUFFRCxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFL0IsSUFBSSxDQUFDLDRCQUE0QixDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMzQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDeEMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUIsQ0FBQztLQUNEO0lBRUQ7OztPQUdHO0lBQ0gsU0FBUyxpQ0FBaUMsQ0FBQyxJQUFXO1FBQ3JELE1BQU0sQ0FBQywwQkFBMEIsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHLGFBQUssQ0FBQyxLQUFLLENBQXVCLElBQUksQ0FBQyxXQUFXLEVBQUUsbUJBQVcsQ0FBQyxDQUFDO1FBRXhILE9BQU8sYUFBSyxDQUFDLEdBQUcsQ0FDZixnQkFBZ0IsRUFDaEIsYUFBSyxDQUFDLEdBQUcsQ0FDUixhQUFLLENBQUMsS0FBSyxDQUNWLGFBQUssQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFDNUgsZUFBVyxDQUNYLEVBQ0QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQ2QsQ0FDRCxDQUFDO0lBQ0gsQ0FBQztJQUVELE1BQU0sUUFBUTtRQUdiLElBQUksSUFBSSxLQUFhLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFHekMsSUFBSSxjQUFjLEtBQWEsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQVU3RCxJQUFJLGVBQWUsS0FBMkIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1FBQzdFLElBQUksZUFBZSxDQUFDLElBQTBCO1lBQzdDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFDbkYsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztZQUM3QixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFJRCxJQUFJLGdCQUFnQixLQUEyQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFDL0UsSUFBSSxnQkFBZ0IsQ0FBQyxJQUEwQjtZQUM5QyxJQUFJLENBQUMsNEJBQTRCLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxhQUFLLENBQUMsSUFBSSxDQUFDO1lBQ3BGLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7WUFDOUIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBUUQsWUFDVSxJQUFXLEVBQ1gsV0FBd0IsRUFDeEIsZ0JBQWtDLEVBQzNDLGNBQXNCLEVBQ3RCLE9BQWUsQ0FBQztZQUpQLFNBQUksR0FBSixJQUFJLENBQU87WUFDWCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUN4QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBdkNwQyxVQUFLLEdBQVcsQ0FBQyxDQUFDO1lBTWxCLG1CQUFjLEdBQVcsQ0FBQyxDQUFDO1lBQzNCLDZCQUF3QixHQUFXLENBQUMsQ0FBQztZQUVwQyxnQkFBVyxHQUFnQixhQUFLLENBQUMsSUFBSSxDQUFDO1lBQ3RDLG1CQUFjLEdBQXdCLGFBQUssQ0FBQyxJQUFJLENBQUM7WUFFbEQsZ0NBQTJCLEdBQUcsSUFBSSxhQUFLLEVBQXNCLENBQUM7WUFDOUQscUJBQWdCLEdBQXlCLFNBQVMsQ0FBQztZQVFuRCxpQ0FBNEIsR0FBRyxJQUFJLGFBQUssRUFBc0IsQ0FBQztZQUMvRCxzQkFBaUIsR0FBeUIsU0FBUyxDQUFDO1lBUTNDLHdCQUFtQixHQUFHLElBQUksZUFBTyxFQUFzQixDQUFDO1lBSXhELGdCQUFXLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFpRjdDLG9CQUFlLEdBQTRCLEVBQUUsQ0FBQztZQXlCOUMsZ0JBQVcsR0FBVyxDQUFDLENBQUM7WUFDeEIsaUJBQVksR0FBVyxDQUFDLENBQUM7WUFDekIsY0FBUyxHQUFXLENBQUMsQ0FBQztZQUN0QixlQUFVLEdBQVcsQ0FBQyxDQUFDO1lBcEc5QixJQUFJLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztZQUN0QyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUVsQixNQUFNLFdBQVcsR0FBRyxpQ0FBaUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1RCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxpQ0FBeUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM3SSxJQUFJLENBQUMsV0FBVyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsNEJBQTRCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEssQ0FBQztRQUVELElBQUksS0FBSztZQUNSLE9BQU8sSUFBSSxDQUFDLFdBQVcsbUNBQTJCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEYsQ0FBQztRQUVELElBQUksTUFBTTtZQUNULE9BQU8sSUFBSSxDQUFDLFdBQVcsbUNBQTJCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDdEYsQ0FBQztRQUVELElBQUksR0FBRztZQUNOLE9BQU8sSUFBSSxDQUFDLFdBQVcsbUNBQTJCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQztRQUMxRyxDQUFDO1FBRUQsSUFBSSxJQUFJO1lBQ1AsT0FBTyxJQUFJLENBQUMsV0FBVyxtQ0FBMkIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQzFHLENBQUM7UUFFRCxJQUFJLE9BQU87WUFDVixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzFCLENBQUM7UUFFRCxJQUFZLFlBQVk7WUFDdkIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztRQUNqSSxDQUFDO1FBRUQsSUFBWSxZQUFZO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDakksQ0FBQztRQUVELElBQVksYUFBYTtZQUN4QixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUN0SSxDQUFDO1FBRUQsSUFBWSxhQUFhO1lBQ3hCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQ3RJLENBQUM7UUFFRCxJQUFJLFdBQVc7WUFDZCxPQUFPLElBQUksQ0FBQyxXQUFXLG1DQUEyQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQzdGLENBQUM7UUFFRCxJQUFJLFdBQVc7WUFDZCxPQUFPLElBQUksQ0FBQyxXQUFXLG1DQUEyQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQzdGLENBQUM7UUFFRCxJQUFJLFFBQVE7WUFDWCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzNCLENBQUM7UUFFRCxJQUFJLGtCQUFrQjtZQUNyQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLElBQUksSUFBSSxDQUFDO1FBQzdDLENBQUM7UUFFRCxJQUFJLElBQUk7WUFDUCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxJQUFJLHFCQUFxQjtZQUN4QixPQUFPLElBQUksQ0FBQyxXQUFXLG1DQUEyQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQzdGLENBQUM7UUFFRCxJQUFJLHFCQUFxQjtZQUN4QixPQUFPLElBQUksQ0FBQyxXQUFXLG1DQUEyQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQzdGLENBQUM7UUFHRCxJQUFJLGNBQWMsS0FBOEIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUM5RSxJQUFJLGNBQWMsQ0FBQyxjQUF1QztZQUN6RCxJQUFJLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztZQUV0QyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsd0JBQXdCLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQzNGLENBQUM7UUFFRCxNQUFNLENBQUMsSUFBWSxFQUFFLE1BQWMsRUFBRSxHQUErQjtZQUNuRSxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRTtnQkFDM0MsT0FBTzthQUNQO1lBRUQsSUFBSSxPQUFPLEdBQUcsS0FBSyxXQUFXLEVBQUU7Z0JBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDakM7WUFFRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsZUFBZSxHQUFHLEdBQUcsQ0FBQyxjQUFjLENBQUM7WUFDMUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQztZQUNsRCxJQUFJLENBQUMsd0JBQXdCLEdBQUcsR0FBRyxDQUFDLHdCQUF3QixDQUFDO1lBRTdELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVELENBQUM7UUFPTyxPQUFPLENBQUMsS0FBYSxFQUFFLE1BQWMsRUFBRSxHQUFXLEVBQUUsSUFBWTtZQUN2RSxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssS0FBSyxJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxFQUFFO2dCQUNySCxPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUN6QixJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQztZQUMzQixJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQztZQUNyQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRUQsVUFBVSxDQUFDLE9BQWdCO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzVCLENBQUM7S0FDRDtJQVlELFNBQVMsUUFBUSxDQUFDLElBQVUsRUFBRSxJQUFZLEVBQUUsY0FBc0I7UUFDakUsSUFBSSxJQUFJLFlBQVksVUFBVSxFQUFFO1lBQy9CLE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLDJCQUEyQixFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTNLLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztZQUVsQixLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNuRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixNQUFNLFNBQVMsR0FBRyxLQUFLLFlBQVksVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUVsRixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDL0UsU0FBUyxJQUFJLE9BQU8sQ0FBQztnQkFFckIsd0RBQXdEO2dCQUN4RCxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ1osT0FBTyxJQUFJLElBQUksR0FBRyxTQUFTLENBQUM7aUJBQzVCO2dCQUVELE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUM1RTtZQUVELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNmLE9BQU8sTUFBTSxDQUFDO1NBQ2Q7YUFBTTtZQUNOLE1BQU0sTUFBTSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDNUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2YsT0FBTyxNQUFNLENBQUM7U0FDZDtJQUNGLENBQUM7SUE0Q0Q7Ozs7Ozs7Ozs7Ozs7Ozs7T0FnQkc7SUFDSCxNQUFhLFFBQVE7UUFzQnBCLElBQVksSUFBSSxLQUFpQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRXJELElBQVksSUFBSSxDQUFDLElBQWdCO1lBQ2hDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFFM0IsSUFBSSxPQUFPLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMxQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDbEI7WUFFRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQ3JELElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU87WUFDL0UsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUM1QyxDQUFDO1FBa0JEOztXQUVHO1FBQ0gsSUFBSSxLQUFLLEtBQWEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFL0M7O1dBRUc7UUFDSCxJQUFJLE1BQU0sS0FBYSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUVqRDs7V0FFRztRQUNILElBQUksWUFBWSxLQUFhLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBRTdEOztXQUVHO1FBQ0gsSUFBSSxhQUFhLEtBQWEsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFFL0Q7O1dBRUc7UUFDSCxJQUFJLFlBQVksS0FBYSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUU5RDs7V0FFRztRQUNILElBQUksYUFBYSxLQUFhLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1FBRS9ELElBQUksV0FBVyxLQUFrQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqRSxJQUFJLGNBQWMsS0FBc0IsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUV0RTs7O1dBR0c7UUFDSCxJQUFJLFdBQVcsQ0FBQyxXQUF3QjtZQUN2QyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxLQUFLLFdBQVcsRUFBRTtnQkFDM0MsT0FBTzthQUNQO1lBRUQsTUFBTSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLHdCQUF3QixFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUN0RixJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSx3QkFBd0IsRUFBRSx3QkFBd0IsRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxzQkFBc0IsRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDO1lBQzlMLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUMzQyxDQUFDO1FBRUQ7OztXQUdHO1FBQ0gsSUFBSSxjQUFjLENBQUMsY0FBK0I7WUFDakQsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7WUFDdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEdBQUcsMEJBQTBCLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN6RixDQUFDO1FBRUQ7O1dBRUc7UUFDSCxJQUFJLFlBQVksQ0FBQyxZQUFxQjtZQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDdkMsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsWUFBWSxVQUE0QixFQUFFO1lBbkhsQyx3QkFBbUIsR0FBRyxJQUFJLGFBQUssRUFBZ0IsQ0FBQztZQUNoRCxpQkFBWSxHQUFHLElBQUksYUFBSyxFQUFRLENBQUM7WUFDakMsaUJBQVksR0FBRyxJQUFJLGFBQUssRUFBeUIsQ0FBQztZQUNsRCxvQkFBZSxHQUFvQixFQUFFLENBQUM7WUFPdEMsa0JBQWEsR0FBZ0Isc0JBQVUsQ0FBQyxJQUFJLENBQUM7WUFtQnJEOztlQUVHO1lBQ00sbUJBQWMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDO1lBRXpEOzs7ZUFHRztZQUNNLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFFL0M7O2VBRUc7WUFDTSxnQkFBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBeUU5QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUEsT0FBQyxFQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLGFBQWEsQ0FBQztZQUM5QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsT0FBTyxPQUFPLENBQUMsa0JBQWtCLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDbEgsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLFVBQVUsK0JBQXVCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQy9HLENBQUM7UUFFRCxLQUFLLENBQUMsTUFBdUI7WUFDNUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUVEOzs7Ozs7Ozs7O1dBVUc7UUFDSCxNQUFNLENBQUMsS0FBYSxFQUFFLE1BQWMsRUFBRSxNQUFjLENBQUMsRUFBRSxPQUFlLENBQUM7WUFDdEUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7WUFFN0MsTUFBTSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLG1DQUEyQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3BLLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSx3QkFBd0IsRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFDL0ssQ0FBQztRQUVEOzs7Ozs7V0FNRztRQUNILE9BQU8sQ0FBQyxJQUFXLEVBQUUsSUFBcUIsRUFBRSxRQUFzQjtZQUNqRSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxhQUFhLEdBQUcsc0JBQVUsQ0FBQyxJQUFJLENBQUM7WUFFckMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxJQUFBLGNBQUksRUFBQyxRQUFRLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFbEQsSUFBSSxNQUFNLFlBQVksVUFBVSxFQUFFO2dCQUNqQyxNQUFNLElBQUksR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUU5RyxJQUFJO29CQUNILE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDbkM7Z0JBQUMsT0FBTyxHQUFHLEVBQUU7b0JBQ2IsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUNmLE1BQU0sR0FBRyxDQUFDO2lCQUNWO2FBQ0Q7aUJBQU07Z0JBQ04sTUFBTSxDQUFDLEVBQUUsV0FBVyxDQUFDLEdBQUcsSUFBQSxjQUFJLEVBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzNDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxHQUFHLElBQUEsY0FBSSxFQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVuQyxJQUFJLGNBQWMsR0FBb0IsQ0FBQyxDQUFDO2dCQUV4QyxNQUFNLDJCQUEyQixHQUFHLFdBQVcsQ0FBQyx5QkFBeUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDdkYsSUFBSSxPQUFPLDJCQUEyQixLQUFLLFFBQVEsRUFBRTtvQkFDcEQsY0FBYyxHQUFHLGtCQUFNLENBQUMsU0FBUyxDQUFDLDJCQUEyQixDQUFDLENBQUM7aUJBQy9EO2dCQUVELE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3RELFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFFbkIsTUFBTSxTQUFTLEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDbEwsV0FBVyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFFMUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFFbEQsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUU7b0JBQ3RELElBQUksR0FBRyxrQkFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDdkI7Z0JBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDN0YsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3RDO1lBRUQsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2xCLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNILFVBQVUsQ0FBQyxRQUFzQixFQUFFLE1BQXNDO1lBQ3hFLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxzQkFBVSxDQUFDLElBQUksQ0FBQztZQUVyQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLElBQUEsY0FBSSxFQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVsRCxJQUFJLENBQUMsQ0FBQyxNQUFNLFlBQVksVUFBVSxDQUFDLEVBQUU7Z0JBQ3BDLE1BQU0sSUFBSSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQzthQUNwQztZQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFcEMsSUFBSSxDQUFDLENBQUMsSUFBSSxZQUFZLFFBQVEsQ0FBQyxFQUFFO2dCQUNoQyxNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7YUFDcEM7WUFFRCxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFZixJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDakMsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2FBQ3RDO1lBRUQsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDakIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ2pCO1lBRUQsSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxFQUFFLGlCQUFpQjtnQkFDakQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFbkMsSUFBSSxPQUFPLFlBQVksUUFBUSxFQUFFO29CQUNoQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7aUJBQ2pCO2dCQUVELDZDQUE2QztnQkFDN0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEIsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNqQixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztnQkFDcEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ2pCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQzthQUNqQjtZQUVELE1BQU0sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxHQUFHLElBQUEsY0FBSSxFQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxHQUFHLElBQUEsY0FBSSxFQUFDLElBQUksQ0FBQyxDQUFDO1lBRW5DLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRCxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXRDLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlFLFdBQVcsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzdDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUVqQixJQUFJLE9BQU8sWUFBWSxVQUFVLEVBQUU7Z0JBQ2xDLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRW5FLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUVwRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDaEQsV0FBVyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQ25GO2FBQ0Q7aUJBQU07Z0JBQ04sTUFBTSxVQUFVLEdBQUcsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BILE1BQU0sTUFBTSxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxrQkFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQ3BHLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQzthQUN0RDtZQUVELE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUVsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdEMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDckM7WUFFRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDakIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ2xCLENBQUM7UUFFRDs7Ozs7O1dBTUc7UUFDSCxRQUFRLENBQUMsY0FBNEIsRUFBRSxJQUFZLEVBQUUsRUFBVTtZQUM5RCxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRWhELElBQUksQ0FBQyxDQUFDLE1BQU0sWUFBWSxVQUFVLENBQUMsRUFBRTtnQkFDcEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQ3BDO1lBRUQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFM0IsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2xCLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNILFNBQVMsQ0FBQyxJQUFrQixFQUFFLEVBQWdCO1lBQzdDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLEdBQUcsSUFBQSxjQUFJLEVBQUMsSUFBSSxDQUFDLENBQUM7WUFDekMsTUFBTSxDQUFDLEVBQUUsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUU5QyxJQUFJLENBQUMsQ0FBQyxVQUFVLFlBQVksVUFBVSxDQUFDLEVBQUU7Z0JBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQzthQUN6QztZQUVELE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDcEQsTUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVoRCxJQUFJLENBQUMsQ0FBQyxRQUFRLFlBQVksUUFBUSxDQUFDLEVBQUU7Z0JBQ3BDLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQzthQUN6QztZQUVELE1BQU0sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsSUFBQSxjQUFJLEVBQUMsRUFBRSxDQUFDLENBQUM7WUFDbkMsTUFBTSxDQUFDLEVBQUUsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUUxQyxJQUFJLENBQUMsQ0FBQyxRQUFRLFlBQVksVUFBVSxDQUFDLEVBQUU7Z0JBQ3RDLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQzthQUN2QztZQUVELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUxQyxJQUFJLENBQUMsQ0FBQyxNQUFNLFlBQVksUUFBUSxDQUFDLEVBQUU7Z0JBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQzthQUN2QztZQUVELElBQUksVUFBVSxLQUFLLFFBQVEsRUFBRTtnQkFDNUIsVUFBVSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDNUM7aUJBQU07Z0JBQ04sVUFBVSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDbEMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFOUIsVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUNqRCxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDN0M7WUFFRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDbEIsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsVUFBVSxDQUFDLFFBQXNCLEVBQUUsSUFBd0I7WUFDMUQsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxJQUFBLGNBQUksRUFBQyxRQUFRLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFbEQsSUFBSSxDQUFDLENBQUMsTUFBTSxZQUFZLFVBQVUsQ0FBQyxFQUFFO2dCQUNwQyxNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7YUFDcEM7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hDLE9BQU87YUFDUDtZQUVELE1BQU0sQ0FBQyxVQUFVLEVBQUUsZUFBZSxDQUFDLEdBQUcsTUFBTSxDQUFDLFdBQVcsbUNBQTJCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFNUksSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLElBQUksWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ25FLE1BQU0sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxHQUFHLElBQUEsY0FBSSxFQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLENBQUMsRUFBRSxXQUFXLENBQUMsR0FBRyxJQUFBLGNBQUksRUFBQyxJQUFJLENBQUMsQ0FBQztnQkFFbkMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7YUFDdEQ7WUFFRCxJQUFJLE9BQU8sVUFBVSxLQUFLLFFBQVEsRUFBRTtnQkFDbkMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFDdEM7WUFFRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDbEIsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsV0FBVyxDQUFDLFFBQXVCO1lBQ2xDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2QsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUM1RDtZQUVELE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDeEMsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbkQsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsd0JBQXdCLENBQUMsUUFBc0I7WUFDOUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxJQUFBLGNBQUksRUFBQyxRQUFRLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXRDLElBQUksQ0FBQyxDQUFDLE1BQU0sWUFBWSxVQUFVLENBQUMsRUFBRTtnQkFDcEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQ3BDO1lBRUQsT0FBTyxNQUFNLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsZ0JBQWdCLENBQUMsUUFBc0I7WUFDdEMsTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRWpELElBQUksQ0FBQyxDQUFDLElBQUksWUFBWSxRQUFRLENBQUMsRUFBRTtnQkFDaEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQ3BDO1lBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2FBQ2hFO1FBQ0YsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxtQkFBbUIsQ0FBQyxRQUFzQjtZQUN6QyxNQUFNLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFakQsSUFBSSxDQUFDLENBQUMsSUFBSSxZQUFZLFFBQVEsQ0FBQyxFQUFFO2dCQUNoQyxNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7YUFDcEM7WUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDMUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDcEQsT0FBTyxLQUFLLENBQUM7aUJBQ2I7YUFDRDtZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVEOzs7Ozs7OztXQVFHO1FBQ0gsbUJBQW1CLENBQUMsUUFBdUI7WUFDMUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwQyxPQUFPO2FBQ1A7WUFFRCxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXhDLElBQUksQ0FBQyxDQUFDLElBQUksWUFBWSxVQUFVLENBQUMsRUFBRTtnQkFDbEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQ3BDO1lBRUQsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDM0IsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2xCLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsYUFBYSxDQUFDLFFBQXNCO1lBQ25DLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsSUFBQSxjQUFJLEVBQUMsUUFBUSxDQUFDLENBQUM7WUFDckMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV0QyxJQUFJLENBQUMsQ0FBQyxNQUFNLFlBQVksVUFBVSxDQUFDLEVBQUU7Z0JBQ3BDLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQzthQUN6QztZQUVELE9BQU8sTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILGNBQWMsQ0FBQyxRQUFzQixFQUFFLE9BQWdCO1lBQ3RELE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsSUFBQSxjQUFJLEVBQUMsUUFBUSxDQUFDLENBQUM7WUFDckMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUV0QyxJQUFJLENBQUMsQ0FBQyxNQUFNLFlBQVksVUFBVSxDQUFDLEVBQUU7Z0JBQ3BDLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQzthQUN6QztZQUVELE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFlRCxPQUFPLENBQUMsUUFBdUI7WUFDOUIsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQy9ELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFRDs7Ozs7O1dBTUc7UUFDSCxNQUFNLENBQUMsV0FBVyxDQUE4QixJQUF5QixFQUFFLFlBQWtDLEVBQUUsVUFBNEIsRUFBRTtZQUM1SSxJQUFJLE9BQU8sSUFBSSxDQUFDLFdBQVcsS0FBSyxRQUFRLEVBQUU7Z0JBQ3pDLE1BQU0sSUFBSSxLQUFLLENBQUMsMERBQTBELENBQUMsQ0FBQzthQUM1RTtpQkFBTSxJQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQzFDLE1BQU0sSUFBSSxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQzthQUN0RTtpQkFBTSxJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQUU7Z0JBQzNDLE1BQU0sSUFBSSxLQUFLLENBQUMscURBQXFELENBQUMsQ0FBQzthQUN2RTtpQkFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxLQUFLLFFBQVEsRUFBRTtnQkFDeEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxxRUFBcUUsQ0FBQyxDQUFDO2FBQ3ZGO1lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNyQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBRTNCLE1BQU0sTUFBTSxHQUFHLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQTZCLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUUzRixPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTyxZQUFZLENBQUMsSUFBMkIsRUFBRSxXQUF3QixFQUFFLFlBQWtELEVBQUUsY0FBc0I7WUFDckosSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsY0FBYyxDQUFlLENBQUM7UUFDbEcsQ0FBQztRQUVPLGdCQUFnQixDQUFDLElBQXFCLEVBQUUsV0FBd0IsRUFBRSxZQUFrRCxFQUFFLGNBQXNCO1lBQ25KLElBQUksTUFBWSxDQUFDO1lBQ2pCLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQzNCLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLElBQXlCLENBQUM7Z0JBQzFELE1BQU0sUUFBUSxHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsRUFBRTtvQkFDekQsT0FBTzt3QkFDTixJQUFJLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQzlGLE9BQU8sRUFBRyxlQUF5QyxDQUFDLE9BQU87cUJBQ3hDLENBQUM7Z0JBQ3RCLENBQUMsQ0FBQyxDQUFDO2dCQUVILE1BQU0sR0FBRyxJQUFJLFVBQVUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUNsSjtpQkFBTTtnQkFDTixNQUFNLEdBQUcsSUFBSSxRQUFRLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3ZIO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRU8sU0FBUyxDQUFDLElBQVUsRUFBRSxXQUF3QixFQUFFLGlCQUEwQjtZQUNqRixNQUFNLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFdkYsSUFBSSxJQUFJLFlBQVksUUFBUSxFQUFFO2dCQUM3QixPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLGlCQUFpQixFQUFFLENBQUM7YUFDbkQ7WUFFRCxNQUFNLFFBQVEsR0FBZSxFQUFFLENBQUM7WUFFaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM5QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFNUQsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2FBQ2pGO1lBRUQsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRU8sT0FBTyxDQUFDLFFBQXNCLEVBQUUsT0FBYSxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQXFCLEVBQUU7WUFDdEYsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDMUIsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzthQUNwQjtZQUVELElBQUksQ0FBQyxDQUFDLElBQUksWUFBWSxVQUFVLENBQUMsRUFBRTtnQkFDbEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQ3BDO1lBRUQsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQztZQUVsQyxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO2dCQUMvQyxNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7YUFDcEM7WUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFaEIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVEOzs7Ozs7V0FNRztRQUNILFNBQVM7WUFDUixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxhQUFhLEdBQUcsc0JBQVUsQ0FBQyxJQUFJLENBQUM7WUFFckMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNwQyxPQUFPO2FBQ1A7WUFFRCxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBRTNDLElBQUksQ0FBQyxDQUFDLEtBQUssWUFBWSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxZQUFZLFVBQVUsQ0FBQyxFQUFFO2dCQUN0RSxPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVEOzs7V0FHRztRQUNILFVBQVUsQ0FBQyxHQUE0QixFQUFFLElBQVc7WUFDbkQsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDVixJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQzthQUNqQjtZQUVELElBQUksSUFBSSxZQUFZLFVBQVUsRUFBRTtnQkFDL0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQzVEO2lCQUFNO2dCQUNOLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDakM7UUFDRixDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkQsQ0FBQztLQUNEO0lBcnFCRCw0QkFxcUJDIn0=