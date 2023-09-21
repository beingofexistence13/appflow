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
    exports.IExtHostLocalizationService = exports.ExtHostLocalizationService = void 0;
    let ExtHostLocalizationService = class ExtHostLocalizationService {
        constructor(initData, rpc, logService) {
            this.logService = logService;
            this.bundleCache = new Map();
            this._proxy = rpc.getProxy(extHost_protocol_1.MainContext.MainThreadLocalization);
            this.currentLanguage = initData.environment.appLanguage;
            this.isDefaultLanguage = this.currentLanguage === platform_1.LANGUAGE_DEFAULT;
        }
        getMessage(extensionId, details) {
            const { message, args, comment } = details;
            if (this.isDefaultLanguage) {
                return (0, strings_1.format2)(message, (args ?? {}));
            }
            let key = message;
            if (comment && comment.length > 0) {
                key += `/${Array.isArray(comment) ? comment.join('') : comment}`;
            }
            const str = this.bundleCache.get(extensionId)?.contents[key];
            if (!str) {
                this.logService.warn(`Using default string since no string found in i18n bundle that has the key: ${key}`);
            }
            return (0, strings_1.format2)(str ?? message, (args ?? {}));
        }
        getBundle(extensionId) {
            return this.bundleCache.get(extensionId)?.contents;
        }
        getBundleUri(extensionId) {
            return this.bundleCache.get(extensionId)?.uri;
        }
        async initializeLocalizedMessages(extension) {
            if (this.isDefaultLanguage
                || (!extension.l10n && !extension.isBuiltin)) {
                return;
            }
            if (this.bundleCache.has(extension.identifier.value)) {
                return;
            }
            let contents;
            const bundleUri = await this.getBundleLocation(extension);
            if (!bundleUri) {
                this.logService.error(`No bundle location found for extension ${extension.identifier.value}`);
                return;
            }
            try {
                const response = await this._proxy.$fetchBundleContents(bundleUri);
                const result = JSON.parse(response);
                // 'contents.bundle' is a well-known key in the language pack json file that contains the _code_ translations for the extension
                contents = extension.isBuiltin ? result.contents?.bundle : result;
            }
            catch (e) {
                this.logService.error(`Failed to load translations for ${extension.identifier.value} from ${bundleUri}: ${e.message}`);
                return;
            }
            if (contents) {
                this.bundleCache.set(extension.identifier.value, {
                    contents,
                    uri: bundleUri
                });
            }
        }
        async getBundleLocation(extension) {
            if (extension.isBuiltin) {
                const uri = await this._proxy.$fetchBuiltInBundleUri(extension.identifier.value, this.currentLanguage);
                return uri_1.URI.revive(uri);
            }
            return extension.l10n
                ? uri_1.URI.joinPath(extension.extensionLocation, extension.l10n, `bundle.l10n.${this.currentLanguage}.json`)
                : undefined;
        }
    };
    exports.ExtHostLocalizationService = ExtHostLocalizationService;
    exports.ExtHostLocalizationService = ExtHostLocalizationService = __decorate([
        __param(0, extHostInitDataService_1.IExtHostInitDataService),
        __param(1, extHostRpcService_1.IExtHostRpcService),
        __param(2, log_1.ILogService)
    ], ExtHostLocalizationService);
    exports.IExtHostLocalizationService = (0, instantiation_1.createDecorator)('IExtHostLocalizationService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdExvY2FsaXphdGlvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2NvbW1vbi9leHRIb3N0TG9jYWxpemF0aW9uU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFZekYsSUFBTSwwQkFBMEIsR0FBaEMsTUFBTSwwQkFBMEI7UUFTdEMsWUFDMEIsUUFBaUMsRUFDdEMsR0FBdUIsRUFDOUIsVUFBd0M7WUFBdkIsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUxyQyxnQkFBVyxHQUFtRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBT3hHLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyw4QkFBVyxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQztZQUN4RCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGVBQWUsS0FBSywyQkFBZ0IsQ0FBQztRQUNwRSxDQUFDO1FBRUQsVUFBVSxDQUFDLFdBQW1CLEVBQUUsT0FBdUI7WUFDdEQsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDO1lBQzNDLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUMzQixPQUFPLElBQUEsaUJBQU8sRUFBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN0QztZQUVELElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQztZQUNsQixJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDbEMsR0FBRyxJQUFJLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FB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