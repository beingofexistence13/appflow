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
    exports.$M3b = void 0;
    let $M3b = class $M3b {
        constructor(e, f, productService) {
            this.e = e;
            this.f = f;
            this.c = new Set((f.extensionEnabledProposedApi ?? []).map(id => extensions_1.$Vl.toKey(id)));
            this.b = true || // always enable proposed API
                !f.isBuilt || // always allow proposed API when running out of sources
                (f.isExtensionDevelopment && productService.quality !== 'stable') || // do not allow proposed API against stable builds when developing an extension
                (this.c.size === 0 && Array.isArray(f.extensionEnabledProposedApi)); // always allow proposed API if --enable-proposed-api is provided without extension ID
            this.d = new Map();
            // NEW world - product.json spells out what proposals each extension can use
            if (productService.extensionEnabledApiProposals) {
                for (const [k, value] of Object.entries(productService.extensionEnabledApiProposals)) {
                    const key = extensions_1.$Vl.toKey(k);
                    const proposalNames = value.filter(name => {
                        if (!extensionsApiProposals_1.allApiProposals[name]) {
                            e.warn(`Via 'product.json#extensionEnabledApiProposals' extension '${key}' wants API proposal '${name}' but that proposal DOES NOT EXIST. Likely, the proposal has been finalized (check 'vscode.d.ts') or was abandoned.`);
                            return false;
                        }
                        return true;
                    });
                    this.d.set(key, proposalNames);
                }
            }
        }
        updateEnabledApiProposals(extensions) {
            for (const extension of extensions) {
                this.g(extension);
            }
        }
        g(_extension) {
            const extension = _extension;
            const key = extensions_1.$Vl.toKey(_extension.identifier);
            // warn about invalid proposal and remove them from the list
            if ((0, arrays_1.$Jb)(extension.enabledApiProposals)) {
                extension.enabledApiProposals = extension.enabledApiProposals.filter(name => {
                    const result = Boolean(extensionsApiProposals_1.allApiProposals[name]);
                    if (!result) {
                        this.e.error(`Extension '${key}' wants API proposal '${name}' but that proposal DOES NOT EXIST. Likely, the proposal has been finalized (check 'vscode.d.ts') or was abandoned.`);
                    }
                    return result;
                });
            }
            if (this.d.has(key)) {
                // NOTE that proposals that are listed in product.json override whatever is declared in the extension
                // itself. This is needed for us to know what proposals are used "in the wild". Merging product.json-proposals
                // and extension-proposals would break that.
                const productEnabledProposals = this.d.get(key);
                // check for difference between product.json-declaration and package.json-declaration
                const productSet = new Set(productEnabledProposals);
                const extensionSet = new Set(extension.enabledApiProposals);
                const diff = new Set([...extensionSet].filter(a => !productSet.has(a)));
                if (diff.size > 0) {
                    this.e.error(`Extension '${key}' appears in product.json but enables LESS API proposals than the extension wants.\npackage.json (LOSES): ${[...extensionSet].join(', ')}\nproduct.json (WINS): ${[...productSet].join(', ')}`);
                    if (this.f.isExtensionDevelopment) {
                        this.e.error(`Proceeding with EXTRA proposals (${[...diff].join(', ')}) because extension is in development mode. Still, this EXTENSION WILL BE BROKEN unless product.json is updated.`);
                        productEnabledProposals.push(...diff);
                    }
                }
                extension.enabledApiProposals = productEnabledProposals;
                return;
            }
            if (this.b || this.c.has(key)) {
                // proposed API usage is not restricted and allowed just like the extension
                // has declared it
                return;
            }
            if (!extension.isBuiltin && (0, arrays_1.$Jb)(extension.enabledApiProposals)) {
                // restrictive: extension cannot use proposed API in this context and its declaration is nulled
                this.e.error(`Extension '${extension.identifier.value} CANNOT USE these API proposals '${extension.enabledApiProposals?.join(', ') || '*'}'. You MUST start in extension development mode or use the --enable-proposed-api command line flag`);
                extension.enabledApiProposals = [];
            }
        }
    };
    exports.$M3b = $M3b;
    exports.$M3b = $M3b = __decorate([
        __param(0, log_1.$5i),
        __param(1, environmentService_1.$hJ),
        __param(2, productService_1.$kj)
    ], $M3b);
});
//# sourceMappingURL=extensionsProposedApi.js.map