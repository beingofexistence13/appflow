/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SharedProcessRawConnection = exports.SharedProcessChannelConnection = exports.SharedProcessLifecycle = void 0;
    exports.SharedProcessLifecycle = {
        exit: 'vscode:electron-main->shared-process=exit',
        ipcReady: 'vscode:shared-process->electron-main=ipc-ready',
        initDone: 'vscode:shared-process->electron-main=init-done'
    };
    exports.SharedProcessChannelConnection = {
        request: 'vscode:createSharedProcessChannelConnection',
        response: 'vscode:createSharedProcessChannelConnectionResult'
    };
    exports.SharedProcessRawConnection = {
        request: 'vscode:createSharedProcessRawConnection',
        response: 'vscode:createSharedProcessRawConnectionResult'
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkUHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3NoYXJlZFByb2Nlc3MvY29tbW9uL3NoYXJlZFByb2Nlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBRW5GLFFBQUEsc0JBQXNCLEdBQUc7UUFDckMsSUFBSSxFQUFFLDJDQUEyQztRQUNqRCxRQUFRLEVBQUUsZ0RBQWdEO1FBQzFELFFBQVEsRUFBRSxnREFBZ0Q7S0FDMUQsQ0FBQztJQUVXLFFBQUEsOEJBQThCLEdBQUc7UUFDN0MsT0FBTyxFQUFFLDZDQUE2QztRQUN0RCxRQUFRLEVBQUUsbURBQW1EO0tBQzdELENBQUM7SUFFVyxRQUFBLDBCQUEwQixHQUFHO1FBQ3pDLE9BQU8sRUFBRSx5Q0FBeUM7UUFDbEQsUUFBUSxFQUFFLCtDQUErQztLQUN6RCxDQUFDIn0=