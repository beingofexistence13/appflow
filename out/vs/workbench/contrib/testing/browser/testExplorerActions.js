/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/codicons", "vs/base/common/keyCodes", "vs/base/common/types", "vs/editor/browser/editorBrowser", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/contrib/message/browser/messageController", "vs/nls", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "vs/platform/quickinput/common/quickInput", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/contextkeys", "vs/workbench/common/views", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/testing/browser/explorerProjections/index", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/constants", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testingContinuousRunService", "vs/workbench/contrib/testing/common/testingPeekOpener", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, arrays_1, codicons_1, keyCodes_1, types_1, editorBrowser_1, position_1, range_1, editorContextKeys_1, messageController_1, nls_1, actionCommonCategories_1, actions_1, commands_1, configuration_1, contextkey_1, notification_1, progress_1, quickInput_1, uriIdentity_1, viewPane_1, contextkeys_1, views_1, extensions_1, index_1, icons, configuration_2, constants_1, testId_1, testProfileService_1, testResultService_1, testService_1, testingContextKeys_1, testingContinuousRunService_1, testingPeekOpener_1, testingStates_1, editorService_1, panecomposite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.allTestActions = exports.CancelTestRefreshAction = exports.RefreshTestsAction = exports.ToggleInlineTestOutput = exports.OpenOutputPeek = exports.SearchForTestExtension = exports.DebugLastRun = exports.ReRunLastRun = exports.DebugFailedTests = exports.ReRunFailedTests = exports.discoverAndRunTests = exports.DebugCurrentFile = exports.RunCurrentFile = exports.DebugAtCursor = exports.RunAtCursor = exports.GoToTest = exports.ClearTestResultsAction = exports.CollapseAllAction = exports.ShowMostRecentOutputAction = exports.TestingSortByDurationAction = exports.TestingSortByLocationAction = exports.TestingSortByStatusAction = exports.TestingViewAsTreeAction = exports.TestingViewAsListAction = exports.CancelTestRunAction = exports.DebugAllAction = exports.RunAllAction = exports.DebugSelectedAction = exports.RunSelectedAction = exports.GetExplorerSelection = exports.GetSelectedProfiles = exports.ConfigureTestProfilesAction = exports.ContinuousRunUsingProfileTestAction = exports.ContinuousRunTestAction = exports.SelectDefaultTestProfiles = exports.RunAction = exports.RunUsingProfileAction = exports.DebugAction = exports.UnhideAllTestsAction = exports.UnhideTestAction = exports.HideTestAction = void 0;
    const category = actionCommonCategories_1.Categories.Test;
    var ActionOrder;
    (function (ActionOrder) {
        // Navigation:
        ActionOrder[ActionOrder["Refresh"] = 10] = "Refresh";
        ActionOrder[ActionOrder["Run"] = 11] = "Run";
        ActionOrder[ActionOrder["Debug"] = 12] = "Debug";
        ActionOrder[ActionOrder["Coverage"] = 13] = "Coverage";
        ActionOrder[ActionOrder["RunContinuous"] = 14] = "RunContinuous";
        ActionOrder[ActionOrder["RunUsing"] = 15] = "RunUsing";
        // Submenu:
        ActionOrder[ActionOrder["Collapse"] = 16] = "Collapse";
        ActionOrder[ActionOrder["ClearResults"] = 17] = "ClearResults";
        ActionOrder[ActionOrder["DisplayMode"] = 18] = "DisplayMode";
        ActionOrder[ActionOrder["Sort"] = 19] = "Sort";
        ActionOrder[ActionOrder["GoToTest"] = 20] = "GoToTest";
        ActionOrder[ActionOrder["HideTest"] = 21] = "HideTest";
        ActionOrder[ActionOrder["ContinuousRunTest"] = 2147483647] = "ContinuousRunTest";
    })(ActionOrder || (ActionOrder = {}));
    const hasAnyTestProvider = contextkey_1.ContextKeyGreaterExpr.create(testingContextKeys_1.TestingContextKeys.providerCount.key, 0);
    class HideTestAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.hideTest" /* TestCommandId.HideTestAction */,
                title: (0, nls_1.localize)('hideTest', 'Hide Test'),
                menu: {
                    id: actions_1.MenuId.TestItem,
                    group: 'builtin@2',
                    when: testingContextKeys_1.TestingContextKeys.testItemIsHidden.isEqualTo(false)
                },
            });
        }
        run(accessor, ...elements) {
            const service = accessor.get(testService_1.ITestService);
            for (const element of elements) {
                service.excluded.toggle(element.test, true);
            }
            return Promise.resolve();
        }
    }
    exports.HideTestAction = HideTestAction;
    class UnhideTestAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.unhideTest" /* TestCommandId.UnhideTestAction */,
                title: (0, nls_1.localize)('unhideTest', 'Unhide Test'),
                menu: {
                    id: actions_1.MenuId.TestItem,
                    order: 21 /* ActionOrder.HideTest */,
                    when: testingContextKeys_1.TestingContextKeys.testItemIsHidden.isEqualTo(true)
                },
            });
        }
        run(accessor, ...elements) {
            const service = accessor.get(testService_1.ITestService);
            for (const element of elements) {
                if (element instanceof index_1.TestItemTreeElement) {
                    service.excluded.toggle(element.test, false);
                }
            }
            return Promise.resolve();
        }
    }
    exports.UnhideTestAction = UnhideTestAction;
    class UnhideAllTestsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.unhideAllTests" /* TestCommandId.UnhideAllTestsAction */,
                title: (0, nls_1.localize)('unhideAllTests', 'Unhide All Tests'),
            });
        }
        run(accessor) {
            const service = accessor.get(testService_1.ITestService);
            service.excluded.clear();
            return Promise.resolve();
        }
    }
    exports.UnhideAllTestsAction = UnhideAllTestsAction;
    const testItemInlineAndInContext = (order, when) => [
        {
            id: actions_1.MenuId.TestItem,
            group: 'inline',
            order,
            when,
        }, {
            id: actions_1.MenuId.TestItem,
            group: 'builtin@1',
            order,
            when,
        }
    ];
    class DebugAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.debug" /* TestCommandId.DebugAction */,
                title: (0, nls_1.localize)('debug test', 'Debug Test'),
                icon: icons.testingDebugIcon,
                menu: testItemInlineAndInContext(12 /* ActionOrder.Debug */, testingContextKeys_1.TestingContextKeys.hasDebuggableTests.isEqualTo(true)),
            });
        }
        run(acessor, ...elements) {
            return acessor.get(testService_1.ITestService).runTests({
                tests: elements.map(e => e.test),
                group: 4 /* TestRunProfileBitset.Debug */,
            });
        }
    }
    exports.DebugAction = DebugAction;
    class RunUsingProfileAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.runUsing" /* TestCommandId.RunUsingProfileAction */,
                title: (0, nls_1.localize)('testing.runUsing', 'Execute Using Profile...'),
                icon: icons.testingDebugIcon,
                menu: {
                    id: actions_1.MenuId.TestItem,
                    order: 15 /* ActionOrder.RunUsing */,
                    group: 'builtin@2',
                    when: testingContextKeys_1.TestingContextKeys.hasNonDefaultProfile.isEqualTo(true),
                },
            });
        }
        async run(acessor, ...elements) {
            const commandService = acessor.get(commands_1.ICommandService);
            const testService = acessor.get(testService_1.ITestService);
            const profile = await commandService.executeCommand('vscode.pickTestProfile', {
                onlyForTest: elements[0].test,
            });
            if (!profile) {
                return;
            }
            testService.runResolvedTests({
                targets: [{
                        profileGroup: profile.group,
                        profileId: profile.profileId,
                        controllerId: profile.controllerId,
                        testIds: elements.filter(t => (0, testProfileService_1.canUseProfileWithTest)(profile, t.test)).map(t => t.test.item.extId)
                    }]
            });
        }
    }
    exports.RunUsingProfileAction = RunUsingProfileAction;
    class RunAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.run" /* TestCommandId.RunAction */,
                title: (0, nls_1.localize)('run test', 'Run Test'),
                icon: icons.testingRunIcon,
                menu: testItemInlineAndInContext(11 /* ActionOrder.Run */, testingContextKeys_1.TestingContextKeys.hasRunnableTests.isEqualTo(true)),
            });
        }
        /**
         * @override
         */
        run(acessor, ...elements) {
            return acessor.get(testService_1.ITestService).runTests({
                tests: elements.map(e => e.test),
                group: 2 /* TestRunProfileBitset.Run */,
            });
        }
    }
    exports.RunAction = RunAction;
    class SelectDefaultTestProfiles extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.selectDefaultTestProfiles" /* TestCommandId.SelectDefaultTestProfiles */,
                title: (0, nls_1.localize)('testing.selectDefaultTestProfiles', 'Select Default Profile'),
                icon: icons.testingUpdateProfiles,
                category,
            });
        }
        async run(acessor, onlyGroup) {
            const commands = acessor.get(commands_1.ICommandService);
            const testProfileService = acessor.get(testProfileService_1.ITestProfileService);
            const profiles = await commands.executeCommand('vscode.pickMultipleTestProfiles', {
                showConfigureButtons: false,
                selected: testProfileService.getGroupDefaultProfiles(onlyGroup),
                onlyGroup,
            });
            if (profiles?.length) {
                testProfileService.setGroupDefaultProfiles(onlyGroup, profiles);
            }
        }
    }
    exports.SelectDefaultTestProfiles = SelectDefaultTestProfiles;
    class ContinuousRunTestAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.toggleContinuousRunForTest" /* TestCommandId.ToggleContinousRunForTest */,
                title: (0, nls_1.localize)('testing.toggleContinuousRunOn', 'Turn on Continuous Run'),
                icon: icons.testingTurnContinuousRunOn,
                precondition: contextkey_1.ContextKeyExpr.or(testingContextKeys_1.TestingContextKeys.isContinuousModeOn.isEqualTo(true), testingContextKeys_1.TestingContextKeys.isParentRunningContinuously.isEqualTo(false)),
                toggled: {
                    condition: testingContextKeys_1.TestingContextKeys.isContinuousModeOn.isEqualTo(true),
                    icon: icons.testingContinuousIsOn,
                    title: (0, nls_1.localize)('testing.toggleContinuousRunOff', 'Turn off Continuous Run'),
                },
                menu: testItemInlineAndInContext(2147483647 /* ActionOrder.ContinuousRunTest */, testingContextKeys_1.TestingContextKeys.supportsContinuousRun.isEqualTo(true)),
            });
        }
        async run(accessor, ...elements) {
            const crService = accessor.get(testingContinuousRunService_1.ITestingContinuousRunService);
            const profileService = accessor.get(testProfileService_1.ITestProfileService);
            for (const element of elements) {
                const id = element.test.item.extId;
                if (crService.isSpecificallyEnabledFor(id)) {
                    crService.stop(id);
                    continue;
                }
                const profiles = profileService.getGroupDefaultProfiles(2 /* TestRunProfileBitset.Run */)
                    .filter(p => p.supportsContinuousRun && p.controllerId === element.test.controllerId);
                if (!profiles.length) {
                    continue;
                }
                crService.start(profiles, id);
            }
        }
    }
    exports.ContinuousRunTestAction = ContinuousRunTestAction;
    class ContinuousRunUsingProfileTestAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.continuousRunUsingForTest" /* TestCommandId.ContinousRunUsingForTest */,
                title: (0, nls_1.localize)('testing.startContinuousRunUsing', 'Start Continous Run Using...'),
                icon: icons.testingDebugIcon,
                menu: [
                    {
                        id: actions_1.MenuId.TestItem,
                        order: 14 /* ActionOrder.RunContinuous */,
                        group: 'builtin@2',
                        when: contextkey_1.ContextKeyExpr.and(testingContextKeys_1.TestingContextKeys.supportsContinuousRun.isEqualTo(true), testingContextKeys_1.TestingContextKeys.isContinuousModeOn.isEqualTo(false))
                    }
                ],
            });
        }
        async run(accessor, ...elements) {
            const crService = accessor.get(testingContinuousRunService_1.ITestingContinuousRunService);
            const profileService = accessor.get(testProfileService_1.ITestProfileService);
            const notificationService = accessor.get(notification_1.INotificationService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            for (const element of elements) {
                const selected = await selectContinuousRunProfiles(crService, notificationService, quickInputService, [{ profiles: profileService.getControllerProfiles(element.test.controllerId) }]);
                if (selected.length) {
                    crService.start(selected, element.test.item.extId);
                }
            }
        }
    }
    exports.ContinuousRunUsingProfileTestAction = ContinuousRunUsingProfileTestAction;
    class ConfigureTestProfilesAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.configureProfile" /* TestCommandId.ConfigureTestProfilesAction */,
                title: { value: (0, nls_1.localize)('testing.configureProfile', 'Configure Test Profiles'), original: 'Configure Test Profiles' },
                icon: icons.testingUpdateProfiles,
                f1: true,
                category,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: testingContextKeys_1.TestingContextKeys.hasConfigurableProfile.isEqualTo(true),
                },
            });
        }
        async run(acessor, onlyGroup) {
            const commands = acessor.get(commands_1.ICommandService);
            const testProfileService = acessor.get(testProfileService_1.ITestProfileService);
            const profile = await commands.executeCommand('vscode.pickTestProfile', {
                placeholder: (0, nls_1.localize)('configureProfile', 'Select a profile to update'),
                showConfigureButtons: false,
                onlyConfigurable: true,
                onlyGroup,
            });
            if (profile) {
                testProfileService.configure(profile.controllerId, profile.profileId);
            }
        }
    }
    exports.ConfigureTestProfilesAction = ConfigureTestProfilesAction;
    const continuousMenus = (whenIsContinuousOn) => [
        {
            id: actions_1.MenuId.ViewTitle,
            group: 'navigation',
            order: 15 /* ActionOrder.RunUsing */,
            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */), testingContextKeys_1.TestingContextKeys.supportsContinuousRun.isEqualTo(true), testingContextKeys_1.TestingContextKeys.isContinuousModeOn.isEqualTo(whenIsContinuousOn)),
        },
        {
            id: actions_1.MenuId.CommandPalette,
            when: testingContextKeys_1.TestingContextKeys.supportsContinuousRun.isEqualTo(true),
        },
    ];
    class StopContinuousRunAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.stopContinuousRun" /* TestCommandId.StopContinousRun */,
                title: { value: (0, nls_1.localize)('testing.stopContinuous', "Stop Continuous Run"), original: 'Stop Continuous Run' },
                category,
                icon: icons.testingTurnContinuousRunOff,
                menu: continuousMenus(true),
            });
        }
        run(accessor) {
            accessor.get(testingContinuousRunService_1.ITestingContinuousRunService).stop();
        }
    }
    function selectContinuousRunProfiles(crs, notificationService, quickInputService, profilesToPickFrom) {
        const items = [];
        for (const { controller, profiles } of profilesToPickFrom) {
            for (const profile of profiles) {
                if (profile.supportsContinuousRun) {
                    items.push({
                        label: profile.label || controller?.label.value || '',
                        description: controller?.label.value,
                        profile,
                    });
                }
            }
        }
        if (items.length === 0) {
            notificationService.info((0, nls_1.localize)('testing.noProfiles', 'No test continuous run-enabled profiles were found'));
            return Promise.resolve([]);
        }
        // special case: don't bother to quick a pickpick if there's only a single profile
        if (items.length === 1) {
            return Promise.resolve([items[0].profile]);
        }
        const qpItems = [];
        const selectedItems = [];
        const lastRun = crs.lastRunProfileIds;
        items.sort((a, b) => a.profile.group - b.profile.group
            || a.profile.controllerId.localeCompare(b.profile.controllerId)
            || a.label.localeCompare(b.label));
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (i === 0 || items[i - 1].profile.group !== item.profile.group) {
                qpItems.push({ type: 'separator', label: constants_1.testConfigurationGroupNames[item.profile.group] });
            }
            qpItems.push(item);
            if (lastRun.has(item.profile.profileId)) {
                selectedItems.push(item);
            }
        }
        const quickpick = quickInputService.createQuickPick();
        quickpick.title = (0, nls_1.localize)('testing.selectContinuousProfiles', 'Select profiles to run when files change:');
        quickpick.canSelectMany = true;
        quickpick.items = qpItems;
        quickpick.selectedItems = selectedItems;
        quickpick.show();
        return new Promise((resolve, reject) => {
            quickpick.onDidAccept(() => {
                resolve(quickpick.selectedItems.map(i => i.profile));
                quickpick.dispose();
            });
            quickpick.onDidHide(() => {
                resolve([]);
                quickpick.dispose();
            });
        });
    }
    class StartContinuousRunAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.startContinuousRun" /* TestCommandId.StartContinousRun */,
                title: { value: (0, nls_1.localize)('testing.startContinuous', "Start Continuous Run"), original: 'Enable Continuous Run' },
                category,
                icon: icons.testingTurnContinuousRunOn,
                menu: continuousMenus(false),
            });
        }
        async run(accessor, ...args) {
            const crs = accessor.get(testingContinuousRunService_1.ITestingContinuousRunService);
            const selected = await selectContinuousRunProfiles(crs, accessor.get(notification_1.INotificationService), accessor.get(quickInput_1.IQuickInputService), accessor.get(testProfileService_1.ITestProfileService).all());
            if (selected.length) {
                crs.start(selected);
            }
        }
    }
    class ExecuteSelectedAction extends viewPane_1.ViewAction {
        constructor(options, group) {
            super({
                ...options,
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        order: group === 2 /* TestRunProfileBitset.Run */
                            ? 11 /* ActionOrder.Run */
                            : group === 4 /* TestRunProfileBitset.Debug */
                                ? 12 /* ActionOrder.Debug */
                                : 13 /* ActionOrder.Coverage */,
                        group: 'navigation',
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */), testingContextKeys_1.TestingContextKeys.isRunning.isEqualTo(false), testingContextKeys_1.TestingContextKeys.capabilityToContextKey[group].isEqualTo(true))
                    }],
                category,
                viewId: "workbench.view.testing" /* Testing.ExplorerViewId */,
            });
            this.group = group;
        }
        /**
         * @override
         */
        runInView(accessor, view) {
            const { include, exclude } = view.getTreeIncludeExclude();
            return accessor.get(testService_1.ITestService).runTests({ tests: include, exclude, group: this.group });
        }
    }
    class GetSelectedProfiles extends actions_1.Action2 {
        constructor() {
            super({ id: "testing.getSelectedProfiles" /* TestCommandId.GetSelectedProfiles */, title: (0, nls_1.localize)('getSelectedProfiles', 'Get Selected Profiles') });
        }
        /**
         * @override
         */
        run(accessor) {
            const profiles = accessor.get(testProfileService_1.ITestProfileService);
            return [
                ...profiles.getGroupDefaultProfiles(2 /* TestRunProfileBitset.Run */),
                ...profiles.getGroupDefaultProfiles(4 /* TestRunProfileBitset.Debug */),
                ...profiles.getGroupDefaultProfiles(8 /* TestRunProfileBitset.Coverage */),
            ].map(p => ({
                controllerId: p.controllerId,
                label: p.label,
                kind: p.group & 8 /* TestRunProfileBitset.Coverage */
                    ? 3 /* ExtTestRunProfileKind.Coverage */
                    : p.group & 4 /* TestRunProfileBitset.Debug */
                        ? 2 /* ExtTestRunProfileKind.Debug */
                        : 1 /* ExtTestRunProfileKind.Run */,
            }));
        }
    }
    exports.GetSelectedProfiles = GetSelectedProfiles;
    class GetExplorerSelection extends viewPane_1.ViewAction {
        constructor() {
            super({ id: "_testing.getExplorerSelection" /* TestCommandId.GetExplorerSelection */, title: (0, nls_1.localize)('getExplorerSelection', 'Get Explorer Selection'), viewId: "workbench.view.testing" /* Testing.ExplorerViewId */ });
        }
        /**
         * @override
         */
        runInView(_accessor, view) {
            const { include, exclude } = view.getTreeIncludeExclude(undefined, 'selected');
            const mapper = (i) => i.item.extId;
            return { include: include.map(mapper), exclude: exclude.map(mapper) };
        }
    }
    exports.GetExplorerSelection = GetExplorerSelection;
    class RunSelectedAction extends ExecuteSelectedAction {
        constructor() {
            super({
                id: "testing.runSelected" /* TestCommandId.RunSelectedAction */,
                title: (0, nls_1.localize)('runSelectedTests', 'Run Tests'),
                icon: icons.testingRunAllIcon,
            }, 2 /* TestRunProfileBitset.Run */);
        }
    }
    exports.RunSelectedAction = RunSelectedAction;
    class DebugSelectedAction extends ExecuteSelectedAction {
        constructor() {
            super({
                id: "testing.debugSelected" /* TestCommandId.DebugSelectedAction */,
                title: (0, nls_1.localize)('debugSelectedTests', 'Debug Tests'),
                icon: icons.testingDebugAllIcon,
            }, 4 /* TestRunProfileBitset.Debug */);
        }
    }
    exports.DebugSelectedAction = DebugSelectedAction;
    const showDiscoveringWhile = (progress, task) => {
        return progress.withProgress({
            location: 10 /* ProgressLocation.Window */,
            title: (0, nls_1.localize)('discoveringTests', 'Discovering Tests'),
        }, () => task);
    };
    class RunOrDebugAllTestsAction extends actions_1.Action2 {
        constructor(options, group, noTestsFoundError) {
            super({
                ...options,
                category,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: testingContextKeys_1.TestingContextKeys.capabilityToContextKey[group].isEqualTo(true),
                    }]
            });
            this.group = group;
            this.noTestsFoundError = noTestsFoundError;
        }
        async run(accessor) {
            const testService = accessor.get(testService_1.ITestService);
            const notifications = accessor.get(notification_1.INotificationService);
            const roots = [...testService.collection.rootItems];
            if (!roots.length) {
                notifications.info(this.noTestsFoundError);
                return;
            }
            await testService.runTests({ tests: roots, group: this.group });
        }
    }
    class RunAllAction extends RunOrDebugAllTestsAction {
        constructor() {
            super({
                id: "testing.runAll" /* TestCommandId.RunAllAction */,
                title: (0, nls_1.localize)('runAllTests', 'Run All Tests'),
                icon: icons.testingRunAllIcon,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 31 /* KeyCode.KeyA */),
                },
            }, 2 /* TestRunProfileBitset.Run */, (0, nls_1.localize)('noTestProvider', 'No tests found in this workspace. You may need to install a test provider extension'));
        }
    }
    exports.RunAllAction = RunAllAction;
    class DebugAllAction extends RunOrDebugAllTestsAction {
        constructor() {
            super({
                id: "testing.debugAll" /* TestCommandId.DebugAllAction */,
                title: (0, nls_1.localize)('debugAllTests', 'Debug All Tests'),
                icon: icons.testingDebugIcon,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */),
                },
            }, 4 /* TestRunProfileBitset.Debug */, (0, nls_1.localize)('noDebugTestProvider', 'No debuggable tests found in this workspace. You may need to install a test provider extension'));
        }
    }
    exports.DebugAllAction = DebugAllAction;
    class CancelTestRunAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.cancelRun" /* TestCommandId.CancelTestRunAction */,
                title: { value: (0, nls_1.localize)('testing.cancelRun', "Cancel Test Run"), original: 'Cancel Test Run' },
                icon: icons.testingCancelIcon,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */),
                },
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    order: 11 /* ActionOrder.Run */,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */), contextkey_1.ContextKeyExpr.equals(testingContextKeys_1.TestingContextKeys.isRunning.serialize(), true))
                }
            });
        }
        /**
         * @override
         */
        async run(accessor) {
            const resultService = accessor.get(testResultService_1.ITestResultService);
            const testService = accessor.get(testService_1.ITestService);
            for (const run of resultService.results) {
                if (!run.completedAt) {
                    testService.cancelTestRun(run.id);
                }
            }
        }
    }
    exports.CancelTestRunAction = CancelTestRunAction;
    class TestingViewAsListAction extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: "testing.viewAsList" /* TestCommandId.TestingViewAsListAction */,
                viewId: "workbench.view.testing" /* Testing.ExplorerViewId */,
                title: { value: (0, nls_1.localize)('testing.viewAsList', "View as List"), original: 'View as List' },
                toggled: testingContextKeys_1.TestingContextKeys.viewMode.isEqualTo("list" /* TestExplorerViewMode.List */),
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    order: 18 /* ActionOrder.DisplayMode */,
                    group: 'viewAs',
                    when: contextkey_1.ContextKeyExpr.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */)
                }
            });
        }
        /**
         * @override
         */
        runInView(_accessor, view) {
            view.viewModel.viewMode = "list" /* TestExplorerViewMode.List */;
        }
    }
    exports.TestingViewAsListAction = TestingViewAsListAction;
    class TestingViewAsTreeAction extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: "testing.viewAsTree" /* TestCommandId.TestingViewAsTreeAction */,
                viewId: "workbench.view.testing" /* Testing.ExplorerViewId */,
                title: { value: (0, nls_1.localize)('testing.viewAsTree', "View as Tree"), original: 'View as Tree' },
                toggled: testingContextKeys_1.TestingContextKeys.viewMode.isEqualTo("true" /* TestExplorerViewMode.Tree */),
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    order: 18 /* ActionOrder.DisplayMode */,
                    group: 'viewAs',
                    when: contextkey_1.ContextKeyExpr.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */)
                }
            });
        }
        /**
         * @override
         */
        runInView(_accessor, view) {
            view.viewModel.viewMode = "true" /* TestExplorerViewMode.Tree */;
        }
    }
    exports.TestingViewAsTreeAction = TestingViewAsTreeAction;
    class TestingSortByStatusAction extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: "testing.sortByStatus" /* TestCommandId.TestingSortByStatusAction */,
                viewId: "workbench.view.testing" /* Testing.ExplorerViewId */,
                title: { value: (0, nls_1.localize)('testing.sortByStatus', "Sort by Status"), original: 'Sort by Status' },
                toggled: testingContextKeys_1.TestingContextKeys.viewSorting.isEqualTo("status" /* TestExplorerViewSorting.ByStatus */),
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    order: 19 /* ActionOrder.Sort */,
                    group: 'sortBy',
                    when: contextkey_1.ContextKeyExpr.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */)
                }
            });
        }
        /**
         * @override
         */
        runInView(_accessor, view) {
            view.viewModel.viewSorting = "status" /* TestExplorerViewSorting.ByStatus */;
        }
    }
    exports.TestingSortByStatusAction = TestingSortByStatusAction;
    class TestingSortByLocationAction extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: "testing.sortByLocation" /* TestCommandId.TestingSortByLocationAction */,
                viewId: "workbench.view.testing" /* Testing.ExplorerViewId */,
                title: { value: (0, nls_1.localize)('testing.sortByLocation', "Sort by Location"), original: 'Sort by Location' },
                toggled: testingContextKeys_1.TestingContextKeys.viewSorting.isEqualTo("location" /* TestExplorerViewSorting.ByLocation */),
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    order: 19 /* ActionOrder.Sort */,
                    group: 'sortBy',
                    when: contextkey_1.ContextKeyExpr.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */)
                }
            });
        }
        /**
         * @override
         */
        runInView(_accessor, view) {
            view.viewModel.viewSorting = "location" /* TestExplorerViewSorting.ByLocation */;
        }
    }
    exports.TestingSortByLocationAction = TestingSortByLocationAction;
    class TestingSortByDurationAction extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: "testing.sortByDuration" /* TestCommandId.TestingSortByDurationAction */,
                viewId: "workbench.view.testing" /* Testing.ExplorerViewId */,
                title: { value: (0, nls_1.localize)('testing.sortByDuration', "Sort by Duration"), original: 'Sort by Duration' },
                toggled: testingContextKeys_1.TestingContextKeys.viewSorting.isEqualTo("duration" /* TestExplorerViewSorting.ByDuration */),
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    order: 19 /* ActionOrder.Sort */,
                    group: 'sortBy',
                    when: contextkey_1.ContextKeyExpr.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */)
                }
            });
        }
        /**
         * @override
         */
        runInView(_accessor, view) {
            view.viewModel.viewSorting = "duration" /* TestExplorerViewSorting.ByDuration */;
        }
    }
    exports.TestingSortByDurationAction = TestingSortByDurationAction;
    class ShowMostRecentOutputAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.showMostRecentOutput" /* TestCommandId.ShowMostRecentOutputAction */,
                title: { value: (0, nls_1.localize)('testing.showMostRecentOutput', "Show Output"), original: 'Show Output' },
                category,
                icon: codicons_1.Codicon.terminal,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */),
                },
                precondition: testingContextKeys_1.TestingContextKeys.hasAnyResults.isEqualTo(true),
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        order: 16 /* ActionOrder.Collapse */,
                        group: 'navigation',
                        when: contextkey_1.ContextKeyExpr.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */),
                    }, {
                        id: actions_1.MenuId.CommandPalette,
                        when: testingContextKeys_1.TestingContextKeys.hasAnyResults.isEqualTo(true)
                    }]
            });
        }
        async run(accessor) {
            const viewService = accessor.get(views_1.IViewsService);
            const testView = await viewService.openView("workbench.panel.testResults.view" /* Testing.ResultsViewId */, true);
            testView?.showLatestRun();
        }
    }
    exports.ShowMostRecentOutputAction = ShowMostRecentOutputAction;
    class CollapseAllAction extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: "testing.collapseAll" /* TestCommandId.CollapseAllAction */,
                viewId: "workbench.view.testing" /* Testing.ExplorerViewId */,
                title: { value: (0, nls_1.localize)('testing.collapseAll', "Collapse All Tests"), original: 'Collapse All Tests' },
                icon: codicons_1.Codicon.collapseAll,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    order: 16 /* ActionOrder.Collapse */,
                    group: 'displayAction',
                    when: contextkey_1.ContextKeyExpr.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */)
                }
            });
        }
        /**
         * @override
         */
        runInView(_accessor, view) {
            view.viewModel.collapseAll();
        }
    }
    exports.CollapseAllAction = CollapseAllAction;
    class ClearTestResultsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.clearTestResults" /* TestCommandId.ClearTestResultsAction */,
                title: { value: (0, nls_1.localize)('testing.clearResults', "Clear All Results"), original: 'Clear All Results' },
                category,
                icon: codicons_1.Codicon.trash,
                menu: [{
                        id: actions_1.MenuId.TestPeekTitle,
                    }, {
                        id: actions_1.MenuId.CommandPalette,
                        when: testingContextKeys_1.TestingContextKeys.hasAnyResults.isEqualTo(true),
                    }, {
                        id: actions_1.MenuId.ViewTitle,
                        order: 17 /* ActionOrder.ClearResults */,
                        group: 'displayAction',
                        when: contextkey_1.ContextKeyExpr.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */)
                    }, {
                        id: actions_1.MenuId.ViewTitle,
                        order: 17 /* ActionOrder.ClearResults */,
                        group: 'navigation',
                        when: contextkey_1.ContextKeyExpr.equals('view', "workbench.panel.testResults.view" /* Testing.ResultsViewId */)
                    }],
            });
        }
        /**
         * @override
         */
        run(accessor) {
            accessor.get(testResultService_1.ITestResultService).clear();
        }
    }
    exports.ClearTestResultsAction = ClearTestResultsAction;
    class GoToTest extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.editFocusedTest" /* TestCommandId.GoToTest */,
                title: { value: (0, nls_1.localize)('testing.editFocusedTest', "Go to Test"), original: 'Go to Test' },
                icon: codicons_1.Codicon.goToFile,
                menu: testItemInlineAndInContext(20 /* ActionOrder.GoToTest */, testingContextKeys_1.TestingContextKeys.testItemHasUri.isEqualTo(true)),
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */ - 10,
                    when: contextkeys_1.FocusedViewContext.isEqualTo("workbench.view.testing" /* Testing.ExplorerViewId */),
                    primary: 3 /* KeyCode.Enter */ | 512 /* KeyMod.Alt */,
                },
            });
        }
        async run(accessor, element, preserveFocus) {
            if (!element) {
                const view = accessor.get(views_1.IViewsService).getActiveViewWithId("workbench.view.testing" /* Testing.ExplorerViewId */);
                element = view?.focusedTreeElements[0];
            }
            if (element && element instanceof index_1.TestItemTreeElement) {
                accessor.get(commands_1.ICommandService).executeCommand('vscode.revealTest', element.test.item.extId, preserveFocus);
            }
        }
    }
    exports.GoToTest = GoToTest;
    class ExecuteTestAtCursor extends actions_1.Action2 {
        constructor(options, group) {
            super({
                ...options,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: hasAnyTestProvider,
                    }, {
                        id: actions_1.MenuId.EditorContext,
                        group: 'testing',
                        order: group === 2 /* TestRunProfileBitset.Run */ ? 11 /* ActionOrder.Run */ : 12 /* ActionOrder.Debug */,
                        when: contextkey_1.ContextKeyExpr.and(testingContextKeys_1.TestingContextKeys.activeEditorHasTests, testingContextKeys_1.TestingContextKeys.capabilityToContextKey[group]),
                    }]
            });
            this.group = group;
        }
        /**
         * @override
         */
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const activeEditorPane = editorService.activeEditorPane;
            const activeControl = editorService.activeTextEditorControl;
            if (!activeEditorPane || !activeControl) {
                return;
            }
            const position = activeControl?.getPosition();
            const model = activeControl?.getModel();
            if (!position || !model || !('uri' in model)) {
                return;
            }
            const testService = accessor.get(testService_1.ITestService);
            const profileService = accessor.get(testProfileService_1.ITestProfileService);
            const uriIdentityService = accessor.get(uriIdentity_1.IUriIdentityService);
            const progressService = accessor.get(progress_1.IProgressService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            let bestNodes = [];
            let bestRange;
            let bestNodesBefore = [];
            let bestRangeBefore;
            const saveBeforeTest = (0, configuration_2.getTestingConfiguration)(configurationService, "testing.saveBeforeTest" /* TestingConfigKeys.SaveBeforeTest */);
            if (saveBeforeTest) {
                await editorService.save({ editor: activeEditorPane.input, groupId: activeEditorPane.group.id });
                await testService.syncTests();
            }
            // testsInFile will descend in the test tree. We assume that as we go
            // deeper, ranges get more specific. We'll want to run all tests whose
            // range is equal to the most specific range we find (see #133519)
            //
            // If we don't find any test whose range contains the position, we pick
            // the closest one before the position. Again, if we find several tests
            // whose range is equal to the closest one, we run them all.
            await showDiscoveringWhile(progressService, (async () => {
                for await (const test of (0, testService_1.testsInFile)(testService, uriIdentityService, model.uri)) {
                    if (!test.item.range || !(profileService.capabilitiesForTest(test) & this.group)) {
                        continue;
                    }
                    const irange = range_1.Range.lift(test.item.range);
                    if (irange.containsPosition(position)) {
                        if (bestRange && range_1.Range.equalsRange(test.item.range, bestRange)) {
                            // check that a parent isn't already included (#180760)
                            if (!bestNodes.some(b => testId_1.TestId.isChild(b.item.extId, test.item.extId))) {
                                bestNodes.push(test);
                            }
                        }
                        else {
                            bestRange = irange;
                            bestNodes = [test];
                        }
                    }
                    else if (position_1.Position.isBefore(irange.getStartPosition(), position)) {
                        if (!bestRangeBefore || bestRangeBefore.getStartPosition().isBefore(irange.getStartPosition())) {
                            bestRangeBefore = irange;
                            bestNodesBefore = [test];
                        }
                        else if (irange.equalsRange(bestRangeBefore) && !bestNodesBefore.some(b => testId_1.TestId.isChild(b.item.extId, test.item.extId))) {
                            bestNodesBefore.push(test);
                        }
                    }
                }
            })());
            const testsToRun = bestNodes.length ? bestNodes : bestNodesBefore;
            if (testsToRun.length) {
                await testService.runTests({
                    group: this.group,
                    tests: bestNodes.length ? bestNodes : bestNodesBefore,
                });
            }
            else if ((0, editorBrowser_1.isCodeEditor)(activeControl)) {
                messageController_1.MessageController.get(activeControl)?.showMessage((0, nls_1.localize)('noTestsAtCursor', "No tests found here"), position);
            }
        }
    }
    class RunAtCursor extends ExecuteTestAtCursor {
        constructor() {
            super({
                id: "testing.runAtCursor" /* TestCommandId.RunAtCursor */,
                title: { value: (0, nls_1.localize)('testing.runAtCursor', "Run Test at Cursor"), original: 'Run Test at Cursor' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 33 /* KeyCode.KeyC */),
                },
            }, 2 /* TestRunProfileBitset.Run */);
        }
    }
    exports.RunAtCursor = RunAtCursor;
    class DebugAtCursor extends ExecuteTestAtCursor {
        constructor() {
            super({
                id: "testing.debugAtCursor" /* TestCommandId.DebugAtCursor */,
                title: { value: (0, nls_1.localize)('testing.debugAtCursor', "Debug Test at Cursor"), original: 'Debug Test at Cursor' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */),
                },
            }, 4 /* TestRunProfileBitset.Debug */);
        }
    }
    exports.DebugAtCursor = DebugAtCursor;
    class ExecuteTestsInCurrentFile extends actions_1.Action2 {
        constructor(options, group) {
            super({
                ...options,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: testingContextKeys_1.TestingContextKeys.capabilityToContextKey[group].isEqualTo(true),
                    }, {
                        id: actions_1.MenuId.EditorContext,
                        group: 'testing',
                        // add 0.1 to be after the "at cursor" commands
                        order: (group === 2 /* TestRunProfileBitset.Run */ ? 11 /* ActionOrder.Run */ : 12 /* ActionOrder.Debug */) + 0.1,
                        when: contextkey_1.ContextKeyExpr.and(testingContextKeys_1.TestingContextKeys.activeEditorHasTests, testingContextKeys_1.TestingContextKeys.capabilityToContextKey[group]),
                    }],
            });
            this.group = group;
        }
        /**
         * @override
         */
        run(accessor) {
            const control = accessor.get(editorService_1.IEditorService).activeTextEditorControl;
            const position = control?.getPosition();
            const model = control?.getModel();
            if (!position || !model || !('uri' in model)) {
                return;
            }
            const testService = accessor.get(testService_1.ITestService);
            const demandedUri = model.uri.toString();
            // Iterate through the entire collection and run any tests that are in the
            // uri. See #138007.
            const queue = [testService.collection.rootIds];
            const discovered = [];
            while (queue.length) {
                for (const id of queue.pop()) {
                    const node = testService.collection.getNodeById(id);
                    if (node.item.uri?.toString() === demandedUri) {
                        discovered.push(node);
                    }
                    else {
                        queue.push(node.children);
                    }
                }
            }
            if (discovered.length) {
                return testService.runTests({
                    tests: discovered,
                    group: this.group,
                });
            }
            if ((0, editorBrowser_1.isCodeEditor)(control)) {
                messageController_1.MessageController.get(control)?.showMessage((0, nls_1.localize)('noTestsInFile', "No tests found in this file"), position);
            }
            return undefined;
        }
    }
    class RunCurrentFile extends ExecuteTestsInCurrentFile {
        constructor() {
            super({
                id: "testing.runCurrentFile" /* TestCommandId.RunCurrentFile */,
                title: { value: (0, nls_1.localize)('testing.runCurrentFile', "Run Tests in Current File"), original: 'Run Tests in Current File' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 36 /* KeyCode.KeyF */),
                },
            }, 2 /* TestRunProfileBitset.Run */);
        }
    }
    exports.RunCurrentFile = RunCurrentFile;
    class DebugCurrentFile extends ExecuteTestsInCurrentFile {
        constructor() {
            super({
                id: "testing.debugCurrentFile" /* TestCommandId.DebugCurrentFile */,
                title: { value: (0, nls_1.localize)('testing.debugCurrentFile', "Debug Tests in Current File"), original: 'Debug Tests in Current File' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */),
                },
            }, 4 /* TestRunProfileBitset.Debug */);
        }
    }
    exports.DebugCurrentFile = DebugCurrentFile;
    const discoverAndRunTests = async (collection, progress, ids, runTests) => {
        const todo = Promise.all(ids.map(p => (0, testService_1.expandAndGetTestById)(collection, p)));
        const tests = (await showDiscoveringWhile(progress, todo)).filter(types_1.isDefined);
        return tests.length ? await runTests(tests) : undefined;
    };
    exports.discoverAndRunTests = discoverAndRunTests;
    class RunOrDebugExtsByPath extends actions_1.Action2 {
        /**
         * @override
         */
        async run(accessor, ...args) {
            const testService = accessor.get(testService_1.ITestService);
            await (0, exports.discoverAndRunTests)(accessor.get(testService_1.ITestService).collection, accessor.get(progress_1.IProgressService), [...this.getTestExtIdsToRun(accessor, ...args)], tests => this.runTest(testService, tests));
        }
    }
    class RunOrDebugFailedTests extends RunOrDebugExtsByPath {
        constructor(options) {
            super({
                ...options,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: hasAnyTestProvider,
                },
            });
        }
        /**
         * @inheritdoc
         */
        getTestExtIdsToRun(accessor) {
            const { results } = accessor.get(testResultService_1.ITestResultService);
            const ids = new Set();
            for (let i = results.length - 1; i >= 0; i--) {
                const resultSet = results[i];
                for (const test of resultSet.tests) {
                    if ((0, testingStates_1.isFailedState)(test.ownComputedState)) {
                        ids.add(test.item.extId);
                    }
                    else {
                        ids.delete(test.item.extId);
                    }
                }
            }
            return ids;
        }
    }
    class RunOrDebugLastRun extends RunOrDebugExtsByPath {
        constructor(options) {
            super({
                ...options,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(hasAnyTestProvider, testingContextKeys_1.TestingContextKeys.hasAnyResults.isEqualTo(true)),
                },
            });
        }
        /**
         * @inheritdoc
         */
        *getTestExtIdsToRun(accessor, runId) {
            const resultService = accessor.get(testResultService_1.ITestResultService);
            const lastResult = runId ? resultService.results.find(r => r.id === runId) : resultService.results[0];
            if (!lastResult) {
                return;
            }
            for (const test of lastResult.request.targets) {
                for (const testId of test.testIds) {
                    yield testId;
                }
            }
        }
    }
    class ReRunFailedTests extends RunOrDebugFailedTests {
        constructor() {
            super({
                id: "testing.reRunFailTests" /* TestCommandId.ReRunFailedTests */,
                title: { value: (0, nls_1.localize)('testing.reRunFailTests', "Rerun Failed Tests"), original: 'Rerun Failed Tests' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 35 /* KeyCode.KeyE */),
                },
            });
        }
        runTest(service, internalTests) {
            return service.runTests({
                group: 2 /* TestRunProfileBitset.Run */,
                tests: internalTests,
            });
        }
    }
    exports.ReRunFailedTests = ReRunFailedTests;
    class DebugFailedTests extends RunOrDebugFailedTests {
        constructor() {
            super({
                id: "testing.debugFailTests" /* TestCommandId.DebugFailedTests */,
                title: { value: (0, nls_1.localize)('testing.debugFailTests', "Debug Failed Tests"), original: 'Debug Failed Tests' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 35 /* KeyCode.KeyE */),
                },
            });
        }
        runTest(service, internalTests) {
            return service.runTests({
                group: 4 /* TestRunProfileBitset.Debug */,
                tests: internalTests,
            });
        }
    }
    exports.DebugFailedTests = DebugFailedTests;
    class ReRunLastRun extends RunOrDebugLastRun {
        constructor() {
            super({
                id: "testing.reRunLastRun" /* TestCommandId.ReRunLastRun */,
                title: { value: (0, nls_1.localize)('testing.reRunLastRun', "Rerun Last Run"), original: 'Rerun Last Run' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 42 /* KeyCode.KeyL */),
                },
            });
        }
        runTest(service, internalTests) {
            return service.runTests({
                group: 2 /* TestRunProfileBitset.Run */,
                tests: internalTests,
            });
        }
    }
    exports.ReRunLastRun = ReRunLastRun;
    class DebugLastRun extends RunOrDebugLastRun {
        constructor() {
            super({
                id: "testing.debugLastRun" /* TestCommandId.DebugLastRun */,
                title: { value: (0, nls_1.localize)('testing.debugLastRun', "Debug Last Run"), original: 'Debug Last Run' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 42 /* KeyCode.KeyL */),
                },
            });
        }
        runTest(service, internalTests) {
            return service.runTests({
                group: 4 /* TestRunProfileBitset.Debug */,
                tests: internalTests,
            });
        }
    }
    exports.DebugLastRun = DebugLastRun;
    class SearchForTestExtension extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.searchForTestExtension" /* TestCommandId.SearchForTestExtension */,
                title: { value: (0, nls_1.localize)('testing.searchForTestExtension', "Search for Test Extension"), original: 'Search for Test Extension' },
            });
        }
        async run(accessor) {
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const viewlet = (await paneCompositeService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true))?.getViewPaneContainer();
            viewlet.search('@category:"testing"');
            viewlet.focus();
        }
    }
    exports.SearchForTestExtension = SearchForTestExtension;
    class OpenOutputPeek extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.openOutputPeek" /* TestCommandId.OpenOutputPeek */,
                title: { value: (0, nls_1.localize)('testing.openOutputPeek', "Peek Output"), original: 'Peek Output' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 43 /* KeyCode.KeyM */),
                },
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: testingContextKeys_1.TestingContextKeys.hasAnyResults.isEqualTo(true),
                },
            });
        }
        async run(accessor) {
            accessor.get(testingPeekOpener_1.ITestingPeekOpener).open();
        }
    }
    exports.OpenOutputPeek = OpenOutputPeek;
    class ToggleInlineTestOutput extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.toggleInlineTestOutput" /* TestCommandId.ToggleInlineTestOutput */,
                title: { value: (0, nls_1.localize)('testing.toggleInlineTestOutput', "Toggle Inline Test Output"), original: 'Toggle Inline Test Output' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */),
                },
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: testingContextKeys_1.TestingContextKeys.hasAnyResults.isEqualTo(true),
                },
            });
        }
        async run(accessor) {
            const testService = accessor.get(testService_1.ITestService);
            testService.showInlineOutput.value = !testService.showInlineOutput.value;
        }
    }
    exports.ToggleInlineTestOutput = ToggleInlineTestOutput;
    const refreshMenus = (whenIsRefreshing) => [
        {
            id: actions_1.MenuId.TestItem,
            group: 'inline',
            order: 10 /* ActionOrder.Refresh */,
            when: contextkey_1.ContextKeyExpr.and(testingContextKeys_1.TestingContextKeys.canRefreshTests.isEqualTo(true), testingContextKeys_1.TestingContextKeys.isRefreshingTests.isEqualTo(whenIsRefreshing)),
        },
        {
            id: actions_1.MenuId.ViewTitle,
            group: 'navigation',
            order: 10 /* ActionOrder.Refresh */,
            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */), testingContextKeys_1.TestingContextKeys.canRefreshTests.isEqualTo(true), testingContextKeys_1.TestingContextKeys.isRefreshingTests.isEqualTo(whenIsRefreshing)),
        },
        {
            id: actions_1.MenuId.CommandPalette,
            when: testingContextKeys_1.TestingContextKeys.canRefreshTests.isEqualTo(true),
        },
    ];
    class RefreshTestsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.refreshTests" /* TestCommandId.RefreshTestsAction */,
                title: { value: (0, nls_1.localize)('testing.refreshTests', "Refresh Tests"), original: 'Refresh Tests' },
                category,
                icon: icons.testingRefreshTests,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 48 /* KeyCode.KeyR */),
                    when: testingContextKeys_1.TestingContextKeys.canRefreshTests.isEqualTo(true),
                },
                menu: refreshMenus(false),
            });
        }
        async run(accessor, ...elements) {
            const testService = accessor.get(testService_1.ITestService);
            const progressService = accessor.get(progress_1.IProgressService);
            const controllerIds = (0, arrays_1.distinct)(elements.filter(types_1.isDefined).map(e => e.test.controllerId));
            return progressService.withProgress({ location: "workbench.view.extension.test" /* Testing.ViewletId */ }, async () => {
                if (controllerIds.length) {
                    await Promise.all(controllerIds.map(id => testService.refreshTests(id)));
                }
                else {
                    await testService.refreshTests();
                }
            });
        }
    }
    exports.RefreshTestsAction = RefreshTestsAction;
    class CancelTestRefreshAction extends actions_1.Action2 {
        constructor() {
            super({
                id: "testing.cancelTestRefresh" /* TestCommandId.CancelTestRefreshAction */,
                title: { value: (0, nls_1.localize)('testing.cancelTestRefresh', "Cancel Test Refresh"), original: 'Cancel Test Refresh' },
                category,
                icon: icons.testingCancelRefreshTests,
                menu: refreshMenus(true),
            });
        }
        async run(accessor) {
            accessor.get(testService_1.ITestService).cancelRefreshTests();
        }
    }
    exports.CancelTestRefreshAction = CancelTestRefreshAction;
    exports.allTestActions = [
        CancelTestRefreshAction,
        CancelTestRunAction,
        ClearTestResultsAction,
        CollapseAllAction,
        ConfigureTestProfilesAction,
        ContinuousRunTestAction,
        ContinuousRunUsingProfileTestAction,
        DebugAction,
        DebugAllAction,
        DebugAtCursor,
        DebugCurrentFile,
        DebugFailedTests,
        DebugLastRun,
        DebugSelectedAction,
        GoToTest,
        GetExplorerSelection,
        GetSelectedProfiles,
        HideTestAction,
        OpenOutputPeek,
        RefreshTestsAction,
        ReRunFailedTests,
        ReRunLastRun,
        RunAction,
        RunAllAction,
        RunAtCursor,
        RunCurrentFile,
        RunSelectedAction,
        RunUsingProfileAction,
        SearchForTestExtension,
        SelectDefaultTestProfiles,
        ShowMostRecentOutputAction,
        StartContinuousRunAction,
        StopContinuousRunAction,
        TestingSortByDurationAction,
        TestingSortByLocationAction,
        TestingSortByStatusAction,
        TestingViewAsListAction,
        TestingViewAsTreeAction,
        ToggleInlineTestOutput,
        UnhideAllTestsAction,
        UnhideTestAction,
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdEV4cGxvcmVyQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlc3RpbmcvYnJvd3Nlci90ZXN0RXhwbG9yZXJBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQThDaEcsTUFBTSxRQUFRLEdBQUcsbUNBQVUsQ0FBQyxJQUFJLENBQUM7SUFFakMsSUFBVyxXQWlCVjtJQWpCRCxXQUFXLFdBQVc7UUFDckIsY0FBYztRQUNkLG9EQUFZLENBQUE7UUFDWiw0Q0FBRyxDQUFBO1FBQ0gsZ0RBQUssQ0FBQTtRQUNMLHNEQUFRLENBQUE7UUFDUixnRUFBYSxDQUFBO1FBQ2Isc0RBQVEsQ0FBQTtRQUVSLFdBQVc7UUFDWCxzREFBUSxDQUFBO1FBQ1IsOERBQVksQ0FBQTtRQUNaLDREQUFXLENBQUE7UUFDWCw4Q0FBSSxDQUFBO1FBQ0osc0RBQVEsQ0FBQTtRQUNSLHNEQUFRLENBQUE7UUFDUixnRkFBNEIsQ0FBQTtJQUM3QixDQUFDLEVBakJVLFdBQVcsS0FBWCxXQUFXLFFBaUJyQjtJQUVELE1BQU0sa0JBQWtCLEdBQUcsa0NBQXFCLENBQUMsTUFBTSxDQUFDLHVDQUFrQixDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFakcsTUFBYSxjQUFlLFNBQVEsaUJBQU87UUFDMUM7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSx1REFBOEI7Z0JBQ2hDLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxVQUFVLEVBQUUsV0FBVyxDQUFDO2dCQUN4QyxJQUFJLEVBQUU7b0JBQ0wsRUFBRSxFQUFFLGdCQUFNLENBQUMsUUFBUTtvQkFDbkIsS0FBSyxFQUFFLFdBQVc7b0JBQ2xCLElBQUksRUFBRSx1Q0FBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO2lCQUMxRDth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