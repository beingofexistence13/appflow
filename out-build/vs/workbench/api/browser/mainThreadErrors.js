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
define(["require", "exports", "vs/base/common/errors", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/api/common/extHost.protocol"], function (require, exports, errors_1, extHostCustomers_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jkb = void 0;
    let $jkb = class $jkb {
        dispose() {
            //
        }
        $onUnexpectedError(err) {
            if (err && err.$isError) {
                const { name, message, stack } = err;
                err = err.noTelemetry ? new errors_1.$_() : new Error();
                err.message = message;
                err.name = name;
                err.stack = stack;
            }
            (0, errors_1.$Y)(err);
        }
    };
    exports.$jkb = $jkb;
    exports.$jkb = $jkb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadErrors)
    ], $jkb);
});
//# sourceMappingURL=mainThreadErrors.js.map