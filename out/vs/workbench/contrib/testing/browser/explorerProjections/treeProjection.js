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
define(["require", "exports", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/workbench/contrib/testing/browser/explorerProjections/index", "vs/workbench/contrib/testing/browser/explorerProjections/testingViewState", "vs/workbench/contrib/testing/common/getComputedState", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/testTypes"], function (require, exports, event_1, iterator_1, lifecycle_1, index_1, testingViewState_1, getComputedState_1, testId_1, testResultService_1, testService_1, testTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TreeProjection = void 0;
    const computedStateAccessor = {
        getOwnState: i => i instanceof index_1.TestItemTreeElement ? i.ownState : 0 /* TestResultState.Unset */,
        getCurrentComputedState: i => i.state,
        setComputedState: (i, s) => i.state = s,
        getCurrentComputedDuration: i => i.duration,
        getOwnDuration: i => i instanceof index_1.TestItemTreeElement ? i.ownDuration : undefined,
        setComputedDuration: (i, d) => i.duration = d,
        getChildren: i => iterator_1.Iterable.filter(i.children.values(), (t) => t instanceof TreeTestItemElement),
        *getParents(i) {
            for (let parent = i.parent; parent; parent = parent.parent) {
                yield parent;
            }
        },
    };
    /**
     * Test tree element element that groups be hierarchy.
     */
    class TreeTestItemElement extends index_1.TestItemTreeElement {
        get description() {
            return this.test.item.description;
        }
        constructor(test, parent, addedOrRemoved) {
            super({ ...test, item: { ...test.item } }, parent);
            this.addedOrRemoved = addedOrRemoved;
            /**
             * Own, non-computed state.
             * @internal
             */
            this.ownState = 0 /* TestResultState.Unset */;
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
                this.addedOrRemoved(this);
                this.children.delete(this.errorChild);
                this.errorChild = undefined;
            }
            if (this.test.item.error && !this.errorChild) {
                this.errorChild = new index_1.TestTreeErrorMessage(this.test.item.error, this);
                this.children.add(this.errorChild);
                this.addedOrRemoved(this);
            }
        }
    }
    /**
     * Projection that lists tests in their traditional tree view.
     */
    let TreeProjection = class TreeProjection extends lifecycle_1.Disposable {
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
            this.changedParents = new Set();
            this.resortedParents = new Set();
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
                for (const inTree of [...this.items.values()].sort((a, b) => b.depth - a.depth)) {
                    const lookup = this.results.getStateById(inTree.test.item.extId)?.[1];
                    inTree.ownDuration = lookup?.ownDuration;
                    (0, getComputedState_1.refreshComputedState)(computedStateAccessor, inTree, lookup?.ownComputedState ?? 0 /* TestResultState.Unset */).forEach(i => i.fireChange());
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
                // Skip refreshing the duration if we can trivially tell it didn't change.
                const refreshDuration = ev.reason === 1 /* TestResultItemChangeReason.OwnStateChange */ && ev.previousOwnDuration !== result.ownDuration;
                // For items without children, always use the computed state. They are
                // either leaves (for which it's fine) or nodes where we haven't expanded
                // children and should trust whatever the result service gives us.
                const explicitComputed = item.children.size ? undefined : result.computedState;
                item.retired = !!result.retired;
                item.ownState = result.ownComputedState;
                item.ownDuration = result.ownDuration;
                item.fireChange();
                (0, getComputedState_1.refreshComputedState)(computedStateAccessor, item, explicitComputed, refreshDuration).forEach(i => i.fireChange());
            }));
            for (const test of testService.collection.all) {
                this.storeItem(this.createItem(test));
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
                        const item = this.createItem(op.item);
                        this.storeItem(item);
                        break;
                    }
                    case 1 /* TestDiffOpType.Update */: {
                        const patch = op.item;
                        const existing = this.items.get(patch.extId);
                        if (!existing) {
                            break;
                        }
                        // parent needs to be re-rendered on an expand update, so that its
                        // children are rewritten.
                        const needsParentUpdate = existing.test.expand === 0 /* TestItemExpandState.NotExpandable */ && patch.expand;
                        existing.update(patch);
                        if (needsParentUpdate) {
                            this.changedParents.add(existing.parent);
                        }
                        else {
                            this.resortedParents.add(existing.parent);
                        }
                        break;
                    }
                    case 3 /* TestDiffOpType.Remove */: {
                        const toRemove = this.items.get(op.itemId);
                        if (!toRemove) {
                            break;
                        }
                        // The first element will cause the root to be hidden
                        const affectsRootElement = toRemove.depth === 1 && toRemove.parent?.children.size === 1;
                        this.changedParents.add(affectsRootElement ? null : toRemove.parent);
                        const queue = [[toRemove]];
                        while (queue.length) {
                            for (const item of queue.pop()) {
                                if (item instanceof TreeTestItemElement) {
                                    queue.push(this.unstoreItem(item));
                                }
                            }
                        }
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
            for (const s of [this.changedParents, this.resortedParents]) {
                for (const element of s) {
                    if (element && !tree.hasElement(element)) {
                        s.delete(element);
                    }
                }
            }
            for (const parent of this.changedParents) {
                tree.setChildren(parent, (0, index_1.getChildrenForParent)(this.lastState, this.rootsWithChildren, parent), { diffIdentityProvider: index_1.testIdentityProvider });
            }
            for (const parent of this.resortedParents) {
                tree.resort(parent, false);
            }
        }
        /**
         * @inheritdoc
         */
        expandElement(element, depth) {
            if (!(element instanceof TreeTestItemElement)) {
                return;
            }
            if (element.test.expand === 0 /* TestItemExpandState.NotExpandable */) {
                return;
            }
            this.testService.collection.expand(element.test.item.extId, depth);
        }
        createItem(item) {
            const parentId = testId_1.TestId.parentId(item.item.extId);
            const parent = parentId ? this.items.get(parentId) : null;
            return new TreeTestItemElement(item, parent, n => this.changedParents.add(n));
        }
        unstoreItem(treeElement) {
            const parent = treeElement.parent;
            parent?.children.delete(treeElement);
            this.items.delete(treeElement.test.item.extId);
            if (parent instanceof TreeTestItemElement) {
                (0, getComputedState_1.refreshComputedState)(computedStateAccessor, parent, undefined, !!treeElement.duration).forEach(i => i.fireChange());
            }
            return treeElement.children;
        }
        storeItem(treeElement) {
            treeElement.parent?.children.add(treeElement);
            this.items.set(treeElement.test.item.extId, treeElement);
            // The first element will cause the root to be shown
            const affectsRootElement = treeElement.depth === 1 && treeElement.parent?.children.size === 1;
            this.changedParents.add(affectsRootElement ? null : treeElement.parent);
            if (treeElement.depth === 0 || (0, testingViewState_1.isCollapsedInSerializedTestTree)(this.lastState, treeElement.test.item.extId) === false) {
                this.expandElement(treeElement, 0);
            }
            const prevState = this.results.getStateById(treeElement.test.item.extId)?.[1];
            if (prevState) {
                treeElement.retired = !!prevState.retired;
                treeElement.ownState = prevState.computedState;
                treeElement.ownDuration = prevState.ownDuration;
                (0, getComputedState_1.refreshComputedState)(computedStateAccessor, treeElement, undefined, !!treeElement.ownDuration).forEach(i => i.fireChange());
            }
        }
    };
    exports.TreeProjection = TreeProjection;
    exports.TreeProjection = TreeProjection = __decorate([
        __param(1, testService_1.ITestService),
        __param(2, testResultService_1.ITestResultService)
    ], TreeProjection);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZVByb2plY3Rpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXN0aW5nL2Jyb3dzZXIvZXhwbG9yZXJQcm9qZWN0aW9ucy90cmVlUHJvamVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnQmhHLE1BQU0scUJBQXFCLEdBQTJEO1FBQ3JGLFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsWUFBWSwyQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLDhCQUFzQjtRQUN2Rix1QkFBdUIsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLO1FBQ3JDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDO1FBRXZDLDBCQUEwQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVE7UUFDM0MsY0FBYyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLDJCQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBQ2pGLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDO1FBRTdDLFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLG1CQUFRLENBQUMsTUFBTSxDQUNoQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxFQUNuQixDQUFDLENBQUMsRUFBNEIsRUFBRSxDQUFDLENBQUMsWUFBWSxtQkFBbUIsQ0FDakU7UUFDRCxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ1osS0FBSyxJQUFJLE1B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