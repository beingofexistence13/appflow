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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/testing/browser/testingProgressUiService", "vs/platform/configuration/common/configuration", "vs/workbench/common/views", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/contrib/testing/common/testResultService"], function (require, exports, lifecycle_1, nls_1, configuration_1, views_1, configuration_2, testingStates_1, testResultService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$yLb = exports.$xLb = exports.$wLb = void 0;
    /** Workbench contribution that triggers updates in the TestingProgressUi service */
    let $wLb = class $wLb extends lifecycle_1.$kc {
        constructor(resultService, a, b) {
            super();
            this.a = a;
            this.b = b;
            this.B(resultService.onResultsChanged((e) => {
                if ('started' in e) {
                    this.c(e.started);
                }
            }));
        }
        c(result) {
            if (result.request.isUiTriggered === false) {
                return;
            }
            const cfg = (0, configuration_2.$hKb)(this.a, "testing.openTesting" /* TestingConfigKeys.OpenTesting */);
            if (cfg === "neverOpen" /* AutoOpenTesting.NeverOpen */) {
                return;
            }
            if (cfg === "openExplorerOnTestStart" /* AutoOpenTesting.OpenExplorerOnTestStart */) {
                return this.f();
            }
            if (cfg === "openOnTestStart" /* AutoOpenTesting.OpenOnTestStart */) {
                return this.g();
            }
            // open on failure
            const disposable = new lifecycle_1.$jc();
            disposable.add(result.onComplete(() => disposable.dispose()));
            disposable.add(result.onChange(e => {
                if (e.reason === 1 /* TestResultItemChangeReason.OwnStateChange */ && (0, testingStates_1.$Psb)(e.item.ownComputedState)) {
                    this.g();
                    disposable.dispose();
                }
            }));
        }
        f() {
            this.b.openView("workbench.view.testing" /* Testing.ExplorerViewId */, false);
        }
        g() {
            this.b.openView("workbench.panel.testResults.view" /* Testing.ResultsViewId */, false);
        }
    };
    exports.$wLb = $wLb;
    exports.$wLb = $wLb = __decorate([
        __param(0, testResultService_1.$ftb),
        __param(1, configuration_1.$8h),
        __param(2, views_1.$$E)
    ], $wLb);
    const $xLb = (isRunning, results) => {
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
    exports.$xLb = $xLb;
    const $yLb = ({ isRunning, passed, runSoFar, totalWillBeRun, skipped, failed }) => {
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
                return (0, nls_1.localize)(0, null);
            }
            else if (skipped === 0) {
                return (0, nls_1.localize)(1, null, passed, totalWillBeRun, percent.toPrecision(3));
            }
            else {
                return (0, nls_1.localize)(2, null, passed, totalWillBeRun, percent.toPrecision(3), skipped);
            }
        }
        else {
            if (skipped === 0) {
                return (0, nls_1.localize)(3, null, passed, runSoFar, percent.toPrecision(3));
            }
            else {
                return (0, nls_1.localize)(4, null, passed, runSoFar, percent.toPrecision(3), skipped);
            }
        }
    };
    exports.$yLb = $yLb;
});
//# sourceMappingURL=testingProgressUiService.js.map