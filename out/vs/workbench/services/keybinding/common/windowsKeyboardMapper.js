/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/keybindings", "vs/base/common/keybindingLabels", "vs/platform/keybinding/common/baseResolvedKeybinding", "vs/platform/keybinding/common/resolvedKeybindingItem"], function (require, exports, keyCodes_1, keybindings_1, keybindingLabels_1, baseResolvedKeybinding_1, resolvedKeybindingItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WindowsKeyboardMapper = exports.WindowsNativeResolvedKeybinding = void 0;
    const LOG = false;
    function log(str) {
        if (LOG) {
            console.info(str);
        }
    }
    class WindowsNativeResolvedKeybinding extends baseResolvedKeybinding_1.BaseResolvedKeybinding {
        constructor(mapper, chords) {
            super(1 /* OperatingSystem.Windows */, chords);
            this._mapper = mapper;
        }
        _getLabel(chord) {
            if (chord.isDuplicateModifierCase()) {
                return '';
            }
            return this._mapper.getUILabelForKeyCode(chord.keyCode);
        }
        _getUSLabelForKeybinding(chord) {
            if (chord.isDuplicateModifierCase()) {
                return '';
            }
            return keyCodes_1.KeyCodeUtils.toString(chord.keyCode);
        }
        getUSLabel() {
            return keybindingLabels_1.UILabelProvider.toLabel(this._os, this._chords, (keybinding) => this._getUSLabelForKeybinding(keybinding));
        }
        _getAriaLabel(chord) {
            if (chord.isDuplicateModifierCase()) {
                return '';
            }
            return this._mapper.getAriaLabelForKeyCode(chord.keyCode);
        }
        _getElectronAccelerator(chord) {
            return this._mapper.getElectronAcceleratorForKeyBinding(chord);
        }
        _getUserSettingsLabel(chord) {
            if (chord.isDuplicateModifierCase()) {
                return '';
            }
            const result = this._mapper.getUserSettingsLabelForKeyCode(chord.keyCode);
            return (result ? result.toLowerCase() : result);
        }
        _isWYSIWYG(chord) {
            return this.__isWYSIWYG(chord.keyCode);
        }
        __isWYSIWYG(keyCode) {
            if (keyCode === 15 /* KeyCode.LeftArrow */
                || keyCode === 16 /* KeyCode.UpArrow */
                || keyCode === 17 /* KeyCode.RightArrow */
                || keyCode === 18 /* KeyCode.DownArrow */) {
                return true;
            }
            const ariaLabel = this._mapper.getAriaLabelForKeyCode(keyCode);
            const userSettingsLabel = this._mapper.getUserSettingsLabelForKeyCode(keyCode);
            return (ariaLabel === userSettingsLabel);
        }
        _getChordDispatch(chord) {
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
        _getSingleModifierChordDispatch(chord) {
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
        static getProducedCharCode(chord, mapping) {
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
            const char = this.getProducedCharCode(chord, mapping);
            if (char === null || char.length === 0) {
                return ' --- ';
            }
            return '  ' + char + '  ';
        }
    }
    exports.WindowsNativeResolvedKeybinding = WindowsNativeResolvedKeybinding;
    class WindowsKeyboardMapper {
        constructor(_isUSStandard, rawMappings, _mapAltGrToCtrlAlt) {
            this._isUSStandard = _isUSStandard;
            this._mapAltGrToCtrlAlt = _mapAltGrToCtrlAlt;
            this._keyCodeToLabel = [];
            this._scanCodeToKeyCode = [];
            this._keyCodeToLabel = [];
            this._keyCodeExists = [];
            this._keyCodeToLabel[0 /* KeyCode.Unknown */] = keyCodes_1.KeyCodeUtils.toString(0 /* KeyCode.Unknown */);
            for (let scanCode = 0 /* ScanCode.None */; scanCode < 193 /* ScanCode.MAX_VALUE */; scanCode++) {
                const immutableKeyCode = keyCodes_1.IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
                if (immutableKeyCode !== -1 /* KeyCode.DependsOnKbLayout */) {
                    this._scanCodeToKeyCode[scanCode] = immutableKeyCode;
                    this._keyCodeToLabel[immutableKeyCode] = keyCodes_1.KeyCodeUtils.toString(immutableKeyCode);
                    this._keyCodeExists[immutableKeyCode] = true;
                }
            }
            const producesLetter = [];
            let producesLetters = false;
            this._codeInfo = [];
            for (const strCode in rawMappings) {
                if (rawMappings.hasOwnProperty(strCode)) {
                    const scanCode = keyCodes_1.ScanCodeUtils.toEnum(strCode);
                    if (scanCode === 0 /* ScanCode.None */) {
                        log(`Unknown scanCode ${strCode} in mapping.`);
                        continue;
                    }
                    const rawMapping = rawMappings[strCode];
                    const immutableKeyCode = keyCodes_1.IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
                    if (immutableKeyCode !== -1 /* KeyCode.DependsOnKbLayout */) {
                        const keyCode = keyCodes_1.NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE[rawMapping.vkey] || 0 /* KeyCode.Unknown */;
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
                    const keyCode = keyCodes_1.NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE[rawMapping.vkey] || 0 /* KeyCode.Unknown */;
                    const mapping = {
                        scanCode: scanCode,
                        keyCode: keyCode,
                        value: value,
                        withShift: withShift,
                        withAltGr: withAltGr,
                        withShiftAltGr: withShiftAltGr,
                    };
                    this._codeInfo[scanCode] = mapping;
                    this._scanCodeToKeyCode[scanCode] = keyCode;
                    if (keyCode === 0 /* KeyCode.Unknown */) {
                        continue;
                    }
                    this._keyCodeExists[keyCode] = true;
                    if (value.length === 0) {
                        // This key does not produce strings
                        this._keyCodeToLabel[keyCode] = null;
                    }
                    else if (value.length > 1) {
                        // This key produces a letter representable with multiple UTF-16 code units.
                        this._keyCodeToLabel[keyCode] = value;
                    }
                    else {
                        const charCode = value.charCodeAt(0);
                        if (charCode >= 97 /* CharCode.a */ && charCode <= 122 /* CharCode.z */) {
                            const upperCaseValue = 65 /* CharCode.A */ + (charCode - 97 /* CharCode.a */);
                            producesLetter[upperCaseValue] = true;
                            producesLetters = true;
                            this._keyCodeToLabel[keyCode] = String.fromCharCode(65 /* CharCode.A */ + (charCode - 97 /* CharCode.a */));
                        }
                        else if (charCode >= 65 /* CharCode.A */ && charCode <= 90 /* CharCode.Z */) {
                            producesLetter[charCode] = true;
                            producesLetters = true;
                            this._keyCodeToLabel[keyCode] = value;
                        }
                        else {
                            this._keyCodeToLabel[keyCode] = value;
                        }
                    }
                }
            }
            // Handle keyboard layouts where latin characters are not produced e.g. Cyrillic
            const _registerLetterIfMissing = (charCode, keyCode) => {
                if (!producesLetter[charCode]) {
                    this._keyCodeToLabel[keyCode] = String.fromCharCode(charCode);
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
                    this._keyCodeToLabel[keyCode] = String.fromCharCode(charCode);
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
                if (keyCodes_1.IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1 /* KeyCode.DependsOnKbLayout */) {
                    if (immutableSamples.indexOf(scanCode) === -1) {
                        continue;
                    }
                }
                if (cnt % 6 === 0) {
                    result.push(`|       HW Code combination      |  Key  |    KeyCode combination    |          UI label         |        User settings       | WYSIWYG |`);
                    result.push(`-----------------------------------------------------------------------------------------------------------------------------------------`);
                }
                cnt++;
                const mapping = this._codeInfo[scanCode];
                const strCode = keyCodes_1.ScanCodeUtils.toString(scanCode);
                const mods = [0b000, 0b010, 0b101, 0b111];
                for (const mod of mods) {
                    const ctrlKey = (mod & 0b001) ? true : false;
                    const shiftKey = (mod & 0b010) ? true : false;
                    const altKey = (mod & 0b100) ? true : false;
                    const scanCodeChord = new keybindings_1.ScanCodeChord(ctrlKey, shiftKey, altKey, false, scanCode);
                    const keyCodeChord = this._resolveChord(scanCodeChord);
                    const strKeyCode = (keyCodeChord ? keyCodes_1.KeyCodeUtils.toString(keyCodeChord.keyCode) : null);
                    const resolvedKb = (keyCodeChord ? new WindowsNativeResolvedKeybinding(this, [keyCodeChord]) : null);
                    const outScanCode = `${ctrlKey ? 'Ctrl+' : ''}${shiftKey ? 'Shift+' : ''}${altKey ? 'Alt+' : ''}${strCode}`;
                    const ariaLabel = (resolvedKb ? resolvedKb.getAriaLabel() : null);
                    const outUILabel = (ariaLabel ? ariaLabel.replace(/Control\+/, 'Ctrl+') : null);
                    const outUserSettings = (resolvedKb ? resolvedKb.getUserSettingsLabel() : null);
                    const outKey = WindowsNativeResolvedKeybinding.getProducedChar(scanCodeChord, mapping);
                    const outKb = (strKeyCode ? `${ctrlKey ? 'Ctrl+' : ''}${shiftKey ? 'Shift+' : ''}${altKey ? 'Alt+' : ''}${strKeyCode}` : null);
                    const isWYSIWYG = (resolvedKb ? resolvedKb.isWYSIWYG() : false);
                    const outWYSIWYG = (isWYSIWYG ? '       ' : '   NO  ');
                    result.push(`| ${this._leftPad(outScanCode, 30)} | ${outKey} | ${this._leftPad(outKb, 25)} | ${this._leftPad(outUILabel, 25)} |  ${this._leftPad(outUserSettings, 25)} | ${outWYSIWYG} |`);
                }
                result.push(`-----------------------------------------------------------------------------------------------------------------------------------------`);
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
        getUILabelForKeyCode(keyCode) {
            return this._getLabelForKeyCode(keyCode);
        }
        getAriaLabelForKeyCode(keyCode) {
            return this._getLabelForKeyCode(keyCode);
        }
        getUserSettingsLabelForKeyCode(keyCode) {
            if (this._isUSStandard) {
                return keyCodes_1.KeyCodeUtils.toUserSettingsUS(keyCode);
            }
            return keyCodes_1.KeyCodeUtils.toUserSettingsGeneral(keyCode);
        }
        getElectronAcceleratorForKeyBinding(chord) {
            return keyCodes_1.KeyCodeUtils.toElectronAccelerator(chord.keyCode);
        }
        _getLabelForKeyCode(keyCode) {
            return this._keyCodeToLabel[keyCode] || keyCodes_1.KeyCodeUtils.toString(0 /* KeyCode.Unknown */);
        }
        resolveKeyboardEvent(keyboardEvent) {
            const ctrlKey = keyboardEvent.ctrlKey || (this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey);
            const altKey = keyboardEvent.altKey || (this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey);
            const chord = new keybindings_1.KeyCodeChord(ctrlKey, keyboardEvent.shiftKey, altKey, keyboardEvent.metaKey, keyboardEvent.keyCode);
            return new WindowsNativeResolvedKeybinding(this, [chord]);
        }
        _resolveChord(chord) {
            if (!chord) {
                return null;
            }
            if (chord instanceof keybindings_1.KeyCodeChord) {
                if (!this._keyCodeExists[chord.keyCode]) {
                    return null;
                }
                return chord;
            }
            const keyCode = this._scanCodeToKeyCode[chord.scanCode] || 0 /* KeyCode.Unknown */;
            if (keyCode === 0 /* KeyCode.Unknown */ || !this._keyCodeExists[keyCode]) {
                return null;
            }
            return new keybindings_1.KeyCodeChord(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, keyCode);
        }
        resolveKeybinding(keybinding) {
            const chords = (0, resolvedKeybindingItem_1.toEmptyArrayIfContainsNull)(keybinding.chords.map(chord => this._resolveChord(chord)));
            if (chords.length > 0) {
                return [new WindowsNativeResolvedKeybinding(this, chords)];
            }
            return [];
        }
    }
    exports.WindowsKeyboardMapper = WindowsKeyboardMapper;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93c0tleWJvYXJkTWFwcGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2tleWJpbmRpbmcvY29tbW9uL3dpbmRvd3NLZXlib2FyZE1hcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhaEcsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDO0lBQ2xCLFNBQVMsR0FBRyxDQUFDLEdBQVc7UUFDdkIsSUFBSSxHQUFHLEVBQUU7WUFDUixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2xCO0lBQ0YsQ0FBQztJQVlELE1BQWEsK0JBQWdDLFNBQVEsK0NBQW9DO1FBSXhGLFlBQVksTUFBNkIsRUFBRSxNQUFzQjtZQUNoRSxLQUFLLGtDQUEwQixNQUFNLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN2QixDQUFDO1FBRVMsU0FBUyxDQUFDLEtBQW1CO1lBQ3RDLElBQUksS0FBSyxDQUFDLHVCQUF1QixFQUFFLEVBQUU7Z0JBQ3BDLE9BQU8sRUFBRSxDQUFDO2FBQ1Y7WUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFTyx3QkFBd0IsQ0FBQyxLQUFtQjtZQUNuRCxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxFQUFFO2dCQUNwQyxPQUFPLEVBQUUsQ0FBQzthQUNWO1lBQ0QsT0FBTyx1QkFBWSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVNLFVBQVU7WUFDaEIsT0FBTyxrQ0FBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxVQUFVLEVBQUUs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