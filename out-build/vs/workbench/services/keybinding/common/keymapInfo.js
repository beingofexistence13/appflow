/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/platform/keyboardLayout/common/keyboardLayout"], function (require, exports, platform_1, keyboardLayout_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$l3b = void 0;
    function deserializeMapping(serializedMapping) {
        const mapping = serializedMapping;
        const ret = {};
        for (const key in mapping) {
            const result = mapping[key];
            if (result.length) {
                const value = result[0];
                const withShift = result[1];
                const withAltGr = result[2];
                const withShiftAltGr = result[3];
                const mask = Number(result[4]);
                const vkey = result.length === 6 ? result[5] : undefined;
                ret[key] = {
                    'value': value,
                    'vkey': vkey,
                    'withShift': withShift,
                    'withAltGr': withAltGr,
                    'withShiftAltGr': withShiftAltGr,
                    'valueIsDeadKey': (mask & 1) > 0,
                    'withShiftIsDeadKey': (mask & 2) > 0,
                    'withAltGrIsDeadKey': (mask & 4) > 0,
                    'withShiftAltGrIsDeadKey': (mask & 8) > 0
                };
            }
            else {
                ret[key] = {
                    'value': '',
                    'valueIsDeadKey': false,
                    'withShift': '',
                    'withShiftIsDeadKey': false,
                    'withAltGr': '',
                    'withAltGrIsDeadKey': false,
                    'withShiftAltGr': '',
                    'withShiftAltGrIsDeadKey': false
                };
            }
        }
        return ret;
    }
    class $l3b {
        constructor(layout, secondaryLayouts, keyboardMapping, isUserKeyboardLayout) {
            this.layout = layout;
            this.secondaryLayouts = secondaryLayouts;
            this.mapping = deserializeMapping(keyboardMapping);
            this.isUserKeyboardLayout = !!isUserKeyboardLayout;
            this.layout.isUserKeyboardLayout = !!isUserKeyboardLayout;
        }
        static createKeyboardLayoutFromDebugInfo(layout, value, isUserKeyboardLayout) {
            const keyboardLayoutInfo = new $l3b(layout, [], {}, true);
            keyboardLayoutInfo.mapping = value;
            return keyboardLayoutInfo;
        }
        update(other) {
            this.layout = other.layout;
            this.secondaryLayouts = other.secondaryLayouts;
            this.mapping = other.mapping;
            this.isUserKeyboardLayout = other.isUserKeyboardLayout;
            this.layout.isUserKeyboardLayout = other.isUserKeyboardLayout;
        }
        getScore(other) {
            let score = 0;
            for (const key in other) {
                if (platform_1.$i && (key === 'Backslash' || key === 'KeyQ')) {
                    // keymap from Chromium is probably wrong.
                    continue;
                }
                if (platform_1.$k && (key === 'Backspace' || key === 'Escape')) {
                    // native keymap doesn't align with keyboard event
                    continue;
                }
                const currentMapping = this.mapping[key];
                if (currentMapping === undefined) {
                    score -= 1;
                }
                const otherMapping = other[key];
                if (currentMapping && otherMapping && currentMapping.value !== otherMapping.value) {
                    score -= 1;
                }
            }
            return score;
        }
        equal(other) {
            if (this.isUserKeyboardLayout !== other.isUserKeyboardLayout) {
                return false;
            }
            if ((0, keyboardLayout_1.$Wyb)(this.layout) !== (0, keyboardLayout_1.$Wyb)(other.layout)) {
                return false;
            }
            return this.fuzzyEqual(other.mapping);
        }
        fuzzyEqual(other) {
            for (const key in other) {
                if (platform_1.$i && (key === 'Backslash' || key === 'KeyQ')) {
                    // keymap from Chromium is probably wrong.
                    continue;
                }
                if (this.mapping[key] === undefined) {
                    return false;
                }
                const currentMapping = this.mapping[key];
                const otherMapping = other[key];
                if (currentMapping.value !== otherMapping.value) {
                    return false;
                }
            }
            return true;
        }
    }
    exports.$l3b = $l3b;
});
//# sourceMappingURL=keymapInfo.js.map