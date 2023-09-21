/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/color", "vs/nls!vs/workbench/contrib/testing/browser/theme", "vs/platform/theme/common/colorRegistry"], function (require, exports, color_1, nls_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$XJb = exports.$WJb = exports.$VJb = exports.$UJb = exports.$TJb = exports.$SJb = exports.$RJb = exports.$QJb = exports.$PJb = exports.$OJb = exports.$NJb = void 0;
    exports.$NJb = (0, colorRegistry_1.$sv)('testing.iconFailed', {
        dark: '#f14c4c',
        light: '#f14c4c',
        hcDark: '#f14c4c',
        hcLight: '#B5200D'
    }, (0, nls_1.localize)(0, null));
    exports.$OJb = (0, colorRegistry_1.$sv)('testing.iconErrored', {
        dark: '#f14c4c',
        light: '#f14c4c',
        hcDark: '#f14c4c',
        hcLight: '#B5200D'
    }, (0, nls_1.localize)(1, null));
    exports.$PJb = (0, colorRegistry_1.$sv)('testing.iconPassed', {
        dark: '#73c991',
        light: '#73c991',
        hcDark: '#73c991',
        hcLight: '#007100'
    }, (0, nls_1.localize)(2, null));
    exports.$QJb = (0, colorRegistry_1.$sv)('testing.runAction', {
        dark: exports.$PJb,
        light: exports.$PJb,
        hcDark: exports.$PJb,
        hcLight: exports.$PJb
    }, (0, nls_1.localize)(3, null));
    exports.$RJb = (0, colorRegistry_1.$sv)('testing.iconQueued', {
        dark: '#cca700',
        light: '#cca700',
        hcDark: '#cca700',
        hcLight: '#cca700'
    }, (0, nls_1.localize)(4, null));
    exports.$SJb = (0, colorRegistry_1.$sv)('testing.iconUnset', {
        dark: '#848484',
        light: '#848484',
        hcDark: '#848484',
        hcLight: '#848484'
    }, (0, nls_1.localize)(5, null));
    exports.$TJb = (0, colorRegistry_1.$sv)('testing.iconSkipped', {
        dark: '#848484',
        light: '#848484',
        hcDark: '#848484',
        hcLight: '#848484'
    }, (0, nls_1.localize)(6, null));
    exports.$UJb = (0, colorRegistry_1.$sv)('testing.peekBorder', {
        dark: colorRegistry_1.$lw,
        light: colorRegistry_1.$lw,
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av
    }, (0, nls_1.localize)(7, null));
    exports.$VJb = (0, colorRegistry_1.$sv)('testing.peekHeaderBackground', {
        dark: (0, colorRegistry_1.$1y)(colorRegistry_1.$lw, 0.1),
        light: (0, colorRegistry_1.$1y)(colorRegistry_1.$lw, 0.1),
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(8, null));
    exports.$WJb = {
        [0 /* TestMessageType.Error */]: {
            decorationForeground: (0, colorRegistry_1.$sv)('testing.message.error.decorationForeground', { dark: colorRegistry_1.$lw, light: colorRegistry_1.$lw, hcDark: colorRegistry_1.$xw, hcLight: colorRegistry_1.$xw }, (0, nls_1.localize)(9, null)),
            marginBackground: (0, colorRegistry_1.$sv)('testing.message.error.lineBackground', { dark: new color_1.$Os(new color_1.$Ls(255, 0, 0, 0.2)), light: new color_1.$Os(new color_1.$Ls(255, 0, 0, 0.2)), hcDark: null, hcLight: null }, (0, nls_1.localize)(10, null)),
        },
        [1 /* TestMessageType.Output */]: {
            decorationForeground: (0, colorRegistry_1.$sv)('testing.message.info.decorationForeground', { dark: (0, colorRegistry_1.$1y)(colorRegistry_1.$xw, 0.5), light: (0, colorRegistry_1.$1y)(colorRegistry_1.$xw, 0.5), hcDark: (0, colorRegistry_1.$1y)(colorRegistry_1.$xw, 0.5), hcLight: (0, colorRegistry_1.$1y)(colorRegistry_1.$xw, 0.5) }, (0, nls_1.localize)(11, null)),
            marginBackground: (0, colorRegistry_1.$sv)('testing.message.info.lineBackground', { dark: null, light: null, hcDark: null, hcLight: null }, (0, nls_1.localize)(12, null)),
        },
    };
    exports.$XJb = {
        [6 /* TestResultState.Errored */]: exports.$OJb,
        [4 /* TestResultState.Failed */]: exports.$NJb,
        [3 /* TestResultState.Passed */]: exports.$PJb,
        [1 /* TestResultState.Queued */]: exports.$RJb,
        [0 /* TestResultState.Unset */]: exports.$SJb,
        [5 /* TestResultState.Skipped */]: exports.$TJb,
    };
});
//# sourceMappingURL=theme.js.map