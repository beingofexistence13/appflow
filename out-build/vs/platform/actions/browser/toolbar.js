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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/browser/ui/toolbar/toolbar", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/platform/actions/browser/toolbar", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/telemetry/common/telemetry"], function (require, exports, dom_1, mouseEvent_1, toolbar_1, actions_1, arrays_1, errors_1, event_1, lifecycle_1, nls_1, menuEntryActionViewItem_1, actions_2, contextkey_1, contextView_1, keybinding_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$M6 = exports.$L6 = exports.HiddenItemStrategy = void 0;
    var HiddenItemStrategy;
    (function (HiddenItemStrategy) {
        /** This toolbar doesn't support hiding*/
        HiddenItemStrategy[HiddenItemStrategy["NoHide"] = -1] = "NoHide";
        /** Hidden items aren't shown anywhere */
        HiddenItemStrategy[HiddenItemStrategy["Ignore"] = 0] = "Ignore";
        /** Hidden items move into the secondary group */
        HiddenItemStrategy[HiddenItemStrategy["RenderInSecondaryGroup"] = 1] = "RenderInSecondaryGroup";
    })(HiddenItemStrategy || (exports.HiddenItemStrategy = HiddenItemStrategy = {}));
    /**
     * The `WorkbenchToolBar` does
     * - support hiding of menu items
     * - lookup keybindings for each actions automatically
     * - send `workbenchActionExecuted`-events for each action
     *
     * See {@link $M6} for a toolbar that is backed by a menu.
     */
    let $L6 = class $L6 extends toolbar_1.$6R {
        constructor(container, F, G, H, I, keybindingService, telemetryService) {
            super(container, I, {
                // defaults
                getKeyBinding: (action) => keybindingService.lookupKeybinding(action.id) ?? undefined,
                // options (override defaults)
                ...F,
                // mandatory (overide options)
                allowContextMenu: true,
                skipTelemetry: typeof F?.telemetrySource === 'string',
            });
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.D = this.q.add(new lifecycle_1.$jc());
            // telemetry logic
            const telemetrySource = F?.telemetrySource;
            if (telemetrySource) {
                this.q.add(this.j.onDidRun(e => telemetryService.publicLog2('workbenchActionExecuted', { id: e.action.id, from: telemetrySource })));
            }
        }
        setActions(_primary, _secondary = [], menuIds) {
            this.D.clear();
            const primary = _primary.slice();
            const secondary = _secondary.slice();
            const toggleActions = [];
            let toggleActionsCheckedCount = 0;
            const extraSecondary = [];
            let someAreHidden = false;
            // unless disabled, move all hidden items to secondary group or ignore them
            if (this.F?.hiddenItemStrategy !== -1 /* HiddenItemStrategy.NoHide */) {
                for (let i = 0; i < primary.length; i++) {
                    const action = primary[i];
                    if (!(action instanceof actions_2.$Vu) && !(action instanceof actions_2.$Uu)) {
                        // console.warn(`Action ${action.id}/${action.label} is not a MenuItemAction`);
                        continue;
                    }
                    if (!action.hideActions) {
                        continue;
                    }
                    // collect all toggle actions
                    toggleActions.push(action.hideActions.toggle);
                    if (action.hideActions.toggle.checked) {
                        toggleActionsCheckedCount++;
                    }
                    // hidden items move into overflow or ignore
                    if (action.hideActions.isHidden) {
                        someAreHidden = true;
                        primary[i] = undefined;
                        if (this.F?.hiddenItemStrategy !== 0 /* HiddenItemStrategy.Ignore */) {
                            extraSecondary[i] = action;
                        }
                    }
                }
            }
            // count for max
            if (this.F?.maxNumberOfItems !== undefined) {
                let count = 0;
                for (let i = 0; i < primary.length; i++) {
                    const action = primary[i];
                    if (!action) {
                        continue;
                    }
                    if (++count >= this.F.maxNumberOfItems) {
                        primary[i] = undefined;
                        extraSecondary[i] = action;
                    }
                }
            }
            (0, arrays_1.$Gb)(primary);
            (0, arrays_1.$Gb)(extraSecondary);
            super.setActions(primary, actions_1.$ii.join(extraSecondary, secondary));
            // add context menu for toggle actions
            if (toggleActions.length > 0) {
                this.D.add((0, dom_1.$nO)(this.getElement(), 'contextmenu', e => {
                    const event = new mouseEvent_1.$eO(e);
                    const action = this.getItemAction(event.target);
                    if (!(action)) {
                        return;
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    let noHide = false;
                    // last item cannot be hidden when using ignore strategy
                    if (toggleActionsCheckedCount === 1 && this.F?.hiddenItemStrategy === 0 /* HiddenItemStrategy.Ignore */) {
                        noHide = true;
                        for (let i = 0; i < toggleActions.length; i++) {
                            if (toggleActions[i].checked) {
                                toggleActions[i] = (0, actions_1.$li)({
                                    id: action.id,
                                    label: action.label,
                                    checked: true,
                                    enabled: false,
                                    run() { }
                                });
                                break; // there is only one
                            }
                        }
                    }
                    // add "hide foo" actions
                    let hideAction;
                    if (!noHide && (action instanceof actions_2.$Vu || action instanceof actions_2.$Uu)) {
                        if (!action.hideActions) {
                            // no context menu for MenuItemAction instances that support no hiding
                            // those are fake actions and need to be cleaned up
                            return;
                        }
                        hideAction = action.hideActions.hide;
                    }
                    else {
                        hideAction = (0, actions_1.$li)({
                            id: 'label',
                            label: (0, nls_1.localize)(0, null),
                            enabled: false,
                            run() { }
                        });
                    }
                    const actions = actions_1.$ii.join([hideAction], toggleActions);
                    // add "Reset Menu" action
                    if (this.F?.resetMenu && !menuIds) {
                        menuIds = [this.F.resetMenu];
                    }
                    if (someAreHidden && menuIds) {
                        actions.push(new actions_1.$ii());
                        actions.push((0, actions_1.$li)({
                            id: 'resetThisMenu',
                            label: (0, nls_1.localize)(1, null),
                            run: () => this.G.resetHiddenStates(menuIds)
                        }));
                    }
                    this.I.showContextMenu({
                        getAnchor: () => event,
                        getActions: () => actions,
                        // add context menu actions (iff appicable)
                        menuId: this.F?.contextMenu,
                        menuActionOptions: { renderShortTitle: true, ...this.F?.menuOptions },
                        skipTelemetry: typeof this.F?.telemetrySource === 'string',
                        contextKeyService: this.H,
                    });
                }));
            }
        }
    };
    exports.$L6 = $L6;
    exports.$L6 = $L6 = __decorate([
        __param(2, actions_2.$Su),
        __param(3, contextkey_1.$3i),
        __param(4, contextView_1.$WZ),
        __param(5, keybinding_1.$2D),
        __param(6, telemetry_1.$9k)
    ], $L6);
    /**
     * A {@link $L6 workbench toolbar} that is purely driven from a {@link $Ru menu}-identifier.
     *
     * *Note* that Manual updates via `setActions` are NOT supported.
     */
    let $M6 = class $M6 extends $L6 {
        constructor(container, menuId, options, menuService, contextKeyService, contextMenuService, keybindingService, telemetryService) {
            super(container, { resetMenu: menuId, ...options }, menuService, contextKeyService, contextMenuService, keybindingService, telemetryService);
            this.a = this.q.add(new event_1.$fd());
            this.onDidChangeMenuItems = this.a.event;
            // update logic
            const menu = this.q.add(menuService.createMenu(menuId, contextKeyService, { emitEventsForSubmenuChanges: true }));
            const updateToolbar = () => {
                const primary = [];
                const secondary = [];
                (0, menuEntryActionViewItem_1.$B3)(menu, options?.menuOptions, { primary, secondary }, options?.toolbarOptions?.primaryGroup, options?.toolbarOptions?.shouldInlineSubmenu, options?.toolbarOptions?.useSeparatorsInPrimaryActions);
                super.setActions(primary, secondary);
            };
            this.q.add(menu.onDidChange(() => {
                updateToolbar();
                this.a.fire(this);
            }));
            updateToolbar();
        }
        /**
         * @deprecated The WorkbenchToolBar does not support this method because it works with menus.
         */
        setActions() {
            throw new errors_1.$ab('This toolbar is populated from a menu.');
        }
    };
    exports.$M6 = $M6;
    exports.$M6 = $M6 = __decorate([
        __param(3, actions_2.$Su),
        __param(4, contextkey_1.$3i),
        __param(5, contextView_1.$WZ),
        __param(6, keybinding_1.$2D),
        __param(7, telemetry_1.$9k)
    ], $M6);
});
//# sourceMappingURL=toolbar.js.map