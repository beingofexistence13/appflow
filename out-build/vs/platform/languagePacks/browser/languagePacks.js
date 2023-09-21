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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/uri", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionResourceLoader/common/extensionResourceLoader", "vs/platform/languagePacks/common/languagePacks", "vs/platform/log/common/log"], function (require, exports, cancellation_1, uri_1, extensionManagement_1, extensionResourceLoader_1, languagePacks_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Q4b = void 0;
    let $Q4b = class $Q4b extends languagePacks_1.$Jq {
        constructor(a, extensionGalleryService, b) {
            super(extensionGalleryService);
            this.a = a;
            this.b = b;
        }
        async getBuiltInExtensionTranslationsUri(id, language) {
            const queryTimeout = new cancellation_1.$pd();
            setTimeout(() => queryTimeout.cancel(), 1000);
            // First get the extensions that supports the language (there should only be one but just in case let's include more results)
            let result;
            try {
                result = await this.c.query({
                    text: `tag:"lp-${language}"`,
                    pageSize: 5
                }, queryTimeout.token);
            }
            catch (err) {
                this.b.error(err);
                return undefined;
            }
            const languagePackExtensions = result.firstPage.find(e => e.properties.localizedLanguages?.length);
            if (!languagePackExtensions) {
                this.b.trace(`No language pack found for language ${language}`);
                return undefined;
            }
            // Then get the manifest for that extension
            const manifestTimeout = new cancellation_1.$pd();
            setTimeout(() => queryTimeout.cancel(), 1000);
            const manifest = await this.c.getManifest(languagePackExtensions, manifestTimeout.token);
            // Find the translation from the language pack
            const localization = manifest?.contributes?.localizations?.find(l => l.languageId === language);
            const translation = localization?.translations.find(t => t.id === id);
            if (!translation) {
                this.b.trace(`No translation found for id '${id}, in ${manifest?.name}`);
                return undefined;
            }
            // get the resource uri and return it
            const uri = this.a.getExtensionGalleryResourceURL({
                // If translation is defined then manifest should have been defined.
                name: manifest.name,
                publisher: manifest.publisher,
                version: manifest.version
            });
            if (!uri) {
                this.b.trace('Gallery does not provide extension resources.');
                return undefined;
            }
            return uri_1.URI.joinPath(uri, translation.path);
        }
        // Web doesn't have a concept of language packs, so we just return an empty array
        getInstalledLanguages() {
            return Promise.resolve([]);
        }
    };
    exports.$Q4b = $Q4b;
    exports.$Q4b = $Q4b = __decorate([
        __param(0, extensionResourceLoader_1.$2$),
        __param(1, extensionManagement_1.$Zn),
        __param(2, log_1.$5i)
    ], $Q4b);
});
//# sourceMappingURL=languagePacks.js.map