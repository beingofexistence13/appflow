/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/platform/instantiation/common/instantiation"], function (require, exports, keyCodes_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.macLinuxKeyboardMappingEquals = exports.windowsKeyboardMappingEquals = exports.getKeyboardLayoutId = exports.parseKeyboardLayoutDescription = exports.areKeyboardLayoutsEqual = exports.IKeyboardLayoutService = void 0;
    exports.IKeyboardLayoutService = (0, instantiation_1.createDecorator)('keyboardLayoutService');
    function areKeyboardLayoutsEqual(a, b) {
        if (!a || !b) {
            return false;
        }
        if (a.name && b.name && a.name === b.name) {
            return true;
        }
        if (a.id && b.id && a.id === b.id) {
            return true;
        }
        if (a.model &&
            b.model &&
            a.model === b.model &&
            a.layout === b.layout) {
            return true;
        }
        return false;
    }
    exports.areKeyboardLayoutsEqual = areKeyboardLayoutsEqual;
    function parseKeyboardLayoutDescription(layout) {
        if (!layout) {
            return { label: '', description: '' };
        }
        if (layout.name) {
            // windows
            const windowsLayout = layout;
            return {
                label: windowsLayout.text,
                description: ''
            };
        }
        if (layout.id) {
            const macLayout = layout;
            if (macLayout.localizedName) {
                return {
                    label: macLayout.localizedName,
                    description: ''
                };
            }
            if (/^com\.apple\.keylayout\./.test(macLayout.id)) {
                return {
                    label: macLayout.id.replace(/^com\.apple\.keylayout\./, '').replace(/-/, ' '),
                    description: ''
                };
            }
            if (/^.*inputmethod\./.test(macLayout.id)) {
                return {
                    label: macLayout.id.replace(/^.*inputmethod\./, '').replace(/[-\.]/, ' '),
                    description: `Input Method (${macLayout.lang})`
                };
            }
            return {
                label: macLayout.lang,
                description: ''
            };
        }
        const linuxLayout = layout;
        return {
            label: linuxLayout.layout,
            description: ''
        };
    }
    exports.parseKeyboardLayoutDescription = parseKeyboardLayoutDescription;
    function getKeyboardLayoutId(layout) {
        if (layout.name) {
            return layout.name;
        }
        if (layout.id) {
            return layout.id;
        }
        return layout.layout;
    }
    exports.getKeyboardLayoutId = getKeyboardLayoutId;
    function windowsKeyMappingEquals(a, b) {
        if (!a && !b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return (a.vkey === b.vkey
            && a.value === b.value
            && a.withShift === b.withShift
            && a.withAltGr === b.withAltGr
            && a.withShiftAltGr === b.withShiftAltGr);
    }
    function windowsKeyboardMappingEquals(a, b) {
        if (!a && !b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        for (let scanCode = 0; scanCode < 193 /* ScanCode.MAX_VALUE */; scanCode++) {
            const strScanCode = keyCodes_1.ScanCodeUtils.toString(scanCode);
            const aEntry = a[strScanCode];
            const bEntry = b[strScanCode];
            if (!windowsKeyMappingEquals(aEntry, bEntry)) {
                return false;
            }
        }
        return true;
    }
    exports.windowsKeyboardMappingEquals = windowsKeyboardMappingEquals;
    function macLinuxKeyMappingEquals(a, b) {
        if (!a && !b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return (a.value === b.value
            && a.withShift === b.withShift
            && a.withAltGr === b.withAltGr
            && a.withShiftAltGr === b.withShiftAltGr);
    }
    function macLinuxKeyboardMappingEquals(a, b) {
        if (!a && !b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        for (let scanCode = 0; scanCode < 193 /* ScanCode.MAX_VALUE */; scanCode++) {
            const strScanCode = keyCodes_1.ScanCodeUtils.toString(scanCode);
            const aEntry = a[strScanCode];
            const bEntry = b[strScanCode];
            if (!macLinuxKeyMappingEquals(aEntry, bEntry)) {
                return false;
            }
        }
        return true;
    }
    exports.macLinuxKeyboardMappingEquals = macLinuxKeyboardMappingEquals;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmRMYXlvdXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9rZXlib2FyZExheW91dC9jb21tb24va2V5Ym9hcmRMYXlvdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUW5GLFFBQUEsc0JBQXNCLEdBQUcsSUFBQSwrQkFBZSxFQUF5Qix1QkFBdUIsQ0FBQyxDQUFDO0lBMEV2RyxTQUFnQix1QkFBdUIsQ0FBQyxDQUE2QixFQUFFLENBQTZCO1FBQ25HLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7WUFDYixPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsSUFBaUMsQ0FBRSxDQUFDLElBQUksSUFBaUMsQ0FBRSxDQUFDLElBQUksSUFBaUMsQ0FBRSxDQUFDLElBQUksS0FBa0MsQ0FBRSxDQUFDLElBQUksRUFBRTtZQUNsSyxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBNkIsQ0FBRSxDQUFDLEVBQUUsSUFBNkIsQ0FBRSxDQUFDLEVBQUUsSUFBNkIsQ0FBRSxDQUFDLEVBQUUsS0FBOEIsQ0FBRSxDQUFDLEVBQUUsRUFBRTtZQUMxSSxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBK0IsQ0FBRSxDQUFDLEtBQUs7WUFDWCxDQUFFLENBQUMsS0FBSztZQUNSLENBQUUsQ0FBQyxLQUFLLEtBQWdDLENBQUUsQ0FBQyxLQUFLO1lBQ2hELENBQUUsQ0FBQyxNQUFNLEtBQWdDLENBQUUsQ0FBQyxNQUFNLEVBQzVFO1lBQ0QsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQztJQXRCRCwwREFzQkM7SUFFRCxTQUFnQiw4QkFBOEIsQ0FBQyxNQUFrQztRQUNoRixJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1osT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFF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