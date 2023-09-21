/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/workbench/api/common/extHost.protocol", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/workbench/api/common/extHostRpcService", "vs/base/common/buffer"], function (require, exports, extHost_protocol_1, instantiation_1, lifecycle_1, extHostRpcService_1, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Obc = exports.$Nbc = void 0;
    exports.$Nbc = (0, instantiation_1.$Bh)('IExtHostManagedSockets');
    let $Obc = class $Obc {
        constructor(extHostRpc) {
            this.b = 0;
            this.c = null;
            this.d = new Map();
            this.a = extHostRpc.getProxy(extHost_protocol_1.$1J.MainThreadManagedSockets);
        }
        setFactory(socketFactoryId, makeConnection) {
            // Terminate all previous sockets
            for (const socket of this.d.values()) {
                // calling dispose() will lead to it removing itself from the map
                socket.dispose();
            }
            // Unregister previous factory
            if (this.c) {
                this.a.$unregisterSocketFactory(this.c.socketFactoryId);
            }
            this.c = new ManagedSocketFactory(socketFactoryId, makeConnection);
            this.a.$registerSocketFactory(this.c.socketFactoryId);
        }
        async $openRemoteSocket(socketFactoryId) {
            if (!this.c || this.c.socketFactoryId !== socketFactoryId) {
                throw new Error(`No socket factory with id ${socketFactoryId}`);
            }
            const id = (++this.b);
            const socket = await this.c.makeConnection();
            const disposable = new lifecycle_1.$jc();
            this.d.set(id, new ManagedSocket(id, socket, disposable));
            disposable.add((0, lifecycle_1.$ic)(() => this.d.delete(id)));
            disposable.add(socket.onDidEnd(() => {
                this.a.$onDidManagedSocketEnd(id);
                disposable.dispose();
            }));
            disposable.add(socket.onDidClose(e => {
                this.a.$onDidManagedSocketClose(id, e?.stack ?? e?.message);
                disposable.dispose();
            }));
            disposable.add(socket.onDidReceiveMessage(e => this.a.$onDidManagedSocketHaveData(id, buffer_1.$Fd.wrap(e))));
            return id;
        }
        $remoteSocketWrite(socketId, buffer) {
            this.d.get(socketId)?.actual.send(buffer.buffer);
        }
        $remoteSocketEnd(socketId) {
            const socket = this.d.get(socketId);
            if (socket) {
                socket.actual.end();
                socket.dispose();
            }
        }
        async $remoteSocketDrain(socketId) {
            await this.d.get(socketId)?.actual.drain?.();
        }
    };
    exports.$Obc = $Obc;
    exports.$Obc = $Obc = __decorate([
        __param(0, extHostRpcService_1.$2L)
    ], $Obc);
    class ManagedSocketFactory {
        constructor(socketFactoryId, makeConnection) {
            this.socketFactoryId = socketFactoryId;
            this.makeConnection = makeConnection;
        }
    }
    class ManagedSocket extends lifecycle_1.$kc {
        constructor(socketId, actual, disposer) {
            super();
            this.socketId = socketId;
            this.actual = actual;
            this.B(disposer);
        }
    }
});
//# sourceMappingURL=extHostManagedSockets.js.map