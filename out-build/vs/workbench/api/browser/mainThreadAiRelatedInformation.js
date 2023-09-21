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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/aiRelatedInformation/common/aiRelatedInformation", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, cancellation_1, lifecycle_1, extHost_protocol_1, aiRelatedInformation_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mtb = void 0;
    let $mtb = class $mtb extends lifecycle_1.$kc {
        constructor(context, c) {
            super();
            this.c = c;
            this.b = this.B(new lifecycle_1.$sc());
            this.a = context.getProxy(extHost_protocol_1.$2J.ExtHostAiRelatedInformation);
        }
        $getAiRelatedInformation(query, types) {
            // TODO: use a real cancellation token
            return this.c.getRelatedInformation(query, types, cancellation_1.CancellationToken.None);
        }
        $registerAiRelatedInformationProvider(handle, type) {
            const provider = {
                provideAiRelatedInformation: (query, token) => {
                    return this.a.$provideAiRelatedInformation(handle, query, token);
                },
            };
            this.b.set(handle, this.c.registerAiRelatedInformationProvider(type, provider));
        }
        $unregisterAiRelatedInformationProvider(handle) {
            this.b.deleteAndDispose(handle);
        }
    };
    exports.$mtb = $mtb;
    exports.$mtb = $mtb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadAiRelatedInformation),
        __param(1, aiRelatedInformation_1.$YJ)
    ], $mtb);
});
//# sourceMappingURL=mainThreadAiRelatedInformation.js.map