/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os"], function (require, exports, os_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getMac = void 0;
    const invalidMacAddresses = new Set([
        '00:00:00:00:00:00',
        'ff:ff:ff:ff:ff:ff',
        'ac:de:48:00:11:22'
    ]);
    function validateMacAddress(candidate) {
        const tempCandidate = candidate.replace(/\-/g, ':').toLowerCase();
        return !invalidMacAddresses.has(tempCandidate);
    }
    function getMac() {
        const ifaces = (0, os_1.networkInterfaces)();
        for (const name in ifaces) {
            const networkInterface = ifaces[name];
            if (networkInterface) {
                for (const { mac } of networkInterface) {
                    if (validateMacAddress(mac)) {
                        return mac;
                    }
                }
            }
        }
        throw new Error('Unable to retrieve mac address (unexpected format)');
    }
    exports.getMac = getMac;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFjQWRkcmVzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2Uvbm9kZS9tYWNBZGRyZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUloRyxNQUFNLG1CQUFtQixHQUFHLElBQUksR0FBRyxDQUFDO1FBQ25DLG1CQUFtQjtRQUNuQixtQkFBbUI7UUFDbkIsbUJBQW1CO0tBQ25CLENBQUMsQ0FBQztJQUVILFNBQVMsa0JBQWtCLENBQUMsU0FBaUI7UUFDNUMsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbEUsT0FBTyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsU0FBZ0IsTUFBTTtRQUNyQixNQUFNLE1BQU0sR0FBRyxJQUFBLHNCQUFpQixHQUFFLENBQUM7UUFDbkMsS0FBSyxNQUFNLElBQUksSUFBSSxNQUFNLEVBQUU7WUFDMUIsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsSUFBSSxnQkFBZ0IsRUFBRTtnQkFDckIsS0FBSyxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksZ0JBQWdCLEVBQUU7b0JBQ3ZDLElBQUksa0JBQWtCLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQzVCLE9BQU8sR0FBRyxDQUFDO3FCQUNYO2lCQUNEO2FBQ0Q7U0FDRDtRQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBZEQsd0JBY0MifQ==