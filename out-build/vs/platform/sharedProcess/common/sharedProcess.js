/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$y6b = exports.$x6b = exports.$w6b = void 0;
    exports.$w6b = {
        exit: 'vscode:electron-main->shared-process=exit',
        ipcReady: 'vscode:shared-process->electron-main=ipc-ready',
        initDone: 'vscode:shared-process->electron-main=init-done'
    };
    exports.$x6b = {
        request: 'vscode:createSharedProcessChannelConnection',
        response: 'vscode:createSharedProcessChannelConnectionResult'
    };
    exports.$y6b = {
        request: 'vscode:createSharedProcessRawConnection',
        response: 'vscode:createSharedProcessRawConnectionResult'
    };
});
//# sourceMappingURL=sharedProcess.js.map