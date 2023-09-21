/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/ternarySearchTree", "vs/base/common/uuid", "vs/base/node/macAddress"], function (require, exports, os_1, ternarySearchTree_1, uuid, macAddress_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Im = exports.$Hm = void 0;
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
    exports.$Hm = new class {
        c(mac) {
            if (!this.a) {
                this.a = ternarySearchTree_1.$Hh.forStrings();
                // dash-separated
                this.a.set('00-50-56', true);
                this.a.set('00-0C-29', true);
                this.a.set('00-05-69', true);
                this.a.set('00-03-FF', true);
                this.a.set('00-1C-42', true);
                this.a.set('00-16-3E', true);
                this.a.set('08-00-27', true);
                // colon-separated
                this.a.set('00:50:56', true);
                this.a.set('00:0C:29', true);
                this.a.set('00:05:69', true);
                this.a.set('00:03:FF', true);
                this.a.set('00:1C:42', true);
                this.a.set('00:16:3E', true);
                this.a.set('08:00:27', true);
            }
            return !!this.a.findSubstr(mac);
        }
        value() {
            if (this.b === undefined) {
                let vmOui = 0;
                let interfaceCount = 0;
                const interfaces = (0, os_1.networkInterfaces)();
                for (const name in interfaces) {
                    const networkInterface = interfaces[name];
                    if (networkInterface) {
                        for (const { mac, internal } of networkInterface) {
                            if (!internal) {
                                interfaceCount += 1;
                                if (this.c(mac.toUpperCase())) {
                                    vmOui += 1;
                                }
                            }
                        }
                    }
                }
                this.b = interfaceCount > 0
                    ? vmOui / interfaceCount
                    : 0;
            }
            return this.b;
        }
    };
    let machineId;
    async function $Im(errorLogger) {
        if (!machineId) {
            machineId = (async () => {
                const id = await getMacMachineId(errorLogger);
                return id || uuid.$4f(); // fallback, generate a UUID
            })();
        }
        return machineId;
    }
    exports.$Im = $Im;
    async function getMacMachineId(errorLogger) {
        try {
            const crypto = await new Promise((resolve_1, reject_1) => { require(['crypto'], resolve_1, reject_1); });
            const macAddress = (0, macAddress_1.$Gm)();
            return crypto.createHash('sha256').update(macAddress, 'utf8').digest('hex');
        }
        catch (err) {
            errorLogger(err);
            return undefined;
        }
    }
});
//# sourceMappingURL=id.js.map