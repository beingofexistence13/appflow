/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IIssueMainService = exports.IssueType = void 0;
    var IssueType;
    (function (IssueType) {
        IssueType[IssueType["Bug"] = 0] = "Bug";
        IssueType[IssueType["PerformanceIssue"] = 1] = "PerformanceIssue";
        IssueType[IssueType["FeatureRequest"] = 2] = "FeatureRequest";
    })(IssueType || (exports.IssueType = IssueType = {}));
    exports.IIssueMainService = (0, instantiation_1.createDecorator)('issueService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNzdWUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9pc3N1ZS9jb21tb24vaXNzdWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBa0JoRyxJQUFrQixTQUlqQjtJQUpELFdBQWtCLFNBQVM7UUFDMUIsdUNBQUcsQ0FBQTtRQUNILGlFQUFnQixDQUFBO1FBQ2hCLDZEQUFjLENBQUE7SUFDZixDQUFDLEVBSmlCLFNBQVMseUJBQVQsU0FBUyxRQUkxQjtJQXdGWSxRQUFBLGlCQUFpQixHQUFHLElBQUEsK0JBQWUsRUFBb0IsY0FBYyxDQUFDLENBQUMifQ==