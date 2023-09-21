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
define(["require", "exports", "crypto", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/node/pfs", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/log/common/log", "vs/platform/languagePacks/common/languagePacks", "vs/base/common/uri"], function (require, exports, crypto_1, arrays_1, async_1, lifecycle_1, network_1, path_1, pfs_1, environment_1, extensionManagement_1, extensionManagementUtil_1, log_1, languagePacks_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeLanguagePackService = void 0;
    let NativeLanguagePackService = class NativeLanguagePackService extends languagePacks_1.LanguagePackBaseService {
        constructor(extensionManagementService, environmentService, extensionGalleryService, logService) {
            super(extensionGalleryService);
            this.extensionManagementService = extensionManagementService;
            this.logService = logService;
            this.cache = this._register(new LanguagePacksCache(environmentService, logService));
            this.extensionManagementService.registerParticipant({
                postInstall: async (extension) => {
                    return this.postInstallExtension(extension);
                },
                postUninstall: async (extension) => {
                    return this.postUninstallExtension(extension);
                }
            });
        }
        async getBuiltInExtensionTranslationsUri(id, language) {
            const packs = await this.cache.getLanguagePacks();
            const pack = packs[language];
            if (!pack) {
                this.logService.warn(`No language pack found for ${language}`);
                return undefined;
            }
            const translation = pack.translations[id];
            return translation ? uri_1.URI.file(translation) : undefined;
        }
        async getInstalledLanguages() {
            const languagePacks = await this.cache.getLanguagePacks();
            const languages = Object.keys(languagePacks).map(locale => {
                const languagePack = languagePacks[locale];
                const baseQuickPick = this.createQuickPickItem(locale, languagePack.label);
                return {
                    ...baseQuickPick,
                    extensionId: languagePack.extensions[0].extensionIdentifier.id,
                };
            });
            languages.push(this.createQuickPickItem('en', 'English'));
            languages.sort((a, b) => a.label.localeCompare(b.label));
            return languages;
        }
        async postInstallExtension(extension) {
            if (extension && extension.manifest && extension.manifest.contributes && extension.manifest.contributes.localizations && extension.manifest.contributes.localizations.length) {
                this.logService.info('Adding language packs from the extension', extension.identifier.id);
                await this.update();
            }
        }
        async postUninstallExtension(extension) {
            const languagePacks = await this.cache.getLanguagePacks();
            if (Object.keys(languagePacks).some(language => languagePacks[language] && languagePacks[language].extensions.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.extensionIdentifier, extension.identifier)))) {
                this.logService.info('Removing language packs from the extension', extension.identifier.id);
                await this.update();
            }
        }
        async update() {
            const [current, installed] = await Promise.all([this.cache.getLanguagePacks(), this.extensionManagementService.getInstalled()]);
            const updated = await this.cache.update(installed);
            return !(0, arrays_1.equals)(Object.keys(current), Object.keys(updated));
        }
    };
    exports.NativeLanguagePackService = NativeLanguagePackService;
    exports.NativeLanguagePackService = NativeLanguagePackService = __decorate([
        __param(0, extensionManagement_1.IExtensionManagementService),
        __param(1, environment_1.INativeEnvironmentService),
        __param(2, extensionManagement_1.IExtensionGalleryService),
        __param(3, log_1.ILogService)
    ], NativeLanguagePackService);
    let LanguagePacksCache = class LanguagePacksCache extends lifecycle_1.Disposable {
        constructor(environmentService, logService) {
            super();
            this.logService = logService;
            this.languagePacks = {};
            this.languagePacksFilePath = (0, path_1.join)(environmentService.userDataPath, 'languagepacks.json');
            this.languagePacksFileLimiter = new async_1.Queue();
        }
        getLanguagePacks() {
            // if queue is not empty, fetch from disk
            if (this.languagePacksFileLimiter.size || !this.initializedCache) {
                return this.withLanguagePacks()
                    .then(() => this.languagePacks);
            }
            return Promise.resolve(this.languagePacks);
        }
        update(extensions) {
            return this.withLanguagePacks(languagePacks => {
                Object.keys(languagePacks).forEach(language => delete languagePacks[language]);
                this.createLanguagePacksFromExtensions(languagePacks, ...extensions);
            }).then(() => this.languagePacks);
        }
        createLanguagePacksFromExtensions(languagePacks, ...extensions) {
            for (const extension of extensions) {
                if (extension && extension.manifest && extension.manifest.contributes && extension.manifest.contributes.localizations && extension.manifest.contributes.localizations.length) {
                    this.createLanguagePacksFromExtension(languagePacks, extension);
                }
            }
            Object.keys(languagePacks).forEach(languageId => this.updateHash(languagePacks[languageId]));
        }
        createLanguagePacksFromExtension(languagePacks, extension) {
            const extensionIdentifier = extension.identifier;
            const localizations = extension.manifest.contributes && extension.manifest.contributes.localizations ? extension.manifest.contributes.localizations : [];
            for (const localizationContribution of localizations) {
                if (extension.location.scheme === network_1.Schemas.file && isValidLocalization(localizationContribution)) {
                    let languagePack = languagePacks[localizationContribution.languageId];
                    if (!languagePack) {
                        languagePack = {
                            hash: '',
                            extensions: [],
                            translations: {},
                            label: localizationContribution.localizedLanguageName ?? localizationContribution.languageName
                        };
                        languagePacks[localizationContribution.languageId] = languagePack;
                    }
                    const extensionInLanguagePack = languagePack.extensions.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.extensionIdentifier, extensionIdentifier))[0];
                    if (extensionInLanguagePack) {
                        extensionInLanguagePack.version = extension.manifest.version;
                    }
                    else {
                        languagePack.extensions.push({ extensionIdentifier, version: extension.manifest.version });
                    }
                    for (const translation of localizationContribution.translations) {
                        languagePack.translations[translation.id] = (0, path_1.join)(extension.location.fsPath, translation.path);
                    }
                }
            }
        }
        updateHash(languagePack) {
            if (languagePack) {
                const md5 = (0, crypto_1.createHash)('md5');
                for (const extension of languagePack.extensions) {
                    md5.update(extension.extensionIdentifier.uuid || extension.extensionIdentifier.id).update(extension.version); // CodeQL [SM01510] The extension UUID is not sensitive info and is not manually created by a user
                }
                languagePack.hash = md5.digest('hex');
            }
        }
        withLanguagePacks(fn = () => null) {
            return this.languagePacksFileLimiter.queue(() => {
                let result = null;
                return pfs_1.Promises.readFile(this.languagePacksFilePath, 'utf8')
                    .then(undefined, err => err.code === 'ENOENT' ? Promise.resolve('{}') : Promise.reject(err))
                    .then(raw => { try {
                    return JSON.parse(raw);
                }
                catch (e) {
                    return {};
                } })
                    .then(languagePacks => { result = fn(languagePacks); return languagePacks; })
                    .then(languagePacks => {
                    for (const language of Object.keys(languagePacks)) {
                        if (!languagePacks[language]) {
                            delete languagePacks[language];
                        }
                    }
                    this.languagePacks = languagePacks;
                    this.initializedCache = true;
                    const raw = JSON.stringify(this.languagePacks);
                    this.logService.debug('Writing language packs', raw);
                    return pfs_1.Promises.writeFile(this.languagePacksFilePath, raw);
                })
                    .then(() => result, error => this.logService.error(error));
            });
        }
    };
    LanguagePacksCache = __decorate([
        __param(0, environment_1.INativeEnvironmentService),
        __param(1, log_1.ILogService)
    ], LanguagePacksCache);
    function isValidLocalization(localization) {
        if (typeof localization.languageId !== 'string') {
            return false;
        }
        if (!Array.isArray(localization.translations) || localization.translations.length === 0) {
            return false;
        }
        for (const translation of localization.translations) {
            if (typeof translation.id !== 'string') {
                return false;
            }
            if (typeof translation.path !== 'string') {
                return false;
            }
        }
        if (localization.languageName && typeof localization.languageName !== 'string') {
            return false;
        }
        if (localization.localizedLanguageName && typeof localization.localizedLanguageName !== 'string') {
            return false;
        }
        return true;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VQYWNrcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2xhbmd1YWdlUGFja3Mvbm9kZS9sYW5ndWFnZVBhY2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQTJCekYsSUFBTSx5QkFBeUIsR0FBL0IsTUFBTSx5QkFBMEIsU0FBUSx1Q0FBdUI7UUFHckUsWUFDK0MsMEJBQXVELEVBQzFFLGtCQUE2QyxFQUM5Qyx1QkFBaUQsRUFDN0MsVUFBdUI7WUFFckQsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFMZSwrQkFBMEIsR0FBMUIsMEJBQTBCLENBQTZCO1lBR3ZFLGVBQVUsR0FBVixVQUFVLENBQWE7WUFHckQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksa0JBQWtCLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNwRixJQUFJLENBQUMsMEJBQTBCLENBQUMsbUJBQW1CLENBQUM7Z0JBQ25ELFdBQVcsRUFBRSxLQUFLLEVBQUUsU0FBMEIsRUFBaUIsRUFBRTtvQkFDaEUsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzdDLENBQUM7Z0JBQ0QsYUFBYSxFQUFFLEtBQUssRUFBRSxTQUEwQixFQUFpQixFQUFFO29CQUNsRSxPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDL0MsQ0FBQzthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsa0NBQWtDLENBQUMsRUFBVSxFQUFFLFFBQWdCO1lBQ3BFLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ2xELE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxR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