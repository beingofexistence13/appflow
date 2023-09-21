/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/workbench/contrib/notebook/browser/view/cellPart"], function (require, exports, DOM, cellPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Yqb = void 0;
    class $Yqb extends cellPart_1.$Hnb {
        constructor(a, cellInputCollapsedContainer) {
            super();
            this.a = a;
            this.B(DOM.$nO(cellInputCollapsedContainer, DOM.$3O.DBLCLICK, e => {
                if (!this.c || !this.a.hasModel()) {
                    return;
                }
                if (this.c.isInputCollapsed) {
                    this.c.isInputCollapsed = false;
                }
                else {
                    this.c.isOutputCollapsed = false;
                }
            }));
            this.B(DOM.$nO(cellInputCollapsedContainer, DOM.$3O.CLICK, e => {
                if (!this.c || !this.a.hasModel()) {
                    return;
                }
                const element = e.target;
                if (element && element.classList && element.classList.contains('expandInputIcon')) {
                    // clicked on the expand icon
                    this.c.isInputCollapsed = false;
                }
            }));
        }
    }
    exports.$Yqb = $Yqb;
});
//# sourceMappingURL=collapsedCellInput.js.map