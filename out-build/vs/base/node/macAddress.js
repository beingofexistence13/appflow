/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os"], function (require, exports, os_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Gm = void 0;
    const invalidMacAddresses = new Set([
        '00:00:00:00:00:00',
        'ff:ff:ff:ff:ff:ff',
        'ac:de:48:00:11:22'
    ]);
    function validateMacAddress(candidate) {
        const tempCandidate = candidate.replace(/\-/g, ':').toLowerCase();
        return !invalidMacAddresses.has(tempCandidate);
    }
    function $Gm() {
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
    exports.$Gm = $Gm;
});
//# sourceMappingURL=macAddress.js.map