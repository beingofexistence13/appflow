/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/keybindings", "vs/platform/keybinding/common/baseResolvedKeybinding", "vs/platform/keybinding/common/resolvedKeybindingItem"], function (require, exports, keyCodes_1, keybindings_1, baseResolvedKeybinding_1, resolvedKeybindingItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.USLayoutResolvedKeybinding = void 0;
    /**
     * Do not instantiate. Use KeybindingService to get a ResolvedKeybinding seeded with information about the current kb layout.
     */
    class USLayoutResolvedKeybinding extends baseResolvedKeybinding_1.BaseResolvedKeybinding {
        constructor(chords, os) {
            super(os, chords);
        }
        _keyCodeToUILabel(keyCode) {
            if (this._os === 2 /* OperatingSystem.Macintosh */) {
                switch (keyCode) {
                    case 15 /* KeyCode.LeftArrow */:
                        return '←';
                    case 16 /* KeyCode.UpArrow */:
                        return '↑';
                    case 17 /* KeyCode.RightArrow */:
                        return '→';
                    case 18 /* KeyCode.DownArrow */:
                        return '↓';
                }
            }
            return keyCodes_1.KeyCodeUtils.toString(keyCode);
        }
        _getLabel(chord) {
            if (chord.isDuplicateModifierCase()) {
                return '';
            }
            return this._keyCodeToUILabel(chord.keyCode);
        }
        _getAriaLabel(chord) {
            if (chord.isDuplicateModifierCase()) {
                return '';
            }
            return keyCodes_1.KeyCodeUtils.toString(chord.keyCode);
        }
        _getElectronAccelerator(chord) {
            return keyCodes_1.KeyCodeUtils.toElectronAccelerator(chord.keyCode);
        }
        _getUserSettingsLabel(chord) {
            if (chord.isDuplicateModifierCase()) {
                return '';
            }
            const result = keyCodes_1.KeyCodeUtils.toUserSettingsUS(chord.keyCode);
            return (result ? result.toLowerCase() : result);
        }
        _isWYSIWYG() {
            return true;
        }
        _getChordDispatch(chord) {
            return USLayoutResolvedKeybinding.getDispatchStr(chord);
        }
        static getDispatchStr(chord) {
            if (chord.isModifierKey()) {
                return null;
            }
            let result = '';
            if (chord.ctrlKey) {
                result += 'ctrl+';
            }
            if (chord.shiftKey) {
                result += 'shift+';
            }
            if (chord.altKey) {
                result += 'alt+';
            }
            if (chord.metaKey) {
                result += 'meta+';
            }
            result += keyCodes_1.KeyCodeUtils.toString(chord.keyCode);
            return result;
        }
        _getSingleModifierChordDispatch(keybinding) {
            if (keybinding.keyCode === 5 /* KeyCode.Ctrl */ && !keybinding.shiftKey && !keybinding.altKey && !keybinding.metaKey) {
                return 'ctrl';
            }
            if (keybinding.keyCode === 4 /* KeyCode.Shift */ && !keybinding.ctrlKey && !keybinding.altKey && !keybinding.metaKey) {
                return 'shift';
            }
            if (keybinding.keyCode === 6 /* KeyCode.Alt */ && !keybinding.ctrlKey && !keybinding.shiftKey && !keybinding.metaKey) {
                return 'alt';
            }
            if (keybinding.keyCode === 57 /* KeyCode.Meta */ && !keybinding.ctrlKey && !keybinding.shiftKey && !keybinding.altKey) {
                return 'meta';
            }
            return null;
        }
        /**
         * *NOTE*: Check return value for `KeyCode.Unknown`.
         */
        static _scanCodeToKeyCode(scanCode) {
            const immutableKeyCode = keyCodes_1.IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
            if (immutableKeyCode !== -1 /* KeyCode.DependsOnKbLayout */) {
                return immutableKeyCode;
            }
            switch (scanCode) {
                case 10 /* ScanCode.KeyA */: return 31 /* KeyCode.KeyA */;
                case 11 /* ScanCode.KeyB */: return 32 /* KeyCode.KeyB */;
                case 12 /* ScanCode.KeyC */: return 33 /* KeyCode.KeyC */;
                case 13 /* ScanCode.KeyD */: return 34 /* KeyCode.KeyD */;
                case 14 /* ScanCode.KeyE */: return 35 /* KeyCode.KeyE */;
                case 15 /* ScanCode.KeyF */: return 36 /* KeyCode.KeyF */;
                case 16 /* ScanCode.KeyG */: return 37 /* KeyCode.KeyG */;
                case 17 /* ScanCode.KeyH */: return 38 /* KeyCode.KeyH */;
                case 18 /* ScanCode.KeyI */: return 39 /* KeyCode.KeyI */;
                case 19 /* ScanCode.KeyJ */: return 40 /* KeyCode.KeyJ */;
                case 20 /* ScanCode.KeyK */: return 41 /* KeyCode.KeyK */;
                case 21 /* ScanCode.KeyL */: return 42 /* KeyCode.KeyL */;
                case 22 /* ScanCode.KeyM */: return 43 /* KeyCode.KeyM */;
                case 23 /* ScanCode.KeyN */: return 44 /* KeyCode.KeyN */;
                case 24 /* ScanCode.KeyO */: return 45 /* KeyCode.KeyO */;
                case 25 /* ScanCode.KeyP */: return 46 /* KeyCode.KeyP */;
                case 26 /* ScanCode.KeyQ */: return 47 /* KeyCode.KeyQ */;
                case 27 /* ScanCode.KeyR */: return 48 /* KeyCode.KeyR */;
                case 28 /* ScanCode.KeyS */: return 49 /* KeyCode.KeyS */;
                case 29 /* ScanCode.KeyT */: return 50 /* KeyCode.KeyT */;
                case 30 /* ScanCode.KeyU */: return 51 /* KeyCode.KeyU */;
                case 31 /* ScanCode.KeyV */: return 52 /* KeyCode.KeyV */;
                case 32 /* ScanCode.KeyW */: return 53 /* KeyCode.KeyW */;
                case 33 /* ScanCode.KeyX */: return 54 /* KeyCode.KeyX */;
                case 34 /* ScanCode.KeyY */: return 55 /* KeyCode.KeyY */;
                case 35 /* ScanCode.KeyZ */: return 56 /* KeyCode.KeyZ */;
                case 36 /* ScanCode.Digit1 */: return 22 /* KeyCode.Digit1 */;
                case 37 /* ScanCode.Digit2 */: return 23 /* KeyCode.Digit2 */;
                case 38 /* ScanCode.Digit3 */: return 24 /* KeyCode.Digit3 */;
                case 39 /* ScanCode.Digit4 */: return 25 /* KeyCode.Digit4 */;
                case 40 /* ScanCode.Digit5 */: return 26 /* KeyCode.Digit5 */;
                case 41 /* ScanCode.Digit6 */: return 27 /* KeyCode.Digit6 */;
                case 42 /* ScanCode.Digit7 */: return 28 /* KeyCode.Digit7 */;
                case 43 /* ScanCode.Digit8 */: return 29 /* KeyCode.Digit8 */;
                case 44 /* ScanCode.Digit9 */: return 30 /* KeyCode.Digit9 */;
                case 45 /* ScanCode.Digit0 */: return 21 /* KeyCode.Digit0 */;
                case 51 /* ScanCode.Minus */: return 88 /* KeyCode.Minus */;
                case 52 /* ScanCode.Equal */: return 86 /* KeyCode.Equal */;
                case 53 /* ScanCode.BracketLeft */: return 92 /* KeyCode.BracketLeft */;
                case 54 /* ScanCode.BracketRight */: return 94 /* KeyCode.BracketRight */;
                case 55 /* ScanCode.Backslash */: return 93 /* KeyCode.Backslash */;
                case 56 /* ScanCode.IntlHash */: return 0 /* KeyCode.Unknown */; // missing
                case 57 /* ScanCode.Semicolon */: return 85 /* KeyCode.Semicolon */;
                case 58 /* ScanCode.Quote */: return 95 /* KeyCode.Quote */;
                case 59 /* ScanCode.Backquote */: return 91 /* KeyCode.Backquote */;
                case 60 /* ScanCode.Comma */: return 87 /* KeyCode.Comma */;
                case 61 /* ScanCode.Period */: return 89 /* KeyCode.Period */;
                case 62 /* ScanCode.Slash */: return 90 /* KeyCode.Slash */;
                case 106 /* ScanCode.IntlBackslash */: return 97 /* KeyCode.IntlBackslash */;
            }
            return 0 /* KeyCode.Unknown */;
        }
        static _toKeyCodeChord(chord) {
            if (!chord) {
                return null;
            }
            if (chord instanceof keybindings_1.KeyCodeChord) {
                return chord;
            }
            const keyCode = this._scanCodeToKeyCode(chord.scanCode);
            if (keyCode === 0 /* KeyCode.Unknown */) {
                return null;
            }
            return new keybindings_1.KeyCodeChord(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, keyCode);
        }
        static resolveKeybinding(keybinding, os) {
            const chords = (0, resolvedKeybindingItem_1.toEmptyArrayIfContainsNull)(keybinding.chords.map(chord => this._toKeyCodeChord(chord)));
            if (chords.length > 0) {
                return [new USLayoutResolvedKeybinding(chords, os)];
            }
            return [];
        }
    }
    exports.USLayoutResolvedKeybinding = USLayoutResolvedKeybinding;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNMYXlvdXRSZXNvbHZlZEtleWJpbmRpbmcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9rZXliaW5kaW5nL2NvbW1vbi91c0xheW91dFJlc29sdmVkS2V5YmluZGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEc7O09BRUc7SUFDSCxNQUFhLDBCQUEyQixTQUFRLCtDQUFvQztRQUVuRixZQUFZLE1BQXNCLEVBQUUsRUFBbUI7WUFDdEQsS0FBSyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNuQixDQUFDO1FBRU8saUJBQWlCLENBQUMsT0FBZ0I7WUFDekMsSUFBSSxJQUFJLENBQUMsR0FBRyxzQ0FBOEIsRUFBRTtnQkFDM0MsUUFBUSxPQUFPLEVBQUU7b0JBQ2hCO3dCQUNDLE9BQU8sR0FBRyxDQUFDO29CQUNaO3dCQUNDLE9BQU8sR0FBRyxDQUFDO29CQUNaO3dCQUNDLE9BQU8sR0FBRyxDQUFDO29CQUNaO3dCQUNDLE9BQU8sR0FBRyxDQUFDO2lCQUNaO2FBQ0Q7WUFDRCxPQUFPLHVCQUFZLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFUyxTQUFTLENBQUMsS0FBbUI7WUFDdEMsSUFBSSxLQUFLLENBQUMsdUJBQXVCLEVBQUUsRUFBRTtnQkFDcEMsT0FBTyxFQUFFLENBQUM7YUFDVjtZQUNELE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRVMsYUFBYSxDQUFDLEtBQW1CO1lBQzFDLElBQUksS0FBSyxDQUFDLHVCQUF1QixFQUFFLEVBQUU7Z0JBQ3BDLE9BQU8sRUFBRSxDQUFDO2FBQ1Y7WUFDRCxPQUFPLHVCQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRVMsdUJBQXVCLENBQUMsS0FBbUI7WUFDcEQsT0FBTyx1QkFBWSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRVMscUJBQXFCLENBQUMsS0FBbUI7WUFDbEQsSUFBSSxLQUFLLENBQUMsdUJBQXVCLEVBQUUsRUFBRTtnQkFDcEMsT0FBTyxFQUFFLENBQUM7YUFDVjtZQUNELE1BQU0sTUFBTSxHQUFHLHVCQUFZLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzVELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUVTLFVBQVU7WUFDbkIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRVMsaUJBQWlCLENBQUMsS0FBbUI7WUFDOUMsT0FBTywwQkFBMEIsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUVNLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBbUI7WUFDL0MsSUFBSSxLQUFLLENBQUMsYUFBYSxFQUFFLEVBQUU7Z0JBQzFCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFFaEIsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFO2dCQUNsQixNQUFNLElBQUksT0FBTyxDQUFDO2FBQ2xCO1lBQ0QsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO2dCQUNuQixNQUFNLElBQUksUUFBUSxDQUFDO2FBQ25CO1lBQ0QsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUNqQixNQUFNLElBQUksTUFBTSxDQUFDO2FBQ2pCO1lBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFO2dCQUNsQixNQUFNLElBQUksT0FBTyxDQUFDO2FBQ2xCO1lBQ0QsTUFBTSxJQUFJLHVCQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUvQyxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFUywrQkFBK0IsQ0FBQyxVQUF3QjtZQUNqRSxJQUFJLFVBQVUsQ0FBQyxPQUFPLHlCQUFpQixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO2dCQUM3RyxPQUFPLE1BQU0sQ0FBQzthQUNkO1lBQ0QsSUFBSSxVQUFVLENBQUMsT0FBTywwQkFBa0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRTtnQkFDN0csT0FBTyxPQUFPLENBQUM7YUFDZjtZQUNELElBQUksVUFBVSxDQUFDLE9BQU8sd0JBQWdCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUU7Z0JBQzdHLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFDRCxJQUFJLFVBQVUsQ0FBQyxPQUFPLDBCQUFpQixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFO2dCQUM3RyxPQUFPLE1BQU0sQ0FBQzthQUNkO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQ7O1dBRUc7UUFDSyxNQUFNLENBQUMsa0JBQWtCLENBQUMsUUFBa0I7WUFDbkQsTUFBTSxnQkFBZ0IsR0FBRyxxQ0FBMEIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5RCxJQUFJLGdCQUFnQix1Q0FBOEIsRUFBRTtnQkFDbkQsT0FBTyxnQkFBZ0IsQ0FBQzthQUN4QjtZQUVELFFBQVEsUUFBUSxFQUFFO2dCQUNqQiwyQkFBa0IsQ0FBQyxDQUFDLDZCQUFvQjtnQkFDeEMsMkJBQWtCLENBQUMsQ0FBQyw2QkFBb0I7Z0JBQ3hDLDJCQUFrQixDQUFDLENBQUMsNkJBQW9CO2dCQUN4QywyQkFBa0IsQ0FBQyxDQUFDLDZCQUFvQjtnQkFDeEMsMkJBQWtCLENBQUMsQ0FBQyw2QkFBb0I7Z0JBQ3hDLDJCQUFrQixDQUFDLENBQUMsNkJBQW9CO2dCQUN4QywyQkFBa0IsQ0FBQyxDQUFDLDZCQUFvQjtnQkFDeEMsMkJBQWtCLENBQUMsQ0FBQyw2QkFBb0I7Z0JBQ3hDLDJCQUFrQixDQUFDLENBQUMsNkJBQW9CO2dCQUN4QywyQkFBa0IsQ0FBQyxDQUFDLDZCQUFvQjtnQkFDeEMsMkJBQWtCLENBQUMsQ0FBQyw2QkFBb0I7Z0JBQ3hDLDJCQUFrQixDQUFDLENBQUMsNkJBQW9CO2dCQUN4QywyQkFBa0IsQ0FBQyxDQUFDLDZCQUFvQjtnQkFDeEMsMkJBQWtCLENBQUMsQ0FBQyw2QkFBb0I7Z0JBQ3hDLDJCQUFrQixDQUFDLENBQUMsNkJBQW9CO2dCQUN4QywyQkFBa0IsQ0FBQyxDQUFDLDZCQUFvQjtnQkFDeEMsMkJBQWtCLENBQUMsQ0FBQyw2QkFBb0I7Z0JBQ3hDLDJCQUFrQixDQUFDLENBQUMsNkJBQW9CO2dCQUN4QywyQkFBa0IsQ0FBQyxDQUFDLDZCQUFvQjtnQkFDeEMsMkJBQWtCLENBQUMsQ0FBQyw2QkFBb0I7Z0JBQ3hDLDJCQUFrQixDQUFDLENBQUMsNkJBQW9CO2dCQUN4QywyQkFBa0IsQ0FBQyxDQUFDLDZCQUFvQjtnQkFDeEMsMkJBQWtCLENBQUMsQ0FBQyw2QkFBb0I7Z0JBQ3hDLDJCQUFrQixDQUFDLENBQUMsNkJBQW9CO2dCQUN4QywyQkFBa0IsQ0FBQyxDQUFDLDZCQUFvQjtnQkFDeEMsMkJBQWtCLENBQUMsQ0FBQyw2QkFBb0I7Z0JBQ3hDLDZCQUFvQixDQUFDLENBQUMsK0JBQXNCO2dCQUM1Qyw2QkFBb0IsQ0FBQyxDQUFDLCtCQUFzQjtnQkFDNUMsNkJBQW9CLENBQUMsQ0FBQywrQkFBc0I7Z0JBQzVDLDZCQUFvQixDQUFDLENBQUMsK0JBQXNCO2dCQUM1Qyw2QkFBb0IsQ0FBQyxDQUFDLCtCQUFzQjtnQkFDNUMsNkJBQW9CLENBQUMsQ0FBQywrQkFBc0I7Z0JBQzVDLDZCQUFvQixDQUFDLENBQUMsK0JBQXNCO2dCQUM1Qyw2QkFBb0IsQ0FBQyxDQUFDLCtCQUFzQjtnQkFDNUMsNkJBQW9CLENBQUMsQ0FBQywrQkFBc0I7Z0JBQzVDLDZCQUFvQixDQUFDLENBQUMsK0JBQXNCO2dCQUM1Qyw0QkFBbUIsQ0FBQyxDQUFDLDhCQUFxQjtnQkFDMUMsNEJBQW1CLENBQUMsQ0FBQyw4QkFBcUI7Z0JBQzFDLGtDQUF5QixDQUFDLENBQUMsb0NBQTJCO2dCQUN0RCxtQ0FBMEIsQ0FBQyxDQUFDLHFDQUE0QjtnQkFDeEQsZ0NBQXVCLENBQUMsQ0FBQyxrQ0FBeUI7Z0JBQ2xELCtCQUFzQixDQUFDLENBQUMsK0JBQXVCLENBQUMsVUFBVTtnQkFDMUQsZ0NBQXVCLENBQUMsQ0FBQyxrQ0FBeUI7Z0JBQ2xELDRCQUFtQixDQUFDLENBQUMsOEJBQXFCO2dCQUMxQyxnQ0FBdUIsQ0FBQyxDQUFDLGtDQUF5QjtnQkFDbEQsNEJBQW1CLENBQUMsQ0FBQyw4QkFBcUI7Z0JBQzFDLDZCQUFvQixDQUFDLENBQUMsK0JBQXNCO2dCQUM1Qyw0QkFBbUIsQ0FBQyxDQUFDLDhCQUFxQjtnQkFDMUMscUNBQTJCLENBQUMsQ0FBQyxzQ0FBNkI7YUFDMUQ7WUFDRCwrQkFBdUI7UUFDeEIsQ0FBQztRQUVPLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBbUI7WUFDakQsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDWCxPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsSUFBSSxLQUFLLFlBQVksMEJBQVksRUFBRTtnQkFDbEMsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUNELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDeEQsSUFBSSxPQUFPLDRCQUFvQixFQUFFO2dCQUNoQyxPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxJQUFJLDBCQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5RixDQUFDO1FBRU0sTUFBTSxDQUFDLGlCQUFpQixDQUFDLFVBQXNCLEVBQUUsRUFBbUI7WUFDMUUsTUFBTSxNQUFNLEdBQW1CLElBQUEsbURBQTBCLEVBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2SCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUN0QixPQUFPLENBQUMsSUFBSSwwQkFBMEIsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNwRDtZQUNELE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztLQUNEO0lBbkxELGdFQW1MQyJ9