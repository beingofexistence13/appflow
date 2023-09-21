/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/keybindings", "vs/platform/keybinding/common/baseResolvedKeybinding"], function (require, exports, keyCodes_1, keybindings_1, baseResolvedKeybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$q3b = exports.$p3b = void 0;
    /**
     * A map from character to key codes.
     * e.g. Contains entries such as:
     *  - '/' => { keyCode: KeyCode.US_SLASH, shiftKey: false }
     *  - '?' => { keyCode: KeyCode.US_SLASH, shiftKey: true }
     */
    const CHAR_CODE_TO_KEY_CODE = [];
    class $p3b extends baseResolvedKeybinding_1.$$Db {
        constructor(mapper, os, chords) {
            super(os, chords);
            this.p = mapper;
        }
        f(chord) {
            return this.p.getUILabelForScanCodeChord(chord);
        }
        g(chord) {
            return this.p.getAriaLabelForScanCodeChord(chord);
        }
        h(chord) {
            return this.p.getElectronAcceleratorLabelForScanCodeChord(chord);
        }
        l(chord) {
            return this.p.getUserSettingsLabelForScanCodeChord(chord);
        }
        m(binding) {
            if (!binding) {
                return true;
            }
            if (keyCodes_1.$tq[binding.scanCode] !== -1 /* KeyCode.DependsOnKbLayout */) {
                return true;
            }
            const a = this.p.getAriaLabelForScanCodeChord(binding);
            const b = this.p.getUserSettingsLabelForScanCodeChord(binding);
            if (!a && !b) {
                return true;
            }
            if (!a || !b) {
                return false;
            }
            return (a.toLowerCase() === b.toLowerCase());
        }
        n(chord) {
            return this.p.getDispatchStrForScanCodeChord(chord);
        }
        o(chord) {
            if ((chord.scanCode === 157 /* ScanCode.ControlLeft */ || chord.scanCode === 161 /* ScanCode.ControlRight */) && !chord.shiftKey && !chord.altKey && !chord.metaKey) {
                return 'ctrl';
            }
            if ((chord.scanCode === 159 /* ScanCode.AltLeft */ || chord.scanCode === 163 /* ScanCode.AltRight */) && !chord.ctrlKey && !chord.shiftKey && !chord.metaKey) {
                return 'alt';
            }
            if ((chord.scanCode === 158 /* ScanCode.ShiftLeft */ || chord.scanCode === 162 /* ScanCode.ShiftRight */) && !chord.ctrlKey && !chord.altKey && !chord.metaKey) {
                return 'shift';
            }
            if ((chord.scanCode === 160 /* ScanCode.MetaLeft */ || chord.scanCode === 164 /* ScanCode.MetaRight */) && !chord.ctrlKey && !chord.shiftKey && !chord.altKey) {
                return 'meta';
            }
            return null;
        }
    }
    exports.$p3b = $p3b;
    class ScanCodeCombo {
        constructor(ctrlKey, shiftKey, altKey, scanCode) {
            this.ctrlKey = ctrlKey;
            this.shiftKey = shiftKey;
            this.altKey = altKey;
            this.scanCode = scanCode;
        }
        toString() {
            return `${this.ctrlKey ? 'Ctrl+' : ''}${this.shiftKey ? 'Shift+' : ''}${this.altKey ? 'Alt+' : ''}${keyCodes_1.$sq.toString(this.scanCode)}`;
        }
        equals(other) {
            return (this.ctrlKey === other.ctrlKey
                && this.shiftKey === other.shiftKey
                && this.altKey === other.altKey
                && this.scanCode === other.scanCode);
        }
        c(mapping) {
            if (!mapping) {
                return '';
            }
            if (this.ctrlKey && this.shiftKey && this.altKey) {
                return mapping.withShiftAltGr;
            }
            if (this.ctrlKey && this.altKey) {
                return mapping.withAltGr;
            }
            if (this.shiftKey) {
                return mapping.withShift;
            }
            return mapping.value;
        }
        getProducedChar(mapping) {
            const charCode = $q3b.getCharCode(this.c(mapping));
            if (charCode === 0) {
                return ' --- ';
            }
            if (charCode >= 768 /* CharCode.U_Combining_Grave_Accent */ && charCode <= 879 /* CharCode.U_Combining_Latin_Small_Letter_X */) {
                // combining
                return 'U+' + charCode.toString(16);
            }
            return '  ' + String.fromCharCode(charCode) + '  ';
        }
    }
    class KeyCodeCombo {
        constructor(ctrlKey, shiftKey, altKey, keyCode) {
            this.ctrlKey = ctrlKey;
            this.shiftKey = shiftKey;
            this.altKey = altKey;
            this.keyCode = keyCode;
        }
        toString() {
            return `${this.ctrlKey ? 'Ctrl+' : ''}${this.shiftKey ? 'Shift+' : ''}${this.altKey ? 'Alt+' : ''}${keyCodes_1.KeyCodeUtils.toString(this.keyCode)}`;
        }
    }
    class ScanCodeKeyCodeMapper {
        constructor() {
            /**
             * ScanCode combination => KeyCode combination.
             * Only covers relevant modifiers ctrl, shift, alt (since meta does not influence the mappings).
             */
            this.c = [];
            /**
             * inverse of `_scanCodeToKeyCode`.
             * KeyCode combination => ScanCode combination.
             * Only covers relevant modifiers ctrl, shift, alt (since meta does not influence the mappings).
             */
            this.d = [];
            this.c = [];
            this.d = [];
        }
        registrationComplete() {
            // IntlHash and IntlBackslash are rare keys, so ensure they don't end up being the preferred...
            this.e(56 /* ScanCode.IntlHash */);
            this.e(106 /* ScanCode.IntlBackslash */);
        }
        e(scanCode) {
            for (let mod = 0; mod < 8; mod++) {
                const encodedKeyCodeCombos = this.c[(scanCode << 3) + mod];
                if (!encodedKeyCodeCombos) {
                    continue;
                }
                for (let i = 0, len = encodedKeyCodeCombos.length; i < len; i++) {
                    const encodedScanCodeCombos = this.d[encodedKeyCodeCombos[i]];
                    if (encodedScanCodeCombos.length === 1) {
                        continue;
                    }
                    for (let j = 0, len = encodedScanCodeCombos.length; j < len; j++) {
                        const entry = encodedScanCodeCombos[j];
                        const entryScanCode = (entry >>> 3);
                        if (entryScanCode === scanCode) {
                            // Move this entry to the end
                            for (let k = j + 1; k < len; k++) {
                                encodedScanCodeCombos[k - 1] = encodedScanCodeCombos[k];
                            }
                            encodedScanCodeCombos[len - 1] = entry;
                        }
                    }
                }
            }
        }
        registerIfUnknown(scanCodeCombo, keyCodeCombo) {
            if (keyCodeCombo.keyCode === 0 /* KeyCode.Unknown */) {
                return;
            }
            const scanCodeComboEncoded = this.f(scanCodeCombo);
            const keyCodeComboEncoded = this.g(keyCodeCombo);
            const keyCodeIsDigit = (keyCodeCombo.keyCode >= 21 /* KeyCode.Digit0 */ && keyCodeCombo.keyCode <= 30 /* KeyCode.Digit9 */);
            const keyCodeIsLetter = (keyCodeCombo.keyCode >= 31 /* KeyCode.KeyA */ && keyCodeCombo.keyCode <= 56 /* KeyCode.KeyZ */);
            const existingKeyCodeCombos = this.c[scanCodeComboEncoded];
            // Allow a scan code to map to multiple key codes if it is a digit or a letter key code
            if (keyCodeIsDigit || keyCodeIsLetter) {
                // Only check that we don't insert the same entry twice
                if (existingKeyCodeCombos) {
                    for (let i = 0, len = existingKeyCodeCombos.length; i < len; i++) {
                        if (existingKeyCodeCombos[i] === keyCodeComboEncoded) {
                            // avoid duplicates
                            return;
                        }
                    }
                }
            }
            else {
                // Don't allow multiples
                if (existingKeyCodeCombos && existingKeyCodeCombos.length !== 0) {
                    return;
                }
            }
            this.c[scanCodeComboEncoded] = this.c[scanCodeComboEncoded] || [];
            this.c[scanCodeComboEncoded].unshift(keyCodeComboEncoded);
            this.d[keyCodeComboEncoded] = this.d[keyCodeComboEncoded] || [];
            this.d[keyCodeComboEncoded].unshift(scanCodeComboEncoded);
        }
        lookupKeyCodeCombo(keyCodeCombo) {
            const keyCodeComboEncoded = this.g(keyCodeCombo);
            const scanCodeCombosEncoded = this.d[keyCodeComboEncoded];
            if (!scanCodeCombosEncoded || scanCodeCombosEncoded.length === 0) {
                return [];
            }
            const result = [];
            for (let i = 0, len = scanCodeCombosEncoded.length; i < len; i++) {
                const scanCodeComboEncoded = scanCodeCombosEncoded[i];
                const ctrlKey = (scanCodeComboEncoded & 0b001) ? true : false;
                const shiftKey = (scanCodeComboEncoded & 0b010) ? true : false;
                const altKey = (scanCodeComboEncoded & 0b100) ? true : false;
                const scanCode = (scanCodeComboEncoded >>> 3);
                result[i] = new ScanCodeCombo(ctrlKey, shiftKey, altKey, scanCode);
            }
            return result;
        }
        lookupScanCodeCombo(scanCodeCombo) {
            const scanCodeComboEncoded = this.f(scanCodeCombo);
            const keyCodeCombosEncoded = this.c[scanCodeComboEncoded];
            if (!keyCodeCombosEncoded || keyCodeCombosEncoded.length === 0) {
                return [];
            }
            const result = [];
            for (let i = 0, len = keyCodeCombosEncoded.length; i < len; i++) {
                const keyCodeComboEncoded = keyCodeCombosEncoded[i];
                const ctrlKey = (keyCodeComboEncoded & 0b001) ? true : false;
                const shiftKey = (keyCodeComboEncoded & 0b010) ? true : false;
                const altKey = (keyCodeComboEncoded & 0b100) ? true : false;
                const keyCode = (keyCodeComboEncoded >>> 3);
                result[i] = new KeyCodeCombo(ctrlKey, shiftKey, altKey, keyCode);
            }
            return result;
        }
        guessStableKeyCode(scanCode) {
            if (scanCode >= 36 /* ScanCode.Digit1 */ && scanCode <= 45 /* ScanCode.Digit0 */) {
                // digits are ok
                switch (scanCode) {
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
                }
            }
            // Lookup the scanCode with and without shift and see if the keyCode is stable
            const keyCodeCombos1 = this.lookupScanCodeCombo(new ScanCodeCombo(false, false, false, scanCode));
            const keyCodeCombos2 = this.lookupScanCodeCombo(new ScanCodeCombo(false, true, false, scanCode));
            if (keyCodeCombos1.length === 1 && keyCodeCombos2.length === 1) {
                const shiftKey1 = keyCodeCombos1[0].shiftKey;
                const keyCode1 = keyCodeCombos1[0].keyCode;
                const shiftKey2 = keyCodeCombos2[0].shiftKey;
                const keyCode2 = keyCodeCombos2[0].keyCode;
                if (keyCode1 === keyCode2 && shiftKey1 !== shiftKey2) {
                    // This looks like a stable mapping
                    return keyCode1;
                }
            }
            return -1 /* KeyCode.DependsOnKbLayout */;
        }
        f(scanCodeCombo) {
            return this.h(scanCodeCombo.ctrlKey, scanCodeCombo.shiftKey, scanCodeCombo.altKey, scanCodeCombo.scanCode);
        }
        g(keyCodeCombo) {
            return this.h(keyCodeCombo.ctrlKey, keyCodeCombo.shiftKey, keyCodeCombo.altKey, keyCodeCombo.keyCode);
        }
        h(ctrlKey, shiftKey, altKey, principal) {
            return (((ctrlKey ? 1 : 0) << 0)
                | ((shiftKey ? 1 : 0) << 1)
                | ((altKey ? 1 : 0) << 2)
                | principal << 3) >>> 0;
        }
    }
    class $q3b {
        constructor(g, rawMappings, h, l) {
            this.g = g;
            this.h = h;
            this.l = l;
            /**
             * UI label for a ScanCode.
             */
            this.e = [];
            /**
             * Dispatching string for a ScanCode.
             */
            this.f = [];
            this.c = [];
            this.d = new ScanCodeKeyCodeMapper();
            this.e = [];
            this.f = [];
            const _registerIfUnknown = (hwCtrlKey, hwShiftKey, hwAltKey, scanCode, kbCtrlKey, kbShiftKey, kbAltKey, keyCode) => {
                this.d.registerIfUnknown(new ScanCodeCombo(hwCtrlKey ? true : false, hwShiftKey ? true : false, hwAltKey ? true : false, scanCode), new KeyCodeCombo(kbCtrlKey ? true : false, kbShiftKey ? true : false, kbAltKey ? true : false, keyCode));
            };
            const _registerAllCombos = (_ctrlKey, _shiftKey, _altKey, scanCode, keyCode) => {
                for (let ctrlKey = _ctrlKey; ctrlKey <= 1; ctrlKey++) {
                    for (let shiftKey = _shiftKey; shiftKey <= 1; shiftKey++) {
                        for (let altKey = _altKey; altKey <= 1; altKey++) {
                            _registerIfUnknown(ctrlKey, shiftKey, altKey, scanCode, ctrlKey, shiftKey, altKey, keyCode);
                        }
                    }
                }
            };
            // Initialize `_scanCodeToLabel`
            for (let scanCode = 0 /* ScanCode.None */; scanCode < 193 /* ScanCode.MAX_VALUE */; scanCode++) {
                this.e[scanCode] = null;
            }
            // Initialize `_scanCodeToDispatch`
            for (let scanCode = 0 /* ScanCode.None */; scanCode < 193 /* ScanCode.MAX_VALUE */; scanCode++) {
                this.f[scanCode] = null;
            }
            // Handle immutable mappings
            for (let scanCode = 0 /* ScanCode.None */; scanCode < 193 /* ScanCode.MAX_VALUE */; scanCode++) {
                const keyCode = keyCodes_1.$tq[scanCode];
                if (keyCode !== -1 /* KeyCode.DependsOnKbLayout */) {
                    _registerAllCombos(0, 0, 0, scanCode, keyCode);
                    this.e[scanCode] = keyCodes_1.KeyCodeUtils.toString(keyCode);
                    if (keyCode === 0 /* KeyCode.Unknown */ || keyCode === 5 /* KeyCode.Ctrl */ || keyCode === 57 /* KeyCode.Meta */ || keyCode === 6 /* KeyCode.Alt */ || keyCode === 4 /* KeyCode.Shift */) {
                        this.f[scanCode] = null; // cannot dispatch on this ScanCode
                    }
                    else {
                        this.f[scanCode] = `[${keyCodes_1.$sq.toString(scanCode)}]`;
                    }
                }
            }
            // Try to identify keyboard layouts where characters A-Z are missing
            // and forcibly map them to their corresponding scan codes if that is the case
            const missingLatinLettersOverride = {};
            {
                const producesLatinLetter = [];
                for (const strScanCode in rawMappings) {
                    if (rawMappings.hasOwnProperty(strScanCode)) {
                        const scanCode = keyCodes_1.$sq.toEnum(strScanCode);
                        if (scanCode === 0 /* ScanCode.None */) {
                            continue;
                        }
                        if (keyCodes_1.$tq[scanCode] !== -1 /* KeyCode.DependsOnKbLayout */) {
                            continue;
                        }
                        const rawMapping = rawMappings[strScanCode];
                        const value = $q3b.getCharCode(rawMapping.value);
                        if (value >= 97 /* CharCode.a */ && value <= 122 /* CharCode.z */) {
                            const upperCaseValue = 65 /* CharCode.A */ + (value - 97 /* CharCode.a */);
                            producesLatinLetter[upperCaseValue] = true;
                        }
                    }
                }
                const _registerLetterIfMissing = (charCode, scanCode, value, withShift) => {
                    if (!producesLatinLetter[charCode]) {
                        missingLatinLettersOverride[keyCodes_1.$sq.toString(scanCode)] = {
                            value: value,
                            withShift: withShift,
                            withAltGr: '',
                            withShiftAltGr: ''
                        };
                    }
                };
                // Ensure letters are mapped
                _registerLetterIfMissing(65 /* CharCode.A */, 10 /* ScanCode.KeyA */, 'a', 'A');
                _registerLetterIfMissing(66 /* CharCode.B */, 11 /* ScanCode.KeyB */, 'b', 'B');
                _registerLetterIfMissing(67 /* CharCode.C */, 12 /* ScanCode.KeyC */, 'c', 'C');
                _registerLetterIfMissing(68 /* CharCode.D */, 13 /* ScanCode.KeyD */, 'd', 'D');
                _registerLetterIfMissing(69 /* CharCode.E */, 14 /* ScanCode.KeyE */, 'e', 'E');
                _registerLetterIfMissing(70 /* CharCode.F */, 15 /* ScanCode.KeyF */, 'f', 'F');
                _registerLetterIfMissing(71 /* CharCode.G */, 16 /* ScanCode.KeyG */, 'g', 'G');
                _registerLetterIfMissing(72 /* CharCode.H */, 17 /* ScanCode.KeyH */, 'h', 'H');
                _registerLetterIfMissing(73 /* CharCode.I */, 18 /* ScanCode.KeyI */, 'i', 'I');
                _registerLetterIfMissing(74 /* CharCode.J */, 19 /* ScanCode.KeyJ */, 'j', 'J');
                _registerLetterIfMissing(75 /* CharCode.K */, 20 /* ScanCode.KeyK */, 'k', 'K');
                _registerLetterIfMissing(76 /* CharCode.L */, 21 /* ScanCode.KeyL */, 'l', 'L');
                _registerLetterIfMissing(77 /* CharCode.M */, 22 /* ScanCode.KeyM */, 'm', 'M');
                _registerLetterIfMissing(78 /* CharCode.N */, 23 /* ScanCode.KeyN */, 'n', 'N');
                _registerLetterIfMissing(79 /* CharCode.O */, 24 /* ScanCode.KeyO */, 'o', 'O');
                _registerLetterIfMissing(80 /* CharCode.P */, 25 /* ScanCode.KeyP */, 'p', 'P');
                _registerLetterIfMissing(81 /* CharCode.Q */, 26 /* ScanCode.KeyQ */, 'q', 'Q');
                _registerLetterIfMissing(82 /* CharCode.R */, 27 /* ScanCode.KeyR */, 'r', 'R');
                _registerLetterIfMissing(83 /* CharCode.S */, 28 /* ScanCode.KeyS */, 's', 'S');
                _registerLetterIfMissing(84 /* CharCode.T */, 29 /* ScanCode.KeyT */, 't', 'T');
                _registerLetterIfMissing(85 /* CharCode.U */, 30 /* ScanCode.KeyU */, 'u', 'U');
                _registerLetterIfMissing(86 /* CharCode.V */, 31 /* ScanCode.KeyV */, 'v', 'V');
                _registerLetterIfMissing(87 /* CharCode.W */, 32 /* ScanCode.KeyW */, 'w', 'W');
                _registerLetterIfMissing(88 /* CharCode.X */, 33 /* ScanCode.KeyX */, 'x', 'X');
                _registerLetterIfMissing(89 /* CharCode.Y */, 34 /* ScanCode.KeyY */, 'y', 'Y');
                _registerLetterIfMissing(90 /* CharCode.Z */, 35 /* ScanCode.KeyZ */, 'z', 'Z');
            }
            const mappings = [];
            let mappingsLen = 0;
            for (const strScanCode in rawMappings) {
                if (rawMappings.hasOwnProperty(strScanCode)) {
                    const scanCode = keyCodes_1.$sq.toEnum(strScanCode);
                    if (scanCode === 0 /* ScanCode.None */) {
                        continue;
                    }
                    if (keyCodes_1.$tq[scanCode] !== -1 /* KeyCode.DependsOnKbLayout */) {
                        continue;
                    }
                    this.c[scanCode] = rawMappings[strScanCode];
                    const rawMapping = missingLatinLettersOverride[strScanCode] || rawMappings[strScanCode];
                    const value = $q3b.getCharCode(rawMapping.value);
                    const withShift = $q3b.getCharCode(rawMapping.withShift);
                    const withAltGr = $q3b.getCharCode(rawMapping.withAltGr);
                    const withShiftAltGr = $q3b.getCharCode(rawMapping.withShiftAltGr);
                    const mapping = {
                        scanCode: scanCode,
                        value: value,
                        withShift: withShift,
                        withAltGr: withAltGr,
                        withShiftAltGr: withShiftAltGr,
                    };
                    mappings[mappingsLen++] = mapping;
                    this.f[scanCode] = `[${keyCodes_1.$sq.toString(scanCode)}]`;
                    if (value >= 97 /* CharCode.a */ && value <= 122 /* CharCode.z */) {
                        const upperCaseValue = 65 /* CharCode.A */ + (value - 97 /* CharCode.a */);
                        this.e[scanCode] = String.fromCharCode(upperCaseValue);
                    }
                    else if (value >= 65 /* CharCode.A */ && value <= 90 /* CharCode.Z */) {
                        this.e[scanCode] = String.fromCharCode(value);
                    }
                    else if (value) {
                        this.e[scanCode] = String.fromCharCode(value);
                    }
                    else {
                        this.e[scanCode] = null;
                    }
                }
            }
            // Handle all `withShiftAltGr` entries
            for (let i = mappings.length - 1; i >= 0; i--) {
                const mapping = mappings[i];
                const scanCode = mapping.scanCode;
                const withShiftAltGr = mapping.withShiftAltGr;
                if (withShiftAltGr === mapping.withAltGr || withShiftAltGr === mapping.withShift || withShiftAltGr === mapping.value) {
                    // handled below
                    continue;
                }
                const kb = $q3b.r(withShiftAltGr);
                if (!kb) {
                    continue;
                }
                const kbShiftKey = kb.shiftKey;
                const keyCode = kb.keyCode;
                if (kbShiftKey) {
                    // Ctrl+Shift+Alt+ScanCode => Shift+KeyCode
                    _registerIfUnknown(1, 1, 1, scanCode, 0, 1, 0, keyCode); //       Ctrl+Alt+ScanCode =>          Shift+KeyCode
                }
                else {
                    // Ctrl+Shift+Alt+ScanCode => KeyCode
                    _registerIfUnknown(1, 1, 1, scanCode, 0, 0, 0, keyCode); //       Ctrl+Alt+ScanCode =>                KeyCode
                }
            }
            // Handle all `withAltGr` entries
            for (let i = mappings.length - 1; i >= 0; i--) {
                const mapping = mappings[i];
                const scanCode = mapping.scanCode;
                const withAltGr = mapping.withAltGr;
                if (withAltGr === mapping.withShift || withAltGr === mapping.value) {
                    // handled below
                    continue;
                }
                const kb = $q3b.r(withAltGr);
                if (!kb) {
                    continue;
                }
                const kbShiftKey = kb.shiftKey;
                const keyCode = kb.keyCode;
                if (kbShiftKey) {
                    // Ctrl+Alt+ScanCode => Shift+KeyCode
                    _registerIfUnknown(1, 0, 1, scanCode, 0, 1, 0, keyCode); //       Ctrl+Alt+ScanCode =>          Shift+KeyCode
                }
                else {
                    // Ctrl+Alt+ScanCode => KeyCode
                    _registerIfUnknown(1, 0, 1, scanCode, 0, 0, 0, keyCode); //       Ctrl+Alt+ScanCode =>                KeyCode
                }
            }
            // Handle all `withShift` entries
            for (let i = mappings.length - 1; i >= 0; i--) {
                const mapping = mappings[i];
                const scanCode = mapping.scanCode;
                const withShift = mapping.withShift;
                if (withShift === mapping.value) {
                    // handled below
                    continue;
                }
                const kb = $q3b.r(withShift);
                if (!kb) {
                    continue;
                }
                const kbShiftKey = kb.shiftKey;
                const keyCode = kb.keyCode;
                if (kbShiftKey) {
                    // Shift+ScanCode => Shift+KeyCode
                    _registerIfUnknown(0, 1, 0, scanCode, 0, 1, 0, keyCode); //          Shift+ScanCode =>          Shift+KeyCode
                    _registerIfUnknown(0, 1, 1, scanCode, 0, 1, 1, keyCode); //      Shift+Alt+ScanCode =>      Shift+Alt+KeyCode
                    _registerIfUnknown(1, 1, 0, scanCode, 1, 1, 0, keyCode); //     Ctrl+Shift+ScanCode =>     Ctrl+Shift+KeyCode
                    _registerIfUnknown(1, 1, 1, scanCode, 1, 1, 1, keyCode); // Ctrl+Shift+Alt+ScanCode => Ctrl+Shift+Alt+KeyCode
                }
                else {
                    // Shift+ScanCode => KeyCode
                    _registerIfUnknown(0, 1, 0, scanCode, 0, 0, 0, keyCode); //          Shift+ScanCode =>                KeyCode
                    _registerIfUnknown(0, 1, 0, scanCode, 0, 1, 0, keyCode); //          Shift+ScanCode =>          Shift+KeyCode
                    _registerIfUnknown(0, 1, 1, scanCode, 0, 0, 1, keyCode); //      Shift+Alt+ScanCode =>            Alt+KeyCode
                    _registerIfUnknown(0, 1, 1, scanCode, 0, 1, 1, keyCode); //      Shift+Alt+ScanCode =>      Shift+Alt+KeyCode
                    _registerIfUnknown(1, 1, 0, scanCode, 1, 0, 0, keyCode); //     Ctrl+Shift+ScanCode =>           Ctrl+KeyCode
                    _registerIfUnknown(1, 1, 0, scanCode, 1, 1, 0, keyCode); //     Ctrl+Shift+ScanCode =>     Ctrl+Shift+KeyCode
                    _registerIfUnknown(1, 1, 1, scanCode, 1, 0, 1, keyCode); // Ctrl+Shift+Alt+ScanCode =>       Ctrl+Alt+KeyCode
                    _registerIfUnknown(1, 1, 1, scanCode, 1, 1, 1, keyCode); // Ctrl+Shift+Alt+ScanCode => Ctrl+Shift+Alt+KeyCode
                }
            }
            // Handle all `value` entries
            for (let i = mappings.length - 1; i >= 0; i--) {
                const mapping = mappings[i];
                const scanCode = mapping.scanCode;
                const kb = $q3b.r(mapping.value);
                if (!kb) {
                    continue;
                }
                const kbShiftKey = kb.shiftKey;
                const keyCode = kb.keyCode;
                if (kbShiftKey) {
                    // ScanCode => Shift+KeyCode
                    _registerIfUnknown(0, 0, 0, scanCode, 0, 1, 0, keyCode); //                ScanCode =>          Shift+KeyCode
                    _registerIfUnknown(0, 0, 1, scanCode, 0, 1, 1, keyCode); //            Alt+ScanCode =>      Shift+Alt+KeyCode
                    _registerIfUnknown(1, 0, 0, scanCode, 1, 1, 0, keyCode); //           Ctrl+ScanCode =>     Ctrl+Shift+KeyCode
                    _registerIfUnknown(1, 0, 1, scanCode, 1, 1, 1, keyCode); //       Ctrl+Alt+ScanCode => Ctrl+Shift+Alt+KeyCode
                }
                else {
                    // ScanCode => KeyCode
                    _registerIfUnknown(0, 0, 0, scanCode, 0, 0, 0, keyCode); //                ScanCode =>                KeyCode
                    _registerIfUnknown(0, 0, 1, scanCode, 0, 0, 1, keyCode); //            Alt+ScanCode =>            Alt+KeyCode
                    _registerIfUnknown(0, 1, 0, scanCode, 0, 1, 0, keyCode); //          Shift+ScanCode =>          Shift+KeyCode
                    _registerIfUnknown(0, 1, 1, scanCode, 0, 1, 1, keyCode); //      Shift+Alt+ScanCode =>      Shift+Alt+KeyCode
                    _registerIfUnknown(1, 0, 0, scanCode, 1, 0, 0, keyCode); //           Ctrl+ScanCode =>           Ctrl+KeyCode
                    _registerIfUnknown(1, 0, 1, scanCode, 1, 0, 1, keyCode); //       Ctrl+Alt+ScanCode =>       Ctrl+Alt+KeyCode
                    _registerIfUnknown(1, 1, 0, scanCode, 1, 1, 0, keyCode); //     Ctrl+Shift+ScanCode =>     Ctrl+Shift+KeyCode
                    _registerIfUnknown(1, 1, 1, scanCode, 1, 1, 1, keyCode); // Ctrl+Shift+Alt+ScanCode => Ctrl+Shift+Alt+KeyCode
                }
            }
            // Handle all left-over available digits
            _registerAllCombos(0, 0, 0, 36 /* ScanCode.Digit1 */, 22 /* KeyCode.Digit1 */);
            _registerAllCombos(0, 0, 0, 37 /* ScanCode.Digit2 */, 23 /* KeyCode.Digit2 */);
            _registerAllCombos(0, 0, 0, 38 /* ScanCode.Digit3 */, 24 /* KeyCode.Digit3 */);
            _registerAllCombos(0, 0, 0, 39 /* ScanCode.Digit4 */, 25 /* KeyCode.Digit4 */);
            _registerAllCombos(0, 0, 0, 40 /* ScanCode.Digit5 */, 26 /* KeyCode.Digit5 */);
            _registerAllCombos(0, 0, 0, 41 /* ScanCode.Digit6 */, 27 /* KeyCode.Digit6 */);
            _registerAllCombos(0, 0, 0, 42 /* ScanCode.Digit7 */, 28 /* KeyCode.Digit7 */);
            _registerAllCombos(0, 0, 0, 43 /* ScanCode.Digit8 */, 29 /* KeyCode.Digit8 */);
            _registerAllCombos(0, 0, 0, 44 /* ScanCode.Digit9 */, 30 /* KeyCode.Digit9 */);
            _registerAllCombos(0, 0, 0, 45 /* ScanCode.Digit0 */, 21 /* KeyCode.Digit0 */);
            this.d.registrationComplete();
        }
        dumpDebugInfo() {
            const result = [];
            const immutableSamples = [
                88 /* ScanCode.ArrowUp */,
                104 /* ScanCode.Numpad0 */
            ];
            let cnt = 0;
            result.push(`isUSStandard: ${this.g}`);
            result.push(`----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------`);
            for (let scanCode = 0 /* ScanCode.None */; scanCode < 193 /* ScanCode.MAX_VALUE */; scanCode++) {
                if (keyCodes_1.$tq[scanCode] !== -1 /* KeyCode.DependsOnKbLayout */) {
                    if (immutableSamples.indexOf(scanCode) === -1) {
                        continue;
                    }
                }
                if (cnt % 4 === 0) {
                    result.push(`|       HW Code combination      |  Key  |    KeyCode combination    | Pri |          UI label         |         User settings          |    Electron accelerator   |       Dispatching string       | WYSIWYG |`);
                    result.push(`----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------`);
                }
                cnt++;
                const mapping = this.c[scanCode];
                for (let mod = 0; mod < 8; mod++) {
                    const hwCtrlKey = (mod & 0b001) ? true : false;
                    const hwShiftKey = (mod & 0b010) ? true : false;
                    const hwAltKey = (mod & 0b100) ? true : false;
                    const scanCodeCombo = new ScanCodeCombo(hwCtrlKey, hwShiftKey, hwAltKey, scanCode);
                    const resolvedKb = this.resolveKeyboardEvent({
                        _standardKeyboardEventBrand: true,
                        ctrlKey: scanCodeCombo.ctrlKey,
                        shiftKey: scanCodeCombo.shiftKey,
                        altKey: scanCodeCombo.altKey,
                        metaKey: false,
                        altGraphKey: false,
                        keyCode: -1 /* KeyCode.DependsOnKbLayout */,
                        code: keyCodes_1.$sq.toString(scanCode)
                    });
                    const outScanCodeCombo = scanCodeCombo.toString();
                    const outKey = scanCodeCombo.getProducedChar(mapping);
                    const ariaLabel = resolvedKb.getAriaLabel();
                    const outUILabel = (ariaLabel ? ariaLabel.replace(/Control\+/, 'Ctrl+') : null);
                    const outUserSettings = resolvedKb.getUserSettingsLabel();
                    const outElectronAccelerator = resolvedKb.getElectronAccelerator();
                    const outDispatchStr = resolvedKb.getDispatchChords()[0];
                    const isWYSIWYG = (resolvedKb ? resolvedKb.isWYSIWYG() : false);
                    const outWYSIWYG = (isWYSIWYG ? '       ' : '   NO  ');
                    const kbCombos = this.d.lookupScanCodeCombo(scanCodeCombo);
                    if (kbCombos.length === 0) {
                        result.push(`| ${this.m(outScanCodeCombo, 30)} | ${outKey} | ${this.m('', 25)} | ${this.m('', 3)} | ${this.m(outUILabel, 25)} | ${this.m(outUserSettings, 30)} | ${this.m(outElectronAccelerator, 25)} | ${this.m(outDispatchStr, 30)} | ${outWYSIWYG} |`);
                    }
                    else {
                        for (let i = 0, len = kbCombos.length; i < len; i++) {
                            const kbCombo = kbCombos[i];
                            // find out the priority of this scan code for this key code
                            let colPriority;
                            const scanCodeCombos = this.d.lookupKeyCodeCombo(kbCombo);
                            if (scanCodeCombos.length === 1) {
                                // no need for priority, this key code combo maps to precisely this scan code combo
                                colPriority = '';
                            }
                            else {
                                let priority = -1;
                                for (let j = 0; j < scanCodeCombos.length; j++) {
                                    if (scanCodeCombos[j].equals(scanCodeCombo)) {
                                        priority = j + 1;
                                        break;
                                    }
                                }
                                colPriority = String(priority);
                            }
                            const outKeybinding = kbCombo.toString();
                            if (i === 0) {
                                result.push(`| ${this.m(outScanCodeCombo, 30)} | ${outKey} | ${this.m(outKeybinding, 25)} | ${this.m(colPriority, 3)} | ${this.m(outUILabel, 25)} | ${this.m(outUserSettings, 30)} | ${this.m(outElectronAccelerator, 25)} | ${this.m(outDispatchStr, 30)} | ${outWYSIWYG} |`);
                            }
                            else {
                                // secondary keybindings
                                result.push(`| ${this.m('', 30)} |       | ${this.m(outKeybinding, 25)} | ${this.m(colPriority, 3)} | ${this.m('', 25)} | ${this.m('', 30)} | ${this.m('', 25)} | ${this.m('', 30)} |         |`);
                            }
                        }
                    }
                }
                result.push(`----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------`);
            }
            return result.join('\n');
        }
        m(str, cnt) {
            if (str === null) {
                str = 'null';
            }
            while (str.length < cnt) {
                str = ' ' + str;
            }
            return str;
        }
        keyCodeChordToScanCodeChord(chord) {
            // Avoid double Enter bindings (both ScanCode.NumpadEnter and ScanCode.Enter point to KeyCode.Enter)
            if (chord.keyCode === 3 /* KeyCode.Enter */) {
                return [new keybindings_1.$zq(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, 46 /* ScanCode.Enter */)];
            }
            const scanCodeCombos = this.d.lookupKeyCodeCombo(new KeyCodeCombo(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.keyCode));
            const result = [];
            for (let i = 0, len = scanCodeCombos.length; i < len; i++) {
                const scanCodeCombo = scanCodeCombos[i];
                result[i] = new keybindings_1.$zq(scanCodeCombo.ctrlKey, scanCodeCombo.shiftKey, scanCodeCombo.altKey, chord.metaKey, scanCodeCombo.scanCode);
            }
            return result;
        }
        getUILabelForScanCodeChord(chord) {
            if (!chord) {
                return null;
            }
            if (chord.isDuplicateModifierCase()) {
                return '';
            }
            if (this.l === 2 /* OperatingSystem.Macintosh */) {
                switch (chord.scanCode) {
                    case 86 /* ScanCode.ArrowLeft */:
                        return '←';
                    case 88 /* ScanCode.ArrowUp */:
                        return '↑';
                    case 85 /* ScanCode.ArrowRight */:
                        return '→';
                    case 87 /* ScanCode.ArrowDown */:
                        return '↓';
                }
            }
            return this.e[chord.scanCode];
        }
        getAriaLabelForScanCodeChord(chord) {
            if (!chord) {
                return null;
            }
            if (chord.isDuplicateModifierCase()) {
                return '';
            }
            return this.e[chord.scanCode];
        }
        getDispatchStrForScanCodeChord(chord) {
            const codeDispatch = this.f[chord.scanCode];
            if (!codeDispatch) {
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
            result += codeDispatch;
            return result;
        }
        getUserSettingsLabelForScanCodeChord(chord) {
            if (!chord) {
                return null;
            }
            if (chord.isDuplicateModifierCase()) {
                return '';
            }
            const immutableKeyCode = keyCodes_1.$tq[chord.scanCode];
            if (immutableKeyCode !== -1 /* KeyCode.DependsOnKbLayout */) {
                return keyCodes_1.KeyCodeUtils.toUserSettingsUS(immutableKeyCode).toLowerCase();
            }
            // Check if this scanCode always maps to the same keyCode and back
            const constantKeyCode = this.d.guessStableKeyCode(chord.scanCode);
            if (constantKeyCode !== -1 /* KeyCode.DependsOnKbLayout */) {
                // Verify that this is a good key code that can be mapped back to the same scan code
                const reverseChords = this.keyCodeChordToScanCodeChord(new keybindings_1.$yq(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, constantKeyCode));
                for (let i = 0, len = reverseChords.length; i < len; i++) {
                    const reverseChord = reverseChords[i];
                    if (reverseChord.scanCode === chord.scanCode) {
                        return keyCodes_1.KeyCodeUtils.toUserSettingsUS(constantKeyCode).toLowerCase();
                    }
                }
            }
            return this.f[chord.scanCode];
        }
        getElectronAcceleratorLabelForScanCodeChord(chord) {
            if (!chord) {
                return null;
            }
            const immutableKeyCode = keyCodes_1.$tq[chord.scanCode];
            if (immutableKeyCode !== -1 /* KeyCode.DependsOnKbLayout */) {
                return keyCodes_1.KeyCodeUtils.toElectronAccelerator(immutableKeyCode);
            }
            // Check if this scanCode always maps to the same keyCode and back
            const constantKeyCode = this.d.guessStableKeyCode(chord.scanCode);
            if (this.l === 3 /* OperatingSystem.Linux */ && !this.g) {
                // [Electron Accelerators] On Linux, Electron does not handle correctly OEM keys.
                // when using a different keyboard layout than US Standard.
                // See https://github.com/microsoft/vscode/issues/23706
                // See https://github.com/microsoft/vscode/pull/134890#issuecomment-941671791
                const isOEMKey = (constantKeyCode === 85 /* KeyCode.Semicolon */
                    || constantKeyCode === 86 /* KeyCode.Equal */
                    || constantKeyCode === 87 /* KeyCode.Comma */
                    || constantKeyCode === 88 /* KeyCode.Minus */
                    || constantKeyCode === 89 /* KeyCode.Period */
                    || constantKeyCode === 90 /* KeyCode.Slash */
                    || constantKeyCode === 91 /* KeyCode.Backquote */
                    || constantKeyCode === 92 /* KeyCode.BracketLeft */
                    || constantKeyCode === 93 /* KeyCode.Backslash */
                    || constantKeyCode === 94 /* KeyCode.BracketRight */);
                if (isOEMKey) {
                    return null;
                }
            }
            if (constantKeyCode !== -1 /* KeyCode.DependsOnKbLayout */) {
                return keyCodes_1.KeyCodeUtils.toElectronAccelerator(constantKeyCode);
            }
            return null;
        }
        n(chordParts) {
            if (chordParts.length === 0) {
                return [];
            }
            const result = [];
            this.o(chordParts, 0, [], result);
            return result;
        }
        o(chordParts, currentIndex, previousParts, result) {
            const chordPart = chordParts[currentIndex];
            const isFinalIndex = currentIndex === chordParts.length - 1;
            for (let i = 0, len = chordPart.length; i < len; i++) {
                const chords = [...previousParts, chordPart[i]];
                if (isFinalIndex) {
                    result.push(new $p3b(this, this.l, chords));
                }
                else {
                    this.o(chordParts, currentIndex + 1, chords, result);
                }
            }
        }
        resolveKeyboardEvent(keyboardEvent) {
            let code = keyCodes_1.$sq.toEnum(keyboardEvent.code);
            // Treat NumpadEnter as Enter
            if (code === 94 /* ScanCode.NumpadEnter */) {
                code = 46 /* ScanCode.Enter */;
            }
            const keyCode = keyboardEvent.keyCode;
            if ((keyCode === 15 /* KeyCode.LeftArrow */)
                || (keyCode === 16 /* KeyCode.UpArrow */)
                || (keyCode === 17 /* KeyCode.RightArrow */)
                || (keyCode === 18 /* KeyCode.DownArrow */)
                || (keyCode === 20 /* KeyCode.Delete */)
                || (keyCode === 19 /* KeyCode.Insert */)
                || (keyCode === 14 /* KeyCode.Home */)
                || (keyCode === 13 /* KeyCode.End */)
                || (keyCode === 12 /* KeyCode.PageDown */)
                || (keyCode === 11 /* KeyCode.PageUp */)
                || (keyCode === 1 /* KeyCode.Backspace */)) {
                // "Dispatch" on keyCode for these key codes to workaround issues with remote desktoping software
                // where the scan codes appear to be incorrect (see https://github.com/microsoft/vscode/issues/24107)
                const immutableScanCode = keyCodes_1.$uq[keyCode];
                if (immutableScanCode !== -1 /* ScanCode.DependsOnKbLayout */) {
                    code = immutableScanCode;
                }
            }
            else {
                if ((code === 95 /* ScanCode.Numpad1 */)
                    || (code === 96 /* ScanCode.Numpad2 */)
                    || (code === 97 /* ScanCode.Numpad3 */)
                    || (code === 98 /* ScanCode.Numpad4 */)
                    || (code === 99 /* ScanCode.Numpad5 */)
                    || (code === 100 /* ScanCode.Numpad6 */)
                    || (code === 101 /* ScanCode.Numpad7 */)
                    || (code === 102 /* ScanCode.Numpad8 */)
                    || (code === 103 /* ScanCode.Numpad9 */)
                    || (code === 104 /* ScanCode.Numpad0 */)
                    || (code === 105 /* ScanCode.NumpadDecimal */)) {
                    // "Dispatch" on keyCode for all numpad keys in order for NumLock to work correctly
                    if (keyCode >= 0) {
                        const immutableScanCode = keyCodes_1.$uq[keyCode];
                        if (immutableScanCode !== -1 /* ScanCode.DependsOnKbLayout */) {
                            code = immutableScanCode;
                        }
                    }
                }
            }
            const ctrlKey = keyboardEvent.ctrlKey || (this.h && keyboardEvent.altGraphKey);
            const altKey = keyboardEvent.altKey || (this.h && keyboardEvent.altGraphKey);
            const chord = new keybindings_1.$zq(ctrlKey, keyboardEvent.shiftKey, altKey, keyboardEvent.metaKey, code);
            return new $p3b(this, this.l, [chord]);
        }
        p(chord) {
            if (!chord) {
                return [];
            }
            if (chord instanceof keybindings_1.$zq) {
                return [chord];
            }
            return this.keyCodeChordToScanCodeChord(chord);
        }
        resolveKeybinding(keybinding) {
            const chords = keybinding.chords.map(chord => this.p(chord));
            return this.n(chords);
        }
        static q(charCode) {
            switch (charCode) {
                // allow-any-unicode-next-line
                // CJK: 。 「 」 【 】 ； ，
                // map: . [ ] [ ] ; ,
                case 12290 /* CharCode.U_IDEOGRAPHIC_FULL_STOP */: return 46 /* CharCode.Period */;
                case 12300 /* CharCode.U_LEFT_CORNER_BRACKET */: return 91 /* CharCode.OpenSquareBracket */;
                case 12301 /* CharCode.U_RIGHT_CORNER_BRACKET */: return 93 /* CharCode.CloseSquareBracket */;
                case 12304 /* CharCode.U_LEFT_BLACK_LENTICULAR_BRACKET */: return 91 /* CharCode.OpenSquareBracket */;
                case 12305 /* CharCode.U_RIGHT_BLACK_LENTICULAR_BRACKET */: return 93 /* CharCode.CloseSquareBracket */;
                case 65307 /* CharCode.U_FULLWIDTH_SEMICOLON */: return 59 /* CharCode.Semicolon */;
                case 65292 /* CharCode.U_FULLWIDTH_COMMA */: return 44 /* CharCode.Comma */;
            }
            return charCode;
        }
        static r(charCode) {
            charCode = this.q(charCode);
            if (charCode < CHAR_CODE_TO_KEY_CODE.length) {
                return CHAR_CODE_TO_KEY_CODE[charCode];
            }
            return null;
        }
        /**
         * Attempt to map a combining character to a regular one that renders the same way.
         *
         * https://www.compart.com/en/unicode/bidiclass/NSM
         */
        static getCharCode(char) {
            if (char.length === 0) {
                return 0;
            }
            const charCode = char.charCodeAt(0);
            switch (charCode) {
                case 768 /* CharCode.U_Combining_Grave_Accent */: return 96 /* CharCode.U_GRAVE_ACCENT */;
                case 769 /* CharCode.U_Combining_Acute_Accent */: return 180 /* CharCode.U_ACUTE_ACCENT */;
                case 770 /* CharCode.U_Combining_Circumflex_Accent */: return 94 /* CharCode.U_CIRCUMFLEX */;
                case 771 /* CharCode.U_Combining_Tilde */: return 732 /* CharCode.U_SMALL_TILDE */;
                case 772 /* CharCode.U_Combining_Macron */: return 175 /* CharCode.U_MACRON */;
                case 773 /* CharCode.U_Combining_Overline */: return 8254 /* CharCode.U_OVERLINE */;
                case 774 /* CharCode.U_Combining_Breve */: return 728 /* CharCode.U_BREVE */;
                case 775 /* CharCode.U_Combining_Dot_Above */: return 729 /* CharCode.U_DOT_ABOVE */;
                case 776 /* CharCode.U_Combining_Diaeresis */: return 168 /* CharCode.U_DIAERESIS */;
                case 778 /* CharCode.U_Combining_Ring_Above */: return 730 /* CharCode.U_RING_ABOVE */;
                case 779 /* CharCode.U_Combining_Double_Acute_Accent */: return 733 /* CharCode.U_DOUBLE_ACUTE_ACCENT */;
            }
            return charCode;
        }
    }
    exports.$q3b = $q3b;
    (function () {
        function define(charCode, keyCode, shiftKey) {
            for (let i = CHAR_CODE_TO_KEY_CODE.length; i < charCode; i++) {
                CHAR_CODE_TO_KEY_CODE[i] = null;
            }
            CHAR_CODE_TO_KEY_CODE[charCode] = { keyCode: keyCode, shiftKey: shiftKey };
        }
        for (let chCode = 65 /* CharCode.A */; chCode <= 90 /* CharCode.Z */; chCode++) {
            define(chCode, 31 /* KeyCode.KeyA */ + (chCode - 65 /* CharCode.A */), true);
        }
        for (let chCode = 97 /* CharCode.a */; chCode <= 122 /* CharCode.z */; chCode++) {
            define(chCode, 31 /* KeyCode.KeyA */ + (chCode - 97 /* CharCode.a */), false);
        }
        define(59 /* CharCode.Semicolon */, 85 /* KeyCode.Semicolon */, false);
        define(58 /* CharCode.Colon */, 85 /* KeyCode.Semicolon */, true);
        define(61 /* CharCode.Equals */, 86 /* KeyCode.Equal */, false);
        define(43 /* CharCode.Plus */, 86 /* KeyCode.Equal */, true);
        define(44 /* CharCode.Comma */, 87 /* KeyCode.Comma */, false);
        define(60 /* CharCode.LessThan */, 87 /* KeyCode.Comma */, true);
        define(45 /* CharCode.Dash */, 88 /* KeyCode.Minus */, false);
        define(95 /* CharCode.Underline */, 88 /* KeyCode.Minus */, true);
        define(46 /* CharCode.Period */, 89 /* KeyCode.Period */, false);
        define(62 /* CharCode.GreaterThan */, 89 /* KeyCode.Period */, true);
        define(47 /* CharCode.Slash */, 90 /* KeyCode.Slash */, false);
        define(63 /* CharCode.QuestionMark */, 90 /* KeyCode.Slash */, true);
        define(96 /* CharCode.BackTick */, 91 /* KeyCode.Backquote */, false);
        define(126 /* CharCode.Tilde */, 91 /* KeyCode.Backquote */, true);
        define(91 /* CharCode.OpenSquareBracket */, 92 /* KeyCode.BracketLeft */, false);
        define(123 /* CharCode.OpenCurlyBrace */, 92 /* KeyCode.BracketLeft */, true);
        define(92 /* CharCode.Backslash */, 93 /* KeyCode.Backslash */, false);
        define(124 /* CharCode.Pipe */, 93 /* KeyCode.Backslash */, true);
        define(93 /* CharCode.CloseSquareBracket */, 94 /* KeyCode.BracketRight */, false);
        define(125 /* CharCode.CloseCurlyBrace */, 94 /* KeyCode.BracketRight */, true);
        define(39 /* CharCode.SingleQuote */, 95 /* KeyCode.Quote */, false);
        define(34 /* CharCode.DoubleQuote */, 95 /* KeyCode.Quote */, true);
    })();
});
//# sourceMappingURL=macLinuxKeyboardMapper.js.map