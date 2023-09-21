/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/themables", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, async_1, event_1, lifecycle_1, objects_1, themables_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$I2b = void 0;
    class $I2b extends lifecycle_1.$kc {
        get currentProfile() { return this.b; }
        constructor(currentProfile) {
            super();
            this.a = this.B(new event_1.$fd());
            this.onDidChangeCurrentProfile = this.a.event;
            this.b = currentProfile;
        }
        async updateCurrentProfile(userDataProfile) {
            if ((0, objects_1.$Zm)(this.b, userDataProfile)) {
                return;
            }
            const previous = this.b;
            this.b = userDataProfile;
            const joiners = [];
            this.a.fire({
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
            return `$(${userDataProfile_1.$IJ.id})`;
        }
    }
    exports.$I2b = $I2b;
});
//# sourceMappingURL=userDataProfileService.js.map