/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls!vs/workbench/browser/parts/auxiliarybar/auxiliaryBarActions", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/iconRegistry", "vs/platform/action/common/actionCommonCategories", "vs/workbench/common/contextkeys", "vs/workbench/common/views", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, codicons_1, nls_1, actions_1, contextkey_1, iconRegistry_1, actionCommonCategories_1, contextkeys_1, views_1, layoutService_1, panecomposite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ztb = void 0;
    const auxiliaryBarRightIcon = (0, iconRegistry_1.$9u)('auxiliarybar-right-layout-icon', codicons_1.$Pj.layoutSidebarRight, (0, nls_1.localize)(0, null));
    const auxiliaryBarRightOffIcon = (0, iconRegistry_1.$9u)('auxiliarybar-right-off-layout-icon', codicons_1.$Pj.layoutSidebarRightOff, (0, nls_1.localize)(1, null));
    const auxiliaryBarLeftIcon = (0, iconRegistry_1.$9u)('auxiliarybar-left-layout-icon', codicons_1.$Pj.layoutSidebarLeft, (0, nls_1.localize)(2, null));
    const auxiliaryBarLeftOffIcon = (0, iconRegistry_1.$9u)('auxiliarybar-left-off-layout-icon', codicons_1.$Pj.layoutSidebarLeftOff, (0, nls_1.localize)(3, null));
    class $ztb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.toggleAuxiliaryBar'; }
        static { this.LABEL = (0, nls_1.localize)(4, null); }
        constructor() {
            super({
                id: $ztb.ID,
                title: { value: $ztb.LABEL, original: 'Toggle Secondary Side Bar Visibility' },
                toggled: {
                    condition: contextkeys_1.$Adb,
                    title: (0, nls_1.localize)(5, null),
                    mnemonicTitle: (0, nls_1.localize)(6, null),
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 32 /* KeyCode.KeyB */
                },
                menu: [
                    {
                        id: actions_1.$Ru.LayoutControlMenuSubmenu,
                        group: '0_workbench_layout',
                        order: 1
                    },
                    {
                        id: actions_1.$Ru.MenubarAppearanceMenu,
                        group: '2_workbench_layout',
                        order: 2
                    }
                ]
            });
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.$Meb);
            layoutService.setPartHidden(layoutService.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */), "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
        }
    }
    exports.$ztb = $ztb;
    (0, actions_1.$Xu)($ztb);
    (0, actions_1.$Xu)(class FocusAuxiliaryBarAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.focusAuxiliaryBar'; }
        static { this.LABEL = (0, nls_1.localize)(7, null); }
        constructor() {
            super({
                id: FocusAuxiliaryBarAction.ID,
                title: { value: FocusAuxiliaryBarAction.LABEL, original: 'Focus into Secondary Side Bar' },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
            });
        }
        async run(accessor) {
            const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
            const layoutService = accessor.get(layoutService_1.$Meb);
            // Show auxiliary bar
            if (!layoutService.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */)) {
                layoutService.setPartHidden(false, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
            }
            // Focus into active composite
            const composite = paneCompositeService.getActivePaneComposite(2 /* ViewContainerLocation.AuxiliaryBar */);
            composite?.focus();
        }
    });
    actions_1.$Tu.appendMenuItems([
        {
            id: actions_1.$Ru.LayoutControlMenu,
            item: {
                group: '0_workbench_toggles',
                command: {
                    id: $ztb.ID,
                    title: (0, nls_1.localize)(8, null),
                    toggled: { condition: contextkeys_1.$Adb, icon: auxiliaryBarLeftIcon },
                    icon: auxiliaryBarLeftOffIcon,
                },
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.or(contextkey_1.$Ii.equals('config.workbench.layoutControl.type', 'toggles'), contextkey_1.$Ii.equals('config.workbench.layoutControl.type', 'both')), contextkey_1.$Ii.equals('config.workbench.sideBar.location', 'right')),
                order: 0
            }
        }, {
            id: actions_1.$Ru.LayoutControlMenu,
            item: {
                group: '0_workbench_toggles',
                command: {
                    id: $ztb.ID,
                    title: (0, nls_1.localize)(9, null),
                    toggled: { condition: contextkeys_1.$Adb, icon: auxiliaryBarRightIcon },
                    icon: auxiliaryBarRightOffIcon,
                },
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.or(contextkey_1.$Ii.equals('config.workbench.layoutControl.type', 'toggles'), contextkey_1.$Ii.equals('config.workbench.layoutControl.type', 'both')), contextkey_1.$Ii.equals('config.workbench.sideBar.location', 'left')),
                order: 2
            }
        }, {
            id: actions_1.$Ru.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: $ztb.ID,
                    title: { value: (0, nls_1.localize)(10, null), original: 'Hide Secondary Side Bar' },
                },
                when: contextkey_1.$Ii.and(contextkeys_1.$Adb, contextkey_1.$Ii.equals('viewLocation', (0, views_1.$0E)(2 /* ViewContainerLocation.AuxiliaryBar */))),
                order: 2
            }
        }
    ]);
});
//# sourceMappingURL=auxiliaryBarActions.js.map