/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/types", "vs/nls!vs/workbench/services/userDataProfile/common/userDataProfile", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey", "vs/base/common/uri", "vs/platform/theme/common/iconRegistry", "vs/base/common/codicons"], function (require, exports, types_1, nls_1, actions_1, instantiation_1, contextkey_1, uri_1, iconRegistry_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$UJ = exports.$TJ = exports.$SJ = exports.$RJ = exports.$QJ = exports.$PJ = exports.$OJ = exports.$NJ = exports.$MJ = exports.$LJ = exports.$KJ = exports.$JJ = exports.$IJ = exports.$HJ = exports.$GJ = exports.$FJ = exports.$EJ = exports.$DJ = exports.$CJ = void 0;
    exports.$CJ = (0, instantiation_1.$Bh)('IUserDataProfileService');
    exports.$DJ = (0, instantiation_1.$Bh)('IUserDataProfileManagementService');
    function $EJ(thing) {
        const candidate = thing;
        return !!(candidate && typeof candidate === 'object'
            && ((0, types_1.$qf)(candidate.settings) || typeof candidate.settings === 'string')
            && ((0, types_1.$qf)(candidate.globalState) || typeof candidate.globalState === 'string')
            && ((0, types_1.$qf)(candidate.extensions) || typeof candidate.extensions === 'string'));
    }
    exports.$EJ = $EJ;
    exports.$FJ = 'profile';
    function $GJ(path, productService) {
        return uri_1.URI.from({
            scheme: productService.urlProtocol,
            authority: exports.$FJ,
            path: path.startsWith('/') ? path : `/${path}`
        });
    }
    exports.$GJ = $GJ;
    exports.$HJ = (0, instantiation_1.$Bh)('IUserDataProfileImportExportService');
    exports.$IJ = (0, iconRegistry_1.$9u)('defaultProfile-icon', codicons_1.$Pj.settings, (0, nls_1.localize)(0, null));
    exports.$JJ = new actions_1.$Ru('Profiles');
    exports.$KJ = 'workbench.profiles.actions.manage';
    exports.$LJ = { value: (0, nls_1.localize)(1, null), original: 'Profiles' };
    exports.$MJ = { ...exports.$LJ };
    exports.$NJ = 'code-profile';
    exports.$OJ = [{ name: (0, nls_1.localize)(2, null), extensions: [exports.$NJ] }];
    exports.$PJ = new contextkey_1.$2i('profiles.enabled', true);
    exports.$QJ = new contextkey_1.$2i('currentProfile', '');
    exports.$RJ = new contextkey_1.$2i('isCurrentProfileTransient', false);
    exports.$SJ = new contextkey_1.$2i('hasProfiles', false);
    exports.$TJ = new contextkey_1.$2i('isProfileExportInProgress', false);
    exports.$UJ = new contextkey_1.$2i('isProfileImportInProgress', false);
});
//# sourceMappingURL=userDataProfile.js.map