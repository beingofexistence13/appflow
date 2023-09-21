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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/services/extensions/common/extHostCustomers", "../common/extHost.protocol", "vs/platform/log/common/log", "vs/base/common/async", "vs/platform/secrets/common/secrets", "vs/workbench/services/environment/browser/environmentService"], function (require, exports, lifecycle_1, extHostCustomers_1, extHost_protocol_1, log_1, async_1, secrets_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$itb = void 0;
    let $itb = class $itb extends lifecycle_1.$kc {
        constructor(extHostContext, c, f, environmentService) {
            super();
            this.c = c;
            this.f = f;
            this.b = new async_1.$Cg();
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostSecretState);
            this.B(this.c.onDidChangeSecret((e) => {
                try {
                    const { extensionId, key } = this.n(e);
                    if (extensionId && key) {
                        this.a.$onDidChangePassword({ extensionId, key });
                    }
                }
                catch (e) {
                    // Core can use non-JSON values as keys, so we may not be able to parse them.
                }
            }));
        }
        $getPassword(extensionId, key) {
            this.f.trace(`[mainThreadSecretState] Getting password for ${extensionId} extension: `, key);
            return this.b.queue(extensionId, () => this.g(extensionId, key));
        }
        async g(extensionId, key) {
            const fullKey = this.m(extensionId, key);
            const password = await this.c.get(fullKey);
            this.f.trace(`[mainThreadSecretState] ${password ? 'P' : 'No p'}assword found for: `, extensionId, key);
            return password;
        }
        $setPassword(extensionId, key, value) {
            this.f.trace(`[mainThreadSecretState] Setting password for ${extensionId} extension: `, key);
            return this.b.queue(extensionId, () => this.h(extensionId, key, value));
        }
        async h(extensionId, key, value) {
            const fullKey = this.m(extensionId, key);
            await this.c.set(fullKey, value);
            this.f.trace('[mainThreadSecretState] Password set for: ', extensionId, key);
        }
        $deletePassword(extensionId, key) {
            this.f.trace(`[mainThreadSecretState] Deleting password for ${extensionId} extension: `, key);
            return this.b.queue(extensionId, () => this.j(extensionId, key));
        }
        async j(extensionId, key) {
            const fullKey = this.m(extensionId, key);
            await this.c.delete(fullKey);
            this.f.trace('[mainThreadSecretState] Password deleted for: ', extensionId, key);
        }
        m(extensionId, key) {
            return JSON.stringify({ extensionId, key });
        }
        n(key) {
            return JSON.parse(key);
        }
    };
    exports.$itb = $itb;
    exports.$itb = $itb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadSecretState),
        __param(1, secrets_1.$FT),
        __param(2, log_1.$5i),
        __param(3, environmentService_1.$LT)
    ], $itb);
});
//# sourceMappingURL=mainThreadSecretState.js.map