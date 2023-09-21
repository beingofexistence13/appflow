/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/codicons", "vs/base/common/themables", "vs/nls!vs/workbench/contrib/notebook/browser/view/cellParts/foldedCellHint", "vs/workbench/contrib/notebook/browser/controller/foldingController", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/cellPart"], function (require, exports, DOM, codicons_1, themables_1, nls_1, foldingController_1, notebookBrowser_1, cellPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5qb = void 0;
    class $5qb extends cellPart_1.$Hnb {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
        }
        didRenderCell(element) {
            this.g(element);
        }
        g(element) {
            if (!this.a.hasModel()) {
                return;
            }
            if (element.isInputCollapsed || element.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                DOM.$eP(this.b);
            }
            else if (element.foldingState === 2 /* CellFoldingState.Collapsed */) {
                const idx = this.a.getViewModel().getCellIndex(element);
                const length = this.a.getViewModel().getFoldedLength(idx);
                DOM.$_O(this.b, this.h(length), this.j(element));
                DOM.$dP(this.b);
                const foldHintTop = element.layoutInfo.previewHeight;
                this.b.style.top = `${foldHintTop}px`;
            }
            else {
                DOM.$eP(this.b);
            }
        }
        h(num) {
            const label = num === 1 ?
                (0, nls_1.localize)(0, null) :
                (0, nls_1.localize)(1, null, num);
            return DOM.$('span.notebook-folded-hint-label', undefined, label);
        }
        j(element) {
            const expandIcon = DOM.$('span.cell-expand-part-button');
            expandIcon.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.more));
            this.B(DOM.$nO(expandIcon, DOM.$3O.CLICK, () => {
                const controller = this.a.getContribution(foldingController_1.$4qb.id);
                const idx = this.a.getCellIndex(element);
                if (typeof idx === 'number') {
                    controller.setFoldingStateDown(idx, 1 /* CellFoldingState.Expanded */, 1);
                }
            }));
            return expandIcon;
        }
        updateInternalLayoutNow(element) {
            this.g(element);
        }
    }
    exports.$5qb = $5qb;
});
//# sourceMappingURL=foldedCellHint.js.map