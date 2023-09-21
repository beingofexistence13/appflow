/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "./startupProfiler", "./startupTimings", "vs/workbench/contrib/performance/electron-sandbox/rendererAutoProfiler", "vs/platform/configuration/common/configurationRegistry", "vs/nls!vs/workbench/contrib/performance/electron-sandbox/performance.contribution", "vs/workbench/common/configuration"], function (require, exports, platform_1, contributions_1, startupProfiler_1, startupTimings_1, rendererAutoProfiler_1, configurationRegistry_1, nls_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // -- auto profiler
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(rendererAutoProfiler_1.$Rac, 4 /* LifecyclePhase.Eventually */);
    // -- startup profiler
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(startupProfiler_1.$Pac, 3 /* LifecyclePhase.Restored */);
    // -- startup timings
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(startupTimings_1.$Qac, 4 /* LifecyclePhase.Eventually */);
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        ...configuration_1.$0y,
        'properties': {
            'application.experimental.rendererProfiling': {
                type: 'boolean',
                default: false,
                tags: ['experimental'],
                markdownDescription: (0, nls_1.localize)(0, null)
            }
        }
    });
});
//# sourceMappingURL=performance.contribution.js.map