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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/debug/browser/debugViewlet", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/common/contextkeys", "vs/workbench/common/views", "vs/workbench/contrib/debug/browser/debugActionViewItems", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/browser/debugIcons", "vs/workbench/contrib/debug/browser/debugToolBar", "vs/workbench/contrib/debug/browser/welcomeView", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/layout/browser/layoutService", "vs/css!./media/debugViewlet"], function (require, exports, lifecycle_1, nls, menuEntryActionViewItem_1, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, progress_1, quickInput_1, storage_1, telemetry_1, themeService_1, workspace_1, viewPaneContainer_1, contextkeys_1, views_1, debugActionViewItems_1, debugCommands_1, debugIcons_1, debugToolBar_1, welcomeView_1, debug_1, extensions_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3Rb = void 0;
    let $3Rb = class $3Rb extends viewPaneContainer_1.$Seb {
        constructor(layoutService, telemetryService, Ab, Bb, instantiationService, contextService, storageService, themeService, contextMenuService, extensionService, configurationService, Cb, Db, viewDescriptorService) {
            super(debug_1.$jG, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService);
            this.Ab = Ab;
            this.Bb = Bb;
            this.Cb = Cb;
            this.Db = Db;
            this.yb = new Map();
            this.zb = this.B(new lifecycle_1.$jc());
            // When there are potential updates to the docked debug toolbar we need to update it
            this.B(this.Bb.onDidChangeState(state => this.Eb(state)));
            this.B(this.Db.onDidChangeContext(e => {
                if (e.affectsSome(new Set([debug_1.$vG]))) {
                    this.kb();
                }
            }));
            this.B(this.gb.onDidChangeWorkbenchState(() => this.kb()));
            this.B(this.ab.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('debug.toolBarLocation')) {
                    this.kb();
                }
            }));
        }
        create(parent) {
            super.create(parent);
            parent.classList.add('debug-viewlet');
        }
        focus() {
            super.focus();
            if (this.r) {
                this.r.focus();
            }
            else {
                this.focusView(welcomeView_1.$2Rb.ID);
            }
        }
        getActionViewItem(action) {
            if (action.id === debugCommands_1.$BQb) {
                this.r = this.Z.createInstance(debugActionViewItems_1.$cRb, null, action);
                return this.r;
            }
            if (action.id === debugCommands_1.$wQb) {
                return new debugActionViewItems_1.$dRb(action, undefined, this.Bb, this.Cb, this.ab);
            }
            if (action.id === debugCommands_1.$rQb || action.id === debugCommands_1.$pQb) {
                this.zb.clear();
                const item = this.Z.invokeFunction(accessor => (0, debugToolBar_1.$fRb)(action, this.zb, accessor));
                if (item) {
                    return item;
                }
            }
            return (0, menuEntryActionViewItem_1.$F3)(this.Z, action);
        }
        focusView(id) {
            const view = this.getView(id);
            if (view) {
                view.focus();
            }
        }
        Eb(state) {
            if (this.t) {
                this.t();
                this.t = undefined;
            }
            if (state === 1 /* State.Initializing */) {
                this.Ab.withProgress({ location: debug_1.$jG, }, _progress => {
                    return new Promise(resolve => this.t = resolve);
                });
            }
        }
        addPanes(panes) {
            super.addPanes(panes);
            for (const { pane: pane } of panes) {
                // attach event listener to
                if (pane.id === debug_1.$oG) {
                    this.$ = pane;
                    this.Fb();
                }
                else {
                    this.yb.set(pane.id, pane.onDidChange(() => this.Fb()));
                }
            }
        }
        removePanes(panes) {
            super.removePanes(panes);
            for (const pane of panes) {
                (0, lifecycle_1.$fc)(this.yb.get(pane.id));
                this.yb.delete(pane.id);
            }
        }
        Fb() {
            if (this.$) {
                // We need to update the breakpoints view since all other views are collapsed #25384
                const allOtherCollapsed = this.panes.every(view => !view.isExpanded() || view === this.$);
                this.$.maximumBodySize = allOtherCollapsed ? Number.POSITIVE_INFINITY : this.$.minimumBodySize;
            }
        }
    };
    exports.$3Rb = $3Rb;
    exports.$3Rb = $3Rb = __decorate([
        __param(0, layoutService_1.$Meb),
        __param(1, telemetry_1.$9k),
        __param(2, progress_1.$2u),
        __param(3, debug_1.$nH),
        __param(4, instantiation_1.$Ah),
        __param(5, workspace_1.$Kh),
        __param(6, storage_1.$Vo),
        __param(7, themeService_1.$gv),
        __param(8, contextView_1.$WZ),
        __param(9, extensions_1.$MF),
        __param(10, configuration_1.$8h),
        __param(11, contextView_1.$VZ),
        __param(12, contextkey_1.$3i),
        __param(13, views_1.$_E)
    ], $3Rb);
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ViewContainerTitle, {
        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('viewContainer', debug_1.$jG), debug_1.$wG.notEqualsTo('simple'), contextkeys_1.$Pcb.notEqualsTo('empty'), contextkey_1.$Ii.or(debug_1.$uG.isEqualTo('inactive'), contextkey_1.$Ii.notEquals('config.debug.toolBarLocation', 'docked'))),
        order: 10,
        group: 'navigation',
        command: {
            precondition: debug_1.$uG.notEqualsTo((0, debug_1.$lH)(1 /* State.Initializing */)),
            id: debugCommands_1.$BQb,
            title: debugCommands_1.$2Qb
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: debugCommands_1.$AQb,
                title: {
                    value: debugCommands_1.$1Qb,
                    original: 'Open \'launch.json\'',
                    mnemonicTitle: nls.localize(0, null)
                },
                f1: true,
                icon: debugIcons_1.$mnb,
                precondition: debug_1.$wG.notEqualsTo('simple'),
                menu: [{
                        id: actions_1.$Ru.ViewContainerTitle,
                        group: 'navigation',
                        order: 20,
                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('viewContainer', debug_1.$jG), debug_1.$wG.notEqualsTo('simple'), contextkeys_1.$Pcb.notEqualsTo('empty'), contextkey_1.$Ii.or(debug_1.$uG.isEqualTo('inactive'), contextkey_1.$Ii.notEquals('config.debug.toolBarLocation', 'docked')))
                    }, {
                        id: actions_1.$Ru.ViewContainerTitle,
                        order: 20,
                        // Show in debug viewlet secondary actions when debugging and debug toolbar is docked
                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('viewContainer', debug_1.$jG), debug_1.$uG.notEqualsTo('inactive'), contextkey_1.$Ii.equals('config.debug.toolBarLocation', 'docked'))
                    }, {
                        id: actions_1.$Ru.MenubarDebugMenu,
                        group: '2_configuration',
                        order: 1,
                        when: debug_1.$ZG
                    }]
            });
        }
        async run(accessor) {
            const debugService = accessor.get(debug_1.$nH);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const configurationManager = debugService.getConfigurationManager();
            let launch;
            if (configurationManager.selectedConfiguration.name) {
                launch = configurationManager.selectedConfiguration.launch;
            }
            else {
                const launches = configurationManager.getLaunches().filter(l => !l.hidden);
                if (launches.length === 1) {
                    launch = launches[0];
                }
                else {
                    const picks = launches.map(l => ({ label: l.name, launch: l }));
                    const picked = await quickInputService.pick(picks, {
                        activeItem: picks[0],
                        placeHolder: nls.localize(1, null)
                    });
                    if (picked) {
                        launch = picked.launch;
                    }
                }
            }
            if (launch) {
                await launch.openConfigFile({ preserveFocus: false });
            }
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'debug.toggleReplIgnoreFocus',
                title: nls.localize(2, null),
                toggled: contextkey_1.$Ii.has(`view.${debug_1.$rG}.visible`),
                menu: [{
                        id: viewPaneContainer_1.$Reb,
                        group: '3_toggleRepl',
                        order: 30,
                        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('viewContainer', debug_1.$jG))
                    }]
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(views_1.$$E);
            if (viewsService.isViewVisible(debug_1.$rG)) {
                viewsService.closeView(debug_1.$rG);
            }
            else {
                await viewsService.openView(debug_1.$rG);
            }
        }
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.ViewContainerTitle, {
        when: contextkey_1.$Ii.and(contextkey_1.$Ii.equals('viewContainer', debug_1.$jG), debug_1.$uG.notEqualsTo('inactive'), contextkey_1.$Ii.equals('config.debug.toolBarLocation', 'docked')),
        order: 10,
        command: {
            id: debugCommands_1.$xQb,
            title: nls.localize(3, null),
        }
    });
});
//# sourceMappingURL=debugViewlet.js.map