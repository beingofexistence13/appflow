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
    exports.TestRunProfileImpl = exports.TestRunDto = exports.TestRunCoordinator = exports.ExtHostTesting = void 0;
    let ExtHostTesting = class ExtHostTesting {
        constructor(rpc, commands, editors) {
            this.editors = editors;
            this.resultsChangedEmitter = new event_1.Emitter();
            this.controllers = new Map();
            this.onResultsChanged = this.resultsChangedEmitter.event;
            this.results = [];
            this.proxy = rpc.getProxy(extHost_protocol_1.MainContext.MainThreadTesting);
            this.observer = new TestObservers(this.proxy);
            this.runTracker = new TestRunCoordinator(this.proxy);
            commands.registerArgumentProcessor({
                processArgument: arg => {
                    switch (arg?.$mid) {
                        case 16 /* MarshalledId.TestItemContext */: {
                            const cast = arg;
                            const targetTest = cast.tests[cast.tests.length - 1].item.extId;
                            const controller = this.controllers.get(testId_1.TestId.root(targetTest));
                            return controller?.collection.tree.get(targetTest)?.actual ?? (0, extHostTestItem_1.toItemFromContext)(arg);
                        }
                        case 18 /* MarshalledId.TestMessageMenuArgs */: {
                            const { extId, message } = arg;
                            return {
                                test: this.controllers.get(testId_1.TestId.root(extId))?.collection.tree.get(extId)?.actual,
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
                    const controller = this.controllers.get(testId_1.TestId.root(i));
                    if (!controller) {
                        return undefined;
                    }
                    return testId_1.TestId.isRoot(i) ? controller.controller : controller.collection.tree.get(i)?.actual;
                };
                return {
                    include: inner?.include.map(lookup).filter(types_1.isDefined) || [],
                    exclude: inner?.exclude.map(lookup).filter(types_1.isDefined) || [],
                };
            });
        }
        /**
         * Implements vscode.test.registerTestProvider
         */
        createTestController(extension, controllerId, label, refreshHandler) {
            if (this.controllers.has(controllerId)) {
                throw new Error(`Attempt to insert a duplicate controller with ID "${controllerId}"`);
            }
            const disposable = new lifecycle_1.DisposableStore();
            const collection = disposable.add(new extHostTestItem_1.ExtHostTestItemCollection(controllerId, label, this.editors));
            collection.root.label = label;
            const profiles = new Map();
            const proxy = this.proxy;
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
                    let profileId = (0, hash_1.hash)(label);
                    while (profiles.has(profileId)) {
                        profileId++;
                    }
                    return new TestRunProfileImpl(this.proxy, profiles, controllerId, profileId, label, group, runHandler, isDefault, tag, supportsContinuousRun);
                },
                createTestItem(id, label, uri) {
                    return new extHostTestItem_1.TestItemImpl(controllerId, id, label, uri);
                },
                createTestRun: (request, name, persist = true) => {
                    return this.runTracker.createTestRun(extension, controllerId, collection, request, name, persist);
                },
                invalidateTestResults: items => {
                    if (items === undefined) {
                        this.proxy.$markTestRetired(undefined);
                    }
                    else {
                        const itemsArr = items instanceof Array ? items : [items];
                        this.proxy.$markTestRetired(itemsArr.map(i => testId_1.TestId.fromExtHostTestItem(i, controllerId).toString()));
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
            disposable.add((0, lifecycle_1.toDisposable)(() => proxy.$unregisterTestController(controllerId)));
            const info = { controller, collection, profiles: profiles, extension };
            this.controllers.set(controllerId, info);
            disposable.add((0, lifecycle_1.toDisposable)(() => this.controllers.delete(controllerId)));
            disposable.add(collection.onDidGenerateDiff(diff => proxy.$publishDiff(controllerId, diff.map(testTypes_1.TestsDiffOp.serialize))));
            return controller;
        }
        /**
         * Implements vscode.test.createTestObserver
         */
        createTestObserver() {
            return this.observer.checkout();
        }
        /**
         * Implements vscode.test.runTests
         */
        async runTests(req, token = cancellation_1.CancellationToken.None) {
            const profile = tryGetProfileFromTestRunReq(req);
            if (!profile) {
                throw new Error('The request passed to `vscode.test.runTests` must include a profile');
            }
            const controller = this.controllers.get(profile.controllerId);
            if (!controller) {
                throw new Error('Controller not found');
            }
            await this.proxy.$runTests({
                isUiTriggered: false,
                targets: [{
                        testIds: req.include?.map(t => testId_1.TestId.fromExtHostTestItem(t, controller.collection.root.id).toString()) ?? [controller.collection.root.id],
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
            for (const { collection } of this.controllers.values()) {
                collection.flushDiff();
            }
            return Promise.resolve();
        }
        /**
         * @inheritdoc
         */
        $provideFileCoverage(runId, taskId, token) {
            const coverage = (0, arraysFind_1.mapFindFirst)(this.runTracker.trackers, t => t.id === runId ? t.getCoverage(taskId) : undefined);
            return coverage?.provideFileCoverage(token) ?? Promise.resolve([]);
        }
        /**
         * @inheritdoc
         */
        $resolveFileCoverage(runId, taskId, fileIndex, token) {
            const coverage = (0, arraysFind_1.mapFindFirst)(this.runTracker.trackers, t => t.id === runId ? t.getCoverage(taskId) : undefined);
            return coverage?.resolveFileCoverage(fileIndex, token) ?? Promise.resolve([]);
        }
        /** @inheritdoc */
        $configureRunProfile(controllerId, profileId) {
            this.controllers.get(controllerId)?.profiles.get(profileId)?.configureHandler?.();
        }
        /** @inheritdoc */
        async $refreshTests(controllerId, token) {
            await this.controllers.get(controllerId)?.controller.refreshHandler?.(token);
        }
        /**
         * Updates test results shown to extensions.
         * @override
         */
        $publishTestResults(results) {
            this.results = Object.freeze(results
                .map(r => (0, objects_1.deepFreeze)(Convert.TestResults.to(r)))
                .concat(this.results)
                .sort((a, b) => b.completedAt - a.completedAt)
                .slice(0, 32));
            this.resultsChangedEmitter.fire();
        }
        /**
         * Expands the nodes in the test tree. If levels is less than zero, it will
         * be treated as infinite.
         */
        async $expandTest(testId, levels) {
            const collection = this.controllers.get(testId_1.TestId.fromString(testId).controllerId)?.collection;
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
            this.observer.applyDiff(diff.map(testTypes_1.TestsDiffOp.deserialize));
        }
        /**
         * Runs tests with the given set of IDs. Allows for test from multiple
         * providers to be run.
         * @inheritdoc
         */
        async $runControllerTests(reqs, token) {
            return Promise.all(reqs.map(req => this.runControllerTestRequest(req, false, token)));
        }
        /**
         * Starts continuous test runs with the given set of IDs. Allows for test from
         * multiple providers to be run.
         * @inheritdoc
         */
        async $startContinuousRun(reqs, token) {
            const cts = new cancellation_1.CancellationTokenSource(token);
            const res = await Promise.all(reqs.map(req => this.runControllerTestRequest(req, true, cts.token)));
            // avoid returning until cancellation is requested, otherwise ipc disposes of the token
            if (!token.isCancellationRequested && !res.some(r => r.error)) {
                await new Promise(r => token.onCancellationRequested(r));
            }
            cts.dispose(true);
            return res;
        }
        async runControllerTestRequest(req, isContinuous, token) {
            const lookup = this.controllers.get(req.controllerId);
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
                .filter(types_1.isDefined);
            const excludeTests = req.excludeExtIds
                .map(id => lookup.collection.tree.get(id))
                .filter(types_1.isDefined)
                .filter(exclude => includeTests.some(include => include.fullId.compare(exclude.fullId) === 2 /* TestPosition.IsChild */));
            if (!includeTests.length) {
                return {};
            }
            const publicReq = new extHostTypes_1.TestRunRequest(includeTests.some(i => i.actual instanceof extHostTestItem_1.TestItemRootImpl) ? undefined : includeTests.map(t => t.actual), excludeTests.map(t => t.actual), profile, isContinuous);
            const tracker = (0, testTypes_1.isStartControllerTests)(req) && this.runTracker.prepareForMainThreadTestRun(publicReq, TestRunDto.fromInternal(req, lookup.collection), extension, token);
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
                this.runTracker.cancelAllRuns();
            }
            else {
                this.runTracker.cancelRunById(runId);
            }
        }
    };
    exports.ExtHostTesting = ExtHostTesting;
    exports.ExtHostTesting = ExtHostTesting = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService)
    ], ExtHostTesting);
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
    class TestRunTracker extends lifecycle_1.Disposable {
        /**
         * Gets whether there are any tests running.
         */
        get hasRunningTasks() {
            return this.tasks.size > 0;
        }
        /**
         * Gets the run ID.
         */
        get id() {
            return this.dto.id;
        }
        constructor(dto, proxy, extension, parentToken) {
            super();
            this.dto = dto;
            this.proxy = proxy;
            this.extension = extension;
            this.state = 0 /* TestRunTrackerState.Running */;
            this.tasks = new Map();
            this.sharedTestIds = new Set();
            this.endEmitter = this._register(new event_1.Emitter());
            /**
             * Fires when a test ends, and no more tests are left running.
             */
            this.onEnd = this.endEmitter.event;
            this.cts = this._register(new cancellation_1.CancellationTokenSource(parentToken));
            const forciblyEnd = this._register(new async_1.RunOnceScheduler(() => this.forciblyEndTasks(), RUN_CANCEL_DEADLINE));
            this._register(this.cts.token.onCancellationRequested(() => forciblyEnd.schedule()));
        }
        /** Requests cancellation of the run. On the second call, forces cancellation. */
        cancel() {
            if (this.state === 0 /* TestRunTrackerState.Running */) {
                this.cts.cancel();
                this.state = 1 /* TestRunTrackerState.Cancelling */;
            }
            else if (this.state === 1 /* TestRunTrackerState.Cancelling */) {
                this.forciblyEndTasks();
            }
        }
        /** Gets coverage for a task ID. */
        getCoverage(taskId) {
            return this.tasks.get(taskId)?.coverage;
        }
        /** Creates the public test run interface to give to extensions. */
        createRun(name) {
            const runId = this.dto.id;
            const ctrlId = this.dto.controllerId;
            const taskId = (0, uuid_1.generateUuid)();
            const coverage = new TestRunCoverageBearer(this.proxy, runId, taskId);
            const guardTestMutation = (fn) => (test, ...args) => {
                if (ended) {
                    console.warn(`Setting the state of test "${test.id}" is a no-op after the run ends.`);
                    return;
                }
                if (!this.dto.isIncluded(test)) {
                    return;
                }
                this.ensureTestIsKnown(test);
                fn(test, ...args);
            };
            const appendMessages = (test, messages) => {
                const converted = messages instanceof Array
                    ? messages.map(Convert.TestMessage.from)
                    : [Convert.TestMessage.from(messages)];
                if (converted.some(c => c.contextValue !== undefined)) {
                    (0, extensions_1.checkProposedApiEnabled)(this.extension, 'testMessageContextValue');
                }
                if (test.uri && test.range) {
                    const defaultLocation = { range: Convert.Range.from(test.range), uri: test.uri };
                    for (const message of converted) {
                        message.location = message.location || defaultLocation;
                    }
                }
                this.proxy.$appendTestMessagesInRun(runId, taskId, testId_1.TestId.fromExtHostTestItem(test, ctrlId).toString(), converted);
            };
            let ended = false;
            const run = {
                isPersisted: this.dto.isPersisted,
                token: this.cts.token,
                name,
                get coverageProvider() {
                    return coverage.coverageProvider;
                },
                set coverageProvider(provider) {
                    coverage.coverageProvider = provider;
                },
                //#region state mutation
                enqueued: guardTestMutation(test => {
                    this.proxy.$updateTestStateInRun(runId, taskId, testId_1.TestId.fromExtHostTestItem(test, ctrlId).toString(), 1 /* TestResultState.Queued */);
                }),
                skipped: guardTestMutation(test => {
                    this.proxy.$updateTestStateInRun(runId, taskId, testId_1.TestId.fromExtHostTestItem(test, ctrlId).toString(), 5 /* TestResultState.Skipped */);
                }),
                started: guardTestMutation(test => {
                    this.proxy.$updateTestStateInRun(runId, taskId, testId_1.TestId.fromExtHostTestItem(test, ctrlId).toString(), 2 /* TestResultState.Running */);
                }),
                errored: guardTestMutation((test, messages, duration) => {
                    appendMessages(test, messages);
                    this.proxy.$updateTestStateInRun(runId, taskId, testId_1.TestId.fromExtHostTestItem(test, ctrlId).toString(), 6 /* TestResultState.Errored */, duration);
                }),
                failed: guardTestMutation((test, messages, duration) => {
                    appendMessages(test, messages);
                    this.proxy.$updateTestStateInRun(runId, taskId, testId_1.TestId.fromExtHostTestItem(test, ctrlId).toString(), 4 /* TestResultState.Failed */, duration);
                }),
                passed: guardTestMutation((test, duration) => {
                    this.proxy.$updateTestStateInRun(runId, taskId, testId_1.TestId.fromExtHostTestItem(test, this.dto.controllerId).toString(), 3 /* TestResultState.Passed */, duration);
                }),
                //#endregion
                appendOutput: (output, location, test) => {
                    if (ended) {
                        return;
                    }
                    if (test) {
                        if (this.dto.isIncluded(test)) {
                            this.ensureTestIsKnown(test);
                        }
                        else {
                            test = undefined;
                        }
                    }
                    this.proxy.$appendOutputToRun(runId, taskId, buffer_1.VSBuffer.fromString(output), location && Convert.location.from(location), test && testId_1.TestId.fromExtHostTestItem(test, ctrlId).toString());
                },
                end: () => {
                    if (ended) {
                        return;
                    }
                    ended = true;
                    this.proxy.$finishedTestRunTask(runId, taskId);
                    this.tasks.delete(taskId);
                    if (!this.tasks.size) {
                        this.markEnded();
                    }
                }
            };
            this.tasks.set(taskId, { run, coverage });
            this.proxy.$startedTestRunTask(runId, { id: taskId, name, running: true });
            return run;
        }
        forciblyEndTasks() {
            for (const { run } of this.tasks.values()) {
                run.end();
            }
        }
        markEnded() {
            if (this.state !== 2 /* TestRunTrackerState.Ended */) {
                this.state = 2 /* TestRunTrackerState.Ended */;
                this.endEmitter.fire();
            }
        }
        ensureTestIsKnown(test) {
            if (!(test instanceof extHostTestItem_1.TestItemImpl)) {
                throw new testItemCollection_1.InvalidTestItemError(test.id);
            }
            if (this.sharedTestIds.has(testId_1.TestId.fromExtHostTestItem(test, this.dto.controllerId).toString())) {
                return;
            }
            const chain = [];
            const root = this.dto.colllection.root;
            while (true) {
                const converted = Convert.TestItem.from(test);
                chain.unshift(converted);
                if (this.sharedTestIds.has(converted.extId)) {
                    break;
                }
                this.sharedTestIds.add(converted.extId);
                if (test === root) {
                    break;
                }
                test = test.parent || root;
            }
            this.proxy.$addTestsToRun(this.dto.controllerId, this.dto.id, chain);
        }
        dispose() {
            this.markEnded();
            super.dispose();
        }
    }
    /**
     * Queues runs for a single extension and provides the currently-executing
     * run so that `createTestRun` can be properly correlated.
     */
    class TestRunCoordinator {
        get trackers() {
            return this.tracked.values();
        }
        constructor(proxy) {
            this.proxy = proxy;
            this.tracked = new Map();
        }
        /**
         * Registers a request as being invoked by the main thread, so
         * `$startedExtensionTestRun` is not invoked. The run must eventually
         * be cancelled manually.
         */
        prepareForMainThreadTestRun(req, dto, extension, token) {
            return this.getTracker(req, dto, extension, token);
        }
        /**
         * Cancels an existing test run via its cancellation token.
         */
        cancelRunById(runId) {
            for (const tracker of this.tracked.values()) {
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
            for (const tracker of this.tracked.values()) {
                tracker.cancel();
            }
        }
        /**
         * Implements the public `createTestRun` API.
         */
        createTestRun(extension, controllerId, collection, request, name, persist) {
            const existing = this.tracked.get(request);
            if (existing) {
                return existing.createRun(name);
            }
            // If there is not an existing tracked extension for the request, start
            // a new, detached session.
            const dto = TestRunDto.fromPublic(controllerId, collection, request, persist);
            const profile = tryGetProfileFromTestRunReq(request);
            this.proxy.$startedExtensionTestRun({
                controllerId,
                continuous: !!request.continuous,
                profile: profile && { group: profileGroupToBitset[profile.kind], id: profile.profileId },
                exclude: request.exclude?.map(t => testId_1.TestId.fromExtHostTestItem(t, collection.root.id).toString()) ?? [],
                id: dto.id,
                include: request.include?.map(t => testId_1.TestId.fromExtHostTestItem(t, collection.root.id).toString()) ?? [collection.root.id],
                persist
            });
            const tracker = this.getTracker(request, dto, extension);
            event_1.Event.once(tracker.onEnd)(() => {
                this.proxy.$finishedExtensionTestRun(dto.id);
                tracker.dispose();
            });
            return tracker.createRun(name);
        }
        getTracker(req, dto, extension, token) {
            const tracker = new TestRunTracker(dto, this.proxy, extension, token);
            this.tracked.set(req, tracker);
            event_1.Event.once(tracker.onEnd)(() => this.tracked.delete(req));
            return tracker;
        }
    }
    exports.TestRunCoordinator = TestRunCoordinator;
    const tryGetProfileFromTestRunReq = (request) => {
        if (!request.profile) {
            return undefined;
        }
        if (!(request.profile instanceof TestRunProfileImpl)) {
            throw new Error(`TestRunRequest.profile is not an instance created from TestController.createRunProfile`);
        }
        return request.profile;
    };
    class TestRunDto {
        static fromPublic(controllerId, collection, request, persist) {
            return new TestRunDto(controllerId, (0, uuid_1.generateUuid)(), request.include?.map(t => testId_1.TestId.fromExtHostTestItem(t, controllerId).toString()) ?? [controllerId], request.exclude?.map(t => testId_1.TestId.fromExtHostTestItem(t, controllerId).toString()) ?? [], persist, collection);
        }
        static fromInternal(request, collection) {
            return new TestRunDto(request.controllerId, request.runId, request.testIds, request.excludeExtIds, true, collection);
        }
        constructor(controllerId, id, include, exclude, isPersisted, colllection) {
            this.controllerId = controllerId;
            this.id = id;
            this.isPersisted = isPersisted;
            this.colllection = colllection;
            this.includePrefix = include.map(id => id + "\0" /* TestIdPathParts.Delimiter */);
            this.excludePrefix = exclude.map(id => id + "\0" /* TestIdPathParts.Delimiter */);
        }
        isIncluded(test) {
            const id = testId_1.TestId.fromExtHostTestItem(test, this.controllerId).toString() + "\0" /* TestIdPathParts.Delimiter */;
            for (const prefix of this.excludePrefix) {
                if (id === prefix || id.startsWith(prefix)) {
                    return false;
                }
            }
            for (const prefix of this.includePrefix) {
                if (id === prefix || id.startsWith(prefix)) {
                    return true;
                }
            }
            return false;
        }
    }
    exports.TestRunDto = TestRunDto;
    class TestRunCoverageBearer {
        set coverageProvider(provider) {
            if (this._coverageProvider) {
                throw new Error('The TestCoverageProvider cannot be replaced after being provided');
            }
            if (!provider) {
                return;
            }
            this._coverageProvider = provider;
            this.proxy.$signalCoverageAvailable(this.runId, this.taskId);
        }
        get coverageProvider() {
            return this._coverageProvider;
        }
        constructor(proxy, runId, taskId) {
            this.proxy = proxy;
            this.runId = runId;
            this.taskId = taskId;
        }
        async provideFileCoverage(token) {
            if (!this._coverageProvider) {
                return [];
            }
            if (!this.fileCoverage) {
                this.fileCoverage = (async () => this._coverageProvider.provideFileCoverage(token))();
            }
            try {
                const coverage = await this.fileCoverage;
                return coverage?.map(Convert.TestCoverage.fromFile) ?? [];
            }
            catch (e) {
                this.fileCoverage = undefined;
                throw e;
            }
        }
        async resolveFileCoverage(index, token) {
            const fileCoverage = await this.fileCoverage;
            let file = fileCoverage?.[index];
            if (!this._coverageProvider || !fileCoverage || !file) {
                return [];
            }
            if (!file.detailedCoverage) {
                file = fileCoverage[index] = await this._coverageProvider.resolveFileCoverage?.(file, token) ?? file;
            }
            return file.detailedCoverage?.map(Convert.TestCoverage.fromDetailed) ?? [];
        }
    }
    class MirroredChangeCollector {
        get isEmpty() {
            return this.added.size === 0 && this.removed.size === 0 && this.updated.size === 0;
        }
        constructor(emitter) {
            this.emitter = emitter;
            this.added = new Set();
            this.updated = new Set();
            this.removed = new Set();
            this.alreadyRemoved = new Set();
        }
        /**
         * @inheritdoc
         */
        add(node) {
            this.added.add(node);
        }
        /**
         * @inheritdoc
         */
        update(node) {
            Object.assign(node.revived, Convert.TestItem.toPlain(node.item));
            if (!this.added.has(node)) {
                this.updated.add(node);
            }
        }
        /**
         * @inheritdoc
         */
        remove(node) {
            if (this.added.has(node)) {
                this.added.delete(node);
                return;
            }
            this.updated.delete(node);
            const parentId = testId_1.TestId.parentId(node.item.extId);
            if (parentId && this.alreadyRemoved.has(parentId.toString())) {
                this.alreadyRemoved.add(node.item.extId);
                return;
            }
            this.removed.add(node);
        }
        /**
         * @inheritdoc
         */
        getChangeEvent() {
            const { added, updated, removed } = this;
            return {
                get added() { return [...added].map(n => n.revived); },
                get updated() { return [...updated].map(n => n.revived); },
                get removed() { return [...removed].map(n => n.revived); },
            };
        }
        complete() {
            if (!this.isEmpty) {
                this.emitter.fire(this.getChangeEvent());
            }
        }
    }
    /**
     * Maintains tests in this extension host sent from the main thread.
     * @private
     */
    class MirroredTestCollection extends testTypes_1.AbstractIncrementalTestCollection {
        constructor() {
            super(...arguments);
            this.changeEmitter = new event_1.Emitter();
            /**
             * Change emitter that fires with the same semantics as `TestObserver.onDidChangeTests`.
             */
            this.onDidChangeTests = this.changeEmitter.event;
        }
        /**
         * Gets a list of root test items.
         */
        get rootTests() {
            return super.roots;
        }
        /**
         *
         * If the test ID exists, returns its underlying ID.
         */
        getMirroredTestDataById(itemId) {
            return this.items.get(itemId);
        }
        /**
         * If the test item is a mirrored test item, returns its underlying ID.
         */
        getMirroredTestDataByReference(item) {
            return this.items.get(item.id);
        }
        /**
         * @override
         */
        createItem(item, parent) {
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
        createChangeCollector() {
            return new MirroredChangeCollector(this.changeEmitter);
        }
    }
    class TestObservers {
        constructor(proxy) {
            this.proxy = proxy;
        }
        checkout() {
            if (!this.current) {
                this.current = this.createObserverData();
            }
            const current = this.current;
            current.observers++;
            return {
                onDidChangeTest: current.tests.onDidChangeTests,
                get tests() { return [...current.tests.rootTests].map(t => t.revived); },
                dispose: (0, functional_1.once)(() => {
                    if (--current.observers === 0) {
                        this.proxy.$unsubscribeFromDiffs();
                        this.current = undefined;
                    }
                }),
            };
        }
        /**
         * Gets the internal test data by its reference.
         */
        getMirroredTestDataByReference(ref) {
            return this.current?.tests.getMirroredTestDataByReference(ref);
        }
        /**
         * Applies test diffs to the current set of observed tests.
         */
        applyDiff(diff) {
            this.current?.tests.apply(diff);
        }
        createObserverData() {
            const tests = new MirroredTestCollection();
            this.proxy.$subscribeToDiffs();
            return { observers: 0, tests, };
        }
    }
    class TestRunProfileImpl {
        #proxy;
        #profiles;
        get label() {
            return this._label;
        }
        set label(label) {
            if (label !== this._label) {
                this._label = label;
                this.#proxy.$updateTestRunConfig(this.controllerId, this.profileId, { label });
            }
        }
        get supportsContinuousRun() {
            return this._supportsContinuousRun;
        }
        set supportsContinuousRun(supports) {
            if (supports !== this._supportsContinuousRun) {
                this._supportsContinuousRun = supports;
                this.#proxy.$updateTestRunConfig(this.controllerId, this.profileId, { supportsContinuousRun: supports });
            }
        }
        get isDefault() {
            return this._isDefault;
        }
        set isDefault(isDefault) {
            if (isDefault !== this._isDefault) {
                this._isDefault = isDefault;
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
            return this._configureHandler;
        }
        set configureHandler(handler) {
            if (handler !== this._configureHandler) {
                this._configureHandler = handler;
                this.#proxy.$updateTestRunConfig(this.controllerId, this.profileId, { hasConfigurationHandler: !!handler });
            }
        }
        constructor(proxy, profiles, controllerId, profileId, _label, kind, runHandler, _isDefault = false, _tag = undefined, _supportsContinuousRun = false) {
            this.controllerId = controllerId;
            this.profileId = profileId;
            this._label = _label;
            this.kind = kind;
            this.runHandler = runHandler;
            this._isDefault = _isDefault;
            this._tag = _tag;
            this._supportsContinuousRun = _supportsContinuousRun;
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
                label: _label,
                group: groupBitset,
                isDefault: _isDefault,
                hasConfigurationHandler: false,
                supportsContinuousRun: _supportsContinuousRun,
            });
        }
        dispose() {
            if (this.#profiles?.delete(this.profileId)) {
                this.#profiles = undefined;
                this.#proxy.$removeTestProfile(this.controllerId, this.profileId);
            }
        }
    }
    exports.TestRunProfileImpl = TestRunProfileImpl;
    const profileGroupToBitset = {
        [extHostTypes_1.TestRunProfileKind.Coverage]: 8 /* TestRunProfileBitset.Coverage */,
        [extHostTypes_1.TestRunProfileKind.Debug]: 4 /* TestRunProfileBitset.Debug */,
        [extHostTypes_1.TestRunProfileKind.Run]: 2 /* TestRunProfileBitset.Run */,
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFRlc3RpbmcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0VGVzdGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQ3pGLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWM7UUFVMUIsWUFDcUIsR0FBdUIsRUFDM0MsUUFBeUIsRUFDUixPQUFtQztZQUFuQyxZQUFPLEdBQVAsT0FBTyxDQUE0QjtZQVpwQywwQkFBcUIsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQzVDLGdCQUFXLEdBQUcsSUFBSSxHQUFHLEVBQThDLENBQUM7WUFLOUUscUJBQWdCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQztZQUNwRCxZQUFPLEdBQXdDLEVBQUUsQ0FBQztZQU94RCxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsOEJBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3pELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFckQsUUFBUSxDQUFDLHlCQUF5QixDQUFDO2dCQUNsQyxlQUFlLEVBQUUsR0FBRyxDQUFDLEVBQUU7b0JBQ3RCLFFBQVEsR0FBRyxFQUFFLElBQUksRUFBRTt3QkFDbEIsMENBQWlDLENBQUMsQ0FBQzs0QkFDbEMsTUFBTSxJQUFJLEdBQUcsR0FBdUIsQ0FBQzs0QkFDckMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMs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