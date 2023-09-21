/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network"], function (require, exports, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseExtensionDevOptions = void 0;
    function parseExtensionDevOptions(environmentService) {
        // handle extension host lifecycle a bit special when we know we are developing an extension that runs inside
        const isExtensionDevHost = environmentService.isExtensionDevelopment;
        let debugOk = true;
        const extDevLocs = environmentService.extensionDevelopmentLocationURI;
        if (extDevLocs) {
            for (const x of extDevLocs) {
                if (x.scheme !== network_1.Schemas.file) {
                    debugOk = false;
                }
            }
        }
        const isExtensionDevDebug = debugOk && typeof environmentService.debugExtensionHost.port === 'number';
        const isExtensionDevDebugBrk = debugOk && !!environmentService.debugExtensionHost.break;
        const isExtensionDevTestFromCli = isExtensionDevHost && !!environmentService.extensionTestsLocationURI && !environmentService.debugExtensionHost.debugId;
        return {
            isExtensionDevHost,
            isExtensionDevDebug,
            isExtensionDevDebugBrk,
            isExtensionDevTestFromCli
        };
    }
    exports.parseExtensionDevOptions = parseExtensionDevOptions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uRGV2T3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25zL2NvbW1vbi9leHRlbnNpb25EZXZPcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxTQUFnQix3QkFBd0IsQ0FBQyxrQkFBdUM7UUFDL0UsNkdBQTZHO1FBQzdHLE1BQU0sa0JBQWtCLEdBQUcsa0JBQWtCLENBQUMsc0JBQXNCLENBQUM7UUFFckUsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ25CLE1BQU0sVUFBVSxHQUFHLGtCQUFrQixDQUFDLCtCQUErQixDQUFDO1FBQ3RFLElBQUksVUFBVSxFQUFFO1lBQ2YsS0FBSyxNQUFNLENBQUMsSUFBSSxVQUFVLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLElBQUksRUFBRTtvQkFDOUIsT0FBTyxHQUFHLEtBQUssQ0FBQztpQkFDaEI7YUFDRDtTQUNEO1FBRUQsTUFBTSxtQkFBbUIsR0FBRyxPQUFPLElBQUksT0FBTyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDO1FBQ3RHLE1BQU0sc0JBQXNCLEdBQUcsT0FBTyxJQUFJLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7UUFDeEYsTUFBTSx5QkFBeUIsR0FBRyxrQkFBa0IsSUFBSSxDQUFDLENBQUMsa0JBQWtCLENBQUMseUJBQXlCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUM7UUFDekosT0FBTztZQUNOLGtCQUFrQjtZQUNsQixtQkFBbUI7WUFDbkIsc0JBQXNCO1lBQ3RCLHlCQUF5QjtTQUN6QixDQUFDO0lBQ0gsQ0FBQztJQXZCRCw0REF1QkMifQ==