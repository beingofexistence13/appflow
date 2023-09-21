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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/share/common/share", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, cancellation_1, lifecycle_1, uri_1, extHost_protocol_1, share_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ktb = void 0;
    let $ktb = class $ktb {
        constructor(extHostContext, d) {
            this.d = d;
            this.b = new Map();
            this.c = new Map();
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostShare);
        }
        $registerShareProvider(handle, selector, id, label, priority) {
            const provider = {
                id,
                label,
                selector,
                priority,
                provideShare: async (item) => {
                    const result = await this.a.$provideShare(handle, item, new cancellation_1.$pd().token);
                    return typeof result === 'string' ? result : uri_1.URI.revive(result);
                }
            };
            this.b.set(handle, provider);
            const disposable = this.d.registerShareProvider(provider);
            this.c.set(handle, disposable);
        }
        $unregisterShareProvider(handle) {
            if (this.b.has(handle)) {
                this.b.delete(handle);
            }
            if (this.c.has(handle)) {
                this.c.delete(handle);
            }
        }
        dispose() {
            this.b.clear();
            (0, lifecycle_1.$fc)(this.c.values());
            this.c.clear();
        }
    };
    exports.$ktb = $ktb;
    exports.$ktb = $ktb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadShare),
        __param(1, share_1.$jtb)
    ], $ktb);
});
//# sourceMappingURL=mainThreadShare.js.map