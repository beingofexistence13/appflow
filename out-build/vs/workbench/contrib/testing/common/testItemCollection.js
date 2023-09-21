/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/assert", "vs/workbench/contrib/testing/common/testTypes", "vs/workbench/contrib/testing/common/testId"], function (require, exports, async_1, event_1, lifecycle_1, assert_1, testTypes_1, testId_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$VL = exports.$UL = exports.$TL = exports.$SL = exports.$RL = exports.TestItemEventOp = void 0;
    var TestItemEventOp;
    (function (TestItemEventOp) {
        TestItemEventOp[TestItemEventOp["Upsert"] = 0] = "Upsert";
        TestItemEventOp[TestItemEventOp["SetTags"] = 1] = "SetTags";
        TestItemEventOp[TestItemEventOp["UpdateCanResolveChildren"] = 2] = "UpdateCanResolveChildren";
        TestItemEventOp[TestItemEventOp["RemoveChild"] = 3] = "RemoveChild";
        TestItemEventOp[TestItemEventOp["SetProp"] = 4] = "SetProp";
        TestItemEventOp[TestItemEventOp["Bulk"] = 5] = "Bulk";
        TestItemEventOp[TestItemEventOp["DocumentSynced"] = 6] = "DocumentSynced";
    })(TestItemEventOp || (exports.TestItemEventOp = TestItemEventOp = {}));
    const strictEqualComparator = (a, b) => a === b;
    const diffableProps = {
        range: (a, b) => {
            if (a === b) {
                return true;
            }
            if (!a || !b) {
                return false;
            }
            return a.equalsRange(b);
        },
        busy: strictEqualComparator,
        label: strictEqualComparator,
        description: strictEqualComparator,
        error: strictEqualComparator,
        sortText: strictEqualComparator,
        tags: (a, b) => {
            if (a.length !== b.length) {
                return false;
            }
            if (a.some(t1 => !b.includes(t1))) {
                return false;
            }
            return true;
        },
    };
    const diffableEntries = Object.entries(diffableProps);
    const diffTestItems = (a, b) => {
        let output;
        for (const [key, cmp] of diffableEntries) {
            if (!cmp(a[key], b[key])) {
                if (output) {
                    output[key] = b[key];
                }
                else {
                    output = { [key]: b[key] };
                }
            }
        }
        return output;
    };
    /**
     * Maintains a collection of test items for a single controller.
     */
    class $RL extends lifecycle_1.$kc {
        get root() {
            return this.s.root;
        }
        constructor(s) {
            super();
            this.s = s;
            this.f = this.B(new async_1.$Sg(() => this.flushDiff(), 200));
            this.g = this.B(new event_1.$fd());
            this.tree = new Map();
            this.j = new Map();
            this.m = [];
            /**
             * Fires when an operation happens that should result in a diff.
             */
            this.onDidGenerateDiff = this.g.event;
            this.root.canResolveChildren = true;
            this.y(this.root, undefined);
        }
        /**
         * Handler used for expanding test items.
         */
        set resolveHandler(handler) {
            this.h = handler;
            for (const test of this.tree.values()) {
                this.I(test);
            }
        }
        get resolveHandler() {
            return this.h;
        }
        /**
         * Gets a diff of all changes that have been made, and clears the diff queue.
         */
        collectDiff() {
            const diff = this.m;
            this.m = [];
            return diff;
        }
        /**
         * Pushes a new diff entry onto the collected diff list.
         */
        pushDiff(diff) {
            switch (diff.op) {
                case 2 /* TestDiffOpType.DocumentSynced */: {
                    for (const existing of this.m) {
                        if (existing.op === 2 /* TestDiffOpType.DocumentSynced */ && existing.uri === diff.uri) {
                            existing.docv = diff.docv;
                            return;
                        }
                    }
                    break;
                }
                case 1 /* TestDiffOpType.Update */: {
                    // Try to merge updates, since they're invoked per-property
                    const last = this.m[this.m.length - 1];
                    if (last) {
                        if (last.op === 1 /* TestDiffOpType.Update */ && last.item.extId === diff.item.extId) {
                            (0, testTypes_1.$VI)(last.item, diff.item);
                            return;
                        }
                        if (last.op === 0 /* TestDiffOpType.Add */ && last.item.item.extId === diff.item.extId) {
                            (0, testTypes_1.$VI)(last.item, diff.item);
                            return;
                        }
                    }
                    break;
                }
            }
            this.m.push(diff);
            if (!this.f.isScheduled()) {
                this.f.schedule();
            }
        }
        /**
         * Expands the test and the given number of `levels` of children. If levels
         * is < 0, then all children will be expanded. If it's 0, then only this
         * item will be expanded.
         */
        expand(testId, levels) {
            const internal = this.tree.get(testId);
            if (!internal) {
                return;
            }
            if (internal.expandLevels === undefined || levels > internal.expandLevels) {
                internal.expandLevels = levels;
            }
            // try to avoid awaiting things if the provider returns synchronously in
            // order to keep everything in a single diff and DOM update.
            if (internal.expand === 1 /* TestItemExpandState.Expandable */) {
                const r = this.L(internal);
                return !r.isOpen()
                    ? r.wait().then(() => this.J(internal, levels - 1))
                    : this.J(internal, levels - 1);
            }
            else if (internal.expand === 3 /* TestItemExpandState.Expanded */) {
                return internal.resolveBarrier?.isOpen() === false
                    ? internal.resolveBarrier.wait().then(() => this.J(internal, levels - 1))
                    : this.J(internal, levels - 1);
            }
        }
        dispose() {
            for (const item of this.tree.values()) {
                this.s.getApiFor(item.actual).listener = undefined;
            }
            this.tree.clear();
            this.m = [];
            super.dispose();
        }
        u(internal, evt) {
            switch (evt.op) {
                case 3 /* TestItemEventOp.RemoveChild */:
                    this.N(testId_1.$PI.joinToString(internal.fullId, evt.id));
                    break;
                case 0 /* TestItemEventOp.Upsert */:
                    this.y(evt.item, internal);
                    break;
                case 5 /* TestItemEventOp.Bulk */:
                    for (const op of evt.ops) {
                        this.u(internal, op);
                    }
                    break;
                case 1 /* TestItemEventOp.SetTags */:
                    this.z(evt.new, evt.old, internal.fullId.toString());
                    break;
                case 2 /* TestItemEventOp.UpdateCanResolveChildren */:
                    this.I(internal);
                    break;
                case 4 /* TestItemEventOp.SetProp */:
                    this.pushDiff({
                        op: 1 /* TestDiffOpType.Update */,
                        item: {
                            extId: internal.fullId.toString(),
                            item: evt.update,
                        }
                    });
                    break;
                case 6 /* TestItemEventOp.DocumentSynced */:
                    this.w(internal.actual.uri);
                    break;
                default:
                    (0, assert_1.$vc)(evt);
            }
        }
        w(uri) {
            if (uri) {
                this.pushDiff({
                    op: 2 /* TestDiffOpType.DocumentSynced */,
                    uri,
                    docv: this.s.getDocumentVersion(uri)
                });
            }
        }
        y(actual, parent) {
            const fullId = testId_1.$PI.fromExtHostTestItem(actual, this.root.id, parent?.actual);
            // If this test item exists elsewhere in the tree already (exists at an
            // old ID with an existing parent), remove that old item.
            const privateApi = this.s.getApiFor(actual);
            if (privateApi.parent && privateApi.parent !== parent?.actual) {
                this.s.getChildren(privateApi.parent).delete(actual.id);
            }
            let internal = this.tree.get(fullId.toString());
            // Case 1: a brand new item
            if (!internal) {
                internal = {
                    fullId,
                    actual,
                    expandLevels: parent?.expandLevels /* intentionally undefined or 0 */ ? parent.expandLevels - 1 : undefined,
                    expand: 0 /* TestItemExpandState.NotExpandable */, // updated by `connectItemAndChildren`
                };
                actual.tags.forEach(this.C, this);
                this.tree.set(internal.fullId.toString(), internal);
                this.F(actual, parent);
                this.pushDiff({
                    op: 0 /* TestDiffOpType.Add */,
                    item: {
                        controllerId: this.s.controllerId,
                        expand: internal.expand,
                        item: this.s.toITestItem(actual),
                    },
                });
                this.H(actual, internal, parent);
                return;
            }
            // Case 2: re-insertion of an existing item, no-op
            if (internal.actual === actual) {
                this.G(actual, internal, parent); // re-connect in case the parent changed
                return; // no-op
            }
            // Case 3: upsert of an existing item by ID, with a new instance
            if (internal.actual.uri?.toString() !== actual.uri?.toString()) {
                // If the item has a new URI, re-insert it; we don't support updating
                // URIs on existing test items.
                this.N(fullId.toString());
                return this.y(actual, parent);
            }
            const oldChildren = this.s.getChildren(internal.actual);
            const oldActual = internal.actual;
            const update = diffTestItems(this.s.toITestItem(oldActual), this.s.toITestItem(actual));
            this.s.getApiFor(oldActual).listener = undefined;
            internal.actual = actual;
            internal.expand = 0 /* TestItemExpandState.NotExpandable */; // updated by `connectItemAndChildren`
            if (update) {
                // tags are handled in a special way
                if (update.hasOwnProperty('tags')) {
                    this.z(actual.tags, oldActual.tags, fullId.toString());
                    delete update.tags;
                }
                this.u(internal, { op: 4 /* TestItemEventOp.SetProp */, update });
            }
            this.H(actual, internal, parent);
            // Remove any orphaned children.
            for (const [_, child] of oldChildren) {
                if (!this.s.getChildren(actual).get(child.id)) {
                    this.N(testId_1.$PI.joinToString(fullId, child.id));
                }
            }
            // Mark ranges in the document as synced (#161320)
            this.w(internal.actual.uri);
        }
        z(newTags, oldTags, extId) {
            const toDelete = new Set(oldTags.map(t => t.id));
            for (const tag of newTags) {
                if (!toDelete.delete(tag.id)) {
                    this.C(tag);
                }
            }
            this.pushDiff({
                op: 1 /* TestDiffOpType.Update */,
                item: { extId, item: { tags: newTags.map(v => (0, testTypes_1.$TI)(this.s.controllerId, v.id)) } }
            });
            toDelete.forEach(this.D, this);
        }
        C(tag) {
            const existing = this.j.get(tag.id);
            if (existing) {
                existing.refCount++;
            }
            else {
                this.j.set(tag.id, { refCount: 1 });
                this.pushDiff({
                    op: 6 /* TestDiffOpType.AddTag */, tag: {
                        id: (0, testTypes_1.$TI)(this.s.controllerId, tag.id),
                    }
                });
            }
        }
        D(tagId) {
            const existing = this.j.get(tagId);
            if (existing && !--existing.refCount) {
                this.j.delete(tagId);
                this.pushDiff({ op: 7 /* TestDiffOpType.RemoveTag */, id: (0, testTypes_1.$TI)(this.s.controllerId, tagId) });
            }
        }
        F(actual, parent) {
            this.s.getApiFor(actual).parent = parent && parent.actual !== this.root ? parent.actual : undefined;
        }
        G(actual, internal, parent) {
            this.F(actual, parent);
            const api = this.s.getApiFor(actual);
            api.parent = parent?.actual;
            api.listener = evt => this.u(internal, evt);
            this.I(internal);
        }
        H(actual, internal, parent) {
            this.G(actual, internal, parent);
            // Discover any existing children that might have already been added
            for (const [_, child] of this.s.getChildren(actual)) {
                this.y(child, internal);
            }
        }
        /**
         * Updates the `expand` state of the item. Should be called whenever the
         * resolved state of the item changes. Can automatically expand the item
         * if requested by a consumer.
         */
        I(internal) {
            let newState;
            if (!this.h) {
                newState = 0 /* TestItemExpandState.NotExpandable */;
            }
            else if (internal.resolveBarrier) {
                newState = internal.resolveBarrier.isOpen()
                    ? 3 /* TestItemExpandState.Expanded */
                    : 2 /* TestItemExpandState.BusyExpanding */;
            }
            else {
                newState = internal.actual.canResolveChildren
                    ? 1 /* TestItemExpandState.Expandable */
                    : 0 /* TestItemExpandState.NotExpandable */;
            }
            if (newState === internal.expand) {
                return;
            }
            internal.expand = newState;
            this.pushDiff({ op: 1 /* TestDiffOpType.Update */, item: { extId: internal.fullId.toString(), expand: newState } });
            if (newState === 1 /* TestItemExpandState.Expandable */ && internal.expandLevels !== undefined) {
                this.L(internal);
            }
        }
        /**
         * Expands all children of the item, "levels" deep. If levels is 0, only
         * the children will be expanded. If it's 1, the children and their children
         * will be expanded. If it's <0, it's a no-op.
         */
        J(internal, levels) {
            if (levels < 0) {
                return;
            }
            const expandRequests = [];
            for (const [_, child] of this.s.getChildren(internal.actual)) {
                const promise = this.expand(testId_1.$PI.joinToString(internal.fullId, child.id), levels);
                if ((0, async_1.$tg)(promise)) {
                    expandRequests.push(promise);
                }
            }
            if (expandRequests.length) {
                return Promise.all(expandRequests).then(() => { });
            }
        }
        /**
         * Calls `discoverChildren` on the item, refreshing all its tests.
         */
        L(internal) {
            if (internal.resolveBarrier) {
                return internal.resolveBarrier;
            }
            if (!this.h) {
                const b = new async_1.$Fg();
                b.open();
                return b;
            }
            internal.expand = 2 /* TestItemExpandState.BusyExpanding */;
            this.M(internal);
            const barrier = internal.resolveBarrier = new async_1.$Fg();
            const applyError = (err) => {
                console.error(`Unhandled error in resolveHandler of test controller "${this.s.controllerId}"`, err);
            };
            let r;
            try {
                r = this.h(internal.actual === this.root ? undefined : internal.actual);
            }
            catch (err) {
                applyError(err);
            }
            if ((0, async_1.$tg)(r)) {
                r.catch(applyError).then(() => {
                    barrier.open();
                    this.I(internal);
                });
            }
            else {
                barrier.open();
                this.I(internal);
            }
            return internal.resolveBarrier;
        }
        M(internal) {
            this.pushDiff({ op: 1 /* TestDiffOpType.Update */, item: { extId: internal.fullId.toString(), expand: internal.expand } });
        }
        N(childId) {
            const childItem = this.tree.get(childId);
            if (!childItem) {
                throw new Error('attempting to remove non-existent child');
            }
            this.pushDiff({ op: 3 /* TestDiffOpType.Remove */, itemId: childId });
            const queue = [childItem];
            while (queue.length) {
                const item = queue.pop();
                if (!item) {
                    continue;
                }
                this.s.getApiFor(item.actual).listener = undefined;
                for (const tag of item.actual.tags) {
                    this.D(tag.id);
                }
                this.tree.delete(item.fullId.toString());
                for (const [_, child] of this.s.getChildren(item.actual)) {
                    queue.push(this.tree.get(testId_1.$PI.joinToString(item.fullId, child.id)));
                }
            }
        }
        /**
         * Immediately emits any pending diffs on the collection.
         */
        flushDiff() {
            const diff = this.collectDiff();
            if (diff.length) {
                this.g.fire(diff);
            }
        }
    }
    exports.$RL = $RL;
    class $SL extends Error {
        constructor(id) {
            super(`Attempted to insert a duplicate test item ID ${id}`);
        }
    }
    exports.$SL = $SL;
    class $TL extends Error {
        constructor(id) {
            super(`TestItem with ID "${id}" is invalid. Make sure to create it from the createTestItem method.`);
        }
    }
    exports.$TL = $TL;
    class $UL extends Error {
        constructor(id, ctrlA, ctrlB) {
            super(`TestItem with ID "${id}" is from controller "${ctrlA}" and cannot be added as a child of an item from controller "${ctrlB}".`);
        }
    }
    exports.$UL = $UL;
    const $VL = (api, getApi, checkCtor) => {
        let mapped = new Map();
        return {
            /** @inheritdoc */
            get size() {
                return mapped.size;
            },
            /** @inheritdoc */
            forEach(callback, thisArg) {
                for (const item of mapped.values()) {
                    callback.call(thisArg, item, this);
                }
            },
            /** @inheritdoc */
            [Symbol.iterator]() {
                return mapped.entries();
            },
            /** @inheritdoc */
            replace(items) {
                const newMapped = new Map();
                const toDelete = new Set(mapped.keys());
                const bulk = { op: 5 /* TestItemEventOp.Bulk */, ops: [] };
                for (const item of items) {
                    if (!(item instanceof checkCtor)) {
                        throw new $TL(item.id);
                    }
                    const itemController = getApi(item).controllerId;
                    if (itemController !== api.controllerId) {
                        throw new $UL(item.id, itemController, api.controllerId);
                    }
                    if (newMapped.has(item.id)) {
                        throw new $SL(item.id);
                    }
                    newMapped.set(item.id, item);
                    toDelete.delete(item.id);
                    bulk.ops.push({ op: 0 /* TestItemEventOp.Upsert */, item });
                }
                for (const id of toDelete.keys()) {
                    bulk.ops.push({ op: 3 /* TestItemEventOp.RemoveChild */, id });
                }
                api.listener?.(bulk);
                // important mutations come after firing, so if an error happens no
                // changes will be "saved":
                mapped = newMapped;
            },
            /** @inheritdoc */
            add(item) {
                if (!(item instanceof checkCtor)) {
                    throw new $TL(item.id);
                }
                mapped.set(item.id, item);
                api.listener?.({ op: 0 /* TestItemEventOp.Upsert */, item });
            },
            /** @inheritdoc */
            delete(id) {
                if (mapped.delete(id)) {
                    api.listener?.({ op: 3 /* TestItemEventOp.RemoveChild */, id });
                }
            },
            /** @inheritdoc */
            get(itemId) {
                return mapped.get(itemId);
            },
            /** JSON serialization function. */
            toJSON() {
                return Array.from(mapped.values());
            },
        };
    };
    exports.$VL = $VL;
});
//# sourceMappingURL=testItemCollection.js.map