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
define(["require", "exports", "vs/base/common/arrays", "vs/platform/extensions/common/extensions", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensionsApiProposals"], function (require, exports, arrays_1, extensions_1, log_1, productService_1, environmentService_1, extensionsApiProposals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsProposedApi = void 0;
    let ExtensionsProposedApi = class ExtensionsProposedApi {
        constructor(_logService, _environmentService, productService) {
            this._logService = _logService;
            this._environmentService = _environmentService;
            this._envEnabledExtensions = new Set((_environmentService.extensionEnabledProposedApi ?? []).map(id => extensions_1.ExtensionIdentifier.toKey(id)));
            this._envEnablesProposedApiForAll = true || // always enable proposed API
                !_environmentService.isBuilt || // always allow proposed API when running out of sources
                (_environmentService.isExtensionDevelopment && productService.quality !== 'stable') || // do not allow proposed API against stable builds when developing an extension
                (this._envEnabledExtensions.size === 0 && Array.isArray(_environmentService.extensionEnabledProposedApi)); // always allow proposed API if --enable-proposed-api is provided without extension ID
            this._productEnabledExtensions = new Map();
            // NEW world - product.json spells out what proposals each extension can use
            if (productService.extensionEnabledApiProposals) {
                for (const [k, value] of Object.entries(productService.extensionEnabledApiProposals)) {
                    const key = extensions_1.ExtensionIdentifier.toKey(k);
                    const proposalNames = value.filter(name => {
                        if (!extensionsApiProposals_1.allApiProposals[name]) {
                            _logService.warn(`Via 'product.json#extensionEnabledApiProposals' extension '${key}' wants API proposal '${name}' but that proposal DOES NOT EXIST. Likely, the proposal has been finalized (check 'vscode.d.ts') or was abandoned.`);
                            return false;
                        }
                        return true;
                    });
                    this._productEnabledExtensions.set(key, proposalNames);
                }
            }
        }
        updateEnabledApiProposals(extensions) {
            for (const extension of extensions) {
                this.doUpdateEnabledApiProposals(extension);
            }
        }
        doUpdateEnabledApiProposals(_extension) {
            const extension = _extension;
            const key = extensions_1.ExtensionIdentifier.toKey(_extension.identifier);
            // warn about invalid proposal and remove them from the list
            if ((0, arrays_1.isNonEmptyArray)(extension.enabledApiProposals)) {
                extension.enabledApiProposals = extension.enabledApiProposals.filter(name => {
                    const result = Boolean(extensionsApiProposals_1.allApiProposals[name]);
                    if (!result) {
                        this._logService.error(`Extension '${key}' wants API proposal '${name}' but that proposal DOES NOT EXIST. Likely, the proposal has been finalized (check 'vscode.d.ts') or was abandoned.`);
                    }
                    return result;
                });
            }
            if (this._productEnabledExtensions.has(key)) {
                // NOTE that proposals that are listed in product.json override whatever is declared in the extension
                // itself. This is needed for us to know what proposals are used "in the wild". Merging product.json-proposals
                // and extension-proposals would break that.
                const productEnabledProposals = this._productEnabledExtensions.get(key);
                // check for difference between product.json-declaration and package.json-declaration
                const productSet = new Set(productEnabledProposals);
                const extensionSet = new Set(extension.enabledApiProposals);
                const diff = new Set([...extensionSet].filter(a => !productSet.has(a)));
                if (diff.size > 0) {
                    this._logService.error(`Extension '${key}' appears in product.json but enables LESS API proposals than the extension wants.\npackage.json (LOSES): ${[...extensionSet].join(', ')}\nproduct.json (WINS): ${[...productSet].join(', ')}`);
                    if (this._environmentService.isExtensionDevelopment) {
                        this._logService.error(`Proceeding with EXTRA proposals (${[...diff].join(', ')}) because extension is in development mode. Still, this EXTENSION WILL BE BROKEN unless product.json is updated.`);
                        productEnabledProposals.push(...diff);
                    }
                }
                extension.enabledApiProposals = productEnabledProposals;
                return;
            }
            if (this._envEnablesProposedApiForAll || this._envEnabledExtensions.has(key)) {
                // proposed API usage is not restricted and allowed just like the extension
                // has declared it
                return;
            }
            if (!extension.isBuiltin && (0, arrays_1.isNonEmptyArray)(extension.enabledApiProposals)) {
                // restrictive: extension cannot use proposed API in this context and its declaration is nulled
                this._logService.error(`Extension '${extension.identifier.value} CANNOT USE these API proposals '${extension.enabledApiProposals?.join(', ') || '*'}'. You MUST start in extension development mode or use the --enable-proposed-api command line flag`);
                extension.enabledApiProposals = [];
            }
        }
    };
    exports.ExtensionsProposedApi = ExtensionsProposedApi;
    exports.ExtensionsProposedApi = ExtensionsProposedApi = __decorate([
        __param(0, log_1.ILogService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, productService_1.IProductService)
    ], ExtensionsProposedApi);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1Byb3Bvc2VkQXBpLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvbnMvY29tbW9uL2V4dGVuc2lvbnNQcm9wb3NlZEFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFTekYsSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBcUI7UUFNakMsWUFDK0IsV0FBd0IsRUFDUCxtQkFBaUQsRUFDL0UsY0FBK0I7WUFGbEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDUCx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQThCO1lBSWhHLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLDJCQUEyQixJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLGdDQUFtQixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdkksSUFBSSxDQUFDLDRCQUE0QixHQUFHLElBQUksSUFBSSw2QkFBNkI7Z0JBQ3hFLENBQUMsbUJBQW1CLENBQUMsT0FBTyxJQUFJLHdEQUF3RDtnQkFDeEYsQ0FBQyxtQkFBbUIsQ0FBQyxzQkFBc0IsSUFBSSxjQUFjLENBQUMsT0FBTyxLQUFLLFFBQVEsQ0FBQyxJQUFJLCtFQUErRTtnQkFDdEssQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQyxDQUFDLHNGQUFzRjtZQUVsTSxJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxHQUFHLEVBQTZCLENBQUM7WUFHdEUsNEVBQTRFO1lBQzVFLElBQUksY0FBYyxDQUFDLDRCQUE0QixFQUFF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