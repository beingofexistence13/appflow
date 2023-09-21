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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/codicons", "vs/base/common/themables", "vs/nls!vs/workbench/contrib/notebook/browser/view/cellParts/collapsedCellOutput", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/cellPart"], function (require, exports, DOM, codicons_1, themables_1, nls_1, keybinding_1, notebookBrowser_1, cellPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Zqb = void 0;
    const $ = DOM.$;
    let $Zqb = class $Zqb extends cellPart_1.$Hnb {
        constructor(a, cellOutputCollapseContainer, keybindingService) {
            super();
            this.a = a;
            const placeholder = DOM.$0O(cellOutputCollapseContainer, $('span.expandOutputPlaceholder'));
            placeholder.textContent = (0, nls_1.localize)(0, null);
            const expandIcon = DOM.$0O(cellOutputCollapseContainer, $('span.expandOutputIcon'));
            expandIcon.classList.add(...themables_1.ThemeIcon.asClassNameArray(codicons_1.$Pj.more));
            const keybinding = keybindingService.lookupKeybinding(notebookBrowser_1.$Ubb);
            if (keybinding) {
                placeholder.title = (0, nls_1.localize)(1, null, keybinding.getLabel());
                cellOutputCollapseContainer.title = (0, nls_1.localize)(2, null, keybinding.getLabel());
            }
            DOM.$eP(cellOutputCollapseContainer);
            this.B(DOM.$nO(expandIcon, DOM.$3O.CLICK, () => this.b()));
            this.B(DOM.$nO(cellOutputCollapseContainer, DOM.$3O.DBLCLICK, () => this.b()));
        }
        b() {
            if (!this.c) {
                return;
            }
            if (!this.c) {
                return;
            }
            const textModel = this.a.textModel;
            const index = textModel.cells.indexOf(this.c.model);
            if (index < 0) {
                return;
            }
            this.c.isOutputCollapsed = !this.c.isOutputCollapsed;
        }
    };
    exports.$Zqb = $Zqb;
    exports.$Zqb = $Zqb = __decorate([
        __param(2, keybinding_1.$2D)
    ], $Zqb);
});
//# sourceMappingURL=collapsedCellOutput.js.map