/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataSyncEnablementService"], function (require, exports, extensions_1, userDataSync_1, userDataSyncEnablementService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$v4b = void 0;
    class $v4b extends userDataSyncEnablementService_1.$u4b {
        get n() { return this.g; }
        getResourceSyncStateVersion(resource) {
            return resource === "extensions" /* SyncResource.Extensions */ ? this.n.options?.settingsSyncOptions?.extensionsSyncStateVersion : undefined;
        }
    }
    exports.$v4b = $v4b;
    (0, extensions_1.$mr)(userDataSync_1.$Pgb, $v4b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=userDataSyncEnablementService.js.map