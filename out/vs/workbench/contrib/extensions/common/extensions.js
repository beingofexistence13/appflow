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
    exports.INSTALL_ACTIONS_GROUP = exports.THEME_ACTIONS_GROUP = exports.CONTEXT_HAS_GALLERY = exports.HasOutdatedExtensionsContext = exports.LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID = exports.INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID = exports.SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID = exports.TOGGLE_IGNORE_EXTENSION_ACTION_ID = exports.OUTDATED_EXTENSIONS_VIEW_ID = exports.WORKSPACE_RECOMMENDATIONS_VIEW_ID = exports.ExtensionContainers = exports.CloseExtensionDetailsOnViewChangeKey = exports.AutoCheckUpdatesConfigurationKey = exports.AutoUpdateConfigurationKey = exports.ConfigurationKey = exports.ExtensionEditorTab = exports.IExtensionsWorkbenchService = exports.ExtensionState = exports.VIEWLET_ID = void 0;
    exports.VIEWLET_ID = 'workbench.view.extensions';
    var ExtensionState;
    (function (ExtensionState) {
        ExtensionState[ExtensionState["Installing"] = 0] = "Installing";
        ExtensionState[ExtensionState["Installed"] = 1] = "Installed";
        ExtensionState[ExtensionState["Uninstalling"] = 2] = "Uninstalling";
        ExtensionState[ExtensionState["Uninstalled"] = 3] = "Uninstalled";
    })(ExtensionState || (exports.ExtensionState = ExtensionState = {}));
    exports.IExtensionsWorkbenchService = (0, instantiation_1.createDecorator)('extensionsWorkbenchService');
    var ExtensionEditorTab;
    (function (ExtensionEditorTab) {
        ExtensionEditorTab["Readme"] = "readme";
        ExtensionEditorTab["Contributions"] = "contributions";
        ExtensionEditorTab["Changelog"] = "changelog";
        ExtensionEditorTab["Dependencies"] = "dependencies";
        ExtensionEditorTab["ExtensionPack"] = "extensionPack";
        ExtensionEditorTab["RuntimeStatus"] = "runtimeStatus";
    })(ExtensionEditorTab || (exports.ExtensionEditorTab = ExtensionEditorTab = {}));
    exports.ConfigurationKey = 'extensions';
    exports.AutoUpdateConfigurationKey = 'extensions.autoUpdate';
    exports.AutoCheckUpdatesConfigurationKey = 'extensions.autoCheckUpdates';
    exports.CloseExtensionDetailsOnViewChangeKey = 'extensions.closeExtensionDetailsOnViewChange';
    let ExtensionContainers = class ExtensionContainers extends lifecycle_1.Disposable {
        constructor(containers, extensionsWorkbenchService) {
            super();
            this.containers = containers;
            this._register(extensionsWorkbenchService.onChange(this.update, this));
        }
        set extension(extension) {
            this.containers.forEach(c => c.extension = extension);
        }
        update(extension) {
            for (const container of this.containers) {
                if (extension && container.extension) {
                    if ((0, extensionManagementUtil_1.areSameExtensions)(container.extension.identifier, extension.identifier)) {
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
    exports.ExtensionContainers = ExtensionContainers;
    exports.ExtensionContainers = ExtensionContainers = __decorate([
        __param(1, exports.IExtensionsWorkbenchService)
    ], ExtensionContainers);
    exports.WORKSPACE_RECOMMENDATIONS_VIEW_ID = 'workbench.views.extensions.workspaceRecommendations';
    exports.OUTDATED_EXTENSIONS_VIEW_ID = 'workbench.views.extensions.searchOutdated';
    exports.TOGGLE_IGNORE_EXTENSION_ACTION_ID = 'workbench.extensions.action.toggleIgnoreExtension';
    exports.SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID = 'workbench.extensions.action.installVSIX';
    exports.INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID = 'workbench.extensions.command.installFromVSIX';
    exports.LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID = 'workbench.extensions.action.listWorkspaceUnsupportedExtensions';
    // Context Keys
    exports.HasOutdatedExtensionsContext = new contextkey_1.RawContextKey('hasOutdatedExtensions', false);
    exports.CONTEXT_HAS_GALLERY = new contextkey_1.RawContextKey('hasGallery', false);
    // Context Menu Groups
    exports.THEME_ACTIONS_GROUP = '_theme_';
    exports.INSTALL_ACTIONS_GROUP = '0_install';
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2V4dGVuc2lvbnMvY29tbW9uL2V4dGVuc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBa0JuRixRQUFBLFVBQVUsR0FBRywyQkFBMkIsQ0FBQztJQVl0RCxJQUFrQixjQUtqQjtJQUxELFdBQWtCLGNBQWM7UUFDL0IsK0RBQVUsQ0FBQTtRQUNWLDZEQUFTLENBQUE7UUFDVCxtRUFBWSxDQUFBO1FBQ1osaUVBQVcsQ0FBQTtJQUNaLENBQUMsRUFMaUIsY0FBYyw4QkFBZCxjQUFjLFFBSy9CO0lBa0RZLFFBQUEsMkJBQTJCLEdBQUcsSUFBQSwrQkFBZSxFQUE4Qiw0QkFBNEIsQ0FBQyxDQUFDO0lBcUN0SCxJQUFrQixrQkFPakI7SUFQRCxXQUFrQixrQkFBa0I7UUFDbkMsdUNBQWlCLENBQUE7UUFDakIscURBQStCLENBQUE7UUFDL0IsNkNBQXVCLENBQUE7UUFDdkIsbURBQTZCLENBQUE7UUFDN0IscURBQStCLENBQUE7UUFDL0IscURBQStCLENBQUE7SUFDaEMsQ0FBQyxFQVBpQixrQkFBa0Isa0NBQWxCLGtCQUFrQixRQU9uQztJQUVZLFFBQUEsZ0JBQWdCLEdBQUcsWUFBWSxDQUFDO0lBQ2hDLFFBQUEsMEJBQTBCLEdBQUcsdUJBQXVCLENBQUM7SUFDckQsUUFBQSxnQ0FBZ0MsR0FBRyw2QkFBNkIsQ0FBQztJQUNqRSxRQUFBLG9DQUFvQyxHQUFHLDhDQUE4QyxDQUFDO0lBZTVGLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsc0JBQVU7UUFFbEQsWUFDa0IsVUFBaUMsRUFDckIsMEJBQXVEO1lBRXBGLEtBQUssRUFBRSxDQUFDO1lBSFMsZUFBVSxHQUFWLFVBQVUsQ0FBdUI7WUFJbEQsSUFBSSxDQUFDLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFFRCxJQUFJLFNBQVMsQ0FBQyxTQUFxQjtZQUNsQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVPLE1BQU0sQ0FBQyxTQUFpQztZQUMvQyxLQUFLLE1BQU0sU0FBUyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3hDLElBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxTQUFTLEVBQUU7b0JBQ3JDLElBQUksSUFBQSwyQ0FBaUIsRUFBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUU7d0JBQzVFLElBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLElBQUksU0FBUyxDQUFDLE1BQU0sSUFBSSxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsTUFBTSxFQUFFOzRCQUN0RyxJQUFJLFNBQVMsQ0FBQyxpQ0FBaUMsRUFBRTtnQ0FDaEQsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDOzZCQUNuQjt5QkFDRDs2QkFBTTs0QkFDTixTQUFTLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQzt5QkFDaEM7cUJBQ0Q7aUJBQ0Q7cUJBQU07b0JBQ04sU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO2lCQUNuQjthQUNEO1FBQ0YsQ0FBQztLQUNELENBQUE7SUEvQlksa0RBQW1CO2tDQUFuQixtQkFBbUI7UUFJN0IsV0FBQSxtQ0FBMkIsQ0FBQTtPQUpqQixtQkFBbUIsQ0ErQi9CO0lBRVksUUFBQSxpQ0FBaUMsR0FBRyxxREFBcUQsQ0FBQztJQUMxRixRQUFBLDJCQUEyQixHQUFHLDJDQUEyQyxDQUFDO0lBQzFFLFFBQUEsaUNBQWlDLEdBQUcsbURBQW1ELENBQUM7SUFDeEYsUUFBQSx3Q0FBd0MsR0FBRyx5Q0FBeUMsQ0FBQztJQUNyRixRQUFBLHNDQUFzQyxHQUFHLDhDQUE4QyxDQUFDO0lBRXhGLFFBQUEsZ0RBQWdELEdBQUcsZ0VBQWdFLENBQUM7SUFFakksZUFBZTtJQUNGLFFBQUEsNEJBQTRCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHVCQUF1QixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzFGLFFBQUEsbUJBQW1CLEdBQUcsSUFBSSwwQkFBYSxDQUFVLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUVuRixzQkFBc0I7SUFDVCxRQUFBLG1CQUFtQixHQUFHLFNBQVMsQ0FBQztJQUNoQyxRQUFBLHFCQUFxQixHQUFHLFdBQVcsQ0FBQyJ9