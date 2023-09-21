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
define(["require", "exports", "vs/base/common/uri", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/state/node/state", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile", "vs/base/common/types", "vs/platform/state/node/stateService"], function (require, exports, uri_1, environment_1, files_1, log_1, state_1, uriIdentity_1, userDataProfile_1, types_1, stateService_1) {
    "use strict";
    var $iN_1, $jN_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$kN = exports.$jN = exports.$iN = void 0;
    let $iN = class $iN extends userDataProfile_1.$Hk {
        static { $iN_1 = this; }
        static { this.a = 'profileAssociationsMigration'; }
        constructor(U, uriIdentityService, W, fileService, logService) {
            super(W, fileService, uriIdentityService, logService);
            this.U = U;
            this.W = W;
        }
        O() {
            const storedProfilesState = this.U.getItem($iN_1.b, []);
            return storedProfilesState.map(p => ({ ...p, location: (0, types_1.$jf)(p.location) ? this.w.extUri.joinPath(this.profilesHome, p.location) : uri_1.URI.revive(p.location) }));
        }
        Q() {
            const associations = this.U.getItem($iN_1.c, {});
            const migrated = this.U.getItem($iN_1.a, false);
            return migrated ? associations : this.N(associations);
        }
        S() {
            return this.w.extUri.joinPath(uri_1.URI.file(this.W.extensionsPath).with({ scheme: this.profilesHome.scheme }), 'extensions.json');
        }
    };
    exports.$iN = $iN;
    exports.$iN = $iN = $iN_1 = __decorate([
        __param(0, state_1.$dN),
        __param(1, uriIdentity_1.$Ck),
        __param(2, environment_1.$Jh),
        __param(3, files_1.$6j),
        __param(4, log_1.$5i)
    ], $iN);
    let $jN = $jN_1 = class $jN extends $iN {
        constructor($, uriIdentityService, environmentService, fileService, logService) {
            super($, uriIdentityService, environmentService, fileService, logService);
            this.$ = $;
        }
        P(storedProfiles) {
            if (storedProfiles.length) {
                this.$.setItem($jN_1.b, storedProfiles.map(profile => ({ ...profile, location: this.w.extUri.basename(profile.location) })));
            }
            else {
                this.$.removeItem($jN_1.b);
            }
        }
        O() {
            const storedProfiles = super.O();
            if (!this.$.getItem('userDataProfilesMigration', false)) {
                this.P(storedProfiles);
                this.$.setItem('userDataProfilesMigration', true);
            }
            return storedProfiles;
        }
        R(storedProfileAssociations) {
            if (storedProfileAssociations.emptyWindows || storedProfileAssociations.workspaces) {
                this.$.setItem($jN_1.c, storedProfileAssociations);
            }
            else {
                this.$.removeItem($jN_1.c);
            }
        }
        Q() {
            const oldKey = 'workspaceAndProfileInfo';
            const storedWorkspaceInfos = this.$.getItem(oldKey, undefined);
            if (storedWorkspaceInfos) {
                this.$.removeItem(oldKey);
                const workspaces = storedWorkspaceInfos.reduce((result, { workspace, profile }) => {
                    result[uri_1.URI.revive(workspace).toString()] = uri_1.URI.revive(profile).toString();
                    return result;
                }, {});
                this.$.setItem($jN_1.c, { workspaces });
            }
            const associations = super.Q();
            if (!this.$.getItem($jN_1.a, false)) {
                this.R(associations);
                this.$.setItem($jN_1.a, true);
            }
            return associations;
        }
    };
    exports.$jN = $jN;
    exports.$jN = $jN = $jN_1 = __decorate([
        __param(0, state_1.$eN),
        __param(1, uriIdentity_1.$Ck),
        __param(2, environment_1.$Jh),
        __param(3, files_1.$6j),
        __param(4, log_1.$5i)
    ], $jN);
    let $kN = class $kN extends $jN {
        constructor(uriIdentityService, environmentService, fileService, logService) {
            super(new stateService_1.$hN(0 /* SaveStrategy.IMMEDIATE */, environmentService, logService, fileService), uriIdentityService, environmentService, fileService, logService);
        }
        async init() {
            await this.$.init();
            return super.init();
        }
    };
    exports.$kN = $kN;
    exports.$kN = $kN = __decorate([
        __param(0, uriIdentity_1.$Ck),
        __param(1, environment_1.$Jh),
        __param(2, files_1.$6j),
        __param(3, log_1.$5i)
    ], $kN);
});
//# sourceMappingURL=userDataProfile.js.map