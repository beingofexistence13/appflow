/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/keybindings", "vs/platform/keybinding/common/baseResolvedKeybinding"], function (require, exports, keyCodes_1, keybindings_1, baseResolvedKeybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MacLinuxKeyboardMapper = exports.NativeResolvedKeybinding = void 0;
    /**
     * A map from character to key codes.
     * e.g. Contains entries such as:
     *  - '/' => { keyCode: KeyCode.US_SLASH, shiftKey: false }
     *  - '?' => { keyCode: KeyCode.US_SLASH, shiftKey: true }
     */
    const CHAR_CODE_TO_KEY_CODE = [];
    class NativeResolvedKeybinding extends baseResolvedKeybinding_1.BaseResolvedKeybinding {
        constructor(mapper, os, chords) {
            super(os, chords);
            this._mapper = mapper;
        }
        _getLabel(chord) {
            return this._mapper.getUILabelForScanCodeChord(chord);
        }
        _getAriaLabel(chord) {
            return this._mapper.getAriaLabelForScanCodeChord(chord);
        }
        _getElectronAccelerator(chord) {
            return this._mapper.getElectronAcceleratorLabelForScanCodeChord(chord);
        }
        _getUserSettingsLabel(chord) {
            return this._mapper.getUserSettingsLabelForScanCodeChord(chord);
        }
        _isWYSIWYG(binding) {
            if (!binding) {
                return true;
            }
            if (keyCodes_1.IMMUTABLE_CODE_TO_KEY_CODE[binding.scanCode] !== -1 /* KeyCode.DependsOnKbLayout */) {
                return true;
            }
            const a = this._mapper.getAriaLabelForScanCodeChord(binding);
            const b = this._mapper.getUserSettingsLabelForScanCodeChord(binding);
            if (!a && !b) {
                return true;
            }
            if (!a || !b) {
                return false;
            }
            return (a.toLowerCase() === b.toLowerCase());
        }
        _getChordDispatch(chord) {
            return this._mapper.getDispatchStrForScanCodeChord(chord);
        }
        _getSingleModifierChordDispatch(chord) {
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
    exports.NativeResolvedKeybinding = NativeResolvedKeybinding;
    class ScanCodeCombo {
        constructor(ctrlKey, shiftKey, altKey, scanCode) {
            this.ctrlKey = ctrlKey;
            this.shiftKey = shiftKey;
            this.altKey = altKey;
            this.scanCode = scanCode;
        }
        toString() {
            return `${this.ctrlKey ? 'Ctrl+' : ''}${this.shiftKey ? 'Shift+' : ''}${this.altKey ? 'Alt+' : ''}${keyCodes_1.ScanCodeUtils.toString(this.scanCode)}`;
        }
        equals(other) {
            return (this.ctrlKey === other.ctrlKey
                && this.shiftKey === other.shiftKey
                && this.altKey === other.altKey
                && this.scanCode === other.scanCode);
        }
        getProducedCharCode(mapping) {
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
            const charCode = MacLinuxKeyboardMapper.getCharCode(this.getProducedCharCode(mapping));
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
            this._scanCodeToKeyCode = [];
            /**
             * inverse of `_scanCodeToKeyCode`.
             * KeyCode combination => ScanCode combination.
             * Only covers relevant modifiers ctrl, shift, alt (since meta does not influence the mappings).
             */
            this._keyCodeToScanCode = [];
            this._scanCodeToKeyCode = [];
            this._keyCodeToScanCode = [];
        }
        registrationComplete() {
            // IntlHash and IntlBackslash are rare keys, so ensure they don't end up being the preferred...
            this._moveToEnd(56 /* ScanCode.IntlHash */);
            this._moveToEnd(106 /* ScanCode.IntlBackslash */);
        }
        _moveToEnd(scanCode) {
            for (let mod = 0; mod < 8; mod++) {
                const encodedKeyCodeCombos = this._scanCodeToKeyCode[(scanCode << 3) + mod];
                if (!encodedKeyCodeCombos) {
                    continue;
                }
                for (let i = 0, len = encodedKeyCodeCombos.length; i < len; i++) {
                    const encodedScanCodeCombos = this._keyCodeToScanCode[encodedKeyCodeCombos[i]];
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
            const scanCodeComboEncoded = this._encodeScanCodeCombo(scanCodeCombo);
            const keyCodeComboEncoded = this._encodeKeyCodeCombo(keyCodeCombo);
            const keyCodeIsDigit = (keyCodeCombo.keyCode >= 21 /* KeyCode.Digit0 */ && keyCodeCombo.keyCode <= 30 /* KeyCode.Digit9 */);
            const keyCodeIsLetter = (keyCodeCombo.keyCode >= 31 /* KeyCode.KeyA */ && keyCodeCombo.keyCode <= 56 /* KeyCode.KeyZ */);
            const existingKeyCodeCombos = this._scanCodeToKeyCode[scanCodeComboEncoded];
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
            this._scanCodeToKeyCode[scanCodeComboEncoded] = this._scanCodeToKeyCode[scanCodeComboEncoded] || [];
            this._scanCodeToKeyCode[scanCodeComboEncoded].unshift(keyCodeComboEncoded);
            this._keyCodeToScanCode[keyCodeComboEncoded] = this._keyCodeToScanCode[keyCodeComboEncoded] || [];
            this._keyCodeToScanCode[keyCodeComboEncoded].unshift(scanCodeComboEncoded);
        }
        lookupKeyCodeCombo(keyCodeCombo) {
            const keyCodeComboEncoded = this._encodeKeyCodeCombo(keyCodeCombo);
            const scanCodeCombosEncoded = this._keyCodeToScanCode[keyCodeComboEncoded];
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
            const scanCodeComboEncoded = this._encodeScanCodeCombo(scanCodeCombo);
            const keyCodeCombosEncoded = this._scanCodeToKeyCode[scanCodeComboEncoded];
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
        _encodeScanCodeCombo(scanCodeCombo) {
            return this._encode(scanCodeCombo.ctrlKey, scanCodeCombo.shiftKey, scanCodeCombo.altKey, scanCodeCombo.scanCode);
        }
        _encodeKeyCodeCombo(keyCodeCombo) {
            return this._encode(keyCodeCombo.ctrlKey, keyCodeCombo.shiftKey, keyCodeCombo.altKey, keyCodeCombo.keyCode);
        }
        _encode(ctrlKey, shiftKey, altKey, principal) {
            return (((ctrlKey ? 1 : 0) << 0)
                | ((shiftKey ? 1 : 0) << 1)
                | ((altKey ? 1 : 0) << 2)
                | principal << 3) >>> 0;
        }
    }
    class MacLinuxKeyboardMapper {
        constructor(_isUSStandard, rawMappings, _mapAltGrToCtrlAlt, _OS) {
            this._isUSStandard = _isUSStandard;
            this._mapAltGrToCtrlAlt = _mapAltGrToCtrlAlt;
            this._OS = _OS;
            /**
             * UI label for a ScanCode.
             */
            this._scanCodeToLabel = [];
            /**
             * Dispatching string for a ScanCode.
             */
            this._scanCodeToDispatch = [];
            this._codeInfo = [];
            this._scanCodeKeyCodeMapper = new ScanCodeKeyCodeMapper();
            this._scanCodeToLabel = [];
            this._scanCodeToDispatch = [];
            const _registerIfUnknown = (hwCtrlKey, hwShiftKey, hwAltKey, scanCode, kbCtrlKey, kbShiftKey, kbAltKey, keyCode) => {
                this._scanCodeKeyCodeMapper.registerIfUnknown(new ScanCodeCombo(hwCtrlKey ? true : false, hwShiftKey ? true : false, hwAltKey ? true : false, scanCode), new KeyCodeCombo(kbCtrlKey ? true : false, kbShiftKey ? true : false, kbAltKey ? true : false, keyCode));
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
                this._scanCodeToLabel[scanCode] = null;
            }
            // Initialize `_scanCodeToDispatch`
            for (let scanCode = 0 /* ScanCode.None */; scanCode < 193 /* ScanCode.MAX_VALUE */; scanCode++) {
                this._scanCodeToDispatch[scanCode] = null;
            }
            // Handle immutable mappings
            for (let scanCode = 0 /* ScanCode.None */; scanCode < 193 /* ScanCode.MAX_VALUE */; scanCode++) {
                const keyCode = keyCodes_1.IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
                if (keyCode !== -1 /* KeyCode.DependsOnKbLayout */) {
                    _registerAllCombos(0, 0, 0, scanCode, keyCode);
                    this._scanCodeToLabel[scanCode] = keyCodes_1.KeyCodeUtils.toString(keyCode);
                    if (keyCode === 0 /* KeyCode.Unknown */ || keyCode === 5 /* KeyCode.Ctrl */ || keyCode === 57 /* KeyCode.Meta */ || keyCode === 6 /* KeyCode.Alt */ || keyCode === 4 /* KeyCode.Shift */) {
                        this._scanCodeToDispatch[scanCode] = null; // cannot dispatch on this ScanCode
                    }
                    else {
                        this._scanCodeToDispatch[scanCode] = `[${keyCodes_1.ScanCodeUtils.toString(scanCode)}]`;
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
                        const scanCode = keyCodes_1.ScanCodeUtils.toEnum(strScanCode);
                        if (scanCode === 0 /* ScanCode.None */) {
                            continue;
                        }
                        if (keyCodes_1.IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1 /* KeyCode.DependsOnKbLayout */) {
                            continue;
                        }
                        const rawMapping = rawMappings[strScanCode];
                        const value = MacLinuxKeyboardMapper.getCharCode(rawMapping.value);
                        if (value >= 97 /* CharCode.a */ && value <= 122 /* CharCode.z */) {
                            const upperCaseValue = 65 /* CharCode.A */ + (value - 97 /* CharCode.a */);
                            producesLatinLetter[upperCaseValue] = true;
                        }
                    }
                }
                const _registerLetterIfMissing = (charCode, scanCode, value, withShift) => {
                    if (!producesLatinLetter[charCode]) {
                        missingLatinLettersOverride[keyCodes_1.ScanCodeUtils.toString(scanCode)] = {
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
                    const scanCode = keyCodes_1.ScanCodeUtils.toEnum(strScanCode);
                    if (scanCode === 0 /* ScanCode.None */) {
                        continue;
                    }
                    if (keyCodes_1.IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1 /* KeyCode.DependsOnKbLayout */) {
                        continue;
                    }
                    this._codeInfo[scanCode] = rawMappings[strScanCode];
                    const rawMapping = missingLatinLettersOverride[strScanCode] || rawMappings[strScanCode];
                    const value = MacLinuxKeyboardMapper.getCharCode(rawMapping.value);
                    const withShift = MacLinuxKeyboardMapper.getCharCode(rawMapping.withShift);
                    const withAltGr = MacLinuxKeyboardMapper.getCharCode(rawMapping.withAltGr);
                    const withShiftAltGr = MacLinuxKeyboardMapper.getCharCode(rawMapping.withShiftAltGr);
                    const mapping = {
                        scanCode: scanCode,
                        value: value,
                        withShift: withShift,
                        withAltGr: withAltGr,
                        withShiftAltGr: withShiftAltGr,
                    };
                    mappings[mappingsLen++] = mapping;
                    this._scanCodeToDispatch[scanCode] = `[${keyCodes_1.ScanCodeUtils.toString(scanCode)}]`;
                    if (value >= 97 /* CharCode.a */ && value <= 122 /* CharCode.z */) {
                        const upperCaseValue = 65 /* CharCode.A */ + (value - 97 /* CharCode.a */);
                        this._scanCodeToLabel[scanCode] = String.fromCharCode(upperCaseValue);
                    }
                    else if (value >= 65 /* CharCode.A */ && value <= 90 /* CharCode.Z */) {
                        this._scanCodeToLabel[scanCode] = String.fromCharCode(value);
                    }
                    else if (value) {
                        this._scanCodeToLabel[scanCode] = String.fromCharCode(value);
                    }
                    else {
                        this._scanCodeToLabel[scanCode] = null;
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
                const kb = MacLinuxKeyboardMapper._charCodeToKb(withShiftAltGr);
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
                const kb = MacLinuxKeyboardMapper._charCodeToKb(withAltGr);
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
                const kb = MacLinuxKeyboardMapper._charCodeToKb(withShift);
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
                const kb = MacLinuxKeyboardMapper._charCodeToKb(mapping.value);
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
            this._scanCodeKeyCodeMapper.registrationComplete();
        }
        dumpDebugInfo() {
            const result = [];
            const immutableSamples = [
                88 /* ScanCode.ArrowUp */,
                104 /* ScanCode.Numpad0 */
            ];
            let cnt = 0;
            result.push(`isUSStandard: ${this._isUSStandard}`);
            result.push(`----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------`);
            for (let scanCode = 0 /* ScanCode.None */; scanCode < 193 /* ScanCode.MAX_VALUE */; scanCode++) {
                if (keyCodes_1.IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1 /* KeyCode.DependsOnKbLayout */) {
                    if (immutableSamples.indexOf(scanCode) === -1) {
                        continue;
                    }
                }
                if (cnt % 4 === 0) {
                    result.push(`|       HW Code combination      |  Key  |    KeyCode combination    | Pri |          UI label         |         User settings          |    Electron accelerator   |       Dispatching string       | WYSIWYG |`);
                    result.push(`----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------`);
                }
                cnt++;
                const mapping = this._codeInfo[scanCode];
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
                        code: keyCodes_1.ScanCodeUtils.toString(scanCode)
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
                    const kbCombos = this._scanCodeKeyCodeMapper.lookupScanCodeCombo(scanCodeCombo);
                    if (kbCombos.length === 0) {
                        result.push(`| ${this._leftPad(outScanCodeCombo, 30)} | ${outKey} | ${this._leftPad('', 25)} | ${this._leftPad('', 3)} | ${this._leftPad(outUILabel, 25)} | ${this._leftPad(outUserSettings, 30)} | ${this._leftPad(outElectronAccelerator, 25)} | ${this._leftPad(outDispatchStr, 30)} | ${outWYSIWYG} |`);
                    }
                    else {
                        for (let i = 0, len = kbCombos.length; i < len; i++) {
                            const kbCombo = kbCombos[i];
                            // find out the priority of this scan code for this key code
                            let colPriority;
                            const scanCodeCombos = this._scanCodeKeyCodeMapper.lookupKeyCodeCombo(kbCombo);
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
                                result.push(`| ${this._leftPad(outScanCodeCombo, 30)} | ${outKey} | ${this._leftPad(outKeybinding, 25)} | ${this._leftPad(colPriority, 3)} | ${this._leftPad(outUILabel, 25)} | ${this._leftPad(outUserSettings, 30)} | ${this._leftPad(outElectronAccelerator, 25)} | ${this._leftPad(outDispatchStr, 30)} | ${outWYSIWYG} |`);
                            }
                            else {
                                // secondary keybindings
                                result.push(`| ${this._leftPad('', 30)} |       | ${this._leftPad(outKeybinding, 25)} | ${this._leftPad(colPriority, 3)} | ${this._leftPad('', 25)} | ${this._leftPad('', 30)} | ${this._leftPad('', 25)} | ${this._leftPad('', 30)} |         |`);
                            }
                        }
                    }
                }
                result.push(`----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------`);
            }
            return result.join('\n');
        }
        _leftPad(str, cnt) {
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
                return [new keybindings_1.ScanCodeChord(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, 46 /* ScanCode.Enter */)];
            }
            const scanCodeCombos = this._scanCodeKeyCodeMapper.lookupKeyCodeCombo(new KeyCodeCombo(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.keyCode));
            const result = [];
            for (let i = 0, len = scanCodeCombos.length; i < len; i++) {
                const scanCodeCombo = scanCodeCombos[i];
                result[i] = new keybindings_1.ScanCodeChord(scanCodeCombo.ctrlKey, scanCodeCombo.shiftKey, scanCodeCombo.altKey, chord.metaKey, scanCodeCombo.scanCode);
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
            if (this._OS === 2 /* OperatingSystem.Macintosh */) {
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
            return this._scanCodeToLabel[chord.scanCode];
        }
        getAriaLabelForScanCodeChord(chord) {
            if (!chord) {
                return null;
            }
            if (chord.isDuplicateModifierCase()) {
                return '';
            }
            return this._scanCodeToLabel[chord.scanCode];
        }
        getDispatchStrForScanCodeChord(chord) {
            const codeDispatch = this._scanCodeToDispatch[chord.scanCode];
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
            const immutableKeyCode = keyCodes_1.IMMUTABLE_CODE_TO_KEY_CODE[chord.scanCode];
            if (immutableKeyCode !== -1 /* KeyCode.DependsOnKbLayout */) {
                return keyCodes_1.KeyCodeUtils.toUserSettingsUS(immutableKeyCode).toLowerCase();
            }
            // Check if this scanCode always maps to the same keyCode and back
            const constantKeyCode = this._scanCodeKeyCodeMapper.guessStableKeyCode(chord.scanCode);
            if (constantKeyCode !== -1 /* KeyCode.DependsOnKbLayout */) {
                // Verify that this is a good key code that can be mapped back to the same scan code
                const reverseChords = this.keyCodeChordToScanCodeChord(new keybindings_1.KeyCodeChord(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, constantKeyCode));
                for (let i = 0, len = reverseChords.length; i < len; i++) {
                    const reverseChord = reverseChords[i];
                    if (reverseChord.scanCode === chord.scanCode) {
                        return keyCodes_1.KeyCodeUtils.toUserSettingsUS(constantKeyCode).toLowerCase();
                    }
                }
            }
            return this._scanCodeToDispatch[chord.scanCode];
        }
        getElectronAcceleratorLabelForScanCodeChord(chord) {
            if (!chord) {
                return null;
            }
            const immutableKeyCode = keyCodes_1.IMMUTABLE_CODE_TO_KEY_CODE[chord.scanCode];
            if (immutableKeyCode !== -1 /* KeyCode.DependsOnKbLayout */) {
                return keyCodes_1.KeyCodeUtils.toElectronAccelerator(immutableKeyCode);
            }
            // Check if this scanCode always maps to the same keyCode and back
            const constantKeyCode = this._scanCodeKeyCodeMapper.guessStableKeyCode(chord.scanCode);
            if (this._OS === 3 /* OperatingSystem.Linux */ && !this._isUSStandard) {
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
        _toResolvedKeybinding(chordParts) {
            if (chordParts.length === 0) {
                return [];
            }
            const result = [];
            this._generateResolvedKeybindings(chordParts, 0, [], result);
            return result;
        }
        _generateResolvedKeybindings(chordParts, currentIndex, previousParts, result) {
            const chordPart = chordParts[currentIndex];
            const isFinalIndex = currentIndex === chordParts.length - 1;
            for (let i = 0, len = chordPart.length; i < len; i++) {
                const chords = [...previousParts, chordPart[i]];
                if (isFinalIndex) {
                    result.push(new NativeResolvedKeybinding(this, this._OS, chords));
                }
                else {
                    this._generateResolvedKeybindings(chordParts, currentIndex + 1, chords, result);
                }
            }
        }
        resolveKeyboardEvent(keyboardEvent) {
            let code = keyCodes_1.ScanCodeUtils.toEnum(keyboardEvent.code);
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
                const immutableScanCode = keyCodes_1.IMMUTABLE_KEY_CODE_TO_CODE[keyCode];
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
                        const immutableScanCode = keyCodes_1.IMMUTABLE_KEY_CODE_TO_CODE[keyCode];
                        if (immutableScanCode !== -1 /* ScanCode.DependsOnKbLayout */) {
                            code = immutableScanCode;
                        }
                    }
                }
            }
            const ctrlKey = keyboardEvent.ctrlKey || (this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey);
            const altKey = keyboardEvent.altKey || (this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey);
            const chord = new keybindings_1.ScanCodeChord(ctrlKey, keyboardEvent.shiftKey, altKey, keyboardEvent.metaKey, code);
            return new NativeResolvedKeybinding(this, this._OS, [chord]);
        }
        _resolveChord(chord) {
            if (!chord) {
                return [];
            }
            if (chord instanceof keybindings_1.ScanCodeChord) {
                return [chord];
            }
            return this.keyCodeChordToScanCodeChord(chord);
        }
        resolveKeybinding(keybinding) {
            const chords = keybinding.chords.map(chord => this._resolveChord(chord));
            return this._toResolvedKeybinding(chords);
        }
        static _redirectCharCode(charCode) {
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
        static _charCodeToKb(charCode) {
            charCode = this._redirectCharCode(charCode);
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
    exports.MacLinuxKeyboardMapper = MacLinuxKeyboardMapper;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFjTGludXhLZXlib2FyZE1hcHBlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9rZXliaW5kaW5nL2NvbW1vbi9tYWNMaW51eEtleWJvYXJkTWFwcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRzs7Ozs7T0FLRztJQUNILE1BQU0scUJBQXFCLEdBQXVELEVBQUUsQ0FBQztJQUVyRixNQUFhLHdCQUF5QixTQUFRLCtDQUFxQztRQUlsRixZQUFZLE1BQThCLEVBQUUsRUFBbUIsRUFBRSxNQUF1QjtZQUN2RixLQUFLLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3ZCLENBQUM7UUFFUyxTQUFTLENBQUMsS0FBb0I7WUFDdkMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFUyxhQUFhLENBQUMsS0FBb0I7WUFDM0MsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLDRCQUE0QixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFUyx1QkFBdUIsQ0FBQyxLQUFvQjtZQUNyRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsMkNBQTJDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUVTLHFCQUFxQixDQUFDLEtBQW9CO1lBQ25ELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxvQ0FBb0MsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRVMsVUFBVSxDQUFDLE9BQTZCO1lBQ2pELElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2IsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUNELElBQUkscUNBQTBCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyx1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d0JBQXdCLDhDQUE0QixHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQzlELHdCQUF3Qiw4Q0FBNEIsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUM5RCx3QkFBd0IsOENBQTRCLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDOUQsd0JBQXdCLDhDQUE0QixHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQzlELHdCQUF3Qiw4Q0FBNEIsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUM5RCx3QkFBd0IsOENBQTRCLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDOUQsd0JBQXdCLDhDQUE0QixHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQzlELHdCQUF3Qiw4Q0FBNEIsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUM5RCx3QkFBd0IsOENBQTRCLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDOUQsd0JBQXdCLDhDQUE0QixHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQzlELHdCQUF3Qiw4Q0FBNEIsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUM5RCx3QkFBd0IsOENBQTRCLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDOUQsd0JBQXdCLDhDQUE0QixHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQzlELHdCQUF3Qiw4Q0FBNEIsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUM5RCx3QkFBd0IsOENBQTRCLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDOUQsd0JBQXdCLDhDQUE0QixHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQzlELHdCQUF3Qiw4Q0FBNEIsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUM5RCx3QkFBd0IsOENBQTRCLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDOUQsd0JBQXdCLDhDQUE0QixHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQzlELHdCQUF3Qiw4Q0FBNEIsR0FBRyxFQUFFLEdB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