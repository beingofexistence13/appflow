/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/actions/navigationActions", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/layout/browser/layoutService", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, nls_1, editorGroupsService_1, layoutService_1, actions_1, actionCommonCategories_1, editorService_1, panecomposite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BaseNavigationAction extends actions_1.$Wu {
        constructor(options, a) {
            super(options);
            this.a = a;
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.$Meb);
            const editorGroupService = accessor.get(editorGroupsService_1.$5C);
            const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
            const isEditorFocus = layoutService.hasFocus("workbench.parts.editor" /* Parts.EDITOR_PART */);
            const isPanelFocus = layoutService.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */);
            const isSidebarFocus = layoutService.hasFocus("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
            const isAuxiliaryBarFocus = layoutService.hasFocus("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
            let neighborPart;
            if (isEditorFocus) {
                const didNavigate = this.e(this.h(this.a), editorGroupService);
                if (didNavigate) {
                    return;
                }
                neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.editor" /* Parts.EDITOR_PART */, this.a);
            }
            if (isPanelFocus) {
                neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.panel" /* Parts.PANEL_PART */, this.a);
            }
            if (isSidebarFocus) {
                neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */, this.a);
            }
            if (isAuxiliaryBarFocus) {
                neighborPart = neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */, this.a);
            }
            if (neighborPart === "workbench.parts.editor" /* Parts.EDITOR_PART */) {
                if (!this.g(this.h(this.a), editorGroupService)) {
                    this.f(this.a === 3 /* Direction.Right */ ? 0 /* GroupLocation.FIRST */ : 1 /* GroupLocation.LAST */, editorGroupService);
                }
            }
            else if (neighborPart === "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) {
                this.c(layoutService, paneCompositeService);
            }
            else if (neighborPart === "workbench.parts.panel" /* Parts.PANEL_PART */) {
                this.b(layoutService, paneCompositeService);
            }
            else if (neighborPart === "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */) {
                this.d(layoutService, paneCompositeService);
            }
        }
        async b(layoutService, paneCompositeService) {
            if (!layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
                return false;
            }
            const activePanel = paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
            if (!activePanel) {
                return false;
            }
            const activePanelId = activePanel.getId();
            const res = await paneCompositeService.openPaneComposite(activePanelId, 1 /* ViewContainerLocation.Panel */, true);
            if (!res) {
                return false;
            }
            return res;
        }
        async c(layoutService, paneCompositeService) {
            if (!layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
                return false;
            }
            const activeViewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
            if (!activeViewlet) {
                return false;
            }
            const activeViewletId = activeViewlet.getId();
            const viewlet = await paneCompositeService.openPaneComposite(activeViewletId, 0 /* ViewContainerLocation.Sidebar */, true);
            return !!viewlet;
        }
        async d(layoutService, paneCompositeService) {
            if (!layoutService.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */)) {
                return false;
            }
            const activePanel = paneCompositeService.getActivePaneComposite(2 /* ViewContainerLocation.AuxiliaryBar */);
            if (!activePanel) {
                return false;
            }
            const activePanelId = activePanel.getId();
            const res = await paneCompositeService.openPaneComposite(activePanelId, 2 /* ViewContainerLocation.AuxiliaryBar */, true);
            if (!res) {
                return false;
            }
            return res;
        }
        e(direction, editorGroupService) {
            return this.j({ direction }, editorGroupService);
        }
        f(location, editorGroupService) {
            return this.j({ location }, editorGroupService);
        }
        g(direction, editorGroupService) {
            if (!editorGroupService.activeGroup) {
                return false;
            }
            const oppositeDirection = this.i(direction);
            // Check to see if there is a group in between the last
            // active group and the direction of movement
            const groupInBetween = editorGroupService.findGroup({ direction: oppositeDirection }, editorGroupService.activeGroup);
            if (!groupInBetween) {
                // No group in between means we can return
                // focus to the last active editor group
                editorGroupService.activeGroup.focus();
                return true;
            }
            return false;
        }
        h(direction) {
            switch (direction) {
                case 1 /* Direction.Down */: return 1 /* GroupDirection.DOWN */;
                case 2 /* Direction.Left */: return 2 /* GroupDirection.LEFT */;
                case 3 /* Direction.Right */: return 3 /* GroupDirection.RIGHT */;
                case 0 /* Direction.Up */: return 0 /* GroupDirection.UP */;
            }
        }
        i(direction) {
            switch (direction) {
                case 0 /* GroupDirection.UP */: return 1 /* GroupDirection.DOWN */;
                case 3 /* GroupDirection.RIGHT */: return 2 /* GroupDirection.LEFT */;
                case 2 /* GroupDirection.LEFT */: return 3 /* GroupDirection.RIGHT */;
                case 1 /* GroupDirection.DOWN */: return 0 /* GroupDirection.UP */;
            }
        }
        j(scope, editorGroupService) {
            const targetGroup = editorGroupService.findGroup(scope, editorGroupService.activeGroup);
            if (targetGroup) {
                targetGroup.focus();
                return true;
            }
            return false;
        }
    }
    (0, actions_1.$Xu)(class extends BaseNavigationAction {
        constructor() {
            super({
                id: 'workbench.action.navigateLeft',
                title: { value: (0, nls_1.localize)(0, null), original: 'Navigate to the View on the Left' },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            }, 2 /* Direction.Left */);
        }
    });
    (0, actions_1.$Xu)(class extends BaseNavigationAction {
        constructor() {
            super({
                id: 'workbench.action.navigateRight',
                title: { value: (0, nls_1.localize)(1, null), original: 'Navigate to the View on the Right' },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            }, 3 /* Direction.Right */);
        }
    });
    (0, actions_1.$Xu)(class extends BaseNavigationAction {
        constructor() {
            super({
                id: 'workbench.action.navigateUp',
                title: { value: (0, nls_1.localize)(2, null), original: 'Navigate to the View Above' },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            }, 0 /* Direction.Up */);
        }
    });
    (0, actions_1.$Xu)(class extends BaseNavigationAction {
        constructor() {
            super({
                id: 'workbench.action.navigateDown',
                title: { value: (0, nls_1.localize)(3, null), original: 'Navigate to the View Below' },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            }, 1 /* Direction.Down */);
        }
    });
    class BaseFocusAction extends actions_1.$Wu {
        constructor(options, a) {
            super(options);
            this.a = a;
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.$Meb);
            const editorService = accessor.get(editorService_1.$9C);
            this.c(layoutService, editorService, this.a);
        }
        b(layoutService, part, next) {
            let neighbour;
            switch (part) {
                case "workbench.parts.editor" /* Parts.EDITOR_PART */:
                    neighbour = next ? "workbench.parts.panel" /* Parts.PANEL_PART */ : "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */;
                    break;
                case "workbench.parts.panel" /* Parts.PANEL_PART */:
                    neighbour = next ? "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */ : "workbench.parts.editor" /* Parts.EDITOR_PART */;
                    break;
                case "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */:
                    neighbour = next ? "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */ : "workbench.parts.panel" /* Parts.PANEL_PART */;
                    break;
                case "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */:
                    neighbour = next ? "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */ : "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */;
                    break;
                case "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */:
                    neighbour = next ? "workbench.parts.editor" /* Parts.EDITOR_PART */ : "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */;
                    break;
                default:
                    neighbour = "workbench.parts.editor" /* Parts.EDITOR_PART */;
            }
            if (layoutService.isVisible(neighbour) || neighbour === "workbench.parts.editor" /* Parts.EDITOR_PART */) {
                return neighbour;
            }
            return this.b(layoutService, neighbour, next);
        }
        c(layoutService, editorService, next) {
            let currentlyFocusedPart;
            if (editorService.activeEditorPane?.hasFocus() || layoutService.hasFocus("workbench.parts.editor" /* Parts.EDITOR_PART */)) {
                currentlyFocusedPart = "workbench.parts.editor" /* Parts.EDITOR_PART */;
            }
            else if (layoutService.hasFocus("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */)) {
                currentlyFocusedPart = "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */;
            }
            else if (layoutService.hasFocus("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */)) {
                currentlyFocusedPart = "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */;
            }
            else if (layoutService.hasFocus("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
                currentlyFocusedPart = "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */;
            }
            else if (layoutService.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */)) {
                currentlyFocusedPart = "workbench.parts.panel" /* Parts.PANEL_PART */;
            }
            layoutService.focusPart(currentlyFocusedPart ? this.b(layoutService, currentlyFocusedPart, next) : "workbench.parts.editor" /* Parts.EDITOR_PART */);
        }
    }
    (0, actions_1.$Xu)(class extends BaseFocusAction {
        constructor() {
            super({
                id: 'workbench.action.focusNextPart',
                title: { value: (0, nls_1.localize)(4, null), original: 'Focus Next Part' },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                keybinding: {
                    primary: 64 /* KeyCode.F6 */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            }, true);
        }
    });
    (0, actions_1.$Xu)(class extends BaseFocusAction {
        constructor() {
            super({
                id: 'workbench.action.focusPreviousPart',
                title: { value: (0, nls_1.localize)(5, null), original: 'Focus Previous Part' },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                keybinding: {
                    primary: 1024 /* KeyMod.Shift */ | 64 /* KeyCode.F6 */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            }, false);
        }
    });
});
//# sourceMappingURL=navigationActions.js.map