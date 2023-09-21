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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/issue/common/issue"], function (require, exports, lifecycle_1, uri_1, extHost_protocol_1, extHostCustomers_1, issue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadIssueReporter = void 0;
    let MainThreadIssueReporter = class MainThreadIssueReporter extends lifecycle_1.Disposable {
        constructor(context, _issueService) {
            super();
            this._issueService = _issueService;
            this._registrations = this._register(new lifecycle_1.DisposableMap());
            this._proxy = context.getProxy(extHost_protocol_1.ExtHostContext.ExtHostIssueReporter);
        }
        $registerIssueUriRequestHandler(extensionId) {
            const handler = {
                provideIssueUrl: async (token) => {
                    const parts = await this._proxy.$getIssueReporterUri(extensionId, token);
                    return uri_1.URI.from(parts);
                }
            };
            this._registrations.set(extensionId, this._issueService.registerIssueUriRequestHandler(extensionId, handler));
        }
        $unregisterIssueUriRequestHandler(extensionId) {
            this._registrations.deleteAndDispose(extensionId);
        }
    };
    exports.MainThreadIssueReporter = MainThreadIssueReporter;
    exports.MainThreadIssueReporter = MainThreadIssueReporter = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadIssueReporter),
        __param(1, issue_1.IWorkbenchIssueService)
    ], MainThreadIssueReporter);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZElzc3VlUmVwb3J0ZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZElzc3VlUmVwb3J0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBVXpGLElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXdCLFNBQVEsc0JBQVU7UUFJdEQsWUFDQyxPQUF3QixFQUNBLGFBQXNEO1lBRTlFLEtBQUssRUFBRSxDQUFDO1lBRmlDLGtCQUFhLEdBQWIsYUFBYSxDQUF3QjtZQUo5RCxtQkFBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx5QkFBYSxFQUFVLENBQUMsQ0FBQztZQU83RSxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsaUNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFFRCwrQkFBK0IsQ0FBQyxXQUFtQjtZQUNsRCxNQUFNLE9BQU8sR0FBNEI7Z0JBQ3hDLGVBQWUsRUFBRSxLQUFLLEVBQUUsS0FBd0IsRUFBRSxFQUFFO29CQUNuRCxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUN6RSxPQUFPLFNBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3hCLENBQUM7YUFDRCxDQUFDO1lBQ0YsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsOEJBQThCLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDL0csQ0FBQztRQUVELGlDQUFpQyxDQUFDLFdBQW1CO1lBQ3BELElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkQsQ0FBQztLQUNELENBQUE7SUF6QlksMERBQXVCO3NDQUF2Qix1QkFBdUI7UUFEbkMsSUFBQSx1Q0FBb0IsRUFBQyw4QkFBVyxDQUFDLHVCQUF1QixDQUFDO1FBT3ZELFdBQUEsOEJBQXNCLENBQUE7T0FOWix1QkFBdUIsQ0F5Qm5DIn0=