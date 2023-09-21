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
    exports.UserDataSyncAccountService = void 0;
    let UserDataSyncAccountService = class UserDataSyncAccountService extends lifecycle_1.Disposable {
        get account() { return this._account; }
        get onTokenFailed() { return this.channel.listen('onTokenFailed'); }
        constructor(sharedProcessService) {
            super();
            this._onDidChangeAccount = this._register(new event_1.Emitter());
            this.onDidChangeAccount = this._onDidChangeAccount.event;
            this.channel = sharedProcessService.getChannel('userDataSyncAccount');
            this.channel.call('_getInitialData').then(account => {
                this._account = account;
                this._register(this.channel.listen('onDidChangeAccount')(account => {
                    this._account = account;
                    this._onDidChangeAccount.fire(account);
                }));
            });
        }
        updateAccount(account) {
            return this.channel.call('updateAccount', account);
        }
    };
    exports.UserDataSyncAccountService = UserDataSyncAccountService;
    exports.UserDataSyncAccountService = UserDataSyncAccountService = __decorate([
        __param(0, services_1.ISharedProcessService)
    ], UserDataSyncAccountService);
    (0, extensions_1.registerSingleton)(userDataSyncAccount_1.IUserDataSyncAccountService, UserDataSyncAccountService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFTeW5jQWNjb3VudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdXNlckRhdGFTeW5jL2VsZWN0cm9uLXNhbmRib3gvdXNlckRhdGFTeW5jQWNjb3VudFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBU3pGLElBQU0sMEJBQTBCLEdBQWhDLE1BQU0sMEJBQTJCLFNBQVEsc0JBQVU7UUFPekQsSUFBSSxPQUFPLEtBQXVDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFFekUsSUFBSSxhQUFhLEtBQXFCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQVUsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBSzdGLFlBQ3dCLG9CQUEyQztZQUVsRSxLQUFLLEVBQUUsQ0FBQztZQU5ELHdCQUFtQixHQUE4QyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFvQyxDQUFDLENBQUM7WUFDaEksdUJBQWtCLEdBQTRDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7WUFNckcsSUFBSSxDQUFDLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUN0RSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBbUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3JGLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO2dCQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFtQyxvQkFBb0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNwRyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztvQkFDeEIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDeEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELGFBQWEsQ0FBQyxPQUF5QztZQUN0RCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwRCxDQUFDO0tBRUQsQ0FBQTtJQWhDWSxnRUFBMEI7eUNBQTFCLDBCQUEwQjtRQWVwQyxXQUFBLGdDQUFxQixDQUFBO09BZlgsMEJBQTBCLENBZ0N0QztJQUVELElBQUEsOEJBQWlCLEVBQUMsaURBQTJCLEVBQUUsMEJBQTBCLG9DQUE0QixDQUFDIn0=