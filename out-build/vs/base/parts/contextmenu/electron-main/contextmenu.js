/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "electron", "vs/base/parts/ipc/electron-main/ipcMain", "vs/base/parts/contextmenu/common/contextmenu"], function (require, exports, electron_1, ipcMain_1, contextmenu_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$VS = void 0;
    function $VS() {
        ipcMain_1.$US.on(contextmenu_1.$SS, (event, contextMenuId, items, onClickChannel, options) => {
            const menu = createMenu(event, onClickChannel, items);
            menu.popup({
                window: electron_1.BrowserWindow.fromWebContents(event.sender) ?? undefined,
                x: options ? options.x : undefined,
                y: options ? options.y : undefined,
                positioningItem: options ? options.positioningItem : undefined,
                callback: () => {
                    // Workaround for https://github.com/microsoft/vscode/issues/72447
                    // It turns out that the menu gets GC'ed if not referenced anymore
                    // As such we drag it into this scope so that it is not being GC'ed
                    if (menu) {
                        event.sender.send(contextmenu_1.$TS, contextMenuId);
                    }
                }
            });
        });
    }
    exports.$VS = $VS;
    function createMenu(event, onClickChannel, items) {
        const menu = new electron_1.Menu();
        items.forEach(item => {
            let menuitem;
            // Separator
            if (item.type === 'separator') {
                menuitem = new electron_1.MenuItem({
                    type: item.type,
                });
            }
            // Sub Menu
            else if (Array.isArray(item.submenu)) {
                menuitem = new electron_1.MenuItem({
                    submenu: createMenu(event, onClickChannel, item.submenu),
                    label: item.label
                });
            }
            // Normal Menu Item
            else {
                menuitem = new electron_1.MenuItem({
                    label: item.label,
                    type: item.type,
                    accelerator: item.accelerator,
                    checked: item.checked,
                    enabled: item.enabled,
                    visible: item.visible,
                    click: (menuItem, win, contextmenuEvent) => event.sender.send(onClickChannel, item.id, contextmenuEvent)
                });
            }
            menu.append(menuitem);
        });
        return menu;
    }
});
//# sourceMappingURL=contextmenu.js.map