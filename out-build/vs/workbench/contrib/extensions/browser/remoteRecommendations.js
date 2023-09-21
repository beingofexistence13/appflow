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
define(["require", "exports", "vs/workbench/contrib/extensions/browser/extensionRecommendations", "vs/platform/product/common/productService", "vs/base/common/platform"], function (require, exports, extensionRecommendations_1, productService_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ZUb = void 0;
    let $ZUb = class $ZUb extends extensionRecommendations_1.$PUb {
        get recommendations() { return this.a; }
        constructor(b) {
            super();
            this.b = b;
            this.a = [];
        }
        async c() {
            const extensionTips = { ...this.b.remoteExtensionTips, ...this.b.virtualWorkspaceExtensionTips };
            const currentPlatform = (0, platform_1.$h)(platform_1.$t);
            this.a = Object.values(extensionTips).filter(({ supportedPlatforms }) => !supportedPlatforms || supportedPlatforms.includes(currentPlatform)).map(extension => ({
                extensionId: extension.extensionId.toLowerCase(),
                reason: {
                    reasonId: 6 /* ExtensionRecommendationReason.Application */,
                    reasonText: ''
                }
            }));
        }
    };
    exports.$ZUb = $ZUb;
    exports.$ZUb = $ZUb = __decorate([
        __param(0, productService_1.$kj)
    ], $ZUb);
});
//# sourceMappingURL=remoteRecommendations.js.map