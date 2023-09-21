/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/node/id", "vs/platform/telemetry/common/telemetry"], function (require, exports, platform_1, id_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$56b = void 0;
    async function $56b(stateService, logService) {
        // We cache the machineId for faster lookups
        // and resolve it only once initially if not cached or we need to replace the macOS iBridge device
        let machineId = stateService.getItem(telemetry_1.$bl);
        if (typeof machineId !== 'string' || (platform_1.$j && machineId === '6c9d2bc8f91b89624add29c0abeae7fb42bf539fa1cdb2e3e57cd668fa9bcead')) {
            machineId = await (0, id_1.$Im)(logService.error.bind(logService));
        }
        return machineId;
    }
    exports.$56b = $56b;
});
//# sourceMappingURL=telemetryUtils.js.map