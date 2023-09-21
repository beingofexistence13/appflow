/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookCellStateChangedEvent = exports.NotebookMetadataChangedEvent = exports.NotebookLayoutChangedEvent = exports.NotebookViewEventType = void 0;
    var NotebookViewEventType;
    (function (NotebookViewEventType) {
        NotebookViewEventType[NotebookViewEventType["LayoutChanged"] = 1] = "LayoutChanged";
        NotebookViewEventType[NotebookViewEventType["MetadataChanged"] = 2] = "MetadataChanged";
        NotebookViewEventType[NotebookViewEventType["CellStateChanged"] = 3] = "CellStateChanged";
    })(NotebookViewEventType || (exports.NotebookViewEventType = NotebookViewEventType = {}));
    class NotebookLayoutChangedEvent {
        constructor(source, value) {
            this.source = source;
            this.value = value;
            this.type = NotebookViewEventType.LayoutChanged;
        }
    }
    exports.NotebookLayoutChangedEvent = NotebookLayoutChangedEvent;
    class NotebookMetadataChangedEvent {
        constructor(source) {
            this.source = source;
            this.type = NotebookViewEventType.MetadataChanged;
        }
    }
    exports.NotebookMetadataChangedEvent = NotebookMetadataChangedEvent;
    class NotebookCellStateChangedEvent {
        constructor(source, cell) {
            this.source = source;
            this.cell = cell;
            this.type = NotebookViewEventType.CellStateChanged;
        }
    }
    exports.NotebookCellStateChangedEvent = NotebookCellStateChangedEvent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tWaWV3RXZlbnRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9ub3RlYm9va1ZpZXdFdmVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBc0NoRyxJQUFZLHFCQUlYO0lBSkQsV0FBWSxxQkFBcUI7UUFDaEMsbUZBQWlCLENBQUE7UUFDakIsdUZBQW1CLENBQUE7UUFDbkIseUZBQW9CLENBQUE7SUFDckIsQ0FBQyxFQUpXLHFCQUFxQixxQ0FBckIscUJBQXFCLFFBSWhDO0lBRUQsTUFBYSwwQkFBMEI7UUFHdEMsWUFBcUIsTUFBaUMsRUFBVyxLQUF5QjtZQUFyRSxXQUFNLEdBQU4sTUFBTSxDQUEyQjtZQUFXLFVBQUssR0FBTCxLQUFLLENBQW9CO1lBRjFFLFNBQUksR0FBRyxxQkFBcUIsQ0FBQyxhQUFhLENBQUM7UUFJM0QsQ0FBQztLQUNEO0lBTkQsZ0VBTUM7SUFHRCxNQUFhLDRCQUE0QjtRQUd4QyxZQUFxQixNQUFnQztZQUFoQyxXQUFNLEdBQU4sTUFBTSxDQUEwQjtZQUZyQyxTQUFJLEdBQUcscUJBQXFCLENBQUMsZUFBZSxDQUFDO1FBSTdELENBQUM7S0FDRDtJQU5ELG9FQU1DO0lBRUQsTUFBYSw2QkFBNkI7UUFHekMsWUFBcUIsTUFBcUMsRUFBVyxJQUEyQjtZQUEzRSxXQUFNLEdBQU4sTUFBTSxDQUErQjtZQUFXLFNBQUksR0FBSixJQUFJLENBQXVCO1lBRmhGLFNBQUksR0FBRyxxQkFBcUIsQ0FBQyxnQkFBZ0IsQ0FBQztRQUk5RCxDQUFDO0tBQ0Q7SUFORCxzRUFNQyJ9