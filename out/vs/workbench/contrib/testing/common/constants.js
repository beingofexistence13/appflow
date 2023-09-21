/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/iconLabels", "vs/nls"], function (require, exports, iconLabels_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestCommandId = exports.testConfigurationGroupNames = exports.labelForTestInState = exports.TestExplorerViewSorting = exports.TestExplorerViewMode = exports.Testing = void 0;
    var Testing;
    (function (Testing) {
        // marked as "extension" so that any existing test extensions are assigned to it.
        Testing["ViewletId"] = "workbench.view.extension.test";
        Testing["ExplorerViewId"] = "workbench.view.testing";
        Testing["OutputPeekContributionId"] = "editor.contrib.testingOutputPeek";
        Testing["DecorationsContributionId"] = "editor.contrib.testingDecorations";
        Testing["ResultsPanelId"] = "workbench.panel.testResults";
        Testing["ResultsViewId"] = "workbench.panel.testResults.view";
    })(Testing || (exports.Testing = Testing = {}));
    var TestExplorerViewMode;
    (function (TestExplorerViewMode) {
        TestExplorerViewMode["List"] = "list";
        TestExplorerViewMode["Tree"] = "true";
    })(TestExplorerViewMode || (exports.TestExplorerViewMode = TestExplorerViewMode = {}));
    var TestExplorerViewSorting;
    (function (TestExplorerViewSorting) {
        TestExplorerViewSorting["ByLocation"] = "location";
        TestExplorerViewSorting["ByStatus"] = "status";
        TestExplorerViewSorting["ByDuration"] = "duration";
    })(TestExplorerViewSorting || (exports.TestExplorerViewSorting = TestExplorerViewSorting = {}));
    const testStateNames = {
        [6 /* TestResultState.Errored */]: (0, nls_1.localize)('testState.errored', 'Errored'),
        [4 /* TestResultState.Failed */]: (0, nls_1.localize)('testState.failed', 'Failed'),
        [3 /* TestResultState.Passed */]: (0, nls_1.localize)('testState.passed', 'Passed'),
        [1 /* TestResultState.Queued */]: (0, nls_1.localize)('testState.queued', 'Queued'),
        [2 /* TestResultState.Running */]: (0, nls_1.localize)('testState.running', 'Running'),
        [5 /* TestResultState.Skipped */]: (0, nls_1.localize)('testState.skipped', 'Skipped'),
        [0 /* TestResultState.Unset */]: (0, nls_1.localize)('testState.unset', 'Not yet run'),
    };
    const labelForTestInState = (label, state) => (0, nls_1.localize)({
        key: 'testing.treeElementLabel',
        comment: ['label then the unit tests state, for example "Addition Tests (Running)"'],
    }, '{0} ({1})', (0, iconLabels_1.stripIcons)(label), testStateNames[state]);
    exports.labelForTestInState = labelForTestInState;
    exports.testConfigurationGroupNames = {
        [4 /* TestRunProfileBitset.Debug */]: (0, nls_1.localize)('testGroup.debug', 'Debug'),
        [2 /* TestRunProfileBitset.Run */]: (0, nls_1.localize)('testGroup.run', 'Run'),
        [8 /* TestRunProfileBitset.Coverage */]: (0, nls_1.localize)('testGroup.coverage', 'Coverage'),
    };
    var TestCommandId;
    (function (TestCommandId) {
        TestCommandId["CancelTestRefreshAction"] = "testing.cancelTestRefresh";
        TestCommandId["CancelTestRunAction"] = "testing.cancelRun";
        TestCommandId["ClearTestResultsAction"] = "testing.clearTestResults";
        TestCommandId["CollapseAllAction"] = "testing.collapseAll";
        TestCommandId["ConfigureTestProfilesAction"] = "testing.configureProfile";
        TestCommandId["ContinousRunUsingForTest"] = "testing.continuousRunUsingForTest";
        TestCommandId["DebugAction"] = "testing.debug";
        TestCommandId["DebugAllAction"] = "testing.debugAll";
        TestCommandId["DebugAtCursor"] = "testing.debugAtCursor";
        TestCommandId["DebugCurrentFile"] = "testing.debugCurrentFile";
        TestCommandId["DebugFailedTests"] = "testing.debugFailTests";
        TestCommandId["DebugLastRun"] = "testing.debugLastRun";
        TestCommandId["DebugSelectedAction"] = "testing.debugSelected";
        TestCommandId["FilterAction"] = "workbench.actions.treeView.testExplorer.filter";
        TestCommandId["GetExplorerSelection"] = "_testing.getExplorerSelection";
        TestCommandId["GetSelectedProfiles"] = "testing.getSelectedProfiles";
        TestCommandId["GoToTest"] = "testing.editFocusedTest";
        TestCommandId["HideTestAction"] = "testing.hideTest";
        TestCommandId["OpenOutputPeek"] = "testing.openOutputPeek";
        TestCommandId["RefreshTestsAction"] = "testing.refreshTests";
        TestCommandId["ReRunFailedTests"] = "testing.reRunFailTests";
        TestCommandId["ReRunLastRun"] = "testing.reRunLastRun";
        TestCommandId["RunAction"] = "testing.run";
        TestCommandId["RunAllAction"] = "testing.runAll";
        TestCommandId["RunAtCursor"] = "testing.runAtCursor";
        TestCommandId["RunCurrentFile"] = "testing.runCurrentFile";
        TestCommandId["RunSelectedAction"] = "testing.runSelected";
        TestCommandId["RunUsingProfileAction"] = "testing.runUsing";
        TestCommandId["SearchForTestExtension"] = "testing.searchForTestExtension";
        TestCommandId["SelectDefaultTestProfiles"] = "testing.selectDefaultTestProfiles";
        TestCommandId["ShowMostRecentOutputAction"] = "testing.showMostRecentOutput";
        TestCommandId["StartContinousRun"] = "testing.startContinuousRun";
        TestCommandId["StopContinousRun"] = "testing.stopContinuousRun";
        TestCommandId["TestingSortByDurationAction"] = "testing.sortByDuration";
        TestCommandId["TestingSortByLocationAction"] = "testing.sortByLocation";
        TestCommandId["TestingSortByStatusAction"] = "testing.sortByStatus";
        TestCommandId["TestingViewAsListAction"] = "testing.viewAsList";
        TestCommandId["TestingViewAsTreeAction"] = "testing.viewAsTree";
        TestCommandId["ToggleContinousRunForTest"] = "testing.toggleContinuousRunForTest";
        TestCommandId["ToggleInlineTestOutput"] = "testing.toggleInlineTestOutput";
        TestCommandId["UnhideAllTestsAction"] = "testing.unhideAllTests";
        TestCommandId["UnhideTestAction"] = "testing.unhideTest";
    })(TestCommandId || (exports.TestCommandId = TestCommandId = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVzdGluZy9jb21tb24vY29uc3RhbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxJQUFrQixPQVNqQjtJQVRELFdBQWtCLE9BQU87UUFDeEIsaUZBQWlGO1FBQ2pGLHNEQUEyQyxDQUFBO1FBQzNDLG9EQUF5QyxDQUFBO1FBQ3pDLHdFQUE2RCxDQUFBO1FBQzdELDBFQUErRCxDQUFBO1FBRS9ELHlEQUE4QyxDQUFBO1FBQzlDLDZEQUFrRCxDQUFBO0lBQ25ELENBQUMsRUFUaUIsT0FBTyx1QkFBUCxPQUFPLFFBU3hCO0lBRUQsSUFBa0Isb0JBR2pCO0lBSEQsV0FBa0Isb0JBQW9CO1FBQ3JDLHFDQUFhLENBQUE7UUFDYixxQ0FBYSxDQUFBO0lBQ2QsQ0FBQyxFQUhpQixvQkFBb0Isb0NBQXBCLG9CQUFvQixRQUdyQztJQUVELElBQWtCLHVCQUlqQjtJQUpELFdBQWtCLHVCQUF1QjtRQUN4QyxrREFBdUIsQ0FBQTtRQUN2Qiw4Q0FBbUIsQ0FBQTtRQUNuQixrREFBdUIsQ0FBQTtJQUN4QixDQUFDLEVBSmlCLHVCQUF1Qix1Q0FBdkIsdUJBQXVCLFFBSXhDO0lBRUQsTUFBTSxjQUFjLEdBQXVDO1FBQzFELGlDQUF5QixFQUFFLElBQUEsY0FBUSxFQUFDLG1CQUFtQixFQUFFLFNBQVMsQ0FBQztRQUNuRSxnQ0FBd0IsRUFBRSxJQUFBLGNBQVEsRUFBQyxrQkFBa0IsRUFBRSxRQUFRLENBQUM7UUFDaEUsZ0NBQXdCLEVBQUUsSUFBQSxjQUFRLEVBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDO1FBQ2hFLGdDQUF3QixFQUFFLElBQUEsY0FBUSxFQUFDLGtCQUFrQixFQUFFLFFBQVEsQ0FBQztRQUNoRSxpQ0FBeUIsRUFBRSxJQUFBLGNBQVEsRUFBQyxtQkFBbUIsRUFBRSxTQUFTLENBQUM7UUFDbkUsaUNBQXlCLEVBQUUsSUFBQSxjQUFRLEVBQUMsbUJBQW1CLEVBQUUsU0FBUyxDQUFDO1FBQ25FLCtCQUF1QixFQUFFLElBQUEsY0FBUSxFQUFDLGlCQUFpQixFQUFFLGFBQWEsQ0FBQztLQUNuRSxDQUFDO0lBRUssTUFBTSxtQkFBbUIsR0FBRyxDQUFDLEtBQWEsRUFBRSxLQUFzQixFQUFFLEVBQUUsQ0FBQyxJQUFBLGNBQVEsRUFBQztRQUN0RixHQUFHLEVBQUUsMEJBQTBCO1FBQy9CLE9BQU8sRUFBRSxDQUFDLHlFQUF5RSxDQUFDO0tBQ3BGLEVBQUUsV0FBVyxFQUFFLElBQUEsdUJBQVUsRUFBQyxLQUFLLENBQUMsRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUg3QyxRQUFBLG1CQUFtQix1QkFHMEI7SUFFN0MsUUFBQSwyQkFBMkIsR0FBOEQ7UUFDckcsb0NBQTRCLEVBQUUsSUFBQSxjQUFRLEVBQUMsaUJBQWlCLEVBQUUsT0FBTyxDQUFDO1FBQ2xFLGtDQUEwQixFQUFFLElBQUEsY0FBUSxFQUFDLGVBQWUsRUFBRSxLQUFLLENBQUM7UUFDNUQsdUNBQStCLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsVUFBVSxDQUFDO0tBQzNFLENBQUM7SUFFRixJQUFrQixhQTJDakI7SUEzQ0QsV0FBa0IsYUFBYTtRQUM5QixzRUFBcUQsQ0FBQTtRQUNyRCwwREFBeUMsQ0FBQTtRQUN6QyxvRUFBbUQsQ0FBQTtRQUNuRCwwREFBeUMsQ0FBQTtRQUN6Qyx5RUFBd0QsQ0FBQTtRQUN4RCwrRUFBOEQsQ0FBQTtRQUM5RCw4Q0FBNkIsQ0FBQTtRQUM3QixvREFBbUMsQ0FBQTtRQUNuQyx3REFBdUMsQ0FBQTtRQUN2Qyw4REFBNkMsQ0FBQTtRQUM3Qyw0REFBMkMsQ0FBQTtRQUMzQyxzREFBcUMsQ0FBQTtRQUNyQyw4REFBNkMsQ0FBQTtRQUM3QyxnRkFBK0QsQ0FBQTtRQUMvRCx1RUFBc0QsQ0FBQTtRQUN0RCxvRUFBbUQsQ0FBQTtRQUNuRCxxREFBb0MsQ0FBQTtRQUNwQyxvREFBbUMsQ0FBQTtRQUNuQywwREFBeUMsQ0FBQTtRQUN6Qyw0REFBMkMsQ0FBQTtRQUMzQyw0REFBMkMsQ0FBQTtRQUMzQyxzREFBcUMsQ0FBQTtRQUNyQywwQ0FBeUIsQ0FBQTtRQUN6QixnREFBK0IsQ0FBQTtRQUMvQixvREFBbUMsQ0FBQTtRQUNuQywwREFBeUMsQ0FBQTtRQUN6QywwREFBeUMsQ0FBQTtRQUN6QywyREFBMEMsQ0FBQTtRQUMxQywwRUFBeUQsQ0FBQTtRQUN6RCxnRkFBK0QsQ0FBQTtRQUMvRCw0RUFBMkQsQ0FBQTtRQUMzRCxpRUFBZ0QsQ0FBQTtRQUNoRCwrREFBOEMsQ0FBQTtRQUM5Qyx1RUFBc0QsQ0FBQTtRQUN0RCx1RUFBc0QsQ0FBQTtRQUN0RCxtRUFBa0QsQ0FBQTtRQUNsRCwrREFBOEMsQ0FBQTtRQUM5QywrREFBOEMsQ0FBQTtRQUM5QyxpRkFBZ0UsQ0FBQTtRQUNoRSwwRUFBeUQsQ0FBQTtRQUN6RCxnRUFBK0MsQ0FBQTtRQUMvQyx3REFBdUMsQ0FBQTtJQUN4QyxDQUFDLEVBM0NpQixhQUFhLDZCQUFiLGFBQWEsUUEyQzlCIn0=