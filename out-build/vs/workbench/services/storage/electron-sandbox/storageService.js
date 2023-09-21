/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/storage/common/storageService"], function (require, exports, storageService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6$b = void 0;
    class $6$b extends storageService_1.$l8b {
        constructor(workspace, nb, userDataProfilesService, mainProcessService, environmentService) {
            super(workspace, { currentProfile: nb.currentProfile, defaultProfile: userDataProfilesService.defaultProfile }, mainProcessService, environmentService);
            this.nb = nb;
            this.ob();
        }
        ob() {
            this.B(this.nb.onDidChangeCurrentProfile(e => e.join(this.R(e.profile))));
        }
    }
    exports.$6$b = $6$b;
});
//# sourceMappingURL=storageService.js.map