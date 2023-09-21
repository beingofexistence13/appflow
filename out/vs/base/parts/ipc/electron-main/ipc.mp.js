/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/ipc/electron-main/ipcMain", "vs/base/common/event", "vs/base/common/uuid", "vs/base/parts/ipc/common/ipc.mp"], function (require, exports, ipcMain_1, event_1, uuid_1, ipc_mp_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.connect = exports.Client = void 0;
    /**
     * An implementation of a `IPCClient` on top of Electron `MessagePortMain`.
     */
    class Client extends ipc_mp_1.Client {
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
    exports.Client = Client;
    /**
     * This method opens a message channel connection
     * in the target window. The target window needs
     * to use the `Server` from `electron-sandbox/ipc.mp`.
     */
    async function connect(window) {
        // Assert healthy window to talk to
        if (window.isDestroyed() || window.webContents.isDestroyed()) {
            throw new Error('ipc.mp#connect: Cannot talk to window because it is closed or destroyed');
        }
        // Ask to create message channel inside the window
        // and send over a UUID to correlate the response
        const nonce = (0, uuid_1.generateUuid)();
        window.webContents.send('vscode:createMessageChannel', nonce);
        // Wait until the window has returned the `MessagePort`
        // We need to filter by the `nonce` to ensure we listen
        // to the right response.
        const onMessageChannelResult = event_1.Event.fromNodeEventEmitter(ipcMain_1.validatedIpcMain, 'vscode:createMessageChannelResult', (e, nonce) => ({ nonce, port: e.ports[0] }));
        const { port } = await event_1.Event.toPromise(event_1.Event.once(event_1.Event.filter(onMessageChannelResult, e => e.nonce === nonce)));
        return port;
    }
    exports.connect = connect;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBjLm1wLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9wYXJ0cy9pcGMvZWxlY3Ryb24tbWFpbi9pcGMubXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHOztPQUVHO0lBQ0gsTUFBYSxNQUFPLFNBQVEsZUFBaUI7UUFFNUM7Ozs7V0FJRztRQUNILFlBQVksSUFBcUIsRUFBRSxRQUFnQjtZQUNsRCxLQUFLLENBQUM7Z0JBQ0wsZ0JBQWdCLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUM7Z0JBQ3RFLG1CQUFtQixFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDO2dCQUM1RSxXQUFXLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztnQkFDakQsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ3pCLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO2FBQ3pCLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDZCxDQUFDO0tBQ0Q7SUFoQkQsd0JBZ0JDO0lBRUQ7Ozs7T0FJRztJQUNJLEtBQUssVUFBVSxPQUFPLENBQUMsTUFBcUI7UUFFbEQsbUNBQW1DO1FBQ25DLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxJQUFJLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDN0QsTUFBTSxJQUFJLEtBQUssQ0FBQyx5RUFBeUUsQ0FBQyxDQUFDO1NBQzNGO1FBRUQsa0RBQWtEO1FBQ2xELGlEQUFpRDtRQUNqRCxNQUFNLEtBQUssR0FBRyxJQUFBLG1CQUFZLEdBQUUsQ0FBQztRQUM3QixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUU5RCx1REFBdUQ7UUFDdkQsdURBQXVEO1FBQ3ZELHlCQUF5QjtRQUN6QixNQUFNLHNCQUFzQixHQUFHLGFBQUssQ0FBQyxvQkFBb0IsQ0FBMkMsMEJBQWdCLEVBQUUsbUNBQW1DLEVBQUUsQ0FBQyxDQUFlLEVBQUUsS0FBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlOLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLGFBQUssQ0FBQyxTQUFTLENBQUMsYUFBSyxDQUFDLElBQUksQ0FBQyxhQUFLLENBQUMsTUFBTSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFakgsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBbkJELDBCQW1CQyJ9