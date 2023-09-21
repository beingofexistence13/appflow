/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/common/theme", "vs/platform/theme/common/colorRegistry", "vs/base/common/color", "vs/platform/theme/common/theme"], function (require, exports, nls_1, colorRegistry_1, color_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gbb = exports.$fbb = exports.$ebb = exports.$dbb = exports.$cbb = exports.$bbb = exports.$abb = exports.$_ab = exports.$$ab = exports.$0ab = exports.$9ab = exports.$8ab = exports.$7ab = exports.$6ab = exports.$5ab = exports.$4ab = exports.$3ab = exports.$2ab = exports.$1ab = exports.$Zab = exports.$Yab = exports.$Xab = exports.$Wab = exports.$Vab = exports.$Uab = exports.$Tab = exports.$Sab = exports.$Rab = exports.$Qab = exports.$Pab = exports.$Oab = exports.$Nab = exports.$Mab = exports.$Lab = exports.$Kab = exports.$Jab = exports.$Iab = exports.$Hab = exports.$Gab = exports.$Fab = exports.$Eab = exports.$Dab = exports.$Cab = exports.$Bab = exports.$Aab = exports.$zab = exports.$yab = exports.$xab = exports.$wab = exports.$vab = exports.$uab = exports.$tab = exports.$sab = exports.$rab = exports.$qab = exports.$pab = exports.$oab = exports.$nab = exports.$mab = exports.$lab = exports.$kab = exports.$jab = exports.$iab = exports.$hab = exports.$gab = exports.$fab = exports.$eab = exports.$dab = exports.$cab = exports.$bab = exports.$aab = exports.$__ = exports.$$_ = exports.$0_ = exports.$9_ = exports.$8_ = exports.$7_ = exports.$6_ = exports.$5_ = exports.$4_ = exports.$3_ = exports.$2_ = exports.$1_ = exports.$Z_ = exports.$Y_ = exports.$X_ = exports.$W_ = exports.$V_ = exports.$U_ = exports.$T_ = exports.$S_ = exports.$R_ = exports.$Q_ = exports.$P_ = exports.$O_ = exports.$N_ = exports.$M_ = exports.$L_ = exports.$K_ = exports.$J_ = exports.$I_ = exports.$H_ = exports.$G_ = exports.$F_ = exports.$E_ = exports.$D_ = exports.$C_ = exports.$B_ = exports.$A_ = exports.$z_ = exports.$y_ = exports.$x_ = exports.$w_ = exports.$v_ = exports.$u_ = exports.$t_ = exports.$s_ = exports.$r_ = exports.$q_ = exports.$p_ = exports.$o_ = exports.$n_ = exports.$m_ = exports.$l_ = exports.$k_ = exports.$j_ = exports.$i_ = exports.$h_ = exports.$g_ = exports.$f_ = exports.$e_ = exports.$d_ = exports.$c_ = exports.$b_ = exports.$a_ = exports.$_$ = exports.$$$ = void 0;
    // < --- Workbench (not customizable) --- >
    function $$$(theme) {
        switch (theme.type) {
            case theme_1.ColorScheme.LIGHT:
                return color_1.$Os.fromHex('#F3F3F3');
            case theme_1.ColorScheme.HIGH_CONTRAST_LIGHT:
                return color_1.$Os.fromHex('#FFFFFF');
            case theme_1.ColorScheme.HIGH_CONTRAST_DARK:
                return color_1.$Os.fromHex('#000000');
            default:
                return color_1.$Os.fromHex('#252526');
        }
    }
    exports.$$$ = $$$;
    // < --- Tabs --- >
    //#region Tab Background
    exports.$_$ = (0, colorRegistry_1.$sv)('tab.activeBackground', {
        dark: colorRegistry_1.$ww,
        light: colorRegistry_1.$ww,
        hcDark: colorRegistry_1.$ww,
        hcLight: colorRegistry_1.$ww
    }, (0, nls_1.localize)(0, null));
    exports.$a_ = (0, colorRegistry_1.$sv)('tab.unfocusedActiveBackground', {
        dark: exports.$_$,
        light: exports.$_$,
        hcDark: exports.$_$,
        hcLight: exports.$_$,
    }, (0, nls_1.localize)(1, null));
    exports.$b_ = (0, colorRegistry_1.$sv)('tab.inactiveBackground', {
        dark: '#2D2D2D',
        light: '#ECECEC',
        hcDark: null,
        hcLight: null,
    }, (0, nls_1.localize)(2, null));
    exports.$c_ = (0, colorRegistry_1.$sv)('tab.unfocusedInactiveBackground', {
        dark: exports.$b_,
        light: exports.$b_,
        hcDark: exports.$b_,
        hcLight: exports.$b_
    }, (0, nls_1.localize)(3, null));
    //#endregion
    //#region Tab Foreground
    exports.$d_ = (0, colorRegistry_1.$sv)('tab.activeForeground', {
        dark: color_1.$Os.white,
        light: '#333333',
        hcDark: color_1.$Os.white,
        hcLight: '#292929'
    }, (0, nls_1.localize)(4, null));
    exports.$e_ = (0, colorRegistry_1.$sv)('tab.inactiveForeground', {
        dark: (0, colorRegistry_1.$1y)(exports.$d_, 0.5),
        light: (0, colorRegistry_1.$1y)(exports.$d_, 0.7),
        hcDark: color_1.$Os.white,
        hcLight: '#292929'
    }, (0, nls_1.localize)(5, null));
    exports.$f_ = (0, colorRegistry_1.$sv)('tab.unfocusedActiveForeground', {
        dark: (0, colorRegistry_1.$1y)(exports.$d_, 0.5),
        light: (0, colorRegistry_1.$1y)(exports.$d_, 0.7),
        hcDark: color_1.$Os.white,
        hcLight: '#292929'
    }, (0, nls_1.localize)(6, null));
    exports.$g_ = (0, colorRegistry_1.$sv)('tab.unfocusedInactiveForeground', {
        dark: (0, colorRegistry_1.$1y)(exports.$e_, 0.5),
        light: (0, colorRegistry_1.$1y)(exports.$e_, 0.5),
        hcDark: color_1.$Os.white,
        hcLight: '#292929'
    }, (0, nls_1.localize)(7, null));
    //#endregion
    //#region Tab Hover Foreground/Background
    exports.$h_ = (0, colorRegistry_1.$sv)('tab.hoverBackground', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(8, null));
    exports.$i_ = (0, colorRegistry_1.$sv)('tab.unfocusedHoverBackground', {
        dark: (0, colorRegistry_1.$1y)(exports.$h_, 0.5),
        light: (0, colorRegistry_1.$1y)(exports.$h_, 0.7),
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(9, null));
    exports.$j_ = (0, colorRegistry_1.$sv)('tab.hoverForeground', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null,
    }, (0, nls_1.localize)(10, null));
    exports.$k_ = (0, colorRegistry_1.$sv)('tab.unfocusedHoverForeground', {
        dark: (0, colorRegistry_1.$1y)(exports.$j_, 0.5),
        light: (0, colorRegistry_1.$1y)(exports.$j_, 0.5),
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(11, null));
    //#endregion
    //#region Tab Borders
    exports.$l_ = (0, colorRegistry_1.$sv)('tab.border', {
        dark: '#252526',
        light: '#F3F3F3',
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av,
    }, (0, nls_1.localize)(12, null));
    exports.$m_ = (0, colorRegistry_1.$sv)('tab.lastPinnedBorder', {
        dark: colorRegistry_1.$Ux,
        light: colorRegistry_1.$Ux,
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(13, null));
    exports.$n_ = (0, colorRegistry_1.$sv)('tab.activeBorder', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(14, null));
    exports.$o_ = (0, colorRegistry_1.$sv)('tab.unfocusedActiveBorder', {
        dark: (0, colorRegistry_1.$1y)(exports.$n_, 0.5),
        light: (0, colorRegistry_1.$1y)(exports.$n_, 0.7),
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(15, null));
    exports.$p_ = (0, colorRegistry_1.$sv)('tab.activeBorderTop', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: '#B5200D'
    }, (0, nls_1.localize)(16, null));
    exports.$q_ = (0, colorRegistry_1.$sv)('tab.unfocusedActiveBorderTop', {
        dark: (0, colorRegistry_1.$1y)(exports.$p_, 0.5),
        light: (0, colorRegistry_1.$1y)(exports.$p_, 0.7),
        hcDark: null,
        hcLight: '#B5200D'
    }, (0, nls_1.localize)(17, null));
    exports.$r_ = (0, colorRegistry_1.$sv)('tab.hoverBorder', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(18, null));
    exports.$s_ = (0, colorRegistry_1.$sv)('tab.unfocusedHoverBorder', {
        dark: (0, colorRegistry_1.$1y)(exports.$r_, 0.5),
        light: (0, colorRegistry_1.$1y)(exports.$r_, 0.7),
        hcDark: null,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(19, null));
    //#endregion
    //#region Tab Modified Border
    exports.$t_ = (0, colorRegistry_1.$sv)('tab.activeModifiedBorder', {
        dark: '#3399CC',
        light: '#33AAEE',
        hcDark: null,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(20, null));
    exports.$u_ = (0, colorRegistry_1.$sv)('tab.inactiveModifiedBorder', {
        dark: (0, colorRegistry_1.$1y)(exports.$t_, 0.5),
        light: (0, colorRegistry_1.$1y)(exports.$t_, 0.5),
        hcDark: color_1.$Os.white,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(21, null));
    exports.$v_ = (0, colorRegistry_1.$sv)('tab.unfocusedActiveModifiedBorder', {
        dark: (0, colorRegistry_1.$1y)(exports.$t_, 0.5),
        light: (0, colorRegistry_1.$1y)(exports.$t_, 0.7),
        hcDark: color_1.$Os.white,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(22, null));
    exports.$w_ = (0, colorRegistry_1.$sv)('tab.unfocusedInactiveModifiedBorder', {
        dark: (0, colorRegistry_1.$1y)(exports.$u_, 0.5),
        light: (0, colorRegistry_1.$1y)(exports.$u_, 0.5),
        hcDark: color_1.$Os.white,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(23, null));
    //#endregion
    // < --- Editors --- >
    exports.$x_ = (0, colorRegistry_1.$sv)('editorPane.background', {
        dark: colorRegistry_1.$ww,
        light: colorRegistry_1.$ww,
        hcDark: colorRegistry_1.$ww,
        hcLight: colorRegistry_1.$ww
    }, (0, nls_1.localize)(24, null));
    exports.$y_ = (0, colorRegistry_1.$sv)('editorGroup.emptyBackground', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(25, null));
    exports.$z_ = (0, colorRegistry_1.$sv)('editorGroup.focusedEmptyBorder', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.$zv,
        hcLight: colorRegistry_1.$zv
    }, (0, nls_1.localize)(26, null));
    exports.$A_ = (0, colorRegistry_1.$sv)('editorGroupHeader.tabsBackground', {
        dark: '#252526',
        light: '#F3F3F3',
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(27, null));
    exports.$B_ = (0, colorRegistry_1.$sv)('editorGroupHeader.tabsBorder', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(28, null));
    exports.$C_ = (0, colorRegistry_1.$sv)('editorGroupHeader.noTabsBackground', {
        dark: colorRegistry_1.$ww,
        light: colorRegistry_1.$ww,
        hcDark: colorRegistry_1.$ww,
        hcLight: colorRegistry_1.$ww
    }, (0, nls_1.localize)(29, null));
    exports.$D_ = (0, colorRegistry_1.$sv)('editorGroupHeader.border', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(30, null));
    exports.$E_ = (0, colorRegistry_1.$sv)('editorGroup.border', {
        dark: '#444444',
        light: '#E7E7E7',
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(31, null));
    exports.$F_ = (0, colorRegistry_1.$sv)('editorGroup.dropBackground', {
        dark: color_1.$Os.fromHex('#53595D').transparent(0.5),
        light: color_1.$Os.fromHex('#2677CB').transparent(0.18),
        hcDark: null,
        hcLight: color_1.$Os.fromHex('#0F4A85').transparent(0.50)
    }, (0, nls_1.localize)(32, null));
    exports.$G_ = (0, colorRegistry_1.$sv)('editorGroup.dropIntoPromptForeground', {
        dark: colorRegistry_1.$Bw,
        light: colorRegistry_1.$Bw,
        hcDark: colorRegistry_1.$Bw,
        hcLight: colorRegistry_1.$Bw
    }, (0, nls_1.localize)(33, null));
    exports.$H_ = (0, colorRegistry_1.$sv)('editorGroup.dropIntoPromptBackground', {
        dark: colorRegistry_1.$Aw,
        light: colorRegistry_1.$Aw,
        hcDark: colorRegistry_1.$Aw,
        hcLight: colorRegistry_1.$Aw
    }, (0, nls_1.localize)(34, null));
    exports.$I_ = (0, colorRegistry_1.$sv)('editorGroup.dropIntoPromptBorder', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(35, null));
    exports.$J_ = (0, colorRegistry_1.$sv)('sideBySideEditor.horizontalBorder', {
        dark: exports.$E_,
        light: exports.$E_,
        hcDark: exports.$E_,
        hcLight: exports.$E_
    }, (0, nls_1.localize)(36, null));
    exports.$K_ = (0, colorRegistry_1.$sv)('sideBySideEditor.verticalBorder', {
        dark: exports.$E_,
        light: exports.$E_,
        hcDark: exports.$E_,
        hcLight: exports.$E_
    }, (0, nls_1.localize)(37, null));
    // < --- Panels --- >
    exports.$L_ = (0, colorRegistry_1.$sv)('panel.background', {
        dark: colorRegistry_1.$ww,
        light: colorRegistry_1.$ww,
        hcDark: colorRegistry_1.$ww,
        hcLight: colorRegistry_1.$ww
    }, (0, nls_1.localize)(38, null));
    exports.$M_ = (0, colorRegistry_1.$sv)('panel.border', {
        dark: color_1.$Os.fromHex('#808080').transparent(0.35),
        light: color_1.$Os.fromHex('#808080').transparent(0.35),
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(39, null));
    exports.$N_ = (0, colorRegistry_1.$sv)('panelTitle.activeForeground', {
        dark: '#E7E7E7',
        light: '#424242',
        hcDark: color_1.$Os.white,
        hcLight: colorRegistry_1.$xw
    }, (0, nls_1.localize)(40, null));
    exports.$O_ = (0, colorRegistry_1.$sv)('panelTitle.inactiveForeground', {
        dark: (0, colorRegistry_1.$1y)(exports.$N_, 0.6),
        light: (0, colorRegistry_1.$1y)(exports.$N_, 0.75),
        hcDark: color_1.$Os.white,
        hcLight: colorRegistry_1.$xw
    }, (0, nls_1.localize)(41, null));
    exports.$P_ = (0, colorRegistry_1.$sv)('panelTitle.activeBorder', {
        dark: exports.$N_,
        light: exports.$N_,
        hcDark: colorRegistry_1.$Av,
        hcLight: '#B5200D'
    }, (0, nls_1.localize)(42, null));
    exports.$Q_ = (0, colorRegistry_1.$sv)('panelInput.border', {
        dark: colorRegistry_1.$Ov,
        light: color_1.$Os.fromHex('#ddd'),
        hcDark: colorRegistry_1.$Ov,
        hcLight: colorRegistry_1.$Ov
    }, (0, nls_1.localize)(43, null));
    exports.$R_ = (0, colorRegistry_1.$sv)('panel.dropBorder', {
        dark: exports.$N_,
        light: exports.$N_,
        hcDark: exports.$N_,
        hcLight: exports.$N_
    }, (0, nls_1.localize)(44, null));
    exports.$S_ = (0, colorRegistry_1.$sv)('panelSection.dropBackground', {
        dark: exports.$F_,
        light: exports.$F_,
        hcDark: exports.$F_,
        hcLight: exports.$F_
    }, (0, nls_1.localize)(45, null));
    exports.$T_ = (0, colorRegistry_1.$sv)('panelSectionHeader.background', {
        dark: color_1.$Os.fromHex('#808080').transparent(0.2),
        light: color_1.$Os.fromHex('#808080').transparent(0.2),
        hcDark: null,
        hcLight: null,
    }, (0, nls_1.localize)(46, null));
    exports.$U_ = (0, colorRegistry_1.$sv)('panelSectionHeader.foreground', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(47, null));
    exports.$V_ = (0, colorRegistry_1.$sv)('panelSectionHeader.border', {
        dark: colorRegistry_1.$Av,
        light: colorRegistry_1.$Av,
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(48, null));
    exports.$W_ = (0, colorRegistry_1.$sv)('panelSection.border', {
        dark: exports.$M_,
        light: exports.$M_,
        hcDark: exports.$M_,
        hcLight: exports.$M_
    }, (0, nls_1.localize)(49, null));
    // < --- Banner --- >
    exports.$X_ = (0, colorRegistry_1.$sv)('banner.background', {
        dark: colorRegistry_1.$yx,
        light: (0, colorRegistry_1.$Yy)(colorRegistry_1.$yx, 0.3),
        hcDark: colorRegistry_1.$yx,
        hcLight: colorRegistry_1.$yx
    }, (0, nls_1.localize)(50, null));
    exports.$Y_ = (0, colorRegistry_1.$sv)('banner.foreground', {
        dark: colorRegistry_1.$zx,
        light: colorRegistry_1.$zx,
        hcDark: colorRegistry_1.$zx,
        hcLight: colorRegistry_1.$zx
    }, (0, nls_1.localize)(51, null));
    exports.$Z_ = (0, colorRegistry_1.$sv)('banner.iconForeground', {
        dark: colorRegistry_1.$rw,
        light: colorRegistry_1.$rw,
        hcDark: colorRegistry_1.$rw,
        hcLight: colorRegistry_1.$rw
    }, (0, nls_1.localize)(52, null));
    // < --- Status --- >
    exports.$1_ = (0, colorRegistry_1.$sv)('statusBar.foreground', {
        dark: '#FFFFFF',
        light: '#FFFFFF',
        hcDark: '#FFFFFF',
        hcLight: colorRegistry_1.$xw
    }, (0, nls_1.localize)(53, null));
    exports.$2_ = (0, colorRegistry_1.$sv)('statusBar.noFolderForeground', {
        dark: exports.$1_,
        light: exports.$1_,
        hcDark: exports.$1_,
        hcLight: exports.$1_
    }, (0, nls_1.localize)(54, null));
    exports.$3_ = (0, colorRegistry_1.$sv)('statusBar.background', {
        dark: '#007ACC',
        light: '#007ACC',
        hcDark: null,
        hcLight: null,
    }, (0, nls_1.localize)(55, null));
    exports.$4_ = (0, colorRegistry_1.$sv)('statusBar.noFolderBackground', {
        dark: '#68217A',
        light: '#68217A',
        hcDark: null,
        hcLight: null,
    }, (0, nls_1.localize)(56, null));
    exports.$5_ = (0, colorRegistry_1.$sv)('statusBar.border', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(57, null));
    exports.$6_ = (0, colorRegistry_1.$sv)('statusBar.focusBorder', {
        dark: exports.$1_,
        light: exports.$1_,
        hcDark: null,
        hcLight: exports.$1_
    }, (0, nls_1.localize)(58, null));
    exports.$7_ = (0, colorRegistry_1.$sv)('statusBar.noFolderBorder', {
        dark: exports.$5_,
        light: exports.$5_,
        hcDark: exports.$5_,
        hcLight: exports.$5_
    }, (0, nls_1.localize)(59, null));
    exports.$8_ = (0, colorRegistry_1.$sv)('statusBarItem.activeBackground', {
        dark: color_1.$Os.white.transparent(0.18),
        light: color_1.$Os.white.transparent(0.18),
        hcDark: color_1.$Os.white.transparent(0.18),
        hcLight: color_1.$Os.black.transparent(0.18)
    }, (0, nls_1.localize)(60, null));
    exports.$9_ = (0, colorRegistry_1.$sv)('statusBarItem.focusBorder', {
        dark: exports.$1_,
        light: exports.$1_,
        hcDark: null,
        hcLight: colorRegistry_1.$Bv
    }, (0, nls_1.localize)(61, null));
    exports.$0_ = (0, colorRegistry_1.$sv)('statusBarItem.hoverBackground', {
        dark: color_1.$Os.white.transparent(0.12),
        light: color_1.$Os.white.transparent(0.12),
        hcDark: color_1.$Os.white.transparent(0.12),
        hcLight: color_1.$Os.black.transparent(0.12)
    }, (0, nls_1.localize)(62, null));
    exports.$$_ = (0, colorRegistry_1.$sv)('statusBarItem.hoverForeground', {
        dark: exports.$1_,
        light: exports.$1_,
        hcDark: exports.$1_,
        hcLight: exports.$1_
    }, (0, nls_1.localize)(63, null));
    exports.$__ = (0, colorRegistry_1.$sv)('statusBarItem.compactHoverBackground', {
        dark: color_1.$Os.white.transparent(0.20),
        light: color_1.$Os.white.transparent(0.20),
        hcDark: color_1.$Os.white.transparent(0.20),
        hcLight: color_1.$Os.black.transparent(0.20)
    }, (0, nls_1.localize)(64, null));
    exports.$aab = (0, colorRegistry_1.$sv)('statusBarItem.prominentForeground', {
        dark: exports.$1_,
        light: exports.$1_,
        hcDark: exports.$1_,
        hcLight: exports.$1_
    }, (0, nls_1.localize)(65, null));
    exports.$bab = (0, colorRegistry_1.$sv)('statusBarItem.prominentBackground', {
        dark: color_1.$Os.black.transparent(0.5),
        light: color_1.$Os.black.transparent(0.5),
        hcDark: color_1.$Os.black.transparent(0.5),
        hcLight: color_1.$Os.black.transparent(0.5),
    }, (0, nls_1.localize)(66, null));
    exports.$cab = (0, colorRegistry_1.$sv)('statusBarItem.prominentHoverForeground', {
        dark: exports.$$_,
        light: exports.$$_,
        hcDark: exports.$$_,
        hcLight: exports.$$_
    }, (0, nls_1.localize)(67, null));
    exports.$dab = (0, colorRegistry_1.$sv)('statusBarItem.prominentHoverBackground', {
        dark: color_1.$Os.black.transparent(0.3),
        light: color_1.$Os.black.transparent(0.3),
        hcDark: color_1.$Os.black.transparent(0.3),
        hcLight: null
    }, (0, nls_1.localize)(68, null));
    exports.$eab = (0, colorRegistry_1.$sv)('statusBarItem.errorBackground', {
        dark: (0, colorRegistry_1.$Yy)(colorRegistry_1.$wv, .4),
        light: (0, colorRegistry_1.$Yy)(colorRegistry_1.$wv, .4),
        hcDark: null,
        hcLight: '#B5200D'
    }, (0, nls_1.localize)(69, null));
    exports.$fab = (0, colorRegistry_1.$sv)('statusBarItem.errorForeground', {
        dark: color_1.$Os.white,
        light: color_1.$Os.white,
        hcDark: color_1.$Os.white,
        hcLight: color_1.$Os.white
    }, (0, nls_1.localize)(70, null));
    exports.$gab = (0, colorRegistry_1.$sv)('statusBarItem.errorHoverForeground', {
        dark: exports.$$_,
        light: exports.$$_,
        hcDark: exports.$$_,
        hcLight: exports.$$_
    }, (0, nls_1.localize)(71, null));
    exports.$hab = (0, colorRegistry_1.$sv)('statusBarItem.errorHoverBackground', {
        dark: exports.$0_,
        light: exports.$0_,
        hcDark: exports.$0_,
        hcLight: exports.$0_
    }, (0, nls_1.localize)(72, null));
    exports.$iab = (0, colorRegistry_1.$sv)('statusBarItem.warningBackground', {
        dark: (0, colorRegistry_1.$Yy)(colorRegistry_1.$ow, .4),
        light: (0, colorRegistry_1.$Yy)(colorRegistry_1.$ow, .4),
        hcDark: null,
        hcLight: '#895503'
    }, (0, nls_1.localize)(73, null));
    exports.$jab = (0, colorRegistry_1.$sv)('statusBarItem.warningForeground', {
        dark: color_1.$Os.white,
        light: color_1.$Os.white,
        hcDark: color_1.$Os.white,
        hcLight: color_1.$Os.white
    }, (0, nls_1.localize)(74, null));
    exports.$kab = (0, colorRegistry_1.$sv)('statusBarItem.warningHoverForeground', {
        dark: exports.$$_,
        light: exports.$$_,
        hcDark: exports.$$_,
        hcLight: exports.$$_
    }, (0, nls_1.localize)(75, null));
    exports.$lab = (0, colorRegistry_1.$sv)('statusBarItem.warningHoverBackground', {
        dark: exports.$0_,
        light: exports.$0_,
        hcDark: exports.$0_,
        hcLight: exports.$0_
    }, (0, nls_1.localize)(76, null));
    // < --- Activity Bar --- >
    exports.$mab = (0, colorRegistry_1.$sv)('activityBar.background', {
        dark: '#333333',
        light: '#2C2C2C',
        hcDark: '#000000',
        hcLight: '#FFFFFF'
    }, (0, nls_1.localize)(77, null));
    exports.$nab = (0, colorRegistry_1.$sv)('activityBar.foreground', {
        dark: color_1.$Os.white,
        light: color_1.$Os.white,
        hcDark: color_1.$Os.white,
        hcLight: colorRegistry_1.$xw
    }, (0, nls_1.localize)(78, null));
    exports.$oab = (0, colorRegistry_1.$sv)('activityBar.inactiveForeground', {
        dark: (0, colorRegistry_1.$1y)(exports.$nab, 0.4),
        light: (0, colorRegistry_1.$1y)(exports.$nab, 0.4),
        hcDark: color_1.$Os.white,
        hcLight: colorRegistry_1.$xw
    }, (0, nls_1.localize)(79, null));
    exports.$pab = (0, colorRegistry_1.$sv)('activityBar.border', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(80, null));
    exports.$qab = (0, colorRegistry_1.$sv)('activityBar.activeBorder', {
        dark: exports.$nab,
        light: exports.$nab,
        hcDark: null,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(81, null));
    exports.$rab = (0, colorRegistry_1.$sv)('activityBar.activeFocusBorder', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: '#B5200D'
    }, (0, nls_1.localize)(82, null));
    exports.$sab = (0, colorRegistry_1.$sv)('activityBar.activeBackground', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(83, null));
    exports.$tab = (0, colorRegistry_1.$sv)('activityBar.dropBorder', {
        dark: exports.$nab,
        light: exports.$nab,
        hcDark: null,
        hcLight: null,
    }, (0, nls_1.localize)(84, null));
    exports.$uab = (0, colorRegistry_1.$sv)('activityBarBadge.background', {
        dark: '#007ACC',
        light: '#007ACC',
        hcDark: '#000000',
        hcLight: '#0F4A85'
    }, (0, nls_1.localize)(85, null));
    exports.$vab = (0, colorRegistry_1.$sv)('activityBarBadge.foreground', {
        dark: color_1.$Os.white,
        light: color_1.$Os.white,
        hcDark: color_1.$Os.white,
        hcLight: color_1.$Os.white
    }, (0, nls_1.localize)(86, null));
    // < --- Profiles --- >
    exports.$wab = (0, colorRegistry_1.$sv)('profileBadge.background', {
        dark: '#4D4D4D',
        light: '#C4C4C4',
        hcDark: color_1.$Os.white,
        hcLight: color_1.$Os.black
    }, (0, nls_1.localize)(87, null));
    exports.$xab = (0, colorRegistry_1.$sv)('profileBadge.foreground', {
        dark: color_1.$Os.white,
        light: '#333333',
        hcDark: color_1.$Os.black,
        hcLight: color_1.$Os.white
    }, (0, nls_1.localize)(88, null));
    // < --- Remote --- >
    exports.$yab = (0, colorRegistry_1.$sv)('statusBarItem.remoteBackground', {
        dark: exports.$uab,
        light: exports.$uab,
        hcDark: exports.$uab,
        hcLight: exports.$uab
    }, (0, nls_1.localize)(89, null));
    exports.$zab = (0, colorRegistry_1.$sv)('statusBarItem.remoteForeground', {
        dark: exports.$vab,
        light: exports.$vab,
        hcDark: exports.$vab,
        hcLight: exports.$vab
    }, (0, nls_1.localize)(90, null));
    exports.$Aab = (0, colorRegistry_1.$sv)('statusBarItem.remoteHoverForeground', {
        dark: exports.$$_,
        light: exports.$$_,
        hcDark: exports.$$_,
        hcLight: exports.$$_
    }, (0, nls_1.localize)(91, null));
    exports.$Bab = (0, colorRegistry_1.$sv)('statusBarItem.remoteHoverBackground', {
        dark: exports.$0_,
        light: exports.$0_,
        hcDark: exports.$0_,
        hcLight: null
    }, (0, nls_1.localize)(92, null));
    exports.$Cab = (0, colorRegistry_1.$sv)('statusBarItem.offlineBackground', {
        dark: '#6c1717',
        light: '#6c1717',
        hcDark: '#6c1717',
        hcLight: '#6c1717'
    }, (0, nls_1.localize)(93, null));
    exports.$Dab = (0, colorRegistry_1.$sv)('statusBarItem.offlineForeground', {
        dark: exports.$zab,
        light: exports.$zab,
        hcDark: exports.$zab,
        hcLight: exports.$zab
    }, (0, nls_1.localize)(94, null));
    exports.$Eab = (0, colorRegistry_1.$sv)('statusBarItem.offlineHoverForeground', {
        dark: exports.$$_,
        light: exports.$$_,
        hcDark: exports.$$_,
        hcLight: exports.$$_
    }, (0, nls_1.localize)(95, null));
    exports.$Fab = (0, colorRegistry_1.$sv)('statusBarItem.offlineHoverBackground', {
        dark: exports.$0_,
        light: exports.$0_,
        hcDark: exports.$0_,
        hcLight: null
    }, (0, nls_1.localize)(96, null));
    exports.$Gab = (0, colorRegistry_1.$sv)('extensionBadge.remoteBackground', {
        dark: exports.$uab,
        light: exports.$uab,
        hcDark: exports.$uab,
        hcLight: exports.$uab
    }, (0, nls_1.localize)(97, null));
    exports.$Hab = (0, colorRegistry_1.$sv)('extensionBadge.remoteForeground', {
        dark: exports.$vab,
        light: exports.$vab,
        hcDark: exports.$vab,
        hcLight: exports.$vab
    }, (0, nls_1.localize)(98, null));
    // < --- Side Bar --- >
    exports.$Iab = (0, colorRegistry_1.$sv)('sideBar.background', {
        dark: '#252526',
        light: '#F3F3F3',
        hcDark: '#000000',
        hcLight: '#FFFFFF'
    }, (0, nls_1.localize)(99, null));
    exports.$Jab = (0, colorRegistry_1.$sv)('sideBar.foreground', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(100, null));
    exports.$Kab = (0, colorRegistry_1.$sv)('sideBar.border', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(101, null));
    exports.$Lab = (0, colorRegistry_1.$sv)('sideBarTitle.foreground', {
        dark: exports.$Jab,
        light: exports.$Jab,
        hcDark: exports.$Jab,
        hcLight: exports.$Jab
    }, (0, nls_1.localize)(102, null));
    exports.$Mab = (0, colorRegistry_1.$sv)('sideBar.dropBackground', {
        dark: exports.$F_,
        light: exports.$F_,
        hcDark: exports.$F_,
        hcLight: exports.$F_
    }, (0, nls_1.localize)(103, null));
    exports.$Nab = (0, colorRegistry_1.$sv)('sideBarSectionHeader.background', {
        dark: color_1.$Os.fromHex('#808080').transparent(0.2),
        light: color_1.$Os.fromHex('#808080').transparent(0.2),
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(104, null));
    exports.$Oab = (0, colorRegistry_1.$sv)('sideBarSectionHeader.foreground', {
        dark: exports.$Jab,
        light: exports.$Jab,
        hcDark: exports.$Jab,
        hcLight: exports.$Jab
    }, (0, nls_1.localize)(105, null));
    exports.$Pab = (0, colorRegistry_1.$sv)('sideBarSectionHeader.border', {
        dark: colorRegistry_1.$Av,
        light: colorRegistry_1.$Av,
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(106, null));
    // < --- Title Bar --- >
    exports.$Qab = (0, colorRegistry_1.$sv)('titleBar.activeForeground', {
        dark: '#CCCCCC',
        light: '#333333',
        hcDark: '#FFFFFF',
        hcLight: '#292929'
    }, (0, nls_1.localize)(107, null));
    exports.$Rab = (0, colorRegistry_1.$sv)('titleBar.inactiveForeground', {
        dark: (0, colorRegistry_1.$1y)(exports.$Qab, 0.6),
        light: (0, colorRegistry_1.$1y)(exports.$Qab, 0.6),
        hcDark: null,
        hcLight: '#292929'
    }, (0, nls_1.localize)(108, null));
    exports.$Sab = (0, colorRegistry_1.$sv)('titleBar.activeBackground', {
        dark: '#3C3C3C',
        light: '#DDDDDD',
        hcDark: '#000000',
        hcLight: '#FFFFFF'
    }, (0, nls_1.localize)(109, null));
    exports.$Tab = (0, colorRegistry_1.$sv)('titleBar.inactiveBackground', {
        dark: (0, colorRegistry_1.$1y)(exports.$Sab, 0.6),
        light: (0, colorRegistry_1.$1y)(exports.$Sab, 0.6),
        hcDark: null,
        hcLight: null,
    }, (0, nls_1.localize)(110, null));
    exports.$Uab = (0, colorRegistry_1.$sv)('titleBar.border', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(111, null));
    // < --- Menubar --- >
    exports.$Vab = (0, colorRegistry_1.$sv)('menubar.selectionForeground', {
        dark: exports.$Qab,
        light: exports.$Qab,
        hcDark: exports.$Qab,
        hcLight: exports.$Qab,
    }, (0, nls_1.localize)(112, null));
    exports.$Wab = (0, colorRegistry_1.$sv)('menubar.selectionBackground', {
        dark: colorRegistry_1.$dy,
        light: colorRegistry_1.$dy,
        hcDark: null,
        hcLight: null,
    }, (0, nls_1.localize)(113, null));
    exports.$Xab = (0, colorRegistry_1.$sv)('menubar.selectionBorder', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.$Bv,
        hcLight: colorRegistry_1.$Bv,
    }, (0, nls_1.localize)(114, null));
    // < --- Command Center --- >
    // foreground (inactive and active)
    exports.$Yab = (0, colorRegistry_1.$sv)('commandCenter.foreground', { dark: exports.$Qab, hcDark: exports.$Qab, light: exports.$Qab, hcLight: exports.$Qab }, (0, nls_1.localize)(115, null), false);
    exports.$Zab = (0, colorRegistry_1.$sv)('commandCenter.activeForeground', { dark: exports.$Vab, hcDark: exports.$Vab, light: exports.$Vab, hcLight: exports.$Vab }, (0, nls_1.localize)(116, null), false);
    exports.$1ab = (0, colorRegistry_1.$sv)('commandCenter.inactiveForeground', { dark: exports.$Rab, hcDark: exports.$Rab, light: exports.$Rab, hcLight: exports.$Rab }, (0, nls_1.localize)(117, null), false);
    // background (inactive and active)
    exports.$2ab = (0, colorRegistry_1.$sv)('commandCenter.background', { dark: color_1.$Os.white.transparent(0.05), hcDark: null, light: color_1.$Os.black.transparent(0.05), hcLight: null }, (0, nls_1.localize)(118, null), false);
    exports.$3ab = (0, colorRegistry_1.$sv)('commandCenter.activeBackground', { dark: color_1.$Os.white.transparent(0.08), hcDark: exports.$Wab, light: color_1.$Os.black.transparent(0.08), hcLight: exports.$Wab }, (0, nls_1.localize)(119, null), false);
    // border: active and inactive. defaults to active background
    exports.$4ab = (0, colorRegistry_1.$sv)('commandCenter.border', { dark: (0, colorRegistry_1.$1y)(exports.$Qab, .20), hcDark: (0, colorRegistry_1.$1y)(exports.$Qab, .60), light: (0, colorRegistry_1.$1y)(exports.$Qab, .20), hcLight: (0, colorRegistry_1.$1y)(exports.$Qab, .60) }, (0, nls_1.localize)(120, null), false);
    exports.$5ab = (0, colorRegistry_1.$sv)('commandCenter.activeBorder', { dark: (0, colorRegistry_1.$1y)(exports.$Qab, .30), hcDark: exports.$Qab, light: (0, colorRegistry_1.$1y)(exports.$Qab, .30), hcLight: exports.$Qab }, (0, nls_1.localize)(121, null), false);
    // border: defaults to active background
    exports.$6ab = (0, colorRegistry_1.$sv)('commandCenter.inactiveBorder', { dark: (0, colorRegistry_1.$1y)(exports.$Rab, .25), hcDark: (0, colorRegistry_1.$1y)(exports.$Rab, .25), light: (0, colorRegistry_1.$1y)(exports.$Rab, .25), hcLight: (0, colorRegistry_1.$1y)(exports.$Rab, .25) }, (0, nls_1.localize)(122, null), false);
    // < --- Notifications --- >
    exports.$7ab = (0, colorRegistry_1.$sv)('notificationCenter.border', {
        dark: colorRegistry_1.$Lv,
        light: colorRegistry_1.$Lv,
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(123, null));
    exports.$8ab = (0, colorRegistry_1.$sv)('notificationToast.border', {
        dark: colorRegistry_1.$Lv,
        light: colorRegistry_1.$Lv,
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(124, null));
    exports.$9ab = (0, colorRegistry_1.$sv)('notifications.foreground', {
        dark: colorRegistry_1.$Bw,
        light: colorRegistry_1.$Bw,
        hcDark: colorRegistry_1.$Bw,
        hcLight: colorRegistry_1.$Bw
    }, (0, nls_1.localize)(125, null));
    exports.$0ab = (0, colorRegistry_1.$sv)('notifications.background', {
        dark: colorRegistry_1.$Aw,
        light: colorRegistry_1.$Aw,
        hcDark: colorRegistry_1.$Aw,
        hcLight: colorRegistry_1.$Aw
    }, (0, nls_1.localize)(126, null));
    exports.$$ab = (0, colorRegistry_1.$sv)('notificationLink.foreground', {
        dark: colorRegistry_1.$Ev,
        light: colorRegistry_1.$Ev,
        hcDark: colorRegistry_1.$Ev,
        hcLight: colorRegistry_1.$Ev
    }, (0, nls_1.localize)(127, null));
    exports.$_ab = (0, colorRegistry_1.$sv)('notificationCenterHeader.foreground', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(128, null));
    exports.$abb = (0, colorRegistry_1.$sv)('notificationCenterHeader.background', {
        dark: (0, colorRegistry_1.$Zy)(exports.$0ab, 0.3),
        light: (0, colorRegistry_1.$Yy)(exports.$0ab, 0.05),
        hcDark: exports.$0ab,
        hcLight: exports.$0ab
    }, (0, nls_1.localize)(129, null));
    exports.$bbb = (0, colorRegistry_1.$sv)('notifications.border', {
        dark: exports.$abb,
        light: exports.$abb,
        hcDark: exports.$abb,
        hcLight: exports.$abb
    }, (0, nls_1.localize)(130, null));
    exports.$cbb = (0, colorRegistry_1.$sv)('notificationsErrorIcon.foreground', {
        dark: colorRegistry_1.$lw,
        light: colorRegistry_1.$lw,
        hcDark: colorRegistry_1.$lw,
        hcLight: colorRegistry_1.$lw
    }, (0, nls_1.localize)(131, null));
    exports.$dbb = (0, colorRegistry_1.$sv)('notificationsWarningIcon.foreground', {
        dark: colorRegistry_1.$ow,
        light: colorRegistry_1.$ow,
        hcDark: colorRegistry_1.$ow,
        hcLight: colorRegistry_1.$ow
    }, (0, nls_1.localize)(132, null));
    exports.$ebb = (0, colorRegistry_1.$sv)('notificationsInfoIcon.foreground', {
        dark: colorRegistry_1.$rw,
        light: colorRegistry_1.$rw,
        hcDark: colorRegistry_1.$rw,
        hcLight: colorRegistry_1.$rw
    }, (0, nls_1.localize)(133, null));
    exports.$fbb = (0, colorRegistry_1.$sv)('window.activeBorder', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(134, null));
    exports.$gbb = (0, colorRegistry_1.$sv)('window.inactiveBorder', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(135, null));
});
//# sourceMappingURL=theme.js.map