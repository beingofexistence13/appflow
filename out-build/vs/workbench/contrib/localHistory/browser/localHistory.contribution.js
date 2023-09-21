/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/localHistory/browser/localHistoryTimeline", "vs/workbench/contrib/localHistory/browser/localHistoryCommands"], function (require, exports, platform_1, contributions_1, localHistoryTimeline_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register Local History Timeline
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(localHistoryTimeline_1.$G1b, 2 /* LifecyclePhase.Ready */);
});
//# sourceMappingURL=localHistory.contribution.js.map