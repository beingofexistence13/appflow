/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/viewModel/foldingModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/nls"], function (require, exports, lifecycle_1, notebookContextKeys_1, notebookBrowser_1, foldingModel_1, notebookCommon_1, notebookEditorExtensions_1, actions_1, contextkey_1, contextkeys_1, editorService_1, coreActions_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FoldingController = void 0;
    class FoldingController extends lifecycle_1.Disposable {
        static { this.id = 'workbench.notebook.foldingController'; }
        constructor(_notebookEditor) {
            super();
            this._notebookEditor = _notebookEditor;
            this._foldingModel = null;
            this._localStore = this._register(new lifecycle_1.DisposableStore());
            this._register(this._notebookEditor.onMouseUp(e => { this.onMouseUp(e); }));
            this._register(this._notebookEditor.onDidChangeModel(() => {
                this._localStore.clear();
                if (!this._notebookEditor.hasModel()) {
                    return;
                }
                this._localStore.add(this._notebookEditor.onDidChangeCellState(e => {
                    if (e.source.editStateChanged && e.cell.cellKind === notebookCommon_1.CellKind.Markup) {
                        this._foldingModel?.recompute();
                        // this._updateEditorFoldingRanges();
                    }
                }));
                this._foldingModel = new foldingModel_1.FoldingModel();
                this._localStore.add(this._foldingModel);
                this._foldingModel.attachViewModel(this._notebookEditor.getViewModel());
                this._localStore.add(this._foldingModel.onDidFoldingRegionChanged(() => {
                    this._updateEditorFoldingRanges();
                }));
            }));
        }
        saveViewState() {
            return this._foldingModel?.getMemento() || [];
        }
        restoreViewState(state) {
            this._foldingModel?.applyMemento(state || []);
            this._updateEditorFoldingRanges();
        }
        setFoldingStateDown(index, state, levels) {
            const doCollapse = state === 2 /* CellFoldingState.Collapsed */;
            const region = this._foldingModel.getRegionAtLine(index + 1);
            const regions = [];
            if (region) {
                if (region.isCollapsed !== doCollapse) {
                    regions.push(region);
                }
                if (levels > 1) {
                    const regionsInside = this._foldingModel.getRegionsInside(region, (r, level) => r.isCollapsed !== doCollapse && level < levels);
                    regions.push(...regionsInside);
                }
            }
            regions.forEach(r => this._foldingModel.setCollapsed(r.regionIndex, state === 2 /* CellFoldingState.Collapsed */));
            this._updateEditorFoldingRanges();
        }
        setFoldingStateUp(index, state, levels) {
            if (!this._foldingModel) {
                return;
            }
            const regions = this._foldingModel.getAllRegionsAtLine(index + 1, (region, level) => region.isCollapsed !== (state === 2 /* CellFoldingState.Collapsed */) && level <= levels);
            regions.forEach(r => this._foldingModel.setCollapsed(r.regionIndex, state === 2 /* CellFoldingState.Collapsed */));
            this._updateEditorFoldingRanges();
        }
        _updateEditorFoldingRanges() {
            if (!this._foldingModel) {
                return;
            }
            if (!this._notebookEditor.hasModel()) {
                return;
            }
            const vm = this._notebookEditor.getViewModel();
            vm.updateFoldingRanges(this._foldingModel.regions);
            const hiddenRanges = vm.getHiddenRanges();
            this._notebookEditor.setHiddenAreas(hiddenRanges);
        }
        onMouseUp(e) {
            if (!e.event.target) {
                return;
            }
            if (!this._notebookEditor.hasModel()) {
                return;
            }
            const viewModel = this._notebookEditor.getViewModel();
            const target = e.event.target;
            if (target.classList.contains('codicon-notebook-collapsed') || target.classList.contains('codicon-notebook-expanded')) {
                const parent = target.parentElement;
                if (!parent.classList.contains('notebook-folding-indicator')) {
                    return;
                }
                // folding icon
                const cellViewModel = e.target;
                const modelIndex = viewModel.getCellIndex(cellViewModel);
                const state = viewModel.getFoldingState(modelIndex);
                if (state === 0 /* CellFoldingState.None */) {
                    return;
                }
                this.setFoldingStateUp(modelIndex, state === 2 /* CellFoldingState.Collapsed */ ? 1 /* CellFoldingState.Expanded */ : 2 /* CellFoldingState.Collapsed */, 1);
                this._notebookEditor.focusElement(cellViewModel);
            }
            return;
        }
    }
    exports.FoldingController = FoldingController;
    (0, notebookEditorExtensions_1.registerNotebookContribution)(FoldingController.id, FoldingController);
    const NOTEBOOK_FOLD_COMMAND_LABEL = (0, nls_1.localize)('fold.cell', "Fold Cell");
    const NOTEBOOK_UNFOLD_COMMAND_LABEL = (0, nls_1.localize)('unfold.cell', "Unfold Cell");
    const FOLDING_COMMAND_ARGS = {
        args: [{
                isOptional: true,
                name: 'index',
                description: 'The cell index',
                schema: {
                    'type': 'object',
                    'required': ['index', 'direction'],
                    'properties': {
                        'index': {
                            'type': 'number'
                        },
                        'direction': {
                            'type': 'string',
                            'enum': ['up', 'down'],
                            'default': 'down'
                        },
                        'levels': {
                            'type': 'number',
                            'default': 1
                        },
                    }
                }
            }]
    };
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.fold',
                title: { value: (0, nls_1.localize)('fold.cell', "Fold Cell"), original: 'Fold Cell' },
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey)),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 92 /* KeyCode.BracketLeft */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 92 /* KeyCode.BracketLeft */,
                        secondary: [15 /* KeyCode.LeftArrow */],
                    },
                    secondary: [15 /* KeyCode.LeftArrow */],
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                description: {
                    description: NOTEBOOK_FOLD_COMMAND_LABEL,
                    args: FOLDING_COMMAND_ARGS.args
                },
                precondition: notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR,
                f1: true
            });
        }
        async run(accessor, args) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
            if (!editor) {
                return;
            }
            if (!editor.hasModel()) {
                return;
            }
            const levels = args && args.levels || 1;
            const direction = args && args.direction === 'up' ? 'up' : 'down';
            let index = undefined;
            if (args) {
                index = args.index;
            }
            else {
                const activeCell = editor.getActiveCell();
                if (!activeCell) {
                    return;
                }
                index = editor.getCellIndex(activeCell);
            }
            const controller = editor.getContribution(FoldingController.id);
            if (index !== undefined) {
                const targetCell = (index < 0 || index >= editor.getLength()) ? undefined : editor.cellAt(index);
                if (targetCell?.cellKind === notebookCommon_1.CellKind.Code && direction === 'down') {
                    return;
                }
                if (direction === 'up') {
                    controller.setFoldingStateUp(index, 2 /* CellFoldingState.Collapsed */, levels);
                }
                else {
                    controller.setFoldingStateDown(index, 2 /* CellFoldingState.Collapsed */, levels);
                }
                const viewIndex = editor.getViewModel().getNearestVisibleCellIndexUpwards(index);
                editor.focusElement(editor.cellAt(viewIndex));
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.unfold',
                title: { value: NOTEBOOK_UNFOLD_COMMAND_LABEL, original: 'Unfold Cell' },
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookContextKeys_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey)),
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 94 /* KeyCode.BracketRight */,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 94 /* KeyCode.BracketRight */,
                        secondary: [17 /* KeyCode.RightArrow */],
                    },
                    secondary: [17 /* KeyCode.RightArrow */],
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */
                },
                description: {
                    description: NOTEBOOK_UNFOLD_COMMAND_LABEL,
                    args: FOLDING_COMMAND_ARGS.args
                },
                precondition: notebookContextKeys_1.NOTEBOOK_IS_ACTIVE_EDITOR,
                f1: true
            });
        }
        async run(accessor, args) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
            if (!editor) {
                return;
            }
            const levels = args && args.levels || 1;
            const direction = args && args.direction === 'up' ? 'up' : 'down';
            let index = undefined;
            if (args) {
                index = args.index;
            }
            else {
                const activeCell = editor.getActiveCell();
                if (!activeCell) {
                    return;
                }
                index = editor.getCellIndex(activeCell);
            }
            const controller = editor.getContribution(FoldingController.id);
            if (index !== undefined) {
                if (direction === 'up') {
                    controller.setFoldingStateUp(index, 1 /* CellFoldingState.Expanded */, levels);
                }
                else {
                    controller.setFoldingStateDown(index, 1 /* CellFoldingState.Expanded */, levels);
                }
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGluZ0NvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2NvbnRyb2xsZXIvZm9sZGluZ0NvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBcUJoRyxNQUFhLGlCQUFrQixTQUFRLHNCQUFVO2lCQUN6QyxPQUFFLEdBQVcsc0NBQXNDLEFBQWpELENBQWtEO1FBSzNELFlBQTZCLGVBQWdDO1lBQzVELEtBQUssRUFBRSxDQUFDO1lBRG9CLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUhyRCxrQkFBYSxHQUF3QixJQUFJLENBQUM7WUFDakMsZ0JBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFLcEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTVFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3pELElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBRXpCLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxFQUFFO29CQUNyQyxPQUFPO2lCQUNQO2dCQUVELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ2xFLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFD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