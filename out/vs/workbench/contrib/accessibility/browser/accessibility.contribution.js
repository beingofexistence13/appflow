/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/accessibility/browser/unfocusedViewDimmingContribution", "vs/workbench/contrib/accessibility/browser/accessibilityContributions", "vs/workbench/contrib/accessibility/browser/accessibilityStatus"], function (require, exports, extensions_1, accessibilityConfiguration_1, contributions_1, platform_1, accessibleView_1, unfocusedViewDimmingContribution_1, accessibilityContributions_1, accessibilityStatus_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, accessibilityConfiguration_1.registerAccessibilityConfiguration)();
    (0, extensions_1.registerSingleton)(accessibleView_1.IAccessibleViewService, accessibleView_1.AccessibleViewService, 1 /* InstantiationType.Delayed */);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(accessibilityContributions_1.EditorAccessibilityHelpContribution, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(unfocusedViewDimmingContribution_1.UnfocusedViewDimmingContribution, 3 /* LifecyclePhase.Restored */);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(accessibilityContributions_1.HoverAccessibleViewContribution, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(accessibilityContributions_1.NotificationAccessibleViewContribution, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(accessibilityContributions_1.InlineCompletionsAccessibleViewContribution, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(accessibilityStatus_1.AccessibilityStatus, 2 /* LifecyclePhase.Ready */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzaWJpbGl0eS5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9hY2Nlc3NpYmlsaXR5L2Jyb3dzZXIvYWNjZXNzaWJpbGl0eS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFZaEcsSUFBQSwrREFBa0MsR0FBRSxDQUFDO0lBQ3JDLElBQUEsOEJBQWlCLEVBQUMsdUNBQXNCLEVBQUUsc0NBQXFCLG9DQUE0QixDQUFDO0lBRTVGLE1BQU0saUJBQWlCLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3RHLGlCQUFpQixDQUFDLDZCQUE2QixDQUFDLGdFQUFtQyxvQ0FBNEIsQ0FBQztJQUNoSCxpQkFBaUIsQ0FBQyw2QkFBNkIsQ0FBQyxtRUFBZ0Msa0NBQTBCLENBQUM7SUFFM0csTUFBTSw4QkFBOEIsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbkgsOEJBQThCLENBQUMsNkJBQTZCLENBQUMsNERBQStCLG9DQUE0QixDQUFDO0lBQ3pILDhCQUE4QixDQUFDLDZCQUE2QixDQUFDLG1FQUFzQyxvQ0FBNEIsQ0FBQztJQUNoSSw4QkFBOEIsQ0FBQyw2QkFBNkIsQ0FBQyx3RUFBMkMsb0NBQTRCLENBQUM7SUFDckksOEJBQThCLENBQUMsNkJBQTZCLENBQUMseUNBQW1CLCtCQUF1QixDQUFDIn0=