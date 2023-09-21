/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/contrib/terminal/common/terminal", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/terminal/browser/terminalProfileResolverService", "vs/workbench/contrib/terminal/common/terminalContextKey"], function (require, exports, keybindingsRegistry_1, terminal_1, extensions_1, terminalProfileResolverService_1, terminalContextKey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.registerSingleton)(terminal_1.ITerminalProfileResolverService, terminalProfileResolverService_1.BrowserTerminalProfileResolverService, 1 /* InstantiationType.Delayed */);
    // Register standard external terminal keybinding as integrated terminal when in web as the
    // external terminal is not available
    keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
        id: "workbench.action.terminal.new" /* TerminalCommandId.New */,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: terminalContextKey_1.TerminalContextKeys.notFocus,
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 33 /* KeyCode.KeyC */
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWwud2ViLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIvdGVybWluYWwud2ViLmNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQVNoRyxJQUFBLDhCQUFpQixFQUFDLDBDQUErQixFQUFFLHNFQUFxQyxvQ0FBNEIsQ0FBQztJQUVySCwyRkFBMkY7SUFDM0YscUNBQXFDO0lBQ3JDLHlDQUFtQixDQUFDLHNCQUFzQixDQUFDO1FBQzFDLEVBQUUsNkRBQXVCO1FBQ3pCLE1BQU0sNkNBQW1DO1FBQ3pDLElBQUksRUFBRSx3Q0FBbUIsQ0FBQyxRQUFRO1FBQ2xDLE9BQU8sRUFBRSxtREFBNkIsd0JBQWU7S0FDckQsQ0FBQyxDQUFDIn0=