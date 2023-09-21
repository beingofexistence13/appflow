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
define(["require", "exports", "vs/base/parts/ipc/common/ipc", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/ipc/common/mainProcessService"], function (require, exports, ipc_1, descriptors_1, extensions_1, instantiation_1, mainProcessService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$B7b = exports.$A7b = exports.$z7b = void 0;
    class RemoteServiceStub {
        constructor(channelName, options, remote, instantiationService) {
            const channel = remote.getChannel(channelName);
            if (isRemoteServiceWithChannelClientOptions(options)) {
                return instantiationService.createInstance(new descriptors_1.$yh(options.channelClientCtor, [channel]));
            }
            return ipc_1.ProxyChannel.toService(channel, options?.proxyOptions);
        }
    }
    function isRemoteServiceWithChannelClientOptions(obj) {
        const candidate = obj;
        return !!candidate?.channelClientCtor;
    }
    //#region Main Process
    let MainProcessRemoteServiceStub = class MainProcessRemoteServiceStub extends RemoteServiceStub {
        constructor(channelName, options, ipcService, instantiationService) {
            super(channelName, options, ipcService, instantiationService);
        }
    };
    MainProcessRemoteServiceStub = __decorate([
        __param(2, mainProcessService_1.$o7b),
        __param(3, instantiation_1.$Ah)
    ], MainProcessRemoteServiceStub);
    function $z7b(id, channelName, options) {
        (0, extensions_1.$mr)(id, new descriptors_1.$yh(MainProcessRemoteServiceStub, [channelName, options], true));
    }
    exports.$z7b = $z7b;
    //#endregion
    //#region Shared Process
    exports.$A7b = (0, instantiation_1.$Bh)('sharedProcessService');
    let SharedProcessRemoteServiceStub = class SharedProcessRemoteServiceStub extends RemoteServiceStub {
        constructor(channelName, options, ipcService, instantiationService) {
            super(channelName, options, ipcService, instantiationService);
        }
    };
    SharedProcessRemoteServiceStub = __decorate([
        __param(2, exports.$A7b),
        __param(3, instantiation_1.$Ah)
    ], SharedProcessRemoteServiceStub);
    function $B7b(id, channelName, options) {
        (0, extensions_1.$mr)(id, new descriptors_1.$yh(SharedProcessRemoteServiceStub, [channelName, options], true));
    }
    exports.$B7b = $B7b;
});
//#endregion
//# sourceMappingURL=services.js.map