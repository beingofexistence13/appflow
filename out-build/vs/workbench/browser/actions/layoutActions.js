/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/actions/layoutActions", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/platform/configuration/common/configuration", "vs/workbench/services/layout/browser/layoutService", "vs/platform/instantiation/common/instantiation", "vs/base/common/keyCodes", "vs/base/common/platform", "vs/platform/contextkey/common/contextkeys", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/views", "vs/platform/quickinput/common/quickInput", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/browser/parts/auxiliarybar/auxiliaryBarActions", "vs/workbench/browser/parts/panel/panelActions", "vs/platform/commands/common/commands", "vs/workbench/common/contextkeys", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/lifecycle", "vs/platform/theme/common/iconRegistry"], function (require, exports, nls_1, actions_1, actionCommonCategories_1, configuration_1, layoutService_1, instantiation_1, keyCodes_1, platform_1, contextkeys_1, keybindingsRegistry_1, contextkey_1, views_1, quickInput_1, dialogs_1, panecomposite_1, auxiliaryBarActions_1, panelActions_1, commands_1, contextkeys_2, codicons_1, themables_1, lifecycle_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Stb = exports.$Rtb = exports.$Qtb = exports.$Ptb = void 0;
    // Register Icons
    const menubarIcon = (0, iconRegistry_1.$9u)('menuBar', codicons_1.$Pj.layoutMenubar, (0, nls_1.localize)(0, null));
    const activityBarLeftIcon = (0, iconRegistry_1.$9u)('activity-bar-left', codicons_1.$Pj.layoutActivitybarLeft, (0, nls_1.localize)(1, null));
    const activityBarRightIcon = (0, iconRegistry_1.$9u)('activity-bar-right', codicons_1.$Pj.layoutActivitybarRight, (0, nls_1.localize)(2, null));
    const panelLeftIcon = (0, iconRegistry_1.$9u)('panel-left', codicons_1.$Pj.layoutSidebarLeft, (0, nls_1.localize)(3, null));
    const panelLeftOffIcon = (0, iconRegistry_1.$9u)('panel-left-off', codicons_1.$Pj.layoutSidebarLeftOff, (0, nls_1.localize)(4, null));
    const panelRightIcon = (0, iconRegistry_1.$9u)('panel-right', codicons_1.$Pj.layoutSidebarRight, (0, nls_1.localize)(5, null));
    const panelRightOffIcon = (0, iconRegistry_1.$9u)('panel-right-off', codicons_1.$Pj.layoutSidebarRightOff, (0, nls_1.localize)(6, null));
    const panelIcon = (0, iconRegistry_1.$9u)('panel-bottom', codicons_1.$Pj.layoutPanel, (0, nls_1.localize)(7, null));
    const statusBarIcon = (0, iconRegistry_1.$9u)('statusBar', codicons_1.$Pj.layoutStatusbar, (0, nls_1.localize)(8, null));
    const panelAlignmentLeftIcon = (0, iconRegistry_1.$9u)('panel-align-left', codicons_1.$Pj.layoutPanelLeft, (0, nls_1.localize)(9, null));
    const panelAlignmentRightIcon = (0, iconRegistry_1.$9u)('panel-align-right', codicons_1.$Pj.layoutPanelRight, (0, nls_1.localize)(10, null));
    const panelAlignmentCenterIcon = (0, iconRegistry_1.$9u)('panel-align-center', codicons_1.$Pj.layoutPanelCenter, (0, nls_1.localize)(11, null));
    const panelAlignmentJustifyIcon = (0, iconRegistry_1.$9u)('panel-align-justify', codicons_1.$Pj.layoutPanelJustify, (0, nls_1.localize)(12, null));
    const fullscreenIcon = (0, iconRegistry_1.$9u)('fullscreen', codicons_1.$Pj.screenFull, (0, nls_1.localize)(13, null));
    const centerLayoutIcon = (0, iconRegistry_1.$9u)('centerLayoutIcon', codicons_1.$Pj.layoutCentered, (0, nls_1.localize)(14, null));
    const zenModeIcon = (0, iconRegistry_1.$9u)('zenMode', codicons_1.$Pj.target, (0, nls_1.localize)(15, null));
    // --- Close Side Bar
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.closeSidebar',
                title: { value: (0, nls_1.localize)(16, null), original: 'Close Primary Side Bar' },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            });
        }
        run(accessor) {
            accessor.get(layoutService_1.$Meb).setPartHidden(true, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
        }
    });
    // --- Toggle Activity Bar
    class $Ptb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.toggleActivityBarVisibility'; }
        static { this.a = 'workbench.activityBar.visible'; }
        constructor() {
            super({
                id: $Ptb.ID,
                title: {
                    value: (0, nls_1.localize)(17, null),
                    mnemonicTitle: (0, nls_1.localize)(18, null),
                    original: 'Toggle Activity Bar Visibility'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                toggled: contextkey_1.$Ii.equals('config.workbench.activityBar.visible', true),
                menu: [{
                        id: actions_1.$Ru.MenubarAppearanceMenu,
                        group: '2_workbench_layout',
                        order: 4
                    }]
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.$Meb);
            const configurationService = accessor.get(configuration_1.$8h);
            const visibility = layoutService.isVisible("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */);
            const newVisibilityValue = !visibility;
            configurationService.updateValue($Ptb.a, newVisibilityValue);
        }
    }
    exports.$Ptb = $Ptb;
    (0, actions_1.$Xu)($Ptb);
    // --- Toggle Centered Layout
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.toggleCenteredLayout',
                title: {
                    value: (0, nls_1.localize)(19, null),
                    mnemonicTitle: (0, nls_1.localize)(20, null),
                    original: 'Toggle Centered Layout'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                toggled: contextkeys_2.$mdb,
                menu: [{
                        id: actions_1.$Ru.MenubarAppearanceMenu,
                        group: '1_toggle_view',
                        order: 3
                    }]
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.$Meb);
            layoutService.centerEditorLayout(!layoutService.isEditorLayoutCentered());
        }
    });
    // --- Set Sidebar Position
    const sidebarPositionConfigurationKey = 'workbench.sideBar.location';
    class MoveSidebarPositionAction extends actions_1.$Wu {
        constructor(id, title, a) {
            super({
                id,
                title,
                f1: false
            });
            this.a = a;
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.$Meb);
            const configurationService = accessor.get(configuration_1.$8h);
            const position = layoutService.getSideBarPosition();
            if (position !== this.a) {
                return configurationService.updateValue(sidebarPositionConfigurationKey, (0, layoutService_1.$Neb)(this.a));
            }
        }
    }
    class MoveSidebarRightAction extends MoveSidebarPositionAction {
        static { this.ID = 'workbench.action.moveSideBarRight'; }
        constructor() {
            super(MoveSidebarRightAction.ID, {
                value: (0, nls_1.localize)(21, null),
                original: 'Move Primary Side Bar Right'
            }, 1 /* Position.RIGHT */);
        }
    }
    class MoveSidebarLeftAction extends MoveSidebarPositionAction {
        static { this.ID = 'workbench.action.moveSideBarLeft'; }
        constructor() {
            super(MoveSidebarLeftAction.ID, {
                value: (0, nls_1.localize)(22, null),
                original: 'Move Primary Side Bar Left'
            }, 0 /* Position.LEFT */);
        }
    }
    (0, actions_1.$Xu)(MoveSidebarRightAction);
    (0, actions_1.$Xu)(MoveSidebarLeftAction);
    // --- Toggle Sidebar Position
    class $Qtb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.toggleSidebarPosition'; }
        static { this.LABEL = (0, nls_1.localize)(23, null); }
        static getLabel(layoutService) {
            return layoutService.getSideBarPosition() === 0 /* Position.LEFT */ ? (0, nls_1.localize)(24, null) : (0, nls_1.localize)(25, null);
        }
        constructor() {
            super({
                id: $Qtb.ID,
                title: { value: (0, nls_1.localize)(26, null), original: 'Toggle Primary Side Bar Position' },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.$Meb);
            const configurationService = accessor.get(configuration_1.$8h);
            const position = layoutService.getSideBarPosition();
            const newPositionValue = (position === 0 /* Position.LEFT */) ? 'right' : 'left';
            return configurationService.updateValue(sidebarPositionConfigurationKey, newPositionValue);
        }
    }
    exports.$Qtb = $Qtb;
    (0, actions_1.$Xu)($Qtb);
    const configureLayoutIcon = (0, iconRegistry_1.$9u)('configure-layout-icon', codicons_1.$Pj.layout, (0, nls_1.localize)(27, null));
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.LayoutControlMenu, {
        submenu: actions_1.$Ru.LayoutControlMenuSubmenu,
        title: (0, nls_1.localize)(28, null),
        icon: configureLayoutIcon,
        group: '1_workbench_layout',
        when: contextkey_1.$Ii.equals('config.workbench.layoutControl.type', 'menu')
    });
    actions_1.$Tu.appendMenuItems([{
            id: actions_1.$Ru.ViewContainerTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: $Qtb.ID,
                    title: (0, nls_1.localize)(29, null)
                },
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.notEquals('config.workbench.sideBar.location', 'right'), contextkey_1.$Ii.equals('viewContainerLocation', (0, views_1.$0E)(0 /* ViewContainerLocation.Sidebar */))),
                order: 1
            }
        }, {
            id: actions_1.$Ru.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: $Qtb.ID,
                    title: (0, nls_1.localize)(30, null)
                },
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.notEquals('config.workbench.sideBar.location', 'right'), contextkey_1.$Ii.equals('viewLocation', (0, views_1.$0E)(0 /* ViewContainerLocation.Sidebar */))),
                order: 1
            }
        }, {
            id: actions_1.$Ru.ViewContainerTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: $Qtb.ID,
                    title: (0, nls_1.localize)(31, null)
                },
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('config.workbench.sideBar.location', 'right'), contextkey_1.$Ii.equals('viewContainerLocation', (0, views_1.$0E)(0 /* ViewContainerLocation.Sidebar */))),
                order: 1
            }
        }, {
            id: actions_1.$Ru.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: $Qtb.ID,
                    title: (0, nls_1.localize)(32, null)
                },
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('config.workbench.sideBar.location', 'right'), contextkey_1.$Ii.equals('viewLocation', (0, views_1.$0E)(0 /* ViewContainerLocation.Sidebar */))),
                order: 1
            }
        }, {
            id: actions_1.$Ru.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: $Qtb.ID,
                    title: (0, nls_1.localize)(33, null)
                },
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.notEquals('config.workbench.sideBar.location', 'right'), contextkey_1.$Ii.equals('viewLocation', (0, views_1.$0E)(2 /* ViewContainerLocation.AuxiliaryBar */))),
                order: 1
            }
        }, {
            id: actions_1.$Ru.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: $Qtb.ID,
                    title: (0, nls_1.localize)(34, null)
                },
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('config.workbench.sideBar.location', 'right'), contextkey_1.$Ii.equals('viewLocation', (0, views_1.$0E)(2 /* ViewContainerLocation.AuxiliaryBar */))),
                order: 1
            }
        }]);
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarAppearanceMenu, {
        group: '3_workbench_layout_move',
        command: {
            id: $Qtb.ID,
            title: (0, nls_1.localize)(35, null)
        },
        when: contextkey_1.$Ii.notEquals('config.workbench.sideBar.location', 'right'),
        order: 2
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarAppearanceMenu, {
        group: '3_workbench_layout_move',
        command: {
            id: $Qtb.ID,
            title: (0, nls_1.localize)(36, null)
        },
        when: contextkey_1.$Ii.equals('config.workbench.sideBar.location', 'right'),
        order: 2
    });
    // --- Toggle Editor Visibility
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.toggleEditorVisibility',
                title: {
                    value: (0, nls_1.localize)(37, null),
                    mnemonicTitle: (0, nls_1.localize)(38, null),
                    original: 'Toggle Editor Area Visibility'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                toggled: contextkeys_2.$odb,
                // the workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
                precondition: contextkey_1.$Ii.or(contextkeys_2.$Edb.isEqualTo('center'), contextkeys_2.$Ddb.notEqualsTo('bottom'))
            });
        }
        run(accessor) {
            accessor.get(layoutService_1.$Meb).toggleMaximizedPanel();
        }
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarViewMenu, {
        group: '2_appearance',
        title: (0, nls_1.localize)(39, null),
        submenu: actions_1.$Ru.MenubarAppearanceMenu,
        order: 1
    });
    // Toggle Sidebar Visibility
    class ToggleSidebarVisibilityAction extends actions_1.$Wu {
        static { this.ID = 'workbench.action.toggleSidebarVisibility'; }
        constructor() {
            super({
                id: ToggleSidebarVisibilityAction.ID,
                title: { value: (0, nls_1.localize)(40, null), original: 'Toggle Primary Side Bar Visibility' },
                toggled: {
                    condition: contextkeys_2.$qdb,
                    title: (0, nls_1.localize)(41, null),
                    mnemonicTitle: (0, nls_1.localize)(42, null),
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */
                },
                menu: [
                    {
                        id: actions_1.$Ru.LayoutControlMenuSubmenu,
                        group: '0_workbench_layout',
                        order: 0
                    },
                    {
                        id: actions_1.$Ru.MenubarAppearanceMenu,
                        group: '2_workbench_layout',
                        order: 1
                    }
                ]
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.$Meb);
            layoutService.setPartHidden(layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */), "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
        }
    }
    (0, actions_1.$Xu)(ToggleSidebarVisibilityAction);
    actions_1.$Tu.appendMenuItems([
        {
            id: actions_1.$Ru.ViewContainerTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarVisibilityAction.ID,
                    title: (0, nls_1.localize)(43, null),
                },
                when: contextkey_1.$Ii.and(contextkeys_2.$qdb, contextkey_1.$Ii.equals('viewContainerLocation', (0, views_1.$0E)(0 /* ViewContainerLocation.Sidebar */))),
                order: 2
            }
        }, {
            id: actions_1.$Ru.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarVisibilityAction.ID,
                    title: (0, nls_1.localize)(44, null),
                },
                when: contextkey_1.$Ii.and(contextkeys_2.$qdb, contextkey_1.$Ii.equals('viewLocation', (0, views_1.$0E)(0 /* ViewContainerLocation.Sidebar */))),
                order: 2
            }
        }, {
            id: actions_1.$Ru.LayoutControlMenu,
            item: {
                group: '0_workbench_toggles',
                command: {
                    id: ToggleSidebarVisibilityAction.ID,
                    title: (0, nls_1.localize)(45, null),
                    icon: panelLeftOffIcon,
                    toggled: { condition: contextkeys_2.$qdb, icon: panelLeftIcon }
                },
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.or(contextkey_1.$Ii.equals('config.workbench.layoutControl.type', 'toggles'), contextkey_1.$Ii.equals('config.workbench.layoutControl.type', 'both')), contextkey_1.$Ii.equals('config.workbench.sideBar.location', 'left')),
                order: 0
            }
        }, {
            id: actions_1.$Ru.LayoutControlMenu,
            item: {
                group: '0_workbench_toggles',
                command: {
                    id: ToggleSidebarVisibilityAction.ID,
                    title: (0, nls_1.localize)(46, null),
                    icon: panelRightOffIcon,
                    toggled: { condition: contextkeys_2.$qdb, icon: panelRightIcon }
                },
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.or(contextkey_1.$Ii.equals('config.workbench.layoutControl.type', 'toggles'), contextkey_1.$Ii.equals('config.workbench.layoutControl.type', 'both')), contextkey_1.$Ii.equals('config.workbench.sideBar.location', 'right')),
                order: 2
            }
        }
    ]);
    // --- Toggle Statusbar Visibility
    class $Rtb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.toggleStatusbarVisibility'; }
        static { this.a = 'workbench.statusBar.visible'; }
        constructor() {
            super({
                id: $Rtb.ID,
                title: {
                    value: (0, nls_1.localize)(47, null),
                    mnemonicTitle: (0, nls_1.localize)(48, null),
                    original: 'Toggle Status Bar Visibility'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                toggled: contextkey_1.$Ii.equals('config.workbench.statusBar.visible', true),
                menu: [{
                        id: actions_1.$Ru.MenubarAppearanceMenu,
                        group: '2_workbench_layout',
                        order: 3
                    }]
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.$Meb);
            const configurationService = accessor.get(configuration_1.$8h);
            const visibility = layoutService.isVisible("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */);
            const newVisibilityValue = !visibility;
            return configurationService.updateValue($Rtb.a, newVisibilityValue);
        }
    }
    exports.$Rtb = $Rtb;
    (0, actions_1.$Xu)($Rtb);
    // --- Toggle Tabs Visibility
    class $Stb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.toggleTabsVisibility'; }
        constructor() {
            super({
                id: $Stb.ID,
                title: {
                    value: (0, nls_1.localize)(49, null),
                    original: 'Toggle Tab Visibility'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            });
        }
        run(accessor) {
            const configurationService = accessor.get(configuration_1.$8h);
            const visibility = configurationService.getValue('workbench.editor.showTabs');
            const newVisibilityValue = !visibility;
            return configurationService.updateValue('workbench.editor.showTabs', newVisibilityValue);
        }
    }
    exports.$Stb = $Stb;
    (0, actions_1.$Xu)($Stb);
    // --- Toggle Zen Mode
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.toggleZenMode',
                title: {
                    value: (0, nls_1.localize)(50, null),
                    mnemonicTitle: (0, nls_1.localize)(51, null),
                    original: 'Toggle Zen Mode'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 56 /* KeyCode.KeyZ */)
                },
                toggled: contextkeys_2.$ldb,
                menu: [{
                        id: actions_1.$Ru.MenubarAppearanceMenu,
                        group: '1_toggle_view',
                        order: 2
                    }]
            });
        }
        run(accessor) {
            return accessor.get(layoutService_1.$Meb).toggleZenMode();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'workbench.action.exitZenMode',
        weight: 100 /* KeybindingWeight.EditorContrib */ - 1000,
        handler(accessor) {
            const layoutService = accessor.get(layoutService_1.$Meb);
            const contextKeyService = accessor.get(contextkey_1.$3i);
            if (contextkeys_2.$ldb.getValue(contextKeyService)) {
                layoutService.toggleZenMode();
            }
        },
        when: contextkeys_2.$ldb,
        primary: (0, keyCodes_1.$vq)(9 /* KeyCode.Escape */, 9 /* KeyCode.Escape */)
    });
    // --- Toggle Menu Bar
    if (platform_1.$i || platform_1.$k || platform_1.$o) {
        (0, actions_1.$Xu)(class ToggleMenubarAction extends actions_1.$Wu {
            constructor() {
                super({
                    id: 'workbench.action.toggleMenuBar',
                    title: {
                        value: (0, nls_1.localize)(52, null),
                        mnemonicTitle: (0, nls_1.localize)(53, null),
                        original: 'Toggle Menu Bar'
                    },
                    category: actionCommonCategories_1.$Nl.View,
                    f1: true,
                    toggled: contextkey_1.$Ii.and(contextkeys_1.$33.toNegated(), contextkey_1.$Ii.notEquals('config.window.menuBarVisibility', 'hidden'), contextkey_1.$Ii.notEquals('config.window.menuBarVisibility', 'toggle'), contextkey_1.$Ii.notEquals('config.window.menuBarVisibility', 'compact')),
                    menu: [{
                            id: actions_1.$Ru.MenubarAppearanceMenu,
                            group: '2_workbench_layout',
                            order: 0
                        }]
                });
            }
            run(accessor) {
                return accessor.get(layoutService_1.$Meb).toggleMenuBar();
            }
        });
        // Add separately to title bar context menu so we can use a different title
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.TitleBarContext, {
            command: {
                id: 'workbench.action.toggleMenuBar',
                title: (0, nls_1.localize)(54, null),
                toggled: contextkey_1.$Ii.and(contextkeys_1.$33.toNegated(), contextkey_1.$Ii.notEquals('config.window.menuBarVisibility', 'hidden'), contextkey_1.$Ii.notEquals('config.window.menuBarVisibility', 'toggle'), contextkey_1.$Ii.notEquals('config.window.menuBarVisibility', 'compact'))
            },
            order: 0
        });
    }
    // --- Reset View Locations
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.resetViewLocations',
                title: {
                    value: (0, nls_1.localize)(55, null),
                    original: 'Reset View Locations'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            });
        }
        run(accessor) {
            return accessor.get(views_1.$_E).reset();
        }
    });
    // --- Move View
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.moveView',
                title: {
                    value: (0, nls_1.localize)(56, null),
                    original: 'Move View'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            });
        }
        async run(accessor) {
            const viewDescriptorService = accessor.get(views_1.$_E);
            const instantiationService = accessor.get(instantiation_1.$Ah);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const contextKeyService = accessor.get(contextkey_1.$3i);
            const paneCompositePartService = accessor.get(panecomposite_1.$Yeb);
            const focusedViewId = contextkeys_2.$Hdb.getValue(contextKeyService);
            let viewId;
            if (focusedViewId && viewDescriptorService.getViewDescriptorById(focusedViewId)?.canMoveView) {
                viewId = focusedViewId;
            }
            try {
                viewId = await this.b(quickInputService, viewDescriptorService, paneCompositePartService, viewId);
                if (!viewId) {
                    return;
                }
                const moveFocusedViewAction = new MoveFocusedViewAction();
                instantiationService.invokeFunction(accessor => moveFocusedViewAction.run(accessor, viewId));
            }
            catch { }
        }
        a(viewDescriptorService, paneCompositePartService) {
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
                                label: (0, nls_1.localize)(57, null, containerModel.title)
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
                                label: (0, nls_1.localize)(58, null, containerModel.title)
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
                                label: (0, nls_1.localize)(59, null, containerModel.title)
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
        async b(quickInputService, viewDescriptorService, paneCompositePartService, viewId) {
            const quickPick = quickInputService.createQuickPick();
            quickPick.placeholder = (0, nls_1.localize)(60, null);
            quickPick.items = this.a(viewDescriptorService, paneCompositePartService);
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
    class MoveFocusedViewAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.moveFocusedView',
                title: {
                    value: (0, nls_1.localize)(61, null),
                    original: 'Move Focused View'
                },
                category: actionCommonCategories_1.$Nl.View,
                precondition: contextkeys_2.$Hdb.notEqualsTo(''),
                f1: true
            });
        }
        run(accessor, viewId) {
            const viewDescriptorService = accessor.get(views_1.$_E);
            const viewsService = accessor.get(views_1.$$E);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const contextKeyService = accessor.get(contextkey_1.$3i);
            const dialogService = accessor.get(dialogs_1.$oA);
            const paneCompositePartService = accessor.get(panecomposite_1.$Yeb);
            const focusedViewId = viewId || contextkeys_2.$Hdb.getValue(contextKeyService);
            if (focusedViewId === undefined || focusedViewId.trim() === '') {
                dialogService.error((0, nls_1.localize)(62, null));
                return;
            }
            const viewDescriptor = viewDescriptorService.getViewDescriptorById(focusedViewId);
            if (!viewDescriptor || !viewDescriptor.canMoveView) {
                dialogService.error((0, nls_1.localize)(63, null));
                return;
            }
            const quickPick = quickInputService.createQuickPick();
            quickPick.placeholder = (0, nls_1.localize)(64, null);
            quickPick.title = (0, nls_1.localize)(65, null, viewDescriptor.name);
            const items = [];
            const currentContainer = viewDescriptorService.getViewContainerByViewId(focusedViewId);
            const currentLocation = viewDescriptorService.getViewLocationById(focusedViewId);
            const isViewSolo = viewDescriptorService.getViewContainerModel(currentContainer).allViewDescriptors.length === 1;
            if (!(isViewSolo && currentLocation === 1 /* ViewContainerLocation.Panel */)) {
                items.push({
                    id: '_.panel.newcontainer',
                    label: (0, nls_1.localize)(66, null),
                });
            }
            if (!(isViewSolo && currentLocation === 0 /* ViewContainerLocation.Sidebar */)) {
                items.push({
                    id: '_.sidebar.newcontainer',
                    label: (0, nls_1.localize)(67, null)
                });
            }
            if (!(isViewSolo && currentLocation === 2 /* ViewContainerLocation.AuxiliaryBar */)) {
                items.push({
                    id: '_.auxiliarybar.newcontainer',
                    label: (0, nls_1.localize)(68, null)
                });
            }
            items.push({
                type: 'separator',
                label: (0, nls_1.localize)(69, null)
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
                label: (0, nls_1.localize)(70, null)
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
                label: (0, nls_1.localize)(71, null)
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
    (0, actions_1.$Xu)(MoveFocusedViewAction);
    // --- Reset Focused View Location
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.resetFocusedViewLocation',
                title: {
                    value: (0, nls_1.localize)(72, null),
                    original: 'Reset Focused View Location'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                precondition: contextkeys_2.$Hdb.notEqualsTo('')
            });
        }
        run(accessor) {
            const viewDescriptorService = accessor.get(views_1.$_E);
            const contextKeyService = accessor.get(contextkey_1.$3i);
            const dialogService = accessor.get(dialogs_1.$oA);
            const viewsService = accessor.get(views_1.$$E);
            const focusedViewId = contextkeys_2.$Hdb.getValue(contextKeyService);
            let viewDescriptor = null;
            if (focusedViewId !== undefined && focusedViewId.trim() !== '') {
                viewDescriptor = viewDescriptorService.getViewDescriptorById(focusedViewId);
            }
            if (!viewDescriptor) {
                dialogService.error((0, nls_1.localize)(73, null));
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
    class BaseResizeViewAction extends actions_1.$Wu {
        static { this.a = 60; } // This is a css pixel size
        b(widthChange, heightChange, layoutService, partToResize) {
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
                title: { value: (0, nls_1.localize)(74, null), original: 'Increase Current View Size' },
                f1: true
            });
        }
        run(accessor) {
            this.b(BaseResizeViewAction.a, BaseResizeViewAction.a, accessor.get(layoutService_1.$Meb));
        }
    }
    class IncreaseViewWidthAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.increaseViewWidth',
                title: { value: (0, nls_1.localize)(75, null), original: 'Increase Editor Width' },
                f1: true
            });
        }
        run(accessor) {
            this.b(BaseResizeViewAction.a, 0, accessor.get(layoutService_1.$Meb), "workbench.parts.editor" /* Parts.EDITOR_PART */);
        }
    }
    class IncreaseViewHeightAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.increaseViewHeight',
                title: { value: (0, nls_1.localize)(76, null), original: 'Increase Editor Height' },
                f1: true
            });
        }
        run(accessor) {
            this.b(0, BaseResizeViewAction.a, accessor.get(layoutService_1.$Meb), "workbench.parts.editor" /* Parts.EDITOR_PART */);
        }
    }
    class DecreaseViewSizeAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.decreaseViewSize',
                title: { value: (0, nls_1.localize)(77, null), original: 'Decrease Current View Size' },
                f1: true
            });
        }
        run(accessor) {
            this.b(-BaseResizeViewAction.a, -BaseResizeViewAction.a, accessor.get(layoutService_1.$Meb));
        }
    }
    class DecreaseViewWidthAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.decreaseViewWidth',
                title: { value: (0, nls_1.localize)(78, null), original: 'Decrease Editor Width' },
                f1: true
            });
        }
        run(accessor) {
            this.b(-BaseResizeViewAction.a, 0, accessor.get(layoutService_1.$Meb), "workbench.parts.editor" /* Parts.EDITOR_PART */);
        }
    }
    class DecreaseViewHeightAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.decreaseViewHeight',
                title: { value: (0, nls_1.localize)(79, null), original: 'Decrease Editor Height' },
                f1: true
            });
        }
        run(accessor) {
            this.b(0, -BaseResizeViewAction.a, accessor.get(layoutService_1.$Meb), "workbench.parts.editor" /* Parts.EDITOR_PART */);
        }
    }
    (0, actions_1.$Xu)(IncreaseViewSizeAction);
    (0, actions_1.$Xu)(IncreaseViewWidthAction);
    (0, actions_1.$Xu)(IncreaseViewHeightAction);
    (0, actions_1.$Xu)(DecreaseViewSizeAction);
    (0, actions_1.$Xu)(DecreaseViewWidthAction);
    (0, actions_1.$Xu)(DecreaseViewHeightAction);
    function isContextualLayoutVisualIcon(icon) {
        return icon.iconA !== undefined;
    }
    const CreateToggleLayoutItem = (id, active, label, visualIcon) => {
        return {
            id,
            active,
            label,
            visualIcon,
            activeIcon: codicons_1.$Pj.eye,
            inactiveIcon: codicons_1.$Pj.eyeClosed,
            activeAriaLabel: (0, nls_1.localize)(80, null),
            inactiveAriaLabel: (0, nls_1.localize)(81, null),
            useButtons: true,
        };
    };
    const CreateOptionLayoutItem = (id, active, label, visualIcon) => {
        return {
            id,
            active,
            label,
            visualIcon,
            activeIcon: codicons_1.$Pj.check,
            activeAriaLabel: (0, nls_1.localize)(82, null),
            useButtons: false
        };
    };
    const MenuBarToggledContext = contextkey_1.$Ii.and(contextkeys_1.$33.toNegated(), contextkey_1.$Ii.notEquals('config.window.menuBarVisibility', 'hidden'), contextkey_1.$Ii.notEquals('config.window.menuBarVisibility', 'toggle'), contextkey_1.$Ii.notEquals('config.window.menuBarVisibility', 'compact'));
    const ToggleVisibilityActions = [];
    if (!platform_1.$j || !platform_1.$m) {
        ToggleVisibilityActions.push(CreateToggleLayoutItem('workbench.action.toggleMenuBar', MenuBarToggledContext, (0, nls_1.localize)(83, null), menubarIcon));
    }
    ToggleVisibilityActions.push(...[
        CreateToggleLayoutItem($Ptb.ID, contextkey_1.$Ii.equals('config.workbench.activityBar.visible', true), (0, nls_1.localize)(84, null), { whenA: contextkey_1.$Ii.equals('config.workbench.sideBar.location', 'left'), iconA: activityBarLeftIcon, iconB: activityBarRightIcon }),
        CreateToggleLayoutItem(ToggleSidebarVisibilityAction.ID, contextkeys_2.$qdb, (0, nls_1.localize)(85, null), { whenA: contextkey_1.$Ii.equals('config.workbench.sideBar.location', 'left'), iconA: panelLeftIcon, iconB: panelRightIcon }),
        CreateToggleLayoutItem(auxiliaryBarActions_1.$ztb.ID, contextkeys_2.$Adb, (0, nls_1.localize)(86, null), { whenA: contextkey_1.$Ii.equals('config.workbench.sideBar.location', 'left'), iconA: panelRightIcon, iconB: panelLeftIcon }),
        CreateToggleLayoutItem(panelActions_1.$Jtb.ID, contextkeys_2.$Fdb, (0, nls_1.localize)(87, null), panelIcon),
        CreateToggleLayoutItem($Rtb.ID, contextkey_1.$Ii.equals('config.workbench.statusBar.visible', true), (0, nls_1.localize)(88, null), statusBarIcon),
    ]);
    const MoveSideBarActions = [
        CreateOptionLayoutItem(MoveSidebarLeftAction.ID, contextkey_1.$Ii.equals('config.workbench.sideBar.location', 'left'), (0, nls_1.localize)(89, null), panelLeftIcon),
        CreateOptionLayoutItem(MoveSidebarRightAction.ID, contextkey_1.$Ii.equals('config.workbench.sideBar.location', 'right'), (0, nls_1.localize)(90, null), panelRightIcon),
    ];
    const AlignPanelActions = [
        CreateOptionLayoutItem('workbench.action.alignPanelLeft', contextkeys_2.$Edb.isEqualTo('left'), (0, nls_1.localize)(91, null), panelAlignmentLeftIcon),
        CreateOptionLayoutItem('workbench.action.alignPanelRight', contextkeys_2.$Edb.isEqualTo('right'), (0, nls_1.localize)(92, null), panelAlignmentRightIcon),
        CreateOptionLayoutItem('workbench.action.alignPanelCenter', contextkeys_2.$Edb.isEqualTo('center'), (0, nls_1.localize)(93, null), panelAlignmentCenterIcon),
        CreateOptionLayoutItem('workbench.action.alignPanelJustify', contextkeys_2.$Edb.isEqualTo('justify'), (0, nls_1.localize)(94, null), panelAlignmentJustifyIcon),
    ];
    const MiscLayoutOptions = [
        CreateOptionLayoutItem('workbench.action.toggleFullScreen', contextkeys_2.$Ycb, (0, nls_1.localize)(95, null), fullscreenIcon),
        CreateOptionLayoutItem('workbench.action.toggleZenMode', contextkeys_2.$ldb, (0, nls_1.localize)(96, null), zenModeIcon),
        CreateOptionLayoutItem('workbench.action.toggleCenteredLayout', contextkeys_2.$mdb, (0, nls_1.localize)(97, null), centerLayoutIcon),
    ];
    const LayoutContextKeySet = new Set();
    for (const { active } of [...ToggleVisibilityActions, ...MoveSideBarActions, ...AlignPanelActions, ...MiscLayoutOptions]) {
        for (const key of active.keys()) {
            LayoutContextKeySet.add(key);
        }
    }
    (0, actions_1.$Xu)(class CustomizeLayoutAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.customizeLayout',
                title: { original: 'Customize Layout...', value: (0, nls_1.localize)(98, null) },
                f1: true,
                icon: configureLayoutIcon,
                menu: [
                    {
                        id: actions_1.$Ru.LayoutControlMenuSubmenu,
                        group: 'z_end',
                    },
                    {
                        id: actions_1.$Ru.LayoutControlMenu,
                        when: contextkey_1.$Ii.equals('config.workbench.layoutControl.type', 'both'),
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
                    label: (0, nls_1.localize)(99, null)
                },
                ...ToggleVisibilityActions.map(toQuickPickItem),
                {
                    type: 'separator',
                    label: (0, nls_1.localize)(100, null)
                },
                ...MoveSideBarActions.map(toQuickPickItem),
                {
                    type: 'separator',
                    label: (0, nls_1.localize)(101, null)
                },
                ...AlignPanelActions.map(toQuickPickItem),
                {
                    type: 'separator',
                    label: (0, nls_1.localize)(102, null),
                },
                ...MiscLayoutOptions.map(toQuickPickItem),
            ];
        }
        run(accessor) {
            if (this.a) {
                this.a.hide();
                return;
            }
            const configurationService = accessor.get(configuration_1.$8h);
            const contextKeyService = accessor.get(contextkey_1.$3i);
            const commandService = accessor.get(commands_1.$Fr);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const quickPick = quickInputService.createQuickPick();
            this.a = quickPick;
            quickPick.items = this.getItems(contextKeyService);
            quickPick.ignoreFocusOut = true;
            quickPick.hideInput = true;
            quickPick.title = (0, nls_1.localize)(103, null);
            const closeButton = {
                alwaysVisible: true,
                iconClass: themables_1.ThemeIcon.asClassName(codicons_1.$Pj.close),
                tooltip: (0, nls_1.localize)(104, null)
            };
            const resetButton = {
                alwaysVisible: true,
                iconClass: themables_1.ThemeIcon.asClassName(codicons_1.$Pj.discard),
                tooltip: (0, nls_1.localize)(105, null)
            };
            quickPick.buttons = [
                resetButton,
                closeButton
            ];
            const disposables = new lifecycle_1.$jc();
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
                    if (!platform_1.$j || !platform_1.$m) {
                        resetSetting('window.menuBarVisibility');
                    }
                    commandService.executeCommand('workbench.action.alignPanelCenter');
                }
            });
            quickPick.onDidHide(() => {
                quickPick.dispose();
            });
            quickPick.onDispose(() => {
                this.a = undefined;
                disposables.dispose();
            });
            quickPick.show();
        }
    });
});
//# sourceMappingURL=layoutActions.js.map