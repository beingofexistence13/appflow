/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/files/common/files", "vs/base/common/uri", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/native/common/native", "vs/base/common/network", "vs/platform/actions/common/actions", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls_1, files_1, uri_1, environmentService_1, native_1, network_1, actions_1, extensionManagement_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CleanUpExtensionsFolderAction = exports.OpenExtensionsFolderAction = void 0;
    class OpenExtensionsFolderAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.extensions.action.openExtensionsFolder',
                title: { value: (0, nls_1.localize)('openExtensionsFolder', "Open Extensions Folder"), original: 'Open Extensions Folder' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                f1: true
            });
        }
        async run(accessor) {
            const nativeHostService = accessor.get(native_1.INativeHostService);
            const fileService = accessor.get(files_1.IFileService);
            const environmentService = accessor.get(environmentService_1.INativeWorkbenchEnvironmentService);
            const extensionsHome = uri_1.URI.file(environmentService.extensionsPath);
            const file = await fileService.resolve(extensionsHome);
            let itemToShow;
            if (file.children && file.children.length > 0) {
                itemToShow = file.children[0].resource;
            }
            else {
                itemToShow = extensionsHome;
            }
            if (itemToShow.scheme === network_1.Schemas.file) {
                return nativeHostService.showItemInFolder(itemToShow.fsPath);
            }
        }
    }
    exports.OpenExtensionsFolderAction = OpenExtensionsFolderAction;
    class CleanUpExtensionsFolderAction extends actions_1.Action2 {
        constructor() {
            super({
                id: '_workbench.extensions.action.cleanUpExtensionsFolder',
                title: { value: (0, nls_1.localize)('cleanUpExtensionsFolder', "Cleanup Extensions Folder"), original: 'Cleanup Extensions Folder' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const extensionManagementService = accessor.get(extensionManagement_1.IExtensionManagementService);
            return extensionManagementService.cleanUp();
        }
    }
    exports.CleanUpExtensionsFolderAction = CleanUpExtensionsFolderAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc0FjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2VsZWN0cm9uLXNhbmRib3gvZXh0ZW5zaW9uc0FjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYWhHLE1BQWEsMEJBQTJCLFNBQVEsaUJBQU87UUFFdEQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLGtEQUFrRDtnQkFDdEQsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLHNCQUFzQixFQUFFLHdCQUF3QixDQUFDLEVBQUUsUUFBUSxFQUFFLHdCQUF3QixFQUFFO2dCQUNoSCxRQUFRLEVBQUUsOENBQXdCO2dCQUNsQyxFQUFFLEVBQUUsSUFBSTthQUNSLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQ25DLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywyQkFBa0IsQ0FBQyxDQUFDO1lBQzNELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsb0JBQVksQ0FBQyxDQUFDO1lBQy9DLE1BQU0sa0JBQWtCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx1REFBa0MsQ0FBQyxDQUFDO1lBRTVFLE1BQU0sY0FBYyxHQUFHLFNBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDbkUsTUFBTSxJQUFJLEdBQUcsTUFBTSxXQUFXLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRXZELElBQUksVUFBZSxDQUFDO1lBQ3BCLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzlDLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQzthQUN2QztpQkFBTTtnQkFDTixVQUFVLEdBQUcsY0FBYyxDQUFDO2FBQzVCO1lBRUQsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsSUFBSSxFQUFFO2dCQUN2QyxPQUFPLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUM3RDtRQUNGLENBQUM7S0FDRDtJQTlCRCxnRUE4QkM7SUFFRCxNQUFhLDZCQUE4QixTQUFRLGlCQUFPO1FBRXpEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxzREFBc0Q7Z0JBQzFELEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyx5QkFBeUIsRUFBRSwyQkFBMkIsQ0FBQyxFQUFFLFFBQVEsRUFBRSwyQkFBMkIsRUFBRTtnQkFDekgsUUFBUSxFQUFFLG1DQUFVLENBQUMsU0FBUztnQkFDOUIsRUFBRSxFQUFFLElBQUk7YUFDUixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUNuQyxNQUFNLDBCQUEwQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsaURBQTJCLENBQUMsQ0FBQztZQUM3RSxPQUFPLDBCQUEwQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzdDLENBQUM7S0FDRDtJQWZELHNFQWVDIn0=