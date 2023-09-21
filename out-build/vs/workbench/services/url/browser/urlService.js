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
    exports.$ST = void 0;
    class BrowserURLOpener {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        async open(resource, options) {
            if (options?.openExternal) {
                return false;
            }
            if (!(0, opener_1.$OT)(resource, this.b.urlProtocol)) {
                return false;
            }
            if (typeof resource === 'string') {
                resource = uri_1.URI.parse(resource);
            }
            return this.a.open(resource, { trusted: true });
        }
    }
    let $ST = class $ST extends urlService_1.$JT {
        constructor(environmentService, openerService, productService) {
            super();
            this.b = environmentService.options?.urlCallbackProvider;
            if (this.b) {
                this.B(this.b.onCallback(uri => this.open(uri, { trusted: true })));
            }
            this.B(openerService.registerOpener(new BrowserURLOpener(this, productService)));
        }
        create(options) {
            if (this.b) {
                return this.b.create(options);
            }
            return uri_1.URI.parse('unsupported://');
        }
    };
    exports.$ST = $ST;
    exports.$ST = $ST = __decorate([
        __param(0, environmentService_1.$LT),
        __param(1, opener_1.$NT),
        __param(2, productService_1.$kj)
    ], $ST);
    (0, extensions_1.$mr)(url_1.$IT, $ST, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=urlService.js.map