/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/uri", "vs/platform/workspace/common/workspace"], function (require, exports, platform_1, uri_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_0b = exports.$$0b = exports.$00b = void 0;
    class $00b extends workspace_1.$Uh {
        constructor(id, folders = [], configuration = null, ignorePathCasing = () => !platform_1.$k) {
            super(id, folders, false, configuration, ignorePathCasing);
        }
    }
    exports.$00b = $00b;
    const wsUri = uri_1.URI.file(platform_1.$i ? 'C:\\testWorkspace' : '/testWorkspace');
    exports.$$0b = $_0b(wsUri);
    function $_0b(resource) {
        return new $00b(resource.toString(), [(0, workspace_1.$Wh)(resource)]);
    }
    exports.$_0b = $_0b;
});
//# sourceMappingURL=testWorkspace.js.map