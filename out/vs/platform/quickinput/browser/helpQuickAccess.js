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
define(["require", "exports", "vs/nls", "vs/platform/registry/common/platform", "vs/base/common/lifecycle", "vs/platform/keybinding/common/keybinding", "vs/platform/quickinput/common/quickAccess", "vs/platform/quickinput/common/quickInput"], function (require, exports, nls_1, platform_1, lifecycle_1, keybinding_1, quickAccess_1, quickInput_1) {
    "use strict";
    var HelpQuickAccessProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HelpQuickAccessProvider = void 0;
    let HelpQuickAccessProvider = class HelpQuickAccessProvider {
        static { HelpQuickAccessProvider_1 = this; }
        static { this.PREFIX = '?'; }
        constructor(quickInputService, keybindingService) {
            this.quickInputService = quickInputService;
            this.keybindingService = keybindingService;
            this.registry = platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess);
        }
        provide(picker) {
            const disposables = new lifecycle_1.DisposableStore();
            // Open a picker with the selected value if picked
            disposables.add(picker.onDidAccept(() => {
                const [item] = picker.selectedItems;
                if (item) {
                    this.quickInputService.quickAccess.show(item.prefix, { preserveValue: true });
                }
            }));
            // Also open a picker when we detect the user typed the exact
            // name of a provider (e.g. `?term` for terminals)
            disposables.add(picker.onDidChangeValue(value => {
                const providerDescriptor = this.registry.getQuickAccessProvider(value.substr(HelpQuickAccessProvider_1.PREFIX.length));
                if (providerDescriptor && providerDescriptor.prefix && providerDescriptor.prefix !== HelpQuickAccessProvider_1.PREFIX) {
                    this.quickInputService.quickAccess.show(providerDescriptor.prefix, { preserveValue: true });
                }
            }));
            // Fill in all providers
            picker.items = this.getQuickAccessProviders().filter(p => p.prefix !== HelpQuickAccessProvider_1.PREFIX);
            return disposables;
        }
        getQuickAccessProviders() {
            const providers = this.registry
                .getQuickAccessProviders()
                .sort((providerA, providerB) => providerA.prefix.localeCompare(providerB.prefix))
                .flatMap(provider => this.createPicks(provider));
            return providers;
        }
        createPicks(provider) {
            return provider.helpEntries.map(helpEntry => {
                const prefix = helpEntry.prefix || provider.prefix;
                const label = prefix || '\u2026' /* ... */;
                return {
                    prefix,
                    label,
                    keybinding: helpEntry.commandId ? this.keybindingService.lookupKeybinding(helpEntry.commandId) : undefined,
                    ariaLabel: (0, nls_1.localize)('helpPickAriaLabel', "{0}, {1}", label, helpEntry.description),
                    description: helpEntry.description
                };
            });
        }
    };
    exports.HelpQuickAccessProvider = HelpQuickAccessProvider;
    exports.HelpQuickAccessProvider = HelpQuickAccessProvider = HelpQuickAccessProvider_1 = __decorate([
        __param(0, quickInput_1.IQuickInputService),
        __param(1, keybinding_1.IKeybindingService)
    ], HelpQuickAccessProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscFF1aWNrQWNjZXNzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcXVpY2tpbnB1dC9icm93c2VyL2hlbHBRdWlja0FjY2Vzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBYXpGLElBQU0sdUJBQXVCLEdBQTdCLE1BQU0sdUJBQXVCOztpQkFFNUIsV0FBTSxHQUFHLEdBQUcsQUFBTixDQUFPO1FBSXBCLFlBQ3FCLGlCQUFzRCxFQUN0RCxpQkFBc0Q7WUFEckMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUNyQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBSjFELGFBQVEsR0FBRyxtQkFBUSxDQUFDLEVBQUUsQ0FBdUIsd0JBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUtsRixDQUFDO1FBRUwsT0FBTyxDQUFDLE1BQTRDO1lBQ25ELE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQWUsRUFBRSxDQUFDO1lBRTFDLGtEQUFrRDtZQUNsRCxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO2dCQUN2QyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQztnQkFDcEMsSUFBSSxJQUFJLEVBQUU7b0JBQ1QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUM5RTtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSiw2REFBNkQ7WUFDN0Qsa0RBQWtEO1lBQ2xELFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUMvQyxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyx5QkFBdUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDckgsSUFBSSxrQkFBa0IsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLElBQUksa0JBQWtCLENBQUMsTUFBTSxLQUFLLHlCQUF1QixDQUFDLE1BQU0sRUFBRTtvQkFDcEgsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7aUJBQzVGO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLHdCQUF3QjtZQUN4QixNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUsseUJBQXVCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFdkcsT0FBTyxXQUFXLENBQUM7UUFDcEIsQ0FBQztRQUVELHVCQUF1QjtZQUN0QixNQUFNLFNBQVMsR0FBK0IsSUFBSSxDQUFDLFFBQVE7aUJBQ3pELHVCQUF1QixFQUFFO2lCQUN6QixJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ2hGLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUVsRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU8sV0FBVyxDQUFDLFFBQXdDO1lBQzNELE9BQU8sUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQzNDLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDbkQsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLFFBQVEsQ0FBQyxTQUFTLENBQUM7Z0JBRTNDLE9BQU87b0JBQ04sTUFBTTtvQkFDTixLQUFLO29CQUNMLFVBQVUsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO29CQUMxRyxTQUFTLEVBQUUsSUFBQSxjQUFRLEVBQUMsbUJBQW1CLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsV0FBVyxDQUFDO29CQUNsRixXQUFXLEVBQUUsU0FBUyxDQUFDLFdBQVc7aUJBQ2xDLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7O0lBM0RXLDBEQUF1QjtzQ0FBdkIsdUJBQXVCO1FBT2pDLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSwrQkFBa0IsQ0FBQTtPQVJSLHVCQUF1QixDQTREbkMifQ==