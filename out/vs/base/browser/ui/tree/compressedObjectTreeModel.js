/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/tree/objectTreeModel", "vs/base/browser/ui/tree/tree", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/iterator"], function (require, exports, objectTreeModel_1, tree_1, arrays_1, event_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompressibleObjectTreeModel = exports.DefaultElementMapper = exports.CompressedObjectTreeModel = exports.decompress = exports.compress = void 0;
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
    function compress(element) {
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
            children: iterator_1.Iterable.map(iterator_1.Iterable.concat(children, childrenIterator), compress),
            collapsible: element.collapsible,
            collapsed: element.collapsed
        };
    }
    exports.compress = compress;
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
    function decompress(element) {
        return _decompress(element, 0);
    }
    exports.decompress = decompress;
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
    class CompressedObjectTreeModel {
        get onDidSplice() { return this.model.onDidSplice; }
        get onDidChangeCollapseState() { return this.model.onDidChangeCollapseState; }
        get onDidChangeRenderNodeCount() { return this.model.onDidChangeRenderNodeCount; }
        get size() { return this.nodes.size; }
        constructor(user, list, options = {}) {
            this.user = user;
            this.rootRef = null;
            this.nodes = new Map();
            this.model = new objectTreeModel_1.ObjectTreeModel(user, list, options);
            this.enabled = typeof options.compressionEnabled === 'undefined' ? true : options.compressionEnabled;
            this.identityProvider = options.identityProvider;
        }
        setChildren(element, children = iterator_1.Iterable.empty(), options) {
            // Diffs must be deep, since the compression can affect nested elements.
            // @see https://github.com/microsoft/vscode/pull/114237#issuecomment-759425034
            const diffIdentityProvider = options.diffIdentityProvider && wrapIdentityProvider(options.diffIdentityProvider);
            if (element === null) {
                const compressedChildren = iterator_1.Iterable.map(children, this.enabled ? compress : noCompress);
                this._setChildren(null, compressedChildren, { diffIdentityProvider, diffDepth: Infinity });
                return;
            }
            const compressedNode = this.nodes.get(element);
            if (!compressedNode) {
                throw new tree_1.TreeError(this.user, 'Unknown compressed tree node');
            }
            const node = this.model.getNode(compressedNode);
            const compressedParentNode = this.model.getParentNodeLocation(compressedNode);
            const parent = this.model.getNode(compressedParentNode);
            const decompressedElement = decompress(node);
            const splicedElement = splice(decompressedElement, element, children);
            const recompressedElement = (this.enabled ? compress : noCompress)(splicedElement);
            // If the recompressed node is identical to the original, just set its children.
            // Saves work and churn diffing the parent element.
            const elementComparator = options.diffIdentityProvider
                ? ((a, b) => options.diffIdentityProvider.getId(a) === options.diffIdentityProvider.getId(b))
                : undefined;
            if ((0, arrays_1.equals)(recompressedElement.element.elements, node.element.elements, elementComparator)) {
                this._setChildren(compressedNode, recompressedElement.children || iterator_1.Iterable.empty(), { diffIdentityProvider, diffDepth: 1 });
                return;
            }
            const parentChildren = parent.children
                .map(child => child === node ? recompressedElement : child);
            this._setChildren(parent.element, parentChildren, {
                diffIdentityProvider,
                diffDepth: node.depth - parent.depth,
            });
        }
        isCompressionEnabled() {
            return this.enabled;
        }
        setCompressionEnabled(enabled) {
            if (enabled === this.enabled) {
                return;
            }
            this.enabled = enabled;
            const root = this.model.getNode();
            const rootChildren = root.children;
            const decompressedRootChildren = iterator_1.Iterable.map(rootChildren, decompress);
            const recompressedRootChildren = iterator_1.Iterable.map(decompressedRootChildren, enabled ? compress : noCompress);
            // it should be safe to always use deep diff mode here if an identity
            // provider is available, since we know the raw nodes are unchanged.
            this._setChildren(null, recompressedRootChildren, {
                diffIdentityProvider: this.identityProvider,
                diffDepth: Infinity,
            });
        }
        _setChildren(node, children, options) {
            const insertedElements = new Set();
            const onDidCreateNode = (node) => {
                for (const element of node.element.elements) {
                    insertedElements.add(element);
                    this.nodes.set(element, node.element);
                }
            };
            const onDidDeleteNode = (node) => {
                for (const element of node.element.elements) {
                    if (!insertedElements.has(element)) {
                        this.nodes.delete(element);
                    }
                }
            };
            this.model.setChildren(node, children, { ...options, onDidCreateNode, onDidDeleteNode });
        }
        has(element) {
            return this.nodes.has(element);
        }
        getListIndex(location) {
            const node = this.getCompressedNode(location);
            return this.model.getListIndex(node);
        }
        getListRenderCount(location) {
            const node = this.getCompressedNode(location);
            return this.model.getListRenderCount(node);
        }
        getNode(location) {
            if (typeof location === 'undefined') {
                return this.model.getNode();
            }
            const node = this.getCompressedNode(location);
            return this.model.getNode(node);
        }
        // TODO: review this
        getNodeLocation(node) {
            const compressedNode = this.model.getNodeLocation(node);
            if (compressedNode === null) {
                return null;
            }
            return compressedNode.elements[compressedNode.elements.length - 1];
        }
        // TODO: review this
        getParentNodeLocation(location) {
            const compressedNode = this.getCompressedNode(location);
            const parentNode = this.model.getParentNodeLocation(compressedNode);
            if (parentNode === null) {
                return null;
            }
            return parentNode.elements[parentNode.elements.length - 1];
        }
        getFirstElementChild(location) {
            const compressedNode = this.getCompressedNode(location);
            return this.model.getFirstElementChild(compressedNode);
        }
        getLastElementAncestor(location) {
            const compressedNode = typeof location === 'undefined' ? undefined : this.getCompressedNode(location);
            return this.model.getLastElementAncestor(compressedNode);
        }
        isCollapsible(location) {
            const compressedNode = this.getCompressedNode(location);
            return this.model.isCollapsible(compressedNode);
        }
        setCollapsible(location, collapsible) {
            const compressedNode = this.getCompressedNode(location);
            return this.model.setCollapsible(compressedNode, collapsible);
        }
        isCollapsed(location) {
            const compressedNode = this.getCompressedNode(location);
            return this.model.isCollapsed(compressedNode);
        }
        setCollapsed(location, collapsed, recursive) {
            const compressedNode = this.getCompressedNode(location);
            return this.model.setCollapsed(compressedNode, collapsed, recursive);
        }
        expandTo(location) {
            const compressedNode = this.getCompressedNode(location);
            this.model.expandTo(compressedNode);
        }
        rerender(location) {
            const compressedNode = this.getCompressedNode(location);
            this.model.rerender(compressedNode);
        }
        updateElementHeight(element, height) {
            const compressedNode = this.getCompressedNode(element);
            if (!compressedNode) {
                return;
            }
            this.model.updateElementHeight(compressedNode, height);
        }
        refilter() {
            this.model.refilter();
        }
        resort(location = null, recursive = true) {
            const compressedNode = this.getCompressedNode(location);
            this.model.resort(compressedNode, recursive);
        }
        getCompressedNode(element) {
            if (element === null) {
                return null;
            }
            const node = this.nodes.get(element);
            if (!node) {
                throw new tree_1.TreeError(this.user, `Tree element not found: ${element}`);
            }
            return node;
        }
    }
    exports.CompressedObjectTreeModel = CompressedObjectTreeModel;
    const DefaultElementMapper = elements => elements[elements.length - 1];
    exports.DefaultElementMapper = DefaultElementMapper;
    class CompressedTreeNodeWrapper {
        get element() { return this.node.element === null ? null : this.unwrapper(this.node.element); }
        get children() { return this.node.children.map(node => new CompressedTreeNodeWrapper(this.unwrapper, node)); }
        get depth() { return this.node.depth; }
        get visibleChildrenCount() { return this.node.visibleChildrenCount; }
        get visibleChildIndex() { return this.node.visibleChildIndex; }
        get collapsible() { return this.node.collapsible; }
        get collapsed() { return this.node.collapsed; }
        get visible() { return this.node.visible; }
        get filterData() { return this.node.filterData; }
        constructor(unwrapper, node) {
            this.unwrapper = unwrapper;
            this.node = node;
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
    class CompressibleObjectTreeModel {
        get onDidSplice() {
            return event_1.Event.map(this.model.onDidSplice, ({ insertedNodes, deletedNodes }) => ({
                insertedNodes: insertedNodes.map(node => this.nodeMapper.map(node)),
                deletedNodes: deletedNodes.map(node => this.nodeMapper.map(node)),
            }));
        }
        get onDidChangeCollapseState() {
            return event_1.Event.map(this.model.onDidChangeCollapseState, ({ node, deep }) => ({
                node: this.nodeMapper.map(node),
                deep
            }));
        }
        get onDidChangeRenderNodeCount() {
            return event_1.Event.map(this.model.onDidChangeRenderNodeCount, node => this.nodeMapper.map(node));
        }
        constructor(user, list, options = {}) {
            this.rootRef = null;
            this.elementMapper = options.elementMapper || exports.DefaultElementMapper;
            const compressedNodeUnwrapper = node => this.elementMapper(node.elements);
            this.nodeMapper = new tree_1.WeakMapper(node => new CompressedTreeNodeWrapper(compressedNodeUnwrapper, node));
            this.model = new CompressedObjectTreeModel(user, mapList(this.nodeMapper, list), mapOptions(compressedNodeUnwrapper, options));
        }
        setChildren(element, children = iterator_1.Iterable.empty(), options = {}) {
            this.model.setChildren(element, children, options);
        }
        isCompressionEnabled() {
            return this.model.isCompressionEnabled();
        }
        setCompressionEnabled(enabled) {
            this.model.setCompressionEnabled(enabled);
        }
        has(location) {
            return this.model.has(location);
        }
        getListIndex(location) {
            return this.model.getListIndex(location);
        }
        getListRenderCount(location) {
            return this.model.getListRenderCount(location);
        }
        getNode(location) {
            return this.nodeMapper.map(this.model.getNode(location));
        }
        getNodeLocation(node) {
            return node.element;
        }
        getParentNodeLocation(location) {
            return this.model.getParentNodeLocation(location);
        }
        getFirstElementChild(location) {
            const result = this.model.getFirstElementChild(location);
            if (result === null || typeof result === 'undefined') {
                return result;
            }
            return this.elementMapper(result.elements);
        }
        getLastElementAncestor(location) {
            const result = this.model.getLastElementAncestor(location);
            if (result === null || typeof result === 'undefined') {
                return result;
            }
            return this.elementMapper(result.elements);
        }
        isCollapsible(location) {
            return this.model.isCollapsible(location);
        }
        setCollapsible(location, collapsed) {
            return this.model.setCollapsible(location, collapsed);
        }
        isCollapsed(location) {
            return this.model.isCollapsed(location);
        }
        setCollapsed(location, collapsed, recursive) {
            return this.model.setCollapsed(location, collapsed, recursive);
        }
        expandTo(location) {
            return this.model.expandTo(location);
        }
        rerender(location) {
            return this.model.rerender(location);
        }
        updateElementHeight(element, height) {
            this.model.updateElementHeight(element, height);
        }
        refilter() {
            return this.model.refilter();
        }
        resort(element = null, recursive = true) {
            return this.model.resort(element, recursive);
        }
        getCompressedTreeNode(location = null) {
            return this.model.getNode(location);
        }
    }
    exports.CompressibleObjectTreeModel = CompressibleObjectTreeModel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcHJlc3NlZE9iamVjdFRyZWVNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS90cmVlL2NvbXByZXNzZWRPYmplY3RUcmVlTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBc0JoRyxTQUFTLFVBQVUsQ0FBSSxPQUFrQztRQUN4RCxNQUFNLFFBQVEsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsY0FBYyxJQUFJLEtBQUssQ0FBQztRQUV2RCxPQUFPO1lBQ04sT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRTtZQUNyQyxRQUFRLEVBQUUsbUJBQVEsQ0FBQyxHQUFHLENBQUMsbUJBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLFVBQVUsQ0FBQztZQUNuRSxXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7WUFDaEMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO1NBQzVCLENBQUM7SUFDSCxDQUFDO0lBRUQsc0RBQXNEO0lBQ3RELFNBQWdCLFFBQVEsQ0FBSSxPQUFrQztRQUM3RCxNQUFNLFFBQVEsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuQyxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsY0FBYyxJQUFJLEtBQUssQ0FBQztRQUV2RCxJQUFJLGdCQUFxRCxDQUFDO1FBQzFELElBQUksUUFBcUMsQ0FBQztRQUUxQyxPQUFPLElBQUksRUFBRTtZQUNaLENBQUMsUUFBUSxFQUFFLGdCQUFnQixDQUFDLEdBQUcsbUJBQVEsQ0FBQyxPQUFPLENBQUMsbUJBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXBGLElBQUks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