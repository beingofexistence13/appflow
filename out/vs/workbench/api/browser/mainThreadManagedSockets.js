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
    exports.MainThreadManagedSocket = exports.MainThreadManagedSockets = void 0;
    let MainThreadManagedSockets = class MainThreadManagedSockets extends lifecycle_1.Disposable {
        constructor(extHostContext, _remoteSocketFactoryService) {
            super();
            this._remoteSocketFactoryService = _remoteSocketFactoryService;
            this._registrations = new Map();
            this._remoteSockets = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostManagedSockets);
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
                        that._proxy.$openRemoteSocket(factoryId).then(socketId => {
                            const half = {
                                onClose: new event_1.Emitter(),
                                onData: new event_1.Emitter(),
                                onEnd: new event_1.Emitter(),
                            };
                            that._remoteSockets.set(socketId, half);
                            MainThreadManagedSocket.connect(socketId, that._proxy, path, query, debugLabel, half)
                                .then(socket => {
                                socket.onDidDispose(() => that._remoteSockets.delete(socketId));
                                resolve(socket);
                            }, err => {
                                that._remoteSockets.delete(socketId);
                                reject(err);
                            });
                        }).catch(reject);
                    });
                }
            };
            this._registrations.set(socketFactoryId, this._remoteSocketFactoryService.register(1 /* RemoteConnectionType.Managed */, socketFactory));
        }
        async $unregisterSocketFactory(socketFactoryId) {
            this._registrations.get(socketFactoryId)?.dispose();
        }
        $onDidManagedSocketHaveData(socketId, data) {
            this._remoteSockets.get(socketId)?.onData.fire(data);
        }
        $onDidManagedSocketClose(socketId, error) {
            this._remoteSockets.get(socketId)?.onClose.fire({
                type: 0 /* SocketCloseEventType.NodeSocketCloseEvent */,
                error: error ? new Error(error) : undefined,
                hadError: !!error
            });
            this._remoteSockets.delete(socketId);
        }
        $onDidManagedSocketEnd(socketId) {
            this._remoteSockets.get(socketId)?.onEnd.fire();
        }
    };
    exports.MainThreadManagedSockets = MainThreadManagedSockets;
    exports.MainThreadManagedSockets = MainThreadManagedSockets = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadManagedSockets),
        __param(1, remoteSocketFactoryService_1.IRemoteSocketFactoryService)
    ], MainThreadManagedSockets);
    class MainThreadManagedSocket extends managedSocket_1.ManagedSocket {
        static connect(socketId, proxy, path, query, debugLabel, half) {
            const socket = new MainThreadManagedSocket(socketId, proxy, debugLabel, half);
            return (0, managedSocket_1.connectManagedSocket)(socket, path, query, debugLabel, half);
        }
        constructor(socketId, proxy, debugLabel, half) {
            super(debugLabel, half);
            this.socketId = socketId;
            this.proxy = proxy;
        }
        write(buffer) {
            this.proxy.$remoteSocketWrite(this.socketId, buffer);
        }
        closeRemote() {
            this.proxy.$remoteSocketEnd(this.socketId);
        }
        drain() {
            return this.proxy.$remoteSocketDrain(this.socketId);
        }
    }
    exports.MainThreadManagedSocket = MainThreadManagedSocket;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZE1hbmFnZWRTb2NrZXRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRNYW5hZ2VkU29ja2V0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFhekYsSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBeUIsU0FBUSxzQkFBVTtRQU12RCxZQUNDLGNBQStCLEVBQ0YsMkJBQXlFO1lBRXRHLEtBQUssRUFBRSxDQUFDO1lBRnNDLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBNkI7WUFMdEYsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBdUIsQ0FBQztZQUNoRCxtQkFBYyxHQUFHLElBQUksR0FBRyxFQUE0QixDQUFDO1lBT3JFLElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUVELEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxlQUF1QjtZQUNuRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7WUFDbEIsTUFBTSxhQUFhLEdBQUcsSUFBSTtnQkFFekIsUUFBUSxDQUFDLFNBQWtDO29CQUMxQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxlQUFlLENBQUMsQ0FBQztnQkFDM0MsQ0FBQztnQkFFRCxPQUFPLENBQUMsU0FBa0MsRUFBRSxJQUFZLEVBQUUsS0FBYSxFQUFFLFVBQWtCO29CQUMxRixPQUFPLElBQUksT0FBTyxDQUFVLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO3dCQUMvQyxJQUFJLFNBQVMsQ0FBQyxFQUFFLEtBQUssZUFBZSxFQUFFOzRCQUNyQyxPQUFPLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7eUJBQzlDO3dC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