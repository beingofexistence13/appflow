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
define(["require", "exports", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/workbench/services/extensions/common/extensionsUtil", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/platform/log/common/log", "vs/base/common/severity", "vs/nls!vs/workbench/services/extensions/electron-sandbox/cachedExtensionScanner", "vs/platform/notification/common/notification", "vs/workbench/services/host/browser/host", "vs/base/common/async", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/errors"], function (require, exports, path, platform, uri_1, extensionsUtil_1, extensionsScannerService_1, log_1, severity_1, nls_1, notification_1, host_1, async_1, userDataProfile_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0_b = void 0;
    let $0_b = class $0_b {
        constructor(c, d, f, g, h) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.scannedExtensions = new Promise((resolve, reject) => {
                this.a = resolve;
                this.b = reject;
            });
        }
        async scanSingleExtension(extensionPath, isBuiltin) {
            const scannedExtension = await this.f.scanExistingExtension(uri_1.URI.file(path.$0d(extensionPath)), isBuiltin ? 0 /* ExtensionType.System */ : 1 /* ExtensionType.User */, { language: platform.$v });
            return scannedExtension ? (0, extensionsScannerService_1.$rp)(scannedExtension, false) : null;
        }
        async startScanningExtensions() {
            try {
                const extensions = await this.i();
                this.a(extensions);
            }
            catch (err) {
                this.b(err);
            }
        }
        async i() {
            try {
                const language = platform.$v;
                const result = await Promise.allSettled([
                    this.f.scanSystemExtensions({ language, useCache: true, checkControlFile: true }),
                    this.f.scanUserExtensions({ language, profileLocation: this.g.currentProfile.extensionsResource, useCache: true })
                ]);
                let scannedSystemExtensions = [], scannedUserExtensions = [], scannedDevelopedExtensions = [], hasErrors = false;
                if (result[0].status === 'fulfilled') {
                    scannedSystemExtensions = result[0].value;
                }
                else {
                    hasErrors = true;
                    this.h.error(`Error scanning system extensions:`, (0, errors_1.$8)(result[0].reason));
                }
                if (result[1].status === 'fulfilled') {
                    scannedUserExtensions = result[1].value;
                }
                else {
                    hasErrors = true;
                    this.h.error(`Error scanning user extensions:`, (0, errors_1.$8)(result[1].reason));
                }
                try {
                    scannedDevelopedExtensions = await this.f.scanExtensionsUnderDevelopment({ language }, [...scannedSystemExtensions, ...scannedUserExtensions]);
                }
                catch (error) {
                    this.h.error(error);
                }
                const system = scannedSystemExtensions.map(e => (0, extensionsScannerService_1.$rp)(e, false));
                const user = scannedUserExtensions.map(e => (0, extensionsScannerService_1.$rp)(e, false));
                const development = scannedDevelopedExtensions.map(e => (0, extensionsScannerService_1.$rp)(e, true));
                const r = (0, extensionsUtil_1.$nN)(system, user, development, this.h);
                if (!hasErrors) {
                    const disposable = this.f.onDidChangeCache(() => {
                        disposable.dispose();
                        this.c.prompt(severity_1.default.Error, (0, nls_1.localize)(0, null), [{
                                label: (0, nls_1.localize)(1, null),
                                run: () => this.d.reload()
                            }]);
                    });
                    (0, async_1.$Hg)(5000).then(() => disposable.dispose());
                }
                return r;
            }
            catch (err) {
                this.h.error(`Error scanning installed extensions:`);
                this.h.error(err);
                return [];
            }
        }
    };
    exports.$0_b = $0_b;
    exports.$0_b = $0_b = __decorate([
        __param(0, notification_1.$Yu),
        __param(1, host_1.$VT),
        __param(2, extensionsScannerService_1.$op),
        __param(3, userDataProfile_1.$CJ),
        __param(4, log_1.$5i)
    ], $0_b);
});
//# sourceMappingURL=cachedExtensionScanner.js.map