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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/platform/environment/common/environment", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, event_1, lifecycle_1, platform_1, environment_1, storage_1, telemetry_1, userDataSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncEnablementService = void 0;
    const enablementKey = 'sync.enable';
    let UserDataSyncEnablementService = class UserDataSyncEnablementService extends lifecycle_1.Disposable {
        constructor(storageService, telemetryService, environmentService, userDataSyncStoreManagementService) {
            super();
            this.storageService = storageService;
            this.telemetryService = telemetryService;
            this.environmentService = environmentService;
            this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
            this._onDidChangeEnablement = new event_1.Emitter();
            this.onDidChangeEnablement = this._onDidChangeEnablement.event;
            this._onDidChangeResourceEnablement = new event_1.Emitter();
            this.onDidChangeResourceEnablement = this._onDidChangeResourceEnablement.event;
            this._register(storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, undefined, this._register(new lifecycle_1.DisposableStore()))(e => this.onDidStorageChange(e)));
        }
        isEnabled() {
            switch (this.environmentService.sync) {
                case 'on':
                    return true;
                case 'off':
                    return false;
            }
            return this.storageService.getBoolean(enablementKey, -1 /* StorageScope.APPLICATION */, false);
        }
        canToggleEnablement() {
            return this.userDataSyncStoreManagementService.userDataSyncStore !== undefined && this.environmentService.sync === undefined;
        }
        setEnablement(enabled) {
            if (enabled && !this.canToggleEnablement()) {
                return;
            }
            this.telemetryService.publicLog2(enablementKey, { enabled });
            this.storageService.store(enablementKey, enabled, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        isResourceEnabled(resource) {
            return this.storageService.getBoolean((0, userDataSync_1.getEnablementKey)(resource), -1 /* StorageScope.APPLICATION */, true);
        }
        setResourceEnablement(resource, enabled) {
            if (this.isResourceEnabled(resource) !== enabled) {
                const resourceEnablementKey = (0, userDataSync_1.getEnablementKey)(resource);
                this.storeResourceEnablement(resourceEnablementKey, enabled);
            }
        }
        getResourceSyncStateVersion(resource) {
            return undefined;
        }
        storeResourceEnablement(resourceEnablementKey, enabled) {
            this.storageService.store(resourceEnablementKey, enabled, -1 /* StorageScope.APPLICATION */, platform_1.isWeb ? 0 /* StorageTarget.USER */ : 1 /* StorageTarget.MACHINE */);
        }
        onDidStorageChange(storageChangeEvent) {
            if (enablementKey === storageChangeEvent.key) {
                this._onDidChangeEnablement.fire(this.isEnabled());
                return;
            }
            const resourceKey = userDataSync_1.ALL_SYNC_RESOURCES.filter(resourceKey => (0, userDataSync_1.getEnablementKey)(resourceKey) === storageChangeEvent.key)[0];
            if (resourceKey) {
                this._onDidChangeResourceEnablement.fire([resourceKey, this.isResourceEnabled(resourceKey)]);
                return;
            }
        }
    };
    exports.UserDataSyncEnablementService = UserDataSyncEnablementService;
    exports.UserDataSyncEnablementService = UserDataSyncEnablementService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, environment_1.IEnvironmentService),
        __param(3, userDataSync_1.IUserDataSyncStoreManagementService)
    ], UserDataSyncEnablementService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jRW5hYmxlbWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS91c2VyRGF0YVN5bmMvY29tbW9uL3VzZXJEYXRhU3luY0VuYWJsZW1lbnRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdCaEcsTUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBRTdCLElBQU0sNkJBQTZCLEdBQW5DLE1BQU0sNkJBQThCLFNBQVEsc0JBQVU7UUFVNUQsWUFDa0IsY0FBZ0QsRUFDOUMsZ0JBQW9ELEVBQ2xELGtCQUEwRCxFQUMxQyxrQ0FBd0Y7WUFFN0gsS0FBSyxFQUFFLENBQUM7WUFMMEIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQzdCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDL0IsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUN6Qix1Q0FBa0MsR0FBbEMsa0NBQWtDLENBQXFDO1lBVnRILDJCQUFzQixHQUFHLElBQUksZUFBTyxFQUFXLENBQUM7WUFDL0MsMEJBQXFCLEdBQW1CLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7WUFFM0UsbUNBQThCLEdBQUcsSUFBSSxlQUFPLEVBQTJCLENBQUM7WUFDdkUsa0NBQTZCLEdBQW1DLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxLQUFLLENBQUM7WUFTbEgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLG9DQUEyQixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlKLENBQUM7UUFFRCxTQUFTO1lBQ1IsUUFBUSxJ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