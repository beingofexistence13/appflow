/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/panel/panelActions", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/browser/parts/compositeBarActions", "vs/workbench/common/contextkeys", "vs/platform/contextkey/common/contextkey", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/common/views", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/notification/common/notification", "vs/css!./media/panelpart"], function (require, exports, nls_1, actions_1, actionCommonCategories_1, layoutService_1, compositeBarActions_1, contextkeys_1, contextkey_1, codicons_1, iconRegistry_1, views_1, panecomposite_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Otb = exports.$Ntb = exports.$Mtb = exports.$Ltb = exports.$Ktb = exports.$Jtb = void 0;
    const maximizeIcon = (0, iconRegistry_1.$9u)('panel-maximize', codicons_1.$Pj.chevronUp, (0, nls_1.localize)(0, null));
    const restoreIcon = (0, iconRegistry_1.$9u)('panel-restore', codicons_1.$Pj.chevronDown, (0, nls_1.localize)(1, null));
    const closeIcon = (0, iconRegistry_1.$9u)('panel-close', codicons_1.$Pj.close, (0, nls_1.localize)(2, null));
    const panelIcon = (0, iconRegistry_1.$9u)('panel-layout-icon', codicons_1.$Pj.layoutPanel, (0, nls_1.localize)(3, null));
    const panelOffIcon = (0, iconRegistry_1.$9u)('panel-layout-icon-off', codicons_1.$Pj.layoutPanelOff, (0, nls_1.localize)(4, null));
    class $Jtb extends actions_1.$Wu {
        static { this.ID = 'workbench.action.togglePanel'; }
        static { this.LABEL = (0, nls_1.localize)(5, null); }
        constructor() {
            super({
                id: $Jtb.ID,
                title: { value: $Jtb.LABEL, original: 'Toggle Panel Visibility' },
                toggled: {
                    condition: contextkeys_1.$Fdb,
                    title: (0, nls_1.localize)(6, null),
                    mnemonicTitle: (0, nls_1.localize)(7, null),
                },
                f1: true,
                category: actionCommonCategories_1.$Nl.View,
                keybinding: { primary: 2048 /* KeyMod.CtrlCmd */ | 40 /* KeyCode.KeyJ */, weight: 200 /* KeybindingWeight.WorkbenchContrib */ },
                menu: [
                    {
                        id: actions_1.$Ru.MenubarAppearanceMenu,
                        group: '2_workbench_layout',
                        order: 5
                    }, {
                        id: actions_1.$Ru.LayoutControlMenuSubmenu,
                        group: '0_workbench_layout',
                        order: 4
                    },
                ]
            });
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.$Meb);
            layoutService.setPartHidden(layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */), "workbench.parts.panel" /* Parts.PANEL_PART */);
        }
    }
    exports.$Jtb = $Jtb;
    (0, actions_1.$Xu)($Jtb);
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        static { this.ID = 'workbench.action.focusPanel'; }
        static { this.LABEL = (0, nls_1.localize)(8, null); }
        constructor() {
            super({
                id: 'workbench.action.focusPanel',
                title: { value: (0, nls_1.localize)(9, null), original: 'Focus into Panel' },
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
            });
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.$Meb);
            const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
            // Show panel
            if (!layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
                layoutService.setPartHidden(false, "workbench.parts.panel" /* Parts.PANEL_PART */);
            }
            // Focus into active panel
            const panel = paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
            panel?.focus();
        }
    });
    const PositionPanelActionId = {
        LEFT: 'workbench.action.positionPanelLeft',
        RIGHT: 'workbench.action.positionPanelRight',
        BOTTOM: 'workbench.action.positionPanelBottom',
    };
    const AlignPanelActionId = {
        LEFT: 'workbench.action.alignPanelLeft',
        RIGHT: 'workbench.action.alignPanelRight',
        CENTER: 'workbench.action.alignPanelCenter',
        JUSTIFY: 'workbench.action.alignPanelJustify',
    };
    function createPanelActionConfig(id, title, shortLabel, value, when) {
        return {
            id,
            title,
            shortLabel,
            value,
            when,
        };
    }
    function createPositionPanelActionConfig(id, title, shortLabel, position) {
        return createPanelActionConfig(id, title, shortLabel, position, contextkeys_1.$Ddb.notEqualsTo((0, layoutService_1.$Neb)(position)));
    }
    function createAlignmentPanelActionConfig(id, title, shortLabel, alignment) {
        return createPanelActionConfig(id, title, shortLabel, alignment, contextkeys_1.$Edb.notEqualsTo(alignment));
    }
    const PositionPanelActionConfigs = [
        createPositionPanelActionConfig(PositionPanelActionId.LEFT, { value: (0, nls_1.localize)(10, null), original: 'Move Panel Left' }, (0, nls_1.localize)(11, null), 0 /* Position.LEFT */),
        createPositionPanelActionConfig(PositionPanelActionId.RIGHT, { value: (0, nls_1.localize)(12, null), original: 'Move Panel Right' }, (0, nls_1.localize)(13, null), 1 /* Position.RIGHT */),
        createPositionPanelActionConfig(PositionPanelActionId.BOTTOM, { value: (0, nls_1.localize)(14, null), original: 'Move Panel To Bottom' }, (0, nls_1.localize)(15, null), 2 /* Position.BOTTOM */),
    ];
    const AlignPanelActionConfigs = [
        createAlignmentPanelActionConfig(AlignPanelActionId.LEFT, { value: (0, nls_1.localize)(16, null), original: 'Set Panel Alignment to Left' }, (0, nls_1.localize)(17, null), 'left'),
        createAlignmentPanelActionConfig(AlignPanelActionId.RIGHT, { value: (0, nls_1.localize)(18, null), original: 'Set Panel Alignment to Right' }, (0, nls_1.localize)(19, null), 'right'),
        createAlignmentPanelActionConfig(AlignPanelActionId.CENTER, { value: (0, nls_1.localize)(20, null), original: 'Set Panel Alignment to Center' }, (0, nls_1.localize)(21, null), 'center'),
        createAlignmentPanelActionConfig(AlignPanelActionId.JUSTIFY, { value: (0, nls_1.localize)(22, null), original: 'Set Panel Alignment to Justify' }, (0, nls_1.localize)(23, null), 'justify'),
    ];
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarAppearanceMenu, {
        submenu: actions_1.$Ru.PanelPositionMenu,
        title: (0, nls_1.localize)(24, null),
        group: '3_workbench_layout_move',
        order: 4
    });
    PositionPanelActionConfigs.forEach(positionPanelAction => {
        const { id, title, shortLabel, value, when } = positionPanelAction;
        (0, actions_1.$Xu)(class extends actions_1.$Wu {
            constructor() {
                super({
                    id,
                    title,
                    category: actionCommonCategories_1.$Nl.View,
                    f1: true
                });
            }
            run(accessor) {
                const layoutService = accessor.get(layoutService_1.$Meb);
                layoutService.setPanelPosition(value === undefined ? 2 /* Position.BOTTOM */ : value);
            }
        });
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.PanelPositionMenu, {
            command: {
                id,
                title: shortLabel,
                toggled: when.negate()
            },
            order: 5
        });
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarAppearanceMenu, {
        submenu: actions_1.$Ru.PanelAlignmentMenu,
        title: (0, nls_1.localize)(25, null),
        group: '3_workbench_layout_move',
        order: 5
    });
    AlignPanelActionConfigs.forEach(alignPanelAction => {
        const { id, title, shortLabel, value, when } = alignPanelAction;
        (0, actions_1.$Xu)(class extends actions_1.$Wu {
            constructor() {
                super({
                    id,
                    title: title,
                    category: actionCommonCategories_1.$Nl.View,
                    toggled: when.negate(),
                    f1: true
                });
            }
            run(accessor) {
                const layoutService = accessor.get(layoutService_1.$Meb);
                layoutService.setPanelAlignment(value === undefined ? 'center' : value);
            }
        });
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.PanelAlignmentMenu, {
            command: {
                id,
                title: shortLabel,
                toggled: when.negate()
            },
            order: 5
        });
    });
    let $Ktb = class $Ktb extends compositeBarActions_1.$Ctb {
        constructor(activity, a, s) {
            super(activity);
            this.a = a;
            this.s = s;
        }
        async run() {
            await this.s.openPaneComposite(this.activity.id, this.a, true);
            this.activate();
        }
        setActivity(activity) {
            this.activity = activity;
        }
    };
    exports.$Ktb = $Ktb;
    exports.$Ktb = $Ktb = __decorate([
        __param(2, panecomposite_1.$Yeb)
    ], $Ktb);
    let $Ltb = class $Ltb extends $Ktb {
        constructor(id, viewContainerLocation, paneCompositeService) {
            super({ id, name: id }, viewContainerLocation, paneCompositeService);
        }
    };
    exports.$Ltb = $Ltb;
    exports.$Ltb = $Ltb = __decorate([
        __param(2, panecomposite_1.$Yeb)
    ], $Ltb);
    class $Mtb extends compositeBarActions_1.$Htb {
        constructor(id, compositeBar) {
            super({ id, name: id, classNames: undefined }, compositeBar);
        }
        setActivity(activity) {
            this.label = activity.name;
        }
    }
    exports.$Mtb = $Mtb;
    class SwitchPanelViewAction extends actions_1.$Wu {
        constructor(id, title) {
            super({
                id,
                title,
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
            });
        }
        async run(accessor, offset) {
            const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
            const pinnedPanels = paneCompositeService.getPinnedPaneCompositeIds(1 /* ViewContainerLocation.Panel */);
            const activePanel = paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
            if (!activePanel) {
                return;
            }
            let targetPanelId;
            for (let i = 0; i < pinnedPanels.length; i++) {
                if (pinnedPanels[i] === activePanel.getId()) {
                    targetPanelId = pinnedPanels[(i + pinnedPanels.length + offset) % pinnedPanels.length];
                    break;
                }
            }
            if (typeof targetPanelId === 'string') {
                await paneCompositeService.openPaneComposite(targetPanelId, 1 /* ViewContainerLocation.Panel */, true);
            }
        }
    }
    (0, actions_1.$Xu)(class extends SwitchPanelViewAction {
        constructor() {
            super('workbench.action.previousPanelView', {
                value: (0, nls_1.localize)(26, null),
                original: 'Previous Panel View'
            });
        }
        run(accessor) {
            return super.run(accessor, -1);
        }
    });
    (0, actions_1.$Xu)(class extends SwitchPanelViewAction {
        constructor() {
            super('workbench.action.nextPanelView', {
                value: (0, nls_1.localize)(27, null),
                original: 'Next Panel View'
            });
        }
        run(accessor) {
            return super.run(accessor, 1);
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.toggleMaximizedPanel',
                title: { value: (0, nls_1.localize)(28, null), original: 'Toggle Maximized Panel' },
                tooltip: (0, nls_1.localize)(29, null),
                category: actionCommonCategories_1.$Nl.View,
                f1: true,
                icon: maximizeIcon,
                // the workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
                precondition: contextkey_1.$Ii.or(contextkeys_1.$Edb.isEqualTo('center'), contextkeys_1.$Ddb.notEqualsTo('bottom')),
                toggled: { condition: contextkeys_1.$Gdb, icon: restoreIcon, tooltip: (0, nls_1.localize)(30, null) },
                menu: [{
                        id: actions_1.$Ru.PanelTitle,
                        group: 'navigation',
                        order: 1,
                        // the workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
                        when: contextkey_1.$Ii.or(contextkeys_1.$Edb.isEqualTo('center'), contextkeys_1.$Ddb.notEqualsTo('bottom'))
                    }]
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.$Meb);
            const notificationService = accessor.get(notification_1.$Yu);
            if (layoutService.getPanelAlignment() !== 'center' && layoutService.getPanelPosition() === 2 /* Position.BOTTOM */) {
                notificationService.warn((0, nls_1.localize)(31, null));
                return;
            }
            if (!layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
                layoutService.setPartHidden(false, "workbench.parts.panel" /* Parts.PANEL_PART */);
                // If the panel is not already maximized, maximize it
                if (!layoutService.isPanelMaximized()) {
                    layoutService.toggleMaximizedPanel();
                }
            }
            else {
                layoutService.toggleMaximizedPanel();
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.closePanel',
                title: { value: (0, nls_1.localize)(32, null), original: 'Close Panel' },
                category: actionCommonCategories_1.$Nl.View,
                icon: closeIcon,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: contextkeys_1.$Fdb,
                    }, {
                        id: actions_1.$Ru.PanelTitle,
                        group: 'navigation',
                        order: 2
                    }]
            });
        }
        run(accessor) {
            accessor.get(layoutService_1.$Meb).setPartHidden(true, "workbench.parts.panel" /* Parts.PANEL_PART */);
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.closeAuxiliaryBar',
                title: { value: (0, nls_1.localize)(33, null), original: 'Close Secondary Side Bar' },
                category: actionCommonCategories_1.$Nl.View,
                icon: closeIcon,
                menu: [{
                        id: actions_1.$Ru.CommandPalette,
                        when: contextkeys_1.$Adb,
                    }, {
                        id: actions_1.$Ru.AuxiliaryBarTitle,
                        group: 'navigation',
                        order: 2
                    }]
            });
        }
        run(accessor) {
            accessor.get(layoutService_1.$Meb).setPartHidden(true, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
        }
    });
    actions_1.$Tu.appendMenuItems([
        {
            id: actions_1.$Ru.LayoutControlMenu,
            item: {
                group: '0_workbench_toggles',
                command: {
                    id: $Jtb.ID,
                    title: (0, nls_1.localize)(34, null),
                    icon: panelOffIcon,
                    toggled: { condition: contextkeys_1.$Fdb, icon: panelIcon }
                },
                when: contextkey_1.$Ii.or(contextkey_1.$Ii.equals('config.workbench.layoutControl.type', 'toggles'), contextkey_1.$Ii.equals('config.workbench.layoutControl.type', 'both')),
                order: 1
            }
        }, {
            id: actions_1.$Ru.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: $Jtb.ID,
                    title: { value: (0, nls_1.localize)(35, null), original: 'Hide Panel' },
                },
                when: contextkey_1.$Ii.and(contextkeys_1.$Fdb, contextkey_1.$Ii.equals('viewLocation', (0, views_1.$0E)(1 /* ViewContainerLocation.Panel */))),
                order: 2
            }
        }
    ]);
    class MoveViewsBetweenPanelsAction extends actions_1.$Wu {
        constructor(a, b, desc) {
            super(desc);
            this.a = a;
            this.b = b;
        }
        run(accessor, ...args) {
            const viewDescriptorService = accessor.get(views_1.$_E);
            const layoutService = accessor.get(layoutService_1.$Meb);
            const viewsService = accessor.get(views_1.$$E);
            const srcContainers = viewDescriptorService.getViewContainersByLocation(this.a);
            const destContainers = viewDescriptorService.getViewContainersByLocation(this.b);
            if (srcContainers.length) {
                const activeViewContainer = viewsService.getVisibleViewContainer(this.a);
                srcContainers.forEach(viewContainer => viewDescriptorService.moveViewContainerToLocation(viewContainer, this.b));
                layoutService.setPartHidden(false, this.b === 1 /* ViewContainerLocation.Panel */ ? "workbench.parts.panel" /* Parts.PANEL_PART */ : "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
                if (activeViewContainer && destContainers.length === 0) {
                    viewsService.openViewContainer(activeViewContainer.id, true);
                }
            }
        }
    }
    // --- Move Panel Views To Secondary Side Bar
    class MovePanelToSidePanelAction extends MoveViewsBetweenPanelsAction {
        static { this.ID = 'workbench.action.movePanelToSidePanel'; }
        constructor() {
            super(1 /* ViewContainerLocation.Panel */, 2 /* ViewContainerLocation.AuxiliaryBar */, {
                id: MovePanelToSidePanelAction.ID,
                title: {
                    value: (0, nls_1.localize)(36, null),
                    original: 'Move Panel Views To Secondary Side Bar'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: false
            });
        }
    }
    class $Ntb extends MoveViewsBetweenPanelsAction {
        static { this.ID = 'workbench.action.movePanelToSecondarySideBar'; }
        constructor() {
            super(1 /* ViewContainerLocation.Panel */, 2 /* ViewContainerLocation.AuxiliaryBar */, {
                id: $Ntb.ID,
                title: {
                    value: (0, nls_1.localize)(37, null),
                    original: 'Move Panel Views To Secondary Side Bar'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            });
        }
    }
    exports.$Ntb = $Ntb;
    (0, actions_1.$Xu)(MovePanelToSidePanelAction);
    (0, actions_1.$Xu)($Ntb);
    // --- Move Secondary Side Bar Views To Panel
    class MoveSidePanelToPanelAction extends MoveViewsBetweenPanelsAction {
        static { this.ID = 'workbench.action.moveSidePanelToPanel'; }
        constructor() {
            super(2 /* ViewContainerLocation.AuxiliaryBar */, 1 /* ViewContainerLocation.Panel */, {
                id: MoveSidePanelToPanelAction.ID,
                title: {
                    value: (0, nls_1.localize)(38, null),
                    original: 'Move Secondary Side Bar Views To Panel'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: false
            });
        }
    }
    class $Otb extends MoveViewsBetweenPanelsAction {
        static { this.ID = 'workbench.action.moveSecondarySideBarToPanel'; }
        constructor() {
            super(2 /* ViewContainerLocation.AuxiliaryBar */, 1 /* ViewContainerLocation.Panel */, {
                id: $Otb.ID,
                title: {
                    value: (0, nls_1.localize)(39, null),
                    original: 'Move Secondary Side Bar Views To Panel'
                },
                category: actionCommonCategories_1.$Nl.View,
                f1: true
            });
        }
    }
    exports.$Otb = $Otb;
    (0, actions_1.$Xu)(MoveSidePanelToPanelAction);
    (0, actions_1.$Xu)($Otb);
});
//# sourceMappingURL=panelActions.js.map