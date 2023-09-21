/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.INotebookExecutionService = exports.CellExecutionUpdateType = void 0;
    var CellExecutionUpdateType;
    (function (CellExecutionUpdateType) {
        CellExecutionUpdateType[CellExecutionUpdateType["Output"] = 1] = "Output";
        CellExecutionUpdateType[CellExecutionUpdateType["OutputItems"] = 2] = "OutputItems";
        CellExecutionUpdateType[CellExecutionUpdateType["ExecutionState"] = 3] = "ExecutionState";
    })(CellExecutionUpdateType || (exports.CellExecutionUpdateType = CellExecutionUpdateType = {}));
    exports.INotebookExecutionService = (0, instantiation_1.createDecorator)('INotebookExecutionService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFeGVjdXRpb25TZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svY29tbW9uL25vdGVib29rRXhlY3V0aW9uU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFTaEcsSUFBWSx1QkFJWDtJQUpELFdBQVksdUJBQXVCO1FBQ2xDLHlFQUFVLENBQUE7UUFDVixtRkFBZSxDQUFBO1FBQ2YseUZBQWtCLENBQUE7SUFDbkIsQ0FBQyxFQUpXLHVCQUF1Qix1Q0FBdkIsdUJBQXVCLFFBSWxDO0lBZ0JZLFFBQUEseUJBQXlCLEdBQUcsSUFBQSwrQkFBZSxFQUE0QiwyQkFBMkIsQ0FBQyxDQUFDIn0=