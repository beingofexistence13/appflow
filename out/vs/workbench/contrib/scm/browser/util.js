/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/base/common/arrays", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/dom"], function (require, exports, actions_1, menuEntryActionViewItem_1, arrays_1, actionViewItems_1, iconLabels_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getActionViewItemProvider = exports.StatusBarAction = exports.collectContextMenuActions = exports.connectPrimaryMenuToInlineActionBar = exports.connectPrimaryMenu = exports.isSCMResource = exports.isSCMResourceGroup = exports.isSCMActionButton = exports.isSCMInput = exports.isSCMRepository = exports.isSCMRepositoryArray = void 0;
    function isSCMRepositoryArray(element) {
        return Array.isArray(element) && element.every(r => isSCMRepository(r));
    }
    exports.isSCMRepositoryArray = isSCMRepositoryArray;
    function isSCMRepository(element) {
        return !!element.provider && !!element.input;
    }
    exports.isSCMRepository = isSCMRepository;
    function isSCMInput(element) {
        return !!element.validateInput && typeof element.value === 'string';
    }
    exports.isSCMInput = isSCMInput;
    function isSCMActionButton(element) {
        return element.type === 'actionButton';
    }
    exports.isSCMActionButton = isSCMActionButton;
    function isSCMResourceGroup(element) {
        return !!element.provider && !!element.elements;
    }
    exports.isSCMResourceGroup = isSCMResourceGroup;
    function isSCMResource(element) {
        return !!element.sourceUri && isSCMResourceGroup(element.resourceGroup);
    }
    exports.isSCMResource = isSCMResource;
    const compareActions = (a, b) => a.id === b.id && a.enabled === b.enabled;
    function connectPrimaryMenu(menu, callback, primaryGroup) {
        let cachedPrimary = [];
        let cachedSecondary = [];
        const updateActions = () => {
            const primary = [];
            const secondary = [];
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { shouldForwardArgs: true }, { primary, secondary }, primaryGroup);
            if ((0, arrays_1.equals)(cachedPrimary, primary, compareActions) && (0, arrays_1.equals)(cachedSecondary, secondary, compareActions)) {
                return;
            }
            cachedPrimary = primary;
            cachedSecondary = secondary;
            callback(primary, secondary);
        };
        updateActions();
        return menu.onDidChange(updateActions);
    }
    exports.connectPrimaryMenu = connectPrimaryMenu;
    function connectPrimaryMenuToInlineActionBar(menu, actionBar) {
        return connectPrimaryMenu(menu, (primary) => {
            actionBar.clear();
            actionBar.push(primary, { icon: true, label: false });
        }, 'inline');
    }
    exports.connectPrimaryMenuToInlineActionBar = connectPrimaryMenuToInlineActionBar;
    function collectContextMenuActions(menu) {
        const primary = [];
        const actions = [];
        (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { shouldForwardArgs: true }, { primary, secondary: actions }, 'inline');
        return actions;
    }
    exports.collectContextMenuActions = collectContextMenuActions;
    class StatusBarAction extends actions_1.Action {
        constructor(command, commandService) {
            super(`statusbaraction{${command.id}}`, command.title, '', true);
            this.command = command;
            this.commandService = commandService;
            this.tooltip = command.tooltip || '';
        }
        run() {
            return this.commandService.executeCommand(this.command.id, ...(this.command.arguments || []));
        }
    }
    exports.StatusBarAction = StatusBarAction;
    class StatusBarActionViewItem extends actionViewItems_1.ActionViewItem {
        constructor(action) {
            super(null, action, {});
        }
        updateLabel() {
            if (this.options.label && this.label) {
                (0, dom_1.reset)(this.label, ...(0, iconLabels_1.renderLabelWithIcons)(this.action.label));
            }
        }
    }
    function getActionViewItemProvider(instaService) {
        return action => {
            if (action instanceof StatusBarAction) {
                return new StatusBarActionViewItem(action);
            }
            return (0, menuEntryActionViewItem_1.createActionViewItem)(instaService, action);
        };
    }
    exports.getActionViewItemProvider = getActionViewItemProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NjbS9icm93c2VyL3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0JoRyxTQUFnQixvQkFBb0IsQ0FBQyxPQUFZO1FBQ2hELE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUZELG9EQUVDO0lBRUQsU0FBZ0IsZUFBZSxDQUFDLE9BQVk7UUFDM0MsT0FBTyxDQUFDLENBQUUsT0FBMEIsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFFLE9BQTBCLENBQUMsS0FBSyxDQUFDO0lBQ3RGLENBQUM7SUFGRCwwQ0FFQztJQUVELFNBQWdCLFVBQVUsQ0FBQyxPQUFZO1FBQ3RDLE9BQU8sQ0FBQyxDQUFFLE9BQXFCLENBQUMsYUFBYSxJQUFJLE9BQVEsT0FBcUIsQ0FBQyxLQUFLLEtBQUssUUFBUSxDQUFDO0lBQ25HLENBQUM7SUFGRCxnQ0FFQztJQUVELFNBQWdCLGlCQUFpQixDQUFDLE9BQVk7UUFDN0MsT0FBUSxPQUE0QixDQUFDLElBQUksS0FBSyxjQUFjLENBQUM7SUFDOUQsQ0FBQztJQUZELDhDQUVDO0lBRUQsU0FBZ0Isa0JBQWtCLENBQUMsT0FBWTtRQUM5QyxPQUFPLENBQUMsQ0FBRSxPQUE2QixDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUUsT0FBNkIsQ0FBQyxRQUFRLENBQUM7SUFDL0YsQ0FBQztJQUZELGdEQUVDO0lBRUQsU0FBZ0IsYUFBYSxDQUFDLE9BQVk7UUFDekMsT0FBTyxDQUFDLENBQUUsT0FBd0IsQ0FBQyxTQUFTLElBQUksa0JBQWtCLENBQUUsT0FBd0IsQ0FBQyxhQUFhLENB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