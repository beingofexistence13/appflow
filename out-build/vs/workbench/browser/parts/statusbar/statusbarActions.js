/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/statusbar/statusbarActions", "vs/workbench/services/statusbar/browser/statusbar", "vs/base/common/actions", "vs/workbench/services/layout/browser/layoutService", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/editor/common/editorService", "vs/workbench/common/contextkeys"], function (require, exports, nls_1, statusbar_1, actions_1, layoutService_1, keybindingsRegistry_1, actions_2, actionCommonCategories_1, editorService_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$dyb = exports.$cyb = void 0;
    class $cyb extends actions_1.$gi {
        constructor(id, label, a) {
            super(id, label, undefined, true);
            this.a = a;
            this.checked = !a.isHidden(id);
        }
        async run() {
            if (this.a.isHidden(this.id)) {
                this.a.show(this.id);
            }
            else {
                this.a.hide(this.id);
            }
        }
    }
    exports.$cyb = $cyb;
    class $dyb extends actions_1.$gi {
        constructor(id, name, a) {
            super(id, (0, nls_1.localize)(0, null, name), undefined, true);
            this.a = a;
        }
        async run() {
            this.a.hide(this.id);
        }
    }
    exports.$dyb = $dyb;
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'workbench.statusBar.focusPrevious',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 15 /* KeyCode.LeftArrow */,
        secondary: [16 /* KeyCode.UpArrow */],
        when: contextkeys_1.$tdb,
        handler: (accessor) => {
            const statusBarService = accessor.get(statusbar_1.$6$);
            statusBarService.focusPreviousEntry();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'workbench.statusBar.focusNext',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 17 /* KeyCode.RightArrow */,
        secondary: [18 /* KeyCode.DownArrow */],
        when: contextkeys_1.$tdb,
        handler: (accessor) => {
            const statusBarService = accessor.get(statusbar_1.$6$);
            statusBarService.focusNextEntry();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'workbench.statusBar.focusFirst',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 14 /* KeyCode.Home */,
        when: contextkeys_1.$tdb,
        handler: (accessor) => {
            const statusBarService = accessor.get(statusbar_1.$6$);
            statusBarService.focus(false);
            statusBarService.focusNextEntry();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'workbench.statusBar.focusLast',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 13 /* KeyCode.End */,
        when: contextkeys_1.$tdb,
        handler: (accessor) => {
            const statusBarService = accessor.get(statusbar_1.$6$);
            statusBarService.focus(false);
            statusBarService.focusPreviousEntry();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'workbench.statusBar.clearFocus',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        primary: 9 /* KeyCode.Escape */,
        when: contextkeys_1.$tdb,
        handler: (accessor) => {
            const statusBarService = accessor.get(statusbar_1.$6$);
            const editorService = accessor.get(editorService_1.$9C);
            if (statusBarService.isEntryFocused()) {
                statusBarService.focus(false);
            }
            else if (editorService.activeEditorPane) {
                editorService.activeEditorPane.focus();
            }
        }
    });
    class FocusStatusBarAction extends actions_2.$Wu {
        constructor() {
            super({
                id: 'workbench.action.focusStatusBar',
                title: { value: (0, nls_1.localize)(1, null), original: 'Focus Status Bar' },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            });
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.$Meb);
            layoutService.focusPart("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */);
        }
    }
    (0, actions_2.$Xu)(FocusStatusBarAction);
});
//# sourceMappingURL=statusbarActions.js.map