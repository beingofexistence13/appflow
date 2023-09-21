/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/extensionManagement/common/extensionManagement", "vs/base/common/network"], function (require, exports, instantiation_1, extensionManagement_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jcb = exports.$icb = exports.EnablementState = exports.$hcb = exports.$gcb = exports.$fcb = exports.ExtensionInstallLocation = exports.$ecb = void 0;
    exports.$ecb = (0, instantiation_1.$Ch)(extensionManagement_1.$2n);
    var ExtensionInstallLocation;
    (function (ExtensionInstallLocation) {
        ExtensionInstallLocation[ExtensionInstallLocation["Local"] = 1] = "Local";
        ExtensionInstallLocation[ExtensionInstallLocation["Remote"] = 2] = "Remote";
        ExtensionInstallLocation[ExtensionInstallLocation["Web"] = 3] = "Web";
    })(ExtensionInstallLocation || (exports.ExtensionInstallLocation = ExtensionInstallLocation = {}));
    exports.$fcb = (0, instantiation_1.$Bh)('extensionManagementServerService');
    exports.$gcb = network_1.$2f.asBrowserUri('vs/workbench/services/extensionManagement/common/media/defaultIcon.png').toString(true);
    exports.$hcb = (0, instantiation_1.$Ch)(exports.$ecb);
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
    exports.$icb = (0, instantiation_1.$Bh)('extensionEnablementService');
    exports.$jcb = (0, instantiation_1.$Bh)('IWebExtensionsScannerService');
});
//# sourceMappingURL=extensionManagement.js.map