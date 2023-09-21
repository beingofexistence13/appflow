/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./length"], function (require, exports, length_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$MA = void 0;
    /**
     * Allows to efficiently find a longest child at a given offset in a fixed node.
     * The requested offsets must increase monotonously.
    */
    class $MA {
        constructor(node) {
            this.d = length_1.$pt;
            this.a = [node];
            this.b = [length_1.$pt];
            this.c = [];
        }
        /**
         * Returns the longest node at `offset` that satisfies the predicate.
         * @param offset must be greater than or equal to the last offset this method has been called with!
        */
        readLongestNodeAt(offset, predicate) {
            if ((0, length_1.$zt)(offset, this.d)) {
                throw new Error('Invalid offset');
            }
            this.d = offset;
            // Find the longest node of all those that are closest to the current offset.
            while (true) {
                const curNode = lastOrUndefined(this.a);
                if (!curNode) {
                    return undefined;
                }
                const curNodeOffset = lastOrUndefined(this.b);
                if ((0, length_1.$zt)(offset, curNodeOffset)) {
                    // The next best node is not here yet.
                    // The reader must advance before a cached node is hit.
                    return undefined;
                }
                if ((0, length_1.$zt)(curNodeOffset, offset)) {
                    // The reader is ahead of the current node.
                    if ((0, length_1.$vt)(curNodeOffset, curNode.length) <= offset) {
                        // The reader is after the end of the current node.
                        this.e();
                    }
                    else {
                        // The reader is somewhere in the current node.
                        const nextChildIdx = getNextChildIdx(curNode);
                        if (nextChildIdx !== -1) {
                            // Go to the first child and repeat.
                            this.a.push(curNode.getChild(nextChildIdx));
                            this.b.push(curNodeOffset);
                            this.c.push(nextChildIdx);
                        }
                        else {
                            // We don't have children
                            this.e();
                        }
                    }
                }
                else {
                    // readerOffsetBeforeChange === curNodeOffset
                    if (predicate(curNode)) {
                        this.e();
                        return curNode;
                    }
                    else {
                        const nextChildIdx = getNextChildIdx(curNode);
                        // look for shorter node
                        if (nextChildIdx === -1) {
                            // There is no shorter node.
                            this.e();
                            return undefined;
                        }
                        else {
                            // Descend into first child & repeat.
                            this.a.push(curNode.getChild(nextChildIdx));
                            this.b.push(curNodeOffset);
                            this.c.push(nextChildIdx);
                        }
                    }
                }
            }
        }
        // Navigates to the longest node that continues after the current node.
        e() {
            while (true) {
                const currentOffset = lastOrUndefined(this.b);
                const currentNode = lastOrUndefined(this.a);
                this.a.pop();
                this.b.pop();
                if (this.c.length === 0) {
                    // We just popped the root node, there is no next node.
                    break;
                }
                // Parent is not undefined, because idxs is not empty
                const parent = lastOrUndefined(this.a);
                const nextChildIdx = getNextChildIdx(parent, this.c[this.c.length - 1]);
                if (nextChildIdx !== -1) {
                    this.a.push(parent.getChild(nextChildIdx));
                    this.b.push((0, length_1.$vt)(currentOffset, currentNode.length));
                    this.c[this.c.length - 1] = nextChildIdx;
                    break;
                }
                else {
                    this.c.pop();
                }
                // We fully consumed the parent.
                // Current node is now parent, so call nextNodeAfterCurrent again
            }
        }
    }
    exports.$MA = $MA;
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
//# sourceMappingURL=nodeReader.js.map