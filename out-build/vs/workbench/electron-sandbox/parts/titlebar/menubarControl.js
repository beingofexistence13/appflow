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
define(["require", "exports", "vs/base/common/actions", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/workspaces/common/workspaces", "vs/base/common/platform", "vs/platform/notification/common/notification", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/label/common/label", "vs/platform/update/common/update", "vs/workbench/browser/parts/titlebar/menubarControl", "vs/platform/storage/common/storage", "vs/platform/menubar/electron-sandbox/menubar", "vs/platform/native/common/native", "vs/workbench/services/host/browser/host", "vs/workbench/services/preferences/common/preferences", "vs/platform/commands/common/commands", "vs/workbench/browser/actions/windowActions", "vs/platform/action/common/action", "vs/platform/actions/browser/menuEntryActionViewItem"], function (require, exports, actions_1, actions_2, contextkey_1, workspaces_1, platform_1, notification_1, keybinding_1, environmentService_1, accessibility_1, configuration_1, label_1, update_1, menubarControl_1, storage_1, menubar_1, native_1, host_1, preferences_1, commands_1, windowActions_1, action_1, menuEntryActionViewItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$E_b = void 0;
    let $E_b = class $E_b extends menubarControl_1.$2xb {
        constructor(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, $, hostService, ab, commandService) {
            super(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, hostService, commandService);
            this.$ = $;
            this.ab = ab;
            (async () => {
                this.h = await this.r.getRecentlyOpened();
                this.J();
            })();
            this.L();
        }
        M() {
            super.M();
            for (const topLevelMenuName of Object.keys(this.f)) {
                const menu = this.c[topLevelMenuName];
                if (menu) {
                    this.g.add(menu.onDidChange(() => this.N()));
                }
            }
        }
        J() {
            // Since the native menubar is shared between windows (main process)
            // only allow the focused window to update the menubar
            if (!this.H.hasFocus) {
                return;
            }
            // Send menus to main process to be rendered by Electron
            const menubarData = { menus: {}, keybindings: {} };
            if (this.db(menubarData)) {
                this.$.updateMenubar(this.ab.windowId, menubarData);
            }
        }
        db(menubarData) {
            if (!menubarData) {
                return false;
            }
            menubarData.keybindings = this.gb();
            for (const topLevelMenuName of Object.keys(this.f)) {
                const menu = this.c[topLevelMenuName];
                if (menu) {
                    const menubarMenu = { items: [] };
                    const menuActions = [];
                    (0, menuEntryActionViewItem_1.$A3)(menu, { shouldForwardArgs: true }, menuActions);
                    this.eb(menuActions, menubarMenu, menubarData.keybindings);
                    if (menubarMenu.items.length === 0) {
                        return false; // Menus are incomplete
                    }
                    menubarData.menus[topLevelMenuName] = menubarMenu;
                }
            }
            return true;
        }
        eb(menuActions, menuToPopulate, keybindings) {
            for (const menuItem of menuActions) {
                if (menuItem instanceof actions_1.$ii) {
                    menuToPopulate.items.push({ id: 'vscode.menubar.separator' });
                }
                else if (menuItem instanceof actions_2.$Vu || menuItem instanceof actions_2.$Uu) {
                    // use mnemonicTitle whenever possible
                    const title = typeof menuItem.item.title === 'string'
                        ? menuItem.item.title
                        : menuItem.item.title.mnemonicTitle ?? menuItem.item.title.value;
                    if (menuItem instanceof actions_2.$Uu) {
                        const submenu = { items: [] };
                        this.eb(menuItem.actions, submenu, keybindings);
                        if (submenu.items.length > 0) {
                            const menubarSubmenuItem = {
                                id: menuItem.id,
                                label: title,
                                submenu: submenu
                            };
                            menuToPopulate.items.push(menubarSubmenuItem);
                        }
                    }
                    else {
                        if (menuItem.id === windowActions_1.$1tb.ID) {
                            const actions = this.R().map(this.fb);
                            menuToPopulate.items.push(...actions);
                        }
                        const menubarMenuItem = {
                            id: menuItem.id,
                            label: title
                        };
                        if ((0, action_1.$Ol)(menuItem.item.toggled)) {
                            menubarMenuItem.label = menuItem.item.toggled.mnemonicTitle ?? menuItem.item.toggled.title ?? title;
                        }
                        if (menuItem.checked) {
                            menubarMenuItem.checked = true;
                        }
                        if (!menuItem.enabled) {
                            menubarMenuItem.enabled = false;
                        }
                        keybindings[menuItem.id] = this.hb(menuItem.id);
                        menuToPopulate.items.push(menubarMenuItem);
                    }
                }
            }
        }
        fb(action) {
            if (action instanceof actions_1.$ii) {
                return { id: 'vscode.menubar.separator' };
            }
            return {
                id: action.id,
                uri: action.uri,
                remoteAuthority: action.remoteAuthority,
                enabled: action.enabled,
                label: action.label
            };
        }
        gb() {
            const keybindings = {};
            if (platform_1.$j) {
                const keybinding = this.hb('workbench.action.quit');
                if (keybinding) {
                    keybindings['workbench.action.quit'] = keybinding;
                }
            }
            return keybindings;
        }
        hb(id) {
            const binding = this.t.lookupKeybinding(id);
            if (!binding) {
                return undefined;
            }
            // first try to resolve a native accelerator
            const electronAccelerator = binding.getElectronAccelerator();
            if (electronAccelerator) {
                return { label: electronAccelerator, userSettingsLabel: binding.getUserSettingsLabel() ?? undefined };
            }
            // we need this fallback to support keybindings that cannot show in electron menus (e.g. chords)
            const acceleratorLabel = binding.getLabel();
            if (acceleratorLabel) {
                return { label: acceleratorLabel, isNative: false, userSettingsLabel: binding.getUserSettingsLabel() ?? undefined };
            }
            return undefined;
        }
    };
    exports.$E_b = $E_b;
    exports.$E_b = $E_b = __decorate([
        __param(0, actions_2.$Su),
        __param(1, workspaces_1.$fU),
        __param(2, contextkey_1.$3i),
        __param(3, keybinding_1.$2D),
        __param(4, configuration_1.$8h),
        __param(5, label_1.$Vz),
        __param(6, update_1.$UT),
        __param(7, storage_1.$Vo),
        __param(8, notification_1.$Yu),
        __param(9, preferences_1.$BE),
        __param(10, environmentService_1.$1$b),
        __param(11, accessibility_1.$1r),
        __param(12, menubar_1.$B$b),
        __param(13, host_1.$VT),
        __param(14, native_1.$05b),
        __param(15, commands_1.$Fr)
    ], $E_b);
});
//# sourceMappingURL=menubarControl.js.map