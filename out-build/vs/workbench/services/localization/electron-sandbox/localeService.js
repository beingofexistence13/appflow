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
define(["require", "exports", "vs/base/common/platform", "vs/platform/environment/common/environment", "vs/platform/notification/common/notification", "vs/workbench/services/configuration/common/jsonEditing", "vs/workbench/services/localization/common/locale", "vs/platform/languagePacks/common/languagePacks", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/progress/common/progress", "vs/nls!vs/workbench/services/localization/electron-sandbox/localeService", "vs/base/common/actions", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/stripComments", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/host/browser/host", "vs/platform/dialogs/common/dialogs", "vs/platform/product/common/productService", "vs/platform/instantiation/common/extensions"], function (require, exports, platform_1, environment_1, notification_1, jsonEditing_1, locale_1, languagePacks_1, panecomposite_1, extensionManagement_1, progress_1, nls_1, actions_1, textfiles_1, stripComments_1, editorService_1, host_1, dialogs_1, productService_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // duplicate of VIEWLET_ID in contrib/extensions
    const EXTENSIONS_VIEWLET_ID = 'workbench.view.extensions';
    let NativeLocaleService = class NativeLocaleService {
        constructor(a, b, c, d, e, f, g, h, i, j, k, m) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.m = m;
        }
        async n() {
            try {
                const content = await this.h.read(this.b.argvResource, { encoding: 'utf8' });
                // This is the same logic that we do where argv.json is parsed so mirror that:
                // https://github.com/microsoft/vscode/blob/32d40cf44e893e87ac33ac4f08de1e5f7fe077fc/src/main.js#L238-L246
                JSON.parse((0, stripComments_1.stripComments)(content.value));
            }
            catch (error) {
                this.c.notify({
                    severity: notification_1.Severity.Error,
                    message: (0, nls_1.localize)(0, null),
                    actions: {
                        primary: [
                            (0, actions_1.$li)({
                                id: 'openArgv',
                                label: (0, nls_1.localize)(1, null),
                                run: () => this.i.openEditor({ resource: this.b.argvResource })
                            })
                        ]
                    }
                });
                return false;
            }
            return true;
        }
        async o(locale) {
            if (!(await this.n())) {
                return false;
            }
            await this.a.write(this.b.argvResource, [{ path: ['locale'], value: locale }], true);
            return true;
        }
        async setLocale(languagePackItem, skipDialog = false) {
            const locale = languagePackItem.id;
            if (locale === platform_1.Language.value() || (!locale && platform_1.Language.isDefaultVariant())) {
                return;
            }
            const installedLanguages = await this.d.getInstalledLanguages();
            try {
                // Only Desktop has the concept of installing language packs so we only do this for Desktop
                // and only if the language pack is not installed
                if (!installedLanguages.some(installedLanguage => installedLanguage.id === languagePackItem.id)) {
                    // Only actually install a language pack from Microsoft
                    if (languagePackItem.galleryExtension?.publisher.toLowerCase() !== 'ms-ceintl') {
                        // Show the view so the user can see the language pack that they should install
                        // as of now, there are no 3rd party language packs available on the Marketplace.
                        const viewlet = await this.e.openPaneComposite(EXTENSIONS_VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */);
                        (viewlet?.getViewPaneContainer()).search(`@id:${languagePackItem.extensionId}`);
                        return;
                    }
                    await this.g.withProgress({
                        location: 15 /* ProgressLocation.Notification */,
                        title: (0, nls_1.localize)(2, null, languagePackItem.label),
                    }, progress => this.f.installFromGallery(languagePackItem.galleryExtension, {
                        // Setting this to false is how you get the extension to be synced with Settings Sync (if enabled).
                        isMachineScoped: false,
                    }));
                }
                if (!skipDialog && !await this.p(languagePackItem.label)) {
                    return;
                }
                await this.o(locale);
                await this.k.restart();
            }
            catch (err) {
                this.c.error(err);
            }
        }
        async clearLocalePreference() {
            try {
                await this.o(undefined);
                if (!platform_1.Language.isDefaultVariant()) {
                    await this.p('English');
                }
            }
            catch (err) {
                this.c.error(err);
            }
        }
        async p(languageName) {
            const { confirmed } = await this.j.confirm({
                message: (0, nls_1.localize)(3, null, this.m.nameLong, languageName),
                detail: (0, nls_1.localize)(4, null, languageName, this.m.nameLong),
                primaryButton: (0, nls_1.localize)(5, null),
            });
            return confirmed;
        }
    };
    NativeLocaleService = __decorate([
        __param(0, jsonEditing_1.$$fb),
        __param(1, environment_1.$Ih),
        __param(2, notification_1.$Yu),
        __param(3, languagePacks_1.$Iq),
        __param(4, panecomposite_1.$Yeb),
        __param(5, extensionManagement_1.$2n),
        __param(6, progress_1.$2u),
        __param(7, textfiles_1.$JD),
        __param(8, editorService_1.$9C),
        __param(9, dialogs_1.$oA),
        __param(10, host_1.$VT),
        __param(11, productService_1.$kj)
    ], NativeLocaleService);
    // This is its own service because the localeService depends on IJSONEditingService which causes a circular dependency
    // Once that's ironed out, we can fold this into the localeService.
    let NativeActiveLanguagePackService = class NativeActiveLanguagePackService {
        constructor(a) {
            this.a = a;
        }
        async getExtensionIdProvidingCurrentLocale() {
            const language = platform_1.Language.value();
            if (language === platform_1.$f) {
                return undefined;
            }
            const languages = await this.a.getInstalledLanguages();
            const languagePack = languages.find(l => l.id === language);
            return languagePack?.extensionId;
        }
    };
    NativeActiveLanguagePackService = __decorate([
        __param(0, languagePacks_1.$Iq)
    ], NativeActiveLanguagePackService);
    (0, extensions_1.$mr)(locale_1.$khb, NativeLocaleService, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(locale_1.$lhb, NativeActiveLanguagePackService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=localeService.js.map