/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.INotebookExecutionStateService = exports.NotebookExecutionType = void 0;
    var NotebookExecutionType;
    (function (NotebookExecutionType) {
        NotebookExecutionType[NotebookExecutionType["cell"] = 0] = "cell";
        NotebookExecutionType[NotebookExecutionType["notebook"] = 1] = "notebook";
    })(NotebookExecutionType || (exports.NotebookExecutionType = NotebookExecutionType = {}));
    exports.INotebookExecutionStateService = (0, instantiation_1.createDecorator)('INotebookExecutionStateService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFeGVjdXRpb25TdGF0ZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9jb21tb24vbm90ZWJvb2tFeGVjdXRpb25TdGF0ZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBdUJoRyxJQUFZLHFCQUdYO0lBSEQsV0FBWSxxQkFBcUI7UUFDaEMsaUVBQUksQ0FBQTtRQUNKLHlFQUFRLENBQUE7SUFDVCxDQUFDLEVBSFcscUJBQXFCLHFDQUFyQixxQkFBcUIsUUFHaEM7SUEwQlksUUFBQSw4QkFBOEIsR0FBRyxJQUFBLCtCQUFlLEVBQWlDLGdDQUFnQyxDQUFDLENBQUMifQ==