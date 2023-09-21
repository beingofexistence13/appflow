/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/nls!vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/getComputedState", "vs/workbench/contrib/testing/common/observableValue", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/contrib/testing/common/testTypes"], function (require, exports, async_1, buffer_1, event_1, lazy_1, lifecycle_1, platform_1, strings_1, nls_1, getComputedState_1, observableValue_1, testId_1, testingStates_1, testTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3sb = exports.$2sb = exports.TestResultItemChangeReason = exports.$1sb = exports.$Zsb = exports.$Ysb = void 0;
    const emptyRawOutput = {
        buffers: [],
        length: 0,
        onDidWriteData: event_1.Event.None,
        endPromise: Promise.resolve(),
        getRange: () => buffer_1.$Fd.alloc(0),
        getRangeIter: () => [],
    };
    class $Ysb {
        constructor() {
            this.a = new event_1.$fd();
            this.c = new async_1.$2g();
            this.d = 0;
            /** @inheritdoc */
            this.onDidWriteData = this.a.event;
            /** @inheritdoc */
            this.endPromise = this.c.p;
            /** @inheritdoc */
            this.buffers = [];
        }
        /** @inheritdoc */
        get length() {
            return this.d;
        }
        /** @inheritdoc */
        getRange(start, length) {
            const buf = buffer_1.$Fd.alloc(length);
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
            const offset = this.d;
            let length = data.byteLength;
            if (marker === undefined) {
                this.e(data);
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
            const start = buffer_1.$Fd.fromString(getMarkCode(marker, true));
            const end = buffer_1.$Fd.fromString(getMarkCode(marker, false));
            length += start.byteLength + end.byteLength;
            this.e(start);
            let trimLen = data.byteLength;
            for (; trimLen > 0; trimLen--) {
                const last = data.buffer[trimLen - 1];
                if (last !== 13 /* TrimBytes.CR */ && last !== 10 /* TrimBytes.LF */) {
                    break;
                }
            }
            this.e(data.slice(0, trimLen));
            this.e(end);
            this.e(data.slice(trimLen));
            return { offset, length };
        }
        e(data) {
            if (data.byteLength === 0) {
                return;
            }
            this.buffers.push(data);
            this.a.fire(data);
            this.d += data.byteLength;
        }
        /** Signals the output has ended. */
        end() {
            this.c.complete();
        }
    }
    exports.$Ysb = $Ysb;
    const $Zsb = function* (results, item) {
        for (const id of testId_1.$PI.fromString(item.item.extId).idsToRoot()) {
            yield results.getStateById(id.toString());
        }
    };
    exports.$Zsb = $Zsb;
    const $1sb = (counts) => {
        for (const state of testingStates_1.$Usb) {
            if (counts[state] > 0) {
                return state;
            }
        }
        return 0 /* TestResultState.Unset */;
    };
    exports.$1sb = $1sb;
    const getMarkCode = (marker, start) => `\x1b]633;SetMark;Id=${(0, testTypes_1.$SI)(marker, start)};Hidden\x07`;
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
    class $2sb extends lifecycle_1.$kc {
        /**
         * @inheritdoc
         */
        get completedAt() {
            return this.n;
        }
        /**
         * @inheritdoc
         */
        get tests() {
            return this.j.values();
        }
        constructor(id, persist, request) {
            super();
            this.id = id;
            this.persist = persist;
            this.request = request;
            this.a = this.B(new event_1.$fd());
            this.f = this.B(new event_1.$fd());
            this.g = this.B(new event_1.$fd());
            this.h = this.B(new event_1.$fd());
            /** todo@connor4312: convert to a WellDefinedPrefixTree */
            this.j = new Map();
            this.m = 0;
            this.startedAt = Date.now();
            this.onChange = this.h.event;
            this.onComplete = this.a.event;
            this.onNewTask = this.f.event;
            this.onEndTask = this.g.event;
            this.tasks = [];
            this.name = (0, nls_1.localize)(0, null, new Date().toLocaleString(platform_1.$v));
            /**
             * @inheritdoc
             */
            this.counts = (0, testingStates_1.$Wsb)();
            this.u = {
                getOwnState: i => i.ownComputedState,
                getCurrentComputedState: i => i.computedState,
                setComputedState: (i, s) => i.computedState = s,
                getChildren: i => i.children,
                getParents: i => {
                    const { j: testByExtId } = this;
                    return (function* () {
                        const parentId = testId_1.$PI.fromString(i.item.extId).parentId;
                        if (parentId) {
                            for (const id of parentId.idsToRoot()) {
                                yield testByExtId.get(id.toString());
                            }
                        }
                    })();
                },
            };
            this.D = new lazy_1.$T(() => ({
                id: this.id,
                completedAt: this.completedAt,
                tasks: this.tasks.map(t => ({ id: t.id, name: t.name })),
                name: this.name,
                request: this.request,
                items: [...this.j.values()].map(testTypes_1.TestResultItem.serializeWithoutMessages),
            }));
            this.F = new lazy_1.$T(() => ({
                id: this.id,
                completedAt: this.completedAt,
                tasks: this.tasks.map(t => ({ id: t.id, name: t.name })),
                name: this.name,
                request: this.request,
                items: [...this.j.values()].map(testTypes_1.TestResultItem.serialize),
            }));
        }
        /**
         * @inheritdoc
         */
        getStateById(extTestId) {
            return this.j.get(extTestId);
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
                marker = this.m++;
            }
            const index = this.C(taskId);
            const task = this.tasks[index];
            const { offset, length } = task.output.append(output, marker);
            const message = {
                location,
                message: (0, strings_1.$8e)(preview),
                offset,
                length,
                marker,
                type: 1 /* TestMessageType.Output */,
            };
            const test = testId && this.j.get(testId);
            if (test) {
                test.tasks[index].messages.push(message);
                this.h.fire({ item: test, result: this, reason: 2 /* TestResultItemChangeReason.NewMessage */, message });
            }
            else {
                task.otherMessages.push(message);
            }
        }
        /**
         * Adds a new run task to the results.
         */
        addTask(task) {
            this.tasks.push({ ...task, coverage: this.B(new observableValue_1.$Isb(undefined)), otherMessages: [], output: new $Ysb() });
            for (const test of this.tests) {
                test.tasks.push({ duration: undefined, messages: [], state: 0 /* TestResultState.Unset */ });
            }
            this.f.fire(this.tasks.length - 1);
        }
        /**
         * Add the chain of tests to the run. The first test in the chain should
         * be either a test root, or a previously-known test.
         */
        addTestChainToRun(controllerId, chain) {
            let parent = this.j.get(chain[0].extId);
            if (!parent) { // must be a test root
                parent = this.z(controllerId, chain[0], null);
            }
            for (let i = 1; i < chain.length; i++) {
                parent = this.z(controllerId, chain[i], parent.item.extId);
            }
            return undefined;
        }
        /**
         * Updates the state of the test by its internal ID.
         */
        updateState(testId, taskId, state, duration) {
            const entry = this.j.get(testId);
            if (!entry) {
                return;
            }
            const index = this.C(taskId);
            const oldTerminalStatePrio = testingStates_1.$Vsb[entry.tasks[index].state];
            const newTerminalStatePrio = testingStates_1.$Vsb[state];
            // Ignore requests to set the state from one terminal state back to a
            // "lower" one, e.g. from failed back to passed:
            if (oldTerminalStatePrio !== undefined &&
                (newTerminalStatePrio === undefined || newTerminalStatePrio < oldTerminalStatePrio)) {
                return;
            }
            this.y(entry, index, state, duration);
        }
        /**
         * Appends a message for the test in the run.
         */
        appendMessage(testId, taskId, message) {
            const entry = this.j.get(testId);
            if (!entry) {
                return;
            }
            entry.tasks[this.C(taskId)].messages.push(message);
            this.h.fire({ item: entry, result: this, reason: 2 /* TestResultItemChangeReason.NewMessage */, message });
        }
        /**
         * Marks the task in the test run complete.
         */
        markTaskComplete(taskId) {
            const index = this.C(taskId);
            const task = this.tasks[index];
            task.running = false;
            task.output.end();
            this.w(0 /* TestResultState.Unset */, taskId, t => t.state === 1 /* TestResultState.Queued */ || t.state === 2 /* TestResultState.Running */);
            this.g.fire(index);
        }
        /**
         * Notifies the service that all tests are complete.
         */
        markComplete() {
            if (this.n !== undefined) {
                throw new Error('cannot complete a test result multiple times');
            }
            for (const task of this.tasks) {
                if (task.running) {
                    this.markTaskComplete(task.id);
                }
            }
            this.n = Date.now();
            this.a.fire();
        }
        /**
         * Marks the test and all of its children in the run as retired.
         */
        markRetired(testIds) {
            for (const [id, test] of this.j) {
                if (!test.retired && (!testIds || testIds.hasKeyOrParent(testId_1.$PI.fromString(id).path))) {
                    test.retired = true;
                    this.h.fire({ reason: 0 /* TestResultItemChangeReason.ComputedStateChange */, item: test, result: this });
                }
            }
        }
        /**
         * @inheritdoc
         */
        toJSON() {
            return this.completedAt && this.persist ? this.D.value : undefined;
        }
        toJSONWithMessages() {
            return this.completedAt && this.persist ? this.F.value : undefined;
        }
        /**
         * Updates all tests in the collection to the given state.
         */
        w(state, taskId, when) {
            const index = this.C(taskId);
            for (const test of this.j.values()) {
                if (when(test.tasks[index], test)) {
                    this.y(test, index, state);
                }
            }
        }
        y(entry, taskIndex, newState, newOwnDuration) {
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
            const newOwnComputed = (0, testingStates_1.$Tsb)(...entry.tasks.map(t => t.state));
            if (newOwnComputed === previousOwnComputed) {
                if (newOwnDuration !== previousOwnDuration) {
                    this.h.fire(changeEvent); // fire manually since state change won't do it
                }
                return;
            }
            entry.ownComputedState = newOwnComputed;
            this.counts[previousOwnComputed]--;
            this.counts[newOwnComputed]++;
            (0, getComputedState_1.$Xsb)(this.u, entry).forEach(t => this.h.fire(t === entry ? changeEvent : {
                item: t,
                result: this,
                reason: 0 /* TestResultItemChangeReason.ComputedStateChange */,
            }));
        }
        z(controllerId, item, parent) {
            const node = itemToNode(controllerId, item, parent);
            this.j.set(item.extId, node);
            this.counts[0 /* TestResultState.Unset */]++;
            if (parent) {
                this.j.get(parent)?.children.push(node);
            }
            if (this.tasks.length) {
                for (let i = 0; i < this.tasks.length; i++) {
                    node.tasks.push({ duration: undefined, messages: [], state: 0 /* TestResultState.Unset */ });
                }
            }
            return node;
        }
        C(taskId) {
            const index = this.tasks.findIndex(t => t.id === taskId);
            if (index === -1) {
                throw new Error(`Unknown task ${taskId} in updateState`);
            }
            return index;
        }
    }
    exports.$2sb = $2sb;
    /**
     * Test results hydrated from a previously-serialized test run.
     */
    class $3sb {
        /**
         * @inheritdoc
         */
        get tests() {
            return this.a.values();
        }
        constructor(c, d = true) {
            this.c = c;
            this.d = d;
            /**
             * @inheritdoc
             */
            this.counts = (0, testingStates_1.$Wsb)();
            this.a = new Map();
            this.id = c.id;
            this.completedAt = c.completedAt;
            this.tasks = c.tasks.map((task, i) => ({
                id: task.id,
                name: task.name,
                running: false,
                coverage: (0, observableValue_1.$Hsb)(undefined),
                output: emptyRawOutput,
                otherMessages: []
            }));
            this.name = c.name;
            this.request = c.request;
            for (const item of c.items) {
                const de = testTypes_1.TestResultItem.deserialize(item);
                this.counts[de.ownComputedState]++;
                this.a.set(item.item.extId, de);
            }
        }
        /**
         * @inheritdoc
         */
        getStateById(extTestId) {
            return this.a.get(extTestId);
        }
        /**
         * @inheritdoc
         */
        toJSON() {
            return this.d ? this.c : undefined;
        }
        /**
         * @inheritdoc
         */
        toJSONWithMessages() {
            return this.toJSON();
        }
    }
    exports.$3sb = $3sb;
});
//# sourceMappingURL=testResult.js.map