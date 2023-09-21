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
    exports.MainThreadErrors = void 0;
    let MainThreadErrors = class MainThreadErrors {
        dispose() {
            //
        }
        $onUnexpectedError(err) {
            if (err && err.$isError) {
                const { name, message, stack } = err;
                err = err.noTelemetry ? new errors_1.ErrorNoTelemetry() : new Error();
                err.message = message;
                err.name = name;
                err.stack = stack;
            }
            (0, errors_1.onUnexpectedError)(err);
        }
    };
    exports.MainThreadErrors = MainThreadErrors;
    exports.MainThreadErrors = MainThreadErrors = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadErrors)
    ], MainThreadErrors);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZEVycm9ycy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkRXJyb3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7OztJQU96RixJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFnQjtRQUU1QixPQUFPO1lBQ04sRUFBRTtRQUNILENBQUM7UUFFRCxrQkFBa0IsQ0FBQyxHQUEwQjtZQUM1QyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxFQUFFO2dCQUN4QixNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyxHQUFHLENBQUM7Z0JBQ3JDLEdBQUcsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLHlCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBQzdELEdBQUcsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO2dCQUN0QixHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztnQkFDaEIsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7YUFDbEI7WUFDRCxJQUFBLDBCQUFpQixFQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLENBQUM7S0FDRCxDQUFBO0lBaEJZLDRDQUFnQjsrQkFBaEIsZ0JBQWdCO1FBRDVCLElBQUEsdUNBQW9CLEVBQUMsOEJBQVcsQ0FBQyxnQkFBZ0IsQ0FBQztPQUN0QyxnQkFBZ0IsQ0FnQjVCIn0=