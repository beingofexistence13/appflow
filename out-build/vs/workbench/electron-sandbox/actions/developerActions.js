/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/electron-sandbox/actions/developerActions", "vs/platform/native/common/native", "vs/workbench/services/editor/common/editorService", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/environment/common/environmentService", "vs/platform/contextkey/common/contextkeys", "vs/platform/files/common/files", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/base/common/uri"], function (require, exports, nls_1, native_1, editorService_1, actions_1, actionCommonCategories_1, environmentService_1, contextkeys_1, files_1, environmentService_2, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$g_b = exports.$f_b = exports.$e_b = exports.$d_b = void 0;
    class $d_b extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.toggleDevTools',
                title: { value: (0, nls_1.localize)(0, null), original: 'Toggle Developer Tools' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
                    when: contextkeys_1.$63,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 39 /* KeyCode.KeyI */,
                    mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 39 /* KeyCode.KeyI */ }
                },
                menu: {
                    id: actions_1.$Ru.MenubarHelpMenu,
                    group: '5_tools',
                    order: 1
                }
            });
        }
        async run(accessor) {
            const nativeHostService = accessor.get(native_1.$05b);
            return nativeHostService.toggleDevTools();
        }
    }
    exports.$d_b = $d_b;
    class $e_b extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.configureRuntimeArguments',
                title: { value: (0, nls_1.localize)(1, null), original: 'Configure Runtime Arguments' },
                category: actionCommonCategories_1.$Nl.Preferences,
                f1: true
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const environmentService = accessor.get(environmentService_1.$hJ);
            await editorService.openEditor({
                resource: environmentService.argvResource,
                options: { pinned: true }
            });
        }
    }
    exports.$e_b = $e_b;
    class $f_b extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.reloadWindowWithExtensionsDisabled',
                title: { value: (0, nls_1.localize)(2, null), original: 'Reload With Extensions Disabled' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        async run(accessor) {
            return accessor.get(native_1.$05b).reload({ disableExtensions: true });
        }
    }
    exports.$f_b = $f_b;
    class $g_b extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.openUserDataFolder',
                title: { value: (0, nls_1.localize)(3, null), original: 'Open User Data Folder' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const nativeHostService = accessor.get(native_1.$05b);
            const fileService = accessor.get(files_1.$6j);
            const environmentService = accessor.get(environmentService_2.$1$b);
            const userDataHome = uri_1.URI.file(environmentService.userDataPath);
            const file = await fileService.resolve(userDataHome);
            let itemToShow;
            if (file.children && file.children.length > 0) {
                itemToShow = file.children[0].resource;
            }
            else {
                itemToShow = userDataHome;
            }
            return nativeHostService.showItemInFolder(itemToShow.fsPath);
        }
    }
    exports.$g_b = $g_b;
});
//# sourceMappingURL=developerActions.js.map