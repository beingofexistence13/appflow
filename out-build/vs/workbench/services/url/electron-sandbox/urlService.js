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
    exports.$C_b = void 0;
    let $C_b = class $C_b extends urlService_1.$KT {
        constructor(mainProcessService, openerService, f, productService, g) {
            super(productService);
            this.f = f;
            this.g = g;
            this.c = ipc_1.ProxyChannel.toService(mainProcessService.getChannel('url'));
            mainProcessService.registerChannel('urlHandler', new urlIpc_1.$L6b(this));
            openerService.registerOpener(this);
        }
        create(options) {
            const uri = super.create(options);
            let query = uri.query;
            if (!query) {
                query = `windowId=${encodeURIComponent(this.f.windowId)}`;
            }
            else {
                query += `&windowId=${encodeURIComponent(this.f.windowId)}`;
            }
            return uri.with({ query });
        }
        async open(resource, options) {
            if (!(0, opener_1.$OT)(resource, this.b.urlProtocol)) {
                return false;
            }
            if (typeof resource === 'string') {
                resource = uri_1.URI.parse(resource);
            }
            return await this.c.open(resource, options);
        }
        async handleURL(uri, options) {
            const result = await super.open(uri, options);
            if (result) {
                this.g.trace('URLService#handleURL(): handled', uri.toString(true));
                await this.f.focusWindow({ force: true /* Application may not be active */ });
            }
            else {
                this.g.trace('URLService#handleURL(): not handled', uri.toString(true));
            }
            return result;
        }
    };
    exports.$C_b = $C_b;
    exports.$C_b = $C_b = __decorate([
        __param(0, mainProcessService_1.$o7b),
        __param(1, opener_1.$NT),
        __param(2, native_1.$05b),
        __param(3, productService_1.$kj),
        __param(4, log_1.$5i)
    ], $C_b);
    (0, extensions_1.$mr)(url_1.$IT, $C_b, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=urlService.js.map