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
define(["require", "exports", "vs/base/common/decorators", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/services/userActivity/common/userActivityService"], function (require, exports, decorators_1, lifecycle_1, notebookEditorExtensions_1, notebookCommon_1, notebookExecutionStateService_1, userActivityService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExecutionEditorProgressController = void 0;
    let ExecutionEditorProgressController = class ExecutionEditorProgressController extends lifecycle_1.Disposable {
        static { this.id = 'workbench.notebook.executionEditorProgress'; }
        constructor(_notebookEditor, _notebookExecutionStateService, _userActivity) {
            super();
            this._notebookEditor = _notebookEditor;
            this._notebookExecutionStateService = _notebookExecutionStateService;
            this._userActivity = _userActivity;
            this._activityMutex = this._register(new lifecycle_1.MutableDisposable());
            this._register(_notebookEditor.onDidScroll(() => this._update()));
            this._register(_notebookExecutionStateService.onDidChangeExecution(e => {
                if (e.notebook.toString() !== this._notebookEditor.textModel?.uri.toString()) {
                    return;
                }
                this._update();
            }));
            this._register(_notebookEditor.onDidChangeModel(() => this._update()));
        }
        _update() {
            if (!this._notebookEditor.hasModel()) {
                return;
            }
            const cellExecutions = this._notebookExecutionStateService.getCellExecutionsForNotebook(this._notebookEditor.textModel?.uri)
                .filter(exe => exe.state === notebookCommon_1.NotebookCellExecutionState.Executing);
            const notebookExecution = this._notebookExecutionStateService.getExecution(this._notebookEditor.textModel?.uri);
            const executionIsVisible = (exe) => {
                for (const range of this._notebookEditor.visibleRanges) {
                    for (const cell of this._notebookEditor.getCellsInRange(range)) {
                        if (cell.handle === exe.cellHandle) {
                            const top = this._notebookEditor.getAbsoluteTopOfElement(cell);
                            if (this._notebookEditor.scrollTop < top + 5) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            };
            const hasAnyExecution = cellExecutions.length || notebookExecution;
            if (hasAnyExecution && !this._activityMutex.value) {
                this._activityMutex.value = this._userActivity.markActive();
            }
            else if (!hasAnyExecution && this._activityMutex.value) {
                this._activityMutex.clear();
            }
            const shouldShowEditorProgressbarForCellExecutions = cellExecutions.length && !cellExecutions.some(executionIsVisible) && !cellExecutions.some(e => e.isPaused);
            const showEditorProgressBar = !!notebookExecution || shouldShowEditorProgressbarForCellExecutions;
            if (showEditorProgressBar) {
                this._notebookEditor.showProgress();
            }
            else {
                this._notebookEditor.hideProgress();
            }
        }
    };
    exports.ExecutionEditorProgressController = ExecutionEditorProgressController;
    __decorate([
        (0, decorators_1.throttle)(100)
    ], ExecutionEditorProgressController.prototype, "_update", null);
    exports.ExecutionEditorProgressController = ExecutionEditorProgressController = __decorate([
        __param(1, notebookExecutionStateService_1.INotebookExecutionStateService),
        __param(2, userActivityService_1.IUserActivityService)
    ], ExecutionEditorProgressController);
    (0, notebookEditorExtensions_1.registerNotebookContribution)(ExecutionEditorProgressController.id, ExecutionEditorProgressController);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlY3V0aW9uRWRpdG9yUHJvZ3Jlc3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL2NvbnRyaWIvZXhlY3V0ZS9leGVjdXRpb25FZGl0b3JQcm9ncmVzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFVekYsSUFBTSxpQ0FBaUMsR0FBdkMsTUFBTSxpQ0FBa0MsU0FBUSxzQkFBVTtpQkFDekQsT0FBRSxHQUFXLDRDQUE0QyxBQUF2RCxDQUF3RDtRQUlqRSxZQUNrQixlQUFnQyxFQUNqQiw4QkFBK0UsRUFDekYsYUFBb0Q7WUFFMUUsS0FBSyxFQUFFLENBQUM7WUFKUyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDQSxtQ0FBOEIsR0FBOUIsOEJBQThCLENBQWdDO1lBQ3hFLGtCQUFhLEdBQWIsYUFBYSxDQUFzQjtZQUwxRCxtQkFBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBRSxDQUFDLENBQUM7WUFTekUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFbEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyw4QkFBOEIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDdEUsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxLQUFLLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRTtvQkFDN0UsT0FBTztpQkFDUDtnQkFFRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxTQUFTLENBQUMs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