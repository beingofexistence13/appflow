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
define(["require", "exports", "vs/base/common/functional", "vs/base/common/platform", "vs/base/common/severity", "vs/nls", "vs/platform/dialogs/common/dialogs", "vs/platform/encryption/common/encryptionService", "vs/platform/environment/common/environment", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/secrets/common/secrets", "vs/platform/storage/common/storage", "vs/workbench/services/configuration/common/jsonEditing"], function (require, exports, functional_1, platform_1, severity_1, nls_1, dialogs_1, encryptionService_1, environment_1, extensions_1, log_1, notification_1, opener_1, secrets_1, storage_1, jsonEditing_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeSecretStorageService = void 0;
    let NativeSecretStorageService = class NativeSecretStorageService extends secrets_1.BaseSecretStorageService {
        constructor(_notificationService, _dialogService, _openerService, _jsonEditingService, _environmentService, storageService, encryptionService, logService) {
            super(!!_environmentService.useInMemorySecretStorage, storageService, encryptionService, logService);
            this._notificationService = _notificationService;
            this._dialogService = _dialogService;
            this._openerService = _openerService;
            this._jsonEditingService = _jsonEditingService;
            this._environmentService = _environmentService;
            this.notifyOfNoEncryptionOnce = (0, functional_1.once)(() => this.notifyOfNoEncryption());
        }
        set(key, value) {
            this._sequencer.queue(key, async () => {
                await this.resolvedStorageService;
                if (this.type !== 'persisted' && !this._environmentService.useInMemorySecretStorage) {
                    this._logService.trace('[NativeSecretStorageService] Notifying user that secrets are not being stored on disk.');
                    await this.notifyOfNoEncryptionOnce();
                }
            });
            return super.set(key, value);
        }
        async notifyOfNoEncryption() {
            const buttons = [];
            const troubleshootingButton = {
                label: (0, nls_1.localize)('troubleshootingButton', "Open troubleshooting guide"),
                run: () => this._openerService.open('https://go.microsoft.com/fwlink/?linkid=2239490'),
                // doesn't close dialogs
                keepOpen: true
            };
            buttons.push(troubleshootingButton);
            let errorMessage = (0, nls_1.localize)('encryptionNotAvailableJustTroubleshootingGuide', "An OS keyring couldn't be identified for storing the encryption related data in your current desktop environment.");
            if (!platform_1.isLinux) {
                this._notificationService.prompt(severity_1.default.Error, errorMessage, buttons);
                return;
            }
            const provider = await this._encryptionService.getKeyStorageProvider();
            if (provider === "basic_text" /* KnownStorageProvider.basicText */) {
                const detail = (0, nls_1.localize)('usePlainTextExtraSentence', "Open the troubleshooting guide to address this or you can use weaker encryption that doesn't use the OS keyring.");
                const usePlainTextButton = {
                    label: (0, nls_1.localize)('usePlainText', "Use weaker encryption"),
                    run: async () => {
                        await this._encryptionService.setUsePlainTextEncryption();
                        await this._jsonEditingService.write(this._environmentService.argvResource, [{ path: ['password-store'], value: "basic" /* PasswordStoreCLIOption.basic */ }], true);
                        this.reinitialize();
                    }
                };
                buttons.unshift(usePlainTextButton);
                await this._dialogService.prompt({
                    type: 'error',
                    buttons,
                    message: errorMessage,
                    detail
                });
                return;
            }
            if ((0, encryptionService_1.isGnome)(provider)) {
                errorMessage = (0, nls_1.localize)('isGnome', "You're running in a GNOME environment but the OS keyring is not available for encryption. Ensure you have gnome-keyring or another libsecret compatible implementation installed and running.");
            }
            else if ((0, encryptionService_1.isKwallet)(provider)) {
                errorMessage = (0, nls_1.localize)('isKwallet', "You're running in a KDE environment but the OS keyring is not available for encryption. Ensure you have kwallet running.");
            }
            this._notificationService.prompt(severity_1.default.Error, errorMessage, buttons);
        }
    };
    exports.NativeSecretStorageService = NativeSecretStorageService;
    exports.NativeSecretStorageService = NativeSecretStorageService = __decorate([
        __param(0, notification_1.INotificationService),
        __param(1, dialogs_1.IDialogService),
        __param(2, opener_1.IOpenerService),
        __param(3, jsonEditing_1.IJSONEditingService),
        __param(4, environment_1.INativeEnvironmentService),
        __param(5, storage_1.IStorageService),
        __param(6, encryptionService_1.IEncryptionService),
        __param(7, log_1.ILogService)
    ], NativeSecretStorageService);
    (0, extensions_1.registerSingleton)(secrets_1.ISecretStorageService, NativeSecretStorageService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcmV0U3RvcmFnZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc2VjcmV0cy9lbGVjdHJvbi1zYW5kYm94L3NlY3JldFN0b3JhZ2VTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWlCekYsSUFBTSwwQkFBMEIsR0FBaEMsTUFBTSwwQkFBMkIsU0FBUSxrQ0FBd0I7UUFFdkUsWUFDdUIsb0JBQTJELEVBQ2pFLGNBQStDLEVBQy9DLGNBQStDLEVBQzFDLG1CQUF5RCxFQUNuRCxtQkFBK0QsRUFDekUsY0FBK0IsRUFDNUIsaUJBQXFDLEVBQzVDLFVBQXVCO1lBRXBDLEtBQUssQ0FDSixDQUFDLENBQUMsbUJBQW1CLENBQUMsd0JBQXdCLEVBQzlDLGNBQWMsRUFDZCxpQkFBaUIsRUFDakIsVUFBVSxDQUNWLENBQUM7WUFkcUMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQUNoRCxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFDOUIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQ3pCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFDbEMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUEyQjtZQTJCbkYsNkJBQXdCLEdBQUcsSUFBQSxpQkFBSSxFQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7UUFoQjNFLENBQUM7UUFFUSxHQUFHLENBQUMsR0FBVyxFQUFFLEtBQWE7WUFDdEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUNyQyxNQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztnQkFFbEMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxt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