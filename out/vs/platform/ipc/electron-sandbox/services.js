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
    exports.registerSharedProcessRemoteService = exports.ISharedProcessService = exports.registerMainProcessRemoteService = void 0;
    class RemoteServiceStub {
        constructor(channelName, options, remote, instantiationService) {
            const channel = remote.getChannel(channelName);
            if (isRemoteServiceWithChannelClientOptions(options)) {
                return instantiationService.createInstance(new descriptors_1.SyncDescriptor(options.channelClientCtor, [channel]));
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
        __param(2, mainProcessService_1.IMainProcessService),
        __param(3, instantiation_1.IInstantiationService)
    ], MainProcessRemoteServiceStub);
    function registerMainProcessRemoteService(id, channelName, options) {
        (0, extensions_1.registerSingleton)(id, new descriptors_1.SyncDescriptor(MainProcessRemoteServiceStub, [channelName, options], true));
    }
    exports.registerMainProcessRemoteService = registerMainProcessRemoteService;
    //#endregion
    //#region Shared Process
    exports.ISharedProcessService = (0, instantiation_1.createDecorator)('sharedProcessService');
    let SharedProcessRemoteServiceStub = class SharedProcessRemoteServiceStub extends RemoteServiceStub {
        constructor(channelName, options, ipcService, instantiationService) {
            super(channelName, options, ipcService, instantiationService);
        }
    };
    SharedProcessRemoteServiceStub = __decorate([
        __param(2, exports.ISharedProcessService),
        __param(3, instantiation_1.IInstantiationService)
    ], SharedProcessRemoteServiceStub);
    function registerSharedProcessRemoteService(id, channelName, options) {
        (0, extensions_1.registerSingleton)(id, new descriptors_1.SyncDescriptor(SharedProcessRemoteServiceStub, [channelName, options], true));
    }
    exports.registerSharedProcessRemoteService = registerSharedProcessRemoteService;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9pcGMvZWxlY3Ryb24tc2FuZGJveC9zZXJ2aWNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFZaEcsTUFBZSxpQkFBaUI7UUFDL0IsWUFDQyxXQUFtQixFQUNuQixPQUErRixFQUMvRixNQUFjLEVBQ2Qsb0JBQTJDO1lBRTNDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFL0MsSUFBSSx1Q0FBdUMsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDckQsT0FBTyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsSUFBSSw0QkFBYyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNyRztZQUVELE9BQU8sa0JBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztRQUMvRCxDQUFDO0tBQ0Q7SUFVRCxTQUFTLHVDQUF1QyxDQUFJLEdBQVk7UUFDL0QsTUFBTSxTQUFTLEdBQUcsR0FBNEQsQ0FBQztRQUUvRSxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLENBQUM7SUFDdkMsQ0FBQztJQUVELHNCQUFzQjtJQUV0QixJQUFNLDRCQUE0QixHQUFsQyxNQUFNLDRCQUErQyxTQUFRLGlCQUFvQjtRQUNoRixZQUFZLFdBQW1CLEVBQUUsT0FBK0YsRUFBdUIsVUFBK0IsRUFBeUIsb0JBQTJDO1lBQ3pQLEtBQUssQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQy9ELENBQUM7S0FDRCxDQUFBO0lBSkssNEJBQTRCO1FBQ2tHLFdBQUEsd0NBQW1CLENBQUE7UUFBbUMsV0FBQSxxQ0FBcUIsQ0FBQTtPQUR6TSw0QkFBNEIsQ0FJakM7SUFFRCxTQUFnQixnQ0FBZ0MsQ0FBSSxFQUF3QixFQUFFLFdBQW1CLEVBQUUsT0FBb0Y7UUFDdEwsSUFBQSw4QkFBaUIsRUFBQyxFQUFFLEVBQUUsSUFBSSw0QkFBYyxDQUFDLDRCQUE0QixFQUFFLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdkcsQ0FBQztJQUZELDRFQUVDO0lBRUQsWUFBWTtJQUVaLHdCQUF3QjtJQUVYLFFBQUEscUJBQXFCLEdBQUcsSUFBQSwrQkFBZSxFQUF3QixzQkFBc0IsQ0FBQyxDQUFDO0lBb0JwRyxJQUFNLDhCQUE4QixHQUFwQyxNQUFNLDhCQUFpRCxTQUFRLGlCQUFvQjtRQUNsRixZQUFZLFdBQW1CLEVBQUUsT0FBK0YsRUFBeUIsVUFBaUMsRUFBeUIsb0JBQTJDO1lBQzdQLEtBQUssQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQy9ELENBQUM7S0FDRCxDQUFBO0lBSkssOEJBQThCO1FBQ2dHLFdBQUEsNkJBQXFCLENBQUE7UUFBcUMsV0FBQSxxQ0FBcUIsQ0FBQTtPQUQ3TSw4QkFBOEIsQ0FJbkM7SUFFRCxTQUFnQixrQ0FBa0MsQ0FBSSxFQUF3QixFQUFFLFdBQW1CLEVBQUUsT0FBb0Y7UUFDeEwsSUFBQSw4QkFBaUIsRUFBQyxFQUFFLEVBQUUsSUFBSSw0QkFBYyxDQUFDLDhCQUE4QixFQUFFLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDekcsQ0FBQztJQUZELGdGQUVDOztBQUVELFlBQVkifQ==