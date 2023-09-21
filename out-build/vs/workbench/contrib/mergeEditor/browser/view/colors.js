/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/mergeEditor/browser/view/colors", "vs/platform/theme/common/colorRegistry"], function (require, exports, nls_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ujb = exports.$Tjb = exports.$Sjb = exports.$Rjb = exports.$Qjb = exports.$Pjb = exports.$Ojb = exports.$Njb = exports.$Mjb = exports.$Ljb = exports.$Kjb = exports.$Jjb = exports.diff = void 0;
    exports.diff = (0, colorRegistry_1.$sv)('mergeEditor.change.background', { dark: '#9bb95533', light: '#9bb95533', hcDark: '#9bb95533', hcLight: '#9bb95533', }, (0, nls_1.localize)(0, null));
    exports.$Jjb = (0, colorRegistry_1.$sv)('mergeEditor.change.word.background', { dark: '#9ccc2c33', light: '#9ccc2c66', hcDark: '#9ccc2c33', hcLight: '#9ccc2c66', }, (0, nls_1.localize)(1, null));
    exports.$Kjb = (0, colorRegistry_1.$sv)('mergeEditor.changeBase.background', { dark: '#4B1818FF', light: '#FFCCCCFF', hcDark: '#4B1818FF', hcLight: '#FFCCCCFF', }, (0, nls_1.localize)(2, null));
    exports.$Ljb = (0, colorRegistry_1.$sv)('mergeEditor.changeBase.word.background', { dark: '#6F1313FF', light: '#FFA3A3FF', hcDark: '#6F1313FF', hcLight: '#FFA3A3FF', }, (0, nls_1.localize)(3, null));
    exports.$Mjb = (0, colorRegistry_1.$sv)('mergeEditor.conflict.unhandledUnfocused.border', { dark: '#ffa6007a', light: '#ffa600FF', hcDark: '#ffa6007a', hcLight: '#ffa6007a', }, (0, nls_1.localize)(4, null));
    exports.$Njb = (0, colorRegistry_1.$sv)('mergeEditor.conflict.unhandledFocused.border', { dark: '#ffa600', light: '#ffa600', hcDark: '#ffa600', hcLight: '#ffa600', }, (0, nls_1.localize)(5, null));
    exports.$Ojb = (0, colorRegistry_1.$sv)('mergeEditor.conflict.handledUnfocused.border', { dark: '#86868649', light: '#86868649', hcDark: '#86868649', hcLight: '#86868649', }, (0, nls_1.localize)(6, null));
    exports.$Pjb = (0, colorRegistry_1.$sv)('mergeEditor.conflict.handledFocused.border', { dark: '#c1c1c1cc', light: '#c1c1c1cc', hcDark: '#c1c1c1cc', hcLight: '#c1c1c1cc', }, (0, nls_1.localize)(7, null));
    exports.$Qjb = (0, colorRegistry_1.$sv)('mergeEditor.conflict.handled.minimapOverViewRuler', { dark: '#adaca8ee', light: '#adaca8ee', hcDark: '#adaca8ee', hcLight: '#adaca8ee', }, (0, nls_1.localize)(8, null));
    exports.$Rjb = (0, colorRegistry_1.$sv)('mergeEditor.conflict.unhandled.minimapOverViewRuler', { dark: '#fcba03FF', light: '#fcba03FF', hcDark: '#fcba03FF', hcLight: '#fcba03FF', }, (0, nls_1.localize)(9, null));
    exports.$Sjb = (0, colorRegistry_1.$sv)('mergeEditor.conflictingLines.background', { dark: '#ffea0047', light: '#ffea0047', hcDark: '#ffea0047', hcLight: '#ffea0047', }, (0, nls_1.localize)(10, null));
    const contentTransparency = 0.4;
    exports.$Tjb = (0, colorRegistry_1.$sv)('mergeEditor.conflict.input1.background', { dark: (0, colorRegistry_1.$1y)(colorRegistry_1.$py, contentTransparency), light: (0, colorRegistry_1.$1y)(colorRegistry_1.$py, contentTransparency), hcDark: (0, colorRegistry_1.$1y)(colorRegistry_1.$py, contentTransparency), hcLight: (0, colorRegistry_1.$1y)(colorRegistry_1.$py, contentTransparency) }, (0, nls_1.localize)(11, null));
    exports.$Ujb = (0, colorRegistry_1.$sv)('mergeEditor.conflict.input2.background', { dark: (0, colorRegistry_1.$1y)(colorRegistry_1.$ry, contentTransparency), light: (0, colorRegistry_1.$1y)(colorRegistry_1.$ry, contentTransparency), hcDark: (0, colorRegistry_1.$1y)(colorRegistry_1.$ry, contentTransparency), hcLight: (0, colorRegistry_1.$1y)(colorRegistry_1.$ry, contentTransparency) }, (0, nls_1.localize)(12, null));
});
//# sourceMappingURL=colors.js.map