/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/instantiation"], function (require, exports, nls_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IWorkspaceTrustRequestService = exports.WorkspaceTrustUriResponse = exports.IWorkspaceTrustManagementService = exports.IWorkspaceTrustEnablementService = exports.workspaceTrustToString = exports.WorkspaceTrustScope = void 0;
    var WorkspaceTrustScope;
    (function (WorkspaceTrustScope) {
        WorkspaceTrustScope[WorkspaceTrustScope["Local"] = 0] = "Local";
        WorkspaceTrustScope[WorkspaceTrustScope["Remote"] = 1] = "Remote";
    })(WorkspaceTrustScope || (exports.WorkspaceTrustScope = WorkspaceTrustScope = {}));
    function workspaceTrustToString(trustState) {
        if (trustState) {
            return (0, nls_1.localize)('trusted', "Trusted");
        }
        else {
            return (0, nls_1.localize)('untrusted', "Restricted Mode");
        }
    }
    exports.workspaceTrustToString = workspaceTrustToString;
    exports.IWorkspaceTrustEnablementService = (0, instantiation_1.createDecorator)('workspaceTrustEnablementService');
    exports.IWorkspaceTrustManagementService = (0, instantiation_1.createDecorator)('workspaceTrustManagementService');
    var WorkspaceTrustUriResponse;
    (function (WorkspaceTrustUriResponse) {
        WorkspaceTrustUriResponse[WorkspaceTrustUriResponse["Open"] = 1] = "Open";
        WorkspaceTrustUriResponse[WorkspaceTrustUriResponse["OpenInNewWindow"] = 2] = "OpenInNewWindow";
        WorkspaceTrustUriResponse[WorkspaceTrustUriResponse["Cancel"] = 3] = "Cancel";
    })(WorkspaceTrustUriResponse || (exports.WorkspaceTrustUriResponse = WorkspaceTrustUriResponse = {}));
    exports.IWorkspaceTrustRequestService = (0, instantiation_1.createDecorator)('workspaceTrustRequestService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlVHJ1c3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS93b3Jrc3BhY2UvY29tbW9uL3dvcmtzcGFjZVRydXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRyxJQUFZLG1CQUdYO0lBSEQsV0FBWSxtQkFBbUI7UUFDOUIsK0RBQVMsQ0FBQTtRQUNULGlFQUFVLENBQUE7SUFDWCxDQUFDLEVBSFcsbUJBQW1CLG1DQUFuQixtQkFBbUIsUUFHOUI7SUFFRCxTQUFnQixzQkFBc0IsQ0FBQyxVQUFtQjtRQUN6RCxJQUFJLFVBQVUsRUFBRTtZQUNmLE9BQU8sSUFBQSxjQUFRLEVBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQ3RDO2FBQU07WUFDTixPQUFPLElBQUEsY0FBUSxFQUFDLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1NBQ2hEO0lBQ0YsQ0FBQztJQU5ELHdEQU1DO0lBWVksUUFBQSxnQ0FBZ0MsR0FBRyxJQUFBLCtCQUFlLEVBQW1DLGlDQUFpQyxDQUFDLENBQUM7SUFReEgsUUFBQSxnQ0FBZ0MsR0FBRyxJQUFBLCtCQUFlLEVBQW1DLGlDQUFpQyxDQUFDLENBQUM7SUE4QnJJLElBQWtCLHlCQUlqQjtJQUpELFdBQWtCLHlCQUF5QjtRQUMxQyx5RUFBUSxDQUFBO1FBQ1IsK0ZBQW1CLENBQUE7UUFDbkIsNkVBQVUsQ0FBQTtJQUNYLENBQUMsRUFKaUIseUJBQXlCLHlDQUF6Qix5QkFBeUIsUUFJMUM7SUFFWSxRQUFBLDZCQUE2QixHQUFHLElBQUEsK0JBQWUsRUFBZ0MsOEJBQThCLENBQUMsQ0FBQyJ9