/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/ipc/electron-sandbox/services", "vs/base/common/lifecycle", "vs/platform/instantiation/common/extensions", "vs/platform/userDataSync/common/userDataSyncMachines"], function (require, exports, services_1, lifecycle_1, extensions_1, userDataSyncMachines_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let UserDataSyncMachinesService = class UserDataSyncMachinesService extends lifecycle_1.Disposable {
        get onDidChange() { return this.channel.listen('onDidChange'); }
        constructor(sharedProcessService) {
            super();
            this.channel = sharedProcessService.getChannel('userDataSyncMachines');
        }
        getMachines() {
            return this.channel.call('getMachines');
        }
        addCurrentMachine() {
            return this.channel.call('addCurrentMachine');
        }
        removeCurrentMachine() {
            return this.channel.call('removeCurrentMachine');
        }
        renameMachine(machineId, name) {
            return this.channel.call('renameMachine', [machineId, name]);
        }
        setEnablements(enablements) {
            return this.channel.call('setEnablements', enablements);
        }
    };
    UserDataSyncMachinesService = __decorate([
        __param(0, services_1.ISharedProcessService)
    ], UserDataSyncMachinesService);
    (0, extensions_1.registerSingleton)(userDataSyncMachines_1.IUserDataSyncMachinesService, UserDataSyncMachinesService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jTWFjaGluZXNTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3VzZXJEYXRhU3luYy9lbGVjdHJvbi1zYW5kYm94L3VzZXJEYXRhU3luY01hY2hpbmVzU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7OztJQVNoRyxJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLHNCQUFVO1FBTW5ELElBQUksV0FBVyxLQUFrQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFPLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVuRixZQUN3QixvQkFBMkM7WUFFbEUsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsT0FBTyxHQUFHLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFFRCxXQUFXO1lBQ1YsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBeUIsYUFBYSxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELGlCQUFpQjtZQUNoQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVELG9CQUFvQjtZQUNuQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVELGFBQWEsQ0FBQyxTQUFpQixFQUFFLElBQVk7WUFDNUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRUQsY0FBYyxDQUFDLFdBQWdDO1lBQzlDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDekQsQ0FBQztLQUVELENBQUE7SUFuQ0ssMkJBQTJCO1FBUzlCLFdBQUEsZ0NBQXFCLENBQUE7T0FUbEIsMkJBQTJCLENBbUNoQztJQUVELElBQUEsOEJBQWlCLEVBQUMsbURBQTRCLEVBQUUsMkJBQTJCLG9DQUE0QixDQUFDIn0=