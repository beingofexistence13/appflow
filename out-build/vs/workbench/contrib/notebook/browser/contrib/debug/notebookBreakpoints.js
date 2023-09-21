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
    let NotebookBreakpoints = class NotebookBreakpoints extends lifecycle_1.$kc {
        constructor(a, _notebookService, b) {
            super();
            this.a = a;
            this.b = b;
            const listeners = new map_1.$zi();
            this.B(_notebookService.onWillAddNotebookDocument(model => {
                listeners.set(model.uri, model.onWillAddRemoveCells(e => {
                    // When deleting a cell, remove its breakpoints
                    const debugModel = this.a.getModel();
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
                                cellBps.forEach(cellBp => this.a.removeBreakpoints(cellBp.getId()));
                            }
                        }
                    }
                }));
            }));
            this.B(_notebookService.onWillRemoveNotebookDocument(model => {
                this.c(model);
                listeners.get(model.uri)?.dispose();
                listeners.delete(model.uri);
            }));
            this.B(this.a.getModel().onDidChangeBreakpoints(e => {
                const newCellBp = e?.added?.find(bp => 'uri' in bp && bp.uri.scheme === network_1.Schemas.vscodeNotebookCell);
                if (newCellBp) {
                    const parsed = notebookCommon_1.CellUri.parse(newCellBp.uri);
                    if (!parsed) {
                        return;
                    }
                    const editor = (0, notebookBrowser_1.$Zbb)(this.b.activeEditorPane);
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
        c(model) {
            const bps = this.a.getModel().getBreakpoints();
            if (!bps.length || !model.cells.length) {
                return;
            }
            const idxMap = new map_1.$zi();
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
                if ((0, resources_1.$bg)(newUri, bp.uri)) {
                    return;
                }
                this.a.removeBreakpoints(bp.getId());
                this.a.addBreakpoints(newUri, [
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
        __param(0, debug_1.$nH),
        __param(1, notebookService_1.$ubb),
        __param(2, editorService_1.$9C)
    ], NotebookBreakpoints);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(NotebookBreakpoints, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=notebookBreakpoints.js.map