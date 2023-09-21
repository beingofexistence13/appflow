/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls"], function (require, exports, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserSettingsLabelProvider = exports.ElectronAcceleratorLabelProvider = exports.AriaLabelProvider = exports.UILabelProvider = exports.ModifierLabelProvider = void 0;
    class ModifierLabelProvider {
        constructor(mac, windows, linux = windows) {
            this.modifierLabels = [null]; // index 0 will never me accessed.
            this.modifierLabels[2 /* OperatingSystem.Macintosh */] = mac;
            this.modifierLabels[1 /* OperatingSystem.Windows */] = windows;
            this.modifierLabels[3 /* OperatingSystem.Linux */] = linux;
        }
        toLabel(OS, chords, keyLabelProvider) {
            if (chords.length === 0) {
                return null;
            }
            const result = [];
            for (let i = 0, len = chords.length; i < len; i++) {
                const chord = chords[i];
                const keyLabel = keyLabelProvider(chord);
                if (keyLabel === null) {
                    // this keybinding cannot be expressed...
                    return null;
                }
                result[i] = _simpleAsString(chord, keyLabel, this.modifierLabels[OS]);
            }
            return result.join(' ');
        }
    }
    exports.ModifierLabelProvider = ModifierLabelProvider;
    /**
     * A label provider that prints modifiers in a suitable format for displaying in the UI.
     */
    exports.UILabelProvider = new ModifierLabelProvider({
        ctrlKey: '\u2303',
        shiftKey: '⇧',
        altKey: '⌥',
        metaKey: '⌘',
        separator: '',
    }, {
        ctrlKey: nls.localize({ key: 'ctrlKey', comment: ['This is the short form for the Control key on the keyboard'] }, "Ctrl"),
        shiftKey: nls.localize({ key: 'shiftKey', comment: ['This is the short form for the Shift key on the keyboard'] }, "Shift"),
        altKey: nls.localize({ key: 'altKey', comment: ['This is the short form for the Alt key on the keyboard'] }, "Alt"),
        metaKey: nls.localize({ key: 'windowsKey', comment: ['This is the short form for the Windows key on the keyboard'] }, "Windows"),
        separator: '+',
    }, {
        ctrlKey: nls.localize({ key: 'ctrlKey', comment: ['This is the short form for the Control key on the keyboard'] }, "Ctrl"),
        shiftKey: nls.localize({ key: 'shiftKey', comment: ['This is the short form for the Shift key on the keyboard'] }, "Shift"),
        altKey: nls.localize({ key: 'altKey', comment: ['This is the short form for the Alt key on the keyboard'] }, "Alt"),
        metaKey: nls.localize({ key: 'superKey', comment: ['This is the short form for the Super key on the keyboard'] }, "Super"),
        separator: '+',
    });
    /**
     * A label provider that prints modifiers in a suitable format for ARIA.
     */
    exports.AriaLabelProvider = new ModifierLabelProvider({
        ctrlKey: nls.localize({ key: 'ctrlKey.long', comment: ['This is the long form for the Control key on the keyboard'] }, "Control"),
        shiftKey: nls.localize({ key: 'shiftKey.long', comment: ['This is the long form for the Shift key on the keyboard'] }, "Shift"),
        altKey: nls.localize({ key: 'optKey.long', comment: ['This is the long form for the Alt/Option key on the keyboard'] }, "Option"),
        metaKey: nls.localize({ key: 'cmdKey.long', comment: ['This is the long form for the Command key on the keyboard'] }, "Command"),
        separator: '+',
    }, {
        ctrlKey: nls.localize({ key: 'ctrlKey.long', comment: ['This is the long form for the Control key on the keyboard'] }, "Control"),
        shiftKey: nls.localize({ key: 'shiftKey.long', comment: ['This is the long form for the Shift key on the keyboard'] }, "Shift"),
        altKey: nls.localize({ key: 'altKey.long', comment: ['This is the long form for the Alt key on the keyboard'] }, "Alt"),
        metaKey: nls.localize({ key: 'windowsKey.long', comment: ['This is the long form for the Windows key on the keyboard'] }, "Windows"),
        separator: '+',
    }, {
        ctrlKey: nls.localize({ key: 'ctrlKey.long', comment: ['This is the long form for the Control key on the keyboard'] }, "Control"),
        shiftKey: nls.localize({ key: 'shiftKey.long', comment: ['This is the long form for the Shift key on the keyboard'] }, "Shift"),
        altKey: nls.localize({ key: 'altKey.long', comment: ['This is the long form for the Alt key on the keyboard'] }, "Alt"),
        metaKey: nls.localize({ key: 'superKey.long', comment: ['This is the long form for the Super key on the keyboard'] }, "Super"),
        separator: '+',
    });
    /**
     * A label provider that prints modifiers in a suitable format for Electron Accelerators.
     * See https://github.com/electron/electron/blob/master/docs/api/accelerator.md
     */
    exports.ElectronAcceleratorLabelProvider = new ModifierLabelProvider({
        ctrlKey: 'Ctrl',
        shiftKey: 'Shift',
        altKey: 'Alt',
        metaKey: 'Cmd',
        separator: '+',
    }, {
        ctrlKey: 'Ctrl',
        shiftKey: 'Shift',
        altKey: 'Alt',
        metaKey: 'Super',
        separator: '+',
    });
    /**
     * A label provider that prints modifiers in a suitable format for user settings.
     */
    exports.UserSettingsLabelProvider = new ModifierLabelProvider({
        ctrlKey: 'ctrl',
        shiftKey: 'shift',
        altKey: 'alt',
        metaKey: 'cmd',
        separator: '+',
    }, {
        ctrlKey: 'ctrl',
        shiftKey: 'shift',
        altKey: 'alt',
        metaKey: 'win',
        separator: '+',
    }, {
        ctrlKey: 'ctrl',
        shiftKey: 'shift',
        altKey: 'alt',
        metaKey: 'meta',
        separator: '+',
    });
    function _simpleAsString(modifiers, key, labels) {
        if (key === null) {
            return '';
        }
        const result = [];
        // translate modifier keys: Ctrl-Shift-Alt-Meta
        if (modifiers.ctrlKey) {
            result.push(labels.ctrlKey);
        }
        if (modifiers.shiftKey) {
            result.push(labels.shiftKey);
        }
        if (modifiers.altKey) {
            result.push(labels.altKey);
        }
        if (modifiers.metaKey) {
            result.push(labels.metaKey);
        }
        // the actual key
        if (key !== '') {
            result.push(key);
        }
        return result.join(labels.separator);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ0xhYmVscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL2tleWJpbmRpbmdMYWJlbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0JoRyxNQUFhLHFCQUFxQjtRQUlqQyxZQUFZLEdBQW1CLEVBQUUsT0FBdUIsRUFBRSxRQUF3QixPQUFPO1lBQ3hGLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxJQUFLLENBQUMsQ0FBQyxDQUFDLGtDQUFrQztZQUNqRSxJQUFJLENBQUMsY0FBYyxtQ0FBMkIsR0FBRyxHQUFHLENBQUM7WUFDckQsSUFBSSxDQUFDLGNBQWMsaUNBQXlCLEdBQUcsT0FBTyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxjQUFjLCtCQUF1QixHQUFHLEtBQUssQ0FBQztRQUNwRCxDQUFDO1FBRU0sT0FBTyxDQUFzQixFQUFtQixFQUFFLE1BQW9CLEVBQUUsZ0JBQXFDO1lBQ25ILElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3hCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7WUFDNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDbEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixNQUFNLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDekMsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO29CQUN0Qix5Q0FBeUM7b0JBQ3pDLE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUNELE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxlQUFlLENBQUMsS0FBSyxF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