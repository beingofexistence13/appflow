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
define(["require", "exports", "vs/nls!vs/workbench/services/integrity/electron-sandbox/integrityService", "vs/base/common/severity", "vs/base/common/uri", "vs/workbench/services/integrity/common/integrity", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/product/common/productService", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/extensions", "vs/platform/opener/common/opener", "vs/base/common/network", "vs/platform/checksum/common/checksumService"], function (require, exports, nls_1, severity_1, uri_1, integrity_1, lifecycle_1, productService_1, notification_1, storage_1, extensions_1, opener_1, network_1, checksumService_1) {
    "use strict";
    var $3_b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3_b = void 0;
    class IntegrityStorage {
        static { this.a = 'integrityService'; }
        constructor(storageService) {
            this.b = storageService;
            this.c = this.d();
        }
        d() {
            const jsonValue = this.b.get(IntegrityStorage.a, -1 /* StorageScope.APPLICATION */);
            if (!jsonValue) {
                return null;
            }
            try {
                return JSON.parse(jsonValue);
            }
            catch (err) {
                return null;
            }
        }
        get() {
            return this.c;
        }
        set(data) {
            this.c = data;
            this.b.store(IntegrityStorage.a, JSON.stringify(this.c), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
    }
    let $3_b = $3_b_1 = class $3_b {
        constructor(c, storageService, d, e, f, g) {
            this.c = c;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.a = new IntegrityStorage(storageService);
            this.b = this.j();
            this.isPure().then(r => {
                if (r.isPure) {
                    return; // all is good
                }
                this.h();
            });
        }
        h() {
            const storedData = this.a.get();
            if (storedData?.dontShowPrompt && storedData.commit === this.f.commit) {
                return; // Do not prompt
            }
            const checksumFailMoreInfoUrl = this.f.checksumFailMoreInfoUrl;
            const message = (0, nls_1.localize)(0, null, this.f.nameShort);
            if (checksumFailMoreInfoUrl) {
                this.c.prompt(severity_1.default.Warning, message, [
                    {
                        label: (0, nls_1.localize)(1, null),
                        run: () => this.e.open(uri_1.URI.parse(checksumFailMoreInfoUrl))
                    },
                    {
                        label: (0, nls_1.localize)(2, null),
                        isSecondary: true,
                        run: () => this.a.set({ dontShowPrompt: true, commit: this.f.commit })
                    }
                ], {
                    sticky: true,
                    priority: notification_1.NotificationPriority.URGENT
                });
            }
            else {
                this.c.notify({
                    severity: severity_1.default.Warning,
                    message,
                    sticky: true
                });
            }
        }
        isPure() {
            return this.b;
        }
        async j() {
            const expectedChecksums = this.f.checksums || {};
            await this.d.when(4 /* LifecyclePhase.Eventually */);
            const allResults = await Promise.all(Object.keys(expectedChecksums).map(filename => this.k(filename, expectedChecksums[filename])));
            let isPure = true;
            for (let i = 0, len = allResults.length; i < len; i++) {
                if (!allResults[i].isPure) {
                    isPure = false;
                    break;
                }
            }
            return {
                isPure: isPure,
                proof: allResults
            };
        }
        async k(filename, expected) {
            const fileUri = network_1.$2f.asFileUri(filename);
            try {
                const checksum = await this.g.checksum(fileUri);
                return $3_b_1.l(fileUri, checksum, expected);
            }
            catch (error) {
                return $3_b_1.l(fileUri, '', expected);
            }
        }
        static l(uri, actual, expected) {
            return {
                uri: uri,
                actual: actual,
                expected: expected,
                isPure: (actual === expected)
            };
        }
    };
    exports.$3_b = $3_b;
    exports.$3_b = $3_b = $3_b_1 = __decorate([
        __param(0, notification_1.$Yu),
        __param(1, storage_1.$Vo),
        __param(2, lifecycle_1.$7y),
        __param(3, opener_1.$NT),
        __param(4, productService_1.$kj),
        __param(5, checksumService_1.$Q7b)
    ], $3_b);
    (0, extensions_1.$mr)(integrity_1.$b3b, $3_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=integrityService.js.map