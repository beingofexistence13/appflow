/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/keybindings/browser/keybindings.contribution", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybinding", "vs/platform/action/common/actionCommonCategories", "vs/platform/commands/common/commands", "vs/workbench/services/log/common/logConstants"], function (require, exports, nls, actions_1, keybinding_1, actionCommonCategories_1, commands_1, logConstants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ToggleKeybindingsLogAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.toggleKeybindingsLog',
                title: { value: nls.localize(0, null), original: 'Toggle Keyboard Shortcuts Troubleshooting' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        run(accessor) {
            const logging = accessor.get(keybinding_1.$2D).toggleLogging();
            if (logging) {
                const commandService = accessor.get(commands_1.$Fr);
                commandService.executeCommand(logConstants_1.$nhb);
            }
        }
    }
    (0, actions_1.$Xu)(ToggleKeybindingsLogAction);
});
//# sourceMappingURL=keybindings.contribution.js.map