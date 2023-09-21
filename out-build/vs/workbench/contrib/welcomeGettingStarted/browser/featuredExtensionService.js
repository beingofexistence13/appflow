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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/instantiation/common/extensions", "vs/platform/product/common/productService", "vs/base/common/cancellation", "vs/platform/storage/common/storage", "vs/nls!vs/workbench/contrib/welcomeGettingStarted/browser/featuredExtensionService", "vs/platform/extensions/common/extensions", "vs/workbench/services/extensions/common/extensions"], function (require, exports, instantiation_1, lifecycle_1, extensionManagement_1, extensions_1, productService_1, cancellation_1, storage_1, nls_1, extensions_2, extensions_3) {
    "use strict";
    var $SYb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$SYb = exports.$RYb = void 0;
    exports.$RYb = (0, instantiation_1.$Bh)('featuredExtensionsService');
    var FeaturedExtensionMetadataType;
    (function (FeaturedExtensionMetadataType) {
        FeaturedExtensionMetadataType[FeaturedExtensionMetadataType["Title"] = 0] = "Title";
        FeaturedExtensionMetadataType[FeaturedExtensionMetadataType["Description"] = 1] = "Description";
        FeaturedExtensionMetadataType[FeaturedExtensionMetadataType["ImagePath"] = 2] = "ImagePath";
    })(FeaturedExtensionMetadataType || (FeaturedExtensionMetadataType = {}));
    let $SYb = class $SYb extends lifecycle_1.$kc {
        static { $SYb_1 = this; }
        static { this.c = 'workbench.welcomePage.extensionMetadata'; }
        constructor(f, g, h, j, m) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = new Set();
            this.b = false;
            this.title = (0, nls_1.localize)(0, null);
        }
        async getExtensions() {
            await this.n();
            const featuredExtensions = [];
            for (const extension of this.j.featuredExtensions?.filter(e => !this.a.has(e.id)) ?? []) {
                const resolvedExtension = await this.r(extension);
                if (resolvedExtension) {
                    featuredExtensions.push(resolvedExtension);
                }
            }
            return featuredExtensions;
        }
        async n() {
            if (this.b) {
                return;
            }
            const featuredExtensions = this.j.featuredExtensions;
            if (!featuredExtensions) {
                this.b = true;
                return;
            }
            await this.g.whenInstalledExtensionsRegistered();
            const installed = await this.f.getInstalled();
            for (const extension of featuredExtensions) {
                if (installed.some(e => extensions_2.$Vl.equals(e.identifier.id, extension.id))) {
                    this.a.add(extension.id);
                }
                else {
                    let galleryExtension;
                    try {
                        galleryExtension = (await this.m.getExtensions([{ id: extension.id }], cancellation_1.CancellationToken.None))[0];
                    }
                    catch (err) {
                        continue;
                    }
                    if (!await this.f.canInstall(galleryExtension)) {
                        this.a.add(extension.id);
                    }
                }
            }
            this.b = true;
        }
        async r(productMetadata) {
            const title = productMetadata.title ?? await this.s(productMetadata.id, 0 /* FeaturedExtensionMetadataType.Title */);
            const description = productMetadata.description ?? await this.s(productMetadata.id, 1 /* FeaturedExtensionMetadataType.Description */);
            const imagePath = productMetadata.imagePath ?? await this.s(productMetadata.id, 2 /* FeaturedExtensionMetadataType.ImagePath */);
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
        async s(extensionId, key) {
            const storageMetadata = this.t(extensionId);
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
            return await this.u(extensionId, key);
        }
        t(extensionId) {
            const metadata = this.h.get($SYb_1.c + '.' + extensionId, -1 /* StorageScope.APPLICATION */);
            if (metadata) {
                const value = JSON.parse(metadata);
                const lastUpdateDate = new Date().getTime() - value.date;
                if (lastUpdateDate < 1000 * 60 * 60 * 24 * 7) {
                    return value;
                }
            }
            return undefined;
        }
        async u(extensionId, key) {
            const storageKey = $SYb_1.c + '.' + extensionId;
            this.h.remove(storageKey, -1 /* StorageScope.APPLICATION */);
            let metadata;
            let galleryExtension;
            try {
                galleryExtension = (await this.m.getExtensions([{ id: extensionId }], cancellation_1.CancellationToken.None))[0];
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
            this.h.store(storageKey, JSON.stringify({
                title: galleryExtension.displayName,
                description: galleryExtension.description,
                imagePath: galleryExtension.assets.icon?.uri,
                date: new Date().getTime()
            }), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
            return metadata;
        }
    };
    exports.$SYb = $SYb;
    exports.$SYb = $SYb = $SYb_1 = __decorate([
        __param(0, extensionManagement_1.$2n),
        __param(1, extensions_3.$MF),
        __param(2, storage_1.$Vo),
        __param(3, productService_1.$kj),
        __param(4, extensionManagement_1.$Zn)
    ], $SYb);
    (0, extensions_1.$mr)(exports.$RYb, $SYb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=featuredExtensionService.js.map