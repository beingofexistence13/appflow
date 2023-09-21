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
define(["require", "exports", "vs/base/browser/ui/toolbar/toolbar", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/editor/common/editorContextKeys", "vs/nls", "vs/platform/actions/browser/dropdownWithPrimaryActionViewItem", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkeys", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/browser/view/cellParts/cellToolbarStickyScroll", "vs/workbench/contrib/notebook/common/notebookContextKeys"], function (require, exports, toolbar_1, actions_1, lifecycle_1, editorContextKeys_1, nls_1, dropdownWithPrimaryActionViewItem_1, menuEntryActionViewItem_1, actions_2, contextkeys_1, contextView_1, instantiation_1, keybinding_1, cellPart_1, cellToolbarStickyScroll_1, notebookContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCodeCellExecutionContextKeyService = exports.RunToolbar = void 0;
    let RunToolbar = class RunToolbar extends cellPart_1.CellContentPart {
        constructor(notebookEditor, contextKeyService, cellContainer, runButtonContainer, menuService, keybindingService, contextMenuService, instantiationService) {
            super();
            this.notebookEditor = notebookEditor;
            this.contextKeyService = contextKeyService;
            this.cellContainer = cellContainer;
            this.runButtonContainer = runButtonContainer;
            this.keybindingService = keybindingService;
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
            this.primaryMenu = this._register(menuService.createMenu(this.notebookEditor.creationOptions.menuIds.cellExecutePrimary, contextKeyService));
            this.secondaryMenu = this._register(menuService.createMenu(this.notebookEditor.creationOptions.menuIds.cellExecuteToolbar, contextKeyService));
            this.createRunCellToolbar(runButtonContainer, cellContainer, contextKeyService);
            const updateActions = () => {
                const actions = this.getCellToolbarActions(this.primaryMenu);
                const primary = actions.primary[0]; // Only allow one primary action
                this.toolbar.setActions(primary ? [primary] : []);
            };
            updateActions();
            this._register(this.primaryMenu.onDidChange(updateActions));
            this._register(this.secondaryMenu.onDidChange(updateActions));
            this._register(this.notebookEditor.notebookOptions.onDidChangeOptions(updateActions));
        }
        didRenderCell(element) {
            this.cellDisposables.add((0, cellToolbarStickyScroll_1.registerCellToolbarStickyScroll)(this.notebookEditor, element, this.runButtonContainer));
            this.toolbar.context = {
                ui: true,
                cell: element,
                notebookEditor: this.notebookEditor,
                $mid: 13 /* MarshalledId.NotebookCellActionContext */
            };
        }
        getCellToolbarActions(menu) {
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { shouldForwardArgs: true }, result, g => /^inline/.test(g));
            return result;
        }
        createRunCellToolbar(container, cellContainer, contextKeyService) {
            const actionViewItemDisposables = this._register(new lifecycle_1.DisposableStore());
            const dropdownAction = this._register(new actions_1.Action('notebook.moreRunActions', (0, nls_1.localize)('notebook.moreRunActionsLabel', "More..."), 'codicon-chevron-down', true));
            const keybindingProvider = (action) => this.keybindingService.lookupKeybinding(action.id, executionContextKeyService);
            const executionContextKeyService = this._register(getCodeCellExecutionContextKeyService(contextKeyService));
            this.toolbar = this._register(new toolbar_1.ToolBar(container, this.contextMenuService, {
                getKeyBinding: keybindingProvider,
                actionViewItemProvider: _action => {
                    actionViewItemDisposables.clear();
                    const primary = this.getCellToolbarActions(this.primaryMenu).primary[0];
                    if (!(primary instanceof actions_2.MenuItemAction)) {
                        return undefined;
                    }
                    const secondary = this.getCellToolbarActions(this.secondaryMenu).secondary;
                    if (!secondary.length) {
                        return undefined;
                    }
                    const item = this.instantiationService.createInstance(dropdownWithPrimaryActionViewItem_1.DropdownWithPrimaryActionViewItem, primary, dropdownAction, secondary, 'notebook-cell-run-toolbar', this.contextMenuService, {
                        getKeyBinding: keybindingProvider
                    });
                    actionViewItemDisposables.add(item.onDidChangeDropdownVisibility(visible => {
                        cellContainer.classList.toggle('cell-run-toolbar-dropdown-active', visible);
                    }));
                    return item;
                },
                renderDropdownAsChildElement: true
            }));
        }
    };
    exports.RunToolbar = RunToolbar;
    exports.RunToolbar = RunToolbar = __decorate([
        __param(4, actions_2.IMenuService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, instantiation_1.IInstantiationService)
    ], RunToolbar);
    function getCodeCellExecutionContextKeyService(contextKeyService) {
        // Create a fake ContextKeyService, and look up the keybindings within this context.
        const executionContextKeyService = contextKeyService.createScoped(document.createElement('div'));
        contextkeys_1.InputFocusedContext.bindTo(executionContextKeyService).set(true);
        editorContextKeys_1.EditorContextKeys.editorTextFocus.bindTo(executionContextKeyService).set(true);
        editorContextKeys_1.EditorContextKeys.focus.bindTo(executionContextKeyService).set(true);
        editorContextKeys_1.EditorContextKeys.textInputFocus.bindTo(executionContextKeyService).set(true);
        notebookContextKeys_1.NOTEBOOK_CELL_EXECUTION_STATE.bindTo(executionContextKeyService).set('idle');
        notebookContextKeys_1.NOTEBOOK_CELL_LIST_FOCUSED.bindTo(executionContextKeyService).set(true);
        notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED.bindTo(executionContextKeyService).set(true);
        notebookContextKeys_1.NOTEBOOK_CELL_TYPE.bindTo(executionContextKeyService).set('code');
        return executionContextKeyService;
    }
    exports.getCodeCellExecutionContextKeyService = getCodeCellExecutionContextKeyService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUNlbGxSdW5Ub29sYmFyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3L2NlbGxQYXJ0cy9jb2RlQ2VsbFJ1blRvb2xiYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBc0J6RixJQUFNLFVBQVUsR0FBaEIsTUFBTSxVQUFXLFNBQVEsMEJBQWU7UUFNOUMsWUFDVSxjQUF1QyxFQUN2QyxpQkFBcUMsRUFDckMsYUFBMEIsRUFDMUIsa0JBQStCLEVBQzFCLFdBQXlCLEVBQ0YsaUJBQXFDLEVBQ3BDLGtCQUF1QyxFQUNyQyxvQkFBMkM7WUFFbkYsS0FBSyxFQUFFLENBQUM7WUFUQyxtQkFBYyxHQUFkLGNBQWMsQ0FBeUI7WUFDdkMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUNyQyxrQkFBYSxHQUFiLGFBQWEsQ0FBYTtZQUMxQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQWE7WUFFSCxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQ3BDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDckMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUluRixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsa0JBQW1CLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1lBQzlJLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFDL0ksSUFB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