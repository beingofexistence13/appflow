/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/log/common/log"], function (require, exports, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$92b = void 0;
    class $92b extends log_1.$$i {
        constructor(logLevel = log_1.$8i) {
            super();
            this.m = [];
            this.n = undefined;
            this.setLevel(logLevel);
            this.B(this.onDidChangeLogLevel(level => {
                this.n?.setLevel(level);
            }));
        }
        set logger(logger) {
            this.n = logger;
            for (const { level, message } of this.m) {
                (0, log_1.log)(logger, level, message);
            }
            this.m = [];
        }
        g(level, message) {
            if (this.n) {
                (0, log_1.log)(this.n, level, message);
            }
            else if (this.getLevel() <= level) {
                this.m.push({ level, message });
            }
        }
        dispose() {
            this.n?.dispose();
        }
        flush() {
            this.n?.flush();
        }
    }
    exports.$92b = $92b;
});
//# sourceMappingURL=bufferLog.js.map