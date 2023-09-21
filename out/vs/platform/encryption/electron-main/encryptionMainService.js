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
define(["require", "exports", "electron", "vs/base/common/platform", "vs/platform/log/common/log"], function (require, exports, electron_1, platform_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EncryptionMainService = void 0;
    const safeStorage = electron_1.safeStorage;
    let EncryptionMainService = class EncryptionMainService {
        constructor(logService) {
            this.logService = logService;
            // if this commandLine switch is set, the user has opted in to using basic text encryption
            if (electron_1.app.commandLine.getSwitchValue('password-store') === "basic" /* PasswordStoreCLIOption.basic */) {
                safeStorage.setUsePlainTextEncryption?.(true);
            }
        }
        async encrypt(value) {
            this.logService.trace('[EncryptionMainService] Encrypting value.');
            try {
                const result = JSON.stringify(safeStorage.encryptString(value));
                this.logService.trace('[EncryptionMainService] Encrypted value.');
                return result;
            }
            catch (e) {
                this.logService.error(e);
                throw e;
            }
        }
        async decrypt(value) {
            let parsedValue;
            try {
                parsedValue = JSON.parse(value);
                if (!parsedValue.data) {
                    throw new Error(`[EncryptionMainService] Invalid encrypted value: ${value}`);
                }
                const bufferToDecrypt = Buffer.from(parsedValue.data);
                this.logService.trace('[EncryptionMainService] Decrypting value.');
                const result = safeStorage.decryptString(bufferToDecrypt);
                this.logService.trace('[EncryptionMainService] Decrypted value.');
                return result;
            }
            catch (e) {
                this.logService.error(e);
                throw e;
            }
        }
        isEncryptionAvailable() {
            return Promise.resolve(safeStorage.isEncryptionAvailable());
        }
        getKeyStorageProvider() {
            if (platform_1.isWindows) {
                return Promise.resolve("dpapi" /* KnownStorageProvider.dplib */);
            }
            if (platform_1.isMacintosh) {
                return Promise.resolve("keychain_access" /* KnownStorageProvider.keychainAccess */);
            }
            if (safeStorage.getSelectedStorageBackend) {
                try {
                    const result = safeStorage.getSelectedStorageBackend();
                    return Promise.resolve(result);
                }
                catch (e) {
                    this.logService.error(e);
                }
            }
            return Promise.resolve("unknown" /* KnownStorageProvider.unknown */);
        }
        async setUsePlainTextEncryption() {
            if (platform_1.isWindows) {
                throw new Error('Setting plain text encryption is not supported on Windows.');
            }
            if (platform_1.isMacintosh) {
                throw new Error('Setting plain text encryption is not supported on macOS.');
            }
            if (!safeStorage.setUsePlainTextEncryption) {
                throw new Error('Setting plain text encryption is not supported.');
            }
            safeStorage.setUsePlainTextEncryption(true);
        }
    };
    exports.EncryptionMainService = EncryptionMainService;
    exports.EncryptionMainService = EncryptionMainService = __decorate([
        __param(0, log_1.ILogService)
    ], EncryptionMainService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jcnlwdGlvbk1haW5TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZW5jcnlwdGlvbi9lbGVjdHJvbi1tYWluL2VuY3J5cHRpb25NYWluU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFjaEcsTUFBTSxXQUFXLEdBQWdGLHNCQUFtQixDQUFDO0lBRTlHLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXFCO1FBR2pDLFlBQytCLFVBQXVCO1lBQXZCLGVBQVUsR0FBVixVQUFVLENBQWE7WUFFckQsMEZBQTBGO1lBQzFGLElBQUksY0FBRyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsK0NBQWlDLEVBQUU7Z0JBQ3RGLFdBQVcsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzlDO1FBQ0YsQ0FBQztRQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBYTtZQUMxQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1lBQ25FLElBQUk7Z0JBQ0gsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2hFLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7Z0JBQ2xFLE9BQU8sTUFBTSxDQUFDO2FBQ2Q7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDWCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekIsTUFBTSxDQUFDLENBQUM7YUFDUjtRQUNGLENBQUM7UUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQWE7WUFDMUIsSUFBSSxXQUE2QixDQUFDO1lBQ2xDLElBQUk7Z0JBQ0gsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO29CQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLG9EQUFvRCxLQUFLLEVBQUUsQ0FBQyxDQUFDO2lCQUM3RTtnQkFDRCxNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFdEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztnQkFDbkUsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDMUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztnQkFDbEUsT0FBTyxNQUFNLENBQUM7YUFDZDtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNYLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixNQUFNLENBQUMsQ0FBQzthQUNSO1FBQ0YsQ0FBQztRQUVELHFCQUFxQjtZQUNwQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQscUJBQXFCO1lBQ3BCLElBQUksb0JBQVMsRUFBRTtnQkFDZCxPQUFPLE9BQU8sQ0FBQyxPQUFPLDBDQUE0QixDQUFDO2FBQ25EO1lBQ0QsSUFBSSxzQkFBVyxFQUFFO2dCQUNoQixPQUFPLE9BQU8sQ0FBQyxPQUFPLDZEQUFxQyxDQUFDO2FBQzVEO1lBQ0QsSUFBSSxXQUFXLENBQUMseUJBQXlCLEVBQUU7Z0JBQzFDLElBQUk7b0JBQ0gsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLHlCQUF5QixFQUEwQixDQUFDO29CQUMvRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQy9CO2dCQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNYLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN6QjthQUNEO1lBQ0QsT0FBTyxPQUFPLENBQUMsT0FBTyw4Q0FBOEIsQ0FBQztRQUN0RCxDQUFDO1FBRUQsS0FBSyxDQUFDLHlCQUF5QjtZQUM5QixJQUFJLG9CQUFTLEVBQUU7Z0JBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyw0REFBNEQsQ0FBQyxDQUFDO2FBQzlFO1lBRUQsSUFBSSxzQkFBVyxFQUFFO2dCQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7YUFDNUU7WUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLHlCQUF5QixFQUFFO2dCQUMzQyxNQUFNLElBQUksS0FBSyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7YUFDbkU7WUFFRCxXQUFXLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0MsQ0FBQztLQUNELENBQUE7SUFoRlksc0RBQXFCO29DQUFyQixxQkFBcUI7UUFJL0IsV0FBQSxpQkFBVyxDQUFBO09BSkQscUJBQXFCLENBZ0ZqQyJ9