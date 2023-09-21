/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/platform"], function (require, exports, keybindingsRegistry_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    if (platform.isMacintosh) {
        // On the mac, cmd+x, cmd+c and cmd+v do not result in cut / copy / paste
        // We therefore add a basic keybinding rule that invokes document.execCommand
        // This is to cover <input>s...
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'execCut',
            primary: 2048 /* KeyMod.CtrlCmd */ | 54 /* KeyCode.KeyX */,
            handler: bindExecuteCommand('cut'),
            weight: 0,
            when: undefined,
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: 'execCopy',
            primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
            handler: bindExecuteCommand('copy'),
            weight: 0,
            when: undefined,
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXRDbGlwYm9hcmRBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY29kZUVkaXRvci9lbGVjdHJvbi1zYW5kYm94L2lucHV0Q2xpcGJvYXJkQWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQU1oRyxJQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUU7UUFFekIseUVBQXlFO1FBQ3pFLDZFQUE2RTtRQUM3RSwrQkFBK0I7UUFFL0IseUNBQW1CLENBQUMsZ0NBQWdDLENBQUM7WUFDcEQsRUFBRSxFQUFFLFNBQVM7WUFDYixPQUFPLEVBQUUsaURBQTZCO1lBQ3RDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7WUFDbEMsTUFBTSxFQUFFLENBQUM7WUFDVCxJQUFJLEVBQUUsU0FBUztTQUNmLENBQUMsQ0FBQztRQUNILHlDQUFtQixDQUFDLGdDQUFnQyxDQUFDO1lBQ3BELEVBQUUsRUFBRSxVQUFVO1lBQ2QsT0FBTyxFQUFFLGlEQUE2QjtZQUN0QyxPQUFPLEVBQUUsa0JBQWtCLENBQUMsTUFBTSxDQUFDO1lBQ25DLE1BQU0sRUFBRSxDQUFDO1lBQ1QsSUFBSSxFQUFFLFNBQVM7U0FDZixDQUFDLENBQUM7UUFDSCx5Q0FBbUIsQ0FBQyxnQ0FBZ0MsQ0FBQztZQUNwRCxFQUFFLEVBQUUsV0FBVztZQUNmLE9BQU8sRUFBRSxpREFBNkI7WUFDdEMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLE9BQU8sQ0FBQztZQUNwQyxNQUFNLEVBQUUsQ0FBQztZQUNULElBQUksRUFBRSxTQUFTO1NBQ2YsQ0FBQyxDQUFDO1FBRUgsU0FBUyxrQkFBa0IsQ0FBQyxPQUFpQztZQUM1RCxPQUFPLEdBQUcsRUFBRTtnQkFDWCxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQy9CLENBQUMsQ0FBQztRQUNILENBQUM7S0FDRCJ9