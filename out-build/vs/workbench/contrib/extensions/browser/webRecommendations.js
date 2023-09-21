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
define(["require", "exports", "vs/workbench/contrib/extensions/browser/extensionRecommendations", "vs/platform/product/common/productService", "vs/nls!vs/workbench/contrib/extensions/browser/webRecommendations", "vs/workbench/services/extensionManagement/common/extensionManagement"], function (require, exports, extensionRecommendations_1, productService_1, nls_1, extensionManagement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$YUb = void 0;
    let $YUb = class $YUb extends extensionRecommendations_1.$PUb {
        get recommendations() { return this.a; }
        constructor(b, g) {
            super();
            this.b = b;
            this.g = g;
            this.a = [];
        }
        async c() {
            const isOnlyWeb = this.g.webExtensionManagementServer && !this.g.localExtensionManagementServer && !this.g.remoteExtensionManagementServer;
            if (isOnlyWeb && Array.isArray(this.b.webExtensionTips)) {
                this.a = this.b.webExtensionTips.map(extensionId => ({
                    extensionId: extensionId.toLowerCase(),
                    reason: {
                        reasonId: 6 /* ExtensionRecommendationReason.Application */,
                        reasonText: (0, nls_1.localize)(0, null, this.b.nameLong)
                    }
                }));
            }
        }
    };
    exports.$YUb = $YUb;
    exports.$YUb = $YUb = __decorate([
        __param(0, productService_1.$kj),
        __param(1, extensionManagement_1.$fcb)
    ], $YUb);
});
//# sourceMappingURL=webRecommendations.js.map