/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/userDataProfile/browser/userDataProfile", "vs/workbench/contrib/userDataProfile/browser/userDataProfilePreview", "./userDataProfileActions"], function (require, exports, platform_1, contributions_1, userDataProfile_1, userDataProfilePreview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(userDataProfile_1.$PZb, 2 /* LifecyclePhase.Ready */);
    workbenchRegistry.registerWorkbenchContribution(userDataProfilePreview_1.$RZb, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=userDataProfile.contribution.js.map