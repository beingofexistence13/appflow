/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/workbench/contrib/testing/browser/explorerProjections/display", "vs/workbench/contrib/testing/browser/explorerProjections/index", "vs/workbench/contrib/testing/browser/explorerProjections/testingViewState", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/testTypes"], function (require, exports, event_1, iterator_1, lifecycle_1, display_1, index_1, testingViewState_1, testId_1, testResultService_1, testService_1, testTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wKb = void 0;
    /**
     * Test tree element element that groups be hierarchy.
     */
    class ListTestItemElement extends index_1.$rKb {
        get description() {
            return this.b.map(c => c.item.label).join(display_1.$vKb);
        }
        constructor(test, parent, b) {
            super({ ...test, item: { ...test.item } }, parent);
            this.b = b;
            this.descriptionParts = [];
            this.d();
        }
        update(patch) {
            (0, testTypes_1.$VI)(this.test, patch);
            this.d(patch);
            this.fireChange();
        }
        fireChange() {
            this.e.fire();
        }
        d(patch) {
            if (this.a && (!this.test.item.error || patch?.item?.error)) {
                this.children.delete(this.a);
                this.a = undefined;
            }
            if (this.test.item.error && !this.a) {
                this.a = new index_1.$sKb(this.test.item.error, this);
                this.children.add(this.a);
            }
        }
    }
    /**
     * Projection that lists tests in their traditional tree view.
     */
    let $wKb = class $wKb extends lifecycle_1.$kc {
        /**
         * Gets root elements of the tree.
         */
        get f() {
            const rootsIt = iterator_1.Iterable.map(this.g.collection.rootItems, r => this.b.get(r.item.extId));
            return iterator_1.Iterable.filter(rootsIt, (r) => !!r?.children.size);
        }
        constructor(lastState, g, h) {
            super();
            this.lastState = lastState;
            this.g = g;
            this.h = h;
            this.a = new event_1.$fd();
            this.b = new Map();
            /**
             * @inheritdoc
             */
            this.onUpdate = this.a.event;
            this.B(g.onDidProcessDiff((diff) => this.j(diff)));
            // when test results are cleared, recalculate all state
            this.B(h.onResultsChanged((evt) => {
                if (!('removed' in evt)) {
                    return;
                }
                for (const inTree of this.b.values()) {
                    // Simple logic here, because we know in this projection states
                    // are never inherited.
                    const lookup = this.h.getStateById(inTree.test.item.extId)?.[1];
                    inTree.duration = lookup?.ownDuration;
                    inTree.state = lookup?.ownComputedState || 0 /* TestResultState.Unset */;
                    inTree.fireChange();
                }
            }));
            // when test states change, reflect in the tree
            this.B(h.onTestChanged(ev => {
                if (ev.reason === 2 /* TestResultItemChangeReason.NewMessage */) {
                    return; // no effect in the tree
                }
                let result = ev.item;
                // if the state is unset, or the latest run is not making the change,
                // double check that it's valid. Retire calls might cause previous
                // emit a state change for a test run that's already long completed.
                if (result.ownComputedState === 0 /* TestResultState.Unset */ || ev.result !== h.results[0]) {
                    const fallback = h.getStateById(result.item.extId);
                    if (fallback) {
                        result = fallback[1];
                    }
                }
                const item = this.b.get(result.item.extId);
                if (!item) {
                    return;
                }
                item.retired = !!result.retired;
                item.state = result.computedState;
                item.duration = result.ownDuration;
                item.fireChange();
            }));
            for (const test of g.collection.all) {
                this.s(test);
            }
        }
        /**
         * @inheritdoc
         */
        getElementByTestId(testId) {
            return this.b.get(testId);
        }
        /**
         * @inheritdoc
         */
        j(diff) {
            for (const op of diff) {
                switch (op.op) {
                    case 0 /* TestDiffOpType.Add */: {
                        this.s(op.item);
                        break;
                    }
                    case 1 /* TestDiffOpType.Update */: {
                        this.b.get(op.item.extId)?.update(op.item);
                        break;
                    }
                    case 3 /* TestDiffOpType.Remove */: {
                        for (const [id, item] of this.b) {
                            if (id === op.itemId || testId_1.$PI.isChild(op.itemId, id)) {
                                this.m(item);
                            }
                        }
                        break;
                    }
                }
            }
            if (diff.length !== 0) {
                this.a.fire();
            }
        }
        /**
         * @inheritdoc
         */
        applyTo(tree) {
            // We don't bother doing a very specific update like we do in the TreeProjection.
            // It's a flat list, so chances are we need to render everything anyway.
            // Let the diffIdentityProvider handle that.
            tree.setChildren(null, (0, index_1.$uKb)(this.lastState, this.f, null), {
                diffIdentityProvider: index_1.$tKb,
                diffDepth: Infinity
            });
        }
        /**
         * @inheritdoc
         */
        expandElement(element, depth) {
            if (!(element instanceof ListTestItemElement)) {
                return;
            }
            if (element.test.expand === 0 /* TestItemExpandState.NotExpandable */) {
                return;
            }
            this.g.collection.expand(element.test.item.extId, depth);
        }
        m(treeElement) {
            this.b.delete(treeElement.test.item.extId);
            treeElement.parent?.children.delete(treeElement);
            const parentId = testId_1.$PI.fromString(treeElement.test.item.extId).parentId;
            if (!parentId) {
                return;
            }
            // create the parent if it's now its own leaf
            for (const id of parentId.idsToRoot()) {
                const parentTest = this.g.collection.getNodeById(id.toString());
                if (parentTest) {
                    if (parentTest.children.size === 0 && !this.b.has(id.toString())) {
                        this.n(parentId, parentTest);
                    }
                    break;
                }
            }
        }
        n(testId, item) {
            const displayedParent = testId.isRoot ? null : this.b.get(item.controllerId);
            const chain = [...testId.idsFromRoot()].slice(1, -1).map(id => this.g.collection.getNodeById(id.toString()));
            const treeElement = new ListTestItemElement(item, displayedParent, chain);
            displayedParent?.children.add(treeElement);
            this.b.set(treeElement.test.item.extId, treeElement);
            if (treeElement.depth === 0 || (0, testingViewState_1.$qKb)(this.lastState, treeElement.test.item.extId) === false) {
                this.expandElement(treeElement, Infinity);
            }
            const prevState = this.h.getStateById(treeElement.test.item.extId)?.[1];
            if (prevState) {
                treeElement.retired = !!prevState.retired;
                treeElement.state = prevState.computedState;
                treeElement.duration = prevState.ownDuration;
            }
        }
        s(item) {
            const testId = testId_1.$PI.fromString(item.item.extId);
            // Remove any non-root parent of this item which is no longer a leaf.
            for (const parentId of testId.idsToRoot()) {
                if (!parentId.isRoot) {
                    const prevParent = this.b.get(parentId.toString());
                    if (prevParent) {
                        this.m(prevParent);
                        break;
                    }
                }
            }
            this.n(testId, item);
        }
    };
    exports.$wKb = $wKb;
    exports.$wKb = $wKb = __decorate([
        __param(1, testService_1.$4sb),
        __param(2, testResultService_1.$ftb)
    ], $wKb);
});
//# sourceMappingURL=listProjection.js.map