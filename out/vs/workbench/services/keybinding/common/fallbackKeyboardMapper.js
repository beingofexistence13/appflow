/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keybindings", "vs/platform/keybinding/common/usLayoutResolvedKeybinding"], function (require, exports, keybindings_1, usLayoutResolvedKeybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FallbackKeyboardMapper = void 0;
    /**
     * A keyboard mapper to be used when reading the keymap from the OS fails.
     */
    class FallbackKeyboardMapper {
        constructor(_mapAltGrToCtrlAlt, _OS) {
            this._mapAltGrToCtrlAlt = _mapAltGrToCtrlAlt;
            this._OS = _OS;
        }
        dumpDebugInfo() {
            return 'FallbackKeyboardMapper dispatching on keyCode';
        }
        resolveKeyboardEvent(keyboardEvent) {
            const ctrlKey = keyboardEvent.ctrlKey || (this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey);
            const altKey = keyboardEvent.altKey || (this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey);
            const chord = new keybindings_1.KeyCodeChord(ctrlKey, keyboardEvent.shiftKey, altKey, keyboardEvent.metaKey, keyboardEvent.keyCode);
            const result = this.resolveKeybinding(new keybindings_1.Keybinding([chord]));
            return result[0];
        }
        resolveKeybinding(keybinding) {
            return usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding.resolveKeybinding(keybinding, this._OS);
        }
    }
    exports.FallbackKeyboardMapper = FallbackKeyboardMapper;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFsbGJhY2tLZXlib2FyZE1hcHBlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9rZXliaW5kaW5nL2NvbW1vbi9mYWxsYmFja0tleWJvYXJkTWFwcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFoRzs7T0FFRztJQUNILE1BQWEsc0JBQXNCO1FBRWxDLFlBQ2tCLGtCQUEyQixFQUMzQixHQUFvQjtZQURwQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQVM7WUFDM0IsUUFBRyxHQUFILEdBQUcsQ0FBaUI7UUFDbEMsQ0FBQztRQUVFLGFBQWE7WUFDbkIsT0FBTywrQ0FBK0MsQ0FBQztRQUN4RCxDQUFDO1FBRU0sb0JBQW9CLENBQUMsYUFBNkI7WUFDeEQsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDaEcsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDOUYsTUFBTSxLQUFLLEdBQUcsSUFBSSwwQkFBWSxDQUM3QixPQUFPLEVBQ1AsYUFBYSxDQUFDLFFBQVEsRUFDdEIsTUFBTSxFQUNOLGFBQWEsQ0FBQyxPQUFPLEVBQ3JCLGFBQWEsQ0FBQyxPQUFPLENBQ3JCLENBQUM7WUFDRixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSx3QkFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9ELE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFFTSxpQkFBaUIsQ0FBQyxVQUFzQjtZQUM5QyxPQUFPLHVEQUEwQixDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0UsQ0FBQztLQUNEO0lBNUJELHdEQTRCQyJ9