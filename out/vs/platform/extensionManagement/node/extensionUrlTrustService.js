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
define(["require", "exports", "crypto", "vs/platform/log/common/log", "vs/platform/product/common/productService"], function (require, exports, crypto, log_1, productService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionUrlTrustService = void 0;
    let ExtensionUrlTrustService = class ExtensionUrlTrustService {
        constructor(productService, logService) {
            this.productService = productService;
            this.logService = logService;
            this.trustedExtensionUrlPublicKeys = new Map();
        }
        async isExtensionUrlTrusted(extensionId, url) {
            if (!this.productService.trustedExtensionUrlPublicKeys) {
                this.logService.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'There are no configured trusted keys');
                return false;
            }
            const match = /^(.*)#([^#]+)$/.exec(url);
            if (!match) {
                this.logService.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'Uri has no fragment', url);
                return false;
            }
            const [, originalUrl, fragment] = match;
            let keys = this.trustedExtensionUrlPublicKeys.get(extensionId);
            if (!keys) {
                keys = this.productService.trustedExtensionUrlPublicKeys[extensionId];
                if (!keys || keys.length === 0) {
                    this.logService.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'Extension doesn\'t have any trusted keys', extensionId);
                    return false;
                }
                this.trustedExtensionUrlPublicKeys.set(extensionId, [...keys]);
            }
            const fragmentBuffer = Buffer.from(decodeURIComponent(fragment), 'base64');
            if (fragmentBuffer.length <= 6) {
                this.logService.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'Uri fragment is not a signature', url);
                return false;
            }
            const timestampBuffer = fragmentBuffer.slice(0, 6);
            const timestamp = fragmentBuffer.readUIntBE(0, 6);
            const diff = Date.now() - timestamp;
            if (diff < 0 || diff > 3600000) { // 1 hour
                this.logService.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'Signed uri has expired', url);
                return false;
            }
            const signatureBuffer = fragmentBuffer.slice(6);
            const verify = crypto.createVerify('SHA256');
            verify.write(timestampBuffer);
            verify.write(Buffer.from(originalUrl));
            verify.end();
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                if (key === null) { // failed to be parsed before
                    continue;
                }
                else if (typeof key === 'string') { // needs to be parsed
                    try {
                        key = crypto.createPublicKey({ key: Buffer.from(key, 'base64'), format: 'der', type: 'spki' });
                        keys[i] = key;
                    }
                    catch (err) {
                        this.logService.warn('ExtensionUrlTrustService#isExtensionUrlTrusted', `Failed to parse trusted extension uri public key #${i + 1} for ${extensionId}:`, err);
                        keys[i] = null;
                        continue;
                    }
                }
                if (verify.verify(key, signatureBuffer)) {
                    this.logService.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'Signed uri is valid', url);
                    return true;
                }
            }
            this.logService.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'Signed uri could not be verified', url);
            return false;
        }
    };
    exports.ExtensionUrlTrustService = ExtensionUrlTrustService;
    exports.ExtensionUrlTrustService = ExtensionUrlTrustService = __decorate([
        __param(0, productService_1.IProductService),
        __param(1, log_1.ILogService)
    ], ExtensionUrlTrustService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uVXJsVHJ1c3RTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZXh0ZW5zaW9uTWFuYWdlbWVudC9ub2RlL2V4dGVuc2lvblVybFRydXN0U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFPekYsSUFBTSx3QkFBd0IsR0FBOUIsTUFBTSx3QkFBd0I7UUFNcEMsWUFDa0IsY0FBZ0QsRUFDcEQsVUFBd0M7WUFEbkIsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ25DLGVBQVUsR0FBVixVQUFVLENBQWE7WUFKOUMsa0NBQTZCLEdBQUcsSUFBSSxHQUFHLEVBQWdELENBQUM7UUFLNUYsQ0FBQztRQUVMLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxXQUFtQixFQUFFLEdBQVc7WUFDM0QsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsNkJBQTZCLEVBQUU7Z0JBQ3ZELElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLGdEQUFnRCxFQUFFLHNDQUFzQyxDQUFDLENBQUM7Z0JBQ2hILE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxNQUFNLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFekMsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDWCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxnREFBZ0QsRUFBRSxxQkFBcUIsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDcEcsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE1BQU0sQ0FBQyxFQUFFLFdBQVcsRUFBRSxRQUFRLENBQUMsR0FBRyxLQUFLLENBQUM7WUFFeEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLDZCQUE2QixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUUvRCxJQUFJLENB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