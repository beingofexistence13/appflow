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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, lifecycle_1, marshalling_1, extHost_protocol_1, extHostCustomers_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ltb = void 0;
    let $ltb = class $ltb extends lifecycle_1.$kc {
        constructor(context, c) {
            super();
            this.c = c;
            this.b = this.B(new lifecycle_1.$sc());
            this.a = context.getProxy(extHost_protocol_1.$2J.ExtHostProfileContentHandlers);
        }
        async $registerProfileContentHandler(id, name, description, extensionId) {
            this.b.set(id, this.c.registerProfileContentHandler(id, {
                name,
                description,
                extensionId,
                saveProfile: async (name, content, token) => {
                    const result = await this.a.$saveProfile(id, name, content, token);
                    return result ? (0, marshalling_1.$$g)(result) : null;
                },
                readProfile: async (uri, token) => {
                    return this.a.$readProfile(id, uri, token);
                },
            }));
        }
        async $unregisterProfileContentHandler(id) {
            this.b.deleteAndDispose(id);
        }
    };
    exports.$ltb = $ltb;
    exports.$ltb = $ltb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadProfileContentHandlers),
        __param(1, userDataProfile_1.$HJ)
    ], $ltb);
});
//# sourceMappingURL=mainThreadProfilContentHandlers.js.map