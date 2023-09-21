/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/workbench/contrib/notebook/browser/view/cellPart"], function (require, exports, DOM, cellPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CollapsedCellInput = void 0;
    class CollapsedCellInput extends cellPart_1.CellContentPart {
        constructor(notebookEditor, cellInputCollapsedContainer) {
            super();
            this.notebookEditor = notebookEditor;
            this._register(DOM.addDisposableListener(cellInputCollapsedContainer, DOM.EventType.DBLCLICK, e => {
                if (!this.currentCell || !this.notebookEditor.hasModel()) {
                    return;
                }
                if (this.currentCell.isInputCollapsed) {
                    this.currentCell.isInputCollapsed = false;
                }
                else {
                    this.currentCell.isOutputCollapsed = false;
                }
            }));
            this._register(DOM.addDisposableListener(cellInputCollapsedContainer, DOM.EventType.CLICK, e => {
                if (!this.currentCell || !this.notebookEditor.hasModel()) {
                    return;
                }
                const element = e.target;
                if (element && element.classList && element.classList.contains('expandInputIcon')) {
                    // clicked on the expand icon
                    this.currentCell.isInputCollapsed = false;
                }
            }));
        }
    }
    exports.CollapsedCellInput = CollapsedCellInput;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGFwc2VkQ2VsbElucHV0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3L2NlbGxQYXJ0cy9jb2xsYXBzZWRDZWxsSW5wdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQWEsa0JBQW1CLFNBQVEsMEJBQWU7UUFDdEQsWUFDa0IsY0FBK0IsRUFDaEQsMkJBQXdDO1lBRXhDLEtBQUssRUFBRSxDQUFDO1lBSFMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBS2hELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLDJCQUEyQixFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUNqRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLEVBQUU7b0JBQ3pELE9BQU87aUJBQ1A7Z0JBRUQsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixFQUFFO29CQUN0QyxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztpQkFDMUM7cUJBQU07b0JBQ04sSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7aUJBQzNDO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLDJCQUEyQixFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUM5RixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLEVBQUU7b0JBQ3pELE9BQU87aUJBQ1A7Z0JBRUQsTUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLE1BQXFCLENBQUM7Z0JBRXhDLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxTQUFTLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsRUFBRTtvQkFDbEYsNkJBQTZCO29CQUM3QixJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztpQkFDMUM7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztLQUNEO0lBaENELGdEQWdDQyJ9