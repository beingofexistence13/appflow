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
    exports.$htb = void 0;
    let $htb = class $htb extends lifecycle_1.$kc {
        constructor(extHostContext, f, g, h) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.b = this.B(new lifecycle_1.$lc());
            this.c = new Map();
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostTesting);
            this.B(this.f.onDidCancelTestRun(({ runId }) => {
                this.a.$cancelExtensionTestRun(runId);
            }));
            this.B(h.onResultsChanged(evt => {
                const results = 'completed' in evt ? evt.completed : ('inserted' in evt ? evt.inserted : undefined);
                const serialized = results?.toJSONWithMessages();
                if (serialized) {
                    this.a.$publishTestResults([serialized]);
                }
            }));
        }
        /**
         * @inheritdoc
         */
        $markTestRetired(testIds) {
            let tree;
            if (testIds) {
                tree = new prefixTree_1.$KS();
                for (const id of testIds) {
                    tree.insert(testId_1.$PI.fromString(id).path, undefined);
                }
            }
            for (const result of this.h.results) {
                // all non-live results are already entirely outdated
                if (result instanceof testResult_1.$2sb) {
                    result.markRetired(tree);
                }
            }
        }
        /**
         * @inheritdoc
         */
        $publishTestRunProfile(profile) {
            const controller = this.c.get(profile.controllerId);
            if (controller) {
                this.g.addProfile(controller.instance, profile);
            }
        }
        /**
         * @inheritdoc
         */
        $updateTestRunConfig(controllerId, profileId, update) {
            this.g.updateProfile(controllerId, profileId, update);
        }
        /**
         * @inheritdoc
         */
        $removeTestProfile(controllerId, profileId) {
            this.g.removeProfile(controllerId, profileId);
        }
        /**
         * @inheritdoc
         */
        $addTestsToRun(controllerId, runId, tests) {
            this.j(runId, r => r.addTestChainToRun(controllerId, tests.map(testTypes_1.ITestItem.deserialize)));
        }
        /**
         * @inheritdoc
         */
        $signalCoverageAvailable(runId, taskId) {
            this.j(runId, run => {
                const task = run.tasks.find(t => t.id === taskId);
                if (!task) {
                    return;
                }
                task.coverage.value = new testCoverage_1.$Jsb({
                    provideFileCoverage: async (token) => (0, marshalling_1.$$g)(await this.a.$provideFileCoverage(runId, taskId, token)),
                    resolveFileCoverage: (i, token) => this.a.$resolveFileCoverage(runId, taskId, i, token),
                });
            });
        }
        /**
         * @inheritdoc
         */
        $startedExtensionTestRun(req) {
            this.h.createLiveResult(req);
        }
        /**
         * @inheritdoc
         */
        $startedTestRunTask(runId, task) {
            this.j(runId, r => r.addTask(task));
        }
        /**
         * @inheritdoc
         */
        $finishedTestRunTask(runId, taskId) {
            this.j(runId, r => r.markTaskComplete(taskId));
        }
        /**
         * @inheritdoc
         */
        $finishedExtensionTestRun(runId) {
            this.j(runId, r => r.markComplete());
        }
        /**
         * @inheritdoc
         */
        $updateTestStateInRun(runId, taskId, testId, state, duration) {
            this.j(runId, r => r.updateState(testId, taskId, state, duration));
        }
        /**
         * @inheritdoc
         */
        $appendOutputToRun(runId, taskId, output, locationDto, testId) {
            const location = locationDto && {
                uri: uri_1.URI.revive(locationDto.uri),
                range: range_1.$ks.lift(locationDto.range)
            };
            this.j(runId, r => r.appendOutput(output, taskId, location, testId));
        }
        /**
         * @inheritdoc
         */
        $appendTestMessagesInRun(runId, taskId, testId, messages) {
            const r = this.h.getResult(runId);
            if (r && r instanceof testResult_1.$2sb) {
                for (const message of messages) {
                    r.appendMessage(testId, taskId, testTypes_1.ITestMessage.deserialize(message));
                }
            }
        }
        /**
         * @inheritdoc
         */
        $registerTestController(controllerId, labelStr, canRefreshValue) {
            const disposable = new lifecycle_1.$jc();
            const label = disposable.add(new observableValue_1.$Isb(labelStr));
            const canRefresh = disposable.add(new observableValue_1.$Isb(canRefreshValue));
            const controller = {
                id: controllerId,
                label,
                canRefresh,
                syncTests: () => this.a.$syncTests(),
                refreshTests: token => this.a.$refreshTests(controllerId, token),
                configureRunProfile: id => this.a.$configureRunProfile(controllerId, id),
                runTests: (reqs, token) => this.a.$runControllerTests(reqs, token),
                startContinuousRun: (reqs, token) => this.a.$startContinuousRun(reqs, token),
                expandTest: (testId, levels) => this.a.$expandTest(testId, isFinite(levels) ? levels : -1),
            };
            disposable.add((0, lifecycle_1.$ic)(() => this.g.removeProfile(controllerId)));
            disposable.add(this.f.registerTestController(controllerId, controller));
            this.c.set(controllerId, {
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
            const controller = this.c.get(controllerId);
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
            this.c.get(controllerId)?.disposable.dispose();
            this.c.delete(controllerId);
        }
        /**
         * @inheritdoc
         */
        $subscribeToDiffs() {
            this.a.$acceptDiff(this.f.collection.getReviverDiff().map(testTypes_1.TestsDiffOp.serialize));
            this.b.value = this.f.onDidProcessDiff(this.a.$acceptDiff, this.a);
        }
        /**
         * @inheritdoc
         */
        $unsubscribeFromDiffs() {
            this.b.clear();
        }
        /**
         * @inheritdoc
         */
        $publishDiff(controllerId, diff) {
            this.f.publishDiff(controllerId, diff.map(testTypes_1.TestsDiffOp.deserialize));
        }
        async $runTests(req, token) {
            const result = await this.f.runResolvedTests(req, token);
            return result.id;
        }
        dispose() {
            super.dispose();
            for (const subscription of this.c.values()) {
                subscription.disposable.dispose();
            }
            this.c.clear();
        }
        j(runId, fn) {
            const r = this.h.getResult(runId);
            return r && r instanceof testResult_1.$2sb ? fn(r) : undefined;
        }
    };
    exports.$htb = $htb;
    exports.$htb = $htb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadTesting),
        __param(1, testService_1.$4sb),
        __param(2, testProfileService_1.$9sb),
        __param(3, testResultService_1.$ftb)
    ], $htb);
});
//# sourceMappingURL=mainThreadTesting.js.map