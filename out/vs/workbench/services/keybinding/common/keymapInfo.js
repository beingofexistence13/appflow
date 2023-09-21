/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/platform/keyboardLayout/common/keyboardLayout"], function (require, exports, platform_1, keyboardLayout_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeymapInfo = void 0;
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
    class KeymapInfo {
        constructor(layout, secondaryLayouts, keyboardMapping, isUserKeyboardLayout) {
            this.layout = layout;
            this.secondaryLayouts = secondaryLayouts;
            this.mapping = deserializeMapping(keyboardMapping);
            this.isUserKeyboardLayout = !!isUserKeyboardLayout;
            this.layout.isUserKeyboardLayout = !!isUserKeyboardLayout;
        }
        static createKeyboardLayoutFromDebugInfo(layout, value, isUserKeyboardLayout) {
            const keyboardLayoutInfo = new KeymapInfo(layout, [], {}, true);
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
                if (platform_1.isWindows && (key === 'Backslash' || key === 'KeyQ')) {
                    // keymap from Chromium is probably wrong.
                    continue;
                }
                if (platform_1.isLinux && (key === 'Backspace' || key === 'Escape')) {
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
            if ((0, keyboardLayout_1.getKeyboardLayoutId)(this.layout) !== (0, keyboardLayout_1.getKeyboardLayoutId)(other.layout)) {
                return false;
            }
            return this.fuzzyEqual(other.mapping);
        }
        fuzzyEqual(other) {
            for (const key in other) {
                if (platform_1.isWindows && (key === 'Backslash' || key === 'KeyQ')) {
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
    exports.KeymapInfo = KeymapInfo;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5bWFwSW5mby5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9rZXliaW5kaW5nL2NvbW1vbi9rZXltYXBJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxTQUFTLGtCQUFrQixDQUFDLGlCQUFxQztRQUNoRSxNQUFNLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQztRQUVsQyxNQUFNLEdBQUcsR0FBMkIsRUFBRSxDQUFDO1FBQ3ZDLEtBQUssTUFBTSxHQUFHLElBQUksT0FBTyxFQUFFO1lBQzFCLE1BQU0sTUFBTSxHQUF3QixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakQsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO2dCQUNsQixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUIsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUN6RCxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUc7b0JBQ1YsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsTUFBTSxFQUFFLElBQUk7b0JBQ1osV0FBVyxFQUFFLFNBQVM7b0JBQ3RCLFdBQVcsRUFBRSxTQUFTO29CQUN0QixnQkFBZ0IsRUFBRSxjQUFjO29C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