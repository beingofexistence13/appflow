/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/userDataProfile/browser/userDataProfile", "vs/workbench/contrib/userDataProfile/browser/userDataProfilePreview", "./userDataProfileActions"], function (require, exports, platform_1, contributions_1, userDataProfile_1, userDataProfilePreview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(userDataProfile_1.UserDataProfilesWorkbenchContribution, 2 /* LifecyclePhase.Ready */);
    workbenchRegistry.registerWorkbenchContribution(userDataProfilePreview_1.UserDataProfilePreviewContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3VzZXJEYXRhUHJvZmlsZS9icm93c2VyL3VzZXJEYXRhUHJvZmlsZS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFTaEcsTUFBTSxpQkFBaUIsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM3RixpQkFBaUIsQ0FBQyw2QkFBNkIsQ0FBQyx1REFBcUMsK0JBQXVCLENBQUM7SUFDN0csaUJBQWlCLENBQUMsNkJBQTZCLENBQUMsMkRBQWtDLGtDQUEwQixDQUFDIn0=