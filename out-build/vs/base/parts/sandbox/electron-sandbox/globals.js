/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform"], function (require, exports, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Q = exports.$P = exports.$O = exports.$N = exports.$M = void 0;
    exports.$M = platform_1.$g.vscode.ipcRenderer;
    exports.$N = platform_1.$g.vscode.ipcMessagePort;
    exports.$O = platform_1.$g.vscode.webFrame;
    exports.$P = platform_1.$g.vscode.process;
    exports.$Q = platform_1.$g.vscode.context;
});
//# sourceMappingURL=globals.js.map