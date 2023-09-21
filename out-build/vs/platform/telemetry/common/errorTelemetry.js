/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/platform/files/common/files"], function (require, exports, arrays_1, errors_1, lifecycle_1, objects_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ErrorEvent = void 0;
    var ErrorEvent;
    (function (ErrorEvent) {
        function compare(a, b) {
            if (a.callstack < b.callstack) {
                return -1;
            }
            else if (a.callstack > b.callstack) {
                return 1;
            }
            return 0;
        }
        ErrorEvent.compare = compare;
    })(ErrorEvent || (exports.ErrorEvent = ErrorEvent = {}));
    class $Rq {
        static { this.ERROR_FLUSH_TIMEOUT = 5 * 1000; }
        constructor(telemetryService, flushDelay = $Rq.ERROR_FLUSH_TIMEOUT) {
            this.f = -1;
            this.g = [];
            this.h = new lifecycle_1.$jc();
            this.c = telemetryService;
            this.d = flushDelay;
            // (1) check for unexpected but handled errors
            const unbind = errors_1.$V.addListener((err) => this.j(err));
            this.h.add((0, lifecycle_1.$ic)(unbind));
            // (2) install implementation-specific error listeners
            this.i();
        }
        dispose() {
            clearTimeout(this.f);
            this.l();
            this.h.dispose();
        }
        i() {
            // to override
        }
        j(err) {
            if (!err || err.code) {
                return;
            }
            // unwrap nested errors from loader
            if (err.detail && err.detail.stack) {
                err = err.detail;
            }
            // If it's the no telemetry error it doesn't get logged
            // TOOD @lramos15 hacking in FileOperation error because it's too messy to adopt ErrorNoTelemetry. A better solution should be found
            if (errors_1.$_.isErrorNoTelemetry(err) || err instanceof files_1.$nk || (typeof err?.message === 'string' && err.message.includes('Unable to read file'))) {
                return;
            }
            // work around behavior in workerServer.ts that breaks up Error.stack
            const callstack = Array.isArray(err.stack) ? err.stack.join('\n') : err.stack;
            const msg = err.message ? err.message : (0, objects_1.$1m)(err);
            // errors without a stack are not useful telemetry
            if (!callstack) {
                return;
            }
            this.k({ msg, callstack });
        }
        k(e) {
            const idx = (0, arrays_1.$ub)(this.g, e, ErrorEvent.compare);
            if (idx < 0) {
                e.count = 1;
                this.g.splice(~idx, 0, e);
            }
            else {
                if (!this.g[idx].count) {
                    this.g[idx].count = 0;
                }
                this.g[idx].count += 1;
            }
            if (this.f === -1) {
                this.f = setTimeout(() => {
                    this.l();
                    this.f = -1;
                }, this.d);
            }
        }
        l() {
            for (const error of this.g) {
                this.c.publicLogError2('UnhandledError', error);
            }
            this.g.length = 0;
        }
    }
    exports.default = $Rq;
});
//# sourceMappingURL=errorTelemetry.js.map