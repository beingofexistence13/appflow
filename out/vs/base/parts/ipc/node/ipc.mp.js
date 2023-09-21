/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/sandbox/node/electronTypes", "vs/base/common/buffer", "vs/base/parts/ipc/common/ipc", "vs/base/common/event", "vs/base/common/types", "vs/base/common/arrays"], function (require, exports, electronTypes_1, buffer_1, ipc_1, event_1, types_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.once = exports.Server = void 0;
    /**
     * The MessagePort `Protocol` leverages MessagePortMain style IPC communication
     * for the implementation of the `IMessagePassingProtocol`.
     */
    class Protocol {
        constructor(port) {
            this.port = port;
            this.onMessage = event_1.Event.fromNodeEventEmitter(this.port, 'message', (e) => buffer_1.VSBuffer.wrap(e.data));
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
    /**
     * An implementation of a `IPCServer` on top of MessagePort style IPC communication.
     * The clients register themselves via Electron Utility Process IPC transfer.
     */
    class Server extends ipc_1.IPCServer {
        static getOnDidClientConnect(filter) {
            (0, types_1.assertType)((0, electronTypes_1.isUtilityProcess)(process), 'Electron Utility Process');
            const onCreateMessageChannel = new event_1.Emitter();
            process.parentPort.on('message', (e) => {
                if (filter?.handledClientConnection(e)) {
                    return;
                }
                const port = (0, arrays_1.firstOrDefault)(e.ports);
                if (port) {
                    onCreateMessageChannel.fire(port);
                }
            });
            return event_1.Event.map(onCreateMessageChannel.event, port => {
                const protocol = new Protocol(port);
                const result = {
                    protocol,
                    // Not part of the standard spec, but in Electron we get a `close` event
                    // when the other side closes. We can use this to detect disconnects
                    // (https://github.com/electron/electron/blob/11-x-y/docs/api/message-port-main.md#event-close)
                    onDidClientDisconnect: event_1.Event.fromNodeEventEmitter(port, 'close')
                };
                return result;
            });
        }
        constructor(filter) {
            super(Server.getOnDidClientConnect(filter));
        }
    }
    exports.Server = Server;
    function once(port, message, callback) {
        const listener = (e) => {
            if (e.data === message) {
                port.removeListener('message', listener);
                callback();
            }
        };
        port.on('message', listener);
    }
    exports.once = once;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXBjLm1wLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9wYXJ0cy9pcGMvbm9kZS9pcGMubXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHOzs7T0FHRztJQUNILE1BQU0sUUFBUTtRQUliLFlBQW9CLElBQXFCO1lBQXJCLFNBQUksR0FBSixJQUFJLENBQWlCO1lBRmhDLGNBQVMsR0FBRyxhQUFLLENBQUMsb0JBQW9CLENBQVcsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFlLEVBQUUsRUFBRSxDQUFDLGlCQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBSTNILHNEQUFzRDtZQUN0RCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDZCxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQWlCO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRUQsVUFBVTtZQUNULElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbkIsQ0FBQztLQUNEO0lBZUQ7OztPQUdHO0lBQ0gsTUFBYSxNQUFPLFNBQVEsZUFBUztRQUU1QixNQUFNLENBQUMscUJBQXFCLENBQUMsTUFBZ0M7WUFDcEUsSUFBQSxrQkFBVSxFQUFDLElBQUEsZ0NBQWdCLEVBQUMsT0FBTyxDQUFDLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztZQUVsRSxNQUFNLHNCQUFzQixHQUFHLElBQUksZUFBTyxFQUFtQixDQUFDO1lBRTlELE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQWUsRUFBRSxFQUFFO2dCQUNwRCxJQUFJLE1BQU0sRUFBRSx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDdkMsT0FBTztpQkFDUDtnQkFFRCxNQUFNLElBQUksR0FBRyxJQUFBLHVCQUFjLEVBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNyQyxJQUFJLElBQUksRUFBRTtvQkFDVCxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2xDO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLGFBQUssQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUNyRCxNQUFNLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFcEMsTUFBTSxNQUFNLEdBQTBCO29CQUNyQyxRQUFRO29CQUNSLHdFQUF3RTtvQkFDeEUsb0VBQW9FO29CQUNwRSwrRkFBK0Y7b0JBQy9GLHFCQUFxQixFQUFFLGFBQUssQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDO2lCQUNoRSxDQUFDO2dCQUVGLE9BQU8sTUFBTSxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsWUFBWSxNQUFnQztZQUMzQyxLQUFLLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDN0MsQ0FBQztLQUNEO0lBcENELHdCQW9DQztJQU9ELFNBQWdCLElBQUksQ0FBQyxJQUE4QixFQUFFLE9BQWdCLEVBQUUsUUFBb0I7UUFDMUYsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFlLEVBQUUsRUFBRTtZQUNwQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFO2dCQUN2QixJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDekMsUUFBUSxFQUFFLENBQUM7YUFDWDtRQUNGLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFURCxvQkFTQyJ9