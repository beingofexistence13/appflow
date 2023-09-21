/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol"], function (require, exports, lifecycle_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$fcc = void 0;
    class $fcc {
        constructor(mainContext) {
            this.b = 0;
            this.a = mainContext.getProxy(extHost_protocol_1.$1J.MainThreadLabelService);
        }
        $registerResourceLabelFormatter(formatter) {
            const handle = this.b++;
            this.a.$registerResourceLabelFormatter(handle, formatter);
            return (0, lifecycle_1.$ic)(() => {
                this.a.$unregisterResourceLabelFormatter(handle);
            });
        }
    }
    exports.$fcc = $fcc;
});
//# sourceMappingURL=extHostLabelService.js.map