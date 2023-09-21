/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform"], function (require, exports, platform_1, nls_1, configurationRegistry_1, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const configurationRegistry = platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'update',
        order: 15,
        title: (0, nls_1.localize)('updateConfigurationTitle', "Update"),
        type: 'object',
        properties: {
            'update.mode': {
                type: 'string',
                enum: ['none', 'manual', 'start', 'default'],
                default: 'default',
                scope: 1 /* ConfigurationScope.APPLICATION */,
                description: (0, nls_1.localize)('updateMode', "Configure whether you receive automatic updates. Requires a restart after change. The updates are fetched from a Microsoft online service."),
                tags: ['usesOnlineServices'],
                enumDescriptions: [
                    (0, nls_1.localize)('none', "Disable updates."),
                    (0, nls_1.localize)('manual', "Disable automatic background update checks. Updates will be available if you manually check for updates."),
                    (0, nls_1.localize)('start', "Check for updates only on startup. Disable automatic background update checks."),
                    (0, nls_1.localize)('default', "Enable automatic update checks. Code will check for updates automatically and periodically.")
                ],
                policy: {
                    name: 'UpdateMode',
                    minimumVersion: '1.67',
                }
            },
            'update.channel': {
                type: 'string',
                default: 'default',
                scope: 1 /* ConfigurationScope.APPLICATION */,
                description: (0, nls_1.localize)('updateMode', "Configure whether you receive automatic updates. Requires a restart after change. The updates are fetched from a Microsoft online service."),
                deprecationMessage: (0, nls_1.localize)('deprecated', "This setting is deprecated, please use '{0}' instead.", 'update.mode')
            },
            'update.enableWindowsBackgroundUpdates': {
                type: 'boolean',
                default: true,
                scope: 1 /* ConfigurationScope.APPLICATION */,
                title: (0, nls_1.localize)('enableWindowsBackgroundUpdatesTitle', "Enable Background Updates on Windows"),
                description: (0, nls_1.localize)('enableWindowsBackgroundUpdates', "Enable to download and install new VS Code versions in the background on Windows."),
                included: platform_1.isWindows && !platform_1.isWeb
            },
            'update.showReleaseNotes': {
                type: 'boolean',
                default: true,
                scope: 1 /* ConfigurationScope.APPLICATION */,
                description: (0, nls_1.localize)('showReleaseNotes', "Show Release Notes after an update. The Release Notes are fetched from a Microsoft online service."),
                tags: ['usesOnlineServices']
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLmNvbmZpZy5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91cGRhdGUvY29tbW9uL3VwZGF0ZS5jb25maWcuY29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBT2hHLE1BQU0scUJBQXFCLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLGtDQUF1QixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3pHLHFCQUFxQixDQUFDLHFCQUFxQixDQUFDO1FBQzNDLEVBQUUsRUFBRSxRQUFRO1FBQ1osS0FBSyxFQUFFLEVBQUU7UUFDVCxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsMEJBQTBCLEVBQUUsUUFBUSxDQUFDO1FBQ3JELElBQUksRUFBRSxRQUFRO1FBQ2QsVUFBVSxFQUFFO1lBQ1gsYUFBYSxFQUFFO2dCQUNkLElBQUksRUFBRSxRQUFRO2dCQUNkLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQztnQkFDNUMsT0FBTyxFQUFFLFNBQVM7Z0JBQ2xCLEtBQUssd0NBQWdDO2dCQUNyQyxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsWUFBWSxFQUFFLDRJQUE0SSxDQUFDO2dCQUNqTCxJQUFJLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztnQkFDNUIsZ0JBQWdCLEVBQUU7b0JBQ2pCLElBQUEsY0FBUSxFQUFDLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQztvQkFDcEMsSUFBQSxjQUFRLEVBQUMsUUFBUSxFQUFFLDBHQUEwRyxDQUFDO29CQUM5SCxJQUFBLGNBQVEsRUFBQyxPQUFPLEVBQUUsZ0ZBQWdGLENBQUM7b0JBQ25HLElBQUEsY0FBUSxFQUFDLFNBQVMsRUFBRSw2RkFBNkYsQ0FBQztpQkFDbEg7Z0JBQ0QsTUFBTSxFQUFFO29CQUNQLElBQUksRUFBRSxZQUFZO29CQUNsQixjQUFjLEVBQUUsTUFBTTtpQkFDdEI7YUFDRDtZQUNELGdCQUFnQixFQUFFO2dCQUNqQixJQUFJLEVBQUUsUUFBUTtnQkFDZCxPQUFPLEVBQUUsU0FBUztnQkFDbEIsS0FBSyx3Q0FBZ0M7Z0JBQ3JDLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsNElBQTRJLENBQUM7Z0JBQ2pMLGtCQUFrQixFQUFFLElBQUEsY0FBUSxFQUFDLFlBQVksRUFBRSx1REFBdUQsRUFBRSxhQUFhLENBQUM7YUFDbEg7WUFDRCx1Q0FBdUMsRUFBRTtnQkFDeEMsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsS0FBSyx3Q0FBZ0M7Z0JBQ3JDLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxxQ0FBcUMsRUFBRSxzQ0FBc0MsQ0FBQztnQkFDOUYsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLGdDQUFnQyxFQUFFLG1GQUFtRixDQUFDO2dCQUM1SSxRQUFRLEVBQUUsb0JBQVMsSUFBSSxDQUFDLGdCQUFLO2FBQzdCO1lBQ0QseUJBQXlCLEVBQUU7Z0JBQzFCLElBQUksRUFBRSxTQUFTO2dCQUNmLE9BQU8sRUFBRSxJQUFJO2dCQUNiLEtBQUssd0NBQWdDO2dCQUNyQyxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsa0JBQWtCLEVBQUUsb0dBQW9HLENBQUM7Z0JBQy9JLElBQUksRUFBRSxDQUFDLG9CQUFvQixDQUFDO2FBQzVCO1NBQ0Q7S0FDRCxDQUFDLENBQUMifQ==