/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/contextmenu/common/contextmenu", "vs/base/parts/sandbox/electron-sandbox/globals"], function (require, exports, contextmenu_1, globals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$WS = void 0;
    let contextMenuIdPool = 0;
    function $WS(items, options, onHide) {
        const processedItems = [];
        const contextMenuId = contextMenuIdPool++;
        const onClickChannel = `vscode:onContextMenu${contextMenuId}`;
        const onClickChannelHandler = (event, itemId, context) => {
            const item = processedItems[itemId];
            item.click?.(context);
        };
        globals_1.$M.once(onClickChannel, onClickChannelHandler);
        globals_1.$M.once(contextmenu_1.$TS, (event, closedContextMenuId) => {
            if (closedContextMenuId !== contextMenuId) {
                return;
            }
            globals_1.$M.removeListener(onClickChannel, onClickChannelHandler);
            onHide?.();
        });
        globals_1.$M.send(contextmenu_1.$SS, contextMenuId, items.map(item => createItem(item, processedItems)), onClickChannel, options);
    }
    exports.$WS = $WS;
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
//# sourceMappingURL=contextmenu.js.map