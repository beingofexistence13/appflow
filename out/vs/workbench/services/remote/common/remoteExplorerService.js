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
define(["require", "exports", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/extensions", "vs/platform/storage/common/storage", "vs/platform/tunnel/common/tunnel", "vs/workbench/services/remote/common/tunnelModel"], function (require, exports, event_1, instantiation_1, extensions_1, storage_1, tunnel_1, tunnelModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TunnelEditId = exports.TunnelType = exports.PORT_AUTO_SOURCE_SETTING_HYBRID = exports.PORT_AUTO_SOURCE_SETTING_OUTPUT = exports.PORT_AUTO_SOURCE_SETTING_PROCESS = exports.PORT_AUTO_SOURCE_SETTING = exports.PORT_AUTO_FORWARD_SETTING = exports.TUNNEL_VIEW_CONTAINER_ID = exports.TUNNEL_VIEW_ID = exports.REMOTE_EXPLORER_TYPE_KEY = exports.IRemoteExplorerService = void 0;
    exports.IRemoteExplorerService = (0, instantiation_1.createDecorator)('remoteExplorerService');
    exports.REMOTE_EXPLORER_TYPE_KEY = 'remote.explorerType';
    exports.TUNNEL_VIEW_ID = '~remote.forwardedPorts';
    exports.TUNNEL_VIEW_CONTAINER_ID = '~remote.forwardedPortsContainer';
    exports.PORT_AUTO_FORWARD_SETTING = 'remote.autoForwardPorts';
    exports.PORT_AUTO_SOURCE_SETTING = 'remote.autoForwardPortsSource';
    exports.PORT_AUTO_SOURCE_SETTING_PROCESS = 'process';
    exports.PORT_AUTO_SOURCE_SETTING_OUTPUT = 'output';
    exports.PORT_AUTO_SOURCE_SETTING_HYBRID = 'hybrid';
    var TunnelType;
    (function (TunnelType) {
        TunnelType["Candidate"] = "Candidate";
        TunnelType["Detected"] = "Detected";
        TunnelType["Forwarded"] = "Forwarded";
        TunnelType["Add"] = "Add";
    })(TunnelType || (exports.TunnelType = TunnelType = {}));
    var TunnelEditId;
    (function (TunnelEditId) {
        TunnelEditId[TunnelEditId["None"] = 0] = "None";
        TunnelEditId[TunnelEditId["New"] = 1] = "New";
        TunnelEditId[TunnelEditId["Label"] = 2] = "Label";
        TunnelEditId[TunnelEditId["LocalPort"] = 3] = "LocalPort";
    })(TunnelEditId || (exports.TunnelEditId = TunnelEditId = {}));
    let RemoteExplorerService = class RemoteExplorerService {
        constructor(storageService, tunnelService, instantiationService) {
            this.storageService = storageService;
            this.tunnelService = tunnelService;
            this._targetType = [];
            this._onDidChangeTargetType = new event_1.Emitter();
            this.onDidChangeTargetType = this._onDidChangeTargetType.event;
            this._onDidChangeEditable = new event_1.Emitter();
            this.onDidChangeEditable = this._onDidChangeEditable.event;
            this._onEnabledPortsFeatures = new event_1.Emitter();
            this.onEnabledPortsFeatures = this._onEnabledPortsFeatures.event;
            this._portsFeaturesEnabled = false;
            this.namedProcesses = new Map();
            this._tunnelModel = instantiationService.createInstance(tunnelModel_1.TunnelModel);
        }
        set targetType(name) {
            // Can just compare the first element of the array since there are no target overlaps
            const current = this._targetType.length > 0 ? this._targetType[0] : '';
            const newName = name.length > 0 ? name[0] : '';
            if (current !== newName) {
                this._targetType = name;
                this.storageService.store(exports.REMOTE_EXPLORER_TYPE_KEY, this._targetType.toString(), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                this.storageService.store(exports.REMOTE_EXPLORER_TYPE_KEY, this._targetType.toString(), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                this._onDidChangeTargetType.fire(this._targetType);
            }
        }
        get targetType() {
            return this._targetType;
        }
        get tunnelModel() {
            return this._tunnelModel;
        }
        forward(tunnelProperties, attributes) {
            return this.tunnelModel.forward(tunnelProperties, attributes);
        }
        close(remote, reason) {
            return this.tunnelModel.close(remote.host, remote.port, reason);
        }
        setTunnelInformation(tunnelInformation) {
            if (tunnelInformation?.features) {
                this.tunnelService.setTunnelFeatures(tunnelInformation.features);
            }
            this.tunnelModel.addEnvironmentTunnels(tunnelInformation?.environmentTunnels);
        }
        setEditable(tunnelItem, editId, data) {
            if (!data) {
                this._editable = undefined;
            }
            else {
                this._editable = { tunnelItem, data, editId };
            }
            this._onDidChangeEditable.fire(tunnelItem ? { tunnel: tunnelItem, editId } : undefined);
        }
        getEditableData(tunnelItem, editId) {
            return (this._editable &&
                ((!tunnelItem && (tunnelItem === this._editable.tunnelItem)) ||
                    (tunnelItem && (this._editable.tunnelItem?.remotePort === tunnelItem.remotePort) && (this._editable.tunnelItem.remoteHost === tunnelItem.remoteHost)
                        && (this._editable.editId === editId)))) ?
                this._editable.data : undefined;
        }
        setCandidateFilter(filter) {
            if (!filter) {
                return {
                    dispose: () => { }
                };
            }
            this.tunnelModel.setCandidateFilter(filter);
            return {
                dispose: () => {
                    this.tunnelModel.setCandidateFilter(undefined);
                }
            };
        }
        onFoundNewCandidates(candidates) {
            this.tunnelModel.setCandidates(candidates);
        }
        restore() {
            return this.tunnelModel.restoreForwarded();
        }
        enablePortsFeatures() {
            this._portsFeaturesEnabled = true;
            this._onEnabledPortsFeatures.fire();
        }
        get portsFeaturesEnabled() {
            return this._portsFeaturesEnabled;
        }
    };
    RemoteExplorerService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, tunnel_1.ITunnelService),
        __param(2, instantiation_1.IInstantiationService)
    ], RemoteExplorerService);
    (0, extensions_1.registerSingleton)(exports.IRemoteExplorerService, RemoteExplorerService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlRXhwbG9yZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3JlbW90ZS9jb21tb24vcmVtb3RlRXhwbG9yZXJTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWFuRixRQUFBLHNCQUFzQixHQUFHLElBQUEsK0JBQWUsRUFBeUIsdUJBQXVCLENBQUMsQ0FBQztJQUMxRixRQUFBLHdCQUF3QixHQUFXLHFCQUFxQixDQUFDO0lBQ3pELFFBQUEsY0FBYyxHQUFHLHdCQUF3QixDQUFDO0lBQzFDLFFBQUEsd0JBQXdCLEdBQUcsaUNBQWlDLENBQUM7SUFDN0QsUUFBQSx5QkFBeUIsR0FBRyx5QkFBeUIsQ0FBQztJQUN0RCxRQUFBLHdCQUF3QixHQUFHLCtCQUErQixDQUFDO0lBQzNELFFBQUEsZ0NBQWdDLEdBQUcsU0FBUyxDQUFDO0lBQzdDLFFBQUEsK0JBQStCLEdBQUcsUUFBUSxDQUFDO0lBQzNDLFFBQUEsK0JBQStCLEdBQUcsUUFBUSxDQUFDO0lBRXhELElBQVksVUFLWDtJQUxELFdBQVksVUFBVTtRQUNyQixxQ0FBdUIsQ0FBQTtRQUN2QixtQ0FBcUIsQ0FBQTtRQUNyQixxQ0FBdUIsQ0FBQTtRQUN2Qix5QkFBVyxDQUFBO0lBQ1osQ0FBQyxFQUxXLFVBQVUsMEJBQVYsVUFBVSxRQUtyQjtJQXFCRCxJQUFZLFlBS1g7SUFMRCxXQUFZLFlBQVk7UUFDdkIsK0NBQVEsQ0FBQTtRQUNSLDZDQUFPLENBQUE7UUFDUCxpREFBUyxDQUFBO1FBQ1QseURBQWEsQ0FBQTtJQUNkLENBQUMsRUFMVyxZQUFZLDRCQUFaLFlBQVksUUFLdkI7SUFzQkQsSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBcUI7UUFjMUIsWUFDa0IsY0FBZ0QsRUFDakQsYUFBOEMsRUFDdkMsb0JBQTJDO1lB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