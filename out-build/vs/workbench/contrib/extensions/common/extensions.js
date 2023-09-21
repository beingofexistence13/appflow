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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/contextkey/common/contextkey"], function (require, exports, instantiation_1, lifecycle_1, extensionManagementUtil_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5fb = exports.$4fb = exports.$3fb = exports.$2fb = exports.$1fb = exports.$Zfb = exports.$Yfb = exports.$Xfb = exports.$Wfb = exports.$Vfb = exports.$Ufb = exports.$Tfb = exports.$Sfb = exports.$Rfb = exports.$Qfb = exports.ExtensionEditorTab = exports.$Pfb = exports.ExtensionState = exports.$Ofb = void 0;
    exports.$Ofb = 'workbench.view.extensions';
    var ExtensionState;
    (function (ExtensionState) {
        ExtensionState[ExtensionState["Installing"] = 0] = "Installing";
        ExtensionState[ExtensionState["Installed"] = 1] = "Installed";
        ExtensionState[ExtensionState["Uninstalling"] = 2] = "Uninstalling";
        ExtensionState[ExtensionState["Uninstalled"] = 3] = "Uninstalled";
    })(ExtensionState || (exports.ExtensionState = ExtensionState = {}));
    exports.$Pfb = (0, instantiation_1.$Bh)('extensionsWorkbenchService');
    var ExtensionEditorTab;
    (function (ExtensionEditorTab) {
        ExtensionEditorTab["Readme"] = "readme";
        ExtensionEditorTab["Contributions"] = "contributions";
        ExtensionEditorTab["Changelog"] = "changelog";
        ExtensionEditorTab["Dependencies"] = "dependencies";
        ExtensionEditorTab["ExtensionPack"] = "extensionPack";
        ExtensionEditorTab["RuntimeStatus"] = "runtimeStatus";
    })(ExtensionEditorTab || (exports.ExtensionEditorTab = ExtensionEditorTab = {}));
    exports.$Qfb = 'extensions';
    exports.$Rfb = 'extensions.autoUpdate';
    exports.$Sfb = 'extensions.autoCheckUpdates';
    exports.$Tfb = 'extensions.closeExtensionDetailsOnViewChange';
    let $Ufb = class $Ufb extends lifecycle_1.$kc {
        constructor(a, extensionsWorkbenchService) {
            super();
            this.a = a;
            this.B(extensionsWorkbenchService.onChange(this.b, this));
        }
        set extension(extension) {
            this.a.forEach(c => c.extension = extension);
        }
        b(extension) {
            for (const container of this.a) {
                if (extension && container.extension) {
                    if ((0, extensionManagementUtil_1.$po)(container.extension.identifier, extension.identifier)) {
                        if (container.extension.server && extension.server && container.extension.server !== extension.server) {
                            if (container.updateWhenCounterExtensionChanges) {
                                container.update();
                            }
                        }
                        else {
                            container.extension = extension;
                        }
                    }
                }
                else {
                    container.update();
                }
            }
        }
    };
    exports.$Ufb = $Ufb;
    exports.$Ufb = $Ufb = __decorate([
        __param(1, exports.$Pfb)
    ], $Ufb);
    exports.$Vfb = 'workbench.views.extensions.workspaceRecommendations';
    exports.$Wfb = 'workbench.views.extensions.searchOutdated';
    exports.$Xfb = 'workbench.extensions.action.toggleIgnoreExtension';
    exports.$Yfb = 'workbench.extensions.action.installVSIX';
    exports.$Zfb = 'workbench.extensions.command.installFromVSIX';
    exports.$1fb = 'workbench.extensions.action.listWorkspaceUnsupportedExtensions';
    // Context Keys
    exports.$2fb = new contextkey_1.$2i('hasOutdatedExtensions', false);
    exports.$3fb = new contextkey_1.$2i('hasGallery', false);
    // Context Menu Groups
    exports.$4fb = '_theme_';
    exports.$5fb = '0_install';
});
//# sourceMappingURL=extensions.js.map