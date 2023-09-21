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
define(["require", "exports", "vs/platform/userDataSync/common/userDataSync", "vs/platform/ipc/electron-sandbox/services", "vs/base/common/event", "vs/platform/instantiation/common/extensions"], function (require, exports, userDataSync_1, services_1, event_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let UserDataAutoSyncService = class UserDataAutoSyncService {
        get onError() { return event_1.Event.map(this.channel.listen('onError'), e => userDataSync_1.UserDataSyncError.toUserDataSyncError(e)); }
        constructor(sharedProcessService) {
            this.channel = sharedProcessService.getChannel('userDataAutoSync');
        }
        triggerSync(sources, hasToLimitSync, disableCache) {
            return this.channel.call('triggerSync', [sources, hasToLimitSync, disableCache]);
        }
        turnOn() {
            return this.channel.call('turnOn');
        }
        turnOff(everywhere) {
            return this.channel.call('turnOff', [everywhere]);
        }
    };
    UserDataAutoSyncService = __decorate([
        __param(0, services_1.ISharedProcessService)
    ], UserDataAutoSyncService);
    (0, extensions_1.registerSingleton)(userDataSync_1.IUserDataAutoSyncService, UserDataAutoSyncService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFBdXRvU3luY1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdXNlckRhdGFTeW5jL2VsZWN0cm9uLXNhbmRib3gvdXNlckRhdGFBdXRvU3luY1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFRaEcsSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBdUI7UUFLNUIsSUFBSSxPQUFPLEtBQStCLE9BQU8sYUFBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBUSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLGdDQUFpQixDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRW5KLFlBQ3dCLG9CQUEyQztZQUVsRSxJQUFJLENBQUMsT0FBTyxHQUFHLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3BFLENBQUM7UUFFRCxXQUFXLENBQUMsT0FBaUIsRUFBRSxjQUF1QixFQUFFLFlBQXFCO1lBQzVFLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQ2xGLENBQUM7UUFFRCxNQUFNO1lBQ0wsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBRUQsT0FBTyxDQUFDLFVBQW1CO1lBQzFCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNuRCxDQUFDO0tBRUQsQ0FBQTtJQXpCSyx1QkFBdUI7UUFRMUIsV0FBQSxnQ0FBcUIsQ0FBQTtPQVJsQix1QkFBdUIsQ0F5QjVCO0lBRUQsSUFBQSw4QkFBaUIsRUFBQyx1Q0FBd0IsRUFBRSx1QkFBdUIsb0NBQTRCLENBQUMifQ==