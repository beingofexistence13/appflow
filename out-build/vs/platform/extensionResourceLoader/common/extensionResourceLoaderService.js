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
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/files/common/files", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/storage/common/storage", "vs/platform/environment/common/environment", "vs/platform/configuration/common/configuration", "vs/base/common/cancellation", "vs/platform/extensionResourceLoader/common/extensionResourceLoader"], function (require, exports, extensions_1, files_1, productService_1, request_1, storage_1, environment_1, configuration_1, cancellation_1, extensionResourceLoader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$u$b = void 0;
    let $u$b = class $u$b extends extensionResourceLoader_1.$4$ {
        constructor(fileService, storageService, productService, environmentService, configurationService, n) {
            super(fileService, storageService, productService, environmentService, configurationService);
            this.n = n;
        }
        async readExtensionResource(uri) {
            if (this.isExtensionGalleryResource(uri)) {
                const headers = await this.i();
                const requestContext = await this.n.request({ url: uri.toString(), headers }, cancellation_1.CancellationToken.None);
                return (await (0, request_1.$No)(requestContext)) || '';
            }
            const result = await this.d.readFile(uri);
            return result.value.toString();
        }
    };
    exports.$u$b = $u$b;
    exports.$u$b = $u$b = __decorate([
        __param(0, files_1.$6j),
        __param(1, storage_1.$Vo),
        __param(2, productService_1.$kj),
        __param(3, environment_1.$Ih),
        __param(4, configuration_1.$8h),
        __param(5, request_1.$Io)
    ], $u$b);
    (0, extensions_1.$mr)(extensionResourceLoader_1.$2$, $u$b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=extensionResourceLoaderService.js.map