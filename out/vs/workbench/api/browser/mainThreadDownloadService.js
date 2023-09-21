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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/platform/download/common/download", "vs/base/common/uri"], function (require, exports, lifecycle_1, extHost_protocol_1, extHostCustomers_1, download_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadDownloadService = void 0;
    let MainThreadDownloadService = class MainThreadDownloadService extends lifecycle_1.Disposable {
        constructor(extHostContext, downloadService) {
            super();
            this.downloadService = downloadService;
        }
        $download(uri, to) {
            return this.downloadService.download(uri_1.URI.revive(uri), uri_1.URI.revive(to));
        }
    };
    exports.MainThreadDownloadService = MainThreadDownloadService;
    exports.MainThreadDownloadService = MainThreadDownloadService = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadDownloadService),
        __param(1, download_1.IDownloadService)
    ], MainThreadDownloadService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZERvd25sb2FkU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkRG93bmxvYWRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVN6RixJQUFNLHlCQUF5QixHQUEvQixNQUFNLHlCQUEwQixTQUFRLHNCQUFVO1FBRXhELFlBQ0MsY0FBK0IsRUFDSSxlQUFpQztZQUVwRSxLQUFLLEVBQUUsQ0FBQztZQUYyQixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFHckUsQ0FBQztRQUVELFNBQVMsQ0FBQyxHQUFrQixFQUFFLEVBQWlCO1lBQzlDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsU0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDdkUsQ0FBQztLQUVELENBQUE7SUFiWSw4REFBeUI7d0NBQXpCLHlCQUF5QjtRQURyQyxJQUFBLHVDQUFvQixFQUFDLDhCQUFXLENBQUMseUJBQXlCLENBQUM7UUFLekQsV0FBQSwyQkFBZ0IsQ0FBQTtPQUpOLHlCQUF5QixDQWFyQyJ9