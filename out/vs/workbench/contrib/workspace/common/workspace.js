/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MANAGE_TRUST_COMMAND_ID = exports.WorkspaceTrustContext = void 0;
    /**
     * Trust Context Keys
     */
    exports.WorkspaceTrustContext = {
        IsEnabled: new contextkey_1.RawContextKey('isWorkspaceTrustEnabled', false, (0, nls_1.localize)('workspaceTrustEnabledCtx', "Whether the workspace trust feature is enabled.")),
        IsTrusted: new contextkey_1.RawContextKey('isWorkspaceTrusted', false, (0, nls_1.localize)('workspaceTrustedCtx', "Whether the current workspace has been trusted by the user."))
    };
    exports.MANAGE_TRUST_COMMAND_ID = 'workbench.trust.manage';
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd29ya3NwYWNlL2NvbW1vbi93b3Jrc3BhY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHOztPQUVHO0lBRVUsUUFBQSxxQkFBcUIsR0FBRztRQUNwQyxTQUFTLEVBQUUsSUFBSSwwQkFBYSxDQUFVLHlCQUF5QixFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQywwQkFBMEIsRUFBRSxpREFBaUQsQ0FBQyxDQUFDO1FBQ2hLLFNBQVMsRUFBRSxJQUFJLDBCQUFhLENBQVUsb0JBQW9CLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLHFCQUFxQixFQUFFLDZEQUE2RCxDQUFDLENBQUM7S0FDbEssQ0FBQztJQUVXLFFBQUEsdUJBQXVCLEdBQUcsd0JBQXdCLENBQUMifQ==