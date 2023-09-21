/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionHostStatusService = exports.IExtensionHostStatusService = void 0;
    exports.IExtensionHostStatusService = (0, instantiation_1.createDecorator)('extensionHostStatusService');
    class ExtensionHostStatusService {
        constructor() {
            this._exitInfo = new Map();
        }
        setExitInfo(reconnectionToken, info) {
            this._exitInfo.set(reconnectionToken, info);
        }
        getExitInfo(reconnectionToken) {
            return this._exitInfo.get(reconnectionToken) || null;
        }
    }
    exports.ExtensionHostStatusService = ExtensionHostStatusService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uSG9zdFN0YXR1c1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9zZXJ2ZXIvbm9kZS9leHRlbnNpb25Ib3N0U3RhdHVzU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLbkYsUUFBQSwyQkFBMkIsR0FBRyxJQUFBLCtCQUFlLEVBQThCLDRCQUE0QixDQUFDLENBQUM7SUFTdEgsTUFBYSwwQkFBMEI7UUFBdkM7WUFHa0IsY0FBUyxHQUFHLElBQUksR0FBRyxFQUFrQyxDQUFDO1FBU3hFLENBQUM7UUFQQSxXQUFXLENBQUMsaUJBQXlCLEVBQUUsSUFBNEI7WUFDbEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVELFdBQVcsQ0FBQyxpQkFBeUI7WUFDcEMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLElBQUksQ0FBQztRQUN0RCxDQUFDO0tBQ0Q7SUFaRCxnRUFZQyJ9