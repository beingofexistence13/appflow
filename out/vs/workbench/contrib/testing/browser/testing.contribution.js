/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/common/contributions", "vs/workbench/common/views", "vs/workbench/contrib/files/browser/fileConstants", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/browser/testingDecorations", "vs/workbench/contrib/testing/browser/testingExplorerView", "vs/workbench/contrib/testing/browser/testingOutputPeek", "vs/workbench/contrib/testing/browser/testingProgressUiService", "vs/workbench/contrib/testing/browser/testingViewPaneContainer", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/testExplorerFilterState", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testResultStorage", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/testServiceImpl", "vs/workbench/contrib/testing/common/testingContentProvider", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testingContinuousRunService", "vs/workbench/contrib/testing/common/testingDecorations", "vs/workbench/contrib/testing/common/testingPeekOpener", "./testExplorerActions", "./testingConfigurationUi"], function (require, exports, editorExtensions_1, nls_1, actions_1, commands_1, configurationRegistry_1, contextkey_1, files_1, descriptors_1, extensions_1, opener_1, progress_1, platform_1, viewPaneContainer_1, contributions_1, views_1, fileConstants_1, icons_1, testingDecorations_1, testingExplorerView_1, testingOutputPeek_1, testingProgressUiService_1, testingViewPaneContainer_1, configuration_1, testExplorerFilterState_1, testId_1, testProfileService_1, testResultService_1, testResultStorage_1, testService_1, testServiceImpl_1, testingContentProvider_1, testingContextKeys_1, testingContinuousRunService_1, testingDecorations_2, testingPeekOpener_1, testExplorerActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.registerSingleton)(testService_1.ITestService, testServiceImpl_1.TestService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(testResultStorage_1.ITestResultStorage, testResultStorage_1.TestResultStorage, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(testProfileService_1.ITestProfileService, testProfileService_1.TestProfileService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(testingContinuousRunService_1.ITestingContinuousRunService, testingContinuousRunService_1.TestingContinuousRunService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(testResultService_1.ITestResultService, testResultService_1.TestResultService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(testExplorerFilterState_1.ITestExplorerFilterState, testExplorerFilterState_1.TestExplorerFilterState, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(testingPeekOpener_1.ITestingPeekOpener, testingOutputPeek_1.TestingPeekOpener, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(testingDecorations_2.ITestingDecorationsService, testingDecorations_1.TestingDecorationService, 1 /* InstantiationType.Delayed */);
    const viewContainer = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: "workbench.view.extension.test" /* Testing.ViewletId */,
        title: { value: (0, nls_1.localize)('test', "Testing"), original: 'Testing' },
        ctorDescriptor: new descriptors_1.SyncDescriptor(testingViewPaneContainer_1.TestingViewPaneContainer),
        icon: icons_1.testingViewIcon,
        alwaysUseContainerInfo: true,
        order: 6,
        openCommandActionDescriptor: {
            id: "workbench.view.extension.test" /* Testing.ViewletId */,
            mnemonicTitle: (0, nls_1.localize)({ key: 'miViewTesting', comment: ['&& denotes a mnemonic'] }, "T&&esting"),
            // todo: coordinate with joh whether this is available
            // keybindings: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.US_SEMICOLON },
            order: 4,
        },
        hideIfEmpty: true,
    }, 0 /* ViewContainerLocation.Sidebar */);
    const testResultsViewContainer = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: "workbench.panel.testResults" /* Testing.ResultsPanelId */,
        title: { value: (0, nls_1.localize)('testResultsPanelName', "Test Results"), original: 'Test Results' },
        icon: icons_1.testingResultsIcon,
        ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, ["workbench.panel.testResults" /* Testing.ResultsPanelId */, { mergeViewWithContainerWhenSingleView: true }]),
        hideIfEmpty: true,
        order: 3,
    }, 1 /* ViewContainerLocation.Panel */, { doNotRegisterOpenCommand: true });
    const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
    viewsRegistry.registerViews([{
            id: "workbench.panel.testResults.view" /* Testing.ResultsViewId */,
            name: (0, nls_1.localize)('testResultsPanelName', "Test Results"),
            containerIcon: icons_1.testingResultsIcon,
            canToggleVisibility: false,
            canMoveView: true,
            when: testingContextKeys_1.TestingContextKeys.hasAnyResults.isEqualTo(true),
            ctorDescriptor: new descriptors_1.SyncDescriptor(testingOutputPeek_1.TestResultsView),
        }], testResultsViewContainer);
    viewsRegistry.registerViewWelcomeContent("workbench.view.testing" /* Testing.ExplorerViewId */, {
        content: (0, nls_1.localize)('noTestProvidersRegistered', "No tests have been found in this workspace yet."),
    });
    viewsRegistry.registerViewWelcomeContent("workbench.view.testing" /* Testing.ExplorerViewId */, {
        content: '[' + (0, nls_1.localize)('searchForAdditionalTestExtensions', "Install Additional Test Extensions...") + `](command:${"testing.searchForTestExtension" /* TestCommandId.SearchForTestExtension */})`,
        order: 10
    });
    viewsRegistry.registerViews([{
            id: "workbench.view.testing" /* Testing.ExplorerViewId */,
            name: (0, nls_1.localize)('testExplorer', "Test Explorer"),
            ctorDescriptor: new descriptors_1.SyncDescriptor(testingExplorerView_1.TestingExplorerView),
            canToggleVisibility: true,
            canMoveView: true,
            weight: 80,
            order: -999,
            containerIcon: icons_1.testingViewIcon,
            // temporary until release, at which point we can show the welcome view:
            when: contextkey_1.ContextKeyExpr.greater(testingContextKeys_1.TestingContextKeys.providerCount.key, 0),
        }], viewContainer);
    testExplorerActions_1.allTestActions.forEach(actions_1.registerAction2);
    (0, actions_1.registerAction2)(testingOutputPeek_1.OpenMessageInEditorAction);
    (0, actions_1.registerAction2)(testingOutputPeek_1.GoToPreviousMessageAction);
    (0, actions_1.registerAction2)(testingOutputPeek_1.GoToNextMessageAction);
    (0, actions_1.registerAction2)(testingOutputPeek_1.CloseTestPeek);
    (0, actions_1.registerAction2)(testingOutputPeek_1.ToggleTestingPeekHistory);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(testingContentProvider_1.TestingContentProvider, 3 /* LifecyclePhase.Restored */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(testingOutputPeek_1.TestingPeekOpener, 4 /* LifecyclePhase.Eventually */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(testingProgressUiService_1.TestingProgressTrigger, 4 /* LifecyclePhase.Eventually */);
    (0, editorExtensions_1.registerEditorContribution)("editor.contrib.testingOutputPeek" /* Testing.OutputPeekContributionId */, testingOutputPeek_1.TestingOutputPeekController, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.registerEditorContribution)("editor.contrib.testingDecorations" /* Testing.DecorationsContributionId */, testingDecorations_1.TestingDecorations, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    commands_1.CommandsRegistry.registerCommand({
        id: '_revealTestInExplorer',
        handler: async (accessor, testId, focus) => {
            accessor.get(testExplorerFilterState_1.ITestExplorerFilterState).reveal.value = typeof testId === 'string' ? testId : testId.extId;
            accessor.get(views_1.IViewsService).openView("workbench.view.testing" /* Testing.ExplorerViewId */, focus);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'vscode.peekTestError',
        handler: async (accessor, extId) => {
            const lookup = accessor.get(testResultService_1.ITestResultService).getStateById(extId);
            if (!lookup) {
                return false;
            }
            const [result, ownState] = lookup;
            const opener = accessor.get(testingPeekOpener_1.ITestingPeekOpener);
            if (opener.tryPeekFirstError(result, ownState)) { // fast path
                return true;
            }
            for (const test of result.tests) {
                if (testId_1.TestId.compare(ownState.item.extId, test.item.extId) === 2 /* TestPosition.IsChild */ && opener.tryPeekFirstError(result, test)) {
                    return true;
                }
            }
            return false;
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'vscode.revealTest',
        handler: async (accessor, extId) => {
            const test = accessor.get(testService_1.ITestService).collection.getNodeById(extId);
            if (!test) {
                return;
            }
            const commandService = accessor.get(commands_1.ICommandService);
            const fileService = accessor.get(files_1.IFileService);
            const openerService = accessor.get(opener_1.IOpenerService);
            const { range, uri } = test.item;
            if (!uri) {
                return;
            }
            // If an editor has the file open, there are decorations. Try to adjust the
            // revealed range to those decorations (#133441).
            const position = accessor.get(testingDecorations_2.ITestingDecorationsService).getDecoratedTestPosition(uri, extId) || range?.getStartPosition();
            accessor.get(testExplorerFilterState_1.ITestExplorerFilterState).reveal.value = extId;
            accessor.get(testingPeekOpener_1.ITestingPeekOpener).closeAllPeeks();
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
                await commandService.executeCommand(fileConstants_1.REVEAL_IN_EXPLORER_COMMAND_ID, uri);
                return;
            }
            await openerService.open(position
                ? uri.with({ fragment: `L${position.lineNumber}:${position.column}` })
                : uri);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'vscode.runTestsById',
        handler: async (accessor, group, ...testIds) => {
            const testService = accessor.get(testService_1.ITestService);
            await (0, testExplorerActions_1.discoverAndRunTests)(accessor.get(testService_1.ITestService).collection, accessor.get(progress_1.IProgressService), testIds, tests => testService.runTests({ group, tests }));
        }
    });
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration(configuration_1.testingConfiguration);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZy5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXN0aW5nL2Jyb3dzZXIvdGVzdGluZy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUE0Q2hHLElBQUEsOEJBQWlCLEVBQUMsMEJBQVksRUFBRSw2QkFBVyxvQ0FBNEIsQ0FBQztJQUN4RSxJQUFBLDhCQUFpQixFQUFDLHNDQUFrQixFQUFFLHFDQUFpQixvQ0FBNEIsQ0FBQztJQUNwRixJQUFBLDhCQUFpQixFQUFDLHdDQUFtQixFQUFFLHVDQUFrQixvQ0FBNEIsQ0FBQztJQUN0RixJQUFBLDhCQUFpQixFQUFDLDBEQUE0QixFQUFFLHlEQUEyQixvQ0FBNEIsQ0FBQztJQUN4RyxJQUFBLDhCQUFpQixFQUFDLHNDQUFrQixFQUFFLHFDQUFpQixvQ0FBNEIsQ0FBQztJQUNwRixJQUFBLDhCQUFpQixFQUFDLGtEQUF3QixFQUFFLGlEQUF1QixvQ0FBNEIsQ0FBQztJQUNoRyxJQUFBLDhCQUFpQixFQUFDLHNDQUFrQixFQUFFLHFDQUFpQixvQ0FBNEIsQ0FBQztJQUNwRixJQUFBLDhCQUFpQixFQUFDLCtDQUEwQixFQUFFLDZDQUF3QixvQ0FBNEIsQ0FBQztJQUVuRyxNQUFNLGFBQWEsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBMEIsa0JBQXVCLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztRQUNoSSxFQUFFLHlEQUFtQjtRQUNyQixLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUU7UUFDbEUsY0FBYyxFQUFFLElBQUksNEJBQWMsQ0FBQyxtREFBd0IsQ0FBQztRQUM1RCxJQUFJLEVBQUUsdUJBQWU7UUFDckIsc0JBQXNCLEVBQUUsSUFBSTtRQUM1QixLQUFLLEVBQUUsQ0FBQztRQUNSLDJCQUEyQixFQUFFO1lBQzVCLEVBQUUseURBQW1CO1lBQ3JCLGFBQWEsRUFBRSxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQztZQUNsRyxzREFBc0Q7WUFDdEQsa0ZBQWtGO1lBQ2xGLEtBQUssRUFBRSxDQUFDO1NBQ1I7UUFDRCxXQUFXLEVBQUUsSUFBSTtLQUNqQix3Q0FBZ0MsQ0FBQztJQUdsQyxNQUFNLHdCQUF3QixHQUFHLG1CQUFRLENBQUMsRUFBRSxDQUEwQixrQkFBdUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO1FBQzNJLEVBQUUsNERBQXdCO1FBQzFCLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSxjQUFjLENBQUMsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFO1FBQzVGLElBQUksRUFBRSwwQkFBa0I7UUFDeEIsY0FBYyxFQUFFLElBQUksNEJBQWMsQ0FBQyxxQ0FBaUIsRUFBRSw2REFBeUIsRUFBRSxvQ0FBb0MsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQy9ILFdBQVcsRUFBRSxJQUFJO1FBQ2pCLEtBQUssRUFBRSxDQUFDO0tBQ1IsdUNBQStCLEVBQUUsd0JBQXdCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUVwRSxNQUFNLGFBQWEsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBaUIsa0JBQXVCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFHekYsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzVCLEVBQUUsZ0VBQXVCO1lBQ3pCLElBQUksRUFBRSxJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSxjQUFjLENBQUM7WUFDdEQsYUFBYSxFQUFFLDBCQUFrQjtZQUNqQyxtQkFBbUIsRUFBRSxLQUFLO1lBQzFCLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLElBQUksRUFBRSx1Q0FBa0IsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztZQUN0RCxjQUFjLEVBQUUsSUFBSSw0QkFBYyxDQUFDLG1DQUFlLENBQUM7U0FDbkQsQ0FBQyxFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFFOUIsYUFBYSxDQUFDLDBCQUEwQix3REFBeUI7UUFDaEUsT0FBTyxFQUFFLElBQUEsY0FBUSxFQUFDLDJCQUEyQixFQUFFLGlEQUFpRCxDQUFDO0tBQ2pHLENBQUMsQ0FBQztJQUVILGFBQWEsQ0FBQywwQkFBMEIsd0RBQXlCO1FBQ2hFLE9BQU8sRUFBRSxHQUFHLEdBQUcsSUFBQSxjQUFRLEVBQUMsbUNBQW1DLEVBQUUsdUNBQXVDLENBQUMsR0FBRyxhQUFhLDJFQUFvQyxHQUFHO1FBQzVKLEtBQUssRUFBRSxFQUFFO0tBQ1QsQ0FBQyxDQUFDO0lBRUgsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzVCLEVBQUUsdURBQXdCO1lBQzFCLElBQUksRUFBRSxJQUFBLGNBQVEsRUFBQyxjQUFjLEVBQUUsZUFBZSxDQUFDO1lBQy9DLGNBQWMsRUFBRSxJQUFJLDRCQUFjLENBQUMseUNBQW1CLENBQUM7WUFDdkQsbUJBQW1CLEVBQUUsSUFBSTtZQUN6QixXQUFXLEVBQUUsSUFBSTtZQUNqQixNQUFNLEVBQUUsRUFBRTtZQUNWLEtBQUssRUFBRSxDQUFDLEdBQUc7WUFDWCxhQUFhLEVBQUUsdUJBQWU7WUFDOUIsd0VBQXdFO1lBQ3hFLElBQUksRUFBRSwyQkFBYyxDQUFDLE9BQU8sQ0FBQyx1Q0FBa0IsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUNyRSxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFFbkIsb0NBQWMsQ0FBQyxPQUFPLENBQUMseUJBQWUsQ0FBQyxDQUFDO0lBQ3hDLElBQUEseUJBQWUsRUFBQyw2Q0FBeUIsQ0FBQyxDQUFDO0lBQzNDLElBQUEseUJBQWUsRUFBQyw2Q0FBeUIsQ0FBQyxDQUFDO0lBQzNDLElBQUEseUJBQWUsRUFBQyx5Q0FBcUIsQ0FBQyxDQUFDO0lBQ3ZDLElBQUEseUJBQWUsRUFBQyxpQ0FBYSxDQUFDLENBQUM7SUFDL0IsSUFBQSx5QkFBZSxFQUFDLDRDQUF3QixDQUFDLENBQUM7SUFFMUMsbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLCtDQUFzQixrQ0FBMEIsQ0FBQztJQUMzSixtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQUMscUNBQWlCLG9DQUE0QixDQUFDO0lBQ3hKLG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxpREFBc0Isb0NBQTRCLENBQUM7SUFFN0osSUFBQSw2Q0FBMEIsNkVBQW1DLCtDQUEyQiwyREFBbUQsQ0FBQztJQUM1SSxJQUFBLDZDQUEwQiwrRUFBb0MsdUNBQWtCLDJEQUFtRCxDQUFDO0lBRXBJLDJCQUFnQixDQUFDLGVBQWUsQ0FBQztRQUNoQyxFQUFFLEVBQUUsdUJBQXVCO1FBQzNCLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBMEIsRUFBRSxNQUEwQixFQUFFLEtBQWUsRUFBRSxFQUFFO1lBQzFGLFFBQVEsQ0FBQyxHQUFHLENBQUMsa0RBQXdCLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ3pHLFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQWEsQ0FBQyxDQUFDLFFBQVEsd0RBQXlCLEtBQUssQ0FBQyxDQUFDO1FBQ3JFLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCwyQkFBZ0IsQ0FBQyxlQUFlLENBQUM7UUFDaEMsRUFBRSxFQUFFLHNCQUFzQjtRQUMxQixPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQTBCLEVBQUUsS0FBYSxFQUFFLEVBQUU7WUFDNUQsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxzQ0FBa0IsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNwRSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxNQUFNLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHLE1BQU0sQ0FBQztZQUNsQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHNDQUFrQixDQUFDLENBQUM7WUFDaEQsSUFBSSxNQUFNLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxFQUFFLEVBQUUsWUFBWTtnQkFDN0QsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELEtBQUssTUFBTSxJQUFJLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtnQkFDaEMsSUFBSSxlQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlDQUF5QixJQUFJLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7b0JBQzVILE9BQU8sSUFBSSxDQUFDO2lCQUNaO2FBQ0Q7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCwyQkFBZ0IsQ0FBQyxlQUFlLENBQUM7UUFDaEMsRUFBRSxFQUFFLG1CQUFtQjtRQUN2QixPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQTBCLEVBQUUsS0FBYSxFQUFFLEVBQUU7WUFDNUQsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQkFBWSxDQUFDLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0RSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNWLE9BQU87YUFDUDtZQUNELE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQWUsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsb0JBQVksQ0FBQyxDQUFDO1lBQy9DLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsdUJBQWMsQ0FBQyxDQUFDO1lBRW5ELE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNqQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNULE9BQU87YUFDUDtZQUVELDJFQUEyRTtZQUMzRSxpREFBaUQ7WUFDakQsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQ0FBMEIsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQztZQUU1SCxRQUFRLENBQUMsR0FBRyxDQUFDLGtEQUF3QixDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDNUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxzQ0FBa0IsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRWpELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJO2dCQUNILElBQUksQ0FBQyxDQUFDLE1BQU0sV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRTtvQkFDMUMsTUFBTSxHQUFHLEtBQUssQ0FBQztpQkFDZjthQUNEO1lBQUMsTUFBTTtnQkFDUCxVQUFVO2FBQ1Y7WUFFRCxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE1BQU0sY0FBYyxDQUFDLGNBQWMsQ0FBQyw2Q0FBNkIsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDeEUsT0FBTzthQUNQO1lBRUQsTUFBTSxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVE7Z0JBQ2hDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksUUFBUSxDQUFDLFVBQVUsSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFDdEUsQ0FBQyxDQUFDLEdBQUcsQ0FDTCxDQUFDO1FBQ0gsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILDJCQUFnQixDQUFDLGVBQWUsQ0FBQztRQUNoQyxFQUFFLEVBQUUscUJBQXFCO1FBQ3pCLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBMEIsRUFBRSxLQUEyQixFQUFFLEdBQUcsT0FBaUIsRUFBRSxFQUFFO1lBQ2hHLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsMEJBQVksQ0FBQyxDQUFDO1lBQy9DLE1BQU0sSUFBQSx5Q0FBbUIsRUFDeEIsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQkFBWSxDQUFDLENBQUMsVUFBVSxFQUNyQyxRQUFRLENBQUMsR0FBRyxDQUFDLDJCQUFnQixDQUFDLEVBQzlCLE9BQU8sRUFDUCxLQUFLLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FDL0MsQ0FBQztRQUNILENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxtQkFBUSxDQUFDLEVBQUUsQ0FBeUIsa0NBQXVCLENBQUMsYUFBYSxDQUFDLENBQUMscUJBQXFCLENBQUMsb0NBQW9CLENBQUMsQ0FBQyJ9