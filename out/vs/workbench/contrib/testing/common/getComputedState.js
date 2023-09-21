/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/iterator", "vs/workbench/contrib/testing/common/testingStates"], function (require, exports, iterator_1, testingStates_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.refreshComputedState = void 0;
    const isDurationAccessor = (accessor) => 'getOwnDuration' in accessor;
    /**
     * Gets the computed state for the node.
     * @param force whether to refresh the computed state for this node, even
     * if it was previously set.
     */
    const getComputedState = (accessor, node, force = false) => {
        let computed = accessor.getCurrentComputedState(node);
        if (computed === undefined || force) {
            computed = accessor.getOwnState(node) ?? 0 /* TestResultState.Unset */;
            let childrenCount = 0;
            const stateMap = (0, testingStates_1.makeEmptyCounts)();
            for (const child of accessor.getChildren(node)) {
                const childComputed = getComputedState(accessor, child);
                childrenCount++;
                stateMap[childComputed]++;
                // If all children are skipped, make the current state skipped too if unset (#131537)
                computed = childComputed === 5 /* TestResultState.Skipped */ && computed === 0 /* TestResultState.Unset */
                    ? 5 /* TestResultState.Skipped */ : (0, testingStates_1.maxPriority)(computed, childComputed);
            }
            if (childrenCount > LARGE_NODE_THRESHOLD) {
                largeNodeChildrenStates.set(node, stateMap);
            }
            accessor.setComputedState(node, computed);
        }
        return computed;
    };
    const getComputedDuration = (accessor, node, force = false) => {
        let computed = accessor.getCurrentComputedDuration(node);
        if (computed === undefined || force) {
            const own = accessor.getOwnDuration(node);
            if (own !== undefined) {
                computed = own;
            }
            else {
                computed = undefined;
                for (const child of accessor.getChildren(node)) {
                    const d = getComputedDuration(accessor, child);
                    if (d !== undefined) {
                        computed = (computed || 0) + d;
                    }
                }
            }
            accessor.setComputedDuration(node, computed);
        }
        return computed;
    };
    const LARGE_NODE_THRESHOLD = 64;
    /**
     * Map of how many nodes have in each state. This is used to optimize state
     * computation in large nodes with children above the `LARGE_NODE_THRESHOLD`.
     */
    const largeNodeChildrenStates = new WeakMap();
    /**
     * Refreshes the computed state for the node and its parents. Any changes
     * elements cause `addUpdated` to be called.
     */
    const refreshComputedState = (accessor, node, explicitNewComputedState, refreshDuration = true) => {
        const oldState = accessor.getCurrentComputedState(node);
        const oldPriority = testingStates_1.statePriority[oldState];
        const newState = explicitNewComputedState ?? getComputedState(accessor, node, true);
        const newPriority = testingStates_1.statePriority[newState];
        const toUpdate = new Set();
        if (newPriority !== oldPriority) {
            accessor.setComputedState(node, newState);
            toUpdate.add(node);
            let moveFromState = oldState;
            let moveToState = newState;
            for (const parent of accessor.getParents(node)) {
                const lnm = largeNodeChildrenStates.get(parent);
                if (lnm) {
                    lnm[moveFromState]--;
                    lnm[moveToState]++;
                }
                const prev = accessor.getCurrentComputedState(parent);
                if (newPriority > oldPriority) {
                    // Update all parents to ensure they're at least this priority.
                    if (prev !== undefined && testingStates_1.statePriority[prev] >= newPriority) {
                        break;
                    }
                    if (lnm && lnm[moveToState] > 1) {
                        break;
                    }
                    // moveToState remains the same, the new higher priority node state
                    accessor.setComputedState(parent, newState);
                    toUpdate.add(parent);
                }
                else /* newProirity < oldPriority */ {
                    // Update all parts whose statese might have been based on this one
                    if (prev === undefined || testingStates_1.statePriority[prev] > oldPriority) {
                        break;
                    }
                    if (lnm && lnm[moveFromState] > 0) {
                        break;
                    }
                    moveToState = getComputedState(accessor, parent, true);
                    accessor.setComputedState(parent, moveToState);
                    toUpdate.add(parent);
                }
                moveFromState = prev;
            }
        }
        if (isDurationAccessor(accessor) && refreshDuration) {
            for (const parent of iterator_1.Iterable.concat(iterator_1.Iterable.single(node), accessor.getParents(node))) {
                const oldDuration = accessor.getCurrentComputedDuration(parent);
                const newDuration = getComputedDuration(accessor, parent, true);
                if (oldDuration === newDuration) {
                    break;
                }
                accessor.setComputedDuration(parent, newDuration);
                toUpdate.add(parent);
            }
        }
        return toUpdate;
    };
    exports.refreshComputedState = refreshComputedState;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Q29tcHV0ZWRTdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlc3RpbmcvY29tbW9uL2dldENvbXB1dGVkU3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBdUJoRyxNQUFNLGtCQUFrQixHQUFHLENBQUksUUFBbUMsRUFBb0QsRUFBRSxDQUFDLGdCQUFnQixJQUFJLFFBQVEsQ0FBQztJQUV0Sjs7OztPQUlHO0lBRUgsTUFBTSxnQkFBZ0IsR0FBRyxDQUFtQixRQUFtQyxFQUFFLElBQU8sRUFBRSxLQUFLLEdBQUcsS0FBSyxFQUFFLEVBQUU7UUFDMUcsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RELElBQUksUUFBUSxLQUFLLFNBQVMsSUFBSSxLQUFLLEVBQUU7WUFDcEMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGlDQUF5QixDQUFDO1lBRS9ELElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQztZQUN0QixNQUFNLFFBQVEsR0FBRyxJQUFBLCtCQUFlLEdBQUUsQ0FBQztZQUVuQyxLQUFLLE1BQU0sS0FBSyxJQUFJLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQy9DLE1BQU0sYUFBYSxHQUFHLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDeEQsYUFBYSxFQUFFLENBQUM7Z0JBQ2hCLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO2dCQUUxQixxRkFBcUY7Z0JBQ3JGLFFBQVEsR0FBRyxhQUFhLG9DQUE0QixJQUFJLFFBQVEsa0NBQTBCO29CQUN6RixDQUFDLGlDQUF5QixDQUFDLENBQUMsSUFBQSwyQkFBVyxFQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQzth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