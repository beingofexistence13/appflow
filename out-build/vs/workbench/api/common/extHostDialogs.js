/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extensions"], function (require, exports, uri_1, extHost_protocol_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nbc = void 0;
    class $nbc {
        constructor(mainContext) {
            this.a = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadDialogs);
        }
        showOpenDialog(extension, options) {
            if (options?.allowUIResources) {
                (0, extensions_1.$QF)(extension, 'showLocal');
            }
            return this.a.$showOpenDialog(options).then(filepaths => {
                return filepaths ? filepaths.map(p => uri_1.URI.revive(p)) : undefined;
            });
        }
        showSaveDialog(options) {
            return this.a.$showSaveDialog(options).then(filepath => {
                return filepath ? uri_1.URI.revive(filepath) : undefined;
            });
        }
    }
    exports.$nbc = $nbc;
});
//# sourceMappingURL=extHostDialogs.js.map