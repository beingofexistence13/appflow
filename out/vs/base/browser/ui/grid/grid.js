/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/lifecycle", "./gridview", "./gridview", "vs/css!./gridview"], function (require, exports, arrays_1, lifecycle_1, gridview_1, gridview_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createSerializedGrid = exports.sanitizeGridNodeDescriptor = exports.SerializableGrid = exports.Grid = exports.Sizing = exports.getRelativeLocation = exports.isGridBranchNode = exports.Direction = exports.orthogonal = exports.Orientation = exports.LayoutPriority = void 0;
    Object.defineProperty(exports, "LayoutPriority", { enumerable: true, get: function () { return gridview_2.LayoutPriority; } });
    Object.defineProperty(exports, "Orientation", { enumerable: true, get: function () { return gridview_2.Orientation; } });
    Object.defineProperty(exports, "orthogonal", { enumerable: true, get: function () { return gridview_2.orthogonal; } });
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
    function isGridBranchNode(node) {
        return !!node.children;
    }
    exports.isGridBranchNode = isGridBranchNode;
    function getGridNode(node, location) {
        if (location.length === 0) {
            return node;
        }
        if (!isGridBranchNode(node)) {
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
            if (isGridBranchNode(boxNode)) {
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
        return location.length % 2 === 0 ? (0, gridview_1.orthogonal)(rootOrientation) : rootOrientation;
    }
    function getDirectionOrientation(direction) {
        return direction === 0 /* Direction.Up */ || direction === 1 /* Direction.Down */ ? 0 /* Orientation.VERTICAL */ : 1 /* Orientation.HORIZONTAL */;
    }
    function getRelativeLocation(rootOrientation, location, direction) {
        const orientation = getLocationOrientation(rootOrientation, location);
        const directionOrientation = getDirectionOrientation(direction);
        if (orientation === directionOrientation) {
            let [rest, index] = (0, arrays_1.tail2)(location);
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
    exports.getRelativeLocation = getRelativeLocation;
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
     * The {@link Grid} exposes a Grid widget in a friendlier API than the underlying
     * {@link GridView} widget. Namely, all mutation operations are addressed by the
     * model elements, rather than indexes.
     *
     * It support the same features as the {@link GridView}.
     */
    class Grid extends lifecycle_1.Disposable {
        /**
         * The orientation of the grid. Matches the orientation of the root
         * {@link SplitView} in the grid's {@link GridLocation} model.
         */
        get orientation() { return this.gridview.orientation; }
        set orientation(orientation) { this.gridview.orientation = orientation; }
        /**
         * The width of the grid.
         */
        get width() { return this.gridview.width; }
        /**
         * The height of the grid.
         */
        get height() { return this.gridview.height; }
        /**
         * The minimum width of the grid.
         */
        get minimumWidth() { return this.gridview.minimumWidth; }
        /**
         * The minimum height of the grid.
         */
        get minimumHeight() { return this.gridview.minimumHeight; }
        /**
         * The maximum width of the grid.
         */
        get maximumWidth() { return this.gridview.maximumWidth; }
        /**
         * The maximum height of the grid.
         */
        get maximumHeight() { return this.gridview.maximumHeight; }
        /**
         * A collection of sashes perpendicular to each edge of the grid.
         * Corner sashes will be created for each intersection.
         */
        get boundarySashes() { return this.gridview.boundarySashes; }
        set boundarySashes(boundarySashes) { this.gridview.boundarySashes = boundarySashes; }
        /**
         * Enable/disable edge snapping across all grid views.
         */
        set edgeSnapping(edgeSnapping) { this.gridview.edgeSnapping = edgeSnapping; }
        /**
         * The DOM element for this view.
         */
        get element() { return this.gridview.element; }
        /**
         * Create a new {@link Grid}. A grid must *always* have a view
         * inside.
         *
         * @param view An initial view for this Grid.
         */
        constructor(view, options = {}) {
            super();
            this.views = new Map();
            this.didLayout = false;
            if (view instanceof gridview_1.GridView) {
                this.gridview = view;
                this.gridview.getViewMap(this.views);
            }
            else {
                this.gridview = new gridview_1.GridView(options);
            }
            this._register(this.gridview);
            this._register(this.gridview.onDidSashReset(this.onDidSashReset, this));
            if (!(view instanceof gridview_1.GridView)) {
                this._addView(view, 0, [0]);
            }
            this.onDidChange = this.gridview.onDidChange;
            this.onDidScroll = this.gridview.onDidScroll;
        }
        style(styles) {
            this.gridview.style(styles);
        }
        /**
         * Layout the {@link Grid}.
         *
         * Optionally provide a `top` and `left` positions, those will propagate
         * as an origin for positions passed to {@link IView.layout}.
         *
         * @param width The width of the {@link Grid}.
         * @param height The height of the {@link Grid}.
         * @param top Optional, the top location of the {@link Grid}.
         * @param left Optional, the left location of the {@link Grid}.
         */
        layout(width, height, top = 0, left = 0) {
            this.gridview.layout(width, height, top, left);
            this.didLayout = true;
        }
        /**
         * Add a {@link IView view} to this {@link Grid}, based on another reference view.
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
            if (this.views.has(newView)) {
                throw new Error('Can\'t add same view twice');
            }
            const orientation = getDirectionOrientation(direction);
            if (this.views.size === 1 && this.orientation !== orientation) {
                this.orientation = orientation;
            }
            const referenceLocation = this.getViewLocation(referenceView);
            const location = getRelativeLocation(this.gridview.orientation, referenceLocation, direction);
            let viewSize;
            if (typeof size === 'number') {
                viewSize = size;
            }
            else if (size.type === 'split') {
                const [, index] = (0, arrays_1.tail2)(referenceLocation);
                viewSize = gridview_1.Sizing.Split(index);
            }
            else if (size.type === 'distribute') {
                viewSize = gridview_1.Sizing.Distribute;
            }
            else if (size.type === 'auto') {
                const [, index] = (0, arrays_1.tail2)(referenceLocation);
                viewSize = gridview_1.Sizing.Auto(index);
            }
            else {
                viewSize = size;
            }
            this._addView(newView, viewSize, location);
        }
        addViewAt(newView, size, location) {
            if (this.views.has(newView)) {
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
            this._addView(newView, viewSize, location);
        }
        _addView(newView, size, location) {
            this.views.set(newView, newView.element);
            this.gridview.addView(newView, size, location);
        }
        /**
         * Remove a {@link IView view} from this {@link Grid}.
         *
         * @param view The {@link IView view} to remove.
         * @param sizing Whether to distribute other {@link IView view}'s sizes.
         */
        removeView(view, sizing) {
            if (this.views.size === 1) {
                throw new Error('Can\'t remove last view');
            }
            const location = this.getViewLocation(view);
            let gridViewSizing;
            if (sizing?.type === 'distribute') {
                gridViewSizing = gridview_1.Sizing.Distribute;
            }
            else if (sizing?.type === 'auto') {
                const index = location[location.length - 1];
                gridViewSizing = gridview_1.Sizing.Auto(index === 0 ? 1 : index - 1);
            }
            this.gridview.removeView(location, gridViewSizing);
            this.views.delete(view);
        }
        /**
         * Move a {@link IView view} to another location in the grid.
         *
         * @remarks See {@link Grid.addView}.
         *
         * @param view The {@link IView view} to move.
         * @param sizing Either a fixed size, or a dynamic {@link Sizing} strategy.
         * @param referenceView Another view to place the view next to.
         * @param direction The direction the view should be placed next to the reference view.
         */
        moveView(view, sizing, referenceView, direction) {
            const sourceLocation = this.getViewLocation(view);
            const [sourceParentLocation, from] = (0, arrays_1.tail2)(sourceLocation);
            const referenceLocation = this.getViewLocation(referenceView);
            const targetLocation = getRelativeLocation(this.gridview.orientation, referenceLocation, direction);
            const [targetParentLocation, to] = (0, arrays_1.tail2)(targetLocation);
            if ((0, arrays_1.equals)(sourceParentLocation, targetParentLocation)) {
                this.gridview.moveView(sourceParentLocation, from, to);
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
         * @remarks See {@link GridView.moveView}.
         *
         * @param view The {@link IView view} to move.
         * @param location The {@link GridLocation location} to insert the view on.
         */
        moveViewTo(view, location) {
            const sourceLocation = this.getViewLocation(view);
            const [sourceParentLocation, from] = (0, arrays_1.tail2)(sourceLocation);
            const [targetParentLocation, to] = (0, arrays_1.tail2)(location);
            if ((0, arrays_1.equals)(sourceParentLocation, targetParentLocation)) {
                this.gridview.moveView(sourceParentLocation, from, to);
            }
            else {
                const size = this.getViewSize(view);
                const orientation = getLocationOrientation(this.gridview.orientation, sourceLocation);
                const cachedViewSize = this.getViewCachedVisibleSize(view);
                const sizing = typeof cachedViewSize === 'undefined'
                    ? (orientation === 1 /* Orientation.HORIZONTAL */ ? size.width : size.height)
                    : Sizing.Invisible(cachedViewSize);
                this.removeView(view);
                this.addViewAt(view, sizing, location);
            }
        }
        /**
         * Swap two {@link IView views} within the {@link Grid}.
         *
         * @param from One {@link IView view}.
         * @param to Another {@link IView view}.
         */
        swapViews(from, to) {
            const fromLocation = this.getViewLocation(from);
            const toLocation = this.getViewLocation(to);
            return this.gridview.swapViews(fromLocation, toLocation);
        }
        /**
         * Resize a {@link IView view}.
         *
         * @param view The {@link IView view} to resize.
         * @param size The size the view should be.
         */
        resizeView(view, size) {
            const location = this.getViewLocation(view);
            return this.gridview.resizeView(location, size);
        }
        /**
         * Returns whether all other {@link IView views} are at their minimum size.
         *
         * @param view The reference {@link IView view}.
         */
        isViewSizeMaximized(view) {
            const location = this.getViewLocation(view);
            return this.gridview.isViewSizeMaximized(location);
        }
        /**
         * Get the size of a {@link IView view}.
         *
         * @param view The {@link IView view}. Provide `undefined` to get the size
         * of the grid itself.
         */
        getViewSize(view) {
            if (!view) {
                return this.gridview.getViewSize();
            }
            const location = this.getViewLocation(view);
            return this.gridview.getViewSize(location);
        }
        /**
         * Get the cached visible size of a {@link IView view}. This was the size
         * of the view at the moment it last became hidden.
         *
         * @param view The {@link IView view}.
         */
        getViewCachedVisibleSize(view) {
            const location = this.getViewLocation(view);
            return this.gridview.getViewCachedVisibleSize(location);
        }
        /**
         * Maximize the size of a {@link IView view} by collapsing all other views
         * to their minimum sizes.
         *
         * @param view The {@link IView view}.
         */
        maximizeViewSize(view) {
            const location = this.getViewLocation(view);
            this.gridview.maximizeViewSize(location);
        }
        /**
         * Distribute the size among all {@link IView views} within the entire
         * grid or within a single {@link SplitView}.
         */
        distributeViewSizes() {
            this.gridview.distributeViewSizes();
        }
        /**
         * Returns whether a {@link IView view} is visible.
         *
         * @param view The {@link IView view}.
         */
        isViewVisible(view) {
            const location = this.getViewLocation(view);
            return this.gridview.isViewVisible(location);
        }
        /**
         * Set the visibility state of a {@link IView view}.
         *
         * @param view The {@link IView view}.
         */
        setViewVisible(view, visible) {
            const location = this.getViewLocation(view);
            this.gridview.setViewVisible(location, visible);
        }
        /**
         * Returns a descriptor for the entire grid.
         */
        getViews() {
            return this.gridview.getView();
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
            if (!this.didLayout) {
                throw new Error('Can\'t call getNeighborViews before first layout');
            }
            const location = this.getViewLocation(view);
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
        getViewLocation(view) {
            const element = this.views.get(view);
            if (!element) {
                throw new Error('View not found');
            }
            return getGridLocation(element);
        }
        onDidSashReset(location) {
            const resizeToPreferredSize = (location) => {
                const node = this.gridview.getView(location);
                if (isGridBranchNode(node)) {
                    return false;
                }
                const direction = getLocationOrientation(this.orientation, location);
                const size = direction === 1 /* Orientation.HORIZONTAL */ ? node.view.preferredWidth : node.view.preferredHeight;
                if (typeof size !== 'number') {
                    return false;
                }
                const viewSize = direction === 1 /* Orientation.HORIZONTAL */ ? { width: Math.round(size) } : { height: Math.round(size) };
                this.gridview.resizeView(location, viewSize);
                return true;
            };
            if (resizeToPreferredSize(location)) {
                return;
            }
            const [parentLocation, index] = (0, arrays_1.tail2)(location);
            if (resizeToPreferredSize([...parentLocation, index + 1])) {
                return;
            }
            this.gridview.distributeViewSizes(parentLocation);
        }
    }
    exports.Grid = Grid;
    /**
     * A {@link Grid} which can serialize itself.
     */
    class SerializableGrid extends Grid {
        constructor() {
            super(...arguments);
            /**
             * Useful information in order to proportionally restore view sizes
             * upon the very first layout call.
             */
            this.initialLayoutContext = true;
        }
        static serializeNode(node, orientation) {
            const size = orientation === 0 /* Orientation.VERTICAL */ ? node.box.width : node.box.height;
            if (!isGridBranchNode(node)) {
                if (typeof node.cachedVisibleSize === 'number') {
                    return { type: 'leaf', data: node.view.toJSON(), size: node.cachedVisibleSize, visible: false };
                }
                return { type: 'leaf', data: node.view.toJSON(), size };
            }
            return { type: 'branch', data: node.children.map(c => SerializableGrid.serializeNode(c, (0, gridview_1.orthogonal)(orientation))), size };
        }
        /**
         * Construct a new {@link SerializableGrid} from a JSON object.
         *
         * @param json The JSON object.
         * @param deserializer A deserializer which can revive each view.
         * @returns A new {@link SerializableGrid} instance.
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
            const gridview = gridview_1.GridView.deserialize(json, deserializer, options);
            const result = new SerializableGrid(gridview, options);
            return result;
        }
        /**
         * Construct a new {@link SerializableGrid} from a grid descriptor.
         *
         * @param gridDescriptor A grid descriptor in which leaf nodes point to actual views.
         * @returns A new {@link SerializableGrid} instance.
         */
        static from(gridDescriptor, options = {}) {
            return SerializableGrid.deserialize(createSerializedGrid(gridDescriptor), { fromJSON: view => view }, options);
        }
        /**
         * Serialize this grid into a JSON object.
         */
        serialize() {
            return {
                root: SerializableGrid.serializeNode(this.getViews(), this.orientation),
                orientation: this.orientation,
                width: this.width,
                height: this.height
            };
        }
        layout(width, height, top = 0, left = 0) {
            super.layout(width, height, top, left);
            if (this.initialLayoutContext) {
                this.initialLayoutContext = false;
                this.gridview.trySet2x2();
            }
        }
    }
    exports.SerializableGrid = SerializableGrid;
    function isGridBranchNodeDescriptor(nodeDescriptor) {
        return !!nodeDescriptor.groups;
    }
    function sanitizeGridNodeDescriptor(nodeDescriptor, rootNode) {
        if (!rootNode && nodeDescriptor.groups && nodeDescriptor.groups.length <= 1) {
            nodeDescriptor.groups = undefined;
        }
        if (!isGridBranchNodeDescriptor(nodeDescriptor)) {
            return;
        }
        let totalDefinedSize = 0;
        let totalDefinedSizeCount = 0;
        for (const child of nodeDescriptor.groups) {
            sanitizeGridNodeDescriptor(child, false);
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
    exports.sanitizeGridNodeDescriptor = sanitizeGridNodeDescriptor;
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
            const childrenDimensions = node.data.map(c => getDimensions(c, (0, gridview_1.orthogonal)(orientation)));
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
     * be deserialized by {@link SerializableGrid.deserialize}.
     */
    function createSerializedGrid(gridDescriptor) {
        sanitizeGridNodeDescriptor(gridDescriptor, true);
        const root = createSerializedNode(gridDescriptor);
        const { width, height } = getDimensions(root, gridDescriptor.orientation);
        return {
            root,
            orientation: gridDescriptor.orientation,
            width: width || 1,
            height: height || 1
        };
    }
    exports.createSerializedGrid = createSerializedGrid;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9ncmlkL2dyaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVTVFLDBHQUFBLGNBQWMsT0FBQTtJQUFFLHVHQUFBLFdBQVcsT0FBQTtJQUFFLHNHQUFBLFVBQVUsT0FBQTtJQUUzRCxJQUFrQixTQUtqQjtJQUxELFdBQWtCLFNBQVM7UUFDMUIscUNBQUUsQ0FBQTtRQUNGLHlDQUFJLENBQUE7UUFDSix5Q0FBSSxDQUFBO1FBQ0osMkNBQUssQ0FBQTtJQUNOLENBQUMsRUFMaUIsU0FBUyx5QkFBVCxTQUFTLFFBSzFCO0lBRUQsU0FBUyxpQkFBaUIsQ0FBQyxTQUFvQjtRQUM5QyxRQUFRLFNBQVMsRUFBRTtZQUNsQix5QkFBaUIsQ0FBQyxDQUFDLDhCQUFzQjtZQUN6QywyQkFBbUIsQ0FBQyxDQUFDLDRCQUFvQjtZQUN6QywyQkFBbUIsQ0FBQyxDQUFDLCtCQUF1QjtZQUM1Qyw0QkFBb0IsQ0FBQyxDQUFDLDhCQUFzQjtTQUM1QztJQUNGLENBQUM7SUFpQ0QsU0FBZ0IsZ0JBQWdCLENBQWtCLElBQWlCO1FBQ2xFLE9BQU8sQ0FBQyxDQUFFLElBQVksQ0FBQyxRQUFRLENBQUM7SUFDakMsQ0FBQztJQUZELDRDQUVDO0lBRUQsU0FBUyxXQUFXLENBQWtCLElBQWlCLEVBQUUsUUFBc0I7UUFDOUUsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMxQixPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztTQUNwQztRQUVELE1BQU0sQ0FBQyxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUM7UUFDbEMs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