/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/common/ipc.electron", "vs/base/parts/sandbox/electron-sandbox/globals"], function (require, exports, buffer_1, event_1, ipc_1, ipc_electron_1, globals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Client = void 0;
    /**
     * An implementation of `IPCClient` on top of Electron `ipcRenderer` IPC communication
     * provided from sandbox globals (via preload script).
     */
    class Client extends ipc_1.IPCClient {
        static createProtocol() {
            const onMessage = event_1.Event.fromNodeEventEmitter(globals_1.ipcRenderer, 'vscode:message', (_, message) => buffer_1.VSBuffer.wrap(message));
            globals_1.ipcRenderer.send('vscode:hello');
            return new ipc_electron_1.Protocol(globals_1.ipcRenderer, onMessage);
        }
        constructor(id) {
            const protocol = Client.createProtocol();
            super(protocol, id);
            this.protocol = protocol;
        }
        dispose() {
            this.protocol.disconnect();
        }
    }
    exports.Client = Client;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBjLmVsZWN0cm9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9wYXJ0cy9pcGMvZWxlY3Ryb24tc2FuZGJveC9pcGMuZWxlY3Ryb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHOzs7T0FHRztJQUNILE1BQWEsTUFBTyxTQUFRLGVBQVM7UUFJNUIsTUFBTSxDQUFDLGNBQWM7WUFDNUIsTUFBTSxTQUFTLEdBQUcsYUFBSyxDQUFDLG9CQUFvQixDQUFXLHFCQUFXLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxpQkFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzlILHFCQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRWpDLE9BQU8sSUFBSSx1QkFBZ0IsQ0FBQyxxQkFBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFRCxZQUFZLEVBQVU7WUFDckIsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3pDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDMUIsQ0FBQztRQUVRLE9BQU87WUFDZixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzVCLENBQUM7S0FDRDtJQXJCRCx3QkFxQkMifQ==