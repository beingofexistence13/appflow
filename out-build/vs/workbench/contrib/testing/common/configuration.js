/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/testing/common/configuration"], function (require, exports, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hKb = exports.$gKb = exports.TestingCountBadge = exports.DefaultGutterClickAction = exports.AutoOpenPeekViewWhen = exports.AutoOpenTesting = exports.TestingConfigKeys = void 0;
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
    exports.$gKb = {
        id: 'testing',
        order: 21,
        title: (0, nls_1.localize)(0, null),
        type: 'object',
        properties: {
            ["testing.autoRun.delay" /* TestingConfigKeys.AutoRunDelay */]: {
                type: 'integer',
                minimum: 0,
                description: (0, nls_1.localize)(1, null),
                default: 1000,
            },
            ["testing.automaticallyOpenPeekView" /* TestingConfigKeys.AutoOpenPeekView */]: {
                description: (0, nls_1.localize)(2, null),
                enum: [
                    "failureAnywhere" /* AutoOpenPeekViewWhen.FailureAnywhere */,
                    "failureInVisibleDocument" /* AutoOpenPeekViewWhen.FailureVisible */,
                    "never" /* AutoOpenPeekViewWhen.Never */,
                ],
                default: "failureInVisibleDocument" /* AutoOpenPeekViewWhen.FailureVisible */,
                enumDescriptions: [
                    (0, nls_1.localize)(3, null),
                    (0, nls_1.localize)(4, null),
                    (0, nls_1.localize)(5, null),
                ],
            },
            ["testing.showAllMessages" /* TestingConfigKeys.ShowAllMessages */]: {
                description: (0, nls_1.localize)(6, null),
                type: 'boolean',
                default: false,
            },
            ["testing.automaticallyOpenPeekViewDuringAutoRun" /* TestingConfigKeys.AutoOpenPeekViewDuringContinuousRun */]: {
                description: (0, nls_1.localize)(7, null),
                type: 'boolean',
                default: false,
            },
            ["testing.countBadge" /* TestingConfigKeys.CountBadge */]: {
                description: (0, nls_1.localize)(8, null),
                enum: [
                    "failed" /* TestingCountBadge.Failed */,
                    "off" /* TestingCountBadge.Off */,
                    "passed" /* TestingCountBadge.Passed */,
                    "skipped" /* TestingCountBadge.Skipped */,
                ],
                enumDescriptions: [
                    (0, nls_1.localize)(9, null),
                    (0, nls_1.localize)(10, null),
                    (0, nls_1.localize)(11, null),
                    (0, nls_1.localize)(12, null),
                ],
                default: "failed" /* TestingCountBadge.Failed */,
            },
            ["testing.followRunningTest" /* TestingConfigKeys.FollowRunningTest */]: {
                description: (0, nls_1.localize)(13, null),
                type: 'boolean',
                default: true,
            },
            ["testing.defaultGutterClickAction" /* TestingConfigKeys.DefaultGutterClickAction */]: {
                description: (0, nls_1.localize)(14, null),
                enum: [
                    "run" /* DefaultGutterClickAction.Run */,
                    "debug" /* DefaultGutterClickAction.Debug */,
                    "contextMenu" /* DefaultGutterClickAction.ContextMenu */,
                ],
                enumDescriptions: [
                    (0, nls_1.localize)(15, null),
                    (0, nls_1.localize)(16, null),
                    (0, nls_1.localize)(17, null),
                ],
                default: "run" /* DefaultGutterClickAction.Run */,
            },
            ["testing.gutterEnabled" /* TestingConfigKeys.GutterEnabled */]: {
                description: (0, nls_1.localize)(18, null),
                type: 'boolean',
                default: true,
            },
            ["testing.saveBeforeTest" /* TestingConfigKeys.SaveBeforeTest */]: {
                description: (0, nls_1.localize)(19, null),
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
                    (0, nls_1.localize)(20, null),
                    (0, nls_1.localize)(21, null),
                    (0, nls_1.localize)(22, null),
                    (0, nls_1.localize)(23, null),
                ],
                default: 'openOnTestStart',
                description: (0, nls_1.localize)(24, null)
            },
            ["testing.alwaysRevealTestOnStateChange" /* TestingConfigKeys.AlwaysRevealTestOnStateChange */]: {
                markdownDescription: (0, nls_1.localize)(25, null),
                type: 'boolean',
                default: false,
            },
        }
    };
    const $hKb = (config, key) => config.getValue(key);
    exports.$hKb = $hKb;
});
//# sourceMappingURL=configuration.js.map