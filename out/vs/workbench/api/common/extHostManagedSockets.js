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
    exports.ExtHostManagedSockets = exports.IExtHostManagedSockets = void 0;
    exports.IExtHostManagedSockets = (0, instantiation_1.createDecorator)('IExtHostManagedSockets');
    let ExtHostManagedSockets = class ExtHostManagedSockets {
        constructor(extHostRpc) {
            this._remoteSocketIdCounter = 0;
            this._factory = null;
            this._managedRemoteSockets = new Map();
            this._proxy = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadManagedSockets);
        }
        setFactory(socketFactoryId, makeConnection) {
            // Terminate all previous sockets
            for (const socket of this._managedRemoteSockets.values()) {
                // calling dispose() will lead to it removing itself from the map
                socket.dispose();
            }
            // Unregister previous factory
            if (this._factory) {
                this._proxy.$unregisterSocketFactory(this._factory.socketFactoryId);
            }
            this._factory = new ManagedSocketFactory(socketFactoryId, makeConnection);
            this._proxy.$registerSocketFactory(this._factory.socketFactoryId);
        }
        async $openRemoteSocket(socketFactoryId) {
            if (!this._factory || this._factory.socketFactoryId !== socketFactoryId) {
                throw new Error(`No socket factory with id ${socketFactoryId}`);
            }
            const id = (++this._remoteSocketIdCounter);
            const socket = await this._factory.makeConnection();
            const disposable = new lifecycle_1.DisposableStore();
            this._managedRemoteSockets.set(id, new ManagedSocket(id, socket, disposable));
            disposable.add((0, lifecycle_1.toDisposable)(() => this._managedRemoteSockets.delete(id)));
            disposable.add(socket.onDidEnd(() => {
                this._proxy.$onDidManagedSocketEnd(id);
                disposable.dispose();
            }));
            disposable.add(socket.onDidClose(e => {
                this._proxy.$onDidManagedSocketClose(id, e?.stack ?? e?.message);
                disposable.dispose();
            }));
            disposable.add(socket.onDidReceiveMessage(e => this._proxy.$onDidManagedSocketHaveData(id, buffer_1.VSBuffer.wrap(e))));
            return id;
        }
        $remoteSocketWrite(socketId, buffer) {
            this._managedRemoteSockets.get(socketId)?.actual.send(buffer.buffer);
        }
        $remoteSocketEnd(socketId) {
            const socket = this._managedRemoteSockets.get(socketId);
            if (socket) {
                socket.actual.end();
                socket.dispose();
            }
        }
        async $remoteSocketDrain(socketId) {
            await this._managedRemoteSockets.get(socketId)?.actual.drain?.();
        }
    };
    exports.ExtHostManagedSockets = ExtHostManagedSockets;
    exports.ExtHostManagedSockets = ExtHostManagedSockets = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService)
    ], ExtHostManagedSockets);
    class ManagedSocketFactory {
        constructor(socketFactoryId, makeConnection) {
            this.socketFactoryId = socketFactoryId;
            this.makeConnection = makeConnection;
        }
    }
    class ManagedSocket extends lifecycle_1.Disposable {
        constructor(socketId, actual, disposer) {
            super();
            this.socketId = socketId;
            this.actual = actual;
            this._register(disposer);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdE1hbmFnZWRTb2NrZXRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9jb21tb24vZXh0SG9zdE1hbmFnZWRTb2NrZXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWNuRixRQUFBLHNCQUFzQixHQUFHLElBQUEsK0JBQWUsRUFBeUIsd0JBQXdCLENBQUMsQ0FBQztJQUVqRyxJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFxQjtRQVFqQyxZQUNxQixVQUE4QjtZQUwzQywyQkFBc0IsR0FBRyxDQUFDLENBQUM7WUFDM0IsYUFBUSxHQUFnQyxJQUFJLENBQUM7WUFDcEMsMEJBQXFCLEdBQStCLElBQUksR0FBRyxFQUFFLENBQUM7WUFLOUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLDhCQUFXLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBRUQsVUFBVSxDQUFDLGVBQXVCLEVBQUUsY0FBNEQ7WUFDL0YsaUNBQWlDO1lBQ2pDLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUN6RCxpRUFBaUU7Z0JBQ2pFLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNqQjtZQUNELDhCQUE4QjtZQUM5QixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xCLElBQUksQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUNwRTtZQUVELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDMUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFFRCxLQUFLLENBQUMsaUJBQWlCLENBQUMsZUFBdUI7WUFDOUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEtBQUssZUFBZSxFQUFFO2dCQUN4RSxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixlQUFlLEVBQUUsQ0FBQyxDQUFDO2FBQ2hFO1lBRUQsTUFBTSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNwRCxNQUFNLFVBQVUsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUN6QyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLGFBQWEsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFFOUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtnQkFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDdkMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNqRSxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxFQUFFLEVBQUUsaUJBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFL0csT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBRUQsa0JBQWtCLENBQUMsUUFBZ0IsRUFBRSxNQUFnQjtZQUNwRCxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFRCxnQkFBZ0IsQ0FBQyxRQUFnQjtZQUNoQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hELElBQUksTUFBTSxFQUFFO2dCQUNYLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3BCLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNqQjtRQUNGLENBQUM7UUFFRCxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBZ0I7WUFDeEMsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO1FBQ2xFLENBQUM7S0FDRCxDQUFBO0lBcEVZLHNEQUFxQjtvQ0FBckIscUJBQXFCO1FBUy9CLFdBQUEsc0NBQWtCLENBQUE7T0FUUixxQkFBcUIsQ0FvRWpDO0lBRUQsTUFBTSxvQkFBb0I7UUFDekIsWUFDaUIsZUFBdUIsRUFDdkIsY0FBNEQ7WUFENUQsb0JBQWUsR0FBZixlQUFlLENBQVE7WUFDdkIsbUJBQWMsR0FBZCxjQUFjLENBQThDO1FBQ3pFLENBQUM7S0FDTDtJQUVELE1BQU0sYUFBYyxTQUFRLHNCQUFVO1FBQ3JDLFlBQ2lCLFFBQWdCLEVBQ2hCLE1BQW9DLEVBQ3BELFFBQXlCO1lBRXpCLEtBQUssRUFBRSxDQUFDO1lBSlEsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUNoQixXQUFNLEdBQU4sTUFBTSxDQUE4QjtZQUlwRCxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFCLENBQUM7S0FDRCJ9