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
define(["require", "exports", "vs/nls!vs/workbench/contrib/issue/electron-sandbox/issue.contribution", "vs/platform/actions/common/actions", "vs/workbench/services/issue/common/issue", "vs/platform/commands/common/commands", "vs/workbench/contrib/issue/common/issue.contribution", "vs/platform/product/common/productService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/action/common/actionCommonCategories", "vs/platform/environment/common/environment", "vs/platform/dialogs/common/dialogs", "vs/platform/native/common/native", "vs/platform/progress/common/progress", "vs/platform/issue/common/issue"], function (require, exports, nls_1, actions_1, issue_1, commands_1, issue_contribution_1, productService_1, platform_1, contributions_1, actionCommonCategories_1, environment_1, dialogs_1, native_1, progress_1, issue_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Issue Contribution
    let NativeIssueContribution = class NativeIssueContribution extends issue_contribution_1.$e5b {
        constructor(productService) {
            super(productService);
            if (productService.reportIssueUrl) {
                (0, actions_1.$Xu)(ReportPerformanceIssueUsingReporterAction);
            }
        }
    };
    NativeIssueContribution = __decorate([
        __param(0, productService_1.$kj)
    ], NativeIssueContribution);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(NativeIssueContribution, 3 /* LifecyclePhase.Restored */);
    class ReportPerformanceIssueUsingReporterAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.reportPerformanceIssueUsingReporter'; }
        constructor() {
            super({
                id: ReportPerformanceIssueUsingReporterAction.ID,
                title: { value: (0, nls_1.localize)(0, null), original: 'Report Performance Issue' },
                category: actionCommonCategories_1.$Nl.Help,
                f1: true
            });
        }
        async run(accessor) {
            const issueService = accessor.get(issue_1.$rtb);
            return issueService.openReporter({ issueType: 1 /* IssueType.PerformanceIssue */ });
        }
    }
    //#endregion
    //#region Commands
    class OpenProcessExplorer extends actions_1.$Wu {
        static { this.ID = 'workbench.action.openProcessExplorer'; }
        constructor() {
            super({
                id: OpenProcessExplorer.ID,
                title: { value: (0, nls_1.localize)(1, null), original: 'Open Process Explorer' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const issueService = accessor.get(issue_1.$rtb);
            return issueService.openProcessExplorer();
        }
    }
    (0, actions_1.$Xu)(OpenProcessExplorer);
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarHelpMenu, {
        group: '5_tools',
        command: {
            id: OpenProcessExplorer.ID,
            title: (0, nls_1.localize)(2, null)
        },
        order: 2
    });
    class StopTracing extends actions_1.$Wu {
        static { this.ID = 'workbench.action.stopTracing'; }
        constructor() {
            super({
                id: StopTracing.ID,
                title: { value: (0, nls_1.localize)(3, null), original: 'Stop Tracing' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const issueService = accessor.get(issue_2.$qtb);
            const environmentService = accessor.get(environment_1.$Jh);
            const dialogService = accessor.get(dialogs_1.$oA);
            const nativeHostService = accessor.get(native_1.$05b);
            const progressService = accessor.get(progress_1.$2u);
            if (!environmentService.args.trace) {
                const { confirmed } = await dialogService.confirm({
                    message: (0, nls_1.localize)(4, null),
                    primaryButton: (0, nls_1.localize)(5, null),
                });
                if (confirmed) {
                    return nativeHostService.relaunch({ addArgs: ['--trace'] });
                }
            }
            await progressService.withProgress({
                location: 20 /* ProgressLocation.Dialog */,
                title: (0, nls_1.localize)(6, null),
                cancellable: false,
                detail: (0, nls_1.localize)(7, null)
            }, () => issueService.stopTracing());
        }
    }
    (0, actions_1.$Xu)(StopTracing);
    commands_1.$Gr.registerCommand('_issues.getSystemStatus', (accessor) => {
        return accessor.get(issue_2.$qtb).getSystemStatus();
    });
});
//#endregion
//# sourceMappingURL=issue.contribution.js.map