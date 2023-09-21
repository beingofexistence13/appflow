/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "electron", "vs/base/parts/ipc/electron-main/ipcMain", "vs/base/parts/contextmenu/common/contextmenu"], function (require, exports, electron_1, ipcMain_1, contextmenu_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerContextMenuListener = void 0;
    function registerContextMenuListener() {
        ipcMain_1.validatedIpcMain.on(contextmenu_1.CONTEXT_MENU_CHANNEL, (event, contextMenuId, items, onClickChannel, options) => {
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
                        event.sender.send(contextmenu_1.CONTEXT_MENU_CLOSE_CHANNEL, contextMenuId);
                    }
                }
            });
        });
    }
    exports.registerContextMenuListener = registerContextMenuListener;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dG1lbnUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3BhcnRzL2NvbnRleHRtZW51L2VsZWN0cm9uLW1haW4vY29udGV4dG1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLFNBQWdCLDJCQUEyQjtRQUMxQywwQkFBZ0IsQ0FBQyxFQUFFLENBQUMsa0NBQW9CLEVBQUUsQ0FBQyxLQUFtQixFQUFFLGFBQXFCLEVBQUUsS0FBcUMsRUFBRSxjQUFzQixFQUFFLE9BQXVCLEVBQUUsRUFBRTtZQUNoTCxNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUV0RCxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUNWLE1BQU0sRUFBRSx3QkFBYSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksU0FBUztnQkFDaEUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztnQkFDbEMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztnQkFDbEMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsU0FBUztnQkFDOUQsUUFBUSxFQUFFLEdBQUcsRUFBRTtvQkFDZCxrRUFBa0U7b0JBQ2xFLGtFQUFrRTtvQkFDbEUsbUVBQW1FO29CQUNuRSxJQUFJLElBQUksRUFBRTt3QkFDVCxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyx3Q0FBMEIsRUFBRSxhQUFhLENBQUMsQ0FBQztxQkFDN0Q7Z0JBQ0YsQ0FBQzthQUNELENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQW5CRCxrRUFtQkM7SUFFRCxTQUFTLFVBQVUsQ0FBQyxLQUFtQixFQUFFLGNBQXNCLEVBQUUsS0FBcUM7UUFDckcsTUFBTSxJQUFJLEdBQUcsSUFBSSxlQUFJLEVBQUUsQ0FBQztRQUV4QixLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3BCLElBQUksUUFBa0IsQ0FBQztZQUV2QixZQUFZO1lBQ1osSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFdBQVcsRUFBRTtnQkFDOUIsUUFBUSxHQUFHLElBQUksbUJBQVEsQ0FBQztvQkFDdkIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2lCQUNmLENBQUMsQ0FBQzthQUNIO1lBRUQsV0FBVztpQkFDTixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNyQyxRQUFRLEdBQUcsSUFBSSxtQkFBUSxDQUFDO29CQUN2QixPQUFPLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQztvQkFDeEQsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO2lCQUNqQixDQUFDLENBQUM7YUFDSDtZQUVELG1CQUFtQjtpQkFDZDtnQkFDSixRQUFRLEdBQUcsSUFBSSxtQkFBUSxDQUFDO29CQUN2QixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7b0JBQ2pCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtvQkFDZixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7b0JBQzdCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztvQkFDckIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO29CQUNyQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87b0JBQ3JCLEtBQUssRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLGdCQUFnQixDQUFDO2lCQUN4RyxDQUFDLENBQUM7YUFDSDtZQUVELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUMifQ==