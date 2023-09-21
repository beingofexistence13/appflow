/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/theme/common/colorRegistry", "vs/nls!vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedColors"], function (require, exports, colorRegistry_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$IYb = exports.$HYb = exports.$GYb = exports.$FYb = exports.$EYb = exports.$DYb = exports.$CYb = void 0;
    // Seprate from main module to break dependency cycles between welcomePage and gettingStarted.
    exports.$CYb = (0, colorRegistry_1.$sv)('welcomePage.background', { light: null, dark: null, hcDark: null, hcLight: null }, (0, nls_1.localize)(0, null));
    exports.$DYb = (0, colorRegistry_1.$sv)('welcomePage.tileBackground', { dark: colorRegistry_1.$Aw, light: colorRegistry_1.$Aw, hcDark: '#000', hcLight: colorRegistry_1.$Aw }, (0, nls_1.localize)(1, null));
    exports.$EYb = (0, colorRegistry_1.$sv)('welcomePage.tileHoverBackground', { dark: (0, colorRegistry_1.$Zy)(colorRegistry_1.$Aw, .2), light: (0, colorRegistry_1.$Yy)(colorRegistry_1.$Aw, .1), hcDark: null, hcLight: null }, (0, nls_1.localize)(2, null));
    exports.$FYb = (0, colorRegistry_1.$sv)('welcomePage.tileBorder', { dark: '#ffffff1a', light: '#0000001a', hcDark: colorRegistry_1.$Av, hcLight: colorRegistry_1.$Av }, (0, nls_1.localize)(3, null));
    exports.$GYb = (0, colorRegistry_1.$sv)('welcomePage.progress.background', { light: colorRegistry_1.$Mv, dark: colorRegistry_1.$Mv, hcDark: colorRegistry_1.$Mv, hcLight: colorRegistry_1.$Mv }, (0, nls_1.localize)(4, null));
    exports.$HYb = (0, colorRegistry_1.$sv)('welcomePage.progress.foreground', { light: colorRegistry_1.$Ev, dark: colorRegistry_1.$Ev, hcDark: colorRegistry_1.$Ev, hcLight: colorRegistry_1.$Ev }, (0, nls_1.localize)(5, null));
    exports.$IYb = (0, colorRegistry_1.$sv)('walkthrough.stepTitle.foreground', { light: '#000000', dark: '#ffffff', hcDark: null, hcLight: null }, (0, nls_1.localize)(6, null));
});
//# sourceMappingURL=gettingStartedColors.js.map