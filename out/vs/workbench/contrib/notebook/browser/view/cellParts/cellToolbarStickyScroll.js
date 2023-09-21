/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/numbers"], function (require, exports, numbers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerCellToolbarStickyScroll = void 0;
    function registerCellToolbarStickyScroll(notebookEditor, cell, element, opts) {
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
                    (0, numbers_1.clamp)(min, diff, maxTop) :
                    min;
                element.style.top = `${top}px`;
            }
        };
        updateForScroll();
        return notebookEditor.onDidScroll(() => updateForScroll());
    }
    exports.registerCellToolbarStickyScroll = registerCellToolbarStickyScroll;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbFRvb2xiYXJTdGlja3lTY3JvbGwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXcvY2VsbFBhcnRzL2NlbGxUb29sYmFyU3RpY2t5U2Nyb2xsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxTQUFnQiwrQkFBK0IsQ0FBQyxjQUErQixFQUFFLElBQW9CLEVBQUUsT0FBb0IsRUFBRSxJQUE2QztRQUN6SyxNQUFNLFdBQVcsR0FBRyxJQUFJLEVBQUUsV0FBVyxJQUFJLENBQUMsQ0FBQztRQUMzQyxNQUFNLEdBQUcsR0FBRyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUUzQixNQUFNLGVBQWUsR0FBRyxHQUFHLEVBQUU7WUFDNUIsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzFCLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQzthQUN2QjtpQkFBTTtnQkFDTixNQUFNLFlBQVksR0FBRyxjQUFjLENBQUMsYUFBYSxFQUFFLENBQUMsWUFBWSxDQUFDO2dCQUNqRSxNQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDO2dCQUMzQyxNQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2hFLE1BQU0sSUFBSSxHQUFHLFNBQVMsR0FBRyxVQUFVLEdBQUcsV0FBVyxHQUFHLFlBQVksQ0FBQztnQkFDakUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDLENBQUMsd0VBQXdFO2dCQUM1SixNQUFNLEdBQUcsR0FBRyxNQUFNLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxzRUFBc0U7b0JBQy9GLElBQUEsZUFBSyxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDMUIsR0FBRyxDQUFDO2dCQUNMLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7YUFDL0I7UUFDRixDQUFDLENBQUM7UUFFRixlQUFlLEVBQUUsQ0FBQztRQUNsQixPQUFPLGNBQWMsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBdEJELDBFQXNCQyJ9