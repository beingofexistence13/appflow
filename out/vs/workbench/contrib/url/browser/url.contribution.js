/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/quickinput/common/quickInput", "vs/platform/registry/common/platform", "vs/platform/url/common/url", "vs/workbench/common/contributions", "vs/workbench/contrib/url/browser/externalUriResolver", "vs/workbench/contrib/url/browser/trustedDomains", "vs/workbench/contrib/url/browser/trustedDomainsFileSystemProvider", "vs/workbench/contrib/url/browser/trustedDomainsValidator", "vs/platform/action/common/actionCommonCategories", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/configuration"], function (require, exports, uri_1, nls_1, actions_1, commands_1, quickInput_1, platform_1, url_1, contributions_1, externalUriResolver_1, trustedDomains_1, trustedDomainsFileSystemProvider_1, trustedDomainsValidator_1, actionCommonCategories_1, configurationRegistry_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OpenUrlAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.url.openUrl',
                title: { value: (0, nls_1.localize)('openUrl', "Open URL"), original: 'Open URL' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const urlService = accessor.get(url_1.IURLService);
            return quickInputService.input({ prompt: (0, nls_1.localize)('urlToOpen', "URL to open") }).then(input => {
                if (input) {
                    const uri = uri_1.URI.parse(input);
                    urlService.open(uri, { originalUrl: input });
                }
            });
        }
    }
    (0, actions_1.registerAction2)(OpenUrlAction);
    /**
     * Trusted Domains Contribution
     */
    commands_1.CommandsRegistry.registerCommand(trustedDomains_1.manageTrustedDomainSettingsCommand);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: trustedDomains_1.manageTrustedDomainSettingsCommand.id,
            title: {
                value: trustedDomains_1.manageTrustedDomainSettingsCommand.description.description,
                original: 'Manage Trusted Domains'
            }
        }
    });
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(trustedDomainsValidator_1.OpenerValidatorContributions, 3 /* LifecyclePhase.Restored */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(trustedDomainsFileSystemProvider_1.TrustedDomainsFileSystemProvider, 2 /* LifecyclePhase.Ready */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(externalUriResolver_1.ExternalUriResolverContribution, 2 /* LifecyclePhase.Ready */);
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        ...configuration_1.workbenchConfigurationNodeBase,
        properties: {
            'workbench.trustedDomains.promptInTrustedWorkspace': {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                type: 'boolean',
                default: false,
                description: (0, nls_1.localize)('workbench.trustedDomains.promptInTrustedWorkspace', "When enabled, trusted domain prompts will appear when opening links in trusted workspaces.")
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3VybC9icm93c2VyL3VybC5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFvQmhHLE1BQU0sYUFBYyxTQUFRLGlCQUFPO1FBRWxDO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSw4QkFBOEI7Z0JBQ2xDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRTtnQkFDdkUsUUFBUSxFQUFFLG1DQUFVLENBQUMsU0FBUztnQkFDOUIsRUFBRSxFQUFFLElBQUk7YUFDUixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUNuQyxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQztZQUMzRCxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGlCQUFXLENBQUMsQ0FBQztZQUU3QyxPQUFPLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFBLGNBQVEsRUFBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDN0YsSUFBSSxLQUFLLEVBQUU7b0JBQ1YsTUFBTSxHQUFHLEdBQUcsU0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDN0IsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztpQkFDN0M7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQUVELElBQUEseUJBQWUsRUFBQyxhQUFhLENBQUMsQ0FBQztJQUUvQjs7T0FFRztJQUVILDJCQUFnQixDQUFDLGVBQWUsQ0FBQyxtREFBa0MsQ0FBQyxDQUFDO0lBQ3JFLHNCQUFZLENBQUMsY0FBYyxDQUFDLGdCQUFNLENBQUMsY0FBYyxFQUFFO1FBQ2xELE9BQU8sRUFBRTtZQUNSLEVBQUUsRUFBRSxtREFBa0MsQ0FBQyxFQUFFO1lBQ3pDLEtBQUssRUFBRTtnQkFDTixLQUFLLEVBQUUsbURBQWtDLENBQUMsV0FBVyxDQUFDLFdBQVc7Z0JBQ2pFLFFBQVEsRUFBRSx3QkFBd0I7YUFDbEM7U0FDRDtLQUNELENBQUMsQ0FBQztJQUVILG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyw2QkFBNkIsQ0FDeEcsc0RBQTRCLGtDQUU1QixDQUFDO0lBQ0YsbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLDZCQUE2QixDQUN4RyxtRUFBZ0MsK0JBRWhDLENBQUM7SUFDRixtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQ3hHLHFEQUErQiwrQkFFL0IsQ0FBQztJQUdGLE1BQU0scUJBQXFCLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLGtDQUF1QixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3pHLHFCQUFxQixDQUFDLHFCQUFxQixDQUFDO1FBQzNDLEdBQUcsOENBQThCO1FBQ2pDLFVBQVUsRUFBRTtZQUNYLG1EQUFtRCxFQUFFO2dCQUNwRCxLQUFLLHdDQUFnQztnQkFDckMsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLG1EQUFtRCxFQUFFLDRGQUE0RixDQUFDO2FBQ3hLO1NBQ0Q7S0FDRCxDQUFDLENBQUMifQ==