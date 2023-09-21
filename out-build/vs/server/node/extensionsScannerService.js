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
define(["require", "exports", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile", "vs/server/node/remoteLanguagePacks"], function (require, exports, resources_1, uri_1, environment_1, extensionsProfileScannerService_1, extensionsScannerService_1, files_1, instantiation_1, log_1, productService_1, uriIdentity_1, userDataProfile_1, remoteLanguagePacks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$M = void 0;
    let $$M = class $$M extends extensionsScannerService_1.$pp {
        constructor(userDataProfilesService, extensionsProfileScannerService, fileService, logService, R, productService, uriIdentityService, instantiationService) {
            super(uri_1.URI.file(R.builtinExtensionsPath), uri_1.URI.file(R.extensionsPath), (0, resources_1.$ig)(R.userHome, '.vscode-oss-dev', 'extensions', 'control.json'), userDataProfilesService.defaultProfile, userDataProfilesService, extensionsProfileScannerService, fileService, logService, R, productService, uriIdentityService, instantiationService);
            this.R = R;
        }
        async f(language) {
            const config = await (0, remoteLanguagePacks_1.$gl)(language, this.R.userDataPath);
            if (remoteLanguagePacks_1.InternalNLSConfiguration.is(config)) {
                try {
                    const content = await this.w.readFile(uri_1.URI.file(config._translationsConfigFile));
                    return JSON.parse(content.value.toString());
                }
                catch (err) { /* Ignore error */ }
            }
            return Object.create(null);
        }
    };
    exports.$$M = $$M;
    exports.$$M = $$M = __decorate([
        __param(0, userDataProfile_1.$Ek),
        __param(1, extensionsProfileScannerService_1.$kp),
        __param(2, files_1.$6j),
        __param(3, log_1.$5i),
        __param(4, environment_1.$Jh),
        __param(5, productService_1.$kj),
        __param(6, uriIdentity_1.$Ck),
        __param(7, instantiation_1.$Ah)
    ], $$M);
});
//# sourceMappingURL=extensionsScannerService.js.map