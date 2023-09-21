/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1S = void 0;
    /**
     * The Electron `Protocol` leverages Electron style IPC communication (`ipcRenderer`, `ipcMain`)
     * for the implementation of the `IMessagePassingProtocol`. That style of API requires a channel
     * name for sending data.
     */
    class $1S {
        constructor(a, onMessage) {
            this.a = a;
            this.onMessage = onMessage;
        }
        send(message) {
            try {
                this.a.send('vscode:message', message.buffer);
            }
            catch (e) {
                // systems are going down
            }
        }
        disconnect() {
            this.a.send('vscode:disconnect', null);
        }
    }
    exports.$1S = $1S;
});
//# sourceMappingURL=ipc.electron.js.map