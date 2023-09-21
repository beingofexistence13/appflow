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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/mouseEvent", "vs/base/browser/ui/toolbar/toolbar", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/telemetry/common/telemetry"], function (require, exports, dom_1, mouseEvent_1, toolbar_1, actions_1, arrays_1, errors_1, event_1, lifecycle_1, nls_1, menuEntryActionViewItem_1, actions_2, contextkey_1, contextView_1, keybinding_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MenuWorkbenchToolBar = exports.WorkbenchToolBar = exports.HiddenItemStrategy = void 0;
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
     * See {@link MenuWorkbenchToolBar} for a toolbar that is backed by a menu.
     */
    let WorkbenchToolBar = class WorkbenchToolBar extends toolbar_1.ToolBar {
        constructor(container, _options, _menuService, _contextKeyService, _contextMenuService, keybindingService, telemetryService) {
            super(container, _contextMenuService, {
                // defaults
                getKeyBinding: (action) => keybindingService.lookupKeybinding(action.id) ?? undefined,
                // options (override defaults)
                ..._options,
                // mandatory (overide options)
                allowContextMenu: true,
                skipTelemetry: typeof _options?.telemetrySource === 'string',
            });
            this._options = _options;
            this._menuService = _menuService;
            this._contextKeyService = _contextKeyService;
            this._contextMenuService = _contextMenuService;
            this._sessionDisposables = this._store.add(new lifecycle_1.DisposableStore());
            // telemetry logic
            const telemetrySource = _options?.telemetrySource;
            if (telemetrySource) {
                this._store.add(this.actionBar.onDidRun(e => telemetryService.publicLog2('workbenchActionExecuted', { id: e.action.id, from: telemetrySource })));
            }
        }
        setActions(_primary, _secondary = [], menuIds) {
            this._sessionDisposables.clear();
            const primary = _primary.slice();
            const secondary = _secondary.slice();
            const toggleActions = [];
            let toggleActionsCheckedCount = 0;
            const extraSecondary = [];
            let someAreHidden = false;
            // unless disabled, move all hidden items to secondary group or ignore them
            if (this._options?.hiddenItemStrategy !== -1 /* HiddenItemStrategy.NoHide */) {
                for (let i = 0; i < primary.length; i++) {
                    const action = primary[i];
                    if (!(action instanceof actions_2.MenuItemAction) && !(action instanceof actions_2.SubmenuItemAction)) {
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
                        if (this._options?.hiddenItemStrategy !== 0 /* HiddenItemStrategy.Ignore */) {
                            extraSecondary[i] = action;
                        }
                    }
                }
            }
            // count for max
            if (this._options?.maxNumberOfItems !== undefined) {
                let count = 0;
                for (let i = 0; i < primary.length; i++) {
                    const action = primary[i];
                    if (!action) {
                        continue;
                    }
                    if (++count >= this._options.maxNumberOfItems) {
                        primary[i] = undefined;
                        extraSecondary[i] = action;
                    }
                }
            }
            (0, arrays_1.coalesceInPlace)(primary);
            (0, arrays_1.coalesceInPlace)(extraSecondary);
            super.setActions(primary, actions_1.Separator.join(extraSecondary, secondary));
            // add context menu for toggle actions
            if (toggleActions.length > 0) {
                this._sessionDisposables.add((0, dom_1.addDisposableListener)(this.getElement(), 'contextmenu', e => {
                    const event = new mouseEvent_1.StandardMouseEvent(e);
                    const action = this.getItemAction(event.target);
                    if (!(action)) {
                        return;
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    let noHide = false;
                    // last item cannot be hidden when using ignore strategy
                    if (toggleActionsCheckedCount === 1 && this._options?.hiddenItemStrategy === 0 /* HiddenItemStrategy.Ignore */) {
                        noHide = true;
                        for (let i = 0; i < toggleActions.length; i++) {
                            if (toggleActions[i].checked) {
                                toggleActions[i] = (0, actions_1.toAction)({
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
                    if (!noHide && (action instanceof actions_2.MenuItemAction || action instanceof actions_2.SubmenuItemAction)) {
                        if (!action.hideActions) {
                            // no context menu for MenuItemAction instances that support no hiding
                            // those are fake actions and need to be cleaned up
                            return;
                        }
                        hideAction = action.hideActions.hide;
                    }
                    else {
                        hideAction = (0, actions_1.toAction)({
                            id: 'label',
                            label: (0, nls_1.localize)('hide', "Hide"),
                            enabled: false,
                            run() { }
                        });
                    }
                    const actions = actions_1.Separator.join([hideAction], toggleActions);
                    // add "Reset Menu" action
                    if (this._options?.resetMenu && !menuIds) {
                        menuIds = [this._options.resetMenu];
                    }
                    if (someAreHidden && menuIds) {
                        actions.push(new actions_1.Separator());
                        actions.push((0, actions_1.toAction)({
                            id: 'resetThisMenu',
                            label: (0, nls_1.localize)('resetThisMenu', "Reset Menu"),
                            run: () => this._menuService.resetHiddenStates(menuIds)
                        }));
                    }
                    this._contextMenuService.showContextMenu({
                        getAnchor: () => event,
                        getActions: () => actions,
                        // add context menu actions (iff appicable)
                        menuId: this._options?.contextMenu,
                        menuActionOptions: { renderShortTitle: true, ...this._options?.menuOptions },
                        skipTelemetry: typeof this._options?.telemetrySource === 'string',
                        contextKeyService: this._contextKeyService,
                    });
                }));
            }
        }
    };
    exports.WorkbenchToolBar = WorkbenchToolBar;
    exports.WorkbenchToolBar = WorkbenchToolBar = __decorate([
        __param(2, actions_2.IMenuService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, contextView_1.IContextMenuService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, telemetry_1.ITelemetryService)
    ], WorkbenchToolBar);
    /**
     * A {@link WorkbenchToolBar workbench toolbar} that is purely driven from a {@link MenuId menu}-identifier.
     *
     * *Note* that Manual updates via `setActions` are NOT supported.
     */
    let MenuWorkbenchToolBar = class MenuWorkbenchToolBar extends WorkbenchToolBar {
        constructor(container, menuId, options, menuService, contextKeyService, contextMenuService, keybindingService, telemetryService) {
            super(container, { resetMenu: menuId, ...options }, menuService, contextKeyService, contextMenuService, keybindingService, telemetryService);
            this._onDidChangeMenuItems = this._store.add(new event_1.Emitter());
            this.onDidChangeMenuItems = this._onDidChangeMenuItems.event;
            // update logic
            const menu = this._store.add(menuService.createMenu(menuId, contextKeyService, { emitEventsForSubmenuChanges: true }));
            const updateToolbar = () => {
                const primary = [];
                const secondary = [];
                (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, options?.menuOptions, { primary, secondary }, options?.toolbarOptions?.primaryGroup, options?.toolbarOptions?.shouldInlineSubmenu, options?.toolbarOptions?.useSeparatorsInPrimaryActions);
                super.setActions(primary, secondary);
            };
            this._store.add(menu.onDidChange(() => {
                updateToolbar();
                this._onDidChangeMenuItems.fire(this);
            }));
            updateToolbar();
        }
        /**
         * @deprecated The WorkbenchToolBar does not support this method because it works with menus.
         */
        setActions() {
            throw new errors_1.BugIndicatingError('This toolbar is populated from a menu.');
        }
    };
    exports.MenuWorkbenchToolBar = MenuWorkbenchToolBar;
    exports.MenuWorkbenchToolBar = MenuWorkbenchToolBar = __decorate([
        __param(3, actions_2.IMenuService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, telemetry_1.ITelemetryService)
    ], MenuWorkbenchToolBar);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbGJhci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2FjdGlvbnMvYnJvd3Nlci90b29sYmFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWtCaEcsSUFBa0Isa0JBT2pCO0lBUEQsV0FBa0Isa0JBQWtCO1FBQ25DLHlDQUF5QztRQUN6QyxnRUFBVyxDQUFBO1FBQ1gseUNBQXlDO1FBQ3pDLCtEQUFVLENBQUE7UUFDVixpREFBaUQ7UUFDakQsK0ZBQTBCLENBQUE7SUFDM0IsQ0FBQyxFQVBpQixrQkFBa0Isa0NBQWxCLGtCQUFrQixRQU9uQztJQTBDRDs7Ozs7OztPQU9HO0lBQ0ksSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBaUIsU0FBUSxpQkFBTztRQUk1QyxZQUNDLFNBQXNCLEVBQ2QsUUFBOEMsRUFDeEMsWUFBMkMsRUFDckMsa0JBQXVELEVBQ3RELG1CQUF5RCxFQUMxRCxpQkFBcUMsRUFDdEMsZ0JBQW1DO1lBRXRELEtBQUssQ0FBQyxTQUFTLEVBQUUsbUJBQW1CLEVBQUU7Z0JBQ3JDLFdBQVc7Z0JBQ1gsYUFBYSxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksU0FBUztnQkFDckYsOEJBQThCO2dCQUM5QixHQUFHLFFBQVE7Z0JBQ1gsOEJBQThCO2dCQUM5QixnQkFBZ0IsRUFBRSxJQUFJO2dCQUN0QixhQUFhLEVBQUUsT0FBTyxRQUFRLEVBQUUsZUFBZSxLQUFLLFFBQVE7YUFDNUQsQ0FBQyxDQUFDO1lBZkssYUFBUSxHQUFSLFFBQVEsQ0FBc0M7WUFDdkIsaUJBQVksR0FBWixZQUFZLENBQWM7WUFDcEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUNyQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFC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