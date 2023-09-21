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
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/notification/common/notification"], function (require, exports, nls_1, event_1, errors_1, lifecycle_1, extensionManagement_1, extensionManagement_2, extensionRecommendations_1, lifecycle_2, instantiation_1, extensionManagementUtil_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getInstalledExtensions = exports.KeymapExtensions = void 0;
    let KeymapExtensions = class KeymapExtensions extends lifecycle_1.Disposable {
        constructor(instantiationService, extensionEnablementService, tipsService, lifecycleService, notificationService) {
            super();
            this.instantiationService = instantiationService;
            this.extensionEnablementService = extensionEnablementService;
            this.tipsService = tipsService;
            this.notificationService = notificationService;
            this._register(lifecycleService.onDidShutdown(() => this.dispose()));
            this._register(instantiationService.invokeFunction(onExtensionChanged)((identifiers => {
                Promise.all(identifiers.map(identifier => this.checkForOtherKeymaps(identifier)))
                    .then(undefined, errors_1.onUnexpectedError);
            })));
        }
        checkForOtherKeymaps(extensionIdentifier) {
            return this.instantiationService.invokeFunction(getInstalledExtensions).then(extensions => {
                const keymaps = extensions.filter(extension => isKeymapExtension(this.tipsService, extension));
                const extension = keymaps.find(extension => (0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, extensionIdentifier));
                if (extension && extension.globallyEnabled) {
                    const otherKeymaps = keymaps.filter(extension => !(0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, extensionIdentifier) && extension.globallyEnabled);
                    if (otherKeymaps.length) {
                        return this.promptForDisablingOtherKeymaps(extension, otherKeymaps);
                    }
                }
                return undefined;
            });
        }
        promptForDisablingOtherKeymaps(newKeymap, oldKeymaps) {
            const onPrompt = (confirmed) => {
                if (confirmed) {
                    this.extensionEnablementService.setEnablement(oldKeymaps.map(keymap => keymap.local), 6 /* EnablementState.DisabledGlobally */);
                }
            };
            this.notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)('disableOtherKeymapsConfirmation', "Disable other keymaps ({0}) to avoid conflicts between keybindings?", oldKeymaps.map(k => `'${k.local.manifest.displayName}'`).join(', ')), [{
                    label: (0, nls_1.localize)('yes', "Yes"),
                    run: () => onPrompt(true)
                }, {
                    label: (0, nls_1.localize)('no', "No"),
                    run: () => onPrompt(false)
                }]);
        }
    };
    exports.KeymapExtensions = KeymapExtensions;
    exports.KeymapExtensions = KeymapExtensions = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(2, extensionRecommendations_1.IExtensionRecommendationsService),
        __param(3, lifecycle_2.ILifecycleService),
        __param(4, notification_1.INotificationService)
    ], KeymapExtensions);
    function onExtensionChanged(accessor) {
        const extensionService = accessor.get(extensionManagement_1.IExtensionManagementService);
        const extensionEnablementService = accessor.get(extensionManagement_2.IWorkbenchExtensionEnablementService);
        const onDidInstallExtensions = event_1.Event.chain(extensionService.onDidInstallExtensions, $ => $.filter(e => e.some(({ operation }) => operation === 2 /* InstallOperation.Install */))
            .map(e => e.map(({ identifier }) => identifier)));
        return event_1.Event.debounce(event_1.Event.any(event_1.Event.any(onDidInstallExtensions, event_1.Event.map(extensionService.onDidUninstallExtension, e => [e.identifier])), event_1.Event.map(extensionEnablementService.onEnablementChanged, extensions => extensions.map(e => e.identifier))), (result, identifiers) => {
            result = result || [];
            for (const identifier of identifiers) {
                if (result.some(l => !(0, extensionManagementUtil_1.areSameExtensions)(l, identifier))) {
                    result.push(identifier);
                }
            }
            return result;
        });
    }
    async function getInstalledExtensions(accessor) {
        const extensionService = accessor.get(extensionManagement_1.IExtensionManagementService);
        const extensionEnablementService = accessor.get(extensionManagement_2.IWorkbenchExtensionEnablementService);
        const extensions = await extensionService.getInstalled();
        return extensions.map(extension => {
            return {
                identifier: extension.identifier,
                local: extension,
                globallyEnabled: extensionEnablementService.isEnabled(extension)
            };
        });
    }
    exports.getInstalledExtensions = getInstalledExtensions;
    function isKeymapExtension(tipsService, extension) {
        const cats = extension.local.manifest.categories;
        return cats && cats.indexOf('Keymaps') !== -1 || tipsService.getKeymapRecommendations().some(extensionId => (0, extensionManagementUtil_1.areSameExtensions)({ id: extensionId }, extension.local.identifier));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1V0aWxzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9jb21tb24vZXh0ZW5zaW9uc1V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXFCekYsSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBaUIsU0FBUSxzQkFBVTtRQUUvQyxZQUN5QyxvQkFBMkMsRUFDNUIsMEJBQWdFLEVBQ3BFLFdBQTZDLEVBQzdFLGdCQUFtQyxFQUNmLG1CQUF5QztZQUVoRixLQUFLLEVBQUUsQ0FBQztZQU5nQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQzVCLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBc0M7WUFDcEUsZ0JBQVcsR0FBWCxXQUFXLENBQWtDO1lBRXpELHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFHaEYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO3FCQUMvRSxJQUFJLENBQUMsU0FBUyxFQUFFLDBCQUFpQixDQUFDLENBQUM7WUFDdEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ04sQ0FBQztRQUVPLG9CQUFvQixDQUFDLG1CQUF5QztZQUNyRSxPQUFPLElBQUksQ0FBQyxvQkFBb0Is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