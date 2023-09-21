/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$w1b = exports.$v1b = void 0;
    exports.$v1b = (0, instantiation_1.$Bh)('workingCopyHistoryService');
    /**
     * A limit on how many I/O operations we allow to run in parallel.
     * We do not want to spam the file system with too many requests
     * at the same time, so we limit to a maximum degree of parallellism.
     */
    exports.$w1b = 20;
});
//# sourceMappingURL=workingCopyHistory.js.map