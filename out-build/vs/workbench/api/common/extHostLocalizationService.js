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
define(["require", "exports", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostRpcService"], function (require, exports, platform_1, strings_1, uri_1, instantiation_1, log_1, extHost_protocol_1, extHostInitDataService_1, extHostRpcService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Mbc = exports.$Lbc = void 0;
    let $Lbc = class $Lbc {
        constructor(initData, rpc, f) {
            this.f = f;
            this.d = new Map();
            this.a = rpc.getProxy(extHost_protocol_1.$1J.MainThreadLocalization);
            this.b = initData.environment.appLanguage;
            this.c = this.b === platform_1.$f;
        }
        getMessage(extensionId, details) {
            const { message, args, comment } = details;
            if (this.c) {
                return (0, strings_1.$oe)(message, (args ?? {}));
            }
            let key = message;
            if (comment && comment.length > 0) {
                key += `/${Array.isArray(comment) ? comment.join('') : comment}`;
            }
            const str = this.d.get(extensionId)?.contents[key];
            if (!str) {
                this.f.warn(`Using default string since no string found in i18n bundle that has the key: ${key}`);
            }
            return (0, strings_1.$oe)(str ?? message, (args ?? {}));
        }
        getBundle(extensionId) {
            return this.d.get(extensionId)?.contents;
        }
        getBundleUri(extensionId) {
            return this.d.get(extensionId)?.uri;
        }
        async initializeLocalizedMessages(extension) {
            if (this.c
                || (!extension.l10n && !extension.isBuiltin)) {
                return;
            }
            if (this.d.has(extension.identifier.value)) {
                return;
            }
            let contents;
            const bundleUri = await this.g(extension);
            if (!bundleUri) {
                this.f.error(`No bundle location found for extension ${extension.identifier.value}`);
                return;
            }
            try {
                const response = await this.a.$fetchBundleContents(bundleUri);
                const result = JSON.parse(response);
                // 'contents.bundle' is a well-known key in the language pack json file that contains the _code_ translations for the extension
                contents = extension.isBuiltin ? result.contents?.bundle : result;
            }
            catch (e) {
                this.f.error(`Failed to load translations for ${extension.identifier.value} from ${bundleUri}: ${e.message}`);
                return;
            }
            if (contents) {
                this.d.set(extension.identifier.value, {
                    contents,
                    uri: bundleUri
                });
            }
        }
        async g(extension) {
            if (extension.isBuiltin) {
                const uri = await this.a.$fetchBuiltInBundleUri(extension.identifier.value, this.b);
                return uri_1.URI.revive(uri);
            }
            return extension.l10n
                ? uri_1.URI.joinPath(extension.extensionLocation, extension.l10n, `bundle.l10n.${this.b}.json`)
                : undefined;
        }
    };
    exports.$Lbc = $Lbc;
    exports.$Lbc = $Lbc = __decorate([
        __param(0, extHostInitDataService_1.$fM),
        __param(1, extHostRpcService_1.$2L),
        __param(2, log_1.$5i)
    ], $Lbc);
    exports.$Mbc = (0, instantiation_1.$Bh)('IExtHostLocalizationService');
});
//# sourceMappingURL=extHostLocalizationService.js.map