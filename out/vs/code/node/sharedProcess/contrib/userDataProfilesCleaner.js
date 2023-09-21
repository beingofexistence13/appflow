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
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, async_1, lifecycle_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataProfilesCleaner = void 0;
    let UserDataProfilesCleaner = class UserDataProfilesCleaner extends lifecycle_1.Disposable {
        constructor(userDataProfilesService) {
            super();
            const scheduler = this._register(new async_1.RunOnceScheduler(() => {
                userDataProfilesService.cleanUp();
            }, 10 * 1000 /* after 10s */));
            scheduler.schedule();
        }
    };
    exports.UserDataProfilesCleaner = UserDataProfilesCleaner;
    exports.UserDataProfilesCleaner = UserDataProfilesCleaner = __decorate([
        __param(0, userDataProfile_1.IUserDataProfilesService)
    ], UserDataProfilesCleaner);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlc0NsZWFuZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9jb2RlL25vZGUvc2hhcmVkUHJvY2Vzcy9jb250cmliL3VzZXJEYXRhUHJvZmlsZXNDbGVhbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQU16RixJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLHNCQUFVO1FBRXRELFlBQzJCLHVCQUFpRDtZQUUzRSxLQUFLLEVBQUUsQ0FBQztZQUVSLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3QkFBZ0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQzFELHVCQUF1QixDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ25DLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDL0IsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RCLENBQUM7S0FDRCxDQUFBO0lBWlksMERBQXVCO3NDQUF2Qix1QkFBdUI7UUFHakMsV0FBQSwwQ0FBd0IsQ0FBQTtPQUhkLHVCQUF1QixDQVluQyJ9