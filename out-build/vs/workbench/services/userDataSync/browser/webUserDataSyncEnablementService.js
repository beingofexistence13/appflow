/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/services/userDataSync/browser/userDataSyncEnablementService"], function (require, exports, extensions_1, userDataSync_1, userDataSyncEnablementService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$w4b = void 0;
    class $w4b extends userDataSyncEnablementService_1.$v4b {
        constructor() {
            super(...arguments);
            this.r = undefined;
        }
        canToggleEnablement() {
            return this.s() && super.canToggleEnablement();
        }
        isEnabled() {
            if (!this.s()) {
                return false;
            }
            if (this.r === undefined) {
                this.r = this.n.options?.settingsSyncOptions?.enabled;
            }
            if (this.r === undefined) {
                this.r = super.isEnabled();
            }
            return this.r;
        }
        setEnablement(enabled) {
            if (enabled && !this.canToggleEnablement()) {
                return;
            }
            if (this.r !== enabled) {
                this.r = enabled;
                super.setEnablement(enabled);
            }
        }
        getResourceSyncStateVersion(resource) {
            return resource === "extensions" /* SyncResource.Extensions */ ? this.n.options?.settingsSyncOptions?.extensionsSyncStateVersion : undefined;
        }
        s() {
            return !!this.n.options?.workspaceProvider?.trusted;
        }
    }
    exports.$w4b = $w4b;
    (0, extensions_1.$mr)(userDataSync_1.$Pgb, $w4b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=webUserDataSyncEnablementService.js.map