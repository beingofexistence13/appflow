/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/uri", "vs/platform/workspace/common/workspace"], function (require, exports, platform_1, uri_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.testWorkspace = exports.TestWorkspace = exports.Workspace = void 0;
    class Workspace extends workspace_1.Workspace {
        constructor(id, folders = [], configuration = null, ignorePathCasing = () => !platform_1.isLinux) {
            super(id, folders, false, configuration, ignorePathCasing);
        }
    }
    exports.Workspace = Workspace;
    const wsUri = uri_1.URI.file(platform_1.isWindows ? 'C:\\testWorkspace' : '/testWorkspace');
    exports.TestWorkspace = testWorkspace(wsUri);
    function testWorkspace(resource) {
        return new Workspace(resource.toString(), [(0, workspace_1.toWorkspaceFolder)(resource)]);
    }
    exports.testWorkspace = testWorkspace;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFdvcmtzcGFjZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3dvcmtzcGFjZS90ZXN0L2NvbW1vbi90ZXN0V29ya3NwYWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxNQUFhLFNBQVUsU0FBUSxxQkFBYTtRQUMzQyxZQUNDLEVBQVUsRUFDVixVQUE2QixFQUFFLEVBQy9CLGdCQUE0QixJQUFJLEVBQ2hDLG1CQUEwQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLGtCQUFPO1lBRXhELEtBQUssQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUM1RCxDQUFDO0tBQ0Q7SUFURCw4QkFTQztJQUVELE1BQU0sS0FBSyxHQUFHLFNBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQVMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDOUQsUUFBQSxhQUFhLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRWxELFNBQWdCLGFBQWEsQ0FBQyxRQUFhO1FBQzFDLE9BQU8sSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsSUFBQSw2QkFBaUIsRUFBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUZELHNDQUVDIn0=