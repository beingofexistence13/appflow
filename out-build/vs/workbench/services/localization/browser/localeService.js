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
define(["require", "exports", "vs/nls!vs/workbench/services/localization/browser/localeService", "vs/base/common/platform", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/localization/common/locale", "vs/workbench/services/host/browser/host", "vs/platform/product/common/productService", "vs/platform/instantiation/common/extensions", "vs/base/common/cancellation", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/log/common/log"], function (require, exports, nls_1, platform_1, dialogs_1, locale_1, host_1, productService_1, extensions_1, cancellation_1, extensionManagement_1, log_1) {
    "use strict";
    var $d4b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$d4b = void 0;
    let $d4b = class $d4b {
        static { $d4b_1 = this; }
        static { this._LOCAL_STORAGE_EXTENSION_ID_KEY = 'vscode.nls.languagePackExtensionId'; }
        static { this._LOCAL_STORAGE_LOCALE_KEY = 'vscode.nls.locale'; }
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        async setLocale(languagePackItem, _skipDialog = false) {
            const locale = languagePackItem.id;
            if (locale === platform_1.Language.value() || (!locale && platform_1.Language.value() === navigator.language.toLowerCase())) {
                return;
            }
            if (locale) {
                window.localStorage.setItem($d4b_1._LOCAL_STORAGE_LOCALE_KEY, locale);
                if (languagePackItem.extensionId) {
                    window.localStorage.setItem($d4b_1._LOCAL_STORAGE_EXTENSION_ID_KEY, languagePackItem.extensionId);
                }
            }
            else {
                window.localStorage.removeItem($d4b_1._LOCAL_STORAGE_LOCALE_KEY);
                window.localStorage.removeItem($d4b_1._LOCAL_STORAGE_EXTENSION_ID_KEY);
            }
            const restartDialog = await this.a.confirm({
                type: 'info',
                message: (0, nls_1.localize)(0, null, this.c.nameLong),
                detail: (0, nls_1.localize)(1, null, languagePackItem.label),
                primaryButton: (0, nls_1.localize)(2, null),
            });
            if (restartDialog.confirmed) {
                this.b.restart();
            }
        }
        async clearLocalePreference() {
            window.localStorage.removeItem($d4b_1._LOCAL_STORAGE_LOCALE_KEY);
            window.localStorage.removeItem($d4b_1._LOCAL_STORAGE_EXTENSION_ID_KEY);
            if (platform_1.Language.value() === navigator.language.toLowerCase()) {
                return;
            }
            const restartDialog = await this.a.confirm({
                type: 'info',
                message: (0, nls_1.localize)(3, null, this.c.nameLong),
                detail: (0, nls_1.localize)(4, null),
                primaryButton: (0, nls_1.localize)(5, null),
            });
            if (restartDialog.confirmed) {
                this.b.restart();
            }
        }
    };
    exports.$d4b = $d4b;
    exports.$d4b = $d4b = $d4b_1 = __decorate([
        __param(0, dialogs_1.$oA),
        __param(1, host_1.$VT),
        __param(2, productService_1.$kj)
    ], $d4b);
    let WebActiveLanguagePackService = class WebActiveLanguagePackService {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }
        async getExtensionIdProvidingCurrentLocale() {
            const language = platform_1.Language.value();
            if (language === platform_1.$f) {
                return undefined;
            }
            const extensionId = window.localStorage.getItem($d4b._LOCAL_STORAGE_EXTENSION_ID_KEY);
            if (extensionId) {
                return extensionId;
            }
            if (!this.a.isEnabled()) {
                return undefined;
            }
            try {
                const tagResult = await this.a.query({ text: `tag:lp-${language}` }, cancellation_1.CancellationToken.None);
                // Only install extensions that are published by Microsoft and start with vscode-language-pack for extra certainty
                const extensionToInstall = tagResult.firstPage.find(e => e.publisher === 'MS-CEINTL' && e.name.startsWith('vscode-language-pack'));
                if (extensionToInstall) {
                    window.localStorage.setItem($d4b._LOCAL_STORAGE_EXTENSION_ID_KEY, extensionToInstall.identifier.id);
                    return extensionToInstall.identifier.id;
                }
                // TODO: If a non-Microsoft language pack is installed, we should prompt the user asking if they want to install that.
                // Since no such language packs exist yet, we can wait until that happens to implement this.
            }
            catch (e) {
                // Best effort
                this.b.error(e);
            }
            return undefined;
        }
    };
    WebActiveLanguagePackService = __decorate([
        __param(0, extensionManagement_1.$Zn),
        __param(1, log_1.$5i)
    ], WebActiveLanguagePackService);
    (0, extensions_1.$mr)(locale_1.$khb, $d4b, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(locale_1.$lhb, WebActiveLanguagePackService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=localeService.js.map