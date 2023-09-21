/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/editor/common/core/range", "vs/workbench/contrib/testing/common/testId"], function (require, exports, uri_1, range_1, testId_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractIncrementalTestCollection = exports.TestsDiffOp = exports.TestDiffOpType = exports.DetailType = exports.TestResultItem = exports.applyTestItemUpdate = exports.ITestItemUpdate = exports.InternalTestItem = exports.TestItemExpandState = exports.ITestItem = exports.denamespaceTestTag = exports.namespaceTestTag = exports.ITestTaskState = exports.ITestMessage = exports.ITestOutputMessage = exports.getMarkId = exports.ITestErrorMessage = exports.TestMessageType = exports.IRichLocation = exports.isStartControllerTests = exports.testRunProfileBitsetList = exports.TestRunProfileBitset = exports.ExtTestRunProfileKind = exports.TestResultState = void 0;
    var TestResultState;
    (function (TestResultState) {
        TestResultState[TestResultState["Unset"] = 0] = "Unset";
        TestResultState[TestResultState["Queued"] = 1] = "Queued";
        TestResultState[TestResultState["Running"] = 2] = "Running";
        TestResultState[TestResultState["Passed"] = 3] = "Passed";
        TestResultState[TestResultState["Failed"] = 4] = "Failed";
        TestResultState[TestResultState["Skipped"] = 5] = "Skipped";
        TestResultState[TestResultState["Errored"] = 6] = "Errored";
    })(TestResultState || (exports.TestResultState = TestResultState = {}));
    /** note: keep in sync with TestRunProfileKind in vscode.d.ts */
    var ExtTestRunProfileKind;
    (function (ExtTestRunProfileKind) {
        ExtTestRunProfileKind[ExtTestRunProfileKind["Run"] = 1] = "Run";
        ExtTestRunProfileKind[ExtTestRunProfileKind["Debug"] = 2] = "Debug";
        ExtTestRunProfileKind[ExtTestRunProfileKind["Coverage"] = 3] = "Coverage";
    })(ExtTestRunProfileKind || (exports.ExtTestRunProfileKind = ExtTestRunProfileKind = {}));
    var TestRunProfileBitset;
    (function (TestRunProfileBitset) {
        TestRunProfileBitset[TestRunProfileBitset["Run"] = 2] = "Run";
        TestRunProfileBitset[TestRunProfileBitset["Debug"] = 4] = "Debug";
        TestRunProfileBitset[TestRunProfileBitset["Coverage"] = 8] = "Coverage";
        TestRunProfileBitset[TestRunProfileBitset["HasNonDefaultProfile"] = 16] = "HasNonDefaultProfile";
        TestRunProfileBitset[TestRunProfileBitset["HasConfigurable"] = 32] = "HasConfigurable";
        TestRunProfileBitset[TestRunProfileBitset["SupportsContinuousRun"] = 64] = "SupportsContinuousRun";
    })(TestRunProfileBitset || (exports.TestRunProfileBitset = TestRunProfileBitset = {}));
    /**
     * List of all test run profile bitset values.
     */
    exports.testRunProfileBitsetList = [
        2 /* TestRunProfileBitset.Run */,
        4 /* TestRunProfileBitset.Debug */,
        8 /* TestRunProfileBitset.Coverage */,
        16 /* TestRunProfileBitset.HasNonDefaultProfile */,
        32 /* TestRunProfileBitset.HasConfigurable */,
        64 /* TestRunProfileBitset.SupportsContinuousRun */,
    ];
    const isStartControllerTests = (t) => 'runId' in t;
    exports.isStartControllerTests = isStartControllerTests;
    var IRichLocation;
    (function (IRichLocation) {
        IRichLocation.serialize = (location) => ({
            range: location.range.toJSON(),
            uri: location.uri.toJSON(),
        });
        IRichLocation.deserialize = (location) => ({
            range: range_1.Range.lift(location.range),
            uri: uri_1.URI.revive(location.uri),
        });
    })(IRichLocation || (exports.IRichLocation = IRichLocation = {}));
    var TestMessageType;
    (function (TestMessageType) {
        TestMessageType[TestMessageType["Error"] = 0] = "Error";
        TestMessageType[TestMessageType["Output"] = 1] = "Output";
    })(TestMessageType || (exports.TestMessageType = TestMessageType = {}));
    var ITestErrorMessage;
    (function (ITestErrorMessage) {
        ITestErrorMessage.serialize = (message) => ({
            message: message.message,
            type: 0 /* TestMessageType.Error */,
            expected: message.expected,
            actual: message.actual,
            contextValue: message.contextValue,
            location: message.location && IRichLocation.serialize(message.location),
        });
        ITestErrorMessage.deserialize = (message) => ({
            message: message.message,
            type: 0 /* TestMessageType.Error */,
            expected: message.expected,
            actual: message.actual,
            contextValue: message.contextValue,
            location: message.location && IRichLocation.deserialize(message.location),
        });
    })(ITestErrorMessage || (exports.ITestErrorMessage = ITestErrorMessage = {}));
    /**
     * Gets the TTY marker ID for either starting or ending
     * an ITestOutputMessage.marker of the given ID.
     */
    const getMarkId = (marker, start) => `${start ? 's' : 'e'}${marker}`;
    exports.getMarkId = getMarkId;
    var ITestOutputMessage;
    (function (ITestOutputMessage) {
        ITestOutputMessage.serialize = (message) => ({
            message: message.message,
            type: 1 /* TestMessageType.Output */,
            offset: message.offset,
            length: message.length,
            location: message.location && IRichLocation.serialize(message.location),
        });
        ITestOutputMessage.deserialize = (message) => ({
            message: message.message,
            type: 1 /* TestMessageType.Output */,
            offset: message.offset,
            length: message.length,
            location: message.location && IRichLocation.deserialize(message.location),
        });
    })(ITestOutputMessage || (exports.ITestOutputMessage = ITestOutputMessage = {}));
    var ITestMessage;
    (function (ITestMessage) {
        ITestMessage.serialize = (message) => message.type === 0 /* TestMessageType.Error */ ? ITestErrorMessage.serialize(message) : ITestOutputMessage.serialize(message);
        ITestMessage.deserialize = (message) => message.type === 0 /* TestMessageType.Error */ ? ITestErrorMessage.deserialize(message) : ITestOutputMessage.deserialize(message);
    })(ITestMessage || (exports.ITestMessage = ITestMessage = {}));
    var ITestTaskState;
    (function (ITestTaskState) {
        ITestTaskState.serializeWithoutMessages = (state) => ({
            state: state.state,
            duration: state.duration,
            messages: [],
        });
        ITestTaskState.serialize = (state) => ({
            state: state.state,
            duration: state.duration,
            messages: state.messages.map(ITestMessage.serialize),
        });
        ITestTaskState.deserialize = (state) => ({
            state: state.state,
            duration: state.duration,
            messages: state.messages.map(ITestMessage.deserialize),
        });
    })(ITestTaskState || (exports.ITestTaskState = ITestTaskState = {}));
    const testTagDelimiter = '\0';
    const namespaceTestTag = (ctrlId, tagId) => ctrlId + testTagDelimiter + tagId;
    exports.namespaceTestTag = namespaceTestTag;
    const denamespaceTestTag = (namespaced) => {
        const index = namespaced.indexOf(testTagDelimiter);
        return { ctrlId: namespaced.slice(0, index), tagId: namespaced.slice(index + 1) };
    };
    exports.denamespaceTestTag = denamespaceTestTag;
    var ITestItem;
    (function (ITestItem) {
        ITestItem.serialize = (item) => ({
            extId: item.extId,
            label: item.label,
            tags: item.tags,
            busy: item.busy,
            children: undefined,
            uri: item.uri?.toJSON(),
            range: item.range?.toJSON() || null,
            description: item.description,
            error: item.error,
            sortText: item.sortText
        });
        ITestItem.deserialize = (serialized) => ({
            extId: serialized.extId,
            label: serialized.label,
            tags: serialized.tags,
            busy: serialized.busy,
            children: undefined,
            uri: serialized.uri ? uri_1.URI.revive(serialized.uri) : undefined,
            range: serialized.range ? range_1.Range.lift(serialized.range) : null,
            description: serialized.description,
            error: serialized.error,
            sortText: serialized.sortText
        });
    })(ITestItem || (exports.ITestItem = ITestItem = {}));
    var TestItemExpandState;
    (function (TestItemExpandState) {
        TestItemExpandState[TestItemExpandState["NotExpandable"] = 0] = "NotExpandable";
        TestItemExpandState[TestItemExpandState["Expandable"] = 1] = "Expandable";
        TestItemExpandState[TestItemExpandState["BusyExpanding"] = 2] = "BusyExpanding";
        TestItemExpandState[TestItemExpandState["Expanded"] = 3] = "Expanded";
    })(TestItemExpandState || (exports.TestItemExpandState = TestItemExpandState = {}));
    var InternalTestItem;
    (function (InternalTestItem) {
        InternalTestItem.serialize = (item) => ({
            expand: item.expand,
            item: ITestItem.serialize(item.item)
        });
        InternalTestItem.deserialize = (serialized) => ({
            // the `controllerId` is derived from the test.item.extId. It's redundant
            // in the non-serialized InternalTestItem too, but there just because it's
            // checked against in many hot paths.
            controllerId: testId_1.TestId.root(serialized.item.extId),
            expand: serialized.expand,
            item: ITestItem.deserialize(serialized.item)
        });
    })(InternalTestItem || (exports.InternalTestItem = InternalTestItem = {}));
    var ITestItemUpdate;
    (function (ITestItemUpdate) {
        ITestItemUpdate.serialize = (u) => {
            let item;
            if (u.item) {
                item = {};
                if (u.item.label !== undefined) {
                    item.label = u.item.label;
                }
                if (u.item.tags !== undefined) {
                    item.tags = u.item.tags;
                }
                if (u.item.busy !== undefined) {
                    item.busy = u.item.busy;
                }
                if (u.item.uri !== undefined) {
                    item.uri = u.item.uri?.toJSON();
                }
                if (u.item.range !== undefined) {
                    item.range = u.item.range?.toJSON();
                }
                if (u.item.description !== undefined) {
                    item.description = u.item.description;
                }
                if (u.item.error !== undefined) {
                    item.error = u.item.error;
                }
                if (u.item.sortText !== undefined) {
                    item.sortText = u.item.sortText;
                }
            }
            return { extId: u.extId, expand: u.expand, item };
        };
        ITestItemUpdate.deserialize = (u) => {
            let item;
            if (u.item) {
                item = {};
                if (u.item.label !== undefined) {
                    item.label = u.item.label;
                }
                if (u.item.tags !== undefined) {
                    item.tags = u.item.tags;
                }
                if (u.item.busy !== undefined) {
                    item.busy = u.item.busy;
                }
                if (u.item.range !== undefined) {
                    item.range = u.item.range ? range_1.Range.lift(u.item.range) : null;
                }
                if (u.item.description !== undefined) {
                    item.description = u.item.description;
                }
                if (u.item.error !== undefined) {
                    item.error = u.item.error;
                }
                if (u.item.sortText !== undefined) {
                    item.sortText = u.item.sortText;
                }
            }
            return { extId: u.extId, expand: u.expand, item };
        };
    })(ITestItemUpdate || (exports.ITestItemUpdate = ITestItemUpdate = {}));
    const applyTestItemUpdate = (internal, patch) => {
        if (patch.expand !== undefined) {
            internal.expand = patch.expand;
        }
        if (patch.item !== undefined) {
            internal.item = internal.item ? Object.assign(internal.item, patch.item) : patch.item;
        }
    };
    exports.applyTestItemUpdate = applyTestItemUpdate;
    var TestResultItem;
    (function (TestResultItem) {
        TestResultItem.serializeWithoutMessages = (original) => ({
            ...InternalTestItem.serialize(original),
            ownComputedState: original.ownComputedState,
            computedState: original.computedState,
            tasks: original.tasks.map(ITestTaskState.serializeWithoutMessages),
        });
        TestResultItem.serialize = (original) => ({
            ...InternalTestItem.serialize(original),
            ownComputedState: original.ownComputedState,
            computedState: original.computedState,
            tasks: original.tasks.map(ITestTaskState.serialize),
        });
        TestResultItem.deserialize = (serialized) => ({
            ...InternalTestItem.deserialize(serialized),
            ownComputedState: serialized.ownComputedState,
            computedState: serialized.computedState,
            tasks: serialized.tasks.map(ITestTaskState.deserialize),
            retired: true,
        });
    })(TestResultItem || (exports.TestResultItem = TestResultItem = {}));
    var DetailType;
    (function (DetailType) {
        DetailType[DetailType["Function"] = 0] = "Function";
        DetailType[DetailType["Statement"] = 1] = "Statement";
    })(DetailType || (exports.DetailType = DetailType = {}));
    var TestDiffOpType;
    (function (TestDiffOpType) {
        /** Adds a new test (with children) */
        TestDiffOpType[TestDiffOpType["Add"] = 0] = "Add";
        /** Shallow-updates an existing test */
        TestDiffOpType[TestDiffOpType["Update"] = 1] = "Update";
        /** Ranges of some tests in a document were synced, so it should be considered up-to-date */
        TestDiffOpType[TestDiffOpType["DocumentSynced"] = 2] = "DocumentSynced";
        /** Removes a test (and all its children) */
        TestDiffOpType[TestDiffOpType["Remove"] = 3] = "Remove";
        /** Changes the number of controllers who are yet to publish their collection roots. */
        TestDiffOpType[TestDiffOpType["IncrementPendingExtHosts"] = 4] = "IncrementPendingExtHosts";
        /** Retires a test/result */
        TestDiffOpType[TestDiffOpType["Retire"] = 5] = "Retire";
        /** Add a new test tag */
        TestDiffOpType[TestDiffOpType["AddTag"] = 6] = "AddTag";
        /** Remove a test tag */
        TestDiffOpType[TestDiffOpType["RemoveTag"] = 7] = "RemoveTag";
    })(TestDiffOpType || (exports.TestDiffOpType = TestDiffOpType = {}));
    var TestsDiffOp;
    (function (TestsDiffOp) {
        TestsDiffOp.deserialize = (u) => {
            if (u.op === 0 /* TestDiffOpType.Add */) {
                return { op: u.op, item: InternalTestItem.deserialize(u.item) };
            }
            else if (u.op === 1 /* TestDiffOpType.Update */) {
                return { op: u.op, item: ITestItemUpdate.deserialize(u.item) };
            }
            else if (u.op === 2 /* TestDiffOpType.DocumentSynced */) {
                return { op: u.op, uri: uri_1.URI.revive(u.uri), docv: u.docv };
            }
            else {
                return u;
            }
        };
        TestsDiffOp.serialize = (u) => {
            if (u.op === 0 /* TestDiffOpType.Add */) {
                return { op: u.op, item: InternalTestItem.serialize(u.item) };
            }
            else if (u.op === 1 /* TestDiffOpType.Update */) {
                return { op: u.op, item: ITestItemUpdate.serialize(u.item) };
            }
            else {
                return u;
            }
        };
    })(TestsDiffOp || (exports.TestsDiffOp = TestsDiffOp = {}));
    /**
     * Maintains tests in this extension host sent from the main thread.
     */
    class AbstractIncrementalTestCollection {
        constructor() {
            this._tags = new Map();
            /**
             * Map of item IDs to test item objects.
             */
            this.items = new Map();
            /**
             * ID of test root items.
             */
            this.roots = new Set();
            /**
             * Number of 'busy' controllers.
             */
            this.busyControllerCount = 0;
            /**
             * Number of pending roots.
             */
            this.pendingRootCount = 0;
            /**
             * Known test tags.
             */
            this.tags = this._tags;
        }
        /**
         * Applies the diff to the collection.
         */
        apply(diff) {
            const changes = this.createChangeCollector();
            for (const op of diff) {
                switch (op.op) {
                    case 0 /* TestDiffOpType.Add */:
                        this.add(InternalTestItem.deserialize(op.item), changes);
                        break;
                    case 1 /* TestDiffOpType.Update */:
                        this.update(ITestItemUpdate.deserialize(op.item), changes);
                        break;
                    case 3 /* TestDiffOpType.Remove */:
                        this.remove(op.itemId, changes);
                        break;
                    case 5 /* TestDiffOpType.Retire */:
                        this.retireTest(op.itemId);
                        break;
                    case 4 /* TestDiffOpType.IncrementPendingExtHosts */:
                        this.updatePendingRoots(op.amount);
                        break;
                    case 6 /* TestDiffOpType.AddTag */:
                        this._tags.set(op.tag.id, op.tag);
                        break;
                    case 7 /* TestDiffOpType.RemoveTag */:
                        this._tags.delete(op.id);
                        break;
                }
            }
            changes.complete?.();
        }
        add(item, changes) {
            const parentId = testId_1.TestId.parentId(item.item.extId)?.toString();
            let created;
            if (!parentId) {
                created = this.createItem(item);
                this.roots.add(created);
                this.items.set(item.item.extId, created);
            }
            else if (this.items.has(parentId)) {
                const parent = this.items.get(parentId);
                parent.children.add(item.item.extId);
                created = this.createItem(item, parent);
                this.items.set(item.item.extId, created);
            }
            else {
                console.error(`Test with unknown parent ID: ${JSON.stringify(item)}`);
                return;
            }
            changes.add?.(created);
            if (item.expand === 2 /* TestItemExpandState.BusyExpanding */) {
                this.busyControllerCount++;
            }
            return created;
        }
        update(patch, changes) {
            const existing = this.items.get(patch.extId);
            if (!existing) {
                return;
            }
            if (patch.expand !== undefined) {
                if (existing.expand === 2 /* TestItemExpandState.BusyExpanding */) {
                    this.busyControllerCount--;
                }
                if (patch.expand === 2 /* TestItemExpandState.BusyExpanding */) {
                    this.busyControllerCount++;
                }
            }
            (0, exports.applyTestItemUpdate)(existing, patch);
            changes.update?.(existing);
            return existing;
        }
        remove(itemId, changes) {
            const toRemove = this.items.get(itemId);
            if (!toRemove) {
                return;
            }
            const parentId = testId_1.TestId.parentId(toRemove.item.extId)?.toString();
            if (parentId) {
                const parent = this.items.get(parentId);
                parent.children.delete(toRemove.item.extId);
            }
            else {
                this.roots.delete(toRemove);
            }
            const queue = [[itemId]];
            while (queue.length) {
                for (const itemId of queue.pop()) {
                    const existing = this.items.get(itemId);
                    if (existing) {
                        queue.push(existing.children);
                        this.items.delete(itemId);
                        changes.remove?.(existing, existing !== toRemove);
                        if (existing.expand === 2 /* TestItemExpandState.BusyExpanding */) {
                            this.busyControllerCount--;
                        }
                    }
                }
            }
        }
        /**
         * Called when the extension signals a test result should be retired.
         */
        retireTest(testId) {
            // no-op
        }
        /**
         * Updates the number of test root sources who are yet to report. When
         * the total pending test roots reaches 0, the roots for all controllers
         * will exist in the collection.
         */
        updatePendingRoots(delta) {
            this.pendingRootCount += delta;
        }
        /**
         * Called before a diff is applied to create a new change collector.
         */
        createChangeCollector() {
            return {};
        }
    }
    exports.AbstractIncrementalTestCollection = AbstractIncrementalTestCollection;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFR5cGVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVzdGluZy9jb21tb24vdGVzdFR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxJQUFrQixlQVFqQjtJQVJELFdBQWtCLGVBQWU7UUFDaEMsdURBQVMsQ0FBQTtRQUNULHlEQUFVLENBQUE7UUFDViwyREFBVyxDQUFBO1FBQ1gseURBQVUsQ0FBQTtRQUNWLHlEQUFVLENBQUE7UUFDViwyREFBVyxDQUFBO1FBQ1gsMkRBQVcsQ0FBQTtJQUNaLENBQUMsRUFSaUIsZUFBZSwrQkFBZixlQUFlLFFBUWhDO0lBRUQsZ0VBQWdFO0lBQ2hFLElBQWtCLHFCQUlqQjtJQUpELFdBQWtCLHFCQUFxQjtRQUN0QywrREFBTyxDQUFBO1FBQ1AsbUVBQVMsQ0FBQTtRQUNULHlFQUFZLENBQUE7SUFDYixDQUFDLEVBSmlCLHFCQUFxQixxQ0FBckIscUJBQXFCLFFBSXRDO0lBRUQsSUFBa0Isb0JBT2pCO0lBUEQsV0FBa0Isb0JBQW9CO1FBQ3JDLDZEQUFZLENBQUE7UUFDWixpRUFBYyxDQUFBO1FBQ2QsdUVBQWlCLENBQUE7UUFDakIsZ0dBQTZCLENBQUE7UUFDN0Isc0ZBQXdCLENBQUE7UUFDeEIsa0dBQThCLENBQUE7SUFDL0IsQ0FBQyxFQVBpQixvQkFBb0Isb0NBQXBCLG9CQUFvQixRQU9yQztJQUVEOztPQUVHO0lBQ1UsUUFBQSx3QkFBd0IsR0FBRzs7Ozs7OztLQU92QyxDQUFDO0lBOERLLE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxDQUFpRCxFQUE4QixFQUFFLENBQUUsT0FBdUMsSUFBSSxDQUFDLENBQUM7SUFBMUosUUFBQSxzQkFBc0IsMEJBQW9JO0lBcUJ2SyxJQUFpQixhQUFhLENBZTdCO0lBZkQsV0FBaUIsYUFBYTtRQU1oQix1QkFBUyxHQUFHLENBQUMsUUFBdUIsRUFBYSxFQUFFLENBQUMsQ0FBQztZQUNqRSxLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDOUIsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFO1NBQzFCLENBQUMsQ0FBQztRQUVVLHlCQUFXLEdBQUcsQ0FBQyxRQUFtQixFQUFpQixFQUFFLENBQUMsQ0FBQztZQUNuRSxLQUFLLEVBQUUsYUFBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1lBQ2pDLEdBQUcsRUFBRSxTQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7U0FDN0IsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxFQWZnQixhQUFhLDZCQUFiLGFBQWEsUUFlN0I7SUFFRCxJQUFrQixlQUdqQjtJQUhELFdBQWtCLGVBQWU7UUFDaEMsdURBQUssQ0FBQTtRQUNMLHlEQUFNLENBQUE7SUFDUCxDQUFDLEVBSGlCLGVBQWUsK0JBQWYsZUFBZSxRQUdoQztJQVdELElBQWlCLGlCQUFpQixDQTJCakM7SUEzQkQsV0FBaUIsaUJBQWlCO1FBVXBCLDJCQUFTLEdBQUcsQ0FBQyxPQUEwQixFQUFjLEVBQUUsQ0FBQyxDQUFDO1lBQ3JFLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztZQUN4QixJQUFJLCtCQUF1QjtZQUMzQixRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7WUFDMUIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO1lBQ3RCLFlBQVksRUFBRSxPQUFPLENBQUMsWUFBWTtZQUNsQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsSUFBSSxhQUFhLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7U0FDdkUsQ0FBQyxDQUFDO1FBRVUsNkJBQVcsR0FBRyxDQUFDLE9BQW1CLEVBQXFCLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZFLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztZQUN4QixJQUFJLCtCQUF1QjtZQUMzQixRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7WUFDMUIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO1lBQ3RCLFlBQVksRUFBRSxPQUFPLENBQUMsWUFBWTtZQUNsQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsSUFBSSxhQUFhLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7U0FDekUsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxFQTNCZ0IsaUJBQWlCLGlDQUFqQixpQkFBaUIsUUEyQmpDO0lBV0Q7OztPQUdHO0lBQ0ksTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFjLEVBQUUsS0FBYyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUM7SUFBaEYsUUFBQSxTQUFTLGFBQXVFO0lBRTdGLElBQWlCLGtCQUFrQixDQXdCbEM7SUF4QkQsV0FBaUIsa0JBQWtCO1FBU3JCLDRCQUFTLEdBQUcsQ0FBQyxPQUEyQixFQUFjLEVBQUUsQ0FBQyxDQUFDO1lBQ3RFLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztZQUN4QixJQUFJLGdDQUF3QjtZQUM1QixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07WUFDdEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO1lBQ3RCLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUSxJQUFJLGFBQWEsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztTQUN2RSxDQUFDLENBQUM7UUFFVSw4QkFBVyxHQUFHLENBQUMsT0FBbUIsRUFBc0IsRUFBRSxDQUFDLENBQUM7WUFDeEUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPO1lBQ3hCLElBQUksZ0NBQXdCO1lBQzVCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtZQUN0QixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07WUFDdEIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRLElBQUksYUFBYSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO1NBQ3pFLENBQUMsQ0FBQztJQUNKLENBQUMsRUF4QmdCLGtCQUFrQixrQ0FBbEIsa0JBQWtCLFFBd0JsQztJQUlELElBQWlCLFlBQVksQ0FRNUI7SUFSRCxXQUFpQixZQUFZO1FBR2Ysc0JBQVMsR0FBRyxDQUFDLE9BQXFCLEVBQWMsRUFBRSxDQUM5RCxPQUFPLENBQUMsSUFBSSxrQ0FBMEIsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFMUcsd0JBQVcsR0FBRyxDQUFDLE9BQW1CLEVBQWdCLEVBQUUsQ0FDaEUsT0FBTyxDQUFDLElBQUksa0NBQTBCLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzVILENBQUMsRUFSZ0IsWUFBWSw0QkFBWixZQUFZLFFBUTVCO0lBUUQsSUFBaUIsY0FBYyxDQXdCOUI7SUF4QkQsV0FBaUIsY0FBYztRQU9qQix1Q0FBd0IsR0FBRyxDQUFDLEtBQXFCLEVBQWMsRUFBRSxDQUFDLENBQUM7WUFDL0UsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLO1lBQ2xCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtZQUN4QixRQUFRLEVBQUUsRUFBRTtTQUNaLENBQUMsQ0FBQztRQUVVLHdCQUFTLEdBQUcsQ0FBQyxLQUFxQixFQUFjLEVBQUUsQ0FBQyxDQUFDO1lBQ2hFLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztZQUNsQixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7WUFDeEIsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUM7U0FDcEQsQ0FBQyxDQUFDO1FBRVUsMEJBQVcsR0FBRyxDQUFDLEtBQWlCLEVBQWtCLEVBQUUsQ0FBQyxDQUFDO1lBQ2xFLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztZQUNsQixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7WUFDeEIsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUM7U0FDdEQsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxFQXhCZ0IsY0FBYyw4QkFBZCxjQUFjLFFBd0I5QjtJQVlELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0lBRXZCLE1BQU0sZ0JBQWdCLEdBQzVCLENBQUMsTUFBYyxFQUFFLEtBQWEsRUFBRSxFQUFFLENBQUMsTUFBTSxHQUFHLGdCQUFnQixHQUFHLEtBQUssQ0FBQztJQUR6RCxRQUFBLGdCQUFnQixvQkFDeUM7SUFFL0QsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLFVBQWtCLEVBQUUsRUFBRTtRQUN4RCxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDbkQsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUNuRixDQUFDLENBQUM7SUFIVyxRQUFBLGtCQUFrQixzQkFHN0I7SUF1QkYsSUFBaUIsU0FBUyxDQXVDekI7SUF2Q0QsV0FBaUIsU0FBUztRQWNaLG1CQUFTLEdBQUcsQ0FBQyxJQUFlLEVBQWMsRUFBRSxDQUFDLENBQUM7WUFDMUQsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2pCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztZQUNqQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZixRQUFRLEVBQUUsU0FBUztZQUNuQixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUU7WUFDdkIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksSUFBSTtZQUNuQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDN0IsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtTQUN2QixDQUFDLENBQUM7UUFFVSxxQkFBVyxHQUFHLENBQUMsVUFBc0IsRUFBYSxFQUFFLENBQUMsQ0FBQztZQUNsRSxLQUFLLEVBQUUsVUFBVSxDQUFDLEtBQUs7WUFDdkIsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLO1lBQ3ZCLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSTtZQUNyQixJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUk7WUFDckIsUUFBUSxFQUFFLFNBQVM7WUFDbkIsR0FBRyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQzVELEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxhQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUM3RCxXQUFXLEVBQUUsVUFBVSxDQUFDLFdBQVc7WUFDbkMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLO1lBQ3ZCLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUTtTQUM3QixDQUFDLENBQUM7SUFDSixDQUFDLEVBdkNnQixTQUFTLHlCQUFULFNBQVMsUUF1Q3pCO0lBRUQsSUFBa0IsbUJBS2pCO0lBTEQsV0FBa0IsbUJBQW1CO1FBQ3BDLCtFQUFhLENBQUE7UUFDYix5RUFBVSxDQUFBO1FBQ1YsK0VBQWEsQ0FBQTtRQUNiLHFFQUFRLENBQUE7SUFDVCxDQUFDLEVBTGlCLG1CQUFtQixtQ0FBbkIsbUJBQW1CLFFBS3BDO0lBY0QsSUFBaUIsZ0JBQWdCLENBbUJoQztJQW5CRCxXQUFpQixnQkFBZ0I7UUFNbkIsMEJBQVMsR0FBRyxDQUFDLElBQXNCLEVBQWMsRUFBRSxDQUFDLENBQUM7WUFDakUsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ25CLElBQUksRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDcEMsQ0FBQyxDQUFDO1FBRVUsNEJBQVcsR0FBRyxDQUFDLFVBQXNCLEVBQW9CLEVBQUUsQ0FBQyxDQUFDO1lBQ3pFLHlFQUF5RTtZQUN6RSwwRUFBMEU7WUFDMUUscUNBQXFDO1lBQ3JDLFlBQVksRUFBRSxlQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ2hELE1BQU0sRUFBRSxVQUFVLENBQUMsTUFBTTtZQUN6QixJQUFJLEVBQUUsU0FBUyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1NBQzVDLENBQUMsQ0FBQztJQUNKLENBQUMsRUFuQmdCLGdCQUFnQixnQ0FBaEIsZ0JBQWdCLFFBbUJoQztJQVdELElBQWlCLGVBQWUsQ0F3Qy9CO0lBeENELFdBQWlCLGVBQWU7UUFPbEIseUJBQVMsR0FBRyxDQUFDLENBQWtCLEVBQWMsRUFBRTtZQUMzRCxJQUFJLElBQStDLENBQUM7WUFDcEQsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFO2dCQUNYLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ1YsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7b0JBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztpQkFBRTtnQkFDOUQsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7b0JBQUUsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztpQkFBRTtnQkFDM0QsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7b0JBQUUsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztpQkFBRTtnQkFDM0QsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxTQUFTLEVBQUU7b0JBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQztpQkFBRTtnQkFDbEUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7b0JBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztpQkFBRTtnQkFDeEUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUU7b0JBQUUsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztpQkFBRTtnQkFDaEYsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7b0JBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztpQkFBRTtnQkFDOUQsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7b0JBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztpQkFBRTthQUN2RTtZQUVELE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUNuRCxDQUFDLENBQUM7UUFFVywyQkFBVyxHQUFHLENBQUMsQ0FBYSxFQUFtQixFQUFFO1lBQzdELElBQUksSUFBb0MsQ0FBQztZQUN6QyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUU7Z0JBQ1gsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDVixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtvQkFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2lCQUFFO2dCQUM5RCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtvQkFBRSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2lCQUFFO2dCQUMzRCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtvQkFBRSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2lCQUFFO2dCQUMzRCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtvQkFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxhQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztpQkFBRTtnQkFDaEcsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUU7b0JBQUUsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztpQkFBRTtnQkFDaEYsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7b0JBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztpQkFBRTtnQkFDOUQsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7b0JBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztpQkFBRTthQUN2RTtZQUVELE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUNuRCxDQUFDLENBQUM7SUFFSCxDQUFDLEVBeENnQixlQUFlLCtCQUFmLGVBQWUsUUF3Qy9CO0lBRU0sTUFBTSxtQkFBbUIsR0FBRyxDQUFDLFFBQTRDLEVBQUUsS0FBc0IsRUFBRSxFQUFFO1FBQzNHLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFDL0IsUUFBUSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1NBQy9CO1FBQ0QsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUM3QixRQUFRLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7U0FDdEY7SUFDRixDQUFDLENBQUM7SUFQVyxRQUFBLG1CQUFtQix1QkFPOUI7SUFrQkYsSUFBaUIsY0FBYyxDQWdDOUI7SUFoQ0QsV0FBaUIsY0FBYztRQVdqQix1Q0FBd0IsR0FBRyxDQUFDLFFBQXdCLEVBQWMsRUFBRSxDQUFDLENBQUM7WUFDbEYsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQ3ZDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxnQkFBZ0I7WUFDM0MsYUFBYSxFQUFFLFFBQVEsQ0FBQyxhQUFhO1lBQ3JDLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsd0JBQXdCLENBQUM7U0FDbEUsQ0FBQyxDQUFDO1FBRVUsd0JBQVMsR0FBRyxDQUFDLFFBQXdCLEVBQWMsRUFBRSxDQUFDLENBQUM7WUFDbkUsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQ3ZDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxnQkFBZ0I7WUFDM0MsYUFBYSxFQUFFLFFBQVEsQ0FBQyxhQUFhO1lBQ3JDLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDO1NBQ25ELENBQUMsQ0FBQztRQUVVLDBCQUFXLEdBQUcsQ0FBQyxVQUFzQixFQUFrQixFQUFFLENBQUMsQ0FBQztZQUN2RSxHQUFHLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUM7WUFDM0MsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLGdCQUFnQjtZQUM3QyxhQUFhLEVBQUUsVUFBVSxDQUFDLGFBQWE7WUFDdkMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUM7WUFDdkQsT0FBTyxFQUFFLElBQUk7U0FDYixDQUFDLENBQUM7SUFDSixDQUFDLEVBaENnQixjQUFjLDhCQUFkLGNBQWMsUUFnQzlCO0lBa0NELElBQWtCLFVBR2pCO0lBSEQsV0FBa0IsVUFBVTtRQUMzQixtREFBUSxDQUFBO1FBQ1IscURBQVMsQ0FBQTtJQUNWLENBQUMsRUFIaUIsVUFBVSwwQkFBVixVQUFVLFFBRzNCO0lBc0JELElBQWtCLGNBaUJqQjtJQWpCRCxXQUFrQixjQUFjO1FBQy9CLHNDQUFzQztRQUN0QyxpREFBRyxDQUFBO1FBQ0gsdUNBQXVDO1FBQ3ZDLHVEQUFNLENBQUE7UUFDTiw0RkFBNEY7UUFDNUYsdUVBQWMsQ0FBQTtRQUNkLDRDQUE0QztRQUM1Qyx1REFBTSxDQUFBO1FBQ04sdUZBQXVGO1FBQ3ZGLDJGQUF3QixDQUFBO1FBQ3hCLDRCQUE0QjtRQUM1Qix1REFBTSxDQUFBO1FBQ04seUJBQXlCO1FBQ3pCLHVEQUFNLENBQUE7UUFDTix3QkFBd0I7UUFDeEIsNkRBQVMsQ0FBQTtJQUNWLENBQUMsRUFqQmlCLGNBQWMsOEJBQWQsY0FBYyxRQWlCL0I7SUFZRCxJQUFpQixXQUFXLENBZ0MzQjtJQWhDRCxXQUFpQixXQUFXO1FBV2QsdUJBQVcsR0FBRyxDQUFDLENBQWEsRUFBZSxFQUFFO1lBQ3pELElBQUksQ0FBQyxDQUFDLEVBQUUsK0JBQXVCLEVBQUU7Z0JBQ2hDLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2FBQ2hFO2lCQUFNLElBQUksQ0FBQyxDQUFDLEVBQUUsa0NBQTBCLEVBQUU7Z0JBQzFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzthQUMvRDtpQkFBTSxJQUFJLENBQUMsQ0FBQyxFQUFFLDBDQUFrQyxFQUFFO2dCQUNsRCxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLFNBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDMUQ7aUJBQU07Z0JBQ04sT0FBTyxDQUFDLENBQUM7YUFDVDtRQUNGLENBQUMsQ0FBQztRQUVXLHFCQUFTLEdBQUcsQ0FBQyxDQUFjLEVBQWMsRUFBRTtZQUN2RCxJQUFJLENBQUMsQ0FBQyxFQUFFLCtCQUF1QixFQUFFO2dCQUNoQyxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzthQUM5RDtpQkFBTSxJQUFJLENBQUMsQ0FBQyxFQUFFLGtDQUEwQixFQUFFO2dCQUMxQyxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7YUFDN0Q7aUJBQU07Z0JBQ04sT0FBTyxDQUFDLENBQUM7YUFDVDtRQUNGLENBQUMsQ0FBQztJQUNILENBQUMsRUFoQ2dCLFdBQVcsMkJBQVgsV0FBVyxRQWdDM0I7SUFrRUQ7O09BRUc7SUFDSCxNQUFzQixpQ0FBaUM7UUFBdkQ7WUFDa0IsVUFBSyxHQUFHLElBQUksR0FBRyxFQUErQixDQUFDO1lBRWhFOztlQUVHO1lBQ2dCLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBYSxDQUFDO1lBRWhEOztlQUVHO1lBQ2dCLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBSyxDQUFDO1lBRXhDOztlQUVHO1lBQ08sd0JBQW1CLEdBQUcsQ0FBQyxDQUFDO1lBRWxDOztlQUVHO1lBQ08scUJBQWdCLEdBQUcsQ0FBQyxDQUFDO1lBRS9COztlQUVHO1lBQ2EsU0FBSSxHQUE2QyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBb0o3RSxDQUFDO1FBbEpBOztXQUVHO1FBQ0ksS0FBSyxDQUFDLElBQWU7WUFDM0IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFFN0MsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLEVBQUU7Z0JBQ3RCLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDZDt3QkFDQyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7d0JBQ3pELE1BQU07b0JBRVA7d0JBQ0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQzt3QkFDM0QsTUFBTTtvQkFFUDt3QkFDQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7d0JBQ2hDLE1BQU07b0JBRVA7d0JBQ0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQzNCLE1BQU07b0JBRVA7d0JBQ0MsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDbkMsTUFBTTtvQkFFUDt3QkFDQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ2xDLE1BQU07b0JBRVA7d0JBQ0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUN6QixNQUFNO2lCQUNQO2FBQ0Q7WUFFRCxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBRVMsR0FBRyxDQUFDLElBQXNCLEVBQUUsT0FBc0M7WUFFM0UsTUFBTSxRQUFRLEdBQUcsZUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDO1lBQzlELElBQUksT0FBVSxDQUFDO1lBQ2YsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQ3pDO2lCQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3BDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBRSxDQUFDO2dCQUN6QyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNyQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQ3pDO2lCQUFNO2dCQUNOLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN0RSxPQUFPO2FBQ1A7WUFFRCxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkIsSUFBSSxJQUFJLENBQUMsTUFBTSw4Q0FBc0MsRUFBRTtnQkFDdEQsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7YUFDM0I7WUFFRCxPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDO1FBRVMsTUFBTSxDQUFDLEtBQXNCLEVBQUUsT0FBc0M7WUFFOUUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2QsT0FBTzthQUNQO1lBRUQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDL0IsSUFBSSxRQUFRLENBQUMsTUFBTSw4Q0FBc0MsRUFBRTtvQkFDMUQsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7aUJBQzNCO2dCQUNELElBQUksS0FBSyxDQUFDLE1BQU0sOENBQXNDLEVBQUU7b0JBQ3ZELElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2lCQUMzQjthQUNEO1lBRUQsSUFBQSwyQkFBbUIsRUFBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDckMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNCLE9BQU8sUUFBUSxDQUFDO1FBQ2pCLENBQUM7UUFFUyxNQUFNLENBQUMsTUFBYyxFQUFFLE9BQXNDO1lBQ3RFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2QsT0FBTzthQUNQO1lBRUQsTUFBTSxRQUFRLEdBQUcsZUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDO1lBQ2xFLElBQUksUUFBUSxFQUFFO2dCQUNiLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBRSxDQUFDO2dCQUN6QyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzVDO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzVCO1lBRUQsTUFBTSxLQUFLLEdBQXVCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzdDLE9BQU8sS0FBSyxDQUFDLE1BQU0sRUFBRTtnQkFDcEIsS0FBSyxNQUFNLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFHLEVBQUU7b0JBQ2xDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN4QyxJQUFJLFFBQVEsRUFBRTt3QkFDYixLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQzFCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDO3dCQUVsRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLDhDQUFzQyxFQUFFOzRCQUMxRCxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzt5QkFDM0I7cUJBQ0Q7aUJBQ0Q7YUFDRDtRQUNGLENBQUM7UUFFRDs7V0FFRztRQUNPLFVBQVUsQ0FBQyxNQUFjO1lBQ2xDLFFBQVE7UUFDVCxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNJLGtCQUFrQixDQUFDLEtBQWE7WUFDdEMsSUFBSSxDQUFDLGdCQUFnQixJQUFJLEtBQUssQ0FBQztRQUNoQyxDQUFDO1FBRUQ7O1dBRUc7UUFDTyxxQkFBcUI7WUFDOUIsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO0tBTUQ7SUE5S0QsOEVBOEtDIn0=