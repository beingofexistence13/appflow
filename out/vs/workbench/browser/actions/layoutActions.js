/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/platform/configuration/common/configuration", "vs/workbench/services/layout/browser/layoutService", "vs/platform/instantiation/common/instantiation", "vs/base/common/keyCodes", "vs/base/common/platform", "vs/platform/contextkey/common/contextkeys", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/views", "vs/platform/quickinput/common/quickInput", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/browser/parts/auxiliarybar/auxiliaryBarActions", "vs/workbench/browser/parts/panel/panelActions", "vs/platform/commands/common/commands", "vs/workbench/common/contextkeys", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/lifecycle", "vs/platform/theme/common/iconRegistry"], function (require, exports, nls_1, actions_1, actionCommonCategories_1, configuration_1, layoutService_1, instantiation_1, keyCodes_1, platform_1, contextkeys_1, keybindingsRegistry_1, contextkey_1, views_1, quickInput_1, dialogs_1, panecomposite_1, auxiliaryBarActions_1, panelActions_1, commands_1, contextkeys_2, codicons_1, themables_1, lifecycle_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ToggleTabsVisibilityAction = exports.ToggleStatusbarVisibilityAction = exports.ToggleSidebarPositionAction = exports.ToggleActivityBarVisibilityAction = void 0;
    // Register Icons
    const menubarIcon = (0, iconRegistry_1.registerIcon)('menuBar', codicons_1.Codicon.layoutMenubar, (0, nls_1.localize)('menuBarIcon', "Represents the menu bar"));
    const activityBarLeftIcon = (0, iconRegistry_1.registerIcon)('activity-bar-left', codicons_1.Codicon.layoutActivitybarLeft, (0, nls_1.localize)('activityBarLeft', "Represents the activity bar in the left position"));
    const activityBarRightIcon = (0, iconRegistry_1.registerIcon)('activity-bar-right', codicons_1.Codicon.layoutActivitybarRight, (0, nls_1.localize)('activityBarRight', "Represents the activity bar in the right position"));
    const panelLeftIcon = (0, iconRegistry_1.registerIcon)('panel-left', codicons_1.Codicon.layoutSidebarLeft, (0, nls_1.localize)('panelLeft', "Represents a side bar in the left position"));
    const panelLeftOffIcon = (0, iconRegistry_1.registerIcon)('panel-left-off', codicons_1.Codicon.layoutSidebarLeftOff, (0, nls_1.localize)('panelLeftOff', "Represents a side bar in the left position toggled off"));
    const panelRightIcon = (0, iconRegistry_1.registerIcon)('panel-right', codicons_1.Codicon.layoutSidebarRight, (0, nls_1.localize)('panelRight', "Represents side bar in the right position"));
    const panelRightOffIcon = (0, iconRegistry_1.registerIcon)('panel-right-off', codicons_1.Codicon.layoutSidebarRightOff, (0, nls_1.localize)('panelRightOff', "Represents side bar in the right position toggled off"));
    const panelIcon = (0, iconRegistry_1.registerIcon)('panel-bottom', codicons_1.Codicon.layoutPanel, (0, nls_1.localize)('panelBottom', "Represents the bottom panel"));
    const statusBarIcon = (0, iconRegistry_1.registerIcon)('statusBar', codicons_1.Codicon.layoutStatusbar, (0, nls_1.localize)('statusBarIcon', "Represents the status bar"));
    const panelAlignmentLeftIcon = (0, iconRegistry_1.registerIcon)('panel-align-left', codicons_1.Codicon.layoutPanelLeft, (0, nls_1.localize)('panelBottomLeft', "Represents the bottom panel alignment set to the left"));
    const panelAlignmentRightIcon = (0, iconRegistry_1.registerIcon)('panel-align-right', codicons_1.Codicon.layoutPanelRight, (0, nls_1.localize)('panelBottomRight', "Represents the bottom panel alignment set to the right"));
    const panelAlignmentCenterIcon = (0, iconRegistry_1.registerIcon)('panel-align-center', codicons_1.Codicon.layoutPanelCenter, (0, nls_1.localize)('panelBottomCenter', "Represents the bottom panel alignment set to the center"));
    const panelAlignmentJustifyIcon = (0, iconRegistry_1.registerIcon)('panel-align-justify', codicons_1.Codicon.layoutPanelJustify, (0, nls_1.localize)('panelBottomJustify', "Represents the bottom panel alignment set to justified"));
    const fullscreenIcon = (0, iconRegistry_1.registerIcon)('fullscreen', codicons_1.Codicon.screenFull, (0, nls_1.localize)('fullScreenIcon', "Represents full screen"));
    const centerLayoutIcon = (0, iconRegistry_1.registerIcon)('centerLayoutIcon', codicons_1.Codicon.layoutCentered, (0, nls_1.localize)('centerLayoutIcon', "Represents centered layout mode"));
    const zenModeIcon = (0, iconRegistry_1.registerIcon)('zenMode', codicons_1.Codicon.target, (0, nls_1.localize)('zenModeIcon', "Represents zen mode"));
    // --- Close Side Bar
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.closeSidebar',
                title: { value: (0, nls_1.localize)('closeSidebar', "Close Primary Side Bar"), original: 'Close Primary Side Bar' },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            });
        }
        run(accessor) {
            accessor.get(layoutService_1.IWorkbenchLayoutService).setPartHidden(true, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
        }
    });
    // --- Toggle Activity Bar
    class ToggleActivityBarVisibilityAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.toggleActivityBarVisibility'; }
        static { this.activityBarVisibleKey = 'workbench.activityBar.visible'; }
        constructor() {
            super({
                id: ToggleActivityBarVisibilityAction.ID,
                title: {
                    value: (0, nls_1.localize)('toggleActivityBar', "Toggle Activity Bar Visibility"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miActivityBar', comment: ['&& denotes a mnemonic'] }, "&&Activity Bar"),
                    original: 'Toggle Activity Bar Visibility'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                toggled: contextkey_1.ContextKeyExpr.equals('config.workbench.activityBar.visible', true),
                menu: [{
                        id: actions_1.MenuId.MenubarAppearanceMenu,
                        group: '2_workbench_layout',
                        order: 4
                    }]
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const visibility = layoutService.isVisible("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */);
            const newVisibilityValue = !visibility;
            configurationService.updateValue(ToggleActivityBarVisibilityAction.activityBarVisibleKey, newVisibilityValue);
        }
    }
    exports.ToggleActivityBarVisibilityAction = ToggleActivityBarVisibilityAction;
    (0, actions_1.registerAction2)(ToggleActivityBarVisibilityAction);
    // --- Toggle Centered Layout
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.toggleCenteredLayout',
                title: {
                    value: (0, nls_1.localize)('toggleCenteredLayout', "Toggle Centered Layout"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miToggleCenteredLayout', comment: ['&& denotes a mnemonic'] }, "&&Centered Layout"),
                    original: 'Toggle Centered Layout'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                toggled: contextkeys_2.IsCenteredLayoutContext,
                menu: [{
                        id: actions_1.MenuId.MenubarAppearanceMenu,
                        group: '1_toggle_view',
                        order: 3
                    }]
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            layoutService.centerEditorLayout(!layoutService.isEditorLayoutCentered());
        }
    });
    // --- Set Sidebar Position
    const sidebarPositionConfigurationKey = 'workbench.sideBar.location';
    class MoveSidebarPositionAction extends actions_1.Action2 {
        constructor(id, title, position) {
            super({
                id,
                title,
                f1: false
            });
            this.position = position;
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const position = layoutService.getSideBarPosition();
            if (position !== this.position) {
                return configurationService.updateValue(sidebarPositionConfigurationKey, (0, layoutService_1.positionToString)(this.position));
            }
        }
    }
    class MoveSidebarRightAction extends MoveSidebarPositionAction {
        static { this.ID = 'workbench.action.moveSideBarRight'; }
        constructor() {
            super(MoveSidebarRightAction.ID, {
                value: (0, nls_1.localize)('moveSidebarRight', "Move Primary Side Bar Right"),
                original: 'Move Primary Side Bar Right'
            }, 1 /* Position.RIGHT */);
        }
    }
    class MoveSidebarLeftAction extends MoveSidebarPositionAction {
        static { this.ID = 'workbench.action.moveSideBarLeft'; }
        constructor() {
            super(MoveSidebarLeftAction.ID, {
                value: (0, nls_1.localize)('moveSidebarLeft', "Move Primary Side Bar Left"),
                original: 'Move Primary Side Bar Left'
            }, 0 /* Position.LEFT */);
        }
    }
    (0, actions_1.registerAction2)(MoveSidebarRightAction);
    (0, actions_1.registerAction2)(MoveSidebarLeftAction);
    // --- Toggle Sidebar Position
    class ToggleSidebarPositionAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.toggleSidebarPosition'; }
        static { this.LABEL = (0, nls_1.localize)('toggleSidebarPosition', "Toggle Primary Side Bar Position"); }
        static getLabel(layoutService) {
            return layoutService.getSideBarPosition() === 0 /* Position.LEFT */ ? (0, nls_1.localize)('moveSidebarRight', "Move Primary Side Bar Right") : (0, nls_1.localize)('moveSidebarLeft', "Move Primary Side Bar Left");
        }
        constructor() {
            super({
                id: ToggleSidebarPositionAction.ID,
                title: { value: (0, nls_1.localize)('toggleSidebarPosition', "Toggle Primary Side Bar Position"), original: 'Toggle Primary Side Bar Position' },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const position = layoutService.getSideBarPosition();
            const newPositionValue = (position === 0 /* Position.LEFT */) ? 'right' : 'left';
            return configurationService.updateValue(sidebarPositionConfigurationKey, newPositionValue);
        }
    }
    exports.ToggleSidebarPositionAction = ToggleSidebarPositionAction;
    (0, actions_1.registerAction2)(ToggleSidebarPositionAction);
    const configureLayoutIcon = (0, iconRegistry_1.registerIcon)('configure-layout-icon', codicons_1.Codicon.layout, (0, nls_1.localize)('cofigureLayoutIcon', 'Icon represents workbench layout configuration.'));
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.LayoutControlMenu, {
        submenu: actions_1.MenuId.LayoutControlMenuSubmenu,
        title: (0, nls_1.localize)('configureLayout', "Configure Layout"),
        icon: configureLayoutIcon,
        group: '1_workbench_layout',
        when: contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.type', 'menu')
    });
    actions_1.MenuRegistry.appendMenuItems([{
            id: actions_1.MenuId.ViewContainerTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarPositionAction.ID,
                    title: (0, nls_1.localize)('move side bar right', "Move Primary Side Bar Right")
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.notEquals('config.workbench.sideBar.location', 'right'), contextkey_1.ContextKeyExpr.equals('viewContainerLocation', (0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */))),
                order: 1
            }
        }, {
            id: actions_1.MenuId.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarPositionAction.ID,
                    title: (0, nls_1.localize)('move sidebar right', "Move Primary Side Bar Right")
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.notEquals('config.workbench.sideBar.location', 'right'), contextkey_1.ContextKeyExpr.equals('viewLocation', (0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */))),
                order: 1
            }
        }, {
            id: actions_1.MenuId.ViewContainerTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarPositionAction.ID,
                    title: (0, nls_1.localize)('move sidebar left', "Move Primary Side Bar Left")
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'right'), contextkey_1.ContextKeyExpr.equals('viewContainerLocation', (0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */))),
                order: 1
            }
        }, {
            id: actions_1.MenuId.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarPositionAction.ID,
                    title: (0, nls_1.localize)('move sidebar left', "Move Primary Side Bar Left")
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'right'), contextkey_1.ContextKeyExpr.equals('viewLocation', (0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */))),
                order: 1
            }
        }, {
            id: actions_1.MenuId.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarPositionAction.ID,
                    title: (0, nls_1.localize)('move second sidebar left', "Move Secondary Side Bar Left")
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.notEquals('config.workbench.sideBar.location', 'right'), contextkey_1.ContextKeyExpr.equals('viewLocation', (0, views_1.ViewContainerLocationToString)(2 /* ViewContainerLocation.AuxiliaryBar */))),
                order: 1
            }
        }, {
            id: actions_1.MenuId.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarPositionAction.ID,
                    title: (0, nls_1.localize)('move second sidebar right', "Move Secondary Side Bar Right")
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'right'), contextkey_1.ContextKeyExpr.equals('viewLocation', (0, views_1.ViewContainerLocationToString)(2 /* ViewContainerLocation.AuxiliaryBar */))),
                order: 1
            }
        }]);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarAppearanceMenu, {
        group: '3_workbench_layout_move',
        command: {
            id: ToggleSidebarPositionAction.ID,
            title: (0, nls_1.localize)({ key: 'miMoveSidebarRight', comment: ['&& denotes a mnemonic'] }, "&&Move Primary Side Bar Right")
        },
        when: contextkey_1.ContextKeyExpr.notEquals('config.workbench.sideBar.location', 'right'),
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarAppearanceMenu, {
        group: '3_workbench_layout_move',
        command: {
            id: ToggleSidebarPositionAction.ID,
            title: (0, nls_1.localize)({ key: 'miMoveSidebarLeft', comment: ['&& denotes a mnemonic'] }, "&&Move Primary Side Bar Left")
        },
        when: contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'right'),
        order: 2
    });
    // --- Toggle Editor Visibility
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.toggleEditorVisibility',
                title: {
                    value: (0, nls_1.localize)('toggleEditor', "Toggle Editor Area Visibility"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miShowEditorArea', comment: ['&& denotes a mnemonic'] }, "Show &&Editor Area"),
                    original: 'Toggle Editor Area Visibility'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                toggled: contextkeys_2.EditorAreaVisibleContext,
                // the workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
                precondition: contextkey_1.ContextKeyExpr.or(contextkeys_2.PanelAlignmentContext.isEqualTo('center'), contextkeys_2.PanelPositionContext.notEqualsTo('bottom'))
            });
        }
        run(accessor) {
            accessor.get(layoutService_1.IWorkbenchLayoutService).toggleMaximizedPanel();
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarViewMenu, {
        group: '2_appearance',
        title: (0, nls_1.localize)({ key: 'miAppearance', comment: ['&& denotes a mnemonic'] }, "&&Appearance"),
        submenu: actions_1.MenuId.MenubarAppearanceMenu,
        order: 1
    });
    // Toggle Sidebar Visibility
    class ToggleSidebarVisibilityAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.toggleSidebarVisibility'; }
        constructor() {
            super({
                id: ToggleSidebarVisibilityAction.ID,
                title: { value: (0, nls_1.localize)('toggleSidebar', "Toggle Primary Side Bar Visibility"), original: 'Toggle Primary Side Bar Visibility' },
                toggled: {
                    condition: contextkeys_2.SideBarVisibleContext,
                    title: (0, nls_1.localize)('primary sidebar', "Primary Side Bar"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'primary sidebar mnemonic', comment: ['&& denotes a mnemonic'] }, "&&Primary Side Bar"),
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */
                },
                menu: [
                    {
                        id: actions_1.MenuId.LayoutControlMenuSubmenu,
                        group: '0_workbench_layout',
                        order: 0
                    },
                    {
                        id: actions_1.MenuId.MenubarAppearanceMenu,
                        group: '2_workbench_layout',
                        order: 1
                    }
                ]
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            layoutService.setPartHidden(layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */), "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
        }
    }
    (0, actions_1.registerAction2)(ToggleSidebarVisibilityAction);
    actions_1.MenuRegistry.appendMenuItems([
        {
            id: actions_1.MenuId.ViewContainerTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarVisibilityAction.ID,
                    title: (0, nls_1.localize)('compositePart.hideSideBarLabel', "Hide Primary Side Bar"),
                },
                when: contextkey_1.ContextKeyExpr.and(contextkeys_2.SideBarVisibleContext, contextkey_1.ContextKeyExpr.equals('viewContainerLocation', (0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */))),
                order: 2
            }
        }, {
            id: actions_1.MenuId.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarVisibilityAction.ID,
                    title: (0, nls_1.localize)('compositePart.hideSideBarLabel', "Hide Primary Side Bar"),
                },
                when: contextkey_1.ContextKeyExpr.and(contextkeys_2.SideBarVisibleContext, contextkey_1.ContextKeyExpr.equals('viewLocation', (0, views_1.ViewContainerLocationToString)(0 /* ViewContainerLocation.Sidebar */))),
                order: 2
            }
        }, {
            id: actions_1.MenuId.LayoutControlMenu,
            item: {
                group: '0_workbench_toggles',
                command: {
                    id: ToggleSidebarVisibilityAction.ID,
                    title: (0, nls_1.localize)('toggleSideBar', "Toggle Primary Side Bar"),
                    icon: panelLeftOffIcon,
                    toggled: { condition: contextkeys_2.SideBarVisibleContext, icon: panelLeftIcon }
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.type', 'toggles'), contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.type', 'both')), contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'left')),
                order: 0
            }
        }, {
            id: actions_1.MenuId.LayoutControlMenu,
            item: {
                group: '0_workbench_toggles',
                command: {
                    id: ToggleSidebarVisibilityAction.ID,
                    title: (0, nls_1.localize)('toggleSideBar', "Toggle Primary Side Bar"),
                    icon: panelRightOffIcon,
                    toggled: { condition: contextkeys_2.SideBarVisibleContext, icon: panelRightIcon }
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.type', 'toggles'), contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.type', 'both')), contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'right')),
                order: 2
            }
        }
    ]);
    // --- Toggle Statusbar Visibility
    class ToggleStatusbarVisibilityAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.toggleStatusbarVisibility'; }
        static { this.statusbarVisibleKey = 'workbench.statusBar.visible'; }
        constructor() {
            super({
                id: ToggleStatusbarVisibilityAction.ID,
                title: {
                    value: (0, nls_1.localize)('toggleStatusbar', "Toggle Status Bar Visibility"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miStatusbar', comment: ['&& denotes a mnemonic'] }, "S&&tatus Bar"),
                    original: 'Toggle Status Bar Visibility'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                toggled: contextkey_1.ContextKeyExpr.equals('config.workbench.statusBar.visible', true),
                menu: [{
                        id: actions_1.MenuId.MenubarAppearanceMenu,
                        group: '2_workbench_layout',
                        order: 3
                    }]
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const visibility = layoutService.isVisible("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */);
            const newVisibilityValue = !visibility;
            return configurationService.updateValue(ToggleStatusbarVisibilityAction.statusbarVisibleKey, newVisibilityValue);
        }
    }
    exports.ToggleStatusbarVisibilityAction = ToggleStatusbarVisibilityAction;
    (0, actions_1.registerAction2)(ToggleStatusbarVisibilityAction);
    // --- Toggle Tabs Visibility
    class ToggleTabsVisibilityAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.toggleTabsVisibility'; }
        constructor() {
            super({
                id: ToggleTabsVisibilityAction.ID,
                title: {
                    value: (0, nls_1.localize)('toggleTabs', "Toggle Tab Visibility"),
                    original: 'Toggle Tab Visibility'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            });
        }
        run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const visibility = configurationService.getValue('workbench.editor.showTabs');
            const newVisibilityValue = !visibility;
            return configurationService.updateValue('workbench.editor.showTabs', newVisibilityValue);
        }
    }
    exports.ToggleTabsVisibilityAction = ToggleTabsVisibilityAction;
    (0, actions_1.registerAction2)(ToggleTabsVisibilityAction);
    // --- Toggle Zen Mode
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.toggleZenMode',
                title: {
                    value: (0, nls_1.localize)('toggleZenMode', "Toggle Zen Mode"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'miToggleZenMode', comment: ['&& denotes a mnemonic'] }, "Zen Mode"),
                    original: 'Toggle Zen Mode'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 56 /* KeyCode.KeyZ */)
                },
                toggled: contextkeys_2.InEditorZenModeContext,
                menu: [{
                        id: actions_1.MenuId.MenubarAppearanceMenu,
                        group: '1_toggle_view',
                        order: 2
                    }]
            });
        }
        run(accessor) {
            return accessor.get(layoutService_1.IWorkbenchLayoutService).toggleZenMode();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.action.exitZenMode',
        weight: 100 /* KeybindingWeight.EditorContrib */ - 1000,
        handler(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            if (contextkeys_2.InEditorZenModeContext.getValue(contextKeyService)) {
                layoutService.toggleZenMode();
            }
        },
        when: contextkeys_2.InEditorZenModeContext,
        primary: (0, keyCodes_1.KeyChord)(9 /* KeyCode.Escape */, 9 /* KeyCode.Escape */)
    });
    // --- Toggle Menu Bar
    if (platform_1.isWindows || platform_1.isLinux || platform_1.isWeb) {
        (0, actions_1.registerAction2)(class ToggleMenubarAction extends actions_1.Action2 {
            constructor() {
                super({
                    id: 'workbench.action.toggleMenuBar',
                    title: {
                        value: (0, nls_1.localize)('toggleMenuBar', "Toggle Menu Bar"),
                        mnemonicTitle: (0, nls_1.localize)({ key: 'miMenuBar', comment: ['&& denotes a mnemonic'] }, "Menu &&Bar"),
                        original: 'Toggle Menu Bar'
                    },
                    category: actionCommonCategories_1.Categories.View,
                    f1: true,
                    toggled: contextkey_1.ContextKeyExpr.and(contextkeys_1.IsMacNativeContext.toNegated(), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'hidden'), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'toggle'), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'compact')),
                    menu: [{
                            id: actions_1.MenuId.MenubarAppearanceMenu,
                            group: '2_workbench_layout',
                            order: 0
                        }]
                });
            }
            run(accessor) {
                return accessor.get(layoutService_1.IWorkbenchLayoutService).toggleMenuBar();
            }
        });
        // Add separately to title bar context menu so we can use a different title
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.TitleBarContext, {
            command: {
                id: 'workbench.action.toggleMenuBar',
                title: (0, nls_1.localize)('miMenuBarNoMnemonic', "Menu Bar"),
                toggled: contextkey_1.ContextKeyExpr.and(contextkeys_1.IsMacNativeContext.toNegated(), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'hidden'), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'toggle'), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'compact'))
            },
            order: 0
        });
    }
    // --- Reset View Locations
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.resetViewLocations',
                title: {
                    value: (0, nls_1.localize)('resetViewLocations', "Reset View Locations"),
                    original: 'Reset View Locations'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            });
        }
        run(accessor) {
            return accessor.get(views_1.IViewDescriptorService).reset();
        }
    });
    // --- Move View
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.moveView',
                title: {
                    value: (0, nls_1.localize)('moveView', "Move View"),
                    original: 'Move View'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            });
        }
        async run(accessor) {
            const viewDescriptorService = accessor.get(views_1.IViewDescriptorService);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const paneCompositePartService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const focusedViewId = contextkeys_2.FocusedViewContext.getValue(contextKeyService);
            let viewId;
            if (focusedViewId && viewDescriptorService.getViewDescriptorById(focusedViewId)?.canMoveView) {
                viewId = focusedViewId;
            }
            try {
                viewId = await this.getView(quickInputService, viewDescriptorService, paneCompositePartService, viewId);
                if (!viewId) {
                    return;
                }
                const moveFocusedViewAction = new MoveFocusedViewAction();
                instantiationService.invokeFunction(accessor => moveFocusedViewAction.run(accessor, viewId));
            }
            catch { }
        }
        getViewItems(viewDescriptorService, paneCompositePartService) {
            const results = [];
            const viewlets = paneCompositePartService.getVisiblePaneCompositeIds(0 /* ViewContainerLocation.Sidebar */);
            viewlets.forEach(viewletId => {
                const container = viewDescriptorService.getViewContainerById(viewletId);
                const containerModel = viewDescriptorService.getViewContainerModel(container);
                let hasAddedView = false;
                containerModel.visibleViewDescriptors.forEach(viewDescriptor => {
                    if (viewDescriptor.canMoveView) {
                        if (!hasAddedView) {
                            results.push({
                                type: 'separator',
                                label: (0, nls_1.localize)('sidebarContainer', "Side Bar / {0}", containerModel.title)
                            });
                            hasAddedView = true;
                        }
                        results.push({
                            id: viewDescriptor.id,
                            label: viewDescriptor.name
                        });
                    }
                });
            });
            const panels = paneCompositePartService.getPinnedPaneCompositeIds(1 /* ViewContainerLocation.Panel */);
            panels.forEach(panel => {
                const container = viewDescriptorService.getViewContainerById(panel);
                const containerModel = viewDescriptorService.getViewContainerModel(container);
                let hasAddedView = false;
                containerModel.visibleViewDescriptors.forEach(viewDescriptor => {
                    if (viewDescriptor.canMoveView) {
                        if (!hasAddedView) {
                            results.push({
                                type: 'separator',
                                label: (0, nls_1.localize)('panelContainer', "Panel / {0}", containerModel.title)
                            });
                            hasAddedView = true;
                        }
                        results.push({
                            id: viewDescriptor.id,
                            label: viewDescriptor.name
                        });
                    }
                });
            });
            const sidePanels = paneCompositePartService.getPinnedPaneCompositeIds(2 /* ViewContainerLocation.AuxiliaryBar */);
            sidePanels.forEach(panel => {
                const container = viewDescriptorService.getViewContainerById(panel);
                const containerModel = viewDescriptorService.getViewContainerModel(container);
                let hasAddedView = false;
                containerModel.visibleViewDescriptors.forEach(viewDescriptor => {
                    if (viewDescriptor.canMoveView) {
                        if (!hasAddedView) {
                            results.push({
                                type: 'separator',
                                label: (0, nls_1.localize)('secondarySideBarContainer', "Secondary Side Bar / {0}", containerModel.title)
                            });
                            hasAddedView = true;
                        }
                        results.push({
                            id: viewDescriptor.id,
                            label: viewDescriptor.name
                        });
                    }
                });
            });
            return results;
        }
        async getView(quickInputService, viewDescriptorService, paneCompositePartService, viewId) {
            const quickPick = quickInputService.createQuickPick();
            quickPick.placeholder = (0, nls_1.localize)('moveFocusedView.selectView', "Select a View to Move");
            quickPick.items = this.getViewItems(viewDescriptorService, paneCompositePartService);
            quickPick.selectedItems = quickPick.items.filter(item => item.id === viewId);
            return new Promise((resolve, reject) => {
                quickPick.onDidAccept(() => {
                    const viewId = quickPick.selectedItems[0];
                    if (viewId.id) {
                        resolve(viewId.id);
                    }
                    else {
                        reject();
                    }
                    quickPick.hide();
                });
                quickPick.onDidHide(() => reject());
                quickPick.show();
            });
        }
    });
    // --- Move Focused View
    class MoveFocusedViewAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.moveFocusedView',
                title: {
                    value: (0, nls_1.localize)('moveFocusedView', "Move Focused View"),
                    original: 'Move Focused View'
                },
                category: actionCommonCategories_1.Categories.View,
                precondition: contextkeys_2.FocusedViewContext.notEqualsTo(''),
                f1: true
            });
        }
        run(accessor, viewId) {
            const viewDescriptorService = accessor.get(views_1.IViewDescriptorService);
            const viewsService = accessor.get(views_1.IViewsService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const paneCompositePartService = accessor.get(panecomposite_1.IPaneCompositePartService);
            const focusedViewId = viewId || contextkeys_2.FocusedViewContext.getValue(contextKeyService);
            if (focusedViewId === undefined || focusedViewId.trim() === '') {
                dialogService.error((0, nls_1.localize)('moveFocusedView.error.noFocusedView', "There is no view currently focused."));
                return;
            }
            const viewDescriptor = viewDescriptorService.getViewDescriptorById(focusedViewId);
            if (!viewDescriptor || !viewDescriptor.canMoveView) {
                dialogService.error((0, nls_1.localize)('moveFocusedView.error.nonMovableView', "The currently focused view is not movable."));
                return;
            }
            const quickPick = quickInputService.createQuickPick();
            quickPick.placeholder = (0, nls_1.localize)('moveFocusedView.selectDestination', "Select a Destination for the View");
            quickPick.title = (0, nls_1.localize)({ key: 'moveFocusedView.title', comment: ['{0} indicates the title of the view the user has selected to move.'] }, "View: Move {0}", viewDescriptor.name);
            const items = [];
            const currentContainer = viewDescriptorService.getViewContainerByViewId(focusedViewId);
            const currentLocation = viewDescriptorService.getViewLocationById(focusedViewId);
            const isViewSolo = viewDescriptorService.getViewContainerModel(currentContainer).allViewDescriptors.length === 1;
            if (!(isViewSolo && currentLocation === 1 /* ViewContainerLocation.Panel */)) {
                items.push({
                    id: '_.panel.newcontainer',
                    label: (0, nls_1.localize)({ key: 'moveFocusedView.newContainerInPanel', comment: ['Creates a new top-level tab in the panel.'] }, "New Panel Entry"),
                });
            }
            if (!(isViewSolo && currentLocation === 0 /* ViewContainerLocation.Sidebar */)) {
                items.push({
                    id: '_.sidebar.newcontainer',
                    label: (0, nls_1.localize)('moveFocusedView.newContainerInSidebar', "New Side Bar Entry")
                });
            }
            if (!(isViewSolo && currentLocation === 2 /* ViewContainerLocation.AuxiliaryBar */)) {
                items.push({
                    id: '_.auxiliarybar.newcontainer',
                    label: (0, nls_1.localize)('moveFocusedView.newContainerInSidePanel', "New Secondary Side Bar Entry")
                });
            }
            items.push({
                type: 'separator',
                label: (0, nls_1.localize)('sidebar', "Side Bar")
            });
            const pinnedViewlets = paneCompositePartService.getVisiblePaneCompositeIds(0 /* ViewContainerLocation.Sidebar */);
            items.push(...pinnedViewlets
                .filter(viewletId => {
                if (viewletId === viewDescriptorService.getViewContainerByViewId(focusedViewId).id) {
                    return false;
                }
                return !viewDescriptorService.getViewContainerById(viewletId).rejectAddedViews;
            })
                .map(viewletId => {
                return {
                    id: viewletId,
                    label: viewDescriptorService.getViewContainerModel(viewDescriptorService.getViewContainerById(viewletId)).title
                };
            }));
            items.push({
                type: 'separator',
                label: (0, nls_1.localize)('panel', "Panel")
            });
            const pinnedPanels = paneCompositePartService.getPinnedPaneCompositeIds(1 /* ViewContainerLocation.Panel */);
            items.push(...pinnedPanels
                .filter(panel => {
                if (panel === viewDescriptorService.getViewContainerByViewId(focusedViewId).id) {
                    return false;
                }
                return !viewDescriptorService.getViewContainerById(panel).rejectAddedViews;
            })
                .map(panel => {
                return {
                    id: panel,
                    label: viewDescriptorService.getViewContainerModel(viewDescriptorService.getViewContainerById(panel)).title
                };
            }));
            items.push({
                type: 'separator',
                label: (0, nls_1.localize)('secondarySideBar', "Secondary Side Bar")
            });
            const pinnedAuxPanels = paneCompositePartService.getPinnedPaneCompositeIds(2 /* ViewContainerLocation.AuxiliaryBar */);
            items.push(...pinnedAuxPanels
                .filter(panel => {
                if (panel === viewDescriptorService.getViewContainerByViewId(focusedViewId).id) {
                    return false;
                }
                return !viewDescriptorService.getViewContainerById(panel).rejectAddedViews;
            })
                .map(panel => {
                return {
                    id: panel,
                    label: viewDescriptorService.getViewContainerModel(viewDescriptorService.getViewContainerById(panel)).title
                };
            }));
            quickPick.items = items;
            quickPick.onDidAccept(() => {
                const destination = quickPick.selectedItems[0];
                if (destination.id === '_.panel.newcontainer') {
                    viewDescriptorService.moveViewToLocation(viewDescriptor, 1 /* ViewContainerLocation.Panel */);
                    viewsService.openView(focusedViewId, true);
                }
                else if (destination.id === '_.sidebar.newcontainer') {
                    viewDescriptorService.moveViewToLocation(viewDescriptor, 0 /* ViewContainerLocation.Sidebar */);
                    viewsService.openView(focusedViewId, true);
                }
                else if (destination.id === '_.auxiliarybar.newcontainer') {
                    viewDescriptorService.moveViewToLocation(viewDescriptor, 2 /* ViewContainerLocation.AuxiliaryBar */);
                    viewsService.openView(focusedViewId, true);
                }
                else if (destination.id) {
                    viewDescriptorService.moveViewsToContainer([viewDescriptor], viewDescriptorService.getViewContainerById(destination.id));
                    viewsService.openView(focusedViewId, true);
                }
                quickPick.hide();
            });
            quickPick.show();
        }
    }
    (0, actions_1.registerAction2)(MoveFocusedViewAction);
    // --- Reset Focused View Location
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.resetFocusedViewLocation',
                title: {
                    value: (0, nls_1.localize)('resetFocusedViewLocation', "Reset Focused View Location"),
                    original: 'Reset Focused View Location'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                precondition: contextkeys_2.FocusedViewContext.notEqualsTo('')
            });
        }
        run(accessor) {
            const viewDescriptorService = accessor.get(views_1.IViewDescriptorService);
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const viewsService = accessor.get(views_1.IViewsService);
            const focusedViewId = contextkeys_2.FocusedViewContext.getValue(contextKeyService);
            let viewDescriptor = null;
            if (focusedViewId !== undefined && focusedViewId.trim() !== '') {
                viewDescriptor = viewDescriptorService.getViewDescriptorById(focusedViewId);
            }
            if (!viewDescriptor) {
                dialogService.error((0, nls_1.localize)('resetFocusedView.error.noFocusedView', "There is no view currently focused."));
                return;
            }
            const defaultContainer = viewDescriptorService.getDefaultContainerById(viewDescriptor.id);
            if (!defaultContainer || defaultContainer === viewDescriptorService.getViewContainerByViewId(viewDescriptor.id)) {
                return;
            }
            viewDescriptorService.moveViewsToContainer([viewDescriptor], defaultContainer);
            viewsService.openView(viewDescriptor.id, true);
        }
    });
    // --- Resize View
    class BaseResizeViewAction extends actions_1.Action2 {
        static { this.RESIZE_INCREMENT = 60; } // This is a css pixel size
        resizePart(widthChange, heightChange, layoutService, partToResize) {
            let part;
            if (partToResize === undefined) {
                const isEditorFocus = layoutService.hasFocus("workbench.parts.editor" /* Parts.EDITOR_PART */);
                const isSidebarFocus = layoutService.hasFocus("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
                const isPanelFocus = layoutService.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */);
                const isAuxiliaryBarFocus = layoutService.hasFocus("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
                if (isSidebarFocus) {
                    part = "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */;
                }
                else if (isPanelFocus) {
                    part = "workbench.parts.panel" /* Parts.PANEL_PART */;
                }
                else if (isEditorFocus) {
                    part = "workbench.parts.editor" /* Parts.EDITOR_PART */;
                }
                else if (isAuxiliaryBarFocus) {
                    part = "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */;
                }
            }
            else {
                part = partToResize;
            }
            if (part) {
                layoutService.resizePart(part, widthChange, heightChange);
            }
        }
    }
    class IncreaseViewSizeAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.increaseViewSize',
                title: { value: (0, nls_1.localize)('increaseViewSize', "Increase Current View Size"), original: 'Increase Current View Size' },
                f1: true
            });
        }
        run(accessor) {
            this.resizePart(BaseResizeViewAction.RESIZE_INCREMENT, BaseResizeViewAction.RESIZE_INCREMENT, accessor.get(layoutService_1.IWorkbenchLayoutService));
        }
    }
    class IncreaseViewWidthAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.increaseViewWidth',
                title: { value: (0, nls_1.localize)('increaseEditorWidth', "Increase Editor Width"), original: 'Increase Editor Width' },
                f1: true
            });
        }
        run(accessor) {
            this.resizePart(BaseResizeViewAction.RESIZE_INCREMENT, 0, accessor.get(layoutService_1.IWorkbenchLayoutService), "workbench.parts.editor" /* Parts.EDITOR_PART */);
        }
    }
    class IncreaseViewHeightAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.increaseViewHeight',
                title: { value: (0, nls_1.localize)('increaseEditorHeight', "Increase Editor Height"), original: 'Increase Editor Height' },
                f1: true
            });
        }
        run(accessor) {
            this.resizePart(0, BaseResizeViewAction.RESIZE_INCREMENT, accessor.get(layoutService_1.IWorkbenchLayoutService), "workbench.parts.editor" /* Parts.EDITOR_PART */);
        }
    }
    class DecreaseViewSizeAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.decreaseViewSize',
                title: { value: (0, nls_1.localize)('decreaseViewSize', "Decrease Current View Size"), original: 'Decrease Current View Size' },
                f1: true
            });
        }
        run(accessor) {
            this.resizePart(-BaseResizeViewAction.RESIZE_INCREMENT, -BaseResizeViewAction.RESIZE_INCREMENT, accessor.get(layoutService_1.IWorkbenchLayoutService));
        }
    }
    class DecreaseViewWidthAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.decreaseViewWidth',
                title: { value: (0, nls_1.localize)('decreaseEditorWidth', "Decrease Editor Width"), original: 'Decrease Editor Width' },
                f1: true
            });
        }
        run(accessor) {
            this.resizePart(-BaseResizeViewAction.RESIZE_INCREMENT, 0, accessor.get(layoutService_1.IWorkbenchLayoutService), "workbench.parts.editor" /* Parts.EDITOR_PART */);
        }
    }
    class DecreaseViewHeightAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.decreaseViewHeight',
                title: { value: (0, nls_1.localize)('decreaseEditorHeight', "Decrease Editor Height"), original: 'Decrease Editor Height' },
                f1: true
            });
        }
        run(accessor) {
            this.resizePart(0, -BaseResizeViewAction.RESIZE_INCREMENT, accessor.get(layoutService_1.IWorkbenchLayoutService), "workbench.parts.editor" /* Parts.EDITOR_PART */);
        }
    }
    (0, actions_1.registerAction2)(IncreaseViewSizeAction);
    (0, actions_1.registerAction2)(IncreaseViewWidthAction);
    (0, actions_1.registerAction2)(IncreaseViewHeightAction);
    (0, actions_1.registerAction2)(DecreaseViewSizeAction);
    (0, actions_1.registerAction2)(DecreaseViewWidthAction);
    (0, actions_1.registerAction2)(DecreaseViewHeightAction);
    function isContextualLayoutVisualIcon(icon) {
        return icon.iconA !== undefined;
    }
    const CreateToggleLayoutItem = (id, active, label, visualIcon) => {
        return {
            id,
            active,
            label,
            visualIcon,
            activeIcon: codicons_1.Codicon.eye,
            inactiveIcon: codicons_1.Codicon.eyeClosed,
            activeAriaLabel: (0, nls_1.localize)('selectToHide', "Select to Hide"),
            inactiveAriaLabel: (0, nls_1.localize)('selectToShow', "Select to Show"),
            useButtons: true,
        };
    };
    const CreateOptionLayoutItem = (id, active, label, visualIcon) => {
        return {
            id,
            active,
            label,
            visualIcon,
            activeIcon: codicons_1.Codicon.check,
            activeAriaLabel: (0, nls_1.localize)('active', "Active"),
            useButtons: false
        };
    };
    const MenuBarToggledContext = contextkey_1.ContextKeyExpr.and(contextkeys_1.IsMacNativeContext.toNegated(), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'hidden'), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'toggle'), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'compact'));
    const ToggleVisibilityActions = [];
    if (!platform_1.isMacintosh || !platform_1.isNative) {
        ToggleVisibilityActions.push(CreateToggleLayoutItem('workbench.action.toggleMenuBar', MenuBarToggledContext, (0, nls_1.localize)('menuBar', "Menu Bar"), menubarIcon));
    }
    ToggleVisibilityActions.push(...[
        CreateToggleLayoutItem(ToggleActivityBarVisibilityAction.ID, contextkey_1.ContextKeyExpr.equals('config.workbench.activityBar.visible', true), (0, nls_1.localize)('activityBar', "Activity Bar"), { whenA: contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'left'), iconA: activityBarLeftIcon, iconB: activityBarRightIcon }),
        CreateToggleLayoutItem(ToggleSidebarVisibilityAction.ID, contextkeys_2.SideBarVisibleContext, (0, nls_1.localize)('sideBar', "Primary Side Bar"), { whenA: contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'left'), iconA: panelLeftIcon, iconB: panelRightIcon }),
        CreateToggleLayoutItem(auxiliaryBarActions_1.ToggleAuxiliaryBarAction.ID, contextkeys_2.AuxiliaryBarVisibleContext, (0, nls_1.localize)('secondarySideBar', "Secondary Side Bar"), { whenA: contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'left'), iconA: panelRightIcon, iconB: panelLeftIcon }),
        CreateToggleLayoutItem(panelActions_1.TogglePanelAction.ID, contextkeys_2.PanelVisibleContext, (0, nls_1.localize)('panel', "Panel"), panelIcon),
        CreateToggleLayoutItem(ToggleStatusbarVisibilityAction.ID, contextkey_1.ContextKeyExpr.equals('config.workbench.statusBar.visible', true), (0, nls_1.localize)('statusBar', "Status Bar"), statusBarIcon),
    ]);
    const MoveSideBarActions = [
        CreateOptionLayoutItem(MoveSidebarLeftAction.ID, contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'left'), (0, nls_1.localize)('leftSideBar', "Left"), panelLeftIcon),
        CreateOptionLayoutItem(MoveSidebarRightAction.ID, contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'right'), (0, nls_1.localize)('rightSideBar', "Right"), panelRightIcon),
    ];
    const AlignPanelActions = [
        CreateOptionLayoutItem('workbench.action.alignPanelLeft', contextkeys_2.PanelAlignmentContext.isEqualTo('left'), (0, nls_1.localize)('leftPanel', "Left"), panelAlignmentLeftIcon),
        CreateOptionLayoutItem('workbench.action.alignPanelRight', contextkeys_2.PanelAlignmentContext.isEqualTo('right'), (0, nls_1.localize)('rightPanel', "Right"), panelAlignmentRightIcon),
        CreateOptionLayoutItem('workbench.action.alignPanelCenter', contextkeys_2.PanelAlignmentContext.isEqualTo('center'), (0, nls_1.localize)('centerPanel', "Center"), panelAlignmentCenterIcon),
        CreateOptionLayoutItem('workbench.action.alignPanelJustify', contextkeys_2.PanelAlignmentContext.isEqualTo('justify'), (0, nls_1.localize)('justifyPanel', "Justify"), panelAlignmentJustifyIcon),
    ];
    const MiscLayoutOptions = [
        CreateOptionLayoutItem('workbench.action.toggleFullScreen', contextkeys_2.IsFullscreenContext, (0, nls_1.localize)('fullscreen', "Full Screen"), fullscreenIcon),
        CreateOptionLayoutItem('workbench.action.toggleZenMode', contextkeys_2.InEditorZenModeContext, (0, nls_1.localize)('zenMode', "Zen Mode"), zenModeIcon),
        CreateOptionLayoutItem('workbench.action.toggleCenteredLayout', contextkeys_2.IsCenteredLayoutContext, (0, nls_1.localize)('centeredLayout', "Centered Layout"), centerLayoutIcon),
    ];
    const LayoutContextKeySet = new Set();
    for (const { active } of [...ToggleVisibilityActions, ...MoveSideBarActions, ...AlignPanelActions, ...MiscLayoutOptions]) {
        for (const key of active.keys()) {
            LayoutContextKeySet.add(key);
        }
    }
    (0, actions_1.registerAction2)(class CustomizeLayoutAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.customizeLayout',
                title: { original: 'Customize Layout...', value: (0, nls_1.localize)('customizeLayout', "Customize Layout...") },
                f1: true,
                icon: configureLayoutIcon,
                menu: [
                    {
                        id: actions_1.MenuId.LayoutControlMenuSubmenu,
                        group: 'z_end',
                    },
                    {
                        id: actions_1.MenuId.LayoutControlMenu,
                        when: contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.type', 'both'),
                        group: 'z_end'
                    }
                ]
            });
        }
        getItems(contextKeyService) {
            const toQuickPickItem = (item) => {
                const toggled = item.active.evaluate(contextKeyService.getContext(null));
                let label = item.useButtons ?
                    item.label :
                    item.label + (toggled && item.activeIcon ? ` $(${item.activeIcon.id})` : (!toggled && item.inactiveIcon ? ` $(${item.inactiveIcon.id})` : ''));
                const ariaLabel = item.label + (toggled && item.activeAriaLabel ? ` (${item.activeAriaLabel})` : (!toggled && item.inactiveAriaLabel ? ` (${item.inactiveAriaLabel})` : ''));
                if (item.visualIcon) {
                    let icon = item.visualIcon;
                    if (isContextualLayoutVisualIcon(icon)) {
                        const useIconA = icon.whenA.evaluate(contextKeyService.getContext(null));
                        icon = useIconA ? icon.iconA : icon.iconB;
                    }
                    label = `$(${icon.id}) ${label}`;
                }
                const icon = toggled ? item.activeIcon : item.inactiveIcon;
                return {
                    type: 'item',
                    id: item.id,
                    label,
                    ariaLabel,
                    buttons: !item.useButtons ? undefined : [
                        {
                            alwaysVisible: false,
                            tooltip: ariaLabel,
                            iconClass: icon ? themables_1.ThemeIcon.asClassName(icon) : undefined
                        }
                    ]
                };
            };
            return [
                {
                    type: 'separator',
                    label: (0, nls_1.localize)('toggleVisibility', "Visibility")
                },
                ...ToggleVisibilityActions.map(toQuickPickItem),
                {
                    type: 'separator',
                    label: (0, nls_1.localize)('sideBarPosition', "Primary Side Bar Position")
                },
                ...MoveSideBarActions.map(toQuickPickItem),
                {
                    type: 'separator',
                    label: (0, nls_1.localize)('panelAlignment', "Panel Alignment")
                },
                ...AlignPanelActions.map(toQuickPickItem),
                {
                    type: 'separator',
                    label: (0, nls_1.localize)('layoutModes', "Modes"),
                },
                ...MiscLayoutOptions.map(toQuickPickItem),
            ];
        }
        run(accessor) {
            if (this._currentQuickPick) {
                this._currentQuickPick.hide();
                return;
            }
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const commandService = accessor.get(commands_1.ICommandService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const quickPick = quickInputService.createQuickPick();
            this._currentQuickPick = quickPick;
            quickPick.items = this.getItems(contextKeyService);
            quickPick.ignoreFocusOut = true;
            quickPick.hideInput = true;
            quickPick.title = (0, nls_1.localize)('customizeLayoutQuickPickTitle', "Customize Layout");
            const closeButton = {
                alwaysVisible: true,
                iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.close),
                tooltip: (0, nls_1.localize)('close', "Close")
            };
            const resetButton = {
                alwaysVisible: true,
                iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.discard),
                tooltip: (0, nls_1.localize)('restore defaults', "Restore Defaults")
            };
            quickPick.buttons = [
                resetButton,
                closeButton
            ];
            const disposables = new lifecycle_1.DisposableStore();
            let selectedItem = undefined;
            disposables.add(contextKeyService.onDidChangeContext(changeEvent => {
                if (changeEvent.affectsSome(LayoutContextKeySet)) {
                    quickPick.items = this.getItems(contextKeyService);
                    if (selectedItem) {
                        quickPick.activeItems = quickPick.items.filter(item => item.id === selectedItem?.id);
                    }
                    setTimeout(() => quickInputService.focus(), 0);
                }
            }));
            quickPick.onDidAccept(event => {
                if (quickPick.selectedItems.length) {
                    selectedItem = quickPick.selectedItems[0];
                    commandService.executeCommand(selectedItem.id);
                }
            });
            quickPick.onDidTriggerItemButton(event => {
                if (event.item) {
                    selectedItem = event.item;
                    commandService.executeCommand(selectedItem.id);
                }
            });
            quickPick.onDidTriggerButton((button) => {
                if (button === closeButton) {
                    quickPick.hide();
                }
                else if (button === resetButton) {
                    const resetSetting = (id) => {
                        const config = configurationService.inspect(id);
                        configurationService.updateValue(id, config.defaultValue);
                    };
                    // Reset all layout options
                    resetSetting('workbench.activityBar.visible');
                    resetSetting('workbench.sideBar.location');
                    resetSetting('workbench.statusBar.visible');
                    resetSetting('workbench.panel.defaultLocation');
                    if (!platform_1.isMacintosh || !platform_1.isNative) {
                        resetSetting('window.menuBarVisibility');
                    }
                    commandService.executeCommand('workbench.action.alignPanelCenter');
                }
            });
            quickPick.onDidHide(() => {
                quickPick.dispose();
            });
            quickPick.onDispose(() => {
                this._currentQuickPick = undefined;
                disposables.dispose();
            });
            quickPick.show();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0QWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL2FjdGlvbnMvbGF5b3V0QWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUEyQmhHLGlCQUFpQjtJQUNqQixNQUFNLFdBQVcsR0FBRyxJQUFBLDJCQUFZLEVBQUMsU0FBUyxFQUFFLGtCQUFPLENBQUMsYUFBYSxFQUFFLElBQUEsY0FBUSxFQUFDLGFBQWEsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7SUFDdkgsTUFBTSxtQkFBbUIsR0FBRyxJQUFBLDJCQUFZLEVBQUMsbUJBQW1CLEVBQUUsa0JBQU8sQ0FBQyxxQkFBcUIsRUFBRSxJQUFBLGNBQVEsRUFBQyxpQkFBaUIsRUFBRSxrREFBa0QsQ0FBQyxDQUFDLENBQUM7SUFDOUssTUFBTSxvQkFBb0IsR0FBRyxJQUFBLDJCQUFZLEVBQUMsb0JBQW9CLEVBQUUsa0JBQU8sQ0FBQyxzQkFBc0IsRUFBRSxJQUFBLGNBQVEsRUFBQyxrQkFBa0IsRUFBRSxtREFBbUQsQ0FBQyxDQUFDLENBQUM7SUFDbkwsTUFBTSxhQUFhLEdBQUcsSUFBQSwyQkFBWSxFQUFDLFlBQVksRUFBRSxrQkFBTyxDQUFDLGlCQUFpQixFQUFFLElBQUEsY0FBUSxFQUFDLFdBQVcsRUFBRSw0Q0FBNEMsQ0FBQyxDQUFDLENBQUM7SUFDakosTUFBTSxnQkFBZ0IsR0FBRyxJQUFBLDJCQUFZLEVBQUMsZ0JBQWdCLEVBQUUsa0JBQU8sQ0FBQyxvQkFBb0IsRUFBRSxJQUFBLGNBQVEsRUFBQyxjQUFjLEVBQUUsd0RBQXdELENBQUMsQ0FBQyxDQUFDO0lBQzFLLE1BQU0sY0FBYyxHQUFHLElBQUEsMkJBQVksRUFBQyxhQUFhLEVBQUUsa0JBQU8sQ0FBQyxrQkFBa0IsRUFBRSxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsMkNBQTJD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