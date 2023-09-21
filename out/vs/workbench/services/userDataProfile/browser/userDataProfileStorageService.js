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
define(["require", "exports", "vs/base/common/event", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log", "vs/platform/userDataProfile/common/userDataProfileStorageService", "vs/platform/storage/common/storage", "vs/workbench/services/storage/browser/storageService", "vs/workbench/services/userDataProfile/common/userDataProfile", "vs/base/common/lifecycle"], function (require, exports, event_1, extensions_1, log_1, userDataProfileStorageService_1, storage_1, storageService_1, userDataProfile_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataProfileStorageService = void 0;
    let UserDataProfileStorageService = class UserDataProfileStorageService extends userDataProfileStorageService_1.AbstractUserDataProfileStorageService {
        constructor(storageService, userDataProfileService, logService) {
            super(storageService);
            this.userDataProfileService = userDataProfileService;
            this.logService = logService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            const disposables = this._register(new lifecycle_1.DisposableStore());
            this._register(event_1.Event.filter(storageService.onDidChangeTarget, e => e.scope === 0 /* StorageScope.PROFILE */, disposables)(() => this.onDidChangeStorageTargetInCurrentProfile()));
            this._register(storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, undefined, disposables)(e => this.onDidChangeStorageValueInCurrentProfile(e)));
        }
        onDidChangeStorageTargetInCurrentProfile() {
            // Not broadcasting changes to other windows/tabs as it is not required in web.
            // Revisit if needed in future.
            this._onDidChange.fire({ targetChanges: [this.userDataProfileService.currentProfile], valueChanges: [] });
        }
        onDidChangeStorageValueInCurrentProfile(e) {
            // Not broadcasting changes to other windows/tabs as it is not required in web
            // Revisit if needed in future.
            this._onDidChange.fire({ targetChanges: [], valueChanges: [{ profile: this.userDataProfileService.currentProfile, changes: [e] }] });
        }
        createStorageDatabase(profile) {
            return (0, storage_1.isProfileUsingDefaultStorage)(profile) ? storageService_1.IndexedDBStorageDatabase.createApplicationStorage(this.logService) : storageService_1.IndexedDBStorageDatabase.createProfileStorage(profile, this.logService);
        }
    };
    exports.UserDataProfileStorageService = UserDataProfileStorageService;
    exports.UserDataProfileStorageService = UserDataProfileStorageService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, userDataProfile_1.IUserDataProfileService),
        __param(2, log_1.ILogService)
    ], UserDataProfileStorageService);
    (0, extensions_1.registerSingleton)(userDataProfileStorageService_1.IUserDataProfileStorageService, UserDataProfileStorageService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlU3RvcmFnZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdXNlckRhdGFQcm9maWxlL2Jyb3dzZXIvdXNlckRhdGFQcm9maWxlU3RvcmFnZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBYXpGLElBQU0sNkJBQTZCLEdBQW5DLE1BQU0sNkJBQThCLFNBQVEscUVBQXFDO1FBS3ZGLFlBQ2tCLGNBQStCLEVBQ3ZCLHNCQUFnRSxFQUM1RSxVQUF3QztZQUVyRCxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7WUFIb0IsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQUMzRCxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBTnJDLGlCQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBMEIsQ0FBQyxDQUFDO1lBQzdFLGdCQUFXLEdBQWtDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBUTdFLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssaUNBQXlCLEVBQUUsV0FBVyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzFLLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLGdCQUFnQiwrQkFBdUIsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNySixDQUFDO1FBRU8sd0NBQXdDO1lBQy9DLCtFQUErRTtZQUMvRSwrQkFBK0I7WUFDL0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsY0FBYyxDQUFDLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0csQ0FBQztRQUVPLHVDQUF1QyxDQUFDLENBQWtDO1lBQ2pGLDhFQUE4RTtZQUM5RSwrQkFBK0I7WUFDL0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0SSxDQUFDO1FBRVMscUJBQXFCLENBQUMsT0FBeUI7WUFDeEQsT0FBTyxJQUFBLHNDQUE0QixFQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyx5Q0FBd0IsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLHlDQUF3QixDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0wsQ0FBQztLQUNELENBQUE7SUEvQlksc0VBQTZCOzRDQUE3Qiw2QkFBNkI7UUFNdkMsV0FBQSx5QkFBZSxDQUFBO1FBQ2YsV0FBQSx5Q0FBdUIsQ0FBQTtRQUN2QixXQUFBLGlCQUFXLENBQUE7T0FSRCw2QkFBNkIsQ0ErQnpDO0lBRUQsSUFBQSw4QkFBaUIsRUFBQyw4REFBOEIsRUFBRSw2QkFBNkIsb0NBQTRCLENBQUMifQ==