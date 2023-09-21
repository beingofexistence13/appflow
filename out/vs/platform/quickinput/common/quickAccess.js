/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/platform/registry/common/platform"], function (require, exports, arrays_1, lifecycle_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickAccessRegistry = exports.Extensions = exports.DefaultQuickAccessFilterValue = void 0;
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
    exports.Extensions = {
        Quickaccess: 'workbench.contributions.quickaccess'
    };
    class QuickAccessRegistry {
        constructor() {
            this.providers = [];
            this.defaultProvider = undefined;
        }
        registerQuickAccessProvider(provider) {
            // Extract the default provider when no prefix is present
            if (provider.prefix.length === 0) {
                this.defaultProvider = provider;
            }
            else {
                this.providers.push(provider);
            }
            // sort the providers by decreasing prefix length, such that longer
            // prefixes take priority: 'ext' vs 'ext install' - the latter should win
            this.providers.sort((providerA, providerB) => providerB.prefix.length - providerA.prefix.length);
            return (0, lifecycle_1.toDisposable)(() => {
                this.providers.splice(this.providers.indexOf(provider), 1);
                if (this.defaultProvider === provider) {
                    this.defaultProvider = undefined;
                }
            });
        }
        getQuickAccessProviders() {
            return (0, arrays_1.coalesce)([this.defaultProvider, ...this.providers]);
        }
        getQuickAccessProvider(prefix) {
            const result = prefix ? (this.providers.find(provider => prefix.startsWith(provider.prefix)) || undefined) : undefined;
            return result || this.defaultProvider;
        }
        clear() {
            const providers = [...this.providers];
            const defaultProvider = this.defaultProvider;
            this.providers = [];
            this.defaultProvider = undefined;
            return () => {
                this.providers = providers;
                this.defaultProvider = defaultProvider;
            };
        }
    }
    exports.QuickAccessRegistry = QuickAccessRegistry;
    platform_1.Registry.add(exports.Extensions.Quickaccess, new QuickAccessRegistry());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tBY2Nlc3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9xdWlja2lucHV0L2NvbW1vbi9xdWlja0FjY2Vzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnRWhHLElBQVksNkJBV1g7SUFYRCxXQUFZLDZCQUE2QjtRQUV4Qzs7V0FFRztRQUNILHlGQUFZLENBQUE7UUFFWjs7V0FFRztRQUNILGlGQUFRLENBQUE7SUFDVCxDQUFDLEVBWFcsNkJBQTZCLDZDQUE3Qiw2QkFBNkIsUUFXeEM7SUErRlksUUFBQSxVQUFVLEdBQUc7UUFDekIsV0FBVyxFQUFFLHFDQUFxQztLQUNsRCxDQUFDO0lBb0JGLE1BQWEsbUJBQW1CO1FBQWhDO1lBRVMsY0FBUyxHQUFxQyxFQUFFLENBQUM7WUFDakQsb0JBQWUsR0FBK0MsU0FBUyxDQUFDO1FBOENqRixDQUFDO1FBNUNBLDJCQUEyQixDQUFDLFFBQXdDO1lBRW5FLHlEQUF5RDtZQUN6RCxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDakMsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUM7YUFDaEM7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDOUI7WUFFRCxtRUFBbUU7WUFDbkUseUVBQXlFO1lBQ3pFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVqRyxPQUFPLElBQUEsd0JBQVksRUFBQyxHQUFHLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUUzRCxJQUFJLElBQUksQ0FBQyxlQUFlLEtBQUssUUFBUSxFQUFFO29CQUN0QyxJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztpQkFDakM7WUFDRixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCx1QkFBdUI7WUFDdEIsT0FBTyxJQUFBLGlCQUFRLEVBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUVELHNCQUFzQixDQUFDLE1BQWM7WUFDcEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBRXZILE9BQU8sTUFBTSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDdkMsQ0FBQztRQUVELEtBQUs7WUFDSixNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7WUFFN0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7WUFFakMsT0FBTyxHQUFHLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO1lBQ3hDLENBQUMsQ0FBQztRQUNILENBQUM7S0FDRDtJQWpERCxrREFpREM7SUFFRCxtQkFBUSxDQUFDLEdBQUcsQ0FBQyxrQkFBVSxDQUFDLFdBQVcsRUFBRSxJQUFJLG1CQUFtQixFQUFFLENBQUMsQ0FBQyJ9