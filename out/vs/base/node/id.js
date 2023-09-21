/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/ternarySearchTree", "vs/base/common/uuid", "vs/base/node/macAddress"], function (require, exports, os_1, ternarySearchTree_1, uuid, macAddress_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getMachineId = exports.virtualMachineHint = void 0;
    // http://www.techrepublic.com/blog/data-center/mac-address-scorecard-for-common-virtual-machine-platforms/
    // VMware ESX 3, Server, Workstation, Player	00-50-56, 00-0C-29, 00-05-69
    // Microsoft Hyper-V, Virtual Server, Virtual PC	00-03-FF
    // Parallels Desktop, Workstation, Server, Virtuozzo	00-1C-42
    // Virtual Iron 4	00-0F-4B
    // Red Hat Xen	00-16-3E
    // Oracle VM	00-16-3E
    // XenSource	00-16-3E
    // Novell Xen	00-16-3E
    // Sun xVM VirtualBox	08-00-27
    exports.virtualMachineHint = new class {
        _isVirtualMachineMacAddress(mac) {
            if (!this._virtualMachineOUIs) {
                this._virtualMachineOUIs = ternarySearchTree_1.TernarySearchTree.forStrings();
                // dash-separated
                this._virtualMachineOUIs.set('00-50-56', true);
                this._virtualMachineOUIs.set('00-0C-29', true);
                this._virtualMachineOUIs.set('00-05-69', true);
                this._virtualMachineOUIs.set('00-03-FF', true);
                this._virtualMachineOUIs.set('00-1C-42', true);
                this._virtualMachineOUIs.set('00-16-3E', true);
                this._virtualMachineOUIs.set('08-00-27', true);
                // colon-separated
                this._virtualMachineOUIs.set('00:50:56', true);
                this._virtualMachineOUIs.set('00:0C:29', true);
                this._virtualMachineOUIs.set('00:05:69', true);
                this._virtualMachineOUIs.set('00:03:FF', true);
                this._virtualMachineOUIs.set('00:1C:42', true);
                this._virtualMachineOUIs.set('00:16:3E', true);
                this._virtualMachineOUIs.set('08:00:27', true);
            }
            return !!this._virtualMachineOUIs.findSubstr(mac);
        }
        value() {
            if (this._value === undefined) {
                let vmOui = 0;
                let interfaceCount = 0;
                const interfaces = (0, os_1.networkInterfaces)();
                for (const name in interfaces) {
                    const networkInterface = interfaces[name];
                    if (networkInterface) {
                        for (const { mac, internal } of networkInterface) {
                            if (!internal) {
                                interfaceCount += 1;
                                if (this._isVirtualMachineMacAddress(mac.toUpperCase())) {
                                    vmOui += 1;
                                }
                            }
                        }
                    }
                }
                this._value = interfaceCount > 0
                    ? vmOui / interfaceCount
                    : 0;
            }
            return this._value;
        }
    };
    let machineId;
    async function getMachineId(errorLogger) {
        if (!machineId) {
            machineId = (async () => {
                const id = await getMacMachineId(errorLogger);
                return id || uuid.generateUuid(); // fallback, generate a UUID
            })();
        }
        return machineId;
    }
    exports.getMachineId = getMachineId;
    async function getMacMachineId(errorLogger) {
        try {
            const crypto = await new Promise((resolve_1, reject_1) => { require(['crypto'], resolve_1, reject_1); });
            const macAddress = (0, macAddress_1.getMac)();
            return crypto.createHash('sha256').update(macAddress, 'utf8').digest('hex');
        }
        catch (err) {
            errorLogger(err);
            return undefined;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL25vZGUvaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLDJHQUEyRztJQUMzRyx5RUFBeUU7SUFDekUseURBQXlEO0lBQ3pELDZEQUE2RDtJQUM3RCwwQkFBMEI7SUFDMUIsdUJBQXVCO0lBQ3ZCLHFCQUFxQjtJQUNyQixxQkFBcUI7SUFDckIsc0JBQXNCO0lBQ3RCLDhCQUE4QjtJQUNqQixRQUFBLGtCQUFrQixHQUF3QixJQUFJO1FBS2xELDJCQUEyQixDQUFDLEdBQVc7WUFDOUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtnQkFDOUIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLHFDQUFpQixDQUFDLFVBQVUsRUFBVyxDQUFDO2dCQUVuRSxpQkFBaUI7Z0JBQ2pCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUUvQyxrQkFBa0I7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