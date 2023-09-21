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
define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/base/common/platform", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/notification/common/notification", "vs/base/common/severity", "vs/platform/storage/common/storage", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/localization/electron-sandbox/minimalTranslations", "vs/platform/telemetry/common/telemetry", "vs/base/common/cancellation", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/services/localization/common/locale", "vs/platform/product/common/productService", "vs/workbench/contrib/localization/common/localization.contribution"], function (require, exports, nls_1, platform_1, contributions_1, platform, extensionManagement_1, notification_1, severity_1, storage_1, extensions_1, minimalTranslations_1, telemetry_1, cancellation_1, panecomposite_1, locale_1, productService_1, localization_contribution_1) {
    "use strict";
    var NativeLocalizationWorkbenchContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    let NativeLocalizationWorkbenchContribution = class NativeLocalizationWorkbenchContribution extends localization_contribution_1.BaseLocalizationWorkbenchContribution {
        static { NativeLocalizationWorkbenchContribution_1 = this; }
        static { this.LANGUAGEPACK_SUGGESTION_IGNORE_STORAGE_KEY = 'extensionsAssistant/languagePackSuggestionIgnore'; }
        constructor(notificationService, localeService, productService, storageService, extensionManagementService, galleryService, paneCompositeService, telemetryService) {
            super();
            this.notificationService = notificationService;
            this.localeService = localeService;
            this.productService = productService;
            this.storageService = storageService;
            this.extensionManagementService = extensionManagementService;
            this.galleryService = galleryService;
            this.paneCompositeService = paneCompositeService;
            this.telemetryService = telemetryService;
            this.checkAndInstall();
            this._register(this.extensionManagementService.onDidInstallExtensions(e => this.onDidInstallExtensions(e)));
            this._register(this.extensionManagementService.onDidUninstallExtension(e => this.onDidUninstallExtension(e)));
        }
        async onDidInstallExtensions(results) {
            for (const result of results) {
                if (result.operation === 2 /* InstallOperation.Install */ && result.local) {
                    await this.onDidInstallExtension(result.local, !!result.context?.extensionsSync);
                }
            }
        }
        async onDidInstallExtension(localExtension, fromSettingsSync) {
            const localization = localExtension.manifest.contributes?.localizations?.[0];
            if (!localization || platform.language === localization.languageId) {
                return;
            }
            const { languageId, languageName } = localization;
            this.notificationService.prompt(severity_1.default.Info, (0, nls_1.localize)('updateLocale', "Would you like to change {0}'s display language to {1} and restart?", this.productService.nameLong, languageName || languageId), [{
                    label: (0, nls_1.localize)('changeAndRestart', "Change Language and Restart"),
                    run: async () => {
                        await this.localeService.setLocale({
                            id: languageId,
                            label: languageName ?? languageId,
                            extensionId: localExtension.identifier.id,
                            // If settings sync installs the language pack, then we would have just shown the notification so no
                            // need to show the dialog.
                        }, true);
                    }
                }], {
                sticky: true,
                neverShowAgain: { id: 'langugage.update.donotask', isSecondary: true, scope: notification_1.NeverShowAgainScope.APPLICATION }
            });
        }
        async onDidUninstallExtension(_event) {
            if (!await this.isLocaleInstalled(platform.language)) {
                this.localeService.setLocale({
                    id: 'en',
                    label: 'English'
                });
            }
        }
        async checkAndInstall() {
            const language = platform.language;
            let locale = platform.locale ?? '';
            const languagePackSuggestionIgnoreList = JSON.parse(this.storageService.get(NativeLocalizationWorkbenchContribution_1.LANGUAGEPACK_SUGGESTION_IGNORE_STORAGE_KEY, -1 /* StorageScope.APPLICATION */, '[]'));
            if (!this.galleryService.isEnabled()) {
                return;
            }
            if (!language || !locale || locale === 'en' || locale.indexOf('en-') === 0) {
                return;
            }
            if (locale.startsWith(language) || languagePackSuggestionIgnoreList.includes(locale)) {
                return;
            }
            const installed = await this.isLocaleInstalled(locale);
            if (installed) {
                return;
            }
            const fullLocale = locale;
            let tagResult = await this.galleryService.query({ text: `tag:lp-${locale}` }, cancellation_1.CancellationToken.None);
            if (tagResult.total === 0) {
                // Trim the locale and try again.
                locale = locale.split('-')[0];
                tagResult = await this.galleryService.query({ text: `tag:lp-${locale}` }, cancellation_1.CancellationToken.None);
                if (tagResult.total === 0) {
                    return;
                }
            }
            const extensionToInstall = tagResult.total === 1 ? tagResult.firstPage[0] : tagResult.firstPage.find(e => e.publisher === 'MS-CEINTL' && e.name.startsWith('vscode-language-pack'));
            const extensionToFetchTranslationsFrom = extensionToInstall ?? tagResult.firstPage[0];
            if (!extensionToFetchTranslationsFrom.assets.manifest) {
                return;
            }
            const [manifest, translation] = await Promise.all([
                this.galleryService.getManifest(extensionToFetchTranslationsFrom, cancellation_1.CancellationToken.None),
                this.galleryService.getCoreTranslation(extensionToFetchTranslationsFrom, locale)
            ]);
            const loc = manifest?.contributes?.localizations?.find(x => locale.startsWith(x.languageId.toLowerCase()));
            const languageName = loc ? (loc.languageName || locale) : locale;
            const languageDisplayName = loc ? (loc.localizedLanguageName || loc.languageName || locale) : locale;
            const translationsFromPack = translation?.contents?.['vs/workbench/contrib/localization/electron-sandbox/minimalTranslations'] ?? {};
            const promptMessageKey = extensionToInstall ? 'installAndRestartMessage' : 'showLanguagePackExtensions';
            const useEnglish = !translationsFromPack[promptMessageKey];
            const translations = {};
            Object.keys(minimalTranslations_1.minimumTranslatedStrings).forEach(key => {
                if (!translationsFromPack[key] || useEnglish) {
                    translations[key] = minimalTranslations_1.minimumTranslatedStrings[key].replace('{0}', () => languageName);
                }
                else {
                    translations[key] = `${translationsFromPack[key].replace('{0}', () => languageDisplayName)} (${minimalTranslations_1.minimumTranslatedStrings[key].replace('{0}', () => languageName)})`;
                }
            });
            const logUserReaction = (userReaction) => {
                /* __GDPR__
                    "languagePackSuggestion:popup" : {
                        "owner": "TylerLeonhardt",
                        "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                        "language": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                    }
                */
                this.telemetryService.publicLog('languagePackSuggestion:popup', { userReaction, language: locale });
            };
            const searchAction = {
                label: translations['searchMarketplace'],
                run: async () => {
                    logUserReaction('search');
                    const viewlet = await this.paneCompositeService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
                    if (!viewlet) {
                        return;
                    }
                    const container = viewlet.getViewPaneContainer();
                    if (!container) {
                        return;
                    }
                    container.search(`tag:lp-${locale}`);
                    container.focus();
                }
            };
            const installAndRestartAction = {
                label: translations['installAndRestart'],
                run: async () => {
                    logUserReaction('installAndRestart');
                    await this.localeService.setLocale({
                        id: locale,
                        label: languageName,
                        extensionId: extensionToInstall?.identifier.id,
                        galleryExtension: extensionToInstall
                        // The user will be prompted if they want to install the language pack before this.
                    }, true);
                }
            };
            const promptMessage = translations[promptMessageKey];
            this.notificationService.prompt(severity_1.default.Info, promptMessage, [extensionToInstall ? installAndRestartAction : searchAction,
                {
                    label: (0, nls_1.localize)('neverAgain', "Don't Show Again"),
                    isSecondary: true,
                    run: () => {
                        languagePackSuggestionIgnoreList.push(fullLocale);
                        this.storageService.store(NativeLocalizationWorkbenchContribution_1.LANGUAGEPACK_SUGGESTION_IGNORE_STORAGE_KEY, JSON.stringify(languagePackSuggestionIgnoreList), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                        logUserReaction('neverShowAgain');
                    }
                }], {
                onCancel: () => {
                    logUserReaction('cancelled');
                }
            });
        }
        async isLocaleInstalled(locale) {
            const installed = await this.extensionManagementService.getInstalled();
            return installed.some(i => !!i.manifest.contributes?.localizations?.length
                && i.manifest.contributes.localizations.some(l => locale.startsWith(l.languageId.toLowerCase())));
        }
    };
    NativeLocalizationWorkbenchContribution = NativeLocalizationWorkbenchContribution_1 = __decorate([
        __param(0, notification_1.INotificationService),
        __param(1, locale_1.ILocaleService),
        __param(2, productService_1.IProductService),
        __param(3, storage_1.IStorageService),
        __param(4, extensionManagement_1.IExtensionManagementService),
        __param(5, extensionManagement_1.IExtensionGalleryService),
        __param(6, panecomposite_1.IPaneCompositePartService),
        __param(7, telemetry_1.ITelemetryService)
    ], NativeLocalizationWorkbenchContribution);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(NativeLocalizationWorkbenchContribution, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemF0aW9uLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2xvY2FsaXphdGlvbi9lbGVjdHJvbi1zYW5kYm94L2xvY2FsaXphdGlvbi5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBcUJoRyxJQUFNLHVDQUF1QyxHQUE3QyxNQUFNLHVDQUF3QyxTQUFRLGlFQUFxQzs7aUJBQzNFLCtDQUEwQyxHQUFHLGtEQUFrRCxBQUFyRCxDQUFzRDtRQUUvRyxZQUN3QyxtQkFBeUMsRUFDL0MsYUFBNkIsRUFDNUIsY0FBK0IsRUFDL0IsY0FBK0IsRUFDbkIsMEJBQXVELEVBQzFELGNBQXdDLEVBQ3ZDLG9CQUErQyxFQUN2RCxnQkFBbUM7WUFFdkUsS0FBSyxFQUFFLENBQUM7WUFUK0Isd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUMvQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDNUIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQy9CLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUNuQiwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQTZCO1lBQzFELG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQUN2Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQTJCO1lBQ3ZELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFJdkUsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1RyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FB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