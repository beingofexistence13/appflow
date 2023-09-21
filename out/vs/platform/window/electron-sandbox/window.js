/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/platform/window/common/window"], function (require, exports, browser_1, globals_1, window_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.zoomOut = exports.zoomIn = exports.applyZoom = void 0;
    /**
     * Apply a zoom level to the window. Also sets it in our in-memory
     * browser helper so that it can be accessed in non-electron layers.
     */
    function applyZoom(zoomLevel) {
        globals_1.webFrame.setZoomLevel(zoomLevel);
        (0, browser_1.setZoomFactor)((0, window_1.zoomLevelToZoomFactor)(zoomLevel));
        (0, browser_1.setZoomLevel)(zoomLevel);
    }
    exports.applyZoom = applyZoom;
    function zoomIn() {
        applyZoom((0, browser_1.getZoomLevel)() + 1);
    }
    exports.zoomIn = zoomIn;
    function zoomOut() {
        applyZoom((0, browser_1.getZoomLevel)() - 1);
    }
    exports.zoomOut = zoomOut;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd2luZG93L2VsZWN0cm9uLXNhbmRib3gvd2luZG93LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRzs7O09BR0c7SUFDSCxTQUFnQixTQUFTLENBQUMsU0FBaUI7UUFDMUMsa0JBQVEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakMsSUFBQSx1QkFBYSxFQUFDLElBQUEsOEJBQXFCLEVBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNoRCxJQUFBLHNCQUFZLEVBQUMsU0FBUyxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUpELDhCQUlDO0lBRUQsU0FBZ0IsTUFBTTtRQUNyQixTQUFTLENBQUMsSUFBQSxzQkFBWSxHQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUZELHdCQUVDO0lBRUQsU0FBZ0IsT0FBTztRQUN0QixTQUFTLENBQUMsSUFBQSxzQkFBWSxHQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUZELDBCQUVDIn0=