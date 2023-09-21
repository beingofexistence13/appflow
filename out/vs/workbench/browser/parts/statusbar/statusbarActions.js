/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/services/statusbar/browser/statusbar", "vs/base/common/actions", "vs/workbench/services/layout/browser/layoutService", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/editor/common/editorService", "vs/workbench/common/contextkeys"], function (require, exports, nls_1, statusbar_1, actions_1, layoutService_1, keybindingsRegistry_1, actions_2, actionCommonCategories_1, editorService_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HideStatusbarEntryAction = exports.ToggleStatusbarEntryVisibilityAction = void 0;
    class ToggleStatusbarEntryVisibilityAction extends actions_1.Action {
        constructor(id, label, model) {
            super(id, label, undefined, true);
            this.model = model;
            this.checked = !model.isHidden(id);
        }
        async run() {
            if (this.model.isHidden(this.id)) {
                this.model.show(this.id);
            }
            else {
                this.model.hide(this.id);
            }
        }
    }
    exports.ToggleStatusbarEntryVisibilityAction = ToggleStatusbarEntryVisibilityAction;
    class HideStatusbarEntryAction extends actions_1.Action {
        constructor(id, name, model) {
            super(id, (0, nls_1.localize)('hide', "Hide '{0}'", name), undefined, true);
            this.model = model;
        }
        async run() {
            this.model.hide(this.id);
        }
    }
    exports.HideStatusbarEntryAction = HideStatusbarEntryAction;
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.statusBar.focusPrevious',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 15 /* KeyCode.LeftArrow */,
        secondary: [16 /* KeyCode.UpArrow */],
        when: contextkeys_1.StatusBarFocused,
        handler: (accessor) => {
            const statusBarService = accessor.get(statusbar_1.IStatusbarService);
            statusBarService.focusPreviousEntry();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.statusBar.focusNext',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 17 /* KeyCode.RightArrow */,
        secondary: [18 /* KeyCode.DownArrow */],
        when: contextkeys_1.StatusBarFocused,
        handler: (accessor) => {
            const statusBarService = accessor.get(statusbar_1.IStatusbarService);
            statusBarService.focusNextEntry();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.statusBar.focusFirst',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 14 /* KeyCode.Home */,
        when: contextkeys_1.StatusBarFocused,
        handler: (accessor) => {
            const statusBarService = accessor.get(statusbar_1.IStatusbarService);
            statusBarService.focus(false);
            statusBarService.focusNextEntry();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.statusBar.focusLast',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 13 /* KeyCode.End */,
        when: contextkeys_1.StatusBarFocused,
        handler: (accessor) => {
            const statusBarService = accessor.get(statusbar_1.IStatusbarService);
            statusBarService.focus(false);
            statusBarService.focusPreviousEntry();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.statusBar.clearFocus',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 9 /* KeyCode.Escape */,
        when: contextkeys_1.StatusBarFocused,
        handler: (accessor) => {
            const statusBarService = accessor.get(statusbar_1.IStatusbarService);
            const editorService = accessor.get(editorService_1.IEditorService);
            if (statusBarService.isEntryFocused()) {
                statusBarService.focus(false);
            }
            else if (editorService.activeEditorPane) {
                editorService.activeEditorPane.focus();
            }
        }
    });
    class FocusStatusBarAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.focusStatusBar',
                title: { value: (0, nls_1.localize)('focusStatusBar', "Focus Status Bar"), original: 'Focus Status Bar' },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            });
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            layoutService.focusPart("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */);
        }
    }
    (0, actions_2.registerAction2)(FocusStatusBarAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzYmFyQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL3N0YXR1c2Jhci9zdGF0dXNiYXJBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWVoRyxNQUFhLG9DQUFxQyxTQUFRLGdCQUFNO1FBRS9ELFlBQVksRUFBVSxFQUFFLEtBQWEsRUFBVSxLQUF5QjtZQUN2RSxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFEWSxVQUFLLEdBQUwsS0FBSyxDQUFvQjtZQUd2RSxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBRVEsS0FBSyxDQUFDLEdBQUc7WUFDakIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUN6QjtpQkFBTTtnQkFDTixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDekI7UUFDRixDQUFDO0tBQ0Q7SUFmRCxvRkFlQztJQUVELE1BQWEsd0JBQXlCLFNBQVEsZ0JBQU07UUFFbkQsWUFBWSxFQUFVLEVBQUUsSUFBWSxFQUFVLEtBQXlCO1lBQ3RFLEtBQUssQ0FBQyxFQUFFLEVBQUUsSUFBQSxjQUFRLEVBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFEcEIsVUFBSyxHQUFMLEtBQUssQ0FBb0I7UUFFdkUsQ0FBQztRQUVRLEtBQUssQ0FB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