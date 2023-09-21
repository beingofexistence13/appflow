/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/codicons", "vs/nls!vs/workbench/contrib/editSessions/common/editSessions", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/iconRegistry", "vs/base/common/hash"], function (require, exports, buffer_1, codicons_1, nls_1, contextkey_1, instantiation_1, iconRegistry_1, hash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$Zb = exports.$0Zb = exports.$9Zb = exports.$8Zb = exports.$7Zb = exports.$6Zb = exports.$5Zb = exports.$4Zb = exports.$3Zb = exports.$2Zb = exports.$1Zb = exports.$ZZb = exports.$YZb = exports.$XZb = exports.$WZb = exports.FileType = exports.ChangeType = exports.$VZb = exports.$UZb = exports.$TZb = void 0;
    exports.$TZb = {
        original: 'Cloud Changes',
        value: (0, nls_1.localize)(0, null)
    };
    exports.$UZb = (0, instantiation_1.$Bh)('IEditSessionsStorageService');
    exports.$VZb = (0, instantiation_1.$Bh)('IEditSessionsLogService');
    var ChangeType;
    (function (ChangeType) {
        ChangeType[ChangeType["Addition"] = 1] = "Addition";
        ChangeType[ChangeType["Deletion"] = 2] = "Deletion";
    })(ChangeType || (exports.ChangeType = ChangeType = {}));
    var FileType;
    (function (FileType) {
        FileType[FileType["File"] = 1] = "File";
    })(FileType || (exports.FileType = FileType = {}));
    exports.$WZb = 3;
    exports.$XZb = 'editSessionsSignedIn';
    exports.$YZb = new contextkey_1.$2i(exports.$XZb, false);
    exports.$ZZb = 'editSessionsPending';
    exports.$1Zb = new contextkey_1.$2i(exports.$ZZb, false);
    exports.$2Zb = 'workbench.view.editSessions';
    exports.$3Zb = 'workbench.views.editSessions.data';
    exports.$4Zb = 'Cloud Changes';
    exports.$5Zb = (0, nls_1.localize)(1, null);
    exports.$6Zb = (0, iconRegistry_1.$9u)('edit-sessions-view-icon', codicons_1.$Pj.cloudDownload, (0, nls_1.localize)(2, null));
    exports.$7Zb = new contextkey_1.$2i('editSessionsShowView', false);
    exports.$8Zb = 'vscode-edit-sessions';
    function $9Zb(version, content) {
        switch (version) {
            case 1:
                return buffer_1.$Fd.fromString(content);
            case 2:
                return (0, buffer_1.$Yd)(content);
            default:
                throw new Error('Upgrade to a newer version to decode this content.');
        }
    }
    exports.$9Zb = $9Zb;
    function $0Zb(editSessionId) {
        const sha1 = new hash_1.$vi();
        sha1.update(editSessionId);
        return sha1.digest();
    }
    exports.$0Zb = $0Zb;
    exports.$$Zb = 'editSessions';
});
//# sourceMappingURL=editSessions.js.map