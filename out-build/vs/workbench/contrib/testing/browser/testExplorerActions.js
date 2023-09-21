/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/codicons", "vs/base/common/keyCodes", "vs/base/common/types", "vs/editor/browser/editorBrowser", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/contrib/message/browser/messageController", "vs/nls!vs/workbench/contrib/testing/browser/testExplorerActions", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "vs/platform/quickinput/common/quickInput", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/contextkeys", "vs/workbench/common/views", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/testing/browser/explorerProjections/index", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/constants", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testingContinuousRunService", "vs/workbench/contrib/testing/common/testingPeekOpener", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, arrays_1, codicons_1, keyCodes_1, types_1, editorBrowser_1, position_1, range_1, editorContextKeys_1, messageController_1, nls_1, actionCommonCategories_1, actions_1, commands_1, configuration_1, contextkey_1, notification_1, progress_1, quickInput_1, uriIdentity_1, viewPane_1, contextkeys_1, views_1, extensions_1, index_1, icons, configuration_2, constants_1, testId_1, testProfileService_1, testResultService_1, testService_1, testingContextKeys_1, testingContinuousRunService_1, testingPeekOpener_1, testingStates_1, editorService_1, panecomposite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uLb = exports.$tLb = exports.$sLb = exports.$rLb = exports.$qLb = exports.$pLb = exports.$oLb = exports.$nLb = exports.$mLb = exports.$lLb = exports.$kLb = exports.$jLb = exports.$iLb = exports.$hLb = exports.$gLb = exports.$fLb = exports.$eLb = exports.$dLb = exports.$cLb = exports.$bLb = exports.$aLb = exports.$_Kb = exports.$$Kb = exports.$0Kb = exports.$9Kb = exports.$8Kb = exports.$7Kb = exports.$6Kb = exports.$5Kb = exports.$4Kb = exports.$3Kb = exports.$2Kb = exports.$1Kb = exports.$ZKb = exports.$YKb = exports.$XKb = exports.$WKb = exports.$VKb = exports.$UKb = exports.$TKb = exports.$SKb = void 0;
    const category = actionCommonCategories_1.$Nl.Test;
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
    const hasAnyTestProvider = contextkey_1.$Ti.create(testingContextKeys_1.TestingContextKeys.providerCount.key, 0);
    class $SKb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.hideTest" /* TestCommandId.HideTestAction */,
                title: (0, nls_1.localize)(0, null),
                menu: {
                    id: actions_1.$Ru.TestItem,
                    group: 'builtin@2',
                    when: testingContextKeys_1.TestingContextKeys.testItemIsHidden.isEqualTo(false)
                },
            });
        }
        run(accessor, ...elements) {
            const service = accessor.get(testService_1.$4sb);
            for (const element of elements) {
                service.excluded.toggle(element.test, true);
            }
            return Promise.resolve();
        }
    }
    exports.$SKb = $SKb;
    class $TKb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.unhideTest" /* TestCommandId.UnhideTestAction */,
                title: (0, nls_1.localize)(1, null),
                menu: {
                    id: actions_1.$Ru.TestItem,
                    order: 21 /* ActionOrder.HideTest */,
                    when: testingContextKeys_1.TestingContextKeys.testItemIsHidden.isEqualTo(true)
                },
            });
        }
        run(accessor, ...elements) {
            const service = accessor.get(testService_1.$4sb);
            for (const element of elements) {
                if (element instanceof index_1.$rKb) {
                    service.excluded.toggle(element.test, false);
                }
            }
            return Promise.resolve();
        }
    }
    exports.$TKb = $TKb;
    class $UKb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.unhideAllTests" /* TestCommandId.UnhideAllTestsAction */,
                title: (0, nls_1.localize)(2, null),
            });
        }
        run(accessor) {
            const service = accessor.get(testService_1.$4sb);
            service.excluded.clear();
            return Promise.resolve();
        }
    }
    exports.$UKb = $UKb;
    const testItemInlineAndInContext = (order, when) => [
        {
            id: actions_1.$Ru.TestItem,
            group: 'inline',
            order,
            when,
        }, {
            id: actions_1.$Ru.TestItem,
            group: 'builtin@1',
            order,
            when,
        }
    ];
    class $VKb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.debug" /* TestCommandId.DebugAction */,
                title: (0, nls_1.localize)(3, null),
                icon: icons.$5Jb,
                menu: testItemInlineAndInContext(12 /* ActionOrder.Debug */, testingContextKeys_1.TestingContextKeys.hasDebuggableTests.isEqualTo(true)),
            });
        }
        run(acessor, ...elements) {
            return acessor.get(testService_1.$4sb).runTests({
                tests: elements.map(e => e.test),
                group: 4 /* TestRunProfileBitset.Debug */,
            });
        }
    }
    exports.$VKb = $VKb;
    class $WKb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.runUsing" /* TestCommandId.RunUsingProfileAction */,
                title: (0, nls_1.localize)(4, null),
                icon: icons.$5Jb,
                menu: {
                    id: actions_1.$Ru.TestItem,
                    order: 15 /* ActionOrder.RunUsing */,
                    group: 'builtin@2',
                    when: testingContextKeys_1.TestingContextKeys.hasNonDefaultProfile.isEqualTo(true),
                },
            });
        }
        async run(acessor, ...elements) {
            const commandService = acessor.get(commands_1.$Fr);
            const testService = acessor.get(testService_1.$4sb);
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
                        testIds: elements.filter(t => (0, testProfileService_1.$0sb)(profile, t.test)).map(t => t.test.item.extId)
                    }]
            });
        }
    }
    exports.$WKb = $WKb;
    class $XKb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.run" /* TestCommandId.RunAction */,
                title: (0, nls_1.localize)(5, null),
                icon: icons.$1Jb,
                menu: testItemInlineAndInContext(11 /* ActionOrder.Run */, testingContextKeys_1.TestingContextKeys.hasRunnableTests.isEqualTo(true)),
            });
        }
        /**
         * @override
         */
        run(acessor, ...elements) {
            return acessor.get(testService_1.$4sb).runTests({
                tests: elements.map(e => e.test),
                group: 2 /* TestRunProfileBitset.Run */,
            });
        }
    }
    exports.$XKb = $XKb;
    class $YKb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.selectDefaultTestProfiles" /* TestCommandId.SelectDefaultTestProfiles */,
                title: (0, nls_1.localize)(6, null),
                icon: icons.$$Jb,
                category,
            });
        }
        async run(acessor, onlyGroup) {
            const commands = acessor.get(commands_1.$Fr);
            const testProfileService = acessor.get(testProfileService_1.$9sb);
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
    exports.$YKb = $YKb;
    class $ZKb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.toggleContinuousRunForTest" /* TestCommandId.ToggleContinousRunForTest */,
                title: (0, nls_1.localize)(7, null),
                icon: icons.$aKb,
                precondition: contextkey_1.$Ii.or(testingContextKeys_1.TestingContextKeys.isContinuousModeOn.isEqualTo(true), testingContextKeys_1.TestingContextKeys.isParentRunningContinuously.isEqualTo(false)),
                toggled: {
                    condition: testingContextKeys_1.TestingContextKeys.isContinuousModeOn.isEqualTo(true),
                    icon: icons.$cKb,
                    title: (0, nls_1.localize)(8, null),
                },
                menu: testItemInlineAndInContext(2147483647 /* ActionOrder.ContinuousRunTest */, testingContextKeys_1.TestingContextKeys.supportsContinuousRun.isEqualTo(true)),
            });
        }
        async run(accessor, ...elements) {
            const crService = accessor.get(testingContinuousRunService_1.$QKb);
            const profileService = accessor.get(testProfileService_1.$9sb);
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
    exports.$ZKb = $ZKb;
    class $1Kb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.continuousRunUsingForTest" /* TestCommandId.ContinousRunUsingForTest */,
                title: (0, nls_1.localize)(9, null),
                icon: icons.$5Jb,
                menu: [
                    {
                        id: actions_1.$Ru.TestItem,
                        order: 14 /* ActionOrder.RunContinuous */,
                        group: 'builtin@2',
                        when: contextkey_1.$Ii.and(testingContextKeys_1.TestingContextKeys.supportsContinuousRun.isEqualTo(true), testingContextKeys_1.TestingContextKeys.isContinuousModeOn.isEqualTo(false))
                    }
                ],
            });
        }
        async run(accessor, ...elements) {
            const crService = accessor.get(testingContinuousRunService_1.$QKb);
            const profileService = accessor.get(testProfileService_1.$9sb);
            const notificationService = accessor.get(notification_1.$Yu);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            for (const element of elements) {
                const selected = await selectContinuousRunProfiles(crService, notificationService, quickInputService, [{ profiles: profileService.getControllerProfiles(element.test.controllerId) }]);
                if (selected.length) {
                    crService.start(selected, element.test.item.extId);
                }
            }
        }
    }
    exports.$1Kb = $1Kb;
    class $2Kb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.configureProfile" /* TestCommandId.ConfigureTestProfilesAction */,
                title: { value: (0, nls_1.localize)(10, null), original: 'Configure Test Profiles' },
                icon: icons.$$Jb,
                f1: true,
                category,
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: testingContextKeys_1.TestingContextKeys.hasConfigurableProfile.isEqualTo(true),
                },
            });
        }
        async run(acessor, onlyGroup) {
            const commands = acessor.get(commands_1.$Fr);
            const testProfileService = acessor.get(testProfileService_1.$9sb);
            const profile = await commands.executeCommand('vscode.pickTestProfile', {
                placeholder: (0, nls_1.localize)(11, null),
                showConfigureButtons: false,
                onlyConfigurable: true,
                onlyGroup,
            });
            if (profile) {
                testProfileService.configure(profile.controllerId, profile.profileId);
            }
        }
    }
    exports.$2Kb = $2Kb;
    const continuousMenus = (whenIsContinuousOn) => [
        {
            id: actions_1.$Ru.ViewTitle,
            group: 'navigation',
            order: 15 /* ActionOrder.RunUsing */,
            when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */), testingContextKeys_1.TestingContextKeys.supportsContinuousRun.isEqualTo(true), testingContextKeys_1.TestingContextKeys.isContinuousModeOn.isEqualTo(whenIsContinuousOn)),
        },
        {
            id: actions_1.$Ru.CommandPalette,
            when: testingContextKeys_1.TestingContextKeys.supportsContinuousRun.isEqualTo(true),
        },
    ];
    class StopContinuousRunAction extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.stopContinuousRun" /* TestCommandId.StopContinousRun */,
                title: { value: (0, nls_1.localize)(12, null), original: 'Stop Continuous Run' },
                category,
                icon: icons.$bKb,
                menu: continuousMenus(true),
            });
        }
        run(accessor) {
            accessor.get(testingContinuousRunService_1.$QKb).stop();
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
            notificationService.info((0, nls_1.localize)(13, null));
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
                qpItems.push({ type: 'separator', label: constants_1.$Msb[item.profile.group] });
            }
            qpItems.push(item);
            if (lastRun.has(item.profile.profileId)) {
                selectedItems.push(item);
            }
        }
        const quickpick = quickInputService.createQuickPick();
        quickpick.title = (0, nls_1.localize)(14, null);
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
    class StartContinuousRunAction extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.startContinuousRun" /* TestCommandId.StartContinousRun */,
                title: { value: (0, nls_1.localize)(15, null), original: 'Enable Continuous Run' },
                category,
                icon: icons.$aKb,
                menu: continuousMenus(false),
            });
        }
        async run(accessor, ...args) {
            const crs = accessor.get(testingContinuousRunService_1.$QKb);
            const selected = await selectContinuousRunProfiles(crs, accessor.get(notification_1.$Yu), accessor.get(quickInput_1.$Gq), accessor.get(testProfileService_1.$9sb).all());
            if (selected.length) {
                crs.start(selected);
            }
        }
    }
    class ExecuteSelectedAction extends viewPane_1.$Keb {
        constructor(options, c) {
            super({
                ...options,
                menu: [{
                        id: actions_1.$Ru.ViewTitle,
                        order: c === 2 /* TestRunProfileBitset.Run */
                            ? 11 /* ActionOrder.Run */
                            : c === 4 /* TestRunProfileBitset.Debug */
                                ? 12 /* ActionOrder.Debug */
                                : 13 /* ActionOrder.Coverage */,
                        group: 'navigation',
                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */), testingContextKeys_1.TestingContextKeys.isRunning.isEqualTo(false), testingContextKeys_1.TestingContextKeys.capabilityToContextKey[c].isEqualTo(true))
                    }],
                category,
                viewId: "workbench.view.testing" /* Testing.ExplorerViewId */,
            });
            this.c = c;
        }
        /**
         * @override
         */
        runInView(accessor, view) {
            const { include, exclude } = view.getTreeIncludeExclude();
            return accessor.get(testService_1.$4sb).runTests({ tests: include, exclude, group: this.c });
        }
    }
    class $3Kb extends actions_1.$Wu {
        constructor() {
            super({ id: "testing.getSelectedProfiles" /* TestCommandId.GetSelectedProfiles */, title: (0, nls_1.localize)(16, null) });
        }
        /**
         * @override
         */
        run(accessor) {
            const profiles = accessor.get(testProfileService_1.$9sb);
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
    exports.$3Kb = $3Kb;
    class $4Kb extends viewPane_1.$Keb {
        constructor() {
            super({ id: "_testing.getExplorerSelection" /* TestCommandId.GetExplorerSelection */, title: (0, nls_1.localize)(17, null), viewId: "workbench.view.testing" /* Testing.ExplorerViewId */ });
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
    exports.$4Kb = $4Kb;
    class $5Kb extends ExecuteSelectedAction {
        constructor() {
            super({
                id: "testing.runSelected" /* TestCommandId.RunSelectedAction */,
                title: (0, nls_1.localize)(18, null),
                icon: icons.$3Jb,
            }, 2 /* TestRunProfileBitset.Run */);
        }
    }
    exports.$5Kb = $5Kb;
    class $6Kb extends ExecuteSelectedAction {
        constructor() {
            super({
                id: "testing.debugSelected" /* TestCommandId.DebugSelectedAction */,
                title: (0, nls_1.localize)(19, null),
                icon: icons.$4Jb,
            }, 4 /* TestRunProfileBitset.Debug */);
        }
    }
    exports.$6Kb = $6Kb;
    const showDiscoveringWhile = (progress, task) => {
        return progress.withProgress({
            location: 10 /* ProgressLocation.Window */,
            title: (0, nls_1.localize)(20, null),
        }, () => task);
    };
    class RunOrDebugAllTestsAction extends actions_1.$Wu {
        constructor(options, c, d) {
            super({
                ...options,
                category,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: testingContextKeys_1.TestingContextKeys.capabilityToContextKey[c].isEqualTo(true),
                    }]
            });
            this.c = c;
            this.d = d;
        }
        async run(accessor) {
            const testService = accessor.get(testService_1.$4sb);
            const notifications = accessor.get(notification_1.$Yu);
            const roots = [...testService.collection.rootItems];
            if (!roots.length) {
                notifications.info(this.d);
                return;
            }
            await testService.runTests({ tests: roots, group: this.c });
        }
    }
    class $7Kb extends RunOrDebugAllTestsAction {
        constructor() {
            super({
                id: "testing.runAll" /* TestCommandId.RunAllAction */,
                title: (0, nls_1.localize)(21, null),
                icon: icons.$3Jb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 31 /* KeyCode.KeyA */),
                },
            }, 2 /* TestRunProfileBitset.Run */, (0, nls_1.localize)(22, null));
        }
    }
    exports.$7Kb = $7Kb;
    class $8Kb extends RunOrDebugAllTestsAction {
        constructor() {
            super({
                id: "testing.debugAll" /* TestCommandId.DebugAllAction */,
                title: (0, nls_1.localize)(23, null),
                icon: icons.$5Jb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */),
                },
            }, 4 /* TestRunProfileBitset.Debug */, (0, nls_1.localize)(24, null));
        }
    }
    exports.$8Kb = $8Kb;
    class $9Kb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.cancelRun" /* TestCommandId.CancelTestRunAction */,
                title: { value: (0, nls_1.localize)(25, null), original: 'Cancel Test Run' },
                icon: icons.$6Jb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */),
                },
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    order: 11 /* ActionOrder.Run */,
                    group: 'navigation',
                    when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */), contextkey_1.$Ii.equals(testingContextKeys_1.TestingContextKeys.isRunning.serialize(), true))
                }
            });
        }
        /**
         * @override
         */
        async run(accessor) {
            const resultService = accessor.get(testResultService_1.$ftb);
            const testService = accessor.get(testService_1.$4sb);
            for (const run of resultService.results) {
                if (!run.completedAt) {
                    testService.cancelTestRun(run.id);
                }
            }
        }
    }
    exports.$9Kb = $9Kb;
    class $0Kb extends viewPane_1.$Keb {
        constructor() {
            super({
                id: "testing.viewAsList" /* TestCommandId.TestingViewAsListAction */,
                viewId: "workbench.view.testing" /* Testing.ExplorerViewId */,
                title: { value: (0, nls_1.localize)(26, null), original: 'View as List' },
                toggled: testingContextKeys_1.TestingContextKeys.viewMode.isEqualTo("list" /* TestExplorerViewMode.List */),
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    order: 18 /* ActionOrder.DisplayMode */,
                    group: 'viewAs',
                    when: contextkey_1.$Ii.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */)
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
    exports.$0Kb = $0Kb;
    class $$Kb extends viewPane_1.$Keb {
        constructor() {
            super({
                id: "testing.viewAsTree" /* TestCommandId.TestingViewAsTreeAction */,
                viewId: "workbench.view.testing" /* Testing.ExplorerViewId */,
                title: { value: (0, nls_1.localize)(27, null), original: 'View as Tree' },
                toggled: testingContextKeys_1.TestingContextKeys.viewMode.isEqualTo("true" /* TestExplorerViewMode.Tree */),
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    order: 18 /* ActionOrder.DisplayMode */,
                    group: 'viewAs',
                    when: contextkey_1.$Ii.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */)
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
    exports.$$Kb = $$Kb;
    class $_Kb extends viewPane_1.$Keb {
        constructor() {
            super({
                id: "testing.sortByStatus" /* TestCommandId.TestingSortByStatusAction */,
                viewId: "workbench.view.testing" /* Testing.ExplorerViewId */,
                title: { value: (0, nls_1.localize)(28, null), original: 'Sort by Status' },
                toggled: testingContextKeys_1.TestingContextKeys.viewSorting.isEqualTo("status" /* TestExplorerViewSorting.ByStatus */),
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    order: 19 /* ActionOrder.Sort */,
                    group: 'sortBy',
                    when: contextkey_1.$Ii.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */)
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
    exports.$_Kb = $_Kb;
    class $aLb extends viewPane_1.$Keb {
        constructor() {
            super({
                id: "testing.sortByLocation" /* TestCommandId.TestingSortByLocationAction */,
                viewId: "workbench.view.testing" /* Testing.ExplorerViewId */,
                title: { value: (0, nls_1.localize)(29, null), original: 'Sort by Location' },
                toggled: testingContextKeys_1.TestingContextKeys.viewSorting.isEqualTo("location" /* TestExplorerViewSorting.ByLocation */),
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    order: 19 /* ActionOrder.Sort */,
                    group: 'sortBy',
                    when: contextkey_1.$Ii.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */)
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
    exports.$aLb = $aLb;
    class $bLb extends viewPane_1.$Keb {
        constructor() {
            super({
                id: "testing.sortByDuration" /* TestCommandId.TestingSortByDurationAction */,
                viewId: "workbench.view.testing" /* Testing.ExplorerViewId */,
                title: { value: (0, nls_1.localize)(30, null), original: 'Sort by Duration' },
                toggled: testingContextKeys_1.TestingContextKeys.viewSorting.isEqualTo("duration" /* TestExplorerViewSorting.ByDuration */),
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    order: 19 /* ActionOrder.Sort */,
                    group: 'sortBy',
                    when: contextkey_1.$Ii.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */)
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
    exports.$bLb = $bLb;
    class $cLb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.showMostRecentOutput" /* TestCommandId.ShowMostRecentOutputAction */,
                title: { value: (0, nls_1.localize)(31, null), original: 'Show Output' },
                category,
                icon: codicons_1.$Pj.terminal,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 45 /* KeyCode.KeyO */),
                },
                precondition: testingContextKeys_1.TestingContextKeys.hasAnyResults.isEqualTo(true),
                menu: [{
                        id: actions_1.$Ru.ViewTitle,
                        order: 16 /* ActionOrder.Collapse */,
                        group: 'navigation',
                        when: contextkey_1.$Ii.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */),
                    }, {
                        id: actions_1.$Ru.CommandPalette,
                        when: testingContextKeys_1.TestingContextKeys.hasAnyResults.isEqualTo(true)
                    }]
            });
        }
        async run(accessor) {
            const viewService = accessor.get(views_1.$$E);
            const testView = await viewService.openView("workbench.panel.testResults.view" /* Testing.ResultsViewId */, true);
            testView?.showLatestRun();
        }
    }
    exports.$cLb = $cLb;
    class $dLb extends viewPane_1.$Keb {
        constructor() {
            super({
                id: "testing.collapseAll" /* TestCommandId.CollapseAllAction */,
                viewId: "workbench.view.testing" /* Testing.ExplorerViewId */,
                title: { value: (0, nls_1.localize)(32, null), original: 'Collapse All Tests' },
                icon: codicons_1.$Pj.collapseAll,
                menu: {
                    id: actions_1.$Ru.ViewTitle,
                    order: 16 /* ActionOrder.Collapse */,
                    group: 'displayAction',
                    when: contextkey_1.$Ii.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */)
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
    exports.$dLb = $dLb;
    class $eLb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.clearTestResults" /* TestCommandId.ClearTestResultsAction */,
                title: { value: (0, nls_1.localize)(33, null), original: 'Clear All Results' },
                category,
                icon: codicons_1.$Pj.trash,
                menu: [{
                        id: actions_1.$Ru.TestPeekTitle,
                    }, {
                        id: actions_1.$Ru.CommandPalette,
                        when: testingContextKeys_1.TestingContextKeys.hasAnyResults.isEqualTo(true),
                    }, {
                        id: actions_1.$Ru.ViewTitle,
                        order: 17 /* ActionOrder.ClearResults */,
                        group: 'displayAction',
                        when: contextkey_1.$Ii.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */)
                    }, {
                        id: actions_1.$Ru.ViewTitle,
                        order: 17 /* ActionOrder.ClearResults */,
                        group: 'navigation',
                        when: contextkey_1.$Ii.equals('view', "workbench.panel.testResults.view" /* Testing.ResultsViewId */)
                    }],
            });
        }
        /**
         * @override
         */
        run(accessor) {
            accessor.get(testResultService_1.$ftb).clear();
        }
    }
    exports.$eLb = $eLb;
    class $fLb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.editFocusedTest" /* TestCommandId.GoToTest */,
                title: { value: (0, nls_1.localize)(34, null), original: 'Go to Test' },
                icon: codicons_1.$Pj.goToFile,
                menu: testItemInlineAndInContext(20 /* ActionOrder.GoToTest */, testingContextKeys_1.TestingContextKeys.testItemHasUri.isEqualTo(true)),
                keybinding: {
                    weight: 100 /* KeybindingWeight.EditorContrib */ - 10,
                    when: contextkeys_1.$Hdb.isEqualTo("workbench.view.testing" /* Testing.ExplorerViewId */),
                    primary: 3 /* KeyCode.Enter */ | 512 /* KeyMod.Alt */,
                },
            });
        }
        async run(accessor, element, preserveFocus) {
            if (!element) {
                const view = accessor.get(views_1.$$E).getActiveViewWithId("workbench.view.testing" /* Testing.ExplorerViewId */);
                element = view?.focusedTreeElements[0];
            }
            if (element && element instanceof index_1.$rKb) {
                accessor.get(commands_1.$Fr).executeCommand('vscode.revealTest', element.test.item.extId, preserveFocus);
            }
        }
    }
    exports.$fLb = $fLb;
    class ExecuteTestAtCursor extends actions_1.$Wu {
        constructor(options, c) {
            super({
                ...options,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: hasAnyTestProvider,
                    }, {
                        id: actions_1.$Ru.EditorContext,
                        group: 'testing',
                        order: c === 2 /* TestRunProfileBitset.Run */ ? 11 /* ActionOrder.Run */ : 12 /* ActionOrder.Debug */,
                        when: contextkey_1.$Ii.and(testingContextKeys_1.TestingContextKeys.activeEditorHasTests, testingContextKeys_1.TestingContextKeys.capabilityToContextKey[c]),
                    }]
            });
            this.c = c;
        }
        /**
         * @override
         */
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
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
            const testService = accessor.get(testService_1.$4sb);
            const profileService = accessor.get(testProfileService_1.$9sb);
            const uriIdentityService = accessor.get(uriIdentity_1.$Ck);
            const progressService = accessor.get(progress_1.$2u);
            const configurationService = accessor.get(configuration_1.$8h);
            let bestNodes = [];
            let bestRange;
            let bestNodesBefore = [];
            let bestRangeBefore;
            const saveBeforeTest = (0, configuration_2.$hKb)(configurationService, "testing.saveBeforeTest" /* TestingConfigKeys.SaveBeforeTest */);
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
                for await (const test of (0, testService_1.$8sb)(testService, uriIdentityService, model.uri)) {
                    if (!test.item.range || !(profileService.capabilitiesForTest(test) & this.c)) {
                        continue;
                    }
                    const irange = range_1.$ks.lift(test.item.range);
                    if (irange.containsPosition(position)) {
                        if (bestRange && range_1.$ks.equalsRange(test.item.range, bestRange)) {
                            // check that a parent isn't already included (#180760)
                            if (!bestNodes.some(b => testId_1.$PI.isChild(b.item.extId, test.item.extId))) {
                                bestNodes.push(test);
                            }
                        }
                        else {
                            bestRange = irange;
                            bestNodes = [test];
                        }
                    }
                    else if (position_1.$js.isBefore(irange.getStartPosition(), position)) {
                        if (!bestRangeBefore || bestRangeBefore.getStartPosition().isBefore(irange.getStartPosition())) {
                            bestRangeBefore = irange;
                            bestNodesBefore = [test];
                        }
                        else if (irange.equalsRange(bestRangeBefore) && !bestNodesBefore.some(b => testId_1.$PI.isChild(b.item.extId, test.item.extId))) {
                            bestNodesBefore.push(test);
                        }
                    }
                }
            })());
            const testsToRun = bestNodes.length ? bestNodes : bestNodesBefore;
            if (testsToRun.length) {
                await testService.runTests({
                    group: this.c,
                    tests: bestNodes.length ? bestNodes : bestNodesBefore,
                });
            }
            else if ((0, editorBrowser_1.$iV)(activeControl)) {
                messageController_1.$M2.get(activeControl)?.showMessage((0, nls_1.localize)(35, null), position);
            }
        }
    }
    class $gLb extends ExecuteTestAtCursor {
        constructor() {
            super({
                id: "testing.runAtCursor" /* TestCommandId.RunAtCursor */,
                title: { value: (0, nls_1.localize)(36, null), original: 'Run Test at Cursor' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 33 /* KeyCode.KeyC */),
                },
            }, 2 /* TestRunProfileBitset.Run */);
        }
    }
    exports.$gLb = $gLb;
    class $hLb extends ExecuteTestAtCursor {
        constructor() {
            super({
                id: "testing.debugAtCursor" /* TestCommandId.DebugAtCursor */,
                title: { value: (0, nls_1.localize)(37, null), original: 'Debug Test at Cursor' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */),
                },
            }, 4 /* TestRunProfileBitset.Debug */);
        }
    }
    exports.$hLb = $hLb;
    class ExecuteTestsInCurrentFile extends actions_1.$Wu {
        constructor(options, c) {
            super({
                ...options,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: testingContextKeys_1.TestingContextKeys.capabilityToContextKey[c].isEqualTo(true),
                    }, {
                        id: actions_1.$Ru.EditorContext,
                        group: 'testing',
                        // add 0.1 to be after the "at cursor" commands
                        order: (c === 2 /* TestRunProfileBitset.Run */ ? 11 /* ActionOrder.Run */ : 12 /* ActionOrder.Debug */) + 0.1,
                        when: contextkey_1.$Ii.and(testingContextKeys_1.TestingContextKeys.activeEditorHasTests, testingContextKeys_1.TestingContextKeys.capabilityToContextKey[c]),
                    }],
            });
            this.c = c;
        }
        /**
         * @override
         */
        run(accessor) {
            const control = accessor.get(editorService_1.$9C).activeTextEditorControl;
            const position = control?.getPosition();
            const model = control?.getModel();
            if (!position || !model || !('uri' in model)) {
                return;
            }
            const testService = accessor.get(testService_1.$4sb);
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
                    group: this.c,
                });
            }
            if ((0, editorBrowser_1.$iV)(control)) {
                messageController_1.$M2.get(control)?.showMessage((0, nls_1.localize)(38, null), position);
            }
            return undefined;
        }
    }
    class $iLb extends ExecuteTestsInCurrentFile {
        constructor() {
            super({
                id: "testing.runCurrentFile" /* TestCommandId.RunCurrentFile */,
                title: { value: (0, nls_1.localize)(39, null), original: 'Run Tests in Current File' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 36 /* KeyCode.KeyF */),
                },
            }, 2 /* TestRunProfileBitset.Run */);
        }
    }
    exports.$iLb = $iLb;
    class $jLb extends ExecuteTestsInCurrentFile {
        constructor() {
            super({
                id: "testing.debugCurrentFile" /* TestCommandId.DebugCurrentFile */,
                title: { value: (0, nls_1.localize)(40, null), original: 'Debug Tests in Current File' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */),
                },
            }, 4 /* TestRunProfileBitset.Debug */);
        }
    }
    exports.$jLb = $jLb;
    const $kLb = async (collection, progress, ids, runTests) => {
        const todo = Promise.all(ids.map(p => (0, testService_1.$7sb)(collection, p)));
        const tests = (await showDiscoveringWhile(progress, todo)).filter(types_1.$rf);
        return tests.length ? await runTests(tests) : undefined;
    };
    exports.$kLb = $kLb;
    class RunOrDebugExtsByPath extends actions_1.$Wu {
        /**
         * @override
         */
        async run(accessor, ...args) {
            const testService = accessor.get(testService_1.$4sb);
            await (0, exports.$kLb)(accessor.get(testService_1.$4sb).collection, accessor.get(progress_1.$2u), [...this.c(accessor, ...args)], tests => this.d(testService, tests));
        }
    }
    class RunOrDebugFailedTests extends RunOrDebugExtsByPath {
        constructor(options) {
            super({
                ...options,
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: hasAnyTestProvider,
                },
            });
        }
        /**
         * @inheritdoc
         */
        c(accessor) {
            const { results } = accessor.get(testResultService_1.$ftb);
            const ids = new Set();
            for (let i = results.length - 1; i >= 0; i--) {
                const resultSet = results[i];
                for (const test of resultSet.tests) {
                    if ((0, testingStates_1.$Psb)(test.ownComputedState)) {
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
                    id: actions_1.$Ru.CommandPalette,
                    when: contextkey_1.$Ii.and(hasAnyTestProvider, testingContextKeys_1.TestingContextKeys.hasAnyResults.isEqualTo(true)),
                },
            });
        }
        /**
         * @inheritdoc
         */
        *c(accessor, runId) {
            const resultService = accessor.get(testResultService_1.$ftb);
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
    class $lLb extends RunOrDebugFailedTests {
        constructor() {
            super({
                id: "testing.reRunFailTests" /* TestCommandId.ReRunFailedTests */,
                title: { value: (0, nls_1.localize)(41, null), original: 'Rerun Failed Tests' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 35 /* KeyCode.KeyE */),
                },
            });
        }
        d(service, internalTests) {
            return service.runTests({
                group: 2 /* TestRunProfileBitset.Run */,
                tests: internalTests,
            });
        }
    }
    exports.$lLb = $lLb;
    class $mLb extends RunOrDebugFailedTests {
        constructor() {
            super({
                id: "testing.debugFailTests" /* TestCommandId.DebugFailedTests */,
                title: { value: (0, nls_1.localize)(42, null), original: 'Debug Failed Tests' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 35 /* KeyCode.KeyE */),
                },
            });
        }
        d(service, internalTests) {
            return service.runTests({
                group: 4 /* TestRunProfileBitset.Debug */,
                tests: internalTests,
            });
        }
    }
    exports.$mLb = $mLb;
    class $nLb extends RunOrDebugLastRun {
        constructor() {
            super({
                id: "testing.reRunLastRun" /* TestCommandId.ReRunLastRun */,
                title: { value: (0, nls_1.localize)(43, null), original: 'Rerun Last Run' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 42 /* KeyCode.KeyL */),
                },
            });
        }
        d(service, internalTests) {
            return service.runTests({
                group: 2 /* TestRunProfileBitset.Run */,
                tests: internalTests,
            });
        }
    }
    exports.$nLb = $nLb;
    class $oLb extends RunOrDebugLastRun {
        constructor() {
            super({
                id: "testing.debugLastRun" /* TestCommandId.DebugLastRun */,
                title: { value: (0, nls_1.localize)(44, null), original: 'Debug Last Run' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 42 /* KeyCode.KeyL */),
                },
            });
        }
        d(service, internalTests) {
            return service.runTests({
                group: 4 /* TestRunProfileBitset.Debug */,
                tests: internalTests,
            });
        }
    }
    exports.$oLb = $oLb;
    class $pLb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.searchForTestExtension" /* TestCommandId.SearchForTestExtension */,
                title: { value: (0, nls_1.localize)(45, null), original: 'Search for Test Extension' },
            });
        }
        async run(accessor) {
            const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
            const viewlet = (await paneCompositeService.openPaneComposite(extensions_1.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true))?.getViewPaneContainer();
            viewlet.search('@category:"testing"');
            viewlet.focus();
        }
    }
    exports.$pLb = $pLb;
    class $qLb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.openOutputPeek" /* TestCommandId.OpenOutputPeek */,
                title: { value: (0, nls_1.localize)(46, null), original: 'Peek Output' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 43 /* KeyCode.KeyM */),
                },
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: testingContextKeys_1.TestingContextKeys.hasAnyResults.isEqualTo(true),
                },
            });
        }
        async run(accessor) {
            accessor.get(testingPeekOpener_1.$kKb).open();
        }
    }
    exports.$qLb = $qLb;
    class $rLb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.toggleInlineTestOutput" /* TestCommandId.ToggleInlineTestOutput */,
                title: { value: (0, nls_1.localize)(47, null), original: 'Toggle Inline Test Output' },
                category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 39 /* KeyCode.KeyI */),
                },
                menu: {
                    id: actions_1.$Ru.CommandPalette,
                    when: testingContextKeys_1.TestingContextKeys.hasAnyResults.isEqualTo(true),
                },
            });
        }
        async run(accessor) {
            const testService = accessor.get(testService_1.$4sb);
            testService.showInlineOutput.value = !testService.showInlineOutput.value;
        }
    }
    exports.$rLb = $rLb;
    const refreshMenus = (whenIsRefreshing) => [
        {
            id: actions_1.$Ru.TestItem,
            group: 'inline',
            order: 10 /* ActionOrder.Refresh */,
            when: contextkey_1.$Ii.and(testingContextKeys_1.TestingContextKeys.canRefreshTests.isEqualTo(true), testingContextKeys_1.TestingContextKeys.isRefreshingTests.isEqualTo(whenIsRefreshing)),
        },
        {
            id: actions_1.$Ru.ViewTitle,
            group: 'navigation',
            order: 10 /* ActionOrder.Refresh */,
            when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('view', "workbench.view.testing" /* Testing.ExplorerViewId */), testingContextKeys_1.TestingContextKeys.canRefreshTests.isEqualTo(true), testingContextKeys_1.TestingContextKeys.isRefreshingTests.isEqualTo(whenIsRefreshing)),
        },
        {
            id: actions_1.$Ru.CommandPalette,
            when: testingContextKeys_1.TestingContextKeys.canRefreshTests.isEqualTo(true),
        },
    ];
    class $sLb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.refreshTests" /* TestCommandId.RefreshTestsAction */,
                title: { value: (0, nls_1.localize)(48, null), original: 'Refresh Tests' },
                category,
                icon: icons.$_Jb,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 85 /* KeyCode.Semicolon */, 2048 /* KeyMod.CtrlCmd */ | 48 /* KeyCode.KeyR */),
                    when: testingContextKeys_1.TestingContextKeys.canRefreshTests.isEqualTo(true),
                },
                menu: refreshMenus(false),
            });
        }
        async run(accessor, ...elements) {
            const testService = accessor.get(testService_1.$4sb);
            const progressService = accessor.get(progress_1.$2u);
            const controllerIds = (0, arrays_1.$Kb)(elements.filter(types_1.$rf).map(e => e.test.controllerId));
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
    exports.$sLb = $sLb;
    class $tLb extends actions_1.$Wu {
        constructor() {
            super({
                id: "testing.cancelTestRefresh" /* TestCommandId.CancelTestRefreshAction */,
                title: { value: (0, nls_1.localize)(49, null), original: 'Cancel Test Refresh' },
                category,
                icon: icons.$dKb,
                menu: refreshMenus(true),
            });
        }
        async run(accessor) {
            accessor.get(testService_1.$4sb).cancelRefreshTests();
        }
    }
    exports.$tLb = $tLb;
    exports.$uLb = [
        $tLb,
        $9Kb,
        $eLb,
        $dLb,
        $2Kb,
        $ZKb,
        $1Kb,
        $VKb,
        $8Kb,
        $hLb,
        $jLb,
        $mLb,
        $oLb,
        $6Kb,
        $fLb,
        $4Kb,
        $3Kb,
        $SKb,
        $qLb,
        $sLb,
        $lLb,
        $nLb,
        $XKb,
        $7Kb,
        $gLb,
        $iLb,
        $5Kb,
        $WKb,
        $pLb,
        $YKb,
        $cLb,
        StartContinuousRunAction,
        StopContinuousRunAction,
        $bLb,
        $aLb,
        $_Kb,
        $0Kb,
        $$Kb,
        $rLb,
        $UKb,
        $TKb,
    ];
});
//# sourceMappingURL=testExplorerActions.js.map