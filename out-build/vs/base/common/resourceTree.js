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
    exports.$LS = void 0;
    class Node {
        get childrenCount() {
            return this.a.size;
        }
        get children() {
            return this.a.values();
        }
        get name() {
            return paths.$6d.basename(this.relativePath);
        }
        constructor(uri, relativePath, context, element = undefined, parent = undefined) {
            this.uri = uri;
            this.relativePath = relativePath;
            this.context = context;
            this.element = element;
            this.parent = parent;
            this.a = new Map();
        }
        get(path) {
            return this.a.get(path);
        }
        set(path, child) {
            this.a.set(path, child);
        }
        delete(path) {
            this.a.delete(path);
        }
        clear() {
            this.a.clear();
        }
    }
    __decorate([
        decorators_1.$6g
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
    class $LS {
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
        constructor(context, rootURI = uri_1.URI.file('/'), a = resources_1.$$f) {
            this.a = a;
            this.root = new Node(rootURI, '', context);
        }
        add(uri, element) {
            const key = this.a.relativePath(this.root.uri, uri) || uri.path;
            const iterator = new ternarySearchTree_1.$Fh(false).reset(key);
            let node = this.root;
            let path = '';
            while (true) {
                const name = iterator.value();
                path = path + '/' + name;
                let child = node.get(name);
                if (!child) {
                    child = new Node(this.a.joinPath(this.root.uri, path), path, this.root.context, iterator.hasNext() ? undefined : element, node);
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
            const key = this.a.relativePath(this.root.uri, uri) || uri.path;
            const iterator = new ternarySearchTree_1.$Fh(false).reset(key);
            return this.b(this.root, iterator);
        }
        b(node, iterator) {
            const name = iterator.value();
            const child = node.get(name);
            if (!child) {
                return undefined;
            }
            if (iterator.hasNext()) {
                const result = this.b(child, iterator.next());
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
            const key = this.a.relativePath(this.root.uri, uri) || uri.path;
            const iterator = new ternarySearchTree_1.$Fh(false).reset(key);
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
    exports.$LS = $LS;
});
//# sourceMappingURL=resourceTree.js.map