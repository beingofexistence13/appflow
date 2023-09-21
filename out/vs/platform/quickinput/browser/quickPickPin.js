/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls", "vs/base/common/themables"], function (require, exports, codicons_1, nls_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showWithPinnedItems = void 0;
    const pinButtonClass = themables_1.ThemeIcon.asClassName(codicons_1.Codicon.pin);
    const pinnedButtonClass = themables_1.ThemeIcon.asClassName(codicons_1.Codicon.pinned);
    const buttonClasses = [pinButtonClass, pinnedButtonClass];
    /**
     * Initially, adds pin buttons to all @param quickPick items.
     * When pinned, a copy of the item will be moved to the end of the pinned list and any duplicate within the pinned list will
     * be removed if @param filterDupliates has been provided. Pin and pinned button events trigger updates to the underlying storage.
     * Shows the quickpick once formatted.
     */
    async function showWithPinnedItems(storageService, storageKey, quickPick, filterDuplicates) {
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
    exports.showWithPinnedItems = showWithPinnedItems;
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
            formattedItems.push({ type: 'separator', label: (0, nls_1.localize)("terminal.commands.pinned", 'pinned') });
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
            tooltip: removePin ? (0, nls_1.localize)('pinCommand', "Pin command") : (0, nls_1.localize)('pinnedCommand', "Pinned command"),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tQaWNrUGluLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcXVpY2tpbnB1dC9icm93c2VyL3F1aWNrUGlja1Bpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsTUFBTSxjQUFjLEdBQUcscUJBQVMsQ0FBQyxXQUFXLENBQUMsa0JBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMxRCxNQUFNLGlCQUFpQixHQUFHLHFCQUFTLENBQUMsV0FBVyxDQUFDLGtCQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEUsTUFBTSxhQUFhLEdBQUcsQ0FBQyxjQUFjLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUMxRDs7Ozs7T0FLRztJQUNJLEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxjQUErQixFQUFFLFVBQWtCLEVBQUUsU0FBcUMsRUFBRSxnQkFBMEI7UUFDL0osTUFBTSxrQkFBa0IsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO1FBQzNDLElBQUksZUFBZSxHQUFHLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzdHLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUMsV0FBVyxFQUFDLEVBQUU7WUFDcEQsTUFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxTQUFTLElBQUksYUFBYSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzVHLElBQUksY0FBYyxFQUFFO2dCQUNuQixTQUFTLENBQUMsS0FBSyxHQUFHLGtCQUFrQixDQUFDO2dCQUNyQyxlQUFlLEdBQUcsa0JBQWtCLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FB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