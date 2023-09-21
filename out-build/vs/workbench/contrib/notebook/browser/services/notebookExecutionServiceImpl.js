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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/notebook/browser/services/notebookExecutionServiceImpl", "vs/platform/commands/common/commands", "vs/platform/log/common/log", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/contrib/notebook/browser/viewParts/notebookKernelQuickPickStrategy", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookKernelService"], function (require, exports, lifecycle_1, nls, commands_1, log_1, workspaceTrust_1, notebookKernelQuickPickStrategy_1, notebookCommon_1, notebookExecutionStateService_1, notebookKernelService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$iGb = void 0;
    let $iGb = class $iGb {
        constructor(b, d, e, f, g, h) {
            this.b = b;
            this.d = d;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = new Set;
        }
        async executeNotebookCells(notebook, cells, contextKeyService) {
            const cellsArr = Array.from(cells)
                .filter(c => c.cellKind === notebookCommon_1.CellKind.Code);
            if (!cellsArr.length) {
                return;
            }
            this.g.debug(`NotebookExecutionService#executeNotebookCells ${JSON.stringify(cellsArr.map(c => c.handle))}`);
            const message = nls.localize(0, null);
            const trust = await this.f.requestWorkspaceTrust({ message });
            if (!trust) {
                return;
            }
            // create cell executions
            const cellExecutions = [];
            for (const cell of cellsArr) {
                const cellExe = this.h.getCellExecution(cell.uri);
                if (!!cellExe) {
                    continue;
                }
                cellExecutions.push([cell, this.h.createCellExecution(notebook.uri, cell.handle)]);
            }
            const kernel = await notebookKernelQuickPickStrategy_1.$0qb.resolveKernel(notebook, this.d, this.e, this.b);
            if (!kernel) {
                // clear all pending cell executions
                cellExecutions.forEach(cellExe => cellExe[1].complete({}));
                return;
            }
            this.e.addMostRecentKernel(kernel);
            // filter cell executions based on selected kernel
            const validCellExecutions = [];
            for (const [cell, cellExecution] of cellExecutions) {
                if (!kernel.supportedLanguages.includes(cell.language)) {
                    cellExecution.complete({});
                }
                else {
                    validCellExecutions.push(cellExecution);
                }
            }
            // request execution
            if (validCellExecutions.length > 0) {
                await this.j(validCellExecutions);
                this.d.selectKernelForNotebook(kernel, notebook);
                await kernel.executeNotebookCellsRequest(notebook.uri, validCellExecutions.map(c => c.cellHandle));
                // the connecting state can change before the kernel resolves executeNotebookCellsRequest
                const unconfirmed = validCellExecutions.filter(exe => exe.state === notebookCommon_1.NotebookCellExecutionState.Unconfirmed);
                if (unconfirmed.length) {
                    this.g.debug(`NotebookExecutionService#executeNotebookCells completing unconfirmed executions ${JSON.stringify(unconfirmed.map(exe => exe.cellHandle))}`);
                    unconfirmed.forEach(exe => exe.complete({}));
                }
            }
        }
        async cancelNotebookCellHandles(notebook, cells) {
            const cellsArr = Array.from(cells);
            this.g.debug(`NotebookExecutionService#cancelNotebookCellHandles ${JSON.stringify(cellsArr)}`);
            const kernel = this.d.getSelectedOrSuggestedKernel(notebook);
            if (kernel) {
                await kernel.cancelNotebookCellExecution(notebook.uri, cellsArr);
            }
        }
        async cancelNotebookCells(notebook, cells) {
            this.cancelNotebookCellHandles(notebook, Array.from(cells, cell => cell.handle));
        }
        registerExecutionParticipant(participant) {
            this.i.add(participant);
            return (0, lifecycle_1.$ic)(() => this.i.delete(participant));
        }
        async j(executions) {
            for (const participant of this.i) {
                await participant.onWillExecuteCell(executions);
            }
            return;
        }
        dispose() {
            this.a?.dispose(true);
        }
    };
    exports.$iGb = $iGb;
    exports.$iGb = $iGb = __decorate([
        __param(0, commands_1.$Fr),
        __param(1, notebookKernelService_1.$Bbb),
        __param(2, notebookKernelService_1.$Cbb),
        __param(3, workspaceTrust_1.$_z),
        __param(4, log_1.$5i),
        __param(5, notebookExecutionStateService_1.$_H)
    ], $iGb);
});
//# sourceMappingURL=notebookExecutionServiceImpl.js.map