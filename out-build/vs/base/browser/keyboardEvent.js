/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/common/keyCodes", "vs/base/common/keybindings", "vs/base/common/platform"], function (require, exports, browser, keyCodes_1, keybindings_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jO = exports.$iO = exports.$hO = void 0;
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
        else if (browser.$5N) {
            switch (keyCode) {
                case 59: return 85 /* KeyCode.Semicolon */;
                case 60:
                    if (platform.$k) {
                        return 97 /* KeyCode.IntlBackslash */;
                    }
                    break;
                case 61: return 86 /* KeyCode.Equal */;
                // based on: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode#numpad_keys
                case 107: return 109 /* KeyCode.NumpadAdd */;
                case 109: return 111 /* KeyCode.NumpadSubtract */;
                case 173: return 88 /* KeyCode.Minus */;
                case 224:
                    if (platform.$j) {
                        return 57 /* KeyCode.Meta */;
                    }
                    break;
            }
        }
        else if (browser.$6N) {
            if (platform.$j && keyCode === 93) {
                // the two meta keys in the Mac have different key codes (91 and 93)
                return 57 /* KeyCode.Meta */;
            }
            else if (!platform.$j && keyCode === 92) {
                return 57 /* KeyCode.Meta */;
            }
        }
        // cross browser keycodes:
        return keyCodes_1.$qq[keyCode] || 0 /* KeyCode.Unknown */;
    }
    const ctrlKeyMod = (platform.$j ? 256 /* KeyMod.WinCtrl */ : 2048 /* KeyMod.CtrlCmd */);
    const altKeyMod = 512 /* KeyMod.Alt */;
    const shiftKeyMod = 1024 /* KeyMod.Shift */;
    const metaKeyMod = (platform.$j ? 2048 /* KeyMod.CtrlCmd */ : 256 /* KeyMod.WinCtrl */);
    function $hO(e) {
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
    exports.$hO = $hO;
    function $iO(e) {
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
    exports.$iO = $iO;
    class $jO {
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
            this.a = this.c();
            this.b = this.d();
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
            return this.b;
        }
        equals(other) {
            return this.a === other;
        }
        c() {
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
        d() {
            let key = 0 /* KeyCode.Unknown */;
            if (this.keyCode !== 5 /* KeyCode.Ctrl */ && this.keyCode !== 4 /* KeyCode.Shift */ && this.keyCode !== 6 /* KeyCode.Alt */ && this.keyCode !== 57 /* KeyCode.Meta */) {
                key = this.keyCode;
            }
            return new keybindings_1.$yq(this.ctrlKey, this.shiftKey, this.altKey, this.metaKey, key);
        }
    }
    exports.$jO = $jO;
});
//# sourceMappingURL=keyboardEvent.js.map