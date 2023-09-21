/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/platform/window/common/window"], function (require, exports, browser_1, globals_1, window_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$v7b = exports.$u7b = exports.$t7b = void 0;
    /**
     * Apply a zoom level to the window. Also sets it in our in-memory
     * browser helper so that it can be accessed in non-electron layers.
     */
    function $t7b(zoomLevel) {
        globals_1.$O.setZoomLevel(zoomLevel);
        (0, browser_1.$1N)((0, window_1.$WD)(zoomLevel));
        (0, browser_1.$XN)(zoomLevel);
    }
    exports.$t7b = $t7b;
    function $u7b() {
        $t7b((0, browser_1.$YN)() + 1);
    }
    exports.$u7b = $u7b;
    function $v7b() {
        $t7b((0, browser_1.$YN)() - 1);
    }
    exports.$v7b = $v7b;
});
//# sourceMappingURL=window.js.map