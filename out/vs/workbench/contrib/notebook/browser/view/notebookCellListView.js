/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/list/listView"], function (require, exports, listView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookCellListView = void 0;
    class NotebookCellListView extends listView_1.ListView {
        constructor() {
            super(...arguments);
            this._renderingStack = 0;
        }
        get inRenderingTransaction() {
            return this._renderingStack > 0;
        }
        render(previousRenderRange, renderTop, renderHeight, renderLeft, scrollWidth, updateItemsInDOM) {
            this._renderingStack++;
            super.render(previousRenderRange, renderTop, renderHeight, renderLeft, scrollWidth, updateItemsInDOM);
            this._renderingStack--;
        }
        _rerender(renderTop, renderHeight, inSmoothScrolling) {
            this._renderingStack++;
            super._rerender(renderTop, renderHeight, inSmoothScrolling);
            this._renderingStack--;
        }
    }
    exports.NotebookCellListView = NotebookCellListView;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tDZWxsTGlzdFZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXcvbm90ZWJvb2tDZWxsTGlzdFZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLE1BQWEsb0JBQXdCLFNBQVEsbUJBQVc7UUFBeEQ7O1lBQ1Msb0JBQWUsR0FBRyxDQUFDLENBQUM7UUFpQjdCLENBQUM7UUFmQSxJQUFJLHNCQUFzQjtZQUN6QixPQUFPLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFa0IsTUFBTSxDQUFDLG1CQUEyQixFQUFFLFNBQWlCLEVBQUUsWUFBb0IsRUFBRSxVQUE4QixFQUFFLFdBQStCLEVBQUUsZ0JBQTBCO1lBQzFMLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN2QixLQUFLLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3RHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4QixDQUFDO1FBRWtCLFNBQVMsQ0FBQyxTQUFpQixFQUFFLFlBQW9CLEVBQUUsaUJBQXVDO1lBQzVHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN2QixLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUM1RCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEIsQ0FBQztLQUNEO0lBbEJELG9EQWtCQyJ9