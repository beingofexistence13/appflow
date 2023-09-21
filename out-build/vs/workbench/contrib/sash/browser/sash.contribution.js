/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/sash/browser/sash.contribution", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/workbench/common/configuration", "vs/workbench/common/contributions", "vs/workbench/contrib/sash/browser/sash", "vs/base/common/platform"], function (require, exports, nls_1, configurationRegistry_1, platform_1, configuration_1, contributions_1, sash_1, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Sash size contribution
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(sash_1.$tPb, 3 /* LifecyclePhase.Restored */);
    // Sash size configuration contribution
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration)
        .registerConfiguration({
        ...configuration_1.$$y,
        properties: {
            'workbench.sash.size': {
                type: 'number',
                default: platform_2.$q ? 20 : 4,
                minimum: 1,
                maximum: 20,
                description: (0, nls_1.localize)(0, null)
            },
            'workbench.sash.hoverDelay': {
                type: 'number',
                default: 300,
                minimum: 0,
                maximum: 2000,
                description: (0, nls_1.localize)(1, null)
            },
        }
    });
});
//# sourceMappingURL=sash.contribution.js.map