/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/layout/browser/layoutService", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, nls_1, editorGroupsService_1, layoutService_1, actions_1, actionCommonCategories_1, editorService_1, panecomposite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BaseNavigationAction extends actions_1.Action2 {
        constructor(options, direction) {
            super(options);
            this.direction = direction;
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const isEditorFocus = layoutService.hasFocus("workbench.parts.editor" /* Parts.EDITOR_PART */);
            const isPanelFocus = layoutService.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */);
            const isSidebarFocus = layoutService.hasFocus("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
            const isAuxiliaryBarFocus = layoutService.hasFocus("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
            let neighborPart;
            if (isEditorFocus) {
                const didNavigate = this.navigateAcrossEditorGroup(this.toGroupDirection(this.direction), editorGroupService);
                if (didNavigate) {
                    return;
                }
                neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.editor" /* Parts.EDITOR_PART */, this.direction);
            }
            if (isPanelFocus) {
                neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.panel" /* Parts.PANEL_PART */, this.direction);
            }
            if (isSidebarFocus) {
                neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */, this.direction);
            }
            if (isAuxiliaryBarFocus) {
                neighborPart = neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */, this.direction);
            }
            if (neighborPart === "workbench.parts.editor" /* Parts.EDITOR_PART */) {
                if (!this.navigateBackToEditorGroup(this.toGroupDirection(this.direction), editorGroupService)) {
                    this.navigateToEditorGroup(this.direction === 3 /* Direction.Right */ ? 0 /* GroupLocation.FIRST */ : 1 /* GroupLocation.LAST */, editorGroupService);
                }
            }
            else if (neighborPart === "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) {
                this.navigateToSidebar(layoutService, paneCompositeService);
            }
            else if (neighborPart === "workbench.parts.panel" /* Parts.PANEL_PART */) {
                this.navigateToPanel(layoutService, paneCompositeService);
            }
            else if (neighborPart === "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */) {
                this.navigateToAuxiliaryBar(layoutService, paneCompositeService);
            }
        }
        async navigateToPanel(layoutService, paneCompositeService) {
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
        async navigateToSidebar(layoutService, paneCompositeService) {
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
        async navigateToAuxiliaryBar(layoutService, paneCompositeService) {
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
        navigateAcrossEditorGroup(direction, editorGroupService) {
            return this.doNavigateToEditorGroup({ direction }, editorGroupService);
        }
        navigateToEditorGroup(location, editorGroupService) {
            return this.doNavigateToEditorGroup({ location }, editorGroupService);
        }
        navigateBackToEditorGroup(direction, editorGroupService) {
            if (!editorGroupService.activeGroup) {
                return false;
            }
            const oppositeDirection = this.toOppositeDirection(direction);
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
        toGroupDirection(direction) {
            switch (direction) {
                case 1 /* Direction.Down */: return 1 /* GroupDirection.DOWN */;
                case 2 /* Direction.Left */: return 2 /* GroupDirection.LEFT */;
                case 3 /* Direction.Right */: return 3 /* GroupDirection.RIGHT */;
                case 0 /* Direction.Up */: return 0 /* GroupDirection.UP */;
            }
        }
        toOppositeDirection(direction) {
            switch (direction) {
                case 0 /* GroupDirection.UP */: return 1 /* GroupDirection.DOWN */;
                case 3 /* GroupDirection.RIGHT */: return 2 /* GroupDirection.LEFT */;
                case 2 /* GroupDirection.LEFT */: return 3 /* GroupDirection.RIGHT */;
                case 1 /* GroupDirection.DOWN */: return 0 /* GroupDirection.UP */;
            }
        }
        doNavigateToEditorGroup(scope, editorGroupService) {
            const targetGroup = editorGroupService.findGroup(scope, editorGroupService.activeGroup);
            if (targetGroup) {
                targetGroup.focus();
                return true;
            }
            return false;
        }
    }
    (0, actions_1.registerAction2)(class extends BaseNavigationAction {
        constructor() {
            super({
                id: 'workbench.action.navigateLeft',
                title: { value: (0, nls_1.localize)('navigateLeft', "Navigate to the View on the Left"), original: 'Navigate to the View on the Left' },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            }, 2 /* Direction.Left */);
        }
    });
    (0, actions_1.registerAction2)(class extends BaseNavigationAction {
        constructor() {
            super({
                id: 'workbench.action.navigateRight',
                title: { value: (0, nls_1.localize)('navigateRight', "Navigate to the View on the Right"), original: 'Navigate to the View on the Right' },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            }, 3 /* Direction.Right */);
        }
    });
    (0, actions_1.registerAction2)(class extends BaseNavigationAction {
        constructor() {
            super({
                id: 'workbench.action.navigateUp',
                title: { value: (0, nls_1.localize)('navigateUp', "Navigate to the View Above"), original: 'Navigate to the View Above' },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            }, 0 /* Direction.Up */);
        }
    });
    (0, actions_1.registerAction2)(class extends BaseNavigationAction {
        constructor() {
            super({
                id: 'workbench.action.navigateDown',
                title: { value: (0, nls_1.localize)('navigateDown', "Navigate to the View Below"), original: 'Navigate to the View Below' },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            }, 1 /* Direction.Down */);
        }
    });
    class BaseFocusAction extends actions_1.Action2 {
        constructor(options, focusNext) {
            super(options);
            this.focusNext = focusNext;
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            const editorService = accessor.get(editorService_1.IEditorService);
            this.focusNextOrPreviousPart(layoutService, editorService, this.focusNext);
        }
        findVisibleNeighbour(layoutService, part, next) {
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
            return this.findVisibleNeighbour(layoutService, neighbour, next);
        }
        focusNextOrPreviousPart(layoutService, editorService, next) {
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
            layoutService.focusPart(currentlyFocusedPart ? this.findVisibleNeighbour(layoutService, currentlyFocusedPart, next) : "workbench.parts.editor" /* Parts.EDITOR_PART */);
        }
    }
    (0, actions_1.registerAction2)(class extends BaseFocusAction {
        constructor() {
            super({
                id: 'workbench.action.focusNextPart',
                title: { value: (0, nls_1.localize)('focusNextPart', "Focus Next Part"), original: 'Focus Next Part' },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                keybinding: {
                    primary: 64 /* KeyCode.F6 */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            }, true);
        }
    });
    (0, actions_1.registerAction2)(class extends BaseFocusAction {
        constructor() {
            super({
                id: 'workbench.action.focusPreviousPart',
                title: { value: (0, nls_1.localize)('focusPreviousPart', "Focus Previous Part"), original: 'Focus Previous Part' },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                keybinding: {
                    primary: 1024 /* KeyMod.Shift */ | 64 /* KeyCode.F6 */,
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                }
            }, false);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2aWdhdGlvbkFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9hY3Rpb25zL25hdmlnYXRpb25BY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBaUJoRyxNQUFlLG9CQUFxQixTQUFRLGlCQUFPO1FBRWxELFlBQ0MsT0FBd0IsRUFDZCxTQUFvQjtZQUU5QixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFGTCxjQUFTLEdBQVQsU0FBUyxDQUFXO1FBRy9CLENBQUM7UUFFRCxHQUFHLENBQUMsUUFBMEI7WUFDN0IsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUIsQ0FBQyxDQUFDO1lBQzVELE1BQU0sa0JBQWtCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywwQ0FBb0IsQ0FBQyxDQUFDO1lBQzlELE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx5Q0FBeUIsQ0FBQyxDQUFDO1lBRXJFLE1BQU0sYUFBYSxHQUFHLGFBQWEsQ0FBQyxRQUFRLGtEQUFtQixDQUFDO1lBQ2hFLE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQyxRQUFRLGdEQUFrQixDQUFDO1lBQzlELE1BQU0sY0FBYyxHQUFHLGFBQWEsQ0FBQyxRQUFRLG9EQUFvQixDQUFDO1lBQ2xFLE1BQU0sbUJBQW1CLEdBQUcsYUFBYSxDQUFDLFFBQVEsOERBQXlCLENBQUM7WUFFNUUsSUFBSSxZQUErQixDQUFDO1lBQ3BDLElBQUksYUFBYSxFQUFFO2dCQUNsQixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO2dCQUM5RyxJQUFJLFdBQVcsRUFBRTtvQkFDaEIsT0FBTztpQkFD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