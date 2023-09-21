/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/keybindings", "vs/base/common/keybindingLabels", "vs/platform/keybinding/common/baseResolvedKeybinding", "vs/platform/keybinding/common/resolvedKeybindingItem"], function (require, exports, keyCodes_1, keybindings_1, keybindingLabels_1, baseResolvedKeybinding_1, resolvedKeybindingItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$aEb = exports.$_Db = void 0;
    const LOG = false;
    function log(str) {
        if (LOG) {
            console.info(str);
        }
    }
    class $_Db extends baseResolvedKeybinding_1.$$Db {
        constructor(mapper, chords) {
            super(1 /* OperatingSystem.Windows */, chords);
            this.b = mapper;
        }
        f(chord) {
            if (chord.isDuplicateModifierCase()) {
                return '';
            }
            return this.b.getUILabelForKeyCode(chord.keyCode);
        }
        k(chord) {
            if (chord.isDuplicateModifierCase()) {
                return '';
            }
            return keyCodes_1.KeyCodeUtils.toString(chord.keyCode);
        }
        getUSLabel() {
            return keybindingLabels_1.$OR.toLabel(this.c, this.d, (keybinding) => this.k(keybinding));
        }
        g(chord) {
            if (chord.isDuplicateModifierCase()) {
                return '';
            }
            return this.b.getAriaLabelForKeyCode(chord.keyCode);
        }
        h(chord) {
            return this.b.getElectronAcceleratorForKeyBinding(chord);
        }
        l(chord) {
            if (chord.isDuplicateModifierCase()) {
                return '';
            }
            const result = this.b.getUserSettingsLabelForKeyCode(chord.keyCode);
            return (result ? result.toLowerCase() : result);
        }
        m(chord) {
            return this.t(chord.keyCode);
        }
        t(keyCode) {
            if (keyCode === 15 /* KeyCode.LeftArrow */
                || keyCode === 16 /* KeyCode.UpArrow */
                || keyCode === 17 /* KeyCode.RightArrow */
                || keyCode === 18 /* KeyCode.DownArrow */) {
                return true;
            }
            const ariaLabel = this.b.getAriaLabelForKeyCode(keyCode);
            const userSettingsLabel = this.b.getUserSettingsLabelForKeyCode(keyCode);
            return (ariaLabel === userSettingsLabel);
        }
        n(chord) {
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
        o(chord) {
            if (chord.keyCode === 5 /* KeyCode.Ctrl */ && !chord.shiftKey && !chord.altKey && !chord.metaKey) {
                return 'ctrl';
            }
            if (chord.keyCode === 4 /* KeyCode.Shift */ && !chord.ctrlKey && !chord.altKey && !chord.metaKey) {
                return 'shift';
            }
            if (chord.keyCode === 6 /* KeyCode.Alt */ && !chord.ctrlKey && !chord.shiftKey && !chord.metaKey) {
                return 'alt';
            }
            if (chord.keyCode === 57 /* KeyCode.Meta */ && !chord.ctrlKey && !chord.shiftKey && !chord.altKey) {
                return 'meta';
            }
            return null;
        }
        static w(chord, mapping) {
            if (!mapping) {
                return null;
            }
            if (chord.ctrlKey && chord.shiftKey && chord.altKey) {
                return mapping.withShiftAltGr;
            }
            if (chord.ctrlKey && chord.altKey) {
                return mapping.withAltGr;
            }
            if (chord.shiftKey) {
                return mapping.withShift;
            }
            return mapping.value;
        }
        static getProducedChar(chord, mapping) {
            const char = this.w(chord, mapping);
            if (char === null || char.length === 0) {
                return ' --- ';
            }
            return '  ' + char + '  ';
        }
    }
    exports.$_Db = $_Db;
    class $aEb {
        constructor(f, rawMappings, g) {
            this.f = f;
            this.g = g;
            this.d = [];
            this.c = [];
            this.d = [];
            this.e = [];
            this.d[0 /* KeyCode.Unknown */] = keyCodes_1.KeyCodeUtils.toString(0 /* KeyCode.Unknown */);
            for (let scanCode = 0 /* ScanCode.None */; scanCode < 193 /* ScanCode.MAX_VALUE */; scanCode++) {
                const immutableKeyCode = keyCodes_1.$tq[scanCode];
                if (immutableKeyCode !== -1 /* KeyCode.DependsOnKbLayout */) {
                    this.c[scanCode] = immutableKeyCode;
                    this.d[immutableKeyCode] = keyCodes_1.KeyCodeUtils.toString(immutableKeyCode);
                    this.e[immutableKeyCode] = true;
                }
            }
            const producesLetter = [];
            let producesLetters = false;
            this.b = [];
            for (const strCode in rawMappings) {
                if (rawMappings.hasOwnProperty(strCode)) {
                    const scanCode = keyCodes_1.$sq.toEnum(strCode);
                    if (scanCode === 0 /* ScanCode.None */) {
                        log(`Unknown scanCode ${strCode} in mapping.`);
                        continue;
                    }
                    const rawMapping = rawMappings[strCode];
                    const immutableKeyCode = keyCodes_1.$tq[scanCode];
                    if (immutableKeyCode !== -1 /* KeyCode.DependsOnKbLayout */) {
                        const keyCode = keyCodes_1.$rq[rawMapping.vkey] || 0 /* KeyCode.Unknown */;
                        if (keyCode === 0 /* KeyCode.Unknown */ || immutableKeyCode === keyCode) {
                            continue;
                        }
                        if (scanCode !== 134 /* ScanCode.NumpadComma */) {
                            // Looks like ScanCode.NumpadComma doesn't always map to KeyCode.NUMPAD_SEPARATOR
                            // e.g. on POR - PTB
                            continue;
                        }
                    }
                    const value = rawMapping.value;
                    const withShift = rawMapping.withShift;
                    const withAltGr = rawMapping.withAltGr;
                    const withShiftAltGr = rawMapping.withShiftAltGr;
                    const keyCode = keyCodes_1.$rq[rawMapping.vkey] || 0 /* KeyCode.Unknown */;
                    const mapping = {
                        scanCode: scanCode,
                        keyCode: keyCode,
                        value: value,
                        withShift: withShift,
                        withAltGr: withAltGr,
                        withShiftAltGr: withShiftAltGr,
                    };
                    this.b[scanCode] = mapping;
                    this.c[scanCode] = keyCode;
                    if (keyCode === 0 /* KeyCode.Unknown */) {
                        continue;
                    }
                    this.e[keyCode] = true;
                    if (value.length === 0) {
                        // This key does not produce strings
                        this.d[keyCode] = null;
                    }
                    else if (value.length > 1) {
                        // This key produces a letter representable with multiple UTF-16 code units.
                        this.d[keyCode] = value;
                    }
                    else {
                        const charCode = value.charCodeAt(0);
                        if (charCode >= 97 /* CharCode.a */ && charCode <= 122 /* CharCode.z */) {
                            const upperCaseValue = 65 /* CharCode.A */ + (charCode - 97 /* CharCode.a */);
                            producesLetter[upperCaseValue] = true;
                            producesLetters = true;
                            this.d[keyCode] = String.fromCharCode(65 /* CharCode.A */ + (charCode - 97 /* CharCode.a */));
                        }
                        else if (charCode >= 65 /* CharCode.A */ && charCode <= 90 /* CharCode.Z */) {
                            producesLetter[charCode] = true;
                            producesLetters = true;
                            this.d[keyCode] = value;
                        }
                        else {
                            this.d[keyCode] = value;
                        }
                    }
                }
            }
            // Handle keyboard layouts where latin characters are not produced e.g. Cyrillic
            const _registerLetterIfMissing = (charCode, keyCode) => {
                if (!producesLetter[charCode]) {
                    this.d[keyCode] = String.fromCharCode(charCode);
                }
            };
            _registerLetterIfMissing(65 /* CharCode.A */, 31 /* KeyCode.KeyA */);
            _registerLetterIfMissing(66 /* CharCode.B */, 32 /* KeyCode.KeyB */);
            _registerLetterIfMissing(67 /* CharCode.C */, 33 /* KeyCode.KeyC */);
            _registerLetterIfMissing(68 /* CharCode.D */, 34 /* KeyCode.KeyD */);
            _registerLetterIfMissing(69 /* CharCode.E */, 35 /* KeyCode.KeyE */);
            _registerLetterIfMissing(70 /* CharCode.F */, 36 /* KeyCode.KeyF */);
            _registerLetterIfMissing(71 /* CharCode.G */, 37 /* KeyCode.KeyG */);
            _registerLetterIfMissing(72 /* CharCode.H */, 38 /* KeyCode.KeyH */);
            _registerLetterIfMissing(73 /* CharCode.I */, 39 /* KeyCode.KeyI */);
            _registerLetterIfMissing(74 /* CharCode.J */, 40 /* KeyCode.KeyJ */);
            _registerLetterIfMissing(75 /* CharCode.K */, 41 /* KeyCode.KeyK */);
            _registerLetterIfMissing(76 /* CharCode.L */, 42 /* KeyCode.KeyL */);
            _registerLetterIfMissing(77 /* CharCode.M */, 43 /* KeyCode.KeyM */);
            _registerLetterIfMissing(78 /* CharCode.N */, 44 /* KeyCode.KeyN */);
            _registerLetterIfMissing(79 /* CharCode.O */, 45 /* KeyCode.KeyO */);
            _registerLetterIfMissing(80 /* CharCode.P */, 46 /* KeyCode.KeyP */);
            _registerLetterIfMissing(81 /* CharCode.Q */, 47 /* KeyCode.KeyQ */);
            _registerLetterIfMissing(82 /* CharCode.R */, 48 /* KeyCode.KeyR */);
            _registerLetterIfMissing(83 /* CharCode.S */, 49 /* KeyCode.KeyS */);
            _registerLetterIfMissing(84 /* CharCode.T */, 50 /* KeyCode.KeyT */);
            _registerLetterIfMissing(85 /* CharCode.U */, 51 /* KeyCode.KeyU */);
            _registerLetterIfMissing(86 /* CharCode.V */, 52 /* KeyCode.KeyV */);
            _registerLetterIfMissing(87 /* CharCode.W */, 53 /* KeyCode.KeyW */);
            _registerLetterIfMissing(88 /* CharCode.X */, 54 /* KeyCode.KeyX */);
            _registerLetterIfMissing(89 /* CharCode.Y */, 55 /* KeyCode.KeyY */);
            _registerLetterIfMissing(90 /* CharCode.Z */, 56 /* KeyCode.KeyZ */);
            if (!producesLetters) {
                // Since this keyboard layout produces no latin letters at all, most of the UI will use the
                // US kb layout equivalent for UI labels, so also try to render other keys with the US labels
                // for consistency...
                const _registerLabel = (keyCode, charCode) => {
                    // const existingLabel = this._keyCodeToLabel[keyCode];
                    // const existingCharCode = (existingLabel ? existingLabel.charCodeAt(0) : CharCode.Null);
                    // if (existingCharCode < 32 || existingCharCode > 126) {
                    this.d[keyCode] = String.fromCharCode(charCode);
                    // }
                };
                _registerLabel(85 /* KeyCode.Semicolon */, 59 /* CharCode.Semicolon */);
                _registerLabel(86 /* KeyCode.Equal */, 61 /* CharCode.Equals */);
                _registerLabel(87 /* KeyCode.Comma */, 44 /* CharCode.Comma */);
                _registerLabel(88 /* KeyCode.Minus */, 45 /* CharCode.Dash */);
                _registerLabel(89 /* KeyCode.Period */, 46 /* CharCode.Period */);
                _registerLabel(90 /* KeyCode.Slash */, 47 /* CharCode.Slash */);
                _registerLabel(91 /* KeyCode.Backquote */, 96 /* CharCode.BackTick */);
                _registerLabel(92 /* KeyCode.BracketLeft */, 91 /* CharCode.OpenSquareBracket */);
                _registerLabel(93 /* KeyCode.Backslash */, 92 /* CharCode.Backslash */);
                _registerLabel(94 /* KeyCode.BracketRight */, 93 /* CharCode.CloseSquareBracket */);
                _registerLabel(95 /* KeyCode.Quote */, 39 /* CharCode.SingleQuote */);
            }
        }
        dumpDebugInfo() {
            const result = [];
            const immutableSamples = [
                88 /* ScanCode.ArrowUp */,
                104 /* ScanCode.Numpad0 */
            ];
            let cnt = 0;
            result.push(`-----------------------------------------------------------------------------------------------------------------------------------------`);
            for (let scanCode = 0 /* ScanCode.None */; scanCode < 193 /* ScanCode.MAX_VALUE */; scanCode++) {
                if (keyCodes_1.$tq[scanCode] !== -1 /* KeyCode.DependsOnKbLayout */) {
                    if (immutableSamples.indexOf(scanCode) === -1) {
                        continue;
                    }
                }
                if (cnt % 6 === 0) {
                    result.push(`|       HW Code combination      |  Key  |    KeyCode combination    |          UI label         |        User settings       | WYSIWYG |`);
                    result.push(`-----------------------------------------------------------------------------------------------------------------------------------------`);
                }
                cnt++;
                const mapping = this.b[scanCode];
                const strCode = keyCodes_1.$sq.toString(scanCode);
                const mods = [0b000, 0b010, 0b101, 0b111];
                for (const mod of mods) {
                    const ctrlKey = (mod & 0b001) ? true : false;
                    const shiftKey = (mod & 0b010) ? true : false;
                    const altKey = (mod & 0b100) ? true : false;
                    const scanCodeChord = new keybindings_1.$zq(ctrlKey, shiftKey, altKey, false, scanCode);
                    const keyCodeChord = this.j(scanCodeChord);
                    const strKeyCode = (keyCodeChord ? keyCodes_1.KeyCodeUtils.toString(keyCodeChord.keyCode) : null);
                    const resolvedKb = (keyCodeChord ? new $_Db(this, [keyCodeChord]) : null);
                    const outScanCode = `${ctrlKey ? 'Ctrl+' : ''}${shiftKey ? 'Shift+' : ''}${altKey ? 'Alt+' : ''}${strCode}`;
                    const ariaLabel = (resolvedKb ? resolvedKb.getAriaLabel() : null);
                    const outUILabel = (ariaLabel ? ariaLabel.replace(/Control\+/, 'Ctrl+') : null);
                    const outUserSettings = (resolvedKb ? resolvedKb.getUserSettingsLabel() : null);
                    const outKey = $_Db.getProducedChar(scanCodeChord, mapping);
                    const outKb = (strKeyCode ? `${ctrlKey ? 'Ctrl+' : ''}${shiftKey ? 'Shift+' : ''}${altKey ? 'Alt+' : ''}${strKeyCode}` : null);
                    const isWYSIWYG = (resolvedKb ? resolvedKb.isWYSIWYG() : false);
                    const outWYSIWYG = (isWYSIWYG ? '       ' : '   NO  ');
                    result.push(`| ${this.h(outScanCode, 30)} | ${outKey} | ${this.h(outKb, 25)} | ${this.h(outUILabel, 25)} |  ${this.h(outUserSettings, 25)} | ${outWYSIWYG} |`);
                }
                result.push(`-----------------------------------------------------------------------------------------------------------------------------------------`);
            }
            return result.join('\n');
        }
        h(str, cnt) {
            if (str === null) {
                str = 'null';
            }
            while (str.length < cnt) {
                str = ' ' + str;
            }
            return str;
        }
        getUILabelForKeyCode(keyCode) {
            return this.i(keyCode);
        }
        getAriaLabelForKeyCode(keyCode) {
            return this.i(keyCode);
        }
        getUserSettingsLabelForKeyCode(keyCode) {
            if (this.f) {
                return keyCodes_1.KeyCodeUtils.toUserSettingsUS(keyCode);
            }
            return keyCodes_1.KeyCodeUtils.toUserSettingsGeneral(keyCode);
        }
        getElectronAcceleratorForKeyBinding(chord) {
            return keyCodes_1.KeyCodeUtils.toElectronAccelerator(chord.keyCode);
        }
        i(keyCode) {
            return this.d[keyCode] || keyCodes_1.KeyCodeUtils.toString(0 /* KeyCode.Unknown */);
        }
        resolveKeyboardEvent(keyboardEvent) {
            const ctrlKey = keyboardEvent.ctrlKey || (this.g && keyboardEvent.altGraphKey);
            const altKey = keyboardEvent.altKey || (this.g && keyboardEvent.altGraphKey);
            const chord = new keybindings_1.$yq(ctrlKey, keyboardEvent.shiftKey, altKey, keyboardEvent.metaKey, keyboardEvent.keyCode);
            return new $_Db(this, [chord]);
        }
        j(chord) {
            if (!chord) {
                return null;
            }
            if (chord instanceof keybindings_1.$yq) {
                if (!this.e[chord.keyCode]) {
                    return null;
                }
                return chord;
            }
            const keyCode = this.c[chord.scanCode] || 0 /* KeyCode.Unknown */;
            if (keyCode === 0 /* KeyCode.Unknown */ || !this.e[keyCode]) {
                return null;
            }
            return new keybindings_1.$yq(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, keyCode);
        }
        resolveKeybinding(keybinding) {
            const chords = (0, resolvedKeybindingItem_1.$YD)(keybinding.chords.map(chord => this.j(chord)));
            if (chords.length > 0) {
                return [new $_Db(this, chords)];
            }
            return [];
        }
    }
    exports.$aEb = $aEb;
});
//# sourceMappingURL=windowsKeyboardMapper.js.map