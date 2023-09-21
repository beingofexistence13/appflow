/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/nls!vs/workbench/contrib/testing/browser/testing.contribution", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/common/contributions", "vs/workbench/common/views", "vs/workbench/contrib/files/browser/fileConstants", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/browser/testingDecorations", "vs/workbench/contrib/testing/browser/testingExplorerView", "vs/workbench/contrib/testing/browser/testingOutputPeek", "vs/workbench/contrib/testing/browser/testingProgressUiService", "vs/workbench/contrib/testing/browser/testingViewPaneContainer", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/testExplorerFilterState", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testResultStorage", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/testServiceImpl", "vs/workbench/contrib/testing/common/testingContentProvider", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testingContinuousRunService", "vs/workbench/contrib/testing/common/testingDecorations", "vs/workbench/contrib/testing/common/testingPeekOpener", "./testExplorerActions", "./testingConfigurationUi"], function (require, exports, editorExtensions_1, nls_1, actions_1, commands_1, configurationRegistry_1, contextkey_1, files_1, descriptors_1, extensions_1, opener_1, progress_1, platform_1, viewPaneContainer_1, contributions_1, views_1, fileConstants_1, icons_1, testingDecorations_1, testingExplorerView_1, testingOutputPeek_1, testingProgressUiService_1, testingViewPaneContainer_1, configuration_1, testExplorerFilterState_1, testId_1, testProfileService_1, testResultService_1, testResultStorage_1, testService_1, testServiceImpl_1, testingContentProvider_1, testingContextKeys_1, testingContinuousRunService_1, testingDecorations_2, testingPeekOpener_1, testExplorerActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.$mr)(testService_1.$4sb, testServiceImpl_1.$PKb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(testResultStorage_1.$btb, testResultStorage_1.$etb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(testProfileService_1.$9sb, testProfileService_1.$_sb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(testingContinuousRunService_1.$QKb, testingContinuousRunService_1.$RKb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(testResultService_1.$ftb, testResultService_1.$gtb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(testExplorerFilterState_1.$EKb, testExplorerFilterState_1.$FKb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(testingPeekOpener_1.$kKb, testingOutputPeek_1.$GKb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(testingDecorations_2.$jKb, testingDecorations_1.$oKb, 1 /* InstantiationType.Delayed */);
    const viewContainer = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: "workbench.view.extension.test" /* Testing.ViewletId */,
        title: { value: (0, nls_1.localize)(0, null), original: 'Testing' },
        ctorDescriptor: new descriptors_1.$yh(testingViewPaneContainer_1.$ALb),
        icon: icons_1.$YJb,
        alwaysUseContainerInfo: true,
        order: 6,
        openCommandActionDescriptor: {
            id: "workbench.view.extension.test" /* Testing.ViewletId */,
            mnemonicTitle: (0, nls_1.localize)(1, null),
            // todo: coordinate with joh whether this is available
            // keybindings: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.US_SEMICOLON },
            order: 4,
        },
        hideIfEmpty: true,
    }, 0 /* ViewContainerLocation.Sidebar */);
    const testResultsViewContainer = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: "workbench.panel.testResults" /* Testing.ResultsPanelId */,
        title: { value: (0, nls_1.localize)(2, null), original: 'Test Results' },
        icon: icons_1.$ZJb,
        ctorDescriptor: new descriptors_1.$yh(viewPaneContainer_1.$Seb, ["workbench.panel.testResults" /* Testing.ResultsPanelId */, { mergeViewWithContainerWhenSingleView: true }]),
        hideIfEmpty: true,
        order: 3,
    }, 1 /* ViewContainerLocation.Panel */, { doNotRegisterOpenCommand: true });
    const viewsRegistry = platform_1.$8m.as(views_1.Extensions.ViewsRegistry);
    viewsRegistry.registerViews([{
            id: "workbench.panel.testResults.view" /* Testing.ResultsViewId */,
            name: (0, nls_1.localize)(3, null),
            containerIcon: icons_1.$ZJb,
            canToggleVisibility: false,
            canMoveView: true,
            when: testingContextKeys_1.TestingContextKeys.hasAnyResults.isEqualTo(true),
            ctorDescriptor: new descriptors_1.$yh(testingOutputPeek_1.$IKb),
        }], testResultsViewContainer);
    viewsRegistry.registerViewWelcomeContent("workbench.view.testing" /* Testing.ExplorerViewId */, {
        content: (0, nls_1.localize)(4, null),
    });
    viewsRegistry.registerViewWelcomeContent("workbench.view.testing" /* Testing.ExplorerViewId */, {
        content: '[' + (0, nls_1.localize)(5, null) + `](command:${"testing.searchForTestExtension" /* TestCommandId.SearchForTestExtension */})`,
        order: 10
    });
    viewsRegistry.registerViews([{
            id: "workbench.view.testing" /* Testing.ExplorerViewId */,
            name: (0, nls_1.localize)(6, null),
            ctorDescriptor: new descriptors_1.$yh(testingExplorerView_1.$zLb),
            canToggleVisibility: true,
            canMoveView: true,
            weight: 80,
            order: -999,
            containerIcon: icons_1.$YJb,
            // temporary until release, at which point we can show the welcome view:
            when: contextkey_1.$Ii.greater(testingContextKeys_1.TestingContextKeys.providerCount.key, 0),
        }], viewContainer);
    testExplorerActions_1.$uLb.forEach(actions_1.$Xu);
    (0, actions_1.$Xu)(testingOutputPeek_1.$MKb);
    (0, actions_1.$Xu)(testingOutputPeek_1.$LKb);
    (0, actions_1.$Xu)(testingOutputPeek_1.$KKb);
    (0, actions_1.$Xu)(testingOutputPeek_1.$JKb);
    (0, actions_1.$Xu)(testingOutputPeek_1.$NKb);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(testingContentProvider_1.$BLb, 3 /* LifecyclePhase.Restored */);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(testingOutputPeek_1.$GKb, 4 /* LifecyclePhase.Eventually */);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(testingProgressUiService_1.$wLb, 4 /* LifecyclePhase.Eventually */);
    (0, editorExtensions_1.$AV)("editor.contrib.testingOutputPeek" /* Testing.OutputPeekContributionId */, testingOutputPeek_1.$HKb, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.$AV)("editor.contrib.testingDecorations" /* Testing.DecorationsContributionId */, testingDecorations_1.$pKb, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    commands_1.$Gr.registerCommand({
        id: '_revealTestInExplorer',
        handler: async (accessor, testId, focus) => {
            accessor.get(testExplorerFilterState_1.$EKb).reveal.value = typeof testId === 'string' ? testId : testId.extId;
            accessor.get(views_1.$$E).openView("workbench.view.testing" /* Testing.ExplorerViewId */, focus);
        }
    });
    commands_1.$Gr.registerCommand({
        id: 'vscode.peekTestError',
        handler: async (accessor, extId) => {
            const lookup = accessor.get(testResultService_1.$ftb).getStateById(extId);
            if (!lookup) {
                return false;
            }
            const [result, ownState] = lookup;
            const opener = accessor.get(testingPeekOpener_1.$kKb);
            if (opener.tryPeekFirstError(result, ownState)) { // fast path
                return true;
            }
            for (const test of result.tests) {
                if (testId_1.$PI.compare(ownState.item.extId, test.item.extId) === 2 /* TestPosition.IsChild */ && opener.tryPeekFirstError(result, test)) {
                    return true;
                }
            }
            return false;
        }
    });
    commands_1.$Gr.registerCommand({
        id: 'vscode.revealTest',
        handler: async (accessor, extId) => {
            const test = accessor.get(testService_1.$4sb).collection.getNodeById(extId);
            if (!test) {
                return;
            }
            const commandService = accessor.get(commands_1.$Fr);
            const fileService = accessor.get(files_1.$6j);
            const openerService = accessor.get(opener_1.$NT);
            const { range, uri } = test.item;
            if (!uri) {
                return;
            }
            // If an editor has the file open, there are decorations. Try to adjust the
            // revealed range to those decorations (#133441).
            const position = accessor.get(testingDecorations_2.$jKb).getDecoratedTestPosition(uri, extId) || range?.getStartPosition();
            accessor.get(testExplorerFilterState_1.$EKb).reveal.value = extId;
            accessor.get(testingPeekOpener_1.$kKb).closeAllPeeks();
            let isFile = true;
            try {
                if (!(await fileService.stat(uri)).isFile) {
                    isFile = false;
                }
            }
            catch {
                // ignored
            }
            if (!isFile) {
                await commandService.executeCommand(fileConstants_1.$WGb, uri);
                return;
            }
            await openerService.open(position
                ? uri.with({ fragment: `L${position.lineNumber}:${position.column}` })
                : uri);
        }
    });
    commands_1.$Gr.registerCommand({
        id: 'vscode.runTestsById',
        handler: async (accessor, group, ...testIds) => {
            const testService = accessor.get(testService_1.$4sb);
            await (0, testExplorerActions_1.$kLb)(accessor.get(testService_1.$4sb).collection, accessor.get(progress_1.$2u), testIds, tests => testService.runTests({ group, tests }));
        }
    });
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration(configuration_1.$gKb);
});
//# sourceMappingURL=testing.contribution.js.map