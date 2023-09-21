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
define(["require", "exports", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/userDataProfile/node/userDataProfile", "vs/platform/state/node/state"], function (require, exports, environment_1, files_1, instantiation_1, log_1, uriIdentity_1, userDataProfile_1, userDataProfile_2, state_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$w5b = exports.$v5b = void 0;
    exports.$v5b = (0, instantiation_1.$Ch)(userDataProfile_1.$Ek);
    let $w5b = class $w5b extends userDataProfile_2.$jN {
        constructor(stateService, uriIdentityService, environmentService, fileService, logService) {
            super(stateService, uriIdentityService, environmentService, fileService, logService);
        }
        getAssociatedEmptyWindows() {
            const emptyWindows = [];
            for (const id of this.C.emptyWindows.keys()) {
                emptyWindows.push({ id });
            }
            return emptyWindows;
        }
    };
    exports.$w5b = $w5b;
    exports.$w5b = $w5b = __decorate([
        __param(0, state_1.$eN),
        __param(1, uriIdentity_1.$Ck),
        __param(2, environment_1.$Jh),
        __param(3, files_1.$6j),
        __param(4, log_1.$5i)
    ], $w5b);
});
//# sourceMappingURL=userDataProfile.js.map