/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/tree/objectTreeModel", "vs/base/browser/ui/tree/tree", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/iterator"], function (require, exports, objectTreeModel_1, tree_1, arrays_1, event_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lS = exports.$kS = exports.$jS = exports.$iS = exports.$hS = void 0;
    function noCompress(element) {
        const elements = [element.element];
        const incompressible = element.incompressible || false;
        return {
            element: { elements, incompressible },
            children: iterator_1.Iterable.map(iterator_1.Iterable.from(element.children), noCompress),
            collapsible: element.collapsible,
            collapsed: element.collapsed
        };
    }
    // Exported only for test reasons, do not use directly
    function $hS(element) {
        const elements = [element.element];
        const incompressible = element.incompressible || false;
        let childrenIterator;
        let children;
        while (true) {
            [children, childrenIterator] = iterator_1.Iterable.consume(iterator_1.Iterable.from(element.children), 2);
            if (children.length !== 1) {
                break;
            }
            if (children[0].incompressible) {
                break;
            }
            element = children[0];
            elements.push(element.element);
        }
        return {
            element: { elements, incompressible },
            children: iterator_1.Iterable.map(iterator_1.Iterable.concat(children, childrenIterator), $hS),
            collapsible: element.collapsible,
            collapsed: element.collapsed
        };
    }
    exports.$hS = $hS;
    function _decompress(element, index = 0) {
        let children;
        if (index < element.element.elements.length - 1) {
            children = [_decompress(element, index + 1)];
        }
        else {
            children = iterator_1.Iterable.map(iterator_1.Iterable.from(element.children), el => _decompress(el, 0));
        }
        if (index === 0 && element.element.incompressible) {
            return {
                element: element.element.elements[index],
                children,
                incompressible: true,
                collapsible: element.collapsible,
                collapsed: element.collapsed
            };
        }
        return {
            element: element.element.elements[index],
            children,
            collapsible: element.collapsible,
            collapsed: element.collapsed
        };
    }
    // Exported only for test reasons, do not use directly
    function $iS(element) {
        return _decompress(element, 0);
    }
    exports.$iS = $iS;
    function splice(treeElement, element, children) {
        if (treeElement.element === element) {
            return { ...treeElement, children };
        }
        return { ...treeElement, children: iterator_1.Iterable.map(iterator_1.Iterable.from(treeElement.children), e => splice(e, element, children)) };
    }
    const wrapIdentityProvider = (base) => ({
        getId(node) {
            return node.elements.map(e => base.getId(e).toString()).join('\0');
        }
    });
    // Exported only for test reasons, do not use directly
    class $jS {
        get onDidSplice() { return this.c.onDidSplice; }
        get onDidChangeCollapseState() { return this.c.onDidChangeCollapseState; }
        get onDidChangeRenderNodeCount() { return this.c.onDidChangeRenderNodeCount; }
        get size() { return this.d.size; }
        constructor(h, list, options = {}) {
            this.h = h;
            this.rootRef = null;
            this.d = new Map();
            this.c = new objectTreeModel_1.$gS(h, list, options);
            this.f = typeof options.compressionEnabled === 'undefined' ? true : options.compressionEnabled;
            this.g = options.identityProvider;
        }
        setChildren(element, children = iterator_1.Iterable.empty(), options) {
            // Diffs must be deep, since the compression can affect nested elements.
            // @see https://github.com/microsoft/vscode/pull/114237#issuecomment-759425034
            const diffIdentityProvider = options.diffIdentityProvider && wrapIdentityProvider(options.diffIdentityProvider);
            if (element === null) {
                const compressedChildren = iterator_1.Iterable.map(children, this.f ? $hS : noCompress);
                this.i(null, compressedChildren, { diffIdentityProvider, diffDepth: Infinity });
                return;
            }
            const compressedNode = this.d.get(element);
            if (!compressedNode) {
                throw new tree_1.$9R(this.h, 'Unknown compressed tree node');
            }
            const node = this.c.getNode(compressedNode);
            const compressedParentNode = this.c.getParentNodeLocation(compressedNode);
            const parent = this.c.getNode(compressedParentNode);
            const decompressedElement = $iS(node);
            const splicedElement = splice(decompressedElement, element, children);
            const recompressedElement = (this.f ? $hS : noCompress)(splicedElement);
            // If the recompressed node is identical to the original, just set its children.
            // Saves work and churn diffing the parent element.
            const elementComparator = options.diffIdentityProvider
                ? ((a, b) => options.diffIdentityProvider.getId(a) === options.diffIdentityProvider.getId(b))
                : undefined;
            if ((0, arrays_1.$sb)(recompressedElement.element.elements, node.element.elements, elementComparator)) {
                this.i(compressedNode, recompressedElement.children || iterator_1.Iterable.empty(), { diffIdentityProvider, diffDepth: 1 });
                return;
            }
            const parentChildren = parent.children
                .map(child => child === node ? recompressedElement : child);
            this.i(parent.element, parentChildren, {
                diffIdentityProvider,
                diffDepth: node.depth - parent.depth,
            });
        }
        isCompressionEnabled() {
            return this.f;
        }
        setCompressionEnabled(enabled) {
            if (enabled === this.f) {
                return;
            }
            this.f = enabled;
            const root = this.c.getNode();
            const rootChildren = root.children;
            const decompressedRootChildren = iterator_1.Iterable.map(rootChildren, $iS);
            const recompressedRootChildren = iterator_1.Iterable.map(decompressedRootChildren, enabled ? $hS : noCompress);
            // it should be safe to always use deep diff mode here if an identity
            // provider is available, since we know the raw nodes are unchanged.
            this.i(null, recompressedRootChildren, {
                diffIdentityProvider: this.g,
                diffDepth: Infinity,
            });
        }
        i(node, children, options) {
            const insertedElements = new Set();
            const onDidCreateNode = (node) => {
                for (const element of node.element.elements) {
                    insertedElements.add(element);
                    this.d.set(element, node.element);
                }
            };
            const onDidDeleteNode = (node) => {
                for (const element of node.element.elements) {
                    if (!insertedElements.has(element)) {
                        this.d.delete(element);
                    }
                }
            };
            this.c.setChildren(node, children, { ...options, onDidCreateNode, onDidDeleteNode });
        }
        has(element) {
            return this.d.has(element);
        }
        getListIndex(location) {
            const node = this.getCompressedNode(location);
            return this.c.getListIndex(node);
        }
        getListRenderCount(location) {
            const node = this.getCompressedNode(location);
            return this.c.getListRenderCount(node);
        }
        getNode(location) {
            if (typeof location === 'undefined') {
                return this.c.getNode();
            }
            const node = this.getCompressedNode(location);
            return this.c.getNode(node);
        }
        // TODO: review this
        getNodeLocation(node) {
            const compressedNode = this.c.getNodeLocation(node);
            if (compressedNode === null) {
                return null;
            }
            return compressedNode.elements[compressedNode.elements.length - 1];
        }
        // TODO: review this
        getParentNodeLocation(location) {
            const compressedNode = this.getCompressedNode(location);
            const parentNode = this.c.getParentNodeLocation(compressedNode);
            if (parentNode === null) {
                return null;
            }
            return parentNode.elements[parentNode.elements.length - 1];
        }
        getFirstElementChild(location) {
            const compressedNode = this.getCompressedNode(location);
            return this.c.getFirstElementChild(compressedNode);
        }
        getLastElementAncestor(location) {
            const compressedNode = typeof location === 'undefined' ? undefined : this.getCompressedNode(location);
            return this.c.getLastElementAncestor(compressedNode);
        }
        isCollapsible(location) {
            const compressedNode = this.getCompressedNode(location);
            return this.c.isCollapsible(compressedNode);
        }
        setCollapsible(location, collapsible) {
            const compressedNode = this.getCompressedNode(location);
            return this.c.setCollapsible(compressedNode, collapsible);
        }
        isCollapsed(location) {
            const compressedNode = this.getCompressedNode(location);
            return this.c.isCollapsed(compressedNode);
        }
        setCollapsed(location, collapsed, recursive) {
            const compressedNode = this.getCompressedNode(location);
            return this.c.setCollapsed(compressedNode, collapsed, recursive);
        }
        expandTo(location) {
            const compressedNode = this.getCompressedNode(location);
            this.c.expandTo(compressedNode);
        }
        rerender(location) {
            const compressedNode = this.getCompressedNode(location);
            this.c.rerender(compressedNode);
        }
        updateElementHeight(element, height) {
            const compressedNode = this.getCompressedNode(element);
            if (!compressedNode) {
                return;
            }
            this.c.updateElementHeight(compressedNode, height);
        }
        refilter() {
            this.c.refilter();
        }
        resort(location = null, recursive = true) {
            const compressedNode = this.getCompressedNode(location);
            this.c.resort(compressedNode, recursive);
        }
        getCompressedNode(element) {
            if (element === null) {
                return null;
            }
            const node = this.d.get(element);
            if (!node) {
                throw new tree_1.$9R(this.h, `Tree element not found: ${element}`);
            }
            return node;
        }
    }
    exports.$jS = $jS;
    const $kS = elements => elements[elements.length - 1];
    exports.$kS = $kS;
    class CompressedTreeNodeWrapper {
        get element() { return this.d.element === null ? null : this.c(this.d.element); }
        get children() { return this.d.children.map(node => new CompressedTreeNodeWrapper(this.c, node)); }
        get depth() { return this.d.depth; }
        get visibleChildrenCount() { return this.d.visibleChildrenCount; }
        get visibleChildIndex() { return this.d.visibleChildIndex; }
        get collapsible() { return this.d.collapsible; }
        get collapsed() { return this.d.collapsed; }
        get visible() { return this.d.visible; }
        get filterData() { return this.d.filterData; }
        constructor(c, d) {
            this.c = c;
            this.d = d;
        }
    }
    function mapList(nodeMapper, list) {
        return {
            splice(start, deleteCount, toInsert) {
                list.splice(start, deleteCount, toInsert.map(node => nodeMapper.map(node)));
            },
            updateElementHeight(index, height) {
                list.updateElementHeight(index, height);
            }
        };
    }
    function mapOptions(compressedNodeUnwrapper, options) {
        return {
            ...options,
            identityProvider: options.identityProvider && {
                getId(node) {
                    return options.identityProvider.getId(compressedNodeUnwrapper(node));
                }
            },
            sorter: options.sorter && {
                compare(node, otherNode) {
                    return options.sorter.compare(node.elements[0], otherNode.elements[0]);
                }
            },
            filter: options.filter && {
                filter(node, parentVisibility) {
                    return options.filter.filter(compressedNodeUnwrapper(node), parentVisibility);
                }
            }
        };
    }
    class $lS {
        get onDidSplice() {
            return event_1.Event.map(this.f.onDidSplice, ({ insertedNodes, deletedNodes }) => ({
                insertedNodes: insertedNodes.map(node => this.d.map(node)),
                deletedNodes: deletedNodes.map(node => this.d.map(node)),
            }));
        }
        get onDidChangeCollapseState() {
            return event_1.Event.map(this.f.onDidChangeCollapseState, ({ node, deep }) => ({
                node: this.d.map(node),
                deep
            }));
        }
        get onDidChangeRenderNodeCount() {
            return event_1.Event.map(this.f.onDidChangeRenderNodeCount, node => this.d.map(node));
        }
        constructor(user, list, options = {}) {
            this.rootRef = null;
            this.c = options.elementMapper || exports.$kS;
            const compressedNodeUnwrapper = node => this.c(node.elements);
            this.d = new tree_1.$0R(node => new CompressedTreeNodeWrapper(compressedNodeUnwrapper, node));
            this.f = new $jS(user, mapList(this.d, list), mapOptions(compressedNodeUnwrapper, options));
        }
        setChildren(element, children = iterator_1.Iterable.empty(), options = {}) {
            this.f.setChildren(element, children, options);
        }
        isCompressionEnabled() {
            return this.f.isCompressionEnabled();
        }
        setCompressionEnabled(enabled) {
            this.f.setCompressionEnabled(enabled);
        }
        has(location) {
            return this.f.has(location);
        }
        getListIndex(location) {
            return this.f.getListIndex(location);
        }
        getListRenderCount(location) {
            return this.f.getListRenderCount(location);
        }
        getNode(location) {
            return this.d.map(this.f.getNode(location));
        }
        getNodeLocation(node) {
            return node.element;
        }
        getParentNodeLocation(location) {
            return this.f.getParentNodeLocation(location);
        }
        getFirstElementChild(location) {
            const result = this.f.getFirstElementChild(location);
            if (result === null || typeof result === 'undefined') {
                return result;
            }
            return this.c(result.elements);
        }
        getLastElementAncestor(location) {
            const result = this.f.getLastElementAncestor(location);
            if (result === null || typeof result === 'undefined') {
                return result;
            }
            return this.c(result.elements);
        }
        isCollapsible(location) {
            return this.f.isCollapsible(location);
        }
        setCollapsible(location, collapsed) {
            return this.f.setCollapsible(location, collapsed);
        }
        isCollapsed(location) {
            return this.f.isCollapsed(location);
        }
        setCollapsed(location, collapsed, recursive) {
            return this.f.setCollapsed(location, collapsed, recursive);
        }
        expandTo(location) {
            return this.f.expandTo(location);
        }
        rerender(location) {
            return this.f.rerender(location);
        }
        updateElementHeight(element, height) {
            this.f.updateElementHeight(element, height);
        }
        refilter() {
            return this.f.refilter();
        }
        resort(element = null, recursive = true) {
            return this.f.resort(element, recursive);
        }
        getCompressedTreeNode(location = null) {
            return this.f.getNode(location);
        }
    }
    exports.$lS = $lS;
});
//# sourceMappingURL=compressedObjectTreeModel.js.map