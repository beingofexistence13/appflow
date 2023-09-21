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
define(["require", "exports", "vs/base/common/arraysFind", "vs/base/common/async", "vs/base/common/event", "vs/base/common/functional", "vs/base/common/lifecycle", "vs/base/common/uuid", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultStorage"], function (require, exports, arraysFind_1, async_1, event_1, functional_1, lifecycle_1, uuid_1, contextkey_1, instantiation_1, testingContextKeys_1, testProfileService_1, testResult_1, testResultStorage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestResultService = exports.ITestResultService = void 0;
    const isRunningTests = (service) => service.results.length > 0 && service.results[0].completedAt === undefined;
    exports.ITestResultService = (0, instantiation_1.createDecorator)('testResultService');
    let TestResultService = class TestResultService extends lifecycle_1.Disposable {
        /**
         * @inheritdoc
         */
        get results() {
            this.loadResults();
            return this._results;
        }
        constructor(contextKeyService, storage, testProfiles) {
            super();
            this.storage = storage;
            this.testProfiles = testProfiles;
            this.changeResultEmitter = this._register(new event_1.Emitter());
            this._results = [];
            this._resultsDisposables = [];
            this.testChangeEmitter = this._register(new event_1.Emitter());
            /**
             * @inheritdoc
             */
            this.onResultsChanged = this.changeResultEmitter.event;
            /**
             * @inheritdoc
             */
            this.onTestChanged = this.testChangeEmitter.event;
            this.loadResults = (0, functional_1.once)(() => this.storage.read().then(loaded => {
                for (let i = loaded.length - 1; i >= 0; i--) {
                    this.push(loaded[i]);
                }
            }));
            this.persistScheduler = new async_1.RunOnceScheduler(() => this.persistImmediately(), 500);
            this._register((0, lifecycle_1.toDisposable)(() => (0, lifecycle_1.dispose)(this._resultsDisposables)));
            this.isRunning = testingContextKeys_1.TestingContextKeys.isRunning.bindTo(contextKeyService);
            this.hasAnyResults = testingContextKeys_1.TestingContextKeys.hasAnyResults.bindTo(contextKeyService);
        }
        /**
         * @inheritdoc
         */
        getStateById(extId) {
            for (const result of this.results) {
                const lookup = result.getStateById(extId);
                if (lookup && lookup.computedState !== 0 /* TestResultState.Unset */) {
                    return [result, lookup];
                }
            }
            return undefined;
        }
        /**
         * @inheritdoc
         */
        createLiveResult(req) {
            if ('targets' in req) {
                const id = (0, uuid_1.generateUuid)();
                return this.push(new testResult_1.LiveTestResult(id, true, req));
            }
            let profile;
            if (req.profile) {
                const profiles = this.testProfiles.getControllerProfiles(req.controllerId);
                profile = profiles.find(c => c.profileId === req.profile.id);
            }
            const resolved = {
                isUiTriggered: false,
                targets: [],
                exclude: req.exclude,
                continuous: req.continuous,
            };
            if (profile) {
                resolved.targets.push({
                    profileGroup: profile.group,
                    profileId: profile.profileId,
                    controllerId: req.controllerId,
                    testIds: req.include,
                });
            }
            return this.push(new testResult_1.LiveTestResult(req.id, req.persist, resolved));
        }
        /**
         * @inheritdoc
         */
        push(result) {
            if (result.completedAt === undefined) {
                this.results.unshift(result);
            }
            else {
                const index = (0, arraysFind_1.findFirstIdxMonotonousOrArrLen)(this.results, r => r.completedAt !== undefined && r.completedAt <= result.completedAt);
                this.results.splice(index, 0, result);
                this.persistScheduler.schedule();
            }
            this.hasAnyResults.set(true);
            if (this.results.length > testResultStorage_1.RETAIN_MAX_RESULTS) {
                this.results.pop();
                this._resultsDisposables.pop()?.dispose();
            }
            const ds = new lifecycle_1.DisposableStore();
            this._resultsDisposables.push(ds);
            if (result instanceof testResult_1.LiveTestResult) {
                ds.add(result);
                ds.add(result.onComplete(() => this.onComplete(result)));
                ds.add(result.onChange(this.testChangeEmitter.fire, this.testChangeEmitter));
                this.isRunning.set(true);
                this.changeResultEmitter.fire({ started: result });
            }
            else {
                this.changeResultEmitter.fire({ inserted: result });
                // If this is not a new result, go through each of its tests. For each
                // test for which the new result is the most recently inserted, fir
                // a change event so that UI updates.
                for (const item of result.tests) {
                    for (const otherResult of this.results) {
                        if (otherResult === result) {
                            this.testChangeEmitter.fire({ item, result, reason: 0 /* TestResultItemChangeReason.ComputedStateChange */ });
                            break;
                        }
                        else if (otherResult.getStateById(item.item.extId) !== undefined) {
                            break;
                        }
                    }
                }
            }
            return result;
        }
        /**
         * @inheritdoc
         */
        getResult(id) {
            return this.results.find(r => r.id === id);
        }
        /**
         * @inheritdoc
         */
        clear() {
            const keep = [];
            const removed = [];
            for (const result of this.results) {
                if (result.completedAt !== undefined) {
                    removed.push(result);
                }
                else {
                    keep.push(result);
                }
            }
            this._results = keep;
            this.persistScheduler.schedule();
            if (keep.length === 0) {
                this.hasAnyResults.set(false);
            }
            this.changeResultEmitter.fire({ removed });
        }
        onComplete(result) {
            this.resort();
            this.updateIsRunning();
            this.persistScheduler.schedule();
            this.changeResultEmitter.fire({ completed: result });
        }
        resort() {
            this.results.sort((a, b) => (b.completedAt ?? Number.MAX_SAFE_INTEGER) - (a.completedAt ?? Number.MAX_SAFE_INTEGER));
        }
        updateIsRunning() {
            this.isRunning.set(isRunningTests(this));
        }
        async persistImmediately() {
            // ensure results are loaded before persisting to avoid deleting once
            // that we don't have yet.
            await this.loadResults();
            this.storage.persist(this.results);
        }
    };
    exports.TestResultService = TestResultService;
    exports.TestResultService = TestResultService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, testResultStorage_1.ITestResultStorage),
        __param(2, testProfileService_1.ITestProfileService)
    ], TestResultService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFJlc3VsdFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXN0aW5nL2NvbW1vbi90ZXN0UmVzdWx0U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFpRWhHLE1BQU0sY0FBYyxHQUFHLENBQUMsT0FBMkIsRUFBRSxFQUFFLENBQ3RELE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsS0FBSyxTQUFTLENBQUM7SUFFL0QsUUFBQSxrQkFBa0IsR0FBRyxJQUFBLCtCQUFlLEVBQXFCLG1CQUFtQixDQUFDLENBQUM7SUFFcEYsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBa0IsU0FBUSxzQkFBVTtRQU9oRDs7V0FFRztRQUNILElBQVcsT0FBTztZQUNqQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbkIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3RCLENBQUM7UUFzQkQsWUFDcUIsaUJBQXFDLEVBQ3JDLE9BQTRDLEVBQzNDLFlBQWtEO1lBRXZFLEtBQUssRUFBRSxDQUFDO1lBSDZCLFlBQU8sR0FBUCxPQUFPLENBQW9CO1lBQzFCLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtZQXBDaEUsd0JBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBcUIsQ0FBQyxDQUFDO1lBQ3ZFLGFBQVEsR0FBa0IsRUFBRSxDQUFDO1lBQ3BCLHdCQUFtQixHQUFzQixFQUFFLENBQUM7WUFDckQsc0JBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBd0IsQ0FBQyxDQUFDO1lBVWhGOztlQUVHO1lBQ2EscUJBQWdCLEdBQUcsSUFBSSxDQUFD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