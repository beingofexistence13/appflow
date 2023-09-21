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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls", "vs/platform/configuration/common/configuration", "vs/workbench/common/views", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/contrib/testing/common/testResultService"], function (require, exports, lifecycle_1, nls_1, configuration_1, views_1, configuration_2, testingStates_1, testResultService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTestProgressText = exports.collectTestStateCounts = exports.TestingProgressTrigger = void 0;
    /** Workbench contribution that triggers updates in the TestingProgressUi service */
    let TestingProgressTrigger = class TestingProgressTrigger extends lifecycle_1.Disposable {
        constructor(resultService, configurationService, viewsService) {
            super();
            this.configurationService = configurationService;
            this.viewsService = viewsService;
            this._register(resultService.onResultsChanged((e) => {
                if ('started' in e) {
                    this.attachAutoOpenForNewResults(e.started);
                }
            }));
        }
        attachAutoOpenForNewResults(result) {
            if (result.request.isUiTriggered === false) {
                return;
            }
            const cfg = (0, configuration_2.getTestingConfiguration)(this.configurationService, "testing.openTesting" /* TestingConfigKeys.OpenTesting */);
            if (cfg === "neverOpen" /* AutoOpenTesting.NeverOpen */) {
                return;
            }
            if (cfg === "openExplorerOnTestStart" /* AutoOpenTesting.OpenExplorerOnTestStart */) {
                return this.openExplorerView();
            }
            if (cfg === "openOnTestStart" /* AutoOpenTesting.OpenOnTestStart */) {
                return this.openResultsView();
            }
            // open on failure
            const disposable = new lifecycle_1.DisposableStore();
            disposable.add(result.onComplete(() => disposable.dispose()));
            disposable.add(result.onChange(e => {
                if (e.reason === 1 /* TestResultItemChangeReason.OwnStateChange */ && (0, testingStates_1.isFailedState)(e.item.ownComputedState)) {
                    this.openResultsView();
                    disposable.dispose();
                }
            }));
        }
        openExplorerView() {
            this.viewsService.openView("workbench.view.testing" /* Testing.ExplorerViewId */, false);
        }
        openResultsView() {
            this.viewsService.openView("workbench.panel.testResults.view" /* Testing.ResultsViewId */, false);
        }
    };
    exports.TestingProgressTrigger = TestingProgressTrigger;
    exports.TestingProgressTrigger = TestingProgressTrigger = __decorate([
        __param(0, testResultService_1.ITestResultService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, views_1.IViewsService)
    ], TestingProgressTrigger);
    const collectTestStateCounts = (isRunning, results) => {
        let passed = 0;
        let failed = 0;
        let skipped = 0;
        let running = 0;
        let queued = 0;
        for (const result of results) {
            const count = result.counts;
            failed += count[6 /* TestResultState.Errored */] + count[4 /* TestResultState.Failed */];
            passed += count[3 /* TestResultState.Passed */];
            skipped += count[5 /* TestResultState.Skipped */];
            running += count[2 /* TestResultState.Running */];
            queued += count[1 /* TestResultState.Queued */];
        }
        return {
            isRunning,
            passed,
            failed,
            runSoFar: passed + failed,
            totalWillBeRun: passed + failed + queued + running,
            skipped,
        };
    };
    exports.collectTestStateCounts = collectTestStateCounts;
    const getTestProgressText = ({ isRunning, passed, runSoFar, totalWillBeRun, skipped, failed }) => {
        let percent = passed / runSoFar * 100;
        if (failed > 0) {
            // fix: prevent from rounding to 100 if there's any failed test
            percent = Math.min(percent, 99.9);
        }
        else if (runSoFar === 0) {
            percent = 0;
        }
        if (isRunning) {
            if (runSoFar === 0) {
                return (0, nls_1.localize)('testProgress.runningInitial', 'Running tests...');
            }
            else if (skipped === 0) {
                return (0, nls_1.localize)('testProgress.running', 'Running tests, {0}/{1} passed ({2}%)', passed, totalWillBeRun, percent.toPrecision(3));
            }
            else {
                return (0, nls_1.localize)('testProgressWithSkip.running', 'Running tests, {0}/{1} tests passed ({2}%, {3} skipped)', passed, totalWillBeRun, percent.toPrecision(3), skipped);
            }
        }
        else {
            if (skipped === 0) {
                return (0, nls_1.localize)('testProgress.completed', '{0}/{1} tests passed ({2}%)', passed, runSoFar, percent.toPrecision(3));
            }
            else {
                return (0, nls_1.localize)('testProgressWithSkip.completed', '{0}/{1} tests passed ({2}%, {3} skipped)', passed, runSoFar, percent.toPrecision(3), skipped);
            }
        }
    };
    exports.getTestProgressText = getTestProgressText;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ1Byb2dyZXNzVWlTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVzdGluZy9icm93c2VyL3Rlc3RpbmdQcm9ncmVzc1VpU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFhaEcsb0ZBQW9GO0lBQzdFLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXVCLFNBQVEsc0JBQVU7UUFDckQsWUFDcUIsYUFBaUMsRUFDYixvQkFBMkMsRUFDbkQsWUFBMkI7WUFFM0QsS0FBSyxFQUFFLENBQUM7WUFIZ0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNuRCxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUkzRCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNuRCxJQUFJLFNBQVMsSUFBSSxDQUFDLEVBQUU7b0JBQ25CLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQzVDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFTywyQkFBMkIsQ0FBQyxNQUFzQjtZQUN6RCxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBYSxLQUFLLEtBQUssRUFBRTtnQkFDM0MsT0FBTzthQUNQO1lBRUQsTUFBTSxHQUFHLEdBQUcsSUFBQSx1Q0FBdUIsRUFBQyxJQUFJLENBQUMsb0JBQW9CLDREQUFnQyxDQUFDO1lBQzlGLElBQUksR0FBRyxnREFBOEIsRUFBRTtnQkFDdEMsT0FBTzthQUNQO1lBRUQsSUFBSSxHQUFHLDRFQUE0QyxFQUFFO2dCQUNwRCxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2FBQy9CO1lBRUQsSUFBSSxHQUFHLDREQUFvQyxF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