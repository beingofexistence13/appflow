/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/iconRegistry", "vs/platform/action/common/actionCommonCategories", "vs/workbench/common/contextkeys", "vs/workbench/common/views", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/panecomposite/browser/panecomposite"], function (require, exports, codicons_1, nls_1, actions_1, contextkey_1, iconRegistry_1, actionCommonCategories_1, contextkeys_1, views_1, layoutService_1, panecomposite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ToggleAuxiliaryBarAction = void 0;
    const auxiliaryBarRightIcon = (0, iconRegistry_1.registerIcon)('auxiliarybar-right-layout-icon', codicons_1.Codicon.layoutSidebarRight, (0, nls_1.localize)('toggleAuxiliaryIconRight', 'Icon to toggle the auxiliary bar off in its right position.'));
    const auxiliaryBarRightOffIcon = (0, iconRegistry_1.registerIcon)('auxiliarybar-right-off-layout-icon', codicons_1.Codicon.layoutSidebarRightOff, (0, nls_1.localize)('toggleAuxiliaryIconRightOn', 'Icon to toggle the auxiliary bar on in its right position.'));
    const auxiliaryBarLeftIcon = (0, iconRegistry_1.registerIcon)('auxiliarybar-left-layout-icon', codicons_1.Codicon.layoutSidebarLeft, (0, nls_1.localize)('toggleAuxiliaryIconLeft', 'Icon to toggle the auxiliary bar in its left position.'));
    const auxiliaryBarLeftOffIcon = (0, iconRegistry_1.registerIcon)('auxiliarybar-left-off-layout-icon', codicons_1.Codicon.layoutSidebarLeftOff, (0, nls_1.localize)('toggleAuxiliaryIconLeftOn', 'Icon to toggle the auxiliary bar on in its left position.'));
    class ToggleAuxiliaryBarAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.toggleAuxiliaryBar'; }
        static { this.LABEL = (0, nls_1.localize)('toggleAuxiliaryBar', "Toggle Secondary Side Bar Visibility"); }
        constructor() {
            super({
                id: ToggleAuxiliaryBarAction.ID,
                title: { value: ToggleAuxiliaryBarAction.LABEL, original: 'Toggle Secondary Side Bar Visibility' },
                toggled: {
                    condition: contextkeys_1.AuxiliaryBarVisibleContext,
                    title: (0, nls_1.localize)('secondary sidebar', "Secondary Side Bar"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'secondary sidebar mnemonic', comment: ['&& denotes a mnemonic'] }, "Secondary Si&&de Bar"),
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 32 /* KeyCode.KeyB */
                },
                menu: [
                    {
                        id: actions_1.MenuId.LayoutControlMenuSubmenu,
                        group: '0_workbench_layout',
                        order: 1
                    },
                    {
                        id: actions_1.MenuId.MenubarAppearanceMenu,
                        group: '2_workbench_layout',
                        order: 2
                    }
                ]
            });
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            layoutService.setPartHidden(layoutService.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */), "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
        }
    }
    exports.ToggleAuxiliaryBarAction = ToggleAuxiliaryBarAction;
    (0, actions_1.registerAction2)(ToggleAuxiliaryBarAction);
    (0, actions_1.registerAction2)(class FocusAuxiliaryBarAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.focusAuxiliaryBar'; }
        static { this.LABEL = (0, nls_1.localize)('focusAuxiliaryBar', "Focus into Secondary Side Bar"); }
        constructor() {
            super({
                id: FocusAuxiliaryBarAction.ID,
                title: { value: FocusAuxiliaryBarAction.LABEL, original: 'Focus into Secondary Side Bar' },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
            });
        }
        async run(accessor) {
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            // Show auxiliary bar
            if (!layoutService.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */)) {
                layoutService.setPartHidden(false, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
            }
            // Focus into active composite
            const composite = paneCompositeService.getActivePaneComposite(2 /* ViewContainerLocation.AuxiliaryBar */);
            composite?.focus();
        }
    });
    actions_1.MenuRegistry.appendMenuItems([
        {
            id: actions_1.MenuId.LayoutControlMenu,
            item: {
                group: '0_workbench_toggles',
                command: {
                    id: ToggleAuxiliaryBarAction.ID,
                    title: (0, nls_1.localize)('toggleSecondarySideBar', "Toggle Secondary Side Bar"),
                    toggled: { condition: contextkeys_1.AuxiliaryBarVisibleContext, icon: auxiliaryBarLeftIcon },
                    icon: auxiliaryBarLeftOffIcon,
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.type', 'toggles'), contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.type', 'both')), contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'right')),
                order: 0
            }
        }, {
            id: actions_1.MenuId.LayoutControlMenu,
            item: {
                group: '0_workbench_toggles',
                command: {
                    id: ToggleAuxiliaryBarAction.ID,
                    title: (0, nls_1.localize)('toggleSecondarySideBar', "Toggle Secondary Side Bar"),
                    toggled: { condition: contextkeys_1.AuxiliaryBarVisibleContext, icon: auxiliaryBarRightIcon },
                    icon: auxiliaryBarRightOffIcon,
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.type', 'toggles'), contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.type', 'both')), contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'left')),
                order: 2
            }
        }, {
            id: actions_1.MenuId.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleAuxiliaryBarAction.ID,
                    title: { value: (0, nls_1.localize)('hideAuxiliaryBar', "Hide Secondary Side Bar"), original: 'Hide Secondary Side Bar' },
                },
                when: contextkey_1.ContextKeyExpr.and(contextkeys_1.AuxiliaryBarVisibleContext, contextkey_1.ContextKeyExpr.equals('viewLocation', (0, views_1.ViewContainerLocationToString)(2 /* ViewContainerLocation.AuxiliaryBar */))),
                order: 2
            }
        }
    ]);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV4aWxpYXJ5QmFyQWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL2F1eGlsaWFyeWJhci9hdXhpbGlhcnlCYXJBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWlCaEcsTUFBTSxxQkFBcUIsR0FBRyxJQUFBLDJCQUFZLEVBQUMsZ0NBQWdDLEVBQUUsa0JBQU8sQ0FBQyxrQkFBa0IsRUFBRSxJQUFBLGNBQVEsRUFBQywwQkFBMEIsRUFBRSw2REFBNkQsQ0FBQyxDQUFDLENBQUM7SUFDOU0sTUFBTSx3QkFBd0IsR0FBRyxJQUFBLDJCQUFZLEVBQUMsb0NBQW9DLEVBQUUsa0JBQU8sQ0FBQyxxQkFBcUIsRUFBRSxJQUFBLGNBQVEsRUFBQyw0QkFBNEIsRUFBRSw0REFBNEQsQ0FBQyxDQUFDLENBQUM7SUFDek4sTUFBTSxvQkFBb0IsR0FBRyxJQUFBLDJCQUFZLEVBQUMsK0JBQStCLEVBQUUsa0JBQU8sQ0FBQyxpQkFBaUIsRUFBRSxJQUFBLGNBQVEsRUFBQyx5QkFBeUIsRUFBRSx3REFBd0QsQ0FBQyxDQUFDLENBQUM7SUFDck0sTUFBTSx1QkFBdUIsR0FBRyxJQUFBLDJCQUFZLEVBQUMsbUNBQW1DLEVBQUUsa0JBQU8sQ0FBQyxvQkFBb0IsRUFBRSxJQUFBLGNBQVEsRUFBQywyQkFBMkIsRUFBRSwyREFBMkQsQ0FBQyxDQUFDLENBQUM7SUFFcE4sTUFBYSx3QkFBeUIsU0FBUSxpQkFBTztpQkFFcEMsT0FBRSxHQUFHLHFDQUFxQyxDQUFDO2lCQUMzQyxVQUFLLEdBQUcsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsc0NBQXNDLENBQUMsQ0FBQztRQUUvRjtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsd0JBQXdCLENBQUMsRUFBRTtnQkFDL0IsS0FBSyxFQUFFLEVBQUUsS0FB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