/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/performance/browser/startupTimings"], function (require, exports, platform_1, contributions_1, startupTimings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // -- startup timings
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(startupTimings_1.$Y4b, 4 /* LifecyclePhase.Eventually */);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(startupTimings_1.$X4b, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=performance.web.contribution.js.map