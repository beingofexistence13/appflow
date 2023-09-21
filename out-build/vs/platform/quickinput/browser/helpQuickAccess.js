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
define(["require", "exports", "vs/nls!vs/platform/quickinput/browser/helpQuickAccess", "vs/platform/registry/common/platform", "vs/base/common/lifecycle", "vs/platform/keybinding/common/keybinding", "vs/platform/quickinput/common/quickAccess", "vs/platform/quickinput/common/quickInput"], function (require, exports, nls_1, platform_1, lifecycle_1, keybinding_1, quickAccess_1, quickInput_1) {
    "use strict";
    var $FLb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FLb = void 0;
    let $FLb = class $FLb {
        static { $FLb_1 = this; }
        static { this.PREFIX = '?'; }
        constructor(b, c) {
            this.b = b;
            this.c = c;
            this.a = platform_1.$8m.as(quickAccess_1.$8p.Quickaccess);
        }
        provide(picker) {
            const disposables = new lifecycle_1.$jc();
            // Open a picker with the selected value if picked
            disposables.add(picker.onDidAccept(() => {
                const [item] = picker.selectedItems;
                if (item) {
                    this.b.quickAccess.show(item.prefix, { preserveValue: true });
                }
            }));
            // Also open a picker when we detect the user typed the exact
            // name of a provider (e.g. `?term` for terminals)
            disposables.add(picker.onDidChangeValue(value => {
                const providerDescriptor = this.a.getQuickAccessProvider(value.substr($FLb_1.PREFIX.length));
                if (providerDescriptor && providerDescriptor.prefix && providerDescriptor.prefix !== $FLb_1.PREFIX) {
                    this.b.quickAccess.show(providerDescriptor.prefix, { preserveValue: true });
                }
            }));
            // Fill in all providers
            picker.items = this.getQuickAccessProviders().filter(p => p.prefix !== $FLb_1.PREFIX);
            return disposables;
        }
        getQuickAccessProviders() {
            const providers = this.a
                .getQuickAccessProviders()
                .sort((providerA, providerB) => providerA.prefix.localeCompare(providerB.prefix))
                .flatMap(provider => this.d(provider));
            return providers;
        }
        d(provider) {
            return provider.helpEntries.map(helpEntry => {
                const prefix = helpEntry.prefix || provider.prefix;
                const label = prefix || '\u2026' /* ... */;
                return {
                    prefix,
                    label,
                    keybinding: helpEntry.commandId ? this.c.lookupKeybinding(helpEntry.commandId) : undefined,
                    ariaLabel: (0, nls_1.localize)(0, null, label, helpEntry.description),
                    description: helpEntry.description
                };
            });
        }
    };
    exports.$FLb = $FLb;
    exports.$FLb = $FLb = $FLb_1 = __decorate([
        __param(0, quickInput_1.$Gq),
        __param(1, keybinding_1.$2D)
    ], $FLb);
});
//# sourceMappingURL=helpQuickAccess.js.map