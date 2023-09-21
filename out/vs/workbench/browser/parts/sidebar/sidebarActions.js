/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/workbench/services/layout/browser/layoutService", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/css!./media/sidebarpart"], function (require, exports, nls_1, actions_1, layoutService_1, actionCommonCategories_1, panecomposite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FocusSideBarAction = void 0;
    class FocusSideBarAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.focusSideBar',
                title: { value: (0, nls_1.localize)('focusSideBar', "Focus into Primary Side Bar"), original: 'Focus into Primary Side Bar' },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: null,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 21 /* KeyCode.Digit0 */
                }
            });
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            // Show side bar
            if (!layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
                layoutService.setPartHidden(false, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
                return;
            }
            // Focus into active viewlet
            const viewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
            viewlet?.focus();
        }
    }
    exports.FocusSideBarAction = FocusSideBarAction;
    (0, actions_1.registerAction2)(FocusSideBarAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZWJhckFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy9zaWRlYmFyL3NpZGViYXJBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWFoRyxNQUFhLGtCQUFtQixTQUFRLGlCQUFPO1FBRTlDO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSwrQkFBK0I7Z0JBQ25DLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxjQUFjLEVBQUUsNkJBQTZCLENBQUMsRUFBRSxRQUFRLEVBQUUsNkJBQTZCLEVBQUU7Z0JBQ2xILFFBQVEsRUFBRSxtQ0FBVSxDQUFDLElBQUk7Z0JBQ3pCLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFVBQVUsRUFBRTtvQkFDWCxNQUFNLDZDQUFtQztvQkFDekMsSUFBSSxFQUFFLElBQUk7b0JBQ1YsT0FBTyxFQUFFLG1EQUErQjtpQkFDeEM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUNuQyxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHVDQUF1QixDQUFDLENBQUM7WUFDNUQsTUFBTSxvQkFBb0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHlDQUF5QixDQUFDLENBQUM7WUFFckUsZ0JBQWdCO1lBQ2hCLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxvREFBb0IsRUFBRTtnQkFDakQsYUFBYSxDQUFDLGFBQWEsQ0FBQyxLQUFLLHFEQUFxQixDQUFDO2dCQUN2RCxPQUFPO2FBQ1A7WUFFRCw0QkFBNEI7WUFDNUIsTUFBTSxPQUFPLEdBQUcsb0JBQW9CLENBQUMsc0JBQXNCLHVDQUErQixDQUFDO1lBQzNGLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztRQUNsQixDQUFDO0tBQ0Q7SUE5QkQsZ0RBOEJDO0lBRUQsSUFBQSx5QkFBZSxFQUFDLGtCQUFrQixDQUFDLENBQUMifQ==