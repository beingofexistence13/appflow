/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OpenContext = exports.IWindowsMainService = void 0;
    exports.IWindowsMainService = (0, instantiation_1.createDecorator)('windowsMainService');
    var OpenContext;
    (function (OpenContext) {
        // opening when running from the command line
        OpenContext[OpenContext["CLI"] = 0] = "CLI";
        // macOS only: opening from the dock (also when opening files to a running instance from desktop)
        OpenContext[OpenContext["DOCK"] = 1] = "DOCK";
        // opening from the main application window
        OpenContext[OpenContext["MENU"] = 2] = "MENU";
        // opening from a file or folder dialog
        OpenContext[OpenContext["DIALOG"] = 3] = "DIALOG";
        // opening from the OS's UI
        OpenContext[OpenContext["DESKTOP"] = 4] = "DESKTOP";
        // opening through the API
        OpenContext[OpenContext["API"] = 5] = "API";
    })(OpenContext || (exports.OpenContext = OpenContext = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3dpbmRvd3MvZWxlY3Ryb24tbWFpbi93aW5kb3dzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVduRixRQUFBLG1CQUFtQixHQUFHLElBQUEsK0JBQWUsRUFBc0Isb0JBQW9CLENBQUMsQ0FBQztJQXFDOUYsSUFBa0IsV0FtQmpCO0lBbkJELFdBQWtCLFdBQVc7UUFFNUIsNkNBQTZDO1FBQzdDLDJDQUFHLENBQUE7UUFFSCxpR0FBaUc7UUFDakcsNkNBQUksQ0FBQTtRQUVKLDJDQUEyQztRQUMzQyw2Q0FBSSxDQUFBO1FBRUosdUNBQXVDO1FBQ3ZDLGlEQUFNLENBQUE7UUFFTiwyQkFBMkI7UUFDM0IsbURBQU8sQ0FBQTtRQUVQLDBCQUEwQjtRQUMxQiwyQ0FBRyxDQUFBO0lBQ0osQ0FBQyxFQW5CaUIsV0FBVywyQkFBWCxXQUFXLFFBbUI1QiJ9