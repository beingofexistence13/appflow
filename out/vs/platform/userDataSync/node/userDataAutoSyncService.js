var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/event", "vs/platform/native/common/native", "vs/platform/product/common/productService", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/userDataSync/common/userDataAutoSyncService", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/platform/userDataSync/common/userDataSyncMachines"], function (require, exports, event_1, native_1, productService_1, storage_1, telemetry_1, userDataAutoSyncService_1, userDataSync_1, userDataSyncAccount_1, userDataSyncMachines_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataAutoSyncService = void 0;
    let UserDataAutoSyncService = class UserDataAutoSyncService extends userDataAutoSyncService_1.UserDataAutoSyncService {
        constructor(productService, userDataSyncStoreManagementService, userDataSyncStoreService, userDataSyncEnablementService, userDataSyncService, nativeHostService, logService, authTokenService, telemetryService, userDataSyncMachinesService, storageService) {
            super(productService, userDataSyncStoreManagementService, userDataSyncStoreService, userDataSyncEnablementService, userDataSyncService, logService, authTokenService, telemetryService, userDataSyncMachinesService, storageService);
            this._register(event_1.Event.debounce(event_1.Event.any(event_1.Event.map(nativeHostService.onDidFocusWindow, () => 'windowFocus'), event_1.Event.map(nativeHostService.onDidOpenWindow, () => 'windowOpen')), (last, source) => last ? [...last, source] : [source], 1000)(sources => this.triggerSync(sources, true, false)));
        }
    };
    exports.UserDataAutoSyncService = UserDataAutoSyncService;
    exports.UserDataAutoSyncService = UserDataAutoSyncService = __decorate([
        __param(0, productService_1.IProductService),
        __param(1, userDataSync_1.IUserDataSyncStoreManagementService),
        __param(2, userDataSync_1.IUserDataSyncStoreService),
        __param(3, userDataSync_1.IUserDataSyncEnablementService),
        __param(4, userDataSync_1.IUserDataSyncService),
        __param(5, native_1.INativeHostService),
        __param(6, userDataSync_1.IUserDataSyncLogService),
        __param(7, userDataSyncAccount_1.IUserDataSyncAccountService),
        __param(8, telemetry_1.ITelemetryService),
        __param(9, userDataSyncMachines_1.IUserDataSyncMachinesService),
        __param(10, storage_1.IStorageService)
    ], UserDataAutoSyncService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFBdXRvU3luY1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91c2VyRGF0YVN5bmMvbm9kZS91c2VyRGF0YUF1dG9TeW5jU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBZU8sSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBd0IsU0FBUSxpREFBMkI7UUFFdkUsWUFDa0IsY0FBK0IsRUFDWCxrQ0FBdUUsRUFDakYsd0JBQW1ELEVBQzlDLDZCQUE2RCxFQUN2RSxtQkFBeUMsRUFDM0MsaUJBQXFDLEVBQ2hDLFVBQW1DLEVBQy9CLGdCQUE2QyxFQUN2RCxnQkFBbUMsRUFDeEIsMkJBQXlELEVBQ3RFLGNBQStCO1lBRWhELEtBQUssQ0FBQyxjQUFjLEVBQUUsa0NBQWtDLEVBQUUsd0JBQXdCLEVBQUUsNkJBQTZCLEVBQUUsbUJBQW1CLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLDJCQUEyQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBRXJPLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBSyxDQUFDLFFBQVEsQ0FBbUIsYUFBSyxDQUFDLEdBQUcsQ0FDeEQsYUFBSyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFDbEUsYUFBSyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQ2hFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JILENBQUM7S0FFRCxDQUFBO0lBdkJZLDBEQUF1QjtzQ0FBdkIsdUJBQXVCO1FBR2pDLFdBQUEsZ0NBQWUsQ0FBQTtRQUNmLFdBQUEsa0RBQW1DLENBQUE7UUFDbkMsV0FBQSx3Q0FBeUIsQ0FBQTtRQUN6QixXQUFBLDZDQUE4QixDQUFBO1FBQzlCLFdBQUEsbUNBQW9CLENBQUE7UUFDcEIsV0FBQSwyQkFBa0IsQ0FBQTtRQUNsQixXQUFBLHNDQUF1QixDQUFBO1FBQ3ZCLFdBQUEsaURBQTJCLENBQUE7UUFDM0IsV0FBQSw2QkFBaUIsQ0FBQTtRQUNqQixXQUFBLG1EQUE0QixDQUFBO1FBQzVCLFlBQUEseUJBQWUsQ0FBQTtPQWJMLHVCQUF1QixDQXVCbkMifQ==