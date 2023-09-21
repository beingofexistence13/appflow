/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/log/common/log", "vs/platform/uriIdentity/common/uriIdentityService", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/contrib/debug/test/common/mockDebug", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, log_1, uriIdentityService_1, debugModel_1, mockDebug_1, workbenchTestServices_1, workbenchTestServices_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ufc = exports.$tfc = void 0;
    const fileService = new workbenchTestServices_1.$Fec();
    exports.$tfc = new uriIdentityService_1.$pr(fileService);
    function $ufc(disposable) {
        const storage = disposable.add(new workbenchTestServices_2.$7dc());
        const debugStorage = disposable.add(new mockDebug_1.$sfc(storage));
        return disposable.add(new debugModel_1.$YFb(debugStorage, { isDirty: (e) => false }, exports.$tfc, new log_1.$fj()));
    }
    exports.$ufc = $ufc;
});
//# sourceMappingURL=mockDebugModel.js.map