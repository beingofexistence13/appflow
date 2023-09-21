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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostRpcService"], function (require, exports, instantiation_1, log_1, extHostProtocol, extHostRpcService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NullApiDeprecationService = exports.ExtHostApiDeprecationService = exports.IExtHostApiDeprecationService = void 0;
    exports.IExtHostApiDeprecationService = (0, instantiation_1.createDecorator)('IExtHostApiDeprecationService');
    let ExtHostApiDeprecationService = class ExtHostApiDeprecationService {
        constructor(rpc, _extHostLogService) {
            this._extHostLogService = _extHostLogService;
            this._reportedUsages = new Set();
            this._telemetryShape = rpc.getProxy(extHostProtocol.MainContext.MainThreadTelemetry);
        }
        report(apiId, extension, migrationSuggestion) {
            const key = this.getUsageKey(apiId, extension);
            if (this._reportedUsages.has(key)) {
                return;
            }
            this._reportedUsages.add(key);
            if (extension.isUnderDevelopment) {
                this._extHostLogService.warn(`[Deprecation Warning] '${apiId}' is deprecated. ${migrationSuggestion}`);
            }
            this._telemetryShape.$publicLog2('extHostDeprecatedApiUsage', {
                extensionId: extension.identifier.value,
                apiId: apiId,
            });
        }
        getUsageKey(apiId, extension) {
            return `${apiId}-${extension.identifier.value}`;
        }
    };
    exports.ExtHostApiDeprecationService = ExtHostApiDeprecationService;
    exports.ExtHostApiDeprecationService = ExtHostApiDeprecationService = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, log_1.ILogService)
    ], ExtHostApiDeprecationService);
    exports.NullApiDeprecationService = Object.freeze(new class {
        report(_apiId, _extension, _warningMessage) {
            // noop
        }
    }());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEFwaURlcHJlY2F0aW9uU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvY29tbW9uL2V4dEhvc3RBcGlEZXByZWNhdGlvblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBY25GLFFBQUEsNkJBQTZCLEdBQUcsSUFBQSwrQkFBZSxFQUFnQywrQkFBK0IsQ0FBQyxDQUFDO0lBRXRILElBQU0sNEJBQTRCLEdBQWxDLE1BQU0sNEJBQTRCO1FBT3hDLFlBQ3FCLEdBQXVCLEVBQzlCLGtCQUFnRDtZQUEvQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQWE7WUFMN0Msb0JBQWUsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1lBT3BELElBQUksQ0FBQyxlQUFlLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDdEYsQ0FBQztRQUVNLE1BQU0sQ0FBQyxLQUFhLEVBQUUsU0FBZ0MsRUFBRSxtQkFBMkI7WUFDekYsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDL0MsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbEMsT0FBTzthQUNQO1lBQ0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFOUIsSUFBSSxTQUFTLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEtBQUssb0JBQW9CLG1CQUFtQixFQUFFLENBQUMsQ0FBQzthQUN2RztZQVlELElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFpRCwyQkFBMkIsRUFBRTtnQkFDN0csV0FBVyxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSztnQkFDdkMsS0FBSyxFQUFFLEtBQUs7YUFDWixDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sV0FBVyxDQUFDLEtBQWEsRUFBRSxTQUFnQztZQUNsRSxPQUFPLEdBQUcsS0FBSyxJQUFJLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDakQsQ0FBQztLQUNELENBQUE7SUE1Q1ksb0VBQTRCOzJDQUE1Qiw0QkFBNEI7UUFRdEMsV0FBQSxzQ0FBa0IsQ0FBQTtRQUNsQixXQUFBLGlCQUFXLENBQUE7T0FURCw0QkFBNEIsQ0E0Q3hDO0lBR1ksUUFBQSx5QkFBeUIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUk7UUFHbkQsTUFBTSxDQUFDLE1BQWMsRUFBRSxVQUFpQyxFQUFFLGVBQXVCO1lBQ3ZGLE9BQU87UUFDUixDQUFDO0tBQ0QsRUFBRSxDQUFDLENBQUMifQ==