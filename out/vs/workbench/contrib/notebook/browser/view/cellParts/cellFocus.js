/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/workbench/contrib/notebook/browser/view/cellPart"], function (require, exports, DOM, cellPart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellFocusPart = void 0;
    class CellFocusPart extends cellPart_1.CellContentPart {
        constructor(containerElement, focusSinkElement, notebookEditor) {
            super();
            this._register(DOM.addDisposableListener(containerElement, DOM.EventType.FOCUS, () => {
                if (this.currentCell) {
                    notebookEditor.focusElement(this.currentCell);
                }
            }, true));
            if (focusSinkElement) {
                this._register(DOM.addDisposableListener(focusSinkElement, DOM.EventType.FOCUS, () => {
                    if (this.currentCell && this.currentCell.outputsViewModels.length) {
                        notebookEditor.focusNotebookCell(this.currentCell, 'output');
                    }
                }));
            }
        }
    }
    exports.CellFocusPart = CellFocusPart;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbEZvY3VzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci92aWV3L2NlbGxQYXJ0cy9jZWxsRm9jdXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLE1BQWEsYUFBYyxTQUFRLDBCQUFlO1FBQ2pELFlBQ0MsZ0JBQTZCLEVBQzdCLGdCQUF5QyxFQUN6QyxjQUErQjtZQUUvQixLQUFLLEVBQUUsQ0FBQztZQUVSLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRTtnQkFDcEYsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO29CQUNyQixjQUFjLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztpQkFDOUM7WUFDRixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUVWLElBQUksZ0JBQWdCLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRTtvQkFDcEYsSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFLLElBQUksQ0FBQyxXQUFpQyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRTt3QkFDekYsY0FBYyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7cUJBQzdEO2dCQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDSjtRQUNGLENBQUM7S0FDRDtJQXRCRCxzQ0FzQkMifQ==