/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IndentGuideHorizontalLine = exports.IndentGuide = exports.HorizontalGuidesState = void 0;
    var HorizontalGuidesState;
    (function (HorizontalGuidesState) {
        HorizontalGuidesState[HorizontalGuidesState["Disabled"] = 0] = "Disabled";
        HorizontalGuidesState[HorizontalGuidesState["EnabledForActive"] = 1] = "EnabledForActive";
        HorizontalGuidesState[HorizontalGuidesState["Enabled"] = 2] = "Enabled";
    })(HorizontalGuidesState || (exports.HorizontalGuidesState = HorizontalGuidesState = {}));
    class IndentGuide {
        constructor(visibleColumn, column, className, 
        /**
         * If set, this indent guide is a horizontal guide (no vertical part).
         * It starts at visibleColumn and continues until endColumn.
        */
        horizontalLine, 
        /**
         * If set (!= -1), only show this guide for wrapped lines that don't contain this model column, but are after it.
        */
        forWrappedLinesAfterColumn, forWrappedLinesBeforeOrAtColumn) {
            this.visibleColumn = visibleColumn;
            this.column = column;
            this.className = className;
            this.horizontalLine = horizontalLine;
            this.forWrappedLinesAfterColumn = forWrappedLinesAfterColumn;
            this.forWrappedLinesBeforeOrAtColumn = forWrappedLinesBeforeOrAtColumn;
            if ((visibleColumn !== -1) === (column !== -1)) {
                throw new Error();
            }
        }
    }
    exports.IndentGuide = IndentGuide;
    class IndentGuideHorizontalLine {
        constructor(top, endColumn) {
            this.top = top;
            this.endColumn = endColumn;
        }
    }
    exports.IndentGuideHorizontalLine = IndentGuideHorizontalLine;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1vZGVsR3VpZGVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi90ZXh0TW9kZWxHdWlkZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBNkJoRyxJQUFZLHFCQUlYO0lBSkQsV0FBWSxxQkFBcUI7UUFDaEMseUVBQVEsQ0FBQTtRQUNSLHlGQUFnQixDQUFBO1FBQ2hCLHVFQUFPLENBQUE7SUFDUixDQUFDLEVBSlcscUJBQXFCLHFDQUFyQixxQkFBcUIsUUFJaEM7SUFRRCxNQUFhLFdBQVc7UUFDdkIsWUFDaUIsYUFBMEIsRUFDMUIsTUFBbUIsRUFDbkIsU0FBaUI7UUFDakM7OztVQUdFO1FBQ2MsY0FBZ0Q7UUFDaEU7O1VBRUU7UUFDYywwQkFBdUMsRUFDdkMsK0JBQTRDO1lBWjVDLGtCQUFhLEdBQWIsYUFBYSxDQUFhO1lBQzFCLFdBQU0sR0FBTixNQUFNLENBQWE7WUFDbkIsY0FBUyxHQUFULFNBQVMsQ0FBUTtZQUtqQixtQkFBYyxHQUFkLGNBQWMsQ0FBa0M7WUFJaEQsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUFhO1lBQ3ZDLG9DQUErQixHQUEvQiwrQkFBK0IsQ0FBYTtZQUU1RCxJQUFJLENBQUMsYUFBYSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDL0MsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDO2FBQ2xCO1FBQ0YsQ0FBQztLQUNEO0lBcEJELGtDQW9CQztJQUVELE1BQWEseUJBQXlCO1FBQ3JDLFlBQ2lCLEdBQVksRUFDWixTQUFpQjtZQURqQixRQUFHLEdBQUgsR0FBRyxDQUFTO1lBQ1osY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUM5QixDQUFDO0tBQ0w7SUFMRCw4REFLQyJ9