/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/types", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/quickinput/common/quickInput", "vs/base/common/themables", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/common/constants", "vs/workbench/contrib/testing/common/testProfileService"], function (require, exports, arrays_1, types_1, nls_1, commands_1, quickInput_1, themables_1, icons_1, constants_1, testProfileService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function buildPicker(accessor, { onlyGroup, showConfigureButtons = true, onlyForTest, onlyConfigurable, placeholder = (0, nls_1.localize)('testConfigurationUi.pick', 'Pick a test profile to use'), }) {
        const profileService = accessor.get(testProfileService_1.ITestProfileService);
        const items = [];
        const pushItems = (allProfiles, description) => {
            for (const profiles of (0, arrays_1.groupBy)(allProfiles, (a, b) => a.group - b.group)) {
                let addedHeader = false;
                if (onlyGroup) {
                    if (profiles[0].group !== onlyGroup) {
                        continue;
                    }
                    addedHeader = true; // showing one group, no need for label
                }
                for (const profile of profiles) {
                    if (onlyConfigurable && !profile.hasConfigurationHandler) {
                        continue;
                    }
                    if (!addedHeader) {
                        items.push({ type: 'separator', label: constants_1.testConfigurationGroupNames[profiles[0].group] });
                        addedHeader = true;
                    }
                    items.push(({
                        type: 'item',
                        profile,
                        label: profile.label,
                        description,
                        alwaysShow: true,
                        buttons: profile.hasConfigurationHandler && showConfigureButtons
                            ? [{
                                    iconClass: themables_1.ThemeIcon.asClassName(icons_1.testingUpdateProfiles),
                                    tooltip: (0, nls_1.localize)('updateTestConfiguration', 'Update Test Configuration')
                                }] : []
                    }));
                }
            }
        };
        if (onlyForTest !== undefined) {
            pushItems(profileService.getControllerProfiles(onlyForTest.controllerId).filter(p => (0, testProfileService_1.canUseProfileWithTest)(p, onlyForTest)));
        }
        else {
            for (const { profiles, controller } of profileService.all()) {
                pushItems(profiles, controller.label.value);
            }
        }
        const quickpick = accessor.get(quickInput_1.IQuickInputService).createQuickPick();
        quickpick.items = items;
        quickpick.placeholder = placeholder;
        return quickpick;
    }
    const triggerButtonHandler = (service, resolve) => (evt) => {
        const profile = evt.item.profile;
        if (profile) {
            service.configure(profile.controllerId, profile.profileId);
            resolve(undefined);
        }
    };
    commands_1.CommandsRegistry.registerCommand({
        id: 'vscode.pickMultipleTestProfiles',
        handler: async (accessor, options) => {
            const profileService = accessor.get(testProfileService_1.ITestProfileService);
            const quickpick = buildPicker(accessor, options);
            if (!quickpick) {
                return;
            }
            quickpick.canSelectMany = true;
            if (options.selected) {
                quickpick.selectedItems = quickpick.items
                    .filter((i) => i.type === 'item')
                    .filter(i => options.selected.some(s => s.controllerId === i.profile.controllerId && s.profileId === i.profile.profileId));
            }
            const pick = await new Promise(resolve => {
                quickpick.onDidAccept(() => {
                    const selected = quickpick.selectedItems;
                    resolve(selected.map(s => s.profile).filter(types_1.isDefined));
                });
                quickpick.onDidHide(() => resolve(undefined));
                quickpick.onDidTriggerItemButton(triggerButtonHandler(profileService, resolve));
                quickpick.show();
            });
            quickpick.dispose();
            return pick;
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'vscode.pickTestProfile',
        handler: async (accessor, options) => {
            const profileService = accessor.get(testProfileService_1.ITestProfileService);
            const quickpick = buildPicker(accessor, options);
            if (!quickpick) {
                return;
            }
            const pick = await new Promise(resolve => {
                quickpick.onDidAccept(() => resolve(quickpick.selectedItems[0]?.profile));
                quickpick.onDidHide(() => resolve(undefined));
                quickpick.onDidTriggerItemButton(triggerButtonHandler(profileService, resolve));
                quickpick.show();
            });
            quickpick.dispose();
            return pick;
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ0NvbmZpZ3VyYXRpb25VaS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlc3RpbmcvYnJvd3Nlci90ZXN0aW5nQ29uZmlndXJhdGlvblVpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBMkJoRyxTQUFTLFdBQVcsQ0FBQyxRQUEwQixFQUFFLEVBQ2hELFNBQVMsRUFDVCxvQkFBb0IsR0FBRyxJQUFJLEVBQzNCLFdBQVcsRUFDWCxnQkFBZ0IsRUFDaEIsV0FBVyxHQUFHLElBQUEsY0FBUSxFQUFDLDBCQUEwQixFQUFFLDRCQUE0QixDQUFDLEdBQ25EO1FBQzdCLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0NBQW1CLENBQUMsQ0FBQztRQUN6RCxNQUFNLEtBQUssR0FBb0UsRUFBRSxDQUFDO1FBQ2xGLE1BQU0sU0FBUyxHQUFHLENBQUMsV0FBOEIsRUFBRSxXQUFvQixFQUFFLEVBQUU7WUFDMUUsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFBLGdCQUFPLEVBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3pFLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztnQkFDeEIsSUFBSSxTQUFTLEVBQUU7b0JBQ2QsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTt3QkFDcEMsU0FBUztxQkFDVDtvQkFFRCxXQUFXLEdBQUcsSUFBSSxDQUFDLENBQUMsdUNBQXVDO2lCQUMzRDtnQkFFRCxLQUFLLE1BQU0sT0FBTyxJQUFJLFFBQVEsRUFBRTtvQkFDL0IsSUFBSSxnQkFBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRTt3QkFD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