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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/instantiation/common/extensions", "vs/platform/product/common/productService", "vs/base/common/cancellation", "vs/platform/storage/common/storage", "vs/nls", "vs/platform/extensions/common/extensions", "vs/workbench/services/extensions/common/extensions"], function (require, exports, instantiation_1, lifecycle_1, extensionManagement_1, extensions_1, productService_1, cancellation_1, storage_1, nls_1, extensions_2, extensions_3) {
    "use strict";
    var FeaturedExtensionsService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FeaturedExtensionsService = exports.IFeaturedExtensionsService = void 0;
    exports.IFeaturedExtensionsService = (0, instantiation_1.createDecorator)('featuredExtensionsService');
    var FeaturedExtensionMetadataType;
    (function (FeaturedExtensionMetadataType) {
        FeaturedExtensionMetadataType[FeaturedExtensionMetadataType["Title"] = 0] = "Title";
        FeaturedExtensionMetadataType[FeaturedExtensionMetadataType["Description"] = 1] = "Description";
        FeaturedExtensionMetadataType[FeaturedExtensionMetadataType["ImagePath"] = 2] = "ImagePath";
    })(FeaturedExtensionMetadataType || (FeaturedExtensionMetadataType = {}));
    let FeaturedExtensionsService = class FeaturedExtensionsService extends lifecycle_1.Disposable {
        static { FeaturedExtensionsService_1 = this; }
        static { this.STORAGE_KEY = 'workbench.welcomePage.extensionMetadata'; }
        constructor(extensionManagementService, extensionService, storageService, productService, galleryService) {
            super();
            this.extensionManagementService = extensionManagementService;
            this.extensionService = extensionService;
            this.storageService = storageService;
            this.productService = productService;
            this.galleryService = galleryService;
            this.ignoredExtensions = new Set();
            this._isInitialized = false;
            this.title = (0, nls_1.localize)('gettingStarted.featuredTitle', 'Recommended');
        }
        async getExtensions() {
            await this._init();
            const featuredExtensions = [];
            for (const extension of this.productService.featuredExtensions?.filter(e => !this.ignoredExtensions.has(e.id)) ?? []) {
                const resolvedExtension = await this.resolveExtension(extension);
                if (resolvedExtension) {
                    featuredExtensions.push(resolvedExtension);
                }
            }
            return featuredExtensions;
        }
        async _init() {
            if (this._isInitialized) {
                return;
            }
            const featuredExtensions = this.productService.featuredExtensions;
            if (!featuredExtensions) {
                this._isInitialized = true;
                return;
            }
            await this.extensionService.whenInstalledExtensionsRegistered();
            const installed = await this.extensionManagementService.getInstalled();
            for (const extension of featuredExtensions) {
                if (installed.some(e => extensions_2.ExtensionIdentifier.equals(e.identifier.id, extension.id))) {
                    this.ignoredExtensions.add(extension.id);
                }
                else {
                    let galleryExtension;
                    try {
                        galleryExtension = (await this.galleryService.getExtensions([{ id: extension.id }], cancellation_1.CancellationToken.None))[0];
                    }
                    catch (err) {
                        continue;
                    }
                    if (!await this.extensionManagementService.canInstall(galleryExtension)) {
                        this.ignoredExtensions.add(extension.id);
                    }
                }
            }
            this._isInitialized = true;
        }
        async resolveExtension(productMetadata) {
            const title = productMetadata.title ?? await this.getMetadata(productMetadata.id, 0 /* FeaturedExtensionMetadataType.Title */);
            const description = productMetadata.description ?? await this.getMetadata(productMetadata.id, 1 /* FeaturedExtensionMetadataType.Description */);
            const imagePath = productMetadata.imagePath ?? await this.getMetadata(productMetadata.id, 2 /* FeaturedExtensionMetadataType.ImagePath */);
            if (title && description && imagePath) {
                return {
                    id: productMetadata.id,
                    title: title,
                    description: description,
                    imagePath: imagePath,
                };
            }
            return undefined;
        }
        async getMetadata(extensionId, key) {
            const storageMetadata = this.getStorageData(extensionId);
            if (storageMetadata) {
                switch (key) {
                    case 0 /* FeaturedExtensionMetadataType.Title */: {
                        return storageMetadata.title;
                    }
                    case 1 /* FeaturedExtensionMetadataType.Description */: {
                        return storageMetadata.description;
                    }
                    case 2 /* FeaturedExtensionMetadataType.ImagePath */: {
                        return storageMetadata.imagePath;
                    }
                    default:
                        return undefined;
                }
            }
            return await this.getGalleryMetadata(extensionId, key);
        }
        getStorageData(extensionId) {
            const metadata = this.storageService.get(FeaturedExtensionsService_1.STORAGE_KEY + '.' + extensionId, -1 /* StorageScope.APPLICATION */);
            if (metadata) {
                const value = JSON.parse(metadata);
                const lastUpdateDate = new Date().getTime() - value.date;
                if (lastUpdateDate < 1000 * 60 * 60 * 24 * 7) {
                    return value;
                }
            }
            return undefined;
        }
        async getGalleryMetadata(extensionId, key) {
            const storageKey = FeaturedExtensionsService_1.STORAGE_KEY + '.' + extensionId;
            this.storageService.remove(storageKey, -1 /* StorageScope.APPLICATION */);
            let metadata;
            let galleryExtension;
            try {
                galleryExtension = (await this.galleryService.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None))[0];
            }
            catch (err) {
            }
            if (!galleryExtension) {
                return metadata;
            }
            switch (key) {
                case 0 /* FeaturedExtensionMetadataType.Title */: {
                    metadata = galleryExtension.displayName;
                    break;
                }
                case 1 /* FeaturedExtensionMetadataType.Description */: {
                    metadata = galleryExtension.description;
                    break;
                }
                case 2 /* FeaturedExtensionMetadataType.ImagePath */: {
                    metadata = galleryExtension.assets.icon?.uri;
                    break;
                }
            }
            this.storageService.store(storageKey, JSON.stringify({
                title: galleryExtension.displayName,
                description: galleryExtension.description,
                imagePath: galleryExtension.assets.icon?.uri,
                date: new Date().getTime()
            }), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            return metadata;
        }
    };
    exports.FeaturedExtensionsService = FeaturedExtensionsService;
    exports.FeaturedExtensionsService = FeaturedExtensionsService = FeaturedExtensionsService_1 = __decorate([
        __param(0, extensionManagement_1.IExtensionManagementService),
        __param(1, extensions_3.IExtensionService),
        __param(2, storage_1.IStorageService),
        __param(3, productService_1.IProductService),
        __param(4, extensionManagement_1.IExtensionGalleryService)
    ], FeaturedExtensionsService);
    (0, extensions_1.registerSingleton)(exports.IFeaturedExtensionsService, FeaturedExtensionsService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmVhdHVyZWRFeHRlbnNpb25TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2VsY29tZUdldHRpbmdTdGFydGVkL2Jyb3dzZXIvZmVhdHVyZWRFeHRlbnNpb25TZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFnQm5GLFFBQUEsMEJBQTBCLEdBQUcsSUFBQSwrQkFBZSxFQUE2QiwyQkFBMkIsQ0FBQyxDQUFDO0lBU25ILElBQVcsNkJBSVY7SUFKRCxXQUFXLDZCQUE2QjtRQUN2QyxtRkFBSyxDQUFBO1FBQ0wsK0ZBQVcsQ0FBQTtRQUNYLDJGQUFTLENBQUE7SUFDVixDQUFDLEVBSlUsNkJBQTZCLEtBQTdCLDZCQUE2QixRQUl2QztJQUVNLElBQU0seUJBQXlCLEdBQS9CLE1BQU0seUJBQTBCLFNBQVEsc0JBQVU7O2lCQU1oQyxnQkFBVyxHQUFHLHlDQUF5QyxBQUE1QyxDQUE2QztRQUVoRixZQUM4QiwwQkFBd0UsRUFDbEYsZ0JBQW9ELEVBQ3RELGNBQWdELEVBQ2hELGNBQWdELEVBQ3ZDLGNBQXlEO1lBRW5GLEtBQUssRUFBRSxDQUFDO1lBTnNDLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBNkI7WUFDakUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUNyQyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDL0IsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ3RCLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQVY1RSxzQkFBaUIsR0FBZ0IsSUFBSSxHQUFHLEVBQVUsQ0FBQztZQUNuRCxtQkFBYyxHQUFZLEtBQUssQ0FBQztZQVl2QyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUEsY0FBUSxFQUFDLDhCQUE4QixFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFJRCxLQUFLLENB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