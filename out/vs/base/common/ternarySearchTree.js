/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/strings"], function (require, exports, arrays_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TernarySearchTree = exports.UriIterator = exports.PathIterator = exports.ConfigKeysIterator = exports.StringIterator = void 0;
    class StringIterator {
        constructor() {
            this._value = '';
            this._pos = 0;
        }
        reset(key) {
            this._value = key;
            this._pos = 0;
            return this;
        }
        next() {
            this._pos += 1;
            return this;
        }
        hasNext() {
            return this._pos < this._value.length - 1;
        }
        cmp(a) {
            const aCode = a.charCodeAt(0);
            const thisCode = this._value.charCodeAt(this._pos);
            return aCode - thisCode;
        }
        value() {
            return this._value[this._pos];
        }
    }
    exports.StringIterator = StringIterator;
    class ConfigKeysIterator {
        constructor(_caseSensitive = true) {
            this._caseSensitive = _caseSensitive;
        }
        reset(key) {
            this._value = key;
            this._from = 0;
            this._to = 0;
            return this.next();
        }
        hasNext() {
            return this._to < this._value.length;
        }
        next() {
            // this._data = key.split(/[\\/]/).filter(s => !!s);
            this._from = this._to;
            let justSeps = true;
            for (; this._to < this._value.length; this._to++) {
                const ch = this._value.charCodeAt(this._to);
                if (ch === 46 /* CharCode.Period */) {
                    if (justSeps) {
                        this._from++;
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
            return this._caseSensitive
                ? (0, strings_1.compareSubstring)(a, this._value, 0, a.length, this._from, this._to)
                : (0, strings_1.compareSubstringIgnoreCase)(a, this._value, 0, a.length, this._from, this._to);
        }
        value() {
            return this._value.substring(this._from, this._to);
        }
    }
    exports.ConfigKeysIterator = ConfigKeysIterator;
    class PathIterator {
        constructor(_splitOnBackslash = true, _caseSensitive = true) {
            this._splitOnBackslash = _splitOnBackslash;
            this._caseSensitive = _caseSensitive;
        }
        reset(key) {
            this._from = 0;
            this._to = 0;
            this._value = key;
            this._valueLen = key.length;
            for (let pos = key.length - 1; pos >= 0; pos--, this._valueLen--) {
                const ch = this._value.charCodeAt(pos);
                if (!(ch === 47 /* CharCode.Slash */ || this._splitOnBackslash && ch === 92 /* CharCode.Backslash */)) {
                    break;
                }
            }
            return this.next();
        }
        hasNext() {
            return this._to < this._valueLen;
        }
        next() {
            // this._data = key.split(/[\\/]/).filter(s => !!s);
            this._from = this._to;
            let justSeps = true;
            for (; this._to < this._valueLen; this._to++) {
                const ch = this._value.charCodeAt(this._to);
                if (ch === 47 /* CharCode.Slash */ || this._splitOnBackslash && ch === 92 /* CharCode.Backslash */) {
                    if (justSeps) {
                        this._from++;
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
            return this._caseSensitive
                ? (0, strings_1.compareSubstring)(a, this._value, 0, a.length, this._from, this._to)
                : (0, strings_1.compareSubstringIgnoreCase)(a, this._value, 0, a.length, this._from, this._to);
        }
        value() {
            return this._value.substring(this._from, this._to);
        }
    }
    exports.PathIterator = PathIterator;
    var UriIteratorState;
    (function (UriIteratorState) {
        UriIteratorState[UriIteratorState["Scheme"] = 1] = "Scheme";
        UriIteratorState[UriIteratorState["Authority"] = 2] = "Authority";
        UriIteratorState[UriIteratorState["Path"] = 3] = "Path";
        UriIteratorState[UriIteratorState["Query"] = 4] = "Query";
        UriIteratorState[UriIteratorState["Fragment"] = 5] = "Fragment";
    })(UriIteratorState || (UriIteratorState = {}));
    class UriIterator {
        constructor(_ignorePathCasing, _ignoreQueryAndFragment) {
            this._ignorePathCasing = _ignorePathCasing;
            this._ignoreQueryAndFragment = _ignoreQueryAndFragment;
            this._states = [];
            this._stateIdx = 0;
        }
        reset(key) {
            this._value = key;
            this._states = [];
            if (this._value.scheme) {
                this._states.push(1 /* UriIteratorState.Scheme */);
            }
            if (this._value.authority) {
                this._states.push(2 /* UriIteratorState.Authority */);
            }
            if (this._value.path) {
                this._pathIterator = new PathIterator(false, !this._ignorePathCasing(key));
                this._pathIterator.reset(key.path);
                if (this._pathIterator.value()) {
                    this._states.push(3 /* UriIteratorState.Path */);
                }
            }
            if (!this._ignoreQueryAndFragment(key)) {
                if (this._value.query) {
                    this._states.push(4 /* UriIteratorState.Query */);
                }
                if (this._value.fragment) {
                    this._states.push(5 /* UriIteratorState.Fragment */);
                }
            }
            this._stateIdx = 0;
            return this;
        }
        next() {
            if (this._states[this._stateIdx] === 3 /* UriIteratorState.Path */ && this._pathIterator.hasNext()) {
                this._pathIterator.next();
            }
            else {
                this._stateIdx += 1;
            }
            return this;
        }
        hasNext() {
            return (this._states[this._stateIdx] === 3 /* UriIteratorState.Path */ && this._pathIterator.hasNext())
                || this._stateIdx < this._states.length - 1;
        }
        cmp(a) {
            if (this._states[this._stateIdx] === 1 /* UriIteratorState.Scheme */) {
                return (0, strings_1.compareIgnoreCase)(a, this._value.scheme);
            }
            else if (this._states[this._stateIdx] === 2 /* UriIteratorState.Authority */) {
                return (0, strings_1.compareIgnoreCase)(a, this._value.authority);
            }
            else if (this._states[this._stateIdx] === 3 /* UriIteratorState.Path */) {
                return this._pathIterator.cmp(a);
            }
            else if (this._states[this._stateIdx] === 4 /* UriIteratorState.Query */) {
                return (0, strings_1.compare)(a, this._value.query);
            }
            else if (this._states[this._stateIdx] === 5 /* UriIteratorState.Fragment */) {
                return (0, strings_1.compare)(a, this._value.fragment);
            }
            throw new Error();
        }
        value() {
            if (this._states[this._stateIdx] === 1 /* UriIteratorState.Scheme */) {
                return this._value.scheme;
            }
            else if (this._states[this._stateIdx] === 2 /* UriIteratorState.Authority */) {
                return this._value.authority;
            }
            else if (this._states[this._stateIdx] === 3 /* UriIteratorState.Path */) {
                return this._pathIterator.value();
            }
            else if (this._states[this._stateIdx] === 4 /* UriIteratorState.Query */) {
                return this._value.query;
            }
            else if (this._states[this._stateIdx] === 5 /* UriIteratorState.Fragment */) {
                return this._value.fragment;
            }
            throw new Error();
        }
    }
    exports.UriIterator = UriIterator;
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
    class TernarySearchTree {
        static forUris(ignorePathCasing = () => false, ignoreQueryAndFragment = () => false) {
            return new TernarySearchTree(new UriIterator(ignorePathCasing, ignoreQueryAndFragment));
        }
        static forPaths(ignorePathCasing = false) {
            return new TernarySearchTree(new PathIterator(undefined, !ignorePathCasing));
        }
        static forStrings() {
            return new TernarySearchTree(new StringIterator());
        }
        static forConfigKeys() {
            return new TernarySearchTree(new ConfigKeysIterator());
        }
        constructor(segments) {
            this._iter = segments;
        }
        clear() {
            this._root = undefined;
        }
        fill(values, keys) {
            if (keys) {
                const arr = keys.slice(0);
                (0, arrays_1.shuffle)(arr);
                for (const k of arr) {
                    this.set(k, values);
                }
            }
            else {
                const arr = values.slice(0);
                (0, arrays_1.shuffle)(arr);
                for (const entry of arr) {
                    this.set(entry[0], entry[1]);
                }
            }
        }
        set(key, element) {
            const iter = this._iter.reset(key);
            let node;
            if (!this._root) {
                this._root = new TernarySearchTreeNode();
                this._root.segment = iter.value();
            }
            const stack = [];
            // find insert_node
            node = this._root;
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
                        this._root = stack[0][1];
                    }
                }
            }
            return oldElement;
        }
        get(key) {
            return this._getNode(key)?.value;
        }
        _getNode(key) {
            const iter = this._iter.reset(key);
            let node = this._root;
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
            const node = this._getNode(key);
            return !(node?.value === undefined && node?.mid === undefined);
        }
        delete(key) {
            return this._delete(key, false);
        }
        deleteSuperstr(key) {
            return this._delete(key, true);
        }
        _delete(key, superStr) {
            const iter = this._iter.reset(key);
            const stack = [];
            let node = this._root;
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
                    const min = this._min(node.right);
                    if (min.key) {
                        const { key, value, segment } = min;
                        this._delete(min.key, false);
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
                        this._root = newChild;
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
                    this._root = stack[0][1];
                }
            }
        }
        _min(node) {
            while (node.left) {
                node = node.left;
            }
            return node;
        }
        findSubstr(key) {
            const iter = this._iter.reset(key);
            let node = this._root;
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
            return this._findSuperstrOrElement(key, false);
        }
        _findSuperstrOrElement(key, allowValue) {
            const iter = this._iter.reset(key);
            let node = this._root;
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
                        return this._entries(node.mid);
                    }
                }
            }
            return undefined;
        }
        hasElementOrSubtree(key) {
            return this._findSuperstrOrElement(key, true) !== undefined;
        }
        forEach(callback) {
            for (const [key, value] of this) {
                callback(value, key);
            }
        }
        *[Symbol.iterator]() {
            yield* this._entries(this._root);
        }
        _entries(node) {
            const result = [];
            this._dfsEntries(node, result);
            return result[Symbol.iterator]();
        }
        _dfsEntries(node, bucket) {
            // DFS
            if (!node) {
                return;
            }
            if (node.left) {
                this._dfsEntries(node.left, bucket);
            }
            if (node.value) {
                bucket.push([node.key, node.value]);
            }
            if (node.mid) {
                this._dfsEntries(node.mid, bucket);
            }
            if (node.right) {
                this._dfsEntries(node.right, bucket);
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
            return nodeIsBalanced(this._root);
        }
    }
    exports.TernarySearchTree = TernarySearchTree;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybmFyeVNlYXJjaFRyZWUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi90ZXJuYXJ5U2VhcmNoVHJlZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQmhHLE1BQWEsY0FBYztRQUEzQjtZQUVTLFdBQU0sR0FBVyxFQUFFLENBQUM7WUFDcEIsU0FBSSxHQUFXLENBQUMsQ0FBQztRQTBCMUIsQ0FBQztRQXhCQSxLQUFLLENBQUMsR0FBVztZQUNoQixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztZQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztZQUNkLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELElBQUk7WUFDSCxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztZQUNmLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELE9BQU87WUFDTixPQUFPLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFFRCxHQUFHLENBQUMsQ0FBUztZQUNaLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25ELE9BQU8sS0FBSyxHQUFHLFFBQVEsQ0FBQztRQUN6QixDQUFDO1FBRUQsS0FBSztZQUNKLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsQ0FBQztLQUNEO0lBN0JELHdDQTZCQztJQUVELE1BQWEsa0JBQWtCO1FBTTlCLFlBQ2tCLGlCQUEwQixJQUFJO1lBQTlCLG1CQUFjLEdBQWQs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