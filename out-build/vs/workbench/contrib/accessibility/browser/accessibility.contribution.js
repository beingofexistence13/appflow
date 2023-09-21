/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/workbench/contrib/accessibility/browser/accessibleView", "vs/workbench/contrib/accessibility/browser/unfocusedViewDimmingContribution", "vs/workbench/contrib/accessibility/browser/accessibilityContributions", "vs/workbench/contrib/accessibility/browser/accessibilityStatus"], function (require, exports, extensions_1, accessibilityConfiguration_1, contributions_1, platform_1, accessibleView_1, unfocusedViewDimmingContribution_1, accessibilityContributions_1, accessibilityStatus_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, accessibilityConfiguration_1.$pqb)();
    (0, extensions_1.$mr)(accessibleView_1.$wqb, accessibleView_1.$yqb, 1 /* InstantiationType.Delayed */);
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(accessibilityContributions_1.$cJb, 4 /* LifecyclePhase.Eventually */);
    workbenchRegistry.registerWorkbenchContribution(unfocusedViewDimmingContribution_1.$S1b, 3 /* LifecyclePhase.Restored */);
    const workbenchContributionsRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(accessibilityContributions_1.$dJb, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(accessibilityContributions_1.$eJb, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(accessibilityContributions_1.$gJb, 4 /* LifecyclePhase.Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(accessibilityStatus_1.$T1b, 2 /* LifecyclePhase.Ready */);
});
//# sourceMappingURL=accessibility.contribution.js.map