/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/dom", "vs/platform/actions/browser/menuEntryActionViewItem"], function (require, exports, iconLabels_1, DOM, menuEntryActionViewItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mpb = exports.$lpb = void 0;
    class $lpb extends menuEntryActionViewItem_1.$C3 {
        w() {
            if (this.m.label && this.H) {
                DOM.$_O(this.H, ...(0, iconLabels_1.$xQ)(this.bb.label ?? ''));
            }
        }
    }
    exports.$lpb = $lpb;
    class $mpb extends menuEntryActionViewItem_1.$C3 {
        render(container) {
            super.render(container);
            container.classList.add('notebook-action-view-item');
            this.b = document.createElement('a');
            container.appendChild(this.b);
            this.w();
        }
        w() {
            if (this.b) {
                this.b.classList.add('notebook-label');
                this.b.innerText = this._action.label;
                this.b.title = this._action.tooltip.length ? this._action.tooltip : this._action.label;
            }
        }
    }
    exports.$mpb = $mpb;
});
//# sourceMappingURL=cellActionView.js.map