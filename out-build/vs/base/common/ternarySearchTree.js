/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/strings"], function (require, exports, arrays_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Hh = exports.$Gh = exports.$Fh = exports.$Eh = exports.$Dh = void 0;
    class $Dh {
        constructor() {
            this.b = '';
            this.c = 0;
        }
        reset(key) {
            this.b = key;
            this.c = 0;
            return this;
        }
        next() {
            this.c += 1;
            return this;
        }
        hasNext() {
            return this.c < this.b.length - 1;
        }
        cmp(a) {
            const aCode = a.charCodeAt(0);
            const thisCode = this.b.charCodeAt(this.c);
            return aCode - thisCode;
        }
        value() {
            return this.b[this.c];
        }
    }
    exports.$Dh = $Dh;
    class $Eh {
        constructor(e = true) {
            this.e = e;
        }
        reset(key) {
            this.b = key;
            this.c = 0;
            this.d = 0;
            return this.next();
        }
        hasNext() {
            return this.d < this.b.length;
        }
        next() {
            // this._data = key.split(/[\\/]/).filter(s => !!s);
            this.c = this.d;
            let justSeps = true;
            for (; this.d < this.b.length; this.d++) {
                const ch = this.b.charCodeAt(this.d);
                if (ch === 46 /* CharCode.Period */) {
                    if (justSeps) {
                        this.c++;
                    }
                    else {
                        break;
                    }
                }
                else {
                    justSeps = false;
                }
            }
            return this;
        }
        cmp(a) {
            return this.e
                ? (0, strings_1.$Ge)(a, this.b, 0, a.length, this.c, this.d)
                : (0, strings_1.$Ie)(a, this.b, 0, a.length, this.c, this.d);
        }
        value() {
            return this.b.substring(this.c, this.d);
        }
    }
    exports.$Eh = $Eh;
    class $Fh {
        constructor(f = true, g = true) {
            this.f = f;
            this.g = g;
        }
        reset(key) {
            this.d = 0;
            this.e = 0;
            this.b = key;
            this.c = key.length;
            for (let pos = key.length - 1; pos >= 0; pos--, this.c--) {
                const ch = this.b.charCodeAt(pos);
                if (!(ch === 47 /* CharCode.Slash */ || this.f && ch === 92 /* CharCode.Backslash */)) {
                    break;
                }
            }
            return this.next();
        }
        hasNext() {
            return this.e < this.c;
        }
        next() {
            // this._data = key.split(/[\\/]/).filter(s => !!s);
            this.d = this.e;
            let justSeps = true;
            for (; this.e < this.c; this.e++) {
                const ch = this.b.charCodeAt(this.e);
                if (ch === 47 /* CharCode.Slash */ || this.f && ch === 92 /* CharCode.Backslash */) {
                    if (justSeps) {
                        this.d++;
                    }
                    else {
                        break;
                    }
                }
                else {
                    justSeps = false;
                }
            }
            return this;
        }
        cmp(a) {
            return this.g
                ? (0, strings_1.$Ge)(a, this.b, 0, a.length, this.d, this.e)
                : (0, strings_1.$Ie)(a, this.b, 0, a.length, this.d, this.e);
        }
        value() {
            return this.b.substring(this.d, this.e);
        }
    }
    exports.$Fh = $Fh;
    var UriIteratorState;
    (function (UriIteratorState) {
        UriIteratorState[UriIteratorState["Scheme"] = 1] = "Scheme";
        UriIteratorState[UriIteratorState["Authority"] = 2] = "Authority";
        UriIteratorState[UriIteratorState["Path"] = 3] = "Path";
        UriIteratorState[UriIteratorState["Query"] = 4] = "Query";
        UriIteratorState[UriIteratorState["Fragment"] = 5] = "Fragment";
    })(UriIteratorState || (UriIteratorState = {}));
    class $Gh {
        constructor(f, g) {
            this.f = f;
            this.g = g;
            this.d = [];
            this.e = 0;
        }
        reset(key) {
            this.c = key;
            this.d = [];
            if (this.c.scheme) {
                this.d.push(1 /* UriIteratorState.Scheme */);
            }
            if (this.c.authority) {
                this.d.push(2 /* UriIteratorState.Authority */);
            }
            if (this.c.path) {
                this.b = new $Fh(false, !this.f(key));
                this.b.reset(key.path);
                if (this.b.value()) {
                    this.d.push(3 /* UriIteratorState.Path */);
                }
            }
            if (!this.g(key)) {
                if (this.c.query) {
                    this.d.push(4 /* UriIteratorState.Query */);
                }
                if (this.c.fragment) {
                    this.d.push(5 /* UriIteratorState.Fragment */);
                }
            }
            this.e = 0;
            return this;
        }
        next() {
            if (this.d[this.e] === 3 /* UriIteratorState.Path */ && this.b.hasNext()) {
                this.b.next();
            }
            else {
                this.e += 1;
            }
            return this;
        }
        hasNext() {
            return (this.d[this.e] === 3 /* UriIteratorState.Path */ && this.b.hasNext())
                || this.e < this.d.length - 1;
        }
        cmp(a) {
            if (this.d[this.e] === 1 /* UriIteratorState.Scheme */) {
                return (0, strings_1.$He)(a, this.c.scheme);
            }
            else if (this.d[this.e] === 2 /* UriIteratorState.Authority */) {
                return (0, strings_1.$He)(a, this.c.authority);
            }
            else if (this.d[this.e] === 3 /* UriIteratorState.Path */) {
                return this.b.cmp(a);
            }
            else if (this.d[this.e] === 4 /* UriIteratorState.Query */) {
                return (0, strings_1.$Fe)(a, this.c.query);
            }
            else if (this.d[this.e] === 5 /* UriIteratorState.Fragment */) {
                return (0, strings_1.$Fe)(a, this.c.fragment);
            }
            throw new Error();
        }
        value() {
            if (this.d[this.e] === 1 /* UriIteratorState.Scheme */) {
                return this.c.scheme;
            }
            else if (this.d[this.e] === 2 /* UriIteratorState.Authority */) {
                return this.c.authority;
            }
            else if (this.d[this.e] === 3 /* UriIteratorState.Path */) {
                return this.b.value();
            }
            else if (this.d[this.e] === 4 /* UriIteratorState.Query */) {
                return this.c.query;
            }
            else if (this.d[this.e] === 5 /* UriIteratorState.Fragment */) {
                return this.c.fragment;
            }
            throw new Error();
        }
    }
    exports.$Gh = $Gh;
    class TernarySearchTreeNode {
        constructor() {
            this.height = 1;
        }
        isEmpty() {
            return !this.left && !this.mid && !this.right && !this.value;
        }
        rotateLeft() {
            const tmp = this.right;
            this.right = tmp.left;
            tmp.left = this;
            this.updateHeight();
            tmp.updateHeight();
            return tmp;
        }
        rotateRight() {
            const tmp = this.left;
            this.left = tmp.right;
            tmp.right = this;
            this.updateHeight();
            tmp.updateHeight();
            return tmp;
        }
        updateHeight() {
            this.height = 1 + Math.max(this.heightLeft, this.heightRight);
        }
        balanceFactor() {
            return this.heightRight - this.heightLeft;
        }
        get heightLeft() {
            return this.left?.height ?? 0;
        }
        get heightRight() {
            return this.right?.height ?? 0;
        }
    }
    var Dir;
    (function (Dir) {
        Dir[Dir["Left"] = -1] = "Left";
        Dir[Dir["Mid"] = 0] = "Mid";
        Dir[Dir["Right"] = 1] = "Right";
    })(Dir || (Dir = {}));
    class $Hh {
        static forUris(ignorePathCasing = () => false, ignoreQueryAndFragment = () => false) {
            return new $Hh(new $Gh(ignorePathCasing, ignoreQueryAndFragment));
        }
        static forPaths(ignorePathCasing = false) {
            return new $Hh(new $Fh(undefined, !ignorePathCasing));
        }
        static forStrings() {
            return new $Hh(new $Dh());
        }
        static forConfigKeys() {
            return new $Hh(new $Eh());
        }
        constructor(segments) {
            this.b = segments;
        }
        clear() {
            this.c = undefined;
        }
        fill(values, keys) {
            if (keys) {
                const arr = keys.slice(0);
                (0, arrays_1.$Vb)(arr);
                for (const k of arr) {
                    this.set(k, values);
                }
            }
            else {
                const arr = values.slice(0);
                (0, arrays_1.$Vb)(arr);
                for (const entry of arr) {
                    this.set(entry[0], entry[1]);
                }
            }
        }
        set(key, element) {
            const iter = this.b.reset(key);
            let node;
            if (!this.c) {
                this.c = new TernarySearchTreeNode();
                this.c.segment = iter.value();
            }
            const stack = [];
            // find insert_node
            node = this.c;
            while (true) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    if (!node.left) {
                        node.left = new TernarySearchTreeNode();
                        node.left.segment = iter.value();
                    }
                    stack.push([-1 /* Dir.Left */, node]);
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    if (!node.right) {
                        node.right = new TernarySearchTreeNode();
                        node.right.segment = iter.value();
                    }
                    stack.push([1 /* Dir.Right */, node]);
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    if (!node.mid) {
                        node.mid = new TernarySearchTreeNode();
                        node.mid.segment = iter.value();
                    }
                    stack.push([0 /* Dir.Mid */, node]);
                    node = node.mid;
                }
                else {
                    break;
                }
            }
            // set value
            const oldElement = node.value;
            node.value = element;
            node.key = key;
            // balance
            for (let i = stack.length - 1; i >= 0; i--) {
                const node = stack[i][1];
                node.updateHeight();
                const bf = node.balanceFactor();
                if (bf < -1 || bf > 1) {
                    // needs rotate
                    const d1 = stack[i][0];
                    const d2 = stack[i + 1][0];
                    if (d1 === 1 /* Dir.Right */ && d2 === 1 /* Dir.Right */) {
                        //right, right -> rotate left
                        stack[i][1] = node.rotateLeft();
                    }
                    else if (d1 === -1 /* Dir.Left */ && d2 === -1 /* Dir.Left */) {
                        // left, left -> rotate right
                        stack[i][1] = node.rotateRight();
                    }
                    else if (d1 === 1 /* Dir.Right */ && d2 === -1 /* Dir.Left */) {
                        // right, left -> double rotate right, left
                        node.right = stack[i + 1][1] = stack[i + 1][1].rotateRight();
                        stack[i][1] = node.rotateLeft();
                    }
                    else if (d1 === -1 /* Dir.Left */ && d2 === 1 /* Dir.Right */) {
                        // left, right -> double rotate left, right
                        node.left = stack[i + 1][1] = stack[i + 1][1].rotateLeft();
                        stack[i][1] = node.rotateRight();
                    }
                    else {
                        throw new Error();
                    }
                    // patch path to parent
                    if (i > 0) {
                        switch (stack[i - 1][0]) {
                            case -1 /* Dir.Left */:
                                stack[i - 1][1].left = stack[i][1];
                                break;
                            case 1 /* Dir.Right */:
                                stack[i - 1][1].right = stack[i][1];
                                break;
                            case 0 /* Dir.Mid */:
                                stack[i - 1][1].mid = stack[i][1];
                                break;
                        }
                    }
                    else {
                        this.c = stack[0][1];
                    }
                }
            }
            return oldElement;
        }
        get(key) {
            return this.d(key)?.value;
        }
        d(key) {
            const iter = this.b.reset(key);
            let node = this.c;
            while (node) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    node = node.mid;
                }
                else {
                    break;
                }
            }
            return node;
        }
        has(key) {
            const node = this.d(key);
            return !(node?.value === undefined && node?.mid === undefined);
        }
        delete(key) {
            return this.e(key, false);
        }
        deleteSuperstr(key) {
            return this.e(key, true);
        }
        e(key, superStr) {
            const iter = this.b.reset(key);
            const stack = [];
            let node = this.c;
            // find node
            while (node) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    stack.push([-1 /* Dir.Left */, node]);
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    stack.push([1 /* Dir.Right */, node]);
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    stack.push([0 /* Dir.Mid */, node]);
                    node = node.mid;
                }
                else {
                    break;
                }
            }
            if (!node) {
                // node not found
                return;
            }
            if (superStr) {
                // removing children, reset height
                node.left = undefined;
                node.mid = undefined;
                node.right = undefined;
                node.height = 1;
            }
            else {
                // removing element
                node.key = undefined;
                node.value = undefined;
            }
            // BST node removal
            if (!node.mid && !node.value) {
                if (node.left && node.right) {
                    // full node
                    // replace deleted-node with the min-node of the right branch.
                    // If there is no true min-node leave things as they are
                    const min = this.f(node.right);
                    if (min.key) {
                        const { key, value, segment } = min;
                        this.e(min.key, false);
                        node.key = key;
                        node.value = value;
                        node.segment = segment;
                    }
                }
                else {
                    // empty or half empty
                    const newChild = node.left ?? node.right;
                    if (stack.length > 0) {
                        const [dir, parent] = stack[stack.length - 1];
                        switch (dir) {
                            case -1 /* Dir.Left */:
                                parent.left = newChild;
                                break;
                            case 0 /* Dir.Mid */:
                                parent.mid = newChild;
                                break;
                            case 1 /* Dir.Right */:
                                parent.right = newChild;
                                break;
                        }
                    }
                    else {
                        this.c = newChild;
                    }
                }
            }
            // AVL balance
            for (let i = stack.length - 1; i >= 0; i--) {
                const node = stack[i][1];
                node.updateHeight();
                const bf = node.balanceFactor();
                if (bf > 1) {
                    // right heavy
                    if (node.right.balanceFactor() >= 0) {
                        // right, right -> rotate left
                        stack[i][1] = node.rotateLeft();
                    }
                    else {
                        // right, left -> double rotate
                        node.right = node.right.rotateRight();
                        stack[i][1] = node.rotateLeft();
                    }
                }
                else if (bf < -1) {
                    // left heavy
                    if (node.left.balanceFactor() <= 0) {
                        // left, left -> rotate right
                        stack[i][1] = node.rotateRight();
                    }
                    else {
                        // left, right -> double rotate
                        node.left = node.left.rotateLeft();
                        stack[i][1] = node.rotateRight();
                    }
                }
                // patch path to parent
                if (i > 0) {
                    switch (stack[i - 1][0]) {
                        case -1 /* Dir.Left */:
                            stack[i - 1][1].left = stack[i][1];
                            break;
                        case 1 /* Dir.Right */:
                            stack[i - 1][1].right = stack[i][1];
                            break;
                        case 0 /* Dir.Mid */:
                            stack[i - 1][1].mid = stack[i][1];
                            break;
                    }
                }
                else {
                    this.c = stack[0][1];
                }
            }
        }
        f(node) {
            while (node.left) {
                node = node.left;
            }
            return node;
        }
        findSubstr(key) {
            const iter = this.b.reset(key);
            let node = this.c;
            let candidate = undefined;
            while (node) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    candidate = node.value || candidate;
                    node = node.mid;
                }
                else {
                    break;
                }
            }
            return node && node.value || candidate;
        }
        findSuperstr(key) {
            return this.g(key, false);
        }
        g(key, allowValue) {
            const iter = this.b.reset(key);
            let node = this.c;
            while (node) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    node = node.mid;
                }
                else {
                    // collect
                    if (!node.mid) {
                        if (allowValue) {
                            return node.value;
                        }
                        else {
                            return undefined;
                        }
                    }
                    else {
                        return this.h(node.mid);
                    }
                }
            }
            return undefined;
        }
        hasElementOrSubtree(key) {
            return this.g(key, true) !== undefined;
        }
        forEach(callback) {
            for (const [key, value] of this) {
                callback(value, key);
            }
        }
        *[Symbol.iterator]() {
            yield* this.h(this.c);
        }
        h(node) {
            const result = [];
            this.j(node, result);
            return result[Symbol.iterator]();
        }
        j(node, bucket) {
            // DFS
            if (!node) {
                return;
            }
            if (node.left) {
                this.j(node.left, bucket);
            }
            if (node.value) {
                bucket.push([node.key, node.value]);
            }
            if (node.mid) {
                this.j(node.mid, bucket);
            }
            if (node.right) {
                this.j(node.right, bucket);
            }
        }
        // for debug/testing
        _isBalanced() {
            const nodeIsBalanced = (node) => {
                if (!node) {
                    return true;
                }
                const bf = node.balanceFactor();
                if (bf < -1 || bf > 1) {
                    return false;
                }
                return nodeIsBalanced(node.left) && nodeIsBalanced(node.right);
            };
            return nodeIsBalanced(this.c);
        }
    }
    exports.$Hh = $Hh;
});
//# sourceMappingURL=ternarySearchTree.js.map