/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uuid", "vs/platform/log/common/log", "vs/platform/log/node/spdlogLog"], function (require, exports, uuid_1, log_1, spdlogLog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LoggerService = void 0;
    class LoggerService extends log_1.AbstractLoggerService {
        doCreateLogger(resource, logLevel, options) {
            return new spdlogLog_1.SpdLogLogger((0, uuid_1.generateUuid)(), resource.fsPath, !options?.donotRotate, !!options?.donotUseFormatters, logLevel);
        }
    }
    exports.LoggerService = LoggerService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2xvZy9ub2RlL2xvZ2dlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLE1BQWEsYUFBYyxTQUFRLDJCQUFxQjtRQUU3QyxjQUFjLENBQUMsUUFBYSxFQUFFLFFBQWtCLEVBQUUsT0FBd0I7WUFDbkYsT0FBTyxJQUFJLHdCQUFZLENBQUMsSUFBQSxtQkFBWSxHQUFFLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMxSCxDQUFDO0tBQ0Q7SUFMRCxzQ0FLQyJ9