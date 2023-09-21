/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/storage/common/storageService"], function (require, exports, storageService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeWorkbenchStorageService = void 0;
    class NativeWorkbenchStorageService extends storageService_1.RemoteStorageService {
        constructor(workspace, userDataProfileService, userDataProfilesService, mainProcessService, environmentService) {
            super(workspace, { currentProfile: userDataProfileService.currentProfile, defaultProfile: userDataProfilesService.defaultProfile }, mainProcessService, environmentService);
            this.userDataProfileService = userDataProfileService;
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.userDataProfileService.onDidChangeCurrentProfile(e => e.join(this.switchToProfile(e.profile))));
        }
    }
    exports.NativeWorkbenchStorageService = NativeWorkbenchStorageService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvc3RvcmFnZS9lbGVjdHJvbi1zYW5kYm94L3N0b3JhZ2VTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxNQUFhLDZCQUE4QixTQUFRLHFDQUFvQjtRQUV0RSxZQUNDLFNBQThDLEVBQzdCLHNCQUErQyxFQUNoRSx1QkFBaUQsRUFDakQsa0JBQXVDLEVBQ3ZDLGtCQUF1QztZQUV2QyxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUUsY0FBYyxFQUFFLHNCQUFzQixDQUFDLGNBQWMsRUFBRSxjQUFjLEVBQUUsdUJBQXVCLENBQUMsY0FBYyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUwzSiwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXlCO1lBT2hFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTyxpQkFBaUI7WUFDeEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JILENBQUM7S0FDRDtJQWpCRCxzRUFpQkMifQ==