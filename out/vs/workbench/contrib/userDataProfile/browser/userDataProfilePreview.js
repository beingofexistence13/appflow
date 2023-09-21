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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/log/common/log", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, errors_1, lifecycle_1, uri_1, log_1, environmentService_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataProfilePreviewContribution = void 0;
    let UserDataProfilePreviewContribution = class UserDataProfilePreviewContribution extends lifecycle_1.Disposable {
        constructor(environmentService, userDataProfileImportExportService, logService) {
            super();
            if (environmentService.options?.profileToPreview) {
                userDataProfileImportExportService.importProfile(uri_1.URI.revive(environmentService.options.profileToPreview), { mode: 'both' })
                    .then(null, error => logService.error('Error while previewing the profile', (0, errors_1.getErrorMessage)(error)));
            }
        }
    };
    exports.UserDataProfilePreviewContribution = UserDataProfilePreviewContribution;
    exports.UserDataProfilePreviewContribution = UserDataProfilePreviewContribution = __decorate([
        __param(0, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(1, userDataProfile_1.IUserDataProfileImportExportService),
        __param(2, log_1.ILogService)
    ], UserDataProfilePreviewContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlUHJldmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3VzZXJEYXRhUHJvZmlsZS9icm93c2VyL3VzZXJEYXRhUHJvZmlsZVByZXZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBVXpGLElBQU0sa0NBQWtDLEdBQXhDLE1BQU0sa0NBQW1DLFNBQVEsc0JBQVU7UUFFakUsWUFDc0Msa0JBQXVELEVBQ3ZELGtDQUF1RSxFQUMvRixVQUF1QjtZQUVwQyxLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksa0JBQWtCLENBQUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFO2dCQUNqRCxrQ0FBa0MsQ0FBQyxhQUFhLENBQUMsU0FBRyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQztxQkFDekgsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsb0NBQW9DLEVBQUUsSUFBQSx3QkFBZSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN0RztRQUNGLENBQUM7S0FFRCxDQUFBO0lBZFksZ0ZBQWtDO2lEQUFsQyxrQ0FBa0M7UUFHNUMsV0FBQSx3REFBbUMsQ0FBQTtRQUNuQyxXQUFBLHFEQUFtQyxDQUFBO1FBQ25DLFdBQUEsaUJBQVcsQ0FBQTtPQUxELGtDQUFrQyxDQWM5QyJ9