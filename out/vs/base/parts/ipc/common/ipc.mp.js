/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/base/parts/ipc/common/ipc"], function (require, exports, buffer_1, event_1, ipc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Client = exports.Protocol = void 0;
    /**
     * The MessagePort `Protocol` leverages MessagePort style IPC communication
     * for the implementation of the `IMessagePassingProtocol`. That style of API
     * is a simple `onmessage` / `postMessage` pattern.
     */
    class Protocol {
        constructor(port) {
            this.port = port;
            this.onMessage = event_1.Event.fromDOMEventEmitter(this.port, 'message', (e) => buffer_1.VSBuffer.wrap(e.data));
            // we must call start() to ensure messages are flowing
            port.start();
        }
        send(message) {
            this.port.postMessage(message.buffer);
        }
        disconnect() {
            this.port.close();
        }
    }
    exports.Protocol = Protocol;
    /**
     * An implementation of a `IPCClient` on top of MessagePort style IPC communication.
     */
    class Client extends ipc_1.IPCClient {
        constructor(port, clientId) {
            const protocol = new Protocol(port);
            super(protocol, clientId);
            this.protocol = protocol;
        }
        dispose() {
            this.protocol.disconnect();
            super.dispose();
        }
    }
    exports.Client = Client;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBjLm1wLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9wYXJ0cy9pcGMvY29tbW9uL2lwYy5tcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFpQ2hHOzs7O09BSUc7SUFDSCxNQUFhLFFBQVE7UUFJcEIsWUFBb0IsSUFBaUI7WUFBakIsU0FBSSxHQUFKLElBQUksQ0FBYTtZQUY1QixjQUFTLEdBQUcsYUFBSyxDQUFDLG1CQUFtQixDQUFXLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBZSxFQUFFLEVBQUUsQ0FBQyxpQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUkxSCxzREFBc0Q7WUFDdEQsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2QsQ0FBQztRQUVELElBQUksQ0FBQyxPQUFpQjtZQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUVELFVBQVU7WUFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ25CLENBQUM7S0FDRDtJQWpCRCw0QkFpQkM7SUFFRDs7T0FFRztJQUNILE1BQWEsTUFBTyxTQUFRLGVBQVM7UUFJcEMsWUFBWSxJQUFpQixFQUFFLFFBQWdCO1lBQzlDLE1BQU0sUUFBUSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BDLEtBQUssQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDMUIsQ0FBQztRQUVRLE9BQU87WUFDZixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBRTNCLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNqQixDQUFDO0tBQ0Q7SUFoQkQsd0JBZ0JDIn0=