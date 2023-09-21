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
    exports.$15b = void 0;
    let $15b = class $15b {
        constructor(b, c) {
            this.b = b;
            this.c = c;
            this.a = new Map();
        }
        async isExtensionUrlTrusted(extensionId, url) {
            if (!this.b.trustedExtensionUrlPublicKeys) {
                this.c.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'There are no configured trusted keys');
                return false;
            }
            const match = /^(.*)#([^#]+)$/.exec(url);
            if (!match) {
                this.c.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'Uri has no fragment', url);
                return false;
            }
            const [, originalUrl, fragment] = match;
            let keys = this.a.get(extensionId);
            if (!keys) {
                keys = this.b.trustedExtensionUrlPublicKeys[extensionId];
                if (!keys || keys.length === 0) {
                    this.c.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'Extension doesn\'t have any trusted keys', extensionId);
                    return false;
                }
                this.a.set(extensionId, [...keys]);
            }
            const fragmentBuffer = Buffer.from(decodeURIComponent(fragment), 'base64');
            if (fragmentBuffer.length <= 6) {
                this.c.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'Uri fragment is not a signature', url);
                return false;
            }
            const timestampBuffer = fragmentBuffer.slice(0, 6);
            const timestamp = fragmentBuffer.readUIntBE(0, 6);
            const diff = Date.now() - timestamp;
            if (diff < 0 || diff > 3600000) { // 1 hour
                this.c.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'Signed uri has expired', url);
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
                        this.c.warn('ExtensionUrlTrustService#isExtensionUrlTrusted', `Failed to parse trusted extension uri public key #${i + 1} for ${extensionId}:`, err);
                        keys[i] = null;
                        continue;
                    }
                }
                if (verify.verify(key, signatureBuffer)) {
                    this.c.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'Signed uri is valid', url);
                    return true;
                }
            }
            this.c.trace('ExtensionUrlTrustService#isExtensionUrlTrusted', 'Signed uri could not be verified', url);
            return false;
        }
    };
    exports.$15b = $15b;
    exports.$15b = $15b = __decorate([
        __param(0, productService_1.$kj),
        __param(1, log_1.$5i)
    ], $15b);
});
//# sourceMappingURL=extensionUrlTrustService.js.map