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
define(["require", "exports", "vs/platform/ipc/electron-sandbox/services", "vs/platform/instantiation/common/extensions", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/userDataSync/common/userDataSyncAccount"], function (require, exports, services_1, extensions_1, lifecycle_1, event_1, userDataSyncAccount_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Z_b = void 0;
    let $Z_b = class $Z_b extends lifecycle_1.$kc {
        get account() { return this.b; }
        get onTokenFailed() { return this.a.listen('onTokenFailed'); }
        constructor(sharedProcessService) {
            super();
            this.c = this.B(new event_1.$fd());
            this.onDidChangeAccount = this.c.event;
            this.a = sharedProcessService.getChannel('userDataSyncAccount');
            this.a.call('_getInitialData').then(account => {
                this.b = account;
                this.B(this.a.listen('onDidChangeAccount')(account => {
                    this.b = account;
                    this.c.fire(account);
                }));
            });
        }
        updateAccount(account) {
            return this.a.call('updateAccount', account);
        }
    };
    exports.$Z_b = $Z_b;
    exports.$Z_b = $Z_b = __decorate([
        __param(0, services_1.$A7b)
    ], $Z_b);
    (0, extensions_1.$mr)(userDataSyncAccount_1.$Ezb, $Z_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=userDataSyncAccountService.js.map