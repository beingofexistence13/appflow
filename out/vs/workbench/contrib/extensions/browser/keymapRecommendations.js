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
define(["require", "exports", "vs/workbench/contrib/extensions/browser/extensionRecommendations", "vs/platform/product/common/productService"], function (require, exports, extensionRecommendations_1, productService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeymapRecommendations = void 0;
    let KeymapRecommendations = class KeymapRecommendations extends extensionRecommendations_1.ExtensionRecommendations {
        get recommendations() { return this._recommendations; }
        constructor(productService) {
            super();
            this.productService = productService;
            this._recommendations = [];
        }
        async doActivate() {
            if (this.productService.keymapExtensionTips) {
                this._recommendations = this.productService.keymapExtensionTips.map(extensionId => ({
                    extensionId: extensionId.toLowerCase(),
                    reason: {
                        reasonId: 6 /* ExtensionRecommendationReason.Application */,
                        reasonText: ''
                    }
                }));
            }
        }
    };
    exports.KeymapRecommendations = KeymapRecommendations;
    exports.KeymapRecommendations = KeymapRecommendations = __decorate([
        __param(0, productService_1.IProductService)
    ], KeymapRecommendations);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5bWFwUmVjb21tZW5kYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9icm93c2VyL2tleW1hcFJlY29tbWVuZGF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFNekYsSUFBTSxxQkFBcUIsR0FBM0IsTUFBTSxxQkFBc0IsU0FBUSxtREFBd0I7UUFHbEUsSUFBSSxlQUFlLEtBQTZDLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUUvRixZQUNrQixjQUFnRDtZQUVqRSxLQUFLLEVBQUUsQ0FBQztZQUYwQixtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFKMUQscUJBQWdCLEdBQThCLEVBQUUsQ0FBQztRQU96RCxDQUFDO1FBRVMsS0FBSyxDQUFDLFVBQVU7WUFDekIsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLG1CQUFtQixFQUFFO2dCQUM1QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUEwQjtvQkFDNUcsV0FBVyxFQUFFLFdBQVcsQ0FBQyxXQUFXLEVBQUU7b0JBQ3RDLE1BQU0sRUFBRTt3QkFDUCxRQUFRLG1EQUEyQzt3QkFDbkQsVUFBVSxFQUFFLEVBQUU7cUJBQ2Q7aUJBQ0EsQ0FBQSxDQUFDLENBQUM7YUFDSjtRQUNGLENBQUM7S0FFRCxDQUFBO0lBdkJZLHNEQUFxQjtvQ0FBckIscUJBQXFCO1FBTS9CLFdBQUEsZ0NBQWUsQ0FBQTtPQU5MLHFCQUFxQixDQXVCakMifQ==