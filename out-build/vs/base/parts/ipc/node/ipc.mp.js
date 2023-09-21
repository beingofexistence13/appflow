/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/sandbox/node/electronTypes", "vs/base/common/buffer", "vs/base/parts/ipc/common/ipc", "vs/base/common/event", "vs/base/common/types", "vs/base/common/arrays"], function (require, exports, electronTypes_1, buffer_1, ipc_1, event_1, types_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9S = exports.$8S = void 0;
    /**
     * The MessagePort `Protocol` leverages MessagePortMain style IPC communication
     * for the implementation of the `IMessagePassingProtocol`.
     */
    class Protocol {
        constructor(a) {
            this.a = a;
            this.onMessage = event_1.Event.fromNodeEventEmitter(this.a, 'message', (e) => buffer_1.$Fd.wrap(e.data));
            // we must call start() to ensure messages are flowing
            a.start();
        }
        send(message) {
            this.a.postMessage(message.buffer);
        }
        disconnect() {
            this.a.close();
        }
    }
    /**
     * An implementation of a `IPCServer` on top of MessagePort style IPC communication.
     * The clients register themselves via Electron Utility Process IPC transfer.
     */
    class $8S extends ipc_1.$fh {
        static b(filter) {
            (0, types_1.$tf)((0, electronTypes_1.$7S)(process), 'Electron Utility Process');
            const onCreateMessageChannel = new event_1.$fd();
            process.parentPort.on('message', (e) => {
                if (filter?.handledClientConnection(e)) {
                    return;
                }
                const port = (0, arrays_1.$Mb)(e.ports);
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
            super($8S.b(filter));
        }
    }
    exports.$8S = $8S;
    function $9S(port, message, callback) {
        const listener = (e) => {
            if (e.data === message) {
                port.removeListener('message', listener);
                callback();
            }
        };
        port.on('message', listener);
    }
    exports.$9S = $9S;
});
//# sourceMappingURL=ipc.mp.js.map