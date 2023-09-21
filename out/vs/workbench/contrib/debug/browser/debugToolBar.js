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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actions/browser/dropdownWithPrimaryActionViewItem", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/debug/browser/debugActionViewItems", "vs/workbench/contrib/debug/browser/debugColors", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/layout/browser/layoutService", "vs/base/common/codicons", "vs/css!./media/debugToolBar"], function (require, exports, browser, dom, mouseEvent_1, actionbar_1, actions_1, arrays, async_1, errors, lifecycle_1, nls_1, dropdownWithPrimaryActionViewItem_1, menuEntryActionViewItem_1, actions_2, configuration_1, contextkey_1, contextView_1, instantiation_1, notification_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, themables_1, debugActionViewItems_1, debugColors_1, debugCommands_1, icons, debug_1, layoutService_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createDisconnectMenuItemAction = exports.DebugToolBar = void 0;
    const DEBUG_TOOLBAR_POSITION_KEY = 'debug.actionswidgetposition';
    const DEBUG_TOOLBAR_Y_KEY = 'debug.actionswidgety';
    let DebugToolBar = class DebugToolBar extends themeService_1.Themable {
        constructor(notificationService, telemetryService, debugService, layoutService, storageService, configurationService, themeService, instantiationService, menuService, contextKeyService) {
            super(themeService);
            this.notificationService = notificationService;
            this.telemetryService = telemetryService;
            this.debugService = debugService;
            this.layoutService = layoutService;
            this.storageService = storageService;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.yCoordinate = 0;
            this.isVisible = false;
            this.isBuilt = false;
            this.stopActionViewItemDisposables = this._register(new lifecycle_1.DisposableStore());
            this.$el = dom.$('div.debug-toolbar');
            this.$el.style.top = `${layoutService.offset.top}px`;
            this.dragArea = dom.append(this.$el, dom.$('div.drag-area' + themables_1.ThemeIcon.asCSSSelector(icons.debugGripper)));
            const actionBarContainer = dom.append(this.$el, dom.$('div.action-bar-container'));
            this.debugToolBarMenu = menuService.createMenu(actions_2.MenuId.DebugToolBar, contextKeyService);
            this._register(this.debugToolBarMenu);
            this.activeActions = [];
            this.actionBar = this._register(new actionbar_1.ActionBar(actionBarContainer, {
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                actionViewItemProvider: (action) => {
                    if (action.id === debugCommands_1.FOCUS_SESSION_ID) {
                        return this.instantiationService.createInstance(debugActionViewItems_1.FocusSessionActionViewItem, action, undefined);
                    }
                    else if (action.id === debugCommands_1.STOP_ID || action.id === debugCommands_1.DISCONNECT_ID) {
                        this.stopActionViewItemDisposables.clear();
                        const item = this.instantiationService.invokeFunction(accessor => createDisconnectMenuItemAction(action, this.stopActionViewItemDisposables, accessor));
                        if (item) {
                            return item;
                        }
                    }
                    return (0, menuEntryActionViewItem_1.createActionViewItem)(this.instantiationService, action);
                }
            }));
            this.updateScheduler = this._register(new async_1.RunOnceScheduler(() => {
                const state = this.debugService.state;
                const toolBarLocation = this.configurationService.getValue('debug').toolBarLocation;
                if (state === 0 /* State.Inactive */ ||
                    toolBarLocation !== 'floating' ||
                    this.debugService.getModel().getSessions().every(s => s.suppressDebugToolbar) ||
                    (state === 1 /* State.Initializing */ && this.debugService.initializingOptions?.suppressDebugToolbar)) {
                    return this.hide();
                }
                const actions = [];
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.debugToolBarMenu, { shouldForwardArgs: true }, actions);
                if (!arrays.equals(actions, this.activeActions, (first, second) => first.id === second.id && first.enabled === second.enabled)) {
                    this.actionBar.clear();
                    this.actionBar.push(actions, { icon: true, label: false });
                    this.activeActions = actions;
                }
                this.show();
            }, 20));
            this.updateStyles();
            this.registerListeners();
            this.hide();
        }
        registerListeners() {
            this._register(this.debugService.onDidChangeState(() => this.updateScheduler.schedule()));
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('debug.toolBarLocation')) {
                    this.updateScheduler.schedule();
                }
            }));
            this._register(this.debugToolBarMenu.onDidChange(() => this.updateScheduler.schedule()));
            this._register(this.actionBar.actionRunner.onDidRun((e) => {
                // check for error
                if (e.error && !errors.isCancellationError(e.error)) {
                    this.notificationService.error(e.error);
                }
                // log in telemetry
                this.telemetryService.publicLog2('workbenchActionExecuted', { id: e.action.id, from: 'debugActionsWidget' });
            }));
            this._register(dom.addDisposableListener(window, dom.EventType.RESIZE, () => this.setCoordinates()));
            this._register(dom.addDisposableGenericMouseUpListener(this.dragArea, (event) => {
                const mouseClickEvent = new mouseEvent_1.StandardMouseEvent(event);
                if (mouseClickEvent.detail === 2) {
                    // double click on debug bar centers it again #8250
                    const widgetWidth = this.$el.clientWidth;
                    this.setCoordinates(0.5 * window.innerWidth - 0.5 * widgetWidth, 0);
                    this.storePosition();
                }
            }));
            this._register(dom.addDisposableGenericMouseDownListener(this.dragArea, (event) => {
                this.dragArea.classList.add('dragged');
                const mouseMoveListener = dom.addDisposableGenericMouseMoveListener(window, (e) => {
                    const mouseMoveEvent = new mouseEvent_1.StandardMouseEvent(e);
                    // Prevent default to stop editor selecting text #8524
                    mouseMoveEvent.preventDefault();
                    // Reduce x by width of drag handle to reduce jarring #16604
                    this.setCoordinates(mouseMoveEvent.posx - 14, mouseMoveEvent.posy - (this.layoutService.offset.top));
                });
                const mouseUpListener = dom.addDisposableGenericMouseUpListener(window, (e) => {
                    this.storePosition();
                    this.dragArea.classList.remove('dragged');
                    mouseMoveListener.dispose();
                    mouseUpListener.dispose();
                });
            }));
            this._register(this.layoutService.onDidChangePartVisibility(() => this.setYCoordinate()));
            this._register(browser.PixelRatio.onDidChange(() => this.setYCoordinate()));
        }
        storePosition() {
            const left = dom.getComputedStyle(this.$el).left;
            if (left) {
                const position = parseFloat(left) / window.innerWidth;
                this.storageService.store(DEBUG_TOOLBAR_POSITION_KEY, position, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            }
        }
        updateStyles() {
            super.updateStyles();
            if (this.$el) {
                this.$el.style.backgroundColor = this.getColor(debugColors_1.debugToolBarBackground) || '';
                const widgetShadowColor = this.getColor(colorRegistry_1.widgetShadow);
                this.$el.style.boxShadow = widgetShadowColor ? `0 0 8px 2px ${widgetShadowColor}` : '';
                const contrastBorderColor = this.getColor(colorRegistry_1.widgetBorder);
                const borderColor = this.getColor(debugColors_1.debugToolBarBorder);
                if (contrastBorderColor) {
                    this.$el.style.border = `1px solid ${contrastBorderColor}`;
                }
                else {
                    this.$el.style.border = borderColor ? `solid ${borderColor}` : 'none';
                    this.$el.style.border = '1px 0';
                }
            }
        }
        setYCoordinate(y = this.yCoordinate) {
            const titlebarOffset = this.layoutService.offset.top;
            this.$el.style.top = `${titlebarOffset + y}px`;
            this.yCoordinate = y;
        }
        setCoordinates(x, y) {
            if (!this.isVisible) {
                return;
            }
            const widgetWidth = this.$el.clientWidth;
            if (x === undefined) {
                const positionPercentage = this.storageService.get(DEBUG_TOOLBAR_POSITION_KEY, 0 /* StorageScope.PROFILE */);
                x = positionPercentage !== undefined ? parseFloat(positionPercentage) * window.innerWidth : (0.5 * window.innerWidth - 0.5 * widgetWidth);
            }
            x = Math.max(0, Math.min(x, window.innerWidth - widgetWidth)); // do not allow the widget to overflow on the right
            this.$el.style.left = `${x}px`;
            if (y === undefined) {
                y = this.storageService.getNumber(DEBUG_TOOLBAR_Y_KEY, 0 /* StorageScope.PROFILE */, 0);
            }
            const titleAreaHeight = 35;
            if ((y < titleAreaHeight / 2) || (y > titleAreaHeight + titleAreaHeight / 2)) {
                const moveToTop = y < titleAreaHeight;
                this.setYCoordinate(moveToTop ? 0 : titleAreaHeight);
                this.storageService.store(DEBUG_TOOLBAR_Y_KEY, moveToTop ? 0 : 2 * titleAreaHeight, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            }
        }
        show() {
            if (this.isVisible) {
                this.setCoordinates();
                return;
            }
            if (!this.isBuilt) {
                this.isBuilt = true;
                this.layoutService.container.appendChild(this.$el);
            }
            this.isVisible = true;
            dom.show(this.$el);
            this.setCoordinates();
        }
        hide() {
            this.isVisible = false;
            dom.hide(this.$el);
        }
        dispose() {
            super.dispose();
            this.$el?.remove();
        }
    };
    exports.DebugToolBar = DebugToolBar;
    exports.DebugToolBar = DebugToolBar = __decorate([
        __param(0, notification_1.INotificationService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, debug_1.IDebugService),
        __param(3, layoutService_1.IWorkbenchLayoutService),
        __param(4, storage_1.IStorageService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, themeService_1.IThemeService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, actions_2.IMenuService),
        __param(9, contextkey_1.IContextKeyService)
    ], DebugToolBar);
    function createDisconnectMenuItemAction(action, disposables, accessor) {
        const menuService = accessor.get(actions_2.IMenuService);
        const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const contextMenuService = accessor.get(contextView_1.IContextMenuService);
        const menu = menuService.createMenu(actions_2.MenuId.DebugToolBarStop, contextKeyService);
        const secondary = [];
        (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { shouldForwardArgs: true }, secondary);
        if (!secondary.length) {
            return undefined;
        }
        const dropdownAction = disposables.add(new actions_1.Action('notebook.moreRunActions', (0, nls_1.localize)('notebook.moreRunActionsLabel', "More..."), 'codicon-chevron-down', true));
        const item = instantiationService.createInstance(dropdownWithPrimaryActionViewItem_1.DropdownWithPrimaryActionViewItem, action, dropdownAction, secondary, 'debug-stop-actions', contextMenuService, {});
        return item;
    }
    exports.createDisconnectMenuItemAction = createDisconnectMenuItemAction;
    // Debug toolbar
    const debugViewTitleItems = [];
    const registerDebugToolBarItem = (id, title, order, icon, when, precondition, alt) => {
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.DebugToolBar, {
            group: 'navigation',
            when,
            order,
            command: {
                id,
                title,
                icon,
                precondition
            },
            alt
        });
        // Register actions in debug viewlet when toolbar is docked
        debugViewTitleItems.push(actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.ViewContainerTitle, {
            group: 'navigation',
            when: contextkey_1.ContextKeyExpr.and(when, contextkey_1.ContextKeyExpr.equals('viewContainer', debug_1.VIEWLET_ID), debug_1.CONTEXT_DEBUG_STATE.notEqualsTo('inactive'), contextkey_1.ContextKeyExpr.equals('config.debug.toolBarLocation', 'docked')),
            order,
            command: {
                id,
                title,
                icon,
                precondition
            }
        }));
    };
    actions_2.MenuRegistry.onDidChangeMenu(e => {
        // In case the debug toolbar is docked we need to make sure that the docked toolbar has the up to date commands registered #115945
        if (e.has(actions_2.MenuId.DebugToolBar)) {
            (0, lifecycle_1.dispose)(debugViewTitleItems);
            const items = actions_2.MenuRegistry.getMenuItems(actions_2.MenuId.DebugToolBar);
            for (const i of items) {
                debugViewTitleItems.push(actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.ViewContainerTitle, {
                    ...i,
                    when: contextkey_1.ContextKeyExpr.and(i.when, contextkey_1.ContextKeyExpr.equals('viewContainer', debug_1.VIEWLET_ID), debug_1.CONTEXT_DEBUG_STATE.notEqualsTo('inactive'), contextkey_1.ContextKeyExpr.equals('config.debug.toolBarLocation', 'docked'))
                }));
            }
        }
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandCenterCenter, {
        submenu: actions_2.MenuId.DebugToolBar,
        title: 'Debug',
        icon: codicons_1.Codicon.debug,
        order: 1,
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_DEBUG_STATE.notEqualsTo('inactive'), contextkey_1.ContextKeyExpr.equals('config.debug.toolBarLocation', 'commandCenter'))
    });
    registerDebugToolBarItem(debugCommands_1.CONTINUE_ID, debugCommands_1.CONTINUE_LABEL, 10, icons.debugContinue, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugToolBarItem(debugCommands_1.PAUSE_ID, debugCommands_1.PAUSE_LABEL, 10, icons.debugPause, debug_1.CONTEXT_DEBUG_STATE.notEqualsTo('stopped'), debug_1.CONTEXT_DEBUG_STATE.isEqualTo('running'));
    registerDebugToolBarItem(debugCommands_1.STOP_ID, debugCommands_1.STOP_LABEL, 70, icons.debugStop, debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), undefined, { id: debugCommands_1.DISCONNECT_ID, title: debugCommands_1.DISCONNECT_LABEL, icon: icons.debugDisconnect, precondition: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), debug_1.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED), });
    registerDebugToolBarItem(debugCommands_1.DISCONNECT_ID, debugCommands_1.DISCONNECT_LABEL, 70, icons.debugDisconnect, debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH, undefined, { id: debugCommands_1.STOP_ID, title: debugCommands_1.STOP_LABEL, icon: icons.debugStop, precondition: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH, debug_1.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED), });
    registerDebugToolBarItem(debugCommands_1.STEP_OVER_ID, debugCommands_1.STEP_OVER_LABEL, 20, icons.debugStepOver, undefined, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugToolBarItem(debugCommands_1.STEP_INTO_ID, debugCommands_1.STEP_INTO_LABEL, 30, icons.debugStepInto, undefined, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugToolBarItem(debugCommands_1.STEP_OUT_ID, debugCommands_1.STEP_OUT_LABEL, 40, icons.debugStepOut, undefined, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugToolBarItem(debugCommands_1.RESTART_SESSION_ID, debugCommands_1.RESTART_LABEL, 60, icons.debugRestart);
    registerDebugToolBarItem(debugCommands_1.STEP_BACK_ID, (0, nls_1.localize)('stepBackDebug', "Step Back"), 50, icons.debugStepBack, debug_1.CONTEXT_STEP_BACK_SUPPORTED, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugToolBarItem(debugCommands_1.REVERSE_CONTINUE_ID, (0, nls_1.localize)('reverseContinue', "Reverse"), 55, icons.debugReverseContinue, debug_1.CONTEXT_STEP_BACK_SUPPORTED, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugToolBarItem(debugCommands_1.FOCUS_SESSION_ID, debugCommands_1.FOCUS_SESSION_LABEL, 100, codicons_1.Codicon.listTree, debug_1.CONTEXT_MULTI_SESSION_DEBUG);
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.DebugToolBarStop, {
        group: 'navigation',
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), debug_1.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED),
        order: 0,
        command: {
            id: debugCommands_1.DISCONNECT_ID,
            title: debugCommands_1.DISCONNECT_LABEL,
            icon: icons.debugDisconnect
        }
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.DebugToolBarStop, {
        group: 'navigation',
        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH, debug_1.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED),
        order: 0,
        command: {
            id: debugCommands_1.STOP_ID,
            title: debugCommands_1.STOP_LABEL,
            icon: icons.debugStop
        }
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.DebugToolBarStop, {
        group: 'navigation',
        when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), debug_1.CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED, debug_1.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED), contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH, debug_1.CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED)),
        order: 0,
        command: {
            id: debugCommands_1.DISCONNECT_AND_SUSPEND_ID,
            title: debugCommands_1.DISCONNECT_AND_SUSPEND_LABEL,
            icon: icons.debugDisconnect
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdUb29sQmFyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZGVidWcvYnJvd3Nlci9kZWJ1Z1Rvb2xCYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBc0NoRyxNQUFNLDBCQUEwQixHQUFHLDZCQUE2QixDQUFDO0lBQ2pFLE1BQU0sbUJBQW1CLEdBQUcsc0JBQXNCLENBQUM7SUFFNUMsSUFBTSxZQUFZLEdBQWxCLE1BQU0sWUFBYSxTQUFRLHVCQUFRO1FBZXpDLFlBQ3VCLG1CQUEwRCxFQUM3RCxnQkFBb0QsRUFDeEQsWUFBNEMsRUFDbEMsYUFBdUQsRUFDL0QsY0FBZ0QsRUFDMUMsb0JBQTRELEVBQ3BFLFlBQTJCLEVBQ25CLG9CQUE0RCxFQUNyRSxXQUF5QixFQUNuQixpQkFBcUM7WUFFekQsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBWG1CLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDNUMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUN2QyxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUNqQixrQkFBYSxHQUFiLGFBQWEsQ0FBeUI7WUFDOUMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQ3pCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFFM0MseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQWY1RSxnQkFBVyxHQUFHLENBQUMsQ0FBQztZQUVoQixjQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ2xCLFlBQU8sR0FBRyxLQUFLLENBQUM7WUFFUCxrQ0FBNkIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFnQnRGLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ3RDLElB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