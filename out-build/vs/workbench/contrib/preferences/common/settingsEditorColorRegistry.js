/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/color", "vs/nls!vs/workbench/contrib/preferences/common/settingsEditorColorRegistry", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme"], function (require, exports, color_1, nls_1, colorRegistry_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gDb = exports.$fDb = exports.$eDb = exports.$dDb = exports.$cDb = exports.$bDb = exports.$aDb = exports.$_Cb = exports.$$Cb = exports.$0Cb = exports.$9Cb = exports.$8Cb = exports.$7Cb = exports.$6Cb = exports.$5Cb = exports.$4Cb = exports.$3Cb = exports.$2Cb = exports.$1Cb = exports.$ZCb = exports.$YCb = void 0;
    // General setting colors
    exports.$YCb = (0, colorRegistry_1.$sv)('settings.headerForeground', { light: '#444444', dark: '#e7e7e7', hcDark: '#ffffff', hcLight: '#292929' }, (0, nls_1.localize)(0, null));
    exports.$ZCb = (0, colorRegistry_1.$sv)('settings.settingsHeaderHoverForeground', { light: (0, colorRegistry_1.$1y)(exports.$YCb, 0.7), dark: (0, colorRegistry_1.$1y)(exports.$YCb, 0.7), hcDark: (0, colorRegistry_1.$1y)(exports.$YCb, 0.7), hcLight: (0, colorRegistry_1.$1y)(exports.$YCb, 0.7) }, (0, nls_1.localize)(1, null));
    exports.$1Cb = (0, colorRegistry_1.$sv)('settings.modifiedItemIndicator', {
        light: new color_1.$Os(new color_1.$Ls(102, 175, 224)),
        dark: new color_1.$Os(new color_1.$Ls(12, 125, 157)),
        hcDark: new color_1.$Os(new color_1.$Ls(0, 73, 122)),
        hcLight: new color_1.$Os(new color_1.$Ls(102, 175, 224)),
    }, (0, nls_1.localize)(2, null));
    exports.$2Cb = (0, colorRegistry_1.$sv)('settings.headerBorder', { dark: theme_1.$M_, light: theme_1.$M_, hcDark: theme_1.$M_, hcLight: theme_1.$M_ }, (0, nls_1.localize)(3, null));
    exports.$3Cb = (0, colorRegistry_1.$sv)('settings.sashBorder', { dark: theme_1.$M_, light: theme_1.$M_, hcDark: theme_1.$M_, hcLight: theme_1.$M_ }, (0, nls_1.localize)(4, null));
    // Enum control colors
    exports.$4Cb = (0, colorRegistry_1.$sv)(`settings.dropdownBackground`, { dark: colorRegistry_1.$4v, light: colorRegistry_1.$4v, hcDark: colorRegistry_1.$4v, hcLight: colorRegistry_1.$4v }, (0, nls_1.localize)(5, null));
    exports.$5Cb = (0, colorRegistry_1.$sv)('settings.dropdownForeground', { dark: colorRegistry_1.$6v, light: colorRegistry_1.$6v, hcDark: colorRegistry_1.$6v, hcLight: colorRegistry_1.$6v }, (0, nls_1.localize)(6, null));
    exports.$6Cb = (0, colorRegistry_1.$sv)('settings.dropdownBorder', { dark: colorRegistry_1.$7v, light: colorRegistry_1.$7v, hcDark: colorRegistry_1.$7v, hcLight: colorRegistry_1.$7v }, (0, nls_1.localize)(7, null));
    exports.$7Cb = (0, colorRegistry_1.$sv)('settings.dropdownListBorder', { dark: colorRegistry_1.$Cw, light: colorRegistry_1.$Cw, hcDark: colorRegistry_1.$Cw, hcLight: colorRegistry_1.$Cw }, (0, nls_1.localize)(8, null));
    // Bool control colors
    exports.$8Cb = (0, colorRegistry_1.$sv)('settings.checkboxBackground', { dark: colorRegistry_1.$Zx, light: colorRegistry_1.$Zx, hcDark: colorRegistry_1.$Zx, hcLight: colorRegistry_1.$Zx }, (0, nls_1.localize)(9, null));
    exports.$9Cb = (0, colorRegistry_1.$sv)('settings.checkboxForeground', { dark: colorRegistry_1.$2x, light: colorRegistry_1.$2x, hcDark: colorRegistry_1.$2x, hcLight: colorRegistry_1.$2x }, (0, nls_1.localize)(10, null));
    exports.$0Cb = (0, colorRegistry_1.$sv)('settings.checkboxBorder', { dark: colorRegistry_1.$3x, light: colorRegistry_1.$3x, hcDark: colorRegistry_1.$3x, hcLight: colorRegistry_1.$3x }, (0, nls_1.localize)(11, null));
    // Text control colors
    exports.$$Cb = (0, colorRegistry_1.$sv)('settings.textInputBackground', { dark: colorRegistry_1.$Mv, light: colorRegistry_1.$Mv, hcDark: colorRegistry_1.$Mv, hcLight: colorRegistry_1.$Mv }, (0, nls_1.localize)(12, null));
    exports.$_Cb = (0, colorRegistry_1.$sv)('settings.textInputForeground', { dark: colorRegistry_1.$Nv, light: colorRegistry_1.$Nv, hcDark: colorRegistry_1.$Nv, hcLight: colorRegistry_1.$Nv }, (0, nls_1.localize)(13, null));
    exports.$aDb = (0, colorRegistry_1.$sv)('settings.textInputBorder', { dark: colorRegistry_1.$Ov, light: colorRegistry_1.$Ov, hcDark: colorRegistry_1.$Ov, hcLight: colorRegistry_1.$Ov }, (0, nls_1.localize)(14, null));
    // Number control colors
    exports.$bDb = (0, colorRegistry_1.$sv)('settings.numberInputBackground', { dark: colorRegistry_1.$Mv, light: colorRegistry_1.$Mv, hcDark: colorRegistry_1.$Mv, hcLight: colorRegistry_1.$Mv }, (0, nls_1.localize)(15, null));
    exports.$cDb = (0, colorRegistry_1.$sv)('settings.numberInputForeground', { dark: colorRegistry_1.$Nv, light: colorRegistry_1.$Nv, hcDark: colorRegistry_1.$Nv, hcLight: colorRegistry_1.$Nv }, (0, nls_1.localize)(16, null));
    exports.$dDb = (0, colorRegistry_1.$sv)('settings.numberInputBorder', { dark: colorRegistry_1.$Ov, light: colorRegistry_1.$Ov, hcDark: colorRegistry_1.$Ov, hcLight: colorRegistry_1.$Ov }, (0, nls_1.localize)(17, null));
    exports.$eDb = (0, colorRegistry_1.$sv)('settings.focusedRowBackground', {
        dark: (0, colorRegistry_1.$1y)(colorRegistry_1.$Gx, .6),
        light: (0, colorRegistry_1.$1y)(colorRegistry_1.$Gx, .6),
        hcDark: null,
        hcLight: null,
    }, (0, nls_1.localize)(18, null));
    exports.$fDb = (0, colorRegistry_1.$sv)('settings.rowHoverBackground', {
        dark: (0, colorRegistry_1.$1y)(colorRegistry_1.$Gx, .3),
        light: (0, colorRegistry_1.$1y)(colorRegistry_1.$Gx, .3),
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(19, null));
    exports.$gDb = (0, colorRegistry_1.$sv)('settings.focusedRowBorder', {
        dark: colorRegistry_1.$zv,
        light: colorRegistry_1.$zv,
        hcDark: colorRegistry_1.$zv,
        hcLight: colorRegistry_1.$zv
    }, (0, nls_1.localize)(20, null));
});
//# sourceMappingURL=settingsEditorColorRegistry.js.map