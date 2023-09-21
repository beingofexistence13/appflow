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
define(["require", "exports", "vs/nls!vs/workbench/contrib/issue/browser/issue.contribution", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/extensions", "vs/platform/product/common/productService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/issue/browser/issueService", "vs/workbench/services/issue/common/issue", "vs/workbench/contrib/issue/common/issue.contribution"], function (require, exports, nls, commands_1, extensions_1, productService_1, platform_1, contributions_1, issueService_1, issue_1, issue_contribution_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let WebIssueContribution = class WebIssueContribution extends issue_contribution_1.$e5b {
        constructor(productService) {
            super(productService);
        }
    };
    WebIssueContribution = __decorate([
        __param(0, productService_1.$kj)
    ], WebIssueContribution);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(WebIssueContribution, 3 /* LifecyclePhase.Restored */);
    (0, extensions_1.$mr)(issue_1.$rtb, issueService_1.$d5b, 1 /* InstantiationType.Delayed */);
    commands_1.$Gr.registerCommand('_issues.getSystemStatus', (accessor) => {
        return nls.localize(0, null);
    });
});
//# sourceMappingURL=issue.contribution.js.map