/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/types", "vs/nls!vs/workbench/contrib/testing/browser/testingConfigurationUi", "vs/platform/commands/common/commands", "vs/platform/quickinput/common/quickInput", "vs/base/common/themables", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/common/constants", "vs/workbench/contrib/testing/common/testProfileService"], function (require, exports, arrays_1, types_1, nls_1, commands_1, quickInput_1, themables_1, icons_1, constants_1, testProfileService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function buildPicker(accessor, { onlyGroup, showConfigureButtons = true, onlyForTest, onlyConfigurable, placeholder = (0, nls_1.localize)(0, null), }) {
        const profileService = accessor.get(testProfileService_1.$9sb);
        const items = [];
        const pushItems = (allProfiles, description) => {
            for (const profiles of (0, arrays_1.$xb)(allProfiles, (a, b) => a.group - b.group)) {
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
                        items.push({ type: 'separator', label: constants_1.$Msb[profiles[0].group] });
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
                                    iconClass: themables_1.ThemeIcon.asClassName(icons_1.$$Jb),
                                    tooltip: (0, nls_1.localize)(1, null)
                                }] : []
                    }));
                }
            }
        };
        if (onlyForTest !== undefined) {
            pushItems(profileService.getControllerProfiles(onlyForTest.controllerId).filter(p => (0, testProfileService_1.$0sb)(p, onlyForTest)));
        }
        else {
            for (const { profiles, controller } of profileService.all()) {
                pushItems(profiles, controller.label.value);
            }
        }
        const quickpick = accessor.get(quickInput_1.$Gq).createQuickPick();
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
    commands_1.$Gr.registerCommand({
        id: 'vscode.pickMultipleTestProfiles',
        handler: async (accessor, options) => {
            const profileService = accessor.get(testProfileService_1.$9sb);
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
                    resolve(selected.map(s => s.profile).filter(types_1.$rf));
                });
                quickpick.onDidHide(() => resolve(undefined));
                quickpick.onDidTriggerItemButton(triggerButtonHandler(profileService, resolve));
                quickpick.show();
            });
            quickpick.dispose();
            return pick;
        }
    });
    commands_1.$Gr.registerCommand({
        id: 'vscode.pickTestProfile',
        handler: async (accessor, options) => {
            const profileService = accessor.get(testProfileService_1.$9sb);
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
//# sourceMappingURL=testingConfigurationUi.js.map