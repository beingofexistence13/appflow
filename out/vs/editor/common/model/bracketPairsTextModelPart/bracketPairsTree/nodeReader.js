/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./length"], function (require, exports, length_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeReader = void 0;
    /**
     * Allows to efficiently find a longest child at a given offset in a fixed node.
     * The requested offsets must increase monotonously.
    */
    class NodeReader {
        constructor(node) {
            this.lastOffset = length_1.lengthZero;
            this.nextNodes = [node];
            this.offsets = [length_1.lengthZero];
            this.idxs = [];
        }
        /**
         * Returns the longest node at `offset` that satisfies the predicate.
         * @param offset must be greater than or equal to the last offset this method has been called with!
        */
        readLongestNodeAt(offset, predicate) {
            if ((0, length_1.lengthLessThan)(offset, this.lastOffset)) {
                throw new Error('Invalid offset');
            }
            this.lastOffset = offset;
            // Find the longest node of all those that are closest to the current offset.
            while (true) {
                const curNode = lastOrUndefined(this.nextNodes);
                if (!curNode) {
                    return undefined;
                }
                const curNodeOffset = lastOrUndefined(this.offsets);
                if ((0, length_1.lengthLessThan)(offset, curNodeOffset)) {
                    // The next best node is not here yet.
                    // The reader must advance before a cached node is hit.
                    return undefined;
                }
                if ((0, length_1.lengthLessThan)(curNodeOffset, offset)) {
                    // The reader is ahead of the current node.
                    if ((0, length_1.lengthAdd)(curNodeOffset, curNode.length) <= offset) {
                        // The reader is after the end of the current node.
                        this.nextNodeAfterCurrent();
                    }
                    else {
                        // The reader is somewhere in the current node.
                        const nextChildIdx = getNextChildIdx(curNode);
                        if (nextChildIdx !== -1) {
                            // Go to the first child and repeat.
                            this.nextNodes.push(curNode.getChild(nextChildIdx));
                            this.offsets.push(curNodeOffset);
                            this.idxs.push(nextChildIdx);
                        }
                        else {
                            // We don't have children
                            this.nextNodeAfterCurrent();
                        }
                    }
                }
                else {
                    // readerOffsetBeforeChange === curNodeOffset
                    if (predicate(curNode)) {
                        this.nextNodeAfterCurrent();
                        return curNode;
                    }
                    else {
                        const nextChildIdx = getNextChildIdx(curNode);
                        // look for shorter node
                        if (nextChildIdx === -1) {
                            // There is no shorter node.
                            this.nextNodeAfterCurrent();
                            return undefined;
                        }
                        else {
                            // Descend into first child & repeat.
                            this.nextNodes.push(curNode.getChild(nextChildIdx));
                            this.offsets.push(curNodeOffset);
                            this.idxs.push(nextChildIdx);
                        }
                    }
                }
            }
        }
        // Navigates to the longest node that continues after the current node.
        nextNodeAfterCurrent() {
            while (true) {
                const currentOffset = lastOrUndefined(this.offsets);
                const currentNode = lastOrUndefined(this.nextNodes);
                this.nextNodes.pop();
                this.offsets.pop();
                if (this.idxs.length === 0) {
                    // We just popped the root node, there is no next node.
                    break;
                }
                // Parent is not undefined, because idxs is not empty
                const parent = lastOrUndefined(this.nextNodes);
                const nextChildIdx = getNextChildIdx(parent, this.idxs[this.idxs.length - 1]);
                if (nextChildIdx !== -1) {
                    this.nextNodes.push(parent.getChild(nextChildIdx));
                    this.offsets.push((0, length_1.lengthAdd)(currentOffset, currentNode.length));
                    this.idxs[this.idxs.length - 1] = nextChildIdx;
                    break;
                }
                else {
                    this.idxs.pop();
                }
                // We fully consumed the parent.
                // Current node is now parent, so call nextNodeAfterCurrent again
            }
        }
    }
    exports.NodeReader = NodeReader;
    function getNextChildIdx(node, curIdx = -1) {
        while (true) {
            curIdx++;
            if (curIdx >= node.childrenLength) {
                return -1;
            }
            if (node.getChild(curIdx)) {
                return curIdx;
            }
        }
    }
    function lastOrUndefined(arr) {
        return arr.length > 0 ? arr[arr.length - 1] : undefined;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZVJlYWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb21tb24vbW9kZWwvYnJhY2tldFBhaXJzVGV4dE1vZGVsUGFydC9icmFja2V0UGFpcnNUcmVlL25vZGVSZWFkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHOzs7TUFHRTtJQUNGLE1BQWEsVUFBVTtRQU10QixZQUFZLElBQWE7WUFGakIsZUFBVSxHQUFXLG1CQUFVLENBQUM7WUFHdkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxtQkFBVSxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDaEIsQ0FBQztRQUVEOzs7VUFHRTtRQUNGLGlCQUFpQixDQUFDLE1BQWMsRUFBRSxTQUFxQztZQUN0RSxJQUFJLElBQUEsdUJBQWMsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUM1QyxNQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7YUFDbEM7WUFDRCxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztZQUV6Qiw2RUFBNkU7WUFDN0UsT0FBTyxJQUFJLEVBQUU7Z0JBQ1osTUFBTSxPQUFPLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFaEQsSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDYixPQUFPLFNBQVMsQ0FBQztpQkFDakI7Z0JBQ0QsTUFBTSxhQUFhLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUUsQ0FBQztnQkFFckQsSUFBSSxJQUFBLHVCQUFjLEVBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxFQUFFO29CQUMxQyxzQ0FBc0M7b0JBQ3RDLHVEQUF1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