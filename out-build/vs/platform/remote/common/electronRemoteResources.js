/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$b7b = exports.$a7b = exports.$_6b = void 0;
    exports.$_6b = 'request';
    exports.$a7b = 'remoteResourceHandler';
    class $b7b {
        async routeCall(hub, command, arg) {
            if (command !== exports.$_6b) {
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
    exports.$b7b = $b7b;
});
//# sourceMappingURL=electronRemoteResources.js.map