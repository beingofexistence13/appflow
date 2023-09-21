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
define(["require", "exports", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/workbench/services/extensions/common/extensionsUtil", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/log/common/log", "vs/base/common/severity", "vs/nls", "vs/platform/notification/common/notification", "vs/workbench/services/host/browser/host", "vs/base/common/async", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/errors"], function (require, exports, path, platform, uri_1, extensionsUtil_1, extensionsScannerService_1, log_1, severity_1, nls_1, notification_1, host_1, async_1, userDataProfile_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CachedExtensionScanner = void 0;
    let CachedExtensionScanner = class CachedExtensionScanner {
        constructor(_notificationService, _hostService, _extensionsScannerService, _userDataProfileService, _logService) {
            this._notificationService = _notificationService;
            this._hostService = _hostService;
            this._extensionsScannerService = _extensionsScannerService;
            this._userDataProfileService = _userDataProfileService;
            this._logService = _logService;
            this.scannedExtensions = new Promise((resolve, reject) => {
                this._scannedExtensionsResolve = resolve;
                this._scannedExtensionsReject = reject;
            });
        }
        async scanSingleExtension(extensionPath, isBuiltin) {
            const scannedExtension = await this._extensionsScannerService.scanExistingExtension(uri_1.URI.file(path.resolve(extensionPath)), isBuiltin ? 0 /* ExtensionType.System */ : 1 /* ExtensionType.User */, { language: platform.language });
            return scannedExtension ? (0, extensionsScannerService_1.toExtensionDescription)(scannedExtension, false) : null;
        }
        async startScanningExtensions() {
            try {
                const extensions = await this._scanInstalledExtensions();
                this._scannedExtensionsResolve(extensions);
            }
            catch (err) {
                this._scannedExtensionsReject(err);
            }
        }
        async _scanInstalledExtensions() {
            try {
                const language = platform.language;
                const result = await Promise.allSettled([
                    this._extensionsScannerService.scanSystemExtensions({ language, useCache: true, checkControlFile: true }),
                    this._extensionsScannerService.scanUserExtensions({ language, profileLocation: this._userDataProfileService.currentProfile.extensionsResource, useCache: true })
                ]);
                let scannedSystemExtensions = [], scannedUserExtensions = [], scannedDevelopedExtensions = [], hasErrors = false;
                if (result[0].status === 'fulfilled') {
                    scannedSystemExtensions = result[0].value;
                }
                else {
                    hasErrors = true;
                    this._logService.error(`Error scanning system extensions:`, (0, errors_1.getErrorMessage)(result[0].reason));
                }
                if (result[1].status === 'fulfilled') {
                    scannedUserExtensions = result[1].value;
                }
                else {
                    hasErrors = true;
                    this._logService.error(`Error scanning user extensions:`, (0, errors_1.getErrorMessage)(result[1].reason));
                }
                try {
                    scannedDevelopedExtensions = await this._extensionsScannerService.scanExtensionsUnderDevelopment({ language }, [...scannedSystemExtensions, ...scannedUserExtensions]);
                }
                catch (error) {
                    this._logService.error(error);
                }
                const system = scannedSystemExtensions.map(e => (0, extensionsScannerService_1.toExtensionDescription)(e, false));
                const user = scannedUserExtensions.map(e => (0, extensionsScannerService_1.toExtensionDescription)(e, false));
                const development = scannedDevelopedExtensions.map(e => (0, extensionsScannerService_1.toExtensionDescription)(e, true));
                const r = (0, extensionsUtil_1.dedupExtensions)(system, user, development, this._logService);
                if (!hasErrors) {
                    const disposable = this._extensionsScannerService.onDidChangeCache(() => {
                        disposable.dispose();
                        this._notificationService.prompt(severity_1.default.Error, (0, nls_1.localize)('extensionCache.invalid', "Extensions have been modified on disk. Please reload the window."), [{
                                label: (0, nls_1.localize)('reloadWindow', "Reload Window"),
                                run: () => this._hostService.reload()
                            }]);
                    });
                    (0, async_1.timeout)(5000).then(() => disposable.dispose());
                }
                return r;
            }
            catch (err) {
                this._logService.error(`Error scanning installed extensions:`);
                this._logService.error(err);
                return [];
            }
        }
    };
    exports.CachedExtensionScanner = CachedExtensionScanner;
    exports.CachedExtensionScanner = CachedExtensionScanner = __decorate([
        __param(0, notification_1.INotificationService),
        __param(1, host_1.IHostService),
        __param(2, extensionsScannerService_1.IExtensionsScannerService),
        __param(3, userDataProfile_1.IUserDataProfileService),
        __param(4, log_1.ILogService)
    ], CachedExtensionScanner);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FjaGVkRXh0ZW5zaW9uU2Nhbm5lci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25zL2VsZWN0cm9uLXNhbmRib3gvY2FjaGVkRXh0ZW5zaW9uU2Nhbm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFpQnpGLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXNCO1FBTWxDLFlBQ3dDLG9CQUEwQyxFQUNsRCxZQUEwQixFQUNiLHlCQUFvRCxFQUN0RCx1QkFBZ0QsRUFDNUQsV0FBd0I7WUFKZix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQ2xELGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBQ2IsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtZQUN0RCw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQXlCO1lBQzVELGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBRXRELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLE9BQU8sQ0FBMEIsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ2pGLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxPQUFPLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxNQUFNLENBQUM7WUFDeEMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU0sS0FBSyxDQUFDLG1CQUFtQixDQUFDLGFBQXFCLEVBQUUsU0FBa0I7WUFDekUsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxxQkFBcUIsQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyw4QkFBc0IsQ0FBQywyQkFBbUIsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMs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