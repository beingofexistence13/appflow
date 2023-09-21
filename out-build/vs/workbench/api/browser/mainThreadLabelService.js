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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/label/common/label", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, lifecycle_1, label_1, extHost_protocol_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qsb = void 0;
    let $qsb = class $qsb extends lifecycle_1.$kc {
        constructor(_, b) {
            super();
            this.b = b;
            this.a = this.B(new lifecycle_1.$sc());
        }
        $registerResourceLabelFormatter(handle, formatter) {
            // Dynamicily registered formatters should have priority over those contributed via package.json
            formatter.priority = true;
            const disposable = this.b.registerCachedFormatter(formatter);
            this.a.set(handle, disposable);
        }
        $unregisterResourceLabelFormatter(handle) {
            this.a.deleteAndDispose(handle);
        }
    };
    exports.$qsb = $qsb;
    exports.$qsb = $qsb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadLabelService),
        __param(1, label_1.$Vz)
    ], $qsb);
});
//# sourceMappingURL=mainThreadLabelService.js.map