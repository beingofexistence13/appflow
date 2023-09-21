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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/remote/common/managedSocket", "vs/platform/remote/common/remoteSocketFactoryService", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, event_1, lifecycle_1, managedSocket_1, remoteSocketFactoryService_1, extHost_protocol_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ekb = exports.$Dkb = void 0;
    let $Dkb = class $Dkb extends lifecycle_1.$kc {
        constructor(extHostContext, f) {
            super();
            this.f = f;
            this.b = new Map();
            this.c = new Map();
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostManagedSockets);
        }
        async $registerSocketFactory(socketFactoryId) {
            const that = this;
            const socketFactory = new class {
                supports(connectTo) {
                    return (connectTo.id === socketFactoryId);
                }
                connect(connectTo, path, query, debugLabel) {
                    return new Promise((resolve, reject) => {
                        if (connectTo.id !== socketFactoryId) {
                            return reject(new Error('Invalid connectTo'));
                        }
                        const factoryId = connectTo.id;
                        that.a.$openRemoteSocket(factoryId).then(socketId => {
                            const half = {
                                onClose: new event_1.$fd(),
                                onData: new event_1.$fd(),
                                onEnd: new event_1.$fd(),
                            };
                            that.c.set(socketId, half);
                            $Ekb.connect(socketId, that.a, path, query, debugLabel, half)
                                .then(socket => {
                                socket.onDidDispose(() => that.c.delete(socketId));
                                resolve(socket);
                            }, err => {
                                that.c.delete(socketId);
                                reject(err);
                            });
                        }).catch(reject);
                    });
                }
            };
            this.b.set(socketFactoryId, this.f.register(1 /* RemoteConnectionType.Managed */, socketFactory));
        }
        async $unregisterSocketFactory(socketFactoryId) {
            this.b.get(socketFactoryId)?.dispose();
        }
        $onDidManagedSocketHaveData(socketId, data) {
            this.c.get(socketId)?.onData.fire(data);
        }
        $onDidManagedSocketClose(socketId, error) {
            this.c.get(socketId)?.onClose.fire({
                type: 0 /* SocketCloseEventType.NodeSocketCloseEvent */,
                error: error ? new Error(error) : undefined,
                hadError: !!error
            });
            this.c.delete(socketId);
        }
        $onDidManagedSocketEnd(socketId) {
            this.c.get(socketId)?.onEnd.fire();
        }
    };
    exports.$Dkb = $Dkb;
    exports.$Dkb = $Dkb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadManagedSockets),
        __param(1, remoteSocketFactoryService_1.$Tk)
    ], $Dkb);
    class $Ekb extends managedSocket_1.$Ckb {
        static connect(socketId, proxy, path, query, debugLabel, half) {
            const socket = new $Ekb(socketId, proxy, debugLabel, half);
            return (0, managedSocket_1.$Bkb)(socket, path, query, debugLabel, half);
        }
        constructor(c, j, debugLabel, half) {
            super(debugLabel, half);
            this.c = c;
            this.j = j;
        }
        write(buffer) {
            this.j.$remoteSocketWrite(this.c, buffer);
        }
        h() {
            this.j.$remoteSocketEnd(this.c);
        }
        drain() {
            return this.j.$remoteSocketDrain(this.c);
        }
    }
    exports.$Ekb = $Ekb;
});
//# sourceMappingURL=mainThreadManagedSockets.js.map