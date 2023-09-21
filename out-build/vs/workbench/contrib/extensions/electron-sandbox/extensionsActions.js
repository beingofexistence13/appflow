/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/electron-sandbox/extensionsActions", "vs/platform/files/common/files", "vs/base/common/uri", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/native/common/native", "vs/base/common/network", "vs/platform/actions/common/actions", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/action/common/actionCommonCategories"], function (require, exports, nls_1, files_1, uri_1, environmentService_1, native_1, network_1, actions_1, extensionManagement_1, actionCommonCategories_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$tac = exports.$sac = void 0;
    class $sac extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.extensions.action.openExtensionsFolder',
                title: { value: (0, nls_1.localize)(0, null), original: 'Open Extensions Folder' },
                category: extensionManagement_1.$8n,
                f1: true
            });
        }
        async run(accessor) {
            const nativeHostService = accessor.get(native_1.$05b);
            const fileService = accessor.get(files_1.$6j);
            const environmentService = accessor.get(environmentService_1.$1$b);
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
    exports.$sac = $sac;
    class $tac extends actions_1.$Wu {
        constructor() {
            super({
                id: '_workbench.extensions.action.cleanUpExtensionsFolder',
                title: { value: (0, nls_1.localize)(1, null), original: 'Cleanup Extensions Folder' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const extensionManagementService = accessor.get(extensionManagement_1.$2n);
            return extensionManagementService.cleanUp();
        }
    }
    exports.$tac = $tac;
});
//# sourceMappingURL=extensionsActions.js.map