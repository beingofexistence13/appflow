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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/network", "vs/base/common/resources", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/editor/common/editorService"], function (require, exports, lifecycle_1, map_1, network_1, resources_1, platform_1, contributions_1, debug_1, notebookBrowser_1, notebookCommon_1, notebookService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let NotebookBreakpoints = class NotebookBreakpoints extends lifecycle_1.Disposable {
        constructor(_debugService, _notebookService, _editorService) {
            super();
            this._debugService = _debugService;
            this._editorService = _editorService;
            const listeners = new map_1.ResourceMap();
            this._register(_notebookService.onWillAddNotebookDocument(model => {
                listeners.set(model.uri, model.onWillAddRemoveCells(e => {
                    // When deleting a cell, remove its breakpoints
                    const debugModel = this._debugService.getModel();
                    if (!debugModel.getBreakpoints().length) {
                        return;
                    }
                    if (e.rawEvent.kind !== notebookCommon_1.NotebookCellsChangeType.ModelChange) {
                        return;
                    }
                    for (const change of e.rawEvent.changes) {
                        const [start, deleteCount] = change;
                        if (deleteCount > 0) {
                            const deleted = model.cells.slice(start, start + deleteCount);
                            for (const deletedCell of deleted) {
                                const cellBps = debugModel.getBreakpoints({ uri: deletedCell.uri });
                                cellBps.forEach(cellBp => this._debugService.removeBreakpoints(cellBp.getId()));
                            }
                        }
                    }
                }));
            }));
            this._register(_notebookService.onWillRemoveNotebookDocument(model => {
                this.updateBreakpoints(model);
                listeners.get(model.uri)?.dispose();
                listeners.delete(model.uri);
            }));
            this._register(this._debugService.getModel().onDidChangeBreakpoints(e => {
                const newCellBp = e?.added?.find(bp => 'uri' in bp && bp.uri.scheme === network_1.Schemas.vscodeNotebookCell);
                if (newCellBp) {
                    const parsed = notebookCommon_1.CellUri.parse(newCellBp.uri);
                    if (!parsed) {
                        return;
                    }
                    const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(this._editorService.activeEditorPane);
                    if (!editor || !editor.hasModel() || editor.textModel.uri.toString() !== parsed.notebook.toString()) {
                        return;
                    }
                    const cell = editor.getCellByHandle(parsed.handle);
                    if (!cell) {
                        return;
                    }
                    editor.focusElement(cell);
                }
            }));
        }
        updateBreakpoints(model) {
            const bps = this._debugService.getModel().getBreakpoints();
            if (!bps.length || !model.cells.length) {
                return;
            }
            const idxMap = new map_1.ResourceMap();
            model.cells.forEach((cell, i) => {
                idxMap.set(cell.uri, i);
            });
            bps.forEach(bp => {
                const idx = idxMap.get(bp.uri);
                if (typeof idx !== 'number') {
                    return;
                }
                const notebook = notebookCommon_1.CellUri.parse(bp.uri)?.notebook;
                if (!notebook) {
                    return;
                }
                const newUri = notebookCommon_1.CellUri.generate(notebook, idx);
                if ((0, resources_1.isEqual)(newUri, bp.uri)) {
                    return;
                }
                this._debugService.removeBreakpoints(bp.getId());
                this._debugService.addBreakpoints(newUri, [
                    {
                        column: bp.column,
                        condition: bp.condition,
                        enabled: bp.enabled,
                        hitCondition: bp.hitCondition,
                        logMessage: bp.logMessage,
                        lineNumber: bp.lineNumber
                    }
                ]);
            });
        }
    };
    NotebookBreakpoints = __decorate([
        __param(0, debug_1.IDebugService),
        __param(1, notebookService_1.INotebookService),
        __param(2, editorService_1.IEditorService)
    ], NotebookBreakpoints);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(NotebookBreakpoints, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tCcmVha3BvaW50cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvY29udHJpYi9kZWJ1Zy9ub3RlYm9va0JyZWFrcG9pbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7O0lBZ0JoRyxJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHNCQUFVO1FBQzNDLFlBQ2lDLGFBQTRCLEVBQzFDLGdCQUFrQyxFQUNuQixjQUE4QjtZQUUvRCxLQUFLLEVBQUUsQ0FBQztZQUp3QixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUUzQixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFJL0QsTUFBTSxTQUFTLEdBQUcsSUFBSSxpQkFBVyxFQUFlLENBQUM7WUFDakQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDakUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDdkQsK0NBQStDO29CQUMvQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNqRCxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxDQUFDLE1BQU0sRUFBRTt3QkFDeEMsT0FBTztxQkFDUDtvQkFFRCxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLHdDQUF1QixDQUFDLFdBQVcsRUFBRTt3QkFDNUQsT0FBTztxQkFDUDtvQkFFRCxLQUFLLE1BQU0sTUFBTSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFO3dCQUN4QyxNQUFNLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FB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