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
    let NativeExtensionTipsService = class NativeExtensionTipsService extends extensionTipsService_1.$C4b {
        constructor(fileService, productService, sharedProcessService) {
            super(fileService, productService);
            this.g = sharedProcessService.getChannel('extensionTipsService');
        }
        getConfigBasedTips(folder) {
            if (folder.scheme === network_1.Schemas.file) {
                return this.g.call('getConfigBasedTips', [folder]);
            }
            return super.getConfigBasedTips(folder);
        }
        getImportantExecutableBasedTips() {
            return this.g.call('getImportantExecutableBasedTips');
        }
        getOtherExecutableBasedTips() {
            return this.g.call('getOtherExecutableBasedTips');
        }
    };
    NativeExtensionTipsService = __decorate([
        __param(0, files_1.$6j),
        __param(1, productService_1.$kj),
        __param(2, services_1.$A7b)
    ], NativeExtensionTipsService);
    (0, extensions_1.$mr)(extensionManagement_1.$6n, NativeExtensionTipsService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=extensionTipsService.js.map