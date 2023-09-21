/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/testing/common/testingContextKeys", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestingContextKeys = void 0;
    var TestingContextKeys;
    (function (TestingContextKeys) {
        TestingContextKeys.providerCount = new contextkey_1.$2i('testing.providerCount', 0);
        TestingContextKeys.canRefreshTests = new contextkey_1.$2i('testing.canRefresh', false, { type: 'boolean', description: (0, nls_1.localize)(0, null) });
        TestingContextKeys.isRefreshingTests = new contextkey_1.$2i('testing.isRefreshing', false, { type: 'boolean', description: (0, nls_1.localize)(1, null) });
        TestingContextKeys.isContinuousModeOn = new contextkey_1.$2i('testing.isContinuousModeOn', false, { type: 'boolean', description: (0, nls_1.localize)(2, null) });
        TestingContextKeys.hasDebuggableTests = new contextkey_1.$2i('testing.hasDebuggableTests', false, { type: 'boolean', description: (0, nls_1.localize)(3, null) });
        TestingContextKeys.hasRunnableTests = new contextkey_1.$2i('testing.hasRunnableTests', false, { type: 'boolean', description: (0, nls_1.localize)(4, null) });
        TestingContextKeys.hasCoverableTests = new contextkey_1.$2i('testing.hasCoverableTests', false, { type: 'boolean', description: (0, nls_1.localize)(5, null) });
        TestingContextKeys.hasNonDefaultProfile = new contextkey_1.$2i('testing.hasNonDefaultProfile', false, { type: 'boolean', description: (0, nls_1.localize)(6, null) });
        TestingContextKeys.hasConfigurableProfile = new contextkey_1.$2i('testing.hasConfigurableProfile', false, { type: 'boolean', description: (0, nls_1.localize)(7, null) });
        TestingContextKeys.supportsContinuousRun = new contextkey_1.$2i('testing.supportsContinuousRun', false, { type: 'boolean', description: (0, nls_1.localize)(8, null) });
        TestingContextKeys.isParentRunningContinuously = new contextkey_1.$2i('testing.isParentRunningContinuously', false, { type: 'boolean', description: (0, nls_1.localize)(9, null) });
        TestingContextKeys.activeEditorHasTests = new contextkey_1.$2i('testing.activeEditorHasTests', false, { type: 'boolean', description: (0, nls_1.localize)(10, null) });
        TestingContextKeys.capabilityToContextKey = {
            [2 /* TestRunProfileBitset.Run */]: TestingContextKeys.hasRunnableTests,
            [8 /* TestRunProfileBitset.Coverage */]: TestingContextKeys.hasCoverableTests,
            [4 /* TestRunProfileBitset.Debug */]: TestingContextKeys.hasDebuggableTests,
            [16 /* TestRunProfileBitset.HasNonDefaultProfile */]: TestingContextKeys.hasNonDefaultProfile,
            [32 /* TestRunProfileBitset.HasConfigurable */]: TestingContextKeys.hasConfigurableProfile,
            [64 /* TestRunProfileBitset.SupportsContinuousRun */]: TestingContextKeys.supportsContinuousRun,
        };
        TestingContextKeys.hasAnyResults = new contextkey_1.$2i('testing.hasAnyResults', false);
        TestingContextKeys.viewMode = new contextkey_1.$2i('testing.explorerViewMode', "list" /* TestExplorerViewMode.List */);
        TestingContextKeys.viewSorting = new contextkey_1.$2i('testing.explorerViewSorting', "location" /* TestExplorerViewSorting.ByLocation */);
        TestingContextKeys.isRunning = new contextkey_1.$2i('testing.isRunning', false);
        TestingContextKeys.isInPeek = new contextkey_1.$2i('testing.isInPeek', false);
        TestingContextKeys.isPeekVisible = new contextkey_1.$2i('testing.isPeekVisible', false);
        TestingContextKeys.peekItemType = new contextkey_1.$2i('peekItemType', undefined, {
            type: 'string',
            description: (0, nls_1.localize)(11, null),
        });
        TestingContextKeys.controllerId = new contextkey_1.$2i('controllerId', undefined, {
            type: 'string',
            description: (0, nls_1.localize)(12, null)
        });
        TestingContextKeys.testItemExtId = new contextkey_1.$2i('testId', undefined, {
            type: 'string',
            description: (0, nls_1.localize)(13, null)
        });
        TestingContextKeys.testItemHasUri = new contextkey_1.$2i('testing.testItemHasUri', false, {
            type: 'boolean',
            description: (0, nls_1.localize)(14, null)
        });
        TestingContextKeys.testItemIsHidden = new contextkey_1.$2i('testing.testItemIsHidden', false, {
            type: 'boolean',
            description: (0, nls_1.localize)(15, null)
        });
        TestingContextKeys.testMessageContext = new contextkey_1.$2i('testMessage', undefined, {
            type: 'string',
            description: (0, nls_1.localize)(16, null)
        });
        TestingContextKeys.testResultOutdated = new contextkey_1.$2i('testResultOutdated', undefined, {
            type: 'boolean',
            description: (0, nls_1.localize)(17, null)
        });
    })(TestingContextKeys || (exports.TestingContextKeys = TestingContextKeys = {}));
});
//# sourceMappingURL=testingContextKeys.js.map