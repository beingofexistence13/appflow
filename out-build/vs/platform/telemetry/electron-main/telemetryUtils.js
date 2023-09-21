/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/node/telemetryUtils"], function (require, exports, telemetry_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$66b = void 0;
    async function $66b(stateService, logService) {
        // Call the node layers implementation to avoid code duplication
        const machineId = await (0, telemetryUtils_1.$56b)(stateService, logService);
        stateService.setItem(telemetry_1.$bl, machineId);
        return machineId;
    }
    exports.$66b = $66b;
});
//# sourceMappingURL=telemetryUtils.js.map