/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls"], function (require, exports, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTestingConfiguration = exports.testingConfiguration = exports.TestingCountBadge = exports.DefaultGutterClickAction = exports.AutoOpenPeekViewWhen = exports.AutoOpenTesting = exports.TestingConfigKeys = void 0;
    var TestingConfigKeys;
    (function (TestingConfigKeys) {
        TestingConfigKeys["AutoRunDelay"] = "testing.autoRun.delay";
        TestingConfigKeys["AutoOpenPeekView"] = "testing.automaticallyOpenPeekView";
        TestingConfigKeys["AutoOpenPeekViewDuringContinuousRun"] = "testing.automaticallyOpenPeekViewDuringAutoRun";
        TestingConfigKeys["OpenTesting"] = "testing.openTesting";
        TestingConfigKeys["FollowRunningTest"] = "testing.followRunningTest";
        TestingConfigKeys["DefaultGutterClickAction"] = "testing.defaultGutterClickAction";
        TestingConfigKeys["GutterEnabled"] = "testing.gutterEnabled";
        TestingConfigKeys["SaveBeforeTest"] = "testing.saveBeforeTest";
        TestingConfigKeys["AlwaysRevealTestOnStateChange"] = "testing.alwaysRevealTestOnStateChange";
        TestingConfigKeys["CountBadge"] = "testing.countBadge";
        TestingConfigKeys["ShowAllMessages"] = "testing.showAllMessages";
    })(TestingConfigKeys || (exports.TestingConfigKeys = TestingConfigKeys = {}));
    var AutoOpenTesting;
    (function (AutoOpenTesting) {
        AutoOpenTesting["NeverOpen"] = "neverOpen";
        AutoOpenTesting["OpenOnTestStart"] = "openOnTestStart";
        AutoOpenTesting["OpenOnTestFailure"] = "openOnTestFailure";
        AutoOpenTesting["OpenExplorerOnTestStart"] = "openExplorerOnTestStart";
    })(AutoOpenTesting || (exports.AutoOpenTesting = AutoOpenTesting = {}));
    var AutoOpenPeekViewWhen;
    (function (AutoOpenPeekViewWhen) {
        AutoOpenPeekViewWhen["FailureVisible"] = "failureInVisibleDocument";
        AutoOpenPeekViewWhen["FailureAnywhere"] = "failureAnywhere";
        AutoOpenPeekViewWhen["Never"] = "never";
    })(AutoOpenPeekViewWhen || (exports.AutoOpenPeekViewWhen = AutoOpenPeekViewWhen = {}));
    var DefaultGutterClickAction;
    (function (DefaultGutterClickAction) {
        DefaultGutterClickAction["Run"] = "run";
        DefaultGutterClickAction["Debug"] = "debug";
        DefaultGutterClickAction["ContextMenu"] = "contextMenu";
    })(DefaultGutterClickAction || (exports.DefaultGutterClickAction = DefaultGutterClickAction = {}));
    var TestingCountBadge;
    (function (TestingCountBadge) {
        TestingCountBadge["Failed"] = "failed";
        TestingCountBadge["Off"] = "off";
        TestingCountBadge["Passed"] = "passed";
        TestingCountBadge["Skipped"] = "skipped";
    })(TestingCountBadge || (exports.TestingCountBadge = TestingCountBadge = {}));
    exports.testingConfiguration = {
        id: 'testing',
        order: 21,
        title: (0, nls_1.localize)('testConfigurationTitle', "Testing"),
        type: 'object',
        properties: {
            ["testing.autoRun.delay" /* TestingConfigKeys.AutoRunDelay */]: {
                type: 'integer',
                minimum: 0,
                description: (0, nls_1.localize)('testing.autoRun.delay', "How long to wait, in milliseconds, after a test is marked as outdated and starting a new run."),
                default: 1000,
            },
            ["testing.automaticallyOpenPeekView" /* TestingConfigKeys.AutoOpenPeekView */]: {
                description: (0, nls_1.localize)('testing.automaticallyOpenPeekView', "Configures when the error Peek view is automatically opened."),
                enum: [
                    "failureAnywhere" /* AutoOpenPeekViewWhen.FailureAnywhere */,
                    "failureInVisibleDocument" /* AutoOpenPeekViewWhen.FailureVisible */,
                    "never" /* AutoOpenPeekViewWhen.Never */,
                ],
                default: "failureInVisibleDocument" /* AutoOpenPeekViewWhen.FailureVisible */,
                enumDescriptions: [
                    (0, nls_1.localize)('testing.automaticallyOpenPeekView.failureAnywhere', "Open automatically no matter where the failure is."),
                    (0, nls_1.localize)('testing.automaticallyOpenPeekView.failureInVisibleDocument', "Open automatically when a test fails in a visible document."),
                    (0, nls_1.localize)('testing.automaticallyOpenPeekView.never', "Never automatically open."),
                ],
            },
            ["testing.showAllMessages" /* TestingConfigKeys.ShowAllMessages */]: {
                description: (0, nls_1.localize)('testing.showAllMessages', "Controls whether to show messages from all test runs."),
                type: 'boolean',
                default: false,
            },
            ["testing.automaticallyOpenPeekViewDuringAutoRun" /* TestingConfigKeys.AutoOpenPeekViewDuringContinuousRun */]: {
                description: (0, nls_1.localize)('testing.automaticallyOpenPeekViewDuringContinuousRun', "Controls whether to automatically open the Peek view during continuous run mode."),
                type: 'boolean',
                default: false,
            },
            ["testing.countBadge" /* TestingConfigKeys.CountBadge */]: {
                description: (0, nls_1.localize)('testing.countBadge', 'Controls the count badge on the Testing icon on the Activity Bar.'),
                enum: [
                    "failed" /* TestingCountBadge.Failed */,
                    "off" /* TestingCountBadge.Off */,
                    "passed" /* TestingCountBadge.Passed */,
                    "skipped" /* TestingCountBadge.Skipped */,
                ],
                enumDescriptions: [
                    (0, nls_1.localize)('testing.countBadge.failed', 'Show the number of failed tests'),
                    (0, nls_1.localize)('testing.countBadge.off', 'Disable the testing count badge'),
                    (0, nls_1.localize)('testing.countBadge.passed', 'Show the number of passed tests'),
                    (0, nls_1.localize)('testing.countBadge.skipped', 'Show the number of skipped tests'),
                ],
                default: "failed" /* TestingCountBadge.Failed */,
            },
            ["testing.followRunningTest" /* TestingConfigKeys.FollowRunningTest */]: {
                description: (0, nls_1.localize)('testing.followRunningTest', 'Controls whether the running test should be followed in the Test Explorer view.'),
                type: 'boolean',
                default: true,
            },
            ["testing.defaultGutterClickAction" /* TestingConfigKeys.DefaultGutterClickAction */]: {
                description: (0, nls_1.localize)('testing.defaultGutterClickAction', 'Controls the action to take when left-clicking on a test decoration in the gutter.'),
                enum: [
                    "run" /* DefaultGutterClickAction.Run */,
                    "debug" /* DefaultGutterClickAction.Debug */,
                    "contextMenu" /* DefaultGutterClickAction.ContextMenu */,
                ],
                enumDescriptions: [
                    (0, nls_1.localize)('testing.defaultGutterClickAction.run', 'Run the test.'),
                    (0, nls_1.localize)('testing.defaultGutterClickAction.debug', 'Debug the test.'),
                    (0, nls_1.localize)('testing.defaultGutterClickAction.contextMenu', 'Open the context menu for more options.'),
                ],
                default: "run" /* DefaultGutterClickAction.Run */,
            },
            ["testing.gutterEnabled" /* TestingConfigKeys.GutterEnabled */]: {
                description: (0, nls_1.localize)('testing.gutterEnabled', 'Controls whether test decorations are shown in the editor gutter.'),
                type: 'boolean',
                default: true,
            },
            ["testing.saveBeforeTest" /* TestingConfigKeys.SaveBeforeTest */]: {
                description: (0, nls_1.localize)('testing.saveBeforeTest', 'Control whether save all dirty editors before running a test.'),
                type: 'boolean',
                default: true,
            },
            ["testing.openTesting" /* TestingConfigKeys.OpenTesting */]: {
                enum: [
                    "neverOpen" /* AutoOpenTesting.NeverOpen */,
                    "openOnTestStart" /* AutoOpenTesting.OpenOnTestStart */,
                    "openOnTestFailure" /* AutoOpenTesting.OpenOnTestFailure */,
                    "openExplorerOnTestStart" /* AutoOpenTesting.OpenExplorerOnTestStart */,
                ],
                enumDescriptions: [
                    (0, nls_1.localize)('testing.openTesting.neverOpen', 'Never automatically open the testing views'),
                    (0, nls_1.localize)('testing.openTesting.openOnTestStart', 'Open the test results view when tests start'),
                    (0, nls_1.localize)('testing.openTesting.openOnTestFailure', 'Open the test result view on any test failure'),
                    (0, nls_1.localize)('testing.openTesting.openExplorerOnTestStart', 'Open the test explorer when tests start'),
                ],
                default: 'openOnTestStart',
                description: (0, nls_1.localize)('testing.openTesting', "Controls when the testing view should open.")
            },
            ["testing.alwaysRevealTestOnStateChange" /* TestingConfigKeys.AlwaysRevealTestOnStateChange */]: {
                markdownDescription: (0, nls_1.localize)('testing.alwaysRevealTestOnStateChange', "Always reveal the executed test when `#testing.followRunningTest#` is on. If this setting is turned off, only failed tests will be revealed."),
                type: 'boolean',
                default: false,
            },
        }
    };
    const getTestingConfiguration = (config, key) => config.getValue(key);
    exports.getTestingConfiguration = getTestingConfiguration;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlc3RpbmcvY29tbW9uL2NvbmZpZ3VyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLElBQWtCLGlCQVlqQjtJQVpELFdBQWtCLGlCQUFpQjtRQUNsQywyREFBc0MsQ0FBQTtRQUN0QywyRUFBc0QsQ0FBQTtRQUN0RCwyR0FBc0YsQ0FBQTtRQUN0Rix3REFBbUMsQ0FBQTtRQUNuQyxvRUFBK0MsQ0FBQTtRQUMvQyxrRkFBNkQsQ0FBQTtRQUM3RCw0REFBdUMsQ0FBQTtRQUN2Qyw4REFBeUMsQ0FBQTtRQUN6Qyw0RkFBdUUsQ0FBQTtRQUN2RSxzREFBaUMsQ0FBQTtRQUNqQyxnRUFBMkMsQ0FBQTtJQUM1QyxDQUFDLEVBWmlCLGlCQUFpQixpQ0FBakIsaUJBQWlCLFFBWWxDO0lBRUQsSUFBa0IsZUFLakI7SUFMRCxXQUFrQixlQUFlO1FBQ2hDLDBDQUF1QixDQUFBO1FBQ3ZCLHNEQUFtQyxDQUFBO1FBQ25DLDBEQUF1QyxDQUFBO1FBQ3ZDLHNFQUFtRCxDQUFBO0lBQ3BELENBQUMsRUFMaUIsZUFBZSwrQkFBZixlQUFlLFFBS2hDO0lBRUQsSUFBa0Isb0JBSWpCO0lBSkQsV0FBa0Isb0JBQW9CO1FBQ3JDLG1FQUEyQyxDQUFBO1FBQzNDLDJEQUFtQyxDQUFBO1FBQ25DLHVDQUFlLENBQUE7SUFDaEIsQ0FBQyxFQUppQixvQkFBb0Isb0NBQXBCLG9CQUFvQixRQUlyQztJQUVELElBQWtCLHdCQUlqQjtJQUpELFdBQWtCLHdCQUF3QjtRQUN6Qyx1Q0FBVyxDQUFBO1FBQ1gsMkNBQWUsQ0FBQTtRQUNmLHVEQUEyQixDQUFBO0lBQzVCLENBQUMsRUFKaUIsd0JBQXdCLHdDQUF4Qix3QkFBd0IsUUFJekM7SUFFRCxJQUFrQixpQkFLakI7SUFM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