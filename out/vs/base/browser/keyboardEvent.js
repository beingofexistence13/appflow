/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/common/keyCodes", "vs/base/common/keybindings", "vs/base/common/platform"], function (require, exports, browser, keyCodes_1, keybindings_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StandardKeyboardEvent = exports.printStandardKeyboardEvent = exports.printKeyboardEvent = void 0;
    function extractKeyCode(e) {
        if (e.charCode) {
            // "keypress" events mostly
            const char = String.fromCharCode(e.charCode).toUpperCase();
            return keyCodes_1.KeyCodeUtils.fromString(char);
        }
        const keyCode = e.keyCode;
        // browser quirks
        if (keyCode === 3) {
            return 7 /* KeyCode.PauseBreak */;
        }
        else if (browser.isFirefox) {
            switch (keyCode) {
                case 59: return 85 /* KeyCode.Semicolon */;
                case 60:
                    if (platform.isLinux) {
                        return 97 /* KeyCode.IntlBackslash */;
                    }
                    break;
                case 61: return 86 /* KeyCode.Equal */;
                // based on: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode#numpad_keys
                case 107: return 109 /* KeyCode.NumpadAdd */;
                case 109: return 111 /* KeyCode.NumpadSubtract */;
                case 173: return 88 /* KeyCode.Minus */;
                case 224:
                    if (platform.isMacintosh) {
                        return 57 /* KeyCode.Meta */;
                    }
                    break;
            }
        }
        else if (browser.isWebKit) {
            if (platform.isMacintosh && keyCode === 93) {
                // the two meta keys in the Mac have different key codes (91 and 93)
                return 57 /* KeyCode.Meta */;
            }
            else if (!platform.isMacintosh && keyCode === 92) {
                return 57 /* KeyCode.Meta */;
            }
        }
        // cross browser keycodes:
        return keyCodes_1.EVENT_KEY_CODE_MAP[keyCode] || 0 /* KeyCode.Unknown */;
    }
    const ctrlKeyMod = (platform.isMacintosh ? 256 /* KeyMod.WinCtrl */ : 2048 /* KeyMod.CtrlCmd */);
    const altKeyMod = 512 /* KeyMod.Alt */;
    const shiftKeyMod = 1024 /* KeyMod.Shift */;
    const metaKeyMod = (platform.isMacintosh ? 2048 /* KeyMod.CtrlCmd */ : 256 /* KeyMod.WinCtrl */);
    function printKeyboardEvent(e) {
        const modifiers = [];
        if (e.ctrlKey) {
            modifiers.push(`ctrl`);
        }
        if (e.shiftKey) {
            modifiers.push(`shift`);
        }
        if (e.altKey) {
            modifiers.push(`alt`);
        }
        if (e.metaKey) {
            modifiers.push(`meta`);
        }
        return `modifiers: [${modifiers.join(',')}], code: ${e.code}, keyCode: ${e.keyCode}, key: ${e.key}`;
    }
    exports.printKeyboardEvent = printKeyboardEvent;
    function printStandardKeyboardEvent(e) {
        const modifiers = [];
        if (e.ctrlKey) {
            modifiers.push(`ctrl`);
        }
        if (e.shiftKey) {
            modifiers.push(`shift`);
        }
        if (e.altKey) {
            modifiers.push(`alt`);
        }
        if (e.metaKey) {
            modifiers.push(`meta`);
        }
        return `modifiers: [${modifiers.join(',')}], code: ${e.code}, keyCode: ${e.keyCode} ('${keyCodes_1.KeyCodeUtils.toString(e.keyCode)}')`;
    }
    exports.printStandardKeyboardEvent = printStandardKeyboardEvent;
    class StandardKeyboardEvent {
        constructor(source) {
            this._standardKeyboardEventBrand = true;
            const e = source;
            this.browserEvent = e;
            this.target = e.target;
            this.ctrlKey = e.ctrlKey;
            this.shiftKey = e.shiftKey;
            this.altKey = e.altKey;
            this.metaKey = e.metaKey;
            this.altGraphKey = e.getModifierState('AltGraph');
            this.keyCode = extractKeyCode(e);
            this.code = e.code;
            // console.info(e.type + ": keyCode: " + e.keyCode + ", which: " + e.which + ", charCode: " + e.charCode + ", detail: " + e.detail + " ====> " + this.keyCode + ' -- ' + KeyCode[this.keyCode]);
            this.ctrlKey = this.ctrlKey || this.keyCode === 5 /* KeyCode.Ctrl */;
            this.altKey = this.altKey || this.keyCode === 6 /* KeyCode.Alt */;
            this.shiftKey = this.shiftKey || this.keyCode === 4 /* KeyCode.Shift */;
            this.metaKey = this.metaKey || this.keyCode === 57 /* KeyCode.Meta */;
            this._asKeybinding = this._computeKeybinding();
            this._asKeyCodeChord = this._computeKeyCodeChord();
            // console.log(`code: ${e.code}, keyCode: ${e.keyCode}, key: ${e.key}`);
        }
        preventDefault() {
            if (this.browserEvent && this.browserEvent.preventDefault) {
                this.browserEvent.preventDefault();
            }
        }
        stopPropagation() {
            if (this.browserEvent && this.browserEvent.stopPropagation) {
                this.browserEvent.stopPropagation();
            }
        }
        toKeyCodeChord() {
            return this._asKeyCodeChord;
        }
        equals(other) {
            return this._asKeybinding === other;
        }
        _computeKeybinding() {
            let key = 0 /* KeyCode.Unknown */;
            if (this.keyCode !== 5 /* KeyCode.Ctrl */ && this.keyCode !== 4 /* KeyCode.Shift */ && this.keyCode !== 6 /* KeyCode.Alt */ && this.keyCode !== 57 /* KeyCode.Meta */) {
                key = this.keyCode;
            }
            let result = 0;
            if (this.ctrlKey) {
                result |= ctrlKeyMod;
            }
            if (this.altKey) {
                result |= altKeyMod;
            }
            if (this.shiftKey) {
                result |= shiftKeyMod;
            }
            if (this.metaKey) {
                result |= metaKeyMod;
            }
            result |= key;
            return result;
        }
        _computeKeyCodeChord() {
            let key = 0 /* KeyCode.Unknown */;
            if (this.keyCode !== 5 /* KeyCode.Ctrl */ && this.keyCode !== 4 /* KeyCode.Shift */ && this.keyCode !== 6 /* KeyCode.Alt */ && this.keyCode !== 57 /* KeyCode.Meta */) {
                key = this.keyCode;
            }
            return new keybindings_1.KeyCodeChord(this.ctrlKey, this.shiftKey, this.altKey, this.metaKey, key);
        }
    }
    exports.StandardKeyboardEvent = StandardKeyboardEvent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmRFdmVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci9rZXlib2FyZEV2ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxTQUFTLGNBQWMsQ0FBQyxDQUFnQjtRQUN2QyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUU7WUFDZiwyQkFBMkI7WUFDM0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDM0QsT0FBTyx1QkFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNyQztRQUVELE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFFMUIsaUJBQWlCO1FBQ2pCLElBQUksT0FBTyxLQUFLLENBQUMsRUFBRTtZQUNsQixrQ0FBMEI7U0FDMUI7YUFBTSxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7WUFDN0IsUUFBUSxPQUFPLEVBQUU7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDLENBQUMsa0NBQXlCO2dCQUNsQyxLQUFLLEVBQUU7b0JBQ04sSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFO3dCQUFFLHNDQUE2QjtxQkFBRTtvQkFDdkQsTUFBTTtnQkFDUCxLQUFLLEVBQUUsQ0FBQyxDQUFDLDhCQUFxQjtnQkFDOUIsK0ZBQStGO2dCQUMvRixLQUFLLEdBQUcsQ0FBQyxDQUFDLG1DQUF5QjtnQkFDbkMsS0FBSyxHQUFHLENBQUMsQ0FBQyx3Q0FBOEI7Z0JBQ3hDLEtBQUssR0FBRyxDQUFDLENBQUMsOEJBQXFCO2dCQUMvQixLQUFLLEdBQUc7b0JBQ1AsSUFBSSxRQUFRLENBQUMsV0FBVyxFQUFFO3dCQUFFLDZCQUFvQjtxQkFBRTtvQkFDbEQsTUFBTTthQUNQO1NBQ0Q7YUFBTSxJQUFJLE9BQU8sQ0FB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