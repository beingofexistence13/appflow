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
define(["require", "exports", "vs/nls!vs/workbench/api/browser/mainThreadEditSessionIdentityParticipant", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensions/common/extHostCustomers", "vs/base/common/async", "vs/platform/workspace/common/editSessions", "vs/workbench/api/common/extHost.protocol"], function (require, exports, nls_1, instantiation_1, extHostCustomers_1, async_1, editSessions_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Lkb = void 0;
    class ExtHostEditSessionIdentityCreateParticipant {
        constructor(extHostContext) {
            this.b = 10000;
            this.a = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostWorkspace);
        }
        async participate(workspaceFolder, token) {
            const p = new Promise((resolve, reject) => {
                setTimeout(() => reject(new Error((0, nls_1.localize)(0, null))), this.b);
                this.a.$onWillCreateEditSessionIdentity(workspaceFolder.uri, token, this.b).then(resolve, reject);
            });
            return (0, async_1.$wg)(p, token);
        }
    }
    let $Lkb = class $Lkb {
        constructor(extHostContext, instantiationService, b) {
            this.b = b;
            this.a = this.b.addEditSessionIdentityCreateParticipant(instantiationService.createInstance(ExtHostEditSessionIdentityCreateParticipant, extHostContext));
        }
        dispose() {
            this.a.dispose();
        }
    };
    exports.$Lkb = $Lkb;
    exports.$Lkb = $Lkb = __decorate([
        extHostCustomers_1.$kbb,
        __param(1, instantiation_1.$Ah),
        __param(2, editSessions_1.$8z)
    ], $Lkb);
});
//# sourceMappingURL=mainThreadEditSessionIdentityParticipant.js.map