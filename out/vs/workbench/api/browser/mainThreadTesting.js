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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/uri", "vs/editor/common/core/range", "vs/workbench/contrib/testing/common/observableValue", "vs/workbench/contrib/testing/common/testTypes", "vs/workbench/contrib/testing/common/testCoverage", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService", "vs/workbench/services/extensions/common/extHostCustomers", "../common/extHost.protocol", "vs/base/common/prefixTree", "vs/workbench/contrib/testing/common/testId"], function (require, exports, lifecycle_1, marshalling_1, uri_1, range_1, observableValue_1, testTypes_1, testCoverage_1, testProfileService_1, testResult_1, testResultService_1, testService_1, extHostCustomers_1, extHost_protocol_1, prefixTree_1, testId_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadTesting = void 0;
    let MainThreadTesting = class MainThreadTesting extends lifecycle_1.Disposable {
        constructor(extHostContext, testService, testProfiles, resultService) {
            super();
            this.testService = testService;
            this.testProfiles = testProfiles;
            this.resultService = resultService;
            this.diffListener = this._register(new lifecycle_1.MutableDisposable());
            this.testProviderRegistrations = new Map();
            this.proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostTesting);
            this._register(this.testService.onDidCancelTestRun(({ runId }) => {
                this.proxy.$cancelExtensionTestRun(runId);
            }));
            this._register(resultService.onResultsChanged(evt => {
                const results = 'completed' in evt ? evt.completed : ('inserted' in evt ? evt.inserted : undefined);
                const serialized = results?.toJSONWithMessages();
                if (serialized) {
                    this.proxy.$publishTestResults([serialized]);
                }
            }));
        }
        /**
         * @inheritdoc
         */
        $markTestRetired(testIds) {
            let tree;
            if (testIds) {
                tree = new prefixTree_1.WellDefinedPrefixTree();
                for (const id of testIds) {
                    tree.insert(testId_1.TestId.fromString(id).path, undefined);
                }
            }
            for (const result of this.resultService.results) {
                // all non-live results are already entirely outdated
                if (result instanceof testResult_1.LiveTestResult) {
                    result.markRetired(tree);
                }
            }
        }
        /**
         * @inheritdoc
         */
        $publishTestRunProfile(profile) {
            const controller = this.testProviderRegistrations.get(profile.controllerId);
            if (controller) {
                this.testProfiles.addProfile(controller.instance, profile);
            }
        }
        /**
         * @inheritdoc
         */
        $updateTestRunConfig(controllerId, profileId, update) {
            this.testProfiles.updateProfile(controllerId, profileId, update);
        }
        /**
         * @inheritdoc
         */
        $removeTestProfile(controllerId, profileId) {
            this.testProfiles.removeProfile(controllerId, profileId);
        }
        /**
         * @inheritdoc
         */
        $addTestsToRun(controllerId, runId, tests) {
            this.withLiveRun(runId, r => r.addTestChainToRun(controllerId, tests.map(testTypes_1.ITestItem.deserialize)));
        }
        /**
         * @inheritdoc
         */
        $signalCoverageAvailable(runId, taskId) {
            this.withLiveRun(runId, run => {
                const task = run.tasks.find(t => t.id === taskId);
                if (!task) {
                    return;
                }
                task.coverage.value = new testCoverage_1.TestCoverage({
                    provideFileCoverage: async (token) => (0, marshalling_1.revive)(await this.proxy.$provideFileCoverage(runId, taskId, token)),
                    resolveFileCoverage: (i, token) => this.proxy.$resolveFileCoverage(runId, taskId, i, token),
                });
            });
        }
        /**
         * @inheritdoc
         */
        $startedExtensionTestRun(req) {
            this.resultService.createLiveResult(req);
        }
        /**
         * @inheritdoc
         */
        $startedTestRunTask(runId, task) {
            this.withLiveRun(runId, r => r.addTask(task));
        }
        /**
         * @inheritdoc
         */
        $finishedTestRunTask(runId, taskId) {
            this.withLiveRun(runId, r => r.markTaskComplete(taskId));
        }
        /**
         * @inheritdoc
         */
        $finishedExtensionTestRun(runId) {
            this.withLiveRun(runId, r => r.markComplete());
        }
        /**
         * @inheritdoc
         */
        $updateTestStateInRun(runId, taskId, testId, state, duration) {
            this.withLiveRun(runId, r => r.updateState(testId, taskId, state, duration));
        }
        /**
         * @inheritdoc
         */
        $appendOutputToRun(runId, taskId, output, locationDto, testId) {
            const location = locationDto && {
                uri: uri_1.URI.revive(locationDto.uri),
                range: range_1.Range.lift(locationDto.range)
            };
            this.withLiveRun(runId, r => r.appendOutput(output, taskId, location, testId));
        }
        /**
         * @inheritdoc
         */
        $appendTestMessagesInRun(runId, taskId, testId, messages) {
            const r = this.resultService.getResult(runId);
            if (r && r instanceof testResult_1.LiveTestResult) {
                for (const message of messages) {
                    r.appendMessage(testId, taskId, testTypes_1.ITestMessage.deserialize(message));
                }
            }
        }
        /**
         * @inheritdoc
         */
        $registerTestController(controllerId, labelStr, canRefreshValue) {
            const disposable = new lifecycle_1.DisposableStore();
            const label = disposable.add(new observableValue_1.MutableObservableValue(labelStr));
            const canRefresh = disposable.add(new observableValue_1.MutableObservableValue(canRefreshValue));
            const controller = {
                id: controllerId,
                label,
                canRefresh,
                syncTests: () => this.proxy.$syncTests(),
                refreshTests: token => this.proxy.$refreshTests(controllerId, token),
                configureRunProfile: id => this.proxy.$configureRunProfile(controllerId, id),
                runTests: (reqs, token) => this.proxy.$runControllerTests(reqs, token),
                startContinuousRun: (reqs, token) => this.proxy.$startContinuousRun(reqs, token),
                expandTest: (testId, levels) => this.proxy.$expandTest(testId, isFinite(levels) ? levels : -1),
            };
            disposable.add((0, lifecycle_1.toDisposable)(() => this.testProfiles.removeProfile(controllerId)));
            disposable.add(this.testService.registerTestController(controllerId, controller));
            this.testProviderRegistrations.set(controllerId, {
                instance: controller,
                label,
                canRefresh,
                disposable
            });
        }
        /**
         * @inheritdoc
         */
        $updateController(controllerId, patch) {
            const controller = this.testProviderRegistrations.get(controllerId);
            if (!controller) {
                return;
            }
            if (patch.label !== undefined) {
                controller.label.value = patch.label;
            }
            if (patch.canRefresh !== undefined) {
                controller.canRefresh.value = patch.canRefresh;
            }
        }
        /**
         * @inheritdoc
         */
        $unregisterTestController(controllerId) {
            this.testProviderRegistrations.get(controllerId)?.disposable.dispose();
            this.testProviderRegistrations.delete(controllerId);
        }
        /**
         * @inheritdoc
         */
        $subscribeToDiffs() {
            this.proxy.$acceptDiff(this.testService.collection.getReviverDiff().map(testTypes_1.TestsDiffOp.serialize));
            this.diffListener.value = this.testService.onDidProcessDiff(this.proxy.$acceptDiff, this.proxy);
        }
        /**
         * @inheritdoc
         */
        $unsubscribeFromDiffs() {
            this.diffListener.clear();
        }
        /**
         * @inheritdoc
         */
        $publishDiff(controllerId, diff) {
            this.testService.publishDiff(controllerId, diff.map(testTypes_1.TestsDiffOp.deserialize));
        }
        async $runTests(req, token) {
            const result = await this.testService.runResolvedTests(req, token);
            return result.id;
        }
        dispose() {
            super.dispose();
            for (const subscription of this.testProviderRegistrations.values()) {
                subscription.disposable.dispose();
            }
            this.testProviderRegistrations.clear();
        }
        withLiveRun(runId, fn) {
            const r = this.resultService.getResult(runId);
            return r && r instanceof testResult_1.LiveTestResult ? fn(r) : undefined;
        }
    };
    exports.MainThreadTesting = MainThreadTesting;
    exports.MainThreadTesting = MainThreadTesting = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadTesting),
        __param(1, testService_1.ITestService),
        __param(2, testProfileService_1.ITestProfileService),
        __param(3, testResultService_1.ITestResultService)
    ], MainThreadTesting);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFRlc3RpbmcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZFRlc3RpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcUJ6RixJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLHNCQUFVO1FBVWhELFlBQ0MsY0FBK0IsRUFDakIsV0FBMEMsRUFDbkMsWUFBa0QsRUFDbkQsYUFBa0Q7WUFFdEUsS0FBSyxFQUFFLENBQUM7WUFKdUIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDbEIsaUJBQVksR0FBWixZQUFZLENBQXFCO1lBQ2xDLGtCQUFhLEdBQWIsYUFBYSxDQUFvQjtZQVp0RCxpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBRSxDQUFDLENBQUM7WUFDdkQsOEJBQXlCLEdBQUcsSUFBSSxHQUFHLEVBS2hELENBQUM7WUFTSixJQUFJLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsaUNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUVwRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUU7Z0JBQ2hFLElBQUksQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0MsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNuRCxNQUFNLE9BQU8sR0FBRyxXQUFXLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUs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