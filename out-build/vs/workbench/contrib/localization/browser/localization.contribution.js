/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/localization/common/localization.contribution", "vs/platform/registry/common/platform", "vs/workbench/common/contributions"], function (require, exports, localization_contribution_1, platform_1, contributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$V4b = void 0;
    class $V4b extends localization_contribution_1.$U4b {
    }
    exports.$V4b = $V4b;
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution($V4b, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=localization.contribution.js.map