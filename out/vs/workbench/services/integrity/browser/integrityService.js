/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/integrity/common/integrity", "vs/platform/instantiation/common/extensions"], function (require, exports, integrity_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IntegrityService = void 0;
    class IntegrityService {
        async isPure() {
            return { isPure: true, proof: [] };
        }
    }
    exports.IntegrityService = IntegrityService;
    (0, extensions_1.registerSingleton)(integrity_1.IIntegrityService, IntegrityService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZWdyaXR5U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9pbnRlZ3JpdHkvYnJvd3Nlci9pbnRlZ3JpdHlTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxNQUFhLGdCQUFnQjtRQUk1QixLQUFLLENBQUMsTUFBTTtZQUNYLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUNwQyxDQUFDO0tBQ0Q7SUFQRCw0Q0FPQztJQUVELElBQUEsOEJBQWlCLEVBQUMsNkJBQWlCLEVBQUUsZ0JBQWdCLG9DQUE0QixDQUFDIn0=