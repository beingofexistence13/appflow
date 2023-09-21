/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/tree/abstractTree", "vs/base/browser/ui/tree/indexTreeModel", "vs/base/common/iterator", "vs/css!./media/tree"], function (require, exports, abstractTree_1, indexTreeModel_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rS = void 0;
    class $rS extends abstractTree_1.$fS {
        constructor(user, container, delegate, renderers, b, options = {}) {
            super(user, container, delegate, renderers, options);
            this.b = b;
        }
        splice(location, deleteCount, toInsert = iterator_1.Iterable.empty()) {
            this.o.splice(location, deleteCount, toInsert);
        }
        rerender(location) {
            if (location === undefined) {
                this.j.rerender();
                return;
            }
            this.o.rerender(location);
        }
        updateElementHeight(location, height) {
            this.o.updateElementHeight(location, height);
        }
        I(user, view, options) {
            return new indexTreeModel_1.$aS(user, view, this.b, options);
        }
    }
    exports.$rS = $rS;
});
//# sourceMappingURL=indexTree.js.map