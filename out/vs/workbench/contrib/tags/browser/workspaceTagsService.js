/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/tags/common/workspaceTags"], function (require, exports, extensions_1, workspaceTags_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NoOpWorkspaceTagsService = void 0;
    class NoOpWorkspaceTagsService {
        getTags() {
            return Promise.resolve({});
        }
        async getTelemetryWorkspaceId(workspace, state) {
            return undefined;
        }
        getHashedRemotesFromUri(workspaceUri, stripEndingDotGit) {
            return Promise.resolve([]);
        }
    }
    exports.NoOpWorkspaceTagsService = NoOpWorkspaceTagsService;
    (0, extensions_1.registerSingleton)(workspaceTags_1.IWorkspaceTagsService, NoOpWorkspaceTagsService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlVGFnc1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90YWdzL2Jyb3dzZXIvd29ya3NwYWNlVGFnc1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLE1BQWEsd0JBQXdCO1FBSXBDLE9BQU87WUFDTixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxTQUFxQixFQUFFLEtBQXFCO1lBQ3pFLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRCx1QkFBdUIsQ0FBQyxZQUFpQixFQUFFLGlCQUEyQjtZQUNyRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUIsQ0FBQztLQUNEO0lBZkQsNERBZUM7SUFFRCxJQUFBLDhCQUFpQixFQUFDLHFDQUFxQixFQUFFLHdCQUF3QixvQ0FBNEIsQ0FBQyJ9