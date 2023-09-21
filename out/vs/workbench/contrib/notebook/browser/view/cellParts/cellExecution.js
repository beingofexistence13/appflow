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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/common/notebookExecutionStateService"], function (require, exports, DOM, async_1, lifecycle_1, cellPart_1, notebookExecutionStateService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellExecutionPart = void 0;
    const UPDATE_EXECUTION_ORDER_GRACE_PERIOD = 200;
    let CellExecutionPart = class CellExecutionPart extends cellPart_1.CellContentPart {
        constructor(_notebookEditor, _executionOrderLabel, _notebookExecutionStateService) {
            super();
            this._notebookEditor = _notebookEditor;
            this._executionOrderLabel = _executionOrderLabel;
            this._notebookExecutionStateService = _notebookExecutionStateService;
            this.kernelDisposables = this._register(new lifecycle_1.DisposableStore());
            this._register(this._notebookEditor.onDidChangeActiveKernel(() => {
                if (this.currentCell) {
                    this.kernelDisposables.clear();
                    if (this._notebookEditor.activeKernel) {
                        this.kernelDisposables.add(this._notebookEditor.activeKernel.onDidChange(() => {
                            if (this.currentCell) {
                                this.updateExecutionOrder(this.currentCell.internalMetadata);
                            }
                        }));
                    }
                    this.updateExecutionOrder(this.currentCell.internalMetadata);
                }
            }));
        }
        didRenderCell(element) {
            this.updateExecutionOrder(element.internalMetadata, true);
        }
        updateExecutionOrder(internalMetadata, forceClear = false) {
            if (this._notebookEditor.activeKernel?.implementsExecutionOrder || (!this._notebookEditor.activeKernel && typeof internalMetadata.executionOrder === 'number')) {
                // If the executionOrder was just cleared, and the cell is executing, wait just a bit before clearing the view to avoid flashing
                if (typeof internalMetadata.executionOrder !== 'number' && !forceClear && !!this._notebookExecutionStateService.getCellExecution(this.currentCell.uri)) {
                    const renderingCell = this.currentCell;
                    this.cellDisposables.add((0, async_1.disposableTimeout)(() => {
                        if (this.currentCell === renderingCell) {
                            this.updateExecutionOrder(this.currentCell.internalMetadata, true);
                        }
                    }, UPDATE_EXECUTION_ORDER_GRACE_PERIOD));
                    return;
                }
                const executionOrderLabel = typeof internalMetadata.executionOrder === 'number' ?
                    `[${internalMetadata.executionOrder}]` :
                    '[ ]';
                this._executionOrderLabel.innerText = executionOrderLabel;
            }
            else {
                this._executionOrderLabel.innerText = '';
            }
        }
        updateState(element, e) {
            if (e.internalMetadataChanged) {
                this.updateExecutionOrder(element.internalMetadata);
            }
        }
        updateInternalLayoutNow(element) {
            if (element.isInputCollapsed) {
                DOM.hide(this._executionOrderLabel);
            }
            else {
                DOM.show(this._executionOrderLabel);
                const top = element.layoutInfo.editorHeight - 22 + element.layoutInfo.statusBarHeight;
                this._executionOrderLabel.style.top = `${top}px`;
            }
        }
    };
    exports.CellExecutionPart = CellExecutionPart;
    exports.CellExecutionPart = CellExecutionPart = __decorate([
        __param(2, notebookExecutionStateService_1.INotebookExecutionStateService)
    ], CellExecutionPart);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbEV4ZWN1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlldy9jZWxsUGFydHMvY2VsbEV4ZWN1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFXaEcsTUFBTSxtQ0FBbUMsR0FBRyxHQUFHLENBQUM7SUFFekMsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBa0IsU0FBUSwwQkFBZTtRQUdyRCxZQUNrQixlQUF3QyxFQUN4QyxvQkFBaUMsRUFDbEIsOEJBQStFO1lBRS9HLEtBQUssRUFBRSxDQUFDO1lBSlMsb0JBQWUsR0FBZixlQUFlLENBQXlCO1lBQ3hDLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBYTtZQUNELG1DQUE4QixHQUE5Qiw4QkFBOEIsQ0FBZ0M7WUFMeEcsc0JBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1lBU2pFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hFLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtvQkFDckIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO29CQUUvQixJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFO3dCQUN0QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUU7NEJBQzdFLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtnQ0FDckIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs2QkFDN0Q7d0JB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