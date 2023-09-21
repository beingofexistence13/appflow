/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeEditor/browser/accessibility/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration", "vs/base/browser/ui/aria/aria", "vs/editor/common/standaloneStrings", "vs/css!./accessibility"], function (require, exports, nls, configuration_1, accessibility_1, actions_1, accessibilityConfiguration_1, aria_1, standaloneStrings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ToggleScreenReaderMode extends actions_1.$Wu {
        constructor() {
            super({
                id: 'editor.action.toggleScreenReaderAccessibilityMode',
                title: { value: nls.localize(0, null), original: 'Toggle Screen Reader Accessibility Mode' },
                f1: true,
                keybinding: [{
                        primary: 2048 /* KeyMod.CtrlCmd */ | 35 /* KeyCode.KeyE */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
                        when: accessibilityConfiguration_1.$iqb
                    },
                    {
                        primary: 512 /* KeyMod.Alt */ | 59 /* KeyCode.F1 */ | 1024 /* KeyMod.Shift */,
                        linux: { primary: 512 /* KeyMod.Alt */ | 62 /* KeyCode.F4 */ | 1024 /* KeyMod.Shift */ },
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
                    }]
            });
        }
        async run(accessor) {
            const accessibiiltyService = accessor.get(accessibility_1.$1r);
            const configurationService = accessor.get(configuration_1.$8h);
            const isScreenReaderOptimized = accessibiiltyService.isScreenReaderOptimized();
            configurationService.updateValue('editor.accessibilitySupport', isScreenReaderOptimized ? 'off' : 'on', 2 /* ConfigurationTarget.USER */);
            (0, aria_1.$$P)(isScreenReaderOptimized ? standaloneStrings_1.AccessibilityHelpNLS.screenReaderModeDisabled : standaloneStrings_1.AccessibilityHelpNLS.screenReaderModeEnabled);
        }
    }
    (0, actions_1.$Xu)(ToggleScreenReaderMode);
});
//# sourceMappingURL=accessibility.js.map