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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/nls!vs/platform/languagePacks/common/languagePacks", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/instantiation/common/instantiation"], function (require, exports, cancellation_1, lifecycle_1, platform_1, nls_1, extensionManagement_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Jq = exports.$Iq = exports.$Hq = void 0;
    function $Hq(extension) {
        return extension.tags.find(t => t.startsWith('lp-'))?.split('lp-')[1];
    }
    exports.$Hq = $Hq;
    exports.$Iq = (0, instantiation_1.$Bh)('languagePackService');
    let $Jq = class $Jq extends lifecycle_1.$kc {
        constructor(c) {
            super();
            this.c = c;
        }
        async getAvailableLanguages() {
            const timeout = new cancellation_1.$pd();
            setTimeout(() => timeout.cancel(), 1000);
            let result;
            try {
                result = await this.c.query({
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
                const locale = $Hq(lp);
                const baseQuickPick = this.f(locale, languageName, lp);
                return {
                    ...baseQuickPick,
                    extensionId: lp.identifier.id,
                    galleryExtension: lp
                };
            });
            allFromMarketplace.push(this.f('en', 'English'));
            return allFromMarketplace;
        }
        f(locale, languageName, languagePack) {
            const label = languageName ?? locale;
            let description;
            if (label !== locale) {
                description = `(${locale})`;
            }
            if (locale.toLowerCase() === platform_1.$v.toLowerCase()) {
                description ??= '';
                description += (0, nls_1.localize)(0, null);
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
    exports.$Jq = $Jq;
    exports.$Jq = $Jq = __decorate([
        __param(0, extensionManagement_1.$Zn)
    ], $Jq);
});
//# sourceMappingURL=languagePacks.js.map