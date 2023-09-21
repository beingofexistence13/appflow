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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, event_1, lifecycle_1, instantiation_1, userDataSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Fzb = exports.$Ezb = void 0;
    exports.$Ezb = (0, instantiation_1.$Bh)('IUserDataSyncAccountService');
    let $Fzb = class $Fzb extends lifecycle_1.$kc {
        get account() { return this.a; }
        constructor(g, h) {
            super();
            this.g = g;
            this.h = h;
            this.b = this.B(new event_1.$fd());
            this.onDidChangeAccount = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onTokenFailed = this.c.event;
            this.f = false;
            this.B(g.onTokenFailed(code => {
                this.h.info('Settings Sync auth token failed', this.account?.authenticationProviderId, this.f, code);
                this.updateAccount(undefined);
                if (code === "Forbidden" /* UserDataSyncErrorCode.Forbidden */) {
                    this.c.fire(true /*bail out immediately*/);
                }
                else {
                    this.c.fire(this.f /* bail out if token failed before */);
                }
                this.f = true;
            }));
            this.B(g.onTokenSucceed(() => this.f = false));
        }
        async updateAccount(account) {
            if (account && this.a ? account.token !== this.a.token || account.authenticationProviderId !== this.a.authenticationProviderId : account !== this.a) {
                this.a = account;
                if (this.a) {
                    this.g.setAuthToken(this.a.token, this.a.authenticationProviderId);
                }
                this.b.fire(account);
            }
        }
    };
    exports.$Fzb = $Fzb;
    exports.$Fzb = $Fzb = __decorate([
        __param(0, userDataSync_1.$Fgb),
        __param(1, userDataSync_1.$Ugb)
    ], $Fzb);
});
//# sourceMappingURL=userDataSyncAccount.js.map