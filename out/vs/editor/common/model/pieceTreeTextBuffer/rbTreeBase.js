/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.recomputeTreeMetadata = exports.updateTreeMetadata = exports.fixInsert = exports.rbDelete = exports.rightRotate = exports.leftRotate = exports.righttest = exports.leftest = exports.SENTINEL = exports.NodeColor = exports.TreeNode = void 0;
    class TreeNode {
        constructor(piece, color) {
            this.piece = piece;
            this.color = color;
            this.size_left = 0;
            this.lf_left = 0;
            this.parent = this;
            this.left = this;
            this.right = this;
        }
        next() {
            if (this.right !== exports.SENTINEL) {
                return leftest(this.right);
            }
            let node = this;
            while (node.parent !== exports.SENTINEL) {
                if (node.parent.left === node) {
                    break;
                }
                node = node.parent;
            }
            if (node.parent === exports.SENTINEL) {
                return exports.SENTINEL;
            }
            else {
                return node.parent;
            }
        }
        prev() {
            if (this.left !== exports.SENTINEL) {
                return righttest(this.left);
            }
            let node = this;
            while (node.parent !== exports.SENTINEL) {
                if (node.parent.right === node) {
                    break;
                }
                node = node.parent;
            }
            if (node.parent === exports.SENTINEL) {
                return exports.SENTINEL;
            }
            else {
                return node.parent;
            }
        }
        detach() {
            this.parent = null;
            this.left = null;
            this.right = null;
        }
    }
    exports.TreeNode = TreeNode;
    var NodeColor;
    (function (NodeColor) {
        NodeColor[NodeColor["Black"] = 0] = "Black";
        NodeColor[NodeColor["Red"] = 1] = "Red";
    })(NodeColor || (exports.NodeColor = NodeColor = {}));
    exports.SENTINEL = new TreeNode(null, 0 /* NodeColor.Black */);
    exports.SENTINEL.parent = exports.SENTINEL;
    exports.SENTINEL.left = exports.SENTINEL;
    exports.SENTINEL.right = exports.SENTINEL;
    exports.SENTINEL.color = 0 /* NodeColor.Black */;
    function leftest(node) {
        while (node.left !== exports.SENTINEL) {
            node = node.left;
        }
        return node;
    }
    exports.leftest = leftest;
    function righttest(node) {
        while (node.right !== exports.SENTINEL) {
            node = node.right;
        }
        return node;
    }
    exports.righttest = righttest;
    function calculateSize(node) {
        if (node === exports.SENTINEL) {
            return 0;
        }
        return node.size_left + node.piece.length + calculateSize(node.right);
    }
    function calculateLF(node) {
        if (node === exports.SENTINEL) {
            return 0;
        }
        return node.lf_left + node.piece.lineFeedCnt + calculateLF(node.right);
    }
    function resetSentinel() {
        exports.SENTINEL.parent = exports.SENTINEL;
    }
    function leftRotate(tree, x) {
        const y = x.right;
        // fix size_left
        y.size_left += x.size_left + (x.piece ? x.piece.length : 0);
        y.lf_left += x.lf_left + (x.piece ? x.piece.lineFeedCnt : 0);
        x.right = y.left;
        if (y.left !== exports.SENTINEL) {
            y.left.parent = x;
        }
        y.parent = x.parent;
        if (x.parent === exports.SENTINEL) {
            tree.root = y;
        }
        else if (x.parent.left === x) {
            x.parent.left = y;
        }
        else {
            x.parent.right = y;
        }
        y.left = x;
        x.parent = y;
    }
    exports.leftRotate = leftRotate;
    function rightRotate(tree, y) {
        const x = y.left;
        y.left = x.right;
        if (x.right !== exports.SENTINEL) {
            x.right.parent = y;
        }
        x.parent = y.parent;
        // fix size_left
        y.size_left -= x.size_left + (x.piece ? x.piece.length : 0);
        y.lf_left -= x.lf_left + (x.piece ? x.piece.lineFeedCnt : 0);
        if (y.parent === exports.SENTINEL) {
            tree.root = x;
        }
        else if (y === y.parent.right) {
            y.parent.right = x;
        }
        else {
            y.parent.left = x;
        }
        x.right = y;
        y.parent = x;
    }
    exports.rightRotate = rightRotate;
    function rbDelete(tree, z) {
        let x;
        let y;
        if (z.left === exports.SENTINEL) {
            y = z;
            x = y.right;
        }
        else if (z.right === exports.SENTINEL) {
            y = z;
            x = y.left;
        }
        else {
            y = leftest(z.right);
            x = y.right;
        }
        if (y === tree.root) {
            tree.root = x;
            // if x is null, we are removing the only node
            x.color = 0 /* NodeColor.Black */;
            z.detach();
            resetSentinel();
            tree.root.parent = exports.SENTINEL;
            return;
        }
        const yWasRed = (y.color === 1 /* NodeColor.Red */);
        if (y === y.parent.left) {
            y.parent.left = x;
        }
        else {
            y.parent.right = x;
        }
        if (y === z) {
            x.parent = y.parent;
            recomputeTreeMetadata(tree, x);
        }
        else {
            if (y.parent === z) {
                x.parent = y;
            }
            else {
                x.parent = y.parent;
            }
            // as we make changes to x's hierarchy, update size_left of subtree first
            recomputeTreeMetadata(tree, x);
            y.left = z.left;
            y.right = z.right;
            y.parent = z.parent;
            y.color = z.color;
            if (z === tree.root) {
                tree.root = y;
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
            // update metadata
            // we replace z with y, so in this sub tree, the length change is z.item.length
            y.size_left = z.size_left;
            y.lf_left = z.lf_left;
            recomputeTreeMetadata(tree, y);
        }
        z.detach();
        if (x.parent.left === x) {
            const newSizeLeft = calculateSize(x);
            const newLFLeft = calculateLF(x);
            if (newSizeLeft !== x.parent.size_left || newLFLeft !== x.parent.lf_left) {
                const delta = newSizeLeft - x.parent.size_left;
                const lf_delta = newLFLeft - x.parent.lf_left;
                x.parent.size_left = newSizeLeft;
                x.parent.lf_left = newLFLeft;
                updateTreeMetadata(tree, x.parent, delta, lf_delta);
            }
        }
        recomputeTreeMetadata(tree, x.parent);
        if (yWasRed) {
            resetSentinel();
            return;
        }
        // RB-DELETE-FIXUP
        let w;
        while (x !== tree.root && x.color === 0 /* NodeColor.Black */) {
            if (x === x.parent.left) {
                w = x.parent.right;
                if (w.color === 1 /* NodeColor.Red */) {
                    w.color = 0 /* NodeColor.Black */;
                    x.parent.color = 1 /* NodeColor.Red */;
                    leftRotate(tree, x.parent);
                    w = x.parent.right;
                }
                if (w.left.color === 0 /* NodeColor.Black */ && w.right.color === 0 /* NodeColor.Black */) {
                    w.color = 1 /* NodeColor.Red */;
                    x = x.parent;
                }
                else {
                    if (w.right.color === 0 /* NodeColor.Black */) {
                        w.left.color = 0 /* NodeColor.Black */;
                        w.color = 1 /* NodeColor.Red */;
                        rightRotate(tree, w);
                        w = x.parent.right;
                    }
                    w.color = x.parent.color;
                    x.parent.color = 0 /* NodeColor.Black */;
                    w.right.color = 0 /* NodeColor.Black */;
                    leftRotate(tree, x.parent);
                    x = tree.root;
                }
            }
            else {
                w = x.parent.left;
                if (w.color === 1 /* NodeColor.Red */) {
                    w.color = 0 /* NodeColor.Black */;
                    x.parent.color = 1 /* NodeColor.Red */;
                    rightRotate(tree, x.parent);
                    w = x.parent.left;
                }
                if (w.left.color === 0 /* NodeColor.Black */ && w.right.color === 0 /* NodeColor.Black */) {
                    w.color = 1 /* NodeColor.Red */;
                    x = x.parent;
                }
                else {
                    if (w.left.color === 0 /* NodeColor.Black */) {
                        w.right.color = 0 /* NodeColor.Black */;
                        w.color = 1 /* NodeColor.Red */;
                        leftRotate(tree, w);
                        w = x.parent.left;
                    }
                    w.color = x.parent.color;
                    x.parent.color = 0 /* NodeColor.Black */;
                    w.left.color = 0 /* NodeColor.Black */;
                    rightRotate(tree, x.parent);
                    x = tree.root;
                }
            }
        }
        x.color = 0 /* NodeColor.Black */;
        resetSentinel();
    }
    exports.rbDelete = rbDelete;
    function fixInsert(tree, x) {
        recomputeTreeMetadata(tree, x);
        while (x !== tree.root && x.parent.color === 1 /* NodeColor.Red */) {
            if (x.parent === x.parent.parent.left) {
                const y = x.parent.parent.right;
                if (y.color === 1 /* NodeColor.Red */) {
                    x.parent.color = 0 /* NodeColor.Black */;
                    y.color = 0 /* NodeColor.Black */;
                    x.parent.parent.color = 1 /* NodeColor.Red */;
                    x = x.parent.parent;
                }
                else {
                    if (x === x.parent.right) {
                        x = x.parent;
                        leftRotate(tree, x);
                    }
                    x.parent.color = 0 /* NodeColor.Black */;
                    x.parent.parent.color = 1 /* NodeColor.Red */;
                    rightRotate(tree, x.parent.parent);
                }
            }
            else {
                const y = x.parent.parent.left;
                if (y.color === 1 /* NodeColor.Red */) {
                    x.parent.color = 0 /* NodeColor.Black */;
                    y.color = 0 /* NodeColor.Black */;
                    x.parent.parent.color = 1 /* NodeColor.Red */;
                    x = x.parent.parent;
                }
                else {
                    if (x === x.parent.left) {
                        x = x.parent;
                        rightRotate(tree, x);
                    }
                    x.parent.color = 0 /* NodeColor.Black */;
                    x.parent.parent.color = 1 /* NodeColor.Red */;
                    leftRotate(tree, x.parent.parent);
                }
            }
        }
        tree.root.color = 0 /* NodeColor.Black */;
    }
    exports.fixInsert = fixInsert;
    function updateTreeMetadata(tree, x, delta, lineFeedCntDelta) {
        // node length change or line feed count change
        while (x !== tree.root && x !== exports.SENTINEL) {
            if (x.parent.left === x) {
                x.parent.size_left += delta;
                x.parent.lf_left += lineFeedCntDelta;
            }
            x = x.parent;
        }
    }
    exports.updateTreeMetadata = updateTreeMetadata;
    function recomputeTreeMetadata(tree, x) {
        let delta = 0;
        let lf_delta = 0;
        if (x === tree.root) {
            return;
        }
        // go upwards till the node whose left subtree is changed.
        while (x !== tree.root && x === x.parent.right) {
            x = x.parent;
        }
        if (x === tree.root) {
            // well, it means we add a node to the end (inorder)
            return;
        }
        // x is the node whose right subtree is changed.
        x = x.parent;
        delta = calculateSize(x.left) - x.size_left;
        lf_delta = calculateLF(x.left) - x.lf_left;
        x.size_left += delta;
        x.lf_left += lf_delta;
        // go upwards till root. O(logN)
        while (x !== tree.root && (delta !== 0 || lf_delta !== 0)) {
            if (x.parent.left === x) {
                x.parent.size_left += delta;
                x.parent.lf_left += lf_delta;
            }
            x = x.parent;
        }
    }
    exports.recomputeTreeMetadata = recomputeTreeMetadata;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmJUcmVlQmFzZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbW9kZWwvcGllY2VUcmVlVGV4dEJ1ZmZlci9yYlRyZWVCYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUloRyxNQUFhLFFBQVE7UUFXcEIsWUFBWSxLQUFZLEVBQUUsS0FBZ0I7WUFDekMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFDakIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDbkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbkIsQ0FBQztRQUVNLElBQUk7WUFDVixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssZ0JBQVEsRUFBRTtnQkFDNUIsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzNCO1lBRUQsSUFBSSxJQUFJLEdBQWEsSUFBSSxDQUFDO1lBRTFCLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxnQkFBUSxFQUFFO2dCQUNoQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtvQkFDOUIsTUFBTTtpQkFDTjtnQkFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQzthQUNuQjtZQUVELElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxnQkFBUSxFQUFFO2dCQUM3QixPQUFPLGdCQUFRLENBQUM7YUFDaEI7aUJBQU07Z0JBQ04sT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO2FBQ25C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