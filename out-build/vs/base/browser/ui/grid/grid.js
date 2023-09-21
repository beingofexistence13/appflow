/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/lifecycle", "./gridview", "./gridview", "vs/css!./gridview"], function (require, exports, arrays_1, lifecycle_1, gridview_1, gridview_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$kR = exports.$jR = exports.$iR = exports.$hR = exports.Sizing = exports.$gR = exports.$fR = exports.Direction = exports.orthogonal = exports.Orientation = exports.LayoutPriority = void 0;
    Object.defineProperty(exports, "LayoutPriority", { enumerable: true, get: function () { return gridview_2.LayoutPriority; } });
    Object.defineProperty(exports, "Orientation", { enumerable: true, get: function () { return gridview_2.Orientation; } });
    Object.defineProperty(exports, "orthogonal", { enumerable: true, get: function () { return gridview_2.$cR; } });
    var Direction;
    (function (Direction) {
        Direction[Direction["Up"] = 0] = "Up";
        Direction[Direction["Down"] = 1] = "Down";
        Direction[Direction["Left"] = 2] = "Left";
        Direction[Direction["Right"] = 3] = "Right";
    })(Direction || (exports.Direction = Direction = {}));
    function oppositeDirection(direction) {
        switch (direction) {
            case 0 /* Direction.Up */: return 1 /* Direction.Down */;
            case 1 /* Direction.Down */: return 0 /* Direction.Up */;
            case 2 /* Direction.Left */: return 3 /* Direction.Right */;
            case 3 /* Direction.Right */: return 2 /* Direction.Left */;
        }
    }
    function $fR(node) {
        return !!node.children;
    }
    exports.$fR = $fR;
    function getGridNode(node, location) {
        if (location.length === 0) {
            return node;
        }
        if (!$fR(node)) {
            throw new Error('Invalid location');
        }
        const [index, ...rest] = location;
        return getGridNode(node.children[index], rest);
    }
    function intersects(one, other) {
        return !(one.start >= other.end || other.start >= one.end);
    }
    function getBoxBoundary(box, direction) {
        const orientation = getDirectionOrientation(direction);
        const offset = direction === 0 /* Direction.Up */ ? box.top :
            direction === 3 /* Direction.Right */ ? box.left + box.width :
                direction === 1 /* Direction.Down */ ? box.top + box.height :
                    box.left;
        const range = {
            start: orientation === 1 /* Orientation.HORIZONTAL */ ? box.top : box.left,
            end: orientation === 1 /* Orientation.HORIZONTAL */ ? box.top + box.height : box.left + box.width
        };
        return { offset, range };
    }
    function findAdjacentBoxLeafNodes(boxNode, direction, boundary) {
        const result = [];
        function _(boxNode, direction, boundary) {
            if ($fR(boxNode)) {
                for (const child of boxNode.children) {
                    _(child, direction, boundary);
                }
            }
            else {
                const { offset, range } = getBoxBoundary(boxNode.box, direction);
                if (offset === boundary.offset && intersects(range, boundary.range)) {
                    result.push(boxNode);
                }
            }
        }
        _(boxNode, direction, boundary);
        return result;
    }
    function getLocationOrientation(rootOrientation, location) {
        return location.length % 2 === 0 ? (0, gridview_1.$cR)(rootOrientation) : rootOrientation;
    }
    function getDirectionOrientation(direction) {
        return direction === 0 /* Direction.Up */ || direction === 1 /* Direction.Down */ ? 0 /* Orientation.VERTICAL */ : 1 /* Orientation.HORIZONTAL */;
    }
    function $gR(rootOrientation, location, direction) {
        const orientation = getLocationOrientation(rootOrientation, location);
        const directionOrientation = getDirectionOrientation(direction);
        if (orientation === directionOrientation) {
            let [rest, index] = (0, arrays_1.$rb)(location);
            if (direction === 3 /* Direction.Right */ || direction === 1 /* Direction.Down */) {
                index += 1;
            }
            return [...rest, index];
        }
        else {
            const index = (direction === 3 /* Direction.Right */ || direction === 1 /* Direction.Down */) ? 1 : 0;
            return [...location, index];
        }
    }
    exports.$gR = $gR;
    function indexInParent(element) {
        const parentElement = element.parentElement;
        if (!parentElement) {
            throw new Error('Invalid grid element');
        }
        let el = parentElement.firstElementChild;
        let index = 0;
        while (el !== element && el !== parentElement.lastElementChild && el) {
            el = el.nextElementSibling;
            index++;
        }
        return index;
    }
    /**
     * Find the grid location of a specific DOM element by traversing the parent
     * chain and finding each child index on the way.
     *
     * This will break as soon as DOM structures of the Splitview or Gridview change.
     */
    function getGridLocation(element) {
        const parentElement = element.parentElement;
        if (!parentElement) {
            throw new Error('Invalid grid element');
        }
        if (/\bmonaco-grid-view\b/.test(parentElement.className)) {
            return [];
        }
        const index = indexInParent(parentElement);
        const ancestor = parentElement.parentElement.parentElement.parentElement.parentElement;
        return [...getGridLocation(ancestor), index];
    }
    var Sizing;
    (function (Sizing) {
        Sizing.Distribute = { type: 'distribute' };
        Sizing.Split = { type: 'split' };
        Sizing.Auto = { type: 'auto' };
        function Invisible(cachedVisibleSize) { return { type: 'invisible', cachedVisibleSize }; }
        Sizing.Invisible = Invisible;
    })(Sizing || (exports.Sizing = Sizing = {}));
    /**
     * The {@link $hR} exposes a Grid widget in a friendlier API than the underlying
     * {@link $eR} widget. Namely, all mutation operations are addressed by the
     * model elements, rather than indexes.
     *
     * It support the same features as the {@link $eR}.
     */
    class $hR extends lifecycle_1.$kc {
        /**
         * The orientation of the grid. Matches the orientation of the root
         * {@link $bR} in the grid's {@link GridLocation} model.
         */
        get orientation() { return this.a.orientation; }
        set orientation(orientation) { this.a.orientation = orientation; }
        /**
         * The width of the grid.
         */
        get width() { return this.a.width; }
        /**
         * The height of the grid.
         */
        get height() { return this.a.height; }
        /**
         * The minimum width of the grid.
         */
        get minimumWidth() { return this.a.minimumWidth; }
        /**
         * The minimum height of the grid.
         */
        get minimumHeight() { return this.a.minimumHeight; }
        /**
         * The maximum width of the grid.
         */
        get maximumWidth() { return this.a.maximumWidth; }
        /**
         * The maximum height of the grid.
         */
        get maximumHeight() { return this.a.maximumHeight; }
        /**
         * A collection of sashes perpendicular to each edge of the grid.
         * Corner sashes will be created for each intersection.
         */
        get boundarySashes() { return this.a.boundarySashes; }
        set boundarySashes(boundarySashes) { this.a.boundarySashes = boundarySashes; }
        /**
         * Enable/disable edge snapping across all grid views.
         */
        set edgeSnapping(edgeSnapping) { this.a.edgeSnapping = edgeSnapping; }
        /**
         * The DOM element for this view.
         */
        get element() { return this.a.element; }
        /**
         * Create a new {@link $hR}. A grid must *always* have a view
         * inside.
         *
         * @param view An initial view for this Grid.
         */
        constructor(view, options = {}) {
            super();
            this.b = new Map();
            this.f = false;
            if (view instanceof gridview_1.$eR) {
                this.a = view;
                this.a.getViewMap(this.b);
            }
            else {
                this.a = new gridview_1.$eR(options);
            }
            this.B(this.a);
            this.B(this.a.onDidSashReset(this.m, this));
            if (!(view instanceof gridview_1.$eR)) {
                this.h(view, 0, [0]);
            }
            this.onDidChange = this.a.onDidChange;
            this.onDidScroll = this.a.onDidScroll;
        }
        style(styles) {
            this.a.style(styles);
        }
        /**
         * Layout the {@link $hR}.
         *
         * Optionally provide a `top` and `left` positions, those will propagate
         * as an origin for positions passed to {@link IView.layout}.
         *
         * @param width The width of the {@link $hR}.
         * @param height The height of the {@link $hR}.
         * @param top Optional, the top location of the {@link $hR}.
         * @param left Optional, the left location of the {@link $hR}.
         */
        layout(width, height, top = 0, left = 0) {
            this.a.layout(width, height, top, left);
            this.f = true;
        }
        /**
         * Add a {@link IView view} to this {@link $hR}, based on another reference view.
         *
         * Take this grid as an example:
         *
         * ```
         *  +-----+---------------+
         *  |  A  |      B        |
         *  +-----+---------+-----+
         *  |        C      |     |
         *  +---------------+  D  |
         *  |        E      |     |
         *  +---------------+-----+
         * ```
         *
         * Calling `addView(X, Sizing.Distribute, C, Direction.Right)` will make the following
         * changes:
         *
         * ```
         *  +-----+---------------+
         *  |  A  |      B        |
         *  +-----+-+-------+-----+
         *  |   C   |   X   |     |
         *  +-------+-------+  D  |
         *  |        E      |     |
         *  +---------------+-----+
         * ```
         *
         * Or `addView(X, Sizing.Distribute, D, Direction.Down)`:
         *
         * ```
         *  +-----+---------------+
         *  |  A  |      B        |
         *  +-----+---------+-----+
         *  |        C      |  D  |
         *  +---------------+-----+
         *  |        E      |  X  |
         *  +---------------+-----+
         * ```
         *
         * @param newView The view to add.
         * @param size Either a fixed size, or a dynamic {@link Sizing} strategy.
         * @param referenceView Another view to place this new view next to.
         * @param direction The direction the new view should be placed next to the reference view.
         */
        addView(newView, size, referenceView, direction) {
            if (this.b.has(newView)) {
                throw new Error('Can\'t add same view twice');
            }
            const orientation = getDirectionOrientation(direction);
            if (this.b.size === 1 && this.orientation !== orientation) {
                this.orientation = orientation;
            }
            const referenceLocation = this.j(referenceView);
            const location = $gR(this.a.orientation, referenceLocation, direction);
            let viewSize;
            if (typeof size === 'number') {
                viewSize = size;
            }
            else if (size.type === 'split') {
                const [, index] = (0, arrays_1.$rb)(referenceLocation);
                viewSize = gridview_1.Sizing.Split(index);
            }
            else if (size.type === 'distribute') {
                viewSize = gridview_1.Sizing.Distribute;
            }
            else if (size.type === 'auto') {
                const [, index] = (0, arrays_1.$rb)(referenceLocation);
                viewSize = gridview_1.Sizing.Auto(index);
            }
            else {
                viewSize = size;
            }
            this.h(newView, viewSize, location);
        }
        g(newView, size, location) {
            if (this.b.has(newView)) {
                throw new Error('Can\'t add same view twice');
            }
            let viewSize;
            if (typeof size === 'number') {
                viewSize = size;
            }
            else if (size.type === 'distribute') {
                viewSize = gridview_1.Sizing.Distribute;
            }
            else {
                viewSize = size;
            }
            this.h(newView, viewSize, location);
        }
        h(newView, size, location) {
            this.b.set(newView, newView.element);
            this.a.addView(newView, size, location);
        }
        /**
         * Remove a {@link IView view} from this {@link $hR}.
         *
         * @param view The {@link IView view} to remove.
         * @param sizing Whether to distribute other {@link IView view}'s sizes.
         */
        removeView(view, sizing) {
            if (this.b.size === 1) {
                throw new Error('Can\'t remove last view');
            }
            const location = this.j(view);
            let gridViewSizing;
            if (sizing?.type === 'distribute') {
                gridViewSizing = gridview_1.Sizing.Distribute;
            }
            else if (sizing?.type === 'auto') {
                const index = location[location.length - 1];
                gridViewSizing = gridview_1.Sizing.Auto(index === 0 ? 1 : index - 1);
            }
            this.a.removeView(location, gridViewSizing);
            this.b.delete(view);
        }
        /**
         * Move a {@link IView view} to another location in the grid.
         *
         * @remarks See {@link $hR.addView}.
         *
         * @param view The {@link IView view} to move.
         * @param sizing Either a fixed size, or a dynamic {@link Sizing} strategy.
         * @param referenceView Another view to place the view next to.
         * @param direction The direction the view should be placed next to the reference view.
         */
        moveView(view, sizing, referenceView, direction) {
            const sourceLocation = this.j(view);
            const [sourceParentLocation, from] = (0, arrays_1.$rb)(sourceLocation);
            const referenceLocation = this.j(referenceView);
            const targetLocation = $gR(this.a.orientation, referenceLocation, direction);
            const [targetParentLocation, to] = (0, arrays_1.$rb)(targetLocation);
            if ((0, arrays_1.$sb)(sourceParentLocation, targetParentLocation)) {
                this.a.moveView(sourceParentLocation, from, to);
            }
            else {
                this.removeView(view, typeof sizing === 'number' ? undefined : sizing);
                this.addView(view, sizing, referenceView, direction);
            }
        }
        /**
         * Move a {@link IView view} to another location in the grid.
         *
         * @remarks Internal method, do not use without knowing what you're doing.
         * @remarks See {@link $eR.moveView}.
         *
         * @param view The {@link IView view} to move.
         * @param location The {@link GridLocation location} to insert the view on.
         */
        moveViewTo(view, location) {
            const sourceLocation = this.j(view);
            const [sourceParentLocation, from] = (0, arrays_1.$rb)(sourceLocation);
            const [targetParentLocation, to] = (0, arrays_1.$rb)(location);
            if ((0, arrays_1.$sb)(sourceParentLocation, targetParentLocation)) {
                this.a.moveView(sourceParentLocation, from, to);
            }
            else {
                const size = this.getViewSize(view);
                const orientation = getLocationOrientation(this.a.orientation, sourceLocation);
                const cachedViewSize = this.getViewCachedVisibleSize(view);
                const sizing = typeof cachedViewSize === 'undefined'
                    ? (orientation === 1 /* Orientation.HORIZONTAL */ ? size.width : size.height)
                    : Sizing.Invisible(cachedViewSize);
                this.removeView(view);
                this.g(view, sizing, location);
            }
        }
        /**
         * Swap two {@link IView views} within the {@link $hR}.
         *
         * @param from One {@link IView view}.
         * @param to Another {@link IView view}.
         */
        swapViews(from, to) {
            const fromLocation = this.j(from);
            const toLocation = this.j(to);
            return this.a.swapViews(fromLocation, toLocation);
        }
        /**
         * Resize a {@link IView view}.
         *
         * @param view The {@link IView view} to resize.
         * @param size The size the view should be.
         */
        resizeView(view, size) {
            const location = this.j(view);
            return this.a.resizeView(location, size);
        }
        /**
         * Returns whether all other {@link IView views} are at their minimum size.
         *
         * @param view The reference {@link IView view}.
         */
        isViewSizeMaximized(view) {
            const location = this.j(view);
            return this.a.isViewSizeMaximized(location);
        }
        /**
         * Get the size of a {@link IView view}.
         *
         * @param view The {@link IView view}. Provide `undefined` to get the size
         * of the grid itself.
         */
        getViewSize(view) {
            if (!view) {
                return this.a.getViewSize();
            }
            const location = this.j(view);
            return this.a.getViewSize(location);
        }
        /**
         * Get the cached visible size of a {@link IView view}. This was the size
         * of the view at the moment it last became hidden.
         *
         * @param view The {@link IView view}.
         */
        getViewCachedVisibleSize(view) {
            const location = this.j(view);
            return this.a.getViewCachedVisibleSize(location);
        }
        /**
         * Maximize the size of a {@link IView view} by collapsing all other views
         * to their minimum sizes.
         *
         * @param view The {@link IView view}.
         */
        maximizeViewSize(view) {
            const location = this.j(view);
            this.a.maximizeViewSize(location);
        }
        /**
         * Distribute the size among all {@link IView views} within the entire
         * grid or within a single {@link $bR}.
         */
        distributeViewSizes() {
            this.a.distributeViewSizes();
        }
        /**
         * Returns whether a {@link IView view} is visible.
         *
         * @param view The {@link IView view}.
         */
        isViewVisible(view) {
            const location = this.j(view);
            return this.a.isViewVisible(location);
        }
        /**
         * Set the visibility state of a {@link IView view}.
         *
         * @param view The {@link IView view}.
         */
        setViewVisible(view, visible) {
            const location = this.j(view);
            this.a.setViewVisible(location, visible);
        }
        /**
         * Returns a descriptor for the entire grid.
         */
        getViews() {
            return this.a.getView();
        }
        /**
         * Utility method to return the collection all views which intersect
         * a view's edge.
         *
         * @param view The {@link IView view}.
         * @param direction Which direction edge to be considered.
         * @param wrap Whether the grid wraps around (from right to left, from bottom to top).
         */
        getNeighborViews(view, direction, wrap = false) {
            if (!this.f) {
                throw new Error('Can\'t call getNeighborViews before first layout');
            }
            const location = this.j(view);
            const root = this.getViews();
            const node = getGridNode(root, location);
            let boundary = getBoxBoundary(node.box, direction);
            if (wrap) {
                if (direction === 0 /* Direction.Up */ && node.box.top === 0) {
                    boundary = { offset: root.box.top + root.box.height, range: boundary.range };
                }
                else if (direction === 3 /* Direction.Right */ && node.box.left + node.box.width === root.box.width) {
                    boundary = { offset: 0, range: boundary.range };
                }
                else if (direction === 1 /* Direction.Down */ && node.box.top + node.box.height === root.box.height) {
                    boundary = { offset: 0, range: boundary.range };
                }
                else if (direction === 2 /* Direction.Left */ && node.box.left === 0) {
                    boundary = { offset: root.box.left + root.box.width, range: boundary.range };
                }
            }
            return findAdjacentBoxLeafNodes(root, oppositeDirection(direction), boundary)
                .map(node => node.view);
        }
        j(view) {
            const element = this.b.get(view);
            if (!element) {
                throw new Error('View not found');
            }
            return getGridLocation(element);
        }
        m(location) {
            const resizeToPreferredSize = (location) => {
                const node = this.a.getView(location);
                if ($fR(node)) {
                    return false;
                }
                const direction = getLocationOrientation(this.orientation, location);
                const size = direction === 1 /* Orientation.HORIZONTAL */ ? node.view.preferredWidth : node.view.preferredHeight;
                if (typeof size !== 'number') {
                    return false;
                }
                const viewSize = direction === 1 /* Orientation.HORIZONTAL */ ? { width: Math.round(size) } : { height: Math.round(size) };
                this.a.resizeView(location, viewSize);
                return true;
            };
            if (resizeToPreferredSize(location)) {
                return;
            }
            const [parentLocation, index] = (0, arrays_1.$rb)(location);
            if (resizeToPreferredSize([...parentLocation, index + 1])) {
                return;
            }
            this.a.distributeViewSizes(parentLocation);
        }
    }
    exports.$hR = $hR;
    /**
     * A {@link $hR} which can serialize itself.
     */
    class $iR extends $hR {
        constructor() {
            super(...arguments);
            /**
             * Useful information in order to proportionally restore view sizes
             * upon the very first layout call.
             */
            this.s = true;
        }
        static n(node, orientation) {
            const size = orientation === 0 /* Orientation.VERTICAL */ ? node.box.width : node.box.height;
            if (!$fR(node)) {
                if (typeof node.cachedVisibleSize === 'number') {
                    return { type: 'leaf', data: node.view.toJSON(), size: node.cachedVisibleSize, visible: false };
                }
                return { type: 'leaf', data: node.view.toJSON(), size };
            }
            return { type: 'branch', data: node.children.map(c => $iR.n(c, (0, gridview_1.$cR)(orientation))), size };
        }
        /**
         * Construct a new {@link $iR} from a JSON object.
         *
         * @param json The JSON object.
         * @param deserializer A deserializer which can revive each view.
         * @returns A new {@link $iR} instance.
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
            const gridview = gridview_1.$eR.deserialize(json, deserializer, options);
            const result = new $iR(gridview, options);
            return result;
        }
        /**
         * Construct a new {@link $iR} from a grid descriptor.
         *
         * @param gridDescriptor A grid descriptor in which leaf nodes point to actual views.
         * @returns A new {@link $iR} instance.
         */
        static from(gridDescriptor, options = {}) {
            return $iR.deserialize($kR(gridDescriptor), { fromJSON: view => view }, options);
        }
        /**
         * Serialize this grid into a JSON object.
         */
        serialize() {
            return {
                root: $iR.n(this.getViews(), this.orientation),
                orientation: this.orientation,
                width: this.width,
                height: this.height
            };
        }
        layout(width, height, top = 0, left = 0) {
            super.layout(width, height, top, left);
            if (this.s) {
                this.s = false;
                this.a.trySet2x2();
            }
        }
    }
    exports.$iR = $iR;
    function isGridBranchNodeDescriptor(nodeDescriptor) {
        return !!nodeDescriptor.groups;
    }
    function $jR(nodeDescriptor, rootNode) {
        if (!rootNode && nodeDescriptor.groups && nodeDescriptor.groups.length <= 1) {
            nodeDescriptor.groups = undefined;
        }
        if (!isGridBranchNodeDescriptor(nodeDescriptor)) {
            return;
        }
        let totalDefinedSize = 0;
        let totalDefinedSizeCount = 0;
        for (const child of nodeDescriptor.groups) {
            $jR(child, false);
            if (child.size) {
                totalDefinedSize += child.size;
                totalDefinedSizeCount++;
            }
        }
        const totalUndefinedSize = totalDefinedSizeCount > 0 ? totalDefinedSize : 1;
        const totalUndefinedSizeCount = nodeDescriptor.groups.length - totalDefinedSizeCount;
        const eachUndefinedSize = totalUndefinedSize / totalUndefinedSizeCount;
        for (const child of nodeDescriptor.groups) {
            if (!child.size) {
                child.size = eachUndefinedSize;
            }
        }
    }
    exports.$jR = $jR;
    function createSerializedNode(nodeDescriptor) {
        if (isGridBranchNodeDescriptor(nodeDescriptor)) {
            return { type: 'branch', data: nodeDescriptor.groups.map(c => createSerializedNode(c)), size: nodeDescriptor.size };
        }
        else {
            return { type: 'leaf', data: nodeDescriptor.data, size: nodeDescriptor.size };
        }
    }
    function getDimensions(node, orientation) {
        if (node.type === 'branch') {
            const childrenDimensions = node.data.map(c => getDimensions(c, (0, gridview_1.$cR)(orientation)));
            if (orientation === 0 /* Orientation.VERTICAL */) {
                const width = node.size || (childrenDimensions.length === 0 ? undefined : Math.max(...childrenDimensions.map(d => d.width || 0)));
                const height = childrenDimensions.length === 0 ? undefined : childrenDimensions.reduce((r, d) => r + (d.height || 0), 0);
                return { width, height };
            }
            else {
                const width = childrenDimensions.length === 0 ? undefined : childrenDimensions.reduce((r, d) => r + (d.width || 0), 0);
                const height = node.size || (childrenDimensions.length === 0 ? undefined : Math.max(...childrenDimensions.map(d => d.height || 0)));
                return { width, height };
            }
        }
        else {
            const width = orientation === 0 /* Orientation.VERTICAL */ ? node.size : undefined;
            const height = orientation === 0 /* Orientation.VERTICAL */ ? undefined : node.size;
            return { width, height };
        }
    }
    /**
     * Creates a new JSON object from a {@link GridDescriptor}, which can
     * be deserialized by {@link $iR.deserialize}.
     */
    function $kR(gridDescriptor) {
        $jR(gridDescriptor, true);
        const root = createSerializedNode(gridDescriptor);
        const { width, height } = getDimensions(root, gridDescriptor.orientation);
        return {
            root,
            orientation: gridDescriptor.orientation,
            width: width || 1,
            height: height || 1
        };
    }
    exports.$kR = $kR;
});
//# sourceMappingURL=grid.js.map