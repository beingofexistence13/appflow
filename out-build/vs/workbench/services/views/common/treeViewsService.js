/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3ub = void 0;
    class $3ub {
        constructor() {
            this.a = new Map();
        }
        getRenderedTreeElement(node) {
            if (this.a.has(node)) {
                return this.a.get(node);
            }
            return undefined;
        }
        addRenderedTreeItemElement(node, element) {
            this.a.set(node, element);
        }
        removeRenderedTreeItemElement(node) {
            if (this.a.has(node)) {
                this.a.delete(node);
            }
        }
    }
    exports.$3ub = $3ub;
});
//# sourceMappingURL=treeViewsService.js.map