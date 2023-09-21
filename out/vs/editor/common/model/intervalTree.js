/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.intervalCompare = exports.recomputeMaxEnd = exports.nodeAcceptEdit = exports.IntervalTree = exports.SENTINEL = exports.IntervalNode = exports.setNodeStickiness = exports.getNodeColor = exports.NodeColor = exports.ClassName = void 0;
    //
    // The red-black tree is based on the "Introduction to Algorithms" by Cormen, Leiserson and Rivest.
    //
    var ClassName;
    (function (ClassName) {
        ClassName["EditorHintDecoration"] = "squiggly-hint";
        ClassName["EditorInfoDecoration"] = "squiggly-info";
        ClassName["EditorWarningDecoration"] = "squiggly-warning";
        ClassName["EditorErrorDecoration"] = "squiggly-error";
        ClassName["EditorUnnecessaryDecoration"] = "squiggly-unnecessary";
        ClassName["EditorUnnecessaryInlineDecoration"] = "squiggly-inline-unnecessary";
        ClassName["EditorDeprecatedInlineDecoration"] = "squiggly-inline-deprecated";
    })(ClassName || (exports.ClassName = ClassName = {}));
    var NodeColor;
    (function (NodeColor) {
        NodeColor[NodeColor["Black"] = 0] = "Black";
        NodeColor[NodeColor["Red"] = 1] = "Red";
    })(NodeColor || (exports.NodeColor = NodeColor = {}));
    var Constants;
    (function (Constants) {
        Constants[Constants["ColorMask"] = 1] = "ColorMask";
        Constants[Constants["ColorMaskInverse"] = 254] = "ColorMaskInverse";
        Constants[Constants["ColorOffset"] = 0] = "ColorOffset";
        Constants[Constants["IsVisitedMask"] = 2] = "IsVisitedMask";
        Constants[Constants["IsVisitedMaskInverse"] = 253] = "IsVisitedMaskInverse";
        Constants[Constants["IsVisitedOffset"] = 1] = "IsVisitedOffset";
        Constants[Constants["IsForValidationMask"] = 4] = "IsForValidationMask";
        Constants[Constants["IsForValidationMaskInverse"] = 251] = "IsForValidationMaskInverse";
        Constants[Constants["IsForValidationOffset"] = 2] = "IsForValidationOffset";
        Constants[Constants["StickinessMask"] = 24] = "StickinessMask";
        Constants[Constants["StickinessMaskInverse"] = 231] = "StickinessMaskInverse";
        Constants[Constants["StickinessOffset"] = 3] = "StickinessOffset";
        Constants[Constants["CollapseOnReplaceEditMask"] = 32] = "CollapseOnReplaceEditMask";
        Constants[Constants["CollapseOnReplaceEditMaskInverse"] = 223] = "CollapseOnReplaceEditMaskInverse";
        Constants[Constants["CollapseOnReplaceEditOffset"] = 5] = "CollapseOnReplaceEditOffset";
        Constants[Constants["IsMarginMask"] = 64] = "IsMarginMask";
        Constants[Constants["IsMarginMaskInverse"] = 191] = "IsMarginMaskInverse";
        Constants[Constants["IsMarginOffset"] = 6] = "IsMarginOffset";
        /**
         * Due to how deletion works (in order to avoid always walking the right subtree of the deleted node),
         * the deltas for nodes can grow and shrink dramatically. It has been observed, in practice, that unless
         * the deltas are corrected, integer overflow will occur.
         *
         * The integer overflow occurs when 53 bits are used in the numbers, but we will try to avoid it as
         * a node's delta gets below a negative 30 bits number.
         *
         * MIN SMI (SMall Integer) as defined in v8.
         * one bit is lost for boxing/unboxing flag.
         * one bit is lost for sign flag.
         * See https://thibaultlaurens.github.io/javascript/2013/04/29/how-the-v8-engine-works/#tagged-values
         */
        Constants[Constants["MIN_SAFE_DELTA"] = -1073741824] = "MIN_SAFE_DELTA";
        /**
         * MAX SMI (SMall Integer) as defined in v8.
         * one bit is lost for boxing/unboxing flag.
         * one bit is lost for sign flag.
         * See https://thibaultlaurens.github.io/javascript/2013/04/29/how-the-v8-engine-works/#tagged-values
         */
        Constants[Constants["MAX_SAFE_DELTA"] = 1073741824] = "MAX_SAFE_DELTA";
    })(Constants || (Constants = {}));
    function getNodeColor(node) {
        return ((node.metadata & 1 /* Constants.ColorMask */) >>> 0 /* Constants.ColorOffset */);
    }
    exports.getNodeColor = getNodeColor;
    function setNodeColor(node, color) {
        node.metadata = ((node.metadata & 254 /* Constants.ColorMaskInverse */) | (color << 0 /* Constants.ColorOffset */));
    }
    function getNodeIsVisited(node) {
        return ((node.metadata & 2 /* Constants.IsVisitedMask */) >>> 1 /* Constants.IsVisitedOffset */) === 1;
    }
    function setNodeIsVisited(node, value) {
        node.metadata = ((node.metadata & 253 /* Constants.IsVisitedMaskInverse */) | ((value ? 1 : 0) << 1 /* Constants.IsVisitedOffset */));
    }
    function getNodeIsForValidation(node) {
        return ((node.metadata & 4 /* Constants.IsForValidationMask */) >>> 2 /* Constants.IsForValidationOffset */) === 1;
    }
    function setNodeIsForValidation(node, value) {
        node.metadata = ((node.metadata & 251 /* Constants.IsForValidationMaskInverse */) | ((value ? 1 : 0) << 2 /* Constants.IsForValidationOffset */));
    }
    function getNodeIsInGlyphMargin(node) {
        return ((node.metadata & 64 /* Constants.IsMarginMask */) >>> 6 /* Constants.IsMarginOffset */) === 1;
    }
    function setNodeIsInGlyphMargin(node, value) {
        node.metadata = ((node.metadata & 191 /* Constants.IsMarginMaskInverse */) | ((value ? 1 : 0) << 6 /* Constants.IsMarginOffset */));
    }
    function getNodeStickiness(node) {
        return ((node.metadata & 24 /* Constants.StickinessMask */) >>> 3 /* Constants.StickinessOffset */);
    }
    function _setNodeStickiness(node, stickiness) {
        node.metadata = ((node.metadata & 231 /* Constants.StickinessMaskInverse */) | (stickiness << 3 /* Constants.StickinessOffset */));
    }
    function getCollapseOnReplaceEdit(node) {
        return ((node.metadata & 32 /* Constants.CollapseOnReplaceEditMask */) >>> 5 /* Constants.CollapseOnReplaceEditOffset */) === 1;
    }
    function setCollapseOnReplaceEdit(node, value) {
        node.metadata = ((node.metadata & 223 /* Constants.CollapseOnReplaceEditMaskInverse */) | ((value ? 1 : 0) << 5 /* Constants.CollapseOnReplaceEditOffset */));
    }
    function setNodeStickiness(node, stickiness) {
        _setNodeStickiness(node, stickiness);
    }
    exports.setNodeStickiness = setNodeStickiness;
    class IntervalNode {
        constructor(id, start, end) {
            this.metadata = 0;
            this.parent = this;
            this.left = this;
            this.right = this;
            setNodeColor(this, 1 /* NodeColor.Red */);
            this.start = start;
            this.end = end;
            // FORCE_OVERFLOWING_TEST: this.delta = start;
            this.delta = 0;
            this.maxEnd = end;
            this.id = id;
            this.ownerId = 0;
            this.options = null;
            setNodeIsForValidation(this, false);
            setNodeIsInGlyphMargin(this, false);
            _setNodeStickiness(this, 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */);
            setCollapseOnReplaceEdit(this, false);
            this.cachedVersionId = 0;
            this.cachedAbsoluteStart = start;
            this.cachedAbsoluteEnd = end;
            this.range = null;
            setNodeIsVisited(this, false);
        }
        reset(versionId, start, end, range) {
            this.start = start;
            this.end = end;
            this.maxEnd = end;
            this.cachedVersionId = versionId;
            this.cachedAbsoluteStart = start;
            this.cachedAbsoluteEnd = end;
            this.range = range;
        }
        setOptions(options) {
            this.options = options;
            const className = this.options.className;
            setNodeIsForValidation(this, (className === "squiggly-error" /* ClassName.EditorErrorDecoration */
                || className === "squiggly-warning" /* ClassName.EditorWarningDecoration */
                || className === "squiggly-info" /* ClassName.EditorInfoDecoration */));
            setNodeIsInGlyphMargin(this, this.options.glyphMarginClassName !== null);
            _setNodeStickiness(this, this.options.stickiness);
            setCollapseOnReplaceEdit(this, this.options.collapseOnReplaceEdit);
        }
        setCachedOffsets(absoluteStart, absoluteEnd, cachedVersionId) {
            if (this.cachedVersionId !== cachedVersionId) {
                this.range = null;
            }
            this.cachedVersionId = cachedVersionId;
            this.cachedAbsoluteStart = absoluteStart;
            this.cachedAbsoluteEnd = absoluteEnd;
        }
        detach() {
            this.parent = null;
            this.left = null;
            this.right = null;
        }
    }
    exports.IntervalNode = IntervalNode;
    exports.SENTINEL = new IntervalNode(null, 0, 0);
    exports.SENTINEL.parent = exports.SENTINEL;
    exports.SENTINEL.left = exports.SENTINEL;
    exports.SENTINEL.right = exports.SENTINEL;
    setNodeColor(exports.SENTINEL, 0 /* NodeColor.Black */);
    class IntervalTree {
        constructor() {
            this.root = exports.SENTINEL;
            this.requestNormalizeDelta = false;
        }
        intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations) {
            if (this.root === exports.SENTINEL) {
                return [];
            }
            return intervalSearch(this, start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
        }
        search(filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations) {
            if (this.root === exports.SENTINEL) {
                return [];
            }
            return search(this, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
        }
        /**
         * Will not set `cachedAbsoluteStart` nor `cachedAbsoluteEnd` on the returned nodes!
         */
        collectNodesFromOwner(ownerId) {
            return collectNodesFromOwner(this, ownerId);
        }
        /**
         * Will not set `cachedAbsoluteStart` nor `cachedAbsoluteEnd` on the returned nodes!
         */
        collectNodesPostOrder() {
            return collectNodesPostOrder(this);
        }
        insert(node) {
            rbTreeInsert(this, node);
            this._normalizeDeltaIfNecessary();
        }
        delete(node) {
            rbTreeDelete(this, node);
            this._normalizeDeltaIfNecessary();
        }
        resolveNode(node, cachedVersionId) {
            const initialNode = node;
            let delta = 0;
            while (node !== this.root) {
                if (node === node.parent.right) {
                    delta += node.parent.delta;
                }
                node = node.parent;
            }
            const nodeStart = initialNode.start + delta;
            const nodeEnd = initialNode.end + delta;
            initialNode.setCachedOffsets(nodeStart, nodeEnd, cachedVersionId);
        }
        acceptReplace(offset, length, textLength, forceMoveMarkers) {
            // Our strategy is to remove all directly impacted nodes, and then add them back to the tree.
            // (1) collect all nodes that are intersecting this edit as nodes of interest
            const nodesOfInterest = searchForEditing(this, offset, offset + length);
            // (2) remove all nodes that are intersecting this edit
            for (let i = 0, len = nodesOfInterest.length; i < len; i++) {
                const node = nodesOfInterest[i];
                rbTreeDelete(this, node);
            }
            this._normalizeDeltaIfNecessary();
            // (3) edit all tree nodes except the nodes of interest
            noOverlapReplace(this, offset, offset + length, textLength);
            this._normalizeDeltaIfNecessary();
            // (4) edit the nodes of interest and insert them back in the tree
            for (let i = 0, len = nodesOfInterest.length; i < len; i++) {
                const node = nodesOfInterest[i];
                node.start = node.cachedAbsoluteStart;
                node.end = node.cachedAbsoluteEnd;
                nodeAcceptEdit(node, offset, (offset + length), textLength, forceMoveMarkers);
                node.maxEnd = node.end;
                rbTreeInsert(this, node);
            }
            this._normalizeDeltaIfNecessary();
        }
        getAllInOrder() {
            return search(this, 0, false, 0, false);
        }
        _normalizeDeltaIfNecessary() {
            if (!this.requestNormalizeDelta) {
                return;
            }
            this.requestNormalizeDelta = false;
            normalizeDelta(this);
        }
    }
    exports.IntervalTree = IntervalTree;
    //#region Delta Normalization
    function normalizeDelta(T) {
        let node = T.root;
        let delta = 0;
        while (node !== exports.SENTINEL) {
            if (node.left !== exports.SENTINEL && !getNodeIsVisited(node.left)) {
                // go left
                node = node.left;
                continue;
            }
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                delta += node.delta;
                node = node.right;
                continue;
            }
            // handle current node
            node.start = delta + node.start;
            node.end = delta + node.end;
            node.delta = 0;
            recomputeMaxEnd(node);
            setNodeIsVisited(node, true);
            // going up from this node
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            if (node === node.parent.right) {
                delta -= node.parent.delta;
            }
            node = node.parent;
        }
        setNodeIsVisited(T.root, false);
    }
    //#endregion
    //#region Editing
    var MarkerMoveSemantics;
    (function (MarkerMoveSemantics) {
        MarkerMoveSemantics[MarkerMoveSemantics["MarkerDefined"] = 0] = "MarkerDefined";
        MarkerMoveSemantics[MarkerMoveSemantics["ForceMove"] = 1] = "ForceMove";
        MarkerMoveSemantics[MarkerMoveSemantics["ForceStay"] = 2] = "ForceStay";
    })(MarkerMoveSemantics || (MarkerMoveSemantics = {}));
    function adjustMarkerBeforeColumn(markerOffset, markerStickToPreviousCharacter, checkOffset, moveSemantics) {
        if (markerOffset < checkOffset) {
            return true;
        }
        if (markerOffset > checkOffset) {
            return false;
        }
        if (moveSemantics === 1 /* MarkerMoveSemantics.ForceMove */) {
            return false;
        }
        if (moveSemantics === 2 /* MarkerMoveSemantics.ForceStay */) {
            return true;
        }
        return markerStickToPreviousCharacter;
    }
    /**
     * This is a lot more complicated than strictly necessary to maintain the same behaviour
     * as when decorations were implemented using two markers.
     */
    function nodeAcceptEdit(node, start, end, textLength, forceMoveMarkers) {
        const nodeStickiness = getNodeStickiness(node);
        const startStickToPreviousCharacter = (nodeStickiness === 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */
            || nodeStickiness === 2 /* TrackedRangeStickiness.GrowsOnlyWhenTypingBefore */);
        const endStickToPreviousCharacter = (nodeStickiness === 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */
            || nodeStickiness === 2 /* TrackedRangeStickiness.GrowsOnlyWhenTypingBefore */);
        const deletingCnt = (end - start);
        const insertingCnt = textLength;
        const commonLength = Math.min(deletingCnt, insertingCnt);
        const nodeStart = node.start;
        let startDone = false;
        const nodeEnd = node.end;
        let endDone = false;
        if (start <= nodeStart && nodeEnd <= end && getCollapseOnReplaceEdit(node)) {
            // This edit encompasses the entire decoration range
            // and the decoration has asked to become collapsed
            node.start = start;
            startDone = true;
            node.end = start;
            endDone = true;
        }
        {
            const moveSemantics = forceMoveMarkers ? 1 /* MarkerMoveSemantics.ForceMove */ : (deletingCnt > 0 ? 2 /* MarkerMoveSemantics.ForceStay */ : 0 /* MarkerMoveSemantics.MarkerDefined */);
            if (!startDone && adjustMarkerBeforeColumn(nodeStart, startStickToPreviousCharacter, start, moveSemantics)) {
                startDone = true;
            }
            if (!endDone && adjustMarkerBeforeColumn(nodeEnd, endStickToPreviousCharacter, start, moveSemantics)) {
                endDone = true;
            }
        }
        if (commonLength > 0 && !forceMoveMarkers) {
            const moveSemantics = (deletingCnt > insertingCnt ? 2 /* MarkerMoveSemantics.ForceStay */ : 0 /* MarkerMoveSemantics.MarkerDefined */);
            if (!startDone && adjustMarkerBeforeColumn(nodeStart, startStickToPreviousCharacter, start + commonLength, moveSemantics)) {
                startDone = true;
            }
            if (!endDone && adjustMarkerBeforeColumn(nodeEnd, endStickToPreviousCharacter, start + commonLength, moveSemantics)) {
                endDone = true;
            }
        }
        {
            const moveSemantics = forceMoveMarkers ? 1 /* MarkerMoveSemantics.ForceMove */ : 0 /* MarkerMoveSemantics.MarkerDefined */;
            if (!startDone && adjustMarkerBeforeColumn(nodeStart, startStickToPreviousCharacter, end, moveSemantics)) {
                node.start = start + insertingCnt;
                startDone = true;
            }
            if (!endDone && adjustMarkerBeforeColumn(nodeEnd, endStickToPreviousCharacter, end, moveSemantics)) {
                node.end = start + insertingCnt;
                endDone = true;
            }
        }
        // Finish
        const deltaColumn = (insertingCnt - deletingCnt);
        if (!startDone) {
            node.start = Math.max(0, nodeStart + deltaColumn);
        }
        if (!endDone) {
            node.end = Math.max(0, nodeEnd + deltaColumn);
        }
        if (node.start > node.end) {
            node.end = node.start;
        }
    }
    exports.nodeAcceptEdit = nodeAcceptEdit;
    function searchForEditing(T, start, end) {
        // https://en.wikipedia.org/wiki/Interval_tree#Augmented_tree
        // Now, it is known that two intervals A and B overlap only when both
        // A.low <= B.high and A.high >= B.low. When searching the trees for
        // nodes overlapping with a given interval, you can immediately skip:
        //  a) all nodes to the right of nodes whose low value is past the end of the given interval.
        //  b) all nodes that have their maximum 'high' value below the start of the given interval.
        let node = T.root;
        let delta = 0;
        let nodeMaxEnd = 0;
        let nodeStart = 0;
        let nodeEnd = 0;
        const result = [];
        let resultLen = 0;
        while (node !== exports.SENTINEL) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                if (node === node.parent.right) {
                    delta -= node.parent.delta;
                }
                node = node.parent;
                continue;
            }
            if (!getNodeIsVisited(node.left)) {
                // first time seeing this node
                nodeMaxEnd = delta + node.maxEnd;
                if (nodeMaxEnd < start) {
                    // cover case b) from above
                    // there is no need to search this node or its children
                    setNodeIsVisited(node, true);
                    continue;
                }
                if (node.left !== exports.SENTINEL) {
                    // go left
                    node = node.left;
                    continue;
                }
            }
            // handle current node
            nodeStart = delta + node.start;
            if (nodeStart > end) {
                // cover case a) from above
                // there is no need to search this node or its right subtree
                setNodeIsVisited(node, true);
                continue;
            }
            nodeEnd = delta + node.end;
            if (nodeEnd >= start) {
                node.setCachedOffsets(nodeStart, nodeEnd, 0);
                result[resultLen++] = node;
            }
            setNodeIsVisited(node, true);
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                delta += node.delta;
                node = node.right;
                continue;
            }
        }
        setNodeIsVisited(T.root, false);
        return result;
    }
    function noOverlapReplace(T, start, end, textLength) {
        // https://en.wikipedia.org/wiki/Interval_tree#Augmented_tree
        // Now, it is known that two intervals A and B overlap only when both
        // A.low <= B.high and A.high >= B.low. When searching the trees for
        // nodes overlapping with a given interval, you can immediately skip:
        //  a) all nodes to the right of nodes whose low value is past the end of the given interval.
        //  b) all nodes that have their maximum 'high' value below the start of the given interval.
        let node = T.root;
        let delta = 0;
        let nodeMaxEnd = 0;
        let nodeStart = 0;
        const editDelta = (textLength - (end - start));
        while (node !== exports.SENTINEL) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                if (node === node.parent.right) {
                    delta -= node.parent.delta;
                }
                recomputeMaxEnd(node);
                node = node.parent;
                continue;
            }
            if (!getNodeIsVisited(node.left)) {
                // first time seeing this node
                nodeMaxEnd = delta + node.maxEnd;
                if (nodeMaxEnd < start) {
                    // cover case b) from above
                    // there is no need to search this node or its children
                    setNodeIsVisited(node, true);
                    continue;
                }
                if (node.left !== exports.SENTINEL) {
                    // go left
                    node = node.left;
                    continue;
                }
            }
            // handle current node
            nodeStart = delta + node.start;
            if (nodeStart > end) {
                node.start += editDelta;
                node.end += editDelta;
                node.delta += editDelta;
                if (node.delta < -1073741824 /* Constants.MIN_SAFE_DELTA */ || node.delta > 1073741824 /* Constants.MAX_SAFE_DELTA */) {
                    T.requestNormalizeDelta = true;
                }
                // cover case a) from above
                // there is no need to search this node or its right subtree
                setNodeIsVisited(node, true);
                continue;
            }
            setNodeIsVisited(node, true);
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                delta += node.delta;
                node = node.right;
                continue;
            }
        }
        setNodeIsVisited(T.root, false);
    }
    //#endregion
    //#region Searching
    function collectNodesFromOwner(T, ownerId) {
        let node = T.root;
        const result = [];
        let resultLen = 0;
        while (node !== exports.SENTINEL) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                node = node.parent;
                continue;
            }
            if (node.left !== exports.SENTINEL && !getNodeIsVisited(node.left)) {
                // go left
                node = node.left;
                continue;
            }
            // handle current node
            if (node.ownerId === ownerId) {
                result[resultLen++] = node;
            }
            setNodeIsVisited(node, true);
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                node = node.right;
                continue;
            }
        }
        setNodeIsVisited(T.root, false);
        return result;
    }
    function collectNodesPostOrder(T) {
        let node = T.root;
        const result = [];
        let resultLen = 0;
        while (node !== exports.SENTINEL) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                node = node.parent;
                continue;
            }
            if (node.left !== exports.SENTINEL && !getNodeIsVisited(node.left)) {
                // go left
                node = node.left;
                continue;
            }
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                node = node.right;
                continue;
            }
            // handle current node
            result[resultLen++] = node;
            setNodeIsVisited(node, true);
        }
        setNodeIsVisited(T.root, false);
        return result;
    }
    function search(T, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations) {
        let node = T.root;
        let delta = 0;
        let nodeStart = 0;
        let nodeEnd = 0;
        const result = [];
        let resultLen = 0;
        while (node !== exports.SENTINEL) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                if (node === node.parent.right) {
                    delta -= node.parent.delta;
                }
                node = node.parent;
                continue;
            }
            if (node.left !== exports.SENTINEL && !getNodeIsVisited(node.left)) {
                // go left
                node = node.left;
                continue;
            }
            // handle current node
            nodeStart = delta + node.start;
            nodeEnd = delta + node.end;
            node.setCachedOffsets(nodeStart, nodeEnd, cachedVersionId);
            let include = true;
            if (filterOwnerId && node.ownerId && node.ownerId !== filterOwnerId) {
                include = false;
            }
            if (filterOutValidation && getNodeIsForValidation(node)) {
                include = false;
            }
            if (onlyMarginDecorations && !getNodeIsInGlyphMargin(node)) {
                include = false;
            }
            if (include) {
                result[resultLen++] = node;
            }
            setNodeIsVisited(node, true);
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                delta += node.delta;
                node = node.right;
                continue;
            }
        }
        setNodeIsVisited(T.root, false);
        return result;
    }
    function intervalSearch(T, intervalStart, intervalEnd, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations) {
        // https://en.wikipedia.org/wiki/Interval_tree#Augmented_tree
        // Now, it is known that two intervals A and B overlap only when both
        // A.low <= B.high and A.high >= B.low. When searching the trees for
        // nodes overlapping with a given interval, you can immediately skip:
        //  a) all nodes to the right of nodes whose low value is past the end of the given interval.
        //  b) all nodes that have their maximum 'high' value below the start of the given interval.
        let node = T.root;
        let delta = 0;
        let nodeMaxEnd = 0;
        let nodeStart = 0;
        let nodeEnd = 0;
        const result = [];
        let resultLen = 0;
        while (node !== exports.SENTINEL) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                if (node === node.parent.right) {
                    delta -= node.parent.delta;
                }
                node = node.parent;
                continue;
            }
            if (!getNodeIsVisited(node.left)) {
                // first time seeing this node
                nodeMaxEnd = delta + node.maxEnd;
                if (nodeMaxEnd < intervalStart) {
                    // cover case b) from above
                    // there is no need to search this node or its children
                    setNodeIsVisited(node, true);
                    continue;
                }
                if (node.left !== exports.SENTINEL) {
                    // go left
                    node = node.left;
                    continue;
                }
            }
            // handle current node
            nodeStart = delta + node.start;
            if (nodeStart > intervalEnd) {
                // cover case a) from above
                // there is no need to search this node or its right subtree
                setNodeIsVisited(node, true);
                continue;
            }
            nodeEnd = delta + node.end;
            if (nodeEnd >= intervalStart) {
                // There is overlap
                node.setCachedOffsets(nodeStart, nodeEnd, cachedVersionId);
                let include = true;
                if (filterOwnerId && node.ownerId && node.ownerId !== filterOwnerId) {
                    include = false;
                }
                if (filterOutValidation && getNodeIsForValidation(node)) {
                    include = false;
                }
                if (onlyMarginDecorations && !getNodeIsInGlyphMargin(node)) {
                    include = false;
                }
                if (include) {
                    result[resultLen++] = node;
                }
            }
            setNodeIsVisited(node, true);
            if (node.right !== exports.SENTINEL && !getNodeIsVisited(node.right)) {
                // go right
                delta += node.delta;
                node = node.right;
                continue;
            }
        }
        setNodeIsVisited(T.root, false);
        return result;
    }
    //#endregion
    //#region Insertion
    function rbTreeInsert(T, newNode) {
        if (T.root === exports.SENTINEL) {
            newNode.parent = exports.SENTINEL;
            newNode.left = exports.SENTINEL;
            newNode.right = exports.SENTINEL;
            setNodeColor(newNode, 0 /* NodeColor.Black */);
            T.root = newNode;
            return T.root;
        }
        treeInsert(T, newNode);
        recomputeMaxEndWalkToRoot(newNode.parent);
        // repair tree
        let x = newNode;
        while (x !== T.root && getNodeColor(x.parent) === 1 /* NodeColor.Red */) {
            if (x.parent === x.parent.parent.left) {
                const y = x.parent.parent.right;
                if (getNodeColor(y) === 1 /* NodeColor.Red */) {
                    setNodeColor(x.parent, 0 /* NodeColor.Black */);
                    setNodeColor(y, 0 /* NodeColor.Black */);
                    setNodeColor(x.parent.parent, 1 /* NodeColor.Red */);
                    x = x.parent.parent;
                }
                else {
                    if (x === x.parent.right) {
                        x = x.parent;
                        leftRotate(T, x);
                    }
                    setNodeColor(x.parent, 0 /* NodeColor.Black */);
                    setNodeColor(x.parent.parent, 1 /* NodeColor.Red */);
                    rightRotate(T, x.parent.parent);
                }
            }
            else {
                const y = x.parent.parent.left;
                if (getNodeColor(y) === 1 /* NodeColor.Red */) {
                    setNodeColor(x.parent, 0 /* NodeColor.Black */);
                    setNodeColor(y, 0 /* NodeColor.Black */);
                    setNodeColor(x.parent.parent, 1 /* NodeColor.Red */);
                    x = x.parent.parent;
                }
                else {
                    if (x === x.parent.left) {
                        x = x.parent;
                        rightRotate(T, x);
                    }
                    setNodeColor(x.parent, 0 /* NodeColor.Black */);
                    setNodeColor(x.parent.parent, 1 /* NodeColor.Red */);
                    leftRotate(T, x.parent.parent);
                }
            }
        }
        setNodeColor(T.root, 0 /* NodeColor.Black */);
        return newNode;
    }
    function treeInsert(T, z) {
        let delta = 0;
        let x = T.root;
        const zAbsoluteStart = z.start;
        const zAbsoluteEnd = z.end;
        while (true) {
            const cmp = intervalCompare(zAbsoluteStart, zAbsoluteEnd, x.start + delta, x.end + delta);
            if (cmp < 0) {
                // this node should be inserted to the left
                // => it is not affected by the node's delta
                if (x.left === exports.SENTINEL) {
                    z.start -= delta;
                    z.end -= delta;
                    z.maxEnd -= delta;
                    x.left = z;
                    break;
                }
                else {
                    x = x.left;
                }
            }
            else {
                // this node should be inserted to the right
                // => it is not affected by the node's delta
                if (x.right === exports.SENTINEL) {
                    z.start -= (delta + x.delta);
                    z.end -= (delta + x.delta);
                    z.maxEnd -= (delta + x.delta);
                    x.right = z;
                    break;
                }
                else {
                    delta += x.delta;
                    x = x.right;
                }
            }
        }
        z.parent = x;
        z.left = exports.SENTINEL;
        z.right = exports.SENTINEL;
        setNodeColor(z, 1 /* NodeColor.Red */);
    }
    //#endregion
    //#region Deletion
    function rbTreeDelete(T, z) {
        let x;
        let y;
        // RB-DELETE except we don't swap z and y in case c)
        // i.e. we always delete what's pointed at by z.
        if (z.left === exports.SENTINEL) {
            x = z.right;
            y = z;
            // x's delta is no longer influenced by z's delta
            x.delta += z.delta;
            if (x.delta < -1073741824 /* Constants.MIN_SAFE_DELTA */ || x.delta > 1073741824 /* Constants.MAX_SAFE_DELTA */) {
                T.requestNormalizeDelta = true;
            }
            x.start += z.delta;
            x.end += z.delta;
        }
        else if (z.right === exports.SENTINEL) {
            x = z.left;
            y = z;
        }
        else {
            y = leftest(z.right);
            x = y.right;
            // y's delta is no longer influenced by z's delta,
            // but we don't want to walk the entire right-hand-side subtree of x.
            // we therefore maintain z's delta in y, and adjust only x
            x.start += y.delta;
            x.end += y.delta;
            x.delta += y.delta;
            if (x.delta < -1073741824 /* Constants.MIN_SAFE_DELTA */ || x.delta > 1073741824 /* Constants.MAX_SAFE_DELTA */) {
                T.requestNormalizeDelta = true;
            }
            y.start += z.delta;
            y.end += z.delta;
            y.delta = z.delta;
            if (y.delta < -1073741824 /* Constants.MIN_SAFE_DELTA */ || y.delta > 1073741824 /* Constants.MAX_SAFE_DELTA */) {
                T.requestNormalizeDelta = true;
            }
        }
        if (y === T.root) {
            T.root = x;
            setNodeColor(x, 0 /* NodeColor.Black */);
            z.detach();
            resetSentinel();
            recomputeMaxEnd(x);
            T.root.parent = exports.SENTINEL;
            return;
        }
        const yWasRed = (getNodeColor(y) === 1 /* NodeColor.Red */);
        if (y === y.parent.left) {
            y.parent.left = x;
        }
        else {
            y.parent.right = x;
        }
        if (y === z) {
            x.parent = y.parent;
        }
        else {
            if (y.parent === z) {
                x.parent = y;
            }
            else {
                x.parent = y.parent;
            }
            y.left = z.left;
            y.right = z.right;
            y.parent = z.parent;
            setNodeColor(y, getNodeColor(z));
            if (z === T.root) {
                T.root = y;
            }
            else {
                if (z === z.parent.left) {
                    z.parent.left = y;
                }
                else {
                    z.parent.right = y;
                }
            }
            if (y.left !== exports.SENTINEL) {
                y.left.parent = y;
            }
            if (y.right !== exports.SENTINEL) {
                y.right.parent = y;
            }
        }
        z.detach();
        if (yWasRed) {
            recomputeMaxEndWalkToRoot(x.parent);
            if (y !== z) {
                recomputeMaxEndWalkToRoot(y);
                recomputeMaxEndWalkToRoot(y.parent);
            }
            resetSentinel();
            return;
        }
        recomputeMaxEndWalkToRoot(x);
        recomputeMaxEndWalkToRoot(x.parent);
        if (y !== z) {
            recomputeMaxEndWalkToRoot(y);
            recomputeMaxEndWalkToRoot(y.parent);
        }
        // RB-DELETE-FIXUP
        let w;
        while (x !== T.root && getNodeColor(x) === 0 /* NodeColor.Black */) {
            if (x === x.parent.left) {
                w = x.parent.right;
                if (getNodeColor(w) === 1 /* NodeColor.Red */) {
                    setNodeColor(w, 0 /* NodeColor.Black */);
                    setNodeColor(x.parent, 1 /* NodeColor.Red */);
                    leftRotate(T, x.parent);
                    w = x.parent.right;
                }
                if (getNodeColor(w.left) === 0 /* NodeColor.Black */ && getNodeColor(w.right) === 0 /* NodeColor.Black */) {
                    setNodeColor(w, 1 /* NodeColor.Red */);
                    x = x.parent;
                }
                else {
                    if (getNodeColor(w.right) === 0 /* NodeColor.Black */) {
                        setNodeColor(w.left, 0 /* NodeColor.Black */);
                        setNodeColor(w, 1 /* NodeColor.Red */);
                        rightRotate(T, w);
                        w = x.parent.right;
                    }
                    setNodeColor(w, getNodeColor(x.parent));
                    setNodeColor(x.parent, 0 /* NodeColor.Black */);
                    setNodeColor(w.right, 0 /* NodeColor.Black */);
                    leftRotate(T, x.parent);
                    x = T.root;
                }
            }
            else {
                w = x.parent.left;
                if (getNodeColor(w) === 1 /* NodeColor.Red */) {
                    setNodeColor(w, 0 /* NodeColor.Black */);
                    setNodeColor(x.parent, 1 /* NodeColor.Red */);
                    rightRotate(T, x.parent);
                    w = x.parent.left;
                }
                if (getNodeColor(w.left) === 0 /* NodeColor.Black */ && getNodeColor(w.right) === 0 /* NodeColor.Black */) {
                    setNodeColor(w, 1 /* NodeColor.Red */);
                    x = x.parent;
                }
                else {
                    if (getNodeColor(w.left) === 0 /* NodeColor.Black */) {
                        setNodeColor(w.right, 0 /* NodeColor.Black */);
                        setNodeColor(w, 1 /* NodeColor.Red */);
                        leftRotate(T, w);
                        w = x.parent.left;
                    }
                    setNodeColor(w, getNodeColor(x.parent));
                    setNodeColor(x.parent, 0 /* NodeColor.Black */);
                    setNodeColor(w.left, 0 /* NodeColor.Black */);
                    rightRotate(T, x.parent);
                    x = T.root;
                }
            }
        }
        setNodeColor(x, 0 /* NodeColor.Black */);
        resetSentinel();
    }
    function leftest(node) {
        while (node.left !== exports.SENTINEL) {
            node = node.left;
        }
        return node;
    }
    function resetSentinel() {
        exports.SENTINEL.parent = exports.SENTINEL;
        exports.SENTINEL.delta = 0; // optional
        exports.SENTINEL.start = 0; // optional
        exports.SENTINEL.end = 0; // optional
    }
    //#endregion
    //#region Rotations
    function leftRotate(T, x) {
        const y = x.right; // set y.
        y.delta += x.delta; // y's delta is no longer influenced by x's delta
        if (y.delta < -1073741824 /* Constants.MIN_SAFE_DELTA */ || y.delta > 1073741824 /* Constants.MAX_SAFE_DELTA */) {
            T.requestNormalizeDelta = true;
        }
        y.start += x.delta;
        y.end += x.delta;
        x.right = y.left; // turn y's left subtree into x's right subtree.
        if (y.left !== exports.SENTINEL) {
            y.left.parent = x;
        }
        y.parent = x.parent; // link x's parent to y.
        if (x.parent === exports.SENTINEL) {
            T.root = y;
        }
        else if (x === x.parent.left) {
            x.parent.left = y;
        }
        else {
            x.parent.right = y;
        }
        y.left = x; // put x on y's left.
        x.parent = y;
        recomputeMaxEnd(x);
        recomputeMaxEnd(y);
    }
    function rightRotate(T, y) {
        const x = y.left;
        y.delta -= x.delta;
        if (y.delta < -1073741824 /* Constants.MIN_SAFE_DELTA */ || y.delta > 1073741824 /* Constants.MAX_SAFE_DELTA */) {
            T.requestNormalizeDelta = true;
        }
        y.start -= x.delta;
        y.end -= x.delta;
        y.left = x.right;
        if (x.right !== exports.SENTINEL) {
            x.right.parent = y;
        }
        x.parent = y.parent;
        if (y.parent === exports.SENTINEL) {
            T.root = x;
        }
        else if (y === y.parent.right) {
            y.parent.right = x;
        }
        else {
            y.parent.left = x;
        }
        x.right = y;
        y.parent = x;
        recomputeMaxEnd(y);
        recomputeMaxEnd(x);
    }
    //#endregion
    //#region max end computation
    function computeMaxEnd(node) {
        let maxEnd = node.end;
        if (node.left !== exports.SENTINEL) {
            const leftMaxEnd = node.left.maxEnd;
            if (leftMaxEnd > maxEnd) {
                maxEnd = leftMaxEnd;
            }
        }
        if (node.right !== exports.SENTINEL) {
            const rightMaxEnd = node.right.maxEnd + node.delta;
            if (rightMaxEnd > maxEnd) {
                maxEnd = rightMaxEnd;
            }
        }
        return maxEnd;
    }
    function recomputeMaxEnd(node) {
        node.maxEnd = computeMaxEnd(node);
    }
    exports.recomputeMaxEnd = recomputeMaxEnd;
    function recomputeMaxEndWalkToRoot(node) {
        while (node !== exports.SENTINEL) {
            const maxEnd = computeMaxEnd(node);
            if (node.maxEnd === maxEnd) {
                // no need to go further
                return;
            }
            node.maxEnd = maxEnd;
            node = node.parent;
        }
    }
    //#endregion
    //#region utils
    function intervalCompare(aStart, aEnd, bStart, bEnd) {
        if (aStart === bStart) {
            return aEnd - bEnd;
        }
        return aStart - bStart;
    }
    exports.intervalCompare = intervalCompare;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJ2YWxUcmVlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9tb2RlbC9pbnRlcnZhbFRyZWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLEVBQUU7SUFDRixtR0FBbUc7SUFDbkcsRUFBRTtJQUVGLElBQWtCLFNBUWpCO0lBUkQsV0FBa0IsU0FBUztRQUMxQixtREFBc0MsQ0FBQTtRQUN0QyxtREFBc0MsQ0FBQTtRQUN0Qyx5REFBNEMsQ0FBQTtRQUM1QyxxREFBd0MsQ0FBQTtRQUN4QyxpRUFBb0QsQ0FBQTtRQUNwRCw4RUFBaUUsQ0FBQTtRQUNqRSw0RUFBK0QsQ0FBQTtJQUNoRSxDQUFDLEVBUmlCLFNBQVMseUJBQVQsU0FBUyxRQVExQjtJQUVELElBQWtCLFNBR2pCO0lBSEQsV0FBa0IsU0FBUztRQUMxQiwyQ0FBUyxDQUFBO1FBQ1QsdUNBQU8sQ0FBQTtJQUNSLENBQUMsRUFIaUIsU0FBUyx5QkFBVCxTQUFTLFFBRzFCO0lBRUQsSUFBVyxTQThDVjtJQTlDRCxXQUFXLFNBQVM7UUFDbkIsbURBQXNCLENBQUE7UUFDdEIsbUVBQTZCLENBQUE7UUFDN0IsdURBQWUsQ0FBQTtRQUVmLDJEQUEwQixDQUFBO1FBQzFCLDJFQUFpQyxDQUFBO1FBQ2pDLCtEQUFtQixDQUFBO1FBRW5CLHVFQUFnQyxDQUFBO1FBQ2hDLHVGQUF1QyxDQUFBO1FBQ3ZDLDJFQUF5QixDQUFBO1FBRXpCLDhEQUEyQixDQUFBO1FBQzNCLDZFQUFrQyxDQUFBO1FBQ2xDLGlFQUFvQixDQUFBO1FBRXBCLG9GQUFzQyxDQUFBO1FBQ3RDLG1HQUE2QyxDQUFBO1FBQzdDLHVGQUErQixDQUFBO1FBRS9CLDBEQUF5QixDQUFBO1FBQ3pCLHlFQUFnQyxDQUFBO1FBQ2hDLDZEQUFrQixDQUFBO1FBRWxCOzs7Ozs7Ozs7Ozs7V0FZRztRQUNILHVFQUEy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