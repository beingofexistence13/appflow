/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls!vs/platform/quickinput/browser/quickPickPin", "vs/base/common/themables"], function (require, exports, codicons_1, nls_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8Vb = void 0;
    const pinButtonClass = themables_1.ThemeIcon.asClassName(codicons_1.$Pj.pin);
    const pinnedButtonClass = themables_1.ThemeIcon.asClassName(codicons_1.$Pj.pinned);
    const buttonClasses = [pinButtonClass, pinnedButtonClass];
    /**
     * Initially, adds pin buttons to all @param quickPick items.
     * When pinned, a copy of the item will be moved to the end of the pinned list and any duplicate within the pinned list will
     * be removed if @param filterDupliates has been provided. Pin and pinned button events trigger updates to the underlying storage.
     * Shows the quickpick once formatted.
     */
    async function $8Vb(storageService, storageKey, quickPick, filterDuplicates) {
        const itemsWithoutPinned = quickPick.items;
        let itemsWithPinned = _formatPinnedItems(storageKey, quickPick, storageService, undefined, filterDuplicates);
        quickPick.onDidTriggerItemButton(async (buttonEvent) => {
            const expectedButton = buttonEvent.button.iconClass && buttonClasses.includes(buttonEvent.button.iconClass);
            if (expectedButton) {
                quickPick.items = itemsWithoutPinned;
                itemsWithPinned = _formatPinnedItems(storageKey, quickPick, storageService, buttonEvent.item, filterDuplicates);
                quickPick.items = quickPick.value ? itemsWithoutPinned : itemsWithPinned;
            }
        });
        quickPick.onDidChangeValue(async (value) => {
            if (quickPick.items === itemsWithPinned && value) {
                quickPick.items = itemsWithoutPinned;
            }
            else if (quickPick.items === itemsWithoutPinned && !value) {
                quickPick.items = itemsWithPinned;
            }
        });
        quickPick.items = quickPick.value ? itemsWithoutPinned : itemsWithPinned;
        quickPick.show();
    }
    exports.$8Vb = $8Vb;
    function _formatPinnedItems(storageKey, quickPick, storageService, changedItem, filterDuplicates) {
        const formattedItems = [];
        let pinnedItems;
        if (changedItem) {
            pinnedItems = updatePinnedItems(storageKey, changedItem, storageService);
        }
        else {
            pinnedItems = getPinnedItems(storageKey, storageService);
        }
        if (pinnedItems.length) {
            formattedItems.push({ type: 'separator', label: (0, nls_1.localize)(0, null) });
        }
        const pinnedIds = new Set();
        for (const itemToFind of pinnedItems) {
            const itemToPin = quickPick.items.find(item => itemsMatch(item, itemToFind));
            if (itemToPin) {
                const pinnedItemId = getItemIdentifier(itemToPin);
                const pinnedItem = Object.assign({}, itemToPin);
                if (!filterDuplicates || !pinnedIds.has(pinnedItemId)) {
                    pinnedIds.add(pinnedItemId);
                    updateButtons(pinnedItem, false);
                    formattedItems.push(pinnedItem);
                }
            }
        }
        for (const item of quickPick.items) {
            updateButtons(item, true);
            formattedItems.push(item);
        }
        return formattedItems;
    }
    function getItemIdentifier(item) {
        return item.type === 'separator' ? '' : item.id || `${item.label}${item.description}${item.detail}}`;
    }
    function updateButtons(item, removePin) {
        if (item.type === 'separator') {
            return;
        }
        // remove button classes before adding the new one
        const newButtons = item.buttons?.filter(button => button.iconClass && !buttonClasses.includes(button.iconClass)) ?? [];
        newButtons.unshift({
            iconClass: removePin ? pinButtonClass : pinnedButtonClass,
            tooltip: removePin ? (0, nls_1.localize)(1, null) : (0, nls_1.localize)(2, null),
            alwaysVisible: false
        });
        item.buttons = newButtons;
    }
    function itemsMatch(itemA, itemB) {
        return getItemIdentifier(itemA) === getItemIdentifier(itemB);
    }
    function updatePinnedItems(storageKey, changedItem, storageService) {
        const removePin = changedItem.buttons?.find(b => b.iconClass === pinnedButtonClass);
        let items = getPinnedItems(storageKey, storageService);
        if (removePin) {
            items = items.filter(item => getItemIdentifier(item) !== getItemIdentifier(changedItem));
        }
        else {
            items.push(changedItem);
        }
        storageService.store(storageKey, JSON.stringify(items), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        return items;
    }
    function getPinnedItems(storageKey, storageService) {
        const items = storageService.get(storageKey, 1 /* StorageScope.WORKSPACE */);
        return items ? JSON.parse(items) : [];
    }
});
//# sourceMappingURL=quickPickPin.js.map