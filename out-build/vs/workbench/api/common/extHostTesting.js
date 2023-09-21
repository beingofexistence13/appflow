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
define(["require", "exports", "vs/base/common/arraysFind", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/functional", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/types", "vs/base/common/uuid", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTestItem", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testItemCollection", "vs/workbench/contrib/testing/common/testTypes", "vs/workbench/services/extensions/common/extensions"], function (require, exports, arraysFind_1, async_1, buffer_1, cancellation_1, event_1, functional_1, hash_1, lifecycle_1, objects_1, types_1, uuid_1, extHost_protocol_1, extHostRpcService_1, extHostTestItem_1, Convert, extHostTypes_1, testId_1, testItemCollection_1, testTypes_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Rcc = exports.$Qcc = exports.$Pcc = exports.$Occ = void 0;
    let $Occ = class $Occ {
        constructor(rpc, commands, k) {
            this.k = k;
            this.d = new event_1.$fd();
            this.f = new Map();
            this.onResultsChanged = this.d.event;
            this.results = [];
            this.g = rpc.getProxy(extHost_protocol_1.$1J.MainThreadTesting);
            this.j = new TestObservers(this.g);
            this.h = new $Pcc(this.g);
            commands.registerArgumentProcessor({
                processArgument: arg => {
                    switch (arg?.$mid) {
                        case 16 /* MarshalledId.TestItemContext */: {
                            const cast = arg;
                            const targetTest = cast.tests[cast.tests.length - 1].item.extId;
                            const controller = this.f.get(testId_1.$PI.root(targetTest));
                            return controller?.collection.tree.get(targetTest)?.actual ?? (0, extHostTestItem_1.$bM)(arg);
                        }
                        case 18 /* MarshalledId.TestMessageMenuArgs */: {
                            const { extId, message } = arg;
                            return {
                                test: this.f.get(testId_1.$PI.root(extId))?.collection.tree.get(extId)?.actual,
                                message: Convert.TestMessage.to(message),
                            };
                        }
                        default: return arg;
                    }
                }
            });
            commands.registerCommand(false, 'testing.getExplorerSelection', async () => {
                const inner = await commands.executeCommand("_testing.getExplorerSelection" /* TestCommandId.GetExplorerSelection */);
                const lookup = (i) => {
                    const controller = this.f.get(testId_1.$PI.root(i));
                    if (!controller) {
                        return undefined;
                    }
                    return testId_1.$PI.isRoot(i) ? controller.controller : controller.collection.tree.get(i)?.actual;
                };
                return {
                    include: inner?.include.map(lookup).filter(types_1.$rf) || [],
                    exclude: inner?.exclude.map(lookup).filter(types_1.$rf) || [],
                };
            });
        }
        /**
         * Implements vscode.test.registerTestProvider
         */
        createTestController(extension, controllerId, label, refreshHandler) {
            if (this.f.has(controllerId)) {
                throw new Error(`Attempt to insert a duplicate controller with ID "${controllerId}"`);
            }
            const disposable = new lifecycle_1.$jc();
            const collection = disposable.add(new extHostTestItem_1.$eM(controllerId, label, this.k));
            collection.root.label = label;
            const profiles = new Map();
            const proxy = this.g;
            const controller = {
                items: collection.root.children,
                get label() {
                    return label;
                },
                set label(value) {
                    label = value;
                    collection.root.label = value;
                    proxy.$updateController(controllerId, { label });
                },
                get refreshHandler() {
                    return refreshHandler;
                },
                set refreshHandler(value) {
                    refreshHandler = value;
                    proxy.$updateController(controllerId, { canRefresh: !!value });
                },
                get id() {
                    return controllerId;
                },
                createRunProfile: (label, group, runHandler, isDefault, tag, supportsContinuousRun) => {
                    // Derive the profile ID from a hash so that the same profile will tend
                    // to have the same hashes, allowing re-run requests to work across reloads.
                    let profileId = (0, hash_1.$pi)(label);
                    while (profiles.has(profileId)) {
                        profileId++;
                    }
                    return new $Rcc(this.g, profiles, controllerId, profileId, label, group, runHandler, isDefault, tag, supportsContinuousRun);
                },
                createTestItem(id, label, uri) {
                    return new extHostTestItem_1.$cM(controllerId, id, label, uri);
                },
                createTestRun: (request, name, persist = true) => {
                    return this.h.createTestRun(extension, controllerId, collection, request, name, persist);
                },
                invalidateTestResults: items => {
                    if (items === undefined) {
                        this.g.$markTestRetired(undefined);
                    }
                    else {
                        const itemsArr = items instanceof Array ? items : [items];
                        this.g.$markTestRetired(itemsArr.map(i => testId_1.$PI.fromExtHostTestItem(i, controllerId).toString()));
                    }
                },
                set resolveHandler(fn) {
                    collection.resolveHandler = fn;
                },
                get resolveHandler() {
                    return collection.resolveHandler;
                },
                dispose: () => {
                    disposable.dispose();
                },
            };
            proxy.$registerTestController(controllerId, label, !!refreshHandler);
            disposable.add((0, lifecycle_1.$ic)(() => proxy.$unregisterTestController(controllerId)));
            const info = { controller, collection, profiles: profiles, extension };
            this.f.set(controllerId, info);
            disposable.add((0, lifecycle_1.$ic)(() => this.f.delete(controllerId)));
            disposable.add(collection.onDidGenerateDiff(diff => proxy.$publishDiff(controllerId, diff.map(testTypes_1.TestsDiffOp.serialize))));
            return controller;
        }
        /**
         * Implements vscode.test.createTestObserver
         */
        createTestObserver() {
            return this.j.checkout();
        }
        /**
         * Implements vscode.test.runTests
         */
        async runTests(req, token = cancellation_1.CancellationToken.None) {
            const profile = tryGetProfileFromTestRunReq(req);
            if (!profile) {
                throw new Error('The request passed to `vscode.test.runTests` must include a profile');
            }
            const controller = this.f.get(profile.controllerId);
            if (!controller) {
                throw new Error('Controller not found');
            }
            await this.g.$runTests({
                isUiTriggered: false,
                targets: [{
                        testIds: req.include?.map(t => testId_1.$PI.fromExtHostTestItem(t, controller.collection.root.id).toString()) ?? [controller.collection.root.id],
                        profileGroup: profileGroupToBitset[profile.kind],
                        profileId: profile.profileId,
                        controllerId: profile.controllerId,
                    }],
                exclude: req.exclude?.map(t => t.id),
            }, token);
        }
        /**
         * @inheritdoc
         */
        $syncTests() {
            for (const { collection } of this.f.values()) {
                collection.flushDiff();
            }
            return Promise.resolve();
        }
        /**
         * @inheritdoc
         */
        $provideFileCoverage(runId, taskId, token) {
            const coverage = (0, arraysFind_1.$pb)(this.h.trackers, t => t.id === runId ? t.getCoverage(taskId) : undefined);
            return coverage?.provideFileCoverage(token) ?? Promise.resolve([]);
        }
        /**
         * @inheritdoc
         */
        $resolveFileCoverage(runId, taskId, fileIndex, token) {
            const coverage = (0, arraysFind_1.$pb)(this.h.trackers, t => t.id === runId ? t.getCoverage(taskId) : undefined);
            return coverage?.resolveFileCoverage(fileIndex, token) ?? Promise.resolve([]);
        }
        /** @inheritdoc */
        $configureRunProfile(controllerId, profileId) {
            this.f.get(controllerId)?.profiles.get(profileId)?.configureHandler?.();
        }
        /** @inheritdoc */
        async $refreshTests(controllerId, token) {
            await this.f.get(controllerId)?.controller.refreshHandler?.(token);
        }
        /**
         * Updates test results shown to extensions.
         * @override
         */
        $publishTestResults(results) {
            this.results = Object.freeze(results
                .map(r => (0, objects_1.$Wm)(Convert.TestResults.to(r)))
                .concat(this.results)
                .sort((a, b) => b.completedAt - a.completedAt)
                .slice(0, 32));
            this.d.fire();
        }
        /**
         * Expands the nodes in the test tree. If levels is less than zero, it will
         * be treated as infinite.
         */
        async $expandTest(testId, levels) {
            const collection = this.f.get(testId_1.$PI.fromString(testId).controllerId)?.collection;
            if (collection) {
                await collection.expand(testId, levels < 0 ? Infinity : levels);
                collection.flushDiff();
            }
        }
        /**
         * Receives a test update from the main thread. Called (eventually) whenever
         * tests change.
         */
        $acceptDiff(diff) {
            this.j.applyDiff(diff.map(testTypes_1.TestsDiffOp.deserialize));
        }
        /**
         * Runs tests with the given set of IDs. Allows for test from multiple
         * providers to be run.
         * @inheritdoc
         */
        async $runControllerTests(reqs, token) {
            return Promise.all(reqs.map(req => this.l(req, false, token)));
        }
        /**
         * Starts continuous test runs with the given set of IDs. Allows for test from
         * multiple providers to be run.
         * @inheritdoc
         */
        async $startContinuousRun(reqs, token) {
            const cts = new cancellation_1.$pd(token);
            const res = await Promise.all(reqs.map(req => this.l(req, true, cts.token)));
            // avoid returning until cancellation is requested, otherwise ipc disposes of the token
            if (!token.isCancellationRequested && !res.some(r => r.error)) {
                await new Promise(r => token.onCancellationRequested(r));
            }
            cts.dispose(true);
            return res;
        }
        async l(req, isContinuous, token) {
            const lookup = this.f.get(req.controllerId);
            if (!lookup) {
                return {};
            }
            const { collection, profiles, extension } = lookup;
            const profile = profiles.get(req.profileId);
            if (!profile) {
                return {};
            }
            const includeTests = req.testIds
                .map((testId) => collection.tree.get(testId))
                .filter(types_1.$rf);
            const excludeTests = req.excludeExtIds
                .map(id => lookup.collection.tree.get(id))
                .filter(types_1.$rf)
                .filter(exclude => includeTests.some(include => include.fullId.compare(exclude.fullId) === 2 /* TestPosition.IsChild */));
            if (!includeTests.length) {
                return {};
            }
            const publicReq = new extHostTypes_1.$yL(includeTests.some(i => i.actual instanceof extHostTestItem_1.$dM) ? undefined : includeTests.map(t => t.actual), excludeTests.map(t => t.actual), profile, isContinuous);
            const tracker = (0, testTypes_1.$RI)(req) && this.h.prepareForMainThreadTestRun(publicReq, $Qcc.fromInternal(req, lookup.collection), extension, token);
            try {
                await profile.runHandler(publicReq, token);
                return {};
            }
            catch (e) {
                return { error: String(e) };
            }
            finally {
                if (tracker) {
                    if (tracker.hasRunningTasks && !token.isCancellationRequested) {
                        await event_1.Event.toPromise(tracker.onEnd);
                    }
                    tracker.dispose();
                }
            }
        }
        /**
         * Cancels an ongoing test run.
         */
        $cancelExtensionTestRun(runId) {
            if (runId === undefined) {
                this.h.cancelAllRuns();
            }
            else {
                this.h.cancelRunById(runId);
            }
        }
    };
    exports.$Occ = $Occ;
    exports.$Occ = $Occ = __decorate([
        __param(0, extHostRpcService_1.$2L)
    ], $Occ);
    // Deadline after being requested by a user that a test run is forcibly cancelled.
    const RUN_CANCEL_DEADLINE = 10000;
    var TestRunTrackerState;
    (function (TestRunTrackerState) {
        // Default state
        TestRunTrackerState[TestRunTrackerState["Running"] = 0] = "Running";
        // Cancellation is requested, but the run is still going.
        TestRunTrackerState[TestRunTrackerState["Cancelling"] = 1] = "Cancelling";
        // All tasks have ended
        TestRunTrackerState[TestRunTrackerState["Ended"] = 2] = "Ended";
    })(TestRunTrackerState || (TestRunTrackerState = {}));
    class TestRunTracker extends lifecycle_1.$kc {
        /**
         * Gets whether there are any tests running.
         */
        get hasRunningTasks() {
            return this.g.size > 0;
        }
        /**
         * Gets the run ID.
         */
        get id() {
            return this.s.id;
        }
        constructor(s, u, w, parentToken) {
            super();
            this.s = s;
            this.u = u;
            this.w = w;
            this.f = 0 /* TestRunTrackerState.Running */;
            this.g = new Map();
            this.h = new Set();
            this.m = this.B(new event_1.$fd());
            /**
             * Fires when a test ends, and no more tests are left running.
             */
            this.onEnd = this.m.event;
            this.j = this.B(new cancellation_1.$pd(parentToken));
            const forciblyEnd = this.B(new async_1.$Sg(() => this.y(), RUN_CANCEL_DEADLINE));
            this.B(this.j.token.onCancellationRequested(() => forciblyEnd.schedule()));
        }
        /** Requests cancellation of the run. On the second call, forces cancellation. */
        cancel() {
            if (this.f === 0 /* TestRunTrackerState.Running */) {
                this.j.cancel();
                this.f = 1 /* TestRunTrackerState.Cancelling */;
            }
            else if (this.f === 1 /* TestRunTrackerState.Cancelling */) {
                this.y();
            }
        }
        /** Gets coverage for a task ID. */
        getCoverage(taskId) {
            return this.g.get(taskId)?.coverage;
        }
        /** Creates the public test run interface to give to extensions. */
        createRun(name) {
            const runId = this.s.id;
            const ctrlId = this.s.controllerId;
            const taskId = (0, uuid_1.$4f)();
            const coverage = new TestRunCoverageBearer(this.u, runId, taskId);
            const guardTestMutation = (fn) => (test, ...args) => {
                if (ended) {
                    console.warn(`Setting the state of test "${test.id}" is a no-op after the run ends.`);
                    return;
                }
                if (!this.s.isIncluded(test)) {
                    return;
                }
                this.C(test);
                fn(test, ...args);
            };
            const appendMessages = (test, messages) => {
                const converted = messages instanceof Array
                    ? messages.map(Convert.TestMessage.from)
                    : [Convert.TestMessage.from(messages)];
                if (converted.some(c => c.contextValue !== undefined)) {
                    (0, extensions_1.$QF)(this.w, 'testMessageContextValue');
                }
                if (test.uri && test.range) {
                    const defaultLocation = { range: Convert.Range.from(test.range), uri: test.uri };
                    for (const message of converted) {
                        message.location = message.location || defaultLocation;
                    }
                }
                this.u.$appendTestMessagesInRun(runId, taskId, testId_1.$PI.fromExtHostTestItem(test, ctrlId).toString(), converted);
            };
            let ended = false;
            const run = {
                isPersisted: this.s.isPersisted,
                token: this.j.token,
                name,
                get coverageProvider() {
                    return coverage.coverageProvider;
                },
                set coverageProvider(provider) {
                    coverage.coverageProvider = provider;
                },
                //#region state mutation
                enqueued: guardTestMutation(test => {
                    this.u.$updateTestStateInRun(runId, taskId, testId_1.$PI.fromExtHostTestItem(test, ctrlId).toString(), 1 /* TestResultState.Queued */);
                }),
                skipped: guardTestMutation(test => {
                    this.u.$updateTestStateInRun(runId, taskId, testId_1.$PI.fromExtHostTestItem(test, ctrlId).toString(), 5 /* TestResultState.Skipped */);
                }),
                started: guardTestMutation(test => {
                    this.u.$updateTestStateInRun(runId, taskId, testId_1.$PI.fromExtHostTestItem(test, ctrlId).toString(), 2 /* TestResultState.Running */);
                }),
                errored: guardTestMutation((test, messages, duration) => {
                    appendMessages(test, messages);
                    this.u.$updateTestStateInRun(runId, taskId, testId_1.$PI.fromExtHostTestItem(test, ctrlId).toString(), 6 /* TestResultState.Errored */, duration);
                }),
                failed: guardTestMutation((test, messages, duration) => {
                    appendMessages(test, messages);
                    this.u.$updateTestStateInRun(runId, taskId, testId_1.$PI.fromExtHostTestItem(test, ctrlId).toString(), 4 /* TestResultState.Failed */, duration);
                }),
                passed: guardTestMutation((test, duration) => {
                    this.u.$updateTestStateInRun(runId, taskId, testId_1.$PI.fromExtHostTestItem(test, this.s.controllerId).toString(), 3 /* TestResultState.Passed */, duration);
                }),
                //#endregion
                appendOutput: (output, location, test) => {
                    if (ended) {
                        return;
                    }
                    if (test) {
                        if (this.s.isIncluded(test)) {
                            this.C(test);
                        }
                        else {
                            test = undefined;
                        }
                    }
                    this.u.$appendOutputToRun(runId, taskId, buffer_1.$Fd.fromString(output), location && Convert.location.from(location), test && testId_1.$PI.fromExtHostTestItem(test, ctrlId).toString());
                },
                end: () => {
                    if (ended) {
                        return;
                    }
                    ended = true;
                    this.u.$finishedTestRunTask(runId, taskId);
                    this.g.delete(taskId);
                    if (!this.g.size) {
                        this.z();
                    }
                }
            };
            this.g.set(taskId, { run, coverage });
            this.u.$startedTestRunTask(runId, { id: taskId, name, running: true });
            return run;
        }
        y() {
            for (const { run } of this.g.values()) {
                run.end();
            }
        }
        z() {
            if (this.f !== 2 /* TestRunTrackerState.Ended */) {
                this.f = 2 /* TestRunTrackerState.Ended */;
                this.m.fire();
            }
        }
        C(test) {
            if (!(test instanceof extHostTestItem_1.$cM)) {
                throw new testItemCollection_1.$TL(test.id);
            }
            if (this.h.has(testId_1.$PI.fromExtHostTestItem(test, this.s.controllerId).toString())) {
                return;
            }
            const chain = [];
            const root = this.s.colllection.root;
            while (true) {
                const converted = Convert.TestItem.from(test);
                chain.unshift(converted);
                if (this.h.has(converted.extId)) {
                    break;
                }
                this.h.add(converted.extId);
                if (test === root) {
                    break;
                }
                test = test.parent || root;
            }
            this.u.$addTestsToRun(this.s.controllerId, this.s.id, chain);
        }
        dispose() {
            this.z();
            super.dispose();
        }
    }
    /**
     * Queues runs for a single extension and provides the currently-executing
     * run so that `createTestRun` can be properly correlated.
     */
    class $Pcc {
        get trackers() {
            return this.d.values();
        }
        constructor(f) {
            this.f = f;
            this.d = new Map();
        }
        /**
         * Registers a request as being invoked by the main thread, so
         * `$startedExtensionTestRun` is not invoked. The run must eventually
         * be cancelled manually.
         */
        prepareForMainThreadTestRun(req, dto, extension, token) {
            return this.g(req, dto, extension, token);
        }
        /**
         * Cancels an existing test run via its cancellation token.
         */
        cancelRunById(runId) {
            for (const tracker of this.d.values()) {
                if (tracker.id === runId) {
                    tracker.cancel();
                    return;
                }
            }
        }
        /**
         * Cancels an existing test run via its cancellation token.
         */
        cancelAllRuns() {
            for (const tracker of this.d.values()) {
                tracker.cancel();
            }
        }
        /**
         * Implements the public `createTestRun` API.
         */
        createTestRun(extension, controllerId, collection, request, name, persist) {
            const existing = this.d.get(request);
            if (existing) {
                return existing.createRun(name);
            }
            // If there is not an existing tracked extension for the request, start
            // a new, detached session.
            const dto = $Qcc.fromPublic(controllerId, collection, request, persist);
            const profile = tryGetProfileFromTestRunReq(request);
            this.f.$startedExtensionTestRun({
                controllerId,
                continuous: !!request.continuous,
                profile: profile && { group: profileGroupToBitset[profile.kind], id: profile.profileId },
                exclude: request.exclude?.map(t => testId_1.$PI.fromExtHostTestItem(t, collection.root.id).toString()) ?? [],
                id: dto.id,
                include: request.include?.map(t => testId_1.$PI.fromExtHostTestItem(t, collection.root.id).toString()) ?? [collection.root.id],
                persist
            });
            const tracker = this.g(request, dto, extension);
            event_1.Event.once(tracker.onEnd)(() => {
                this.f.$finishedExtensionTestRun(dto.id);
                tracker.dispose();
            });
            return tracker.createRun(name);
        }
        g(req, dto, extension, token) {
            const tracker = new TestRunTracker(dto, this.f, extension, token);
            this.d.set(req, tracker);
            event_1.Event.once(tracker.onEnd)(() => this.d.delete(req));
            return tracker;
        }
    }
    exports.$Pcc = $Pcc;
    const tryGetProfileFromTestRunReq = (request) => {
        if (!request.profile) {
            return undefined;
        }
        if (!(request.profile instanceof $Rcc)) {
            throw new Error(`TestRunRequest.profile is not an instance created from TestController.createRunProfile`);
        }
        return request.profile;
    };
    class $Qcc {
        static fromPublic(controllerId, collection, request, persist) {
            return new $Qcc(controllerId, (0, uuid_1.$4f)(), request.include?.map(t => testId_1.$PI.fromExtHostTestItem(t, controllerId).toString()) ?? [controllerId], request.exclude?.map(t => testId_1.$PI.fromExtHostTestItem(t, controllerId).toString()) ?? [], persist, collection);
        }
        static fromInternal(request, collection) {
            return new $Qcc(request.controllerId, request.runId, request.testIds, request.excludeExtIds, true, collection);
        }
        constructor(controllerId, id, include, exclude, isPersisted, colllection) {
            this.controllerId = controllerId;
            this.id = id;
            this.isPersisted = isPersisted;
            this.colllection = colllection;
            this.d = include.map(id => id + "\0" /* TestIdPathParts.Delimiter */);
            this.f = exclude.map(id => id + "\0" /* TestIdPathParts.Delimiter */);
        }
        isIncluded(test) {
            const id = testId_1.$PI.fromExtHostTestItem(test, this.controllerId).toString() + "\0" /* TestIdPathParts.Delimiter */;
            for (const prefix of this.f) {
                if (id === prefix || id.startsWith(prefix)) {
                    return false;
                }
            }
            for (const prefix of this.d) {
                if (id === prefix || id.startsWith(prefix)) {
                    return true;
                }
            }
            return false;
        }
    }
    exports.$Qcc = $Qcc;
    class TestRunCoverageBearer {
        set coverageProvider(provider) {
            if (this.d) {
                throw new Error('The TestCoverageProvider cannot be replaced after being provided');
            }
            if (!provider) {
                return;
            }
            this.d = provider;
            this.g.$signalCoverageAvailable(this.h, this.j);
        }
        get coverageProvider() {
            return this.d;
        }
        constructor(g, h, j) {
            this.g = g;
            this.h = h;
            this.j = j;
        }
        async provideFileCoverage(token) {
            if (!this.d) {
                return [];
            }
            if (!this.f) {
                this.f = (async () => this.d.provideFileCoverage(token))();
            }
            try {
                const coverage = await this.f;
                return coverage?.map(Convert.TestCoverage.fromFile) ?? [];
            }
            catch (e) {
                this.f = undefined;
                throw e;
            }
        }
        async resolveFileCoverage(index, token) {
            const fileCoverage = await this.f;
            let file = fileCoverage?.[index];
            if (!this.d || !fileCoverage || !file) {
                return [];
            }
            if (!file.detailedCoverage) {
                file = fileCoverage[index] = await this.d.resolveFileCoverage?.(file, token) ?? file;
            }
            return file.detailedCoverage?.map(Convert.TestCoverage.fromDetailed) ?? [];
        }
    }
    class MirroredChangeCollector {
        get isEmpty() {
            return this.d.size === 0 && this.g.size === 0 && this.f.size === 0;
        }
        constructor(j) {
            this.j = j;
            this.d = new Set();
            this.f = new Set();
            this.g = new Set();
            this.h = new Set();
        }
        /**
         * @inheritdoc
         */
        add(node) {
            this.d.add(node);
        }
        /**
         * @inheritdoc
         */
        update(node) {
            Object.assign(node.revived, Convert.TestItem.toPlain(node.item));
            if (!this.d.has(node)) {
                this.f.add(node);
            }
        }
        /**
         * @inheritdoc
         */
        remove(node) {
            if (this.d.has(node)) {
                this.d.delete(node);
                return;
            }
            this.f.delete(node);
            const parentId = testId_1.$PI.parentId(node.item.extId);
            if (parentId && this.h.has(parentId.toString())) {
                this.h.add(node.item.extId);
                return;
            }
            this.g.add(node);
        }
        /**
         * @inheritdoc
         */
        getChangeEvent() {
            const { d: added, f: updated, g: removed } = this;
            return {
                get added() { return [...added].map(n => n.revived); },
                get updated() { return [...updated].map(n => n.revived); },
                get removed() { return [...removed].map(n => n.revived); },
            };
        }
        complete() {
            if (!this.isEmpty) {
                this.j.fire(this.getChangeEvent());
            }
        }
    }
    /**
     * Maintains tests in this extension host sent from the main thread.
     * @private
     */
    class MirroredTestCollection extends testTypes_1.$WI {
        constructor() {
            super(...arguments);
            this.s = new event_1.$fd();
            /**
             * Change emitter that fires with the same semantics as `TestObserver.onDidChangeTests`.
             */
            this.onDidChangeTests = this.s.event;
        }
        /**
         * Gets a list of root test items.
         */
        get rootTests() {
            return super.g;
        }
        /**
         *
         * If the test ID exists, returns its underlying ID.
         */
        getMirroredTestDataById(itemId) {
            return this.f.get(itemId);
        }
        /**
         * If the test item is a mirrored test item, returns its underlying ID.
         */
        getMirroredTestDataByReference(item) {
            return this.f.get(item.id);
        }
        /**
         * @override
         */
        q(item, parent) {
            return {
                ...item,
                // todo@connor4312: make this work well again with children
                revived: Convert.TestItem.toPlain(item.item),
                depth: parent ? parent.depth + 1 : 0,
                children: new Set(),
            };
        }
        /**
         * @override
         */
        p() {
            return new MirroredChangeCollector(this.s);
        }
    }
    class TestObservers {
        constructor(f) {
            this.f = f;
        }
        checkout() {
            if (!this.d) {
                this.d = this.g();
            }
            const current = this.d;
            current.observers++;
            return {
                onDidChangeTest: current.tests.onDidChangeTests,
                get tests() { return [...current.tests.rootTests].map(t => t.revived); },
                dispose: (0, functional_1.$bb)(() => {
                    if (--current.observers === 0) {
                        this.f.$unsubscribeFromDiffs();
                        this.d = undefined;
                    }
                }),
            };
        }
        /**
         * Gets the internal test data by its reference.
         */
        getMirroredTestDataByReference(ref) {
            return this.d?.tests.getMirroredTestDataByReference(ref);
        }
        /**
         * Applies test diffs to the current set of observed tests.
         */
        applyDiff(diff) {
            this.d?.tests.apply(diff);
        }
        g() {
            const tests = new MirroredTestCollection();
            this.f.$subscribeToDiffs();
            return { observers: 0, tests, };
        }
    }
    class $Rcc {
        #proxy;
        #profiles;
        get label() {
            return this.f;
        }
        set label(label) {
            if (label !== this.f) {
                this.f = label;
                this.#proxy.$updateTestRunConfig(this.controllerId, this.profileId, { label });
            }
        }
        get supportsContinuousRun() {
            return this.h;
        }
        set supportsContinuousRun(supports) {
            if (supports !== this.h) {
                this.h = supports;
                this.#proxy.$updateTestRunConfig(this.controllerId, this.profileId, { supportsContinuousRun: supports });
            }
        }
        get isDefault() {
            return this.g;
        }
        set isDefault(isDefault) {
            if (isDefault !== this.g) {
                this.g = isDefault;
                this.#proxy.$updateTestRunConfig(this.controllerId, this.profileId, { isDefault });
            }
        }
        get tag() {
            return this._tag;
        }
        set tag(tag) {
            if (tag?.id !== this._tag?.id) {
                this._tag = tag;
                this.#proxy.$updateTestRunConfig(this.controllerId, this.profileId, {
                    tag: tag ? Convert.TestTag.namespace(this.controllerId, tag.id) : null,
                });
            }
        }
        get configureHandler() {
            return this.d;
        }
        set configureHandler(handler) {
            if (handler !== this.d) {
                this.d = handler;
                this.#proxy.$updateTestRunConfig(this.controllerId, this.profileId, { hasConfigurationHandler: !!handler });
            }
        }
        constructor(proxy, profiles, controllerId, profileId, f, kind, runHandler, g = false, _tag = undefined, h = false) {
            this.controllerId = controllerId;
            this.profileId = profileId;
            this.f = f;
            this.kind = kind;
            this.runHandler = runHandler;
            this.g = g;
            this._tag = _tag;
            this.h = h;
            this.#proxy = proxy;
            this.#profiles = profiles;
            profiles.set(profileId, this);
            const groupBitset = profileGroupToBitset[kind];
            if (typeof groupBitset !== 'number') {
                throw new Error(`Unknown TestRunProfile.group ${kind}`);
            }
            this.#proxy.$publishTestRunProfile({
                profileId: profileId,
                controllerId,
                tag: _tag ? Convert.TestTag.namespace(this.controllerId, _tag.id) : null,
                label: f,
                group: groupBitset,
                isDefault: g,
                hasConfigurationHandler: false,
                supportsContinuousRun: h,
            });
        }
        dispose() {
            if (this.#profiles?.delete(this.profileId)) {
                this.#profiles = undefined;
                this.#proxy.$removeTestProfile(this.controllerId, this.profileId);
            }
        }
    }
    exports.$Rcc = $Rcc;
    const profileGroupToBitset = {
        [extHostTypes_1.TestRunProfileKind.Coverage]: 8 /* TestRunProfileBitset.Coverage */,
        [extHostTypes_1.TestRunProfileKind.Debug]: 4 /* TestRunProfileBitset.Debug */,
        [extHostTypes_1.TestRunProfileKind.Run]: 2 /* TestRunProfileBitset.Run */,
    };
});
//# sourceMappingURL=extHostTesting.js.map