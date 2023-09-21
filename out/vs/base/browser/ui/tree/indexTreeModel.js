/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/tree/tree", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/symbols", "vs/base/common/diff/diff", "vs/base/common/event", "vs/base/common/iterator"], function (require, exports, tree_1, arrays_1, async_1, symbols_1, diff_1, event_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IndexTreeModel = exports.getVisibleState = exports.isFilterResult = void 0;
    function isFilterResult(obj) {
        return typeof obj === 'object' && 'visibility' in obj && 'data' in obj;
    }
    exports.isFilterResult = isFilterResult;
    function getVisibleState(visibility) {
        switch (visibility) {
            case true: return 1 /* TreeVisibility.Visible */;
            case false: return 0 /* TreeVisibility.Hidden */;
            default: return visibility;
        }
    }
    exports.getVisibleState = getVisibleState;
    function isCollapsibleStateUpdate(update) {
        return typeof update.collapsible === 'boolean';
    }
    class IndexTreeModel {
        constructor(user, list, rootElement, options = {}) {
            this.user = user;
            this.list = list;
            this.rootRef = [];
            this.eventBufferer = new event_1.EventBufferer();
            this._onDidChangeCollapseState = new event_1.Emitter();
            this.onDidChangeCollapseState = this.eventBufferer.wrapEvent(this._onDidChangeCollapseState.event);
            this._onDidChangeRenderNodeCount = new event_1.Emitter();
            this.onDidChangeRenderNodeCount = this.eventBufferer.wrapEvent(this._onDidChangeRenderNodeCount.event);
            this._onDidSplice = new event_1.Emitter();
            this.onDidSplice = this._onDidSplice.event;
            this.refilterDelayer = new async_1.Delayer(symbols_1.MicrotaskDelay);
            this.collapseByDefault = typeof options.collapseByDefault === 'undefined' ? false : options.collapseByDefault;
            this.filter = options.filter;
            this.autoExpandSingleChildren = typeof options.autoExpandSingleChildren === 'undefined' ? false : options.autoExpandSingleChildren;
            this.root = {
                parent: undefined,
                element: rootElement,
                children: [],
                depth: 0,
                visibleChildrenCount: 0,
                visibleChildIndex: -1,
                collapsible: false,
                collapsed: false,
                renderNodeCount: 0,
                visibility: 1 /* TreeVisibility.Visible */,
                visible: true,
                filterData: undefined
            };
        }
        splice(location, deleteCount, toInsert = iterator_1.Iterable.empty(), options = {}) {
            if (location.length === 0) {
                throw new tree_1.TreeError(this.user, 'Invalid tree location');
            }
            if (options.diffIdentityProvider) {
                this.spliceSmart(options.diffIdentityProvider, location, deleteCount, toInsert, options);
            }
            else {
                this.spliceSimple(location, deleteCount, toInsert, options);
            }
        }
        spliceSmart(identity, location, deleteCount, toInsertIterable = iterator_1.Iterable.empty(), options, recurseLevels = options.diffDepth ?? 0) {
            const { parentNode } = this.getParentNodeWithListIndex(location);
            if (!parentNode.lastDiffIds) {
                return this.spliceSimple(location, deleteCount, toInsertIterable, options);
            }
            const toInsert = [...toInsertIterable];
            const index = location[location.length - 1];
            const diff = new diff_1.LcsDiff({ getElements: () => parentNode.lastDiffIds }, {
                getElements: () => [
                    ...parentNode.children.slice(0, index),
                    ...toInsert,
                    ...parentNode.children.slice(index + deleteCount),
                ].map(e => identity.getId(e.element).toString())
            }).ComputeDiff(false);
            // if we were given a 'best effort' diff, use default behavior
            if (diff.quitEarly) {
                parentNode.lastDiffIds = undefined;
                return this.spliceSimple(location, deleteCount, toInsert, options);
            }
            const locationPrefix = location.slice(0, -1);
            const recurseSplice = (fromOriginal, fromModified, count) => {
                if (recurseLevels > 0) {
                    for (let i = 0; i < count; i++) {
                        fromOriginal--;
                        fromModified--;
                        this.spliceSmart(identity, [...locationPrefix, fromOriginal, 0], Number.MAX_SAFE_INTEGER, toInsert[fromModified].children, options, recurseLevels - 1);
                    }
                }
            };
            let lastStartO = Math.min(parentNode.children.length, index + deleteCount);
            let lastStartM = toInsert.length;
            for (const change of diff.changes.sort((a, b) => b.originalStart - a.originalStart)) {
                recurseSplice(lastStartO, lastStartM, lastStartO - (change.originalStart + change.originalLength));
                lastStartO = change.originalStart;
                lastStartM = change.modifiedStart - index;
                this.spliceSimple([...locationPrefix, lastStartO], change.originalLength, iterator_1.Iterable.slice(toInsert, lastStartM, lastStartM + change.modifiedLength), options);
            }
            // at this point, startO === startM === count since any remaining prefix should match
            recurseSplice(lastStartO, lastStartM, lastStartO);
        }
        spliceSimple(location, deleteCount, toInsert = iterator_1.Iterable.empty(), { onDidCreateNode, onDidDeleteNode, diffIdentityProvider }) {
            const { parentNode, listIndex, revealed, visible } = this.getParentNodeWithListIndex(location);
            const treeListElementsToInsert = [];
            const nodesToInsertIterator = iterator_1.Iterable.map(toInsert, el => this.createTreeNode(el, parentNode, parentNode.visible ? 1 /* TreeVisibility.Visible */ : 0 /* TreeVisibility.Hidden */, revealed, treeListElementsToInsert, onDidCreateNode));
            const lastIndex = location[location.length - 1];
            const lastHadChildren = parentNode.children.length > 0;
            // figure out what's the visible child start index right before the
            // splice point
            let visibleChildStartIndex = 0;
            for (let i = lastIndex; i >= 0 && i < parentNode.children.length; i--) {
                const child = parentNode.children[i];
                if (child.visible) {
                    visibleChildStartIndex = child.visibleChildIndex;
                    break;
                }
            }
            const nodesToInsert = [];
            let insertedVisibleChildrenCount = 0;
            let renderNodeCount = 0;
            for (const child of nodesToInsertIterator) {
                nodesToInsert.push(child);
                renderNodeCount += child.renderNodeCount;
                if (child.visible) {
                    child.visibleChildIndex = visibleChildStartIndex + insertedVisibleChildrenCount++;
                }
            }
            const deletedNodes = (0, arrays_1.splice)(parentNode.children, lastIndex, deleteCount, nodesToInsert);
            if (!diffIdentityProvider) {
                parentNode.lastDiffIds = undefined;
            }
            else if (parentNode.lastDiffIds) {
                (0, arrays_1.splice)(parentNode.lastDiffIds, lastIndex, deleteCount, nodesToInsert.map(n => diffIdentityProvider.getId(n.element).toString()));
            }
            else {
                parentNode.lastDiffIds = parentNode.children.map(n => diffIdentityProvider.getId(n.element).toString());
            }
            // figure out what is the count of deleted visible children
            let deletedVisibleChildrenCount = 0;
            for (const child of deletedNodes) {
                if (child.visible) {
                    deletedVisibleChildrenCount++;
                }
            }
            // and adjust for all visible children after the splice point
            if (deletedVisibleChildrenCount !== 0) {
                for (let i = lastIndex + nodesToInsert.length; i < parentNode.children.length; i++) {
                    const child = parentNode.children[i];
                    if (child.visible) {
                        child.visibleChildIndex -= deletedVisibleChildrenCount;
                    }
                }
            }
            // update parent's visible children count
            parentNode.visibleChildrenCount += insertedVisibleChildrenCount - deletedVisibleChildrenCount;
            if (revealed && visible) {
                const visibleDeleteCount = deletedNodes.reduce((r, node) => r + (node.visible ? node.renderNodeCount : 0), 0);
                this._updateAncestorsRenderNodeCount(parentNode, renderNodeCount - visibleDeleteCount);
                this.list.splice(listIndex, visibleDeleteCount, treeListElementsToInsert);
            }
            if (deletedNodes.length > 0 && onDidDeleteNode) {
                const visit = (node) => {
                    onDidDeleteNode(node);
                    node.children.forEach(visit);
                };
                deletedNodes.forEach(visit);
            }
            this._onDidSplice.fire({ insertedNodes: nodesToInsert, deletedNodes });
            const currentlyHasChildren = parentNode.children.length > 0;
            if (lastHadChildren !== currentlyHasChildren) {
                this.setCollapsible(location.slice(0, -1), currentlyHasChildren);
            }
            let node = parentNode;
            while (node) {
                if (node.visibility === 2 /* TreeVisibility.Recurse */) {
                    // delayed to avoid excessive refiltering, see #135941
                    this.refilterDelayer.trigger(() => this.refilter());
                    break;
                }
                node = node.parent;
            }
        }
        rerender(location) {
            if (location.length === 0) {
                throw new tree_1.TreeError(this.user, 'Invalid tree location');
            }
            const { node, listIndex, revealed } = this.getTreeNodeWithListIndex(location);
            if (node.visible && revealed) {
                this.list.splice(listIndex, 1, [node]);
            }
        }
        updateElementHeight(location, height) {
            if (location.length === 0) {
                throw new tree_1.TreeError(this.user, 'Invalid tree location');
            }
            const { listIndex } = this.getTreeNodeWithListIndex(location);
            this.list.updateElementHeight(listIndex, height);
        }
        has(location) {
            return this.hasTreeNode(location);
        }
        getListIndex(location) {
            const { listIndex, visible, revealed } = this.getTreeNodeWithListIndex(location);
            return visible && revealed ? listIndex : -1;
        }
        getListRenderCount(location) {
            return this.getTreeNode(location).renderNodeCount;
        }
        isCollapsible(location) {
            return this.getTreeNode(location).collapsible;
        }
        setCollapsible(location, collapsible) {
            const node = this.getTreeNode(location);
            if (typeof collapsible === 'undefined') {
                collapsible = !node.collapsible;
            }
            const update = { collapsible };
            return this.eventBufferer.bufferEvents(() => this._setCollapseState(location, update));
        }
        isCollapsed(location) {
            return this.getTreeNode(location).collapsed;
        }
        setCollapsed(location, collapsed, recursive) {
            const node = this.getTreeNode(location);
            if (typeof collapsed === 'undefined') {
                collapsed = !node.collapsed;
            }
            const update = { collapsed, recursive: recursive || false };
            return this.eventBufferer.bufferEvents(() => this._setCollapseState(location, update));
        }
        _setCollapseState(location, update) {
            const { node, listIndex, revealed } = this.getTreeNodeWithListIndex(location);
            const result = this._setListNodeCollapseState(node, listIndex, revealed, update);
            if (node !== this.root && this.autoExpandSingleChildren && result && !isCollapsibleStateUpdate(update) && node.collapsible && !node.collapsed && !update.recursive) {
                let onlyVisibleChildIndex = -1;
                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i];
                    if (child.visible) {
                        if (onlyVisibleChildIndex > -1) {
                            onlyVisibleChildIndex = -1;
                            break;
                        }
                        else {
                            onlyVisibleChildIndex = i;
                        }
                    }
                }
                if (onlyVisibleChildIndex > -1) {
                    this._setCollapseState([...location, onlyVisibleChildIndex], update);
                }
            }
            return result;
        }
        _setListNodeCollapseState(node, listIndex, revealed, update) {
            const result = this._setNodeCollapseState(node, update, false);
            if (!revealed || !node.visible || !result) {
                return result;
            }
            const previousRenderNodeCount = node.renderNodeCount;
            const toInsert = this.updateNodeAfterCollapseChange(node);
            const deleteCount = previousRenderNodeCount - (listIndex === -1 ? 0 : 1);
            this.list.splice(listIndex + 1, deleteCount, toInsert.slice(1));
            return result;
        }
        _setNodeCollapseState(node, update, deep) {
            let result;
            if (node === this.root) {
                result = false;
            }
            else {
                if (isCollapsibleStateUpdate(update)) {
                    result = node.collapsible !== update.collapsible;
                    node.collapsible = update.collapsible;
                }
                else if (!node.collapsible) {
                    result = false;
                }
                else {
                    result = node.collapsed !== update.collapsed;
                    node.collapsed = update.collapsed;
                }
                if (result) {
                    this._onDidChangeCollapseState.fire({ node, deep });
                }
            }
            if (!isCollapsibleStateUpdate(update) && update.recursive) {
                for (const child of node.children) {
                    result = this._setNodeCollapseState(child, update, true) || result;
                }
            }
            return result;
        }
        expandTo(location) {
            this.eventBufferer.bufferEvents(() => {
                let node = this.getTreeNode(location);
                while (node.parent) {
                    node = node.parent;
                    location = location.slice(0, location.length - 1);
                    if (node.collapsed) {
                        this._setCollapseState(location, { collapsed: false, recursive: false });
                    }
                }
            });
        }
        refilter() {
            const previousRenderNodeCount = this.root.renderNodeCount;
            const toInsert = this.updateNodeAfterFilterChange(this.root);
            this.list.splice(0, previousRenderNodeCount, toInsert);
            this.refilterDelayer.cancel();
        }
        createTreeNode(treeElement, parent, parentVisibility, revealed, treeListElements, onDidCreateNode) {
            const node = {
                parent,
                element: treeElement.element,
                children: [],
                depth: parent.depth + 1,
                visibleChildrenCount: 0,
                visibleChildIndex: -1,
                collapsible: typeof treeElement.collapsible === 'boolean' ? treeElement.collapsible : (typeof treeElement.collapsed !== 'undefined'),
                collapsed: typeof treeElement.collapsed === 'undefined' ? this.collapseByDefault : treeElement.collapsed,
                renderNodeCount: 1,
                visibility: 1 /* TreeVisibility.Visible */,
                visible: true,
                filterData: undefined
            };
            const visibility = this._filterNode(node, parentVisibility);
            node.visibility = visibility;
            if (revealed) {
                treeListElements.push(node);
            }
            const childElements = treeElement.children || iterator_1.Iterable.empty();
            const childRevealed = revealed && visibility !== 0 /* TreeVisibility.Hidden */ && !node.collapsed;
            let visibleChildrenCount = 0;
            let renderNodeCount = 1;
            for (const el of childElements) {
                const child = this.createTreeNode(el, node, visibility, childRevealed, treeListElements, onDidCreateNode);
                node.children.push(child);
                renderNodeCount += child.renderNodeCount;
                if (child.visible) {
                    child.visibleChildIndex = visibleChildrenCount++;
                }
            }
            node.collapsible = node.collapsible || node.children.length > 0;
            node.visibleChildrenCount = visibleChildrenCount;
            node.visible = visibility === 2 /* TreeVisibility.Recurse */ ? visibleChildrenCount > 0 : (visibility === 1 /* TreeVisibility.Visible */);
            if (!node.visible) {
                node.renderNodeCount = 0;
                if (revealed) {
                    treeListElements.pop();
                }
            }
            else if (!node.collapsed) {
                node.renderNodeCount = renderNodeCount;
            }
            onDidCreateNode?.(node);
            return node;
        }
        updateNodeAfterCollapseChange(node) {
            const previousRenderNodeCount = node.renderNodeCount;
            const result = [];
            this._updateNodeAfterCollapseChange(node, result);
            this._updateAncestorsRenderNodeCount(node.parent, result.length - previousRenderNodeCount);
            return result;
        }
        _updateNodeAfterCollapseChange(node, result) {
            if (node.visible === false) {
                return 0;
            }
            result.push(node);
            node.renderNodeCount = 1;
            if (!node.collapsed) {
                for (const child of node.children) {
                    node.renderNodeCount += this._updateNodeAfterCollapseChange(child, result);
                }
            }
            this._onDidChangeRenderNodeCount.fire(node);
            return node.renderNodeCount;
        }
        updateNodeAfterFilterChange(node) {
            const previousRenderNodeCount = node.renderNodeCount;
            const result = [];
            this._updateNodeAfterFilterChange(node, node.visible ? 1 /* TreeVisibility.Visible */ : 0 /* TreeVisibility.Hidden */, result);
            this._updateAncestorsRenderNodeCount(node.parent, result.length - previousRenderNodeCount);
            return result;
        }
        _updateNodeAfterFilterChange(node, parentVisibility, result, revealed = true) {
            let visibility;
            if (node !== this.root) {
                visibility = this._filterNode(node, parentVisibility);
                if (visibility === 0 /* TreeVisibility.Hidden */) {
                    node.visible = false;
                    node.renderNodeCount = 0;
                    return false;
                }
                if (revealed) {
                    result.push(node);
                }
            }
            const resultStartLength = result.length;
            node.renderNodeCount = node === this.root ? 0 : 1;
            let hasVisibleDescendants = false;
            if (!node.collapsed || visibility !== 0 /* TreeVisibility.Hidden */) {
                let visibleChildIndex = 0;
                for (const child of node.children) {
                    hasVisibleDescendants = this._updateNodeAfterFilterChange(child, visibility, result, revealed && !node.collapsed) || hasVisibleDescendants;
                    if (child.visible) {
                        child.visibleChildIndex = visibleChildIndex++;
                    }
                }
                node.visibleChildrenCount = visibleChildIndex;
            }
            else {
                node.visibleChildrenCount = 0;
            }
            if (node !== this.root) {
                node.visible = visibility === 2 /* TreeVisibility.Recurse */ ? hasVisibleDescendants : (visibility === 1 /* TreeVisibility.Visible */);
                node.visibility = visibility;
            }
            if (!node.visible) {
                node.renderNodeCount = 0;
                if (revealed) {
                    result.pop();
                }
            }
            else if (!node.collapsed) {
                node.renderNodeCount += result.length - resultStartLength;
            }
            this._onDidChangeRenderNodeCount.fire(node);
            return node.visible;
        }
        _updateAncestorsRenderNodeCount(node, diff) {
            if (diff === 0) {
                return;
            }
            while (node) {
                node.renderNodeCount += diff;
                this._onDidChangeRenderNodeCount.fire(node);
                node = node.parent;
            }
        }
        _filterNode(node, parentVisibility) {
            const result = this.filter ? this.filter.filter(node.element, parentVisibility) : 1 /* TreeVisibility.Visible */;
            if (typeof result === 'boolean') {
                node.filterData = undefined;
                return result ? 1 /* TreeVisibility.Visible */ : 0 /* TreeVisibility.Hidden */;
            }
            else if (isFilterResult(result)) {
                node.filterData = result.data;
                return getVisibleState(result.visibility);
            }
            else {
                node.filterData = undefined;
                return getVisibleState(result);
            }
        }
        // cheap
        hasTreeNode(location, node = this.root) {
            if (!location || location.length === 0) {
                return true;
            }
            const [index, ...rest] = location;
            if (index < 0 || index > node.children.length) {
                return false;
            }
            return this.hasTreeNode(rest, node.children[index]);
        }
        // cheap
        getTreeNode(location, node = this.root) {
            if (!location || location.length === 0) {
                return node;
            }
            const [index, ...rest] = location;
            if (index < 0 || index > node.children.length) {
                throw new tree_1.TreeError(this.user, 'Invalid tree location');
            }
            return this.getTreeNode(rest, node.children[index]);
        }
        // expensive
        getTreeNodeWithListIndex(location) {
            if (location.length === 0) {
                return { node: this.root, listIndex: -1, revealed: true, visible: false };
            }
            const { parentNode, listIndex, revealed, visible } = this.getParentNodeWithListIndex(location);
            const index = location[location.length - 1];
            if (index < 0 || index > parentNode.children.length) {
                throw new tree_1.TreeError(this.user, 'Invalid tree location');
            }
            const node = parentNode.children[index];
            return { node, listIndex, revealed, visible: visible && node.visible };
        }
        getParentNodeWithListIndex(location, node = this.root, listIndex = 0, revealed = true, visible = true) {
            const [index, ...rest] = location;
            if (index < 0 || index > node.children.length) {
                throw new tree_1.TreeError(this.user, 'Invalid tree location');
            }
            // TODO@joao perf!
            for (let i = 0; i < index; i++) {
                listIndex += node.children[i].renderNodeCount;
            }
            revealed = revealed && !node.collapsed;
            visible = visible && node.visible;
            if (rest.length === 0) {
                return { parentNode: node, listIndex, revealed, visible };
            }
            return this.getParentNodeWithListIndex(rest, node.children[index], listIndex + 1, revealed, visible);
        }
        getNode(location = []) {
            return this.getTreeNode(location);
        }
        // TODO@joao perf!
        getNodeLocation(node) {
            const location = [];
            let indexTreeNode = node; // typing woes
            while (indexTreeNode.parent) {
                location.push(indexTreeNode.parent.children.indexOf(indexTreeNode));
                indexTreeNode = indexTreeNode.parent;
            }
            return location.reverse();
        }
        getParentNodeLocation(location) {
            if (location.length === 0) {
                return undefined;
            }
            else if (location.length === 1) {
                return [];
            }
            else {
                return (0, arrays_1.tail2)(location)[0];
            }
        }
        getFirstElementChild(location) {
            const node = this.getTreeNode(location);
            if (node.children.length === 0) {
                return undefined;
            }
            return node.children[0].element;
        }
        getLastElementAncestor(location = []) {
            const node = this.getTreeNode(location);
            if (node.children.length === 0) {
                return undefined;
            }
            return this._getLastElementAncestor(node);
        }
        _getLastElementAncestor(node) {
            if (node.children.length === 0) {
                return node.element;
            }
            return this._getLastElementAncestor(node.children[node.children.length - 1]);
        }
    }
    exports.IndexTreeModel = IndexTreeModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhUcmVlTW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvdWkvdHJlZS9pbmRleFRyZWVNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUEyQmhHLFNBQWdCLGNBQWMsQ0FBSSxHQUFRO1FBQ3pDLE9BQU8sT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLFlBQVksSUFBSSxHQUFHLElBQUksTUFBTSxJQUFJLEdBQUcsQ0FBQztJQUN4RSxDQUFDO0lBRkQsd0NBRUM7SUFFRCxTQUFnQixlQUFlLENBQUMsVUFBb0M7UUFDbkUsUUFBUSxVQUFVLEVBQUU7WUFDbkIsS0FBSyxJQUFJLENBQUMsQ0FBQyxzQ0FBOEI7WUFDekMsS0FBSyxLQUFLLENBQUMsQ0FBQyxxQ0FBNkI7WUFDekMsT0FBTyxDQUFDLENBQUMsT0FBTyxVQUFVLENBQUM7U0FDM0I7SUFDRixDQUFDO0lBTkQsMENBTUM7SUErQ0QsU0FBUyx3QkFBd0IsQ0FBQyxNQUEyQjtRQUM1RCxPQUFPLE9BQVEsTUFBYyxDQUFDLFdBQVcsS0FBSyxTQUFTLENBQUM7SUFDekQsQ0FBQztJQU1ELE1BQWEsY0FBYztRQXNCMUIsWUFDUyxJQUFZLEVBQ1osSUFBc0MsRUFDOUMsV0FBYyxFQUNkLFVBQWtELEVBQUU7WUFINUMsU0FBSSxHQUFKLElBQUksQ0FBUTtZQUNaLFNBQUksR0FBSixJQUFJLENBQWtDO1lBdEJ0QyxZQUFPLEdBQUcsRUFBRSxDQUFDO1lBR2Qsa0JBQWEsR0FBRyxJQUFJLHFCQUFhLEVBQUUsQ0FBQztZQUUzQiw4QkFBeUIsR0FBRyxJQUFJLGVBQU8sRUFBNkMsQ0FBQztZQUM3Riw2QkFBd0IsR0FBcUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXhJLGdDQUEyQixHQUFH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