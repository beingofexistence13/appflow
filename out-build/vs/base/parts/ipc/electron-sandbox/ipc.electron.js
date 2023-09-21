/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/common/ipc.electron", "vs/base/parts/sandbox/electron-sandbox/globals"], function (require, exports, buffer_1, event_1, ipc_1, ipc_electron_1, globals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5S = void 0;
    /**
     * An implementation of `IPCClient` on top of Electron `ipcRenderer` IPC communication
     * provided from sandbox globals (via preload script).
     */
    class $5S extends ipc_1.$gh {
        static f() {
            const onMessage = event_1.Event.fromNodeEventEmitter(globals_1.$M, 'vscode:message', (_, message) => buffer_1.$Fd.wrap(message));
            globals_1.$M.send('vscode:hello');
            return new ipc_electron_1.$1S(globals_1.$M, onMessage);
        }
        constructor(id) {
            const protocol = $5S.f();
            super(protocol, id);
            this.b = protocol;
        }
        dispose() {
            this.b.disconnect();
        }
    }
    exports.$5S = $5S;
});
//# sourceMappingURL=ipc.electron.js.map