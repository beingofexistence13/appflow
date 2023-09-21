/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/iconLabels", "vs/nls!vs/workbench/contrib/testing/common/constants"], function (require, exports, iconLabels_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestCommandId = exports.$Msb = exports.$Lsb = exports.TestExplorerViewSorting = exports.TestExplorerViewMode = exports.Testing = void 0;
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
        [6 /* TestResultState.Errored */]: (0, nls_1.localize)(0, null),
        [4 /* TestResultState.Failed */]: (0, nls_1.localize)(1, null),
        [3 /* TestResultState.Passed */]: (0, nls_1.localize)(2, null),
        [1 /* TestResultState.Queued */]: (0, nls_1.localize)(3, null),
        [2 /* TestResultState.Running */]: (0, nls_1.localize)(4, null),
        [5 /* TestResultState.Skipped */]: (0, nls_1.localize)(5, null),
        [0 /* TestResultState.Unset */]: (0, nls_1.localize)(6, null),
    };
    const $Lsb = (label, state) => (0, nls_1.localize)(7, null, (0, iconLabels_1.$Tj)(label), testStateNames[state]);



    exports.$Lsb = $Lsb;
    exports.$Msb = {
        [4 /* TestRunProfileBitset.Debug */]: (0, nls_1.localize)(8, null),
        [2 /* TestRunProfileBitset.Run */]: (0, nls_1.localize)(9, null),
        [8 /* TestRunProfileBitset.Coverage */]: (0, nls_1.localize)(10, null),
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
//# sourceMappingURL=constants.js.map