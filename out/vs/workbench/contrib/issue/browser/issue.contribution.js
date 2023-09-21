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
define(["require", "exports", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/extensions", "vs/platform/product/common/productService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/issue/browser/issueService", "vs/workbench/services/issue/common/issue", "vs/workbench/contrib/issue/common/issue.contribution"], function (require, exports, nls, commands_1, extensions_1, productService_1, platform_1, contributions_1, issueService_1, issue_1, issue_contribution_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let WebIssueContribution = class WebIssueContribution extends issue_contribution_1.BaseIssueContribution {
        constructor(productService) {
            super(productService);
        }
    };
    WebIssueContribution = __decorate([
        __param(0, productService_1.IProductService)
    ], WebIssueContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(WebIssueContribution, 3 /* LifecyclePhase.Restored */);
    (0, extensions_1.registerSingleton)(issue_1.IWorkbenchIssueService, issueService_1.WebIssueService, 1 /* InstantiationType.Delayed */);
    commands_1.CommandsRegistry.registerCommand('_issues.getSystemStatus', (accessor) => {
        return nls.localize('statusUnsupported', "The --status argument is not yet supported in browsers.");
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWUuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvaXNzdWUvYnJvd3Nlci9pc3N1ZS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFhaEcsSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBcUIsU0FBUSwwQ0FBcUI7UUFDdkQsWUFBNkIsY0FBK0I7WUFDM0QsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3ZCLENBQUM7S0FDRCxDQUFBO0lBSkssb0JBQW9CO1FBQ1osV0FBQSxnQ0FBZSxDQUFBO09BRHZCLG9CQUFvQixDQUl6QjtJQUVELG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLG9CQUFvQixrQ0FBMEIsQ0FBQztJQUVoSixJQUFBLDhCQUFpQixFQUFDLDhCQUFzQixFQUFFLDhCQUFlLG9DQUE0QixDQUFDO0lBRXRGLDJCQUFnQixDQUFDLGVBQWUsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFO1FBQ3hFLE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSx5REFBeUQsQ0FBQyxDQUFDO0lBQ3JHLENBQUMsQ0FBQyxDQUFDIn0=