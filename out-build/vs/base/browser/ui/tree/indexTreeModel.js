/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/tree/tree", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/symbols", "vs/base/common/diff/diff", "vs/base/common/event", "vs/base/common/iterator"], function (require, exports, tree_1, arrays_1, async_1, symbols_1, diff_1, event_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$aS = exports.$_R = exports.$$R = void 0;
    function $$R(obj) {
        return typeof obj === 'object' && 'visibility' in obj && 'data' in obj;
    }
    exports.$$R = $$R;
    function $_R(visibility) {
        switch (visibility) {
            case true: return 1 /* TreeVisibility.Visible */;
            case false: return 0 /* TreeVisibility.Hidden */;
            default: return visibility;
        }
    }
    exports.$_R = $_R;
    function isCollapsibleStateUpdate(update) {
        return typeof update.collapsible === 'boolean';
    }
    class $aS {
        constructor(o, p, rootElement, options = {}) {
            this.o = o;
            this.p = p;
            this.rootRef = [];
            this.d = new event_1.$nd();
            this.f = new event_1.$fd();
            this.onDidChangeCollapseState = this.d.wrapEvent(this.f.event);
            this.g = new event_1.$fd();
            this.onDidChangeRenderNodeCount = this.d.wrapEvent(this.g.event);
            this.l = new event_1.$fd();
            this.onDidSplice = this.l.event;
            this.m = new async_1.$Dg(symbols_1.$cd);
            this.h = typeof options.collapseByDefault === 'undefined' ? false : options.collapseByDefault;
            this.j = options.filter;
            this.k = typeof options.autoExpandSingleChildren === 'undefined' ? false : options.autoExpandSingleChildren;
            this.c = {
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
                throw new tree_1.$9R(this.o, 'Invalid tree location');
            }
            if (options.diffIdentityProvider) {
                this.q(options.diffIdentityProvider, location, deleteCount, toInsert, options);
            }
            else {
                this.s(location, deleteCount, toInsert, options);
            }
        }
        q(identity, location, deleteCount, toInsertIterable = iterator_1.Iterable.empty(), options, recurseLevels = options.diffDepth ?? 0) {
            const { parentNode } = this.G(location);
            if (!parentNode.lastDiffIds) {
                return this.s(location, deleteCount, toInsertIterable, options);
            }
            const toInsert = [...toInsertIterable];
            const index = location[location.length - 1];
            const diff = new diff_1.$qs({ getElements: () => parentNode.lastDiffIds }, {
                getElements: () => [
                    ...parentNode.children.slice(0, index),
                    ...toInsert,
                    ...parentNode.children.slice(index + deleteCount),
                ].map(e => identity.getId(e.element).toString())
            }).ComputeDiff(false);
            // if we were given a 'best effort' diff, use default behavior
            if (diff.quitEarly) {
                parentNode.lastDiffIds = undefined;
                return this.s(location, deleteCount, toInsert, options);
            }
            const locationPrefix = location.slice(0, -1);
            const recurseSplice = (fromOriginal, fromModified, count) => {
                if (recurseLevels > 0) {
                    for (let i = 0; i < count; i++) {
                        fromOriginal--;
                        fromModified--;
                        this.q(identity, [...locationPrefix, fromOriginal, 0], Number.MAX_SAFE_INTEGER, toInsert[fromModified].children, options, recurseLevels - 1);
                    }
                }
            };
            let lastStartO = Math.min(parentNode.children.length, index + deleteCount);
            let lastStartM = toInsert.length;
            for (const change of diff.changes.sort((a, b) => b.originalStart - a.originalStart)) {
                recurseSplice(lastStartO, lastStartM, lastStartO - (change.originalStart + change.originalLength));
                lastStartO = change.originalStart;
                lastStartM = change.modifiedStart - index;
                this.s([...locationPrefix, lastStartO], change.originalLength, iterator_1.Iterable.slice(toInsert, lastStartM, lastStartM + change.modifiedLength), options);
            }
            // at this point, startO === startM === count since any remaining prefix should match
            recurseSplice(lastStartO, lastStartM, lastStartO);
        }
        s(location, deleteCount, toInsert = iterator_1.Iterable.empty(), { onDidCreateNode, onDidDeleteNode, diffIdentityProvider }) {
            const { parentNode, listIndex, revealed, visible } = this.G(location);
            const treeListElementsToInsert = [];
            const nodesToInsertIterator = iterator_1.Iterable.map(toInsert, el => this.w(el, parentNode, parentNode.visible ? 1 /* TreeVisibility.Visible */ : 0 /* TreeVisibility.Hidden */, revealed, treeListElementsToInsert, onDidCreateNode));
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
            const deletedNodes = (0, arrays_1.$4b)(parentNode.children, lastIndex, deleteCount, nodesToInsert);
            if (!diffIdentityProvider) {
                parentNode.lastDiffIds = undefined;
            }
            else if (parentNode.lastDiffIds) {
                (0, arrays_1.$4b)(parentNode.lastDiffIds, lastIndex, deleteCount, nodesToInsert.map(n => diffIdentityProvider.getId(n.element).toString()));
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
                this.B(parentNode, renderNodeCount - visibleDeleteCount);
                this.p.splice(listIndex, visibleDeleteCount, treeListElementsToInsert);
            }
            if (deletedNodes.length > 0 && onDidDeleteNode) {
                const visit = (node) => {
                    onDidDeleteNode(node);
                    node.children.forEach(visit);
                };
                deletedNodes.forEach(visit);
            }
            this.l.fire({ insertedNodes: nodesToInsert, deletedNodes });
            const currentlyHasChildren = parentNode.children.length > 0;
            if (lastHadChildren !== currentlyHasChildren) {
                this.setCollapsible(location.slice(0, -1), currentlyHasChildren);
            }
            let node = parentNode;
            while (node) {
                if (node.visibility === 2 /* TreeVisibility.Recurse */) {
                    // delayed to avoid excessive refiltering, see #135941
                    this.m.trigger(() => this.refilter());
                    break;
                }
                node = node.parent;
            }
        }
        rerender(location) {
            if (location.length === 0) {
                throw new tree_1.$9R(this.o, 'Invalid tree location');
            }
            const { node, listIndex, revealed } = this.F(location);
            if (node.visible && revealed) {
                this.p.splice(listIndex, 1, [node]);
            }
        }
        updateElementHeight(location, height) {
            if (location.length === 0) {
                throw new tree_1.$9R(this.o, 'Invalid tree location');
            }
            const { listIndex } = this.F(location);
            this.p.updateElementHeight(listIndex, height);
        }
        has(location) {
            return this.D(location);
        }
        getListIndex(location) {
            const { listIndex, visible, revealed } = this.F(location);
            return visible && revealed ? listIndex : -1;
        }
        getListRenderCount(location) {
            return this.E(location).renderNodeCount;
        }
        isCollapsible(location) {
            return this.E(location).collapsible;
        }
        setCollapsible(location, collapsible) {
            const node = this.E(location);
            if (typeof collapsible === 'undefined') {
                collapsible = !node.collapsible;
            }
            const update = { collapsible };
            return this.d.bufferEvents(() => this.t(location, update));
        }
        isCollapsed(location) {
            return this.E(location).collapsed;
        }
        setCollapsed(location, collapsed, recursive) {
            const node = this.E(location);
            if (typeof collapsed === 'undefined') {
                collapsed = !node.collapsed;
            }
            const update = { collapsed, recursive: recursive || false };
            return this.d.bufferEvents(() => this.t(location, update));
        }
        t(location, update) {
            const { node, listIndex, revealed } = this.F(location);
            const result = this.u(node, listIndex, revealed, update);
            if (node !== this.c && this.k && result && !isCollapsibleStateUpdate(update) && node.collapsible && !node.collapsed && !update.recursive) {
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
                    this.t([...location, onlyVisibleChildIndex], update);
                }
            }
            return result;
        }
        u(node, listIndex, revealed, update) {
            const result = this.v(node, update, false);
            if (!revealed || !node.visible || !result) {
                return result;
            }
            const previousRenderNodeCount = node.renderNodeCount;
            const toInsert = this.x(node);
            const deleteCount = previousRenderNodeCount - (listIndex === -1 ? 0 : 1);
            this.p.splice(listIndex + 1, deleteCount, toInsert.slice(1));
            return result;
        }
        v(node, update, deep) {
            let result;
            if (node === this.c) {
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
                    this.f.fire({ node, deep });
                }
            }
            if (!isCollapsibleStateUpdate(update) && update.recursive) {
                for (const child of node.children) {
                    result = this.v(child, update, true) || result;
                }
            }
            return result;
        }
        expandTo(location) {
            this.d.bufferEvents(() => {
                let node = this.E(location);
                while (node.parent) {
                    node = node.parent;
                    location = location.slice(0, location.length - 1);
                    if (node.collapsed) {
                        this.t(location, { collapsed: false, recursive: false });
                    }
                }
            });
        }
        refilter() {
            const previousRenderNodeCount = this.c.renderNodeCount;
            const toInsert = this.z(this.c);
            this.p.splice(0, previousRenderNodeCount, toInsert);
            this.m.cancel();
        }
        w(treeElement, parent, parentVisibility, revealed, treeListElements, onDidCreateNode) {
            const node = {
                parent,
                element: treeElement.element,
                children: [],
                depth: parent.depth + 1,
                visibleChildrenCount: 0,
                visibleChildIndex: -1,
                collapsible: typeof treeElement.collapsible === 'boolean' ? treeElement.collapsible : (typeof treeElement.collapsed !== 'undefined'),
                collapsed: typeof treeElement.collapsed === 'undefined' ? this.h : treeElement.collapsed,
                renderNodeCount: 1,
                visibility: 1 /* TreeVisibility.Visible */,
                visible: true,
                filterData: undefined
            };
            const visibility = this.C(node, parentVisibility);
            node.visibility = visibility;
            if (revealed) {
                treeListElements.push(node);
            }
            const childElements = treeElement.children || iterator_1.Iterable.empty();
            const childRevealed = revealed && visibility !== 0 /* TreeVisibility.Hidden */ && !node.collapsed;
            let visibleChildrenCount = 0;
            let renderNodeCount = 1;
            for (const el of childElements) {
                const child = this.w(el, node, visibility, childRevealed, treeListElements, onDidCreateNode);
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
        x(node) {
            const previousRenderNodeCount = node.renderNodeCount;
            const result = [];
            this.y(node, result);
            this.B(node.parent, result.length - previousRenderNodeCount);
            return result;
        }
        y(node, result) {
            if (node.visible === false) {
                return 0;
            }
            result.push(node);
            node.renderNodeCount = 1;
            if (!node.collapsed) {
                for (const child of node.children) {
                    node.renderNodeCount += this.y(child, result);
                }
            }
            this.g.fire(node);
            return node.renderNodeCount;
        }
        z(node) {
            const previousRenderNodeCount = node.renderNodeCount;
            const result = [];
            this.A(node, node.visible ? 1 /* TreeVisibility.Visible */ : 0 /* TreeVisibility.Hidden */, result);
            this.B(node.parent, result.length - previousRenderNodeCount);
            return result;
        }
        A(node, parentVisibility, result, revealed = true) {
            let visibility;
            if (node !== this.c) {
                visibility = this.C(node, parentVisibility);
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
            node.renderNodeCount = node === this.c ? 0 : 1;
            let hasVisibleDescendants = false;
            if (!node.collapsed || visibility !== 0 /* TreeVisibility.Hidden */) {
                let visibleChildIndex = 0;
                for (const child of node.children) {
                    hasVisibleDescendants = this.A(child, visibility, result, revealed && !node.collapsed) || hasVisibleDescendants;
                    if (child.visible) {
                        child.visibleChildIndex = visibleChildIndex++;
                    }
                }
                node.visibleChildrenCount = visibleChildIndex;
            }
            else {
                node.visibleChildrenCount = 0;
            }
            if (node !== this.c) {
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
            this.g.fire(node);
            return node.visible;
        }
        B(node, diff) {
            if (diff === 0) {
                return;
            }
            while (node) {
                node.renderNodeCount += diff;
                this.g.fire(node);
                node = node.parent;
            }
        }
        C(node, parentVisibility) {
            const result = this.j ? this.j.filter(node.element, parentVisibility) : 1 /* TreeVisibility.Visible */;
            if (typeof result === 'boolean') {
                node.filterData = undefined;
                return result ? 1 /* TreeVisibility.Visible */ : 0 /* TreeVisibility.Hidden */;
            }
            else if ($$R(result)) {
                node.filterData = result.data;
                return $_R(result.visibility);
            }
            else {
                node.filterData = undefined;
                return $_R(result);
            }
        }
        // cheap
        D(location, node = this.c) {
            if (!location || location.length === 0) {
                return true;
            }
            const [index, ...rest] = location;
            if (index < 0 || index > node.children.length) {
                return false;
            }
            return this.D(rest, node.children[index]);
        }
        // cheap
        E(location, node = this.c) {
            if (!location || location.length === 0) {
                return node;
            }
            const [index, ...rest] = location;
            if (index < 0 || index > node.children.length) {
                throw new tree_1.$9R(this.o, 'Invalid tree location');
            }
            return this.E(rest, node.children[index]);
        }
        // expensive
        F(location) {
            if (location.length === 0) {
                return { node: this.c, listIndex: -1, revealed: true, visible: false };
            }
            const { parentNode, listIndex, revealed, visible } = this.G(location);
            const index = location[location.length - 1];
            if (index < 0 || index > parentNode.children.length) {
                throw new tree_1.$9R(this.o, 'Invalid tree location');
            }
            const node = parentNode.children[index];
            return { node, listIndex, revealed, visible: visible && node.visible };
        }
        G(location, node = this.c, listIndex = 0, revealed = true, visible = true) {
            const [index, ...rest] = location;
            if (index < 0 || index > node.children.length) {
                throw new tree_1.$9R(this.o, 'Invalid tree location');
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
            return this.G(rest, node.children[index], listIndex + 1, revealed, visible);
        }
        getNode(location = []) {
            return this.E(location);
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
                return (0, arrays_1.$rb)(location)[0];
            }
        }
        getFirstElementChild(location) {
            const node = this.E(location);
            if (node.children.length === 0) {
                return undefined;
            }
            return node.children[0].element;
        }
        getLastElementAncestor(location = []) {
            const node = this.E(location);
            if (node.children.length === 0) {
                return undefined;
            }
            return this.H(node);
        }
        H(node) {
            if (node.children.length === 0) {
                return node.element;
            }
            return this.H(node.children[node.children.length - 1]);
        }
    }
    exports.$aS = $aS;
});
//# sourceMappingURL=indexTreeModel.js.map