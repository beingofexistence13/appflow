/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/themables", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, async_1, event_1, lifecycle_1, objects_1, themables_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataProfileService = void 0;
    class UserDataProfileService extends lifecycle_1.Disposable {
        get currentProfile() { return this._currentProfile; }
        constructor(currentProfile) {
            super();
            this._onDidChangeCurrentProfile = this._register(new event_1.Emitter());
            this.onDidChangeCurrentProfile = this._onDidChangeCurrentProfile.event;
            this._currentProfile = currentProfile;
        }
        async updateCurrentProfile(userDataProfile) {
            if ((0, objects_1.equals)(this._currentProfile, userDataProfile)) {
                return;
            }
            const previous = this._currentProfile;
            this._currentProfile = userDataProfile;
            const joiners = [];
            this._onDidChangeCurrentProfile.fire({
                previous,
                profile: userDataProfile,
                join(promise) {
                    joiners.push(promise);
                }
            });
            await async_1.Promises.settled(joiners);
        }
        getShortName(profile) {
            if (!profile.isDefault && profile.shortName && themables_1.ThemeIcon.fromId(profile.shortName)) {
                return profile.shortName;
            }
            return `$(${userDataProfile_1.defaultUserDataProfileIcon.id})`;
        }
    }
    exports.UserDataProfileService = UserDataProfileService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckRhdGFQcm9maWxlU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91c2VyRGF0YVByb2ZpbGUvY29tbW9uL3VzZXJEYXRhUHJvZmlsZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQWEsc0JBQXVCLFNBQVEsc0JBQVU7UUFRckQsSUFBSSxjQUFjLEtBQXVCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFFdkUsWUFDQyxjQUFnQztZQUVoQyxLQUFLLEVBQUUsQ0FBQztZQVRRLCtCQUEwQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWlDLENBQUMsQ0FBQztZQUNsRyw4QkFBeUIsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsS0FBSyxDQUFDO1lBUzFFLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxLQUFLLENBQUMsb0JBQW9CLENBQUMsZUFBaUM7WUFDM0QsSUFBSSxJQUFBLGdCQUFNLEVBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsRUFBRTtnQkFDbEQsT0FBTzthQUNQO1lBQ0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUN0QyxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztZQUN2QyxNQUFNLE9BQU8sR0FBb0IsRUFBRSxDQUFDO1lBQ3BDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUM7Z0JBQ3BDLFFBQVE7Z0JBQ1IsT0FBTyxFQUFFLGVBQWU7Z0JBQ3hCLElBQUksQ0FBQyxPQUFPO29CQUNYLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZCLENBQUM7YUFDRCxDQUFDLENBQUM7WUFDSCxNQUFNLGdCQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFRCxZQUFZLENBQUMsT0FBeUI7WUFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLElBQUksT0FBTyxDQUFDLFNBQVMsSUFBSSxxQkFBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ25GLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQzthQUN6QjtZQUNELE9BQU8sS0FBSyw0Q0FBMEIsQ0FBQyxFQUFFLEdBQUcsQ0FBQztRQUM5QyxDQUFDO0tBRUQ7SUF6Q0Qsd0RBeUNDIn0=