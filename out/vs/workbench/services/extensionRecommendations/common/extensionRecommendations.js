/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtensionIgnoredRecommendationsService = exports.IExtensionRecommendationsService = exports.ExtensionRecommendationReason = void 0;
    var ExtensionRecommendationReason;
    (function (ExtensionRecommendationReason) {
        ExtensionRecommendationReason[ExtensionRecommendationReason["Workspace"] = 0] = "Workspace";
        ExtensionRecommendationReason[ExtensionRecommendationReason["File"] = 1] = "File";
        ExtensionRecommendationReason[ExtensionRecommendationReason["Executable"] = 2] = "Executable";
        ExtensionRecommendationReason[ExtensionRecommendationReason["WorkspaceConfig"] = 3] = "WorkspaceConfig";
        ExtensionRecommendationReason[ExtensionRecommendationReason["DynamicWorkspace"] = 4] = "DynamicWorkspace";
        ExtensionRecommendationReason[ExtensionRecommendationReason["Experimental"] = 5] = "Experimental";
        ExtensionRecommendationReason[ExtensionRecommendationReason["Application"] = 6] = "Application";
    })(ExtensionRecommendationReason || (exports.ExtensionRecommendationReason = ExtensionRecommendationReason = {}));
    exports.IExtensionRecommendationsService = (0, instantiation_1.createDecorator)('extensionRecommendationsService');
    exports.IExtensionIgnoredRecommendationsService = (0, instantiation_1.createDecorator)('IExtensionIgnoredRecommendationsService');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUmVjb21tZW5kYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2V4dGVuc2lvblJlY29tbWVuZGF0aW9ucy9jb21tb24vZXh0ZW5zaW9uUmVjb21tZW5kYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxJQUFrQiw2QkFRakI7SUFSRCxXQUFrQiw2QkFBNkI7UUFDOUMsMkZBQVMsQ0FBQTtRQUNULGlGQUFJLENBQUE7UUFDSiw2RkFBVSxDQUFBO1FBQ1YsdUdBQWUsQ0FBQTtRQUNmLHlHQUFnQixDQUFBO1FBQ2hCLGlHQUFZLENBQUE7UUFDWiwrRkFBVyxDQUFBO0lBQ1osQ0FBQyxFQVJpQiw2QkFBNkIsNkNBQTdCLDZCQUE2QixRQVE5QztJQU9ZLFFBQUEsZ0NBQWdDLEdBQUcsSUFBQSwrQkFBZSxFQUFtQyxpQ0FBaUMsQ0FBQyxDQUFDO0lBd0J4SCxRQUFBLHVDQUF1QyxHQUFHLElBQUEsK0JBQWUsRUFBMEMseUNBQXlDLENBQUMsQ0FBQyJ9