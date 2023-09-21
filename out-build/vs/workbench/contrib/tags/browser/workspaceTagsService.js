/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/tags/common/workspaceTags"], function (require, exports, extensions_1, workspaceTags_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$b5b = void 0;
    class $b5b {
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
    exports.$b5b = $b5b;
    (0, extensions_1.$mr)(workspaceTags_1.$NZb, $b5b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=workspaceTagsService.js.map