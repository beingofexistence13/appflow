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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/log/common/log", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/contrib/notebook/browser/viewParts/notebookKernelQuickPickStrategy", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookKernelService"], function (require, exports, lifecycle_1, nls, commands_1, log_1, workspaceTrust_1, notebookKernelQuickPickStrategy_1, notebookCommon_1, notebookExecutionStateService_1, notebookKernelService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookExecutionService = void 0;
    let NotebookExecutionService = class NotebookExecutionService {
        constructor(_commandService, _notebookKernelService, _notebookKernelHistoryService, _workspaceTrustRequestService, _logService, _notebookExecutionStateService) {
            this._commandService = _commandService;
            this._notebookKernelService = _notebookKernelService;
            this._notebookKernelHistoryService = _notebookKernelHistoryService;
            this._workspaceTrustRequestService = _workspaceTrustRequestService;
            this._logService = _logService;
            this._notebookExecutionStateService = _notebookExecutionStateService;
            this.cellExecutionParticipants = new Set;
        }
        async executeNotebookCells(notebook, cells, contextKeyService) {
            const cellsArr = Array.from(cells)
                .filter(c => c.cellKind === notebookCommon_1.CellKind.Code);
            if (!cellsArr.length) {
                return;
            }
            this._logService.debug(`NotebookExecutionService#executeNotebookCells ${JSON.stringify(cellsArr.map(c => c.handle))}`);
            const message = nls.localize('notebookRunTrust', "Executing a notebook cell will run code from this workspace.");
            const trust = await this._workspaceTrustRequestService.requestWorkspaceTrust({ message });
            if (!trust) {
                return;
            }
            // create cell executions
            const cellExecutions = [];
            for (const cell of cellsArr) {
                const cellExe = this._notebookExecutionStateService.getCellExecution(cell.uri);
                if (!!cellExe) {
                    continue;
                }
                cellExecutions.push([cell, this._notebookExecutionStateService.createCellExecution(notebook.uri, cell.handle)]);
            }
            const kernel = await notebookKernelQuickPickStrategy_1.KernelPickerMRUStrategy.resolveKernel(notebook, this._notebookKernelService, this._notebookKernelHistoryService, this._commandService);
            if (!kernel) {
                // clear all pending cell executions
                cellExecutions.forEach(cellExe => cellExe[1].complete({}));
                return;
            }
            this._notebookKernelHistoryService.addMostRecentKernel(kernel);
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
                await this.runExecutionParticipants(validCellExecutions);
                this._notebookKernelService.selectKernelForNotebook(kernel, notebook);
                await kernel.executeNotebookCellsRequest(notebook.uri, validCellExecutions.map(c => c.cellHandle));
                // the connecting state can change before the kernel resolves executeNotebookCellsRequest
                const unconfirmed = validCellExecutions.filter(exe => exe.state === notebookCommon_1.NotebookCellExecutionState.Unconfirmed);
                if (unconfirmed.length) {
                    this._logService.debug(`NotebookExecutionService#executeNotebookCells completing unconfirmed executions ${JSON.stringify(unconfirmed.map(exe => exe.cellHandle))}`);
                    unconfirmed.forEach(exe => exe.complete({}));
                }
            }
        }
        async cancelNotebookCellHandles(notebook, cells) {
            const cellsArr = Array.from(cells);
            this._logService.debug(`NotebookExecutionService#cancelNotebookCellHandles ${JSON.stringify(cellsArr)}`);
            const kernel = this._notebookKernelService.getSelectedOrSuggestedKernel(notebook);
            if (kernel) {
                await kernel.cancelNotebookCellExecution(notebook.uri, cellsArr);
            }
        }
        async cancelNotebookCells(notebook, cells) {
            this.cancelNotebookCellHandles(notebook, Array.from(cells, cell => cell.handle));
        }
        registerExecutionParticipant(participant) {
            this.cellExecutionParticipants.add(participant);
            return (0, lifecycle_1.toDisposable)(() => this.cellExecutionParticipants.delete(participant));
        }
        async runExecutionParticipants(executions) {
            for (const participant of this.cellExecutionParticipants) {
                await participant.onWillExecuteCell(executions);
            }
            return;
        }
        dispose() {
            this._activeProxyKernelExecutionToken?.dispose(true);
        }
    };
    exports.NotebookExecutionService = NotebookExecutionService;
    exports.NotebookExecutionService = NotebookExecutionService = __decorate([
        __param(0, commands_1.ICommandService),
        __param(1, notebookKernelService_1.INotebookKernelService),
        __param(2, notebookKernelService_1.INotebookKernelHistoryService),
        __param(3, workspaceTrust_1.IWorkspaceTrustRequestService),
        __param(4, log_1.ILogService),
        __param(5, notebookExecutionStateService_1.INotebookExecutionStateService)
    ], NotebookExecutionService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFeGVjdXRpb25TZXJ2aWNlSW1wbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvc2VydmljZXMvbm90ZWJvb2tFeGVjdXRpb25TZXJ2aWNlSW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFpQnpGLElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXdCO1FBSXBDLFlBQ2tCLGVBQWlELEVBQzFDLHNCQUErRCxFQUN4RCw2QkFBNkUsRUFDN0UsNkJBQTZFLEVBQy9GLFdBQXlDLEVBQ3RCLDhCQUErRTtZQUw3RSxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDekIsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtZQUN2QyxrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQStCO1lBQzVELGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBK0I7WUFDOUUsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDTCxtQ0FBOEIsR0FBOUIsOEJBQThCLENBQWdDO1lBNkUvRiw4QkFBeUIsR0FBRyxJQUFJLEdBQThCLENBQUM7UUEzRWhGLENBQUM7UUFFRCxLQUFLLENBQUMsb0JBQW9CLENBQUMsUUFBNEIsRUFBRSxLQUFzQyxFQUFFLGlCQUFxQztZQUNySSxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztpQkFDaEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsS0FBSyx5QkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO2dCQUNyQixPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxpREFBaUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFR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