/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/tags/electron-sandbox/workspaceTags"], function (require, exports, platform_1, contributions_1, workspaceTags_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register Workspace Tags Contribution
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(workspaceTags_1.$Gac, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=tags.contribution.js.map