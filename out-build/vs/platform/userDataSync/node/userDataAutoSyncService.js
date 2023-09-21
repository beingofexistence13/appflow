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
    exports.$j8b = void 0;
    let $j8b = class $j8b extends userDataAutoSyncService_1.$L4b {
        constructor(productService, userDataSyncStoreManagementService, userDataSyncStoreService, userDataSyncEnablementService, userDataSyncService, nativeHostService, logService, authTokenService, telemetryService, userDataSyncMachinesService, storageService) {
            super(productService, userDataSyncStoreManagementService, userDataSyncStoreService, userDataSyncEnablementService, userDataSyncService, logService, authTokenService, telemetryService, userDataSyncMachinesService, storageService);
            this.B(event_1.Event.debounce(event_1.Event.any(event_1.Event.map(nativeHostService.onDidFocusWindow, () => 'windowFocus'), event_1.Event.map(nativeHostService.onDidOpenWindow, () => 'windowOpen')), (last, source) => last ? [...last, source] : [source], 1000)(sources => this.triggerSync(sources, true, false)));
        }
    };
    exports.$j8b = $j8b;
    exports.$j8b = $j8b = __decorate([
        __param(0, productService_1.$kj),
        __param(1, userDataSync_1.$Egb),
        __param(2, userDataSync_1.$Fgb),
        __param(3, userDataSync_1.$Pgb),
        __param(4, userDataSync_1.$Qgb),
        __param(5, native_1.$05b),
        __param(6, userDataSync_1.$Ugb),
        __param(7, userDataSyncAccount_1.$Ezb),
        __param(8, telemetry_1.$9k),
        __param(9, userDataSyncMachines_1.$sgb),
        __param(10, storage_1.$Vo)
    ], $j8b);
});
//# sourceMappingURL=userDataAutoSyncService.js.map