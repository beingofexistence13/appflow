/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, DOM, fastDomNode_1, cellPart_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellFocusIndicator = void 0;
    class CellFocusIndicator extends cellPart_1.CellContentPart {
        constructor(notebookEditor, titleToolbar, top, left, right, bottom) {
            super();
            this.notebookEditor = notebookEditor;
            this.titleToolbar = titleToolbar;
            this.top = top;
            this.left = left;
            this.right = right;
            this.bottom = bottom;
            this.codeFocusIndicator = new fastDomNode_1.FastDomNode(DOM.append(this.left.domNode, DOM.$('.codeOutput-focus-indicator-container', undefined, DOM.$('.codeOutput-focus-indicator.code-focus-indicator'))));
            this.outputFocusIndicator = new fastDomNode_1.FastDomNode(DOM.append(this.left.domNode, DOM.$('.codeOutput-focus-indicator-container', undefined, DOM.$('.codeOutput-focus-indicator.output-focus-indicator'))));
            this._register(DOM.addDisposableListener(this.codeFocusIndicator.domNode, DOM.EventType.CLICK, () => {
                if (this.currentCell) {
                    this.currentCell.isInputCollapsed = !this.currentCell.isInputCollapsed;
                }
            }));
            this._register(DOM.addDisposableListener(this.outputFocusIndicator.domNode, DOM.EventType.CLICK, () => {
                if (this.currentCell) {
                    this.currentCell.isOutputCollapsed = !this.currentCell.isOutputCollapsed;
                }
            }));
            this._register(DOM.addDisposableListener(this.left.domNode, DOM.EventType.DBLCLICK, e => {
                if (!this.currentCell || !this.notebookEditor.hasModel()) {
                    return;
                }
                if (e.target !== this.left.domNode) {
                    // Don't allow dblclick on the codeFocusIndicator/outputFocusIndicator
                    return;
                }
                const clickedOnInput = e.offsetY < this.currentCell.layoutInfo.outputContainerOffset;
                if (clickedOnInput) {
                    this.currentCell.isInputCollapsed = !this.currentCell.isInputCollapsed;
                }
                else {
                    this.currentCell.isOutputCollapsed = !this.currentCell.isOutputCollapsed;
                }
            }));
            this._register(this.titleToolbar.onDidUpdateActions(() => {
                this.updateFocusIndicatorsForTitleMenu();
            }));
        }
        updateInternalLayoutNow(element) {
            if (element.cellKind === notebookCommon_1.CellKind.Markup) {
                const indicatorPostion = this.notebookEditor.notebookOptions.computeIndicatorPosition(element.layoutInfo.totalHeight, element.layoutInfo.foldHintHeight, this.notebookEditor.textModel?.viewType);
                this.bottom.domNode.style.transform = `translateY(${indicatorPostion.bottomIndicatorTop}px)`;
                this.left.setHeight(indicatorPostion.verticalIndicatorHeight);
                this.right.setHeight(indicatorPostion.verticalIndicatorHeight);
                this.codeFocusIndicator.setHeight(indicatorPostion.verticalIndicatorHeight - this.getIndicatorTopMargin() * 2);
            }
            else {
                const cell = element;
                const layoutInfo = this.notebookEditor.notebookOptions.getLayoutConfiguration();
                const bottomToolbarDimensions = this.notebookEditor.notebookOptions.computeBottomToolbarDimensions(this.notebookEditor.textModel?.viewType);
                const indicatorHeight = cell.layoutInfo.codeIndicatorHeight + cell.layoutInfo.outputIndicatorHeight + cell.layoutInfo.commentHeight;
                this.left.setHeight(indicatorHeight);
                this.right.setHeight(indicatorHeight);
                this.codeFocusIndicator.setHeight(cell.layoutInfo.codeIndicatorHeight);
                this.outputFocusIndicator.setHeight(Math.max(cell.layoutInfo.outputIndicatorHeight - cell.viewContext.notebookOptions.getLayoutConfiguration().focusIndicatorGap, 0));
                this.bottom.domNode.style.transform = `translateY(${cell.layoutInfo.totalHeight - bottomToolbarDimensions.bottomToolbarGap - layoutInfo.cellBottomMargin}px)`;
            }
            this.updateFocusIndicatorsForTitleMenu();
        }
        updateFocusIndicatorsForTitleMenu() {
            this.left.domNode.style.transform = `translateY(${this.getIndicatorTopMargin()}px)`;
            this.right.domNode.style.transform = `translateY(${this.getIndicatorTopMargin()}px)`;
        }
        getIndicatorTopMargin() {
            const layoutInfo = this.notebookEditor.notebookOptions.getLayoutConfiguration();
            if (this.titleToolbar.hasActions) {
                return layoutInfo.editorToolbarHeight + layoutInfo.cellTopMargin;
            }
            else {
                return layoutInfo.cellTopMargin;
            }
        }
    }
    exports.CellFocusIndicator = CellFocusIndicator;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbEZvY3VzSW5kaWNhdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3L2NlbGxQYXJ0cy9jZWxsRm9jdXNJbmRpY2F0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLE1BQWEsa0JBQW1CLFNBQVEsMEJBQWU7UUFJdEQsWUFDVSxjQUF1QyxFQUN2QyxZQUFrQyxFQUNsQyxHQUE2QixFQUM3QixJQUE4QixFQUM5QixLQUErQixFQUMvQixNQUFnQztZQUV6QyxLQUFLLEVBQUUsQ0FBQztZQVBDLG1CQUFjLEdBQWQsY0FBYyxDQUF5QjtZQUN2QyxpQkFBWSxHQUFaLFlBQVksQ0FBc0I7WUFDbEMsUUFBRyxHQUFILEdBQUcsQ0FBMEI7WUFDN0IsU0FBSSxHQUFKLElBQUksQ0FBMEI7WUFDOUIsVUFBSyxHQUFMLEtBQUssQ0FBMEI7WUFDL0IsV0FBTSxHQUFOLE1BQU0sQ0FBMEI7WUFJekMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUkseUJBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUNuRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFDakIsR0FBRyxDQUFDLENBQUMsQ0FDSix1Q0FBdUMsRUFDdkMsU0FBUyxFQUNULEdBQUcsQ0FBQyxDQUFDLENBQUMsa0RBQWtELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUvRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSx5QkFBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQ3JELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUNqQixHQUFHLENBQUMsQ0FBQyxDQUNKLHVDQUF1QyxFQUN2QyxTQUFTLEVBQ1QsR0FBRyxDQUFDLENBQUMsQ0FBQyxvREFBb0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWpFLElB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