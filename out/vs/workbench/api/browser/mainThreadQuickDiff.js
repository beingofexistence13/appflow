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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/scm/common/quickDiff", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, cancellation_1, lifecycle_1, uri_1, extHost_protocol_1, quickDiff_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadQuickDiff = void 0;
    let MainThreadQuickDiff = class MainThreadQuickDiff {
        constructor(extHostContext, quickDiffService) {
            this.quickDiffService = quickDiffService;
            this.providers = new Map();
            this.providerDisposables = new Map();
            this.proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostQuickDiff);
        }
        async $registerQuickDiffProvider(handle, selector, label, rootUri) {
            const provider = {
                label,
                rootUri: uri_1.URI.revive(rootUri),
                selector,
                isSCM: false,
                getOriginalResource: async (uri) => {
                    return uri_1.URI.revive(await this.proxy.$provideOriginalResource(handle, uri, new cancellation_1.CancellationTokenSource().token));
                }
            };
            this.providers.set(handle, provider);
            const disposable = this.quickDiffService.addQuickDiffProvider(provider);
            this.providerDisposables.set(handle, disposable);
        }
        async $unregisterQuickDiffProvider(handle) {
            if (this.providers.has(handle)) {
                this.providers.delete(handle);
            }
            if (this.providerDisposables.has(handle)) {
                this.providerDisposables.delete(handle);
            }
        }
        dispose() {
            this.providers.clear();
            (0, lifecycle_1.dispose)(this.providerDisposables.values());
            this.providerDisposables.clear();
        }
    };
    exports.MainThreadQuickDiff = MainThreadQuickDiff;
    exports.MainThreadQuickDiff = MainThreadQuickDiff = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadQuickDiff),
        __param(1, quickDiff_1.IQuickDiffService)
    ], MainThreadQuickDiff);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFF1aWNrRGlmZi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkUXVpY2tEaWZmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVV6RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFtQjtRQU0vQixZQUNDLGNBQStCLEVBQ1osZ0JBQW9EO1lBQW5DLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFMaEUsY0FBUyxHQUFHLElBQUksR0FBRyxFQUE2QixDQUFDO1lBQ2pELHdCQUFtQixHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO1lBTTVELElBQUksQ0FBQyxLQUFLLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQ0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUVELEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxNQUFjLEVBQUUsUUFBOEIsRUFBRSxLQUFhLEVBQUUsT0FBa0M7WUFDakksTUFBTSxRQUFRLEdBQXNCO2dCQUNuQyxLQUFLO2dCQUNMLE9BQU8sRUFBRSxTQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztnQkFDNUIsUUFBUTtnQkFDUixLQUFLLEVBQUUsS0FBSztnQkFDWixtQkFBbUIsRUFBRSxLQUFLLEVBQUUsR0FBUSxFQUFFLEVBQUU7b0JBQ3ZDLE9BQU8sU0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLHNDQUF1QixFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDaEgsQ0FBQzthQUNELENBQUM7WUFDRixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDckMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFFRCxLQUFLLENBQUMsNEJBQTRCLENBQUMsTUFBYztZQUNoRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUM5QjtZQUNELElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDekMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUN4QztRQUNGLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN2QixJQUFBLG1CQUFPLEVBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2xDLENBQUM7S0FDRCxDQUFBO0lBMUNZLGtEQUFtQjtrQ0FBbkIsbUJBQW1CO1FBRC9CLElBQUEsdUNBQW9CLEVBQUMsOEJBQVcsQ0FBQyxtQkFBbUIsQ0FBQztRQVNuRCxXQUFBLDZCQUFpQixDQUFBO09BUlAsbUJBQW1CLENBMEMvQiJ9