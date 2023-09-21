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
define(["require", "exports", "vs/platform/url/common/url", "vs/base/common/uri", "vs/platform/instantiation/common/extensions", "vs/platform/url/common/urlService", "vs/workbench/services/environment/browser/environmentService", "vs/platform/opener/common/opener", "vs/platform/product/common/productService"], function (require, exports, url_1, uri_1, extensions_1, urlService_1, environmentService_1, opener_1, productService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserURLService = void 0;
    class BrowserURLOpener {
        constructor(urlService, productService) {
            this.urlService = urlService;
            this.productService = productService;
        }
        async open(resource, options) {
            if (options?.openExternal) {
                return false;
            }
            if (!(0, opener_1.matchesScheme)(resource, this.productService.urlProtocol)) {
                return false;
            }
            if (typeof resource === 'string') {
                resource = uri_1.URI.parse(resource);
            }
            return this.urlService.open(resource, { trusted: true });
        }
    }
    let BrowserURLService = class BrowserURLService extends urlService_1.AbstractURLService {
        constructor(environmentService, openerService, productService) {
            super();
            this.provider = environmentService.options?.urlCallbackProvider;
            if (this.provider) {
                this._register(this.provider.onCallback(uri => this.open(uri, { trusted: true })));
            }
            this._register(openerService.registerOpener(new BrowserURLOpener(this, productService)));
        }
        create(options) {
            if (this.provider) {
                return this.provider.create(options);
            }
            return uri_1.URI.parse('unsupported://');
        }
    };
    exports.BrowserURLService = BrowserURLService;
    exports.BrowserURLService = BrowserURLService = __decorate([
        __param(0, environmentService_1.IBrowserWorkbenchEnvironmentService),
        __param(1, opener_1.IOpenerService),
        __param(2, productService_1.IProductService)
    ], BrowserURLService);
    (0, extensions_1.registerSingleton)(url_1.IURLService, BrowserURLService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91cmwvYnJvd3Nlci91cmxTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXFDaEcsTUFBTSxnQkFBZ0I7UUFFckIsWUFDUyxVQUF1QixFQUN2QixjQUErQjtZQUQvQixlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ3ZCLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtRQUNwQyxDQUFDO1FBRUwsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFzQixFQUFFLE9BQW1EO1lBQ3JGLElBQUssT0FBMkMsRUFBRSxZQUFZLEVBQUU7Z0JBQy9ELE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxJQUFJLENBQUMsSUFBQSxzQkFBYSxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUM5RCxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUU7Z0JBQ2pDLFFBQVEsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQy9CO1lBRUQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUMxRCxDQUFDO0tBQ0Q7SUFFTSxJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLCtCQUFrQjtRQUl4RCxZQUNzQyxrQkFBdUQsRUFDNUUsYUFBNkIsRUFDNUIsY0FBK0I7WUFFaEQsS0FBSyxFQUFFLENBQUM7WUFFUixJQUFJLENBQUMsUUFBUSxHQUFHLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQztZQUVoRSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNuRjtZQUVELElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxJQUFJLGdCQUFnQixDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUYsQ0FBQztRQUVELE1BQU0sQ0FBQyxPQUFnQztZQUN0QyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDckM7WUFFRCxPQUFPLFNBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNwQyxDQUFDO0tBQ0QsQ0FBQTtJQTNCWSw4Q0FBaUI7Z0NBQWpCLGlCQUFpQjtRQUszQixXQUFBLHdEQUFtQyxDQUFBO1FBQ25DLFdBQUEsdUJBQWMsQ0FBQTtRQUNkLFdBQUEsZ0NBQWUsQ0FBQTtPQVBMLGlCQUFpQixDQTJCN0I7SUFFRCxJQUFBLDhCQUFpQixFQUFDLGlCQUFXLEVBQUUsaUJBQWlCLG9DQUE0QixDQUFDIn0=