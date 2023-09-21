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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/toolbar/toolbar", "vs/base/common/async", "vs/base/common/event", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/notebook/browser/view/cellParts/cellActionView", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/browser/view/cellParts/cellToolbarStickyScroll", "vs/platform/actions/browser/toolbar"], function (require, exports, DOM, toolbar_1, async_1, event_1, menuEntryActionViewItem_1, actions_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, cellActionView_1, cellPart_1, cellToolbarStickyScroll_1, toolbar_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellTitleToolbarPart = exports.BetweenCellToolbar = void 0;
    let BetweenCellToolbar = class BetweenCellToolbar extends cellPart_1.CellOverlayPart {
        constructor(_notebookEditor, _titleToolbarContainer, _bottomCellToolbarContainer, instantiationService, contextMenuService, contextKeyService, menuService) {
            super();
            this._notebookEditor = _notebookEditor;
            this._bottomCellToolbarContainer = _bottomCellToolbarContainer;
            this.instantiationService = instantiationService;
            this.contextMenuService = contextMenuService;
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
        }
        _initialize() {
            if (this._betweenCellToolbar) {
                return this._betweenCellToolbar;
            }
            const betweenCellToolbar = this._register(new toolbar_1.ToolBar(this._bottomCellToolbarContainer, this.contextMenuService, {
                actionViewItemProvider: action => {
                    if (action instanceof actions_1.MenuItemAction) {
                        if (this._notebookEditor.notebookOptions.getLayoutConfiguration().insertToolbarAlignment === 'center') {
                            return this.instantiationService.createInstance(cellActionView_1.CodiconActionViewItem, action, undefined);
                        }
                        else {
                            return this.instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action, undefined);
                        }
                    }
                    return undefined;
                }
            }));
            this._betweenCellToolbar = betweenCellToolbar;
            const menu = this._register(this.menuService.createMenu(this._notebookEditor.creationOptions.menuIds.cellInsertToolbar, this.contextKeyService));
            const updateActions = () => {
                const actions = getCellToolbarActions(menu);
                betweenCellToolbar.setActions(actions.primary, actions.secondary);
            };
            this._register(menu.onDidChange(() => updateActions()));
            this._register(this._notebookEditor.notebookOptions.onDidChangeOptions((e) => {
                if (e.insertToolbarAlignment) {
                    updateActions();
                }
            }));
            updateActions();
            return betweenCellToolbar;
        }
        didRenderCell(element) {
            const betweenCellToolbar = this._initialize();
            betweenCellToolbar.context = {
                ui: true,
                cell: element,
                notebookEditor: this._notebookEditor,
                $mid: 13 /* MarshalledId.NotebookCellActionContext */
            };
            this.updateInternalLayoutNow(element);
        }
        updateInternalLayoutNow(element) {
            const bottomToolbarOffset = element.layoutInfo.bottomToolbarOffset;
            this._bottomCellToolbarContainer.style.transform = `translateY(${bottomToolbarOffset}px)`;
        }
    };
    exports.BetweenCellToolbar = BetweenCellToolbar;
    exports.BetweenCellToolbar = BetweenCellToolbar = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, contextView_1.IContextMenuService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, actions_1.IMenuService)
    ], BetweenCellToolbar);
    let CellTitleToolbarPart = class CellTitleToolbarPart extends cellPart_1.CellOverlayPart {
        get hasActions() {
            if (!this._model) {
                return false;
            }
            return this._model.actions.primary.length
                + this._model.actions.secondary.length
                + this._model.deleteActions.primary.length
                + this._model.deleteActions.secondary.length
                > 0;
        }
        constructor(toolbarContainer, _rootClassDelegate, toolbarId, deleteToolbarId, _notebookEditor, contextKeyService, menuService, instantiationService) {
            super();
            this.toolbarContainer = toolbarContainer;
            this._rootClassDelegate = _rootClassDelegate;
            this.toolbarId = toolbarId;
            this.deleteToolbarId = deleteToolbarId;
            this._notebookEditor = _notebookEditor;
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
            this.instantiationService = instantiationService;
            this._onDidUpdateActions = this._register(new event_1.Emitter());
            this.onDidUpdateActions = this._onDidUpdateActions.event;
        }
        _initializeModel() {
            if (this._model) {
                return this._model;
            }
            const titleMenu = this._register(this.menuService.createMenu(this.toolbarId, this.contextKeyService));
            const deleteMenu = this._register(this.menuService.createMenu(this.deleteToolbarId, this.contextKeyService));
            const actions = getCellToolbarActions(titleMenu);
            const deleteActions = getCellToolbarActions(deleteMenu);
            this._model = {
                titleMenu,
                actions,
                deleteMenu,
                deleteActions
            };
            return this._model;
        }
        _initialize(model, element) {
            if (this._view) {
                return this._view;
            }
            const toolbar = this._register(this.instantiationService.createInstance(toolbar_2.WorkbenchToolBar, this.toolbarContainer, {
                actionViewItemProvider: action => {
                    return (0, menuEntryActionViewItem_1.createActionViewItem)(this.instantiationService, action);
                },
                renderDropdownAsChildElement: true
            }));
            const deleteToolbar = this._register(this.instantiationService.invokeFunction(accessor => createDeleteToolbar(accessor, this.toolbarContainer, 'cell-delete-toolbar')));
            if (model.deleteActions.primary.length !== 0 || model.deleteActions.secondary.length !== 0) {
                deleteToolbar.setActions(model.deleteActions.primary, model.deleteActions.secondary);
            }
            this.setupChangeListeners(toolbar, model.titleMenu, model.actions);
            this.setupChangeListeners(deleteToolbar, model.deleteMenu, model.deleteActions);
            this._view = {
                toolbar,
                deleteToolbar
            };
            return this._view;
        }
        prepareRenderCell(element) {
            this._initializeModel();
        }
        didRenderCell(element) {
            const model = this._initializeModel();
            const view = this._initialize(model, element);
            this.cellDisposables.add((0, cellToolbarStickyScroll_1.registerCellToolbarStickyScroll)(this._notebookEditor, element, this.toolbarContainer, { extraOffset: 4, min: -14 }));
            this.updateContext(view, {
                ui: true,
                cell: element,
                notebookEditor: this._notebookEditor,
                $mid: 13 /* MarshalledId.NotebookCellActionContext */
            });
        }
        updateContext(view, toolbarContext) {
            view.toolbar.context = toolbarContext;
            view.deleteToolbar.context = toolbarContext;
        }
        setupChangeListeners(toolbar, menu, initActions) {
            // #103926
            let dropdownIsVisible = false;
            let deferredUpdate;
            this.updateActions(toolbar, initActions);
            this._register(menu.onDidChange(() => {
                if (dropdownIsVisible) {
                    const actions = getCellToolbarActions(menu);
                    deferredUpdate = () => this.updateActions(toolbar, actions);
                    return;
                }
                const actions = getCellToolbarActions(menu);
                this.updateActions(toolbar, actions);
            }));
            this._rootClassDelegate.toggle('cell-toolbar-dropdown-active', false);
            this._register(toolbar.onDidChangeDropdownVisibility(visible => {
                dropdownIsVisible = visible;
                this._rootClassDelegate.toggle('cell-toolbar-dropdown-active', visible);
                if (deferredUpdate && !visible) {
                    this._register((0, async_1.disposableTimeout)(() => {
                        deferredUpdate?.();
                    }));
                    deferredUpdate = undefined;
                }
            }));
        }
        updateActions(toolbar, actions) {
            const hadFocus = DOM.isAncestor(document.activeElement, toolbar.getElement());
            toolbar.setActions(actions.primary, actions.secondary);
            if (hadFocus) {
                this._notebookEditor.focus();
            }
            if (actions.primary.length || actions.secondary.length) {
                this._rootClassDelegate.toggle('cell-has-toolbar-actions', true);
                this._onDidUpdateActions.fire();
            }
            else {
                this._rootClassDelegate.toggle('cell-has-toolbar-actions', false);
                this._onDidUpdateActions.fire();
            }
        }
    };
    exports.CellTitleToolbarPart = CellTitleToolbarPart;
    exports.CellTitleToolbarPart = CellTitleToolbarPart = __decorate([
        __param(5, contextkey_1.IContextKeyService),
        __param(6, actions_1.IMenuService),
        __param(7, instantiation_1.IInstantiationService)
    ], CellTitleToolbarPart);
    function getCellToolbarActions(menu) {
        const primary = [];
        const secondary = [];
        const result = { primary, secondary };
        (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { shouldForwardArgs: true }, result, g => /^inline/.test(g));
        return result;
    }
    function createDeleteToolbar(accessor, container, elementClass) {
        const contextMenuService = accessor.get(contextView_1.IContextMenuService);
        const keybindingService = accessor.get(keybinding_1.IKeybindingService);
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const toolbar = new toolbar_1.ToolBar(container, contextMenuService, {
            getKeyBinding: action => keybindingService.lookupKeybinding(action.id),
            actionViewItemProvider: action => {
                return (0, menuEntryActionViewItem_1.createActionViewItem)(instantiationService, action);
            },
            renderDropdownAsChildElement: true
        });
        if (elementClass) {
            toolbar.getElement().classList.add(elementClass);
        }
        return toolbar;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbFRvb2xiYXJzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3L2NlbGxQYXJ0cy9jZWxsVG9vbGJhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBc0J6RixJQUFNLGtCQUFrQixHQUF4QixNQUFNLGtCQUFtQixTQUFRLDBCQUFlO1FBR3RELFlBQ2tCLGVBQXdDLEVBQ3pELHNCQUFtQyxFQUNsQiwyQkFBd0MsRUFDakIsb0JBQTJDLEVBQzdDLGtCQUF1QyxFQUN4QyxpQkFBcUMsRUFDM0MsV0FBeUI7WUFFeEQsS0FBSyxFQUFFLENBQUM7WUFSUyxvQkFBZSxHQUFmLGVBQWUsQ0FBeUI7WUFFeEMsZ0NBQTJCLEdBQTNCLDJCQUEyQixDQUFhO1lBQ2pCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDN0MsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUN4QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQzNDLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1FBR3pELENBQUM7UUFFTyxXQUFXO1lBQ2xCLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFO2dCQUM3QixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQzthQUNoQztZQUVELE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGlCQUFPLENBQUMsSUFBSSxDQUFDLDJCQUEyQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDaEgsc0JBQXNCLEVBQUUsTUFBTSxDQUFDLEVBQUU7b0JBQ2hDLElBQUksTUFBTSxZQUFZLHdCQUFjLEVBQUU7d0JBQ3JDLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxzQkFBc0IsS0FBSyxRQUFR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