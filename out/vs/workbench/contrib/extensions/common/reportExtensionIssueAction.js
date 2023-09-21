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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/workbench/services/issue/common/issue"], function (require, exports, nls, actions_1, issue_1) {
    "use strict";
    var ReportExtensionIssueAction_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReportExtensionIssueAction = void 0;
    let ReportExtensionIssueAction = class ReportExtensionIssueAction extends actions_1.Action {
        static { ReportExtensionIssueAction_1 = this; }
        static { this._id = 'workbench.extensions.action.reportExtensionIssue'; }
        static { this._label = nls.localize('reportExtensionIssue', "Report Issue"); }
        // TODO: Consider passing in IExtensionStatus or IExtensionHostProfile for additional data
        constructor(extension, issueService) {
            super(ReportExtensionIssueAction_1._id, ReportExtensionIssueAction_1._label, 'extension-action report-issue');
            this.extension = extension;
            this.issueService = issueService;
            this.enabled = extension.isBuiltin || (!!extension.repository && !!extension.repository.url);
        }
        async run() {
            await this.issueService.openReporter({
                extensionId: this.extension.identifier.value,
            });
        }
    };
    exports.ReportExtensionIssueAction = ReportExtensionIssueAction;
    exports.ReportExtensionIssueAction = ReportExtensionIssueAction = ReportExtensionIssueAction_1 = __decorate([
        __param(1, issue_1.IWorkbenchIssueService)
    ], ReportExtensionIssueAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0RXh0ZW5zaW9uSXNzdWVBY3Rpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2NvbW1vbi9yZXBvcnRFeHRlbnNpb25Jc3N1ZUFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBT3pGLElBQU0sMEJBQTBCLEdBQWhDLE1BQU0sMEJBQTJCLFNBQVEsZ0JBQU07O2lCQUU3QixRQUFHLEdBQUcsa0RBQWtELEFBQXJELENBQXNEO2lCQUN6RCxXQUFNLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxjQUFjLENBQUMsQUFBdkQsQ0FBd0Q7UUFFdEYsMEZBQTBGO1FBQzFGLFlBQ1MsU0FBZ0MsRUFDQyxZQUFvQztZQUU3RSxLQUFLLENBQUMsNEJBQTBCLENBQUMsR0FBRyxFQUFFLDRCQUEwQixDQUFDLE1BQU0sRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO1lBSGxHLGNBQVMsR0FBVCxTQUFTLENBQXVCO1lBQ0MsaUJBQVksR0FBWixZQUFZLENBQXdCO1lBSTdFLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlGLENBQUM7UUFFUSxLQUFLLENBQUMsR0FBRztZQUNqQixNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDO2dCQUNwQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSzthQUM1QyxDQUFDLENBQUM7UUFDSixDQUFDOztJQW5CVyxnRUFBMEI7eUNBQTFCLDBCQUEwQjtRQVFwQyxXQUFBLDhCQUFzQixDQUFBO09BUlosMEJBQTBCLENBb0J0QyJ9