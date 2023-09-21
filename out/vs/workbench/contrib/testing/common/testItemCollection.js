/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/assert", "vs/workbench/contrib/testing/common/testTypes", "vs/workbench/contrib/testing/common/testId"], function (require, exports, async_1, event_1, lifecycle_1, assert_1, testTypes_1, testId_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createTestItemChildren = exports.MixedTestItemController = exports.InvalidTestItemError = exports.DuplicateTestItemError = exports.TestItemCollection = exports.TestItemEventOp = void 0;
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
    class TestItemCollection extends lifecycle_1.Disposable {
        get root() {
            return this.options.root;
        }
        constructor(options) {
            super();
            this.options = options;
            this.debounceSendDiff = this._register(new async_1.RunOnceScheduler(() => this.flushDiff(), 200));
            this.diffOpEmitter = this._register(new event_1.Emitter());
            this.tree = new Map();
            this.tags = new Map();
            this.diff = [];
            /**
             * Fires when an operation happens that should result in a diff.
             */
            this.onDidGenerateDiff = this.diffOpEmitter.event;
            this.root.canResolveChildren = true;
            this.upsertItem(this.root, undefined);
        }
        /**
         * Handler used for expanding test items.
         */
        set resolveHandler(handler) {
            this._resolveHandler = handler;
            for (const test of this.tree.values()) {
                this.updateExpandability(test);
            }
        }
        get resolveHandler() {
            return this._resolveHandler;
        }
        /**
         * Gets a diff of all changes that have been made, and clears the diff queue.
         */
        collectDiff() {
            const diff = this.diff;
            this.diff = [];
            return diff;
        }
        /**
         * Pushes a new diff entry onto the collected diff list.
         */
        pushDiff(diff) {
            switch (diff.op) {
                case 2 /* TestDiffOpType.DocumentSynced */: {
                    for (const existing of this.diff) {
                        if (existing.op === 2 /* TestDiffOpType.DocumentSynced */ && existing.uri === diff.uri) {
                            existing.docv = diff.docv;
                            return;
                        }
                    }
                    break;
                }
                case 1 /* TestDiffOpType.Update */: {
                    // Try to merge updates, since they're invoked per-property
                    const last = this.diff[this.diff.length - 1];
                    if (last) {
                        if (last.op === 1 /* TestDiffOpType.Update */ && last.item.extId === diff.item.extId) {
                            (0, testTypes_1.applyTestItemUpdate)(last.item, diff.item);
                            return;
                        }
                        if (last.op === 0 /* TestDiffOpType.Add */ && last.item.item.extId === diff.item.extId) {
                            (0, testTypes_1.applyTestItemUpdate)(last.item, diff.item);
                            return;
                        }
                    }
                    break;
                }
            }
            this.diff.push(diff);
            if (!this.debounceSendDiff.isScheduled()) {
                this.debounceSendDiff.schedule();
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
                const r = this.resolveChildren(internal);
                return !r.isOpen()
                    ? r.wait().then(() => this.expandChildren(internal, levels - 1))
                    : this.expandChildren(internal, levels - 1);
            }
            else if (internal.expand === 3 /* TestItemExpandState.Expanded */) {
                return internal.resolveBarrier?.isOpen() === false
                    ? internal.resolveBarrier.wait().then(() => this.expandChildren(internal, levels - 1))
                    : this.expandChildren(internal, levels - 1);
            }
        }
        dispose() {
            for (const item of this.tree.values()) {
                this.options.getApiFor(item.actual).listener = undefined;
            }
            this.tree.clear();
            this.diff = [];
            super.dispose();
        }
        onTestItemEvent(internal, evt) {
            switch (evt.op) {
                case 3 /* TestItemEventOp.RemoveChild */:
                    this.removeItem(testId_1.TestId.joinToString(internal.fullId, evt.id));
                    break;
                case 0 /* TestItemEventOp.Upsert */:
                    this.upsertItem(evt.item, internal);
                    break;
                case 5 /* TestItemEventOp.Bulk */:
                    for (const op of evt.ops) {
                        this.onTestItemEvent(internal, op);
                    }
                    break;
                case 1 /* TestItemEventOp.SetTags */:
                    this.diffTagRefs(evt.new, evt.old, internal.fullId.toString());
                    break;
                case 2 /* TestItemEventOp.UpdateCanResolveChildren */:
                    this.updateExpandability(internal);
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
                    this.documentSynced(internal.actual.uri);
                    break;
                default:
                    (0, assert_1.assertNever)(evt);
            }
        }
        documentSynced(uri) {
            if (uri) {
                this.pushDiff({
                    op: 2 /* TestDiffOpType.DocumentSynced */,
                    uri,
                    docv: this.options.getDocumentVersion(uri)
                });
            }
        }
        upsertItem(actual, parent) {
            const fullId = testId_1.TestId.fromExtHostTestItem(actual, this.root.id, parent?.actual);
            // If this test item exists elsewhere in the tree already (exists at an
            // old ID with an existing parent), remove that old item.
            const privateApi = this.options.getApiFor(actual);
            if (privateApi.parent && privateApi.parent !== parent?.actual) {
                this.options.getChildren(privateApi.parent).delete(actual.id);
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
                actual.tags.forEach(this.incrementTagRefs, this);
                this.tree.set(internal.fullId.toString(), internal);
                this.setItemParent(actual, parent);
                this.pushDiff({
                    op: 0 /* TestDiffOpType.Add */,
                    item: {
                        controllerId: this.options.controllerId,
                        expand: internal.expand,
                        item: this.options.toITestItem(actual),
                    },
                });
                this.connectItemAndChildren(actual, internal, parent);
                return;
            }
            // Case 2: re-insertion of an existing item, no-op
            if (internal.actual === actual) {
                this.connectItem(actual, internal, parent); // re-connect in case the parent changed
                return; // no-op
            }
            // Case 3: upsert of an existing item by ID, with a new instance
            if (internal.actual.uri?.toString() !== actual.uri?.toString()) {
                // If the item has a new URI, re-insert it; we don't support updating
                // URIs on existing test items.
                this.removeItem(fullId.toString());
                return this.upsertItem(actual, parent);
            }
            const oldChildren = this.options.getChildren(internal.actual);
            const oldActual = internal.actual;
            const update = diffTestItems(this.options.toITestItem(oldActual), this.options.toITestItem(actual));
            this.options.getApiFor(oldActual).listener = undefined;
            internal.actual = actual;
            internal.expand = 0 /* TestItemExpandState.NotExpandable */; // updated by `connectItemAndChildren`
            if (update) {
                // tags are handled in a special way
                if (update.hasOwnProperty('tags')) {
                    this.diffTagRefs(actual.tags, oldActual.tags, fullId.toString());
                    delete update.tags;
                }
                this.onTestItemEvent(internal, { op: 4 /* TestItemEventOp.SetProp */, update });
            }
            this.connectItemAndChildren(actual, internal, parent);
            // Remove any orphaned children.
            for (const [_, child] of oldChildren) {
                if (!this.options.getChildren(actual).get(child.id)) {
                    this.removeItem(testId_1.TestId.joinToString(fullId, child.id));
                }
            }
            // Mark ranges in the document as synced (#161320)
            this.documentSynced(internal.actual.uri);
        }
        diffTagRefs(newTags, oldTags, extId) {
            const toDelete = new Set(oldTags.map(t => t.id));
            for (const tag of newTags) {
                if (!toDelete.delete(tag.id)) {
                    this.incrementTagRefs(tag);
                }
            }
            this.pushDiff({
                op: 1 /* TestDiffOpType.Update */,
                item: { extId, item: { tags: newTags.map(v => (0, testTypes_1.namespaceTestTag)(this.options.controllerId, v.id)) } }
            });
            toDelete.forEach(this.decrementTagRefs, this);
        }
        incrementTagRefs(tag) {
            const existing = this.tags.get(tag.id);
            if (existing) {
                existing.refCount++;
            }
            else {
                this.tags.set(tag.id, { refCount: 1 });
                this.pushDiff({
                    op: 6 /* TestDiffOpType.AddTag */, tag: {
                        id: (0, testTypes_1.namespaceTestTag)(this.options.controllerId, tag.id),
                    }
                });
            }
        }
        decrementTagRefs(tagId) {
            const existing = this.tags.get(tagId);
            if (existing && !--existing.refCount) {
                this.tags.delete(tagId);
                this.pushDiff({ op: 7 /* TestDiffOpType.RemoveTag */, id: (0, testTypes_1.namespaceTestTag)(this.options.controllerId, tagId) });
            }
        }
        setItemParent(actual, parent) {
            this.options.getApiFor(actual).parent = parent && parent.actual !== this.root ? parent.actual : undefined;
        }
        connectItem(actual, internal, parent) {
            this.setItemParent(actual, parent);
            const api = this.options.getApiFor(actual);
            api.parent = parent?.actual;
            api.listener = evt => this.onTestItemEvent(internal, evt);
            this.updateExpandability(internal);
        }
        connectItemAndChildren(actual, internal, parent) {
            this.connectItem(actual, internal, parent);
            // Discover any existing children that might have already been added
            for (const [_, child] of this.options.getChildren(actual)) {
                this.upsertItem(child, internal);
            }
        }
        /**
         * Updates the `expand` state of the item. Should be called whenever the
         * resolved state of the item changes. Can automatically expand the item
         * if requested by a consumer.
         */
        updateExpandability(internal) {
            let newState;
            if (!this._resolveHandler) {
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
                this.resolveChildren(internal);
            }
        }
        /**
         * Expands all children of the item, "levels" deep. If levels is 0, only
         * the children will be expanded. If it's 1, the children and their children
         * will be expanded. If it's <0, it's a no-op.
         */
        expandChildren(internal, levels) {
            if (levels < 0) {
                return;
            }
            const expandRequests = [];
            for (const [_, child] of this.options.getChildren(internal.actual)) {
                const promise = this.expand(testId_1.TestId.joinToString(internal.fullId, child.id), levels);
                if ((0, async_1.isThenable)(promise)) {
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
        resolveChildren(internal) {
            if (internal.resolveBarrier) {
                return internal.resolveBarrier;
            }
            if (!this._resolveHandler) {
                const b = new async_1.Barrier();
                b.open();
                return b;
            }
            internal.expand = 2 /* TestItemExpandState.BusyExpanding */;
            this.pushExpandStateUpdate(internal);
            const barrier = internal.resolveBarrier = new async_1.Barrier();
            const applyError = (err) => {
                console.error(`Unhandled error in resolveHandler of test controller "${this.options.controllerId}"`, err);
            };
            let r;
            try {
                r = this._resolveHandler(internal.actual === this.root ? undefined : internal.actual);
            }
            catch (err) {
                applyError(err);
            }
            if ((0, async_1.isThenable)(r)) {
                r.catch(applyError).then(() => {
                    barrier.open();
                    this.updateExpandability(internal);
                });
            }
            else {
                barrier.open();
                this.updateExpandability(internal);
            }
            return internal.resolveBarrier;
        }
        pushExpandStateUpdate(internal) {
            this.pushDiff({ op: 1 /* TestDiffOpType.Update */, item: { extId: internal.fullId.toString(), expand: internal.expand } });
        }
        removeItem(childId) {
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
                this.options.getApiFor(item.actual).listener = undefined;
                for (const tag of item.actual.tags) {
                    this.decrementTagRefs(tag.id);
                }
                this.tree.delete(item.fullId.toString());
                for (const [_, child] of this.options.getChildren(item.actual)) {
                    queue.push(this.tree.get(testId_1.TestId.joinToString(item.fullId, child.id)));
                }
            }
        }
        /**
         * Immediately emits any pending diffs on the collection.
         */
        flushDiff() {
            const diff = this.collectDiff();
            if (diff.length) {
                this.diffOpEmitter.fire(diff);
            }
        }
    }
    exports.TestItemCollection = TestItemCollection;
    class DuplicateTestItemError extends Error {
        constructor(id) {
            super(`Attempted to insert a duplicate test item ID ${id}`);
        }
    }
    exports.DuplicateTestItemError = DuplicateTestItemError;
    class InvalidTestItemError extends Error {
        constructor(id) {
            super(`TestItem with ID "${id}" is invalid. Make sure to create it from the createTestItem method.`);
        }
    }
    exports.InvalidTestItemError = InvalidTestItemError;
    class MixedTestItemController extends Error {
        constructor(id, ctrlA, ctrlB) {
            super(`TestItem with ID "${id}" is from controller "${ctrlA}" and cannot be added as a child of an item from controller "${ctrlB}".`);
        }
    }
    exports.MixedTestItemController = MixedTestItemController;
    const createTestItemChildren = (api, getApi, checkCtor) => {
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
                        throw new InvalidTestItemError(item.id);
                    }
                    const itemController = getApi(item).controllerId;
                    if (itemController !== api.controllerId) {
                        throw new MixedTestItemController(item.id, itemController, api.controllerId);
                    }
                    if (newMapped.has(item.id)) {
                        throw new DuplicateTestItemError(item.id);
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
                    throw new InvalidTestItemError(item.id);
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
    exports.createTestItemChildren = createTestItemChildren;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdEl0ZW1Db2xsZWN0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVzdGluZy9jb21tb24vdGVzdEl0ZW1Db2xsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXdCaEcsSUFBa0IsZUFRakI7SUFSRCxXQUFrQixlQUFlO1FBQ2hDLHlEQUFNLENBQUE7UUFDTiwyREFBTyxDQUFBO1FBQ1AsNkZBQXdCLENBQUE7UUFDeEIsbUVBQVcsQ0FBQTtRQUNYLDJEQUFPLENBQUE7UUFDUCxxREFBSSxDQUFBO1FBQ0oseUVBQWMsQ0FBQTtJQUNmLENBQUMsRUFSaUIsZUFBZSwrQkFBZixlQUFlLFFBUWhDO0lBdUVELE1BQU0scUJBQXFCLEdBQUcsQ0FBSSxDQUFJLEVBQUUsQ0FBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3pELE1BQU0sYUFBYSxHQUErRTtRQUNqRyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDZixJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxJQUFJLENBQUM7YUFBRTtZQUM3QixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO2dCQUFFLE9BQU8sS0FBSyxDQUFDO2FBQUU7WUFDL0IsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFDRCxJQUFJLEVBQUUscUJBQXFCO1FBQzNCLEtBQUssRUFBRSxxQkFBcUI7UUFDNUIsV0FBVyxFQUFFLHFCQUFxQjtRQUNsQyxLQUFLLEVBQUUscUJBQXFCO1FBQzVCLFFBQVEsRUFBRSxxQkFBcUI7UUFDL0IsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2QsSUFBSSxDQUFDLENBQUMsTUFB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