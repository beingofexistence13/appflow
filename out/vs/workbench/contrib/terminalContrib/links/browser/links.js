/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalBuiltinLinkType = exports.ITerminalLinkProviderService = void 0;
    exports.ITerminalLinkProviderService = (0, instantiation_1.createDecorator)('terminalLinkProviderService');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlua3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbENvbnRyaWIvbGlua3MvYnJvd3Nlci9saW5rcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjbkYsUUFBQSw0QkFBNEIsR0FBRyxJQUFBLCtCQUFlLEVBQStCLDZCQUE2QixDQUFDLENBQUM7SUFpR3pILElBQWtCLHVCQTRCakI7SUE1QkQsV0FBa0IsdUJBQXVCO1FBQ3hDOztXQUVHO1FBQ0gsa0RBQXVCLENBQUE7UUFFdkI7OztXQUdHO1FBQ0gsc0ZBQTJELENBQUE7UUFFM0Q7OztXQUdHO1FBQ0gsNEVBQWlELENBQUE7UUFFakQ7OztXQUdHO1FBQ0gsNENBQWlCLENBQUE7UUFFakI7O1dBRUc7UUFDSCxzQ0FBVyxDQUFBO0lBQ1osQ0FBQyxFQTVCaUIsdUJBQXVCLHVDQUF2Qix1QkFBdUIsUUE0QnhDIn0=