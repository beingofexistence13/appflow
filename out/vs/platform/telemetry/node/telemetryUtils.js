/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/node/id", "vs/platform/telemetry/common/telemetry"], function (require, exports, platform_1, id_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveMachineId = void 0;
    async function resolveMachineId(stateService, logService) {
        // We cache the machineId for faster lookups
        // and resolve it only once initially if not cached or we need to replace the macOS iBridge device
        let machineId = stateService.getItem(telemetry_1.machineIdKey);
        if (typeof machineId !== 'string' || (platform_1.isMacintosh && machineId === '6c9d2bc8f91b89624add29c0abeae7fb42bf539fa1cdb2e3e57cd668fa9bcead')) {
            machineId = await (0, id_1.getMachineId)(logService.error.bind(logService));
        }
        return machineId;
    }
    exports.resolveMachineId = resolveMachineId;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVsZW1ldHJ5VXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZWxlbWV0cnkvbm9kZS90ZWxlbWV0cnlVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTekYsS0FBSyxVQUFVLGdCQUFnQixDQUFDLFlBQStCLEVBQUUsVUFBdUI7UUFDOUYsNENBQTRDO1FBQzVDLGtHQUFrRztRQUNsRyxJQUFJLFNBQVMsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFTLHdCQUFZLENBQUMsQ0FBQztRQUMzRCxJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsSUFBSSxDQUFDLHNCQUFXLElBQUksU0FBUyxLQUFLLGtFQUFrRSxDQUFDLEVBQUU7WUFDdkksU0FBUyxHQUFHLE1BQU0sSUFBQSxpQkFBWSxFQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDbEU7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBVEQsNENBU0MifQ==