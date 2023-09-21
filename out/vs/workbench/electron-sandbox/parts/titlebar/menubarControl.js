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
    exports.NativeMenubarControl = void 0;
    let NativeMenubarControl = class NativeMenubarControl extends menubarControl_1.MenubarControl {
        constructor(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, menubarService, hostService, nativeHostService, commandService) {
            super(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, hostService, commandService);
            this.menubarService = menubarService;
            this.nativeHostService = nativeHostService;
            (async () => {
                this.recentlyOpened = await this.workspacesService.getRecentlyOpened();
                this.doUpdateMenubar();
            })();
            this.registerListeners();
        }
        setupMainMenu() {
            super.setupMainMenu();
            for (const topLevelMenuName of Object.keys(this.topLevelTitles)) {
                const menu = this.menus[topLevelMenuName];
                if (menu) {
                    this.mainMenuDisposables.add(menu.onDidChange(() => this.updateMenubar()));
                }
            }
        }
        doUpdateMenubar() {
            // Since the native menubar is shared between windows (main process)
            // only allow the focused window to update the menubar
            if (!this.hostService.hasFocus) {
                return;
            }
            // Send menus to main process to be rendered by Electron
            const menubarData = { menus: {}, keybindings: {} };
            if (this.getMenubarMenus(menubarData)) {
                this.menubarService.updateMenubar(this.nativeHostService.windowId, menubarData);
            }
        }
        getMenubarMenus(menubarData) {
            if (!menubarData) {
                return false;
            }
            menubarData.keybindings = this.getAdditionalKeybindings();
            for (const topLevelMenuName of Object.keys(this.topLevelTitles)) {
                const menu = this.menus[topLevelMenuName];
                if (menu) {
                    const menubarMenu = { items: [] };
                    const menuActions = [];
                    (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { shouldForwardArgs: true }, menuActions);
                    this.populateMenuItems(menuActions, menubarMenu, menubarData.keybindings);
                    if (menubarMenu.items.length === 0) {
                        return false; // Menus are incomplete
                    }
                    menubarData.menus[topLevelMenuName] = menubarMenu;
                }
            }
            return true;
        }
        populateMenuItems(menuActions, menuToPopulate, keybindings) {
            for (const menuItem of menuActions) {
                if (menuItem instanceof actions_1.Separator) {
                    menuToPopulate.items.push({ id: 'vscode.menubar.separator' });
                }
                else if (menuItem instanceof actions_2.MenuItemAction || menuItem instanceof actions_2.SubmenuItemAction) {
                    // use mnemonicTitle whenever possible
                    const title = typeof menuItem.item.title === 'string'
                        ? menuItem.item.title
                        : menuItem.item.title.mnemonicTitle ?? menuItem.item.title.value;
                    if (menuItem instanceof actions_2.SubmenuItemAction) {
                        const submenu = { items: [] };
                        this.populateMenuItems(menuItem.actions, submenu, keybindings);
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
                        if (menuItem.id === windowActions_1.OpenRecentAction.ID) {
                            const actions = this.getOpenRecentActions().map(this.transformOpenRecentAction);
                            menuToPopulate.items.push(...actions);
                        }
                        const menubarMenuItem = {
                            id: menuItem.id,
                            label: title
                        };
                        if ((0, action_1.isICommandActionToggleInfo)(menuItem.item.toggled)) {
                            menubarMenuItem.label = menuItem.item.toggled.mnemonicTitle ?? menuItem.item.toggled.title ?? title;
                        }
                        if (menuItem.checked) {
                            menubarMenuItem.checked = true;
                        }
                        if (!menuItem.enabled) {
                            menubarMenuItem.enabled = false;
                        }
                        keybindings[menuItem.id] = this.getMenubarKeybinding(menuItem.id);
                        menuToPopulate.items.push(menubarMenuItem);
                    }
                }
            }
        }
        transformOpenRecentAction(action) {
            if (action instanceof actions_1.Separator) {
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
        getAdditionalKeybindings() {
            const keybindings = {};
            if (platform_1.isMacintosh) {
                const keybinding = this.getMenubarKeybinding('workbench.action.quit');
                if (keybinding) {
                    keybindings['workbench.action.quit'] = keybinding;
                }
            }
            return keybindings;
        }
        getMenubarKeybinding(id) {
            const binding = this.keybindingService.lookupKeybinding(id);
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
    exports.NativeMenubarControl = NativeMenubarControl;
    exports.NativeMenubarControl = NativeMenubarControl = __decorate([
        __param(0, actions_2.IMenuService),
        __param(1, workspaces_1.IWorkspacesService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, label_1.ILabelService),
        __param(6, update_1.IUpdateService),
        __param(7, storage_1.IStorageService),
        __param(8, notification_1.INotificationService),
        __param(9, preferences_1.IPreferencesService),
        __param(10, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(11, accessibility_1.IAccessibilityService),
        __param(12, menubar_1.IMenubarService),
        __param(13, host_1.IHostService),
        __param(14, native_1.INativeHostService),
        __param(15, commands_1.ICommandService)
    ], NativeMenubarControl);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudWJhckNvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvZWxlY3Ryb24tc2FuZGJveC9wYXJ0cy90aXRsZWJhci9tZW51YmFyQ29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUEwQnpGLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEsK0JBQWM7UUFFdkQsWUFDZSxXQUF5QixFQUNuQixpQkFBcUMsRUFDckMsaUJBQXFDLEVBQ3JDLGlCQUFxQyxFQUNsQyxvQkFBMkMsRUFDbkQsWUFBMkIsRUFDMUIsYUFBNkIsRUFDNUIsY0FBK0IsRUFDMUIsbUJBQXlDLEVBQzFDLGtCQUF1QyxFQUN4QixrQkFBc0QsRUFDbkUsb0JBQTJDLEVBQ2hDLGNBQStCLEVBQ25ELFdBQXlCLEVBQ0YsaUJBQXFDLEVBQ3pELGNBQStCO1lBRWhELEtBQUssQ0FBQyxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsb0JBQW9CLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxjQUFjLEVBQUUsbUJBQW1CLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUUsb0JBQW9CLEVBQUUsV0FBVyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBTDdOLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtZQUU1QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBSzFFLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUV2RSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUVMLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7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