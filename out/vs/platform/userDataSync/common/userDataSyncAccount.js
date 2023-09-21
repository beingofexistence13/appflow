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
    exports.UserDataSyncAccountService = exports.IUserDataSyncAccountService = void 0;
    exports.IUserDataSyncAccountService = (0, instantiation_1.createDecorator)('IUserDataSyncAccountService');
    let UserDataSyncAccountService = class UserDataSyncAccountService extends lifecycle_1.Disposable {
        get account() { return this._account; }
        constructor(userDataSyncStoreService, logService) {
            super();
            this.userDataSyncStoreService = userDataSyncStoreService;
            this.logService = logService;
            this._onDidChangeAccount = this._register(new event_1.Emitter());
            this.onDidChangeAccount = this._onDidChangeAccount.event;
            this._onTokenFailed = this._register(new event_1.Emitter());
            this.onTokenFailed = this._onTokenFailed.event;
            this.wasTokenFailed = false;
            this._register(userDataSyncStoreService.onTokenFailed(code => {
                this.logService.info('Settings Sync auth token failed', this.account?.authenticationProviderId, this.wasTokenFailed, code);
                this.updateAccount(undefined);
                if (code === "Forbidden" /* UserDataSyncErrorCode.Forbidden */) {
                    this._onTokenFailed.fire(true /*bail out immediately*/);
                }
                else {
                    this._onTokenFailed.fire(this.wasTokenFailed /* bail out if token failed before */);
                }
                this.wasTokenFailed = true;
            }));
            this._register(userDataSyncStoreService.onTokenSucceed(() => this.wasTokenFailed = false));
        }
        async updateAccount(account) {
            if (account && this._account ? account.token !== this._account.token || account.authenticationProviderId !== this._account.authenticationProviderId : account !== this._account) {
                this._account = account;
                if (this._account) {
                    this.userDataSyncStoreService.setAuthToken(this._account.token, this._account.authenticationProviderId);
                }
                this._onDidChangeAccount.fire(account);
            }
        }
    };
    exports.UserDataSyncAccountService = UserDataSyncAccountService;
    exports.UserDataSyncAccountService = UserDataSyncAccountService = __decorate([
        __param(0, userDataSync_1.IUserDataSyncStoreService),
        __param(1, userDataSync_1.IUserDataSyncLogService)
    ], UserDataSyncAccountService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jQWNjb3VudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3VzZXJEYXRhU3luYy9jb21tb24vdXNlckRhdGFTeW5jQWNjb3VudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFZbkYsUUFBQSwyQkFBMkIsR0FBRyxJQUFBLCtCQUFlLEVBQThCLDZCQUE2QixDQUFDLENBQUM7SUFXaEgsSUFBTSwwQkFBMEIsR0FBaEMsTUFBTSwwQkFBMkIsU0FBUSxzQkFBVTtRQUt6RCxJQUFJLE9BQU8sS0FBdUMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQVN6RSxZQUM0Qix3QkFBb0UsRUFDdEUsVUFBb0Q7WUFFN0UsS0FBSyxFQUFFLENBQUM7WUFIb0MsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEyQjtZQUNyRCxlQUFVLEdBQVYsVUFBVSxDQUF5QjtZQVZ0RSx3QkFBbUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFvQyxDQUFDLENBQUM7WUFDckYsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQztZQUVyRCxtQkFBYyxHQUFxQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFXLENBQUMsQ0FBQztZQUN6RSxrQkFBYSxHQUFtQixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztZQUUzRCxtQkFBYyxHQUFZLEtBQUssQ0FBQztZQU92QyxJQUFJLENBQUMsU0FBUyxDQUFDLHdCQUF3QixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDNUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsaUNBQWlDLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMzSCxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM5QixJQUFJLElBQUksc0RBQW9DLEVBQUU7b0JBQzdDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO2lCQUN4RDtxQkFBTTtvQkFDTixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7aUJBQ3BGO2dCQUNELElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1lBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsU0FBUyxDQUFDLHdCQUF3QixDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDNUYsQ0FBQztRQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBeUM7WUFDNUQsSUFBSSxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssSUFBSSxPQUFPLENBQUMsd0JBQXdCLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2hMLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO2dCQUN4QixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7b0JBQ2xCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO2lCQUN4RztnQkFDRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3ZDO1FBQ0YsQ0FBQztLQUVELENBQUE7SUExQ1ksZ0VBQTBCO3lDQUExQiwwQkFBMEI7UUFlcEMsV0FBQSx3Q0FBeUIsQ0FBQTtRQUN6QixXQUFBLHNDQUF1QixDQUFBO09BaEJiLDBCQUEwQixDQTBDdEMifQ==