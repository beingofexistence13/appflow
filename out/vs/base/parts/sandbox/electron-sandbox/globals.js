/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform"], function (require, exports, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.context = exports.process = exports.webFrame = exports.ipcMessagePort = exports.ipcRenderer = void 0;
    exports.ipcRenderer = platform_1.globals.vscode.ipcRenderer;
    exports.ipcMessagePort = platform_1.globals.vscode.ipcMessagePort;
    exports.webFrame = platform_1.globals.vscode.webFrame;
    exports.process = platform_1.globals.vscode.process;
    exports.context = platform_1.globals.vscode.context;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvcGFydHMvc2FuZGJveC9lbGVjdHJvbi1zYW5kYm94L2dsb2JhbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0huRixRQUFBLFdBQVcsR0FBZ0Isa0JBQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO0lBQ3RELFFBQUEsY0FBYyxHQUFtQixrQkFBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7SUFDL0QsUUFBQSxRQUFRLEdBQWEsa0JBQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO0lBQzdDLFFBQUEsT0FBTyxHQUF3QixrQkFBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDdEQsUUFBQSxPQUFPLEdBQW9CLGtCQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyJ9