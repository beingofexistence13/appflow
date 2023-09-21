/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/keyCodes", "vs/platform/keybinding/test/common/keybindingsTestUtils"], function (require, exports, assert, keyCodes_1, keybindingsTestUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('KeybindingLabels', () => {
        function assertUSLabel(OS, keybinding, expected) {
            const usResolvedKeybinding = (0, keybindingsTestUtils_1.createUSLayoutResolvedKeybinding)(keybinding, OS);
            assert.strictEqual(usResolvedKeybinding.getLabel(), expected);
        }
        test('Windows US label', () => {
            // no modifier
            assertUSLabel(1 /* OperatingSystem.Windows */, 31 /* KeyCode.KeyA */, 'A');
            // one modifier
            assertUSLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 'Ctrl+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */, 'Shift+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'Alt+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Windows+A');
            // two modifiers
            assertUSLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'Ctrl+Alt+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Windows+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'Shift+Alt+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Shift+Windows+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Alt+Windows+A');
            // three modifiers
            assertUSLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+Alt+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+Windows+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Alt+Windows+A');
            assertUSLabel(1 /* OperatingSystem.Windows */, 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Shift+Alt+Windows+A');
            // four modifiers
            assertUSLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+Alt+Windows+A');
            // chord
            assertUSLabel(1 /* OperatingSystem.Windows */, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */), 'Ctrl+A Ctrl+B');
        });
        test('Linux US label', () => {
            // no modifier
            assertUSLabel(3 /* OperatingSystem.Linux */, 31 /* KeyCode.KeyA */, 'A');
            // one modifier
            assertUSLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 'Ctrl+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */, 'Shift+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'Alt+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Super+A');
            // two modifiers
            assertUSLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'Ctrl+Alt+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Super+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'Shift+Alt+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Shift+Super+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Alt+Super+A');
            // three modifiers
            assertUSLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+Alt+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+Super+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Alt+Super+A');
            assertUSLabel(3 /* OperatingSystem.Linux */, 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Shift+Alt+Super+A');
            // four modifiers
            assertUSLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+Alt+Super+A');
            // chord
            assertUSLabel(3 /* OperatingSystem.Linux */, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */), 'Ctrl+A Ctrl+B');
        });
        test('Mac US label', () => {
            // no modifier
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 31 /* KeyCode.KeyA */, 'A');
            // one modifier
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, '⌘A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */, '⇧A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, '⌥A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, '⌃A');
            // two modifiers
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 31 /* KeyCode.KeyA */, '⇧⌘A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, '⌥⌘A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, '⌃⌘A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, '⇧⌥A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, '⌃⇧A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, '⌃⌥A');
            // three modifiers
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 31 /* KeyCode.KeyA */, '⇧⌥⌘A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, '⌃⇧⌘A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, '⌃⌥⌘A');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, '⌃⇧⌥A');
            // four modifiers
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, '⌃⇧⌥⌘A');
            // chord
            assertUSLabel(2 /* OperatingSystem.Macintosh */, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */), '⌘A ⌘B');
            // special keys
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 15 /* KeyCode.LeftArrow */, '←');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 16 /* KeyCode.UpArrow */, '↑');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 17 /* KeyCode.RightArrow */, '→');
            assertUSLabel(2 /* OperatingSystem.Macintosh */, 18 /* KeyCode.DownArrow */, '↓');
        });
        test('Aria label', () => {
            function assertAriaLabel(OS, keybinding, expected) {
                const usResolvedKeybinding = (0, keybindingsTestUtils_1.createUSLayoutResolvedKeybinding)(keybinding, OS);
                assert.strictEqual(usResolvedKeybinding.getAriaLabel(), expected);
            }
            assertAriaLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Control+Shift+Alt+Windows+A');
            assertAriaLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Control+Shift+Alt+Super+A');
            assertAriaLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Control+Shift+Option+Command+A');
        });
        test('Electron Accelerator label', () => {
            function assertElectronAcceleratorLabel(OS, keybinding, expected) {
                const usResolvedKeybinding = (0, keybindingsTestUtils_1.createUSLayoutResolvedKeybinding)(keybinding, OS);
                assert.strictEqual(usResolvedKeybinding.getElectronAccelerator(), expected);
            }
            assertElectronAcceleratorLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+Alt+Super+A');
            assertElectronAcceleratorLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+Alt+Super+A');
            assertElectronAcceleratorLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'Ctrl+Shift+Alt+Cmd+A');
            // electron cannot handle chords
            assertElectronAcceleratorLabel(1 /* OperatingSystem.Windows */, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */), null);
            assertElectronAcceleratorLabel(3 /* OperatingSystem.Linux */, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */), null);
            assertElectronAcceleratorLabel(2 /* OperatingSystem.Macintosh */, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */), null);
            // electron cannot handle numpad keys
            assertElectronAcceleratorLabel(1 /* OperatingSystem.Windows */, 99 /* KeyCode.Numpad1 */, null);
            assertElectronAcceleratorLabel(3 /* OperatingSystem.Linux */, 99 /* KeyCode.Numpad1 */, null);
            assertElectronAcceleratorLabel(2 /* OperatingSystem.Macintosh */, 99 /* KeyCode.Numpad1 */, null);
            // special
            assertElectronAcceleratorLabel(2 /* OperatingSystem.Macintosh */, 15 /* KeyCode.LeftArrow */, 'Left');
            assertElectronAcceleratorLabel(2 /* OperatingSystem.Macintosh */, 16 /* KeyCode.UpArrow */, 'Up');
            assertElectronAcceleratorLabel(2 /* OperatingSystem.Macintosh */, 17 /* KeyCode.RightArrow */, 'Right');
            assertElectronAcceleratorLabel(2 /* OperatingSystem.Macintosh */, 18 /* KeyCode.DownArrow */, 'Down');
        });
        test('User Settings label', () => {
            function assertElectronAcceleratorLabel(OS, keybinding, expected) {
                const usResolvedKeybinding = (0, keybindingsTestUtils_1.createUSLayoutResolvedKeybinding)(keybinding, OS);
                assert.strictEqual(usResolvedKeybinding.getUserSettingsLabel(), expected);
            }
            assertElectronAcceleratorLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'ctrl+shift+alt+win+a');
            assertElectronAcceleratorLabel(3 /* OperatingSystem.Linux */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'ctrl+shift+alt+meta+a');
            assertElectronAcceleratorLabel(2 /* OperatingSystem.Macintosh */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 256 /* KeyMod.WinCtrl */ | 31 /* KeyCode.KeyA */, 'ctrl+shift+alt+cmd+a');
            // electron cannot handle chords
            assertElectronAcceleratorLabel(1 /* OperatingSystem.Windows */, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */), 'ctrl+a ctrl+b');
            assertElectronAcceleratorLabel(3 /* OperatingSystem.Linux */, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */), 'ctrl+a ctrl+b');
            assertElectronAcceleratorLabel(2 /* OperatingSystem.Macintosh */, (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */), 'cmd+a cmd+b');
        });
        test('issue #91235: Do not end with a +', () => {
            assertUSLabel(1 /* OperatingSystem.Windows */, 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 6 /* KeyCode.Alt */, 'Ctrl+Alt');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ0xhYmVscy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0va2V5YmluZGluZy90ZXN0L2NvbW1vbi9rZXliaW5kaW5nTGFiZWxzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFPaEcsS0FBSyxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtRQUU5QixTQUFTLGFBQWEsQ0FBQyxFQUFtQixFQUFFLFVBQWtCLEVBQUUsUUFBZ0I7WUFDL0UsTUFBTSxvQkFBb0IsR0FBRyxJQUFBLHVEQUFnQyxFQUFDLFVBQVUsRUFBRSxFQUFFLENBQUUsQ0FBQztZQUMvRSxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFFRCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO1lBQzdCLGNBQWM7WUFDZCxhQUFhLHlEQUF3QyxHQUFHLENBQUMsQ0FBQztZQUUxRCxlQUFlO1lBQ2YsYUFBYSxrQ0FBMEIsaURBQTZCLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDaEYsYUFBYSxrQ0FBMEIsK0NBQTJCLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDL0UsYUFBYSxrQ0FBMEIsNENBQXlCLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDM0UsYUFBYSxrQ0FBMEIsZ0RBQTZCLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFFbkYsZ0JBQWdCO1lBQ2hCLGFBQWEsa0NBQTBCLG1EQUE2Qix3QkFBZSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3JHLGFBQWEsa0NBQTBCLGdEQUEyQix3QkFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ2pHLGFBQWEsa0NBQTBCLG9EQUErQix3QkFBZSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDekcsYUFBYSxrQ0FBMEIsOENBQXlC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