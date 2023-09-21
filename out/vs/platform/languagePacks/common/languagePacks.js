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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/nls", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/instantiation/common/instantiation"], function (require, exports, cancellation_1, lifecycle_1, platform_1, nls_1, extensionManagement_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LanguagePackBaseService = exports.ILanguagePackService = exports.getLocale = void 0;
    function getLocale(extension) {
        return extension.tags.find(t => t.startsWith('lp-'))?.split('lp-')[1];
    }
    exports.getLocale = getLocale;
    exports.ILanguagePackService = (0, instantiation_1.createDecorator)('languagePackService');
    let LanguagePackBaseService = class LanguagePackBaseService extends lifecycle_1.Disposable {
        constructor(extensionGalleryService) {
            super();
            this.extensionGalleryService = extensionGalleryService;
        }
        async getAvailableLanguages() {
            const timeout = new cancellation_1.CancellationTokenSource();
            setTimeout(() => timeout.cancel(), 1000);
            let result;
            try {
                result = await this.extensionGalleryService.query({
                    text: 'category:"language packs"',
                    pageSize: 20
                }, timeout.token);
            }
            catch (_) {
                // This method is best effort. So, we ignore any errors.
                return [];
            }
            const languagePackExtensions = result.firstPage.filter(e => e.properties.localizedLanguages?.length && e.tags.some(t => t.startsWith('lp-')));
            const allFromMarketplace = languagePackExtensions.map(lp => {
                const languageName = lp.properties.localizedLanguages?.[0];
                const locale = getLocale(lp);
                const baseQuickPick = this.createQuickPickItem(locale, languageName, lp);
                return {
                    ...baseQuickPick,
                    extensionId: lp.identifier.id,
                    galleryExtension: lp
                };
            });
            allFromMarketplace.push(this.createQuickPickItem('en', 'English'));
            return allFromMarketplace;
        }
        createQuickPickItem(locale, languageName, languagePack) {
            const label = languageName ?? locale;
            let description;
            if (label !== locale) {
                description = `(${locale})`;
            }
            if (locale.toLowerCase() === platform_1.language.toLowerCase()) {
                description ??= '';
                description += (0, nls_1.localize)('currentDisplayLanguage', " (Current)");
            }
            if (languagePack?.installCount) {
                description ??= '';
                const count = languagePack.installCount;
                let countLabel;
                if (count > 1000000) {
                    countLabel = `${Math.floor(count / 100000) / 10}M`;
                }
                else if (count > 1000) {
                    countLabel = `${Math.floor(count / 1000)}K`;
                }
                else {
                    countLabel = String(count);
                }
                description += ` $(cloud-download) ${countLabel}`;
            }
            return {
                id: locale,
                label,
                description
            };
        }
    };
    exports.LanguagePackBaseService = LanguagePackBaseService;
    exports.LanguagePackBaseService = LanguagePackBaseService = __decorate([
        __param(0, extensionManagement_1.IExtensionGalleryService)
    ], LanguagePackBaseService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VQYWNrcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2xhbmd1YWdlUGFja3MvY29tbW9uL2xhbmd1YWdlUGFja3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBV2hHLFNBQWdCLFNBQVMsQ0FBQyxTQUE0QjtRQUNyRCxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRkQsOEJBRUM7SUFFWSxRQUFBLG9CQUFvQixHQUFHLElBQUEsK0JBQWUsRUFBdUIscUJBQXFCLENBQUMsQ0FBQztJQWMxRixJQUFlLHVCQUF1QixHQUF0QyxNQUFlLHVCQUF3QixTQUFRLHNCQUFVO1FBRy9ELFlBQXlELHVCQUFpRDtZQUN6RyxLQUFLLEVBQUUsQ0FBQztZQURnRCw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQTBCO1FBRTFHLENBQUM7UUFNRCxLQUFLLENBQUMscUJBQXFCO1lBQzFCLE1BQU0sT0FBTyxHQUFHLElBQUksc0NBQXVCLEVBQUUsQ0FBQztZQUM5QyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRXpDLElBQUksTUFBTSxDQUFDO1lBQ1gsSUFBSTtnQkFDSCxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDO29CQUNqRCxJQUFJLEVBQUUsMkJBQTJCO29CQUNqQyxRQUFRLEVBQUUsRUFBRTtpQkFDWixFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNsQjtZQUFDLE9BQU8sQ0FBQyxF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