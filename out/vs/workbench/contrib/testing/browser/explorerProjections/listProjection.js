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
    exports.ListProjection = void 0;
    /**
     * Test tree element element that groups be hierarchy.
     */
    class ListTestItemElement extends index_1.TestItemTreeElement {
        get description() {
            return this.chain.map(c => c.item.label).join(display_1.flatTestItemDelimiter);
        }
        constructor(test, parent, chain) {
            super({ ...test, item: { ...test.item } }, parent);
            this.chain = chain;
            this.descriptionParts = [];
            this.updateErrorVisibility();
        }
        update(patch) {
            (0, testTypes_1.applyTestItemUpdate)(this.test, patch);
            this.updateErrorVisibility(patch);
            this.fireChange();
        }
        fireChange() {
            this.changeEmitter.fire();
        }
        updateErrorVisibility(patch) {
            if (this.errorChild && (!this.test.item.error || patch?.item?.error)) {
                this.children.delete(this.errorChild);
                this.errorChild = undefined;
            }
            if (this.test.item.error && !this.errorChild) {
                this.errorChild = new index_1.TestTreeErrorMessage(this.test.item.error, this);
                this.children.add(this.errorChild);
            }
        }
    }
    /**
     * Projection that lists tests in their traditional tree view.
     */
    let ListProjection = class ListProjection extends lifecycle_1.Disposable {
        /**
         * Gets root elements of the tree.
         */
        get rootsWithChildren() {
            const rootsIt = iterator_1.Iterable.map(this.testService.collection.rootItems, r => this.items.get(r.item.extId));
            return iterator_1.Iterable.filter(rootsIt, (r) => !!r?.children.size);
        }
        constructor(lastState, testService, results) {
            super();
            this.lastState = lastState;
            this.testService = testService;
            this.results = results;
            this.updateEmitter = new event_1.Emitter();
            this.items = new Map();
            /**
             * @inheritdoc
             */
            this.onUpdate = this.updateEmitter.event;
            this._register(testService.onDidProcessDiff((diff) => this.applyDiff(diff)));
            // when test results are cleared, recalculate all state
            this._register(results.onResultsChanged((evt) => {
                if (!('removed' in evt)) {
                    return;
                }
                for (const inTree of this.items.values()) {
                    // Simple logic here, because we know in this projection states
                    // are never inherited.
                    const lookup = this.results.getStateById(inTree.test.item.extId)?.[1];
                    inTree.duration = lookup?.ownDuration;
                    inTree.state = lookup?.ownComputedState || 0 /* TestResultState.Unset */;
                    inTree.fireChange();
                }
            }));
            // when test states change, reflect in the tree
            this._register(results.onTestChanged(ev => {
                if (ev.reason === 2 /* TestResultItemChangeReason.NewMessage */) {
                    return; // no effect in the tree
                }
                let result = ev.item;
                // if the state is unset, or the latest run is not making the change,
                // double check that it's valid. Retire calls might cause previous
                // emit a state change for a test run that's already long completed.
                if (result.ownComputedState === 0 /* TestResultState.Unset */ || ev.result !== results.results[0]) {
                    const fallback = results.getStateById(result.item.extId);
                    if (fallback) {
                        result = fallback[1];
                    }
                }
                const item = this.items.get(result.item.extId);
                if (!item) {
                    return;
                }
                item.retired = !!result.retired;
                item.state = result.computedState;
                item.duration = result.ownDuration;
                item.fireChange();
            }));
            for (const test of testService.collection.all) {
                this.storeItem(test);
            }
        }
        /**
         * @inheritdoc
         */
        getElementByTestId(testId) {
            return this.items.get(testId);
        }
        /**
         * @inheritdoc
         */
        applyDiff(diff) {
            for (const op of diff) {
                switch (op.op) {
                    case 0 /* TestDiffOpType.Add */: {
                        this.storeItem(op.item);
                        break;
                    }
                    case 1 /* TestDiffOpType.Update */: {
                        this.items.get(op.item.extId)?.update(op.item);
                        break;
                    }
                    case 3 /* TestDiffOpType.Remove */: {
                        for (const [id, item] of this.items) {
                            if (id === op.itemId || testId_1.TestId.isChild(op.itemId, id)) {
                                this.unstoreItem(item);
                            }
                        }
                        break;
                    }
                }
            }
            if (diff.length !== 0) {
                this.updateEmitter.fire();
            }
        }
        /**
         * @inheritdoc
         */
        applyTo(tree) {
            // We don't bother doing a very specific update like we do in the TreeProjection.
            // It's a flat list, so chances are we need to render everything anyway.
            // Let the diffIdentityProvider handle that.
            tree.setChildren(null, (0, index_1.getChildrenForParent)(this.lastState, this.rootsWithChildren, null), {
                diffIdentityProvider: index_1.testIdentityProvider,
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
            this.testService.collection.expand(element.test.item.extId, depth);
        }
        unstoreItem(treeElement) {
            this.items.delete(treeElement.test.item.extId);
            treeElement.parent?.children.delete(treeElement);
            const parentId = testId_1.TestId.fromString(treeElement.test.item.extId).parentId;
            if (!parentId) {
                return;
            }
            // create the parent if it's now its own leaf
            for (const id of parentId.idsToRoot()) {
                const parentTest = this.testService.collection.getNodeById(id.toString());
                if (parentTest) {
                    if (parentTest.children.size === 0 && !this.items.has(id.toString())) {
                        this._storeItem(parentId, parentTest);
                    }
                    break;
                }
            }
        }
        _storeItem(testId, item) {
            const displayedParent = testId.isRoot ? null : this.items.get(item.controllerId);
            const chain = [...testId.idsFromRoot()].slice(1, -1).map(id => this.testService.collection.getNodeById(id.toString()));
            const treeElement = new ListTestItemElement(item, displayedParent, chain);
            displayedParent?.children.add(treeElement);
            this.items.set(treeElement.test.item.extId, treeElement);
            if (treeElement.depth === 0 || (0, testingViewState_1.isCollapsedInSerializedTestTree)(this.lastState, treeElement.test.item.extId) === false) {
                this.expandElement(treeElement, Infinity);
            }
            const prevState = this.results.getStateById(treeElement.test.item.extId)?.[1];
            if (prevState) {
                treeElement.retired = !!prevState.retired;
                treeElement.state = prevState.computedState;
                treeElement.duration = prevState.ownDuration;
            }
        }
        storeItem(item) {
            const testId = testId_1.TestId.fromString(item.item.extId);
            // Remove any non-root parent of this item which is no longer a leaf.
            for (const parentId of testId.idsToRoot()) {
                if (!parentId.isRoot) {
                    const prevParent = this.items.get(parentId.toString());
                    if (prevParent) {
                        this.unstoreItem(prevParent);
                        break;
                    }
                }
            }
            this._storeItem(testId, item);
        }
    };
    exports.ListProjection = ListProjection;
    exports.ListProjection = ListProjection = __decorate([
        __param(1, testService_1.ITestService),
        __param(2, testResultService_1.ITestResultService)
    ], ListProjection);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdFByb2plY3Rpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXN0aW5nL2Jyb3dzZXIvZXhwbG9yZXJQcm9qZWN0aW9ucy9saXN0UHJvamVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnQmhHOztPQUVHO0lBQ0gsTUFBTSxtQkFBb0IsU0FBUSwyQkFBbUI7UUFLcEQsSUFBb0IsV0FBVztZQUM5QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsK0JBQXFCLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBRUQsWUFDQyxJQUFzQixFQUN0QixNQUFrQyxFQUNqQixLQUF5QjtZQUUxQyxLQUFLLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRmxDLFVBQUssR0FBTCxLQUFLLENBQW9CO1lBVHBDLHFCQUFnQixHQUFhLEVBQUUsQ0FBQztZQVl0QyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUM5QixDQUFDO1FBRU0sTUFBTSxDQUFDLEtBQXNCO1lBQ25DLElBQUEsK0JBQW1CLEVBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ25CLENBQUM7UUFFTSxVQUFVO1lBQ2hCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUVPLHFCQUFxQixDQUFD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