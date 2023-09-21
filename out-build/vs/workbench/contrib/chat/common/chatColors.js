/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/color", "vs/nls!vs/workbench/contrib/chat/common/chatColors", "vs/platform/theme/common/colorRegistry"], function (require, exports, color_1, nls_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$XIb = exports.$WIb = exports.$VIb = void 0;
    exports.$VIb = (0, colorRegistry_1.$sv)('chat.requestBorder', { dark: new color_1.$Os(new color_1.$Ls(255, 255, 255, 0.10)), light: new color_1.$Os(new color_1.$Ls(0, 0, 0, 0.10)), hcDark: null, hcLight: null, }, (0, nls_1.localize)(0, null));
    exports.$WIb = (0, colorRegistry_1.$sv)('chat.slashCommandBackground', { dark: colorRegistry_1.$dw, light: colorRegistry_1.$dw, hcDark: color_1.$Os.white, hcLight: colorRegistry_1.$dw }, (0, nls_1.localize)(1, null));
    exports.$XIb = (0, colorRegistry_1.$sv)('chat.slashCommandForeground', { dark: colorRegistry_1.$ew, light: colorRegistry_1.$ew, hcDark: color_1.$Os.black, hcLight: colorRegistry_1.$ew }, (0, nls_1.localize)(2, null));
});
//# sourceMappingURL=chatColors.js.map