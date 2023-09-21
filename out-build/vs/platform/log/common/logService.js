/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/log/common/log"], function (require, exports, lifecycle_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$mN = void 0;
    class $mN extends lifecycle_1.$kc {
        constructor(primaryLogger, otherLoggers = []) {
            super();
            this.a = new log_1.$cj([primaryLogger, ...otherLoggers]);
            this.B(primaryLogger.onDidChangeLogLevel(level => this.setLevel(level)));
        }
        get onDidChangeLogLevel() {
            return this.a.onDidChangeLogLevel;
        }
        setLevel(level) {
            this.a.setLevel(level);
        }
        getLevel() {
            return this.a.getLevel();
        }
        trace(message, ...args) {
            this.a.trace(message, ...args);
        }
        debug(message, ...args) {
            this.a.debug(message, ...args);
        }
        info(message, ...args) {
            this.a.info(message, ...args);
        }
        warn(message, ...args) {
            this.a.warn(message, ...args);
        }
        error(message, ...args) {
            this.a.error(message, ...args);
        }
        flush() {
            this.a.flush();
        }
    }
    exports.$mN = $mN;
});
//# sourceMappingURL=logService.js.map