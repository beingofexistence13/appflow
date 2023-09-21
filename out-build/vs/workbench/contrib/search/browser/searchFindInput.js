/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/workbench/contrib/notebook/browser/contrib/find/notebookFindReplaceWidget", "vs/nls!vs/workbench/contrib/search/browser/searchFindInput"], function (require, exports, contextScopedHistoryWidget_1, notebookFindReplaceWidget_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$MOb = void 0;
    class $MOb extends contextScopedHistoryWidget_1.$T5 {
        constructor(container, contextViewProvider, options, contextKeyService, contextMenuService, instantiationService, filters, filterStartVisiblitity) {
            super(container, contextViewProvider, options, contextKeyService);
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
            this.filters = filters;
            this.$ = false;
            this.ab = false;
            this.g = this.B(new notebookFindReplaceWidget_1.$kFb(filters, contextMenuService, instantiationService, options, nls.localize(0, null)));
            this.inputBox.paddingRight = (this.M?.width() ?? 0) + (this.L?.width() ?? 0) + (this.J?.width() ?? 0) + this.g.width;
            this.y.appendChild(this.g.container);
            this.g.container.classList.add('monaco-custom-toggle');
            this.filterVisible = filterStartVisiblitity;
        }
        set filterVisible(show) {
            this.g.container.style.display = show ? '' : 'none';
            this.ab = show;
            this.updateStyles();
        }
        setEnabled(enabled) {
            super.setEnabled(enabled);
            if (enabled && (!this.$ || !this.ab)) {
                this.J?.enable();
            }
            else {
                this.J?.disable();
            }
        }
        updateStyles() {
            // filter is checked if it's in a non-default state
            this.$ =
                !this.filters.markupInput ||
                    !this.filters.markupPreview ||
                    !this.filters.codeInput ||
                    !this.filters.codeOutput;
            // TODO: find a way to express that searching notebook output and markdown preview don't support regex.
            this.g.applyStyles(this.$);
        }
    }
    exports.$MOb = $MOb;
});
//# sourceMappingURL=searchFindInput.js.map