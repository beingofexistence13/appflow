/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/keyCodes", "vs/base/common/keybindings"], function (require, exports, assert, keyCodes_1, keybindings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('keyCodes', () => {
        function testBinaryEncoding(expected, k, OS) {
            assert.deepStrictEqual((0, keybindings_1.$wq)(k, OS), expected);
        }
        test('mapping for Minus', () => {
            // [147, 83, 0, ScanCode.Minus, 'Minus', KeyCode.US_MINUS, '-', 189, 'VK_OEM_MINUS', '-', 'OEM_MINUS'],
            assert.strictEqual(keyCodes_1.$qq[189], 88 /* KeyCode.Minus */);
            assert.strictEqual(keyCodes_1.$rq['VK_OEM_MINUS'], 88 /* KeyCode.Minus */);
            assert.strictEqual(keyCodes_1.$sq.lowerCaseToEnum('minus'), 51 /* ScanCode.Minus */);
            assert.strictEqual(keyCodes_1.$sq.toEnum('Minus'), 51 /* ScanCode.Minus */);
            assert.strictEqual(keyCodes_1.$sq.toString(51 /* ScanCode.Minus */), 'Minus');
            assert.strictEqual(keyCodes_1.$tq[51 /* ScanCode.Minus */], -1 /* KeyCode.DependsOnKbLayout */);
            assert.strictEqual(keyCodes_1.$uq[88 /* KeyCode.Minus */], -1 /* ScanCode.DependsOnKbLayout */);
            assert.strictEqual(keyCodes_1.KeyCodeUtils.toString(88 /* KeyCode.Minus */), '-');
            assert.strictEqual(keyCodes_1.KeyCodeUtils.fromString('-'), 88 /* KeyCode.Minus */);
            assert.strictEqual(keyCodes_1.KeyCodeUtils.toUserSettingsUS(88 /* KeyCode.Minus */), '-');
            assert.strictEqual(keyCodes_1.KeyCodeUtils.toUserSettingsGeneral(88 /* KeyCode.Minus */), 'OEM_MINUS');
            assert.strictEqual(keyCodes_1.KeyCodeUtils.fromUserSettings('-'), 88 /* KeyCode.Minus */);
            assert.strictEqual(keyCodes_1.KeyCodeUtils.fromUserSettings('OEM_MINUS'), 88 /* KeyCode.Minus */);
            assert.strictEqual(keyCodes_1.KeyCodeUtils.fromUserSettings('oem_minus'), 88 /* KeyCode.Minus */);
        });
        test('mapping for Space', () => {
            // [21, 10, 1, ScanCode.Space, 'Space', KeyCode.Space, 'Space', 32, 'VK_SPACE', empty, empty],
            assert.strictEqual(keyCodes_1.$qq[32], 10 /* KeyCode.Space */);
            assert.strictEqual(keyCodes_1.$rq['VK_SPACE'], 10 /* KeyCode.Space */);
            assert.strictEqual(keyCodes_1.$sq.lowerCaseToEnum('space'), 50 /* ScanCode.Space */);
            assert.strictEqual(keyCodes_1.$sq.toEnum('Space'), 50 /* ScanCode.Space */);
            assert.strictEqual(keyCodes_1.$sq.toString(50 /* ScanCode.Space */), 'Space');
            assert.strictEqual(keyCodes_1.$tq[50 /* ScanCode.Space */], 10 /* KeyCode.Space */);
            assert.strictEqual(keyCodes_1.$uq[10 /* KeyCode.Space */], 50 /* ScanCode.Space */);
            assert.strictEqual(keyCodes_1.KeyCodeUtils.toString(10 /* KeyCode.Space */), 'Space');
            assert.strictEqual(keyCodes_1.KeyCodeUtils.fromString('Space'), 10 /* KeyCode.Space */);
            assert.strictEqual(keyCodes_1.KeyCodeUtils.toUserSettingsUS(10 /* KeyCode.Space */), 'Space');
            assert.strictEqual(keyCodes_1.KeyCodeUtils.toUserSettingsGeneral(10 /* KeyCode.Space */), 'Space');
            assert.strictEqual(keyCodes_1.KeyCodeUtils.fromUserSettings('Space'), 10 /* KeyCode.Space */);
            assert.strictEqual(keyCodes_1.KeyCodeUtils.fromUserSettings('space'), 10 /* KeyCode.Space */);
        });
        test('MAC binary encoding', () => {
            function test(expected, k) {
                testBinaryEncoding(expected, k, 2 /* OperatingSystem.Macintosh */);
            }
            test(null, 0);
            test(new keybindings_1.$yq(false, false, false, false, 3 /* KeyCode.Enter */).toKeybinding(), 3 /* KeyCode.Enter */);
            test(new keybindings_1.$yq(true, false, false, false, 3 /* KeyCode.Enter */).toKeybinding(), 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
            test(new keybindings_1.$yq(false, false, true, false, 3 /* KeyCode.Enter */).toKeybinding(), 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */);
            test(new keybindings_1.$yq(true, false, true, false, 3 /* KeyCode.Enter */).toKeybinding(), 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
            test(new keybindings_1.$yq(false, true, false, false, 3 /* KeyCode.Enter */).toKeybinding(), 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */);
            test(new keybindings_1.$yq(true, true, false, false, 3 /* KeyCode.Enter */).toKeybinding(), 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
            test(new keybindings_1.$yq(false, true, true, false, 3 /* KeyCode.Enter */).toKeybinding(), 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */);
            test(new keybindings_1.$yq(true, true, true, false, 3 /* KeyCode.Enter */).toKeybinding(), 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
            test(new keybindings_1.$yq(false, false, false, true, 3 /* KeyCode.Enter */).toKeybinding(), 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */);
            test(new keybindings_1.$yq(true, false, false, true, 3 /* KeyCode.Enter */).toKeybinding(), 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
            test(new keybindings_1.$yq(false, false, true, true, 3 /* KeyCode.Enter */).toKeybinding(), 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */);
            test(new keybindings_1.$yq(true, false, true, true, 3 /* KeyCode.Enter */).toKeybinding(), 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
            test(new keybindings_1.$yq(false, true, false, true, 3 /* KeyCode.Enter */).toKeybinding(), 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */);
            test(new keybindings_1.$yq(true, true, false, true, 3 /* KeyCode.Enter */).toKeybinding(), 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
            test(new keybindings_1.$yq(false, true, true, true, 3 /* KeyCode.Enter */).toKeybinding(), 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */);
            test(new keybindings_1.$yq(true, true, true, true, 3 /* KeyCode.Enter */).toKeybinding(), 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
            test(new keybindings_1.$Aq([
                new keybindings_1.$yq(false, false, false, false, 3 /* KeyCode.Enter */),
                new keybindings_1.$yq(false, false, false, false, 2 /* KeyCode.Tab */)
            ]), (0, keyCodes_1.$vq)(3 /* KeyCode.Enter */, 2 /* KeyCode.Tab */));
            test(new keybindings_1.$Aq([
                new keybindings_1.$yq(false, false, false, true, 55 /* KeyCode.KeyY */),
                new keybindings_1.$yq(false, false, false, false, 56 /* KeyCode.KeyZ */)
            ]), (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 56 /* KeyCode.KeyZ */));
        });
        test('WINDOWS & LINUX binary encoding', () => {
            [3 /* OperatingSystem.Linux */, 1 /* OperatingSystem.Windows */].forEach((OS) => {
                function test(expected, k) {
                    testBinaryEncoding(expected, k, OS);
                }
                test(null, 0);
                test(new keybindings_1.$yq(false, false, false, false, 3 /* KeyCode.Enter */).toKeybinding(), 3 /* KeyCode.Enter */);
                test(new keybindings_1.$yq(false, false, false, true, 3 /* KeyCode.Enter */).toKeybinding(), 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
                test(new keybindings_1.$yq(false, false, true, false, 3 /* KeyCode.Enter */).toKeybinding(), 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */);
                test(new keybindings_1.$yq(false, false, true, true, 3 /* KeyCode.Enter */).toKeybinding(), 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
                test(new keybindings_1.$yq(false, true, false, false, 3 /* KeyCode.Enter */).toKeybinding(), 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */);
                test(new keybindings_1.$yq(false, true, false, true, 3 /* KeyCode.Enter */).toKeybinding(), 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
                test(new keybindings_1.$yq(false, true, true, false, 3 /* KeyCode.Enter */).toKeybinding(), 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */);
                test(new keybindings_1.$yq(false, true, true, true, 3 /* KeyCode.Enter */).toKeybinding(), 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
                test(new keybindings_1.$yq(true, false, false, false, 3 /* KeyCode.Enter */).toKeybinding(), 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */);
                test(new keybindings_1.$yq(true, false, false, true, 3 /* KeyCode.Enter */).toKeybinding(), 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
                test(new keybindings_1.$yq(true, false, true, false, 3 /* KeyCode.Enter */).toKeybinding(), 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */);
                test(new keybindings_1.$yq(true, false, true, true, 3 /* KeyCode.Enter */).toKeybinding(), 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
                test(new keybindings_1.$yq(true, true, false, false, 3 /* KeyCode.Enter */).toKeybinding(), 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */);
                test(new keybindings_1.$yq(true, true, false, true, 3 /* KeyCode.Enter */).toKeybinding(), 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
                test(new keybindings_1.$yq(true, true, true, false, 3 /* KeyCode.Enter */).toKeybinding(), 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */);
                test(new keybindings_1.$yq(true, true, true, true, 3 /* KeyCode.Enter */).toKeybinding(), 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */);
                test(new keybindings_1.$Aq([
                    new keybindings_1.$yq(false, false, false, false, 3 /* KeyCode.Enter */),
                    new keybindings_1.$yq(false, false, false, false, 2 /* KeyCode.Tab */)
                ]), (0, keyCodes_1.$vq)(3 /* KeyCode.Enter */, 2 /* KeyCode.Tab */));
                test(new keybindings_1.$Aq([
                    new keybindings_1.$yq(true, false, false, false, 55 /* KeyCode.KeyY */),
                    new keybindings_1.$yq(false, false, false, false, 56 /* KeyCode.KeyZ */)
                ]), (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 55 /* KeyCode.KeyY */, 56 /* KeyCode.KeyZ */));
            });
        });
    });
});
//# sourceMappingURL=keyCodes.test.js.map