/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/platform/registry/common/platform"], function (require, exports, arrays_1, lifecycle_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9p = exports.$8p = exports.DefaultQuickAccessFilterValue = void 0;
    var DefaultQuickAccessFilterValue;
    (function (DefaultQuickAccessFilterValue) {
        /**
         * Keep the value as it is given to quick access.
         */
        DefaultQuickAccessFilterValue[DefaultQuickAccessFilterValue["PRESERVE"] = 0] = "PRESERVE";
        /**
         * Use the value that was used last time something was accepted from the picker.
         */
        DefaultQuickAccessFilterValue[DefaultQuickAccessFilterValue["LAST"] = 1] = "LAST";
    })(DefaultQuickAccessFilterValue || (exports.DefaultQuickAccessFilterValue = DefaultQuickAccessFilterValue = {}));
    exports.$8p = {
        Quickaccess: 'workbench.contributions.quickaccess'
    };
    class $9p {
        constructor() {
            this.a = [];
            this.b = undefined;
        }
        registerQuickAccessProvider(provider) {
            // Extract the default provider when no prefix is present
            if (provider.prefix.length === 0) {
                this.b = provider;
            }
            else {
                this.a.push(provider);
            }
            // sort the providers by decreasing prefix length, such that longer
            // prefixes take priority: 'ext' vs 'ext install' - the latter should win
            this.a.sort((providerA, providerB) => providerB.prefix.length - providerA.prefix.length);
            return (0, lifecycle_1.$ic)(() => {
                this.a.splice(this.a.indexOf(provider), 1);
                if (this.b === provider) {
                    this.b = undefined;
                }
            });
        }
        getQuickAccessProviders() {
            return (0, arrays_1.$Fb)([this.b, ...this.a]);
        }
        getQuickAccessProvider(prefix) {
            const result = prefix ? (this.a.find(provider => prefix.startsWith(provider.prefix)) || undefined) : undefined;
            return result || this.b;
        }
        clear() {
            const providers = [...this.a];
            const defaultProvider = this.b;
            this.a = [];
            this.b = undefined;
            return () => {
                this.a = providers;
                this.b = defaultProvider;
            };
        }
    }
    exports.$9p = $9p;
    platform_1.$8m.add(exports.$8p.Quickaccess, new $9p());
});
//# sourceMappingURL=quickAccess.js.map