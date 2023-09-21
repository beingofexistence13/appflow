/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/keybindings"], function (require, exports, keyCodes_1, keybindings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$GS = void 0;
    class $GS {
        static a(input) {
            input = input.toLowerCase().trim();
            let ctrl = false;
            let shift = false;
            let alt = false;
            let meta = false;
            let matchedModifier;
            do {
                matchedModifier = false;
                if (/^ctrl(\+|\-)/.test(input)) {
                    ctrl = true;
                    input = input.substr('ctrl-'.length);
                    matchedModifier = true;
                }
                if (/^shift(\+|\-)/.test(input)) {
                    shift = true;
                    input = input.substr('shift-'.length);
                    matchedModifier = true;
                }
                if (/^alt(\+|\-)/.test(input)) {
                    alt = true;
                    input = input.substr('alt-'.length);
                    matchedModifier = true;
                }
                if (/^meta(\+|\-)/.test(input)) {
                    meta = true;
                    input = input.substr('meta-'.length);
                    matchedModifier = true;
                }
                if (/^win(\+|\-)/.test(input)) {
                    meta = true;
                    input = input.substr('win-'.length);
                    matchedModifier = true;
                }
                if (/^cmd(\+|\-)/.test(input)) {
                    meta = true;
                    input = input.substr('cmd-'.length);
                    matchedModifier = true;
                }
            } while (matchedModifier);
            let key;
            const firstSpaceIdx = input.indexOf(' ');
            if (firstSpaceIdx > 0) {
                key = input.substring(0, firstSpaceIdx);
                input = input.substring(firstSpaceIdx);
            }
            else {
                key = input;
                input = '';
            }
            return {
                remains: input,
                ctrl,
                shift,
                alt,
                meta,
                key
            };
        }
        static b(input) {
            const mods = this.a(input);
            const scanCodeMatch = mods.key.match(/^\[([^\]]+)\]$/);
            if (scanCodeMatch) {
                const strScanCode = scanCodeMatch[1];
                const scanCode = keyCodes_1.$sq.lowerCaseToEnum(strScanCode);
                return [new keybindings_1.$zq(mods.ctrl, mods.shift, mods.alt, mods.meta, scanCode), mods.remains];
            }
            const keyCode = keyCodes_1.KeyCodeUtils.fromUserSettings(mods.key);
            return [new keybindings_1.$yq(mods.ctrl, mods.shift, mods.alt, mods.meta, keyCode), mods.remains];
        }
        static parseKeybinding(input) {
            if (!input) {
                return null;
            }
            const chords = [];
            let chord;
            while (input.length > 0) {
                [chord, input] = this.b(input);
                chords.push(chord);
            }
            return (chords.length > 0 ? new keybindings_1.$Aq(chords) : null);
        }
    }
    exports.$GS = $GS;
});
//# sourceMappingURL=keybindingParser.js.map