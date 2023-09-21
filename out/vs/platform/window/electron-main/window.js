/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WindowError = exports.WindowMode = exports.defaultWindowState = exports.UnloadReason = exports.LoadReason = void 0;
    var LoadReason;
    (function (LoadReason) {
        /**
         * The window is loaded for the first time.
         */
        LoadReason[LoadReason["INITIAL"] = 1] = "INITIAL";
        /**
         * The window is loaded into a different workspace context.
         */
        LoadReason[LoadReason["LOAD"] = 2] = "LOAD";
        /**
         * The window is reloaded.
         */
        LoadReason[LoadReason["RELOAD"] = 3] = "RELOAD";
    })(LoadReason || (exports.LoadReason = LoadReason = {}));
    var UnloadReason;
    (function (UnloadReason) {
        /**
         * The window is closed.
         */
        UnloadReason[UnloadReason["CLOSE"] = 1] = "CLOSE";
        /**
         * All windows unload because the application quits.
         */
        UnloadReason[UnloadReason["QUIT"] = 2] = "QUIT";
        /**
         * The window is reloaded.
         */
        UnloadReason[UnloadReason["RELOAD"] = 3] = "RELOAD";
        /**
         * The window is loaded into a different workspace context.
         */
        UnloadReason[UnloadReason["LOAD"] = 4] = "LOAD";
    })(UnloadReason || (exports.UnloadReason = UnloadReason = {}));
    const defaultWindowState = function (mode = 1 /* WindowMode.Normal */) {
        return {
            width: 1024,
            height: 768,
            mode
        };
    };
    exports.defaultWindowState = defaultWindowState;
    var WindowMode;
    (function (WindowMode) {
        WindowMode[WindowMode["Maximized"] = 0] = "Maximized";
        WindowMode[WindowMode["Normal"] = 1] = "Normal";
        WindowMode[WindowMode["Minimized"] = 2] = "Minimized";
        WindowMode[WindowMode["Fullscreen"] = 3] = "Fullscreen";
    })(WindowMode || (exports.WindowMode = WindowMode = {}));
    var WindowError;
    (function (WindowError) {
        /**
         * Maps to the `unresponsive` event on a `BrowserWindow`.
         */
        WindowError[WindowError["UNRESPONSIVE"] = 1] = "UNRESPONSIVE";
        /**
         * Maps to the `render-process-gone` event on a `WebContents`.
         */
        WindowError[WindowError["PROCESS_GONE"] = 2] = "PROCESS_GONE";
        /**
         * Maps to the `did-fail-load` event on a `WebContents`.
         */
        WindowError[WindowError["LOAD"] = 3] = "LOAD";
    })(WindowError || (exports.WindowError = WindowError = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vd2luZG93L2VsZWN0cm9uLW1haW4vd2luZG93LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTRFaEcsSUFBa0IsVUFnQmpCO0lBaEJELFdBQWtCLFVBQVU7UUFFM0I7O1dBRUc7UUFDSCxpREFBVyxDQUFBO1FBRVg7O1dBRUc7UUFDSCwyQ0FBSSxDQUFBO1FBRUo7O1dBRUc7UUFDSCwrQ0FBTSxDQUFBO0lBQ1AsQ0FBQyxFQWhCaUIsVUFBVSwwQkFBVixVQUFVLFFBZ0IzQjtJQUVELElBQWtCLFlBcUJqQjtJQXJCRCxXQUFrQixZQUFZO1FBRTdCOztXQUVHO1FBQ0gsaURBQVMsQ0FBQTtRQUVUOztXQUVHO1FBQ0gsK0NBQUksQ0FBQTtRQUVKOztXQUVHO1FBQ0gsbURBQU0sQ0FBQTtRQUVOOztXQUVHO1FBQ0gsK0NBQUksQ0FBQTtJQUNMLENBQUMsRUFyQmlCLFlBQVksNEJBQVosWUFBWSxRQXFCN0I7SUFXTSxNQUFNLGtCQUFrQixHQUFHLFVBQVUsSUFBSSw0QkFBb0I7UUFDbkUsT0FBTztZQUNOLEtBQUssRUFBRSxJQUFJO1lBQ1gsTUFBTSxFQUFFLEdBQUc7WUFDWCxJQUFJO1NBQ0osQ0FBQztJQUNILENBQUMsQ0FBQztJQU5XLFFBQUEsa0JBQWtCLHNCQU03QjtJQUVGLElBQWtCLFVBS2pCO0lBTEQsV0FBa0IsVUFBVTtRQUMzQixxREFBUyxDQUFBO1FBQ1QsK0NBQU0sQ0FBQTtRQUNOLHFEQUFTLENBQUE7UUFDVCx1REFBVSxDQUFBO0lBQ1gsQ0FBQyxFQUxpQixVQUFVLDBCQUFWLFVBQVUsUUFLM0I7SUFPRCxJQUFrQixXQWdCakI7SUFoQkQsV0FBa0IsV0FBVztRQUU1Qjs7V0FFRztRQUNILDZEQUFnQixDQUFBO1FBRWhCOztXQUVHO1FBQ0gsNkRBQWdCLENBQUE7UUFFaEI7O1dBRUc7UUFDSCw2Q0FBUSxDQUFBO0lBQ1QsQ0FBQyxFQWhCaUIsV0FBVywyQkFBWCxXQUFXLFFBZ0I1QiJ9