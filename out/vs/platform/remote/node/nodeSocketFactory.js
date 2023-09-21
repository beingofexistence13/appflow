/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "net", "vs/base/parts/ipc/node/ipc.net", "vs/platform/remote/common/managedSocket"], function (require, exports, net, ipc_net_1, managedSocket_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nodeSocketFactory = void 0;
    exports.nodeSocketFactory = new class {
        supports(connectTo) {
            return true;
        }
        connect({ host, port }, path, query, debugLabel) {
            return new Promise((resolve, reject) => {
                const socket = net.createConnection({ host: host, port: port }, () => {
                    socket.removeListener('error', reject);
                    socket.write((0, managedSocket_1.makeRawSocketHeaders)(path, query, debugLabel));
                    const onData = (data) => {
                        const strData = data.toString();
                        if (strData.indexOf('\r\n\r\n') >= 0) {
                            // headers received OK
                            socket.off('data', onData);
                            resolve(new ipc_net_1.NodeSocket(socket, debugLabel));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZVNvY2tldEZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9yZW1vdGUvbm9kZS9ub2RlU29ja2V0RmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTbkYsUUFBQSxpQkFBaUIsR0FBRyxJQUFJO1FBRXBDLFFBQVEsQ0FBQyxTQUFvQztZQUM1QyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUE2QixFQUFFLElBQVksRUFBRSxLQUFhLEVBQUUsVUFBa0I7WUFDakcsT0FBTyxJQUFJLE9BQU8sQ0FBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDL0MsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFO29CQUNwRSxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFFdkMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFBLG9DQUFvQixFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztvQkFFNUQsTUFBTSxNQUFNLEdBQUcsQ0FBQyxJQUFZLEVBQUUsRUFBRTt3QkFDL0IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUNoQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFOzRCQUNyQyxzQkFBc0I7NEJBQ3RCLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDOzRCQUMzQixPQUFPLENBQUMsSUFBSSxvQkFBVSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO3lCQUM1QztvQkFDRixDQUFDLENBQUM7b0JBQ0YsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQzNCLENBQUMsQ0FBQyxDQUFDO2dCQUNILDZCQUE2QjtnQkFDN0IsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0QsQ0FBQyJ9