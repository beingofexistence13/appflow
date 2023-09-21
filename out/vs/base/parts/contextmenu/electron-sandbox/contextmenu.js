/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/contextmenu/common/contextmenu", "vs/base/parts/sandbox/electron-sandbox/globals"], function (require, exports, contextmenu_1, globals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.popup = void 0;
    let contextMenuIdPool = 0;
    function popup(items, options, onHide) {
        const processedItems = [];
        const contextMenuId = contextMenuIdPool++;
        const onClickChannel = `vscode:onContextMenu${contextMenuId}`;
        const onClickChannelHandler = (event, itemId, context) => {
            const item = processedItems[itemId];
            item.click?.(context);
        };
        globals_1.ipcRenderer.once(onClickChannel, onClickChannelHandler);
        globals_1.ipcRenderer.once(contextmenu_1.CONTEXT_MENU_CLOSE_CHANNEL, (event, closedContextMenuId) => {
            if (closedContextMenuId !== contextMenuId) {
                return;
            }
            globals_1.ipcRenderer.removeListener(onClickChannel, onClickChannelHandler);
            onHide?.();
        });
        globals_1.ipcRenderer.send(contextmenu_1.CONTEXT_MENU_CHANNEL, contextMenuId, items.map(item => createItem(item, processedItems)), onClickChannel, options);
    }
    exports.popup = popup;
    function createItem(item, processedItems) {
        const serializableItem = {
            id: processedItems.length,
            label: item.label,
            type: item.type,
            accelerator: item.accelerator,
            checked: item.checked,
            enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
            visible: typeof item.visible === 'boolean' ? item.visible : true
        };
        processedItems.push(item);
        // Submenu
        if (Array.isArray(item.submenu)) {
            serializableItem.submenu = item.submenu.map(submenuItem => createItem(submenuItem, processedItems));
        }
        return serializableItem;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dG1lbnUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3BhcnRzL2NvbnRleHRtZW51L2VsZWN0cm9uLXNhbmRib3gvY29udGV4dG1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLElBQUksaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0lBRTFCLFNBQWdCLEtBQUssQ0FBQyxLQUF5QixFQUFFLE9BQXVCLEVBQUUsTUFBbUI7UUFDNUYsTUFBTSxjQUFjLEdBQXVCLEVBQUUsQ0FBQztRQUU5QyxNQUFNLGFBQWEsR0FBRyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFDLE1BQU0sY0FBYyxHQUFHLHVCQUF1QixhQUFhLEVBQUUsQ0FBQztRQUM5RCxNQUFNLHFCQUFxQixHQUFHLENBQUMsS0FBYyxFQUFFLE1BQWMsRUFBRSxPQUEwQixFQUFFLEVBQUU7WUFDNUYsTUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUM7UUFFRixxQkFBVyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUN4RCxxQkFBVyxDQUFDLElBQUksQ0FBQyx3Q0FBMEIsRUFBRSxDQUFDLEtBQWMsRUFBRSxtQkFBMkIsRUFBRSxFQUFFO1lBQzVGLElBQUksbUJBQW1CLEtBQUssYUFBYSxFQUFFO2dCQUMxQyxPQUFPO2FBQ1A7WUFFRCxxQkFBVyxDQUFDLGNBQWMsQ0FBQyxjQUFjLEVBQUUscUJBQXFCLENBQUMsQ0FBQztZQUVsRSxNQUFNLEVBQUUsRUFBRSxDQUFDO1FBQ1osQ0FBQyxDQUFDLENBQUM7UUFFSCxxQkFBVyxDQUFDLElBQUksQ0FBQyxrQ0FBb0IsRUFBRSxhQUFhLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUMsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDckksQ0FBQztJQXRCRCxzQkFzQkM7SUFFRCxTQUFTLFVBQVUsQ0FBQyxJQUFzQixFQUFFLGNBQWtDO1FBQzdFLE1BQU0sZ0JBQWdCLEdBQWlDO1lBQ3RELEVBQUUsRUFBRSxjQUFjLENBQUMsTUFBTTtZQUN6QixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ2YsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXO1lBQzdCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixPQUFPLEVBQUUsT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUNoRSxPQUFPLEVBQUUsT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSTtTQUNoRSxDQUFDO1FBRUYsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUxQixVQUFVO1FBQ1YsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNoQyxnQkFBZ0IsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7U0FDcEc7UUFFRCxPQUFPLGdCQUFnQixDQUFDO0lBQ3pCLENBQUMifQ==