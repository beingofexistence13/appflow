/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OM = exports.VariableKind = exports.$NM = void 0;
    exports.$NM = (0, instantiation_1.$Bh)('configurationResolverService');
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
    class $OM extends Error {
        constructor(variable, message) {
            super(message);
            this.variable = variable;
        }
    }
    exports.$OM = $OM;
});
//# sourceMappingURL=configurationResolver.js.map