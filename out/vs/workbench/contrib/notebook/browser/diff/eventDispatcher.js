/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookDiffEditorEventDispatcher = exports.NotebookCellLayoutChangedEvent = exports.NotebookDiffLayoutChangedEvent = exports.NotebookDiffViewEventType = void 0;
    var NotebookDiffViewEventType;
    (function (NotebookDiffViewEventType) {
        NotebookDiffViewEventType[NotebookDiffViewEventType["LayoutChanged"] = 1] = "LayoutChanged";
        NotebookDiffViewEventType[NotebookDiffViewEventType["CellLayoutChanged"] = 2] = "CellLayoutChanged";
        // MetadataChanged = 2,
        // CellStateChanged = 3
    })(NotebookDiffViewEventType || (exports.NotebookDiffViewEventType = NotebookDiffViewEventType = {}));
    class NotebookDiffLayoutChangedEvent {
        constructor(source, value) {
            this.source = source;
            this.value = value;
            this.type = NotebookDiffViewEventType.LayoutChanged;
        }
    }
    exports.NotebookDiffLayoutChangedEvent = NotebookDiffLayoutChangedEvent;
    class NotebookCellLayoutChangedEvent {
        constructor(source) {
            this.source = source;
            this.type = NotebookDiffViewEventType.CellLayoutChanged;
        }
    }
    exports.NotebookCellLayoutChangedEvent = NotebookCellLayoutChangedEvent;
    class NotebookDiffEditorEventDispatcher extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onDidChangeLayout = this._register(new event_1.Emitter());
            this.onDidChangeLayout = this._onDidChangeLayout.event;
            this._onDidChangeCellLayout = this._register(new event_1.Emitter());
            this.onDidChangeCellLayout = this._onDidChangeCellLayout.event;
        }
        emit(events) {
            for (let i = 0, len = events.length; i < len; i++) {
                const e = events[i];
                switch (e.type) {
                    case NotebookDiffViewEventType.LayoutChanged:
                        this._onDidChangeLayout.fire(e);
                        break;
                    case NotebookDiffViewEventType.CellLayoutChanged:
                        this._onDidChangeCellLayout.fire(e);
                        break;
                }
            }
        }
    }
    exports.NotebookDiffEditorEventDispatcher = NotebookDiffEditorEventDispatcher;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnREaXNwYXRjaGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9kaWZmL2V2ZW50RGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEcsSUFBWSx5QkFLWDtJQUxELFdBQVkseUJBQXlCO1FBQ3BDLDJGQUFpQixDQUFBO1FBQ2pCLG1HQUFxQixDQUFBO1FBQ3JCLHVCQUF1QjtRQUN2Qix1QkFBdUI7SUFDeEIsQ0FBQyxFQUxXLHlCQUF5Qix5Q0FBekIseUJBQXlCLFFBS3BDO0lBRUQsTUFBYSw4QkFBOEI7UUFHMUMsWUFBcUIsTUFBaUMsRUFBVyxLQUF5QjtZQUFyRSxXQUFNLEdBQU4sTUFBTSxDQUEyQjtZQUFXLFVBQUssR0FBTCxLQUFLLENBQW9CO1lBRjFFLFNBQUksR0FBRyx5QkFBeUIsQ0FBQyxhQUFhLENBQUM7UUFJL0QsQ0FBQztLQUNEO0lBTkQsd0VBTUM7SUFFRCxNQUFhLDhCQUE4QjtRQUcxQyxZQUFxQixNQUE4QjtZQUE5QixXQUFNLEdBQU4sTUFBTSxDQUF3QjtZQUZuQyxTQUFJLEdBQUcseUJBQXlCLENBQUMsaUJBQWlCLENBQUM7UUFJbkUsQ0FBQztLQUNEO0lBTkQsd0VBTUM7SUFJRCxNQUFhLGlDQUFrQyxTQUFRLHNCQUFVO1FBQWpFOztZQUNvQix1QkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFrQyxDQUFDLENBQUM7WUFDN0Ysc0JBQWlCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQztZQUV4QywyQkFBc0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFrQyxDQUFDLENBQUM7WUFDakcsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztRQWdCcEUsQ0FBQztRQWRBLElBQUksQ0FBQyxNQUErQjtZQUNuQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNsRCxNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXBCLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRTtvQkFDZixLQUFLLHlCQUF5QixDQUFDLGFBQWE7d0JBQzNDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ2hDLE1BQU07b0JBQ1AsS0FBSyx5QkFBeUIsQ0FBQyxpQkFBaUI7d0JBQy9DLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3BDLE1BQU07aUJBQ1A7YUFDRDtRQUNGLENBQUM7S0FDRDtJQXJCRCw4RUFxQkMifQ==