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
    class BaseErrorTelemetry {
        static { this.ERROR_FLUSH_TIMEOUT = 5 * 1000; }
        constructor(telemetryService, flushDelay = BaseErrorTelemetry.ERROR_FLUSH_TIMEOUT) {
            this._flushHandle = -1;
            this._buffer = [];
            this._disposables = new lifecycle_1.DisposableStore();
            this._telemetryService = telemetryService;
            this._flushDelay = flushDelay;
            // (1) check for unexpected but handled errors
            const unbind = errors_1.errorHandler.addListener((err) => this._onErrorEvent(err));
            this._disposables.add((0, lifecycle_1.toDisposable)(unbind));
            // (2) install implementation-specific error listeners
            this.installErrorListeners();
        }
        dispose() {
            clearTimeout(this._flushHandle);
            this._flushBuffer();
            this._disposables.dispose();
        }
        installErrorListeners() {
            // to override
        }
        _onErrorEvent(err) {
            if (!err || err.code) {
                return;
            }
            // unwrap nested errors from loader
            if (err.detail && err.detail.stack) {
                err = err.detail;
            }
            // If it's the no telemetry error it doesn't get logged
            // TOOD @lramos15 hacking in FileOperation error because it's too messy to adopt ErrorNoTelemetry. A better solution should be found
            if (errors_1.ErrorNoTelemetry.isErrorNoTelemetry(err) || err instanceof files_1.FileOperationError || (typeof err?.message === 'string' && err.message.includes('Unable to read file'))) {
                return;
            }
            // work around behavior in workerServer.ts that breaks up Error.stack
            const callstack = Array.isArray(err.stack) ? err.stack.join('\n') : err.stack;
            const msg = err.message ? err.message : (0, objects_1.safeStringify)(err);
            // errors without a stack are not useful telemetry
            if (!callstack) {
                return;
            }
            this._enqueue({ msg, callstack });
        }
        _enqueue(e) {
            const idx = (0, arrays_1.binarySearch)(this._buffer, e, ErrorEvent.compare);
            if (idx < 0) {
                e.count = 1;
                this._buffer.splice(~idx, 0, e);
            }
            else {
                if (!this._buffer[idx].count) {
                    this._buffer[idx].count = 0;
                }
                this._buffer[idx].count += 1;
            }
            if (this._flushHandle === -1) {
                this._flushHandle = setTimeout(() => {
                    this._flushBuffer();
                    this._flushHandle = -1;
                }, this._flushDelay);
            }
        }
        _flushBuffer() {
            for (const error of this._buffer) {
                this._telemetryService.publicLogError2('UnhandledError', error);
            }
            this._buffer.length = 0;
        }
    }
    exports.default = BaseErrorTelemetry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JUZWxlbWV0cnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZWxlbWV0cnkvY29tbW9uL2Vycm9yVGVsZW1ldHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWdDaEcsSUFBaUIsVUFBVSxDQVMxQjtJQVRELFdBQWlCLFVBQVU7UUFDMUIsU0FBZ0IsT0FBTyxDQUFDLENBQWEsRUFBRSxDQUFhO1lBQ25ELElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFO2dCQUM5QixPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ1Y7aUJBQU0sSUFBSSxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUU7Z0JBQ3JDLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7WUFDRCxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7UUFQZSxrQkFBTyxVQU90QixDQUFBO0lBQ0YsQ0FBQyxFQVRnQixVQUFVLDBCQUFWLFVBQVUsUUFTMUI7SUFFRCxNQUE4QixrQkFBa0I7aUJBRWpDLHdCQUFtQixHQUFXLENBQUMsR0FBRyxJQUFJLEFBQW5CLENBQW9CO1FBUXJELFlBQVksZ0JBQW1DLEVBQUUsVUFBVSxHQUFHLGtCQUFrQixDQUFDLG1CQUFtQjtZQUo1RixpQkFBWSxHQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLFlBQU8sR0FBaUIsRUFBRSxDQUFDO1lBQ2hCLGlCQUFZLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFHdkQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO1lBQzFDLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1lBRTlCLDhDQUE4QztZQUM5QyxNQUFNLE1BQU0sR0FBRyxxQkFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEs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