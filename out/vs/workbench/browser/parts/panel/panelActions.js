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
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/action/common/actionCommonCategories", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/browser/parts/compositeBarActions", "vs/workbench/common/contextkeys", "vs/platform/contextkey/common/contextkey", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/common/views", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/notification/common/notification", "vs/css!./media/panelpart"], function (require, exports, nls_1, actions_1, actionCommonCategories_1, layoutService_1, compositeBarActions_1, contextkeys_1, contextkey_1, codicons_1, iconRegistry_1, views_1, panecomposite_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MoveSecondarySideBarToPanelAction = exports.MovePanelToSecondarySideBarAction = exports.PlaceHolderToggleCompositePinnedAction = exports.PlaceHolderPanelActivityAction = exports.PanelActivityAction = exports.TogglePanelAction = void 0;
    const maximizeIcon = (0, iconRegistry_1.registerIcon)('panel-maximize', codicons_1.Codicon.chevronUp, (0, nls_1.localize)('maximizeIcon', 'Icon to maximize a panel.'));
    const restoreIcon = (0, iconRegistry_1.registerIcon)('panel-restore', codicons_1.Codicon.chevronDown, (0, nls_1.localize)('restoreIcon', 'Icon to restore a panel.'));
    const closeIcon = (0, iconRegistry_1.registerIcon)('panel-close', codicons_1.Codicon.close, (0, nls_1.localize)('closeIcon', 'Icon to close a panel.'));
    const panelIcon = (0, iconRegistry_1.registerIcon)('panel-layout-icon', codicons_1.Codicon.layoutPanel, (0, nls_1.localize)('togglePanelOffIcon', 'Icon to toggle the panel off when it is on.'));
    const panelOffIcon = (0, iconRegistry_1.registerIcon)('panel-layout-icon-off', codicons_1.Codicon.layoutPanelOff, (0, nls_1.localize)('togglePanelOnIcon', 'Icon to toggle the panel on when it is off.'));
    class TogglePanelAction extends actions_1.Action2 {
        static { this.ID = 'workbench.action.togglePanel'; }
        static { this.LABEL = (0, nls_1.localize)('togglePanelVisibility', "Toggle Panel Visibility"); }
        constructor() {
            super({
                id: TogglePanelAction.ID,
                title: { value: TogglePanelAction.LABEL, original: 'Toggle Panel Visibility' },
                toggled: {
                    condition: contextkeys_1.PanelVisibleContext,
                    title: (0, nls_1.localize)('toggle panel', "Panel"),
                    mnemonicTitle: (0, nls_1.localize)({ key: 'toggle panel mnemonic', comment: ['&& denotes a mnemonic'] }, "&&Panel"),
                },
                f1: true,
                category: actionCommonCategories_1.Categories.View,
                keybinding: { primary: 2048 /* KeyMod.CtrlCmd */ | 40 /* KeyCode.KeyJ */, weight: 200 /* KeybindingWeight.WorkbenchContrib */ },
                menu: [
                    {
                        id: actions_1.MenuId.MenubarAppearanceMenu,
                        group: '2_workbench_layout',
                        order: 5
                    }, {
                        id: actions_1.MenuId.LayoutControlMenuSubmenu,
                        group: '0_workbench_layout',
                        order: 4
                    },
                ]
            });
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            layoutService.setPartHidden(layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */), "workbench.parts.panel" /* Parts.PANEL_PART */);
        }
    }
    exports.TogglePanelAction = TogglePanelAction;
    (0, actions_1.registerAction2)(TogglePanelAction);
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        static { this.ID = 'workbench.action.focusPanel'; }
        static { this.LABEL = (0, nls_1.localize)('focusPanel', "Focus into Panel"); }
        constructor() {
            super({
                id: 'workbench.action.focusPanel',
                title: { value: (0, nls_1.localize)('focusPanel', "Focus into Panel"), original: 'Focus into Panel' },
                category: actionCommonCategories_1.Categories.View,
                f1: true,
            });
        }
        async run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
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
        return createPanelActionConfig(id, title, shortLabel, position, contextkeys_1.PanelPositionContext.notEqualsTo((0, layoutService_1.positionToString)(position)));
    }
    function createAlignmentPanelActionConfig(id, title, shortLabel, alignment) {
        return createPanelActionConfig(id, title, shortLabel, alignment, contextkeys_1.PanelAlignmentContext.notEqualsTo(alignment));
    }
    const PositionPanelActionConfigs = [
        createPositionPanelActionConfig(PositionPanelActionId.LEFT, { value: (0, nls_1.localize)('positionPanelLeft', 'Move Panel Left'), original: 'Move Panel Left' }, (0, nls_1.localize)('positionPanelLeftShort', "Left"), 0 /* Position.LEFT */),
        createPositionPanelActionConfig(PositionPanelActionId.RIGHT, { value: (0, nls_1.localize)('positionPanelRight', 'Move Panel Right'), original: 'Move Panel Right' }, (0, nls_1.localize)('positionPanelRightShort', "Right"), 1 /* Position.RIGHT */),
        createPositionPanelActionConfig(PositionPanelActionId.BOTTOM, { value: (0, nls_1.localize)('positionPanelBottom', 'Move Panel To Bottom'), original: 'Move Panel To Bottom' }, (0, nls_1.localize)('positionPanelBottomShort', "Bottom"), 2 /* Position.BOTTOM */),
    ];
    const AlignPanelActionConfigs = [
        createAlignmentPanelActionConfig(AlignPanelActionId.LEFT, { value: (0, nls_1.localize)('alignPanelLeft', 'Set Panel Alignment to Left'), original: 'Set Panel Alignment to Left' }, (0, nls_1.localize)('alignPanelLeftShort', "Left"), 'left'),
        createAlignmentPanelActionConfig(AlignPanelActionId.RIGHT, { value: (0, nls_1.localize)('alignPanelRight', 'Set Panel Alignment to Right'), original: 'Set Panel Alignment to Right' }, (0, nls_1.localize)('alignPanelRightShort', "Right"), 'right'),
        createAlignmentPanelActionConfig(AlignPanelActionId.CENTER, { value: (0, nls_1.localize)('alignPanelCenter', 'Set Panel Alignment to Center'), original: 'Set Panel Alignment to Center' }, (0, nls_1.localize)('alignPanelCenterShort', "Center"), 'center'),
        createAlignmentPanelActionConfig(AlignPanelActionId.JUSTIFY, { value: (0, nls_1.localize)('alignPanelJustify', 'Set Panel Alignment to Justify'), original: 'Set Panel Alignment to Justify' }, (0, nls_1.localize)('alignPanelJustifyShort', "Justify"), 'justify'),
    ];
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarAppearanceMenu, {
        submenu: actions_1.MenuId.PanelPositionMenu,
        title: (0, nls_1.localize)('positionPanel', "Panel Position"),
        group: '3_workbench_layout_move',
        order: 4
    });
    PositionPanelActionConfigs.forEach(positionPanelAction => {
        const { id, title, shortLabel, value, when } = positionPanelAction;
        (0, actions_1.registerAction2)(class extends actions_1.Action2 {
            constructor() {
                super({
                    id,
                    title,
                    category: actionCommonCategories_1.Categories.View,
                    f1: true
                });
            }
            run(accessor) {
                const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
                layoutService.setPanelPosition(value === undefined ? 2 /* Position.BOTTOM */ : value);
            }
        });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.PanelPositionMenu, {
            command: {
                id,
                title: shortLabel,
                toggled: when.negate()
            },
            order: 5
        });
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarAppearanceMenu, {
        submenu: actions_1.MenuId.PanelAlignmentMenu,
        title: (0, nls_1.localize)('alignPanel', "Align Panel"),
        group: '3_workbench_layout_move',
        order: 5
    });
    AlignPanelActionConfigs.forEach(alignPanelAction => {
        const { id, title, shortLabel, value, when } = alignPanelAction;
        (0, actions_1.registerAction2)(class extends actions_1.Action2 {
            constructor() {
                super({
                    id,
                    title: title,
                    category: actionCommonCategories_1.Categories.View,
                    toggled: when.negate(),
                    f1: true
                });
            }
            run(accessor) {
                const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
                layoutService.setPanelAlignment(value === undefined ? 'center' : value);
            }
        });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.PanelAlignmentMenu, {
            command: {
                id,
                title: shortLabel,
                toggled: when.negate()
            },
            order: 5
        });
    });
    let PanelActivityAction = class PanelActivityAction extends compositeBarActions_1.ActivityAction {
        constructor(activity, viewContainerLocation, paneCompositeService) {
            super(activity);
            this.viewContainerLocation = viewContainerLocation;
            this.paneCompositeService = paneCompositeService;
        }
        async run() {
            await this.paneCompositeService.openPaneComposite(this.activity.id, this.viewContainerLocation, true);
            this.activate();
        }
        setActivity(activity) {
            this.activity = activity;
        }
    };
    exports.PanelActivityAction = PanelActivityAction;
    exports.PanelActivityAction = PanelActivityAction = __decorate([
        __param(2, panecomposite_1.IPaneCompositePartService)
    ], PanelActivityAction);
    let PlaceHolderPanelActivityAction = class PlaceHolderPanelActivityAction extends PanelActivityAction {
        constructor(id, viewContainerLocation, paneCompositeService) {
            super({ id, name: id }, viewContainerLocation, paneCompositeService);
        }
    };
    exports.PlaceHolderPanelActivityAction = PlaceHolderPanelActivityAction;
    exports.PlaceHolderPanelActivityAction = PlaceHolderPanelActivityAction = __decorate([
        __param(2, panecomposite_1.IPaneCompositePartService)
    ], PlaceHolderPanelActivityAction);
    class PlaceHolderToggleCompositePinnedAction extends compositeBarActions_1.ToggleCompositePinnedAction {
        constructor(id, compositeBar) {
            super({ id, name: id, classNames: undefined }, compositeBar);
        }
        setActivity(activity) {
            this.label = activity.name;
        }
    }
    exports.PlaceHolderToggleCompositePinnedAction = PlaceHolderToggleCompositePinnedAction;
    class SwitchPanelViewAction extends actions_1.Action2 {
        constructor(id, title) {
            super({
                id,
                title,
                category: actionCommonCategories_1.Categories.View,
                f1: true,
            });
        }
        async run(accessor, offset) {
            const paneCompositeService = accessor.get(panecomposite_1.IPaneCompositePartService);
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
    (0, actions_1.registerAction2)(class extends SwitchPanelViewAction {
        constructor() {
            super('workbench.action.previousPanelView', {
                value: (0, nls_1.localize)('previousPanelView', 'Previous Panel View'),
                original: 'Previous Panel View'
            });
        }
        run(accessor) {
            return super.run(accessor, -1);
        }
    });
    (0, actions_1.registerAction2)(class extends SwitchPanelViewAction {
        constructor() {
            super('workbench.action.nextPanelView', {
                value: (0, nls_1.localize)('nextPanelView', 'Next Panel View'),
                original: 'Next Panel View'
            });
        }
        run(accessor) {
            return super.run(accessor, 1);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.toggleMaximizedPanel',
                title: { value: (0, nls_1.localize)('toggleMaximizedPanel', "Toggle Maximized Panel"), original: 'Toggle Maximized Panel' },
                tooltip: (0, nls_1.localize)('maximizePanel', "Maximize Panel Size"),
                category: actionCommonCategories_1.Categories.View,
                f1: true,
                icon: maximizeIcon,
                // the workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
                precondition: contextkey_1.ContextKeyExpr.or(contextkeys_1.PanelAlignmentContext.isEqualTo('center'), contextkeys_1.PanelPositionContext.notEqualsTo('bottom')),
                toggled: { condition: contextkeys_1.PanelMaximizedContext, icon: restoreIcon, tooltip: (0, nls_1.localize)('minimizePanel', "Restore Panel Size") },
                menu: [{
                        id: actions_1.MenuId.PanelTitle,
                        group: 'navigation',
                        order: 1,
                        // the workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
                        when: contextkey_1.ContextKeyExpr.or(contextkeys_1.PanelAlignmentContext.isEqualTo('center'), contextkeys_1.PanelPositionContext.notEqualsTo('bottom'))
                    }]
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            const notificationService = accessor.get(notification_1.INotificationService);
            if (layoutService.getPanelAlignment() !== 'center' && layoutService.getPanelPosition() === 2 /* Position.BOTTOM */) {
                notificationService.warn((0, nls_1.localize)('panelMaxNotSupported', "Maximizing the panel is only supported when it is center aligned."));
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
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.closePanel',
                title: { value: (0, nls_1.localize)('closePanel', "Close Panel"), original: 'Close Panel' },
                category: actionCommonCategories_1.Categories.View,
                icon: closeIcon,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkeys_1.PanelVisibleContext,
                    }, {
                        id: actions_1.MenuId.PanelTitle,
                        group: 'navigation',
                        order: 2
                    }]
            });
        }
        run(accessor) {
            accessor.get(layoutService_1.IWorkbenchLayoutService).setPartHidden(true, "workbench.parts.panel" /* Parts.PANEL_PART */);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.closeAuxiliaryBar',
                title: { value: (0, nls_1.localize)('closeSecondarySideBar', "Close Secondary Side Bar"), original: 'Close Secondary Side Bar' },
                category: actionCommonCategories_1.Categories.View,
                icon: closeIcon,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkeys_1.AuxiliaryBarVisibleContext,
                    }, {
                        id: actions_1.MenuId.AuxiliaryBarTitle,
                        group: 'navigation',
                        order: 2
                    }]
            });
        }
        run(accessor) {
            accessor.get(layoutService_1.IWorkbenchLayoutService).setPartHidden(true, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
        }
    });
    actions_1.MenuRegistry.appendMenuItems([
        {
            id: actions_1.MenuId.LayoutControlMenu,
            item: {
                group: '0_workbench_toggles',
                command: {
                    id: TogglePanelAction.ID,
                    title: (0, nls_1.localize)('togglePanel', "Toggle Panel"),
                    icon: panelOffIcon,
                    toggled: { condition: contextkeys_1.PanelVisibleContext, icon: panelIcon }
                },
                when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.type', 'toggles'), contextkey_1.ContextKeyExpr.equals('config.workbench.layoutControl.type', 'both')),
                order: 1
            }
        }, {
            id: actions_1.MenuId.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: TogglePanelAction.ID,
                    title: { value: (0, nls_1.localize)('hidePanel', "Hide Panel"), original: 'Hide Panel' },
                },
                when: contextkey_1.ContextKeyExpr.and(contextkeys_1.PanelVisibleContext, contextkey_1.ContextKeyExpr.equals('viewLocation', (0, views_1.ViewContainerLocationToString)(1 /* ViewContainerLocation.Panel */))),
                order: 2
            }
        }
    ]);
    class MoveViewsBetweenPanelsAction extends actions_1.Action2 {
        constructor(source, destination, desc) {
            super(desc);
            this.source = source;
            this.destination = destination;
        }
        run(accessor, ...args) {
            const viewDescriptorService = accessor.get(views_1.IViewDescriptorService);
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            const viewsService = accessor.get(views_1.IViewsService);
            const srcContainers = viewDescriptorService.getViewContainersByLocation(this.source);
            const destContainers = viewDescriptorService.getViewContainersByLocation(this.destination);
            if (srcContainers.length) {
                const activeViewContainer = viewsService.getVisibleViewContainer(this.source);
                srcContainers.forEach(viewContainer => viewDescriptorService.moveViewContainerToLocation(viewContainer, this.destination));
                layoutService.setPartHidden(false, this.destination === 1 /* ViewContainerLocation.Panel */ ? "workbench.parts.panel" /* Parts.PANEL_PART */ : "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
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
                    value: (0, nls_1.localize)('movePanelToSecondarySideBar', "Move Panel Views To Secondary Side Bar"),
                    original: 'Move Panel Views To Secondary Side Bar'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: false
            });
        }
    }
    class MovePanelToSecondarySideBarAction extends MoveViewsBetweenPanelsAction {
        static { this.ID = 'workbench.action.movePanelToSecondarySideBar'; }
        constructor() {
            super(1 /* ViewContainerLocation.Panel */, 2 /* ViewContainerLocation.AuxiliaryBar */, {
                id: MovePanelToSecondarySideBarAction.ID,
                title: {
                    value: (0, nls_1.localize)('movePanelToSecondarySideBar', "Move Panel Views To Secondary Side Bar"),
                    original: 'Move Panel Views To Secondary Side Bar'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            });
        }
    }
    exports.MovePanelToSecondarySideBarAction = MovePanelToSecondarySideBarAction;
    (0, actions_1.registerAction2)(MovePanelToSidePanelAction);
    (0, actions_1.registerAction2)(MovePanelToSecondarySideBarAction);
    // --- Move Secondary Side Bar Views To Panel
    class MoveSidePanelToPanelAction extends MoveViewsBetweenPanelsAction {
        static { this.ID = 'workbench.action.moveSidePanelToPanel'; }
        constructor() {
            super(2 /* ViewContainerLocation.AuxiliaryBar */, 1 /* ViewContainerLocation.Panel */, {
                id: MoveSidePanelToPanelAction.ID,
                title: {
                    value: (0, nls_1.localize)('moveSidePanelToPanel', "Move Secondary Side Bar Views To Panel"),
                    original: 'Move Secondary Side Bar Views To Panel'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: false
            });
        }
    }
    class MoveSecondarySideBarToPanelAction extends MoveViewsBetweenPanelsAction {
        static { this.ID = 'workbench.action.moveSecondarySideBarToPanel'; }
        constructor() {
            super(2 /* ViewContainerLocation.AuxiliaryBar */, 1 /* ViewContainerLocation.Panel */, {
                id: MoveSecondarySideBarToPanelAction.ID,
                title: {
                    value: (0, nls_1.localize)('moveSidePanelToPanel', "Move Secondary Side Bar Views To Panel"),
                    original: 'Move Secondary Side Bar Views To Panel'
                },
                category: actionCommonCategories_1.Categories.View,
                f1: true
            });
        }
    }
    exports.MoveSecondarySideBarToPanelAction = MoveSecondarySideBarToPanelAction;
    (0, actions_1.registerAction2)(MoveSidePanelToPanelAction);
    (0, actions_1.registerAction2)(MoveSecondarySideBarToPanelAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFuZWxBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvcGFydHMvcGFuZWwvcGFuZWxBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXFCaEcsTUFBTSxZQUFZLEdBQUcsSUFBQSwyQkFBWSxFQUFDLGdCQUFnQixFQUFFLGtCQUFPLENBQUMsU0FBUyxFQUFFLElBQUEsY0FBUSxFQUFDLGNBQWMsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDLENBQUM7SUFDOUgsTUFBTSxXQUFXLEdBQUcsSUFBQSwyQkFBWSxFQUFDLGVBQWUsRUFBRSxrQkFBTyxDQUFDLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxhQUFhLEVBQUUsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO0lBQzVILE1BQU0sU0FBUyxHQUFHLElBQUEsMkJBQVksRUFBQyxhQUFhLEVBQUUsa0JBQU8sQ0FBQyxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLHdCQUF3QixDQUFDLENBQUMsQ0FBQztJQUM5RyxNQUFNLFNBQVMsR0FBRyxJQUFBLDJCQUFZLEVBQUMsbUJBQW1CLEVBQUUsa0JBQU8sQ0FBQyxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsNkNBQTZDLENBQUMsQ0FBQyxDQUFDO0lBQ3hKLE1BQU0sWUFBWSxHQUFHLElBQUEsMkJBQVksRUFBQyx1QkFBdUIsRUFBRSxrQkFBTyxDQUFDLGNBQWMsRUFBRSxJQUFBLGNBQVEsRUFBQyxtQkFBbUIsRUFBRSw2Q0FBNkMsQ0FBQyxDQUFDLENBQUM7SUFFakssTUFBYSxpQkFBa0IsU0FBUSxpQkFBTztpQkFFN0IsT0FBRSxHQUFHLDhCQUE4QixDQUFDO2lCQUNwQyxVQUFLLEdBQUcsSUFBQSxjQUFRLEVBQUMsdUJBQXVCLEVBQUUseUJBQXlCLENBQUMsQ0FB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