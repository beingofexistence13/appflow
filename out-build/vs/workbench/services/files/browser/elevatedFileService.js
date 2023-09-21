/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/services/files/common/elevatedFileService"], function (require, exports, extensions_1, elevatedFileService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$o4b = void 0;
    class $o4b {
        isSupported(resource) {
            // Saving elevated is currently not supported in web for as
            // long as we have no generic support from the file service
            // (https://github.com/microsoft/vscode/issues/48659)
            return false;
        }
        async writeFileElevated(resource, value, options) {
            throw new Error('Unsupported');
        }
    }
    exports.$o4b = $o4b;
    (0, extensions_1.$mr)(elevatedFileService_1.$CD, $o4b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=elevatedFileService.js.map