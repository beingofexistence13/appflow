/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/contrib/terminal/browser/terminal"], function (require, exports, keybindingsRegistry_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2Vb = void 0;
    function $2Vb() {
        registerOpenTerminalAtIndexCommands();
    }
    exports.$2Vb = $2Vb;
    function registerOpenTerminalAtIndexCommands() {
        for (let i = 0; i < 9; i++) {
            const terminalIndex = i;
            const visibleIndex = i + 1;
            keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
                id: `workbench.action.terminal.focusAtIndex${visibleIndex}`,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: undefined,
                primary: 0,
                handler: accessor => {
                    accessor.get(terminal_1.$Oib).setActiveInstanceByIndex(terminalIndex);
                    return accessor.get(terminal_1.$Oib).showPanel(true);
                }
            });
        }
    }
});
//# sourceMappingURL=terminalCommands.js.map