/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/remote/browser/remoteStartEntry"], function (require, exports, platform_1, contributions_1, remoteStartEntry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(remoteStartEntry_1.$i5b, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=remoteStartEntry.contribution.js.map