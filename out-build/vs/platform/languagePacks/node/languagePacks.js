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
    exports.$Kq = void 0;
    let $Kq = class $Kq extends languagePacks_1.$Jq {
        constructor(h, environmentService, extensionGalleryService, j) {
            super(extensionGalleryService);
            this.h = h;
            this.j = j;
            this.g = this.B(new LanguagePacksCache(environmentService, j));
            this.h.registerParticipant({
                postInstall: async (extension) => {
                    return this.m(extension);
                },
                postUninstall: async (extension) => {
                    return this.n(extension);
                }
            });
        }
        async getBuiltInExtensionTranslationsUri(id, language) {
            const packs = await this.g.getLanguagePacks();
            const pack = packs[language];
            if (!pack) {
                this.j.warn(`No language pack found for ${language}`);
                return undefined;
            }
            const translation = pack.translations[id];
            return translation ? uri_1.URI.file(translation) : undefined;
        }
        async getInstalledLanguages() {
            const languagePacks = await this.g.getLanguagePacks();
            const languages = Object.keys(languagePacks).map(locale => {
                const languagePack = languagePacks[locale];
                const baseQuickPick = this.f(locale, languagePack.label);
                return {
                    ...baseQuickPick,
                    extensionId: languagePack.extensions[0].extensionIdentifier.id,
                };
            });
            languages.push(this.f('en', 'English'));
            languages.sort((a, b) => a.label.localeCompare(b.label));
            return languages;
        }
        async m(extension) {
            if (extension && extension.manifest && extension.manifest.contributes && extension.manifest.contributes.localizations && extension.manifest.contributes.localizations.length) {
                this.j.info('Adding language packs from the extension', extension.identifier.id);
                await this.update();
            }
        }
        async n(extension) {
            const languagePacks = await this.g.getLanguagePacks();
            if (Object.keys(languagePacks).some(language => languagePacks[language] && languagePacks[language].extensions.some(e => (0, extensionManagementUtil_1.$po)(e.extensionIdentifier, extension.identifier)))) {
                this.j.info('Removing language packs from the extension', extension.identifier.id);
                await this.update();
            }
        }
        async update() {
            const [current, installed] = await Promise.all([this.g.getLanguagePacks(), this.h.getInstalled()]);
            const updated = await this.g.update(installed);
            return !(0, arrays_1.$sb)(Object.keys(current), Object.keys(updated));
        }
    };
    exports.$Kq = $Kq;
    exports.$Kq = $Kq = __decorate([
        __param(0, extensionManagement_1.$2n),
        __param(1, environment_1.$Jh),
        __param(2, extensionManagement_1.$Zn),
        __param(3, log_1.$5i)
    ], $Kq);
    let LanguagePacksCache = class LanguagePacksCache extends lifecycle_1.$kc {
        constructor(environmentService, j) {
            super();
            this.j = j;
            this.c = {};
            this.f = (0, path_1.$9d)(environmentService.userDataPath, 'languagepacks.json');
            this.g = new async_1.$Ng();
        }
        getLanguagePacks() {
            // if queue is not empty, fetch from disk
            if (this.g.size || !this.h) {
                return this.s()
                    .then(() => this.c);
            }
            return Promise.resolve(this.c);
        }
        update(extensions) {
            return this.s(languagePacks => {
                Object.keys(languagePacks).forEach(language => delete languagePacks[language]);
                this.m(languagePacks, ...extensions);
            }).then(() => this.c);
        }
        m(languagePacks, ...extensions) {
            for (const extension of extensions) {
                if (extension && extension.manifest && extension.manifest.contributes && extension.manifest.contributes.localizations && extension.manifest.contributes.localizations.length) {
                    this.n(languagePacks, extension);
                }
            }
            Object.keys(languagePacks).forEach(languageId => this.r(languagePacks[languageId]));
        }
        n(languagePacks, extension) {
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
                    const extensionInLanguagePack = languagePack.extensions.filter(e => (0, extensionManagementUtil_1.$po)(e.extensionIdentifier, extensionIdentifier))[0];
                    if (extensionInLanguagePack) {
                        extensionInLanguagePack.version = extension.manifest.version;
                    }
                    else {
                        languagePack.extensions.push({ extensionIdentifier, version: extension.manifest.version });
                    }
                    for (const translation of localizationContribution.translations) {
                        languagePack.translations[translation.id] = (0, path_1.$9d)(extension.location.fsPath, translation.path);
                    }
                }
            }
        }
        r(languagePack) {
            if (languagePack) {
                const md5 = (0, crypto_1.createHash)('md5');
                for (const extension of languagePack.extensions) {
                    md5.update(extension.extensionIdentifier.uuid || extension.extensionIdentifier.id).update(extension.version); // CodeQL [SM01510] The extension UUID is not sensitive info and is not manually created by a user
                }
                languagePack.hash = md5.digest('hex');
            }
        }
        s(fn = () => null) {
            return this.g.queue(() => {
                let result = null;
                return pfs_1.Promises.readFile(this.f, 'utf8')
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
                    this.c = languagePacks;
                    this.h = true;
                    const raw = JSON.stringify(this.c);
                    this.j.debug('Writing language packs', raw);
                    return pfs_1.Promises.writeFile(this.f, raw);
                })
                    .then(() => result, error => this.j.error(error));
            });
        }
    };
    LanguagePacksCache = __decorate([
        __param(0, environment_1.$Jh),
        __param(1, log_1.$5i)
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
//# sourceMappingURL=languagePacks.js.map