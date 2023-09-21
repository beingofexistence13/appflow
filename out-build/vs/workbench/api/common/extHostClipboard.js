/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/api/common/extHost.protocol"], function (require, exports, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ebc = void 0;
    class $ebc {
        constructor(mainContext) {
            const proxy = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadClipboard);
            this.value = Object.freeze({
                readText() {
                    return proxy.$readText();
                },
                writeText(value) {
                    return proxy.$writeText(value);
                }
            });
        }
    }
    exports.$ebc = $ebc;
});
//# sourceMappingURL=extHostClipboard.js.map