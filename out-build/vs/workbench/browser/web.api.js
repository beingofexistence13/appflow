/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ColorScheme = exports.Menu = void 0;
    var Menu;
    (function (Menu) {
        Menu[Menu["CommandPalette"] = 0] = "CommandPalette";
        Menu[Menu["StatusBarWindowIndicatorMenu"] = 1] = "StatusBarWindowIndicatorMenu";
    })(Menu || (exports.Menu = Menu = {}));
    var ColorScheme;
    (function (ColorScheme) {
        ColorScheme["DARK"] = "dark";
        ColorScheme["LIGHT"] = "light";
        ColorScheme["HIGH_CONTRAST_LIGHT"] = "hcLight";
        ColorScheme["HIGH_CONTRAST_DARK"] = "hcDark";
    })(ColorScheme || (exports.ColorScheme = ColorScheme = {}));
});
//# sourceMappingURL=web.api.js.map