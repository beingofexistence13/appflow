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
define(["require", "exports", "vs/workbench/contrib/extensions/browser/extensionRecommendations", "vs/platform/product/common/productService", "vs/nls", "vs/workbench/services/extensionManagement/common/extensionManagement"], function (require, exports, extensionRecommendations_1, productService_1, nls_1, extensionManagement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebRecommendations = void 0;
    let WebRecommendations = class WebRecommendations extends extensionRecommendations_1.ExtensionRecommendations {
        get recommendations() { return this._recommendations; }
        constructor(productService, extensionManagementServerService) {
            super();
            this.productService = productService;
            this.extensionManagementServerService = extensionManagementServerService;
            this._recommendations = [];
        }
        async doActivate() {
            const isOnlyWeb = this.extensionManagementServerService.webExtensionManagementServer && !this.extensionManagementServerService.localExtensionManagementServer && !this.extensionManagementServerService.remoteExtensionManagementServer;
            if (isOnlyWeb && Array.isArray(this.productService.webExtensionTips)) {
                this._recommendations = this.productService.webExtensionTips.map(extensionId => ({
                    extensionId: extensionId.toLowerCase(),
                    reason: {
                        reasonId: 6 /* ExtensionRecommendationReason.Application */,
                        reasonText: (0, nls_1.localize)('reason', "This extension is recommended for {0} for the Web", this.productService.nameLong)
                    }
                }));
            }
        }
    };
    exports.WebRecommendations = WebRecommendations;
    exports.WebRecommendations = WebRecommendations = __decorate([
        __param(0, productService_1.IProductService),
        __param(1, extensionManagement_1.IExtensionManagementServerService)
    ], WebRecommendations);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViUmVjb21tZW5kYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9icm93c2VyL3dlYlJlY29tbWVuZGF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFRekYsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBbUIsU0FBUSxtREFBd0I7UUFHL0QsSUFBSSxlQUFlLEtBQTZDLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUUvRixZQUNrQixjQUFnRCxFQUM5QixnQ0FBb0Y7WUFFdkgsS0FBSyxFQUFFLENBQUM7WUFIMEIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ2IscUNBQWdDLEdBQWhDLGdDQUFnQyxDQUFtQztZQUxoSCxxQkFBZ0IsR0FBOEIsRUFBRSxDQUFDO1FBUXpELENBQUM7UUFFUyxLQUFLLENBQUMsVUFBVTtZQUN6QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsNEJBQTRCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsOEJBQThCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsK0JBQStCLENBQUM7WUFDeE8sSUFBSSxTQUFTLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7Z0JBQ3JFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQTBCO29CQUN6RyxXQUFXLEVBQUUsV0FBVyxDQUFDLFdBQVcsRUFBRTtvQkFDdEMsTUFBTSxFQUFFO3dCQUNQLFFBQVEsbURBQTJDO3dCQUNuRCxVQUFVLEVBQUUsSUFBQSxjQUFRLEVBQUMsUUFBUSxFQUFFLG1EQUFtRCxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDO3FCQUNqSDtpQkFDQSxDQUFBLENBQUMsQ0FBQzthQUNKO1FBQ0YsQ0FBQztLQUVELENBQUE7SUF6QlksZ0RBQWtCO2lDQUFsQixrQkFBa0I7UUFNNUIsV0FBQSxnQ0FBZSxDQUFBO1FBQ2YsV0FBQSx1REFBaUMsQ0FBQTtPQVB2QixrQkFBa0IsQ0F5QjlCIn0=