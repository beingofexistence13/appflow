/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/extensionManagement/common/extensionManagement", "vs/base/common/network"], function (require, exports, instantiation_1, extensionManagement_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IWebExtensionsScannerService = exports.IWorkbenchExtensionEnablementService = exports.EnablementState = exports.IWorkbenchExtensionManagementService = exports.DefaultIconPath = exports.IExtensionManagementServerService = exports.ExtensionInstallLocation = exports.IProfileAwareExtensionManagementService = void 0;
    exports.IProfileAwareExtensionManagementService = (0, instantiation_1.refineServiceDecorator)(extensionManagement_1.IExtensionManagementService);
    var ExtensionInstallLocation;
    (function (ExtensionInstallLocation) {
        ExtensionInstallLocation[ExtensionInstallLocation["Local"] = 1] = "Local";
        ExtensionInstallLocation[ExtensionInstallLocation["Remote"] = 2] = "Remote";
        ExtensionInstallLocation[ExtensionInstallLocation["Web"] = 3] = "Web";
    })(ExtensionInstallLocation || (exports.ExtensionInstallLocation = ExtensionInstallLocation = {}));
    exports.IExtensionManagementServerService = (0, instantiation_1.createDecorator)('extensionManagementServerService');
    exports.DefaultIconPath = network_1.FileAccess.asBrowserUri('vs/workbench/services/extensionManagement/common/media/defaultIcon.png').toString(true);
    exports.IWorkbenchExtensionManagementService = (0, instantiation_1.refineServiceDecorator)(exports.IProfileAwareExtensionManagementService);
    var EnablementState;
    (function (EnablementState) {
        EnablementState[EnablementState["DisabledByTrustRequirement"] = 0] = "DisabledByTrustRequirement";
        EnablementState[EnablementState["DisabledByExtensionKind"] = 1] = "DisabledByExtensionKind";
        EnablementState[EnablementState["DisabledByEnvironment"] = 2] = "DisabledByEnvironment";
        EnablementState[EnablementState["EnabledByEnvironment"] = 3] = "EnabledByEnvironment";
        EnablementState[EnablementState["DisabledByVirtualWorkspace"] = 4] = "DisabledByVirtualWorkspace";
        EnablementState[EnablementState["DisabledByExtensionDependency"] = 5] = "DisabledByExtensionDependency";
        EnablementState[EnablementState["DisabledGlobally"] = 6] = "DisabledGlobally";
        EnablementState[EnablementState["DisabledWorkspace"] = 7] = "DisabledWorkspace";
        EnablementState[EnablementState["EnabledGlobally"] = 8] = "EnabledGlobally";
        EnablementState[EnablementState["EnabledWorkspace"] = 9] = "EnabledWorkspace";
    })(EnablementState || (exports.EnablementState = EnablementState = {}));
    exports.IWorkbenchExtensionEnablementService = (0, instantiation_1.createDecorator)('extensionEnablementService');
    exports.IWebExtensionsScannerService = (0, instantiation_1.createDecorator)('IWebExtensionsScannerService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uTWFuYWdlbWVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9leHRlbnNpb25NYW5hZ2VtZW50L2NvbW1vbi9leHRlbnNpb25NYW5hZ2VtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVduRixRQUFBLHVDQUF1QyxHQUFHLElBQUEsc0NBQXNCLEVBQXVFLGlEQUEyQixDQUFDLENBQUM7SUFXakwsSUFBa0Isd0JBSWpCO0lBSkQsV0FBa0Isd0JBQXdCO1FBQ3pDLHlFQUFTLENBQUE7UUFDVCwyRUFBTSxDQUFBO1FBQ04scUVBQUcsQ0FBQTtJQUNKLENBQUMsRUFKaUIsd0JBQXdCLHdDQUF4Qix3QkFBd0IsUUFJekM7SUFFWSxRQUFBLGlDQUFpQyxHQUFHLElBQUEsK0JBQWUsRUFBb0Msa0NBQWtDLENBQUMsQ0FBQztJQVUzSCxRQUFBLGVBQWUsR0FBRyxvQkFBVSxDQUFDLFlBQVksQ0FBQyx3RUFBd0UsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQU9uSSxRQUFBLG9DQUFvQyxHQUFHLElBQUEsc0NBQXNCLEVBQWdGLCtDQUF1QyxDQUFDLENBQUM7SUFlbk0sSUFBa0IsZUFXakI7SUFYRCxXQUFrQixlQUFlO1FBQ2hDLGlHQUEwQixDQUFBO1FBQzFCLDJGQUF1QixDQUFBO1FBQ3ZCLHVGQUFxQixDQUFBO1FBQ3JCLHFGQUFvQixDQUFBO1FBQ3BCLGlHQUEwQixDQUFBO1FBQzFCLHVHQUE2QixDQUFBO1FBQzdCLDZFQUFnQixDQUFBO1FBQ2hCLCtFQUFpQixDQUFBO1FBQ2pCLDJFQUFlLENBQUE7UUFDZiw2RUFBZ0IsQ0FBQTtJQUNqQixDQUFDLEVBWGlCLGVBQWUsK0JBQWYsZUFBZSxRQVdoQztJQUVZLFFBQUEsb0NBQW9DLEdBQUcsSUFBQSwrQkFBZSxFQUF1Qyw0QkFBNEIsQ0FBQyxDQUFDO0lBOEUzSCxRQUFBLDRCQUE0QixHQUFHLElBQUEsK0JBQWUsRUFBK0IsOEJBQThCLENBQUMsQ0FBQyJ9