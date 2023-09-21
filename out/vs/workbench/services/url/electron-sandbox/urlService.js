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
define(["require", "exports", "vs/platform/url/common/url", "vs/base/common/uri", "vs/platform/ipc/common/mainProcessService", "vs/platform/url/common/urlIpc", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/instantiation/common/extensions", "vs/base/parts/ipc/common/ipc", "vs/platform/native/common/native", "vs/platform/url/common/urlService", "vs/platform/log/common/log"], function (require, exports, url_1, uri_1, mainProcessService_1, urlIpc_1, opener_1, productService_1, extensions_1, ipc_1, native_1, urlService_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RelayURLService = void 0;
    let RelayURLService = class RelayURLService extends urlService_1.NativeURLService {
        constructor(mainProcessService, openerService, nativeHostService, productService, logService) {
            super(productService);
            this.nativeHostService = nativeHostService;
            this.logService = logService;
            this.urlService = ipc_1.ProxyChannel.toService(mainProcessService.getChannel('url'));
            mainProcessService.registerChannel('urlHandler', new urlIpc_1.URLHandlerChannel(this));
            openerService.registerOpener(this);
        }
        create(options) {
            const uri = super.create(options);
            let query = uri.query;
            if (!query) {
                query = `windowId=${encodeURIComponent(this.nativeHostService.windowId)}`;
            }
            else {
                query += `&windowId=${encodeURIComponent(this.nativeHostService.windowId)}`;
            }
            return uri.with({ query });
        }
        async open(resource, options) {
            if (!(0, opener_1.matchesScheme)(resource, this.productService.urlProtocol)) {
                return false;
            }
            if (typeof resource === 'string') {
                resource = uri_1.URI.parse(resource);
            }
            return await this.urlService.open(resource, options);
        }
        async handleURL(uri, options) {
            const result = await super.open(uri, options);
            if (result) {
                this.logService.trace('URLService#handleURL(): handled', uri.toString(true));
                await this.nativeHostService.focusWindow({ force: true /* Application may not be active */ });
            }
            else {
                this.logService.trace('URLService#handleURL(): not handled', uri.toString(true));
            }
            return result;
        }
    };
    exports.RelayURLService = RelayURLService;
    exports.RelayURLService = RelayURLService = __decorate([
        __param(0, mainProcessService_1.IMainProcessService),
        __param(1, opener_1.IOpenerService),
        __param(2, native_1.INativeHostService),
        __param(3, productService_1.IProductService),
        __param(4, log_1.ILogService)
    ], RelayURLService);
    (0, extensions_1.registerSingleton)(url_1.IURLService, RelayURLService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91cmwvZWxlY3Ryb24tc2FuZGJveC91cmxTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW1CekYsSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZ0IsU0FBUSw2QkFBZ0I7UUFJcEQsWUFDc0Isa0JBQXVDLEVBQzVDLGFBQTZCLEVBQ1IsaUJBQXFDLEVBQ3pELGNBQStCLEVBQ2xCLFVBQXVCO1lBRXJELEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUplLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFFNUMsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUlyRCxJQUFJLENBQUMsVUFBVSxHQUFHLGtCQUFZLENBQUMsU0FBUyxDQUFjLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRTVGLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsSUFBSSwwQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzlFLGFBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVRLE1BQU0sQ0FBQyxPQUFnQztZQUMvQyxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRWxDLElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFDdEIsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDWCxLQUFLLEdBQUcsWUFBWSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQzthQUMxRTtpQkFBTTtnQkFDTixLQUFLLElBQUksYUFBYSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQzthQUM1RTtZQUVELE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVRLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBc0IsRUFBRSxPQUE4QjtZQUV6RSxJQUFJLENBQUMsSUFBQSxzQkFBYSxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUM5RCxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUU7Z0JBQ2pDLFFBQVEsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQy9CO1lBQ0QsT0FBTyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFRLEVBQUUsT0FBeUI7WUFDbEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUU5QyxJQUFJLE1BQU0sRUFBRTtnQkFDWCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRTdFLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsbUNBQW1DLEVBQUUsQ0FBQyxDQUFDO2FBQzlGO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNqRjtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztLQUNELENBQUE7SUF6RFksMENBQWU7OEJBQWYsZUFBZTtRQUt6QixXQUFBLHdDQUFtQixDQUFBO1FBQ25CLFdBQUEsdUJBQWMsQ0FBQTtRQUNkLFdBQUEsMkJBQWtCLENBQUE7UUFDbEIsV0FBQSxnQ0FBZSxDQUFBO1FBQ2YsV0FBQSxpQkFBVyxDQUFBO09BVEQsZUFBZSxDQXlEM0I7SUFFRCxJQUFBLDhCQUFpQixFQUFDLGlCQUFXLEVBQUUsZUFBZSxrQ0FBMEIsQ0FBQyJ9