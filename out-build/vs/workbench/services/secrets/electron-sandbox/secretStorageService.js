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
define(["require", "exports", "vs/base/common/functional", "vs/base/common/platform", "vs/base/common/severity", "vs/nls!vs/workbench/services/secrets/electron-sandbox/secretStorageService", "vs/platform/dialogs/common/dialogs", "vs/platform/encryption/common/encryptionService", "vs/platform/environment/common/environment", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/secrets/common/secrets", "vs/platform/storage/common/storage", "vs/workbench/services/configuration/common/jsonEditing"], function (require, exports, functional_1, platform_1, severity_1, nls_1, dialogs_1, encryptionService_1, environment_1, extensions_1, log_1, notification_1, opener_1, secrets_1, storage_1, jsonEditing_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$S_b = void 0;
    let $S_b = class $S_b extends secrets_1.$GT {
        constructor(z, C, D, F, G, storageService, encryptionService, logService) {
            super(!!G.useInMemorySecretStorage, storageService, encryptionService, logService);
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = (0, functional_1.$bb)(() => this.I());
        }
        set(key, value) {
            this.c.queue(key, async () => {
                await this.s;
                if (this.type !== 'persisted' && !this.G.useInMemorySecretStorage) {
                    this.n.trace('[NativeSecretStorageService] Notifying user that secrets are not being stored on disk.');
                    await this.H();
                }
            });
            return super.set(key, value);
        }
        async I() {
            const buttons = [];
            const troubleshootingButton = {
                label: (0, nls_1.localize)(0, null),
                run: () => this.D.open('https://go.microsoft.com/fwlink/?linkid=2239490'),
                // doesn't close dialogs
                keepOpen: true
            };
            buttons.push(troubleshootingButton);
            let errorMessage = (0, nls_1.localize)(1, null);
            if (!platform_1.$k) {
                this.z.prompt(severity_1.default.Error, errorMessage, buttons);
                return;
            }
            const provider = await this.m.getKeyStorageProvider();
            if (provider === "basic_text" /* KnownStorageProvider.basicText */) {
                const detail = (0, nls_1.localize)(2, null);
                const usePlainTextButton = {
                    label: (0, nls_1.localize)(3, null),
                    run: async () => {
                        await this.m.setUsePlainTextEncryption();
                        await this.F.write(this.G.argvResource, [{ path: ['password-store'], value: "basic" /* PasswordStoreCLIOption.basic */ }], true);
                        this.u();
                    }
                };
                buttons.unshift(usePlainTextButton);
                await this.C.prompt({
                    type: 'error',
                    buttons,
                    message: errorMessage,
                    detail
                });
                return;
            }
            if ((0, encryptionService_1.$ET)(provider)) {
                errorMessage = (0, nls_1.localize)(4, null);
            }
            else if ((0, encryptionService_1.$DT)(provider)) {
                errorMessage = (0, nls_1.localize)(5, null);
            }
            this.z.prompt(severity_1.default.Error, errorMessage, buttons);
        }
    };
    exports.$S_b = $S_b;
    exports.$S_b = $S_b = __decorate([
        __param(0, notification_1.$Yu),
        __param(1, dialogs_1.$oA),
        __param(2, opener_1.$NT),
        __param(3, jsonEditing_1.$$fb),
        __param(4, environment_1.$Jh),
        __param(5, storage_1.$Vo),
        __param(6, encryptionService_1.$BT),
        __param(7, log_1.$5i)
    ], $S_b);
    (0, extensions_1.$mr)(secrets_1.$FT, $S_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=secretStorageService.js.map