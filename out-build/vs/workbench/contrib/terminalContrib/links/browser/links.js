/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalBuiltinLinkType = exports.$2kb = void 0;
    exports.$2kb = (0, instantiation_1.$Bh)('terminalLinkProviderService');
    var TerminalBuiltinLinkType;
    (function (TerminalBuiltinLinkType) {
        /**
         * The link is validated to be a file on the file system and will open an editor.
         */
        TerminalBuiltinLinkType["LocalFile"] = "LocalFile";
        /**
         * The link is validated to be a folder on the file system and is outside the workspace. It will
         * reveal the folder within the explorer.
         */
        TerminalBuiltinLinkType["LocalFolderOutsideWorkspace"] = "LocalFolderOutsideWorkspace";
        /**
         * The link is validated to be a folder on the file system and is within the workspace and will
         * reveal the folder within the explorer.
         */
        TerminalBuiltinLinkType["LocalFolderInWorkspace"] = "LocalFolderInWorkspace";
        /**
         * A low confidence link which will search for the file in the workspace. If there is a single
         * match, it will open the file; otherwise, it will present the matches in a quick pick.
         */
        TerminalBuiltinLinkType["Search"] = "Search";
        /**
         * A link whose text is a valid URI.
         */
        TerminalBuiltinLinkType["Url"] = "Url";
    })(TerminalBuiltinLinkType || (exports.TerminalBuiltinLinkType = TerminalBuiltinLinkType = {}));
});
//# sourceMappingURL=links.js.map