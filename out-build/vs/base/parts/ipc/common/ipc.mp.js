/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/base/parts/ipc/common/ipc"], function (require, exports, buffer_1, event_1, ipc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$YS = exports.$XS = void 0;
    /**
     * The MessagePort `Protocol` leverages MessagePort style IPC communication
     * for the implementation of the `IMessagePassingProtocol`. That style of API
     * is a simple `onmessage` / `postMessage` pattern.
     */
    class $XS {
        constructor(a) {
            this.a = a;
            this.onMessage = event_1.Event.fromDOMEventEmitter(this.a, 'message', (e) => buffer_1.$Fd.wrap(e.data));
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
    exports.$XS = $XS;
    /**
     * An implementation of a `IPCClient` on top of MessagePort style IPC communication.
     */
    class $YS extends ipc_1.$gh {
        constructor(port, clientId) {
            const protocol = new $XS(port);
            super(protocol, clientId);
            this.b = protocol;
        }
        dispose() {
            this.b.disconnect();
            super.dispose();
        }
    }
    exports.$YS = $YS;
});
//# sourceMappingURL=ipc.mp.js.map