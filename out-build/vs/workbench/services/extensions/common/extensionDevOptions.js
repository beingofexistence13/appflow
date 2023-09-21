/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network"], function (require, exports, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ccb = void 0;
    function $Ccb(environmentService) {
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
    exports.$Ccb = $Ccb;
});
//# sourceMappingURL=extensionDevOptions.js.map