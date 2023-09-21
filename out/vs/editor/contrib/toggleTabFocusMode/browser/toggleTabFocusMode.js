/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/editor/browser/config/tabFocus", "vs/nls", "vs/platform/actions/common/actions"], function (require, exports, aria_1, tabFocus_1, nls, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ToggleTabFocusModeAction = void 0;
    class ToggleTabFocusModeAction extends actions_1.Action2 {
        static { this.ID = 'editor.action.toggleTabFocusMode'; }
        constructor() {
            super({
                id: ToggleTabFocusModeAction.ID,
                title: { value: nls.localize({ key: 'toggle.tabMovesFocus', comment: ['Turn on/off use of tab key for moving focus around VS Code'] }, 'Toggle Tab Key Moves Focus'), original: 'Toggle Tab Key Moves Focus' },
                precondition: undefined,
                keybinding: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 43 /* KeyCode.KeyM */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 43 /* KeyCode.KeyM */ },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                f1: true
            });
        }
        run() {
            const oldValue = tabFocus_1.TabFocus.getTabFocusMode();
            const newValue = !oldValue;
            tabFocus_1.TabFocus.setTabFocusMode(newValue);
            if (newValue) {
                (0, aria_1.alert)(nls.localize('toggle.tabMovesFocus.on', "Pressing Tab will now move focus to the next focusable element"));
            }
            else {
                (0, aria_1.alert)(nls.localize('toggle.tabMovesFocus.off', "Pressing Tab will now insert the tab character"));
            }
        }
    }
    exports.ToggleTabFocusModeAction = ToggleTabFocusModeAction;
    (0, actions_1.registerAction2)(ToggleTabFocusModeAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlVGFiRm9jdXNNb2RlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvdG9nZ2xlVGFiRm9jdXNNb2RlL2Jyb3dzZXIvdG9nZ2xlVGFiRm9jdXNNb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxNQUFhLHdCQUF5QixTQUFRLGlCQUFPO2lCQUU3QixPQUFFLEdBQUcsa0NBQWtDLENBQUM7UUFFL0Q7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLHdCQUF3QixDQUFDLEVBQUU7Z0JBQy9CLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLHNCQUFzQixFQUFFLE9BQU8sRUFBRSxDQUFDLDREQUE0RCxDQUFDLEVBQUUsRUFBRSw0QkFBNEIsQ0FBQyxFQUFFLFFBQVEsRUFBRSw0QkFBNEIsRUFBRTtnQkFDOU0sWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLFVBQVUsRUFBRTtvQkFDWCxPQUFPLEVBQUUsaURBQTZCO29CQUN0QyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsa0RBQTZCLHdCQUFlLEVBQUU7b0JBQzlELE1BQU0sMENBQWdDO2lCQUN0QztnQkFDRCxFQUFFLEVBQUUsSUFBSTthQUNSLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFTSxHQUFHO1lBQ1QsTUFBTSxRQUFRLEdBQUcsbUJBQVEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUM1QyxNQUFNLFFBQVEsR0FBRyxDQUFDLFFBQVEsQ0FBQztZQUMzQixtQkFBUSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNuQyxJQUFJLFFBQVEsRUFBRTtnQkFDYixJQUFBLFlBQUssRUFBQyxHQUFHLENBQUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFLGdFQUFnRSxDQUFDLENBQUMsQ0FBQzthQUNqSDtpQkFBTTtnQkFDTixJQUFBLFlBQUssRUFBQyxHQUFHLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLGdEQUFnRCxDQUFDLENBQUMsQ0FBQzthQUNsRztRQUNGLENBQUM7O0lBM0JGLDREQTRCQztJQUVELElBQUEseUJBQWUsRUFBQyx3QkFBd0IsQ0FBQyxDQUFDIn0=