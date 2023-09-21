/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "net", "vs/base/parts/ipc/node/ipc.net", "vs/platform/remote/common/managedSocket"], function (require, exports, net, ipc_net_1, managedSocket_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$m8b = void 0;
    exports.$m8b = new class {
        supports(connectTo) {
            return true;
        }
        connect({ host, port }, path, query, debugLabel) {
            return new Promise((resolve, reject) => {
                const socket = net.createConnection({ host: host, port: port }, () => {
                    socket.removeListener('error', reject);
                    socket.write((0, managedSocket_1.$zkb)(path, query, debugLabel));
                    const onData = (data) => {
                        const strData = data.toString();
                        if (strData.indexOf('\r\n\r\n') >= 0) {
                            // headers received OK
                            socket.off('data', onData);
                            resolve(new ipc_net_1.$qh(socket, debugLabel));
                        }
                    };
                    socket.on('data', onData);
                });
                // Disable Nagle's algorithm.
                socket.setNoDelay(true);
                socket.once('error', reject);
            });
        }
    };
});
//# sourceMappingURL=nodeSocketFactory.js.map