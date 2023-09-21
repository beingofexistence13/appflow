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
define(["require", "exports", "vs/base/browser/ui/toolbar/toolbar", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/editor/common/editorContextKeys", "vs/nls!vs/workbench/contrib/notebook/browser/view/cellParts/codeCellRunToolbar", "vs/platform/actions/browser/dropdownWithPrimaryActionViewItem", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkeys", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/browser/view/cellParts/cellToolbarStickyScroll", "vs/workbench/contrib/notebook/common/notebookContextKeys"], function (require, exports, toolbar_1, actions_1, lifecycle_1, editorContextKeys_1, nls_1, dropdownWithPrimaryActionViewItem_1, menuEntryActionViewItem_1, actions_2, contextkeys_1, contextView_1, instantiation_1, keybinding_1, cellPart_1, cellToolbarStickyScroll_1, notebookContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Xqb = exports.$Wqb = void 0;
    let $Wqb = class $Wqb extends cellPart_1.$Hnb {
        constructor(notebookEditor, contextKeyService, cellContainer, runButtonContainer, menuService, j, m, n) {
            super();
            this.notebookEditor = notebookEditor;
            this.contextKeyService = contextKeyService;
            this.cellContainer = cellContainer;
            this.runButtonContainer = runButtonContainer;
            this.j = j;
            this.m = m;
            this.n = n;
            this.b = this.B(menuService.createMenu(this.notebookEditor.creationOptions.menuIds.cellExecutePrimary, contextKeyService));
            this.h = this.B(menuService.createMenu(this.notebookEditor.creationOptions.menuIds.cellExecuteToolbar, contextKeyService));
            this.r(runButtonContainer, cellContainer, contextKeyService);
            const updateActions = () => {
                const actions = this.getCellToolbarActions(this.b);
                const primary = actions.primary[0]; // Only allow one primary action
                this.a.setActions(primary ? [primary] : []);
            };
            updateActions();
            this.B(this.b.onDidChange(updateActions));
            this.B(this.h.onDidChange(updateActions));
            this.B(this.notebookEditor.notebookOptions.onDidChangeOptions(updateActions));
        }
        didRenderCell(element) {
            this.f.add((0, cellToolbarStickyScroll_1.$npb)(this.notebookEditor, element, this.runButtonContainer));
            this.a.context = {
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
            (0, menuEntryActionViewItem_1.$B3)(menu, { shouldForwardArgs: true }, result, g => /^inline/.test(g));
            return result;
        }
        r(container, cellContainer, contextKeyService) {
            const actionViewItemDisposables = this.B(new lifecycle_1.$jc());
            const dropdownAction = this.B(new actions_1.$gi('notebook.moreRunActions', (0, nls_1.localize)(0, null), 'codicon-chevron-down', true));
            const keybindingProvider = (action) => this.j.lookupKeybinding(action.id, executionContextKeyService);
            const executionContextKeyService = this.B($Xqb(contextKeyService));
            this.a = this.B(new toolbar_1.$6R(container, this.m, {
                getKeyBinding: keybindingProvider,
                actionViewItemProvider: _action => {
                    actionViewItemDisposables.clear();
                    const primary = this.getCellToolbarActions(this.b).primary[0];
                    if (!(primary instanceof actions_2.$Vu)) {
                        return undefined;
                    }
                    const secondary = this.getCellToolbarActions(this.h).secondary;
                    if (!secondary.length) {
                        return undefined;
                    }
                    const item = this.n.createInstance(dropdownWithPrimaryActionViewItem_1.$Vqb, primary, dropdownAction, secondary, 'notebook-cell-run-toolbar', this.m, {
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
    exports.$Wqb = $Wqb;
    exports.$Wqb = $Wqb = __decorate([
        __param(4, actions_2.$Su),
        __param(5, keybinding_1.$2D),
        __param(6, contextView_1.$WZ),
        __param(7, instantiation_1.$Ah)
    ], $Wqb);
    function $Xqb(contextKeyService) {
        // Create a fake ContextKeyService, and look up the keybindings within this context.
        const executionContextKeyService = contextKeyService.createScoped(document.createElement('div'));
        contextkeys_1.$93.bindTo(executionContextKeyService).set(true);
        editorContextKeys_1.EditorContextKeys.editorTextFocus.bindTo(executionContextKeyService).set(true);
        editorContextKeys_1.EditorContextKeys.focus.bindTo(executionContextKeyService).set(true);
        editorContextKeys_1.EditorContextKeys.textInputFocus.bindTo(executionContextKeyService).set(true);
        notebookContextKeys_1.$fob.bindTo(executionContextKeyService).set('idle');
        notebookContextKeys_1.$Znb.bindTo(executionContextKeyService).set(true);
        notebookContextKeys_1.$Ynb.bindTo(executionContextKeyService).set(true);
        notebookContextKeys_1.$_nb.bindTo(executionContextKeyService).set('code');
        return executionContextKeyService;
    }
    exports.$Xqb = $Xqb;
});
//# sourceMappingURL=codeCellRunToolbar.js.map