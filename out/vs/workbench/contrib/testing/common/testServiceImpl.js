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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/contrib/testing/common/mainThreadTestCollection", "vs/workbench/contrib/testing/common/observableValue", "vs/workbench/contrib/testing/common/storedValue", "vs/workbench/contrib/testing/common/testExclusions", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/services/editor/common/editorService", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/testing/common/configuration", "vs/base/common/types"], function (require, exports, arrays_1, cancellation_1, event_1, iterator_1, lifecycle_1, nls_1, contextkey_1, instantiation_1, notification_1, storage_1, workspaceTrust_1, mainThreadTestCollection_1, observableValue_1, storedValue_1, testExclusions_1, testId_1, testingContextKeys_1, testProfileService_1, testResultService_1, editorService_1, configuration_1, configuration_2, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestService = void 0;
    let TestService = class TestService extends lifecycle_1.Disposable {
        constructor(contextKeyService, instantiationService, storage, editorService, testProfiles, notificationService, configurationService, testResults, workspaceTrustRequestService) {
            super();
            this.storage = storage;
            this.editorService = editorService;
            this.testProfiles = testProfiles;
            this.notificationService = notificationService;
            this.configurationService = configurationService;
            this.testResults = testResults;
            this.workspaceTrustRequestService = workspaceTrustRequestService;
            this.testControllers = new Map();
            this.cancelExtensionTestRunEmitter = new event_1.Emitter();
            this.willProcessDiffEmitter = new event_1.Emitter();
            this.didProcessDiffEmitter = new event_1.Emitter();
            this.testRefreshCancellations = new Set();
            /**
             * Cancellation for runs requested by the user being managed by the UI.
             * Test runs initiated by extensions are not included here.
             */
            this.uiRunningTests = new Map();
            /**
             * @inheritdoc
             */
            this.onWillProcessDiff = this.willProcessDiffEmitter.event;
            /**
             * @inheritdoc
             */
            this.onDidProcessDiff = this.didProcessDiffEmitter.event;
            /**
             * @inheritdoc
             */
            this.onDidCancelTestRun = this.cancelExtensionTestRunEmitter.event;
            /**
             * @inheritdoc
             */
            this.collection = new mainThreadTestCollection_1.MainThreadTestCollection(this.expandTest.bind(this));
            /**
             * @inheritdoc
             */
            this.showInlineOutput = observableValue_1.MutableObservableValue.stored(this._register(new storedValue_1.StoredValue({
                key: 'inlineTestOutputVisible',
                scope: 1 /* StorageScope.WORKSPACE */,
                target: 0 /* StorageTarget.USER */
            }, this.storage)), true);
            this.excluded = instantiationService.createInstance(testExclusions_1.TestExclusions);
            this.providerCount = testingContextKeys_1.TestingContextKeys.providerCount.bindTo(contextKeyService);
            this.canRefreshTests = testingContextKeys_1.TestingContextKeys.canRefreshTests.bindTo(contextKeyService);
            this.isRefreshingTests = testingContextKeys_1.TestingContextKeys.isRefreshingTests.bindTo(contextKeyService);
            this.activeEditorHasTests = testingContextKeys_1.TestingContextKeys.activeEditorHasTests.bindTo(contextKeyService);
            this._register(editorService.onDidActiveEditorChange(() => this.updateEditorContextKeys()));
        }
        /**
         * @inheritdoc
         */
        async expandTest(id, levels) {
            await this.testControllers.get(testId_1.TestId.fromString(id).controllerId)?.expandTest(id, levels);
        }
        /**
         * @inheritdoc
         */
        cancelTestRun(runId) {
            this.cancelExtensionTestRunEmitter.fire({ runId });
            if (runId === undefined) {
                for (const runCts of this.uiRunningTests.values()) {
                    runCts.cancel();
                }
            }
            else {
                this.uiRunningTests.get(runId)?.cancel();
            }
        }
        /**
         * @inheritdoc
         */
        async runTests(req, token = cancellation_1.CancellationToken.None) {
            const resolved = {
                targets: [],
                exclude: req.exclude?.map(t => t.item.extId),
                continuous: req.continuous,
            };
            // First, try to run the tests using the default run profiles...
            for (const profile of this.testProfiles.getGroupDefaultProfiles(req.group)) {
                const testIds = req.tests.filter(t => (0, testProfileService_1.canUseProfileWithTest)(profile, t)).map(t => t.item.extId);
                if (testIds.length) {
                    resolved.targets.push({
                        testIds: testIds,
                        profileGroup: profile.group,
                        profileId: profile.profileId,
                        controllerId: profile.controllerId,
                    });
                }
            }
            // If no tests are covered by the defaults, just use whatever the defaults
            // for their controller are. This can happen if the user chose specific
            // profiles for the run button, but then asked to run a single test from the
            // explorer or decoration. We shouldn't no-op.
            if (resolved.targets.length === 0) {
                for (const byController of (0, arrays_1.groupBy)(req.tests, (a, b) => a.controllerId === b.controllerId ? 0 : 1)) {
                    const profiles = this.testProfiles.getControllerProfiles(byController[0].controllerId);
                    const withControllers = byController.map(test => ({
                        profile: profiles.find(p => p.group === req.group && (0, testProfileService_1.canUseProfileWithTest)(p, test)),
                        test,
                    }));
                    for (const byProfile of (0, arrays_1.groupBy)(withControllers, (a, b) => a.profile === b.profile ? 0 : 1)) {
                        const profile = byProfile[0].profile;
                        if (profile) {
                            resolved.targets.push({
                                testIds: byProfile.map(t => t.test.item.extId),
                                profileGroup: req.group,
                                profileId: profile.profileId,
                                controllerId: profile.controllerId,
                            });
                        }
                    }
                }
            }
            return this.runResolvedTests(resolved, token);
        }
        /** @inheritdoc */
        async startContinuousRun(req, token) {
            if (!req.exclude) {
                req.exclude = [...this.excluded.all];
            }
            const trust = await this.workspaceTrustRequestService.requestWorkspaceTrust({
                message: (0, nls_1.localize)('testTrust', "Running tests may execute code in your workspace."),
            });
            if (!trust) {
                return;
            }
            const byController = (0, arrays_1.groupBy)(req.targets, (a, b) => a.controllerId.localeCompare(b.controllerId));
            const requests = byController.map(group => this.testControllers.get(group[0].controllerId)?.startContinuousRun(group.map(controlReq => ({
                excludeExtIds: req.exclude.filter(t => !controlReq.testIds.includes(t)),
                profileId: controlReq.profileId,
                controllerId: controlReq.controllerId,
                testIds: controlReq.testIds,
            })), token).then(result => {
                const errs = result.map(r => r.error).filter(types_1.isDefined);
                if (errs.length) {
                    this.notificationService.error((0, nls_1.localize)('testError', 'An error occurred attempting to run tests: {0}', errs.join(' ')));
                }
            }));
            await Promise.all(requests);
        }
        /**
         * @inheritdoc
         */
        async runResolvedTests(req, token = cancellation_1.CancellationToken.None) {
            if (!req.exclude) {
                req.exclude = [...this.excluded.all];
            }
            const result = this.testResults.createLiveResult(req);
            const trust = await this.workspaceTrustRequestService.requestWorkspaceTrust({
                message: (0, nls_1.localize)('testTrust', "Running tests may execute code in your workspace."),
            });
            if (!trust) {
                result.markComplete();
                return result;
            }
            try {
                const cancelSource = new cancellation_1.CancellationTokenSource(token);
                this.uiRunningTests.set(result.id, cancelSource);
                const byController = (0, arrays_1.groupBy)(req.targets, (a, b) => a.controllerId.localeCompare(b.controllerId));
                const requests = byController.map(group => this.testControllers.get(group[0].controllerId)?.runTests(group.map(controlReq => ({
                    runId: result.id,
                    excludeExtIds: req.exclude.filter(t => !controlReq.testIds.includes(t)),
                    profileId: controlReq.profileId,
                    controllerId: controlReq.controllerId,
                    testIds: controlReq.testIds,
                })), cancelSource.token).then(result => {
                    const errs = result.map(r => r.error).filter(types_1.isDefined);
                    if (errs.length) {
                        this.notificationService.error((0, nls_1.localize)('testError', 'An error occurred attempting to run tests: {0}', errs.join(' ')));
                    }
                }));
                await this.saveAllBeforeTest(req);
                await Promise.all(requests);
                return result;
            }
            finally {
                this.uiRunningTests.delete(result.id);
                result.markComplete();
            }
        }
        /**
         * @inheritdoc
         */
        publishDiff(_controllerId, diff) {
            this.willProcessDiffEmitter.fire(diff);
            this.collection.apply(diff);
            this.updateEditorContextKeys();
            this.didProcessDiffEmitter.fire(diff);
        }
        /**
         * @inheritdoc
         */
        getTestController(id) {
            return this.testControllers.get(id);
        }
        /**
         * @inheritdoc
         */
        async syncTests() {
            const cts = new cancellation_1.CancellationTokenSource();
            try {
                await Promise.all([...this.testControllers.values()].map(c => c.syncTests(cts.token)));
            }
            finally {
                cts.dispose(true);
            }
        }
        /**
         * @inheritdoc
         */
        async refreshTests(controllerId) {
            const cts = new cancellation_1.CancellationTokenSource();
            this.testRefreshCancellations.add(cts);
            this.isRefreshingTests.set(true);
            try {
                if (controllerId) {
                    await this.testControllers.get(controllerId)?.refreshTests(cts.token);
                }
                else {
                    await Promise.all([...this.testControllers.values()].map(c => c.refreshTests(cts.token)));
                }
            }
            finally {
                this.testRefreshCancellations.delete(cts);
                this.isRefreshingTests.set(this.testRefreshCancellations.size > 0);
                cts.dispose(true);
            }
        }
        /**
         * @inheritdoc
         */
        cancelRefreshTests() {
            for (const cts of this.testRefreshCancellations) {
                cts.cancel();
            }
            this.testRefreshCancellations.clear();
            this.isRefreshingTests.set(false);
        }
        /**
         * @inheritdoc
         */
        registerTestController(id, controller) {
            this.testControllers.set(id, controller);
            this.providerCount.set(this.testControllers.size);
            this.updateCanRefresh();
            const disposable = new lifecycle_1.DisposableStore();
            disposable.add((0, lifecycle_1.toDisposable)(() => {
                const diff = [];
                for (const root of this.collection.rootItems) {
                    if (root.controllerId === id) {
                        diff.push({ op: 3 /* TestDiffOpType.Remove */, itemId: root.item.extId });
                    }
                }
                this.publishDiff(id, diff);
                if (this.testControllers.delete(id)) {
                    this.providerCount.set(this.testControllers.size);
                    this.updateCanRefresh();
                }
            }));
            disposable.add(controller.canRefresh.onDidChange(this.updateCanRefresh, this));
            return disposable;
        }
        updateEditorContextKeys() {
            const uri = this.editorService.activeEditor?.resource;
            if (uri) {
                this.activeEditorHasTests.set(!iterator_1.Iterable.isEmpty(this.collection.getNodeByUrl(uri)));
            }
            else {
                this.activeEditorHasTests.set(false);
            }
        }
        async saveAllBeforeTest(req, configurationService = this.configurationService, editorService = this.editorService) {
            if (req.isUiTriggered === false) {
                return;
            }
            const saveBeforeTest = (0, configuration_2.getTestingConfiguration)(this.configurationService, "testing.saveBeforeTest" /* TestingConfigKeys.SaveBeforeTest */);
            if (saveBeforeTest) {
                await editorService.saveAll();
            }
            return;
        }
        updateCanRefresh() {
            this.canRefreshTests.set(iterator_1.Iterable.some(this.testControllers.values(), t => t.canRefresh.value));
        }
    };
    exports.TestService = TestService;
    exports.TestService = TestService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, storage_1.IStorageService),
        __param(3, editorService_1.IEditorService),
        __param(4, testProfileService_1.ITestProfileService),
        __param(5, notification_1.INotificationService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, testResultService_1.ITestResultService),
        __param(8, workspaceTrust_1.IWorkspaceTrustRequestService)
    ], TestService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFNlcnZpY2VJbXBsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVzdGluZy9jb21tb24vdGVzdFNlcnZpY2VJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTZCekYsSUFBTSxXQUFXLEdBQWpCLE1BQU0sV0FBWSxTQUFRLHNCQUFVO1FBcUQxQyxZQUNxQixpQkFBcUMsRUFDbEMsb0JBQTJDLEVBQ2pELE9BQXlDLEVBQzFDLGFBQThDLEVBQ3pDLFlBQWtELEVBQ2pELG1CQUEwRCxFQUN6RCxvQkFBNEQsRUFDL0QsV0FBZ0QsRUFDckMsNEJBQTRFO1lBRTNHLEtBQUssRUFBRSxDQUFDO1lBUjBCLFlBQU8sR0FBUCxPQUFPLENBQWlCO1lBQ3pCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUN4QixpQkFBWSxHQUFaLFlBQVksQ0FBcUI7WUFDaEMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUN4Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzlDLGdCQUFXLEdBQVgsV0FBVyxDQUFvQjtZQUNwQixpQ0FBNEIsR0FBNUIsNEJBQTRCLENBQStCO1lBNURwRyxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUFxQyxDQUFDO1lBRXRELGtDQUE2QixHQUFHLElBQUksZUFBTyxFQUFpQyxDQUFDO1lBQzdFLDJCQUFzQixHQUFHLElBQUksZUFBTyxFQUFhLENBQUM7WUFDbEQsMEJBQXFCLEdBQUcsSUFBSSxlQUFPLEVBQWEsQ0FBQztZQUNqRCw2QkFBd0IsR0FBRyxJQUFJLEdBQUcsRUFBMkIsQ0FBQztZQU0vRTs7O2VBR0c7WUFDYyxtQkFBYyxHQUFHLElBQUksR0FBRyxFQUFnRCxDQUFDO1lBRTFGOztlQUVHO1lBQ2Esc0JBQWlCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FB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