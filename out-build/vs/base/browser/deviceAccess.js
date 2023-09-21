/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ZQ = exports.$YQ = exports.$XQ = void 0;
    async function $XQ(options) {
        const usb = navigator.usb;
        if (!usb) {
            return undefined;
        }
        const device = await usb.requestDevice({ filters: options?.filters ?? [] });
        if (!device) {
            return undefined;
        }
        return {
            deviceClass: device.deviceClass,
            deviceProtocol: device.deviceProtocol,
            deviceSubclass: device.deviceSubclass,
            deviceVersionMajor: device.deviceVersionMajor,
            deviceVersionMinor: device.deviceVersionMinor,
            deviceVersionSubminor: device.deviceVersionSubminor,
            manufacturerName: device.manufacturerName,
            productId: device.productId,
            productName: device.productName,
            serialNumber: device.serialNumber,
            usbVersionMajor: device.usbVersionMajor,
            usbVersionMinor: device.usbVersionMinor,
            usbVersionSubminor: device.usbVersionSubminor,
            vendorId: device.vendorId,
        };
    }
    exports.$XQ = $XQ;
    async function $YQ(options) {
        const serial = navigator.serial;
        if (!serial) {
            return undefined;
        }
        const port = await serial.requestPort({ filters: options?.filters ?? [] });
        if (!port) {
            return undefined;
        }
        const info = port.getInfo();
        return {
            usbVendorId: info.usbVendorId,
            usbProductId: info.usbProductId
        };
    }
    exports.$YQ = $YQ;
    async function $ZQ(options) {
        const hid = navigator.hid;
        if (!hid) {
            return undefined;
        }
        const devices = await hid.requestDevice({ filters: options?.filters ?? [] });
        if (!devices.length) {
            return undefined;
        }
        const device = devices[0];
        return {
            opened: device.opened,
            vendorId: device.vendorId,
            productId: device.productId,
            productName: device.productName,
            collections: device.collections
        };
    }
    exports.$ZQ = $ZQ;
});
//# sourceMappingURL=deviceAccess.js.map