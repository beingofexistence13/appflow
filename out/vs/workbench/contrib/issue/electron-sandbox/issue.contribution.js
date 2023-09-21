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
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/workbench/services/issue/common/issue", "vs/platform/commands/common/commands", "vs/workbench/contrib/issue/common/issue.contribution", "vs/platform/product/common/productService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/action/common/actionCommonCategories", "vs/platform/environment/common/environment", "vs/platform/dialogs/common/dialogs", "vs/platform/native/common/native", "vs/platform/progress/common/progress", "vs/platform/issue/common/issue"], function (require, exports, nls_1, actions_1, issue_1, commands_1, issue_contribution_1, productService_1, platform_1, contributions_1, actionCommonCategories_1, environment_1, dialogs_1, native_1, progress_1, issue_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Issue Contribution
    let NativeIssueContribution = class NativeIssueContribution extends issue_contribution_1.BaseIssueContribution {
        constructor(productService) {
            super(productService);
            if (productService.reportIssueUrl) {
                (0, actions_1.registerAction2)(ReportPerformanceIssueUsingReporterAction);
            }
        }
    };
    NativeIssueContribution = __decorate([
        __param(0, productService_1.IProductService)
    ], NativeIssueContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(NativeIssueContribution, 3 /* LifecyclePhase.Restored */);
    class ReportPerformanceIssueUsingReporterAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.reportPerformanceIssueUsingReporter'; }
        constructor() {
            super({
                id: ReportPerformanceIssueUsingReporterAction.ID,
                title: { value: (0, nls_1.localize)({ key: 'reportPerformanceIssue', comment: [`Here, 'issue' means problem or bug`] }, "Report Performance Issue..."), original: 'Report Performance Issue' },
                category: actionCommonCategories_1.Categories.Help,
                f1: true
            });
        }
        async run(accessor) {
            const issueService = accessor.get(issue_1.IWorkbenchIssueService);
            return issueService.openReporter({ issueType: 1 /* IssueType.PerformanceIssue */ });
        }
    }
    //#endregion
    //#region Commands
    class OpenProcessExplorer extends actions_1.Action2 {
        static { this.ID = 'workbench.action.openProcessExplorer'; }
        constructor() {
            super({
                id: OpenProcessExplorer.ID,
                title: { value: (0, nls_1.localize)('openProcessExplorer', "Open Process Explorer"), original: 'Open Process Explorer' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const issueService = accessor.get(issue_1.IWorkbenchIssueService);
            return issueService.openProcessExplorer();
        }
    }
    (0, actions_1.registerAction2)(OpenProcessExplorer);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarHelpMenu, {
        group: '5_tools',
        command: {
            id: OpenProcessExplorer.ID,
            title: (0, nls_1.localize)({ key: 'miOpenProcessExplorerer', comment: ['&& denotes a mnemonic'] }, "Open &&Process Explorer")
        },
        order: 2
    });
    class StopTracing extends actions_1.Action2 {
        static { this.ID = 'workbench.action.stopTracing'; }
        constructor() {
            super({
                id: StopTracing.ID,
                title: { value: (0, nls_1.localize)('stopTracing', "Stop Tracing"), original: 'Stop Tracing' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const issueService = accessor.get(issue_2.IIssueMainService);
            const environmentService = accessor.get(environment_1.INativeEnvironmentService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const nativeHostService = accessor.get(native_1.INativeHostService);
            const progressService = accessor.get(progress_1.IProgressService);
            if (!environmentService.args.trace) {
                const { confirmed } = await dialogService.confirm({
                    message: (0, nls_1.localize)('stopTracing.message', "Tracing requires to launch with a '--trace' argument"),
                    primaryButton: (0, nls_1.localize)({ key: 'stopTracing.button', comment: ['&& denotes a mnemonic'] }, "&&Relaunch and Enable Tracing"),
                });
                if (confirmed) {
                    return nativeHostService.relaunch({ addArgs: ['--trace'] });
                }
            }
            await progressService.withProgress({
                location: 20 /* ProgressLocation.Dialog */,
                title: (0, nls_1.localize)('stopTracing.title', "Creating trace file..."),
                cancellable: false,
                detail: (0, nls_1.localize)('stopTracing.detail', "This can take up to one minute to complete.")
            }, () => issueService.stopTracing());
        }
    }
    (0, actions_1.registerAction2)(StopTracing);
    commands_1.CommandsRegistry.registerCommand('_issues.getSystemStatus', (accessor) => {
        return accessor.get(issue_2.IIssueMainService).getSystemStatus();
    });
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWUuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvaXNzdWUvZWxlY3Ryb24tc2FuZGJveC9pc3N1ZS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFtQmhHLDRCQUE0QjtJQUU1QixJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLDBDQUFxQjtRQUUxRCxZQUNrQixjQUErQjtZQUVoRCxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFdEIsSUFBSSxjQUFjLENBQUMsY0FBYyxFQUFFO2dCQUNsQyxJQUFBLHlCQUFlLEVBQUMseUNBQXlDLENBQUMsQ0FBQzthQUMzRDtRQUNGLENBQUM7S0FDRCxDQUFBO0lBWEssdUJBQXVCO1FBRzFCLFdBQUEsZ0NBQWUsQ0FBQTtPQUhaLHVCQUF1QixDQVc1QjtJQUNELG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLHVCQUF1QixrQ0FBMEIsQ0FBQztJQUVuSixNQUFNLHlDQUEwQyxTQUFRLGlCQUFPO2lCQUU5QyxPQUFFLEdBQUcsc0RBQXNELENBQUM7UUFFNUU7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLHlDQUF5QyxDQUFDLEVBQUU7Z0JBQ2hELEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxFQUFFLEdBQUcsRUFBRSx3QkFBd0IsRUFBRSxPQUFPLEVBQUUsQ0FBQyxvQ0FBb0MsQ0FBQyxFQUFFLEVBQUUsNkJBQTZCLENBQUMsRUFBRSxRQUFRLEVBQUUsMEJBQTBCLEVBQUU7Z0JBQ25MLFFBQVEsRUFBRSxtQ0FBVSxDQUFDLElBQUk7Z0JBQ3pCLEVBQUUsRUFBRSxJQUFJO2FBQ1IsQ0FBQyxDQUFDO1FBQ0os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