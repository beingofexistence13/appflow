/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/numbers"], function (require, exports, numbers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$npb = void 0;
    function $npb(notebookEditor, cell, element, opts) {
        const extraOffset = opts?.extraOffset ?? 0;
        const min = opts?.min ?? 0;
        const updateForScroll = () => {
            if (cell.isInputCollapsed) {
                element.style.top = '';
            }
            else {
                const stickyHeight = notebookEditor.getLayoutInfo().stickyHeight;
                const scrollTop = notebookEditor.scrollTop;
                const elementTop = notebookEditor.getAbsoluteTopOfElement(cell);
                const diff = scrollTop - elementTop + extraOffset + stickyHeight;
                const maxTop = cell.layoutInfo.editorHeight + cell.layoutInfo.statusBarHeight - 45; // subtract roughly the height of the execution order label plus padding
                const top = maxTop > 20 ? // Don't move the run button if it can only move a very short distance
                    (0, numbers_1.$Hl)(min, diff, maxTop) :
                    min;
                element.style.top = `${top}px`;
            }
        };
        updateForScroll();
        return notebookEditor.onDidScroll(() => updateForScroll());
    }
    exports.$npb = $npb;
});
//# sourceMappingURL=cellToolbarStickyScroll.js.map