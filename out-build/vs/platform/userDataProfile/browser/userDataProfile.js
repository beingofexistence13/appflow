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
define(["require", "exports", "vs/base/browser/broadcast", "vs/base/common/marshalling", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, broadcast_1, marshalling_1, environment_1, files_1, log_1, uriIdentity_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$J2b = void 0;
    let $J2b = class $J2b extends userDataProfile_1.$Hk {
        constructor(environmentService, fileService, uriIdentityService, logService) {
            super(environmentService, fileService, uriIdentityService, logService);
            this.U = this.B(new broadcast_1.$UN(`${userDataProfile_1.$Hk.b}.changes`));
            this.B(this.U.onDidReceiveData(changes => {
                try {
                    this.z = undefined;
                    const added = changes.added.map(p => (0, userDataProfile_1.$Fk)(p, this.profilesHome.scheme));
                    const removed = changes.removed.map(p => (0, userDataProfile_1.$Fk)(p, this.profilesHome.scheme));
                    const updated = changes.updated.map(p => (0, userDataProfile_1.$Fk)(p, this.profilesHome.scheme));
                    this.W(added.filter(a => a.isTransient), removed.filter(a => a.isTransient), updated.filter(a => a.isTransient));
                    this.h.fire({
                        added,
                        removed,
                        updated,
                        all: this.profiles
                    });
                }
                catch (error) { /* ignore */ }
            }));
        }
        W(added, removed, updated) {
            if (added.length) {
                this.s.profiles.push(...added);
            }
            if (removed.length || updated.length) {
                const allTransientProfiles = this.s.profiles;
                this.s.profiles = [];
                for (const profile of allTransientProfiles) {
                    if (removed.some(p => profile.id === p.id)) {
                        continue;
                    }
                    this.s.profiles.push(updated.find(p => profile.id === p.id) ?? profile);
                }
            }
        }
        O() {
            try {
                const value = window.localStorage.getItem(userDataProfile_1.$Hk.b);
                if (value) {
                    return (0, marshalling_1.$$g)(JSON.parse(value));
                }
            }
            catch (error) {
                /* ignore */
                this.y.error(error);
            }
            return [];
        }
        J(added, removed, updated) {
            super.J(added, removed, updated);
            this.U.postData({ added, removed, updated });
        }
        P(storedProfiles) {
            window.localStorage.setItem(userDataProfile_1.$Hk.b, JSON.stringify(storedProfiles));
        }
        Q() {
            const migrateKey = 'profileAssociationsMigration';
            try {
                const value = window.localStorage.getItem(userDataProfile_1.$Hk.c);
                if (value) {
                    let associations = JSON.parse(value);
                    if (!window.localStorage.getItem(migrateKey)) {
                        associations = this.N(associations);
                        this.R(associations);
                        window.localStorage.setItem(migrateKey, 'true');
                    }
                    return associations;
                }
            }
            catch (error) {
                /* ignore */
                this.y.error(error);
            }
            return {};
        }
        R(storedProfileAssociations) {
            window.localStorage.setItem(userDataProfile_1.$Hk.c, JSON.stringify(storedProfileAssociations));
        }
    };
    exports.$J2b = $J2b;
    exports.$J2b = $J2b = __decorate([
        __param(0, environment_1.$Ih),
        __param(1, files_1.$6j),
        __param(2, uriIdentity_1.$Ck),
        __param(3, log_1.$5i)
    ], $J2b);
});
//# sourceMappingURL=userDataProfile.js.map