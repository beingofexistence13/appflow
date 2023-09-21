/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/url/browser/url.contribution", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/quickinput/common/quickInput", "vs/platform/registry/common/platform", "vs/platform/url/common/url", "vs/workbench/common/contributions", "vs/workbench/contrib/url/browser/externalUriResolver", "vs/workbench/contrib/url/browser/trustedDomains", "vs/workbench/contrib/url/browser/trustedDomainsFileSystemProvider", "vs/workbench/contrib/url/browser/trustedDomainsValidator", "vs/platform/action/common/actionCommonCategories", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/configuration"], function (require, exports, uri_1, nls_1, actions_1, commands_1, quickInput_1, platform_1, url_1, contributions_1, externalUriResolver_1, trustedDomains_1, trustedDomainsFileSystemProvider_1, trustedDomainsValidator_1, actionCommonCategories_1, configurationRegistry_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OpenUrlAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.url.openUrl',
                title: { value: (0, nls_1.localize)(0, null), original: 'Open URL' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const urlService = accessor.get(url_1.$IT);
            return quickInputService.input({ prompt: (0, nls_1.localize)(1, null) }).then(input => {
                if (input) {
                    const uri = uri_1.URI.parse(input);
                    urlService.open(uri, { originalUrl: input });
                }
            });
        }
    }
    (0, actions_1.$Xu)(OpenUrlAction);
    /**
     * Trusted Domains Contribution
     */
    commands_1.$Gr.registerCommand(trustedDomains_1.$vTb);
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
        command: {
            id: trustedDomains_1.$vTb.id,
            title: {
                value: trustedDomains_1.$vTb.description.description,
                original: 'Manage Trusted Domains'
            }
        }
    });
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(trustedDomainsValidator_1.$DTb, 3 /* LifecyclePhase.Restored */);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(trustedDomainsFileSystemProvider_1.$CTb, 2 /* LifecyclePhase.Ready */);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(externalUriResolver_1.$sTb, 2 /* LifecyclePhase.Ready */);
    const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
    configurationRegistry.registerConfiguration({
        ...configuration_1.$$y,
        properties: {
            'workbench.trustedDomains.promptInTrustedWorkspace': {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                type: 'boolean',
                default: false,
                description: (0, nls_1.localize)(2, null)
            }
        }
    });
});
//# sourceMappingURL=url.contribution.js.map