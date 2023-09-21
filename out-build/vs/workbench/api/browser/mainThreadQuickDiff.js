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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/scm/common/quickDiff", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, cancellation_1, lifecycle_1, uri_1, extHost_protocol_1, quickDiff_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Hkb = void 0;
    let $Hkb = class $Hkb {
        constructor(extHostContext, d) {
            this.d = d;
            this.b = new Map();
            this.c = new Map();
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostQuickDiff);
        }
        async $registerQuickDiffProvider(handle, selector, label, rootUri) {
            const provider = {
                label,
                rootUri: uri_1.URI.revive(rootUri),
                selector,
                isSCM: false,
                getOriginalResource: async (uri) => {
                    return uri_1.URI.revive(await this.a.$provideOriginalResource(handle, uri, new cancellation_1.$pd().token));
                }
            };
            this.b.set(handle, provider);
            const disposable = this.d.addQuickDiffProvider(provider);
            this.c.set(handle, disposable);
        }
        async $unregisterQuickDiffProvider(handle) {
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
    exports.$Hkb = $Hkb;
    exports.$Hkb = $Hkb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadQuickDiff),
        __param(1, quickDiff_1.$aeb)
    ], $Hkb);
});
//# sourceMappingURL=mainThreadQuickDiff.js.map