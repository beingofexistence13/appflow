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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/debug/browser/debugToolBar", "vs/platform/actions/browser/dropdownWithPrimaryActionViewItem", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/debug/browser/debugActionViewItems", "vs/workbench/contrib/debug/browser/debugColors", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/layout/browser/layoutService", "vs/base/common/codicons", "vs/css!./media/debugToolBar"], function (require, exports, browser, dom, mouseEvent_1, actionbar_1, actions_1, arrays, async_1, errors, lifecycle_1, nls_1, dropdownWithPrimaryActionViewItem_1, menuEntryActionViewItem_1, actions_2, configuration_1, contextkey_1, contextView_1, instantiation_1, notification_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, themables_1, debugActionViewItems_1, debugColors_1, debugCommands_1, icons, debug_1, layoutService_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fRb = exports.$eRb = void 0;
    const DEBUG_TOOLBAR_POSITION_KEY = 'debug.actionswidgetposition';
    const DEBUG_TOOLBAR_Y_KEY = 'debug.actionswidgety';
    let $eRb = class $eRb extends themeService_1.$nv {
        constructor(C, D, F, G, H, I, themeService, J, menuService, contextKeyService) {
            super(themeService);
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.J = J;
            this.m = 0;
            this.r = false;
            this.t = false;
            this.u = this.B(new lifecycle_1.$jc());
            this.a = dom.$('div.debug-toolbar');
            this.a.style.top = `${G.offset.top}px`;
            this.b = dom.$0O(this.a, dom.$('div.drag-area' + themables_1.ThemeIcon.asCSSSelector(icons.$$mb)));
            const actionBarContainer = dom.$0O(this.a, dom.$('div.action-bar-container'));
            this.j = menuService.createMenu(actions_2.$Ru.DebugToolBar, contextKeyService);
            this.B(this.j);
            this.f = [];
            this.c = this.B(new actionbar_1.$1P(actionBarContainer, {
                orientation: 0 /* ActionsOrientation.HORIZONTAL */,
                actionViewItemProvider: (action) => {
                    if (action.id === debugCommands_1.$wQb) {
                        return this.J.createInstance(debugActionViewItems_1.$dRb, action, undefined);
                    }
                    else if (action.id === debugCommands_1.$rQb || action.id === debugCommands_1.$pQb) {
                        this.u.clear();
                        const item = this.J.invokeFunction(accessor => $fRb(action, this.u, accessor));
                        if (item) {
                            return item;
                        }
                    }
                    return (0, menuEntryActionViewItem_1.$F3)(this.J, action);
                }
            }));
            this.g = this.B(new async_1.$Sg(() => {
                const state = this.F.state;
                const toolBarLocation = this.I.getValue('debug').toolBarLocation;
                if (state === 0 /* State.Inactive */ ||
                    toolBarLocation !== 'floating' ||
                    this.F.getModel().getSessions().every(s => s.suppressDebugToolbar) ||
                    (state === 1 /* State.Initializing */ && this.F.initializingOptions?.suppressDebugToolbar)) {
                    return this.Q();
                }
                const actions = [];
                (0, menuEntryActionViewItem_1.$B3)(this.j, { shouldForwardArgs: true }, actions);
                if (!arrays.$sb(actions, this.f, (first, second) => first.id === second.id && first.enabled === second.enabled)) {
                    this.c.clear();
                    this.c.push(actions, { icon: true, label: false });
                    this.f = actions;
                }
                this.P();
            }, 20));
            this.updateStyles();
            this.L();
            this.Q();
        }
        L() {
            this.B(this.F.onDidChangeState(() => this.g.schedule()));
            this.B(this.I.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('debug.toolBarLocation')) {
                    this.g.schedule();
                }
            }));
            this.B(this.j.onDidChange(() => this.g.schedule()));
            this.B(this.c.actionRunner.onDidRun((e) => {
                // check for error
                if (e.error && !errors.$2(e.error)) {
                    this.C.error(e.error);
                }
                // log in telemetry
                this.D.publicLog2('workbenchActionExecuted', { id: e.action.id, from: 'debugActionsWidget' });
            }));
            this.B(dom.$nO(window, dom.$3O.RESIZE, () => this.O()));
            this.B(dom.$tO(this.b, (event) => {
                const mouseClickEvent = new mouseEvent_1.$eO(event);
                if (mouseClickEvent.detail === 2) {
                    // double click on debug bar centers it again #8250
                    const widgetWidth = this.a.clientWidth;
                    this.O(0.5 * window.innerWidth - 0.5 * widgetWidth, 0);
                    this.M();
                }
            }));
            this.B(dom.$rO(this.b, (event) => {
                this.b.classList.add('dragged');
                const mouseMoveListener = dom.$sO(window, (e) => {
                    const mouseMoveEvent = new mouseEvent_1.$eO(e);
                    // Prevent default to stop editor selecting text #8524
                    mouseMoveEvent.preventDefault();
                    // Reduce x by width of drag handle to reduce jarring #16604
                    this.O(mouseMoveEvent.posx - 14, mouseMoveEvent.posy - (this.G.offset.top));
                });
                const mouseUpListener = dom.$tO(window, (e) => {
                    this.M();
                    this.b.classList.remove('dragged');
                    mouseMoveListener.dispose();
                    mouseUpListener.dispose();
                });
            }));
            this.B(this.G.onDidChangePartVisibility(() => this.N()));
            this.B(browser.$WN.onDidChange(() => this.N()));
        }
        M() {
            const left = dom.$zO(this.a).left;
            if (left) {
                const position = parseFloat(left) / window.innerWidth;
                this.H.store(DEBUG_TOOLBAR_POSITION_KEY, position, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            }
        }
        updateStyles() {
            super.updateStyles();
            if (this.a) {
                this.a.style.backgroundColor = this.z(debugColors_1.$Bnb) || '';
                const widgetShadowColor = this.z(colorRegistry_1.$Kv);
                this.a.style.boxShadow = widgetShadowColor ? `0 0 8px 2px ${widgetShadowColor}` : '';
                const contrastBorderColor = this.z(colorRegistry_1.$Lv);
                const borderColor = this.z(debugColors_1.$Cnb);
                if (contrastBorderColor) {
                    this.a.style.border = `1px solid ${contrastBorderColor}`;
                }
                else {
                    this.a.style.border = borderColor ? `solid ${borderColor}` : 'none';
                    this.a.style.border = '1px 0';
                }
            }
        }
        N(y = this.m) {
            const titlebarOffset = this.G.offset.top;
            this.a.style.top = `${titlebarOffset + y}px`;
            this.m = y;
        }
        O(x, y) {
            if (!this.r) {
                return;
            }
            const widgetWidth = this.a.clientWidth;
            if (x === undefined) {
                const positionPercentage = this.H.get(DEBUG_TOOLBAR_POSITION_KEY, 0 /* StorageScope.PROFILE */);
                x = positionPercentage !== undefined ? parseFloat(positionPercentage) * window.innerWidth : (0.5 * window.innerWidth - 0.5 * widgetWidth);
            }
            x = Math.max(0, Math.min(x, window.innerWidth - widgetWidth)); // do not allow the widget to overflow on the right
            this.a.style.left = `${x}px`;
            if (y === undefined) {
                y = this.H.getNumber(DEBUG_TOOLBAR_Y_KEY, 0 /* StorageScope.PROFILE */, 0);
            }
            const titleAreaHeight = 35;
            if ((y < titleAreaHeight / 2) || (y > titleAreaHeight + titleAreaHeight / 2)) {
                const moveToTop = y < titleAreaHeight;
                this.N(moveToTop ? 0 : titleAreaHeight);
                this.H.store(DEBUG_TOOLBAR_Y_KEY, moveToTop ? 0 : 2 * titleAreaHeight, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            }
        }
        P() {
            if (this.r) {
                this.O();
                return;
            }
            if (!this.t) {
                this.t = true;
                this.G.container.appendChild(this.a);
            }
            this.r = true;
            dom.$dP(this.a);
            this.O();
        }
        Q() {
            this.r = false;
            dom.$eP(this.a);
        }
        dispose() {
            super.dispose();
            this.a?.remove();
        }
    };
    exports.$eRb = $eRb;
    exports.$eRb = $eRb = __decorate([
        __param(0, notification_1.$Yu),
        __param(1, telemetry_1.$9k),
        __param(2, debug_1.$nH),
        __param(3, layoutService_1.$Meb),
        __param(4, storage_1.$Vo),
        __param(5, configuration_1.$8h),
        __param(6, themeService_1.$gv),
        __param(7, instantiation_1.$Ah),
        __param(8, actions_2.$Su),
        __param(9, contextkey_1.$3i)
    ], $eRb);
    function $fRb(action, disposables, accessor) {
        const menuService = accessor.get(actions_2.$Su);
        const contextKeyService = accessor.get(contextkey_1.$3i);
        const instantiationService = accessor.get(instantiation_1.$Ah);
        const contextMenuService = accessor.get(contextView_1.$WZ);
        const menu = menuService.createMenu(actions_2.$Ru.DebugToolBarStop, contextKeyService);
        const secondary = [];
        (0, menuEntryActionViewItem_1.$B3)(menu, { shouldForwardArgs: true }, secondary);
        if (!secondary.length) {
            return undefined;
        }
        const dropdownAction = disposables.add(new actions_1.$gi('notebook.moreRunActions', (0, nls_1.localize)(0, null), 'codicon-chevron-down', true));
        const item = instantiationService.createInstance(dropdownWithPrimaryActionViewItem_1.$Vqb, action, dropdownAction, secondary, 'debug-stop-actions', contextMenuService, {});
        return item;
    }
    exports.$fRb = $fRb;
    // Debug toolbar
    const debugViewTitleItems = [];
    const registerDebugToolBarItem = (id, title, order, icon, when, precondition, alt) => {
        actions_2.$Tu.appendMenuItem(actions_2.$Ru.DebugToolBar, {
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
        debugViewTitleItems.push(actions_2.$Tu.appendMenuItem(actions_2.$Ru.ViewContainerTitle, {
            group: 'navigation',
            when: contextkey_1.$Ii.and(when, contextkey_1.$Ii.equals('viewContainer', debug_1.$jG), debug_1.$uG.notEqualsTo('inactive'), contextkey_1.$Ii.equals('config.debug.toolBarLocation', 'docked')),
            order,
            command: {
                id,
                title,
                icon,
                precondition
            }
        }));
    };
    actions_2.$Tu.onDidChangeMenu(e => {
        // In case the debug toolbar is docked we need to make sure that the docked toolbar has the up to date commands registered #115945
        if (e.has(actions_2.$Ru.DebugToolBar)) {
            (0, lifecycle_1.$fc)(debugViewTitleItems);
            const items = actions_2.$Tu.getMenuItems(actions_2.$Ru.DebugToolBar);
            for (const i of items) {
                debugViewTitleItems.push(actions_2.$Tu.appendMenuItem(actions_2.$Ru.ViewContainerTitle, {
                    ...i,
                    when: contextkey_1.$Ii.and(i.when, contextkey_1.$Ii.equals('viewContainer', debug_1.$jG), debug_1.$uG.notEqualsTo('inactive'), contextkey_1.$Ii.equals('config.debug.toolBarLocation', 'docked'))
                }));
            }
        }
    });
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.CommandCenterCenter, {
        submenu: actions_2.$Ru.DebugToolBar,
        title: 'Debug',
        icon: codicons_1.$Pj.debug,
        order: 1,
        when: contextkey_1.$Ii.and(debug_1.$uG.notEqualsTo('inactive'), contextkey_1.$Ii.equals('config.debug.toolBarLocation', 'commandCenter'))
    });
    registerDebugToolBarItem(debugCommands_1.$tQb, debugCommands_1.$XQb, 10, icons.$inb, debug_1.$uG.isEqualTo('stopped'));
    registerDebugToolBarItem(debugCommands_1.$oQb, debugCommands_1.$TQb, 10, icons.$hnb, debug_1.$uG.notEqualsTo('stopped'), debug_1.$uG.isEqualTo('running'));
    registerDebugToolBarItem(debugCommands_1.$rQb, debugCommands_1.$WQb, 70, icons.$anb, debug_1.$SG.toNegated(), undefined, { id: debugCommands_1.$pQb, title: debugCommands_1.$UQb, icon: icons.$bnb, precondition: contextkey_1.$Ii.and(debug_1.$SG.toNegated(), debug_1.$8G), });
    registerDebugToolBarItem(debugCommands_1.$pQb, debugCommands_1.$UQb, 70, icons.$bnb, debug_1.$SG, undefined, { id: debugCommands_1.$rQb, title: debugCommands_1.$WQb, icon: icons.$anb, precondition: contextkey_1.$Ii.and(debug_1.$SG, debug_1.$8G), });
    registerDebugToolBarItem(debugCommands_1.$kQb, debugCommands_1.$PQb, 20, icons.$dnb, undefined, debug_1.$uG.isEqualTo('stopped'));
    registerDebugToolBarItem(debugCommands_1.$lQb, debugCommands_1.$QQb, 30, icons.$enb, undefined, debug_1.$uG.isEqualTo('stopped'));
    registerDebugToolBarItem(debugCommands_1.$nQb, debugCommands_1.$SQb, 40, icons.$fnb, undefined, debug_1.$uG.isEqualTo('stopped'));
    registerDebugToolBarItem(debugCommands_1.$iQb, debugCommands_1.$OQb, 60, icons.$cnb);
    registerDebugToolBarItem(debugCommands_1.$hQb, (0, nls_1.localize)(1, null), 50, icons.$gnb, debug_1.$TG, debug_1.$uG.isEqualTo('stopped'));
    registerDebugToolBarItem(debugCommands_1.$gQb, (0, nls_1.localize)(2, null), 55, icons.$jnb, debug_1.$TG, debug_1.$uG.isEqualTo('stopped'));
    registerDebugToolBarItem(debugCommands_1.$wQb, debugCommands_1.$YQb, 100, codicons_1.$Pj.listTree, debug_1.$bH);
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.DebugToolBarStop, {
        group: 'navigation',
        when: contextkey_1.$Ii.and(debug_1.$SG.toNegated(), debug_1.$8G),
        order: 0,
        command: {
            id: debugCommands_1.$pQb,
            title: debugCommands_1.$UQb,
            icon: icons.$bnb
        }
    });
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.DebugToolBarStop, {
        group: 'navigation',
        when: contextkey_1.$Ii.and(debug_1.$SG, debug_1.$8G),
        order: 0,
        command: {
            id: debugCommands_1.$rQb,
            title: debugCommands_1.$WQb,
            icon: icons.$anb
        }
    });
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.DebugToolBarStop, {
        group: 'navigation',
        when: contextkey_1.$Ii.or(contextkey_1.$Ii.and(debug_1.$SG.toNegated(), debug_1.$9G, debug_1.$8G), contextkey_1.$Ii.and(debug_1.$SG, debug_1.$9G)),
        order: 0,
        command: {
            id: debugCommands_1.$qQb,
            title: debugCommands_1.$VQb,
            icon: icons.$bnb
        }
    });
});
//# sourceMappingURL=debugToolBar.js.map