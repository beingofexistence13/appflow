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
define(["require", "exports", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/nls", "vs/workbench/contrib/extensions/common/extensions", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/notification/common/notification", "vs/platform/log/common/log", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, pickerQuickAccess_1, nls_1, extensions_1, extensionManagement_1, notification_1, log_1, panecomposite_1) {
    "use strict";
    var InstallExtensionQuickAccessProvider_1, ManageExtensionsQuickAccessProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ManageExtensionsQuickAccessProvider = exports.InstallExtensionQuickAccessProvider = void 0;
    let InstallExtensionQuickAccessProvider = class InstallExtensionQuickAccessProvider extends pickerQuickAccess_1.PickerQuickAccessProvider {
        static { InstallExtensionQuickAccessProvider_1 = this; }
        static { this.PREFIX = 'ext install '; }
        constructor(paneCompositeService, galleryService, extensionsService, notificationService, logService) {
            super(InstallExtensionQuickAccessProvider_1.PREFIX);
            this.paneCompositeService = paneCompositeService;
            this.galleryService = galleryService;
            this.extensionsService = extensionsService;
            this.notificationService = notificationService;
            this.logService = logService;
        }
        _getPicks(filter, disposables, token) {
            // Nothing typed
            if (!filter) {
                return [{
                        label: (0, nls_1.localize)('type', "Type an extension name to install or search.")
                    }];
            }
            const genericSearchPickItem = {
                label: (0, nls_1.localize)('searchFor', "Press Enter to search for extension '{0}'.", filter),
                accept: () => this.searchExtension(filter)
            };
            // Extension ID typed: try to find it
            if (/\./.test(filter)) {
                return this.getPicksForExtensionId(filter, genericSearchPickItem, token);
            }
            // Extension name typed: offer to search it
            return [genericSearchPickItem];
        }
        async getPicksForExtensionId(filter, fallback, token) {
            try {
                const [galleryExtension] = await this.galleryService.getExtensions([{ id: filter }], token);
                if (token.isCancellationRequested) {
                    return []; // return early if canceled
                }
                if (!galleryExtension) {
                    return [fallback];
                }
                return [{
                        label: (0, nls_1.localize)('install', "Press Enter to install extension '{0}'.", filter),
                        accept: () => this.installExtension(galleryExtension, filter)
                    }];
            }
            catch (error) {
                if (token.isCancellationRequested) {
                    return []; // expected error
                }
                this.logService.error(error);
                return [fallback];
            }
        }
        async installExtension(extension, name) {
            try {
                await openExtensionsViewlet(this.paneCompositeService, `@id:${name}`);
                await this.extensionsService.installFromGallery(extension);
            }
            catch (error) {
                this.notificationService.error(error);
            }
        }
        async searchExtension(name) {
            openExtensionsViewlet(this.paneCompositeService, name);
        }
    };
    exports.InstallExtensionQuickAccessProvider = InstallExtensionQuickAccessProvider;
    exports.InstallExtensionQuickAccessProvider = InstallExtensionQuickAccessProvider = InstallExtensionQuickAccessProvider_1 = __decorate([
        __param(0, panecomposite_1.IPaneCompositePartService),
        __param(1, extensionManagement_1.IExtensionGalleryService),
        __param(2, extensionManagement_1.IExtensionManagementService),
        __param(3, notification_1.INotificationService),
        __param(4, log_1.ILogService)
    ], InstallExtensionQuickAccessProvider);
    let ManageExtensionsQuickAccessProvider = class ManageExtensionsQuickAccessProvider extends pickerQuickAccess_1.PickerQuickAccessProvider {
        static { ManageExtensionsQuickAccessProvider_1 = this; }
        static { this.PREFIX = 'ext '; }
        constructor(paneCompositeService) {
            super(ManageExtensionsQuickAccessProvider_1.PREFIX);
            this.paneCompositeService = paneCompositeService;
        }
        _getPicks() {
            return [{
                    label: (0, nls_1.localize)('manage', "Press Enter to manage your extensions."),
                    accept: () => openExtensionsViewlet(this.paneCompositeService)
                }];
        }
    };
    exports.ManageExtensionsQuickAccessProvider = ManageExtensionsQuickAccessProvider;
    exports.ManageExtensionsQuickAccessProvider = ManageExtensionsQuickAccessProvider = ManageExtensionsQuickAccessProvider_1 = __decorate([
        __param(0, panecomposite_1.IPaneCompositePartService)
    ], ManageExtensionsQuickAccessProvider);
    async function openExtensionsViewlet(paneCompositeService, search = '') {
        const viewlet = await paneCompositeService.openPaneComposite(extensions_1.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
        const view = viewlet?.getViewPaneContainer();
        view?.search(search);
        view?.focus();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1F1aWNrQWNjZXNzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9icm93c2VyL2V4dGVuc2lvbnNRdWlja0FjY2Vzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBY3pGLElBQU0sbUNBQW1DLEdBQXpDLE1BQU0sbUNBQW9DLFNBQVEsNkNBQWlEOztpQkFFbEcsV0FBTSxHQUFHLGNBQWMsQUFBakIsQ0FBa0I7UUFFL0IsWUFDNkMsb0JBQStDLEVBQ2hELGNBQXdDLEVBQ3JDLGlCQUE4QyxFQUNyRCxtQkFBeUMsRUFDbEQsVUFBdUI7WUFFckQsS0FBSyxDQUFDLHFDQUFtQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBTk4seUJBQW9CLEdBQXBCLG9CQUFvQixDQUEyQjtZQUNoRCxtQkFBYyxHQUFkLGNBQWMsQ0FBMEI7WUFDckMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUE2QjtZQUNyRCx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQ2xELGVBQVUsR0FBVixVQUFVLENBQWE7UUFHdEQsQ0FBQztRQUVTLFNBQVMsQ0FBQyxNQUFjLEVBQUUsV0FBNEIsRUFBRSxLQUF3QjtZQUV6RixnQkFBZ0I7WUFDaEIsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixPQUFPLENBQUM7d0JBQ1AsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLE1BQU0sRUFBRSw4Q0FBOEMsQ0FBQztxQkFDdkUsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxNQUFNLHFCQUFxQixHQUEyQjtnQkFDckQsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFdBQVcsRUFBRSw0Q0FBNEMsRUFBRSxNQUFNLENBQUM7Z0JBQ2xGLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQzth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