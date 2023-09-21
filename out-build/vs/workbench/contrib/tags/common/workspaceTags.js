/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/extensionManagement/common/configRemotes"], function (require, exports, instantiation_1, configRemotes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OZb = exports.$NZb = void 0;
    exports.$NZb = (0, instantiation_1.$Bh)('workspaceTagsService');
    async function $OZb(text, stripEndingDotGit = false, sha1Hex) {
        return Promise.all((0, configRemotes_1.$MZb)(text, stripEndingDotGit).map(remote => sha1Hex(remote)));
    }
    exports.$OZb = $OZb;
});
//# sourceMappingURL=workspaceTags.js.map