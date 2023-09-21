/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/platform/instantiation/common/instantiation"], function (require, exports, keyCodes_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Yyb = exports.$Xyb = exports.$Wyb = exports.$Vyb = exports.$Uyb = exports.$Tyb = void 0;
    exports.$Tyb = (0, instantiation_1.$Bh)('keyboardLayoutService');
    function $Uyb(a, b) {
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
    exports.$Uyb = $Uyb;
    function $Vyb(layout) {
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
    exports.$Vyb = $Vyb;
    function $Wyb(layout) {
        if (layout.name) {
            return layout.name;
        }
        if (layout.id) {
            return layout.id;
        }
        return layout.layout;
    }
    exports.$Wyb = $Wyb;
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
    function $Xyb(a, b) {
        if (!a && !b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        for (let scanCode = 0; scanCode < 193 /* ScanCode.MAX_VALUE */; scanCode++) {
            const strScanCode = keyCodes_1.$sq.toString(scanCode);
            const aEntry = a[strScanCode];
            const bEntry = b[strScanCode];
            if (!windowsKeyMappingEquals(aEntry, bEntry)) {
                return false;
            }
        }
        return true;
    }
    exports.$Xyb = $Xyb;
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
    function $Yyb(a, b) {
        if (!a && !b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        for (let scanCode = 0; scanCode < 193 /* ScanCode.MAX_VALUE */; scanCode++) {
            const strScanCode = keyCodes_1.$sq.toString(scanCode);
            const aEntry = a[strScanCode];
            const bEntry = b[strScanCode];
            if (!macLinuxKeyMappingEquals(aEntry, bEntry)) {
                return false;
            }
        }
        return true;
    }
    exports.$Yyb = $Yyb;
});
//# sourceMappingURL=keyboardLayout.js.map