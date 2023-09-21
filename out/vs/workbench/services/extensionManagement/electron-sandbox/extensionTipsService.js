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
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/ipc/electron-sandbox/services", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionTipsService", "vs/platform/files/common/files", "vs/platform/product/common/productService", "vs/base/common/network"], function (require, exports, extensions_1, services_1, extensionManagement_1, extensionTipsService_1, files_1, productService_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let NativeExtensionTipsService = class NativeExtensionTipsService extends extensionTipsService_1.ExtensionTipsService {
        constructor(fileService, productService, sharedProcessService) {
            super(fileService, productService);
            this.channel = sharedProcessService.getChannel('extensionTipsService');
        }
        getConfigBasedTips(folder) {
            if (folder.scheme === network_1.Schemas.file) {
                return this.channel.call('getConfigBasedTips', [folder]);
            }
            return super.getConfigBasedTips(folder);
        }
        getImportantExecutableBasedTips() {
            return this.channel.call('getImportantExecutableBasedTips');
        }
        getOtherExecutableBasedTips() {
            return this.channel.call('getOtherExecutableBasedTips');
        }
    };
    NativeExtensionTipsService = __decorate([
        __param(0, files_1.IFileService),
        __param(1, productService_1.IProductService),
        __param(2, services_1.ISharedProcessService)
    ], NativeExtensionTipsService);
    (0, extensions_1.registerSingleton)(extensionManagement_1.IExtensionTipsService, NativeExtensionTipsService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uVGlwc1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZXh0ZW5zaW9uTWFuYWdlbWVudC9lbGVjdHJvbi1zYW5kYm94L2V4dGVuc2lvblRpcHNTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7O0lBWWhHLElBQU0sMEJBQTBCLEdBQWhDLE1BQU0sMEJBQTJCLFNBQVEsMkNBQW9CO1FBSTVELFlBQ2UsV0FBeUIsRUFDdEIsY0FBK0IsRUFDekIsb0JBQTJDO1lBRWxFLEtBQUssQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBRVEsa0JBQWtCLENBQUMsTUFBVztZQUN0QyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxJQUFJLEVBQUU7Z0JBQ25DLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQTZCLG9CQUFvQixFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzthQUNyRjtZQUNELE9BQU8sS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFFUSwrQkFBK0I7WUFDdkMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBaUMsaUNBQWlDLENBQUMsQ0FBQztRQUM3RixDQUFDO1FBRVEsMkJBQTJCO1lBQ25DLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQWlDLDZCQUE2QixDQUFDLENBQUM7UUFDekYsQ0FBQztLQUVELENBQUE7SUE1QkssMEJBQTBCO1FBSzdCLFdBQUEsb0JBQVksQ0FBQTtRQUNaLFdBQUEsZ0NBQWUsQ0FBQTtRQUNmLFdBQUEsZ0NBQXFCLENBQUE7T0FQbEIsMEJBQTBCLENBNEIvQjtJQUVELElBQUEsOEJBQWlCLEVBQUMsMkNBQXFCLEVBQUUsMEJBQTBCLG9DQUE0QixDQUFDIn0=