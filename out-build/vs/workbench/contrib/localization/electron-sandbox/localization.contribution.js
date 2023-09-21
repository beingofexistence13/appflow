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
define(["require", "exports", "vs/nls!vs/workbench/contrib/localization/electron-sandbox/localization.contribution", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/base/common/platform", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/notification/common/notification", "vs/base/common/severity", "vs/platform/storage/common/storage", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/localization/electron-sandbox/minimalTranslations", "vs/platform/telemetry/common/telemetry", "vs/base/common/cancellation", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/services/localization/common/locale", "vs/platform/product/common/productService", "vs/workbench/contrib/localization/common/localization.contribution"], function (require, exports, nls_1, platform_1, contributions_1, platform, extensionManagement_1, notification_1, severity_1, storage_1, extensions_1, minimalTranslations_1, telemetry_1, cancellation_1, panecomposite_1, locale_1, productService_1, localization_contribution_1) {
    "use strict";
    var NativeLocalizationWorkbenchContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    let NativeLocalizationWorkbenchContribution = class NativeLocalizationWorkbenchContribution extends localization_contribution_1.$U4b {
        static { NativeLocalizationWorkbenchContribution_1 = this; }
        static { this.a = 'extensionsAssistant/languagePackSuggestionIgnore'; }
        constructor(b, c, f, g, h, j, m, n) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.u();
            this.B(this.h.onDidInstallExtensions(e => this.r(e)));
            this.B(this.h.onDidUninstallExtension(e => this.t(e)));
        }
        async r(results) {
            for (const result of results) {
                if (result.operation === 2 /* InstallOperation.Install */ && result.local) {
                    await this.s(result.local, !!result.context?.extensionsSync);
                }
            }
        }
        async s(localExtension, fromSettingsSync) {
            const localization = localExtension.manifest.contributes?.localizations?.[0];
            if (!localization || platform.$v === localization.languageId) {
                return;
            }
            const { languageId, languageName } = localization;
            this.b.prompt(severity_1.default.Info, (0, nls_1.localize)(0, null, this.f.nameLong, languageName || languageId), [{
                    label: (0, nls_1.localize)(1, null),
                    run: async () => {
                        await this.c.setLocale({
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
        async t(_event) {
            if (!await this.w(platform.$v)) {
                this.c.setLocale({
                    id: 'en',
                    label: 'English'
                });
            }
        }
        async u() {
            const language = platform.$v;
            let locale = platform.$w ?? '';
            const languagePackSuggestionIgnoreList = JSON.parse(this.g.get(NativeLocalizationWorkbenchContribution_1.a, -1 /* StorageScope.APPLICATION */, '[]'));
            if (!this.j.isEnabled()) {
                return;
            }
            if (!language || !locale || locale === 'en' || locale.indexOf('en-') === 0) {
                return;
            }
            if (locale.startsWith(language) || languagePackSuggestionIgnoreList.includes(locale)) {
                return;
            }
            const installed = await this.w(locale);
            if (installed) {
                return;
            }
            const fullLocale = locale;
            let tagResult = await this.j.query({ text: `tag:lp-${locale}` }, cancellation_1.CancellationToken.None);
            if (tagResult.total === 0) {
                // Trim the locale and try again.
                locale = locale.split('-')[0];
                tagResult = await this.j.query({ text: `tag:lp-${locale}` }, cancellation_1.CancellationToken.None);
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
                this.j.getManifest(extensionToFetchTranslationsFrom, cancellation_1.CancellationToken.None),
                this.j.getCoreTranslation(extensionToFetchTranslationsFrom, locale)
            ]);
            const loc = manifest?.contributes?.localizations?.find(x => locale.startsWith(x.languageId.toLowerCase()));
            const languageName = loc ? (loc.languageName || locale) : locale;
            const languageDisplayName = loc ? (loc.localizedLanguageName || loc.languageName || locale) : locale;
            const translationsFromPack = translation?.contents?.['vs/workbench/contrib/localization/electron-sandbox/minimalTranslations'] ?? {};
            const promptMessageKey = extensionToInstall ? 'installAndRestartMessage' : 'showLanguagePackExtensions';
            const useEnglish = !translationsFromPack[promptMessageKey];
            const translations = {};
            Object.keys(minimalTranslations_1.$fac).forEach(key => {
                if (!translationsFromPack[key] || useEnglish) {
                    translations[key] = minimalTranslations_1.$fac[key].replace('{0}', () => languageName);
                }
                else {
                    translations[key] = `${translationsFromPack[key].replace('{0}', () => languageDisplayName)} (${minimalTranslations_1.$fac[key].replace('{0}', () => languageName)})`;
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
                this.n.publicLog('languagePackSuggestion:popup', { userReaction, language: locale });
            };
            const searchAction = {
                label: translations['searchMarketplace'],
                run: async () => {
                    logUserReaction('search');
                    const viewlet = await this.m.openPaneComposite(extensions_1.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true);
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
                    await this.c.setLocale({
                        id: locale,
                        label: languageName,
                        extensionId: extensionToInstall?.identifier.id,
                        galleryExtension: extensionToInstall
                        // The user will be prompted if they want to install the language pack before this.
                    }, true);
                }
            };
            const promptMessage = translations[promptMessageKey];
            this.b.prompt(severity_1.default.Info, promptMessage, [extensionToInstall ? installAndRestartAction : searchAction,
                {
                    label: (0, nls_1.localize)(2, null),
                    isSecondary: true,
                    run: () => {
                        languagePackSuggestionIgnoreList.push(fullLocale);
                        this.g.store(NativeLocalizationWorkbenchContribution_1.a, JSON.stringify(languagePackSuggestionIgnoreList), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                        logUserReaction('neverShowAgain');
                    }
                }], {
                onCancel: () => {
                    logUserReaction('cancelled');
                }
            });
        }
        async w(locale) {
            const installed = await this.h.getInstalled();
            return installed.some(i => !!i.manifest.contributes?.localizations?.length
                && i.manifest.contributes.localizations.some(l => locale.startsWith(l.languageId.toLowerCase())));
        }
    };
    NativeLocalizationWorkbenchContribution = NativeLocalizationWorkbenchContribution_1 = __decorate([
        __param(0, notification_1.$Yu),
        __param(1, locale_1.$khb),
        __param(2, productService_1.$kj),
        __param(3, storage_1.$Vo),
        __param(4, extensionManagement_1.$2n),
        __param(5, extensionManagement_1.$Zn),
        __param(6, panecomposite_1.$Yeb),
        __param(7, telemetry_1.$9k)
    ], NativeLocalizationWorkbenchContribution);
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(NativeLocalizationWorkbenchContribution, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=localization.contribution.js.map