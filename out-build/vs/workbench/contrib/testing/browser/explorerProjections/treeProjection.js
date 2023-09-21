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
    exports.$yKb = void 0;
    const computedStateAccessor = {
        getOwnState: i => i instanceof index_1.$rKb ? i.ownState : 0 /* TestResultState.Unset */,
        getCurrentComputedState: i => i.state,
        setComputedState: (i, s) => i.state = s,
        getCurrentComputedDuration: i => i.duration,
        getOwnDuration: i => i instanceof index_1.$rKb ? i.ownDuration : undefined,
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
    class TreeTestItemElement extends index_1.$rKb {
        get description() {
            return this.test.item.description;
        }
        constructor(test, parent, f) {
            super({ ...test, item: { ...test.item } }, parent);
            this.f = f;
            /**
             * Own, non-computed state.
             * @internal
             */
            this.ownState = 0 /* TestResultState.Unset */;
            this.g();
        }
        update(patch) {
            (0, testTypes_1.$VI)(this.test, patch);
            this.g(patch);
            this.fireChange();
        }
        fireChange() {
            this.e.fire();
        }
        g(patch) {
            if (this.c && (!this.test.item.error || patch?.item?.error)) {
                this.f(this);
                this.children.delete(this.c);
                this.c = undefined;
            }
            if (this.test.item.error && !this.c) {
                this.c = new index_1.$sKb(this.test.item.error, this);
                this.children.add(this.c);
                this.f(this);
            }
        }
    }
    /**
     * Projection that lists tests in their traditional tree view.
     */
    let $yKb = class $yKb extends lifecycle_1.$kc {
        /**
         * Gets root elements of the tree.
         */
        get m() {
            const rootsIt = iterator_1.Iterable.map(this.u.collection.rootItems, r => this.j.get(r.item.extId));
            return iterator_1.Iterable.filter(rootsIt, (r) => !!r?.children.size);
        }
        constructor(lastState, u, w) {
            super();
            this.lastState = lastState;
            this.u = u;
            this.w = w;
            this.f = new event_1.$fd();
            this.g = new Set();
            this.h = new Set();
            this.j = new Map();
            /**
             * @inheritdoc
             */
            this.onUpdate = this.f.event;
            this.B(u.onDidProcessDiff((diff) => this.y(diff)));
            // when test results are cleared, recalculate all state
            this.B(w.onResultsChanged((evt) => {
                if (!('removed' in evt)) {
                    return;
                }
                for (const inTree of [...this.j.values()].sort((a, b) => b.depth - a.depth)) {
                    const lookup = this.w.getStateById(inTree.test.item.extId)?.[1];
                    inTree.ownDuration = lookup?.ownDuration;
                    (0, getComputedState_1.$Xsb)(computedStateAccessor, inTree, lookup?.ownComputedState ?? 0 /* TestResultState.Unset */).forEach(i => i.fireChange());
                }
            }));
            // when test states change, reflect in the tree
            this.B(w.onTestChanged(ev => {
                if (ev.reason === 2 /* TestResultItemChangeReason.NewMessage */) {
                    return; // no effect in the tree
                }
                let result = ev.item;
                // if the state is unset, or the latest run is not making the change,
                // double check that it's valid. Retire calls might cause previous
                // emit a state change for a test run that's already long completed.
                if (result.ownComputedState === 0 /* TestResultState.Unset */ || ev.result !== w.results[0]) {
                    const fallback = w.getStateById(result.item.extId);
                    if (fallback) {
                        result = fallback[1];
                    }
                }
                const item = this.j.get(result.item.extId);
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
                (0, getComputedState_1.$Xsb)(computedStateAccessor, item, explicitComputed, refreshDuration).forEach(i => i.fireChange());
            }));
            for (const test of u.collection.all) {
                this.D(this.z(test));
            }
        }
        /**
         * @inheritdoc
         */
        getElementByTestId(testId) {
            return this.j.get(testId);
        }
        /**
         * @inheritdoc
         */
        y(diff) {
            for (const op of diff) {
                switch (op.op) {
                    case 0 /* TestDiffOpType.Add */: {
                        const item = this.z(op.item);
                        this.D(item);
                        break;
                    }
                    case 1 /* TestDiffOpType.Update */: {
                        const patch = op.item;
                        const existing = this.j.get(patch.extId);
                        if (!existing) {
                            break;
                        }
                        // parent needs to be re-rendered on an expand update, so that its
                        // children are rewritten.
                        const needsParentUpdate = existing.test.expand === 0 /* TestItemExpandState.NotExpandable */ && patch.expand;
                        existing.update(patch);
                        if (needsParentUpdate) {
                            this.g.add(existing.parent);
                        }
                        else {
                            this.h.add(existing.parent);
                        }
                        break;
                    }
                    case 3 /* TestDiffOpType.Remove */: {
                        const toRemove = this.j.get(op.itemId);
                        if (!toRemove) {
                            break;
                        }
                        // The first element will cause the root to be hidden
                        const affectsRootElement = toRemove.depth === 1 && toRemove.parent?.children.size === 1;
                        this.g.add(affectsRootElement ? null : toRemove.parent);
                        const queue = [[toRemove]];
                        while (queue.length) {
                            for (const item of queue.pop()) {
                                if (item instanceof TreeTestItemElement) {
                                    queue.push(this.C(item));
                                }
                            }
                        }
                    }
                }
            }
            if (diff.length !== 0) {
                this.f.fire();
            }
        }
        /**
         * @inheritdoc
         */
        applyTo(tree) {
            for (const s of [this.g, this.h]) {
                for (const element of s) {
                    if (element && !tree.hasElement(element)) {
                        s.delete(element);
                    }
                }
            }
            for (const parent of this.g) {
                tree.setChildren(parent, (0, index_1.$uKb)(this.lastState, this.m, parent), { diffIdentityProvider: index_1.$tKb });
            }
            for (const parent of this.h) {
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
            this.u.collection.expand(element.test.item.extId, depth);
        }
        z(item) {
            const parentId = testId_1.$PI.parentId(item.item.extId);
            const parent = parentId ? this.j.get(parentId) : null;
            return new TreeTestItemElement(item, parent, n => this.g.add(n));
        }
        C(treeElement) {
            const parent = treeElement.parent;
            parent?.children.delete(treeElement);
            this.j.delete(treeElement.test.item.extId);
            if (parent instanceof TreeTestItemElement) {
                (0, getComputedState_1.$Xsb)(computedStateAccessor, parent, undefined, !!treeElement.duration).forEach(i => i.fireChange());
            }
            return treeElement.children;
        }
        D(treeElement) {
            treeElement.parent?.children.add(treeElement);
            this.j.set(treeElement.test.item.extId, treeElement);
            // The first element will cause the root to be shown
            const affectsRootElement = treeElement.depth === 1 && treeElement.parent?.children.size === 1;
            this.g.add(affectsRootElement ? null : treeElement.parent);
            if (treeElement.depth === 0 || (0, testingViewState_1.$qKb)(this.lastState, treeElement.test.item.extId) === false) {
                this.expandElement(treeElement, 0);
            }
            const prevState = this.w.getStateById(treeElement.test.item.extId)?.[1];
            if (prevState) {
                treeElement.retired = !!prevState.retired;
                treeElement.ownState = prevState.computedState;
                treeElement.ownDuration = prevState.ownDuration;
                (0, getComputedState_1.$Xsb)(computedStateAccessor, treeElement, undefined, !!treeElement.ownDuration).forEach(i => i.fireChange());
            }
        }
    };
    exports.$yKb = $yKb;
    exports.$yKb = $yKb = __decorate([
        __param(1, testService_1.$4sb),
        __param(2, testResultService_1.$ftb)
    ], $yKb);
});
//# sourceMappingURL=treeProjection.js.map