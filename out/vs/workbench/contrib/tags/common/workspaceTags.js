/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/extensionManagement/common/configRemotes"], function (require, exports, instantiation_1, configRemotes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getHashedRemotesFromConfig = exports.IWorkspaceTagsService = void 0;
    exports.IWorkspaceTagsService = (0, instantiation_1.createDecorator)('workspaceTagsService');
    async function getHashedRemotesFromConfig(text, stripEndingDotGit = false, sha1Hex) {
        return Promise.all((0, configRemotes_1.getRemotes)(text, stripEndingDotGit).map(remote => sha1Hex(remote)));
    }
    exports.getHashedRemotesFromConfig = getHashedRemotesFromConfig;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlVGFncy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3RhZ3MvY29tbW9uL3dvcmtzcGFjZVRhZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU25GLFFBQUEscUJBQXFCLEdBQUcsSUFBQSwrQkFBZSxFQUF3QixzQkFBc0IsQ0FBQyxDQUFDO0lBZ0I3RixLQUFLLFVBQVUsMEJBQTBCLENBQUMsSUFBWSxFQUFFLG9CQUE2QixLQUFLLEVBQUUsT0FBeUM7UUFDM0ksT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUEsMEJBQVUsRUFBQyxJQUFJLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hGLENBQUM7SUFGRCxnRUFFQyJ9