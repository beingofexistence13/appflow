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
    let UserDataSyncMachinesService = class UserDataSyncMachinesService extends lifecycle_1.$kc {
        get onDidChange() { return this.a.listen('onDidChange'); }
        constructor(sharedProcessService) {
            super();
            this.a = sharedProcessService.getChannel('userDataSyncMachines');
        }
        getMachines() {
            return this.a.call('getMachines');
        }
        addCurrentMachine() {
            return this.a.call('addCurrentMachine');
        }
        removeCurrentMachine() {
            return this.a.call('removeCurrentMachine');
        }
        renameMachine(machineId, name) {
            return this.a.call('renameMachine', [machineId, name]);
        }
        setEnablements(enablements) {
            return this.a.call('setEnablements', enablements);
        }
    };
    UserDataSyncMachinesService = __decorate([
        __param(0, services_1.$A7b)
    ], UserDataSyncMachinesService);
    (0, extensions_1.$mr)(userDataSyncMachines_1.$sgb, UserDataSyncMachinesService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=userDataSyncMachinesService.js.map