/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeRemoteResourceRouter = exports.NODE_REMOTE_RESOURCE_CHANNEL_NAME = exports.NODE_REMOTE_RESOURCE_IPC_METHOD_NAME = void 0;
    exports.NODE_REMOTE_RESOURCE_IPC_METHOD_NAME = 'request';
    exports.NODE_REMOTE_RESOURCE_CHANNEL_NAME = 'remoteResourceHandler';
    class NodeRemoteResourceRouter {
        async routeCall(hub, command, arg) {
            if (command !== exports.NODE_REMOTE_RESOURCE_IPC_METHOD_NAME) {
                throw new Error(`Call not found: ${command}`);
            }
            const uri = arg[0];
            if (uri?.authority) {
                const connection = hub.connections.find(c => c.ctx === uri.authority);
                if (connection) {
                    return connection;
                }
            }
            throw new Error(`Caller not found`);
        }
        routeEvent(_, event) {
            throw new Error(`Event not found: ${event}`);
        }
    }
    exports.NodeRemoteResourceRouter = NodeRemoteResourceRouter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlY3Ryb25SZW1vdGVSZXNvdXJjZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9yZW1vdGUvY29tbW9uL2VsZWN0cm9uUmVtb3RlUmVzb3VyY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtuRixRQUFBLG9DQUFvQyxHQUFHLFNBQVMsQ0FBQztJQUVqRCxRQUFBLGlDQUFpQyxHQUFHLHVCQUF1QixDQUFDO0lBSXpFLE1BQWEsd0JBQXdCO1FBQ3BDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBMkIsRUFBRSxPQUFlLEVBQUUsR0FBUztZQUN0RSxJQUFJLE9BQU8sS0FBSyw0Q0FBb0MsRUFBRTtnQkFDckQsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsT0FBTyxFQUFFLENBQUMsQ0FBQzthQUM5QztZQUVELE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQWdDLENBQUM7WUFDbEQsSUFBSSxHQUFHLEVBQUUsU0FBUyxFQUFFO2dCQUNuQixNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN0RSxJQUFJLFVBQVUsRUFBRTtvQkFDZixPQUFPLFVBQVUsQ0FBQztpQkFDbEI7YUFDRDtZQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQsVUFBVSxDQUFDLENBQXlCLEVBQUUsS0FBYTtZQUNsRCxNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzlDLENBQUM7S0FDRDtJQXBCRCw0REFvQkMifQ==