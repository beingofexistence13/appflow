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
    exports.MainThreadLabelService = void 0;
    let MainThreadLabelService = class MainThreadLabelService extends lifecycle_1.Disposable {
        constructor(_, _labelService) {
            super();
            this._labelService = _labelService;
            this._resourceLabelFormatters = this._register(new lifecycle_1.DisposableMap());
        }
        $registerResourceLabelFormatter(handle, formatter) {
            // Dynamicily registered formatters should have priority over those contributed via package.json
            formatter.priority = true;
            const disposable = this._labelService.registerCachedFormatter(formatter);
            this._resourceLabelFormatters.set(handle, disposable);
        }
        $unregisterResourceLabelFormatter(handle) {
            this._resourceLabelFormatters.deleteAndDispose(handle);
        }
    };
    exports.MainThreadLabelService = MainThreadLabelService;
    exports.MainThreadLabelService = MainThreadLabelService = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadLabelService),
        __param(1, label_1.ILabelService)
    ], MainThreadLabelService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZExhYmVsU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvYnJvd3Nlci9tYWluVGhyZWFkTGFiZWxTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVF6RixJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1QixTQUFRLHNCQUFVO1FBSXJELFlBQ0MsQ0FBa0IsRUFDSCxhQUE2QztZQUU1RCxLQUFLLEVBQUUsQ0FBQztZQUZ3QixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUo1Qyw2QkFBd0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkseUJBQWEsRUFBVSxDQUFDLENBQUM7UUFPeEYsQ0FBQztRQUVELCtCQUErQixDQUFDLE1BQWMsRUFBRSxTQUFpQztZQUNoRixnR0FBZ0c7WUFDaEcsU0FBUyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDMUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6RSxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBRUQsaUNBQWlDLENBQUMsTUFBYztZQUMvQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEQsQ0FBQztLQUNELENBQUE7SUFyQlksd0RBQXNCO3FDQUF0QixzQkFBc0I7UUFEbEMsSUFBQSx1Q0FBb0IsRUFBQyw4QkFBVyxDQUFDLHNCQUFzQixDQUFDO1FBT3RELFdBQUEscUJBQWEsQ0FBQTtPQU5ILHNCQUFzQixDQXFCbEMifQ==