/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/viewModel/foldingModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/nls!vs/workbench/contrib/notebook/browser/controller/foldingController"], function (require, exports, lifecycle_1, notebookContextKeys_1, notebookBrowser_1, foldingModel_1, notebookCommon_1, notebookEditorExtensions_1, actions_1, contextkey_1, contextkeys_1, editorService_1, coreActions_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4qb = void 0;
    class $4qb extends lifecycle_1.$kc {
        static { this.id = 'workbench.notebook.foldingController'; }
        constructor(c) {
            super();
            this.c = c;
            this.a = null;
            this.b = this.B(new lifecycle_1.$jc());
            this.B(this.c.onMouseUp(e => { this.onMouseUp(e); }));
            this.B(this.c.onDidChangeModel(() => {
                this.b.clear();
                if (!this.c.hasModel()) {
                    return;
                }
                this.b.add(this.c.onDidChangeCellState(e => {
                    if (e.source.editStateChanged && e.cell.cellKind === notebookCommon_1.CellKind.Markup) {
                        this.a?.recompute();
                        // this._updateEditorFoldingRanges();
                    }
                }));
                this.a = new foldingModel_1.$1qb();
                this.b.add(this.a);
                this.a.attachViewModel(this.c.getViewModel());
                this.b.add(this.a.onDidFoldingRegionChanged(() => {
                    this.f();
                }));
            }));
        }
        saveViewState() {
            return this.a?.getMemento() || [];
        }
        restoreViewState(state) {
            this.a?.applyMemento(state || []);
            this.f();
        }
        setFoldingStateDown(index, state, levels) {
            const doCollapse = state === 2 /* CellFoldingState.Collapsed */;
            const region = this.a.getRegionAtLine(index + 1);
            const regions = [];
            if (region) {
                if (region.isCollapsed !== doCollapse) {
                    regions.push(region);
                }
                if (levels > 1) {
                    const regionsInside = this.a.getRegionsInside(region, (r, level) => r.isCollapsed !== doCollapse && level < levels);
                    regions.push(...regionsInside);
                }
            }
            regions.forEach(r => this.a.setCollapsed(r.regionIndex, state === 2 /* CellFoldingState.Collapsed */));
            this.f();
        }
        setFoldingStateUp(index, state, levels) {
            if (!this.a) {
                return;
            }
            const regions = this.a.getAllRegionsAtLine(index + 1, (region, level) => region.isCollapsed !== (state === 2 /* CellFoldingState.Collapsed */) && level <= levels);
            regions.forEach(r => this.a.setCollapsed(r.regionIndex, state === 2 /* CellFoldingState.Collapsed */));
            this.f();
        }
        f() {
            if (!this.a) {
                return;
            }
            if (!this.c.hasModel()) {
                return;
            }
            const vm = this.c.getViewModel();
            vm.updateFoldingRanges(this.a.regions);
            const hiddenRanges = vm.getHiddenRanges();
            this.c.setHiddenAreas(hiddenRanges);
        }
        onMouseUp(e) {
            if (!e.event.target) {
                return;
            }
            if (!this.c.hasModel()) {
                return;
            }
            const viewModel = this.c.getViewModel();
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
                this.c.focusElement(cellViewModel);
            }
            return;
        }
    }
    exports.$4qb = $4qb;
    (0, notebookEditorExtensions_1.$Fnb)($4qb.id, $4qb);
    const NOTEBOOK_FOLD_COMMAND_LABEL = (0, nls_1.localize)(0, null);
    const NOTEBOOK_UNFOLD_COMMAND_LABEL = (0, nls_1.localize)(1, null);
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
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.fold',
                title: { value: (0, nls_1.localize)(2, null), original: 'Fold Cell' },
                category: coreActions_1.$7ob,
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkey_1.$Ii.not(contextkeys_1.$83)),
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
                precondition: notebookContextKeys_1.$Wnb,
                f1: true
            });
        }
        async run(accessor, args) {
            const editorService = accessor.get(editorService_1.$9C);
            const editor = (0, notebookBrowser_1.$Zbb)(editorService.activeEditorPane);
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
            const controller = editor.getContribution($4qb.id);
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
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'notebook.unfold',
                title: { value: NOTEBOOK_UNFOLD_COMMAND_LABEL, original: 'Unfold Cell' },
                category: coreActions_1.$7ob,
                keybinding: {
                    when: contextkey_1.$Ii.and(notebookContextKeys_1.$Ynb, contextkey_1.$Ii.not(contextkeys_1.$83)),
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
                precondition: notebookContextKeys_1.$Wnb,
                f1: true
            });
        }
        async run(accessor, args) {
            const editorService = accessor.get(editorService_1.$9C);
            const editor = (0, notebookBrowser_1.$Zbb)(editorService.activeEditorPane);
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
            const controller = editor.getContribution($4qb.id);
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
//# sourceMappingURL=foldingController.js.map