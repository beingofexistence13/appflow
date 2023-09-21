/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/tree/abstractTree", "vs/base/browser/ui/tree/indexTreeModel", "vs/base/common/iterator", "vs/css!./media/tree"], function (require, exports, abstractTree_1, indexTreeModel_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IndexTree = void 0;
    class IndexTree extends abstractTree_1.AbstractTree {
        constructor(user, container, delegate, renderers, rootElement, options = {}) {
            super(user, container, delegate, renderers, options);
            this.rootElement = rootElement;
        }
        splice(location, deleteCount, toInsert = iterator_1.Iterable.empty()) {
            this.model.splice(location, deleteCount, toInsert);
        }
        rerender(location) {
            if (location === undefined) {
                this.view.rerender();
                return;
            }
            this.model.rerender(location);
        }
        updateElementHeight(location, height) {
            this.model.updateElementHeight(location, height);
        }
        createModel(user, view, options) {
            return new indexTreeModel_1.IndexTreeModel(user, view, this.rootElement, options);
        }
    }
    exports.IndexTree = IndexTree;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXhUcmVlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL3RyZWUvaW5kZXhUcmVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRyxNQUFhLFNBQWlDLFNBQVEsMkJBQXNDO1FBSTNGLFlBQ0MsSUFBWSxFQUNaLFNBQXNCLEVBQ3RCLFFBQWlDLEVBQ2pDLFNBQStDLEVBQ3ZDLFdBQWMsRUFDdEIsVUFBNkMsRUFBRTtZQUUvQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBSDdDLGdCQUFXLEdBQVgsV0FBVyxDQUFHO1FBSXZCLENBQUM7UUFFRCxNQUFNLENBQUMsUUFBa0IsRUFBRSxXQUFtQixFQUFFLFdBQXNDLG1CQUFRLENBQUMsS0FBSyxFQUFFO1lBQ3JHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUVELFFBQVEsQ0FBQyxRQUFtQjtZQUMzQixJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3JCLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFRCxtQkFBbUIsQ0FBQyxRQUFrQixFQUFFLE1BQWM7WUFDckQsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUVTLFdBQVcsQ0FBQyxJQUFZLEVBQUUsSUFBc0MsRUFBRSxPQUEwQztZQUNySCxPQUFPLElBQUksK0JBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbEUsQ0FBQztLQUNEO0lBbkNELDhCQW1DQyJ9