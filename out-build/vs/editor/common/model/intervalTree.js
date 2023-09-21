/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9B = exports.$8B = exports.$7B = exports.$6B = exports.$5B = exports.$4B = exports.$3B = exports.$2B = exports.NodeColor = exports.ClassName = void 0;
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
    function $2B(node) {
        return ((node.metadata & 1 /* Constants.ColorMask */) >>> 0 /* Constants.ColorOffset */);
    }
    exports.$2B = $2B;
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
    function $3B(node, stickiness) {
        _setNodeStickiness(node, stickiness);
    }
    exports.$3B = $3B;
    class $4B {
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
    exports.$4B = $4B;
    exports.$5B = new $4B(null, 0, 0);
    exports.$5B.parent = exports.$5B;
    exports.$5B.left = exports.$5B;
    exports.$5B.right = exports.$5B;
    setNodeColor(exports.$5B, 0 /* NodeColor.Black */);
    class $6B {
        constructor() {
            this.root = exports.$5B;
            this.requestNormalizeDelta = false;
        }
        intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations) {
            if (this.root === exports.$5B) {
                return [];
            }
            return intervalSearch(this, start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
        }
        search(filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations) {
            if (this.root === exports.$5B) {
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
            this.a();
        }
        delete(node) {
            rbTreeDelete(this, node);
            this.a();
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
            this.a();
            // (3) edit all tree nodes except the nodes of interest
            noOverlapReplace(this, offset, offset + length, textLength);
            this.a();
            // (4) edit the nodes of interest and insert them back in the tree
            for (let i = 0, len = nodesOfInterest.length; i < len; i++) {
                const node = nodesOfInterest[i];
                node.start = node.cachedAbsoluteStart;
                node.end = node.cachedAbsoluteEnd;
                $7B(node, offset, (offset + length), textLength, forceMoveMarkers);
                node.maxEnd = node.end;
                rbTreeInsert(this, node);
            }
            this.a();
        }
        getAllInOrder() {
            return search(this, 0, false, 0, false);
        }
        a() {
            if (!this.requestNormalizeDelta) {
                return;
            }
            this.requestNormalizeDelta = false;
            normalizeDelta(this);
        }
    }
    exports.$6B = $6B;
    //#region Delta Normalization
    function normalizeDelta(T) {
        let node = T.root;
        let delta = 0;
        while (node !== exports.$5B) {
            if (node.left !== exports.$5B && !getNodeIsVisited(node.left)) {
                // go left
                node = node.left;
                continue;
            }
            if (node.right !== exports.$5B && !getNodeIsVisited(node.right)) {
                // go right
                delta += node.delta;
                node = node.right;
                continue;
            }
            // handle current node
            node.start = delta + node.start;
            node.end = delta + node.end;
            node.delta = 0;
            $8B(node);
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
    function $7B(node, start, end, textLength, forceMoveMarkers) {
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
    exports.$7B = $7B;
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
        while (node !== exports.$5B) {
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
                if (node.left !== exports.$5B) {
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
            if (node.right !== exports.$5B && !getNodeIsVisited(node.right)) {
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
        while (node !== exports.$5B) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                if (node === node.parent.right) {
                    delta -= node.parent.delta;
                }
                $8B(node);
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
                if (node.left !== exports.$5B) {
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
            if (node.right !== exports.$5B && !getNodeIsVisited(node.right)) {
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
        while (node !== exports.$5B) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                node = node.parent;
                continue;
            }
            if (node.left !== exports.$5B && !getNodeIsVisited(node.left)) {
                // go left
                node = node.left;
                continue;
            }
            // handle current node
            if (node.ownerId === ownerId) {
                result[resultLen++] = node;
            }
            setNodeIsVisited(node, true);
            if (node.right !== exports.$5B && !getNodeIsVisited(node.right)) {
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
        while (node !== exports.$5B) {
            if (getNodeIsVisited(node)) {
                // going up from this node
                setNodeIsVisited(node.left, false);
                setNodeIsVisited(node.right, false);
                node = node.parent;
                continue;
            }
            if (node.left !== exports.$5B && !getNodeIsVisited(node.left)) {
                // go left
                node = node.left;
                continue;
            }
            if (node.right !== exports.$5B && !getNodeIsVisited(node.right)) {
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
        while (node !== exports.$5B) {
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
            if (node.left !== exports.$5B && !getNodeIsVisited(node.left)) {
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
            if (node.right !== exports.$5B && !getNodeIsVisited(node.right)) {
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
        while (node !== exports.$5B) {
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
                if (node.left !== exports.$5B) {
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
            if (node.right !== exports.$5B && !getNodeIsVisited(node.right)) {
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
        if (T.root === exports.$5B) {
            newNode.parent = exports.$5B;
            newNode.left = exports.$5B;
            newNode.right = exports.$5B;
            setNodeColor(newNode, 0 /* NodeColor.Black */);
            T.root = newNode;
            return T.root;
        }
        treeInsert(T, newNode);
        recomputeMaxEndWalkToRoot(newNode.parent);
        // repair tree
        let x = newNode;
        while (x !== T.root && $2B(x.parent) === 1 /* NodeColor.Red */) {
            if (x.parent === x.parent.parent.left) {
                const y = x.parent.parent.right;
                if ($2B(y) === 1 /* NodeColor.Red */) {
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
                if ($2B(y) === 1 /* NodeColor.Red */) {
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
            const cmp = $9B(zAbsoluteStart, zAbsoluteEnd, x.start + delta, x.end + delta);
            if (cmp < 0) {
                // this node should be inserted to the left
                // => it is not affected by the node's delta
                if (x.left === exports.$5B) {
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
                if (x.right === exports.$5B) {
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
        z.left = exports.$5B;
        z.right = exports.$5B;
        setNodeColor(z, 1 /* NodeColor.Red */);
    }
    //#endregion
    //#region Deletion
    function rbTreeDelete(T, z) {
        let x;
        let y;
        // RB-DELETE except we don't swap z and y in case c)
        // i.e. we always delete what's pointed at by z.
        if (z.left === exports.$5B) {
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
        else if (z.right === exports.$5B) {
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
            $8B(x);
            T.root.parent = exports.$5B;
            return;
        }
        const yWasRed = ($2B(y) === 1 /* NodeColor.Red */);
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
            setNodeColor(y, $2B(z));
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
            if (y.left !== exports.$5B) {
                y.left.parent = y;
            }
            if (y.right !== exports.$5B) {
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
        while (x !== T.root && $2B(x) === 0 /* NodeColor.Black */) {
            if (x === x.parent.left) {
                w = x.parent.right;
                if ($2B(w) === 1 /* NodeColor.Red */) {
                    setNodeColor(w, 0 /* NodeColor.Black */);
                    setNodeColor(x.parent, 1 /* NodeColor.Red */);
                    leftRotate(T, x.parent);
                    w = x.parent.right;
                }
                if ($2B(w.left) === 0 /* NodeColor.Black */ && $2B(w.right) === 0 /* NodeColor.Black */) {
                    setNodeColor(w, 1 /* NodeColor.Red */);
                    x = x.parent;
                }
                else {
                    if ($2B(w.right) === 0 /* NodeColor.Black */) {
                        setNodeColor(w.left, 0 /* NodeColor.Black */);
                        setNodeColor(w, 1 /* NodeColor.Red */);
                        rightRotate(T, w);
                        w = x.parent.right;
                    }
                    setNodeColor(w, $2B(x.parent));
                    setNodeColor(x.parent, 0 /* NodeColor.Black */);
                    setNodeColor(w.right, 0 /* NodeColor.Black */);
                    leftRotate(T, x.parent);
                    x = T.root;
                }
            }
            else {
                w = x.parent.left;
                if ($2B(w) === 1 /* NodeColor.Red */) {
                    setNodeColor(w, 0 /* NodeColor.Black */);
                    setNodeColor(x.parent, 1 /* NodeColor.Red */);
                    rightRotate(T, x.parent);
                    w = x.parent.left;
                }
                if ($2B(w.left) === 0 /* NodeColor.Black */ && $2B(w.right) === 0 /* NodeColor.Black */) {
                    setNodeColor(w, 1 /* NodeColor.Red */);
                    x = x.parent;
                }
                else {
                    if ($2B(w.left) === 0 /* NodeColor.Black */) {
                        setNodeColor(w.right, 0 /* NodeColor.Black */);
                        setNodeColor(w, 1 /* NodeColor.Red */);
                        leftRotate(T, w);
                        w = x.parent.left;
                    }
                    setNodeColor(w, $2B(x.parent));
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
        while (node.left !== exports.$5B) {
            node = node.left;
        }
        return node;
    }
    function resetSentinel() {
        exports.$5B.parent = exports.$5B;
        exports.$5B.delta = 0; // optional
        exports.$5B.start = 0; // optional
        exports.$5B.end = 0; // optional
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
        if (y.left !== exports.$5B) {
            y.left.parent = x;
        }
        y.parent = x.parent; // link x's parent to y.
        if (x.parent === exports.$5B) {
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
        $8B(x);
        $8B(y);
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
        if (x.right !== exports.$5B) {
            x.right.parent = y;
        }
        x.parent = y.parent;
        if (y.parent === exports.$5B) {
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
        $8B(y);
        $8B(x);
    }
    //#endregion
    //#region max end computation
    function computeMaxEnd(node) {
        let maxEnd = node.end;
        if (node.left !== exports.$5B) {
            const leftMaxEnd = node.left.maxEnd;
            if (leftMaxEnd > maxEnd) {
                maxEnd = leftMaxEnd;
            }
        }
        if (node.right !== exports.$5B) {
            const rightMaxEnd = node.right.maxEnd + node.delta;
            if (rightMaxEnd > maxEnd) {
                maxEnd = rightMaxEnd;
            }
        }
        return maxEnd;
    }
    function $8B(node) {
        node.maxEnd = computeMaxEnd(node);
    }
    exports.$8B = $8B;
    function recomputeMaxEndWalkToRoot(node) {
        while (node !== exports.$5B) {
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
    function $9B(aStart, aEnd, bStart, bEnd) {
        if (aStart === bStart) {
            return aEnd - bEnd;
        }
        return aStart - bStart;
    }
    exports.$9B = $9B;
});
//#endregion
//# sourceMappingURL=intervalTree.js.map