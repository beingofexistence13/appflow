/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/base/browser/ui/aria/aria", "vs/editor/common/standaloneStrings", "vs/css!./accessibility"], function (require, exports, nls, configuration_1, accessibility_1, actions_1, accessibilityConfiguration_1, aria_1, standaloneStrings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ToggleScreenReaderMode extends actions_1.Action2 {
        constructor() {
            super({
                id: 'editor.action.toggleScreenReaderAccessibilityMode',
                title: { value: nls.localize('toggleScreenReaderMode', "Toggle Screen Reader Accessibility Mode"), original: 'Toggle Screen Reader Accessibility Mode' },
                f1: true,
                keybinding: [{
                        primary: 2048 /* KeyMod.CtrlCmd */ | 35 /* KeyCode.KeyE */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
                        when: accessibilityConfiguration_1.accessibilityHelpIsShown
                    },
                    {
                        primary: 512 /* KeyMod.Alt */ | 59 /* KeyCode.F1 */ | 1024 /* KeyMod.Shift */,
                        linux: { primary: 512 /* KeyMod.Alt */ | 62 /* KeyCode.F4 */ | 1024 /* KeyMod.Shift */ },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
                    }]
            });
        }
        async run(accessor) {
            const accessibiiltyService = accessor.get(accessibility_1.IAccessibilityService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const isScreenReaderOptimized = accessibiiltyService.isScreenReaderOptimized();
            configurationService.updateValue('editor.accessibilitySupport', isScreenReaderOptimized ? 'off' : 'on', 2 /* ConfigurationTarget.USER */);
            (0, aria_1.alert)(isScreenReaderOptimized ? standaloneStrings_1.AccessibilityHelpNLS.screenReaderModeDisabled : standaloneStrings_1.AccessibilityHelpNLS.screenReaderModeEnabled);
        }
    }
    (0, actions_1.registerAction2)(ToggleScreenReaderMode);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjZXNzaWJpbGl0eS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvZGVFZGl0b3IvYnJvd3Nlci9hY2Nlc3NpYmlsaXR5L2FjY2Vzc2liaWxpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFjaEcsTUFBTSxzQkFBdUIsU0FBUSxpQkFBTztRQUUzQztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsbURBQW1EO2dCQUN2RCxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSx5Q0FBeUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSx5Q0FBeUMsRUFBRTtnQkFDeEosRUFBRSxFQUFFLElBQUk7Z0JBQ1IsVUFBVSxFQUFFLENBQUM7d0JBQ1osT0FBTyxFQUFFLGlEQUE2Qjt3QkFDdEMsTUFBTSxFQUFFLDhDQUFvQyxFQUFFO3dCQUM5QyxJQUFJLEVBQUUscURBQXdCO3FCQUM5QjtvQkFDRDt3QkFDQyxPQUFPLEVBQUUsMENBQXVCLDBCQUFlO3dCQUMvQyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsMENBQXVCLDBCQUFlLEVBQUU7d0JBQzFELE1BQU0sRUFBRSw4Q0FBb0MsRUFBRTtxQkFDOUMsQ0FBQzthQUNGLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQ25DLE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUIsQ0FBQyxDQUFDO1lBQ2pFLE1BQU0sdUJBQXVCLEdBQUcsb0JBQW9CLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUMvRSxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsNkJBQTZCLEVBQUUsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxtQ0FBMkIsQ0FBQztZQUNsSSxJQUFBLFlBQUssRUFBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsd0NBQW9CLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLHdDQUFvQixDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDL0gsQ0FBQztLQUNEO0lBRUQsSUFBQSx5QkFBZSxFQUFDLHNCQUFzQixDQUFDLENBQUMifQ==