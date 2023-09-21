/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/keybindings", "vs/platform/keybinding/common/baseResolvedKeybinding", "vs/platform/keybinding/common/resolvedKeybindingItem"], function (require, exports, keyCodes_1, keybindings_1, baseResolvedKeybinding_1, resolvedKeybindingItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$n3b = void 0;
    /**
     * Do not instantiate. Use KeybindingService to get a ResolvedKeybinding seeded with information about the current kb layout.
     */
    class $n3b extends baseResolvedKeybinding_1.$$Db {
        constructor(chords, os) {
            super(os, chords);
        }
        a(keyCode) {
            if (this.c === 2 /* OperatingSystem.Macintosh */) {
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
        f(chord) {
            if (chord.isDuplicateModifierCase()) {
                return '';
            }
            return this.a(chord.keyCode);
        }
        g(chord) {
            if (chord.isDuplicateModifierCase()) {
                return '';
            }
            return keyCodes_1.KeyCodeUtils.toString(chord.keyCode);
        }
        h(chord) {
            return keyCodes_1.KeyCodeUtils.toElectronAccelerator(chord.keyCode);
        }
        l(chord) {
            if (chord.isDuplicateModifierCase()) {
                return '';
            }
            const result = keyCodes_1.KeyCodeUtils.toUserSettingsUS(chord.keyCode);
            return (result ? result.toLowerCase() : result);
        }
        m() {
            return true;
        }
        n(chord) {
            return $n3b.getDispatchStr(chord);
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
        o(keybinding) {
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
        static t(scanCode) {
            const immutableKeyCode = keyCodes_1.$tq[scanCode];
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
        static u(chord) {
            if (!chord) {
                return null;
            }
            if (chord instanceof keybindings_1.$yq) {
                return chord;
            }
            const keyCode = this.t(chord.scanCode);
            if (keyCode === 0 /* KeyCode.Unknown */) {
                return null;
            }
            return new keybindings_1.$yq(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, keyCode);
        }
        static resolveKeybinding(keybinding, os) {
            const chords = (0, resolvedKeybindingItem_1.$YD)(keybinding.chords.map(chord => this.u(chord)));
            if (chords.length > 0) {
                return [new $n3b(chords, os)];
            }
            return [];
        }
    }
    exports.$n3b = $n3b;
});
//# sourceMappingURL=usLayoutResolvedKeybinding.js.map