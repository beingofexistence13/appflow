/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/sidebar/sidebarActions", "vs/platform/actions/common/actions", "vs/workbench/services/layout/browser/layoutService", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/css!./media/sidebarpart"], function (require, exports, nls_1, actions_1, layoutService_1, actionCommonCategories_1, panecomposite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9xb = void 0;
    class $9xb extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.focusSideBar',
                title: { value: (0, nls_1.localize)(0, null), original: 'Focus into Primary Side Bar' },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: null,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 21 /* KeyCode.Digit0 */
                }
            });
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.$Meb);
            const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
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
    exports.$9xb = $9xb;
    (0, actions_1.$Xu)($9xb);
});
//# sourceMappingURL=sidebarActions.js.map