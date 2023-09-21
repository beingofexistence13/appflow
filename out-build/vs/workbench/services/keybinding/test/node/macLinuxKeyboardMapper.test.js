/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/keyCodes", "vs/base/common/keybindings", "vs/base/common/keybindingLabels", "vs/platform/keybinding/common/usLayoutResolvedKeybinding", "vs/workbench/services/keybinding/common/macLinuxKeyboardMapper", "vs/workbench/services/keybinding/test/node/keyboardMapperTestUtils"], function (require, exports, assert, keyCodes_1, keybindings_1, keybindingLabels_1, usLayoutResolvedKeybinding_1, macLinuxKeyboardMapper_1, keyboardMapperTestUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const WRITE_FILE_IF_DIFFERENT = false;
    async function createKeyboardMapper(isUSStandard, file, mapAltGrToCtrlAlt, OS) {
        const rawMappings = await (0, keyboardMapperTestUtils_1.$fgc)(file);
        return new macLinuxKeyboardMapper_1.$q3b(isUSStandard, rawMappings, mapAltGrToCtrlAlt, OS);
    }
    suite('keyboardMapper - MAC de_ch', () => {
        let mapper;
        suiteSetup(async () => {
            const _mapper = await createKeyboardMapper(false, 'mac_de_ch', false, 2 /* OperatingSystem.Macintosh */);
            mapper = _mapper;
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.$ggc)(WRITE_FILE_IF_DIFFERENT, mapper, 'mac_de_ch.txt');
        });
        function assertKeybindingTranslation(kb, expected) {
            _assertKeybindingTranslation(mapper, 2 /* OperatingSystem.Macintosh */, kb, expected);
        }
        function _assertResolveKeybinding(k, expected) {
            (0, keyboardMapperTestUtils_1.$egc)(mapper, (0, keybindings_1.$wq)(k, 2 /* OperatingSystem.Macintosh */), expected);
        }
        test('kb => hw', () => {
            // unchanged
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 22 /* KeyCode.Digit1 */, 'cmd+Digit1');
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */, 'cmd+KeyB');
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 32 /* KeyCode.KeyB */, 'shift+cmd+KeyB');
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 32 /* KeyCode.KeyB */, 'ctrl+shift+alt+cmd+KeyB');
            // flips Y and Z
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 56 /* KeyCode.KeyZ */, 'cmd+KeyY');
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 'cmd+KeyZ');
            // Ctrl+/
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */, 'shift+cmd+Digit7');
        });
        test('resolveKeybinding Cmd+A', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, [{
                    label: '⌘A',
                    ariaLabel: 'Command+A',
                    electronAccelerator: 'Cmd+A',
                    userSettingsLabel: 'cmd+a',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['meta+[KeyA]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Cmd+B', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */, [{
                    label: '⌘B',
                    ariaLabel: 'Command+B',
                    electronAccelerator: 'Cmd+B',
                    userSettingsLabel: 'cmd+b',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['meta+[KeyB]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Cmd+Z', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 56 /* KeyCode.KeyZ */, [{
                    label: '⌘Z',
                    ariaLabel: 'Command+Z',
                    electronAccelerator: 'Cmd+Z',
                    userSettingsLabel: 'cmd+z',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['meta+[KeyY]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Cmd+[KeyY]', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: -1,
                code: 'KeyY'
            }, {
                label: '⌘Z',
                ariaLabel: 'Command+Z',
                electronAccelerator: 'Cmd+Z',
                userSettingsLabel: 'cmd+z',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['meta+[KeyY]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeybinding Cmd+]', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 94 /* KeyCode.BracketRight */, [{
                    label: '⌃⌥⌘6',
                    ariaLabel: 'Control+Option+Command+6',
                    electronAccelerator: 'Ctrl+Alt+Cmd+6',
                    userSettingsLabel: 'ctrl+alt+cmd+6',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+alt+meta+[Digit6]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Cmd+[BracketRight]', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: -1,
                code: 'BracketRight'
            }, {
                label: '⌘¨',
                ariaLabel: 'Command+¨',
                electronAccelerator: null,
                userSettingsLabel: 'cmd+[BracketRight]',
                isWYSIWYG: false,
                isMultiChord: false,
                dispatchParts: ['meta+[BracketRight]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeybinding Shift+]', () => {
            _assertResolveKeybinding(1024 /* KeyMod.Shift */ | 94 /* KeyCode.BracketRight */, [{
                    label: '⌃⌥9',
                    ariaLabel: 'Control+Option+9',
                    electronAccelerator: 'Ctrl+Alt+9',
                    userSettingsLabel: 'ctrl+alt+9',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+alt+[Digit9]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Cmd+/', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */, [{
                    label: '⇧⌘7',
                    ariaLabel: 'Shift+Command+7',
                    electronAccelerator: 'Shift+Cmd+7',
                    userSettingsLabel: 'shift+cmd+7',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['shift+meta+[Digit7]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Cmd+Shift+/', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 90 /* KeyCode.Slash */, [{
                    label: '⇧⌘\'',
                    ariaLabel: 'Shift+Command+\'',
                    electronAccelerator: null,
                    userSettingsLabel: 'shift+cmd+[Minus]',
                    isWYSIWYG: false,
                    isMultiChord: false,
                    dispatchParts: ['shift+meta+[Minus]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Cmd+K Cmd+\\', () => {
            _assertResolveKeybinding((0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */), [{
                    label: '⌘K ⌃⇧⌥⌘7',
                    ariaLabel: 'Command+K Control+Shift+Option+Command+7',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+k ctrl+shift+alt+cmd+7',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['meta+[KeyK]', 'ctrl+shift+alt+meta+[Digit7]'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeybinding Cmd+K Cmd+=', () => {
            _assertResolveKeybinding((0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 86 /* KeyCode.Equal */), [{
                    label: '⌘K ⇧⌘0',
                    ariaLabel: 'Command+K Shift+Command+0',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+k shift+cmd+0',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['meta+[KeyK]', 'shift+meta+[Digit0]'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeybinding Cmd+DownArrow', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */, [{
                    label: '⌘↓',
                    ariaLabel: 'Command+DownArrow',
                    electronAccelerator: 'Cmd+Down',
                    userSettingsLabel: 'cmd+down',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['meta+[ArrowDown]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Cmd+NUMPAD_0', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 98 /* KeyCode.Numpad0 */, [{
                    label: '⌘NumPad0',
                    ariaLabel: 'Command+NumPad0',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+numpad0',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['meta+[Numpad0]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Home', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 14 /* KeyCode.Home */, [{
                    label: '⌘Home',
                    ariaLabel: 'Command+Home',
                    electronAccelerator: 'Cmd+Home',
                    userSettingsLabel: 'cmd+home',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['meta+[Home]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+[Home]', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: -1,
                code: 'Home'
            }, {
                label: '⌘Home',
                ariaLabel: 'Command+Home',
                electronAccelerator: 'Cmd+Home',
                userSettingsLabel: 'cmd+home',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['meta+[Home]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveUserBinding Cmd+[Comma] Cmd+/', () => {
            (0, keyboardMapperTestUtils_1.$egc)(mapper, new keybindings_1.$Aq([
                new keybindings_1.$zq(false, false, false, true, 60 /* ScanCode.Comma */),
                new keybindings_1.$yq(false, false, false, true, 90 /* KeyCode.Slash */),
            ]), [{
                    label: '⌘, ⇧⌘7',
                    ariaLabel: 'Command+, Shift+Command+7',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+[Comma] shift+cmd+7',
                    isWYSIWYG: false,
                    isMultiChord: true,
                    dispatchParts: ['meta+[Comma]', 'shift+meta+[Digit7]'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeyboardEvent Single Modifier MetaLeft+', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: -1,
                code: 'MetaLeft'
            }, {
                label: '⌘',
                ariaLabel: 'Command',
                electronAccelerator: null,
                userSettingsLabel: 'cmd',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['meta'],
            });
        });
        test('resolveKeyboardEvent Single Modifier MetaRight+', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: -1,
                code: 'MetaRight'
            }, {
                label: '⌘',
                ariaLabel: 'Command',
                electronAccelerator: null,
                userSettingsLabel: 'cmd',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['meta'],
            });
        });
    });
    suite('keyboardMapper - MAC en_us', () => {
        let mapper;
        suiteSetup(async () => {
            const _mapper = await createKeyboardMapper(true, 'mac_en_us', false, 2 /* OperatingSystem.Macintosh */);
            mapper = _mapper;
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.$ggc)(WRITE_FILE_IF_DIFFERENT, mapper, 'mac_en_us.txt');
        });
        test('resolveUserBinding Cmd+[Comma] Cmd+/', () => {
            (0, keyboardMapperTestUtils_1.$egc)(mapper, new keybindings_1.$Aq([
                new keybindings_1.$zq(false, false, false, true, 60 /* ScanCode.Comma */),
                new keybindings_1.$yq(false, false, false, true, 90 /* KeyCode.Slash */),
            ]), [{
                    label: '⌘, ⌘/',
                    ariaLabel: 'Command+, Command+/',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+, cmd+/',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['meta+[Comma]', 'meta+[Slash]'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeyboardEvent Single Modifier MetaLeft+', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: -1,
                code: 'MetaLeft'
            }, {
                label: '⌘',
                ariaLabel: 'Command',
                electronAccelerator: null,
                userSettingsLabel: 'cmd',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['meta'],
            });
        });
        test('resolveKeyboardEvent Single Modifier MetaRight+', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: -1,
                code: 'MetaRight'
            }, {
                label: '⌘',
                ariaLabel: 'Command',
                electronAccelerator: null,
                userSettingsLabel: 'cmd',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['meta'],
            });
        });
        test('resolveKeyboardEvent mapAltGrToCtrlAlt AltGr+Z', async () => {
            const mapper = await createKeyboardMapper(true, 'mac_en_us', true, 2 /* OperatingSystem.Macintosh */);
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: true,
                keyCode: -1,
                code: 'KeyZ'
            }, {
                label: '⌃⌥Z',
                ariaLabel: 'Control+Option+Z',
                electronAccelerator: 'Ctrl+Alt+Z',
                userSettingsLabel: 'ctrl+alt+z',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+alt+[KeyZ]'],
                singleModifierDispatchParts: [null],
            });
        });
    });
    suite('keyboardMapper - LINUX de_ch', () => {
        let mapper;
        suiteSetup(async () => {
            const _mapper = await createKeyboardMapper(false, 'linux_de_ch', false, 3 /* OperatingSystem.Linux */);
            mapper = _mapper;
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.$ggc)(WRITE_FILE_IF_DIFFERENT, mapper, 'linux_de_ch.txt');
        });
        function assertKeybindingTranslation(kb, expected) {
            _assertKeybindingTranslation(mapper, 3 /* OperatingSystem.Linux */, kb, expected);
        }
        function _assertResolveKeybinding(k, expected) {
            (0, keyboardMapperTestUtils_1.$egc)(mapper, (0, keybindings_1.$wq)(k, 3 /* OperatingSystem.Linux */), expected);
        }
        test('kb => hw', () => {
            // unchanged
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 22 /* KeyCode.Digit1 */, 'ctrl+Digit1');
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */, 'ctrl+KeyB');
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 32 /* KeyCode.KeyB */, 'ctrl+shift+KeyB');
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 32 /* KeyCode.KeyB */, 'ctrl+shift+alt+meta+KeyB');
            // flips Y and Z
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 56 /* KeyCode.KeyZ */, 'ctrl+KeyY');
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 'ctrl+KeyZ');
            // Ctrl+/
            assertKeybindingTranslation(2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */, 'ctrl+shift+Digit7');
        });
        test('resolveKeybinding Ctrl+A', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, [{
                    label: 'Ctrl+A',
                    ariaLabel: 'Control+A',
                    electronAccelerator: 'Ctrl+A',
                    userSettingsLabel: 'ctrl+a',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[KeyA]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Z', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 56 /* KeyCode.KeyZ */, [{
                    label: 'Ctrl+Z',
                    ariaLabel: 'Control+Z',
                    electronAccelerator: 'Ctrl+Z',
                    userSettingsLabel: 'ctrl+z',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[KeyY]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+[KeyY]', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'KeyY'
            }, {
                label: 'Ctrl+Z',
                ariaLabel: 'Control+Z',
                electronAccelerator: 'Ctrl+Z',
                userSettingsLabel: 'ctrl+z',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+[KeyY]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeybinding Ctrl+]', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 94 /* KeyCode.BracketRight */, []);
        });
        test('resolveKeyboardEvent Ctrl+[BracketRight]', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'BracketRight'
            }, {
                label: 'Ctrl+¨',
                ariaLabel: 'Control+¨',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+[BracketRight]',
                isWYSIWYG: false,
                isMultiChord: false,
                dispatchParts: ['ctrl+[BracketRight]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeybinding Shift+]', () => {
            _assertResolveKeybinding(1024 /* KeyMod.Shift */ | 94 /* KeyCode.BracketRight */, [{
                    label: 'Ctrl+Alt+0',
                    ariaLabel: 'Control+Alt+0',
                    electronAccelerator: 'Ctrl+Alt+0',
                    userSettingsLabel: 'ctrl+alt+0',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+alt+[Digit0]'],
                    singleModifierDispatchParts: [null],
                }, {
                    label: 'Ctrl+Alt+$',
                    ariaLabel: 'Control+Alt+$',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+alt+[Backslash]',
                    isWYSIWYG: false,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+alt+[Backslash]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+/', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */, [{
                    label: 'Ctrl+Shift+7',
                    ariaLabel: 'Control+Shift+7',
                    electronAccelerator: 'Ctrl+Shift+7',
                    userSettingsLabel: 'ctrl+shift+7',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+shift+[Digit7]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Shift+/', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 90 /* KeyCode.Slash */, [{
                    label: 'Ctrl+Shift+\'',
                    ariaLabel: 'Control+Shift+\'',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+shift+[Minus]',
                    isWYSIWYG: false,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+shift+[Minus]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+K Ctrl+\\', () => {
            _assertResolveKeybinding((0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */), []);
        });
        test('resolveKeybinding Ctrl+K Ctrl+=', () => {
            _assertResolveKeybinding((0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 86 /* KeyCode.Equal */), [{
                    label: 'Ctrl+K Ctrl+Shift+0',
                    ariaLabel: 'Control+K Control+Shift+0',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+shift+0',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['ctrl+[KeyK]', 'ctrl+shift+[Digit0]'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeybinding Ctrl+DownArrow', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */, [{
                    label: 'Ctrl+DownArrow',
                    ariaLabel: 'Control+DownArrow',
                    electronAccelerator: 'Ctrl+Down',
                    userSettingsLabel: 'ctrl+down',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[ArrowDown]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+NUMPAD_0', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 98 /* KeyCode.Numpad0 */, [{
                    label: 'Ctrl+NumPad0',
                    ariaLabel: 'Control+NumPad0',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+numpad0',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[Numpad0]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Home', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 14 /* KeyCode.Home */, [{
                    label: 'Ctrl+Home',
                    ariaLabel: 'Control+Home',
                    electronAccelerator: 'Ctrl+Home',
                    userSettingsLabel: 'ctrl+home',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[Home]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+[Home]', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'Home'
            }, {
                label: 'Ctrl+Home',
                ariaLabel: 'Control+Home',
                electronAccelerator: 'Ctrl+Home',
                userSettingsLabel: 'ctrl+home',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+[Home]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeyboardEvent Ctrl+[KeyX]', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'KeyX'
            }, {
                label: 'Ctrl+X',
                ariaLabel: 'Control+X',
                electronAccelerator: 'Ctrl+X',
                userSettingsLabel: 'ctrl+x',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+[KeyX]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveUserBinding Ctrl+[Comma] Ctrl+/', () => {
            (0, keyboardMapperTestUtils_1.$egc)(mapper, new keybindings_1.$Aq([
                new keybindings_1.$zq(true, false, false, false, 60 /* ScanCode.Comma */),
                new keybindings_1.$yq(true, false, false, false, 90 /* KeyCode.Slash */),
            ]), [{
                    label: 'Ctrl+, Ctrl+Shift+7',
                    ariaLabel: 'Control+, Control+Shift+7',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+[Comma] ctrl+shift+7',
                    isWYSIWYG: false,
                    isMultiChord: true,
                    dispatchParts: ['ctrl+[Comma]', 'ctrl+shift+[Digit7]'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeyboardEvent Single Modifier ControlLeft+', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'ControlLeft'
            }, {
                label: 'Ctrl',
                ariaLabel: 'Control',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['ctrl'],
            });
        });
        test('resolveKeyboardEvent Single Modifier ControlRight+', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'ControlRight'
            }, {
                label: 'Ctrl',
                ariaLabel: 'Control',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['ctrl'],
            });
        });
    });
    suite('keyboardMapper - LINUX en_us', () => {
        let mapper;
        suiteSetup(async () => {
            const _mapper = await createKeyboardMapper(true, 'linux_en_us', false, 3 /* OperatingSystem.Linux */);
            mapper = _mapper;
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.$ggc)(WRITE_FILE_IF_DIFFERENT, mapper, 'linux_en_us.txt');
        });
        function _assertResolveKeybinding(k, expected) {
            (0, keyboardMapperTestUtils_1.$egc)(mapper, (0, keybindings_1.$wq)(k, 3 /* OperatingSystem.Linux */), expected);
        }
        test('resolveKeybinding Ctrl+A', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, [{
                    label: 'Ctrl+A',
                    ariaLabel: 'Control+A',
                    electronAccelerator: 'Ctrl+A',
                    userSettingsLabel: 'ctrl+a',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[KeyA]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Z', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 56 /* KeyCode.KeyZ */, [{
                    label: 'Ctrl+Z',
                    ariaLabel: 'Control+Z',
                    electronAccelerator: 'Ctrl+Z',
                    userSettingsLabel: 'ctrl+z',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[KeyZ]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+[KeyZ]', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'KeyZ'
            }, {
                label: 'Ctrl+Z',
                ariaLabel: 'Control+Z',
                electronAccelerator: 'Ctrl+Z',
                userSettingsLabel: 'ctrl+z',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+[KeyZ]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeybinding Ctrl+]', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 94 /* KeyCode.BracketRight */, [{
                    label: 'Ctrl+]',
                    ariaLabel: 'Control+]',
                    electronAccelerator: 'Ctrl+]',
                    userSettingsLabel: 'ctrl+]',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[BracketRight]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+[BracketRight]', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'BracketRight'
            }, {
                label: 'Ctrl+]',
                ariaLabel: 'Control+]',
                electronAccelerator: 'Ctrl+]',
                userSettingsLabel: 'ctrl+]',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+[BracketRight]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeybinding Shift+]', () => {
            _assertResolveKeybinding(1024 /* KeyMod.Shift */ | 94 /* KeyCode.BracketRight */, [{
                    label: 'Shift+]',
                    ariaLabel: 'Shift+]',
                    electronAccelerator: 'Shift+]',
                    userSettingsLabel: 'shift+]',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['shift+[BracketRight]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+/', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */, [{
                    label: 'Ctrl+/',
                    ariaLabel: 'Control+/',
                    electronAccelerator: 'Ctrl+/',
                    userSettingsLabel: 'ctrl+/',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[Slash]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Shift+/', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 90 /* KeyCode.Slash */, [{
                    label: 'Ctrl+Shift+/',
                    ariaLabel: 'Control+Shift+/',
                    electronAccelerator: 'Ctrl+Shift+/',
                    userSettingsLabel: 'ctrl+shift+/',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+shift+[Slash]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+K Ctrl+\\', () => {
            _assertResolveKeybinding((0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */), [{
                    label: 'Ctrl+K Ctrl+\\',
                    ariaLabel: 'Control+K Control+\\',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+\\',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['ctrl+[KeyK]', 'ctrl+[Backslash]'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeybinding Ctrl+K Ctrl+=', () => {
            _assertResolveKeybinding((0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 86 /* KeyCode.Equal */), [{
                    label: 'Ctrl+K Ctrl+=',
                    ariaLabel: 'Control+K Control+=',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+=',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['ctrl+[KeyK]', 'ctrl+[Equal]'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeybinding Ctrl+DownArrow', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */, [{
                    label: 'Ctrl+DownArrow',
                    ariaLabel: 'Control+DownArrow',
                    electronAccelerator: 'Ctrl+Down',
                    userSettingsLabel: 'ctrl+down',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[ArrowDown]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+NUMPAD_0', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 98 /* KeyCode.Numpad0 */, [{
                    label: 'Ctrl+NumPad0',
                    ariaLabel: 'Control+NumPad0',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+numpad0',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[Numpad0]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Home', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 14 /* KeyCode.Home */, [{
                    label: 'Ctrl+Home',
                    ariaLabel: 'Control+Home',
                    electronAccelerator: 'Ctrl+Home',
                    userSettingsLabel: 'ctrl+home',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[Home]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+[Home]', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'Home'
            }, {
                label: 'Ctrl+Home',
                ariaLabel: 'Control+Home',
                electronAccelerator: 'Ctrl+Home',
                userSettingsLabel: 'ctrl+home',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+[Home]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeybinding Ctrl+Shift+,', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 87 /* KeyCode.Comma */, [{
                    label: 'Ctrl+Shift+,',
                    ariaLabel: 'Control+Shift+,',
                    electronAccelerator: 'Ctrl+Shift+,',
                    userSettingsLabel: 'ctrl+shift+,',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+shift+[Comma]'],
                    singleModifierDispatchParts: [null],
                }, {
                    label: 'Ctrl+<',
                    ariaLabel: 'Control+<',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+[IntlBackslash]',
                    isWYSIWYG: false,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[IntlBackslash]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('issue #23393: resolveKeybinding Ctrl+Enter', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */, [{
                    label: 'Ctrl+Enter',
                    ariaLabel: 'Control+Enter',
                    electronAccelerator: 'Ctrl+Enter',
                    userSettingsLabel: 'ctrl+enter',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[Enter]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('issue #23393: resolveKeyboardEvent Ctrl+[NumpadEnter]', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'NumpadEnter'
            }, {
                label: 'Ctrl+Enter',
                ariaLabel: 'Control+Enter',
                electronAccelerator: 'Ctrl+Enter',
                userSettingsLabel: 'ctrl+enter',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+[Enter]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveUserBinding Ctrl+[Comma] Ctrl+/', () => {
            (0, keyboardMapperTestUtils_1.$egc)(mapper, new keybindings_1.$Aq([
                new keybindings_1.$zq(true, false, false, false, 60 /* ScanCode.Comma */),
                new keybindings_1.$yq(true, false, false, false, 90 /* KeyCode.Slash */),
            ]), [{
                    label: 'Ctrl+, Ctrl+/',
                    ariaLabel: 'Control+, Control+/',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+, ctrl+/',
                    isWYSIWYG: true,
                    isMultiChord: true,
                    dispatchParts: ['ctrl+[Comma]', 'ctrl+[Slash]'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveUserBinding Ctrl+[Comma]', () => {
            (0, keyboardMapperTestUtils_1.$egc)(mapper, new keybindings_1.$Aq([
                new keybindings_1.$zq(true, false, false, false, 60 /* ScanCode.Comma */)
            ]), [{
                    label: 'Ctrl+,',
                    ariaLabel: 'Control+,',
                    electronAccelerator: 'Ctrl+,',
                    userSettingsLabel: 'ctrl+,',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[Comma]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Single Modifier ControlLeft+', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'ControlLeft'
            }, {
                label: 'Ctrl',
                ariaLabel: 'Control',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['ctrl'],
            });
        });
        test('resolveKeyboardEvent Single Modifier ControlRight+', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'ControlRight'
            }, {
                label: 'Ctrl',
                ariaLabel: 'Control',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['ctrl'],
            });
        });
        test('resolveKeyboardEvent Single Modifier ShiftLeft+', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'ShiftLeft'
            }, {
                label: 'Shift',
                ariaLabel: 'Shift',
                electronAccelerator: null,
                userSettingsLabel: 'shift',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['shift'],
            });
        });
        test('resolveKeyboardEvent Single Modifier ShiftRight+', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'ShiftRight'
            }, {
                label: 'Shift',
                ariaLabel: 'Shift',
                electronAccelerator: null,
                userSettingsLabel: 'shift',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['shift'],
            });
        });
        test('resolveKeyboardEvent Single Modifier AltLeft+', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: true,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'AltLeft'
            }, {
                label: 'Alt',
                ariaLabel: 'Alt',
                electronAccelerator: null,
                userSettingsLabel: 'alt',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['alt'],
            });
        });
        test('resolveKeyboardEvent Single Modifier AltRight+', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: true,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'AltRight'
            }, {
                label: 'Alt',
                ariaLabel: 'Alt',
                electronAccelerator: null,
                userSettingsLabel: 'alt',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['alt'],
            });
        });
        test('resolveKeyboardEvent Single Modifier MetaLeft+', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: -1,
                code: 'MetaLeft'
            }, {
                label: 'Super',
                ariaLabel: 'Super',
                electronAccelerator: null,
                userSettingsLabel: 'meta',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['meta'],
            });
        });
        test('resolveKeyboardEvent Single Modifier MetaRight+', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                altGraphKey: false,
                keyCode: -1,
                code: 'MetaRight'
            }, {
                label: 'Super',
                ariaLabel: 'Super',
                electronAccelerator: null,
                userSettingsLabel: 'meta',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['meta'],
            });
        });
        test('resolveKeyboardEvent Only Modifiers Ctrl+Shift+', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: true,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'ShiftLeft'
            }, {
                label: 'Ctrl+Shift',
                ariaLabel: 'Control+Shift',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+shift',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeyboardEvent mapAltGrToCtrlAlt AltGr+Z', async () => {
            const mapper = await createKeyboardMapper(true, 'linux_en_us', true, 3 /* OperatingSystem.Linux */);
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: true,
                keyCode: -1,
                code: 'KeyZ'
            }, {
                label: 'Ctrl+Alt+Z',
                ariaLabel: 'Control+Alt+Z',
                electronAccelerator: 'Ctrl+Alt+Z',
                userSettingsLabel: 'ctrl+alt+z',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+alt+[KeyZ]'],
                singleModifierDispatchParts: [null],
            });
        });
    });
    suite('keyboardMapper', () => {
        test('issue #23706: Linux UK layout: Ctrl + Apostrophe also toggles terminal', () => {
            const mapper = new macLinuxKeyboardMapper_1.$q3b(false, {
                'Backquote': {
                    'value': '`',
                    'withShift': '¬',
                    'withAltGr': '|',
                    'withShiftAltGr': '|'
                }
            }, false, 3 /* OperatingSystem.Linux */);
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'Backquote'
            }, {
                label: 'Ctrl+`',
                ariaLabel: 'Control+`',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+`',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+[Backquote]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('issue #24064: NumLock/NumPad keys stopped working in 1.11 on Linux', () => {
            const mapper = new macLinuxKeyboardMapper_1.$q3b(false, {}, false, 3 /* OperatingSystem.Linux */);
            function assertNumpadKeyboardEvent(keyCode, code, label, electronAccelerator, userSettingsLabel, dispatch) {
                (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                    _standardKeyboardEventBrand: true,
                    ctrlKey: false,
                    shiftKey: false,
                    altKey: false,
                    metaKey: false,
                    altGraphKey: false,
                    keyCode: keyCode,
                    code: code
                }, {
                    label: label,
                    ariaLabel: label,
                    electronAccelerator: electronAccelerator,
                    userSettingsLabel: userSettingsLabel,
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: [dispatch],
                    singleModifierDispatchParts: [null],
                });
            }
            assertNumpadKeyboardEvent(13 /* KeyCode.End */, 'Numpad1', 'End', 'End', 'end', '[End]');
            assertNumpadKeyboardEvent(18 /* KeyCode.DownArrow */, 'Numpad2', 'DownArrow', 'Down', 'down', '[ArrowDown]');
            assertNumpadKeyboardEvent(12 /* KeyCode.PageDown */, 'Numpad3', 'PageDown', 'PageDown', 'pagedown', '[PageDown]');
            assertNumpadKeyboardEvent(15 /* KeyCode.LeftArrow */, 'Numpad4', 'LeftArrow', 'Left', 'left', '[ArrowLeft]');
            assertNumpadKeyboardEvent(0 /* KeyCode.Unknown */, 'Numpad5', 'NumPad5', null, 'numpad5', '[Numpad5]');
            assertNumpadKeyboardEvent(17 /* KeyCode.RightArrow */, 'Numpad6', 'RightArrow', 'Right', 'right', '[ArrowRight]');
            assertNumpadKeyboardEvent(14 /* KeyCode.Home */, 'Numpad7', 'Home', 'Home', 'home', '[Home]');
            assertNumpadKeyboardEvent(16 /* KeyCode.UpArrow */, 'Numpad8', 'UpArrow', 'Up', 'up', '[ArrowUp]');
            assertNumpadKeyboardEvent(11 /* KeyCode.PageUp */, 'Numpad9', 'PageUp', 'PageUp', 'pageup', '[PageUp]');
            assertNumpadKeyboardEvent(19 /* KeyCode.Insert */, 'Numpad0', 'Insert', 'Insert', 'insert', '[Insert]');
            assertNumpadKeyboardEvent(20 /* KeyCode.Delete */, 'NumpadDecimal', 'Delete', 'Delete', 'delete', '[Delete]');
        });
        test('issue #24107: Delete, Insert, Home, End, PgUp, PgDn, and arrow keys no longer work editor in 1.11', () => {
            const mapper = new macLinuxKeyboardMapper_1.$q3b(false, {}, false, 3 /* OperatingSystem.Linux */);
            function assertKeyboardEvent(keyCode, code, label, electronAccelerator, userSettingsLabel, dispatch) {
                (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                    _standardKeyboardEventBrand: true,
                    ctrlKey: false,
                    shiftKey: false,
                    altKey: false,
                    metaKey: false,
                    altGraphKey: false,
                    keyCode: keyCode,
                    code: code
                }, {
                    label: label,
                    ariaLabel: label,
                    electronAccelerator: electronAccelerator,
                    userSettingsLabel: userSettingsLabel,
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: [dispatch],
                    singleModifierDispatchParts: [null],
                });
            }
            // https://github.com/microsoft/vscode/issues/24107#issuecomment-292318497
            assertKeyboardEvent(16 /* KeyCode.UpArrow */, 'Lang3', 'UpArrow', 'Up', 'up', '[ArrowUp]');
            assertKeyboardEvent(18 /* KeyCode.DownArrow */, 'NumpadEnter', 'DownArrow', 'Down', 'down', '[ArrowDown]');
            assertKeyboardEvent(15 /* KeyCode.LeftArrow */, 'Convert', 'LeftArrow', 'Left', 'left', '[ArrowLeft]');
            assertKeyboardEvent(17 /* KeyCode.RightArrow */, 'NonConvert', 'RightArrow', 'Right', 'right', '[ArrowRight]');
            assertKeyboardEvent(20 /* KeyCode.Delete */, 'PrintScreen', 'Delete', 'Delete', 'delete', '[Delete]');
            assertKeyboardEvent(19 /* KeyCode.Insert */, 'NumpadDivide', 'Insert', 'Insert', 'insert', '[Insert]');
            assertKeyboardEvent(13 /* KeyCode.End */, 'Unknown', 'End', 'End', 'end', '[End]');
            assertKeyboardEvent(14 /* KeyCode.Home */, 'IntlRo', 'Home', 'Home', 'home', '[Home]');
            assertKeyboardEvent(12 /* KeyCode.PageDown */, 'ControlRight', 'PageDown', 'PageDown', 'pagedown', '[PageDown]');
            assertKeyboardEvent(11 /* KeyCode.PageUp */, 'Lang4', 'PageUp', 'PageUp', 'pageup', '[PageUp]');
            // https://github.com/microsoft/vscode/issues/24107#issuecomment-292323924
            assertKeyboardEvent(12 /* KeyCode.PageDown */, 'ControlRight', 'PageDown', 'PageDown', 'pagedown', '[PageDown]');
            assertKeyboardEvent(11 /* KeyCode.PageUp */, 'Lang4', 'PageUp', 'PageUp', 'pageup', '[PageUp]');
            assertKeyboardEvent(13 /* KeyCode.End */, '', 'End', 'End', 'end', '[End]');
            assertKeyboardEvent(14 /* KeyCode.Home */, 'IntlRo', 'Home', 'Home', 'home', '[Home]');
            assertKeyboardEvent(20 /* KeyCode.Delete */, 'PrintScreen', 'Delete', 'Delete', 'delete', '[Delete]');
            assertKeyboardEvent(19 /* KeyCode.Insert */, 'NumpadDivide', 'Insert', 'Insert', 'insert', '[Insert]');
            assertKeyboardEvent(17 /* KeyCode.RightArrow */, 'NonConvert', 'RightArrow', 'Right', 'right', '[ArrowRight]');
            assertKeyboardEvent(15 /* KeyCode.LeftArrow */, 'Convert', 'LeftArrow', 'Left', 'left', '[ArrowLeft]');
            assertKeyboardEvent(18 /* KeyCode.DownArrow */, 'NumpadEnter', 'DownArrow', 'Down', 'down', '[ArrowDown]');
            assertKeyboardEvent(16 /* KeyCode.UpArrow */, 'Lang3', 'UpArrow', 'Up', 'up', '[ArrowUp]');
        });
    });
    suite('keyboardMapper - LINUX ru', () => {
        let mapper;
        suiteSetup(async () => {
            const _mapper = await createKeyboardMapper(false, 'linux_ru', false, 3 /* OperatingSystem.Linux */);
            mapper = _mapper;
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.$ggc)(WRITE_FILE_IF_DIFFERENT, mapper, 'linux_ru.txt');
        });
        function _assertResolveKeybinding(k, expected) {
            (0, keyboardMapperTestUtils_1.$egc)(mapper, (0, keybindings_1.$wq)(k, 3 /* OperatingSystem.Linux */), expected);
        }
        test('resolveKeybinding Ctrl+S', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 49 /* KeyCode.KeyS */, [{
                    label: 'Ctrl+S',
                    ariaLabel: 'Control+S',
                    electronAccelerator: 'Ctrl+S',
                    userSettingsLabel: 'ctrl+s',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['ctrl+[KeyS]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
    });
    suite('keyboardMapper - LINUX en_uk', () => {
        let mapper;
        suiteSetup(async () => {
            const _mapper = await createKeyboardMapper(false, 'linux_en_uk', false, 3 /* OperatingSystem.Linux */);
            mapper = _mapper;
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.$ggc)(WRITE_FILE_IF_DIFFERENT, mapper, 'linux_en_uk.txt');
        });
        test('issue #24522: resolveKeyboardEvent Ctrl+Alt+[Minus]', () => {
            (0, keyboardMapperTestUtils_1.$dgc)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: true,
                metaKey: false,
                altGraphKey: false,
                keyCode: -1,
                code: 'Minus'
            }, {
                label: 'Ctrl+Alt+-',
                ariaLabel: 'Control+Alt+-',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+alt+[Minus]',
                isWYSIWYG: false,
                isMultiChord: false,
                dispatchParts: ['ctrl+alt+[Minus]'],
                singleModifierDispatchParts: [null],
            });
        });
    });
    suite('keyboardMapper - MAC zh_hant', () => {
        let mapper;
        suiteSetup(async () => {
            const _mapper = await createKeyboardMapper(false, 'mac_zh_hant', false, 2 /* OperatingSystem.Macintosh */);
            mapper = _mapper;
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.$ggc)(WRITE_FILE_IF_DIFFERENT, mapper, 'mac_zh_hant.txt');
        });
        function _assertResolveKeybinding(k, expected) {
            (0, keyboardMapperTestUtils_1.$egc)(mapper, (0, keybindings_1.$wq)(k, 2 /* OperatingSystem.Macintosh */), expected);
        }
        test('issue #28237 resolveKeybinding Cmd+C', () => {
            _assertResolveKeybinding(2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */, [{
                    label: '⌘C',
                    ariaLabel: 'Command+C',
                    electronAccelerator: 'Cmd+C',
                    userSettingsLabel: 'cmd+c',
                    isWYSIWYG: true,
                    isMultiChord: false,
                    dispatchParts: ['meta+[KeyC]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
    });
    suite('keyboardMapper - MAC zh_hant2', () => {
        let mapper;
        suiteSetup(async () => {
            const _mapper = await createKeyboardMapper(false, 'mac_zh_hant2', false, 2 /* OperatingSystem.Macintosh */);
            mapper = _mapper;
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.$ggc)(WRITE_FILE_IF_DIFFERENT, mapper, 'mac_zh_hant2.txt');
        });
    });
    function _assertKeybindingTranslation(mapper, OS, kb, _expected) {
        let expected;
        if (typeof _expected === 'string') {
            expected = [_expected];
        }
        else if (Array.isArray(_expected)) {
            expected = _expected;
        }
        else {
            expected = [];
        }
        const runtimeKeybinding = (0, keybindings_1.$xq)(kb, OS);
        const keybindingLabel = new usLayoutResolvedKeybinding_1.$n3b([runtimeKeybinding], OS).getUserSettingsLabel();
        const actualHardwareKeypresses = mapper.keyCodeChordToScanCodeChord(runtimeKeybinding);
        if (actualHardwareKeypresses.length === 0) {
            assert.deepStrictEqual([], expected, `simpleKeybindingToHardwareKeypress -- "${keybindingLabel}" -- actual: "[]" -- expected: "${expected}"`);
            return;
        }
        const actual = actualHardwareKeypresses
            .map(k => keybindingLabels_1.$RR.toLabel(OS, [k], (keybinding) => keyCodes_1.$sq.toString(keybinding.scanCode)));
        assert.deepStrictEqual(actual, expected, `simpleKeybindingToHardwareKeypress -- "${keybindingLabel}" -- actual: "${actual}" -- expected: "${expected}"`);
    }
});
//# sourceMappingURL=macLinuxKeyboardMapper.test.js.map