define(["require", "exports", "assert", "vs/base/common/keyCodes", "vs/base/common/keybindings", "vs/base/common/keybindingParser", "vs/workbench/services/keybinding/common/keybindingIO", "vs/platform/keybinding/test/common/keybindingsTestUtils"], function (require, exports, assert, keyCodes_1, keybindings_1, keybindingParser_1, keybindingIO_1, keybindingsTestUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('keybindingIO', () => {
        test('serialize/deserialize', () => {
            function testOneSerialization(keybinding, expected, msg, OS) {
                const usLayoutResolvedKeybinding = (0, keybindingsTestUtils_1.createUSLayoutResolvedKeybinding)(keybinding, OS);
                const actualSerialized = usLayoutResolvedKeybinding.getUserSettingsLabel();
                assert.strictEqual(actualSerialized, expected, expected + ' - ' + msg);
            }
            function testSerialization(keybinding, expectedWin, expectedMac, expectedLinux) {
                testOneSerialization(keybinding, expectedWin, 'win', 1 /* OperatingSystem.Windows */);
                testOneSerialization(keybinding, expectedMac, 'mac', 2 /* OperatingSystem.Macintosh */);
                testOneSerialization(keybinding, expectedLinux, 'linux', 3 /* OperatingSystem.Linux */);
            }
            function testOneDeserialization(keybinding, _expected, msg, OS) {
                const actualDeserialized = keybindingParser_1.KeybindingParser.parseKeybinding(keybinding);
                const expected = (0, keybindings_1.decodeKeybinding)(_expected, OS);
                assert.deepStrictEqual(actualDeserialized, expected, keybinding + ' - ' + msg);
            }
            function testDeserialization(inWin, inMac, inLinux, expected) {
                testOneDeserialization(inWin, expected, 'win', 1 /* OperatingSystem.Windows */);
                testOneDeserialization(inMac, expected, 'mac', 2 /* OperatingSystem.Macintosh */);
                testOneDeserialization(inLinux, expected, 'linux', 3 /* OperatingSystem.Linux */);
            }
            function testRoundtrip(keybinding, expectedWin, expectedMac, expectedLinux) {
                testSerialization(keybinding, expectedWin, expectedMac, expectedLinux);
                testDeserialization(expectedWin, expectedMac, expectedLinux, keybinding);
            }
            testRoundtrip(21 /* KeyCode.Digit0 */, '0', '0', '0');
            testRoundtrip(31 /* KeyCode.KeyA */, 'a', 'a', 'a');
            testRoundtrip(16 /* KeyCode.UpArrow */, 'up', 'up', 'up');
            testRoundtrip(17 /* KeyCode.RightArrow */, 'right', 'right', 'right');
            testRoundtrip(18 /* KeyCode.DownArrow */, 'down', 'down', 'down');
            testRoundtrip(15 /* KeyCode.LeftArrow */, 'left', 'left', 'left');
            // one modifier
            testRoundtrip(512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'alt+a', 'alt+a', 'alt+a');
            testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 'ctrl+a', 'cmd+a', 'ctrl+a');
            testRoundtrip(1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */, 'shift+a', 'shift+a', 'shift+a');
            testRoundtrip(256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'win+a', 'ctrl+a', 'meta+a');
            // two modifiers
            testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'ctrl+alt+a', 'alt+cmd+a', 'ctrl+alt+a');
            testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */, 'ctrl+shift+a', 'shift+cmd+a', 'ctrl+shift+a');
            testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'ctrl+win+a', 'ctrl+cmd+a', 'ctrl+meta+a');
            testRoundtrip(1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'shift+alt+a', 'shift+alt+a', 'shift+alt+a');
            testRoundtrip(1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'shift+win+a', 'ctrl+shift+a', 'shift+meta+a');
            testRoundtrip(512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'alt+win+a', 'ctrl+alt+a', 'alt+meta+a');
            // three modifiers
            testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'ctrl+shift+alt+a', 'shift+alt+cmd+a', 'ctrl+shift+alt+a');
            testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'ctrl+shift+win+a', 'ctrl+shift+cmd+a', 'ctrl+shift+meta+a');
            testRoundtrip(1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'shift+alt+win+a', 'ctrl+shift+alt+a', 'shift+alt+meta+a');
            // all modifiers
            testRoundtrip(2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'ctrl+shift+alt+win+a', 'ctrl+shift+alt+cmd+a', 'ctrl+shift+alt+meta+a');
            // chords
            testRoundtrip((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */), 'ctrl+a ctrl+a', 'cmd+a cmd+a', 'ctrl+a ctrl+a');
            testRoundtrip((0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */, 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */), 'ctrl+up ctrl+up', 'cmd+up cmd+up', 'ctrl+up ctrl+up');
            // OEM keys
            testRoundtrip(85 /* KeyCode.Semicolon */, ';', ';', ';');
            testRoundtrip(86 /* KeyCode.Equal */, '=', '=', '=');
            testRoundtrip(87 /* KeyCode.Comma */, ',', ',', ',');
            testRoundtrip(88 /* KeyCode.Minus */, '-', '-', '-');
            testRoundtrip(89 /* KeyCode.Period */, '.', '.', '.');
            testRoundtrip(90 /* KeyCode.Slash */, '/', '/', '/');
            testRoundtrip(91 /* KeyCode.Backquote */, '`', '`', '`');
            testRoundtrip(115 /* KeyCode.ABNT_C1 */, 'abnt_c1', 'abnt_c1', 'abnt_c1');
            testRoundtrip(116 /* KeyCode.ABNT_C2 */, 'abnt_c2', 'abnt_c2', 'abnt_c2');
            testRoundtrip(92 /* KeyCode.BracketLeft */, '[', '[', '[');
            testRoundtrip(93 /* KeyCode.Backslash */, '\\', '\\', '\\');
            testRoundtrip(94 /* KeyCode.BracketRight */, ']', ']', ']');
            testRoundtrip(95 /* KeyCode.Quote */, '\'', '\'', '\'');
            testRoundtrip(96 /* KeyCode.OEM_8 */, 'oem_8', 'oem_8', 'oem_8');
            testRoundtrip(97 /* KeyCode.IntlBackslash */, 'oem_102', 'oem_102', 'oem_102');
            // OEM aliases
            testDeserialization('OEM_1', 'OEM_1', 'OEM_1', 85 /* KeyCode.Semicolon */);
            testDeserialization('OEM_PLUS', 'OEM_PLUS', 'OEM_PLUS', 86 /* KeyCode.Equal */);
            testDeserialization('OEM_COMMA', 'OEM_COMMA', 'OEM_COMMA', 87 /* KeyCode.Comma */);
            testDeserialization('OEM_MINUS', 'OEM_MINUS', 'OEM_MINUS', 88 /* KeyCode.Minus */);
            testDeserialization('OEM_PERIOD', 'OEM_PERIOD', 'OEM_PERIOD', 89 /* KeyCode.Period */);
            testDeserialization('OEM_2', 'OEM_2', 'OEM_2', 90 /* KeyCode.Slash */);
            testDeserialization('OEM_3', 'OEM_3', 'OEM_3', 91 /* KeyCode.Backquote */);
            testDeserialization('ABNT_C1', 'ABNT_C1', 'ABNT_C1', 115 /* KeyCode.ABNT_C1 */);
            testDeserialization('ABNT_C2', 'ABNT_C2', 'ABNT_C2', 116 /* KeyCode.ABNT_C2 */);
            testDeserialization('OEM_4', 'OEM_4', 'OEM_4', 92 /* KeyCode.BracketLeft */);
            testDeserialization('OEM_5', 'OEM_5', 'OEM_5', 93 /* KeyCode.Backslash */);
            testDeserialization('OEM_6', 'OEM_6', 'OEM_6', 94 /* KeyCode.BracketRight */);
            testDeserialization('OEM_7', 'OEM_7', 'OEM_7', 95 /* KeyCode.Quote */);
            testDeserialization('OEM_8', 'OEM_8', 'OEM_8', 96 /* KeyCode.OEM_8 */);
            testDeserialization('OEM_102', 'OEM_102', 'OEM_102', 97 /* KeyCode.IntlBackslash */);
            // accepts '-' as separator
            testDeserialization('ctrl-shift-alt-win-a', 'ctrl-shift-alt-cmd-a', 'ctrl-shift-alt-meta-a', 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */);
            // various input mistakes
            testDeserialization(' ctrl-shift-alt-win-A ', ' shift-alt-cmd-Ctrl-A ', ' ctrl-shift-alt-META-A ', 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */);
        });
        test('deserialize scan codes', () => {
            assert.deepStrictEqual(keybindingParser_1.KeybindingParser.parseKeybinding('ctrl+shift+[comma] ctrl+/'), new keybindings_1.Keybinding([new keybindings_1.ScanCodeChord(true, true, false, false, 60 /* ScanCode.Comma */), new keybindings_1.KeyCodeChord(true, false, false, false, 90 /* KeyCode.Slash */)]));
        });
        test('issue #10452 - invalid command', () => {
            const strJSON = `[{ "key": "ctrl+k ctrl+f", "command": ["firstcommand", "seccondcommand"] }]`;
            const userKeybinding = JSON.parse(strJSON)[0];
            const keybindingItem = keybindingIO_1.KeybindingIO.readUserKeybindingItem(userKeybinding);
            assert.strictEqual(keybindingItem.command, null);
        });
        test('issue #10452 - invalid when', () => {
            const strJSON = `[{ "key": "ctrl+k ctrl+f", "command": "firstcommand", "when": [] }]`;
            const userKeybinding = JSON.parse(strJSON)[0];
            const keybindingItem = keybindingIO_1.KeybindingIO.readUserKeybindingItem(userKeybinding);
            assert.strictEqual(keybindingItem.when, undefined);
        });
        test('issue #10452 - invalid key', () => {
            const strJSON = `[{ "key": [], "command": "firstcommand" }]`;
            const userKeybinding = JSON.parse(strJSON)[0];
            const keybindingItem = keybindingIO_1.KeybindingIO.readUserKeybindingItem(userKeybinding);
            assert.deepStrictEqual(keybindingItem.keybinding, null);
        });
        test('issue #10452 - invalid key 2', () => {
            const strJSON = `[{ "key": "", "command": "firstcommand" }]`;
            const userKeybinding = JSON.parse(strJSON)[0];
            const keybindingItem = keybindingIO_1.KeybindingIO.readUserKeybindingItem(userKeybinding);
            assert.deepStrictEqual(keybindingItem.keybinding, null);
        });
        test('test commands args', () => {
            const strJSON = `[{ "key": "ctrl+k ctrl+f", "command": "firstcommand", "when": [], "args": { "text": "theText" } }]`;
            const userKeybinding = JSON.parse(strJSON)[0];
            const keybindingItem = keybindingIO_1.KeybindingIO.readUserKeybindingItem(userKeybinding);
            assert.strictEqual(keybindingItem.commandArgs.text, 'theText');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ0lPLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMva2V5YmluZGluZy90ZXN0L2Jyb3dzZXIva2V5YmluZGluZ0lPLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBWUEsS0FBSyxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUU7UUFFMUIsSUFBSSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtZQUVsQyxTQUFTLG9CQUFvQixDQUFDLFVBQWtCLEVBQUUsUUFBZ0IsRUFBRSxHQUFXLEVBQUUsRUFBbUI7Z0JBQ25HLE1BQU0sMEJBQTBCLEdBQUcsSUFBQSx1REFBZ0MsRUFBQyxVQUFVLEVBQUUsRUFBRSxDQUFFLENBQUM7Z0JBQ3JGLE1BQU0sZ0JBQWdCLEdBQUcsMEJBQTBCLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztnQkFDM0UsTUFBTSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsUUFBUSxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztZQUN4RSxDQUFDO1lBQ0QsU0FBUyxpQkFBaUIsQ0FBQyxVQUFrQixFQUFFLFdBQW1CLEVBQUUsV0FBbUIsRUFBRSxhQUFxQjtnQkFDN0csb0JBQW9CLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxLQUFLLGtDQUEwQixDQUFDO2dCQUM5RSxvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLEtBQUssb0NBQTRCLENBQUM7Z0JBQ2hGLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUUsT0FBTyxnQ0FBd0IsQ0FBQztZQUNqRixDQUFDO1lBRUQsU0FBUyxzQkFBc0IsQ0FBQyxVQUFrQixFQUFFLFNBQWlCLEVBQUUsR0FBVyxFQUFFLEVBQW1CO2dCQUN0RyxNQUFNLGtCQUFrQixHQUFHLG1DQUFnQixDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMs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