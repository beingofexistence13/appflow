/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/workbench/common/configuration", "vs/workbench/common/contributions", "vs/workbench/contrib/sash/browser/sash", "vs/base/common/platform"], function (require, exports, nls_1, configurationRegistry_1, platform_1, configuration_1, contributions_1, sash_1, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Sash size contribution
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(sash_1.SashSettingsController, 3 /* LifecyclePhase.Restored */);
    // Sash size configuration contribution
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration({
        ...configuration_1.workbenchConfigurationNodeBase,
        properties: {
            'workbench.sash.size': {
                type: 'number',
                default: platform_2.isIOS ? 20 : 4,
                minimum: 1,
                maximum: 20,
                description: (0, nls_1.localize)('sashSize', "Controls the feedback area size in pixels of the dragging area in between views/editors. Set it to a larger value if you feel it's hard to resize views using the mouse.")
            },
            'workbench.sash.hoverDelay': {
                type: 'number',
                default: 300,
                minimum: 0,
                maximum: 2000,
                description: (0, nls_1.localize)('sashHoverDelay', "Controls the hover feedback delay in milliseconds of the dragging area in between views/editors.")
            },
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FzaC5jb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9zYXNoL2Jyb3dzZXIvc2FzaC5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFXaEcseUJBQXlCO0lBQ3pCLG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBbUIsQ0FBQyxTQUFTLENBQUM7U0FDekUsNkJBQTZCLENBQUMsNkJBQXNCLGtDQUEwQixDQUFDO0lBRWpGLHVDQUF1QztJQUN2QyxtQkFBUSxDQUFDLEVBQUUsQ0FBeUIsa0NBQXVCLENBQUMsYUFBYSxDQUFDO1NBQ3hFLHFCQUFxQixDQUFDO1FBQ3RCLEdBQUcsOENBQThCO1FBQ2pDLFVBQVUsRUFBRTtZQUNYLHFCQUFxQixFQUFFO2dCQUN0QixJQUFJLEVBQUUsUUFBUTtnQkFDZCxPQUFPLEVBQUUsZ0JBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixPQUFPLEVBQUUsQ0FBQztnQkFDVixPQUFPLEVBQUUsRUFBRTtnQkFDWCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsVUFBVSxFQUFFLDBLQUEwSyxDQUFDO2FBQzdNO1lBQ0QsMkJBQTJCLEVBQUU7Z0JBQzVCLElBQUksRUFBRSxRQUFRO2dCQUNkLE9BQU8sRUFBRSxHQUFHO2dCQUNaLE9BQU8sRUFBRSxDQUFDO2dCQUNWLE9BQU8sRUFBRSxJQUFJO2dCQUNiLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxnQkFBZ0IsRUFBRSxrR0FBa0csQ0FBQzthQUMzSTtTQUNEO0tBQ0QsQ0FBQyxDQUFDIn0=