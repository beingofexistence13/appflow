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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/contrib/folding/browser/folding", "vs/nls!vs/workbench/contrib/folding/browser/folding.contribution", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/configuration/common/configurationRegistry", "vs/editor/common/config/editorConfigurationSchema", "vs/workbench/services/extensions/common/extensions", "vs/platform/configuration/common/configuration"], function (require, exports, lifecycle_1, folding_1, nls, platform_1, contributions_1, configurationRegistry_1, editorConfigurationSchema_1, extensions_1, configuration_1) {
    "use strict";
    var DefaultFoldingRangeProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    let DefaultFoldingRangeProvider = class DefaultFoldingRangeProvider extends lifecycle_1.$kc {
        static { DefaultFoldingRangeProvider_1 = this; }
        static { this.configName = 'editor.defaultFoldingRangeProvider'; }
        static { this.extensionIds = []; }
        static { this.extensionItemLabels = []; }
        static { this.extensionDescriptions = []; }
        constructor(c, f) {
            super();
            this.c = c;
            this.f = f;
            this.q.add(this.c.onDidChangeExtensions(this.g, this));
            this.q.add(folding_1.$z8.setFoldingRangeProviderSelector(this.h.bind(this)));
            this.g();
        }
        async g() {
            await this.c.whenInstalledExtensionsRegistered();
            DefaultFoldingRangeProvider_1.extensionIds.length = 0;
            DefaultFoldingRangeProvider_1.extensionItemLabels.length = 0;
            DefaultFoldingRangeProvider_1.extensionDescriptions.length = 0;
            DefaultFoldingRangeProvider_1.extensionIds.push(null);
            DefaultFoldingRangeProvider_1.extensionItemLabels.push(nls.localize(0, null));
            DefaultFoldingRangeProvider_1.extensionDescriptions.push(nls.localize(1, null));
            const languageExtensions = [];
            const otherExtensions = [];
            for (const extension of this.c.extensions) {
                if (extension.main || extension.browser) {
                    if (extension.categories?.find(cat => cat === 'Programming Languages')) {
                        languageExtensions.push(extension);
                    }
                    else {
                        otherExtensions.push(extension);
                    }
                }
            }
            const sorter = (a, b) => a.name.localeCompare(b.name);
            for (const extension of languageExtensions.sort(sorter)) {
                DefaultFoldingRangeProvider_1.extensionIds.push(extension.identifier.value);
                DefaultFoldingRangeProvider_1.extensionItemLabels.push(extension.displayName ?? '');
                DefaultFoldingRangeProvider_1.extensionDescriptions.push(extension.description ?? '');
            }
            for (const extension of otherExtensions.sort(sorter)) {
                DefaultFoldingRangeProvider_1.extensionIds.push(extension.identifier.value);
                DefaultFoldingRangeProvider_1.extensionItemLabels.push(extension.displayName ?? '');
                DefaultFoldingRangeProvider_1.extensionDescriptions.push(extension.description ?? '');
            }
        }
        h(providers, document) {
            const value = this.f.getValue(DefaultFoldingRangeProvider_1.configName, { overrideIdentifier: document.getLanguageId() });
            if (value) {
                return providers.filter(p => p.id === value);
            }
            return undefined;
        }
    };
    DefaultFoldingRangeProvider = DefaultFoldingRangeProvider_1 = __decorate([
        __param(0, extensions_1.$MF),
        __param(1, configuration_1.$8h)
    ], DefaultFoldingRangeProvider);
    platform_1.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration({
        ...editorConfigurationSchema_1.$k1,
        properties: {
            [DefaultFoldingRangeProvider.configName]: {
                description: nls.localize(2, null),
                type: ['string', 'null'],
                default: null,
                enum: DefaultFoldingRangeProvider.extensionIds,
                enumItemLabels: DefaultFoldingRangeProvider.extensionItemLabels,
                markdownEnumDescriptions: DefaultFoldingRangeProvider.extensionDescriptions
            }
        }
    });
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(DefaultFoldingRangeProvider, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=folding.contribution.js.map