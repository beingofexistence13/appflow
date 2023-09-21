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
define(["require", "exports", "vs/nls", "vs/base/common/platform", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/localization/common/locale", "vs/workbench/services/host/browser/host", "vs/platform/product/common/productService", "vs/platform/instantiation/common/extensions", "vs/base/common/cancellation", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/log/common/log"], function (require, exports, nls_1, platform_1, dialogs_1, locale_1, host_1, productService_1, extensions_1, cancellation_1, extensionManagement_1, log_1) {
    "use strict";
    var WebLocaleService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebLocaleService = void 0;
    let WebLocaleService = class WebLocaleService {
        static { WebLocaleService_1 = this; }
        static { this._LOCAL_STORAGE_EXTENSION_ID_KEY = 'vscode.nls.languagePackExtensionId'; }
        static { this._LOCAL_STORAGE_LOCALE_KEY = 'vscode.nls.locale'; }
        constructor(dialogService, hostService, productService) {
            this.dialogService = dialogService;
            this.hostService = hostService;
            this.productService = productService;
        }
        async setLocale(languagePackItem, _skipDialog = false) {
            const locale = languagePackItem.id;
            if (locale === platform_1.Language.value() || (!locale && platform_1.Language.value() === navigator.language.toLowerCase())) {
                return;
            }
            if (locale) {
                window.localStorage.setItem(WebLocaleService_1._LOCAL_STORAGE_LOCALE_KEY, locale);
                if (languagePackItem.extensionId) {
                    window.localStorage.setItem(WebLocaleService_1._LOCAL_STORAGE_EXTENSION_ID_KEY, languagePackItem.extensionId);
                }
            }
            else {
                window.localStorage.removeItem(WebLocaleService_1._LOCAL_STORAGE_LOCALE_KEY);
                window.localStorage.removeItem(WebLocaleService_1._LOCAL_STORAGE_EXTENSION_ID_KEY);
            }
            const restartDialog = await this.dialogService.confirm({
                type: 'info',
                message: (0, nls_1.localize)('relaunchDisplayLanguageMessage', "To change the display language, {0} needs to reload", this.productService.nameLong),
                detail: (0, nls_1.localize)('relaunchDisplayLanguageDetail', "Press the reload button to refresh the page and set the display language to {0}.", languagePackItem.label),
                primaryButton: (0, nls_1.localize)({ key: 'reload', comment: ['&& denotes a mnemonic character'] }, "&&Reload"),
            });
            if (restartDialog.confirmed) {
                this.hostService.restart();
            }
        }
        async clearLocalePreference() {
            window.localStorage.removeItem(WebLocaleService_1._LOCAL_STORAGE_LOCALE_KEY);
            window.localStorage.removeItem(WebLocaleService_1._LOCAL_STORAGE_EXTENSION_ID_KEY);
            if (platform_1.Language.value() === navigator.language.toLowerCase()) {
                return;
            }
            const restartDialog = await this.dialogService.confirm({
                type: 'info',
                message: (0, nls_1.localize)('clearDisplayLanguageMessage', "To change the display language, {0} needs to reload", this.productService.nameLong),
                detail: (0, nls_1.localize)('clearDisplayLanguageDetail', "Press the reload button to refresh the page and use your browser's language."),
                primaryButton: (0, nls_1.localize)({ key: 'reload', comment: ['&& denotes a mnemonic character'] }, "&&Reload"),
            });
            if (restartDialog.confirmed) {
                this.hostService.restart();
            }
        }
    };
    exports.WebLocaleService = WebLocaleService;
    exports.WebLocaleService = WebLocaleService = WebLocaleService_1 = __decorate([
        __param(0, dialogs_1.IDialogService),
        __param(1, host_1.IHostService),
        __param(2, productService_1.IProductService)
    ], WebLocaleService);
    let WebActiveLanguagePackService = class WebActiveLanguagePackService {
        constructor(galleryService, logService) {
            this.galleryService = galleryService;
            this.logService = logService;
        }
        async getExtensionIdProvidingCurrentLocale() {
            const language = platform_1.Language.value();
            if (language === platform_1.LANGUAGE_DEFAULT) {
                return undefined;
            }
            const extensionId = window.localStorage.getItem(WebLocaleService._LOCAL_STORAGE_EXTENSION_ID_KEY);
            if (extensionId) {
                return extensionId;
            }
            if (!this.galleryService.isEnabled()) {
                return undefined;
            }
            try {
                const tagResult = await this.galleryService.query({ text: `tag:lp-${language}` }, cancellation_1.CancellationToken.None);
                // Only install extensions that are published by Microsoft and start with vscode-language-pack for extra certainty
                const extensionToInstall = tagResult.firstPage.find(e => e.publisher === 'MS-CEINTL' && e.name.startsWith('vscode-language-pack'));
                if (extensionToInstall) {
                    window.localStorage.setItem(WebLocaleService._LOCAL_STORAGE_EXTENSION_ID_KEY, extensionToInstall.identifier.id);
                    return extensionToInstall.identifier.id;
                }
                // TODO: If a non-Microsoft language pack is installed, we should prompt the user asking if they want to install that.
                // Since no such language packs exist yet, we can wait until that happens to implement this.
            }
            catch (e) {
                // Best effort
                this.logService.error(e);
            }
            return undefined;
        }
    };
    WebActiveLanguagePackService = __decorate([
        __param(0, extensionManagement_1.IExtensionGalleryService),
        __param(1, log_1.ILogService)
    ], WebActiveLanguagePackService);
    (0, extensions_1.registerSingleton)(locale_1.ILocaleService, WebLocaleService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.registerSingleton)(locale_1.IActiveLanguagePackService, WebActiveLanguagePackService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxlU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9sb2NhbGl6YXRpb24vYnJvd3Nlci9sb2NhbGVTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFjekYsSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBZ0I7O2lCQUVaLG9DQUErQixHQUFHLG9DQUFvQyxBQUF2QyxDQUF3QztpQkFDdkUsOEJBQXlCLEdBQUcsbUJBQW1CLEFBQXRCLENBQXVCO1FBRWhFLFlBQ2tDLGFBQTZCLEVBQy9CLFdBQXlCLEVBQ3RCLGNBQStCO1lBRmhDLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUMvQixnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUN0QixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7UUFDOUQsQ0FBQztRQUVMLEtBQUssQ0FBQyxTQUFTLENBQUMsZ0JBQW1DLEVBQUUsV0FBVyxHQUFHLEtBQUs7WUFDdkUsTUFBTSxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO1lBQ25DLElBQUksTUFBTSxLQUFLLG1CQUFRLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxtQkFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLFNBQVMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRTtnQkFDdEcsT0FBTzthQUNQO1lBQ0QsSUFBSSxNQUFNLEVBQUU7Z0JBQ1gsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsa0JBQWdCLENBQUMseUJBQXlCLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ2hGLElBQUksZ0JBQWdCLENBQUMsV0FBVyxFQUFFO29CQUNqQyxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxrQkFBZ0IsQ0FBQywrQkFBK0IsRUFBRSxnQkFBZ0Is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