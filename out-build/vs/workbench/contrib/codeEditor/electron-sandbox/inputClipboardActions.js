/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/platform"], function (require, exports, keybindingsRegistry_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    if (platform.$j) {
        // On the mac, cmd+x, cmd+c and cmd+v do not result in cut / copy / paste
        // We therefore add a basic keybinding rule that invokes document.execCommand
        // This is to cover <input>s...
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: 'execCut',
            primary: 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */,
            handler: bindExecuteCommand('cut'),
            weight: 0,
            when: undefined,
        });
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: 'execCopy',
            primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
            handler: bindExecuteCommand('copy'),
            weight: 0,
            when: undefined,
        });
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: 'execPaste',
            primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */,
            handler: bindExecuteCommand('paste'),
            weight: 0,
            when: undefined,
        });
        function bindExecuteCommand(command) {
            return () => {
                document.execCommand(command);
            };
        }
    }
});
//# sourceMappingURL=inputClipboardActions.js.map