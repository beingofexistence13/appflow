/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/ipc/electron-main/ipcMain", "vs/base/common/event", "vs/base/common/uuid", "vs/base/parts/ipc/common/ipc.mp"], function (require, exports, ipcMain_1, event_1, uuid_1, ipc_mp_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4S = exports.$3S = void 0;
    /**
     * An implementation of a `IPCClient` on top of Electron `MessagePortMain`.
     */
    class $3S extends ipc_mp_1.$YS {
        /**
         * @param clientId a way to uniquely identify this client among
         * other clients. this is important for routing because every
         * client can also be a server
         */
        constructor(port, clientId) {
            super({
                addEventListener: (type, listener) => port.addListener(type, listener),
                removeEventListener: (type, listener) => port.removeListener(type, listener),
                postMessage: message => port.postMessage(message),
                start: () => port.start(),
                close: () => port.close()
            }, clientId);
        }
    }
    exports.$3S = $3S;
    /**
     * This method opens a message channel connection
     * in the target window. The target window needs
     * to use the `Server` from `electron-sandbox/ipc.mp`.
     */
    async function $4S(window) {
        // Assert healthy window to talk to
        if (window.isDestroyed() || window.webContents.isDestroyed()) {
            throw new Error('ipc.mp#connect: Cannot talk to window because it is closed or destroyed');
        }
        // Ask to create message channel inside the window
        // and send over a UUID to correlate the response
        const nonce = (0, uuid_1.$4f)();
        window.webContents.send('vscode:createMessageChannel', nonce);
        // Wait until the window has returned the `MessagePort`
        // We need to filter by the `nonce` to ensure we listen
        // to the right response.
        const onMessageChannelResult = event_1.Event.fromNodeEventEmitter(ipcMain_1.$US, 'vscode:createMessageChannelResult', (e, nonce) => ({ nonce, port: e.ports[0] }));
        const { port } = await event_1.Event.toPromise(event_1.Event.once(event_1.Event.filter(onMessageChannelResult, e => e.nonce === nonce)));
        return port;
    }
    exports.$4S = $4S;
});
//# sourceMappingURL=ipc.mp.js.map