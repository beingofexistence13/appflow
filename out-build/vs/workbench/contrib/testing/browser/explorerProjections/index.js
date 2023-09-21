/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/tree/tree", "vs/base/common/event", "vs/base/common/iterator", "vs/workbench/contrib/testing/browser/explorerProjections/testingViewState", "vs/workbench/contrib/testing/common/testTypes"], function (require, exports, tree_1, event_1, iterator_1, testingViewState_1, testTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uKb = exports.$tKb = exports.$sKb = exports.$rKb = void 0;
    let idCounter = 0;
    const getId = () => String(idCounter++);
    class $rKb {
        constructor(test, 
        /**
         * Parent tree item. May not actually be the test item who owns this one
         * in a 'flat' projection.
         */
        parent = null) {
            this.test = test;
            this.parent = parent;
            this.e = new event_1.$fd();
            /**
             * Fired whenever the element or test properties change.
             */
            this.onChange = this.e.event;
            /**
             * Tree children of this item.
             */
            this.children = new Set();
            /**
             * Unique ID of the element in the tree.
             */
            this.treeId = getId();
            /**
             * Depth of the element in the tree.
             */
            this.depth = this.parent ? this.parent.depth + 1 : 0;
            /**
             * Whether the node's test result is 'retired' -- from an outdated test run.
             */
            this.retired = false;
            /**
             * State to show on the item. This is generally the item's computed state
             * from its children.
             */
            this.state = 0 /* TestResultState.Unset */;
        }
        toJSON() {
            if (this.depth === 0) {
                return { controllerId: this.test.controllerId };
            }
            const context = {
                $mid: 16 /* MarshalledId.TestItemContext */,
                tests: [testTypes_1.InternalTestItem.serialize(this.test)],
            };
            for (let p = this.parent; p && p.depth > 0; p = p.parent) {
                context.tests.unshift(testTypes_1.InternalTestItem.serialize(p.test));
            }
            return context;
        }
    }
    exports.$rKb = $rKb;
    class $sKb {
        get description() {
            return typeof this.message === 'string' ? this.message : this.message.value;
        }
        constructor(message, parent) {
            this.message = message;
            this.parent = parent;
            this.treeId = getId();
            this.children = new Set();
        }
    }
    exports.$sKb = $sKb;
    exports.$tKb = {
        getId(element) {
            return element.treeId + '\0' + (element instanceof $sKb ? 'error' : element.test.expand);
        }
    };
    const $uKb = (serialized, rootsWithChildren, node) => {
        let it;
        if (node === null) { // roots
            const rootsWithChildrenArr = [...rootsWithChildren];
            if (rootsWithChildrenArr.length === 1) {
                return (0, exports.$uKb)(serialized, rootsWithChildrenArr, rootsWithChildrenArr[0]);
            }
            it = rootsWithChildrenArr;
        }
        else {
            it = node.children;
        }
        return iterator_1.Iterable.map(it, element => (element instanceof $sKb
            ? { element }
            : {
                element,
                collapsible: element.test.expand !== 0 /* TestItemExpandState.NotExpandable */,
                collapsed: (0, testingViewState_1.$qKb)(serialized, element.test.item.extId) ?? element.depth > 0
                    ? tree_1.ObjectTreeElementCollapseState.PreserveOrCollapsed
                    : tree_1.ObjectTreeElementCollapseState.PreserveOrExpanded,
                children: (0, exports.$uKb)(serialized, rootsWithChildren, element),
            }));
    };
    exports.$uKb = $uKb;
});
//# sourceMappingURL=index.js.map