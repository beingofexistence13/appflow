/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/ipc/electron-main/ipcMain", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/common/ipc.electron"], function (require, exports, ipcMain_1, buffer_1, event_1, lifecycle_1, ipc_1, ipc_electron_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Server = void 0;
    function createScopedOnMessageEvent(senderId, eventName) {
        const onMessage = event_1.Event.fromNodeEventEmitter(ipcMain_1.validatedIpcMain, eventName, (event, message) => ({ event, message }));
        const onMessageFromSender = event_1.Event.filter(onMessage, ({ event }) => event.sender.id === senderId);
        return event_1.Event.map(onMessageFromSender, ({ message }) => message ? buffer_1.VSBuffer.wrap(message) : message);
    }
    /**
     * An implementation of `IPCServer` on top of Electron `ipcMain` API.
     */
    class Server extends ipc_1.IPCServer {
        static { this.Clients = new Map(); }
        static getOnDidClientConnect() {
            const onHello = event_1.Event.fromNodeEventEmitter(ipcMain_1.validatedIpcMain, 'vscode:hello', ({ sender }) => sender);
            return event_1.Event.map(onHello, webContents => {
                const id = webContents.id;
                const client = Server.Clients.get(id);
                client?.dispose();
                const onDidClientReconnect = new event_1.Emitter();
                Server.Clients.set(id, (0, lifecycle_1.toDisposable)(() => onDidClientReconnect.fire()));
                const onMessage = createScopedOnMessageEvent(id, 'vscode:message');
                const onDidClientDisconnect = event_1.Event.any(event_1.Event.signal(createScopedOnMessageEvent(id, 'vscode:disconnect')), onDidClientReconnect.event);
                const protocol = new ipc_electron_1.Protocol(webContents, onMessage);
                return { protocol, onDidClientDisconnect };
            });
        }
        constructor() {
            super(Server.getOnDidClientConnect());
        }
    }
    exports.Server = Server;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBjLmVsZWN0cm9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9wYXJ0cy9pcGMvZWxlY3Ryb24tbWFpbi9pcGMuZWxlY3Ryb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZWhHLFNBQVMsMEJBQTBCLENBQUMsUUFBZ0IsRUFBRSxTQUFpQjtRQUN0RSxNQUFNLFNBQVMsR0FBRyxhQUFLLENBQUMsb0JBQW9CLENBQVksMEJBQWdCLEVBQUUsU0FBUyxFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0gsTUFBTSxtQkFBbUIsR0FBRyxhQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLFFBQVEsQ0FBQyxDQUFDO1FBRWpHLE9BQU8sYUFBSyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsaUJBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3BHLENBQUM7SUFFRDs7T0FFRztJQUNILE1BQWEsTUFBTyxTQUFRLGVBQVM7aUJBRVosWUFBTyxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO1FBRXpELE1BQU0sQ0FBQyxxQkFBcUI7WUFDbkMsTUFBTSxPQUFPLEdBQUcsYUFBSyxDQUFDLG9CQUFvQixDQUFjLDBCQUFnQixFQUFFLGNBQWMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRWxILE9BQU8sYUFBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLEVBQUU7Z0JBQ3ZDLE1BQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxFQUFFLENBQUM7Z0JBQzFCLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUV0QyxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUM7Z0JBRWxCLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztnQkFDakQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRXhFLE1BQU0sU0FBUyxHQUFHLDBCQUEwQixDQUFDLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBb0IsQ0FBQztnQkFDdEYsTUFBTSxxQkFBcUIsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLGFBQUssQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsRUFBRSxFQUFFLG1CQUFtQixDQUFDLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdkksTUFBTSxRQUFRLEdBQUcsSUFBSSx1QkFBZ0IsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBRTlELE9BQU8sRUFBRSxRQUFRLEVBQUUscUJBQXFCLEVBQUUsQ0FBQztZQUM1QyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRDtZQUNDLEtBQUssQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7O0lBMUJGLHdCQTJCQyJ9