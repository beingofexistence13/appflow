/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/nls", "vs/workbench/contrib/testing/common/getComputedState", "vs/workbench/contrib/testing/common/observableValue", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/contrib/testing/common/testTypes"], function (require, exports, async_1, buffer_1, event_1, lazy_1, lifecycle_1, platform_1, strings_1, nls_1, getComputedState_1, observableValue_1, testId_1, testingStates_1, testTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HydratedTestResult = exports.LiveTestResult = exports.TestResultItemChangeReason = exports.maxCountPriority = exports.resultItemParents = exports.TaskRawOutput = void 0;
    const emptyRawOutput = {
        buffers: [],
        length: 0,
        onDidWriteData: event_1.Event.None,
        endPromise: Promise.resolve(),
        getRange: () => buffer_1.VSBuffer.alloc(0),
        getRangeIter: () => [],
    };
    class TaskRawOutput {
        constructor() {
            this.writeDataEmitter = new event_1.Emitter();
            this.endDeferred = new async_1.DeferredPromise();
            this.offset = 0;
            /** @inheritdoc */
            this.onDidWriteData = this.writeDataEmitter.event;
            /** @inheritdoc */
            this.endPromise = this.endDeferred.p;
            /** @inheritdoc */
            this.buffers = [];
        }
        /** @inheritdoc */
        get length() {
            return this.offset;
        }
        /** @inheritdoc */
        getRange(start, length) {
            const buf = buffer_1.VSBuffer.alloc(length);
            let bufLastWrite = 0;
            for (const chunk of this.getRangeIter(start, length)) {
                buf.buffer.set(chunk.buffer, bufLastWrite);
                bufLastWrite += chunk.byteLength;
            }
            return bufLastWrite < length ? buf.slice(0, bufLastWrite) : buf;
        }
        /** @inheritdoc */
        *getRangeIter(start, length) {
            let soFar = 0;
            let internalLastRead = 0;
            for (const b of this.buffers) {
                if (internalLastRead + b.byteLength <= start) {
                    internalLastRead += b.byteLength;
                    continue;
                }
                const bstart = Math.max(0, start - internalLastRead);
                const bend = Math.min(b.byteLength, bstart + length - soFar);
                yield b.slice(bstart, bend);
                soFar += bend - bstart;
                internalLastRead += b.byteLength;
                if (soFar === length) {
                    break;
                }
            }
        }
        /**
         * Appends data to the output, returning the byte range where the data can be found.
         */
        append(data, marker) {
            const offset = this.offset;
            let length = data.byteLength;
            if (marker === undefined) {
                this.push(data);
                return { offset, length };
            }
            // Bytes that should be 'trimmed' off the end of data. This is done because
            // selections in the terminal are based on the entire line, and commonly
            // the interesting marked range has a trailing new line. We don't want to
            // select the trailing line (which might have other data)
            // so we place the marker before all trailing trimbytes.
            let TrimBytes;
            (function (TrimBytes) {
                TrimBytes[TrimBytes["CR"] = 13] = "CR";
                TrimBytes[TrimBytes["LF"] = 10] = "LF";
            })(TrimBytes || (TrimBytes = {}));
            const start = buffer_1.VSBuffer.fromString(getMarkCode(marker, true));
            const end = buffer_1.VSBuffer.fromString(getMarkCode(marker, false));
            length += start.byteLength + end.byteLength;
            this.push(start);
            let trimLen = data.byteLength;
            for (; trimLen > 0; trimLen--) {
                const last = data.buffer[trimLen - 1];
                if (last !== 13 /* TrimBytes.CR */ && last !== 10 /* TrimBytes.LF */) {
                    break;
                }
            }
            this.push(data.slice(0, trimLen));
            this.push(end);
            this.push(data.slice(trimLen));
            return { offset, length };
        }
        push(data) {
            if (data.byteLength === 0) {
                return;
            }
            this.buffers.push(data);
            this.writeDataEmitter.fire(data);
            this.offset += data.byteLength;
        }
        /** Signals the output has ended. */
        end() {
            this.endDeferred.complete();
        }
    }
    exports.TaskRawOutput = TaskRawOutput;
    const resultItemParents = function* (results, item) {
        for (const id of testId_1.TestId.fromString(item.item.extId).idsToRoot()) {
            yield results.getStateById(id.toString());
        }
    };
    exports.resultItemParents = resultItemParents;
    const maxCountPriority = (counts) => {
        for (const state of testingStates_1.statesInOrder) {
            if (counts[state] > 0) {
                return state;
            }
        }
        return 0 /* TestResultState.Unset */;
    };
    exports.maxCountPriority = maxCountPriority;
    const getMarkCode = (marker, start) => `\x1b]633;SetMark;Id=${(0, testTypes_1.getMarkId)(marker, start)};Hidden\x07`;
    const itemToNode = (controllerId, item, parent) => ({
        controllerId,
        expand: 0 /* TestItemExpandState.NotExpandable */,
        item: { ...item },
        children: [],
        tasks: [],
        ownComputedState: 0 /* TestResultState.Unset */,
        computedState: 0 /* TestResultState.Unset */,
    });
    var TestResultItemChangeReason;
    (function (TestResultItemChangeReason) {
        TestResultItemChangeReason[TestResultItemChangeReason["ComputedStateChange"] = 0] = "ComputedStateChange";
        TestResultItemChangeReason[TestResultItemChangeReason["OwnStateChange"] = 1] = "OwnStateChange";
        TestResultItemChangeReason[TestResultItemChangeReason["NewMessage"] = 2] = "NewMessage";
    })(TestResultItemChangeReason || (exports.TestResultItemChangeReason = TestResultItemChangeReason = {}));
    /**
     * Results of a test. These are created when the test initially started running
     * and marked as "complete" when the run finishes.
     */
    class LiveTestResult extends lifecycle_1.Disposable {
        /**
         * @inheritdoc
         */
        get completedAt() {
            return this._completedAt;
        }
        /**
         * @inheritdoc
         */
        get tests() {
            return this.testById.values();
        }
        constructor(id, persist, request) {
            super();
            this.id = id;
            this.persist = persist;
            this.request = request;
            this.completeEmitter = this._register(new event_1.Emitter());
            this.newTaskEmitter = this._register(new event_1.Emitter());
            this.endTaskEmitter = this._register(new event_1.Emitter());
            this.changeEmitter = this._register(new event_1.Emitter());
            /** todo@connor4312: convert to a WellDefinedPrefixTree */
            this.testById = new Map();
            this.testMarkerCounter = 0;
            this.startedAt = Date.now();
            this.onChange = this.changeEmitter.event;
            this.onComplete = this.completeEmitter.event;
            this.onNewTask = this.newTaskEmitter.event;
            this.onEndTask = this.endTaskEmitter.event;
            this.tasks = [];
            this.name = (0, nls_1.localize)('runFinished', 'Test run at {0}', new Date().toLocaleString(platform_1.language));
            /**
             * @inheritdoc
             */
            this.counts = (0, testingStates_1.makeEmptyCounts)();
            this.computedStateAccessor = {
                getOwnState: i => i.ownComputedState,
                getCurrentComputedState: i => i.computedState,
                setComputedState: (i, s) => i.computedState = s,
                getChildren: i => i.children,
                getParents: i => {
                    const { testById: testByExtId } = this;
                    return (function* () {
                        const parentId = testId_1.TestId.fromString(i.item.extId).parentId;
                        if (parentId) {
                            for (const id of parentId.idsToRoot()) {
                                yield testByExtId.get(id.toString());
                            }
                        }
                    })();
                },
            };
            this.doSerialize = new lazy_1.Lazy(() => ({
                id: this.id,
                completedAt: this.completedAt,
                tasks: this.tasks.map(t => ({ id: t.id, name: t.name })),
                name: this.name,
                request: this.request,
                items: [...this.testById.values()].map(testTypes_1.TestResultItem.serializeWithoutMessages),
            }));
            this.doSerializeWithMessages = new lazy_1.Lazy(() => ({
                id: this.id,
                completedAt: this.completedAt,
                tasks: this.tasks.map(t => ({ id: t.id, name: t.name })),
                name: this.name,
                request: this.request,
                items: [...this.testById.values()].map(testTypes_1.TestResultItem.serialize),
            }));
        }
        /**
         * @inheritdoc
         */
        getStateById(extTestId) {
            return this.testById.get(extTestId);
        }
        /**
         * Appends output that occurred during the test run.
         */
        appendOutput(output, taskId, location, testId) {
            const preview = output.byteLength > 100 ? output.slice(0, 100).toString() + '…' : output.toString();
            let marker;
            // currently, the UI only exposes jump-to-message from tests or locations,
            // so no need to mark outputs that don't come from either of those.
            if (testId || location) {
                marker = this.testMarkerCounter++;
            }
            const index = this.mustGetTaskIndex(taskId);
            const task = this.tasks[index];
            const { offset, length } = task.output.append(output, marker);
            const message = {
                location,
                message: (0, strings_1.removeAnsiEscapeCodes)(preview),
                offset,
                length,
                marker,
                type: 1 /* TestMessageType.Output */,
            };
            const test = testId && this.testById.get(testId);
            if (test) {
                test.tasks[index].messages.push(message);
                this.changeEmitter.fire({ item: test, result: this, reason: 2 /* TestResultItemChangeReason.NewMessage */, message });
            }
            else {
                task.otherMessages.push(message);
            }
        }
        /**
         * Adds a new run task to the results.
         */
        addTask(task) {
            this.tasks.push({ ...task, coverage: this._register(new observableValue_1.MutableObservableValue(undefined)), otherMessages: [], output: new TaskRawOutput() });
            for (const test of this.tests) {
                test.tasks.push({ duration: undefined, messages: [], state: 0 /* TestResultState.Unset */ });
            }
            this.newTaskEmitter.fire(this.tasks.length - 1);
        }
        /**
         * Add the chain of tests to the run. The first test in the chain should
         * be either a test root, or a previously-known test.
         */
        addTestChainToRun(controllerId, chain) {
            let parent = this.testById.get(chain[0].extId);
            if (!parent) { // must be a test root
                parent = this.addTestToRun(controllerId, chain[0], null);
            }
            for (let i = 1; i < chain.length; i++) {
                parent = this.addTestToRun(controllerId, chain[i], parent.item.extId);
            }
            return undefined;
        }
        /**
         * Updates the state of the test by its internal ID.
         */
        updateState(testId, taskId, state, duration) {
            const entry = this.testById.get(testId);
            if (!entry) {
                return;
            }
            const index = this.mustGetTaskIndex(taskId);
            const oldTerminalStatePrio = testingStates_1.terminalStatePriorities[entry.tasks[index].state];
            const newTerminalStatePrio = testingStates_1.terminalStatePriorities[state];
            // Ignore requests to set the state from one terminal state back to a
            // "lower" one, e.g. from failed back to passed:
            if (oldTerminalStatePrio !== undefined &&
                (newTerminalStatePrio === undefined || newTerminalStatePrio < oldTerminalStatePrio)) {
                return;
            }
            this.fireUpdateAndRefresh(entry, index, state, duration);
        }
        /**
         * Appends a message for the test in the run.
         */
        appendMessage(testId, taskId, message) {
            const entry = this.testById.get(testId);
            if (!entry) {
                return;
            }
            entry.tasks[this.mustGetTaskIndex(taskId)].messages.push(message);
            this.changeEmitter.fire({ item: entry, result: this, reason: 2 /* TestResultItemChangeReason.NewMessage */, message });
        }
        /**
         * Marks the task in the test run complete.
         */
        markTaskComplete(taskId) {
            const index = this.mustGetTaskIndex(taskId);
            const task = this.tasks[index];
            task.running = false;
            task.output.end();
            this.setAllToState(0 /* TestResultState.Unset */, taskId, t => t.state === 1 /* TestResultState.Queued */ || t.state === 2 /* TestResultState.Running */);
            this.endTaskEmitter.fire(index);
        }
        /**
         * Notifies the service that all tests are complete.
         */
        markComplete() {
            if (this._completedAt !== undefined) {
                throw new Error('cannot complete a test result multiple times');
            }
            for (const task of this.tasks) {
                if (task.running) {
                    this.markTaskComplete(task.id);
                }
            }
            this._completedAt = Date.now();
            this.completeEmitter.fire();
        }
        /**
         * Marks the test and all of its children in the run as retired.
         */
        markRetired(testIds) {
            for (const [id, test] of this.testById) {
                if (!test.retired && (!testIds || testIds.hasKeyOrParent(testId_1.TestId.fromString(id).path))) {
                    test.retired = true;
                    this.changeEmitter.fire({ reason: 0 /* TestResultItemChangeReason.ComputedStateChange */, item: test, result: this });
                }
            }
        }
        /**
         * @inheritdoc
         */
        toJSON() {
            return this.completedAt && this.persist ? this.doSerialize.value : undefined;
        }
        toJSONWithMessages() {
            return this.completedAt && this.persist ? this.doSerializeWithMessages.value : undefined;
        }
        /**
         * Updates all tests in the collection to the given state.
         */
        setAllToState(state, taskId, when) {
            const index = this.mustGetTaskIndex(taskId);
            for (const test of this.testById.values()) {
                if (when(test.tasks[index], test)) {
                    this.fireUpdateAndRefresh(test, index, state);
                }
            }
        }
        fireUpdateAndRefresh(entry, taskIndex, newState, newOwnDuration) {
            const previousOwnComputed = entry.ownComputedState;
            const previousOwnDuration = entry.ownDuration;
            const changeEvent = {
                item: entry,
                result: this,
                reason: 1 /* TestResultItemChangeReason.OwnStateChange */,
                previousState: previousOwnComputed,
                previousOwnDuration: previousOwnDuration,
            };
            entry.tasks[taskIndex].state = newState;
            if (newOwnDuration !== undefined) {
                entry.tasks[taskIndex].duration = newOwnDuration;
                entry.ownDuration = Math.max(entry.ownDuration || 0, newOwnDuration);
            }
            const newOwnComputed = (0, testingStates_1.maxPriority)(...entry.tasks.map(t => t.state));
            if (newOwnComputed === previousOwnComputed) {
                if (newOwnDuration !== previousOwnDuration) {
                    this.changeEmitter.fire(changeEvent); // fire manually since state change won't do it
                }
                return;
            }
            entry.ownComputedState = newOwnComputed;
            this.counts[previousOwnComputed]--;
            this.counts[newOwnComputed]++;
            (0, getComputedState_1.refreshComputedState)(this.computedStateAccessor, entry).forEach(t => this.changeEmitter.fire(t === entry ? changeEvent : {
                item: t,
                result: this,
                reason: 0 /* TestResultItemChangeReason.ComputedStateChange */,
            }));
        }
        addTestToRun(controllerId, item, parent) {
            const node = itemToNode(controllerId, item, parent);
            this.testById.set(item.extId, node);
            this.counts[0 /* TestResultState.Unset */]++;
            if (parent) {
                this.testById.get(parent)?.children.push(node);
            }
            if (this.tasks.length) {
                for (let i = 0; i < this.tasks.length; i++) {
                    node.tasks.push({ duration: undefined, messages: [], state: 0 /* TestResultState.Unset */ });
                }
            }
            return node;
        }
        mustGetTaskIndex(taskId) {
            const index = this.tasks.findIndex(t => t.id === taskId);
            if (index === -1) {
                throw new Error(`Unknown task ${taskId} in updateState`);
            }
            return index;
        }
    }
    exports.LiveTestResult = LiveTestResult;
    /**
     * Test results hydrated from a previously-serialized test run.
     */
    class HydratedTestResult {
        /**
         * @inheritdoc
         */
        get tests() {
            return this.testById.values();
        }
        constructor(serialized, persist = true) {
            this.serialized = serialized;
            this.persist = persist;
            /**
             * @inheritdoc
             */
            this.counts = (0, testingStates_1.makeEmptyCounts)();
            this.testById = new Map();
            this.id = serialized.id;
            this.completedAt = serialized.completedAt;
            this.tasks = serialized.tasks.map((task, i) => ({
                id: task.id,
                name: task.name,
                running: false,
                coverage: (0, observableValue_1.staticObservableValue)(undefined),
                output: emptyRawOutput,
                otherMessages: []
            }));
            this.name = serialized.name;
            this.request = serialized.request;
            for (const item of serialized.items) {
                const de = testTypes_1.TestResultItem.deserialize(item);
                this.counts[de.ownComputedState]++;
                this.testById.set(item.item.extId, de);
            }
        }
        /**
         * @inheritdoc
         */
        getStateById(extTestId) {
            return this.testById.get(extTestId);
        }
        /**
         * @inheritdoc
         */
        toJSON() {
            return this.persist ? this.serialized : undefined;
        }
        /**
         * @inheritdoc
         */
        toJSONWithMessages() {
            return this.toJSON();
        }
    }
    exports.HydratedTestResult = HydratedTestResult;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFJlc3VsdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlc3RpbmcvY29tbW9uL3Rlc3RSZXN1bHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBd0doRyxNQUFNLGNBQWMsR0FBbUI7UUFDdEMsT0FBTyxFQUFFLEVBQUU7UUFDWCxNQUFNLEVBQUUsQ0FBQztRQUNULGNBQWMsRUFBRSxhQUFLLENBQUMsSUFBSTtRQUMxQixVQUFVLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRTtRQUM3QixRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsaUJBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFO0tBQ3RCLENBQUM7SUFFRixNQUFhLGFBQWE7UUFBMUI7WUFDa0IscUJBQWdCLEdBQUcsSUFBSSxlQUFPLEVBQVksQ0FBQztZQUMzQyxnQkFBVyxHQUFHLElBQUksdUJBQWUsRUFBUSxDQUFDO1lBQ25ELFdBQU0sR0FBRyxDQUFDLENBQUM7WUFFbkIsa0JBQWtCO1lBQ0YsbUJBQWMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDO1lBRTdELGtCQUFrQjtZQUNGLGVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUVoRCxrQkFBa0I7WUFDRixZQUFPLEdBQWUsRUFBRSxDQUFDO1FBa0cxQyxDQUFDO1FBaEdBLGtCQUFrQjtRQUNsQixJQUFXLE1BQU07WUFDaEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BCLENBQUM7UUFFRCxrQkFBa0I7UUFDbEIsUUFBUSxDQUFDLEtBQWEsRUFBRSxNQUFjO1lBQ3JDLE1BQU0sR0FBRyxHQUFHLGlCQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ25DLElBQUks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