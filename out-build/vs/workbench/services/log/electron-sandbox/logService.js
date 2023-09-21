/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/log/common/log", "vs/base/common/lifecycle", "vs/nls!vs/workbench/services/log/electron-sandbox/logService", "vs/workbench/services/log/common/logConstants", "vs/platform/log/common/logService"], function (require, exports, log_1, lifecycle_1, nls_1, logConstants_1, logService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$$b = void 0;
    class $$$b extends logService_1.$mN {
        constructor(loggerService, environmentService) {
            const disposables = new lifecycle_1.$jc();
            const fileLogger = disposables.add(loggerService.createLogger(environmentService.logFile, { id: logConstants_1.$mhb, name: (0, nls_1.localize)(0, null) }));
            let consoleLogger;
            if (environmentService.isExtensionDevelopment && !!environmentService.extensionTestsLocationURI) {
                // Extension development test CLI: forward everything to main side
                consoleLogger = loggerService.createConsoleMainLogger();
            }
            else {
                // Normal mode: Log to console
                consoleLogger = new log_1.$aj(fileLogger.getLevel());
            }
            super(fileLogger, [consoleLogger]);
            this.B(disposables);
        }
    }
    exports.$$$b = $$$b;
});
//# sourceMappingURL=logService.js.map