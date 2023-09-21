/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/ipc/electron-main/ipcMain", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/common/ipc.electron"], function (require, exports, ipcMain_1, buffer_1, event_1, lifecycle_1, ipc_1, ipc_electron_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2S = void 0;
    function createScopedOnMessageEvent(senderId, eventName) {
        const onMessage = event_1.Event.fromNodeEventEmitter(ipcMain_1.$US, eventName, (event, message) => ({ event, message }));
        const onMessageFromSender = event_1.Event.filter(onMessage, ({ event }) => event.sender.id === senderId);
        return event_1.Event.map(onMessageFromSender, ({ message }) => message ? buffer_1.$Fd.wrap(message) : message);
    }
    /**
     * An implementation of `IPCServer` on top of Electron `ipcMain` API.
     */
    class $2S extends ipc_1.$fh {
        static { this.b = new Map(); }
        static d() {
            const onHello = event_1.Event.fromNodeEventEmitter(ipcMain_1.$US, 'vscode:hello', ({ sender }) => sender);
            return event_1.Event.map(onHello, webContents => {
                const id = webContents.id;
                const client = $2S.b.get(id);
                client?.dispose();
                const onDidClientReconnect = new event_1.$fd();
                $2S.b.set(id, (0, lifecycle_1.$ic)(() => onDidClientReconnect.fire()));
                const onMessage = createScopedOnMessageEvent(id, 'vscode:message');
                const onDidClientDisconnect = event_1.Event.any(event_1.Event.signal(createScopedOnMessageEvent(id, 'vscode:disconnect')), onDidClientReconnect.event);
                const protocol = new ipc_electron_1.$1S(webContents, onMessage);
                return { protocol, onDidClientDisconnect };
            });
        }
        constructor() {
            super($2S.d());
        }
    }
    exports.$2S = $2S;
});
//# sourceMappingURL=ipc.electron.js.map