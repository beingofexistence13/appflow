/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/codicons", "vs/base/common/themables", "vs/nls", "vs/workbench/contrib/notebook/browser/controller/foldingController", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/cellPart"], function (require, exports, DOM, codicons_1, themables_1, nls_1, foldingController_1, notebookBrowser_1, cellPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FoldedCellHint = void 0;
    class FoldedCellHint extends cellPart_1.CellContentPart {
        constructor(_notebookEditor, _container) {
            super();
            this._notebookEditor = _notebookEditor;
            this._container = _container;
        }
        didRenderCell(element) {
            this.update(element);
        }
        update(element) {
            if (!this._notebookEditor.hasModel()) {
                return;
            }
            if (element.isInputCollapsed || element.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                DOM.hide(this._container);
            }
            else if (element.foldingState === 2 /* CellFoldingState.Collapsed */) {
                const idx = this._notebookEditor.getViewModel().getCellIndex(element);
                const length = this._notebookEditor.getViewModel().getFoldedLength(idx);
                DOM.reset(this._container, this.getHiddenCellsLabel(length), this.getHiddenCellHintButton(element));
                DOM.show(this._container);
                const foldHintTop = element.layoutInfo.previewHeight;
                this._container.style.top = `${foldHintTop}px`;
            }
            else {
                DOM.hide(this._container);
            }
        }
        getHiddenCellsLabel(num) {
            const label = num === 1 ?
                (0, nls_1.localize)('hiddenCellsLabel', "1 cell hidden") :
                (0, nls_1.localize)('hiddenCellsLabelPlural', "{0} cells hidden", num);
            return DOM.$('span.notebook-folded-hint-label', undefined, label);
        }
        getHiddenCellHintButton(element) {
            const expandIcon = DOM.$('span.cell-expand-part-button');
            expandIcon.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.more));
            this._register(DOM.addDisposableListener(expandIcon, DOM.EventType.CLICK, () => {
                const controller = this._notebookEditor.getContribution(foldingController_1.FoldingController.id);
                const idx = this._notebookEditor.getCellIndex(element);
                if (typeof idx === 'number') {
                    controller.setFoldingStateDown(idx, 1 /* CellFoldingState.Expanded */, 1);
                }
            }));
            return expandIcon;
        }
        updateInternalLayoutNow(element) {
            this.update(element);
        }
    }
    exports.FoldedCellHint = FoldedCellHint;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9sZGVkQ2VsbEhpbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXcvY2VsbFBhcnRzL2ZvbGRlZENlbGxIaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRyxNQUFhLGNBQWUsU0FBUSwwQkFBZTtRQUVsRCxZQUNrQixlQUFnQyxFQUNoQyxVQUF1QjtZQUV4QyxLQUFLLEVBQUUsQ0FBQztZQUhTLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUNoQyxlQUFVLEdBQVYsVUFBVSxDQUFhO1FBR3pDLENBQUM7UUFFUSxhQUFhLENBQUMsT0FBNEI7WUFDbEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0QixDQUFDO1FBRU8sTUFBTSxDQUFDLE9BQTRCO1lBQzFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUNyQyxPQUFPO2FBQ1A7WUFFRCxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsSUFBSSxPQUFPLENBQUMsWUFBWSxFQUFFLEtBQUssK0JBQWEsQ0FBQyxPQUFPLEVBQUU7Z0JBQ2pGLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQzFCO2lCQUFNLElBQUksT0FBTyxDQUFDLFlBQVksdUNBQStCLEVBQUU7Z0JBQy9ELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN0RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDeEUsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDcEcsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRTFCLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDO2dCQUNyRCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxXQUFXLElBQUksQ0FBQzthQUMvQztpQkFBTTtnQkFDTixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUMxQjtRQUNGLENBQUM7UUFFTyxtQkFBbUIsQ0FBQyxHQUFXO1lBQ3RDLE1BQU0sS0FBSyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsSUFBQSxjQUFRLEVBQUMsa0JBQWtCLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQztnQkFDL0MsSUFBQSxjQUFRLEVBQUMsd0JBQXdCLEVBQUUsa0JBQWtCLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFN0QsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLGlDQUFpQyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBRU8sdUJBQXVCLENBQUMsT0FBNEI7WUFDM0QsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1lBQ3pELFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcscUJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRTtnQkFDOUUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQW9CLHFDQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNqRyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkQsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7b0JBQzVCLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLHFDQUE2QixDQUFDLENBQUMsQ0FBQztpQkFDbEU7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztRQUVRLHVCQUF1QixDQUFDLE9BQTRCO1lBQzVELElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEIsQ0FBQztLQUNEO0lBMURELHdDQTBEQyJ9