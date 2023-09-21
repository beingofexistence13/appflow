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
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionService", "vs/workbench/contrib/notebook/common/notebookExecutionStateService"], function (require, exports, async_1, lifecycle_1, uri_1, platform_1, contributions_1, debug_1, notebookCommon_1, notebookExecutionService_1, notebookExecutionStateService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let NotebookCellPausing = class NotebookCellPausing extends lifecycle_1.Disposable {
        constructor(_debugService, _notebookExecutionStateService) {
            super();
            this._debugService = _debugService;
            this._notebookExecutionStateService = _notebookExecutionStateService;
            this._pausedCells = new Set();
            this._register(_debugService.getModel().onDidChangeCallStack(() => {
                // First update using the stale callstack if the real callstack is empty, to reduce blinking while stepping.
                // After not pausing for 2s, update again with the latest callstack.
                this.onDidChangeCallStack(true);
                this._scheduler.schedule();
            }));
            this._scheduler = this._register(new async_1.RunOnceScheduler(() => this.onDidChangeCallStack(false), 2000));
        }
        async onDidChangeCallStack(fallBackOnStaleCallstack) {
            const newPausedCells = new Set();
            for (const session of this._debugService.getModel().getSessions()) {
                for (const thread of session.getAllThreads()) {
                    let callStack = thread.getCallStack();
                    if (fallBackOnStaleCallstack && !callStack.length) {
                        callStack = thread.getStaleCallStack();
                    }
                    callStack.forEach(sf => {
                        const parsed = notebookCommon_1.CellUri.parse(sf.source.uri);
                        if (parsed) {
                            newPausedCells.add(sf.source.uri.toString());
                            this.editIsPaused(sf.source.uri, true);
                        }
                    });
                }
            }
            for (const uri of this._pausedCells) {
                if (!newPausedCells.has(uri)) {
                    this.editIsPaused(uri_1.URI.parse(uri), false);
                    this._pausedCells.delete(uri);
                }
            }
            newPausedCells.forEach(cell => this._pausedCells.add(cell));
        }
        editIsPaused(cellUri, isPaused) {
            const parsed = notebookCommon_1.CellUri.parse(cellUri);
            if (parsed) {
                const exeState = this._notebookExecutionStateService.getCellExecution(cellUri);
                if (exeState && (exeState.isPaused !== isPaused || !exeState.didPause)) {
                    exeState.update([{
                            editType: notebookExecutionService_1.CellExecutionUpdateType.ExecutionState,
                            didPause: true,
                            isPaused
                        }]);
                }
            }
        }
    };
    NotebookCellPausing = __decorate([
        __param(0, debug_1.IDebugService),
        __param(1, notebookExecutionStateService_1.INotebookExecutionStateService)
    ], NotebookCellPausing);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(NotebookCellPausing, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tDZWxsUGF1c2luZy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvY29udHJpYi9kZWJ1Zy9ub3RlYm9va0NlbGxQYXVzaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7O0lBY2hHLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsc0JBQVU7UUFLM0MsWUFDZ0IsYUFBNkMsRUFDNUIsOEJBQStFO1lBRS9HLEtBQUssRUFBRSxDQUFDO1lBSHdCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBQ1gsbUNBQThCLEdBQTlCLDhCQUE4QixDQUFnQztZQU4vRixpQkFBWSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7WUFVakQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFO2dCQUNqRSw0R0FBNEc7Z0JBQzVHLG9FQUFvRTtnQkFDcEUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNoQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3QkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN0RyxDQUFDO1FBRU8sS0FBSyxDQUFDLG9CQUFvQixDQUFDLHdCQUFpQztZQUNuRSxNQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1lBRXpDLEtBQUssTUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDbEUsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUU7b0JBQzdDLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztvQkFDdEMsSUFBSSx3QkFBd0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7d0JBQ2xELFNBQVMsR0FBSSxNQUFpQixDQUFDLGlCQUFpQixFQUFFLENBQUM7cUJBQ25EO29CQUVELFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7d0JBQ3RCLE1BQU0sTUFBTSxHQUFHLHdCQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQzVDLElBQUksTUFBTSxFQUFFOzRCQUNYLGNBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzs0QkFDN0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQzt5QkFDdkM7b0JBQ0YsQ0FBQyxDQUFDLENBQUM7aUJBQ0g7YUFDRDtZQUVELEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDcEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQzdCLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDekMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQzlCO2FBQ0Q7WUFFRCxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRU8sWUFBWSxDQUFDLE9BQVksRUFBRSxRQUFpQjtZQUNuRCxNQUFNLE1BQU0sR0FBRyx3QkFBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0QyxJQUFJLE1BQU0sRUFBRTtnQkFDWCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsOEJBQThCLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQy9FLElBQUksUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsS0FBSyxRQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQ3ZFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQzs0QkFDaEIsUUFBUSxFQUFFLGtEQUF1QixDQUFDLGNBQWM7NEJBQ2hELFFBQVEsRUFBRSxJQUFJOzRCQUNkLFFBQVE7eUJBQ1IsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7YUFDRDtRQUNGLENBQUM7S0FDRCxDQUFBO0lBL0RLLG1CQUFtQjtRQU10QixXQUFBLHFCQUFhLENBQUE7UUFDYixXQUFBLDhEQUE4QixDQUFBO09BUDNCLG1CQUFtQixDQStEeEI7SUFFRCxtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQUMsbUJBQW1CLGtDQUEwQixDQUFDIn0=