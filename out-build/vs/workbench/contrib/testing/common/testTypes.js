/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/editor/common/core/range", "vs/workbench/contrib/testing/common/testId"], function (require, exports, uri_1, range_1, testId_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$WI = exports.TestsDiffOp = exports.TestDiffOpType = exports.DetailType = exports.TestResultItem = exports.$VI = exports.ITestItemUpdate = exports.InternalTestItem = exports.TestItemExpandState = exports.ITestItem = exports.$UI = exports.$TI = exports.ITestTaskState = exports.ITestMessage = exports.ITestOutputMessage = exports.$SI = exports.ITestErrorMessage = exports.TestMessageType = exports.IRichLocation = exports.$RI = exports.$QI = exports.TestRunProfileBitset = exports.ExtTestRunProfileKind = exports.TestResultState = void 0;
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
    exports.$QI = [
        2 /* TestRunProfileBitset.Run */,
        4 /* TestRunProfileBitset.Debug */,
        8 /* TestRunProfileBitset.Coverage */,
        16 /* TestRunProfileBitset.HasNonDefaultProfile */,
        32 /* TestRunProfileBitset.HasConfigurable */,
        64 /* TestRunProfileBitset.SupportsContinuousRun */,
    ];
    const $RI = (t) => 'runId' in t;
    exports.$RI = $RI;
    var IRichLocation;
    (function (IRichLocation) {
        IRichLocation.serialize = (location) => ({
            range: location.range.toJSON(),
            uri: location.uri.toJSON(),
        });
        IRichLocation.deserialize = (location) => ({
            range: range_1.$ks.lift(location.range),
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
    const $SI = (marker, start) => `${start ? 's' : 'e'}${marker}`;
    exports.$SI = $SI;
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
    const $TI = (ctrlId, tagId) => ctrlId + testTagDelimiter + tagId;
    exports.$TI = $TI;
    const $UI = (namespaced) => {
        const index = namespaced.indexOf(testTagDelimiter);
        return { ctrlId: namespaced.slice(0, index), tagId: namespaced.slice(index + 1) };
    };
    exports.$UI = $UI;
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
            range: serialized.range ? range_1.$ks.lift(serialized.range) : null,
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
            controllerId: testId_1.$PI.root(serialized.item.extId),
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
                    item.range = u.item.range ? range_1.$ks.lift(u.item.range) : null;
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
    const $VI = (internal, patch) => {
        if (patch.expand !== undefined) {
            internal.expand = patch.expand;
        }
        if (patch.item !== undefined) {
            internal.item = internal.item ? Object.assign(internal.item, patch.item) : patch.item;
        }
    };
    exports.$VI = $VI;
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
    class $WI {
        constructor() {
            this.d = new Map();
            /**
             * Map of item IDs to test item objects.
             */
            this.f = new Map();
            /**
             * ID of test root items.
             */
            this.g = new Set();
            /**
             * Number of 'busy' controllers.
             */
            this.h = 0;
            /**
             * Number of pending roots.
             */
            this.j = 0;
            /**
             * Known test tags.
             */
            this.tags = this.d;
        }
        /**
         * Applies the diff to the collection.
         */
        apply(diff) {
            const changes = this.p();
            for (const op of diff) {
                switch (op.op) {
                    case 0 /* TestDiffOpType.Add */:
                        this.k(InternalTestItem.deserialize(op.item), changes);
                        break;
                    case 1 /* TestDiffOpType.Update */:
                        this.l(ITestItemUpdate.deserialize(op.item), changes);
                        break;
                    case 3 /* TestDiffOpType.Remove */:
                        this.m(op.itemId, changes);
                        break;
                    case 5 /* TestDiffOpType.Retire */:
                        this.o(op.itemId);
                        break;
                    case 4 /* TestDiffOpType.IncrementPendingExtHosts */:
                        this.updatePendingRoots(op.amount);
                        break;
                    case 6 /* TestDiffOpType.AddTag */:
                        this.d.set(op.tag.id, op.tag);
                        break;
                    case 7 /* TestDiffOpType.RemoveTag */:
                        this.d.delete(op.id);
                        break;
                }
            }
            changes.complete?.();
        }
        k(item, changes) {
            const parentId = testId_1.$PI.parentId(item.item.extId)?.toString();
            let created;
            if (!parentId) {
                created = this.q(item);
                this.g.add(created);
                this.f.set(item.item.extId, created);
            }
            else if (this.f.has(parentId)) {
                const parent = this.f.get(parentId);
                parent.children.add(item.item.extId);
                created = this.q(item, parent);
                this.f.set(item.item.extId, created);
            }
            else {
                console.error(`Test with unknown parent ID: ${JSON.stringify(item)}`);
                return;
            }
            changes.add?.(created);
            if (item.expand === 2 /* TestItemExpandState.BusyExpanding */) {
                this.h++;
            }
            return created;
        }
        l(patch, changes) {
            const existing = this.f.get(patch.extId);
            if (!existing) {
                return;
            }
            if (patch.expand !== undefined) {
                if (existing.expand === 2 /* TestItemExpandState.BusyExpanding */) {
                    this.h--;
                }
                if (patch.expand === 2 /* TestItemExpandState.BusyExpanding */) {
                    this.h++;
                }
            }
            (0, exports.$VI)(existing, patch);
            changes.update?.(existing);
            return existing;
        }
        m(itemId, changes) {
            const toRemove = this.f.get(itemId);
            if (!toRemove) {
                return;
            }
            const parentId = testId_1.$PI.parentId(toRemove.item.extId)?.toString();
            if (parentId) {
                const parent = this.f.get(parentId);
                parent.children.delete(toRemove.item.extId);
            }
            else {
                this.g.delete(toRemove);
            }
            const queue = [[itemId]];
            while (queue.length) {
                for (const itemId of queue.pop()) {
                    const existing = this.f.get(itemId);
                    if (existing) {
                        queue.push(existing.children);
                        this.f.delete(itemId);
                        changes.remove?.(existing, existing !== toRemove);
                        if (existing.expand === 2 /* TestItemExpandState.BusyExpanding */) {
                            this.h--;
                        }
                    }
                }
            }
        }
        /**
         * Called when the extension signals a test result should be retired.
         */
        o(testId) {
            // no-op
        }
        /**
         * Updates the number of test root sources who are yet to report. When
         * the total pending test roots reaches 0, the roots for all controllers
         * will exist in the collection.
         */
        updatePendingRoots(delta) {
            this.j += delta;
        }
        /**
         * Called before a diff is applied to create a new change collector.
         */
        p() {
            return {};
        }
    }
    exports.$WI = $WI;
});
//# sourceMappingURL=testTypes.js.map