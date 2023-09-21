/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.requestHidDevice = exports.requestSerialPort = exports.requestUsbDevice = void 0;
    async function requestUsbDevice(options) {
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
    exports.requestUsbDevice = requestUsbDevice;
    async function requestSerialPort(options) {
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
    exports.requestSerialPort = requestSerialPort;
    async function requestHidDevice(options) {
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
    exports.requestHidDevice = requestHidDevice;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlQWNjZXNzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL2RldmljZUFjY2Vzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFxQnpGLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxPQUFpQztRQUN2RSxNQUFNLEdBQUcsR0FBSSxTQUFpQixDQUFDLEdBQUcsQ0FBQztRQUNuQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1QsT0FBTyxTQUFTLENBQUM7U0FDakI7UUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDWixPQUFPLFNBQVMsQ0FBQztTQUNqQjtRQUVELE9BQU87WUFDTixXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVc7WUFDL0IsY0FBYyxFQUFFLE1BQU0sQ0FBQyxjQUFjO1lBQ3JDLGNBQWMsRUFBRSxNQUFNLENBQUMsY0FBYztZQUNyQyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsa0JBQWtCO1lBQzdDLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxrQkFBa0I7WUFDN0MscUJBQXFCLEVBQUUsTUFBTSxDQUFDLHFCQUFxQjtZQUNuRCxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsZ0JBQWdCO1lBQ3pDLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUztZQUMzQixXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVc7WUFDL0IsWUFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZO1lBQ2pDLGVBQWUsRUFBRSxNQUFNLENBQUMsZUFBZTtZQUN2QyxlQUFlLEVBQUUsTUFBTSxDQUFDLGVBQWU7WUFDdkMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLGtCQUFrQjtZQUM3QyxRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVE7U0FDekIsQ0FBQztJQUNILENBQUM7SUEzQkQsNENBMkJDO0lBU00sS0FBSyxVQUFVLGlCQUFpQixDQUFDLE9BQWlDO1FBQ3hFLE1BQU0sTUFBTSxHQUFJLFNBQWlCLENBQUMsTUFBTSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDWixPQUFPLFNBQVMsQ0FBQztTQUNqQjtRQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0UsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNWLE9BQU8sU0FBUyxDQUFDO1NBQ2pCO1FBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzVCLE9BQU87WUFDTixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDN0IsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZO1NBQy9CLENBQUM7SUFDSCxDQUFDO0lBaEJELDhDQWdCQztJQVlNLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxPQUFpQztRQUN2RSxNQUFNLEdBQUcsR0FBSSxTQUFpQixDQUFDLEdBQUcsQ0FBQztRQUNuQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1QsT0FBTyxTQUFTLENBQUM7U0FDakI7UUFFRCxNQUFNLE9BQU8sR0FBRyxNQUFNLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO1lBQ3BCLE9BQU8sU0FBUyxDQUFDO1NBQ2pCO1FBRUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLE9BQU87WUFDTixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07WUFDckIsUUFBUSxFQUFFLE1BQU0sQ0FBQyxRQUFRO1lBQ3pCLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUztZQUMzQixXQUFXLEVBQUUsTUFBTSxDQUFDLFdBQVc7WUFDL0IsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXO1NBQy9CLENBQUM7SUFDSCxDQUFDO0lBbkJELDRDQW1CQyJ9