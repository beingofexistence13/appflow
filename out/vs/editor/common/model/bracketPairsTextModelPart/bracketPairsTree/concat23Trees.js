/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./ast"], function (require, exports, ast_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.concat23TreesOfSameHeight = exports.concat23Trees = void 0;
    /**
     * Concatenates a list of (2,3) AstNode's into a single (2,3) AstNode.
     * This mutates the items of the input array!
     * If all items have the same height, this method has runtime O(items.length).
     * Otherwise, it has runtime O(items.length * max(log(items.length), items.max(i => i.height))).
    */
    function concat23Trees(items) {
        if (items.length === 0) {
            return null;
        }
        if (items.length === 1) {
            return items[0];
        }
        let i = 0;
        /**
         * Reads nodes of same height and concatenates them to a single node.
        */
        function readNode() {
            if (i >= items.length) {
                return null;
            }
            const start = i;
            const height = items[start].listHeight;
            i++;
            while (i < items.length && items[i].listHeight === height) {
                i++;
            }
            if (i - start >= 2) {
                return concat23TreesOfSameHeight(start === 0 && i === items.length ? items : items.slice(start, i), false);
            }
            else {
                return items[start];
            }
        }
        // The items might not have the same height.
        // We merge all items by using a binary concat operator.
        let first = readNode(); // There must be a first item
        let second = readNode();
        if (!second) {
            return first;
        }
        for (let item = readNode(); item; item = readNode()) {
            // Prefer concatenating smaller trees, as the runtime of concat depends on the tree height.
            if (heightDiff(first, second) <= heightDiff(second, item)) {
                first = concat(first, second);
                second = item;
            }
            else {
                second = concat(second, item);
            }
        }
        const result = concat(first, second);
        return result;
    }
    exports.concat23Trees = concat23Trees;
    function concat23TreesOfSameHeight(items, createImmutableLists = false) {
        if (items.length === 0) {
            return null;
        }
        if (items.length === 1) {
            return items[0];
        }
        let length = items.length;
        // All trees have same height, just create parent nodes.
        while (length > 3) {
            const newLength = length >> 1;
            for (let i = 0; i < newLength; i++) {
                const j = i << 1;
                items[i] = ast_1.ListAstNode.create23(items[j], items[j + 1], j + 3 === length ? items[j + 2] : null, createImmutableLists);
            }
            length = newLength;
        }
        return ast_1.ListAstNode.create23(items[0], items[1], length >= 3 ? items[2] : null, createImmutableLists);
    }
    exports.concat23TreesOfSameHeight = concat23TreesOfSameHeight;
    function heightDiff(node1, node2) {
        return Math.abs(node1.listHeight - node2.listHeight);
    }
    function concat(node1, node2) {
        if (node1.listHeight === node2.listHeight) {
            return ast_1.ListAstNode.create23(node1, node2, null, false);
        }
        else if (node1.listHeight > node2.listHeight) {
            // node1 is the tree we want to insert into
            return append(node1, node2);
        }
        else {
            return prepend(node2, node1);
        }
    }
    /**
     * Appends the given node to the end of this (2,3) tree.
     * Returns the new root.
    */
    function append(list, nodeToAppend) {
        list = list.toMutable();
        let curNode = list;
        const parents = [];
        let nodeToAppendOfCorrectHeight;
        while (true) {
            // assert nodeToInsert.listHeight <= curNode.listHeight
            if (nodeToAppend.listHeight === curNode.listHeight) {
                nodeToAppendOfCorrectHeight = nodeToAppend;
                break;
            }
            // assert 0 <= nodeToInsert.listHeight < curNode.listHeight
            if (curNode.kind !== 4 /* AstNodeKind.List */) {
                throw new Error('unexpected');
            }
            parents.push(curNode);
            // assert 2 <= curNode.childrenLength <= 3
            curNode = curNode.makeLastElementMutable();
        }
        // assert nodeToAppendOfCorrectHeight!.listHeight === curNode.listHeight
        for (let i = parents.length - 1; i >= 0; i--) {
            const parent = parents[i];
            if (nodeToAppendOfCorrectHeight) {
                // Can we take the element?
                if (parent.childrenLength >= 3) {
                    // assert parent.childrenLength === 3 && parent.listHeight === nodeToAppendOfCorrectHeight.listHeight + 1
                    // we need to split to maintain (2,3)-tree property.
                    // Send the third element + the new element to the parent.
                    nodeToAppendOfCorrectHeight = ast_1.ListAstNode.create23(parent.unappendChild(), nodeToAppendOfCorrectHeight, null, false);
                }
                else {
                    parent.appendChildOfSameHeight(nodeToAppendOfCorrectHeight);
                    nodeToAppendOfCorrectHeight = undefined;
                }
            }
            else {
                parent.handleChildrenChanged();
            }
        }
        if (nodeToAppendOfCorrectHeight) {
            return ast_1.ListAstNode.create23(list, nodeToAppendOfCorrectHeight, null, false);
        }
        else {
            return list;
        }
    }
    /**
     * Prepends the given node to the end of this (2,3) tree.
     * Returns the new root.
    */
    function prepend(list, nodeToAppend) {
        list = list.toMutable();
        let curNode = list;
        const parents = [];
        // assert nodeToInsert.listHeight <= curNode.listHeight
        while (nodeToAppend.listHeight !== curNode.listHeight) {
            // assert 0 <= nodeToInsert.listHeight < curNode.listHeight
            if (curNode.kind !== 4 /* AstNodeKind.List */) {
                throw new Error('unexpected');
            }
            parents.push(curNode);
            // assert 2 <= curNode.childrenFast.length <= 3
            curNode = curNode.makeFirstElementMutable();
        }
        let nodeToPrependOfCorrectHeight = nodeToAppend;
        // assert nodeToAppendOfCorrectHeight!.listHeight === curNode.listHeight
        for (let i = parents.length - 1; i >= 0; i--) {
            const parent = parents[i];
            if (nodeToPrependOfCorrectHeight) {
                // Can we take the element?
                if (parent.childrenLength >= 3) {
                    // assert parent.childrenLength === 3 && parent.listHeight === nodeToAppendOfCorrectHeight.listHeight + 1
                    // we need to split to maintain (2,3)-tree property.
                    // Send the third element + the new element to the parent.
                    nodeToPrependOfCorrectHeight = ast_1.ListAstNode.create23(nodeToPrependOfCorrectHeight, parent.unprependChild(), null, false);
                }
                else {
                    parent.prependChildOfSameHeight(nodeToPrependOfCorrectHeight);
                    nodeToPrependOfCorrectHeight = undefined;
                }
            }
            else {
                parent.handleChildrenChanged();
            }
        }
        if (nodeToPrependOfCorrectHeight) {
            return ast_1.ListAstNode.create23(nodeToPrependOfCorrectHeight, list, null, false);
        }
        else {
            return list;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uY2F0MjNUcmVlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbW9kZWwvYnJhY2tldFBhaXJzVGV4dE1vZGVsUGFydC9icmFja2V0UGFpcnNUcmVlL2NvbmNhdDIzVHJlZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHOzs7OztNQUtFO0lBQ0YsU0FBZ0IsYUFBYSxDQUFDLEtBQWdCO1FBQzdDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDdkIsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUNELElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDdkIsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDaEI7UUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVjs7VUFFRTtRQUNGLFNBQVMsUUFBUTtZQUNoQixJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUN0QixPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFFdkMsQ0FBQyxFQUFFLENBQUM7WUFDSixPQUFPLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEtBQUssTUFBTSxFQUFFO2dCQUMxRCxDQUFDLEVBQUUsQ0FBQzthQUNKO1lBRUQsSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsRUFBRTtnQkFDbkIsT0FBTyx5QkFBeUIsQ0FBQyxLQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFD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