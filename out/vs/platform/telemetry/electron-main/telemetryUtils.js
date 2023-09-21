/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/node/telemetryUtils"], function (require, exports, telemetry_1, telemetryUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveMachineId = void 0;
    async function resolveMachineId(stateService, logService) {
        // Call the node layers implementation to avoid code duplication
        const machineId = await (0, telemetryUtils_1.resolveMachineId)(stateService, logService);
        stateService.setItem(telemetry_1.machineIdKey, machineId);
        return machineId;
    }
    exports.resolveMachineId = resolveMachineId;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVsZW1ldHJ5VXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZWxlbWV0cnkvZWxlY3Ryb24tbWFpbi90ZWxlbWV0cnlVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPekYsS0FBSyxVQUFVLGdCQUFnQixDQUFDLFlBQTJCLEVBQUUsVUFBdUI7UUFDMUYsZ0VBQWdFO1FBQ2hFLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBQSxpQ0FBb0IsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDdkUsWUFBWSxDQUFDLE9BQU8sQ0FBQyx3QkFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzlDLE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFMRCw0Q0FLQyJ9