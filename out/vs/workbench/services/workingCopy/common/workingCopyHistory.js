/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MAX_PARALLEL_HISTORY_IO_OPS = exports.IWorkingCopyHistoryService = void 0;
    exports.IWorkingCopyHistoryService = (0, instantiation_1.createDecorator)('workingCopyHistoryService');
    /**
     * A limit on how many I/O operations we allow to run in parallel.
     * We do not want to spam the file system with too many requests
     * at the same time, so we limit to a maximum degree of parallellism.
     */
    exports.MAX_PARALLEL_HISTORY_IO_OPS = 20;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2luZ0NvcHlIaXN0b3J5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3dvcmtpbmdDb3B5L2NvbW1vbi93b3JraW5nQ29weUhpc3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUW5GLFFBQUEsMEJBQTBCLEdBQUcsSUFBQSwrQkFBZSxFQUE2QiwyQkFBMkIsQ0FBQyxDQUFDO0lBdUluSDs7OztPQUlHO0lBQ1UsUUFBQSwyQkFBMkIsR0FBRyxFQUFFLENBQUMifQ==