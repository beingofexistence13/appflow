/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/workbench/contrib/notebook/browser/view/cellPart", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, DOM, fastDomNode_1, cellPart_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qpb = void 0;
    class $qpb extends cellPart_1.$Hnb {
        constructor(notebookEditor, titleToolbar, top, left, right, bottom) {
            super();
            this.notebookEditor = notebookEditor;
            this.titleToolbar = titleToolbar;
            this.top = top;
            this.left = left;
            this.right = right;
            this.bottom = bottom;
            this.codeFocusIndicator = new fastDomNode_1.$FP(DOM.$0O(this.left.domNode, DOM.$('.codeOutput-focus-indicator-container', undefined, DOM.$('.codeOutput-focus-indicator.code-focus-indicator'))));
            this.outputFocusIndicator = new fastDomNode_1.$FP(DOM.$0O(this.left.domNode, DOM.$('.codeOutput-focus-indicator-container', undefined, DOM.$('.codeOutput-focus-indicator.output-focus-indicator'))));
            this.B(DOM.$nO(this.codeFocusIndicator.domNode, DOM.$3O.CLICK, () => {
                if (this.c) {
                    this.c.isInputCollapsed = !this.c.isInputCollapsed;
                }
            }));
            this.B(DOM.$nO(this.outputFocusIndicator.domNode, DOM.$3O.CLICK, () => {
                if (this.c) {
                    this.c.isOutputCollapsed = !this.c.isOutputCollapsed;
                }
            }));
            this.B(DOM.$nO(this.left.domNode, DOM.$3O.DBLCLICK, e => {
                if (!this.c || !this.notebookEditor.hasModel()) {
                    return;
                }
                if (e.target !== this.left.domNode) {
                    // Don't allow dblclick on the codeFocusIndicator/outputFocusIndicator
                    return;
                }
                const clickedOnInput = e.offsetY < this.c.layoutInfo.outputContainerOffset;
                if (clickedOnInput) {
                    this.c.isInputCollapsed = !this.c.isInputCollapsed;
                }
                else {
                    this.c.isOutputCollapsed = !this.c.isOutputCollapsed;
                }
            }));
            this.B(this.titleToolbar.onDidUpdateActions(() => {
                this.a();
            }));
        }
        updateInternalLayoutNow(element) {
            if (element.cellKind === notebookCommon_1.CellKind.Markup) {
                const indicatorPostion = this.notebookEditor.notebookOptions.computeIndicatorPosition(element.layoutInfo.totalHeight, element.layoutInfo.foldHintHeight, this.notebookEditor.textModel?.viewType);
                this.bottom.domNode.style.transform = `translateY(${indicatorPostion.bottomIndicatorTop}px)`;
                this.left.setHeight(indicatorPostion.verticalIndicatorHeight);
                this.right.setHeight(indicatorPostion.verticalIndicatorHeight);
                this.codeFocusIndicator.setHeight(indicatorPostion.verticalIndicatorHeight - this.b() * 2);
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
            this.a();
        }
        a() {
            this.left.domNode.style.transform = `translateY(${this.b()}px)`;
            this.right.domNode.style.transform = `translateY(${this.b()}px)`;
        }
        b() {
            const layoutInfo = this.notebookEditor.notebookOptions.getLayoutConfiguration();
            if (this.titleToolbar.hasActions) {
                return layoutInfo.editorToolbarHeight + layoutInfo.cellTopMargin;
            }
            else {
                return layoutInfo.cellTopMargin;
            }
        }
    }
    exports.$qpb = $qpb;
});
//# sourceMappingURL=cellFocusIndicator.js.map