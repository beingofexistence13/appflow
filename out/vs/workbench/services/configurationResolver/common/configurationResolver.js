/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VariableError = exports.VariableKind = exports.IConfigurationResolverService = void 0;
    exports.IConfigurationResolverService = (0, instantiation_1.createDecorator)('configurationResolverService');
    var VariableKind;
    (function (VariableKind) {
        VariableKind["Unknown"] = "unknown";
        VariableKind["Env"] = "env";
        VariableKind["Config"] = "config";
        VariableKind["Command"] = "command";
        VariableKind["Input"] = "input";
        VariableKind["ExtensionInstallFolder"] = "extensionInstallFolder";
        VariableKind["WorkspaceFolder"] = "workspaceFolder";
        VariableKind["Cwd"] = "cwd";
        VariableKind["WorkspaceFolderBasename"] = "workspaceFolderBasename";
        VariableKind["UserHome"] = "userHome";
        VariableKind["LineNumber"] = "lineNumber";
        VariableKind["SelectedText"] = "selectedText";
        VariableKind["File"] = "file";
        VariableKind["FileWorkspaceFolder"] = "fileWorkspaceFolder";
        VariableKind["RelativeFile"] = "relativeFile";
        VariableKind["RelativeFileDirname"] = "relativeFileDirname";
        VariableKind["FileDirname"] = "fileDirname";
        VariableKind["FileExtname"] = "fileExtname";
        VariableKind["FileBasename"] = "fileBasename";
        VariableKind["FileBasenameNoExtension"] = "fileBasenameNoExtension";
        VariableKind["FileDirnameBasename"] = "fileDirnameBasename";
        VariableKind["ExecPath"] = "execPath";
        VariableKind["ExecInstallFolder"] = "execInstallFolder";
        VariableKind["PathSeparator"] = "pathSeparator";
    })(VariableKind || (exports.VariableKind = VariableKind = {}));
    class VariableError extends Error {
        constructor(variable, message) {
            super(message);
            this.variable = variable;
        }
    }
    exports.VariableError = VariableError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvblJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2NvbmZpZ3VyYXRpb25SZXNvbHZlci9jb21tb24vY29uZmlndXJhdGlvblJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVFuRixRQUFBLDZCQUE2QixHQUFHLElBQUEsK0JBQWUsRUFBZ0MsOEJBQThCLENBQUMsQ0FBQztJQXVFNUgsSUFBWSxZQTJCWDtJQTNCRCxXQUFZLFlBQVk7UUFDdkIsbUNBQW1CLENBQUE7UUFFbkIsMkJBQVcsQ0FBQTtRQUNYLGlDQUFpQixDQUFBO1FBQ2pCLG1DQUFtQixDQUFBO1FBQ25CLCtCQUFlLENBQUE7UUFDZixpRUFBaUQsQ0FBQTtRQUVqRCxtREFBbUMsQ0FBQTtRQUNuQywyQkFBVyxDQUFBO1FBQ1gsbUVBQW1ELENBQUE7UUFDbkQscUNBQXFCLENBQUE7UUFDckIseUNBQXlCLENBQUE7UUFDekIsNkNBQTZCLENBQUE7UUFDN0IsNkJBQWEsQ0FBQTtRQUNiLDJEQUEyQyxDQUFBO1FBQzNDLDZDQUE2QixDQUFBO1FBQzdCLDJEQUEyQyxDQUFBO1FBQzNDLDJDQUEyQixDQUFBO1FBQzNCLDJDQUEyQixDQUFBO1FBQzNCLDZDQUE2QixDQUFBO1FBQzdCLG1FQUFtRCxDQUFBO1FBQ25ELDJEQUEyQyxDQUFBO1FBQzNDLHFDQUFxQixDQUFBO1FBQ3JCLHVEQUF1QyxDQUFBO1FBQ3ZDLCtDQUErQixDQUFBO0lBQ2hDLENBQUMsRUEzQlcsWUFBWSw0QkFBWixZQUFZLFFBMkJ2QjtJQUVELE1BQWEsYUFBYyxTQUFRLEtBQUs7UUFDdkMsWUFBNEIsUUFBc0IsRUFBRSxPQUFnQjtZQUNuRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFEWSxhQUFRLEdBQVIsUUFBUSxDQUFjO1FBRWxELENBQUM7S0FDRDtJQUpELHNDQUlDIn0=