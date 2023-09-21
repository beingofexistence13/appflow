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
define(["require", "exports", "vs/workbench/contrib/extensions/common/extensions", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil"], function (require, exports, extensions_1, notification_1, storage_1, nls_1, instantiation_1, extensionsActions_1, arrays_1, lifecycle_1, extensionManagement_1, extensionManagementUtil_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DeprecatedExtensionsChecker = void 0;
    let DeprecatedExtensionsChecker = class DeprecatedExtensionsChecker extends lifecycle_1.Disposable {
        constructor(extensionsWorkbenchService, extensionManagementService, storageService, notificationService, instantiationService) {
            super();
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.storageService = storageService;
            this.notificationService = notificationService;
            this.instantiationService = instantiationService;
            this.checkForDeprecatedExtensions();
            this._register(extensionManagementService.onDidInstallExtensions(e => {
                const ids = [];
                for (const { local } of e) {
                    if (local && extensionsWorkbenchService.local.find(extension => (0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, local.identifier))?.deprecationInfo) {
                        ids.push(local.identifier.id.toLowerCase());
                    }
                }
                if (ids.length) {
                    this.setNotifiedDeprecatedExtensions(ids);
                }
            }));
        }
        async checkForDeprecatedExtensions() {
            if (this.storageService.getBoolean('extensionsAssistant/doNotCheckDeprecated', 0 /* StorageScope.PROFILE */, false)) {
                return;
            }
            const local = await this.extensionsWorkbenchService.queryLocal();
            const previouslyNotified = this.getNotifiedDeprecatedExtensions();
            const toNotify = local.filter(e => !!e.deprecationInfo).filter(e => !previouslyNotified.includes(e.identifier.id.toLowerCase()));
            if (toNotify.length) {
                this.notificationService.prompt(notification_1.Severity.Warning, (0, nls_1.localize)('deprecated extensions', "You have deprecated extensions installed. We recommend to review them and migrate to alternatives."), [{
                        label: (0, nls_1.localize)('showDeprecated', "Show Deprecated Extensions"),
                        run: async () => {
                            this.setNotifiedDeprecatedExtensions(toNotify.map(e => e.identifier.id.toLowerCase()));
                            const action = this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, toNotify.map(extension => `@id:${extension.identifier.id}`).join(' '));
                            try {
                                await action.run();
                            }
                            finally {
                                action.dispose();
                            }
                        }
                    }, {
                        label: (0, nls_1.localize)('neverShowAgain', "Don't Show Again"),
                        isSecondary: true,
                        run: () => this.storageService.store('extensionsAssistant/doNotCheckDeprecated', true, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */)
                    }]);
            }
        }
        getNotifiedDeprecatedExtensions() {
            return JSON.parse(this.storageService.get('extensionsAssistant/deprecated', 0 /* StorageScope.PROFILE */, '[]'));
        }
        setNotifiedDeprecatedExtensions(notified) {
            this.storageService.store('extensionsAssistant/deprecated', JSON.stringify((0, arrays_1.distinct)([...this.getNotifiedDeprecatedExtensions(), ...notified])), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
    };
    exports.DeprecatedExtensionsChecker = DeprecatedExtensionsChecker;
    exports.DeprecatedExtensionsChecker = DeprecatedExtensionsChecker = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_1.IExtensionManagementService),
        __param(2, storage_1.IStorageService),
        __param(3, notification_1.INotificationService),
        __param(4, instantiation_1.IInstantiationService)
    ], DeprecatedExtensionsChecker);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwcmVjYXRlZEV4dGVuc2lvbnNDaGVja2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9icm93c2VyL2RlcHJlY2F0ZWRFeHRlbnNpb25zQ2hlY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFjekYsSUFBTSwyQkFBMkIsR0FBakMsTUFBTSwyQkFBNEIsU0FBUSxzQkFBVTtRQUUxRCxZQUMrQywwQkFBdUQsRUFDeEUsMEJBQXVELEVBQ2xELGNBQStCLEVBQzFCLG1CQUF5QyxFQUN4QyxvQkFBMkM7WUFFbkYsS0FBSyxFQUFFLENBQUM7WUFOc0MsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUE2QjtZQUVuRSxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7WUFDMUIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtZQUN4Qyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBR25GLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxTQUFTLENBQUMsMEJBQTBCLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BFLE1BQU0sR0FBRyxHQUFhLEVBQUUsQ0FBQztnQkFDekIsS0FBSyxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFO29CQUMxQixJQUFJLEtBQUssSUFBSSwwQkFBMEIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBQSwyQ0FBaUIsRUFBQyxTQUFTLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLGVBQWUsRUFBRTt3QkFDNUksR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFD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