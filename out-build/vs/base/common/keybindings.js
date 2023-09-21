/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors"], function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Cq = exports.$Bq = exports.$Aq = exports.$zq = exports.$yq = exports.$xq = exports.$wq = void 0;
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
    function $wq(keybinding, OS) {
        if (typeof keybinding === 'number') {
            if (keybinding === 0) {
                return null;
            }
            const firstChord = (keybinding & 0x0000FFFF) >>> 0;
            const secondChord = (keybinding & 0xFFFF0000) >>> 16;
            if (secondChord !== 0) {
                return new $Aq([
                    $xq(firstChord, OS),
                    $xq(secondChord, OS)
                ]);
            }
            return new $Aq([$xq(firstChord, OS)]);
        }
        else {
            const chords = [];
            for (let i = 0; i < keybinding.length; i++) {
                chords.push($xq(keybinding[i], OS));
            }
            return new $Aq(chords);
        }
    }
    exports.$wq = $wq;
    function $xq(keybinding, OS) {
        const ctrlCmd = (keybinding & 2048 /* BinaryKeybindingsMask.CtrlCmd */ ? true : false);
        const winCtrl = (keybinding & 256 /* BinaryKeybindingsMask.WinCtrl */ ? true : false);
        const ctrlKey = (OS === 2 /* OperatingSystem.Macintosh */ ? winCtrl : ctrlCmd);
        const shiftKey = (keybinding & 1024 /* BinaryKeybindingsMask.Shift */ ? true : false);
        const altKey = (keybinding & 512 /* BinaryKeybindingsMask.Alt */ ? true : false);
        const metaKey = (OS === 2 /* OperatingSystem.Macintosh */ ? ctrlCmd : winCtrl);
        const keyCode = (keybinding & 255 /* BinaryKeybindingsMask.KeyCode */);
        return new $yq(ctrlKey, shiftKey, altKey, metaKey, keyCode);
    }
    exports.$xq = $xq;
    /**
     * Represents a chord which uses the `keyCode` field of keyboard events.
     * A chord is a combination of keys pressed simultaneously.
     */
    class $yq {
        constructor(ctrlKey, shiftKey, altKey, metaKey, keyCode) {
            this.ctrlKey = ctrlKey;
            this.shiftKey = shiftKey;
            this.altKey = altKey;
            this.metaKey = metaKey;
            this.keyCode = keyCode;
        }
        equals(other) {
            return (other instanceof $yq
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
            return new $Aq([this]);
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
    exports.$yq = $yq;
    /**
     * Represents a chord which uses the `code` field of keyboard events.
     * A chord is a combination of keys pressed simultaneously.
     */
    class $zq {
        constructor(ctrlKey, shiftKey, altKey, metaKey, scanCode) {
            this.ctrlKey = ctrlKey;
            this.shiftKey = shiftKey;
            this.altKey = altKey;
            this.metaKey = metaKey;
            this.scanCode = scanCode;
        }
        equals(other) {
            return (other instanceof $zq
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
    exports.$zq = $zq;
    /**
     * A keybinding is a sequence of chords.
     */
    class $Aq {
        constructor(chords) {
            if (chords.length === 0) {
                throw (0, errors_1.$5)(`chords`);
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
    exports.$Aq = $Aq;
    class $Bq {
        constructor(ctrlKey, shiftKey, altKey, metaKey, keyLabel, keyAriaLabel) {
            this.ctrlKey = ctrlKey;
            this.shiftKey = shiftKey;
            this.altKey = altKey;
            this.metaKey = metaKey;
            this.keyLabel = keyLabel;
            this.keyAriaLabel = keyAriaLabel;
        }
    }
    exports.$Bq = $Bq;
    /**
     * A resolved keybinding. Consists of one or multiple chords.
     */
    class $Cq {
    }
    exports.$Cq = $Cq;
});
//# sourceMappingURL=keybindings.js.map