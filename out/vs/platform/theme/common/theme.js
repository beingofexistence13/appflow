/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isDark = exports.isHighContrast = exports.ColorScheme = void 0;
    /**
     * Color scheme used by the OS and by color themes.
     */
    var ColorScheme;
    (function (ColorScheme) {
        ColorScheme["DARK"] = "dark";
        ColorScheme["LIGHT"] = "light";
        ColorScheme["HIGH_CONTRAST_DARK"] = "hcDark";
        ColorScheme["HIGH_CONTRAST_LIGHT"] = "hcLight";
    })(ColorScheme || (exports.ColorScheme = ColorScheme = {}));
    function isHighContrast(scheme) {
        return scheme === ColorScheme.HIGH_CONTRAST_DARK || scheme === ColorScheme.HIGH_CONTRAST_LIGHT;
    }
    exports.isHighContrast = isHighContrast;
    function isDark(scheme) {
        return scheme === ColorScheme.DARK || scheme === ColorScheme.HIGH_CONTRAST_DARK;
    }
    exports.isDark = isDark;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90aGVtZS9jb21tb24vdGhlbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBRWhHOztPQUVHO0lBQ0gsSUFBWSxXQUtYO0lBTEQsV0FBWSxXQUFXO1FBQ3RCLDRCQUFhLENBQUE7UUFDYiw4QkFBZSxDQUFBO1FBQ2YsNENBQTZCLENBQUE7UUFDN0IsOENBQStCLENBQUE7SUFDaEMsQ0FBQyxFQUxXLFdBQVcsMkJBQVgsV0FBVyxRQUt0QjtJQUVELFNBQWdCLGNBQWMsQ0FBQyxNQUFtQjtRQUNqRCxPQUFPLE1BQU0sS0FBSyxXQUFXLENBQUMsa0JBQWtCLElBQUksTUFBTSxLQUFLLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQztJQUNoRyxDQUFDO0lBRkQsd0NBRUM7SUFFRCxTQUFnQixNQUFNLENBQUMsTUFBbUI7UUFDekMsT0FBTyxNQUFNLEtBQUssV0FBVyxDQUFDLElBQUksSUFBSSxNQUFNLEtBQUssV0FBVyxDQUFDLGtCQUFrQixDQUFDO0lBQ2pGLENBQUM7SUFGRCx3QkFFQyJ9