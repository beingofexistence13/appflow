/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readExtHostConnection = exports.writeExtHostConnection = exports.MessagePortExtHostConnection = exports.SocketExtHostConnection = exports.IPCExtHostConnection = exports.ExtHostConnectionType = void 0;
    var ExtHostConnectionType;
    (function (ExtHostConnectionType) {
        ExtHostConnectionType[ExtHostConnectionType["IPC"] = 1] = "IPC";
        ExtHostConnectionType[ExtHostConnectionType["Socket"] = 2] = "Socket";
        ExtHostConnectionType[ExtHostConnectionType["MessagePort"] = 3] = "MessagePort";
    })(ExtHostConnectionType || (exports.ExtHostConnectionType = ExtHostConnectionType = {}));
    /**
     * The extension host will connect via named pipe / domain socket to its renderer.
     */
    class IPCExtHostConnection {
        static { this.ENV_KEY = 'VSCODE_EXTHOST_IPC_HOOK'; }
        constructor(pipeName) {
            this.pipeName = pipeName;
            this.type = 1 /* ExtHostConnectionType.IPC */;
        }
        serialize(env) {
            env[IPCExtHostConnection.ENV_KEY] = this.pipeName;
        }
    }
    exports.IPCExtHostConnection = IPCExtHostConnection;
    /**
     * The extension host will receive via nodejs IPC the socket to its renderer.
     */
    class SocketExtHostConnection {
        constructor() {
            this.type = 2 /* ExtHostConnectionType.Socket */;
        }
        static { this.ENV_KEY = 'VSCODE_EXTHOST_WILL_SEND_SOCKET'; }
        serialize(env) {
            env[SocketExtHostConnection.ENV_KEY] = '1';
        }
    }
    exports.SocketExtHostConnection = SocketExtHostConnection;
    /**
     * The extension host will receive via nodejs IPC the MessagePort to its renderer.
     */
    class MessagePortExtHostConnection {
        constructor() {
            this.type = 3 /* ExtHostConnectionType.MessagePort */;
        }
        static { this.ENV_KEY = 'VSCODE_WILL_SEND_MESSAGE_PORT'; }
        serialize(env) {
            env[MessagePortExtHostConnection.ENV_KEY] = '1';
        }
    }
    exports.MessagePortExtHostConnection = MessagePortExtHostConnection;
    function clean(env) {
        delete env[IPCExtHostConnection.ENV_KEY];
        delete env[SocketExtHostConnection.ENV_KEY];
        delete env[MessagePortExtHostConnection.ENV_KEY];
    }
    /**
     * Write `connection` into `env` and clean up `env`.
     */
    function writeExtHostConnection(connection, env) {
        // Avoid having two different keys that might introduce amiguity or problems.
        clean(env);
        connection.serialize(env);
    }
    exports.writeExtHostConnection = writeExtHostConnection;
    /**
     * Read `connection` from `env` and clean up `env`.
     */
    function readExtHostConnection(env) {
        if (env[IPCExtHostConnection.ENV_KEY]) {
            return cleanAndReturn(env, new IPCExtHostConnection(env[IPCExtHostConnection.ENV_KEY]));
        }
        if (env[SocketExtHostConnection.ENV_KEY]) {
            return cleanAndReturn(env, new SocketExtHostConnection());
        }
        if (env[MessagePortExtHostConnection.ENV_KEY]) {
            return cleanAndReturn(env, new MessagePortExtHostConnection());
        }
        throw new Error(`No connection information defined in environment!`);
    }
    exports.readExtHostConnection = readExtHostConnection;
    function cleanAndReturn(env, result) {
        clean(env);
        return result;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdEVudi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25zL2NvbW1vbi9leHRlbnNpb25Ib3N0RW52LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUloRyxJQUFrQixxQkFJakI7SUFKRCxXQUFrQixxQkFBcUI7UUFDdEMsK0RBQU8sQ0FBQTtRQUNQLHFFQUFVLENBQUE7UUFDViwrRUFBZSxDQUFBO0lBQ2hCLENBQUMsRUFKaUIscUJBQXFCLHFDQUFyQixxQkFBcUIsUUFJdEM7SUFFRDs7T0FFRztJQUNILE1BQWEsb0JBQW9CO2lCQUNsQixZQUFPLEdBQUcseUJBQXlCLEFBQTVCLENBQTZCO1FBSWxELFlBQ2lCLFFBQWdCO1lBQWhCLGFBQVEsR0FBUixRQUFRLENBQVE7WUFIakIsU0FBSSxxQ0FBNkI7UUFJN0MsQ0FBQztRQUVFLFNBQVMsQ0FBQyxHQUF3QjtZQUN4QyxHQUFHLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUNuRCxDQUFDOztJQVhGLG9EQVlDO0lBRUQ7O09BRUc7SUFDSCxNQUFhLHVCQUF1QjtRQUFwQztZQUdpQixTQUFJLHdDQUFnQztRQUtyRCxDQUFDO2lCQVBjLFlBQU8sR0FBRyxpQ0FBaUMsQUFBcEMsQ0FBcUM7UUFJbkQsU0FBUyxDQUFDLEdBQXdCO1lBQ3hDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDNUMsQ0FBQzs7SUFQRiwwREFRQztJQUVEOztPQUVHO0lBQ0gsTUFBYSw0QkFBNEI7UUFBekM7WUFHaUIsU0FBSSw2Q0FBcUM7UUFLMUQsQ0FBQztpQkFQYyxZQUFPLEdBQUcsK0JBQStCLEFBQWxDLENBQW1DO1FBSWpELFNBQVMsQ0FBQyxHQUF3QjtZQUN4QyxHQUFHLENBQUMsNEJBQTRCLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBQ2pELENBQUM7O0lBUEYsb0VBUUM7SUFJRCxTQUFTLEtBQUssQ0FBQyxHQUF3QjtRQUN0QyxPQUFPLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6QyxPQUFPLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QyxPQUFPLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixzQkFBc0IsQ0FBQyxVQUE2QixFQUFFLEdBQXdCO1FBQzdGLDZFQUE2RTtRQUM3RSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFKRCx3REFJQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IscUJBQXFCLENBQUMsR0FBd0I7UUFDN0QsSUFBSSxHQUFHLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDdEMsT0FBTyxjQUFjLENBQUMsR0FBRyxFQUFFLElBQUksb0JBQW9CLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUMsQ0FBQztTQUN6RjtRQUNELElBQUksR0FBRyxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3pDLE9BQU8sY0FBYyxDQUFDLEdBQUcsRUFBRSxJQUFJLHVCQUF1QixFQUFFLENBQUMsQ0FBQztTQUMxRDtRQUNELElBQUksR0FBRyxDQUFDLDRCQUE0QixDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzlDLE9BQU8sY0FBYyxDQUFDLEdBQUcsRUFBRSxJQUFJLDRCQUE0QixFQUFFLENBQUMsQ0FBQztTQUMvRDtRQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsbURBQW1ELENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBWEQsc0RBV0M7SUFFRCxTQUFTLGNBQWMsQ0FBQyxHQUF3QixFQUFFLE1BQXlCO1FBQzFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQyJ9