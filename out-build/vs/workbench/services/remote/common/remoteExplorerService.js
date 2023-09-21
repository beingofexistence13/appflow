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
    exports.TunnelEditId = exports.TunnelType = exports.$Bsb = exports.$Asb = exports.$zsb = exports.$ysb = exports.$xsb = exports.$wsb = exports.$vsb = exports.$usb = exports.$tsb = void 0;
    exports.$tsb = (0, instantiation_1.$Bh)('remoteExplorerService');
    exports.$usb = 'remote.explorerType';
    exports.$vsb = '~remote.forwardedPorts';
    exports.$wsb = '~remote.forwardedPortsContainer';
    exports.$xsb = 'remote.autoForwardPorts';
    exports.$ysb = 'remote.autoForwardPortsSource';
    exports.$zsb = 'process';
    exports.$Asb = 'output';
    exports.$Bsb = 'hybrid';
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
        constructor(h, i, instantiationService) {
            this.h = h;
            this.i = i;
            this.a = [];
            this.b = new event_1.$fd();
            this.onDidChangeTargetType = this.b.event;
            this.e = new event_1.$fd();
            this.onDidChangeEditable = this.e.event;
            this.f = new event_1.$fd();
            this.onEnabledPortsFeatures = this.f.event;
            this.g = false;
            this.namedProcesses = new Map();
            this.c = instantiationService.createInstance(tunnelModel_1.$sJ);
        }
        set targetType(name) {
            // Can just compare the first element of the array since there are no target overlaps
            const current = this.a.length > 0 ? this.a[0] : '';
            const newName = name.length > 0 ? name[0] : '';
            if (current !== newName) {
                this.a = name;
                this.h.store(exports.$usb, this.a.toString(), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
                this.h.store(exports.$usb, this.a.toString(), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                this.b.fire(this.a);
            }
        }
        get targetType() {
            return this.a;
        }
        get tunnelModel() {
            return this.c;
        }
        forward(tunnelProperties, attributes) {
            return this.tunnelModel.forward(tunnelProperties, attributes);
        }
        close(remote, reason) {
            return this.tunnelModel.close(remote.host, remote.port, reason);
        }
        setTunnelInformation(tunnelInformation) {
            if (tunnelInformation?.features) {
                this.i.setTunnelFeatures(tunnelInformation.features);
            }
            this.tunnelModel.addEnvironmentTunnels(tunnelInformation?.environmentTunnels);
        }
        setEditable(tunnelItem, editId, data) {
            if (!data) {
                this.d = undefined;
            }
            else {
                this.d = { tunnelItem, data, editId };
            }
            this.e.fire(tunnelItem ? { tunnel: tunnelItem, editId } : undefined);
        }
        getEditableData(tunnelItem, editId) {
            return (this.d &&
                ((!tunnelItem && (tunnelItem === this.d.tunnelItem)) ||
                    (tunnelItem && (this.d.tunnelItem?.remotePort === tunnelItem.remotePort) && (this.d.tunnelItem.remoteHost === tunnelItem.remoteHost)
                        && (this.d.editId === editId)))) ?
                this.d.data : undefined;
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
            this.g = true;
            this.f.fire();
        }
        get portsFeaturesEnabled() {
            return this.g;
        }
    };
    RemoteExplorerService = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, tunnel_1.$Wz),
        __param(2, instantiation_1.$Ah)
    ], RemoteExplorerService);
    (0, extensions_1.$mr)(exports.$tsb, RemoteExplorerService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=remoteExplorerService.js.map