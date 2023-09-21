/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/iterator", "vs/workbench/contrib/testing/common/testingStates"], function (require, exports, iterator_1, testingStates_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Xsb = void 0;
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
            const stateMap = (0, testingStates_1.$Wsb)();
            for (const child of accessor.getChildren(node)) {
                const childComputed = getComputedState(accessor, child);
                childrenCount++;
                stateMap[childComputed]++;
                // If all children are skipped, make the current state skipped too if unset (#131537)
                computed = childComputed === 5 /* TestResultState.Skipped */ && computed === 0 /* TestResultState.Unset */
                    ? 5 /* TestResultState.Skipped */ : (0, testingStates_1.$Tsb)(computed, childComputed);
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
    const $Xsb = (accessor, node, explicitNewComputedState, refreshDuration = true) => {
        const oldState = accessor.getCurrentComputedState(node);
        const oldPriority = testingStates_1.$Osb[oldState];
        const newState = explicitNewComputedState ?? getComputedState(accessor, node, true);
        const newPriority = testingStates_1.$Osb[newState];
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
                    if (prev !== undefined && testingStates_1.$Osb[prev] >= newPriority) {
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
                    if (prev === undefined || testingStates_1.$Osb[prev] > oldPriority) {
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
    exports.$Xsb = $Xsb;
});
//# sourceMappingURL=getComputedState.js.map