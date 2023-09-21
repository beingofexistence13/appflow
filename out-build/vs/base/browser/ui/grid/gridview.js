/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/splitview/splitview", "vs/base/common/arrays", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/types", "vs/base/browser/ui/sash/sash", "vs/base/browser/ui/splitview/splitview", "vs/css!./gridview"], function (require, exports, dom_1, splitview_1, arrays_1, color_1, event_1, lifecycle_1, numbers_1, types_1, sash_1, splitview_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$eR = exports.$dR = exports.$cR = exports.Sizing = exports.LayoutPriority = exports.Orientation = void 0;
    Object.defineProperty(exports, "Orientation", { enumerable: true, get: function () { return sash_1.Orientation; } });
    Object.defineProperty(exports, "LayoutPriority", { enumerable: true, get: function () { return splitview_2.LayoutPriority; } });
    Object.defineProperty(exports, "Sizing", { enumerable: true, get: function () { return splitview_2.Sizing; } });
    const defaultStyles = {
        separatorBorder: color_1.$Os.transparent
    };
    function $cR(orientation) {
        return orientation === 0 /* Orientation.VERTICAL */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */;
    }
    exports.$cR = $cR;
    function $dR(node) {
        return !!node.children;
    }
    exports.$dR = $dR;
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
        get size() { return this.b; }
        get orthogonalSize() { return this.d; }
        get absoluteOffset() { return this.f; }
        get absoluteOrthogonalOffset() { return this.g; }
        get styles() { return this.j; }
        get width() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.size : this.orthogonalSize;
        }
        get height() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.orthogonalSize : this.size;
        }
        get top() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.f : this.g;
        }
        get left() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.g : this.f;
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
            return this.a.minimumSize;
        }
        get maximumOrthogonalSize() {
            return this.a.maximumSize;
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
        get boundarySashes() { return this.s; }
        set boundarySashes(boundarySashes) {
            if (this.s.start === boundarySashes.start
                && this.s.end === boundarySashes.end
                && this.s.orthogonalStart === boundarySashes.orthogonalStart
                && this.s.orthogonalEnd === boundarySashes.orthogonalEnd) {
                return;
            }
            this.s = boundarySashes;
            this.a.orthogonalStartSash = boundarySashes.orthogonalStart;
            this.a.orthogonalEndSash = boundarySashes.orthogonalEnd;
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
        get edgeSnapping() { return this.t; }
        set edgeSnapping(edgeSnapping) {
            if (this.t === edgeSnapping) {
                return;
            }
            this.t = edgeSnapping;
            for (const child of this.children) {
                if (child instanceof BranchNode) {
                    child.edgeSnapping = edgeSnapping;
                }
            }
            this.x();
        }
        constructor(orientation, layoutController, styles, splitviewProportionalLayout, size = 0, orthogonalSize = 0, edgeSnapping = false, childDescriptors) {
            this.orientation = orientation;
            this.layoutController = layoutController;
            this.splitviewProportionalLayout = splitviewProportionalLayout;
            this.children = [];
            this.f = 0;
            this.g = 0;
            this.h = 0;
            this.k = new event_1.$fd();
            this.onDidChange = this.k.event;
            this.l = new event_1.$fd();
            this.m = lifecycle_1.$kc.None;
            this.onDidScroll = this.l.event;
            this.n = lifecycle_1.$kc.None;
            this.o = new event_1.$fd();
            this.onDidSashReset = this.o.event;
            this.q = lifecycle_1.$kc.None;
            this.r = lifecycle_1.$kc.None;
            this.s = {};
            this.t = false;
            this.j = styles;
            this.b = size;
            this.d = orthogonalSize;
            this.element = (0, dom_1.$)('.monaco-grid-branch-node');
            if (!childDescriptors) {
                // Normal behavior, we have no children yet, just set up the splitview
                this.a = new splitview_1.$bR(this.element, { orientation, styles, proportionalLayout: splitviewProportionalLayout });
                this.a.layout(size, { orthogonalSize, absoluteOffset: 0, absoluteOrthogonalOffset: 0, absoluteSize: size, absoluteOrthogonalSize: orthogonalSize });
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
                this.a = new splitview_1.$bR(this.element, { ...options, descriptor });
                this.children.forEach((node, index) => {
                    const first = index === 0;
                    const last = index === this.children.length;
                    node.boundarySashes = {
                        start: this.boundarySashes.orthogonalStart,
                        end: this.boundarySashes.orthogonalEnd,
                        orthogonalStart: first ? this.boundarySashes.start : this.a.sashes[index - 1],
                        orthogonalEnd: last ? this.boundarySashes.end : this.a.sashes[index],
                    };
                });
            }
            const onDidSashReset = event_1.Event.map(this.a.onDidSashReset, i => [i]);
            this.q = onDidSashReset(this.o.fire, this.o);
            this.w();
        }
        style(styles) {
            this.j = styles;
            this.a.style(styles);
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
            this.b = ctx.orthogonalSize;
            this.d = size;
            this.f = ctx.absoluteOffset + offset;
            this.g = ctx.absoluteOrthogonalOffset;
            this.h = ctx.absoluteOrthogonalSize;
            this.a.layout(ctx.orthogonalSize, {
                orthogonalSize: size,
                absoluteOffset: this.g,
                absoluteOrthogonalOffset: this.f,
                absoluteSize: ctx.absoluteOrthogonalSize,
                absoluteOrthogonalSize: ctx.absoluteSize
            });
            this.x();
        }
        setVisible(visible) {
            for (const child of this.children) {
                child.setVisible(visible);
            }
        }
        addChild(node, size, index, skipLayout) {
            index = validateIndex(index, this.children.length);
            this.a.addView(node, size, index, skipLayout);
            this.children.splice(index, 0, node);
            this.u();
            this.v();
        }
        removeChild(index, sizing) {
            index = validateIndex(index, this.children.length);
            const result = this.a.removeView(index, sizing);
            this.children.splice(index, 1);
            this.u();
            this.v();
            return result;
        }
        removeAllChildren() {
            const result = this.a.removeAllViews();
            this.children.splice(0, this.children.length);
            this.u();
            this.v();
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
            this.a.moveView(from, to);
            this.children.splice(to, 0, this.children.splice(from, 1)[0]);
            this.u();
            this.v();
        }
        swapChildren(from, to) {
            from = validateIndex(from, this.children.length);
            to = validateIndex(to, this.children.length);
            if (from === to) {
                return;
            }
            this.a.swapViews(from, to);
            // swap boundary sashes
            [this.children[from].boundarySashes, this.children[to].boundarySashes]
                = [this.children[from].boundarySashes, this.children[to].boundarySashes];
            // swap children
            [this.children[from], this.children[to]] = [this.children[to], this.children[from]];
            this.v();
        }
        resizeChild(index, size) {
            index = validateIndex(index, this.children.length);
            this.a.resizeView(index, size);
        }
        isChildSizeMaximized(index) {
            return this.a.isViewSizeMaximized(index);
        }
        distributeViewSizes(recursive = false) {
            this.a.distributeViewSizes();
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
            return this.a.getViewSize(index);
        }
        isChildVisible(index) {
            index = validateIndex(index, this.children.length);
            return this.a.isViewVisible(index);
        }
        setChildVisible(index, visible) {
            index = validateIndex(index, this.children.length);
            if (this.a.isViewVisible(index) === visible) {
                return;
            }
            this.a.setViewVisible(index, visible);
        }
        getChildCachedVisibleSize(index) {
            index = validateIndex(index, this.children.length);
            return this.a.getViewCachedVisibleSize(index);
        }
        u() {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].boundarySashes = {
                    start: this.boundarySashes.orthogonalStart,
                    end: this.boundarySashes.orthogonalEnd,
                    orthogonalStart: i === 0 ? this.boundarySashes.start : this.a.sashes[i - 1],
                    orthogonalEnd: i === this.children.length - 1 ? this.boundarySashes.end : this.a.sashes[i],
                };
            }
        }
        v() {
            this.w();
            this.k.fire(undefined);
        }
        w() {
            const onDidChildrenChange = event_1.Event.map(event_1.Event.any(...this.children.map(c => c.onDidChange)), () => undefined);
            this.n.dispose();
            this.n = onDidChildrenChange(this.k.fire, this.k);
            const onDidChildrenSashReset = event_1.Event.any(...this.children.map((c, i) => event_1.Event.map(c.onDidSashReset, location => [i, ...location])));
            this.r.dispose();
            this.r = onDidChildrenSashReset(this.o.fire, this.o);
            const onDidScroll = event_1.Event.any(event_1.Event.signal(this.a.onDidScroll), ...this.children.map(c => c.onDidScroll));
            this.m.dispose();
            this.m = onDidScroll(this.l.fire, this.l);
        }
        trySet2x2(other) {
            if (this.children.length !== 2 || other.children.length !== 2) {
                return lifecycle_1.$kc.None;
            }
            if (this.getChildSize(0) !== other.getChildSize(0)) {
                return lifecycle_1.$kc.None;
            }
            const [firstChild, secondChild] = this.children;
            const [otherFirstChild, otherSecondChild] = other.children;
            if (!(firstChild instanceof LeafNode) || !(secondChild instanceof LeafNode)) {
                return lifecycle_1.$kc.None;
            }
            if (!(otherFirstChild instanceof LeafNode) || !(otherSecondChild instanceof LeafNode)) {
                return lifecycle_1.$kc.None;
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
            const mySash = this.a.sashes[0];
            const otherSash = other.a.sashes[0];
            mySash.linkedSash = otherSash;
            otherSash.linkedSash = mySash;
            this.k.fire(undefined);
            other.k.fire(undefined);
            return (0, lifecycle_1.$ic)(() => {
                mySash.linkedSash = otherSash.linkedSash = undefined;
                firstChild.linkedHeightNode = firstChild.linkedWidthNode = undefined;
                secondChild.linkedHeightNode = secondChild.linkedWidthNode = undefined;
                otherFirstChild.linkedHeightNode = otherFirstChild.linkedWidthNode = undefined;
                otherSecondChild.linkedHeightNode = otherSecondChild.linkedWidthNode = undefined;
            });
        }
        x() {
            this.a.startSnappingEnabled = this.t || this.g > 0;
            this.a.endSnappingEnabled = this.t || this.g + this.b < this.h;
        }
        dispose() {
            for (const child of this.children) {
                child.dispose();
            }
            this.k.dispose();
            this.o.dispose();
            this.q.dispose();
            this.r.dispose();
            this.n.dispose();
            this.m.dispose();
            this.a.dispose();
        }
    }
    /**
     * Creates a latched event that avoids being fired when the view
     * constraints do not change at all.
     */
    function createLatchedOnDidChangeViewEvent(view) {
        const [onDidChangeViewConstraints, onDidSetViewSize] = event_1.Event.split(view.onDidChange, types_1.$qf);
        return event_1.Event.any(onDidSetViewSize, event_1.Event.map(event_1.Event.latch(event_1.Event.map(onDidChangeViewConstraints, _ => ([view.minimumWidth, view.maximumWidth, view.minimumHeight, view.maximumHeight])), arrays_1.$sb), _ => undefined));
    }
    class LeafNode {
        get size() { return this.a; }
        get orthogonalSize() { return this.b; }
        get linkedWidthNode() { return this.h; }
        set linkedWidthNode(node) {
            this.g.input = node ? node.m : event_1.Event.None;
            this.h = node;
            this.l.fire(undefined);
        }
        get linkedHeightNode() { return this.k; }
        set linkedHeightNode(node) {
            this.j.input = node ? node.m : event_1.Event.None;
            this.k = node;
            this.l.fire(undefined);
        }
        constructor(view, orientation, layoutController, orthogonalSize, size = 0) {
            this.view = view;
            this.orientation = orientation;
            this.layoutController = layoutController;
            this.a = 0;
            this.d = 0;
            this.f = 0;
            this.onDidScroll = event_1.Event.None;
            this.onDidSashReset = event_1.Event.None;
            this.g = new event_1.$od();
            this.h = undefined;
            this.j = new event_1.$od();
            this.k = undefined;
            this.l = new event_1.$fd();
            this.n = new lifecycle_1.$jc();
            this.t = {};
            this.u = 0;
            this.v = 0;
            this.w = 0;
            this.x = 0;
            this.b = orthogonalSize;
            this.a = size;
            const onDidChange = createLatchedOnDidChangeViewEvent(view);
            this.m = event_1.Event.map(onDidChange, e => e && (this.orientation === 0 /* Orientation.VERTICAL */ ? e.width : e.height), this.n);
            this.onDidChange = event_1.Event.any(this.m, this.l.event, this.g.event, this.j.event);
        }
        get width() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.orthogonalSize : this.size;
        }
        get height() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.size : this.orthogonalSize;
        }
        get top() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.d : this.f;
        }
        get left() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.f : this.d;
        }
        get element() {
            return this.view.element;
        }
        get o() {
            return this.linkedWidthNode ? Math.max(this.linkedWidthNode.view.minimumWidth, this.view.minimumWidth) : this.view.minimumWidth;
        }
        get q() {
            return this.linkedWidthNode ? Math.min(this.linkedWidthNode.view.maximumWidth, this.view.maximumWidth) : this.view.maximumWidth;
        }
        get r() {
            return this.linkedHeightNode ? Math.max(this.linkedHeightNode.view.minimumHeight, this.view.minimumHeight) : this.view.minimumHeight;
        }
        get s() {
            return this.linkedHeightNode ? Math.min(this.linkedHeightNode.view.maximumHeight, this.view.maximumHeight) : this.view.maximumHeight;
        }
        get minimumSize() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.r : this.o;
        }
        get maximumSize() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.s : this.q;
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
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.o : this.r;
        }
        get maximumOrthogonalSize() {
            return this.orientation === 1 /* Orientation.HORIZONTAL */ ? this.q : this.s;
        }
        get boundarySashes() { return this.t; }
        set boundarySashes(boundarySashes) {
            this.t = boundarySashes;
            this.view.setBoundarySashes?.(toAbsoluteBoundarySashes(boundarySashes, this.orientation));
        }
        layout(size, offset, ctx) {
            if (!this.layoutController.isLayoutEnabled) {
                return;
            }
            if (typeof ctx === 'undefined') {
                throw new Error('Invalid state');
            }
            this.a = size;
            this.b = ctx.orthogonalSize;
            this.d = ctx.absoluteOffset + offset;
            this.f = ctx.absoluteOrthogonalOffset;
            this.y(this.width, this.height, this.top, this.left);
        }
        y(width, height, top, left) {
            if (this.u === width && this.v === height && this.w === top && this.x === left) {
                return;
            }
            this.u = width;
            this.v = height;
            this.w = top;
            this.x = left;
            this.view.layout(width, height, top, left);
        }
        setVisible(visible) {
            this.view.setVisible?.(visible);
        }
        dispose() {
            this.n.dispose();
        }
    }
    function flipNode(node, size, orthogonalSize) {
        if (node instanceof BranchNode) {
            const result = new BranchNode($cR(node.orientation), node.layoutController, node.styles, node.splitviewProportionalLayout, size, orthogonalSize, node.edgeSnapping);
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
            const result = new LeafNode(node.view, $cR(node.orientation), node.layoutController, orthogonalSize);
            node.dispose();
            return result;
        }
    }
    /**
     * The {@link $eR} is the UI component which implements a two dimensional
     * flex-like layout algorithm for a collection of {@link IView} instances, which
     * are mostly HTMLElement instances with size constraints. A {@link $eR} is a
     * tree composition of multiple {@link $bR} instances, orthogonal between
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
    class $eR {
        get m() { return this.d; }
        set m(root) {
            const oldRoot = this.d;
            if (oldRoot) {
                this.element.removeChild(oldRoot.element);
                oldRoot.dispose();
            }
            this.d = root;
            this.element.appendChild(root.element);
            this.f.input = root.onDidSashReset;
            this.h.input = event_1.Event.map(root.onDidChange, () => undefined); // TODO
            this.g.input = root.onDidScroll;
        }
        /**
         * The width of the grid.
         */
        get width() { return this.m.width; }
        /**
         * The height of the grid.
         */
        get height() { return this.m.height; }
        /**
         * The minimum width of the grid.
         */
        get minimumWidth() { return this.m.minimumWidth; }
        /**
         * The minimum height of the grid.
         */
        get minimumHeight() { return this.m.minimumHeight; }
        /**
         * The maximum width of the grid.
         */
        get maximumWidth() { return this.m.maximumHeight; }
        /**
         * The maximum height of the grid.
         */
        get maximumHeight() { return this.m.maximumHeight; }
        get orientation() { return this.d.orientation; }
        get boundarySashes() { return this.j; }
        /**
         * The orientation of the grid. Matches the orientation of the root
         * {@link $bR} in the grid's tree model.
         */
        set orientation(orientation) {
            if (this.d.orientation === orientation) {
                return;
            }
            const { size, orthogonalSize, absoluteOffset, absoluteOrthogonalOffset } = this.d;
            this.m = flipNode(this.d, orthogonalSize, size);
            this.m.layout(size, 0, { orthogonalSize, absoluteOffset: absoluteOrthogonalOffset, absoluteOrthogonalOffset: absoluteOffset, absoluteSize: size, absoluteOrthogonalSize: orthogonalSize });
            this.boundarySashes = this.boundarySashes;
        }
        /**
         * A collection of sashes perpendicular to each edge of the grid.
         * Corner sashes will be created for each intersection.
         */
        set boundarySashes(boundarySashes) {
            this.j = boundarySashes;
            this.m.boundarySashes = fromAbsoluteBoundarySashes(boundarySashes, this.orientation);
        }
        /**
         * Enable/disable edge snapping across all grid views.
         */
        set edgeSnapping(edgeSnapping) {
            this.m.edgeSnapping = edgeSnapping;
        }
        /**
         * Create a new {@link $eR} instance.
         *
         * @remarks It's the caller's responsibility to append the
         * {@link $eR.element} to the page's DOM.
         */
        constructor(options = {}) {
            this.f = new event_1.$od();
            this.g = new event_1.$od();
            this.h = new event_1.$od();
            this.j = {};
            this.l = lifecycle_1.$kc.None;
            /**
             * Fires whenever the user double clicks a {@link $aR sash}.
             */
            this.onDidSashReset = this.f.event;
            /**
             * Fires whenever the user scrolls a {@link $bR} within
             * the grid.
             */
            this.onDidScroll = this.g.event;
            /**
             * Fires whenever a view within the grid changes its size constraints.
             */
            this.onDidChange = this.h.event;
            this.element = (0, dom_1.$)('.monaco-grid-view');
            this.a = options.styles || defaultStyles;
            this.b = typeof options.proportionalLayout !== 'undefined' ? !!options.proportionalLayout : true;
            this.k = new LayoutController(false);
            this.m = new BranchNode(0 /* Orientation.VERTICAL */, this.k, this.a, this.b);
        }
        style(styles) {
            this.a = styles;
            this.m.style(styles);
        }
        /**
         * Layout the {@link $eR}.
         *
         * Optionally provide a `top` and `left` positions, those will propagate
         * as an origin for positions passed to {@link IView.layout}.
         *
         * @param width The width of the {@link $eR}.
         * @param height The height of the {@link $eR}.
         * @param top Optional, the top location of the {@link $eR}.
         * @param left Optional, the left location of the {@link $eR}.
         */
        layout(width, height, top = 0, left = 0) {
            this.k.isLayoutEnabled = true;
            const [size, orthogonalSize, offset, orthogonalOffset] = this.m.orientation === 1 /* Orientation.HORIZONTAL */ ? [height, width, top, left] : [width, height, left, top];
            this.m.layout(size, 0, { orthogonalSize, absoluteOffset: offset, absoluteOrthogonalOffset: orthogonalOffset, absoluteSize: size, absoluteOrthogonalSize: orthogonalSize });
        }
        /**
         * Add a {@link IView view} to this {@link $eR}.
         *
         * @param view The view to add.
         * @param size Either a fixed size, or a dynamic {@link Sizing} strategy.
         * @param location The {@link GridLocation location} to insert the view on.
         */
        addView(view, size, location) {
            this.l.dispose();
            this.l = lifecycle_1.$kc.None;
            const [rest, index] = (0, arrays_1.$rb)(location);
            const [pathToParent, parent] = this.r(rest);
            if (parent instanceof BranchNode) {
                const node = new LeafNode(view, $cR(parent.orientation), this.k, parent.orthogonalSize);
                try {
                    parent.addChild(node, size, index);
                }
                catch (err) {
                    node.dispose();
                    throw err;
                }
            }
            else {
                const [, grandParent] = (0, arrays_1.$rb)(pathToParent);
                const [, parentIndex] = (0, arrays_1.$rb)(rest);
                let newSiblingSize = 0;
                const newSiblingCachedVisibleSize = grandParent.getChildCachedVisibleSize(parentIndex);
                if (typeof newSiblingCachedVisibleSize === 'number') {
                    newSiblingSize = splitview_1.Sizing.Invisible(newSiblingCachedVisibleSize);
                }
                const oldChild = grandParent.removeChild(parentIndex);
                oldChild.dispose();
                const newParent = new BranchNode(parent.orientation, parent.layoutController, this.a, this.b, parent.size, parent.orthogonalSize, grandParent.edgeSnapping);
                grandParent.addChild(newParent, parent.size, parentIndex);
                const newSibling = new LeafNode(parent.view, grandParent.orientation, this.k, parent.size);
                newParent.addChild(newSibling, newSiblingSize, 0);
                if (typeof size !== 'number' && size.type === 'split') {
                    size = splitview_1.Sizing.Split(0);
                }
                const node = new LeafNode(view, grandParent.orientation, this.k, parent.size);
                newParent.addChild(node, size, index);
            }
            this.trySet2x2();
        }
        /**
         * Remove a {@link IView view} from this {@link $eR}.
         *
         * @param location The {@link GridLocation location} of the {@link IView view}.
         * @param sizing Whether to distribute other {@link IView view}'s sizes.
         */
        removeView(location, sizing) {
            this.l.dispose();
            this.l = lifecycle_1.$kc.None;
            const [rest, index] = (0, arrays_1.$rb)(location);
            const [pathToParent, parent] = this.r(rest);
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
                this.m = sibling;
                this.boundarySashes = this.boundarySashes;
                this.trySet2x2();
                return node.view;
            }
            const [, grandParent] = (0, arrays_1.$rb)(pathToParent);
            const [, parentIndex] = (0, arrays_1.$rb)(rest);
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
                const newSibling = new LeafNode(sibling.view, $cR(sibling.orientation), this.k, sibling.size);
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
            const [, parent] = this.r(parentLocation);
            if (!(parent instanceof BranchNode)) {
                throw new Error('Invalid location');
            }
            parent.moveChild(from, to);
            this.trySet2x2();
        }
        /**
         * Swap two {@link IView views} within the {@link $eR}.
         *
         * @param from The {@link GridLocation location} of one view.
         * @param to The {@link GridLocation location} of another view.
         */
        swapViews(from, to) {
            const [fromRest, fromIndex] = (0, arrays_1.$rb)(from);
            const [, fromParent] = this.r(fromRest);
            if (!(fromParent instanceof BranchNode)) {
                throw new Error('Invalid from location');
            }
            const fromSize = fromParent.getChildSize(fromIndex);
            const fromNode = fromParent.children[fromIndex];
            if (!(fromNode instanceof LeafNode)) {
                throw new Error('Invalid from location');
            }
            const [toRest, toIndex] = (0, arrays_1.$rb)(to);
            const [, toParent] = this.r(toRest);
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
            const [rest, index] = (0, arrays_1.$rb)(location);
            const [pathToParent, parent] = this.r(rest);
            if (!(parent instanceof BranchNode)) {
                throw new Error('Invalid location');
            }
            if (!size.width && !size.height) {
                return;
            }
            const [parentSize, grandParentSize] = parent.orientation === 1 /* Orientation.HORIZONTAL */ ? [size.width, size.height] : [size.height, size.width];
            if (typeof grandParentSize === 'number' && pathToParent.length > 0) {
                const [, grandParent] = (0, arrays_1.$rb)(pathToParent);
                const [, parentIndex] = (0, arrays_1.$rb)(rest);
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
                return { width: this.m.width, height: this.m.height };
            }
            const [, node] = this.r(location);
            return { width: node.width, height: node.height };
        }
        /**
         * Get the cached visible size of a {@link IView view}. This was the size
         * of the view at the moment it last became hidden.
         *
         * @param location The {@link GridLocation location} of the view.
         */
        getViewCachedVisibleSize(location) {
            const [rest, index] = (0, arrays_1.$rb)(location);
            const [, parent] = this.r(rest);
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
            const [ancestors, node] = this.r(location);
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
            const [ancestors, node] = this.r(location);
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
         * grid or within a single {@link $bR}.
         *
         * @param location The {@link GridLocation location} of a view containing
         * children views, which will have their sizes distributed within the parent
         * view's size. Provide `undefined` to recursively distribute all views' sizes
         * in the entire grid.
         */
        distributeViewSizes(location) {
            if (!location) {
                this.m.distributeViewSizes(true);
                return;
            }
            const [, node] = this.r(location);
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
            const [rest, index] = (0, arrays_1.$rb)(location);
            const [, parent] = this.r(rest);
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
            const [rest, index] = (0, arrays_1.$rb)(location);
            const [, parent] = this.r(rest);
            if (!(parent instanceof BranchNode)) {
                throw new Error('Invalid from location');
            }
            parent.setChildVisible(index, visible);
        }
        getView(location) {
            const node = location ? this.r(location)[1] : this.d;
            return this.q(node, this.orientation);
        }
        /**
         * Construct a new {@link $eR} from a JSON object.
         *
         * @param json The JSON object.
         * @param deserializer A deserializer which can revive each view.
         * @returns A new {@link $eR} instance.
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
            const result = new $eR(options);
            result.n(json.root, orientation, deserializer, height);
            return result;
        }
        n(root, orientation, deserializer, orthogonalSize) {
            this.m = this.o(root, orientation, deserializer, orthogonalSize);
        }
        o(node, orientation, deserializer, orthogonalSize) {
            let result;
            if (node.type === 'branch') {
                const serializedChildren = node.data;
                const children = serializedChildren.map(serializedChild => {
                    return {
                        node: this.o(serializedChild, $cR(orientation), deserializer, node.size),
                        visible: serializedChild.visible
                    };
                });
                result = new BranchNode(orientation, this.k, this.a, this.b, node.size, orthogonalSize, undefined, children);
            }
            else {
                result = new LeafNode(deserializer.fromJSON(node.data), orientation, this.k, orthogonalSize, node.size);
            }
            return result;
        }
        q(node, orientation, cachedVisibleSize) {
            const box = { top: node.top, left: node.left, width: node.width, height: node.height };
            if (node instanceof LeafNode) {
                return { view: node.view, box, cachedVisibleSize };
            }
            const children = [];
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                const cachedVisibleSize = node.getChildCachedVisibleSize(i);
                children.push(this.q(child, $cR(orientation), cachedVisibleSize));
            }
            return { children, box };
        }
        r(location, node = this.m, path = []) {
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
            return this.r(rest, child, path);
        }
        /**
         * Attempt to lock the {@link $aR sashes} in this {@link $eR} so
         * the grid behaves as a 2x2 matrix, with a corner sash in the middle.
         *
         * In case the grid isn't a 2x2 grid _and_ all sashes are not aligned,
         * this method is a no-op.
         */
        trySet2x2() {
            this.l.dispose();
            this.l = lifecycle_1.$kc.None;
            if (this.m.children.length !== 2) {
                return;
            }
            const [first, second] = this.m.children;
            if (!(first instanceof BranchNode) || !(second instanceof BranchNode)) {
                return;
            }
            this.l = first.trySet2x2(second);
        }
        /**
         * Populate a map with views to DOM nodes.
         * @remarks To be used internally only.
         */
        getViewMap(map, node) {
            if (!node) {
                node = this.m;
            }
            if (node instanceof BranchNode) {
                node.children.forEach(child => this.getViewMap(map, child));
            }
            else {
                map.set(node.view, node.element);
            }
        }
        dispose() {
            this.f.dispose();
            this.m.dispose();
            this.element.parentElement?.removeChild(this.element);
        }
    }
    exports.$eR = $eR;
});
//# sourceMappingURL=gridview.js.map