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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/share/common/share", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, cancellation_1, lifecycle_1, uri_1, extHost_protocol_1, share_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadShare = void 0;
    let MainThreadShare = class MainThreadShare {
        constructor(extHostContext, shareService) {
            this.shareService = shareService;
            this.providers = new Map();
            this.providerDisposables = new Map();
            this.proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostShare);
        }
        $registerShareProvider(handle, selector, id, label, priority) {
            const provider = {
                id,
                label,
                selector,
                priority,
                provideShare: async (item) => {
                    const result = await this.proxy.$provideShare(handle, item, new cancellation_1.CancellationTokenSource().token);
                    return typeof result === 'string' ? result : uri_1.URI.revive(result);
                }
            };
            this.providers.set(handle, provider);
            const disposable = this.shareService.registerShareProvider(provider);
            this.providerDisposables.set(handle, disposable);
        }
        $unregisterShareProvider(handle) {
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
    exports.MainThreadShare = MainThreadShare;
    exports.MainThreadShare = MainThreadShare = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadShare),
        __param(1, share_1.IShareService)
    ], MainThreadShare);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZFNoYXJlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRTaGFyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFVekYsSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZTtRQU0zQixZQUNDLGNBQStCLEVBQ2hCLFlBQTRDO1lBQTNCLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBTHBELGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBMEIsQ0FBQztZQUM5Qyx3QkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBdUIsQ0FBQztZQU01RCxJQUFJLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsaUNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBRUQsc0JBQXNCLENBQUMsTUFBYyxFQUFFLFFBQThCLEVBQUUsRUFBVSxFQUFFLEtBQWEsRUFBRSxRQUFnQjtZQUNqSCxNQUFNLFFBQVEsR0FBbUI7Z0JBQ2hDLEVBQUU7Z0JBQ0YsS0FBSztnQkFDTCxRQUFRO2dCQUNSLFFBQVE7Z0JBQ1IsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFvQixFQUFFLEVBQUU7b0JBQzVDLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLHNDQUF1QixFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ2pHLE9BQU8sT0FBTyxNQUFNLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2pFLENBQUM7YUFDRCxDQUFDO1lBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVELHdCQUF3QixDQUFDLE1BQWM7WUFDdEMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDL0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDOUI7WUFDRCxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3pDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDeEM7UUFDRixDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDdkIsSUFBQSxtQkFBTyxFQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNsQyxDQUFDO0tBQ0QsQ0FBQTtJQTNDWSwwQ0FBZTs4QkFBZixlQUFlO1FBRDNCLElBQUEsdUNBQW9CLEVBQUMsOEJBQVcsQ0FBQyxlQUFlLENBQUM7UUFTL0MsV0FBQSxxQkFBYSxDQUFBO09BUkgsZUFBZSxDQTJDM0IifQ==