/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors"], function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResolvedKeybinding = exports.ResolvedChord = exports.Keybinding = exports.ScanCodeChord = exports.KeyCodeChord = exports.createSimpleKeybinding = exports.decodeKeybinding = void 0;
    /**
     * Binary encoding strategy:
     * ```
     *    1111 11
     *    5432 1098 7654 3210
     *    ---- CSAW KKKK KKKK
     *  C = bit 11 = ctrlCmd flag
     *  S = bit 10 = shift flag
     *  A = bit 9 = alt flag
     *  W = bit 8 = winCtrl flag
     *  K = bits 0-7 = key code
     * ```
     */
    var BinaryKeybindingsMask;
    (function (BinaryKeybindingsMask) {
        BinaryKeybindingsMask[BinaryKeybindingsMask["CtrlCmd"] = 2048] = "CtrlCmd";
        BinaryKeybindingsMask[BinaryKeybindingsMask["Shift"] = 1024] = "Shift";
        BinaryKeybindingsMask[BinaryKeybindingsMask["Alt"] = 512] = "Alt";
        BinaryKeybindingsMask[BinaryKeybindingsMask["WinCtrl"] = 256] = "WinCtrl";
        BinaryKeybindingsMask[BinaryKeybindingsMask["KeyCode"] = 255] = "KeyCode";
    })(BinaryKeybindingsMask || (BinaryKeybindingsMask = {}));
    function decodeKeybinding(keybinding, OS) {
        if (typeof keybinding === 'number') {
            if (keybinding === 0) {
                return null;
            }
            const firstChord = (keybinding & 0x0000FFFF) >>> 0;
            const secondChord = (keybinding & 0xFFFF0000) >>> 16;
            if (secondChord !== 0) {
                return new Keybinding([
                    createSimpleKeybinding(firstChord, OS),
                    createSimpleKeybinding(secondChord, OS)
                ]);
            }
            return new Keybinding([createSimpleKeybinding(firstChord, OS)]);
        }
        else {
            const chords = [];
            for (let i = 0; i < keybinding.length; i++) {
                chords.push(createSimpleKeybinding(keybinding[i], OS));
            }
            return new Keybinding(chords);
        }
    }
    exports.decodeKeybinding = decodeKeybinding;
    function createSimpleKeybinding(keybinding, OS) {
        const ctrlCmd = (keybinding & 2048 /* BinaryKeybindingsMask.CtrlCmd */ ? true : false);
        const winCtrl = (keybinding & 256 /* BinaryKeybindingsMask.WinCtrl */ ? true : false);
        const ctrlKey = (OS === 2 /* OperatingSystem.Macintosh */ ? winCtrl : ctrlCmd);
        const shiftKey = (keybinding & 1024 /* BinaryKeybindingsMask.Shift */ ? true : false);
        const altKey = (keybinding & 512 /* BinaryKeybindingsMask.Alt */ ? true : false);
        const metaKey = (OS === 2 /* OperatingSystem.Macintosh */ ? ctrlCmd : winCtrl);
        const keyCode = (keybinding & 255 /* BinaryKeybindingsMask.KeyCode */);
        return new KeyCodeChord(ctrlKey, shiftKey, altKey, metaKey, keyCode);
    }
    exports.createSimpleKeybinding = createSimpleKeybinding;
    /**
     * Represents a chord which uses the `keyCode` field of keyboard events.
     * A chord is a combination of keys pressed simultaneously.
     */
    class KeyCodeChord {
        constructor(ctrlKey, shiftKey, altKey, metaKey, keyCode) {
            this.ctrlKey = ctrlKey;
            this.shiftKey = shiftKey;
            this.altKey = altKey;
            this.metaKey = metaKey;
            this.keyCode = keyCode;
        }
        equals(other) {
            return (other instanceof KeyCodeChord
                && this.ctrlKey === other.ctrlKey
                && this.shiftKey === other.shiftKey
                && this.altKey === other.altKey
                && this.metaKey === other.metaKey
                && this.keyCode === other.keyCode);
        }
        getHashCode() {
            const ctrl = this.ctrlKey ? '1' : '0';
            const shift = this.shiftKey ? '1' : '0';
            const alt = this.altKey ? '1' : '0';
            const meta = this.metaKey ? '1' : '0';
            return `K${ctrl}${shift}${alt}${meta}${this.keyCode}`;
        }
        isModifierKey() {
            return (this.keyCode === 0 /* KeyCode.Unknown */
                || this.keyCode === 5 /* KeyCode.Ctrl */
                || this.keyCode === 57 /* KeyCode.Meta */
                || this.keyCode === 6 /* KeyCode.Alt */
                || this.keyCode === 4 /* KeyCode.Shift */);
        }
        toKeybinding() {
            return new Keybinding([this]);
        }
        /**
         * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
         */
        isDuplicateModifierCase() {
            return ((this.ctrlKey && this.keyCode === 5 /* KeyCode.Ctrl */)
                || (this.shiftKey && this.keyCode === 4 /* KeyCode.Shift */)
                || (this.altKey && this.keyCode === 6 /* KeyCode.Alt */)
                || (this.metaKey && this.keyCode === 57 /* KeyCode.Meta */));
        }
    }
    exports.KeyCodeChord = KeyCodeChord;
    /**
     * Represents a chord which uses the `code` field of keyboard events.
     * A chord is a combination of keys pressed simultaneously.
     */
    class ScanCodeChord {
        constructor(ctrlKey, shiftKey, altKey, metaKey, scanCode) {
            this.ctrlKey = ctrlKey;
            this.shiftKey = shiftKey;
            this.altKey = altKey;
            this.metaKey = metaKey;
            this.scanCode = scanCode;
        }
        equals(other) {
            return (other instanceof ScanCodeChord
                && this.ctrlKey === other.ctrlKey
                && this.shiftKey === other.shiftKey
                && this.altKey === other.altKey
                && this.metaKey === other.metaKey
                && this.scanCode === other.scanCode);
        }
        getHashCode() {
            const ctrl = this.ctrlKey ? '1' : '0';
            const shift = this.shiftKey ? '1' : '0';
            const alt = this.altKey ? '1' : '0';
            const meta = this.metaKey ? '1' : '0';
            return `S${ctrl}${shift}${alt}${meta}${this.scanCode}`;
        }
        /**
         * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
         */
        isDuplicateModifierCase() {
            return ((this.ctrlKey && (this.scanCode === 157 /* ScanCode.ControlLeft */ || this.scanCode === 161 /* ScanCode.ControlRight */))
                || (this.shiftKey && (this.scanCode === 158 /* ScanCode.ShiftLeft */ || this.scanCode === 162 /* ScanCode.ShiftRight */))
                || (this.altKey && (this.scanCode === 159 /* ScanCode.AltLeft */ || this.scanCode === 163 /* ScanCode.AltRight */))
                || (this.metaKey && (this.scanCode === 160 /* ScanCode.MetaLeft */ || this.scanCode === 164 /* ScanCode.MetaRight */)));
        }
    }
    exports.ScanCodeChord = ScanCodeChord;
    /**
     * A keybinding is a sequence of chords.
     */
    class Keybinding {
        constructor(chords) {
            if (chords.length === 0) {
                throw (0, errors_1.illegalArgument)(`chords`);
            }
            this.chords = chords;
        }
        getHashCode() {
            let result = '';
            for (let i = 0, len = this.chords.length; i < len; i++) {
                if (i !== 0) {
                    result += ';';
                }
                result += this.chords[i].getHashCode();
            }
            return result;
        }
        equals(other) {
            if (other === null) {
                return false;
            }
            if (this.chords.length !== other.chords.length) {
                return false;
            }
            for (let i = 0; i < this.chords.length; i++) {
                if (!this.chords[i].equals(other.chords[i])) {
                    return false;
                }
            }
            return true;
        }
    }
    exports.Keybinding = Keybinding;
    class ResolvedChord {
        constructor(ctrlKey, shiftKey, altKey, metaKey, keyLabel, keyAriaLabel) {
            this.ctrlKey = ctrlKey;
            this.shiftKey = shiftKey;
            this.altKey = altKey;
            this.metaKey = metaKey;
            this.keyLabel = keyLabel;
            this.keyAriaLabel = keyAriaLabel;
        }
    }
    exports.ResolvedChord = ResolvedChord;
    /**
     * A resolved keybinding. Consists of one or multiple chords.
     */
    class ResolvedKeybinding {
    }
    exports.ResolvedKeybinding = ResolvedKeybinding;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9rZXliaW5kaW5ncy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEc7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0gsSUFBVyxxQkFNVjtJQU5ELFdBQVcscUJBQXFCO1FBQy9CLDBFQUF5QixDQUFBO1FBQ3pCLHNFQUF1QixDQUFBO1FBQ3ZCLGlFQUFvQixDQUFBO1FBQ3BCLHlFQUF3QixDQUFBO1FBQ3hCLHlFQUFvQixDQUFBO0lBQ3JCLENBQUMsRUFOVSxxQkFBcUIsS0FBckIscUJBQXFCLFFBTS9CO0lBRUQsU0FBZ0IsZ0JBQWdCLENBQUMsVUFBNkIsRUFBRSxFQUFtQjtRQUNsRixJQUFJLE9BQU8sVUFBVSxLQUFLLFFBQVEsRUFBRTtZQUNuQyxJQUFJLFVBQVUsS0FBSyxDQUFDLEVBQUU7Z0JBQ3JCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxNQUFNLFVBQVUsR0FBRyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkQsTUFBTSxXQUFXLEdBQUcsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3JELElBQUksV0FBVyxLQUFLLENBQUMsRUFBRTtnQkFDdEIsT0FBTyxJQUFJLFVBQVUsQ0FBQztvQkFDckIsc0JBQXNCLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQztvQkFDdEMsc0JBQXNCLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztpQkFDdkMsQ0FBQyxDQUFDO2FBQ0g7WUFDRCxPQUFPLElBQUksVUFBVSxDQUFDLENBQUMsc0JBQXNCLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoRTthQUFNO1lBQ04sTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ2xCLEtBQUssSUFB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