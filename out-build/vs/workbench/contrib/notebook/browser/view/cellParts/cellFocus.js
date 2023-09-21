/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/workbench/contrib/notebook/browser/view/cellPart"], function (require, exports, DOM, cellPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$kpb = void 0;
    class $kpb extends cellPart_1.$Hnb {
        constructor(containerElement, focusSinkElement, notebookEditor) {
            super();
            this.B(DOM.$nO(containerElement, DOM.$3O.FOCUS, () => {
                if (this.c) {
                    notebookEditor.focusElement(this.c);
                }
            }, true));
            if (focusSinkElement) {
                this.B(DOM.$nO(focusSinkElement, DOM.$3O.FOCUS, () => {
                    if (this.c && this.c.outputsViewModels.length) {
                        notebookEditor.focusNotebookCell(this.c, 'output');
                    }
                }));
            }
        }
    }
    exports.$kpb = $kpb;
});
//# sourceMappingURL=cellFocus.js.map