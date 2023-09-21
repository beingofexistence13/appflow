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
define(["require", "exports", "vs/platform/extensions/common/extensions", "vs/base/common/platform", "vs/workbench/services/environment/common/environmentService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/instantiation/common/extensions", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/network", "vs/base/common/uri", "vs/platform/extensionResourceLoader/common/extensionResourceLoader", "vs/platform/product/common/productService", "vs/platform/extensionManagement/common/extensionNls", "vs/platform/log/common/log"], function (require, exports, extensions_1, platform_1, environmentService_1, uriIdentity_1, extensions_2, extensionManagementUtil_1, network_1, uri_1, extensionResourceLoader_1, productService_1, extensionNls_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Izb = void 0;
    let $Izb = class $Izb {
        constructor(environmentService, uriIdentityService, c, productService, d) {
            this.c = c;
            this.d = d;
            this.a = [];
            if (platform_1.$o) {
                const nlsBaseUrl = productService.extensionsGallery?.nlsBaseUrl;
                // Only use the nlsBaseUrl if we are using a language other than the default, English.
                if (nlsBaseUrl && productService.commit && !platform_1.Language.isDefaultVariant()) {
                    this.b = uri_1.URI.joinPath(uri_1.URI.parse(nlsBaseUrl), productService.commit, productService.version, platform_1.Language.value());
                }
                const builtinExtensionsServiceUrl = network_1.$2f.asBrowserUri(network_1.$Xf);
                if (builtinExtensionsServiceUrl) {
                    let bundledExtensions = [];
                    if (environmentService.isBuilt) {
                        // Built time configuration (do NOT modify)
                        bundledExtensions = [ /*BUILD->INSERT_BUILTIN_EXTENSIONS*/];
                    }
                    else {
                        // Find builtin extensions by checking for DOM
                        const builtinExtensionsElement = document.getElementById('vscode-workbench-builtin-extensions');
                        const builtinExtensionsElementAttribute = builtinExtensionsElement ? builtinExtensionsElement.getAttribute('data-settings') : undefined;
                        if (builtinExtensionsElementAttribute) {
                            try {
                                bundledExtensions = JSON.parse(builtinExtensionsElementAttribute);
                            }
                            catch (error) { /* ignore error*/ }
                        }
                    }
                    this.a = bundledExtensions.map(async (e) => {
                        const id = (0, extensionManagementUtil_1.$uo)(e.packageJSON.publisher, e.packageJSON.name);
                        return {
                            identifier: { id },
                            location: uriIdentityService.extUri.joinPath(builtinExtensionsServiceUrl, e.extensionPath),
                            type: 0 /* ExtensionType.System */,
                            isBuiltin: true,
                            manifest: e.packageNLS ? await this.f(id, e.packageJSON, e.packageNLS) : e.packageJSON,
                            readmeUrl: e.readmePath ? uriIdentityService.extUri.joinPath(builtinExtensionsServiceUrl, e.readmePath) : undefined,
                            changelogUrl: e.changelogPath ? uriIdentityService.extUri.joinPath(builtinExtensionsServiceUrl, e.changelogPath) : undefined,
                            targetPlatform: "web" /* TargetPlatform.WEB */,
                            validations: [],
                            isValid: true
                        };
                    });
                }
            }
        }
        async scanBuiltinExtensions() {
            return [...await Promise.all(this.a)];
        }
        async f(extensionId, manifest, fallbackTranslations) {
            if (!this.b) {
                return (0, extensionNls_1.$np)(this.d, manifest, fallbackTranslations);
            }
            // the `package` endpoint returns the translations in a key-value format similar to the package.nls.json file.
            const uri = uri_1.URI.joinPath(this.b, extensionId, 'package');
            try {
                const res = await this.c.readExtensionResource(uri);
                const json = JSON.parse(res.toString());
                return (0, extensionNls_1.$np)(this.d, manifest, json, fallbackTranslations);
            }
            catch (e) {
                this.d.error(e);
                return (0, extensionNls_1.$np)(this.d, manifest, fallbackTranslations);
            }
        }
    };
    exports.$Izb = $Izb;
    exports.$Izb = $Izb = __decorate([
        __param(0, environmentService_1.$hJ),
        __param(1, uriIdentity_1.$Ck),
        __param(2, extensionResourceLoader_1.$2$),
        __param(3, productService_1.$kj),
        __param(4, log_1.$5i)
    ], $Izb);
    (0, extensions_2.$mr)(extensions_1.$3l, $Izb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=builtinExtensionsScannerService.js.map