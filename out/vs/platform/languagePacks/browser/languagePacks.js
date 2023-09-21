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
    exports.WebLanguagePacksService = void 0;
    let WebLanguagePacksService = class WebLanguagePacksService extends languagePacks_1.LanguagePackBaseService {
        constructor(extensionResourceLoaderService, extensionGalleryService, logService) {
            super(extensionGalleryService);
            this.extensionResourceLoaderService = extensionResourceLoaderService;
            this.logService = logService;
        }
        async getBuiltInExtensionTranslationsUri(id, language) {
            const queryTimeout = new cancellation_1.CancellationTokenSource();
            setTimeout(() => queryTimeout.cancel(), 1000);
            // First get the extensions that supports the language (there should only be one but just in case let's include more results)
            let result;
            try {
                result = await this.extensionGalleryService.query({
                    text: `tag:"lp-${language}"`,
                    pageSize: 5
                }, queryTimeout.token);
            }
            catch (err) {
                this.logService.error(err);
                return undefined;
            }
            const languagePackExtensions = result.firstPage.find(e => e.properties.localizedLanguages?.length);
            if (!languagePackExtensions) {
                this.logService.trace(`No language pack found for language ${language}`);
                return undefined;
            }
            // Then get the manifest for that extension
            const manifestTimeout = new cancellation_1.CancellationTokenSource();
            setTimeout(() => queryTimeout.cancel(), 1000);
            const manifest = await this.extensionGalleryService.getManifest(languagePackExtensions, manifestTimeout.token);
            // Find the translation from the language pack
            const localization = manifest?.contributes?.localizations?.find(l => l.languageId === language);
            const translation = localization?.translations.find(t => t.id === id);
            if (!translation) {
                this.logService.trace(`No translation found for id '${id}, in ${manifest?.name}`);
                return undefined;
            }
            // get the resource uri and return it
            const uri = this.extensionResourceLoaderService.getExtensionGalleryResourceURL({
                // If translation is defined then manifest should have been defined.
                name: manifest.name,
                publisher: manifest.publisher,
                version: manifest.version
            });
            if (!uri) {
                this.logService.trace('Gallery does not provide extension resources.');
                return undefined;
            }
            return uri_1.URI.joinPath(uri, translation.path);
        }
        // Web doesn't have a concept of language packs, so we just return an empty array
        getInstalledLanguages() {
            return Promise.resolve([]);
        }
    };
    exports.WebLanguagePacksService = WebLanguagePacksService;
    exports.WebLanguagePacksService = WebLanguagePacksService = __decorate([
        __param(0, extensionResourceLoader_1.IExtensionResourceLoaderService),
        __param(1, extensionManagement_1.IExtensionGalleryService),
        __param(2, log_1.ILogService)
    ], WebLanguagePacksService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VQYWNrcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2xhbmd1YWdlUGFja3MvYnJvd3Nlci9sYW5ndWFnZVBhY2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVN6RixJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLHVDQUF1QjtRQUNuRSxZQUNtRCw4QkFBK0QsRUFDdkYsdUJBQWlELEVBQzdDLFVBQXVCO1lBRXJELEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBSm1CLG1DQUE4QixHQUE5Qiw4QkFBOEIsQ0FBaUM7WUFFbkYsZUFBVSxHQUFWLFVBQVUsQ0FBYTtRQUd0RCxDQUFDO1FBRUQsS0FBSyxDQUFDLGtDQUFrQyxDQUFDLEVBQVUsRUFBRSxRQUFnQjtZQUVwRSxNQUFNLFlBQVksR0FBRyxJQUFJLHNDQUF1QixFQUFFLENBQUM7WUFDbkQsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUU5Qyw2SEFBNkg7WUFDN0gsSUFBSSxNQUFNLENBQUM7WUFDWCxJQUFJO2dCQUNILE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLENBQUM7b0JBQ2pELElBQUksRUFBRSxXQUFXLFFBQVEsR0FBRztvQkFDNUIsUUFBUSxFQUFFLENBQUM7aUJBQ1gsRUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDdkI7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDYixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDM0IsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxNQUFNLHNCQUFzQixHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNuRyxJQUFJLENBQUMsc0JBQXNCLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLHVDQUF1QyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUN6RSxPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUVELDJDQUEyQztZQUMzQyxNQUFNLGVBQWUsR0FBRyxJQUFJLHNDQUF1QixFQUFFLENBQUM7WUFDdEQsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM5QyxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsc0JBQXNCLEVBQUUsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRS9HLDhDQUE4QztZQUM5QyxNQUFNLFlBQVksR0FBRyxRQUFRLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxLQUFLLFFBQVEsQ0FBQyxDQUFDO1lBQ2hHLE1BQU0sV0FBVyxHQUFHLFlBQVksRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUN0RSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNqQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxRQUFRLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRixPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUVELHFDQUFxQztZQUNyQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsOEJBQThCLENBQUMsOEJBQThCLENBQUM7Z0JBQzlFLG9FQUFvRTtnQkFDcEUsSUFBSSxFQUFFLFFBQVMsQ0FBQyxJQUFJO2dCQUNwQixTQUFTLEVBQUUsUUFBUyxDQUFDLFNBQVM7Z0JBQzlCLE9BQU8sRUFBRSxRQUFTLENBQUMsT0FBTzthQUMxQixDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNULElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUM7Z0JBQ3ZFLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBRUQsT0FBTyxTQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVELGlGQUFpRjtRQUNqRixxQkFBcUI7WUFDcEIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLENBQUM7S0FDRCxDQUFBO0lBaEVZLDBEQUF1QjtzQ0FBdkIsdUJBQXVCO1FBRWpDLFdBQUEseURBQStCLENBQUE7UUFDL0IsV0FBQSw4Q0FBd0IsQ0FBQTtRQUN4QixXQUFBLGlCQUFXLENBQUE7T0FKRCx1QkFBdUIsQ0FnRW5DIn0=