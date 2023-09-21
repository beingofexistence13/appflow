/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/list/browser/listService", "vs/workbench/contrib/testing/browser/explorerProjections/index", "vs/workbench/contrib/testing/common/testId"], function (require, exports, listService_1, index_1, testId_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xKb = void 0;
    class $xKb extends listService_1.$t4 {
        /**
         * Gets a serialized view state for the tree, optimized for storage.
         *
         * @param updatePreviousState Optional previous state to mutate and update
         * instead of creating a new one.
         */
        getOptimizedViewState(updatePreviousState) {
            const root = updatePreviousState || {};
            /**
             * Recursive builder function. Returns whether the subtree has any non-default
             * value. Adds itself to the parent children if it does.
             */
            const build = (node, parent) => {
                if (!(node.element instanceof index_1.$rKb)) {
                    return false;
                }
                const localId = testId_1.$PI.localId(node.element.test.item.extId);
                const inTree = parent.children?.[localId] || {};
                // only saved collapsed state if it's not the default (not collapsed, or a root depth)
                inTree.collapsed = node.depth === 0 || !node.collapsed ? node.collapsed : undefined;
                let hasAnyNonDefaultValue = inTree.collapsed !== undefined;
                if (node.children.length) {
                    for (const child of node.children) {
                        hasAnyNonDefaultValue = build(child, inTree) || hasAnyNonDefaultValue;
                    }
                }
                if (hasAnyNonDefaultValue) {
                    parent.children ??= {};
                    parent.children[localId] = inTree;
                }
                else if (parent.children?.hasOwnProperty(localId)) {
                    delete parent.children[localId];
                }
                return hasAnyNonDefaultValue;
            };
            root.children ??= {};
            // Controller IDs are hidden if there's only a single test controller, but
            // make sure they're added when the tree is built if this is the case, so
            // that the later ID lookup works.
            for (const node of this.getNode().children) {
                if (node.element instanceof index_1.$rKb) {
                    if (node.element.test.controllerId === node.element.test.item.extId) {
                        build(node, root);
                    }
                    else {
                        const ctrlNode = root.children[node.element.test.controllerId] ??= { children: {} };
                        build(node, ctrlNode);
                    }
                }
            }
            return root;
        }
    }
    exports.$xKb = $xKb;
});
//# sourceMappingURL=testingObjectTree.js.map