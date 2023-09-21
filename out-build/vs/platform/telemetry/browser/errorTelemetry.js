/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/platform/telemetry/common/errorTelemetry"], function (require, exports, errors_1, lifecycle_1, platform_1, errorTelemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class $SBb extends errorTelemetry_1.default {
        i() {
            let oldOnError;
            const that = this;
            if (typeof platform_1.$g.onerror === 'function') {
                oldOnError = platform_1.$g.onerror;
            }
            platform_1.$g.onerror = function (message, filename, line, column, e) {
                that.n(message, filename, line, column, e);
                oldOnError?.apply(this, arguments);
            };
            this.h.add((0, lifecycle_1.$ic)(() => {
                if (oldOnError) {
                    platform_1.$g.onerror = oldOnError;
                }
            }));
        }
        n(msg, file, line, column, err) {
            const data = {
                callstack: msg,
                msg,
                file,
                line,
                column
            };
            if (err) {
                // If it's the no telemetry error it doesn't get logged
                if (errors_1.$_.isErrorNoTelemetry(err)) {
                    return;
                }
                const { name, message, stack } = err;
                data.uncaught_error_name = name;
                if (message) {
                    data.uncaught_error_msg = message;
                }
                if (stack) {
                    data.callstack = Array.isArray(err.stack)
                        ? err.stack = err.stack.join('\n')
                        : err.stack;
                }
            }
            this.k(data);
        }
    }
    exports.default = $SBb;
});
//# sourceMappingURL=errorTelemetry.js.map