/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/list/listView"], function (require, exports, listView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Eob = void 0;
    class $Eob extends listView_1.$mQ {
        constructor() {
            super(...arguments);
            this.wb = 0;
        }
        get inRenderingTransaction() {
            return this.wb > 0;
        }
        W(previousRenderRange, renderTop, renderHeight, renderLeft, scrollWidth, updateItemsInDOM) {
            this.wb++;
            super.W(previousRenderRange, renderTop, renderHeight, renderLeft, scrollWidth, updateItemsInDOM);
            this.wb--;
        }
        tb(renderTop, renderHeight, inSmoothScrolling) {
            this.wb++;
            super.tb(renderTop, renderHeight, inSmoothScrolling);
            this.wb--;
        }
    }
    exports.$Eob = $Eob;
});
//# sourceMappingURL=notebookCellListView.js.map