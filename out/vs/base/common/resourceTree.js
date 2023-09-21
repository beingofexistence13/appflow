/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "vs/base/common/decorators", "vs/base/common/ternarySearchTree", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri"], function (require, exports, decorators_1, ternarySearchTree_1, paths, resources_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResourceTree = void 0;
    class Node {
        get childrenCount() {
            return this._children.size;
        }
        get children() {
            return this._children.values();
        }
        get name() {
            return paths.posix.basename(this.relativePath);
        }
        constructor(uri, relativePath, context, element = undefined, parent = undefined) {
            this.uri = uri;
            this.relativePath = relativePath;
            this.context = context;
            this.element = element;
            this.parent = parent;
            this._children = new Map();
        }
        get(path) {
            return this._children.get(path);
        }
        set(path, child) {
            this._children.set(path, child);
        }
        delete(path) {
            this._children.delete(path);
        }
        clear() {
            this._children.clear();
        }
    }
    __decorate([
        decorators_1.memoize
    ], Node.prototype, "name", null);
    function collect(node, result) {
        if (typeof node.element !== 'undefined') {
            result.push(node.element);
        }
        for (const child of node.children) {
            collect(child, result);
        }
        return result;
    }
    class ResourceTree {
        static getRoot(node) {
            while (node.parent) {
                node = node.parent;
            }
            return node;
        }
        static collect(node) {
            return collect(node, []);
        }
        static isResourceNode(obj) {
            return obj instanceof Node;
        }
        constructor(context, rootURI = uri_1.URI.file('/'), extUri = resources_1.extUri) {
            this.extUri = extUri;
            this.root = new Node(rootURI, '', context);
        }
        add(uri, element) {
            const key = this.extUri.relativePath(this.root.uri, uri) || uri.path;
            const iterator = new ternarySearchTree_1.PathIterator(false).reset(key);
            let node = this.root;
            let path = '';
            while (true) {
                const name = iterator.value();
                path = path + '/' + name;
                let child = node.get(name);
                if (!child) {
                    child = new Node(this.extUri.joinPath(this.root.uri, path), path, this.root.context, iterator.hasNext() ? undefined : element, node);
                    node.set(name, child);
                }
                else if (!iterator.hasNext()) {
                    child.element = element;
                }
                node = child;
                if (!iterator.hasNext()) {
                    return;
                }
                iterator.next();
            }
        }
        delete(uri) {
            const key = this.extUri.relativePath(this.root.uri, uri) || uri.path;
            const iterator = new ternarySearchTree_1.PathIterator(false).reset(key);
            return this._delete(this.root, iterator);
        }
        _delete(node, iterator) {
            const name = iterator.value();
            const child = node.get(name);
            if (!child) {
                return undefined;
            }
            if (iterator.hasNext()) {
                const result = this._delete(child, iterator.next());
                if (typeof result !== 'undefined' && child.childrenCount === 0) {
                    node.delete(name);
                }
                return result;
            }
            node.delete(name);
            return child.element;
        }
        clear() {
            this.root.clear();
        }
        getNode(uri) {
            const key = this.extUri.relativePath(this.root.uri, uri) || uri.path;
            const iterator = new ternarySearchTree_1.PathIterator(false).reset(key);
            let node = this.root;
            while (true) {
                const name = iterator.value();
                const child = node.get(name);
                if (!child || !iterator.hasNext()) {
                    return child;
                }
                node = child;
                iterator.next();
            }
        }
    }
    exports.ResourceTree = ResourceTree;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VUcmVlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vcmVzb3VyY2VUcmVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7OztJQW9CaEcsTUFBTSxJQUFJO1FBSVQsSUFBSSxhQUFhO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7UUFDNUIsQ0FBQztRQUVELElBQUksUUFBUTtZQUNYLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNoQyxDQUFDO1FBR0QsSUFBSSxJQUFJO1lBQ1AsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVELFlBQ1UsR0FBUSxFQUNSLFlBQW9CLEVBQ3BCLE9BQVUsRUFDWixVQUF5QixTQUFTLEVBQ2hDLFNBQTBDLFNBQVM7WUFKbkQsUUFBRyxHQUFILEdBQUcsQ0FBSztZQUNSLGlCQUFZLEdBQVosWUFBWSxDQUFRO1lBQ3BCLFlBQU8sR0FBUCxPQUFPLENBQUc7WUFDWixZQUFPLEdBQVAsT0FBTyxDQUEyQjtZQUNoQyxXQUFNLEdBQU4sTUFBTSxDQUE2QztZQXBCckQsY0FBUyxHQUFHLElBQUksR0FBRyxFQUFzQixDQUFDO1FBcUI5QyxDQUFDO1FBRUwsR0FBRyxDQUFDLElBQVk7WUFDZixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFRCxHQUFHLENBQUMsSUFBWSxFQUFFLEtBQWlCO1lBQ2xDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBRUQsTUFBTSxDQUFDLElBQVk7WUFDbEIsSUFBSSxDQUFDLFNB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