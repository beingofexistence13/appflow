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
define(["require", "exports", "vs/nls", "vs/base/common/severity", "vs/base/common/uri", "vs/workbench/services/integrity/common/integrity", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/product/common/productService", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/extensions", "vs/platform/opener/common/opener", "vs/base/common/network", "vs/platform/checksum/common/checksumService"], function (require, exports, nls_1, severity_1, uri_1, integrity_1, lifecycle_1, productService_1, notification_1, storage_1, extensions_1, opener_1, network_1, checksumService_1) {
    "use strict";
    var IntegrityService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IntegrityService = void 0;
    class IntegrityStorage {
        static { this.KEY = 'integrityService'; }
        constructor(storageService) {
            this.storageService = storageService;
            this.value = this._read();
        }
        _read() {
            const jsonValue = this.storageService.get(IntegrityStorage.KEY, -1 /* StorageScope.APPLICATION */);
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
            return this.value;
        }
        set(data) {
            this.value = data;
            this.storageService.store(IntegrityStorage.KEY, JSON.stringify(this.value), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
    }
    let IntegrityService = IntegrityService_1 = class IntegrityService {
        constructor(notificationService, storageService, lifecycleService, openerService, productService, checksumService) {
            this.notificationService = notificationService;
            this.lifecycleService = lifecycleService;
            this.openerService = openerService;
            this.productService = productService;
            this.checksumService = checksumService;
            this._storage = new IntegrityStorage(storageService);
            this._isPurePromise = this._isPure();
            this.isPure().then(r => {
                if (r.isPure) {
                    return; // all is good
                }
                this._prompt();
            });
        }
        _prompt() {
            const storedData = this._storage.get();
            if (storedData?.dontShowPrompt && storedData.commit === this.productService.commit) {
                return; // Do not prompt
            }
            const checksumFailMoreInfoUrl = this.productService.checksumFailMoreInfoUrl;
            const message = (0, nls_1.localize)('integrity.prompt', "Your {0} installation appears to be corrupt. Please reinstall.", this.productService.nameShort);
            if (checksumFailMoreInfoUrl) {
                this.notificationService.prompt(severity_1.default.Warning, message, [
                    {
                        label: (0, nls_1.localize)('integrity.moreInformation', "More Information"),
                        run: () => this.openerService.open(uri_1.URI.parse(checksumFailMoreInfoUrl))
                    },
                    {
                        label: (0, nls_1.localize)('integrity.dontShowAgain', "Don't Show Again"),
                        isSecondary: true,
                        run: () => this._storage.set({ dontShowPrompt: true, commit: this.productService.commit })
                    }
                ], {
                    sticky: true,
                    priority: notification_1.NotificationPriority.URGENT
                });
            }
            else {
                this.notificationService.notify({
                    severity: severity_1.default.Warning,
                    message,
                    sticky: true
                });
            }
        }
        isPure() {
            return this._isPurePromise;
        }
        async _isPure() {
            const expectedChecksums = this.productService.checksums || {};
            await this.lifecycleService.when(4 /* LifecyclePhase.Eventually */);
            const allResults = await Promise.all(Object.keys(expectedChecksums).map(filename => this._resolve(filename, expectedChecksums[filename])));
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
        async _resolve(filename, expected) {
            const fileUri = network_1.FileAccess.asFileUri(filename);
            try {
                const checksum = await this.checksumService.checksum(fileUri);
                return IntegrityService_1._createChecksumPair(fileUri, checksum, expected);
            }
            catch (error) {
                return IntegrityService_1._createChecksumPair(fileUri, '', expected);
            }
        }
        static _createChecksumPair(uri, actual, expected) {
            return {
                uri: uri,
                actual: actual,
                expected: expected,
                isPure: (actual === expected)
            };
        }
    };
    exports.IntegrityService = IntegrityService;
    exports.IntegrityService = IntegrityService = IntegrityService_1 = __decorate([
        __param(0, notification_1.INotificationService),
        __param(1, storage_1.IStorageService),
        __param(2, lifecycle_1.ILifecycleService),
        __param(3, opener_1.IOpenerService),
        __param(4, productService_1.IProductService),
        __param(5, checksumService_1.IChecksumService)
    ], IntegrityService);
    (0, extensions_1.registerSingleton)(integrity_1.IIntegrityService, IntegrityService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZWdyaXR5U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9pbnRlZ3JpdHkvZWxlY3Ryb24tc2FuZGJveC9pbnRlZ3JpdHlTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFvQmhHLE1BQU0sZ0JBQWdCO2lCQUNHLFFBQUcsR0FBRyxrQkFBa0IsQ0FBQztRQUtqRCxZQUFZLGNBQStCO1lBQzFDLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFTyxLQUFLO1lBQ1osTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxvQ0FBMkIsQ0FBQztZQUMxRixJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNmLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxJQUFJO2dCQUNILE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUM3QjtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNiLE9BQU8sSUFBSSxDQUFDO2FBQ1o7UUFDRixDQUFDO1FBRUQsR0FBRztZQUNGLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNuQixDQUFDO1FBRUQsR0FBRyxDQUFDLElBQXlCO1lBQzVCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsbUVBQWtELENBQUM7UUFDOUgsQ0FBQzs7SUFHSyxJQUFNLGdCQUFnQix3QkFBdEIsTUFB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